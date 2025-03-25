import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { ErrorHandlerUtil } from '../utils/error-handler.util';

export interface UserRequestDto {
  username: string;
  email: string;
  password: string;
}

export interface LoginResponseDto {
  status: number;
  customException?: {
    hostname: string;
    path: string;
    createTime: string;
    message: string;
  };
  token?: string;
  expiresIn?: number;
}

export interface VerifyUserDto {
  email: string;
  verificationCode: string;
}

export interface LoginResponse {
  status: number;
  customException?: {
    hostname: string;
    path: string;
    createTime: string;
    message: string;
  };
  token?: string;
  expiresIn?: number;
  email?: string;
  role?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<LoginResponse | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loadStoredUser();
  }

  private handleError = (error: HttpErrorResponse) => {
    const errorMessage = ErrorHandlerUtil.handleError(error);
    return throwError(() => new Error(errorMessage));
  }

  private loadStoredUser() {
    if (isPlatformBrowser(this.platformId)) {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          if (user.token && !this.isTokenExpired(user.token)) {
            this.currentUserSubject.next(user);
          } else {
            this.logout();
          }
        } catch (e) {
          this.logout();
        }
      }
    }
  }

  signup(userData: UserRequestDto): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/signup`, userData)
      .pipe(
        catchError(this.handleError)
      );
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap(response => {
          if (response && response.token) {
            if (isPlatformBrowser(this.platformId)) {
              localStorage.setItem('currentUser', JSON.stringify(response));
            }
            this.currentUserSubject.next(response);
          }
        }),
        catchError(error => {
          if (error.error?.message === 'UNVERIFIED_USER' || 
              error.error?.message?.includes('not verified') ||
              error.error?.message?.includes('doğrulanmamış') ||
              (error.error?.customException?.message && 
               (error.error.customException.message.includes('UNVERIFIED_USER') || 
                error.error.customException.message.includes('not verified') ||
                error.error.customException.message.includes('doğrulanmamış')))) {
            console.log('Doğrulanmamış kullanıcı tespit edildi. Yönlendirme LoginComponent tarafından yapılacak.');
          }
          
          return this.handleError(error);
        })
      );
  }

  verifyEmail(data: { email: string; verificationCode: string }) {
    return this.http.post<{message: string, success: boolean}>(`${environment.apiUrl}/auth/verify`, data)
      .pipe(
        tap(response => {
          if (!response.hasOwnProperty('success')) {
            (response as any).success = true;
          }
        }),
        catchError(error => {
          if (error.error && error.error.message && error.error.message.includes('Yanlış doğrulama kodu')) {
            return throwError(() => ({
              status: error.status,
              error: {
                message: 'Yanlış doğrulama kodu. Lütfen tekrar deneyin.'
              }
            }));
          }
          return this.handleError(error);
        })
      );
  }

  resendVerificationCode(email: string): Observable<{message: string, success: boolean}> {
    return this.http.post<{message: string, success: boolean}>(`${environment.apiUrl}/auth/resend`, { email })
      .pipe(
        catchError(this.handleError)
      );
  }

  forgotPassword(email: string): Observable<{message: string, success: boolean}> {
    return this.http.post<{message: string, success: boolean}>(`${environment.apiUrl}/auth/forgot-password`, { email })
      .pipe(
        catchError(this.handleError)
      );
  }

  resetPassword(email: string, verificatonCode: string, newPassword: string): Observable<{message: string, success: boolean}> {
    console.log(`Şifre sıfırlama isteği:`, {
      email,
      verificatonCodeLength: verificatonCode?.length,
      newPasswordLength: newPassword?.length
    });

    // Giriş kontrolü
    if (!email || !verificatonCode || !newPassword) {
      console.error('Şifre sıfırlama için gerekli alanlar eksik:', { 
        emailVarMi: !!email, 
        verificatonCodeVarMi: !!verificatonCode, 
        newPasswordVarMi: !!newPassword 
      });
      return throwError(() => new Error('Gerekli bilgiler eksik. E-posta, doğrulama kodu ve yeni şifre gereklidir.'));
    }

    // Doğrulama kodu 6 basamaklı sayı olmalıdır
    if (!/^\d{6}$/.test(verificatonCode)) {
      console.error('Geçersiz doğrulama kodu formatı:', verificatonCode);
      return throwError(() => new Error('Doğrulama kodu 6 basamaklı bir sayı olmalıdır.'));
    }

    // Backend'e gönderilecek veriler - backend ile uyumlu olmalı
    const resetData = {
      email,
      verificatonCode, // ÖNEMLİ: Backend ile uyumlu olması için 'verificatonCode' olarak gönderilmeli (typo var)
      newPassword
    };

    console.log('Şifre sıfırlama isteği gönderiliyor:', resetData);

    return this.http.post<{message: string, success: boolean}>(`${environment.apiUrl}/auth/reset-password`, resetData).pipe(
      tap(response => {
        console.log('Şifre sıfırlama yanıtı:', response);
      }),
      catchError(error => {
        console.error('Şifre sıfırlama hatası:', error);
        console.error('Hata detayları:', error.error);
        
        // Frontend log için spesifik hata mesajı kontrolleri
        if (error.error?.customException?.message) {
          console.error('Backend özel hatası:', error.error.customException.message);
        }
        if (error.error?.message) {
          console.error('Genel hata mesajı:', error.error.message);
        }
        
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('currentUser');
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/']);
  }

  isLoggedIn(): boolean {
    const user = this.currentUserSubject.value;
    return !!user && !!user.token && !this.isTokenExpired(user.token);
  }

  getToken(): string | null {
    const user = this.currentUserSubject.value;
    if (!user || !user.token || this.isTokenExpired(user.token)) {
      return null;
    }
    return user.token;
  }

  getCurrentUser(): LoginResponse | null {
    const user = this.currentUserSubject.value;
    if (!user || !user.token || this.isTokenExpired(user.token)) {
      return null;
    }
    return user;
  }

  private parseJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const decodedToken = this.parseJwt(token);
      if (!decodedToken || !decodedToken.exp) {
        return true;
      }
      const expirationDate = new Date(0);
      expirationDate.setUTCSeconds(decodedToken.exp);
      return expirationDate < new Date();
    } catch (e) {
      return true;
    }
  }

  getUserEmail(): string | null {
    const user = this.getCurrentUser();
    if (!user || !user.token) {
      return null;
    }
    
    try {
      const decodedToken = this.parseJwt(user.token);
      return decodedToken?.sub || null;
    } catch (e) {
      return null;
    }
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    if (!user || !user.token) {
      return false;
    }
    
    try {
      const decodedToken = this.parseJwt(user.token);
      return decodedToken?.role === 'ADMIN' || decodedToken?.role === 'ROLE_ADMIN';
    } catch (e) {
      console.error('Token parse hatası:', e);
      return false;
    }
  }

  getUserId(): number | null {
    const user = this.currentUserSubject.value;
    if (!user || !user.token || this.isTokenExpired(user.token)) {
      return null;
    }
    
    try {
      const decodedToken = this.parseJwt(user.token);
      return decodedToken?.userId || null;
    } catch (e) {
      return null;
    }
  }
} 