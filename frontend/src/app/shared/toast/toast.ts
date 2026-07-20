import { ToastService } from '@/services';
import { Component, inject } from '@angular/core';

@Component({
  selector: 'app-toast',
  imports: [],
  templateUrl: './toast.html',
})
export class Toast {
  private readonly toastService = inject(ToastService);

  protected readonly toasts = this.toastService.toasts;

  dismiss(id: string): void {
    this.toastService.dismiss(id);
  }
}
