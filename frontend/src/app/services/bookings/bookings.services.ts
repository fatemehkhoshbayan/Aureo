import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { environment } from '../../../environment';
import { AuthService } from '../auth/auth.service';
import { Photographer } from '../photographers/photographers.interfaces';
import { PhotographersService } from '../photographers/photographers.services';
import { ApiBooking, Booking } from './bookings.interfaces';

@Injectable({ providedIn: 'root' })
export class BookingsService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly photographers = inject(PhotographersService);

  private readonly _apiBookings = signal<ApiBooking[]>([]);

  readonly bookings = computed(() => {
    const photographers = this.photographers.photographers();
    return this._apiBookings().map((b) => this.toUiBooking(b, photographers));
  });

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  load(): void {
    if (!this.auth.isLoggedIn()) {
      this._apiBookings.set([]);
      this.loading.set(false);
      this.error.set(null);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.http.get<ApiBooking[]>(`${environment.apiBase}/bookings`).subscribe({
      next: (data) => {
        this._apiBookings.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load bookings', err);
        this.error.set('Failed to load bookings');
        this.loading.set(false);
      },
    });
  }

  cancel(id: string): void {
    this.http.patch<ApiBooking>(`${environment.apiBase}/bookings/${id}/cancel`, {}).subscribe({
      next: (updated) => {
        this._apiBookings.update((list) => list.map((b) => (b.id === updated.id ? updated : b)));
      },
      error: (err) => {
        console.error('Failed to cancel booking', err);
        this.error.set('Failed to cancel booking');
      },
    });
  }

  private toUiBooking(api: ApiBooking, photographers: Photographer[]): Booking {
    const photographer = photographers.find((p) => p.id === api.photographerId);
    const scheduled = new Date(api.scheduledAt);
    const bookedOn = new Date(api.createdAt);

    return {
      id: api.id,
      photographerId: api.photographerId,
      photographerName: photographer?.name ?? 'Photographer',
      photographerAvatar: photographer?.avatar ?? '',
      service: api.packageName,
      date: scheduled.toISOString().slice(0, 10),
      time: scheduled.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
      total: api.price,
      status: api.status,
      reference: `AUR-${api.id.toUpperCase()}`,
      bookedOn: bookedOn.toISOString().slice(0, 10),
    };
  }
}
