import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-pill',
  standalone: true,
  templateUrl: './pill.html',
})
export class Pill {
  label = input.required<string>();
  value = input.required<string>();
  current = input.required<string>();
  changed = output<string>();

  select() {
    this.changed.emit(this.value());
  }
}
