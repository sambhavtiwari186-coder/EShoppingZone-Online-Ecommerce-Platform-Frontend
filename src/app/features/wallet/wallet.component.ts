import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WalletService } from '../../core/services/wallet.service';
import { EWallet } from '../../core/models';
import Swal from 'sweetalert2';

// Tell TypeScript that Razorpay is loaded globally from checkout.js
declare const Razorpay: any;

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container py-5">
      <div class="row g-4">
        <!-- BALANCE CARD -->
        <div class="col-lg-5">
          <div class="glass-card balance-card p-5 text-center text-lg-start h-100 d-flex flex-column justify-content-center">
            <span class="text-muted small text-uppercase ls-2 mb-2">Total Balance</span>
            <h1 class="display-3 mb-4 mono gold-accent">₹{{ wallet?.currentBalance | number:'1.2-2' }}</h1>

            <div class="d-flex flex-wrap gap-3 justify-content-center justify-content-lg-start">
              <button class="btn-gold px-4" (click)="addMoneyViaRazorpay()" [disabled]="loading">
                <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                Add Money
              </button>
              <button class="btn-outline-gold px-4" (click)="withdraw()">Withdraw</button>
            </div>

            <!-- Razorpay Badge -->
            <div class="mt-4 d-flex align-items-center gap-2">
              <img src="https://razorpay.com/favicon.png" width="18" height="18" alt="Razorpay" />
              <span class="text-muted" style="font-size:0.72rem;">Secured by Razorpay</span>
              <span class="badge bg-success" style="font-size:0.6rem;">TEST MODE</span>
            </div>
          </div>
        </div>

        <!-- QUICK STATS -->
        <div class="col-lg-7">
          <div class="row g-4 h-100">
             <div class="col-6">
                <div class="glass-card p-4 h-100">
                   <p class="text-muted small mb-1">Monthly Spent</p>
                   <h3 class="mono mb-0">₹{{ monthlySpent | number:'1.2-2' }}</h3>
                </div>
             </div>
             <div class="col-6">
                <div class="glass-card p-4 h-100">
                   <p class="text-muted small mb-1">Total Transactions</p>
                   <h3 class="mono mb-0" style="color: #10B981;">{{ transactions.length }}</h3>
                </div>
             </div>
             <div class="col-12">
                <div class="glass-card p-4 h-100 d-flex align-items-center justify-content-between">
                   <div>
                       <h5 class="mb-1">Tier Status: GOLD</h5>
                       <p class="text-muted small mb-0">You're ₹500 away from Platinum</p>
                   </div>
                   <div class="tier-icon">
                      <i class="bi bi-award-fill display-4 gold-accent"></i>
                   </div>
                </div>
             </div>
          </div>
        </div>

        <!-- TRANSACTIONS TABLE -->
        <div class="col-12 mt-4">
          <div class="glass-card p-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <h4 class="mb-0">Transaction History</h4>
              <span class="text-muted small">{{ transactions.length }} transactions</span>
            </div>

            <div *ngIf="transactions.length === 0" class="text-center py-5 text-muted">
              <i class="bi bi-receipt display-4 d-block mb-3"></i>
              <p>No transactions yet. Add money to get started!</p>
            </div>

            <div class="table-responsive" *ngIf="transactions.length > 0">
              <table class="table table-dark table-hover mb-0">
                <thead>
                  <tr class="text-muted small text-uppercase">
                    <th>Transaction ID</th>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Type</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let t of transactions">
                    <td class="mono small">{{ t.id }}</td>
                    <td>{{ t.date | date:'dd MMM yyyy, h:mm a' }}</td>
                    <td>{{ t.description }}</td>
                    <td>
                      <span class="badge" [ngClass]="t.amount > 0 ? 'bg-credit' : 'bg-debit'">
                        {{ t.amount > 0 ? 'CREDIT' : 'DEBIT' }}
                      </span>
                    </td>
                    <td class="mono" [ngClass]="t.amount > 0 ? 'text-success' : 'text-danger'">
                      {{ t.amount > 0 ? '+' : '' }}₹{{ t.amount | number:'1.2-2' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .balance-card {
        background: radial-gradient(circle at 90% 10%, rgba(245, 158, 11, 0.15) 0%, transparent 40%), var(--bg-glass);
        border-left: 6px solid var(--accent-gold);
    }
    .ls-2 { letter-spacing: 2px; }
    .badge { padding: 4px 10px; border-radius: 12px; font-size: 0.65rem; }
    .bg-credit { background: rgba(16, 185, 129, 0.1); color: #10b981; }
    .bg-debit { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
    .btn-gold:disabled { opacity: 0.7; cursor: not-allowed; }
  `]
})
export class WalletComponent implements OnInit {
  private walletService = inject(WalletService);
  wallet: EWallet | null = null;
  transactions: any[] = [];
  loading = false;

  get monthlySpent(): number {
    const now = new Date();
    return this.transactions
      .filter(t => t.amount < 0 && new Date(t.date).getMonth() === now.getMonth())
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }

  ngOnInit() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.loadWalletData(user.profileId);
    }
  }

  loadWalletData(id: number) {
    this.walletService.getWalletById(id).subscribe({
      next: (data: EWallet) => {
        this.wallet = data;
        this.transactions = (data.statements ?? []).map((s: any) => ({
          id: s.statementId ? `#TXN-${s.statementId}` : `#TXN-${Math.floor(Math.random()*10000)}`,
          date: s.dateTime,
          description: s.transactionRemarks,
          amount: s.transactionType === 'CREDIT' ? s.amount : -s.amount
        })).reverse();
      },
      error: (err) => {
        if (err.status === 404) {
          this.walletService.addNewWallet({ walletId: id, currentBalance: 0, statements: [] }).subscribe({
            next: () => this.loadWalletData(id),
            error: () => Swal.fire('Error', 'Could not initialize wallet', 'error')
          });
        }
      }
    });
  }

  // ── Razorpay Payment Flow ─────────────────────────────────────────────────────

  async addMoneyViaRazorpay() {
    // 1. Ask user for the amount first
    const { value: amountStr } = await Swal.fire({
      title: 'Add Money to Wallet',
      html: `
        <p class="text-muted mb-3">Enter the amount you want to add via Razorpay</p>
        <div class="input-group">
          <span class="input-group-text">₹</span>
          <input id="rzp-amount" type="number" class="form-control" placeholder="e.g. 500" min="1" />
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Proceed to Pay',
      confirmButtonColor: '#f59e0b',
      preConfirm: () => {
        const val = (document.getElementById('rzp-amount') as HTMLInputElement)?.value;
        if (!val || Number(val) <= 0) {
          Swal.showValidationMessage('Please enter a valid amount (minimum ₹1)');
          return false;
        }
        return val;
      }
    });

    if (!amountStr || !this.wallet) return;
    const amount = Number(amountStr);

    this.loading = true;

    // 2. Create Razorpay order on the backend
    this.walletService.createRazorpayOrder(this.wallet.walletId, amount).subscribe({
      next: (orderData) => {
        this.loading = false;
        this.openRazorpayCheckout(orderData, amount);
      },
      error: (err) => {
        this.loading = false;
        Swal.fire('Error', err.error?.message || 'Could not initiate payment. Please try again.', 'error');
      }
    });
  }

  private openRazorpayCheckout(orderData: any, amount: number) {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : {};

    const options = {
      key: orderData.key,                     // rzp_test_SlLLCxhxnVYSbU
      amount: orderData.amount * 100,         // in paise
      currency: 'INR',
      name: 'EShoppingZone Wallet',
      description: `Add ₹${amount} to your wallet`,
      order_id: orderData.orderId,
      image: 'https://i.imgur.com/n5tjHFD.png', // logo (optional)
      prefill: {
        name: user.fullName ?? '',
        email: user.emailId ?? '',
      },
      theme: { color: '#f59e0b' },
      modal: {
        ondismiss: () => {
          Swal.fire({
            title: 'Payment Cancelled',
            text: 'You cancelled the payment. No money was added.',
            icon: 'warning',
            confirmButtonColor: '#f59e0b'
          });
        }
      },
      handler: (response: any) => {
        // 3. Verify payment + credit wallet on backend
        this.walletService.verifyAndCredit({
          walletId: this.wallet!.walletId,
          amount,
          razorpayOrderId:   response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature
        }).subscribe({
          next: (res) => {
            Swal.fire({
              title: '💰 Money Added!',
              text: res.message || `₹${amount} added to your wallet successfully!`,
              icon: 'success',
              confirmButtonColor: '#f59e0b'
            });
            this.loadWalletData(this.wallet!.walletId);
          },
          error: (err) => {
            Swal.fire('Verification Failed', err.error?.message || 'Payment received but wallet update failed. Contact support.', 'error');
          }
        });
      }
    };

    const rzp = new Razorpay(options);
    rzp.on('payment.failed', (response: any) => {
      Swal.fire('Payment Failed', response.error?.description ?? 'Payment failed. Please try again.', 'error');
    });
    rzp.open();
  }

  // ── Withdraw ──────────────────────────────────────────────────────────────────

  async withdraw() {
    const { value: amount } = await Swal.fire({
      title: 'Withdraw Money',
      input: 'number',
      inputLabel: 'Enter amount to withdraw',
      inputPlaceholder: 'e.g. 500',
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value || Number(value) <= 0) return 'Please enter a valid amount';
        if (this.wallet && Number(value) > this.wallet.currentBalance) return 'Insufficient balance';
        return null;
      }
    });

    if (amount && this.wallet) {
      this.walletService.withdrawMoney(this.wallet.walletId, Number(amount)).subscribe({
        next: () => {
          Swal.fire('Success', 'Withdrawal successful!', 'success');
          this.loadWalletData(this.wallet!.walletId);
        },
        error: (err) => Swal.fire('Error', err.error || 'Could not withdraw money', 'error')
      });
    }
  }
}
