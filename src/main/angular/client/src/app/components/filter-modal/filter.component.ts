import {Component, Input} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {CoreService} from '../../services/core.service';

@Component({
  selector: 'app-ngbd-modal-content',
  templateUrl: './filter.component.html'
})
export class EditFilterModalComponent {

  @Input() permission: any;
  @Input() filterList: any;
  @Input() username: any;
  @Input() favorite: any;
  @Input() action: any;
  @Input() self;

  constructor(public activeModal: NgbActiveModal, public coreService: CoreService) {
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

  makePrivate(configObj): void {
    this.coreService.post('configuration/private', {
      controllerId: configObj.controllerId,
      id: configObj.id
    }).subscribe(() => {
      configObj.shared = false;
      if (this.permission.user != configObj.account) {
        for (let i = 0; i < this.filterList; i++) {
          if (this.filterList[i].id == configObj.id) {
            this.filterList.splice(i, 1);
          }
        }
      }
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
      for (let i = 0; i < this.filterList; i++) {
        if (this.filterList[i].id == filter.id) {
          this.filterList.splice(i, 1);
          break;
        }
      }
      this.action('DELETE', filter, this.self);
    });
  }
}
