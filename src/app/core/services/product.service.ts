import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Product } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/products`;

  getAll(): Observable<Product[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(prods => prods.map(p => ({
        ...p,
        productId: p.productId?.toString(),
        imageUrls: p.image || [],
        categoryId: p.category || 'General'
      } as Product)))
    );
  }

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  search(name: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/byName/${name}`);
  }

  filterByCategory(category: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/byCategory/${category}`);
  }

  filterByType(type: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/byType/${type}`);
  }

  getByMerchant(id: number): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/byMerchant/${id}`);
  }

  addProduct(product: any): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/add`, product);
  }

  updateProduct(product: any): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/update`, product);
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getStockMovements(merchantId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/stockMovements/${merchantId}`);
  }
}
