import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-error',
  templateUrl: './page-not-found.component.html'
})
export class PageNotFoundComponent {
  code = '403';

  constructor(private router: Router) {
  }

  ngOnInit(): void {
    if (this.router.url && this.router.url.match(/404/)) {
      this.code = '404';
    }
  }

  backHome(): void {
    this.router.navigate(['/dashboard']).then();
  }
}
