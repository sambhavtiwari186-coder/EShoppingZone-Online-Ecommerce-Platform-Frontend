import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { LoadingSpinnerComponent } from './shared/components/loading-spinner/loading-spinner.component';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent, LoadingSpinnerComponent],
  template: `
    <div class="app-container" [class.merchant-mode]="auth.getUserRole() === 'MERCHANT'">
      <app-navbar></app-navbar>
      
      <main>
        <router-outlet></router-outlet>
      </main>

      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      transition: background 0.5s ease;
    }
    .merchant-mode {
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
    }
    main {
      flex: 1;
      padding-top: 72px;
    }
  `]
})
export class AppComponent {
  auth = inject(AuthService);
}
