import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { UserProductListComponent } from './user/user-product-list/user-product-list.component';
import { LoginComponent } from "./general/login/login.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    RouterLink, 
    UserProductListComponent, 
    LoginComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'front-tienda';
}
