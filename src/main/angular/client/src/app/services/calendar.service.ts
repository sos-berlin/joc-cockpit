import {Injectable, OnInit} from '@angular/core';
import {DatePipe} from '@angular/common';
import * as _ from 'underscore';
import * as moment from 'moment';

@Injectable()
export class CalendarService implements OnInit {
  preferences: any = {};

  constructor(private datePipe: DatePipe) {
  }

  ngOnInit() {
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
    if (!month)
      return;

    let months = month;
    if (!_.isArray(month)) {
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
      return;
    }
    let days = day;
    if (!_.isArray(day)) {
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
    let self = this;
    let str = '';
    if (data.months && _.isArray(data.months)) {
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
      let repetitions = data.dateEntity === 'DAILY' ? 'day' : data.dateEntity === 'WEEKLY' ? 'week' : data.dateEntity === 'MONTHLY' ? 'month' : 'year';
      if (data.startingWith) {
        let formattedDate = moment(data.startingWith, 'DD-MM-YYYY');
        return 'Every ' + str + repetitions + ' starting with day ' + this.datePipe.transform(formattedDate, dataFormat);
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
      return str;
    }
  }

  generateCalendarObj(data, obj): any {
    const self = this;
    let arr = [];
    let from, to;
    const type = (!data.type || data.type === 'INCLUDE') ? 'includes' : 'excludes';
    if (data.months && _.isArray(data.months) && data.months.length > 0) {
      if (!obj[type].months)
        obj[type].months = [];

      if (data.tab === 'weekDays') {
        if (data.startingWithW) {
          from = moment(data.startingWithW).format('YYYY-MM-DD');
        }
        if (data.endOnW) {
          to = moment(data.endOnW).format('YYYY-MM-DD');
        }
        arr.push({days: data.days, from: from, to: to});
        obj[type].months.push({months: data.months, weekdays: arr});
      } else if (data.tab === 'monthDays') {
        if (data.startingWithM) {
          from = moment(data.startingWithM).format('YYYY-MM-DD');
        }
        if (data.endOnM) {
          to = moment(data.endOnM).format('YYYY-MM-DD');
        }
        if (data.isUltimos === 'months') {
          arr.push({days: data.selectedMonths, from: from, to: to});
          obj[type].months.push({months: data.months, monthdays: arr});
        } else {
          arr.push({days: data.selectedMonthsU, from: from, to: to});
          obj[type].months.push({months: data.months, ultimos: arr});
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
        let arrObj = [];
        arrObj.push({weeklyDays: arr, from: from, to: to});
        if (data.which > 0) {
          obj[type].months.push({months: data.months, monthdays: arrObj});
        } else {
          obj[type].months.push({months: data.months, ultimos: arrObj});
        }
      }
    } else {
      if (data.tab === 'weekDays') {
        if (!obj[type].weekdays)
          obj[type].weekdays = [];
        if (data.startingWithW) {
          from = moment(data.startingWithW).format('YYYY-MM-DD');
        }
        if (data.endOnW) {
          to = moment(data.endOnW).format('YYYY-MM-DD');
        }
        obj[type].weekdays.push({days: data.days, from: from, to: to});
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
          obj[type].monthdays.push({days: data.selectedMonths, from: from, to: to});
        } else {
          if (!obj[type].ultimos)
            obj[type].ultimos = [];

          if (data.startingWithM) {
            from = moment(data.startingWithM).format('YYYY-MM-DD');
          }
          if (data.endOnM) {
            to = moment(data.endOnM).format('YYYY-MM-DD');
          }
          obj[type].ultimos.push({days: data.selectedMonthsU, from: from, to: to});
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
          obj[type].monthdays.push({weeklyDays: arr, from: from, to: to});
        } else {
          if (!obj[type].ultimos)
            obj[type].ultimos = [];
          obj[type].ultimos.push({weeklyDays: arr, from: from, to: to});
        }
      } else if (data.tab === 'specificDays') {
        if (!obj[type].dates)
          obj[type].dates = [];
        data.dates.forEach((value) => {
          obj[type].dates.push(moment(value).format('YYYY-MM-DD'));
        });

      } else if (data.tab === 'every') {
        if (!obj[type].repetitions)
          obj[type].repetitions = [];
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
        obj[type].repetitions.push(obj1);

      } else if (data.tab === 'nationalHoliday') {
        if (!obj[type].holidays)
          obj[type].holidays = [];
        let dates = [];
        data.nationalHoliday.forEach((value) => {
          dates.push(moment(value).format('YYYY-MM-DD'));
        });
        if (obj[type].holidays.length > 0) {
          obj[type].holidays[0].dates = obj[type].holidays[0].dates.concat(dates);
        } else {
          obj[type].holidays.push({dates: dates});
        }
      }
    }

    return obj;
  }

  groupByDates(arrayOfDates) {
    let datesObj = _.groupBy(arrayOfDates, (el) => {
      return moment(el.toString()).format('YYYY');
    });
    return _.toArray(datesObj);
  }

  checkPeriod(value, period): boolean {
    if (!value || !period) {
      return;
    }
    let flg = false, isMatch = false;
    if (value.whenHoliday === period.whenHoliday) {
      flg = true;
    } else if (!value.whenHoliday && period.whenHoliday === 'suppress') {
      flg = true;
    }
    if (!period.whenHoliday && value.whenHoliday === 'suppress') {
      flg = true;
    }
    if (period.singleStart && flg && value.singleStart) {
      if (value.singleStart.length === 5) {
        value.singleStart = value.singleStart + ':00';
      }
      if (period.singleStart.length === 5) {
        period.singleStart = period.singleStart + ':00';
      }
      return value.singleStart === period.singleStart;
    }
    if (period.begin && flg && value.begin) {
      if (value.begin.length === 5) {
        value.begin = value.begin + ':00';
      }
      if (period.begin.length === 5) {
        period.begin = period.begin + ':00';
      }
      flg = value.begin === period.begin;
      isMatch = flg;
    }
    if (period.end && flg && value.end) {
      if (value.end.length === 5) {
        value.end = value.end + ':00';
      }
      if (period.end.length === 5) {
        period.end = period.end + ':00';
      }
      flg = value.end === period.end;
      isMatch = flg;
    }
    if (period.repeat && flg && value.repeat) {
      if (value.repeat.length === 5) {
        value.repeat = value.repeat + ':00';
      }
      if (period.repeat.length === 5) {
        period.repeat = period.repeat + ':00';
      }
      return value.repeat === period.repeat;
    }
    if (period.absoluteRepeat && flg && value.absoluteRepeat) {
      if (value.absoluteRepeat.length === 5) {
        value.absoluteRepeat = value.absoluteRepeat + ':00';
      }
      if (period.absoluteRepeat.length === 5) {
        period.absoluteRepeat = period.absoluteRepeat + ':00';
      }
      return value.absoluteRepeat === period.absoluteRepeat;
    }
    return isMatch;
  }

  stringMonthsNumber(month) {
    return month
      .replace('january', '1')
      .replace('february', '2')
      .replace('march', '3')
      .replace('april', '4')
      .replace('may', '5')
      .replace('june', '6')
      .replace('july', '7')
      .replace('august', '8')
      .replace('september', '9')
      .replace('october', '10')
      .replace('november', '11')
      .replace('december', '11');
  }

  getTimeInString(time) {
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

  getTimeFromDate(t) {
    let tf = this.preferences.dateFormat;
    let x = 'HH:mm:ss';
    if ((tf.match(/HH:mm:ss/gi) || tf.match(/HH:mm/gi) || tf.match(/hh:mm:ss A/gi) || tf.match(/hh:mm A/gi)) != null) {
      let result = (tf.match(/HH:mm:ss/gi) || tf.match(/HH:mm/gi) || tf.match(/hh:mm:ss A/gi) || tf.match(/hh:mm A/gi)) + '';
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

  getTimeFromNumber(totalSeconds) {
    let hours: any = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    let minutes: any = Math.floor(totalSeconds / 60);
    let seconds: any = totalSeconds % 60;
    minutes = String(minutes).padStart(2, '0');
    hours = String(hours).padStart(2, '0');
    seconds = String(seconds).padStart(2, '0');
    return (hours + ':' + minutes + ':' + seconds);
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
    }
    return time;
  }

  checkPeriodList(run_time, param, selectedMonths, selectedMonthsU) {
    let isMonth = false;
    if (run_time.months) {
      for (let i = 0; i < run_time.months.length; i++) {
        if (run_time.months[i].month && _.isEqual(run_time.months[i].month, param.months) || _.isEqual(run_time.months[i].month.toString().split(' '), param.months)) {
          isMonth = true;
          break;
        }
      }
    }
    if (param.tab === 'specificDays') {
      if (!run_time.dates) {
        run_time.dates = [];
      }
      if (!param.date && param.dates) {
        param.date = param.dates;
      }
      if (run_time.dates.length > 0) {
        let _period = [];
        run_time.dates.forEach((value) => {
          if (value.date && param.date && (_.isEqual(value.date, moment(param.date).format('YYYY-MM-DD')))) {
            if (_.isArray(value.periods)) {
              value.periods.forEach((res) => {
                if (res)
                  _period.push(res);
              });
            } else {
              if (value.periods) {
                _period.push(value.periods);
              }
            }

            _period.push(param.period);
            value.periods = _period;
          }
        });
        if (_period.length === 0) {
          if (!_.isArray(run_time.dates)) {
            run_time.dates = [];
          }
          run_time.dates.push({
            'date': moment(param.date).format('YYYY-MM-DD'),
            'periods': _.isEmpty(param.period) ? [] : [param.period]
          });
        }
      } else {
        run_time.dates.push({
          'date': moment(param.date).format('YYYY-MM-DD'),
          'periods': _.isEmpty(param.period) ? [] : [param.period]
        });
      }

    } else if (param.tab === 'weekDays') {
      if (param.months && param.months.length > 0) {
        if (!run_time.months) {
          run_time.months = [];
        }
        if (run_time.months.length > 0) {
          let flag = false;
          run_time.months.forEach((value) => {
            if (isMonth) {
              if (value.weekdays && (_.isEqual(value.month, param.months) || _.isEqual(value.month.toString().split(' '), param.months))) {
                flag = true;
                var _period = [];
                if (_.isArray(value.weekdays.days)) {
                  value.weekdays.days.forEach((value1) => {
                    if (value1.day && (_.isEqual(value1.day, param.days) || _.isEqual(value1.day.toString().split(' '), param.days))) {
                      if (_.isArray(value1.periods)) {
                        value1.periods.forEach((res) => {
                          if (res)
                            _period.push(res);
                        });
                      } else {
                        if (value1.periods) {
                          _period.push(value1.periods);
                        }
                      }
                      _period.push(param.period);
                      value1.periods = _period;
                    }
                  });
                } else {
                  if (_.isEqual(value.weekdays.days.day, param.days) || _.isEqual(value.weekdays.days.day.toString().split(' '), param.days)) {

                    if (_.isArray(value.weekdays.days.periods)) {
                      value.weekdays.days.periods.forEach((res) => {
                        if (res)
                          _period.push(res);
                      });
                    } else {
                      if (value.weekdays.days.periods)
                        _period.push(value.weekdays.days.periods);
                    }
                    _period.push(param.period);
                    value.weekdays.days.periods = _period;
                  }
                }

                if (_period.length === 0) {
                  if (value.weekdays.days && !_.isEmpty(value.weekdays.days)) {
                    if (!_.isArray(value.weekdays, param.days)) {
                      let t = [];
                      t.push(_.clone(value.weekdays.days));
                      value.weekdays.days = t;
                    }
                  } else {
                    value.weekdays.days = [];
                  }

                  value.weekdays.days.push({
                    'day': param.days,
                    'periods': _.isEmpty(param.period) ? [] : [param.period]
                  });
                }
              }
            }
          });
          if (!flag) {
            if (isMonth) {
              for (let i = 0; i < run_time.months.length; i++) {
                if (run_time.months[i].month && _.isEqual(run_time.months[i].month, param.months) || _.isEqual(run_time.months[i].month.toString().split(' '), param.months)) {
                  run_time.months[i].weekdays = {days: []};
                  run_time.months[i].weekdays.days.push({
                    'day': param.days,
                    'periods': _.isEmpty(param.period) ? [] : [param.period]
                  });
                  break;
                }
              }

            } else {
              let x = {month: param.months, weekdays: {days: []}};
              x.weekdays.days.push({'day': param.days, 'periods': _.isEmpty(param.period) ? [] : [param.period]});
              run_time.months.push(x);
            }

          }
        } else {
          let x = {month: param.months, weekdays: {days: []}};
          x.weekdays.days.push({'day': param.days, 'periods': _.isEmpty(param.period) ? [] : [param.period]});
          run_time.months.push(x);
        }
      } else {
        if (!run_time.weekdays) {
          run_time.weekdays = {days: []};
        }
        if (run_time.weekdays.days.length > 0) {
          let _period = [];
          run_time.weekdays.days.forEach((value) => {
            if (value.day && (_.isEqual(value.day, param.days) || _.isEqual(value.day.toString().split(' '), param.days))) {
              if (_.isArray(value.periods)) {
                value.periods.forEach((res) => {
                  if (res)
                    _period.push(res);
                });
              } else {
                if (value.periods)
                  _period.push(value.periods);
              }
              _period.push(param.period);
              value.periods = _period;
            }
          });
          if (_period.length === 0) {
            if (!_.isArray(run_time.weekdays.days)) {
              run_time.weekdays.days = [];
            }
            run_time.weekdays.days.push({'day': param.days, 'periods': _.isEmpty(param.period) ? [] : [param.period]});
          }
        } else {
          run_time.weekdays.days.push({'day': param.days, 'periods': _.isEmpty(param.period) ? [] : [param.period]});
        }
      }

    } else if (param.tab === 'specificWeekDays') {
      if (param.months && param.months.length > 0) {
        if (!run_time.months) {
          run_time.months = [];
        }
        if (run_time.months.length > 0) {
          let flag = false;
          run_time.months.forEach((value) => {
            if (isMonth) {
              if (value.monthdays && value.monthdays.weekdays && (_.isEqual(value.month, param.months) || _.isEqual(value.month.toString().split(' '), param.months))) {
                flag = true;
                let _period = [];
                if (_.isArray(value.monthdays.weekdays)) {
                  value.monthdays.weekdays.forEach((value1) => {
                    if (value1.day && value1.day === param.specificWeekDay && value1.which === param.which) {
                      if (_.isArray(value1.periods)) {
                        value1.periods.forEach((res) => {
                          if (res)
                            _period.push(res);
                        });
                      } else {
                        if (value1.periods) {
                          _period.push(value1.periods);
                        }

                      }
                      _period.push(param.period);
                      value1.periods = _period;
                    }
                  });
                }

                if (_period.length === 0) {
                  if (!_.isArray(value.monthdays.weekdays)) {
                    if (value.monthdays.weekdays && !_.isEmpty(value.monthdays.weekdays)) {
                      if (!_.isArray(value.monthdays.weekdays)) {
                        let t = [];
                        t.push(_.clone(value.monthdays.weekdays));
                        value.monthdays.weekdays = t;
                      }
                    } else {
                      value.monthdays.weekdays = [];
                    }
                  }
                  value.monthdays.weekdays.push({
                    'day': param.specificWeekDay,
                    'which': param.which,
                    'periods': _.isEmpty(param.period) ? [] : [param.period]
                  });
                }
              }
            }
          });
          if (!flag) {
            if (isMonth) {
              for (let i = 0; i < run_time.months.length; i++) {
                if (run_time.months[i].month && _.isEqual(run_time.months[i].month, param.months) || _.isEqual(run_time.months[i].month.toString().split(' '), param.months)) {
                  if ((!run_time.months[i].monthdays)) {
                    run_time.months[i].monthdays = {weekdays: []};
                  } else {
                    run_time.months[i].monthdays.weekdays = [];
                  }

                  run_time.months[i].monthdays.weekdays.push({
                    'day': param.specificWeekDay,
                    'which': param.which,
                    'periods': _.isEmpty(param.period) ? [] : [param.period]
                  });
                  break;
                }
              }

            } else {
              let x;
              if (!run_time.months.monthdays)
                x = {month: param.months, monthdays: {weekdays: []}};
              else {
                x = {month: param.months};
                x.monthdays.weekdays = [];
              }

              x.monthdays.weekdays.push({
                'day': param.specificWeekDay,
                'which': param.which,
                'periods': _.isEmpty(param.period) ? [] : [param.period]
              });
              run_time.months.push(x);
            }
          }
        } else {
          let x;
          if (!run_time.months.monthdays)
            x = {month: param.months, monthdays: {weekdays: []}};
          else {
            x = {month: param.months};
            x.monthdays.weekdays = [];
          }
          x.monthdays.weekdays.push({
            'day': param.specificWeekDay,
            'which': param.which,
            'periods': _.isEmpty(param.period) ? [] : [param.period]
          });
          run_time.months.push(x);
        }
      } else {
        if (!run_time.monthdays) {
          run_time.monthdays = {weekdays: []};
        }
        if (run_time.monthdays.weekdays && run_time.monthdays.weekdays.length > 0) {
          let flag = true;
          run_time.monthdays.weekdays.forEach((value) => {
            if (value && value.day === param.specificWeekDay && value.which === param.which) {
              flag = false;
              if (_.isArray(value.periods) && param.period) {
                value.periods.push(param.period);
              } else {
                value.periods = [];
                value.periods.push(param.period);
              }
            }
          });
          if (flag) {
            let _period = [];
            if (param.period) {
              _period.push(param.period);
            }
            run_time.monthdays.weekdays.push({
              'day': param.specificWeekDay,
              'which': param.which,
              'periods': _period
            });
          }

        } else {
          if (!_.isArray(run_time.monthdays.weekdays)) {
            run_time.monthdays.weekdays = [];
          }
          let _period = [];
          if (param.period) {
            _period.push(param.period);
          }
          run_time.monthdays.weekdays.push({
            'day': param.specificWeekDay,
            'which': param.which,
            'periods': _period
          });
        }
      }
    } else if (param.tab === 'monthDays') {

      if (param.selectedMonths && _.isArray(param.selectedMonths)) {
        selectedMonths = _.clone(param.selectedMonths);
      }
      if (param.selectedMonthsU && _.isArray(param.selectedMonthsU)) {
        selectedMonthsU = _.clone(param.selectedMonthsU);
      }
      if (selectedMonths.length > 0 || selectedMonthsU.length > 0) {
        if (param.isUltimos !== 'ultimos') {
          if (param.months && param.months.length > 0) {
            if (!run_time.months) {
              run_time.months = [];
            }
            if (run_time.months.length > 0) {
              var flag = false;
              run_time.months.forEach((value) => {
                if (isMonth) {
                  if (value.monthdays && value.monthdays.days && (_.isEqual(value.month, param.months) || _.isEqual(value.month.toString().split(' '), param.months))) {
                    flag = true;
                    let _period = [];
                    if (_.isArray(value.monthdays.days)) {
                      value.monthdays.days.forEach((value1) => {
                        if (value1.day && (_.isEqual(value1.day, selectedMonths) || _.isEqual(value1.day.toString().split(' '), selectedMonths))) {
                          if (_.isArray(value1.periods)) {
                            value1.periods.forEach((res) => {
                              if (res)
                                _period.push(res);
                            });
                          } else {
                            if (value1.periods) {
                              _period.push(value1.periods);
                            }

                          }
                          _period.push(param.period);

                          value1.periods = _period;
                        }
                      });
                    }

                    if (_period.length === 0) {
                      if (value.monthdays.days && !_.isEmpty(value.monthdays.days)) {
                        if (!_.isArray(value.monthdays.days)) {
                          var t = [];
                          t.push(_.clone(value.monthdays.days));
                          value.monthdays.days = t;
                        }
                      } else {
                        value.monthdays.days = [];
                      }

                      value.monthdays.days.push({
                        'day': _.clone(selectedMonths),
                        'periods': _.isEmpty(param.period) ? [] : [param.period]
                      });
                    }
                  }

                }
              });
              if (!flag) {
                if (isMonth) {
                  for (let i = 0; i < run_time.months.length; i++) {
                    if (run_time.months[i].month && _.isEqual(run_time.months[i].month, param.months) || _.isEqual(run_time.months[i].month.toString().split(' '), param.months)) {
                      if ((!run_time.months[i].monthdays)) {
                        run_time.months[i].monthdays = {days: []};
                      } else {
                        run_time.months[i].monthdays.days = [];
                      }
                      run_time.months[i].monthdays.days.push({
                        'day': _.clone(selectedMonths),
                        'periods': _.isEmpty(param.period) ? [] : [param.period]
                      });
                      break;
                    }
                  }

                } else {
                  let x;
                  if (!run_time.months.monthdays)
                    x = {month: param.months, monthdays: {days: []}};
                  else {
                    x = {month: param.months};
                    x.monthdays.days = [];
                  }
                  x.monthdays.days.push({
                    'day': _.clone(selectedMonths),
                    'periods': _.isEmpty(param.period) ? [] : [param.period]
                  });
                  run_time.months.push(x);
                }

              }
            } else {
              let x;
              if (!run_time.months.monthdays)
                x = {month: param.months, monthdays: {days: []}};
              else {
                x = {month: param.months};
                x.monthdays.days = [];
              }
              x.monthdays.days.push({
                'day': _.clone(selectedMonths),
                'periods': _.isEmpty(param.period) ? [] : [param.period]
              });
              run_time.months.push(x);

            }
          } else {
            if (!run_time.monthdays) {
              run_time.monthdays = {days: []};
            }
            if (run_time.monthdays.days.length > 0) {
              let _period = [];
              run_time.monthdays.days.forEach((value) => {
                if (value.day && (_.isEqual(value.day, selectedMonths) || _.isEqual(value.day.toString().split(' '), selectedMonths))) {
                  if (_.isArray(value.periods)) {
                    value.periods.forEach((res) => {
                      if (res)
                        _period.push(res);
                    });
                  } else {
                    if (value.periods) {
                      _period.push(value.periods);
                    }

                  }
                  _period.push(param.period);

                  value.periods = _period;
                }
              });

              if (_period.length === 0) {
                if (!_.isArray(run_time.monthdays.days)) {
                  run_time.monthdays.days = [];
                }
                run_time.monthdays.days.push({
                  'day': _.clone(selectedMonths),
                  'periods': _.isEmpty(param.period) ? [] : [param.period]
                });
              }

            } else {
              run_time.monthdays.days.push({
                'day': _.clone(selectedMonths),
                'periods': _.isEmpty(param.period) ? [] : [param.period]
              });
            }
          }
        } else {
          if (param.months && param.months.length > 0) {
            if (!run_time.months) {
              run_time.months = [];
            }
            if (run_time.months.length > 0) {
              let flag = false;
              run_time.months.forEach((value) => {
                if (isMonth) {
                  if (value.ultimos && (_.isEqual(value.month, param.months) || _.isEqual(value.month.toString().split(' '), param.months))) {
                    flag = true;
                    let _period = [];
                    if (_.isArray(value.ultimos.days)) {
                      value.ultimos.days.forEach((value1) => {
                        if (value1.day && (_.isEqual(value1.day, selectedMonthsU) || _.isEqual(value1.day.toString().split(' '), selectedMonthsU))) {
                          if (_.isArray(value1.periods)) {
                            value1.periods.forEach((res) => {
                              if (res)
                                _period.push(res);

                            });
                          } else {
                            if (value1.periods) {
                              _period.push(value1.periods);
                            }
                          }
                          _period.push(param.period);
                          value1.periods = _period;
                        }
                      });
                    }
                    if (_period.length === 0) {
                      if (value.ultimos.days && !_.isEmpty(value.ultimos.days)) {
                        if (!_.isArray(value.ultimos.days)) {
                          var t = [];
                          t.push(_.clone(value.ultimos.days));
                          value.ultimos.days = t;
                        }
                      } else {
                        value.ultimos.days = [];
                      }

                      value.ultimos.days.push({
                        'day': _.clone(selectedMonthsU),
                        'periods': _.isEmpty(param.period) ? [] : [param.period]
                      });
                    }
                  }
                }
              });
              if (!flag) {
                if (isMonth) {
                  for (let i = 0; i < run_time.months.length; i++) {
                    if (run_time.months[i].month && _.isEqual(run_time.months[i].month, param.months) || _.isEqual(run_time.months[i].month.toString().split(' '), param.months)) {
                      run_time.months[i].ultimos = {days: []};
                      run_time.months[i].ultimos.days.push({
                        'day': _.clone(selectedMonthsU),
                        'periods': _.isEmpty(param.period) ? [] : [param.period]
                      });
                      break;
                    }
                  }

                } else {
                  let x = {month: param.months, ultimos: {days: []}};
                  x.ultimos.days.push({
                    'day': _.clone(selectedMonthsU),
                    'periods': _.isEmpty(param.period) ? [] : [param.period]
                  });
                  run_time.months.push(x);
                }
              }
            } else {
              let x = {month: param.months, ultimos: {days: []}};
              x.ultimos.days.push({
                'day': _.clone(selectedMonthsU),
                'periods': _.isEmpty(param.period) ? [] : [param.period]
              });
              run_time.months.push(x);

            }
          } else {
            if (!run_time.ultimos) {
              run_time.ultimos = {days: []};
            }
            if (run_time.ultimos.days.length > 0) {
              let _period = [];
              run_time.ultimos.days.forEach((value) => {
                if (value.day && (_.isEqual(value.day, selectedMonthsU) || _.isEqual(value.day.toString().split(' '), selectedMonthsU))) {
                  if (_.isArray(value.periods)) {
                    value.periods.forEach((res) => {
                      if (res)
                        _period.push(res);
                    });
                  } else {
                    if (value.periods) {
                      _period.push(value.periods);
                    }
                  }
                  _period.push(param.period);
                  value.periods = _period;
                }
              });
              if (_period.length === 0) {
                if (!_.isArray(run_time.ultimos.days)) {
                  run_time.ultimos.days = [];
                }
                run_time.ultimos.days.push({
                  'day': _.clone(selectedMonthsU),
                  'periods': _.isEmpty(param.period) ? [] : [param.period]
                });
              }
            } else {
              run_time.ultimos.days.push({
                'day': _.clone(selectedMonthsU),
                'periods': _.isEmpty(param.period) ? [] : [param.period]
              });
            }
          }
        }
      }
    }

    if (selectedMonths.length > 0) {
      param.selectedMonths = _.clone(selectedMonths);
    }
    if (selectedMonthsU.length > 0) {
      param.selectedMonthsU = _.clone(selectedMonthsU);
    }

    return run_time;
  }

  compareNumbers(a, b) {
    return a - b;
  }

}
