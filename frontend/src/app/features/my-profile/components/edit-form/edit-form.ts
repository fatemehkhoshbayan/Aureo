import { AuthService } from '@/services';
import { Component, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileDraft, ProfileSavePayload } from '../../interfaces';

@Component({
  selector: 'app-profile-edit-form',
  imports: [ReactiveFormsModule],
  templateUrl: './edit-form.html',
})
export class ProfileEditForm {
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  profile = input.required<ProfileDraft>();
  saved = output<ProfileSavePayload>();
  cancelled = output<void>();

  protected readonly previewUrl = signal<string | null>(null);
  protected readonly avatarFile = signal<File | null>(null);

  protected readonly draftForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    location: [''],
  });

  constructor() {
    effect(() => {
      const profile = this.profile();
      this.draftForm.setValue({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        location: profile.location,
      });
      if (!this.avatarFile()) {
        this.previewUrl.set(this.auth.avatarUrl(profile.avatar));
      }
    });
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (!file) return;

    this.avatarFile.set(file);
    const reader = new FileReader();
    reader.onload = () => this.previewUrl.set(String(reader.result));
    reader.readAsDataURL(file);
  }

  cancelEdit(): void {
    this.avatarFile.set(null);
    this.previewUrl.set(this.auth.avatarUrl(this.profile().avatar));
    this.cancelled.emit();
  }

  saveProfile(): void {
    if (this.draftForm.invalid) {
      this.draftForm.markAllAsTouched();
      return;
    }

    const values = this.draftForm.getRawValue();
    this.saved.emit({
      draft: {
        ...values,
        avatar: this.profile().avatar,
      },
      avatarFile: this.avatarFile(),
    });
  }
}
