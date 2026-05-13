import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="footer py-5 mt-5">
      <div class="container">
        <div class="row g-4 bt-border-dark pt-5">
          <div class="col-lg-4">
             <h3 class="luxury-font mb-4" style="cursor: pointer" routerLink="/home">EShopping<span class="gold-accent">Zone</span></h3>
             <p class="text-muted small">Elevating your shopping experience with curated luxury collections and seamless technology.</p>
             <div class="social-links d-flex gap-3 mt-4">
                <a href="https://instagram.com" target="_blank" class="text-decoration-none"><i class="bi bi-instagram gold-accent-hover fs-5"></i></a>
                <a href="https://twitter.com" target="_blank" class="text-decoration-none"><i class="bi bi-twitter-x gold-accent-hover fs-5"></i></a>
                <a href="https://facebook.com" target="_blank" class="text-decoration-none"><i class="bi bi-facebook gold-accent-hover fs-5"></i></a>
             </div>
          </div>
          <div class="col-6 col-lg-2 ms-lg-auto">
             <h6 class="text-light text-uppercase small mb-4 ls-1">Shop</h6>
             <ul class="list-unstyled text-muted small">
                <li><a routerLink="/products" class="nav-link-footer">New Arrivals</a></li>
                <li><a routerLink="/products" class="nav-link-footer">Best Sellers</a></li>
                <li><a routerLink="/products" class="nav-link-footer">Collections</a></li>
             </ul>
          </div>
          <div class="col-6 col-lg-2">
             <h6 class="text-light text-uppercase small mb-4 ls-1">Support</h6>
             <ul class="list-unstyled text-muted small">
                <li><a (click)="showInfo('Shipping Info')" class="nav-link-footer">Shipping Info</a></li>
                <li><a (click)="showInfo('Returns Policy')" class="nav-link-footer">Returns</a></li>
                <li><a (click)="showInfo('Contact Support')" class="nav-link-footer">Contact Us</a></li>
             </ul>
          </div>
          <div class="col-lg-3">
             <h6 class="text-light text-uppercase small mb-4 ls-1">Newsletter</h6>
             <div class="newsletter-input d-flex">
                <input #emailInput type="email" class="form-control-dark rounded-0 border-end-0 w-100" placeholder="Your email">
                <button class="btn btn-gold rounded-0" (click)="subscribe(emailInput.value); emailInput.value=''">JOIN</button>
             </div>
          </div>
        </div>
        <div class="mt-5 pt-4 text-center border-top border-secondary opacity-50">
           <p class="text-muted small">&copy; 2024 EShoppingZone Luxury Commerce. All rights reserved.</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer { background: #050505; color: white; }
    .luxury-font { font-family: 'Playfair Display', serif; }
    .gold-accent-hover { cursor: pointer; transition: color 0.3s ease; color: #888; }
    .gold-accent-hover:hover { color: var(--accent-gold); }
    .nav-link-footer { cursor: pointer; display: block; margin-bottom: 10px; transition: color 0.3s; color: #888 !important; text-decoration: none; }
    .nav-link-footer:hover { color: var(--accent-gold) !important; padding-left: 5px; }
    .ls-1 { letter-spacing: 1px; }
    .bt-border-dark { border-top: 1px solid #222; }
    .gold-accent { color: var(--accent-gold); }
    .form-control-dark {
      background: #111;
      border: 1px solid #333;
      color: white;
      padding: 10px 15px;
    }
    .form-control-dark:focus {
      background: #151515;
      border-color: var(--accent-gold);
      box-shadow: none;
      color: white;
    }
  `]
})
export class FooterComponent {
  subscribe(email: string) {
    if (!email || !email.includes('@')) {
      Swal.fire({
        title: 'Error',
        text: 'Please enter a valid email address.',
        icon: 'error',
        background: '#111',
        color: '#fff',
        confirmButtonColor: 'var(--accent-gold)'
      });
      return;
    }
    Swal.fire({
      title: 'Subscribed!',
      text: `Thank you for joining our newsletter. Exclusive updates will be sent to ${email}`,
      icon: 'success',
      background: '#111',
      color: '#fff',
      confirmButtonColor: 'var(--accent-gold)'
    });
  }

  showInfo(title: string) {
    Swal.fire({
      title: title,
      text: `Information about ${title} will be available soon. Please check back later or contact our premium concierge.`,
      icon: 'info',
      background: '#111',
      color: '#fff',
      confirmButtonColor: 'var(--accent-gold)'
    });
  }
}
