import { mediaUrl as resolveMediaUrl } from '@/utils';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environment';
import {
  Package,
  PackageCreateSelf,
  PackageUpdateSelf,
  Photographer,
  PhotographerCreateSelf,
  PhotographerUpdateSelf,
  PortfolioItem,
} from './photographers.interfaces';

@Injectable({ providedIn: 'root' })
export class PhotographersService {
  private readonly http = inject(HttpClient);
  private readonly _photographers = signal<Photographer[]>([]);

  readonly photographers = this._photographers.asReadonly();
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.http.get<Photographer[]>(`${environment.apiBase}/photographers`).subscribe({
      next: (data) => {
        this._photographers.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load photographers', err);
        this.error.set('Failed to load photographers');
        this.loading.set(false);
      },
    });
  }

  getAll(): Photographer[] {
    return this._photographers();
  }

  getById(id: string): Photographer | undefined {
    return this._photographers().find((p) => p.id === id);
  }

  fetchById(id: string) {
    return this.http.get<Photographer>(`${environment.apiBase}/photographers/${id}`);
  }

  getMyProfile(): Observable<Photographer> {
    return this.http.get<Photographer>(`${environment.apiBase}/photographers/me`);
  }

  createMyProfile(payload: PhotographerCreateSelf): Observable<Photographer> {
    return this.http
      .post<Photographer>(`${environment.apiBase}/photographers/me`, payload)
      .pipe(tap(() => this.load()));
  }

  updateMyProfile(payload: PhotographerUpdateSelf): Observable<Photographer> {
    return this.http
      .patch<Photographer>(`${environment.apiBase}/photographers/me`, payload)
      .pipe(tap(() => this.load()));
  }

  uploadMyAvatar(file: File): Observable<Photographer> {
    const body = new FormData();
    body.append('file', file);
    return this.http
      .post<Photographer>(`${environment.apiBase}/photographers/me/avatar`, body)
      .pipe(tap(() => this.load()));
  }

  uploadMyCover(file: File): Observable<Photographer> {
    const body = new FormData();
    body.append('file', file);
    return this.http
      .post<Photographer>(`${environment.apiBase}/photographers/me/cover`, body)
      .pipe(tap(() => this.load()));
  }

  addPackage(payload: PackageCreateSelf): Observable<Package> {
    return this.http
      .post<Package>(`${environment.apiBase}/photographers/me/packages`, payload)
      .pipe(tap(() => this.load()));
  }

  updatePackage(packageId: string, payload: PackageUpdateSelf): Observable<Package> {
    return this.http
      .patch<Package>(`${environment.apiBase}/photographers/me/packages/${packageId}`, payload)
      .pipe(tap(() => this.load()));
  }

  deletePackage(packageId: string): Observable<void> {
    return this.http
      .delete<void>(`${environment.apiBase}/photographers/me/packages/${packageId}`)
      .pipe(tap(() => this.load()));
  }

  addPackageSample(packageId: string, file: File): Observable<Package> {
    const body = new FormData();
    body.append('file', file);
    return this.http
      .post<Package>(`${environment.apiBase}/photographers/me/packages/${packageId}/samples`, body)
      .pipe(tap(() => this.load()));
  }

  deletePackageSample(packageId: string, image: string): Observable<Package> {
    return this.http
      .delete<Package>(`${environment.apiBase}/photographers/me/packages/${packageId}/samples`, {
        params: { image },
      })
      .pipe(tap(() => this.load()));
  }

  addPortfolioItem(file: File, category: string, alt: string): Observable<PortfolioItem> {
    const body = new FormData();
    body.append('file', file);
    body.append('category', category);
    body.append('alt', alt);
    return this.http
      .post<PortfolioItem>(`${environment.apiBase}/photographers/me/portfolio`, body)
      .pipe(tap(() => this.load()));
  }

  deletePortfolioItem(itemId: string): Observable<void> {
    return this.http
      .delete<void>(`${environment.apiBase}/photographers/me/portfolio/${itemId}`)
      .pipe(tap(() => this.load()));
  }

  /** Absolute URL for photographer image paths (uploads + Unsplash ids). */
  mediaUrl(path: string | null | undefined): string | null {
    const url = resolveMediaUrl(path);
    return url || null;
  }
}
