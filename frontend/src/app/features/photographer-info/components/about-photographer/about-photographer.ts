import { Photographer } from '@/services';
import { StarRating } from '@/shared';
import { Component, computed, input } from '@angular/core';
import { PortfolioGallery } from '../portfolio-gallery/portfolio-gallery';
import { Reviews } from '../reviews/reviews';

@Component({
  selector: 'app-about-photographer',
  imports: [StarRating, PortfolioGallery, Reviews],
  templateUrl: './about-photographer.html',
  host: { class: 'contents' },
})
export class AboutPhotographer {
  photographer = input.required<Photographer>();

  portfolioCategories = computed(() => [
    'All',
    ...new Set(this.photographer().portfolio.map((item) => item.category)),
  ]);

  protected readonly stats = computed(() => {
    const p = this.photographer();
    return [
      { label: 'Packages', value: p.packages.length },
      { label: 'Portfolio', value: p.portfolio.length },
      { label: 'Experience', value: `${p.experience}y` },
    ];
  });
}
