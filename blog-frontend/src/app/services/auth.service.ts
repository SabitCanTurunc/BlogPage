import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, catchError } from 'rxjs';
import { environment } from '../../environments/environment';

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
  private apiUrl = `${environment.apiUrl}/auth`;
  private tokenKey = 'auth_token';

  constructor(private http: HttpClient) { }

  signup(userData: UserRequestDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, userData);
  }

  login(credentials: { email: string; password: string }): Observable<LoginResponseDto> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    console.log('Login isteği gönderiliyor:', {
      url: `${this.apiUrl}/login`,
      credentials: credentials,
      headers: headers
    });

    return this.http.post<LoginResponseDto>(`${this.apiUrl}/login`, credentials, { 
      headers
    }).pipe(
      tap(response => {
        console.log('Login yanıtı:', response);
        if (response.status === 200 && response.token) {
          localStorage.setItem(this.tokenKey, response.token);
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
      url: `${this.apiUrl}/verify`,
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
    localStorage.removeItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
} 