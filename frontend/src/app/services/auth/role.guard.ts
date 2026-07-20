import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';
import { ToastService } from '../toast/toast.service';
import { UserRole } from './auth.interfaces';
import { AuthService } from './auth.service';

export function roleGuard(...roles: UserRole[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const toast = inject(ToastService);

    const check = (role: UserRole | undefined): boolean | ReturnType<Router['createUrlTree']> => {
      if (role && roles.includes(role)) {
        return true;
      }
      toast.add({ type: 'error', message: 'You do not have access to that page.' });
      return router.createUrlTree(['/']);
    };

    const user = auth.user();
    if (user) {
      return check(user.role);
    }

    if (!auth.isLoggedIn()) {
      return router.createUrlTree(['/my-profile']);
    }

    // Token exists but /users/me may still be loading
    return auth.loadMe().pipe(
      take(1),
      map((u) => check(u.role)),
    );
  };
}
