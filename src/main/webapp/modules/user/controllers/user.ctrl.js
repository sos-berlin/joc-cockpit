/**
 * Created by sourabhagrawal on 30/5/16.
 */

(function () {
    'use strict';

    angular.module('app')
        .controller('LoginCtrl', LoginCtrl)
        .controller('UserProfileCtrl', UserProfileCtrl);


    LoginCtrl.$inject = ['SOSAuth', '$location', '$rootScope', 'UserService', '$window', 'JobSchedulerService', 'gettextCatalog'];
    function LoginCtrl(SOSAuth, $location, $rootScope, UserService, $window, JobSchedulerService, gettextCatalog) {
        var vm = this;
        vm.user = {};
        vm.rememberMe = false;
        $rootScope.error = '';




        function getSchedulerIds(response) {
            JobSchedulerService.getSchedulerIds().then(function (res) {
                if (res && !res.data) {
                    SOSAuth.setIds(res);
                    SOSAuth.save();
                    getPermissions(response);
                } else {
                    $location.path('/error');
                }
            }, function (err) {
                $rootScope.$broadcast('reloadUser');
                if (err.data && err.data.message)
                    $rootScope.error = err.data.message;
                else
                    $rootScope.error = err.data.error.message;

                $location.path('/error');
            });
        }

        if ($window.localStorage.$SOS$REMEMBERME == 'true' || $window.localStorage.$SOS$REMEMBERME == true) {
            var urs = CryptoJS.AES.decrypt($window.localStorage.$SOS$USERNAME.toString(), '$SOSJOBSCHEDULER');
            var pwd = CryptoJS.AES.decrypt($window.localStorage.$SOS$PASSWORD.toString(), '$SOSJOBSCHEDULER');
            vm.user.username = urs.toString(CryptoJS.enc.Utf8);
            vm.user.password = pwd.toString(CryptoJS.enc.Utf8);
            vm.rememberMe = true;
        }

        function getPermissions() {

            vm.schedulerIds = JSON.parse(SOSAuth.scheduleIds);

            UserService.getPermissions(vm.schedulerIds.selected).then(function (permission) {
                SOSAuth.setPermission(permission);
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
                $('#loginBtn').text(gettextCatalog.getString("button.processing") + '...');
                $('#loginBtn').attr("disabled", true);

                SOSAuth.currentUserData = null;

                UserService.authenticate(
                    vm.user.username,
                    vm.user.password
                ).then(function (response) {
                        if (response && response.isAuthenticated) {
                            SOSAuth.accessTokenId = response.accessToken;
                            SOSAuth.rememberMe = vm.rememberMe;
                            if (vm.rememberMe) {
                                var urs = CryptoJS.AES.encrypt(vm.user.username, '$SOSJOBSCHEDULER');
                                var pwd = CryptoJS.AES.encrypt(vm.user.username, '$SOSJOBSCHEDULER');
                                $window.localStorage.$SOS$USERNAME = urs;
                                $window.localStorage.$SOS$PASSWORD = pwd;
                                $window.localStorage.$SOS$REMEMBERME = vm.rememberMe;
                            } else {
                                $window.localStorage.$SOS$USERNAME = null;
                                $window.localStorage.$SOS$PASSWORD = null;
                                $window.localStorage.$SOS$REMEMBERME = null;
                            }

                            SOSAuth.setUser(response);
                            SOSAuth.save();
                            getSchedulerIds();

                        } else {
                            vm.loginError = 'message.loginError';
                        }
                        $('#loginBtn').text(gettextCatalog.getString("button.logIn"));
                        $('#loginBtn').attr("disabled", false);

                    }, function () {
                        vm.loginError = 'message.loginError';
                        $('#loginBtn').text(gettextCatalog.getString("button.logIn"));
                        $('#loginBtn').attr("disabled", false);

                    });
            }
        };

    }

    UserProfileCtrl.$inject = ['$rootScope', '$window', 'gettextCatalog', "$resource", '$scope'];
    function UserProfileCtrl($rootScope, $window, gettextCatalog, $resource, $scope) {
        var vm = this;

        vm.zones = moment.tz.names();

        vm.perferences = {};

        vm.locales = $rootScope.locales;
        vm.perferences.locale = $rootScope.locale;

        vm.timezone = jstz().timezone_name;
        vm.perferences.zone = $window.localStorage.$SOS$ZONE;
        vm.perferences.dateFormat = $window.localStorage.$SOS$DATEFORMAT;
        vm.perferences.maxRecords = parseInt($window.localStorage.$SOS$MAXRECORDS);
        vm.perferences.maxHistoryPerOrder = parseInt($window.localStorage.$SOS$MAXHISTORYPERORDER);
        vm.perferences.maxHistoryPerTask = parseInt($window.localStorage.$SOS$MAXHISTORYPERTASK);
        vm.perferences.maxHistoryPerJobchain = parseInt($window.localStorage.$SOS$MAXHISTORYPERJOBCHAIN);
        vm.perferences.maxOrderPerJobchain = parseInt($window.localStorage.$SOS$MAXORDERPERJOBCHAIN);
        vm.perferences.isNewWindow = $window.localStorage.$SOS$ISNEWWINDOW;
        vm.perferences.showTasks = $window.localStorage.$SOS$SHOWTASKS === 'true';

        vm.setLocale = function () {
            vm.locale = vm.perferences.locale;
            $rootScope.locale = vm.locale;
            $window.localStorage.$SOS$LANG = vm.locale.lang;
            $resource("modules/i18n/language_" + vm.locale.lang + ".json").get(function (data) {
                gettextCatalog.setCurrentLanguage(vm.locale.lang);
                gettextCatalog.setStrings(vm.locale.lang, data);
            });

        };

        vm.setTimeZone = function () {
            $window.localStorage.$SOS$ZONE = vm.perferences.zone;
            $rootScope.$broadcast('reloadDate');
        };

        vm.setDateFormat = function () {
            $window.localStorage.$SOS$DATEFORMAT = vm.perferences.dateFormat;
            $rootScope.$broadcast('reloadDate');
        };
        vm.changePerferences = function () {
            $window.localStorage.$SOS$ISNEWWINDOW = vm.perferences.isNewWindow;
            $window.localStorage.$SOS$SHOWTASKS = vm.perferences.showTasks;

            if (isNaN(parseInt(vm.perferences.maxRecords))) {
                vm.perferences.maxRecords = parseInt($window.localStorage.$SOS$MAXRECORDS);
            } else {
                $window.localStorage.$SOS$MAXRECORDS = parseInt(vm.perferences.maxRecords);
            }
            if (isNaN(parseInt(vm.perferences.maxHistoryPerOrder))) {
                vm.perferences.maxHistoryPerOrder = parseInt($window.localStorage.$SOS$MAXHISTORYPERORDER);
            } else {
                $window.localStorage.$SOS$MAXHISTORYPERORDER = parseInt(vm.perferences.maxHistoryPerOrder);
            }
            if (isNaN(parseInt(vm.perferences.maxHistoryPerTask))) {
                vm.perferences.maxHistoryPerTask = parseInt($window.localStorage.$SOS$MAXHISTORYPERTASK);
            } else {
                $window.localStorage.$SOS$MAXHISTORYPERTASK = parseInt(vm.perferences.maxHistoryPerTask);
            }
            if (isNaN(parseInt(vm.perferences.maxOrderPerJobchain))) {
                vm.perferences.maxOrderPerJobchain = parseInt($window.localStorage.$SOS$MAXORDERPERJOBCHAIN);
            } else {
                $window.localStorage.$SOS$MAXORDERPERJOBCHAIN = parseInt(vm.perferences.maxOrderPerJobchain);
            }
            if (isNaN(parseInt(vm.perferences.maxHistoryPerJobchain))) {
                vm.perferences.maxHistoryPerJobchain = parseInt($window.localStorage.$SOS$MAXHISTORYPERJOBCHAIN);
            } else {
                $window.localStorage.$SOS$MAXHISTORYPERJOBCHAIN = parseInt(vm.perferences.maxHistoryPerJobchain);
            }
        };

        $scope.tasks = [
            {value: 'TaskStarted', label: "label.taskStarted"},
            {value: 'TaskEnded', label: "label.taskEnded"},
            {value: 'TaskClosed', label: "label.taskClosed"}
        ];
        $scope.jobs = [
            {value: 'JobStopped', label: "label.jobStopped"},
            {value: 'JobPending', label: "label.jobPending"}
        ];
        $scope.jobChains = [
            {value: 'JobChainStopped', label: "label.jobChainStopped"},
            {value: 'JobChainPending', label: "label.jobChainPending"},
            {value: 'JobChainRunning', label: "label.jobChainUnstopped"}
        ];

        $scope.positiveOrders = [
            {value: 'OrderStarted', label: "label.orderStarted"},
            {value: 'OrderStepStarted', label: "label.orderStepStarted"},
            {value: 'OrderStepEnded', label: "label.orderStepEnded"},
            {value: 'OrderNodeChanged', label: "label.orderNodeChanged"},
            {value: 'OrderResumed', label: "label.orderResumed"},
            {value: 'OrderFinished', label: "label.orderFinished"}
        ];

        $scope.negativeOrders = [
            {value: 'OrderSetback', label: "label.orderSetback"},
            {value: 'OrderSuspended', label: "label.orderSuspended"}

        ];



        $scope.eventFilter = JSON.parse($window.localStorage.$SOS$EVENTFILTER);
        $scope.tasks.count = $window.localStorage.$SOS$EVENTFILTERTASKCOUNT;
        $scope.jobs.count = $window.localStorage.$SOS$EVENTFILTERJOBCOUNT;
        $scope.jobChains.count = $window.localStorage.$SOS$EVENTFILTERJOBCHAINCOUNT;
        $scope.positiveOrders.count = $window.localStorage.$SOS$EVENTFILTERPOSITIVEORDERCOUNT;
        $scope.negativeOrders.count = $window.localStorage.$SOS$EVENTFILTERNEGATIVEORDERCOUNT;

        if ($scope.tasks.length == $scope.tasks.count) {
            $scope.selectAllTaskModel = true;
        }
        if ($scope.jobs.length == $scope.jobs.count) {
            $scope.selectAllJobModel = true;
        }
        if ($scope.jobChains.length == $scope.jobChains.count) {
            $scope.selectAllJobChainModel = true;
        }
        if ($scope.positiveOrders.length == $scope.positiveOrders.count) {
            $scope.selectAllPositiveOrderModel = true;
        }
        if ($scope.negativeOrders.length == $scope.negativeOrders.count) {
            $scope.selectAllNegativeOrderModel = true;
        }


        vm.selectAllTaskFunction = function (value) {

            if (value) {
                angular.forEach($scope.tasks, function (value1) {
                    var flag = true;
                    angular.forEach($scope.eventFilter, function (value2) {
                        if (value1.value == value2) {
                            flag = false;
                        }
                    });

                    if (flag) {
                        $scope.eventFilter.push(value1.value);
                    }
                });
                $scope.tasks.count = $scope.tasks.length;
            }
            else {
                angular.forEach($scope.tasks, function (value1) {
                    $scope.eventFilter.splice($scope.eventFilter.indexOf(value1.value), 1);
                });
                $scope.tasks.count = 0;
            }
        };

        vm.selectTaskFunction = function (checked) {
            if (checked) {
                $scope.tasks.count++;
            }
            else {
                $scope.tasks.count--;
            }

            $scope.selectAllTaskModel = $scope.tasks.length == $scope.tasks.count;

        };


        vm.selectAllJobFunction = function (value) {

            if (value) {

                angular.forEach($scope.jobs, function (value1) {
                    var flag = true;
                    angular.forEach($scope.eventFilter, function (value2) {
                        if (value1.value == value2) {
                            flag = false;
                        }
                    });

                    if (flag) {
                        $scope.eventFilter.push(value1.value);
                    }
                });

                $scope.jobs.count = $scope.jobs.length;
            }
            else {
                angular.forEach($scope.jobs, function (value1) {
                    $scope.eventFilter.splice($scope.eventFilter.indexOf(value1.value), 1);
                });
                $scope.jobs.count = 0;

            }


        };

        vm.selectJobFunction = function (checked) {
            if (checked) {
                $scope.jobs.count++;
            }
            else {
                $scope.jobs.count--;
            }

            $scope.selectAllJobModel = $scope.jobs.length == $scope.jobs.count;

        };


        vm.selectAllJobChainFunction = function (value) {

            if (value) {
                angular.forEach($scope.jobChains, function (value1) {
                    var flag = true;
                    angular.forEach($scope.eventFilter, function (value2) {
                        if (value1.value == value2) {
                            flag = false;
                        }
                    });

                    if (flag) {
                        $scope.eventFilter.push(value1.value);
                    }
                });
                $scope.jobChains.count = $scope.jobChains.length;
            }
            else {
                angular.forEach($scope.jobChains, function (value1) {
                    $scope.eventFilter.splice($scope.eventFilter.indexOf(value1.value), 1);
                });
                $scope.jobChains.count = 0;
            }
        };

        vm.selectJobChainFunction = function (checked) {
            if (checked) {
                $scope.jobChains.count++;
            }
            else {
                $scope.jobChains.count--;
            }
            $scope.selectAllJobChainModel = $scope.jobChains.length == $scope.jobChains.count;
        };


        vm.selectAllPositiveOrderFunction = function (value) {

            if (value) {
                angular.forEach($scope.positiveOrders, function (value1) {
                    var flag = true;
                    angular.forEach($scope.eventFilter, function (value2) {
                        if (value1.value == value2) {
                            flag = false;
                        }
                    });

                    if (flag) {
                        $scope.eventFilter.push(value1.value);
                    }
                });
                $scope.positiveOrders.count = $scope.positiveOrders.length;
            }
            else {
                angular.forEach($scope.positiveOrders, function (value1) {
                    $scope.eventFilter.splice($scope.eventFilter.indexOf(value1.value), 1);
                });
                $scope.positiveOrders.count = 0;
            }
        };

        vm.selectPositiveOrderFunction = function (checked) {
            if (checked) {
                $scope.positiveOrders.count++;
            }
            else {
                $scope.positiveOrders.count--;
            }
            $scope.selectAllPositiveOrderModel = $scope.positiveOrders.length == $scope.positiveOrders.count;
        };

        vm.selectAllNegativeOrdersFunction = function (value) {
            if (value) {
                angular.forEach($scope.negativeOrders, function (value1) {
                    var flag = true;
                    angular.forEach($scope.eventFilter, function (value2) {
                        if (value1.value == value2) {
                            flag = false;
                        }
                    });
                    if (flag) {
                        $scope.eventFilter.push(value1.value);
                    }
                });
                $scope.negativeOrders.count = $scope.negativeOrders.length;
            }
            else {
                angular.forEach($scope.negativeOrders, function (value1) {
                    $scope.eventFilter.splice($scope.eventFilter.indexOf(value1.value), 1);
                });
                $scope.negativeOrders.count = 0;
            }
        };

        vm.selectNegativeOrderFunction = function (checked) {
            if (checked) {
                $scope.negativeOrders.count++;

            }
            else {
                $scope.negativeOrders.count--;

            }

            $scope.selectAllNegativeOrderModel = $scope.negativeOrders.length == $scope.negativeOrders.count;
        };

        var watcher = $scope.$watchCollection('eventFilter', function () {
            $window.localStorage.$SOS$EVENTFILTERTASKCOUNT = $scope.tasks.count;
            $window.localStorage.$SOS$EVENTFILTER = JSON.stringify($scope.eventFilter);
            $window.localStorage.$SOS$EVENTFILTERJOBCOUNT = $scope.jobs.count;
            $window.localStorage.$SOS$EVENTFILTERJOBCHAINCOUNT = $scope.jobChains.count;
            $window.localStorage.$SOS$EVENTFILTERPOSITIVEORDERCOUNT = $scope.positiveOrders.count;
            $window.localStorage.$SOS$EVENTFILTERNEGATIVEORDERCOUNT = $scope.negativeOrders.count;
        });

        $scope.$on('$destroy', function () {
            watcher();
        });
    }
})();
