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
        var checkLoggedin = function ($q, $location, SOSAuth) {
            // Initialize a new promise
            var deferred = $q.defer();

            // Authenticated
            if (SOSAuth.accessTokenId) {
                sessionStorage.setItem('$SOS$URL', null);
                deferred.resolve();
            }
            // Not Authenticated
            else {
                sessionStorage.setItem('$SOS$URL', $location.path());
                deferred.reject('login');
            }
            return deferred.promise;
        };
        checkLoggedin.$inject = ['$q', '$location', 'SOSAuth'];


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
                controller: 'LoginCtrl',
                ncyBreadcrumb: {
                    skip: true
                }
            })
            .state('404', {
                url: '/404',
                templateUrl: 'modules/core/views/404.html',
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
                    label: 'Dashboard'
                }
            })
            .state('app.dailyPlan', {
                url: '/dailyPlan',
                templateUrl: 'modules/jobscheduler/views/daily-plan.html',
                controller: 'DailyPlanCtrl',
                ncyBreadcrumb: {
                    label: 'Daily Plan'
                }
            })
            .state('app.jobs', {
                url: '/jobs',
                templateUrl: 'modules/job/views/job.html',
                controller: 'JobCtrl',
                ncyBreadcrumb: {
                    label: 'Jobs'
                }
            })
            .state('app.jobChain', {
                url: '/jobChain',
                templateUrl: 'modules/job/views/job-chain.html',
                controller: 'JobChainCtrl',
                ncyBreadcrumb: {
                    label: 'Job Chains'
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
            .state('app.orderFlow', {
                url: '/orderFlow',
                templateUrl: 'modules/order/views/order-flow.html',
                controller: 'OrderFlowCtrl',
                ncyBreadcrumb: {
                    label: '{{orderId}}',
                    parent: 'app.jobChainDetails'
                }
            })

            .state('app.orders', {
                url: '/allOrders',
                templateUrl: 'modules/order/views/order.html',
                controller: 'OrderCtrl',
                ncyBreadcrumb: {
                    label: 'Orders'
                }
            })
            .state('app.orderFlow1', {
                url: '/order/orderFlow',
                templateUrl: 'modules/order/views/order-flow.html',
                controller: 'OrderFlowCtrl',
                ncyBreadcrumb: {
                    label: '{{orderId}}',
                    parent: 'app.orders'
                }
            })
            .state('app.ordersOverview', {
                url: '/orders/:name',
                templateUrl: 'modules/order/views/orders-overview.html',
                controller: 'OrderOverviewCtrl',
                ncyBreadcrumb: {
                    label: 'Orders',
                    parent: 'app.dashboard'
                }
            })
            .state('app.orderFlow2', {
                url: '/:name/orderFlow',
                templateUrl: 'modules/order/views/order-flow.html',
                controller: 'OrderFlowCtrl',
                ncyBreadcrumb: {
                    label: '{{orderId}}',
                    parent: 'app.ordersOverview'
                }
            })

            .state('app.resources', {
                url: '/resources',
                templateUrl: 'modules/jobscheduler/views/resource.html',
                controller: 'ResourceCtrl',
                ncyBreadcrumb: {
                    label: 'Resources'
                }
            })
            .state('app.resources.agentClusters', {
                url: '/agentClusters/:type',
                templateUrl: 'modules/jobscheduler/views/resource-agents.html',
                ncyBreadcrumb: {
                    skip: true
                }
            })
            .state('app.resources.locks', {
                url: '/locks',
                templateUrl: 'modules/jobscheduler/views/resource-locks.html',
                ncyBreadcrumb: {
                    skip: true
                }
            })
            .state('app.resources.processClasses', {
                url: '/processClasses',
                templateUrl: 'modules/jobscheduler/views/resource-process-classes.html',
                ncyBreadcrumb: {
                    skip: true
                }
            })
            .state('app.schedules', {
                url: '/schedules',
                templateUrl: 'modules/jobscheduler/views/schedule.html',
                controller: 'ScheduleCtrl',
                ncyBreadcrumb: {
                    label: 'Schedules'
                }
            })
            .state('app.schedule-orders', {
                url: '/schedule/:name',
                templateUrl: 'modules/jobscheduler/views/schedule-orders.html',
                controller: 'ScheduleOrderCtrl',
                ncyBreadcrumb: {
                    label: '{{name}}',
                    parent: 'app.schedules'
                }
            })
            .state('app.history', {
                url: '/history',
                templateUrl: 'modules/order/views/history.html',
                controller: 'HistoryCtrl',
                ncyBreadcrumb: {
                    label: 'History'
                }
            })
            .state('configuration', {
                url: '/showConfiguration',
                templateUrl: 'modules/core/views/show-configuration.html',
                controller: 'ConfigurationCtrl',
                ncyBreadcrumb: {
                    skip: true
                }
            })

            .state('app.profile', {
                url: '/user/profile',
                templateUrl: 'modules/user/views/profile.html',
                controller: 'UserProfileCtrl',
                ncyBreadcrumb: {
                    label: 'User Profile'
                }
            });
    }
})();

