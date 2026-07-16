import { CategoriesService } from '@/services';
import { Component, inject, input, output } from '@angular/core';

@Component({
  selector: 'app-category-filter',
  templateUrl: './category-filter.html',
})
export class CategoryFilter {
  private readonly categoriesService = inject(CategoriesService);

  protected readonly categories = this.categoriesService.categories;

  categoryFilter = input.required<string>();
  categoryChanged = output<string>();
}
