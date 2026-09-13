import { AuthenticationService } from './authentication-service';
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';

export const anonymousGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthenticationService);
  const router = inject(Router);

  return authService.isLoggedIn.pipe(map((val) => {
    return !val ? true : router.parseUrl('');
  }));
};