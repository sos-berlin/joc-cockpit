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
  isSubmitted = false;

  constructor(public activeModal: NgbActiveModal, private coreService: CoreService) {
  }

  ngOnInit() {
    // $('.modal').css('opacity', 0.65);
    // $('#tree-modal').parents('div').addClass('card m-a');
    this.init();
  }

  init() {
    this.coreService.post('tree', {
      jobschedulerId: this.schedulerId,
      compact: true,
      types: this.type ? [this.type] : undefined
    }).subscribe(res => {
      this.tree = this.coreService.prepareTree(res, true);
      if (this.tree.length > 0) {
        this.tree[0].expanded = true;
        this.selectNode(this.tree[0]);
      }
    });
  }

  handleCheckbox(object): void {
    object.isChecked = !object.isChecked;
    this.tree = [...this.tree];
  }

  selectNode(e): void {
    const data = e.origin || e;
    if (this.showCheckBox) {

    } else if (this.object) {
      if (this.object === 'Calendar') {
        let obj: any = {
          jobschedulerId: this.schedulerId,
          path: e.key,
          type: 'WORKINGDAYSCALENDAR',
        };
        this.coreService.post('inventory/read/folder', obj).subscribe((res: any) => {
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

  private getJSObject() {
    const self = this;
    function recursive(nodes) {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].calendars) {
          for (let j = 0; j < nodes[i].calendars.length; j++) {
            if (nodes[i].calendars[j].isChecked) {
              self.getConfiguration(nodes[i].calendars[j].id,  nodes[i].calendars[j].name);
            }
          }
        }

        recursive(nodes[i].children);
      }
    }
    recursive(this.tree);
    setTimeout(() => {
      this.activeModal.close(this.objects);
    }, 100);
  }

  private getConfiguration(id, name) {
    this.coreService.post('inventory/read/configuration', {
      jobschedulerId: this.schedulerId,
      objectType: this.type,
      id: id,
    }).subscribe((res: any) => {
      let obj: any = JSON.parse(res.configuration);
      obj.path = res.path;
      obj.name = name;
      this.objects.push(obj);
    }, ()=>{
      this.isSubmitted = false;
    });
  }

  submit(): void {
    this.isSubmitted = true;
    if (this.paths && this.paths.length > 0) {
      this.activeModal.close(this.paths);
    } else {
      this.getJSObject();

    }
  }

  ngOnDestroy() {
    $('.modal').css('opacity', 1);
  }
}
