import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private apiUrl = `${environment.apiUrl}/image`;

  constructor(private http: HttpClient) { }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      return throwError(() => new Error('Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin veya daha sonra tekrar deneyin.'));
    }
    
    const errorMessage = error.error?.message || 'Resim yüklenirken bir hata oluştu.';
    return throwError(() => new Error(errorMessage));
  }

  uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/upload`, formData)
      .pipe(
        catchError(this.handleError)
      );
  }

  uploadMultipleImages(files: File[]): Observable<any> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    return this.http.post(`${this.apiUrl}/upload-multiple`, formData)
      .pipe(
        catchError(this.handleError)
      );
  }

  deleteImage(imageUrl: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete?url=${encodeURIComponent(imageUrl)}`)
      .pipe(
        catchError(this.handleError)
      );
  }
} 