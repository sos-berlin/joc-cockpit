import {Component, OnInit, Input, ViewChild, Output, EventEmitter, HostListener} from '@angular/core';
import {CoreService} from '../../services/core.service';
import {NzFormatEmitEvent, NzTreeNode} from 'ng-zorro-antd';

declare const $;

@Component({
  selector: 'app-tree-nagivation',
  templateUrl: './tree.component.html'
})
export class TreeComponent implements OnInit {
  preferences: any;
  @Input() tree;
  @Output() messageEvent = new EventEmitter<string>();
  isExpandAll = false;

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
        if (top < 152 && top > 140) {
          top = 151;
        }
        $('.sticky').css('top', top);
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
    TreeComponent.calcTop();
  }

  openFolder(data: NzTreeNode | NzFormatEmitEvent): void {
    if (data instanceof NzTreeNode) {
      data.isExpanded = !data.isExpanded;
    } else {
      const node = data.node;
      if (node) {
        node.isExpanded = !node.isExpanded;
      }
    }
  }

  expandAll(): void {
    this.isExpandAll = true;
  }

  collapseAll(): void {
    this.isExpandAll = false;
  }

  expandNode(node): void {
    this.navFullTree();
    node.action = 'ALL';
    this.messageEvent.emit(node);
  }

  collapseNode(node): void {

  }

  selectNode(e): void {
    this.navFullTree();
    if (this.preferences.expandOption === 'both') {

    }
    e.origin.action = 'NODE';
    this.messageEvent.emit(e.origin);
  }


  @HostListener('window:resize', ['$event'])
  onResize() {
    TreeComponent.calcTop();
  }

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    TreeComponent.calcTop();
  }

  private traverseTree(data) {
    data.children.forEach((value) => {
      value.isSelected = false;
      this.traverseTree(value);
    });
  }

  private navFullTree() {
    this.tree.forEach((value) => {
      value.isSelected = false;
      this.traverseTree(value);
    });
  }
}
