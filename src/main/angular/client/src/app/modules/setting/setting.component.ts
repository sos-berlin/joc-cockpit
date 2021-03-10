import {Component, OnInit} from '@angular/core';
import {CoreService} from '../../services/core.service';
import {AuthService} from '../../components/guard';
import * as moment from 'moment-timezone';
import {TranslateService} from '@ngx-translate/core';
import {ToasterService} from 'angular2-toaster';
import * as _ from 'underscore';

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
  defaultGlobals: any = {};
  settings: any = {};
  settingArr: any = [];
  loading: boolean;
  configId: number;
  daysOptions = [
    {label: 'monday', value: 1},
    {label: 'tuesday', value: 2},
    {label: 'wednesday', value: 3},
    {label: 'thursday', value: 4},
    {label: 'friday', value: 5},
    {label: 'saturday', value: 6},
    {label: 'sunday', value: 7},
  ];

  constructor(public coreService: CoreService, private authService: AuthService,
              private translate: TranslateService, private toasterService: ToasterService) {

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
        this.defaultGlobals = res.defaultGlobals;
        if (res.configurations[0]) {
          this.configId = res.configurations[0].id || 0;
          this.settings = JSON.parse(res.configurations[0].configurationItem);
          this.mergeData(this.defaultGlobals);
          this.loading = true;
        } else {
          this.settings = {};
          this.mergeData(this.defaultGlobals);
          this.changeConfiguration(null, null);
          this.loading = true;
        }
      });
    }
  }

  private mergeData(defaultGlobals): void {
    for (let prop in defaultGlobals) {
      for (let setProp in this.settings) {
        if (setProp === prop) {

          for (let x in defaultGlobals[prop]) {
            let flag = true;
            if (!_.isEmpty(this.settings[setProp])) {
              for (let i in this.settings[setProp]) {
                if (x === i) {
                  flag = false;
                  if (defaultGlobals[prop][i] && defaultGlobals[prop][i].type) {
                    this.settings[setProp][i].type = defaultGlobals[prop][i].type;
                    this.settings[setProp][i].default = defaultGlobals[prop][i].default;
                    break;
                  }
                }
              }
            }
            if (flag) {
              this.settings[setProp][x] = defaultGlobals[prop][x];
            }
          }
          break;
        }
      }
    }
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
        if (_v.type === 'WEEKDAYS' && _v.value) {
          _v.value = _v.value.split(',').map(Number);
        }
        return {name: k, value: _v, ordering: _v.ordering};
      });
      this.settingArr.push(obj);
    }
  }

  private checkTime(time): string {
    if (/^\d{1,2}:\d{2}?$/i.test(time)) {
      time = time + ':00';
    } else if (/^\d{1,2}:\d{2}(:)?$/i.test(time)) {
      time = time + '00';
    } else if (/^\d{1,2}?$/i.test(time)) {
      time = time + ':00:00';
    }
    if (time === '00:00') {
      time = '00:00:00';
    }
    return time;
  }

  changeConfiguration(form, value): void {
    const tempSetting = this.coreService.clone(this.settings);
    if (form && form.invalid) {
      let msg = 'Oops';
      this.translate.get('common.message.notValidInput').subscribe(translatedValue => {
        msg = translatedValue;
      });
      this.toasterService.pop('error', msg);
      return;
    } else if (value && value.value && value.value.type === 'TIME') {
      value.value.value = this.checkTime(value.value.value);
    }
    this.savePreferences(this.generateStoreObject(tempSetting));
  }

  private generateStoreObject(setting): any {
    let tempSetting: any = {};
    for (let prop in setting) {
      tempSetting[prop] = {};
      for (let x in setting[prop]) {
        if (setting[prop][x].value) {
          tempSetting[prop][x] = {};
          if (x !== 'ordering') {
            tempSetting[prop][x].ordering = setting[prop][x].ordering;
            let value = setting[prop][x].value;
            if (setting[prop][x].type === 'WEEKDAYS') {
              if (setting[prop][x].value && Array.isArray(setting[prop][x].value)) {
                value = setting[prop][x].value.toString();
              }
            }
            tempSetting[prop][x].value = value;
          } else {
            tempSetting[prop][x] = setting[prop].ordering;
          }
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

  removeValue(val): void {
    val.value.edit = false;
    val.value.value = undefined;
    this.changeConfiguration(null, null);
  }
}

