import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = signal<ToastItem[]>([]);
  private readonly dismissMs = 3500;

  readonly toasts = this._toasts.asReadonly();

  add(toast: Omit<ToastItem, 'id'>): void {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    this._toasts.update((list) => [...list, { ...toast, id }]);
    window.setTimeout(() => this.dismiss(id), this.dismissMs);
  }

  dismiss(id: string): void {
    this._toasts.update((list) => list.filter((t) => t.id !== id));
  }
}
