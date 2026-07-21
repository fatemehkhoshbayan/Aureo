import { ContactService, ToastService } from '@/services';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

const CONTACT_EMAIL = 'f.khoshbayan@gmail.com';

@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule],
  templateUrl: './contact.html',
})
export class Contact {
  private readonly fb = inject(FormBuilder);
  private readonly contactService = inject(ContactService);
  private readonly toast = inject(ToastService);

  protected readonly contactEmail = CONTACT_EMAIL;
  protected readonly submitting = signal(false);
  protected readonly sendError = signal<string | null>(null);

  protected readonly contactForm = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    message: ['', Validators.required],
  });

  onSend(): void {
    if (this.contactForm.invalid || this.submitting()) {
      this.contactForm.markAllAsTouched();
      return;
    }

    const { fullName, message } = this.contactForm.getRawValue();
    this.submitting.set(true);
    this.sendError.set(null);

    this.contactService.send({ fullName, message }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.contactForm.reset();
        this.toast.add({ type: 'success', message: "Message sent, we'll get back to you soon." });
      },
      error: (error: HttpErrorResponse) => {
        this.submitting.set(false);
        this.sendError.set(this.readApiError(error));
      },
    });
  }

  private readApiError(error: HttpErrorResponse): string {
    const detail = error.error?.detail;
    if (typeof detail === 'string' && detail.trim()) {
      return detail;
    }
    return 'Could not send your message. Please try again.';
  }
}
