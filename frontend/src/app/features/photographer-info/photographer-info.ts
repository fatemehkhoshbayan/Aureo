import { Photographer, PhotographersService } from '@/services';
import { mediaUrl } from '@/utils';
import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { AboutPhotographer } from './components/about-photographer/about-photographer';
import { CtaPackages } from './components/cta-packages/cta-packages';

@Component({
  selector: 'app-photographer-info',
  imports: [AboutPhotographer, CtaPackages],
  templateUrl: './photographer-info.html',
})
export class PhotographerInfo {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private photographersService = inject(PhotographersService);

  protected readonly mediaUrl = mediaUrl;
  protected readonly loading = signal(true);

  private readonly photographerId = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('id'))),
    { initialValue: null as string | null },
  );

  protected readonly photographer = toSignal(
    toObservable(this.photographerId).pipe(
      switchMap((id) => {
        if (!id) {
          this.loading.set(false);
          return of(undefined);
        }
        this.loading.set(true);
        return this.photographersService.fetchById(id).pipe(
          tap(() => this.loading.set(false)),
          catchError(() => {
            this.loading.set(false);
            return of(this.photographersService.getById(id));
          }),
        );
      }),
    ),
    { initialValue: undefined as Photographer | undefined },
  );

  protected readonly showLoading = computed(() => this.loading() && !this.photographer());

  goBack() {
    this.router.navigate(['/']);
  }

  toggleLike() {}
}
