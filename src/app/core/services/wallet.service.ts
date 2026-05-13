import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EWallet, Statement } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/wallet`;

  addNewWallet(wallet: Partial<EWallet>): Observable<any> {
    return this.http.post(`${this.apiUrl}/addNew`, wallet);
  }

  addMoney(id: number, amt: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/addMoney/${id}/${amt}`, {});
  }

  withdrawMoney(id: number, amt: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/withdrawMoney/${id}/${amt}`, {});
  }

  payMoney(id: number, amt: number, orderId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/payMoney/${id}/${amt}/${orderId}`, {});
  }

  getAllWallets(): Observable<EWallet[]> {
    return this.http.get<EWallet[]>(`${this.apiUrl}/all`);
  }

  getWalletById(id: number): Observable<EWallet> {
    return this.http.get<EWallet>(`${this.apiUrl}/${id}`);
  }

  getStatements(id: number): Observable<Statement[]> {
    return this.http.get<Statement[]>(`${this.apiUrl}/statements/${id}`);
  }

  deleteWallet(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // ── Razorpay ──────────────────────────────────────────────────────────────────

  /** Creates a Razorpay order on the backend and returns { orderId, amount, currency, key } */
  createRazorpayOrder(walletId: number, amount: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/razorpay/createOrder`, { walletId, amount });
  }

  /** Verifies payment signature on the backend and credits the wallet */
  verifyAndCredit(payload: {
    walletId: number;
    amount: number;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/razorpay/verifyAndCredit`, payload);
  }
}
