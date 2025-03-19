import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserResponseDto } from '../models/user-response.dto';
import { UserRequestDto } from '../models/user-request.dto';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/user`;

  constructor(private http: HttpClient) { }

  getAllUsers(): Observable<UserResponseDto[]> {
    return this.http.get<UserResponseDto[]>(this.apiUrl);
  }

  updateUserRole(userId: number, userRequestDto: UserRequestDto): Observable<UserResponseDto> {
    return this.http.post<UserResponseDto>(`${this.apiUrl}/setRole/${userId}`, userRequestDto);
  }

  updateUserEnabled(userId: number, enabled: boolean): Observable<UserResponseDto> {
    return this.http.post<UserResponseDto>(`${this.apiUrl}/setEnabled/${userId}`, { enabled });
  }

  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}`);
  }
} 