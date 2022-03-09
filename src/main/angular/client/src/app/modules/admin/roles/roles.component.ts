import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router, RouterEvent} from '@angular/router';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {ToastrService} from 'ngx-toastr';
import {TranslateService} from '@ngx-translate/core';
import {isEqual, clone} from 'underscore';
import {filter} from 'rxjs/operators';
import {Subscription} from 'rxjs';
import {DataService} from '../data.service';
import {CoreService} from '../../../services/core.service';
import {ConfirmModalComponent} from '../../../components/comfirm-modal/confirm.component';
import {AuthService} from '../../../components/guard';
import { ConfirmationModalComponent } from '../accounts/accounts.component';
import { CommentModalComponent } from '../../../components/comment-modal/comment.component';

// Role Actions
@Component({
  selector: 'app-role-modal-content',
  templateUrl: './role-dialog.html'
})
export class RoleModalComponent implements OnInit {
  @Input() userDetail: any;
  @Input() oldRole: any;
  @Input() allRoles: any;
  @Input() newRole: boolean;
  @Input() copy: boolean;

  submitted = false;
  isUnique = true;
  currentRole: any = {};
  oldName: string;
  display: any;
  required = false;
  comments: any = {};

  constructor(public activeModal: NzModalRef, private coreService: CoreService, private dataService: DataService) {
  }

  ngOnInit(): void {
    const preferences = sessionStorage.preferences ? JSON.parse(sessionStorage.preferences) : {};
    this.display = preferences.auditLog;
    this.comments.radio = 'predefined';
    if (sessionStorage.$SOS$FORCELOGING === 'true') {
      this.required = true;
      this.display = true;
    }
    if (this.dataService.comments && this.dataService.comments.comment) {
      this.comments = this.dataService.comments;
      this.display = false;
    }
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
            },
            {
              path: 'sos:products:controller:view',
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

  private updateRoleObject(oldRole, newRole): void {
    const obj: any = {};
    for (const key in this.userDetail.roles) {
      if (key === oldRole) {
        obj[newRole] = this.userDetail.roles[key]
      } else {
        obj[key] = this.userDetail.roles[key]
      }
    }
    this.userDetail.roles = obj;
  }

  private rename(obj): void {
    if (this.oldRole.name !== this.currentRole.role) {
      const request: any = {
        identityServiceName: this.userDetail.identityServiceName,
        roleOldName: this.oldRole.name,
        roleNewName: this.currentRole.role,
        auditLog: {}
      };
      if (this.comments.comment) {
        request.auditLog.comment = this.comments.comment;
      }
      if (this.comments.timeSpent) {
        request.auditLog.timeSpent = this.comments.timeSpent;
      }
      if (this.comments.ticketLink) {
        request.auditLog.ticketLink = this.comments.ticketLink;
      }
      if (this.comments.isChecked) {
        this.dataService.comments = this.comments;
      }
      this.coreService.post('authentication/auth/role/rename', request).subscribe({
        next: () => {
          this.updateRoleObject(this.oldName, obj.role);
          this.activeModal.close(this.userDetail);
        }, error: () => this.submitted = false
      });
    } else {
      this.activeModal.close();
    }
  }

  private getUsersData(cb): void {
    this.coreService.post('authentication/auth', {
      identityServiceName: this.userDetail.identityServiceName
    }).subscribe({
      next: res => {
        this.userDetail.accounts = res.accounts;
        this.userDetail.main = res.main;
        this.userDetail.roles = res.roles;
        cb();
      }
    });
  }

  onSubmit(obj): void {
    this.submitted = true;
    this.getUsersData(() => {
      if (this.newRole || this.copy) {
        this.allRoles.push(obj.role);
        this.userDetail.roles[obj.role] = {
          permissions: obj.permissions
        };
      } else {
        if (sessionStorage.identityServiceType !== 'SHIRO') {
          this.rename(obj);
          return;
        }
        this.updateRoleObject(this.oldName, obj.role);
        for (let i = 0; i < this.userDetail.accounts.length; i++) {
          for (let j = 0; j < this.userDetail.accounts[i].roles.length; j++) {
            if (this.userDetail.accounts[i].roles[j] === this.oldName) {
              this.userDetail.accounts[i].roles.splice(j, 1);
              this.userDetail.accounts[i].roles.push(obj.role);
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

      const request: any = {
        accounts: this.userDetail.accounts,
        roles: this.userDetail.roles,
        identityServiceName: this.userDetail.identityServiceName
      };

      request.auditLog = {};
      if (this.comments.comment) {
        request.auditLog.comment = this.comments.comment;
      }
      if (this.comments.timeSpent) {
        request.auditLog.timeSpent = this.comments.timeSpent;
      }
      if (this.comments.ticketLink) {
        request.auditLog.ticketLink = this.comments.ticketLink;
      }
      if (this.comments.isChecked) {
        this.dataService.comments = this.comments;
      }
      if (sessionStorage.identityServiceType === 'SHIRO') {
        request.main = this.userDetail.main;
      }

      this.coreService.post('authentication/auth/store', request).subscribe({
        next: () => {
          this.activeModal.close(this.userDetail);
        }, error: () => this.submitted = false
      });
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
  display: any;
  required = false;
  comments: any = {};
  name = '';

  constructor(public activeModal: NzModalRef, private coreService: CoreService,
    private dataService: DataService, private authService: AuthService) {
  }

  ngOnInit(): void {
    const preferences = sessionStorage.preferences ? JSON.parse(sessionStorage.preferences) : {};
    this.display = preferences.auditLog;
    this.comments.radio = 'predefined';
    if (sessionStorage.$SOS$FORCELOGING === 'true') {
      this.required = true;
      this.display = true;
    }
    if (this.dataService.comments && this.dataService.comments.comment) {
      this.comments = this.dataService.comments;
      this.display = false;
    }
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

  private getUsersData(cb): void {
    this.coreService.post('authentication/auth', {
      identityServiceName: this.userDetail.identityServiceName
    }).subscribe({
      next: res => {
        this.userDetail.accounts = res.accounts;
        this.userDetail.main = res.main;
        this.userDetail.roles = res.roles;
        cb();
      }
    });
  }

  onSubmit(obj): void {
    if (obj.role) {
      this.submitted = true;
      this.getUsersData(() => {
        if (!this.userDetail.roles[obj.role].permissions) {
          this.userDetail.roles[obj.role].permissions = {
            joc: [{
              path: 'sos:products:joc',
              excluded: false
            },
            {
              path: 'sos:products:controller:view',
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
        const request: any = {
          identityServiceName: this.userDetail.identityServiceName,
          accounts: this.userDetail.accounts,
          roles: this.userDetail.roles,
          auditLog: {}
        };
        if (this.comments.comment) {
          request.auditLog.comment = this.comments.comment;
        }
        if (this.comments.timeSpent) {
          request.auditLog.timeSpent = this.comments.timeSpent;
        }
        if (this.comments.ticketLink) {
          request.auditLog.ticketLink = this.comments.ticketLink;
        }
        if (this.comments.isChecked) {
          this.dataService.comments = this.comments;
        }
        if (sessionStorage.identityServiceType === 'SHIRO') {
          request.main = this.userDetail.main;
        }
        this.coreService.post('authentication/auth/store', request).subscribe({
          next: () => {
            this.activeModal.close(this.userDetail);
          }, error: () => this.submitted = false
        });
      });
    }
  }
}

@Component({
  selector: 'app-roles',
  templateUrl: 'roles.component.html',
  styleUrls: ['./roles.component.css']
})
export class RolesComponent implements OnInit, OnDestroy {
  accounts: any = [];
  userDetail: any = {};
  showMsg: any;
  permission: any = {};
  preferences: any = {};
  roles: any = [];
  controllerRoles = [];
  object = {
    checked: false,
    indeterminate: false,
    mapOfCheckedId: new Map()
  };
  subscription1: Subscription;
  subscription2: Subscription;
  subscription3: Subscription;

  constructor(private coreService: CoreService, private router: Router, private authService: AuthService, private activeRoute: ActivatedRoute, private modal: NzModalService,
    private translate: TranslateService, private toasterService: ToastrService, public dataService: DataService) {
    this.subscription1 = dataService.dataAnnounced$.subscribe(res => {
      if (res && res.accounts) {
        this.setUsersData(res);
      }
    });
    this.subscription2 = dataService.functionAnnounced$.subscribe(res => {
      if (res === 'ADD_ROLE') {
        this.addRole();
      } else if (res === 'ADD_CONTROLLER') {
        this.addController();
      } else if (res === 'COPY_ROLE') {
        this.dataService.copiedObject.roles = this.object.mapOfCheckedId;
        this.reset();
      } else if (res === 'PASTE_ROLE') {
        this.paste();
      } else if (res === 'DELETE') {
        this.deleteList();
      }
    });
    this.subscription3 = router.events
      .pipe(filter((event: RouterEvent) => event instanceof NavigationEnd)).subscribe((e: any) => {
        this.checkUrl(e);
      });
  }

  ngOnInit(): void {
    this.permission = this.authService.permission ? JSON.parse(this.authService.permission) : {};
    this.preferences = sessionStorage.preferences ? JSON.parse(sessionStorage.preferences) : {};
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
    this.subscription3.unsubscribe();
    this.dataService.announceFunction('IS_ROLE_PROFILES_FALSE');
  }

  setUsersData(res): void {
    this.userDetail = res;
    this.accounts = res.accounts;
    this.createRoleArray(res);
    this.checkUrl(null, true);
    if (this.dataService.preferences.roles.size === 0 && this.controllerRoles.length > 0) {
      this.dataService.preferences.roles.add(this.controllerRoles[0].name);
    }
  }

  selectUser(account): void {
    this.showMsg = false;
    if (account) {
      for (let i = 0; i < this.accounts.length; i++) {
        if (this.accounts[i].account === account && this.accounts[i].roles) {
          const selectedRoles = this.accounts[i].roles || [];
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

  expandAll() {
    this.controllerRoles.forEach(role => {
      this.dataService.preferences.roles.add(role.name);
    });
  }

  collapseAll() {
    this.dataService.preferences.roles.clear();
  }

  saveInfo(comments): void {
    const obj: any = {
      accounts: this.accounts,
      roles: this.userDetail.roles,
      identityServiceName: this.userDetail.identityServiceName
    };
    obj.auditLog = {};
    if (comments.comment) {
      obj.auditLog.comment = comments.comment;
    }
    if (comments.timeSpent) {
      obj.auditLog.timeSpent = comments.timeSpent;
    }
    if (comments.ticketLink) {
      obj.auditLog.ticketLink = comments.ticketLink;
    }
    if (comments.isChecked) {
      this.dataService.comments = comments;
    }
    if (sessionStorage.identityServiceType === 'SHIRO') {
      obj.main = this.userDetail.main;
    }
    this.coreService.post('authentication/auth/store', obj).subscribe(() => {
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
      nzClosable: false,
      nzMaskClosable: false
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
      nzClosable: false,
      nzMaskClosable: false
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
      nzClosable: false,
      nzMaskClosable: false
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
    for (const i in this.accounts) {
      for (const j in this.accounts[i].roles) {
        if (this.accounts[i].roles[j] === role.name) {
          isAssigned = true;
          break;
        }
      }
      if (isAssigned) {
        break;
      }
    }
    if (!isAssigned) {
      if (this.preferences.auditLog && !this.dataService.comments.comment) {
        let comments = {
          radio: 'predefined',
          type: 'Role',
          operation: 'Delete',
          name: role.name
        };
        const modal = this.modal.create({
          nzTitle: undefined,
          nzContent: CommentModalComponent,
          nzClassName: 'lg',
          nzComponentParams: {
            comments
          },
          nzFooter: null,
          nzClosable: false,
          nzMaskClosable: false
        });
        modal.afterClose.subscribe(result => {
          if (result) {
            delete this.userDetail.roles[role.name];
            if (sessionStorage.identityServiceType === 'SHIRO') {
              this.saveInfo(result);
            } else {
              this.removeRole(role.name, result);
            }
            this.dataService.preferences.roles.delete(role.name);
          }
        });
      } else {
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
          nzClosable: false,
          nzMaskClosable: false
        });
        modal.afterClose.subscribe(result => {
          if (result) {
            delete this.userDetail.roles[role.name];
            if (sessionStorage.identityServiceType === 'SHIRO') {
              this.saveInfo(this.dataService.comments);
            } else {
              this.removeRole(role.name, this.dataService.comments);
            }
            this.dataService.preferences.roles.delete(role.name);
          }
        });
      }
    } else {
      this.translate.get('user.message.cannotDeleteRole').subscribe(translatedValue => {
        waringMessage = translatedValue;
      });
      this.toasterService.warning(waringMessage, '', {
        timeOut: 3000
      });
    }
  }

  private removeRole(role, comments) {
    const obj: any = {
      roles: [
        { role }
      ],
      identityServiceName: this.userDetail.identityServiceName,
    };
    obj.auditLog = {};
    if (comments.comment) {
      obj.auditLog.comment = comments.comment;
    }
    if (comments.timeSpent) {
      obj.auditLog.timeSpent = comments.timeSpent;
    }
    if (comments.ticketLink) {
      obj.auditLog.ticketLink = comments.ticketLink;
    }
    if (comments.isChecked) {
      this.dataService.comments = comments;
    }
    this.coreService.post('authentication/auth/roles/delete', obj).subscribe(() => {
      this.roles = this.roles.filter((item) => {
        return role != item;
      });
      this.controllerRoles = this.controllerRoles.filter((item) => {
        return role != item.name;
      });
      this.reset();
    });
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
      nzClosable: false,
      nzMaskClosable: false
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
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.createRoleArray(result);
      }
    });
  }

  deleteController(role, controller): void {
    if (this.preferences.auditLog && !this.dataService.comments.comment) {
      let comments = {
        radio: 'predefined',
        type: 'Controller',
        operation: 'Delete',
        name: controller.name || 'default'
      };
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzClassName: 'lg',
        nzComponentParams: {
          comments
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          delete this.userDetail.roles[role.name].permissions.controllers[controller.name];
          this.saveInfo(result);
        }
      });
    } else {
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
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          delete this.userDetail.roles[role.name].permissions.controllers[controller.name];
          this.saveInfo(this.dataService.comments);
        }
      });
    }
  }

  private deleteList(): void {
    let isAssigned: boolean;
    let waringMessage = '';
    for (const i in this.accounts) {
      for (const j in this.accounts[i].roles) {
        if (this.object.mapOfCheckedId.has(this.accounts[i].roles[j])) {
          isAssigned = true;
          break;
        }
      }
      if (isAssigned) {
        break;
      }
    }
    if (!isAssigned) {
      if (this.preferences.auditLog && !this.dataService.comments.comment) {
        let comments = {
          radio: 'predefined',
          type: 'Role',
          operation: 'Delete',
          name: ''
        };
        this.object.mapOfCheckedId.forEach((value, key) => {
          comments.name = comments.name + key + ', ';
        });
        const modal = this.modal.create({
          nzTitle: undefined,
          nzContent: CommentModalComponent,
          nzClassName: 'lg',
          nzComponentParams: {
            comments
          },
          nzFooter: null,
          nzClosable: false,
          nzMaskClosable: false
        });
        modal.afterClose.subscribe(result => {
          if (result) {
            this.deleteRoles(result);
          }
        });
      } else {
        this.modal.create({
          nzTitle: undefined,
          nzContent: ConfirmationModalComponent,
          nzComponentParams: {
            delete: true,
            isRole: true
          },
          nzFooter: null,
          nzClosable: false,
          nzMaskClosable: false
        }).afterClose.subscribe(result => {
          if (result) {
            this.deleteRoles(this.dataService.comments);
          }
        });
      }
    } else {
      this.translate.get('user.message.cannotDeleteRole').subscribe(translatedValue => {
        waringMessage = translatedValue;
      });
      this.toasterService.warning(waringMessage, '', {
        timeOut: 3000
      });
    }
  }

  private deleteRoles(comments) {
    const obj: any = {
      roles: [],
      identityServiceName: this.userDetail.identityServiceName,
    };
    this.object.mapOfCheckedId.forEach((value, key) => {
      obj.roles.push({ role: key });
    });
    obj.auditLog = {};
    if (comments.comment) {
      obj.auditLog.comment = comments.comment;
    }
    if (comments.timeSpent) {
      obj.auditLog.timeSpent = comments.timeSpent;
    }
    if (comments.ticketLink) {
      obj.auditLog.ticketLink = comments.ticketLink;
    }
    if (comments.isChecked) {
      this.dataService.comments = comments;
    }
    this.coreService.post('authentication/auth/roles/delete', obj).subscribe(() => {
      this.roles = this.roles.filter((item) => {
        return !this.object.mapOfCheckedId.has(item);
      });
      this.controllerRoles = this.controllerRoles.filter((item) => {
        return !this.object.mapOfCheckedId.has(item.name);
      });
      this.reset();
    });
  }

  drop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.controllerRoles, event.previousIndex, event.currentIndex);
    const roles: any = {};
    for (const index in this.controllerRoles) {
      if (this.controllerRoles[index]) {
        roles[this.controllerRoles[index].name] = this.controllerRoles[index].mainObj;
      }
    }
    this.userDetail.roles = roles;
    let comments = {};
    this.translate.get('auditLog.message.defaultAuditLog').subscribe(translatedValue => {
      comments = { comment: translatedValue };
    });
    this.saveInfo(this.dataService.comments.comment ? this.dataService.comments : comments);
  }

  private createRoleArray(res): void {
    this.controllerRoles = [];
    this.roles = [];
    for (const role in res.roles) {
      let obj = {
        name: role,
        controllers: [{ name: '', permissions: res.roles[role].permissions }],
        mainObj: res.roles[role]
      };
      if (res.roles[role].permissions && res.roles[role].permissions.controllers) {
        for (const controller in res.roles[role].permissions.controllers) {
          if (res.roles[role].permissions.controllers[controller]) {
            obj.controllers.push({ name: controller, permissions: res.roles[role].permissions.controllers[controller] });
          }
        }
      }
      this.roles.push(role);
      this.controllerRoles.push(obj);
    }
  }

  private paste(): void {
    if (this.preferences.auditLog && !this.dataService.comments.comment) {
      let comments = {
        radio: 'predefined',
        type: 'Roles',
        operation: 'Paste',
        name: ''
      };
      this.dataService.copiedObject.accounts.forEach((value, key) => {
        comments.name = comments.name + key + ', ';
      });
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzClassName: 'lg',
        nzComponentParams: {
          comments
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          this.dataService.copiedObject.roles.forEach((value, key) => {
            if (!this.userDetail.roles[key]) {
              this.userDetail.roles[key] = value;
            }
          });
          this.saveInfo(result);
        }
      });
    } else {
      this.dataService.copiedObject.roles.forEach((value, key) => {
        if (!this.userDetail.roles[key]) {
          this.userDetail.roles[key] = value;
        }
      });
      this.saveInfo(this.dataService.comments);
    }
  }

  checkAll(value: boolean): void {
    if (value && this.controllerRoles.length > 0) {
      this.controllerRoles.forEach(item => {
        this.object.mapOfCheckedId.set(item.name, item.mainObj);
      });
    } else {
      this.object.mapOfCheckedId.clear();
    }
    this.checkCheckBoxState();
  }

  private checkCheckBoxState(): void {
    this.object.indeterminate = this.object.mapOfCheckedId.size > 0 && !this.object.checked;
    if (this.object.mapOfCheckedId.size > 0) {
      this.dataService.announceFunction('IS_ROLE_PROFILES_TRUE');
    } else {
      this.dataService.announceFunction('IS_ROLE_PROFILES_FALSE');
    }
  }

  private reset(): void {
    this.object = {
      checked: false,
      indeterminate: false,
      mapOfCheckedId: new Map()
    };
    this.dataService.announceFunction('IS_ROLE_PROFILES_FALSE');
  }

  checkMappedObject(isChecked: boolean, role): void {
    if (isChecked) {
      this.object.mapOfCheckedId.set(role.name, role.mainObj);
    } else {
      this.object.mapOfCheckedId.delete(role.name);
    }
    this.object.checked = this.object.mapOfCheckedId.size === this.controllerRoles.length;
    this.checkCheckBoxState();
  }

  private checkUrl(val, skip = false): void {
    if ((val && val.url) || skip) {
      this.activeRoute.queryParams
        .subscribe(params => {
          this.selectUser(params.account);
        });
    }
  }
}
