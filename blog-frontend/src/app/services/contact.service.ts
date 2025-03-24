import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ErrorHandlerUtil } from '../utils/error-handler.util';

export interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private handleError = (error: HttpErrorResponse) => {
    const errorMessage = ErrorHandlerUtil.handleError(error, 'İletişim formu gönderilirken bir hata oluştu');
    return throwError(() => new Error(errorMessage));
  }

  sendContactForm(formData: ContactForm): Observable<any> {
    return this.http.post(`${this.apiUrl}/contact`, formData).pipe(
      catchError(this.handleError)
    );
  }
} 