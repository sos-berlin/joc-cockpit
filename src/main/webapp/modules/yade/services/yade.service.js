/**
 * Created by sourabhagrawal on 24/10/17.
 */

(function () {
    'use strict';

    angular.module('app')
        .service('YadeService', YadeService);

    YadeService.$inject = ["$resource", "$q"];
    function YadeService($resource, $q) {
        return {
            getSummary: function (filter) {
                var deferred = $q.defer();
                var Yade = $resource('yade/overview/summary');
                Yade.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getOverview: function (filter) {
                var deferred = $q.defer();
                var Yade = $resource('yade/overview/snapshot');
                Yade.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getTransfers: function (filter) {
                var deferred = $q.defer();
                var Yade = $resource('yade/transfers');
                Yade.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            restart: function (filter) {
                var deferred = $q.defer();
                var Yade = $resource('yade/transfers/restart');
                Yade.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getTransfer: function (filter) {
                var deferred = $q.defer();
                var Yade = $resource('yade/transfer');
                Yade.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            start: function (filter) {
                var deferred = $q.defer();
                var Yade = $resource('yade/transfer/start');
                Yade.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            files: function (filter) {
                var deferred = $q.defer();
                var Yade = $resource('yade/files');
                Yade.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            store: function (filter) {
                var deferred = $q.defer();
                var Yade = $resource('yade/files/store');
                Yade.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            file: function (filter) {
                var deferred = $q.defer();
                var Yade = $resource('yade/file');
                Yade.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            log: function (filter) {
                var deferred = $q.defer();
                var Yade = $resource('yade/log');
                Yade.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            }
        }
    }
})();

