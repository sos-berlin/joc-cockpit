import {Component, OnInit, OnDestroy} from '@angular/core';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
import {DataService} from '../../../services/data.service';
import {Subscription} from 'rxjs';
import {Router} from '@angular/router';

@Component({
  selector: 'app-file-summary',
  templateUrl: './file-summary.component.html'
})
export class FileSummaryComponent implements OnInit, OnDestroy {

  yadeSummary: any = {};
  schedulerIds: any = {};
  preferences: any = {};
  filters: any = {};
  isLoaded = false;
  notAuthenticate = false;
  subscription: Subscription;

  constructor(public authService: AuthService, public coreService: CoreService, private router: Router, private dataService: DataService) {

    this.subscription = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
  }

  refresh(args) {
    for (let i = 0; i < args.length; i++) {
      if (args[i].jobschedulerId == this.schedulerIds.selected) {
        if (args[i].eventSnapshots && args[i].eventSnapshots.length > 0) {
          for (let j = 0; j < args[i].eventSnapshots.length; j++) {
            if (args[i].eventSnapshots[j].eventType === 'YADETransferStarted') {
              this.getSummary();
              break;
            }
          }
        }
        break;
      }
    }
  }

  getSummary(): void {
    this.coreService.post('yade/overview/summary', {
      jobschedulerId: this.schedulerIds.selected,
      dateFrom: this.filters.date,
      timeZone: this.preferences.zone
    }).subscribe(res => {
      this.yadeSummary = res;
      this.isLoaded = true;
    }, (err) => {
      this.notAuthenticate = !err.isPermitted;
      this.isLoaded = true;
    });
  }

  getSummaryByDate(date): void {
    this.filters.date = date;
    this.coreService.post('yade/overview/summary', {
      jobschedulerId: this.schedulerIds.selected,
      dateFrom: date,
      timeZone: this.preferences.zone
    }).subscribe(res => {
      this.yadeSummary = res;
    });
  }

  ngOnInit() {
    this.filters = this.coreService.getDashboardTab().file;
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences);
    }
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    if (this.schedulerIds.selected) {
      this.getSummary();
    } else {
      this.notAuthenticate = true;
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  showYadeSummary(state) {
    let filter = this.coreService.getHistoryTab();
    filter.type = 'YADE';
    filter.yade.filter.historyStates = state;
    filter.yade.selectedView = false;
    filter.yade.filter.date = this.filters.date === '0d' ? 'today' : this.filters.date;
    this.router.navigate(['/history']);
  }
}
