import { Booking, Photographer } from '@/services';
import { formatDate, formatPrice } from '@/utils';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DetailsForm } from '../../interfaces';

@Component({
  selector: 'app-step-three',
  imports: [RouterLink],
  templateUrl: './step-three.html',
})
export class StepThree {
  protected readonly formatDate = formatDate;
  protected readonly formatPrice = formatPrice;

  booking = input.required<Booking>();
  photographer = input.required<Photographer>();
  detailsForm = input.required<DetailsForm>();

  protected firstName(photographer: Photographer): string {
    return photographer.name.split(' ')[0] ?? photographer.name;
  }
}
