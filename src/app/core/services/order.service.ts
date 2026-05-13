import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/orders`;

  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/all`);
  }

  getOrdersByCustomer(id: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/byCustomer/${id}`);
  }

  getAllAddresses(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/allAddress/${id}`);
  }

  placeOrder(order: Partial<Order>): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/placeOrder`, order);
  }

  onlinePayment(order: Partial<Order>): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/onlinePayment`, order);
  }

  storeAddress(orderId: number, address: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/storeAddress?orderId=${orderId}`, address);
  }

  changeStatus(status: string, orderId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/changeStatus?status=${status}&orderId=${orderId}`, {});
  }

  cancelOrder(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  verifyPurchase(custId: number, prodId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/verifyPurchase/${custId}/${prodId}`);
  }
}
