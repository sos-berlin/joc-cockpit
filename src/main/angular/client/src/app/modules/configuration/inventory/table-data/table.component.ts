import {Component, Input} from '@angular/core';
import {CoreService} from 'src/app/services/core.service';
import {DataService} from 'src/app/services/data.service';
import {NzModalService} from 'ng-zorro-antd/modal';
import {ConfirmModalComponent} from '../../../../components/comfirm-modal/confirm.component';
import {CreateObjectModalComponent} from '../inventory.component';
import {CommentModalComponent} from '../../../../components/comment-modal/comment.component';

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

  constructor(public coreService: CoreService, private dataService: DataService, private modal: NzModalService) {
  }

  add(): void {
    const obj: any = {
      type: this.objectType === 'CALENDAR' ? 'WORKINGDAYSCALENDAR' : this.objectType,
      path: this.dataObj.path
    };
    if (!this.dataObj.path) {
      return;
    }
    const modal = this.modal.create({
      nzTitle: null,
      nzContent: CreateObjectModalComponent,
      nzAutofocus: null,
      nzComponentParams: {
        schedulerId: this.schedulerId,
        preferences: this.preferences,
        obj
      },
      nzFooter: null,
      nzClosable: false
    });
    modal.afterClose.subscribe(res => {
      if (res) {
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
      }
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

  renameObject(data): void {
    this.dataService.reloadTree.next({renameObject: data});
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

  deletePermanently(data): void {
    this.dataService.reloadTree.next({delete: data});
  }

  removeObject(object): void {
    if (this.preferences.auditLog) {
      let comments = {
        radio: 'predefined',
        type: object.type,
        operation: 'Remove',
        name: object.name
      };
      const modal = this.modal.create({
        nzTitle: null,
        nzContent: CommentModalComponent,
        nzClassName: 'lg',
        nzComponentParams: {
          comments,
        },
        nzFooter: null,
        nzClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          this.removeApiCall(object, {
            auditLog: {
              comment: result.comment,
              timeSpent: result.timeSpent,
              ticketLink: result.ticketLink
            }
          });
        }
      });
    } else {
      const _path = object.path + (object.path === '/' ? '' : '/') + object.name;
      const modal = this.modal.create({
        nzTitle: null,
        nzContent: ConfirmModalComponent,
        nzComponentParams: {
          title: 'delete',
          message: 'deleteObject',
          type: 'Delete',
          objectName: _path
        },
        nzFooter: null,
        nzClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          this.removeApiCall(object, undefined);
        }
      });
    }
  }

  private removeApiCall(object, auditLog): void {
    this.coreService.post('inventory/remove', {objects: [{id: object.id}], auditLog}).subscribe(() => {
      for (let i = 0; i < this.dataObj.children.length; i++) {
        if (this.dataObj.children[i].id === object.id) {
          this.dataObj.children.splice(i, 1);
          break;
        }
      }
      this.dataObj.children = [...this.dataObj.children];
      this.dataService.reloadTree.next({reload: true});
    });
  }

  deleteDraft(object): void {
    const _path = object.path + (object.path === '/' ? '' : '/') + object.name;
    if (this.preferences.auditLog) {
      let comments = {
        radio: 'predefined',
        type: object.type,
        operation: 'Delete',
        name: object.name
      };
      const modal = this.modal.create({
        nzTitle: null,
        nzContent: CommentModalComponent,
        nzClassName: 'lg',
        nzComponentParams: {
          comments,
        },
        nzFooter: null,
        nzClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          this.deleteApiCall(object, {
            auditLog: {
              comment: result.comment,
              timeSpent: result.timeSpent,
              ticketLink: result.ticketLink
            }
          });
        }
      });
    } else {
      const modal = this.modal.create({
        nzTitle: null,
        nzContent: ConfirmModalComponent,
        nzComponentParams: {
          title: 'delete',
          message: 'deleteDraftObject',
          type: 'Delete',
          objectName: _path
        },
        nzFooter: null,
        nzClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          this.deleteApiCall(object, undefined);
        }
      });
    }
  }

  private deleteApiCall(object, auditLog): void {
    let isDraftOnly = true, isDeployObj = true;
    if (this.objectType.match(/CALENDAR/) || this.objectType === 'SCHEDULE') {
      isDeployObj = false;
      if (object.hasReleases) {
        isDraftOnly = false;
      }
    } else if (object.hasDeployments) {
      isDraftOnly = false;
    }
    this.coreService.post('inventory/delete_draft', {
      auditLog,
      objects: [{
        id: object.id
      }]
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
  }


  restoreObject(data): void {
    this.dataService.reloadTree.next({restore: data});
  }

  deployObject(data): void {
    this.dataService.reloadTree.next({deploy: data});
  }

  releaseObject(data): void {
    this.dataService.reloadTree.next({release: data});
  }

  sort(key): void {
    this.filter.reverse = !this.filter.reverse;
    this.filter.sortBy = key;
  }

  private store(obj, path, configuration): void {
    const valid = !(this.objectType.match(/CALENDAR/) || this.objectType === 'SCHEDULE' || this.objectType === 'WORKFLOW' || this.objectType === 'FILEORDERSOURCE' || this.objectType === 'JOBRESOURCE');
    this.coreService.post('inventory/store', {
      objectType: this.objectType === 'CALENDAR' ? 'WORKINGDAYSCALENDAR' : this.objectType,
      path,
      valid,
      configuration
    }).subscribe((res: any) => {
      obj.id = res.id;
      if (this.objectType.match(/CALENDAR/)) {
        obj.type = 'CALENDAR';
        obj.objectType = 'WORKINGDAYSCALENDAR';
      }
      obj.valid = valid;
      this.dataObj.children.push(obj);
      this.dataObj.children = [...this.dataObj.children];
      this.dataService.reloadTree.next({add: true});
    });
  }

}
