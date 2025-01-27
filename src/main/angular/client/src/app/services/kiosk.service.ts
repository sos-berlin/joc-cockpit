import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class KioskService {
  private views = [
    { route: '/dashboard', duration: 20000 },
    { route: '/monitor', duration: 15000, tabIndex: 2 },
    { route: '/monitor', duration: 15000, tabIndex: 3 },
    { route: '/history', duration: 10000 },
  ];

  private currentIndex = 0;
  private kioskInterval: any;

  constructor(private router: Router) {}

  startKioskMode() {
    this.navigateToNextView();
  }

  stopKioskMode() {
    if (this.kioskInterval) {
      clearInterval(this.kioskInterval);
    }
  }

  private navigateToNextView() {
    const view = this.views[this.currentIndex];
    this.router.navigate([view.route]).then(() => {
      if (view.route === '/monitor' && view.hasOwnProperty('tabIndex')) {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('change-tab', { detail: view.tabIndex }));
        }, 100);
      }
    });
    this.kioskInterval = setTimeout(() => {
      this.currentIndex = (this.currentIndex + 1) % this.views.length;
      this.navigateToNextView();
    }, view.duration);
  }
}
