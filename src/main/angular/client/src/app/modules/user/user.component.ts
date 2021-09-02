import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {FileUploader, FileUploaderOptions} from 'ng2-file-upload';
import {ToasterService} from 'angular2-toaster';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {NzI18nService} from 'ng-zorro-antd/i18n';
import {registerLocaleData} from '@angular/common';
import {ConfirmModalComponent} from '../../components/comfirm-modal/confirm.component';
import {DataService} from '../../services/data.service';
import {CoreService} from '../../services/core.service';
import {AuthService} from '../../components/guard';

declare var $;

@Component({
  selector: 'app-update-modal-content',
  templateUrl: './update-dialog.html'
})
export class UpdateKeyModalComponent implements OnInit {
  @Input() paste: any;
  @Input() data: any;
  @Input() securityLevel: string;
  @Input() type: string;
  @Input() display: any;

  submitted = false;
  comments: any = {};
  algorithm: any = {};

  constructor(public activeModal: NzModalRef, private coreService: CoreService) {
  }

  ngOnInit(): void {
    this.algorithm.keyAlg = this.securityLevel !== 'HIGH' ? 'RSA' : 'PGP';
    this.comments.radio = 'predefined';
    if (this.type === 'ca') {
      this.algorithm.keyAlg = 'ECDSA';
    }
  }

  onSubmit(): void {
    this.submitted = true;
    let obj;
    if(this.type !== 'certificate') {
      if (this.securityLevel !== 'HIGH') {
        if (this.algorithm.keyAlg === 'PGP') {
          obj = {privateKey: this.data.privateKey};
        } else if (this.algorithm.keyAlg === 'RSA' || this.algorithm.keyAlg === 'ECDSA') {
          obj = {privateKey: this.data.privateKey, certificate: this.data.certificate};
        }
      } else {
        if (this.algorithm.keyAlg === 'PGP') {
          obj = {publicKey: this.data.publicKey};
        } else if (this.algorithm.keyAlg === 'RSA' || this.algorithm.keyAlg === 'ECDSA') {
          obj = {publicKey: this.data.publicKey, certificate: this.data.certificate};
        }
      }
      obj.keyAlgorithm = this.algorithm.keyAlg;
    } else{
      obj = {certificate: this.data.certificate};
    }
    obj.auditLog = {};
    if (this.comments.comment) {
      obj.auditLog.comment = this.comments.comment;
    }
    if (this.comments.timeSpent) {
      obj.auditLog.timeSpent = this.comments.timeSpent;
    }
    if (this.comments.ticketLink) {
      obj.auditLog.ticketLink = this.comments.ticketLink;
    }
    const URL = this.type === 'key' ? 'profile/key/store' : this.type === 'certificate' ? 'profile/key/ca/store' : 'profile/ca/store';
    this.coreService.post(URL, {keys: obj}).subscribe(res => {
      this.submitted = false;
      this.activeModal.close();
    }, (err) => {
      this.submitted = false;
    });
  }
}

@Component({
  selector: 'app-import-key-modal',
  templateUrl: './import-key-dialog.html'
})
export class ImportKeyModalComponent implements OnInit {
  @Input() schedulerId: any;
  @Input() display: any;
  @Input() securityLevel: string;
  @Input() type: string;

  uploader: FileUploader;
  submitted = false;
  hasBaseDropZoneOver: any;
  comments: any = {};
  key = {keyAlg: 'RSA'};

  constructor(public activeModal: NzModalRef, private coreService: CoreService, private authService: AuthService,
              public translate: TranslateService, public toasterService: ToasterService) {
    this.uploader = new FileUploader({
      url: this.type === 'key' ? './api/profile/key/import' : this.type === 'certificate' ? './api/profile/key/ca/import' :  './api/profile/ca/import',
      queueLimit: 2
    });
    let uo: FileUploaderOptions = {};
    uo.headers = [{name: 'X-Access-Token', value: this.authService.accessTokenId}];
    this.uploader.setOptions(uo);
  }

  ngOnInit(): void {
    this.comments.radio = 'predefined';
    if (this.type === 'ca') {
      this.key.keyAlg = 'ECDSA';
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
        if (this.uploader.queue.length === 1 || this.uploader.queue[this.uploader.queue.length - 1].file.name === fileItem.file.name) {
          this.activeModal.close('success');
        }
      }
    };

    this.uploader.onErrorItem = (fileItem, response: any, status, headers) => {
      this.submitted = false;
      const res = typeof response === 'string' ? JSON.parse(response) : response;
      if (res.error) {
        this.toasterService.pop('error', res.error.code, res.error.message);
      }
    };
  }

  fileOverBase(e:any): void {
    this.hasBaseDropZoneOver = e;
  }

  // CALLBACKS
  onFileSelected(event: any): void {
    const self = this;
    for (let i = 0; i < event.length; i++) {
      const item = event[i];
      const reader = new FileReader();
      reader.readAsText(item, 'UTF-8');
      reader.onload = onLoadFile;

      function onLoadFile(_event) {
        try {
          const data = _event.target.result;
          if (typeof data === 'string') {
            if (data.match(/private/i)) {
              self.uploader.queue[i].index = 1;
            } else if (data.match(/public/i)) {
              self.uploader.queue[i].index = 2;
            } else if (data.match(/certificate/i)) {
              self.uploader.queue[i].index = 3;
            } else {
              let msg;
              self.translate.get('profile.message.invalidKeyFileSelected').subscribe(translatedValue => {
                msg = translatedValue;
              });
              self.toasterService.pop('error', '', msg);
              self.uploader.queue[i].remove();
            }
          }
        } catch (e) {

        }
      }
    }
  }

  import(): void {
    this.submitted = true;
    this.uploader.queue = this.uploader.queue.sort((a, b) => {
      return a.index - b.index;
    });
    for (let i = 0; i < this.uploader.queue.length; i++) {
      setTimeout(() => {
        this.uploader.queue[i].upload();
      }, 10 * i);
    }
  }

  cancel(): void {
    this.activeModal.close('');
  }
}

@Component({
  selector: 'app-generate-key-component',
  templateUrl: './generate-key-dialog.html'
})
export class GenerateKeyComponent implements OnInit {
  @Input() type: string;
  @Input() display: any;
  submitted = false;
  expiry: any = {dateValue: 'date'};
  caObj: any = {};
  comments: any = {};
  key: any = {
    keyAlg: 'RSA'
  };

  constructor(public activeModal: NzModalRef, private coreService: CoreService, private toasterService: ToasterService) {
  }

  ngOnInit(): void {
    this.comments.radio = 'predefined';
    if (this.type === 'ca') {
      this.key.keyAlg = 'ECDSA';
    }
  }

  cancel(): void {
    this.activeModal.close('');
  }

  onChange(date): void {
    this.key.date = date;
  }

  generateKey(): void {
    this.submitted = true;
    let obj: any = {
      keyAlgorithm: this.key.keyAlg
    };
    if (this.type === 'ca') {
      obj = this.caObj;
    }
    if (this.expiry.dateValue === 'date') {
      obj.validUntil = this.key.date;
    }
    obj.auditLog = {};
    if (this.comments.comment) {
      obj.auditLog.comment = this.comments.comment;
    }
    if (this.comments.timeSpent) {
      obj.auditLog.timeSpent = this.comments.timeSpent;
    }
    if (this.comments.ticketLink) {
      obj.auditLog.ticketLink = this.comments.ticketLink;
    }
    const URL = this.type === 'key' ? 'profile/key/generate' : 'profile/ca/generate';
    this.coreService.post(URL, obj).subscribe(res => {
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
  keys: any;
  caCertificates: any;
  certificates: any;
  configObj: any = {};
  timeZone: any = {};
  forceLoging = false;
  prevMenuTheme: string;
  prevMenuAvatorColor: string;
  securityLevel: string;
  subscription1: Subscription;
  subscription2: Subscription;

  constructor(public coreService: CoreService, private dataService: DataService, public authService: AuthService, private router: Router,
              private modal: NzModalService, private translate: TranslateService, private toasterService: ToasterService, private i18n: NzI18nService) {
    this.subscription1 = dataService.resetProfileSetting.subscribe(res => {
      if (res) {
        this.configObj.id = parseInt(sessionStorage.preferenceId, 10);
        this.setPreferences();
      }
    });
    this.subscription2 = dataService.refreshAnnounced$.subscribe(() => {
      this.setPreferences();
    });
  }

  ngOnInit(): void {
    if (sessionStorage.$SOS$FORCELOGING === 'true') {
      this.forceLoging = true;
      this.preferences.auditLog = true;
    }
    this.setIds();
    this.setPreferences();
    this.zones = this.coreService.getTimeZoneList();
    this.timeZone = this.coreService.getTimeZone();
    this.configObj.controllerId = this.schedulerIds.selected;
    this.configObj.account = this.username;
    this.configObj.configurationType = 'PROFILE';
    this.configObj.id = parseInt(sessionStorage.preferenceId, 10);
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
  }

  tabChange($event): void {
    if ($event.index === 2) {
      if (this.permission.joc && this.permission.joc.administration.certificates.view) {
        this.getKeys();
      }
    } else if ($event.index === 3) {
      if (this.permission.joc && this.permission.joc.administration.certificates.manage) {
        this.getCA();
      }
    }
  }

  savePreferences(): void {
    if (this.schedulerIds.selected) {
      this.configObj.configurationItem = JSON.stringify(this.preferences);
      sessionStorage.preferences = JSON.stringify(this.preferences);
      this.coreService.post('configuration/save', this.configObj).subscribe(res => {
      }, (err) => {
        console.error(err);
      });
    }
  }

  setIds(): void {
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
  }

  setPreferences(): void {
    this.username = this.authService.currentUserData;
    this.securityLevel = sessionStorage.securityLevel;
    if (this.securityLevel === 'LOW' && sessionStorage.defaultProfile && sessionStorage.defaultProfile === this.username) {
      this.securityLevel = 'MEDIUM';
    }
    this.preferences = sessionStorage.preferences ? JSON.parse(sessionStorage.preferences) : {};
    this.permission = this.authService.permission ? JSON.parse(this.authService.permission) : {};
  }

  changeConfiguration(): void {
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

    if (this.preferences.entryPerPage > 100) {
      this.preferences.entryPerPage = this.preferences.maxEntryPerPage;
    }
    sessionStorage.preferences = JSON.stringify(this.preferences);
    this.dataService.resetProfileSetting.next(true);
    this.savePreferences();
  }

  changeView(): void {
    const views = {
      dailyPlan: this.preferences.pageView,
      workflow: this.preferences.pageView,
      inventory: this.preferences.pageView,
      orderOverview: this.preferences.pageView,
      lock: this.preferences.pageView,
      board: this.preferences.pageView,
      documentation: this.preferences.pageView,
      agent: this.preferences.pageView,
      calendar: this.preferences.pageView,
      permission: this.preferences.pageView
    };
    localStorage.views = JSON.stringify(views);
  }

  setLocale(): void {
    localStorage.$SOS$LANG = this.preferences.locale;
    import(`@angular/common/locales/${this.preferences.locale}.js`).then(locale => {
      registerLocaleData(locale.default);
    });
    this.translate.use(this.preferences.locale).subscribe((res) => {
      const data = res.extra;
      data.DatePicker.lang.monthBeforeYear = true;
      data.Calendar.lang.monthBeforeYear = true;
      data.locale = this.preferences.locale;
      for (const i in this.coreService.locales) {
        if (this.preferences.locale === this.coreService.locales[i].lang) {
          this.coreService.locales[i] = {
            ...this.coreService.locales[i],
            ...res.calendar
          };
          break;
        }
      }
      this.i18n.setLocale(data);
    });
    this.savePreferences();
  }

  changeTheme(theme): void {
    $('#style-color').attr('href', './styles/' + theme + '-style.css');
    localStorage.$SOS$THEME = theme;
    this.savePreferences();
  }

  changeMenuTheme(theme): void {
    const headerDom = $('#headerColor');
    const avatarDom = $('#avatarBg');
    for (let i = 0; i < headerDom[0].classList.length; i++) {
      const temp = headerDom[0].classList[i].split('-');
      if (temp[0] === 'header') {
        this.prevMenuTheme = headerDom[0].classList[i];
        break;
      }
    }
    headerDom.removeClass(this.prevMenuTheme);
    headerDom.addClass(theme);

    for (let i = 0; i < avatarDom[0].classList.length; i++) {
      const temp = avatarDom[0].classList[i].split('-');
      if (temp[0] === 'avatarbg') {
        this.prevMenuAvatorColor = avatarDom[0].classList[i];
        break;
      }
    }
    avatarDom.removeClass(this.prevMenuAvatorColor);
    if (headerDom.hasClass('header-prussian-blue')) {
      this.preferences.avatarColor = 'avatarbg-prussian-blue';
    } else if (headerDom.hasClass('header-eggplant')) {
      this.preferences.avatarColor = 'avatarbg-eggplant';
    } else if (headerDom.hasClass('header-blackcurrant')) {
      this.preferences.avatarColor = 'avatarbg-blackcurrant';
    } else if (headerDom.hasClass('header-Dodger-Blue')) {
      this.preferences.avatarColor = 'avatarbg-Dodger-Blue';
    } else if (headerDom.hasClass('header-nordic')) {
      this.preferences.avatarColor = 'avatarbg-nordic';
    } else if (headerDom.hasClass('header-light-sea-green')) {
      this.preferences.avatarColor = 'avatarbg-light-sea-green';
    } else if (headerDom.hasClass('header-toledo')) {
      this.preferences.avatarColor = 'avatarbg-toledo';
    } else if (headerDom.hasClass('header-Pine-Green')) {
      this.preferences.avatarColor = 'avatarbg-Pine-Green';
    } else if (headerDom.hasClass('header-radical-red')) {
      this.preferences.avatarColor = 'avatarbg-radical-red';
    }
    avatarDom.addClass(this.preferences.avatarColor);
    localStorage.$SOS$AVATARTHEME = this.preferences.avatarColor;
    localStorage.$SOS$MENUTHEME = theme;
    this.savePreferences();
  }

  resetProfile(): void {
    const modal = this.modal.create({
      nzTitle: null,
      nzContent: ConfirmModalComponent,
      nzComponentParams: {
        title: 'resetProfile',
        message: 'resetSingleProfile',
        type: 'Reset',
        objectName: this.username
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this._resetProfile();
      }
    });
  }

  private _resetProfile(): void {
    const obj = {accounts: [this.username]};
    this.coreService.post('configurations/delete', obj).subscribe(res => {
      this.dataService.isProfileReload.next(true);
    });
  }

  getKeys(): void {
    this.keys = {};
    this.caCertificates = {};
    this.coreService.post('profile/key', {}).subscribe((res: any) => {
      this.keys = res;
      if (this.keys.validUntil) {
        this.keys.isKeyExpired = this.coreService.getTimeDiff(this.preferences, this.keys.validUntil) < 0;
      }
    }, (err) => {
      this.keys = {};
    });
    if (this.permission.joc && this.permission.joc.administration.certificates.manage) {
      this.coreService.post('profile/key/ca', {}).subscribe((res: any) => {
        this.caCertificates = res;
        if (this.caCertificates.validUntil) {
          this.caCertificates.isKeyExpired = this.coreService.getTimeDiff(this.preferences, this.caCertificates.validUntil) < 0;
        }
      }, (err) => {
        this.caCertificates = {};
      });
    }
  }

  getCA(): void {
    this.certificates = {};
    this.coreService.post('profile/ca', {}).subscribe((res: any) => {
      this.certificates = res;
      if (this.certificates.validUntil) {
        this.certificates.isKeyExpired = this.coreService.getTimeDiff(this.preferences, this.certificates.validUntil) < 0;
      }
    }, (err) => {
      this.certificates = {};
    });
  }

  pasteKey(type = 'key'): void {
    const modal = this.modal.create({
      nzTitle: null,
      nzContent: UpdateKeyModalComponent,
      nzAutofocus: null,
      nzComponentParams: {
        securityLevel: this.securityLevel,
        display : this.preferences.auditLog,
        paste: true,
        type,
        data: {}
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        type === 'ca' ? this.getCA() : this.getKeys();
      }
    });
  }

  showGenerateKeyModal(type = 'key'): void {
    const modal = this.modal.create({
      nzTitle: null,
      nzContent: GenerateKeyComponent,
      nzComponentParams: {
        display : this.preferences.auditLog,
        type
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        type === 'ca' ? this.getCA() : this.getKeys();
      }
    });
  }

  importKey(type = 'key'): void {
    const modal = this.modal.create({
      nzTitle: null,
      nzContent: ImportKeyModalComponent,
      nzClassName: 'lg',
      nzComponentParams: {
        securityLevel: this.securityLevel,
        display : this.preferences.auditLog,
        type
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        type === 'ca' ? this.getCA() : this.getKeys();
      }
    });
  }

  showKey(type = 'key'): void {
    this.modal.create({
      nzTitle: null,
      nzContent: UpdateKeyModalComponent,
      nzComponentParams: {
        securityLevel: this.securityLevel,
        type,
        data: type === 'key' ? this.keys : type === 'certificate' ? this.caCertificates : this.certificates
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
  }
}

