import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  providers: [UserService]
})
export class LoginComponent implements OnInit{
  loginForm!: FormGroup;
  registerForm!: FormGroup;
  email: string = '';
  password: string = '';
  successMessage:string ='';
  errorMessage: string = '';

  constructor(
    private userService: UserService, 
    private router: Router,
  private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForms();
  }
 // Inicializar ambos formularios (login y register)
 initializeForms(): void {
  this.loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  this.registerForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(4)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
  });
}

// Iniciar sesión
onLogin(): void {
  if (this.loginForm.invalid) {
    this.errorMessage = 'Por favor, complete todos los campos correctamente';
    return;
  }

  const { email, password } = this.loginForm.value;
  this.userService.login(email, password).subscribe({
    next: (response) => {
      console.log('Inicio de sesión exitoso:', response);
      // Guardar el token en el almacenamiento local
      localStorage.setItem('token', response.token);
      this.router.navigate(['/dashboard']); // Redirigir al dashboard o cualquier página deseada
    },
    error: (error) => {
      console.error('Error en el inicio de sesión:', error);
      this.errorMessage = 'Credenciales inválidas o error del servidor';
    }
  });
}

// Registrar nuevo usuario
onRegister(): void {
  if (this.registerForm.invalid) {
    this.errorMessage = 'Por favor, complete todos los campos correctamente';
    return;
  }

  const { username, email, password, confirmPassword } = this.registerForm.value;

  // Verificar que las contraseñas coincidan
  if (password !== confirmPassword) {
    this.errorMessage = 'Las contraseñas no coinciden';
    return;
  }

  this.userService.register(username, email, password).subscribe({
    next: (response) => {
      console.log('Registro exitoso:', response);
      this.successMessage = 'Registro exitoso. Ahora puede iniciar sesión.';
      this.errorMessage = '';
    },
    error: (error) => {
      console.error('Error en el registro:', error);
      this.errorMessage = 'Error al registrar. Intente nuevamente.';
      this.successMessage = '';
    }
  });
}
}