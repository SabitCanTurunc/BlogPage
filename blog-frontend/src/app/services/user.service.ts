import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ErrorHandlerUtil } from '../utils/error-handler.util';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  private handleError = (error: HttpErrorResponse) => {
    console.error('Kullanıcı servisi hatası:', error);
    
    // Backend'den gelen özel hata mesajını yakala ve doğrudan ilet
    if (error.error?.customException?.message) {
      const errorMsg = error.error.customException.message;
      console.log('Backend customException hata mesajı:', errorMsg);
      return throwError(() => new Error(errorMsg));
    }
    
    if (error.error?.message) {
      const errorMsg = error.error.message;
      console.log('Backend hata mesajı:', errorMsg);
      return throwError(() => new Error(errorMsg));
    }
    
    // Hata mesajının detaylı ve spesifik olması için ErrorHandlerUtil kullan
    const errorMessage = ErrorHandlerUtil.handleError(error, 'Kullanıcı işlemi sırasında bir hata oluştu');
    return throwError(() => new Error(errorMessage));
  }

  // Kullanıcı bilgilerini getir
  getUserProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/profile`).pipe(
      catchError(this.handleError)
    );
  }

  // Kullanıcı bilgilerini güncelle
  updateUserProfile(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/user/update-profile`, userData).pipe(
      catchError(this.handleError)
    );
  }

  // Kullanıcı şifresini güncelle
  updatePassword(passwordData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/user/update-password`, passwordData).pipe(
      catchError(this.handleError)
    );
  }

  // Kullanıcı hesabını sil
  deleteAccount(credentials: { email: string, password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/user/delete-account`, credentials).pipe(
      catchError(this.handleError)
    );
  }

  // Kullanıcının yazılarını getir
  getUserPosts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/posts`).pipe(
      catchError(this.handleError)
    );
  }
} 