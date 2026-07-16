import { CdkListboxModule } from '@angular/cdk/listbox';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { SORT_OPTIONS } from '../constants';

@Component({
  selector: 'app-toolbar',
  imports: [CdkListboxModule],
  templateUrl: './toolbar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Toolbar<T extends string = string> {
  protected readonly SORT_OPTIONS = SORT_OPTIONS;

  private sortDropdown = viewChild<ElementRef<HTMLElement>>('sortDropdown');
  count = input.required<number>();
  sortBy = model.required<T>();
  filtersToggle = output<void>();
  sortOpen = signal(false);
  sortLabel = computed(
    () => this.SORT_OPTIONS.find((option) => option.value === this.sortBy())?.label ?? '',
  );

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const element = this.sortDropdown()?.nativeElement;
    if (element && !element.contains(event.target as Node)) {
      this.sortOpen.set(false);
    }
  }

  toggleSortOpen() {
    this.sortOpen.update((open) => !open);
  }

  selectSort(value: T) {
    this.sortBy.set(value);
    this.sortOpen.set(false);
  }
}
