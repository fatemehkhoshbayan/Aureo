import { AuthService } from '@/services';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile-sign-up-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './sign-up-form.html',
})
export class ProfileSignUpForm {
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly switchToLogin = output<void>();

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

    this.auth.register({ email, password, full_name: fullName }).subscribe({
      next: () => {
        this.submitting.set(false);
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/my-profile';
        void this.router.navigateByUrl(returnUrl);
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
