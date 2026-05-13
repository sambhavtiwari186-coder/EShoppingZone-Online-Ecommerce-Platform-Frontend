import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  template: `
    <div class="admin-container p-4">
      <div class="row g-4 mb-4">
        <div class="col-md-6 col-xl-3" *ngFor="let stat of stats">
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
              <span class="text-muted ms-1">vs last month</span>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-4">
        <div class="col-lg-8">
          <div class="glass-card p-4">
            <h4 class="mb-4">Revenue Overview</h4>
            <div style="height: 300px;">
              <canvas baseChart
                [data]="lineChartData"
                [options]="lineChartOptions"
                [type]="'line'">
              </canvas>
            </div>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="glass-card p-4">
            <h4 class="mb-4">Sales by Category</h4>
            <div style="height: 300px;">
              <canvas baseChart
                [data]="barChartData"
                [options]="barChartOptions"
                [type]="'bar'">
              </canvas>
            </div>
          </div>
        </div>
      </div>
      
      <div class="glass-card mt-4 p-4">
         <h4 class="mb-4">Recent Orders</h4>
         <div class="table-responsive">
            <table class="table table-dark table-hover mb-0">
               <thead>
                  <tr class="text-muted small text-uppercase">
                     <th>Order ID</th>
                     <th>Customer</th>
                     <th>Date</th>
                     <th>Amount</th>
                     <th>Status</th>
                  </tr>
               </thead>
               <tbody>
                  <tr *ngFor="let order of recentOrders">
                     <td class="mono small">{{ order.id }}</td>
                     <td>{{ order.customer }}</td>
                     <td>{{ order.date }}</td>
                     <td class="gold-accent">₹{{ order.amount }}</td>
                     <td>
                        <span class="badge" [ngClass]="getStatusClass(order.status)">
                           {{ order.status }}
                        </span>
                     </td>
                  </tr>
               </tbody>
            </table>
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
    .stat-card { border-left: 4px solid var(--accent-gold); }
    .badge { padding: 6px 12px; border-radius: 20px; font-weight: 500; font-size: 0.7rem; text-transform: uppercase; }
    .bg-placed { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
    .bg-shipped { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
    .bg-delivered { background: rgba(16, 185, 129, 0.1); color: #10b981; }
  `]
})
export class AdminDashboardComponent {
  stats = [
    { label: 'Total Revenue', value: '₹14.2M', icon: 'bi-currency-rupee', color: '#F59E0B', trend: 12 },
    { label: 'Total Orders', value: '1,280', icon: 'bi-cart-check', color: '#3B82F6', trend: 8 },
    { label: 'New Customers', value: '450', icon: 'bi-people', color: '#10B981', trend: 25 },
    { label: 'Active Agents', value: '32', icon: 'bi-truck', color: '#EF4444', trend: 3 }
  ];

  recentOrders = [
    { id: '#ORD-9821', customer: 'Sambhav Jain', date: '2024-04-26', amount: '12,500', status: 'Delivered' },
    { id: '#ORD-9822', customer: 'Rahul Sharma', date: '2024-04-26', amount: '8,999', status: 'Shipped' },
    { id: '#ORD-9823', customer: 'Anita Roy', date: '2024-04-25', amount: '1,250', status: 'Placed' },
    { id: '#ORD-9824', customer: 'Vikram Singh', date: '2024-04-25', amount: '45,000', status: 'Delivered' }
  ];

  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      data: [65, 59, 80, 81, 56, 55],
      label: 'Revenue (M)',
      borderColor: '#F59E0B',
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      fill: 'origin',
      tension: 0.4
    }]
  };

  public lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6B7280' } },
      x: { grid: { display: false }, ticks: { color: '#6B7280' } }
    }
  };

  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Elec', 'Acc', 'Foot', 'Life'],
    datasets: [{
      data: [45, 25, 15, 15],
      backgroundColor: ['#F59E0B', '#3B82F6', '#10B981', '#EF4444']
    }]
  };

  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } }
  };

  getStatusClass(status: string) {
    return 'bg-' + status.toLowerCase();
  }
}
