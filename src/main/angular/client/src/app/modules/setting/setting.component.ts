import {Component} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {ToastrService} from 'ngx-toastr';
import {NzModalService} from 'ng-zorro-antd/modal';
import {CdkDragDrop, moveItemInArray} from "@angular/cdk/drag-drop";
import {saveAs} from 'file-saver';
import {NzMessageService} from 'ng-zorro-antd/message';
import {isEmpty} from 'underscore';
import * as SHA512 from 'crypto-js/sha512';
import {CoreService} from '../../services/core.service';
import {AuthService} from '../../components/guard';
import {DataService} from '../../services/data.service';
import {OrderPipe} from "../../pipes/core.pipe";
import {CommentModalComponent} from "../../components/comment-modal/comment.component";
import {FileUploaderComponent} from "../../components/file-uploader/file-uploader.component";

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html'
})
export class SettingComponent {
  zones: any = {};
  permission: any = {};
  preferences: any = {};
  object: any = {};
  schedulerIds: any = {};
  orignalSetting: any = {};
  defaultGlobals: any = {};
  settings: any = {};
  auditLog: any = {};
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

  constructor(public coreService: CoreService, private authService: AuthService, private modal: NzModalService, private message: NzMessageService,
              private translate: TranslateService, private toasterService: ToastrService, private dataService: DataService, private orderPipe: OrderPipe) {
  }

  static checkTime(time): string {
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

  static generateStoreObject(setting): any {
    const tempSetting: any = {};
    for (let prop in setting) {
      tempSetting[prop] = {
        ordering: setting[prop].ordering
      };
      for (let x in setting[prop]) {
        if (setting[prop][x].value || setting[prop][x].value === false || setting[prop][x].value === 0 || (setting[prop][x].type === 'PASSWORD' && setting[prop][x].value === '')) {
          tempSetting[prop][x] = {};
          if (x !== 'ordering') {
            tempSetting[prop][x].ordering = setting[prop][x].ordering;
            let value = setting[prop][x].value;
            if (setting[prop][x].type === 'WEEKDAYS') {
              if (setting[prop][x].value && Array.isArray(setting[prop][x].value)) {
                value = setting[prop][x].value.toString();
              }
            } else if (setting[prop][x].type === 'ARRAY') {
              if (setting[prop][x].value && Array.isArray(setting[prop][x].value)) {
                value = setting[prop][x].value.filter((item) => {
                  return item.name;
                });
                value = value.map((item) => item.name).join(';');
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

  ngOnInit(): void {
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    this.permission = JSON.parse(this.authService.permission) || {};
    if (sessionStorage['preferences']) {
      this.preferences = JSON.parse(sessionStorage['preferences']) || {};
    }
    this.zones = this.coreService.getTimeZoneList();
    this.loadSetting();
  }

  drop(event: CdkDragDrop<string[]>): void {
    this.settingArr = this.orderPipe.transform(this.settingArr, 'ordering', false);
    moveItemInArray(this.settingArr, event.previousIndex, event.currentIndex);
    for (let i = 0; i < this.settingArr.length; i++) {
      this.settingArr[i].ordering = i;
    }
    this.settingArr.forEach(item => {
      this.settings[item.name].ordering = item.ordering;
    });
    const tempSetting = this.coreService.clone(this.settings);
    this.savePreferences(SettingComponent.generateStoreObject(tempSetting), false)
  }

  checkSemicolon(e, data): boolean {
    if (e && e.key === ';' && data.name === 'comments_for_audit_log') { // disallow semicolon
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    return true;
  }

  changeConfiguration(form, value, isJoc): void {
    const tempSetting = this.coreService.clone(this.settings);
    if (form && form.invalid) {
      let msg = 'Oops';
      this.translate.get('common.message.notValidInput').subscribe(translatedValue => {
        msg = translatedValue;
      });
      this.toasterService.error(msg);
      return;
    } else if (value?.value && value.value.type === 'TIME') {
      value.value.value = SettingComponent.checkTime(value.value.value);
    }
    if (value?.name === 'force_comments_for_audit_log') {
      sessionStorage['$SOS$FORCELOGING'] = value.value.value;
    }
    if (value?.name === 'time_zone') {
      sessionStorage.setItem('$SOS$DAILYPLANTIMEZONE', value.value.value);
    }
    this.savePreferences(SettingComponent.generateStoreObject(tempSetting), isJoc);
  }

  openEditField(val): void {
    val.value.edit = true;
    if (val.value.type === 'ARRAY') {
      if (!val.value.value) {
        val.value.value = [{name: ''}];
      }
    } else if (val.value.type === 'PASSWORD') {
      val.value.value = '';
    }
  }

  addEditToValue(val): void{
    val.value.edit = true;
    return;
  }

  addValInArr(val): void {
    if (val.value.value.length === 0 || val.value.value[val.value.value.length - 1].name) {
      val.value.value.push({name: ''});
    }
  }

  removeValInArr(val: any, index: number): void {
    val.value.value.splice(index, 1);
    const tempSetting = this.coreService.clone(this.settings);
    this.savePreferences(SettingComponent.generateStoreObject(tempSetting), true)
  }

  removeValue(val: any, isJoc: any): void {
    val.value.edit = false;
    val.value.value = undefined;
    if (val?.name === 'time_zone') {
      sessionStorage.setItem('$SOS$DAILYPLANTIMEZONE', val.value.default);
    }
    this.changeConfiguration(null, null, isJoc);
  }

  importSetting(): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: FileUploaderComponent,
      nzData: {
        type: 'SETTING'
      },
      nzClassName: 'lg',
      nzFooter: null,
      nzClosable: false,
      nzAutofocus: null,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.settings = result;
        this.changeConfiguration(null, null, null);
        this.loadSetting();
      }
    });
  }

  exportSetting(): void {
    const name = 'global-setting.json';
    const fileType = 'application/octet-stream';
    let data = SettingComponent.generateStoreObject(this.settings);
    data = JSON.stringify(data, undefined, 2);
    const blob = new Blob([data], {type: fileType});
    saveAs(blob, name);
  }

  private loadSetting(): void {
    if (this.authService.currentUserData && this.schedulerIds.selected) {
      const configObj = {
        controllerId: this.schedulerIds.selected,
        account: this.authService.currentUserData,
        configurationType: 'GLOBALS'
      };
      this.coreService.post('configurations', configObj).subscribe({
        next: (res: any) => {
          this.defaultGlobals = res.defaultGlobals;
          if (res.configurations[0]) {
            this.configId = res.configurations[0].id || 0;
            this.orignalSetting = JSON.parse(res.configurations[0].configurationItem);
            this.settings = JSON.parse(res.configurations[0].configurationItem);
            this.mergeData(this.defaultGlobals);
            this.loading = true;
          } else {
            this.settings = {};
            this.mergeData(this.defaultGlobals);
            this.changeConfiguration(null, null, null);
            this.loading = true;

          }

        }, error: () => {
          this.loading = true;
        }
      });
    } else {
      this.loading = true;
    }
  }

private mergeData(defaultGlobals: any): void {
  for (let prop in defaultGlobals) {
    let isExist = false;
    for (let setProp in this.settings) {
      if (setProp === prop) {
        // Update ordering if not already set
        if (this.settings[setProp].ordering > -1) {
        } else {
          this.settings[setProp].ordering = this.defaultGlobals[setProp].ordering;
        }
        isExist = true;

        // Merge properties for this setting
        this.mergeProperties(defaultGlobals[prop], this.settings[setProp]);

        break;
      }
    }
    if (!isExist) {
      this.settings[prop] = defaultGlobals[prop];
    }
  }

  // Process and update settingArr
  const temp = this.coreService.clone(this.settingArr);
  this.settingArr = [];
  for (let prop in this.settings) {
    const obj: any = {
      name: prop,
      ordering: this.settings[prop].ordering,
      value: this.mapProperties(this.settings[prop]) // Map all properties, including children
    };

    // Maintain visibility status (show) from previous state
    if (temp.length > 0) {
      for (let x = 0; x < temp.length; x++) {
        if (temp[x].name === obj.name) {
          obj.show = temp[x].show;
          temp.slice(x, 1);
          break;
        }
      }
    }

    this.settingArr.push(obj);
  }

  this.settingArr = this.orderPipe.transform(this.settingArr, 'ordering', false);
}

/**
 * Merges properties of a setting, including handling nested children.
 */
private mergeProperties(defaultSetting: any, existingSetting: any): void {
  for (let key in defaultSetting) {
    let flag = true;
    if (!isEmpty(existingSetting)) {
      for (let existingKey in existingSetting) {
        if (key === existingKey) {
          flag = false;
          if (defaultSetting[existingKey] && defaultSetting[existingKey].type) {
            // Copy properties like ordering, type, and default values
            existingSetting[existingKey].ordering = defaultSetting[existingKey].ordering;
            existingSetting[existingKey].type = defaultSetting[existingKey].type;
            existingSetting[existingKey].default = defaultSetting[existingKey].default;
            if (defaultSetting[existingKey].values) {
              existingSetting[existingKey].values = defaultSetting[existingKey].values;
            }

            // Handle nested children if they exist
            if (defaultSetting[existingKey].children) {
              if (!existingSetting[existingKey].children) {
                existingSetting[existingKey].children = {};
              }
              this.mergeProperties(defaultSetting[existingKey].children, existingSetting[existingKey].children);
            }

            break;
          }
        } else if (!defaultSetting[existingKey] && existingSetting[existingKey] && existingKey !== 'ordering') {
          delete existingSetting[existingKey];
        }
      }
    }
    if (flag) {
      existingSetting[key] = defaultSetting[key];
    }
  }
}

/**
 * Maps properties of settings, including handling nested children.
 */
private mapProperties(setting: any): any[] {
  return Object.entries(setting).map(([key, value]) => {
    const _value: any = value;
    if (key === 'ordering') {
      return { name: key, value: null };
    }
    if (_value.type === 'WEEKDAYS' && _value.value) {
      _value.value = _value.value.split(',').map(Number);
    }
    if (_value.type === 'ARRAY') {
      if (typeof _value.default === 'string') {
        _value.default = _value.default.split(';');
      }
      if (_value.value) {
        let arr = _value.value.split(';');
        _value.value = [];
        for (let i = 0; i < arr.length; i++) {
          _value.value.push({ name: arr[i] });
        }
      }
    }

    // Handle mapping of children recursively
    if (_value.children) {
      _value.children = this.mapProperties(_value.children);
    }

    return { name: key, value: _value, ordering: _value.ordering };
  });
}

  showHashValue(data: any): void {
    let pswd = data.value.default;
    if (data.value.value !== undefined && data.value.value !== null) {
      pswd = data.value.value;
    }
    const hashValue = SHA512(pswd).toString();
    data.value.hash = data.value.value === '' ? 'plan:' : 'sha512:' + hashValue.toUpperCase();
  }

  showCopyMessage(): void {
    this.coreService.showCopyMessage(this.message)
  }

  private savePreferences(tempSetting: any, isJoc: any): void {
    if (this.permission.joc.administration.settings.manage) {
      if ((this.preferences.auditLog || sessionStorage['$SOS$FORCELOGING'] == 'true') && !this.auditLog.comment) {
        let comments = {
          radio: 'predefined',
          type: 'Settings',
          operation: 'Store'
        };
        const modal = this.modal.create({
          nzTitle: undefined,
          nzContent: CommentModalComponent,
          nzClassName: 'lg',
          nzData: {
            comments
          },
          nzFooter: null,
          nzAutofocus: null,
          nzClosable: false,
          nzMaskClosable: false
        });
        modal.afterClose.subscribe(result => {
          if (result) {
            if (result.isChecked) {
              this.auditLog = result;
            }
            this._savePreferences(tempSetting, isJoc, result);
          } else {
            this.settings = this.coreService.clone(this.orignalSetting);
            this.mergeData(this.defaultGlobals);
          }
        });
      } else {
        this._savePreferences(tempSetting, isJoc, this.auditLog);
      }
    }
  }

  private _savePreferences(tempSetting: any, isJoc: any, auditLog: any): void {
    if (this.schedulerIds.selected) {
      this.coreService.post('configuration/save', {
        controllerId: this.schedulerIds.selected,
        account: this.authService.currentUserData,
        id: this.configId || 0,
        configurationType: 'GLOBALS',
        auditLog,
        configurationItem: JSON.stringify(tempSetting)
      }).subscribe(() => {
        this.orignalSetting = tempSetting;
        if (isJoc) {
          this.getProperties();
        }
      });
    }
  }

  private getProperties(): void {
    this.coreService.post('joc/properties', {}).subscribe((result: any) => {
      this.coreService.setProperties(result);
      this.dataService.isProfileReload.next(true);
    });
  }
}

