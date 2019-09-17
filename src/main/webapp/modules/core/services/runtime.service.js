/**
 * Created by sourabhagrawal on 13/09/19.
 */

(function () {
    'use strict';
    angular.module('app')
        .service('RuntimeService', RuntimeService);

    RuntimeService.$inject = ['$window', '$q', 'gettextCatalog'];
    function RuntimeService($window,  $q, gettextCatalog) {

        return {
            whenHolidayOptions: function () {
                return {
                    'previous_non_holiday': gettextCatalog.getString('previous non holiday'),
                    'next_non_holiday': gettextCatalog.getString('next non holiday'),
                    'suppress': gettextCatalog.getString('suppress execution (default)'),
                    'ignore_holiday': gettextCatalog.getString('ignore holiday')
                };
            },  generatePeriodObj: function (list) {
                let periods = [];
                angular.forEach(list, function (value) {
                    if (value._period) {
                        var obj = {};
                        if (value._period._single_start) {
                            obj.singleStart = value._period._single_start;
                        } else if (value._period._absolute_repeat) {
                            obj.absoluteRepeat = value._period._absolute_repeat;
                        } else if (value._period._repeat) {
                            obj.repeat = value._period._repeat;
                        }
                        if (value._period._begin) {
                            obj.begin = value._period._begin;
                        }
                        if (value._period._end) {
                            obj.end = value._period._end;
                        }
                        obj.whenHoliday = value._period._when_holiday || 'suppress';
                        periods.push(obj);
                    }
                });
                return periods
            }, getDay: function (day) {
                return day === "sunday" ? 0 : day === "monday" ? 1 : day === "tuesday" ? 2 : day === "wednesday" ? 3 : day === "thursday" ? 4 : day === "friday" ? 5 : 6;
            }, generateCalendarObj: function (data, obj) {
                var arr = [];
                var from, to;

                if (data.tab == 'weekDays') {
                    if (!obj.includes.weekdays)
                        obj.includes.weekdays = [];

                    if (data.startingWithW) {
                        from = moment(data.startingWithW).format('YYYY-MM-DD')
                    }
                    if (data.endOnW) {
                        to = moment(data.endOnW).format('YYYY-MM-DD')
                    }
                    obj.includes.weekdays.push({days: data.days, from: from, to: to});
                } else if (data.tab == 'monthDays') {
                    if (data.isUltimos == 'months') {
                        if (!obj.includes.monthdays)
                            obj.includes.monthdays = [];

                        if (data.startingWithM) {
                            from = moment(data.startingWithM).format('YYYY-MM-DD')
                        }
                        if (data.endOnM) {
                            to = moment(data.endOnM).format('YYYY-MM-DD')
                        }
                        obj.includes.monthdays.push({days: data.selectedMonths, from: from, to: to});
                    } else {
                        if (!obj.includes.ultimos)
                            obj.includes.ultimos = [];

                        if (data.startingWithM) {
                            from = moment(data.startingWithM).format('YYYY-MM-DD')
                        }
                        if (data.endOnM) {
                            to = moment(data.endOnM).format('YYYY-MM-DD')
                        }
                        obj.includes.ultimos.push({days: data.selectedMonthsU, from: from, to: to});
                    }
                } else if (data.tab == 'specificWeekDays') {
                    arr.push({
                        day: this.getDay(data.specificWeekDay),
                        weekOfMonth: Math.abs(data.which)
                    });

                    if (data.startingWithS) {
                        from = moment(data.startingWithS).format('YYYY-MM-DD')
                    }
                    if (data.endOnS) {
                        to = moment(data.endOnS).format('YYYY-MM-DD')
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
                    angular.forEach(data.dates, function (value) {
                        obj.includes.dates.push(moment(value).format('YYYY-MM-DD'))
                    });

                } else if (data.tab == 'every') {
                    if (!obj.includes.repetitions)
                        obj.includes.repetitions = [];
                    var obj1 = {};
                    obj1.repetition = data.dateEntity;
                    obj1.step = data.interval || 1;
                    if (data.startingWith)
                        obj1.from = moment(data.startingWith).format('YYYY-MM-DD');
                    if (data.endOn) {
                        obj1.to = moment(data.endOn).format('YYYY-MM-DD')
                    }
                    obj.includes.repetitions.push(obj1);

                }

                return obj;
            }, checkPeriod: function (value, period) {
                if (!value || !period) {
                    return;
                }
                var flg = false;
                if (value._when_holiday == period._when_holiday) {
                    flg = true;
                } else if (!value._when_holiday && period._when_holiday == 'suppress') {
                    flg = true;
                }
                if (!period._when_holiday && value._when_holiday == 'suppress') {
                    flg = true;
                }
                if (period._single_start && flg && value._single_start) {
                    return value._single_start == period._single_start;
                }
                if (period._repeat && flg && value._repeat) {
                    return value._repeat == period._repeat;
                }
                if (period._begin && flg && value._begin) {
                    return value._begin == period._begin;
                }
                if (period._end && flg && value._end) {
                    return value._end == period._end;
                }
                if (period._absolute_repeat && flg && value._absolute_repeat) {
                    return value._absolute_repeat == period._absolute_repeat;
                }
            }, getWeekDays: function (day) {
                if (!day) {
                    return;
                }
                var days = day;
                if (!angular.isArray(day)) {
                    days = day.toString().split(' ');
                }
                if (days.length == 7) {
                    return 'Every day';
                }
                var str = '';
                angular.forEach(days.sort(), function (value) {
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
            },

            getMonths: function (month) {
                var str = '';
                if (!month)
                    return;
                var months = month;
                if (!angular.isArray(month)) {
                    months = month.toString().split(' ');
                }
                if (months.length == 12) {
                    return 'every month';
                }
                angular.forEach(months.sort(this.compareNumbers), function (value) {
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
            },
            getSpecificDay: function (day) {
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
            },
            getMonthDays: function (month, isUltimos) {
                var str = '';
                if (!month) {
                    return month;
                }
                var months = month;
                if (!angular.isArray(month)) {
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
            },
            getTimeInString: function (time) {
                if (time.toString().substring(0, 2) == '00' && time.toString().substring(3, 5) == '00') {
                    return time.toString().substring(6, time.length) + ' seconds'
                } else if (time.toString().substring(0, 2) == '00') {
                    return time.toString().substring(3, time.length) + ' minutes'
                } else if ((time.toString().substring(0, 2) != '00' && time.length == 5) || (time.length > 5 && time.toString().substring(0, 2) != '00' && (time.toString().substring(6, time.length) == '00'))) {
                    return time.toString().substring(0, 5) + ' hours'
                } else {
                    return time;
                }
            },
            compareNumbers: function (a, b) {
                return a - b;
            }, checkPeriodList: function (run_time, param, selectedMonths, selectedMonthsU) {
                var isMonth = false;
                for (let i = 0; i < run_time.month.length; i++) {
                    if (run_time.month[i]._month && angular.equals(run_time.month[i]._month, param.months) || angular.equals(run_time.month[i]._month.toString().split(' '), param.months)) {
                        isMonth = true;
                        break;
                    }
                }
                if (param.tab == 'specificDays') {
                    if (run_time.date.length > 0) {
                        var _period = [];
                        angular.forEach(run_time.date, function (value) {
                            if (value._date && param.date && (angular.equals(value._date, moment(param.date).format('YYYY-MM-DD')))) {
                                if (angular.isArray(value.period)) {
                                    angular.forEach(value.period, function (res) {
                                        if (res)
                                            _period.push(res);
                                    })
                                } else {
                                    if (value.period) {
                                        _period.push(value.period);
                                    }

                                }

                                _period.push(param.period);

                                value.period = _period;
                            }
                        });
                        if (_period.length == 0) {
                            if (!angular.isArray(run_time.date)) {
                                run_time.date = [];
                            }
                            run_time.date.push({
                                '_date': moment(param.date).format('YYYY-MM-DD'),
                                'period': param.period
                            });
                        }
                    } else {
                        run_time.date.push({
                            '_date': moment(param.date).format('YYYY-MM-DD'),
                            'period': param.period
                        });
                    }
                } else if (param.tab == 'weekDays') {
                    if (param.months && param.months.length > 0) {

                        if (run_time.month.length > 0) {

                            let flag = false;
                            angular.forEach(run_time.month, function (value) {
                                if (isMonth) {
                                    if (value.weekdays && (angular.equals(value._month, param.months) || angular.equals(value._month.toString().split(' '), param.months))) {
                                        flag = true;
                                        var _period = [];
                                        if (angular.isArray(value.weekdays.day)) {
                                            angular.forEach(value.weekdays.day, function (value1) {
                                                if (value1._day && (angular.equals(value1._day, param.days) || angular.equals(value1._day.toString().split(' '), param.days))) {
                                                    if (angular.isArray(value1.period)) {
                                                        angular.forEach(value1.period, function (res) {
                                                            if (res)
                                                                _period.push(res);
                                                        })
                                                    } else {
                                                        if (value1.period) {
                                                            _period.push(value1.period);
                                                        }
                                                    }
                                                    _period.push(param.period);
                                                    value1.period = _period;
                                                }
                                            });
                                        } else {
                                            if (angular.equals(value.weekdays.day._day, param.days) || angular.equals(value.weekdays.day._day.toString().split(' '), param.days)) {

                                                if (angular.isArray(value.weekdays.day.period)) {
                                                    angular.forEach(value.weekdays.day.period, function (res) {
                                                        if (res)
                                                            _period.push(res);
                                                    })
                                                } else {
                                                    if (value.weekdays.day.period)
                                                        _period.push(value.weekdays.day.period);
                                                }
                                                _period.push(param.period);
                                                value.weekdays.day.period = _period;
                                            }
                                        }

                                        if (_period.length == 0) {
                                            if (value.weekdays.day && !_.isEmpty(value.weekdays.day)) {
                                                if (!angular.isArray(value.weekdays, day)) {
                                                    let t = [];
                                                    t.push(angular.copy(value.weekdays.day));
                                                    value.weekdays.day = t;
                                                }
                                            } else {
                                                value.weekdays.day = [];
                                            }

                                            value.weekdays.day.push({
                                                '_day': param.days,
                                                'period': param.period
                                            });
                                        }
                                    }
                                }
                            });
                            if (!flag) {
                                if (isMonth) {
                                    for (let i = 0; i < run_time.month.length; i++) {
                                        if (run_time.month[i]._month && angular.equals(run_time.month[i]._month, param.months) || angular.equals(run_time.month[i]._month.toString().split(' '), param.months)) {
                                            run_time.month[i].weekdays = {day: []};
                                            run_time.month[i].weekdays.day.push({
                                                '_day': param.days,
                                                'period': param.period
                                            });
                                            break;
                                        }
                                    }

                                } else {
                                    let x = {_month: param.months, weekdays: {day: []}};
                                    x.weekdays.day.push({'_day': param.days, 'period': param.period});
                                    run_time.month.push(x);
                                }

                            }
                        } else {
                            let x = {_month: param.months, weekdays: {day: []}};
                            x.weekdays.day.push({'_day': param.days, 'period': param.period});
                            run_time.month.push(x);
                        }
                    } else {
                        if (run_time.weekdays.day.length > 0) {
                            let _period = [];
                            angular.forEach(run_time.weekdays.day, function (value) {
                                if (value._day && (angular.equals(value._day, param.days) || angular.equals(value._day.toString().split(' '), param.days))) {

                                    if (angular.isArray(value.period)) {
                                        angular.forEach(value.period, function (res) {
                                            if (res)
                                                _period.push(res);
                                        })
                                    } else {
                                        if (value.period)
                                            _period.push(value.period);
                                    }
                                    _period.push(param.period);
                                    value.period = _period;
                                }
                            });
                            if (_period.length == 0) {
                                if (!angular.isArray(run_time.weekdays.day)) {
                                    run_time.weekdays.day = [];
                                }
                                run_time.weekdays.day.push({'_day': param.days, 'period': param.period});
                            }
                        } else {
                            run_time.weekdays.day.push({'_day': param.days, 'period': param.period});
                        }
                    }

                } else if (param.tab == 'specificWeekDays') {
                    if (param.months && param.months.length > 0) {

                        if (run_time.month.length > 0) {

                            let flag = false;
                            angular.forEach(run_time.month, function (value) {

                                if (isMonth) {
                                    if (value.monthdays && value.monthdays.weekday && (angular.equals(value._month, param.months) || angular.equals(value._month.toString().split(' '), param.months))) {

                                        flag = true;
                                        var _period = [];
                                        if (angular.isArray(value.monthdays.weekday)) {
                                            angular.forEach(value.monthdays.weekday, function (value1) {

                                                if (value1._day && value1._day == param.specificWeekDay && value1._which == param.which) {
                                                    if (angular.isArray(value1.period)) {
                                                        angular.forEach(value1.period, function (res) {
                                                            if (res)
                                                                _period.push(res);
                                                        })
                                                    } else {
                                                        if (value1.period) {
                                                            _period.push(value1.period);
                                                        }

                                                    }
                                                    _period.push(param.period);
                                                    value1.period = _period;
                                                }
                                            });
                                        } else {
                                            if (angular.equals(value.monthdays.weekday._day, param.specificWeekDay) && angular.equals(value.monthdays.weekday._which, param.which)) {

                                                if (angular.isArray(value.monthdays.weekday.period)) {
                                                    angular.forEach(value.monthdays.weekday.period, function (res) {
                                                        if (res)
                                                            _period.push(res);
                                                    })
                                                } else {
                                                    if (value.monthdays.weekday.period)
                                                        _period.push(value.monthdays.weekday.period);

                                                }
                                                _period.push(param.period);
                                                value.monthdays.weekday.period = _period;
                                            }
                                        }

                                        if (_period.length == 0) {
                                            if (!angular.isArray(value.monthdays.weekday)) {
                                                if (value.monthdays.weekday && !_.isEmpty(value.monthdays.weekday)) {
                                                    if (!angular.isArray(value.monthdays.weekday)) {
                                                        var t = [];
                                                        t.push(angular.copy(value.monthdays.weekday));
                                                        value.monthdays.weekday = t;
                                                    }
                                                } else {
                                                    value.monthdays.weekday = [];
                                                }
                                            }
                                            value.monthdays.weekday.push({
                                                '_day': param.specificWeekDay,
                                                '_which': param.which,
                                                'period': param.period
                                            });
                                        }
                                    }
                                }
                            });
                            if (!flag) {

                                if (isMonth) {
                                    for (let i = 0; i < run_time.month.length; i++) {
                                        if (run_time.month[i]._month && angular.equals(run_time.month[i]._month, param.months) || angular.equals(run_time.month[i]._month.toString().split(' '), param.months)) {
                                            if ((!run_time.month[i].monthdays)) {
                                                run_time.month[i].monthdays = {weekday: []};
                                            } else {
                                                run_time.month[i].monthdays.weekday = [];
                                            }

                                            run_time.month[i].monthdays.weekday.push({
                                                '_day': param.specificWeekDay,
                                                '_which': param.which,
                                                'period': param.period
                                            });
                                            break;
                                        }
                                    }

                                } else {
                                    let x;
                                    if (!run_time.month.monthdays)
                                        x = {_month: param.months, monthdays: {weekday: []}};
                                    else {
                                        x = {_month: param.months};
                                        x.monthdays.weekday = [];
                                    }

                                    x.monthdays.weekday.push({
                                        '_day': param.specificWeekDay,
                                        '_which': param.which, 'period': param.period
                                    });
                                    run_time.month.push(x);
                                }

                            }
                        } else {
                            let x;
                            if (!run_time.month.monthdays)
                                x = {_month: param.months, monthdays: {weekday: []}};
                            else {
                                x = {_month: param.months};
                                x.monthdays.weekday = [];
                            }
                            x.monthdays.weekday.push({
                                '_day': param.specificWeekDay,
                                '_which': param.which,
                                'period': param.period
                            });
                            run_time.month.push(x);
                        }
                    } else {
                        if (run_time.monthdays.weekday && run_time.monthdays.weekday.length > 0) {
                            let flag = true;
                            angular.forEach(run_time.monthdays.weekday, function (value) {
                                if (value && value._day == param.specificWeekDay && value._which == param.which) {
                                    flag = false;
                                    if (angular.isArray(value.period) && param.period) {
                                        value.period.push(param.period);
                                    } else {
                                        value.period = [];
                                        value.period.push(param.period);
                                    }
                                }
                            });

                            if (flag) {
                                let _period = [];
                                if (param.period) {
                                    _period.push(param.period);
                                }
                                run_time.monthdays.weekday.push({
                                    '_day': param.specificWeekDay,
                                    '_which': param.which,
                                    'period': _period
                                });
                            }

                        } else {
                            if (!angular.isArray(run_time.monthdays.weekday)) {
                                run_time.monthdays.weekday = [];
                            }
                            let _period = [];
                            if (param.period) {
                                _period.push(param.period);
                            }
                            run_time.monthdays.weekday.push({
                                '_day': param.specificWeekDay,
                                '_which': param.which,
                                'period': _period
                            });
                        }
                    }
                } else if (param.tab == 'monthDays') {

                    if (param.selectedMonths && angular.isArray(param.selectedMonths)) {
                        selectedMonths = angular.copy(param.selectedMonths);
                    }
                    if (param.selectedMonthsU && angular.isArray(param.selectedMonthsU)) {
                        selectedMonthsU = angular.copy(param.selectedMonthsU);
                    }
                    if (selectedMonths.length > 0 || selectedMonthsU.length > 0) {
                        if (param.isUltimos == 'months') {
                            if (param.months && param.months.length > 0) {
                                if (run_time.month.length > 0) {

                                    var flag = false;
                                    angular.forEach(run_time.month, function (value) {
                                        if (isMonth) {
                                            if (value.monthdays && value.monthdays.day && (angular.equals(value._month, param.months) || angular.equals(value._month.toString().split(' '), param.months))) {

                                                flag = true;
                                                var _period = [];

                                                if (angular.isArray(value.monthdays.day)) {
                                                    angular.forEach(value.monthdays.day, function (value1) {
                                                        if (value1._day && (angular.equals(value1._day, selectedMonths) || angular.equals(value1._day.toString().split(' '), selectedMonths))) {
                                                            if (angular.isArray(value1.period)) {
                                                                angular.forEach(value1.period, function (res) {
                                                                    if (res)
                                                                        _period.push(res);
                                                                })
                                                            } else {
                                                                if (value1.period) {
                                                                    _period.push(value1.period);
                                                                }

                                                            }
                                                            _period.push(param.period);

                                                            value1.period = _period;
                                                        }
                                                    });
                                                } else {
                                                    if (angular.equals(value.monthdays.day._day, selectedMonths) || angular.equals(value.monthdays.day._day.toString().split(' '), selectedMonths)) {

                                                        if (angular.isArray(value.monthdays.day.period)) {
                                                            angular.forEach(value.monthdays.day.period, function (res) {
                                                                if (res)
                                                                    _period.push(res);
                                                            })
                                                        } else {
                                                            if (value.monthdays.day.period)
                                                                _period.push(value.monthdays.day.period);

                                                        }


                                                        _period.push(param.period);
                                                        value.monthdays.day.period = _period;
                                                    }

                                                }

                                                if (_period.length == 0) {
                                                    if (value.monthdays.day && !_.isEmpty(value.monthdays.day)) {
                                                        if (!angular.isArray(value.monthdays.day)) {
                                                            var t = [];
                                                            t.push(angular.copy(value.monthdays.day));
                                                            value.monthdays.day = t;
                                                        }
                                                    } else {
                                                        value.monthdays.day = [];
                                                    }

                                                    value.monthdays.day.push({
                                                        '_day': angular.copy(selectedMonths),
                                                        'period': param.period
                                                    });
                                                }
                                            }

                                        }
                                    });
                                    if (!flag) {
                                        if (isMonth) {
                                            for (let i = 0; i < run_time.month.length; i++) {

                                                if (run_time.month[i]._month && angular.equals(run_time.month[i]._month, param.months) || angular.equals(run_time.month[i]._month.toString().split(' '), param.months)) {
                                                    if ((!run_time.month[i].monthdays)) {
                                                        run_time.month[i].monthdays = {day: []};
                                                    } else {
                                                        run_time.month[i].monthdays.day = [];
                                                    }
                                                    run_time.month[i].monthdays.day.push({
                                                        '_day': angular.copy(selectedMonths),
                                                        'period': param.period
                                                    });
                                                    break;
                                                }
                                            }

                                        } else {
                                            var x;
                                            if (!run_time.month.monthdays)
                                                x = {_month: param.months, monthdays: {day: []}};
                                            else {
                                                x = {_month: param.months};
                                                x.monthdays.day = [];
                                            }
                                            x.monthdays.day.push({
                                                '_day': angular.copy(selectedMonths),
                                                'period': param.period
                                            });
                                            run_time.month.push(x);
                                        }

                                    }
                                } else {
                                    let x;
                                    if (!run_time.month.monthdays)
                                        x = {_month: param.months, monthdays: {day: []}};
                                    else {
                                        x = {_month: param.months};
                                        x.monthdays.day = [];
                                    }
                                    x.monthdays.day.push({
                                        '_day': angular.copy(selectedMonths),
                                        'period': param.period
                                    });
                                    run_time.month.push(x);

                                }
                            } else {

                                if (run_time.monthdays.day.length > 0) {
                                    let _period = [];
                                    angular.forEach(run_time.monthdays.day, function (value) {
                                        if (value._day && (angular.equals(value._day, selectedMonths) || angular.equals(value._day.toString().split(' '), selectedMonths))) {
                                            if (angular.isArray(value.period)) {
                                                angular.forEach(value.period, function (res) {
                                                    if (res)
                                                        _period.push(res);
                                                })
                                            } else {
                                                if (value.period) {
                                                    _period.push(value.period);
                                                }

                                            }
                                            _period.push(param.period);

                                            value.period = _period;
                                        }
                                    });

                                    if (_period.length == 0) {
                                        if (!angular.isArray(run_time.monthdays.day)) {
                                            run_time.monthdays.day = [];
                                        }
                                        run_time.monthdays.day.push({
                                            '_day': angular.copy(selectedMonths),
                                            'period': param.period
                                        });
                                    }

                                } else {
                                    run_time.monthdays.day.push({
                                        '_day': angular.copy(selectedMonths),
                                        'period': param.period
                                    });
                                }
                            }
                        } else {
                            if (param.months && param.months.length > 0) {

                                if (run_time.month.length > 0) {

                                    let flag = false;
                                    angular.forEach(run_time.month, function (value) {

                                        if (isMonth) {
                                            if (value.ultimos && (angular.equals(value._month, param.months) || angular.equals(value._month.toString().split(' '), param.months))) {
                                                flag = true;
                                                var _period = [];

                                                if (angular.isArray(value.ultimos.day)) {
                                                    angular.forEach(value.ultimos.day, function (value1) {
                                                        if (value1._day && (angular.equals(value1._day, selectedMonthsU) || angular.equals(value1._day.toString().split(' '), selectedMonthsU))) {

                                                            if (angular.isArray(value1.period)) {
                                                                angular.forEach(value1.period, function (res) {
                                                                    if (res)
                                                                        _period.push(res);

                                                                })
                                                            } else {
                                                                if (value1.period) {
                                                                    _period.push(value1.period);

                                                                }

                                                            }

                                                            _period.push(param.period);

                                                            value1.period = _period;
                                                        }
                                                    });
                                                } else {
                                                    if (angular.equals(value.ultimos.day._day, selectedMonthsU) || angular.equals(value.ultimos.day._day.toString().split(' '), selectedMonthsU)) {


                                                        if (angular.isArray(value.ultimos.day.period)) {
                                                            angular.forEach(value.ultimos.day.period, function (res) {
                                                                if (res)
                                                                    _period.push(res);
                                                            })
                                                        } else {
                                                            if (value.ultimos.day.period)
                                                                _period.push(value.ultimos.day.period);
                                                        }


                                                        _period.push(param.period);
                                                        value.ultimos.day.period = _period;
                                                    }
                                                }

                                                if (_period.length == 0) {
                                                    if (value.ultimos.day && !_.isEmpty(value.ultimos.day)) {
                                                        if (!angular.isArray(value.ultimos.day)) {
                                                            var t = [];
                                                            t.push(angular.copy(value.ultimos.day));
                                                            value.ultimos.day = t;
                                                        }
                                                    } else {
                                                        value.ultimos.day = [];
                                                    }

                                                    value.ultimos.day.push({
                                                        '_day': angular.copy(selectedMonthsU),
                                                        'period': param.period
                                                    });
                                                }
                                            }
                                        }
                                    });
                                    if (!flag) {
                                        if (isMonth) {
                                            for (let i = 0; i < run_time.month.length; i++) {

                                                if (run_time.month[i]._month && angular.equals(run_time.month[i]._month, param.months) || angular.equals(run_time.month[i]._month.toString().split(' '), param.months)) {
                                                    run_time.month[i].ultimos = {day: []};
                                                    run_time.month[i].ultimos.day.push({
                                                        '_day': angular.copy(selectedMonthsU),
                                                        'period': param.period
                                                    });
                                                    break;
                                                }
                                            }

                                        } else {
                                            let x = {_month: param.months, ultimos: {day: []}};
                                            x.ultimos.day.push({
                                                '_day': angular.copy(selectedMonthsU),
                                                'period': param.period
                                            });
                                            run_time.month.push(x);
                                        }
                                    }
                                } else {
                                    let x = {_month: param.months, ultimos: {day: []}};
                                    x.ultimos.day.push({'_day': angular.copy(selectedMonthsU), 'period': param.period});
                                    run_time.month.push(x);

                                }
                            } else {
                                if (run_time.ultimos.day.length > 0) {
                                    let _period = [];
                                    angular.forEach(run_time.ultimos.day, function (value) {
                                        if (value._day && (angular.equals(value._day, selectedMonthsU) || angular.equals(value._day.toString().split(' '), selectedMonthsU))) {

                                            if (angular.isArray(value.period)) {
                                                angular.forEach(value.period, function (res) {
                                                    if (res)
                                                        _period.push(res);

                                                })
                                            } else {
                                                if (value.period) {
                                                    _period.push(value.period);

                                                }

                                            }

                                            _period.push(param.period);

                                            value.period = _period;
                                        }
                                    });

                                    if (_period.length == 0) {
                                        if (!angular.isArray(run_time.ultimos.day)) {
                                            run_time.ultimos.day = [];
                                        }
                                        run_time.ultimos.day.push({
                                            '_day': angular.copy(selectedMonthsU),
                                            'period': param.period
                                        });
                                    }

                                } else {
                                    run_time.ultimos.day.push({
                                        '_day': angular.copy(selectedMonthsU),
                                        'period': param.period
                                    });
                                }
                            }
                        }
                    }
                }

                if (selectedMonths.length > 0) {
                    param.selectedMonths = angular.copy(selectedMonths);
                }
                if (selectedMonthsU.length > 0) {
                    param.selectedMonthsU = angular.copy(selectedMonthsU);
                }

                return  run_time;
            }

        }
    }
})();
