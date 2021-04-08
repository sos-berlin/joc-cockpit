import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router, RouterEvent} from '@angular/router';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ToasterService} from 'angular2-toaster';
import {TranslateService} from '@ngx-translate/core';
import * as _ from 'underscore';
import {filter} from 'rxjs/operators';
import {Subscription} from 'rxjs';
import {DataService} from '../data.service';
import {CoreService} from '../../../services/core.service';
import {ConfirmModalComponent} from '../../../components/comfirm-modal/confirm.component';
import {AuthService} from '../../../components/guard';

// Role Actions
@Component({
  selector: 'app-role-modal-content',
  templateUrl: './role-dialog.html'
})
export class RoleModalComponent implements OnInit {
  submitted = false;
  isUnique = true;
  currentRole: any = {};
  oldName: string;

  @Input() userDetail: any;
  @Input() oldRole: any;
  @Input() allRoles: any;
  @Input() newRole: boolean;
  @Input() copy: boolean;

  constructor(public activeModal: NgbActiveModal, private coreService: CoreService) {
  }

  ngOnInit(): void {
    if (this.oldRole) {
      this.currentRole = _.clone(this.oldRole.mainObj);
      this.oldName = this.oldRole.name;
      if (!this.copy) {
        this.currentRole.role = this.oldRole.name;
      }
    } else {
      this.currentRole = {
        permissions: {
          joc: [
            {
              path: 'sos:products:joc',
              excluded: false
            }
          ],
          controllerDefaults: [],
          controllers: {}
        }
      };
    }
  }

  checkRole(newRole): void {
    this.isUnique = true;
    for (let i = 0; i < this.allRoles.length; i++) {
      if (this.allRoles[i] === newRole && ((this.oldRole && newRole !== this.oldRole.name) || !this.oldRole)) {
        this.isUnique = false;
        break;
      }
    }
  }

  onSubmit(obj): void {
    this.submitted = true;
    if (this.newRole || this.copy) {
      this.allRoles.push(obj.role);
      this.userDetail.roles[obj.role] = {
        permissions: obj.permissions
      };
    } else {
      delete this.userDetail.roles[this.oldName];
      this.userDetail.roles[obj.role] = {
        permissions: obj.permissions
      };
      for (let i = 0; i < this.userDetail.users.length; i++) {
        for (let j = 0; j < this.userDetail.users[i].roles.length; j++) {
          if (this.userDetail.users[i].roles[j] === this.oldName) {
            this.userDetail.users[i].roles.splice(j, 1);
            this.userDetail.users[i].roles.push(obj.role);
          }
        }
      }
      for (let i = 0; i < this.allRoles.length; i++) {
        if (this.allRoles[i] === this.oldName || _.isEqual(this.allRoles[i], this.oldName)) {
          this.allRoles.splice(i, 1);
          this.allRoles.push(obj.role);
          break;
        }
      }
    }

    this.coreService.post('authentication/shiro/store', {
      users: this.userDetail.users,
      roles: this.userDetail.roles,
      main: this.userDetail.main
    }).subscribe(() => {
      this.submitted = false;
      this.activeModal.close(this.userDetail);
    }, () => {
      this.submitted = false;
    });
  }
}

// Controller Actions
@Component({
  selector: 'app-controller-modal-content',
  templateUrl: 'controller-dialog.html'
})
export class ControllerModalComponent implements OnInit {
  @Input() controllerRoles: any;
  @Input() allRoles: any;
  @Input() oldController: any;
  @Input() copy: boolean;
  @Input() userDetail: any;
  @Input() role: any;

  submitted = false;
  isUnique = true;
  currentController: any = {};
  schedulerIds: any = {};

  constructor(public activeModal: NgbActiveModal, private coreService: CoreService, private authService: AuthService) {
  }

  ngOnInit(): void {
    this.schedulerIds = this.authService.scheduleIds ? JSON.parse(this.authService.scheduleIds) : {};
    if (this.oldController) {
      this.currentController = _.clone(this.oldController);
      this.allRoles = this.allRoles.filter((role) => {
        return this.role.name !== role;
      });
    } else {
      this.currentController = {
        controller: '',
        role: ''
      };
    }
  }

  checkRole(role): void {
    if (this.currentController.controller) {
      this.checkController(this.currentController.controller, role);
    }
  }

  checkController(controller, role): void {
    this.isUnique = true;
    for (let i = 0; i < this.controllerRoles.length; i++) {
      if (this.controllerRoles[i].name === role && this.controllerRoles[i].controllers) {
        for (let j = 0; j < this.controllerRoles[i].controllers.length; j++) {
          if (this.controllerRoles[i].controllers[j].name === controller) {
            this.isUnique = false;
            break;
          }
        }
        break;
      }
    }
  }

  onSubmit(obj): void {
    this.submitted = true;
    if (!this.userDetail.roles[obj.role].permissions) {
      this.userDetail.roles[obj.role].permissions = {
        joc: [{
          path: 'sos:products:joc',
          excluded: false
        }],
        controllerDefaults: [],
        controllers: {}
      };
    }
    if (!this.copy) {
      this.userDetail.roles[obj.role].permissions.controllers[obj.controller] = [];
    } else {
      this.userDetail.roles[obj.role].permissions.controllers[obj.name] = obj.permissions;
    }
    this.coreService.post('authentication/shiro/store', {
      users: this.userDetail.users,
      roles: this.userDetail.roles,
      main: this.userDetail.main
    }).subscribe(() => {
      this.submitted = false;
      this.activeModal.close(this.userDetail);
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
  userDetail: any = {};
  showMsg: any;
  roles: any = [];
  controllerRoles = [];
  selectedControllers = [];
  subscription1: Subscription;
  subscription2: Subscription;
  subscription3: Subscription;

  constructor(private coreService: CoreService, private router: Router, private activeRoute: ActivatedRoute, private modalService: NgbModal,
              private translate: TranslateService, private toasterService: ToasterService, public dataService: DataService) {
    this.subscription1 = dataService.dataAnnounced$.subscribe(res => {
      if (res) {
        this.setUsersData(res);
      }
    });
    this.subscription2 = dataService.functionAnnounced$.subscribe(res => {
      if (res === 'ADD_ROLE') {
        this.addRole();
      } else if (res === 'ADD_CONTROLLER') {
        this.addController();
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
    this.createRoleArray(res);
    this.activeRoute.queryParams
      .subscribe(params => {
        if (params.user) {
          this.selectUser(params.user);
        }
      });
  }

  selectUser(user): void {
    this.selectedControllers = [];
    this.showMsg = false;
    if (user) {
      for (let i = 0; i < this.users.length; i++) {
        if (this.users[i].user === user && this.users[i].roles) {
          const selectedRoles = this.users[i].roles || [];
          this.controllerRoles = this.controllerRoles.filter((role) => {
            return selectedRoles.includes(role.name);
          });
          break;
        }
      }
      if (this.controllerRoles.length === 0) {
        this.showMsg = true;
      }
    }
  }

  saveInfo(): void {
    const obj = {
      users: this.users,
      roles: this.userDetail.roles,
      main: this.userDetail.main
    };
    this.coreService.post('authentication/shiro/store', obj).subscribe(res => {
      // console.log(res)
      this.createRoleArray(obj);
    });
  }

  addRole(): void {
    const modalRef = this.modalService.open(RoleModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.allRoles = this.roles;
    modalRef.componentInstance.userDetail = this.userDetail;
    modalRef.componentInstance.newRole = true;
    modalRef.result.then((result) => {
      this.createRoleArray(result);
    }, () => {

    });
  }

  editRole(role): void {
    const modalRef = this.modalService.open(RoleModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.oldRole = role;
    modalRef.componentInstance.allRoles = this.roles;
    modalRef.componentInstance.userDetail = this.userDetail;
    modalRef.result.then((result) => {
      this.createRoleArray(result);
    }, () => {

    });
  }

  copyRole(role): void {
    const modalRef = this.modalService.open(RoleModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.oldRole = role;
    modalRef.componentInstance.allRoles = this.roles;
    modalRef.componentInstance.userDetail = this.userDetail;
    modalRef.componentInstance.copy = true;
    modalRef.result.then((result) => {
      this.createRoleArray(result);
    }, () => {

    });
  }

  deleteRole(role, index): void {
    let isAssigned: boolean;
    let waringMessage = '';
    for (let i = 0; i < this.users.length; i++) {
      for (let j = 0; j < this.users[i].roles.length; j++) {
        if (this.users[i].roles[j] === role.name) {
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
      modalRef.componentInstance.objectName = role.name;
      modalRef.result.then(() => {
        delete this.userDetail.roles[role.name];
        this.saveInfo();
        this.dataService.preferences.showPanel.splice(index, 1);
      }, () => {

      });
    } else {
      this.translate.get('user.message.cannotDeleteRole').subscribe(translatedValue => {
        waringMessage = translatedValue;
      });
      this.toasterService.pop({
        type: 'warning',
        title: '',
        body: waringMessage,
        timeout: 3000
      });
    }

  }

  addController(): void {
    const modalRef = this.modalService.open(ControllerModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.controllerRoles = this.controllerRoles;
    modalRef.componentInstance.allRoles = this.roles;
    modalRef.componentInstance.userDetail = this.userDetail;
    modalRef.result.then((result) => {
      this.createRoleArray(result);
    }, () => {

    });
  }

  copyController(role, controller): void {
    const modalRef = this.modalService.open(ControllerModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.controllerRoles = this.controllerRoles;
    modalRef.componentInstance.oldController = controller;
    modalRef.componentInstance.role = role;
    modalRef.componentInstance.allRoles = this.roles;
    modalRef.componentInstance.copy = true;
    modalRef.componentInstance.userDetail = this.userDetail;
    modalRef.result.then((result) => {
      this.createRoleArray(result);
    }, () => {

    });
  }

  deleteController(role, controller): void {
    const modalRef = this.modalService.open(ConfirmModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.title = 'delete';
    modalRef.componentInstance.message = 'deleteController';
    modalRef.componentInstance.type = 'Delete';
    modalRef.componentInstance.objectName = controller.name || 'default';
    modalRef.result.then(() => {
      delete this.userDetail.roles[role.name].permissions.controllers[controller.name];
      this.saveInfo();
    }, () => {

    });
  }

  private createRoleArray(res): void {
    this.controllerRoles = [];
    this.roles = [];
    for (let role in res.roles) {
      let obj = {name: role, controllers: [{name: '', permissions: res.roles[role].permissions}], mainObj: res.roles[role]};
      if (res.roles[role].permissions) {
        for (let controller in res.roles[role].permissions.controllers) {
          obj.controllers.push({name: controller, permissions: res.roles[role].permissions.controllers[controller]});
        }
      }
      this.roles.push(role);
      this.controllerRoles.push(obj);
    }
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
