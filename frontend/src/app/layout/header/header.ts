import { Component, signal } from '@angular/core';
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
  protected readonly NAV_LINKS = NAV_LINKS;
  mobileMenuOpen = signal(false);
  darkMode = signal(false);

  toggleMobileMenu() {
    this.mobileMenuOpen.update((open) => !open);
  }

  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
  }

  toggleDarkMode() {
    this.darkMode.update((dark) => !dark);
    if (this.darkMode()) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}
