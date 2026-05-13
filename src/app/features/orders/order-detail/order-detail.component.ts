import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container py-5" style="max-width:800px">
      <a routerLink="/orders/history" class="text-muted text-decoration-none small d-inline-flex align-items-center mb-4">
        <i class="bi bi-arrow-left me-2"></i>Back to Orders
      </a>

      <div *ngIf="order" class="glass-card p-5">
        <!-- Header -->
        <div class="d-flex justify-content-between align-items-start mb-5 flex-wrap gap-3">
          <div>
            <p class="text-muted small mb-1">Order ID</p>
            <h2 class="mono mb-0">#{{ order.orderId }}</h2>
          </div>
          <span class="status-badge" [ngClass]="'status-' + order.orderStatus.toLowerCase()">
            {{ order.orderStatus.toUpperCase() }}
          </span>
        </div>

        <!-- Status Timeline -->
        <div class="status-timeline mb-5">
          <div class="timeline-step" [class.done]="true">
              <div class="tl-dot"></div>
              <div class="tl-content ms-3">
                <div class="fw-600">Order Placed</div>
                <div class="small text-muted">{{ order.orderDate | date:'MMM dd, yyyy · hh:mm a' }}</div>
              </div>
          </div>
          <div class="timeline-step" [class.done]="order.orderStatus !== 'Cancelled'">
              <div class="tl-dot"></div>
              <div class="tl-content ms-3">
                <div class="fw-600">
                    {{ order.orderStatus === 'Cancelled' ? 'Cancelled' : 'Processed' }}
                </div>
                <div class="small text-muted">
                    {{ order.orderStatus === 'Cancelled' ? 'Payment Refunded' : 'Order is being processed' }}
                </div>
              </div>
          </div>
        </div>

        <!-- Order Info -->
        <div class="mb-4">
            <h5 class="mb-3">Item Details</h5>
            <div class="glass-card p-3 d-flex justify-content-between align-items-center mb-1">
                <div>
                    <h6 class="mb-1">{{ order.productName }}</h6>
                    <p class="text-muted small mb-0">Quantity: {{ order.quantity }} × ₹{{ order.price | number:'1.0-0' }}</p>
                </div>
                <div class="mono gold-accent fw-bold">₹{{ order.amountPaid | number:'1.0-0' }}</div>
            </div>
        </div>

        <!-- Address & Payment -->
        <div class="row g-4">
          <div class="col-md-6">
            <h5 class="mb-3">Delivery Address</h5>
            @if (order.address) {
                <div class="glass-card p-3 small text-muted">
                    <p class="mb-1 text-light fw-600">{{ order.address.fullName }}</p>
                    <p class="mb-1">{{ order.address.flatNumber }}</p>
                    <p class="mb-1">{{ order.address.city }}, {{ order.address.state }} {{ order.address.pincode }}</p>
                    <p class="mb-0">Contact: {{ order.address.mobileNumber }}</p>
                </div>
            } @else {
                <div class="glass-card p-3 small text-muted italic">Address info not available</div>
            }
          </div>
          <div class="col-md-6">
            <h5 class="mb-3">Payment Info</h5>
            <div class="glass-card p-3">
              <div class="d-flex justify-content-between mb-2">
                <span class="text-muted small">Method</span>
                <span class="small">{{ order.modeOfPayment }}</span>
              </div>
              <div class="d-flex justify-content-between">
                <span class="text-muted small">Total Paid</span>
                <span class="mono gold-accent fw-bold">₹{{ order.amountPaid | number:'1.2-2' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Cancel Button -->
        <div *ngIf="order.orderStatus === 'Placed'" class="mt-5 text-end">
          <button (click)="cancelOrder()" class="btn btn-outline-danger px-4 py-2">
            <i class="bi bi-x-circle me-2"></i>Cancel Order
          </button>
        </div>
      </div>

      <div *ngIf="loading" class="text-center py-5">
          <div class="spinner-border gold-accent"></div>
      </div>
    </div>
  `,
  styles: [`
    .status-badge { padding: 8px 18px; border-radius: 20px; font-weight: 700; font-size: 0.75rem; text-transform: uppercase; }
    .status-placed { background: rgba(59,130,246,0.15); color: #3b82f6; }
    .status-cancelled { background: rgba(239,68,68,0.15); color: #ef4444; }
    .status-delivered { background: rgba(16,185,129,0.15); color: #10B981; }
    .status-timeline { display: flex; flex-direction: column; gap: 24px; }
    .timeline-step { display: flex; align-items: flex-start; }
    .tl-dot {
      width: 16px; height: 16px; border-radius: 50%;
      border: 2px solid var(--border); flex-shrink: 0; margin-top: 3px;
      transition: all 0.3s;
    }
    .timeline-step.done .tl-dot { background: var(--accent-gold); border-color: var(--accent-gold); }
    .fw-600 { font-weight: 600; }
  `]
})
export class OrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orderService = inject(OrderService);
  
  order: any | null = null;
  loading = true;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadOrder(Number(id));
    }
  }

  loadOrder(id: number) {
    this.loading = true;
    const userStr = localStorage.getItem('user');
    const userId = userStr ? JSON.parse(userStr).profileId : 0;
    
    this.orderService.getOrdersByCustomer(userId).subscribe({
      next: (orders: any[]) => {
        this.order = orders.find(o => o.orderId === id);
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  cancelOrder() {
    if (!this.order) return;

    Swal.fire({
      title: 'Are you sure?',
      text: "You will receive a refund to your wallet if paid online.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, cancel it!',
      confirmButtonColor: '#ef4444'
    }).then((result) => {
      if (result.isConfirmed) {
        this.orderService.cancelOrder(this.order.orderId).subscribe({
          next: () => {
            Swal.fire('Cancelled!', 'Your order has been cancelled.', 'success');
            this.loadOrder(this.order.orderId);
          },
          error: (err) => Swal.fire('Error', err.error?.message || 'Could not cancel order', 'error')
        });
      }
    });
  }
}
