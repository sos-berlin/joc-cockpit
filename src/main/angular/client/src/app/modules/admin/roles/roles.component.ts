import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router, RouterEvent} from '@angular/router';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {ToasterService} from 'angular2-toaster';
import {TranslateService} from '@ngx-translate/core';
import {isEqual, clone} from 'underscore';
import {filter} from 'rxjs/operators';
import {Subscription} from 'rxjs';
import {DataService} from '../data.service';
import {CoreService} from '../../../services/core.service';
import {ConfirmModalComponent} from '../../../components/comfirm-modal/confirm.component';
import {AuthService} from '../../../components/guard';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';

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

  constructor(public activeModal: NzModalRef, private coreService: CoreService) {
  }

  ngOnInit(): void {
    if (this.oldRole) {
      this.currentRole = clone(this.oldRole.mainObj);
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
        if (this.allRoles[i] === this.oldName || isEqual(this.allRoles[i], this.oldName)) {
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
  name = '';

  constructor(public activeModal: NzModalRef, private coreService: CoreService, private authService: AuthService) {
  }

  ngOnInit(): void {
    this.schedulerIds = this.authService.scheduleIds ? JSON.parse(this.authService.scheduleIds) : {};
    if (this.oldController) {
      this.currentController = clone(this.oldController);
      this.allRoles = this.allRoles.filter((role) => {
        return this.role.name !== role;
      });
    } else {
      this.currentController = {
        controller: '',
        role: ''
      };
    }
    if (this.copy) {
      this.name = this.currentController.name || 'default';
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
    if (obj.role) {
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
        if (obj.name) {
          this.userDetail.roles[obj.role].permissions.controllers[obj.name] = obj.permissions;
        } else {
          this.userDetail.roles[obj.role].permissions.controllerDefaults = this.oldController.permissions.controllerDefaults;
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
}

@Component({
  selector: 'app-roles',
  templateUrl: 'roles.component.html',
  styleUrls: ['./roles.component.css']
})
export class RolesComponent implements OnDestroy {
  users: any = [];
  userDetail: any = {};
  showMsg: any;
  roles: any = [];
  controllerRoles = [];
  subscription1: Subscription;
  subscription2: Subscription;
  subscription3: Subscription;

  constructor(private coreService: CoreService, private router: Router, private activeRoute: ActivatedRoute, private modal: NzModalService,
              private translate: TranslateService, private toasterService: ToasterService, public dataService: DataService) {
    this.subscription1 = dataService.dataAnnounced$.subscribe(res => {
      if (res && res.users) {
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
    if (this.dataService.preferences.roles.size === 0 && this.controllerRoles.length > 0) {
      this.dataService.preferences.roles.add(this.controllerRoles[0].name);
    }
  }

  selectUser(user): void {
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

  expandRole(role: string): void {
    this.dataService.preferences.roles.add(role);
  }

  collapseRole(role: string): void {
    this.dataService.preferences.roles.delete(role);
  }

  saveInfo(): void {
    const obj = {
      users: this.users,
      roles: this.userDetail.roles,
      main: this.userDetail.main
    };
    this.coreService.post('authentication/shiro/store', obj).subscribe(res => {
      this.dataService.announceFunction('RELOAD');
      this.createRoleArray(obj);
    });
  }

  addRole(): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: RoleModalComponent,
      nzAutofocus: null,
      nzComponentParams: {
        allRoles: this.roles,
        userDetail: this.userDetail,
        newRole: true
      },
      nzFooter: null,
      nzClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.createRoleArray(result);
      }
    });
  }

  editRole(role): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: RoleModalComponent,
      nzAutofocus: null,
      nzComponentParams: {
        allRoles: this.roles,
        userDetail: this.userDetail,
        oldRole: role
      },
      nzFooter: null,
      nzClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.createRoleArray(result);
      }
    });
  }

  copyRole(role): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: RoleModalComponent,
      nzAutofocus: null,
      nzComponentParams: {
        allRoles: this.roles,
        userDetail: this.userDetail,
        oldRole: role,
        copy: true
      },
      nzFooter: null,
      nzClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.createRoleArray(result);
      }
    });
  }

  deleteRole(role): void {
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
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: ConfirmModalComponent,
        nzComponentParams: {
          title: 'delete',
          message: 'deleteRole',
          type: 'Delete',
          objectName: role.name
        },
        nzFooter: null,
        nzClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          delete this.userDetail.roles[role.name];
          this.saveInfo();
          this.dataService.preferences.roles.delete(role.name);
        }
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
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: ControllerModalComponent,
      nzComponentParams: {
        controllerRoles: this.controllerRoles,
        allRoles: this.roles,
        userDetail: this.userDetail
      },
      nzFooter: null,
      nzClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.createRoleArray(result);
      }
    });
  }

  copyController(role, controller): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: ControllerModalComponent,
      nzComponentParams: {
        controllerRoles: this.controllerRoles,
        oldController: controller,
        role,
        allRoles: this.roles,
        copy: true,
        userDetail: this.userDetail
      },
      nzFooter: null,
      nzClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.createRoleArray(result);
      }
    });
  }

  deleteController(role, controller): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: ConfirmModalComponent,
      nzComponentParams: {
        title: 'delete',
        message: 'deleteController',
        type: 'Delete',
        objectName: controller.name || 'default'
      },
      nzFooter: null,
      nzClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        delete this.userDetail.roles[role.name].permissions.controllers[controller.name];
        this.saveInfo();
      }
    });
  }

  drop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.controllerRoles, event.previousIndex, event.currentIndex);
    let roles: any = {};
    for (let index in this.controllerRoles) {
      roles[this.controllerRoles[index].name] = this.controllerRoles[index].mainObj;
    }
    this.userDetail.roles = roles;
    this.saveInfo();
  }

  private createRoleArray(res): void {
    this.controllerRoles = [];
    this.roles = [];
    for (let role in res.roles) {
      let obj = {name: role, controllers: [{name: '', permissions: res.roles[role].permissions}], mainObj: res.roles[role]};
      if (res.roles[role].permissions && res.roles[role].permissions.controllers) {
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
