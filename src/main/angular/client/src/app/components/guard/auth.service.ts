import { Injectable } from '@angular/core';

@Injectable()
export class AuthService {

  props = ["accessTokenId", "currentUserData", "sessionTimeout","permissions", "permission", "scheduleIds"];
  propsPrefix:string = '$SOS$';
  rememberMe:boolean = false;
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


  public save() {
    let self = this;
    for (let i = 0; i < this.props.length; i++) {
      this._save(sessionStorage, this.props[i], self[this.props[i]]);
    }
  }

  public setUser = function (userData) {
    this.accessTokenId = userData.accessToken;
    this.currentUserData = userData.user;
    this.sessionTimeout = userData.sessionTimeout;
  };

  public setPermissions = function (permissions) {
    this.permissions = JSON.stringify(permissions);
  };


  public setIds = function (scheduleIds) {
    this.scheduleIds = JSON.stringify(scheduleIds);
  };

  public clearUser() {
    this.accessTokenId = null;
    this.currentUserData = null;
    this.sessionTimeout = null;
    this.permissions = null;
    this.permission = null;
    this.scheduleIds = null;
    sessionStorage.$SOS$URL = null;
    sessionStorage.$SOS$URLPARAMS = {};
  }

  public clearStorage() {
    for (let i = 0; i < this.props.length; i++) {
      this._save(sessionStorage, this.props[i], null);
      this._save(localStorage, this.props[i], null);
    }
  }

  _save(storage, name, value) {
    let key = this.propsPrefix + name;
    if (value == null) value = '';
    storage[key] = value;
  }

  load(name) {
    let key = this.propsPrefix + name;
    return localStorage[key] || sessionStorage[key] || null;
  }

  getPermission(id) {
    if(this.permissions) {
      let p = JSON.parse(this.permissions).SOSPermissionJocCockpitMaster;
      for (let i = 0; i < p.length; i++) {
        if (p[i].JobSchedulerMaster == id) {
          return p[i].SOSPermissionJocCockpit;
        }
      }
    }
  }

  savePermission(id) {
    if(this.permissions) {
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
