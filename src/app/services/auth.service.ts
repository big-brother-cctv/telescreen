import { Injectable, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import jwtDecode from 'jwt-decode';
import { API_URL } from '../app.config';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.checkTokenValidity());

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(API_URL) private apiUrl: string // Inyecta la URL de la API
  ) {}

  private checkTokenValidity(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    try {
      const decoded: any = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp > currentTime;
    } catch (error) {
      console.error('Error decoding token:', error);
      return false;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn$(): Observable<boolean> {
    return this.isLoggedInSubject.asObservable();
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, { username, password }).pipe(
      catchError((error) => {
        console.error('Login error:', error);
        return throwError(error);
      }),
      tap((response: any) => {
        console.log('Login response:', response); // Verificar la respuesta del servidor
        if (response.token) {
          localStorage.setItem('token', response.token);
          this.isLoggedInSubject.next(true);
        } else {
          console.error('Token not found in response');
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.isLoggedInSubject.next(false);
  }
}