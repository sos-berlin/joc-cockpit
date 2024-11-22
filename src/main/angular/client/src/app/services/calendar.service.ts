import {Injectable} from '@angular/core';
import {DatePipe} from '@angular/common';
import {groupBy, isArray, isEmpty, toArray} from 'underscore';
import * as moment from 'moment';

@Injectable()
export class CalendarService {
  preferences: any = {};

  dayNumbers = [
    {label: 'runtime.label.first', value: '1'},
    {label: 'runtime.label.second', value: '2'},
    {label: 'runtime.label.third', value: '3'},
    {label: 'runtime.label.fourth', value: '4'},
    {label: 'runtime.label.last', value: '-1'},
    {label: 'runtime.label.secondLast', value: '-2'},
    {label: 'runtime.label.thirdLast', value: '-3'},
    {label: 'runtime.label.fourthLast', value: '-4'}
  ];
  specificWeekDay = [
    {label: 'runtime.label.sunday', value: 'sunday'},
    {label: 'runtime.label.monday', value: 'monday'},
    {label: 'runtime.label.tuesday', value: 'tuesday'},
    {label: 'runtime.label.wednesday', value: 'wednesday'},
    {label: 'runtime.label.thursday', value: 'thursday'},
    {label: 'runtime.label.friday', value: 'friday'},
    {label: 'runtime.label.saturday', value: 'saturday'}
  ];
  frequencyTab = [
    {label: 'runtime.label.weekDays', value: 'weekDays'},
    {label: 'runtime.label.specificWeekDays', value: 'specificWeekDays'},
    {label: 'runtime.label.specificDays', value: 'specificDays'},
    {label: 'runtime.label.monthDays', value: 'monthDays'},
    {label: 'runtime.label.every', value: 'every'},
    {label: 'runtime.label.nationalHoliday', value: 'nationalHoliday'}
  ];
  dateEntity = [
    {label: 'runtime.label.days', value: 'DAILY'},
    {label: 'runtime.label.weeks', value: 'WEEKLY'},
    {label: 'runtime.label.months', value: 'MONTHLY'},
    {label: 'runtime.label.years', value: 'YEARLY'}
  ];

  constructor(private datePipe: DatePipe) {
    if (sessionStorage['preferences']) {
      this.preferences = JSON.parse(sessionStorage['preferences']) || {};
    }
  }

  getStringDay(day: number): string {
    return day == 0 ? 'sunday' : day == 1 ? 'monday' : day == 2 ? 'tuesday' : day == 3 ? 'wednesday' : day == 4 ? 'thursday' : day == 5 ? 'friday' : 'saturday';
  }

  getDay(day: string): number {
    return day == 'sunday' ? 0 : day == 'monday' ? 1 : day == 'tuesday' ? 2 : day == 'wednesday' ? 3 : day == 'thursday' ? 4 : day == 'friday' ? 5 : 6;
  }

  getMonths(month: any): string {
    let str = '';
    if (!month) {
      return '';
    }

    let months: any = month;
    if (!isArray(month)) {
      months = month.toString().split(' ');
    }
    if (months.length == 12) {
      return 'every month';
    }

    months.sort(this.compareNumbers).forEach((value: number) => {
      if (value == 1) {
        str = str + 'Jan,';
      } else if (value == 2) {
        str = str + 'Feb,';
      } else if (value == 3) {
        str = str + 'Mar,';
      } else if (value == 4) {
        str = str + 'Apr,';
      } else if (value == 5) {
        str = str + 'May,';
      } else if (value == 6) {
        str = str + 'Jun,';
      } else if (value == 7) {
        str = str + 'Jul,';
      } else if (value == 8) {
        str = str + 'Aug,';
      } else if (value == 9) {
        str = str + 'Sep,';
      } else if (value == 10) {
        str = str + 'Oct,';
      } else if (value == 11) {
        str = str + 'Nov,';
      } else if (value == 12) {
        str = str + 'Dec';
      }
    });

    if (str.length === 1) {
      return '';
    } else {
      if (str.substring(str.length - 1) == ',') {
        str = str.substring(0, str.length - 1);
      }
    }
    return str;
  }

  getWeekDays(day: any): string {
    if (!day) {
      return '';
    }
    let days = day;
    if (!isArray(day)) {
      days = day.toString().split(' ');
    }
    if (days.length === 7) {
      return 'Every day';
    }
    let str = '';
    days.forEach((value: number) => {
      if (value == 0) {
        str = str + 'Sun,';
      } else if (value == 1) {
        str = str + 'Mon,';
      } else if (value == 2) {
        str = str + 'Tue,';
      } else if (value == 3) {
        str = str + 'Wed,';
      } else if (value == 4) {
        str = str + 'Thu,';
      } else if (value == 5) {
        str = str + 'Fri,';
      } else if (value == 6) {
        str = str + 'Sat,';
      } else if (value == 7) {
        str = str + 'Sun';
      }
    });

    if (str.length === 1) {
      return '';
    } else {
      if (str.substring(str.length - 1) == ',') {
        str = str.substring(0, str.length - 1);
      }
    }
    return str;
  }

  getSpecificDay(day: number): string {
    if (!day) {
      return '';
    }
    if (day == 1) {
      return '1st';
    } else if (day == 2) {
      return '2nd';
    } else if (day == 3) {
      return '3rd';
    } else if (day == 4) {
      return '4th';
    } else if (day == -1) {
      return 'last';
    } else if (day == -2) {
      return '2nd last';
    } else if (day == -3) {
      return '3rd last';
    } else if (day == -4) {
      return '4th last';
    } else {
      return '';
    }
  }

  getMonthDays(month: any, isUltimos: boolean): string {
    let str = '';
    if (!month) {
      return month;
    }
    let months = month;
    if (!isArray(month)) {
      months = month.toString().split(' ').sort(this.compareNumbers);
    }
    for (let i = 0; i < months.length; i++) {
      if (months[i] == 32 && isUltimos) {
        continue;
      }
      if (months[i] == 0 && !isUltimos) {
        continue;
      }
      if (months[i] == 1 || months[i] == 31) {
        str = str + months[i] + 'st,';
      } else if (months[i] == 2) {
        str = str + months[i] + 'nd,';
      } else if (months[i] == 3) {
        str = str + months[i] + 'rd,';
      } else {
        str = str + months[i] + 'th,';
      }
    }

    if (str.length === 1) {
      return '';
    } else {
      if (str.substring(str.length - 1) == ',') {
        str = str.substring(0, str.length - 1);
      }
    }

    return str;
  }

  freqToStr(data: any, dataFormat: string): string {
    const self = this;
    let str = '';
    if (data.months && isArray(data.months)) {
      str = self.getMonths(data.months);
    }
    if (data.tab === 'specificDays') {
      str = 'On ';
      if (data.dates) {
        data.dates.forEach((date: string, index: number) => {
          str = str + moment(date).format(dataFormat.toUpperCase());
          if (index != data.dates.length - 1) {
            str = str + ', ';
          }
        });
      }
      return str;
    } else if (data.tab === 'weekDays') {
      if (str) {
        return self.getWeekDays(data.days) + ' on ' + str;
      } else {
        return self.getWeekDays(data.days);
      }
    } else if (data.tab === 'specificWeekDays') {
      if (str) {
        return self.getSpecificDay(data.which) + ' ' + data.specificWeekDay + ' of ' + str;
      } else {
        return self.getSpecificDay(data.which) + ' ' + data.specificWeekDay + ' of month';
      }
    } else if (data.tab === 'monthDays') {
      if (data.isUltimos != 'months') {
        if (str) {
          return '- ' + self.getMonthDays(data.selectedMonthsU, data.isUltimos) + ' of ' + str;
        } else {
          return self.getMonthDays(data.selectedMonthsU, data.isUltimos) + ' of ultimos';
        }
      } else {
        if (str) {
          return self.getMonthDays(data.selectedMonths, false) + ' of ' + str;
        } else {
          return self.getMonthDays(data.selectedMonths, false) + ' of month';
        }
      }
    } else if (data.tab === 'every') {
      if (data.interval == 1) {
        str = data.interval + 'st ';
      } else if (data.interval == 2) {
        str = data.interval + 'nd ';
      } else if (data.interval == 3) {
        str = data.interval + 'rd ';
      } else {
        str = data.interval + 'th ';
      }
      const repetitions = data.dateEntity === 'DAILY' ? 'day' : data.dateEntity === 'WEEKLY' ? 'week' : data.dateEntity === 'MONTHLY' ? 'month' : 'year';
      if (data.startingWith) {
        // let formattedDate = moment(data.startingWith, 'DD-MM-YYYY');
        let addMothString = '';
        if (data.months && data.dateEntity !== 'year') {
          addMothString = (data.months.length > 0) ? ' of ' + self.getMonths(data.months) : '';
        };
        return 'Every ' + str + repetitions + ' starting with day ' + this.datePipe.transform(new Date(data.startingWith), dataFormat) + addMothString;
      } else {
        return 'Every ' + str + repetitions;
      }
    } else if (data.tab === 'nationalHoliday') {
      if (data.nationalHoliday) {
        str = moment(data.nationalHoliday[0]).format('YYYY') + ' national holidays ';

        data.nationalHoliday.forEach((date: string, index: number) => {
          str = str + moment(date).format(dataFormat.toUpperCase());
          if (index != data.nationalHoliday.length - 1) {
            str = str + ', ';
          }
        });
      }
    }
    return str;
  }

  convertObjToArr(calendar: any, dateFormat: string): void {
    let obj: any = {};
    if (!calendar.frequencyList) {
      calendar.frequencyList = [];
    }
    if (calendar.includes && !isEmpty(calendar.includes)) {
      if (calendar.includes.months && calendar.includes.months.length > 0) {
        for (let m = 0; m < calendar.includes.months.length; m++) {
          let months = [];
          let allMonth = calendar.includes.months[m].months.length == 12;
          for (let x = 0; x < calendar.includes.months[m].months.length; x++) {
            months.push(calendar.includes.months[m].months[x].toString());
          }
          if (calendar.includes.months[m].weekdays && calendar.includes.months[m].weekdays.length > 0) {
            calendar.includes.months[m].weekdays.forEach((weekday: any) => {
              obj = {
                tab: 'weekDays',
                type: 'INCLUDE',
                days: [],
                startingWithW: weekday.from,
                endOnW: weekday.to,
                all: weekday.days.length == 7,
                months: months,
                allMonth: allMonth
              };
              weekday.days.forEach((day: any) => {
                obj.days.push(day.toString());
              });
              obj.str = this.freqToStr(obj, dateFormat);
              calendar.frequencyList.push(obj);
            });
          }
          if (calendar.includes.months[m].monthdays && calendar.includes.months[m].monthdays.length > 0) {
            calendar.includes.months[m].monthdays.forEach((monthday: any) => {
              if (monthday.weeklyDays && monthday.weeklyDays.length > 0) {
                monthday.weeklyDays.forEach((day: any) => {
                  obj = {
                    type: 'INCLUDE',
                    tab: 'specificWeekDays',
                    specificWeekDay: this.getStringDay(day.day),
                    which: day.weekOfMonth.toString(),
                    startingWithS: monthday.from,
                    endOnS: monthday.to,
                    months: months,
                    allMonth: allMonth
                  };
                  obj.str = this.freqToStr(obj, dateFormat);
                  calendar.frequencyList.push(obj);
                });
              } else {
                obj = {
                  type: 'INCLUDE',
                  tab: 'monthDays',
                  selectedMonths: [],
                  isUltimos: 'months',
                  startingWithM: monthday.from,
                  endOnM: monthday.to,
                  months: months,
                  allMonth: allMonth
                };
                monthday.days.forEach((day: any) => {
                  obj.selectedMonths.push(day.toString());
                });
                obj.str = this.freqToStr(obj, dateFormat);
                calendar.frequencyList.push(obj);
              }
            });
          }
          if (calendar.includes.months[m].ultimos && calendar.includes.months[m].ultimos.length > 0) {
            calendar.includes.months[m].ultimos.forEach((ultimos: any) => {
              if (ultimos.weeklyDays && ultimos.weeklyDays.length > 0) {
                ultimos.weeklyDays.forEach((day: any) => {
                  obj = {
                    type: 'INCLUDE',
                    tab: 'specificWeekDays',
                    specificWeekDay: this.getStringDay(day.day),
                    which: -day.weekOfMonth,
                    startingWithS: ultimos.from,
                    endOnS: ultimos.to,
                    months: months,
                    allMonth: allMonth
                  };
                  obj.str = this.freqToStr(obj, dateFormat);
                  calendar.frequencyList.push(obj);
                });
              } else {
                obj = {
                  type: 'INCLUDE',
                  tab: 'monthDays',
                  selectedMonthsU: [],
                  isUltimos: 'ultimos',
                  startingWithM: ultimos.from,
                  endOnM: ultimos.to,
                  months: months,
                  allMonth: allMonth
                };
                ultimos.days.forEach((day: any) => {
                  obj.selectedMonthsU.push(day.toString());
                });
                obj.str = this.freqToStr(obj, dateFormat);
                calendar.frequencyList.push(obj);
              }

            });
          }
          if (calendar.includes.months[m].repetitions && calendar.includes.months[m].repetitions.length > 0) {
            calendar.includes.months[m].repetitions.forEach((value: any) => {
              obj = {
                tab: 'every',
                type: 'INCLUDE',
                dateEntity: value.repetition,
                interval: value.step,
                startingWith: value.from,
                endOn: value.to,
                months: months,
                allMonth: allMonth
              };
              obj.str = this.freqToStr(obj, dateFormat);
              calendar.frequencyList.push(obj);
            });
          }
        }
      }
      if (calendar.includes.dates && calendar.includes.dates.length > 0) {
        obj = {
          tab: 'specificDays',
          type: 'INCLUDE',
          dates: calendar.includes.dates
        };
        obj.str = this.freqToStr(obj, dateFormat);
        calendar.frequencyList.push(obj);
      }
      if (calendar.includes.weekdays && calendar.includes.weekdays.length > 0) {
        calendar.includes.weekdays.forEach((weekday: any) => {
          obj = {
            tab: 'weekDays',
            type: 'INCLUDE',
            days: [],
            startingWithW: weekday.from,
            endOnW: weekday.to,
            all: weekday.days.length == 7
          };
          weekday.days.forEach((day: any) => {
            obj.days.push(day.toString());
          });
          obj.str = this.freqToStr(obj, dateFormat);
          calendar.frequencyList.push(obj);
        });
      }
      if (calendar.includes.monthdays && calendar.includes.monthdays.length > 0) {
        calendar.includes.monthdays.forEach((monthday: any) => {
          if (monthday.weeklyDays && monthday.weeklyDays.length > 0) {
            monthday.weeklyDays.forEach((day: any) => {
              obj = {
                type: 'INCLUDE',
                tab: 'specificWeekDays',
                specificWeekDay: this.getStringDay(day.day),
                which: day.weekOfMonth.toString(),
                startingWithS: monthday.from,
                endOnS: monthday.to
              };
              obj.str = this.freqToStr(obj, dateFormat);
              calendar.frequencyList.push(obj);
            });
          } else {
            obj = {
              type: 'INCLUDE',
              tab: 'monthDays',
              selectedMonths: [],
              isUltimos: 'months',
              startingWithM: monthday.from,
              endOnM: monthday.to
            };
            monthday.days.forEach((day: any) => {
              obj.selectedMonths.push(day.toString());
            });
            obj.str = this.freqToStr(obj, dateFormat);
            calendar.frequencyList.push(obj);
          }
        });
      }
      if (calendar.includes.holidays && calendar.includes.holidays.length > 0) {
        const arr = this.groupByDates(calendar.includes.holidays[0].dates);
        for (let x = 0; x < arr.length; x++) {
          obj = {
            type: 'INCLUDE',
            tab: 'nationalHoliday',
            nationalHoliday: arr[x]
          };
          obj.str = this.freqToStr(obj, dateFormat);
          calendar.frequencyList.push(obj);
        }
      }
      if (calendar.includes.ultimos && calendar.includes.ultimos.length > 0) {
        calendar.includes.ultimos.forEach((ultimos: any) => {
          if (ultimos.weeklyDays && ultimos.weeklyDays.length > 0) {
            ultimos.weeklyDays.forEach((day: any) => {
              obj = {
                type: 'INCLUDE',
                tab: 'specificWeekDays',
                specificWeekDay: this.getStringDay(day.day),
                which: -day.weekOfMonth,
                startingWithS: ultimos.from,
                endOnS: ultimos.to
              };
              obj.str = this.freqToStr(obj, dateFormat);
              calendar.frequencyList.push(obj);
            });
          } else {
            obj = {
              type: 'INCLUDE',
              tab: 'monthDays',
              selectedMonthsU: [],
              isUltimos: 'ultimos',
              startingWithM: ultimos.from,
              endOnM: ultimos.to
            };
            ultimos.days.forEach((day: any) => {
              obj.selectedMonthsU.push(day.toString());
            });
            obj.str = this.freqToStr(obj, dateFormat);
            calendar.frequencyList.push(obj);
          }

        });
      }
      if (calendar.includes.repetitions && calendar.includes.repetitions.length > 0) {
        calendar.includes.repetitions.forEach((value: any) => {
          obj = {
            tab: 'every',
            type: 'INCLUDE',
            dateEntity: value.repetition,
            interval: value.step,
            startingWith: value.from,
            endOn: value.to
          };
          obj.str = this.freqToStr(obj, dateFormat);
          calendar.frequencyList.push(obj);
        });
      }
    }
  }


  generateCalendarObj(data: any, obj: any): any {
    const self = this;
    const arr = [];
    let from, to;
    const type = (!data.type || data.type === 'INCLUDE') ? 'includes' : 'excludes';
    if (data.months && isArray(data.months) && data.months.length > 0) {
      if (!obj[type].months) {
        obj[type].months = [];
      }

      if (data.tab === 'weekDays') {
        if (data.startingWithW) {
          from = moment(data.startingWithW).format('YYYY-MM-DD');
        }
        if (data.endOnW) {
          to = moment(data.endOnW).format('YYYY-MM-DD');
        }
        arr.push({from, to, days: data.days.map(Number)});
        obj[type].months.push({months: data.months.map(Number), weekdays: arr});
      } else if (data.tab === 'monthDays') {
        if (data.startingWithM) {
          from = moment(data.startingWithM).format('YYYY-MM-DD');
        }
        if (data.endOnM) {
          to = moment(data.endOnM).format('YYYY-MM-DD');
        }
        if (data.isUltimos === 'months') {
          arr.push({days: data.selectedMonths.map(Number), from, to});
          obj[type].months.push({months: data.months.map(Number), monthdays: arr});
        } else {
          arr.push({days: data.selectedMonthsU.map(Number), from, to});
          obj[type].months.push({months: data.months.map(Number), ultimos: arr});
        }
      } else if (data.tab === 'specificWeekDays') {
        if (data.startingWithS) {
          from = moment(data.startingWithS).format('YYYY-MM-DD');
        }
        if (data.endOnS) {
          to = moment(data.endOnS).format('YYYY-MM-DD');
        }
        arr.push({
          day: self.getDay(data.specificWeekDay),
          weekOfMonth: Math.abs(data.which)
        });
        const arrObj = [];
        arrObj.push({weeklyDays: arr, from, to});
        if (data.which > 0) {
          obj[type].months.push({months: data.months.map(Number), monthdays: arrObj});
        } else {
          obj[type].months.push({months: data.months.map(Number), ultimos: arrObj});
        }
      } else if (data.tab === 'every') {
        const obj1: any = {};
        if (data.startingWith) {
          obj1.from = moment(data.startingWith).format('YYYY-MM-DD');
        }
        if (data.endOn) {
          obj1.to = moment(data.endOn).format('YYYY-MM-DD');
        }
        obj1.repetition = data.dateEntity;
        obj1.step = data.interval || 1;
        arr.push(obj1);
        obj[type].months.push({months: data.months.map(Number), repetitions: arr});
      }
    } else {
      if (data.tab === 'specificDays') {
        if (!obj[type].dates) {
          obj[type].dates = [];
        }
        data.dates.forEach((value: string) => {
          obj[type].dates.push(moment(value).format('YYYY-MM-DD'));
        });

      } else if (data.tab === 'weekDays') {
        if (!obj[type].weekdays) {
          obj[type].weekdays = [];
        }
        if (data.startingWithW) {
          from = moment(data.startingWithW).format('YYYY-MM-DD');
        }
        if (data.endOnW) {
          to = moment(data.endOnW).format('YYYY-MM-DD');
        }
        obj[type].weekdays.push({from, to, days: data.days.map(Number)});
      } else if (data.tab === 'monthDays') {
        if (data.isUltimos === 'months') {
          if (!obj[type].monthdays) {
            obj[type].monthdays = [];
          }

          if (data.startingWithM) {
            from = moment(data.startingWithM).format('YYYY-MM-DD');
          }
          if (data.endOnM) {
            to = moment(data.endOnM).format('YYYY-MM-DD');
          }
          obj[type].monthdays.push({from, to, days: data.selectedMonths.map(Number)});
        } else {
          if (!obj[type].ultimos) {
            obj[type].ultimos = [];
          }

          if (data.startingWithM) {
            from = moment(data.startingWithM).format('YYYY-MM-DD');
          }
          if (data.endOnM) {
            to = moment(data.endOnM).format('YYYY-MM-DD');
          }
          obj[type].ultimos.push({from, to, days: data.selectedMonthsU.map(Number)});
        }
      } else if (data.tab === 'specificWeekDays') {
        arr.push({
          day: self.getDay(data.specificWeekDay),
          weekOfMonth: Math.abs(data.which)
        });

        if (data.startingWithS) {
          from = moment(data.startingWithS).format('YYYY-MM-DD');
        }
        if (data.endOnS) {
          to = moment(data.endOnS).format('YYYY-MM-DD');
        }
        if (data.which > 0) {
          if (!obj[type].monthdays) {
            obj[type].monthdays = [];
          }
          obj[type].monthdays.push({from, to, weeklyDays: arr});
        } else {
          if (!obj[type].ultimos) {
            obj[type].ultimos = [];
          }
          obj[type].ultimos.push({from, to, weeklyDays: arr});
        }
      } else if (data.tab === 'nationalHoliday') {
        if (!obj[type].holidays) {
          obj[type].holidays = [];
        }
        const dates: string[] = [];
        data.nationalHoliday.forEach((value: any) => {
          dates.push(moment(value).format('YYYY-MM-DD'));
        });
        if (obj[type].holidays.length > 0) {
          obj[type].holidays[0].dates = obj[type].holidays[0].dates.concat(dates);
        } else {
          obj[type].holidays.push({dates});
        }
      } else if (data.tab === 'every') {
        if (!obj[type].repetitions) {
          obj[type].repetitions = [];
        }
        const obj1: any = {};
        if (data.startingWith) {
          obj1.from = moment(data.startingWith).format('YYYY-MM-DD');
        }
        if (data.endOn) {
          obj1.to = moment(data.endOn).format('YYYY-MM-DD');
        }
        obj1.repetition = data.dateEntity;
        obj1.step = data.interval || 1;
        obj[type].repetitions.push(obj1);

      }
    }
    return obj;
  }

  groupByDates(arrayOfDates: any): any {
    const datesObj = groupBy(arrayOfDates, (el) => {
      return moment(el.toString()).format('YYYY');
    });
    return toArray(datesObj);
  }

  checkTime(time: string): string {
    if (/^\d{1,2}:\d{2}?$/i.test(time)) {
      time = time + ':00';
    } else if (/^\d{1,2}:\d{2}(:)?$/i.test(time)) {
      time = time + '00';
    } else if (/^\d{1,2}?$/i.test(time)) {
      time = time + ':00:00';
    }
    if (time === '00:00') {
      time = '00:00:00';
    } else if (time.length === 3) {
      time = time + '00:00';
    } else if (time.length === 4) {
      time = time + '0:00';
    } else if (time.length === 6) {
      time = time + '00';
    } else if (time.length === 7) {
      time = time + '0';
    }
    return time;
  }

  compareNumbers(a: any, b: any): any {
    return a - b;
  }

}
