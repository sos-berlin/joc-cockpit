import {Component, OnInit, OnDestroy, Input} from '@angular/core';
import {Subscription} from 'rxjs';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
import {DataService} from '../../../services/data.service';

@Component({
  selector: 'app-scheduler-instance',
  templateUrl: './scheduler-instance.component.html'
})
export class SchedulerInstanceComponent implements OnInit, OnDestroy {
  @Input('sizeY') ybody: number;
  @Input() permission: any;

  controllersList: any = [];
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
    } else{
      this.isLoaded = true;
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  refresh(args): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if ((args.eventSnapshots[j].eventType === 'ControllerStateChanged' ||
          args.eventSnapshots[j].eventType === 'ProxyCoupled' ||
          args.eventSnapshots[j].eventType === 'ProxyDecoupled')) {
          this.getInstances();
          break;
        }
      }
    }
  }

  private getInstances(): void {
    this.coreService.post('controllers', {
      controllerId: ''
    }).subscribe((res: any) => {
      this.controllersList = res.controllers;
      this.isLoaded = true;
    }, () => {
      this.isLoaded = true;
    });
  }

  changeScheduler(id): void {
    this.dataService.switchScheduler(id);
  }
}
