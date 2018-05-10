import { Component, OnInit,OnDestroy, Input } from '@angular/core';
import { CoreService } from '../../../services/core.service';
import { Subscription }   from 'rxjs/Subscription';
import { Router } from '@angular/router';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DataService } from '../data.service';
import { DeleteModal } from '../../../components/delete-modal/delete.component';
import * as _ from 'underscore';

//Add and Edit main Section
@Component({
  selector: 'ngbd-modal-content',
  templateUrl: 'main-dialog.html'
})
export class MainSectionModal implements OnInit {
  submitted: boolean = false;
  mainSection: any = [];
  @Input() userDetail: any;
  @Input() isUpdate: boolean;

  constructor(public activeModal: NgbActiveModal, public coreService: CoreService) {
  }

  ngOnInit() {
    if (this.isUpdate) {
      let self = this;
      this.userDetail.main.forEach(function (entry) {
        let values = [];
        let comments = [];

        if (entry.entryValue && entry.entryValue.length > 0) {
          entry.entryValue.forEach(function (value) {
            values.push({value: value});
          });
        }
        else {
          values.push({value: ''});
        }
        if (entry.entryComment && entry.entryComment.length > 0) {
          entry.entryComment.forEach(function (comment) {
            comments.push({value: comment});
          });
        }
        else {
          comments.push({value: ''});
        }
        self.mainSection.push({
          name: entry.entryName,
          values: values,
          comments: comments
        });
        console.log(self.mainSection)
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
    this.coreService.post('security_configuration/write', this.userDetail).subscribe(() => {
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
    if (this.mainSection)
      this.mainSection.push(param);
  }

  addEntryValueField(index) {
    if (this.mainSection[index].values)
      this.mainSection[index].values.push({value: ''});
  }

  removeEntry(index) {
    this.mainSection.splice(index, 1);
  }

  removeEntryValueField(parentIindex, index) {
    this.mainSection[parentIindex].values.splice(index, 1);
  }

  addEntryCommentField(index) {
    if (this.mainSection[index].comments)
      this.mainSection[index].comments.push({value: ''});
  }

  removeEntryCommentField(parentIindex, index) {

    if (this.mainSection[parentIindex].comments.length == 1) {
      this.mainSection[parentIindex].comments[0].value = '';
    } else
      this.mainSection[parentIindex].comments.splice(index, 1);
  }

}

// Edit Single Section
@Component({
  selector: 'ngbd-modal-content',
  templateUrl: 'edit-main-dialog.html'
})
export class EditMainSectionModal implements OnInit {
  submitted: boolean = false;
  isUnique: boolean = true;
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
    let self = this;
    if (self.entry.entryValue.length > 0) {
      self.entry.entryValue.forEach(function (val) {
        self.entryValue.push({value: _.clone(val)});
      });
    } else {
      self.entryValue.push({value: ''});
    }
    if (self.entry.entryComment.length > 0) {
      self.entry.entryComment.forEach(function (val) {
        self.entryComment.push({value: _.clone(val)});
      });
    } else {
      self.entryComment.push({value: ''});
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
    let self = this;
    this.entry.entryValue = [];
    this.entry.entryComment = [];
    if (this.entryValue.length > 0) {
      this.entryValue.forEach(function (val) {
        self.entry.entryValue.push(val.value);
      });
    }
    if (this.entryComment.length > 0) {
      this.entryComment.forEach(function (val) {
        self.entry.entryComment.push(val.value);
      });
    }

    this.userDetail.main.forEach(function (val, index) {
      if (_.isEqual(self.oldEntry, val)) {
        self.userDetail.main[index] = self.entry;
      }
    });


    this.coreService.post('security_configuration/write', this.userDetail).subscribe(res => {
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
      this.entryValue.push(param);
  }

  removeValueField(index) {
    this.entryValue.splice(index, 1);
  }

  addCommentField() {
    let param = {
      value: ''
    };
    if (this.entryComment)
      this.entryComment.push(param);
  }

  removeCommentField(index) {
    this.entryComment.splice(index, 1);
  }
}

//Ldap
@Component({
  selector: 'ngbd-modal-content',
  templateUrl: 'ldap-section-dialog.html'
})
export class LdapSectionModal implements OnInit {
  submitted: boolean = false;
  mainSection: any = [];
  @Input() userDetail: any;
  @Input() isldap: boolean;

  constructor(public activeModal: NgbActiveModal, private coreService: CoreService) {
  }

  ngOnInit() {
    if (this.isldap) {
      let mainSection = [
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

      this.mainSection = _.clone(mainSection);
    } else {
      let mainSection = [
        {
          entryName: 'sessionDAO',
          entryValue: ['com.sos.auth.shiro.SOSDistributedSessionDAO'],
          entryComment: []
        }, {
          entryName: 'securityManager.sessionManager.sessionDAO',
          entryValue: ['$sessionDAO'],
          entryComment: []
        }];

      this.mainSection = _.clone(mainSection);

    }
  }

  onSubmit(obj): void {
    this.submitted = true;
    if (this.isldap) {
      for (let i = 0; i < this.mainSection.length; i++) {
        if (this.mainSection[i].entryName == 'ldapRealm.contextFactory.url') {
          if (!_.isArray(this.mainSection[i].entryValue)) {
            let value = _.clone(this.mainSection[i].entryValue);
            this.mainSection[i].entryValue = [value];
          }
          break;
        }
      }
    }
    this.userDetail.main = this.userDetail.main.concat(this.mainSection);
    this.coreService.post('security_configuration/write', this.userDetail).subscribe(res => {
      this.submitted = false;
      this.activeModal.close(this.userDetail.main);
    }, err => {
      this.submitted = false;
    });
  }
}

@Component({
  selector: 'app-main-section',
  templateUrl: './main-section.component.html'
})
export class MainSectionComponent implements OnInit,OnDestroy {

  main: any = [];
  usr: any = {currentPage: 1};
  preferences: any = {};
  userDetail: any = {};
  subscription1: Subscription;
  subscription2: Subscription;

  constructor(public coreService: CoreService, private router: Router, public modalService: NgbModal, private dataService: DataService) {
    this.subscription1 = this.dataService.dataAnnounced$.subscribe(res => {
      if (res)
        this.setUserData(res);
    });

    this.subscription2 = this.dataService.functionAnnounced$.subscribe(res => {
      if (res === 'ADD_ALAD')
        this.addLdapRealm();
      else if (res === 'ADD_MAIN_SECTION') {
        this.addMainSection();
      }
      else if (res === 'EDIT_MAIN_SECTION') {
        this.editMainSection();
      }
      else if (res === 'ENABLE_JOC') {
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
  }

  saveInfo() {
    let obj = {
      users: this.userDetail.users,
      masters: this.userDetail.masters,
      main: this.main
    };

    this.coreService.post('security_configuration/write', obj).subscribe(res => {
      console.log(res)
    }, () => {

    });
  }

  editMain(main) {
    const modalRef = this.modalService.open(EditMainSectionModal, {backdrop: "static", size: "lg"});
    modalRef.componentInstance.oldEntry = main;
    modalRef.componentInstance.userDetail = this.userDetail;
    modalRef.result.then((result) => {
      this.main = result;
    }, (reason) => {
      console.log('close...', reason)
    });
  }

  deleteMain(main) {
    const modalRef = this.modalService.open(DeleteModal, {backdrop: "static"});
    modalRef.componentInstance.entry = main.entryName;
    modalRef.result.then((result) => {
      this.main.splice(this.main.indexOf(main), 1);
      this.saveInfo();
    }, (reason) => {
      console.log('close...', reason)
    });
  }

  addMainSection(): void {
    const modalRef = this.modalService.open(MainSectionModal, {backdrop: "static", size: "lg"});
    modalRef.componentInstance.userDetail = this.userDetail;
    modalRef.result.then((result) => {
      this.main = result;
    }, (reason) => {
      console.log('close...', reason)
    });
  }

  editMainSection(): void {
    const modalRef = this.modalService.open(MainSectionModal, {backdrop: "static", size: "lg"});
    modalRef.componentInstance.userDetail = this.userDetail;
    modalRef.componentInstance.isUpdate = true;
    modalRef.result.then((result) => {
      this.main = result;
    }, (reason) => {
      console.log('close...', reason)
    });
  }

  addLdapRealm(): void {
    const modalRef = this.modalService.open(LdapSectionModal, {backdrop: "static", size: "lg"});
    modalRef.componentInstance.userDetail = this.userDetail;
    modalRef.componentInstance.isldap = true;
    modalRef.result.then((result) => {
      this.main = result;
    }, (reason) => {
      console.log('close...', reason)
    });
  }

  enableJOCCluster(): void {
    const modalRef = this.modalService.open(LdapSectionModal, {backdrop: "static", size: "lg"});
    modalRef.componentInstance.userDetail = this.userDetail;
    modalRef.result.then((result) => {
      this.main = result;
    }, (reason) => {
      console.log('close...', reason)
    });
  }
}
