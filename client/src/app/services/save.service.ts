import { Injectable } from '@angular/core';

@Injectable()
export class SaveService {

  props = ['jobChainFilters', 'orderFilters', 'jobFilters', 'yadeFilters', 'eventFilters', 'historyFilters', 'ignoreList', 'dailyPlanFilters'];
  propsPrefix:string = '$SOS$';
  jobChainFilters;
  orderFilters;
  jobFilters;
  yadeFilters;
  eventFilters;
  historyFilters;
  ignoreList;
  dailyPlanFilters;

  constructor() {
    let self = this;
    for (let i = 0; i < this.props.length; i++) {
      self[this.props[i]] = this.load(this.props[i]);
    }
  }

  public save() {
    let self = this;
    for (let i = 0; i < this.props.length; i++) {
      this._save(localStorage, this.props[i], self[this.props[i]]);
    }
  }

  public setJobChain = function (jobChain) {
    this.jobChainFilters = JSON.stringify(jobChain);
  };
  public setOrder = function (order) {
    this.orderFilters = JSON.stringify(order);
  };
  public setJob = function (job) {
    this.jobFilters = JSON.stringify(job);
  };
  public setYade = function (yade) {
    this.yadeFilters = JSON.stringify(yade);
  };
  public setEvent = function (event) {
    this.eventFilters = JSON.stringify(event);
  };
  public setHistory = function (history) {
    this.historyFilters = JSON.stringify(history);
  };
  public setIgnoreList = function (ignoreList) {
    this.ignoreList = JSON.stringify(ignoreList);
  };
  public setDailyPlan = function (dailyPlan) {
    this.dailyPlanFilters = JSON.stringify(dailyPlan);
  };

  _save(storage, name, value) {
    let key = this.propsPrefix + name;
    if (value == null) value = '';
    storage[key] = value;
  }

  load(name) {
    let key = this.propsPrefix + name;
    return localStorage[key] || null;
  }

}
