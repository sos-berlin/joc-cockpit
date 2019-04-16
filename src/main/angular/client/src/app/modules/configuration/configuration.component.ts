import {Component, HostListener} from '@angular/core';
import {Router} from '@angular/router';

declare const $;

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html'
})
export class ConfigurationComponent {

  constructor(private router: Router) {
    router.events.subscribe((e: any) => {
      if (e.url && e.url.match('configuration')) {
        setTimeout(() => {
          this.calcHeight();
        }, 5);
      }
    });
  }

  calcHeight() {
    const dom = $('.scroll-y');
    if (dom && dom.position()) {
      let top = dom.position().top + 12;
      const flag = top < 78;
      top = top - $(window).scrollTop();
      if (top < 96) {
        top = 96;
      }
      $('.sticky').css('top', top);
      const sidebar = $('#sidebar');
      if (sidebar) {
        sidebar.css('top', (top - 19));
        sidebar.height('calc(100vh - ' + (top - 19) + 'px' + ')');
        $('.property-panel').css('top', (top + 16));
      }
      const graph = $('#graph');
      if (graph) {
        graph.slimscroll({height: 'calc(100vh - ' + (top + 10) + 'px' + ')'});
      }
      $('.tree-block').height('calc(100vh - ' + (top + 24) + 'px' + ')');

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
