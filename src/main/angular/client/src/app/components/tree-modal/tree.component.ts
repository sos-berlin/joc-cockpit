import {Component, OnInit, OnDestroy, Input, ViewChild} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {CoreService} from '../../services/core.service';
import {NzFormatEmitEvent, NzTreeNode} from 'ng-zorro-antd';

declare const $;

@Component({
  selector: 'app-ngbd-modal-content',
  templateUrl: './tree.component.html'
})
export class TreeModalComponent implements OnInit, OnDestroy {
  tree: any = [];

  @Input() schedulerId;
  @Input() paths: any = [];
  @Input() objects: any = [];
  @Input() showCheckBox: boolean;
  @Input() type: string;
  @Input() object: string;
  isExpandAll = false;

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
      this.tree = this.coreService.prepareTree(res);
      if (this.tree.length > 0) {
        this.tree[0].expanded = true;
      }
      console.log(this.tree)
    });
  }

  selectNode(e): void {
    let data = e.origin;
    if (this.showCheckBox) {

    } else if (this.object) {
      if (this.object === 'Calendar') {
        this.coreService.post('calendars', {
          jobschedulerId: this.schedulerId,
          compact: true,
          type: this.type === 'WORKINGDAYSCALENDAR' ? 'WORKING_DAYS' : 'NON_WORKING_DAYS',
          folders: [{folder: data.path}]
        }).subscribe((res: any) => {
          data.calendars = res.calendars;
        });
      }
    } else {
      this.activeModal.close(data.path);
    }
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
    this.isExpandAll = true;
  }

  collapseAll(): void {
    this.isExpandAll = false;
  }

  submit(): void {
    if (this.paths && this.paths.length > 0) {
      this.activeModal.close(this.paths);
    } else {
      this.activeModal.close(this.objects);
    }
  }

  ngOnDestroy() {
    $('.modal').css('opacity', 1);
  }
}
