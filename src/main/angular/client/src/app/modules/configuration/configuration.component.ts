import {Component, HostListener, OnDestroy} from '@angular/core';
import {NavigationEnd, Router, RouterEvent} from '@angular/router';
import {Subscription} from 'rxjs';
import {filter} from 'rxjs/operators';

declare const $;

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html'
})
export class ConfigurationComponent implements OnDestroy {
  subscription: Subscription;

  constructor(private router: Router) {
    this.subscription = router.events
      .pipe(filter((event: RouterEvent) => event instanceof NavigationEnd)).subscribe((e: any) => {
        setTimeout(() => {
          this.calcHeight();
        }, 5);
      });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  calcHeight(): void {
    const dom = $('.scroll-y');
    let count = 0;
    if (dom && dom.position()) {
      const recursiveCheck = () => {
        ++count;
        let top = dom.position().top + 12;
        const flag = top < 78;
        top = top - $(window).scrollTop();
        if (top < 96) {
          top = 96;
        }
        if (this.router.url.match(/file_transfer/) || this.router.url.match(/other/)) {
          top = top + 40;
        }
        $('.sticky').css('top', top + 2);
        const sidebar = $('#sidebar');
        if (sidebar) {
          sidebar.css('top', (top - 17));
          sidebar.height('calc(100vh - ' + (top - 19) + 'px' + ')');
        }
        if (this.router.url.match('inventory')) {
          top = top - 22;
        }
        $('.tree-block').height('calc(100vh - ' + (top + 24) + 'px' + ')');
        if (count < 5) {
          if (top < 170 && flag) {
            setTimeout(() => {
              recursiveCheck();
            }, 5);
          } else {
            let intval = setInterval(() => {
              recursiveCheck();
              clearInterval(intval);
            }, 100);
          }
        }

      };
      recursiveCheck();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event): void {
    this.calcHeight();
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(): void {
    this.calcHeight();
  }
}
