import {Component, OnInit} from '@angular/core';
import {CoreService} from 'src/app/services/core.service';
import {OrderPipe, SearchPipe} from 'src/app/pipes/core.pipe';
import {DataService} from '../data.service';

@Component({
  selector: 'app-blocklist',
  templateUrl: './blocklist.component.html'
})
export class BlocklistComponent implements OnInit {
  isLoaded = false;
  loginHistory = [];
  data = [];
  searchableProperties = ['accountName', 'loginDate']
  preferences: any;
  filter: any = {
    sortBy: 'accountName',
    reverse: false,
    searchText: '',
    entryPerPage: 25,
    currentPage: 1
  };
  object = {
    mapOfCheckedId: new Set(),
    checked: false,
    indeterminate: false
  };

  constructor(private coreService: CoreService, private orderPipe: OrderPipe,
              private searchPipe: SearchPipe, private dataService: DataService) {
  }

  ngOnInit(): void {
    this.preferences = sessionStorage.preferences ? JSON.parse(sessionStorage.preferences) : {};
    if (this.preferences.entryPerPage) {
      this.filter.entryPerPage = this.preferences.entryPerPage;
    }
    this.loadLoginHistory();
  }

  loadLoginHistory(): void {
    let obj: any = {};
    this.coreService.post('audit_log/login_history', obj).subscribe({
      next: (res: any) => {
        this.loginHistory = res.loginHistoryItems;
        this.isLoaded = true;
        this.searchInResult();
      }, error: () => {
        this.data = [];
        this.isLoaded = true
      }
    });
  }

  pageIndexChange($event): void {
    this.filter.currentPage = $event;
    if (this.object.mapOfCheckedId.size !== this.loginHistory.length) {
      if (this.object.checked) {
        this.checkAll(true);
      } else {
        this.reset();
      }
    }
  }

  pageSizeChange($event): void {
    this.filter.entryPerPage = $event;
    if (this.object.checked) {
      this.checkAll(true);
    }
  }

  searchInResult(): void {
    this.data = this.filter.searchText ? this.searchPipe.transform(this.loginHistory, this.filter.searchText, this.searchableProperties) : this.loginHistory;
    this.data = this.orderPipe.transform(this.data, this.filter.sortBy, this.filter.reverse);
    this.data = [...this.data];
  }

  sort(propertyName): void {
    this.filter.reverse = !this.filter.reverse;
    this.filter.sortBy = propertyName;
    this.data = this.orderPipe.transform(this.data, this.filter.sortBy, this.filter.reverse);
    this.reset();
  }

  private getCurrentData(list, filter): Array<any> {
    const entryPerPage = filter.entryPerPage || this.preferences.entryPerPage;
    return list.slice((entryPerPage * (filter.currentPage - 1)), (entryPerPage * filter.currentPage));
  }

  reset(): void {
    this.object = {
      mapOfCheckedId: new Set(),
      indeterminate: false,
      checked: false
    };
  }

  checkAll(value: boolean): void {
    if (value && this.loginHistory.length > 0) {
      //const users = this.getCurrentData(this.data, this.filter);
      this.data.forEach(item => {
        this.object.mapOfCheckedId.add(item.accountName);
      });
    } else {
      this.object.mapOfCheckedId.clear();
    }
    this.checkCheckBoxState();
  }

  onItemChecked(account, checked: boolean): void {
    if (!checked && this.object.mapOfCheckedId.size > (this.filter.entryPerPage || this.preferences.entryPerPage)) {
      const users = this.getCurrentData(this.data, this.filter);
      if (users.length < this.data.length) {
        this.object.mapOfCheckedId.clear();
        users.forEach(item => {
          this.object.mapOfCheckedId.add(item.accountName);
        });
      }
    }
    if (checked) {
      this.object.mapOfCheckedId.add(account.accountName);
    } else {
      this.object.mapOfCheckedId.delete(account.accountName);
    }
    const users = this.getCurrentData(this.data, this.filter);
    this.object.checked = this.object.mapOfCheckedId.size === users.length;
    this.checkCheckBoxState();
  }

  checkCheckBoxState(): void {
    this.object.indeterminate = this.object.mapOfCheckedId.size > 0 && !this.object.checked;
    if (this.object.mapOfCheckedId.size > 0) {
      this.dataService.announceFunction('IS_ACCOUNT_PROFILES_TRUE');
    } else {
      this.dataService.announceFunction('IS_ACCOUNT_PROFILES_FALSE');
    }
  }

  addToBlocklist(account): void {

  }

  removeFromBlocklist(account): void {

  }
}
