import {Component, inject} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef} from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-ignore-list',
  templateUrl: './ignore-list.component.html'
})
export class EditIgnoreListComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  savedIgnoreList: any;
  historyFilters: any;
  self: any

  constructor(public activeModal: NzModalRef) {
  }

  ngOnInit(): void {
    this.savedIgnoreList = this.modalData.savedIgnoreList;
    this.historyFilters = this.modalData.historyFilters;
    this.self = this.modalData.self;
  }

  removeWorkflowIgnoreList(name): void {
    this.savedIgnoreList.workflows.splice(this.savedIgnoreList.workflows.indexOf(name), 1);
    this.self.removeObjectFromIgnoreList();
  }

  removeJobIgnoreList(name): void {
    this.savedIgnoreList.jobs.splice(this.savedIgnoreList.jobs.indexOf(name), 1);
    this.self.removeObjectFromIgnoreList();
  }
}
