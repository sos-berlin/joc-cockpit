import {Component, Input} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CoreService } from '../../../services/core.service';

@Component({
    selector: 'app-ignore-list',
     templateUrl: './ignore-list.component.html'
})
export class EditIgnoreListComponent {

  @Input() savedIgnoreList: any;
  @Input() historyFilters: any;
  @Input() action: Function;
  @Input() self;

  constructor(public activeModal: NgbActiveModal, public coreService: CoreService) {
  }

 removeOrderIgnoreList(name) {
/*    this.savedIgnoreList.orders.splice(this.savedIgnoreList.orders.indexOf(name), 1);
    configObj.configurationType = "IGNORELIST";
    configObj.configurationItem = JSON.stringify(this.savedIgnoreList);
    configObj.id = this.ignoreListConfigId;
    UserService.saveConfiguration(configObj).then(function (res) {
      this.ignoreListConfigId = res.id;
    });
    if ((this.savedIgnoreList.isEnable == 'true' || this.savedIgnoreList.isEnable == true)) {
      if ((workflowSearch && this.historyFilters.type == 'ORDER')) {
        this.search(true);
      } else
        this.init();
    }*/
  }

  removeWorkflowIgnoreList(name) {
/*    this.savedIgnoreList.workflows.splice(this.savedIgnoreList.workflows.indexOf(name), 1);
    configObj.configurationType = "IGNORELIST";
    configObj.configurationItem = JSON.stringify(this.savedIgnoreList);
    configObj.id = this.ignoreListConfigId;
    UserService.saveConfiguration(configObj).then(function (res) {
      this.ignoreListConfigId = res.id;
    });
    if ((this.savedIgnoreList.isEnable == 'true' || this.savedIgnoreList.isEnable == true)) {
      if ((workflowSearch && this.historyFilters.type == 'ORDER')) {
        this.search(true);
      } else
        this.init();
    }*/
  }

  removeJobIgnoreList(name) {
/*    this.savedIgnoreList.jobs.splice(this.savedIgnoreList.jobs.indexOf(name), 1);
    configObj.configurationType = "IGNORELIST";
    configObj.configurationItem = JSON.stringify(this.savedIgnoreList);
    configObj.id = this.ignoreListConfigId;
    UserService.saveConfiguration(configObj).then(function (res) {
      this.ignoreListConfigId = res.id;
    });
    if ((this.savedIgnoreList.isEnable == 'true' || this.savedIgnoreList.isEnable == true)) {
      if ((jobSearch && this.historyFilters.type != 'ORDER')) {
        this.search(true);
      } else
        this.init();
    }*/
  }
}
