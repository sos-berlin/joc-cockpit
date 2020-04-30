import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs';
import {CoreService} from '../../../services/core.service';
import {DataService} from '../../../services/data.service';
import {AuthService} from '../../../components/guard';
import * as moment from 'moment';
import * as _ from 'underscore';

declare const $;

@Component({
  selector: 'app-preview-calendar-template',
  template: '<div id="full-calendar"></div>',
})
export class PreviewCalendarComponent implements OnInit, OnDestroy {
  @Input() schedulerId: any;
  calendar: any;
  planItems = [];
  tempList = [];
  calendarTitle: number;
  toDate: any;
  subscription: Subscription;

  constructor(private coreService: CoreService, private dataService: DataService) {
    this.calendarTitle = new Date().getFullYear();
  }

  ngOnInit(): void {
    $('#full-calendar').calendar({
      renderEnd: (e) => {
        this.calendarTitle = e.currentYear;
        this.changeDate();
      }
    });
    this.subscription = this.dataService.isCalendarReload.subscribe(res => {
      this.calendar = res;
      this.init();
    });
  }

  init() {
    let obj = {
      jobschedulerId: this.schedulerId,
      dateFrom: this.calendar.from || moment().format('YYYY-MM-DD'),
      dateTo: this.calendar.to,
      path: this.calendar.path
    };
    this.toDate = _.clone(obj.dateTo);
    if (new Date(obj.dateTo).getTime() > new Date(this.calendarTitle + '-12-31').getTime()) {
      obj.dateTo = this.calendarTitle + '-12-31';
    }
    this.getDates(obj, true);
  }

  changeDate() {
    let newDate = new Date();
    newDate.setHours(0, 0, 0, 0);
    let toDate: any;
    if (new Date(this.toDate).getTime() > new Date(this.calendarTitle + '-12-31').getTime()) {
      toDate = this.calendarTitle + '-12-31';
    } else {
      toDate = this.toDate;
    }

    if (newDate.getFullYear() < this.calendarTitle && (new Date(this.calendarTitle + '-01-01').getTime() < new Date(toDate).getTime())) {
      let obj = {
        jobschedulerId: this.schedulerId,
        dateFrom: this.calendarTitle + '-01-01',
        dateTo: toDate,
        path: this.calendar.path
      };
      this.getDates(obj, false);
    } else if (newDate.getFullYear() === this.calendarTitle) {
      this.planItems = _.clone(this.tempList);
      if ($('#full-calendar').data('calendar')) {
        $('#full-calendar').data('calendar').setDataSource(this.planItems);
      }
    }
  }

  private getDates(obj, flag: boolean): void {
    this.planItems = [];
    this.coreService.post('calendar/dates', obj).subscribe((result: any) => {
      for (let i = 0; i < result.dates.length; i++) {
        let x = result.dates[i];
        let obj = {
          startDate: moment(x),
          endDate: moment(x),
          color: '#007da6'
        };

        this.planItems.push(obj);
      }
      for (let i = 0; i < result.withExcludes.length; i++) {
        let x = result.withExcludes[i];
        this.planItems.push({
          startDate: moment(x),
          endDate: moment(x),
          color: '#eb8814'
        });
      }
      if (flag) {
        this.tempList = _.clone(this.planItems);
      }
      $('#full-calendar').data('calendar').setDataSource(this.planItems);
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}


@Component({
  selector: 'app-joe',
  templateUrl: './joe.component.html',
  styleUrls: ['./joe.component.scss']
})
export class JoeComponent implements OnInit, OnDestroy {
  schedulerIds: any = {};
  preferences: any = {};
  tree: any = [];
  isLoading = true;
  pageView: any = 'grid';
  options: any = {};
  data: any = {};
  selectedPath: string;
  type: string;

  @ViewChild('treeCtrl', {static: false}) treeCtrl;

  constructor(private authService: AuthService, public coreService: CoreService, private dataService: DataService) {
  }

  ngOnInit() {
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences) || {};
    }
    this.schedulerIds = JSON.parse(this.authService.scheduleIds);
    if (localStorage.views) {
      // this.pageView = JSON.parse(localStorage.views).joe || 'grid';
    }
    this.initTree();
  }

  ngOnDestroy() {
    this.coreService.tabs._configuration.state = 'inventory';
  }

  initTree() {
    this.coreService.post('tree', {
      jobschedulerId: this.schedulerIds.selected,
      compact: true,
      types: ['WORKFLOW']
    }).subscribe((res) => {
      this.tree = this.coreService.prepareTree(res);
      if(this.tree.length > 0) {
        this.tree[0].children = [
          {
            id: 2, name: 'Workflows', path: '/Workflows', object: 'workflow', children: [
              {
                name: 'w1', type: 'workflow'
              }
            ]
          }, {
            id: 2, name: 'Job Class', path: '/JobClasses', object: 'jobClass', children: [
              {
                name: 'j_c1', type: 'jobClass'
              }, {
                name: 'j_c2', type: 'jobClass'
              }
            ]
          }, {
            id: 4, name: 'Junction', path: '/Junctions', object: 'junction', children: [
              {
                name: 'j1', type: 'junction'
              }, {
                name: 'j2', type: 'junction'
              }
            ]
          }, {
            id: 5, name: 'Templates', path: '/Templates', object: 'template', children: [
              {
                name: 'Template_1', type: 'template'
              }
            ]
          }, {
            id: 7, name: 'Agent Clusters', path: '/Agent_Clusters', object: 'agentCluster', children: [
              {
                name: 'agent_1', type: 'agentCluster'
              }
            ]
          }, {
            id: 8, name: 'Calendars', path: '/Calendars', object: 'calendar', children: []
          }
        ];
      }
      const interval = setInterval(() => {
        if (this.treeCtrl && this.treeCtrl.treeModel) {
          const node = this.treeCtrl.treeModel.getNodeById(1);
          if (node) {
            node.expand();
            node.data.isSelected = true;
            this.selectedPath = node.data.path;
          }
          clearInterval(interval);
        }
      }, 5);
      this.isLoading = false;
    }, () => this.isLoading = false);
  }

  expandAll(): void {
    this.treeCtrl.treeModel.expandAll();
  }

  // Collapse all Node
  collapseAll(): void {
    this.treeCtrl.treeModel.collapseAll();
  }

  navFullTree() {
    const self = this;
    this.tree.forEach((value) => {
      value.isSelected = false;
      traverseTree(value);
    });

    function traverseTree(data) {
      if (data.children) {
        data.children.forEach((value) => {
          value.isSelected = false;
          traverseTree(value);
        });
      }
    }
  }

  onNodeSelected(e): void {
    this.navFullTree();
    if (this.preferences.expandOption === 'both') {
      const someNode = this.treeCtrl.treeModel.getNodeById(e.node.data.id);
      someNode.expand();
    }
    this.selectedPath = e.node.data.path;
    e.node.data.isSelected = true;
    this.data = e.node.data;
    this.type = e.node.data.object || e.node.data.type;
    if (this.type === 'workflow') {
      this.dataService.isWorkFlowReload.next(true);
    }
  }

  toggleExpanded(e): void {
    e.node.data.isExpanded = e.isExpanded;
  }

  clearWorkFlow() {
    this.dataService.announceFunction('CLEAR_WORKFLOW');
  }

  submitWorkFlow() {
    this.dataService.announceFunction('SUBMIT_WORKFLOW');
  }

  deploy() {
   // this.dataService.announceFunction('DEPLOY');
  }

  export() {
   // this.dataService.announceFunction('EXPORT');
  }

  import() {
  //  this.dataService.announceFunction('IMPORT');
  }

  setVersion() {
   // this.dataService.announceFunction('SET_VERSION');
  }

  receiveMessage($event) {
    this.pageView = $event;
  }
}
