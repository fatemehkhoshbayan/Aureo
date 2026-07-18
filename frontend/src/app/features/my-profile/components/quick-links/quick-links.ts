import { Booking } from '@/services';
import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-quick-links',
  imports: [RouterLink],
  templateUrl: './quick-links.html',
})
export class QuickLinks {
  readonly bookings = input<Booking[]>([]);

  protected readonly upcomingCount = computed(
    () => this.bookings().filter((b) => b.status === 'upcoming').length,
  );

  protected readonly totalCount = computed(() => this.bookings().length);
}
