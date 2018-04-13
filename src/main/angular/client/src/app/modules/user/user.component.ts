import { Component, OnInit } from '@angular/core';
import { CoreService } from '../../services/core.service';
import { AuthService } from '../../components/guard/auth.service';
import { TranslateService } from 'ng2-translate';
import { Router } from '@angular/router';
import * as moment from 'moment-timezone';
import * as jstz from 'jstz';

declare var $:any;

@Component({
    selector: 'app-user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  zones: any = {};
  preferences: any = {};
  userPreferences: any = {};
  username: string = '';
  permission: any = {};
  object: any = {};
  schedulerIds: any = {};
  selectedJobScheduler: any = {};
  selectAllJobModel;
  selectAllJobChainModel;
  selectAllPositiveOrderModel;
  selectAllNegativeOrderModel;
  eventFilter: any;
  configObj: any = {};
  timeZone: any = {};
  locales: any = [];
  forceLoging:boolean=false;

  jobs: any = [
    {value: 'JobStopped', label: "label.jobStopped"},
    {value: 'JobPending', label: "label.jobPending"}
  ];
  jobChains: any = [
    {value: 'JobChainStopped', label: "label.jobChainStopped"},
    {value: 'JobChainPending', label: "label.jobChainPending"},
    {value: 'JobChainRunning', label: "label.jobChainUnstopped"}
  ];
  positiveOrders: any = [
    {value: 'OrderStarted', label: "label.orderStarted"},
    {value: 'OrderStepStarted', label: "label.orderStepStarted"},
    {value: 'OrderStepEnded', label: "label.orderStepEnded"},
    {value: 'OrderNodeChanged', label: "label.orderNodeChanged"},
    {value: 'OrderResumed', label: "label.orderResumed"},
    {value: 'OrderFinished', label: "label.orderFinished"}
  ];
  negativeOrders: any = [
    {value: 'OrderSetback', label: "label.orderSetback"},
    {value: 'OrderSuspended', label: "label.orderSuspended"}
  ];

  constructor(public coreService: CoreService, private authService: AuthService, private router: Router, private translate: TranslateService) {

  }

  savePreferences() {
    this.configObj.configurationItem = JSON.stringify(this.preferences);
    sessionStorage.preferences = JSON.stringify(this.preferences);
    this.coreService.post('configuration/save', this.configObj).subscribe(res => {
      console.log(res)
    }, (err) => {
      console.log(err)
    })
  }

  setIds() {
    if (this.authService.scheduleIds) {
      this.schedulerIds = JSON.parse(this.authService.scheduleIds);
    } else {
      this.schedulerIds = {};
    }
  }

  setPreferences() {
    this.username = this.authService.currentUserData;
    if (sessionStorage.preferences && sessionStorage.preferences != 'undefined') {
      this.preferences = JSON.parse(sessionStorage.preferences);
      this.userPreferences = JSON.parse(sessionStorage.preferences);
      this.permission = JSON.parse(this.authService.permission);
      this.selectedJobScheduler = JSON.parse(sessionStorage.$SOS$JOBSCHEDULE);
    }
  }

  ngOnInit() {
    this.locales = [{lang: 'en', country: 'US', name: 'English'}, {
      lang: 'fr',
      country: 'FR',
      name: 'French'
    }, {lang: 'de', country: 'DE', name: 'German'}, {lang: 'ja', country: 'JA', name: 'Japanese'}];
    this.object = {
      jobs: [],
      jobChains: [],
      positiveOrders: [],
      negativeOrders: []
    };
   if (sessionStorage.$SOS$FORCELOGING === 'true') {
     this.forceLoging = true;
     this.preferences.auditLog = true;
   }

    this.setIds();
    this.setPreferences();
    this.zones = moment.tz.names();
    let localTZ = jstz.determine();
    if (localTZ)
      this.timeZone = localTZ.name() || this.selectedJobScheduler.timeZone;
    else {
      this.timeZone = this.selectedJobScheduler.timeZone;
    }
    this.configObj.jobschedulerId = this.schedulerIds.selected;
    this.configObj.account = this.permission.user;
    this.configObj.configurationType = "PROFILE";
    this.configObj.id = parseInt(sessionStorage.preferenceId);
    if (this.preferences.events.filter) {
      this.eventFilter = this.preferences.events.filter;
    } else {
      this.eventFilter = JSON.parse(this.preferences.events.filter);
    }

    let self = this;
    this.eventFilter.forEach(function (name) {
      if (name.match('JobChain')) {
          self.object.jobChains(name)
      }else if(name.match('Job')){
         self.object.jobs(name)
      }else if(name.match('OrderS')){
         self.object.negativeOrders(name)
      }else {
         self.object.positiveOrders(name)
      }
    });
  }

  changeConfiguration(reload) {
    if (isNaN(parseInt(this.preferences.maxRecords))) {
      this.preferences.maxRecords = parseInt(Object.assign({}, this.userPreferences).maxRecords);
    }
    if (isNaN(parseInt(this.preferences.maxAuditLogRecords))) {
      this.preferences.maxAuditLogRecords = parseInt(Object.assign({}, this.userPreferences).maxAuditLogRecords);
    }
    if (isNaN(parseInt(this.preferences.maxHistoryPerOrder))) {
      this.preferences.maxHistoryPerOrder = parseInt(Object.assign({}, this.userPreferences).maxHistoryPerOrder);
    }
    if (isNaN(parseInt(this.preferences.maxHistoryPerTask))) {
      this.preferences.maxHistoryPerTask = parseInt(Object.assign({}, this.userPreferences).maxHistoryPerTask);
    }
    if (isNaN(parseInt(this.preferences.maxAuditLogPerObject))) {
      this.preferences.maxAuditLogPerObject = parseInt(Object.assign({}, this.userPreferences).maxAuditLogPerObject);
    }

    if (isNaN(parseInt(this.preferences.maxOrderPerJobchain))) {
      this.preferences.maxOrderPerJobchain = parseInt(Object.assign({}, this.userPreferences).maxOrderPerJobchain);
    }
    if (isNaN(parseInt(this.preferences.maxHistoryPerJobchain))) {
      this.preferences.maxHistoryPerJobchain = parseInt(Object.assign({}, this.userPreferences).maxHistoryPerJobchain);
    }
    if (this.preferences.entryPerPage > 100) {
      this.preferences.entryPerPage = this.preferences.maxEntryPerPage;
    }

    // $rootScope.$broadcast('reloadPreferences');
    // if (reload)
    // $rootScope.$broadcast('reloadDate');
    this.savePreferences();
  }

  changeView() {
    let views = {
      dailyPlan: this.preferences.pageView,
      jobChain: this.preferences.pageView,
      job: this.preferences.pageView,
      order: this.preferences.pageView,
      agent: this.preferences.pageView,
      lock: this.preferences.pageView,
      processClass: this.preferences.pageView,
      schedule: this.preferences.pageView,
      jobChainOrder: this.preferences.pageView,
      orderOverView: this.preferences.pageView,
      permission: this.preferences.pageView
    };
    localStorage.views = JSON.stringify(views);
  }

  setLocale() {
    localStorage.$SOS$LANG = this.preferences.locale;
    this.translate.use(this.preferences.locale);
    this.savePreferences();
  }

  changeTheme(theme) {
    $('#style-color').attr('href', './styles/' + theme + '-style.css');
    localStorage.$SOS$THEME = theme;
    if (theme == 'lighter') {
      $('#orders_id img').attr("src", './assets/images/order.png');
      $('#jobs_id img').attr("src", './assets/images/job.png');
      $('#dailyPlan_id img').attr("src", './assets/images/daily_plan1.png');
      $('#resources_id img').attr("src", './assets/images/resources1.png');
    } else {
      $('#orders_id img').attr("src", './assets/images/order1.png');
      $('#jobs_id img').attr("src", './assets/images/job1.png');
      $('#dailyPlan_id img').attr("src", './assets/images/daily_plan.png');
      $('#resources_id img').attr("src", './assets/images/resources.png');
    }
    this.savePreferences();
  }

  selectAllJobFunction() {
    if (this.selectAllJobModel) {
      this.object.jobs = [];
      let self = this;
      this.jobs.forEach(function (job) {
        self.object.jobs.push(job.value)
      })
    } else {
      this.object.jobs = [];
    }
    this.updateChecks();
  }

  selectJobFunction() {
    this.selectAllJobModel = this.object.jobs.length === this.jobs.length;
    this.updateChecks();
  }

  selectAllJobChainFunction() {
    if (this.selectAllJobChainModel) {
      this.object.jobChains = [];
      let self = this;
      this.jobChains.forEach(function (job) {
        self.object.jobChains.push(job.value)
      })
    } else {
      this.object.jobChains = [];
    }
    this.updateChecks();
  }

  selectJobChainFunction() {
    this.selectAllJobChainModel = this.object.jobChains.length === this.jobChains.length;
    this.updateChecks();
  }

  selectAllPositiveOrderFunction() {
    if (this.selectAllPositiveOrderModel) {
      this.object.positiveOrders = [];
      let self = this;
      this.positiveOrders.forEach(function (job) {
        self.object.positiveOrders.push(job.value)
      })
    } else {
      this.object.positiveOrders = [];
    }
    this.updateChecks();
  }

  selectPositiveOrderFunction() {
    this.selectAllPositiveOrderModel = this.object.positiveOrders.length === this.positiveOrders.length;
    this.updateChecks();
  }

  selectAllNegativeOrdersFunction() {
    if (this.selectAllNegativeOrderModel) {
      this.object.negativeOrders = [];
      let self = this;
      this.negativeOrders.forEach(function (job) {
        self.object.negativeOrders.push(job.value)
      })
    } else {
      this.object.negativeOrders = [];
    }
    this.updateChecks();
  }

  selectNegativeOrderFunction() {
    this.selectAllNegativeOrderModel = this.object.negativeOrders.length === this.negativeOrders.length;
    this.updateChecks();
  }

  updateChecks() {
    this.eventFilter = [];
    let self = this;
    this.object.jobs.forEach(function (val) {
      self.eventFilter.push(val.value)
    });
    this.object.jobChains.forEach(function (val) {
      self.eventFilter.push(val.value)
    });
    this.object.positiveOrders.forEach(function (val) {
      self.eventFilter.push(val.value)
    });
    this.object.negativeOrders.forEach(function (val) {
      self.eventFilter.push(val.value)
    });
    this.preferences.events.filter = this.eventFilter;
    this.savePreferences();
  }
}

