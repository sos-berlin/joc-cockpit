/**
 * Created by sourabhagrawal on 30/5/16.
 */

(function () {
    'use strict';

    angular.module('app')
        .controller('LoginCtrl', LoginCtrl)
        .controller('UserProfileCtrl', UserProfileCtrl)
        .controller('AuditLogCtrl', AuditLogCtrl)
        .controller('UsersCtrl', UsersCtrl);


    LoginCtrl.$inject = ['SOSAuth', '$location', '$rootScope', 'UserService', '$window', 'JobSchedulerService', 'gettextCatalog', 'AuditLogService'];
    function LoginCtrl(SOSAuth, $location, $rootScope, UserService, $window, JobSchedulerService, gettextCatalog, AuditLogService) {
        var vm = this;
        vm.user = {};
        vm.rememberMe = false;
        if(!$window.sessionStorage.errorMsg)
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
                else if(err.data.error)
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
            $window.sessionStorage.errorMsg ='';
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

        if($window.sessionStorage.preferences)
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
            }else{
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
            if(vm.preferences.entryPerPage>100){
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

    UsersCtrl.$inject = ['$scope', 'UserService', '$uibModal', '$stateParams'];
    function UsersCtrl($scope, UserService, $uibModal, $stateParams) {
        var vm = $scope;
        vm.usr = {};
        vm.usr.currentPage = 1;
        vm.maxEntryPerPage = vm.userPreferences.maxEntryPerPage;
        vm.state = '';
        vm.editor = {};
        vm.editor.edit = false;


        function get() {
            UserService.securityConfigurationRead({}).then(function (res) {
                vm.users = res.users;
                vm.masters = res.masters;
                getPermissions();
            });
        }

        get();

        function getPermissions() {
            UserService.permissions({}).then(function (res) {
                vm.roles = res.SOSPermissionRoles.SOSPermissionRole;
                vm.permissions = res.SOSPermissions;
                if ($stateParams.role && $stateParams.master) {
                    vm.roleName = $stateParams.role;
                    vm.masterName = $stateParams.master;
                }
                loadPermission();
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
            if (!vm.master) {
                vm.master = '';
            }
            angular.forEach(vm.masters, function (master, index) {

                if (angular.equals(master.master, vm.master)) {
                    angular.forEach(master.roles, function (value, index1) {
                        if (value.role != temp_role && (angular.equals(value.role, vm.role.role) || value.role == vm.role.role))
                            vm.isUnique = false;
                    });
                }
            });
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
            }, function () {

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
            }, function () {

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
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/role-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                angular.forEach(vm.masters, function (master, index) {
                    if (angular.equals(master.master, vm.master)) {
                        vm.masters[index].roles.push(vm.role);
                    }
                });
                saveInfo();
            }, function () {

            });
        };
        vm.editRole = function (role, mast) {
            vm.role = angular.copy(role);
            temp_role = role.role;
            vm.master = angular.copy(mast);
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
                    if (angular.equals(master.master, mast)) {
                        angular.forEach(master.roles, function (value, index1) {
                            if (angular.equals(value, role))
                                vm.masters[index].roles[index1].role = vm.role.role;
                        });
                    }
                });

                saveInfo();
            }, function () {

            });
        };
        vm.deleteRole = function (role, mast) {
            vm.role = angular.copy(role);
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/confirm-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                vm.role = {};
                angular.forEach(vm.masters, function (master, index) {
                    if (angular.equals(master.master, mast)) {
                        angular.forEach(master.roles, function (value) {
                            if (angular.equals(value, role))
                                vm.masters[index].roles.splice(vm.masters[index].roles.indexOf(role), 1);
                        });
                    }
                });

                saveInfo();
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
            }, function () {

            });
        };
        vm.copyMaster = function (mast) {
            vm.master = {};
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
            }, function () {

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
        vm.addFolder = function () {
            vm.folder = {};
            vm.newFolder = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/folder-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                vm.folderArr.push(vm.folder);
                saveInfo();
            }, function () {

            });
        };
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
                angular.forEach(vm.folderArr, function (fold, index) {
                    if (angular.equals(folder, fold))
                        vm.folderArr[index] = vm.folder;
                });
                saveInfo();
            }, function () {

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

        vm.savePermission = function () {
            vm.rolePermissions = [];
            for (var i = 0; i < vm.permissionArr.length; i++) {
                if (vm.permissionArr[i].checked) {
                    vm.rolePermissions.push({path: vm.permissionArr[i].permission, excluded: false});
                }
            }

            for (var x = 0; x < vm.masters.length; x++) {
                if (angular.equals(vm.masters[x].master, vm.masterName) || (vm.masters[x].master == '' && vm.masterName == 'default')) {
                    for (var y = 0; y < vm.masters[x].roles.length; y++) {
                        if (angular.equals(vm.masters[x].roles[y].role, vm.roleName)) {
                            vm.masters[x].roles[y].permissions = vm.rolePermissions;
                            break;
                        }
                    }
                    break;
                }
            }
            saveInfo();
        };

        vm.cancelPermission = function () {
            for (var i = 0; i < vm.permissionArr.length; i++) {
                vm.permissionArr[i].checked =  false;
                for (var j = 0; j < vm.rolePermissions.length; j++) {
                    if (vm.permissionArr[i].permission.match(vm.rolePermissions[j].path)) {
                       vm.permissionArr[i].checked =  true;
                        break;
                    }
                }
            }
        };

        vm.permissionArr = [];
        function getPermissionList() {
            var permissionArr = vm.permissions.SOSPermissionListCommands.SOSPermission;
            permissionArr = permissionArr.concat(vm.permissions.SOSPermissionListJoc.SOSPermission);
            for (var i = 0; i < permissionArr.length; i++) {
                var flag = true;
                for (var j = 0; j < vm.rolePermissions.length; j++) {
                    if (permissionArr[i].match(vm.rolePermissions[j].path)) {
                        flag = false;
                        break;
                    }
                }
                if (flag)
                    vm.permissionArr.push({checked: false, permission: permissionArr[i]});
                else
                    vm.permissionArr.push({checked: true, permission: permissionArr[i]});
            }
        }

        function loadPermission() {
            angular.forEach(vm.masters, function (master, index) {
                if (angular.equals(master.master, vm.masterName) || (master.master == '' && vm.masterName == 'default')) {
                    angular.forEach(master.roles, function (value) {
                        if (angular.equals(value.role, vm.roleName)) {
                            vm.rolePermissions = value.permissions;
                            vm.folderArr = value.folders;
                            getPermissionList();
                        }
                    });
                }
            });
        }

        vm.$on('$stateChangeSuccess', function (event, toState, toParams) {
            if (toState.name == 'app.users.user') {
                vm.state = 'user';
            } else if (toState.name == 'app.users.role') {
                vm.state = 'role';
            } else if (toState.name == 'app.users.permission') {
                vm.state = 'permission';
                vm.roleName = toParams.role;
                vm.masterName = toParams.master;
                loadPermission();
            }
        });
    }
})();
