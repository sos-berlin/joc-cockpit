/**
 * Created by sourabhagrawal on 25/09/19.
 */
(function () {
    'use strict';

    angular.module('app')
        .service('EditorService', EditorService);
    EditorService.$inject = ["$resource", "$q"];
    function EditorService($resource, $q) {
        return {
            tree: function (filter) {
                let deferred = $q.defer();
                let File = $resource('tree');
                File.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getFolder: function (filter) {
                let deferred = $q.defer();
                let Tree = $resource('joe/read/folder');
                Tree.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getFile: function (filter) {
                let deferred = $q.defer();
                let File = $resource('joe/read/file');
                File.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            store: function (filter) {
                let deferred = $q.defer();
                let Store = $resource('joe/store');
                Store.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            delete: function (filter) {
                let deferred = $q.defer();
                let Delete = $resource('joe/delete');
                Delete.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            rename: function (filter) {
                let deferred = $q.defer();
                let Rename = $resource('joe/rename');
                Rename.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            deploy: function (filter) {
                let deferred = $q.defer();
                let Deploy = $resource('joe/deploy');
                Deploy.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            toXML: function (filter, objectType) {
                let deferred = $q.defer();
                let XML = $resource('joe/' + objectType + '/toxml');
                XML.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            toJSON: function (filter) {
                let deferred = $q.defer();
                let JSON = $resource('joe/tojson');
                JSON.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            }
        }
    }
})();

