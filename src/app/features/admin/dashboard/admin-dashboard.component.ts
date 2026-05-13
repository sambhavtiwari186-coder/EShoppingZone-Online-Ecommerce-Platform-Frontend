import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="admin-container p-4">
      <div class="mb-5">
        <h2 class="lux-font mb-1">Platform Control Center</h2>
        <p class="text-muted small">Global overview and management for EShoppingZone.</p>
      </div>

      <!-- Analytics Cards -->
      <div class="row g-4 mb-5">
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
            </div>
          </div>
        }
      </div>

      <!-- Tabs for management -->
      <div class="glass-card p-0 mb-4">
        <div class="d-flex border-bottom border-secondary">
          <button class="tab-btn" [class.active]="activeTab === 'users'" (click)="activeTab = 'users'">User Accounts</button>
          <button class="tab-btn" [class.active]="activeTab === 'orders'" (click)="activeTab = 'orders'">Global Orders</button>
          <button class="tab-btn" [class.active]="activeTab === 'agents'" (click)="activeTab = 'agents'">Delivery Agents</button>
          <button class="tab-btn" [class.active]="activeTab === 'analytics'" (click)="activeTab = 'analytics'">Top Products</button>
        </div>

        <div class="p-4">
          <!-- Users Tab -->
          @if (activeTab === 'users') {
            <div class="table-responsive">
              <table class="table table-dark table-hover mb-0">
                <thead>
                  <tr class="text-muted small text-uppercase">
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (user of users; track user.profileId) {
                    <tr>
                      <td>{{ user.fullName }}</td>
                      <td>{{ user.emailId }}</td>
                      <td><span class="badge bg-secondary">{{ user.role }}</span></td>
                      <td>
                        <span class="badge" [class]="user.isSuspended ? 'bg-danger' : 'bg-success'">
                          {{ user.isSuspended ? 'Suspended' : 'Active' }}
                        </span>
                      </td>
                      <td>
                        <div class="btn-group">
                          @if (user.isSuspended) {
                            <button class="btn btn-sm btn-outline-success" (click)="reactivate(user.profileId)">Reactivate</button>
                          } @else {
                            <button class="btn btn-sm btn-outline-warning" (click)="suspend(user.profileId)">Suspend</button>
                          }
                          <button class="btn btn-sm btn-outline-danger" (click)="deleteUser(user.profileId)">Delete</button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }

          <!-- Orders Tab -->
          @if (activeTab === 'orders') {
            <div class="table-responsive">
              <table class="table table-dark table-hover mb-0">
                <thead>
                  <tr class="text-muted small text-uppercase">
                    <th>Order #</th>
                    <th>Product</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Update</th>
                  </tr>
                </thead>
                <tbody>
                  @for (order of orders; track order.orderId) {
                    <tr>
                      <td class="mono small">#{{ order.orderId }}</td>
                      <td>{{ order.productName }}</td>
                      <td>{{ order.customerId }}</td>
                      <td class="mono">₹{{ order.amountPaid }}</td>
                      <td>
                        <span class="badge" [ngClass]="getStatusClass(order.orderStatus)">
                          {{ order.orderStatus }}
                        </span>
                      </td>
                      <td>
                         <select (change)="updateStatus(order.orderId, $any($event.target).value)" class="form-select-dark btn-sm">
                            <option value="">Change Status</option>
                            <option value="Placed">Placed</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                         </select>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }

          <!-- Agents Tab -->
          @if (activeTab === 'agents') {
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5>Delivery Agent Profiles</h5>
              <button class="btn-gold btn-sm" (click)="showAgentModal = true">Register New Agent</button>
            </div>
             <div class="table-responsive">
              <table class="table table-dark table-hover mb-0">
                <thead>
                  <tr class="text-muted small text-uppercase">
                    <th>Agent Name</th>
                    <th>Vehicle</th>
                    <th>Area</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (agent of agents; track agent.agentId) {
                    <tr>
                      <td>{{ agent.fullName }}</td>
                      <td>{{ agent.vehicleType }} ({{ agent.vehicleNumber }})</td>
                      <td>{{ agent.serviceArea }}</td>
                      <td><span class="badge bg-info">{{ agent.status }}</span></td>
                      <td>
                        <button class="btn btn-sm btn-outline-danger" (click)="deleteAgent(agent.agentId)">Remove</button>
                      </td>
                    </tr>
                  } @empty {
                    <tr><td colspan="5" class="text-center text-muted py-4">No agents registered.</td></tr>
                  }
                </tbody>
              </table>
            </div>
          }

          <!-- Top Products Tab -->
          @if (activeTab === 'analytics') {
             <div class="row g-4">
                @for (prod of topProducts; track prod.productId) {
                   <div class="col-md-6 col-lg-4">
                      <div class="glass-card p-3 border-gold">
                         <h6 class="mb-1">{{ prod.productName }}</h6>
                         <p class="text-muted small mb-0">Product ID: #{{ prod.productId }}</p>
                         <div class="mt-2 text-gold fw-bold">{{ prod.count }} units sold</div>
                      </div>
                   </div>
                }
             </div>
          }
        </div>
      </div>

       <!-- Agent Registration Modal -->
      @if (showAgentModal) {
        <div class="modal-overlay">
          <div class="glass-card modal-content p-4">
            <h4 class="mb-4 lux-font">Register Delivery Agent</h4>
            <form [formGroup]="agentForm" (ngSubmit)="saveAgent()">
              <div class="row g-3">
                <div class="col-md-12">
                  <label class="form-label small text-muted text-uppercase fw-bold">Full Name</label>
                  <input type="text" formControlName="fullName" class="form-control-dark w-100">
                </div>
                <div class="col-md-6">
                  <label class="form-label small text-muted text-uppercase fw-bold">Vehicle Number</label>
                  <input type="text" formControlName="vehicleNumber" class="form-control-dark w-100">
                </div>
                <div class="col-md-6">
                  <label class="form-label small text-muted text-uppercase fw-bold">Vehicle Type</label>
                  <input type="text" formControlName="vehicleType" class="form-control-dark w-100">
                </div>
                <div class="col-12">
                  <label class="form-label small text-muted text-uppercase fw-bold">Service Area</label>
                  <input type="text" formControlName="serviceArea" class="form-control-dark w-100">
                </div>
              </div>
              <div class="d-flex justify-content-end gap-2 mt-4">
                <button type="button" class="btn btn-outline-light" (click)="showAgentModal = false">Cancel</button>
                <button type="submit" class="btn-gold" [disabled]="agentForm.invalid">Register Agent</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .admin-container { color: #f8f9fa; min-height: 100vh; }
    .lux-font { font-family: 'Playfair Display', serif; }
    .tab-btn {
      padding: 15px 25px; border: none; background: transparent; color: #6B7280;
      font-weight: 500; font-size: 0.9rem; transition: all 0.3s;
    }
    .tab-btn:hover { color: #fff; }
    .tab-btn.active { color: var(--accent-gold); border-bottom: 2px solid var(--accent-gold); }
    .stat-icon-wrap {
      width: 48px; height: 48px; display: flex; align-items: center; justify-content: center;
      border-radius: 12px; font-size: 1.5rem;
    }
    .border-gold { border: 1px solid rgba(245, 158, 11, 0.2); }
    .btn-outline-gold { border: 1px solid var(--accent-gold); color: var(--accent-gold); }
    .bg-placed { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
    .bg-shipped { background: rgba(167, 139, 250, 0.1); color: #a78bfa; }
    .bg-delivered { background: rgba(16, 185, 129, 0.1); color: #10b981; }
    .bg-cancelled { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
    .modal-overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.8); backdrop-filter: blur(5px);
      display: flex; align-items: center; justify-content: center; z-index: 1000;
    }
    .modal-content { width: 100%; max-width: 500px; }
    .form-select-dark {
      background-color: #1f2937; border: 1px solid #374151; color: white;
      padding: 5px; border-radius: 4px; outline: none;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);
  private fb = inject(FormBuilder);

  activeTab = 'users';
  stats: any[] = [];
  users: any[] = [];
  orders: any[] = [];
  agents: any[] = [];
  topProducts: any[] = [];
  showAgentModal = false;

  agentForm = this.fb.group({
    fullName: ['', Validators.required],
    vehicleNumber: ['', Validators.required],
    vehicleType: ['', Validators.required],
    serviceArea: ['', Validators.required]
  });

  ngOnInit() {
    this.loadStats();
    this.loadUsers();
    this.loadOrders();
    this.loadAgents();
  }

  loadStats() {
    this.adminService.getAnalytics().subscribe(data => {
      this.stats = [
        { label: 'Total Users', value: data.totalUsers, icon: 'bi-people', color: '#10B981' },
        { label: 'Total Orders', value: data.totalOrders, icon: 'bi-cart-check', color: '#3B82F6' },
        { label: 'Global Revenue', value: '₹' + this.formatNumber(data.totalRevenue), icon: 'bi-bank', color: '#F59E0B' },
        { label: 'Top Product Hits', value: data.topProducts.length, icon: 'bi-award', color: '#EF4444' }
      ];
      this.topProducts = data.topProducts;
    });
  }

  loadUsers() {
    this.adminService.getAllUsers().subscribe(data => this.users = data);
  }

  loadOrders() {
    this.adminService.getAllOrders().subscribe(data => {
      this.orders = data.sort((a,b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
    });
  }

  loadAgents() {
    this.adminService.getAllAgents().subscribe(data => this.agents = data);
  }

  suspend(id: number) {
    this.adminService.suspendUser(id).subscribe(() => {
      Swal.fire('Suspended', 'User account deactivated.', 'info');
      this.loadUsers();
      this.loadStats();
    });
  }

  reactivate(id: number) {
    this.adminService.reactivateUser(id).subscribe(() => {
      Swal.fire('Reactivated', 'User account reinstated.', 'success');
      this.loadUsers();
    });
  }

  deleteUser(id: number) {
    Swal.fire({
      title: 'Delete user?',
      icon: 'warning',
      showCancelButton: true
    }).then(res => {
      if (res.isConfirmed) {
        this.adminService.deleteUser(id).subscribe(() => {
          Swal.fire('Deleted', 'Account removed.', 'error');
          this.loadUsers();
          this.loadStats();
        });
      }
    });
  }

  updateStatus(orderId: number, status: string) {
    if (!status) return;
    this.adminService.updateOrderStatus(orderId, status).subscribe(() => {
      Swal.fire('Updated', `Order #${orderId} is now ${status}`, 'success');
      this.loadOrders();
      this.loadStats();
    });
  }

  saveAgent() {
    if (this.agentForm.invalid) return;
    this.adminService.registerAgent(this.agentForm.value).subscribe(() => {
      Swal.fire('Registered', 'Delivery agent profile created.', 'success');
      this.showAgentModal = false;
      this.agentForm.reset();
      this.loadAgents();
    });
  }

  deleteAgent(id: number) {
    this.adminService.deleteAgent(id).subscribe(() => {
      this.loadAgents();
    });
  }

  private formatNumber(num: number): string {
    if (num >= 100000) return (num / 100000).toFixed(1) + 'L';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }

  getStatusClass(status: string): string {
    return 'bg-' + status.toLowerCase();
  }
}
