import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { CategoryResponseDto } from '../models/category-response.dto';
import { CategoryRequestDto } from '../models/category-request.dto';
import { ErrorHandlerUtil } from '../utils/error-handler.util';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = `${environment.apiUrl}/category`;

  constructor(private http: HttpClient) { }

  private handleError = (error: HttpErrorResponse) => {
    const errorMessage = ErrorHandlerUtil.handleError(error, 'Kategori işlemi sırasında bir hata oluştu');
    return throwError(() => new Error(errorMessage));
  }

  getAllCategories(): Observable<CategoryResponseDto[]> {
    return this.http.get<CategoryResponseDto[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  createCategory(categoryRequestDto: CategoryRequestDto): Observable<CategoryResponseDto> {
    return this.http.post<CategoryResponseDto>(this.apiUrl, categoryRequestDto).pipe(
      catchError(this.handleError)
    );
  }

  updateCategory(id: number, categoryRequestDto: CategoryRequestDto): Observable<CategoryResponseDto> {
    return this.http.put<CategoryResponseDto>(`${this.apiUrl}/${id}`, categoryRequestDto).pipe(
      catchError(this.handleError)
    );
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }
} 