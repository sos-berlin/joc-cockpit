/**
 * Created by sourabhagrawal on 31/05/16.
 */

(function () {
    'use strict';

    angular.module('app')
        .service('OrderService', OrderService);

    OrderService.$inject = ["$resource", "$q","$window"];
    function OrderService($resource, $q, $window) {
        return {
            jobSelected:undefined,
            get: function (filter) {

                var deferred = $q.defer();
                var Orders = $resource('orders');
                Orders.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },

            getOrdersP: function (filter) {

                var deferred = $q.defer();
                var Orders = $resource('orders/p');
                Orders.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },

            getOrderP: function (filter) {
                var deferred = $q.defer();
                var Orders = $resource('order/p');
                Orders.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getOrder: function (filter) {
                var deferred = $q.defer();
                var Orders = $resource('order');
                Orders.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            log: function (filter) {

                var deferred = $q.defer();
                var Snapshot = $resource('order/log');
                Snapshot.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });

                return deferred.promise;
            },

            getSnapshot: function (filter) {
                var deferred = $q.defer();

                var Snapshot = $resource('orders/overview/snapshot');
                Snapshot.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },

            getSummary: function (filter) {
                var deferred = $q.defer();

                var Summary = $resource('orders/overview/summary');
                Summary.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getConfiguration: function (path,orderId,jobschedulerId) {
                var deferred = $q.defer();

                var Configuration = $resource('order/configuration');
                Configuration.save({jobChain: path,orderId:orderId,jobschedulerId:jobschedulerId,mime:['HTML'] }, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            setOrderState: function (orders) {
                var deferred = $q.defer();
                var Order = $resource('orders/set_state');
                Order.save(orders, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            setRunTime: function (orders) {
                var deferred = $q.defer();
                var Order = $resource('orders/set_run_time');
                Order.save(orders,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            startOrder: function (orders) {
                var deferred = $q.defer();
                var Order = $resource('orders/start');
                Order.save(orders,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            suspendOrder: function (orders) {

                var deferred = $q.defer();
                var Order = $resource('orders/suspend');
                Order.save(orders,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            resumeOrder: function (orders) {

                var deferred = $q.defer();
                var Order = $resource('orders/resume');
                Order.save(orders,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            resetOrder: function (orders) {

                var deferred = $q.defer();
                var Order = $resource('orders/reset');
                Order.save(orders,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            removeOrder: function (orders) {

                var deferred = $q.defer();
                var Order = $resource('orders/remove');
                Order.save(orders, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            deleteOrder: function (orders) {
                var deferred = $q.defer();
                var Order = $resource('orders/delete');
                Order.save(orders,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            addOrder: function (orders) {
                var deferred = $q.defer();
                var Order = $resource('orders/add');
                Order.save(orders,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getRunTime: function (orders) {
                var deferred = $q.defer();
                var Order = $resource('order/run_time');
                Order.save(orders,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            histories: function (filter) {
                var deferred = $q.defer();
                var History = $resource('orders/history');
                History.save(filter,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            history: function (filter) {
                var deferred = $q.defer();
                filter.limit=$window.localStorage.$SOS$MAXHISTORYPERORDER;
                var History = $resource('order/history');
                History.save(filter,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            tree: function (filter) {
                var deferred = $q.defer();
                var Tree = $resource('tree');
                Tree.save(filter,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            }

        }
    }


})();

