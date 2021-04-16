import {Component, OnInit} from '@angular/core';
import {CoreService} from '../../services/core.service';
import {NzModalRef} from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-about',
  template: `
    <div class="modal-header">
      <h4 class="modal-title">
        <span translate>info.button.aboutJS7</span>
      </h4>
      <button type="button" class="close" aria-label="Close" (click)="modal.destroy()">
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
  constructor(public modal: NzModalRef, private coreService: CoreService) {
  }

  ngOnInit(): void {
    this.coreService.get('version.json').subscribe((data) => {
      this.versionData = data;
    });
  }
}
