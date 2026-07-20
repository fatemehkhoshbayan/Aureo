import { AuthService, BookingsService } from '@/services';
import { Component, effect, inject, signal } from '@angular/core';
import { ProfileLogInForm } from './components/log-in-form/log-in-form';
import { ProfilePreferences } from './components/preferences/preferences';
import { QuickLinks } from './components/quick-links/quick-links';
import { ProfileSignUpForm } from './components/sign-up-form/sign-up-form';
import { ProfileUserInfo } from './components/user-info/user-info';

@Component({
  selector: 'app-my-profile',
  imports: [ProfileLogInForm, ProfileSignUpForm, ProfileUserInfo, ProfilePreferences, QuickLinks],
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
  protected readonly authMode = signal<'login' | 'signup'>('login');

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
