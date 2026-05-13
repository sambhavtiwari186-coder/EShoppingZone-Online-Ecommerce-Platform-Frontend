import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="login-wrapper d-flex flex-column flex-lg-row align-items-stretch">
      <!-- Left side: Hero -->
      <div class="login-hero d-none d-lg-flex flex-column justify-content-center p-5">
        <div class="hero-overlay"></div>
        <div class="hero-content text-white position-relative z-1">
          <h1 class="display-3 luxury-font text-shadow mb-4">Timeless<br>Elegance.</h1>
          <p class="text-white lead text-shadow opacity-90">Experience the world's finest collections,<br>curated exclusively for you.</p>
        </div>
      </div>

      <!-- Right side: Form -->
      <div class="login-form-container d-flex flex-column justify-content-center align-items-center p-4">
        <div class="glass-card login-card p-5">
          <div class="text-center mb-4">
             <h2 class="mb-2">Login</h2>
             <p class="text-muted small">Enter your credentials to access your account</p>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <div class="mb-4">
              <label class="form-label small text-muted text-uppercase fw-bold ls-1">Email Address</label>
              <input type="email" formControlName="email" class="form-control-dark w-100" placeholder="name@example.com">
            </div>

            <div class="mb-4">
              <label class="form-label small text-muted text-uppercase fw-bold ls-1">Password</label>
              <div class="position-relative">
                <input [type]="showPassword ? 'text' : 'password'" formControlName="password" class="form-control-dark w-100 pe-5" placeholder="••••••••">
                <i 
                  [class]="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'" 
                  (click)="showPassword = !showPassword"
                  class="position-absolute end-0 top-50 translate-middle-y me-3 cursor-pointer text-muted"
                  style="font-size: 1.1rem;"
                ></i>
              </div>
            </div>

            <button type="submit" class="btn-gold w-100 mb-4" [disabled]="loginForm.invalid">
              Sign In
            </button>

            <p class="text-center text-muted small mt-4">
              Don't have an account? <a routerLink="/auth/register" class="text-gold fw-bold text-decoration-none">Create one</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper { min-height: 100vh; }
    .login-page { min-height: 100vh; }
    
    .login-hero {
      width: 55%;
      background: url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop');
      background-size: cover;
      background-position: center;
      position: relative;
    }
    
    .hero-overlay {
        position: absolute;
        top: 0; left: 0; width: 100%; height: 100%;
        background: linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.5));
    }
    
    .text-shadow {
        text-shadow: 0 2px 10px rgba(0,0,0,0.3);
    }
    
    .cursor-pointer { cursor: pointer; }
    
    .text-gold { color: var(--accent-gold); }
    .opacity-90 { opacity: 0.9; }
    
    .login-hero::after {
        content: '';
        position: absolute;
        bottom: 0; left: 0; width: 100%; height: 300px;
        background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
    }

    .login-form-container { width: 45%; flex-grow: 1; }
    
    @media (max-width: 991px) {
        .login-form-container { width: 100%; }
    }

    .login-card { width: 100%; max-width: 450px; }
    .ls-1 { letter-spacing: 1px; }
    .luxury-font { font-family: 'Playfair Display', serif; }
  `]
})
export class LoginComponent {
  fb = inject(FormBuilder);
  auth = inject(AuthService);
  router = inject(Router);

  showPassword = false;

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit() {
    if (this.loginForm.valid) {
      this.auth.login(this.loginForm.value).subscribe({
        next: () => {
          Swal.fire({
            title: 'Welcome Back!',
            text: 'Logged in successfully',
            icon: 'success',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
          });
          
          const role = this.auth.getUserRole();
          if (role === 'MERCHANT') {
            this.router.navigate(['/merchant/dashboard']);
          } else if (role === 'ADMIN') {
            this.router.navigate(['/admin/dashboard']);
          } else {
            this.router.navigate(['/home']);
          }
        },
        error: (err) => {
          Swal.fire('Error', 'Invalid credentials', 'error');
        }
      });
    }
  }
}
