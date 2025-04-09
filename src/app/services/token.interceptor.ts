import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const accessToken = localStorage.getItem('access_token_secret');
    console.log('Access token from localStorage:', accessToken); // Depuración
    console.log('Request URL:', req.url);
  
    let clonedRequest = req;
    if (accessToken) {
      console.log('Adding token to request:', accessToken); // Depuración
      clonedRequest = this.addTokenToRequest(req, accessToken);
    }
  
    return next.handle(clonedRequest).pipe(
      catchError((error) => {
        console.error('Error occurred in interceptor:', error); // Depuración
        if (error.status === 401 && !req.url.includes('/refresh')) {
          const refreshToken = localStorage.getItem('refresh_token_secret');
          console.log('Refresh token from localStorage:', refreshToken); // Depuración
          if (refreshToken) {
            return this.handle401Error(clonedRequest, next, refreshToken);
          } else {
            this.authService.logout();
            return throwError(() => new Error('No refresh token available. Please log in again.'));
          }
        }
        return throwError(() => error);
      })
    );
  }

  private handle401Error(req: HttpRequest<any>, next: HttpHandler, refreshToken: string): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken(refreshToken).pipe(
        switchMap((response: any) => {
          this.isRefreshing = false;
          const newToken = response.token; // Assuming the backend returns { token: 'new_access_token' }
          localStorage.setItem('access_token', newToken);
          this.refreshTokenSubject.next(newToken);

          // Retry the original request with the new token
          return next.handle(this.addTokenToRequest(req, newToken));
        }),
        catchError((refreshError) => {
          this.isRefreshing = false;
          this.authService.logout();
          return throwError(() => new Error('Failed to refresh token. Please log in again.'));
        })
      );
    } else {
      // If already refreshing, wait for the new token
      return this.refreshTokenSubject.pipe(
        filter((token) => token !== null),
        take(1),
        switchMap((token) => next.handle(this.addTokenToRequest(req, token!)))
      );
    }
  }

  private addTokenToRequest(req: HttpRequest<any>, token: string): HttpRequest<any> {
    console.log('Adding token to request:', token);
    return req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
}