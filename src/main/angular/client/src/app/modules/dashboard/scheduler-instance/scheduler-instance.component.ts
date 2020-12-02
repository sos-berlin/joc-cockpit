import {Component, OnInit, OnDestroy, Input} from '@angular/core';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
import {DataService} from '../../../services/data.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-scheduler-instance',
  templateUrl: './scheduler-instance.component.html'
})
export class SchedulerInstanceComponent implements OnInit, OnDestroy {
  controllersList: any = [];
  isLoaded = false;
  subscription: Subscription;
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
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].eventType === 'ControllerStateChanged') {
          this.getInstances();
          break;
        }
      }
    }
  }

  private getInstances() {
    this.coreService.post('controllers', {
      controllerId: ''
    }).subscribe((res: any) => {
      this.controllersList = [];
      for (let i = 0; i < res.controllers.length; i++) {
        if (this.authService.getPermission(res.controllers[i].controllerId)) {
          res.controllers[i].permission = this.authService.getPermission(res.controllers[i].controllerId).JS7Controller;
        }
        this.controllersList.push(res.controllers[i]);
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
