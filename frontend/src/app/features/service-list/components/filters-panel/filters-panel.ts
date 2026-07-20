import { ServiceFiltersMenuService } from '@/services';
import { Pill } from '@/shared';
import { Component, inject } from '@angular/core';
import { PRICE_OPTIONS } from '../../constants';

@Component({
  selector: 'app-filters-panel',
  imports: [Pill],
  templateUrl: './filters-panel.html',
})
export class FiltersPanel {
  protected readonly filters = inject(ServiceFiltersMenuService);
  protected readonly PRICE_OPTIONS = PRICE_OPTIONS;
}
