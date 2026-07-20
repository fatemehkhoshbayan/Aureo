import { Booking, BookingStatus } from '@/services';
import { formatDate, mediaUrl } from '@/utils';
import { Component, input, output } from '@angular/core';

type BookingTab = 'upcoming' | 'past';

interface StatusBadge {
  class: string;
  label: string;
}

const STATUS_BADGES: Record<BookingStatus, StatusBadge> = {
  upcoming: { class: 'bg-accent/20 text-accent', label: 'Confirmed' },
  completed: { class: 'bg-secondary text-secondary-dark', label: 'Completed' },
  cancelled: { class: 'bg-destructive/10 text-destructive', label: 'Cancelled' },
};

@Component({
  selector: 'app-bookings-list',
  imports: [],
  templateUrl: './bookings-list.html',
})
export class BookingsList {
  protected readonly formatDate = formatDate;
  protected readonly mediaUrl = mediaUrl;
  protected readonly statusBadges = STATUS_BADGES;

  bookings = input.required<Booking[]>();
  tab = input.required<BookingTab>();
  cancel = output<string>();

  requestCancel(id: string): void {
    this.cancel.emit(id);
  }
}
