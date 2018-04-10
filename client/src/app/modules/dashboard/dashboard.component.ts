import { Component,OnInit } from '@angular/core';
import { AuthService } from '../../components/guard/auth.service';
import { CoreService } from '../../services/core.service';
import { CompactType,
  DisplayGrid,
  GridsterComponentInterface,
  GridsterConfig,
  GridsterItem,
  GridsterItemComponentInterface,
  GridType }  from 'angular-gridster2';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
    options:GridsterConfig;
    dashboard:Array<GridsterItem>;
    editLayoutObj:boolean = false;
    preferences:any;
    permission:any;
    _tempDashboard:any;

    static eventStop(item:GridsterItem, itemComponent:GridsterItemComponentInterface, event:MouseEvent) {
        //  console.info('eventStop', item, itemComponent, event);
    }

    static itemChange(item:GridsterItem, itemComponent:GridsterItemComponentInterface) {
        // console.info('itemChanged', item, itemComponent);
    }

    static itemResize(item:GridsterItem, itemComponent:GridsterItemComponentInterface) {
        // console.info('itemResized', item, itemComponent);
    }

    static itemInit(item:GridsterItem, itemComponent:GridsterItemComponentInterface) {

    }

    static itemRemoved(item:GridsterItem, itemComponent:GridsterItemComponentInterface) {
        //  console.info('itemRemoved', item, itemComponent);
    }

    static gridInit(grid:GridsterComponentInterface) {
        console.info('gridInit', grid);
    }

    static gridDestroy(grid:GridsterComponentInterface) {
        console.info('gridDestroy', grid);
    }

    constructor(private authService:AuthService, public coreService:CoreService) {

    }

    ngOnInit() {
        if (sessionStorage.preferences)
            this.preferences = JSON.parse(sessionStorage.preferences);
        this.permission = JSON.parse(this.authService.permission);


        this.initConfig(false);
        this.dashboard = [
            {cols: 4, rows: 2, y: 0, x: 0, name: 'agentClusterStatus'},
            {cols: 4, rows: 2, y: 1, x: 0, name: 'agentClusterRunningTasks'},
            {cols: 8, rows: 4, y: 0, x: 4, name: 'masterClusterStatus'},
            {cols: 12, rows: 2, y: 4, x: 0, name: 'jobSchedulerStatus'},
            {cols: 8, rows: 1, y: 5, x: 0, name: 'ordersOverview'},
            {cols: 4, rows: 1, y: 5, x: 8, name: 'ordersSummary'},
            {cols: 8, rows: 1, y: 6, x: 0, name: 'tasksOverview'},
            {cols: 4, rows: 1, y: 6, x: 8, name: 'tasksSummary'},
            {cols: 8, rows: 1, y: 7, x: 0, name: 'fileTransferOverview'},
            {cols: 4, rows: 1, y: 7, x: 8, name: 'fileTransferSummary'},
            {cols: 12, rows: 1, y: 8, x: 0, name: 'dailyPlanOverview'}
        ];
    }

    initConfig(flag) {
        this.options = {
            gridType: GridType.VerticalFixed,
            compactType: CompactType.None,
            initCallback: DashboardComponent.gridInit,
            destroyCallback: DashboardComponent.gridDestroy,
            itemChangeCallback: DashboardComponent.itemChange,
            itemResizeCallback: DashboardComponent.itemResize,
            itemInitCallback: DashboardComponent.itemInit,
            itemRemovedCallback: DashboardComponent.itemRemoved,
            margin: 22,
            outerMargin: true,
            outerMarginTop: null,
            outerMarginRight: null,
            outerMarginBottom: null,
            outerMarginLeft: null,
            mobileBreakpoint: 768,
            minCols: 1,
            maxCols: 100,
            minRows: 1,
            maxRows: 100,
            maxItemCols: 100,
            minItemCols: 1,
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
                stop: DashboardComponent.eventStop
            },
            resizable: {
                delayStart: 0,
                enabled: flag,
                stop: DashboardComponent.eventStop,
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
            disableWarnings: false,
            scrollToNewItems: false
        };
    }

    editLayout() {
        this._tempDashboard = Object.assign({},this.dashboard);
        this.editLayoutObj = true;
        this.initConfig(true);
    }

    resetLayout() {
        this.preferences.dashboard = undefined;
        //initWidgets();
        //setWidgetPreference();
    }

    saveWidget() {
        this.editLayoutObj = false;
        this.initConfig(false);
    }

    cancelWidget() {
        this.editLayoutObj = false;
       // this.dashboard = Object.assign({},this._tempDashboard);
        console.log(Object.assign({},this._tempDashboard))
        this.initConfig(false);
    }

    removeWidget($event, item) {
        $event.preventDefault();
        $event.stopPropagation();
        this.dashboard.splice(this.dashboard.indexOf(item), 1);
    }

    addWidgetDialog() {

    }

}
