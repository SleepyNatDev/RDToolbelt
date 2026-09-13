import { AuthenticationService } from './authentication-service';
import { inject } from '@angular/core';
import { CanActivateFn, GuardResult, MaybeAsync, Router, UrlTree } from '@angular/router';
import { map, Observable, take } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) =>  {
  const authService = inject(AuthenticationService);
  const router = inject(Router);

  return authService.isLoggedIn.pipe(map((val) => {
    return val ? true : router.parseUrl('/login');
  }));
  //return authService.authCall().pipe(map(val => val ? true : router.parseUrl('/login')));
};
