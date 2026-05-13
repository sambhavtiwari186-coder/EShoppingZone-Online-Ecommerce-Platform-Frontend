import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { AuthService } from '../../../core/auth/auth.service';
import { OrderService } from '../../../core/services/order.service';
import { ProductService } from '../../../core/services/product.service';
import { RouterModule } from '@angular/router';
import { forkJoin, of, catchError, map } from 'rxjs';
import { ReviewService } from '../../../core/services/review.service';

@Component({
  selector: 'app-merchant-dashboard',
  standalone: true,
  imports: [CommonModule, NgChartsModule, RouterModule],
  template: `
    <div class="merchant-container p-4">
      <div class="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h2 class="mb-1 luxury-font">Merchant Dashboard</h2>
          <p class="text-muted small">Manage your storefront and monitor sales performance.</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn-outline-gold btn-sm" (click)="exportReport()"><i class="bi bi-download me-2"></i>Export Report</button>
          <button class="btn-gold btn-sm" routerLink="/merchant/inventory"><i class="bi bi-plus-lg me-2"></i>Add Product</button>
        </div>
      </div>

      <div class="row g-4 mb-4">
        @for (stat of stats; track stat.label) {
          <div class="col-md-6 col-xl-3">
            <div class="glass-card stat-card p-4">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <p class="text-muted small text-uppercase mb-1">{{ stat.label }}</p>
                  <h2 class="mono mb-0">{{ stat.value }}</h2>
                </div>
                <div class="stat-icon-wrap" [style.background]="stat.color + '20'">
                  <i [class]="'bi ' + stat.icon" [style.color]="stat.color"></i>
                </div>
              </div>
              <div class="mt-3 small">
                <span class="text-success"><i class="bi bi-arrow-up"></i> {{ stat.trend }}%</span>
                <span class="text-muted ms-1">growth this week</span>
              </div>
            </div>
          </div>
        }
      </div>

      <div class="row g-4">
        <div class="col-lg-8">
          <div class="glass-card p-4 h-100">
            <h5 class="mb-4">Inventory Insights</h5>
            <div style="height: 320px;">
              <canvas baseChart
                [data]="salesChartData"
                [options]="chartOptions"
                [type]="'line'">
              </canvas>
            </div>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="glass-card p-4 h-100">
            <h5 class="mb-4">Store Health</h5>
            <div class="store-stats">
              <div class="d-flex justify-content-between mb-3 pb-3 border-bottom border-secondary">
                <span class="text-muted">Profile Completion</span>
                <span class="text-success">95%</span>
              </div>
              <div class="d-flex justify-content-between mb-3 pb-3 border-bottom border-secondary">
                <span class="text-muted">Response Rate</span>
                <span class="text-info">100%</span>
              </div>
              <div class="d-flex justify-content-between mb-3 pb-3 border-bottom border-secondary">
                <span class="text-muted">Product Quality</span>
                <span class="text-warning">{{ productQuality }}/5</span>
              </div>
              <div class="d-flex justify-content-between">
                <span class="text-muted">Dispatch Time</span>
                <span class="text-primary">0.8 Days</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="glass-card mt-4 p-4">
         <h5 class="mb-4">Recent Stock Movements</h5>
         <div class="table-responsive">
            <table class="table table-dark table-hover mb-0">
               <thead>
                  <tr class="text-muted small text-uppercase">
                     <th>Product Name</th>
                     <th>Stock Change</th>
                     <th>Timestamp</th>
                     <th>Reason</th>
                     <th>Status</th>
                  </tr>
               </thead>
               <tbody>
                  @for (move of stockMovements; track move.product) {
                    <tr>
                       <td>{{ move.product }}</td>
                       <td [class]="move.change > 0 ? 'text-success' : 'text-danger'">
                         {{ move.change > 0 ? '+' : '' }}{{ move.change }}
                       </td>
                       <td>{{ move.time }}</td>
                       <td>{{ move.reason }}</td>
                       <td>
                          <span class="badge" [ngClass]="'bg-' + move.status.toLowerCase()">
                             {{ move.status }}
                          </span>
                       </td>
                    </tr>
                  }
               </tbody>
            </table>
         </div>
      </div>

      <div class="glass-card mt-4 p-4">
         <h5 class="mb-4">Latest Customer Reviews</h5>
         <div class="row g-4">
            @for (rev of recentReviews; track rev.reviewId) {
              <div class="col-md-6">
                <div class="review-item p-3 border border-secondary rounded">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <h6 class="mb-0 text-gold">{{ rev.customerName }}</h6>
                    <div class="text-warning small">
                      @for (star of [1,2,3,4,5]; track star) {
                        <i class="bi" [class]="star <= rev.rating ? 'bi-star-fill' : 'bi-star'"></i>
                      }
                    </div>
                  </div>
                  <p class="mb-1 fw-bold small text-info">{{ rev.productName }}</p>
                  <p class="mb-1 small fw-bold">{{ rev.title }}</p>
                  <p class="mb-0 small text-muted">{{ rev.body }}</p>
                  <div class="text-end mt-2 small text-muted font-italic">
                    {{ rev.time }}
                  </div>
                </div>
              </div>
            } @empty {
              <div class="col-12 text-center py-4 text-muted">
                No customer reviews received yet.
              </div>
            }
         </div>
      </div>
    </div>
  `,
  styles: [`
    .stat-icon-wrap {
      width: 48px; height: 48px;
      display: flex; align-items: center; justify-content: center;
      border-radius: 12px; font-size: 1.5rem;
    }
    .stat-card { border-left: 4px solid var(--accent-gold); transition: transform 0.3s; }
    .stat-card:hover { transform: translateY(-5px); }
    .badge { padding: 6px 12px; border-radius: 20px; font-weight: 500; font-size: 0.7rem; text-transform: uppercase; }
    .bg-updated { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
    .bg-sold { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
    .bg-added { background: rgba(16, 185, 129, 0.1); color: #10b981; }
    .text-gold { color: var(--accent-gold); }
    .review-item { 
      background: rgba(255,255,255,0.02);
      transition: all 0.3s ease;
    }
    .review-item:hover {
      background: rgba(255,255,255,0.05);
      border-color: var(--accent-gold) !important;
    }
    .luxury-font { font-family: 'Playfair Display', serif; }
  `]
})
export class MerchantDashboardComponent implements OnInit {
  auth = inject(AuthService);
  orderService = inject(OrderService);
  productService = inject(ProductService);
  reviewService = inject(ReviewService);

  stats = [
    { label: 'Total Sales', value: '₹0', icon: 'bi-graph-up-arrow', color: '#10B981', trend: 0 },
    { label: 'My Products', value: '0', icon: 'bi-box-seam', color: '#3B82F6', trend: 0 },
    { label: 'Pending Shipments', value: '0', icon: 'bi-clock-history', color: '#F59E0B', trend: 0 },
    { label: 'Customer Ratings', value: '0.0', icon: 'bi-star-fill', color: '#EF4444', trend: 0 }
  ];
  productQuality: string = '0.0';

  stockMovements: any[] = [];
  recentReviews: any[] = [];

  public salesChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: [35, 45, 30, 60, 50, 75, 40],
      label: 'Performance',
      borderColor: '#F59E0B',
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  public chartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6B7280' } },
      x: { grid: { display: false }, ticks: { color: '#6B7280' } }
    }
  };

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    const user = this.auth.getCurrentUser();
    if (!user?.profileId) return;

    forkJoin({
      products: this.productService.getByMerchant(user.profileId),
      orders: this.orderService.getAllOrders(),
      movements: this.productService.getStockMovements(user.profileId)
    }).subscribe({
      next: ({ products, orders, movements }) => {
        const myProductIds = new Set(products.map(p => p.productId));
        const myOrders = orders.filter(o => myProductIds.has(o.productId));

        const totalSales = myOrders.reduce((sum, o) => sum + (o.price * o.quantity), 0);
        const myProductsCount = products.length;
        const pendingShipments = myOrders.filter(o => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled').length;

        // Use real stock movements from backend
        this.stockMovements = movements.map(m => ({
          product: m.productName,
          change: m.change,
          time: new Date(m.timestamp).toLocaleString(),
          reason: m.reason,
          status: m.status
        }));

        if (products.length > 0) {
          forkJoin(
            products.map(p => this.reviewService.getAverageRating(p.productId).pipe(catchError(() => of(0))))
          ).subscribe(ratings => {
            const validRatings = ratings.filter(r => r > 0);
            const avgRating = validRatings.length > 0 ? (validRatings.reduce((a, b) => a + b, 0) / validRatings.length).toFixed(1) : 'No reviews';
            this.productQuality = validRatings.length > 0 ? avgRating : '0.0';

            this.stats = [
              { label: 'Total Sales', value: '₹' + this.formatNumber(totalSales), icon: 'bi-graph-up-arrow', color: '#10B981', trend: 0 },
              { label: 'My Products', value: myProductsCount.toString(), icon: 'bi-box-seam', color: '#3B82F6', trend: 0 },
              { label: 'Pending Shipments', value: pendingShipments.toString(), icon: 'bi-clock-history', color: '#F59E0B', trend: 0 },
              { label: 'Customer Ratings', value: avgRating.toString(), icon: 'bi-star-fill', color: '#EF4444', trend: 0 }
            ];
          });

          // Also load detailed reviews
          forkJoin(
            products.map(p => this.reviewService.getReviewsByProduct(p.productId).pipe(
              map(reviews => reviews.map((r: any) => ({ ...r, productName: p.productName }))),
              catchError(() => of([]))
            ))
          ).subscribe((allReviews: any[][]) => {
            const flattened = allReviews.reduce((acc: any[], current: any[]) => acc.concat(current), []);
            this.recentReviews = flattened
              .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 4)
              .map((r: any) => ({
                ...r,
                time: new Date(r.createdAt).toLocaleDateString()
              }));
          });
        } else {
            this.stats = [
              { label: 'Total Sales', value: '₹' + this.formatNumber(totalSales), icon: 'bi-graph-up-arrow', color: '#10B981', trend: 0 },
              { label: 'My Products', value: myProductsCount.toString(), icon: 'bi-box-seam', color: '#3B82F6', trend: 0 },
              { label: 'Pending Shipments', value: pendingShipments.toString(), icon: 'bi-clock-history', color: '#F59E0B', trend: 0 },
              { label: 'Customer Ratings', value: '0', icon: 'bi-star-fill', color: '#EF4444', trend: 0 }
            ];
        }
      },
      error: (err) => {
        console.error('Failed to load dashboard data', err);
      }
    });
  }

  private formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  exportReport() {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Metric,Value\n";
    this.stats.forEach(stat => {
      csvContent += `${stat.label},${stat.value.replace('₹', '')}\n`;
    });
    
    csvContent += "\nRecent Stock Movements\n";
    csvContent += "Product,Change,Time,Reason,Status\n";
    this.stockMovements.forEach(move => {
       csvContent += `"${move.product}","${move.change}","${move.time}","${move.reason}","${move.status}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Merchant_Report_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
