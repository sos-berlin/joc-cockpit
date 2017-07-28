/**
 * Created by sourabhagrawal on 4/7/16.
 */

(function () {
    'use strict';
    angular.module('app')
        .config(["$httpProvider", function ($httpProvider) {

            $httpProvider.interceptors.push(["$q", "$location", "$rootScope", "SOSAuth", "toasty", "$window", function ($q, $location, $rootScope, SOSAuth, toasty, $window) {

                return {
                    request: function (config) {

                        if (config.method == 'POST' || config.url.match('jobscheduler/log?')) {

                            if (SOSAuth.accessTokenId) {
                                if (config.url.match('security/permission')) {
                                    config.headers = {
                                        'access_token': SOSAuth.accessTokenId,
                                        'X-Access-Token': SOSAuth.accessTokenId,
                                        'Content-Type': 'application/json',
                                        'Accept': 'application/json'
                                    }
                                } else {
                                    config.headers = {
                                        'access_token': SOSAuth.accessTokenId,
                                        'X-Access-Token': SOSAuth.accessTokenId,
                                        'Content-Type': 'application/json'
                                    }
                                }
                            }
                            config.url = './api/' + config.url;
                            if ($rootScope.clientLogFilter.isEnable && !config.url.match('touch')) {
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
                        if($location.path() != '/login') {
                            if ((rejection.status == 440 || rejection.status == 401)) {
                                toasty.error({
                                    title: 'message.sessionTimeout',
                                    msg: 'message.sessionExpired',
                                    timeout: 10000
                                });
                                $window.localStorage.$SOS$URL = $location.path();
                                $window.localStorage.$SOS$URLPARAMS = JSON.stringify($location.search());
                                SOSAuth.clearUser();
                                SOSAuth.clearStorage();
                                $location.path('/login');
                            } else {
                                if ((rejection.data && rejection.data.error && rejection.status != 434 && rejection.data.error.code && rejection.data.error.code !='JOC-402' && rejection.data.error.code !='JOC-400' ))
                                    toasty.error({
                                        title: rejection.data.error.code || rejection.status,
                                        msg: rejection.data.error.message || 'API expection',
                                        timeout: 10000
                                    });
                                if (rejection.data && rejection.data.errors && rejection.data.errors.length > 0 && rejection.status != 434)
                                    toasty.error({
                                        msg: rejection.data.errors[0].message || 'API expection',
                                        timeout: 10000
                                    });
                            }
                        }

                        if ($rootScope.clientLogFilter.isEnable) {
                            var error = {
                                message: rejection,
                                logTime: new Date(),
                                level: 'error'
                            };
                            $rootScope.clientLogs.push(error);
                        }

                        if(rejection.config && rejection.config.url.match('events') && rejection.status ==-1){
                            $rootScope.$broadcast('reloadEvents');
                        }

                        return $q.reject(rejection);
                    },
                    response: function (response) {
                        var responseTimeStamp = new Date();
                        if ($location.path() != '/login' && (response.status == 440 || response.status == 401)) {
                            toasty.error({
                                title: 'message.sessionTimeout',
                                msg: 'message.sessionExpired',
                                timeout: 10000
                            });
                            $window.localStorage.$SOS$URL = $location.path();
                            $window.localStorage.$SOS$URLPARAMS = JSON.stringify($location.search());
                            SOSAuth.clearUser();
                            SOSAuth.clearStorage();
                            $location.path('/login');
                            if ($rootScope.clientLogFilter.isEnable) {
                                var error = {
                                    message: response,
                                    logTime: responseTimeStamp,
                                    level: 'error'
                                };
                                $rootScope.clientLogs.push(error);
                            }
                        } else {
                            if (response.config.method == "POST" && response.config.requestTimeStamp) {

                                var info = {
                                    message: "ELAPSED TIME FOR " + response.config.url + " RESPONSE : " + ((responseTimeStamp.getTime() - response.config.requestTimeStamp) / 1000) + "s",
                                    logTime: responseTimeStamp,
                                    level: 'debug'
                                };
                                $rootScope.clientLogs.push(info);
                                info = {
                                    message: 'HTTP REQUEST STATUS onComplete ' + response.status,
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
