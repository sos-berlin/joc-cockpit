import {Component, OnInit, OnDestroy} from '@angular/core';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
import {DataService} from '../../../services/data.service';
import {Subscription} from 'rxjs';
import * as moment from 'moment';

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

    this.coreService.post('daily_plan/orders', obj).subscribe((res: any) => {
      this.filterData(res.plannedOrderItems || []);
      this.isLoaded = true;
    }, (err) => {
      this.isLoaded = true;
    });
  }

  getDailyPlans(date): void {
    if (this.schedulerIds.selected) {
      this.filters.date = date;
      this.getPlans();
    }
  }

  filterData(plannedOrderItems) {
    this.planned = 0;
    this.pending = 0;
    this.finished = 0;
    this.plannedLate = 0;
    this.pendingLate = 0;
    this.totalPlanData = plannedOrderItems.length;
    for (let i = 0; i < this.totalPlanData; i++) {
      if (plannedOrderItems[i].state._text === 'PLANNED') {
        if (plannedOrderItems[i].late) {
          this.plannedLate++;
        }
        this.planned++;
      } else if (plannedOrderItems[i].state._text === 'PENDING') {
        if (plannedOrderItems[i].late) {
          this.pendingLate++;
        }
        this.pending++;
      } else if (plannedOrderItems[i].state._text === 'FINISHED') {
        this.finished++;
      }
    }
    this.planned = this.getPlanPercent(this.planned);
    this.pending = this.getPlanPercent(this.pending);
    this.finished = this.getPlanPercent(this.finished);
    this.plannedLate = this.getPlanPercent(this.plannedLate);
    this.pendingLate = this.getPlanPercent(this.pendingLate);
    this.arrayWidth = [];
    this.arrayWidth[0] = this.planned;
    this.arrayWidth[1] = this.plannedLate;
    this.arrayWidth[2] = this.pending;
    this.arrayWidth[3] = this.pendingLate;
    this.arrayWidth[4] = this.finished;

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
      this.arrayWidth[0] = this.planned;
      this.arrayWidth[1] = this.plannedLate;
      this.arrayWidth[2] = this.pending;
      this.arrayWidth[3] = this.pendingLate;
      this.arrayWidth[4] = this.finished;
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

}
