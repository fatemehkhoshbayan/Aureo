import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  imports: [],
  templateUrl: './confirm-modal.html',
})
export class ConfirmModal<T = unknown> {
  target = input<T | null>(null);
  title = input('');
  description = input('');
  cancelLabel = input('');
  confirmLabel = input('');

  confirm = output<T>();
  close = output<void>();
}
