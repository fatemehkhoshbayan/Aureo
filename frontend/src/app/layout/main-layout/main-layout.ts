import { MobileNavService, ServiceFiltersMenuService } from '@/services';
import { Toast } from '@/shared';
import { Component, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from '../footer/footer';
import { Header } from '../header/header';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Header, Footer, Toast],
  templateUrl: './main-layout.html',
  styles: ``,
})
export class MainLayout {
  private readonly filtersMenu = inject(ServiceFiltersMenuService);
  private readonly mobileNav = inject(MobileNavService);

  constructor() {
    effect((onCleanup) => {
      const locked = this.filtersMenu.isOpen() || this.mobileNav.isOpen();
      document.body.classList.toggle('overflow-hidden', locked);
      onCleanup(() => document.body.classList.remove('overflow-hidden'));
    });
  }
}
