import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { PostResponseDto } from '../models/post-response.dto';
import { AuthService } from './auth.service';
import { ErrorHandlerUtil } from '../utils/error-handler.util';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = `${environment.apiUrl}/post`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  private handleError = (error: HttpErrorResponse) => {
    const errorMessage = ErrorHandlerUtil.handleError(error, 'Blog yazıları yüklenirken bir hata oluştu');
    return throwError(() => new Error(errorMessage));
  }

  getAllPosts(): Observable<PostResponseDto[]> {
    return this.http.get<PostResponseDto[]>(this.apiUrl)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }
  
  // Sayfalama ile post getirme metodu
  getPagedPosts(page: number = 0, size: number = 10, category?: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
      
    if (category) {
      params = params.set('category', category);
    }
    
    return this.http.get<any>(`${this.apiUrl}/paged`, { params })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getPostById(id: number): Observable<PostResponseDto> {
    return this.http.get<PostResponseDto>(`${this.apiUrl}/${id}`)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  createPost(postData: any): Observable<PostResponseDto> {
    const headers = this.getHeaders();
    return this.http.post<PostResponseDto>(`${this.apiUrl}`, postData, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  updatePost(id: number, postData: any): Observable<PostResponseDto> {
    const headers = this.getHeaders();
    return this.http.put<PostResponseDto>(`${this.apiUrl}/${id}`, postData, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  deletePost(id: number): Observable<void> {
    const headers = this.getHeaders();
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  createPostWithImages(postData: any, files: File[]): Observable<PostResponseDto> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    
    const formData = new FormData();
    formData.append('post', new Blob([JSON.stringify(postData)], { type: 'application/json' }));
    
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }
    
    return this.http.post<PostResponseDto>(`${this.apiUrl}/with-images`, formData, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Tüm kategorileri getir
  getCategories(): Observable<string[]> {
    // Backend'deki özel endpoint'i kullan
    return this.http.get<string[]>(`${this.apiUrl}/categories`)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }
  
  // Popüler yazarları getir
  getPopularAuthors(): Observable<string[]> {
    // Backend'deki özel endpoint'i kullan
    return this.http.get<string[]>(`${this.apiUrl}/popular-authors`)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }
  
  // Son yazıları getir
  getRecentPosts(): Observable<PostResponseDto[]> {
    // Backend'deki özel endpoint'i kullan
    return this.http.get<PostResponseDto[]>(`${this.apiUrl}/recent`)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }
  
  // Arama yap
  searchPosts(query: string): Observable<PostResponseDto[]> {
    // Backend'deki özel endpoint'i kullan
    const params = new HttpParams().set('query', query);
    return this.http.get<PostResponseDto[]>(`${this.apiUrl}/search`, { params })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  // Kullanıcının yazılarını getir
  getUserPosts(userId: number): Observable<PostResponseDto[]> {
    return this.http.get<PostResponseDto[]>(`${this.apiUrl}/user/${userId}`)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }
} 