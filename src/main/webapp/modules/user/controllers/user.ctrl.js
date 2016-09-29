/**
 * Created by sourabhagrawal on 30/5/16.
 */

(function () {
    'use strict';

    angular.module('app')
        .controller('LoginCtrl', LoginCtrl)
        .controller('UserProfileCtrl', UserProfileCtrl);


    LoginCtrl.$inject = ['SOSAuth', '$location', '$rootScope', 'UserService', '$window','JobSchedulerService', 'toasty','gettextCatalog'];
    function LoginCtrl(SOSAuth, $location, $rootScope, UserService, $window, JobSchedulerService,toasty,gettextCatalog) {
        var vm = this;
        vm.user = {};
        vm.rememberMe = false;

        function getSchedulerIds(response) {
            JobSchedulerService.getSchedulerIds().then(function (res) {
                if(res && !res.data) {
                    SOSAuth.setIds(res);
                    SOSAuth.save();
                    getPermissions(response);
                }else{
                    toasty.error({
                       title: gettextCatalog.getString('message.oops'),
                       msg: gettextCatalog.getString('message.errorInLoadingScheduleIds')
                    });
                }
            });
        }

        function getPermissions(response) {

            vm.schedulerIds = JSON.parse(SOSAuth.scheduleIds);

            UserService.getPermissions(vm.schedulerIds.selected).then(function (permission) {
                SOSAuth.setUser(response, permission);
                SOSAuth.save();
                if ($window.sessionStorage.getItem('$SOS$URL') && $window.sessionStorage.getItem('$SOS$URL') != 'null') {

                    $location.path($window.sessionStorage.getItem('$SOS$URL')).search(JSON.parse($window.sessionStorage.getItem('$SOS$URLPARAMS')));
                } else {
                    $location.path('/');
                }
                vm.user = {};
                $rootScope.$broadcast('reloadUser');

            }, function (err) {

            });
        }

        vm.login = function () {
            if (vm.user.username && vm.user.password) {
                $('#loginBtn').text(gettextCatalog.getString("button.processing")+'...');
                vm.isProcessing = true;
                SOSAuth.currentUserData = null;

                UserService.authenticate(
                    vm.user.username,
                    vm.user.password
                ).then(function (response) {
                        if (response && response.isAuthenticated) {
                            SOSAuth.accessTokenId = response.accessToken;
                            SOSAuth.rememberMe = vm.rememberMe;
                             getSchedulerIds(response);

                        } else {
                            vm.loginError = 'message.loginError';
                        }
                        $('#loginBtn').text("Sign In");
                        vm.isProcessing = false;
                    }, function (err) {
                        vm.loginError = 'message.loginError';
                        $('#loginBtn').text("Sign In");
                        vm.isProcessing = false;
                    });
            }
        };

    }

    UserProfileCtrl.$inject = ['$rootScope', '$window', 'gettextCatalog', "$resource"];
    function UserProfileCtrl($rootScope, $window, gettextCatalog, $resource) {
        var vm = this;

        vm.zones = moment.tz.names();

        vm.perferences = {};

        vm.locales = $rootScope.locales;
        vm.perferences.locale = $rootScope.locale;

        vm.timezone = jstz().timezone_name;
        vm.perferences.zone = $window.localStorage.$SOS$ZONE;
        vm.perferences.dateFormat = $window.localStorage.$SOS$DATEFORMAT;


        vm.setLocale = function () {
            // set the current lang
            vm.locale = vm.perferences.locale;
            $rootScope.locale = vm.locale;
            $window.localStorage.$SOS$LANG = vm.locale.lang;
            // You can change the language during runtime

            $resource("modules/i18n/language_" + vm.locale.lang + ".json").get(function (data) {
               gettextCatalog.setCurrentLanguage(vm.locale.lang);
               gettextCatalog.setStrings(vm.locale.lang, data);
            });


        };

        vm.setTimeZone = function () {
            // set the current time zone
            $window.localStorage.$SOS$ZONE = vm.perferences.zone;
            $rootScope.$broadcast('reloadDate');
        };

        vm.setDateFormat = function(){
            $window.localStorage.$SOS$DATEFORMAT = vm.perferences.dateFormat;
            $rootScope.$broadcast('reloadDate');
        };

    }


})();
