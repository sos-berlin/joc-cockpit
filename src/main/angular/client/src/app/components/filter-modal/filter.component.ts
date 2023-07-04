import {Component, Input} from '@angular/core';
import {NzModalRef} from 'ng-zorro-antd/modal';
import {CoreService} from '../../services/core.service';

@Component({
  selector: 'app-edit-filter-modal',
  templateUrl: './filter.component.html'
})
export class EditFilterModalComponent {

  @Input() permission: any;
  @Input() filterList: any;
  @Input() username = '';
  @Input() favorite: any;
  @Input() action: any;
  @Input() self: any;

  constructor(public activeModal: NzModalRef, public coreService: CoreService) {
  }

  editFilter(filter): void {
    filter.type = 'EDIT';
    this.activeModal.close(filter);
  }

  copyFilter(filter): void {
    filter.type = 'COPY';
    this.activeModal.close(filter);
  }

  makeShare(configObj): void {
    this.coreService.post('configuration/share', {
      controllerId: configObj.controllerId,
      id: configObj.id
    }).subscribe(() => {
      configObj.shared = true;
    });
  }

  makeFavorite(filter): void {
    this.favorite = filter.id;
    this.action('MAKEFAV', filter, this.self);
  }

  removeFavorite(): void {
    this.favorite = '';
    this.action('REMOVEFAV', null, this.self);
  }

  deleteFilter(filter): void {
    this.coreService.post('configuration/delete', {
      controllerId: filter.controllerId,
      id: filter.id
    }).subscribe(() => {
      for (let i in this.filterList) {
        if (this.filterList[i].id == filter.id) {
          this.filterList.splice(i, 1);
          break;
        }
      }
      this.action('DELETE', filter, this.self);
    });
  }
}
