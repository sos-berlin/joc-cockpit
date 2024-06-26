import {Component, Input} from '@angular/core';
import {Subscription} from 'rxjs';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
import {DataService} from '../../../services/data.service';
import {UpdateUrlModalComponent} from "../dashboard.component";
import {NzModalService} from "ng-zorro-antd/modal";

@Component({
  selector: 'app-api-server-status',
  templateUrl: './api-server-status.component.html'
})
export class APIServerStatusComponent {
  @Input('sizeY') ybody: number;
  @Input() permission: any;

  list: any = [];
  schedulerIds: any;
  isLoaded = false;
  joc: any;
  subscription: Subscription;

  constructor(private authService: AuthService, public coreService: CoreService, private dataService: DataService, public modal: NzModalService) {
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

  refresh(args: { eventSnapshots: any[] }): void {
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
      onlyApiServer: true
    }).subscribe({
      next: (res: any) => {
        this.list = res.jocs;
        this.isLoaded = true;
      }, error: () => this.isLoaded = true
    });
  }

  removeInstance(id): void {
    this.coreService.post('joc/cluster/delete_member', {memberId: id}).subscribe()
  }

  updateURL(item): void{
    this.modal.create({
      nzTitle: undefined,
      nzContent: UpdateUrlModalComponent,
      nzData: {
        joc: item
      },
      nzFooter: null,
      nzAutofocus: null,
      nzClosable: false,
      nzMaskClosable: false
    });
  }
}
