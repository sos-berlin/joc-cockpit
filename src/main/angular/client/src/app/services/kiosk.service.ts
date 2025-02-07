import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from "../components/guard";

@Injectable({
  providedIn: 'root',
})
export class KioskService {
  kioskValues: any = {};
  private views: any[] = [];

  private currentIndex = 0;
  private kioskInterval: any;

  constructor(private router: Router, private authService: AuthService,) {
    this.loadKioskValues();
  }

   loadKioskValues() {
    this.kioskValues = JSON.parse(sessionStorage.getItem('kioskValues') || '{}');
    this.views = [
      {route: '/dashboard', duration: this.kioskValues.dashboard || 0},
      {route: '/monitor', duration: this.kioskValues.monitorOrderNotification || 0, tabIndex: 2},
      {route: '/monitor', duration: this.kioskValues.monitorSystemNotification || 0, tabIndex: 3},
      {route: '/history', duration: this.kioskValues.historyOrders || 0, historyType: 'ORDER'},
      {route: '/history', duration: this.kioskValues.historyTasks || 0, historyType: 'TASK'},
    ].filter(view => view.duration > 0);

  }

  startKioskMode() {
    this.navigateToNextView();
  }

  stopKioskMode() {
    if (this.kioskInterval) {
      clearInterval(this.kioskInterval);
    }
  }

  checkKioskMode(): boolean {
    const permissions = this.authService.permission ? JSON.parse(this.authService.permission) : {};
    const kioskRole = sessionStorage.getItem('kioskRole');
    if (permissions.roles && Array.isArray(permissions.roles)) {
      return permissions.roles?.includes(kioskRole);
    }

    return false;
  }

  private navigateToNextView() {
    window.dispatchEvent(new Event('refresh-session'));

    const view = this.views[this.currentIndex];
    this.router.navigate([view.route]).then(() => {
      if (view.route === '/monitor' && view.hasOwnProperty('tabIndex')) {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('change-tab', {detail: view.tabIndex}));
        }, 100);
      }

      if (view.route === '/history' && view.hasOwnProperty('historyType')) {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('change-history-type', {detail: view.historyType}));
        }, 100);
      }
    });
    const durationMs = (view.duration || 1) * 1000;
    this.kioskInterval = setTimeout(() => {
      this.currentIndex = (this.currentIndex + 1) % this.views.length;
      this.navigateToNextView();
    }, durationMs);
  }
}
