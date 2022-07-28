import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {CompactType, DisplayGrid, GridsterConfig, GridType} from 'angular-gridster2';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {ConfirmModalComponent} from '../../components/comfirm-modal/confirm.component';
import {AuthService} from '../../components/guard';
import {DataService} from '../../services/data.service';
import {CoreService} from '../../services/core.service';

declare const $: any;

@Component({
  selector: 'app-widget-modal-content',
  templateUrl: './add-widget-dialog.html'
})
export class AddWidgetModalComponent {
  @Input() widgets: any;
  @Input() dashboard: any;
  @Input() addWidget;
  @Input() self;

  constructor(public activeModal: NzModalRef, public coreService: CoreService) {
  }

  addWidgetFunc(widget): void {
    this.addWidget(widget, this.self);
  }
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  options: GridsterConfig = {};
  dashboard: Array<any> = [];
  editLayoutObj = false;
  schedulerIds: any = {};
  preferences: any = {};
  permission: any = {};
  tempDashboard: Array<any> = [];
  dashboardLayout: Array<any> = [];
  widgets: Array<any> = [];
  subscription: any;
  hasLicense = false;
  isLoading = false;

  constructor(private authService: AuthService, public coreService: CoreService, private modal: NzModalService,
              private dataService: DataService) {
    this.subscription = dataService.refreshAnnounced$.subscribe(() => {
      this.init();
    });
  }

  static calculateHeight(): void {
    let top;
    setTimeout(() => {
      const dom = $('#gridster-container');
      if (dom.position()) {
        top = dom.position().top;
      }
      if (top < 140) {
        top = 142;
      }
      $('.gridster').css({height: 'calc(100vh - ' + top + 'px)', 'scroll-top': '0'});
    }, 0);
  }

  ngOnInit(): void {
    this.init();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  initConfig(flag): void {
    this.options = {
      gridType: GridType.VerticalFixed,
      compactType: CompactType.None,
      margin: 20,
      outerMargin: true,
      outerMarginTop: null,
      outerMarginRight: null,
      outerMarginBottom: null,
      outerMarginLeft: null,
      mobileBreakpoint: 768,
      minCols: 1,
      maxCols: 12,
      minRows: 1,
      maxRows: 100,
      maxItemCols: 100,
      minItemCols: 2,
      maxItemRows: 100,
      minItemRows: 1,
      maxItemArea: 2400,
      minItemArea: 1,
      defaultItemCols: 1,
      defaultItemRows: 1,
      fixedColWidth: 105,
      fixedRowHeight: 55,
      keepFixedHeightInMobile: false,
      keepFixedWidthInMobile: false,
      useTransformPositioning: false,
      draggable: {
        delayStart: 10,
        enabled: flag,
        ignoreContentClass: 'gridster-item-content',
        dragHandleClass: 'drag-handler',
      },
      pushItems: true,
      disablePushOnDrag: false,
      disablePushOnResize: false,
      pushDirections: {
        north: true,
        east: true,
        south: true,
        west: true
      },
      resizable: {
        delayStart: 10,
        enabled: flag,
        handles: {
          s: true,
          e: true,
          n: true,
          w: true,
          se: true,
          ne: true,
          sw: true,
          nw: true
        }
      },
      swap: true,
      displayGrid: DisplayGrid.None
    };
  }

  editLayout(): void {
    this.tempDashboard = this.coreService.clone(this.dashboard);
    this.editLayoutObj = true;
    this.initConfig(true);
  }

  resetLayout(): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: ConfirmModalComponent,
      nzComponentParams: {
        title: 'resetLayout',
        message: 'resetLayout',
        type: 'Reset',
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.preferences.dashboardLayout = undefined;
        this.initWidgets();
        this.setWidgetPreference();
        DashboardComponent.calculateHeight();
      }
    });
  }

  saveWidget(): void {
    this.editLayoutObj = false;
    this.initConfig(false);
    this.setWidgetPreference();
  }

  cancelWidget(): void {
    this.editLayoutObj = false;
    this.dashboard = this.coreService.clone(this.tempDashboard);
    this.initConfig(false);
    this.dataService.refreshWidget(this.widgets);
  }

  removeWidget($event, widget): void {
    $event.preventDefault();
    $event.stopPropagation();
    widget.visible = false;
    this.dashboard = this.dashboard.filter((item) => {
      return item.name !== widget.name;
    });
  }

  addWidgetDialog(): void {
    this.modal.create({
      nzTitle: null,
      nzContent: AddWidgetModalComponent,
      nzClassName: 'lg',
      nzComponentParams: {
        dashboard: this.dashboard,
        widgets: this.widgets,
        addWidget: this.addWidget,
        self: this
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
  }

  addWidget(widget, self): void {
    widget.visible = true;
    self.dashboard.push(widget);
    self.setWidgetPreference();
  }

  setWidgetPreference(): void {
    this.dataService.refreshWidget(this.widgets);
    for (let i = 0; i < this.dashboardLayout.length; i++) {
      for (let j = 0; j < this.widgets.length; j++) {
        if (this.dashboardLayout[i].name === this.widgets[j].name) {
          this.dashboardLayout[i] = this.widgets[j];
          break;
        }
      }
    }
    this.preferences.dashboardLayout = this.dashboardLayout;
    sessionStorage.preferences = JSON.stringify(this.preferences);
    const configObj: any = {
      controllerId: this.schedulerIds.selected,
      accountName: this.authService.currentUserData,
      profileItem: JSON.stringify(this.preferences)
    };
    this.coreService.post('profile/prefs/store', configObj).subscribe();
  }

  private init(): void {
    this.preferences = sessionStorage.preferences ? JSON.parse(sessionStorage.preferences) : {};
    this.schedulerIds = this.authService.scheduleIds ? JSON.parse(this.authService.scheduleIds) : {};
    this.permission = this.authService.permission ? JSON.parse(this.authService.permission) : {};
    this.hasLicense = sessionStorage.hasLicense == 'true';
    this.checkPermission();
  }

  private checkPermission(timeout = 0): void {
    setTimeout(() => {
      this.permission = this.authService.permission ? JSON.parse(this.authService.permission) : {};
      if (!this.permission.joc) {
        this.checkPermission(50);
      } else {
        this.isLoading = true;
        this.initConfig(false);
        this.initWidgets();
        DashboardComponent.calculateHeight();
      }
    }, timeout)
  }

  private initWidgets(): void {
    this.dashboardLayout = [];
    this.widgets = [];
    this.dashboard = [];
    if (this.preferences.dashboardLayout) {
      this.dashboardLayout = this.preferences.dashboardLayout;
      if (this.dashboardLayout.length > 0 && !this.dashboardLayout[0].id) {
        for (const i in this.dashboardLayout) {
          if (this.dashboardLayout[i].name === 'agentClusterStatus') {
            this.dashboardLayout[i].id = 'agentStatus';
            this.dashboardLayout[i].name = 'agentStatus';
            this.dashboardLayout[i].message = 'message.agentStatus';
            this.dashboardLayout.push({
              'cols': 4,
              'rows': 3,
              'y': 11,
              'x': 4,
              'id': 'agentClusterStatus',
              'name': 'agentClusterStatus',
              'visible': false,
              'message': 'message.agentClusterStatus'
            });
            break;
          }
        }
      }
    } else {
      this.dashboardLayout = [{
        'cols': 4,
        'rows': 3,
        'y': 6,
        'x': 4,
        'id': 'agentStatus',
        'name': 'agentStatus',
        'visible': true,
        'message': 'message.agentStatus'
      }, {
        'cols': 4,
        'rows': 3,
        'y': 6,
        'x': 8,
        'id': 'agentRunningJobs',
        'name': 'agentRunningJobs',
        'visible': true,
        'message': 'message.agentClusterRunningTasks'
      }, {
        'cols': 8,
        'rows': 6,
        'y': 0,
        'x': 4,
        'id': 'componentStatus',
        'name': 'componentStatus',
        'visible': true,
        'message': 'message.js7ClusterStatus'
      }, {
        'cols': 12,
        'rows': 3,
        'y': 9,
        'x': 0,
        'id': 'JS7Status',
        'name': 'JS7Status',
        'visible': true,
        'message': 'message.js7Status'
      }, {
        'cols': 4,
        'rows': 3,
        'y': 0,
        'x': 0,
        'id': 'orders',
        'name': 'orders',
        'visible': true,
        'message': 'message.ordersOverview'
      }, {
        'cols': 4,
        'rows': 2,
        'y': 3,
        'x': 0,
        'id': 'history',
        'name': 'history',
        'visible': true,
        'message': 'message.historySummary'
      }, {
        'cols': 4,
        'rows': 2,
        'y': 7,
        'x': 0,
        'id': 'inventory',
        'name': 'inventory',
        'visible': true,
        'message': 'message.inventoryStatistics'
      }, {
        'cols': 4,
        'rows': 2,
        'y': 5,
        'x': 0,
        'id': 'dailyPlan',
        'name': 'dailyPlan',
        'visible': true,
        'message': 'message.dailyPlanOverview'
      }, {
        'cols': 4,
        'rows': 2,
        'y': 11,
        'x': 0,
        'id': 'fileTransferSummary',
        'name': 'fileTransferSummary',
        'visible': false,
        'message': 'message.fileTransferHistorySummary'
      }, {
        'cols': 4,
        'rows': 3,
        'y': 11,
        'x': 4,
        'id': 'agentClusterStatus',
        'name': 'agentClusterStatus',
        'visible': false,
        'message': 'message.agentClusterStatus'
      }];
    }

    if (this.permission.joc) {
      for (let i = 0; i < this.dashboardLayout.length; i++) {
        if (this.dashboardLayout[i].name === 'agentStatus' && this.permission.currentController.agents.view) {
          this.widgets.push(this.dashboardLayout[i]);
        } else if (this.dashboardLayout[i].name === 'agentClusterStatus' && this.permission.currentController.agents.view && this.hasLicense) {
          this.widgets.push(this.dashboardLayout[i]);
        } else if (this.dashboardLayout[i].name === 'agentRunningJobs' && this.permission.currentController.agents.view) {
          this.widgets.push(this.dashboardLayout[i]);
        } else if (this.dashboardLayout[i].name === 'JS7Status' && this.permission.currentController.view) {
          this.widgets.push(this.dashboardLayout[i]);
        } else if (this.dashboardLayout[i].name === 'componentStatus' && this.permission.currentController.view) {
          this.widgets.push(this.dashboardLayout[i]);
        } else if (this.dashboardLayout[i].name === 'orders' && this.permission.currentController.orders.view) {
          this.widgets.push(this.dashboardLayout[i]);
        } else if (this.dashboardLayout[i].name === 'history' && this.permission.currentController.orders.view) {
          this.widgets.push(this.dashboardLayout[i]);
        } else if (this.dashboardLayout[i].name === 'inventory' && this.permission.joc.inventory.view) {
          this.widgets.push(this.dashboardLayout[i]);
        } else if (this.dashboardLayout[i].name === 'dailyPlan' && this.permission.joc.dailyPlan.view && this.permission.currentController.orders.view) {
          this.widgets.push(this.dashboardLayout[i]);
        } else if (this.dashboardLayout[i].name === 'fileTransferSummary' && this.permission.joc.fileTransfer && this.permission.joc.fileTransfer.view) {
          this.widgets.push(this.dashboardLayout[i]);
        }
      }
    } else {
      this.widgets = this.dashboardLayout;
    }
    for (let i = 0; i < this.widgets.length; i++) {
      if (this.widgets[i].visible) {
        this.dashboard.push(this.widgets[i]);
      }
    }
  }

}
