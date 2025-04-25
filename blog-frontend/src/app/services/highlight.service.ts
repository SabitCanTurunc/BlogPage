import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { catchError, mergeMap } from 'rxjs/operators';
import { ErrorHandlerUtil } from '../utils/error-handler.util';

@Injectable({
  providedIn: 'root'
})
export class HighlightService {
  private apiUrl = `${environment.apiUrl}/highlights`;

  constructor(private http: HttpClient) { }

  /**
   * Kullanıcının abonelik planına göre günlük highlight limitini döndürür
   * @param subscriptionPlan Kullanıcının abonelik planı (ESSENTIAL, PLUS, MAX)
   * @returns {number} Highlight limiti (MAX için -1, yani sınırsız)
   */
  getDailyHighlightLimit(subscriptionPlan: string): number {
    switch (subscriptionPlan) {
      case 'ESSENTIAL':
        return 1;
      case 'PLUS':
        return 2;
      case 'MAX':
        return -1; // Sınırsız için -1 kullanıyoruz
      default:
        return 1; // Varsayılan olarak ESSENTIAL limiti
    }
  }

  /**
   * Kullanıcının abonelik planına göre limit bilgisini içeren metin döndürür
   * @param subscriptionPlan Kullanıcının abonelik planı (ESSENTIAL, PLUS, MAX)
   * @returns {string} Limit bilgi metni
   */
  getHighlightLimitInfo(subscriptionPlan: string): string {
    switch (subscriptionPlan) {
      case 'ESSENTIAL':
        return 'Essential: günlük limit 1 post';
      case 'PLUS':
        return 'Plus: günlük limit 2 post';
      case 'MAX':
        return 'Max: sınırsız';
      default:
        return 'Essential: günlük limit 1 post';
    }
  }

  /**
   * Bir postu öne çıkar
   * @param postId Öne çıkarılacak postun ID'si
   * @returns Observable<any>
   */
  highlightPost(postId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/with-user`, { postId })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Tüm öne çıkan postları getir
   * @returns Observable<any>
   */
  getHighlights(): Observable<any> {
    // İçerikleri public API'dan al - JWT token gerektirmez
    return this.http.get(`${this.apiUrl}/public`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Kullanıcının öne çıkardığı postları getir 
   * @returns Observable<any>
   */
  getUserHighlights(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Kullanıcının bugün öne çıkardığı postları getir
   * @returns Observable<any>
   */
  getDailyHighlights(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/daily`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Bir highlight'ı görüntülenmiş olarak işaretle
   * @param highlightId Highlight ID
   * @returns Observable<any>
   */
  markAsSeen(highlightId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${highlightId}/seen`, {})
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Highlight'ı sil
   * @param highlightId Highlight ID
   * @returns Observable<any>
   */
  deleteHighlight(highlightId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/custom-delete/${highlightId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Post detaylarını toplu olarak getir
   * @param postIds Post ID'lerinin dizisi
   * @returns Observable<any>
   */
  getPostsDetails(postIds: number[]): Observable<any> {
    // Bu metod artık kullanılmıyor
    return this.http.post(`${environment.apiUrl}/posts/details`, { postIds })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Belirli bir postun öne çıkarmasını kaldırır
   * @param postId Post ID
   * @returns Observable<any>
   */
  removePostHighlight(postId: number): Observable<any> {
    // Önce kullanıcının tüm highlight'larını alıp, postId ile eşleşeni bul
    return this.getUserHighlights().pipe(
      mergeMap((highlights: any[]) => {
        if (!highlights || highlights.length === 0) {
          console.warn('Kullanıcının öne çıkarılmış içeriği bulunamadı');
          return throwError(() => new Error('Öne çıkarılmış içerik bulunamadı. Önce sayfayı yenileyip tekrar deneyiniz.'));
        }
        
        const highlight = highlights.find(h => h.postId === postId);
        
        if (highlight) {
          console.log(`Highlight bulundu, ID: ${highlight.id}, siliniyor...`);
          // Eşleşen highlight'ı sil
          return this.deleteHighlight(highlight.id);
        } else {
          console.warn(`PostID: ${postId} için öne çıkarılmış içerik bulunamadı`);
          return throwError(() => new Error('Öne çıkarılan içerik bulunamadı. Sayfayı yenileyip tekrar deneyiniz.'));
        }
      }),
      catchError((error) => {
        console.error('Highlight kaldırma hatası:', error);
        
        if (error.status === 404) {
          return throwError(() => new Error('Öne çıkarılan içerik bulunamadı veya zaten kaldırılmış. Lütfen sayfayı yenileyiniz.'));
        }
        
        if (error.status === 403) {
          return throwError(() => new Error('Bu öne çıkarma işlemini kaldırmak için yetkiniz yok.'));
        }
        
        if (error.message === 'Post highlight not found') {
          return throwError(() => new Error('Öne çıkarılan içerik bulunamadı. Sayfayı yenileyip tekrar deneyiniz.'));
        }
        
        return this.handleError(error);
      })
    );
  }

  /**
   * HTTP hatalarını yönetir
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = ErrorHandlerUtil.handleError(error);
    // Highlight ile ilgili özel hata kodları veya mesajları
    if (error.error && error.error.customException && error.error.customException.message) {
      if (error.error.customException.message.includes("highlight")) {
        // Highlight işlemi ile ilgili bir hata 
        console.log('Özel highlight hatası:', error.error.customException.message);
      }
    }
    return throwError(() => new Error(errorMessage));
  }
} 