import { Package, Photographer, PhotographersService } from '@/services';
import { formatPrice } from '@/utils';
import { Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cta-packages',
  imports: [],
  templateUrl: './cta-packages.html',
  host: { class: 'contents' },
})
export class CtaPackages {
  private readonly router = inject(Router);
  private readonly photographers = inject(PhotographersService);

  protected readonly formatPrice = formatPrice;
  photographer = input.required<Photographer>();

  mediaUrl(path: string): string | null {
    return this.photographers.mediaUrl(path);
  }

  /** Prefer camelCase; fall back if API returns snake_case. */
  sampleImages(pkg: Package & { sample_images?: string[] }): string[] {
    return pkg.sampleImages ?? pkg.sample_images ?? [];
  }

  setBook(packageId?: string): void {
    void this.router.navigate(['/book', this.photographer().id], {
      queryParams: packageId ? { package: packageId } : {},
    });
  }
}
