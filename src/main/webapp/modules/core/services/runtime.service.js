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
                angular.forEach(months.sort(compareNumbers), function (value) {
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
                    months = month.toString().split(' ').sort(compareNumbers);
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
            }

        }
    }
})();
