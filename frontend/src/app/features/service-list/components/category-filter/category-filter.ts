import { CategoriesService } from '@/services';
import { Component, inject, input, output } from '@angular/core';

@Component({
  selector: 'app-category-filter',
  templateUrl: './category-filter.html',
})
export class CategoryFilter {
  private readonly categoriesService = inject(CategoriesService);

  protected readonly categories = this.categoriesService.categories;
  protected readonly loading = this.categoriesService.loading;
  protected readonly skeletonTiles = [1, 2, 3, 4, 5, 6, 7, 8];

  categoryFilter = input.required<string>();
  categoryChanged = output<string>();
}
