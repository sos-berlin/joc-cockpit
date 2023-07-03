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

  static shouldLog(level: LogLevel): boolean {
    let ret = false;
    const clientLogFilter = sessionStorage['clientLogFilter'] ? JSON.parse(sessionStorage['clientLogFilter']) : {};
    if (clientLogFilter.isEnable) {
      if (clientLogFilter.status.indexOf(LogLevel[level].toLowerCase()) !== -1) {
        ret = true;
      }
    }
    return ret;
  }

  // *************************
  // Public methods
  // *************************
  debug(msg: string): void {
    this.writeToLog(msg, LogLevel.Debug);
  }

  info(msg: string): void {
    this.writeToLog(msg, LogLevel.Info);
  }

  warn(msg: string): void {
    this.writeToLog(msg, LogLevel.Warn);
  }

  error(msg: string): void {
    this.writeToLog(msg, LogLevel.Error);
  }

  log(msg: string): void {
    this.writeToLog(msg, LogLevel.All);
  }

  private writeToLog(msg: string, level: LogLevel): void {
    if (LoggingService.shouldLog(level)) {
      let entry = {
        message: msg,
        level: LogLevel[level],
        entryDate: new Date()
      };
      let values = [];
      try {
        // Get previous values from local storage
        values = localStorage.getItem(this.location) ? JSON.parse(localStorage.getItem(this.location) || '') || [] : [];
        // Add new log entry to array
        values.push(entry);
        if (values.length > 20 && (((1000 * 150) - decodeURIComponent(encodeURIComponent(JSON.stringify(values))).length) < 0)) {
          values.splice(1, 100);
        }
        localStorage.setItem(this.location, JSON.stringify(values));
      } catch (ex) {
        // Display error in console
        console.error(ex);
      }
    }
  }
}
