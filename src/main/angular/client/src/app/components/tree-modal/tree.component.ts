import {Component, OnInit, OnDestroy, Input, ViewChild} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {CoreService} from '../../services/core.service';

import * as _ from 'underscore';

declare const $;

@Component({
  selector: 'app-ngbd-modal-content',
  templateUrl: './tree.component.html'
})
export class TreeModalComponent implements OnInit, OnDestroy {
  tree: any = [];

  @Input() schedulerId;
  @Input() paths: any = [];
  @Input() showCheckBox: boolean;
  @Input() type: string;

  @ViewChild('treeCtrl') treeCtrl;

  constructor(public activeModal: NgbActiveModal, private coreService: CoreService) {
  }

  ngOnInit() {
    $('.modal').css('opacity', 0.65);
    $('#tree-modal').parents('div').addClass('card m-a');
    this.init();
  }

  init() {
    this.coreService.post('tree', {
      jobschedulerId: this.schedulerId,
      compact: true,
      types: this.type ? [this.type] : undefined
    }).subscribe(res => {
      this.prepareTree(res);
    });
  }

  onNodeSelected(e): void {
    if(!this.showCheckBox) {
      this.activeModal.close(e.node.data.path);
    }
  }

  onNodeChecked(e): void {
    if (e.data.isChecked) {
      if (this.paths.indexOf(e.data.path) === -1) {
        this.paths.push(e.data.path);
      }
    } else {
      this.paths.splice(this.paths.indexOf(e.data.path), 1);
    }
  }

  expandAll(): void {
    this.treeCtrl.treeModel.expandAll();
  }

  collapseAll(): void {
    this.treeCtrl.treeModel.collapseAll();
  }


  private prepareTree(actualData) {
    const self = this;
    let output = [{
      id: 1,
      name: actualData.folders[0].path,
      path: actualData.folders[0].path,
      children: []
    }];

    this.recursive(actualData.folders[0], output[0].children);
    this.tree = output;

    setTimeout(() => {
      let node = self.treeCtrl.treeModel.getNodeById(1);
      if (node) {
        node.expand();
      }
    }, 10);
  }

  private recursive(data, output) {
    if (data.folders && data.folders.length > 0) {
      data.folders = _.sortBy(data.folders, 'name');
      for (let i = 0; i < data.folders.length; i++) {
        output.push({
          name: data.folders[i].name,
          path: data.folders[i].path,
          children: []
        });
        if (data.folders[i].folders && data.folders[i].folders.length > 0) {
          this.recursive(data.folders[i], output[i].children);
        }
      }
    }
  }

  ngOnDestroy() {
    $('.modal').css('opacity', 1);
  }
}
