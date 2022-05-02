import {Component, Input, OnInit} from "@angular/core";
import {FileUploader} from "ng2-file-upload";
import {NzModalRef, NzModalService} from "ng-zorro-antd/modal";
import {TranslateService} from "@ngx-translate/core";
import {ToastrService} from "ngx-toastr";
import {CoreService} from "../../../services/core.service";
import {AuthService} from "../../../components/guard";
import {DataService} from "../data.service";

@Component({
  selector: 'app-upload-modal-content',
  templateUrl: './upload-dialog.html'
})
export class UploadModalComponent implements OnInit {
  @Input() display: any;
  @Input() isRole: any;
  @Input() userDetail: any;
  @Input() identityServiceType: string;
  @Input() identityServiceName: string;
  uploader: FileUploader;
  hasBaseDropZoneOver: any;
  required = false;
  comments: any = {};
  roles = [];
  accounts = [];

  constructor(public activeModal: NzModalRef, private modal: NzModalService, private translate: TranslateService, private dataService: DataService,
              public toasterService: ToastrService, private coreService: CoreService, private authService: AuthService) {
  }

  ngOnInit(): void {
    if (sessionStorage.$SOS$FORCELOGING === 'true') {
      this.required = true;
      this.display = true;
    }
    this.comments.radio = 'predefined';

    this.uploader = new FileUploader({
      url: '',
      queueLimit: 1,
      headers: [{
        name: 'X-Access-Token',
        value: this.authService.accessTokenId
      }]
    });

    this.uploader.onCompleteItem = (fileItem: any, response, status) => {
      if (status === 200) {
        this.activeModal.close('DONE');
      }
    };

    this.uploader.onErrorItem = (fileItem, response: any) => {
      const res = typeof response === 'string' ? JSON.parse(response) : response;
      if (res.error) {
        this.toasterService.error(res.error.message, res.error.code);
      }
    };
  }

  fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

  // CALLBACKS
  onFileSelected(event: any): void {
    const self = this;
    const item = event['0'];
    const fileExt = item.name.slice(item.name.lastIndexOf('.') + 1);
    if (!(fileExt || fileExt.toUpperCase() !== 'JSON')) {
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
            self.showError();
          }
        } else {
          if (data.accounts) {
            self.accounts = data.accounts;
          } else {
            self.showError();
          }
        }
      } catch (e) {
        self.showError();
      }
    }
  }

  private showError(): void {
    this.translate.get('error.message.invalidJSON').subscribe(translatedValue => {
      this.toasterService.error(translatedValue);
    });
    this.uploader.clearQueue();
  }

  import(): void {
    let auditLog: any = {};
    if (this.comments.comment) {
      auditLog.comment = this.comments.comment;
      if (this.comments.timeSpent) {
        auditLog.timeSpent = this.comments.timeSpent;
      }
      if (this.comments.ticketLink) {
        auditLog.ticketLink = this.comments.ticketLink;
      }
    }
    if (this.isRole) {
      for (let role in this.roles) {
        if (this.identityServiceType === 'SHIRO') {
          this.userDetail.roles[role] = {
            permissions: {}
          }
          for (let x in this.roles[role].controllers) {
            if (this.roles[role].controllers[x].controllerId == '') {
              this.userDetail.roles[role].permissions.joc = this.roles[role].controllers[x].permissions;
              if (this.roles[role].controllers[x].folders) {
                if (!this.userDetail.roles[role].folders) {
                  this.userDetail.roles[role].folders = {};
                }
                this.userDetail.roles[role].folders.joc = this.roles[role].controllers[x].folders;
              }
            } else {
              this.userDetail.roles[role].permissions.controllers = {};
              this.userDetail.roles[role].permissions.controllers[this.roles[role].controllers[x].controllerId] = this.roles[role].controllers[x].permissions;
              if (this.roles[role].controllers[x].folders) {
                if (!this.userDetail.roles[role].folders) {
                  this.userDetail.roles[role].folders = {controllers: {}};
                } else if (!this.userDetail.roles[role].folders.controllers) {
                  this.userDetail.roles[role].folders.controllers = {};
                }
                this.userDetail.roles[role].folders.controllers[this.roles[role].controllers[x].controllerId] = this.roles[role].controllers[x].folders;
              }
            }
          }
        } else {
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
      }
    } else {
      if (this.identityServiceType === 'SHIRO') {
        if (this.userDetail.accounts) {
          let accounts = this.accounts;
          this.userDetail.accounts.forEach(account => {
            let flag = true;
            for (let i in accounts) {
              if (account.accountName == accounts[i].accountName) {
                flag = false;
                break;
              }
            }
            if (flag) {
              accounts.push(account);
            }
          });
          this.userDetail.accounts = accounts;
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

    if (this.identityServiceType === 'SHIRO') {
      const obj: any = {
        accounts: this.userDetail.accounts,
        roles: this.userDetail.roles,
        main: this.userDetail.main,
        identityServiceName: this.identityServiceName,
        auditLog
      };

      this.coreService.post('authentication/auth/store', obj).subscribe(() => {
        this.dataService.announceFunction('RELOAD');
        this.activeModal.close('DONE');
      });

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

  displayWith(data): string {
    return data.key;
  }

  cancel(): void {
    this.activeModal.destroy();
  }
}
