import {
  AuthService,
  Booking,
  BookingsService,
  PhotographersService,
  ToastService,
} from '@/services';
import { combineDateAndTime } from '@/utils';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { FormStepBar } from './components/form-step-bar/form-step-bar';
import { PhotographerInfo } from './components/photographer-info/photographer-info';
import { StepOne } from './components/step-one/step-one';
import { StepThree } from './components/step-three/step-three';
import { StepTwo } from './components/step-two/step-two';
import { BookingStep } from './interfaces';

@Component({
  selector: 'app-booking-form',
  imports: [FormStepBar, PhotographerInfo, StepOne, StepTwo, StepThree],
  templateUrl: './booking-form.html',
})
export class BookingForm {
  private readonly route = inject(ActivatedRoute);
  private readonly photographersService = inject(PhotographersService);
  private readonly bookingsService = inject(BookingsService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  protected readonly combineDateAndTime = combineDateAndTime;

  readonly photographerId = toSignal(this.route.paramMap.pipe(map((p) => p.get('id') ?? '')), {
    initialValue: '',
  });

  goBack(): void {
    const id = this.photographerId();
    void this.router.navigate(id ? ['/photographer', id] : ['/']);
  }

  private readonly packageQuery = toSignal(
    this.route.queryParamMap.pipe(map((q) => q.get('package'))),
    { initialValue: null as string | null },
  );

  protected readonly photographersLoading = this.photographersService.loading;

  readonly photographer = computed(() => {
    const id = this.photographerId();
    return id ? this.photographersService.getById(id) : undefined;
  });

  readonly step = signal<BookingStep>(1);
  protected readonly selectedPkgId = signal('');
  protected readonly date = signal('');
  protected readonly time = signal('');
  protected readonly submitting = signal(false);
  protected readonly confirmed = signal<Booking | null>(null);
  protected readonly minDate = new Date().toISOString().slice(0, 10);

  protected readonly selectedPackage = computed(() => {
    const p = this.photographer();
    const id = this.selectedPkgId();
    return p?.packages.find((pkg) => pkg.id === id);
  });

  protected readonly detailsForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
  });

  constructor() {
    effect(() => {
      const p = this.photographer();
      if (!p?.packages.length) return;

      const fromQuery = this.packageQuery();
      const current = this.selectedPkgId();
      if (current && p.packages.some((pkg) => pkg.id === current)) return;

      const match = fromQuery ? p.packages.find((pkg) => pkg.id === fromQuery) : undefined;
      this.selectedPkgId.set(match?.id ?? p.packages[0].id);
    });

    effect(() => {
      const user = this.auth.user();
      if (!user) return;
      this.detailsForm.patchValue({
        name: user.full_name,
        email: user.email,
        phone: user.phone ?? '',
      });
    });
  }

  continueToDetails(): void {
    if (!this.date() || !this.time()) {
      this.toast.add({ type: 'error', message: 'Please select a date and time slot.' });
      return;
    }
    this.step.set(2);
  }

  backToPackage(): void {
    this.step.set(1);
  }

  confirmBooking(): void {
    if (this.detailsForm.invalid || this.submitting()) {
      this.detailsForm.markAllAsTouched();
      return;
    }

    const photographer = this.photographer();
    const pkg = this.selectedPackage();
    if (!photographer || !pkg) {
      this.toast.add({ type: 'error', message: 'Unable to create booking. Please try again.' });
      return;
    }

    this.submitting.set(true);
    this.bookingsService
      .create({
        photographerId: photographer.id,
        packageId: pkg.id,
        scheduledAt: combineDateAndTime(this.date(), this.time()),
        contactEmail: this.detailsForm.controls.email.value,
      })
      .subscribe({
        next: (created) => {
          this.confirmed.set(this.bookingsService.toUiBooking(created));
          this.submitting.set(false);
          this.step.set(3);
          this.toast.add({ type: 'success', message: 'Booking confirmed! Check your email.' });
        },
        error: () => {
          this.submitting.set(false);
          this.toast.add({
            type: 'error',
            message: 'Failed to create booking. Please try again.',
          });
        },
      });
  }
}
