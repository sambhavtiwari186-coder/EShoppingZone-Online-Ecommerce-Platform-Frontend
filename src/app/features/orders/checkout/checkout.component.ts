import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { inject } from '@angular/core';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import { WalletService } from '../../../core/services/wallet.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ProductService } from '../../../core/services/product.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Cart } from '../../../core/models';
import Swal from 'sweetalert2';
import { forkJoin, switchMap, of } from 'rxjs';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="container py-5" style="max-width:900px">
      <h2 class="mb-5 text-center">Checkout</h2>

      <!-- Stepper -->
      <div class="stepper d-flex justify-content-center mb-5">
        @for (s of steps; track s.n; let i = $index) {
          <div class="step-item d-flex flex-column align-items-center" [class.completed]="currentStep > i" [class.active]="currentStep === i">
            <div class="step-circle mono">{{ s.n }}</div>
            <span class="small mt-2">{{ s.label }}</span>
          </div>
          @if (i < steps.length - 1) {
            <div class="step-line align-self-start mt-4 mx-2" [class.done]="currentStep > i"></div>
          }
        }
      </div>

      <!-- STEP 1: Address -->
      @if (currentStep === 0) {
        <div class="glass-card p-5">
          <h4 class="mb-4"><i class="bi bi-geo-alt me-2 gold-accent"></i>Delivery Address</h4>
          <div [formGroup]="addressForm">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="small text-muted mb-1">Full Name</label>
                <input class="form-control-dark w-100" formControlName="fullName" placeholder="John Doe">
              </div>
              <div class="col-md-6">
                <label class="small text-muted mb-1">Mobile Number</label>
                <input class="form-control-dark w-100" formControlName="mobileNumber" placeholder="9876543210">
              </div>
              <div class="col-12">
                <label class="small text-muted mb-1">Flat / House No.</label>
                <input class="form-control-dark w-100" formControlName="flatNumber" placeholder="Flat 4B, Sunrise Tower">
              </div>
              <div class="col-md-6">
                <label class="small text-muted mb-1">City</label>
                <input class="form-control-dark w-100" formControlName="city" placeholder="Mumbai">
              </div>
              <div class="col-md-3">
                <label class="small text-muted mb-1">State</label>
                <input class="form-control-dark w-100" formControlName="state" placeholder="Maharashtra">
              </div>
              <div class="col-md-3">
                <label class="small text-muted mb-1">Pincode</label>
                <input class="form-control-dark w-100" formControlName="pincode" placeholder="400001">
              </div>
            </div>
          </div>
          <div class="d-flex justify-content-end mt-4">
            <button class="btn-gold px-5 py-3" (click)="currentStep = 1">Continue <i class="bi bi-arrow-right ms-2"></i></button>
          </div>
        </div>
      }

      <!-- STEP 2: Review Items -->
      @if (currentStep === 1) {
        <div class="glass-card p-5">
          <h4 class="mb-4"><i class="bi bi-bag-check me-2 gold-accent"></i>Review Your Order</h4>
          @if (cart && cart.items.length > 0) {
            @for (item of cart.items; track item.cartItemId) {
              <div class="d-flex justify-content-between align-items-center py-2 border-bottom border-secondary">
                <div>
                  <div class="fw-semibold">{{ item.productName }}</div>
                  <div class="small text-muted">Qty: {{ item.quantity }}</div>
                </div>
                <div class="mono gold-accent">₹{{ (item.price * item.quantity) | number:'1.0-0' }}</div>
              </div>
            }
            <div class="d-flex justify-content-between mt-3 fw-bold">
              <span>Total</span>
              <span class="mono gold-accent">₹{{ cartTotal | number:'1.0-0' }}</span>
            </div>
          } @else {
            <div class="text-center py-4 text-muted">
              <i class="bi bi-bag display-3 opacity-25"></i>
              <p class="mt-3">No items in cart.</p>
            </div>
          }
          <div class="d-flex justify-content-between mt-4">
            <button class="btn-outline-gold px-4 py-2" (click)="currentStep = 0"><i class="bi bi-arrow-left me-2"></i>Back</button>
            <button class="btn-gold px-5 py-3" (click)="currentStep = 2">Continue <i class="bi bi-arrow-right ms-2"></i></button>
          </div>
        </div>
      }

      <!-- STEP 3: Payment -->
      @if (currentStep === 2) {
        <div class="glass-card p-5">
          <h4 class="mb-4"><i class="bi bi-credit-card me-2 gold-accent"></i>Choose Payment</h4>
          <div class="row g-4 mb-5">
            <div class="col-md-6">
              <div class="payment-card glass-card p-4 text-center" [class.selected]="paymentMode === 'wallet'" (click)="paymentMode = 'wallet'" style="cursor:pointer">
                <i class="bi bi-wallet2 display-4 gold-accent mb-3 d-block"></i>
                <h5>Pay with Wallet</h5>
                <p class="text-muted small mb-0">Balance: <span class="mono gold-accent">₹{{ walletBalance | number:'1.0-0' }}</span></p>
              </div>
            </div>
            <div class="col-md-6">
              <div class="payment-card glass-card p-4 text-center" [class.selected]="paymentMode === 'cod'" (click)="paymentMode = 'cod'" style="cursor:pointer">
                <i class="bi bi-cash-stack display-4 gold-accent mb-3 d-block"></i>
                <h5>Cash on Delivery</h5>
                <p class="text-muted small mb-0">Pay when you receive</p>
              </div>
            </div>
          </div>
          <div class="d-flex justify-content-between">
            <button class="btn-outline-gold px-4 py-2" (click)="currentStep = 1"><i class="bi bi-arrow-left me-2"></i>Back</button>
            <button class="btn-gold px-5 py-3" (click)="placeOrder()" [disabled]="placing">
              @if (placing) {
                <span class="spinner-border spinner-border-sm me-2"></span>Placing...
              } @else {
                <i class="bi bi-bag-check me-2"></i>Place Order — ₹{{ cartTotal | number:'1.0-0' }}
              }
            </button>
          </div>
        </div>
      }

      <!-- Success -->
      @if (orderPlaced) {
        <div class="text-center py-5 glass-card p-5 mt-4">
          <div class="success-icon mb-4">
            <i class="bi bi-check-circle-fill" style="font-size:5rem;color:var(--success)"></i>
          </div>
          <h2>Order Placed!</h2>
          <p class="text-muted mb-4">Your order has been confirmed and will be delivered soon.</p>
          <a routerLink="/orders/history" class="btn-gold px-5 py-3">View Orders</a>
        </div>
      }
    </div>
  `,
  styles: [`
    .stepper { gap: 0; }
    .step-circle {
      width: 44px; height: 44px;
      border-radius: 50%;
      border: 2px solid var(--border);
      display: flex; align-items: center; justify-content: center;
      font-size: 1rem; transition: all 0.3s;
    }
    .step-item.active .step-circle { border-color: var(--accent-gold); color: var(--accent-gold); }
    .step-item.completed .step-circle { background: var(--accent-gold); color: #000; border-color: var(--accent-gold); }
    .step-line { flex-grow: 1; height: 2px; width: 60px; background: var(--border); transition: background 0.3s; }
    .step-line.done { background: var(--accent-gold); }
    .payment-card { transition: all 0.3s; }
    .payment-card.selected { border-color: var(--accent-gold) !important; box-shadow: 0 0 20px rgba(245,158,11,0.2); }
    .success-icon { animation: popIn 0.5s ease-out; }
    @keyframes popIn { from { transform: scale(0); } to { transform: scale(1); } }
  `]
})
export class CheckoutComponent implements OnInit {
  private fb = inject(FormBuilder);
  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private walletService = inject(WalletService);
  private authService = inject(AuthService);
  private productService = inject(ProductService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  currentStep = 0;
  paymentMode = 'cod';
  orderPlaced = false;
  cart: Cart | null = null;
  userId: number | null = null;
  placing = false;
  walletBalance = 0;

  steps = [
    { n: 1, label: 'Address' },
    { n: 2, label: 'Review' },
    { n: 3, label: 'Payment' }
  ];

  addressForm = this.fb.group({
    fullName: ['', Validators.required],
    mobileNumber: ['', Validators.required],
    flatNumber: ['', Validators.required],
    city: ['', Validators.required],
    state: ['', Validators.required],
    pincode: ['', Validators.required]
  });

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (user && user.profileId) {
        this.userId = user.profileId;
        this.cartService.getCart(user.profileId).subscribe({
          next: (c) => this.cart = c,
          error: () => {}
        });
        this.walletService.getWalletById(user.profileId).subscribe({
          next: (w: any) => this.walletBalance = w?.currentBalance || 0,
          error: () => {}
        });
      }
    });
  }

  placeOrder() {
    if (!this.userId || !this.cart || this.cart.items.length === 0) {
      Swal.fire('Error', 'Cart or session not found', 'error');
      return;
    }

    if (this.paymentMode === 'wallet' && this.walletBalance < this.cartTotal) {
      Swal.fire('Error', 'Insufficient wallet balance', 'error');
      return;
    }

    this.placing = true;
    const f = this.addressForm.value;
    const address = {
      customerId: this.userId,
      fullName: f.fullName,
      mobileNumber: Number(f.mobileNumber),
      flatNumber: f.flatNumber,
      city: f.city,
      state: f.state,
      pincode: Number(f.pincode)
    };

    const orderRequests = this.cart.items.map(item => {
      const orderPayload = {
        customerId: this.userId!,
        productId: item.productId,
        productName: item.productName,
        price: item.price,
        quantity: item.quantity,
        amountPaid: item.price * item.quantity,
        modeOfPayment: this.paymentMode === 'wallet' ? 'ONLINE' : 'COD'
      };

      const order$ = this.paymentMode === 'wallet'
        ? this.orderService.onlinePayment(orderPayload)
        : this.orderService.placeOrder(orderPayload);

      return order$.pipe(
        switchMap((res: any) => {
          const orderId = res?.orderId || res?.id;
          if (orderId) {
            return this.orderService.storeAddress(orderId, address);
          }
          return of(res);
        })
      );
    });

    if (orderRequests.length === 0) {
      this.placing = false;
      return;
    }

    forkJoin(orderRequests).subscribe({
      next: () => {
        this.placing = false;
        this.orderPlaced = true;
        this.cartService.updateCart(this.userId!, []).subscribe();
        
        // Notify merchants
        if (this.cart && this.cart.items) {
          this.cart.items.forEach(item => {
             this.productService.getById(item.productId).subscribe({
                next: (product) => {
                  if (product && product.merchantId) {
                      this.notificationService.createNotification({
                         userId: product.merchantId,
                         title: 'New Order Received',
                         message: `An order for ${item.quantity}x ${product.productName} has been placed.`,
                         type: 'ORDER'
                      }).subscribe();
                      
                      const remainingStock = product.stockQuantity - item.quantity;
                      if (remainingStock <= 0) {
                          this.notificationService.createNotification({
                             userId: product.merchantId,
                             title: 'Product Out of Stock',
                             message: `Your product ${product.productName} is currently out of stock. Please replenish your inventory.`,
                             type: 'ALERT'
                          }).subscribe();
                      }
                  }
                }
             });
          });
        }
      },
      error: () => {
        this.placing = false;
        Swal.fire('Failed', 'Could not place order. Please try again.', 'error');
      }
    });
  }

  get cartTotal(): number {
    return this.cart?.items?.reduce((sum, i) => sum + i.price * i.quantity, 0) ?? 0;
  }
}
