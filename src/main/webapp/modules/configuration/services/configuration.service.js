/**
 * Created by sourabhagrawal on 25/09/19.
 */
(function () {
    'use strict';

    angular.module('app')
        .service('EditorService', EditorService);
    EditorService.$inject = ["$resource", "$q", "$http"];
    function EditorService($resource, $q, $http) {
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
            deployables: function (filter) {
                let deferred = $q.defer();
                let Deploy = $resource('joe/deployables');
                Deploy.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            toXML: function (filter, objectType) {
                return $http.post('joe/' + objectType + '/toxml',filter );
            },
            toJSON: function (filter) {
                return $http.post('joe/tojson',filter );
            },
            diff: function(data1, data2) {
                var dmp = new diff_match_patch();
                let a = dmp.diff_main(data1, data2, false);
                let b = dmp.diff_prettyHtml(a);
                let c = b.replace(/(&para;)+/gi, '');
                return c;
            },
            highlight: function(language, data) {
                let str = hljs.highlight(language, data).value;
                let x = str.replace(/(?:\r\n|\r|\n)/g, '<br>');
                return x;
            },

            setLanguage: function(data) {
                if (data === 'shell' || data === 'java' || data === 'javascript' || data === 'powershell') {
                    return data;
                } else if (data === 'dotnet') {
                    return 'vbnet';
                } else if (data === 'perlScript') {
                    return 'perl';
                } else if (data === 'VBScript' || data === 'scriptcontrol:vbscript') {
                    return 'vbscript';
                } else {
                    return 'javascript'
                }
            }
        }
    }
})();

