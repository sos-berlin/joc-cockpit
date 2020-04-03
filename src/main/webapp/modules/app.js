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
            'ui.bootstrap',
            'ngMessages',
            'treeGrid',
            'angularResizable',
            'mgcrea.ngStrap',
            'nvd3',
            'ui.select',
            'ncy-angular-breadcrumb',
            'gantt',
            'gantt.tooltips',
            'gantt.table',
            'ngFileSaver',
            'angular-clipboard',
            'oc.lazyLoad',
            'ui.sortable',
            'ui.codemirror'
        ])
        .run(['$resource', '$rootScope', '$cacheFactory', function ($resource, $rootScope, $cacheFactory) {
            $rootScope.clientLogs = [];

            $resource("version.json").get(function (data) {
                $rootScope.versionData = data;
                $cacheFactory.removeAll();
            });

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
        .config(['$compileProvider', function ($compileProvider) {
            $compileProvider.debugInfoEnabled(false);
            $compileProvider.commentDirectivesEnabled(false);
            $compileProvider.cssClassDirectivesEnabled(false);
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
