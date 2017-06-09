/**
 * Created by sourabhagrawal on 30/5/16.
 */

(function () {
    'use strict';

    angular.module('app')
        .controller('LoginCtrl', LoginCtrl)
        .controller('UserProfileCtrl', UserProfileCtrl)
        .controller('AuditLogCtrl', AuditLogCtrl)
        .controller('UsersCtrl', UsersCtrl)
        .controller('PermissionCtrl', PermissionCtrl);


    LoginCtrl.$inject = ['SOSAuth', '$location', '$rootScope', 'UserService', '$window', 'JobSchedulerService', 'gettextCatalog', 'AuditLogService'];
    function LoginCtrl(SOSAuth, $location, $rootScope, UserService, $window, JobSchedulerService, gettextCatalog, AuditLogService) {
        var vm = this;
        vm.user = {};
        vm.rememberMe = false;
        if (!$window.sessionStorage.errorMsg)
            $rootScope.error = '';
        else
            $rootScope.error = $window.sessionStorage.errorMsg;

        function getSchedulerIds() {
            $window.sessionStorage.errorMsg = '';
            JobSchedulerService.getSchedulerIds().then(function (res) {
                SOSAuth.setIds(res);
                SOSAuth.save();
                getComments();
                getPermissions();
            }, function (err) {
                $rootScope.$broadcast('reloadUser');
                if (err.data && err.data.message)
                    $window.sessionStorage.errorMsg = err.data.message;
                else if (err.data.error)
                    $window.sessionStorage.errorMsg = err.data.error.message;
                else
                    $window.sessionStorage.errorMsg = 'Internal server error';
                $rootScope.error = $window.sessionStorage.errorMsg;
                $location.path('/error');
            });

        }

        function getComments() {
            AuditLogService.comments().then(function (result) {
                $window.sessionStorage.$SOS$FORCELOGING = result.forceCommentsForAuditLog;
                $window.sessionStorage.comments = JSON.stringify(result.comments);
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
                if ($window.localStorage.$SOS$URL && $window.localStorage.$SOS$URL != 'null') {

                    $location.path($window.localStorage.$SOS$URL).search(JSON.parse($window.localStorage.$SOS$URLPARAMS));
                    $window.localStorage.setItem('$SOS$URL', '');
                    $window.localStorage.setItem('$SOS$URLPARAMS', {});
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
            $window.sessionStorage.errorMsg = '';
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
                                var pwd = CryptoJS.AES.encrypt(vm.user.password, '$SOSJOBSCHEDULER');
                                $window.localStorage.$SOS$FOO = urs;
                                $window.localStorage.$SOS$BOO = pwd;
                                $window.localStorage.$SOS$REMEMBER = vm.rememberMe;
                            } else {
                                $window.localStorage.setItem('$SOS$FOO', null);
                                $window.localStorage.setItem('$SOS$BOO', null);
                                $window.localStorage.setItem('$SOS$REMEMBER', null);
                            }

                            SOSAuth.setUser(response);
                            SOSAuth.save();
                            getSchedulerIds(response.user);

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
        if (!$scope.permission) {
            return;
        }

        var configObj = {};
        configObj.jobschedulerId = $scope.schedulerIds.selected;
        configObj.account = $scope.permission.user;
        configObj.configurationType = "PROFILE";
        configObj.id = parseInt($window.sessionStorage.preferenceId);


        vm.zones = moment.tz.names();
        vm.locales = $rootScope.locales;

        if ($window.sessionStorage.preferences)
            vm.preferences = JSON.parse($window.sessionStorage.preferences);
        vm.timezone = jstz().timezone_name;
        function setPreferences() {
            if ($window.sessionStorage.preferences && $window.sessionStorage.preferences != 'undefined') {
                vm.preferences = JSON.parse($window.sessionStorage.preferences);
            }
        }

        $scope.$on('reloadPreferences', function () {
            setPreferences();
        });

        vm.setLocale = function () {
            $window.localStorage.$SOS$LANG = vm.preferences.locale;
            $resource("modules/i18n/language_" + vm.preferences.locale + ".json").get(function (data) {
                gettextCatalog.setCurrentLanguage(vm.preferences.locale);
                gettextCatalog.setStrings(vm.preferences.locale, data);
            });
            configObj.configurationItem = JSON.stringify(vm.preferences);
            $window.sessionStorage.preferences = JSON.stringify(vm.preferences);
            UserService.saveConfiguration(configObj);
        };

        if ($window.sessionStorage.$SOS$FORCELOGING === 'true') {
            vm.forceLoging = true;
            vm.preferences.auditLog = true;
        }

        vm.changeTheme = function (theme) {
            document.getElementById('style-color').href = 'css/' + theme + '-style.css';
            $window.localStorage.$SOS$THEME = theme;
            if (theme == 'lighter') {
                $('#orders_id img').attr("src", 'images/order.png');
                $('#jobs_id img').attr("src", 'images/job.png');
                $('#dailyPlan_id img').attr("src", 'images/daily_plan1.png');
                $('#resources_id img').attr("src", 'images/resources1.png');
            } else {
                $('#orders_id img').attr("src", 'images/order1.png');
                $('#jobs_id img').attr("src", 'images/job1.png');
                $('#dailyPlan_id img').attr("src", 'images/daily_plan.png');
                $('#resources_id img').attr("src", 'images/resources.png');
            }
            configObj.configurationItem = JSON.stringify(vm.preferences);
            $window.sessionStorage.preferences = JSON.stringify(vm.preferences);
            UserService.saveConfiguration(configObj);
        };

        vm.changeConfiguration = function (reload) {
         

            if (isNaN(parseInt(vm.preferences.maxRecords))) {
                vm.preferences.maxRecords = parseInt(angular.copy($scope.userPreferences).maxRecords);
            }
            if (isNaN(parseInt(vm.preferences.maxAuditLogRecords))) {
                vm.preferences.maxAuditLogRecords = parseInt(angular.copy($scope.userPreferences).maxAuditLogRecords);
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
            if (vm.preferences.entryPerPage > 100) {
                vm.preferences.entryPerPage = vm.preferences.maxEntryPerPage;
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

        if (!vm.preferences) {
            return;
        }
        if (angular.isArray(vm.preferences.events.filter)) {
            $scope.eventFilter = vm.preferences.events.filter;
        } else {
            $scope.eventFilter = JSON.parse(vm.preferences.events.filter);
        }
        $scope.tasks.count = vm.preferences.events.taskCount;
        $scope.jobs.count = vm.preferences.events.jobCount;
        $scope.jobChains.count = vm.preferences.events.jobChainCount;
        $scope.positiveOrders.count = vm.preferences.events.positiveOrderCount;
        $scope.negativeOrders.count = vm.preferences.events.negativeOrderCount;


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

        var watcher = $scope.$watchCollection('eventFilter', function (newValue, oldValue) {
            if (newValue != oldValue) {
                vm.preferences.events.taskCount = $scope.tasks.count;
                vm.preferences.events.filter = $scope.eventFilter;
                vm.preferences.events.jobCount = $scope.jobs.count;
                vm.preferences.events.jobChainCount = $scope.jobChains.count;
                vm.preferences.events.positiveOrderCount = $scope.positiveOrders.count;
                vm.preferences.events.negativeOrderCount = $scope.negativeOrders.count;
                $window.sessionStorage.preferences = JSON.stringify(vm.preferences);
                $rootScope.$broadcast('reloadPreferences');
                configObj.configurationItem = JSON.stringify(vm.preferences);
                UserService.saveConfiguration(configObj);
            }
        });

        $scope.$on('$destroy', function () {
            watcher();
        });
    }

    AuditLogCtrl.$inject = ["$scope", "AuditLogService", "CoreService"];
    function AuditLogCtrl($scope, AuditLogService, CoreService) {
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
            obj.limit = parseInt(vm.userPreferences.maxAuditLogRecords);
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
                limit: parseInt(vm.userPreferences.maxAuditLogRecords)
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
                filter.regex = vm.auditSearch.regex;
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
            if (vm.auditSearch.account) {
                filter.account = vm.auditSearch.account;
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
            vm.load();
        };

        vm.exportToExcel = function () {
            $('#exportToExcelBtn').attr("disabled", true);
            if (!vm.isIE()) {
                $('#auditLogTableId').table2excel({
                    exclude: ".tableexport-ignore",
                    filename: "jobscheduler-audit-log",
                    fileext: ".xls",
                    exclude_img: false,
                    exclude_links: false,
                    exclude_inputs: false
                });
            } else {
                var ExportButtons = document.getElementById('auditLogTableId');
                var instance = new TableExport(ExportButtons, {
                    formats: ['xlsx'],
                    exportButtons: false
                });
                var exportData = instance.getExportData()['auditLogTableId']['xlsx'];
                instance.export2file(exportData.data, exportData.mimeType, "jobscheduler-audit-log", exportData.fileExtension);
            }
            $('#exportToExcelBtn').attr("disabled", false);
        };
    }

    UsersCtrl.$inject = ['$scope', 'UserService', '$uibModal', '$rootScope', '$location', 'toasty', 'gettextCatalog'];
    function UsersCtrl($scope, UserService, $uibModal, $rootScope, $location, toasty, gettextCatalog) {
        var vm = $scope;

        vm.usr = {};
        vm.usr.currentPage = 1;
        vm.maxEntryPerPage = vm.userPreferences.maxEntryPerPage;
        vm.state = '';
        vm.editor = {};
        vm.editor.edit = false;
        vm.view = {};
        vm.view.pageView = 'tree';

        function get() {
            UserService.securityConfigurationRead({}).then(function (res) {
                vm.users = res.users;
                vm.masters = res.masters;
                getRoles();
                $rootScope.$broadcast('reloadPermission');
            });
        }

        get();
        function getRoles() {
            UserService.permissions({}).then(function (res) {
                vm.roles = res.SOSPermissionRoles.SOSPermissionRole;
            });
        }


        function saveInfo() {
            var obj = {};
            obj.users = vm.users;
            obj.masters = vm.masters;
            UserService.securityConfigurationWrite(obj);

        }

        var temp_name = '', temp_role = '';
        //--------------------ACTION-----------------------
        vm.checkUser = function () {
            vm.isUnique = true;
            angular.forEach(vm.users, function (usr, index) {
                if (usr.user != temp_name && (angular.equals(usr.user, vm.user.user) || usr.user == vm.user.user))
                    vm.isUnique = false;
            });
        };
        vm.checkMaster = function () {
            vm.isUnique = true;
            angular.forEach(vm.masters, function (mast, index) {
                if ((angular.equals(mast.master, vm.master.master) || mast.master == vm.master.master))
                    vm.isUnique = false;
            });
        };
        vm.checkRole = function () {
            vm.isUnique = true;
            for(var j = 0; j<vm.roles.length;j++) {
                if (vm.roles[j] != temp_role && (angular.equals(vm.roles[j], vm.role.role) || vm.roles[j] == vm.role.role)) {
                    vm.isUnique = false;
                    break;
                }
            }
        };
        vm.addUser = function () {
            vm.user = {};
            vm.newUser = true;
            vm.isUnique = true;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/user-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                vm.users.push(vm.user);
                saveInfo();
                vm.user = {};
            }, function () {
                vm.user = {};
            });
        };
        vm.copyUser = function (user) {
            vm.user = angular.copy(user);
            vm.userName = user.user;
            vm.user.user = '';
            vm.copy = true;
            vm.isUnique = true;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/user-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                vm.users.push(vm.user);
                saveInfo();
                vm.user = {};
                vm.copy = false;
            }, function () {
                vm.user = {};
                vm.copy = false;
            });
        };

        vm.editUser = function (user) {
            vm.user = angular.copy(user);
            temp_name = user.user;
            vm.isUnique = true;

            vm.newUser = false;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/user-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                angular.forEach(vm.users, function (usr, index) {
                    if (angular.equals(user, usr))
                        vm.users[index] = vm.user;
                });
                saveInfo();
                vm.user = {};
                if (vm.selectedUser && vm.selectedUser == user.user) {
                    vm.selectedUser = '';
                    selectedMasters = [];
                    selectedRoles = [];
                }
            }, function () {
                vm.user = {};
            });
        };
        vm.deleteUser = function (user) {
            vm.user = angular.copy(user);
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/confirm-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                vm.user = {};
                vm.users.splice(vm.users.indexOf(user), 1);
                saveInfo();
                if (vm.selectedUser && vm.selectedUser == user.user) {
                    vm.selectedUser = '';
                    selectedMasters = [];
                    selectedRoles = [];
                }
            }, function () {
                vm.user = {};
            });
        };
        vm.addRole = function () {
            vm.role = {};
            vm.role.permissions = [];
            vm.role.folders = [];
            vm.newRole = true;
            vm.isUnique = true;
            vm.mstr = {};
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/role-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                vm.roles.push(vm.role.role);
                angular.forEach(vm.masters, function (master, index) {
                    if (angular.equals(master.master, vm.mstr.name) || (master.master =='' && !vm.mstr.name)) {
                        vm.masters[index].roles.push(vm.role);
                    }
                });

                saveInfo();
                vm.role = {};
                if(vm.selectedUser)
                vm.selectUser();
            }, function () {
                vm.role = {};
            });
        };
        vm.editRole = function (role, mast) {
            vm.role = angular.copy(role);
            temp_role = role.role;
            vm.mstr = {};
            vm.mstr.name = mast == '' ? 'default' : angular.copy(mast);

            vm.newRole = false;
            vm.isUnique = true;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/role-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                angular.forEach(vm.masters, function (master, index) {
                    angular.forEach(master.roles, function (value, index1) {
                        if (value.role == temp_role) {
                            vm.masters[index].roles[index1].role = angular.copy(vm.role.role);
                        }
                    });
                });
                for (var i = 0; i < vm.users.length; i++) {
                    for (var j = 0; j < vm.users[i].roles.length; j++) {
                        if (vm.users[i].roles[j] == temp_role) {
                            vm.users[i].roles.splice(j, 1);
                            vm.users[i].roles.push(vm.role.role);
                        }
                    }
                }
                for (var i = 0; i < vm.roles.length; i++) {
                    if (vm.roles[i] == temp_role || angular.equals(vm.roles[i], temp_role)) {
                        vm.roles.splice(i, 1);
                        vm.roles.push(vm.role.role);
                        break;
                    }
                }

                saveInfo();
                vm.role = {};
                temp_role = '';
            }, function () {
                vm.role = {};
                temp_role = '';
            });
        };
        vm.copyRole = function (role,mast) {
            vm.role = angular.copy(role);
            vm.role.role = '';
            vm.rolName = role.role;
            vm.isUnique = true;
            vm.copy = true;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/role-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                 angular.forEach(vm.masters, function (master, index) {
                   if(angular.equals(master,mast)){
                       vm.masters[index].roles.push(vm.role);
                   }
                });
               saveInfo();
                vm.role = {};
                vm.copy = false;
                if(vm.selectedUser)
                vm.selectUser();
            }, function () {
                vm.role = {};
                vm.copy = false;
            });
        };
        vm.deleteRole = function (role, mast) {
            var flag = true;
            for (var i = 0; i < vm.users.length; i++) {
                for (var j = 0; j < vm.users[i].roles.length; j++) {
                    if (vm.users[i].roles[j] == role.role) {
                        flag = false;
                        break;
                    }
                }
            }
            if (!flag) {
                toasty.warning({
                    msg: gettextCatalog.getString('message.cannotDeleteRole'),
                    timeout: 10000
                });
                return;
            }
            vm.role = angular.copy(role);
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/confirm-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                angular.forEach(vm.masters, function (master, index) {
                    if (angular.equals(master.master, mast)) {
                        angular.forEach(master.roles, function (value) {
                            if (angular.equals(value, role))
                                vm.masters[index].roles.splice(vm.masters[index].roles.indexOf(role), 1);
                        });
                    }
                });

                saveInfo();
                vm.role = {};
            }, function () {
                vm.role = {};
            });
        };
        vm.addMaster = function () {
            vm.master = {};
            vm.master.roles = [];
            vm.isUnique = true;
            vm.copy = false;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/master-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                angular.forEach(vm.master.roles, function (value, i) {
                    var role = {};
                    role.permissions = [];
                    role.folders = [];
                    role.role = value;
                    vm.master.roles[i] = role;
                });

                vm.masters.push(vm.master);
                saveInfo();
                vm.master = {};
                if(vm.selectedUser)
                vm.selectUser(vm.selectedUser);
            }, function () {
                vm.master = {};
            });
        };
        vm.copyMaster = function (mast) {
            vm.master = {};
            vm.mastName = mast.master;
            vm.isUnique = true;
            vm.copy = true;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/master-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                vm.master.roles = angular.copy(mast.roles);
                vm.masters.push(vm.master);
                saveInfo();
                vm.master = {};
                if(vm.selectedUser)
                vm.selectUser(vm.selectedUser);
            }, function () {
                vm.master = {};
            });
        };
        vm.deleteMaster = function (mast) {
            vm.master = angular.copy(mast);
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/confirm-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                vm.master = {};
                angular.forEach(vm.masters, function (master, index) {
                    if (angular.equals(master, mast)) {
                        vm.masters.splice(vm.masters.indexOf(mast), 1);
                    }
                });
                saveInfo();
            }, function () {
                vm.master = {};
            });
        };

        var selectedMasters = [];
        var selectedRoles = [];
        vm.selectUser = function (user) {
            vm.selectedUser = user;
            selectedMasters = [];
            selectedRoles = [];
            if (user)
                for (var i = 0; i < vm.users.length; i++) {
                    if (vm.users[i].user == vm.selectedUser && vm.users[i].roles) {
                        selectedRoles = vm.users[i].roles || [];
                        angular.forEach(vm.masters, function (master) {

                            var flag = true;
                            for (var j = 0; j < vm.users[i].roles.length; j++) {
                                for (var x = 0; x < master.roles.length; x++) {
                                    if (master.roles[x].role == vm.users[i].roles[j]) {
                                        selectedMasters.push(master.master);
                                        flag = false;
                                        break;
                                    }
                                }
                                if (!flag) {
                                    break;
                                }
                            }
                        });
                        break;
                    }
                }
        };

        vm.showMaster = function (user) {
            $location.path('/users/master');
            vm.selectUser(user);
        };

        vm.getSelectedMaster = function (master) {
            if (selectedMasters && selectedMasters.length > 0)
                return selectedMasters.indexOf(master.master) > -1;
            else {
                return true;
            }
        };
        vm.getSelectedRole = function (role) {
            if (selectedRoles && selectedRoles.length > 0)
                return selectedRoles.indexOf(role.role) > -1;
            else {
                return true;
            }
        };
        vm.$on('$stateChangeSuccess', function (event, toState, toParams) {
            if (toState.name == 'app.users.user') {
                vm.state = 'user';
            } else if (toState.name == 'app.users.master') {
                vm.state = 'role';
            } else if (toState.name == 'app.users.permission') {
                vm.state = 'permission';
                vm.roleName = toParams.role;
                vm.masterName = toParams.master;
                vm.view.pageView = 'tree';
            }
        });

        vm.addFolder = function () {
            $rootScope.$broadcast('addFolder');
        };
        vm.addPermission = function () {
            $rootScope.$broadcast('addPermission');
        };
    }

    PermissionCtrl.$inject = ['$scope', 'UserService', '$uibModal', '$stateParams', 'ResourceService','$timeout'];
    function PermissionCtrl($scope, UserService, $uibModal, $stateParams, ResourceService, $timeout) {
        var vm = $scope;
        vm.loading = true;

        function getPermissions() {
            UserService.permissions({}).then(function (res) {
                vm.roles = res.SOSPermissionRoles.SOSPermissionRole;
                vm.permissions = res.SOSPermissions;
                if ($stateParams.role && $stateParams.master) {
                    vm.roleName = $stateParams.role;
                    vm.masterName = $stateParams.master;
                }
                loadPermission();
                preparePermissionJSON();
                switchTree();
                vm.loading = false;
            },function(){
                vm.loading = false;
            });
        }

        if (vm.masters)
            getPermissions();
        vm.$on('reloadPermission', function () {
            getPermissions();
        });
        function saveInfo() {
            var obj = {};
            obj.users = vm.users;
            obj.masters = vm.masters;
            UserService.securityConfigurationWrite(obj);

        }

        var permissionNodes = [];
        var count = 1;

        function recursiveUpdate(arr, obj) {
            if (arr._parents.length == 0) {
                arr._parents.push(obj);
            } else {
                recursiveUpdate(arr._parents[0], obj);
            }
        }

        function recursiveUpdate1(permission, arr) {
            var flag = true;
            if (arr[0]._parents) {
                for (var y = 0; y < permission._parents.length; y++) {
                    if (arr[0].name == permission._parents[y].name) {
                        flag = false;
                        recursiveUpdate1(permission._parents[y], arr[0]._parents);
                    }
                }
            }
            if (flag)
                permission._parents.push(arr[0]);
        }

        vm.permissionArr = [];


        function preparePermissionJSON() {

            vm.permissionArr = vm.permissions.SOSPermissionListCommands.SOSPermission;
            vm.permissionArr = vm.permissionArr.concat(vm.permissions.SOSPermissionListJoc.SOSPermission);
            for (var i = 0; i < vm.permissionArr.length; i++) {
                var nodes = vm.permissionArr[i].split(':');

                var arr = [];
                var flag = true, index = 0;
                for (var j = 0; j < nodes.length; j++) {
                    var obj = {};
                    obj.id = count++;
                    obj.name = nodes[j];
                    obj.path = vm.permissionArr[i].substring(0, vm.permissionArr[i].indexOf(nodes[j]));
                    if (j < nodes.length - 1) {
                        obj.icon = 'images/minus.png';
                        obj._parents = [];
                    }
                    if (permissionNodes[0] && permissionNodes[0][j]) {
                        if (permissionNodes[0][j].name == nodes[j]) {
                            flag = false;
                            index = j;
                        } else {
                            if (arr.length == 0) {
                                arr.push(obj);
                            } else if (arr.length > 0) {
                                recursiveUpdate(arr[0], obj);
                            }
                        }
                    } else {
                        if (arr.length == 0) {
                            arr.push(obj);
                        } else if (arr.length > 0) {
                            recursiveUpdate(arr[0], obj);
                        }
                    }
                }
                if (flag)
                    permissionNodes.push(arr);
                else {
                    recursiveUpdate1(permissionNodes[0][index], arr);
                }

            }
        }


        function loadPermission() {
            angular.forEach(vm.masters, function (master, index) {
                if (angular.equals(master.master, vm.masterName) || (master.master == '' && vm.masterName == 'default')) {
                    angular.forEach(master.roles, function (value) {
                        if (angular.equals(value.role, vm.roleName)) {
                            vm.rolePermissions = value.permissions;
                            vm.folderArr = value.folders;
                            vm.originalPermission = angular.copy(vm.rolePermissions);
                        }
                    });
                }
            });
        }

        vm.object = {};
        vm.filter_tree = {};
        vm.folderList = [];
        vm.expanding_property = {
            field: "name"
        };

        vm.getTreeStructure = function () {
            if(!vm.masterName || vm.masterName == 'default'){
                vm.masterName = $scope.schedulerIds.selected;
            }
            ResourceService.tree({jobschedulerId: vm.masterName, compact: true,force:true}).then(function (res) {
                vm.folderList = res.folders;

            }, function () {
                $('#treeModal').modal('hide');
            });

            $('#treeModal').modal('show');
        };

        vm.$on('addFolder', function () {

            vm.folder = {};
            vm.folder.recursive = true;
            vm.newFolder = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/folder-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                if (vm.folder.folder) {
                    if (vm.folder.folder == '/' && vm.folder.recursive) {
                        vm.folder.folder = '/*';
                    }
                    vm.folderArr.push(vm.folder);
                }

                if (vm.folderObj.paths && vm.folderObj.paths.length > 0) {
                    angular.forEach(vm.folderObj.paths, function (path) {
                        vm.folderArr.push({folder: path, recursive: vm.folder.recursive});
                    });
                }
                saveInfo();
                vm.folder = {};
                vm.object = {};
                vm.folderObj.paths = [];
            }, function () {
                vm.folder = {};
                vm.object = {};
                vm.folderObj.paths = [];
            });

        });
        vm.editFolder = function (folder) {
            vm.folder = angular.copy(folder);

            vm.newFolder = false;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/folder-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                if (vm.folder.folder == '/' && vm.folder.recursive) {
                    vm.folder.folder = '/*';
                }
                angular.forEach(vm.folderArr, function (fold, index) {
                    if (angular.equals(folder, fold))
                        vm.folderArr[index] = vm.folder;
                });
                saveInfo();
                vm.folder = {};
            }, function () {
                vm.folder = {};
            });
        };
        vm.deleteFolder = function (folder) {
            vm.folder = angular.copy(folder);
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/confirm-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                vm.folder = {};
                vm.folderArr.splice(vm.folderArr.indexOf(folder), 1);
                saveInfo();
            }, function () {
                vm.folder = {};
            });
        };

        var watcher1 = $scope.$watchCollection('object.paths', function (newNames) {
            if (newNames && newNames.length > 0) {
                vm.paths = newNames;
            }
        });
        vm.folderObj = {};
        vm.folderObj.paths = [];
        vm.addFolderPaths = function () {
            vm.folderObj.paths = vm.paths;
        };
        vm.remove = function (object) {
            vm.folderObj.paths.splice(object, 1);
        };

        function findPermissionObj(permissionNodes, permission) {
            if (permissionNodes._parents) {
                for (var i = 0; i < permissionNodes._parents.length; i++) {
                    if ((permissionNodes._parents[i].path + permissionNodes._parents[i].name) == permission) {
                        permissionNodes._parents[i].selected = false;
                        unSelectedNode(permissionNodes._parents[i]);
                        break;
                    }
                    findPermissionObj(permissionNodes._parents[i], permission);
                }
            } else {
                if ((permissionNodes.path + permissionNodes.name) == permission) {
                    permissionNodes.selected = false;
                }
            }
        }

        function selectPermissionObj(permissionNodes, permission, excluded) {
            if (permissionNodes._parents) {
                for (var i = 0; i < permissionNodes._parents.length; i++) {
                    if ((permissionNodes._parents[i].path + permissionNodes._parents[i].name) == permission) {
                        permissionNodes._parents[i].selected = true;
                        permissionNodes._parents[i].excluded = excluded;
                        selectedNode(permissionNodes._parents[i]);
                        break;
                    }
                    selectPermissionObj(permissionNodes._parents[i], permission);
                }
            } else {
                if ((permissionNodes.path + permissionNodes.name) == permission) {
                    permissionNodes.selected = true;
                    permissionNodes.excluded = excluded;
                }
            }
        }

        function unSelectPermissionObj(permissionNodes, permission) {
            if (permissionNodes._parents) {
                for (var i = 0; i < permissionNodes._parents.length; i++) {
                    if ((permissionNodes._parents[i].path + permissionNodes._parents[i].name) == permission) {
                        permissionNodes._parents[i].excluded = !permissionNodes._parents[i].excluded;
                        break;
                    }
                    unSelectPermissionObj(permissionNodes._parents[i], permission);
                }
            } else {
                if ((permissionNodes.path + permissionNodes.name) == permission) {
                    permissionNodes.excluded = !permissionNodes.excluded;
                }
            }
        }

        vm.deletePermission = function (permission) {
            vm.permission = angular.copy(permission);
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/confirm-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                vm.permission = {};
                vm.rolePermissions.splice(vm.rolePermissions.indexOf(permission), 1);
                saveInfo();
                findPermissionObj(permissionNodes[0][0], permission.path);
                updateDiagramData(permissionNodes[0][0]);
            }, function () {
                vm.permission = {};
            });
        };
        vm.editPermission = function (p) {
            $('#editPermission').modal('show');
            vm.permission = angular.copy(p);
        };

        vm.savePermission = function () {
            $('#editPermission').modal('hide');
            var flag = true;
            for (var i = 0; i < vm.rolePermissions.length; i++) {
                if (vm.rolePermissions[i].path == vm.permission.path) {
                    if (vm.rolePermissions[i].excluded != vm.permission.excluded)
                        vm.rolePermissions[i].excluded = vm.permission.excluded;
                    else
                        flag = false;
                    break;
                }
            }
            if (flag)
                saveInfo();
            unSelectPermissionObj(permissionNodes[0][0], vm.permission.path);
            updateDiagramData(permissionNodes[0][0]);
        };

        vm.$on('addPermission', function () {
            vm.permission = {};
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/permission-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                vm.rolePermissions.push(vm.permission);
                saveInfo();
                selectPermissionObj(permissionNodes[0][0], vm.permission.path, vm.permission.excluded);
                updateDiagramData(permissionNodes[0][0]);
                vm.permission = {};
            }, function () {
                vm.permission = {};
            });
        });

         vm.previousPermission = [];
         vm.originalPermission = [];

        function updatePermissionList(){
            unSelectedNode(permissionNodes[0][0]);
            //console.log(permissionNodes[0][0])
            checkPermissionList(permissionNodes[0][0], angular.copy(vm.rolePermissions));
            //console.log(permissionNodes[0][0])
            updateDiagramData(permissionNodes[0][0]);
            for(var i=0; i<vm.masters.length;i++) {
                if (angular.equals(vm.masters[i].master, vm.masterName) || (vm.masters[i].master == '' && vm.masterName == 'default')) {
                    for(var j=0; j< vm.masters[i].roles.length;j++) {
                        if (angular.equals(vm.masters[i].roles[j].role, vm.roleName)) {
                            vm.masters[i].roles[j].permissions = angular.copy(vm.rolePermissions);
                            break;
                        }
                    }
                    break;
                }
            }
            saveInfo();
        }
        vm.isReset =  false;
        vm.undoPermission = function() {
            vm.rolePermissions = vm.previousPermission[vm.previousPermission.length - 1];
            vm.previousPermission.splice(vm.previousPermission.length - 1, 1);
            if(angular.equals(vm.originalPermission,vm.rolePermissions)){
                vm.isReset =  false;
            }
            updatePermissionList();
        };

        vm.resetPermission = function(){
            vm.rolePermissions = angular.copy(vm.originalPermission);
            vm.previousPermission = [];
            updatePermissionList();
            vm.isReset =  false;
        };

        function checkPermissionListRecursively(permission_node, list) {
            if (permission_node && permission_node._parents) {
                for (var j = 0; j < permission_node._parents.length; j++) {
                    permission_node._parents[j].greyed = true;
                    permission_node._parents[j].selected = false;
                    permission_node._parents[j].excluded = list.excluded;
                    checkPermissionListRecursively(permission_node._parents[j], list);
                }
            }
        }

        function checkPermissionList(permission_node, list) {
            if (list.length > 0) {
                if (permission_node && permission_node._parents) {
                    for (var j = 0; j < permission_node._parents.length; j++) {
                        for (var i = 0; i < list.length; i++) {
                            if (list[i].path == (permission_node._parents[j].path + '' + permission_node._parents[j].name)) {
                                permission_node._parents[j].greyed = false;
                                permission_node._parents[j].selected = true;
                                permission_node._parents[j].excluded = list[i].excluded;
                                checkPermissionListRecursively(permission_node._parents[j], list[i]);
                                list.splice(i, 1);
                                break;
                            }
                        }
                        checkPermissionList(permission_node._parents[j], list);
                    }
                } else {
                    for (var i = 0; i < list.length; i++) {
                        if (list[i].path == (permission_node.path + '' + permission_node.name)) {
                            permission_node.greyed = false;
                            permission_node.selected = true;
                            permission_node.excluded = list[i].excluded;
                            list.splice(i, 1);
                            break;
                        }
                    }
                }
            }
        }

        function selectedNode(permission_node) {
            if (permission_node && permission_node._parents) {
                for (var j = 0; j < permission_node._parents.length; j++) {
                    permission_node._parents[j].greyed = true;
                    permission_node._parents[j].selected = false;
                    selectedNode(permission_node._parents[j]);
                }
            }
        }

        function unSelectedNode(permission_node) {
            if (permission_node && permission_node._parents) {
                for (var j = 0; j < permission_node._parents.length; j++) {
                    permission_node._parents[j].greyed = false;
                    permission_node._parents[j].selected = false;
                    unSelectedNode(permission_node._parents[j]);
                }
            }
        }

        var svg;
        function switchTree () {
            if (!svg) {
                drawTree(permissionNodes[0][0]);
            }
        }
        var root;
        var boxWidth = 180,
            boxHeight = 30,
            duration = 700; // duration of transitions in ms
        var ht = 700;
        var width = window.innerWidth -42;

        function calculateHeight() {
            var headerHt = $('.app-header').height() || 60;
            var topHeaderHt = $('.top-header-bar').height() || 16;
            var subHeaderHt = 59;
            ht = (window.innerHeight - (headerHt + topHeaderHt + subHeaderHt + 150));
            $('.max-tree-panel-ht').css('height', ht + 66 + 'px');
        }
        calculateHeight();

        $(window).resize(function () {
            var headerHt = $('.app-header').height() || 60;
            var topHeaderHt = $('.top-header-bar').height() || 16;
            var subHeaderHt = 59;
            $('.max-tree-panel-ht').css('height', ht + 66 + 'px');
        });
        var t1 = '';

        function drawTree(json) {

            svg = d3.select("#mainTree").append("svg")
                .attr('width', width)
                .attr('height', ht)
                .append('g')
                .attr("transform", "translate(150,300)");

            var tree = d3.layout.tree()
                .nodeSize([100, 250])
                .separation(function () {
                    return .5;
                })

                .children(function (permission_node) {
                    if (permission_node.collapsed) {
                        return;
                    } else {
                        return permission_node._parents;
                    }
                });

            // Start with only the first few generations showing
            json._parents.forEach(function (gen2) {
                gen2._parents.forEach(function (gen3) {
                    collapse(gen3);
                });
            });

            root = json;
            root.x0 = 0;
            root.y0 = 0;
            var _pList = angular.copy(vm.rolePermissions);
            checkPermissionList(root, _pList);
            draw(root);
            var nodes;

            vm.expandAll = expandAll;

            function expandAll() {
                nodes.forEach(function (permission_node) {
                    expand(permission_node);
                });
                $('svg').attr('height', 7150);
                $('svg').attr('width', 2010);
                draw(nodes[0]);
            }

            function expand(permission_node) {
                if (permission_node.collapsed) {
                    permission_node.collapsed = false;
                    if (permission_node.icon)
                        permission_node.icon = "images/minus.png";
                }
                if (permission_node._parents) {
                    permission_node._parents.forEach(expand);
                }
            }

            vm.collapseAll = collapseAll;

            function collapseAll() {
                nodes.forEach(function (permission_node) {
                    collapseNode(permission_node);
                });
                $('svg').attr('height', ht);
                $('svg g').attr('transform', "translate(150,300)");
                $('svg').attr('width', width);
                draw(nodes[0]);
            }

            function collapseNode(permission_node) {
                if (!permission_node.collapsed) {
                    permission_node.collapsed = true;
                    if (permission_node.icon)
                        permission_node.icon = "images/plus.png";
                }
                if (permission_node._parents) {
                    permission_node._parents.forEach(collapseNode);
                }
            }

            function draw(source) {
                nodes = tree.nodes(root);
                var links = tree.links(nodes);

                // Update links
                var link = svg.selectAll("path.link")
                    .data(links, function (d) {
                        return d.target.id;
                    });

                link.enter().append("path")
                    .attr("class", "link")
                    .attr("d", function (d) {
                        var o = {x: source.x0, y: (source.y0 + boxWidth / 2)};
                        return transitionElbow({source: o, target: o});
                    });

                // Update the old links positions
                link.transition()
                    .duration(duration)
                    .attr("d", elbow);

                link.exit()
                    .transition()
                    .duration(duration)
                    .attr("d", function (d) {
                        var o = {x: source.x, y: (source.y + boxWidth / 2)};
                        return transitionElbow({source: o, target: o});
                    })
                    .remove();
                // Update nodes
                var node = svg.selectAll("g.permission_node")
                    .data(nodes, function (permission_node) {

                        return permission_node.id;
                    });

                // Add any new nodes
                var nodeEnter = node.enter().append("g")
                    .attr("class", "permission_node")
                    .style("cursor", function (d) {
                        if (d.name == 'sos') {
                            return "default";
                        }
                        return d.greyed ? "default" : "pointer";
                    })
                    .attr('transform', function () {
                        return 'translate(' + (source.y0 + boxWidth / 2) + ',' + source.x0 + ')';
                    });


                nodeEnter.append("image")
                    .attr("xlink:href", function (d) {
                        return d.icon;
                    })
                    .attr("class", "img")
                    .attr("x", "-12px")
                    .attr("y", "-12px")
                    .attr("width", "24px")
                    .attr("height", "24px")
                    .on('click', togglePermission);

                nodeEnter.append("rect")
                    .style("fill", function (d) {
                        return d.selected ? "#7fbfff" : d.greyed ? "#cce5ff" : "#fff";
                    })
                    .on('click', selectPermission)
                    .attr({
                        x: 0,
                        y: 0,
                        width: 20,
                        height: 0
                    });

                nodeEnter.append("image")
                    .attr("xlink:href", function (d) {
                        return d.excluded ? 'images/permission-minus.png' : 'images/permission-plus.png';
                    })
                    .attr("class", "img exclude-img")
                    .attr("id", function (d) {
                        if (d.path) {
                            return d.path.replace(/:/g, '-') + d.name.replace(/-/g, '')
                        } else return d.name.replace(/-/g, '')
                    })
                    .attr("x", "-80")
                    .attr("y", "-10")
                    .attr("width", "10px")
                    .attr("height", "20px")
                    .on('click', toggleExclude);


                // Draw the permission_node's name and position it inside the box
                nodeEnter.append("text")
                    .attr("dx", 0)
                    .attr("dy", 4)
                    .attr("text-anchor", "start")
                    .attr('class', 'name')
                    .text(function (d) {
                        return d.name;
                    })
                    .on('click', selectPermission)
                    .style('fill-opacity', 0);

                // Update the position of both old and new nodes
                var nodeUpdate = node.transition()
                    .duration(duration)
                    .attr("transform", function (d) {
                        return "translate(" + d.y + "," + d.x + ")";
                    });

                // Grow boxes to their proper size
                nodeUpdate.select('rect')
                    .attr({
                        x: -(boxWidth / 2),
                        y: -(boxHeight / 2),
                        width: boxWidth,
                        height: boxHeight
                    });

                nodeUpdate.select("image")
                    .attr("xlink:href", function (d) {
                        return d.icon;
                    })
                    .attr("x", "90px")
                    .attr("y", "-12px")
                    .attr("width", "15px")
                    .attr("height", "23px");


                // Move text to it's proper position
                nodeUpdate.select('text')
                    .attr("dx", -(boxWidth / 2) + 25)
                    .style('fill-opacity', 1);

                // Remove nodes we aren't showing anymore
                var nodeExit = node.exit()
                    .transition()
                    .duration(duration)

                    // Transition exit nodes to the source's position
                    .attr("transform", function (d) {
                        return "translate(" + (source.y + boxWidth / 2) + "," + source.x + ")";
                    })
                    .remove();

                // Shrink boxes as we remove them
                nodeExit.select('rect')
                    .attr({
                        x: 0,
                        y: 0,
                        width: 0,
                        height: 0
                    });

                // Fade out the text as we remove it
                nodeExit.select('text')
                    .style('fill-opacity', 0)
                    .attr('dx', 0);

                // Stash the old positions for transition.
                nodes.forEach(function (permission_node) {
                    permission_node.x0 = permission_node.x;
                    permission_node.y0 = permission_node.y;
                });
                t1 = $timeout(function () {
                    checkForTop();
                }, 751);
            }

            function updateSize(permission_node) {
                if (permission_node.name != 'sos' && permission_node.name != 'products') {
                    var ht1 = $('svg').attr('height');
                    if (!permission_node.collapsed) {
                        ht1 = parseInt(ht1) + (permission_node._parents.length * 30);
                    } else {
                        ht1 = parseInt(ht1) - (permission_node._parents.length * 30);
                    }
                    if (ht < ht1)
                        $('svg').attr('height', ht1);

                }else{
                    $('svg').attr('height', ht);

                }
                if(permission_node.depth>4){
                     $('svg').attr('width', 2010);
                }else{
                     $('svg').attr('width', width);
                }
            }

            /**
             * Update a permission_node's state when they are clicked.
             */
            function togglePermission(permission_node) {
                if (permission_node.icon)
                    permission_node.icon = "images/minus.png";
                if (permission_node.collapsed) {
                    permission_node.collapsed = false;
                } else {
                    collapse(permission_node);
                }
                draw(permission_node);

                updateSize(permission_node);
            }

            function checkForTop() {
                var diff = 0;
                svg.selectAll('g.permission_node')[0].
                    forEach(function (node) {
                        var tr = d3.transform(node.getAttribute('transform'));
                        if (tr.translate[1] < -285) {
                            if (diff < -(285 + tr.translate[1])) {
                                diff = -(285 + tr.translate[1]);
                            }

                        }
                    });

                if (diff > 0) {
                    svg.selectAll('g.permission_node')[0].
                        forEach(function (node2) {
                            var tr2 = d3.transform(node2.getAttribute('transform'));
                            node2.setAttribute("transform", 'translate(' + tr2.translate[0] + ',' + (tr2.translate[1] + diff) + ')');
                        });

                    svg.selectAll("path.link")
                        .attr("d", function (d) {
                            var sourceX = d.source.x,
                                sourceY = d.source.y + (boxWidth / 2),
                                targetX = d.target.x,
                                targetY = d.target.y - (boxWidth / 2);

                            return "M" + sourceY + "," + (sourceX + diff)
                                + "H" + (sourceY + (targetY - sourceY) / 2)
                                + "V" + (targetX + diff)
                                + "H" + targetY;

                        })
                }
            }

            var _temp = [];

            function generatePermissionList(permission) {
                if (permission._parents) {
                    for (var i = 0; i < permission._parents.length; i++) {
                        if (permission._parents[i]) {
                            if (permission._parents[i].selected || permission._parents[i].excluded) {
                                var obj = {
                                    path: permission._parents[i].path + '' + permission._parents[i].name,
                                    excluded: permission._parents[i].excluded ? true : false
                                };

                                if (_temp.indexOf(obj) == -1)
                                    _temp.push(obj);
                            }
                            generatePermissionList(permission._parents[i]);
                        }
                    }
                }
            }

            function selectPermission(permission_node) {
                var _previousPermissionObj = angular.copy(vm.rolePermissions);

                if (!permission_node.greyed && permission_node.name != 'sos') {
                    permission_node.selected = !permission_node.selected;

                    if (permission_node.selected) {
                        selectedNode(permission_node);
                    } else {
                        unSelectedNode(permission_node);
                    }

                    _temp = [];
                    generatePermissionList(permissionNodes[0][0]);
                    toggleRectangleColour();
                    vm.rolePermissions = _temp;
                    angular.forEach(vm.masters, function (master, index) {
                        if (angular.equals(master.master, vm.masterName) || (master.master == '' && vm.masterName == 'default')) {
                            angular.forEach(master.roles, function (value) {
                                if (angular.equals(value.role, vm.roleName)) {
                                    value.permissions = _temp;
                                    vm.folderArr = value.folders;
                                }
                            });
                        }
                    });

                    saveInfo();
                    if (vm.previousPermission.length === 10) {
                        vm.previousPermission.splice(0, 1);
                    }
                    vm.isReset =  true;
                    vm.previousPermission.push(_previousPermissionObj);
                }
            }

            function toggleExclude(permission_node) {
                permission_node.excluded = !permission_node.excluded;
                _temp = [];
                generatePermissionList(permissionNodes[0][0]);
                toggleRectangleColour();
                vm.rolePermissions = _temp;
                angular.forEach(vm.masters, function (master, index) {
                    if (angular.equals(master.master, vm.masterName) || (master.master == '' && vm.masterName == 'default')) {
                        angular.forEach(master.roles, function (value) {
                            if (angular.equals(value.role, vm.roleName)) {
                                value.permissions = _temp;
                                vm.folderArr = value.folders;
                            }
                        });
                    }
                });
                saveInfo();
            }

            function collapse(permission_node) {
                permission_node.collapsed = true;
                if (permission_node.icon)
                    permission_node.icon = "images/plus.png";
                if (permission_node._parents) {
                    permission_node._parents.forEach(collapse);
                }
            }

            function elbow(d) {
                var sourceX = d.source.x,
                    sourceY = d.source.y + (boxWidth / 2),
                    targetX = d.target.x,
                    targetY = d.target.y - (boxWidth / 2);

                return "M" + sourceY + "," + sourceX
                    + "H" + (sourceY + (targetY - sourceY) / 2)
                    + "V" + targetX
                    + "H" + targetY;
            }

            function transitionElbow(d) {
                return "M" + d.source.y + "," + d.source.x
                    + "H" + d.source.y
                    + "V" + d.source.x
                    + "H" + d.source.y;
            }
        }

        function updateDiagramData(nData) {
            var tree = d3.layout.tree()
                .nodeSize([100, 250])
                .separation(function () {
                    return .5;
                });
            var nodes = tree.nodes(nData);
            svg.selectAll("g.permission_node")
                .data(nodes, function (permission_node) {
                    return permission_node.id;
                });
            toggleRectangleColour();
        }

        function toggleRectangleColour() {
            if (svg) {
                svg.selectAll('rect')
                    .style("fill", function (d) {
                        return d.selected ? "#7fbfff" : d.greyed ? "#cce5ff" : "#fff";
                    });
                svg.selectAll('g.permission_node')
                    .style("cursor", function (d) {
                        if (d.name == 'sos') {
                            return "default";
                        }
                        return d.greyed ? "default" : "pointer";
                    });

                svg.selectAll('.img.exclude-img')
                    .attr("xlink:href", function (d) {
                        return d.excluded ? 'images/permission-minus.png' : 'images/permission-plus.png';
                    })
            }
        }

        $scope.$on('$destroy', function () {
            watcher1();
            if (t1)
                $timeout.cancel(t1);
        });
    }
})();
