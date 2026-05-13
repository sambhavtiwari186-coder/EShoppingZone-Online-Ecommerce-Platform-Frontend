import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { ReviewService } from '../../../core/services/review.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container py-5">
      <div class="d-flex justify-content-between align-items-center mb-5">
        <h2 class="mb-0">My Orders</h2>
        <div class="status-tabs d-flex gap-2">
          @for (tab of tabs; track tab) {
            <button class="tab-pill" [class.active]="activeTab === tab" (click)="activeTab = tab">
              {{ tab }}
            </button>
          }
        </div>
      </div>

      <!-- Order Timeline -->
      <div class="order-timeline">
        @for (order of filteredOrders; track order.orderId) {
          <div class="glass-card p-4 mb-4 order-card">
            <div class="d-flex flex-wrap justify-content-between align-items-start gap-3">
              <div>
                <div class="mono small text-muted mb-1">#{{ order.orderId }}</div>
                <div class="text-muted small">{{ order.orderDate | date:'dd MMM yyyy' }}</div>
              </div>

              <div class="text-center">
                <div class="small text-muted mb-1">Amount</div>
                <div class="mono gold-accent fw-bold">₹{{ order.amountPaid | number:'1.0-0' }}</div>
              </div>

              <div class="text-center">
                <div class="small text-muted mb-1">Payment</div>
                <div class="small">{{ order.modeOfPayment }}</div>
              </div>

              <div>
                <span class="status-badge" [ngClass]="getStatusClass(order.orderStatus)">
                  {{ order.orderStatus }}
                </span>
              </div>

              <div class="d-flex gap-2">
                <a [routerLink]="['/orders', order.orderId]" class="btn-outline-gold py-2 px-4 small pt-2" style="border-radius:12px; display:inline-flex; align-items:center;">
                  Details
                </a>
                <button *ngIf="order.orderStatus === 'Placed'" (click)="cancelOrder(order.orderId)" class="btn btn-outline-danger py-2 px-4 small" style="border-radius:12px">
                  Cancel
                </button>
                <button *ngIf="order.orderStatus === 'Delivered' || order.orderStatus === 'DELIVERED'" (click)="writeReview(order)" class="btn btn-outline-success py-2 px-4 small" style="border-radius:12px">
                  Review
                </button>
              </div>
            </div>
          </div>
        } @empty {
          <div class="text-center py-5">
            <i class="bi bi-bag-x display-1" style="color:var(--text-muted);opacity:0.3"></i>
            <h4 class="mt-4">No orders found</h4>
            <p class="text-muted">Start shopping to see your orders here.</p>
            <a routerLink="/products" class="btn-gold px-5 mt-3 d-inline-block">Browse Products</a>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .tab-pill {
      padding: 8px 18px; border-radius: 20px;
      border: 1px solid var(--border); background: transparent;
      color: var(--text-muted); cursor: pointer; transition: all 0.3s;
    }
    .tab-pill.active { background: var(--gold-gradient); color: #000; border-color: transparent; font-weight: 600; }
    .status-badge { padding: 5px 14px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
    .status-placed { background: rgba(59,130,246,0.15); color: #3b82f6; }
    .status-shipped { background: rgba(245,158,11,0.15); color: #f59e0b; }
    .status-delivered { background: rgba(10,185,129,0.15); color: #10b981; }
    .status-cancelled { background: rgba(239,68,68,0.15); color: #ef4444; }
    .order-card { transition: all 0.3s; }
    .order-card:hover { border-color: rgba(245,158,11,0.3); }
  `]
})
export class OrderHistoryComponent implements OnInit {
  activeTab = 'All';
  tabs = ['All', 'Placed', 'Shipped', 'Delivered', 'Cancelled'];
  orders: any[] = [];
  private orderService = inject(OrderService);
  private reviewService = inject(ReviewService);

  async writeReview(order: any) {
    const { value: formValues } = await Swal.fire({
      title: 'Rate & Review',
      html: `
        <div class="mb-3 text-start">
            <label class="small text-muted mb-1">Rating (1-5 Stars)</label>
            <input id="swal-rating" type="number" min="1" max="5" class="form-control bg-dark border-secondary text-light" style="border-radius:8px" placeholder="5" value="5">
        </div>
        <div class="mb-3 text-start">
            <label class="small text-muted mb-1">Review Title</label>
            <input id="swal-title" class="form-control bg-dark border-secondary text-light" style="border-radius:8px" placeholder="e.g., Excellent product!">
        </div>
        <div class="mb-3 text-start">
            <label class="small text-muted mb-1">Review Body (Optional)</label>
            <textarea id="swal-body" class="form-control bg-dark border-secondary text-light" rows="3" style="border-radius:8px" placeholder="Write your experience..."></textarea>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Submit Review',
      confirmButtonColor: '#ffc107',
      cancelButtonColor: '#4f4f4f',
      background: '#1a1a1a',
      color: '#fff',
      preConfirm: () => {
        const rating = (document.getElementById('swal-rating') as HTMLInputElement).value;
        const title = (document.getElementById('swal-title') as HTMLInputElement).value;
        const body = (document.getElementById('swal-body') as HTMLTextAreaElement).value;
        if (!rating || Number(rating) < 1 || Number(rating) > 5) {
          Swal.showValidationMessage('Rating must be between 1 and 5');
          return false;
        }
        return { rating: Number(rating), title, body };
      }
    });

    if (formValues) {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      if (!user) return;

      const reviewDto = {
        productId: order.productId,
        orderId: order.orderId,
        customerId: user.profileId,
        customerName: user.fullName || 'Verified Customer',
        rating: formValues.rating,
        title: formValues.title || 'Review',
        body: formValues.body || ''
      };

      this.reviewService.submitReview(reviewDto).subscribe({
        next: () => Swal.fire({ title: 'Submitted!', text: 'Thank you for your review.', icon: 'success', background: '#1a1a1a', color: '#fff' }),
        error: (err) => {
          const errMsg = err.error?.message || err.error?.Message || err.error?.title || 'Failed to submit review';
          Swal.fire({ title: 'Error', text: errMsg, icon: 'error', background: '#1a1a1a', color: '#fff' });
        }
      });
    }
  }

  ngOnInit() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.loadOrders(user.profileId);
    }
  }

  loadOrders(id: number) {
    this.orderService.getOrdersByCustomer(id).subscribe(data => {
      this.orders = data.sort((a, b) => b.orderId - a.orderId); // Show newest first
    });
  }

  get filteredOrders() {
    if (this.activeTab === 'All') return this.orders;
    return this.orders.filter(o => o.orderStatus?.toLowerCase() === this.activeTab.toLowerCase());
  }

  cancelOrder(id: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: "Do you really want to cancel this order?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, cancel it!'
    }).then(result => {
      if (result.isConfirmed) {
        this.orderService.cancelOrder(id).subscribe(() => {
          Swal.fire('Cancelled!', 'Your order has been cancelled.', 'success');
          this.ngOnInit();
        });
      }
    });
  }

  getStatusClass(status: string): string {
    return 'status-' + status.toLowerCase();
  }
}
