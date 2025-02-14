import {Component, SimpleChanges, Input} from '@angular/core';
import {NzModalRef} from "ng-zorro-antd/modal";
import {CoreService} from "../../../services/core.service";
import { NzTreeNodeOptions } from 'ng-zorro-antd/tree';
declare const $: any;

@Component({
  selector: 'app-dependencies',
  templateUrl: './dependencies.component.html',
  styleUrl: './dependencies.component.scss'
})
export class DependenciesComponent {
  @Input() parentLoaded: boolean = false;
  @Input() schedulerId: any;
  @Input() preferences: any;
  @Input() permission: any;

  selectedDate: Date;
  isLoaded: boolean;
  data: any;
  plansFilters: any = {filter: {}};
  expectedTreeData: NzTreeNodeOptions[] = [];
  announcedTreeData: NzTreeNodeOptions[] = [];
  postedTreeData: NzTreeNodeOptions[] = [];
  searchValue = '';

  constructor(public coreService: CoreService) {
  }

  ngOnInit(): void {
    const d = new Date().setHours(0, 0, 0, 0);
    this.selectedDate = new Date(d);

    this.plansFilters = this.coreService.getPlansTab();
    this.loadPlans()
    this.initConf();

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['parentLoaded'] && changes['parentLoaded'].currentValue) {
      setTimeout(() => {
        this.initConf();
      },300)
    }
  }

  ngOnDestroy(): void {
    this.plansFilters.selectedDate = this.selectedDate;
  }

  private initConf(): void {
    if (this.plansFilters.selectedDate) {
      this.selectedDate = this.plansFilters.selectedDate;
    } else {
      const d = new Date().setHours(0, 0, 0, 0);
      this.selectedDate = new Date(d);
    }
    setTimeout(() => {
      const dom = $('#full-calendar2');
      if (!dom.data('calendar')) {
        dom.calendar({
          view: 'month',
          language: this.coreService.getLocale(),
          selectedDate: this.selectedDate,
          clickDay: (e) => {
            this.selectedDate = e.date;
            this.loadPlans()
          },
          renderEnd: (e) => {

          },
          rangeEnd: (e) => {

          }
        });
      }
    }, 100)
  }

  loadPlans(): void {
    this.isLoaded = false;
    let planIds
    if(this.plansFilters.filter.calView === 'Plannable'){
      planIds = 'DailyPlan'
    }else{
      planIds = 'Global';
    }
    this.coreService.post('plans', {
      controllerId: this.schedulerId,
      planKeys: [this.coreService.getDateByFormat(this.selectedDate, this.preferences.zone, 'YYYY-MM-DD')],
      planSchemaIds: [planIds],
      compact: true
    }).subscribe((res) => {
      this.data = res
      this.processData(res)
      this.isLoaded = true;
    });
  }

  setView(view): void {
    this.plansFilters.filter.calView = view;
    this.loadPlans();
  }

  processData(data) {
    let expectedNodes: NzTreeNodeOptions[] = [];
    let announcedNodes: NzTreeNodeOptions[] = [];
    let postedNodes: NzTreeNodeOptions[] = [];

    data.plans?.forEach(plan => {
      plan.noticeBoards?.forEach(board => {
        board.notices?.forEach(notice => {
          const noticeState = notice.state?._text || "UNKNOWN";

          let workflowMap = new Map();

          notice.expectingOrders?.forEach(order => {
            if (!workflowMap.has(order.workflowId?.path)) {
              workflowMap.set(order.workflowId?.path, {
                path: order.workflowId?.path,
                versionId: order.workflowId?.versionId,
                title: `${order.workflowId?.path || "Unknown Workflow"}`,
                status: `${order.state?._text || "UNKNOWN"}`,
                severity: `${order.state?.severity || "UNKNOWN"}`,
                icon: 'apartment',
                type: 'WORKFLOW',
                key: order.workflowId?.path,
                disableCheckbox: true,
                children: []
              });
            }


            workflowMap.get(order.workflowId?.path).children.push({
              path: order.orderId,
              title: `${order.orderId || "Unknown Order"}`,
              status: `${order.state?._text || "UNKNOWN"}`,
              severity: `${order.state?.severity || "UNKNOWN"}`,
              type: 'ORDER',
              key: order.orderId || Math.random().toString(),
              isLeaf: true,
              disableCheckbox: true

            });
          });

          let node: NzTreeNodeOptions = {
            path: board.path,
            title: `${board.path || "Unknown Board"}`,
            icon: 'gateway',
            type: 'NOTICEBOARD',
            key: notice.id || Math.random().toString(),
            expanded: true,
            children: Array.from(workflowMap.values()) // Convert Map to Array
          };

          if (noticeState === "EXPECTED") {
            expectedNodes.push(node);
          } else if (noticeState === "ANNOUNCED") {
            announcedNodes.push(node);
          } else if (noticeState === "POSTED") {
            postedNodes.push(node);
          }
        });
      });
    });

    this.expectedTreeData = expectedNodes;
    this.announcedTreeData = announcedNodes;
    this.postedTreeData = postedNodes;
  }


  getStatusClass(node: NzTreeNodeOptions): string {
    if (node.title.includes("WAITING")) return "status-expected";
    if (node.title.includes("ANNOUNCED")) return "status-announced";
    if (node.title.includes("POSTED")) return "status-posted";
    return "";
  }

  navToInventoryTab(data, type): void {
    this.coreService.navToInventoryTab(data, type);
  }

  showBoard(board): void {
    this.coreService.showBoard(board);
  }

  showWorkflow(workflow, version): void {
    this.coreService.showWorkflow(workflow, version);
  }

  checkBoxChange(data): void {
    console.log(data,":")
  }
}
