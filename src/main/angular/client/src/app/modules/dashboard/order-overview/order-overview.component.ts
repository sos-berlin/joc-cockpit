import {Component, OnInit, OnDestroy, Input} from '@angular/core';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
import {DataService} from '../../../services/data.service';
import {Subscription} from 'rxjs';
import {Router} from '@angular/router';

@Component({
  selector: 'app-order-overview',
  templateUrl: './order-overview.component.html'
})
export class OrderOverviewComponent implements OnInit, OnDestroy {
  @Input('sizeX') xbody: number;
  @Input('sizeY') ybody: number;
  snapshot: any = {};
  schedulerIds: any = {};
  notAuthenticate = false;
  isLoaded = false;
  subscription: Subscription;

  constructor(public authService: AuthService, public coreService: CoreService,
              private router: Router, private dataService: DataService) {
    this.subscription = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
  }

  ngOnInit() {
    this.snapshot = {orders: {}};
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    if (this.schedulerIds.selected) {
      this.getSnapshot();
    } else {
      this.notAuthenticate = true;
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  refresh(args) {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].eventType.match(/Order/)) {
          this.getSnapshot();
          break;
        }
      }
    }
  }

  getSnapshot(): void {
    this.coreService.post('orders/overview/snapshot', {controllerId: this.schedulerIds.selected}).subscribe(res => {
      this.snapshot = res;
      this.isLoaded = true;
    }, (err) => {
      this.notAuthenticate = !err.isPermitted;
      this.isLoaded = true;
    });
  }

  navigate(state) {
    this.router.navigate(['/orders_overview', state]);
  }

}
