import {Component, inject} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef} from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-confirm-modal-content',
  templateUrl: './confirm.component.html'
})
export class ConfirmModalComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  title = '';
  title2 = '';
  message = '';
  message2 = '';
  countMessage = '';
  count: number | undefined;
  type = '';
  objectName: any;
  document: any;
  documentArr: any;
  resetProfiles: any;
  dependencies: any;
  question = '';
  updateFromJobTemplate = '';
  lossNode = '';
  affectedObjectsByType: { [key: string]: any[] } = {};
  referencedObjectsByType: { [key: string]: any[] } = {};
  affectedObjectTypes: string[] = [];
  referencedObjectTypes: string[] = [];
  selectAllAffected: { [key: string]: boolean } = {};
  selectAllReferenced: { [key: string]: boolean } = {};
  affectedCollapsed: { [key: string]: boolean } = {};
  referencedCollapsed: { [key: string]: boolean } = {};
  isAffectedCollapsed: boolean = true;
  isReferencedCollapsed: boolean = true;

  constructor(public activeModal: NzModalRef) {
  }

  ngOnInit(): void {
    this.title = this.modalData.title;
    this.title2 = this.modalData.title2;
    this.message = this.modalData.message;
    this.message2 = this.modalData.message2;
    this.countMessage = this.modalData.countMessage;
    this.count = this.modalData.count;
    this.type = this.modalData.type;
    this.objectName = this.modalData.objectName;
    this.document = this.modalData.document;
    this.documentArr = this.modalData.documentArr;
    this.resetProfiles = this.modalData.resetProfiles;
    this.question = this.modalData.question;
    this.updateFromJobTemplate = this.modalData.updateFromJobTemplate;
    this.lossNode = this.modalData.lossNode;
    this.dependencies = this.modalData.dependencies;
console.log(this.dependencies,">>");
    if(this.dependencies){
      this.prepareObject(this.dependencies)
    }
  }

  prepareObject(dependencies): void {
    if (dependencies && dependencies.length > 0) {
      dependencies.forEach(dep => {
        if (dep.referencedBy) {
          dep.referencedBy.forEach(refObj => {
            const type = refObj.objectType;
            if (!this.affectedObjectsByType[type]) {
              this.affectedObjectsByType[type] = [];
              this.affectedObjectTypes.push(type);
            }

            refObj.selected = refObj.valid && !refObj.deployed && !refObj.released;
            refObj.disabled = !refObj.valid || refObj.deployed || refObj.released;
            this.affectedObjectsByType[type].push(refObj);
          });
        }

        if (dep.references) {
          dep.references.forEach(refObj => {
            const type = refObj.objectType;
            if (!this.referencedObjectsByType[type]) {
              this.referencedObjectsByType[type] = [];
              this.referencedObjectTypes.push(type);
            }

            refObj.selected = refObj.valid && !refObj.deployed && !refObj.released;
            refObj.disabled = !refObj.valid || refObj.deployed || refObj.released;
            this.referencedObjectsByType[type].push(refObj);
          });
        }
      });

      this.affectedObjectTypes.forEach(type => this.affectedCollapsed[type] = true);
      this.referencedObjectTypes.forEach(type => this.referencedCollapsed[type] = true);
    }
  }


  toggleAffectedCollapse(objectType: string): void {
    this.affectedCollapsed[objectType] = !this.affectedCollapsed[objectType];
  }

  toggleReferencedCollapse(objectType: string): void {
    this.referencedCollapsed[objectType] = !this.referencedCollapsed[objectType];
  }

  toggleAllAffectedCollapse(): void {
    this.isAffectedCollapsed = !this.isAffectedCollapsed;
  }

  toggleAllReferencedCollapse(): void {
    this.isReferencedCollapsed = !this.isReferencedCollapsed;
  }

  expandAllAffected(): void {
    this.isAffectedCollapsed = true;
    this.affectedObjectTypes.forEach(type => this.affectedCollapsed[type] = true);
  }

  collapseAllAffected(): void {
    this.isAffectedCollapsed = false;
    this.affectedObjectTypes.forEach(type => this.affectedCollapsed[type] = false);
  }

  expandAllReferenced(): void {
    this.isReferencedCollapsed = true;
    this.referencedObjectTypes.forEach(type => this.referencedCollapsed[type] = true);
  }

  collapseAllReferenced(): void {
    this.isReferencedCollapsed = false;
    this.referencedObjectTypes.forEach(type => this.referencedCollapsed[type] = false);
  }

  toggleAllAffected(objectType: string, isChecked: boolean): void {
    this.affectedObjectsByType[objectType].forEach(obj => {
      if (!obj.disabled) {
        obj.selected = isChecked;
      }
    });
  }

  toggleAllReferenced(objectType: string, isChecked: boolean): void {
    this.referencedObjectsByType[objectType].forEach(obj => {
      if (!obj.disabled) {
        obj.selected = isChecked;
      }
    });
  }

  updateParentCheckboxAffected(objectType: string): void {
    const allSelected = this.affectedObjectsByType[objectType].every(obj => obj.selected || obj.disabled);
    this.selectAllAffected[objectType] = allSelected;
  }

  updateParentCheckboxReferenced(objectType: string): void {
    const allSelected = this.referencedObjectsByType[objectType].every(obj => obj.selected || obj.disabled);
    this.selectAllReferenced[objectType] = allSelected;
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

}
