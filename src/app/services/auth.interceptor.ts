import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable, catchError, switchMap, throwError, of } from 'rxjs';
import { AuthService } from './auth.service';

let isRefreshing = false; // Bandera para evitar múltiples solicitudes de refresh
let refreshTokenSubject: string | null = null; // Almacena el nuevo token temporalmente

export function jwtInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  console.log("Dentro del interceptador");

  const token = localStorage.getItem('access_token');
  const router = inject(Router);
  const toastr = inject(ToastrService);
  const authService = inject(AuthService);

  // Agregar el token al encabezado de la solicitud si existe
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error) => {
      // Si el error es 401 (no autorizado), intentar renovar el token
      if (error.status === 401 || error.status === 403 || error.status === 500) {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          if (!isRefreshing) {
            return authService.refreshToken(refreshToken).pipe(
              switchMap((newToken: any) => {
                localStorage.setItem('access_token', newToken.token);
                // Clonar la solicitud original con el nuevo token
                const clonedRequest = req.clone({
                  setHeaders: {
                    Authorization: `Bearer ${newToken.token}`
                  }
                });

                return next(clonedRequest);
              }),
              catchError((refreshError) => {
                // Si la renovación falla, cerrar sesión
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                toastr.error(
                  'Su sesión ha expirado. Por favor, inicie sesión nuevamente.',
                  'Sesión Expirada',
                  {
                    timeOut: 3000,
                    closeButton: true
                  }
                );
                router.navigate(['/login']);
                return throwError(() => refreshError);
              })
            );
          } else {
            // Si ya se está renovando el token, esperar a que se complete
            return of(null).pipe(
              switchMap(() => {
                if (refreshTokenSubject) {
                  const clonedRequest = req.clone({
                    setHeaders: {
                      Authorization: `Bearer ${refreshTokenSubject}`
                    }
                  });
                  return next(clonedRequest);
                }
                return throwError(() => error);
              })
            );
          }
        } else {
          // Si no hay refresh token, cerrar sesión
          localStorage.removeItem('access_token');
          toastr.error(
            'Su sesión ha expirado. Por favor, inicie sesión nuevamente.',
            'Sesión Expirada',
            {
              timeOut: 3000,
              closeButton: true
            }
          );
          router.navigate(['/login']);
        }
      }

      // Si no es un error 401, devolver el error original
      return throwError(() => error);
    })
  );
}