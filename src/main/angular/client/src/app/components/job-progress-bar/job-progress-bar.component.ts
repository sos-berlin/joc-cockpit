import {ChangeDetectionStrategy, Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges, ChangeDetectorRef, DoCheck} from '@angular/core';
import {CoreService} from '../../services/core.service';
import {interval, Subscription} from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-job-progress-bar',
  templateUrl: './job-progress-bar.component.html',
  styleUrls: ['./job-progress-bar.component.css'],
  
})
export class JobProgressBarComponent implements OnInit, OnDestroy, OnChanges, DoCheck {
  private _job: any;
  private _lastJobState: string;
  private _lastJobId: string;

  @Input()
  set job(value: any) {
    this._job = value;
  }

  get job(): any {
    return this._job;
  }

  @Input() workflowPath: string;
  @Input() controllerId: any;
  @Input() showDetails: boolean = true;

  progress: number = 0;
  timeElapsed: number = 0;
  estimatedTime: number = 0;
  expectedTime: number = 0;
  timeRemaining: number = 0;
  isOverdue: boolean = false;
  isRunning: boolean = false;
  maxHistoricalTime: number = 0;

  private updateSubscription: Subscription;
  private historyData: any[] = [];

  constructor(private coreService: CoreService, private cdr: ChangeDetectorRef) {}

  ngDoCheck(): void {
    // Check if job state changed without reference change (event updates)
    if (this.job && this.job.state) {
      const currentState = this.job.state._text;
      const currentJobId = this.job.taskId || this.job.job + this.job.startTime;

      // If state changed for same job or job changed
      if (this._lastJobState !== currentState || this._lastJobId !== currentJobId) {
        this._lastJobState = currentState;
        this._lastJobId = currentJobId;

        const previousRunning = this.isRunning;
        this.checkJobState();

        // Handle state transitions
        if (!previousRunning && this.isRunning) {
          this.startProgressTracking();
        } else if (previousRunning && !this.isRunning) {
          this.stopProgressTracking();
          this.resetState();
        }
      }
    }
  }

  ngOnInit(): void {
    if (!this.job) {
      return;
    }

    this.checkJobState();

    if (this.isRunning) {
      this.startProgressTracking();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Handle workflowPath changes
    if (changes['workflowPath'] && !changes['workflowPath'].firstChange && this.isRunning) {
      this.stopProgressTracking();
      this.startProgressTracking();
    }
  }

  private resetState(): void {
    this.progress = 0;
    this.timeElapsed = 0;
    this.estimatedTime = 0;
    this.expectedTime = 0;
    this.timeRemaining = 0;
    this.isOverdue = false;
    this.maxHistoricalTime = 0;
    this.historyData = [];
  }

  ngOnDestroy(): void {
    this.stopProgressTracking();
  }

  private startProgressTracking(): void {
    this.checkExpectedTime();
    this.fetchJobHistoryData();
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
    if (this.job && this.job.expectedExecutionTime) {
      this.expectedTime = this.job.expectedExecutionTime * 1000;
    } else if (this.job && this.job.warnIfLonger) {
      this.expectedTime = this.job.warnIfLonger * 1000;
    }
  }

  private checkJobState(): void {
    let stateText = null;
    const previousRunningState = this.isRunning;

    if (this.job && this.job.state && this.job.state._text) {
      stateText = this.job.state._text.toUpperCase();
    }

    if (stateText) {
      this.isRunning = (stateText === 'RUNNING' || stateText === 'INPROGRESS' || stateText === 'IN_PROGRESS' || stateText === 'INCOMPLETE');
    } else {
      this.isRunning = false;
    }

    // If state changed from running to not running, clean up
    if (previousRunningState && !this.isRunning) {
      this.stopProgressTracking();
      this.resetState();
    }
  }

  private fetchJobHistoryData(): void {
    if (!this.job || !this.job.job) {
      this.estimateWithoutHistory();
      return;
    }

    let workflowPath = this.workflowPath || this.job.workflow;
    let jobName = this.job.job;

    if (!workflowPath || !jobName) {
      this.estimateWithoutHistory();
      return;
    }

    const obj = {
      controllerId: this.controllerId,
      jobs: [{
        workflowPath: workflowPath,
        job: jobName
      }],
      limit: 10,
      historyStates: ['SUCCESSFUL']
    };

    this.coreService.post('tasks/history', obj).subscribe({
      next: (res: any) => {
        if (res.history && res.history.length > 0) {
          const filteredHistory = res.history.filter(item =>
            item.workflow === workflowPath && item.job === jobName
          );

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
    if (!this.job || !this.isRunning) {
      return;
    }

    const now = new Date().getTime();
    let startTime: number;

    if (this.job.startTime) {
      startTime = new Date(this.job.startTime).getTime();
    } else if (this.job.scheduledFor) {
      startTime = new Date(this.job.scheduledFor).getTime();
    } else {
      startTime = now;
    }

    this.timeElapsed = now - startTime;

    // Additional safety check: if job already has an endTime, it's completed
    if (this.job.endTime) {
      this.stopProgressTracking();
      return;
    }

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

    // Mark for check to ensure view updates
    this.cdr.markForCheck();
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

