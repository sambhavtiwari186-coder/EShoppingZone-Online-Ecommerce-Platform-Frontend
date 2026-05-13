import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private profileUrl = `${environment.apiUrl}/api/profiles`;
  private orderUrl = `${environment.apiUrl}/api/orders`;

  // User Management
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.profileUrl}/all`);
  }

  suspendUser(id: number): Observable<any> {
    return this.http.put(`${this.profileUrl}/suspend/${id}`, {});
  }

  reactivateUser(id: number): Observable<any> {
    return this.http.put(`${this.profileUrl}/reactivate/${id}`, {});
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.profileUrl}/${id}`);
  }

  // Analytics
  getAnalytics(): Observable<any> {
    return forkJoin({
      totalUsers: this.http.get<number>(`${this.profileUrl}/count`),
      totalOrders: this.http.get<number>(`${this.orderUrl}/totalCount`),
      totalRevenue: this.http.get<number>(`${this.orderUrl}/totalRevenue`),
      topProducts: this.http.get<any[]>(`${this.orderUrl}/topProducts?count=5`)
    });
  }

  // Order Management
  getAllOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.orderUrl}/all`);
  }

  updateOrderStatus(orderId: number, status: string): Observable<any> {
    return this.http.put(`${this.orderUrl}/changeStatus?status=${status}&orderId=${orderId}`, {});
  }

  // Delivery Agent Management
  getAllAgents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.profileUrl}/deliveryAgents`);
  }

  registerAgent(agent: any): Observable<any> {
    return this.http.post(`${this.profileUrl}/deliveryAgents`, agent);
  }

  deleteAgent(id: number): Observable<any> {
    return this.http.delete(`${this.profileUrl}/deliveryAgents/${id}`);
  }
}
