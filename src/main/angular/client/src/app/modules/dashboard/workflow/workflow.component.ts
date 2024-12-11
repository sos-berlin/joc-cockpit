import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
import {DataService} from '../../../services/data.service';

@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.component.html'
})
export class WorkflowComponent {
  schedulerIds: any = {};
  preferences: any = {};
  totalWorkflows: number = 0;
  notSynchronized: number = 0;
  synchronized: number = 0;
  outstanding: number = 0;
  suspended: number = 0;
  arrayWidth: any = [];
  isLoaded = false;

  constructor(private coreService: CoreService, private authService: AuthService,
              private router: Router, private dataService: DataService) {
  }

  ngOnInit(): void {
    if (sessionStorage['preferences']) {
      this.preferences = JSON.parse(sessionStorage['preferences']);
    }
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    if (this.schedulerIds.selected) {
      this.getPlans();
    } else {
      this.isLoaded = true;
    }
  }

  ngOnDestroy(): void {
    // this.subscription.unsubscribe();
  }

  getPlans(): void {
    const obj = {
      controllerId: this.schedulerIds.selected,
    };

    this.coreService.post('workflows/overview/snapshot', obj).subscribe({
      next: (res) => {
        this.filterData(res.workflows);
        this.isLoaded = true;
      }, error: () => this.isLoaded = true
    });
  }

  filterData(workflows): void {
    this.totalWorkflows = (workflows.notSynchronized || 0) + (workflows.outstanding || 0) + (workflows.suspended || 0) + (workflows.synchronized || 0);
    this.notSynchronized = this.getPlanPercent(workflows.notSynchronized);
    this.synchronized = this.getPlanPercent(workflows.synchronized);
    this.outstanding = this.getPlanPercent(workflows.outstanding);
    this.suspended = this.getPlanPercent(workflows.suspended);
    this.arrayWidth = [this.synchronized, this.outstanding, this.suspended, this.notSynchronized];

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
      this.arrayWidth = [this.synchronized, this.outstanding, this.suspended, this.notSynchronized];
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
    return ((status || 0) / this.totalWorkflows) * 100;
  }

  navigate(obj): void {
    const filter = this.coreService.getWorkflowTab();
    if (obj === 1) {
      filter.filter.states = ['IN_SYNC'];
    } else if (obj === 2) {
      filter.filter.states = ['OUTSTANDING'];
    } else if (obj === 3) {
      filter.filter.states = ['SUSPENDED'];
    } else if (obj === 4) {
      filter.filter.states = ['NOT_IN_SYNC'];
    }
    this.router.navigate(['/workflows']).then();
  }

}
