import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {isEqual, isArray, clone} from 'underscore';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {DataService} from '../data.service';
import { AuthService } from '../../../components/guard';
import {CoreService} from '../../../services/core.service';
import {ConfirmModalComponent} from '../../../components/comfirm-modal/confirm.component';

// Add and Edit main Section
@Component({
  selector: 'app-main-modal-content',
  templateUrl: 'main-dialog.html'
})
export class MainSectionModalComponent implements OnInit {
  @Input() userDetail: any;
  @Input() isUpdate: boolean;
  submitted = false;
  mainSection: any = [];
  fullSection = false;
  mainText = '';
  display: any;
  comments: any = {};

  constructor(public activeModal: NzModalRef, public coreService: CoreService) {
  }

  ngOnInit(): void {
    const preferences = sessionStorage.preferences ? JSON.parse(sessionStorage.preferences) : {};
    this.display = preferences.auditLog;
    this.comments.radio = 'predefined';
    if (this.isUpdate) {
      this.userDetail.main.forEach((entry) => {
        const values = [];
        const comments = [];
        if (entry.entryValue && entry.entryValue.length > 0) {
          entry.entryValue.forEach((value) => {
            values.push({ value });
          });
        } else {
          values.push({ value: '' });
        }
        if (entry.entryComment && entry.entryComment.length > 0) {
          entry.entryComment.forEach((comment) => {
            comments.push({ value: comment });
          });
        } else {
          comments.push({ value: '' });
        }
        this.mainSection.push({
          name: entry.entryName,
          values,
          comments
        });
      });
    } else {
      this.mainSection.push({
        name: '',
        values: [{ value: '' }],
        comments: [{ value: '' }]
      });
    }
    this.toggleView(false);
  }

  toggleView(value): void {
    this.fullSection = value;
    if (!value) {
      let main = [];
      this.mainSection.forEach((val) => {
        if (val.name && val.name != '') {
          let obj = {
            entryName: val.name,
            entryValue: [],
            entryComment: []
          };
          val.values.forEach((val1) => {
            if (val1.value && val1.value != '') {
              obj.entryValue.push(val1.value);
            }
          });
          val.comments.forEach((val1) => {
            if (val1.value && val1.value != '') {
              obj.entryComment.push(val1.value);
            }
          });
          main.push(obj);
        }
      });
      this.mainText = '';
      main.forEach((entry) => {
        if (entry.entryComment && entry.entryComment.length > 0) {
          entry.entryComment.forEach((comment) => {
            this.mainText = this.mainText + '#' + comment + '\n';
          });
        }
        this.mainText = this.mainText + entry.entryName + ' = ';
        if (entry.entryValue && entry.entryValue.length > 0) {
          entry.entryValue.forEach((item, index) => {
            this.mainText = this.mainText + (entry.entryValue.length > 1 ? '\\ \n' + item : item);
            if (entry.entryValue.length - 1 !== index) {
              this.mainText = this.mainText + ',';
            }

            if (entry.entryValue.length - 1 === index) {
              this.mainText = this.mainText + '\n';
            }
          });
        }
      });
    }
  }

  generateObject(): void {
    let main = [];
    let obj: any = { entryName: '', entryValue: [], entryComment: [] };
    let arr = this.mainText.split('\n');
    let flag = false;
    for (let i = 0; i < arr.length; i++) {

      if (arr[i]) {
        arr[i] = arr[i].trim();
        if (arr[i].substring(0, 1) === '#') {
          flag = false;
          obj.entryComment.push(arr[i].substring(1));
        } else if (arr[i].lastIndexOf('\\') === arr[i].length - 1) {
          let index = arr[i].indexOf('=');
          if (index > 0) {
            flag = true;
            obj.entryName = arr[i].substring(0, index);
            let x = arr[i].substring(index + 1).trim();
            let val = x.replace('\\', '');
            if (val && val != '') {
              obj.entryValue.push(val);
            }
          } else {
            if (flag) {
              let val = arr[i].substring(0, arr[i].lastIndexOf(','));
              obj.entryValue.push(val);
            }
          }

        } else {
          if (flag) {
            obj.entryValue.push(arr[i]);
            main.push(obj);
            obj = { entryValue: [], entryComment: [] };
            flag = false;
          } else {
            let index = arr[i].indexOf('=');
            if (index > 0) {
              obj.entryName = arr[i].substring(0, index);
              let x = arr[i].substring(index + 1).trim();
              let split = [];
              if (x.substring(0, 1) === '\\') {
                split = x.split(',');
              }
              if (split.length > 0) {
                for (let j = 0; j < split.length; j++) {
                  obj.entryValue.push(split[j].replace('\\', ''));
                }
              } else {
                obj.entryValue.push(x.replace('\\', ''));
              }
              main.push(obj);
              obj = { entryValue: [], entryComment: [] };
            }
          }
        }
      }
    }

    let mainSection = [];
    main.forEach((entry) => {
      let values = [];
      let comments = [];
      if (entry.entryComment && entry.entryComment.length > 0) {
        entry.entryComment.forEach((comment) => {
          comments.push({ value: comment });
        });
      } else {
        comments.push({ value: '' });
      }
      if (entry.entryValue && entry.entryValue.length > 0) {
        entry.entryValue.forEach((value) => {
          values.push({ value });
        });
      } else {
        values.push({ value: '' });
      }

      mainSection.push({
        name: entry.entryName,
        values,
        comments
      });
    });
    this.mainSection = mainSection;
  }

  onSubmit(): void {
    this.submitted = true;
    let main = [];
    this.mainSection.forEach((val) => {
      if (val.name && val.name != '') {
        var obj = {
          entryName: val.name,
          entryValue: [],
          entryComment: []
        };
        val.values.forEach((val1) => {
          if (val1.value && val1.value != '') {
            obj.entryValue.push(val1.value);
          }
        });
        val.comments.forEach((val1) => {
          if (val1.value && val1.value != '') {
            obj.entryComment.push(val1.value);
          }
        });

        main.push(obj);
      }
    });
    this.userDetail.main = main;
    let request: any = { auditLog: {} };
    if (this.comments.comment) {
      request.auditLog.comment = this.comments.comment;
    }
    if (this.comments.timeSpent) {
      request.auditLog.timeSpent = this.comments.timeSpent;
    }
    if (this.comments.ticketLink) {
      request.auditLog.ticketLink = this.comments.ticketLink;
    }
    this.coreService.post('authentication/auth/store', { ...this.userDetail, ...request }).subscribe({
      next: () => {
        this.activeModal.close(this.userDetail.main);
      }, error: () => {
        this.submitted = false;
      }
    });
  }

  addMainEntry(): void {
    const param = {
      name: '',
      values: [{ value: '' }],
      comments: [{ value: '' }]
    };
    if (this.mainSection) {
      this.mainSection.push(param);
    }
  }

  addEntryValueField(index): void {
    if (this.mainSection[index].values) {
      this.mainSection[index].values.push({ value: '' });
    }
  }

  removeEntry(index): void {
    this.mainSection.splice(index, 1);
  }

  removeEntryValueField(parentIindex, index): void {
    this.mainSection[parentIindex].values.splice(index, 1);
  }

  addEntryCommentField(index): void {
    if (this.mainSection[index].comments) {
      this.mainSection[index].comments.push({ value: '' });
    }
  }

  removeEntryCommentField(parentIindex, index): void {
    if (this.mainSection[parentIindex].comments.length === 1) {
      this.mainSection[parentIindex].comments[0].value = '';
    } else {
      this.mainSection[parentIindex].comments.splice(index, 1);
    }
  }
}

// Edit Single Section
@Component({
  selector: 'app-edit-modal-content',
  templateUrl: 'edit-main-dialog.html'
})
export class EditMainSectionModalComponent implements OnInit {
  @Input() oldEntry: any;
  @Input() userDetail: any;

  submitted = false;
  isUnique = true;
  entryValue: any = [];
  entryComment: any = [];
  entry: any;
  existingEntry: string;
  display: any;
  comments: any = {};

  constructor(public activeModal: NzModalRef, private coreService: CoreService) {
  }

  ngOnInit(): void {
    const preferences = sessionStorage.preferences ? JSON.parse(sessionStorage.preferences) : {};
    this.display = preferences.auditLog;
    this.comments.radio = 'predefined';
    this.entry = clone(this.oldEntry);
    this.existingEntry = this.oldEntry.entryName;
    if (this.entry.entryValue.length > 0) {
      this.entry.entryValue.forEach((val) => {
        this.entryValue.push({ value: clone(val) });
      });
    } else {
      this.entryValue.push({ value: '' });
    }
    if (this.entry.entryComment.length > 0) {
      this.entry.entryComment.forEach((val) => {
        this.entryComment.push({ value: clone(val) });
      });
    } else {
      this.entryComment.push({ value: '' });
    }
  }

  checkMainSection(newEntry): void {
    this.isUnique = true;
    for (let i = 0; i < this.userDetail.main.length; i++) {
      if (this.userDetail.main[i].entryName === newEntry && newEntry !== this.existingEntry) {
        this.isUnique = false;
        break;
      }
    }
  }

  onSubmit(): void {
    this.submitted = true;
    this.entry.entryValue = [];
    this.entry.entryComment = [];
    if (this.entryValue.length > 0) {
      this.entryValue.forEach((val) => {
        this.entry.entryValue.push(val.value);
      });
    }
    if (this.entryComment.length > 0) {
      this.entryComment.forEach((val) => {
        this.entry.entryComment.push(val.value);
      });
    }

    this.userDetail.main.forEach((val, index) => {
      if (isEqual(this.oldEntry, val)) {
        this.userDetail.main[index] = this.entry;
      }
    });
    let request: any = { auditLog: {} };
    if (this.comments.comment) {
      request.auditLog.comment = this.comments.comment;
    }
    if (this.comments.timeSpent) {
      request.auditLog.timeSpent = this.comments.timeSpent;
    }
    if (this.comments.ticketLink) {
      request.auditLog.ticketLink = this.comments.ticketLink;
    }
    this.coreService.post('authentication/auth/store', { ...this.userDetail, ...request }).subscribe({
      next: () => {
        this.activeModal.close(this.userDetail.main);
      }, error: () => this.submitted = false
    });
  }

  addValueField(): void {
    const param = {
      value: ''
    };
    if (this.entryValue) {
      this.entryValue.push(param);
    }
  }

  removeValueField(index): void {
    this.entryValue.splice(index, 1);
  }

  addCommentField(): void {
    const param = {
      value: ''
    };
    if (this.entryComment) {
      this.entryComment.push(param);
    }
  }

  removeCommentField(index): void {
    this.entryComment.splice(index, 1);
  }
}

// Ldap
@Component({
  selector: 'app-ldap-modal-content',
  templateUrl: 'ldap-section-dialog.html'
})
export class LdapSectionModalComponent implements OnInit {
  @Input() userDetail: any;
  @Input() isldap: boolean;

  submitted = false;
  mainSection: any = [];
  display: any;
  comments: any = {};

  constructor(public activeModal: NzModalRef, private coreService: CoreService) {
  }

  ngOnInit(): void {
    const preferences = sessionStorage.preferences ? JSON.parse(sessionStorage.preferences) : {};
    this.display = preferences.auditLog;
    this.comments.radio = 'predefined';
    let mainSection;
    if (this.isldap) {
      mainSection = [
        {
          entryName: 'ldapRealm',
          entryValue: ['com.sos.auth.shiro.SOSLdapAuthorizingRealm'],
          entryComment: []
        }, {
          entryName: 'ldapRealm.contextFactory.url',
          entryValue: ['ldap://myHost:389'],
          entryComment: []
        }, {
          entryName: 'rolePermissionResolver',
          entryValue: ['com.sos.auth.shiro.SOSPermissionResolverAdapter'],
          entryComment: []
        }, {
          entryName: 'rolePermissionResolver.ini',
          entryValue: ['$iniRealm'],
          entryComment: []
        }, {
          entryName: 'ldapRealm.rolePermissionResolver',
          entryValue: ['$rolePermissionResolver'],
          entryComment: []
        }, {
          entryName: 'securityManager.realms',
          entryValue: ['$ldapRealm'],
          entryComment: []
        }, {
          entryName: 'cacheManager',
          entryValue: ['org.apache.shiro.cache.MemoryConstrainedCacheManager'],
          entryComment: []
        }, {
          entryName: 'securityManager.cacheManager',
          entryValue: ['$cacheManager'],
          entryComment: []
        }];
    } else {
      mainSection = [
        {
          entryName: 'sessionDAO',
          entryValue: ['com.sos.auth.shiro.SOSDistributedSessionDAO'],
          entryComment: []
        }, {
          entryName: 'securityManager.sessionManager.sessionDAO',
          entryValue: ['$sessionDAO'],
          entryComment: []
        }];
    }
    this.mainSection = clone(mainSection);
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.isldap) {
      for (let i = 0; i < this.mainSection.length; i++) {
        if (this.mainSection[i].entryName === 'ldapRealm.contextFactory.url') {
          if (!isArray(this.mainSection[i].entryValue)) {
            const value = clone(this.mainSection[i].entryValue);
            this.mainSection[i].entryValue = [value];
          }
          break;
        }
      }
    }
    this.userDetail.main = this.userDetail.main.concat(this.mainSection);
    let request: any = { auditLog: {} };
    if (this.comments.comment) {
      request.auditLog.comment = this.comments.comment;
    }
    if (this.comments.timeSpent) {
      request.auditLog.timeSpent = this.comments.timeSpent;
    }
    if (this.comments.ticketLink) {
      request.auditLog.ticketLink = this.comments.ticketLink;
    }
    this.coreService.post('authentication/auth/store', { ...this.userDetail, ...request }).subscribe({
      next: () => {
        this.activeModal.close(this.userDetail.main);
      }, error: () => this.submitted = false
    });
  }
}

@Component({
  selector: 'app-main-section',
  templateUrl: './main-section.component.html'
})
export class MainSectionComponent implements OnInit, OnDestroy {

  loading = true;
  main: any = [];
  usr: any = { currentPage: 1 };
  preferences: any = {};
  permission: any = {};
  userDetail: any = {};
  subscription1: Subscription;
  subscription2: Subscription;

  constructor(public coreService: CoreService, private router: Router, public modal: NzModalService,
    private authService: AuthService, private dataService: DataService) {
    this.subscription1 = this.dataService.dataAnnounced$.subscribe(res => {
      if (res && res.accounts) {
        this.setUserData(res);
      }
    });

    this.subscription2 = this.dataService.functionAnnounced$.subscribe(res => {
      if (res === 'ADD_ALAD') {
        this.addLdapRealm();
      } else if (res === 'ADD_MAIN_SECTION') {
        this.addMainSection();
      } else if (res === 'EDIT_MAIN_SECTION') {
        this.editMainSection();
      } else if (res === 'ENABLE_JOC') {
        this.enableJOCCluster();
      }
    });
  }

  ngOnInit(): void {
    this.preferences = sessionStorage.preferences ? JSON.parse(sessionStorage.preferences) : {};
    this.permission = this.authService.permission ? JSON.parse(this.authService.permission) : {};
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
  }

  setUserData(res): void {
    this.userDetail = res;
    this.main = res.main;
    setTimeout(() => {
      this.loading = false;
    }, 300);
  }

  saveInfo(): void {
    const obj = {
      accounts: this.userDetail.accounts,
      roles: this.userDetail.roles,
      identityServiceName: this.userDetail.identityServiceName,
      main: this.main
    };

    this.coreService.post('authentication/auth/store', obj).subscribe(() => {
      this.main = [...this.main];
      this.dataService.announceFunction('RELOAD');
    });
  }

  editMain(main): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: EditMainSectionModalComponent,
      nzClassName: 'lg',
      nzComponentParams: {
        oldEntry: main,
        userDetail: this.userDetail
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.main = result;
        this.main = [...this.main];
      }
    });
  }

  deleteMain(main): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: ConfirmModalComponent,
      nzComponentParams: {
        title: 'delete',
        message: 'deleteMainSection',
        type: 'Delete',
        objectName: main.entryName
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.main.splice(this.main.indexOf(main), 1);
        this.saveInfo();
      }
    });
  }

  addMainSection(): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: MainSectionModalComponent,
      nzClassName: 'lg',
      nzComponentParams: {
        userDetail: this.userDetail
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.main = result;
        this.main = [...this.main];
      }
    });
  }

  editMainSection(): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: MainSectionModalComponent,
      nzClassName: 'lg',
      nzComponentParams: {
        userDetail: this.userDetail,
        isUpdate: true
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.main = result;
        this.main = [...this.main];
      }
    });
  }

  addLdapRealm(): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: LdapSectionModalComponent,
      nzClassName: 'lg',
      nzComponentParams: {
        userDetail: this.userDetail,
        isldap: true
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.main = result;
        this.main = [...this.main];
      }
    });
  }

  enableJOCCluster(): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: LdapSectionModalComponent,
      nzClassName: 'lg',
      nzComponentParams: {
        userDetail: this.userDetail
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.main = result;
        this.main = [...this.main];
      }
    });
  }
}
