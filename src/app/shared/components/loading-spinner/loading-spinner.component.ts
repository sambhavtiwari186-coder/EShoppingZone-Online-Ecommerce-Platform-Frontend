import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-overlay" *ngIf="loadingService.loading()">
      <div class="gold-spinner"></div>
      <p class="mt-3 gold-accent mono small text-uppercase ls-2">Loading Luxury...</p>
    </div>
  `,
  styles: [`
    .loading-overlay {
      position: fixed;
      top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(10, 10, 10, 0.9);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      z-index: 9999;
      backdrop-filter: blur(10px);
    }
    .gold-spinner {
      width: 50px; height: 50px;
      border: 3px solid rgba(245, 158, 11, 0.1);
      border-top: 3px solid var(--accent-gold);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .ls-2 { letter-spacing: 2px; }
  `]
})
export class LoadingSpinnerComponent {
  loadingService = inject(LoadingService);
}
