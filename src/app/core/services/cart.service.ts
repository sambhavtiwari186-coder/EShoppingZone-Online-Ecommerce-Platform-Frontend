import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, switchMap, catchError, throwError, tap } from 'rxjs';
import { Cart, CartItem, Wishlist } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private http = inject(HttpClient);
  private cartUrl = `${environment.apiUrl}/api/carts`;
  private wishlistUrl = `${environment.apiUrl}/api/wishlist`;

  cartItemCount$ = new BehaviorSubject<number>(0);

  getCart(userId: number): Observable<Cart> {
    return this.http.get<Cart>(`${this.cartUrl}/${userId}`).pipe(
      tap(cart => this.cartItemCount$.next(cart.items ? cart.items.length : 0))
    );
  }

  addToCart(userId: number, newItem: CartItem): Observable<Cart> {
    return this.getCart(userId).pipe(
      catchError(error => {
        if (error.status === 404) {
          // If cart doesn't exist, create it
          return this.http.post<Cart>(`${this.cartUrl}/add/${userId}`, {});
        }
        return throwError(() => error);
      }),
      switchMap(cart => {
        if (!cart.items) {
            cart.items = [];
        }
        const existing = cart.items.find(i => i.productId === newItem.productId);
        if (existing) {
          existing.quantity += 1;
        } else {
          cart.items.push(newItem);
        }
        return this.http.put<Cart>(
          `${this.cartUrl}/update?userId=${userId}`,
          cart.items
        ).pipe(tap(updatedCart => this.cartItemCount$.next(updatedCart.items ? updatedCart.items.length : 0)));
      })
    );
  }

  updateCart(userId: number, items: CartItem[]): Observable<Cart> {
    return this.http.put<Cart>(`${this.cartUrl}/update?userId=${userId}`, items).pipe(
      tap(updatedCart => this.cartItemCount$.next(updatedCart.items ? updatedCart.items.length : 0))
    );
  }

  getWishlist(userId: number): Observable<Wishlist[]> {
    return this.http.get<Wishlist[]>(`${this.wishlistUrl}/${userId}`);
  }

  addToWishlist(item: any): Observable<Wishlist> {
    return this.http.post<Wishlist>(`${this.wishlistUrl}/add`, item);
  }

  removeFromWishlist(id: number): Observable<any> {
    return this.http.delete(`${this.wishlistUrl}/${id}`);
  }

  moveToCart(id: number): Observable<any> {
    return this.http.post(`${this.wishlistUrl}/moveToCart/${id}`, {});
  }
}
