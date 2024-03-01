import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, Directive, forwardRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges
} from '@angular/core';
import {clone, isEmpty, isEqual} from 'underscore';
import {AbstractControl, NG_VALIDATORS, Validator} from "@angular/forms";
import {Subscription} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {NzModalService} from 'ng-zorro-antd/modal';
import {AuthService} from "../../../../components/guard";
import {CoreService} from '../../../../services/core.service';
import {DataService} from '../../../../services/data.service';
import {InventoryObject} from '../../../../models/enums';
import {CommentModalComponent} from '../../../../components/comment-modal/comment.component';


@Directive({
  selector: '[appMonthValidate]',
  providers: [
    {provide: NG_VALIDATORS, useExisting: forwardRef(() => MonthValidator), multi: true}
  ]
})
export class MonthValidator implements Validator {
  validate(c: AbstractControl): { [key: string]: any } {
    let v = c.value;
    if (v != null) {
      if (v == '') {
        return null;
      }
      if (/^\s*(([1-9][0-9]*)\s*[mMyY]?|(\d{4})-(0[1-9]|1[0-2]))\s*$/.test(v)) {
        return null;
      }
    } else {
      return null;
    }
    return {
      invalidMonth: true
    };
  }
}

@Component({
  selector: 'app-report',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './report.component.html'
})
export class ReportComponent implements OnChanges, OnDestroy {
  @Input() preferences: any;
  @Input() permission: any;
  @Input() schedulerId: any;
  @Input() data: any;
  @Input() copyObj: any;
  @Input() reload: any;
  @Input() isTrash: any;

  report: any = {};
  isVisible: boolean;
  isUnique = true;
  objectType = InventoryObject.REPORT;
  invalidMsg: string;
  isLocalChange = '';
  indexOfNextAdd = 0;
  history = [];
  templates = [];
  schedulerIds: any;
  frequencies = [
    {name: 'WEEKLY'},
    {name: 'TWO_WEEKS'},
    {name: 'MONTHLY'},
    {name: 'THREE_MONTHS'},
    {name: 'SIX_MONTHS'},
    {name: 'YEARLY'},
    {name: 'THREE_YEARS'}
  ];

  lastModified: any = '';
  subscription1: Subscription;
  subscription2: Subscription;
  subscription3: Subscription;


  constructor(public coreService: CoreService, private translate: TranslateService, private dataService: DataService,
              private authService: AuthService, private ref: ChangeDetectorRef, private modal: NzModalService) {
    this.subscription1 = dataService.reloadTree.subscribe(res => {
      if (res && !isEmpty(res)) {
        if (res.reloadTree && this.report.actual) {
          this.ref.detectChanges();
        }
      }
    });
    this.subscription2 = dataService.functionAnnounced$.subscribe(res => {
      if (res === 'REDO') {
        this.redo();
      } else if (res === 'UNDO') {
        this.undo();
      }
    });
    this.subscription3 = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
  }

  ngOnInit(): void {
    this.schedulerIds = this.authService.scheduleIds ? JSON.parse(this.authService.scheduleIds) : {};
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['copyObj'] && !changes['data']) {
      return;
    }
    if (changes['reload']) {
      if (changes['reload'].previousValue === true && changes['reload'].currentValue === false) {
        return;
      }
      if (this.reload) {
        this.getObject();
        this.reload = false;
        return;
      }
    }
    if (this.report.actual) {
      this.saveJSON();
    }
    if (changes['data']) {
      if (this.data.type) {
        this.getObject();
      } else {
        this.report = {};
        this.ref.detectChanges();
      }
    }
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
    this.subscription3.unsubscribe();
    if (this.report.name) {
      this.saveJSON();
    }
  }

  private refresh(args: { eventSnapshots: any[] }): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].path) {
          const path = this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name;
          if ((args.eventSnapshots[j].eventType.match(/InventoryObjectUpdated/) || args.eventSnapshots[j].eventType.match(/ItemChanged/)) && args.eventSnapshots[j].objectType === this.objectType) {
            if (args.eventSnapshots[j].path === path) {
              if (this.isLocalChange !== this.report.path) {
                this.getObject();
              } else {
                this.isLocalChange = '';
              }
            }
          }
        }
      }
    }
  }


  rename(inValid): void {
    if (this.data.id === this.report.id && this.data.name !== this.report.name) {
      if (!inValid) {
        this.report.path = (this.report.path1 + (this.report.path1 === '/' ? '' : '/') + this.report.name);
        if (this.preferences.auditLog) {
          let comments = {
            radio: 'predefined',
            type: 'Script',
            operation: 'Rename',
            name: this.data.name
          };
          const modal = this.modal.create({
            nzTitle: undefined,
            nzContent: CommentModalComponent,
            nzClassName: 'lg',
            nzData: {
              comments
            },
            nzFooter: null,
            nzClosable: false,
            nzMaskClosable: false
          });
          modal.afterClose.subscribe(result => {
            if (result) {
              this.renameScript(result);
            } else {
              this.report.name = this.data.name;
              this.report.path = (this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name);
              this.ref.detectChanges();
            }
          });
        } else {
          this.renameScript();
        }
      } else {
        this.report.name = this.data.name;
        this.report.path = (this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name);
        this.ref.detectChanges();
      }
    }
  }

  private renameScript(comments: any = {}): void {
    const data = this.coreService.clone(this.data);
    const name = this.report.name;
    const obj: any = {
      path: (data.path + (data.path === '/' ? '' : '/') + data.name),
      objectType: this.objectType,
      newPath: name,
      auditLog: {}
    };
    this.coreService.getAuditLogObj(comments, obj.auditLog);
    this.coreService.post('inventory/rename', obj).subscribe({
      next: () => {
        if ((data.path + (data.path === '/' ? '' : '/') + data.name) === (this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name)) {
          this.data.name = name;
        }
        data.name1 = name;
        this.dataService.reloadTree.next({rename: data});
      }, error: () => {
        this.report.name = this.data.name;
        this.report.path = (this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name);
        this.ref.detectChanges();
      }
    });
  }

  release(): void {
    this.dataService.reloadTree.next({release: this.report});
  }

  backToListView(): void {
    this.dataService.reloadTree.next({back: this.report});
  }

  /**
   * Function: redo
   *
   * Redoes the last change.
   */
  redo(): void {
    const n = this.history.length;
    if (this.indexOfNextAdd < n) {
      const obj = this.history[this.indexOfNextAdd++];
      this.report.configuration = JSON.parse(obj);
      this.saveJSON(true);
    }
  }

  /**
   * Function: undo
   *
   * Undoes the last change.
   */
  undo(): void {
    if (this.indexOfNextAdd > 0) {
      const obj = this.history[--this.indexOfNextAdd];
      this.report.configuration = JSON.parse(obj);
      this.saveJSON(true);
    }
  }

  changeDate(type, data): void {
    this.report.configuration[type] = this.coreService.getDateByFormat(data, null, 'YYYY-MM');
    this.saveJSON();
  }

  saveJSON(flag = false): void {
    if (this.isTrash || !this.permission.joc.inventory.manage) {
      return;
    }
    const obj = this.coreService.clone(this.report.configuration);

    if (!isEqual(this.report.actual, JSON.stringify(obj))) {
      if (!flag) {
        if (this.history.length === 20) {
          this.history.shift();
        }
        this.history.push(JSON.stringify(this.report.configuration));
        this.indexOfNextAdd = this.history.length - 1;
      }

      const request: any = {
        configuration: obj,
        valid: !obj.frequencies || !obj.templateName,
        path: this.report.path,
        objectType: this.objectType
      };

      if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
        this.translate.get('auditLog.message.defaultAuditLog').subscribe(translatedValue => {
          request.auditLog = {comment: translatedValue};
        });
      }

      this.coreService.post('inventory/store', request).subscribe({
        next: (res: any) => {
          if (res.path === this.report.path) {
            this.isLocalChange = res.path;
            this.lastModified = res.configurationDate;
            this.report.actual = JSON.stringify(obj);
            this.report.valid = res.valid;
            this.data.valid = res.valid;
            this.report.released = false;
            this.data.released = false;
            this.setErrorMessage(res);
          }
        }, error: () => {
          this.ref.detectChanges();
        }
      });
    }
  }

  private getTemplates(): void {
    this.coreService.post('reporting/templates', {}).subscribe({
      next: (res: any) => {
        this.templates = res.templates;
        this.ref.detectChanges();
      }
    });
  }

  private getObject(): void {
    const URL = this.isTrash ? 'inventory/trash/read/configuration' : 'inventory/read/configuration';
    this.coreService.post(URL, {
      path: (this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name),
      objectType: this.objectType,
    }).subscribe((res: any) => {
      this.isLocalChange = '';
      this.lastModified = res.configurationDate;
      this.history = [];
      this.indexOfNextAdd = 0;
      if (res.configuration) {
        delete res.configuration.TYPE;
        delete res.configuration.path;
        delete res.configuration.version;
        delete res.configuration.versionId;
      } else {
        res.configuration = {};
      }
      if (this.templates.length == 0) {
        this.getTemplates();
      }

      if (this.data.released !== res.released) {
        this.data.released = res.released;
      }
      if (this.data.valid !== res.valid) {
        this.data.valid = res.valid;
      }
      this.report = this.coreService.clone(res);
      this.report.actual = JSON.stringify(this.report.configuration);
      this.report.path1 = this.data.path;
      this.report.name = this.data.name;

      this.history.push(JSON.stringify(this.report.configuration));
      if (!res.valid) {
        this.validateJSON(res.configuration);
      } else {
        this.invalidMsg = '';
      }
      this.ref.detectChanges();
    });
  }

  private validateJSON(json): void {
    const obj = clone(json);
    obj.path = this.data.path;
    this.coreService.post('inventory/' + this.objectType + '/validate', obj).subscribe((res: any) => {
      this.report.valid = res.valid;
      if (this.report.path === this.data.path) {
        this.data.valid = res.valid;
      }
      this.setErrorMessage(res);
    });
  }

  private setErrorMessage(res): void {
    this.invalidMsg = '';
    if (res.invalidMsg) {
      if (!this.invalidMsg) {
        this.invalidMsg = res.invalidMsg;
      }
    }
    this.ref.detectChanges();
  }

}
