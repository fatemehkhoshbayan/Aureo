import { AuthService, MobileNavService, ThemeService, type UserRole } from '@/services';
import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NAV_LINKS, type NavLink } from './constants';

@Component({
  selector: 'app-header',
  host: {
    class: 'sticky top-0 z-[var(--z-header)] block w-full',
  },
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
})
export class Header {
  private readonly theme = inject(ThemeService);
  private readonly auth = inject(AuthService);
  private readonly mobileNav = inject(MobileNavService);

  protected readonly darkMode = this.theme.darkMode;
  protected readonly mobileMenuOpen = this.mobileNav.isOpen;

  protected readonly navLinks = computed<NavLink[]>(() => {
    const role: UserRole | undefined = this.auth.user()?.role;
    const links = [...NAV_LINKS];

    if (role === 'photographer' || role === 'admin') {
      const withoutBookings = links.filter((l) => l.id !== 'my-bookings');
      withoutBookings.splice(1, 0, {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/photographer/dashboard',
        icon: 'icon-[lucide--layout-dashboard]',
      });
      return withoutBookings;
    }

    return links;
  });

  toggleMobileMenu() {
    this.mobileNav.toggle();
  }

  closeMobileMenu() {
    this.mobileNav.close();
  }

  toggleDarkMode() {
    this.theme.toggle();
  }
}
