import {Injectable} from '@angular/core';
import * as _ from 'underscore';

@Injectable()
export class InventoryService {

  sortList(arr) {
    let temp = [];
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].objectType === 'WORKFLOW') {
        arr[i].level = 0;
      } else if (arr[i].objectType === 'JOBCLASS') {
        arr[i].level = 1;
      } else if (arr[i].objectType === 'JUNCTION') {
        arr[i].level = 2;
      } else if (arr[i].objectType === 'LOCK') {
        arr[i].level = 3;
      } else if (arr[i].objectType === 'SCHEDULE') {
        arr[i].level = 4;
      } else if (arr[i].objectType === 'WORKINGDAYSCALENDAR') {
        arr[i].level = 5;
      } else if (arr[i].objectType === 'NONWORKINGDAYSCALENDAR') {
        arr[i].level = 6;
      }
      if (arr[i].objectType !== 'FOLDER') {
        temp.push(arr[i]);
      }
    }
    return _.sortBy(temp, 'level');
  }

  generateTree(arr, treeArr) {
    for (const [key, value] of Object.entries(arr)) {
      if (key !== '/') {
        let paths = key.split('/');
        if (paths.length > 1) {
          let pathArr = [];
          for (let i = 0; i < paths.length; i++) {
            if (paths[i]) {
              if (i > 0 && pathArr[i - 1]) {
                pathArr.push(pathArr[i - 1] + (pathArr[i - 1] === '/' ? '' : '/') + paths[i]);
              } else {
                pathArr.push('/' + paths[i]);
              }
            } else {
              pathArr.push('/');
            }
          }
          for (let i = 1; i < pathArr.length; i++) {
            this.checkAndAddFolder(pathArr[i], treeArr);
          }
        }
      }
      this.checkFolderRecur(key, value, treeArr);
    }
  }

  private checkFolderRecur(_path, data, treeArr) {
    let flag = false;
    let arr = [];
    if (data.length > 0) {
      arr = this.createTempArray(data);
    }

    function recursive(path, nodes) {
      for (let i = 0; i < nodes.length; i++) {
        if (!nodes[i].type && !nodes[i].object) {
          if (nodes[i].path === path) {
            nodes[i].isLeaf = false;
            if (!nodes[i].children || nodes[i].children.length === 0) {
              for (let j = 0; j < arr.length; j++) {
                if (arr[j].name === nodes[i].name && arr[j].path === nodes[i].path) {
                  nodes[i].key = arr[j].key;
                  nodes[i].deleted = arr[j].deleted;
                  nodes[i].isFolder = true;
                  arr.splice(j, 1);
                  break;
                }
              }
              nodes[i].children = arr;
            } else {
              nodes[i].children = nodes[i].children.concat(arr);
            }
            if (nodes[i].children.length === 0 && !nodes[i].isFolder) {
              nodes[i].isLeaf = true;
            }
            flag = true;
            break;
          }
          if (!flag && nodes[i].children) {
            recursive(path, nodes[i].children);
          }
        }
      }
    }

    if (treeArr && treeArr[0]) {
      treeArr[0].expanded = true;
      recursive(_path, treeArr);
    }
  }

  private checkAndAddFolder(_path, treeArr) {
    let node: any;

    function recursive(path, nodes) {
      for (let i = 0; i < nodes.length; i++) {
        if (!nodes[i].type && !nodes[i].object) {
          if (nodes[i].path === path.substring(0, path.lastIndexOf('/') + 1) || nodes[i].path === path.substring(0, path.lastIndexOf('/'))) {
            node = nodes[i];
            break;
          }
          if (nodes[i].children) {
            recursive(path, nodes[i].children);
          }
        }
      }
    }

    recursive(_path, treeArr);

    if (node) {
      let falg = false;
      for (let x = 0; x < node.children.length; x++) {
        if (!node.children[x].type && !node.children[x].object && node.children[x].path === _path) {
          falg = true;
          break;
        }
      }
      if (!falg) {
        node.isLeaf = false;
        node.children.push({
          name: _path.substring(_path.lastIndexOf('/') + 1),
          path: _path,
          key: _path,
          isFolder: true,
          children: []
        });
      }
    }
  }

  private createTempArray(arr) {
    let x = _.groupBy(arr, (res) => {
      return res.objectType;
    });
    let tempArr = [], folderArr = [];
    for (const [key, value] of Object.entries(x)) {
      const temp: any = value;
      if (key !== 'FOLDER') {
        let parentObj: any = {
          name: value[0].objectType,
          object: value[0].objectType,
          path: value[0].folder,
          key: value[0].folder + (value[0].folder === '/' ? '' : '/') + value[0].objectType,
          isLeaf: true
        };
        tempArr.push(parentObj);
        temp.forEach(data => {
          const child: any = {
            name: data.objectName,
            path: data.folder,
            key: data.id,
            type: data.objectType,
            deleted: data.deleted,
            deployed: data.deployed,
            released: data.released,
            valid: data.valid,
            deploymentId: data.deploymentId,
            deployablesVersions: data.deployablesVersions,
            releasableVersions: data.releasableVersions,
            isLeaf: true
          };
          tempArr.push(child);
        });

      } else {
        /*        temp.forEach(data => {
                  folderArr.push({
                    name: data.objectName,
                    path: data.folder + (data.folder === '/' ? '' : '/') + data.objectName,
                    key: data.folder + (data.folder === '/' ? '' : '/') + data.objectName,
                    isFolder: true,
                    isLeaf: true,
                    deleted: data.deleted,
                    children: []
                  });
                });*/

      }
    }
    return tempArr.concat(folderArr);
  }

  getParent(node, flag, recursive, treeCtrl) {
    const parent = treeCtrl.getTreeNodeByKey(node.path);
    if (parent) {
      if (!flag) {
        parent.origin.recursivelyDeploy = flag;
      } else if (parent.origin.children) {
        let flg = true;
        for (let i = 0; i < parent.origin.children.length; i++) {
          if (parent.origin.children[i].type && !parent.origin.children[i].recursivelyDeploy) {
            flg = false;
            break;
          } else if (!parent.origin.children[i].type && !parent.origin.children[i].object && !parent.origin.children[i].recursivelyDeploy && recursive) {
            flg = false;
            break;
          }
        }
        parent.origin.recursivelyDeploy = flg;
      }
      if (parent.origin.path !== '/') {
        if (parent.getParentNode() && recursive) {
          this.getParent(parent.getParentNode().origin, flag, recursive, treeCtrl);
        }
      }
    }
  }

  toggleObject(data, flag, recursive) {
    for (let i = 0; i < data.children.length; i++) {
      if (data.children[i].type) {
        data.children[i].recursivelyDeploy = flag;
      } else if (!data.children[i].object && recursive) {
        data.children[i].recursivelyDeploy = flag;
        this.toggleObject(data.children[i], flag, recursive);
      }
    }
  }

  checkAndUpdateVersionList(data) {
    data.isCall = true;
    for (let i = 0; i < data.children.length; i++) {
      if (data.children[i].deployablesVersions && data.children[i].deployablesVersions.length > 0) {
        data.children[i].deployId = '';
        if (data.children[i].deployablesVersions[0].versions && data.children[i].deployablesVersions[0].versions.length > 0) {
          data.children[i].deployId = data.children[i].deployablesVersions[0].deploymentId;
        }
      }
      if (data.children[i].releasableVersions && data.children[i].releasableVersions.length > 0) {
        data.children[i].releaseId = data.children[i].releasableVersions[0].releaseId;
      }
    }
  }

  isControllerObject(type) {
    return type === 'WORKFLOW' || type === 'JOBCLASS' || type === 'JUNCTION' || type === 'LOCK';
  }
}

