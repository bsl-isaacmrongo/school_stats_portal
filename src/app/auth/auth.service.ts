import { HttpBackend, HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize, map, Observable, of, shareReplay } from 'rxjs';
import { MOCK_USERS } from './mock-users';
import { environment } from '../env';

interface TokenResponse {
  access_token?: string;
  accessToken?: string;
  token?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser = signal<any>(null);
  private tokenHttp: HttpClient;
  private refreshRequest$: Observable<boolean> | null = null;
  isAuthenticated = signal(false);

  constructor(
    private router: Router,
    httpBackend: HttpBackend
  ) {
    this.tokenHttp = new HttpClient(httpBackend);
    this.checkStoredSession();
  }

  login(username: string, password: string): Observable<boolean> {
    const user = MOCK_USERS.find(u =>
      u.username === username && u.password === password
    );

    if (!user) {
      return of(false);
    }

    const body = new HttpParams()
      .set('username', environment.username)
      .set('password', environment.password);

    return this.tokenHttp.post<TokenResponse>(`${environment.apiUrl}/gettoken`, body, {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
      }),
    }).pipe(
      map(response => {
        const token = response.access_token ?? response.accessToken ?? response.token;
        if (!token) return false;

        this.currentUser.set(user);
        this.isAuthenticated.set(true);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
        return true;
      }),
      catchError(() => of(false))
    );
  }

  refreshToken(): Observable<boolean> {
    if (this.refreshRequest$) {
      return this.refreshRequest$;
    }

    const user = this.currentUser();
    if (!user) {
      return of(false);
    }

    const body = new HttpParams()
      .set('username', environment.username)
      .set('password', environment.password);

    this.refreshRequest$ = this.tokenHttp.post<TokenResponse>(`${environment.apiUrl}/gettoken`, body, {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
      }),
    }).pipe(
      map(response => {
        const token = response.access_token ?? response.accessToken ?? response.token;
        if (!token) return false;

        this.isAuthenticated.set(true);
        localStorage.setItem('token', token);
        return true;
      }),
      catchError(() => of(false)),
      finalize(() => {
        this.refreshRequest$ = null;
      }),
      shareReplay({ bufferSize: 1, refCount: false })
    );

    return this.refreshRequest$;
  }

  logout(): void {
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  private checkStoredSession(): void {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (user && token) {
      this.currentUser.set(JSON.parse(user));
      this.isAuthenticated.set(true);
    }
  }
}
