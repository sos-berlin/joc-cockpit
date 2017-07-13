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
            'nvd3',
            'ncy-angular-breadcrumb',
            'gantt',
            'gantt.tooltips',
            'gantt.table',
            'ngFileSaver',
            'angular-clipboard',
            'ngclipboard',
            'ui.select'
        ])
        .run(['$resource', '$rootScope', function ($resource, $rootScope) {
            $rootScope.clientLogs = [];
            $resource("version.json").get(function (data) {
                $rootScope.versionData = data;
            });

        }])
        .config(['calendarConfig', function (calendarConfig) {
            calendarConfig.dateFormatter = 'moment';
        }])
        .config(['toastyConfigProvider', function (toastyConfigProvider) {
            toastyConfigProvider.setConfig({
                sound: false,
                position: 'top-center',
                limit: 1
            });
        }])
        .config(['$qProvider', function ($qProvider) {
            $qProvider.errorOnUnhandledRejections(false);
        }])
        .config(['$provide', function ($provide) {
            $provide.decorator("$exceptionHandler", ['$delegate', function ($delegate) {
                return function (exception, cause) {
                    TraceKit.report(exception);
                    $delegate(exception, cause);
                };
            }]);
        }])

        ;
})();
