import {Component, OnInit, Input, ViewChild, Output, EventEmitter, HostListener} from '@angular/core';
import {CoreService} from '../../services/core.service';

declare const $;

@Component({
  selector: 'app-tree-nagivation',
  templateUrl: './tree.component.html'
})
export class TreeComponent implements OnInit {
  preferences: any;
  @Input() tree;
  @ViewChild('treeCtrl', {static: false}) treeCtrl;

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
    const interval = setInterval(() => {
      if (this.treeCtrl && this.treeCtrl.treeModel) {
        const node = this.treeCtrl.treeModel.getNodeById(1);
        if (node) {
          node.expand();
          TreeComponent.calcTop();
          clearInterval(interval);
        }
      }
    }, 5);
  }

  expandAll(): void {
    this.treeCtrl.treeModel.expandAll();
  }

  collapseAll(): void {
    this.treeCtrl.treeModel.collapseAll();
  }

  expandNode(node): void {
    this.navFullTree();
    const someNode = this.treeCtrl.treeModel.getNodeById(node.data.id);
    someNode.expandAll();
    node.action = 'ALL';
    this.messageEvent.emit(node);
  }

  collapseNode(node): void {
    const someNode = this.treeCtrl.treeModel.getNodeById(node.data.id);
    someNode.collapseAll();
  }

  onNodeSelected(e): void {
    this.navFullTree();
    if (this.preferences.expandOption === 'both') {
      const someNode = this.treeCtrl.treeModel.getNodeById(e.node.data.id);
      someNode.expand();

    }
    e.node.action = 'NODE';
    this.messageEvent.emit(e.node);
  }

  toggleExpanded(e): void {
    e.node.data.isExpanded = e.isExpanded;
  }

  getNodeById(id): any {
    return this.treeCtrl.treeModel.getNodeById(id);
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
