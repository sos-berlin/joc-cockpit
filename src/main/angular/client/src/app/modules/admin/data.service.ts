import {Injectable, OnDestroy} from '@angular/core';
import {Subject} from 'rxjs';

@Injectable()
export class DataService implements OnDestroy{
  // Observable string sources
  private dataAnnouncedSource = new Subject<any>();
  private searchKeySource = new Subject<string>();
  private functionSource = new Subject<string>();

  dataAnnounced$ = this.dataAnnouncedSource.asObservable();
  searchKeyAnnounced$ = this.searchKeySource.asObservable();
  functionAnnounced$ = this.functionSource.asObservable();

  announceData(data: any) {
    this.dataAnnouncedSource.next(data);
  }

  announceSearchKey(searchKey: string) {
    this.searchKeySource.next(searchKey);
  }

  announceFunction(data: string) {
    this.functionSource.next(data);
  }

  ngOnDestroy() {
    this.dataAnnouncedSource.complete();
    this.searchKeySource.complete();
    this.functionSource.complete();
  }
}

