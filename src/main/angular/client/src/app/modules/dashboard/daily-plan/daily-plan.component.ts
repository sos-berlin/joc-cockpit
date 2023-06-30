import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs';
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
  finished = 0;
  submitted = 0;
  plannedLate = 0;
  submittedLate = 0;
  subscription: Subscription;

  constructor(private coreService: CoreService, private authService: AuthService,
              private router: Router, private dataService: DataService) {
    this.subscription = dataService.eventAnnounced$.subscribe(res => {
      if (res) {
        this.refresh(res);
      }
    });
  }

  ngOnInit(): void {
    if (sessionStorage['preferences']) {
      this.preferences = JSON.parse(sessionStorage['preferences']);
    }
    this.filters = this.coreService.getDashboardTab().dailyplan;
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    if (this.schedulerIds.selected) {
      this.getPlans();
    } else {
      this.isLoaded = true;
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  getPlans(): void {
    let d = new Date();
    d.setDate(new Date().getDate() + 1);
    const obj = {
      controllerIds: [this.schedulerIds.selected],
      dailyPlanDateFrom: this.coreService.getStringDate(this.filters.date === '0d' ? null : d)
    };

    this.coreService.post('daily_plan/orders/summary', obj).subscribe({
      next: (res) => {
        this.filterData(res);
        this.isLoaded = true;
      }, error: () => this.isLoaded = true
    });
  }

  getDailyPlans(date): void {
    if (this.schedulerIds.selected) {
      this.filters.date = date;
      this.getPlans();
    }
  }

  filterData(res): void {
    this.totalPlanData = ((res.planned || 0) + (res.submitted || 0) + (res.finished || 0) + (res.plannedLate || 0) + (res.submittedLate || 0));
    this.planned = this.getPlanPercent(res.planned);
    this.finished = this.getPlanPercent(res.finished);
    this.plannedLate = this.getPlanPercent(res.plannedLate);
    this.submitted = this.getPlanPercent(res.submitted);
    this.submittedLate = this.getPlanPercent(res.submittedLate);
    this.arrayWidth = [this.planned, this.plannedLate, this.submitted, this.submittedLate, this.finished];

    let totalLessWidth = 0, totalGreaterWidth = 0, flag = false;
    for (let i = 0; i <= 6; i++) {
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
    for (let i = 0; i <= 6; i++) {
      if (this.arrayWidth[i] > 28) {
        this.arrayWidth[i] = (100 - totalLessWidth) * this.arrayWidth[i] / totalGreaterWidth;
      }
    }

    if (!flag) {
      this.arrayWidth = [this.planned, this.plannedLate, this.submitted, this.submittedLate, this.finished];
      totalLessWidth = 0;
      totalGreaterWidth = 0;
      for (let i = 0; i <= 6; i++) {
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
      for (let i = 0; i <= 6; i++) {
        if (this.arrayWidth[i] > 14) {
          this.arrayWidth[i] = (100 - totalLessWidth) * this.arrayWidth[i] / totalGreaterWidth;
        }
      }
    }
  }

  getPlanPercent(status): number {
    return ((status || 0) / this.totalPlanData) * 100;
  }

  navigate(obj): void {
    let d = new Date();
    if (this.filters.date !== '0d') {
      d.setDate(new Date().getDate() + 1);
    }
    const filter = this.coreService.getDailyPlanTab();
    filter.selectedDate = new Date(d);
    filter.filter.status = (obj === 1 || obj === 2) ? 'PLANNED' : (obj === 4 || obj === 5) ? 'SUBMITTED' : 'FINISHED';
    filter.filter.late = (obj === 2 || obj === 5);
    this.router.navigate(['/daily_plan']).then();
  }

  private refresh(args: { eventSnapshots: any[] }): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].eventType === 'DailyPlanUpdated') {
          let d = new Date();
          if (this.filters.date === '1d') {
            d.setDate(new Date().getDate() + 1);
          }
          if (!args.eventSnapshots[j].message || (args.eventSnapshots[j].message === this.coreService.getStringDate(d))) {
            this.getPlans();
          }
          break;
        }
      }
    }
  }
}
