import {Component, inject} from "@angular/core";
import {AuthService} from "../../components/guard";
import {CoreService} from "../../services/core.service";
import {NZ_MODAL_DATA, NzModalRef, NzModalService} from "ng-zorro-antd/modal";
import {ClipboardService} from "ngx-clipboard";
import {AddEnciphermentModalComponent} from "../encipherment/encipherment.component";
import {CommentModalComponent} from "../../components/comment-modal/comment.component";
import {ConfirmModalComponent} from "../../components/comfirm-modal/confirm.component";
import {NzFormatEmitEvent} from "ng-zorro-antd/tree";

@Component({
  selector: 'app-change-modal',
  templateUrl: './add-change-dialog.html'
})
export class AddChangesModalComponent{
  readonly modalData: any = inject(NZ_MODAL_DATA);
  display: any;
  title: string;
  submitted = false;
  comments: any = {};
  required = false;
  schedulerIds: any;
  changesObj: any = {};
  changes: any
  originalName: any
  flag = false
  nodes: any;
  loading = false
  constructor(public activeModal: NzModalRef, private coreService: CoreService, private authService: AuthService ){}

  ngOnInit(): void {
    this.schedulerIds = JSON.parse(this.authService.scheduleIds);
    this.display = this.modalData.display;
    this.title = this.modalData.title;
    this.changes = this.modalData.changes;
    this.flag = this.modalData.flag;
    this.originalName = this.modalData.originalName;
    if(this.changes){
      this.changesObj.name = this.changes.name;
      this.changesObj.title = this.changes.title;
      this.changesObj.state = this.changes.state;
    }
    this.comments.radio = 'predefined';
    if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
      this.required = true;
      this.display = true;
    }

    if(this.title === 'changesFound'){
      this.nodes = this.prepareGroupedTree(this.changes.configurations)
    }
  }

  changeState(selectedState: string): void {
    this.changesObj.state = selectedState;
  }

  onSubmit() {
    this.submitted = true;

    let auditLog: any = {};
    if (this.comments.comment) {
      auditLog.comment = this.comments.comment;
    }
    if (this.comments.timeSpent) {
      auditLog.timeSpent = this.comments.timeSpent;
    }
    if (this.comments.ticketLink) {
      auditLog.ticketLink = this.comments.ticketLink;
    }

    const obj = {
      auditLog: auditLog.comment ? auditLog : undefined,
      store: this.changesObj
    };
    if (this.changesObj.name !== this.originalName && this.flag) {
      this._delete(this.originalName, obj);
    } else {
      this._submitChange(obj);
    }
  }
  _submitChange(obj: any) {
    this.coreService.post('inventory/changes/store', obj).subscribe({
      next: () => {
        this.activeModal.close('Done');
      },
      error: () => {
        this.submitted = false;
      }
    });
  }

  _delete(originalName,newChangeObj):void{
    const objToDelete = { changes: [{ name: originalName }] };
    this.coreService.post('inventory/changes/delete', objToDelete).subscribe({
      next: () => {
        this._submitChange(newChangeObj);
      },
      error: () => {
        this.submitted = false;
      }
    });
  }

  checkBoxChanges(e: NzFormatEmitEvent): void {
    const node: any = e.node;


    this.updateChildCheckboxes(node, node.isChecked);

    this.updateParentCheckboxes(node);
  }

  updateChildCheckboxes(node: any, isChecked: boolean): void {
    node.children.forEach((child: any) => {
      child.isChecked = isChecked;

      if (child.children && child.children.length > 0) {
        this.updateChildCheckboxes(child, isChecked);
      }

      child.isHalfChecked = false;
    });
  }

  updateParentCheckboxes(node: any): void {
    if (node.parentNode) {
      const siblings = node.parentNode.children;

      const allChecked = siblings.every((sibling: any) => sibling.isChecked);
      const someChecked = siblings.some((sibling: any) => sibling.isChecked || sibling.isHalfChecked);

      node.parentNode.isChecked = allChecked;
      node.parentNode.isHalfChecked = !allChecked && someChecked;

      this.updateParentCheckboxes(node.parentNode);
    }
  }


  prepareGroupedTree(data: any): any[] {
    const root = {
      name: '/',
      path: '/',
      key: '/',
      isLeaf: false,
      expanded: true,
      checked: true,
      children: []
    };

    const groupedObjects: { [key: string]: any[] } = {
      "WORKFLOW": [],
      "JOBRESOURCE": [],
      "FILEORDERSOURCE": [],
      "SCHEDULE": [],
      "NOTICEBOARD": [],
      "LOCK": [],
      "JOBTEMPLATE": [],
      "INCLUDESCRIPT": [],
      "WORKINGDAYSCALENDAR": [],
      "NONWORKINGDAYSCALENDAR": []
    };

    data?.forEach((item: any) => {
      switch (item.objectType) {
        case "WORKFLOW":
          groupedObjects["WORKFLOW"].push(item);
          break;
        case "JOBRESOURCE":
          groupedObjects["JOBRESOURCE"].push(item);
          break;
        case "FILEORDERSOURCE":
          groupedObjects["FILEORDERSOURCE"].push(item);
          break;
        case "SCHEDULE":
          groupedObjects["SCHEDULE"].push(item);
          break;
        case "NOTICEBOARD":
          groupedObjects["NOTICEBOARD"].push(item);
          break;
        case "LOCK":
          groupedObjects["LOCK"].push(item);
          break;
        case "JOBTEMPLATE":
          groupedObjects["JOBTEMPLATE"].push(item);
          break;
        case "INCLUDESCRIPT":
          groupedObjects["INCLUDESCRIPT"].push(item);
          break;
        case "WORKINGDAYSCALENDAR":
          groupedObjects["WORKINGDAYSCALENDAR"].push(item);
          break;
        case "NONWORKINGDAYSCALENDAR":
          groupedObjects["NONWORKINGDAYSCALENDAR"].push(item);
          break;
        default:
          break;
      }
    });

    Object.keys(groupedObjects).forEach((type: string) => {
      if (groupedObjects[type].length > 0) {
        const groupNode = {
          name: type,
          object: type,
          path: '/',
          key: `/${type}`,
          disableCheckbox: true,
          expanded: true,
          isLeaf: false,
          children: groupedObjects[type].map((item: any) => ({
            name: item.name,
            path: item.path,
            key: item.path,
            type: item.objectType,
            released: item.released,
            deployed: item.deployed,
            valid: item.valid,
            isLeaf: true,
            checked: true,
          }))
        };
        root.children.push(groupNode);
      }
    });
    return [root];
  }

  removeFromChange(): void {
    const uncheckedNodes = this.getUncheckedNodes(this.nodes);

    let auditLog: any = {};
    if (this.comments.comment) {
      auditLog.comment = this.comments.comment;
    }
    if (this.comments.timeSpent) {
      auditLog.timeSpent = this.comments.timeSpent;
    }
    if (this.comments.ticketLink) {
      auditLog.ticketLink = this.comments.ticketLink;
    }

    const obj = {
      auditLog: auditLog.comment ? auditLog : undefined,
      change: {
        name: this.changes.name
      },
      remove: uncheckedNodes
    };

    const endpoint = 'inventory/change/remove';

    if (uncheckedNodes && uncheckedNodes.length > 0) {
      this.coreService.post(endpoint, obj).subscribe({
        next: (res) => {
          this.activeModal.close('Done');
        },
        error: () => {
          this.activeModal.close();
        }
      });
    }
  }

  getUncheckedNodes(nodeList: any[]): any[] {
    const result: any[] = [];

    function collectUncheckedNodes(nodes: any[]): void {
      nodes.forEach(node => {
        if (!node.checked && node.type) {
          result.push({
            objectType: node.type,
            name: node.name
          });
        }

        if (node.children && node.children.length > 0) {
          collectUncheckedNodes(node.children);
        }
      });
    }

    collectUncheckedNodes(nodeList);
    return result;
  }



}


@Component({
  selector: 'app-changes',
  templateUrl: './changes.component.html',
})
export class ChangesComponent {
  permission: any = {};
  preferences: any = {};
  data: any = [];
  isLoading = false;
  changesFilters: any = {
    currentPage: 1,
    entryPerPage: 25,
  };
  constructor(private authService: AuthService, public coreService: CoreService, private modal: NzModalService,) {
    this.permission = JSON.parse(this.authService.permission) || {};
  }

  ngOnInit() {
    this.preferences = sessionStorage['preferences'] ? JSON.parse(sessionStorage['preferences']) : {};
    this.changes()
  }

  addChange() {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: AddChangesModalComponent,
      nzClassName: 'sm',
      nzData: {
        title: 'addChange',
        display: this.preferences.auditLog,
      },
      nzFooter: null,
      nzAutofocus: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
      this.changes()
      }
    });
  }

  changes():void{
    this.coreService.post('inventory/changes', {details: true}).subscribe({
      next: (res) => {
        this.data = res.changes
        this.isLoading = true;
      },
      error: ()=> {
        this.isLoading = true;
    }
    });
  }

  pageIndexChange($event: number): void {
    this.changesFilters.currentPage = $event;
  }

  pageSizeChange($event: number): void {
    this.changesFilters.entryPerPage = $event;
  }

  updateChanges(changes, title?) {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: AddChangesModalComponent,
      nzClassName: 'sm',
      nzData: {
        title: title ? title : 'addChange',
        display: this.preferences.auditLog,
        changes: changes,
        originalName: changes.name,
        flag: true
      },
      nzFooter: null,
      nzAutofocus: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.changes();
      }
    });
  }

  changesFound(changes, title?) {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: AddChangesModalComponent,
      nzClassName: 'sm',
      nzData: {
        title: title ? title : 'addChange',
        display: this.preferences.auditLog,
        changes: changes,
      },
      nzFooter: null,
      nzAutofocus: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.changes();
      }
    });
  }

  deleteChanges(name){
    let obj: any = {
      changes: [{ name }]
    };
    if (this.preferences.auditLog) {
      const comments = {
        radio: 'predefined',
        type: 'Changes',
        operation: 'Delete',
        name: name
      };
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzClassName: 'sm',
        nzAutofocus: null,
        nzData: {
          comments,
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });

      modal.afterClose.subscribe(result => {
        if (result) {
          obj.auditLog = {
            comment: result.comment,
            timeSpent: result.timeSpent,
            ticketLink: result.ticketLink
          };
          this._deleteChanges(obj);
        }
      });
    } else {
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: ConfirmModalComponent,
        nzData: {
          type: 'Delete',
          title: 'delete',
          message: 'deleteChanges',
          objectName: name,
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          this._deleteChanges(obj);
        }
      });
    }
  }

  private _deleteChanges(obj){
    this.coreService.post('inventory/changes/delete', obj).subscribe({
      next: (res: any) => {
        this.changes();
      }, error: () => {}
    });
  }
}
