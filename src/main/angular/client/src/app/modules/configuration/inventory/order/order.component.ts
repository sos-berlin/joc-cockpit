import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {CoreService} from '../../../../services/core.service';
import {DataService} from '../../../../services/data.service';

@Component({
  selector: 'app-period',
  templateUrl: './period-editor-dialog.html',
})
export class PeriodEditorComponent implements OnInit, OnDestroy {
  @Input() isNew: boolean;
  @Input() period: any = {};
  editor: any = {};

  constructor(public activeModal: NgbActiveModal, private coreService: CoreService) {
  }

  static getTimeInString(time) {
    if (time.toString().substring(0, 2) == '00' && time.toString().substring(3, 5) == '00') {
      return time.toString().substring(6, time.length) + ' seconds';
    } else if (time.toString().substring(0, 2) == '00') {
      return time.toString().substring(3, time.length) + ' minutes';
    } else if ((time.toString().substring(0, 2) != '00' && time.length == 5) || (time.length > 5 && time.toString().substring(0, 2) != '00' && (time.toString().substring(6, time.length) == '00'))) {
      return time.toString().substring(0, 5) + ' hours';
    } else {
      return time;
    }
  }

  ngOnInit(): void {
    if (this.isNew) {
      this.period.frequency = 'single_start';
      this.period.period = {};
      this.period.period._begin = '00:00:00';
      this.period.period._end = '24:00:00';
      this.period.period._when_holiday = 'suppress';
    } else {
      console.log(this.period);
    }
    this.editor.when_holiday_options = [
      'previous_non_holiday',
      'next_non_holiday',
      'suppress',
      'ignore_holiday'
    ];
  }

  ngOnDestroy(): void {
  }

  onSubmit(): void {
    this.period.str = this.getString();
    this.activeModal.close(this.period);
  }

  cancel(): void {
    this.activeModal.dismiss();
  }

  private getString(): string {
    let str = '';
    if (this.period.period._begin) {
      str = this.period.period._begin;
    }
    if (this.period.period._end) {
      str = str + '-' + this.period.period._end;
    }
    if (this.period.period._single_start) {
      this.period.frequency = 'single_start';
      str = 'Single start: ' + this.period.period._single_start;
    } else if (this.period.period._absolute_repeat) {
      this.period.frequency = 'absolute_repeat';
      str = str + ' every ' + PeriodEditorComponent.getTimeInString(this.period.period._absolute_repeat);
    } else if (this.period.period._repeat) {
      this.period.frequency = 'repeat';
      str = str + ' every ' + PeriodEditorComponent.getTimeInString(this.period.period._repeat);
    } else {
      this.period.frequency = 'time_slot';
    }
    return str;
  }

}

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
})
export class OrderComponent implements OnDestroy, OnChanges {
  @Input() preferences: any;
  @Input() permission: any;
  @Input() schedulerId: any;
  @Input() data: any;
  @Input() copyObj: any;

  order: any = {};
  workingDayCalendar: any;
  nonWorkingDayCalendar: any;
  previewCalendarView: any;
  isUnique = true;
  objectType = 'ORDER';
  workflowTree = [];
  workingCalendarTree = [];
  nonWorkingCalendarTree = [];
  @ViewChild('treeSelectCtrl', {static: false}) treeSelectCtrl;

  constructor(private modalService: NgbModal, private coreService: CoreService, private dataService: DataService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.order.actual) {
      this.saveJSON();
    }
    if (changes.data) {
      if (this.data.type) {
        this.getObject();
        if (this.workflowTree.length === 0) {
          this.coreService.post('tree', {
            jobschedulerId: this.schedulerId,
            compact: true,
            types: ['WORKFLOW']
          }).subscribe((res) => {
            this.workflowTree = this.coreService.prepareTree(res);
          });
        }
        if (this.workingCalendarTree.length === 0) {
          this.coreService.post('tree', {
            jobschedulerId: this.schedulerId,
            compact: true,
            types: ['CALENDAR']
          }).subscribe((res) => {
            this.workingCalendarTree = this.coreService.prepareTree(res);
          });
        }
        if (this.nonWorkingCalendarTree.length === 0) {
          this.coreService.post('tree', {
            jobschedulerId: this.schedulerId,
            compact: true,
            types: ['CALENDAR']
          }).subscribe((res) => {
            this.nonWorkingCalendarTree = this.coreService.prepareTree(res);
          });
        }
      } else {
        this.order = {};
      }
    }
  }

  ngOnDestroy() {
    if (this.order.name) {
      this.saveJSON();
    }
  }

  addPeriodInCalendar(calendar): void {
    const modalRef = this.modalService.open(PeriodEditorComponent, {backdrop: 'static'});
    modalRef.componentInstance.isNew = true;
    modalRef.componentInstance.period = {};
    modalRef.result.then((result) => {
      console.log(result);
      if (!calendar.periods) {
        calendar.periods = [];
      }
      calendar.periods.push(result);

    }, (reason) => {
      console.log('close...', reason);

    });
  }

  updatePeriodInCalendar(calendar, index, period): void {
    const modalRef = this.modalService.open(PeriodEditorComponent, {backdrop: 'static'});
    modalRef.componentInstance.period = period;
    modalRef.result.then((result) => {

    }, (reason) => {
      console.log('close...', reason);
    });
  }

  removePeriodInCalendar(calendar, period): void {
    for (let i = 0; i < calendar.periods.length; i++) {
      if (calendar.periods[i] == period) {
        calendar.periods.splice(i, 1);
        break;
      }
    }
  }


  previewCalendar(calendar, type): void {
    this.dataService.isCalendarReload.next(calendar);
    this.previewCalendarView = calendar;
    this.previewCalendarView.type = type;
  }

  closeCalendarView() {
    this.previewCalendarView = null;
  }

  removeWorkingCal(index): void {
    this.order.configuration.workingCalendars.splice(index, 1);
  }

  removeNonWorkingCal(index): void {
    this.order.configuration.nonWorkingCalendars.splice(index, 1);
  }

  addCriteria(): void {
    let param = {
      name: '',
      value: ''
    };
    if (this.order.configuration.variables) {
      if (!this.coreService.isLastEntryEmpty(this.order.configuration.variables, 'name', '')) {
        this.order.configuration.variables.push(param);
      }
    }
  }

  removeVariable(index): void {
    this.order.configuration.variables.splice(index, 1);
  }

  loadData(node, type, $event): void {
    if (!node.origin.type) {
      if ($event) {
        $event.stopPropagation();
      }
      let flag = true;
      if (node.origin.children && node.origin.children.length > 0 && node.origin.children[0].type) {
        flag = false;
      }
      if (node && (node.isExpanded || node.origin.isLeaf) && flag) {
        let obj: any = {
          jobschedulerId: this.schedulerId,
          path: node.key
        };
        if (type !== 'WORKFLOW') {
          obj.objectType = type;
        }
        this.coreService.post('inventory/read/folder', obj).subscribe((res: any) => {
          let data;
          if (type === 'WORKFLOW') {
            data = res.workflows;
          } else {
            data = res.calendars;
          }
          for (let i = 0; i < data.length; i++) {
            const _path = node.key + (node.key === '/' ? '' : '/') + data[i].name;
            data[i].title = _path;
            data[i].path = _path;
            data[i].key = _path;
            data[i].type = type;
            data[i].isLeaf = true;
          }
          if (node.origin.children && node.origin.children.length > 0) {
            data = data.concat(node.origin.children);
          }
          if (node.origin.isLeaf) {
            node.origin.expanded = true;
          }
          node.origin.isLeaf = false;
          node.origin.children = data;
          if (type === 'WORKFLOW') {
            this.workflowTree = [...this.workflowTree];
          } else if (type === 'WORKINGDAYSCALENDAR') {
            this.workingCalendarTree = [...this.workingCalendarTree];
          } else {
            this.nonWorkingCalendarTree = [...this.nonWorkingCalendarTree];
          }
        });
      }
    } else {
      if (type !== 'WORKFLOW') {
        if (type === 'WORKINGDAYSCALENDAR') {
          this.order.configuration.workingCalendars.push({calendarPath: node.origin.path, periods: []});
        } else {
          this.order.configuration.nonWorkingCalendars.push({calendarPath: node.origin.path, periods: []});
        }
      }
    }
  }

  onExpand(e, type) {
    this.loadData(e.node, type, null);
  }

  private getObject() {
    const _path = this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name;
    this.coreService.post('inventory/read/configuration', {
      jobschedulerId: this.schedulerId,
      objectType: this.objectType,
      path: _path,
      id: this.data.id,
    }).subscribe((res: any) => {
      this.order = res;
      this.order.path1 = this.data.path;
      this.order.name = this.data.name;
      this.order.actual = res.configuration;
      this.order.configuration = res.configuration ? JSON.parse(res.configuration) : {};
      if (!this.order.configuration.variables) {
        this.order.configuration.variables = [];
      }
      if (!this.order.configuration.workingCalendars) {
        this.order.configuration.workingCalendars = [];
      }
      if (!this.order.configuration.nonWorkingCalendars) {
        this.order.configuration.nonWorkingCalendars = [];
      }
      if (!this.order.configuration.variables) {
        this.order.configuration.variables = [];
      }
      if (this.order.configuration.variables.length === 0) {
        this.addCriteria();
      }
      if (this.order.configuration.workflowPath) {
        const path = this.order.configuration.workflowPath.substring(0, this.order.configuration.workflowPath.lastIndexOf('/')) || '/';
        setTimeout(() => {
          let node = this.treeSelectCtrl.getTreeNodeByKey(path);
          node.isExpanded = true;
          this.loadData(node, 'WORKFLOW', null);
        }, 10);
      }
    });
  }

  private saveJSON() {
    if (this.order.actual !== JSON.stringify(this.order.configuration)) {
      const _path = this.order.path1 + (this.order.path1 === '/' ? '' : '/') + this.order.name;
      this.coreService.post('inventory/store', {
        jobschedulerId: this.schedulerId,
        configuration: JSON.stringify(this.order.configuration),
        path: _path,
        id: this.order.id,
        objectType: this.objectType
      }).subscribe(res => {

      }, (err) => {
        console.log(err);
      });
    }
  }
}
