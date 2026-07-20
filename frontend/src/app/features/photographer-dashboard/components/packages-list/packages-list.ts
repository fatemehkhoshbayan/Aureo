import { Package, PhotographersService, ToastService } from '@/services';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, input, OnDestroy, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin, Observable, of, switchMap } from 'rxjs';

const MAX_SAMPLE_IMAGES = 8;

@Component({
  selector: 'app-dashboard-packages-list',
  imports: [ReactiveFormsModule],
  templateUrl: './packages-list.html',
})
export class DashboardPackagesList implements OnDestroy {
  private readonly photographers = inject(PhotographersService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly packages = input.required<Package[]>();
  readonly changed = output<void>();

  protected readonly showForm = signal(false);
  protected readonly editingId = signal<string | null>(null);
  protected readonly submitting = signal(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly includesText = signal('');
  /** Existing saved sample image paths still shown in the form. */
  protected readonly existingSamples = signal<string[]>([]);
  /** Saved images marked for deletion — applied on Save. */
  protected readonly removedSamples = signal<string[]>([]);
  /** New files picked in the form — uploaded on Save. */
  protected readonly pendingFiles = signal<File[]>([]);
  protected readonly pendingPreviews = signal<string[]>([]);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    duration: ['', Validators.required],
    description: [''],
  });

  protected readonly maxSamples = MAX_SAMPLE_IMAGES;

  ngOnDestroy(): void {
    this.revokePendingPreviews();
  }

  mediaUrl(path: string): string | null {
    return this.photographers.mediaUrl(path);
  }

  sampleCount(): number {
    return this.existingSamples().length + this.pendingFiles().length;
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset({ name: '', price: 0, duration: '', description: '' });
    this.includesText.set('');
    this.existingSamples.set([]);
    this.removedSamples.set([]);
    this.clearPendingFiles();
    this.formError.set(null);
    this.showForm.set(true);
  }

  openEdit(pkg: Package): void {
    this.editingId.set(pkg.id);
    this.form.patchValue({
      name: pkg.name,
      price: pkg.price,
      duration: pkg.duration,
      description: pkg.description,
    });
    this.includesText.set(pkg.includes.join('\n'));
    this.existingSamples.set([...(pkg.sampleImages ?? [])]);
    this.removedSamples.set([]);
    this.clearPendingFiles();
    this.formError.set(null);
    this.showForm.set(true);
  }

  cancelForm(): void {
    this.showForm.set(false);
    this.editingId.set(null);
    this.formError.set(null);
    this.removedSamples.set([]);
    this.clearPendingFiles();
  }

  onIncludesInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.includesText.set(target.value);
  }

  onSamplesSelected(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const files = Array.from(inputEl.files ?? []);
    inputEl.value = '';
    if (!files.length) return;

    const remaining = MAX_SAMPLE_IMAGES - this.sampleCount();
    const toAdd = files.slice(0, Math.max(0, remaining));
    if (!toAdd.length) {
      this.formError.set(`You can add up to ${MAX_SAMPLE_IMAGES} sample images.`);
      return;
    }

    this.formError.set(null);
    const previews = toAdd.map((file) => URL.createObjectURL(file));
    this.pendingFiles.update((current) => [...current, ...toAdd]);
    this.pendingPreviews.update((current) => [...current, ...previews]);
  }

  removePendingFile(index: number): void {
    const preview = this.pendingPreviews()[index];
    if (preview) URL.revokeObjectURL(preview);
    this.pendingFiles.update((files) => files.filter((_, i) => i !== index));
    this.pendingPreviews.update((urls) => urls.filter((_, i) => i !== index));
  }

  removeExistingSample(image: string): void {
    this.existingSamples.update((images) => images.filter((path) => path !== image));
    this.removedSamples.update((images) => [...images, image]);
  }

  onSubmit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const includes = this.includesText()
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const payload = {
      name: value.name,
      price: value.price,
      duration: value.duration,
      description: value.description,
      includes,
    };

    this.submitting.set(true);
    this.formError.set(null);

    const editId = this.editingId();
    const pending = this.pendingFiles();
    const removed = this.removedSamples();
    const request$ = editId
      ? this.photographers.updatePackage(editId, payload)
      : this.photographers.addPackage(payload);

    request$
      .pipe(
        switchMap((pkg) => this.applySampleChanges(pkg.id, removed, pending)),
      )
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.showForm.set(false);
          this.editingId.set(null);
          this.removedSamples.set([]);
          this.clearPendingFiles();
          this.toast.add({
            type: 'success',
            message: editId ? 'Service updated.' : 'Service added.',
          });
          this.changed.emit();
        },
        error: (error: HttpErrorResponse) => {
          this.submitting.set(false);
          this.formError.set(this.readApiError(error));
        },
      });
  }

  deletePackage(pkg: Package): void {
    if (!confirm(`Delete service “${pkg.name}”?`)) return;

    this.photographers.deletePackage(pkg.id).subscribe({
      next: () => {
        this.toast.add({ type: 'success', message: 'Service deleted.' });
        this.changed.emit();
      },
      error: () => {
        this.toast.add({ type: 'error', message: 'Could not delete service.' });
      },
    });
  }

  private applySampleChanges(
    packageId: string,
    removed: string[],
    pending: File[],
  ): Observable<unknown> {
    const ops: Observable<unknown>[] = [
      ...removed.map((image) => this.photographers.deletePackageSample(packageId, image)),
      ...pending.map((file) => this.photographers.addPackageSample(packageId, file)),
    ];
    return ops.length ? forkJoin(ops) : of(null);
  }

  private clearPendingFiles(): void {
    this.revokePendingPreviews();
    this.pendingFiles.set([]);
    this.pendingPreviews.set([]);
  }

  private revokePendingPreviews(): void {
    for (const url of this.pendingPreviews()) {
      URL.revokeObjectURL(url);
    }
  }

  private readApiError(error: HttpErrorResponse): string {
    const detail = error.error?.detail;
    if (typeof detail === 'string' && detail.trim()) {
      return detail;
    }
    return 'Could not save service. Please try again.';
  }
}
