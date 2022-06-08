import {Component, OnDestroy, OnInit} from '@angular/core';
import {interval, Subscription} from 'rxjs';
import {ClipboardService} from 'ngx-clipboard';
import {NzMessageService} from 'ng-zorro-antd/message';
import {CoreService} from '../../services/core.service';
import {AuthService} from '../../components/guard';

declare const $;

@Component({
  selector: 'app-logging2',
  template: '<div class="p-a">\n' +
    '  <span *ngFor="let log of clientLogs">\n' +
    '  <ng-container *ngIf="logFilter(log)">\n' +
    '    <span class="log-state" [ngClass]="log.level==\'Error\' ? \'log_error\': log.level==\'Warn\' ? \' log_warn\' : log.level==\'Debug\' ? \' log_detail\' : \'\'" >{{log.entryDate | stringToDate}} [<span class="log-level">{{log.level}}</span>]</span>\n' +
    '    <span>\n' +
    '      <span class="log-msg">{{log.message}}</span>\n' +
    '    </span><br></ng-container>\n' +
    '  </span>\n' +
    '</div>',
  styles: ['.log-state {font-family:\'Courier New\';color: #009933;white-space:nowrap;} .log-msg {display:inline;background: transparent;font-family:"Open Sans","lucida grande","Segoe UI",arial,verdana,"lucida sans unicode",tahoma,serif;} .log-level {width: 47px;display: inline-block}']
})
export class Logging2Component implements OnInit, OnDestroy {
  clientLogs = [];
  subscription: Subscription;
  clientLogFilter: any = {};

  constructor() {
  }

  ngOnInit(): void {
    this.clientLogFilter = JSON.parse(sessionStorage.clientLogFilter);
    this.clientLogs = JSON.parse(localStorage.logging);
    // Create an Observable that will publish a value on an interval
    this.subscription = interval(2500).subscribe(x => {
      this.clientLogs = JSON.parse(localStorage.logging);
    });
  }

  ngOnDestroy(): void {
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
  checkOptions = [
    { label: 'info', value: 'info', checked: false },
    { label: 'error', value: 'error', checked: false },
    { label: 'warn', value: 'warn', checked: false },
    { label: 'debug', value: 'debug', checked: false }
  ];

  constructor(private coreService: CoreService, private authService: AuthService,
              private clipboardService: ClipboardService, private message: NzMessageService) {
    if (sessionStorage.clientLogFilter) {
      this.clientLogFilter = JSON.parse(sessionStorage.clientLogFilter);
    } else {
      this.clientLogFilter = {status: ['info', 'debug', 'error', 'warn'], isEnable: true};
    }
  }

  ngOnInit(): void {
    if (this.authService.scheduleIds) {
      this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    }
    if (this.authService.permission) {
      this.permission = JSON.parse(this.authService.permission) || {};
    }
    if (this.clientLogFilter.isEnable) {
      try {
        this.clientLogs = localStorage.logging ? JSON.parse(localStorage.logging) : [];
      } catch (e) {}
    }
    // Create an Observable that will publish a value on an interval
    this.subscription = interval(2500).subscribe(() => {
      if (this.clientLogFilter.isEnable) {
        try {
          this.clientLogs = localStorage.logging ? JSON.parse(localStorage.logging) : [];
        } catch (e) {}
      }
    });
    if (this.clientLogFilter.status && this.clientLogFilter.status.length > 0) {
      this.checkOptions = this.checkOptions.map(item => {
        return {
          ...item,
          checked: this.clientLogFilter.status.indexOf(item.value) > -1
        };
      });
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  statusChange(value: string[]): void {
    this.clientLogFilter.status = value;
    this.saveSettingConf();
  }

  logFilter(log): boolean {
    return this.clientLogFilter.status.indexOf(log.level ? log.level.toLowerCase() : log.level) !== -1;
  }

  saveSettingConf(): void {
    if (this.schedulerIds && this.schedulerIds.selected) {
      const configObj = {
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
  }

  copy(): void {
    this.coreService.showCopyMessage(this.message);
    this.clipboardService.copyFromContent($('#logDiv').text());
  }

  redirectToNewTab(): void {
    window.open('#/client-logs', '_blank');
  }
}
