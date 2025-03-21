import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

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
    if (error.error?.customException?.message) {
      const errorMessage = error.error.customException.message;
      const translatedMessage = this.translateErrorMessage(errorMessage);
      return throwError(() => new Error(translatedMessage || errorMessage));
    } else if (error.status === 0) {
      return throwError(() => new Error('Sunucuya bağlanılamıyor'));
    } else if (error.error?.message) {
      const errorMessage = error.error.message;
      const translatedMessage = this.translateErrorMessage(errorMessage);
      return throwError(() => new Error(translatedMessage || errorMessage));
    } else {
      return throwError(() => new Error('Bir hata oluştu'));
    }
  }

  private translateErrorMessage(message: string): string | null {
    if (message.includes('Email address is already registered')) {
      return 'Bu e-posta adresi zaten kayıtlı.';
    } else if (message.includes('Username is already taken')) {
      return 'Bu kullanıcı adı zaten alınmış.';
    } else if (message.includes('Registration failed')) {
      return 'Kayıt işlemi başarısız oldu. Lütfen tekrar deneyin.';
    } else if (message.includes('Invalid verification code')) {
      return 'Geçersiz doğrulama kodu.';
    } else if (message.includes('Verification code expired')) {
      return 'Doğrulama kodu süresi dolmuş. Lütfen yeni kod isteyin.';
    } else if (message.includes('Email not found')) {
      return 'E-posta adresi bulunamadı.';
    } else if (message.includes('Invalid credentials')) {
      return 'Geçersiz e-posta veya şifre.';
    } else if (message.includes('Invalid email or password')) {
      return 'Geçersiz e-posta veya şifre.';
    } else if (message.includes('Account not verified')) {
      return 'Hesabınız henüz doğrulanmamış. Lütfen e-postanızı kontrol edin.';
    } else if (message.includes('UNVERIFIED_USER')) {
      return 'Hesabınız henüz doğrulanmamış. Lütfen e-postanıza gönderilen doğrulama kodunu kullanın.';
    } else if (message.includes('User not found')) {
      return 'Kullanıcı bulunamadı.';
    } else if (message.includes('Invalid password')) {
      return 'Geçersiz şifre.';
    }
    return null;
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
              (error.error?.customException?.message && error.error.customException.message.includes('UNVERIFIED_USER'))) {
            console.log('Doğrulanmamış kullanıcı tespit edildi. Yönlendirme LoginComponent tarafından yapılacak.');
          }
          
          return this.handleError(error);
        })
      );
  }

  verifyEmail(data: { email: string; verificationCode: string }) {
    console.log('API isteği gönderiliyor:', `${environment.apiUrl}/auth/verify`, data);
    return this.http.post<{message: string, success: boolean}>(`${environment.apiUrl}/auth/verify`, data)
      .pipe(
        tap(response => console.log('API yanıtı alındı:', response)),
        catchError(error => {
          console.error('API hatası:', error);
          if (error.error && error.error.message && error.error.message.includes('Yanlış doğrulama kodu')) {
            console.log('Doğrulama kodu hatası algılandı');
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

  resetPassword(email: string, verificationCode: string, newPassword: string): Observable<{message: string, success: boolean}> {
    return this.http.post<{message: string, success: boolean}>(`${environment.apiUrl}/auth/reset-password`, {
      email,
      verificationCode,
      newPassword
    }).pipe(
      catchError(this.handleError)
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
      return decodedToken?.role === 'ADMIN';
    } catch (e) {
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