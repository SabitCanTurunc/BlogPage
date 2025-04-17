import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WriterAiService {
  private apiUrl = 'http://localhost:8080/writer-ai';

  constructor(private http: HttpClient) { }

  generateContent(title: string, categoryId: string, content: string): Observable<HttpEvent<any>> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream'
    });

    // Kategori değerlerini güvenli hale getir
    const sanitizedTitle = this.sanitizeInput(title);
    const sanitizedContent = this.sanitizeInput(content);
    let sanitizedCategory = '';
    
    // categoryId değerini güvenli şekilde işle - sadece numerik ise doğrudan kullan
    if (categoryId && /^\d+$/.test(categoryId)) {
      sanitizedCategory = categoryId;
    }

    // İçerik kontrolü yap - en az bir alan dolu olmalı
    if (!sanitizedTitle && !sanitizedCategory && !sanitizedContent) {
      return throwError(() => new Error('En az bir alan doldurulmalıdır.'));
    }

    // JSON olarak gönderilecek verileri oluştur
    const requestData = {
      title: sanitizedTitle,
      category: sanitizedCategory,
      content: sanitizedContent
    };

    return this.http.post(`${this.apiUrl}/gemini`, requestData, {
        headers: headers,
        responseType: 'text',
        observe: 'events',
        reportProgress: true
      }
    ).pipe(
      catchError(error => {
        console.error('WriteAI API hatası:', error);
        return throwError(() => new Error('İçerik oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.'));
      })
    );
  }

  // Girişleri güvenli hale getir - özel karakterleri temizle
  private sanitizeInput(input: string): string {
    if (!input) return '';
    
    // Trim yapılır ve kontrol karakterleri temizlenir
    return input.trim()
      // Kontrol karakterlerini kaldır
      .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
      // JSON için sorun oluşturacak olan ters eğik çizgileri escape et
      .replace(/\\/g, '\\\\')
      // Tırnak işaretlerini escape et
      .replace(/"/g, '\\"');
  }
} 