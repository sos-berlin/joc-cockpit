import {inject} from '@angular/core';
import {ActivatedRouteSnapshot, Router, RouterStateSnapshot} from '@angular/router';
import {Observable} from "rxjs";
import {AuthService} from './auth.service';

export const AuthGuard = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.permission && authService.accessTokenId) {
    // check if route is restricted by role
    if (!authService.permissionCheck(state.url)) {
      // role not authorised so redirect to home page
      router.navigate(['/error']).then();
      return false;
    } else if (state.url.match('/users')) {
      if (state.url.match('/users/identity_service/') && !sessionStorage['identityServiceType']) {
        router.navigate(['/users/identity_service/']).then();
        return false;
      }
    }
  }
  return true;
}
