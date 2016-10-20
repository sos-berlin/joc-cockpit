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

                            if ($rootScope.configData[config.url]) {
                                config.url = $rootScope.configData['WEB_SERVER_URL']+ config.url;
                            }
                            else {
                                config.url = $rootScope.configData['MOCK_URL']+ config.url;
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
                          if ($location.path()!='/login' && (rejection.status == 440 || rejection.status == 401)) {
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
                        if ($location.path()!='/login' && (response.status == 440 || response.status == 401)) {
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
