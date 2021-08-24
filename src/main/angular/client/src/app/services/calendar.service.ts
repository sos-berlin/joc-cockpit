import {Injectable} from '@angular/core';
import {DatePipe} from '@angular/common';
import {groupBy, isArray, toArray} from 'underscore';
import * as moment from 'moment';

@Injectable()
export class CalendarService {
  preferences: any = {};

  constructor(private datePipe: DatePipe) {
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences) || {};
    }
  }

  getStringDay(day): string {
    return day == 0 ? 'sunday' : day == 1 ? 'monday' : day == 2 ? 'tuesday' : day == 3 ? 'wednesday' : day == 4 ? 'thursday' : day == 5 ? 'friday' : 'saturday';
  }

  getDay(day): number {
    return day == 'sunday' ? 0 : day == 'monday' ? 1 : day == 'tuesday' ? 2 : day == 'wednesday' ? 3 : day == 'thursday' ? 4 : day == 'friday' ? 5 : 6;
  }

  getMonths(month): string {
    let str = '';
    if (!month) {
      return '';
    }

    let months = month;
    if (!isArray(month)) {
      months = month.toString().split(' ');
    }
    if (months.length == 12) {
      return 'every month';
    }

    months.sort(this.compareNumbers).forEach((value) => {
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

  getWeekDays(day): string {
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
    days.forEach((value) => {
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

  getSpecificDay(day): string {
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
    } else{
      return '';
    }
  }

  getMonthDays(month, isUltimos): string {
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
    if (data.tab === 'weekDays') {
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
    } else if (data.tab === 'specificDays') {
      str = 'On ';
      if (data.dates) {
        data.dates.forEach((date, index) => {
          str = str + moment(date).format(dataFormat.toUpperCase());
          if (index != data.dates.length - 1) {
            str = str + ', ';
          }
        });
      }
      return str;
    } else if (data.tab === 'monthDays') {
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
        return 'Every ' + str + repetitions + ' starting with day ' + this.datePipe.transform(new Date(data.startingWith), dataFormat);
      } else {
        return 'Every ' + str + repetitions;
      }
    } else if (data.tab === 'nationalHoliday') {
      if (data.nationalHoliday) {
        str = moment(data.nationalHoliday[0]).format('YYYY') + ' national holidays ';

        data.nationalHoliday.forEach((date, index) => {
          str = str + moment(date).format(dataFormat.toUpperCase());
          if (index != data.nationalHoliday.length - 1) {
            str = str + ', ';
          }
        });
      }
    }
    return str;
  }

  generateCalendarObj(data, obj): any {
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
        arr.push({days: data.days.map(Number), from, to});
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
      }
    } else {
      if (data.tab === 'weekDays') {
        if (!obj[type].weekdays) {
          obj[type].weekdays = [];
        }
        if (data.startingWithW) {
          from = moment(data.startingWithW).format('YYYY-MM-DD');
        }
        if (data.endOnW) {
          to = moment(data.endOnW).format('YYYY-MM-DD');
        }
        obj[type].weekdays.push({days: data.days.map(Number), from, to});
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
          obj[type].monthdays.push({days: data.selectedMonths.map(Number), from, to});
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
          obj[type].ultimos.push({days: data.selectedMonthsU.map(Number), from, to});
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
          obj[type].monthdays.push({weeklyDays: arr, from, to});
        } else {
          if (!obj[type].ultimos) {
            obj[type].ultimos = [];
          }
          obj[type].ultimos.push({weeklyDays: arr, from, to});
        }
      } else if (data.tab === 'specificDays') {
        if (!obj[type].dates) {
          obj[type].dates = [];
        }
        data.dates.forEach((value) => {
          obj[type].dates.push(moment(value).format('YYYY-MM-DD'));
        });

      } else if (data.tab === 'every') {
        if (!obj[type].repetitions) {
          obj[type].repetitions = [];
        }
        const obj1: any = {
          repetition: data.dateEntity,
          step: data.interval || 1,
        };
        if (data.startingWith) {
          obj1.from = moment(data.startingWith).format('YYYY-MM-DD');
        }
        if (data.endOn) {
          obj1.to = moment(data.endOn).format('YYYY-MM-DD');
        }
        obj[type].repetitions.push(obj1);

      } else if (data.tab === 'nationalHoliday') {
        if (!obj[type].holidays) {
          obj[type].holidays = [];
        }
        const dates = [];
        data.nationalHoliday.forEach((value) => {
          dates.push(moment(value).format('YYYY-MM-DD'));
        });
        if (obj[type].holidays.length > 0) {
          obj[type].holidays[0].dates = obj[type].holidays[0].dates.concat(dates);
        } else {
          obj[type].holidays.push({dates});
        }
      }
    }

    return obj;
  }

  groupByDates(arrayOfDates): any {
    const datesObj = groupBy(arrayOfDates, (el) => {
      return moment(el.toString()).format('YYYY');
    });
    return toArray(datesObj);
  }

  getTimeInString(time): string {
    if (time.toString().substring(0, 2) === '00' && time.toString().substring(3, 5) === '00') {
      return time.toString().substring(6, time.length) + ' seconds';
    } else if (time.toString().substring(0, 2) === '00') {
      return time.toString().substring(3, time.length) + ' minutes';
    } else if ((time.toString().substring(0, 2) != '00' && time.length === 5) || (time.length > 5 && time.toString().substring(0, 2) != '00' && (time.toString().substring(6, time.length) === '00'))) {
      return time.toString().substring(0, 5) + ' hours';
    } else {
      return time;
    }
  }

  getTimeFromDate(t): string {
    const tf = this.preferences.dateFormat;
    let x = 'HH:mm:ss';
    if ((tf.match(/HH:mm:ss/gi) || tf.match(/HH:mm/gi) || tf.match(/hh:mm:ss A/gi) || tf.match(/hh:mm A/gi)) != null) {
      const result = (tf.match(/HH:mm:ss/gi) || tf.match(/HH:mm/gi) || tf.match(/hh:mm:ss A/gi) || tf.match(/hh:mm A/gi)) + '';
      if (result.match(/hh/g)) {
        x = result + ' a';
      } else {
        x = result;
      }
    }
    let time = moment(t).format(x);
    if (time === '00:00' || time === '00:00:00') {
      time = '24:00:00';
    }
    return time;
  }

  checkTime(time): string {
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

  compareNumbers(a, b): any {
    return a - b;
  }

}
