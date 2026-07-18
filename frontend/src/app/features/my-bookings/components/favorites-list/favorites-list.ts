import { FavoritesService, PhotographersService } from '@/services';
import { PhotographerCard } from '@/features/service-list/components/photographer-card/photographer-card';
import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-favorites-list',
  imports: [PhotographerCard, RouterLink],
  templateUrl: './favorites-list.html',
})
export class FavoritesList {
  private readonly favorites = inject(FavoritesService);
  private readonly photographersService = inject(PhotographersService);
  private readonly router = inject(Router);

  protected readonly likedIds = this.favorites.ids;

  protected readonly photographers = computed(() => {
    const liked = this.likedIds();
    return this.photographersService
      .photographers()
      .filter((photographer) => liked.has(photographer.id));
  });

  toggleLike(id: string): void {
    this.favorites.toggle(id);
  }

  onView(id: string): void {
    void this.router.navigate(['/photographer', id]);
  }
}
