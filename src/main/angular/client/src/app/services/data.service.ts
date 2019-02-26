import {Injectable} from '@angular/core';
import {Subject, BehaviorSubject } from 'rxjs';

@Injectable()
export class DataService {
  // Observable string sources
  private eventAnnouncedSource = new Subject<any>();
  private refreshUISource = new Subject<any>();
  private switchSchedulerSource = new Subject<any>();
  public isWorkFlowReload: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  // Observable string streams
  eventAnnounced$ = this.eventAnnouncedSource.asObservable();
  refreshAnnounced$ = this.refreshUISource.asObservable();
  switchSchedulerAnnounced$ = this.switchSchedulerSource.asObservable();

  // Service message commands
  announceEvent(event: any) {
    this.eventAnnouncedSource.next(event);
  }

  refreshUI(event: any) {
    this.refreshUISource.next(event);
  }

  switchScheduler(event: any) {
    this.switchSchedulerSource.next(event);
  }
}

