import {Component, OnInit, OnDestroy, Input} from '@angular/core';
import {Subscription} from 'rxjs';
import {CoreService} from '../../../services/core.service';
import {DataService} from '../../../services/data.service';
import {AuthService} from '../../../components/guard';
import {SearchPipe} from '../../../pipes/core.pipe';
import {Router} from '@angular/router';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-acknowledge-modal',
  templateUrl: './acknowledge.dialog.html'
})
export class AcknowledgeModalComponent {
  @Input() data: any;
  submitted = false;
  comment: string;

  constructor(public coreService: CoreService, public activeModal: NzModalRef) {
  }

  onSubmit(): void {
    this.submitted = true;
    this.coreService.post('monitoring/notification/acknowledge', {
      ...this.data, comment: this.comment
    }).subscribe(res => {
      this.submitted = false;
      this.activeModal.close(res);
    }, err => {
      this.submitted = false;
    });
  }

}

@Component({
  selector: 'app-notification-monitor',
  templateUrl: './notification-monitor.component.html'
})
export class NotificationMonitorComponent implements OnInit, OnDestroy {
  @Input() permission: any;
  @Input() preferences: any = {};
  @Input() schedulerIds: any = {};
  @Input() filters: any = {};

  isLoaded = false;
  notifications = [];
  data = [];
  currentData = [];
  object = {
    checked: false,
    indeterminate: false
  };

  searchableProperties = ['controllerId', 'type', 'job', 'job', 'exitCode', 'message', 'orderId', 'workflow', 'created'];

  subscription1: Subscription;
  subscription2: Subscription;

  constructor(public coreService: CoreService, private authService: AuthService, private router: Router,
              private modal: NzModalService, private dataService: DataService, private searchPipe: SearchPipe) {
    this.subscription1 = dataService.eventAnnounced$.subscribe(res => {
      if (res) {
        this.refresh(res);
      }
    });

    this.subscription2 = dataService.functionAnnounced$.subscribe((res: any) => {
      if (res) {
        if (res.filter) {
          this.getData();
        } else if (res.action) {
          this.acknowledge(null);
        }
      }
    });
  }

  ngOnInit(): void {
    this.filters.mapOfCheckedId.clear();
    this.getData();
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
  }

  refresh(args): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].eventType === 'MONITORINGNOTIFICATION') {
          this.getData();
          break;
        }
      }
    }
  }


  private getData(): void {
    const notificationIds = new Map();
    this.data.forEach((item) => {
      if (item.show) {
        notificationIds.set(item.notificationId, item.monitors);
      }
    });
    let obj: any = {
      controllerId: this.filters.filter.current == true ? this.schedulerIds.selected : '',
      limit: parseInt(this.preferences.maxAuditLogRecords, 10) || 5000,
      timeZone: this.preferences.timeZone
    };
    obj.types = this.filters.filter.types;
    if (this.filters.filter.date && this.filters.filter.date !== 'ALL') {
      obj.dateFrom = this.filters.filter.date;
    }
    this.coreService.post('monitoring/notifications', obj).subscribe((res: any) => {
      this.notifications = res.notifications;
      if (notificationIds && notificationIds.size > 0) {
        res.notifications.forEach((value) => {
          if (notificationIds.has(value.notificationId)) {
            value.show = true;
            value.isLoaded = true;
            value.monitors = notificationIds.get(value.notificationId);
          }
        });
      }
      this.searchInResult();
      this.isLoaded = true;
    }, () => {
      this.isLoaded = true;
    });
  }

  sort(propertyName): void {
    this.filters.filter.reverse = !this.filters.filter.reverse;
    this.filters.filter.sortBy = propertyName;
  }

  expandDetails(): void {
    this.currentData.forEach((value) => {
      this.showDetail(value);
    });
  }

  collapseDetails(): void {
    this.currentData.forEach((value: any) => {
      value.show = false;
    });
  }

  showDetail(data): void {
    data.show = true;
    if (!data.isLoaded) {
      this.coreService.post('monitoring/notification', {
        controllerId: data.controllerId,
        notificationId: data.notificationId,
      }).subscribe((res: any) => {
        data.monitors = res.monitors;
        data.isLoaded = true;
      }, () => {
        data.isLoaded = true;
      });
    }
  }

  currentPageDataChange($event): void {
    this.currentData = $event;
  }

  pageIndexChange($event): void {
    this.filters.filter.currentPage = $event;
  }

  pageSizeChange($event): void {
    this.filters.filter.entryPerPage = $event;
  }

  searchInResult(): void {
    this.data = this.filters.filter.searchText ? this.searchPipe.transform(this.notifications, this.filters.filter.searchText, this.searchableProperties) : this.notifications;
    this.data = [...this.data];
  }

  navToWorkflowTab(workflow): void {
    this.coreService.getConfigurationTab().inventory.expand_to = [];
    this.coreService.getConfigurationTab().inventory.selectedObj = {
      name: workflow.substring(workflow.lastIndexOf('/') + 1),
      path: workflow.substring(0, workflow.lastIndexOf('/')) || '/',
      type: 'WORKFLOW'
    };
    this.router.navigate(['/configuration/inventory']);
  }

  navToOrderHistory(data): void {
    this.router.navigate(['/history/order'], {
      queryParams: {
        orderId: data.orderId,
        workflow: data.workflow,
        controllerId: data.controllerId || this.schedulerIds.selected
      }
    });
  }

  checkAll(value: boolean): void {
    if (value && this.notifications.length > 0) {
      this.notifications.slice((this.preferences.entryPerPage * (this.filters.filter.currentPage - 1)), (this.preferences.entryPerPage * this.filters.filter.currentPage))
        .forEach(item => {
          if (item.type === 'ERROR') {
            this.filters.mapOfCheckedId.add(item.notificationId);
          }
        });
    } else {
      this.filters.mapOfCheckedId.clear();
    }
    this.refreshCheckedStatus();
  }

  onItemChecked(item: any, checked: boolean): void {
    if (checked) {
      this.filters.mapOfCheckedId.add(item.notificationId);
    } else {
      this.filters.mapOfCheckedId.delete(item.notificationId);
    }
    this.object.checked = this.filters.mapOfCheckedId.size === this.notifications.slice((this.preferences.entryPerPage * (this.filters.filter.currentPage - 1)), (this.preferences.entryPerPage * this.filters.filter.currentPage)).filter((val) => val.type === 'ERROR').length;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    this.object.indeterminate = this.filters.mapOfCheckedId.size > 0 && !this.object.checked;
  }

  acknowledge(data): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: AcknowledgeModalComponent,
      nzAutofocus: null,
      nzComponentParams: {
        data: {
          controllerId: data ? data.controllerId : this.schedulerIds.selected,
          notificationIds: data ? [data.notificationId] : Array.from(this.filters.mapOfCheckedId)
        }
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.filters.mapOfCheckedId.clear();
        this.object.checked = false;
        this.object.indeterminate = false;
        this.getData();
      }
    });
  }
}
