import {Component, OnInit, OnDestroy, Input} from '@angular/core';
import {CoreService} from '../../../services/core.service';
import {Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {NgbModal, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {DataService} from '../data.service';
import {ConfirmModalComponent} from '../../../components/comfirm-modal/confirm.component';
import * as _ from 'underscore';

// Add and Edit main Section
@Component({
  selector: 'app-ngbd-modal-content',
  templateUrl: 'main-dialog.html'
})
export class MainSectionModalComponent implements OnInit {
  submitted = false;
  mainSection: any = [];
  @Input() userDetail: any;
  @Input() isUpdate: boolean;

  constructor(public activeModal: NgbActiveModal, public coreService: CoreService) {
  }

  ngOnInit() {
    if (this.isUpdate) {
      this.userDetail.main.forEach((entry) => {
        let values = [];
        let comments = [];
        if (entry.entryValue && entry.entryValue.length > 0) {
          entry.entryValue.forEach(function (value) {
            values.push({value: value});
          });
        } else {
          values.push({value: ''});
        }
        if (entry.entryComment && entry.entryComment.length > 0) {
          entry.entryComment.forEach((comment) => {
            comments.push({value: comment});
          });
        } else {
          comments.push({value: ''});
        }
        this.mainSection.push({
          name: entry.entryName,
          values: values,
          comments: comments
        });
      });
    } else {
      this.mainSection.push({
        name: '',
        values: [{value: ''}],
        comments: [{value: ''}]
      });

    }
  }

  onSubmit(): void {
    this.submitted = true;
    this.userDetail.main = this.userDetail.main.concat(this.mainSection);
    this.coreService.post('authentication/shiro/store', this.userDetail).subscribe(() => {
      this.submitted = false;
      this.activeModal.close(this.userDetail.main);
    }, () => {
      this.submitted = false;
    });
  }

  addMainEntry() {
    let param = {
      name: '',
      values: [{value: ''}],
      comments: [{value: ''}]
    };
    if (this.mainSection) {
      this.mainSection.push(param);
    }
  }

  addEntryValueField(index) {
    if (this.mainSection[index].values) {
      this.mainSection[index].values.push({value: ''});
    }
  }

  removeEntry(index) {
    this.mainSection.splice(index, 1);
  }

  removeEntryValueField(parentIindex, index) {
    this.mainSection[parentIindex].values.splice(index, 1);
  }

  addEntryCommentField(index) {
    if (this.mainSection[index].comments) {
      this.mainSection[index].comments.push({value: ''});
    }
  }

  removeEntryCommentField(parentIindex, index) {

    if (this.mainSection[parentIindex].comments.length === 1) {
      this.mainSection[parentIindex].comments[0].value = '';
    } else {
      this.mainSection[parentIindex].comments.splice(index, 1);
    }
  }

}

// Edit Single Section
@Component({
  selector: 'app-ngbd-modal-content',
  templateUrl: 'edit-main-dialog.html'
})
export class EditMainSectionModalComponent implements OnInit {
  submitted = false;
  isUnique = true;
  entryValue: any = [];
  entryComment: any = [];
  entry: any;
  existingEntry: string;
  @Input() oldEntry: any;
  @Input() userDetail: any;

  constructor(public activeModal: NgbActiveModal, private coreService: CoreService) {
  }

  ngOnInit() {
    this.entry = _.clone(this.oldEntry);
    this.existingEntry = this.oldEntry.entryName;
    if (this.entry.entryValue.length > 0) {
      this.entry.entryValue.forEach((val) => {
        this.entryValue.push({value: _.clone(val)});
      });
    } else {
      this.entryValue.push({value: ''});
    }
    if (this.entry.entryComment.length > 0) {
      this.entry.entryComment.forEach((val) => {
        this.entryComment.push({value: _.clone(val)});
      });
    } else {
      this.entryComment.push({value: ''});
    }
  }

  checkMainSection(newEntry) {
    this.isUnique = true;
    for (let i = 0; i < this.userDetail.main.length; i++) {
      if (this.userDetail.main[i].entryName === newEntry && newEntry !== this.existingEntry) {
        this.isUnique = false;
        break;
      }
    }
  }

  onSubmit(obj): void {
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
      if (_.isEqual(this.oldEntry, val)) {
        this.userDetail.main[index] = this.entry;
      }
    });

    this.coreService.post('authentication/shiro/store', this.userDetail).subscribe(res => {
      this.submitted = false;
      this.activeModal.close(this.userDetail.main);
    }, err => {
      this.submitted = false;
    });
  }

  addValueField() {
    let param = {
      value: ''
    };
    if (this.entryValue)
      {this.entryValue.push(param);}
  }

  removeValueField(index) {
    this.entryValue.splice(index, 1);
  }

  addCommentField() {
    let param = {
      value: ''
    };
    if (this.entryComment) {
      this.entryComment.push(param);
    }
  }

  removeCommentField(index) {
    this.entryComment.splice(index, 1);
  }
}

// Ldap
@Component({
  selector: 'app-ngbd-modal-content',
  templateUrl: 'ldap-section-dialog.html'
})
export class LdapSectionModalComponent implements OnInit {
  submitted = false;
  mainSection: any = [];
  @Input() userDetail: any;
  @Input() isldap: boolean;

  constructor(public activeModal: NgbActiveModal, private coreService: CoreService) {
  }

  ngOnInit() {
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
    this.mainSection = _.clone(mainSection);
  }

  onSubmit(obj): void {
    this.submitted = true;
    if (this.isldap) {
      for (let i = 0; i < this.mainSection.length; i++) {
        if (this.mainSection[i].entryName === 'ldapRealm.contextFactory.url') {
          if (!_.isArray(this.mainSection[i].entryValue)) {
            let value = _.clone(this.mainSection[i].entryValue);
            this.mainSection[i].entryValue = [value];
          }
          break;
        }
      }
    }
    this.userDetail.main = this.userDetail.main.concat(this.mainSection);
    this.coreService.post('authentication/shiro/store', this.userDetail).subscribe(res => {
      this.submitted = false;
      this.activeModal.close(this.userDetail.main);
    }, () => {
      this.submitted = false;
    });
  }
}

@Component({
  selector: 'app-main-section',
  templateUrl: './main-section.component.html'
})
export class MainSectionComponent implements OnInit, OnDestroy {

  loading =  true;
  main: any = [];
  usr: any = {currentPage: 1};
  preferences: any = {};
  userDetail: any = {};
  subscription1: Subscription;
  subscription2: Subscription;

  constructor(public coreService: CoreService, private router: Router, public modalService: NgbModal, private dataService: DataService) {
    this.subscription1 = this.dataService.dataAnnounced$.subscribe(res => {
      if (res) {
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

  ngOnInit() {
    this.preferences = JSON.parse(sessionStorage.preferences);
  }

  ngOnDestroy() {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
  }

  setUserData(res) {
    this.userDetail = res;
    this.main = res.main;
    setTimeout(() => {
      this.loading = false;
    }, 400)
  }

  saveInfo() {
    let obj = {
      users: this.userDetail.users,
      masters: this.userDetail.masters,
      main: this.main
    };

    this.coreService.post('authentication/shiro/store', obj).subscribe(res => {
      this.main = [...this.main];
    }, () => {

    });
  }

  editMain(main) {
    const modalRef = this.modalService.open(EditMainSectionModalComponent, {backdrop: 'static', size: 'lg'});
    modalRef.componentInstance.oldEntry = main;
    modalRef.componentInstance.userDetail = this.userDetail;
    modalRef.result.then((result) => {
      this.main = result;
      this.main = [...this.main];
    }, (reason) => {
      console.log('close...', reason);
    });
  }

  deleteMain(main) {
    const modalRef = this.modalService.open(ConfirmModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.title = 'delete';
    modalRef.componentInstance.message = 'deleteMainSection';
    modalRef.componentInstance.type = 'Delete';
    modalRef.componentInstance.objectName = main.entryName;
    modalRef.result.then((result) => {
      this.main.splice(this.main.indexOf(main), 1);
      this.saveInfo();
    }, (reason) => {
      console.log('close...', reason);
    });
  }

  addMainSection(): void {
    const modalRef = this.modalService.open(MainSectionModalComponent, {backdrop: 'static', size: 'lg'});
    modalRef.componentInstance.userDetail = this.userDetail;
    modalRef.result.then((result) => {
      this.main = result;
    }, (reason) => {
      console.log('close...', reason);
    });
  }

  editMainSection(): void {
    const modalRef = this.modalService.open(MainSectionModalComponent, {backdrop: 'static', size: 'lg'});
    modalRef.componentInstance.userDetail = this.userDetail;
    modalRef.componentInstance.isUpdate = true;
    modalRef.result.then((result) => {
      this.main = result;
      this.main = [...this.main];
    }, (reason) => {
      console.log('close...', reason);
    });
  }

  addLdapRealm(): void {
    const modalRef = this.modalService.open(LdapSectionModalComponent, {backdrop: 'static', size: 'lg'});
    modalRef.componentInstance.userDetail = this.userDetail;
    modalRef.componentInstance.isldap = true;
    modalRef.result.then((result) => {
      this.main = result;
      this.main = [...this.main];
    }, (reason) => {
      console.log('close...', reason);
    });
  }

  enableJOCCluster(): void {
    const modalRef = this.modalService.open(LdapSectionModalComponent, {backdrop: 'static', size: 'lg'});
    modalRef.componentInstance.userDetail = this.userDetail;
    modalRef.result.then((result) => {
      this.main = result;
      this.main = [...this.main];
    }, (reason) => {
      console.log('close...', reason);
    });
  }
}
