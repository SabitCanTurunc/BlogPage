import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ErrorHandlerUtil } from '../utils/error-handler.util';
import { User } from '../models/user.model';
import { UserResponseDto } from '../models/user-response.dto';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/user`;

  constructor(private http: HttpClient) { }

  private handleError = (error: HttpErrorResponse) => {
    if (error.error?.customException?.message) {
      const errorMsg = error.error.customException.message;
      return throwError(() => new Error(errorMsg));
    }
    
    if (error.error?.message) {
      const errorMsg = error.error.message;
      return throwError(() => new Error(errorMsg));
    }
    
    const errorMessage = ErrorHandlerUtil.handleError(error, 'Kullanıcı işlemi sırasında bir hata oluştu');
    return throwError(() => new Error(errorMessage));
  }

  // Kullanıcı bilgilerini getir
  getUserProfile(): Observable<UserResponseDto> {
    return this.http.get<UserResponseDto>(`${this.apiUrl}/profile`).pipe(
      catchError(this.handleError)
    );
  }

  // Kullanıcı bilgilerini güncelle
  updateUserProfile(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/update-profile`, userData).pipe(
      catchError(this.handleError)
    );
  }

  // Kullanıcı şifresini güncelle
  updatePassword(passwordData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/update-password`, passwordData).pipe(
      catchError(this.handleError)
    );
  }

  // Kullanıcı hesabını sil
  deleteAccount(credentials: { email: string, password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/delete-account`, credentials).pipe(
      catchError(this.handleError)
    );
  }

  // Kullanıcının yazılarını getir
  getUserPosts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/posts`).pipe(
      catchError(this.handleError)
    );
  }

  uploadProfileImage(file: File): Observable<User> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post<User>(`${this.apiUrl}/upload-profile-image`, formData)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Başka bir kullanıcının profilini getir
  getUserProfileByEmail(email: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile/${email}`).pipe(
      catchError(this.handleError)
    );
  }
} 