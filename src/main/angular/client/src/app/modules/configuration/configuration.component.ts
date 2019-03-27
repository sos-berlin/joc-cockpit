import {Component, HostListener, OnInit} from '@angular/core';
import {Router} from '@angular/router';

declare const $;

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html'
})
export class ConfigurationComponent {

  constructor(private router: Router) {
    router.events.subscribe((e: any) => {
      if (e.url) {
        this.calcHeight();
      }
    });
  }

  calcHeight() {
    const dom = $('.scroll-y');
    if (dom && dom.position()) {
      let top = dom.position().top + 12;
      let flag = top < 70;
      top = top - $(window).scrollTop();
      if (top < 70) {
        top = 92;
      }
      $('.sticky').css('top', top);
      const ht = window.innerHeight - top;
      if (ht > 400) {
        if ($('#graph')) {
          $('#graph').height(ht + 'px');
        }
        $('.tree-block').height((ht - 24 + $(window).scrollTop()) + 'px');
      }
      if (top < 139 && flag) {
        setTimeout(() => {
          this.calcHeight();
        }, 5);
      }
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.calcHeight();
  }

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    this.calcHeight();
  }
}
