import {Component, Input} from '@angular/core';
import {CoreService} from "../../../services/core.service";
import {NzModalService} from "ng-zorro-antd/modal";
import {DataService} from "../../../services/data.service";
import {AuthService} from "../../../components/guard";

@Component({
  selector: 'app-email-setting',
  templateUrl: './email-setting.component.html',
  styleUrl: './email-setting.component.scss'
})
export class EmailSettingComponent {
  @Input() preferences: any = {};
  @Input() schedulerIds: any = {};
  @Input() permission: any = {};
  isTreeShow = false
  jobResourcesTree: any = [];
  submitted = false;
  currentObj: any = {
    bcc: '',
    cc: '',
    body: '',
    charset: '',
    contentType: '',
    encoding: '',
    jobResourceName: '',
    subject: ''
  };
  previewRegistration = false;
  fullScreen = false;

  constructor(public coreService: CoreService,
              private modal: NzModalService, private dataService: DataService, public authService: AuthService) {
  }

  ngOnInit(): void {
    this.getJobResources();
    this.getData();
  }

  onSelect(name: string) {
    this.isTreeShow = false;
    this.currentObj.jobResourceName = name;
  }

  onBlur(): void {
    this.isTreeShow = false;
  }

  private getData(): void {
    this.coreService.post('approval/email_settings', {}).subscribe({
      next: (res) => {
        this.currentObj.bcc = res.bcc
        this.currentObj.cc = res.cc
        this.currentObj.subject = res.subject
        this.currentObj.encoding = res.encoding
        this.currentObj.charset = res.charset
        this.currentObj.contentType = res.contentType
        this.currentObj.jobResourceName = res.jobResourceName
        this.currentObj.body = res.body
      },
      error: () => {
      }
    });
  }

  onSubmit(): void {
    this.submitted = true;
    const obj = this.currentObj
    this.coreService.post('approval/email_settings/store', obj).subscribe({
      next: (res) => {
        this.submitted = false;
      },
      error: () => {
        this.submitted = false;
      }
    });
  }


  private getJobResources(): void {
    this.coreService.post('tree', {
      types: ['JOBRESOURCE'],
      forInventory: true
    }).subscribe((res) => {
      this.jobResourcesTree = this.coreService.prepareTree(res, true);
    });
  }
}
