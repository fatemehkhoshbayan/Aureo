import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

interface Star {
  id: number;
  active: boolean;
}

@Component({
  selector: 'app-star-rating',
  templateUrl: './star-rating.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StarRating {
  rating = input.required<number>();
  maxStars = input(5);
  size = input(20);

  stars = computed<Star[]>(() =>
    Array.from({ length: this.maxStars() }, (_, index) => ({
      id: index,
      active: index < this.rating(),
    })),
  );
}
