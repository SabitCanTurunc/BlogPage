import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ErrorHandlerUtil } from '../utils/error-handler.util';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private apiUrl = `${environment.apiUrl}/image`;

  constructor(private http: HttpClient) { }

  private handleError = (error: HttpErrorResponse) => {
    const errorMessage = ErrorHandlerUtil.handleError(error, 'Resim yüklenirken bir hata oluştu');
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