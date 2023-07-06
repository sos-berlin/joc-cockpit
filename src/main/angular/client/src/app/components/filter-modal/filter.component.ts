import {Component, inject} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef} from 'ng-zorro-antd/modal';
import {CoreService} from '../../services/core.service';

@Component({
  selector: 'app-edit-filter-modal',
  templateUrl: './filter.component.html'
})
export class EditFilterModalComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  permission: any;
  filterList: any;
  username: string = '';
  favorite: any;
  action: any;
  self: any;

  constructor(public activeModal: NzModalRef, public coreService: CoreService) {
  }

  ngOnInit(): void {
    this.permission = this.modalData.permission;
    this.filterList = this.modalData.filterList;
    this.username = this.modalData.username;
    this.favorite = this.modalData.favorite;
    this.action = this.modalData.action;
    this.self = this.modalData.self;
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
