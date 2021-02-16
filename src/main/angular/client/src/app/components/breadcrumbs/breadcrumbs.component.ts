import {Component, OnDestroy, OnInit} from '@angular/core';
import {isNullOrUndefined} from 'util';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {filter} from 'rxjs/operators';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss']
})
export class BreadcrumbsComponent implements OnInit, OnDestroy {
  static readonly ROUTE_DATA_BREADCRUMB = 'breadcrumb';
  breadcrumbs: any;
  subscription: Subscription;

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.breadcrumbs = this.createBreadcrumbs(this.activatedRoute.root);
    this.subscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.breadcrumbs = this.createBreadcrumbs(this.activatedRoute.root));
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private createBreadcrumbs(route: ActivatedRoute, url: string = '', breadcrumbs: any = []): any {
    const children: ActivatedRoute[] = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');
      if (routeURL !== '') {
        url += `/${routeURL}`;
      }

      const label = child.snapshot.data[BreadcrumbsComponent.ROUTE_DATA_BREADCRUMB];
      if (!isNullOrUndefined(label)) {
        let flag = true;
        if (breadcrumbs.length > 0) {
          for (const bc of breadcrumbs) {
            if (bc.label === label) {
              flag = false;
              break;
            }
          }
        }
        if (flag) {
          breadcrumbs.push({label, url});
        }
      }
      return this.createBreadcrumbs(child, url, breadcrumbs);
    }
  }

  backClicked() {
    window.history.back();
  }

}
