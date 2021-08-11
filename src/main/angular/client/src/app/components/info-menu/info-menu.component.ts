import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {CoreService} from '../../services/core.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-about',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="modal-header">
      <h4 class="modal-title">
        <span translate>info.button.aboutJS7</span>
      </h4>
      <button type="button" class="close" aria-label="Close" (click)="modalService.destroy()">
        <span aria-hidden="true" class="fa fa-times-circle"></span>
      </button>
    </div>
    <div class="modal-body p-a">
      <div class="row">
        <div class="col-sm-3">
          <img class="p-l logo-for-default" src="./assets/images/JS7-logo-default-theme.png" alt="JS7" width="100">
          <img class="p-l logo-for-light" src="./assets/images/JS7-logo-light-theme.png" alt="JS7" width="100">
          <img class="p-l logo-for-dark" src="./assets/images/JS7-light-dark-theme.png" alt="JS7" width="100">
          <img class="p-l logo-for-grey" src="./assets/images/JS7-logo-grey-theme.png" alt="JS7" width="100">
        </div>
        <div class=" col-sm-9">
          <div class="row">
            <div class=" col-sm-12">
              <span>&copy; 2002-{{versionData.currentYear}} <a class="text-primary" target="_blank" href="https://www.sos-berlin.com">Software- und Organisations-Service GmbH.</a> </span>
            </div>
          </div>
          <div class="p-b-xs row">
            <div class="col-sm-12 text-black-lt">All right reserved.</div>
          </div>
          <div class="row">
            <label class="col-sm-3">JOC Cockpit</label>
            <div class=" col-sm-9">
              <span>{{versionData.gitHash}}</span>&nbsp;
              <span>{{versionData.version}} ({{versionData.date}})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AboutModalComponent implements OnInit {
  versionData: any = {};
  constructor(public modalService: NzModalRef, private coreService: CoreService, private ref: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.coreService.get('version.json').subscribe((data) => {
      this.versionData = data;
      this.ref.detectChanges();
    });
  }
}

@Component({
  selector: 'app-step-guide',
  templateUrl: './step-guide-dialog.component.html'
})
export class StepGuideComponent implements OnInit {
  line1: string;
  line2: string;

  constructor(public modalService: NzModalRef, private translate: TranslateService) {
  }

  static convertTextToLink(value: string, link): string {
    return value.replace(new RegExp(/%(.*)%/, 'gi'),
      '<a target="_blank" href="' + link + '" class="text-primary text-u-l">$1</a>');
  }

  ngOnInit(): void {
    this.translate.get('info.link.jobEnvironmentVariables').subscribe(link => {
      this.translate.get('info.message.line1').subscribe(translatedValue => {
        this.line1 = StepGuideComponent.convertTextToLink(translatedValue, link);
      });
    });
    this.translate.get('info.link.instructions').subscribe(link => {
      this.translate.get('info.message.line2').subscribe(translatedValue => {
        this.line2 = StepGuideComponent.convertTextToLink(translatedValue, link);
      });
    });
  }

  onSubmit(type): void {
    this.modalService.close(type);
  }
}

@Component({
  selector: 'app-info-menu',
  templateUrl: './info-menu.component.html'
})
export class InfoMenuComponent {
  @Input() isHeader: boolean;

  constructor(private modal: NzModalService) {
  }

  about(): any {
    this.modal.create({
      nzTitle: undefined,
      nzContent: AboutModalComponent,
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
  }

}
