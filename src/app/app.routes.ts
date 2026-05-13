import { Routes } from '@angular/router';
import { AuthGuard } from './core/auth/auth.guard';
import { RoleGuard } from './core/auth/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { 
    path: 'home', 
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) 
  },
  { 
    path: 'auth/login', 
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) 
  },
  { 
    path: 'auth/register', 
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) 
  },
  { 
    path: 'auth/github-callback', 
    loadComponent: () => import('./features/auth/github-callback/github-callback.component').then(m => m.GithubCallbackComponent) 
  },
  { 
    path: 'products', 
    loadComponent: () => import('./features/products/product-list/product-list.component').then(m => m.ProductListComponent) 
  },
  { 
    path: 'products/:id', 
    loadComponent: () => import('./features/products/product-detail/product-detail.component').then(m => m.ProductDetailComponent) 
  },
  { 
    path: 'cart', 
    loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent),
    canActivate: [AuthGuard] 
  },
  { 
    path: 'orders/checkout', 
    loadComponent: () => import('./features/orders/checkout/checkout.component').then(m => m.CheckoutComponent),
    canActivate: [AuthGuard] 
  },
  { 
    path: 'orders/history', 
    loadComponent: () => import('./features/orders/order-history/order-history.component').then(m => m.OrderHistoryComponent),
    canActivate: [AuthGuard] 
  },
  { 
    path: 'orders/:id', 
    loadComponent: () => import('./features/orders/order-detail/order-detail.component').then(m => m.OrderDetailComponent),
    canActivate: [AuthGuard] 
  },
  { 
    path: 'wallet', 
    loadComponent: () => import('./features/wallet/wallet.component').then(m => m.WalletComponent),
    canActivate: [AuthGuard] 
  },
  { 
    path: 'notifications', 
    loadComponent: () => import('./features/notifications/notifications.component').then(m => m.NotificationsComponent),
    canActivate: [AuthGuard] 
  },
  { 
    path: 'merchant/dashboard', 
    loadComponent: () => import('./features/merchant/dashboard/merchant-dashboard.component').then(m => m.MerchantDashboardComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['MERCHANT'] }
  },
  { 
    path: 'merchant/inventory', 
    loadComponent: () => import('./features/merchant/inventory/merchant-inventory.component').then(m => m.MerchantInventoryComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['MERCHANT'] }
  },
  { 
    path: 'admin', 
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
    canActivate: [AuthGuard, RoleGuard], 
    data: { roles: ['ADMIN'] } 
  },
  { path: '**', redirectTo: 'home' }
];
