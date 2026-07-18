import { Booking } from '@/services';
import { ConfirmModal } from '@/shared';
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-cancel-dialog',
  imports: [ConfirmModal],
  templateUrl: './cancel-dialog.html',
})
export class CancelDialog {
  target = input<Booking | null>(null);
  confirmed = output<Booking>();
  closed = output<void>();
}
