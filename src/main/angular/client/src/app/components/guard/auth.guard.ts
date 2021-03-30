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
      const name = state.url === '/dashboard' ? 'Dashboard' : state.url === '/daily_plan' ? 'DailyPlan' : state.url === '/workflows' ? 'WorkFlow' :
        state.url === '/audit_log' ? 'AuditLog' : state.url.match('/resources') ? 'Resource' : state.url === '/history' ? 'History' :
          state.url.match('/configuration') ? 'Configuration' : state.url.match('/users') ? 'ManageAccount' : '';
      // check if route is restricted by role
      if (!this.authService.permissionCheck(name)) {
        // role not authorised so redirect to home page
        this.router.navigate(['/error']);
        return false;
      }
    }
    return true;
  }
}
