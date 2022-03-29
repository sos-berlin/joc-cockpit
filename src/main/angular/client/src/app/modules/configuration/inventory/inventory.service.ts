import {Injectable} from '@angular/core';
import {sortBy, groupBy} from 'underscore';
import {InventoryObject} from '../../../models/enums';

@Injectable()
export class InventoryService {
  checkDeploymentStatus = {
    isChecked: false
  };
  agentList: any = [];

  sortList(arr: any[]): any {
    for (const i in arr) {
      if (arr[i]) {
        if (arr[i].objectType === InventoryObject.WORKFLOW) {
          arr[i].level = 0;
        } else if (arr[i].objectType === InventoryObject.FILEORDERSOURCE) {
          arr[i].level = 1;
        } else if (arr[i].objectType === InventoryObject.JOBRESOURCE) {
          arr[i].level = 2;
        } else if (arr[i].objectType === InventoryObject.NOTICEBOARD) {
          arr[i].level = 3;
        } else if (arr[i].objectType === InventoryObject.LOCK) {
          arr[i].level = 4;
        } else if (arr[i].objectType === InventoryObject.INCLUDESCRIPT) {
          arr[i].level = 5;
        } else if (arr[i].objectType === InventoryObject.SCHEDULE) {
          arr[i].level = 6;
        } else if (arr[i].objectType === InventoryObject.WORKINGDAYSCALENDAR) {
          arr[i].level = 7;
        } else if (arr[i].objectType === InventoryObject.NONWORKINGDAYSCALENDAR) {
          arr[i].level = 8;
        }
      }
    }
    return sortBy(arr, 'level');
  }

  updateTree(data: any): void {
    if (data.children && data.children.length > 0) {
      for (const i in data.children) {
        if (data.children[i]) {
          this.updateTree(data.children[i]);
        }
      }
    }
    if ((data.deployables && data.deployables.length > 0) || (data.releasables && data.releasables.length > 0) || (data.items && data.items.length > 0)) {
      if (!data.children) {
        data.children = [];
      }
      const x = groupBy(this.sortList(data.deployables || data.releasables || data.items), (res) => {
        return res.objectType;
      });
      const tempArr = [];
      for (const [key, value] of Object.entries(x)) {
        const temp: any = value;
        const parentObj: any = {
          name: value[0].objectType,
          object: value[0].objectType,
          path: value[0].folder,
          key: value[0].folder + (value[0].folder === '/' ? '' : '/') + value[0].objectType,
          disableCheckbox: true,
          isLeaf: true
        };
        tempArr.push(parentObj);
        temp.forEach(item => {
          const child: any = data.items ? {
            name: item.objectName,
            path: item.folder,
            key: item.folder + (item.folder === '/' ? '' : '/') + item.objectType,
            type: item.objectType,
            lastModified: item.lastModified,
            isLeaf: true
          } : {
            name: item.objectName,
            path: item.folder,
            key: item.id,
            type: item.objectType,
            deleted: item.deleted,
            deployed: item.deployed,
            released: item.released,
            valid: item.valid,
            syncState: item.syncState,
            deploymentId: item.deploymentId,
            deployablesVersions: item.deployablesVersions,
            releasableVersions: item.releasableVersions,
            isLeaf: true
          };
          tempArr.push(child);
        });
      }
      data.children = tempArr.concat(data.children);
      delete data.deployables;
      delete data.releasables;
      delete data.items;
    }
  }

  checkHalfCheckBox(parentNode: any, isCheck: any): boolean {
    let flag = true;
    for (const i in parentNode.children) {
      if (parentNode.children[i]) {
        if (parentNode.children[i].origin.type) {
          if ((isCheck && !parentNode.children[i].isChecked) || (!isCheck && parentNode.children[i].isChecked)) {
            flag = false;
            break;
          }
        }
        if (parentNode.children[i].origin.isFolder) {
          break;
        }
      }
    }
    return flag;
  }

  checkAndUpdateVersionList(data: any): void {
    data.isCall = true;
    for (let i = 0; i < data.children.length; i++) {
      if (data.children[i].deployablesVersions && data.children[i].deployablesVersions.length > 0) {
        data.children[i].deployId = '';
        if (data.children[i].deployablesVersions[0].versions && data.children[i].deployablesVersions[0].versions.length > 0) {
          data.children[i].deployId = data.children[i].deployablesVersions[0].deploymentId;
        } else if (!data.children[i].deployablesVersions[0].deploymentId) {
          data.children[i].deployablesVersions[0].deploymentId = '';
        }
      }
      if (data.children[i].releasableVersions && data.children[i].releasableVersions.length > 0) {
        data.children[i].releaseId = data.children[i].releasableVersions[0].releaseId || '';
      }
    }
  }

  isControllerObject(type: string): boolean {
    return type === InventoryObject.WORKFLOW || type === InventoryObject.NOTICEBOARD
      || type === InventoryObject.LOCK || type === InventoryObject.FILEORDERSOURCE || type === InventoryObject.JOBRESOURCE;
  }

  preselected(node: any): void {
    node.checked = true;
    for (let i = 0; i < node.children.length; i++) {
      if (node.children[i].type) {
        node.children[i].checked = node.checked;
      }
      if (!node.children[i].type && !node.children[i].object) {
        break;
      }
    }
  }
}

