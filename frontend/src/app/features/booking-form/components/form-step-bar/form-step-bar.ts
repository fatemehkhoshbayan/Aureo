import { Component, computed, input } from '@angular/core';
import { STEP_LABELS } from '../../constants';
import { BookingStep } from '../../interfaces';

@Component({
  selector: 'app-form-step-bar',
  imports: [],
  templateUrl: './form-step-bar.html',
})
export class FormStepBar {
  readonly step = input.required<BookingStep>();
  protected readonly stepLabels = STEP_LABELS;
  protected readonly progressWidth = computed(() => `${((this.step() - 1) / 2) * 100}%`);
}
