import {ChangeDetectorRef, Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {Router} from '@angular/router';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {isArray, isEmpty} from 'underscore';
import {CoreService} from '../../../services/core.service';
import {ValueEditorComponent} from '../../../components/value-editor/value.component';
import {AuthService} from '../../../components/guard';
import {WorkflowService} from '../../../services/workflow.service';
import {CommentModalComponent} from "../../../components/comment-modal/comment.component";
import {ConfirmModalComponent} from "../../../components/comfirm-modal/confirm.component";

@Component({
  selector: 'app-show-dependency',
  templateUrl: './show-dependency-dialog.html'
})
export class ShowDependencyComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  workflow: any;
  schedulerId: any;
  permission: any = {}
  loading = true;

  constructor(private coreService: CoreService, private activeModal: NzModalRef, private authService: AuthService) {
  }

  ngOnInit(): void {
    this.workflow = this.modalData.workflow;
    this.schedulerId = this.modalData.schedulerId;
    this.permission = JSON.parse(this.authService.permission) || {};
    this.getDependencies();
  }

  private getDependencies(): void {
    if (!this.workflow.expectedNoticeBoards && this.schedulerId) {
      this.coreService.post('workflow/dependencies', {
        controllerId: this.schedulerId,
        workflowId: {
          path: this.workflow.path,
          version: this.workflow.versionId
        }
      }).subscribe({
        next: (res) => {
          this.workflow.expectedNoticeBoards = this.coreService.convertObjectToArray(res.workflow, 'expectedNoticeBoards');
          this.workflow.postNoticeBoards = this.coreService.convertObjectToArray(res.workflow, 'postNoticeBoards');
          this.workflow.consumeNoticeBoards = this.coreService.convertObjectToArray(res.workflow, 'consumeNoticeBoards');
          this.workflow.addOrderFromWorkflows = res.workflow.addOrderFromWorkflows;
          this.workflow.addOrderToWorkflows = res.workflow.addOrderToWorkflows;
          this.loading = false;
        }, error: () => {
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
    }
  }

  close(): void {
    this.activeModal.destroy();
  }

  showWorkflow(workflow, version): void {
    this.coreService.showWorkflow(workflow, version);
    this.close();
  }

  showBoard(board): void {
    this.coreService.showBoard(board);
    this.close();
  }

  navToInventoryTab(data, type): void {
    this.coreService.navToInventoryTab(data, type);
    this.close();
  }
}

@Component({
  selector: 'app-add-order',
  templateUrl: './add-order-dialog.html',
})
export class AddOrderModalComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  schedulerId: any;
  permission: any;
  preferences: any;
  workflow: any;

  order: any = {};
  arguments: any = [];
  isForkList = false;

  dateFormat: any;
  display: any;
  required = false;
  comments: any = {};
  submitted = false;
  storedArguments = [];
  zones = [];
  variableList = [];
  schedules: any;
  selectedSchedule: any;
  positions: any;
  newPositions: any;
  blockPositions: any;
  blockPositionList: any;
  object = {
    orderName: '',
    name: ''
  }
  isCollapsed: boolean[] = [];

  constructor(public coreService: CoreService, private activeModal: NzModalRef,
              private modal: NzModalService, private ref: ChangeDetectorRef, private workflowService: WorkflowService) {
  }

  ngOnInit(): void {
    this.schedulerId = this.modalData.schedulerId;
    this.permission = this.modalData.permission;
    this.preferences = this.modalData.preferences;
    this.workflow = this.modalData.workflow;

    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
    this.zones = this.coreService.getTimeZoneList();
    this.display = this.preferences.auditLog;
    this.comments.radio = 'predefined';
    if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
      this.required = true;
      this.display = true;
    }
    this.order.timeZone = this.preferences.zone;
    this.order.at = 'now';
    if (!this.workflow.configuration) {
      this.workflow.configuration = this.coreService.clone(this.workflow);
      this.workflowService.convertTryToRetry(this.workflow.configuration, null, {}, {count: 0});

    }
    this.getPositions();
    this.updateVariableList();
    this.checkClipboardContent();
    //this.isCollapsed = Array(this.forkListVariables.length).fill(false);
  }

  toggleCollapse(k: number): void {
   
    if (this.preferences.listVariableCollapse) {
      if (this.allValuesAssigned(this.arguments[k])) {
        this.isCollapsed[k] = !this.isCollapsed[k];
      }
    } else {
      this.isCollapsed[k] = !this.isCollapsed[k];
    }
  }

  expandAll(): void {
    this.isCollapsed = this.isCollapsed.map(() => false);
  }

  collapseAll(): void {
    for (let k = 0; k < this.arguments.length; k++) {
      if (this.arguments[k].type == 'List') {
        if (this.preferences.listVariableCollapse) {
          if (this.allValuesAssigned(this.arguments[k])) {
            this.isCollapsed[k] = true;
          }
        } else {
          this.isCollapsed[k] = true;
        }
      }
    }
  }

  allValuesAssigned(listVariables): boolean {
    for (let actualListArr of listVariables.actualList) {
      for (let argument of actualListArr?.list) {
        if (!argument.value) {
          return false;
        }
      }
    }
    return true;
  }

  handlePaste(data) {
    if (!data || data.type) {
      data = this.storedArguments[0];
    }
    if (data && typeof data == 'string') {
      const clipboardDataArray = JSON.parse(data);
      if (!isArray(clipboardDataArray)) {
        return;
      }
      let tempArr = [];
      clipboardDataArray.forEach(clipboardItem => {
        let flag = true;

        if (this.variableList && this.variableList.length > 0) {
          this.variableList.forEach(variable => {
            if (variable.name === clipboardItem.name) {
              flag = false;
              if (typeof clipboardItem.value === 'string') {
                variable.value.default = clipboardItem.value;
              }
            }
          });
        }

        if (this.arguments && this.arguments.length > 0) {
          this.arguments.forEach(variable => {
            if (variable.name === clipboardItem.name) {
              flag = false;
              if (isArray(clipboardItem.value)) {
                clipboardItem.value.forEach((innerArray) => {
                  innerArray.forEach(item => {
                    variable.actualList.forEach((actualList) => {
                      actualList.list.forEach((argument) => {
                        if (argument.name === item.name) {
                          argument.value = item.value;
                        }
                      });
                    });
                  });
                });
              } else {
                variable.value = clipboardItem.value;
              }
            }
          });
        }
        if (flag) {
          clipboardItem.isTextField = true;
          tempArr.push(clipboardItem);
        }
      });

      if (tempArr.length > 0) {
        this.arguments = this.arguments.concat(tempArr);
      }
    }
  }

  checkClipboardContent() {
    this.storedArguments = sessionStorage.getItem('$SOS$copiedArgument') ? JSON.parse(sessionStorage.getItem('$SOS$copiedArgument')) : [];
    this.storedArguments = this.storedArguments.reverse();
    if (this.storedArguments.length > 0) {
      document.addEventListener('paste', this.handlePaste.bind(this));
    }
  }

  clearClipboard(): void {
    this.storedArguments = [];
    sessionStorage.removeItem('$SOS$copiedArgument');
  }

  private getPositions(): void {
    this.coreService.post('orders/add/positions', {
      controllerId: this.schedulerId,
      workflowId: {
        path: this.workflow.path,
        version: this.workflow.version
      }
    }).subscribe({
      next: (res) => {
        this.positions = new Map();
        res.positions.forEach((item) => {
          this.positions.set(item.positionString, (item.position));
        });

        this.blockPositions = new Map();
        this.blockPositionList = new Map();
        res.blockPositions.forEach((item) => {
          this.blockPositions.set(item.positionString, (item.position));
          this.blockPositionList.set(item.positionString, item.positions);
        });
      }, error: () => this.submitted = false
    });
  }

  updateVariableList(): void {
    if (this.workflow.orderPreparation && this.workflow.orderPreparation.parameters && !isEmpty(this.workflow.orderPreparation.parameters)) {
      this.variableList = Object.entries(this.workflow.orderPreparation.parameters).map(([k, v]) => {
        const val: any = v;
        if (val.type !== 'List') {
          if (!val.final) {
            let list;
            if (val.list) {
              list = [];
              val.list.forEach((item) => {
                let obj = {name: item}
                this.coreService.removeSlashToString(obj, 'name');
                list.push(obj);
              });
            }
            if (!val.default && val.default !== false && val.default !== 0) {
              this.arguments.push({
                name: k,
                type: val.type,
                isRequired: true,
                facet: val.facet,
                message: val.message,
                list: list
              });
            } else if (val.default) {
              if (val.type === 'String') {
                this.coreService.removeSlashToString(val, 'default');
              } else if (val.type === 'Boolean') {
                val.default = (val.default === 'true' || val.default === true);
              }
            }
          }
        } else {
          this.isForkList = true;
          const actualList = [];
          if (val.listParameters) {
            if (isArray(val.listParameters)) {
              val.listParameters.forEach((item) => {
                const obj = {name: item.name, type: item.value.type, value: item.value.default, isRequired: true};
                if (item.value.default || item.value.default == 0 || item.value.default == false) {
                  obj.isRequired = false;
                }
                item.isRequired = obj.isRequired;
                actualList.push(obj);
              });
            } else {
              val.listParameters = Object.entries(val.listParameters).map(([k1, v1]) => {
                const val1: any = v1;
                const obj = {name: k1, type: val1.type, value: val1.default, isRequired: true};
                if (val1.default || val1.default == 0 || val1.default == false) {
                  obj.isRequired = false;
                }
                val1.isRequired = obj.isRequired;
                actualList.push(obj);
                return {name: k1, value: val1};
              });
            }
            this.arguments.push({
              name: k,
              type: val.type,
              isRequired: true,
              actualList: [{list: actualList}],
              list: val.listParameters
            });
          }
        }
        return {name: k, value: val};
      });
      this.variableList = this.variableList.filter((item) => {
        return !item.value.final;
      });
    }
    this.updateSelectItems();
  }

  checkVariableType(argument): void {
    const obj = this.workflow.orderPreparation.parameters[argument.name];
    if (obj) {
      argument.type = obj.type;
      if (!obj.default && obj.default !== false && obj.default !== 0) {
        argument.isRequired = true;
      } else {
        if (obj.type === 'Boolean') {
          argument.value = (obj.default === true || obj.default === 'true');
        } else {
          argument.value = obj.default;
        }
      }
      if (obj.facet) {
        argument.facet = obj.facet;
        argument.message = obj.message;
      }
      if (obj.list) {
        argument.list = [];
        let isFound = false;
        obj.list.forEach((item) => {
          let obj = {name: item};
          if (argument.value === item) {
            isFound = true;
          }
          this.coreService.removeSlashToString(obj, 'name');
          argument.list.push(obj);
        });
        if (!isFound) {
          argument.list.push({name: argument.value, default: true});
        }
      }
    }
    this.updateSelectItems();
  }

  updateSelectItems(): void {
    for (let i = 0; i < this.variableList.length; i++) {
      this.variableList[i].isSelected = false;
      if(this.variableList[i].actualList?.length){
        this.variableList[i].isSelected = true;
      } else {
        for (let j = 0; j < this.arguments.length; j++) {
          if (this.variableList[i].name === this.arguments[j].name) {
            this.variableList[i].isSelected = true;
            break;
          }
        }
      }
    }
  }

  drop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.arguments, event.previousIndex, event.currentIndex);
  }

  selectTime(time, isEditor = false): void {
    this.coreService.selectTime(time, isEditor, this.order);
  }

  getNewPositions(positions): void {
    this.newPositions = undefined;
    if (positions) {
      this.newPositions = new Map();
      positions.forEach(item => {
        this.newPositions.set(item.positionString, (item.position));
      });
    }
  }

  onSubmit(): void {
    this.submitted = true;
    const obj: any = {
      controllerId: this.schedulerId,
      orders: []
    };

    const order: any = {
      workflowPath: this.workflow.path,
      orderName: this.order.orderId,
      forceJobAdmission: this.order.forceJobAdmission
    };
    if (this.order.at === 'now') {
      order.scheduledFor = 'now';
    } else if (this.order.at === 'never') {
      order.scheduledFor = 'never';
    } else if (this.order.at === 'later') {
      order.scheduledFor = 'now + ' + this.order.atTime;
    } else {
      if (this.order.fromDate) {
        this.coreService.getDateAndTime(this.order);
        order.scheduledFor = this.coreService.getDateByFormat(this.order.fromDate, null, 'YYYY-MM-DD HH:mm:ss');
        order.timeZone = this.order.timeZone;
      }
    }
    if (this.arguments.length > 0) {
      let argu = [...this.arguments];
      if (this.coreService.isLastEntryEmpty(argu, 'name', '')) {
        argu.splice(argu.length - 1, 1);
      }
      if (argu.length > 0) {
        order.arguments = this.coreService.keyValuePair(argu);
      }
    }
    if (this.arguments && this.arguments.length > 0) {
      if (!order.arguments) {
        order.arguments = {};
      }
      this.arguments.forEach((item) => {
        if(item.type === 'List') {
          order.arguments[item.name] = [];
          if (item.actualList?.length > 0) {
            for (const i in item.actualList) {
              const listObj = {};
              item.actualList[i].list.forEach((data) => {
                listObj[data.name] = data.value;
              });
              order.arguments[item.name].push(listObj);
            }
          }
        }
      });
    }
    if (this.order.blockPosition && this.blockPositions && this.blockPositions?.size) {
      if (this.blockPositions.has(this.order.blockPosition)) {
        order.blockPosition = (this.blockPositions.get(this.order.blockPosition));
      }
    }

    if (this.order.startPosition) {
      if (this.newPositions && this.newPositions?.size > -1) {
        if (this.newPositions.has(this.order.startPosition)) {
          order.startPosition = (this.newPositions.get(this.order.startPosition));
        }
      } else if (this.positions && this.positions?.size) {
        if (this.positions.has(this.order.startPosition)) {
          order.startPosition = (this.positions.get(this.order.startPosition));
        }
      }
    }

    if (this.order.endPositions && this.order.endPositions.length > 0) {
      order.endPositions = [];
      this.order.endPositions.forEach(pos => {
        if (this.newPositions && this.newPositions?.size > -1) {
          if (this.newPositions.has(pos)) {
            order.endPositions.push((this.newPositions.get(pos)));
          }
        } else if (this.positions && this.positions?.size) {
          if (this.positions.has(pos)) {
            order.endPositions.push((this.positions.get(pos)));
          }
        }
      });
    }
    obj.orders.push(order);
    obj.auditLog = {};
    this.coreService.getAuditLogObj(this.comments, obj.auditLog);
    this.coreService.post('orders/add', obj).subscribe({
      next: () => {
        this.activeModal.close('Done');
      }, error: () => this.submitted = false
    });
  }

  addVariableToList(data): void {
    const arr = [];
    data.list.forEach(item => {
      arr.push({name: item.name, type: item.value.type, value: (item.value.value || item.value.default), isRequired: (item.isRequired || item.value.isRequired)});
    });
    let flag = false;
    for (const i in data.actualList) {
      for (const j in data.actualList[i].list) {
        if (!data.actualList[i].list[j].value && data.actualList[i].list[j].value !== 0 && data.actualList[i].list[j].value !== false) {
          flag = true;
          break;
        }
      }
      if (flag) {
        break;
      }
    }
    if (!flag) {
      data.actualList.push({list: arr});
    }
  }

  addArgument(isNew = false): void {
    const param: any = {
      name: '',
      value: ''
    };
    if (this.arguments) {
      if (!this.coreService.isLastEntryEmpty(this.arguments, 'name', '')) {
        if (isNew) {
          param.isTextField = true;
        }
        this.arguments.push(param);
      }
    }
  }

  addArguments(): void {
    this.variableList.forEach(variable => {
      if (!variable.isSelected) {
        const param: any = {
          name: variable.name,
          value: ''
        };
        this.arguments.push(param);
        this.checkVariableType(param)
      }
    });
  }

  removeArgument(index): void {
    this.arguments.splice(index, 1);
    this.updateSelectItems();
  }

  removeVariableFromList(index, list): void {
    list.splice(index, 1);
  }

  onKeyPress($event): void {
    if ($event.which === '13' || $event.which === 13) {
      $event.preventDefault();
      this.addArgument();
    }
  }

  cancel(): void {
    this.activeModal.destroy();
  }

  openEditor(data): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: ValueEditorComponent,
      nzClassName: 'lg',
      nzAutofocus: null,
      nzData: {
        data: data.value,
        object: data
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        data.value = result;
        this.ref.detectChanges();
      }
    });
  }

  selectSchedule(name): void {
    this.object.orderName = '';
    for (let i in this.schedules) {
      if (this.schedules[i].name == name) {
        this.selectedSchedule = this.schedules[i];
        if (this.selectedSchedule.orderParameterisations && this.selectedSchedule.orderParameterisations.length == 1) {
          this.selectOrder(this.selectedSchedule.orderParameterisations[0].name || '-');
        }
        break;
      }
    }
  }

  selectVarFromSchedule(name, listVariables, data, index): void {
    listVariables.orderName = '';
    for (let i in this.schedules) {
      if (this.schedules[i].name == name) {
        listVariables.orderParameterisations = this.schedules[i].orderParameterisations;
        if (listVariables.orderParameterisations && listVariables.orderParameterisations.length == 1) {
          this.selectOrder(listVariables.orderParameterisations[0].name || '-', listVariables, data, index);
        }
        break;
      }
    }
  }

  private selectVarForOrder(name, listVariables, data, index): void {
    for (let i in listVariables.orderParameterisations) {
      if (listVariables.orderParameterisations[i].orderName == name ||
        (listVariables.orderParameterisations[i].orderName == '' && name == '-') || listVariables.orderParameterisations.length == 1) {
        let list = listVariables.orderParameterisations[i];
        for (let x in list.variables) {
          if (isArray(list.variables[x]) && x == data.name) {
            for (let z in data.actualList[index].list) {
              for (let m in list.variables[x]) {
                if (list.variables[x][m][data.actualList[index].list[z].name]) {
                  data.actualList[index].list[z].value = list.variables[x][m][data.actualList[index].list[z].name];
                }
              }
            }
          }
        }
        break;
      }
    }
  }

  selectOrder(name, listVariables?, data?, index?): void {
    if (listVariables) {
      this.selectVarForOrder(name, listVariables, data, index);
      return;
    }
    this.order.reload = false;
    if (name && name !== '-') {
      this.order.orderId = name;
    }

    for (let i in this.selectedSchedule.orderParameterisations) {
      if (this.selectedSchedule.orderParameterisations[i].orderName == name ||
        (this.selectedSchedule.orderParameterisations[i].orderName == '' && name == '-') || this.selectedSchedule.orderParameterisations.length == 1) {
        this.updateVariablesFromSchedule(this.selectedSchedule.orderParameterisations[i]);
        if (this.selectedSchedule.orderParameterisations[i].positions) {
          let newPositions;
          if (this.selectedSchedule.orderParameterisations[i].positions.blockPosition) {
            for (const [key, value] of this.blockPositions) {
              if (JSON.stringify(this.selectedSchedule.orderParameterisations[i].positions.blockPosition) === JSON.stringify(value)) {
                this.order.blockPosition = key;
                break;
              }
            }
            if (this.blockPositionList.has(this.selectedSchedule.orderParameterisations[i].positions.blockPosition) ||
              this.blockPositionList.has(this.order.blockPosition)) {
              newPositions = this.blockPositionList.get(this.selectedSchedule.orderParameterisations[i].positions.blockPosition) ||
                this.blockPositionList.get(this.order.blockPosition);
              if (newPositions && isArray(newPositions)) {
                this.selectedSchedule.orderParameterisations[i].positions.newPositions = new Map();
                newPositions.forEach((item) => {
                  this.selectedSchedule.orderParameterisations[i].positions.newPositions.set(item.positionString, (item.position));
                });
              }
            }
          }
          if (this.selectedSchedule.orderParameterisations[i].positions.startPosition) {
            this.order.startPosition = this.coreService.getPositionStr(this.selectedSchedule.orderParameterisations[i].positions.startPosition, newPositions, this.positions)
          }
          if (this.selectedSchedule.orderParameterisations[i].positions.endPositions && this.selectedSchedule.orderParameterisations[i].positions.endPositions.length > 0) {
            this.order.endPositions = [];
            this.selectedSchedule.orderParameterisations[i].positions.endPositions.forEach(pos => {
              this.order.endPositions.push(this.coreService.getPositionStr(pos, newPositions, this.positions));
            })
          }
          this.order.reload = true;
        }
        break;
      }
    }
  }

  private updateVariablesFromSchedule(orderParameterisations): void {
    this.arguments = [];
    if (this.workflow.orderPreparation && this.workflow.orderPreparation.parameters && !isEmpty(this.workflow.orderPreparation.parameters)) {
      this.variableList = Object.entries(this.workflow.orderPreparation.parameters).map(([k, v]) => {
        const val: any = v;
        if (val.type !== 'List') {
          if (!val.final) {
            let list;
            if (val.list) {
              list = [];
              val.list.forEach((item) => {
                let obj = {name: item}
                this.coreService.removeSlashToString(obj, 'name');
                list.push(obj);
              });
            }
            for (let x in orderParameterisations.variables) {
              if (k == x) {
                this.arguments.push({
                  name: k,
                  type: val.type,
                  isRequired: true,
                  facet: val.facet,
                  message: val.message,
                  value: orderParameterisations.variables[x],
                  list: list
                });
                break;
              }
            }
          }
        } else {

          const actualList = [];
          if (val.listParameters) {
            if (!isArray(val.listParameters)) {
              val.listParameters = Object.entries(val.listParameters).map(([k1, v1]) => {
                const val1: any = v1;
                return {name: k1, value: val1};
              });
            }

            for (let x in orderParameterisations.variables) {
              if (k === x) {
                if (isArray(orderParameterisations.variables[x])) {
                  orderParameterisations.variables[x].forEach((key) => {
                    let arr = [];
                    for (let y in val.listParameters) {
                      if (key[val.listParameters[y].name] || key[val.listParameters[y].name] == false || key[val.listParameters[y].name] == 0) {
                        arr.push({
                          name: val.listParameters[y].name,
                          type: val.listParameters[y].value.type,
                          value: key[val.listParameters[y].name]
                        });
                      }
                    }
                    if (arr.length > 0) {
                      actualList.push({list: arr});
                    }
                  });
                }
              }
            }
            if (actualList.length === 0) {
              let arr = [];
              val.listParameters.forEach((item) => {
                arr.push({name: item.name, type: item.value.type});
              });
              if (arr.length > 0) {
                actualList.push({list: arr});
              }
            }

            for (let x in orderParameterisations.variables) {
              if (k == x) {
                this.arguments.push({
                  name: k,
                  isRequired: true,
                  type: val.type,
                  actualList,
                  list: val.listParameters
                });
                break;
              }
            }
          }
        }
        return {name: k, value: val};
      });
      this.variableList = this.variableList.filter((item) => {
        return !item.value.final;
      });
    } else {
      for (let x in orderParameterisations.variables) {
        this.arguments.push({
          name: x,
          isTextField: true,
          value: orderParameterisations.variables[x]
        });
      }
    }
    this.updateSelectItems();

  }

  assignParameterizationFromSchedules(): void {
    if (!this.schedules) {
      this.coreService.post('workflow/order_templates', {
        controllerId: this.schedulerId,
        workflowPath: this.workflow.path
      }).subscribe({
        next: (res) => {
          this.schedules = res.schedules;
        }
      });
    }
  }

}

@Component({
  selector: 'app-workflow-action',
  templateUrl: './workflow-action.component.html'
})
export class WorkflowActionComponent {
  @Input() workflow: any;
  @Input() preferences: any;
  @Input() permission: any;
  @Input() schedulerId: any;
  @Input() isDisabled: boolean;
  @Output() isChanged: EventEmitter<any> = new EventEmitter();

  constructor(public modal: NzModalService, public coreService: CoreService, private router: Router) {
  }

  navToDetailView(view): void {
    this.coreService.getWorkflowDetailTab().pageView = view;
    this.router.navigate(['/workflows/workflow_detail', this.workflow.path, this.workflow.versionId]).then();
  }

  transitionOrders(workflow): void {
    let obj: any = {
      controllerId: this.schedulerId,
      workflowId: {
        path: workflow.path,
        versionId: workflow.versionId
      }
    };
    if (this.preferences.auditLog) {
      let comments: any = {
        radio: 'predefined',
        type: 'Workflow',
        operation: 'Transition Orders',
        name: workflow.path
      };
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzClassName: 'lg',
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
          obj.auditLog = {
            comment: comments.comment,
            ticketLink: comments.ticketLink,
            timeSpent: comments.timeSpent,
          };
          this.isChanged.emit({flag: true});
          this.coreService.post('workflow/transition', obj).subscribe({
            next: () => {
              this.resetAction();
            }, error: () => this.isChanged.emit({flag: false})
          });
        }
      });
    } else {
      this.isChanged.emit({flag: true});
      this.coreService.post('workflow/transition', obj).subscribe({
        next: () => {
          this.resetAction();
        }, error: () => this.isChanged.emit({flag: false})
      });
    }
  }

  suspend(workflow, paths?, cb?): void {
    this.suspendResumeOperation('Suspend', workflow, paths, cb);
  }

  resume(workflow, paths?, cb?): void {
    this.suspendResumeOperation('Resume', workflow, paths, cb);
  }

  private suspendResumeOperation(type, workflow, paths?, cb?) {
    let obj: any = {
      controllerId: this.schedulerId,
    };
    if (workflow || typeof paths != 'boolean') {
      obj.workflowPaths = workflow ? [workflow.path] : paths;
    } else {
      obj.all = true;
    }
    if (this.preferences.auditLog) {
      let comments = {
        radio: 'predefined',
        type: 'Workflow',
        operation: type,
        name: workflow ? workflow.path : (typeof paths != 'boolean') ? paths.join(',') : 'All'
      };
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzClassName: 'lg',
        nzData: {
          comments,
          obj,
          url: 'workflows/' + (type === 'Resume' ? 'resume' : 'suspend')
        },
        nzFooter: null,
        nzAutofocus: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          this.isChanged.emit({flag: true});
          this.resetAction();
          if (cb) {
            cb();
          }
        }
      });
    } else if (paths != true) {
      this.resetCall(type, cb, obj);
    } else {
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: ConfirmModalComponent,
        nzData: {
          title2: type === 'Resume' ? 'resumeAll' : 'suspendAll',
          message2: type === 'Resume' ? 'resumeAllWarning' : 'suspendAllWarning'
        },
        nzFooter: null,
        nzAutofocus: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe((result) => {
        if (result) {
          this.resetCall(type, cb, obj);
        }
      });
    }
  }

  private resetCall(type, cb, obj): void {
    this.isChanged.emit({flag: true});
    this.coreService.post('workflows/' + (type === 'Resume' ? 'resume' : 'suspend'), obj).subscribe({
      next: () => {
        this.resetAction();
        if (cb) {
          cb();
        }
      }, error: () => this.isChanged.emit({flag: false})
    });
  }

  addOrder(workflow): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: AddOrderModalComponent,
      nzClassName: 'lg',
      nzAutofocus: null,
      nzData: {
        preferences: this.preferences,
        permission: this.permission,
        schedulerId: this.schedulerId,
        workflow
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.isChanged.emit({flag: true, isOrderAdded: workflow});
        this.resetAction();
      }
    });
  }

  private resetAction(): void {
    setTimeout(() => {
      this.isChanged.emit({flag: false});
    }, 5000);
  }

  showDependency(workflow): void {
    this.openModal(workflow);
  }

  private openModal(workflow): void {
    this.modal.create({
      nzTitle: undefined,
      nzContent: ShowDependencyComponent,
      nzClassName: 'lg',
      nzData: {
        workflow,
        schedulerId: this.schedulerId
      },
      nzFooter: null,
      nzAutofocus: null,
      nzClosable: false,
      nzMaskClosable: false
    });
  }
}
