import { type Review } from '@/services';
import { formatDate, mediaUrl } from '@/utils';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-reviews',
  imports: [],
  templateUrl: './reviews.html',
  styles: ``,
})
export class Reviews {
  protected readonly formatDate = formatDate;
  protected readonly mediaUrl = mediaUrl;
  reviews = input.required<Review[]>();
}
