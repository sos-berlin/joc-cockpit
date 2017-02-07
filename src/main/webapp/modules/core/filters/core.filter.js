/**
 * Created by sourabhagrawal on 26/04/16.
 */

(function () {
    'use strict';
    angular.module('app')
        .filter('fromNow', fromNow)
        .filter('stringToDate', stringToDate)
        .filter('duration', duration)
        .filter('convertTime', convertTime)
        .filter('durationFromCurrent', durationFromCurrent)
        .filter('startFrom', startFrom)
        .filter('remainingTime', remainingTime)
        .filter('timeDifferenceFilter', timeDifferenceFilter);


    fromNow.$inject = ['$window'];
    function fromNow($window) {
        return function (date) {
            if (!date) {
                return '-';
            }
            if (!$window.sessionStorage.preferences) {
                return;
            }
            date = moment(date).tz(JSON.parse($window.sessionStorage.preferences).zone);
            return moment(date).fromNow();

        }
    }

    stringToDate.$inject = ['$window'];
    function stringToDate($window) {
        return function (date) {
            if (!$window.sessionStorage.preferences) {
                return;
            }
            if (!date) return '-';
            var preferences = JSON.parse($window.sessionStorage.preferences);
            return moment(date).tz(preferences.zone).format(preferences.dateFormat);
        }
    }

    duration.$inject = ['$window', 'gettextCatalog'];
    function duration($window, gettextCatalog) {
        return function (d1, d2) {
            if (!$window.sessionStorage.preferences) {
                return;
            }
            if (!d1 || !d2) return '-';
            var preferences = JSON.parse($window.sessionStorage.preferences);
            d1 = moment(d1).tz(preferences.zone);
            d2 = moment(d2).tz(preferences.zone);
            var milliseconds = moment(d2).diff(d1);
            if (milliseconds >= 1000) {
                var s = parseInt((milliseconds / 1000) % 60),
                    m = parseInt((milliseconds / (60 * 1000)) % 60),
                    h = parseInt((milliseconds / (1000 * 60 * 60)) % 24),
                    d = parseInt(milliseconds / (1000 * 60 * 60 * 24));

                if (d == 0 && h != 0) {
                    return h + 'h ' + m + 'm ' + s + 's';
                } else if (h == 0 && m != 0) {
                    return m + 'm ' + s + 's';
                } else if (d == 0 && h == 0 && m == 0) {
                    return s + ' sec';
                } else {
                    return d + 'd ' + h + 'h ' + m + 'm ' + s + 's';
                }
            } else {
                return gettextCatalog.getString('label.lessThanSec');
            }
        }
    }


    function convertTime() {
        return function (seconds) {

            var s = parseInt((seconds) % 60),
                m = parseInt((seconds / 60) % 60),
                h = parseInt((seconds / (60 * 60)) % 24);
            h = h > 9 ? h : '0' + h;
            m = m > 9 ? m : '0' + m;
            s = s > 9 ? s : '0' + s;
            return h + ':' + m + ':' + s;
        }
    }

    durationFromCurrent.$inject = ['$window', 'gettextCatalog'];
    function durationFromCurrent($window, gettextCatalog) {
        return function (d1, d2) {
            if (!d1) {
                d1 = new Date();
            }
            if (!d2) {
                d2 = new Date();
            }
            if (!$window.sessionStorage.preferences) {
                return;
            }
            var preferences = JSON.parse($window.sessionStorage.preferences);
            d1 = moment(d1).tz(preferences.zone);
            d2 = moment(d2).tz(preferences.zone);
            var milliseconds = Math.abs(moment(d2).diff(d1));
            if (milliseconds >= 1000) {
                var s = parseInt((milliseconds / 1000) % 60),
                    m = parseInt((milliseconds / (60 * 1000)) % 60),
                    h = parseInt((milliseconds / (1000 * 60 * 60)) % 24),
                    d = parseInt(milliseconds / (1000 * 60 * 60 * 24));

                if (d == 0 && h != 0) {
                    return h + ':' + m + 'h';
                } else if (h == 0 && m != 0) {
                    return m + ':' + s + 'min';
                } else if (d == 0 && h == 0 && m == 0) {
                    return s + 'sec';
                } else {
                    if (d > 1)
                        return d + 'days';
                    else
                        return d + 'day';
                }
            } else {
                return gettextCatalog.getString('never');
            }
        }
    }

    function startFrom() {
        return function (data, start) {
            if (!data) return;
            return data.slice(start);
        }
    }

    remainingTime.$inject = ['$window'];
    function remainingTime($window) {
        return function (d1) {
            if (!$window.sessionStorage.preferences) {
                return;
            }
            var d2 = new Date();
            var preferences = JSON.parse($window.sessionStorage.preferences);
            d1 = moment(d1).tz(preferences.zone);
            d2 = moment(d2).tz(preferences.zone);
            var milliseconds = Math.abs(moment(d2).diff(d1));
            if (milliseconds >= 1000) {
                var s = parseInt((milliseconds / 1000) % 60),
                    m = parseInt((milliseconds / (60 * 1000)) % 60),
                    h = parseInt((milliseconds / (1000 * 60 * 60)) % 24),
                    d = parseInt(milliseconds / (1000 * 60 * 60 * 24));

                if (d == 0 && h != 0) {
                    return h + ':' + m + 'h';
                } else if (h == 0 && m != 0) {
                    return m + ':' + s + 'min';
                } else if (d == 0 && h == 0 && m == 0) {
                    return s + 'sec';
                } else {
                    if (d > 1)
                        return d + 'days';
                    else
                        return d + 'day';
                }
            } else {
                return 1 + 'sec';
            }
        }
    }

    timeDifferenceFilter.$inject = ['gettextCatalog'];
    function timeDifferenceFilter(gettextCatalog) {
        return function (date) {

            if (!date) return;
            var time = date,
                timeNow = new Date().getTime(),
                difference = timeNow - time,
                seconds = Math.floor(difference / 1000),
                minutes = Math.floor(seconds / 60),
                hours = Math.floor(minutes / 60),
                days = Math.floor(hours / 24);
            if (days > 1) {
                return days + ' ' + gettextCatalog.getString("label.dayAgo");
            } else if (days == 1) {
                return "1 " + gettextCatalog.getString("label.dayAgo");
            } else if (hours > 1) {
                return hours + ' ' + gettextCatalog.getString("label.hourAgo");
            } else if (hours == 1) {
                return gettextCatalog.getString("label.anHourAgo");
            } else if (minutes > 1) {
                return minutes + ' ' + gettextCatalog.getString("label.minuteAgo");
            } else if (minutes == 1) {
                return gettextCatalog.getString("label.aMinuteAgo");
            } else {
                return gettextCatalog.getString("label.fewSecondsAgo");
            }
        }
    }


})();
