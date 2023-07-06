import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input} from '@angular/core';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {TranslateService} from '@ngx-translate/core';
import {CoreService} from '../../services/core.service';
import {DataService} from "../../services/data.service";

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
      <div class="row" *ngIf="isLoaded">
        <div class="col-sm-3">
          <img class="p-t-xs m-l logo-for-default" [ngClass]="{'m-l-sm': validUntil}"
               src="./assets/images/JS7-logo-default-theme.png" alt="JS7" [width]="validUntil ? 122 : 100">
          <img class="p-t-xs m-l logo-for-light" [ngClass]="{'m-l-sm': validUntil}"
               src="./assets/images/JS7-logo-light-theme.png" alt="JS7" [width]="validUntil ? 122 : 100">
          <img class="p-t-xs m-l logo-for-dark" [ngClass]="{'m-l-sm': validUntil}"
               src="./assets/images/JS7-light-dark-theme.png" alt="JS7" [width]="validUntil ? 122 : 100">
          <img class="p-t-xs m-l logo-for-grey" [ngClass]="{'m-l-sm': validUntil}"
               src="./assets/images/JS7-logo-grey-theme.png" alt="JS7" [width]="validUntil ? 122 : 100">
        </div>
        <div class=" col-sm-9">
          <div class="row" [ngStyle]="{'margin-top': versionData.gitHash ? 'auto' : '32px'}">
            <div class=" col-sm-12">
              <span>&copy; 2002-{{versionData.currentYear}} <a class="text-primary" target="_blank"
                                                               href="https://www.sos-berlin.com">Software- und Organisations-Service GmbH.</a> </span>
            </div>
          </div>
          <div class="p-b-xs row">
            <div class="col-sm-12 text-black-lt" translate>info.label.allRightReserved</div>
          </div>
          <div class="row" *ngIf="licenseType">
            <label class="col-sm-3" translate>info.label.licenseType</label>
            <div class="col-sm-9">
              <span *ngIf="licenseType !== 'OPENSOURCE'">
                <i *ngIf="licenseType == 'COMMERCIAL_INVALID'" [nz-tooltip]="'info.tooltip.invalidLicense' | translate"
                   class="fa fa-times-circle text-danger" aria-hidden="true"></i>
                {{'info.label.commercialLicense' | translate}}
              </span>
              <span *ngIf="licenseType === 'OPENSOURCE'" translate>info.label.openSourceLicense</span>
              <a *ngIf="licenseType !== 'OPENSOURCE'" class="text-primary text-hover-primary m-l-md"
                 (click)="checkLicense()">
                <i *ngIf="!isCompleted || isLoading" class="fa fa-refresh m-r-xs" [ngClass]="{'fa-spin': isLoading}"></i>
                <i *ngIf="isCompleted && !isLoading" class="fa fa-check p-r-xs"></i>
                {{'info.button.checkLicense' | translate}}
              </a>
            </div>
          </div>
          <div class="row m-t-xs" *ngIf="licenseType && licenseType !== 'OPENSOURCE'">
            <label class="col-sm-3" translate>info.label.licenseValidity</label>
            <div class="col-sm-9"
                 [ngClass]="remainingDays < 1 ? 'text-danger' : remainingDays < 7 ? 'text-warning' : ''">
              <i>{{validFrom}}</i>
              -
              <i>{{validUntil}}</i>
            </div>
          </div>
          <div class="row m-t-xs" *ngIf="versionData.gitHash">
            <label class="col-sm-3">JOC Cockpit</label>
            <div class=" col-sm-9">
              <span>{{versionData.gitHash}}</span>&nbsp;
              <span>{{versionData.version}} ({{versionData.date}})</span>
            </div>
          </div>
        </div>
      </div>
      <div class="row" *ngIf="!isLoaded">
        <div class="col-md-12">
          <div class="loading-center text-primary text min-ht-128">
            <div><i class="fa fa-refresh fa-lg fa-spin"></i></div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AboutModalComponent {
  versionData: any = {};
  isLoading = false;
  isLoaded = false;
  isCompleted = false;
  hasLicense = false;
  licenseType = '';
  validFrom = '';
  validUntil = '';
  remainingDays: number;

  constructor(public modalService: NzModalRef, private coreService: CoreService, private dataService: DataService,
              private ref: ChangeDetectorRef) {
  }

  private stringToDate(date: any): any {
    if (sessionStorage['preferences']) {
      const n = JSON.parse(sessionStorage['preferences']);
      if (!n.zone) {
        return '';
      }
      return this.coreService.getDateByFormat(date, n.zone, n.dateFormat);
    } else {
      return this.coreService.getDateByFormat(date, null, 'DD.MM.YYYY HH:mm:ss');
    }
  }


  ngOnInit(): void {
    this.hasLicense = sessionStorage['hasLicense'] == 'true';
    if (sessionStorage['$SOS$accessTokenId']) {
      this.licenseType = sessionStorage['licenseType'];
      let validUntil = sessionStorage['licenseValidUntil'];
      if (validUntil && (this.hasLicense || this.licenseType !== 'OPENSOURCE')) {
        this.checkLicense()
      } else {
        this.isLoaded = true;
      }
      this.coreService.get('version.json').subscribe((data) => {
        this.versionData = data;
        this.ref.detectChanges();
      });
    } else {
      this.isLoaded = true;
    }
  }

  checkLicense(): void {
    if (!this.isLoading) {
      this.isLoading = true;
      this.coreService.post('joc/license', {}).subscribe({
        next: (data) => {
          this.licenseType = data.type;
          this.isCompleted = true;
          let recheckWarningFunc = false;
          if (sessionStorage['licenseValidUntil'] != data.validUntil) {
            recheckWarningFunc = true;
          }
          sessionStorage['licenseValidFrom'] = data.validFrom;
          sessionStorage['licenseValidUntil'] = data.validUntil;
          if (recheckWarningFunc) {
            this.dataService.reloadLicenseCheck.next(true);
          }
          this.isLoading = false;
          this.formatDate(data.validFrom, data.validUntil);
        }, error: () => {
          let validFrom = sessionStorage['licenseValidFrom'];
          let validUntil = sessionStorage['licenseValidUntil'];
          this.formatDate(validFrom, validUntil);
          this.isLoading = false;
        }
      });
    }
  }

  private formatDate(validFrom: any, validUntil: any): void {
    this.isLoaded = true;
    if (validFrom) {
      this.validFrom = this.stringToDate(validFrom);
    }
    if (validUntil) {
      this.validUntil = this.stringToDate(validUntil);
      const differenceInTime = new Date(validUntil).getTime() - new Date().getTime();
      this.remainingDays = Math.floor(differenceInTime / (1000 * 3600 * 24));
    } else {
      this.remainingDays = 0;
    }
    this.ref.detectChanges();
  }
}

@Component({
  selector: 'app-step-guide',
  templateUrl: './step-guide-dialog.component.html'
})
export class StepGuideComponent {
  line1: string = '';
  line2: string = '';

  constructor(public modalService: NzModalRef, private translate: TranslateService, private coreService: CoreService) {
  }

  ngOnInit(): void {
    this.translate.get('info.link.jobEnvironmentVariables').subscribe(link => {
      this.translate.get('info.message.line1').subscribe(translatedValue => {
        this.line1 = this.coreService.convertTextToLink(translatedValue, link);
      });
    });
    this.translate.get('info.link.instructions').subscribe(link => {
      this.translate.get('info.message.line2').subscribe(translatedValue => {
        this.line2 = this.coreService.convertTextToLink(translatedValue, link);
      });
    });
  }

  onSubmit(type: any): void {
    this.modalService.close(type);
  }
}

@Component({
  selector: 'app-info-menu',
  templateUrl: './info-menu.component.html'
})
export class InfoMenuComponent {
  @Input() isHeader: boolean = false;

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
