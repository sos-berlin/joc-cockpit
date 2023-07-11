import {ChangeDetectorRef, Component, inject,} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef} from 'ng-zorro-antd/modal';
import {sortBy} from 'underscore';
import {CoreService} from '../../services/core.service';
import {debounceTime, Subject} from 'rxjs';

@Component({
  selector: 'app-tree-modal-content',
  templateUrl: './tree.component.html'
})
export class TreeModalComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  schedulerId;
  paths: any = [];
  objects: any = [];
  showCheckBox = false;
  type = '';
  object: string;
  changeDetect = false;
  nodes: any = [];
  tree: any = [];
  isExpandAll = false;
  loading = false;
  isSubmitted = false;
  originalTree: any = [];
  obj = {
    name: '',
    token: ''
  };

  private searchTerm = new Subject<string>();

  constructor(public activeModal: NzModalRef, private coreService: CoreService, private ref: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.schedulerId = this.modalData.schedulerId;
    this.paths = this.modalData.paths || [];
    this.objects = this.modalData.objects || [];
    this.showCheckBox = this.modalData.showCheckBox;
    this.type = this.modalData.type;
    this.object = this.modalData.object;
    this.changeDetect = this.modalData.changeDetect;
    this.nodes = this.modalData.nodes || [];
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
        this.originalTree = [...this.tree];
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

  handleCheckbox(object): void {
    this.onNodeChecked(object);
  }

  selectNode(e): void {
    const data = e.origin || e;
    if (this.showCheckBox) {

    } else if (this.object) {
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

  onNodeChecked(e): void {
    if (this.object !== 'Calendar') {
      if (e.isChecked) {
        if (this.paths.indexOf(e.path) === -1) {
          this.paths.push(e.path);
        }
      } else {
        this.paths.splice(this.paths.indexOf(e.path), 1);
      }
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
    if (this.paths && this.paths.length > 0) {
      this.activeModal.close(this.paths);
    } else {
      this.getJSObject();
      this.activeModal.close(this.objects);
    }
  }

  onSearchInput(searchValue: string) {
    if (searchValue.trim() === '') {
      this.tree = [...this.originalTree];
      this.ref.detectChanges();
    } else {
      this.searchTerm.next(searchValue);
    }
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
            this.tree = res.results.map(function (item) {
              return {...item, key: item.name, title: item.name};
            });
            if (this.changeDetect) {
              this.ref.detectChanges();
            }
          }
        });
      }
    } else {
      if (this.changeDetect) {
        this.ref.detectChanges();
      }
    }
  }
}
