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

  save(): void {
    const self = this;
    for (let i = 0; i < this.props.length; i++) {
      this._save(localStorage, this.props[i], self[this.props[i]]);
    }
  }


  setWorkflow(workflow): void {
    this.workflowFilters = JSON.stringify(workflow);
  }

  setJob(job): void {
    this.jobFilters = JSON.stringify(job);
  }

  setYade(yade): void {
    this.yadeFilters = JSON.stringify(yade);
  }

  setHistory(history): void {
    this.historyFilters = JSON.stringify(history);
  }

  setAuditLog(filter): void {
    this.auditLogFilters = JSON.stringify(filter);
  }

  setIgnoreList(ignoreList): void {
    this.ignoreList = JSON.stringify(ignoreList);
  }

  setDailyPlan(dailyPlan): void {
    this.dailyPlanFilters = JSON.stringify(dailyPlan);
  }

  setResizerHeight(resizer): void {
    this.resizerHeight = JSON.stringify(resizer);
  }

  private _save(storage, name, value): void {
    let key = this.propsPrefix + name;
    if (value == null) value = '';
    storage[key] = value;
  }

  private load(name): any {
    let key = this.propsPrefix + name;
    return localStorage[key] || null;
  }
}
