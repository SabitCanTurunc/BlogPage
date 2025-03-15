import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { PostResponseDto } from '../models/post-response.dto';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = `${environment.apiUrl}/post`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getAllPosts(): Observable<PostResponseDto[]> {
    return this.http.get<PostResponseDto[]>(this.apiUrl);
  }

  getPostById(id: number): Observable<PostResponseDto> {
    return this.http.get<PostResponseDto>(`${this.apiUrl}/${id}`);
  }

  createPost(postData: any): Observable<PostResponseDto> {
    const headers = this.getHeaders();
    return this.http.post<PostResponseDto>(`${this.apiUrl}`, postData, { headers });
  }

  updatePost(id: number, postData: any): Observable<PostResponseDto> {
    console.log('Güncelleme isteği gönderiliyor:', id, postData);
    const headers = this.getHeaders();
    return this.http.put<PostResponseDto>(`${this.apiUrl}/${id}`, postData, { headers })
      .pipe(
        tap(response => console.log('Güncelleme yanıtı:', response))
      );
  }

  deletePost(id: number): Observable<void> {
    const headers = this.getHeaders();
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers });
  }
} 