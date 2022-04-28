import {Injectable} from '@angular/core';
import {CoreService} from './core.service';

@Injectable()
export class FileTransferService {

  constructor(public coreService: CoreService) {
  }

  private parseProcessExecuted(regex, obj): any {
    let fromDate, toDate, date, arr;

    if (/^\s*(-)\s*(\d+)(h|d|w|M|y)\s*$/.test(regex)) {
      fromDate = /^\s*(-)\s*(\d+)(h|d|w|M|y)\s*$/.exec(regex)[0];

    } else if (/^\s*(now\s*\-)\s*(\d+)\s*$/i.test(regex)) {
      fromDate = new Date();
      toDate = new Date();
      const seconds = parseInt(/^\s*(now\s*\-)\s*(\d+)\s*$/i.exec(regex)[2], 10);
      fromDate.setSeconds(toDate.getSeconds() - seconds);
    } else if (/^\s*(Today)\s*$/i.test(regex)) {
      fromDate = '0d';
      toDate = '0d';
    } else if (/^\s*(Yesterday)\s*$/i.test(regex)) {
      fromDate = '-1d';
      toDate = '-1d';
    } else if (/^\s*(now)\s*$/i.test(regex)) {
      fromDate = new Date();
      toDate = new Date();
    } else if (/^\s*(-)(\d+)(h|d|w|M|y)\s*to\s*(-)(\d+)(h|d|w|M|y)\s*$/.test(regex)) {
      date = /^\s*(-)(\d+)(h|d|w|M|y)\s*to\s*(-)(\d+)(h|d|w|M|y)\s*$/.exec(regex);
      arr = date[0].split('to');
      fromDate = arr[0].trim();
      toDate = arr[1].trim();

    } else if (/^\s*(-)(\d+)(h|d|w|M|y)\s*to\s*(-)(\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*$/.test(regex)) {
      date = /^\s*(-)(\d+)(h|d|w|M|y)\s*to\s*(-)(\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*$/.exec(regex);
      arr = date[0].split('to');
      fromDate = arr[0].trim();
      toDate = arr[1].trim();

    } else if (/^\s*(-)(\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*to\s*(-)(\d+)(h|d|w|M|y)\s*$/.test(regex)) {
      date = /^\s*(-)(\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*to\s*(-)(\d+)(h|d|w|M|y)\s*$/.exec(regex);
      arr = date[0].split('to');
      fromDate = arr[0].trim();
      toDate = arr[1].trim();

    } else if (/^\s*(-)(\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*to\s*(-)(\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*$/.test(regex)) {
      date = /^\s*(-)(\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*to\s*(-)(\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*$/.exec(regex);
      arr = date[0].split('to');
      fromDate = arr[0].trim();
      toDate = arr[1].trim();

    } else if (/^\s*(\d+):(\d+)\s*(am|pm)\s*to\s*(\d+):(\d+)\s*(am|pm)\s*$/i.test(regex)) {
      const time = /^\s*(\d+):(\d+)\s*(am|pm)\s*to\s*(\d+):(\d+)\s*(am|pm)\s*$/i.exec(regex);
      fromDate = new Date();
      if (/(pm)/i.test(time[3]) && parseInt(time[1], 10) != 12) {
        fromDate.setHours(parseInt(time[1], 10) - 12);
      } else {
        fromDate.setHours(parseInt(time[1], 10));
      }

      fromDate.setMinutes(parseInt(time[2], 10));
      toDate = new Date();
      if (/(pm)/i.test(time[6]) && parseInt(time[4], 10) != 12) {
        toDate.setHours(parseInt(time[4], 10) - 12);
      } else {
        toDate.setHours(parseInt(time[4], 10));
      }
      toDate.setMinutes(parseInt(time[5], 10));
    }

    if (fromDate) {
      obj.dateFrom = fromDate;
    }
    if (toDate) {
      obj.dateTo = toDate;
    }
    return obj;
  }

  private mergeHostAndProtocol(hosts: Array<any>, protocols: Array<any>): Array<any> {
    const arr: any = [];
    if (protocols.length < hosts.length) {
      hosts.forEach((value, index) => {
        if (protocols.length > 0) {
          if (protocols.length < hosts.length) {
            if (protocols.length === 1) {
              arr.push({host: value, protocol: protocols[0]});
            } else {
              if (protocols.length >= index) {
                arr.push({host: value, protocol: protocols[index]});
              }
            }
          }
        } else {
          arr.push({host: value});
        }

      });
    } else if (protocols.length > hosts.length) {
      protocols.forEach((value, index) => {
        if (hosts.length > 0) {
          if (hosts.length < protocols.length) {
            if (hosts.length === 1) {
              arr.push({protocol: value, host: hosts[0]});
            } else {
              if (hosts.length >= index) {
                arr.push({protocol: value, host: hosts[index]});
              }
            }

          }
        } else {
          arr.push({protocol: value});
        }

      });
    } else {
      hosts.forEach((value, index) => {
        for (const x in protocols) {
          if (protocols[x]) {
            arr.push({host: value, protocol: protocols[x]});
            protocols.splice(index, 1);
            break;
          }
        }
      });
    }
    return arr;
  }

  getRequestForSearch(data, filter, preferences): void {
    if (data.states && data.states.length > 0) {
      filter.states = data.states;
    }
    if (data.operations && data.operations.length > 0) {
      filter.operations = data.operations;
    }

    if (data.mandator) {
      filter.mandator = data.mandator;
    }
    if (data.profiles && data.profiles.length > 0) {
      let profiles = [];
      data.profiles.forEach((item) => {
        if(item.name || typeof item === "string") {
          profiles.push(item.name || item);
        }
      });
      filter.profiles = profiles;
    }
    if (data.sourceFiles && data.sourceFiles.length > 0) {
      let sourceFiles = [];
      data.sourceFiles.forEach((item) => {
        if(item.name || typeof item === "string") {
          sourceFiles.push(item.name || item);
        }
      })
      filter.sourceFiles = sourceFiles;
    }
    if (data.targetFiles && data.targetFiles.length > 0) {
      let targetFiles = [];
      data.targetFiles.forEach((item) => {
        if(item.name || typeof item === "string") {
          targetFiles.push(item.name || item);
        }
      })
      filter.targetFiles = targetFiles;
    }
    if (data.sourceHost || data.sourceProtocol) {
      let hosts = [];
      let protocols = [];
      if (data.sourceHost) {
        data.sourceHost = data.sourceHost.replace(/\s*(,|^|$)\s*/g, '$1');
        hosts = data.sourceHost.split(',');
      }
      if (data.sourceProtocol) {

        protocols = data.sourceProtocol;
      }
      filter.sources = this.mergeHostAndProtocol(hosts, protocols);

    }
    if (data.targetHost || data.targetProtocol) {
      let hosts = [];
      let protocols = [];
      if (data.targetHost) {
        data.targetHost = data.targetHost.replace(/\s*(,|^|$)\s*/g, '$1');
        hosts = data.targetHost.split(',');
      }
      if (data.targetProtocol) {

        protocols = data.targetProtocol;
      }
      filter.targets = this.mergeHostAndProtocol(hosts, protocols);
    }
    if (data.radio) {
      if (data.radio === 'planned') {
        filter = this.parseProcessExecuted(data.planned, filter);
      } else {
        if (data.radio === 'current') {
          if (data.fromDate) {
            this.coreService.getDateAndTime(data);
            filter.dateFrom = new Date(data.fromDate);
          }
          if (data.toDate) {
            this.coreService.getDateAndTime(data, 'to');
            filter.dateTo = new Date(data.toDate);
          }
        }
      }
    } else if (data.planned) {
      filter = this.parseProcessExecuted(data.planned, filter);
    }

    if (data.controllerId) {
      filter.controllerId = data.controllerId;
    }

    filter.timeZone = preferences.zone;
    if ((filter.dateFrom && typeof filter.dateFrom.getMonth === 'function')) {
      filter.dateFrom = this.coreService.convertTimeToLocalTZ(preferences, filter.dateFrom)._d;
    }
    if ((filter.dateTo && typeof filter.dateTo.getMonth === 'function')) {
      filter.dateTo = this.coreService.convertTimeToLocalTZ(preferences, filter.dateTo)._d;
    }
  }
}
