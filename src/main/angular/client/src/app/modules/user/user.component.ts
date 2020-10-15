import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import * as moment from 'moment-timezone';
import * as jstz from 'jstz';
import {Subscription} from 'rxjs';
import {FileUploader, FileUploaderOptions} from 'ng2-file-upload';
import {ToasterService} from 'angular2-toaster';
import {ConfirmModalComponent} from '../../components/comfirm-modal/confirm.component';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {DataService} from '../../services/data.service';
import {CoreService} from '../../services/core.service';
import {AuthService} from '../../components/guard';

declare var $;

@Component({
  selector: 'app-ngbd-modal-content',
  templateUrl: './update-dialog.html'
})
export class UpdateKeyModalComponent implements OnInit {
  @Input() paste: any;
  @Input() data: any;
  @Input() securityLevel: string;
  submitted = false;
  algorithm: any = {};

  constructor(public activeModal: NgbActiveModal, private coreService: CoreService) {
  }

  ngOnInit() {
    this.algorithm.keyAlg = this.securityLevel !== 'HIGH' ? 'RSA' : 'PGP';
  }

  onSubmit(): void {
    this.submitted = true;
    let obj;
    if (this.securityLevel !== 'HIGH') {
      if (this.algorithm.keyAlg === 'PGP') {
        obj = {privateKey: this.data.privateKey};
      } else if (this.algorithm.keyAlg === 'RSA' || this.algorithm.keyAlg === 'ECDSA') {
        obj = {privateKey: this.data.privateKey, certificate: this.data.certificate};
      }
    } else {
      if (this.algorithm.keyAlg === 'PGP') {
        obj = {publicKey: this.data.privateKey};
      } else if (this.algorithm.keyAlg === 'RSA' || this.algorithm.keyAlg === 'ECDSA') {
        obj = {publicKey: this.data.publicKey, certificate: this.data.certificate};
      }
    }
    obj.keyAlgorithm = this.algorithm.keyAlg;
    this.coreService.post('publish/set_key', {keys :  obj}).subscribe(res => {
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
  @Input() securityLevel: string;

  uploader: FileUploader;
  messageList: any;
  required = false;
  submitted = false;
  comments: any = {};
  key = {keyAlg : 'RSA'};

  constructor(public activeModal: NgbActiveModal, private coreService: CoreService, private authService: AuthService, public translate: TranslateService, public toasterService: ToasterService) {
    this.uploader = new FileUploader({
      url: './api/publish/import_key'
    });
    let uo: FileUploaderOptions = {};
    uo.headers = [{name: 'X-Access-Token', value: this.authService.accessTokenId}];
    this.uploader.setOptions(uo);
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
        name: item.file.name,
        importKeyFilter: JSON.stringify({keyAlgorithm: this.key.keyAlg})
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
  selector: 'app-generate-key-component',
  templateUrl: './generate-key-dialog.html'
})
export class GenerateKeyComponent {
  submitted = false;
  expiry: any = {dateValue: 'date'};
  key: any = {
    keyAlg : 'RSA'
  };

  constructor(public activeModal: NgbActiveModal, private coreService: CoreService, private toasterService: ToasterService) {
  }

  cancel() {
    this.activeModal.close('');
  }

  onChange(date) {
    this.key.date = date;
  }

  generateKey() {
    this.submitted = true;
    const obj: any = {
      keyAlgorithm: this.key.keyAlg
    };
    if (this.expiry.dateValue === 'date') {
      obj.validUntil = this.key.date;
    }
    this.coreService.post('publish/generate_key', obj).subscribe(res => {
      this.toasterService.pop('success', 'Key has been generated successfully');
      this.submitted = false;
      this.activeModal.close('ok');

    });
  }
}

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html'
})
export class UserComponent implements OnInit, OnDestroy {
  zones: any = {};
  preferences: any = {};
  username = '';
  permission: any = {};
  object: any = {};
  schedulerIds: any = {};
  selectedJobScheduler: any = {};
  selectAllJobModel;
  selectAllPositiveOrderModel;
  selectAllNegativeOrderModel;
  eventFilter: any;
  keys: any;
  configObj: any = {};
  timeZone: any = {};
  locales: any = [];
  forceLoging = false;
  prevMenuTheme: string;
  prevMenuAvatorColor: string;
  subsVar: Subscription;
  securityLevel: string;

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
    if (this.schedulerIds.selected) {
      this.configObj.configurationItem = JSON.stringify(this.preferences);
      sessionStorage.preferences = JSON.stringify(this.preferences);
      this.coreService.post('configuration/save', this.configObj).subscribe(res => {
      }, (err) => {
        console.error(err);
      });
    }
  }

  setIds() {
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
  }

  setPreferences() {
    this.username = this.authService.currentUserData;
    this.securityLevel = sessionStorage.securityLevel;
    if (this.securityLevel === 'LOW' && sessionStorage.defaultProfile && sessionStorage.defaultProfile === this.username) {
      this.securityLevel = 'MEDIUM';
    }
    if (sessionStorage.preferences && sessionStorage.preferences != 'undefined') {
      this.preferences = JSON.parse(sessionStorage.preferences);
      this.permission = this.authService.permission ? JSON.parse(this.authService.permission) : {};
      if (sessionStorage.$SOS$JOBSCHEDULE) {
        this.selectedJobScheduler = JSON.parse(sessionStorage.$SOS$JOBSCHEDULE);
      }
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
    this.getKeys();
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

  ngOnDestroy() {
    this.subsVar.unsubscribe();
  }

  getKeys() {
    this.keys ={};
    this.coreService.post('publish/show_key', {}).subscribe((res: any) => {
      this.keys = res;
      if (this.keys.validUntil) {
        this.keys.isKeyExpired = moment(moment(this.keys.validUntil).tz(this.preferences.zone)).diff(moment()) < 0;
      }
    }, (err) => {
      this.keys = null;
    });
  }

  changeConfiguration() {
    if (isNaN(parseInt(this.preferences.maxRecords, 10))) {
      this.preferences.maxRecords = parseInt(Object.assign({}, this.preferences, 10).maxRecords, 10);
    }
    if (isNaN(parseInt(this.preferences.maxAuditLogRecords, 10))) {
      this.preferences.maxAuditLogRecords = parseInt(Object.assign({}, this.preferences).maxAuditLogRecords, 10);
    }
    if (isNaN(parseInt(this.preferences.maxHistoryPerOrder, 10))) {
      this.preferences.maxHistoryPerOrder = parseInt(Object.assign({}, this.preferences).maxHistoryPerOrder, 10);
    }
    if (isNaN(parseInt(this.preferences.maxHistoryPerTask, 10))) {
      this.preferences.maxHistoryPerTask = parseInt(Object.assign({}, this.preferences).maxHistoryPerTask, 10);
    }
    if (isNaN(parseInt(this.preferences.maxAuditLogPerObject, 10))) {
      this.preferences.maxAuditLogPerObject = parseInt(Object.assign({}, this.preferences).maxAuditLogPerObject, 10);
    }

    if (isNaN(parseInt(this.preferences.maxOrderPerJobchain, 10))) {
      this.preferences.maxOrderPerJobchain = parseInt(Object.assign({}, this.preferences).maxOrderPerJobchain, 10);
    }
    if (isNaN(parseInt(this.preferences.maxHistoryPerJobchain, 10))) {
      this.preferences.maxHistoryPerJobchain = parseInt(Object.assign({}, this.preferences).maxHistoryPerJobchain, 10);
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
    modalRef.componentInstance.securityLevel = this.securityLevel;
    modalRef.componentInstance.paste = true;
    modalRef.componentInstance.data = {};
    modalRef.result.then((result) => {
      this.getKeys();
    }, (reason) => {

    });
  }

  showGenerateKeyModal() {
    const modalRef = this.modalService.open(GenerateKeyComponent, {backdrop: 'static'});
    modalRef.result.then((result) => {
      this.getKeys();
    }, (reason) => {

    });
  }

  importKey() {
    const modalRef = this.modalService.open(ImportKeyModalComponent, {backdrop: 'static', size: 'lg'});
    modalRef.componentInstance.securityLevel = this.securityLevel;
    modalRef.result.then(() => {
      this.getKeys();
    }, (reason) => {

    });
  }

  showKey() {
    const modalRef = this.modalService.open(UpdateKeyModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.securityLevel = this.securityLevel;
    modalRef.componentInstance.data = this.keys;
    modalRef.result.then(() => {

    }, (reason) => {

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

    });
  }

  private _resetProfile() {
    const obj = {accounts: [this.permission.user]};
    this.coreService.post('configurations/delete', obj).subscribe(res => {
      this.dataService.isProfileReload.next(true);
    });
  }
}

