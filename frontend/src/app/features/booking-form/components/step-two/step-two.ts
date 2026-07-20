import { Package } from '@/services';
import { formatDate, formatPrice } from '@/utils';
import { Component, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { DetailsForm } from '../../interfaces';

@Component({
  selector: 'app-step-two',
  imports: [ReactiveFormsModule],
  templateUrl: './step-two.html',
})
export class StepTwo {
  protected readonly formatDate = formatDate;
  protected readonly formatPrice = formatPrice;

  detailsForm = input.required<DetailsForm>();
  selectedPackage = input<Package | undefined>();
  date = input.required<string>();
  time = input.required<string>();
  submitting = input.required<boolean>();

  backClicked = output<void>();
  confirmClicked = output<void>();

  backToPackage(): void {
    this.backClicked.emit();
  }

  confirmBooking(): void {
    this.confirmClicked.emit();
  }
}
