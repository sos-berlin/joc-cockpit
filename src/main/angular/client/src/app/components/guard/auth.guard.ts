import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import { Observable } from 'rxjs';
import {AuthService} from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router, private authService: AuthService) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.authService.permission && this.authService.accessTokenId) {
      // check if route is restricted by role
      if (!this.authService.permissionCheck(state.url)) {
        // role not authorised so redirect to home page
        this.router.navigate(['/error']).then();
        return false;
      } else if (state.url.match('/users')) {
        if (state.url.match('/users/identity_service/') && !sessionStorage['identityServiceType']) {
          this.router.navigate(['/users/identity_service/']).then();
          return false;
        }
      }
    }
    return true;
  }
}
