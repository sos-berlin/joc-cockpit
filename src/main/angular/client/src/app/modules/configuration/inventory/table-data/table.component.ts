import {Component, Input} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {CoreService} from 'src/app/services/core.service';
import {DataService} from 'src/app/services/data.service';
import {ConfirmModalComponent} from '../../../../components/comfirm-modal/confirm.component';

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
    searchKey: any;
    filter: any = {sortBy: 'name', reverse: false};

    constructor(public coreService: CoreService, private modalService: NgbModal,
                private dataService: DataService){
    }

    add() {
      let name_type, configuration = {};
      if (this.objectType === 'WORKFLOW') {
        name_type = 'workflow';
      } else if (this.objectType === 'JUNCTION') {
        name_type = 'junction';
      } else if (this.objectType === 'AGENTCLUSTER') {
        name_type = 'agent_cluster';
      } else if (this.objectType === 'JOBCLASS') {
        name_type = 'job_class';
        configuration = {maxProcesses: 1};
      } else if (this.objectType === 'ORDERTEMPLATE') {
        name_type = 'order';
        configuration = {controllerId: this.schedulerId};
      } else if (this.objectType === 'LOCK') {
        name_type = 'lock';
      } else if (this.objectType === 'CALENDAR') {
        name_type = 'calendar';
        configuration = {type: 'WORKINGDAYSCALENDAR'};
      }
      const name = this.coreService.getName(this.dataObj.children, name_type + '1', 'name', name_type);
      const _path = this.dataObj.path + (this.dataObj.path === '/' ? '' : '/') + name;
      const obj: any = {
        type: this.objectType === 'CALENDAR' ? 'WORKINGDAYSCALENDAR' : this.objectType,
        name: name,
        path: this.dataObj.path
      };
      if (!this.dataObj.path) {
        return;
      }
      this.coreService.post('inventory/store', {
        objectType: this.objectType === 'CALENDAR' ? 'WORKINGDAYSCALENDAR' : this.objectType,
        path: _path,
        valid: !(this.objectType.match(/CALENDAR/) || this.objectType === 'ORDERTEMPLATE' || this.objectType === 'AGENTCLUSTER' || this.objectType === 'WORKFLOW'),
        configuration: configuration
      }).subscribe((res: any) => {
        obj.id = res.id;
        if (this.objectType.match(/CALENDAR/)) {
          obj.type = 'CALENDAR';
          obj.objectType = 'WORKINGDAYSCALENDAR';
        }
        obj.valid = !(this.objectType.match(/CALENDAR/) || this.objectType === 'ORDERTEMPLATE' || this.objectType === 'AGENTCLUSTER' || this.objectType === 'WORKFLOW');
        this.dataObj.children.push(obj);
        this.dataObj.children = [...this.dataObj.children];
        this.dataService.reloadTree.next({add: true});
      });
    }

    paste() {
        this.dataService.reloadTree.next({paste: this.dataObj});
    }

    copyObject(data) {
        this.dataService.reloadTree.next({copy: data});
    }

    editObject(data) {
        this.dataService.reloadTree.next({set: data});
    }

    removeObject(object) {
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
        modalRef.result.then(res => {
            this.coreService.post('inventory/deletedraft', {
                id: object.id
            }).subscribe(result => {
                for (let i = 0; i < this.dataObj.children.length; i++) {
                    if (this.dataObj.children[i].id === object.id) {
                        this.dataObj.children.splice(i, 1);
                        break;
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

    releaseObject(data){
        this.dataService.reloadTree.next({release: data});
    }

    sort(key): void {
        this.filter.reverse = !this.filter.reverse;
        this.filter.sortBy = key;
    }

    private deleteObject(_path, object) {
        this.coreService.post('inventory/delete', {
            id: object.id
        }).subscribe(res => {
            object.deleted = true;
            this.dataService.reloadTree.next({reload: true});
        });
    }

}
