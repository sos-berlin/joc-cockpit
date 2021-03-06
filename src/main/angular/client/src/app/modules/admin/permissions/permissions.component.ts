import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {isEqual, clone} from 'underscore';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {ConfirmModalComponent} from '../../../components/comfirm-modal/confirm.component';
import {AuthService} from '../../../components/guard';
import {CoreService} from '../../../services/core.service';
import {DataService} from '../data.service';

declare var $: any;
declare var d3: any;

// Permission Modal
@Component({
  selector: 'app-permission-modal-content',
  templateUrl: 'permission-modal.html'
})
export class PermissionModalComponent {
  @Input() rolePermissions: any;
  @Input() userDetail: any;
  @Input() master: any;
  @Input() role: any;
  @Input() oldPermission: any;
  @Input() currentPermission: any;
  @Input() permissionOptions: any;
  @Input() add;

  submitted = false;
  isCovered = false;

  constructor(public activeModal: NzModalRef, public coreService: CoreService) {
  }

  checkCovered(currentPermission): void {
    this.isCovered = false;
    this.rolePermissions.forEach((permission1) => {
      if (currentPermission.path.trim() && currentPermission.path.trim().indexOf(permission1.path) !== -1 &&
        ((currentPermission.path.trim().length > permission1.path.length && currentPermission.path.trim().substring(permission1.path.length, permission1.path.length + 1) === ':') || currentPermission.path.trim().length == permission1.path.length) &&
        ((currentPermission.excluded && permission1.excluded) || (!currentPermission.excluded && !permission1.excluded))) {
        this.isCovered = true;
      }
    });
  }

  onSubmit(obj): void {
    this.submitted = true;
    if (this.add) {
      this.rolePermissions.push(obj);
    } else {
      for (let i = 0; i < this.rolePermissions.length; i++) {
        if (this.oldPermission === this.rolePermissions[i] || isEqual(this.oldPermission, this.rolePermissions[i])) {
          this.rolePermissions[i] = obj;
          break;
        }
      }
    }

    this.coreService.post('authentication/shiro/store', obj = {
      users: this.userDetail.users,
      roles: this.userDetail.roles,
      main: this.userDetail.main
    }).subscribe(res => {
      this.submitted = false;
      this.activeModal.close(this.rolePermissions);
    }, err => {
      this.submitted = false;
    });
  }
}

// Folder Modal
@Component({
  selector: 'app-ngbd-modal-content',
  templateUrl: 'folder-modal.html'
})
export class FolderModalComponent implements OnInit {
  @Input() userDetail: any;
  @Input() currentFolder: any;
  @Input() master: any;
  @Input() role: any;
  @Input() folderArr: any;
  @Input() oldFolder: any;
  @Input() newFolder = false;

  nodes = [];
  submitted = false;
  folderObj: any = {paths: []};
  schedulerIds: any;

  @ViewChild('treeSelectCtrl', {static: false}) treeSelectCtrl;

  constructor(public activeModal: NzModalRef, private coreService: CoreService, private authService: AuthService) {
  }

  ngOnInit(): void {
    this.schedulerIds = JSON.parse(this.authService.scheduleIds);
    if (this.folderArr && this.folderArr.length > 0) {
      this.folderObj.paths = this.folderArr.map((folder) => folder.folder);
    }
    this.getFolderTree();
  }

  onSubmit(obj): void {
    this.submitted = true;
    if (!this.newFolder) {
      for (let i = 0; i < this.folderArr.length; i++) {
        if (this.oldFolder === this.folderArr[i] || isEqual(this.oldFolder, this.folderArr[i])) {
          this.folderArr[i] = obj;
          break;
        }
      }
    } else {
      this.folderArr = [];
      if (this.folderObj.paths && this.folderObj.paths.length > 0) {
        this.folderObj.paths.forEach((path) => {
          this.folderArr.push({folder: path, recursive: obj.recursive});
        });
      }
    }
    if (!this.userDetail.roles[this.role].folders) {
      this.userDetail.roles[this.role].folders = {};
    }
    if (this.master) {
      if (!this.userDetail.roles[this.role].folders.controllers) {
        this.userDetail.roles[this.role].folders.controllers = {};
      }
      this.userDetail.roles[this.role].folders.controllers[this.master] = this.folderArr;
    } else {
      this.userDetail.roles[this.role].folders.joc = this.folderArr;
    }

    this.coreService.post('authentication/shiro/store', obj = {
      users: this.userDetail.users,
      roles: this.userDetail.roles,
      main: this.userDetail.main
    }).subscribe(() => {
      this.submitted = false;
      this.activeModal.close(this.folderArr);
    }, () => {
      this.submitted = false;
    });
  }

  displayWith(data): string {
    return data.key;
  }

  onKeyPress($event): void {
    if ($event.which === '13' || $event.which === 13 || $event.which === '32' || $event.which === 32) {
      const path = $event.target.value;
      if (this.folderObj.paths.indexOf(path) === -1) {
        if (this.treeSelectCtrl) {
          const node = this.treeSelectCtrl.getTreeNodeByKey(path);
          if (node) {
            this.folderObj.paths.push(path);
            node.isSelected = true;
            this.nodes = [...this.nodes];
          }
        }
      }
      $event.preventDefault();
    }
  }

  getFolderTree(): void {
    this.coreService.post('tree', {
      controllerId: this.schedulerIds.selected,
      forInventory: true
    }).subscribe(res => {
      this.nodes = this.coreService.prepareTree(res, true);
      if (this.nodes.length > 0) {
        this.nodes[0].expanded = true;
      }
    });
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
  permissionsObj: any;
  permissionToEdit: any;
  permissions;
  rolePermissions: any = [];
  permissionOptions = [];
  temp = ['1', '2', '3', '4'];
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

  subscription1: Subscription;
  subscription2: Subscription;
  subscription3: Subscription;

  constructor(private coreService: CoreService, private route: ActivatedRoute, private router: Router,
              private modal: NzModalService, private dataService: DataService) {
    this.subscription1 = this.dataService.dataAnnounced$.subscribe(res => {
      if (res && res.users) {
        this.setUserData(res);
      }
    });

    this.subscription2 = this.dataService.functionAnnounced$.subscribe(res => {
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
    this.subscription3 = this.route.params.subscribe(params => {
      this.controllerName = params['master.master'];
      if (this.controllerName === 'default') {
        this.controllerName = '';
      }
      this.roleName = params['role.role'];
    });

  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
    this.subscription3.unsubscribe();
  }

  getPermissions(): void {
    this.coreService.post('authentication/permissions', {}).subscribe(res => {
      this.permissionsObj = res;
      this.permissions = this.coreService.clone(this.permissionsObj.SOSPermissions);
      if (this.controllerName) {
        this.permissions.SOSPermission = this.permissions.SOSPermission.filter((val) => {
          return !val.match(':joc:');
        });

      }
      this.loadPermission();
      this.preparePermissionJSON();
      this.preparePermissionOptions();
      this.switchTree();
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
        master: this.controllerName,
        role: this.roleName,
        folderArr: this.folderArr
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.folderArr = result;
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
        master: this.controllerName,
        role: this.roleName,
        folderArr: this.folderArr,
        oldFolder: folder
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.folderArr = result;
      }
    });
  }

  deleteFolder(folder): void {
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
        this.saveInfo();
      }
    });
  }

  addPermission(): void {
    let permission = {path: '', excluded: false};
    this.modal.create({
      nzTitle: undefined,
      nzContent: PermissionModalComponent,
      nzClassName: 'lg',
      nzComponentParams: {
        currentPermission: permission,
        permissionOptions: this.permissionOptions,
        rolePermissions: this.rolePermissions,
        userDetail: this.userDetail,
        master: this.controllerName,
        role: this.roleName,
        add: true
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
  }

  editPermission(permission): void {
    let tempPermission = clone(permission);
    tempPermission.permissionLabel = permission.path;
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
        master: this.controllerName,
        role: this.roleName
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
  }

  deletePermission(permission): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: ConfirmModalComponent,
      nzComponentParams: {
        title: 'delete',
        message: 'deletePermission',
        type: 'Delete',
        objectName: permission.path
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.rolePermissions.splice(this.rolePermissions.indexOf(permission), 1);
        this.updatePermissionList();
        this.findPermissionObj(this.permissionNodes[0][0], permission.path);
        this.updateDiagramData(this.permissionNodes[0][0]);
      }
    });
  }

  loadPermission(): void {
    if (this.controllerName) {
      this.folderArr = (this.roles[this.roleName].folders && this.roles[this.roleName].folders.controllers) ? (this.roles[this.roleName].folders.controllers[this.controllerName] || []) : [];
      this.rolePermissions = this.roles[this.roleName].permissions ? (this.roles[this.roleName].permissions.controllers[this.controllerName] || []) : [];
    } else {
      this.folderArr = this.roles[this.roleName].folders ? (this.roles[this.roleName].folders.joc || []) : [];
      this.rolePermissions = this.roles[this.roleName].permissions ? [...this.roles[this.roleName].permissions.controllerDefaults, ...this.roles[this.roleName].permissions.joc] : [];
    }
    this.originalPermission = clone(this.rolePermissions);
  }

  preparePermissionJSON(): void {
    this.permissionArr = this.permissions.SOSPermission;
    for (let i = 0; i < this.permissionArr.length; i++) {
      let nodes = this.permissionArr[i].split(':');
      let arr = [];
      let flag = true, index = 0;
      for (let j = 0; j < nodes.length; j++) {
        let obj = {
          id: ++this.count,
          name: nodes[j],
          path: this.permissionArr[i].substring(0, this.permissionArr[i].lastIndexOf(nodes[j])),
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
    let temp = this.permissions.SOSPermission;
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
        if ((permissionNodes._parents[i].path + permissionNodes._parents[i].name) == permission) {
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
      if ((permissionNodes.path + permissionNodes.name) == permission) {
        permissionNodes.selected = false;
        if (permissionNodes.excluded) {
          permissionNodes.greyedBtn = false;
          permissionNodes.excluded = false;
        }
      }
    }
  }

  updateChildExclude(permissionNodes, excluded): void {
    if (permissionNodes._parents) {
      for (let i = 0; i < permissionNodes._parents.length; i++) {
        permissionNodes._parents[i].excluded = excluded;
        permissionNodes._parents[i].greyedBtn = excluded;
        this.updateChildExclude(permissionNodes._parents[i], excluded);
      }
    } else {
      permissionNodes.excluded = excluded;
      permissionNodes.greyedBtn = excluded;
    }
  }

  selectPermissionObj(permissionNodes, permission, excluded): void {
    if (permissionNodes._parents) {
      for (let i = 0; i < permissionNodes._parents.length; i++) {
        if ((permissionNodes._parents[i].path + permissionNodes._parents[i].name) == permission) {
          permissionNodes._parents[i].selected = true;
          permissionNodes._parents[i].excluded = excluded;
          if (permissionNodes._parents[i].excluded) {
            permissionNodes._parents[i].greyedBtn = false;
          }
          this.selectedNode(permissionNodes._parents[i], excluded);
          break;
        }
        this.selectPermissionObj(permissionNodes._parents[i], permission, excluded);
      }
    } else {
      if ((permissionNodes.path + permissionNodes.name) == permission) {
        permissionNodes.selected = true;
        permissionNodes.excluded = excluded;
        permissionNodes.greyedBtn = false;
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
            if (list[i].path.match(permission_node._parents[j].path + permission_node._parents[j].name)) {
              permission_node._parents[j].isSelected = true;
            }
            if (list[i].path == (permission_node._parents[j].path + '' + permission_node._parents[j].name)) {
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
          if (list[i].path.match(permission_node.path + permission_node.name)) {
            permission_node.isSelected = true;
          }
          if (list[i].path == (permission_node.path + '' + permission_node.name)) {
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

  calculateHeight(): void {
    let headerHt = $('.app-header').height() || 61;
    let topHeaderHt = $('.top-header-bar').height() || 16;
    let subHeaderHt = 59;
    let folderDivHt = $('.folder').height();
    this.ht = (window.innerHeight - (headerHt + topHeaderHt + subHeaderHt + folderDivHt + 250));
    $('#mainTree').css('height', this.ht + 80 + 'px');
  }

  switchTree(): void {
    if (!this.svg) {
      this.drawTree(this.permissionNodes[0][0], '');
    }
  }

  saveInfo(): void {
    this.coreService.post('authentication/shiro/store', {
      users: this.userDetail.users,
      roles: this.roles,
      main: this.userDetail.main
    }).subscribe(res => {
      this.dataService.announceFunction('RELOAD');
    });
  }

  updatePermissionList(): void {
    this.unSelectedNode(this.permissionNodes[0][0], true);
    this.checkPermissionList(this.permissionNodes[0][0], clone(this.rolePermissions));
    this.updateDiagramData(this.permissionNodes[0][0]);
    if (this.controllerName) {
      this.roles[this.roleName].permissions.controllers[this.controllerName] = clone(this.rolePermissions);
    } else {
      this.roles[this.roleName].permissions.joc = clone(this.rolePermissions);
      this.roles[this.roleName].permissions.controllerDefaults = [];
    }
    this.saveInfo();
  }

  undoPermission(): void {
    this.rolePermissions = this.previousPermission[this.previousPermission.length - 1];
    this.previousPermission.splice(this.previousPermission.length - 1, 1);
    if (isEqual(this.originalPermission, this.rolePermissions)) {
      this.isReset = false;
    }
    this.updatePermissionList();
  }

  resetPermission(): void {
    this.rolePermissions = clone(this.originalPermission);
    this.previousPermission = [];
    this.updatePermissionList();
    this.isReset = false;
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

  updateDiagramData(json): void {
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
      updateDiagramData(json);
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
      $('#mainTree svg').attr('height', 7150);
      $('#mainTree svg').attr('width', 2010);
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
      $('#mainTree svg').attr('width', self.width);
      $('#mainTree svg').attr('height', self.ht);
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
          if (d.path) {
            return d.path.replace(/:/g, '-') + d.name.replace(/-/g, '');
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

    function generatePermissionList(permission) {
      if (permission._parents) {
        for (let i = 0; i < permission._parents.length; i++) {
          if (permission._parents[i]) {
            if (permission._parents[i].selected || (permission._parents[i].excluded && !permission._parents[i].greyedBtn)) {
              let obj = {
                path: permission._parents[i].path + '' + permission._parents[i].name,
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
        updatePermissionAfterChange(_temp);
        if (self.previousPermission.length === 10) {
          self.previousPermission.splice(0, 1);
        }
        self.isReset = true;
        self.previousPermission.push(_previousPermissionObj);
      }
    }

    function toggleExclude(permission_node) {
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
        updatePermissionAfterChange(_temp);
        if (self.previousPermission.length === 10) {
          self.previousPermission.splice(0, 1);
        }
        self.isReset = true;
        self.previousPermission.push(_previousPermissionObj);
      }
    }

    function updatePermissionAfterChange(temp) {
      if (self.controllerName) {
        self.roles[self.roleName].permissions.controllers[self.controllerName] = temp;
      } else {
        self.roles[self.roleName].permissions.joc = temp;
      }
      self.saveInfo();
    }

    function updateDiagramData(nData) {
      self.tree = d3.layout.tree()
        .nodeSize([100, 250])
        .separation(() => {
          return .5;
        });
      let nodes = self.tree.nodes(nData);
      self.svg.selectAll('g.permission_node')
        .data(nodes, (permission_node) => {
          return permission_node.id;
        });
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
        const name = _nodes[i].path + '' + _nodes[i].name;
        for (let j = 0; j < rolePermissions.length; j++) {
          if (name === rolePermissions[j].path) {
            flag = true;
            arr.push(name);
            break;
          }
          if (!_nodes[i].greyed && !_nodes[i].selected && !flag) {
            if (!rolePermissions[j].excluded && rolePermissions[j].path.indexOf(name + ':') > -1) {
              _nodes[i].isAnyChildSelected = true;
              break;
            }
          }
        }
      }
      if (arr.length > 0) {
        for (let i = 0; i < _nodes.length; i++) {
          const name = _nodes[i].path + '' + _nodes[i].name;
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

  private setUserData(res): void {
    this.userDetail = res;
    this.roles = res.roles;
    this.getPermissions();
  }
}




