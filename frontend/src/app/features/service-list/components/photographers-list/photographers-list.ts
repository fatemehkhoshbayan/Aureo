import {
  FavoritesService,
  Photographer,
  PhotographersService,
  ServiceFiltersMenuService,
} from '@/services';
import { SkeletonCard } from '@/shared';
import {
  Component,
  computed,
  effect,
  inject,
  input,
  OnDestroy,
  output,
  signal,
} from '@angular/core';
import { PRICE_OPTIONS, SORT_OPTIONS, SPECIALTIES } from '../../constants';
import { CategoryFilter } from '../category-filter/category-filter';
import { FiltersPanel } from '../filters-panel/filters-panel';
import { PhotographerCard } from '../photographer-card/photographer-card';
import { Sidebar } from '../sidebar/sidebar';
import { Toolbar } from '../toolbar/toolbar';

type SortOption = (typeof SORT_OPTIONS)[number]['value'];

@Component({
  selector: 'app-photographers-list',
  imports: [Sidebar, Toolbar, SkeletonCard, PhotographerCard, CategoryFilter, FiltersPanel],
  templateUrl: './photographers-list.html',
})
export class PhotographersList implements OnDestroy {
  private readonly photographersService = inject(PhotographersService);
  private readonly favorites = inject(FavoritesService);
  protected readonly filtersMenu = inject(ServiceFiltersMenuService);

  protected readonly SPECIALTIES = SPECIALTIES;
  protected readonly PRICE_OPTIONS = PRICE_OPTIONS;
  protected readonly likedIds = this.favorites.ids;

  photographers = input.required<Photographer[]>();
  viewed = output<string>();

  sortBy = signal<SortOption>('rating');
  loading = this.photographersService.loading;

  filtered = computed(() => {
    let result = this.photographers();

    const photographerFilter = this.filtersMenu.photographerFilter();
    if (photographerFilter !== 'All') {
      result = result.filter((photographer) => photographer.name === photographerFilter);
    }

    const priceFilter = this.filtersMenu.priceFilter();
    if (priceFilter !== 'All') {
      result = result.filter((photographer: Photographer) =>
        this.matchesPriceRange(photographer.startingPrice, priceFilter),
      );
    }

    const categoryFilter = this.filtersMenu.categoryFilter();
    if (categoryFilter !== 'All') {
      result = result.filter((photographer: Photographer) =>
        photographer.specialties.includes(categoryFilter),
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

  constructor() {
    effect(() => {
      this.filtersMenu.setPhotographers(
        this.photographers().map((photographer) => photographer.name),
      );
    });
  }

  ngOnDestroy(): void {
    this.filtersMenu.reset();
  }

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

  toggleLike(id: string) {
    this.favorites.toggle(id);
  }

  clearAllFilters() {
    this.filtersMenu.clearAll();
  }

  setCategory(category: string) {
    this.filtersMenu.setCategoryFilter(category);
  }

  toggleFilters() {
    this.filtersMenu.toggle();
  }

  onView(id: string) {
    this.viewed.emit(id);
  }
}
