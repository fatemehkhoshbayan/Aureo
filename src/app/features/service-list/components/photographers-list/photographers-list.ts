import { Photographer } from '@/services';
import { SkeletonCard } from '@/shared';
import { Component, computed, input, output, signal } from '@angular/core';
import { CategoryFilter } from '../category-filter/category-filter';
import { PRICE_OPTIONS, SORT_OPTIONS, SPECIALTIES } from '../constants';
import { PhotographerCard } from '../photographer-card/photographer-card';
import { Sidebar } from '../sidebar/sidebar';
import { Toolbar } from '../toolbar/toolbar';

type SortOption = (typeof SORT_OPTIONS)[number]['value'];

@Component({
  selector: 'app-photographers-list',
  imports: [Sidebar, Toolbar, SkeletonCard, PhotographerCard, CategoryFilter],
  templateUrl: './photographers-list.html',
})
export class PhotographersList {
  protected readonly SPECIALTIES = SPECIALTIES;
  protected readonly PRICE_OPTIONS = PRICE_OPTIONS;

  photographers = input.required<Photographer[]>();
  viewed = output<string>();

  sortBy = signal<SortOption>('rating');
  loading = signal(false);
  liked = signal<Set<string | number>>(new Set());
  categoryFilter = signal('All');
  photographerFilter = signal('All');
  priceFilter = signal('All');
  showFilters = signal(false);

  photographersName = computed(() => this.photographers().map((photographer) => photographer.name));

  filtered = computed(() => {
    let result = this.photographers();

    if (this.photographerFilter() !== 'All') {
      result = result.filter((photographer) => photographer.name === this.photographerFilter());
    }

    if (this.priceFilter() !== 'All') {
      result = result.filter((photographer: Photographer) =>
        this.matchesPriceRange(photographer.startingPrice, this.priceFilter()),
      );
    }

    if (this.categoryFilter() !== 'All') {
      result = result.filter((photographer: Photographer) =>
        photographer.specialties.includes(this.categoryFilter()),
      );
    }

    const sorted = [...result];
    if (this.sortBy() === 'rating') {
      sorted.sort((a, b) => b.rating - a.rating);
    } else if (this.sortBy() === 'price-asc') {
      sorted.sort((a, b) => a.startingPrice - b.startingPrice);
    } else if (this.sortBy() === 'price-desc') {
      sorted.sort((a, b) => b.startingPrice - a.startingPrice);
    }

    return sorted;
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
    this.photographerFilter.set('All');
    this.categoryFilter.set('All');
    this.priceFilter.set('All');
  }

  setPhotographerFilter(value: string) {
    this.photographerFilter.set(value);
  }

  setCategory(category: string) {
    this.categoryFilter.set(category);
  }

  setPriceFilter(value: string) {
    this.priceFilter.set(value);
  }

  toggleFilters() {
    this.showFilters.update((v) => !v);
  }

  onView(id: string) {
    this.viewed.emit(id);
  }
}
