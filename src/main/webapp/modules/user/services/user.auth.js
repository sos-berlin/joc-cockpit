/**
 * Created by sourabhagrawal on 4/7/16.
 */

(function () {
    'use strict';
    angular.module('app')
        .config(["$httpProvider", function ($httpProvider) {

            $httpProvider.interceptors.push(["$q", "$location", "$rootScope", "SOSAuth", "toasty", function ($q, $location, $rootScope, SOSAuth, toasty) {
                return {
                    request: function (config) {
                        if (config.method == 'POST') {
                            var temp = config.url.substring(config.url.lastIndexOf('api') + 4);
                            if ($rootScope.configData[temp]) {
                                config.url = 'http://uk.sos-berlin.com:8888/joc/api/' + temp;
                            }
                            else {
                                config.url = 'http://test.sos-berlin.com:3001/joc/api/' + temp;
                            }
                            if (SOSAuth.accessTokenId) {
                                config.headers = {
                                    'access_token': SOSAuth.accessTokenId,
                                    'Content-Type': 'application/json'
                                }
                            }
                        }
                        return config;

                    },
                    responseError: function (rejection) {
                          if (rejection.status == 440) {
                            toasty.error({
                                title: 'Login Timeout!',
                                msg: 'Your session has expired and must log in again.'
                            });
                            SOSAuth.clearUser();
                            SOSAuth.clearStorage();
                            $location.path('/login');
                        }
                        return $q.reject(rejection);
                    },
                    response: function (response) {
                        if (response.status == 440) {
                            toasty.error({
                                title: 'Login Timeout!',
                                msg: "Your session has expired and must log in again."
                            });
                            SOSAuth.clearUser();
                            SOSAuth.clearStorage();
                            $location.path('/login');
                        }
                        return response;
                    }
                };
            }]);
        }])
        .config(['$compileProvider', function ($compileProvider) {
            $compileProvider.debugInfoEnabled(false);

        }]);

})();
