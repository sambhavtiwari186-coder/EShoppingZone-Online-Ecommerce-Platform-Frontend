import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../../../core/models';
import { CartService } from '../../../core/services/cart.service';
import { NotificationService } from '../../../core/services/notification.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="glass-card product-card" [routerLink]="['/products', product.productId]">
      <div class="card-image-wrap">
        <img [src]="product.image ? product.image[0] : 'https://placehold.co/400x300?text=Premium+Collection'" [alt]="product.productName" class="product-img">
        <span class="category-badge">{{ product.category }}</span>
        <button class="wishlist-btn" (click)="addToWishlist($event)">
          <i class="bi bi-heart"></i>
        </button>
      </div>
      
      <div class="card-content">
        <h3 class="product-name">{{ product.productName }}</h3>
        
        <div class="rating-row mb-2">
          <div class="stars gold-text">
            @for (star of [1,2,3,4,5]; track star) {
               <i class="bi" [ngClass]="star <= 4 ? 'bi-star-fill' : 'bi-star'"></i>
            }
          </div>
          <span class="rating-num ms-2">4.2 (1.2k)</span>
        </div>

        <div class="price-row d-flex justify-content-between align-items-center mb-3">
          <span class="price-tag mono">₹{{ product.price }}</span>
          <span class="stock-badge" [ngClass]="product.stockQuantity > 10 ? 'in-stock' : (product.stockQuantity > 0 ? 'low-stock' : 'out-of-stock')">
            {{ product.stockQuantity > 10 ? 'In Stock' : (product.stockQuantity > 0 ? 'Low Stock' : 'Out of Stock') }}
          </span>
        </div>

        @if (!isMerchant) {
          <button class="btn-gold w-100" (click)="addToCart($event)">
            <i class="bi bi-cart-plus me-2"></i> Add to Cart
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    .product-card {
        cursor: pointer;
        overflow: hidden;
    }
    .card-image-wrap {
        position: relative;
        height: 220px;
        overflow: hidden;
    }
    .product-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.5s ease;
    }
    .product-card:hover .product-img { transform: scale(1.1); }
    
    .category-badge {
        position: absolute;
        top: 12px; left: 12px;
        background: rgba(0, 0, 0, 0.6);
        color: var(--accent-gold);
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
        backdrop-filter: blur(4px);
        border: 1px solid rgba(255,255,255,0.1);
    }
    
    .wishlist-btn {
        position: absolute;
        top: 12px; right: 12px;
        background: rgba(0, 0, 0, 0.6);
        border: 1px solid rgba(255,255,255,0.1);
        color: #FFF;
        width: 32px; height: 32px;
        border-radius: 50%;
        backdrop-filter: blur(4px);
        transition: all 0.2s ease;
    }
    .wishlist-btn:hover { color: var(--danger); }

    .card-content { padding: 20px; }
    
    .product-name {
        font-size: 1.1rem;
        margin-bottom: 8px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .gold-text { color: var(--accent-gold); }
    .rating-num { color: var(--text-muted); font-size: 0.8rem; }
    
    .price-tag {
        font-size: 1.25rem;
        color: var(--text-primary);
        font-weight: 800;
    }
    
    .stock-badge {
        font-size: 0.65rem;
        padding: 4px 8px;
        border-radius: 4px;
        text-transform: uppercase;
        font-weight: 700;
    }
    .in-stock { background: rgba(16, 185, 129, 0.1); color: var(--success); }
    .low-stock { background: rgba(245, 158, 11, 0.1); color: var(--accent-gold); }
    .out-of-stock { background: rgba(239, 68, 68, 0.1); color: var(--danger); }
  `]
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Input() isMerchant: boolean = false;
  private cartService = inject(CartService);
  private notificationService = inject(NotificationService);

  addToCart(event: Event) {
    event.stopPropagation();
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      Swal.fire({
        title: 'Authentication Required',
        text: 'Please login to add items to cart',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Go to Login',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = '/auth/login';
        }
      });
      return;
    }
    const user = JSON.parse(userStr);
    const newItem = {
      cartItemId: 0,
      productId: this.product.productId,
      productName: this.product.productName,
      price: this.product.price,
      quantity: 1,
      imageUrl: this.product.image ? this.product.image[0] : ''
    };
    this.cartService.addToCart(user.profileId, newItem as any).subscribe({
      next: () => {
        Swal.fire({
          title: 'Added!',
          text: `${this.product.productName} added to your cart`,
          icon: 'success',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000
        });
        this.notificationService.createNotification({
          userId: user.profileId,
          title: 'Item Added to Cart',
          message: `${this.product.productName} has been added to your shopping cart.`,
          type: 'CART'
        }).subscribe();
      },
      error: () => Swal.fire('Error', 'Could not add to cart', 'error')
    });
  }

  addToWishlist(event: Event) {
    event.stopPropagation();
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      Swal.fire({
        title: 'Authentication Required',
        text: 'Please login to add items to wishlist',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Go to Login',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = '/auth/login';
        }
      });
      return;
    }
    const user = JSON.parse(userStr);
    const item = {
      userId: user.profileId,
      productId: this.product.productId,
      productName: this.product.productName,
      price: this.product.price,
      imageUrl: this.product.image && this.product.image.length > 0 ? this.product.image[0] : ''
    };
    
    this.cartService.addToWishlist(item).subscribe({
      next: () => {
        Swal.fire({
          title: 'Saved!',
          text: `${this.product.productName} added to wishlist`,
          icon: 'success',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000
        });
        this.notificationService.createNotification({
          userId: user.profileId,
          title: 'Item Added to Wishlist',
          message: `${this.product.productName} has been saved to your wishlist.`,
          type: 'PROMO'
        }).subscribe();
      },
      error: () => Swal.fire('Error', 'Could not add to wishlist', 'error')
    });
  }
}
