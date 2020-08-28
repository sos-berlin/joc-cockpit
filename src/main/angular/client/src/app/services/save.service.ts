import { Injectable } from '@angular/core';

@Injectable()
export class SaveService {

  props = ['workflowFilters', 'jobFilters', 'yadeFilters', 'historyFilters', 'auditLogFilters', 'ignoreList', 'dailyPlanFilters', 'resizerHeight'];
  propsPrefix = '$SOS$';
  workflowFilters;
  jobFilters;
  yadeFilters;
  historyFilters;
  auditLogFilters;
  ignoreList;
  dailyPlanFilters;
  resizerHeight;

  constructor() {
    const self = this;
    for (let i = 0; i < this.props.length; i++) {
      self[this.props[i]] = this.load(this.props[i]);
    }
  }

  save() {
    const self = this;
    for (let i = 0; i < this.props.length; i++) {
      this._save(localStorage, this.props[i], self[this.props[i]]);
    }
  }


  setWorkflow(workflow) {
    this.workflowFilters = JSON.stringify(workflow);
  }

  setJob(job) {
    this.jobFilters = JSON.stringify(job);
  }

  setYade(yade) {
    this.yadeFilters = JSON.stringify(yade);
  }

  setHistory(history) {
    this.historyFilters = JSON.stringify(history);
  }

  setAuditLog(filter) {
    this.auditLogFilters = JSON.stringify(filter);
  }

  setIgnoreList(ignoreList) {
    this.ignoreList = JSON.stringify(ignoreList);
  }

  setDailyPlan(dailyPlan) {
    this.dailyPlanFilters = JSON.stringify(dailyPlan);
  }

  setResizerHeight(resizer) {
    this.resizerHeight = JSON.stringify(resizer);
  }

  private _save(storage, name, value) {
    let key = this.propsPrefix + name;
    if (value == null) value = '';
    storage[key] = value;
  }

  private load(name) {
    let key = this.propsPrefix + name;
    return localStorage[key] || null;
  }
}
