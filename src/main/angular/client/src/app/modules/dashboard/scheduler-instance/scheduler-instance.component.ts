import {Component, OnInit, OnDestroy, Input} from '@angular/core';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
import {DataService} from '../../../services/data.service';
import {Subscription} from 'rxjs';
import * as _ from 'underscore';

@Component({
  selector: 'app-scheduler-instance',
  templateUrl: './scheduler-instance.component.html'
})
export class SchedulerInstanceComponent implements OnInit, OnDestroy {
  mastersList: any = [];
  isLoaded = false;
  subscription: Subscription;
  // tslint:disable-next-line:no-input-rename
  @Input('sizeY') ybody: number;

  constructor(private authService: AuthService, public coreService: CoreService, private dataService: DataService) {
    this.subscription = dataService.eventAnnounced$.subscribe(res => {
      if (res) {
        this.refresh(res);
      }
    });
  }

  ngOnInit() {
    this.getInstances();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  refresh(args) {
    for (let i = 0; i < args.length; i++) {
      if (args[i].eventSnapshots && args[i].eventSnapshots.length > 0) {
        let flag = false;
        for (let j = 0; j < args[i].eventSnapshots.length; j++) {
          if (args[i].eventSnapshots[j].eventType === 'SchedulerStateChanged') {
            this.getInstances();
            flag = true;
            break;
          }
        }
        if (flag) {
          break;
        }
      }
    }
  }

  private getInstances() {
    this.coreService.post('jobscheduler/masters', {
      jobschedulerId: ''
    }).subscribe((res: any) => {
      this.mastersList = [];
      for (let i = 0; i < res.masters.length; i++) {
        if (this.authService.getPermission(res.masters[i].jobschedulerId)) {
          res.masters[i].permission = this.authService.getPermission(res.masters[i].jobschedulerId).JobschedulerMaster;
        }
        this.mastersList.push(res.masters[i]);
      }
      this.isLoaded = true;
    }, () => {
      this.isLoaded = true;
    });
  }

  changeScheduler(id) {
    this.dataService.switchScheduler(id);
  }
}
