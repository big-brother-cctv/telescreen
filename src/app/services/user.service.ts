import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}

  getCurrentUser(): Observable<any> {
    return this.http.get(`/api/users/me`);
  }

  updateUser(userId: number, user: any): Observable<any> {
    return this.http.put(`/api/users/${userId}`, user);
  }
}