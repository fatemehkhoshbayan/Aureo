import { AuthService } from '@/services';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-become-photographer',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './become-photographer.html',
})
export class BecomePhotographer {
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  protected readonly submitting = signal(false);
  protected readonly signUpError = signal<string | null>(null);

  protected readonly signUpForm = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSignUp(): void {
    if (this.signUpForm.invalid || this.submitting()) {
      this.signUpForm.markAllAsTouched();
      return;
    }

    const { fullName, email, password } = this.signUpForm.getRawValue();
    this.submitting.set(true);
    this.signUpError.set(null);

    this.auth
      .register({
        email,
        password,
        full_name: fullName,
        role: 'photographer',
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          void this.router.navigateByUrl('/photographer/dashboard');
        },
        error: (error: HttpErrorResponse) => {
          this.submitting.set(false);
          this.signUpError.set(this.readApiError(error));
        },
      });
  }

  private readApiError(error: HttpErrorResponse): string {
    const detail = error.error?.detail;
    if (typeof detail === 'string' && detail.trim()) {
      return detail;
    }
    return 'Could not create your account. Please try again.';
  }
}
