import {Component} from '@angular/core';
import {Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
import {DataService} from '../../../services/data.service';
import {HelpViewerComponent} from "../../../components/help-viewer/help-viewer.component";
import {NzModalService} from "ng-zorro-antd/modal";

@Component({
  selector: 'app-file-transfer-history-summary',
  templateUrl: './file-transfer-history-summary.component.html'
})
export class FileTransferHistorySummaryComponent {
  summary: any;
  schedulerIds: any;
  preferences: any = {};
  filters: any = {};
  isLoaded = false;
  notAuthenticate = false;
  subscription: Subscription;

  constructor(private authService: AuthService, private coreService: CoreService,
              private router: Router, private dataService: DataService, public modal: NzModalService) {
    this.subscription = dataService.eventAnnounced$.subscribe(res => {
      if (res) {
        this.refresh(res);
      }
    });
  }

  refresh(args: { eventSnapshots: any[] }): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (const j in args.eventSnapshots) {
        if (args.eventSnapshots[j]) {
          if (args.eventSnapshots[j].eventType === 'FILETRANSFER') {
            this.getSummary();
            break;
          }
        }
      }
    }
  }

  ngOnInit(): void {
    this.summary = {};
    this.filters = this.coreService.getDashboardTab().history;
    if (sessionStorage['preferences']) {
      this.preferences = JSON.parse(sessionStorage['preferences']);
    }
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    if (this.schedulerIds.selected) {
      this.getSummary();
    } else {
      this.notAuthenticate = true;
      this.isLoaded = true;
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  getSummary(): void {
    this.coreService.post('yade/overview/summary', {
      controllerId: this.schedulerIds.selected,
      dateFrom: this.filters.date,
      timeZone: this.preferences.zone
    }).subscribe({
      next: (res: any) => {
        this.summary = res.files || {};
        this.isLoaded = true;
      }, error: (err) => {
        this.notAuthenticate = !err.isPermitted;
        this.isLoaded = true;
      }
    });
  }

  getSummaryByDate(date): void {
    this.filters.date = date;
    this.coreService.post('yade/overview/summary', {
      controllerId: this.schedulerIds.selected,
      dateFrom: date,
      timeZone: this.preferences.zone
    }).subscribe((res: any) => {
      this.summary = res.files || {};
    });
  }

  showSummary(state): void {
    const filter = this.coreService.getHistoryTab();
    filter.type = 'YADE';
    filter.yade.filter.states = state;
    filter.yade.selectedView = false;
    filter.yade.filter.date = this.filters.date === '0d' ? 'today' : this.filters.date;
    this.router.navigate(['/history']).then();
  }

  helpPage(): void{
    this.modal.create({
      nzTitle: undefined,
      nzContent: HelpViewerComponent,
      nzClassName: 'lg',
      nzData: {
        preferences: this.preferences,
        helpKey: 'dashboard-file-transfer'
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    })
  }
}
