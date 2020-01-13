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


    LoginCtrl.$inject = ['SOSAuth', '$location', '$rootScope', 'UserService', '$window', 'JobSchedulerService', 'gettextCatalog', 'AuditLogService', 'PermissionService'];
    function LoginCtrl(SOSAuth, $location, $rootScope, UserService, $window, JobSchedulerService, gettextCatalog, AuditLogService, PermissionService) {
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
                getPermissions();
            });
        }

        function getComments() {
            AuditLogService.comments().then(function (result) {
                $window.sessionStorage.$SOS$FORCELOGING = result.forceCommentsForAuditLog;
                $window.sessionStorage.comments = JSON.stringify(result.comments);
                $window.sessionStorage.showViews = JSON.stringify(result.showViews);
            });
        }

        if ($window.localStorage.$SOS$REMEMBER == 'true' || $window.localStorage.$SOS$REMEMBER == true) {
            let urs = CryptoJS.AES.decrypt($window.localStorage.$SOS$FOO.toString(), '$SOSJOBSCHEDULER');
            let pwd = CryptoJS.AES.decrypt($window.localStorage.$SOS$BOO.toString(), '$SOSJOBSCHEDULER');
            vm.user.username = urs.toString(CryptoJS.enc.Utf8);
            vm.user.password = pwd.toString(CryptoJS.enc.Utf8);
            vm.rememberMe = true;
        }

        function getPermissions() {
            vm.schedulerIds = JSON.parse(SOSAuth.scheduleIds);
            UserService.getPermissions().then(function (permissions) {
                SOSAuth.setPermissions(permissions);
                SOSAuth.save();
                if(vm.schedulerIds) {
                    PermissionService.savePermission(vm.schedulerIds.selected);
                }else{
                    PermissionService.savePermission('');
                }
                if ($window.localStorage.$SOS$URL && $window.localStorage.$SOS$URL != 'null') {

                    $location.path($window.localStorage.$SOS$URL).search(JSON.parse($window.localStorage.$SOS$URLPARAMS));
                    $window.localStorage.removeItem('$SOS$URL');
                    $window.localStorage.removeItem('$SOS$URLPARAMS');
                } else {
                    $location.path('/');
                }
                $('#loginBtn').text(gettextCatalog.getString("button.logIn"))
                .attr("disabled", false);
                vm.user = {};
                $rootScope.$broadcast('reloadUser');
            });
        }

        vm.login = function () {
            $window.sessionStorage.errorMsg = '';
            $rootScope.error = '';
            vm.loginError = '';
            if (vm.user.username && vm.user.password) {
                $('#loginBtn').text(gettextCatalog.getString("button.processing") + '...')
                    .attr("disabled", true);
                SOSAuth.currentUserData = null;
                UserService.authenticate(
                    vm.user.username,
                    vm.user.password
                ).then(function (response) {
                    if (response && response.isAuthenticated) {
                        SOSAuth.accessTokenId = response.accessToken;
                        SOSAuth.rememberMe = vm.rememberMe;
                        if (vm.rememberMe) {
                            let urs = CryptoJS.AES.encrypt(vm.user.username, '$SOSJOBSCHEDULER');
                            let pwd = CryptoJS.AES.encrypt(vm.user.password, '$SOSJOBSCHEDULER');
                            $window.localStorage.$SOS$FOO = urs;
                            $window.localStorage.$SOS$BOO = pwd;
                            $window.localStorage.$SOS$REMEMBER = vm.rememberMe;
                        } else {
                            $window.localStorage.removeItem('$SOS$FOO');
                            $window.localStorage.removeItem('$SOS$BOO');
                            $window.localStorage.removeItem('$SOS$REMEMBER');
                        }

                        SOSAuth.setUser(response);
                        SOSAuth.save();
                        getSchedulerIds(response.user);

                    } else {
                        vm.loginError = 'message.loginError';
                    }

                }, function (err) {
                    if (err.status === 401) {
                        vm.loginError = 'message.loginError';
                    }else {
                        if(err.data && err.data.error && err.data.error.message) {

                        }else{
                            vm.loginError = 'message.loginError';
                        }
                    }
                    $('#loginBtn').text(gettextCatalog.getString("button.logIn"))
                        .attr("disabled", false);
                });
            }
        };

        function getDefaultConfiguration(){
            UserService.defaultConfiguration().then(function(res){
                if(res.customLogo && res.customLogo.name){
                    let imgUrl = '../ext/images/'+res.customLogo.name;
                    if(res.customLogo.position && res.customLogo.position !== 'BOTTOM'){
                        $('#logo-top').append("<img style='height: "+res.customLogo.height+"' src='"+imgUrl+"'>")
                    }else{
                        $('#logo-bottom').append("<img style='height: "+res.customLogo.height+"' src='"+imgUrl+"'>")
                    }
                }
            });
        }

        getDefaultConfiguration();
    }

    UserProfileCtrl.$inject = ['$rootScope', '$window', 'gettextCatalog', "$resource", '$scope', 'UserService', '$uibModal'];
    function UserProfileCtrl($rootScope, $window, gettextCatalog, $resource, $scope, UserService, $uibModal) {
        var vm = this;
        if (!$scope.permission) {
            return;
        }

        var configObj = {};
        configObj.jobschedulerId = $scope.schedulerIds.selected;
        configObj.account = $scope.permission.user;
        configObj.configurationType = "PROFILE";

        vm.zones = moment.tz.names();
        vm.locales = $rootScope.locales;

        if ($window.sessionStorage.preferences)
            vm.preferences = JSON.parse($window.sessionStorage.preferences);
        var timezone = jstz.determine();
        if(timezone) {
            vm.timezone = timezone.name() || $scope.selectedJobScheduler.timeZone;
        }else{
            vm.timezone = $scope.selectedJobScheduler.timeZone;
        }

        function setPreferences() {
            if ($window.sessionStorage.preferences && $window.sessionStorage.preferences != 'undefined') {
                vm.preferences = JSON.parse($window.sessionStorage.preferences);
            }
        }

        $scope.$on('reloadPreferences', function () {
            setPreferences();
        });

        if(vm.preferences && !vm.preferences.pageView){
            vm.preferences.pageView = 'grid';
        }
        vm.setLocale = function () {
            $window.localStorage.$SOS$LANG = vm.preferences.locale;
            $resource("modules/i18n/language_" + vm.preferences.locale + ".json").get(function (data) {
                gettextCatalog.setCurrentLanguage(vm.preferences.locale);
                gettextCatalog.setStrings(vm.preferences.locale, data);
            });
            configObj.id = parseInt($window.sessionStorage.preferenceId);
            configObj.configurationItem = JSON.stringify(vm.preferences);
            $window.sessionStorage.preferences = JSON.stringify(vm.preferences);
            $rootScope.$broadcast('reloadPreferences');
            UserService.saveConfiguration(configObj);
        };

        if ($window.sessionStorage.$SOS$FORCELOGING === 'true') {
            vm.forceLoging = true;
            vm.preferences.auditLog = true;
        }

        vm.changeTheme = function (theme) {
            document.getElementById('style-color').href = 'css/' + theme + '-style.css';
            $window.localStorage.$SOS$THEME = theme;
            configObj.id = parseInt($window.sessionStorage.preferenceId);
            configObj.configurationItem = JSON.stringify(vm.preferences);
            $window.sessionStorage.preferences = JSON.stringify(vm.preferences);
            UserService.saveConfiguration(configObj);
            $rootScope.$broadcast('reloadPreferences');
        };

        vm.changeConfiguration = function (reload) {
            if (isNaN(parseInt(vm.preferences.maxRecords, 10))) {
                vm.preferences.maxRecords = parseInt(angular.copy($scope.userPreferences).maxRecords, 10);
            }
            if (isNaN(parseInt(vm.preferences.maxAuditLogRecords, 10))) {
                vm.preferences.maxAuditLogRecords = parseInt(angular.copy($scope.userPreferences).maxAuditLogRecords, 10);
            }
            if (isNaN(parseInt(vm.preferences.maxHistoryPerOrder, 10))) {
                vm.preferences.maxHistoryPerOrder = parseInt(angular.copy($scope.userPreferences).maxHistoryPerOrder, 10);
            }
            if (isNaN(parseInt(vm.preferences.maxHistoryPerTask, 10))) {
                vm.preferences.maxHistoryPerTask = parseInt(angular.copy($scope.userPreferences).maxHistoryPerTask, 10);
            }
            if (isNaN(parseInt(vm.preferences.maxAuditLogPerObject, 10))) {
                vm.preferences.maxAuditLogPerObject = parseInt(angular.copy($scope.userPreferences).maxAuditLogPerObject, 10);
            }
            if (isNaN(parseInt(vm.preferences.maxOrderPerJobchain, 10))) {
                vm.preferences.maxOrderPerJobchain = parseInt(angular.copy($scope.userPreferences).maxOrderPerJobchain, 10);
            }
            if (isNaN(parseInt(vm.preferences.maxHistoryPerJobchain, 10))) {
                vm.preferences.maxHistoryPerJobchain = parseInt(angular.copy($scope.userPreferences).maxHistoryPerJobchain, 10);
            }
            if(isNaN(parseInt(vm.preferences.maxNumInOrderOverviewPerObject, 10))){
                vm.preferences.maxNumInOrderOverviewPerObject = parseInt(angular.copy($scope.userPreferences).maxNumInOrderOverviewPerObject, 10);
            }


            if (vm.preferences.entryPerPage > 100) {
                vm.preferences.entryPerPage = vm.preferences.maxEntryPerPage;
            }

            $window.sessionStorage.preferences = JSON.stringify(vm.preferences);
            $rootScope.$broadcast('reloadPreferences');

            if (reload)
                $rootScope.$broadcast('reloadDate');
            configObj.id = parseInt($window.sessionStorage.preferenceId);
            configObj.configurationItem = JSON.stringify(vm.preferences);
            UserService.saveConfiguration(configObj);
        };

        vm.changeView = function () {
            let views = {
                dailyPlan: vm.preferences.pageView,
                jobChain: vm.preferences.pageView,
                job: vm.preferences.pageView,
                order: vm.preferences.pageView,
                agent: vm.preferences.pageView,
                lock: vm.preferences.pageView,
                processClass: vm.preferences.pageView,
                schedule: vm.preferences.pageView,
                jobChainOrder: vm.preferences.pageView,
                orderOverView: vm.preferences.pageView,
                permission: vm.preferences.pageView
            };
            $window.localStorage.views = JSON.stringify(views);
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
        if (!vm.preferences.events) {
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
                    let flag = true;
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
                    let flag = true;
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
                    let flag = true;
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
                configObj.id = parseInt($window.sessionStorage.preferenceId);
                configObj.configurationItem = JSON.stringify(vm.preferences);
                UserService.saveConfiguration(configObj);
            }
        });

        vm.resetProfile = function () {
           
            $scope.profile = {account: $scope.permission.user};
            let modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/confirm-dialog.html',
                controller: 'DialogCtrl',
                scope: $scope,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                //delete profile
                let obj = {accounts: []};
                obj.accounts.push($scope.permission.user);
                UserService.deleteProfile(obj).then(function () {
                    $rootScope.$broadcast('reloadUserProfile');
                    $scope.profile = null;
                });
            }, function () {
                $scope.profile = null;
            });
        };

        $scope.$on('$destroy', function () {
            watcher();
        });
    }

    AuditLogCtrl.$inject = ["$scope", "AuditLogService", "CoreService", "UserService", "SavedFilter", "$uibModal"];
    function AuditLogCtrl($scope, AuditLogService, CoreService, UserService,  SavedFilter, $uibModal) {
        var vm = $scope;
        vm.maxEntryPerPage = vm.userPreferences.maxEntryPerPage;
        vm.adtLog = CoreService.getAuditLogTab();
        vm.adtLog.current = vm.userPreferences.adtLog === 'current';

        vm.changeJobScheduler = function () {
            load();
        };

        vm.tree = {};
        vm.expanding_property = {
            field: "name"
        };
        vm.auditSearch = {};
        var hitSearch = false;
        vm.selectedFiltered = null;
        vm.savedIgnoreList = {};

        vm.savedAuditLogFilter = JSON.parse(SavedFilter.auditLogFilters) || {};
        vm.auditLogFilterList = [];

        if (vm.adtLog.selectedView) {
            vm.savedAuditLogFilter.selected = vm.savedAuditLogFilter.selected || vm.savedAuditLogFilter.favorite;
        }
        else {
            vm.savedAuditLogFilter.selected = undefined;
        }

        vm.sortBy = function (propertyName) {
            vm.adtLog.sortReverse = !vm.adtLog.sortReverse;
            vm.adtLog.filter.sortBy = propertyName;
        };
        $scope.reloadState = 'no';

        vm.reload = function () {
            if ($scope.reloadState == 'no') {
                $scope.auditLogs = [];
                $scope.folderPath = 'Process aborted';
                $scope.reloadState = 'yes';
            } else if ($scope.reloadState == 'yes') {
                $scope.reloadState = 'no';
                vm.isLoading = false;
                load();
            }
        };

        function setDateRange(filter) {
            if (vm.adtLog.filter.date == 'all') {

            } else if (vm.adtLog.filter.date == 'today') {
                filter.dateFrom = '0d';
                filter.dateTo = '0d';
            } else {
                filter.dateFrom = vm.adtLog.filter.date;
            }
            return filter;
        }

        function parseProcessExecuted(regex, obj) {
            var fromDate, toDate;
            if (/^\s*(-)\s*(\d+)(s|h|d|w|M|y)\s*$/.test(regex)) {
                fromDate = /^\s*(-)\s*(\d+)(s|h|d|w|M|y)\s*$/.exec(regex)[0];
            } else if (/^\s*(now\s*\-)\s*(\d+)\s*$/i.test(regex)) {
                let seconds = parseInt(/^\s*(now\s*\-)\s*(\d+)\s*$/i.exec(regex)[2]);
                fromDate = '-' + seconds + 's';
            } else if (/^\s*(Today)\s*$/i.test(regex)) {
                fromDate = '0d';
                toDate = '0d';
            } else if (/^\s*(Yesterday)\s*$/i.test(regex)) {
                fromDate = '-1d';
                toDate = '-1d';
            } else if (/^\s*(now)\s*$/i.test(regex)) {
                fromDate = moment.utc(new Date());
                toDate = fromDate;
            } else if (/^\s*(-)(\d+)(s|h|d|w|M|y)\s*to\s*(-)(\d+)(s|h|d|w|M|y)\s*$/.test(regex)) {
                let date = /^\s*(-)(\d+)(s|h|d|w|M|y)\s*to\s*(-)(\d+)(s|h|d|w|M|y)\s*$/.exec(regex);
               let arr = date[0].split('to');
                fromDate = arr[0].trim();
                toDate = arr[1].trim();

            } else if (/^\s*(-)(\d+)(s|h|d|w|M|y)\s*to\s*(-)(\d+)(s|h|d|w|M|y)\s*[-,+](\d+)(s|h|d|w|M|y)\s*$/.test(regex)) {
                let date = /^\s*(-)(\d+)(s|h|d|w|M|y)\s*to\s*(-)(\d+)(s|h|d|w|M|y)\s*[-,+](\d+)(s|h|d|w|M|y)\s*$/.exec(regex);
                let arr = date[0].split('to');
                fromDate = arr[0].trim();
                toDate = arr[1].trim();

            } else if (/^\s*(-)(\d+)(s|h|d|w|M|y)\s*[-,+](\d+)(s|h|d|w|M|y)\s*to\s*(-)(\d+)(s|h|d|w|M|y)\s*$/.test(regex)) {
                let date = /^\s*(-)(\d+)(s|h|d|w|M|y)\s*[-,+](\d+)(s|h|d|w|M|y)\s*to\s*(-)(\d+)(s|h|d|w|M|y)\s*$/.exec(regex);
                let arr = date[0].split('to');
                fromDate = arr[0].trim();
                toDate = arr[1].trim();

            } else if (/^\s*(-)(\d+)(s|h|d|w|M|y)\s*[-,+](\d+)(s|h|d|w|M|y)\s*to\s*(-)(\d+)(s|h|d|w|M|y)\s*[-,+](\d+)(s|h|d|w|M|y)\s*$/.test(regex)) {
                let date = /^\s*(-)(\d+)(s|h|d|w|M|y)\s*[-,+](\d+)(s|h|d|w|M|y)\s*to\s*(-)(\d+)(s|h|d|w|M|y)\s*[-,+](\d+)(s|h|d|w|M|y)\s*$/.exec(regex);
                let arr = date[0].split('to');
                fromDate = arr[0].trim();
                toDate = arr[1].trim();

            } else if (/^\s*(?:(?:(1[0-2]|0?[0-9]):)?([0-5][0-9]):)?([0-5][0-9])\s?(?:am|pm)\s*to\s*(?:(?:(1[0-2]|0?[0-9]):)?([0-5][0-9]):)?([0-5][0-9])\s?(?:am|pm)\s*$/.test(regex)) {
              let reg = /^\s*(?:(?:(1[0-2]|0?[0-9]):)?([0-5][0-9]):)?([0-5][0-9])\s?(?:am|pm)\s*to\s*(?:(?:(1[0-2]|0?[0-9]):)?([0-5][0-9]):)?([0-5][0-9])\s?(?:am|pm)\s*$/i.exec(regex);
              let arr = reg[0].split('to');
              let fromTime = moment(arr[0].trim(), "HH:mm:ss:a");
              let toTime = moment(arr[1].trim(), "HH:mm:ss:a");

              fromDate = moment.utc(fromTime);
              toDate = moment.utc(toTime);
            }

            if (fromDate) {
                obj.dateFrom = fromDate;
            }
            if (toDate) {
                obj.dateTo = toDate;
            }
            return obj;
        }

        vm.filter_tree = {};

        /**
         * Customization
         */

        if (!vm.savedAuditLogFilter.selected || !vm.schedulerIds.selected) {
            load();
        }
        if(vm.schedulerIds.selected) {
            checkSharedFilters();
        }

        function checkSharedFilters() {
            if (vm.permission.JOCConfigurations.share.view) {
                var obj = {};
                obj.jobschedulerId = vm.schedulerIds.selected;
                obj.configurationType = "CUSTOMIZATION";
                obj.objectType = "AUDITLOG";
                obj.shared = true;
                UserService.configurations(obj).then(function (res) {
                    if (res.configurations && res.configurations.length > 0)
                        vm.auditLogFilterList = res.configurations;
                    getCustomizations();
                }, function () {
                    getCustomizations();
                });
            } else {
                getCustomizations();
            }
        }

        function getCustomizations() {
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.account = vm.permission.user;
            obj.configurationType = "CUSTOMIZATION";
            obj.objectType = "AUDITLOG";
            UserService.configurations(obj).then(function (res) {

                if (vm.auditLogFilterList && vm.auditLogFilterList.length > 0) {
                    if (res.configurations && res.configurations.length > 0) {
                        vm.auditLogFilterList = vm.auditLogFilterList.concat(res.configurations);
                    }
                    let data = [];
                    for (let i = 0; i < vm.auditLogFilterList.length; i++) {
                        let flag = true;
                        for (let j = 0; j < data.length; j++) {
                            if (data[j].id === vm.auditLogFilterList[i].id) {
                                flag = false;
                            }
                        }
                        if (flag) {
                            data.push(vm.auditLogFilterList[i]);
                        }
                    }
                    vm.auditLogFilterList = data;
                } else {
                    vm.auditLogFilterList = res.configurations;
                }

                if (vm.savedAuditLogFilter.selected) {
                    let flag = true;
                    angular.forEach(vm.auditLogFilterList, function (value) {
                        if (value.id === vm.savedAuditLogFilter.selected) {
                            flag = false;
                            UserService.configuration({
                                jobschedulerId: value.jobschedulerId,
                                id: value.id
                            }).then(function (conf) {
                                vm.selectedFiltered = JSON.parse(conf.configuration.configurationItem);
                                vm.selectedFiltered.account = value.account;
                                load();
                            });
                        }
                    });
                    if (flag) {
                        vm.savedAuditLogFilter.selected = undefined;
                        load();
                    }
                }
            }, function () {
                vm.savedAuditLogFilter.selected = undefined;
            })
        }

        function isCustomizationSelected(flag) {
            if (flag) {
                vm.temp_filter = angular.copy(vm.adtLog.filter.date);
                vm.adtLog.filter.date = '';
            } else {
                if (vm.temp_filter)
                    vm.adtLog.filter.date = angular.copy(vm.temp_filter);
                else
                    vm.adtLog.filter.date = 'today';
            }
        }

        vm.load = load;

        function load() {
            vm.isLoaded = true;
            var obj = {};
            obj.jobschedulerId = vm.adtLog.current == true ? vm.schedulerIds.selected : '';
            obj.limit = parseInt(vm.userPreferences.maxAuditLogRecords);

            if (!_.isEmpty(vm.selectedFiltered)) {
                isCustomizationSelected(true);
                obj = generateRequestObj(vm.selectedFiltered, obj);
            } else {
                obj = setDateRange(obj);
                obj.timeZone = vm.userPreferences.zone;

                if ((obj.dateFrom && (typeof obj.dateFrom.getMonth === 'function' || typeof obj.dateFrom === 'object')) || (obj.dateTo && (typeof obj.dateTo.getMonth === 'function' || typeof obj.dateTo === 'object'))) {
                    obj.timeZone = 'UTC';
                }
                if ((obj.dateFrom && typeof obj.dateFrom.getMonth === 'function')) {
                    obj.dateFrom = moment(obj.dateFrom).tz(vm.userPreferences.zone)._d;
                }
                if ((obj.dateTo && typeof obj.dateTo.getMonth === 'function')) {
                    obj.dateTo = moment(obj.dateTo).tz(vm.userPreferences.zone)._d;
                }
            }

            AuditLogService.getLogs(obj).then(function (result) {
                vm.auditLogs = result.auditLog;
                vm.isLoading = true;
                vm.isLoaded = false;
            }, function () {
                vm.isLoading = true;
                vm.isLoaded = false;
            });
        }

        vm.search = function () {
            var filter = {
                jobschedulerId: vm.adtLog.current == true ? vm.schedulerIds.selected : '',
                limit: parseInt(vm.userPreferences.maxAuditLogRecords)
            };

            vm.adtLog.filter.date = '';
            filter = generateRequestObj(vm.auditSearch, filter);
            hitSearch = true;
            AuditLogService.getLogs(filter).then(function (result) {
                vm.auditLogs = result.auditLog;
                vm.loading = false;
            }, function () {
                vm.loading = false;

            });
        };

        function generateRequestObj(object, filter) {
            if (object.jobChain) {
                filter.orders = [];
                if (object.orderIds) {
                    let s = object.orderIds.replace(/\s*(,|^|$)\s*/g, "$1");
                    let orderIds = s.split(',');
                    angular.forEach(orderIds, function (value) {
                        filter.orders.push({jobChain: object.jobChain, orderId: value})
                    });
                } else {
                    filter.orders.push({jobChain: object.jobChain})
                }
            }else if(object.orderIds) {
                filter.orders = [];
                let s = object.orderIds.replace(/\s*(,|^|$)\s*/g, "$1");
                let orderIds = s.split(',');
                angular.forEach(orderIds, function (value) {
                    filter.orders.push({jobChain: '%', orderId: value})
                });
            }
            if (object.job) {
                filter.jobs = [];
                let s = object.job.replace(/\s*(,|^|$)\s*/g, "$1");
                let jobs = s.split(',');
                angular.forEach(jobs, function (value) {
                    filter.jobs.push({job: value})
                });
            }
            if (object.calendars) {
                let s = object.calendars.replace(/\s*(,|^|$)\s*/g, "$1");
                filter.calendars = s.split(',');
            }
            if (object.regex) {
                filter.regex = object.regex;
            }
            if (object.date == 'process') {
                filter = parseProcessExecuted(object.planned, filter);
            } else {
                if (object.date == 'date' && object.from) {
                    var fromDate = new Date(object.from);
                    if (object.fromTime) {
                        if (object.fromTime === '24:00' || object.fromTime === '24:00:00') {
                            fromDate.setDate(fromDate.getDate() + 1);
                            fromDate.setHours(0);
                            fromDate.setMinutes(0);
                            fromDate.setSeconds(0);
                        } else {
                            fromDate.setHours(moment(object.fromTime, 'HH:mm:ss').hours());
                            fromDate.setMinutes(moment(object.fromTime, 'HH:mm:ss').minutes());
                            fromDate.setSeconds(moment(object.fromTime, 'HH:mm:ss').seconds());
                        }
                    } else {
                        fromDate.setHours(0);
                        fromDate.setMinutes(0);
                        fromDate.setSeconds(0);
                    }
                    fromDate.setMilliseconds(0);
                    filter.dateFrom = moment.utc(fromDate);
                }
                if (object.date == 'date' && object.to) {
                    let toDate = new Date(object.to);
                    if (object.toTime) {
                        if (object.toTime === '24:00' || object.toTime === '24:00:00') {
                            toDate.setDate(toDate.getDate() + 1);
                            toDate.setHours(0);
                            toDate.setMinutes(0);
                            toDate.setSeconds(0);
                        } else {
                            toDate.setHours(moment(object.toTime, 'HH:mm:ss').hours());
                            toDate.setMinutes(moment(object.toTime, 'HH:mm:ss').minutes());
                            toDate.setSeconds(moment(object.toTime, 'HH:mm:ss').seconds());
                        }
                    } else {
                        toDate.setHours(0);
                        toDate.setMinutes(0);
                        toDate.setSeconds(0);
                    }
                    toDate.setMilliseconds(0);
                    filter.dateTo = moment.utc(toDate);
                }
                if(!object.date){
                   filter = parseProcessExecuted(object.planned, filter);
                }
            }
            if (object.account) {
                filter.account = object.account;
            }
            if (object.jobschedulerId) {
                filter.jobschedulerId = object.jobschedulerId;
            }
            if ((filter.dateFrom && (typeof filter.dateFrom.getMonth === 'function' || typeof filter.dateFrom === 'object')) || (filter.dateTo && (typeof filter.dateTo.getMonth === 'function' || typeof filter.dateTo === 'object'))) {
                filter.timeZone = 'UTC';
            }
            if ((filter.dateFrom && typeof filter.dateFrom.getMonth === 'function')) {
                filter.dateFrom = moment(filter.dateFrom).tz(vm.userPreferences.zone)._d;
            }
            if ((filter.dateTo && typeof filter.dateTo.getMonth === 'function')) {
                filter.dateTo = moment(filter.dateTo).tz(vm.userPreferences.zone)._d;
            }
            return filter;
        }

        vm.advancedSearch = function () {
            vm.showSearchPanel = true;
            vm.isUnique = true;
            vm.auditSearch = {};
            vm.auditSearch.date = 'date';
            vm.auditSearch.from = new Date();
            vm.auditSearch.fromTime = '00:00';
            vm.auditSearch.to = new Date();
            vm.auditSearch.toTime = moment().format("HH:mm");
        };
        vm.cancel = function () {
            if (!vm.adtLog.filter.date) {
                vm.adtLog.filter.date = 'today';
            }
            vm.showSearchPanel = false;
            vm.auditSearch = {};
            if(hitSearch) {
                hitSearch = false;
                vm.load();
            }
        };

        /** <<<<<<<<<<<<<<<<<<<<<<<<<<<< Begin Customization actions >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */
         vm.saveAsFilter = function (form) {
             var configObj = {};
             configObj.jobschedulerId = vm.schedulerIds.selected;
             configObj.account = vm.permission.user;
             configObj.configurationType = "CUSTOMIZATION";
             configObj.objectType = "AUDITLOG";
             configObj.name = vm.auditSearch.name;
             configObj.id = 0;

             configObj.configurationItem = JSON.stringify(vm.auditSearch);
             UserService.saveConfiguration(configObj).then(function (res) {
                 configObj.id = res.id;
                 vm.auditSearch.name = '';
                 if (form)
                     form.$setPristine();

                 vm.auditLogFilterList.push(configObj);
             })
         };
        vm.createFilter = function () {
            vm.cancel();
            vm.auditLogFilter = {};
            vm.isUnique = true;
            let modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/audit-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                var configObj = {};
                configObj.jobschedulerId = vm.schedulerIds.selected;
                configObj.account = vm.permission.user;
                configObj.configurationType = "CUSTOMIZATION";
                configObj.objectType = "AUDITLOG";
                configObj.name = vm.auditLogFilter.name;
                configObj.id = 0;
                configObj.shared = vm.auditLogFilter.shared;

                configObj.configurationItem = JSON.stringify(vm.auditLogFilter);
                UserService.saveConfiguration(configObj).then(function (res) {
                    configObj.id = res.id;
                    vm.auditLogFilterList.push(configObj);

                    if (vm.auditLogFilterList.length == 1) {
                        vm.savedAuditLogFilter.selected = res.id;
                        vm.adtLog.selectedView = true;
                        vm.selectedFiltered = vm.auditLogFilter;
                        vm.selectedFiltered.account = vm.permission.user;
                        isCustomizationSelected(true);
                        SavedFilter.setAuditLog(vm.savedAuditLogFilter);
                        SavedFilter.save();
                        load();
                    }
                })
            }, function () {

            });
        };
        vm.editFilters = function () {
            vm.filters = {};
            vm.filters.list = vm.auditLogFilterList;
            vm.filters.favorite = vm.savedAuditLogFilter.favorite;
            let modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/edit-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm
            });
        };
        var temp_name = '';
        vm.editFilter = function (filter) {
            vm.cancel();
            vm.action = 'edit';
            vm.isUnique = true;
            temp_name = angular.copy(filter.name);
            UserService.configuration({jobschedulerId: filter.jobschedulerId, id: filter.id}).then(function (conf) {
                vm.auditLogFilter = JSON.parse(conf.configuration.configurationItem);
                vm.auditLogFilter.shared = filter.shared;
                vm.paths = vm.auditLogFilter.paths;
                vm.jobPaths = vm.auditLogFilter.jobs;
                vm.object.paths = vm.paths;
                vm.object1.paths = vm.jobPaths;
            });

            let modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/audit-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                if (vm.savedAuditLogFilter.selected === filter.id) {
                    vm.selectedFiltered = vm.auditLogFilter;
                    vm.adtLog.selectedView = true;
                    isCustomizationSelected(true);
                    vm.load();
                }
                var configObj = {};
                configObj.jobschedulerId = filter.jobschedulerId;
                configObj.account = filter.account;
                configObj.configurationType = filter.configurationType;
                configObj.objectType = filter.objectType;
                configObj.configurationItem = JSON.stringify(vm.auditLogFilter);
                configObj.name = vm.auditLogFilter.name;
                configObj.id = filter.id;
                configObj.shared = vm.auditLogFilter.shared;
                filter.shared = vm.auditLogFilter.shared;

                UserService.saveConfiguration(configObj);
                filter.name = vm.auditLogFilter.name;
                temp_name = '';
            }, function () {
                temp_name = '';
            });
        };
        vm.copyFilter = function (filter) {
            vm.action = 'copy';
            vm.isUnique = true;
            UserService.configuration({jobschedulerId: filter.jobschedulerId, id: filter.id}).then(function (conf) {
                vm.auditLogFilter = JSON.parse(conf.configuration.configurationItem);
                vm.auditLogFilter.shared = filter.shared;
                vm.paths = vm.auditLogFilter.paths;
                vm.jobPaths = vm.auditLogFilter.jobs;
                vm.object.paths = vm.paths;
                vm.object1.paths = vm.jobPaths;
                vm.auditLogFilter.name = vm.checkCopyName(vm.auditLogFilterList, filter.name)
            });

            let modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/audit-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {

                var configObj = {};
                configObj.jobschedulerId = filter.jobschedulerId;
                configObj.account = vm.permission.user;
                configObj.configurationType = "CUSTOMIZATION";
                configObj.objectType = "AUDITLOG";
                configObj.name = vm.auditLogFilter.name;
                configObj.shared = vm.auditLogFilter.shared;
                configObj.id = 0;

                configObj.configurationItem = JSON.stringify(vm.auditLogFilter);
                UserService.saveConfiguration(configObj).then(function (res) {
                    configObj.id = res.id;
                    vm.auditLogFilterList.push(configObj);
                });

            }, function () {

            });
        };
        vm.deleteFilter = function (filter) {
            UserService.deleteConfiguration({
                jobschedulerId: filter.jobschedulerId,
                id: filter.id
            }).then(function () {
                angular.forEach(vm.auditLogFilterList, function (value, index) {
                    if (value.id == filter.id) {
                        vm.auditLogFilterList.splice(index, 1);
                    }
                });

                if (vm.savedAuditLogFilter.selected == filter.id) {
                    vm.savedAuditLogFilter.selected = undefined;
                    vm.adtLog.selectedView = false;
                    vm.selectedFiltered = undefined;
                    isCustomizationSelected(false);
                    vm.load();
                } else {
                    if (vm.auditLogFilterList.length == 0) {
                        vm.savedAuditLogFilter.selected = undefined;
                        vm.adtLog.selectedView = false;
                        vm.selectedFiltered = undefined;
                        isCustomizationSelected(false);
                    }
                }
                SavedFilter.setAuditLog(vm.savedAuditLogFilter);
                SavedFilter.save();
            });

        };
        vm.makePrivate = function (configObj) {

            UserService.privateConfiguration({
                jobschedulerId: configObj.jobschedulerId,
                id: configObj.id
            }).then(function () {
                configObj.shared = false;
                if (vm.permission.user != configObj.account) {
                    angular.forEach(vm.auditLogFilterList, function (value, index) {
                        if (value.id == configObj.id) {
                            vm.auditLogFilterList.splice(index, 1);
                        }
                    });
                }
            });
        };
        vm.makeShare = function (configObj) {
            UserService.shareConfiguration({
                jobschedulerId: configObj.jobschedulerId,
                id: configObj.id
            }).then(function () {
                configObj.shared = true;
            });
        };
        vm.favorite = function (filter) {
            vm.savedAuditLogFilter.favorite = filter.id;
            vm.filters.favorite = filter.id;
            vm.adtLog.selectedView = true;
            SavedFilter.setAuditLog(vm.savedAuditLogFilter);
            SavedFilter.save();
            vm.load();
        };
        vm.removeFavorite = function () {
            vm.savedAuditLogFilter.favorite = '';
            vm.filters.favorite = '';
            SavedFilter.setAuditLog(vm.savedAuditLogFilter);
            SavedFilter.save();
        };
        vm.checkFilterName = function () {
            vm.isUnique = true;
            angular.forEach(vm.auditLogFilterList, function (value) {
                let name  =  !_.isEmpty(vm.auditSearch) ? vm.auditSearch.name : !_.isEmpty(vm.auditLogFilter) ? vm.auditLogFilter.name : '';
                if (name == value.name && vm.permission.user == value.account && name != temp_name) {
                    vm.isUnique = false;
                }

            })
        };
        vm.changeFilter = function (filter) {
            vm.cancel();
            if (filter) {
                vm.savedAuditLogFilter.selected = filter.id;
                vm.adtLog.selectedView = true;
                UserService.configuration({jobschedulerId: filter.jobschedulerId, id: filter.id}).then(function (conf) {
                    vm.selectedFiltered = JSON.parse(conf.configuration.configurationItem);
                    vm.selectedFiltered.account = filter.account;
                    vm.load();
                });
            }
            else {
                isCustomizationSelected(false);
                vm.savedAuditLogFilter.selected = filter;
                vm.adtLog.selectedView = false;
                vm.selectedFiltered = filter;
                vm.load();
            }
            SavedFilter.setAuditLog(vm.savedAuditLogFilter);
            SavedFilter.save();
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

        vm.$on('resetViewDate', function () {
            if (vm.adtLog.filter.date == 'today')
                vm.load();
        });

        $scope.$on('event-started', function () {
            if (vm.events && vm.events[0] && vm.events[0].eventSnapshots && vm.events[0].eventSnapshots.length > 0) {
                for (let i = 0; i < vm.events[0].eventSnapshots.length; i++) {
                    if (vm.events[0].eventSnapshots[i].eventType === "AuditLogChanged") {
                        if (!_.isEmpty(vm.auditSearch)) {
                            vm.search();
                        } else {
                            vm.load();
                        }
                        break;
                    }
                }
            }
        });
    }

    UsersCtrl.$inject = ['$scope', 'UserService', '$uibModal', '$rootScope', '$location', 'toasty', 'gettextCatalog'];
    function UsersCtrl($scope, UserService, $uibModal, $rootScope, $location, toasty, gettextCatalog) {
        var vm = $scope;

        vm.usr = {};
        vm.usr.currentPage = 1;
        vm.prof = {};
        vm.prof.currentPage = 1;
        vm.maxEntryPerPage = vm.userPreferences.maxEntryPerPage;
        vm.state = '';
        vm.editor = {};
        vm.editor.edit = false;
        vm.view = {};
        vm.object = {
            profiles: []
        };
        vm.filterString = {};
        vm.filterString.q = '';
        vm.isJOCClusterEnable = true;
        vm.isLdapRealmEnable = true;

        function get() {
            UserService.securityConfigurationRead({}).then(function (res) {
                vm.users = res.users;
                vm.masters = res.masters;
                vm.main = res.main;
                vm.profiles = res.profiles;
                if (vm.main && vm.main.length > 0) {
                    if (vm.main.length > 1) {
                        for (let i = 0; i < vm.main.length; i++) {
                            if ((vm.main[i].entryName === 'sessionDAO' && vm.main[i].entryValue === 'com.sos.auth.shiro.SOSDistributedSessionDAO') ||
                                (vm.main[i].entryName === 'securityManager.sessionManager.sessionDAO' && vm.main[i].entryValue === '$sessionDAO')) {
                                vm.isJOCClusterEnable = false;
                            }
                            if((vm.main[i].entryName === 'ldapRealm' && vm.main[i].entryValue === 'com.sos.auth.shiro.SOSLdapAuthorizingRealm') ||
                                (vm.main[i].entryName === 'securityManager.sessionManager.sessionDAO' && vm.main[i].entryValue === '$sessionDAO')){
                                vm.isLdapRealmEnable = false;
                            }
                        }
                    }
                }
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
            obj.main = vm.main;
            UserService.securityConfigurationWrite(obj);
        }

        var temp_role = '';
        //--------------------ACTION-----------------------
        vm.checkUser = function () {
            if(vm.user && vm.user.user) {
                vm.isUnique = true;
                angular.forEach(vm.users, function (usr) {
                    if (usr.user !== vm.temp_name && (angular.equals(usr.user, vm.user.user) || usr.user.toUpperCase() === vm.user.user.toUpperCase()))
                        vm.isUnique = false;
                });
            }
        };
        vm.checkMaster = function () {
            vm.isUnique = true;
            if(vm.master.master) {
                angular.forEach(vm.masters, function (mast) {
                    if ((angular.equals(mast.master, vm.master.master) || mast.master === vm.master.master))
                        vm.isUnique = false;
                });
            }
        };

        vm.checkMainSection = function () {
            vm.isUnique = true;
            angular.forEach(vm.main, function (mast) {
                if (mast.entryName !== vm.temp_name && (angular.equals(mast.entryName, vm.entry.entryName) || mast.entryName === vm.entry.entryName))
                    vm.isUnique = false;
            });
        };

        vm.checkRole = function () {
            vm.isUnique = true;
            for (let j = 0; j < vm.roles.length; j++) {
                if (vm.roles[j] !== temp_role && (angular.equals(vm.roles[j], vm.role.role) || vm.roles[j] === vm.role.role)) {
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
                vm.user.password = vm.user.fakepassword || '';
                delete vm.user['fakepassword'];
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
            vm.user.user = decodeURIComponent(vm.user.user);
            vm.temp_name = user.user;
            vm.isUnique = true;
            if(vm.user.password)
            vm.user.fakepassword = "00000000";

            vm.newUser = false;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/user-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                 vm.temp_name='';
                if (vm.user.fakepassword !== '00000000') {
                    vm.user.password = vm.user.fakepassword || '';
                }
                delete vm.user['fakepassword'];

                angular.forEach(vm.users, function (usr, index) {
                    if (angular.equals(user, usr))
                        vm.users[index] = vm.user;
                });
                saveInfo();
                vm.user = {};
                if (vm.selectedUser && vm.selectedUser === user.user) {
                    vm.selectedUser = '';
                    selectedMasters = [];
                    selectedRoles = [];
                }

            }, function () {
                vm.user = {};
                vm.temp_name='';
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
                let obj = {accounts: []};
                obj.accounts.push(user.user);
                UserService.deleteProfile(obj).then(function (res) {
                    vm.profile = {};
                    for (let i = 0; i < vm.profiles.length; i++) {
                        if (vm.profiles[i].account === user.user) {
                            vm.profiles.splice(i, 1);
                            break;
                        }
                    }

                });
                saveInfo();
                if (vm.selectedUser && vm.selectedUser === user.user) {
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
                    if (angular.equals(master.master, vm.mstr.name) || (master.master == '' && !vm.mstr.name)) {
                        vm.masters[index].roles.push(vm.role);
                    }
                });
                if (vm.selectedUser) {
                    for (let i = 0; i < vm.users.length; i++) {
                        if (vm.users[i].user == vm.selectedUser) {
                            vm.users[i].roles.push(vm.role.role);
                            break;
                        }
                    }
                    vm.selectUser(vm.selectedUser);
                }
                saveInfo();
                vm.role = {};

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
                for (let i = 0; i < vm.users.length; i++) {
                    for (let j = 0; j < vm.users[i].roles.length; j++) {
                        if (vm.users[i].roles[j] == temp_role) {
                            vm.users[i].roles.splice(j, 1);
                            vm.users[i].roles.push(vm.role.role);
                        }
                    }
                }
                for (let i = 0; i < vm.roles.length; i++) {
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
        vm.copyRole = function (role, mast) {
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
                    if (angular.equals(master, mast)) {
                        vm.masters[index].roles.push(vm.role);
                    }
                });
                saveInfo();
                vm.role = {};
                vm.copy = false;
                if (vm.selectedUser)
                    vm.selectUser();
            }, function () {
                vm.role = {};
                vm.copy = false;
            });
        };
        vm.deleteRole = function (role, mast) {
            var flag = true;
            for (let i = 0; i < vm.users.length; i++) {
                for (let j = 0; j < vm.users[i].roles.length; j++) {
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
                if (vm.master.ipAddress) {
                    let name = 'ip=' + vm.master.ipAddress;
                    if (vm.master.master) {
                        name = name + ':' + vm.master.master
                    }
                    vm.master.master = name;
                }
                delete vm.master['ipAddress'];
                vm.masters.push(vm.master);
                saveInfo();
                vm.master = {};
                if (vm.selectedUser)
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
                if (vm.selectedUser)
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
                angular.forEach(vm.masters, function (master) {
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
            vm.showMsg = false;
            if (user) {
                for (let i = 0; i < vm.users.length; i++) {
                    if (vm.users[i].user == vm.selectedUser && vm.users[i].roles) {
                        selectedRoles = vm.users[i].roles || [];
                        angular.forEach(vm.masters, function (master) {

                            var flag = true;
                            for (let j = 0; j < vm.users[i].roles.length; j++) {
                                for (let x = 0; x < master.roles.length; x++) {
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
                if (selectedMasters.length == 0) {
                    vm.showMsg = true;
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

        /* ------------- Delete profile -------------------*/
        vm.checkAll = {
            checkbox: false
        };

        vm.checkAllProfileFnc = function () {
            if(vm.checkAll.checkbox && vm.profiles.length > 0) {
                vm.object.profiles = vm.profiles.slice((vm.userPreferences.entryPerPage * (vm.prof.currentPage - 1)), (vm.userPreferences.entryPerPage * vm.prof.currentPage));
            }else{
                vm.object.profiles =[];
            }
        };

        var watcher = $scope.$watchCollection('object.profiles', function (newNames) {
            if (newNames && newNames.length > 0) {
                vm.checkAll.checkbox = newNames.length === vm.profiles.slice((vm.userPreferences.entryPerPage * (vm.prof.currentPage - 1)), (vm.userPreferences.entryPerPage * vm.prof.currentPage)).length;
            } else {
                vm.object.profiles = [];
                vm.checkAll.checkbox = false;
            }
        });

        var watcher2 = vm.$watch('userPreferences.entryPerPage', function (newNames) {
            if (newNames) {
                vm.object.profiles = [];
                vm.checkAll.checkbox = false;
            }
        });

        var watcher3 = $scope.$watchCollection('prof.currentPage', function (newNames) {
            if (newNames) {
                vm.object.profiles = [];
                vm.checkAll.checkbox = false;
            }
        });

        vm.resetProfiles = function() {
            vm.profile = null;
            vm._profiles = vm.object.profiles;
            let modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/confirm-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                let obj = {accounts: []};
                for (let i = 0; i < vm.object.profiles.length; i++) {
                    obj.accounts.push(vm.object.profiles[i].account);
                }
                UserService.deleteProfile(obj).then(function () {
                    vm._profiles = null;
                    for (let i = 0; i < vm.object.profiles.length; i++) {
                        for (let j = 0; j < vm.profiles.length; j++) {
                            if (vm.profiles[j].account === vm.object.profiles[i].account) {
                                vm.profiles.splice(j, 1);
                                break;
                            }
                        }
                    }
                    vm.object.profiles = [];

                });
            }, function () {
                vm.object.profiles = [];
                vm._profiles = null;
            });
        };

        vm.resetProfile = function (profile) {
            vm._profiles = null;
            vm.profile = angular.copy(profile);
            let modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/confirm-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                //delete profile
                let obj = {accounts: []};
                obj.accounts.push(profile.account);
                UserService.deleteProfile(obj).then(function (res) {
                    vm.profile = {};
                    for (let i = 0; i < vm.profiles.length; i++) {
                        if (vm.profiles[i].account === profile.account) {
                            vm.profiles.splice(i, 1);
                            break;
                        }
                    }

                });
            }, function () {
                vm.profile = {};
                vm.object.profiles = [];
            });
        };
        /* ------------- Begin Main Section -------------------*/

        vm.addMainSection = function () {
            vm.mainSection = [];
            vm.isUpdate = false;
            vm.fullSection = false;
            vm.mainSection.push({
                name:'',
                values:[{value:''}],
                comments:[{value:''}]
            });
            vm.mainText = '';

            vm.isUnique = true;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/add-main-section-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function (res) {
                angular.forEach(res, function(val){
                   if(val.name && val.name !='') {
                       var obj = {};
                       obj.entryName = val.name;
                       obj.entryValue =[];
                       obj.entryComment =[];
                       angular.forEach(val.values, function(val1) {
                           if(val1.value && val1.value !='')
                           obj.entryValue.push(val1.value);
                       });
                       angular.forEach(val.comments, function(val1) {
                           if(val1.value && val1.value !='')
                           obj.entryComment.push(val1.value);
                       });

                       vm.main.push(obj);
                   }
                });

                saveInfo();
                vm.mainSection = [];
            }, function () {
               vm.mainSection = [];
            });
        };

        vm.enableJOCCluster = function() {
            vm.isldap = false;
            var mainSection = [
                {
                    entryName: 'sessionDAO',
                    entryValue: ['com.sos.auth.shiro.SOSDistributedSessionDAO'],
                    entryComment: []
                }, {
                    entryName: 'securityManager.sessionManager.sessionDAO',
                    entryValue: ['$sessionDAO'],
                    entryComment: []
                }];

            vm.mainSection = angular.copy(mainSection);
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/ldap-section-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                vm.main = vm.main.concat(vm.mainSection);
                saveInfo();
                vm.isJOCClusterEnable = false;
                vm.mainSection = [];
            }, function () {
                vm.mainSection = [];
            });
        };

        vm.addLdapRealm = function() {
            vm.isldap = true;
            var mainSection = [
                {
                    entryName: 'ldapRealm',
                    entryValue: ['com.sos.auth.shiro.SOSLdapAuthorizingRealm'],
                    entryComment: []
                }, {
                    entryName: 'ldapRealm.contextFactory.url',
                    entryValue: ['ldap://myHost:389'],
                    entryComment: []
                }, {
                    entryName: 'rolePermissionResolver',
                    entryValue: ['com.sos.auth.shiro.SOSPermissionResolverAdapter'],
                    entryComment: []
                }, {
                    entryName: 'rolePermissionResolver.ini',
                    entryValue: ['$iniRealm'],
                    entryComment: []
                }, {
                    entryName: 'ldapRealm.rolePermissionResolver',
                    entryValue: ['$rolePermissionResolver'],
                    entryComment: []
                }, {
                    entryName: 'securityManager.realms',
                    entryValue: ['$ldapRealm'],
                    entryComment: []
                }, {
                    entryName: 'cacheManager',
                    entryValue: ['org.apache.shiro.cache.MemoryConstrainedCacheManager'],
                    entryComment: []
                }, {
                    entryName: 'securityManager.cacheManager',
                    entryValue: ['$cacheManager'],
                    entryComment: []
                }];

            vm.mainSection = angular.copy(mainSection);

            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/ldap-section-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                for(let i =0; i<vm.mainSection.length;i++){
                    if(vm.mainSection[i].entryName == 'ldapRealm.contextFactory.url'){
                        if(!angular.isArray(vm.mainSection[i].entryValue)){
                            let value = angular.copy(vm.mainSection[i].entryValue);
                            vm.mainSection[i].entryValue =[value];

                        }
                        break;
                    }
                }
                vm.main = vm.main.concat(vm.mainSection);
                saveInfo();
                vm.isLdapRealmEnable = false;
                vm.mainSection = [];
            }, function () {
                vm.mainSection = [];
            });
        };

        vm.editAll  = function() {
            vm.mainSection = [];
            vm.isUpdate = true;

            vm.mainText = '';

            angular.forEach(vm.main, function (entry) {
                var values = [];
                var comments = [];

                if (entry.entryComment && entry.entryComment.length > 0) {
                    angular.forEach(entry.entryComment, function (comment) {
                        comments.push({value: comment});
                        vm.mainText = vm.mainText + '#' + comment + '\n';
                    });
                } else {
                    comments.push({value: ''});
                }
                vm.mainText = vm.mainText + entry.entryName + ' = ';
                if (entry.entryValue && entry.entryValue.length > 0) {
                    angular.forEach(entry.entryValue, function (value, index) {
                        values.push({value: value});
                        vm.mainText = vm.mainText + (entry.entryValue.length > 1 ? '\\ \n' + value : value);
                        if (entry.entryValue.length - 1 !== index) {
                            vm.mainText = vm.mainText + ',';
                        }

                       if (entry.entryValue.length-1 === index) {
                            vm.mainText = vm.mainText + '\n';
                       }
                    });
                } else {
                    values.push({value: ''});
                }

                vm.mainSection.push({
                    name: entry.entryName,
                    values: values,
                    comments: comments
                });
            });

            vm.isUnique = true;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/add-main-section-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function (res) {
                var main = [];
                angular.forEach(res, function (val) {
                    if (val.name && val.name != '') {
                        var obj = {};
                        obj.entryName = val.name;
                        obj.entryValue = [];
                        obj.entryComment = [];
                        angular.forEach(val.values, function (val1) {
                            if (val1.value && val1.value != '')
                                obj.entryValue.push(val1.value);
                        });
                        angular.forEach(val.comments, function (val1) {
                            if (val1.value && val1.value != '')
                                obj.entryComment.push(val1.value);
                        });
                        main.push(obj);
                    }
                });

                vm.main = main;
                saveInfo();
                vm.mainSection = [];
            }, function () {
                vm.mainSection = [];
            });
        };

        vm.editMainSection = function (entry) {
            vm.entry = angular.copy(entry);
            vm.temp_name = angular.copy(entry.entryName);
            vm.entryValue = [];
            vm.entryComment = [];
            if (vm.entry.entryValue.length > 0) {
                angular.forEach(vm.entry.entryValue, function (val) {
                    vm.entryValue.push({value: angular.copy(val)});
                });
            } else {
                vm.entryValue.push({value: ''});
            }
            if (vm.entry.entryComment.length > 0) {
                angular.forEach(vm.entry.entryComment, function (val) {
                    vm.entryComment.push({value: angular.copy(val)});
                });
            } else {
                vm.entryComment.push({value: ''});
            }
            vm.isUnique = true;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/main-section-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                vm.entry.entryValue = [];
                vm.entry.entryComment = [];
                if (vm.entryValue.length > 0) {
                    angular.forEach(vm.entryValue, function (val) {
                        if(val.value && val.value !='') {
                            vm.entry.entryValue.push(val.value);
                        }
                    });
                }
                if (vm.entryComment.length > 0) {
                    angular.forEach(vm.entryComment, function (val) {
                        if(val.value && val.value !='') {
                            vm.entry.entryComment.push(val.value);
                        }
                    });
                }

                angular.forEach(vm.main, function (usr, index) {
                    if (angular.equals(entry, usr))
                        vm.main[index] = vm.entry;
                });

                saveInfo();
                vm.entry = {};
            }, function () {
                vm.entry = {};
            });
        };

        vm.deleteMainSection = function (entry) {
            vm.entry = angular.copy(entry);
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/confirm-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                vm.main.splice(vm.main.indexOf(entry), 1);
                saveInfo();
                vm.entry = {};
            }, function () {
                vm.entry = {};
            });
        };

        vm.addValueField = function () {
            let param = {
                value: ''
            };
            if (vm.entryValue)
                vm.entryValue.push(param);
        };

        vm.removeValueField = function (index) {
            vm.entryValue.splice(index, 1);
        };

        vm.addCommentField = function () {
            let param = {
                value: ''
            };
            if (vm.entryComment)
                vm.entryComment.push(param);
        };

        vm.removeCommentField = function (index) {
            vm.entryComment.splice(index, 1);
        };

        /* ------------- End Main Section -------------------*/
        vm.$on('$stateChangeSuccess', function (event, toState, toParams) {
            if (toState.name == 'app.users.user') {
                vm.state = 'user';
            } else if (toState.name == 'app.users.master') {
                vm.state = 'role';
            } else if (toState.name == 'app.users.permission') {
                vm.state = 'permission';
                vm.roleName = toParams.role;
                vm.masterName = toParams.master;
            } else if (toState.name == 'app.users.main') {
                vm.state = 'main';
            }else if (toState.name == 'app.users.profiles') {
                vm.state = 'profile';
            }
        });

        vm.addFolder = function () {
            $rootScope.$broadcast('addFolder');
        };
        vm.addPermission = function () {
            $rootScope.$broadcast('addPermission');
        };

        $scope.$on('$destroy', function () {
            watcher();
            watcher2();
            watcher3();
        });
    }

    PermissionCtrl.$inject = ['$scope', 'UserService', '$uibModal', 'orderByFilter', '$stateParams', 'ResourceService', '$timeout'];
    function PermissionCtrl($scope, UserService, $uibModal, orderBy, $stateParams, ResourceService, $timeout) {
        var vm = $scope;
        vm.loading = true;
        vm.isDuplicate = false;

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
                preparePermissionOptions();
                switchTree();
                vm.loading = false;
            }, function () {
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
            obj.main = vm.main;
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
            if (flag) {
                permission._parents.push(arr[0]);
            }

        }

        vm.permissionArr = [];
        function preparePermissionJSON() {
            vm.permissionArr = vm.permissions.SOSPermissionListCommands.SOSPermission;
            vm.permissionArr = vm.permissionArr.concat(vm.permissions.SOSPermissionListJoc.SOSPermission);
            for (let i = 0; i < vm.permissionArr.length; i++) {
                var nodes = vm.permissionArr[i].split(':');

                var arr = [];
                var flag = true, index = 0;
                for (let j = 0; j < nodes.length; j++) {
                    var obj = {};
                    obj.id = count++;
                    obj.name = nodes[j];
                    obj.path = vm.permissionArr[i].substring(0, vm.permissionArr[i].lastIndexOf(nodes[j]));
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
                if (flag) {
                    permissionNodes.push(arr);
                }
                else {
                    recursiveUpdate1(permissionNodes[0][index], arr);
                }

            }
        }

        function preparePermissionOptions() {
            var temp = vm.permissions.SOSPermissionListCommands.SOSPermission;
            temp = temp.concat(vm.permissions.SOSPermissionListJoc.SOSPermission);
            vm.permissionOptions = [];
            angular.forEach(temp, function (option, index) {
                if (index > 0 && (option.split(':')[2] != temp[index - 1].split(':')[2] || option.split(':')[3] != temp[index - 1].split(':')[3])) {
                    vm.permissionOptions.push('---------------------------------------------------------------------------------');
                }
                vm.permissionOptions.push(option);
            })
        }

        function loadPermission() {
            angular.forEach(vm.masters, function (master) {
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
            if (!vm.masterName || vm.masterName == 'default') {
                vm.masterName = $scope.schedulerIds.selected;
            }
            ResourceService.tree({jobschedulerId: vm.masterName, compact: true, force: true}).then(function (res) {
                vm.folderList = res.folders;
                angular.forEach(vm.folderList, function (value) {
                    value.expanded = true;
                    if (value.folders) {
                        value.folders = orderBy(value.folders, 'name');
                    }
                });
            }, function () {
                $('#treeModal').modal('hide');
            });

            $('#treeModal').modal('show');
        };

        vm.treeExpand1 = function(data) {
            if (data.expanded) {
                data.folders = orderBy(data.folders, 'name');
            }
        };

        vm.$on('addFolder', function () {
            vm.folder = {};
            vm.folder.recursive = true;
            vm.folder.calendar = false;
            vm.newFolder = true;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/folder-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                if (vm.folder.folder) {
                    if (vm.folder.calendar && vm.folder.folder.indexOf('/*calendar') == -1) {
                        if (vm.folder.folder.substring(0,1) == '/') {
                            vm.folderArr.push({
                                folder: '/*calendar' + vm.folder.folder,
                                recursive: vm.folder.recursive
                            });
                        } else {
                            vm.folderArr.push({
                                folder: '/*calendar/' + vm.folder.folder,
                                recursive: vm.folder.recursive
                            });
                        }
                    } else {
                        vm.folderArr.push({folder: vm.folder.folder, recursive: vm.folder.recursive});
                    }
                }
                if (vm.folderObj.paths && vm.folderObj.paths.length > 0) {
                    angular.forEach(vm.folderObj.paths, function (path) {
                        if (vm.folder.calendar && path.indexOf('/*calendar') == -1) {
                            vm.folderArr.push({folder: '/*calendar' + path, recursive: vm.folder.recursive});
                        } else {
                            vm.folderArr.push({folder: path, recursive: vm.folder.recursive});
                        }
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
            vm.folder.folder = vm.folder.folder == "" ? '/' : vm.folder.folder;
            vm.newFolder = false;
            if (vm.folder.folder.indexOf('/*calendar') == 0) {
                vm.folder.calendar = true;
                vm.folder.folder = vm.folder.folder.substring(10);
            }
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/folder-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                angular.forEach(vm.folderArr, function (fold, index) {
                    if (angular.equals(folder, fold)) {
                        if (vm.folder.calendar) {
                            if (vm.folder.folder.indexOf('/*calendar') == -1) {
                                if (vm.folder.folder.substring(0, 1) == '/') {
                                    vm.folderArr[index].folder = '/*calendar' + vm.folder.folder;
                                } else {
                                    vm.folderArr[index].folder = '/*calendar/' + vm.folder.folder;
                                }
                            } else {
                                vm.folderArr[index].folder = vm.folder.folder;
                            }
                        } else {
                            if (vm.folder.folder.indexOf('/*calendar') == 0) {
                                vm.folderArr[index].folder = vm.folder.folder.substring(10);
                            } else {
                                vm.folderArr[index].folder = vm.folder.folder;
                            }
                        }
                        vm.folderArr[index].recursive = vm.folder.recursive;
                    }
                });
                saveInfo();
                vm.folder = {};
            }, function () {
                vm.folder = {};
            });
        };

        vm.deleteFolder = function (folder) {
            vm.folder = angular.copy(folder);
            vm.folder.folder = vm.folder.folder == "" ? '/' : vm.folder.folder;
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
                for (let i = 0; i < permissionNodes._parents.length; i++) {
                    if ((permissionNodes._parents[i].path + permissionNodes._parents[i].name) == permission) {
                        permissionNodes._parents[i].selected = false;
                        unSelectedNode(permissionNodes._parents[i], permissionNodes._parents[i].excluded);
                        if (permissionNodes._parents[i].excluded) {
                            permissionNodes._parents[i].greyedBtn = false;
                            permissionNodes._parents[i].excluded = false;
                        }
                        break;
                    }
                    findPermissionObj(permissionNodes._parents[i], permission);
                }
            } else {
                if ((permissionNodes.path + permissionNodes.name) == permission) {
                    permissionNodes.selected = false;
                    if (permissionNodes.excluded) {
                        permissionNodes.greyedBtn = false;
                        permissionNodes.excluded = false;
                    }
                }
            }
        }

        function selectPermissionObj(permissionNodes, permission, excluded) {
            if (permissionNodes._parents) {
                for (let i = 0; i < permissionNodes._parents.length; i++) {
                    if ((permissionNodes._parents[i].path + permissionNodes._parents[i].name) == permission) {
                        permissionNodes._parents[i].selected = true;
                        permissionNodes._parents[i].excluded = excluded;
                        if (permissionNodes._parents[i].excluded)
                            permissionNodes._parents[i].greyedBtn = false;
                        selectedNode(permissionNodes._parents[i], excluded);
                        break;
                    }
                    selectPermissionObj(permissionNodes._parents[i], permission, excluded);
                }
            } else {
                if ((permissionNodes.path + permissionNodes.name) == permission) {
                    permissionNodes.selected = true;
                    permissionNodes.excluded = excluded;
                    permissionNodes.greyedBtn = false;
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
            vm.isCovered = true;
            $('#editPermission').modal('show');
            vm.permissionToEdit = angular.copy(p);
            vm.permission = angular.copy(p);
        };

        vm.savePermission = function () {
            $('#editPermission').modal('hide');
            vm.isCovered = false;
            var exists = false;
            for (let i = 0; i < vm.rolePermissions.length; i++) {
                if (vm.rolePermissions[i].path == vm.permission.path) {
                    vm.rolePermissions[i].excluded = vm.permission.excluded;
                    exists = true;
                    break;
                }
            }
            if (!exists) {
                for (let i = 0; i < vm.rolePermissions.length; i++) {
                    if (vm.rolePermissions[i].path == vm.permissionToEdit.path) {
                        vm.rolePermissions.splice(i, 1);
                        vm.rolePermissions.splice(i, 0, vm.permission);
                        break;
                    }
                }
            }
            saveInfo();
            selectPermissionObj(permissionNodes[0][0], vm.permission.path, vm.permission.excluded);
            updateDiagramData(permissionNodes[0][0]);
        };

        vm.$on('addPermission', function () {
            vm.isCovered = false;
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

        vm.checkCovered = function checkCovered() {
            vm.form.permissionPath.$touched = true;
            vm.isCovered = false;
            angular.forEach(vm.rolePermissions, function (permission1, index) {
                if (vm.permission.path && vm.permission.path.indexOf(permission1.path) != -1 &&
                    ((vm.permission.path.length > permission1.path.length && vm.permission.path.substring(permission1.path.length, permission1.path.length + 1) == ':') || vm.permission.path.length == permission1.path.length) &&
                    ((vm.permission.excluded && permission1.excluded) || (!vm.permission.excluded && !permission1.excluded))) {
                    vm.isCovered = true;
                }
            });
        };

        vm.previousPermission = [];
        vm.originalPermission = [];

        function updatePermissionList() {
            unSelectedNode(permissionNodes[0][0], true);
            checkPermissionList(permissionNodes[0][0], angular.copy(vm.rolePermissions));
            updateDiagramData(permissionNodes[0][0]);
            for (let i = 0; i < vm.masters.length; i++) {
                if (angular.equals(vm.masters[i].master, vm.masterName) || (vm.masters[i].master == '' && vm.masterName == 'default')) {
                    for (let j = 0; j < vm.masters[i].roles.length; j++) {
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

        vm.isReset = false;
        vm.undoPermission = function () {
            vm.rolePermissions = vm.previousPermission[vm.previousPermission.length - 1];
            vm.previousPermission.splice(vm.previousPermission.length - 1, 1);
            if (angular.equals(vm.originalPermission, vm.rolePermissions)) {
                vm.isReset = false;
            }
            updatePermissionList();
        };

        vm.resetPermission = function () {
            vm.rolePermissions = angular.copy(vm.originalPermission);
            vm.previousPermission = [];
            updatePermissionList();
            vm.isReset = false;
        };

        function checkPermissionListRecursively(permission_node, list) {
            if (permission_node && permission_node._parents) {
                for (let j = 0; j < permission_node._parents.length; j++) {
                    permission_node._parents[j].greyed = !list.excluded;
                    permission_node._parents[j].selected = false;
                    permission_node._parents[j].excluded = list.excluded;
                    if (permission_node._parents[j].excluded) {
                        permission_node._parents[j].greyedBtn = true;
                    }
                    if (permission_node.isSelected) {
                        permission_node._parents[j].isSelected = true;
                    }
                    checkPermissionListRecursively(permission_node._parents[j], list);
                }
            }
        }

        function checkPermissionList(permission_node, list) {
            if (list.length > 0) {
                if (permission_node && permission_node._parents) {
                    for (let j = 0; j < permission_node._parents.length; j++) {
                        for (let i = 0; i < list.length; i++) {
                            if (list[i].path.match(permission_node._parents[j].path + permission_node._parents[j].name)) {
                                permission_node._parents[j].isSelected = !(permission_node._parents[j].path + "" + permission_node._parents[j].name == 'sos:products:joc_cockpit:event' && list[i].path == 'sos:products:joc_cockpit:event_action' || (permission_node._parents[j].path + "" + permission_node._parents[j].name == 'sos:products:joc_cockpit:event_action' && list[i].path == 'sos:products:joc_cockpit:event'));
                            }
                            if (list[i].path == (permission_node._parents[j].path + '' + permission_node._parents[j].name)) {
                                permission_node._parents[j].greyed = false;
                                permission_node._parents[j].selected = !list[i].excluded;
                                permission_node._parents[j].excluded = list[i].excluded;
                                if (!permission_node.excluded) {
                                    permission_node._parents[j].excludedParent = list[i].excluded;
                                }
                                checkPermissionListRecursively(permission_node._parents[j], list[i]);
                                list.splice(i, 1);
                                break;
                            }
                        }
                        checkPermissionList(permission_node._parents[j], list);
                    }
                } else {
                    for (let i = 0; i < list.length; i++) {
                        if (list[i].path.match(permission_node.path + permission_node.name)) {
                            permission_node.isSelected = !(permission_node.path + "" + permission_node.name == 'sos:products:joc_cockpit:event' && list[i].path == 'sos:products:joc_cockpit:event_action' || (permission_node.path + "" + permission_node.name == 'sos:products:joc_cockpit:event_action' && list[i].path == 'sos:products:joc_cockpit:event'));
                        }
                        if (list[i].path == (permission_node.path + '' + permission_node.name)) {
                            permission_node.greyed = false;
                            permission_node.selected = !list[i].excluded;
                            permission_node.excluded = list[i].excluded;
                            list.splice(i, 1);
                            break;
                        }
                    }
                }
            }
        }

        function selectedNode(permission_node, flag) {
            if (permission_node && permission_node._parents) {
                for (let j = 0; j < permission_node._parents.length; j++) {
                    permission_node._parents[j].greyed = true;
                    permission_node._parents[j].selected = false;
                    permission_node._parents[j].isSelected = permission_node.isSelected;
                    if (flag) {
                        permission_node._parents[j].greyedBtn = true;
                        permission_node._parents[j].excluded = true;
                    }
                    selectedNode(permission_node._parents[j], flag);
                }
            }
        }

        function unSelectedNode(permission_node, flag) {
            if (permission_node && permission_node._parents) {
                for (let j = 0; j < permission_node._parents.length; j++) {
                    permission_node._parents[j].greyed = false;
                    permission_node._parents[j].selected = false;
                    permission_node._parents[j].isSelected = permission_node.isSelected;
                    if (flag) {
                        permission_node._parents[j].greyedBtn = false;
                        permission_node._parents[j].excluded = false;
                    }
                    unSelectedNode(permission_node._parents[j], flag);
                }
            }
        }

        function selectedExcludeNode(permission_node) {
            if (permission_node && permission_node._parents) {
                for (let j = 0; j < permission_node._parents.length; j++) {
                    permission_node._parents[j].greyedBtn = true;
                    permission_node._parents[j].excluded = true;
                    permission_node._parents[j].excludedParent = false;
                    permission_node._parents[j].isSelected = permission_node.isSelected;
                    selectedExcludeNode(permission_node._parents[j]);
                }
            }
        }

        function unSelectedExcludeNode(permission_node) {
            if (permission_node && permission_node._parents) {
                for (let j = 0; j < permission_node._parents.length; j++) {
                    permission_node._parents[j].greyedBtn = false;
                    permission_node._parents[j].excluded = false;
                    permission_node._parents[j].excludedParent = false;
                    permission_node._parents[j].isSelected = permission_node.isSelected;
                    unSelectedExcludeNode(permission_node._parents[j]);
                }
            }
        }

        var svg;

        function switchTree() {
            if (!svg) {
                drawTree(permissionNodes[0][0]);
            }
        }

        var root;
        var boxWidth = 180,
            boxHeight = 30,
            duration = 700; // duration of transitions in ms
        var ht = 700;
        var width = window.innerWidth - 100;

        function calculateHeight() {
            var headerHt = $('.app-header').height() || 60;
            var topHeaderHt = $('.top-header-bar').height() || 16;
            var subHeaderHt = 59;
            var folderDivHt = $('.folder').height();
            ht = (window.innerHeight - (headerHt + topHeaderHt + subHeaderHt + folderDivHt + 250));
            $('#mainTree').css('height', ht + 80 + 'px');
        }

        calculateHeight();

        $(window).resize(function () {
            var headerHt = $('.app-header').height() || 60;
            var topHeaderHt = $('.top-header-bar').height() || 16;
            var subHeaderHt = 59;
            var folderDivHt = $('.folder').height();
            ht = (window.innerHeight - (headerHt + topHeaderHt + subHeaderHt + folderDivHt + 250));
            $('#mainTree').css('height', ht + 80 + 'px');
        });

        var t1 = '';

        function drawTree(json) {
            svg = d3.select("#mainTree").append("svg")
                .attr('width', width)
                .attr('height', ht - 10)
                .append('g')
                .attr("transform", "translate(150,250)");

            var tree = d3.layout.tree()
                .nodeSize([100, 250])
                .separation(function () {
                    return 0.5;
                })

                .children(function (permission_node) {
                    if (permission_node.collapsed) {

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
            draw(root, 0);
            var nodes;

            vm.expandAll = expandAll;

            function expandAll() {
                nodes.forEach(function (permission_node) {
                    if (permission_node.name == 'sos')
                        expand(permission_node);
                });
                $('svg').attr('height', 7150);
                $('svg').attr('width', 2010);
                draw(nodes[0], calculateTopMost());
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
                    if (permission_node.name == 'sos')
                        collapseNode(permission_node);
                });
                $('svg').attr('width', width);
                $('svg').attr('height', ht);
                $('svg g').attr('transform', "translate(150,250)");
                draw(nodes[0], 0);
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

            function expandSelected(permissionNodes) {
                if (permissionNodes.isSelected || permissionNodes.name == 'sos') {
                    permissionNodes.collapsed = false;
                    if (permissionNodes.icon)
                        permissionNodes.icon = "images/minus.png";
                }
                if (permissionNodes._parents)
                    permissionNodes._parents.forEach(expandSelected);
            }

            vm.expandSelected = function () {
                nodes.forEach(function (permissionNodes) {
                    if (permissionNodes.name == 'sos')
                        expandSelected(permissionNodes);
                });
                draw(nodes[0], calculateTopMost());
            };

            function collapseUnselected(permissionNodes) {
                if (!permissionNodes.isSelected && permissionNodes.name != 'sos') {
                    permissionNodes.collapsed = true;
                    if (permissionNodes.icon)
                        permissionNodes.icon = "images/plus.png";
                }
                if (permissionNodes._parents)
                    permissionNodes._parents.forEach(collapseUnselected);
            }

            vm.collapseUnselected = function () {
                nodes.forEach(function (permissionNodes) {
                    if (permissionNodes.name == 'sos')
                        collapseUnselected(permissionNodes);
                });
                draw(nodes[0], calculateTopMost());
            };
            function draw(source, diff) {

                nodes = tree.nodes(root);
                nodes.forEach(function (d) {
                    if (diff > 0) {
                        d.x = d.x + diff;
                    }
                });

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
                        return d.excluded ? d.excludedParent ? '#9E9E9E' : '#eee' : d.selected ? "#7fbfff" : d.greyed ? "#cce5ff" : "#fff";
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
                    .style("cursor", function (d) {
                        if (d.name == 'sos') {
                            return "default";
                        }
                        return d.greyedBtn ? "default" : "pointer";
                    })
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

                var t1 = $timeout(function () {
                    scrollToLast();
                    $timeout.cancel(t1);
                }, 850)

            }


            function checkWindowSize() {
                $('svg').attr('width', (endNodes2.rightMost.x - endNodes2.leftMost.x) + 520);
                if ($('svg').attr('width') > 2100) {
                    $('svg').attr('width', 2100)
                }
                $('svg').attr('height', (endNodes2.lowerMost.y - endNodes2.topMost.y + 300));
                if ($('svg').attr('height') < ht) {
                    $('svg').attr('height', ht);
                }

            }

            function scrollToLast() {
                const dom = $('mainTree');
                if (dom.width() < (endNodes2.rightMost.x + 284)) {
                    dom.animate({
                        scrollTop: endNodes2.rightMost.y,
                        scrollLeft: endNodes2.rightMost.x
                    }, 0);
                }

            }

            var endNodes2 = {leftMost: {}, rightMost: {}, topMost: {}, lowerMost: {}};

            function calculateTopMost() {
                endNodes2 = {leftMost: {}, rightMost: {}, topMost: {}, lowerMost: {}};
                nodes = tree.nodes(root);
                nodes.forEach(function (node) {
                    if (!endNodes2.rightMost.x || (endNodes2.rightMost.x <= node.y)) {
                        endNodes2.rightMost.x = node.y;
                        endNodes2.rightMost.y = node.x;
                    }
                    if (typeof endNodes2.leftMost.x == 'undefined' || (endNodes2.leftMost.x > node.y)) {
                        endNodes2.leftMost.x = node.y;
                        endNodes2.leftMost.y = node.x;
                    }
                    if (!endNodes2.topMost.y || (endNodes2.topMost.y >= node.x)) {
                        endNodes2.topMost.x = node.y;
                        endNodes2.topMost.y = node.x;
                    }
                    if (!endNodes2.lowerMost.y || (endNodes2.lowerMost.y <= node.x)) {
                        endNodes2.lowerMost.x = node.y;
                        endNodes2.lowerMost.y = node.x;
                    }

                });

                var diff = 0;
                if (endNodes2.topMost.y < -225) {
                    diff = (-endNodes2.topMost.y - 225);
                }
                checkWindowSize();
                return diff;
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

                draw(permission_node, calculateTopMost());
            }

            var _temp = [];

            function generatePermissionList(permission) {
                if (permission._parents) {
                    for (var i = 0; i < permission._parents.length; i++) {
                        if (permission._parents[i]) {
                            if (permission._parents[i].selected || (permission._parents[i].excluded && !permission._parents[i].greyedBtn)) {
                                var obj = {
                                    path: permission._parents[i].path + '' + permission._parents[i].name,
                                    excluded: !!permission._parents[i].excluded
                                };

                                if (_temp.indexOf(obj) == -1)
                                    _temp.push(obj);
                            }
                            generatePermissionList(permission._parents[i]);
                        }
                    }
                }
            }

            function setParentSelected(permission_node) {
                permission_node.parent.isSelected = true;
                if (permission_node.parent && permission_node.parent.parent) {
                    setParentSelected(permission_node.parent);
                }
            }

            function selectPermission(permission_node) {

                var _previousPermissionObj = angular.copy(vm.rolePermissions);

                if (!permission_node.greyed && permission_node.name != 'sos') {
                    permission_node.selected = !permission_node.selected;

                    if (permission_node.selected) {
                        permission_node.isSelected = true;
                        if (permission_node.parent && !permission_node.parent.isSelected) {
                            setParentSelected(permission_node);
                        }
                        selectedNode(permission_node);
                    } else {
                        permission_node.isSelected = false;
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
                    vm.isReset = true;
                    vm.previousPermission.push(_previousPermissionObj);
                }
            }

            function toggleExclude(permission_node) {
                var _previousPermissionObj = angular.copy(vm.rolePermissions);
                if (!permission_node.greyedBtn && permission_node.name != 'sos') {
                    permission_node.excluded = !permission_node.excluded;
                    permission_node.excludedParent = !permission_node.excludedParent;

                    if (permission_node.excluded) {
                        permission_node.isSelected = true;
                        if (permission_node.parent && !permission_node.parent.isSelected) {
                            setParentSelected(permission_node);
                        }
                        selectedExcludeNode(permission_node);
                    } else {
                        if (!permission_node.selected) {
                            permission_node.isSelected = false;
                        }
                        unSelectedExcludeNode(permission_node);
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
                    vm.isReset = true;
                    vm.previousPermission.push(_previousPermissionObj);
                }
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
                        return d.excluded ? d.excludedParent ? '#9E9E9E' : '#eee' : d.selected ? "#7fbfff" : d.greyed ? "#cce5ff" : "#fff";
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
                    .style("cursor", function (d) {
                        if (d.name == 'sos') {
                            return "default";
                        }
                        return d.greyedBtn ? "default" : "pointer";
                    });
            }
        }

        $scope.$on('$destroy', function () {
            watcher1();
            if (t1)
                $timeout.cancel(t1);
        });
    }
})();
