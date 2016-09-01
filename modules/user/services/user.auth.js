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

        }])
        .run(["$rootScope", "gettextCatalog", "$window", function ($rootScope, gettextCatalog, $window) {

            $rootScope.locales = {
                'de': {
                    lang: 'de',
                    country: 'DE',
                    name: gettextCatalog.getString('Deutsch ( German )')
                },
                'en': {
                    lang: 'en',
                    country: 'US',
                    name: gettextCatalog.getString('English')
                },

                'fr': {
                    lang: 'fr',
                    country: 'FR',
                    name: gettextCatalog.getString('French')
                },
                'ja': {
                    lang: 'ja',
                    country: 'JA',
                    name: gettextCatalog.getString('Japanese')
                }

            };

            var lang = $window.localStorage.$SOS$LANG || navigator.language || navigator.userLanguage;

            $rootScope.locale = $rootScope.locales[lang];

            if ($rootScope.locale === undefined) {
                $rootScope.locale = $rootScope.locales[lang];
                if ($rootScope.locale === undefined) {
                    $rootScope.locale = $rootScope.locales['en'];
                }
            }
            if (!$window.localStorage.$SOS$ZONE) {
                $window.localStorage.$SOS$ZONE = jstz().timezone_name;
            }
            if (!$window.localStorage.$SOS$DATEFORMAT) {
                $window.localStorage.$SOS$DATEFORMAT = 'hh:mm A | DD.MM.YYYY';
            }
            gettextCatalog.setCurrentLanguage($rootScope.locale.lang);

        }]);
})();
