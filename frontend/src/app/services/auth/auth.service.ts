import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, switchMap, tap, throwError } from 'rxjs';
import { environment } from '../../../environment';
import { RegisterPayload, TokenResponse, User, UserUpdate } from './auth.interfaces';

const TOKEN_KEY = 'aureo_access_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly _token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  private readonly _user = signal<User | null>(null);
  private readonly _userLoading = signal(false);
  private readonly _userError = signal<string | null>(null);

  readonly token = this._token.asReadonly();
  readonly user = this._user.asReadonly();
  readonly userLoading = this._userLoading.asReadonly();
  readonly userError = this._userError.asReadonly();
  readonly isLoggedIn = computed(() => !!this._token());

  constructor() {
    if (this._token()) {
      this.loadMe().subscribe({ error: () => undefined });
    }
  }

  login(email: string, password: string): Observable<User> {
    const body = new URLSearchParams({
      username: email,
      password,
    });

    return this.http
      .post<TokenResponse>(`${environment.apiBase}/auth/login`, body.toString(), {
        headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }),
      })
      .pipe(
        tap((res) => this.setToken(res.access_token)),
        switchMap(() => this.loadMe()),
      );
  }

  register(payload: RegisterPayload): Observable<User> {
    return this.http
      .post<User>(`${environment.apiBase}/auth/register`, payload)
      .pipe(switchMap(() => this.login(payload.email, payload.password)));
  }

  loadMe(): Observable<User> {
    this._userLoading.set(true);
    this._userError.set(null);

    return this.http.get<User>(`${environment.apiBase}/users/me`).pipe(
      tap((user) => this._user.set(user)),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401 || err.status === 403) {
          this.logout();
        } else {
          this._userError.set(
            err.status === 0
              ? 'Cannot reach the server. Is the backend running?'
              : 'Could not load your profile. Please try again.',
          );
        }
        return throwError(() => err);
      }),
      finalize(() => this._userLoading.set(false)),
    );
  }

  updateProfile(payload: UserUpdate): Observable<User> {
    return this.http
      .patch<User>(`${environment.apiBase}/users/me`, payload)
      .pipe(tap((user) => this._user.set(user)));
  }

  uploadAvatar(file: File): Observable<User> {
    const body = new FormData();
    body.append('file', file);
    return this.http
      .post<User>(`${environment.apiBase}/users/me/avatar`, body)
      .pipe(tap((user) => this._user.set(user)));
  }

  /** Absolute URL for a stored avatar path like `/uploads/avatars/1.jpg`. */
  avatarUrl(avatar: string | null | undefined): string | null {
    if (!avatar) return null;
    if (avatar.startsWith('http://') || avatar.startsWith('https://')) return avatar;
    return `${environment.apiBase}${avatar.startsWith('/') ? '' : '/'}${avatar}`;
  }

  logout(): void {
    this.clearToken();
    this._user.set(null);
    this._userError.set(null);
    this._userLoading.set(false);
  }

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    this._token.set(token);
  }

  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
    this._token.set(null);
  }
}
