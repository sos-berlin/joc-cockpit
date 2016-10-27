/**
 * Created by sourabhagrawal on 26/04/16.
 */

(function () {
    'use strict';
    angular.module('app')
        .filter('fromNow', fromNow)
        .filter('stringToDate', stringToDate)
        .filter('duration', duration)
        .filter('startFrom', startFrom);

    fromNow.$inject =['$window'];
    function fromNow($window) {
        return function (date) {
            if(!date){
                return '-';
            }
            date = moment(date).tz($window.localStorage.$SOS$ZONE);
            return moment(date).fromNow();
        }
    }

    stringToDate.$inject =['$window'];
    function stringToDate($window) {
        return function (date,timeZone) {
            if(!date) return '-';
           // if(timeZone == $window.localStorage.$SOS$ZONE){
             //   return moment(date).format($window.localStorage.$SOS$DATEFORMAT);

                 return moment(date).tz($window.localStorage.$SOS$ZONE).format($window.localStorage.$SOS$DATEFORMAT);

        }
    }

    duration.$inject =['$window'];
    function duration($window) {
        return function (d1, d2) {
            if (!d1 || !d2) return '-';

            d1 = moment(d1).tz($window.localStorage.$SOS$ZONE);
            d2 = moment(d2).tz($window.localStorage.$SOS$ZONE);
            var milliseconds = moment(d2).diff(d1);
            if (milliseconds >= 1000) {
                var s = parseInt((milliseconds / 1000) % 60),
                    m = parseInt((milliseconds / (60 * 1000)) % 60),
                    h = parseInt((milliseconds / (1000 * 60 * 60)) % 24),
                    d = parseInt(milliseconds / (1000 * 60 * 60 * 24));

                if (d == 0 && h != 0) {
                    return h + 'h ' + m + 'm ' + s + 's';
                } else if (h == 0 && m != 0) {
                    return m + ' m' + s + ' s';
                } else if (d == 0 && h == 0 && m == 0) {
                    return s + ' sec';
                } else {
                    return d + 'd ' + h + 'h ' + m + 'm ' + s + 's';
                }
            } else {
                return 'less than a sec';
            }
        }
    }

    function startFrom() {
        return function (data, start) {
             if(!data) return;
            return data.slice(start);
        }
    }

})();
