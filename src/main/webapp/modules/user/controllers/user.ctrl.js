/**
 * Created by sourabhagrawal on 30/5/16.
 */

(function () {
    'use strict';

    angular.module('app')
        .controller('LoginCtrl', LoginCtrl)
        .controller('UserProfileCtrl', UserProfileCtrl)
        .controller('AuditLogCtrl', AuditLogCtrl);


    LoginCtrl.$inject = ['SOSAuth', '$location', '$rootScope', 'UserService', '$window', 'JobSchedulerService', 'gettextCatalog','AuditLogService','$resource'];
    function LoginCtrl(SOSAuth, $location, $rootScope, UserService, $window, JobSchedulerService, gettextCatalog,AuditLogService,$resource) {
        var vm = this;
        vm.user = {};
        vm.rememberMe = false;
        $rootScope.error = '';

        function getSchedulerIds(user) {
            JobSchedulerService.getSchedulerIds().then(function (res) {
                if (res && !res.data) {
                    SOSAuth.setIds(res);
                    SOSAuth.save();
                    getUserProfileConfiguration(res.selected,user);
                    getPermissions();
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
        function getComments() {
            AuditLogService.comments().then(function (result) {
                $window.sessionStorage.$SOS$FORCELOGING = result.forceCommentsForAuditLog;
                $window.sessionStorage.comments = JSON.stringify(result.comments);
            });
        }

        function getUserProfileConfiguration(id,user) {
            var configObj = {};
            configObj.jobschedulerId = id;
            configObj.account = user;
            configObj.configurationType = "PROFILE";
            UserService.configuration(configObj).then(function (res) {
                var preferences = {};
                if (res.configuration && res.configuration.configurationItem) {
                    $window.sessionStorage.preferences = JSON.parse(JSON.stringify(res.configuration.configurationItem));
                    document.getElementById('style-color').href = 'css/' + JSON.parse($window.sessionStorage.preferences).theme + '-style.css';
                    preferences = JSON.parse($window.sessionStorage.preferences);
                    $window.localStorage.$SOS$THEME = preferences.theme;
                    if(preferences.locale != $rootScope.locale.lang) {
                        $window.localStorage.$SOS$LANG = preferences.locale;
                        $resource("modules/i18n/language_" + preferences.locale + ".json").get(function (data) {
                            gettextCatalog.setCurrentLanguage(preferences.locale);
                            gettextCatalog.setStrings(preferences.locale, data);
                        });
                    }
                } else {
                    preferences.zone = jstz().timezone_name;
                    preferences.locale = $rootScope.locale.lang;
                    preferences.dateFormat = 'DD.MM.YYYY HH:mm:ss';
                    preferences.maxRecords = 10000;
                    preferences.maxHistoryPerOrder = 30;
                    preferences.maxHistoryPerTask = 10;
                    preferences.maxHistoryPerJobchain = 30;
                    preferences.maxOrderPerJobchain = 5;
                    preferences.maxAuditLogPerObject = 10;
                    preferences.maxEntryPerPage = 1000;
                    preferences.isNewWindow = 'newWindow';
                    preferences.theme = 'light';
                    preferences.showTasks = true;
                    preferences.showOrders = false;
                    if ($window.sessionStorage.$SOS$FORCELOGING === 'true')
                        preferences.auditLog = true;
                    preferences.events = {};

                    preferences.events.filter = JSON.stringify([
                        'JobChainStopped', 'OrderStarted', 'OrderSetback',
                        'OrderSuspended'
                    ]);
                    preferences.events.taskCount = 0;
                    preferences.events.jobCount = 0;
                    preferences.events.jobChainCount = 1;
                    preferences.events.positiveOrderCount = 1;
                    preferences.events.negativeOrderCount = 2;
                    $window.sessionStorage.preferences = JSON.stringify(preferences);

                }

                $rootScope.$broadcast('reloadPreferences');
            }, function () {
                var preferences = {};
                preferences.zone = jstz().timezone_name;
                preferences.locale = $rootScope.locale.lang;
                preferences.dateFormat = 'DD.MM.YYYY HH:mm:ss';
                preferences.maxRecords = 10000;
                preferences.maxHistoryPerOrder = 30;
                preferences.maxHistoryPerTask = 10;
                preferences.maxHistoryPerJobchain = 30;
                preferences.maxOrderPerJobchain = 5;
                preferences.maxAuditLogPerObject = 10;
                preferences.maxEntryPerPage = 1000;
                preferences.isNewWindow = 'newWindow';
                preferences.theme = 'light';
                preferences.showTasks = true;
                preferences.showOrders = false;
                if ($window.sessionStorage.$SOS$FORCELOGING === 'true')
                    preferences.auditLog = true;
                preferences.events = {};

                preferences.events.filter = JSON.stringify([
                    'JobChainStopped', 'OrderStarted', 'OrderSetback',
                    'OrderSuspended'
                ]);
                preferences.events.taskCount = 0;
                preferences.events.jobCount = 0;
                preferences.events.jobChainCount = 1;
                preferences.events.positiveOrderCount = 1;
                preferences.events.negativeOrderCount = 2;
                $window.sessionStorage.preferences = JSON.stringify(preferences);

                $rootScope.$broadcast('reloadPreferences');
            });
        }

        if ($window.localStorage.$SOS$REMEMBER == 'true' || $window.localStorage.$SOS$REMEMBER == true) {
            var urs = CryptoJS.AES.decrypt($window.localStorage.$SOS$FOO.toString(), '$SOSJOBSCHEDULER');
            var pwd = CryptoJS.AES.decrypt($window.localStorage.$SOS$BOO.toString(), '$SOSJOBSCHEDULER');
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
                 $('#loginBtn').text(gettextCatalog.getString("button.logIn"));
                $('#loginBtn').attr("disabled", false);
                vm.user = {};
                $rootScope.$broadcast('reloadUser');

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
                                $window.localStorage.$SOS$FOO = urs;
                                $window.localStorage.$SOS$BOO = pwd;
                                $window.localStorage.$SOS$REMEMBER = vm.rememberMe;
                            } else {
                                $window.localStorage.$SOS$FOO = null;
                                $window.localStorage.$SOS$BOO = null;
                                $window.localStorage.$SOS$REMEMBER = null;
                            }

                            SOSAuth.setUser(response);
                            SOSAuth.save();
                            getSchedulerIds(response.user);
                            getComments();

                        } else {
                            vm.loginError = 'message.loginError';
                        }


                    }, function () {
                        vm.loginError = 'message.loginError';
                        $('#loginBtn').text(gettextCatalog.getString("button.logIn"));
                        $('#loginBtn').attr("disabled", false);

                    });
            }
        };

    }

    UserProfileCtrl.$inject = ['$rootScope', '$window', 'gettextCatalog', "$resource", '$scope','UserService'];
    function UserProfileCtrl($rootScope, $window, gettextCatalog, $resource, $scope,UserService) {
        var vm = this;

        var configObj = {};
        configObj.jobschedulerId =$scope.schedulerIds.selected;
        configObj.account =$scope.permission.user;
        configObj.configurationType ="PROFILE";

        UserService.configuration(configObj).then(function (res) {
            if (res.configuration && res.configuration.account) {
                $window.sessionStorage.preferences = JSON.parse(JSON.stringify(res.configuration.configurationItem));
                vm.preferences = JSON.parse($window.sessionStorage.preferences);
                vm.changeTheme(vm.preferences.theme);
            }
        });

        vm.zones = moment.tz.names();
        vm.locales = $rootScope.locales;
        vm.preferences = JSON.parse($window.sessionStorage.preferences);
        vm.timezone = jstz().timezone_name;
   

        vm.setLocale = function () {
            $window.localStorage.$SOS$LANG = vm.preferences.locale;
            $resource("modules/i18n/language_" + vm.preferences.locale + ".json").get(function (data) {
                gettextCatalog.setCurrentLanguage(vm.preferences.locale);
                gettextCatalog.setStrings(vm.preferences.locale, data);
            });
            configObj.configurationItem = JSON.stringify(vm.preferences);
            UserService.saveConfiguration(configObj);
        };

        if($window.sessionStorage.$SOS$FORCELOGING === 'true'){
            vm.forceLoging = true;
            vm.preferences.auditLog = true;
        }

        vm.changeTheme = function (theme) {
            document.getElementById('style-color').href = 'css/' + theme + '-style.css';
            $window.localStorage.$SOS$THEME = theme;
            configObj.configurationItem = JSON.stringify(vm.preferences);
            UserService.saveConfiguration(configObj);
        };
        vm.changeConfiguration = function (reload) {
           
            if (isNaN(parseInt(vm.preferences.maxRecords))) {
                vm.preferences.maxRecords = parseInt(angular.copy($scope.userPreferences).maxRecords);
            }
            if (isNaN(parseInt(vm.preferences.maxHistoryPerOrder))) {
                vm.preferences.maxHistoryPerOrder = parseInt(angular.copy($scope.userPreferences).maxHistoryPerOrder);
            }
            if (isNaN(parseInt(vm.preferences.maxHistoryPerTask))) {
                vm.preferences.maxHistoryPerTask = parseInt(angular.copy($scope.userPreferences).maxHistoryPerTask);
            }
            if (isNaN(parseInt(vm.preferences.maxAuditLogPerObject))) {
                vm.preferences.maxAuditLogPerObject = parseInt(angular.copy($scope.userPreferences).maxAuditLogPerObject);
            }

            if (isNaN(parseInt(vm.preferences.maxOrderPerJobchain))) {
                vm.preferences.maxOrderPerJobchain = parseInt(angular.copy($scope.userPreferences).maxOrderPerJobchain);
            }
            if (isNaN(parseInt(vm.preferences.maxHistoryPerJobchain))) {
                vm.preferences.maxHistoryPerJobchain = parseInt(angular.copy($scope.userPreferences).maxHistoryPerJobchain);
            }

            $window.sessionStorage.preferences = JSON.stringify(vm.preferences);
            $rootScope.$broadcast('reloadPreferences');

            if (reload)
                $rootScope.$broadcast('reloadDate');

            configObj.configurationItem = JSON.stringify(vm.preferences);
            UserService.saveConfiguration(configObj);
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

        $scope.eventFilter = vm.preferences.events.filter;
        $scope.tasks.count = vm.preferences.events.taskCount;
        $scope.jobs.count = vm.preferences.events.jobCount;
        $scope.jobChains.count = vm.preferences.events.jobChainCount;
        $scope.positiveOrders.count = vm.preferences.events.positiveOrderCount;
        $scope.negativeOrders.count =vm.preferences.events.negativeOrderCount;

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

        var watcher = $scope.$watchCollection('eventFilter', function (value) {
            if(value) {
                vm.preferences.events.taskCount = $scope.tasks.count;
                vm.preferences.events.filter = $scope.eventFilter;
                vm.preferences.events.jobCount = $scope.jobs.count;
                vm.preferences.events.jobChainCount = $scope.jobChains.count;
                vm.preferences.events.positiveOrderCount = $scope.positiveOrders.count;
                vm.preferences.events.negativeOrderCount = $scope.negativeOrders.count;
                $window.sessionStorage.preferences = JSON.stringify(vm.preferences);
                $rootScope.$broadcast('reloadPreferences');
            }
        });

        $scope.$on('$destroy', function () {
            watcher();
        });
    }

    AuditLogCtrl.$inject = ["$scope", "AuditLogService", "CoreService", "$window"];
    function AuditLogCtrl($scope, AuditLogService, CoreService, $window) {
        var vm = $scope;
        vm.maxEntryPerPage = vm.userPreferences.maxEntryPerPage;
        vm.adtLog = CoreService.getAuditLogTab();

        vm.tree = {};
        vm.expanding_property = {
            field: "name"
        };
        vm.auditSearch = {};
        var auditSearch = false;

        vm.sortBy = function (propertyName) {
            vm.adtLog.sortReverse = !vm.adtLog.sortReverse;
            vm.adtLog.filter.sortBy = propertyName;
        };

        function setDateRange(filter) {

            if (vm.adtLog.filter.date == 'all') {

            } else if (vm.adtLog.filter.date == 'today') {
                var from = new Date();
                var to = new Date();
                from.setHours(0);
                from.setMinutes(0);
                from.setSeconds(0);
                from.setMilliseconds(0);
                to.setDate(to.getDate() + 1);
                to.setHours(0);
                to.setMinutes(0);
                to.setSeconds(0);
                to.setMilliseconds(0);

                filter.dateFrom = from;
                filter.dateTo = to;
            } else {
                filter.dateFrom = vm.adtLog.filter.date;
            }
            return filter;
        }


        vm.filter_tree = {};
        vm.load = function () {
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj = setDateRange(obj);
            AuditLogService.getLogs(obj).then(function (result) {
                vm.auditLogs = result.auditLog;
                vm.isLoading = true;
            }, function () {
                vm.isLoading = true;
            });
        };
        vm.load();

        vm.search = function () {
            var filter = {
                jobschedulerId: $scope.schedulerIds.selected,
                limit: parseInt($window.sessionStorage.preferences.maxRecords)
                };

            vm.adtLog.filter.date = '';
            if (vm.auditSearch.jobChain) {
                filter.orders = [];
                if (vm.auditSearch.orderIds) {
                    var s = vm.auditSearch.orderIds.replace(/,\s+/g, ',');
                    var orderIds = s.split(',');
                    angular.forEach(orderIds, function (value) {
                        filter.orders.push({jobChain: vm.auditSearch.jobChain, orderId: value})
                    });
                } else {
                    filter.orders.push({jobChain: vm.auditSearch.jobChain})
                }
            }
            if (vm.auditSearch.job) {
                filter.jobs = [];
                var s = vm.auditSearch.job.replace(/,\s+/g, ',');
                var jobs = s.split(',');
                angular.forEach(jobs, function (value) {
                    filter.jobs.push({job: value})
                });
            }
            if (vm.auditSearch.regex) {
                filter.regex =vm.auditSearch.regex;
            }

            if (vm.auditSearch.from) {
                var fromDate = new Date(vm.auditSearch.from);
                if (vm.auditSearch.fromTime) {

                    fromDate.setHours(vm.auditSearch.fromTime.getHours());
                    fromDate.setMinutes(vm.auditSearch.fromTime.getMinutes());
                    fromDate.setSeconds(vm.auditSearch.fromTime.getSeconds());
                    fromDate.setMilliseconds(0);
                } else {
                    fromDate.setHours(0);
                    fromDate.setMinutes(0);
                    fromDate.setSeconds(0);
                    fromDate.setMilliseconds(0);
                }
                filter.dateFrom = fromDate;
            }
            if (vm.auditSearch.to) {
                var toDate = new Date(vm.auditSearch.to);
                if (vm.auditSearch.toTime) {

                    toDate.setHours(vm.auditSearch.toTime.getHours());
                    toDate.setMinutes(vm.auditSearch.toTime.getMinutes());
                    toDate.setSeconds(vm.auditSearch.toTime.getSeconds());
                    toDate.setMilliseconds(0);
                } else {
                    toDate.setHours(0);
                    toDate.setMinutes(0);
                    toDate.setSeconds(0);
                    toDate.setMilliseconds(0);
                }
                filter.dateTo = toDate;
            }
            AuditLogService.getLogs(filter).then(function (result) {
                vm.auditLogs = result.auditLog;
                vm.loading = false;
            }, function () {
                vm.loading = false;

            });

        };

        vm.cancel = function () {
            if (!vm.adtLog.filter.date) {
                vm.adtLog.filter.date = 'today';
            }
            vm.showSearchPanel = false;
            vm.auditSearch = {};
            auditSearch = false;

        };

        vm.exportToExcel = function () {
            $('#exportToExcelBtn').attr("disabled", true);
            $('#auditLogTableId').table2excel({
                exclude: ".noExl",
                filename: "jobscheduler-audit-log",
                fileext: ".xls",
                exclude_img: false,
                exclude_links: false,
                exclude_inputs: false
            });
            $('#exportToExcelBtn').attr("disabled", false);
        };
    }
})();
