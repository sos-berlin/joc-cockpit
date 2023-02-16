import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {isEmpty, isArray} from 'underscore';
import {saveAs} from 'file-saver';
import {NzModalRef, NzModalService} from "ng-zorro-antd/modal";
import {JsonEditorComponent, JsonEditorOptions} from "ang-jsoneditor";
import {ClipboardService} from "ngx-clipboard";
import {NzMessageService} from "ng-zorro-antd/message";
import {FileUploader} from "ng2-file-upload";
import {TranslateService} from "@ngx-translate/core";
import {ToastrService} from "ngx-toastr";
import {CoreService} from '../../services/core.service';

declare const $: any;

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
  selector: 'app-bulk-update',
  templateUrl: './bulk-update-dialog.html'
})
export class BulkUpdateModalComponent implements OnInit {
  @Input() listOfObjects: any;
  @Input() securityLevel: Array<string>;
  @Input() dbmsInit: Array<string>;
  @Input() methods: Array<string>;
  selectObject = {
    operationType: 'JOC'
  };
  submitted = false;
  object: any = {};
  data: any;
  list = [];

  constructor(public coreService: CoreService, public activeModal: NzModalRef) {

  }

  ngOnInit(): void {
    if (this.listOfObjects && this.listOfObjects.size > 0) {
      let arr = Array.from(this.listOfObjects);
      for (let i = 0; i < arr.length; i++) {
        let obj: any = arr[i];
        let tempArr = obj.split('__');
        this.list.push({
          name: tempArr[0],
          value: tempArr[1],
        })
      }
    }
    this.data = {
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
    };
  }

  addTemplates(list): void {
    list.push({name: ''});
  }

  removeTemplates(list, index): void {
    list.splice(index, 1);
  }

  onSubmit(): void {
    this.submitted = true;
    setTimeout(() => {
      const obj = this.coreService.clone(this.data);
      obj.configuration.templates = obj.configuration.templates.filter(item => {
        return !!item.name;
      });
      if (obj.configuration.templates.length == 0) {
        delete obj.configuration['templates'];
      }

      this.activeModal.close({
        data: obj,
        checkValues: this.object,
        operationType: this.selectObject.operationType,
        list: this.list
      });
    }, 100);
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
  }

  copyToClipboard(): void {
    this.coreService.showCopyMessage(this.message);
    this.clipboardService.copyFromContent(this.editor.getText());
  }

  onSubmit(): void {
    this.submitted = true;
    setTimeout(() => {
      this.activeModal.close(this.editor.get());
    }, 100);
  }

}

@Component({
  selector: 'app-deployment',
  templateUrl: './deployment.component.html'
})
export class DeploymentComponent implements OnInit, OnDestroy {
  nodes: any = [];
  data: any = {
    descriptor: {},
    agents: [],
    controllers: {},
    joc: {}
  };

  obj: any = {
    isDescriptorExpanded: true,
    isMoreDescriptorDetail: false,
    isJOCExpanded: false,
    isAgentExpanded: false,
    isControllerExpanded: false,
    isLicenseExpanded: false
  };

  mainObj: any = {};
  securityLevel: Array<string> = ['low', 'medium', 'high'];
  dbmsInit: Array<string> = ['byInstaller', 'byJoc', 'off'];
  methods: Array<string> = ['publickey'];

  isValid = false;
  errorMessages: Array<string> = [];
  history = [];
  indexOfNextAdd = 0;
  copyObject: any;

  object = {
    setOfCheckedId: new Set()
  };

  constructor(private coreService: CoreService, private modal: NzModalService, private message: NzMessageService) {

  }

  ngOnInit(): void {
    this.getTree();
    if (sessionStorage.descriptorObj) {
      let obj = JSON.parse(sessionStorage.descriptorObj);
      if (!isEmpty(obj)) {
        this.data = obj;
      }
    }
  }

  ngOnDestroy(): void {
    if (!isEmpty(this.data)) {
      sessionStorage.descriptorObj = JSON.stringify(this.data);
    }
  }

  private getTree(): void {
    this.coreService.post('tree', {
      forInventory: true,
      types: ['DEPLOYMENTDESCRIPTOR']
    }).subscribe((res: any) => {
      if (res.folders.length === 0) {
        res.folders.push({name: '', path: '/'});
      }
      this.nodes = this.coreService.prepareTree(res, true);
      console.log(this.nodes)
    });
  }

  /** Actions */
  addLicense(): void {
    this.data.license = {};
    this.obj.isLicenseExpanded = true;
  }

  addAgent(flag = false): void {
    if (!this.data.agents) {
      this.data.agents = [];
    }
    this.obj.isAgentExpanded = true;
    this.data.agents.push({
      isAgentPropertiesExpanded: flag,
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
      this.data.joc = {
        members: {
          instances: []
        }
      };
    } else if (!this.data.joc.members) {
      this.data.joc.members = {
        instances: []
      };
    }
    if (!this.data.joc.members.instances) {
      this.data.joc.members.instances = [];
    }
    this.obj.isJOCExpanded = true;
    this.data.joc.members.instances.push({
      ordering: 1,
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

  removeJOC(): void {
    this.data.joc = {};
  }

  copy(type, objectType, index1): void {
    this.copyObject = {
      type,
      objectType,
      data: this.data[type]
    };
    if (type == 'joc') {
      if (objectType !== 'instance') {
        this.copyObject.data = this.data[type].members.instances[index1][objectType];
      } else {
        this.copyObject.data = this.data[type].members.instances[index1];
      }
    } else if (type === 'controllers') {
      if (objectType !== 'instance') {
        this.copyObject.data = this.data[type].cluster[index1][objectType];
      } else {
        this.copyObject.data = this.data[type].cluster[index1];
      }
    } else {
      if (objectType !== 'instance') {
        this.copyObject.data = this.data[type][index1][objectType];
      } else {
        this.copyObject.data = this.data[type][index1];
      }
    }
    if (this.copyObject.data) {
      console.log(this.copyObject)
      this.coreService.showCopyMessage(this.message);
    } else {
      this.copyObject = undefined;
      this.coreService.showCopyMessage(this.message, 'cannotCopyEmptyObject', 'info');
    }
  }

  paste(type, objectType, index1): void {
    if (this.copyObject && type == this.copyObject.type) {
      if (type == 'joc') {
        if (objectType !== 'instance') {
          this.data[type].members.instances[index1][objectType] = this.copyObject.data;
        } else {
          this.data[type].members.instances[index1] = this.copyObject.data;
        }
      } else if (type === 'controllers') {
        if (objectType !== 'instance') {
          this.data[type].cluster[index1][objectType] = this.copyObject.data;
        } else {
          this.copyObject.data = this.data[type].cluster[index1];
        }
      } else {
        if (objectType !== 'instance') {
          this.data[type][index1][objectType] = this.copyObject.data;
        } else {
          this.data[type][index1] = this.copyObject.data;
        }
      }
    }
  }

  addAnotherJOCInstance(members): void {
    members.instances.push({
      ordering: members.instances.length + 1,
      isJOCPropertiesExpanded: true,
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

  removeSecondaryObj(list, index): void {
    list.splice(index, 1);
  }

  addController(): void {
    if (!this.data.controllers) {
      this.data.controllers = {
        cluster: []
      };
    }
    if (!this.data.controllers.cluster) {
      this.data.controllers.cluster = [];
    }
    this.obj.isControllerExpanded = true;
    this.data.controllers.cluster.push({
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
      }
    );
  }

  removeController(): void {
    this.data.controllers = {};
  }

  addSecondaryController(cluster): void {
    cluster.push({
      isControllerPropertiesExpanded: true,
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
    });
  }

  addAnotherAgent(): void {
    this.addAgent(true);
  }

  addTemplates(list): void {
    list.push({name: ''});
  }

  removeTemplates(list, index): void {
    list.splice(index, 1);
  }

  onItemChecked(id: any, checked: boolean, type: string): void {
    if (checked) {
      this.object.setOfCheckedId.add(id + type);
    } else {
      this.object.setOfCheckedId.delete(id + type);
    }
  }

  convertJSON(): void {
    if (this.history.length === 20) {
      this.history.shift();
    }
    this.history.push(JSON.stringify(this.data));
    this.indexOfNextAdd = this.history.length - 1;
  }

  private checkAndUpdateObj(obj, type, source, index): void {
    if (type == 'joc') {
      this.data.joc.members.instances[index].isJOCPropertiesExpanded = true;
    } else if (type == 'agents') {
      this.data.agents[index].isAgentPropertiesExpanded = true;
    } else if (type == 'controllers') {
      this.data.controllers.cluster[index].isControllerPropertiesExpanded = true;
    }
    if (type === 'joc') {
      if (!source.ordering) {
        this.navToField('ordering' + index, type);
        this.errorMessages.push('JOC ordering is required');
      } else {
        obj.ordering = source.ordering;
      }
      if (!source.instanceId) {
        this.navToField('jocInstanceId' + index, type);
        this.errorMessages.push('JOC instance ID is required');
      } else {
        obj.instanceId = source.instanceId;
      }
    }

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
        this.navToField((type == 'controllers' ? 'c' : type == 'agents' ? 'a' : '') + 'host' + index, type);
        this.errorMessages.push('Connection host is required');
      }
      obj.target.connection = source.target.connection;
    }
    if (source.target.authentication && !isEmpty(source.target.authentication)) {
      if (!obj.target.authentication) {
        obj.target.authentication = {};
      }
      if (!source.target.authentication.method || !source.target.authentication.user) {
        let id;
        if (!source.target.authentication.method) {
          id = 'method';
        } else {
          id = 'user';
        }
        this.navToField((type == 'controllers' ? 'c' : type == 'agents' ? 'a' : '') + id + index, type);
        this.errorMessages.push(!source.target.authentication.method ? 'Authentication method is required' : 'Authentication user is required');
      }
      obj.target.authentication = source.target.authentication;
    }

    if (source.media && !isEmpty(source.media)) {
      if (!source.media.release || !source.media.tarball) {
        let id;
        if (!source.media.release) {
          id = 'release';
        } else {
          id = 'tarball';
        }
        this.navToField((type == 'controllers' ? 'c' : type == 'agents' ? 'a' : '') + id + index, type);
        this.errorMessages.push(!source.media.release ? 'Media release is required' : 'Media tarball is required');
      }
      obj.media = source.media;
    } else {
      this.isValid = false;
      this.errorMessages.push('Media is required');
    }

    if (source.installation && !isEmpty(source.installation)) {
      if ((type == 'joc' && !source.installation.setupDir) || !source.installation.home || !source.installation.data) {
        let id;
        if (!source.installation.home) {
          id = 'home';
        } else if (!source.installation.data) {
          id = 'data';
        } else {
          id = 'setupDir';
        }
        this.navToField((type == 'controllers' ? 'c' : type == 'agents' ? 'a' : '') + id + index, type);
        this.errorMessages.push((type == 'joc' && !source.installation.setupDir) ? 'Installation setupDir is required' : !source.installation.home ? 'Installation home is required' : 'Installation data is required');
      }
      if (!source.installation.httpPort && !source.installation.httpsPort) {
        this.navToField((type == 'controllers' ? 'c' : type == 'agents' ? 'a' : '') + 'httpPort' + index, type);
        this.errorMessages.push('Installation http or https port is required');
      }
      obj.installation = source.installation;
    } else {
      this.isValid = false;
      this.errorMessages.push('Installation is required');
    }

    if (source.configuration && !isEmpty((source.configuration))) {
      if (source.configuration.jocCert || source.configuration.controllerCert || source.configuration.responseDir || !isEmpty(source.configuration.certificates) || !isEmpty(source.configuration.startFiles) || source.configuration.templates.length > 0) {
        obj.configuration = {};
        if (source.configuration.jocCert) {
          obj.configuration.jocCert = source.configuration.jocCert;
        }
        if (source.configuration.controllerCert) {
          obj.configuration.controllerCert = source.configuration.controllerCert;
        }
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
        if (source.configuration.controllerRef) {
          obj.configuration.controllerRef = source.configuration.controllerRef;
        }
        if (!isEmpty(source.configuration.certificates)) {
          obj.configuration.certificates = source.configuration.certificates;
          if (!source.configuration.certificates.keyStore || !source.configuration.certificates.keyStorePassword || !source.configuration.certificates.keyPassword
            || !source.configuration.certificates.trustStore || !source.configuration.certificates.trustStorePassword) {
            let id;
            if (!source.configuration.certificates.keyStore) {
              id = 'keyStore';
            } else if (!source.configuration.certificates.keyStorePassword) {
              id = 'keyStorePassword';
            } else if (!source.configuration.certificates.keyPassword) {
              id = 'keyPassword';
            } else if (!source.configuration.certificates.trustStore) {
              id = 'trustStore';
            } else {
              id = 'trustStorePassword';
            }
            this.navToField((type == 'controllers' ? 'c' : type == 'agents' ? 'a' : '') + id + index, type);
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


  private navToField(id, type): void {
    if (this.isValid) {
      if (type == 'descriptor') {
        this.obj.isDescriptorExpanded = true;
      } else if (type == 'joc') {
        this.obj.isJOCExpanded = true;
      } else if (type == 'agents') {
        this.obj.isAgentExpanded = true;
      } else if (type == 'controllers') {
        this.obj.isControllerExpanded = true;
      }
      this.isValid = false;
      setTimeout(() => {
        const dom = document.getElementById(id)
        if (dom) {
          if (dom.className && dom.className.match('ant-input-number')) {
            const input = $('.ant-input-number input');
            input.focus();
            dom.scrollIntoView();
            input.blur();
          } else {
            dom.focus();
            dom.scrollIntoView();
            dom.blur();
          }
        }
      }, 1)
    }
  }

  validate(): void {
    this.isValid = true;
    this.errorMessages = [];
    this.mainObj = {
      descriptor: this.data.descriptor
    };
    if (!this.data.descriptor.descriptorId) {
      this.navToField('descriptorId', 'descriptor');
      this.errorMessages.push('Descriptor Id is required');
    }
    if (this.data.joc?.members.length == 0 && this.data.agents.length == 0 && this.data.controllers?.cluster.length == 0) {
      this.isValid = false;
      this.errorMessages.push('Minimum one of JOC, Controllers or Agents is required');
    }
    if (this.data.license) {
      if (!isEmpty(this.data.license)) {
        this.mainObj['license'] = this.data.license;
        if (!this.data.license.licenseKeyFile || !this.data.license.licenseBinFile) {
          this.navToField(!this.data.license.licenseKeyFile ? 'licenseKeyFile' : 'licenseBinFile', 'license');
          this.errorMessages.push(this.data.license.licenseKeyFile ? 'License bin file is required' : 'License key file is required');
        }
      } else {
        this.isValid = false;
        this.errorMessages.push('License is required for cluster');
      }
    }

    if (this.data.agents && this.data.agents.length > 0) {
      this.mainObj['agents'] = [];
      this.data.agents.forEach((agent, i) => {
        if (!agent.agentId) {
          this.navToField('agentId' + i, 'agents');
          this.errorMessages.push('Agent Id is required');
        } else {
          let obj = {
            agentId: agent.agentId
          };
          this.checkAndUpdateObj(obj, 'agents', agent, i);
          this.mainObj.agents.push(obj);
        }
      });
    }

    if (this.data.controllers?.cluster.length > 0) {
      this.mainObj['controllers'] = {};
      if (!this.data.controllers.controllerId) {
        this.isValid = false;
        this.errorMessages.push('Controller Id is required');
      } else {
        this.mainObj['controllers'].controllerId = this.data.controllers.controllerId;
      }
      if (!this.data.controllers.jocRef) {
        this.isValid = false;
        this.errorMessages.push('jocRef is required');
      } else {
        this.mainObj['controllers'].jocRef = this.data.controllers.jocRef;
      }
      this.data.controllers.cluster.forEach((element, i) => {
        if (i == 0) {
          this.mainObj['controllers'].primary = {};
          this.checkAndUpdateObj(this.mainObj['controllers'].primary, 'controllers', element, i);
        } else {
          this.mainObj['controllers'].secondary = {};
          this.checkAndUpdateObj(this.mainObj['controllers'].secondary, 'controllers', element, i);
        }
      });
    }
    if (this.data.joc?.members?.instances.length > 0) {
      this.mainObj['joc'] = {
        members: {
          instances: []
        }
      };
      if (!this.data.joc.members.clusterId) {
        this.navToField('clusterId', 'joc');
        this.errorMessages.push('JOC Cluster Id is required');
      } else {
        this.mainObj.joc.members.clusterId = this.data.joc.members.clusterId;
      }
      this.data.joc.members.instances.forEach((joc, i) => {
        let obj = {};
        this.checkAndUpdateObj(obj, 'joc', joc, i);
        this.mainObj.joc.members.instances.push(obj);
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

  bulkUpdate(): void {
    this.modal.create({
      nzTitle: undefined,
      nzContent: BulkUpdateModalComponent,
      nzAutofocus: null,
      nzClassName: 'lg',
      nzComponentParams: {
        listOfObjects: this.object.setOfCheckedId,
        securityLevel: this.securityLevel,
        dbmsInit: this.dbmsInit,
        methods: this.methods
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    }).afterClose.subscribe(result => {
      if (result && !isEmpty(result.checkValues)) {
        if (result.list.length == 0) {
          if (result.operationType == 'JOC') {
            this._bulkUpdate(result.data, this.data.joc, result.checkValues);
          } else if (result.operationType == 'CONTROLLER') {
            this._bulkUpdate(result.data, this.data.controllers, result.checkValues);
          } else if (result.operationType == 'AGENT') {
            this._bulkUpdate(result.data, this.data.agents, result.checkValues);
          } else {
            this._bulkUpdate(result.data, this.data.joc, result.checkValues);
            this._bulkUpdate(result.data, this.data.controllers, result.checkValues);
            this._bulkUpdate(result.data, this.data.agents, result.checkValues);
          }
        } else {
          result.list.forEach(item => {
            if (item.value == 'JOC') {
              this.data.joc.forEach((val) => {
                if (val.cluster && val.jocClusterId == item.name) {
                  val.cluster.forEach((cluster) => {
                    this.updateIndividualData(result.data, cluster, result.checkValues);
                  });
                }
              });
            } else if (item.value == 'AGENT') {
              this.data.agents.forEach((val) => {
                if (val.agentId == item.name) {
                  this.updateIndividualData(result.data, val, result.checkValues);
                }
              });
            } else {
              this.data.controllers.forEach((val) => {
                if (val.cluster && val.controllerId == item.name) {
                  val.cluster.forEach((cluster) => {
                    this.updateIndividualData(result.data, cluster, result.checkValues);
                  });
                }
              });
            }
          });
        }
      }
    });
  }

  private _bulkUpdate(obj, list, checkValues): void {
    list.forEach((item) => {
      if (item.cluster) {
        item.cluster.forEach((cluster) => {
          this.updateIndividualData(obj, cluster, checkValues);
        });
      } else {
        this.updateIndividualData(obj, item, checkValues);
      }
    });
  }

  private updateIndividualData(obj, data, checkValues): void {
    if (obj.target) {
      if (obj.target.connection) {
        if (checkValues.host) {
          data.target.connection.host = obj.target.connection.host;
        }
        if (checkValues.port) {
          data.target.connection.port = obj.target.connection.port;
        }
      }
      if ((obj.target.authentication)) {
        if (checkValues.method) {
          data.target.authentication.method = obj.target.authentication.method;
        }
        if (checkValues.user) {
          data.target.authentication.user = obj.target.authentication.user;
        }
        if (checkValues.keyFile) {
          data.target.authentication.keyFile = obj.target.authentication.keyFile;
        }
      }
      if (checkValues.packageLocation) {
        data.target.packageLocation = obj.target.packageLocation;
      }
      if (checkValues.execPre) {
        data.target.execPre = obj.target.execPre;
      }
      if (checkValues.execPost) {
        data.target.execPost = obj.target.execPost;
      }
      if (checkValues.makeService) {
        data.target.makeService = obj.target.makeService;
      }
    }
    if (obj.media) {
      if (checkValues.release) {
        data.media.release = obj.media.release;
      }
      if (checkValues.tarball) {
        data.media.tarball = obj.media.tarball;
      }
    }
    if (obj.installation) {
      if (checkValues.setupDir) {
        data.installation.setupDir = obj.installation.setupDir;
      }
      if (checkValues.home) {
        data.installation.home = obj.installation.home;
      }
      if (checkValues.data) {
        data.installation.data = obj.installation.data;
      }
      if (checkValues.homeOwner) {
        data.installation.homeOwner = obj.installation.homeOwner;
      }
      if (checkValues.dataOwner) {
        data.installation.dataOwner = obj.installation.dataOwner;
      }
      if (checkValues.title) {
        data.installation.title = obj.installation.title;
      }
      if (checkValues.securityLevel) {
        data.installation.securityLevel = obj.installation.securityLevel;
      }
      if (checkValues.dbmsConfig) {
        data.installation.dbmsConfig = obj.installation.dbmsConfig;
      }
      if (checkValues.dbmsDriver) {
        data.installation.dbmsDriver = obj.installation.dbmsDriver;
      }
      if (checkValues.dbmsInit) {
        data.installation.dbmsInit = obj.installation.dbmsInit;
      }
      if (checkValues.httpPort) {
        data.installation.httpPort = obj.installation.httpPort;
      }
      if (checkValues.httpsPort) {
        data.installation.httpsPort = obj.installation.httpsPort;
      }
      if (checkValues.javaHome) {
        data.installation.javaHome = obj.installation.javaHome;
      }
      if (checkValues.javaOptions) {
        data.installation.javaOptions = obj.installation.javaOptions;
      }
      if (checkValues.isUser == false) {
        data.installation.isUser = obj.installation.isUser;
      }
      if (checkValues.isPreserveEnv == false) {
        data.installation.isPreserveEnv = obj.installation.isPreserveEnv;
      }
    }
    if (obj.configuration) {
      if (checkValues.responseDir) {
        data.configuration.responseDir = obj.configuration.responseDir;
      }
      if ((obj.configuration.certificates)) {
        if (checkValues.keyStore) {
          data.configuration.certificates.keyStore = obj.configuration.certificates.keyStore;
        }
        if (checkValues.keyStorePassword) {
          data.configuration.certificates.keyStorePassword = obj.configuration.certificates.keyStorePassword;
        }
        if (checkValues.keyPassword) {
          data.configuration.certificates.keyPassword = obj.configuration.certificates.keyPassword;
        }
        if (checkValues.keyAlias) {
          data.configuration.certificates.keyAlias = obj.configuration.certificates.keyAlias;
        }
        if (checkValues.trustStore) {
          data.configuration.certificates.trustStore = obj.configuration.certificates.trustStore;
        }
        if (checkValues.trustStorePassword) {
          data.configuration.certificates.trustStorePassword = obj.configuration.certificates.trustStorePassword;
        }
      }
      if ((obj.configuration.startFiles)) {
        if (checkValues.httpIni) {
          data.configuration.startFiles.httpIni = obj.configuration.startFiles.httpIni;
        }
        if (checkValues.httpsIni) {
          data.configuration.startFiles.httpsIni = obj.configuration.startFiles.httpsIni;
        }
        if (checkValues.sslIni) {
          data.configuration.startFiles.sslIni = obj.configuration.startFiles.sslIni;
        }
      }
      if ((obj.configuration.controllerRef)) {
        data.configuration.controllerRef = obj.configuration.controllerRef;
      }
      if (obj.configuration.templates && obj.configuration.templates.length > 0) {
        data.configuration.templates = obj.configuration.templates;
      }
    }
  }

  expandAll(flag = true): void {
    this.obj.isDescriptorExpanded = flag;
    this.obj.isLicenseExpanded = flag;
    this.toggleNode('certificates', flag);
    this.toggleNode('joc', flag);
    this.toggleNode('agents', flag);
    this.toggleNode('controllers', flag);
  }

  collapseAll(): void {
    this.expandAll(false);
  }

  toggleNode(type, flag = true): void {
    if (type == 'joc') {
      this.obj.isJOCExpanded = flag;
      if (this.data[type]?.members?.instances) {
        this.data[type]?.members?.instances.forEach(item => {
          item.isJOCPropertiesExpanded = flag;
        });
      }
    } else if (type == 'agents') {
      this.obj.isAgentExpanded = flag;
      if (this.data[type]) {
        this.data[type].forEach(item => {
          item.isAgentPropertiesExpanded = flag;
        });
      }
    } else if (type == 'controllers') {
      this.obj.isControllerExpanded = flag;
      if (this.data[type]?.cluster) {
        this.data[type].cluster.forEach(item => {
          item.isControllerPropertiesExpanded = flag;
        });
      }
    }
  }

  undo(): void {
    if (this.indexOfNextAdd > 0) {
      const obj = this.history[--this.indexOfNextAdd];
      if (obj) {
        this.data = JSON.parse(obj);
      }
    }
  }

  redo(): void {
    if (this.indexOfNextAdd < this.history.length) {
      const obj = this.history[this.indexOfNextAdd++];
      if (obj) {
        this.data = JSON.parse(obj);
      }
    }
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
        console.log(this.mainObj)
        this.updateJSONObject();
      }
    });
  }

  private updateJSONObject(): void {
    this.data.descriptor = this.mainObj.descriptor;
    this.data.license = this.mainObj.license;
    if (this.mainObj.joc && !isEmpty(this.mainObj.joc)) {
      this.mainObj.joc.members?.instances.forEach((config) => {
        this.updateMissingObjects(config, 'JOC');
      });
      this.data.joc = this.mainObj.joc;
    }
    if (this.mainObj.agents && this.mainObj.agents.length > 0) {
      this.mainObj.agents.forEach((config) => {
        this.updateMissingObjects(config, 'AGENT');
      });
      this.data.agents = this.mainObj.agents;
    }
    if (this.mainObj.controllers && !isEmpty(this.mainObj.controllers)) {
      const obj = {
        jocRef: this.mainObj.controllers.jocRef,
        controllerId: this.mainObj.controllers.controllerId,
        cluster: []
      };
      if (this.mainObj.controllers.primary) {
        this.updateMissingObjects(this.mainObj.controllers.primary, 'CONTROLLER');
        obj.cluster.push(this.mainObj.controllers.primary);
      }
      if (this.mainObj.controllers.secondary) {
        this.updateMissingObjects(this.mainObj.controllers.secondary, 'CONTROLLER');
        obj.cluster.push(this.mainObj.controllers.secondary);
      }
      this.data.controllers = obj;
    }
    this.convertJSON();
    console.log(this.data)
  }

  private updateMissingObjects(obj, type): void {
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
      if (type == 'JOC') {
        obj.configuration.startFiles = {};
      } else if (type == 'AGENT') {
        obj.configuration.controller = {};
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
