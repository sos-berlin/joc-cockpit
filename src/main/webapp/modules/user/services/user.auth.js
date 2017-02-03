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
                            
                            config.url = './api/' + config.url;
                            if (SOSAuth.accessTokenId) {
                                config.headers = {
                                    'access_token': SOSAuth.accessTokenId,
                                    'Content-Type': 'application/json'
                                }
                            }
                            if($rootScope.clientLogFilter.state) {
                                var date = new Date();
                                var info = {
                                    message: "START LOADING " + config.url,
                                    logTime: date,
                                    level: 'debug'
                                };
                                config.requestTimeStamp = date.getTime();
                                $rootScope.clientLogs.push(info);
                            }
                        }
                        return config;
                    },
                    responseError: function (rejection) {
                        if ($location.path() != '/login' && (rejection.status == 440 || rejection.status == 401)) {
                            toasty.error({
                                title: 'Session Timeout!',
                                msg: 'Your session has expired and must log in again.',
                                timeout: 10000
                            });
                            SOSAuth.clearUser();
                            SOSAuth.clearStorage();
                            $location.path('/login');
                        } else {
                            if (rejection.data && rejection.data.error && rejection.status != 434)
                                toasty.error({
                                    title: rejection.data.error.code || rejection.status,
                                    msg: rejection.data.error.message || 'API expection',
                                    timeout: 10000
                                });
                            if (rejection.data && rejection.data.errors && rejection.data.errors.length>0 && rejection.status != 434)
                                toasty.error({
                                    msg: rejection.data.errors[0].message || 'API expection',
                                    timeout: 10000
                                });
                        }
                        if(rejection.status == 403) {
                            toasty.warning({
                                title: 'Permission denied',
                                timeout: 6000
                            });
                        }
                        if ($rootScope.clientLogFilter.state) {
                            var error = {
                                message: rejection,
                                logTime: new Date(),
                                level: 'error'
                            };
                            $rootScope.clientLogs.push(error);
                        }

                        return $q.reject(rejection);
                    },
                    response: function (response) {

                        var responseTimeStamp = new Date();
                        if ($location.path()!='/login' && (response.status == 440 || response.status == 401)) {
                            toasty.error({
                                title: 'Session Timeout!',
                                msg: "Your session has expired and must log in again.",
                                timeout: 10000
                            });
                            SOSAuth.clearUser();
                            SOSAuth.clearStorage();
                            $location.path('/login');
                            if($rootScope.clientLogFilter.state) {
                                var error = {
                                    message: response,
                                    logTime: responseTimeStamp,
                                    level: 'error'
                                };
                                $rootScope.clientLogs.push(error);
                            }
                        }else{
                            if(response.config.method=="POST" && response.config.requestTimeStamp) {

                                var info = {
                                    message: "ELAPSED TIME FOR " + response.config.url +" RESPONSE : "+((responseTimeStamp.getTime()-response.config.requestTimeStamp)/1000)+ "s",
                                    logTime: responseTimeStamp,
                                    level: 'debug'
                                };
                                $rootScope.clientLogs.push(info);
                                info = {
                                    message: 'HTTP REQUEST STATUS onComplete '+response.status,
                                    logTime: new Date(),
                                    level: 'debug'
                                };
                                $rootScope.clientLogs.push(info);
                            }
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
