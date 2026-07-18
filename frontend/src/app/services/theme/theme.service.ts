import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly darkMode = signal(document.documentElement.classList.contains('dark'));

  toggle(): void {
    this.darkMode.update((dark) => !dark);
    document.documentElement.classList.toggle('dark', this.darkMode());
  }
}
