import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ErrorHandlerUtil } from '../utils/error-handler.util';
import { SubscriptionPlan, SubscriptionRequest } from '../models/subscription-plan.model';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private apiUrl = `${environment.apiUrl}/subscription-request`;

  constructor(private http: HttpClient) { }

  private handleError = (error: HttpErrorResponse) => {
    console.error('SubscriptionService HTTP error:', error);
    
    if (error.error?.customException?.message) {
      const errorMsg = error.error.customException.message;
      return throwError(() => new Error(errorMsg));
    }
    
    if (error.error?.message) {
      const errorMsg = error.error.message;
      return throwError(() => new Error(errorMsg));
    }
    
    const errorMessage = ErrorHandlerUtil.handleError(error, 'Abonelik işlemi sırasında bir hata oluştu');
    return throwError(() => new Error(errorMessage));
  }

  // Frontend enum değerlerini backend enum değerlerine çevirme
  private convertPlanToBackendFormat(plan: SubscriptionPlan): string {
    switch(plan) {
      case SubscriptionPlan.ESSENTIAL:
        return 'ESSENTIAL';
      case SubscriptionPlan.PLUS:
        return 'PLUS';  // Frontend ve backend aynı isimleri kullanıyor
      case SubscriptionPlan.MAX:
        return 'MAX';   // Frontend ve backend aynı isimleri kullanıyor
      default:
        return 'ESSENTIAL';
    }
  }

  // Yeni abonelik isteği oluştur
  createSubscriptionRequest(request: SubscriptionRequest): Observable<SubscriptionRequest> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    console.log('Gönderilecek istek (orijinal):', JSON.stringify(request));
    console.log('requestedPlan (orijinal):', request.requestedPlan);
    console.log('requestedPlan tipi:', typeof request.requestedPlan);
    
    // Eğer requestedPlan string ise, enum değerine çevirme
    let planToConvert = request.requestedPlan;
    if (typeof planToConvert === 'string') {
      switch(planToConvert) {
        case 'ESSENTIAL':
          planToConvert = SubscriptionPlan.ESSENTIAL;
          break;
        case 'PLUS':
          planToConvert = SubscriptionPlan.PLUS;
          break;
        case 'MAX':
          planToConvert = SubscriptionPlan.MAX;
          break;
        default:
          console.error('Bilinmeyen plan tipi:', planToConvert);
          planToConvert = SubscriptionPlan.ESSENTIAL;
          break;
      }
    }
    
    // Backend tarafının beklediği formata dönüştürme
    const backendPlan = this.convertPlanToBackendFormat(planToConvert);
    
    // SubscriptionRequest nesnesini backend'in beklediği formata uygun hale getirelim
    const requestPayload = {
      requestedPlan: backendPlan,
      message: request.message || ''
    };
    
    console.log('Düzenlenmiş istek:', JSON.stringify(requestPayload));
    console.log('requestedPlan (backend format):', requestPayload.requestedPlan);
    
    return this.http.post<SubscriptionRequest>(`${this.apiUrl}/create`, requestPayload, { headers }).pipe(
      tap(response => console.log('Başarılı yanıt:', response)),
      catchError(this.handleError)
    );
  }

  // Kullanıcının abonelik isteklerini getir
  getUserRequests(): Observable<SubscriptionRequest[]> {
    return this.http.get<SubscriptionRequest[]>(`${this.apiUrl}/user-requests`).pipe(
      tap(requests => {
        // Backend yanıtını loglayalım
        console.log('Backend\'den gelen abonelik istekleri (ham):', JSON.stringify(requests));
        
        // Backend ve frontend aynı plan isimlerini kullanıyor, dönüştürmeye gerek yok
        if (requests && requests.length > 0) {
          console.log('Abonelik istekleri:', JSON.stringify(requests));
        }
      }),
      catchError(this.handleError)
    );
  }

  // Abonelik isteğini iptal et
  cancelRequest(requestId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/cancel/${requestId}`, {}).pipe(
      catchError(this.handleError)
    );
  }

  // Admin işlemleri
  getAllPendingRequests(): Observable<SubscriptionRequest[]> {
    return this.http.get<SubscriptionRequest[]>(`${this.apiUrl}/pending`).pipe(
      catchError(this.handleError)
    );
  }

  getAllRequests(): Observable<SubscriptionRequest[]> {
    return this.http.get<SubscriptionRequest[]>(`${this.apiUrl}/all`).pipe(
      catchError(this.handleError)
    );
  }

  processRequest(requestId: number, approved: boolean, adminNote: string): Observable<SubscriptionRequest> {
    return this.http.post<SubscriptionRequest>(`${this.apiUrl}/process/${requestId}`, {
      approved,
      adminNote
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Reddedilen abonelik isteğini sil
  deleteRequest(requestId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${requestId}`).pipe(
      catchError(this.handleError)
    );
  }
} 