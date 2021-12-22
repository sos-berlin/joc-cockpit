import {Injectable, OnDestroy} from '@angular/core';
import {Subject} from 'rxjs';

@Injectable()
export class DataService implements OnDestroy {

  preferences = {
    roles: new Set()
  };
  copiedObject: any = {
    accounts: new Map(),
    roles: new Map()
  };

  // Observable string sources
  private dataAnnouncedSource = new Subject<any>();
  private searchKeySource = new Subject<string>();
  private functionSource = new Subject<string>();

  dataAnnounced$ = this.dataAnnouncedSource.asObservable();
  searchKeyAnnounced$ = this.searchKeySource.asObservable();
  functionAnnounced$ = this.functionSource.asObservable();

  announceData(data: any): void {
    this.dataAnnouncedSource.next(data);
  }

  announceSearchKey(searchKey: string): void {
    this.searchKeySource.next(searchKey);
  }

  announceFunction(data: string): void {
    this.functionSource.next(data);
  }

  ngOnDestroy(): void {
    this.dataAnnouncedSource.complete();
    this.searchKeySource.complete();
    this.functionSource.complete();
  }
}

