import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {LogConsoleRequest} from '../../components/log-console/log-console.component';

@Component({
  standalone: false,
  selector: 'app-system-log-page',
  template: `
    @if (request) {
      <app-log-console [request]="request"></app-log-console>
    }
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
    }
    app-log-console {
      flex: 1;
      min-height: 0;
      display: block;
    }
  `]
})
export class SystemLogPageComponent implements OnInit {
  request: LogConsoleRequest | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const p = this.route.snapshot.queryParams;
    this.request = {
      type:         p['type']         || 'controller',
      controllerId: p['controllerId'] || undefined,
      role:         p['role']         || undefined,
      agentId:      p['agentId']      || undefined,
      subagentId:   p['subagentId']   || undefined,
      level:        p['level']        || 'INFO',
      dateFrom:     p['dateFrom']     || '1d',
      dateTo:       p['dateTo']       || undefined,
      timeZone:     p['timeZone']     || undefined,
      numOfLines:   p['numOfLines']   ? Number(p['numOfLines']) : undefined
    };
  }
}
