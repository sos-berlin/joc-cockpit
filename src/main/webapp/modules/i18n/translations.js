/**
 * Created by sourabhagrawal on 07/09/16.
 */
(function () {
    'use strict';
    angular.module('app')
        .run(["$rootScope", "gettextCatalog", "$window", "$resource", function ($rootScope, gettextCatalog, $window, $resource) {
            $rootScope.locales = {
                'de': {
                    lang: 'de',
                    country: 'DE',
                    name: 'German'
                },
                'en': {
                    lang: 'en',
                    country: 'US',
                    name: 'English'
                },
                'fr': {
                    lang: 'fr',
                    country: 'FR',
                    name: 'French'
                },
                'ja': {
                    lang: 'ja',
                    country: 'JA',
                    name: 'Japanese'
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
                $window.localStorage.$SOS$DATEFORMAT = 'DD.MM.YYYY HH:mm:ss';
            }

            if (!$window.localStorage.$SOS$MAXRECORDS) {
                $window.localStorage.$SOS$MAXRECORDS = 10000;
            }
            if (!$window.localStorage.$SOS$MAXHISTORYPERORDER) {
                $window.localStorage.$SOS$MAXHISTORYPERORDER = 30;
            }
            if (!$window.localStorage.$SOS$MAXHISTORYPERTASK) {
                $window.localStorage.$SOS$MAXHISTORYPERTASK = 10;
            }
            if (!$window.localStorage.$SOS$MAXHISTORYPERJOBCHAIN) {
                $window.localStorage.$SOS$MAXHISTORYPERJOBCHAIN = 30;
            }
            if (!$window.localStorage.$SOS$MAXORDERPERJOBCHAIN) {
                $window.localStorage.$SOS$MAXORDERPERJOBCHAIN = 5;
            }
            if (!$window.localStorage.$SOS$ISNEWWINDOW) {
                $window.localStorage.$SOS$ISNEWWINDOW = 'newWindow';
            }
            if(!$window.localStorage.$SOS$SHOWTASKS){
                $window.localStorage.$SOS$SHOWTASKS = true;
            }

            if (!$window.localStorage.$SOS$EVENTFILTER) {
                $window.localStorage.$SOS$EVENTFILTER = JSON.stringify([
                    'JobChainStopped', 'OrderStarted', 'OrderSetback',
                    'OrderSuspended'
                ]);
                $window.localStorage.$SOS$EVENTFILTERTASKCOUNT = 0;
                $window.localStorage.$SOS$EVENTFILTERJOBCOUNT = 0;
                $window.localStorage.$SOS$EVENTFILTERJOBCHAINCOUNT = 1;
                $window.localStorage.$SOS$EVENTFILTERPOSITIVEORDERCOUNT = 1;
                $window.localStorage.$SOS$EVENTFILTERNEGATIVEORDERCOUNT = 2;
            }

            $resource("modules/i18n/language_" + $rootScope.locale.lang + ".json").get(function (data) {
                gettextCatalog.setStrings($rootScope.locale.lang, data);
                gettextCatalog.setCurrentLanguage($rootScope.locale.lang);
            });
        }]);
})();