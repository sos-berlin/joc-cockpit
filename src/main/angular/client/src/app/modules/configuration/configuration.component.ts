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
        this.calcHeigth();
      }
    });
  }

  calcHeigth() {
    let dom = $('.scroll-y');
    if (dom && dom.position()) {
      let top = dom.position().top + 16;
      top = top - $(window).scrollTop();
      if (top < 1) {
        top = 64;
      }
      $('.sticky').css('top', top);
      const ht = window.innerHeight - top;
      if (ht > 400) {
        if ($('#graph')) {
          $('#graph').height(ht - 60 + 'px');
        }
        $('.tree-block').height((ht - 20) + 'px');
      }
      if (top < 134 && top > 50) {
        setTimeout(() => {
          this.calcHeigth();
        }, 5);
      }
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.calcHeigth();
  }

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    this.calcHeigth();
  }
}
