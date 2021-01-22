import {Injectable} from '@angular/core';

// ****************************************************
// Log Level Enumeration
// ****************************************************
export enum LogLevel {
  All = 0,
  Debug = 1,
  Info = 2,
  Warn = 3,
  Error = 4
}

@Injectable({
  providedIn: 'root'
})
export class LoggingService {
  level: LogLevel = LogLevel.Debug;
  location = 'logging';

  constructor() {
  }

  // *************************
  // Public methods
  // *************************
  debug(msg: string) {
    this.writeToLog(msg, LogLevel.Debug);
  }

  info(msg: string) {
    this.writeToLog(msg, LogLevel.Info);
  }

  warn(msg: string) {
    this.writeToLog(msg, LogLevel.Warn);
  }

  error(msg: string) {
    this.writeToLog(msg, LogLevel.Error);
  }

  log(msg: string) {
    this.writeToLog(msg, LogLevel.All);
  }

  // *************************
  // Private methods
  // *************************
  private shouldLog(level: LogLevel): boolean {
    let ret = false;
    const clientLogFilter = sessionStorage.clientLogFilter ? JSON.parse(sessionStorage.clientLogFilter) : {};
    if (clientLogFilter.isEnable) {
      if (clientLogFilter.status.indexOf(LogLevel[level].toLowerCase()) !== -1) {
        ret = true;
      }
    }
    return ret;
  }

  private writeToLog(msg: string, level: LogLevel) {
    if (this.shouldLog(level)) {
      let entry = {
        message: msg,
        level: LogLevel[level],
        entryDate: new Date()
      };
      let values = [];
      try {
        // Get previous values from local storage
        values = localStorage.getItem(this.location) ? JSON.parse(localStorage.getItem(this.location)) || [] : [];

        // Add new log entry to array
        values.push(entry);
        localStorage.setItem(this.location, JSON.stringify(values));
        if ((1024 * 1024) - unescape(encodeURIComponent(JSON.stringify(localStorage.getItem(this.location)))).length < 0) {
         // localStorage.clientLogs.splice(1, 100);
        }
      } catch (ex) {
        // Display error in console
        console.log(ex);
      }
    }
  }
}
