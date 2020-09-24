import {Component, OnInit, OnDestroy, Input, ViewChild} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {CoreService} from '../../services/core.service';
import {NzFormatEmitEvent, NzTreeNode} from 'ng-zorro-antd';
import {forkJoin} from 'rxjs';

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
    this.init();
  }

  init() {
    this.coreService.post('tree', {
      jobschedulerId: this.schedulerId,
      forInventory: true,
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
    this.onNodeChecked(object);
  }

  selectNode(e): void {
    const data = e.origin || e;
    if (this.showCheckBox) {

    } else if (this.object) {
      if (this.object === 'Calendar') {
        let obj: any = {
          path: e.key,
          type: 'CALENDAR',
          calendarType: this.type
        };
        this.coreService.post('inventory/read/folder', obj).subscribe((res: any) => {
          data.calendars = res.calendars;
          for (let i = 0; i < data.calendars.length; i++) {
            data.calendars[i].path = e.key + (e.key === '/' ? '' : '/') + data.calendars[i].name;
          }
        });
      }
    } else {
      this.activeModal.close(data.path);
    }
  }

  onNodeChecked(e): void {
    if (this.object !== 'Calendar') {
      if (e.isChecked) {
        if (this.paths.indexOf(e.path) === -1) {
          this.paths.push(e.path);
        }
      } else {
        this.paths.splice(this.paths.indexOf(e.path), 1);
      }
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
              
              self.objects.push({calendarPath: nodes[i].calendars[j].path, periods: []});
            }
          }
        }
        recursive(nodes[i].children);
      }
    }
    recursive(this.tree);
  }

  submit(): void {
 
    this.isSubmitted = true;
    if (this.paths && this.paths.length > 0) {
      this.activeModal.close(this.paths);
    } else {
      this.getJSObject();
     
      this.activeModal.close(this.objects);
    }
  }

  ngOnDestroy() {
    //$('.modal').css('opacity', 1);
  }
}
