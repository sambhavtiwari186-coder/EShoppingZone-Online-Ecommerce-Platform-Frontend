import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Notification } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/notifications`;

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  refreshUnreadCount(userId: number) {
    this.getUnreadCount(userId).subscribe(res => {
      this.unreadCountSubject.next(res.unreadCount);
    });
  }

  createNotification(request: any): Observable<any> {
    return this.http.post(this.apiUrl, request).pipe(
      tap(() => this.refreshUnreadCount(request.userId))
    );
  }

  getNotifications(userId: number): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/${userId}`);
  }

  getUnreadCount(userId: number): Observable<{ unreadCount: number }> {
    return this.http.get<{ unreadCount: number }>(`${this.apiUrl}/${userId}/unread`);
  }

  markAsRead(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/read`, {});
  }

  markAllAsRead(uid: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/read-all/${uid}`, {});
  }

  deleteNotification(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
