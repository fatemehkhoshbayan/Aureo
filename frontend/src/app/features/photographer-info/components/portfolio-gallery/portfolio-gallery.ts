import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

export interface PortfolioItem {
  id: string | number;
  image: string;
  alt: string;
  category: string;
}

@Component({
  selector: 'app-portfolio-gallery',
  templateUrl: './portfolio-gallery.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioGallery {
  portfolioItems = input.required<PortfolioItem[]>();
  portfolioCategories = input.required<string[]>();

  portfolioFilter = signal('All');

  filteredPortfolio = computed(() => {
    const filter = this.portfolioFilter();
    if (filter === 'All') return this.portfolioItems();
    return this.portfolioItems().filter((item) => item.category === filter);
  });

  setPortfolioFilter(category: string) {
    this.portfolioFilter.set(category);
  }
}
