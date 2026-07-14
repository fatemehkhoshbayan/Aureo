import { Component, computed, signal } from '@angular/core';
import { HeroSection, ServicesList } from './components';
import { PHOTOGRAPHERS } from './components/constants';
import { Photographer } from './components/interfaces';

@Component({
  selector: 'app-services',
  imports: [HeroSection, ServicesList],
  templateUrl: './services.html',
})
export class Services {
  protected readonly PHOTOGRAPHERS = PHOTOGRAPHERS;

  search = signal<string>('');

  filteredPhotographers = computed(() => {
    const query = this.search().toLowerCase().trim();
    if (!query) return this.PHOTOGRAPHERS;

    return this.PHOTOGRAPHERS.filter(
      (photographer: Photographer) =>
        photographer.name.toLowerCase().includes(query) ||
        photographer.specialties.some((specialty: string) =>
          specialty.toLowerCase().includes(query),
        ),
    );
  });
}
