import { Component, input, output } from '@angular/core';
import { CATEGORIES } from '../constants';

@Component({
  selector: 'app-category-filter',
  templateUrl: './category-filter.html',
})
export class CategoryFilter {
  protected readonly CATEGORIES = CATEGORIES;

  categoryFilter = input.required<string>();
  categoryChanged = output<string>();
}
