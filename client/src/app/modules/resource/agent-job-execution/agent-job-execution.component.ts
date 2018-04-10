import {Component, OnInit, OnDestroy, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';

import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard/auth.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

import {DataService} from '../../../services/data.service';

import * as moment from 'moment';

declare var $;

//Main Component
@Component({
  selector: 'app-agent-job-execution',
  templateUrl: 'agent-job-execution.component.html',
  styleUrls: ['./agent-job-execution.component.css'],

})
export class AgentJobExecutionComponent implements OnInit, OnDestroy {

  isLoading: boolean = false;
  loading: boolean;
  schedulerIds: any;
  preferences: any;
  permission: any;
  agentTasks: any = [];
  agentJobSearch: any = {};
  agentJobExecutionFilters: any = {};
  subscription: Subscription;
  totalJobExecution: any;
  dataFormat:any;
  config:any = {};

  constructor(private authService: AuthService, public coreService: CoreService, private modalService: NgbModal, private dataService: DataService) {
    this.subscription = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
  }

  private refresh(args) {
    for (let i = 0; i < args.length; i++) {
      if (args[i].jobschedulerId == this.schedulerIds.selected) {
        if (args[i].eventSnapshots && args[i].eventSnapshots.length > 0) {
          for (let j = 0; j < args[i].eventSnapshots.length; j++) {
            if (args[i].eventSnapshots[j].eventType === "CalendarCreated") {

              break;
            }

          }
        }
        break
      }
    }
  }


  ngOnInit() {

    this.agentJobExecutionFilters = this.coreService.getResourceTab().agentJobExecution;
    if (sessionStorage.preferences)
      this.preferences = JSON.parse(sessionStorage.preferences);
    if (this.authService.scheduleIds)
      this.schedulerIds = JSON.parse(this.authService.scheduleIds);

    if (this.authService.permission)
      this.permission = JSON.parse(this.authService.permission);

    this.loadAgentTasks(null);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  setDateRange(filter) {

    if (this.agentJobExecutionFilters.filter.date == 'today') {
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
      delete filter["timeZone"];
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
    if (type)
      this.agentJobExecutionFilters.filter.date = type;
    this.isLoading = false;
    let obj = {
      jobschedulerId: this.agentJobExecutionFilters.current == true ? this.schedulerIds.selected : ''
    };
    obj = this.setDateRange(obj);
    let result: any;
    this.coreService.post('report/agents', obj).subscribe((res) => {
      result = res;
      this.agentTasks = result.agents;
      this.totalJobExecution = result.totalNumOfSuccessfulTasks;
      this.isLoading = true;
    }, (err) => {
      this.isLoading = true;
      this.agentTasks = [];
    });
  }

  advancedSearch(){

  }

  cancel(){

  }

  search(){

  }


  /** ---------------------------- Action ----------------------------------*/

  sortBy(propertyName) {
    this.agentJobExecutionFilters.reverse = !this.agentJobExecutionFilters.reverse;
    this.agentJobExecutionFilters.filter.sortBy = propertyName;
  }

  changeJobScheduler() {

  }

  exportToExcel(){

  }

}

