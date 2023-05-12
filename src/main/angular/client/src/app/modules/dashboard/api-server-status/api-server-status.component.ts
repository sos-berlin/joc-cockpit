import {Component, OnInit, OnDestroy, Input} from '@angular/core';
import {Subscription} from 'rxjs';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
import {DataService} from '../../../services/data.service';

@Component({
  selector: 'app-api-server-status',
  templateUrl: './api-server-status.component.html'
})
export class APIServerStatusComponent implements OnInit, OnDestroy {
  @Input('sizeY') ybody: number;
  @Input() permission: any;

  list: any = [];
  schedulerIds: any;
  isLoaded = false;
  subscription: Subscription;

  constructor(private authService: AuthService, public coreService: CoreService, private dataService: DataService) {
    this.subscription = dataService.eventAnnounced$.subscribe(res => {
      if (res) {
        this.refresh(res);
      }
    });
  }

  ngOnInit(): void {
    this.schedulerIds = this.authService.scheduleIds ? JSON.parse(this.authService.scheduleIds) : null;
    if (this.schedulerIds) {
      this.getInstances();
    } else {
      this.isLoaded = true;
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  refresh(args): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].eventType === 'JOCStateChanged') {
          this.getInstances();
          break;
        }
      }
    }
  }

  private getInstances(): void {
    this.coreService.post('jocs', {
      controllerId: ''
    }).subscribe({
      next: (res: any) => {
        this.list = res.jocs;
        this.isLoaded = true;
      }, error: () => this.isLoaded = true
    });
  }

  removeInstance(id): void {
    console.log('todo')
  }
}
