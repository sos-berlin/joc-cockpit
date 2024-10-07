import { Component, Input } from '@angular/core';
@Component({
  selector: 'app-dependency-tree',
  templateUrl: './dependency-tree.component.html',
})
export class DependencyTreeComponent {
  @Input() nodes: any;
  @Input() isRemove: boolean = false;
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
  ngOnInit(): void {
        this.affectedCollapsed[this.nodes.dependency.path] = true;
        this.referencedCollapsed[this.nodes.dependency.path] = true;
        this.setSelectedProperty(this.nodes);
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


  toggleAffectedCollapse(nodeKey: string): void {
    this.affectedCollapsed[nodeKey] = !this.affectedCollapsed[nodeKey];
  }

  toggleReferencedCollapse(nodeKey: string): void {
    this.referencedCollapsed[nodeKey] = !this.referencedCollapsed[nodeKey];
  }


  toggleAllAffected(objectType: string, isChecked: boolean): void {
    if (this.affectedObjectsByType[objectType]) {
      this.affectedObjectsByType[objectType].forEach((obj: any) => {
        if (!obj.disabled) {
          obj.selected = isChecked;
        }
      });
    }
    // Update the parent checkbox state after toggling all
    this.updateParentCheckboxAffected(objectType);
  }

  toggleAllReferenced(objectType: string, isChecked: boolean): void {
    if (this.referencedObjectsByType[objectType]) {
      this.referencedObjectsByType[objectType].forEach((obj: any) => {
        if (!obj.disabled) {
          obj.selected = isChecked;
        }
      });
    }
    // Update the parent checkbox state after toggling all
    this.updateParentCheckboxReferenced(objectType);
  }

  updateParentCheckboxAffected(objectType: string): void {
    if (this.affectedObjectsByType[objectType]) {
      const allSelected = this.affectedObjectsByType[objectType].every((obj: any) => obj.selected || obj.disabled);
      this.selectAllAffected[objectType] = allSelected;
    }
  }

  updateParentCheckboxReferenced(objectType: string): void {
    if (this.referencedObjectsByType[objectType]) {
      const allSelected = this.referencedObjectsByType[objectType].every((obj: any) => obj.selected || obj.disabled);
      this.selectAllReferenced[objectType] = allSelected;
    }
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

  getUniqueObjectTypes(ref: any[]): string[] {
    return [...new Set(ref.map(item => item.dependency.objectType))];
  }

  private setSelectedProperty(node: any): void {
    if (node.dependency) {
      node.dependency.selected = node.dependency.valid && (!node.dependency.deployed && !node.dependency.released);
      node.dependency.disabled = !node.dependency.valid;
      node.dependency.change = node.dependency.deployed;
    }

    if (this.isRemove) {
      node.dependency.selected = true;
      node.dependency.disabled = false;
    }

    if (node.referencedBy && node.referencedBy.length) {
      node.referencedBy.forEach((referencedNode: any) => this.setSelectedProperty(referencedNode));
    }
    if (node.references && node.references.length) {
      node.references.forEach((referenceNode: any) => this.setSelectedProperty(referenceNode));
    }
  }

}
