import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges
} from '@angular/core';
import {CoreService} from 'src/app/services/core.service';
import {DataService} from 'src/app/services/data.service';
import {NzModalService} from 'ng-zorro-antd/modal';
import {clone, isEmpty} from 'underscore';
import {Subscription} from 'rxjs';
import {ConfirmModalComponent} from '../../../../components/comfirm-modal/confirm.component';
import {CreateObjectModalComponent, DeployComponent, SingleDeployComponent} from '../inventory.component';
import {CommentModalComponent} from '../../../../components/comment-modal/comment.component';
import {InventoryObject} from '../../../../models/enums';
import {InventoryService} from '../inventory.service';
import {OrderPipe, SearchPipe} from "../../../../pipes/core.pipe";
import {AuthService} from "../../../../components/guard";

@Component({
  selector: 'app-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './table.component.html'
})
export class TableComponent implements OnChanges, OnDestroy {
  @Input() schedulerId: any;
  @Input() preferences: any;
  @Input() permission: any;
  @Input() dataObj: any;
  @Input() objectType: any;
  @Input() copyObj: any;
  @Input() isTrash: any;

  searchKey: any;
  data: any = [];
  filter: any = {sortBy: 'name', reverse: false, currentPage: 1};
  mapOfCheckedId = new Map();
  checked = false;
  indeterminate = false;

  subscription1: Subscription;
  subscription2: Subscription;

  constructor(public coreService: CoreService, private dataService: DataService, public inventoryService: InventoryService, private authService: AuthService,
              private modal: NzModalService, private ref: ChangeDetectorRef, private searchPipe: SearchPipe, private orderPipe: OrderPipe) {
    this.subscription1 = dataService.reloadTree.subscribe(res => {
      if (res && !isEmpty(res)) {
        if ((res.reloadTree && this.dataObj && this.dataObj.children) || res.reloadFolder) {
          this.searchInResult();
          this.ref.detectChanges();
        }
      }
    });
    this.subscription2 = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.searchInResult();
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
  }

  private refresh(args: { eventSnapshots: any[] }): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].eventType.match(/Inventory/)) {
          this.searchInResult();
          this.ref.detectChanges();
          break;
        }
      }
    }
  }

  add(): void {
    const obj: any = {
      type: this.objectType === 'CALENDAR' ? 'WORKINGDAYSCALENDAR' : this.objectType,
      path: this.dataObj.path
    };
    if (!this.dataObj.path) {
      return;
    }
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: CreateObjectModalComponent,
      nzAutofocus: null,
      nzData: {
        schedulerId: this.schedulerId,
        preferences: this.preferences,
        obj
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(res => {
      if (res) {
        let configuration = {};
        obj.name = res.name;
        if (obj.type === InventoryObject.SCHEDULE) {
          configuration = {
            controllerId: this.schedulerId,
            planOrderAutomatically: true,
            submitOrderToControllerWhenPlanned: true
          };
        } else if (obj.type === InventoryObject.LOCK) {
          configuration = {limit: 1, id: res.name};
        } else if (obj.type === InventoryObject.REPORT) {
          configuration = {hits: 10};
        } else if (obj.type === InventoryObject.FILEORDERSOURCE) {
          configuration = {delay: 2};
        } else if (obj.type === 'WORKINGDAYSCALENDAR' || obj.type === 'NONWORKINGDAYSCALENDAR') {
          configuration = {type: obj.type};
        }
        const path = this.dataObj.path + (this.dataObj.path === '/' ? '' : '/') + res.name;
        this.store(obj, path, configuration, res.comments);
      }
    });
  }

  /* ---------------------------- Action ----------------------------------*/

  pageIndexChange($event: number): void {
    this.filter.currentPage = $event;
    if (this.mapOfCheckedId.size !== this.data.length) {
      this.reset();
    }
  }

  pageSizeChange($event: number): void {
    this.filter.entryPerPage = $event;
    if (this.mapOfCheckedId.size !== this.data.length) {
      if (this.checked) {
        this.onAllChecked(true);
      }
    }
  }

  searchInResult(): void {
    if (this.dataObj?.children) {
      this.data = this.searchKey ? this.searchPipe.transform(this.dataObj.children, this.searchKey, ['name']) : this.dataObj.children;
      this.data = [...this.data];
    }
  }

  sort(key): void {
    this.filter.reverse = !this.filter.reverse;
    this.filter.sortBy = key;
    this.data = this.orderPipe.transform(this.data, this.filter.sortBy, this.filter.reverse);
    this.reset();
  }

  reset(): void {
    this.mapOfCheckedId = new Map();
    this.checked = false;
    this.indeterminate = false;
    this.ref.detectChanges();
  }

  onItemChecked(item: any, checked: boolean): void {
    if (checked) {
      this.mapOfCheckedId.set(item.name, {
        objectType: item.objectType || item.type,
        path: item.path + (item.path === '/' ? '' : '/') + item.name,
        name: item.name,
        valid: item.valid,
        deployed: item.deployed,
        syncState: item.syncState
      });
    } else {
      this.mapOfCheckedId.delete(item.name);
    }
    const arr = this.getCurrentData(this.data, this.filter);
    this.checked = this.mapOfCheckedId.size === arr.length;
    this.indeterminate = this.mapOfCheckedId.size > 0 && !this.checked;
  }

  selectAll(): void {
    this.data.forEach(item => {
      this.mapOfCheckedId.set(item.name, {
        objectType: item.objectType || item.type,
        path: item.path + (item.path === '/' ? '' : '/') + item.name,
        name: item.name,
        valid: item.valid,
        deployed: item.deployed,
        syncState: item.syncState
      });
    });
    this.indeterminate = this.mapOfCheckedId.size > 0 && !this.checked;
  }

  onAllChecked(value: boolean): void {
    if (value && this.data.length > 0) {
      const data = this.getCurrentData(this.data, this.filter);
      data.forEach(item => {
        this.mapOfCheckedId.set(item.name, {
          objectType: item.objectType || item.type,
          path: item.path + (item.path === '/' ? '' : '/') + item.name,
          name: item.name,
          valid: item.valid,
          deployed: item.deployed,
          syncState: item.syncState
        });
      });
    } else {
      this.mapOfCheckedId.clear();
    }
    this.indeterminate = this.mapOfCheckedId.size > 0 && !this.checked;
  }

  getCurrentData(list, filter): Array<any> {
    const entryPerPage = filter.entryPerPage || this.preferences.entryPerPage;
    return list.slice((entryPerPage * (filter.currentPage - 1)), (entryPerPage * filter.currentPage));
  }

  paste(): void {
    this.dataService.reloadTree.next({paste: this.dataObj});
  }

  cutObject(data): void {
    this.dataService.reloadTree.next({cut: data});
  }

  copyObject(data): void {
    this.dataService.reloadTree.next({copy: data});
  }

  renameObject(data): void {
    this.dataService.reloadTree.next({renameObject: data});
  }

  addTags(data): void {
    this.dataService.reloadTree.next({addTag: data});
  }

  newDraft(data): void {
    this.dataService.reloadTree.next({newDraft: data});
  }

  updateFromJobTemplates(data): void {
    this.dataService.reloadTree.next({updateFromJobTemplate: data});
  }

  editObject(data): void {
    this.dataService.reloadTree.next({set: data});
  }

  showJson(data, isEdit): void {
    this.dataService.reloadTree.next({showJson: data, edit: isEdit});
  }

  exportJSON(data): void {
    this.dataService.reloadTree.next({exportJSON: data});
  }

  importJSON(data): void {
    this.dataService.reloadTree.next({importJSON: data});
  }

  deletePermanently(data): void {
    this.dataService.reloadTree.next({delete: data});
  }

  removeObject(object): void {
    if (this.objectType !== 'WORKFLOW' && this.objectType !== 'SCHEDULE' && !this.objectType.match(/CALENDAR/)) {
      if (this.preferences.auditLog) {
        const comments = {
          radio: 'predefined',
          type: this.objectType,
          operation: 'Remove',
          name: object ? object.name : ''
        };
        const modal = this.modal.create({
          nzTitle: undefined,
          nzContent: CommentModalComponent,
          nzClassName: 'lg',
          nzData: {
            comments,
          },
          nzFooter: null,
          nzClosable: false,
          nzMaskClosable: false
        });
        modal.afterClose.subscribe(result => {
          if (result) {
            this.removeApiCall(object, {
              comment: result.comment,
              timeSpent: result.timeSpent,
              ticketLink: result.ticketLink
            });
          }
        });
      } else {
        const _path = object ? object.path + (object.path === '/' ? '' : '/') + object.name : '';
        const param: any = {
          title: 'remove',
          message: object ? 'removeObject' : '',
          type: 'Remove',
          objectName: _path
        };
        if (this.mapOfCheckedId.size > 0) {
          param.countMessage = 'removeAllObject';
          param.count = this.mapOfCheckedId.size;
        }
        const modal = this.modal.create({
          nzTitle: undefined,
          nzContent: ConfirmModalComponent,
          nzData: param,
          nzFooter: null,
          nzClosable: false,
          nzMaskClosable: false
        });
        modal.afterClose.subscribe(result => {
          if (result) {
            this.removeApiCall(object, undefined);
          }
        });
      }
    } else {
      if (object) {
        this.dataService.reloadTree.next({deploy: object, remove: true});
      } else {
        this.modal.create({
          nzTitle: undefined,
          nzContent: SingleDeployComponent,
          nzData: {
            schedulerIds: [],
            display: this.preferences.auditLog,
            data: {
              path: this.dataObj.path,
              list: Array.from(this.mapOfCheckedId.values())
            },
            releasable: false,
            isRemoved: true,
            isChecked: this.inventoryService.checkDeploymentStatus.isChecked
          },
          nzFooter: null,
          nzClosable: false,
          nzMaskClosable: false
        }).afterClose.subscribe(result => {
          if (result) {
            this.removeApiCall(object, {
              comment: result.comment,
              timeSpent: result.timeSpent,
              ticketLink: result.ticketLink
            });
          }

        });
      }
    }
  }

  deployAll(): void {
    this.modal.create({
      nzTitle: undefined,
      nzContent: DeployComponent,
      nzClassName: 'lg',
      nzData: {
        schedulerIds: this.getAllowedControllerOnly(),
        display: this.preferences.auditLog,
        path: this.dataObj.path,
        data: {
          objectType: this.objectType,
          list: Array.from(this.mapOfCheckedId.values())
        },
        releasable: (this.objectType.match(/CALENDAR/) || this.objectType === InventoryObject.SCHEDULE || this.objectType === InventoryObject.JOBTEMPLATE
          || this.objectType === InventoryObject.INCLUDESCRIPT || this.objectType === InventoryObject.REPORT),
        isSelectedObjects: true,
        isChecked: this.inventoryService.checkDeploymentStatus.isChecked
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    }).afterClose.subscribe((result) => {
      if (result) {
        this.reset();
      }
    });
  }

  private getAllowedControllerOnly(): any {
    const schedulerIds = this.authService.scheduleIds ? JSON.parse(this.authService.scheduleIds) : {};
    const obj = clone(schedulerIds);
    obj.controllerIds = obj.controllerIds.filter((id) => {
      let flag = true;
      if (this.permission.controllers) {
        if (this.permission.controllers[id]) {
          if (!this.permission.controllers[id].deployments.deploy) {
            flag = false;
          }
        }
      }
      return flag;
    });
    return obj;
  }

  removeAll(): void {
    this.removeObject(null);
  }

  deleteAll(): void {
    this.deleteDraft(null);
  }

  private removeApiCall(object: any, auditLog: any): void {
    this.deleteAPICall('remove', object, auditLog);
  }

  deleteDraft(object: any): void {
    const _path = object ? object.path + (object.path === '/' ? '' : '/') + object.name : '';
    if (this.preferences.auditLog) {
      const comments = {
        radio: 'predefined',
        type: this.objectType,
        operation: 'Delete',
        name: object ? object.name : ''
      };
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzClassName: 'lg',
        nzData: {
          comments,
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          this.deleteApiCall(object, {
            comment: result.comment,
            timeSpent: result.timeSpent,
            ticketLink: result.ticketLink
          });
        }
      });
    } else {
      const param: any = {
        title: 'delete',
        message: object ? 'deleteDraftObject' : '',
        type: 'Delete',
        objectName: _path
      };
      if (this.mapOfCheckedId.size > 0) {
        param.countMessage = 'deleteAllDraftObject';
        param.count = this.mapOfCheckedId.size;
      }
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: ConfirmModalComponent,
        nzData: param,
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          this.deleteApiCall(object, undefined);
        }
      });
    }
  }

  private deleteApiCall(object, auditLog): void {
    this.deleteAPICall('delete_draft', object, auditLog);
  }

  private deleteAPICall(type, object, auditLog): void {
    const request = {
      auditLog,
      objects: []
    };

    if (object) {
      request.objects.push({
        objectType: object.objectType || object.type,
        path: object.path + (object.path === '/' ? '' : '/') + object.name
      })
    } else if (this.mapOfCheckedId.size > 0) {
      this.mapOfCheckedId.forEach(item => {
        request.objects.push(item)
      });
    }
    this.coreService.post('inventory/' + type, request).subscribe(() => {
      this.updateList(object, type);
    });
  }

  private updateList(object, type): void {
    if (object) {
      let isDraftOnly = true;
      if (type === 'delete_draft') {
        if (this.objectType.match(/CALENDAR/) || this.objectType === InventoryObject.SCHEDULE || this.objectType === InventoryObject.JOBTEMPLATE ||
          this.objectType === InventoryObject.INCLUDESCRIPT || this.objectType === InventoryObject.REPORT) {
          if (object.hasReleases) {
            object.released = true;
            isDraftOnly = false;
          }
        } else if (object.hasDeployments) {
          isDraftOnly = false;
          object.deployed = true;
        }
      }
      if (isDraftOnly) {
        for (let i = 0; i < this.dataObj.children.length; i++) {
          if (this.dataObj.children[i].path === object.path && this.dataObj.children[i].name === object.name) {
            this.dataObj.children.splice(i, 1);
            break;
          }
        }
      }
    } else {
      this.mapOfCheckedId.forEach((item, key) => {
        for (let i = 0; i < this.dataObj.children.length; i++) {
          if (this.dataObj.children[i].name === key) {
            let isDraftOnly = true;
            if (type === 'delete_draft') {
              if (this.objectType.match(/CALENDAR/) || this.objectType === InventoryObject.SCHEDULE || this.objectType === InventoryObject.JOBTEMPLATE || this.objectType === InventoryObject.INCLUDESCRIPT
                || this.objectType === InventoryObject.REPORT) {
                if (this.dataObj.children[i].hasReleases) {
                  this.dataObj.children[i].released = true;
                  isDraftOnly = false;
                }
              } else if (this.dataObj.children[i].hasDeployments) {
                this.dataObj.children[i].deployed = true;
                isDraftOnly = false;
              }
            }
            if (isDraftOnly) {
              this.dataObj.children.splice(i, 1);
            }
            break;
          }
        }
      });
      this.reset();
    }
    this.searchInResult();
    this.dataService.reloadTree.next({reload: true});
    this.ref.detectChanges();
  }

  restoreObject(data): void {
    this.dataService.reloadTree.next({restore: data});
  }

  deployObject(data): void {
    this.dataService.reloadTree.next({deploy: data});
  }

  revoke(data): void {
    this.dataService.reloadTree.next({revoke: data});
  }

  releaseObject(data): void {
    this.dataService.reloadTree.next({release: data});
  }

  recallObject(data): void {
    this.dataService.reloadTree.next({recall: data});
  }

  private store(obj, path, configuration, comments: any = {}): void {
    if (this.objectType === InventoryObject.WORKFLOW && !configuration.timeZone) {
      configuration.timeZone = this.preferences.zone;
    }
    const valid = !(this.objectType.match(/CALENDAR/) || this.objectType === InventoryObject.SCHEDULE || this.objectType === InventoryObject.JOBTEMPLATE || this.objectType === InventoryObject.INCLUDESCRIPT
      || this.objectType === InventoryObject.REPORT || this.objectType === InventoryObject.WORKFLOW || this.objectType === InventoryObject.FILEORDERSOURCE || this.objectType === InventoryObject.JOBRESOURCE);
    if (!path) {
      return;
    }

    const request: any = {
      objectType: this.objectType === 'CALENDAR' ? InventoryObject.WORKINGDAYSCALENDAR : this.objectType,
      path,
      valid,
      configuration
    };
    if (comments.comment) {
      request.auditLog = {
        comment: comments.comment,
        timeSpent: comments.timeSpent,
        ticketLink: comments.ticketLink
      }
    }

    this.coreService.post('inventory/store', request).subscribe(() => {
      if (this.objectType.match(/CALENDAR/)) {
        obj.type = 'CALENDAR';
        obj.objectType = InventoryObject.WORKINGDAYSCALENDAR;
      }
      obj.valid = valid;
      this.dataObj.children.push(obj);
      this.searchInResult();
      this.dataService.reloadTree.next({add: true});
      this.ref.detectChanges();
    });

  }

  navToWorkflow(workflowName): void {
    this.dataService.reloadTree.next({
      navigate: {
        name: workflowName,
        type: InventoryObject.WORKFLOW
      }
    });
  }
}
