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
            'gantt.tooltips',
            'gantt.bounds',
            'gantt.progress',
            'gantt.tree',
            'gantt.table',
            'gantt.groups',
            'gantt.overlap',
            'ngFileSaver'
        ])
        .constant("apiUrl", "http://test.sos-berlin.com:3001/joc/api/")
        //.constant("apiUrl", "http://uk.sos-berlin.com:8888/rest/")
        .constant("APIUrl", "http://uk.sos-berlin.com:8888/joc/api/")
        .config(['calendarConfig' ,function (calendarConfig) {
            calendarConfig.dateFormatter = 'moment';
        }])
        .config(['toastyConfigProvider', function (toastyConfigProvider) {
            toastyConfigProvider.setConfig({
                sound: false,
                position: 'top-center',
                limit: 1
            });
        }]);
})();
