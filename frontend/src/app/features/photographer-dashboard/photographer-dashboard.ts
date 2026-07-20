import { Photographer, PhotographersService, ToastService } from '@/services';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { DashboardPackagesList } from './components/packages-list/packages-list';
import { DashboardPortfolioManager } from './components/portfolio-manager/portfolio-manager';
import { DashboardProfileForm } from './components/profile-form/profile-form';

@Component({
  selector: 'app-photographer-dashboard',
  imports: [DashboardProfileForm, DashboardPackagesList, DashboardPortfolioManager],
  templateUrl: './photographer-dashboard.html',
})
export class PhotographerDashboard implements OnInit {
  private readonly photographers = inject(PhotographersService);
  private readonly toast = inject(ToastService);

  protected readonly loading = signal(true);
  protected readonly loadError = signal<string | null>(null);
  protected readonly profile = signal<Photographer | null>(null);
  protected readonly needsProfile = signal(false);

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.photographers.getMyProfile().subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.needsProfile.set(false);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        if (error.status === 404) {
          this.profile.set(null);
          this.needsProfile.set(true);
          return;
        }
        this.loadError.set(
          error.status === 0
            ? 'Cannot reach the server. Is the backend running?'
            : 'Could not load your photographer profile.',
        );
      },
    });
  }

  onProfileSaved(profile: Photographer): void {
    this.profile.set(profile);
    this.needsProfile.set(false);
    this.toast.add({ type: 'success', message: 'Profile saved.' });
  }

  onServicesChanged(): void {
    this.reload();
  }

  onPortfolioChanged(): void {
    this.reload();
  }
}
