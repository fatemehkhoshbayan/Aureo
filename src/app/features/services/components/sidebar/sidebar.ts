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

  photographers = input.required<string[]>();
  photographerFilter = input.required<string>();
  priceFilter = input.required<string>();
  showFilters = input.required<boolean>();

  photographerChanged = output<string>();
  priceChanged = output<string>();
  clearAllFilters = output<void>();
}
