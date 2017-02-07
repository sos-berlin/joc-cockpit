/**
 * Created by sourabhagrawal on 07/09/16.
 */
(function () {
    'use strict';
    angular.module('app')
        .run(["$rootScope", "gettextCatalog", "$window", "$resource", function ($rootScope, gettextCatalog, $window, $resource) {
            $rootScope.locales = {
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
                'de': {
                    lang: 'de',
                    country: 'DE',
                    name: 'German'
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

            $resource("modules/i18n/language_" + $rootScope.locale.lang + ".json").get(function (data) {
                gettextCatalog.setStrings($rootScope.locale.lang, data);
                gettextCatalog.setCurrentLanguage($rootScope.locale.lang);
            });
        }]);
})();
