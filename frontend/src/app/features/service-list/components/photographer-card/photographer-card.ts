import { Photographer } from '@/services';
import { StarRating } from '@/shared';
import { formatPrice } from '@/utils';
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-photographer-card',
  imports: [StarRating],
  templateUrl: './photographer-card.html',
})
export class PhotographerCard {
  protected readonly formatPrice = formatPrice;
  photographer = input.required<Photographer>();
  liked = input.required<boolean>();
  likeToggled = output<void>();
  viewed = output<string>();

  onLike(event: Event) {
    event.stopPropagation();
    this.likeToggled.emit();
  }

  onView() {
    this.viewed.emit(this.photographer().id);
  }
}
