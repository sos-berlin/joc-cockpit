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
      toDate = '0d';
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

  getRequestForSearch(data, filter, preferences): void{
    if (data.states && data.states.length > 0) {
      filter.states = data.states;
    }
    if (data.operations && data.operations.length > 0) {
      filter.operations = data.operations;
    }
    if (data.profileId) {
      data.profileId = data.profileId.replace(/\s*(,|^|$)\s*/g, '$1');
      filter.profiles = data.profileId.split(',');
    }

    if (data.mandator) {
      filter.mandator = data.mandator;
    }

    if (data.sourceFileRegex) {
      filter.sourceFile = data.sourceFileRegex;
    }
    if (data.targetFileRegex) {
      filter.targetFile = data.targetRegex;
    }

    if (data.sourceFileName) {
      data.sourceFileName = data.sourceFileName.replace(/\s*(,|^|$)\s*/g, '$1');
      filter.sourceFiles = data.sourceFileName.split(',');
    }
    if (data.targetFileName) {
      data.targetFileName = data.targetFileName.replace(/\s*(,|^|$)\s*/g, '$1');
      filter.targetFiles = data.targetFileName.split(',');
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
    if(data.radio) {
      if (data.radio == 'planned') {
        filter = this.parseProcessExecuted(data.planned, filter);
      } else {
        if (data.radio == 'current' && data.from) {
          const fromDate = new Date(data.from);
          if (data.fromTime) {
            fromDate.setHours(data.fromTime.getHours());
            fromDate.setMinutes(data.fromTime.getMinutes());
            fromDate.setSeconds(data.fromTime.getSeconds());
          } else {
            fromDate.setHours(0);
            fromDate.setMinutes(0);
            fromDate.setSeconds(0);
          }
          fromDate.setMilliseconds(0);
          filter.dateFrom = fromDate;
        }
        if (data.radio == 'current' && data.to) {
          const toDate = new Date(data.to);
          if (data.toTime) {
            toDate.setHours(data.toTime.getHours());
            toDate.setMinutes(data.toTime.getMinutes());
            toDate.setSeconds(data.toTime.getSeconds());
          } else {
            toDate.setHours(0);
            toDate.setMinutes(0);
            toDate.setSeconds(0);
          }
          toDate.setMilliseconds(0);
          filter.dateTo = toDate;
        }
      }
    } else if(data.planned){
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
