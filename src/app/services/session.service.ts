import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  constructor(
    private router: Router,
    private toastr: ToastrService,
    private authService: AuthService
  ) {}

  handleSessionExpiration(): void {
    const confirmExtendSession = window.confirm(
      'Su sesión ha caducado. ¿Desea extender la sesión?'
    );

    if (confirmExtendSession) {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        this.authService.refreshToken(refreshToken).subscribe({
          next: (newToken: any) => {
            localStorage.setItem('access_token', newToken.token);
            this.toastr.success('Sesión extendida con éxito.', 'Éxito', {
              timeOut: 3000,
              closeButton: true
            });
          },
          error: () => {
            this.toastr.error(
              'No se pudo extender la sesión. Por favor, inicie sesión nuevamente.',
              'Error',
              {
                timeOut: 3000,
                closeButton: true
              }
            );
            this.router.navigate(['/login']);
          }
        });
      } else {
        this.toastr.error(
          'No se encontró un token de actualización. Por favor, inicie sesión nuevamente.',
          'Error',
          {
            timeOut: 3000,
            closeButton: true
          }
        );
        this.router.navigate(['/login']);
      }
    } else {
      this.router.navigate(['/login']);
    }
  }
}