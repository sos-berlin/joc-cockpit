import {Component, OnDestroy, OnInit} from '@angular/core';
import {interval, Subscription} from 'rxjs';
import {CoreService} from '../../services/core.service';
import {AuthService} from '../../components/guard';
import {ClipboardService} from 'ngx-clipboard';

declare const $;

@Component({
  selector: 'app-logging2',
  template: '<div class="p-a">\n' +
    '  <span *ngFor="let log of clientLogs">\n' +
    '  <ng-container *ngIf="logFilter(log)">\n' +
    '    <span style="font-family:\'Courier New\';color: #009933;white-space:nowrap;" [ngClass]="log.level==\'Error\' ? \'log_error\': log.level==\'Warn\' ? \' log_warn\' : log.level==\'Debug\' ? \' log_detail\' : \'\'" >{{log.entryDate | stringToDate}} [<span style="width: 47px;display: inline-block">{{log.level}}</span>]</span>\n' +
    '    <span>\n' +
    '      <span style=\'display:inline;background: transparent;font-family:"Open Sans","lucida grande","Segoe UI",arial,verdana,"lucida sans unicode",tahoma,serif;\'>{{log.message}}</span>\n' +
    '    </span><br></ng-container>\n' +
    '  </span>\n' +
    '</div>'
})
export class Logging2Component implements OnInit, OnDestroy {
  clientLogs = [];
  subscription: Subscription;
  clientLogFilter: any = {};

  constructor() {

  }

  ngOnInit() {
    this.clientLogFilter = JSON.parse(sessionStorage.clientLogFilter);
    this.clientLogs = JSON.parse(localStorage.logging);
    // Create an Observable that will publish a value on an interval
    this.subscription = interval(2500).subscribe(x => {
      this.clientLogs = JSON.parse(localStorage.logging);
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  logFilter(log): boolean {
    return this.clientLogFilter.status.indexOf(log.level.toLowerCase()) !== -1;
  }

}

@Component({
  selector: 'app-logging',
  templateUrl: './logging.component.html'
})
export class LoggingComponent implements OnInit, OnDestroy {

  clientLogs = [];
  clientLogFilter: any = {};
  schedulerIds: any = {};
  permission: any = {};
  subscription: Subscription;

  constructor(private coreService: CoreService, private authService: AuthService,
              private clipboardService: ClipboardService) {
    if (sessionStorage.clientLogFilter) {
      this.clientLogFilter = JSON.parse(sessionStorage.clientLogFilter);
    } else {
      this.clientLogFilter = {status: ['info', 'debug', 'error', 'warn'], isEnable: true};
    }
  }

  ngOnInit() {
    if (this.authService.scheduleIds) {
      this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    }
    if (this.authService.permission) {
      this.permission = JSON.parse(this.authService.permission) || {};
    }
    if (this.clientLogFilter.isEnable) {
      this.clientLogs = JSON.parse(localStorage.logging);
    }
    // Create an Observable that will publish a value on an interval
    this.subscription = interval(2500).subscribe(x => {
      if (this.clientLogFilter.isEnable) {
        this.clientLogs = JSON.parse(localStorage.logging);
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  logFilter(log): boolean {
    return this.clientLogFilter.status.indexOf(log.level ? log.level.toLowerCase() : log.level) !== -1;
  }

  saveSettingConf() {
    let configObj = {
      controllerId: this.schedulerIds.selected,
      account: this.permission.user,
      configurationType: 'SETTING',
      id: parseInt(sessionStorage.settingId, 10),
      configurationItem: JSON.stringify(this.clientLogFilter)
    };
    this.coreService.post('configuration/save', configObj).subscribe((res: any) => {
      sessionStorage.clientLogFilter = JSON.stringify(this.clientLogFilter);
    });
  }

  copy() {
    this.clipboardService.copyFromContent($('#logDiv').text());
  }

  redirectToNewTab() {
    window.open('#/client-logs', '_blank');
  }
}
