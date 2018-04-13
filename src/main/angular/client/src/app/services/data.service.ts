
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class DataService {
    // Observable string sources
    private eventAnnouncedSource = new Subject<any>();
    private refreshUISource = new Subject<any>();

    // Observable string streams
    eventAnnounced$ = this.eventAnnouncedSource.asObservable();
    refreshAnnounced$ = this.refreshUISource.asObservable();

    // Service message commands
    announceEvent(event:any) {
        this.eventAnnouncedSource.next(event);
    }
    refreshUI(event:any) {
        this.refreshUISource.next(event);
    }

}

