import {Component, Input} from '@angular/core';
import {Subscription} from 'rxjs';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
import {DataService} from '../../../services/data.service';

@Component({
  selector: 'app-inventory-statistics',
  templateUrl: './inventory-statistics.component.html'
})
export class InventoryStatisticsComponent {
  @Input('sizeX') xbody: number;
  @Input('sizeY') ybody: number;
  statistics: any = {};
  schedulerIds: any = {};
  isLoaded = false;
  notAuthenticate = false;
  subscription: Subscription;

  constructor(private authService: AuthService, private coreService: CoreService, private dataService: DataService) {
    this.subscription = dataService.eventAnnounced$.subscribe(res => {
      if (res) {
        this.refresh(res);
      }
    });
  }

  ngOnInit(): void {
    this.statistics = {};
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    if (this.schedulerIds.selected) {
      this.getStatistics();
    } else {
      this.notAuthenticate = true;
      this.isLoaded = true;
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  refresh(args: { eventSnapshots: any[] }): void {
    if (!this.notAuthenticate) {
      if (args.eventSnapshots && args.eventSnapshots.length > 0) {
        for (let j = 0; j < args.eventSnapshots.length; j++) {
          if (args.eventSnapshots[j].eventType === 'InventoryUpdated' || args.eventSnapshots[j].eventType.match('Item')) {
            this.getStatistics();
            break;
          }
        }
      }
    }
  }

  getStatistics(): void {
    this.coreService.post('inventory/statistics', {controllerId: this.schedulerIds.selected}).subscribe({
      next: res => {
        this.statistics = res;
        this.isLoaded = true;
      }, error: (err) => {
        this.notAuthenticate = !err.isPermitted;
        this.isLoaded = true;
      }
    });
  }
}
