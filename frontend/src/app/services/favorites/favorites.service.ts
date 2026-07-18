import { Injectable, computed, signal } from '@angular/core';

const STORAGE_KEY = 'aureo_liked_photographers';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly _ids = signal<Set<string>>(this.read());

  readonly ids = this._ids.asReadonly();
  readonly count = computed(() => this._ids().size);

  isLiked(id: string): boolean {
    return this._ids().has(id);
  }

  toggle(id: string): void {
    this._ids.update((set) => {
      const next = new Set(set);
      next.has(id) ? next.delete(id) : next.add(id);
      this.write(next);
      return next;
    });
  }

  private read(): Set<string> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return new Set();
      const ids = JSON.parse(raw) as Array<string | number>;
      return new Set(ids.map(String));
    } catch {
      return new Set();
    }
  }

  private write(ids: Set<string>): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  }
}
