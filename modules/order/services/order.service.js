/**
 * Created by sourabhagrawal on 31/05/16.
 */

(function () {
    'use strict';

    angular.module('app')
        .service('OrderService', OrderService);

    OrderService.$inject = ["$resource", "$q", "APIUrl"];
    function OrderService($resource, $q, APIUrl) {
        return {
            get: function (filter) {

                var deferred = $q.defer();
                var Orders = $resource(APIUrl + 'orders');
                Orders.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            getOrdersP: function (filter) {

                var deferred = $q.defer();
                var Orders = $resource(APIUrl + 'orders/p');
                Orders.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },

            getJobOrdersP: function (jobChain,jobschedulerId) {
                var deferred = $q.defer();
                var jobChains = [];
                jobChains.job_chain = jobChain;
                var Orders = $resource(APIUrl + 'orders/p');
                Orders.save({orders: jobChains,jobschedulerId:jobschedulerId}, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            getJobOrders: function (jobChain, jobschedulerId) {
                var deferred = $q.defer();
                var jobChains = [];
                jobChains.job_chain = jobChain;
                var Orders = $resource(APIUrl + 'orders');
                Orders.save({orders: jobChains,jobschedulerId:jobschedulerId}, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            log: function (filter) {

                var deferred = $q.defer();
                var Orders = $resource(APIUrl + 'order/log');
                Orders.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            getSnapshot: function (filter) {
                var deferred = $q.defer();

                var Snapshot = $resource(APIUrl + 'orders/overview/snapshot');
                Snapshot.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            getConfiguration: function (path,jobschedulerId) {
                var deferred = $q.defer();
                var Configuration = $resource(APIUrl + 'order/configuration');
                Configuration.save({order: path,jobschedulerId:jobschedulerId}, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            setOrderState: function (orders) {
                var deferred = $q.defer();
                var Order = $resource(APIUrl + 'orders/setState');
                Order.save(orders, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            setRunTime: function (orders) {
                var deferred = $q.defer();
                var Order = $resource(APIUrl + 'orders/set_run_time');
                Order.save(orders,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            startOrder: function (orders) {
                var deferred = $q.defer();
                var Order = $resource(APIUrl + 'orders/start');
                Order.save(orders,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            suspendOrder: function (orders) {

                var deferred = $q.defer();
                var Order = $resource(APIUrl + 'orders/suspend');
                Order.save(orders,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            resumeOrder: function (orders) {

                var deferred = $q.defer();
                var Order = $resource(APIUrl + 'orders/resume');
                Order.save(orders,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            resetOrder: function (orders) {

                var deferred = $q.defer();
                var Order = $resource(APIUrl + 'orders/reset');
                Order.save(orders,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            removeOrder: function (orders) {

                var deferred = $q.defer();
                var Order = $resource(APIUrl + 'orders/remove');
                Order.save(orders, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            deleteOrder: function (orders) {
                var deferred = $q.defer();
                var Order = $resource(APIUrl + 'orders/delete');
                Order.save(orders,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            addOrder: function (orders) {
                var deferred = $q.defer();
                var Order = $resource(APIUrl + 'orders/add');
                Order.save(orders,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            history: function (filter) {
                var deferred = $q.defer();
                var History = $resource(APIUrl + 'orders/history');
                History.save(filter,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            }

        }
    }


})();

