/**
 * Created by sourabhagrawal on 04/09/19.
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
                let Tree = $resource('tree');
                Tree.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            }
        }
    }
})();

