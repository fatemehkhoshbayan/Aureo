import { Component, model, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';
import { CAROUSEL_SLIDES } from '../constants';

@Component({
  selector: 'app-hero-section',
  templateUrl: './hero-section.html',
})
export class HeroSection {
  protected readonly CAROUSEL_SLIDES = CAROUSEL_SLIDES;
  currentSlide = signal(0);
  search = model.required<string>();

  constructor() {
    interval(4500)
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.currentSlide.update((slide) => (slide + 1) % this.CAROUSEL_SLIDES.length);
      });
  }

  setSlide(index: number) {
    this.currentSlide.set(index);
  }

  onSearchInput(value: string) {
    this.search.set(value);
  }
}
