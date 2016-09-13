/**
 * Created by sourabhagrawal on 30/05/16.
 *
 *
 * Main module of the application.
 */
(function () {
    'use strict';
    angular
        .module('app', [
            'ngAnimate',
            'angular.filter',
            'ngResource',
            'angular-toasty',
            'ngSanitize',
            'ngTouch',
            'gettext',
            'ui.router',
            'mwl.calendar',
            'ui.bootstrap',
            'ngMessages',
            'treeGrid',
            'rzModule',
            'angularResizable',
            'mgcrea.ngStrap',
            'nvd3ChartDirectives',
            'ncy-angular-breadcrumb',
            'gantt',
            'gantt.sortable',
            'gantt.movable',
            'gantt.tooltips',
            'gantt.bounds',
            'gantt.progress',
            'gantt.tree',
            'gantt.table',
            'gantt.groups',
            'gantt.overlap',
            'ngFileSaver'
        ])
       // .constant("apiUrl", "http://test.sos-berlin.com:3001/joc/api/")
        .constant("apiUrl", "http://uk.sos-berlin.com:8888/rest/")
      //  .constant("APIUrl", "http://test.sos-berlin.com:3001/joc/api/")
        .constant("APIUrl", "http://uk.sos-berlin.com:8888/rest/")
        .config(['calendarConfig' ,function (calendarConfig) {
            calendarConfig.dateFormatter = 'moment'; //use either moment or angular to format dates on the calendar. Default angular. Setting this will override any date formats you have already set.
            calendarConfig.allDateFormats.moment.date.hour = 'HH:mm'; //this will configure times on the day view to display in 24 hour format rather than the default of 12 hour
            calendarConfig.allDateFormats.moment.title.day = 'ddd D MMM';
        }])
        .config(['toastyConfigProvider', function (toastyConfigProvider) {
            toastyConfigProvider.setConfig({
                sound: false,
                position: 'top-center',
                limit: 1
            });
        }]);
})();
