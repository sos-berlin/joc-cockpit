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
            'gantt.tooltips',
            'gantt.table',
            'ngFileSaver',
            'ngIdle',
            'ngclipboard'
        ])
        .run(['$resource', '$rootScope', function ($resource, $rootScope) {
            $rootScope.clientLogs=[];
            $resource("config.json").get(function (data) {
                $rootScope.configData = data;
            });
            $resource('poll_config.json').get(function (res) {
                $rootScope.config = res;
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
        .config(["IdleProvider", "KeepaliveProvider",function (IdleProvider, KeepaliveProvider) {
            // configure Idle settings
            IdleProvider.idle(30 * 60);
            IdleProvider.timeout(10); // in seconds
            KeepaliveProvider.interval(5); // in seconds

        }])
        .config(['$provide', function ($provide) {
            $provide.decorator("$exceptionHandler", ['$delegate', function ($delegate) {
                return function (exception, cause) {
                    TraceKit.report(exception);
                    $delegate(exception, cause);
                };
            }]);
        }]);



})();
