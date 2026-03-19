import {Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges} from '@angular/core';
import {CoreService} from '../../services/core.service';
import {interval, Subscription} from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-job-progress-bar',
  templateUrl: './job-progress-bar.component.html',
  styleUrls: ['./job-progress-bar.component.css']
})
export class JobProgressBarComponent implements OnInit, OnDestroy, OnChanges {
  @Input() order: any;
  @Input() controllerId: any;
  @Input() showDetails: boolean = true;

  progress: number = 0;
  timeElapsed: number = 0;
  estimatedTime: number = 0;
  expectedTime: number = 0; // From job warning configuration
  timeRemaining: number = 0;
  isOverdue: boolean = false;
  isRunning: boolean = false;
  maxHistoricalTime: number = 0;

  private updateSubscription: Subscription;
  private historyData: any[] = [];

  constructor(private coreService: CoreService) {}

  ngOnInit(): void {
    this.checkOrderState();

    if (this.isRunning) {
      this.startProgressTracking();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['order'] && !changes['order'].firstChange) {
      const previousState = this.isRunning;
      this.checkOrderState();

      if (previousState && !this.isRunning) {
        this.stopProgressTracking();
      }
      else if (!previousState && this.isRunning) {
        this.startProgressTracking();
      }
    }
  }

  ngOnDestroy(): void {
    this.stopProgressTracking();
  }

  private startProgressTracking(): void {
    this.checkExpectedTime();
    this.fetchHistoryData();
    this.updateSubscription = interval(1000).subscribe(() => {
      this.updateProgress();
    });
  }

  private stopProgressTracking(): void {
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
      this.updateSubscription = null;
    }
  }

  private checkExpectedTime(): void {
    if (this.order.expectedExecutionTime) {
      this.expectedTime = this.order.expectedExecutionTime * 1000;
    } else if (this.order.warnIfLonger) {
      this.expectedTime = this.order.warnIfLonger * 1000;
    }
  }

  private checkOrderState(): void {
    let stateText = null;

    if (this.order && this.order.orderState && this.order.orderState._text) {
      stateText = this.order.orderState._text.toUpperCase();
    }
    else if (this.order && this.order.state && this.order.state._text) {
      stateText = this.order.state._text.toUpperCase();
    }

    if (stateText) {
      this.isRunning = (stateText === 'RUNNING' || stateText === 'INPROGRESS' || stateText === 'IN_PROGRESS');
    }
  }

  private fetchHistoryData(): void {
    if (!this.order) {
      return;
    }

    let workflowPath = null;
    let workflowVersionId = null;

    if (this.order.workflowId && this.order.workflowId.path) {
      workflowPath = this.order.workflowId.path;
      workflowVersionId = this.order.workflowId.versionId;
    }
    else if (this.order.workflow) {
      workflowPath = this.order.workflow;
    }

    if (!workflowPath) {
      this.estimateWithoutHistory();
      return;
    }

    const obj = {
      controllerId: this.controllerId,
      compact: false,
      workflowIds: [{
        path: workflowPath,
        versionId: workflowVersionId
      }],
      limit: 10,
      historyStates: ['SUCCESSFUL']
    };

    this.coreService.post('orders/history', obj).subscribe({
      next: (res: any) => {
        if (res.history && res.history.length > 0) {
          const filteredHistory = res.history.filter(item => item.workflow === workflowPath);

          this.historyData = filteredHistory;

          if (filteredHistory.length > 0) {
            this.calculateEstimatedTime();
            this.updateProgress();
          } else {
            this.estimateWithoutHistory();
          }
        } else {
          this.estimateWithoutHistory();
        }
      },
      error: () => {
        this.estimateWithoutHistory();
      }
    });
  }

  private calculateEstimatedTime(): void {
    if (this.expectedTime > 0) {
      this.estimatedTime = this.expectedTime;
    }

    if (this.historyData.length > 0) {
      let totalDuration = 0;
      let count = 0;
      this.maxHistoricalTime = 0;

      this.historyData.forEach(item => {
        if (item.startTime && item.endTime) {
          const duration = new Date(item.endTime).getTime() - new Date(item.startTime).getTime();
          totalDuration += duration;
          count++;
          if (duration > this.maxHistoricalTime) {
            this.maxHistoricalTime = duration;
          }
        }
      });

      if (count > 0 && this.estimatedTime === 0) {
        this.estimatedTime = totalDuration / count;
      }
    }
  }

  private estimateWithoutHistory(): void {
    if (this.expectedTime > 0) {
      this.estimatedTime = this.expectedTime;
    } else {
      this.estimatedTime = 0;
    }
    this.updateProgress();
  }

  private updateProgress(): void {
    if (!this.order || !this.isRunning) {
      return;
    }

    const now = new Date().getTime();
    let startTime: number;

    if (this.order.startTime) {
      startTime = new Date(this.order.startTime).getTime();
    } else if (this.order.scheduledFor) {
      startTime = new Date(this.order.scheduledFor).getTime();
    } else {
      startTime = now;
    }

    this.timeElapsed = now - startTime;

    if (this.estimatedTime > 0) {
      this.progress = (this.timeElapsed / this.estimatedTime) * 100;
      this.timeRemaining = Math.max(this.estimatedTime - this.timeElapsed, 0);

      if (this.timeElapsed > this.estimatedTime) {
        this.isOverdue = true;

        if (this.maxHistoricalTime > this.estimatedTime) {
          if (this.timeElapsed <= this.maxHistoricalTime) {
            const overtimeRange = this.maxHistoricalTime - this.estimatedTime;
            const overtimeElapsed = this.timeElapsed - this.estimatedTime;
            const overtimeProgress = (overtimeElapsed / overtimeRange);
            this.progress = 100 - (overtimeProgress * 5);
          } else {
            const beyondMax = this.timeElapsed - this.maxHistoricalTime;
            const additionalProgress = Math.min((beyondMax / this.maxHistoricalTime) * 3, 3);
            this.progress = 95 - additionalProgress;
            this.progress = Math.max(this.progress, 92);
          }
        } else {
          const overtimeRatio = (this.timeElapsed - this.estimatedTime) / this.estimatedTime;
          if (overtimeRatio < 0.5) {
            this.progress = 100 - (overtimeRatio * 10);
          } else {
            this.progress = 92;
          }
        }

        this.progress = Math.max(this.progress, 92);
      } else {
        this.progress = Math.min(this.progress, 100);
      }
    } else {
      this.progress = 0;
    }
  }

  formatTime(milliseconds: number): string {
    if (!milliseconds || milliseconds < 0) {
      return '0s';
    }

    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  getProgressBarClass(): string {
    if (!this.isRunning) {
      return '';
    }
    if (this.isOverdue) {
      return 'progress-bar-warning';
    }
    return 'progress-bar-success';
  }

  getProgressBarStyle(): any {
    if (this.estimatedTime === 0) {
      // Indeterminate progress
      return {
        width: '100%',
        animation: 'indeterminate 2s linear infinite'
      };
    }
    return {
      width: this.progress + '%'
    };
  }
}

