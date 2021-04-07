import {Injectable} from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import {Observable} from 'rxjs';
import {AuthService} from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router, private authService: AuthService) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (this.authService.permission && this.authService.accessTokenId) {
      // check if route is restricted by role
      if (!this.authService.permissionCheck(state.url)) {
        // role not authorised so redirect to home page
        this.router.navigate(['/error']);
        return false;
      }
    }
    return true;
  }
}
