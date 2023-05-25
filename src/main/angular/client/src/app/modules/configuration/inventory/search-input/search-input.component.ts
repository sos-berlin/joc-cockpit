import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import {NzTreeNode} from 'ng-zorro-antd/tree';
import {debounceTime, Subject} from 'rxjs';
import {CoreService} from 'src/app/services/core.service';

declare const $: any;

@Component({
  selector: 'app-search-input',
  templateUrl: './search-input.component.html'
})
export class SearchInputComponent implements OnInit {
  @Input() type: string;
  @Input() nodes: any = [];
  @Input() changeDetect: boolean;

  obj = {
    name: '',
    token: ''
  };

  @Output() onSelect = new EventEmitter<string>();
  @Output() onBlur = new EventEmitter<string>();

  private searchTerm = new Subject<string>();

  constructor(public coreService: CoreService, private el: ElementRef, private ref: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    const self = this;
    const dom2 = $(this.el.nativeElement).find('.ant-select');
    const _tree = [...self.nodes];
    setTimeout(() => {
      dom2?.click();
    }, this.changeDetect ? 5 : 0);
    $(this.el.nativeElement).find('input').on('keyup', (evt) => {
      if (evt.target.value) {
        self.onSearchInput(evt.target.value);
      } else {
        self.nodes = _tree;
        if (this.changeDetect) {
          this.ref.detectChanges();
        }
      }
    });
    $(this.el.nativeElement).find('input').on('blur', () => {
      $(self.el.nativeElement).find('input').off("keyup");
      self.onBlur.emit(self.obj.name);
    });
    //200ms Delay in search
    this.searchTerm.pipe(debounceTime(200))
      .subscribe((searchValue: string) => {
        this.searchObjects(searchValue);
      });
  }

  openFolder(node: NzTreeNode): void {
    if (node instanceof NzTreeNode) {
      node.isExpanded = !node.isExpanded;
      if (node.isExpanded && !node.origin.type) {
        this.loadData(node, null);
      }
    }
  }

  loadData(node, $event, isExpand = false): void {
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
        this.loadNotices(node.origin, node.key);
      }
    } else {
      this.onSelect.emit(node.origin.name);
    }
  }

  onExpand(e): void {
    this.loadData(e.node, null);
  }

  private loadNotices(origin, key): void {
    origin.loading = true;
    this.coreService.post('inventory/read/folder', {
      path: key,
      objectTypes: [this.type]
    }).subscribe({
      next: (res: any) => {
        let data = this.type == 'NOTICEBOARD' ? res.noticeBoards : res.includeScripts;
        for (let i = 0; i < data.length; i++) {
          const _path = key + (key === '/' ? '' : '/') + data[i].name;
          data[i].title = data[i].name;
          data[i].path = _path;
          data[i].key = data[i].name;
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
        this.coreService.post('inventory/quick/search', request).subscribe({
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
      }
    }
  }


}
