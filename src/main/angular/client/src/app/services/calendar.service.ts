import {Injectable} from '@angular/core';
import {DatePipe} from '@angular/common';
import {CoreService} from './core.service';
import * as _ from 'underscore';
import * as moment from 'moment';

@Injectable()
export class CalendarService {

  constructor(private datePipe: DatePipe, private coreService: CoreService) {

  }

  getStringDay(day): string {
    return day == 0 ? 'sunday' : day == 1 ? 'monday' : day == 2 ? 'tuesday' : day == 3 ? 'wednesday' : day == 4 ? 'thursday' : day == 5 ? 'friday' : 'saturday';
  }


  getDay(day): number {
    return day == 'sunday' ? 0 : day == 'monday' ? 1 : day == 'tuesday' ? 2 : day == 'wednesday' ? 3 : day == 'thursday' ? 4 : day == 'friday' ? 5 : 6;
  }

  getMonths(month): string {
    let str = '';
    if (!month)
      return;

    let months = month;
    if (!_.isArray(month)) {
      months = month.toString().split(' ');
    }
    if (months.length == 12) {
      return 'every month';
    }

    months.sort(this.compareNumbers).forEach(function (value) {
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

    if (str.length == 1) {
      return '';
    } else {
      if (str.substring(str.length - 1) == ',') {
        str = str.substring(0, str.length - 1);
      }
    }
    return str;
  }

  getWeekDays(day): string {
    if (!day) {
      return;
    }
    let days = day;
    if (!_.isArray(day)) {
      days = day.toString().split(' ');
    }
    if (days.length == 7) {
      return 'Every day';
    }
    let str = '';
    days.forEach(function (value) {
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

    if (str.length == 1) {
      return '';
    } else {
      if (str.substring(str.length - 1) == ',')
        str = str.substring(0, str.length - 1);
    }
    return str;
  }

  getSpecificDay(day): string {
    if (!day) {
      return;
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
    }
  }

  getMonthDays(month, isUltimos): string {
    let str = '';
    if (!month) {
      return month;
    }
    let months = month;
    if (!_.isArray(month)) {
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

    if (str.length == 1) {
      return '';
    } else {
      if (str.substring(str.length - 1) == ',') {
        str = str.substring(0, str.length - 1);
      }
    }

    return str;
  }

  freqToStr(data: any, dataFormat: string): string {
    let self = this;
    let str = '';
    if (data.months && _.isArray(data.months)) {
      str = self.getMonths(data.months);
    }
    if (data.tab == 'weekDays') {
      if (str) {
        return self.getWeekDays(data.days) + ' on ' + str;
      } else {
        return self.getWeekDays(data.days);
      }
    } else if (data.tab == 'specificWeekDays') {
      if (str) {
        return self.getSpecificDay(data.which) + ' ' + data.specificWeekDay + ' of ' + str;
      } else {
        return self.getSpecificDay(data.which) + ' ' + data.specificWeekDay + ' of month';
      }
    } else if (data.tab == 'specificDays') {
      str = 'On ';
      if (data.dates) {
        data.dates.forEach(function (date, index) {
          str = str + moment(date).format(dataFormat.toUpperCase());
          if (index != data.dates.length - 1) {
            str = str + ', ';
          }
        });
      }
      return str;
    } else if (data.tab == 'monthDays') {
      if (data.isUltimos != 'months') {
        if (str) {
          return '- ' + self.getMonthDays(data.selectedMonthsU, data.isUltimos) + ' of ' + str;
        } else {
          return self.getMonthDays(data.selectedMonthsU, data.isUltimos) + ' of ultimos';
        }
      } else {
        if (str) {
          return self.getMonthDays(data.selectedMonths, null) + ' of ' + str;
        } else {
          return self.getMonthDays(data.selectedMonths, null) + ' of month';
        }
      }
    } else if (data.tab == 'every') {
      if (data.interval == 1) {
        str = data.interval + 'st ';
      } else if (data.interval == 2) {
        str = data.interval + 'nd ';
      } else if (data.interval == 3) {
        str = data.interval + 'rd ';
      } else {
        str = data.interval + 'th ';
      }
      let repetitions = data.dateEntity == 'DAILY' ? 'day' : data.dateEntity == 'WEEKLY' ? 'week' : data.dateEntity == 'MONTHLY' ? 'month' : 'year';
      if (data.startingWith) {
        let formattedDate = moment(data.startingWith, 'DD-MM-YYYY');
        return 'Every ' + str + repetitions + ' starting with day ' + this.datePipe.transform(formattedDate, dataFormat);
      } else {
        return 'Every ' + str + repetitions;
      }

    } else if (data.tab == 'nationalHoliday') {
      if (data.nationalHoliday) {
        str = moment(data.nationalHoliday[0]).format('YYYY') + ' national holidays ';

        data.nationalHoliday.forEach(function (date, index) {
          str = str + moment(date).format(dataFormat.toUpperCase());
          if (index != data.nationalHoliday.length - 1) {
            str = str + ', ';
          }
        });
      }
      return str;
    }
  }

  generateCalendarObj(data, obj): any {
    let self = this;
    let arr = [];
    let from, to;
    if (data.type == 'INCLUDE') {
      if (data.months && _.isArray(data.months) && data.months.length > 0) {
        if (!obj.includes.months)
          obj.includes.months = [];

        if (data.tab == 'weekDays') {
          if (data.startingWithW) {
            from = moment(data.startingWithW).format('YYYY-MM-DD');
          }
          if (data.endOnW) {
            to = moment(data.endOnW).format('YYYY-MM-DD');
          }
          arr.push({days: data.days, from: from, to: to});
          obj.includes.months.push({months: data.months, weekdays: arr});
        } else if (data.tab == 'monthDays') {
          if (data.startingWithM) {
            from = moment(data.startingWithM).format('YYYY-MM-DD');
          }
          if (data.endOnM) {
            to = moment(data.endOnM).format('YYYY-MM-DD');
          }
          if (data.isUltimos == 'months') {
            arr.push({days: data.selectedMonths, from: from, to: to});
            obj.includes.months.push({months: data.months, monthdays: arr});
          } else {
            arr.push({days: data.selectedMonthsU, from: from, to: to});
            obj.includes.months.push({months: data.months, ultimos: arr});
          }
        } else if (data.tab == 'specificWeekDays') {
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
          let arrObj = [];
          arrObj.push({weeklyDays: arr, from: from, to: to});
          if (data.which > 0) {
            obj.includes.months.push({months: data.months, monthdays: arrObj});
          } else {
            obj.includes.months.push({months: data.months, ultimos: arrObj});
          }
        }
      } else {
        if (data.tab == 'weekDays') {
          if (!obj.includes.weekdays)
            obj.includes.weekdays = [];

          if (data.startingWithW) {
            from = moment(data.startingWithW).format('YYYY-MM-DD');
          }
          if (data.endOnW) {
            to = moment(data.endOnW).format('YYYY-MM-DD');
          }
          obj.includes.weekdays.push({days: data.days, from: from, to: to});
        } else if (data.tab == 'monthDays') {
          if (data.isUltimos == 'months') {
            if (!obj.includes.monthdays)
              obj.includes.monthdays = [];

            if (data.startingWithM) {
              from = moment(data.startingWithM).format('YYYY-MM-DD');
            }
            if (data.endOnM) {
              to = moment(data.endOnM).format('YYYY-MM-DD');
            }
            obj.includes.monthdays.push({days: data.selectedMonths, from: from, to: to});
          } else {
            if (!obj.includes.ultimos)
              obj.includes.ultimos = [];

            if (data.startingWithM) {
              from = moment(data.startingWithM).format('YYYY-MM-DD');
            }
            if (data.endOnM) {
              to = moment(data.endOnM).format('YYYY-MM-DD');
            }
            obj.includes.ultimos.push({days: data.selectedMonthsU, from: from, to: to});
          }
        } else if (data.tab == 'specificWeekDays') {
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
            if (!obj.includes.monthdays)
              obj.includes.monthdays = [];
            obj.includes.monthdays.push({weeklyDays: arr, from: from, to: to});
          } else {
            if (!obj.includes.ultimos)
              obj.includes.ultimos = [];
            obj.includes.ultimos.push({weeklyDays: arr, from: from, to: to});
          }
        } else if (data.tab == 'specificDays') {
          if (!obj.includes.dates)
            obj.includes.dates = [];
          data.dates.forEach(function (value) {
            obj.includes.dates.push(moment(value).format('YYYY-MM-DD'));
          });

        } else if (data.tab == 'every') {
          if (!obj.includes.repetitions)
            obj.includes.repetitions = [];
          let obj1 = {
            repetition: data.dateEntity,
            step: data.interval || 1,
            from: '',
            to: ''
          };
          if (data.startingWith)
            obj1.from = moment(data.startingWith).format('YYYY-MM-DD');
          if (data.endOn) {
            obj1.to = moment(data.endOn).format('YYYY-MM-DD');
          }
          obj.includes.repetitions.push(obj1);

        } else if (data.tab == 'nationalHoliday') {
          if (!obj.includes.holidays)
            obj.includes.holidays = [];
          let dates = [];
          data.nationalHoliday.forEach(function (value) {
            dates.push(moment(value).format('YYYY-MM-DD'));
          });
          if (obj.includes.holidays.length > 0) {
            obj.includes.holidays[0].dates = obj.includes.holidays[0].dates.concat(dates);
          } else {
            obj.includes.holidays.push({dates: dates});
          }
        }
      }
    } else {
      if (data.months && _.isArray(data.months) && data.months.length > 0) {
        if (!obj.excludes.months)
          obj.excludes.months = [];

        if (data.tab == 'weekDays') {

          if (data.startingWithW) {
            from = moment(data.startingWithW).format('YYYY-MM-DD');
          }
          if (data.endOnW) {
            to = moment(data.endOnW).format('YYYY-MM-DD');
          }

          arr.push({days: data.days, from: from, to: to});
          obj.excludes.months.push({months: data.months, weekdays: arr});
        } else if (data.tab == 'monthDays') {
          if (data.startingWithM) {
            from = moment(data.startingWithM).format('YYYY-MM-DD');
          }
          if (data.endOnM) {
            to = moment(data.endOnM).format('YYYY-MM-DD');
          }

          if (data.isUltimos == 'months') {
            arr.push({days: data.selectedMonths, from: from, to: to});
            obj.excludes.months.push({months: data.months, monthdays: arr});
          } else {
            arr.push({days: data.selectedMonthsU, from: from, to: to});
            obj.excludes.months.push({months: data.months, ultimos: arr});
          }
        } else if (data.tab == 'specificWeekDays') {
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
          let arrObj = [];
          arrObj.push({weeklyDays: arr, from: from, to: to});
          if (data.which > 0) {
            obj.excludes.months.push({months: data.months, monthdays: arrObj});
          } else {
            obj.excludes.months.push({months: data.months, ultimos: arrObj});
          }
        }
      } else {
        if (data.tab == 'weekDays') {
          if (data.startingWithW) {
            from = moment(data.startingWithW).format('YYYY-MM-DD');
          }
          if (data.endOnW) {
            to = moment(data.endOnW).format('YYYY-MM-DD');
          }
          if (!obj.excludes.weekdays)
            obj.excludes.weekdays = [];
          obj.excludes.weekdays.push({days: data.days, from: from, to: to});
        } else if (data.tab == 'monthDays') {
          if (data.startingWithM) {
            from = moment(data.startingWithM).format('YYYY-MM-DD');
          }
          if (data.endOnM) {
            to = moment(data.endOnM).format('YYYY-MM-DD');
          }
          if (data.isUltimos == 'months') {
            if (!obj.excludes.monthdays)
              obj.excludes.monthdays = [];
            obj.excludes.monthdays.push({days: data.selectedMonths, from: from, to: to});
          } else {
            if (!obj.excludes.ultimos)
              obj.excludes.ultimos = [];
            obj.excludes.ultimos.push({days: data.selectedMonthsU, from: from, to: to});
          }
        } else if (data.tab == 'specificWeekDays') {
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
          if (data.which > 0) {
            if (!obj.excludes.monthdays)
              obj.excludes.monthdays = [];
            obj.excludes.monthdays.push({weeklyDays: arr, from: from, to: to});
          } else {
            if (!obj.excludes.ultimos)
              obj.excludes.ultimos = [];
            obj.excludes.ultimos.push({weeklyDays: arr, from: from, to: to});
          }
        } else if (data.tab == 'specificDays') {
          if (!obj.excludes.dates)
            obj.excludes.dates = [];
          data.dates.forEach(function (value) {
            obj.excludes.dates.push(moment(value).format('YYYY-MM-DD'));
          });

        } else if (data.tab == 'every') {
          if (!obj.excludes.repetitions)
            obj.excludes.repetitions = [];
          let obj1 = {
            repetition: data.dateEntity,
            step: data.interval || 1,
            from: '',
            to: ''
          };
          if (data.startingWith)
            obj1.from = moment(data.startingWith).format('YYYY-MM-DD');
          if (data.endOn)
            obj1.to = moment(data.endOn).format('YYYY-MM-DD');
          obj.excludes.repetitions.push(obj1);

        } else if (data.tab == 'nationalHoliday') {
          if (!obj.excludes.holidays)
            obj.excludes.holidays = [];
          let dates = [];
          data.nationalHoliday.forEach(function (value) {
            dates.push(moment(value).format('YYYY-MM-DD'));
          });
          if (obj.excludes.holidays.length > 0) {
            obj.excludes.holidays[0].dates = obj.excludes.holidays[0].dates.concat(dates);
          } else {
            obj.excludes.holidays.push({dates: dates});
          }
        }
      }
    }

    return obj;
  }

  groupByDates(arrayOfDates) {
    let datesObj = _.groupBy(arrayOfDates, function (el) {
      return moment(el.toString()).format('YYYY');
    });
    return _(datesObj).toArray();
  }

  private compareNumbers(a, b) {
    return a - b;
  }
}
