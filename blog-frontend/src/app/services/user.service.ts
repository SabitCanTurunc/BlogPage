import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/user`;

  constructor(private http: HttpClient) { }

  updatePassword(email: string, currentPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/update-password`, {
      email,
      currentPassword,
      newPassword
    });
  }

  updateProfile(email: string, username: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/update-profile`, {
      email,
      username
    });
  }
  
  deleteAccount(email: string, password: string): Observable<any> {
    console.log('Hesap silme isteği gönderiliyor:', { email, passwordLength: password?.length });
    return this.http.post(`${this.apiUrl}/delete-account`, {
      email,
      password
    });
  }
} 