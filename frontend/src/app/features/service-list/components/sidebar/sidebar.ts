import { Component } from '@angular/core';
import { FiltersPanel } from '../filters-panel/filters-panel';

@Component({
  selector: 'app-sidebar',
  imports: [FiltersPanel],
  templateUrl: './sidebar.html',
})
export class Sidebar {}
