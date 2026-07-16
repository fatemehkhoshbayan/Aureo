import { type Review } from '@/services';
import { formatDate } from '@/utils';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-reviews',
  imports: [],
  templateUrl: './reviews.html',
  styles: ``,
})
export class Reviews {
  protected readonly formatDate = formatDate;
  reviews = input.required<Review[]>();
}
