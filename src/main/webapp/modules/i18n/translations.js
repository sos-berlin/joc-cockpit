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
            $resource("/modules/i18n/language_" + $rootScope.locale.lang + ".json").get(function (data) {
               gettextCatalog.setStrings($rootScope.locale.lang, data);
            });

        }]);


})();
