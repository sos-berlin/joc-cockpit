import {Component, OnInit, OnDestroy} from '@angular/core';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
import {DataService} from '../../../services/data.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-daily-plan',
  templateUrl: './daily-plan.component.html'
})
export class DailyPlanComponent implements OnInit, OnDestroy {

  schedulerIds: any = {};
  filters: any = {date: ''};
  preferences: any = {};
  arrayWidth: any = [];
  isLoaded = false;
  totalPlanData = 0;
  waiting = 0;
  late = 0;
  lateSuccess = 0;
  lateError = 0;
  success = 0;
  error = 0;
  subscription: Subscription;

  constructor(private coreService: CoreService, private authService: AuthService, private dataService: DataService) {
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
    if (sessionStorage.preferences)
      this.preferences = JSON.parse(sessionStorage.preferences);
    this.schedulerIds = JSON.parse(this.authService.scheduleIds);
    this.filters.date = this.coreService.getDashboardTab().dailyplan;
    this.getPlans();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  getPlans(): void {
    let obj = {
      jobschedulerId: this.schedulerIds.selected,
      dateFrom: this.filters.date,
      timeZone: this.preferences.zone
    };

    this.coreService.post('order/plan', obj).subscribe(res => {
      this.filterData(res);
      this.isLoaded = true;
    }, (err) => {
      console.log(err);
      this.isLoaded = true;
    });
  }

  getDailyPlans(date): void {
    this.filters.date = date;
    this.getPlans();
  }

  filterData(res) {
    this.waiting = 0;
    this.late = 0;
    this.lateSuccess = 0;
    this.lateError = 0;
    this.success = 0;
    this.error = 0;
    this.totalPlanData = 0;
    for (let i = 0; i < res.planItems.length; i++) {
      this.totalPlanData++;
      let time;
      if (res.planItems[i].state._text == 'FAILED') {
        if (res.planItems[i].late) {
          this.lateError++;
        }
        this.error++;
      } else if (res.planItems[i].state._text == 'SUCCESSFUL') {
        if (res.planItems[i].late) {
          this.lateSuccess++;
        }
        this.success++;
      } else if (res.planItems[i].state._text == 'PLANNED') {
        if (res.planItems[i].late) {
          this.late++;
        }
        this.waiting++;
      }
    }
    this.waiting = this.getPlanPercent(this.waiting);
    this.late = this.getPlanPercent(this.late);
    this.success = this.getPlanPercent(this.success);
    this.lateSuccess = this.getPlanPercent(this.lateSuccess);
    this.error = this.getPlanPercent(this.error);
    this.lateError = this.getPlanPercent(this.lateError);
    this.arrayWidth = [];
    this.arrayWidth[0] = this.waiting;
    this.arrayWidth[1] = this.late;
    this.arrayWidth[2] = this.success;
    this.arrayWidth[3] = this.lateSuccess;
    this.arrayWidth[4] = this.error;
    this.arrayWidth[5] = this.lateError;

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
      this.arrayWidth[0] = this.waiting;
      this.arrayWidth[1] = this.late;
      this.arrayWidth[2] = this.success;
      this.arrayWidth[3] = this.lateSuccess;
      this.arrayWidth[4] = this.error;
      this.arrayWidth[5] = this.lateError;
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
    return (status / this.totalPlanData) * 100;
  }

  navigate(obj) {
    console.log(obj);
  }
}
