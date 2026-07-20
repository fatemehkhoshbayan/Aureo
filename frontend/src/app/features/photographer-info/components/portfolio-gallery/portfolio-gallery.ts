import { mediaUrl } from '@/utils';
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
  protected readonly mediaUrl = mediaUrl;

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

  itemSrc(item: PortfolioItem, idx: number): string {
    const large = idx === 0;
    return mediaUrl(item.image, { w: large ? 800 : 400, h: large ? 450 : 400 });
  }
}
