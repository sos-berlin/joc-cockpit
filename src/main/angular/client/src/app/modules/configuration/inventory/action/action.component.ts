import {Component, OnInit, Input} from '@angular/core';
import {CoreService} from '../../../../services/core.service';
import {DataService} from '../../../../services/data.service';
import {ConfirmModalComponent} from '../../../../components/comfirm-modal/confirm.component';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-action-menu',
  templateUrl: './action.component.html'
})
export class ActionMenuComponent implements OnInit {
  @Input() permission: any;
  @Input() object: any;
  @Input() schedulerId: any;

  constructor(private coreService: CoreService, private dataService: DataService, private modalService: NgbModal) {
  }

  ngOnInit() {

  }

  copyObject(data) {

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

  deleteDraft(data) {

  }

  deployObject(data) {

  }
}
