import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {isEmpty, isArray, isEqual} from 'underscore';
import {saveAs} from 'file-saver';
import {NzModalRef, NzModalService} from "ng-zorro-antd/modal";
import {JsonEditorComponent, JsonEditorOptions} from "ang-jsoneditor";
import {ClipboardService} from "ngx-clipboard";
import {NzMessageService} from "ng-zorro-antd/message";
import {FileUploader} from "ng2-file-upload";
import {TranslateService} from "@ngx-translate/core";
import {ToastrService} from "ngx-toastr";
import {Subject} from "rxjs";
import {NzFormatEmitEvent, NzTreeNode} from "ng-zorro-antd/tree";
import {NzContextMenuService, NzDropdownMenuComponent} from "ng-zorro-antd/dropdown";
import {CreateFolderModalComponent, CreateObjectModalComponent} from "../configuration/inventory/inventory.component";
import {CoreService} from '../../services/core.service';
import {AuthService} from "../../components/guard";

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
  isLoading = true;
  loading: boolean;
  isTrash = false;
  tree: any = [];
  sideView: any = {};
  deploymentFilters: any = {};
  data: any = {
    descriptor: {},
    agents: [],
    controllers: [],
    joc: []
  };

  deploymentData: any = {};

  obj: any = {
    isDescriptorExpanded: true,
    isMoreDescriptorDetail: false,
    isJOCExpanded: false,
    isAgentExpanded: false,
    isControllerExpanded: false,
    isLicenseExpanded: false
  };

  securityLevel: Array<string> = ['low', 'medium', 'high'];
  dbmsInit: Array<string> = ['byInstaller', 'byJoc', 'off'];
  methods: Array<string> = ['publickey'];

  isValid = false;
  isNavigate = false;
  errorMessages: Array<string> = [];
  history = [];
  indexOfNextAdd = 0;
  copiedObject: any;

  object = {
    setOfCheckedId: new Set()
  };

  objectType = 'DEPLOYMENTDESCRIPTOR';
  preferences: any = {};
  schedulerIds: any = {};
  permission: any = {};
  selectedObj: any = {};
  copyObj: any;
  node: any;
  private pendingHTTPRequests$ = new Subject<void>();

  @ViewChild('treeCtrl', {static: false}) treeCtrl: any;
  @ViewChild('menu', {static: true}) menu: NzDropdownMenuComponent;

  constructor(private coreService: CoreService, private modal: NzModalService, private message: NzMessageService,
              private authService: AuthService, private nzContextMenuService: NzContextMenuService, private translate: TranslateService) {
  }

  ngOnInit(): void {
    this.deploymentFilters = this.coreService.getDeploymentTab();
    this.sideView = this.coreService.getSideView();
    this.init();
  }

  ngOnDestroy(): void {
    this.coreService.setSideView(this.sideView);
    this.pendingHTTPRequests$.next();
    this.pendingHTTPRequests$.complete();
    $('.scroll-y').remove();
  }

  private init(): void {
    this.preferences = sessionStorage.preferences ? JSON.parse(sessionStorage.preferences) : {};
    this.schedulerIds = this.authService.scheduleIds ? JSON.parse(this.authService.scheduleIds) : {};
    this.permission = this.authService.permission ? JSON.parse(this.authService.permission) : {};
    this.initTree();
  }

  private initTree(): void {
    this.coreService.post('tree', {
      forInventory: true,
      types: [this.objectType]
    }).subscribe({
      next: res => {
        if (res.folders.length === 0) {
          res.folders.push({name: '', path: '/'});
        }
        this.tree = this.coreService.prepareTree(res, true);
        this.isLoading = false;
        this.updateObjects({path: '/'});
      }, error: () => this.isLoading = false
    });
    this.updateObjects({path: '/'});
  }

  updateObjects(data, cb = null): void {
    const obj: any = {
      path: data.path,
      objectTypes: [this.objectType]
    };

    const URL = 'inventory/read/folder';
    this.coreService.post(URL, obj).subscribe({
      next: (res: any) => {
        console.log(res)
      }, error: () => {
      }
    });
  }

  openMenu(node, evt): void {
    if (this.menu) {
      this.node = node;
      setTimeout(() => {
        this.nzContextMenuService.create(evt, this.menu);
      }, 0);
    }
  }

  openFolder(node: NzTreeNode): void {
    if (node instanceof NzTreeNode) {
      node.isExpanded = !node.isExpanded;
      if (node.isExpanded && node.origin.children) {
        this.expandFolder(node);
      }
    }
  }

  selectNode(node: NzTreeNode | NzFormatEmitEvent): void {
    if (node instanceof NzTreeNode) {
      if (node.origin.children) {
        node.isExpanded = !node.isExpanded;
        if (node.isExpanded) {
          this.expandFolder(node);
        }
        return;
      }
      if (this.preferences.expandOption === 'both' && node.origin.children) {
        node.isExpanded = !node.isExpanded;
      }

      // this.selectedData = node.origin;
      // this.setSelectedObj(this.type, this.selectedData.name, this.selectedData.path, node.origin.objectType ? '$ID' : undefined);
    }
  }

  private expandFolder(node): void {
    const data = node.origin.children;

  }


  /** Actions */

  hidePanel(): void {
    this.sideView.deployment.show = false;
    this.coreService.hidePanel();
  }

  showPanel(): void {
    this.sideView.deployment.show = true;
    this.coreService.showLeftPanel();
  }

  private getObject($event): void {
    const URL = 'inventory/read/configuration';
    const obj: any = {
      path: $event.path,
      objectType: this.objectType,
    };
    this.coreService.post(URL, obj).subscribe((res: any) => {
      //this.lastModified = res.configurationDate;
      this.history = [];
      this.indexOfNextAdd = 0;
      if (res.configuration) {
        delete res.configuration.TYPE;
        delete res.configuration.path;
        delete res.configuration.version;
        delete res.configuration.versionId;
      } else {
        res.configuration = {};
      }
      console.log(res)
      this.deploymentData = {
        name: res.name,
        path: res.path,
        data: JSON.stringify(res.configuration)
      };
      this.deploymentData.mainObj = res.configuration;
      this.updateJSONObject();
      this.history.push(this.deploymentData.data);
    });
  }

  addLicense(): void {
    this.data.license = {};
    this.obj.isLicenseExpanded = true;
  }

  addAgent(flag = false): void {
    if (!this.data.agents) {
      this.data.agents = {
        controllerRefs: []
      };
    }
    if (!this.data.agents.controllerRefs) {
      this.data.agents.controllerRefs = [];
    }
    this.obj.isAgentExpanded = true;
    this.data.agents.controllerRefs.push({
      isAgentExpanded: true,
      members: [{
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
      }]
    });
  }

  removeAgent(index = -1): void {
    if (index > -1) {
      this.data.agents.controllerRefs.splice(index, 1);
    } else {
      this.data.agents.controllerRefs = [];
    }
  }

  addJOC(): void {
    if (!this.data.joc) {
      this.data.joc = [];
    }
    this.obj.isJOCExpanded = true;
    this.data.joc.push({
      isJOCExpanded: true,
      members: {
        instances: [{
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
      }
    });
  }

  removeJOC(index = -1): void {
    if (index > -1) {
      this.data.joc.splice(index, 1);
    } else {
      this.data.joc = [];
    }
  }

  copy(type, objectType, index1, index2): void {
    this.copiedObject = {
      type,
      objectType,
      data: this.data[type][index1]
    };
    if (type == 'joc') {
      if (objectType !== 'instance') {
        this.copiedObject.data = this.data[type][index1].members.instances[index2][objectType];
      } else {
        this.copiedObject.data = this.data[type][index1].members.instances[index2];
      }
    } else if (type === 'controllers') {
      if (objectType !== 'instance') {
        this.copiedObject.data = this.data[type][index1].cluster[index2][objectType];
      } else {
        this.copiedObject.data = this.data[type][index1].cluster[index2];
      }
    } else {
      if (objectType !== 'instance') {
        this.copiedObject.data = this.data[type][index1][objectType];
      } else {
        this.copiedObject.data = this.data[type][index1];
      }
    }
    if (this.copiedObject.data) {
      this.coreService.showCopyMessage(this.message);
    } else {
      this.copiedObject = undefined;
      this.coreService.showCopyMessage(this.message, 'cannotCopyEmptyObject', 'info');
    }
  }

  paste(type, objectType, index1, index2): void {
    if (this.copiedObject && type == this.copiedObject.type) {
      if (type == 'joc') {
        if (objectType !== 'instance') {
          this.data.joc[index1].members.instances[index2][objectType] = this.copiedObject.data;
        } else {
          this.data.joc[index1].members.instances[index2] = this.copiedObject.data;
        }
      } else if (type === 'controllers') {
        if (objectType !== 'instance') {
          this.data[type][index1].cluster[index2][objectType] = this.copiedObject.data;
        } else {
          this.data[type][index1].cluster[index2] = this.copiedObject.data;
        }
      } else {
        if (objectType !== 'instance') {
          this.data[type][index1][objectType] = this.copiedObject.data;
        } else {
          this.data[type][index1] = this.copiedObject.data;
        }
      }
    }
  }

  addAnotherJOCInstance(members): void {
    members.instances.push({
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

  addAnotherJOCCluster(): void {
    this.addJOC();
  }

  removeSecondaryObj(list, index): void {
    list.splice(index, 1);
  }

  addController(): void {
    if (!this.data.controllers) {
      this.data.controllers = [];
    }

    this.obj.isControllerExpanded = true;
    this.data.controllers.push({
      isControllerExpanded: true,
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
    this.validate(true);
    this.saveJSON();
  }

  private saveJSON(flag = false): void {
    console.log('saveJSON', this.permission.joc)
    if (this.isTrash || !this.permission.joc.inventory.manage) {
      return;
    }
    console.log('store')
    if (!isEqual(this.deploymentData.data, JSON.stringify(this.data))) {
      if (!flag) {
        if (this.history.length === 20) {
          this.history.shift();
        }
        this.history.push(JSON.stringify(this.data));
        this.indexOfNextAdd = this.history.length - 1;
      }

      const request: any = {
        configuration: this.deploymentData.mainObj,
        path: this.deploymentData.path || '/',
        objectType: this.objectType
      };

      if (sessionStorage.$SOS$FORCELOGING === 'true') {
        this.translate.get('auditLog.message.defaultAuditLog').subscribe(translatedValue => {
          request.auditLog = {comment: translatedValue};
        });
      }

      this.coreService.post('inventory/store', request).subscribe({
        next: (res: any) => {
          if (res.path === this.deploymentData.path) {
            //   this.lastModified = res.configurationDate;
            this.deploymentData.data = JSON.stringify(this.data);
            this.deploymentData.valid = res.valid;

          }
        }
      });
    }
  }

  private checkAndUpdateObj(obj, type, source, index1, index2, isSkip): void {

    if (type == 'joc') {
      this.data.joc[index1].isJOCExpanded = true;
      this.data.joc[index1].members.instances[index2].isJOCPropertiesExpanded = true;
    } else if (type == 'agents') {
      this.data.agents.controllerRefs[index1].isAgentPropertiesExpanded = true;
    } else if (type == 'controllers') {
      this.data.controllers[index1].isControllerExpanded = true;
      this.data.controllers[index1].cluster[index2].isControllerPropertiesExpanded = true;
    }
    if (type === 'joc') {
      if (!source.instanceId && !isSkip) {
        this.navToField('jocInstanceId' + index1 + index2, type);
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
      if (!source.target.connection.host && !isSkip) {
        this.navToField((type == 'controllers' ? 'c' : type == 'agents' ? 'a' : '') + 'host' + index1 + index2, type);
        this.errorMessages.push('Connection host is required');
      }
      obj.target.connection = source.target.connection;
    }
    if (source.target.authentication && !isEmpty(source.target.authentication)) {
      if (!obj.target.authentication) {
        obj.target.authentication = {};
      }
      if ((!isSkip && !source.target.authentication.method || !source.target.authentication.user)) {
        let id;
        if (!source.target.authentication.method) {
          id = 'method';
        } else {
          id = 'user';
        }
        this.navToField((type == 'controllers' ? 'c' : type == 'agents' ? 'a' : '') + id + index1 + index2, type);
        this.errorMessages.push(!source.target.authentication.method ? 'Authentication method is required' : 'Authentication user is required');
      }
      obj.target.authentication = source.target.authentication;
    }

    if (source.media && !isEmpty(source.media)) {
      if (!isSkip && (!source.media.release || !source.media.tarball)) {
        let id;
        if (!source.media.release) {
          id = 'release';
        } else {
          id = 'tarball';
        }
        this.navToField((type == 'controllers' ? 'c' : type == 'agents' ? 'a' : '') + id + index1 + index2, type);
        this.errorMessages.push(!source.media.release ? 'Media release is required' : 'Media tarball is required');
      }
      obj.media = source.media;
    } else if (!isSkip) {
      this.isValid = false;
      this.errorMessages.push('Media is required');
    }

    if (source.installation && !isEmpty(source.installation)) {
      if (!isSkip && ((type == 'joc' && !source.installation.setupDir) || !source.installation.home || !source.installation.data)) {
        let id;
        if (!source.installation.home) {
          id = 'home';
        } else if (!source.installation.data) {
          id = 'data';
        } else {
          id = 'setupDir';
        }
        this.navToField((type == 'controllers' ? 'c' : type == 'agents' ? 'a' : '') + id + index1 + index2, type);
        this.errorMessages.push((type == 'joc' && !source.installation.setupDir) ? 'Installation setupDir is required' : !source.installation.home ? 'Installation home is required' : 'Installation data is required');
      }
      if (!isSkip && !source.installation.httpPort && !source.installation.httpsPort) {
        this.navToField((type == 'controllers' ? 'c' : type == 'agents' ? 'a' : '') + 'httpPort' + index1 + index2, type);
        this.errorMessages.push('Installation http or https port is required');
      }
      obj.installation = source.installation;
    } else if (!isSkip) {
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

        if (!isEmpty(source.configuration.certificates)) {
          obj.configuration.certificates = source.configuration.certificates;
          if (!isSkip && (!source.configuration.certificates.keyStore || !source.configuration.certificates.keyStorePassword || !source.configuration.certificates.keyPassword
            || !source.configuration.certificates.trustStore || !source.configuration.certificates.trustStorePassword)) {
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
            this.navToField((type == 'controllers' ? 'c' : type == 'agents' ? 'a' : '') + id + index1 + index2, type);
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
    if (!this.isNavigate) {
      this.isNavigate = true;
      if (type == 'descriptor') {
        this.obj.isDescriptorExpanded = true;
      } else if (type == 'joc') {
        this.obj.isJOCExpanded = true;
      } else if (type == 'agents') {
        this.obj.isAgentExpanded = true;
      } else if (type == 'controllers') {
        this.obj.isControllerExpanded = true;
      }


      setTimeout(() => {
        this.isNavigate = false;
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

  validate(isSkip = false): void {
    if (!isSkip) {
      this.isValid = true;
      this.errorMessages = [];
    }
    this.deploymentData.mainObj = {
      descriptor: this.data.descriptor
    };
    if (!this.data.descriptor.descriptorId && !isSkip) {
      this.navToField('descriptorId', 'descriptor');
      this.errorMessages.push('Descriptor Id is required');
    }
    if (!isSkip && this.data.joc?.length == 0 && this.data.agents?.controllerRefs?.length == 0 && this.data.controllers?.length == 0) {
      this.isValid = false;
      this.errorMessages.push('Minimum one of JOC, Controllers or Agents is required');
    }
    if (this.data.license) {
      if (!isEmpty(this.data.license)) {
        this.deploymentData.mainObj['license'] = this.data.license;
        if (!isSkip && (!this.data.license.licenseKeyFile || !this.data.license.licenseBinFile)) {
          this.navToField(!this.data.license.licenseKeyFile ? 'licenseKeyFile' : 'licenseBinFile', 'license');
          this.errorMessages.push(this.data.license.licenseKeyFile ? 'License bin file is required' : 'License key file is required');
        }
      } else if (!isSkip) {
        this.isValid = false;
        this.errorMessages.push('License is required for cluster');
      }
    }

    if (this.data.agents?.controllerRefs?.length > 0) {
      this.deploymentData.mainObj['agents'] = {
        controllerRefs: []
      };
      this.data.agents.controllerRefs.forEach((agent, i) => {
        if (!agent.controllerId && !isSkip) {
          this.navToField('controllerId' + i, 'agents');
          this.errorMessages.push('Controller Refs is required');
        }
        let obj = {
          controllerId: agent.controllerId,
          members: []
        };
        agent.members.forEach((element, j) => {
          if (!element.agentId && !isSkip) {
            this.navToField('agentId' + i + j, 'agents');
            this.errorMessages.push('Agent Id is required');
          }
          let _obj = {
            agentId: element.agentId
          };
          this.checkAndUpdateObj(_obj, 'agents', element, i, j, isSkip);
          obj.members.push(_obj);
        });
        this.deploymentData.mainObj.agents.controllerRefs.push(obj);
      });
    }

    if (this.data.controllers?.length > 0) {
      this.deploymentData.mainObj['controllers'] = [];
      this.data.controllers.forEach((controller, i) => {
        if (!controller.controllerId && !isSkip) {
          this.navToField('controllerId' + i, 'controllers');
          this.errorMessages.push('Controller Id is required');
        }
        if (!controller.jocRef && !isSkip) {
          this.navToField('jocRef' + i, 'controllers');
          this.errorMessages.push('JOC Reference is required');
        }
        if (controller.cluster) {
          let obj: any = {
            controllerId: controller.controllerId,
            jocRef: controller.jocRef
          };
          controller.cluster.forEach((element, j) => {
            if (j == 0) {
              obj.primary = {};
              this.checkAndUpdateObj(obj.primary, 'controllers', element, i, j, isSkip);
            } else {
              obj.secondary = {};
              this.checkAndUpdateObj(obj.secondary, 'controllers', element, i, j, isSkip);
            }
          });
          this.deploymentData.mainObj.controllers.push(obj);
        }
      });
    }
    if (this.data.joc?.length > 0) {
      this.deploymentData.mainObj['joc'] = [];
      this.data.joc.forEach((joc, i) => {
        if (!this.deploymentData.mainObj.joc[i]) {
          this.deploymentData.mainObj.joc[i] = {
            members: {
              clusterId: joc.members.clusterId,
              instances: []
            }
          }
        }
        if (!joc.members.clusterId && !isSkip) {
          this.navToField('clusterId' + i, 'joc');
          this.errorMessages.push('Joc cluster Id is required');
        }
        joc.members.instances.forEach((element, j) => {
          if (!this.deploymentData.mainObj.joc[i].members.instances[j]) {
            this.deploymentData.mainObj.joc[i].members.instances[j] = {};
          }
          this.checkAndUpdateObj(this.deploymentData.mainObj.joc[i].members.instances[j], 'joc', element, i, j, isSkip);
        });
      });
    }

    if (!isSkip && this.isValid) {
      this.validateByURL();
    }
  }

  private validateByURL(): void {
    this.coreService.post('inventory/' + this.objectType + '/validate', this.deploymentData.mainObj).subscribe((res: any) => {
      if (res.invalidMsg) {
        this.errorMessages = [res.invalidMsg];
      }
      this.isValid = res.valid;
    });
  }


  editJSON(): void {
    this.validate();
    this.modal.create({
      nzTitle: undefined,
      nzContent: ShowJsonModalComponent,
      nzAutofocus: null,
      nzClassName: 'lg',
      nzComponentParams: {
        object: this.deploymentData.mainObj
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    }).afterClose.subscribe(result => {
      if (result) {
        this.deploymentData.mainObj = result;
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
            this._bulkUpdate(result.data, this.data.agents?.controllerRefs, result.checkValues);
          } else {
            this._bulkUpdate(result.data, this.data.joc, result.checkValues);
            this._bulkUpdate(result.data, this.data.controllers, result.checkValues);
            this._bulkUpdate(result.data, this.data.agents?.controllerRefs, result.checkValues);
          }
        } else {
          result.list.forEach(item => {
            if (item.value == 'JOC') {
              this.data.joc.forEach((val) => {
                if (val.clusterId == item.name) {
                  val.members.instances.forEach((cluster) => {
                    this.updateIndividualData(result.data, cluster, result.checkValues);
                  });
                }
              });
            } else if (item.value == 'AGENT') {
              this.data.agents.controllerRefs.forEach((val) => {
                if (val.agentId == item.name) {
                  val.members.forEach((agent) => {
                    this.updateIndividualData(result.data, agent, result.checkValues);
                  });
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
      if (item.members?.instances) {
        item.members.instances.forEach((instance) => {
          this.updateIndividualData(obj, instance, checkValues);
        });
      } else if (item.members) {
        item.members.forEach((member) => {
          this.updateIndividualData(obj, member, checkValues);
        });
      } else if (item.cluster) {
        item.cluster.forEach((cluster) => {
          this.updateIndividualData(obj, cluster, checkValues);
        });
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
      if (this.data.joc) {
        this.data.joc.forEach(joc => {
          joc.isJOCExpanded = flag;
          joc.members.instances.forEach((item) => {
            item.isJOCPropertiesExpanded = flag;
          })
        });
      }
    } else if (type == 'agents') {
      this.obj.isAgentExpanded = flag;
      if (this.data.agents?.controllerRefs) {
        this.data.agents.controllerRefs.forEach(agent => {
          agent.isAgentExpanded = flag;
          agent.members.forEach(item => {
            item.isAgentPropertiesExpanded = flag;
          });
        });
      }
    } else if (type == 'controllers') {
      this.obj.isControllerExpanded = flag;
      if (this.data.controllers) {
        this.data.controllers.forEach(controller => {
          controller.isControllerExpanded = flag;
          controller.cluster.forEach((item) => {
            item.isControllerPropertiesExpanded = flag;
          })
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
    const data = JSON.stringify(this.deploymentData.mainObj, undefined, 2);
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
        this.deploymentData.mainObj = result;
        this.updateJSONObject();
      }
    });
  }

  private updateJSONObject(): void {
    this.data.descriptor = this.deploymentData.mainObj.descriptor;
    this.data.license = this.deploymentData.mainObj.license;
    if (this.deploymentData.mainObj.joc && this.deploymentData.mainObj.joc.length > 0) {
      this.deploymentData.mainObj.joc.forEach((joc) => {
        joc.members?.instances?.forEach((config) => {
          this.updateMissingObjects(config, 'JOC');
        });
      });
      this.data.joc = this.deploymentData.mainObj.joc;
    }

    if (this.deploymentData.mainObj.agents?.controllerRefs?.length > 0) {
      this.deploymentData.mainObj.agents.controllerRefs.forEach((agent) => {
        agent.members.forEach((config) => {
          this.updateMissingObjects(config, 'AGENT');
        });
      });
      this.data.agents = this.deploymentData.mainObj.agents;
    }

    if (this.deploymentData.mainObj.controllers && this.deploymentData.mainObj.controllers.length > 0) {
      this.data.controllers = [];
      this.deploymentData.mainObj.controllers.forEach((controller) => {
        const obj = {
          jocRef: controller.jocRef,
          controllerId: controller.controllerId,
          cluster: []
        };
        if (controller.primary) {
          this.updateMissingObjects(controller.primary, 'CONTROLLER');
          obj.cluster.push(controller.primary);
        }
        if (controller.secondary) {
          this.updateMissingObjects(controller.secondary, 'CONTROLLER');
          obj.cluster.push(controller.secondary);
        }
        this.data.controllers.push(obj);
      });
    }

    this.convertJSON();
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

  /** ----- Action menu operations */

  createFolder(): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: CreateFolderModalComponent,
      nzAutofocus: null,
      nzComponentParams: {
        display: this.preferences.auditLog,
        schedulerId: this.schedulerIds.selected,
        type: 'DESCRIPTORFOLDER',
        origin: this.node?.origin
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(path => {
      if (path) {
         this.initTree();
      }
    });
  }

  addObject(): void {
    console.log(this.node)
  }

  newObject(list, path): void {
    if (!path) {
      return;
    }
    const obj: any = {
      type: this.objectType,
      path
    };
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: CreateObjectModalComponent,
      nzAutofocus: null,
      nzComponentParams: {
        schedulerId: this.schedulerIds.selected,
        preferences: this.preferences,
        obj
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe((res: any) => {
      if (res) {
        let configuration = {};
        obj.name = res.name;
        // this.storeObject(obj, list, configuration, res.comments);
      }
    });
  }

  cutObject(): void {

  }

  copyObject(): void {

  }

  pasteObject(): void {

  }

  renameObject(): void {

  }

  removeObject(): void {

  }

  editJson(isEdit): void {

  }

  exportJSON(): void {

  }

  importJSON(): void {

  }
}
