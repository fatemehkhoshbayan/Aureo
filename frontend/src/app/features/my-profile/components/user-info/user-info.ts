import { AuthService } from '@/services';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { switchMap } from 'rxjs';
import { ProfileDraft, ProfileSavePayload } from '../../interfaces';
import { ProfileEditForm } from '../edit-form/edit-form';

@Component({
  selector: 'app-profile-user-info',
  imports: [ProfileEditForm],
  templateUrl: './user-info.html',
})
export class ProfileUserInfo {
  private readonly auth = inject(AuthService);

  protected readonly editing = signal(false);
  protected readonly saving = signal(false);
  protected readonly saveError = signal<string | null>(null);

  protected readonly profile = signal<ProfileDraft>({
    name: '',
    email: '',
    phone: '',
    location: '',
    avatar: null,
  });

  protected readonly initials = computed(() =>
    this.profile()
      .name.split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('')
      .slice(0, 2),
  );

  protected readonly avatarUrl = computed(() => this.auth.avatarUrl(this.profile().avatar));

  constructor() {
    effect(() => {
      const user = this.auth.user();
      if (!user || this.editing()) return;

      this.profile.set({
        name: user.full_name,
        email: user.email,
        phone: user.phone ?? '',
        location: user.location ?? '',
        avatar: user.avatar,
      });
    });
  }

  startEdit(): void {
    this.saveError.set(null);
    this.editing.set(true);
  }

  cancelEdit(): void {
    this.editing.set(false);
    this.saveError.set(null);
  }

  saveProfile({ draft, avatarFile }: ProfileSavePayload): void {
    if (this.saving()) return;

    this.saving.set(true);
    this.saveError.set(null);

    const profileUpdate$ = this.auth.updateProfile({
      full_name: draft.name,
      email: draft.email,
      phone: draft.phone || null,
      location: draft.location || null,
    });

    const save$ = avatarFile
      ? this.auth.uploadAvatar(avatarFile).pipe(switchMap(() => profileUpdate$))
      : profileUpdate$;

    save$.subscribe({
      next: (user) => {
        this.profile.set({
          name: user.full_name,
          email: user.email,
          phone: user.phone ?? '',
          location: user.location ?? '',
          avatar: user.avatar,
        });
        this.saving.set(false);
        this.editing.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.saving.set(false);
        this.saveError.set(this.readApiError(error));
      },
    });
  }

  private readApiError(error: HttpErrorResponse): string {
    const detail = error.error?.detail;
    if (typeof detail === 'string' && detail.trim()) {
      return detail;
    }
    if (Array.isArray(detail) && detail.length > 0) {
      return detail
        .map((item: { msg?: string }) => item.msg)
        .filter(Boolean)
        .join(' ');
    }
    if (error.status === 0) {
      return 'Cannot reach the server. Is the backend running?';
    }
    return 'Could not save profile. Please try again.';
  }
}
