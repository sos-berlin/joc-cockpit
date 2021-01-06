import {Component, OnInit, OnDestroy} from '@angular/core';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
import {DataService} from '../../../services/data.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-inventory-statistics',
  templateUrl: './inventory-statistics.component.html'
})
export class InventoryStatisticsComponent implements OnInit, OnDestroy {
  statistics: any = {};
  schedulerIds: any = {};
  isLoaded = false;
  notAuthenticate = false;
  subscription: Subscription;

  constructor(private authService: AuthService, private coreService: CoreService, private dataService: DataService) {
    this.subscription = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
  }

  ngOnInit() {
    this.statistics = {};
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    if (this.schedulerIds.selected) {
      this.getStatistics();
    } else {
      this.notAuthenticate = true;
      this.isLoaded = true;
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  refresh(args) {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].eventType === 'ItemAdded' || args.eventSnapshots[j].eventType === 'ItemUpdated') {
          if (!this.notAuthenticate) {
            this.getStatistics();
          }
          break;
        }
      }
    }
  }

  getStatistics(): void {
    this.coreService.post('inventory/statistics', {controllerId: this.schedulerIds.selected}).subscribe(res => {
      this.statistics = res;
      this.isLoaded = true;
    }, (err) => {
      this.notAuthenticate = !err.isPermitted;
      this.isLoaded = true;
    });
  }
}
