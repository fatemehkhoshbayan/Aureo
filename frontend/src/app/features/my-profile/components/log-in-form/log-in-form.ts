import { AuthService } from '@/services';
import { Component, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile-log-in-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './log-in-form.html',
})
export class ProfileLogInForm {
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly switchToSignUp = output<void>();

  protected readonly submitting = signal(false);
  protected readonly loginError = signal<string | null>(null);

  protected readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onLogin(): void {
    if (this.loginForm.invalid || this.submitting()) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.loginForm.getRawValue();
    this.submitting.set(true);
    this.loginError.set(null);

    this.auth.login(email, password).subscribe({
      next: (user) => {
        this.submitting.set(false);
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        const fallback =
          user.role === 'photographer' || user.role === 'admin'
            ? '/photographer/dashboard'
            : '/my-profile';
        void this.router.navigateByUrl(returnUrl || fallback);
      },
      error: () => {
        this.submitting.set(false);
        this.loginError.set('Incorrect email or password. Please try again.');
      },
    });
  }
}
