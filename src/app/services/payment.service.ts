import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { loadStripe, Stripe } from '@stripe/stripe-js';
@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/payments`;
  private stripe: Stripe | null = null;
  
  constructor(private http: HttpClient) {}

  // Manejo de errores
  private handleError(error: any): Observable<never> {
    console.error('Ocurrió un error:', error);
    return throwError(() => new Error('Ocurrió un error, por favor intente nuevamente más tarde.'));
  }

  // Configuración de headers (autenticación)
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');  
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`  
    });
  }
     // Inicializar Stripe con la clave pública
  async loadStripe(): Promise<Stripe | null> {
    if (!this.stripe) {
      this.stripe = await loadStripe(environment.stripePublicKey);
    }
    return this.stripe;
  }

  // Crear sesión de pago
  payIt(cartId: string): Observable<any> {
    const body = { cartId };
    return this.http.post<any>(`${this.apiUrl}/createpayment`, body, { headers: this.getHeaders() })
      .pipe(
        catchError(this.handleError)
      );
  }
}
