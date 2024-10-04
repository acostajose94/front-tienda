import { Component, OnInit } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../services/payment.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent  implements OnInit {
  cart: any = null;
  errorMessage: string = '';

  constructor(private cartService: CartService, private paymentService:PaymentService) {}

  ngOnInit(): void {
    this.loadCart();
  }

  // Cargar el carrito
  loadCart(): void {
    this.cartService.getCart().subscribe({
      next: (response) => {
        this.cart = response;
      },
      error: (error) => {
        console.error('Error al cargar el carrito:', error);
        this.errorMessage = 'Error al cargar el carrito';
      }
    });
  }

  // Proceder al pago
  async proceedToPayment(): Promise<void> {
    if (!this.cart || !this.cart.id) {
      console.error('Carrito no cargado correctamente');
      return;
    }

    try {
      // Llama al servicio de pago para crear la sesión
      this.paymentService.payIt(this.cart.id).subscribe(async (response) => {
        console.log('Sesión de Stripe creada:', response);

        // Carga Stripe en el frontend
        const stripe = await this.paymentService.loadStripe();
        if (stripe) {
          // Redirige a la página de pago de Stripe con la sesión ID devuelta
          const result = await stripe.redirectToCheckout({
            sessionId: response.id // ID de la sesión Stripe retornada desde el backend
          });
          if (result.error) {
            console.error('Error al redirigir a Stripe:', result.error.message);
          }
        }
      });
    } catch (error) {
      console.error('Error al proceder con el pago:', error);
    }
  }
  


  // Actualizar la cantidad de un producto en el carrito
  updateQuantity(item: any, newQuantity: number): void {
    if (newQuantity >= 0) {
      this.cartService.addToCart(item.productId, newQuantity).subscribe({
        next: (response) => {
          this.loadCart(); // Recargar el carrito después de actualizar la cantidad
        },
        error: (error) => {
          console.error('Error al actualizar el carrito:', error);
          this.errorMessage = 'Error al actualizar el carrito';
        }
      });
    }
  }

  // Función para manejar el cambio de cantidad desde el input
  onQuantityChange(event: Event, item: any): void {
    const inputElement = event.target as HTMLInputElement; // Casting explícito a HTMLInputElement
    const newQuantity = Number(inputElement.value);
    this.updateQuantity(item, newQuantity);
  }

  // Eliminar un producto del carrito (cuando la cantidad es 0)
  removeFromCart(item: any): void {
    this.updateQuantity(item, 0); // Enviar 0 para eliminar el producto del carrito
  }



}