import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router, RouterEvent} from '@angular/router';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {ToastrService} from 'ngx-toastr';
import {TranslateService} from '@ngx-translate/core';
import {clone, isArray} from 'underscore';
import {catchError, filter} from 'rxjs/operators';
import {forkJoin, of, Subscription} from 'rxjs';
import {saveAs} from 'file-saver';
import {DataService} from '../data.service';
import {CoreService} from '../../../services/core.service';
import {ConfirmModalComponent} from '../../../components/comfirm-modal/confirm.component';
import {AuthService} from '../../../components/guard';
import {ConfirmationModalComponent} from '../accounts/accounts.component';
import {CommentModalComponent} from '../../../components/comment-modal/comment.component';
import {UploadModalComponent} from "../upload/upload.component";

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
    if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
      this.required = true;
      this.display = true;
    } else {
      const preferences = sessionStorage['preferences'] ? JSON.parse(sessionStorage['preferences']) : {};
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
      } else {
        if (this.oldRole.controllers && this.oldRole.controllers.length > 0) {
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

  private rename(): void {
    if (this.oldRole.roleName !== this.currentRole.roleName) {
      const request: any = {
        identityServiceName: this.identityServiceName,
        roleOldName: this.oldRole.roleName,
        roleNewName: this.currentRole.roleName,
        auditLog: {}
      };
      if (this.comments) {
        this.coreService.getAuditLogObj(this.comments, request.auditLog);
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
    if (!this.newRole && !this.copy) {
      this.rename();
      return;
    }

    const request: any = {
      identityServiceName: this.identityServiceName,
      roleName: this.currentRole.roleName,
      auditLog: {}
    };
    if (this.comments) {
      this.coreService.getAuditLogObj(this.comments, request.auditLog);
      if (this.comments.isChecked) {
        this.dataService.comments = this.comments;
      }
    }
    this.coreService.post('iam/role/store', request).subscribe({
      next: () => {
        if (this.copy) {
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
          this.coreService.post('iam/permissions/store', {
            roleName: this.currentRole.roleName,
            identityServiceName: this.identityServiceName,
            controllerId: '',
            permissions: [{permissionPath: 'sos:products:controller:view', excluded: false}],
            auditLog: request.auditLog
          }).subscribe({
            next: () => {
              this.activeModal.close('DONE');
            }, error: () => {
              this.activeModal.close('DONE');
            }
          });
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
    if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
      this.required = true;
      this.display = true;
    } else {
      const preferences = sessionStorage['preferences'] ? JSON.parse(sessionStorage['preferences']) : {};
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
        identityServiceName: sessionStorage['identityServiceName'],
        auditLog: {}
      };
      if (this.comments) {
        this.coreService.getAuditLogObj(this.comments, request.auditLog);
        if (this.comments.isChecked) {
          this.dataService.comments = this.comments;
        }
      }

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
        if (isArray(res)) {
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
      } else if (res === 'EXPORT_ROLE') {
        this.exportRole();
      } else if (res === 'IMPORT_ROLE') {
        this.importRole();
      }
    });
    this.subscription3 = router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.checkUrl(event);
      }
    });
  }

  ngOnInit(): void {
    this.permission = this.authService.permission ? JSON.parse(this.authService.permission) : {};
    this.preferences = sessionStorage['preferences'] ? JSON.parse(sessionStorage['preferences']) : {};
    this.identityServiceName = sessionStorage['identityServiceName'];
    this.identityServiceType = sessionStorage['identityServiceType'];
    this.getList();
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
    this.subscription3.unsubscribe();
    this.dataService.announceFunction('IS_ROLE_PROFILES_FALSE');
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
          this.controllerRoles = this.roles.filter((role) => {
            return selectedRoles.includes(role.roleName);
          });
          break;
        }
      }
      if (this.controllerRoles.length === 0) {
        this.showMsg = true;
      }
    } else {
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
        this.getList();
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
        this.getList();
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
        this.getList();
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
          nzAutofocus: null,
          nzClosable: false,
          nzMaskClosable: false
        });
        modal.afterClose.subscribe(result => {
          if (result) {
            if (result.isChecked) {
              this.dataService.comments = result;
            }
            this.removeRole(role.roleName, result);
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
          nzAutofocus: null,
          nzClosable: false,
          nzMaskClosable: false
        });
        modal.afterClose.subscribe(result => {
          if (result) {
            this.removeRole(role.roleName, this.dataService.comments);
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
      identityServiceName: this.identityServiceName
    };
    if (comments) {
      obj.auditLog = {};
      this.coreService.getAuditLogObj(comments, obj.auditLog);
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
      nzAutofocus: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.getList();
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
      nzAutofocus: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.getList();
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
        nzAutofocus: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          this.deleteControllerAPI(role.roleName, controller, result);
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
        nzAutofocus: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          this.deleteControllerAPI(role.roleName, controller, this.dataService.comments);
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
        this.coreService.getAuditLogObj(comments, request.auditLog);
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
          nzAutofocus: null,
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
          nzAutofocus: null,
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
    this.coreService.getAuditLogObj(comments, obj.auditLog);
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

  private exportRole(): void {
    const json = {};
    const APIs = [];
    this.object.mapOfCheckedId.forEach((value, key) => {
      json[key] = {
        controllers: []
      }
      value.controllers.forEach((controllerId) => {
        json[key].controllers.push({
          controllerId: controllerId,
        })
        APIs.push(this.coreService.post('iam/folders', {
          identityServiceName: value.identityServiceName,
          controllerId: controllerId,
          roleName: key
        }));
        APIs.push(this.coreService.post('iam/permissions', {
          identityServiceName: value.identityServiceName,
          controllerId: controllerId,
          roleName: key
        }))
      });

    });
    if (APIs.length > 0) {
      forkJoin(APIs).subscribe({
        next: (results) => {
          results.forEach((item) => {
            json[item.roleName].controllers.forEach((controller) => {
              if (controller.controllerId == item.controllerId) {
                if (item.folders) {
                  controller.folders = item.folders;
                } else {
                  controller.permissions = item.permissions;
                }
              }
            })
            if (json[item.roleName].controllers.length === 0) {
              json[item.roleName].controllers.push({
                controllerId: item.controllerId,
                folders: item.folders,
                permissions: item.permissions
              })
            }
          });
          this.saveRoles(json);
        }
      });
    } else {
      this.saveRoles(json);
    }
  }

  private saveRoles(obj) {
    const name = this.identityServiceName + '_roles.json';
    const fileType = 'application/octet-stream';
    const data = JSON.stringify(obj, undefined, 2);
    const blob = new Blob([data], {type: fileType});
    saveAs(blob, name);
    this.reset();
  }

  private importRole() {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: UploadModalComponent,
      nzClassName: 'lg',
      nzAutofocus: null,
      nzComponentParams: {
        identityServiceType: this.identityServiceType,
        identityServiceName: this.identityServiceName,
        display: this.preferences.auditLog,
        userDetail: this.userDetail,
        isRole: true
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.getList();
      }
    });
  }

  drop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.controllerRoles, event.previousIndex, event.currentIndex);
    let comments = {};
    if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
      this.translate.get('auditLog.message.defaultAuditLog').subscribe(translatedValue => {
        comments = {comment: translatedValue};
      });
    }
    this.coreService.post('iam/roles/reorder', {
      identityServiceName: this.identityServiceName,
      roleNames: this.controllerRoles.map((role) => role.roleName),
      auditLog: this.dataService.comments.comment ? this.dataService.comments : comments
    }).subscribe()
  }

  private paste(): void {
    if (this.preferences.auditLog && !this.dataService.comments.comment) {
      let comments = {
        radio: 'predefined',
        type: 'Roles',
        operation: 'Paste',
        name: ''
      };
      this.dataService.copiedObject.roles.forEach((value, key) => {
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
        nzAutofocus: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          if (result.isChecked) {
            this.dataService.comments = result;
          }
          this._paste(result);
        }
      });
    } else {
      this._paste(this.dataService.comments);
    }
  }

  private _paste(comments): void {
    this.pasteRole(comments);
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
        value.roleName = key;
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
    if (role.controllers) {
      role.controllers.forEach((id) => {
        this.coreService.post('iam/permissions', {
          roleName: role.roleName,
          controllerId: id,
          identityServiceName: role.identityServiceName
        }).subscribe({
          next: (res) => {
            this.storePermission({
              roleName: role.roleName,
              controllerId: id,
              permissions: res.permissions,
              identityServiceName: this.identityServiceName,
              auditLog: comments
            });
          }
        });
      });
    } else if (role.permissions) {
      this.storePermission({
        roleName: role.roleName,
        controllerId: '',
        permissions: role.permissions.joc.concat(role.permissions.controllerDefaults),
        identityServiceName: this.identityServiceName,
        auditLog: comments
      });
    }
  }

  private storePermission(obj): void {
    this.coreService.post('iam/permissions/store', obj).subscribe();
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
        .subscribe((params: any) => {
          this.selectUser(params.account);
        });
    }
  }
}
