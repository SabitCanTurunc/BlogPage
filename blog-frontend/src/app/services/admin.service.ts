import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { UserResponseDto } from '../models/user-response.dto';
import { UserRequestDto } from '../models/user-request.dto';
import { ErrorHandlerUtil } from '../utils/error-handler.util';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/user`;

  constructor(private http: HttpClient) { }

  private handleError = (error: HttpErrorResponse) => {
    const errorMessage = ErrorHandlerUtil.handleError(error, 'Yönetici işlemi sırasında bir hata oluştu');
    return throwError(() => new Error(errorMessage));
  }

  getAllUsers(): Observable<UserResponseDto[]> {
    return this.http.get<UserResponseDto[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  updateUserRole(userId: number, userRequestDto: UserRequestDto): Observable<UserResponseDto> {
    return this.http.post<UserResponseDto>(`${this.apiUrl}/setRole/${userId}`, userRequestDto).pipe(
      catchError(this.handleError)
    );
  }

  updateUserEnabled(userId: number, enabled: boolean): Observable<UserResponseDto> {
    return this.http.post<UserResponseDto>(`${this.apiUrl}/setEnabled/${userId}`, { enabled }).pipe(
      catchError(this.handleError)
    );
  }

  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}`).pipe(
      catchError(this.handleError)
    );
  }
} 