import {Component, OnInit} from '@angular/core';
import {CoreService} from '../../services/core.service';
import {AuthService} from '../../components/guard';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-user',
  templateUrl: './setting.component.html'
})
export class SettingComponent implements OnInit {
  zones: any = {};
  permission: any = {};
  object: any = {};
  schedulerIds: any = {};
  selectedController: any = {};
  settings: any = {};
  settingArr: any = [];
  configId: number;
  daysOptions = [
    {label: 'sunday', value: 1},
    {label: 'monday', value: 2},
    {label: 'tuesday', value: 3},
    {label: 'wednesday', value: 4},
    {label: 'thursday', value: 5},
    {label: 'friday', value: 6},
    {label: 'saturday', value: 7}
  ];

  constructor(public coreService: CoreService, private authService: AuthService) {

  }

  ngOnInit(): void {
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    this.permission = JSON.parse(this.authService.permission) || {};
    this.zones = moment.tz.names();
    this.loadSetting();
  }

  private loadSetting(): void {
    if (this.permission.user) {
      const configObj = {
        controllerId: this.schedulerIds.selected,
        account: this.permission.user,
        configurationType: 'GLOBALS'
      };
      this.coreService.post('configurations', configObj).subscribe((res: any) => {
        if (res.configurations[0]) {
          this.configId = res.configurations[0].id || 0;
          this.settings = JSON.parse(res.configurations[0].configurationItem);
          this.settingArr = [];
          for (let prop in this.settings) {
            const obj = {
              name: prop,
              value: []
            };
            obj.value = Object.entries(this.settings[prop]).map(([k, v]) => {
              const _v: any = v;
              if (k === 'ordering') {
                return {name: k, value: null};
              }
              if (_v.type === 'WEEKDAYS') {
                _v.value = _v.value.split(',').map(Number);
              }
              return {name: k, value: _v, ordering: _v.ordering};
            });
            this.settingArr.push(obj);
          }
        } else {
          this.savePreferences(this.generateStoreObject(res.defaultGlobals, true));
        }
      });
    }
  }

  changeConfiguration(): void {
    const tempSetting = this.coreService.clone(this.settings);
    this.savePreferences(this.generateStoreObject(tempSetting, false));
  }

  private generateStoreObject(setting, isDefault): any {
    let tempSetting: any = {};
    for (let prop in setting) {
      tempSetting[prop] = {};
      for (let x in setting[prop]) {
        tempSetting[prop][x] = {};
        if (x !== 'ordering') {
          tempSetting[prop][x].ordering = setting[prop][x].ordering;
          let value;
          if (isDefault) {
            value = setting[prop][x].default;
          } else {
            value = setting[prop][x].value;
            if (setting[prop][x].type === 'WEEKDAYS') {
              if (setting[prop][x].value && Array.isArray(setting[prop][x].value)) {
                value = typeof setting[prop][x].value.toString();
              }
            }
          }
          tempSetting[prop][x].value = value;
        } else {
          tempSetting[prop][x] = setting[prop].ordering;
        }
      }
    }

    return tempSetting;
  }

  private savePreferences(tempSetting): void {
    if (this.schedulerIds.selected) {
      this.coreService.post('configuration/save', {
        controllerId: this.schedulerIds.selected,
        account: this.permission.user,
        id: this.configId || 0,
        configurationType: 'GLOBALS',
        configurationItem: JSON.stringify(tempSetting)
      }).subscribe(() => {
      });
    }
  }
}

