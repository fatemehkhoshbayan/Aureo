import { PhotographersService } from '@/services';
import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HeroSection, PhotographersList } from './components';

@Component({
  selector: 'app-services-list',
  imports: [HeroSection, PhotographersList],
  templateUrl: './services-list.html',
})
export class ServicesList {
  private readonly router = inject(Router);
  private readonly photographersService = inject(PhotographersService);
  protected readonly photographers = this.photographersService.photographers;

  search = signal<string>('');

  filteredPhotographers = computed(() => {
    const query = this.search().toLowerCase().trim();
    if (!query) return this.photographers();

    return this.photographers().filter(
      (photographer) =>
        photographer.name.toLowerCase().includes(query) ||
        photographer.specialties.some((specialty) => specialty.toLowerCase().includes(query)),
    );
  });

  onView(id: string) {
    this.router.navigate(['/photographer', id]);
  }
}
