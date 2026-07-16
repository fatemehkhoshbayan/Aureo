import { Photographer } from '@/services';
import { formatPrice } from '@/utils';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-cta-packages',
  imports: [],
  templateUrl: './cta-packages.html',
  host: { class: 'contents' },
})
export class CtaPackages {
  protected readonly formatPrice = formatPrice;
  photographer = input.required<Photographer>();

  setBook() {}
}
