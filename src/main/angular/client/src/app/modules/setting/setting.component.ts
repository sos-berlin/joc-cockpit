import {Component, OnDestroy, OnInit} from '@angular/core';
import {CoreService} from '../../services/core.service';


@Component({
  selector: 'app-user',
  templateUrl: './setting.component.html'
})
export class SettingComponent implements OnInit, OnDestroy {
  preferences: any = {};
  permission: any = {};
  object: any = {};
  schedulerIds: any = {};
  selectedController: any = {};
  configObj: any = {};
  timeZone: any = {};
  securityLevel: string;

  constructor(public coreService: CoreService) {

  }

  savePreferences() {
    if (this.schedulerIds.selected) {
      this.configObj.configurationItem = JSON.stringify(this.preferences);
      this.coreService.post('configuration/save', this.configObj).subscribe(res => {
      }, (err) => {
        console.error(err);
      });
    }
  }

  ngOnInit() {

  }

  ngOnDestroy() {

  }

  changeConfiguration() {

  }

}

