import {Component, Input} from '@angular/core';
import {Subscription} from 'rxjs';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
import {DataService} from '../../../services/data.service';
import {HelpViewerComponent} from "../../../components/help-viewer/help-viewer.component";
import {NzModalService} from "ng-zorro-antd/modal";

@Component({
  standalone: false,
  selector: 'app-scheduler-instance',
  templateUrl: './scheduler-instance.component.html'
})
export class SchedulerInstanceComponent {
  @Input('sizeY') ybody: number;
  @Input() permission: any;

  controllersList: any = [];
  schedulerIds: any;
  isLoaded = false;
  subscription: Subscription;
  preferences: any = {};

  constructor(private authService: AuthService, public coreService: CoreService, private dataService: DataService, private modal: NzModalService) {
    this.subscription = dataService.eventAnnounced$.subscribe(res => {
      if (res) {
        this.refresh(res);
      }
    });
  }

  ngOnInit(): void {
    this.schedulerIds = this.authService.scheduleIds ? JSON.parse(this.authService.scheduleIds) : null;
    this.preferences = sessionStorage['preferences'] ? JSON.parse(sessionStorage['preferences']) : {};
    if (this.schedulerIds) {
      this.getInstances();
    } else {
      this.isLoaded = true;
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  refresh(args: { eventSnapshots: any[] }): void {
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
    }).subscribe({
      next: (res: any) => {
        this.controllersList = res.controllers;
        let controllerIds = this.controllersList.map(item => item.controllerId);
        this.getVesrions(controllerIds);
        this.isLoaded = true;
      }, error: () => this.isLoaded = true
    });
  }

  private getVesrions(controllerIds): void {
    this.coreService.post('joc/versions', {controllerIds}).subscribe({
      next: res => {
        this.controllersList.forEach(controller => {
          for (let i = 0; i < res.controllerVersions.length; i++) {
            if (controller.controllerId === res.controllerVersions[i].controllerId) {
              controller.compatibility = res.controllerVersions[i].compatibility;
              res.controllerVersions.splice(i, 1);
              break;
            }
          }
        })

      }
    });
  }

  changeScheduler(id): void {
    this.dataService.switchScheduler(id);
  }

  helpPage(): void{
    this.modal.create({
      nzTitle: undefined,
      nzContent: HelpViewerComponent,
      nzClassName: 'lg',
      nzData: {
        preferences: this.preferences,
        helpKey: 'dashboard-controller-status'
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    })
  }
}
