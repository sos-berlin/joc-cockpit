import {Component, Input, OnInit} from '@angular/core';
import * as moment from 'moment-timezone';
import {TranslateService} from '@ngx-translate/core';
import {ToasterService} from 'angular2-toaster';
import {FileUploader} from 'ng2-file-upload';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {saveAs} from 'file-saver';
import * as _ from 'underscore';
import {CoreService} from '../../services/core.service';
import {AuthService} from '../../components/guard';
import {ConfirmModalComponent} from '../../components/comfirm-modal/confirm.component';

@Component({
  selector: 'app-add-section-content',
  templateUrl: './add-section-dialog.html'
})
export class AddSectionComponent implements OnInit {
  @Input() defaultGlobals: any;
  @Input() settings: any;
  settingArr = [];
  setting: any = {};
  submitted = false;

  constructor(public activeModal: NgbActiveModal, public translate: TranslateService,
              public toasterService: ToasterService) {
  }

  ngOnInit() {
    for (let prop in this.defaultGlobals) {
      let flag = false;
      for (let i = 0; i < this.settings.length; i++) {
        if (prop === this.settings[i].name) {
          flag = true;
          break;
        }
      }
      this.settingArr.push(
        {
          name: prop,
          isExist: flag,
          value: this.defaultGlobals[prop]
        });
    }
    // console.log(this.defaultGlobals);
    console.log(this.settingArr);
  }

  onSubmit() {
    this.submitted = true;
    setTimeout(() => {
      this.activeModal.close(this.setting);
    }, 100);
  }
}

@Component({
  selector: 'app-import-setting-content',
  templateUrl: './import-dialog.html'
})
export class ImportSettingComponent implements OnInit {
  setting: any;
  submitted = false;
  uploader: FileUploader;

  constructor(public activeModal: NgbActiveModal, public translate: TranslateService, public toasterService: ToasterService) {
    this.uploader = new FileUploader({
      url: '',
      queueLimit: 1
    });
  }

  ngOnInit() {
    this.uploader.onErrorItem = (fileItem, response: any, status, headers) => {
      const res = typeof response === 'string' ? JSON.parse(response) : response;
      if (res.error) {
        this.toasterService.pop('error', res.error.code, res.error.message);
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
      this.toasterService.pop('error', '', fileExt + ' ' + msg);
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

      }
    }
  }

  onSubmit() {
    this.submitted = true;
    setTimeout(() => {
      this.activeModal.close(this.setting);
    }, 100);
  }
}

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

  constructor(public coreService: CoreService, private authService: AuthService, private modalService: NgbModal,
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
    const tempSetting: any = {};
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

  addSection() {
    const modalRef = this.modalService.open(AddSectionComponent, {backdrop: 'static'});
    modalRef.componentInstance.settings = this.settingArr;
    modalRef.componentInstance.defaultGlobals = this.defaultGlobals;
    modalRef.result.then((section) => {
      this.settings[section.name] = {};
      this.changeConfiguration(null, null);
      this.loadSetting();
    }, () => {
    });
  }

  removeSection(section) {
    const modalRef = this.modalService.open(ConfirmModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.title = 'remove';
    modalRef.componentInstance.message = 'removeSetting';
    modalRef.componentInstance.type = 'Remove';
    modalRef.componentInstance.objectName = section.name;
    modalRef.result.then(() => {
      for (let i = 0; i < this.settingArr.length; i++) {
        if (this.settingArr[i].name === section.name) {
          this.settingArr.splice(i, 1);
          delete this.settings[section.name];
          break;
        }
      }
      this.changeConfiguration(null, null);
    }, () => {
    });
  }

  importSetting() {
    const modalRef = this.modalService.open(ImportSettingComponent, {backdrop: 'static', size: 'lg'});
    modalRef.result.then((result) => {
      this.settings = result;
      this.changeConfiguration(null, null);
      this.loadSetting();
    }, () => {
    });
  }

  exportSetting() {
    const name = 'global-setting.json';
    const fileType = 'application/octet-stream';
    let data = this.generateStoreObject(this.settings);
    data = JSON.stringify(data, undefined, 2);
    const blob = new Blob([data], {type: fileType});
    saveAs(blob, name);
  }
}

