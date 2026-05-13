import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/auth/auth.service';
import { Cart, Wishlist } from '../../core/models';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container py-5">
      <!-- Tab Pills -->
      <ul class="nav nav-pills mb-5 glass-tabs" id="cartTabs">
        <li class="nav-item">
          <button class="nav-link" [class.active]="activeTab === 'cart'" (click)="activeTab = 'cart'">
            <i class="bi bi-cart3 me-2"></i>My Cart
            <span class="badge ms-2" style="background:var(--accent-gold);color:#000">{{ cart?.items?.length || 0 }}</span>
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link" [class.active]="activeTab === 'wishlist'" (click)="activeTab = 'wishlist'">
            <i class="bi bi-heart me-2"></i>Wishlist
            <span class="badge ms-2" style="background:rgba(239,68,68,0.2);color:#ef4444">{{ wishlist.length }}</span>
          </button>
        </li>
      </ul>

      <!-- CART TAB -->
      @if (activeTab === 'cart') {
        @if (cart && cart.items && cart.items.length > 0) {
          <div class="row g-4">
            <div class="col-lg-8">
              @for (item of cart.items; track item.cartItemId) {
                <div class="glass-card p-4 mb-3 d-flex align-items-center gap-4">
                  <div class="item-img-placeholder" style="cursor:pointer; overflow:hidden;" [routerLink]="['/products', item.productId]">
                      @if (item.imageUrl) {
                          <img [src]="item.imageUrl" style="width:100%; height:100%; object-fit:cover" [alt]="item.productName">
                      }
                  </div>
                  <div class="flex-grow-1" style="cursor:pointer" [routerLink]="['/products', item.productId]">
                    <h5 class="mb-1">{{ item.productName }}</h5>
                    <span class="mono gold-accent">₹{{ item.price | number:'1.0-0' }}</span>
                  </div>
                  <div class="qty-control d-flex align-items-center gap-2">
                    <button class="btn btn-sm btn-outline-secondary rounded-circle" (click)="decItem(item)">
                      <i class="bi bi-dash"></i>
                    </button>
                    <span class="mono px-2">{{ item.quantity }}</span>
                    <button class="btn btn-sm btn-outline-secondary rounded-circle" (click)="incItem(item)">
                      <i class="bi bi-plus"></i>
                    </button>
                  </div>
                  <div class="mono text-end" style="min-width:100px">
                    <div class="small text-muted">Subtotal</div>
                    <div class="gold-accent fw-bold">₹{{ (item.price * item.quantity) | number:'1.0-0' }}</div>
                  </div>
                  <button class="btn btn-link text-danger p-0" (click)="removeItem(item)"><i class="bi bi-trash"></i></button>
                </div>
              }
            </div>

            <!-- Order Summary -->
            <div class="col-lg-4">
              <div class="glass-card p-4 order-summary sticky-top" style="top:90px">
                <h5 class="mb-4">Order Summary</h5>
                <div class="d-flex justify-content-between mb-2">
                  <span class="text-muted">Subtotal</span>
                  <span class="mono">₹{{ cart.totalPrice | number:'1.0-0' }}</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                  <span class="text-muted">Shipping</span>
                  <span class="text-success">FREE</span>
                </div>
                <hr class="border-secondary">
                <div class="d-flex justify-content-between mb-4">
                  <span class="fw-bold">Total</span>
                  <span class="mono gold-accent fw-bold fs-5">₹{{ cart.totalPrice | number:'1.0-0' }}</span>
                </div>
                <a routerLink="/orders/checkout" class="btn-gold w-100 d-block text-center py-3">
                  Proceed to Checkout <i class="bi bi-arrow-right ms-2"></i>
                </a>
              </div>
            </div>
          </div>
        } @else {
          <div class="text-center py-5">
            <i class="bi bi-cart-x display-1" style="color:var(--text-muted);opacity:0.3"></i>
            <h3 class="mt-4">Your Cart is Empty</h3>
            <p class="text-muted mb-4">Looks like you haven't added anything yet.</p>
            <a routerLink="/products" class="btn-gold px-5 py-3">Browse Products</a>
          </div>
        }
      }

      <!-- WISHLIST TAB -->
      @if (activeTab === 'wishlist') {
        @if (wishlist.length > 0) {
          <div class="row g-4">
            @for (item of wishlist; track item.wishlistId) {
              <div class="col-md-6 col-lg-4">
                <div class="glass-card p-4">
                  <div style="height: 200px; border-radius: 8px; overflow: hidden; margin-bottom: 1rem; cursor:pointer" [routerLink]="['/products', item.productId]">
                    @if(item.imageUrl) {
                      <img [src]="item.imageUrl" style="width: 100%; height: 100%; object-fit: cover;" [alt]="item.productName">
                    } @else {
                      <div style="width: 100%; height: 100%; background: var(--bg-secondary);"></div>
                    }
                  </div>
                  <h5 class="mb-2" style="cursor:pointer" [routerLink]="['/products', item.productId]">{{ item.productName }}</h5>
                  <div class="mono gold-accent mb-4">₹{{ item.price | number:'1.0-0' }}</div>
                  <div class="d-flex gap-2">
                    <button class="btn-gold flex-grow-1 py-2 small" (click)="moveToCart(item.wishlistId)">Move to Cart</button>
                    <button class="btn-outline-gold py-2 px-3" (click)="removeFromWishlist(item.wishlistId)"><i class="bi bi-trash"></i></button>
                  </div>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="text-center py-5">
            <i class="bi bi-heart display-1" style="color:var(--text-muted);opacity:0.3"></i>
            <h3 class="mt-4">Your Wishlist is Empty</h3>
            <p class="text-muted">Save items you love for later.</p>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .glass-tabs { background: var(--bg-glass); padding: 6px; border-radius: 12px; display: inline-flex; }
    .nav-link { color: var(--text-muted); border-radius: 8px; padding: 10px 20px; transition: all 0.3s; }
    .nav-link.active { background: var(--gold-gradient); color: #000; font-weight: 600; }
    .item-img-placeholder { width: 72px; height: 72px; border-radius: 10px; background: var(--bg-secondary); flex-shrink: 0; }
    .order-summary { border-left: 4px solid var(--accent-gold); }
  `]
})
export class CartComponent implements OnInit {
  private cartService = inject(CartService);
  private authService = inject(AuthService);

  activeTab = 'cart';
  cart: Cart | null = null;
  wishlist: Wishlist[] = [];
  userId: number | null = null;

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (user && user.profileId) {
        this.userId = user.profileId;
        this.loadData();
      }
    });
  }

  private persist() {
    if (!this.cart || !this.userId) return;
    this.cartService.updateCart(this.userId, this.cart.items).subscribe({
      next: (c) => this.cart = c,
      error: () => {}
    });
  }

  decItem(item: any) {
    if (item.quantity > 1) { item.quantity--; this.persist(); }
    else this.removeItem(item);
  }

  incItem(item: any) { item.quantity++; this.persist(); }

  removeItem(item: any) {
    if (!this.cart) return;
    this.cart.items = this.cart.items.filter((i: any) => i.cartItemId !== item.cartItemId);
    this.persist();
  }

  moveToCart(wishlistId: number) {
    this.cartService.moveToCart(wishlistId).subscribe(() => this.loadData());
  }

  removeFromWishlist(wishlistId: number) {
    this.cartService.removeFromWishlist(wishlistId).subscribe(() => this.loadData());
  }

  loadData() {
    if (!this.userId) return;
    this.cartService.getCart(this.userId).subscribe(c => this.cart = c);
    this.cartService.getWishlist(this.userId).subscribe(w => this.wishlist = w);
  }
}
