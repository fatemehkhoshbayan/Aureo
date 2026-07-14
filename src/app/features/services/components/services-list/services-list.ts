import { SkeletonCard } from '@/shared';
import { Component, computed, signal } from '@angular/core';
import { PhotographerCard } from '../../components/photographer-card/photographer-card';
import { Sidebar } from '../../components/sidebar/sidebar';
import { PHOTOGRAPHERS, PRICE_OPTIONS, SORT_OPTIONS, SPECIALTIES } from '../constants';
import { Toolbar } from '../toolbar/toolbar';

type SortOption = (typeof SORT_OPTIONS)[number]['value'];

@Component({
  selector: 'app-services-list',
  imports: [Sidebar, Toolbar, SkeletonCard, PhotographerCard],
  templateUrl: './services-list.html',
})
export class ServicesList {
  protected readonly PHOTOGRAPHERS = PHOTOGRAPHERS;
  protected readonly SPECIALTIES = SPECIALTIES;
  protected readonly PRICE_OPTIONS = PRICE_OPTIONS;

  sortBy = signal<SortOption>('rating');
  search = signal('');
  loading = signal(false);
  liked = signal<Set<string | number>>(new Set());
  category = signal('All');
  priceFilter = signal('All');
  showFilters = signal(false);

  filtered = computed(() => {
    let result = this.PHOTOGRAPHERS;

    // if (this.category() !== 'All') {
    //   result = result.filter(
    //     (photographer: Photographer) => photographer.category === this.category(),
    //   );
    // }

    // if (this.priceFilter() !== 'All') {
    //   result = result.filter((photographer: Photographer) =>
    //     this.matchesPriceRange(photographer.price, this.priceFilter()),
    //   );
    // }

    // const search = this.search().toLowerCase().trim();
    // if (search) {
    //   result = result.filter((photographer: Photographer) =>
    //     photographer.name.toLowerCase().includes(search),
    //   );
    // }

    // const sorted = [...result];
    // if (this.sortBy() === 'rating') {
    //   sorted.sort((a, b) => b.rating - a.rating);
    // } else if (this.sortBy() === 'price-asc') {
    //   sorted.sort((a, b) => a.price - b.price);
    // } else if (this.sortBy() === 'price-desc') {
    //   sorted.sort((a, b) => b.price - a.price);
    // }

    return result;
  });

  private matchesPriceRange(price: number, range: string): boolean {
    switch (range) {
      case 'Under $100':
        return price < 100;
      case '$100–$300':
        return price >= 100 && price <= 300;
      case '$300+':
        return price > 300;
      default:
        return true;
    }
  }

  toggleLike(id: string | number) {
    this.liked.update((set) => {
      const next = new Set(set);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  clearAllFilters() {
    this.search.set('');
    this.category.set('All');
    this.priceFilter.set('All');
  }

  setCategory(value: string) {
    this.category.set(value);
  }

  setPriceFilter(value: string) {
    this.priceFilter.set(value);
  }

  toggleFilters() {
    this.showFilters.update((v) => !v);
  }
}
