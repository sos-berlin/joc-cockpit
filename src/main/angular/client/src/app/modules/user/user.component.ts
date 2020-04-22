import {Component, Input, OnInit} from '@angular/core';
import {CoreService} from '../../services/core.service';
import {AuthService} from '../../components/guard';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import * as moment from 'moment-timezone';
import * as jstz from 'jstz';
import {ConfirmModalComponent} from '../../components/comfirm-modal/confirm.component';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {DataService} from '../../services/data.service';
import {Subscription} from 'rxjs';
import {FileUploader} from 'ng2-file-upload';
import {ToasterService} from 'angular2-toaster';

declare var $;

@Component({
  selector: 'app-ngbd-modal-content',
  templateUrl: './update-dialog.html'
})
export class UpdateKeyModalComponent {
  @Input() isPrivate: any;
  @Input() paste: any;
  @Input() data: any;
  submitted = false;

  constructor(public activeModal: NgbActiveModal, public coreService: CoreService) {
  }

  onSubmit(): void {
    this.submitted = true;
    let obj;
    if (this.isPrivate) {
      obj = {keys: {private: this.data.privateKey}};
    } else {
      obj = {keys: {public: this.data.publicKey}};
    }
    this.coreService.post('publish/set_key', obj).subscribe(res => {
      this.submitted = false;
      this.activeModal.close();
    }, (err) => {
      this.submitted = false;
    });
  }
}

@Component({
  selector: 'app-ngbd-modal-content',
  templateUrl: './import-key-dialog.html'
})
export class ImportKeyModalComponent implements OnInit {

  @Input() schedulerId: any;
  @Input() display: any;

  uploader: FileUploader;
  fileLoading = false;
  messageList: any;
  required = false;
  submitted = false;
  comments: any = {};

  constructor(public activeModal: NgbActiveModal, private coreService: CoreService, private authService: AuthService, public translate: TranslateService, public toasterService: ToasterService) {
    this.uploader = new FileUploader({
      url: './api/publish/import_key'
    });
  }

  ngOnInit() {
    this.comments.radio = 'predefined';
    if (sessionStorage.comments) {
      this.messageList = JSON.parse(sessionStorage.comments);
    }
    if (sessionStorage.$SOS$FORCELOGING == 'true') {
      this.required = true;
    }

    this.uploader.onBeforeUploadItem = (item: any) => {
      let obj: any = {
        'X-Access-Token': this.authService.accessTokenId,
        'name': item.file.name
      };
      if (this.comments.comment) {
        obj.comment = this.comments.comment;
      }
      if (this.comments.timeSpent) {
        obj.timeSpent = this.comments.timeSpent;
      }
      if (this.comments.ticketLink) {
        obj.ticketLink = this.comments.ticketLink;
      }
      item.file.name = encodeURIComponent(item.file.name);
      this.uploader.options.additionalParameter = obj;
    };

    this.uploader.onCompleteItem = (fileItem: any, response, status, headers) => {
      if (status === 200) {
        this.activeModal.close('success');
      }
    };

    this.uploader.onErrorItem = (fileItem, response: any, status, headers) => {
      if (response.error) {
        this.toasterService.pop('error', response.error.code, response.error.message);
      }
    };
  }

  cancel() {
    this.activeModal.close('');
  }

}

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
  subsVar: Subscription;

  jobs: any = [
    {value: 'JobStopped', label: 'label.jobStopped'},
    {value: 'JobPending', label: 'label.jobPending'}
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

  constructor(public coreService: CoreService, private dataService: DataService, private authService: AuthService, private router: Router,
              private modalService: NgbModal, private translate: TranslateService, private toasterService: ToasterService) {
    this.subsVar = dataService.resetProfileSetting.subscribe(res => {
      if (res) {
        this.configObj.id = parseInt(sessionStorage.preferenceId, 10);
        this.setPreferences();
      }
    });
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
        if (this.preferences.events.filter) {
          this.eventFilter = JSON.parse(this.preferences.events.filter);
        }
      } else {
        this.preferences.events = {};
      }
    }

    if (this.eventFilter) {
      this.eventFilter.forEach((name) => {
        if (name) {
          if (name.match('Job')) {
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

  changeConfiguration() {
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
    this.dataService.resetProfileSetting.next(true);
    this.savePreferences();
  }

  changeView() {
    let views = {
      dailyPlan: this.preferences.pageView,
      job: this.preferences.pageView,
      order: this.preferences.pageView,
      agent: this.preferences.pageView,
      lock: this.preferences.pageView,
      processClass: this.preferences.pageView,
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
    const headerDom = $('#headerColor');
    const avatarrDom = $('#avatarBg');
    for (let i = 0; i < headerDom[0].classList.length; i++) {
      let temp = headerDom[0].classList[i].split('-');
      if (temp[0] === 'header') {
        this.prevMenuTheme = headerDom[0].classList[i];
        break;
      }
    }
    headerDom.removeClass(this.prevMenuTheme);
    headerDom.addClass(theme);

    for (let i = 0; i < avatarrDom[0].classList.length; i++) {
      let temp = avatarrDom[0].classList[i].split('-');
      if (temp[0] === 'avatarbg') {
        this.prevMenuAvatorColor = avatarrDom[0].classList[i];
        break;
      }
    }
    avatarrDom.removeClass(this.prevMenuAvatorColor);
    if (headerDom.hasClass('header-prussian-blue')) {
      avatarrDom.addClass('avatarbg-prussian-blue');
      localStorage.$SOS$AVATARTHEME = 'avatarbg-prussian-blue';
      this.preferences.avatarColor = 'avatarbg-prussian-blue';
    } else if (headerDom.hasClass('header-eggplant')) {
      avatarrDom.addClass('avatarbg-eggplant');
      localStorage.$SOS$AVATARTHEME = 'avatarbg-eggplant';
      this.preferences.avatarColor = 'avatarbg-eggplant';
    } else if (headerDom.hasClass('header-blackcurrant')) {
      avatarrDom.addClass('avatarbg-blackcurrant');
      localStorage.$SOS$AVATARTHEME = 'avatarbg-blackcurrant';
      this.preferences.avatarColor = 'avatarbg-blackcurrant';
    } else if (headerDom.hasClass('header-Dodger-Blue')) {
      avatarrDom.addClass('avatarbg-Dodger-Blue');
      localStorage.$SOS$AVATARTHEME = 'avatarbg-Dodger-Blue';
      this.preferences.avatarColor = 'avatarbg-Dodger-Blue';
    } else if (headerDom.hasClass('header-nordic')) {
      avatarrDom.addClass('avatarbg-nordic');
      localStorage.$SOS$AVATARTHEME = 'avatarbg-nordic';
      this.preferences.avatarColor = 'avatarbg-nordic';
    } else if (headerDom.hasClass('header-light-sea-green')) {
      avatarrDom.addClass('avatarbg-light-sea-green');
      localStorage.$SOS$AVATARTHEME = 'avatarbg-light-sea-green';
      this.preferences.avatarColor = 'avatarbg-light-sea-green';
    } else if (headerDom.hasClass('header-toledo')) {
      avatarrDom.addClass('avatarbg-toledo');
      localStorage.$SOS$AVATARTHEME = 'avatarbg-toledo';
      this.preferences.avatarColor = 'avatarbg-toledo';
    } else if (headerDom.hasClass('header-Pine-Green')) {
      avatarrDom.addClass('avatarbg-Pine-Green');
      localStorage.$SOS$AVATARTHEME = 'avatarbg-Pine-Green';
      this.preferences.avatarColor = 'avatarbg-Pine-Green';
    } else if (headerDom.hasClass('header-radical-red')) {
      avatarrDom.addClass('avatarbg-radical-red');
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
    this.object.positiveOrders.forEach((val) => {
      this.eventFilter.push(val.value);
    });
    this.object.negativeOrders.forEach((val) => {
      this.eventFilter.push(val.value);
    });
    this.preferences.events.filter = this.eventFilter;
    this.savePreferences();
  }

  pasteKey() {
    const modalRef = this.modalService.open(UpdateKeyModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.paste = true;
    modalRef.componentInstance.data = {};
    modalRef.result.then((result) => {
      console.log(result);
    }, (reason) => {
      console.log('close...', reason);
    });
  }

  generateKey() {
    this.coreService.post('publish/generate_key', {}).subscribe(res => {
      this.toasterService.pop('success', 'Key has generated successfully');
    });
  }

  importKey() {
    const modalRef = this.modalService.open(ImportKeyModalComponent, {backdrop: 'static', size: 'lg'});
    modalRef.result.then(() => {

    }, (reason) => {
      console.log('close...', reason);
    });
  }

  showKey(isPrivate) {
    this.coreService.post('publish/show_key', {}).subscribe((res: any) => {
      const modalRef = this.modalService.open(UpdateKeyModalComponent, {backdrop: 'static'});
      modalRef.componentInstance.data = res;
      modalRef.componentInstance.isPrivate = isPrivate;
      modalRef.result.then(() => {

      }, (reason) => {

      });
    });
  }

  resetProfile() {
    const modalRef = this.modalService.open(ConfirmModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.title = 'resetProfile';
    modalRef.componentInstance.message = 'resetSingleProfile';
    modalRef.componentInstance.type = 'Reset';
    modalRef.componentInstance.objectName = this.permission.user;
    modalRef.result.then(() => {
      this._resetProfile();
    }, (reason) => {
      console.log('close...', reason);
    });
  }

  private _resetProfile() {
    const obj = {accounts: [this.permission.user]};
    this.coreService.post('configurations/delete', obj).subscribe(res => {
      this.dataService.isProfileReload.next(true);
    });
  }
}

