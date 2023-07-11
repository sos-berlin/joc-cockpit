import {Component, inject} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef} from "ng-zorro-antd/modal";
import {AuthService} from "../../../components/guard";
import {CoreService} from "../../../services/core.service";

@Component({
  selector: 'app-show-permission-view',
  templateUrl: './show-permission.component.html'
})
export class ShowPermissionComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  identityServiceName: string;
  account: any = {};
  isLoaded = false;
  permission: any = {};
  schedulerIds: any = {};

  constructor(public activeModal: NzModalRef, private authService: AuthService, private coreService: CoreService) {
  }

  ngOnInit(): void {
    this.identityServiceName = this.modalData.identityServiceName;
    this.account = this.modalData.account || {};
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    this.getPermission();
  }

  private getPermission(): void {
    this.coreService.post('iam/account/permissions', {
      identityServiceName: this.identityServiceName,
      accountName: this.account.accountName
    }).subscribe({
      next: (res) => {
        this.permission = res;
        this.isLoaded = true;
      }, error: () => {
        this.isLoaded = true;
      }
    })
  }
}
