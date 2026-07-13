import { Component, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';
import { CAROUSEL_SLIDES } from '../constants';

@Component({
  selector: 'app-hero-section',
  imports: [],
  templateUrl: './hero-section.html',
  styles: ``,
})
export class HeroSection {
  protected readonly CAROUSEL_SLIDES = CAROUSEL_SLIDES;
  currentSlide = signal(0);
  protected search = '';

  constructor() {
    interval(4500)
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.currentSlide.update((s) => (s + 1) % this.CAROUSEL_SLIDES.length);
      });
  }

  setSlide(index: number) {
    this.currentSlide.set(index);
  }
}
