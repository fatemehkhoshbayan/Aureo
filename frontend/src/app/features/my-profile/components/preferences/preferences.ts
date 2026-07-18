import { AuthService, ThemeService } from '@/services';
import { Component, effect, inject, signal } from '@angular/core';

@Component({
  selector: 'app-profile-preferences',
  imports: [],
  templateUrl: './preferences.html',
})
export class ProfilePreferences {
  private readonly auth = inject(AuthService);
  private readonly theme = inject(ThemeService);

  protected readonly darkMode = this.theme.darkMode;
  protected readonly emailNotifications = signal(true);
  protected readonly savingNotifications = signal(false);

  constructor() {
    effect(() => {
      const user = this.auth.user();
      if (!user) return;
      this.emailNotifications.set(user.email_notifications ?? true);
    });
  }

  toggleDarkMode(): void {
    this.theme.toggle();
  }

  toggleEmailNotifications(): void {
    if (this.savingNotifications() || !this.auth.isLoggedIn()) return;

    const next = !this.emailNotifications();
    this.emailNotifications.set(next);
    this.savingNotifications.set(true);

    this.auth.updateProfile({ email_notifications: next }).subscribe({
      next: (user) => {
        this.emailNotifications.set(user.email_notifications);
        this.savingNotifications.set(false);
      },
      error: () => {
        this.emailNotifications.set(!next);
        this.savingNotifications.set(false);
      },
    });
  }
}
