import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, switchMap, map, of } from 'rxjs';
import { UserProfile } from '../models';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = `${environment.apiUrl}/api/auth`;
  private profileUrl = `${environment.apiUrl}/api/profiles`;

  private currentUserSubject = new BehaviorSubject<any | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {}

  private getUserFromStorage(): UserProfile | null {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (e) {
      localStorage.removeItem('user');
      return null;
    }
  }

  login(credentials: any): Observable<any> {
    const payload = { emailId: credentials.email, password: credentials.password };
    return this.http.post<any>(`${this.apiUrl}/login`, payload).pipe(
      switchMap(res => {
        const token = res.token || res.Token;
        if (token) {
          localStorage.setItem('token', token);
          const decoded: any = jwtDecode(token);
          return this.getProfile(decoded.ProfileId).pipe(
            map(profile => {
              const user = { 
                profileId: decoded.ProfileId, 
                role: decoded.role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'], 
                emailId: decoded.sub,
                fullName: profile.fullName 
              };
              this.currentUserSubject.next(user);
              localStorage.setItem('user', JSON.stringify(user));
              return res;
            })
          );
        }
        return of(res);
      })
    );
  }

  registerCustomer(data: any): Observable<any> {
    return this.http.post(`${this.profileUrl}/addCustomer`, data);
  }

  registerMerchant(data: any): Observable<any> {
    return this.http.post(`${this.profileUrl}/addMerchant`, data);
  }

  githubLogin() {
    window.location.href = `${this.apiUrl}/github-login`;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  getProfile(id: number): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.profileUrl}/byId/${id}`);
  }

  updateProfile(data: any): Observable<UserProfile> {
    return this.http.put<UserProfile>(this.profileUrl, data);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getUserRole(): string | null {
    return this.currentUserSubject.value?.role || null;
  }

  getCurrentUser(): any | null {
    return this.currentUserSubject.value;
  }
}
