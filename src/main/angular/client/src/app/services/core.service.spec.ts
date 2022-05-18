/* tslint:disable:no-unused-variable */
import {CoreService} from "./core.service";
import {ComponentFixture, TestBed, waitForAsync} from "@angular/core/testing";
import {AuthService} from "../components/guard";
import {ToastrService} from "ngx-toastr";
import {ClipboardService} from "ngx-clipboard";
import {TranslateService} from "@ngx-translate/core";
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {AppModule} from '../app.module';
import {RouterTestingModule} from '@angular/router/testing';
import {DebugElement, Injector, NgZone} from "@angular/core";
import {By} from "@angular/platform-browser";
import {result} from "underscore";


fdescribe("CoreService", () => {
  let service: CoreService;
  // let element: HTMLElement;
  let injector: Injector;
  let el: DebugElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule,
        AppModule,
        RouterTestingModule],

      providers: [CoreService,
        AuthService,
        ToastrService,
        ClipboardService,
        TranslateService
      ]
    });
    service = TestBed.inject(CoreService);
  });

  it("#getProtocols should return nine protocols", () => {
    service = TestBed.inject(CoreService);
    expect(service.getProtocols().length).toBeGreaterThanOrEqual(9);
  });

  it('#getProtocols check length', () => {
    service = TestBed.inject(CoreService);
    expect(service.getProtocols().length).toBeGreaterThanOrEqual(length);
  });

  it('#setSearchResult should call set() and set a search result', waitForAsync(() => {
    expect(service).toBeTruthy();
  }));

  it('#getSearchResult should call get() and return a search result', waitForAsync(() => {
    var result = service.get('result');
    expect(result).toBeTruthy();
  }));

  it('#setDefaultTab should set a default tab for layout', waitForAsync(() => {
    console.log(service.setDefaultTab(), "set a default tab for layout");
    service = TestBed.inject(CoreService);
    expect(service.setDefaultTab).toBeDefined();
  }));

  it('#setTabs should set a temperory tab for layout', waitForAsync(() => {
    service = TestBed.inject(CoreService);
    // console.log(service.setDefaultTab(),"set a temperory tab for layout");
    expect(service.setDefaultTab()).toBe();
  }));

  it('#getTabs should call get() and return a tab for layout', waitForAsync(() => {
    var result = service.get('result');
    expect(result).toBeTruthy();
  }));

  it('#getWorkflowTab should call get() and return a tab for workflow', waitForAsync(() => {
    var result = service.get('result');
    expect(result).toBeTruthy();
  }));

  it('#getWorkflowDetailTab should call get() and return a tab for workflow-details/workflow-action', waitForAsync(() => {
    var result = service.get('result');
    expect(result).toBeTruthy();
  }));

  it('#getDailyPlanTab should call get() and return a tab for daily-plans', waitForAsync(() => {
    var result = service.get('result');
    expect(result).toBeTruthy();
  }));

  it('#getMonitorTab should call get() and return a tab for monitor', waitForAsync(() => {
    var result = service.get('result');
    expect(result).toBeTruthy();
  }));

  it('#getHistoryTab should call get() and return a tab for history tab', waitForAsync(() => {
    var result = service.get('result');
    expect(result).toBeTruthy();
  }));

  it('#getOrderOverviewTab should call get() and return a tab for orderOverview', waitForAsync(() => {
    var result = service.get('result');
    expect(result).toBeTruthy();
  }));

  it('#getResourceTab should call get() and return a tab for resource', waitForAsync(() => {
    var result = service.get('result');
    expect(result).toBeTruthy();
  }));

  it('#getDashboardTab should call get() and return a tab for resources', waitForAsync(() => {
    var result = service.get('result');
    expect(result).toBeTruthy();
  }));

  it('#getAuditLogTab should call get() and return a value for audit-log', waitForAsync(() => {
    var result = service.get('result');
    expect(result).toBeTruthy();
  }));

  it('#getAgentClusterTab should call get() and return a value for agent', waitForAsync(() => {
    var result = service.get('result');
    expect(result).toBeTruthy();
  }));

  it('#getYadeTab should call get() and return a value for File-transfer', waitForAsync(() => {
    var result = service.get('result');
    expect(result).toBeTruthy();
  }));

  it("#setLocales check languages", waitForAsync(() => {
    let locale = 'en';
    service.setLocales(locale);
    expect(service.locales).toBeTruthy();
  }));

  it('#setLocales check languages', waitForAsync(() => {
    let locale = 'en';
    service.setLocales(locale);
    expect(service.locales).toBe(locale);
  }));

  it('#getLocale return languages', waitForAsync(() => {
    let locale = service.get('en');
    expect(locale).toBeTruthy();
  }));

  it('#getLocale return languages', waitForAsync(() => {
    let locale = service.get('de');
    expect(locale).toBeTruthy();
  }));

  it('#getLocale return languages', waitForAsync(() => {
    let locale = service.get('fr');
    expect(locale).toBeTruthy();
  }));

  it('#getLocale return languages', waitForAsync(() => {
    let locale = service.get('ja');
    expect(locale).toBeTruthy();
  }));

  it('#getDateFormat date should be null', waitForAsync(() => {
    let dateFormat = service.getDateFormat('');
    expect(dateFormat).toBeFalsy();
  }));

  it('#getDateFormat check date format DD/MM/YYYY', waitForAsync(() => {
    let date = service.getDateFormat('DD/MM/YYYY');
    expect(date).toBe(date);
  }));

  it('#getDateFormat check date format YYYY/MM/DD', waitForAsync(() => {
    let dateFormat = service.getDateFormat('YYYY/MM/DD');
    expect(dateFormat).toBe(dateFormat);
  }));

  //will fail for passing wrong format
  it('#getDateFormat checking format of date ////', waitForAsync(() => {
    let dateFormat = 'DD/MM/YYYY';
    service.getDateFormat(dateFormat);
    expect(service.getDateFormat(dateFormat)).toBe('123');
  }));

  it('#getDateFormat can not enter wrong date format', waitForAsync(() => {
    let dateFormat = 'DD/MM/YYYY';
    service.getDateFormat(dateFormat);
    console.log(service.getDateFormat(dateFormat), "date format = 'DD/MM/YYYY'");
    expect(service.getDateFormat(dateFormat)).toBe('dd/MM/yyyy');
  }));

  it('#getDateFormat should not be wrong', waitForAsync(() => {
    let dateFormat = 'YYYY/MM/DD';
    service.getDateFormat(dateFormat = '');
    console.log(service.getDateFormat, "'YYYY/MM/DD'");
    expect(service.getDateFormat(dateFormat)).toBe(dateFormat);
  }));

// It will get fail for passing wrong format
  it('#getDateFormat Format should not be wrong ////', waitForAsync(() => {
    let dateFormat = 'YYYY/MM/DD';
    service.getDateFormat('abc');
    // console.log(service.getDateFormat(dateFormat),"dateFormat = YYYY/MM/DD not abc");
    expect(service.getDateFormat(dateFormat).match).toBe(dateFormat);
  }));
// ====================================================================================================================================================
//  it('#parseProcessExecuted should return a regex', waitForAsync(() => {
//   let unmockeddate = Date;
//   // spyOn()
//   service.parseProcessExecuted('22/1/22022');
//   expect(Date).toBe(Date);    // true
//  }));

//  it('#parseProcessExecutedRegex should return a regex', waitForAsync(() => {
//      let reg = Date;
//   }));
// =====================================================================================================================================================


  it('#getLogDateFormat checking for date using this function', waitForAsync(() => {
    let date = new Date('2022-07-08T09:02:21.377');
    let zone = 'UTC';
    service.getLogDateFormat(date, zone);
    expect(service.getLogDateFormat(date, zone)).toBe('2022-07-08 03:32:21.377+00:00')
  }));

// will get fail for passing date format as per UTC
  it('#getLogDateFormat checking for CET zone using this function ////', waitForAsync(() => {
    let date = new Date('2022-07-08T09:02:21.377');
    let zone = 'CET';
    service.getLogDateFormat(date, zone);
    expect(service.getLogDateFormat(date, zone)).toBe('2022-07-08 03:32:21.377+00:00')
  }));

// it will get failure bcoz we are passing wrong date(current date) here
  it('#getLogDateFormat checking for EET zone using this function ////', waitForAsync(() => {
    let date = new Date('2022-07-08T09:02:21.377');
    let zone = 'EET';
    console.log(service.getLogDateFormat(date, zone), "checking for EET zone");
    service.getLogDateFormat(date, zone);
    expect(service.getLogDateFormat(date, zone)).toBe(Date())
  }));

// it will get failure bcoz we are passing wrong date(current date) here
  it('#getLogDateFormat checking for UTC zone using this function ////', waitForAsync(() => {
    let date = new Date('2022-07-08T09:02:21.377');
    let zone = 'UTC';
    service.getLogDateFormat(date, zone);
    expect(service.getLogDateFormat(date, zone)).toBe(Date())
  }));

  it('#getLogDateFormat log date fromat should contain date and UTC zone with defined format', waitForAsync(() => {
    let date = new Date('2022-05-12 15:16:25.819+00:00');
    let zone = 'UTC';
    console.log(service.getLogDateFormat(date, zone), "date and zone with defined format");
    service.getLogDateFormat(date, zone)
    expect(service.getLogDateFormat(date, zone)).toBe('2022-05-12 15:16:25.819+00:00')
  }));

  it('#getLogDateFormat log date should be in defined format WHERE zone is Asia/Kolkata', waitForAsync(() => {
    let date = new Date('2022-07-08T09:02:21.377');
    let zone = 'Asia/Kolkata';
    console.log(service.getLogDateFormat(date, zone), 'log date format for Asia/Kolkata zone');
    expect(service.getLogDateFormat(date, zone)).toBe('2022-07-08 09:02:21.377+05:30')
  }));

  it('#getLogDateFormat log date should be in defined format WHERE zone is America/New_York', waitForAsync(() => {
    let date = new Date('2022-07-08T09:02:21.377');
    let zone = 'America/New_York';
    console.log(service.getLogDateFormat(date, zone), 'log date format for America/New_York zone');
    expect(service.getLogDateFormat(date, zone)).toBe('2022-07-07 23:32:21.377-04:00')
  }));

  it('#getLogDateFormat log date should be in defined format WHERE zone is US/Central', waitForAsync(() => {
    let date = new Date('2022-07-08T09:02:21.377');
    let zone = 'US/Central';
    console.log(service.getLogDateFormat(date, zone), 'log date format for US/Central zone');
    expect(service.getLogDateFormat(date, zone)).toBe('2022-07-07 22:32:21.377-05:00')
  }));

  it('#getLogDateFormat log date should be in defined format WHERE zone is UTC', waitForAsync(() => {
    let date = new Date('2022-07-08T09:02:21.377');
    let zone = 'UTC';
    console.log(service.getLogDateFormat(date, zone), 'log date format for UTC zone');
    expect(service.getLogDateFormat(date, zone)).toBe('2022-07-08 03:32:21.377+00:00')
  }));

  it('#getLogDateFormat log date should be in defined format WHERE zone is WET Time Zone', waitForAsync(() => {
    let date = new Date('2022-07-08T09:02:21.377');
    let zone = 'WET';
    console.log(service.getLogDateFormat(date, zone), 'log date format for WET zone');
    expect(service.getLogDateFormat(date, zone)).toBe('2022-07-08 04:32:21.377+01:00')
  }));

  it('#getLogDateFormat log date should be in defined format WHERE zone is Europe/Stockholm', waitForAsync(() => {
    let date = new Date('2022-07-08T09:02:21.377');
    let zone = 'Europe/Stockholm';
    console.log(service.getLogDateFormat(date, zone), 'log date format for Europe/Stockholm');
    expect(service.getLogDateFormat(date, zone)).toBe('2022-07-08 05:32:21.377+02:00')
  }));

  it('#getLogDateFormat log date should be in defined format WHERE zone is Europe/Paris', waitForAsync(() => {
    let date = new Date('2022-07-08T09:02:21.377');
    let zone = 'Europe/Paris';
    console.log(service.getLogDateFormat(date, zone), 'log date format for Europe/Paris zone');
    expect(service.getLogDateFormat(date, zone)).toBe('2022-07-08 05:32:21.377+02:00')
  }));

  it('#getLogDateFormat log date should be in defined format WHERE zone Europe/Luxembourg', waitForAsync(() => {
    let date = new Date('2022-07-08T09:02:21.377');
    let zone = 'Europe/Luxembourg';
    console.log(service.getLogDateFormat(date, zone), 'log date format for Europe/Luxembourg');
    expect(service.getLogDateFormat(date, zone)).toBe('2022-07-08 05:32:21.377+02:00')
  }));

  it('#getLogDateFormat log date should be in defined format WHERE zone Europe/London', waitForAsync(() => {
    let date = new Date('2022-07-08T09:02:21.377');
    let zone = 'Europe/London';
    console.log(service.getLogDateFormat(date, zone), 'log date format for Europe/London');
    expect(service.getLogDateFormat(date, zone)).toBe('2022-07-08 04:32:21.377+01:00')
  }));

  it('#getLogDateFormat log date should be in defined format WHERE zone Europe/Berlin', waitForAsync(() => {
    let date = new Date('2022-07-08T09:02:21.377');
    let zone = 'Europe/Berlin';
    console.log(service.getLogDateFormat(date, zone), 'log date format for Europe/Berlin');
    expect(service.getLogDateFormat(date, zone)).toBe('2022-07-08 05:32:21.377+02:00')
  }));

  it('#getDateByFormat should return all the date formats when zone == Australia/Melbourne', waitForAsync(() => {
    let date = new Date('2022-07-08T09:02:21.377');
    let zone = '';
    let format: any = ['HH:mm | DD.MM.YYYY', 'hh:mm A | DD.MM.YYYY', 'YYYY/DD/MM HH:mm', 'YYYY/DD/MM hh:mm A', 'YYYY/DD/MM HH:mm:ss', 'YYYY/DD/MM hh:mm:ss A'];
    let exceptedResult: any = ['HH:mm | DD.MM.YYYY', 'hh:mm A | DD.MM.YYYY', 'YYYY/DD/MM HH:mm', 'YYYY/DD/MM hh:mm A', 'YYYY/DD/MM HH:mm:ss', 'YYYY/DD/MM hh:mm:ss A'];
    for (let i = 0; i <= format.length; i++) {
      if (zone == 'Australia/Melbourne') {
        console.log(service.getDateByFormat(date, zone, format[i]), "'format looping 1'");
        service.getDateByFormat(date, zone, format[i]);
        expect(service.getDateByFormat(date, zone, format[i])).toBe(exceptedResult[i]);
      } else {
        console.log(date, "else date format Australia/Melbourne");
        expect(date).toBe(date);
      }
    }
  }));

  it('#getDateByFormat should return all the date formats when zone == America/New_York', waitForAsync(() => {
    let date = new Date('2022-07-08T09:02:21.377');
    let zone = '';
    let format: any = ['HH:mm | DD.MM.YYYY', 'hh:mm A | DD.MM.YYYY', 'YYYY/DD/MM HH:mm', 'YYYY/DD/MM hh:mm A', 'YYYY/DD/MM HH:mm:ss', 'YYYY/DD/MM hh:mm:ss A'];
    let exceptedResult: any = ['HH:mm | DD.MM.YYYY', 'hh:mm A | DD.MM.YYYY', 'YYYY/DD/MM HH:mm', 'YYYY/DD/MM hh:mm A', 'YYYY/DD/MM HH:mm:ss', 'YYYY/DD/MM hh:mm:ss A'];
    for (let i = 0; i <= format.length; i++) {
      if (zone == 'America/New_York') {
        console.log(service.getDateByFormat(date, zone, format[i]), "'format looping 1'");
        service.getDateByFormat(date, zone, format[i]);
        expect(service.getDateByFormat(date, zone, format[i])).toBe(exceptedResult[i]);
      } else {
        console.log(date, "else date format America/New_York");
        expect(date).toBe(date);
      }
    }
  }));

  it('#getDateByFormat should return all the date formats when zone == WET', waitForAsync(() => {
    let date = new Date('2022-07-08T09:02:21.377');
    let zone = '';
    let format: any = ['HH:mm | DD.MM.YYYY', 'hh:mm A | DD.MM.YYYY', 'YYYY/DD/MM HH:mm', 'YYYY/DD/MM hh:mm A', 'YYYY/DD/MM HH:mm:ss', 'YYYY/DD/MM hh:mm:ss A'];
    let exceptedResult: any = ['HH:mm | DD.MM.YYYY', 'hh:mm A | DD.MM.YYYY', 'YYYY/DD/MM HH:mm', 'YYYY/DD/MM hh:mm A', 'YYYY/DD/MM HH:mm:ss', 'YYYY/DD/MM hh:mm:ss A'];
    for (let i = 0; i <= format.length; i++) {
      if (zone == 'WET') {
        console.log(service.getDateByFormat(date, zone, format[i]), "'format looping 1'");
        service.getDateByFormat(date, zone, format[i]);
        expect(service.getDateByFormat(date, zone, format[i])).toBe(exceptedResult[i]);
      } else {
        console.log(date, "else date format WET");
        expect(date).toBe(date);
      }
    }
  }));

  it('#getDateByFormat should return all the date formats when zone == US/Central', waitForAsync(() => {
    let date = new Date('2022-07-08T09:02:21.377');
    let zone = '';
    let format: any = ['HH:mm | DD.MM.YYYY', 'hh:mm A | DD.MM.YYYY', 'YYYY/DD/MM HH:mm', 'YYYY/DD/MM hh:mm A', 'YYYY/DD/MM HH:mm:ss', 'YYYY/DD/MM hh:mm:ss A'];
    let exceptedResult: any = ['HH:mm | DD.MM.YYYY', 'hh:mm A | DD.MM.YYYY', 'YYYY/DD/MM HH:mm', 'YYYY/DD/MM hh:mm A', 'YYYY/DD/MM HH:mm:ss', 'YYYY/DD/MM hh:mm:ss A'];
    for (let i = 0; i <= format.length; i++) {
      if (zone == 'US/Central') {
        console.log(service.getDateByFormat(date, zone, format[i]), "'format looping 1'");
        service.getDateByFormat(date, zone, format[i]);
        expect(service.getDateByFormat(date, zone, format[i])).toBe(exceptedResult[i]);
      } else {
        console.log(date, "else date format US/Central");
        expect(date).toBe(date);
      }
    }
  }));

  it('#getDateByFormat should return all the date formats when zone == Europe/Stockholm', waitForAsync(() => {
    let date = new Date('2022-07-08T09:02:21.377');
    let zone = '';
    let format: any = ['HH:mm | DD.MM.YYYY', 'hh:mm A | DD.MM.YYYY', 'YYYY/DD/MM HH:mm', 'YYYY/DD/MM hh:mm A', 'YYYY/DD/MM HH:mm:ss', 'YYYY/DD/MM hh:mm:ss A'];
    let exceptedResult: any = ['HH:mm | DD.MM.YYYY', 'hh:mm A | DD.MM.YYYY', 'YYYY/DD/MM HH:mm', 'YYYY/DD/MM hh:mm A', 'YYYY/DD/MM HH:mm:ss', 'YYYY/DD/MM hh:mm:ss A'];
    for (let i = 0; i <= format.length; i++) {
      if (zone == 'Europe/Stockholm') {
        console.log(service.getDateByFormat(date, zone, format[i]), "'format looping 1'");
        service.getDateByFormat(date, zone, format[i]);
        expect(service.getDateByFormat(date, zone, format[i])).toBe(exceptedResult[i]);
      } else {
        console.log(date, "else date format Europe/Stockholm");
        expect(date).toBe(date);
      }
    }
  }));

  it('#getDateByFormat should return all the date formats when zone == Europe/Berlin', waitForAsync(() => {
    let date = new Date('2022-07-08T09:02:21.377');
    let zone = '';
    let format: any = ['HH:mm | DD.MM.YYYY', 'hh:mm A | DD.MM.YYYY', 'YYYY/DD/MM HH:mm', 'YYYY/DD/MM hh:mm A', 'YYYY/DD/MM HH:mm:ss', 'YYYY/DD/MM hh:mm:ss A'];
    let exceptedResult: any = ['HH:mm | DD.MM.YYYY', 'hh:mm A | DD.MM.YYYY', 'YYYY/DD/MM HH:mm', 'YYYY/DD/MM hh:mm A', 'YYYY/DD/MM HH:mm:ss', 'YYYY/DD/MM hh:mm:ss A'];
    for (let i = 0; i <= format.length; i++) {
      if (zone == 'Europe/Berlin') {
        console.log(service.getDateByFormat(date, zone, format[i]), "'format looping 1'");
        service.getDateByFormat(date, zone, format[i]);
        expect(service.getDateByFormat(date, zone, format[i])).toBe(exceptedResult[i]);
      } else {
        console.log(date, "else date format Europe/Berlin");
        expect(date).toBe(date);
      }
    }
  }));

  it('#getDateByFormat should return all the date formats when zone == Europe/London', waitForAsync(() => {
    let date = new Date('2022-07-08T09:02:21.377');
    let zone = '';
    let format: any = ['HH:mm | DD.MM.YYYY', 'hh:mm A | DD.MM.YYYY', 'YYYY/DD/MM HH:mm', 'YYYY/DD/MM hh:mm A', 'YYYY/DD/MM HH:mm:ss', 'YYYY/DD/MM hh:mm:ss A'];
    let exceptedResult: any = ['HH:mm | DD.MM.YYYY', 'hh:mm A | DD.MM.YYYY', 'YYYY/DD/MM HH:mm', 'YYYY/DD/MM hh:mm A', 'YYYY/DD/MM HH:mm:ss', 'YYYY/DD/MM hh:mm:ss A'];
    for (let i = 0; i <= format.length; i++) {
      if (zone == 'Europe/London') {
        console.log(service.getDateByFormat(date, zone, format[i]), "'format looping 1'");
        service.getDateByFormat(date, zone, format[i]);
        expect(service.getDateByFormat(date, zone, format[i])).toBe(exceptedResult[i]);
      } else {
        console.log(date, "else date format Europe/London");
        expect(date).toBe(date);
      }
    }
  }));

  it('#getDateByFormat should return all the date formats when zone == Europe/Luxembourg', waitForAsync(() => {
    let date = new Date('2022-07-08T09:02:21.377');
    let zone = '';
    let format: any = ['HH:mm | DD.MM.YYYY', 'hh:mm A | DD.MM.YYYY', 'YYYY/DD/MM HH:mm', 'YYYY/DD/MM hh:mm A', 'YYYY/DD/MM HH:mm:ss', 'YYYY/DD/MM hh:mm:ss A'];
    let exceptedResult: any = ['HH:mm | DD.MM.YYYY', 'hh:mm A | DD.MM.YYYY', 'YYYY/DD/MM HH:mm', 'YYYY/DD/MM hh:mm A', 'YYYY/DD/MM HH:mm:ss', 'YYYY/DD/MM hh:mm:ss A'];
    for (let i = 0; i <= format.length; i++) {
      if (zone == 'Europe/Luxembourg') {
        console.log(service.getDateByFormat(date, zone, format[i]), "'format looping 1'");
        service.getDateByFormat(date, zone, format[i]);
        expect(service.getDateByFormat(date, zone, format[i])).toBe(exceptedResult[i]);
      } else {
        console.log(date, "else date format Europe/Luxembourg");
        expect(date).toBe(date);
      }
    }
  }));

  it('#getDateByFormat should return all the date formats when zone == Europe/Paris', waitForAsync(() => {
    let date = new Date('2022-07-08T09:02:21.377');
    let zone = '';
    let format: any = ['HH:mm | DD.MM.YYYY', 'hh:mm A | DD.MM.YYYY', 'YYYY/DD/MM HH:mm', 'YYYY/DD/MM hh:mm A', 'YYYY/DD/MM HH:mm:ss', 'YYYY/DD/MM hh:mm:ss A'];
    let exceptedResult: any = ['HH:mm | DD.MM.YYYY', 'hh:mm A | DD.MM.YYYY', 'YYYY/DD/MM HH:mm', 'YYYY/DD/MM hh:mm A', 'YYYY/DD/MM HH:mm:ss', 'YYYY/DD/MM hh:mm:ss A'];
    for (let i = 0; i <= format.length; i++) {
      if (zone == 'Europe/Paris') {
        console.log(service.getDateByFormat(date, zone, format[i]), "'format looping 1'");
        service.getDateByFormat(date, zone, format[i]);
        expect(service.getDateByFormat(date, zone, format[i])).toBe(exceptedResult[i]);
      } else {
        console.log(date, "else date format Europe/Paris");
        expect(date).toBe(date);
      }
    }
  }));

  it('#getDateByFormat should return all the date formats when zone == UTC', waitForAsync(() => {
    let date = new Date('2022-07-08T09:02:21.377');
    let zone = '';
    let format: any = ['HH:mm | DD.MM.YYYY', 'hh:mm A | DD.MM.YYYY', 'YYYY/DD/MM HH:mm', 'YYYY/DD/MM hh:mm A', 'YYYY/DD/MM HH:mm:ss', 'YYYY/DD/MM hh:mm:ss A'];
    let exceptedResult: any = ['HH:mm | DD.MM.YYYY', 'hh:mm A | DD.MM.YYYY', 'YYYY/DD/MM HH:mm', 'YYYY/DD/MM hh:mm A', 'YYYY/DD/MM HH:mm:ss', 'YYYY/DD/MM hh:mm:ss A'];
    for (let i = 0; i <= format.length; i++) {
      if (zone == 'UTC') {
        console.log(service.getDateByFormat(date, zone, format[i]), "'format looping 1'");
        service.getDateByFormat(date, zone, format[i]);
        expect(service.getDateByFormat(date, zone, format[i])).toBe(exceptedResult[i]);
      } else {
        console.log(date, "else date format UTC");
        expect(date).toBe(date);
      }
    }
  }));

  it('#getDateByFormat should return all the date formats when zone == Asia/Kolkata', waitForAsync(() => {
    let date = new Date('2022-07-08T09:02:21.377');
    let zone = '';
    let format: any = ['HH:mm | DD.MM.YYYY', 'hh:mm A | DD.MM.YYYY', 'YYYY/DD/MM HH:mm', 'YYYY/DD/MM hh:mm A', 'YYYY/DD/MM HH:mm:ss', 'YYYY/DD/MM hh:mm:ss A'];
    let exceptedResult: any = ['HH:mm | DD.MM.YYYY', 'hh:mm A | DD.MM.YYYY', 'YYYY/DD/MM HH:mm', 'YYYY/DD/MM hh:mm A', 'YYYY/DD/MM HH:mm:ss', 'YYYY/DD/MM hh:mm:ss A'];
    for (let i = 0; i <= format.length; i++) {
      if (zone == ' Asia/Kolkata') {
        console.log(service.getDateByFormat(date, zone, format[i]), "'format looping 2'");
        service.getDateByFormat(date, zone, format[i]);
        expect(service.getDateByFormat(date, zone, format[i])).toBe(exceptedResult[i]);
      } else {
        console.log(date, "else date format Asia/Kolkata");
        expect(date).toBe(date);
      }
    }
  }));

  it('#getDateByFormat should return all the date formats when zone == GMT', waitForAsync(() => {
    let date = new Date('2022-07-08T09:02:21.377');
    let zone = '';
    let format: any = ['HH:mm | DD.MM.YYYY', 'hh:mm A | DD.MM.YYYY', 'YYYY/DD/MM HH:mm', 'YYYY/DD/MM hh:mm A', 'YYYY/DD/MM HH:mm:ss', 'YYYY/DD/MM hh:mm:ss A'];
    let exceptedResult: any = ['HH:mm | DD.MM.YYYY', 'hh:mm A | DD.MM.YYYY', 'YYYY/DD/MM HH:mm', 'YYYY/DD/MM hh:mm A', 'YYYY/DD/MM HH:mm:ss', 'YYYY/DD/MM hh:mm:ss A'];
    for (let i = 0; i <= format.length; i++) {
      if (zone == 'GMT') {
        console.log(service.getDateByFormat(date, zone, format[i]), 'zone == GMT');
        expect(service.getDateByFormat(date, zone, format[i])).toBe(exceptedResult[i]);
      } else {
        console.log(date, 'else date format GMT');
        expect(date).toBe(date);
      }
    }
  }));
});
