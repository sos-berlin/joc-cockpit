import {
  Component, Input, Output, EventEmitter,
  HostListener, SimpleChanges
} from '@angular/core';
import {CoreService} from '../../services/core.service';
import {Subject} from "rxjs";
import {debounceTime} from "rxjs/operators";

declare const $: any;

@Component({
  selector: 'app-tree-navigation',
  templateUrl: './tree.component.html'
})
export class TreeComponent {
  preferences: any;
  @Input() tree;
  @Input() sideView;
  @Input() type: string;
  @Input() schedulerId: string;
  @Input() defaultExpandedKeys;
  @Input() defaultSelectedKeys;
  @Input() isAction: boolean;
  @Output() messageEvent = new EventEmitter<string>();
  @Output() actionEvent = new EventEmitter<any>();
  @Output() selectObjectEvent = new EventEmitter<any>();

  allObjects = [];
  searchNode = {
    loading: false,
    token: '',
    text: ''
  }

  private searchTerm = new Subject<string>();

  constructor(public coreService: CoreService) {
  }

  static calcTop(): void {
    const dom = $('.scroll-y');
    let count = 0;
    if (dom && dom.position()) {
      const recursiveCheck = () => {
        ++count;
        let top = dom.position().top + 12;
        top = top - $(window).scrollTop();
        if (top < 70) {
          top = 92;
        }
        if (top < 150 && top > 140) {
          top = 150;
        }
        $('.sticky').css('top', top);
        const ht = window.innerHeight - top;
        if (count < 5) {
          if (top < 139 && top > 92) {
            setTimeout(() => {
              recursiveCheck();
            }, 10);
          } else {
            setTimeout(() => {
              recursiveCheck();
            }, 100);
          }
          return;
        }
        if (ht > 400) {
          if(document.getElementsByClassName('workflow')?.length > 0){
            top += 50;
          }
          $('.tree-block').height('calc(100vh - ' + (top + 24) + 'px' + ')');
        }
      };
      recursiveCheck();
    }
  }

  ngOnInit(): void {
    if (sessionStorage['preferences']) {
      this.preferences = JSON.parse(sessionStorage['preferences']) || {};
    }
    if (this.sideView && !this.sideView.show) {
      this.hidePanel();
    }

    //200ms Delay in search
    this.searchTerm.pipe(debounceTime(200))
      .subscribe((searchValue: string) => {
        this.searchObjects(searchValue);
      });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      TreeComponent.calcTop();
    }, 10);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.defaultExpandedKeys = [...this.defaultExpandedKeys];
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    TreeComponent.calcTop();
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(): void {
    TreeComponent.calcTop();
  }

  expandChange(data): void {
    this.defaultExpandedKeys = data.keys;
  }

  expandAll(): void {
    this.defaultSelectedKeys = [];
    this.navFullTree(this.tree[0], true);
    this.defaultExpandedKeys = [...this.defaultExpandedKeys];
  }

  collapseAll(): void {
    this.defaultExpandedKeys = [];
    this.navFullTree(this.tree[0], false);
    this.defaultExpandedKeys = [...this.defaultExpandedKeys];
    this.tree = [...this.tree];
  }

  expandNode(node): void {
    this.defaultSelectedKeys = [];
    this.navFullTree(node, true);
    this.defaultExpandedKeys = [...this.defaultExpandedKeys];
    node.action = undefined;
    this.messageEvent.emit(node);
  }

  collapseNode(node): void {
    this.navFullTree(node, false);
    this.defaultExpandedKeys = [...this.defaultExpandedKeys];
    this.tree = [...this.tree];
  }

  deleteFolder(node): void {
    this.actionEvent.emit(node);
  }

  selectNode(e): void {
    if (this.preferences.expandOption === 'both') {
      e.isExpanded = !e.isExpanded;
    }
    this.defaultSelectedKeys = [e.origin.key];
    if (this.preferences.expandOption === 'both' && !e.origin.isLeaf) {
      if (e.isExpanded) {
        if (this.defaultExpandedKeys.indexOf(e.origin.key) === -1) {
          this.defaultExpandedKeys.push(e.origin.key);
        }
      } else {
        this.defaultExpandedKeys.splice(this.defaultExpandedKeys.indexOf(e.origin.key), 1);
      }
    }
    e.origin.action = 'NODE';
    this.messageEvent.emit(e.origin);
  }

  private traverseTree(data, isExpand): void {
    data.children.forEach((value) => {
      if (isExpand) {
        if (this.defaultExpandedKeys.indexOf(value.key) === -1) {
          this.defaultExpandedKeys.push(value.key);
        }
        this.defaultSelectedKeys.push(value.key);
      } else {
        value.expanded = isExpand;
        this.defaultExpandedKeys.splice(this.defaultExpandedKeys.indexOf(value.key), 1);
      }
      this.traverseTree(value, isExpand);
    });
  }

  private navFullTree(node, isExpand): void {
    if (isExpand) {
      if (this.defaultExpandedKeys.indexOf(node.key) === -1) {
        this.defaultExpandedKeys.push(node.key);
      }
      this.defaultSelectedKeys.push(node.key);
    } else {
      node.expanded = false;
      this.defaultExpandedKeys.splice(this.defaultExpandedKeys.indexOf(node.key), 1);
    }
    this.traverseTree(node, isExpand);
  }

  hidePanel(): void {
    this.sideView.show = false;
    this.coreService.hidePanel();
  }

  showPanel(): void {
    this.sideView.show = true;
    this.coreService.showLeftPanel();
  }

  objectTreeSearch() {
    $('#objectTreeSearch').focus();
    if (this.type == 'WORKFLOW') {
      $('.editor-tree  a').addClass('hide-on-focus');
    } else {
      $('.resource  a').addClass('hide-on-focus');
    }
  }

  clearSearchInput(): void {
    this.allObjects = [];
    this.searchNode.text = '';
    if (this.type == 'WORKFLOW') {
      $('.editor-tree  a').removeClass('hide-on-focus');
    } else {
      $('.resource  a').removeClass('hide-on-focus');
    }
  }

  onSearchInput(searchValue: string) {
    this.searchTerm.next(searchValue);
  }

  private searchObjects(value: string) {
    if (value !== '') {
      const searchValueWithoutSpecialChars = value.replace(/[^\w\s]/gi, '');
      if (searchValueWithoutSpecialChars.length >= 2) {
        this.searchNode.loading = true;
        let request: any = {
          search: value,
          controllerId: this.schedulerId
        };
        if (this.searchNode.token) {
          request.token = this.searchNode.token;
        }
        this.coreService.post((this.type == 'WORKFLOW' ? 'workflows' : this.type == 'NOTICEBOARD' ? 'notice/boards' :
          this.type == 'DOCUMENTATION' ? 'documentations' : this.type == 'LOCK' ? 'locks' :
            this.type == 'CALENDAR' ? 'calendars' : 'inventory') + '/quick/search', request).subscribe({
          next: (res: any) => {
            this.allObjects = res.results;
            this.searchNode.token = res.token;
            this.searchNode.loading = false;
          }, error: () => this.searchNode.loading = true
        });
      }
    } else {
      this.allObjects = [];
    }
  }

  selectObject(item): void {
    this.selectObjectEvent.emit(item);
    setTimeout(() => {
      this.allObjects = [];
      this.searchNode.text = '';
      $('#objectTreeSearch').blur();
    }, 0);
  }
}
