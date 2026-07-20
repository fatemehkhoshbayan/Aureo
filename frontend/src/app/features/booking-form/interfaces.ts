import { FormControl, FormGroup } from '@angular/forms';

export type BookingStep = 1 | 2 | 3;

export type DetailsForm = FormGroup<{
  name: FormControl<string>;
  email: FormControl<string>;
  phone: FormControl<string>;
}>;
