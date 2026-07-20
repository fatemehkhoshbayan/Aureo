import { Injectable, Injector, inject, signal } from '@angular/core';
import { MobileNavService } from '../mobile-nav/mobile-nav.service';

@Injectable({ providedIn: 'root' })
export class ServiceFiltersMenuService {
  private readonly injector = inject(Injector);
  private readonly _open = signal(false);

  readonly isOpen = this._open.asReadonly();
  readonly photographers = signal<string[]>([]);
  readonly photographerFilter = signal('All');
  readonly priceFilter = signal('All');
  readonly categoryFilter = signal('All');

  toggle(): void {
    const next = !this._open();
    if (next) {
      this.injector.get(MobileNavService).close();
    }
    this._open.set(next);
  }

  close(): void {
    this._open.set(false);
  }

  setPhotographers(names: string[]): void {
    this.photographers.set(names);
  }

  setPhotographerFilter(value: string): void {
    this.photographerFilter.set(value);
  }

  setPriceFilter(value: string): void {
    this.priceFilter.set(value);
  }

  setCategoryFilter(value: string): void {
    this.categoryFilter.set(value);
  }

  clearAll(): void {
    this.photographerFilter.set('All');
    this.priceFilter.set('All');
    this.categoryFilter.set('All');
  }

  reset(): void {
    this.close();
    this.clearAll();
    this.photographers.set([]);
  }
}
