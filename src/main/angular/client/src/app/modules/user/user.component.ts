import {Component, OnInit} from '@angular/core';
import {CoreService} from '../../services/core.service';
import {AuthService} from '../../components/guard';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import * as moment from 'moment-timezone';
import * as jstz from 'jstz';

declare var $;

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html'
})
export class UserComponent implements OnInit {
  zones: any = {};
  preferences: any = {};
  userPreferences: any = {};
  username = '';
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
  forceLoging = false;
  prevMenuTheme: string;
  prevMenuAvatorColor: string;
  jobs: any = [
    {value: 'JobStopped', label: 'label.jobStopped'},
    {value: 'JobPending', label: 'label.jobPending'}
  ];
  jobChains: any = [
    {value: 'JobChainStopped', label: 'label.jobChainStopped'},
    {value: 'JobChainPending', label: 'label.jobChainPending'},
    {value: 'JobChainRunning', label: 'label.jobChainUnstopped'}
  ];
  positiveOrders: any = [
    {value: 'OrderStarted', label: 'label.orderStarted'},
    {value: 'OrderStepStarted', label: 'label.orderStepStarted'},
    {value: 'OrderStepEnded', label: 'label.orderStepEnded'},
    {value: 'OrderNodeChanged', label: 'label.orderNodeChanged'},
    {value: 'OrderResumed', label: 'label.orderResumed'},
    {value: 'OrderFinished', label: 'label.orderFinished'}
  ];
  negativeOrders: any = [
    {value: 'OrderSetback', label: 'label.orderSetback'},
    {value: 'OrderSuspended', label: 'label.orderSuspended'}
  ];

  constructor(public coreService: CoreService, private authService: AuthService, private router: Router, private translate: TranslateService) {

  }

  savePreferences() {
    this.configObj.configurationItem = JSON.stringify(this.preferences);
    sessionStorage.preferences = JSON.stringify(this.preferences);
    this.coreService.post('configuration/save', this.configObj).subscribe(res => {
    }, (err) => {
      console.error(err);
    });
  }

  setIds() {
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
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
    this.locales = [
      {lang: 'en', country: 'US', name: 'English'},
      {lang: 'fr', country: 'FR', name: 'French'},
      {lang: 'de', country: 'DE', name: 'German'},
      {lang: 'ja', country: 'JA', name: 'Japanese'}];

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
    const localTZ = jstz.determine();
    if (localTZ) {
      this.timeZone = localTZ.name() || this.selectedJobScheduler.timeZone;
    } else {
      this.timeZone = this.selectedJobScheduler.timeZone;
    }
    this.configObj.jobschedulerId = this.schedulerIds.selected;
    this.configObj.account = this.permission.user;
    this.configObj.configurationType = 'PROFILE';
    this.configObj.id = parseInt(sessionStorage.preferenceId, 10);
    if (this.preferences.events && this.preferences.events.filter) {
      this.eventFilter = this.preferences.events.filter;
    } else {
      if (this.preferences.events) {
        if(this.preferences.events.filter) {
          this.eventFilter = JSON.parse(this.preferences.events.filter);
        }
      } else {
        this.preferences.events = {};
      }
    }

    if (this.eventFilter) {
      this.eventFilter.forEach((name) => {
        if (name) {
          if (name.match('JobChain')) {
            this.object.jobChains.push(name);
          } else if (name.match('Job')) {
            this.object.jobs.push(name);
          } else if (name.match('OrderSetback') || name.match('OrderSuspended')) {
            this.object.negativeOrders.push(name);
          } else {
            this.object.positiveOrders.push(name);
          }
        }
      });
    }
  }

  changeConfiguration(reload) {
    if (isNaN(parseInt(this.preferences.maxRecords, 10))) {
      this.preferences.maxRecords = parseInt(Object.assign({}, this.userPreferences, 10).maxRecords, 10);
    }
    if (isNaN(parseInt(this.preferences.maxAuditLogRecords, 10))) {
      this.preferences.maxAuditLogRecords = parseInt(Object.assign({}, this.userPreferences).maxAuditLogRecords, 10);
    }
    if (isNaN(parseInt(this.preferences.maxHistoryPerOrder, 10))) {
      this.preferences.maxHistoryPerOrder = parseInt(Object.assign({}, this.userPreferences).maxHistoryPerOrder, 10);
    }
    if (isNaN(parseInt(this.preferences.maxHistoryPerTask, 10))) {
      this.preferences.maxHistoryPerTask = parseInt(Object.assign({}, this.userPreferences).maxHistoryPerTask, 10);
    }
    if (isNaN(parseInt(this.preferences.maxAuditLogPerObject, 10))) {
      this.preferences.maxAuditLogPerObject = parseInt(Object.assign({}, this.userPreferences).maxAuditLogPerObject, 10);
    }

    if (isNaN(parseInt(this.preferences.maxOrderPerJobchain, 10))) {
      this.preferences.maxOrderPerJobchain = parseInt(Object.assign({}, this.userPreferences).maxOrderPerJobchain, 10);
    }
    if (isNaN(parseInt(this.preferences.maxHistoryPerJobchain, 10))) {
      this.preferences.maxHistoryPerJobchain = parseInt(Object.assign({}, this.userPreferences).maxHistoryPerJobchain, 10);
    }
    if (this.preferences.entryPerPage > 100) {
      this.preferences.entryPerPage = this.preferences.maxEntryPerPage;
    }
    sessionStorage.preferences = JSON.stringify(this.preferences);
    // $rootScope.$broadcast('reloadPreferences');
    if (reload) {
      // $rootScope.$broadcast('reloadDate');
    }

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
    this.savePreferences();
  }

  changeMenuTheme(theme) {
    for (let i = 0; i < $('#headerColor')[0].classList.length; i++) {
      let temp = $('#headerColor')[0].classList[i].split('-');
      if (temp[0] === 'header') {
        this.prevMenuTheme = $('#headerColor')[0].classList[i];
        break;
      }
    }
    $('#headerColor').removeClass(this.prevMenuTheme);
    $('#headerColor').addClass(theme);

    for (let i = 0; i < $('#avatarBg')[0].classList.length; i++) {
      let temp = $('#avatarBg')[0].classList[i].split('-');
      if (temp[0] === 'avatarbg') {
        this.prevMenuAvatorColor = $('#avatarBg')[0].classList[i];
        break;
      }
    }
    $('#avatarBg').removeClass(this.prevMenuAvatorColor);
    if ($('#headerColor').hasClass('header-prussian-blue')) {
      $('#avatarBg').addClass('avatarbg-prussian-blue');
      localStorage.$SOS$AVATARTHEME = 'avatarbg-prussian-blue';
      this.preferences.avatarColor = 'avatarbg-prussian-blue';
    } else if ($('#headerColor').hasClass('header-eggplant')) {
      $('#avatarBg').addClass('avatarbg-eggplant');
      localStorage.$SOS$AVATARTHEME = 'avatarbg-eggplant';
      this.preferences.avatarColor = 'avatarbg-eggplant';
    } else if ($('#headerColor').hasClass('header-blackcurrant')) {
      $('#avatarBg').addClass('avatarbg-blackcurrant');
      localStorage.$SOS$AVATARTHEME = 'avatarbg-blackcurrant';
      this.preferences.avatarColor = 'avatarbg-blackcurrant';
    } else if ($('#headerColor').hasClass('header-Dodger-Blue')) {
      $('#avatarBg').addClass('avatarbg-Dodger-Blue');
      localStorage.$SOS$AVATARTHEME = 'avatarbg-Dodger-Blue';
      this.preferences.avatarColor = 'avatarbg-Dodger-Blue';
    } else if ($('#headerColor').hasClass('header-nordic')) {
      $('#avatarBg').addClass('avatarbg-nordic');
      localStorage.$SOS$AVATARTHEME = 'avatarbg-nordic';
      this.preferences.avatarColor = 'avatarbg-nordic';
    } else if ($('#headerColor').hasClass('header-light-sea-green')) {
      $('#avatarBg').addClass('avatarbg-light-sea-green');
      localStorage.$SOS$AVATARTHEME = 'avatarbg-light-sea-green';
      this.preferences.avatarColor = 'avatarbg-light-sea-green';
    } else if ($('#headerColor').hasClass('header-toledo')) {
      $('#avatarBg').addClass('avatarbg-toledo');
      localStorage.$SOS$AVATARTHEME = 'avatarbg-toledo';
      this.preferences.avatarColor = 'avatarbg-toledo';
    } else if ($('#headerColor').hasClass('header-Pine-Green')) {
      $('#avatarBg').addClass('avatarbg-Pine-Green');
      localStorage.$SOS$AVATARTHEME = 'avatarbg-Pine-Green';
      this.preferences.avatarColor = 'avatarbg-Pine-Green';
    } else if ($('#headerColor').hasClass('header-radical-red')) {
      $('#avatarBg').addClass('avatarbg-radical-red');
      localStorage.$SOS$AVATARTHEME = 'avatarbg-radical-red';
      this.preferences.avatarColor = 'avatarbg-radical-red';
    }
    localStorage.$SOS$MENUTHEME = theme;
    this.savePreferences();
  }

  selectAllJobFunction() {
    if (this.selectAllJobModel) {
      this.object.jobs = [];
      this.jobs.forEach((job) => {
        this.object.jobs.push(job.value);
      });
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
      this.jobChains.forEach((job) => {
        this.object.jobChains.push(job.value);
      });
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

      this.positiveOrders.forEach((job) => {
        this.object.positiveOrders.push(job.value);
      });
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
      this.negativeOrders.forEach((job) => {
        this.object.negativeOrders.push(job.value);
      });
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
    this.object.jobs.forEach((val) => {
      this.eventFilter.push(val.value);
    });
    this.object.jobChains.forEach((val) => {
      this.eventFilter.push(val.value);
    });
    this.object.positiveOrders.forEach((val) => {
      this.eventFilter.push(val.value);
    });
    this.object.negativeOrders.forEach((val) => {
      this.eventFilter.push(val.value);
    });
    this.preferences.events.filter = this.eventFilter;
    this.savePreferences();
  }
}

