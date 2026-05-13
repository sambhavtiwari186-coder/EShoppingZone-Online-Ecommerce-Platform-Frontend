import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/auth/auth.service';
import { Notification as AppNotification } from '../../core/models';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container py-5">
      <div class="d-flex justify-content-between align-items-center mb-5 flex-wrap gap-3">
        <h2 class="mb-0">Notifications</h2>
        <button class="btn-outline-gold py-2 px-4 small" (click)="markAllRead()">
          <i class="bi bi-check2-all me-2"></i>Mark All Read
        </button>
      </div>

      <!-- Filter Tabs -->
      <div class="d-flex gap-2 mb-4 flex-wrap">
        @for (tab of tabs; track tab) {
          <button class="tab-pill" [class.active]="activeTab === tab" (click)="activeTab = tab">
            {{ tab }}
          </button>
        }
      </div>

      <!-- Notification List -->
      <div class="notification-list">
        @for (n of filteredNotifications; track n.notificationId) {
          <div class="glass-card notification-item p-4 mb-3 d-flex align-items-start gap-4" [class.unread]="!n.isRead">
            <div class="notif-icon" [ngStyle]="{'background': getIconBg(n.type)}">
              <i class="bi" [ngClass]="getIcon(n.type)" [ngStyle]="{'color': getIconColor(n.type)}"></i>
            </div>
            <div class="flex-grow-1">
              <div class="d-flex justify-content-between align-items-start">
                <h6 class="mb-1">{{ n.title }}</h6>
                <span class="small text-muted text-nowrap ms-3">{{ n.createdAt | date:'short' || 'Just now' }}</span>
              </div>
              <p class="text-muted small mb-0">{{ n.message }}</p>
            </div>
            <div class="d-flex flex-column gap-2 align-items-end">
              @if (!n.isRead) {
                <button class="btn btn-sm btn-outline-gold px-2 py-1" (click)="markRead(n.notificationId)" title="Mark as Read">
                  <i class="bi bi-check2"></i> <span class="d-none d-md-inline ms-1">Read</span>
                </button>
              }
              <button class="btn btn-link text-danger p-0" (click)="deleteNotif(n.notificationId)" title="Delete">
                <i class="bi bi-trash small"></i>
              </button>
            </div>
          </div>
        } @empty {
          <div class="text-center py-5 glass-card">
            <i class="bi bi-bell-slash display-1" style="color:var(--text-muted);opacity:0.3"></i>
            <h4 class="mt-4">All Caught Up!</h4>
            <p class="text-muted">No notifications to show for the selected category.</p>
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
    .notification-item { transition: all 0.3s; border-left: 3px solid transparent; }
    .notification-item.unread { border-left-color: var(--accent-gold); }
    .notif-icon {
      width: 44px; height: 44px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; font-size: 1.1rem;
    }
    .unread-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: var(--accent-gold);
    }
  `]
})
export class NotificationsComponent implements OnInit {
  private service = inject(NotificationService);
  private auth = inject(AuthService);

  activeTab = 'All';
  tabs = ['All', 'Unread', 'Orders', 'Wallet'];
  allNotifications: AppNotification[] = [];
  userId: number | null = null;

  ngOnInit() {
    this.auth.currentUser$.subscribe(user => {
      if (user && user.profileId) {
        this.userId = user.profileId;
        this.loadNotifs();
      }
    });
  }

  loadNotifs() {
    if (!this.userId) return;
    this.service.getNotifications(this.userId).subscribe(data => {
      this.allNotifications = data.reverse(); // Newest first
      this.service.refreshUnreadCount(this.userId!);
    });
  }

  get filteredNotifications() {
    if (this.activeTab === 'Unread') return this.allNotifications.filter(n => !n.isRead);
    if (this.activeTab === 'Orders') return this.allNotifications.filter(n => n.type === 'ORDER');
    if (this.activeTab === 'Wallet') return this.allNotifications.filter(n => n.type === 'WALLET');
    return this.allNotifications;
  }

  markRead(id: number) {
    this.service.markAsRead(id).subscribe(() => {
      this.loadNotifs();
    });
  }

  markAllRead() {
    if (this.userId) {
      this.service.markAllAsRead(this.userId).subscribe(() => {
        this.loadNotifs();
      });
    }
  }

  deleteNotif(id: number) {
    this.service.deleteNotification(id).subscribe(() => {
      this.loadNotifs();
    });
  }

  getIcon(type: string | undefined): string {
    const map: Record<string, string> = { ORDER: 'bi-bag-check', WALLET: 'bi-wallet2', PROMO: 'bi-tag', CART: 'bi-cart-check', ALERT: 'bi-exclamation-triangle' };
    return map[type || ''] || 'bi-bell';
  }
  getIconBg(type: string | undefined): string {
    const map: Record<string, string> = { ORDER: 'rgba(59,130,246,0.1)', WALLET: 'rgba(16,185,129,0.1)', PROMO: 'rgba(245,158,11,0.1)', CART: 'rgba(245,158,11,0.1)', ALERT: 'rgba(239,68,68,0.1)' };
    return map[type || ''] || 'rgba(255,255,255,0.05)';
  }
  getIconColor(type: string | undefined): string {
    const map: Record<string, string> = { ORDER: '#3b82f6', WALLET: '#10b981', PROMO: '#f59e0b', CART: '#f59e0b', ALERT: '#ef4444' };
    return map[type || ''] || '#6b7280';
  }
}
