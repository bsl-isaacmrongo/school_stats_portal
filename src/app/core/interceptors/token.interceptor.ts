import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../../auth/auth.service';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = localStorage.getItem('token');
  const request = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  // Token requests must be allowed to fail without recursively refreshing.
  if (req.url.includes('/gettoken')) {
    return next(req);
  }

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) {
        return throwError(() => error);
      }

      return auth.refreshToken().pipe(
        switchMap(refreshed => {
          if (!refreshed) {
            auth.logout();
            return throwError(() => error);
          }

          const refreshedToken = localStorage.getItem('token');
          const retryRequest = refreshedToken
            ? req.clone({ setHeaders: { Authorization: `Bearer ${refreshedToken}` } })
            : req;
          return next(retryRequest);
        })
      );
    })
  );
};