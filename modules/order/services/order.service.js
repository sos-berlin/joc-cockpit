/**
 * Created by sourabhagrawal on 31/05/16.
 */

(function () {
    'use strict';

    angular.module('app')
        .service('OrderService', OrderService);

    OrderService.$inject = ["$resource", "$q", "apiUrl"];
    function OrderService($resource, $q, apiUrl) {
        return {
            jobSelected:undefined,
            get: function (filter) {

                var deferred = $q.defer();
                var Orders = $resource(apiUrl + 'orders');
                Orders.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            getSimulated: function (res) {

                var deferred = $q.defer();
                deferred.resolve(res);
                return deferred.promise;
            },
            getOrdersP: function (filter) {

                var deferred = $q.defer();
                var Orders = $resource(apiUrl + 'orders/p');
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
                var Orders = $resource(apiUrl + 'orders/p');
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
                var Orders = $resource(apiUrl + 'orders');
                Orders.save({orders: jobChains,jobschedulerId:jobschedulerId}, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            log: function (filter) {
                var deferred = $q.defer();
                var Orders = $resource(apiUrl + 'order/log');
                Orders.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            getSnapshot: function (filter) {
                var deferred = $q.defer();

                var Snapshot = $resource(apiUrl + 'orders/overview/snapshot');
                Snapshot.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            getConfiguration: function (path,jobschedulerId) {
                var deferred = $q.defer();
                var Configuration = $resource(apiUrl + 'order/configuration');
                Configuration.save({order: path,jobschedulerId:jobschedulerId}, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            setOrderState: function (orders) {
                var deferred = $q.defer();
                var Order = $resource(apiUrl + 'orders/set_state');
                Order.save(orders, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            setRunTime: function (orders) {
                var deferred = $q.defer();
                var Order = $resource(apiUrl + 'orders/set_run_time');
                Order.save(orders,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            startOrder: function (orders) {
                var deferred = $q.defer();
                var Order = $resource(apiUrl + 'orders/start');
                Order.save(orders,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            suspendOrder: function (orders) {

                var deferred = $q.defer();
                var Order = $resource(apiUrl + 'orders/suspend');
                Order.save(orders,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            resumeOrder: function (orders) {

                var deferred = $q.defer();
                var Order = $resource(apiUrl + 'orders/resume');
                Order.save(orders,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            resetOrder: function (orders) {

                var deferred = $q.defer();
                var Order = $resource(apiUrl + 'orders/reset');
                Order.save(orders,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            removeOrder: function (orders) {

                var deferred = $q.defer();
                var Order = $resource(apiUrl + 'orders/remove');
                Order.save(orders, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            deleteOrder: function (orders) {
                var deferred = $q.defer();
                var Order = $resource(apiUrl + 'orders/delete');
                Order.save(orders,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            addOrder: function (orders) {
                var deferred = $q.defer();
                var Order = $resource(apiUrl + 'orders/add');
                Order.save(orders,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            getRunTime: function (orders) {
                var deferred = $q.defer();
                var Order = $resource(apiUrl + 'order/run_time');
                Order.save(orders,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            historys: function (filter) {
                var deferred = $q.defer();
                var History = $resource(apiUrl + 'orders/history');
                History.save(filter,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            histories: function (filter) {
                var deferred = $q.defer();
                var History = $resource(apiUrl + 'orders/history');
                History.save(filter,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            history: function (filter) {
                var deferred = $q.defer();
                var History = $resource(apiUrl + 'order/history');
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

