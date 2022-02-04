import {Component, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import {FileUploader} from 'ng2-file-upload';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {CdkDragDrop, moveItemInArray} from "@angular/cdk/drag-drop";
import {saveAs} from 'file-saver';
import {NzMessageService} from 'ng-zorro-antd/message';
import {isEmpty} from 'underscore';
import SHA512 from 'crypto-js/sha512';
import {CoreService} from '../../services/core.service';
import {AuthService} from '../../components/guard';
import {DataService} from '../../services/data.service';
import {OrderPipe} from "../../pipes/core.pipe";

@Component({
  selector: 'app-import-setting-content',
  templateUrl: './import-dialog.html'
})
export class ImportSettingComponent implements OnInit {
  setting: any;
  submitted = false;
  uploader: FileUploader;

  constructor(public activeModal: NzModalRef, public translate: TranslateService, public toasterService: ToastrService) {
    this.uploader = new FileUploader({
      url: '',
      queueLimit: 1
    });
  }

  ngOnInit(): void {
    this.uploader.onErrorItem = (fileItem, response: any, status, headers) => {
      const res = typeof response === 'string' ? JSON.parse(response) : response;
      if (res.error) {
        this.toasterService.error(res.error.code, res.error.message);
      }
    };
  }

  // CALLBACKS
  onFileSelected(event: any): void {
    const self = this;
    let item = event['0'];

    let fileExt = item.name.slice(item.name.lastIndexOf('.') + 1).toUpperCase();
    if (fileExt != 'JSON') {
      let msg = '';
      this.translate.get('error.message.invalidFileExtension').subscribe(translatedValue => {
        msg = translatedValue;
      });
      this.toasterService.error(fileExt + ' ' + msg);
      this.uploader.clearQueue();
    } else {
      let reader = new FileReader();
      reader.readAsText(item, 'UTF-8');
      reader.onload = onLoadFile;
    }

    function onLoadFile(_event) {
      let data;
      try {
        data = JSON.parse(_event.target.result);
        self.setting = data;
      } catch (e) {
        self.translate.get('error.message.invalidJSON').subscribe(translatedValue => {
          self.toasterService.error(translatedValue);
        });
        self.uploader.clearQueue();
      }
    }
  }

  onSubmit(): void {
    this.submitted = true;
    setTimeout(() => {
      this.activeModal.close(this.setting);
    }, 100);
  }
}

@Component({
  selector: 'app-setting',
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
    console.log(this.settings)
    this.savePreferences(SettingComponent.generateStoreObject(tempSetting), false)
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
    } else if (value && value.value && value.value.type === 'TIME') {
      value.value.value = SettingComponent.checkTime(value.value.value);
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

  addValInArr(val): void {
    if (val.value.value.length === 0 || val.value.value[val.value.value.length - 1].name) {
      val.value.value.push({name: ''});
    }
  }

  removeValInArr(val, index): void {
    val.value.value.splice(index, 1);
  }

  removeValue(val, isJoc): void {
    val.value.edit = false;
    val.value.value = undefined;
    this.changeConfiguration(null, null, isJoc);
  }

  importSetting(): void {
    const modal = this.modal.create({
      nzTitle: null,
      nzContent: ImportSettingComponent,
      nzClassName: 'lg',
      nzFooter: null,
      nzClosable: false,
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
          this.changeConfiguration(null, null, null);
          this.loading = true;
        }
      });
    }
  }

  private mergeData(defaultGlobals): void {
    for (let prop in defaultGlobals) {
      let isExist = false;
      for (let setProp in this.settings) {
        if (setProp === prop) {
          if(this.settings[setProp].ordering > -1){
          } else{
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
                    this.settings[setProp][i].type = defaultGlobals[prop][i].type;
                    this.settings[setProp][i].default = defaultGlobals[prop][i].default;
                    if(defaultGlobals[prop][i].values){
                      this.settings[setProp][i].values = defaultGlobals[prop][i].values;
                    }
                    break;
                  }
                } else if (!defaultGlobals[prop][i] && this.settings[prop][i] && i !== 'ordering'){
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
      if(!isExist){
        this.settings[prop] = defaultGlobals[prop];
      }
    }
    this.settingArr = [];
    for (let prop in this.settings) {
      const obj = {
        name: prop,
        ordering: this.settings[prop].ordering,
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
        if (_v.type === 'ARRAY') {
          if (typeof _v.default === 'string') {
            _v.default = _v.default.split(';');
          }
          if (_v.value) {
            let arr = _v.value.split(';');
            _v.value = [];
            for (let i = 0; i < arr.length; i++) {
              _v.value.push({name: arr[i]});
            }
          }
        }
        return {name: k, value: _v, ordering: _v.ordering};
      });
      this.settingArr.push(obj);
    }
    this.settingArr = this.orderPipe.transform(this.settingArr, 'ordering', false);
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

  private savePreferences(tempSetting, isJoc): void {
    if (this.schedulerIds.selected) {
      this.coreService.post('configuration/save', {
        controllerId: this.schedulerIds.selected,
        account: this.authService.currentUserData,
        id: this.configId || 0,
        configurationType: 'GLOBALS',
        configurationItem: JSON.stringify(tempSetting)
      }).subscribe(() => {
        if (isJoc) {
          this.getProperties();
        }
      });
    }
  }

  private getProperties(): void {
    this.coreService.post('joc/properties', {}).subscribe((result: any) => {
      sessionStorage.$SOS$FORCELOGING = result.forceCommentsForAuditLog;
      sessionStorage.comments = JSON.stringify(result.comments);
      sessionStorage.showViews = JSON.stringify(result.showViews);
      sessionStorage.securityLevel = result.securityLevel;
      sessionStorage.defaultProfile = result.defaultProfileAccount;
      sessionStorage.$SOS$COPY = JSON.stringify(result.copy);
      sessionStorage.$SOS$RESTORE = JSON.stringify(result.restore);
      sessionStorage.$SOS$IMPORT = JSON.stringify(result.import);
      this.dataService.isProfileReload.next(true);
    });
  }
}

