import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/reviews`;

  submitReview(dto: any): Observable<Review> {
    return this.http.post<Review>(this.apiUrl, dto);
  }

  getReviewsByProduct(productId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/product/${productId}`);
  }

  getAverageRating(id: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/product/${id}/rating`);
  }

  voteReviewHelpful(id: number, customerId: number, isHelpful: boolean = true): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/helpful?customerId=${customerId}&isHelpful=${isHelpful}`, {});
  }

  deleteReview(id: number, customerId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}?customerId=${customerId}`);
  }
}
