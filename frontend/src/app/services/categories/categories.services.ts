import { environment } from '../../../environment';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Category } from './categories.interfaces';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private readonly http = inject(HttpClient);
  private readonly _categories = signal<Category[]>([]);

  readonly categories = this._categories.asReadonly();
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.http.get<Category[]>(`${environment.apiBase}/categories`).subscribe({
      next: (data) => {
        this._categories.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load categories');
        this.loading.set(false);
      },
    });
  }

  getAll(): Category[] {
    return this._categories();
  }

  getById(id: number): Category | undefined {
    return this._categories().find((category) => category.id === id);
  }
}
