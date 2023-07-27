import {Injectable, OnDestroy} from '@angular/core';
import {Subject, BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService implements OnDestroy {
  // Observable string sources
  private eventAnnouncedSource = new Subject<any>();
  private refreshUISource = new Subject<any>();
  private switchSchedulerSource = new Subject<any>();
  public isCalendarReload: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isProfileReload: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public reloadLicenseCheck: BehaviorSubject<any> = new BehaviorSubject<boolean>(false);
  public isThemeReload: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public resetProfileSetting: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public reloadTree: BehaviorSubject<any> = new BehaviorSubject<any>({});
  public reloadWorkflowError: BehaviorSubject<any> = new BehaviorSubject<any>({});
  public reloadAuthentication: BehaviorSubject<any> = new BehaviorSubject<any>({});
  private functionSource = new Subject<string>();
  private refreshWidgetSource = new Subject<any>();

  // Observable string streams
  eventAnnounced$ = this.eventAnnouncedSource.asObservable();
  refreshAnnounced$ = this.refreshUISource.asObservable();
  refreshWidgetAnnounced$ = this.refreshWidgetSource.asObservable();
  switchSchedulerAnnounced$ = this.switchSchedulerSource.asObservable();
  functionAnnounced$ = this.functionSource.asObservable();

  // Service message commands
  announceEvent(event: any): void {
    this.eventAnnouncedSource.next(event);
  }

  refreshUI(event: any): void {
    this.refreshUISource.next(event);
  }

  switchScheduler(event: any): void {
    this.switchSchedulerSource.next(event);
  }

  announceFunction(data: string): void {
    this.functionSource.next(data);
  }

  refreshWidget(event: any): void {
    this.refreshWidgetSource.next(event);
  }

  ngOnDestroy(): void {
    this.eventAnnouncedSource.unsubscribe();
    this.refreshUISource.unsubscribe();
    this.switchSchedulerSource.unsubscribe();
    this.functionSource.unsubscribe();
    this.refreshWidgetSource.unsubscribe();
    this.reloadLicenseCheck.unsubscribe();
    this.isCalendarReload.unsubscribe();
    this.isProfileReload.unsubscribe();
    this.isThemeReload.unsubscribe();
    this.resetProfileSetting.unsubscribe();
  }
}

