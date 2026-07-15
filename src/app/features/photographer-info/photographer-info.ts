import { PhotographersService } from '@/services';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
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

  private id = toSignal(this.route.paramMap.pipe(map((p) => p.get('id')!)));

  photographer = computed(() => this.photographersService.getById(this.id()!));

  goBack() {
    this.router.navigate(['/']);
  }

  toggleLike() {}
}
