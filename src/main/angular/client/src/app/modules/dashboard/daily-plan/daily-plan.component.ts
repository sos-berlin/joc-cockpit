import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs';
import * as moment from 'moment';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
import {DataService} from '../../../services/data.service';

@Component({
  selector: 'app-daily-plan',
  templateUrl: './daily-plan.component.html'
})
export class DailyPlanComponent implements OnInit, OnDestroy {

  schedulerIds: any = {};
  filters: any = {};
  preferences: any = {};
  arrayWidth: any = [];
  isLoaded = false;
  totalPlanData = 0;
  planned = 0;
  pending = 0;
  finished = 0;
  plannedLate = 0;
  pendingLate = 0;
  subscription: Subscription;

  constructor(private coreService: CoreService, private authService: AuthService,
              private router: Router, private dataService: DataService) {
    this.subscription = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
  }

  private refresh(args) {
    for (let i = 0; i < args.length; i++) {
      if (args[i].jobschedulerId == this.schedulerIds.selected) {
        if (args[i].eventSnapshots && args[i].eventSnapshots.length > 0) {
          for (let j = 0; j < args[i].eventSnapshots.length; j++) {
            if (args[i].eventSnapshots[j].eventType === 'DailyPlanChanged') {
              this.getPlans();
              break;
            }
          }
        }
        break;
      }
    }
  }

  ngOnInit() {
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences);
    }
    this.filters = this.coreService.getDashboardTab().dailyplan;
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    if (this.schedulerIds.selected) {
      this.getPlans();
    } else {
      this.isLoaded = true;
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  getPlans(): void {
    let d = new Date();
    d.setDate(new Date().getDate() + 1);
    const obj = {
      controllerId: this.schedulerIds.selected,
      filter: {
        dailyPlanDate: this.filters.date === '0d' ? moment().format('YYYY-MM-DD') : moment(d).format('YYYY-MM-DD')
      }
    };

    this.coreService.post('daily_plan/orders/summary', obj).subscribe((res) => {
      this.filterData(res);
      this.isLoaded = true;
    }, () => {
      this.isLoaded = true;
    });
  }

  getDailyPlans(date): void {
    if (this.schedulerIds.selected) {
      this.filters.date = date;
      this.getPlans();
    }
  }

  filterData(res) {
    this.totalPlanData = ((res.planned || 0) + (res.pending || 0) + (res.finished || 0) + (res.plannedLate || 0) + (res.pendingLate || 0));
    this.planned = this.getPlanPercent(res.planned);
    this.pending = this.getPlanPercent(res.pending);
    this.finished = this.getPlanPercent(res.finished);
    this.plannedLate = this.getPlanPercent(res.plannedLate);
    this.pendingLate = this.getPlanPercent(res.pendingLate);
    this.arrayWidth = [this.planned, this.plannedLate, this.pending, this.pendingLate, this.finished];

    let totalLessWidth = 0, totalGreaterWidth = 0, flag = false;
    for (let i = 0; i <= 5; i++) {
      if (this.arrayWidth[i] > 0) {
        if (this.arrayWidth[i] <= 28) {
          this.arrayWidth[i] = 14;
          totalLessWidth = totalLessWidth + this.arrayWidth[i];
        }
        if (this.arrayWidth[i] > 28) {
          flag = true;
          totalGreaterWidth = totalGreaterWidth + this.arrayWidth[i];
        }
      }
    }
    for (let i = 0; i <= 5; i++) {
      if (this.arrayWidth[i] > 28) {
        this.arrayWidth[i] = (100 - totalLessWidth) * this.arrayWidth[i] / totalGreaterWidth;
      }
    }

    if (!flag) {
      this.arrayWidth = [this.planned, this.plannedLate, this.pending, this.pendingLate, this.finished];
      let totalLessWidth = 0, totalGreaterWidth = 0;
      for (let i = 0; i <= 5; i++) {
        if (this.arrayWidth[i] > 0) {

          if (this.arrayWidth[i] <= 14) {
            this.arrayWidth[i] = 14;
            totalLessWidth = totalLessWidth + this.arrayWidth[i];
          }
          if (this.arrayWidth[i] > 14) {
            totalGreaterWidth = totalGreaterWidth + this.arrayWidth[i];
          }
        }
      }
      for (let i = 0; i <= 5; i++) {
        if (this.arrayWidth[i] > 14) {
          this.arrayWidth[i] = (100 - totalLessWidth) * this.arrayWidth[i] / totalGreaterWidth;
        }
      }
    }
  }

  getPlanPercent(status) {
    return ((status || 0) / this.totalPlanData) * 100;
  }

  navigate(obj) {
    let d = new Date();
    if (this.filters.date !== '0d') {
      d.setDate(new Date().getDate() + 1);
    }
    const filter = this.coreService.getDailyPlanTab();
    filter.selectedDate = new Date(d);
    filter.filter.status = (obj === 1 || obj === 2) ? 'PLANNED' : (obj === 3 || obj === 4) ? 'PENDING' : 'FINISHED';
    filter.filter.late = (obj === 2 || obj === 4);
    this.router.navigate(['/daily_plan']);
  }
}