/**
 *
 * Created by sourabhagrawal on 30/05/16.
 *
 * @ngdoc function
 * @name app.config:uiRouter
 * @description
 * # Config
 * Config for the router
 */
(function () {
    'use strict';
    angular
        .module('app')
        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider'];
    function config($stateProvider, $urlRouterProvider) {

        /**
         * Check is user loggedin or not
         * @param $q
         * @param $location
         * @param SOSAuth
         * @returns {*}
         */
        var checkLoggedin = function ($q, $location, SOSAuth, $window) {
            // Initialize a new promise
            var deferred = $q.defer();

            // Authenticated
            if (SOSAuth.accessTokenId) {
                $window.sessionStorage.setItem('$SOS$URL', null);
                $window.sessionStorage.setItem('$SOS$URLPARAMS', {});
                deferred.resolve();
            }
            // Not Authenticated
            else {
                $window.sessionStorage.setItem('$SOS$URL', $location.path());
                $window.sessionStorage.setItem('$SOS$URLPARAMS', JSON.stringify($location.search()));
                deferred.reject('login');
            }
            return deferred.promise;
        };
        checkLoggedin.$inject = ['$q', '$location', 'SOSAuth', '$window'];


        /**
         * Check is user logout or not
         * @param $q
         * @param SOSAuth
         * @returns {*}
         */
        var checkLogout = function ($q, SOSAuth) {
            // Initialize a new promise
            var deferred = $q.defer();

            // Not  Authenticated
            if (!SOSAuth.accessTokenId) {
                deferred.resolve();
            }
            // Authenticated
            else {
                deferred.reject();
            }
            return deferred.promise;
        };
        checkLogout.$inject = ['$q', 'SOSAuth'];



        $urlRouterProvider.otherwise(function ($injector, $location) {
            $injector.invoke(['$state', function ($state) {
                if ($location.path()) {
                    $state.go('404');
                } else {
                    $state.go('app.dashboard');
                }
            }]);
            return true;
        });

        $stateProvider

            .state('login', {
                url: '/login',
                templateUrl: 'modules/user/views/login.html',
                controller: 'LoginCtrl as lc',
                title: 'Login',
                ncyBreadcrumb: {
                    skip: true
                },
                resolve: {
                    logout: checkLogout
                }
            })
            .state('404', {
                url: '/404',
                templateUrl: 'modules/core/views/404.html',
                title: '404',
                ncyBreadcrumb: {
                    skip: true
                }
            })
            .state('error', {
                url: '/error',
                templateUrl: 'modules/core/views/error.html',
                controller:'HeaderCtrl',
                title: 'Error',
                ncyBreadcrumb: {
                    skip: true
                }
            })
            .state('client-logs', {
                url: '/client-logs',
                templateUrl: 'modules/core/views/client-logs.html',
                controller:'ClientLogCtrl',
                title: 'JobScheduler-Logging',
                ncyBreadcrumb: {
                    skip: true
                }
            })
            .state('show_log', {
                url: '/show_log',
                templateUrl: 'modules/core/views/log.html',
                ncyBreadcrumb: {
                    skip: true
                }
            })
            .state('app', {
                abstract: true,
                url: '',
                templateUrl: 'modules/core/views/layout.html',
                resolve: {
                    loggedin: checkLoggedin
                }
            })
            .state('app.dashboard', {
                url: '/',
                templateUrl: 'modules/jobscheduler/views/dashboard.html',
                controller: 'DashboardCtrl',
                ncyBreadcrumb: {
                    label: '{{ \'breadcrumb.dashboard\' | translate}}'
                }
            })
            .state('app.setting', {
                url: '/setting',
                templateUrl: 'modules/core/views/setting.html',
                ncyBreadcrumb: {
                    label: '{{ \'breadcrumb.setting\' | translate}}'
                }
            })
            .state('app.dailyPlan', {
                url: '/dailyPlan',
                params:{
                    filter:null,
                    day:null
                },
                templateUrl: 'modules/jobscheduler/views/daily-plan.html',
                controller: 'DailyPlanCtrl',
                ncyBreadcrumb: {
                    label: '{{ \'breadcrumb.dailyPlan\' | translate}}'
                }
            })
            .state('app.jobs', {
                url: '/jobs',
                templateUrl: 'modules/job/views/job.html',
                controller: 'JobCtrl',
                ncyBreadcrumb: {
                    label: '{{ \'breadcrumb.jobs\' | translate}}'
                }
            })
            .state('app.jobChain', {
                url: '/jobChain',
                templateUrl: 'modules/job/views/job-chain.html',
                controller: 'JobChainCtrl',
                ncyBreadcrumb: {
                    label: '{{ \'breadcrumb.jobChains\' | translate}}'
                }
            })
            .state('app.jobChainDetails', {
                url: '/jobChainDetails',
                templateUrl: 'modules/order/views/job-chain-details.html',
                controller: 'JobChainDetailsCtrl',
                ncyBreadcrumb: {
                    label: '{{jobChain.name}}',
                    parent: 'app.jobChain'
                }
            })
            .state('app.jobChainDetails.orders', {
                url: '/orders',
                templateUrl: 'modules/order/views/job-chain-orders.html',
                controller: 'JobChainOrdersCtrl',
                ncyBreadcrumb: {
                    skip: true
                }
            })
            .state('app.jobChainDetails.overview', {
                url: '/overview',
                templateUrl: 'modules/order/views/job-chain-overview.html',
                controller: 'JobChainOverviewCtrl',
                ncyBreadcrumb: {
                    skip: true
                }
            })

            .state('app.orders', {
                url: '/allOrders',
                templateUrl: 'modules/order/views/order.html',
                controller: 'OrderCtrl',
                ncyBreadcrumb: {
                    label: '{{ \'breadcrumb.orders\' | translate}}'
                }
            })

            .state('app.ordersOverview', {
                url: '/orders/:name',
                templateUrl: 'modules/order/views/orders-overview.html',
                controller: 'OrderOverviewCtrl',
                ncyBreadcrumb: {
                    label: '{{ \'breadcrumb.orders\' | translate}}',
                    parent: 'app.dashboard'
                }
            })

            .state('app.orderLog', {
                url: '/order/log/:historyId/:orderId',
                templateUrl: 'modules/order/views/log.html',
                controller: 'LogCtrl',
                ncyBreadcrumb: {
                    label: '{{ \'breadcrumb.orderLogs\' | translate}}',
                    parent: 'app.history'
                }
            })
            .state('app.jobLog', {
                url: '/job/log/:taskId',
                templateUrl: 'modules/order/views/log.html',
                controller: 'LogCtrl',
                ncyBreadcrumb: {
                    label: '{{ \'breadcrumb.taskLogs\' | translate}}',
                    parent: 'app.history'
                }
            })
            .state('app.resources', {
                url: '/resources',
                templateUrl: 'modules/jobscheduler/views/resource.html',
                controller: 'ResourceCtrl',
                ncyBreadcrumb: {
                    label: '{{ \'breadcrumb.resources\' | translate}}'
                }
            })
            .state('app.resources.agentClusters', {
                url: '/agentClusters/:type',
                templateUrl: 'modules/jobscheduler/views/resource-agents.html',
                ncyBreadcrumb: {
                    label: '{{ \'breadcrumb.agents\' | translate}}',
                    parent: 'app.resources'
                }
            })
            .state('app.resources.locks', {
                url: '/locks',
                templateUrl: 'modules/jobscheduler/views/resource-locks.html',
                ncyBreadcrumb: {
                     label: '{{ \'breadcrumb.locks\' | translate}}',
                    parent: 'app.resources'
                }
            })
            .state('app.resources.processClasses', {
                url: '/processClasses',
                templateUrl: 'modules/jobscheduler/views/resource-process-classes.html',
                ncyBreadcrumb: {
                     label: '{{ \'breadcrumb.processClasses\' | translate}}',
                    parent: 'app.resources'
                }
            })
            .state('app.resources.schedules', {
                url: '/schedules',
                templateUrl: 'modules/jobscheduler/views/resource-schedules.html',
                ncyBreadcrumb: {
                    label: '{{ \'breadcrumb.schedules\' | translate}}',
                    parent: 'app.resources'
                }
            })
            .state('app.schedule-orders', {
                url: '/schedule/:name',
                templateUrl: 'modules/jobscheduler/views/schedule-orders.html',
                controller: 'ScheduleOrderCtrl',
                ncyBreadcrumb: {
                    label: '{{name}}',
                    parent: 'app.resources.schedules'
                }
            })
            .state('app.history', {
                url: '/history',
                templateUrl: 'modules/order/views/history.html',
                controller: 'HistoryCtrl',
                ncyBreadcrumb: {
                    label: '{{ \'breadcrumb.history\' | translate}}'
                }
            })

            .state('app.profile', {
                url: '/user/profile',
                templateUrl: 'modules/user/views/profile.html',
                controller: 'UserProfileCtrl as upc',
                ncyBreadcrumb: {
                   label: '{{ \'breadcrumb.userProfile\' | translate}}'
                }
            });
    }
})();

