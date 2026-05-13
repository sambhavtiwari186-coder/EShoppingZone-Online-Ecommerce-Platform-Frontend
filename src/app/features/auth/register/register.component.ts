import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="register-page d-flex flex-column justify-content-center align-items-center py-5">
      <div class="glass-card register-card p-5">
        <div class="text-center mb-5">
          <h2 class="display-6 luxury-font mb-2">Create Account</h2>
          <p class="text-muted">Join EShoppingZone and start your premium journey</p>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <!-- Role Selection Pips -->
          <div class="role-selector d-flex justify-content-center gap-3 mb-5">
            <div class="role-pip" [class.active]="selectedRole === 'CUSTOMER'" (click)="setRole('CUSTOMER')">
               <i class="bi bi-person-check fs-4"></i>
               <span>Customer</span>
            </div>
            <div class="role-pip" [class.active]="selectedRole === 'MERCHANT'" (click)="setRole('MERCHANT')">
               <i class="bi bi-shop fs-4"></i>
               <span>Merchant</span>
            </div>
          </div>

          <div class="row g-3">
            <div class="col-md-12">
               <label class="form-label small text-muted text-uppercase fw-bold ls-1">Full Name</label>
               <input type="text" formControlName="fullName" class="form-control-dark w-100" placeholder="John Doe">
            </div>
            <div class="col-md-12">
               <label class="form-label small text-muted text-uppercase fw-bold ls-1">Email Address</label>
               <input type="email" formControlName="email" class="form-control-dark w-100" placeholder="john@example.com">
            </div>
            <div class="col-md-12">
               <label class="form-label small text-muted text-uppercase fw-bold ls-1">Password</label>
               <input type="password" formControlName="password" class="form-control-dark w-100" placeholder="••••••••">
            </div>
          </div>

          <button type="submit" class="btn-primary w-100 mt-5 py-3 d-flex align-items-center justify-content-center gap-2">
            @if (loading) {
              <span class="spinner-border spinner-border-sm"></span>
            }
            {{ loading ? 'Creating Account...' : 'Complete Registration' }}
          </button>

          <p class="text-center text-muted small mt-4">
            Already have an account? <a routerLink="/auth/login" class="text-gold fw-bold text-decoration-none">Login here</a>
          </p>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .register-page { min-height: 100vh; background: var(--bg-primary); }
    .register-card { width: 100%; max-width: 550px; border: 1px solid var(--border); }
    .ls-1 { letter-spacing: 1px; }
    .luxury-font { font-family: 'Playfair Display', serif; }
    .text-gold { color: var(--accent-gold); }
    
    .role-selector { width: 100%; }
    .role-pip {
        flex: 1;
        padding: 15px;
        border: 2px solid var(--border);
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5px;
        cursor: pointer;
        color: var(--text-muted);
        transition: all 0.3s ease;
    }
    .role-pip.active {
        border-color: var(--accent-gold);
        background: rgba(245, 158, 11, 0.05);
        color: var(--accent-gold);
    }
    .role-pip span { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; }
  `]
})
export class RegisterComponent {
  fb = inject(FormBuilder);
  auth = inject(AuthService);
  router = inject(Router);

  selectedRole: 'CUSTOMER' | 'MERCHANT' = 'CUSTOMER';
  loading = false;

  registerForm = this.fb.group({
    fullName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  setRole(role: 'CUSTOMER' | 'MERCHANT') {
    this.selectedRole = role;
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      Swal.fire({
        title: 'Form Error',
        text: 'Please fill all fields correctly.',
        icon: 'warning',
        background: '#111',
        color: '#fff',
        confirmButtonColor: 'var(--accent-gold)'
      });
      return;
    }

    this.loading = true;
    const data = {
      fullName: this.registerForm.value.fullName,
      emailId: this.registerForm.value.email,
      password: this.registerForm.value.password,
      role: this.selectedRole
    };

    const obs = this.selectedRole === 'CUSTOMER' 
      ? this.auth.registerCustomer(data) 
      : this.auth.registerMerchant(data);

    obs.subscribe({
      next: () => {
        this.loading = false;
        Swal.fire({
          title: 'Welcome!',
          text: 'Account created successfully',
          icon: 'success',
          background: '#111',
          color: '#fff'
        });
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.loading = false;
        console.error('Registration failed', err);
        Swal.fire({
          title: 'Failed',
          text: err.error?.message || 'Registration failed. This email might already be in use.',
          icon: 'error',
          background: '#111',
          color: '#fff'
        });
      }
    });
  }
}
