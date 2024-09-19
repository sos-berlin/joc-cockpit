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
         if (setting[prop][x]?.children && Array.isArray(setting[prop][x].children)) {
        tempSetting[prop][x].children = this.generateChildStoreObject(setting[prop][x].children);
      }
      }
    }
    return tempSetting;
  }

// Helper function to process child objects recursively
static generateChildStoreObject(children): any {
  const childSettings: any = [];

  children.forEach(child => {
    const childSetting: any = {
      name: child.name,
      ordering: child.ordering,
      value: child.value?.value
    };

    if (child.children && Array.isArray(child.children)) {
      // Recursive call for further nested children
      childSetting.children = this.generateChildStoreObject(child.children);
    }

    childSettings.push(childSetting);
  });
  return childSettings;
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

    // Validate form before proceeding
    if (form && form.invalid) {
      let msg = 'Oops';
      this.translate.get('common.message.notValidInput').subscribe(translatedValue => {
        msg = translatedValue;
      });
      this.toasterService.error(msg);
      return;
    }

    // Handle TIME type values
    if (value?.value?.type === 'TIME') {
      value.value.value = SettingComponent.checkTime(value.value.value);
    }

    // Special case for force_comments_for_audit_log
    if (value?.name === 'force_comments_for_audit_log') {
      sessionStorage['$SOS$FORCELOGING'] = value.value.value;
    }

    // Special case for time_zone
    if (value?.name === 'time_zone') {
      sessionStorage.setItem('$SOS$DAILYPLANTIMEZONE', value.value.value);
    }

    // Update child values recursively
    if (value?.children && value.children.length > 0) {
      this.updateChildValues(tempSetting, value);
    }

    // Save preferences
    this.savePreferences(SettingComponent.generateStoreObject(tempSetting), isJoc);

  }

// Function to update child values recursively
  updateChildValues(tempSetting: any, parentValue: any): void {
    if (parentValue?.children && Array.isArray(parentValue.children)) {
      parentValue.children.forEach(child => {
        // Traverse to find the correct place in tempSetting
        const tempChildSetting = this.getSettingValue(tempSetting, child.name);
        if (tempChildSetting) {
          // Assign the updated value to the child in tempSetting
          tempChildSetting.value = child.value.value;
        }
      });
    }
  }

// Helper function to find the correct child setting in the cloned settings
  getSettingValue(settings: any, name: string): any {
    // First, check if the setting name is directly in the object
    if (settings[name]) {
      return settings[name];
    }

    // If not found, traverse the children recursively
    for (const key in settings) {
      if (settings[key]?.children) {
        const childSetting = this.getSettingValue(settings[key].children, name);
        if (childSetting) {
          return childSetting;
        }
      }
    }

    return null;
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
          if (this.settings[setProp].ordering > -1) {
          } else {
            this.settings[setProp].ordering = this.defaultGlobals[setProp].ordering;
          }
          isExist = true;

          for (let x in defaultGlobals[prop]) {
            let flag = true;
            if (!isEmpty(this.settings[setProp])) {
              for (let i in this.settings[setProp]) {
                if (x === i) {
                  flag = false;
                  if (defaultGlobals[prop][i] && defaultGlobals[prop][i].type) {
                    this.settings[setProp][i].ordering = defaultGlobals[prop][i].ordering;
                    this.settings[setProp][i].type = defaultGlobals[prop][i].type;
                    this.settings[setProp][i].default = defaultGlobals[prop][i].default;
                    if (defaultGlobals[prop][i].values) {
                      this.settings[setProp][i].values = defaultGlobals[prop][i].values;
                    }

                    if (defaultGlobals[prop][i].children) {
                      if (Array.isArray(this.settings[setProp][i].children)) {
                        this.settings[setProp][i].children = this.convertChildrenArrayToObject(this.settings[setProp][i].children);
                      }

                      if (!this.settings[setProp][i].children) {
                        this.settings[setProp][i].children = {};
                      }

                      this.mergeChildProperties(defaultGlobals[prop][i].children, this.settings[setProp][i].children);
                    }

                    break;
                  }
                } else if (!defaultGlobals[prop][i] && this.settings[prop][i] && i !== 'ordering') {
                  delete this.settings[prop][i];
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
      if (!isExist) {
        this.settings[prop] = defaultGlobals[prop];
      }
    }

    const temp = this.coreService.clone(this.settingArr);
    this.settingArr = [];
    for (let prop in this.settings) {
      const obj: any = {
        name: prop,
        ordering: this.settings[prop].ordering,
        value: []
      };

      obj.value = Object.entries(this.settings[prop]).map(([k, v]) => {
        const _v: any = v;
        if (k === 'ordering') {
          return { name: k, value: null };
        }
        if (_v.type === 'WEEKDAYS' && _v.value) {
          _v.value = _v.value.split(',').map(Number);
        }
        if (_v.type === 'ARRAY') {
          if (typeof _v.default === 'string') {
            _v.default = _v.default.split(';');
          }
          if (_v.value) {
            let arr = _v.value.split(';');
            _v.value = [];
            for (let i = 0; i < arr.length; i++) {
              _v.value.push({ name: arr[i] });
            }
          }
        }

        if (_v.children) {
          _v.children = this.mapChildProperties(_v.children);
        }

        return { name: k, value: _v, ordering: _v.ordering };
      });

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
  private mergeChildProperties(defaultChildren: any, existingChildren: any): void {
    // Convert existing children from an array to an object if needed
    if (Array.isArray(existingChildren)) {
      const tempChildren = {};
      existingChildren.forEach(child => {
        tempChildren[child.name] = child;
      });
      existingChildren = tempChildren;
    }

    for (let childKey in defaultChildren) {
      if (!existingChildren[childKey]) {
        existingChildren[childKey] = { ...defaultChildren[childKey] };
      } else {
        existingChildren[childKey].ordering = defaultChildren[childKey].ordering;
        existingChildren[childKey].type = defaultChildren[childKey].type;
        existingChildren[childKey].default = defaultChildren[childKey].default;

        existingChildren[childKey].value = existingChildren[childKey].value || defaultChildren[childKey].default;

        if (defaultChildren[childKey].children) {
          if (!existingChildren[childKey].children) {
            existingChildren[childKey].children = {};
          }
          this.mergeChildProperties(defaultChildren[childKey].children, existingChildren[childKey].children);
        }
      }
    }
  }
  private convertChildrenArrayToObject(childrenArray: any[]): any {
    const childrenObject = {};
    childrenArray.forEach(child => {
      childrenObject[child.name] = child;
    });
    return childrenObject;
  }

  private mapChildProperties(children: any): any[] {
    return Object.entries(children)
      .filter(([childKey, _]) => !Number.isInteger(Number(childKey)))
      .map(([childKey, childValue]) => {
        const _childValue: any = childValue;

        if (_childValue && _childValue.type) {
          if (_childValue.type === 'ARRAY') {
            if (typeof _childValue.default === 'string') {
              _childValue.default = _childValue.default.split(';');
            }
            if (_childValue.value && typeof _childValue.value === 'string') {
              let arr = _childValue.value.split(';');
              _childValue.value = arr.map((item: string) => ({ name: item }));
            }
          }

          if (_childValue.children && Object.keys(_childValue.children).length > 0) {
            _childValue.children = this.mapChildProperties(_childValue.children);
          }

          return {
            name: childKey,
            value: {
              ..._childValue,
              value: _childValue.value || _childValue.default
            },
            ordering: _childValue.ordering
          };
        }

        return null;
      })
      .filter(child => child !== null);
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

