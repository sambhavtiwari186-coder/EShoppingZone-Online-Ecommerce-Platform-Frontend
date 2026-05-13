import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar navbar-expand-lg fixed-top glass-nav">
      <div class="container">
        <a class="navbar-brand luxury-logo" routerLink="/">
          EShopping<span class="brand-accent">Zone</span>
        </a>
        
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navContent">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navContent">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item"><a class="nav-link" routerLink="/home" routerLinkActive="active">Home</a></li>
            <li class="nav-item"><a class="nav-link" routerLink="/products" routerLinkActive="active">Products</a></li>
            
            @if (auth.isLoggedIn()) {
              @if (auth.getUserRole() === 'CUSTOMER') {
                <li class="nav-item"><a class="nav-link" routerLink="/orders/history" routerLinkActive="active">Orders</a></li>
                <li class="nav-item"><a class="nav-link" routerLink="/wallet" routerLinkActive="active">Wallet</a></li>
              }
              @if (auth.getUserRole() === 'MERCHANT') {
                <li class="nav-item"><a class="nav-link" routerLink="/merchant/dashboard" routerLinkActive="active">Dashboard</a></li>
                <li class="nav-item"><a class="nav-link" routerLink="/merchant/inventory" routerLinkActive="active">Inventory</a></li>
              }
              @if (auth.getUserRole() === 'ADMIN') {
                <li class="nav-item"><a class="nav-link" routerLink="/admin" routerLinkActive="active">Admin Panel</a></li>
              }
            }
          </ul>

          <div class="navbar-actions d-flex align-items-center">
            @if (auth.isLoggedIn()) {
              <a routerLink="/notifications" class="btn-icon position-relative mx-2" title="Notifications">
                <i class="bi bi-bell text-secondary"></i>
                @if ((notifService.unreadCount$ | async); as count) {
                  @if (count > 0) {
                    <span class="badge-pulse">{{ count }}</span>
                  }
                }
              </a>
            }
            
            @if (auth.getUserRole() !== 'MERCHANT' && auth.getUserRole() !== 'ADMIN') {
              <a routerLink="/cart" class="btn-icon mx-3 position-relative">
                <i class="bi bi-cart3 text-secondary"></i>
                @if ((cartService.cartItemCount$ | async); as cartCount) {
                  @if(cartCount > 0) {
                      <span class="cart-count">{{ cartCount }}</span>
                  }
                }
              </a>
            }

            @if (auth.isLoggedIn()) {
              <div class="dropdown">
                <div class="avatar-circle" data-bs-toggle="dropdown">
                  {{ (auth.currentUser$ | async)?.fullName?.charAt(0) || 'U' }}
                </div>
                <ul class="dropdown-menu dropdown-menu-end glass-dropdown">
                  <li><a class="dropdown-item" routerLink="/profile">My Profile</a></li>
                  
                  @if (auth.getUserRole() === 'CUSTOMER') {
                    <li><a class="dropdown-item" routerLink="/orders/history">My Orders</a></li>
                    <li><a class="dropdown-item" routerLink="/wallet">Wallet</a></li>
                  }
                  @if (auth.getUserRole() === 'MERCHANT') {
                    <li><a class="dropdown-item" routerLink="/merchant/dashboard">Dashboard</a></li>
                  }
                  
                  <li><hr class="dropdown-divider"></li>
                  <li><a class="dropdown-item text-danger" (click)="auth.logout()">Logout</a></li>
                </ul>
              </div>
            } @else {
              <a routerLink="/auth/login" class="btn-outline-gold btn-sm me-2">Login</a>
              <a routerLink="/auth/register" class="btn-gold btn-sm">Join</a>
            }
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .glass-nav {
      background: rgba(10, 10, 10, 0.8);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--border);
      height: 72px;
    }
    .luxury-logo {
      font-family: 'Playfair Display', serif;
      font-weight: 800;
      font-size: 1.5rem;
      color: var(--text-primary);
      text-decoration: none;
    }
    .brand-accent { color: var(--accent-gold); }
    .nav-link {
        color: var(--text-muted);
        font-weight: 500;
        transition: color 0.3s ease;
        margin: 0 10px;
    }
    .nav-link:hover, .nav-link.active { color: var(--accent-primary); }
    
    .btn-icon { cursor: pointer; text-decoration: none; font-size: 1.2rem; }
    
    .badge-pulse {
      position: absolute;
      top: -8px; right: -5px;
      background: var(--danger);
      color: #fff;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 1px 5px;
      border-radius: 10px;
      box-shadow: 0 0 8px rgba(220, 38, 38, 0.5);
      animation: pulse 2s infinite;
      min-width: 18px;
      text-align: center;
    }
    
    .cart-count {
        position: absolute;
        top: -8px; right: -8px;
        background: var(--accent-gold);
        color: #000;
        font-size: 0.65rem;
        font-weight: 800;
        padding: 2px 5px;
        border-radius: 10px;
    }

    @keyframes pulse {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7); }
      70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(245, 158, 11, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
    }

    .avatar-circle {
      width: 40px; height: 40px;
      background: var(--primary-gradient);
      color: #FFF;
      display: flex; align-items: center; justify-content: center;
      border-radius: 50%; font-weight: bold; cursor: pointer;
    }
    
    .glass-dropdown {
        background: rgba(17, 17, 17, 0.98);
        backdrop-filter: blur(10px);
        border: 1px solid var(--border);
        box-shadow: var(--glass-shadow);
        padding: 10px;
        margin-top: 10px;
    }
  `]
})
export class NavbarComponent {
  auth = inject(AuthService);
  cartService = inject(CartService);
  notifService = inject(NotificationService);

  ngOnInit() {
    this.auth.currentUser$.subscribe(user => {
      if (user && user.profileId) {
        // Initialize the cart count when user logs in
        this.cartService.getCart(user.profileId).subscribe({error: () => {}});
        this.notifService.refreshUnreadCount(user.profileId);
      }
    });
  }
}
