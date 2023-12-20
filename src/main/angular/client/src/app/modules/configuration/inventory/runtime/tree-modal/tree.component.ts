import {Component, inject} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef} from 'ng-zorro-antd/modal';
import {sortBy} from 'underscore';
import {debounceTime, Subject} from 'rxjs';
import {CoreService} from '../../../../../services/core.service';

@Component({
  selector: 'app-tree-modal-content',
  templateUrl: './tree.component.html'
})
export class TreeModalComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  schedulerId = '';
  preferences: any = {};
  objects: any = [];

  type = '';
  object: string;

  nodes: any = [];
  tree: any = [];
  isExpandAll = false;
  loading = false;
  isSubmitted = false;
  calendar: any;
  objectList: any = [];
  obj = {
    loading: false,
    searchText: '',
    name: '',
    token: ''
  };

  private searchTerm = new Subject<string>();

  constructor(public activeModal: NzModalRef, private coreService: CoreService) {
  }

  ngOnInit(): void {
    this.schedulerId = this.modalData.schedulerId;
    this.preferences = this.modalData.preferences;
    this.type = this.modalData.type;
    this.object = this.modalData.object;
    this.calendar = this.modalData.calendar;
    this.init();
    this.searchTerm.pipe(debounceTime(200))
      .subscribe((searchValue: string) => {
        this.searchObjects(searchValue);
      });
  }

  init(): void {
    this.coreService.post('tree', {
      controllerId: this.schedulerId,
      onlyValidObjects: true,
      forInventory: true,
      types: this.type ? [this.type] : undefined
    }).subscribe({
      next: (res) => {
        this.tree = this.coreService.prepareTree(res, true);
        if (this.tree.length > 0) {
          this.tree[0].expanded = true;
          this.selectNode(this.tree[0]);
        }
        this.loading = true;
      }, error: () => {
        this.loading = true;
      }
    });

  }

  clearSearchInput(): void {
    this.objectList = [];
    this.obj.searchText = '';
  }

  onSearchInput(searchValue: string) {
    this.searchTerm.next(searchValue);
  }

  selectObject(name): void {
    this.activeModal.close([{calendarName: name, periods: []}]);
  }

  selectNode(e): void {
    const data = e.origin || e;
    if (this.preferences.expandOption === 'both') {
      e.isExpanded = !e.isExpanded;
    }
    if (this.object) {
      if (this.object === 'Calendar') {
        const obj: any = {
          path: e.key,
          objectTypes: [this.type]
        };
        this.coreService.post('inventory/read/folder', obj).subscribe((res: any) => {
          data.calendars = res.calendars;
          data.calendars = sortBy(data.calendars, 'name');
          for (const i in data.calendars) {
            if (data.calendars[i]) {
              data.calendars[i].path = e.key + (e.key === '/' ? '' : '/') + data.calendars[i].name;
            }
          }
        });
      }
    } else {
      this.activeModal.close(data.path);
    }
  }

  expandAll(): void {
    this.isExpandAll = true;
  }

  collapseAll(): void {
    this.isExpandAll = false;
  }

  private getJSObject(): void {
    const self = this;

    function recursive(nodes): void {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].calendars) {
          for (let j = 0; j < nodes[i].calendars.length; j++) {
            if (nodes[i].calendars[j].isChecked) {
              self.objects.push({calendarName: nodes[i].calendars[j].name, periods: []});
            }
          }
        }
        recursive(nodes[i].children);
      }
    }

    recursive(this.tree);
  }

  submit(): void {
    this.isSubmitted = true;
    this.getJSObject();
    this.activeModal.close(this.objects);
  }

  private searchObjects(value: string) {
    if (value !== '') {
      const searchValueWithoutSpecialChars = value.replace(/[^\w\s]/gi, '');
      if (searchValueWithoutSpecialChars.length >= 2) {
        const request: any = {
          search: value,
          returnTypes: ["CALENDAR"]
        };
        if (this.obj.token) {
          request.token = this.obj.token;
        }
        this.coreService.post('inventory/quick/search', request).subscribe({
          next: (res: any) => {
            this.obj.token = res.token;
            this.objectList = res.results;
          }
        });
      }
    }
  }
}
