import { Injectable } from '@angular/core';

@Injectable()
export class AuthService {

  props = ["accessTokenId", "currentUserData", "sessionTimeout", "permissions", "permission", "scheduleIds"];
  propsPrefix: string = '$SOS$';
  rememberMe = false;
  scheduleIds;
  accessTokenId;
  currentUserData;
  sessionTimeout;
  permissions;
  permission;
  jobChain;

  constructor() {
    let self = this;
    for (let i = 0; i < this.props.length; i++) {
      self[this.props[i]] = this.load(this.props[i]);
    }
  }

  save() {
    let self = this;
    for (let i = 0; i < this.props.length; i++) {
      this._save(sessionStorage, this.props[i], self[this.props[i]]);
    }
  }

  setUser (userData) {
    this.accessTokenId = userData.accessToken;
    this.currentUserData = userData.user;
    this.sessionTimeout = userData.sessionTimeout;
  }

  setPermissions (permissions) {
    this.permissions = JSON.stringify(permissions);
  }

  setIds (scheduleIds) {
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

  private _save(storage, name, value) {
    let key = this.propsPrefix + name;
    if (value == null) value = '';
    storage[key] = value;
  }

  private load(name) {
    let key = this.propsPrefix + name;
    return localStorage[key] || sessionStorage[key] || null;
  }

  getPermission(id) {
    if (this.permissions) {
      let p = JSON.parse(this.permissions).SOSPermissionJocCockpitMaster;
      for (let i = 0; i < p.length; i++) {
        if (p[i].JobSchedulerMaster == id) {
          return p[i].SOSPermissionJocCockpit;
        }
      }
    }
  }

  savePermission(id) {
    if (this.permissions) {
      let p = JSON.parse(this.permissions).SOSPermissionJocCockpitMaster;
      for (let i = 0; i < p.length; i++) {
        if (p[i].JobSchedulerMaster == id) {
          this.permission = JSON.stringify(p[i].SOSPermissionJocCockpit);
          this.save();
          return;
        }
      }
    }
  }
}
