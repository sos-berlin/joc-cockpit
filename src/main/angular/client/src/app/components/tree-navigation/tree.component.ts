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
  @ViewChild('treeCtrl') treeCtrl;

  @Output() messageEvent = new EventEmitter<string>();

  constructor(public coreService: CoreService) {
  }

  static setGraphHt() {
    const dom = $('.scroll-y');
    if (dom && dom.position()) {
      let top = dom.position().top + 12;
      top = top - $(window).scrollTop();
      if (top < 70) {
        top = 92;
      }
      $('.sticky').css('top', top);
      const ht = window.innerHeight - top;
      if (ht > 400) {
         $('.tree-block').height((ht - 20 + $(window).scrollTop()) + 'px');
      }
      if (top < 140 && top > 92) {
        setTimeout(() => {
          TreeComponent.setGraphHt();
        }, 5);
      }
    }
  }

  ngOnInit() {
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences) || {};
    }
    TreeComponent.setGraphHt();
    const interval = setInterval(() => {
      if (this.treeCtrl && this.treeCtrl.treeModel) {
        const node = this.treeCtrl.treeModel.getNodeById(1);
        if (node) {
          node.expand();
          TreeComponent.setGraphHt();
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
    TreeComponent.setGraphHt();
  }

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    TreeComponent.setGraphHt();
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
