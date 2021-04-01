import {Component, OnInit, Input, OnDestroy} from '@angular/core';
import {Subscription} from 'rxjs';
import {Router, ActivatedRoute, RouterEvent, NavigationEnd} from '@angular/router';
import {NgbModal, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {ToasterService} from 'angular2-toaster';
import {TranslateService} from '@ngx-translate/core';
import {DataService} from '../data.service';
import {CoreService} from '../../../services/core.service';
import {ConfirmModalComponent} from '../../../components/comfirm-modal/confirm.component';
import * as _ from 'underscore';
import {filter} from 'rxjs/operators';

// Role Actions
@Component({
  selector: 'app-role-modal-content',
  templateUrl: './role-dialog.html'
})
export class RoleModalComponent implements OnInit {
  submitted = false;
  isUnique = true;
  currentRole: any = {};
  mstr: any = {};

  @Input() userDetail: any;
  @Input() oldRole: any;
  @Input() allRoles: any;
  @Input() newRole: boolean;
  @Input() copy: boolean;
  @Input() master: any;
  @Input() masters: any;

  constructor(public activeModal: NgbActiveModal, private coreService: CoreService) {
  }

  ngOnInit(): void {
    if (this.oldRole) {
      this.currentRole = _.clone(this.oldRole);
      this.currentRole.roleName = this.currentRole.role;
      if (this.copy) {
        this.currentRole.role = '';
      }
      this.mstr = {
        name: this.master === '' ? 'default' : this.master
      };
    } else {
      this.currentRole = {
        permissions: [],
        folders: []
      };
      this.mstr = {
        name: ''
      };
    }
  }

  checkRole(newRole) {
    this.isUnique = true;
    for (let i = 0; i < this.allRoles.length; i++) {
      if (this.allRoles[i] === newRole && newRole !== this.oldRole.role) {
        this.isUnique = false;
        break;
      }
    }
  }

  onSubmit(obj): void {
    this.submitted = true;

    if (this.newRole) {
      this.allRoles.push(obj.role);
      for (let i = 0; i < this.userDetail.masters.length; i++) {
        if (_.isEqual(this.userDetail.masters[i].master, this.mstr.name) || (this.userDetail.masters[i].master === '' && !this.mstr.name)) {
          this.userDetail.masters[i].roles.push(obj);
          break;
        }
      }
    } else if (this.copy) {
      for (let i = 0; i < this.userDetail.masters.length; i++) {
        if (_.isEqual(this.userDetail.masters[i], this.master)) {
          this.userDetail.masters[i].roles.push(obj);
        }
      }

    } else {
      for (let i = 0; i < this.userDetail.masters.length; i++) {
        for (let j = 0; j < this.userDetail.masters[i].roles.length; j++) {
          if (this.userDetail.masters[i].roles[j].role === obj.roleName) {
            this.userDetail.masters[i].roles[j].role = _.clone(obj.role);
            break;
          }
        }
      }
      for (let i = 0; i < this.userDetail.users.length; i++) {
        for (let j = 0; j < this.userDetail.users[i].roles.length; j++) {
          if (this.userDetail.users[i].roles[j] === obj.roleName) {
            this.userDetail.users[i].roles.splice(j, 1);
            this.userDetail.users[i].roles.push(obj.role);
          }
        }
      }
      for (let i = 0; i < this.allRoles.length; i++) {
        if (this.allRoles[i] === obj.roleName || _.isEqual(this.allRoles[i], obj.roleName)) {
          this.allRoles.splice(i, 1);
          this.allRoles.push(obj.role);
          break;
        }
      }
    }

    this.coreService.post('authentication/shiro/store', this.userDetail).subscribe(() => {
      this.submitted = false;
      this.activeModal.close(this.userDetail.masters);
    }, () => {
      this.submitted = false;
    });
  }
}

// Master Actions
@Component({
  selector: 'app-master-modal-content',
  templateUrl: 'master-dialog.html'
})
export class MasterModalComponent implements OnInit {

  submitted = false;
  isUnique = true;
  currentMaster: any = {};

  @Input() allMasters: any;
  @Input() allRoles: any;
  @Input() oldMaster: any;
  @Input() copy: boolean;
  @Input() userDetail: any;

  constructor(public activeModal: NgbActiveModal, private coreService: CoreService) {
  }

  ngOnInit(): void {
    if (this.oldMaster) {
      this.currentMaster = _.clone(this.oldMaster);
      this.currentMaster.masterName = this.oldMaster.master;
      this.currentMaster.master = '';
    } else {
      this.currentMaster = {
        master: '',
        ipAddress: '',
        roles: []
      };
    }
  }

  checkMaster(newMaster): void {
    this.isUnique = true;
    for (let i = 0; i < this.allMasters.length; i++) {
      if (this.allMasters[i].master === newMaster) {
        this.isUnique = false;
        break;
      }
    }
  }

  onSubmit(obj): void {
    this.submitted = true;
    if (!this.copy) {
      obj.roles.forEach(function (value, i) {
        obj.roles[i] = {
          permissions: [],
          folders: [],
          role: value
        };
      });
      if (obj.ipAddress) {
        let name = 'ip=' + obj.ipAddress;
        if (obj.master) {
          name = name + ':' + obj.master;
        }
        obj.master = name;
      }
      delete obj['ipAddress'];
      this.userDetail.masters.push(obj);
    } else {
      const data = {
        roles: _.clone(this.oldMaster.roles),
        master: obj.master
      };

      this.userDetail.masters.push(data);
    }
    this.coreService.post('authentication/shiro/store', this.userDetail).subscribe(() => {
      this.submitted = false;
      this.activeModal.close(this.userDetail.masters);
    }, () => {
      this.submitted = false;
    });
  }

}

@Component({
  selector: 'app-roles',
  templateUrl: 'roles.component.html'
})
export class RolesComponent implements OnDestroy {

  users: any = [];
  masters: any = [];
  userDetail: any = {};
  showMsg: any;
  roles: any = [];
  selectedMasters = [];
  selectedRoles = [];
  showPanel = [true];
  subscription1: Subscription;
  subscription2: Subscription;
  subscription3: Subscription;

  constructor(private coreService: CoreService, private router: Router, private activeRoute: ActivatedRoute, private modalService: NgbModal,
              private translate: TranslateService, private toasterService: ToasterService, private dataService: DataService) {
    this.subscription1 = dataService.dataAnnounced$.subscribe(res => {
      if (res) {
        this.setUsersData(res);
      }
    });
    this.subscription2 = dataService.functionAnnounced$.subscribe(res => {
      if (res === 'ADD_ROLE') {
        this.addRole();
      } else if (res === 'ADD_MASTER') {
        this.addMaster();
      }
    });
    this.subscription3 = router.events
      .pipe(filter((event: RouterEvent) => event instanceof NavigationEnd)).subscribe((e: any) => {
        this.checkUrl(e);
      });
  }


  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
    this.subscription3.unsubscribe();
  }

  setUsersData(res): void {
    this.userDetail = res;
    this.users = res.users;
    this.masters = res.masters;
    this.getRoles();
  }

  getRoles(): void {
    if (this.roles.length === 0) {
      this.coreService.post('authentication/permissions', {}).subscribe((res: any) => {
        this.roles = res.SOSPermissionRoles.SOSPermissionRole;
      });
    }
  }

  selectUser(user): void {
    this.selectedMasters = [];
    this.selectedRoles = [];
    this.showMsg = false;
    if (user) {
      for (let i = 0; i < this.users.length; i++) {
        if (this.users[i].user === user && this.users[i].roles) {
          this.selectedRoles = this.users[i].roles || [];
          this.masters.forEach((master) => {
            let flag = true;
            for (let j = 0; j < this.users[i].roles.length; j++) {
              for (let x = 0; x < master.roles.length; x++) {
                if (master.roles[x].role === this.users[i].roles[j]) {
                  this.selectedMasters.push(master.master);
                  flag = false;
                  break;
                }
              }
              if (!flag) {
                break;
              }
            }
          });
          break;
        }
      }
      if (this.selectedMasters.length === 0) {
        this.showMsg = true;
      }
    }
  }

  getSelectedRole(role): boolean {
    if (this.selectedRoles && this.selectedRoles.length > 0) {
      return this.selectedRoles.indexOf(role.role) > -1;
    } else {
      return true;
    }
  }

  getSelectedMaster(master): boolean {
    if (this.selectedMasters && this.selectedMasters.length > 0) {
      return this.selectedMasters.indexOf(master.master) > -1;
    } else {
      return true;
    }
  }

  saveInfo(): void {
    const obj = {
      users: this.users,
      masters: this.masters,
      main: this.userDetail.main
    };
    this.coreService.post('authentication/shiro/store', obj).subscribe(res => {

    });
  }

  addRole(): void {
    const modalRef = this.modalService.open(RoleModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.allRoles = this.roles;
    modalRef.componentInstance.masters = this.masters;
    modalRef.componentInstance.userDetail = this.userDetail;
    modalRef.componentInstance.newRole = true;
    modalRef.result.then((result) => {
      console.log(result);
    }, () => {

    });
  }

  editRole(role, master): void {
    const modalRef = this.modalService.open(RoleModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.oldRole = role;
    modalRef.componentInstance.master = master;
    modalRef.componentInstance.allRoles = this.roles;
    modalRef.componentInstance.masters = this.masters;
    modalRef.componentInstance.userDetail = this.userDetail;
    modalRef.result.then((result) => {
      console.log(result);
    }, () => {

    });
  }

  copyRole(role, master): void {
    const modalRef = this.modalService.open(RoleModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.oldRole = role;
    modalRef.componentInstance.master = master;
    modalRef.componentInstance.allRoles = this.roles;
    modalRef.componentInstance.masters = this.masters;
    modalRef.componentInstance.userDetail = this.userDetail;
    modalRef.componentInstance.copy = true;
    modalRef.result.then((result) => {
      console.log(result);
    }, () => {

    });
  }

  deleteRole(role, master): void {
    let isAssigned: boolean;
    let waringMessage = '';
    for (let i = 0; i < this.users.length; i++) {
      for (let j = 0; j < this.users[i].roles.length; j++) {
        if (this.users[i].roles[j] === role.role) {
          isAssigned = true;
          break;
        }
      }
    }
    if (!isAssigned) {
      const modalRef = this.modalService.open(ConfirmModalComponent, {backdrop: 'static'});
      modalRef.componentInstance.title = 'delete';
      modalRef.componentInstance.message = 'deleteRole';
      modalRef.componentInstance.type = 'Delete';
      modalRef.componentInstance.objectName = role.role;
      modalRef.result.then(() => {
        for (let i = 0; i < this.masters.length; i++) {
          if (_.isEqual(this.masters[i].master, master)) {
            for (let j = 0; j < this.masters[i].roles.length; j++) {
              if (_.isEqual(this.masters[i].roles[j], role)) {
                this.masters[i].roles.splice(this.masters[i].roles.indexOf(role), 1);
                break;
              }
            }
            break;
          }
        }

        this.saveInfo();
      }, () => {

      });
    } else {
      this.translate.get('message.cannotDeleteRole').subscribe(translatedValue => {
        waringMessage = translatedValue;
      });
      this.toasterService.pop({
        type: 'warning',
        title: '',
        body: waringMessage,
        showCloseButton: false,
        timeout: 2000
      });
    }

  }

  addMaster(): void {
    const modalRef = this.modalService.open(MasterModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.allMasters = this.masters;
    modalRef.componentInstance.allRoles = this.roles;
    modalRef.componentInstance.userDetail = this.userDetail;
    modalRef.result.then(() => {

    }, () => {

    });
  }

  copyMaster(master): void {
    const modalRef = this.modalService.open(MasterModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.oldMaster = master;
    modalRef.componentInstance.allMasters = this.masters;
    modalRef.componentInstance.copy = true;
    modalRef.componentInstance.userDetail = this.userDetail;
    modalRef.result.then(() => {

    }, () => {

    });
  }

  deleteMaster(master): void {
    const modalRef = this.modalService.open(ConfirmModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.title = 'delete';
    modalRef.componentInstance.message = 'deleteMaster';
    modalRef.componentInstance.type = 'Delete';
    modalRef.componentInstance.objectName = master.master || 'default';
    modalRef.result.then(() => {

      for (let i = 0; i < this.masters.length; i++) {
        if (_.isEqual(this.masters[i], master)) {
          this.masters.splice(this.masters.indexOf(master), 1);
        }
      }
      this.saveInfo();

    }, () => {

    });
  }

  private checkUrl(val): void {
    if (val.url) {
      this.activeRoute.queryParams
        .subscribe(params => {
          this.selectUser(params.user);
        });
    }
  }
}
