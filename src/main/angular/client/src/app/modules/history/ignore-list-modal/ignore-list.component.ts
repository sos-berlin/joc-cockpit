import {Component, Input} from '@angular/core';
import {NzModalRef} from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-ignore-list',
  templateUrl: './ignore-list.component.html'
})
export class EditIgnoreListComponent {
  @Input() savedIgnoreList: any;
  @Input() historyFilters: any;
  @Input() self;

  constructor(public activeModal: NzModalRef) {
  }

  removeWorkflowIgnoreList(name) {
    this.savedIgnoreList.workflows.splice(this.savedIgnoreList.workflows.indexOf(name), 1);
    this.self.removeObjectFromIgnoreList();
  }

  removeJobIgnoreList(name) {
    this.savedIgnoreList.jobs.splice(this.savedIgnoreList.jobs.indexOf(name), 1);
    this.self.removeObjectFromIgnoreList();
  }
}
