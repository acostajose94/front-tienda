import { Routes } from '@angular/router';
import { UserProductListComponent } from './user/user-product-list/user-product-list.component';
import { CartComponent } from './user/cart/cart.component';
import { OrdersComponent } from './user/orders/orders.component';
import { PaymentComponent } from './user/payment/payment.component';
import { LoginComponent } from './general/login/login.component';

export const routes: Routes = [
    { path: '', component: UserProductListComponent }, // Ruta raíz que carga la lista de productos
    { path: 'login', component: LoginComponent },
    { path: 'cart', component: CartComponent },        // Ruta para el carrito
    { path: 'orders', component: OrdersComponent },    // Ruta para órdenes
    { path: 'payment', component: PaymentComponent },  // Ruta para pagos
    { path: '**', redirectTo: '', pathMatch: 'full' }  // Ruta para controlar errados
];
