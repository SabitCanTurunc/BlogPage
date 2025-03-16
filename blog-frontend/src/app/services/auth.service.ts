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

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      return throwError(() => new Error('Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin veya daha sonra tekrar deneyin.'));
    }
    
    const errorMessage = error.error?.message || 'Bir hata oluştu.';
    return throwError(() => new Error(errorMessage));
  }

  private loadStoredUser() {
    if (isPlatformBrowser(this.platformId)) {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        this.currentUserSubject.next(JSON.parse(storedUser));
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
        catchError(this.handleError)
      );
  }

  verifyEmail(data: { email: string; verificationCode: string }) {
    return this.http.post<{message: string, success: boolean}>(`${environment.apiUrl}/auth/verify`, data)
      .pipe(
        catchError(this.handleError)
      );
  }

  resendVerificationCode(email: string): Observable<{message: string, success: boolean}> {
    return this.http.post<{message: string, success: boolean}>(`${environment.apiUrl}/auth/resend`, { email })
      .pipe(
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
    return !!this.currentUserSubject.value;
  }

  getToken(): string | null {
    const user = this.currentUserSubject.value;
    if (!user || !user.token) {
      return null;
    }
    return user.token;
  }

  getCurrentUser(): LoginResponse | null {
    return this.currentUserSubject.value;
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
    if (!user || !user.token) {
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