import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Kullanıcı bilgilerini getir
  getUserProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/profile`);
  }

  // Kullanıcı bilgilerini güncelle
  updateUserProfile(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/user/update-profile`, userData);
  }

  // Kullanıcı şifresini güncelle
  updatePassword(passwordData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/user/update-password`, passwordData);
  }

  // Kullanıcı hesabını sil
  deleteAccount(credentials: { email: string, password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/user/delete-account`, credentials);
  }

  // Kullanıcının yazılarını getir
  getUserPosts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/posts`);
  }
} 