import { Statistics } from '@/features/interfaces';
import { AuthService, Booking, BookingsService, FavoritesService } from '@/services';
import { TabItem, Tabs } from '@/shared';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { BookingsList } from './components/bookings-list/bookings-list';
import { CancelDialog } from './components/cancel-dialog/cancel-dialog';
import { FavoritesList } from './components/favorites-list/favorites-list';
import { NotLoggedIn } from './components/not-logged-in/not-logged-in';

type BookingTab = 'upcoming' | 'past' | 'favorites';

@Component({
  selector: 'app-my-bookings',
  imports: [Tabs, CancelDialog, BookingsList, FavoritesList, NotLoggedIn],
  templateUrl: './my-bookings.html',
})
export class MyBookings {
  private readonly bookingsService = inject(BookingsService);
  private readonly auth = inject(AuthService);
  private readonly favorites = inject(FavoritesService);

  protected readonly isLoggedIn = this.auth.isLoggedIn;

  tab = signal<BookingTab>('upcoming');
  cancelTarget = signal<Booking | null>(null);

  protected readonly bookings = this.bookingsService.bookings;
  protected readonly loading = this.bookingsService.loading;

  upcoming = computed(() => this.bookings().filter((b) => b.status === 'upcoming'));

  past = computed(() =>
    this.bookings().filter((b) => b.status === 'completed' || b.status === 'cancelled'),
  );

  shown = computed(() => (this.tab() === 'upcoming' ? this.upcoming() : this.past()));

  statistics = computed<Statistics[]>(() => {
    const all = this.bookings();
    const spent = all.reduce((sum, b) => sum + (b.status !== 'cancelled' ? b.total : 0), 0);

    return [
      {
        label: 'Total Bookings',
        value: all.length,
        icon: 'icon-[lucide--book-open] text-primary text-[17px]',
      },
      {
        label: 'Upcoming',
        value: this.upcoming().length,
        icon: 'icon-[lucide--calendar] text-accent text-[17px]',
      },
      {
        label: 'Total Spent',
        value: `$${spent.toLocaleString()}`,
        icon: 'icon-[lucide--tag] text-primary text-[17px]',
      },
      {
        label: 'Completed',
        value: this.past().filter((b) => b.status === 'completed').length,
        icon: 'icon-[lucide--check] text-accent text-[17px]',
      },
    ];
  });

  tabItems = computed<TabItem[]>(() => [
    { key: 'upcoming', label: 'Upcoming', count: this.upcoming().length },
    { key: 'past', label: 'Past', count: this.past().length },
    { key: 'favorites', label: 'Favorites', count: this.favorites.count() },
  ]);

  constructor() {
    effect(() => {
      if (this.auth.isLoggedIn()) {
        this.bookingsService.load();
      }
    });
  }

  openCancel(id: string): void {
    const booking = this.bookings().find((b) => b.id === id) ?? null;
    this.cancelTarget.set(booking);
  }

  confirmCancel(booking: Booking): void {
    this.bookingsService.cancel(booking.id);
    this.cancelTarget.set(null);
  }
}
