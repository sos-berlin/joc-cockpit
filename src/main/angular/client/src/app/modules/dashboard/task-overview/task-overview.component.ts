import {Component, OnInit, OnDestroy} from '@angular/core';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
import {DataService} from '../../../services/data.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-task-overview',
  templateUrl: './task-overview.component.html'
})
export class TaskOverviewComponent implements OnInit, OnDestroy {

  jobSnapshot: any = {};
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
    this.jobSnapshot = {jobs: {}};
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    if(this.schedulerIds.selected) {
      this.getSnapshot();
    }else{
      this.notAuthenticate = true;
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  refresh(args) {
    for (let i = 0; i < args.length; i++) {
      if (args[i].jobschedulerId === this.schedulerIds.selected) {
        if (args[i].eventSnapshots && args[i].eventSnapshots.length > 0) {
          for (let j = 0; j < args[i].eventSnapshots.length; j++) {
            if (args[i].eventSnapshots[j].eventType === 'JobStateChanged') {
              if (!this.notAuthenticate) {
                this.getSnapshot();
              }
              break;
            }
          }
        }
        break;
      }
    }
  }

  getSnapshot(): void {
    this.coreService.post('jobs/overview/snapshot', {jobschedulerId: this.schedulerIds.selected}).subscribe(res => {
      this.jobSnapshot = res;
      this.isLoaded = true;
    }, (err) => {
      this.notAuthenticate = !err.isPermitted;
      this.isLoaded = true;
    });
  }

}
