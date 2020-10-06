import {Component, OnInit, OnDestroy} from '@angular/core';
import {Subscription} from 'rxjs';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {DataService} from '../../../services/data.service';
import * as moment from 'moment';

@Component({
  selector: 'app-agent-job-execution',
  templateUrl: 'agent-job-execution.component.html',
  styleUrls: ['./agent-job-execution.component.css'],

})
export class AgentJobExecutionComponent implements OnInit, OnDestroy {

  isLoading = false;
  showSearchPanel = false;
  schedulerIds: any = {};
  preferences: any = {};
  permission: any = {};
  agentTasks: any = [];
  agentJobSearch: any = {};
  agentJobExecutionFilters: any = {};
  subscription1: Subscription;
  subscription2: Subscription;
  totalJobExecution: any;
  totalNumOfJobs: any;
  dateFormat: any;
  dateFormatM: any;

  constructor(private authService: AuthService, public coreService: CoreService, private modalService: NgbModal, private dataService: DataService) {
    this.subscription1 = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
    this.subscription2 = dataService.refreshAnnounced$.subscribe(() => {
      this.init();
    });
  }

  ngOnInit() {
    this.init();
  }

  ngOnDestroy() {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
  }

  setDateRange(filter) {

    if (this.agentJobExecutionFilters.filter.date === 'today') {
      let from = new Date();
      let to = new Date();
      from.setHours(0);
      from.setMinutes(0);
      from.setSeconds(0);
      from.setMilliseconds(0);
      to.setDate(to.getDate() + 1);
      to.setHours(0);
      to.setMinutes(0);
      to.setSeconds(0);
      to.setMilliseconds(0);

      filter.dateFrom = from;
      filter.dateTo = to;
    } else if (this.agentJobExecutionFilters.filter.date && this.agentJobExecutionFilters.filter.date != 'all') {
      filter.dateFrom = this.agentJobExecutionFilters.filter.date;
      filter.timeZone = this.preferences.zone;
    }
    if ((filter.dateFrom && typeof filter.dateFrom.getMonth === 'function') || (filter.dateTo && typeof filter.dateTo.getMonth === 'function')) {
      delete filter['timeZone'];
    }
    if ((filter.dateFrom && typeof filter.dateFrom.getMonth === 'function')) {
      filter.dateFrom = moment(filter.dateFrom).tz(this.preferences.zone);
    }
    if ((filter.dateTo && typeof filter.dateTo.getMonth === 'function')) {
      filter.dateTo = moment(filter.dateTo).tz(this.preferences.zone);
    }

    return filter;
  }

  loadAgentTasks(type) {
    if (type) {
      this.agentJobExecutionFilters.filter.date = type;
    }
    this.isLoading = false;
    let obj = {
      jobschedulerId: this.agentJobExecutionFilters.current === true ? this.schedulerIds.selected : ''
    };
    obj = this.setDateRange(obj);
    this.coreService.post('report/agents', obj).subscribe((res: any) => {
      this.agentTasks = res.agents || [];
      this.totalJobExecution = res.totalNumOfSuccessfulTasks;
      this.totalNumOfJobs = res.totalNumOfJobs;
      this.isLoading = true;
    }, () => {
      this.isLoading = true;
      this.agentTasks = [];
    });
  }

  advancedSearch() {
    this.showSearchPanel = true;
    this.agentJobSearch = {
      from: new Date(),
      fromTime: new Date(),
      to: new Date(),
      toTime: new Date()
    };
  }

  cancel() {
    this.showSearchPanel = false;
    this.agentJobSearch = {};
  }

  search() {

  }

  /** ---------------------------- Action ----------------------------------*/

  pageIndexChange($event) {
    this.agentJobExecutionFilters.currentPage = $event;
  }

  pageSizeChange($event) {
    this.agentJobExecutionFilters.entryPerPage = $event;
  }

  sort(propertyName) {
    this.agentJobExecutionFilters.reverse = !this.agentJobExecutionFilters.reverse;
    this.agentJobExecutionFilters.filter.sortBy = propertyName;
  }

  changeJobScheduler() {

  }

  exportToExcel() {

  }

  private refresh(args) {
    for (let i = 0; i < args.length; i++) {
      if (args[i].jobschedulerId === this.schedulerIds.selected) {
        if (args[i].eventSnapshots && args[i].eventSnapshots.length > 0) {
          for (let j = 0; j < args[i].eventSnapshots.length; j++) {
            if (args[i].eventSnapshots[j].eventType === 'JobStateChanged') {
              this.loadAgentTasks(null);
              break;
            }
          }
        }
        break;
      }
    }
  }

  private init() {
    this.agentJobExecutionFilters = this.coreService.getResourceTab().agentJobExecution;
    this.coreService.getResourceTab().state = 'agentJobExecutions';
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences);
    }

    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    this.permission = JSON.parse(this.authService.permission) || {};
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
    this.loadAgentTasks(null);
  }

}

