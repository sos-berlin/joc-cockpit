import { Component, OnInit, OnDestroy } from '@angular/core';
import { CoreService } from '../../../services/core.service';
import { AuthService } from '../../../components/guard/auth.service';
import { DataService } from '../../../services/data.service';
import { Subscription }   from 'rxjs/Subscription';

@Component({
  selector: 'app-order-overview',
  templateUrl: './order-overview.component.html',
  styleUrls: ['./order-overview.component.css']
})
export class OrderOverviewComponent implements OnInit,OnDestroy {

  snapshot: any ={};
  schedulerIds: any ={};
  notAuthenticate: boolean = false;
  isLoaded: boolean = false;
  subscription: Subscription;

  constructor(public authService: AuthService, public coreService: CoreService, private dataService: DataService) {
    this.subscription = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
  }

  refresh(args) {
    for (let i = 0; i < args.length; i++) {
      if (args[i].jobschedulerId == this.schedulerIds.selected) {
        if (args[i].eventSnapshots && args[i].eventSnapshots.length > 0) {
          for (let j = 0; j < args[i].eventSnapshots.length; j++) {
            if (args[i].eventSnapshots[j].eventType === "OrderStateChanged") {
              this.getSnapshot();
              break;
            }
          }
        }
        break
      }
    }
  }

  getSnapshot(): void {
    this.coreService.post('orders/overview/snapshot', {jobschedulerId: this.schedulerIds.selected}).subscribe(res => {
      this.snapshot = res;
      this.isLoaded = true;
    }, (err) => {
      this.notAuthenticate = !err.isPermitted;
      this.isLoaded = true;
    });
  }

  ngOnInit() {
    this.snapshot = {orders: {}};
    this.schedulerIds = JSON.parse(this.authService.scheduleIds);
    this.getSnapshot();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
