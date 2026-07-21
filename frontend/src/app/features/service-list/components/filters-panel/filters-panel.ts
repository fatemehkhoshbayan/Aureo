import { PhotographersService, ServiceFiltersMenuService } from '@/services';
import { Pill } from '@/shared';
import { Component, inject } from '@angular/core';
import { PRICE_OPTIONS } from '../../constants';

@Component({
  selector: 'app-filters-panel',
  imports: [Pill],
  templateUrl: './filters-panel.html',
})
export class FiltersPanel {
  private readonly photographersService = inject(PhotographersService);

  protected readonly filters = inject(ServiceFiltersMenuService);
  protected readonly photographersLoading = this.photographersService.loading;
  protected readonly skeletonPills = [1, 2, 3, 4];
  protected readonly PRICE_OPTIONS = PRICE_OPTIONS;
}
