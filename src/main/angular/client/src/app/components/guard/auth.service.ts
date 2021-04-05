import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  props = ['accessTokenId', 'currentUserData', 'sessionTimeout', 'permission', 'scheduleIds'];
  propsPrefix = '$SOS$';
  rememberMe = false;
  scheduleIds;
  accessTokenId;
  currentUserData;
  sessionTimeout;
  permission;

  constructor() {
    const self = this;
    for (let prop of this.props) {
      self[prop] = this.load(prop);
    }
  }

  save(): void {
    const self = this;
    for (let prop of this.props) {
      this._save(sessionStorage, prop, self[prop]);
    }
  }

  setUser(userData): void {
    this.accessTokenId = userData.accessToken;
    this.currentUserData = userData.user;
    this.sessionTimeout = userData.sessionTimeout;
  }

  setPermission(permission): void {
    this.permission = JSON.stringify(permission);
  }

  setIds(scheduleIds): void {
    this.scheduleIds = JSON.stringify(scheduleIds);
  }

  clearUser(): void {
    this.accessTokenId = null;
    this.currentUserData = null;
    this.sessionTimeout = null;
    this.permission = null;
    this.scheduleIds = null;
    sessionStorage.$SOS$URL = null;
  }

  clearStorage(): void {
    for (let prop of this.props) {
      this._save(sessionStorage, prop, null);
      this._save(localStorage, prop, null);
    }
  }

  permissionCheck(routePath): boolean {
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
          if (permission.joc && permission.joc.dailyPlan.view && permission.currentController.orders.view) {
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
          if (permission.currentController && permission.currentController.workflows.view) {
            ifPermissionPassed = true;
          }
        }
        break;
      case 'Order':
        if (permission.currentController && permission.currentController.orders.view) {
          ifPermissionPassed = true;
        }
        break;
      case 'History':
        if (showViews.history !== undefined) {
          if (showViews.history === true) {
            ifPermissionPassed = true;
          }
        } else {
          if (permission.joc && (permission.joc || permission.joc.fileTransfer.view
            || permission.currentController.deployments.view || permission.joc.dailyPlan.view)) {
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
          if (permission.currentController && (permission.currentController.agents.view || permission.currentController.locks.view
            || permission.joc.calendars.view || permission.joc.documentations.view)) {
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
          if (permission.joc && permission.joc.auditLog.view) {
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
          if (permission.joc && permission.joc.fileTransfer.view) {
            ifPermissionPassed = true;
          }
        }
        break;
      case 'Configuration':
        if (showViews.configuration !== undefined) {
          if (showViews.configuration === true) {
            ifPermissionPassed = true;
          }
        } else {
          if (permission.joc && permission.joc.inventory.view || permission.joc.fileTransfer.view
            || permission.joc.notification.view || permission.joc.others.view) {
            ifPermissionPassed = true;
          }
        }
        break;
      case 'ManageAccount':
        if (permission.joc.administration.accounts.view) {
          ifPermissionPassed = true;
        }
        break;
      default:
        ifPermissionPassed = true;
    }
    return ifPermissionPassed;
  }

  private _save(storage, name, value): void {
    const key = this.propsPrefix + name;
    if (value == null) {
      value = '';
    }
    storage[key] = value;
  }

  private load(name): any {
    const key = this.propsPrefix + name;
    return localStorage[key] || sessionStorage[key] || null;
  }
}
