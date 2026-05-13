import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent],
  template: `
    <!-- HERO SECTION -->
    <div class="hero-section position-relative overflow-hidden d-flex align-items-center">
      <!-- Animated Background Mesh -->
      <div class="animated-mesh"></div>
      
      <div class="container position-relative z-1">
        <div class="row align-items-center g-5">
          <div class="col-lg-6">
            <h1 class="display-1 hero-title">Shop Without<br><span class="gold-gradient-text">Limits.</span></h1>
            <p class="lead hero-subtitle mt-4 mb-5 opacity-90">Experience luxury e-commerce with premium drops and exclusive collections, delivered to your doorstep.</p>
            <div class="d-flex gap-3">
              <button class="btn-gold px-5 py-3" routerLink="/products">Shop Collection</button>
              <button class="btn-outline-gold px-5 py-3" (click)="viewLookbook()">View Lookbook</button>
            </div>
          </div>
          <div class="col-lg-6 d-none d-lg-block">
            <div class="hero-img-container" style="cursor:pointer" routerLink="/products/51">
              <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff" alt="Featured Product" class="hero-float-img shadow-lg">
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TRENDING SECTION -->
    <section class="trending-section py-5">
      <div class="container">
        <div class="d-flex justify-content-between align-items-end mb-5">
          <div>
            <span class="brand-accent text-uppercase small ls-2">Curated selection</span>
            <h2 class="display-4 trending-title mt-2">Trending Now</h2>
            <div class="primary-underline"></div>
          </div>
          <a routerLink="/products" class="text-primary text-decoration-none fw-bold">View All Products <i class="bi bi-arrow-right brand-accent ms-2"></i></a>
        </div>

        <div class="row g-4">
          @for (product of featuredProducts; track product.productId) {
            <div class="col-md-6 col-lg-3">
              <app-product-card [product]="product"></app-product-card>
            </div>
          } @empty {
             <p>No products found.</p>
          }
        </div>
      </div>
    </section>

    <!-- HOW IT WORKS -->
    <section class="how-it-works py-5 bg-secondary-light">
      <div class="container">
        <div class="row text-center g-5">
          <div class="col-md-4">
            <a class="step-card d-block text-decoration-none h-100" routerLink="/auth/register">
              <div class="step-icon glass-card mx-auto mb-4">
                 <i class="bi bi-person-plus display-6 brand-accent"></i>
              </div>
              <h3 class="text-white">Register</h3>
              <p class="text-muted">Join our exclusive community of shoppers or merchants.</p>
            </a>
          </div>
          <div class="col-md-4">
             <a class="step-card d-block text-decoration-none h-100" routerLink="/products">
               <div class="step-icon glass-card mx-auto mb-4">
                 <i class="bi bi-search display-6 brand-accent"></i>
               </div>
               <h3 class="text-white">Browse</h3>
               <p class="text-muted">Explore thousands of premium products from across the globe.</p>
             </a>
          </div>
          <div class="col-md-4">
             <a class="step-card d-block text-decoration-none h-100" routerLink="/orders/history">
               <div class="step-icon glass-card mx-auto mb-4">
                 <i class="bi bi-box-seam display-6 brand-accent"></i>
               </div>
               <h3 class="text-white">Order</h3>
               <p class="text-muted">Seamless checkout and lightning-fast delivery to your door.</p>
             </a>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .hero-section { min-height: 90vh; background: var(--bg-primary); padding-top: 72px; }
    .hero-title { font-weight: 900; color: #FFF; line-height: 1.1; font-size: 5rem; }
    .gold-gradient-text {
      background: var(--gold-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .hero-subtitle { color: #BBB; font-weight: 300; }
    .animated-mesh {
      position: absolute;
      top: -10%; right: -10%;
      width: 60%; height: 60%;
      background: radial-gradient(circle, rgba(245, 158, 11, 0.1) 0%, transparent 70%);
      filter: blur(80px);
      animation: drift 20s infinite alternate;
    }
    .hero-float-img {
       width: 110%;
       border-radius: 30px;
       transform: rotate(-5deg);
       transition: var(--smooth);
    }
    .hero-float-img:hover { transform: rotate(0) scale(1.05); }
    
    @keyframes drift {
      from { transform: translate(0, 0); }
      to { transform: translate(-100px, 100px); }
    }
    
    .ls-2 { letter-spacing: 2px; }
    .primary-underline {
        width: 60px; height: 4px;
        background: var(--accent-primary);
        margin-top: 10px;
    }
    
    .bg-secondary-light { background: var(--bg-secondary); }
    .step-icon { width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; transition: var(--smooth); }
    
    .step-card {
      cursor: pointer;
      transition: var(--smooth);
      position: relative;
      z-index: 5;
    }
    .step-card:hover { transform: translateY(-10px); }
    .step-card:hover .step-icon {
      background: rgba(255, 255, 255, 0.1);
      border-color: var(--accent-gold);
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }
    .step-card:hover h3 { color: var(--accent-gold) !important; }
  `]
})
export class HomeComponent implements OnInit {
  productService = inject(ProductService);
  featuredProducts: Product[] = [];

  ngOnInit() {
    this.productService.getAll().subscribe({
      next: (products) => {
        // Show first 4 products on the home page as featured
        this.featuredProducts = products.slice(0, 4);
      },
      error: (error) => {
        console.error('Failed to load featured products', error);
      }
    });
  }

  viewLookbook() {
    Swal.fire({
      title: 'Premium Lookbook',
      text: 'Our Spring/Summer 2026 Lookbook is being curated. Check back soon for exclusive style inspirations!',
      icon: 'info',
      background: '#111',
      color: '#fff',
      confirmButtonColor: 'var(--accent-gold)'
    });
  }
}
