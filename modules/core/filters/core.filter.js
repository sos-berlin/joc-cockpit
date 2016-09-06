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
        return function (date) {
            if(!date) return '-';

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


            function numberEnding(number) {
                return (number > 1) ? 's' : '';
            }

            var temp = Math.floor(milliseconds / 1000);

            var days = Math.floor((temp %= 31536000) / 86400);
            if (days) {
                return days + ' day' + numberEnding(days);
            }
            var hours = Math.floor((temp %= 86400) / 3600);
            if (hours) {
                return hours + ' hour' + numberEnding(hours);
            }
            var minutes = Math.floor((temp %= 3600) / 60);
            if (minutes) {
                return minutes + ' min';
            }
            var seconds = temp % 60;
            if (seconds) {
                return seconds + ' sec';
            }
            return 'less than a sec';
        }
    }

    function startFrom() {
        return function (data, start) {
             if(!data) return;
            return data.slice(start);
        }
    }

})();
