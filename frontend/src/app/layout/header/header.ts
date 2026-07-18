import { ThemeService } from '@/services';
import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NAV_LINKS } from './constants';

@Component({
  selector: 'app-header',
  host: {
    class: 'sticky top-0 z-50 block w-full',
  },
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
})
export class Header {
  private readonly theme = inject(ThemeService);
  protected readonly NAV_LINKS = NAV_LINKS;
  protected readonly darkMode = this.theme.darkMode;
  mobileMenuOpen = signal(false);

  toggleMobileMenu() {
    this.mobileMenuOpen.update((open) => !open);
  }

  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
  }

  toggleDarkMode() {
    this.theme.toggle();
  }
}
