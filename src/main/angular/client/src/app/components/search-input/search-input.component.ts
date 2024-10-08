import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import {NzTreeNode} from 'ng-zorro-antd/tree';
import {NzTreeSelectComponent} from 'ng-zorro-antd/tree-select';
import {debounceTime, Subject} from 'rxjs';
import {CoreService} from '../../services/core.service';

declare const $: any;

@Component({
  selector: 'app-search-input',
  templateUrl: './search-input.component.html'
})
export class SearchInputComponent {
  @Input() type: string;
  @Input() nodes: any = [];
  @Input() list: any = []
  @Input() pathAttribute: string;
  @Input() isDisplay: boolean;
  @Input() addFolderPossible: boolean;
  @Input() isPath: boolean;
  @Input() folders: any = {};
  @Input() changeDetect: boolean;
  @Input() controllerId: string;

  _tree = [];
  obj = {
    name: '',
    token: ''
  };

  @Output() onSelect = new EventEmitter<string>();
  @Output() onBlur = new EventEmitter<string>();
  @Output() onChange = new EventEmitter<boolean>();
  selectedValue: any;
  @ViewChild('changeFocusInput') changeFocusInput!: ElementRef<HTMLInputElement>;
  @ViewChild(NzTreeSelectComponent, {static: false}) treeSelectComponent: NzTreeSelectComponent;

  private searchTerm = new Subject<string>();

  constructor(public coreService: CoreService, private el: ElementRef,
              private ref: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    const dom2 = $(this.el.nativeElement).find('.ant-select');
    this._tree = [...this.nodes];
    setTimeout(() => {
      dom2?.click();
    }, this.changeDetect ? 10 : 0);
    setTimeout(() => {
      this.openDropdown();
    }, 20)
    //200ms Delay in search
    this.searchTerm.pipe(debounceTime(200))
      .subscribe((searchValue: string) => {
        this.searchObjects(searchValue);
      });
  }

  openFolder(node: NzTreeNode): void {
    if (node instanceof NzTreeNode) {
      node.isExpanded = !node.isExpanded;
      if (node.isExpanded && !node.origin['type']) {
        this.loadData(node, null);
      }
    }
  }

  loadData(node, $event, isExpand = false): void {
    if(this.type == 'TAG'){
      this.onSelect.emit(node.origin.name);
      return;
    }
    if (!node || !node.origin) {
      return;
    }
    if (!node.origin.type && !node.origin.objectType) {
      if ($event) {
        node.isExpanded = !node.isExpanded;
        $event.stopPropagation();
      } else if (isExpand) {
        node.isExpanded = true;
      }
      let flag = true;
      if (node.origin.children && node.origin.children.length > 0 && node.origin.children[0].type) {
        flag = false;
      }
      if (node && (node.isExpanded || node.origin.isLeaf) && flag) {
        this.loadFolders(node.origin, node.key);
      }
    } else {
      this.onSelect.emit(this.isPath ? node.origin.path : node.origin.name);
    }
  }

  private loadFolders(origin, key): void {
    origin.loading = true;
    this.coreService.post('inventory/read/folder', {
      path: key,
      objectTypes: [this.type]
    }).subscribe({
      next: (res: any) => {
        let data = this.type == 'NOTICEBOARD' ? res.noticeBoards : this.type == 'LOCK' ? res.locks : this.type === 'JOBRESOURCE' ? res.jobResources :
          this.type === 'WORKFLOW' ? res.workflows : this.type === 'SCHEDULE' ? res.schedules : this.type === 'WORKINGDAYSCALENDAR' ? res.calendars : res.includeScripts;
        for (let i = 0; i < data.length; i++) {
          const _path = key + (key === '/' ? '' : '/') + data[i].name;
          data[i].title = this.isPath ? _path : data[i].name;
          data[i].path = _path;
          data[i].key = this.isPath ? _path : data[i].name;
          data[i].type = this.type;
          data[i].isLeaf = true;
        }

        if (origin.children && origin.children.length > 0) {
          data = data.concat(origin.children);
        }
        if (origin.isLeaf) {
          origin.expanded = true;
        }
        origin.loading = false;
        origin.isLeaf = false;
        origin.children = data;
        this.nodes = [...this.nodes];
        if (this.changeDetect) {
          this.ref.detectChanges();
        }
      }, error: () => origin.loading = false
    });
  }

  onExpand(e): void {
    this.loadData(e.node, null);
  }

  addFolder(path): void {
    if (this.folders[this.pathAttribute].indexOf(path) === -1) {
      this.folders[this.pathAttribute].push(path);
    }
  }

  remove(path, flag = false): void {
    if (flag) {
      this.folders[this.pathAttribute].splice(this.folders[this.pathAttribute].indexOf(path), 1);
    } else {
      this.folders[this.pathAttribute].splice(this.folders[this.pathAttribute].indexOf(path), 1);
    }
  }

  onSearchInput(searchValue: string) {
    this.searchTerm.next(searchValue);
  }

  private searchObjects(value: string) {
    if (value !== '') {
      const searchValueWithoutSpecialChars = value.replace(/[^\w\s]/gi, '');
      if (searchValueWithoutSpecialChars.length >= 2) {
        const request: any = {
          search: value,
          returnTypes: [this.type]
        };
        if (this.obj.token) {
          request.token = this.obj.token;
        }
        if(this.type == 'TAG'){
         delete request.returnTypes;
         request.controllerId = this.controllerId;
        }
        this.coreService.post(this.type == 'TAG' ? 'workflows/tag/search' : 'inventory/quick/search', request).subscribe({
          next: (res: any) => {
            this.obj.token = res.token;
            this.nodes = res.results.map(function (item) {
              return {...item, key: item.name, title: item.name};
            });
            if (this.changeDetect) {
              this.ref.detectChanges();
            }
          }
        });
      } else {
        this.nodes = this._tree;
        if (this.changeDetect) {
          this.ref.detectChanges();
        }
      }
    } else {
      this.nodes = this._tree;
      if (this.changeDetect) {
        this.ref.detectChanges();
      }
    }
  }

  openDropdown(): void {
    setTimeout(() => {
      this.changeFocusInput.nativeElement.focus();
    }, 0);
  }

  closeDropdown(): void {
    this.onBlur.emit(this.obj.name);
  }

  onDropdownOpenChange(isOpen: boolean): void {
    if (!isOpen) {
      Promise.resolve().then(() => {
        this.treeSelectComponent.openDropdown();
      });
    }
  }

  handleSelectionChange(value: any): void {
    this.selectedValue = value;
    this.onChange.emit(!!value);
  }
}
