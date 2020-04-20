import {Injectable} from '@angular/core';
import {Subject, BehaviorSubject } from 'rxjs';

@Injectable()
export class DataService {
  // Observable string sources
  private eventAnnouncedSource = new Subject<any>();
  private refreshUISource = new Subject<any>();
  private switchSchedulerSource = new Subject<any>();
  public isWorkFlowReload: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isCalendarReload: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isProfileReload: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public resetProfileSetting: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private functionSource = new Subject<string>();

  // Observable string streams
  eventAnnounced$ = this.eventAnnouncedSource.asObservable();
  refreshAnnounced$ = this.refreshUISource.asObservable();
  switchSchedulerAnnounced$ = this.switchSchedulerSource.asObservable();
  functionAnnounced$ = this.functionSource.asObservable();

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

  announceFunction(data: string) {
    this.functionSource.next(data);
  }
}

