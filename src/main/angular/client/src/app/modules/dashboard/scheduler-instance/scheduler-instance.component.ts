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

  private mergeResult(result, res) {
    this.mastersList = [];
    if (!(result && res)) {
      return;
    }
    if (result) {
      for (let i = 0; i < result.masters.length; i++) {
        if (this.authService.getPermission(result.masters[i].jobschedulerId)) {
          result.masters[i].permission = this.authService.getPermission(result.masters[i].jobschedulerId).JobschedulerMaster;
        }
        if (res) {
          for (let j = 0; j < res.masters.length; j++) {
            if (result.masters[i].jobschedulerId === res.masters[j].jobschedulerId &&
              _.isEqual(result.masters[i].role, res.masters[j].role)) {
              this.mastersList.push(_.extend(result.masters[i], res.masters[j]));
              break;
            }
          }
        } else {
          this.mastersList.push(result.masters[i]);
        }
      }
    } else {

      for (let i = 0; i < res.masters.length; i++) {
        if (this.authService.getPermission(res.masters[i].jobschedulerId)) {
          res.masters[i].permission = this.authService.getPermission(res.masters[i].jobschedulerId).JobschedulerMaster;
        }
        this.mastersList.push(res.masters[i]);
      }
    }
  }

  private getVolatile(result) {
    this.coreService.post('jobscheduler/cluster/members', {
      jobschedulerId: ''
    }).subscribe(res => {
      this.mergeResult(result, res);
      this.isLoaded = true;
    }, () => {
      this.mergeResult(result, null);
      this.isLoaded = true;
    });
  }

  getInstances(): void {
    this.coreService.post('jobscheduler/cluster/members/p', {
      jobschedulerId: ''
    }).subscribe(result => {
      this.getVolatile(result);
    }, (err) => {
      this.getVolatile(null);
    });
  }

  changeScheduler(id) {
    this.dataService.switchScheduler(id);
  }
}
