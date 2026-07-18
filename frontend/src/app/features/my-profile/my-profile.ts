import { AuthService, BookingsService } from '@/services';
import { Component, effect, inject } from '@angular/core';
import { ProfileLogInForm } from './components/log-in-form/log-in-form';
import { ProfilePreferences } from './components/preferences/preferences';
import { ProfileUserInfo } from './components/user-info/user-info';
import { QuickLinks } from './components/quick-links/quick-links';

@Component({
  selector: 'app-my-profile',
  imports: [ProfileLogInForm, ProfileUserInfo, ProfilePreferences, QuickLinks],
  templateUrl: './my-profile.html',
})
export class MyProfile {
  private readonly auth = inject(AuthService);
  private readonly bookingsService = inject(BookingsService);

  protected readonly isLoggedIn = this.auth.isLoggedIn;
  protected readonly user = this.auth.user;
  protected readonly userLoading = this.auth.userLoading;
  protected readonly userError = this.auth.userError;
  protected readonly bookings = this.bookingsService.bookings;

  constructor() {
    effect(() => {
      if (this.auth.isLoggedIn()) {
        this.bookingsService.load();
      }
    });
  }

  retryLoadProfile(): void {
    this.auth.loadMe().subscribe({ error: () => undefined });
  }

  logout(): void {
    this.auth.logout();
  }
}
