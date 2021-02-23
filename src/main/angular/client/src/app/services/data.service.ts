import {Injectable, OnDestroy} from '@angular/core';
import {Subject, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService implements OnDestroy{
  // Observable string sources
  private eventAnnouncedSource = new Subject<any>();
  private refreshUISource = new Subject<any>();
  private switchSchedulerSource = new Subject<any>();
  public isCalendarReload: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isProfileReload: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public resetProfileSetting: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public reloadTree: BehaviorSubject<any> = new BehaviorSubject<any>({});
  public reloadWorkflowError: BehaviorSubject<any> = new BehaviorSubject<any>({});
  private functionSource = new Subject<string>();
  private refreshWidgetSource = new Subject<any>();

  // Observable string streams
  eventAnnounced$ = this.eventAnnouncedSource.asObservable();
  refreshAnnounced$ = this.refreshUISource.asObservable();
  refreshWidgetAnnounced$ = this.refreshWidgetSource.asObservable();
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

  refreshWidget(event: any) {
    this.refreshWidgetSource.next(event);
  }

  ngOnDestroy() {
    this.eventAnnouncedSource.complete();
    this.refreshUISource.complete();
    this.switchSchedulerSource.complete();
    this.functionSource.complete();
    this.refreshWidgetSource.complete();
    this.reloadTree.complete();
    this.isCalendarReload.complete();
    this.isProfileReload.complete();
    this.resetProfileSetting.complete();
  }
}

