import { Package, Photographer, PhotographersService } from '@/services';
import { formatPrice } from '@/utils';
import { Component, inject, input, model, output } from '@angular/core';
import { TIME_SLOTS } from '../../constants';

@Component({
  selector: 'app-step-one',
  imports: [],
  templateUrl: './step-one.html',
})
export class StepOne {
  private readonly photographers = inject(PhotographersService);

  protected readonly timeSlots = TIME_SLOTS;
  protected readonly formatPrice = formatPrice;

  photographer = input.required<Photographer>();
  selectedPkgId = model.required<string>();
  selectedPackage = input<Package | undefined>();
  date = model.required<string>();
  time = model.required<string>();
  minDate = input.required<string>();
  continueClicked = output<void>();

  mediaUrl(path: string): string | null {
    return this.photographers.mediaUrl(path);
  }

  sampleImages(pkg: Package & { sample_images?: string[] }): string[] {
    return pkg.sampleImages ?? pkg.sample_images ?? [];
  }

  selectPackage(pkg: Package): void {
    this.selectedPkgId.set(pkg.id);
  }

  continueToDetails(): void {
    this.continueClicked.emit();
  }
}
