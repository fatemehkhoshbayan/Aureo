import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../toast/toast.service';
import { AuthService } from './auth.service';

const AUTH_EXEMPT_PATHS = ['/auth/login', '/auth/register'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);

  const isExempt = AUTH_EXEMPT_PATHS.some((path) => req.url.includes(path));
  const token = auth.token();

  const authedReq =
    token && !isExempt ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authedReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !isExempt && auth.isLoggedIn()) {
        auth.logout();
        toast.add({ type: 'error', message: 'Your session has expired. Please log in again.' });
        void router.navigate(['/my-profile'], { queryParams: { returnUrl: router.url } });
      }
      return throwError(() => err);
    }),
  );
};
