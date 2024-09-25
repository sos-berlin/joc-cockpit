import {Component, inject} from "@angular/core";
import {AuthService} from "../../components/guard";
import {CoreService} from "../../services/core.service";
import {NZ_MODAL_DATA, NzModalRef, NzModalService} from "ng-zorro-antd/modal";
import {ClipboardService} from "ngx-clipboard";
import {AddEnciphermentModalComponent} from "../encipherment/encipherment.component";
import {CommentModalComponent} from "../../components/comment-modal/comment.component";
import {ConfirmModalComponent} from "../../components/comfirm-modal/confirm.component";

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
  constructor(public activeModal: NzModalRef, private coreService: CoreService, private authService: AuthService ){}

  ngOnInit(): void {
    this.schedulerIds = JSON.parse(this.authService.scheduleIds);
    this.display = this.modalData.display;
    this.title = this.modalData.title;
    this.changes = this.modalData.changes;
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
console.log(this.changesObj.name, this.originalName,">>")
    if (this.changesObj.name !== this.originalName) {
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
        title: 'addChanges',
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
    this.coreService.post('inventory/changes', {}).subscribe({
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
        title: title ? title : 'addChanges',
        display: this.preferences.auditLog,
        changes: changes,
        originalName: changes.name
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
