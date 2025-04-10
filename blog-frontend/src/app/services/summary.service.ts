import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SummaryService {
  private apiUrl = `${environment.apiUrl}/summary`;

  constructor(private http: HttpClient) { }

  getSummaryByPostId(postId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/getByPostId/${postId}`);
  }
} 