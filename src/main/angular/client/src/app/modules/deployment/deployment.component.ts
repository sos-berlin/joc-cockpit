import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {isEmpty, isArray} from 'underscore';
import {saveAs} from 'file-saver';
import {NzModalRef, NzModalService} from "ng-zorro-antd/modal";
import {JsonEditorComponent, JsonEditorOptions} from "ang-jsoneditor";
import {ClipboardService} from "ngx-clipboard";
import {NzMessageService} from "ng-zorro-antd/message";
import {CoreService} from '../../services/core.service';
import {FileUploader} from "ng2-file-upload";
import {TranslateService} from "@ngx-translate/core";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-upload-json',
  templateUrl: './upload-json-dialog.html'
})
export class UploadModalComponent implements OnInit {

  submitted = false;
  uploader: FileUploader;
  data: any;

  constructor(public coreService: CoreService, public activeModal: NzModalRef, public translate: TranslateService, public toasterService: ToastrService) {
    this.uploader = new FileUploader({
      url: '',
      queueLimit: 1
    });
  }

  ngOnInit(): void {
    this.uploader.onCompleteItem = (fileItem: any, response, status) => {
      if (status === 200) {
        this.activeModal.close('success');
      }
    };

    this.uploader.onErrorItem = (fileItem, response: any) => {
      const res = typeof response === 'string' ? JSON.parse(response) : response;
      if (res.error) {
        this.toasterService.error(res.error.message, res.error.code);
      }
    };
  }

  // CALLBACKS
  onFileSelected(event: any): void {
    const self = this;
    const item = event['0'];
    const fileExt = item.name.slice(item.name.lastIndexOf('.') + 1).toUpperCase();
    if (fileExt != 'JSON') {
      let msg = '';
      this.translate.get('error.message.invalidFileExtension').subscribe(translatedValue => {
        msg = translatedValue;
      });
      this.toasterService.error(fileExt + ' ' + msg);
      this.uploader.clearQueue();
    } else {
      const reader = new FileReader();
      reader.readAsText(item, 'UTF-8');
      reader.onload = onLoadFile;
    }

    function onLoadFile(_event): void {
      let data;
      try {
        data = JSON.parse(_event.target.result);
      } catch (e) {

      }
      if (data) {
        if (!data.descriptor) {
          self.showErrorMsg();
        } else {
          self.data = data;
        }
      } else {
        self.showErrorMsg();
      }
    }
  }

  onSubmit(): void {
    this.submitted = true;
    setTimeout(() => {
      this.activeModal.close(this.data);
    }, 100);
  }

  private showErrorMsg(): void {
    let msg = '';
    this.translate.get('deploymentService.message.invalidFile').subscribe(translatedValue => {
      msg = translatedValue;
    });
    this.toasterService.error(msg);
    this.uploader.queue[0].remove();
  }
}

@Component({
  selector: 'app-show-json',
  templateUrl: './show-json-dialog.html'
})
export class ShowJsonModalComponent implements OnInit {
  @Input() object: any;
  @Input() schedulerId: any;
  submitted = false;
  isError = false;
  data: any;
  errorMsg: string;
  options = new JsonEditorOptions();

  @ViewChild('editor', {static: false}) editor: JsonEditorComponent;

  constructor(public coreService: CoreService, private clipboardService: ClipboardService, public activeModal: NzModalRef,
              private message: NzMessageService) {
    this.options.mode = 'code';
    this.options.onChange = () => {
      try {
        this.isError = false;
        this.editor.get();
      } catch (err) {
        this.isError = true;
        this.errorMsg = '';
      }
    };
  }

  ngOnInit(): void {
    const preferenceObj = JSON.parse(sessionStorage.preferences);
    this.coreService.get('assets/i18n/json-editor-text_' + preferenceObj.locale + '.json').subscribe((data) => {
      this.options.languages = {};
      this.options.languages[preferenceObj.locale] = data;
      this.options.language = preferenceObj.locale;
      this.editor.setOptions(this.options);
    });
    this.options.modes = ['code', 'tree'];
    this.data = this.coreService.clone(this.object);
    console.log(this.data)
  }

  copyToClipboard(): void {
    this.coreService.showCopyMessage(this.message);
    this.clipboardService.copyFromContent(this.editor.getText());
  }

  onSubmit(): void {
    this.activeModal.close(this.editor.get());
  }

}

@Component({
  selector: 'app-deployment',
  templateUrl: './deployment.component.html'
})
export class DeploymentComponent implements OnInit {
  data: any = {
    descriptor: {},
    joc: [],
    agents: [],
    controllers: [],
  };

  obj: any = {
    isDescriptorExpanded: true,
    isMoreDescriptorDetail: false,
    isJOCExpanded: false,
    isAgentExpanded: false,
    isControllerExpanded: false,
    isLicenseExpanded: false,
    isCertificateExpanded: false
  };

  mainObj: any = {};
  securityLevel: Array<string> = ['low', 'medium', 'high'];
  dbmsInit: Array<string> = ['byInstaller', 'byJoc', 'off'];
  methods: Array<string> = ['publickey'];

  isValid = false;
  errorMessages: Array<string> = [];

  constructor(private coreService: CoreService, private modal: NzModalService) {

  }

  ngOnInit(): void {

  }

  addLicense(): void {
    this.data.license = {};
    this.obj.isLicenseExpanded = true;
  }

  addAgent(): void {
    if (!this.data.agents) {
      this.data.agents = [];
    }
    this.obj.isAgentExpanded = true;
    this.data.agents.push({
      target: {
        connection: {},
        authentication: {},
        makeService: false
      },
      media: {},
      installation: {},
      configuration: {
        controller: {},
        certificates: {},
        templates: [{name: ''}]
      }
    });
  }

  removeAgent(index = -1): void {

    if (index > -1) {
      this.data.agents.splice(index, 1);
    } else {
      this.data.agents = [];
    }
  }

  addJOC(): void {
    if (!this.data.joc) {
      this.data.joc = [];
    }
    this.obj.isJOCExpanded = true;
    this.data.joc.push({
      isJOCExpanded: true,
      jocClusterId: '',
      cluster: [{
        target: {
          connection: {},
          authentication: {},
          makeService: false
        },
        media: {},
        installation: {
          isUser: true,
          isPreserveEnv: true
        },
        configuration: {
          certificates: {},
          templates: [{name: ''}],
          startFiles: {}
        }
      }]
    });
  }

  removeJOC(index = -1): void {
    if (index > -1) {
      this.data.joc.splice(index, 1);
    } else {
      this.data.joc = [];
    }
  }

  addCertificates(): void {
    this.data.certificates = {
      controller: {},
      joc: {}
    };
    this.obj.isCertificateExpanded = true;
  }

  addSecondaryJOC(cluster): void {
    if (!this.data.license) {
      this.data.license = {};
    }
    cluster.push({
      target: {
        connection: {},
        authentication: {},
        makeService: false
      },
      media: {},
      installation: {
        isUser: true,
        isPreserveEnv: true
      },
      configuration: {
        certificates: {},
        templates: [{name: ''}],
        startFiles: {}
      }
    });
  }

  addAnotherJOC(): void {
    this.addJOC();
  }

  removeSecondaryObj(data): void {
    data.cluster.splice(1, 1);
  }

  addController(): void {
    if (!this.data.controllers) {
      this.data.controllers = [];
    }
    this.obj.isControllerExpanded = true;
    this.data.controllers.push(
      {
        isControllerExpanded: true,
        controllerId: '',
        cluster: [{
          target: {
            connection: {},
            authentication: {},
            makeService: false
          },
          media: {},
          installation: {},
          configuration: {
            certificates: {},
            templates: [{name: ''}]
          }
        }]
      });
  }

  removeController(index = -1): void {
    if (index > -1) {
      this.data.controllers.splice(index, 1);
    } else {
      this.data.controllers = [];
    }
  }

  addSecondaryController(cluster): void {
    if (!this.data.license) {
      this.data.license = {};
    }
    cluster.push({});
  }

  addAnotherAgent(): void {
    this.addAgent();
  }

  addTemplates(list): void {
    list.push({name: ''});
  }

  removeTemplates(list, index): void {
    list.splice(index, 1);
  }

  convertJSON(): void {

  }

  private checkAndUpdateObj(obj, type, source): void {
    if (type === 'joc' && !source.ordering) {
      this.isValid = false;
      this.errorMessages.push('JOC ordering value is required');
    } else {
      obj.ordering = source.ordering;
    }
    console.log(obj);
    console.log(source);
    if (!isEmpty(source.target.connection) || !isEmpty(source.target.authentication)
      || source.target.packageLocation || source.target.execPre || source.target.execPost || source.target.makeService) {
      obj.target = {
        packageLocation: source.target.packageLocation,
        execPre: source.target.execPre,
        execPost: source.target.execPost,
        makeService: source.target.makeService
      };
    }
    if (source.target.connection && !isEmpty(source.target.connection)) {
      if (!obj.target.connection) {
        obj.target.connection = {};
      }
      if (!source.target.connection.host) {
        this.isValid = false;
        this.errorMessages.push('Connection host is required');
      }
      obj.target.connection = source.target.connection;
    }
    if (source.target.authentication && !isEmpty(source.target.authentication)) {
      if (!obj.target.authentication) {
        obj.target.authentication = {};
      }
      if (!source.target.authentication.method || !source.target.authentication.user) {
        this.isValid = false;
        this.errorMessages.push(!source.target.authentication.method ? 'Authentication method is required' : 'Authentication user is required');
      }
      obj.target.authentication = source.target.authentication;
    }

    if (source.media && !isEmpty(source.media)) {
      if (!source.media.release || !source.media.tarball) {
        this.isValid = false;
        this.errorMessages.push(!source.media.release ? 'Media release is required' : 'Media tarball is required');
      }
      obj.media = source.media;
    } else {
      this.isValid = false;
      this.errorMessages.push('Media is required');
    }

    if (source.installation && !isEmpty(source.installation)) {
      if ((type == 'joc' && !source.installation.setupDir) || !source.installation.home || !source.installation.data) {
        this.isValid = false;
        this.errorMessages.push((type == 'joc' && !source.installation.setupDir) ? 'Installation setupDir is required' : !source.installation.home ? 'Installation home is required' : 'Installation data is required');
      }
      if (!source.installation.httpPort && !source.installation.httpsPort) {
        this.isValid = false;
        this.errorMessages.push('Installation http or https port is required');
      }
      obj.installation = source.installation;
    } else {
      this.isValid = false;
      this.errorMessages.push('Installation is required');
    }

    if (source.configuration && !isEmpty((source.configuration))) {
      if (source.configuration.responseDir || !isEmpty(source.configuration.certificates) || !isEmpty(source.configuration.startFiles) || source.configuration.templates.length > 0) {
        obj.configuration = {};
        if (source.configuration.responseDir) {
          obj.configuration.responseDir = source.configuration.responseDir;
        }
        if (source.configuration.templates.length > 0) {
          source.configuration.templates.forEach((temp) => {
            if (temp.name) {
              if (!obj.configuration.templates) {
                obj.configuration.templates = [];
              }
              obj.configuration.templates.push(temp.name)
            }
          });
        }

        if (source.configuration.startFiles && !isEmpty(source.configuration.startFiles)) {
          obj.configuration.startFiles = source.configuration.startFiles;
        }

        if (!isEmpty(source.configuration.certificates)) {
          obj.configuration.certificates = source.configuration.certificates;
          if (!source.configuration.certificates.keyStore || !source.configuration.certificates.keyStorePassword || !source.configuration.certificates.keyPassword
            || !source.configuration.certificates.trustStore || !source.configuration.certificates.trustStorePassword) {
            this.isValid = false;
            this.errorMessages.push(!source.configuration.certificates.keyStore ? 'Key store certificate is required' : !source.configuration.certificates.keyStorePassword ? 'Key store password certificate is required' :
              !source.configuration.certificates.keyPassword ? 'Key password certificate is required' : !source.configuration.certificates.trustStore ? 'Trust store certificate is required' : 'Trust store password certificate is required');
          }
        }

        if (isEmpty(obj.configuration)) {
          delete obj.configuration;
        }
      }
    }
  }

  validate(): void {
    this.isValid = true;
    this.errorMessages = [];
    this.mainObj = {
      descriptor: this.data.descriptor
    };
    if (!this.data.descriptor.descriptorId) {
      this.isValid = false;
      this.errorMessages.push('Descriptor Id is required');
    }
    if (this.data.joc.length == 0 && this.data.agents.length == 0 && this.data.controllers.length == 0) {
      this.isValid = false;
      this.errorMessages.push('Minimum one of JOC, Controllers or Agents is required');
    }
    if (this.data.license) {
      if (!isEmpty(this.data.license)) {
        this.mainObj['license'] = this.data.license;
        if (!this.data.license.licenseKeyFile || !this.data.license.licenseBinFile) {
          this.isValid = false;
          this.errorMessages.push(this.data.license.licenseKeyFile ? 'License bin file is required' : 'License key file is required');
        }
      } else {
        this.isValid = false;
        this.errorMessages.push('License is required for cluster');
      }
    }
    if (this.data.certificates && !isEmpty(this.data.certificates)) {
      if (isEmpty(this.data.certificates.controller) && isEmpty(this.data.certificates.joc)) {

      } else {
        this.mainObj['certificates'] = this.data.certificates;
        if (isEmpty(this.data.certificates.controller)) {
          if (!this.data.certificates.joc.primaryJocCert || !this.data.certificates.joc.secondaryJocCert) {
            this.isValid = false;
            this.errorMessages.push(this.data.joc.primaryJocCert ? 'Primary JOC certificate is required' : 'Secondary JOC certificate is required');
          }
        } else {
          if (!this.data.certificates.controller.primaryControllerCert || !this.data.certificates.controller.secondaryControllerCert) {
            this.isValid = false;
            this.errorMessages.push(this.data.controller.primaryControllerCert ? 'Primary Controller certificate is required' : 'Secondary Controller certificate is required');
          }
        }
      }
    }
    if (this.data.joc && this.data.joc.length > 0) {
      this.data.joc.forEach((joc) => {
        if (!joc.jocClusterId) {
          this.isValid = false;
          this.errorMessages.push('Joc cluster Id is required');
        } else {
          if (!this.mainObj['joc']) {
            this.mainObj['joc'] = {};
          }
          joc.cluster.forEach((element, index) => {
            if (!this.mainObj.joc[joc.jocClusterId]) {
              this.mainObj.joc[joc.jocClusterId] = {};
            }
            if (index == 0) {
              this.mainObj.joc[joc.jocClusterId].primary = {};
              this.checkAndUpdateObj(this.mainObj.joc[joc.jocClusterId].primary, 'joc', element);
            } else {
              this.mainObj.joc[joc.jocClusterId].secondary = {};
              this.checkAndUpdateObj(this.mainObj.joc[joc.jocClusterId].secondary, 'joc', element);
            }
          });
        }
      });
    }
    if (this.data.agents && !isEmpty(this.data.agents)) {
      this.data.agents.forEach((agent) => {
        if (!agent.agentId) {
          this.isValid = false;
          this.errorMessages.push('Agent Id is required');
        } else {
          if (!this.mainObj['agents']) {
            this.mainObj['agents'] = {};
          }
          if (!this.mainObj.agents[agent.agentId]) {
            this.mainObj.agents[agent.agentId] = {};
          }

          this.checkAndUpdateObj(this.mainObj.agents[agent.agentId], 'agent', agent);
        }
      });
    }
    if (this.data.controllers && this.data.controllers.length > 0) {
      this.data.controllers.forEach((controller) => {
        if (!controller.controllerId) {
          this.isValid = false;
          this.errorMessages.push('Controller Id is required');
        } else {
          this.mainObj['controllers'] = {};
          controller.cluster.forEach((element, index) => {
            if (!this.mainObj.controllers[controller.controllerId]) {
              this.mainObj.controllers[controller.controllerId] = {};
            }
            if (index == 0) {
              this.mainObj.controllers[controller.controllerId].primary = {};
              this.checkAndUpdateObj(this.mainObj.controllers[controller.controllerId].primary, 'controllers', element);
            } else {
              this.mainObj.controllers[controller.controllerId].secondary = {};
              this.checkAndUpdateObj(this.mainObj.controllers[controller.controllerId].secondary, 'controllers', element);
            }
          });
        }
      });
    }
  }

  editJSON(): void {
    this.validate();
    this.modal.create({
      nzTitle: undefined,
      nzContent: ShowJsonModalComponent,
      nzAutofocus: null,
      nzClassName: 'lg',
      nzComponentParams: {
        object: this.mainObj
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    }).afterClose.subscribe(result => {
      if (result) {
        this.mainObj = result;
        this.updateJSONObject();
      }
    });
  }

  undo(): void {

  }

  redo(): void {

  }

  download(): void {
    this.validate();
    const name = this.data.descriptor.descriptorId + '-descriptor' + '.json';
    const fileType = 'application/octet-stream';
    const data = JSON.stringify(this.mainObj, undefined, 2);
    const blob = new Blob([data], {type: fileType});
    saveAs(blob, name);
  }

  upload(): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: UploadModalComponent,
      nzClassName: 'lg',
      nzComponentParams: {},
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.mainObj = result;
        this.updateJSONObject();
      }
    });
  }

  private updateJSONObject(): void {
    this.data.descriptor = this.mainObj.descriptor;
    this.data.license = this.mainObj.license;
    this.data.certificates = this.mainObj.certificates;
    if (!isEmpty(this.mainObj.joc)) {
      this.data.joc = [];
      this.mainObj.joc.forEach((config) => {
        const obj: any = {
          isJOCExpanded: true,
          jocClusterId: '',
          cluster: []
        };
        for (let i in config) {
          console.log(i, config[i]);
          obj.jocClusterId = i;
          if (config[i].primary) {
            this.updateMissingObjects(config[i].primary, true);
            obj.cluster.push(config[i].primary)
          }
          if (config[i].secondary) {
            this.updateMissingObjects(config[i].secondary, true);
            obj.cluster.push(config[i].secondary)
          }
        }
        this.data.joc.push(obj);
      });
    }
    if (!isEmpty(this.mainObj.agents)) {
      this.data.agents = [];
      this.mainObj.agents.forEach((config) => {
        let obj: any = {};
        for (let i in config) {
          obj = config[i];
          obj.agentId = i;
        }
        this.updateMissingObjects(obj);
        this.data.agents.push(obj);
      });
    }
    if (!isEmpty(this.mainObj.controllers)) {
      this.data.controllers = [];
      this.mainObj.controllers.forEach((config) => {
        const obj: any = {
          isControllerExpanded: true,
          controllerId: '',
          cluster: []
        };
        for (let i in config) {
          obj.controllerId = i;
          if (config[i].primary) {
            this.updateMissingObjects(config[i].primary);
            obj.cluster.push(config[i].primary)
          }
          if (config[i].secondary) {
            this.updateMissingObjects(config[i].secondary);
            obj.cluster.push(config[i].secondary)
          }
        }

        this.data.controllers.push(obj);
      });
    }
  }

  private updateMissingObjects(obj, isJoc = false): void {
    if (!obj.target || isEmpty(obj.target)) {
      obj.target = {
        connection: {},
        authentication: {},
        makeService: false
      };
    }
    if (!obj.media) {
      obj.media = {};
    }
    if (!obj.installation) {
      obj.installation = {};
    }
    if (!obj.configuration || isEmpty(obj.configuration)) {
      obj.configuration = {
        certificates: {},
        templates: [{name: ''}]
      };
      if (isJoc) {
        obj.configuration.startFiles = {};
      }
    } else {
      if (!obj.configuration.certificates) {
        obj.configuration.certificates = {};
      }
      if (!obj.configuration.templates || !isArray(obj.configuration.templates) || obj.configuration.templates.length == 0) {
        obj.configuration.templates = [{name: ''}];
      } else {
        obj.configuration.templates = obj.configuration.templates.map(item => {
          return {name: item};
        })
      }
    }
  }
}
