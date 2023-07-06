import {Component, inject} from '@angular/core';
import {HttpHeaders} from '@angular/common/http';
import {NzUploadFile} from 'ng-zorro-antd/upload';
import {NZ_MODAL_DATA, NzModalRef} from "ng-zorro-antd/modal";
import {TranslateService} from "@ngx-translate/core";
import {ToastrService} from "ngx-toastr";
import {CoreService} from "../../services/core.service";
import {ByteToSizePipe} from '../../pipes/core.pipe';
import {AuthService} from '../guard';

@Component({
  selector: 'app-file-uploader',
  templateUrl: './file-uploader.component.html',
})
export class FileUploaderComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  type = '';
  fileType = '.json';
  nodes: any;
  fileList: NzUploadFile[] = [];
  uploading = false;
  showProgressBar = false;
  uploadError = false;
  display = false;
  submitted = false;
  required = false;

  comments: any = {};
  data: any;

  document = {path: '', path1: ''};

  //Inventory
  signatureAlgorithm = '';
  requestObj: any = {
    overwrite: false,
    format: 'ZIP',
    targetFolder: '',
    type: 'ignore'
  };
  isDeploy = false;
  schedulerIds: any;
  settings: any = {};

  isTreeShow = false;

  preferences: any;
  controllerId = '';
  agents: any = [];
  calendarTree: any = [];

  //Inventory Object
  object: any;
  name = '';
  objectType = '';

  // XML Editor
  schedulerId: any;
  selectedPath: any;
  importObj: any;
  otherSchema: any;
  importXsd: any;
  uploadData: any;
  fileLoading = false;

  // User and Roles
  isRole: any;
  userDetail: any;
  identityServiceType: string;
  identityServiceName: string;
  roles = [];
  accounts = [];

  constructor(private activeModal: NzModalRef, private toasterService: ToastrService, private authService: AuthService,
              private coreService: CoreService, private translate: TranslateService) {

  }

  ngOnInit(): void {
    console.log(this.modalData)
    this.type = this.modalData.type;
    this.comments.radio = 'predefined';
    if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
      this.required = true;
      this.display = true;
    }
    if (this.type == 'DOCUMENTATION') {
      this.fileType = '*';
      this.nodes = this.modalData.nodes
      this.document.path = this.modalData.selectedPath;
    } else if (this.type === 'USER') {
      this.display = this.modalData.display;
      this.isRole = this.modalData.isRole;
      this.userDetail = this.modalData.userDetail;
      this.identityServiceType = this.modalData.identityServiceType;
      this.identityServiceName = this.modalData.identityServiceName;
    } else if (this.type === 'INVENTORY') {
      this.isDeploy = this.modalData.isDeploy;
      this.schedulerIds = this.modalData.schedulerIds;
      this.fileType = '.zip, .tar.gz, .gz';

      if (sessionStorage['$SOS$IMPORT'] && sessionStorage['$SOS$IMPORT'] !== 'undefined') {
        this.settings = JSON.parse(sessionStorage['$SOS$IMPORT']);
        if (this.settings) {
          this.requestObj.suffix = this.settings.suffix;
          this.requestObj.prefix = this.settings.prefix;
        }
      }

      this.getTree();
    } else if (this.type == 'CRON') {
      this.preferences = this.modalData.isDeploy;
      this.display = this.modalData.isDeploy;
      this.controllerId = this.modalData.isDeploy;
      this.agents = this.modalData.isDeploy;
      this.requestObj = {
        systemCrontab: false,
        folder: '/'
      };
      this.getTree();
      this.getCalendars();
    } else if (this.type === 'INVENTORY_OBJECT') {
      this.object = this.modalData.object;
      this.name = this.modalData.name;
      this.objectType = this.modalData.objectType;
    } else if (this.type === 'XML_EDITOR') {
      this.schedulerId = this.modalData.schedulerId;
      this.display = this.modalData.display;
      this.selectedPath = this.modalData.selectedPath;
      this.importObj = this.modalData.importObj;
      this.otherSchema = this.modalData.otherSchema;
      this.importXsd = this.modalData.importXsd;
    }
  }

  selectSubagentCluster(cluster: any): void {
    if (cluster) {
      this.requestObj.agentName1 = cluster.title;
    } else {
      delete this.requestObj.agentName1;
    }
  }

  private getTree(): void {
    this.coreService.post('tree', {
      forInventory: true,
      types: ['INVENTORY']
    }).subscribe({
      next: (res: any) => {
        if (res.folders.length === 0) {
          res.folders.push({name: '', path: '/'});
        }
        this.nodes = this.coreService.prepareTree(res, true);
      }
    });
  }

  private getCalendars(): void {
    this.coreService.post('tree', {
      forInventory: true,
      types: ['WORKINGDAYSCALENDAR']
    }).subscribe({
      next: (res: any) => {
        this.calendarTree = this.coreService.prepareTree(res, false);
      }
    });
  }

  onSelect(name: string) {
    this.isTreeShow = false;
    this.requestObj.calendarName = name;
  }

  onBlur(): void {
    this.isTreeShow = false;
  }

  displayWith(data): string {
    return data.key;
  }

  selectPath(node): void {
    if (!node || !node.origin) {
      return;
    }
    if (this.document.path !== node.key) {
      this.document.path = node.key;
    }
    if (this.requestObj?.folder !== node.key) {
      this.requestObj.folder = node.key;
    }
    if (this.type == 'INVENTORY') {
      if (this.requestObj?.targetFolder !== node.key) {
        this.requestObj.targetFolder = node.key;
      }
    }
  }

  private validateByURL(json: any, cb: any): void {
    this.coreService.post('inventory/' + this.objectType + '/validate', json).subscribe({
      next: (res: any) => {
        cb(res);
      }, error: (err) => {
        cb(err);
      }
    });
  }

  cancel(): void {
    this.activeModal.destroy();
  }

  beforeUpload = (file: NzUploadFile): boolean => {
    this.uploadError = false;
    this.fileList.push(file);
    if (this.type === 'DEPLOYMENT' || this.type === 'USER' || this.type == 'INVENTORY'
      || this.type == 'XML_EDITOR') {
      this.onFileSelected(file);
    }
    setTimeout(() => {
      const uploadSpan = document.querySelector('.ant-upload-span');
      const spanElement = document.createElement('span');
      // Apply the ByteToSizePipe to format file.size
      const byteToSizePipe = new ByteToSizePipe();
      const fileSizeFormatted = byteToSizePipe.transform(file.size);

      spanElement.classList.add("file-size")
      spanElement.textContent = `Size: ${fileSizeFormatted}`;

      const listItemCardActions = uploadSpan.querySelector('.ant-upload-list-item-card-actions');
      uploadSpan.insertBefore(spanElement, listItemCardActions);
    }, 10);
    return false;
  };

  onFileSelected(file: any): void {
    const self = this;
    const item = file;
    const fileExt = item.name.slice(item.name.lastIndexOf('.') + 1).toUpperCase();
    if (this.type == 'INVENTORY') {
      if (fileExt && (fileExt === 'zip' || fileExt.match(/tar/) || fileExt.match(/gz/))) {
        if (fileExt === 'zip') {
          this.requestObj.format = 'ZIP';
        } else {
          this.requestObj.format = 'TAR_GZ';
        }
      } else {
        let msg = '';
        this.translate.get('error.message.invalidFileExtension').subscribe(translatedValue => {
          msg = translatedValue;
        });
        this.toasterService.error(fileExt + ' ' + msg);
        this.fileList = [];
      }
    } else if (this.type == 'XML_EDITOR') {
      if (!this.importXsd) {
        if (fileExt !== 'XML') {
          this.toasterService.error(fileExt + ' ' + 'invalid file type', '');
          this.fileList = [];
        } else {
          this.fileLoading = false;
          let reader = new FileReader();
          reader.readAsText(item, 'UTF-8');
          reader.onload = (_event: any) => {
            this.uploadData = _event.target.result;
            if (this.uploadData !== undefined && this.uploadData !== '') {
            } else {
              this.toasterService.error('Invalid xml file or file must be empty', '');
            }
          };
        }
      } else if (this.importXsd) {
        if (fileExt !== 'XSD') {
          this.toasterService.error(fileExt + ' ' + 'invalid file type', '');
          this.fileList = [];
        } else {
          this.fileLoading = false;
          let reader = new FileReader();
          reader.readAsText(item, 'UTF-8');
          reader.onload = (_event: any) => {
            this.uploadData = _event.target.result;
            if (this.uploadData !== undefined && this.uploadData !== '') {
            } else {
              this.toasterService.error('Invalid xml file or file must be empty', '');
            }
          };
        }
      }
    } else {
      if (fileExt != 'JSON') {
        let msg = '';
        this.translate.get('error.message.invalidFileExtension').subscribe(translatedValue => {
          msg = translatedValue;
        });
        this.toasterService.error(fileExt + ' ' + msg);
        this.fileList = [];
      } else {
        const reader = new FileReader();
        reader.readAsText(item, 'UTF-8');
        reader.onload = onLoadFile;
      }
    }

    function onLoadFile(_event) {
      let data;
      if (self.type == 'USER') {

        try {
          data = JSON.parse(_event.target.result);
          if (self.isRole) {
            let isValid = false;
            for (let role in data) {
              if (data[role].controllers) {
                isValid = true;
                break;
              }
            }
            if (isValid) {
              self.roles = data;
            } else {
              self.showErrorMsg();
            }
          } else {
            if (data.accounts) {
              self.accounts = data.accounts;
            } else {
              self.showErrorMsg();
            }
          }
        } catch (e) {
          self.showErrorMsg();
        }
      } else if (self.type == 'DEPLOYMENT' || self.type == 'INVENTORY_OBJECT') {
        try {
          data = JSON.parse(_event.target.result);
        } catch (e) {

        }
        if (data) {
          if (self.type == 'INVENTORY_OBJECT') {
            self.validateByURL(data, (res: any) => {
              if (!res.valid) {
                self.showErrorMsg(res.invalidMsg);
              } else {
                self.data = data;
              }
            });
          } else {
            if (!data.descriptor) {
              self.showErrorMsg();
            } else {
              self.data = data;
            }
          }
        } else {
          self.showErrorMsg();
        }
      }
    }
  }

  private showErrorMsg(errorMsg?: string): void {
    let msg = errorMsg;
    if (this.type === 'INVENTORY_OBJECT') {
      if (!errorMsg) {
        this.translate.get('inventory.message.invalidFile', {objectType: this.object.objectType}).subscribe(translatedValue => {
          msg = translatedValue;
        });
      }
    } else if (this.type === 'DEPLOYMENT') {
      this.translate.get('deploymentService.message.invalidFile').subscribe(translatedValue => {
        msg = translatedValue;
      });
    } else {
      this.translate.get('error.message.invalidJSON').subscribe(translatedValue => {
        this.toasterService.error(translatedValue);
      });
    }
    this.toasterService.error(msg);
    this.fileList = [];
  }

  handleUpload(): void {
    this.showProgressBar = true;
    if (this.type === 'USER') {
      this.import();
      return;
    }
    if (this.type === 'DEPLOYMENT') {
      setTimeout(() => {
        this.activeModal.close(this.data);
      }, 200);
    } else if (this.type === 'XML_EDITOR') {
      if (!this.importXsd) {
        this.activeModal.close({uploadData: this.uploadData, importObj: this.importObj});
      } else {
        this.activeModal.close({uploadData: this.uploadData, _file: {name: this.fileList[0].name}});
      }
    } else {
      const formData = new FormData();
      this.fileList.forEach((file: any) => {
        formData.append('file', file);
        formData.append('name', file.name);
        formData.append('folder', this.document.path);
      });
      let obj = {auditLog: {}};
      this.coreService.getAuditLogObj(this.comments, obj.auditLog);
      formData.append('auditLog', JSON.stringify(obj.auditLog));
      this.uploading = true;
      const headers = new HttpHeaders().set('X-Access-Token', this.authService.accessTokenId);
      headers.set('Content-Type', 'multipart/form-data');
      let url = 'api/';
      if (this.type === 'DOCUMENTATION') {
        url += 'documentations/import';
      }
      this.coreService.request(url, formData, headers).subscribe({
        next: (res) => {
          console.log(res);
          this.activeModal.close(this.document.path);
        },
        error: (err) => {
          console.log(err)
          this.uploading = false;
          this.showProgressBar = false;
          this.uploadError = true;
          //  this.toasterService.error(err.error.code, err.error.message);
        }
      })
    }
  }

  // user and roles
  import(): void {
    let auditLog: any = {};
    this.coreService.getAuditLogObj(this.comments, auditLog);
    if (this.isRole) {
      for (let role in this.roles) {
        this.coreService.post('iam/role/store', {
          roleName: role,
          auditLog: auditLog,
          identityServiceName: this.identityServiceName
        }).subscribe({
          next: () => {
            this.getAndStorePermission(role, this.roles[role].controllers, auditLog);
            setTimeout(() => {
              this.activeModal.close('DONE');
            }, 500);
          }
        });
      }
    } else {
      this.accounts.forEach((account, index) => {
        account.auditLog = auditLog;
        account.identityServiceName = this.identityServiceName;
        this.coreService.post('iam/account/store', account).subscribe({
          next: () => {
            if (index === this.accounts.length - 1) {
              this.activeModal.close('DONE');
            }
          }
        });
      })
    }
  }

  private getAndStorePermission(role, controllers, comments) {
    controllers.forEach((controller) => {
      if (controller.folders && controller.folders.length > 0) {
        this.store('iam/folders/store', {
          roleName: role,
          controllerId: controller.controllerId,
          folders: controller.folders,
          identityServiceName: this.identityServiceName,
          auditLog: comments
        });
      }
      this.store('iam/permissions/store', {
        roleName: role,
        controllerId: controller.controllerId,
        permissions: controller.permissions,
        identityServiceName: this.identityServiceName,
        auditLog: comments
      });
    });
  }

  private store(url, obj): void {
    this.coreService.post(url, obj).subscribe();
  }
}
