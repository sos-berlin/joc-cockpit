import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {AuthService} from '../../components/guard/auth.service';
import {CoreService} from '../../services/core.service';
import {
    CompactType,
    DisplayGrid,
    GridsterComponentInterface,
    GridsterConfig,
    GridsterItem,
    GridsterItemComponentInterface,
    GridType
} from 'angular-gridster2';
import {DataService} from "../../services/data.service";
import {NgbActiveModal, NgbModal} from "@ng-bootstrap/ng-bootstrap";

declare var $;

@Component({
  selector: 'ngbd-modal-content',
  templateUrl: './add-widget-dialog.html'
})
export class AddWidgetModal {
  @Input() widgets: any;
  @Input() dashboard: any;
  @Input() addWidget;

  constructor(public activeModal: NgbActiveModal, public coreService: CoreService) {
  }

  addWidgetFunc(widget) {
    this.addWidget(widget);
  }
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  options: GridsterConfig;
  dashboard: any = [];
  editLayoutObj: boolean = false;
  schedulerIds: any = {};
  preferences: any = {};
  permission: any = {};
  _tempDashboard: any = [];
  dashboardLayout: any = [];
  widgets: any = [];
  subscription: any;

  isEventTriggering: boolean = false;
  widgetArray: any = [];

  eventStop = () => {
    this.isEventTriggering = true;
  };

  itemResize = (item: GridsterItem, itemComponent: GridsterItemComponentInterface) => {
    this.setEqualRowSpace(item, itemComponent);
  };

  gridInit = (grid: GridsterComponentInterface) => {
    let self = this;
    $(window).resize(function () {
      self.checkWindowSize(grid);
    });
    self.checkWindowSize(grid);
  };

  constructor(private authService: AuthService, public coreService: CoreService, private modalService: NgbModal, private dataService: DataService) {
    this.subscription = dataService.refreshAnnounced$.subscribe(() => {
      this.init();
    });
  }

  ngOnInit() {
    this.init();
  }

  private init() {
    if (sessionStorage.preferences)
      this.preferences = JSON.parse(sessionStorage.preferences);
    if (this.authService.scheduleIds)
      this.schedulerIds = JSON.parse(this.authService.scheduleIds);
    this.permission = JSON.parse(this.authService.permission);
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
        cols: 4, rows: 2, y: 0, x: 0,
        name: "agentClusterStatus",
        visible: true,
        message: "message.agentClusterStatus"
      }, {
        cols: 4, rows: 2, y: 1, x: 0,
        name: "agentClusterRunningTasks",
        visible: true,
        message: "message.agentClusterRunningTasks"
      }, {
        cols: 8, rows: 4, y: 0, x: 4,
        name: "masterClusterStatus",
        visible: true,
        message: "message.masterClusterStatus"
      }, {
        cols: 12, rows: 2, y: 4, x: 0,
        name: "jobSchedulerStatus",
        visible: true,
        message: "message.jobSchedulerStatus"
      }, {
        cols: 8, rows: 1, y: 5, x: 0,
        name: "ordersOverview",
        visible: true,
        message: "message.ordersOverview"
      }, {
        cols: 4, rows: 1, y: 5, x: 8,
        name: "ordersSummary",
        visible: true,
        message: "message.ordersSummary"
      }, {
        cols: 8, rows: 1, y: 6, x: 0,
        name: "tasksOverview",
        visible: true,
        message: "message.tasksOverview"
      }, {
        cols: 4, rows: 1, y: 6, x: 8,
        name: "tasksSummary",
        visible: true,
        message: "message.tasksSummary"
      }, {
        cols: 8, rows: 1, y: 7, x: 0,
        name: "fileTransferOverview",
        visible: true,
        message: "message.fileTransferOverview"
      }, {
        cols: 4, rows: 1, y: 7, x: 8,
        name: "fileTransferSummary",
        visible: true,
        message: "message.fileTransferSummary"
      }, {
        cols: 12, rows: 1, y: 8, x: 0,
        name: "dailyPlanOverview",
        visible: true,
        message: "message.dailyPlanOverview"
      }];
    }

    for (let i = 0; i < this.dashboardLayout.length; i++) {
      if (this.dashboardLayout[i].name == 'agentClusterStatus' && this.permission.JobschedulerUniversalAgent.view.status) {
        this.widgets.push(this.dashboardLayout[i]);
      } else if (this.dashboardLayout[i].name == 'agentClusterRunningTasks' && this.permission.ProcessClass.view.status) {
        this.widgets.push(this.dashboardLayout[i]);
      } else if (this.dashboardLayout[i].name == 'jobSchedulerStatus') {
        this.widgets.push(this.dashboardLayout[i]);
      } else if (this.dashboardLayout[i].name == 'masterClusterStatus') {
        this.widgets.push(this.dashboardLayout[i]);
      } else if (this.dashboardLayout[i].name == 'dailyPlanOverview' && this.permission.DailyPlan.view.status) {
        this.widgets.push(this.dashboardLayout[i]);
      } else if (this.dashboardLayout[i].name == 'ordersOverview' && this.permission.Order.view.status) {
        this.widgets.push(this.dashboardLayout[i]);
      } else if (this.dashboardLayout[i].name == 'ordersSummary' && this.permission.Order.view.status) {
        this.widgets.push(this.dashboardLayout[i]);
      } else if (this.dashboardLayout[i].name == 'tasksOverview' && this.permission.Job.view.status) {
        this.widgets.push(this.dashboardLayout[i]);
      } else if (this.dashboardLayout[i].name == 'tasksSummary' && this.permission.Job.view.status) {
        this.widgets.push(this.dashboardLayout[i]);
      } else if (this.dashboardLayout[i].name == 'fileTransferOverview' && this.permission.YADE.view.transfers) {
        this.widgets.push(this.dashboardLayout[i]);
      } else if (this.dashboardLayout[i].name == 'fileTransferSummary' && this.permission.YADE.view.transfers) {
        this.widgets.push(this.dashboardLayout[i]);
      }
    }

    for (let i = 0; i < this.widgets.length; i++) {
      if (this.widgets[i].visible) {
        this.dashboard.push(this.widgets[i]);
      }
    }

  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  initConfig(flag) {
    this.options = {
      gridType: GridType.VerticalFixed,
      compactType: CompactType.None,
      initCallback: this.gridInit,
      itemResizeCallback: this.itemResize,

      margin: 22,
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
      fixedRowHeight: 128,
      keepFixedHeightInMobile: false,
      keepFixedWidthInMobile: false,
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
      swap: false,
      pushItems: true,
      disablePushOnDrag: false,
      disablePushOnResize: false,
      pushDirections: {north: true, east: true, south: true, west: true},
      pushResizeItems: false,
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
    this.preferences.dashboardLayout = undefined;
    this.initWidgets();
    this.setWidgetPreference();
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
      if (this.dashboard[j].name == widget.name) {
        this.dashboard.splice(j, 1);
        break;
      }
    }

  }

  addWidgetDialog() {
    const modalRef = this.modalService.open(AddWidgetModal, {backdrop: "static", size: "lg"});
    modalRef.componentInstance.dashboard = this.dashboard;
    modalRef.componentInstance.widgets = this.widgets;
    modalRef.componentInstance.addWidget = this.addWidget;
    modalRef.result.then(() => {

    }, (reason) => {
      console.log('close...', reason)
    });
  }

  addWidget(widget) {
    widget.visible = true;
    this.dashboard.push(widget);
    this.setWidgetPreference();
  }

  setWidgetPreference() {
    this.preferences.dashboardLayout = this.widgets;
    sessionStorage.preferences = JSON.stringify(this.preferences);
    let configObj: any = {};
    configObj.jobschedulerId = this.schedulerIds.selected;
    configObj.account = this.permission.user;
    configObj.configurationType = "PROFILE";
    configObj.id = parseInt(sessionStorage.preferenceId);
    configObj.configurationItem = JSON.stringify(this.preferences);
    if (configObj.id && configObj.id > 0)
      this.coreService.post('configuration/save', configObj).subscribe(() => {

      })
  }

  private setEqualRowSpace(item, itemComponent) {
    let newRowIndex = parseInt(item.y) + parseInt(item.rows);
    this.widgetArray = Object.assign([], this.dashboard);
    let gridWidth = itemComponent.gridster.curWidth;
    if ((itemComponent.width < 750) && (item.name == 'tasksOverview' || item.name == 'ordersOverview' || item.name == 'fileTransferOverview')) {

    }
    if ((itemComponent.width > 750) && (item.name == 'tasksOverview' || item.name == 'ordersOverview' || item.name == 'fileTransferOverview')) {
      if (gridWidth > 1336) {
        $('#' + item.name).removeClass('small-gridster-panel');
      }
      else {
        $('#' + item.name).removeClass('smallest-gridster-panel');
      }
    }
    let itemHeight = parseInt($('#' + item.name).css('height'));
    if ((this.isEventTriggering) && (itemComponent.width < 750) && (itemHeight == itemComponent.height) && (item.name == 'tasksOverview' || item.name == 'ordersOverview' || item.name == 'fileTransferOverview')) {
      if (gridWidth > 1336) {
        $('#' + item.name).addClass('small-gridster-panel');
      }
      else {
        $('#' + item.name).addClass('smallest-gridster-panel');
      }
      for (let j = 0; j < this.widgetArray.length; j++) {
        if (this.widgetArray[j].y >= newRowIndex) {
          let _tempId = this.widgetArray[j].name;

          let itemTop = $('#' + _tempId).css('top');
          let newTop;
          if (gridWidth > 1336) {
            newTop = parseInt(itemTop) + 16;
          }
          else {
            newTop = parseInt(itemTop) + 32;
          }

          $('#' + _tempId).css('top', newTop + 'px');
        
        }
      }
      this.isEventTriggering = false;
    }

    if ((this.isEventTriggering) && (itemComponent.width > 750) && (itemHeight > itemComponent.height) && (item.name == 'tasksOverview' || item.name == 'ordersOverview' || item.name == 'fileTransferOverview')) {
      for (let j = 0; j < this.widgetArray.length; j++) {
        if (this.widgetArray[j].y >= newRowIndex) {
          let _tempId = this.widgetArray[j].name;
          let itemTop = $('#' + _tempId).css('top');
          let newTop;
          if (gridWidth > 1336) {
            newTop = parseInt(itemTop) - 16;
          }
          else {
            newTop = parseInt(itemTop) - 32;
          }
          $('#' + _tempId).css('top', newTop + 'px');
        }
      }
      this.isEventTriggering = false;
    }
  }


  checkWindowSize(grid) {
    if (grid.curWidth < 1200) {
      for (let i = 0; i < this.widgetArray.length; i++) {
        if (this.widgetArray[i].rows < 2) {
          let _tempId3 = this.widgetArray[i].name;
          $('#' + _tempId3).addClass('smallest-gridster-panel');
        }
      }
      this.dashboard = this.widgetArray;
    }
    if (grid.curWidth > 1200) {
      for (let i = 0; i < this.widgetArray.length; i++) {
        if (this.widgetArray[i].rows < 2) {
          let _tempId3 = this.widgetArray[i].name;
          $('#' + _tempId3).removeClass('smallest-gridster-panel');
        }
      }
    }

    if (grid.curWidth < 1200) {
      for (let i = 0; i < this.widgetArray.length; i++) {
        let _tempId4 = this.widgetArray[i].name;
        let _tempTop = $('#' + _tempId4).css('top');
        let _tempHeight = $('#' + _tempId4).css('height');
        let flag = $('#' + _tempId4).hasClass('smallest-gridster-panel');
        let sum = _tempTop + _tempHeight;
        let newRowIndex = parseInt(this.widgetArray[i].y) + parseInt(this.widgetArray[i].rows);
        if (flag) {
          for (let j = 0; j < this.widgetArray.length; j++) {
            let nextTop = parseInt($('#' + this.widgetArray[j].name).css('top'));
            if ((this.widgetArray[j].y >= newRowIndex) && (nextTop - sum != 22)) {
              let _tempId5 = this.widgetArray[j].name;
              let _tempTop2 = $('#' + _tempId5).css('top');
              let newTop2 = parseInt(_tempTop2) + (32);
              $('#' + this.widgetArray[j].name).css('color', 'red');
              $('#' + this.widgetArray[j].name).css('top', newTop2 + 'px');
            }
          }
          break;
        }
      }
    }
  }
}
