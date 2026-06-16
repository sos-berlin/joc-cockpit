import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
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

  constructor(private route: ActivatedRoute, private translate: TranslateService) {}

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
      numOfLines:   p['numOfLines']   ? Number(p['numOfLines']) : 2500,
      limit:        p['limit']   ? Number(p['limit']) : 250
    };
    document.title = this.buildTitle(this.request);
  }

  private buildTitle(req: LogConsoleRequest): string {
    const parts: string[] = [];
    if (req.type === 'controller') {
      parts.push(this.translate.instant('logConsole.label.controller'));
      if (req.controllerId) parts.push(req.controllerId);
      if (req.role)         parts.push(req.role);
    } else if (req.type === 'agent') {
      parts.push(this.translate.instant('logConsole.label.agent'));
      if (req.subagentId)   parts.push(req.subagentId);
      else if (req.agentId) parts.push(req.agentId);
    } else if (req.type === 'joc') {
      parts.push(this.translate.instant('logConsole.label.joc'));
    }
    return parts.join(' — ');
  }
}
