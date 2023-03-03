import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { isEqual, clone } from 'underscore';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { ConfirmModalComponent } from '../../../components/comfirm-modal/confirm.component';
import { CommentModalComponent } from '../../../components/comment-modal/comment.component';
import { AuthService } from '../../../components/guard';
import { CoreService } from '../../../services/core.service';
import { DataService } from '../data.service';

declare var $: any;
declare var d3: any;

// Permission Modal
@Component({
  selector: 'app-permission-modal-content',
  templateUrl: 'permission-modal.html'
})
export class PermissionModalComponent implements OnInit {
  @Input() rolePermissions: any;
  @Input() userDetail: any;
  @Input() controllerName: any;
  @Input() roleName: any;
  @Input() oldPermission: any;
  @Input() currentPermission: any;
  @Input() permissionOptions: any;
  @Input() add;

  submitted = false;
  isCovered = false;
  display: any;
  required = false;
  comments: any = {};

  constructor(public activeModal: NzModalRef, private dataService: DataService, public coreService: CoreService) {
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
    if (!this.add) {
      let flag = false;
      for (const i in this.permissionOptions) {
        if (this.permissionOptions[i] === this.currentPermission.permissionPath) {
          flag = true;
          break;
        }
      }
      if (!flag) {
        this.permissionOptions = [this.currentPermission.permissionPath].concat(this.permissionOptions)
      }
    }
  }

  checkCovered(currentPermission): void {
    if (!this.add) {
      if (currentPermission.permissionPath.indexOf(currentPermission.permissionLabel) > -1) {
        return;
      }
    }
    this.isCovered = false;
    this.rolePermissions.forEach((permission1) => {
      if (currentPermission.permissionPath.trim() && currentPermission.permissionPath.trim().indexOf(permission1.permissionPath) !== -1 &&
        ((currentPermission.permissionPath.trim().length > permission1.permissionPath.length && currentPermission.permissionPath.trim().substring(permission1.permissionPath.length, permission1.permissionPath.length + 1) === ':') || currentPermission.permissionPath.trim().length == permission1.permissionPath.length) &&
        ((currentPermission.excluded && permission1.excluded) || (!currentPermission.excluded && !permission1.excluded))) {
        this.isCovered = true;
      }
    });
  }

  onSubmit(obj): void {
    const _obj = clone(obj);
    delete _obj.permissionLabel;
    this.submitted = true;
    const request: any = {
      identityServiceName: sessionStorage.identityServiceName,
      auditLog: {}
    };
    this.coreService.getAuditLogObj(this.comments, request.auditLog);
    if (this.comments.isChecked) {
      this.dataService.comments = this.comments;
    }

    const URL = this.add ? 'iam/permissions/store' : 'iam/permission/rename';
    request.controllerId = this.controllerName;
    request.roleName = this.roleName;
    if (this.add) {
      request.permissions = [_obj];
    } else {
      request.oldPermissionPath = obj.permissionLabel;
      request.newPermission = _obj;
    }
    this.coreService.post(URL, request).subscribe({
      next: () => {
        this.activeModal.close('DONE');
      }, error: () => {
        this.submitted = false;
      }
    });
  }
}

// Folder Modal
@Component({
  selector: 'app-folder-modal-content',
  templateUrl: 'folder-modal.html'
})
export class FolderModalComponent implements OnInit {
  @Input() userDetail: any;
  @Input() currentFolder: any;
  @Input() controllerName: any;
  @Input() roleName: any;
  @Input() folderArr: any;
  @Input() oldFolder: any;
  @Input() newFolder = false;

  nodes = [];
  submitted = false;
  folderObj: any = {paths: []};
  schedulerIds: any;
  display: any;
  required = false;
  comments: any = {};

  @ViewChild('treeSelectCtrl', {static: false}) treeSelectCtrl;

  constructor(public activeModal: NzModalRef, private coreService: CoreService, private dataService: DataService,
              private authService: AuthService) {
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
    this.schedulerIds = JSON.parse(this.authService.scheduleIds);
    if (this.folderArr && this.folderArr.length > 0) {
      this.folderObj.paths = this.folderArr.map((folder) => folder.folder);
    } else {
      this.folderObj.paths = [];
    }
    this.getFolderTree();
  }

  onSubmit(obj): void {
    this.submitted = true;
    const request: any = {
      identityServiceName: sessionStorage.identityServiceName,
      auditLog: {}
    };
    this.coreService.getAuditLogObj(this.comments, request.auditLog);
    if (this.comments.isChecked) {
      this.dataService.comments = this.comments;
    }

    const URL = this.newFolder ? 'iam/folders/store' : 'iam/folder/rename';
    request.controllerId = this.controllerName;
    request.roleName = this.roleName;
    if (this.newFolder) {
      request.folders = [];
      if (this.folderObj.paths && this.folderObj.paths.length > 0) {
        this.folderObj.paths.forEach((path) => {
          request.folders.push({folder: path, recursive: obj.recursive});
        });
      }
    } else {
      request.oldFolderName = this.oldFolder.folder;
      request.newFolder = {folder: obj.folder, recursive: obj.recursive};
    }
    this.coreService.post(URL, request).subscribe({
      next: () => {
        this.activeModal.close('DONE');
      }, error: () => {
        this.submitted = false;
      }
    });
  }

  displayWith(data): string {
    return data.key;
  }

  onKeyPress($event): void {
    if ($event.which === '13' || $event.which === 13 || $event.which === '32' || $event.which === 32) {
      let path = $event.target.value;
      if (this.folderObj.paths.indexOf(path) === -1) {
        if (this.treeSelectCtrl) {
          const node = this.treeSelectCtrl.getTreeNodeByKey(path);
          if (node) {
            this.folderObj.paths.push(path);
            node.isSelected = true;
          } else {
            if (path.substring(0, 1) != '/') {
              path = '/' + path;
            }
            const obj = {
              name: path,
              title: path,
              key: path,
              isSelected: true,
              isLeaf: true,
              notExist: true,
              path
            };
            this.folderObj.paths.push(path);
            this.nodes.push(obj);
            this.folderObj.paths = [...this.folderObj.paths];
          }
          this.nodes = [...this.nodes];
        }
      }
      $event.preventDefault();
    }
  }

  private getFolderTree(): void {
    this.coreService.post('tree', {
      forDescriptors: true,
      forInventory: true,
      types: ["DESCRIPTORFOLDER", "FOLDER"]
    }).subscribe(res => {
      this.nodes = this.coreService.prepareTree(res, true);
      if (this.nodes.length > 0) {
        this.nodes[0].expanded = true;
      }
    });
  }

  selectFolder(node, $event): void {
    if (!node.origin.isLeaf) {
      node.isExpanded = !node.isExpanded;
    }
    $event.stopPropagation();
  }

  addFolder(path): void {
    if (this.folderObj.paths.indexOf(path) === -1) {
      this.folderObj.paths.push(path);
      this.folderObj.paths = [...this.folderObj.paths];
    }
  }

  remove(path): void {
    this.folderObj.paths.splice(this.folderObj.paths.indexOf(path), 1);
    this.folderObj.paths = [...this.folderObj.paths];
  }
}

// Main Component
@Component({
  selector: 'app-permissions',
  templateUrl: './permissions.component.html'
})
export class PermissionsComponent implements OnInit, OnDestroy {
  controllerName;
  roleName;
  roles: any = [];
  userPermission: any = {};
  preferences: any = {};
  permissions;
  rolePermissions: any = [];
  permissionOptions = [];
  pageView: string;
  permissionNodes: any = [];
  permissionArr: any = [];
  previousPermission: any = [];
  originalPermission: any = [];
  folderArr: any = [];
  permission: any = [];
  count = 0;
  showPanel1 = false;
  showPanel2 = false;
  userDetail: any = {};
  svg;
  root: any = {};
  boxWidth = 180;
  boxHeight = 30;
  duration = 700;
  ht = 700;
  width = window.innerWidth - 100;
  isReset = false;
  nodes: any;
  tree: any;
  identityServiceName: string;
  identityServiceType: string;

  subscription1: Subscription;
  subscription2: Subscription;

  constructor(private coreService: CoreService, private route: ActivatedRoute,
    private modal: NzModalService, private dataService: DataService, private authService: AuthService) {

    this.subscription1 = this.dataService.functionAnnounced$.subscribe(res => {
      if (res === 'ADD_FOLDER') {
        this.addFolder();
      } else if (res === 'ADD_PERMISSION') {
        this.addPermission();
      } else if (res === 'CHANGE_VIEW') {
        this.pageView = JSON.parse(localStorage.views).permission;
        if (this.pageView === 'grid') {
          setTimeout(() => {
            this.drawTree(this.permissionNodes[0][0], '');
          }, 5);
        }
      }
    });
  }

  ngOnInit(): void {
    this.pageView = JSON.parse(localStorage.views).permission;
    this.userPermission = this.authService.permission ? JSON.parse(this.authService.permission) : {};
    this.preferences = sessionStorage.preferences ? JSON.parse(sessionStorage.preferences) : {};
    this.identityServiceName = sessionStorage.identityServiceName;
    this.identityServiceType = sessionStorage.identityServiceType;
    this.subscription2 = this.route.params.subscribe(params => {
      this.controllerName = params['controller.controller'];
      if (this.controllerName === 'default') {
        this.controllerName = '';
      }
      this.roleName = params['role.role'];
    });
    this.getPermissions();
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
  }

  private getFolderList(): void {
    this.coreService.post('iam/folders', {
      identityServiceName: this.identityServiceName,
      controllerId: this.controllerName,
      roleName: this.roleName
    }).subscribe((res: any) => {
      this.folderArr = res.folders;
    });
  }

  private getPermissionList(): void {
    this.coreService.post('iam/permissions', {
      identityServiceName: this.identityServiceName,
      controllerId: this.controllerName,
      roleName: this.roleName
    }).subscribe((res: any) => {
      this.rolePermissions = res.permissions;
      this.originalPermission = clone(this.rolePermissions);
      this.preparePermissionJSON();
      this.preparePermissionOptions();
      this.switchTree();
    })
  }

  getPermissions(): void {
    this.coreService.post('authentication/permissions', {}).subscribe(res => {
      this.permissions = this.coreService.clone(res.sosPermissions);
      if (this.controllerName) {
        this.permissions = this.permissions.filter((val) => {
          return !val.match(':joc:');
        });
      }

      this.getFolderList();
      this.getPermissionList();
    });
  }

  addFolder(): void {
    let folder = {folder: '', recursive: true};
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: FolderModalComponent,
      nzComponentParams: {
        currentFolder: folder,
        userDetail: this.userDetail,
        newFolder: true,
        controllerName: this.controllerName,
        roleName: this.roleName,
        folderArr: []
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        if (result !== 'DONE') {
          this.folderArr = result;
        } else {
          this.getFolderList();
        }
      }
    });
  }

  editFolder(folder): void {
    let tempFolder = clone(folder);
    tempFolder.folder = tempFolder.folder == '' ? '/' : tempFolder.folder;
    tempFolder.folderName = tempFolder.folder;
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: FolderModalComponent,
      nzComponentParams: {
        currentFolder: tempFolder,
        userDetail: this.userDetail,
        controllerName: this.controllerName,
        roleName: this.roleName,
        folderArr: this.folderArr,
        oldFolder: folder
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        if (result !== 'DONE') {
          this.folderArr = result;
        } else {
          this.getFolderList();
        }
      }
    });
  }

  deleteFolder(folder): void {
    if (this.preferences.auditLog && !this.dataService.comments.comment) {
      let comments = {
        radio: 'predefined',
        type: 'Folder',
        operation: 'Delete',
        name: folder.folder
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
          this.folderArr.splice(this.folderArr.indexOf(folder), 1);
          this.deleteFolderAPI(folder.folder, result);
        }
      });
    } else {
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: ConfirmModalComponent,
        nzComponentParams: {
          title: 'delete',
          message: 'deleteFolder',
          type: 'Delete',
          objectName: folder.folder
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          this.folderArr.splice(this.folderArr.indexOf(folder), 1);
          this.deleteFolderAPI(folder.folder, this.dataService.comments);
        }
      });
    }
  }

  private deleteFolderAPI(path, comments): void {
    const request: any = {
      identityServiceName: this.identityServiceName,
      controllerId: this.controllerName,
      roleName: this.roleName,
      folderNames: [path]
    };
    if (comments) {
      request.auditLog = {};
      this.coreService.getAuditLogObj(comments, request.auditLog);
      if (comments.isChecked) {
        this.dataService.comments = comments;
      }
    }
    this.coreService.post('iam/folders/delete', request).subscribe();
  }

  addPermission(): void {
    let permission = {permissionPath: '', excluded: false};
    this.modal.create({
      nzTitle: undefined,
      nzContent: PermissionModalComponent,
      nzClassName: 'lg',
      nzComponentParams: {
        currentPermission: permission,
        permissionOptions: this.permissionOptions,
        rolePermissions: this.rolePermissions,
        userDetail: this.userDetail,
        controllerName: this.controllerName,
        roleName: this.roleName,
        add: true
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    }).afterClose.subscribe(result => {
      if (result === 'DONE') {
        this.getPermissionList();
      }
    })
  }

  editPermission(permission): void {
    let tempPermission = clone(permission);
    tempPermission.permissionLabel = permission.permissionPath;
    this.modal.create({
      nzTitle: undefined,
      nzContent: PermissionModalComponent,
      nzClassName: 'lg',
      nzComponentParams: {
        currentPermission: tempPermission,
        oldPermission: permission,
        permissionOptions: this.permissionOptions,
        rolePermissions: this.rolePermissions,
        userDetail: this.userDetail,
        controllerName: this.controllerName,
        roleName: this.roleName
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    }).afterClose.subscribe(result => {
      if (result === 'DONE') {
        this.getPermissionList();
      }
    })
  }

  deletePermission(permission): void {
    if (this.preferences.auditLog && !this.dataService.comments.comment) {
      let comments = {
        radio: 'predefined',
        type: 'Permission',
        operation: 'Delete',
        name: permission.permissionPath
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
          this.rolePermissions.splice(this.rolePermissions.indexOf(permission), 1);
          this.deletePermissionAPI(permission, result);
          this.findPermissionObj(this.permissionNodes[0][0], permission.permissionPath);
          this.updateDiagramData();
        }
      });
    } else {
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: ConfirmModalComponent,
        nzComponentParams: {
          title: 'delete',
          message: 'deletePermission',
          type: 'Delete',
          objectName: permission.permissionPath
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          this.rolePermissions.splice(this.rolePermissions.indexOf(permission), 1);
          this.deletePermissionAPI(permission, this.dataService.comments);
          this.findPermissionObj(this.permissionNodes[0][0], permission.permissionPath);
          this.updateDiagramData();
        }
      });
    }
  }

  private deletePermissionAPI(permission, comments): void {
    const request: any = {
      controllerId: this.controllerName,
      roleName: this.roleName,
      identityServiceName: this.identityServiceName,
      permissionPaths: [permission.permissionPath]
    };

    if (comments) {
      request.auditLog = {};
      this.coreService.getAuditLogObj(comments, request.auditLog);
      if (comments.isChecked) {
        this.dataService.comments = comments;
      }
    }
    this.coreService.post('iam/permissions/delete', request).subscribe();
  }

  preparePermissionJSON(): void {
    this.count = 0;
    this.permissionArr = this.permissions;
    for (let i = 0; i < this.permissionArr.length; i++) {
      let nodes = this.permissionArr[i].split(':');
      let arr = [];
      let flag = true, index = 0;
      for (let j = 0; j < nodes.length; j++) {
        let obj = {
          id: ++this.count,
          name: nodes[j],
          permissionPath: this.permissionArr[i].substring(0, this.permissionArr[i].lastIndexOf(nodes[j])),
          icon: j < nodes.length - 1 ? './assets/images/minus.png' : '',
          _parents: j < nodes.length - 1 ? [] : null
        };

        if (this.permissionNodes[0] && this.permissionNodes[0][j]) {
          if (this.permissionNodes[0][j].name == nodes[j]) {
            flag = false;
            index = j;
          } else {
            if (arr.length == 0) {
              arr.push(obj);
            } else if (arr.length > 0) {
              this.recursiveUpdate(arr[0], obj);
            }
          }
        } else {
          if (arr.length == 0) {
            arr.push(obj);
          } else if (arr.length > 0) {
            this.recursiveUpdate(arr[0], obj);
          }
        }
      }
      if (flag) {
        this.permissionNodes.push(arr);
      } else {
        this.recursiveUpdate1(this.permissionNodes[0][index], arr);
      }

    }
  }

  preparePermissionOptions(): void {
    let temp = this.permissions;
    temp.forEach((option, index) => {
      if (index > 0 && (option.split(':')[2] != temp[index - 1].split(':')[2] || option.split(':')[3] != temp[index - 1].split(':')[3])) {
        this.permissionOptions.push('---------------------------------------------------------------------------------');
      }
      this.permissionOptions.push(option);
    });

  }

  recursiveUpdate(arr, obj): void {
    if (arr._parents.length === 0) {
      arr._parents.push(obj);
    } else {
      this.recursiveUpdate(arr._parents[0], obj);
    }
  }

  recursiveUpdate1(permission, arr): void {
    let flag = true;
    if (arr[0]._parents) {
      for (let y = 0; y < permission._parents.length; y++) {
        if (arr[0].name == permission._parents[y].name) {
          flag = false;
          this.recursiveUpdate1(permission._parents[y], arr[0]._parents);
        }
      }
    }
    if (flag) {
      permission._parents.push(arr[0]);
    }
  }

  findPermissionObj(permissionNodes, permission): void {
    if (permissionNodes._parents) {
      for (let i = 0; i < permissionNodes._parents.length; i++) {
        if ((permissionNodes._parents[i].permissionPath + permissionNodes._parents[i].name) == permission) {
          permissionNodes._parents[i].selected = false;
          this.unSelectedNode(permissionNodes._parents[i], permissionNodes._parents[i].excluded);
          if (permissionNodes._parents[i].excluded) {
            permissionNodes._parents[i].greyedBtn = false;
            permissionNodes._parents[i].excluded = false;
          }
          break;
        }
        this.findPermissionObj(permissionNodes._parents[i], permission);
      }
    } else {
      if ((permissionNodes.permissionPath + permissionNodes.name) == permission) {
        permissionNodes.selected = false;
        if (permissionNodes.excluded) {
          permissionNodes.greyedBtn = false;
          permissionNodes.excluded = false;
        }
      }
    }
  }

  selectedNode(permission_node, flag): void {
    if (permission_node && permission_node._parents) {
      for (let j = 0; j < permission_node._parents.length; j++) {
        permission_node._parents[j].greyed = true;
        permission_node._parents[j].selected = false;
        permission_node._parents[j].isSelected = permission_node.isSelected;
        if (flag) {
          permission_node._parents[j].greyedBtn = true;
          permission_node._parents[j].excluded = true;
        }
        this.selectedNode(permission_node._parents[j], flag);
      }
    }
  }

  unSelectedNode(permission_node, flag): void {
    if (permission_node && permission_node._parents) {
      for (let j = 0; j < permission_node._parents.length; j++) {
        permission_node._parents[j].greyed = false;
        permission_node._parents[j].selected = false;
        permission_node._parents[j].isSelected = permission_node.isSelected;
        if (flag) {
          permission_node._parents[j].greyedBtn = false;
          permission_node._parents[j].excluded = false;
        }
        this.unSelectedNode(permission_node._parents[j], flag);
      }
    }
  }

  checkPermissionListRecursively(permission_node, list): void {
    if (permission_node && permission_node._parents) {
      for (let j = 0; j < permission_node._parents.length; j++) {
        permission_node._parents[j].greyed = !list.excluded;
        permission_node._parents[j].selected = false;
        permission_node._parents[j].excluded = list.excluded;
        if (permission_node._parents[j].excluded) {
          permission_node._parents[j].greyedBtn = true;
        }
        if (permission_node.isSelected) {
          permission_node._parents[j].isSelected = true;
        }
        this.checkPermissionListRecursively(permission_node._parents[j], list);
      }
    }
  }

  checkPermissionList(permission_node, list): void {
    if (list && list.length > 0) {
      if (permission_node && permission_node._parents) {
        for (let j = 0; j < permission_node._parents.length; j++) {
          for (let i = 0; i < list.length; i++) {
            if (list[i].permissionPath.match(permission_node._parents[j].permissionPath + permission_node._parents[j].name)) {
              permission_node._parents[j].isSelected = true;
            }
            if (list[i].permissionPath == (permission_node._parents[j].permissionPath + '' + permission_node._parents[j].name)) {
              permission_node._parents[j].greyed = false;
              permission_node._parents[j].selected = !list[i].excluded;
              permission_node._parents[j].excluded = list[i].excluded;
              if (!permission_node.excluded) {
                permission_node._parents[j].excludedParent = list[i].excluded;
              }
              this.checkPermissionListRecursively(permission_node._parents[j], list[i]);
              list.splice(i, 1);
              break;
            }
          }
          this.checkPermissionList(permission_node._parents[j], list);
        }
      } else {
        for (let i = 0; i < list.length; i++) {
          if (list[i].permissionPath.match(permission_node.permissionPath + permission_node.name)) {
            permission_node.isSelected = true;
          }
          if (list[i].permissionPath == (permission_node.permissionPath + '' + permission_node.name)) {
            permission_node.greyed = false;
            permission_node.selected = !list[i].excluded;
            permission_node.excluded = list[i].excluded;
            list.splice(i, 1);
            break;
          }
        }
      }
    }
  }

  selectedExcludeNode(permission_node): void {
    if (permission_node && permission_node._parents) {
      for (let j = 0; j < permission_node._parents.length; j++) {
        permission_node._parents[j].greyedBtn = true;
        permission_node._parents[j].excluded = true;
        permission_node._parents[j].excludedParent = false;
        permission_node._parents[j].isSelected = permission_node.isSelected;
        this.selectedExcludeNode(permission_node._parents[j]);
      }
    }
  }

  unSelectedExcludeNode(permission_node): void {
    if (permission_node && permission_node._parents) {
      for (let j = 0; j < permission_node._parents.length; j++) {
        permission_node._parents[j].greyedBtn = false;
        permission_node._parents[j].excluded = false;
        permission_node._parents[j].excludedParent = false;
        permission_node._parents[j].isSelected = permission_node.isSelected;
        this.unSelectedExcludeNode(permission_node._parents[j]);
      }
    }
  }

  switchTree(): void {
    if (!this.svg) {
      this.drawTree(this.permissionNodes[0][0], '');
    }
  }

  saveInfo(comments): void {
    const request: any = {
      accounts: this.userDetail.accounts,
      roles: this.userDetail.roles,
      main: this.userDetail.main,
      identityServiceName: this.userDetail.identityServiceName
    };
    if (comments) {
      request.auditLog = {};
      this.coreService.getAuditLogObj(comments, request.auditLog);
      if (comments.isChecked) {
        this.dataService.comments = comments;
      }
    }
    this.coreService.post('authentication/auth/store', request).subscribe(() => {
      this.dataService.announceFunction('RELOAD');
    });
  }

  private savePermission(comments, temp = []): void {
    const request: any = {
      controllerId: this.controllerName,
      roleName: this.roleName,
      identityServiceName: this.identityServiceName
    };

    if (comments) {
      request.auditLog = {};
      this.coreService.getAuditLogObj(comments, request.auditLog);
      if (comments.isChecked) {
        this.dataService.comments = comments;
      }
    }
    if (this.previousPermission.length > 0 || temp.length > 0) {
      const permissionPaths = [];
      const arr = temp.length > 0 ? temp : this.previousPermission[this.previousPermission.length - 1];
      if (arr && arr.length > 0) {
        for (let i in arr) {
          let flag = false;
          for (let j in this.rolePermissions) {
            if (arr[i].permissionPath === this.rolePermissions[j].permissionPath) {
              flag = true;
              break;
            }
          }
          if (!flag && permissionPaths.indexOf(arr[i].permissionPath) === -1) {
            permissionPaths.push(arr[i].permissionPath)
          }
        }
      }
      if (permissionPaths.length > 0) {
        this.coreService.post('iam/permissions/delete', {...request, permissionPaths}).subscribe();
      }
    }
    if (this.rolePermissions.length > 0) {
      this.coreService.post('iam/permissions/store', {...request, permissions: this.rolePermissions}).subscribe();
    }
  }

  updatePermissionList(comments, temp = []): void {
    this.unSelectedNode(this.permissionNodes[0][0], true);
    this.checkPermissionList(this.permissionNodes[0][0], clone(this.rolePermissions));
    this.updateDiagramData();
    this.savePermission(comments, temp);
  }

  undoPermission(): void {
    if (this.preferences.auditLog && !this.dataService.comments.comment) {
      let comments = {
        radio: 'predefined',
        type: 'Permission',
        operation: 'Store',
        name: 'sos:product:*'
      };
      this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzClassName: 'lg',
        nzComponentParams: {
          comments
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      }).afterClose.subscribe(result => {
        if (result) {
          this._undoPermission(result);
        }
      });
    } else {
      this._undoPermission(this.dataService.comments);
    }
  }

  private _undoPermission(comments): void {
    const tempPermission = this.coreService.clone(this.rolePermissions);
    this.rolePermissions = this.previousPermission[this.previousPermission.length - 1];
    this.previousPermission.splice(this.previousPermission.length - 1, 1);
    if (isEqual(this.originalPermission, this.rolePermissions)) {
      this.isReset = false;
    }
    this.updatePermissionList(comments, tempPermission);
  }

  resetPermission(): void {
    if (this.preferences.auditLog && !this.dataService.comments.comment) {
      let comments = {
        radio: 'predefined',
        type: 'Permission',
        operation: 'Store',
        name: 'sos:product:*'
      };
      this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzClassName: 'lg',
        nzComponentParams: {
          comments
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      }).afterClose.subscribe(result => {
        if (result) {
          this._resetPermission(result);
        }
      });
    } else {
      this._resetPermission(this.dataService.comments);
    }
  }

  private _resetPermission(comments): void {
    const tempPermission = this.coreService.clone(this.rolePermissions);
    this.rolePermissions = clone(this.originalPermission);
    this.previousPermission = [];
    this.isReset = false;
    this.updatePermissionList(comments, tempPermission);
  }

  expandAll(): void {
    this.drawTree(this.permissionNodes[0][0], 'EXPANDALL');
  }

  collapseAll(): void {
    this.drawTree(this.permissionNodes[0][0], 'COLLAPSEALL');
  }

  expandSelected(): void {
    this.drawTree(this.permissionNodes[0][0], 'EXPANDSELECTED');
  }

  collapseUnselected(): void {
    this.drawTree(this.permissionNodes[0][0], 'COLLAPSEUNSELECTED');
  }

  updateDiagramData(): void {
    this.drawTree(this.permissionNodes[0][0], 'UPDATEDDIAGRAM');
  }

  drawTree(json, type): void {
    let nodes;
    const self = this;
    let _temp = [];
    let endNodes2 = {
      leftMost: {x: 0, y: 0},
      rightMost: {x: 0, y: 0},
      topMost: {x: 0, y: 0},
      lowerMost: {x: 0, y: 0}
    };
    if (type === 'EXPANDALL') {
      nodes = this.nodes;
      expandAll();
      return;
    } else if (type === 'COLLAPSEALL') {
      nodes = this.nodes;
      collapseAll();
      return;
    } else if (type === 'EXPANDSELECTED') {
      nodes = this.nodes;
      nodes.forEach((permissionNodes) => {
        if (permissionNodes.name == 'sos') {
          expandSelected(permissionNodes);
        }
      });
      draw(nodes[0], calculateTopMost());
      return;
    } else if (type === 'COLLAPSEUNSELECTED') {
      nodes = this.nodes;
      nodes.forEach((permissionNodes) => {
        if (permissionNodes.name == 'sos') {
          collapseUnselected(permissionNodes);
        }
      });
      draw(nodes[0], calculateTopMost());
      return;
    } else if (type === 'UPDATEDDIAGRAM') {
      nodes = this.nodes;
      updateDiagramData();
      return;
    }

    this.svg = d3.select('#mainTree').append('svg')
      .attr('width', self.width)
      .attr('height', self.ht - 10)
      .append('g')
      .attr('transform', 'translate(150,250)');

    self.tree = d3.layout.tree()
      .nodeSize([100, 250])
      .separation(() => {
        return 0.5;
      })
      .children((permission_node) => {
        if (permission_node.collapsed) {

        } else {
          return permission_node._parents;
        }
      });

    // Start with only the first few generations showing
    json._parents.forEach((gen2) => {
      gen2._parents.forEach((gen3) => {
        collapse(gen3);
      });
    });

    self.root = json;
    self.root.x0 = 0;
    self.root.y0 = 0;
    let _pList = clone(self.rolePermissions);
    self.checkPermissionList(self.root, _pList);

    draw(self.root, 0);

    function expandAll() {
      nodes.forEach((permission_node) => {
        if (permission_node.name === 'sos') {
          expand(permission_node);
        }
      });
      const dom = $('#mainTree svg');
      dom.attr('height', 7150);
      dom.attr('width', 2010);
      draw(nodes[0], calculateTopMost());
    }

    function expand(permission_node) {
      if (permission_node.collapsed) {
        permission_node.collapsed = false;
        if (permission_node.icon) {
          permission_node.icon = './assets/images/minus.png';
        }
      }
      if (permission_node._parents) {
        permission_node._parents.forEach(expand);
      }
    }

    function collapseAll() {
      nodes.forEach((permission_node) => {
        if (permission_node.name === 'sos') {
          collapseNode(permission_node);
        }
      });
      const dom = $('#mainTree svg');
      dom.attr('width', self.width);
      dom.attr('height', self.ht);
      $('#mainTree svg g').attr('transform', 'translate(150,250)');
      draw(nodes[0], 0);
    }

    function collapseNode(permission_node) {
      if (!permission_node.collapsed) {
        permission_node.collapsed = true;
        if (permission_node.icon) {
          permission_node.icon = './assets/images/plus.png';
        }
      }
      if (permission_node._parents) {
        permission_node._parents.forEach(collapseNode);
      }
    }

    function expandSelected(permissionNodes) {
      if (permissionNodes.isSelected || permissionNodes.name == 'sos') {
        permissionNodes.collapsed = false;
        if (permissionNodes.icon) {
          permissionNodes.icon = './assets/images/minus.png';
        }
      }
      if (permissionNodes._parents) {
        permissionNodes._parents.forEach(expandSelected);
      }
    }

    function collapseUnselected(permissionNodes) {
      if (!permissionNodes.isSelected && permissionNodes.name != 'sos') {
        permissionNodes.collapsed = true;
        if (permissionNodes.icon) {
          permissionNodes.icon = './assets/images/plus.png';
        }
      }
      if (permissionNodes._parents) {
        permissionNodes._parents.forEach(collapseUnselected);
      }
    }

    function draw(source, diff) {
      nodes = self.tree.nodes(self.root);
      checkNodes(nodes, self.rolePermissions);
      nodes.forEach((d) => {
        if (diff > 0) {
          d.x = d.x + diff;
        }
      });

      let links = self.tree.links(nodes);

      // Update links
      let link = self.svg.selectAll('path.link')
        .data(links, (d) => {
          return d.target.id;
        });

      link.enter().append('path')
        .attr('class', 'link')
        .attr('d', (d) => {
          let o = {x: source.x0, y: (source.y0 + self.boxWidth / 2)};
          return transitionElbow({source: o, target: o});
        });

      // Update the old links positions
      link.transition()
        .duration(self.duration)
        .attr('d', elbow);

      link.exit()
        .transition()
        .duration(self.duration)
        .attr('d', (d) => {
          let o = {x: source.x, y: (source.y + self.boxWidth / 2)};
          return transitionElbow({source: o, target: o});
        })
        .remove();
      // Update nodes
      let node = self.svg.selectAll('g.permission_node')
        .data(nodes, (permission_node) => {
          return permission_node.id;
        });

      // Add any new nodes
      let nodeEnter = node.enter().append('g')
        .attr('class', 'permission_node')
        .style('cursor', (d) => {
          if (d.name == 'sos') {
            return 'default';
          }
          return d.greyed ? 'default' : 'pointer';
        })
        .attr('transform', () => {
          return 'translate(' + (source.y0 + self.boxWidth / 2) + ',' + source.x0 + ')';
        });


      nodeEnter.append('image')
        .attr('xlink:href', (d) => {
          return d.icon;
        })
        .attr('class', 'img')
        .attr('x', '-12px')
        .attr('y', '-12px')
        .attr('width', '24px')
        .attr('height', '24px')
        .on('click', togglePermission);

      nodeEnter.append('rect')
        .style('fill', (d) => {
          return d.excluded ? d.excludedParent ? '#9E9E9E' : '#eee' : d.selected ? '#7fbfff' : d.greyed ? '#cce5ff' : '#fff';
        })
        .on('click', selectPermission)
        .attr({
          x: 0,
          y: 0,
          width: 20,
          height: 0
        });

      nodeEnter.append('image')
        .attr('xlink:href', (d) => {
          return d.excluded ? './assets/images/permission-minus.png' : './assets/images/permission-plus.png';
        })
        .attr('class', 'img exclude-img')
        .attr('id', (d) => {
          if (d.permissionPath) {
            return d.permissionPath.replace(/:/g, '-') + d.name.replace(/-/g, '');
          } else {
            return d.name.replace(/-/g, '');
          }
        })
        .attr('x', '-80')
        .attr('y', '-10')
        .attr('width', '10px')
        .attr('height', '20px')
        .style('cursor', (d) => {
          if (d.name == 'sos') {
            return 'default';
          }
          return d.greyedBtn ? 'default' : 'pointer';
        })
        .on('click', toggleExclude);

      // Draw the permission_node's name and position it inside the box
      nodeEnter.append('image')
        .attr('x', '76')
        .attr('y', '-15')
        .attr('width', '13px')
        .attr('height', '13px')
        .attr('class', 'img triangle');


      // Draw the permission_node's name and position it inside the box
      nodeEnter.append('text')
        .attr('dx', 0)
        .attr('dy', 4)
        .attr('text-anchor', 'start')
        .attr('class', 'name')
        .text((d) => {
          return d.name;
        })
        .on('click', selectPermission)
        .style('fill-opacity', 0);

      // Update the position of both old and new nodes
      let nodeUpdate = node.transition()
        .duration(self.duration)
        .attr('transform', (d) => {
          return 'translate(' + d.y + ',' + d.x + ')';
        });

      // Grow boxes to their proper size
      nodeUpdate.select('rect')
        .attr({
          x: -(self.boxWidth / 2),
          y: -(self.boxHeight / 2),
          width: self.boxWidth,
          height: self.boxHeight
        });

      nodeUpdate.select('image')
        .attr('xlink:href', (d) => {
          return d.icon;
        })
        .attr('x', '90px')
        .attr('y', '-12px')
        .attr('width', '15px')
        .attr('height', '23px');


      // Move text to it's proper position
      nodeUpdate.select('text')
        .attr('dx', -(self.boxWidth / 2) + 25)
        .style('fill-opacity', 1);

      // Remove nodes we aren't showing anymore
      let nodeExit = node.exit()
        .transition()
        .duration(self.duration)

        // Transition exit nodes to the source's position
        .attr('transform', (d) => {
          return 'translate(' + (source.y + self.boxWidth / 2) + ',' + source.x + ')';
        })
        .remove();

      // Shrink boxes as we remove them
      nodeExit.select('rect')
        .attr({
          x: 0,
          y: 0,
          width: 0,
          height: 0
        });

      // Fade out the text as we remove it
      nodeExit.select('text')
        .style('fill-opacity', 0)
        .attr('dx', 0);

      // Stash the old positions for transition.
      nodes.forEach((permission_node) => {
        permission_node.x0 = permission_node.x;
        permission_node.y0 = permission_node.y;
      });

      toggleTriangle();
      setTimeout(() => {
        scrollToLast();
      }, 850);
    }

    function calculateTopMost() {
      endNodes2 = {
        leftMost: {x: 0, y: 0},
        rightMost: {x: 0, y: 0},
        topMost: {x: 0, y: 0},
        lowerMost: {x: 0, y: 0}
      };

      nodes = self.tree.nodes(self.root);
      nodes.forEach((node) => {
        if (!endNodes2.rightMost.x || (endNodes2.rightMost.x <= node.y)) {
          endNodes2.rightMost.x = node.y;
          endNodes2.rightMost.y = node.x;
        }
        if (typeof endNodes2.leftMost.x == 'undefined' || (endNodes2.leftMost.x > node.y)) {
          endNodes2.leftMost.x = node.y;
          endNodes2.leftMost.y = node.x;
        }
        if (!endNodes2.topMost.y || (endNodes2.topMost.y >= node.x)) {
          endNodes2.topMost.x = node.y;
          endNodes2.topMost.y = node.x;
        }
        if (!endNodes2.lowerMost.y || (endNodes2.lowerMost.y <= node.x)) {
          endNodes2.lowerMost.x = node.y;
          endNodes2.lowerMost.y = node.x;
        }
      });

      let diff = 0;
      if (endNodes2.topMost.y < -225) {
        diff = (-endNodes2.topMost.y - 225);
      }
      checkWindowSize();
      return diff;
    }

    function checkWindowSize() {
      let dom = $('#mainTree svg');
      dom.attr('width', (endNodes2.rightMost.x - endNodes2.leftMost.x) + 520);
      if (dom.attr('width') > 2100) {
        dom.attr('width', 2100);
      }
      dom.attr('height', (endNodes2.lowerMost.y - endNodes2.topMost.y + 300));
      if (dom.attr('height') < self.ht) {
        dom.attr('height', self.ht);
      }
    }

    function scrollToLast() {
      const dom = $('mainTree');
      if (dom.width() < (endNodes2.rightMost.x + 284)) {
        dom.animate({
          scrollTop: endNodes2.rightMost.y,
          scrollLeft: endNodes2.rightMost.x
        }, 0);
      }
    }

    /**
     * Update a permission_node's state when they are clicked.
     */
    function togglePermission(permission_node) {
      if (self.userPermission.joc && self.userPermission.joc.administration.accounts.manage) {
        if (permission_node.icon) {
          permission_node.icon = './assets/images/minus.png';
        }
        if (permission_node.collapsed) {
          permission_node.collapsed = false;
        } else {
          collapse(permission_node);
        }

        draw(permission_node, calculateTopMost());
      }
    }

    function generatePermissionList(permission) {
      if (permission._parents) {
        for (let i = 0; i < permission._parents.length; i++) {
          if (permission._parents[i]) {
            if (permission._parents[i].selected || (permission._parents[i].excluded && !permission._parents[i].greyedBtn)) {
              let obj = {
                permissionPath: permission._parents[i].permissionPath + '' + permission._parents[i].name,
                excluded: permission._parents[i].excluded
              };

              if (_temp.indexOf(obj) == -1) {
                _temp.push(obj);
              }
            }
            generatePermissionList(permission._parents[i]);
          }
        }
      }
    }

    function setParentSelected(permission_node) {
      permission_node.parent.isSelected = true;
      if (permission_node.parent && permission_node.parent.parent) {
        setParentSelected(permission_node.parent);
      }
    }

    function selectPermission(permission_node) {
      if (self.userPermission.joc && self.userPermission.joc.administration.accounts.manage) {
        if (self.preferences.auditLog && !self.dataService.comments.comment) {
          let comments = {
            radio: 'predefined',
            type: 'Permission',
            operation: 'Store',
            name: 'sos:product:*'
          };
          const modal = self.modal.create({
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
              savePermission(permission_node, result);
            }
          });
        } else {
          savePermission(permission_node, self.dataService.comments);
        }
      }
    }

    function savePermission(permission_node, comments) {
      let _previousPermissionObj = clone(self.rolePermissions);

      if (!permission_node.greyed && permission_node.name != 'sos') {
        permission_node.selected = !permission_node.selected;
        if (permission_node.selected) {
          permission_node.isSelected = true;
          if (permission_node.parent && !permission_node.parent.isSelected) {
            setParentSelected(permission_node);
          }
          self.selectedNode(permission_node, false);
        } else {
          permission_node.isSelected = false;
          self.unSelectedNode(permission_node, false);
        }
        _temp = [];
        generatePermissionList(self.permissionNodes[0][0]);
        toggleRectangleColour(_temp);
        self.rolePermissions = _temp;
        if (self.previousPermission.length === 10) {
          self.previousPermission.splice(0, 1);
        }
        self.isReset = true;
        self.previousPermission.push(_previousPermissionObj);
        updatePermissionAfterChange(_temp, comments);
      }
    }

    function toggleExclude(permission_node) {
      if (self.userPermission.joc && self.userPermission.joc.administration.accounts.manage) {
        if (self.preferences.auditLog && !self.dataService.comments.comment) {
          let comments = {
            radio: 'predefined',
            type: 'Permission',
            operation: 'Store',
            name: 'sos:product:*'
          };
          const modal = self.modal.create({
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
              saveTogglePermission(permission_node, result);
            }
          });
        } else {
          saveTogglePermission(permission_node, self.dataService.comments)
        }
      }
    }

    function saveTogglePermission(permission_node, comments) {
      let _previousPermissionObj = clone(self.rolePermissions);
      if (!permission_node.greyedBtn && permission_node.name != 'sos') {
        permission_node.excluded = !permission_node.excluded;
        permission_node.excludedParent = !permission_node.excludedParent;
        if (permission_node.excluded) {
          permission_node.isSelected = true;
          if (permission_node.parent && !permission_node.parent.isSelected) {
            setParentSelected(permission_node);
          }
          self.selectedExcludeNode(permission_node);
        } else {
          if (!permission_node.selected) {
            permission_node.isSelected = false;
          }
          self.unSelectedExcludeNode(permission_node);
        }
        _temp = [];
        generatePermissionList(self.permissionNodes[0][0]);
        toggleRectangleColour(_temp);
        self.rolePermissions = _temp;
        if (self.previousPermission.length === 10) {
          self.previousPermission.splice(0, 1);
        }
        self.isReset = true;
        self.previousPermission.push(_previousPermissionObj);
        updatePermissionAfterChange(_temp, comments);
      }
    }

    function updatePermissionAfterChange(temp, comments) {
      self.savePermission(comments);
    }

    function updateDiagramData() {
      toggleRectangleColour(self.rolePermissions);
    }

    function toggleRectangleColour(permissionArr) {
      if (self.svg) {
        self.svg.selectAll('rect')
          .style('fill', (d) => {
            return d.excluded ? d.excludedParent ? '#9E9E9E' : '#eee' : d.selected ? '#7fbfff' : d.greyed ? '#cce5ff' : '#fff';
          });
        self.svg.selectAll('g.permission_node')
          .style('cursor', (d) => {
            if (d.name === 'sos') {
              return 'default';
            }
            return d.greyed ? 'default' : 'pointer';
          });

        self.svg.selectAll('.img.exclude-img')
          .attr('xlink:href', (d) => {
            return d.excluded ? './assets/images/permission-minus.png' : './assets/images/permission-plus.png';
          })
          .style('cursor', (d) => {
            if (d.name === 'sos') {
              return 'default';
            }
            return d.greyedBtn ? 'default' : 'pointer';
          });
        checkNodes(nodes, permissionArr);
        toggleTriangle();
      }
    }

    function checkNodes(_nodes, rolePermissions) {
      let arr = [];
      for (let i = _nodes.length - 1; i >= 0; i--) {
        let flag = false;
        _nodes[i].isAnyChildSelected = false;
        const name = _nodes[i].permissionPath + '' + _nodes[i].name;
        for (let j = 0; j < rolePermissions.length; j++) {
          if (name === rolePermissions[j].permissionPath) {
            flag = true;
            arr.push(name);
            break;
          }
          if (!_nodes[i].greyed && !_nodes[i].selected && !flag) {
            if (!rolePermissions[j].excluded && rolePermissions[j].permissionPath.indexOf(name + ':') > -1) {
              _nodes[i].isAnyChildSelected = true;
              break;
            }
          }
        }
      }
      if (arr.length > 0) {
        for (let i = 0; i < _nodes.length; i++) {
          const name = _nodes[i].permissionPath + '' + _nodes[i].name;
          for (let j = 0; j < arr.length; j++) {
            if (arr[j].indexOf(name + ':') > -1) {
              _nodes[i].isAnyChildSelected = false;
              break;
            }
          }
        }
      }
    }

    function toggleTriangle() {
      if (self.svg) {
        self.svg.selectAll('.img.triangle')
          .attr('xlink:href', (d) => {
            return d.isAnyChildSelected ? './assets/images/triangle.png' : '';
          });
      }
    }

    function collapse(permission_node) {
      permission_node.collapsed = true;
      if (permission_node.icon) {
        permission_node.icon = './assets/images/plus.png';
      }
      if (permission_node._parents) {
        permission_node._parents.forEach(collapse);
      }
    }

    function elbow(d) {
      let sourceX = d.source.x,
        sourceY = d.source.y + (self.boxWidth / 2),
        targetX = d.target.x,
        targetY = d.target.y - (self.boxWidth / 2);

      return 'M' + sourceY + ',' + sourceX
        + 'H' + (sourceY + (targetY - sourceY) / 2)
        + 'V' + targetX
        + 'H' + targetY;
    }

    function transitionElbow(d) {
      return 'M' + d.source.y + ',' + d.source.x
        + 'H' + d.source.y
        + 'V' + d.source.x
        + 'H' + d.source.y;
    }

    self.nodes = nodes;
  }
}
