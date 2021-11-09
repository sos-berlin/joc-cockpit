import { Injectable } from '@angular/core';

@Injectable()
export class SaveService {

  props = ['workflowFilters', 'jobFilters', 'yadeFilters', 'historyFilters', 'auditLogFilters', 'agentFilters', 'ignoreList', 'dailyPlanFilters', 'resizerHeight'];
  propsPrefix = '$SOS$';
  workflowFilters: any;
  jobFilters: any;
  yadeFilters: any;
  historyFilters: any;
  agentFilters: any;
  auditLogFilters: any;
  ignoreList: any;
  dailyPlanFilters: any;
  resizerHeight: any;

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

  setWorkflow(workflow: any): void {
    this.workflowFilters = JSON.stringify(workflow);
  }

  setJob(job: any): void {
    this.jobFilters = JSON.stringify(job);
  }

  setYade(yade: any): void {
    this.yadeFilters = JSON.stringify(yade);
  }

  setHistory(history: any): void {
    this.historyFilters = JSON.stringify(history);
  }

  setAuditLog(filter: any): void {
    this.auditLogFilters = JSON.stringify(filter);
  }

  setAgent(filter: any): void {
    this.agentFilters = JSON.stringify(filter);
  }

  setIgnoreList(ignoreList: any): void {
    this.ignoreList = JSON.stringify(ignoreList);
  }

  setDailyPlan(dailyPlan: any): void {
    this.dailyPlanFilters = JSON.stringify(dailyPlan);
  }

  setResizerHeight(resizer: any): void {
    this.resizerHeight = JSON.stringify(resizer);
  }

  private _save(storage: any, name: any, value: any): void {
    let key = this.propsPrefix + name;
    if (value == null) value = '';
    storage[key] = value;
  }

  private load(name: any): any {
    let key = this.propsPrefix + name;
    return localStorage[key] || null;
  }
}
