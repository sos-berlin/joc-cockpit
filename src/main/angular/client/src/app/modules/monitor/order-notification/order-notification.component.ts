import {Component, OnInit, OnDestroy, Input} from '@angular/core';
import {Subject, Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {takeUntil} from 'rxjs/operators';
import {NzModalService} from 'ng-zorro-antd/modal';
import {TranslateService} from "@ngx-translate/core";
import {AcknowledgeModalComponent} from "../acknowledge-notification/acknowledge.component";
import {CoreService} from '../../../services/core.service';
import {DataService} from '../../../services/data.service';
import {AuthService} from '../../../components/guard';
import {SearchPipe, OrderPipe} from '../../../pipes/core.pipe';
import {ExcelService} from "../../../services/excel.service";

@Component({
  selector: 'app-order-notification',
  templateUrl: './order-notification.component.html'
})
export class OrderNotificationComponent implements OnInit, OnDestroy {
  @Input() permission: any;
  @Input() preferences: any = {};
  @Input() schedulerIds: any = {};
  @Input() filters: any = {};

  totalNotification = 0;
  isLoaded = false;
  notifications = [];
  data = [];
  object = {
    checked: false,
    indeterminate: false
  };
  reloadState = 'no';

  searchableProperties = ['controllerId', 'type', 'job', 'exitCode', 'message', 'orderId', 'workflow', 'created'];

  subscription1: Subscription;
  subscription2: Subscription;
  private pendingHTTPRequests$ = new Subject<void>();

  constructor(public coreService: CoreService, private authService: AuthService, private router: Router, private orderPipe: OrderPipe,
              private modal: NzModalService, private dataService: DataService, private searchPipe: SearchPipe,
              private translate: TranslateService, private excelService: ExcelService) {
    this.subscription1 = dataService.eventAnnounced$.subscribe(res => {
      if (res) {
        this.refresh(res);
      }
    });

    this.subscription2 = dataService.functionAnnounced$.subscribe((res: any) => {
      if (res) {
        if (res.filter) {
          this.isLoaded = false;
          this.getData();
        } else if (res === 'ACKNOWLEDGE') {
          this.acknowledge(null);
        } else if(res == 'EXPORT'){
          this.exportXLS();
        }
      }
    });
  }

  ngOnInit(): void {
    if (this.filters.mapOfCheckedId) {
      if (this.filters.mapOfCheckedId instanceof Set) {
        this.filters.mapOfCheckedId.clear();
      } else {
        this.filters.mapOfCheckedId = new Set();
      }
    }
    this.getData();
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
    this.pendingHTTPRequests$.next();
    this.pendingHTTPRequests$.complete();
  }

  refresh(args): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].objectType === 'MONITORINGNOTIFICATION') {
          this.getData();
          break;
        }
      }
    }
  }


  private getData(): void {
    this.reloadState = 'no';
    const notificationIds = new Map();
    this.data.forEach((item) => {
      if (item.show) {
        notificationIds.set(item.notificationId, item.monitors);
      }
    });
    const obj: any = {
      controllerId: this.filters.current == true ? this.schedulerIds.selected : '',
      limit: parseInt(this.preferences.maxNotificationRecords, 10),
      timeZone: this.preferences.timeZone
    };
    obj.types = this.filters.filter.types;
    if (this.filters.filter.date && this.filters.filter.date !== 'ALL') {
      obj.dateFrom = this.filters.filter.date;
    }
    this.coreService.post('monitoring/notifications', obj).pipe(takeUntil(this.pendingHTTPRequests$)).subscribe({
      next: (res: any) => {
        this.isLoaded = true;
        res.notifications = this.orderPipe.transform(res.notifications, this.filters.filter.sortBy, this.filters.filter.reverse);
        if (notificationIds && notificationIds.size > 0) {
          res.notifications.forEach((value) => {
            if (notificationIds.has(value.notificationId)) {
              value.show = true;
              value.isLoaded = true;
              value.monitors = notificationIds.get(value.notificationId);
            }
          });
        }
        this.notifications = res.notifications;
        this.searchInResult();
      }, error: () => this.isLoaded = true
    });
  }

  sort(propertyName): void {
    this.filters.filter.reverse = !this.filters.filter.reverse;
    this.filters.filter.sortBy = propertyName;
    this.data = this.orderPipe.transform(this.data, this.filters.filter.sortBy, this.filters.filter.reverse);
    this.resetCheckBox();
  }

  expandDetails(): void {
    const notifications = this.getCurrentData(this.data, this.filters);
    notifications.forEach((value) => {
      this.showDetail(value);
    });
  }

  collapseDetails(): void {
    const notifications = this.getCurrentData(this.data, this.filters);
    notifications.forEach((value) => {
      value.show = false;
    });
  }

  showDetail(data): void {
    data.show = true;
    if (!data.isLoaded) {
      this.coreService.post('monitoring/notification', {
        controllerId: data.controllerId,
        notificationId: data.notificationId,
      }).subscribe({
        next: (res: any) => {
          data.monitors = res.monitors;
          data.isLoaded = true;
        }, error: () => data.isLoaded = true
      });
    }
  }

  pageIndexChange($event): void {
    this.filters.filter.currentPage = $event;
    if (this.filters.mapOfCheckedId.size !== this.totalNotification) {
      this.resetCheckBox();
    }
  }

  pageSizeChange($event): void {
    this.filters.filter.entryPerPage = $event;
    if (this.filters.mapOfCheckedId.size !== this.totalNotification) {
      if (this.object.checked) {
        this.checkAll(true);
      }
    }
  }

  resetCheckBox(): void {
    this.filters.mapOfCheckedId.clear();
    this.object = {
      checked: false,
      indeterminate: false
    };
  }

  getCurrentData(list, filter): Array<any> {
    const entryPerPage = filter.filter.entryPerPage || this.preferences.entryPerPage;
    return list.slice((entryPerPage * (filter.filter.currentPage - 1)), (entryPerPage * filter.filter.currentPage));
  }

  searchInResult(): void {
    this.data = this.filters.filter.searchText ? this.searchPipe.transform(this.notifications, this.filters.filter.searchText, this.searchableProperties) : this.notifications;
    this.data = [...this.data];
    if (this.notifications.length === 0) {
      this.filters.filter.currentPage = 1;
    }
    this.totalNotification = 0;
    this.data.forEach((item) => {
      if (item.type === 'ERROR') {
        ++this.totalNotification;
      }
    });
  }

  navToWorkflowTab(workflow): void {
    this.coreService.getConfigurationTab().inventory.expand_to = [];
    this.coreService.getConfigurationTab().inventory.selectedObj = {
      name: workflow.substring(workflow.lastIndexOf('/') + 1),
      path: workflow.substring(0, workflow.lastIndexOf('/')) || '/',
      type: 'WORKFLOW'
    };
    this.router.navigate(['/configuration/inventory']).then();
  }

  navToOrderHistory(data): void {
    this.router.navigate(['/history/order'], {
      queryParams: {
        orderId: data.orderId,
        workflow: data.workflow,
        controllerId: data.controllerId || this.schedulerIds.selected
      }
    }).then();
  }

  selectAll(): void {
    this.data.forEach(item => {
      if (item.type === 'ERROR') {
        this.filters.mapOfCheckedId.add(item.notificationId);
      }
    });
  }

  checkAll(value: boolean): void {
    if (value && this.notifications.length > 0) {
      const notifications = this.getCurrentData(this.data, this.filters);
      notifications.forEach(item => {
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
    let notifications;
    if (!checked && this.filters.mapOfCheckedId.size > (this.filters.filter.entryPerPage || this.preferences.entryPerPage)) {
      notifications = this.getCurrentData(this.data, this.filters);
      if (notifications.length < this.data.length) {
        this.filters.mapOfCheckedId.clear();
        notifications.forEach(notify => {
          if (notify.type === 'ERROR') {
            this.filters.mapOfCheckedId.add(notify.notificationId);
          }
        });
      }
    }
    if (checked) {
      if (item.type === 'ERROR') {
        this.filters.mapOfCheckedId.add(item.notificationId);
      }
    } else {
      this.filters.mapOfCheckedId.delete(item.notificationId);
    }
    if (!notifications) {
      notifications = this.getCurrentData(this.data, this.filters);
    }
    this.object.checked = this.filters.mapOfCheckedId.size === notifications.length;
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

  exportXLS(): void {
    let workflow = '', orderId = '', job = '', jobReturnCode = '', type = '',
      message = '', controllerId = '', created = '';
    this.translate.get('monitor.notification.label.workflow').subscribe(translatedValue => {
      workflow = translatedValue;
    });
    this.translate.get('monitor.notification.label.orderId').subscribe(translatedValue => {
      orderId = translatedValue;
    });
    this.translate.get('monitor.notification.label.job').subscribe(translatedValue => {
      job = translatedValue;
    });
    this.translate.get('common.label.controllerId').subscribe(translatedValue => {
      controllerId = translatedValue;
    });
    this.translate.get('monitor.notification.label.type').subscribe(translatedValue => {
      type = translatedValue;
    });
    this.translate.get('monitor.notification.label.message').subscribe(translatedValue => {
      message = translatedValue;
    });
    this.translate.get('monitor.notification.label.jobReturnCode').subscribe(translatedValue => {
      jobReturnCode = translatedValue;
    });
    this.translate.get('monitor.notification.label.created').subscribe(translatedValue => {
      created = translatedValue;
    });

    const data = [];
    for (let i = 0; i < this.notifications.length; i++) {
      const obj: any = {};
      if (!this.filters.current) {
        obj[controllerId] = this.notifications[i].controllerId;
      }
      obj[workflow] = this.notifications[i].workflow;
      obj[orderId] = this.notifications[i].orderId;
      obj[job] = this.notifications[i].job?.job;
      obj[type] = this.notifications[i].type;
      obj[jobReturnCode] = this.notifications[i].job?.exitCode;
      obj[message] = this.notifications[i].message;
      obj[created] = this.coreService.stringToDate(this.preferences, this.notifications[i].created);
      data.push(obj);
    }
    this.excelService.exportAsExcelFile(data, 'JS7-order-notification');

  }

  reload(): void {
    if (this.reloadState === 'no') {
      this.notifications = [];
      this.data = [];
      this.reloadState = 'yes';
      this.isLoaded = true;
      this.pendingHTTPRequests$.next();
    } else if (this.reloadState === 'yes') {
      this.isLoaded = false;
      this.getData();
    }
  }
}
