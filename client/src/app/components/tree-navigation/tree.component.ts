import {Component, OnInit, Input, ViewChild, Output, EventEmitter} from '@angular/core';
import { CoreService } from '../../services/core.service';

declare var $;

@Component({
    selector: 'app-tree-nagivation',
    templateUrl: './tree.component.html'
})
export class TreeComponent implements OnInit {

  @Input() tree;
  @ViewChild('treeCtrl') treeCtrl;

  @Output() messageEvent = new EventEmitter<string>();

  constructor(public coreService: CoreService) {

  }

  ngOnInit() {
    let self = this;
    let interval = setInterval(function () {
      if (self.treeCtrl && self.treeCtrl.treeModel) {
        const node = self.treeCtrl.treeModel.getNodeById(1);
        node.expand();
        clearInterval(interval);
      }
    }, 5)
  }

  private traverseTree(data) {
    let self = this;
    data.children.forEach(function (value) {
      value.isSelected = false;
      self.traverseTree(value);
    });
  }

  private navFullTree() {
    let self = this;
    this.tree.forEach(function (value) {
      value.isSelected = false;
      self.traverseTree(value);
    });
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
    this.messageEvent.emit(node)
  }

  collapseNode(node): void {
    const someNode = this.treeCtrl.treeModel.getNodeById(node.data.id);
    someNode.collapseAll();
  }

  onNodeSelected(e): void {
    this.navFullTree();
    e.node.action = 'NODE';
    this.messageEvent.emit(e.node)
  }

  toggleExpanded(e): void {
    e.node.data.isExpanded = e.isExpanded;
  }

  getNodeById(id): any {
    return this.treeCtrl.treeModel.getNodeById(id);
  }

}
