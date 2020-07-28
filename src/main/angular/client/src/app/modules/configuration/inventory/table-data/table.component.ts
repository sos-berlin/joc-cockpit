import {Component, OnInit, Input, SimpleChanges, OnChanges} from '@angular/core';
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
  @Input() dataList = [];
  @Input() preferences: any;
  @Input() permission: any;
  @Input() dataObj: any;
  @Input() searchKey: any;
  filter: any = {sortBy: 'name', reverse: false};

  constructor(public coreService: CoreService, private modalService: NgbModal, private dataService: DataService) {
  }

  copyObject(data) {
    this.dataService.reloadTree.next({copy: data});
  }

  editObject(data) {
    this.dataService.reloadTree.next({set: data});
  }

  removeObject(object) {
    let _path;
    if (object.path === '/') {
      _path = object.path + object.name;
    } else {
      _path = object.path + '/' + object.name;
    }

    const modalRef = this.modalService.open(ConfirmModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.title = 'delete';
    modalRef.componentInstance.message = 'deleteObject';
    modalRef.componentInstance.type = 'Delete';
    modalRef.componentInstance.objectName = _path;
    modalRef.result.then((res: any) => {
      this.deleteObject(_path, object);
    }, () => {

    });
  }

  private deleteObject(_path, object) {
    this.coreService.post('inventory/delete', {
      jobschedulerId: this.schedulerId,
      objectType: object.type,
      path: _path,
      id: object.id
    }).subscribe((res: any) => {

    });
  }

  undeleteObject(data) {

  }

  deleteDraft(object) {
    let _path;
    if (object.path === '/') {
      _path = object.path + object.name;
    } else {
      _path = object.path + '/' + object.name;
    }

    const modalRef = this.modalService.open(ConfirmModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.title = 'delete';
    modalRef.componentInstance.message = 'deleteDraftObject';
    modalRef.componentInstance.type = 'Delete';
    modalRef.componentInstance.objectName = _path;
    modalRef.result.then((res: any) => {
      this.coreService.post('inventory/deletedraft', {
        jobschedulerId: this.schedulerId,
        objectType: object.type,
        path: _path,
        id: object.id
      }).subscribe((res: any) => {

      });
    }, () => {

    });
  }

  deployObject(data) {

  }

  sort(sort: { key: string; value: string }): void {
    this.filter.reverse = !this.filter.reverse;
    this.filter.sortBy = sort.key;
  }

}
