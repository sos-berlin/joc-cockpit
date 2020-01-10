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
            }, getDay: function (day) {
                return day === "sunday" ? 0 : day === "monday" ? 1 : day === "tuesday" ? 2 : day === "wednesday" ? 3 : day === "thursday" ? 4 : day === "friday" ? 5 : 6;
            }, generateCalendarObj: function (data, obj) {
                var arr = [];
                var from, to;
                if (data.tab === 'weekDays') {
                    if (!obj.includes.weekdays) {
                        obj.includes.weekdays = [];
                    }
                    if (data.startingWithW) {
                        from = moment(data.startingWithW).format('YYYY-MM-DD')
                    }
                    if (data.endOnW) {
                        to = moment(data.endOnW).format('YYYY-MM-DD')
                    }
                    obj.includes.weekdays.push({days: data.days, from: from, to: to});
                } else if (data.tab === 'monthDays') {
                    if (data.isUltimos !== 'ultimos') {
                        if (!obj.includes.monthdays) {
                            obj.includes.monthdays = [];
                        }
                        if (data.startingWithM) {
                            from = moment(data.startingWithM).format('YYYY-MM-DD')
                        }
                        if (data.endOnM) {
                            to = moment(data.endOnM).format('YYYY-MM-DD')
                        }
                        obj.includes.monthdays.push({days: data.selectedMonths, from: from, to: to});
                    } else {
                        if (!obj.includes.ultimos) {
                            obj.includes.ultimos = [];
                        }
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
                        if (!obj.includes.monthdays) {
                            obj.includes.monthdays = [];
                        }
                        obj.includes.monthdays.push({weeklyDays: arr, from: from, to: to});
                    } else {
                        if (!obj.includes.ultimos) {
                            obj.includes.ultimos = [];
                        }
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
                if (value.whenHoliday == period.whenHoliday) {
                    flg = true;
                } else if (!value.whenHoliday && period.whenHoliday == 'suppress') {
                    flg = true;
                }
                if (!period.whenHoliday && value.whenHoliday == 'suppress') {
                    flg = true;
                }
                if (period.singleStart && flg && value.singleStart) {
                    return value.singleStart == period.singleStart;
                }
                if (period.repeat && flg && value.repeat) {
                    return value.repeat == period.repeat;
                }
                if (period.begin && flg && value.begin) {
                    return value.begin == period.begin;
                }
                if (period.end && flg && value.end) {
                    return value.end == period.end;
                }
                if (period.absoluteRepeat && flg && value.absoluteRepeat) {
                    return value.absoluteRepeat == period.absoluteRepeat;
                }
            }, getWeekDays: function (day) {
                if (!day) {
                    return;
                }
                var days = angular.copy(day);
                if (!angular.isArray(days)) {
                    days = days.toString().split(' ');
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

            stringMonthsNumber: function(month) {
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
                    .replace('december', '11')
            },

            getMonths: function (month) {
                let str = '';
                if (!month)
                    return;
                let months = angular.copy(month);
                if (!angular.isArray(months)) {
                    months = months.toString().split(' ');
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
                let str = '';
                if (!month) {
                    return month;
                }
                let months = angular.copy(month);
                if (!angular.isArray(months)) {
                    months = months.toString().split(' ').sort(this.compareNumbers);
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
                if(run_time.months) {
                    for (let i = 0; i < run_time.months.length; i++) {
                        if (run_time.months[i].month && angular.equals(run_time.months[i].month, param.months) || angular.equals(run_time.months[i].month.toString().split(' '), param.months)) {
                            isMonth = true;
                            break;
                        }
                    }
                }
                if (param.tab == 'specificDays') {
                    if (run_time.dates.length > 0) {
                        var _period = [];
                        angular.forEach(run_time.dates, function (value) {
                            if (value.date && param.date && (angular.equals(value.date, moment(param.date).format('YYYY-MM-DD')))) {
                                if (angular.isArray(value.periods)) {
                                    angular.forEach(value.periods, function (res) {
                                        if (res)
                                            _period.push(res);
                                    })
                                } else {
                                    if (value.periods) {
                                        _period.push(value.periods);
                                    }
                                }

                                _period.push(param.period);
                                value.periods = _period;
                            }
                        });
                        if (_period.length == 0) {
                            if (!angular.isArray(run_time.dates)) {
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
                            'periods':_.isEmpty(param.period) ? [] :  [param.period]
                        });
                    }
                } else if (param.tab == 'weekDays') {
                    if (param.months && param.months.length > 0) {

                        if (run_time.months.length > 0) {

                            let flag = false;
                            angular.forEach(run_time.months, function (value) {
                                if (isMonth) {
                                    if (value.weekdays && (angular.equals(value.month, param.months) || angular.equals(value.month.toString().split(' '), param.months))) {
                                        flag = true;
                                        var _period = [];
                                        if (angular.isArray(value.weekdays.days)) {
                                            angular.forEach(value.weekdays.days, function (value1) {
                                                if (value1.day && (angular.equals(value1.day, param.days) || angular.equals(value1.day.toString().split(' '), param.days))) {
                                                    if (angular.isArray(value1.periods)) {
                                                        angular.forEach(value1.periods, function (res) {
                                                            if (res)
                                                                _period.push(res);
                                                        })
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
                                            if (angular.equals(value.weekdays.days.day, param.days) || angular.equals(value.weekdays.days.day.toString().split(' '), param.days)) {

                                                if (angular.isArray(value.weekdays.days.periods)) {
                                                    angular.forEach(value.weekdays.days.periods, function (res) {
                                                        if (res)
                                                            _period.push(res);
                                                    })
                                                } else {
                                                    if (value.weekdays.days.periods)
                                                        _period.push(value.weekdays.days.periods);
                                                }
                                                _period.push(param.period);
                                                value.weekdays.days.periods = _period;
                                            }
                                        }

                                        if (_period.length == 0) {
                                            if (value.weekdays.days && !_.isEmpty(value.weekdays.days)) {
                                                if (!angular.isArray(value.weekdays, param.days)) {
                                                    let t = [];
                                                    t.push(angular.copy(value.weekdays.days));
                                                    value.weekdays.days = t;
                                                }
                                            } else {
                                                value.weekdays.days = [];
                                            }

                                            value.weekdays.days.push({
                                                'day': param.days,
                                                'periods':_.isEmpty(param.period) ? [] :  [param.period]
                                            });
                                        }
                                    }
                                }
                            });
                            if (!flag) {
                                if (isMonth) {
                                    for (let i = 0; i < run_time.months.length; i++) {
                                        if (run_time.months[i].month && angular.equals(run_time.months[i].month, param.months) || angular.equals(run_time.months[i].month.toString().split(' '), param.months)) {
                                            run_time.months[i].weekdays = {days: []};
                                            run_time.months[i].weekdays.days.push({
                                                'day': param.days,
                                                'periods':_.isEmpty(param.period) ? [] : [param.period]
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
                        if (run_time.weekdays.days.length > 0) {
                            let _period = [];
                            angular.forEach(run_time.weekdays.days, function (value) {
                                if (value.day && (angular.equals(value.day, param.days) || angular.equals(value.day.toString().split(' '), param.days))) {

                                    if (angular.isArray(value.periods)) {
                                        angular.forEach(value.periods, function (res) {
                                            if (res)
                                                _period.push(res);
                                        })
                                    } else {
                                        if (value.periods)
                                            _period.push(value.periods);
                                    }
                                    _period.push(param.period);
                                    value.periods = _period;
                                }
                            });
                            if (_period.length == 0) {
                                if (!angular.isArray(run_time.weekdays.days)) {
                                    run_time.weekdays.days = [];
                                }
                                run_time.weekdays.days.push({'day': param.days, 'periods': _.isEmpty(param.period) ? [] : [param.period]});
                            }
                        } else {
                            run_time.weekdays.days.push({'day': param.days, 'periods':_.isEmpty(param.period) ? [] :  [param.period]});
                        }
                    }

                } else if (param.tab == 'specificWeekDays') {
                    if (param.months && param.months.length > 0) {

                        if (run_time.months.length > 0) {

                            let flag = false;
                            angular.forEach(run_time.months, function (value) {

                                if (isMonth) {
                                    if (value.monthdays && value.monthdays.weekdays && (angular.equals(value.month, param.months) || angular.equals(value.month.toString().split(' '), param.months))) {

                                        flag = true;
                                        var _period = [];
                                        if (angular.isArray(value.monthdays.weekdays)) {
                                            angular.forEach(value.monthdays.weekdays, function (value1) {
                                                if (value1.day && value1.day == param.specificWeekDay && value1.which == param.which) {
                                                    if (angular.isArray(value1.periods)) {
                                                        angular.forEach(value1.periods, function (res) {
                                                            if (res)
                                                                _period.push(res);
                                                        })
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

                                        if (_period.length == 0) {
                                            if (!angular.isArray(value.monthdays.weekdays)) {
                                                if (value.monthdays.weekdays && !_.isEmpty(value.monthdays.weekdays)) {
                                                    if (!angular.isArray(value.monthdays.weekdays)) {
                                                        let t = [];
                                                        t.push(angular.copy(value.monthdays.weekdays));
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
                                        if (run_time.months[i].month && angular.equals(run_time.months[i].month, param.months) || angular.equals(run_time.months[i].month.toString().split(' '), param.months)) {
                                            if ((!run_time.months[i].monthdays)) {
                                                run_time.months[i].monthdays = {weekdays: []};
                                            } else {
                                                run_time.months[i].monthdays.weekdays = [];
                                            }

                                            run_time.months[i].monthdays.weekdays.push({
                                                'day': param.specificWeekDay,
                                                'which': param.which,
                                                'periods':_.isEmpty(param.period) ? [] :  [param.period]
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
                        if (run_time.monthdays.weekdays && run_time.monthdays.weekdays.length > 0) {
                            let flag = true;
                            angular.forEach(run_time.monthdays.weekdays, function (value) {
                                if (value && value.day == param.specificWeekDay && value.which == param.which) {
                                    flag = false;
                                    if (angular.isArray(value.periods) && param.period) {
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
                            if (!angular.isArray(run_time.monthdays.weekdays)) {
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
                } else if (param.tab == 'monthDays') {

                    if (param.selectedMonths && angular.isArray(param.selectedMonths)) {
                        selectedMonths = angular.copy(param.selectedMonths);
                    }
                    if (param.selectedMonthsU && angular.isArray(param.selectedMonthsU)) {
                        selectedMonthsU = angular.copy(param.selectedMonthsU);
                    }
                    if (selectedMonths.length > 0 || selectedMonthsU.length > 0) {
                        if (param.isUltimos !== 'ultimos') {
                            if (param.months && param.months.length > 0) {
                                if (run_time.months.length > 0) {

                                    var flag = false;
                                    angular.forEach(run_time.months, function (value) {
                                        if (isMonth) {
                                            if (value.monthdays && value.monthdays.days && (angular.equals(value.month, param.months) || angular.equals(value.month.toString().split(' '), param.months))) {

                                                flag = true;
                                                var _period = [];

                                                if (angular.isArray(value.monthdays.days)) {
                                                    angular.forEach(value.monthdays.days, function (value1) {
                                                        if (value1.day && (angular.equals(value1.day, selectedMonths) || angular.equals(value1.day.toString().split(' '), selectedMonths))) {
                                                            if (angular.isArray(value1.periods)) {
                                                                angular.forEach(value1.periods, function (res) {
                                                                    if (res)
                                                                        _period.push(res);
                                                                })
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
                                                        if (!angular.isArray(value.monthdays.days)) {
                                                            var t = [];
                                                            t.push(angular.copy(value.monthdays.days));
                                                            value.monthdays.days = t;
                                                        }
                                                    } else {
                                                        value.monthdays.days = [];
                                                    }

                                                    value.monthdays.days.push({
                                                        'day': angular.copy(selectedMonths),
                                                        'periods':_.isEmpty(param.period) ? [] :  [param.period]
                                                    });
                                                }
                                            }

                                        }
                                    });
                                    if (!flag) {
                                        if (isMonth) {
                                            for (let i = 0; i < run_time.months.length; i++) {
                                                if (run_time.months[i].month && angular.equals(run_time.months[i].month, param.months) || angular.equals(run_time.months[i].month.toString().split(' '), param.months)) {
                                                    if ((!run_time.months[i].monthdays)) {
                                                        run_time.months[i].monthdays = {days: []};
                                                    } else {
                                                        run_time.months[i].monthdays.days = [];
                                                    }
                                                    run_time.months[i].monthdays.days.push({
                                                        'day': angular.copy(selectedMonths),
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
                                                'day': angular.copy(selectedMonths),
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
                                        'day': angular.copy(selectedMonths),
                                        'periods': _.isEmpty(param.period) ? [] : [param.period]
                                    });
                                    run_time.months.push(x);

                                }
                            } else {
                                if (run_time.monthdays) {
                                    if (run_time.monthdays.days.length > 0) {
                                        let _period = [];
                                        angular.forEach(run_time.monthdays.days, function (value) {
                                            if (value.day && (angular.equals(value.day, selectedMonths) || angular.equals(value.day.toString().split(' '), selectedMonths))) {
                                                if (angular.isArray(value.periods)) {
                                                    angular.forEach(value.periods, function (res) {
                                                        if (res)
                                                            _period.push(res);
                                                    })
                                                } else {
                                                    if (value.periods) {
                                                        _period.push(value.periods);
                                                    }

                                                }
                                                _period.push(param.period);

                                                value.periods = _period;
                                            }
                                        });

                                        if (_period.length == 0) {
                                            if (!angular.isArray(run_time.monthdays.days)) {
                                                run_time.monthdays.days = [];
                                            }
                                            run_time.monthdays.days.push({
                                                'day': angular.copy(selectedMonths),
                                                'periods': _.isEmpty(param.period) ? [] : [param.period]
                                            });
                                        }

                                    } else {
                                        run_time.monthdays.days.push({
                                            'day': angular.copy(selectedMonths),
                                            'periods': _.isEmpty(param.period) ? [] : [param.period]
                                        });
                                    }
                                }
                            }
                        } else {
                            if (param.months && param.months.length > 0) {
                                if (run_time.months.length > 0) {
                                    let flag = false;
                                    angular.forEach(run_time.months, function (value) {
                                   
                                        if (isMonth) {
                                            if (value.ultimos && (angular.equals(value.month, param.months) || angular.equals(value.month.toString().split(' '), param.months))) {
                                                flag = true;
                                                let _period = [];
                                                if (angular.isArray(value.ultimos.days)) {
                                                    angular.forEach(value.ultimos.days, function (value1) {
                                                        if (value1.day && (angular.equals(value1.day, selectedMonthsU) || angular.equals(value1.day.toString().split(' '), selectedMonthsU))) {

                                                            if (angular.isArray(value1.periods)) {
                                                                angular.forEach(value1.periods, function (res) {
                                                                    if (res)
                                                                        _period.push(res);

                                                                })
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

                                                if (_period.length == 0) {
                                                    if (value.ultimos.days && !_.isEmpty(value.ultimos.days)) {
                                                        if (!angular.isArray(value.ultimos.days)) {
                                                            var t = [];
                                                            t.push(angular.copy(value.ultimos.days));
                                                            value.ultimos.days = t;
                                                        }
                                                    } else {
                                                        value.ultimos.days = [];
                                                    }

                                                    value.ultimos.days.push({
                                                        'day': angular.copy(selectedMonthsU),
                                                        'periods': _.isEmpty(param.period) ? [] : [param.period]
                                                    });
                                                }
                                            }
                                        }
                                    });
                                    if (!flag) {
                                        if (isMonth) {
                                            for (let i = 0; i < run_time.months.length; i++) {
                                                if (run_time.months[i].month && angular.equals(run_time.months[i].month, param.months) || angular.equals(run_time.months[i].month.toString().split(' '), param.months)) {
                                                    run_time.months[i].ultimos = {days: []};
                                                    run_time.months[i].ultimos.days.push({
                                                        'day': angular.copy(selectedMonthsU),
                                                        'periods':_.isEmpty(param.period) ? [] :  [param.period]
                                                    });
                                                    break;
                                                }
                                            }

                                        } else {
                                            let x = {month: param.months, ultimos: {days: []}};
                                            x.ultimos.days.push({
                                                'day': angular.copy(selectedMonthsU),
                                                'periods': _.isEmpty(param.period) ? [] : [param.period]
                                            });
                                            run_time.months.push(x);
                                        }
                                    }
                                } else {
                                    let x = {month: param.months, ultimos: {days: []}};
                                    x.ultimos.days.push({'day': angular.copy(selectedMonthsU), 'periods': _.isEmpty(param.period) ? [] : [param.period]});
                                    run_time.months.push(x);

                                }
                            } else {
                                if (run_time.ultimos) {
                                    if (run_time.ultimos.days.length > 0) {
                                        let _period = [];
                                        angular.forEach(run_time.ultimos.days, function (value) {
                                            if (value.day && (angular.equals(value.day, selectedMonthsU) || angular.equals(value.day.toString().split(' '), selectedMonthsU))) {
                                                if (angular.isArray(value.periods)) {
                                                    angular.forEach(value.periods, function (res) {
                                                        if (res)
                                                            _period.push(res);
                                                    })
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
                                            if (!angular.isArray(run_time.ultimos.days)) {
                                                run_time.ultimos.days = [];
                                            }
                                            run_time.ultimos.days.push({
                                                'day': angular.copy(selectedMonthsU),
                                                'periods': _.isEmpty(param.period) ? [] : [param.period]
                                            });
                                        }

                                    } else {
                                        run_time.ultimos.days.push({
                                            'day': angular.copy(selectedMonthsU),
                                            'periods': _.isEmpty(param.period) ? [] : [param.period]
                                        });
                                    }
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

                return run_time;
            }

        }
    }
})();
