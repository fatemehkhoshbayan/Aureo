import { environment } from '../../../environment';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Photographer } from './photographers.interfaces';

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
}
