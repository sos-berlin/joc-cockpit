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
            'oc.lazyLoad'
        ])
        .run(['$resource', '$rootScope', function ($resource, $rootScope) {
            $rootScope.clientLogs = [];
            $resource("version.json").get(function (data) {
                $rootScope.versionData = data;
                localStorage.setItem("JOC-Version", data.version);
            });


            function clearCache(cacheName) {
                return caches.open(cacheName).then(function (cache) {
                    cache.keys().then(function (keys) {
                        keys.forEach(function (request) {
                            cache.delete(request);
                        });
                    });
                })
            }

            var updated = localStorage.getItem("JOC-Version");
            if (!updated) {
                console.log(updated)
                localStorage.setItem('v2-update', true);
                caches.keys().then(function (keyList) {
                    for (var i = 0; i < keyList.length; i++) {
                        var cacheKeyName = keyList[i];
                        if (cacheKeyName !== "images") {
                            clearCache(cacheKeyName);
                        }
                    }
                    return;
                })
            }

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
        }]);
})();
