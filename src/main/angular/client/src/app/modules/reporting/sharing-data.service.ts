import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

@Injectable()
export class SharingDataService {

  // Observable string sources
  private dataAnnouncedSource = new Subject<any>();
  private searchKeySource = new Subject<string>();
  private functionSource = new Subject<Object>();

  dataAnnounced$ = this.dataAnnouncedSource.asObservable();
  searchKeyAnnounced$ = this.searchKeySource.asObservable();
  functionAnnounced$ = this.functionSource.asObservable();

  announceData(data: any): void {
    this.dataAnnouncedSource.next(data);
  }

  announceSearchKey(searchKey: string): void {
    this.searchKeySource.next(searchKey);
  }

  announceFunction(data: any): void {
    this.functionSource.next(data);
  }

  ngOnDestroy(): void {
    this.dataAnnouncedSource.complete();
    this.searchKeySource.complete();
    this.functionSource.complete();
  }
}

