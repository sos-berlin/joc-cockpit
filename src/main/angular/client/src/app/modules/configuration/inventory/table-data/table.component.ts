import {Component, Input} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {CoreService} from 'src/app/services/core.service';
import {DataService} from 'src/app/services/data.service';
import {ConfirmModalComponent} from '../../../../components/comfirm-modal/confirm.component';
import {CreateObjectModalComponent} from '../inventory.component';
import {AuthService} from '../../../../components/guard';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html'
})
export class TableComponent {
  @Input() schedulerId: any;
  @Input() preferences: any;
  @Input() permission: any;
  @Input() dataObj: any;
  @Input() objectType: any;
  @Input() copyObj: any;
  @Input() isTrash: any;

  searchKey: any;
  filter: any = {sortBy: 'name', reverse: false};

  constructor(public coreService: CoreService, private modalService: NgbModal,
              private dataService: DataService, private authService: AuthService) {
  }

  add(): void {
    const obj: any = {
      type: this.objectType === 'CALENDAR' ? 'WORKINGDAYSCALENDAR' : this.objectType,
      path: this.dataObj.path
    };
    if (!this.dataObj.path) {
      return;
    }
    const modalRef = this.modalService.open(CreateObjectModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.schedulerId = this.schedulerId;
    modalRef.componentInstance.obj = obj;
    modalRef.result.then((res: any) => {
      let configuration = {};
      obj.name = res.name;
      if (obj.type === 'JOBCLASS') {
        configuration = {maxProcesses: 1};
      } else if (obj.type === 'SCHEDULE') {
        configuration = {controllerId: this.schedulerId};
      } else if (obj.type === 'LOCK') {
        configuration = {limit: 1, id: res.name};
      } else if (obj.type === 'WORKINGDAYSCALENDAR' || obj.type === 'NONWORKINGDAYSCALENDAR') {
        configuration = {type: obj.type};
      }
      const _path = this.dataObj.path + (this.dataObj.path === '/' ? '' : '/') + res.name;

      this.store(obj, _path, configuration);
    }, () => {
    });
  }

  private store(obj, _path, configuration): void {
    this.coreService.post('inventory/store', {
      objectType: this.objectType === 'CALENDAR' ? 'WORKINGDAYSCALENDAR' : this.objectType,
      path: _path,
      valid: !(this.objectType.match(/CALENDAR/) || this.objectType === 'SCHEDULE' || this.objectType === 'WORKFLOW'),
      configuration: configuration
    }).subscribe((res: any) => {
      obj.id = res.id;
      if (this.objectType.match(/CALENDAR/)) {
        obj.type = 'CALENDAR';
        obj.objectType = 'WORKINGDAYSCALENDAR';
      }
      obj.valid = !(this.objectType.match(/CALENDAR/) || this.objectType === 'SCHEDULE' || this.objectType === 'WORKFLOW');
      this.dataObj.children.push(obj);
      this.dataObj.children = [...this.dataObj.children];
      this.dataService.reloadTree.next({add: true});
    });
  }

  paste(): void {
    this.dataService.reloadTree.next({paste: this.dataObj});
  }

  cutObject(data): void {
    this.dataService.reloadTree.next({cut: data});
  }

  copyObject(data): void {
    this.dataService.reloadTree.next({copy: data});
  }

  shallowCopy(data): void {
    this.dataService.reloadTree.next({shallowCopy: data});
  }

  editObject(data): void {
    this.dataService.reloadTree.next({set: data});
  }

  showJson(data, isEdit): void {
    this.dataService.reloadTree.next({showJson: data, edit: isEdit});
  }

  exportJSON(data): void {
    this.dataService.reloadTree.next({exportJSON: data});
  }

  importJSON(data): void {
    this.dataService.reloadTree.next({importJSON: data});
  }

  deletePermanently(data){

  }

  removeObject(object): void {
    const _path = object.path + (object.path === '/' ? '' : '/') + object.name;
    const modalRef = this.modalService.open(ConfirmModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.title = 'delete';
    modalRef.componentInstance.message = 'deleteObject';
    modalRef.componentInstance.type = 'Delete';
    modalRef.componentInstance.objectName = _path;
    modalRef.result.then(res => {
      this.deleteObject(_path, object);
    }, () => {

    });
  }

  deleteDraft(object) {
    const _path = object.path + (object.path === '/' ? '' : '/') + object.name;
    const modalRef = this.modalService.open(ConfirmModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.title = 'delete';
    modalRef.componentInstance.message = 'deleteDraftObject';
    modalRef.componentInstance.type = 'Delete';
    modalRef.componentInstance.objectName = _path;
    modalRef.result.then(() => {
      let isDraftOnly = true, isDeployObj = true;
      if (this.objectType.match(/CALENDAR/) || this.objectType === 'SCHEDULE') {
        isDeployObj = false;
        if (object.hasReleases) {
          isDraftOnly = false;
        }
      } else if (object.hasDeployments) {
        isDraftOnly = false;
      }
      this.coreService.post('inventory/deletedraft', {
        id: object.id
      }).subscribe(() => {
        if (isDraftOnly) {
          for (let i = 0; i < this.dataObj.children.length; i++) {
            if (this.dataObj.children[i].id === object.id) {
              this.dataObj.children.splice(i, 1);
              break;
            }
          }
        } else {
          object.valid = true;
          if (isDeployObj) {
            object.deployed = true;
          } else {
            object.released = true;
          }
        }
        this.dataObj.children = [...this.dataObj.children];
        this.dataService.reloadTree.next({reload: true});
      });
    }, () => {

    });
  }

  restoreObject(data) {
    this.dataService.reloadTree.next({restore: data});
  }

  deployObject(data) {
    this.dataService.reloadTree.next({deploy: data});
  }

  releaseObject(data) {
    this.dataService.reloadTree.next({release: data});
  }

  sort(key): void {
    this.filter.reverse = !this.filter.reverse;
    this.filter.sortBy = key;
  }

  private deleteObject(_path, object) {
    const releasable = (this.objectType === 'SCHEDULE' || this.objectType.match(/calendar/));

    const obj: any = {delete: {deployConfigurations: []}};
    if (!releasable) {
      obj.controllerIds = JSON.parse(this.authService.scheduleIds).controllerIds;
    }
    if (releasable) {
      obj.delete = [{id: object.id}];
    } else {
      const objDep = {
        configuration: {
          path: object.path + (object.path === '/' ? '' : '/') + object.name,
          objectType: this.objectType
        }
      };
      obj.delete.deployConfigurations.push(objDep);
    }
    const URL = releasable ? 'inventory/release' : 'inventory/deployment/deploy';
    this.coreService.post(URL, obj).subscribe(() => {

    });
  }

}
