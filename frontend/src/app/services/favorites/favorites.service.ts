import { HttpClient } from '@angular/common/http';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { environment } from '../../../environment';
import { AuthService } from '../auth/auth.service';
import { ToastService } from '../toast/toast.service';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  private readonly _ids = signal<Set<string>>(new Set());

  readonly ids = this._ids.asReadonly();
  readonly count = computed(() => this._ids().size);
  readonly loading = signal(false);

  constructor() {
    effect(() => {
      if (this.auth.isLoggedIn()) {
        this.load();
      } else {
        this._ids.set(new Set());
      }
    });
  }

  isLiked(id: string): boolean {
    return this._ids().has(id);
  }

  load(): void {
    this.loading.set(true);
    this.http.get<string[]>(`${environment.apiBase}/favorites`).subscribe({
      next: (ids) => {
        this._ids.set(new Set(ids));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  toggle(id: string): void {
    if (!this.auth.isLoggedIn()) {
      this.toast.add({ type: 'error', message: 'Sign in to save favorites.' });
      return;
    }

    const wasLiked = this.isLiked(id);
    this._ids.update((set) => {
      const next = new Set(set);
      wasLiked ? next.delete(id) : next.add(id);
      return next;
    });

    const request = wasLiked
      ? this.http.delete<void>(`${environment.apiBase}/favorites/${id}`)
      : this.http.put<void>(`${environment.apiBase}/favorites/${id}`, {});

    request.subscribe({
      error: () => {
        this._ids.update((set) => {
          const next = new Set(set);
          wasLiked ? next.add(id) : next.delete(id);
          return next;
        });
        this.toast.add({
          type: 'error',
          message: 'Could not update favorites. Please try again.',
        });
      },
    });
  }
}
