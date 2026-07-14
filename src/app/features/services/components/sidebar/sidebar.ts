import { Pill } from '@/shared';
import { Component, input, output } from '@angular/core';
import { PRICE_OPTIONS, SPECIALTIES } from '../constants';

@Component({
  selector: 'app-sidebar',
  imports: [Pill],
  templateUrl: './sidebar.html',
})
export class Sidebar {
  protected readonly SPECIALTIES = SPECIALTIES;
  protected readonly PRICE_OPTIONS = PRICE_OPTIONS;

  category = input.required<string>();
  priceFilter = input.required<string>();
  showFilters = input.required<boolean>();
  changed = output<string>();

  setCategory(value: string) {
    this.changed.emit(value);
  }

  setPriceFilter(value: string) {
    this.changed.emit(value);
  }
}
