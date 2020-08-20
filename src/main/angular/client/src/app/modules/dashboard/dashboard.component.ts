import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {AuthService} from '../../components/guard';
import {CoreService} from '../../services/core.service';
import {
  CompactType,
  DisplayGrid,
  GridsterConfig,
  GridType
} from 'angular-gridster2';
import {DataService} from '../../services/data.service';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ConfirmModalComponent} from '../../components/comfirm-modal/confirm.component';

declare const $;

@Component({
  selector: 'app-ngbd-modal-content',
  templateUrl: './add-widget-dialog.html'
})
export class AddWidgetModalComponent {
  @Input() widgets: any;
  @Input() dashboard: any;
  @Input() addWidget;
  @Input() self;

  constructor(public activeModal: NgbActiveModal, public coreService: CoreService) {
  }

  addWidgetFunc(widget) {
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
  _tempDashboard: Array<any> = [];
  dashboardLayout: Array<any> = [];
  widgets: Array<any> = [];
  subscription: any;
  isLoading = false;

  constructor(private authService: AuthService, public coreService: CoreService, private modalService: NgbModal, private dataService: DataService) {
    this.subscription = dataService.refreshAnnounced$.subscribe(() => {
      this.init();
    });
  }

  eventStop = () => {

  };

  ngOnInit() {
    this.init();
    $('.gridster').height(window.innerHeight - 150 + 'px');
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  initConfig(flag) {
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
      minItemCols: 4,
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
      scrollSensitivity: 10,
      scrollSpeed: 20,
      ignoreMarginInRow: false,
      draggable: {
        delayStart: 0,
        enabled: flag,
        ignoreContentClass: 'gridster-item-content',
        ignoreContent: false,
        dragHandleClass: 'drag-handler',
        stop: this.eventStop
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
        delayStart: 0,
        enabled: flag,
        stop: this.eventStop,
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
      displayGrid: DisplayGrid.None,
      disableWindowResize: false,
      disableWarnings: true,
      scrollToNewItems: false
    };
  }

  editLayout() {
    this._tempDashboard = Object.assign([], this.dashboard);
    this.editLayoutObj = true;
    this.initConfig(true);
  }

  resetLayout() {
    const modalRef = this.modalService.open(ConfirmModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.title = 'resetLayout';
    modalRef.componentInstance.message = 'resetLayout';
    modalRef.componentInstance.type = 'Reset';
    modalRef.result.then(() => {
      this.preferences.dashboardLayout = undefined;
      this.initWidgets();
      this.setWidgetPreference();
    }, (reason) => {

    });
  }

  saveWidget() {
    this.editLayoutObj = false;
    this.initConfig(false);
    this.setWidgetPreference();
  }

  cancelWidget() {
    this.editLayoutObj = false;
    this.dashboard = Object.assign([], this._tempDashboard);
    this.initConfig(false);
  }

  removeWidget($event, widget) {
    $event.preventDefault();
    $event.stopPropagation();
    widget.visible = false;
    for (let j = 0; j < this.dashboard.length; j++) {
      if (this.dashboard[j].name === widget.name) {
        this.dashboard.splice(j, 1);
        break;
      }
    }

  }

  addWidgetDialog() {
    const modalRef = this.modalService.open(AddWidgetModalComponent, {backdrop: 'static', size: 'lg'});
    modalRef.componentInstance.dashboard = this.dashboard;
    modalRef.componentInstance.widgets = this.widgets;
    modalRef.componentInstance.addWidget = this.addWidget;
    modalRef.componentInstance.self = this;
    modalRef.result.then(() => {

    }, (reason) => {

    });
  }

  addWidget(widget, self) {
    widget.visible = true;
    self.dashboard.push(widget);
    self.setWidgetPreference();
  }

  setWidgetPreference() {
    this.preferences.dashboardLayout = this.widgets;
    sessionStorage.preferences = JSON.stringify(this.preferences);
    let configObj: any = {};
    configObj.jobschedulerId = this.schedulerIds.selected;
    configObj.account = this.permission.user;
    configObj.configurationType = 'PROFILE';
    configObj.id = parseInt(sessionStorage.preferenceId, 10);
    configObj.configurationItem = JSON.stringify(this.preferences);
    if (configObj.id && configObj.id > 0) {
      this.coreService.post('configuration/save', configObj).subscribe(() => {

      });
    }
  }

  private init() {
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences) || {};
    } else {
      setTimeout(() => {
        this.init();
      }, 100);
      return;
    }
    this.isLoading = true;
    if (this.authService.scheduleIds) {
      this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    }
    if (this.authService.permission) {
      this.permission = JSON.parse(this.authService.permission) || {};
    }

    this.initConfig(false);
    this.initWidgets();

  }

  private initWidgets() {
    this.dashboardLayout = [];
    this.widgets = [];
    this.dashboard = [];
    if (this.preferences.dashboardLayout) {
      this.dashboardLayout = this.preferences.dashboardLayout;
    } else {
      this.dashboardLayout = [{
        cols: 4, rows: 3, y: 0, x: 0,
        name: 'agentClusterStatus',
        visible: true,
        message: 'message.agentClusterStatus'
      }, {
        cols: 4, rows: 3, y: 1, x: 0,
        name: 'agentClusterRunningTasks',
        visible: true,
        message: 'message.agentClusterRunningTasks'
      }, {
        cols: 8, rows: 6, y: 0, x: 4,
        name: 'controllerClusterStatus',
        visible: true,
        message: 'message.controllerClusterStatus'
      }, {
        cols: 12, rows: 3, y: 4, x: 0,
        name: 'jobSchedulerStatus',
        visible: true,
        message: 'message.jobSchedulerStatus'
      }, {
        cols: 8, rows: 2, y: 5, x: 0,
        name: 'ordersOverview',
        visible: true,
        message: 'message.ordersOverview'
      }, {
        cols: 4, rows: 2, y: 5, x: 8,
        name: 'ordersSummary',
        visible: true,
        message: 'message.ordersSummary'
      }, {
        cols: 8, rows: 2, y: 6, x: 0,
        name: 'tasksOverview',
        visible: true,
        message: 'message.tasksOverview'
      }, {
        cols: 4, rows: 2, y: 6, x: 8,
        name: 'tasksSummary',
        visible: true,
        message: 'message.tasksSummary'
      }, {
        cols: 8, rows: 2, y: 7, x: 0,
        name: 'fileTransferOverview',
        visible: true,
        message: 'message.fileTransferOverview'
      }, {
        cols: 4, rows: 2, y: 7, x: 8,
        name: 'fileTransferSummary',
        visible: true,
        message: 'message.fileTransferSummary'
      }];
 /*    {
        cols: 12, rows: 2, y: 8, x: 0,
          name: 'dailyPlanOverview',
          visible: true,
          message: 'message.dailyPlanOverview'
      }*/
    }

    if (this.permission.JobschedulerMaster) {
      for (let i = 0; i < this.dashboardLayout.length; i++) {
        if (this.dashboardLayout[i].name === 'agentClusterStatus' && this.permission.JobschedulerUniversalAgent.view.status) {
          this.widgets.push(this.dashboardLayout[i]);
        } else if (this.dashboardLayout[i].name === 'agentClusterRunningTasks' && this.permission.ProcessClass.view.status) {
          this.widgets.push(this.dashboardLayout[i]);
        } else if (this.dashboardLayout[i].name === 'jobSchedulerStatus') {
          this.widgets.push(this.dashboardLayout[i]);
        } else if (this.dashboardLayout[i].name === 'controllerClusterStatus') {
          this.widgets.push(this.dashboardLayout[i]);
        }/* else if (this.dashboardLayout[i].name === 'dailyPlanOverview' && this.permission.DailyPlan.view.status) {
          this.widgets.push(this.dashboardLayout[i]);
        }*/ else if (this.dashboardLayout[i].name === 'ordersOverview' && this.permission.Order.view.status) {
          this.widgets.push(this.dashboardLayout[i]);
        } else if (this.dashboardLayout[i].name === 'ordersSummary' && this.permission.Order.view.status) {
          this.widgets.push(this.dashboardLayout[i]);
        } else if (this.dashboardLayout[i].name === 'tasksOverview' && this.permission.Job.view.status) {
          this.widgets.push(this.dashboardLayout[i]);
        } else if (this.dashboardLayout[i].name === 'tasksSummary' && this.permission.Job.view.status) {
          this.widgets.push(this.dashboardLayout[i]);
        } else if (this.dashboardLayout[i].name === 'fileTransferOverview' && this.permission.YADE.view.status) {
          this.widgets.push(this.dashboardLayout[i]);
        } else if (this.dashboardLayout[i].name === 'fileTransferSummary' && this.permission.YADE.view.status) {
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
