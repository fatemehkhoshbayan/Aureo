import { StarRating } from '@/shared';
import { Component, input, output } from '@angular/core';
import { formatPrice } from '../../utils';
import { Photographer } from '../interfaces';

@Component({
  selector: 'app-photographer-card',
  imports: [StarRating],
  templateUrl: './photographer-card.html',
})
export class PhotographerCard {
  protected readonly formatPrice = formatPrice;
  photographer = input.required<Photographer>();
  liked = input.required<boolean>();
  liked_ = output<void>();
  viewed = output<void>();

  onLike(event: Event) {
    event.stopPropagation();
    this.liked_.emit();
  }

  onView() {
    this.viewed.emit();
  }
}
