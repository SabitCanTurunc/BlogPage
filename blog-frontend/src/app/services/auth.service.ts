import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, catchError } from 'rxjs';
import { environment } from '../../environments/environment';
import { isPlatformBrowser } from '@angular/common';

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

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private tokenKey = 'auth_token';
  private platformId = inject(PLATFORM_ID);

  constructor(private http: HttpClient) { }

  signup(userData: UserRequestDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/signup`, userData);
  }

  login(credentials: { email: string; password: string }): Observable<LoginResponseDto> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    console.log('Login isteği gönderiliyor:', {
      url: `${this.apiUrl}/auth/login`,
      credentials: credentials,
      headers: headers
    });

    return this.http.post<LoginResponseDto>(`${this.apiUrl}/auth/login`, credentials, { 
      headers
    }).pipe(
      tap(response => {
        console.log('Login yanıtı:', response);
        if (response.status === 200 && response.token) {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem(this.tokenKey, response.token);
          }
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Login hatası:', {
          status: error.status,
          statusText: error.statusText,
          error: error.error,
          message: error.message,
          headers: error.headers
        });
        throw error;
      })
    );
  }

  verifyEmail(data: { email: string; verificationCode: string }) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    console.log('Doğrulama isteği gönderiliyor:', {
      url: `${this.apiUrl}/auth/verify`,
      data: data,
      headers: headers
    });

    return this.http.post<{message: string, success: boolean}>(`${this.apiUrl}/verify`, data, { 
      headers
    }).pipe(
      tap(response => {
        console.log('E-posta doğrulama yanıtı:', response);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('E-posta doğrulama hatası:', error);
        throw error;
      })
    );
  }

  resendVerificationCode(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/resend`, email);
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.tokenKey);
    }
  }

  isLoggedIn(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return !!localStorage.getItem(this.tokenKey);
    }
    return false;
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  setToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  removeToken(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.tokenKey);
    }
  }
} 