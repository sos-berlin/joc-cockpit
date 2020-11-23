import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  props = ['accessTokenId', 'currentUserData', 'sessionTimeout', 'permissions', 'permission', 'scheduleIds'];
  propsPrefix = '$SOS$';
  rememberMe = false;
  scheduleIds;
  accessTokenId;
  currentUserData;
  sessionTimeout;
  permissions;
  permission;
  Workflow;

  constructor() {
    const self = this;
    for (let i = 0; i < this.props.length; i++) {
      self[this.props[i]] = this.load(this.props[i]);
    }
  }

  save() {
    const self = this;
    for (let i = 0; i < this.props.length; i++) {
      this._save(sessionStorage, this.props[i], self[this.props[i]]);
    }
  }

  setUser(userData) {
    this.accessTokenId = userData.accessToken;
    this.currentUserData = userData.user;
    this.sessionTimeout = userData.sessionTimeout;
  }

  setPermissions(permissions) {
    this.permissions = JSON.stringify(permissions);
  }

  setIds(scheduleIds) {
    this.scheduleIds = JSON.stringify(scheduleIds);
  }

  clearUser() {
    this.accessTokenId = null;
    this.currentUserData = null;
    this.sessionTimeout = null;
    this.permissions = null;
    this.permission = null;
    this.scheduleIds = null;
    sessionStorage.$SOS$URL = null;
  }

  clearStorage() {
    for (let i = 0; i < this.props.length; i++) {
      this._save(sessionStorage, this.props[i], null);
      this._save(localStorage, this.props[i], null);
    }
  }

  getPermission(id) {
    if (this.permissions) {
      const p = JSON.parse(this.permissions).SOSPermissionJocCockpitController;
      if (p) {
        let flag = true;
        for (let i = 0; i < p.length; i++) {
          if (p[i].JS7Controller == id) {
            flag = false;
            return p[i].SOSPermissionJocCockpit;
          }
        }
        if (flag) {
          return p[0].SOSPermissionJocCockpit;
        }
      }
    }
  }

  savePermission(id) {
    if (this.permissions) {
      const p = JSON.parse(this.permissions).SOSPermissionJocCockpitController;
      if (p) {
        let flag = true;
        for (let i = 0; i < p.length; i++) {
          if (p[i].JS7Controller == id) {
            flag = false;
            this.permission = JSON.stringify(p[i].SOSPermissionJocCockpit);
            break;
          }
        }
        if (flag) {
          this.permission = JSON.stringify(p[0].SOSPermissionJocCockpit);
        }
        this.save();
      }
    }
  }

  permissionCheck(routePath) {
    let showViews: any = {};
    if (window.sessionStorage.showViews) {
      showViews = JSON.parse(window.sessionStorage.showViews);
    }
    const permission = JSON.parse(this.permission);
    let ifPermissionPassed = false;
    switch (routePath) {
      case 'Dashboard':
        if (showViews.dashboard !== undefined) {
          if (showViews.dashboard === true) {
            ifPermissionPassed = true;
          }
        } else {
          ifPermissionPassed = true;
        }
        break;
      case 'DailyPlan':
        if (showViews.dailyPlan !== undefined) {
          if (showViews.dailyPlan) {
            ifPermissionPassed = true;
          }
        } else {
          if (permission.DailyPlan && permission.DailyPlan.view.status) {
            ifPermissionPassed = true;
          }
        }
        break;
      case 'WorkFlow':
        if (showViews.workflows !== undefined) {
          if (showViews.workflows) {
            ifPermissionPassed = true;
          }
        } else {
          if (permission.Workflow && permission.Workflow.view.configuration) {
            ifPermissionPassed = true;
          }
        }
        break;
      case 'Order':
        if (showViews.orders !== undefined) {
          if (showViews.orders) {
            ifPermissionPassed = true;
          }
        } else {
          if (permission.Order && permission.Order.view.status) {
            ifPermissionPassed = true;
          }
        }
        break;
      case 'History':
        if (showViews.history !== undefined) {
          if (showViews.history === true) {
            ifPermissionPassed = true;
          }
        } else {
          if (permission.History && (permission.History.view.status || permission.YADE.view.status)) {
            ifPermissionPassed = true;
          }
        }
        break;
      case 'Resource':
        if (showViews.resources !== undefined) {
          if (showViews.resources === true) {
            ifPermissionPassed = true;
          }
        } else {
          if (permission.JS7UniversalAgent && (permission.JS7UniversalAgent.view.status || permission.Lock.view.status
            || permission.Calendar.view.status || permission.Documentation.view)) {
            ifPermissionPassed = true;
          }
        }
        break;
      case 'AuditLog':
        if (showViews.auditLog !== undefined) {
          if (showViews.auditLog === true) {
            ifPermissionPassed = true;
          }
        } else {
          if (permission.AuditLog && permission.AuditLog.view.status) {
            ifPermissionPassed = true;
          }
        }
        break;
      case 'File Transfer':
        if (showViews.fileTransfers !== undefined) {
          if (showViews.fileTransfers === true) {
            ifPermissionPassed = true;
          }
        } else {
          if (permission.YADE && permission.YADE.view.status) {
            ifPermissionPassed = true;
          }
        }
        break;
      case 'Configuration':
        if (showViews.configurations !== undefined) {
          if (showViews.configurations === true) {
            ifPermissionPassed = true;
          }
        } else {
          if (permission.Inventory && permission.Inventory.configurations &&
            (permission.Inventory.configurations.view ||
              permission.YADE.configurations.view)) {
            ifPermissionPassed = true;
          }
        }
        break;
      case 'ManageAccount':
        if (permission.JS7Controller && permission.JS7Controller.administration.editPermissions) {
          ifPermissionPassed = true;
        }
        break;
      default:
        ifPermissionPassed = true;
    }
    return ifPermissionPassed;
  }

  private _save(storage, name, value) {
    const key = this.propsPrefix + name;
    if (value == null) value = '';
    storage[key] = value;
  }

  private load(name) {
    const key = this.propsPrefix + name;
    return localStorage[key] || sessionStorage[key] || null;
  }
}
