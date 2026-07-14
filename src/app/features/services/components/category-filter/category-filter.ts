import { Component, signal } from '@angular/core';
import { CATEGORIES } from '../constants';

@Component({
  selector: 'app-category-filter',
  templateUrl: './category-filter.html',
})
export class CategoryFilter {
  protected readonly CATEGORIES = CATEGORIES;
  activeCategory = signal<string | null>(null);

  setCategory(category: string) {
    this.activeCategory.set(category);
  }
}
