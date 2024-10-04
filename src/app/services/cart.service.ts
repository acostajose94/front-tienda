import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = `${environment.apiUrl}/cart`;

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

  // Agregar o actualizar producto en el carrito
  addToCart(productId: string, quantity: number): Observable<any> {
    const body = { productId, quantity };
    return this.http.post<any>(`${this.apiUrl}/add`, body, { headers: this.getHeaders() })
      .pipe(
        catchError(this.handleError)
      );
  }


  // Obtener el carrito del usuario autenticado
  getCart(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/list`, { headers: this.getHeaders() })
      .pipe(
        catchError(this.handleError)
      );
  }
}