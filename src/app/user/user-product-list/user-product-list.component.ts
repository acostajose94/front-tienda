import { Component, inject, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-user-product-list',
  standalone: true,
  imports: [],
  templateUrl: './user-product-list.component.html',
  styleUrl: './user-product-list.component.scss',
  providers:[ProductService]
})
export class UserProductListComponent  implements OnInit {
  products: any[] = [];
  errorMessage: string = '';
  
;

  constructor(  
    private productService:ProductService,
    private cartService: CartService
  ) {
 
  }

  ngOnInit(): void {
  this.loadProducts();
  
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({

      next: (data: any[]) => {
        this.products = data;
        console.log(this.products);
      },
      
      error: (error) => {
        console.error('Error al cargar los productos:', error);
        this.errorMessage = 'Error al cargar los productos';
      }
    });
  }

  // Función para agregar al carrito
  addToCart(productId: string): void {
    this.cartService.addToCart(productId, 1).subscribe({

      next: (response) => {
        console.log('Producto agregado al carrito:', response);
      },

      error: (error) => {
        console.error('Error al agregar al carrito:', error);
        this.errorMessage = 'Error al agregar al carrito';
      }
    });
  }
}
