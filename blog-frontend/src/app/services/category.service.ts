import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CategoryResponseDto } from '../models/category-response.dto';
import { CategoryRequestDto } from '../models/category-request.dto';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = `${environment.apiUrl}/category`;

  constructor(private http: HttpClient) { }

  getAllCategories(): Observable<CategoryResponseDto[]> {
    return this.http.get<CategoryResponseDto[]>(this.apiUrl);
  }

  createCategory(categoryRequestDto: CategoryRequestDto): Observable<CategoryResponseDto> {
    return this.http.post<CategoryResponseDto>(this.apiUrl, categoryRequestDto);
  }

  updateCategory(id: number, categoryRequestDto: CategoryRequestDto): Observable<CategoryResponseDto> {
    return this.http.put<CategoryResponseDto>(`${this.apiUrl}/${id}`, categoryRequestDto);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
} 