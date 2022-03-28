import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router, RouterEvent} from '@angular/router';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {ToastrService} from 'ngx-toastr';
import {TranslateService} from '@ngx-translate/core';
import {clone, isArray} from 'underscore';
import {catchError, filter} from 'rxjs/operators';
import {forkJoin, of, Subscription} from 'rxjs';
import {DataService} from '../data.service';
import {CoreService} from '../../../services/core.service';
import {ConfirmModalComponent} from '../../../components/comfirm-modal/confirm.component';
import {AuthService} from '../../../components/guard';
import {ConfirmationModalComponent} from '../accounts/accounts.component';
import {CommentModalComponent} from '../../../components/comment-modal/comment.component';

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
  @Input() identityServiceType: string;
  @Input() identityServiceName: string;

  submitted = false;
  isUnique = true;
  currentRole: any = {};
  oldName: string;
  display: any;
  required = false;
  comments: any = {};
  controllerArr = [];

  constructor(public activeModal: NzModalRef, private coreService: CoreService, private dataService: DataService) {
  }

  ngOnInit(): void {
    this.comments.radio = 'predefined';
    if (sessionStorage.$SOS$FORCELOGING === 'true') {
      this.required = true;
      this.display = true;
    } else {
      const preferences = sessionStorage.preferences ? JSON.parse(sessionStorage.preferences) : {};
      this.display = preferences.auditLog;
    }
    if (this.dataService.comments && this.dataService.comments.comment) {
      this.comments = this.dataService.comments;
      this.display = false;
    }
    if (this.oldRole) {
      if (this.oldRole.mainObj) {
        this.currentRole = clone(this.oldRole.mainObj);
      }
      this.oldName = this.oldRole.roleName;
      if (!this.copy) {
        this.currentRole.roleName = this.oldRole.roleName;
      } else if (this.identityServiceType !== 'SHIRO') {
        if (this.oldRole.controllers && this.oldRole.controllers.length > 1) {
          this.submitted = true;
          this.oldRole.controllers.forEach((controller) => {
            this.coreService.post('iam/permissions', {
              identityServiceName: this.identityServiceName,
              controllerId: controller,
              roleName: this.oldRole.roleName,
            }).subscribe((res) => {
              this.controllerArr.push(res);
              if (this.submitted) {
                setTimeout(() => {
                  this.submitted = false;
                }, 100);
              }
            });
          });
        }
      }
    } else {
      this.currentRole = {
        permissions: {
          joc: [
            {
              permissionPath: 'sos:products:joc',
              excluded: false
            },
            {
              permissionPath: 'sos:products:controller:view',
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
      if (this.allRoles[i].roleName === newRole && ((this.oldRole && newRole !== this.oldRole.roleName) || !this.oldRole)) {
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

  private rename(): void {
    if (this.oldRole.roleName !== this.currentRole.roleName) {
      const request: any = {
        identityServiceName: this.identityServiceName,
        roleOldName: this.oldRole.roleName,
        roleNewName: this.currentRole.roleName,
        auditLog: {}
      };
      if (this.comments) {
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
      }
      this.coreService.post('iam/role/rename', request).subscribe({
        next: () => {
          this.activeModal.close('DONE');
        }, error: () => this.submitted = false
      });
    } else {
      this.activeModal.close();
    }
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.newRole || this.copy) {
      if (this.identityServiceType === 'SHIRO') {
        this.userDetail.roles[this.currentRole.roleName] = {
          permissions: this.currentRole.permissions
        };
      }
    } else {
      if (this.identityServiceType !== 'SHIRO') {
        this.rename();
        return;
      }
      this.updateRoleObject(this.oldName, this.currentRole.roleName);
      for (let i = 0; i < this.userDetail.accounts.length; i++) {
        for (let j = 0; j < this.userDetail.accounts[i].roles.length; j++) {
          if (this.userDetail.accounts[i].roles[j] === this.oldName) {
            this.userDetail.accounts[i].roles.splice(j, 1);
            this.userDetail.accounts[i].roles.push(this.currentRole.roleName);
          }
        }
      }
    }

    const request: any = {
      identityServiceName: this.identityServiceName,
      auditLog: {}
    };

    if (this.identityServiceType !== 'SHIRO') {
      request.roleName = this.currentRole.roleName;
    } else {
      request.accounts = this.userDetail.accounts;
      request.roles = this.userDetail.roles;
      request.main = this.userDetail.main;
    }

    if (this.comments) {
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
    }

    this.coreService.post(this.identityServiceType !== 'SHIRO' ? 'iam/role/store' : 'authentication/auth/store', request).subscribe({
      next: () => {
        if (this.copy && this.identityServiceType !== 'SHIRO') {
          if (this.controllerArr.length > 0) {
            const APIs = [];
            this.controllerArr.forEach((result) => {
              result.roleName = this.currentRole.roleName;
              APIs.push(this.coreService.post('iam/permissions/store', {...result, ...{auditLog: request.auditLog}}).pipe(
                catchError(error => of(error))
              ));
            });
            forkJoin(APIs).subscribe({
              next: () => {
                this.activeModal.close('DONE');
              }
            });
          }
        } else {
          this.activeModal.close(this.identityServiceType !== 'SHIRO' ? 'DONE' : this.userDetail);
        }
      }, error: () => this.submitted = false
    });
  }
}

// Controller Actions
@Component({
  selector: 'app-controller-modal-content',
  templateUrl: 'controller-dialog.html'
})
export class ControllerModalComponent implements OnInit {
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

  constructor(public activeModal: NzModalRef, private coreService: CoreService,
              private dataService: DataService, private authService: AuthService) {
  }

  ngOnInit(): void {
    this.comments.radio = 'predefined';
    if (sessionStorage.$SOS$FORCELOGING === 'true') {
      this.required = true;
      this.display = true;
    } else {
      const preferences = sessionStorage.preferences ? JSON.parse(sessionStorage.preferences) : {};
      this.display = preferences.auditLog;
    }

    if (this.dataService.comments && this.dataService.comments.comment) {
      this.comments = this.dataService.comments;
      this.display = false;
    }
    this.schedulerIds = this.authService.scheduleIds ? JSON.parse(this.authService.scheduleIds) : {};
    if (this.copy) {
      if (typeof this.oldController == 'string') {
        this.currentController.controller = clone(this.oldController);
      } else {
        this.currentController = clone(this.oldController);
      }
      this.currentController.name = this.currentController.controller || 'default';
    } else {
      this.currentController = {
        controller: '',
        roleName: ''
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
    for (let i = 0; i < this.allRoles.length; i++) {
      if (this.allRoles[i].roleName === role && this.allRoles[i].controllers) {
        for (let j = 0; j < this.allRoles[i].controllers.length; j++) {
          if (this.allRoles[i].controllers[j] === controller) {
            this.isUnique = false;
            break;
          }
        }
        break;
      }
    }
  }

  onSubmit(): void {
    if (this.currentController.roleName) {
      this.submitted = true;
      const request: any = {
        identityServiceName: sessionStorage.identityServiceName,
        auditLog: {}
      };
      if (this.comments) {
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
      }
      if (sessionStorage.identityServiceType === 'SHIRO') {
        if (!this.userDetail.roles[this.currentController.roleName].permissions) {
          this.userDetail.roles[this.currentController.roleName].permissions = {
            joc: [],
            controllerDefaults: [],
            controllers: {}
          };
        }
        if (!this.copy) {
          this.userDetail.roles[this.currentController.roleName].permissions.controllers[this.currentController.controller] = [{
            permissionPath: 'sos:products:controller:view',
            excluded: false
          }];
        } else {
          if (this.currentController.name) {
            this.userDetail.roles[this.currentController.roleName].permissions.controllers[this.currentController.name] = this.currentController.permissions;
          } else {
            this.userDetail.roles[this.currentController.roleName].permissions.controllerDefaults = this.oldController.permissions.controllerDefaults;
          }
        }

        request.accounts = this.userDetail.accounts;
        request.roles = this.userDetail.roles;
        request.main = this.userDetail.main;
        this.coreService.post('authentication/auth/store', request).subscribe({
          next: () => {
            this.activeModal.close(this.userDetail);
          }, error: () => this.submitted = false
        });
      } else {
        request.controllerId = this.currentController.controller;
        request.roleName = this.currentController.roleName;
        if (!this.copy) {
          request.permissions = [{permissionPath: 'sos:products:controller:view', excluded: false}];
          this.store(request);
        } else {
          this.coreService.post('iam/permissions', {
            identityServiceName: request.identityServiceName,
            controllerId: request.controllerId,
            roleName: this.role.roleName
          }).subscribe({
            next: (result) => {
              request.permissions = result.permissions;
              this.store(request);
            }, error: () => this.submitted = false
          });
        }
      }
    }
  }

  private store(request): void {
    this.coreService.post('iam/permissions/store', request).subscribe({
      next: () => {
        this.activeModal.close('DONE');
      }, error: () => this.submitted = false
    });
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
  roles = [];
  controllerRoles = [];
  identityServiceName: string;
  identityServiceType: string;
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
      if (res) {
        if (res.accounts) {
          this.setUsersData(res);
        } else if (isArray(res)) {
          this.accounts = res;
        }
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
    this.identityServiceName = sessionStorage.identityServiceName;
    this.identityServiceType = sessionStorage.identityServiceType;
    if (this.identityServiceType !== 'SHIRO') {
      this.getList();
    }
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
    this.subscription3.unsubscribe();
    this.dataService.announceFunction('IS_ROLE_PROFILES_FALSE');
  }

  setUsersData(res): void {
    if (this.identityServiceType === 'SHIRO') {
      this.userDetail = res;
      this.accounts = res.accounts;
      this.createRoleArray(res);
      this.checkUrl(null, true);
      if (this.dataService.preferences.roles.size === 0 && this.controllerRoles.length > 0) {
        this.dataService.preferences.roles.add(this.controllerRoles[0].roleName);
      }
    }
  }

  private getList(): void {
    this.coreService.post('iam/roles', {identityServiceName: this.identityServiceName}).subscribe((res: any) => {
      this.roles = res.roles;
      this.controllerRoles = res.roles;
      this.checkUrl(null, true);
    })
  }

  selectUser(account): void {
    this.showMsg = false;
    if (account) {
      for (let i = 0; i < this.accounts.length; i++) {
        if (this.accounts[i].accountName === account) {
          const selectedRoles = this.accounts[i].roles || [];
          if (this.identityServiceType !== 'SHIRO') {
            this.controllerRoles = this.roles.filter((role) => {
              return selectedRoles.includes(role.roleName);
            });
          } else {
            this.controllerRoles = this.controllerRoles.filter((role) => {
              return selectedRoles.includes(role.roleName);
            });
          }
          break;
        }
      }
      if (this.controllerRoles.length === 0) {
        this.showMsg = true;
      }
    } else if (this.identityServiceType !== 'SHIRO') {
      this.controllerRoles = this.coreService.clone(this.roles);
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
      this.dataService.preferences.roles.add(role.roleName);
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
        identityServiceType: this.identityServiceType,
        identityServiceName: this.identityServiceName,
        allRoles: this.controllerRoles,
        userDetail: this.userDetail,
        newRole: true
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        if (this.identityServiceType === 'SHIRO') {
          this.createRoleArray(result);
        } else {
          this.getList();
        }
      }
    });
  }

  editRole(role): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: RoleModalComponent,
      nzAutofocus: null,
      nzComponentParams: {
        identityServiceType: this.identityServiceType,
        identityServiceName: this.identityServiceName,
        allRoles: this.controllerRoles,
        userDetail: this.userDetail,
        oldRole: role
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        if (this.identityServiceType === 'SHIRO') {
          this.createRoleArray(result);
        } else {
          this.getList();
        }
      }
    });
  }

  copyRole(role): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: RoleModalComponent,
      nzAutofocus: null,
      nzComponentParams: {
        identityServiceType: this.identityServiceType,
        identityServiceName: this.identityServiceName,
        allRoles: this.controllerRoles,
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
        if (this.identityServiceType === 'SHIRO') {
          this.createRoleArray(result);
        } else {
          this.getList();
        }
      }
    });
  }

  deleteRole(role): void {
    let isAssigned: boolean;
    let waringMessage = '';
    for (const i in this.accounts) {
      for (const j in this.accounts[i].roles) {
        if (this.accounts[i].roles[j] === role.roleName) {
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
          name: role.roleName
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
            if (sessionStorage.identityServiceType === 'SHIRO') {
              delete this.userDetail.roles[role.roleName];
              this.saveInfo(result);
            } else {
              this.removeRole(role.roleName, result);
            }
            this.dataService.preferences.roles.delete(role.roleName);
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
            objectName: role.roleName
          },
          nzFooter: null,
          nzClosable: false,
          nzMaskClosable: false
        });
        modal.afterClose.subscribe(result => {
          if (result) {
            if (sessionStorage.identityServiceType === 'SHIRO') {
              delete this.userDetail.roles[role.roleName];
              this.saveInfo(this.dataService.comments);
            } else {
              this.removeRole(role.roleName, this.dataService.comments);
            }
            this.dataService.preferences.roles.delete(role.roleName);
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
      roleNames: [role],
      identityServiceName: this.identityServiceName,
    };
    obj.auditLog = {};
    if (comments) {
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
    }
    this.coreService.post('iam/roles/delete', obj).subscribe(() => {
      this.getList();
      this.reset();
    });
  }

  addController(): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: ControllerModalComponent,
      nzComponentParams: {
        allRoles: this.controllerRoles,
        userDetail: this.userDetail
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        if (this.identityServiceType === 'SHIRO') {
          this.createRoleArray(result);
        } else {
          this.getList();
        }
      }
    });
  }

  copyController(role, controller): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: ControllerModalComponent,
      nzComponentParams: {
        allRoles: this.controllerRoles,
        oldController: controller,
        role,
        copy: true,
        userDetail: this.userDetail
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        if (this.identityServiceType === 'SHIRO') {
          this.createRoleArray(result);
        } else {
          this.getList();
        }
      }
    });
  }

  deleteController(role, controller): void {
    if (this.preferences.auditLog && !this.dataService.comments.comment) {
      let comments = {
        radio: 'predefined',
        type: 'Controller',
        operation: 'Delete',
        name: controller || 'default'
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
          if (this.identityServiceType === 'SHIRO') {
            delete this.userDetail.roles[role.roleName].permissions.controllers[controller];
            this.saveInfo(result);
          } else {
            this.deleteControllerAPI(role.roleName, controller, result);
          }
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
          objectName: controller || 'default'
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          if (this.identityServiceType === 'SHIRO') {
            delete this.userDetail.roles[role.roleName].permissions.controllers[controller];
            this.saveInfo(this.dataService.comments);
          } else {
            this.deleteControllerAPI(role.roleName, controller, this.dataService.comments);
          }
        }
      });
    }
  }

  private deleteControllerAPI(roleName, controllerName, comments): void {
    this.coreService.post('iam/permissions', {
      controllerId: controllerName,
      roleName: roleName,
      identityServiceName: this.identityServiceName,
    }).subscribe((res) => {
      const request: any = {
        controllerId: controllerName,
        roleName: roleName,
        identityServiceName: this.identityServiceName,
        permissionPaths: res.permissions.map((item) => item.permissionPath)
      };

      if (comments) {
        request.auditLog = {};
        if (comments.comment) {
          request.auditLog.comment = comments.comment;
        }
        if (comments.timeSpent) {
          request.auditLog.timeSpent = comments.timeSpent;
        }
        if (comments.ticketLink) {
          request.auditLog.ticketLink = comments.ticketLink;
        }
        if (comments.isChecked) {
          this.dataService.comments = comments;
        }
      }
      this.coreService.post('iam/permissions/delete', request).subscribe(() => {
        this.getList();
      });
    });
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
      roleNames: [],
      identityServiceName: this.identityServiceName,
    };
    this.object.mapOfCheckedId.forEach((value, key) => {
      obj.roleNames.push(key);
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
    this.coreService.post('iam/roles/delete', obj).subscribe(() => {
      this.controllerRoles = this.controllerRoles.filter((item) => {
        return !this.object.mapOfCheckedId.has(item.roleName);
      });
      this.reset();
    });
  }

  drop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.controllerRoles, event.previousIndex, event.currentIndex);
    let comments = {};
    if (sessionStorage.$SOS$FORCELOGING === 'true') {
      this.translate.get('auditLog.message.defaultAuditLog').subscribe(translatedValue => {
        comments = {comment: translatedValue};
      });
    }
    if (this.identityServiceType === 'SHIRO') {
      const roles: any = {};
      for (const index in this.controllerRoles) {
        if (this.controllerRoles[index]) {
          roles[this.controllerRoles[index].roleName] = this.controllerRoles[index].mainObj;
        }
      }
      this.userDetail.roles = roles;
      this.saveInfo(this.dataService.comments.comment ? this.dataService.comments : comments);
    } else {
      this.coreService.post('iam/roles/reorder', {
        identityServiceName: this.identityServiceName,
        roleNames: this.controllerRoles.map((role) => role.roleName),
        auditLog: this.dataService.comments.comment ? this.dataService.comments : comments
      }).subscribe()
    }
  }

  private createRoleArray(res): void {
    this.controllerRoles = [];
    for (const role in res.roles) {
      let obj = {
        roleName: role,
        controllers: [''],
        controllersPermission: [{name: '', permissions: res.roles[role].permissions}],
        mainObj: res.roles[role]
      };
      if (res.roles[role].permissions && res.roles[role].permissions.controllers) {
        for (const controller in res.roles[role].permissions.controllers) {
          if (res.roles[role].permissions.controllers[controller]) {
            obj.controllers.push(controller);
            obj.controllersPermission.push({
              name: controller,
              permissions: res.roles[role].permissions.controllers[controller]
            });
          }
        }
      }
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
          if (this.identityServiceType === 'SHIRO') {
            this.dataService.copiedObject.roles.forEach((value, key) => {
              if (!this.userDetail.roles[key]) {
                this.userDetail.roles[key] = value;
              }
            });
            this.saveInfo(result);
          } else {
            this.pasteRole(result);
          }
        }
      });
    } else {
      if (this.identityServiceType === 'SHIRO') {
        this.dataService.copiedObject.roles.forEach((value, key) => {
          if (!this.userDetail.roles[key]) {
            this.userDetail.roles[key] = value;
          }
        });
        this.saveInfo(this.dataService.comments);
      } else {
        this.pasteRole(this.dataService.comments);
      }
    }
  }

  private pasteRole(comments): void {
    const roles = [];
    this.dataService.copiedObject.roles.forEach((value, key) => {
      let flag = false;
      for (const i in this.controllerRoles) {
        if (this.controllerRoles[i]) {
          if (this.controllerRoles[i].roleName === key) {
            flag = true;
            break;
          }
        }
      }
      if (!flag) {
        roles.push(value);
      }
    });
    roles.forEach((role, index) => {
      this.coreService.post('iam/role/store', {
        roleName: role.roleName,
        auditLog: comments,
        identityServiceName: this.identityServiceName
      }).subscribe({
        next: () => {
          this.getAndStorePermission(role, comments);
          if (index === roles.length - 1) {
            this.getList();
          }
        }
      });
    })
  }

  private getAndStorePermission(role, comments) {
    role.controllers.forEach((id) => {
      this.coreService.post('iam/permissions', {
        roleName: role.roleName,
        controllerId: id,
        identityServiceName: role.identityServiceName
      }).subscribe({
        next: (res) => {
          this.coreService.post('iam/permissions/store', {
            roleName: role.roleName,
            controllerId: id,
            permissions: res.permissions,
            identityServiceName: this.identityServiceName,
            auditLog: comments
          }).subscribe();
        }
      });
    });
  }

  checkAll(value: boolean): void {
    if (value && this.controllerRoles.length > 0) {
      this.controllerRoles.forEach(item => {
        item.identityServiceName = this.identityServiceName;
        this.object.mapOfCheckedId.set(item.roleName, item.mainObj || item);
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
      role.identityServiceName = this.identityServiceName;
      this.object.mapOfCheckedId.set(role.roleName, role.mainObj || role);
    } else {
      this.object.mapOfCheckedId.delete(role.roleName);
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
