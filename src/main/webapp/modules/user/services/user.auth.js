/**
 * Created by sourabhagrawal on 4/7/16.
 */

(function () {
    'use strict';
    angular.module('app')
        .config(["$httpProvider", function ($httpProvider) {
            $httpProvider.defaults.withCredentials = true;

            $httpProvider.interceptors.push(["$q", "$location", "$rootScope", "SOSAuth", function ($q, $location, $rootScope, SOSAuth) {
                return {
                   request: function (config) {
                        if (SOSAuth.accessTokenId) {
                            config.headers = {
                                'access_token': SOSAuth.accessTokenId,
                                'Content-Type': 'application/json'
                            }
                        }
                        return config;

                    },
                    responseError: function (rejection) {
                        if($location.path()!== '/login')
                        if (rejection.status === 401) {
                            SOSAuth.clearUser();
                            SOSAuth.clearStorage();
                            if ($location.path() != '/') {
                                $location.path('/');
                            }
                        }
                        return $q.reject(rejection);
                    }
                };
            }]);
        }])
        .config(['$compileProvider', function ($compileProvider) {
            $compileProvider.debugInfoEnabled(false);

        }]);

})();
