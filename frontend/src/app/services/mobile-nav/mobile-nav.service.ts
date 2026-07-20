import { Injectable, Injector, inject, signal } from '@angular/core';
import { ServiceFiltersMenuService } from '../service-filters-menu/service-filters-menu.service';

@Injectable({ providedIn: 'root' })
export class MobileNavService {
  private readonly injector = inject(Injector);
  private readonly _open = signal(false);

  readonly isOpen = this._open.asReadonly();

  toggle(): void {
    const next = !this._open();
    if (next) {
      this.injector.get(ServiceFiltersMenuService).close();
    }
    this._open.set(next);
  }

  close(): void {
    this._open.set(false);
  }
}
