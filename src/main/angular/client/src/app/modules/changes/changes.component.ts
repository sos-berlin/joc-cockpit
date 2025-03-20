import {Component, inject, ChangeDetectorRef} from "@angular/core";
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
  nodes: any[] = [];
  loading = false
  INVchanges = false
  selectedChange: any;
  data: any;
  affectedObjectsByType: { [key: string]: any[] } = {};
  referencedObjectsByType: { [key: string]: any[] } = {};
  affectedObjectTypes: string[] = [];
  referencedObjectTypes: string[] = [];
  affectedCollapsed: { [key: string]: boolean } = {};
  referencedCollapsed: { [key: string]: boolean } = {};
  constructor(public activeModal: NzModalRef, private coreService: CoreService, private authService: AuthService, private cdRef: ChangeDetectorRef ){}

  ngOnInit(): void {
    this.schedulerIds = JSON.parse(this.authService.scheduleIds);
    this.display = this.modalData.display;
    this.title = this.modalData.title;
    this.changes = this.modalData.changes;
    this.flag = this.modalData.flag;
    this.originalName = this.modalData.originalName;
    this.INVchanges = this.modalData.INVchanges;
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
    if(this.INVchanges){
      this.changesData()
    }
  }
  changesData():void{
    this.loading = true;
    this.coreService.post('inventory/changes', {details: true}).subscribe({
      next: (res) => {
        this.changes = res.changes
        this.loading = false;
      },
      error: ()=> {
        this.loading = false;
      }
    });
  }

  onChange(selected: string): void {
    const slectedChange = this.changes.filter(change => change.name === selected);
    this.nodes = this.prepareChangesTree(slectedChange);
    const checkedNodes = this.collectObjects(this.nodes);

    if (checkedNodes.length > 0) {
      setTimeout(() => {
        this.getDependencies(checkedNodes);
      }, 100)
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


  prepareChangesTree(dataArray: any[]): any[] {

    const rootNodes = [];

    dataArray.forEach(data => {
      if (data.state !== "OPEN") {
        return;
      }
      const ownerRoot = {
        name: data.name || 'root',
        path: '/',
        key: `/owner/${data.name || 'root'}`,
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

      data?.configurations?.forEach((item: any) => {
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
          ownerRoot.children.push(groupNode);
        }
      });

      rootNodes.push(ownerRoot);
    });

    return rootNodes;
  }

  getIcon(objectType: string): string {
    const iconMapping = {
      'WORKFLOW': 'apartment',
      'JOBRESOURCE': 'icon-resources-icon',
      'LOCK': 'lock',
      'NOTICEBOARD': 'pushpin',
      'FILEORDERSOURCE': 'icon-orders-icon',
      'CALENDAR': 'calendar',
      'SCHEDULE': 'schedule',
      'JOBTEMPLATE': 'icon-jobs-icon'
    };
    return iconMapping[objectType] || 'folder';
  }

  isCustomIcon(objectType: string): boolean {
    const customIcons = ['icon-resources-icon', 'icon-orders-icon', 'icon-jobs-icon'];
    return customIcons.includes(this.getIcon(objectType));
  }

  getObjectTypeLabel(objectType: string): string {
    const labelMapping = {
      'WORKFLOW': 'inventory.label.workflows',
      'JOBRESOURCE': 'inventory.label.jobResources',
      'LOCK': 'inventory.label.locks',
      'NOTICEBOARD': 'inventory.label.boards',
      'FILEORDERSOURCE': 'inventory.label.fileOrderSources',
      'CALENDAR': 'inventory.label.calendars',
      'SCHEDULE': 'dashboard.label.schedules',
      'JOBTEMPLATE': 'inventory.label.jobTemplates'
    };
    return labelMapping[objectType] || objectType;
  }

  getUniqueObjectTypes(objects: any[]): string[] {
    return [...new Set(objects.map(obj => obj.objectType))];
  }

  getObjectsByType(objects: any[], type: string): any[] {
    return objects.filter(obj => obj.objectType === type);
  }
  toggleAffectedCollapse(nodeKey: string): void {
    this.affectedCollapsed[nodeKey] = !this.affectedCollapsed[nodeKey];
  }

  toggleReferencedCollapse(nodeKey: string): void {
    this.referencedCollapsed[nodeKey] = !this.referencedCollapsed[nodeKey];
  }

  private collectObjects(nodes: any[]): any[] {
    const objects = [];
    nodes.forEach(node => {
      if (node.type) {
        objects.push({name: node.name, type: node.type});
      }
      if (node.children && node.children.length > 0) {
        objects.push(...this.collectObjects(node.children));
      }
    });
    return objects;
  }

  private getDependencies(checkedNodes: { name: string, type: string }[]): void {
    const configurations = checkedNodes.map(node => ({
      name: node.name,
      type: node.type,
    }));

    const requestBody = {configurations: configurations};

    this.coreService.post('inventory/dependencies', requestBody).subscribe({
      next: (res: any) => {
        if (res.dependencies && res.dependencies?.requestedItems.length > 0 && res.dependencies?.affectedItems.length > 0) {
          this.updateNodeDependencies(res.dependencies);
          this.prepareObject(res.dependencies);
        } else {
        }

      },
      error: (err) => {
      }
    });
  }

  private prepareObject(dependencies: any): void {
    if (dependencies && dependencies?.requestedItems.length > 0) {

      dependencies?.requestedItems.forEach(dep => {
        if (dep.referencedBy) {
          const affectedTypeSet = new Set<string>();
          dep.referencedBy.forEach(refObj => {
            const type = refObj.objectType;
            affectedTypeSet.add(type);
            if (!this.affectedObjectsByType[type]) {
              this.affectedObjectsByType[type] = [];
              this.affectedObjectTypes.push(type);
            }


            this.affectedObjectsByType[type].push(refObj);
          });
        }

        if (dep.references) {
          const referencedTypeSet = new Set<string>();
          dep.references.forEach(refObj => {
            const type = refObj.objectType;
            referencedTypeSet.add(type);
            if (!this.referencedObjectsByType[type]) {
              this.referencedObjectsByType[type] = [];
              this.referencedObjectTypes.push(type);
            }

            this.referencedObjectsByType[type].push(refObj);


          });
        }

      });
      this.affectedObjectTypes.forEach(type => this.affectedCollapsed[type] = true);
      this.referencedObjectTypes.forEach(type => this.referencedCollapsed[type] = true);

    }
  }

  private updateNodeDependencies(dependenciesResponse: any): void {
    const requestedItems = dependenciesResponse.requestedItems;

    const referencedSet = new Set<string>();
    requestedItems.forEach(item => {
      item.references?.forEach(ref => {
        referencedSet.add(`${ref.name}-${ref.objectType}`);
      });
      item.referencedBy?.forEach(refBy => {
        referencedSet.add(`${refBy.name}-${refBy.objectType}`);
      });
    });

    const requestedSet = new Set<string>();
    requestedItems.forEach(item => {
      requestedSet.add(`${item.name}-${item.objectType}`);
    });


    requestedItems.forEach(dep => {
      this.findAndUpdateNodeWithDependencies(dep, this.nodes);
    });

    this.nodes = [...this.nodes];
  }


  private findAndUpdateNodeWithDependencies(dep: any, nodes: any[]): any {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (node.name === dep.name && node.type === dep.type) {
        node.dependencies = dep;
        return node;
      }

      if (node.children && node.children.length > 0) {
        const foundNode = this.findAndUpdateNodeWithDependencies(dep, node.children);
        if (foundNode) {
          return foundNode;
        }
      }
    }

    return null;
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

  expandAll(nodes): void {
    nodes.forEach(node => {
      node.expanded = true; // Expand the node
      if (node.children && node.children.length > 0) {

          this.expandAll(node.children); // Recursively expand children
      }
    });
    this.nodes = [...nodes];
    this.cdRef.detectChanges();
  }

  collapseAll(nodes): void {
    nodes.forEach(node => {
      node.expanded = false; // Expand the node
      if (node.children && node.children.length > 0) {

          this.expandAll(node.children); // Recursively expand children
      }
    });
    this.nodes = [...nodes];
    this.cdRef.detectChanges();
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
