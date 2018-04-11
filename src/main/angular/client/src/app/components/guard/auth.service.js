/*
import { Injectable } from '@angular/core';
@Injectable()
export class SOSAuth {

  props = ["accessTokenId", "currentUserData", "sessionTimeout", "jobChain", "permission", "scheduleIds"];
  propsPrefix:string = '$SOS$';
  rememberMe:boolean = false;
  scheduleIds;
  accessTokenId;
  currentUserData;
  sessionTimeout;
  permission;
  jobChain;

  constructor() {
    let self = this;
    this.props.forEach(function (name) {
      self[name] = this.load(name);
    });
    this.rememberMe = undefined;
  }


  public save() {
    let self = this;
    this.props.forEach(function (name) {
        this.save1(sessionStorage, name, self[name]);
    });
  }

  public setUser = function (userData) {
    this.accessTokenId = userData.accessToken;
    this.currentUserData = userData.user;
    this.sessionTimeout = userData.sessionTimeout;
  };

  public setPermission = function (permission) {
    this.permission = JSON.stringify(permission);
  };

  public setIds = function (scheduleIds) {
    this.scheduleIds = JSON.stringify(scheduleIds);
  };

  public clearUser () {
    this.accessTokenId = null;
    this.currentUserData = null;
    this.sessionTimeout = null;
    this.permission = null;
    this.scheduleIds = null;
    sessionStorage.$SOS$URL = null;
    sessionStorage.$SOS$URLPARAMS = {};
  }

  public setJobChain (jobChain) {
    this.jobChain = jobChain;
    let self = this;
    let prop = 'jobChain';
    this.save1(sessionStorage, prop, self[prop]);
  }

  public getJobChain  () {
    return this.jobChain;
  }

  public clearStorage () {
    this.props.forEach(function (name) {
      this.save1(sessionStorage, name, null);
      this.save1(localStorage, name, null);
    });
  }


  save1(storage, name, value) {
    let key = this.propsPrefix + name;
    if (value == null) value = '';
    storage[key] = value;
  }

  load(name) {
    let key = this.propsPrefix + name;
    return localStorage[key] || sessionStorage[key] || null;
  }
}
*/
//# sourceMappingURL=auth.service.js.map