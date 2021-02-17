import {Component, OnInit, Input, Output, EventEmitter,
  HostListener, OnChanges, SimpleChanges} from '@angular/core';
import {CoreService} from '../../services/core.service';

declare const $;

@Component({
  selector: 'app-tree-nagivation',
  templateUrl: './tree.component.html'
})
export class TreeComponent implements OnInit, OnChanges {
  preferences: any;
  @Input() tree;
  @Input() sideView;
  @Input() defaultExpandedKeys;
  @Input() defaultSelectedKeys;
  @Output() messageEvent = new EventEmitter<string>();

  constructor(public coreService: CoreService) {
  }

  static calcTop() {
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
        if (top < 155 && top > 140) {
          top = 155;
        }
        $('.sticky').css('top', top + 2);
        const ht = window.innerHeight - top;
        if (ht > 400) {
          $('.tree-block').height((ht - 20 + $(window).scrollTop()) + 'px');
        }
        if (count < 5) {
          if (top < 139 && top > 92) {
            setTimeout(() => {
              recursiveCheck();
            }, 5);
          } else {
            let intval = setInterval(() => {
              recursiveCheck();
              clearInterval(intval);
            }, 100);
          }
        }
      };
      recursiveCheck();
    }
  }

  ngOnInit() {
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences) || {};
    }
    if (this.sideView && !this.sideView.show) {
      this.hidePanel();
    }
    TreeComponent.calcTop();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.defaultExpandedKeys = [...this.defaultExpandedKeys];
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    TreeComponent.calcTop();
  }

  @HostListener('window:scroll', ['$event'])
  onScroll() {
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
    this.defaultExpandedKeys = [...this.defaultExpandedKeys];
  }

  expandNode(node): void {
    this.defaultSelectedKeys = [];
    this.navFullTree(node, true);
    this.defaultExpandedKeys = [...this.defaultExpandedKeys];
    this.messageEvent.emit(node);
  }

  collapseNode(node): void {
    this.navFullTree(node, false);
    this.defaultExpandedKeys = [...this.defaultExpandedKeys];
  }

  selectNode(e): void {
    if (this.preferences.expandOption === 'both') {
      e.isExpanded = !e.isExpanded;
    }
    this.defaultSelectedKeys = [e.origin.key];
    e.origin.action = 'NODE';
    this.messageEvent.emit(e.origin);
  }

  private traverseTree(data, isExpand) {
    data.children.forEach((value) => {
      if (isExpand) {
        if (this.defaultExpandedKeys.indexOf(value.key) === -1) {
          this.defaultExpandedKeys.push(value.key);
        }
        this.defaultSelectedKeys.push(value.key);
      } else {
        this.defaultExpandedKeys.splice(this.defaultExpandedKeys.indexOf(value.key), 1);
      }
      this.traverseTree(value, isExpand);
    });
  }

  private navFullTree(node, isExpand) {
    if (isExpand) {
      if (this.defaultExpandedKeys.indexOf(node.key) === -1) {
        this.defaultExpandedKeys.push(node.key);
      }
      this.defaultSelectedKeys.push(node.key);
    } else {
      this.defaultExpandedKeys.splice(this.defaultExpandedKeys.indexOf(node.key), 1);
    }
    this.traverseTree(node, isExpand);
  }

  hidePanel  () {
    this.sideView.show = false;
    this.coreService.hidePanel();
  }

  showPanel  () {
    this.sideView.show = true;
    this.coreService.showLeftPanel();
  }
}
