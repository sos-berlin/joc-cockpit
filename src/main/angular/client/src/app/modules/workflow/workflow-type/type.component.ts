import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
  SimpleChanges,
  ViewContainerRef
} from '@angular/core';
import {NzModalService} from 'ng-zorro-antd/modal';
import {CoreService} from '../../../services/core.service';
import {ScriptModalComponent} from '../script-modal/script-modal.component';
import {DependentWorkflowComponent} from '../workflow-graphical/workflow-graphical.component';
import {CommentModalComponent} from "../../../components/comment-modal/comment.component";

@Component({
  selector: 'app-type',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './type.component.html'
})
export class TypeComponent {
  @Input() configuration;
  @Input() jobs;
  @Input() expandAll;
  @Input() orders;
  @Input() preferences: any;
  @Input() permission: any;
  @Input() schedulerId: any;
  @Input() timezone: string;
  @Input() workflowObj: any;
  @Input() orderPreparation: any;
  @Input() recursiveCals: any;
  @Input() workflowFilters: any;
  @Input() expectedNoticeBoards: any;
  @Input() postNoticeBoards: any;
  @Input() addOrderToWorkflows: any;
  @Input() orderReload: boolean;
  @Output() isDropdownChangedHandler: EventEmitter<any> = new EventEmitter();
  @Output() update: EventEmitter<any> = new EventEmitter();
  @Output() isChanged: EventEmitter<boolean> = new EventEmitter();
  @Output() isProcessing: EventEmitter<boolean> = new EventEmitter();
  @Output() onClick: EventEmitter<any> = new EventEmitter();

  sideBar: any = {};
  isFirst = false;

  constructor(public coreService: CoreService, private modal: NzModalService, private viewContainerRef: ViewContainerRef
  ) {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['expandAll']) {
      if (this.expandAll) {
        this.recursiveUpdate(this.configuration, true);
      } else if (this.expandAll === false) {
        this.recursiveUpdate(this.configuration, false);
      }
    }
    if (changes['configuration']) {
      if (this.configuration.TYPE === 'Workflow' && this.configuration.instructions) {
        this.isFirst = true;
        for (let i = 0; i < this.configuration.instructions.length; i++) {
          this.configuration.instructions[i].show = true;
          this.getDocumentationInfo(this.configuration.instructions[i]);
        }
      }
    }
    if (changes['orders'] || changes['orderReload']) {
      this.updateOrder();
    }
  }

  changedHandler(flag: boolean): void {
    this.isChanged.emit(flag);
    setTimeout(() => {
      this.isChanged.emit(false);
    }, 5000);
  }

  dropdownChangedHandler(isOpen: boolean): void {
    this.isDropdownChangedHandler.emit(isOpen);
  }

  processingHandler(flag: boolean): void {
    this.isProcessing.emit(flag);
    if (flag) {
      setTimeout(() => {
        this.isChanged.emit(false);
      }, 5000);
    }
  }

  collapse(node): void {
    node.show = !node.show;
    if (node.show && node.instructions) {
      for (const x in node.instructions) {
        if (node.instructions[x]) {
          this.getDocumentationInfo(node.instructions[x]);
        }
      }
    }
    this.update.emit();
  }

  recursiveUpdate(node, flag): void {
    const self = this;

    function recursive(json) {
      if (json.instructions) {
        for (let x = 0; x < json.instructions.length; x++) {
          json.instructions[x].show = flag;
          if (flag) {
            self.getDocumentationInfo(json.instructions[x]);
          }
          if (json.instructions[x].TYPE === 'Fork') {
            if (json.instructions[x].branches) {
              for (let i = 0; i < json.instructions[x].branches.length; i++) {
                json.instructions[x].branches[i].show = flag;
                if (json.instructions[x].branches[i].instructions) {
                  recursive(json.instructions[x].branches[i]);
                }
              }
            }
          }

          if (json.instructions[x].instructions) {
            recursive(json.instructions[x]);
          }
          if (json.instructions[x].catch) {
            if (json.instructions[x].catch.instructions && json.instructions[x].catch.instructions.length > 0) {
              recursive(json.instructions[x].catch);
            }
          }
          if (json.instructions[x].then && json.instructions[x].then.instructions) {
            recursive(json.instructions[x].then);
          }
          if (json.instructions[x].else && json.instructions[x].else.instructions) {
            json.instructions[x].else.show = flag;
            recursive(json.instructions[x].else);
          }
        }
      }
      if (json.branches) {
        for (let i = 0; i < json.branches.length; i++) {
          json.branches[i].show = flag;
          if (json.branches[i].instructions) {
            recursive(json.branches[i]);
          }
        }
      }
      if (json.catch) {
        json.catch.show = flag;
        if (json.catch.instructions && json.catch.instructions.length > 0) {
          recursive(json.catch);
        }
      }
      if (json.then && json.then.instructions) {
        json.then.show = flag;
        recursive(json.then);
      }
      if (json.else && json.else.instructions) {
        json.else.show = flag;
        recursive(json.else);
      }
    }

    recursive(node);
  }

  showOrders(data): void {

    const self = this;
    this.sideBar = {
      orders: [],
      data
    };
    if (data.orders) {
      this.sideBar.orders = data.orders || [];
    }

    function recursive(json) {
      if (json.instructions) {
        for (let x = 0; x < json.instructions.length; x++) {
          if (json.instructions[x].orders) {
            self.sideBar.orders = self.sideBar.orders.concat(json.instructions[x].orders);
          }
          if (json.instructions[x].TYPE === 'Fork') {
            if (json.instructions[x].branches) {
              for (let i = 0; i < json.instructions[x].branches.length; i++) {
                if (json.instructions[x].branches[i].instructions) {
                  recursive(json.instructions[x].branches[i]);
                  if (json.instructions[x].branches[i].orders) {
                    self.sideBar.orders = self.sideBar.orders.concat(json.instructions[x].branches[i].orders);
                  }
                }
              }
            }
          }

          if (json.instructions[x].instructions) {
            recursive(json.instructions[x]);
          }
          if (json.instructions[x].catch) {
            if (json.instructions[x].catch.instructions && json.instructions[x].catch.instructions.length > 0) {
              recursive(json.instructions[x].catch);
              if (json.instructions[x].catch.orders) {
                self.sideBar.orders = self.sideBar.orders.concat(json.instructions[x].catch.orders);
              }
            }
          }
          if (json.instructions[x].then && json.instructions[x].then.instructions) {
            recursive(json.instructions[x].then);
            if (json.instructions[x].then.orders) {
              self.sideBar.orders = self.sideBar.orders.concat(json.instructions[x].then.orders);
            }
          }
          if (json.instructions[x].else && json.instructions[x].else.instructions) {
            recursive(json.instructions[x].else);
            if (json.instructions[x].else.orders) {
              self.sideBar.orders = self.sideBar.orders.concat(json.instructions[x].else.orders);
            }
          }
        }
      } else {
        if (json.branches) {
          for (let i = 0; i < json.branches.length; i++) {
            if (json.branches[i].instructions) {
              recursive(json.branches[i]);
              if (json.branches[i].orders) {
                self.sideBar.orders = self.sideBar.orders.concat(json.branches[i].orders);
              }
            }
          }
        }
      }
    }

    recursive(data);
    this.isFirst = true;
    this.sideBar.isVisible = true;
  }

  expandNode(node): void {
    node.show = true;
    this.recursiveUpdate(node, true);
  }

  collapseNode(node): void {
    node.show = false;
    this.recursiveUpdate(node, false);
  }

  private updateOrder(): void {
    const self = this;
    const mapObj = new Map();

    function recursive(json) {
      if (json.instructions) {
        for (let x = 0; x < json.instructions.length; x++) {
          self.checkOrders(json.instructions[x], mapObj);
          if (json.instructions[x].TYPE === 'Fork') {
            if (json.instructions[x].branches) {
              for (let i = 0; i < json.instructions[x].branches.length; i++) {
                if (json.instructions[x].branches[i].instructions) {
                  self.checkOrders(json.instructions[x].branches[i], mapObj);
                  recursive(json.instructions[x].branches[i]);
                  if (json.instructions[x].branches[i].orderCount) {
                    json.instructions[x].orderCount = (json.instructions[x].orderCount || 0) + json.instructions[x].branches[i].orderCount;
                  }
                }
              }
            }
          }

          if (json.instructions[x].instructions) {
            recursive(json.instructions[x]);
          }
          if (json.instructions[x].catch) {
            if (json.instructions[x].catch.instructions && json.instructions[x].catch.instructions.length > 0) {
              self.checkOrders(json.instructions[x].catch, mapObj);
              recursive(json.instructions[x].catch);
            }
            json.instructions[x].orderCount = (json.instructions[x].orderCount || 0) + json.instructions[x].catch.orderCount;
          }
          if (json.instructions[x].then && json.instructions[x].then.instructions) {
            self.checkOrders(json.instructions[x].then, mapObj);
            recursive(json.instructions[x].then);
            json.instructions[x].orderCount = (json.instructions[x].orderCount || 0) + json.instructions[x].then.orderCount;
          }
          if (json.instructions[x].else && json.instructions[x].else.instructions) {
            self.checkOrders(json.instructions[x].else, mapObj);
            recursive(json.instructions[x].else);
            json.instructions[x].orderCount = (json.instructions[x].orderCount || 0) + json.instructions[x].else.orderCount;
          }
          if (json.instructions[x].orderCount) {
            json.orderCount = (json.orderCount || 0) + json.instructions[x].orderCount;
          }
        }
      } else {
        if (json.branches) {
          for (let i = 0; i < json.branches.length; i++) {
            if (json.branches[i].instructions) {
              self.checkOrders(json.branches[i], mapObj);
              recursive(json.branches[i]);
              if (json.branches[i].orderCount) {
                json.orderCount = (json.orderCount || 0) + json.branches[i].orderCount;
              }
            }
          }
        }
      }
    }

    if (this.orders) {
      for (let j = 0; j < this.orders.length; j++) {
        let arr = [this.orders[j]];
        if (mapObj.has(JSON.stringify(this.orders[j].position))) {
          arr = arr.concat(mapObj.get(JSON.stringify(this.orders[j].position)));
        }
        mapObj.set(JSON.stringify(this.orders[j].position), arr);
      }
      recursive(this.configuration);
    }
    if (this.sideBar.isVisible) {
      this.showOrders(this.sideBar.data);
    }
  }

  private checkOrders(instruction, mapObj): void {
    if (instruction.join && instruction.join.positionStrings) {
      delete instruction.join.orders;
      instruction.join.positionStrings.forEach((pos) => {
        if (mapObj.has(JSON.stringify(pos))) {
          if (instruction.join.orders) {
            instruction.join.orders = instruction.join.orders.concat(mapObj.get(JSON.stringify(pos)));
          } else {
            instruction.join.orders = mapObj.get(JSON.stringify(pos));
          }
        }
      });
    }
    if (instruction.position) {
      delete instruction.orders;
      const order = mapObj.get(JSON.stringify(instruction.position));
      if (order) {
        instruction.orders = order;
        if (!instruction.orderCount) {
          instruction.orderCount = 0;
        }
        instruction.orderCount = order.length;
      } else {
        instruction.orderCount = 0;
      }
    } else {
      instruction.orderCount = 0;
    }
  }

  /* --------- Job action menu operations ----------------*/

  skipOperation(job, operation): void {
    if (this.preferences.auditLog) {
      const comments = {
        radio: 'predefined',
        type: 'Job',
        operation: operation,
        name: job.label
      };
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzData: {
          comments,
        },
        nzFooter: null,
        nzAutofocus: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          this.skipOrStop(job, operation, {
            comment: result.comment,
            timeSpent: result.timeSpent,
            ticketLink: result.ticketLink
          });
        }
      });
    } else {
      this.skipOrStop(job, operation);
    }
  }

  private skipOrStop(data, operation, auditLog?): void {
    let obj: any = {
      controllerId: this.schedulerId,
      auditLog
    };
    if (operation === 'Skip' || operation === 'Unskip') {
      obj.labels = [data.label];
      obj.workflowPath = this.workflowObj.path;
    } else {
      obj.positions = [data.position];
      obj.workflowId = {path: this.workflowObj.path, versionId: this.workflowObj.versionId};
    }
    this.coreService.post('workflow/' + operation.toLowerCase(), obj).subscribe({
      next: () => {
        this.processingHandler(true)
      }, error: () => {
        this.processingHandler(false)
      }
    });
  }

  skip(job): void {
    this.skipOperation(job, 'Skip');
  }

  unskip(job): void {
    this.skipOperation(job, 'Unskip');
  }

  stop(job): void {
    this.skipOperation(job, 'Stop');
  }

  unstop(job): void {
    this.skipOperation(job, 'Unstop');
  }

  showConfiguration(instruction): void {
    let nzData;
    if (instruction.TYPE === 'Job') {
      const job = this.jobs[instruction.jobName];
      const data = (job.executable.TYPE === 'ShellScriptExecutable' || job.executable.internalType === 'JavaScript_Graal') ? job.executable.script : job.executable.className;
      if (job && job.executable) {
        nzData = {
          data,
          agentName: job.agentName,
          subagentClusterId: job.subagentClusterId,
          workflowPath: this.workflowObj.path,
          admissionTime: job.admissionTimeScheme,
          timezone: this.timezone,
          jobName: instruction.jobName,
          mode: job.executable.TYPE === 'ShellScriptExecutable' ? 'shell' : 'javascript',
          isScript: (job.executable.TYPE === 'ShellScriptExecutable' || job.executable.internalType === 'JavaScript_Graal'),
          readonly: true
        };
      }
    } else if (instruction.TYPE === 'If') {
      nzData = {
        predicate: true,
        data: instruction.predicate,
        workflowPath: this.workflowObj.path,
        isScript: true,
        readonly: true
      };
    } else if (instruction.TYPE === 'Cycle') {
      nzData = {
        schedule: instruction.schedule,
        workflowPath: this.workflowObj.path,
        timezone: this.timezone
      };
    }
    if (nzData) {
      this.modal.create({
        nzTitle: undefined,
        nzContent: ScriptModalComponent,
        nzClassName: 'lg script-editor2',
        nzData,
        nzFooter: null,
        nzAutofocus: null,
        nzClosable: false,
        nzMaskClosable: false
      });
    }
  }

  viewHistory(instruction): void {
    this.onClick.emit({jobName: instruction.jobName, path: this.workflowObj.path});
  }

  getObstacles(order): void {
    if (order.state._text === 'INPROGRESS' && !order.obstacles) {
      order.obstacles = [];
      this.coreService.post('order/obstacles', {
        controllerId: this.schedulerId,
        orderId: order.orderId
      }).subscribe((res: any) => {
        order.obstacles = res.obstacles;
      });
    }
  }

  getDocumentationInfo(instruction): void {
    if (instruction.TYPE === 'Job' && !instruction.documentationName) {
      const job = this.jobs[instruction.jobName];
      instruction.documentationName = job ? job.documentationName : null;
    }
  }

  openWorkflowDependency(obj): void {
    if (obj.TYPE === 'ExpectNotices' || obj.TYPE === 'PostNotices' || obj.TYPE === 'AddOrder') {
      let workflow;
      const list = obj.TYPE === 'ExpectNotices' ? this.expectedNoticeBoards : obj.TYPE === 'PostNotices' ? this.postNoticeBoards : [];
      for (const prop in list) {
        if (list[prop]) {
          if (list[prop].name === obj.noticeBoardNames) {
            list[prop].value.forEach((item) => {
              workflow = item;
            });
            break;
          }
        }
      }
      if (obj.TYPE === 'AddOrder') {
        for (const i in this.addOrderToWorkflows) {
          if (obj.workflowName === this.addOrderToWorkflows[i].path.substring(this.addOrderToWorkflows[i].path.lastIndexOf('/') + 1)) {
            workflow = this.addOrderToWorkflows[i];
          }
        }
      }

      if (workflow) {
        this.modal.create({
          nzTitle: undefined,
          nzContent: DependentWorkflowComponent,
          nzClassName: 'x-lg',
          nzData: {
            workflow,
            permission: this.permission,
            preferences: this.preferences,
            controllerId: this.schedulerId,
            recursiveCals: this.recursiveCals,
            view: 'list',
            workflowFilters: this.workflowFilters
          },
          nzFooter: null,
          nzAutofocus: null,
          nzClosable: false,
          nzMaskClosable: false
        });
      }
    }
  }

  showLog(order): void {
    if (order.state && (order.state._text !== 'SCHEDULED' && order.state._text !== 'PENDING')) {
      this.coreService.showOrderLogWindow(order.orderId, this.schedulerId, this.workflowObj.path, this.viewContainerRef);
    }
  }

  @HostListener('window:click', ['$event'])
  onClicked(event): void {
    if (event) {
      if (event.target.getAttribute('data-id-x')) {
        this.coreService.navToInventoryTab(event.target.getAttribute('data-id-x'), 'NOTICEBOARD');
      } else if (event.target.getAttribute('data-id-y')) {
        this.coreService.showBoard(event.target.getAttribute('data-id-y'));
      }
    }
  }
}
