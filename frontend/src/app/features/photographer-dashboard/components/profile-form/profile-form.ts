import { Photographer, PhotographersService } from '@/services';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DASHBOARD_SPECIALTIES } from '../../constants';

@Component({
  selector: 'app-dashboard-profile-form',
  imports: [ReactiveFormsModule],
  templateUrl: './profile-form.html',
})
export class DashboardProfileForm {
  private readonly photographers = inject(PhotographersService);
  private readonly fb = inject(FormBuilder);

  readonly profile = input<Photographer | null>(null);
  readonly isCreate = input(false);
  readonly saved = output<Photographer>();

  protected readonly specialtyOptions = DASHBOARD_SPECIALTIES;
  protected readonly submitting = signal(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly avatarPreview = signal<string | null>(null);
  protected readonly coverPreview = signal<string | null>(null);
  private avatarFile: File | null = null;
  private coverFile: File | null = null;

  protected readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    bio: [''],
    location: [''],
    experience: [0, [Validators.required, Validators.min(0)]],
    startingPrice: [0, [Validators.required, Validators.min(0)]],
    specialties: this.fb.nonNullable.control<string[]>([]),
  });

  constructor() {
    effect(() => {
      const p = this.profile();
      this.patchFromProfile(p);
    });
  }

  hasSpecialty(specialty: string): boolean {
    return this.form.controls.specialties.value.includes(specialty);
  }

  private patchFromProfile(p: Photographer | null): void {
    if (!p) {
      this.form.reset({
        name: '',
        bio: '',
        location: '',
        experience: 0,
        startingPrice: 0,
        specialties: [],
      });
      this.avatarPreview.set(null);
      this.coverPreview.set(null);
      return;
    }

    this.form.patchValue({
      name: p.name,
      bio: p.bio,
      location: p.location,
      experience: p.experience,
      startingPrice: p.startingPrice,
      specialties: [...p.specialties],
    });
    this.avatarPreview.set(this.photographers.mediaUrl(p.avatar));
    this.coverPreview.set(this.photographers.mediaUrl(p.cover));
  }

  toggleSpecialty(specialty: string): void {
    const current = this.form.controls.specialties.value;
    const next = current.includes(specialty)
      ? current.filter((s) => s !== specialty)
      : [...current, specialty];
    this.form.controls.specialties.setValue(next);
  }

  onAvatarSelected(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const file = inputEl.files?.[0] ?? null;
    this.avatarFile = file;
    if (file) {
      this.avatarPreview.set(URL.createObjectURL(file));
    }
  }

  onCoverSelected(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const file = inputEl.files?.[0] ?? null;
    this.coverFile = file;
    if (file) {
      this.coverPreview.set(URL.createObjectURL(file));
    }
  }

  onSubmit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.submitting.set(true);
    this.formError.set(null);

    const payload = {
      name: value.name,
      bio: value.bio,
      location: value.location,
      experience: value.experience,
      startingPrice: value.startingPrice,
      specialties: value.specialties,
    };

    const request$ = this.isCreate()
      ? this.photographers.createMyProfile(payload)
      : this.photographers.updateMyProfile(payload);

    request$.subscribe({
      next: (profile) => {
        this.uploadMediaThenFinish(profile);
      },
      error: (error: HttpErrorResponse) => {
        this.submitting.set(false);
        this.formError.set(this.readApiError(error));
      },
    });
  }

  private uploadMediaThenFinish(profile: Photographer): void {
    if (!this.avatarFile && !this.coverFile) {
      this.submitting.set(false);
      this.saved.emit(profile);
      return;
    }

    const finish = (finalProfile: Photographer) => {
      this.submitting.set(false);
      this.avatarFile = null;
      this.coverFile = null;
      this.saved.emit(finalProfile);
    };

    if (this.avatarFile && this.coverFile) {
      const coverFile = this.coverFile;
      this.photographers.uploadMyAvatar(this.avatarFile).subscribe({
        next: () => {
          this.photographers.uploadMyCover(coverFile).subscribe({
            next: (updated) => finish(updated),
            error: (error: HttpErrorResponse) => {
              this.submitting.set(false);
              this.formError.set(this.readApiError(error));
              this.saved.emit(profile);
            },
          });
        },
        error: (error: HttpErrorResponse) => {
          this.submitting.set(false);
          this.formError.set(this.readApiError(error));
          this.saved.emit(profile);
        },
      });
      return;
    }

    const upload$ = this.avatarFile
      ? this.photographers.uploadMyAvatar(this.avatarFile)
      : this.photographers.uploadMyCover(this.coverFile!);

    upload$.subscribe({
      next: (updated) => finish(updated),
      error: (error: HttpErrorResponse) => {
        this.submitting.set(false);
        this.formError.set(this.readApiError(error));
        this.saved.emit(profile);
      },
    });
  }

  private readApiError(error: HttpErrorResponse): string {
    const detail = error.error?.detail;
    if (typeof detail === 'string' && detail.trim()) {
      return detail;
    }
    return 'Could not save profile. Please try again.';
  }
}
