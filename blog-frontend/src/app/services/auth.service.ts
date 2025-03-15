import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
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
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<LoginResponse | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        this.currentUserSubject.next(JSON.parse(storedUser));
      }
    }
  }

  signup(userData: UserRequestDto): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/signup`, userData);
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
        })
      );
  }

  verifyEmail(data: { email: string; verificationCode: string }) {
    return this.http.post<{message: string, success: boolean}>(`${environment.apiUrl}/auth/verify`, data);
  }

  resendVerificationCode(email: string): Observable<{message: string, success: boolean}> {
    return this.http.post<{message: string, success: boolean}>(`${environment.apiUrl}/auth/resend`, { email });
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

  getUserEmail(): string {
    const user = this.currentUserSubject.value;
    console.log('Current User in getUserEmail:', user);
    
    if (!user || !user.token) {
      console.log('No user or token found');
      return '';
    }
    
    try {
      const decodedToken = this.parseJwt(user.token);
      console.log('Decoded Token:', decodedToken);
      return decodedToken?.sub || '';
    } catch (e) {
      console.error('Error parsing token:', e);
      return '';
    }
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    if (!user || !user.token) {
      return false;
    }
    
    try {
      const decodedToken = this.parseJwt(user.token);
      return decodedToken?.role === 'ADMIN';
    } catch (e) {
      console.error('Error parsing token:', e);
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
      console.error('Error parsing token:', e);
      return null;
    }
  }
} 