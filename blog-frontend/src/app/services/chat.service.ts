import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent, HttpEventType, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export type AIModel = 'gemini' | 'openai';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'http://localhost:8080/chat';

  constructor(private http: HttpClient) { }

  sendMessage(question: string, model: AIModel = 'gemini'): Observable<HttpEvent<any>> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream'
    });

    return this.http.post(`${this.apiUrl}/${model}`, { question }, {
      headers: headers,
      responseType: 'text',
      observe: 'events',
      reportProgress: true
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Chat servisi hatası:', error);
        
        let errorMessage = 'Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin.';
        if (error.status === 403) {
          errorMessage = 'Erişim reddedildi. API yetkilendirme sorunu olabilir. Lütfen oturum açtığınızdan emin olun.';
        } else if (error.status === 0) {
          errorMessage = 'Sunucuya bağlanılamadı. Lütfen sunucunun çalıştığından emin olun.';
        } else if (error.error) {
          errorMessage = typeof error.error === 'string' ? error.error : JSON.stringify(error.error);
        }
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}