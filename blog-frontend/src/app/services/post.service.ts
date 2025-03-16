import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { PostResponseDto } from '../models/post-response.dto';
import { AuthService } from './auth.service';

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

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      return throwError(() => new Error('Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin veya daha sonra tekrar deneyin.'));
    }
    
    if (error.status === 401) {
      return throwError(() => new Error('Oturum süresi dolmuş olabilir. Lütfen tekrar giriş yapın.'));
    }
    
    const errorMessage = error.error?.message || 'Bilinmeyen bir hata oluştu.';
    return throwError(() => new Error(errorMessage));
  }

  getAllPosts(): Observable<PostResponseDto[]> {
    return this.http.get<PostResponseDto[]>(this.apiUrl)
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
} 