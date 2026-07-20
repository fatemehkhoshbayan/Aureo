import { PhotographersService, PortfolioItem, ToastService } from '@/services';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, input, OnDestroy, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

const MAX_PENDING_PHOTOS = 12;

@Component({
  selector: 'app-dashboard-portfolio-manager',
  imports: [FormsModule],
  templateUrl: './portfolio-manager.html',
})
export class DashboardPortfolioManager implements OnDestroy {
  private readonly photographers = inject(PhotographersService);
  private readonly toast = inject(ToastService);

  readonly items = input.required<PortfolioItem[]>();
  /** Photographer specialties used as portfolio category options. */
  readonly categories = input<string[]>([]);
  readonly changed = output<void>();

  protected readonly showForm = signal(false);
  protected readonly submitting = signal(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly category = signal('');
  protected readonly alt = signal('');
  protected readonly pendingFiles = signal<File[]>([]);
  protected readonly pendingPreviews = signal<string[]>([]);

  protected readonly maxPending = MAX_PENDING_PHOTOS;

  ngOnDestroy(): void {
    this.revokePendingPreviews();
  }

  mediaUrl(path: string): string | null {
    return this.photographers.mediaUrl(path);
  }

  openForm(): void {
    const cats = this.categories();
    this.category.set(cats[0] ?? '');
    this.alt.set('');
    this.formError.set(null);
    this.clearPendingFiles();
    this.showForm.set(true);
  }

  cancelForm(): void {
    this.showForm.set(false);
    this.formError.set(null);
    this.clearPendingFiles();
  }

  onPhotosSelected(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const files = Array.from(inputEl.files ?? []);
    inputEl.value = '';
    if (!files.length) return;

    const remaining = MAX_PENDING_PHOTOS - this.pendingFiles().length;
    const toAdd = files.slice(0, Math.max(0, remaining));
    if (!toAdd.length) {
      this.formError.set(`You can add up to ${MAX_PENDING_PHOTOS} photos at a time.`);
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

  onSubmit(): void {
    const pending = this.pendingFiles();
    if (!pending.length || this.submitting()) {
      if (!pending.length) {
        this.formError.set('Add at least one photo before saving.');
      }
      return;
    }

    const category = this.category().trim();
    if (!category) {
      this.formError.set('Select a category for these photos.');
      return;
    }

    const altBase = this.alt().trim();

    this.submitting.set(true);
    this.formError.set(null);

    forkJoin(
      pending.map((file) =>
        this.photographers.addPortfolioItem(file, category, altBase || file.name),
      ),
    ).subscribe({
      next: () => {
        this.submitting.set(false);
        this.showForm.set(false);
        this.clearPendingFiles();
        this.toast.add({
          type: 'success',
          message: pending.length === 1 ? 'Photo added to portfolio.' : 'Photos added to portfolio.',
        });
        this.changed.emit();
      },
      error: (error: HttpErrorResponse) => {
        this.submitting.set(false);
        const detail = error.error?.detail;
        this.formError.set(
          typeof detail === 'string' && detail.trim()
            ? detail
            : 'Could not upload photo(s). Please try again.',
        );
      },
    });
  }

  deleteItem(item: PortfolioItem): void {
    if (!confirm('Remove this photo from your portfolio?')) return;

    this.photographers.deletePortfolioItem(item.id).subscribe({
      next: () => {
        this.toast.add({ type: 'success', message: 'Photo removed.' });
        this.changed.emit();
      },
      error: () => {
        this.toast.add({ type: 'error', message: 'Could not remove photo.' });
      },
    });
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
}
