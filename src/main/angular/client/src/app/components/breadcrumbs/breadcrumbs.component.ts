import {Component} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {filter} from 'rxjs/operators';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss']
})
export class BreadcrumbsComponent {
  static readonly ROUTE_DATA_BREADCRUMB = 'breadcrumb';
  breadcrumbs: any;
  identityServiceName: string | undefined;
  subscription: Subscription;

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    this.subscription = router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.breadcrumbs = this.createBreadcrumbs(this.activatedRoute.root));
  }

  ngOnInit(): void {
    this.breadcrumbs = this.createBreadcrumbs(this.activatedRoute.root);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private createBreadcrumbs(route: ActivatedRoute, url: string = '', breadcrumbs: any = []): any {
    const children: ActivatedRoute[] = route.children;
    this.identityServiceName = sessionStorage['identityServiceName'];

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      if (child.snapshot) {
        const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');
        if (routeURL !== '') {
          url += `/${routeURL}`;
        }

        const label = child.snapshot.data[BreadcrumbsComponent.ROUTE_DATA_BREADCRUMB];
        if (label !== null && label !== undefined) {
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
  }

  backClicked(): void {
    window.history.back();
  }

}
