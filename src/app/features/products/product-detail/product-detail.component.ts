import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models';
import { CartService } from '../../../core/services/cart.service';
import { NotificationService } from '../../../core/services/notification.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container py-5" *ngIf="product">
      <!-- Breadcrumb -->
      <nav class="mb-4">
        <span class="text-muted small">
          <a routerLink="/" class="text-muted text-decoration-none">Home</a>
          <span class="mx-2">/</span>
          <a routerLink="/products" class="text-muted text-decoration-none">Products</a>
          <span class="mx-2">/</span>
          <span class="text-primary-gold fw-bold">{{ product.productName }}</span>
        </span>
      </nav>

      <div class="row g-5">
        <!-- LEFT: Product Image -->
        <div class="col-lg-5">
          <div class="product-image-main glass-card overflow-hidden" style="height:420px">
            <img [src]="product.image[selectedImg]" [alt]="product.productName"
                 class="w-100 h-100" style="object-fit:cover">
          </div>
          <div class="d-flex gap-2 mt-3" *ngIf="product.image.length > 1">
            <div *ngFor="let img of product.image; let i = index"
                 class="thumb-img glass-card overflow-hidden"
                 [class.active]="i === selectedImg"
                 (click)="selectedImg = i"
                 style="width:72px;height:72px;cursor:pointer">
              <img [src]="img" class="w-100 h-100" style="object-fit:cover">
            </div>
          </div>
        </div>

        <!-- RIGHT: Product Details -->
        <div class="col-lg-7">
          <span class="badge mb-3" style="background:rgba(245,158,11,0.1);color:var(--accent-gold);padding:8px 16px;border-radius:20px;font-weight:600;border:1px solid rgba(245,158,11,0.2)">
            {{ product.category }}
          </span>
          <h1 class="display-5 mb-2">{{ product.productName }}</h1>

          <div class="d-flex align-items-center gap-3 mb-4">
            <div class="stars text-warning fs-5">
              <i class="bi bi-star-fill" *ngFor="let s of [1,2,3,4]"></i>
              <i class="bi bi-star"></i>
            </div>
            <span class="text-muted small">4.2 (128 reviews)</span>
            <span class="ms-2" [ngClass]="product.stockQuantity > 0 ? 'text-success' : 'text-danger'">
              <i class="bi" [ngClass]="product.stockQuantity > 0 ? 'bi-check-circle-fill' : 'bi-x-circle-fill'"></i>
              {{ product.stockQuantity > 10 ? 'In Stock' : product.stockQuantity > 0 ? 'Low Stock (' + product.stockQuantity + ' left)' : 'Out of Stock' }}
            </span>
          </div>

          <div class="price-display mb-4">
            <span class="mono" style="font-size:2.5rem;color:var(--accent-gold);font-weight:800">
              ₹{{ product.price | number:'1.0-0' }}
            </span>
          </div>

          <p class="text-muted mb-5">{{ product.description }}</p>

          <!-- Quantity -->
          <div class="d-flex align-items-center gap-4 mb-5">
            <div class="qty-control d-flex align-items-center glass-card px-3" style="width:fit-content;border-radius:12px">
              <button class="btn btn-link text-light p-2 text-decoration-none" (click)="decQty()">
                <i class="bi bi-dash fs-5"></i>
              </button>
              <span class="mono px-3 fs-5 fw-bold text-white">{{ qty }}</span>
              <button class="btn btn-link text-light p-2 text-decoration-none" (click)="incQty()">
                <i class="bi bi-plus fs-5"></i>
              </button>
            </div>
            <button class="btn-gold px-5 py-3 flex-grow-1" [disabled]="product.stockQuantity === 0" (click)="addToCart()">
              <i class="bi bi-cart-plus me-2"></i>Add to Cart
            </button>
            <button class="btn-outline-gold p-3" style="border-radius:12px" title="Add to Wishlist">
              <i class="bi bi-heart fs-5"></i>
            </button>
          </div>

          <!-- Specs table -->
          <div *ngIf="product.specification && getKeys(product.specification).length > 0">
            <h5 class="mb-3">Specifications</h5>
            <table class="table table-dark table-bordered" style="background:transparent">
              <tbody>
                <tr *ngFor="let key of getKeys(product.specification)">
                  <td class="text-muted fw-bold" style="width:40%;background:rgba(255,255,255,0.02)">{{ key }}</td>
                  <td class="ps-3 text-white">{{ product.specification[key] }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Skeleton while loading -->
    <div class="container py-5" *ngIf="!product && loading">
      <div class="row g-5">
        <div class="col-lg-5"><div class="skeleton" style="height:420px;border-radius:16px"></div></div>
        <div class="col-lg-7">
          <div class="skeleton mb-3" style="height:28px;width:60%"></div>
          <div class="skeleton mb-2" style="height:48px;width:80%"></div>
          <div class="skeleton mb-4" style="height:20px;width:40%"></div>
          <div class="skeleton" style="height:80px"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .thumb-img { border: 2px solid transparent; border-radius: 12px; transition: all 0.3s; padding: 4px; background: var(--bg-glass); }
    .thumb-img.active { border-color: var(--accent-gold); background: rgba(245, 158, 11, 0.05); }
    .qty-control { background: var(--bg-glass) !important; border: 1px solid var(--border) !important; }
    .text-primary-gold { color: var(--accent-gold); }
  `]
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  product: Product | null = null;
  loading = true;
  selectedImg = 0;
  qty = 1;
  private cartService = inject(CartService);
  private notificationService = inject(NotificationService);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.productService.getById(id).subscribe({
      next: (p) => { this.product = p; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  addToCart() {
    if (!this.product) return;
    if (this.qty > this.product.stockQuantity) {
      Swal.fire({
        title: 'Insufficient Stock',
        text: `Only ${this.product.stockQuantity} items available in stock.`,
        icon: 'warning'
      });
      return;
    }
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      Swal.fire('Authentication Required', 'Please login to add items to cart', 'info');
      return;
    }
    const user = JSON.parse(userStr);
    this.cartService.addToCart(user.profileId, {
      cartItemId: 0,
      productId: this.product.productId,
      productName: this.product.productName,
      price: this.product.price,
      quantity: this.qty,
      imageUrl: this.product.image?.[0]
    }).subscribe({
      next: () => {
        Swal.fire({
          title: 'Added!',
          text: `${this.product!.productName} added to cart`,
          icon: 'success',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000
        });
        this.notificationService.createNotification({
          userId: user.profileId,
          title: 'Item Added to Cart',
          message: `${this.product!.productName} (Qty: ${this.qty}) has been added to your shopping cart.`,
          type: 'CART'
        }).subscribe();
      },
      error: () => Swal.fire('Error', 'Could not add to cart', 'error')
    });
  }

  decQty() { if (this.qty > 1) this.qty--; }
  incQty() { 
    if (this.product && this.qty < this.product.stockQuantity) {
      this.qty++; 
    } else {
      Swal.fire({
        title: 'Limit Reached',
        text: 'Cannot add more than available stock',
        icon: 'warning',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000
      });
    }
  }

  getKeys(obj: Record<string, string>): string[] {
    return Object.keys(obj);
  }
}
