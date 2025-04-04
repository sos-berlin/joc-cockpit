import {ChangeDetectorRef, Component, ElementRef, EventEmitter, inject, Input, Output, ViewChild} from '@angular/core';
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
import {EncryptArgumentModalComponent} from '../../configuration/inventory/inventory.component';
import {NgModel} from "@angular/forms";

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

  constructor(public coreService: CoreService, private activeModal: NzModalRef, private authService: AuthService) {
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

  orders: any[] = [{}];
  arguments: any[][] = [[]];
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
  isCollapsed: any[] = [];
  displayModal = false;
  tag: any;
  tags = [];
  allTags = [];
  filteredOptions: string[] = [];
  inputVisible = false;
  isUnique = true;
  inputValue = '';
  allowEmptyArguments: any;
  argumentsValid: boolean = true;
  commonStartTime: string = 'now';
  commonStartTimeValue: any = '';
  commonStartDate: any = {fromDate: null, fromTime: null, timeZone: null};
  isAssignedFromSchedule: boolean = false;
  planIds: any;
  @ViewChild('inputElement', {static: false}) inputElement?: ElementRef;

  constructor(public coreService: CoreService, private activeModal: NzModalRef,
              private modal: NzModalService, private ref: ChangeDetectorRef, private workflowService: WorkflowService, private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.schedulerId = this.modalData.schedulerId;
    this.permission = this.modalData.permission;
    this.preferences = this.modalData.preferences;
    this.workflow = this.modalData.workflow;
    this.allowEmptyArguments = sessionStorage['allowEmptyArguments'] === 'true';
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
    this.zones = this.coreService.getTimeZoneList();
    this.display = this.preferences.auditLog;
    this.comments.radio = 'predefined';

    if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
      this.required = true;
      this.display = true;
    }

    this.orders = [{
      orderId: '',
      timeZone: this.preferences.zone,
      at: 'now',
      forceJobAdmission: false,
      tags: [],
      arguments: [],
      startPosition: '',
      endPositions: [],
      blockPosition: '',
      reload: false,
      planId: {
        planSchemaId: 'DailyPlan',
        noticeSpaceKey: ''
      },
      openClosedPlan: false
    }];

    this.orders[0].timeZone = this.preferences.zone;
    this.commonStartDate.timeZone = this.preferences.zone;
    this.orders[0].at = 'now';

    if (!this.workflow.configuration) {
      this.workflow.configuration = this.coreService.clone(this.workflow);
      this.workflowService.convertTryToRetry(this.workflow.configuration, null, {}, {count: 0});
    }
    this.loadPlanIds()
    this.fetchTags();
    this.getPositions();
    this.updateVariableList(0);
    this.checkClipboardContent();
    this.initializeOrders();
    if (this.modalData.order) {
      this.orders[0].at = 'date';
      if (this.modalData.order.scheduledFor && typeof this.modalData.order.scheduledFor === 'number') {
        // this.orders[0].fromDate = this.coreService.convertTimeToLocalTZ(this.preferences, new Date(this.modalData.order.scheduledFor));
        this.orders[0].fromTime1 = this.coreService.convertTimeToLocalTZ(this.preferences, new Date(this.modalData.order.scheduledFor));
        this.orders[0].fromTime = this.coreService.getDateByFormat(new Date(this.modalData.order.scheduledFor), null, 'HH:mm:ss');
        this.orders[0].fromDate = new Date(this.modalData.order.scheduledFor);
      }

    }
    this.initializeArguments(this.orders[0]);
    this.isCollapsed = this.orders.map(order => order.arguments.map(() => false));
  }

  initializeOrders(): void {
    this.orders.forEach(order => {
      order.tags = [];
      order.inputVisible = false;
      order.inputValue = '';
      order.filteredOptions = [];
    });
  }


  removeOrder(orderIndex: number): void {
    if (this.orders.length > 1) {
      this.orders.splice(orderIndex, 1);
      this.isCollapsed.splice(orderIndex, 1);
      this.updateVariableList();
    }
  }


  ngAfterViewInit(): void {
    setTimeout(() => {
      this.displayModal = true;
    }, 100);
  }

  initializeArguments(order: any): void {
    if (this.modalData.order) {
      let _arguments: any = this.coreService.convertObjectToArray(this.modalData.order, 'arguments');
      if (_arguments && _arguments.length > 0) {
        _arguments.forEach(argu => {
          for (let i in this.variableList) {
            if (argu.name == this.variableList[i].name) {
              if (Array.isArray(argu.value)) {
                if (argu.type === 'List') {
                  // Handle List Type
                  argu.value.forEach((listItem) => {
                    Object.entries(listItem).forEach(([key, value]) => {
                      this.variableList[i].value.actualList.forEach((variable) => {
                        if (key === variable.name) {
                          variable.value = value;
                        }
                      });
                    });
                  });
                  order.arguments.push({
                    name: argu.name,
                    type: argu.type,
                    isRequired: true,
                    actualList: [{list: this.variableList[i].value.actualList}],
                    list: this.variableList[i].value.listParameters
                  });
                } else if (argu.type === 'Map') {
                  // Handle Map Type
                  argu.value.forEach((mapItem) => {
                    Object.entries(mapItem).forEach(([key, value]) => {
                      this.variableList[i].value.actualMap.forEach((variable) => {
                        if (key === variable.name) {
                          variable.value = value;
                        }
                      });
                    });
                  });
                  order.arguments.push({
                    name: argu.name,
                    type: argu.type,
                    isRequired: true,
                    actualMap: [{map: this.variableList[i].value.actualMap}],
                    map: this.variableList[i].value.listParameters
                  });
                }
              } else {
                // Handling normal types (e.g., String, Number, Boolean)
                if (argu.type !== 'List' && argu.type !== 'Map') {
                  order.arguments.push({
                    name: argu.name,
                    value: argu.value,
                    type: this.variableList[i].value.type,
                    isRequired: true,
                    facet: this.variableList[i].value.facet,
                    message: this.variableList[i].value.message,
                    list: this.variableList[i].value.list,
                    map: this.variableList[i].value.map
                  });
                }
              }
              break;
            }
          }
        });
      }
    }
  }


  toggleCollapse(k: number, selectedOrderIndex: number): void {
    if (!this.isCollapsed[selectedOrderIndex]) {
      this.isCollapsed[selectedOrderIndex] = [];
    }

    if (this.preferences.listVariableCollapse) {
      if (this.allValuesAssigned(this.orders[selectedOrderIndex].arguments[k])) {
        this.isCollapsed[selectedOrderIndex][k] = !this.isCollapsed[selectedOrderIndex][k];
      }
    } else {
      this.isCollapsed[selectedOrderIndex][k] = !this.isCollapsed[selectedOrderIndex][k];
    }
  }


  expandAll(orderIndex: number): void {
    if (!this.isCollapsed[orderIndex]) {
      this.isCollapsed[orderIndex] = [];
    }
    this.isCollapsed[orderIndex] = this.orders[orderIndex].arguments.map(() => false);
  }

  collapseAll(orderIndex: number): void {
    const orderArgs = this.orders[orderIndex].arguments;

    if (!this.isCollapsed[orderIndex]) {
      this.isCollapsed[orderIndex] = [];
    }

    this.isCollapsed[orderIndex] = orderArgs.map((arg) => {
      if (arg.type === 'List' || arg.type === 'Map') {
        if (this.preferences.listVariableCollapse) {
          return !this.allValuesAssigned(arg);
        }
        return true;
      }
      return false;
    });
  }


  allValuesAssigned(listVariables): boolean {
    if (listVariables.type === 'List') {
      for (let actualListArr of listVariables.actualList) {
        for (let argument of actualListArr?.list) {
          if (!argument.value) {
            return false;
          }
        }
      }
    } else if (listVariables.type === 'Map') {
      for (let actualMapArr of listVariables.actualMap) {
        for (let argument of actualMapArr?.map) {
          if (!argument.value) {
            return false;
          }
        }
      }
    }
    return true;
  }

  handlePaste(data, orderIndex: number): void {
    if (!data || data.type) {
      data = this.storedArguments[0];
    }

    if (data && typeof data === 'string') {
      const clipboardData = JSON.parse(data);
      if (Array.isArray(clipboardData)) {
        clipboardData.forEach(clipboardItem => {
          this.updateArguments(clipboardItem, orderIndex);
        });
      } else {
        this.updateArguments(clipboardData, orderIndex);
      }
    }
  }


  updateArguments(clipboardItem: any, orderIndex: number): void {
    const orderArgs = this.orders[orderIndex].arguments;
    if (orderArgs && orderArgs.length > 0) {
      orderArgs.forEach(variable => {
        if (variable.name === clipboardItem.name) {
          if (Array.isArray(clipboardItem.value)) {
            clipboardItem.value.forEach(innerArray => {
              if (Array.isArray(innerArray)) {
                innerArray.forEach(item => {
                  this.updateVariable(variable, item);
                });
              } else if (typeof innerArray === 'object') {
                this.updateVariable(variable, innerArray);
              }
            });
          } else if (typeof clipboardItem.value === 'object') {
            if (clipboardItem.value.listParameters && Array.isArray(clipboardItem.value.listParameters)) {
              clipboardItem.value.listParameters.forEach(item => {
                this.updateVariable(variable, item);
              });
            } else {
              variable.value = clipboardItem.value;
            }
          } else {
            variable.value = clipboardItem.value;
          }
        } else {
          if (clipboardItem.variables && Array.isArray(clipboardItem.variables)) {
            clipboardItem.variables.forEach(variable => {
              this.updateArguments(variable, orderIndex);
            });
          }
        }
      });
    }
  }

  processVariableList(variableList, clipboardDataVariables) {
    variableList.forEach(clipboardItem => {
      if (clipboardDataVariables && clipboardDataVariables.length > 0) {
        clipboardDataVariables.forEach(variable => {
          if (variable.name === clipboardItem.name && variable.isSelected) {
            if (Array.isArray(clipboardItem.value)) {
              clipboardItem.value.forEach(innerArray => {
                if (Array.isArray(innerArray)) {
                  innerArray.forEach(item => {
                    this.updateVariable(variable, item);
                  });
                } else if (typeof innerArray === 'object') {
                  this.updateVariable(variable, innerArray);
                }
              });
            } else if (typeof clipboardItem.value === 'object') {
              if (clipboardItem.value.listParameters && Array.isArray(clipboardItem.value.listParameters)) {
                clipboardItem.value.listParameters.forEach(item => {
                  this.updateVariable(variable, item);
                });
              } else {
                variable.value = clipboardItem.value;
              }
            } else {
              variable.value = clipboardItem.value;
            }
          }
        });
      }
    });
  }

  updateVariable(variable, item) {
    if (variable.actualList) {
      variable.actualList.forEach(actualList => {
        actualList.list.forEach(argument => {
          if (argument.name === item.name) {
            argument.value = item.value.default || item.value;
          }
        });
      });
    } else if (variable.actualMap) {
      variable.actualMap.forEach(actualMap => {
        actualMap.map.forEach(argument => {
          if (argument.name === item.name) {
            argument.value = item.value.default || item.value;
          }
        });
      });
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

        this.orders.forEach(order => {
          order.endPositions = [];
          if (this.modalData.order) {
            order.blockPosition = this.modalData.order.blockPosition;
          }
        });

        // Map positions
        res.positions.forEach((item) => {
          this.positions.set(item.positionString, item.position);
          this.orders.forEach(order => {
            if (this.modalData.order && this.modalData.order.endPositions) {
              for (let i in this.modalData.order.endPositions) {
                if (JSON.stringify(this.modalData.order.endPositions[i]) === JSON.stringify(item.position)) {
                  order.endPositions.push(item.positionString);
                  break;
                }
              }
            }
          });
        });

        // Initialize block positions
        this.blockPositions = new Map();
        this.blockPositionList = new Map();
        res.blockPositions.forEach((item) => {
          this.blockPositions.set(item.positionString, item.position);
          this.blockPositionList.set(item.positionString, item.positions);
        });

      },
      error: () => this.submitted = false
    });
  }


  updateVariableList(orderIndex?: number): void {
    if (this.workflow.orderPreparation && this.workflow.orderPreparation.parameters && !isEmpty(this.workflow.orderPreparation.parameters)) {
      this.variableList = Object.entries(this.workflow.orderPreparation.parameters).map(([k, v]) => {
        const val: any = v;
        if (val.type !== 'List' && val.type !== 'Map') {
          if (!val.final) {
            let list;
            if (val.list) {
              list = [];
              val.list.forEach((item) => {
                let obj = {name: item};
                this.coreService.removeSlashToString(obj, 'name');
                list.push(obj);
              });
            }

            if (!val.default && val.default !== false && val.default !== 0) {
              if (!this.modalData.order && orderIndex !== undefined) {
                this.orders[orderIndex].arguments.push({
                  name: k,
                  type: val.type,
                  isRequired: true,
                  facet: val.facet,
                  message: val.message,
                  list: list
                });
              }
            } else if (val.default) {
              if (val.type === 'String' && val.default != "\"\"") {
                this.coreService.removeSlashToString(val, 'default');
              } else if (val.type === 'Boolean') {
                val.default = (val.default === 'true' || val.default === true);
              }
            }
            if (this.modalData.order) {
              val.list = list;
            }
          }
        } else if (val.type === 'List') {
          this.isForkList = true;
          const actualList = [];
          if (val.listParameters) {
            if (Array.isArray(val.listParameters)) {
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
            // Update arguments for the specific order index
            if (!this.modalData.order && orderIndex !== undefined) {
              this.orders[orderIndex].arguments.push({
                name: k,
                type: val.type,
                isRequired: true,
                actualList: [{list: actualList}],
                list: val.listParameters
              });
            } else {
              val.actualList = actualList;
            }
          }
        } else if (val.type === 'Map') {
          const actualMap = [];
          if (val.listParameters) {
            if (Array.isArray(val.listParameters)) {
              val.listParameters.forEach((item) => {
                const obj = {name: item.name, type: item.value.type, value: item.value.default, isRequired: true};
                if (item.value.default || item.value.default == 0 || item.value.default == false) {
                  obj.isRequired = false;
                }
                item.isRequired = obj.isRequired;
                actualMap.push(obj);
              });
            } else {
              val.listParameters = Object.entries(val.listParameters).map(([k1, v1]) => {
                const val1: any = v1;
                const obj = {name: k1, type: val1.type, value: val1.default, isRequired: true};
                if (val1.default || val1.default == 0 || val1.default == false) {
                  obj.isRequired = false;
                }
                val1.isRequired = obj.isRequired;
                actualMap.push(obj);
                return {name: k1, value: val1};
              });
            }

            if (!this.modalData.order && orderIndex !== undefined) {
              this.orders[orderIndex].arguments.push({
                name: k,
                type: val.type,
                isRequired: true,
                actualMap: [{map: actualMap}],
                map: val.listParameters
              });
            } else {
              val.actualMap = actualMap;
            }
          }
        }
        return {name: k, value: val};
      });
      this.variableList = this.variableList.filter((item) => {
        return !item.value.final;
      });
    }
    this.updateSelectItems(orderIndex);
  }


  checkVariableType(argument, orderIndex: number): void {
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
    this.updateSelectItems(orderIndex);
  }


  updateSelectItems(orderIndex?: number): void {
    for (let i = 0; i < this.variableList.length; i++) {
      this.variableList[i].isSelected = false;
      if (this.variableList[i].actualList?.length) {
        this.variableList[i].isSelected = true;
      } else {
        for (let j = 0; j < this.orders[orderIndex]?.arguments?.length; j++) {
          if (this.variableList[i].name === this.orders[orderIndex]?.arguments[j].name) {
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

  // selectTime(time, isEditor = false): void {
  //   this.coreService.selectTime(time, isEditor, this.order);
  // }

  getNewPositions(positions: any, index: number): void {
    // Reset newPositions for the specific index
    this.newPositions = undefined;

    if (positions) {
      this.newPositions = new Map();
      positions.forEach(item => {
        this.newPositions.set(item.positionString, item.position);
      });

      this.updatePositionsForIndex(index);
    }
  }

  private updatePositionsForIndex(index: number): void {
    if (this.orders && this.orders[index]) {
      if (this.newPositions) {
        this.orders[index].positions = Array.from(this.newPositions.values());
      } else {
        this.orders[index].positions = [];
      }
    } else {
      console.error(`Order at index ${index} does not exist.`);
    }
  }

  selectedOrderIndex: number = 0;

  setSelectedOrderIndex(index: number): void {
    this.selectedOrderIndex = index;
  }

  async onSubmit(): Promise<void> {
    await this.checkPlanIds(this.orders); // wait for modal to resolve

    this.submitted = true;;

    const allRequests = this.orders.map((order, index) => {
      const orderObj: any = {
        workflowPath: this.workflow.path,
        orderName: order.orderId,
        forceJobAdmission: order.forceJobAdmission,
        tags: order.tags || this.tags,
        arguments: {}
      };
      if (order?.planId?.noticeSpaceKey) {
        orderObj.planId = order.planId
      }
      if (order.openClosedPlan) {
        orderObj.openClosedPlan = order.openClosedPlan
      }
      if (this.orders.length > 1) {
        if (this.commonStartTime === 'now' || this.commonStartTime === 'never') {
          orderObj.scheduledFor = this.commonStartTime;
        } else if (this.commonStartTime === 'later') {
          let atTime = this.commonStartTimeValue
          if (atTime.includes('h') || atTime.includes('m') || atTime.includes('s')) {
            atTime = this.convertToSeconds(atTime);
          }
          orderObj.scheduledFor = 'now + ' + atTime;
        } else if (this.commonStartTime === 'date') {
          this.coreService.getDateAndTime(this.commonStartDate);
          orderObj.scheduledFor = this.coreService.getDateByFormat(this.commonStartDate.fromDate, null, 'YYYY-MM-DD HH:mm:ss');
          orderObj.timeZone = this.commonStartDate.timeZone;
        }
      } else {
        if (order.at === 'now' || order.at === 'never') {
          orderObj.scheduledFor = order.at;
        } else if (order.at === 'later') {
          let atTime = order.atTime
          if (atTime.includes('h') || atTime.includes('m') || atTime.includes('s')) {
            atTime = this.convertToSeconds(atTime);
          }
          orderObj.scheduledFor = 'now + ' + atTime;
        } else if (order.at === 'date') {
          this.coreService.getDateAndTime(order);
          orderObj.scheduledFor = this.coreService.getDateByFormat(order.fromDate, null, 'YYYY-MM-DD HH:mm:ss');
          orderObj.timeZone = order.timeZone;
        }
      }

      // **Argument Processing**
      if (order.arguments && order.arguments.length > 0) {
        order.arguments.forEach(arg => {
          if (arg.type === 'List') {
            orderObj.arguments[arg.name] = [];
            if (arg.actualList?.length > 0) {
              arg.actualList.forEach(listItem => {
                const listObj = {};
                listItem.list.forEach(data => {
                  listObj[data.name] = data.value;
                });
                orderObj.arguments[arg.name].push(listObj);
              });
            }
          } else if (arg.type === 'Map') {
            const mapObj = {};
            if (arg.actualMap?.length > 0) {
              arg.actualMap.forEach(mapItem => {
                mapItem.map.forEach(data => {
                  mapObj[data.name] = data.value;
                });
              });
            }
            orderObj.arguments[arg.name] = mapObj;
          } else {
            orderObj.arguments[arg.name] = arg.value;
          }
        });
      }

      // Handle positions
      if (order.blockPosition && this.blockPositions?.size) {
        if (this.blockPositions.has(order.blockPosition)) {
          orderObj.blockPosition = this.blockPositions.get(order.blockPosition);
        }
      }

      if (order.startPosition) {
        if (this.newPositions && this.newPositions?.size > 0) {
          if (this.newPositions.has(order.startPosition)) {
            orderObj.startPosition = this.newPositions.get(order.startPosition);
          }
        } else if (this.positions && this.positions?.size > 0) {
          if (this.positions.has(order.startPosition)) {
            orderObj.startPosition = this.positions.get(order.startPosition);
          }
        }
      }

      if (order.endPositions && order.endPositions.length > 0) {
        orderObj.endPositions = [];
        order.endPositions.forEach(pos => {
          if (this.newPositions && this.newPositions?.size > 0) {
            if (this.newPositions.has(pos)) {
              orderObj.endPositions.push(this.newPositions.get(pos));
            }
          } else if (this.positions && this.positions?.size > 0) {
            if (this.positions.has(pos)) {
              orderObj.endPositions.push(this.positions.get(pos));
            }
          }
        });
      }


      const reqObj = {
        controllerId: this.schedulerId,
        orders: [orderObj],
        auditLog: {}
      };

      this.coreService.getAuditLogObj(this.comments, reqObj.auditLog);

      return this.coreService.post('orders/add', reqObj).toPromise();
    });

    Promise.all(allRequests)
      .then(() => {
        this.activeModal.close('Done');
      })
      .catch(() => {
        this.submitted = false;
      });
  }


  convertToSeconds(timeString: string): number {
    const timePattern = /(\d+)\s*h|\s*(\d+)\s*m|\s*(\d+)\s*s/g;
    let totalSeconds = 0;

    let match;
    while ((match = timePattern.exec(timeString)) !== null) {
      if (match[1]) {
        totalSeconds += parseInt(match[1], 10) * 3600; // Convert hours to seconds
      }
      if (match[2]) {
        totalSeconds += parseInt(match[2], 10) * 60; // Convert minutes to seconds
      }
      if (match[3]) {
        totalSeconds += parseInt(match[3], 10); // Seconds
      }
    }

    return totalSeconds;
  }

  addOrder(): void {
    const newOrder = {
      orderId: '',
      timeZone: this.preferences.zone,
      at: 'now',
      forceJobAdmission: false,
      tags: [],
      arguments: [],
      startPosition: '',
      endPositions: [],
      blockPosition: '',
      reload: false,
      planId: {
        planSchemaId: 'DailyPlan',
        noticeSpaceKey: ''
      },
      openClosedPlan: false
    };

    const newOrderIndex = this.orders.length;
    this.orders.push(newOrder);

    this.updateVariableList(newOrderIndex);

    this.initializeArguments(this.orders[newOrderIndex]);
    this.isCollapsed = this.orders.map(order => order.arguments.map(() => false));
  }

  addSchedules(): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: AddSchedulesModalComponent,
      nzClassName: 'sm',
      nzAutofocus: null,
      nzData: {
        preferences: this.preferences,
        permission: this.permission,
        schedulerId: this.schedulerId,
        workflowPath: this.workflow.path,
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.createOrdersFromAllSchedules(result)
      }
    });
  }

  createOrdersFromAllSchedules(selectedScheduleNames: string[]): void {
    this.coreService.post('workflow/order_templates', {
      controllerId: this.schedulerId,
      workflowPath: this.workflow.path
    }).subscribe({
      next: (res) => {
        const schedules = res.schedules;
        if (schedules && schedules.length > 0) {
          this.orders = [];

          const filteredSchedules = schedules.filter(schedule =>
            selectedScheduleNames.includes(schedule.name)
          );

          filteredSchedules.forEach((schedule) => {
            schedule.orderParameterisations.forEach((parameterisation) => {
              const newOrder = {
                orderId: parameterisation.orderName,
                timeZone: this.preferences.zone,
                at: 'now',
                forceJobAdmission: parameterisation?.forceJobAdmission || false,
                tags: parameterisation?.tags || [],
                arguments: [],
                startPosition: '',
                endPositions: [],
                blockPosition: '',
                reload: false,
                planId: {
                  planSchemaId: 'DailyPlan',
                  noticeSpaceKey: ''
                },
                openClosedPlan: false,
                selectedSchedule: schedule,
                orderName: parameterisation.orderName
              };

              if (parameterisation?.positions) {
                const param = parameterisation.positions;
                let newPositions;

                if (param.blockPosition) {
                  for (const [key, value] of this.blockPositions) {
                    if (JSON.stringify(param.blockPosition) === JSON.stringify(value)) {
                      newOrder.blockPosition = key;
                      break;
                    }
                  }

                  if (this.blockPositionList.has(param.blockPosition)) {
                    newPositions = this.blockPositionList.get(param.blockPosition);
                    if (newPositions && Array.isArray(newPositions)) {
                      param.newPositions = new Map();
                      newPositions.forEach((item) => {
                        param.newPositions.set(item.positionString, item.position);
                      });
                    }
                  }
                }

                if (param.startPosition) {
                  newOrder.startPosition = this.coreService.getPositionStr(param.startPosition, newPositions, this.positions);
                }

                if (param.endPositions && param.endPositions.length > 0) {
                  newOrder.endPositions = [];
                  param.endPositions.forEach(pos => {
                    newOrder.endPositions.push(this.coreService.getPositionStr(pos, newPositions, this.positions));
                  });
                }

                if (param.forceJobAdmission) {
                  newOrder.forceJobAdmission = param.forceJobAdmission;
                }

                if (param.tags && param.tags.length > 0) {
                  newOrder.tags = param.tags;
                }

                newOrder.reload = true;
              }

              this.updateVariablesForOrderParameterisations(parameterisation, newOrder);
              this.orders.push(newOrder);
              this.initializeArguments(newOrder);
              this.isCollapsed.push(newOrder.arguments.map(() => false));
            });


            if (schedule.orderParameterisations) {
              const firstParam = schedule.orderParameterisations[0];
              if (firstParam) {
                this.updateVariablesFromSchedule(firstParam, this.orders.length - 1);
              }
            }
          });

          if (this.orders.length > 1) {
            this.commonStartTime = 'now';
            this.onCommonTimeChange(this.commonStartTime);
          }
        }
      },
      error: (err) => {
        console.error('Error fetching schedules:', err);
      }
    });
  }


  areArgumentsEmpty(): boolean {
    const allowEmptyArguments = this.allowEmptyArguments;

    if (allowEmptyArguments) return false;

    for (const order of this.orders) {
      const orderArgs = order.arguments;

      let anyListEmpty = orderArgs.some(arg =>
        arg.type === 'List' &&
        (!arg.actualList || arg.actualList.some(listItem => listItem.list.some(item => !item.value)))
      );
      let anyMapEmpty = orderArgs.some(arg =>
        arg.type === 'Map' &&
        (!arg.actualMap || arg.actualMap.some(mapItem => mapItem.map.some(item => !item.value)))
      );

      let anyStringEmpty = orderArgs.some(arg =>
        arg.type === 'String' && (!arg.value)
      );

      let anyNumberEmpty = orderArgs.some(arg =>
        arg.type === 'Number' && (!arg.value)
      );

      if (anyListEmpty || anyMapEmpty || anyStringEmpty || anyNumberEmpty) {
        this.argumentsValid = false;
        return true;
      }
    }

    this.argumentsValid = true;
    return false;
  }


  addVariableToList(data): void {
    const arr = [];
    data.list.forEach(item => {
      arr.push({
        name: item.name,
        type: item.value.type,
        value: (item.value.value || item.value.default),
        isRequired: (item.isRequired || item.value.isRequired)
      });
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

  addArgument(orderIndex, isNew = false): void {
    const param: any = {
      name: '',
      value: ''
    };
    if (this.orders[orderIndex].arguments) {
      const lastArgument = this.orders[orderIndex].arguments[this.orders[orderIndex].arguments.length - 1];

      if (!this.coreService.isLastEntryEmpty(this.orders[orderIndex].arguments, 'name', '') || !lastArgument) {
        if (isNew) {
          param.isTextField = true;
        }
        this.orders[orderIndex].arguments.push(param);
      } else if (lastArgument && (lastArgument.type === 'Map' || lastArgument.type === 'List')) {

        this.orders[orderIndex].arguments.push(param);
      }
    }
  }

  addArguments(orderIndex): void {
    this.orders[orderIndex].arguments = this.orders[orderIndex].arguments.filter(arg => arg.name.trim() !== '');
    this.variableList.forEach(variable => {
      if (!variable.isSelected) {
        const param: any = {
          name: variable.name,
          value: ''
        };
        this.orders[orderIndex].arguments.push(param);
        this.checkVariableType(param, orderIndex);
      } else {
        if (this.orders[orderIndex].arguments.length < this.variableList.length) {
          const param: any = {
            name: variable.name,
            value: ''
          };
          this.orders[orderIndex].arguments.push(param);
          this.checkVariableType(param, orderIndex);
        }
      }
    });
  }

  removeArgument(index, orderIndex): void {
    this.orders[orderIndex].arguments.splice(index, 1);
    this.updateSelectItems(orderIndex);
  }


  removeVariableFromList(index, list): void {
    list.splice(index, 1);
  }

  onKeyPress($event, orderIndex: number): void {
    if ($event.which === 13) {
      $event.preventDefault();
      this.addArgument(orderIndex);
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

  selectSchedule(name: string, orderIndex: number): void {
    this.orders[orderIndex].orderName = '';

    for (let i in this.schedules) {
      if (this.schedules[i].name == name) {
        this.orders[orderIndex].selectedSchedule = this.schedules[i];

        if (this.orders[orderIndex].selectedSchedule.orderParameterisations &&
          this.orders[orderIndex].selectedSchedule.orderParameterisations.length == 1) {
          this.selectOrder(this.orders[orderIndex].selectedSchedule.orderParameterisations[0].orderName || '-', null, null, null, orderIndex);
        }
        break;
      }
    }
  }


  selectVarFromSchedule(name: string, variableContext: any, listVariables: any, index: number, orderIndex: number): void {
    variableContext.orderName = ''; // Reset the order name for the specific context
    for (let schedule of this.schedules) {
      if (schedule.name === name) {
        variableContext.orderParameterisations = schedule.orderParameterisations;
        // If there is only one order parameterization, auto-select it
        if (variableContext.orderParameterisations && variableContext.orderParameterisations.length === 1) {
          this.selectOrder(variableContext.orderParameterisations[0].orderName || '-', variableContext, listVariables, index, orderIndex);
        }
        break;
      }
    }
  }

  private selectVarForOrder(name, listVariables, data, index, orderIndex): void {
    for (let i in listVariables.orderParameterisations) {
      if (listVariables.orderParameterisations[i].orderName === name ||
        (listVariables.orderParameterisations[i].orderName === '' && name === '-') ||
        listVariables.orderParameterisations.length === 1) {

        let list = listVariables.orderParameterisations[i];

        if (!list.variables) {
          console.warn('Variables are not defined for the current parameterisation');
          continue;
        }

        for (let x in list.variables) {
          if (Array.isArray(list.variables[x]) && x === data.name && data.type === 'List') {
            if (this.workflow.orderPreparation && this.workflow.orderPreparation.parameters && !isEmpty(this.workflow.orderPreparation.parameters)) {
              this.variableList = Object.entries(this.workflow.orderPreparation.parameters).map(([k, v]) => {
                const val: any = v;

                if (val.type === 'List' && this.orders.length > 0 && this.orders[orderIndex].arguments.length > 0) {
                  this.orders[orderIndex].arguments = this.orders[orderIndex].arguments.map(argument => {
                    if (argument.type === 'List' && argument.name === k) {
                      const actualList = [];
                      if (val.listParameters) {
                        if (!Array.isArray(val.listParameters)) {
                          val.listParameters = Object.entries(val.listParameters).map(([k1, v1]) => {
                            const val1: any = v1;
                            return {name: k1, value: val1};
                          });
                        }

                        for (let s in list.variables) {
                          if (k === s) {
                            if (Array.isArray(list.variables[s])) {
                              list.variables[s].forEach((key) => {
                                let arr = [];
                                for (let y in val.listParameters) {
                                  if (key[val.listParameters[y].name] !== undefined) {
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
                          let arr = val.listParameters.map(item => ({
                            name: item.name,
                            type: item.value.type,
                            value: ''
                          }));
                          if (arr.length > 0) {
                            actualList.push({list: arr});
                          }
                        }

                        return {
                          name: k,
                          isRequired: true,
                          type: val.type,
                          actualList,
                          list: val.listParameters
                        };
                      }
                    }
                    return argument;
                  });
                }

                return {name: k, value: val};
              });
            }
            this.updateSelectItems(orderIndex);
          }

          if (typeof list.variables[x] === 'object' && !Array.isArray(list.variables[x]) && x === data.name && data.type === 'Map') {
            const mapVariables = list.variables[x];
            data.actualMap = [];

            let mapEntry = [];
            for (let param of data.map) {
              if (mapVariables[param.name] !== undefined) {
                mapEntry.push({
                  name: param.name,
                  type: param.type,
                  value: mapVariables[param.name]
                });
              }
            }

            if (mapEntry.length > 0) {
              data.actualMap.push({map: mapEntry});
            }


            if (data.actualMap.length === 0) {
              let arr = data.map.map(item => ({
                name: item.name,
                type: item.type,
                value: ''
              }));
              if (arr.length > 0) {
                data.actualMap.push({map: arr});
              }
            }
          }
        }
        break;
      }
    }
  }


  selectOrder(name: string, listVariables?: any, data?: any, index?: number, orderIndex?: number): void {
    if (listVariables) {
      this.selectVarForOrder(name, listVariables, data, index, orderIndex);
      return;
    }

    const order = this.orders[orderIndex];
    order.reload = false;


    if (name && name !== '-') {
      order.orderId = name;
    }

    for (let i in order.selectedSchedule.orderParameterisations) {
      const param = order.selectedSchedule.orderParameterisations[i];
      if (param.orderName == name || (param.orderName === '' && name === '-') || order.selectedSchedule.orderParameterisations.length == 1) {
        this.updateVariablesFromSchedule(param, orderIndex);

        if (param.positions) {
          let newPositions;

          if (param.positions.blockPosition) {
            for (const [key, value] of this.blockPositions) {
              if (JSON.stringify(param.positions.blockPosition) === JSON.stringify(value)) {
                order.blockPosition = key;
                break;
              }
            }

            if (this.blockPositionList.has(param.positions.blockPosition) || this.blockPositionList.has(order.blockPosition)) {
              newPositions = this.blockPositionList.get(param.positions.blockPosition) || this.blockPositionList.get(order.blockPosition);
              if (newPositions && Array.isArray(newPositions)) {
                param.positions.newPositions = new Map();
                newPositions.forEach((item) => {
                  param.positions.newPositions.set(item.positionString, item.position);
                });
              }
            }
          }

          if (param.positions.startPosition) {
            order.startPosition = this.coreService.getPositionStr(param.positions.startPosition, newPositions, this.positions);
          }

          if (param.positions.endPositions && param.positions.endPositions.length > 0) {
            order.endPositions = [];
            param.positions.endPositions.forEach(pos => {
              order.endPositions.push(this.coreService.getPositionStr(pos, newPositions, this.positions));
            });
          }

          if (param.forceJobAdmission) {
            order.forceJobAdmission = param.forceJobAdmission;
          } else {
            order.forceJobAdmission = false;
          }

          if (param.tags && param.tags.length > 0) {
            order.tags = param.tags;
          }

          order.reload = true;
        }
        break;
      }
    }
  }

  private updateVariablesFromSchedule(orderParameterisations: any, index: number): void {
    this.orders[index].arguments = [];

    if (this.workflow.orderPreparation && this.workflow.orderPreparation.parameters && !isEmpty(this.workflow.orderPreparation.parameters)) {
      this.variableList = Object.entries(this.workflow.orderPreparation.parameters).map(([k, v]) => {
        const val: any = v;

        if (val.type !== 'List' && val.type !== 'Map') {
          if (!val.final) {
            let list;
            if (val.list) {
              list = [];
              val.list.forEach((item) => {
                let obj = {name: item};
                this.coreService.removeSlashToString(obj, 'name');
                list.push(obj);
              });
            }
            for (let x in orderParameterisations.variables) {
              if (k == x) {
                // Push into the specific order's arguments array
                this.orders[index].arguments.push({
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
        } else if (val.type === 'List') {
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
                // Push into the specific order's arguments array
                this.orders[index].arguments.push({
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
        } else if (val.type === 'Map') {
          const actualMap = [];
          if (val.listParameters) {
            if (!isArray(val.listParameters)) {
              val.listParameters = Object.entries(val.listParameters).map(([k1, v1]) => {
                const val1: any = v1;
                return {name: k1, value: val1};
              });
            }

            for (let x in orderParameterisations.variables) {
              if (k === x) {
                const mapEntries = orderParameterisations.variables[x];
                if (typeof mapEntries === 'object' && !Array.isArray(mapEntries)) {
                  let arr = [];
                  for (let y in val.listParameters) {
                    const paramName = val.listParameters[y].name;
                    if (mapEntries[paramName] || mapEntries[paramName] == false || mapEntries[paramName] == 0) {
                      arr.push({
                        name: paramName,
                        type: val.listParameters[y].value.type,
                        value: mapEntries[paramName]
                      });
                    }
                  }
                  if (arr.length > 0) {
                    actualMap.push({map: arr});
                  }
                }
              }
            }

            if (actualMap.length === 0) {
              let arr = [];
              val.listParameters.forEach((item) => {
                arr.push({name: item.name, type: item.value.type});
              });
              if (arr.length > 0) {
                actualMap.push({map: arr});
              }
            }

            for (let x in orderParameterisations.variables) {
              if (k == x) {
                // Push into the specific order's arguments array
                this.orders[index].arguments.push({
                  name: k,
                  isRequired: true,
                  type: val.type,
                  actualMap,
                  map: val.listParameters
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
        this.orders[index].arguments.push({
          name: x,
          isTextField: true,
          value: orderParameterisations.variables[x]
        });
      }
    }

    this.updateSelectItems(index);
  }

  private updateVariablesForOrderParameterisations(orderParameterisation: any, order: any): void {
    order.arguments = [];

    if (this.workflow.orderPreparation && this.workflow.orderPreparation.parameters) {
      Object.entries(this.workflow.orderPreparation.parameters).forEach(([key, val]: [string, any]) => {
        if (val.type !== 'List' && val.type !== 'Map') {
          if (orderParameterisation.variables && orderParameterisation.variables[key]) {
            order.arguments.push({
              name: key,
              type: val.type,
              value: orderParameterisation.variables[key],
              isRequired: true
            });
          }
        } else if (val.type === 'List') {
          const actualList = [];
          if (orderParameterisation.variables && orderParameterisation.variables[key]) {
            orderParameterisation.variables[key].forEach(item => {
              const listEntry = val.listParameters.map(param => ({
                name: param.name,
                value: item[param.name] || ''
              }));
              actualList.push({list: listEntry});
            });
          }
          order.arguments.push({
            name: key,
            type: val.type,
            actualList: actualList,
            list: val.listParameters
          });
        } else if (val.type === 'Map') {
          const actualMap = [];
          if (orderParameterisation.variables && typeof orderParameterisation.variables[key] === 'object') {
            const mapEntry = val.listParameters.map(param => ({
              name: param.name,
              value: orderParameterisation.variables[key][param.name] || ''
            }));
            actualMap.push({map: mapEntry});
          }
          order.arguments.push({
            name: key,
            type: val.type,
            actualMap: actualMap,
            map: val.listParameters
          });
        }
      });
    }
  }

  assignParameterizationFromSchedules(isCheck = false): void {
    if (isCheck) {
      this.isAssignedFromSchedule = true;
    } else {
      this.isAssignedFromSchedule = false;
    }
    if (!this.schedules) {
      this.coreService.post('workflow/order_templates', {
        controllerId: this.schedulerId,
        workflowPath: this.workflow.path
      }).subscribe({
        next: (res) => {
          this.schedules = res.schedules;
          this.schedules.sort((a, b) => a.name.localeCompare(b.name));
        }
      });
    }
  }

  private fetchTags(): void {
    this.coreService.post('orders/tag/search', {
      search: '',
      controllerId: this.schedulerId
    }).subscribe((res) => {
      this.allTags = res.results;
      this.allTags = this.allTags.map((item) => {
        return item.name;
      })
    });
  }

  onChange(value: string, orderIndex: number): void {
    const order = this.orders[orderIndex];
    const inputValue = value.trim().toLowerCase();
    order.filteredOptions = this.allTags
      .filter(option => option.toLowerCase().includes(inputValue))
      .filter(tag => !order.tags.includes(tag));
  }


  handleClose(removedTag: string, orderIndex: number): void {
    const order = this.orders[orderIndex];
    order.tags = order.tags.filter(tag => tag !== removedTag);
  }


  trackByFn(index: number, item: any): any {
    return index;
  }


  dropTag(event: CdkDragDrop<string[]>, orderIndex: number): void {
    moveItemInArray(this.orders[orderIndex].tags, event.previousIndex, event.currentIndex);
    setTimeout(() => {
      this.cdr.detectChanges();
    });
  }


  sliceTagName(tag: string): string {
    const isLongTag = tag.length > 20;
    return isLongTag ? `${tag.slice(0, 20)}...` : tag;
  }

  showInput(orderIndex: number): void {
    this.orders[orderIndex].inputVisible = true;
    this.orders[orderIndex].filteredOptions = this.allTags;
    setTimeout(() => {
      this.inputElement?.nativeElement.focus();
    }, 10);
  }

  handleInputConfirm(orderIndex: number): void {
    const order = this.orders[orderIndex];
    if (order.inputValue && order.tags.indexOf(order.inputValue) === -1) {
      order.tags.push(order.inputValue); // Add the tag to the order-specific tags
    }
    order.inputValue = '';
    order.inputVisible = false;
  }


  checkValidInput(): void {
    this.isUnique = true;
    for (let i = 0; i < this.allTags.length; i++) {
      if (this.tag.name === this.allTags[i] &&
        this.tag.name === this.allTags[i] && this.tag.name !== this.modalData.tag?.name) {
        this.isUnique = false;
      }
    }
  }

  encryptValue(currentVariable, typeArg) {
    let selectedAgent = [];
    const argu = currentVariable;
    const type = typeArg;
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: EncryptArgumentModalComponent,
      nzAutofocus: null,
      nzData: {
        argu,
        selectedAgent,
        type,
        controllerId: this.schedulerId
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        // this.saveJSON();
      }
    });
  }

  onBlur(repeat: NgModel, propertyName: string, index: number): void {
    this.orders[index][propertyName] = this.coreService.padTime(this.orders[index][propertyName]);
    repeat.control.setErrors({incorrect: false});
    repeat.control.updateValueAndValidity();
  }

  onCommonBlur(control: NgModel, propertyName: string, value: string): void {
    if (propertyName === 'commonStartTimeValue') {
      this.commonStartTimeValue = this.coreService.padTime(value);
      control.control.setErrors({incorrect: false});
      control.control.updateValueAndValidity();
    }
  }

  onTimeChange(e: any, index: number): void {
    delete this.orders[index].atTime;
    delete this.orders[index].fromDate;
    delete this.orders[index].fromTime;
    delete this.orders[index].fromTime1;
  }

  onCommonTimeChange(event: any): void {
    if (this.orders.length > 1) {
      if (this.commonStartTime === 'now' || this.commonStartTime === 'never') {
        this.orders.forEach(order => {
          order.at = this.commonStartTime;
        });
      } else if (this.commonStartTime === 'later') {
        this.orders.forEach(order => {
          order.at = 'later';
          order.atTime = this.commonStartTimeValue; // Apply the common time value to each order
        });
      } else if (this.commonStartTime === 'date') {
        this.orders.forEach(order => {
          order.at = 'date';
          order.fromDate = this.commonStartDate.fromDate;
          order.fromTime = this.commonStartDate.fromTime;
          order.timeZone = this.commonStartDate.timeZone;
        });
      }
    }
  }

  loadPlanIds(): void {
    const requestPayload: any = {
      controllerId: this.schedulerId,
      onlyClosedPlans: true,
      planSchemaIds: ['Global', 'DailyPlan']
    };
    this.coreService.post('plans/ids', requestPayload)
      .subscribe((res) => {
        this.planIds = res.plans
      });
  }


  checkPlanIds(orders: any[]): Promise<void> {
    return new Promise((resolve) => {
      if (!Array.isArray(orders) || !orders.length) return resolve();

      const affectedOrders = [];

      orders.forEach(order => {
        const id = order.planId?.noticeSpaceKey;
        if (id && this.planIds) {
          const matched = this.planIds.find(plan =>
            plan.planId?.noticeSpaceKey?.includes(id) && plan.state?._text === 'CLOSED'
          );
          if (matched) {
            affectedOrders.push({ order, id });
          }
        }
      });

      if (affectedOrders.length > 0) {
        const modal = this.modal.create({
          nzTitle: undefined,
          nzContent: ConfirmModalComponent,
          nzData: {
            title: 'closedPlanType',
            message: 'closedPlanType',
            planId: affectedOrders.map(item => item.id),
            type: 'confirm',
          },
          nzFooter: null,
          nzClosable: false,
          nzMaskClosable: false
        });

        modal.afterClose.subscribe(result => {
          affectedOrders.forEach(item => {
            if (result) {
              item.order.openClosedPlan = true;
            } else {
              item.order.planId.noticeSpaceKey = '';
            }
          });
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

}


@Component({
  selector: 'app-add-schedules',
  templateUrl: './add-schedules-dialog.html',
})

export class AddSchedulesModalComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  schedulerId: any;
  permission: any;
  preferences: any;
  workflowPath: any;
  schedules: any[] = [];
  allSelected: boolean = false;
  submitted = false;

  constructor(
    public coreService: CoreService,
    private activeModal: NzModalRef,
    private modal: NzModalService
  ) {
  }

  ngOnInit(): void {
    this.schedulerId = this.modalData.schedulerId;
    this.permission = this.modalData.permission;
    this.preferences = this.modalData.preferences;
    this.workflowPath = this.modalData.workflowPath;
    this.fetchSchedules();
  }

  fetchSchedules(): void {
    this.coreService.post('workflow/order_templates', {
      controllerId: this.schedulerId,
      workflowPath: this.workflowPath
    }).subscribe({
      next: (res) => {
        res.schedules.forEach(schedule => {
          schedule.selected = false;
        });
        this.schedules = res.schedules;
        this.schedules.sort((a, b) => a.name.localeCompare(b.name));

      },
      error: (err) => {
        console.error('Error fetching schedules:', err);
      }
    });
  }

  toggleSelectAll(isChecked: boolean): void {
    this.schedules.forEach(schedule => {
      schedule.selected = isChecked;
    });
  }

  onScheduleChange(): void {
    this.allSelected = this.schedules.every(schedule => schedule.selected);
  }

  submit(): void {
    this.submitted = true
    const selectedSchedules = this.schedules
      .filter(schedule => schedule.selected)
      .map(schedule => schedule.name);

    this.activeModal.close(selectedSchedules);
  }

  cancel(): void {
    this.activeModal.destroy();
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
