/**
 * Created by sourabhagrawal on 30/5/16.
 */

(function () {
    'use strict';
    angular
        .module('app')
        .controller('AppCtrl', AppCtrl)
        .controller('HeaderCtrl', HeaderCtrl)
        .controller('ConfigurationCtrl', ConfigurationCtrl)
        .controller('DialogCtrl', DialogCtrl)
        .controller('DialogCtrl1', DialogCtrl1)
        .controller('TreeDialogCtrl', TreeDialogCtrl)
        .controller('FrequencyCtrl', FrequencyCtrl)
        .controller('PeriodEditorCtrl', PeriodEditorCtrl)
        .controller('ScheduleEditorCtrl1', ScheduleEditorCtrl1)
        .controller('RuntimeEditorDialogCtrl', RuntimeEditorDialogCtrl)
        .controller('CalendarEditorDialogCtrl', CalendarEditorDialogCtrl)
        .controller('ClientLogCtrl', ClientLogCtrl)
        .controller('CalendarAssignDialogCtrl', CalendarAssignDialogCtrl)
        .controller('AddRestrictionDialogCtrl', AddRestrictionDialogCtrl)
        .controller('EditConditionDialogCtrl', EditConditionDialogCtrl);


    AppCtrl.$inject = ['$scope', '$rootScope', '$window', 'SOSAuth', '$uibModal', '$location', 'toasty', 'clipboard', 'CoreService', '$state', 'UserService', '$timeout', '$resource', 'gettextCatalog', 'TaskService', 'OrderService','DailyPlanService'];

    function AppCtrl($scope, $rootScope, $window, SOSAuth, $uibModal, $location, toasty, clipboard, CoreService, $state, UserService, $timeout, $resource, gettextCatalog, TaskService, OrderService,DailyPlanService) {
        const vm = $scope;
        vm.schedulerIds = {};
        $rootScope.currentYear = moment().format(('YYYY'));

        vm.userPreferences = {};

        /**
         * Exception Logging Service, currently only used by the $exceptionHandler
         * it preserves the default behaviour ( logging to the console) but
         * also posts the error server side after generating a stacktrace.
         */
        TraceKit.report.subscribe(function (errorReport) {
            try {
                if ($rootScope.clientLogFilter) {
                    var error = {
                        message: errorReport,
                        logTime: new Date(),
                        level: 'error'
                    };
                    $rootScope.clientLogs.push(error)
                }
            } catch (e) {
                console.error(e)
            }
        });

        vm.gotoErrorLocation = function () {
            $rootScope.$broadcast('gotoErrorLocation');
        };

        if ($window.sessionStorage.clientLogFilter) {
            $rootScope.clientLogFilter = JSON.parse($window.sessionStorage.clientLogFilter);
        } else {
            $rootScope.clientLogFilter = {};
            $rootScope.clientLogFilter.status = ['info', 'debug', 'error', 'warn', 'debug2', 'debug3'];
        }

        function loadSettingConfiguration(arg) {
            let configObj = {};
            configObj.jobschedulerId = $scope.schedulerIds.selected;
            configObj.account = $scope.permission.user;
            configObj.configurationType = "SETTING";
            if (!$window.sessionStorage.settingId) {
                $window.sessionStorage.settingId = 0;
            }
            UserService.configurations(configObj).then(function (res1) {
                if (res1.configurations && res1.configurations.length > 0) {
                    $window.sessionStorage.settingId = res1.configurations[0].id;
                    if (res1.configurations[0].configurationItem) {
                        $rootScope.clientLogFilter = JSON.parse(res1.configurations[0].configurationItem);
                    } else {
                        $rootScope.clientLogFilter.isEnable = false;
                    }
                    $window.sessionStorage.clientLogFilter = JSON.stringify($rootScope.clientLogFilter);
                } else {
                    $rootScope.clientLogFilter = {};
                    $rootScope.clientLogFilter.status = ['info', 'debug', 'error', 'warn', 'debug2', 'debug3'];
                    $rootScope.clientLogFilter.isEnable = false;
                    vm.saveSettingConf(true);
                }
                if (arg) {
                    $rootScope.clientLogs = [];
                    $window.localStorage.clientLogs = JSON.stringify($rootScope.clientLogs);
                }
                setTimeout(function () {
                    isLoaded = true;
                }, 0);
            }, function () {
                $rootScope.clientLogFilter.isEnable = false;
                isLoaded = true;
                $window.sessionStorage.clientLogFilter = JSON.stringify($rootScope.clientLogFilter);
            });
        }

        vm.logFilter = function (log) {
            return $rootScope.clientLogFilter.status.indexOf(log.level) !== -1;
        };
        vm.redirectToNewTab = function () {
            $window.open('#!/client-logs', '_blank');
        };

        vm.selectedScheduler = {};

        vm.getTimeFromDate = function(t) {
            let tf = vm.userPreferences.dateFormat;
            var x = "HH:mm:ss";
            if ((tf.match(/HH:mm:ss/gi) || tf.match(/HH:mm/gi) || tf.match(/hh:mm:ss A/gi) || tf.match(/hh:mm A/gi)) != null) {
                var result = (tf.match(/HH:mm:ss/gi) || tf.match(/HH:mm/gi) || tf.match(/hh:mm:ss A/gi) || tf.match(/hh:mm A/gi)) + '';
                if (result.match(/hh/g)) {
                    x = result + " a";
                } else {
                    x = result;
                }
            }
            let time = moment(t).format(x);
            if(time === '00:00' || time === '00:00:00'){
                time = '24:00:00'
            }
            return time;
        };

        vm.getTimeFromNumber = function(totalSeconds) {
            let hours = Math.floor(totalSeconds / 3600);
            totalSeconds %= 3600;
            let minutes = Math.floor(totalSeconds / 60);
            let seconds = totalSeconds % 60;
            minutes = String(minutes).padStart(2, "0");
            hours = String(hours).padStart(2, "0");
            seconds = String(seconds).padStart(2, "0");
            return (hours + ":" + minutes + ":" + seconds);
        };

        vm.colorFunction = function (d) {
            if (d == 0) {
                return 'green';
            } else if (d == 1) {
                return 'gold';
            } else if (d == 2) {
                return 'crimson';
            } else if (d == 3) {
                return 'dimgrey';
            } else if (d == 4) {
                return 'text-dark';
            } else if (d == 5) {
                return 'dark-orange';
            } else if (d == 6) {
                return 'corn-flower-blue';
            } else if (d == 7) {
                return 'dark-magenta';
            } else if (d == 8) {
                return 'chocolate';
            }
        };

        vm.colorBorderFunction = function (d) {
            if (d == 0) {
                return 'green-box';
            } else if (d == 1) {
                return 'gold-box';
            } else if (d == 2) {
                return 'crimson-box';
            } else if (d == 3) {
                return 'dimgrey-box';
            } else if (d == 4) {
                return 'text-dark-box';
            } else if (d == 5) {
                return 'dark-orange-box';
            } else if (d == 6) {
                return 'corn-flower-blue-box';
            } else if (d == 7) {
                return 'dark-magenta-box';
            } else if (d == 8) {
                return 'chocolate-box';
            }
        };

        vm.bgColorFunction = function (d) {
            if (d == 0) {
                return 'bg-green';
            } else if (d == 1) {
                return 'bg-gold';
            } else if (d == 2) {
                return 'bg-crimson';
            } else if (d == 3) {
                return 'bg-dimgrey';
            } else if (d == 4) {
                return 'bg-transparent';
            } else if (d == 5) {
                return 'bg-dark-orange';
            } else if (d == 6) {
                return 'bg-corn-flower-blue';
            } else if (d == 7) {
                return 'bg-dark-magenta';
            } else if (d == 8) {
                return 'bg-chocolate';
            }
        };

        vm.showCalendar = function (type, data) {
            vm.maxPlannedTime = undefined;
            vm.calendarTitle = new Date().getFullYear();
            let obj = {
                jobschedulerId: $scope.schedulerIds.selected,
                states: ['PLANNED'],
                dateFrom: "+0M",
                dateTo: "+0M",
                timeZone: vm.userPreferences.zone
            };
            if (type === 'Job') {
                vm._job = angular.copy(data);
                obj.job = data.path;
            } else {
                vm._jobChain = angular.copy(data);
                if (type === 'Order') {
                    vm._jobChain.name = data.orderId;
                    obj.jobChain = data.jobChain;
                    obj.orderId = data.orderId;
                } else {
                    obj.jobChain = data.path;
                }
            }
            vm.planItems = [];
            vm.isCalendarLoading = true;
            DailyPlanService.getPlans(obj).then(function (res) {
                populatePlanItems(res);
                vm.isCalendarLoading = false;
                $('#year-calendar').data('calendar').setCallBack(function (e) {
                        if (vm.isCalendarDisplay) {
                            vm.viewCalObj.calendarView = e.view;
                            vm.getPlan(e.currentYear, e.currentMonth, true);
                        } else {
                            vm.isCalendarDisplay = true;
                        }
                    }
                );
                $('#year-calendar').data('calendar').setDataSource(vm.planItems);
                vm.isCalendarDisplay = true;
            }, function () {
                vm.isCalendarLoading = false;
            });
            openCalendar();
        };

        vm.getPlan = function (newYear, newMonth, isReload) {
            vm.planItems = [];
            let date, year = newYear, month =  newMonth;
            let dom = $('#year-calendar').data('calendar');
            if(!year){
                year = dom.getYear();
                month = dom.getMonth();
            }

            if (!isReload) {
                vm.isCalendarDisplay = false;
                dom.setYearView({view: vm.viewCalObj.calendarView, year: year});
            }
            if (vm.viewCalObj.calendarView === 'year') {
                if (year < new Date().getFullYear()) {
                    return;
                } else if (year === new Date().getFullYear()) {
                    date = "+0y";
                } else {
                    date = "+" + (year - new Date().getFullYear()) + "y";
                }
            }
            if (vm.viewCalObj.calendarView === 'month') {
                if (year <= new Date().getFullYear() && month < new Date().getMonth()) {
                    return;
                } else if (year === new Date().getFullYear() && month === new Date().getMonth()) {
                    date = "+" + (month - new Date().getMonth()) + "M";
                } else {
                    date = "+" + (month - (new Date().getMonth() - (12 * (year - new Date().getFullYear())))) + "M";
                }
            }
            vm.isCalendarLoading = true;

            let obj = {
                jobschedulerId: $scope.schedulerIds.selected,
                states: ['PLANNED'],
                dateFrom: date,
                dateTo: date,
                timeZone: vm.userPreferences.zone
            };
            if (vm._job) {
                obj.job = vm._job.path;
            } else if(vm._jobChain){
                if (vm._jobChain.orderId) {
                    obj.jobChain = vm._jobChain.jobChain;
                    obj.orderId = vm._jobChain.orderId;
                } else {
                    obj.jobChain = vm._jobChain.path;
                }
            }
            DailyPlanService.getPlans(obj).then(function (res) {
                populatePlanItems(res);
                vm.isCalendarLoading = false;
                $('#year-calendar').data('calendar').setDataSource(vm.planItems);
                vm.isCalendarDisplay = true;
            }, function () {
                vm.isCalendarLoading = false;
            });
        };

        function populatePlanItems(res) {
            if (res.created) {
                vm.maxPlannedTime = new Date(res.created.until);
            }
            if (res.planItems && res.planItems.length > 0) {
                res.planItems.forEach(function (data) {
                    let planData = {
                        color: 'blue',
                        plannedStartTime: moment(data.plannedStartTime).tz(vm.userPreferences.zone),
                        orderId: data.orderId
                    };

                    let date = new Date(planData.plannedStartTime).setHours(0, 0, 0, 0);
                    planData.startDate = date;
                    planData.endDate = date;
                    if (data.period) {
                        if (data.period.end) {
                            planData.endTime = vm.getTimeFromDate(moment(data.period.end).tz(vm.userPreferences.zone));
                        }
                        if (data.period.repeat) {
                            planData.repeat = vm.getTimeFromNumber(data.period.repeat);
                        }
                    }
                    vm.planItems.push(planData);
                });
            }
        }

        function openCalendar() {
            vm.viewCalObj = {calendarView: 'month'};
            const modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/calendar-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                vm._job = null;
                vm._jobChain = null;
            }, function () {
                vm._job = null;
                vm._jobChain = null;
            });
        }

        vm.calculateHeight = function () {
            if (window.innerHeight > 450 && window.innerWidth > 740) {
                let headerHt = $('.app-header').height() || 60;
                let topHeaderHt = $('.top-header-bar').height() || 16;
                let subHeaderHt = 59;
                let ht = (window.innerHeight - (headerHt + topHeaderHt + subHeaderHt));
                $('.max-ht').css('height', ht + 'px');
                $('.max-ht2').css('height', ht - 56 + 'px');
                let subHeaderHt2 = $('.sub-header-2').height();
                if (subHeaderHt2) {
                    if (subHeaderHt2 < 30) {
                        ht = ht - subHeaderHt2 - 8;
                    }
                }
                $('.max-tree-ht').css('height', (ht - 43) + 'px');
            } else {
                $('.max-ht').css('height', 'auto');
                $('.max-ht2').css('height', 'auto');
                $('.max-tree-ht').css('height', 'auto');
            }
        };

        vm.navObj = {collapse: false};
        vm.checkNavHeader = function () {
            if ($('#navbar1').hasClass('in')) {
                $('#navbar1').removeClass('in');
                vm.navObj.collapse = false;
            }
        };

        $(window).resize(function () {
            vm.calculateHeight();
            vm.checkNavHeader();
            let a, b;
            if (document.getElementById('agent-cluster-status')) {
                a = document.getElementById('agent-cluster-status').clientHeight
            }
            if (document.getElementById('agent-running-task')) {
                b = document.getElementById('agent-running-task').clientHeight
            }
            if (a + b > 320) {
                $('#master-cluster-status').css('height', (a + b - 20) + 'px');
            }
        });

        vm.checkCopyName = function (list, name) {
            let _temp = '';
            if (/.+\((\d+)\)$/.test(name)) {
                _temp = name;
            } else {
                _temp = name + '(1)';
            }

            function recursion() {
                for (let j = 0; j < list.length; j++) {
                    if (list[j].name == _temp) {
                        _temp = _temp.replace(/\(\d+\)$/, '(' + (parseInt(/\((\d+)\)$/.exec(_temp)[1]) + 1) + ')');
                        recursion();
                    }
                }
            }

            recursion();
            return _temp;
        };

        function setUserPrefrences(preferences, configObj) {
            if ($window.sessionStorage.preferenceId == 0) {
                let timezone = jstz.determine();
                if (timezone)
                    preferences.zone = timezone.name() || $scope.selectedJobScheduler.timeZone;
                else {
                    preferences.zone = $scope.selectedJobScheduler.timeZone;
                }
                preferences.locale = $rootScope.locale.lang;
                preferences.dateFormat = 'DD.MM.YYYY HH:mm:ss';
                preferences.maxRecords = 10000;
                preferences.maxAuditLogRecords = 10000;
                preferences.maxHistoryPerOrder = 30;
                preferences.maxHistoryPerTask = 10;
                preferences.maxNumInOrderOverviewPerObject = 10;
                preferences.maxHistoryPerJobchain = 30;
                preferences.maxOrderPerJobchain = 5;
                preferences.maxAuditLogPerObject = 10;
                preferences.maxEntryPerPage = '1000';
                preferences.entryPerPage = '10';
                preferences.isNewWindow = 'newWindow';
                preferences.isDocNewWindow = 'newTab';
                preferences.isXSDNewWindow = 'newTab';
                preferences.historyTab = 'order';
                preferences.expandOption = 'single';
                preferences.pageView = 'list';
                preferences.theme = 'light';
                preferences.historyView = 'current';
                preferences.adtLog = 'current';
                preferences.agentTask = 'current';
                preferences.fileTransfer = 'current';
                preferences.showTasks = true;
                preferences.showOrders = false;
                if ($window.sessionStorage.$SOS$FORCELOGING === 'true' || $window.sessionStorage.$SOS$FORCELOGING == true)
                    preferences.auditLog = true;
                preferences.events = {};
                preferences.events.filter = [];
                preferences.events.taskCount = 0;
                preferences.events.jobCount = 0;
                preferences.events.jobChainCount = 0;
                preferences.events.positiveOrderCount = 0;
                preferences.events.negativeOrderCount = 0;
                configObj.configurationItem = JSON.stringify(preferences);

                configObj.id = 0;
                $window.sessionStorage.preferences = configObj.configurationItem;
                UserService.saveConfiguration(configObj).then(function (res) {
                    $window.sessionStorage.preferenceId = res.id;
                })
            }
        }

        vm.saveProfileSettings = function (preferences) {
            let configObj = {};
            configObj.jobschedulerId = $scope.schedulerIds.selected;
            configObj.account = $scope.permission.user;
            configObj.configurationType = "PROFILE";
            configObj.id = parseInt($window.sessionStorage.preferenceId);
            configObj.configurationItem = JSON.stringify(preferences);
            $window.sessionStorage.preferences = JSON.stringify(preferences);
            UserService.saveConfiguration(configObj);
        };

        function getUserProfileConfiguration(id, user, arg, reload) {
            let configObj = {};
            configObj.jobschedulerId = id;
            configObj.account = user;
            configObj.configurationType = "PROFILE";
            let preferences = {};

            UserService.configurations(configObj).then(function (res) {
                $window.sessionStorage.preferenceId = 0;
                if (res.configurations && res.configurations.length > 0) {
                    let conf = res.configurations[0];
                    $window.sessionStorage.preferenceId = conf.id;
                    if (conf.configurationItem) {
                        $window.sessionStorage.preferences = JSON.parse(JSON.stringify(conf.configurationItem));
                        document.getElementById('style-color').href = 'css/' + JSON.parse($window.sessionStorage.preferences).theme + '-style.css';
                        preferences = JSON.parse($window.sessionStorage.preferences);
                        if (preferences && !preferences.pageView) {
                            preferences.pageView = 'grid';
                        }
                        if (preferences && !preferences.historyView) {
                            preferences.historyView = 'current';
                        }
                        if (preferences && !preferences.adtLog) {
                            preferences.adtLog = 'current';
                        }
                        if (preferences && !preferences.agentTask) {
                            preferences.agentTask = 'current';
                        }
                        if (preferences && !preferences.fileTransfer) {
                            preferences.fileTransfer = 'current';
                        }
                        if (preferences && !preferences.historyTab) {
                            preferences.historyTab = 'order';
                        }
                        if (preferences && !preferences.expandOption) {
                            preferences.expandOption = 'single';
                        }
                        if (preferences && !preferences.isDocNewWindow) {
                            preferences.isDocNewWindow = 'newTab';
                        }
                        if (preferences && !preferences.isXSDNewWindow) {
                            preferences.isXSDNewWindow = 'newTab';
                        }
                        if (preferences && !preferences.maxNumInOrderOverviewPerObject) {
                            preferences.maxNumInOrderOverviewPerObject = 10;
                        }
                        if (!preferences.entryPerPage) {
                            preferences.entryPerPage = '10';
                            $window.sessionStorage.preferences = JSON.stringify(preferences);
                        }
                        if (($window.sessionStorage.$SOS$FORCELOGING === 'true' || $window.sessionStorage.$SOS$FORCELOGING === true) && !preferences.auditLog) {
                            preferences.auditLog = true;
                        }
                        $window.sessionStorage.preferences = JSON.stringify(preferences);
                        $window.localStorage.$SOS$THEME = preferences.theme;
                        $window.localStorage.$SOS$HEADERTHEME = preferences.headerColor;

                        $window.localStorage.$SOS$LANG = preferences.locale;
                        $resource("modules/i18n/language_" + preferences.locale + ".json").get(function (data) {
                            gettextCatalog.setCurrentLanguage(preferences.locale);
                            gettextCatalog.setStrings(preferences.locale, data);
                        });
                    } else {
                        setUserPrefrences(preferences, configObj);
                        if (reload) {
                            reloadThemeAndLang();
                        }
                    }

                    $rootScope.$broadcast('reloadPreferences');
                } else {
                    setUserPrefrences(preferences, configObj);
                    $rootScope.$broadcast('reloadPreferences');
                    if (reload) {
                        reloadThemeAndLang();
                    }
                }
                if (arg) {
                    $state.reload(arg);
                }
            }, function () {
                setUserPrefrences(preferences, configObj);
                $rootScope.$broadcast('reloadPreferences');
                if (arg) {
                    $state.reload(arg);
                }
            });
        }

        function reloadThemeAndLang() {
            $window.localStorage.removeItem('$SOS$LANG');
            $window.localStorage.removeItem('$SOS$THEME');
            $window.localStorage.removeItem('$SOS$HEADERTHEME');
            let p = JSON.parse($window.sessionStorage.preferences);
            document.getElementById('style-color').href = 'css/' + p.theme + '-style.css';
            $window.localStorage.$SOS$LANG = p.locale;
            $window.localStorage.$SOS$THEME = p.theme;
            $window.localStorage.$SOS$HEADERTHEME = p.headerColor;
            $resource("modules/i18n/language_" + p.locale + ".json").get(function (data) {
                gettextCatalog.setCurrentLanguage(p.locale);
                gettextCatalog.setStrings(p.locale, data);
            });
        }

        vm.username = SOSAuth.currentUserData;
        setPermission();
        setIds();
        if (vm.username && vm.schedulerIds.selected) {
            getUserProfileConfiguration(vm.schedulerIds.selected, vm.username);
        }
        setPreferences();

        $scope.$on('reloadPreferences', function () {
            setPreferences();
        });

        $scope.$on('reloadUser', function (evt, arg) {
            vm.username = SOSAuth.currentUserData;
            setPermission();
            setIds();
            if (vm.schedulerIds.selected) {
                isLoaded = false;
                loadSettingConfiguration(arg);
                if (vm.username) {
                    getUserProfileConfiguration(vm.schedulerIds.selected, vm.username, arg);
                }
            }
        });

        $scope.$on('reloadUserProfile', function (evt, arg) {
            loadSettingConfiguration(arg);
            getUserProfileConfiguration(vm.schedulerIds.selected, vm.username, null, true);
        });

        function setPermission() {
            if (SOSAuth.permission) {
                vm.permission = JSON.parse(SOSAuth.permission);
            } else {
                vm.permission = {};
            }
        }

        function setPreferences() {
            if ($window.sessionStorage.preferences && $window.sessionStorage.preferences != 'undefined') {
                vm.userPreferences = JSON.parse($window.sessionStorage.preferences);
                if ($window.sessionStorage.showViews) {
                    let showViews = JSON.parse($window.sessionStorage.showViews);
                    if (!_.isEmpty(showViews)) {
                        vm.showViews = showViews;
                    }
                }
            }
        }

        function setIds() {

            if (SOSAuth.scheduleIds) {
                vm.schedulerIds = JSON.parse(SOSAuth.scheduleIds);
            } else if ($location.search() && $location.search().scheduler_id) {
                vm.schedulerIds = $location.search().scheduler_id;
            } else {
                vm.schedulerIds = {};
            }
        }

        vm.print = function () {
            $window.print();
        };

        vm.exportSvg = function (name) {
            const dom = $('#graph');
            let ht = $(document).height();
            let wt = $(document).width();
            if (wt < dom.first()[0].scrollWidth) {
                wt = dom.first()[0].scrollWidth;
            }
            if (ht < dom.first()[0].scrollHeight) {
                ht = dom.first()[0].scrollHeight;
            }
            saveSvgAsPng(dom.first()[0].firstChild, name + ".png", {
                backgroundColor: dom.css("background-color"),
                height: ht + 200,
                width: wt + 200,
                left: -50,
                top: -50
            });
        };

        vm.showConfiguration = function (type, path, name) {
            vm.name = name;
            vm.type = type;
            vm.path = path;
            $uibModal.open({
                templateUrl: 'modules/core/template/show-configuration.html',
                controller: 'ConfigurationCtrl',
                scope: vm,
                size: 'lg'
            });
        };

        vm.showDocument = function (document) {
            let link = '';
            if (document.type === 'JOBCHAIN') {
                link = 'job_chain';
            } else if (document.type === 'JOB') {
                link = 'job';
            } else if (document.type === 'ORDER') {
                link = 'order';
            } else if (document.type === 'LOCK') {
                link = 'lock';
            } else if (document.type === 'PROCESSCLASS') {
                link = 'process_class';
            } else if (document.type === 'SCHEDULE') {
                link = 'schedule';
            } else if (document.type === 'WORKINGDAYSCALENDAR' || document.type === 'NONWORKINGDAYSCALENDAR') {
                link = 'calendar';
            }
            $location.path(link).search({path: document.path, scheduler_id: vm.schedulerIds.selected});
        };

        vm.showDocumentation = function (objType, objPath) {
            let link = './api/';
            if (objType === 'jobChain' && objPath) {
                link = link + 'job_chain/documentation?jobChain=' + encodeURIComponent(objPath);
            } else if (objType === 'job' && objPath) {
                link = link + 'job/documentation?job=' + encodeURIComponent(objPath);
            } else if (objType === 'order' && objPath) {
                link = link + 'order/documentation?orderId=' + encodeURIComponent(objPath.substring(objPath.lastIndexOf(',') + 1)) + '&jobChain=' + encodeURIComponent(objPath.substring(0, objPath.lastIndexOf(',')));
            } else if (objType === 'lock' && objPath) {
                link = link + 'lock/documentation?lock=' + encodeURIComponent(objPath);
            } else if (objType === 'processClass' && objPath) {
                link = link + 'process_class/documentation?processClass=' + encodeURIComponent(objPath);
            } else if (objType === 'schedule' && objPath) {
                link = link + 'schedule/documentation?schedule=' + encodeURIComponent(objPath);
            } else if (objType === 'calendar' && objPath) {
                link = link + 'calendar/documentation?calendar=' + encodeURIComponent(objPath);
            }
            if (link != '') {
                link = link + '&accessToken=' + SOSAuth.accessTokenId + '&jobschedulerId=' + vm.schedulerIds.selected;
                if (vm.userPreferences.isDocNewWindow === 'newWindow') {
                    $window.open(link, "Documenation, top=0,left=0" + windowProperties, true);
                } else {
                    $window.open(link, '_blank');
                }
            }
        };

        vm.downloadSchema = function (objType, schemaIdentifier) {
            let link = './api/xmleditor/schema/download?jobschedulerId=' + vm.schedulerIds.selected + '&objectType=' + objType + '&accessToken=' + SOSAuth.accessTokenId;
            if (objType === 'OTHER') {
                link = link + '&schemaIdentifier=' + encodeURIComponent(schemaIdentifier)
            }
            document.getElementById("tmpFrame").src = link;
        };

        vm.showXSD= function (objType, schemaIdentifier) {
            let link = './api/xmleditor/schema/download?show=true&jobschedulerId=' + vm.schedulerIds.selected + '&objectType='+objType+'&accessToken=' + SOSAuth.accessTokenId;
            if (objType === 'OTHER') {
                link = link + '&schemaIdentifier=' + encodeURIComponent(schemaIdentifier)
            }
            if (vm.userPreferences.isXSDNewWindow === 'newWindow') {
                $window.open(link, "XSD, top=0,left=0" + windowProperties, true);
            } else {
                $window.open(link, '_blank');
            }
        };

        vm.previewDocument = function (document) {
            let link = './api/documentation/preview?documentation=' + encodeURIComponent(document.path) + '&accessToken=' + SOSAuth.accessTokenId + '&jobschedulerId=' + vm.schedulerIds.selected;
            if (vm.userPreferences.isDocNewWindow === 'newWindow') {
                $window.open(link, "Documenation, top=0,left=0" + windowProperties, true);
            } else {
                $window.open(link, '_blank');
            }
        };

        if (!$window.localStorage.log_window_wt) {
            $window.localStorage.log_window_wt = 1000;
        }
        if (!$window.localStorage.log_window_ht) {
            $window.localStorage.log_window_ht = 200;
        }
        if (!$window.localStorage.log_window_x) {
            $window.localStorage.log_window_x = 100;
        }
        if (!$window.localStorage.log_window_y) {
            $window.localStorage.log_window_y = 200;
        }

        var newWindow = null, windowProperties = ',scrollbars=yes,resizable=yes,status=no,toolbar=no,menubar=no';

        $window.onunload = refreshParent;

        function refreshParent() {
            try {
                if (typeof newWindow != 'undefined' && newWindow != null && newWindow.closed == false) {
                    if (newWindow.sessionStorage.changedPreferences) {
                        vm.userPreferences.logFilter = JSON.parse(newWindow.sessionStorage.changedPreferences).logFilter;
                        $window.sessionStorage.preferences = JSON.stringify(vm.userPreferences);
                    }
                    newWindow.close();
                }
            } catch (x) {
                console.error(x)
            }
        }

        var t1, isLoaded = true;
        vm.showLogWindow = function (order, task, job, id, transfer) {
            if (!order && !task) {
                return;
            }
            refreshParent();
            if ((task && !vm.permission.Job.view.taskLog) || (order && !vm.permission.Order.view.orderLog)) {
                toasty.warning({
                    title: 'Permission denied',
                    timeout: 6000
                });
                return;
            }

            vm.openLog(order, task, job, id, transfer);
        };

        vm.openLog = function (order, task, job, id, transfer) {
            let url = null;
            if (vm.userPreferences.isNewWindow === 'newWindow') {
                try {
                    if (typeof newWindow === 'undefined' || newWindow == null || newWindow.closed === true) {
                        if (order && order.historyId && order.orderId) {
                            url = 'log.html#!/?historyId=' + encodeURIComponent(order.historyId) + '&orderId=' + encodeURIComponent(order.orderId) + '&jobChain=' + encodeURIComponent(order.jobChain);
                        } else if (task && task.taskId) {
                            if (task.job)
                                url = 'log.html#!/?taskId=' + encodeURIComponent(task.taskId) + '&job=' + encodeURIComponent(task.job);
                            else if (job)
                                url = 'log.html#!/?taskId=' + encodeURIComponent(task.taskId) + '&job=' + encodeURIComponent(job);
                            else
                                url = 'log.html#!/?taskId=' + encodeURIComponent(task.taskId);
                        } else {
                            return;
                        }

                        document.cookie = "$SOS$scheduleId=" + (id || vm.schedulerIds.selected) + ";path=/";
                        document.cookie = "$SOS$accessTokenId=" + SOSAuth.accessTokenId + ";path=/";
                        document.cookie = "$SOS$accountName=" + vm.username + ";path=/";

                        newWindow = $window.open(url, "Log", 'top=' + $window.localStorage.log_window_y + ',left=' + $window.localStorage.log_window_x + ',innerwidth=' + $window.localStorage.log_window_wt + ',innerheight=' + $window.localStorage.log_window_ht + windowProperties, true);

                        t1 = $timeout(function () {
                            calWindowSize();
                        }, 500);
                    }
                } catch (e) {
                    throw new Error(e.message);
                }
            } else if (vm.userPreferences.isNewWindow === 'newTab') {
                if (order && order.historyId && order.orderId) {
                    url = '#!/order/log?historyId=' + encodeURIComponent(order.historyId) + '&orderId=' + encodeURIComponent(order.orderId) + '&jobChain=' + encodeURIComponent(order.jobChain) + '&schedulerId=' + (id || vm.schedulerIds.selected);
                } else if (task && task.taskId) {
                    if (transfer) {
                        if (task.job)
                            url = '#!/file_transfer/log?taskId=' + encodeURIComponent(task.taskId) + '&job=' + encodeURIComponent(task.job) + '&schedulerId=' + (id || vm.schedulerIds.selected);
                        else if (job)
                            url = '#!/file_transfer/log?taskId=' + encodeURIComponent(task.taskId) + '&job=' + encodeURIComponent(job) + '&schedulerId=' + (id || vm.schedulerIds.selected);
                        else
                            url = '#!/file_transfer/log?taskId=' + encodeURIComponent(task.taskId) + '&schedulerId=' + (id || vm.schedulerIds.selected);
                    } else {
                        if (task.job)
                            url = '#!/job/log?taskId=' + encodeURIComponent(task.taskId) + '&job=' + encodeURIComponent(task.job) + '&schedulerId=' + (id || vm.schedulerIds.selected);
                        else if (job)
                            url = '#!/job/log?taskId=' + encodeURIComponent(task.taskId) + '&job=' + encodeURIComponent(job) + '&schedulerId=' + (id || vm.schedulerIds.selected);
                        else
                            url = '#!/job/log?taskId=' + encodeURIComponent(task.taskId) + '&schedulerId=' + (id || vm.schedulerIds.selected);
                    }
                } else {
                    return;
                }

                $window.open(url, '_blank');
            } else {
                let data = order || task || job || transfer;
                vm.downloadLog(data, id);
            }
        };

        vm.downloadLog = function (data, id) {
            if (data.orderId) {
                OrderService.info({
                    jobschedulerId: id || vm.schedulerIds.selected,
                    orderId: data.orderId,
                    jobChain: data.jobChain,
                    historyId: data.historyId
                }).then(function (res) {
                    document.getElementById("tmpFrame").src = './api/order/log/download?jobschedulerId=' + (id || vm.schedulerIds.selected) + '&filename=' + res.log.filename +
                        '&accessToken=' + SOSAuth.accessTokenId;
                });
            } else if (data.taskId) {
                TaskService.info({
                    jobschedulerId: id || vm.schedulerIds.selected,
                    taskId: data.taskId
                }).then(function (res) {
                    document.getElementById("tmpFrame").src = './api/task/log/download?&jobschedulerId=' + (id || vm.schedulerIds.selected) + '&filename=' + res.log.filename +
                        '&accessToken=' + SOSAuth.accessTokenId;
                });
            }
        };

        vm.end = function (task, path) {
            let jobs = {};
            jobs.jobs = [];
            let taskIds = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            taskIds.push({taskId: task.taskId});
            jobs.jobs.push({job: path, taskIds: taskIds});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = path;
                vm.comments.task = task.taskId;
                vm.comments.operation = 'End Task';
                vm.comments.type = 'Job';
                let modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.auditLog = {};
                    if (vm.comments.comment)
                        jobs.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobs.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobs.auditLog.ticketLink = vm.comments.ticketLink;
                    TaskService.end(jobs);
                }, function () {
                });
            } else {
                TaskService.end(jobs);
            }
        };

        vm.killTask = function (task, path) {
            let jobs = {};
            jobs.jobs = [];
            let taskIds = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            taskIds.push({taskId: task.taskId});
            jobs.jobs.push({job: path, taskIds: taskIds});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = path;
                vm.comments.task = task.taskId;
                vm.comments.operation = 'Kill Task';
                vm.comments.type = 'Job';

                let modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.auditLog = {};
                    if (vm.comments.comment)
                        jobs.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobs.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobs.auditLog.ticketLink = vm.comments.ticketLink;
                    TaskService.kill(jobs);

                }, function () {

                });
            } else {
                TaskService.kill(jobs);
            }
        };

        vm.terminateTask = function (task, path) {
            let jobs = {};
            jobs.jobs = [];
            let taskIds = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            taskIds.push({taskId: task.taskId});
            jobs.jobs.push({job: path, taskIds: taskIds});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = path;
                vm.comments.task = task.taskId;
                vm.comments.operation = 'Terminate Task';
                vm.comments.type = 'Job';
                let modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.auditLog = {};
                    if (vm.comments.comment)
                        jobs.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobs.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobs.auditLog.ticketLink = vm.comments.ticketLink;
                    TaskService.terminate(jobs);

                }, function () {

                });
            } else {
                TaskService.terminate(jobs);
            }
        };

        function terminateTaskWithTimeout(job, task, path) {
            let jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            let taskIds = [];
            taskIds.push({taskId: task.taskId});
            jobs.jobs.push({job: path, taskIds: taskIds});
            jobs.auditLog = {};
            if (vm.comments.comment) {
                jobs.auditLog.comment = vm.comments.comment;
            }
            if (vm.comments.timeSpent) {
                jobs.auditLog.timeSpent = vm.comments.timeSpent;
            }
            if (vm.comments.ticketLink) {
                jobs.auditLog.ticketLink = vm.comments.ticketLink;
            }
            jobs.timeout = vm.timeObj.timeout;
            TaskService.terminateWith(jobs);
        }

        vm.terminateTaskWithTimeout = function (job, task, path) {
            if (job) {
                vm.job = job;
            } else if (task && path) {
                vm.task = task;
                vm.path = path;
            }
            vm.comments = {};
            vm.comments.radio = 'predefined';
            vm.timeObj = {};
            vm.timeObj.timeout = 10;

            let modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/terminate-task-timeout-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                terminateTaskWithTimeout(job, task, path);
            }, function () {

            });
        };

        function calWindowSize() {
            if (newWindow) {
                try {
                    newWindow.addEventListener("beforeunload", function () {
                        if (newWindow.sessionStorage.changedPreferences) {
                            vm.userPreferences.logFilter = JSON.parse(newWindow.sessionStorage.changedPreferences).logFilter;
                            $window.sessionStorage.preferences = JSON.stringify(vm.userPreferences);
                        }
                        return null;
                    });
                    newWindow.addEventListener("resize", function () {
                        $window.localStorage.log_window_wt = newWindow.innerWidth;
                        $window.localStorage.log_window_ht = newWindow.innerHeight;
                        $window.localStorage.log_window_x = newWindow.screenX;
                        $window.localStorage.log_window_y = newWindow.screenY;
                    }, false);
                } catch (e) {
                    console.error(e);
                }
            }
        }

        vm.$on('order-list', function (event, path) {
            vm.showOrderLink(path)
        });

        vm.showJobChain = function (jobChain, id) {
            if (id && id !== vm.schedulerIds.selected) {
                return;
            }
            vm.showHistoryImmeditaly = false;
            if (vm.permission.JobChain.view.status) {
                $location.path('/job_chain').search({path: jobChain, scheduler_id: (id || vm.schedulerIds.selected)});
            }
        };

        vm.showJob = function (job, id) {
            if (id && id !== vm.schedulerIds.selected) {
                return;
            }
            if (vm.permission.Job.view.status) {
                $location.path('/job').search({path: job, scheduler_id: (id || vm.schedulerIds.selected)});
            }
        };

        vm.showJobChain1 = function (jobChain, id) {
            if (id && id !== vm.schedulerIds.selected) {
                return;
            }
            let path = jobChain.substring(0, jobChain.lastIndexOf('/')) || '/';
            let name = '';
            if (path != '/')
                name = path.substring(path.lastIndexOf('/') + 1, path.length);
            $rootScope.expand_to = {
                name: name,
                path: path
            };
            if (vm.permission.JobChain.view.status) {
                $location.path('/job_chains').search({});
            }
        };

        vm.showJob1 = function (job, id) {
            if (id && id !== vm.schedulerIds.selected) {
                return;
            }
            let path = job.substring(0, job.lastIndexOf('/')) || '/';
            let name = '';
            if (path != '/')
                name = path.substring(path.lastIndexOf('/') + 1, path.length);
            $rootScope.job_expand_to = {
                name: name,
                path: path
            };
            if (vm.permission.Job.view.status) {
                $location.path('/jobs').search({});
            }
        };

        vm.showOrderLink = function (path, id) {
            if (id && id !== vm.schedulerIds.selected) {
                return;
            }
            if (vm.permission.JobChain.view.status) {
                $location.path('/job_chain').search({path: path, scheduler_id: (id || vm.schedulerIds.selected)});
            }
        };

        vm.showOrderLink1 = function (jobChain, orderId, id) {
            if (id && id !== vm.schedulerIds.selected) {
                return;
            }
            let path = jobChain;
            if (orderId) {
                path = jobChain + ',' + orderId;
            }
            if (vm.permission.Order.view.status) {
                $location.path('/order').search({path: path, scheduler_id: (id || vm.schedulerIds.selected)});
            }
        };

        vm.showAgentCluster = function (agentCluster, id) {
            if (id && id !== vm.schedulerIds.selected) {
                return;
            }
            if (vm.permission.JobschedulerUniversalAgent.view.status) {
                $location.path('/agent_cluster').search({
                    path: agentCluster,
                    scheduler_id: (id || vm.schedulerIds.selected)
                });
            }
        };

        vm.showAgentCluster1 = function (agentCluster, id) {
            if (id && id !== vm.schedulerIds.selected) {
                return;
            }
            let path = agentCluster.substring(0, agentCluster.lastIndexOf('/')) || '/';
            let name = '';
            if (path != '/')
                name = path.substring(path.lastIndexOf('/') + 1, path.length);
            $rootScope.agent_cluster_expand_to = {
                name: name,
                path: path
            };
            if (vm.permission.JobschedulerUniversalAgent.view.status) {
                $location.path('/resources/agent_clusters/').search({});
            }
        };

        vm.showProcessClass = function (processClass, id) {
            if (id && id !== vm.schedulerIds.selected) {
                return;
            }
            if (vm.permission.ProcessClass.view.status) {
                $location.path('/process_class').search({
                    path: processClass,
                    scheduler_id: (id || vm.schedulerIds.selected)
                });
            }
        };

        vm.showProcessClass1 = function (processClass, id) {
            if (id && id !== vm.schedulerIds.selected) {
                return;
            }
            let path = processClass.substring(0, processClass.lastIndexOf('/')) || '/';
            let name = '';
            if (path != '/') {
                name = path.substring(path.lastIndexOf('/') + 1, path.length);
            }
            $rootScope.process_class_expand_to = {
                name: name,
                path: path
            };
            if (vm.permission.ProcessClass.view.status) {
                $location.path('/resources/process_classes').search({});
            }
        };

        vm.showScheduleLink = function (schedule, id) {
            if (id && id !== vm.schedulerIds.selected) {
                return;
            }
            if (vm.permission.Schedule.view.status) {
                $location.path('/schedule').search({path: schedule, scheduler_id: (id || vm.schedulerIds.selected)});
            }
        };

        vm.showScheduleLink1 = function (schedule, id) {
            if (id && id !== vm.schedulerIds.selected) {
                return;
            }
            let path = schedule.substring(0, schedule.lastIndexOf('/')) || '/';
            let name = '';
            if (path != '/')
                name = path.substring(path.lastIndexOf('/') + 1, path.length);
            $rootScope.schedule_expand_to = {
                name: name,
                path: path
            };
            if (vm.permission.Schedule.view.status) {
                $location.path('/resources/schedules').search({});
            }
        };

        vm.showCalendarLink = function (calendar, id) {
            if (id && id !== vm.schedulerIds.selected) {
                return;
            }
            if (vm.permission.Calendar.view.status) {
                $location.path('/calendar').search({path: calendar, scheduler_id: (id || vm.schedulerIds.selected)});
            }
        };

        vm.showCalendarLink1 = function (calendar, id) {
            if (id && id !== vm.schedulerIds.selected) {
                return;
            }
            let path = calendar.substring(0, calendar.lastIndexOf('/')) || '/';
            let name = '';
            if (path != '/')
                name = path.substring(path.lastIndexOf('/') + 1, path.length);
            $rootScope.calendar_expand_to = {
                name: name,
                path: path
            };
            if (vm.permission.Calendar.view.status) {
                $location.path('/resources/calendars').search({});
            }
        };

        vm.about = function () {
            vm.versionData = $rootScope.versionData;
            $uibModal.open({
                templateUrl: 'modules/core/template/about-dialog.html',
                controller: 'DialogCtrl1',
                scope: vm
            });
        };

        vm.copyLinkToObject = function (objType, path) {
            let link = '';
            let regEx = /(.+)\/#!/;
            if (!regEx.test($location.absUrl())) {
                return;
            }
            let host = regEx.exec($location.absUrl())[1];
            host = host + '/#!/';

            if (objType == 'jobChain' && path) {
                link = host + 'job_chain?path=' + encodeURIComponent(path);
            } else if (objType == 'job' && path) {
                link = host + 'job?path=' + encodeURIComponent(path);
            } else if (objType == 'order' && path) {
                link = host + 'order?path=' + encodeURIComponent(path);
            } else if (objType == 'agentCluster' && path) {
                link = host + 'agent_cluster?path=' + encodeURIComponent(path);
            } else if (objType == 'lock' && path) {
                link = host + 'lock?path=' + encodeURIComponent(path);
            } else if (objType == 'processClass' && path) {
                link = host + 'process_class?path=' + encodeURIComponent(path);
            } else if (objType == 'schedule' && path) {
                link = host + 'schedule?path=' + encodeURIComponent(path);
            } else if (objType == 'fileTransfer' && path) {
                link = host + 'file_transfer?id=' + encodeURIComponent(path);
            } else if (objType == 'calendar' && path) {
                link = host + 'calendar?path=' + encodeURIComponent(path);
            } else if (objType == 'document' && path) {
                link = host + 'documentation?path=' + encodeURIComponent(path);
            }
            if (link !== '') {
                clipboard.copyText(link + '&scheduler_id=' + vm.schedulerIds.selected);
            }
        };

        vm.navigateToResource = function () {
            vm.resourceFilters = CoreService.getResourceTab();
            if (vm.resourceFilters.state === 'agent') {
                if (vm.permission.JobschedulerUniversalAgent.view.status) {
                    $state.go('app.resources.agentClusters', {type: null});
                    return;
                } else {
                    vm.resourceFilters.state = 'agentJobExecutions';
                }
            }
            if (vm.resourceFilters.state === 'agentJobExecutions') {
                if (vm.permission.JobschedulerUniversalAgent.view.status) {
                    $state.go('app.resources.agentJobExecutions');
                    return;
                } else {
                    vm.resourceFilters.state = 'processClass';
                }
            }
            if (vm.resourceFilters.state === 'processClass') {
                if (vm.permission.ProcessClass.view.status) {
                    $state.go('app.resources.processClasses');
                    return;
                } else {
                    vm.resourceFilters.state = 'schedules';
                }
            }
            if (vm.resourceFilters.state === 'schedules') {

                if (vm.permission.Schedule.view.status) {
                    $state.go('app.resources.schedules');
                    return;
                } else {
                    vm.resourceFilters.state = 'locks';
                }
            }
            if (vm.resourceFilters.state === 'locks') {
                if (vm.permission.Lock.view.status) {
                    $state.go('app.resources.locks');
                    return;
                } else {
                    vm.resourceFilters.state = 'calendars';
                }
            }
            if (vm.resourceFilters.state === 'calendars') {
                if (vm.permission.Calendar.view.status) {
                    $state.go('app.resources.calendars');
                    return;
                } else {
                    vm.resourceFilters.state = 'events';
                }

            }
            if (vm.resourceFilters.state === 'events') {
                if (vm.permission.Event.view.status) {
                    $state.go('app.resources.events');
                    return;
                } else {
                    vm.resourceFilters.state = 'documentations';
                }
            }
            if (vm.resourceFilters.state === 'documentations' && vm.permission.Documentation.view) {
                $state.go('app.resources.documentations');
            }
        };

        vm.navigateToConfiguration = function () {
            vm.configFilters = CoreService.getConfigurationTab();
            $state.go(vm.configFilters.state);
        };

        vm.isIE = function () {
            return !!navigator.userAgent.match(/MSIE/i) || !!navigator.userAgent.match(/Trident.*rv:11\./);
        };

        vm.isFF = function () {
            return navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
        };


        var watcher = vm.$watchCollection('clientLogFilter.status', function (newNames, oldValues) {
            if (newNames != oldValues && vm.schedulerIds.selected && vm.permission.user && isLoaded) {
                vm.saveSettingConf();
            }
        });

        vm.saveSettingConf = function (flag) {
            if ($window.sessionStorage.settingId || flag) {
                let configObj = {};
                configObj.jobschedulerId = vm.schedulerIds.selected;
                configObj.account = vm.permission.user;
                configObj.configurationType = "SETTING";
                configObj.id = flag ? 0 : parseInt($window.sessionStorage.settingId);
                configObj.configurationItem = JSON.stringify($rootScope.clientLogFilter);
                $window.sessionStorage.clientLogFilter = JSON.stringify($rootScope.clientLogFilter);
                UserService.saveConfiguration(configObj).then(function (res) {
                    $window.sessionStorage.settingId = res.id;
                });
            }
        };

        $scope.$on('restrictionModalTemplateLoaded', function (evn) {
            vm.restrictionModalTemplate = 'restriction-modal';
        });

        $scope.$on('$viewContentLoaded', function () {
            vm.calculateHeight();
        });
        $scope.$on('$destroy', function () {
            watcher();
            if (t1)
                $timeout.cancel(t1);
        });
    }

    HeaderCtrl.$inject = ['$scope', 'UserService', 'JobSchedulerService', '$interval', 'toasty', 'SOSAuth', '$rootScope', '$location', 'gettextCatalog', '$window', '$state', '$uibModalStack', 'CoreService', '$timeout', 'PermissionService'];

    function HeaderCtrl($scope, UserService, JobSchedulerService, $interval, toasty, SOSAuth, $rootScope, $location, gettextCatalog, $window, $state, $uibModalStack, CoreService, $timeout, PermissionService) {
        const vm = $scope;

        function getDateFormat() {
            vm.dataFormat = vm.userPreferences.dateFormat || 'DD.MM.YYYY HH:mm:ss';
            if (vm.dataFormat.match('HH:mm')) {
                vm.dataFormat = vm.dataFormat.replace('HH:mm', '');
            } else if (vm.dataFormat.match('hh:mm')) {
                vm.dataFormat = vm.dataFormat.replace('hh:mm', '');
            }

            if (vm.dataFormat.match(':ss')) {
                vm.dataFormat = vm.dataFormat.replace(':ss', '');
            }
            if (vm.dataFormat.match('A')) {
                vm.dataFormat = vm.dataFormat.replace('A', '');
            }
            if (vm.dataFormat.match('|')) {
                vm.dataFormat = vm.dataFormat.replace('|', '');
            }
            vm.dataFormat = vm.dataFormat.replace('YY', 'yy');
            vm.dataFormat = vm.dataFormat.replace('YY', 'yy');
            vm.dataFormat = vm.dataFormat.replace('D', 'd');
            vm.dataFormat = vm.dataFormat.replace('D', 'd');
            vm.dataFormat = vm.dataFormat.trim();
        }

        vm.getCalendarTimeFormat = function () {
            const timeFormat = vm.userPreferences.dateFormat;
            if ((timeFormat.match(/HH:mm:ss/gi) || timeFormat.match(/HH:mm/gi) || timeFormat.match(/hh:mm:ss A/gi) || timeFormat.match(/hh:mm A/gi)) != null) {
                let result = (timeFormat.match(/HH:mm:ss/gi) || timeFormat.match(/HH:mm/gi) || timeFormat.match(/hh:mm:ss A/gi) || timeFormat.match(/hh:mm A/gi)) + '';
                if (result.match(/hh/g)) {
                    return result + " a";
                } else {
                    return result;
                }
            }
        };

        if (vm.userPreferences)
            getDateFormat();

        vm.currentTime = moment();
        var today = new Date();
        vm.minDate = new Date();
        vm.minDate.setDate(vm.minDate.getDate() - 1);

        var count = parseInt(SOSAuth.sessionTimeout / 1000);
        var resetDate = true;
        var interval = $interval(function () {
            --count;
            vm.currentTime = moment();
            if (moment(today).format('YYYY-MM-DD') != moment(vm.currentTime).format('YYYY-MM-DD') && resetDate) {
                resetDate = false;
                $rootScope.$broadcast('resetViewDate');
            }

            let s = parseInt((count) % 60),
                m = parseInt((count / (60)) % 60),
                h = parseInt((count / (60 * 60)) % 24),
                d = parseInt(count / (60 * 60 * 24));

            m = m > 9 ? m : '0' + m;
            s = s > 9 ? s : '0' + s;

            if (d == 0 && h != 0) {
                vm.remainingSessionTime = h + 'h ' + m + 'm ' + s + 's';
            } else if (d == 0 && h == 0 && m != 0) {
                vm.remainingSessionTime = m + 'm ' + s + 's';
            } else if (d == 0 && h == 0 && m == 0) {
                vm.remainingSessionTime = s + 's';
            } else {
                vm.remainingSessionTime = d + 'd ' + h + 'h';
            }

            if (count < 1) {
                $interval.cancel(interval);
                $window.localStorage.$SOS$URL = $location.path();
                $window.localStorage.$SOS$URLPARAMS = JSON.stringify($location.search());
                vm.logout('timeout');
            }
            if ($rootScope.clientLogFilter && $rootScope.clientLogFilter.isEnable) {
                try {
                    $window.localStorage.clientLogs = JSON.stringify($rootScope.clientLogs);
                    if ((1024 * 1024) - unescape(encodeURIComponent(JSON.stringify($window.localStorage.clientLogs))).length < 0) {
                        $window.localStorage.clientLogs.splice(1, 100);
                    }
                } catch (e) {
                    $rootScope.clientLogs = [];
                    $window.localStorage.clientLogs = JSON.stringify($rootScope.clientLogs);
                }
            }

            $window.localStorage.$SOS$DASHBOARDTABS = JSON.stringify(CoreService.getDashboard());
            try {
                if ((1024 * 1024) - unescape(encodeURIComponent(JSON.stringify($window.sessionStorage.$SOS$ALLEVENT))).length < 0) {
                    $window.sessionStorage.$SOS$ALLEVENT.splice(1, 100);
                }
            } catch (e) {

            }
        }, 1000);

        var isTouch = false;
        vm.refreshSession = function () {
            if (!isTouch) {
                isTouch = true;
                UserService.touch().then(function (res) {
                    isTouch = false;
                    if (res && res.ok)
                        count = parseInt(SOSAuth.sessionTimeout / 1000) - 2;
                }, function () {
                    isTouch = false;
                });
            }
        };
        vm.refreshSession();

        $scope.$on('reloadDate', function () {
            if (vm.selectedJobScheduler) {
                let date = new Date(vm.selectedJobScheduler.startedAt);
                date.setMilliseconds(date.getMilliseconds() + 1);
                vm.selectedJobScheduler.startedAt = date;
                if (vm.userPreferences)
                    getDateFormat();
            }
        });

        var logout = false;
        vm.logout = function (timeout) {
            logout = true;
            UserService.logout().then(function () {
                SOSAuth.clearUser();
                SOSAuth.clearStorage();
                if (timeout) {
                    $window.localStorage.setItem('clientLogs', '');
                    $window.sessionStorage.setItem('$SOS$JOBSCHEDULE', null);
                    $window.sessionStorage.setItem('$SOS$ALLEVENT', null);
                    $rootScope.$broadcast('reloadUser');
                    $location.path('/login').search({});
                } else {

                    CoreService.setDefaultTab();
                    angular.forEach($window.sessionStorage, function (item, key) {
                        $window.sessionStorage.removeItem(key);
                    });
                    $window.localStorage.setItem('$SOS$URLRESET', 'true');
                    window.location.reload();
                }
            });
        };


        if ($window.sessionStorage.$SOS$JOBSCHEDULE && $window.sessionStorage.$SOS$JOBSCHEDULE != 'null') {

            vm.selectedJobScheduler = JSON.parse($window.sessionStorage.$SOS$JOBSCHEDULE);
            if (vm.selectedJobScheduler && vm.selectedJobScheduler.state)
                vm.scheduleState = vm.selectedJobScheduler.state._text;
            vm.selectedScheduler.scheduler = vm.selectedJobScheduler;
            if (vm.selectedScheduler && vm.selectedScheduler.scheduler)
                document.title = vm.selectedScheduler.scheduler.host + ':' + vm.selectedScheduler.scheduler.port + '/' + vm.selectedScheduler.scheduler.jobschedulerId;
        }


        function getScheduleDetail() {
            JobSchedulerService.getJobSchedulerP({jobschedulerId: vm.schedulerIds.selected}).then(function (result) {
                JobSchedulerService.get({jobschedulerId: vm.schedulerIds.selected}).then(function (res) {
                    res.jobscheduler.os = result.jobscheduler.os;
                    res.jobscheduler.timeZone = result.jobscheduler.timeZone;
                    vm.selectedJobScheduler = res.jobscheduler;
                    vm.selectedScheduler.scheduler = vm.selectedJobScheduler;
                    if (vm.selectedScheduler && vm.selectedScheduler.scheduler)
                        document.title = vm.selectedScheduler.scheduler.host + ':' + vm.selectedScheduler.scheduler.port + '/' + vm.selectedScheduler.scheduler.jobschedulerId;
                    $window.sessionStorage.$SOS$JOBSCHEDULE = JSON.stringify(vm.selectedJobScheduler);
                    if (vm.selectedJobScheduler && vm.selectedJobScheduler.state)
                        vm.scheduleState = vm.selectedJobScheduler.state._text;
                    if (vm.selectedJobScheduler && vm.selectedJobScheduler.clusterType)
                        vm.permission.precedence = vm.selectedJobScheduler.clusterType.precedence;
                }, function () {
                    vm.selectedJobScheduler = result.jobscheduler;
                    vm.selectedScheduler.scheduler = vm.selectedJobScheduler;
                    if (vm.selectedScheduler && vm.selectedScheduler.scheduler)
                        document.title = vm.selectedScheduler.scheduler.host + ':' + vm.selectedScheduler.scheduler.port + '/' + vm.selectedScheduler.scheduler.jobschedulerId;
                    $window.sessionStorage.$SOS$JOBSCHEDULE = JSON.stringify(vm.selectedJobScheduler);
                });
            }, function () {
                JobSchedulerService.get({jobschedulerId: vm.schedulerIds.selected}).then(function (res) {
                    vm.selectedJobScheduler = res.jobscheduler;
                    vm.selectedScheduler.scheduler = vm.selectedJobScheduler;
                    if (vm.selectedScheduler && vm.selectedScheduler.scheduler)
                        document.title = vm.selectedScheduler.scheduler.host + ':' + vm.selectedScheduler.scheduler.port + '/' + vm.selectedScheduler.scheduler.jobschedulerId;
                    $window.sessionStorage.$SOS$JOBSCHEDULE = JSON.stringify(vm.selectedJobScheduler);
                    if (vm.selectedJobScheduler && vm.selectedJobScheduler.state)
                        vm.scheduleState = vm.selectedJobScheduler.state._text;
                    if (vm.selectedJobScheduler && vm.selectedJobScheduler.clusterType)
                        vm.permission.precedence = vm.selectedJobScheduler.clusterType.precedence;
                });
            });
        }

        $scope.$on('reloadScheduleDetail', function (evn, data) {
            if (data == true || data == 'true')
                getScheduleDetail(true);
            else
                getScheduleDetail(false);
        });

        function loadScheduleDetail(flag) {
            if (($state.current.name != 'app.dashboard' || flag) && vm.schedulerIds.selected) {
                getScheduleDetail();
            }
        }

        loadScheduleDetail();

        let tabsMap = new Map();

        vm.changeScheduler = function (jobScheduler) {
            vm.switchScheduler = true;
            vm.isSwitchLoaded = true;
            let key = angular.copy(vm.schedulerIds.selected);
            tabsMap.set(key, JSON.stringify(CoreService.getTabs()));
            vm.schedulerIds.selected = jobScheduler;
            JobSchedulerService.switchSchedulerId(jobScheduler).then(function () {
                JobSchedulerService.getSchedulerIds().then(function (res) {
                    if (res) {
                        let previousData = tabsMap.get(jobScheduler);
                        if (previousData) {
                            previousData = JSON.parse(previousData);
                            CoreService.setTabs(previousData);
                        } else {
                            CoreService.setDefaultTab();
                        }

                        SOSAuth.setIds(res);
                        PermissionService.savePermission(jobScheduler);
                        $rootScope.$broadcast('reloadUser', vm.currentState);
                        if ($location.path().match('job_chain_detail/')) {
                            $location.path('/').search({});
                        } else {
                            if ($state.current.name != 'app.dashboard')
                                getScheduleDetail();
                        }
                    } else {
                        toasty.error({
                            title: gettextCatalog.getString('message.oops'),
                            msg: gettextCatalog.getString('message.errorInLoadingScheduleIds'),
                            timeout: 10000
                        });
                    }
                    vm.isSwitchLoaded = false;
                }, function () {
                    vm.isSwitchLoaded = false;
                });
            }, function () {
                vm.isSwitchLoaded = false;
            })
        };

        vm.checkSchedulerId = function () {
            if ($location.search() && $location.search().scheduler_id && vm.schedulerIds.selected !== $location.search().scheduler_id) {
                vm.changeScheduler($location.search().scheduler_id);
            }
        };

        $scope.$on('$stateChangeSuccess', function (event, toState, toParam, fromState) {
            vm.currentState = toState.name;
            if (vm.schedulerIds.selected)
                if (toState.name != 'app.dashboard' && fromState.name == 'login') {
                    getScheduleDetail();
                }
            vm.checkNavHeader();
            if (vm.selectedScheduler && vm.selectedScheduler.scheduler)
                document.title = vm.selectedScheduler.scheduler.host + ':' + vm.selectedScheduler.scheduler.port + '/' + vm.selectedScheduler.scheduler.jobschedulerId;
            $uibModalStack.dismissAll();
            toasty.clear();
        });

        vm.eventId = '';
        var eventTimeOut = '';
        var eventLoading = false;
        vm.allEvents = '';

        vm.changeEvent = function (jobScheduler) {
            if (!eventLoading) {
                eventLoading = true;
                let obj = {};
                obj.jobscheduler = [];
                if (!vm.eventsRequest || vm.eventsRequest.length == 0) {
                    for (let i = 0; i < jobScheduler.length; i++) {
                        if (vm.schedulerIds.selected == jobScheduler[i]) {
                            obj.jobscheduler.push(
                                {"jobschedulerId": jobScheduler[i], "eventId": vm.eventId || ""}
                            );
                            break;
                        }
                    }
                    for (let j = 0; j < jobScheduler.length; j++) {
                        if (vm.schedulerIds.selected != jobScheduler[j]) {
                            obj.jobscheduler.push(
                                {"jobschedulerId": jobScheduler[j], "eventId": ""}
                            );
                        }
                    }
                } else {
                    obj.jobscheduler = vm.eventsRequest;
                }
                CoreService.getEvents(obj).then(function (res) {
                    if (!vm.switchScheduler && !logout) {
                        vm.eventsRequest = [];
                        if (res.events) {
                            for (let i = 0; i < res.events.length; i++) {
                                if (res.events[i].jobschedulerId === vm.schedulerIds.selected) {
                                    vm.events = [];
                                    vm.events.push(res.events[i]);
                                    $rootScope.$broadcast('event-started', {
                                        events: vm.events,
                                        otherEvents: res.events
                                    });

                                    vm.eventsRequest.push({
                                        jobschedulerId: res.events[i].jobschedulerId,
                                        eventId: res.events[i].eventId
                                    });
                                    angular.forEach(res.events[i].eventSnapshots, function (value1) {
                                        if (value1) {
                                            if (value1.eventType === "SchedulerStateChanged") {

                                                loadScheduleDetail();
                                            } else if (value1.eventType === "CurrentJobSchedulerChanged") {

                                                getScheduleDetail();
                                                $state.reload(vm.currentState);
                                            }
                                        }
                                    });
                                    break;
                                }
                            }

                            for (let i = 0; i < res.events.length; i++) {
                                if (res.events[i].jobschedulerId !== vm.schedulerIds.selected) {
                                    vm.eventsRequest.push({
                                        jobschedulerId: res.events[i].jobschedulerId,
                                        eventId: res.events[i].eventId
                                    });
                                }
                            }
                        }
                        vm.allEvents = res.events;
                        filterdEvents();
                    }

                    if (!logout) {
                        eventLoading = false;
                        vm.changeEvent(vm.schedulerIds.jobschedulerIds);
                    }
                    vm.switchScheduler = false;

                }, function (err) {
                    if (!logout && (err.status == 420 || err.status == 434 || err.status == 504)) {
                        eventTimeOut = $timeout(function () {
                            eventLoading = false;
                            vm.changeEvent(vm.schedulerIds.jobschedulerIds);
                            $timeout.cancel(eventTimeOut);
                        }, 1000);
                    }
                });
            }
        };
        $scope.$on('reloadEvents', function (event, data) {
            if (!logout) {
                eventLoading = false;
                vm.changeEvent(vm.schedulerIds.jobschedulerIds);
            }
        });
        vm.allSessionEvent = {group: [], eventUnReadCount: 0};


        if (vm.schedulerIds && vm.schedulerIds.jobschedulerIds && vm.schedulerIds.jobschedulerIds.length > 0) {
            vm.changeEvent(vm.schedulerIds.jobschedulerIds);
        }

        if ($window.sessionStorage.$SOS$ALLEVENT != "null" && $window.sessionStorage.$SOS$ALLEVENT != null) {
            if ($window.sessionStorage.$SOS$ALLEVENT.length != 0) {
                vm.allSessionEvent = angular.copy(JSON.parse($window.sessionStorage.$SOS$ALLEVENT));
            }
        }

        function filterdEvents() {
            let eventFilter = vm.userPreferences.events ? vm.userPreferences.events.filter : null;
            if (eventFilter && angular.isArray(eventFilter) && eventFilter.length > 0) {
                for (let i = 0; i < vm.allEvents.length; i++) {
                    if (vm.allEvents[i] && vm.allEvents[i].eventSnapshots) {
                        for (let j = 0; j < vm.allEvents[i].eventSnapshots.length; j++) {
                            if (vm.allEvents[i].eventSnapshots[j].eventId) {
                                var evnType = vm.allEvents[i].eventSnapshots[j].eventType;
                                if (evnType != 'JobStateChanged' && evnType != 'JobChainStateChanged') {
                                    if (eventFilter.indexOf(evnType) != -1) {
                                        var eventByPath = {};
                                        eventByPath.jobschedulerId = vm.allEvents[i].jobschedulerId;

                                        eventByPath.objectType = vm.allEvents[i].eventSnapshots[j].objectType;
                                        if (vm.allEvents[i].eventSnapshots[j].path.indexOf(',') != -1) {
                                            eventByPath.path = vm.allEvents[i].eventSnapshots[j].path.substring(0, vm.allEvents[i].eventSnapshots[j].path.lastIndexOf(','));
                                        } else {
                                            eventByPath.path = vm.allEvents[i].eventSnapshots[j].path;
                                        }
                                        eventByPath.eventId = vm.allEvents[i].eventSnapshots[j].eventId;
                                        eventByPath.events = [];
                                        eventByPath.events.push(vm.allEvents[i].eventSnapshots[j]);

                                        for (let m = 0; m <= eventByPath.events.length - 1; m++) {
                                            eventByPath.events[m].read = false;
                                        }
                                        var flag = true;

                                        if (vm.allSessionEvent.group) {
                                            for (let k = 0; k <= vm.allSessionEvent.group.length - 1; k++) {
                                                if (vm.allSessionEvent.group[k].objectType == eventByPath.objectType && vm.allSessionEvent.group[k].path == eventByPath.path && vm.allSessionEvent.group[k].jobschedulerId == eventByPath.jobschedulerId) {
                                                    for (let m = 0; m <= eventByPath.events.length - 1; m++) {
                                                        if (vm.allSessionEvent.group[k].events.indexOf(eventByPath.events[m]) == -1) {
                                                            vm.allSessionEvent.group[k].eventId = eventByPath.eventId;
                                                            vm.allSessionEvent.group[k].readCount = vm.allSessionEvent.group[k].readCount + 1;
                                                            vm.allSessionEvent.eventUnReadCount = vm.allSessionEvent.eventUnReadCount + 1;
                                                            eventByPath.events[m].read = false;
                                                            vm.allSessionEvent.group[k].events.push(eventByPath.events[m]);
                                                        }
                                                    }
                                                    flag = false;
                                                }
                                            }
                                        }

                                        if (flag) {
                                            eventByPath.readCount = 1;
                                            vm.allSessionEvent.eventUnReadCount = vm.allSessionEvent.eventUnReadCount + 1;
                                            if (vm.allSessionEvent.group) {
                                                vm.allSessionEvent.group.push(eventByPath);
                                            }
                                        }
                                    }
                                } else if (evnType == 'JobStateChanged') {
                                    var type = "Job" + vm.allEvents[i].eventSnapshots[j].state.charAt(0).toUpperCase() + vm.allEvents[i].eventSnapshots[j].state.slice(1);

                                    if (eventFilter.indexOf(type) != -1) {

                                        var eventByPath = {};
                                        eventByPath.jobschedulerId = vm.allEvents[i].jobschedulerId;

                                        eventByPath.objectType = vm.allEvents[i].eventSnapshots[j].objectType;
                                        eventByPath.eventId = vm.allEvents[i].eventSnapshots[j].eventId;
                                        if (vm.allEvents[i].eventSnapshots[j].path.indexOf(',') != -1) {
                                            eventByPath.path = vm.allEvents[i].eventSnapshots[j].path.substring(0, vm.allEvents[i].eventSnapshots[j].path.lastIndexOf(','));

                                        } else {
                                            eventByPath.path = vm.allEvents[i].eventSnapshots[j].path;
                                        }
                                        eventByPath.events = [];
                                        eventByPath.events.push(vm.allEvents[i].eventSnapshots[j]);

                                        for (let m = 0; m <= eventByPath.events.length - 1; m++) {
                                            eventByPath.events[m].read = false;
                                        }

                                        var flag = true;
                                        if (vm.allSessionEvent.group != undefined)
                                            for (let k = 0; k <= vm.allSessionEvent.group.length - 1; k++) {

                                                if (vm.allSessionEvent.group[k].objectType == eventByPath.objectType && vm.allSessionEvent.group[k].path == eventByPath.path && vm.allSessionEvent.group[k].jobschedulerId == eventByPath.jobschedulerId) {

                                                    for (let m = 0; m <= eventByPath.events.length - 1; m++) {
                                                        if (vm.allSessionEvent.group[k].events.indexOf(eventByPath.events[m]) == -1) {

                                                            vm.allSessionEvent.group[k].readCount = vm.allSessionEvent.group[k].readCount + 1;
                                                            vm.allSessionEvent.eventUnReadCount = vm.allSessionEvent.eventUnReadCount + 1;
                                                            eventByPath.events[m].read = false;

                                                            vm.allSessionEvent.group[k].eventId = eventByPath.eventId;
                                                            vm.allSessionEvent.group[k].events.push(eventByPath.events[m]);
                                                        }
                                                    }
                                                    flag = false;
                                                }
                                            }
                                        if (flag) {
                                            vm.allSessionEvent.eventUnReadCount = vm.allSessionEvent.eventUnReadCount + 1;
                                            eventByPath.readCount = 1;
                                            if (vm.allSessionEvent.group) {
                                                vm.allSessionEvent.group.push(eventByPath);
                                            }
                                        }
                                    }
                                } else if (evnType == 'JobChainStateChanged') {
                                    var type = "JobChain" + vm.allEvents[i].eventSnapshots[j].state.charAt(0).toUpperCase() + vm.allEvents[i].eventSnapshots[j].state.slice(1);
                                    if (eventFilter.indexOf(type) != -1) {
                                        var eventByPath = {};
                                        eventByPath.jobschedulerId = vm.allEvents[i].jobschedulerId;
                                        eventByPath.eventId = vm.allEvents[i].eventSnapshots[j].eventId;
                                        eventByPath.objectType = vm.allEvents[i].eventSnapshots[j].objectType;
                                        if (vm.allEvents[i].eventSnapshots[j].path.indexOf(',') != -1) {
                                            eventByPath.path = vm.allEvents[i].eventSnapshots[j].path.substring(0, vm.allEvents[i].eventSnapshots[j].path.lastIndexOf(','));
                                        } else {
                                            eventByPath.path = vm.allEvents[i].eventSnapshots[j].path;
                                        }
                                        eventByPath.events = [];
                                        eventByPath.events.push(vm.allEvents[i].eventSnapshots[j]);
                                        for (let m = 0; m <= eventByPath.events.length - 1; m++) {
                                            eventByPath.events[m].read = false;
                                        }
                                        var flag = true;
                                        if (vm.allSessionEvent.group != undefined)
                                            for (let k = 0; k <= vm.allSessionEvent.group.length - 1; k++) {
                                                if (vm.allSessionEvent.group[k].objectType == eventByPath.objectType && vm.allSessionEvent.group[k].path == eventByPath.path && vm.allSessionEvent.group[k].jobschedulerId == eventByPath.jobschedulerId) {
                                                    for (let m = 0; m <= eventByPath.events.length - 1; m++) {
                                                        if (vm.allSessionEvent.group[k].events.indexOf(eventByPath.events[m]) == -1) {

                                                            vm.allSessionEvent.group[k].readCount = vm.allSessionEvent.group[k].readCount + 1;
                                                            vm.allSessionEvent.eventUnReadCount = vm.allSessionEvent.eventUnReadCount + 1;
                                                            eventByPath.events[m].read = false;

                                                            vm.allSessionEvent.group[k].eventId = eventByPath.eventId;
                                                            vm.allSessionEvent.group[k].events.push(eventByPath.events[m]);
                                                        }
                                                    }
                                                    flag = false;
                                                }
                                            }
                                        if (flag) {
                                            eventByPath.readCount = 1;
                                            vm.allSessionEvent.eventUnReadCount = vm.allSessionEvent.eventUnReadCount + 1;
                                            if (vm.allSessionEvent.group) {
                                                vm.allSessionEvent.group.push(eventByPath);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                $window.sessionStorage.$SOS$ALLEVENT = angular.copy(JSON.stringify(vm.allSessionEvent));
            }
        }

        vm.showEvent = false;
        vm.expandNotification = function (group) {
            vm.showEvent = !vm.showEvent;
            vm.showGroupEvent = group;
            $window.sessionStorage.$SOS$ALLEVENT = angular.copy(JSON.stringify(vm.allSessionEvent));

        };
        vm.collapseNotification = function () {
            vm.showEvent = !vm.showEvent;
            $window.sessionStorage.$SOS$ALLEVENT = angular.copy(JSON.stringify(vm.allSessionEvent));
        };

        vm.updateAllEvent = function (event) {
            vm.allSessionEvent = [];
            vm.allSessionEvent = event;
        };

        vm.readEvent = function (group, event, allSessionEvent) {
            if (event.read == false) {
                event.read = true;
                group.readCount--;
                allSessionEvent.eventUnReadCount--;
            }
        };

        vm.viewObject = function (group, event, allSessionEvent) {
            if (event.read == false) {
                event.read = true;
                group.readCount--;
                allSessionEvent.eventUnReadCount--;
            }
            event.navigate = true;
            var p = event.path.substring(0, event.path.lastIndexOf('/'));
            if (vm.schedulerIds.selected != group.jobschedulerId) {
                $window.sessionStorage.$SOS$NAVIGATEOBJ = JSON.stringify({
                    tab: event.objectType,
                    path: p,
                    name: p.substring(p.lastIndexOf('/') + 1, p.length)
                });
                vm.changeScheduler(group.jobschedulerId);
            } else {
                if (event.objectType == 'JOB') {
                    $rootScope.job_expand_to = {
                        name: p.substring(p.lastIndexOf('/') + 1, p.length),
                        path: p
                    };

                    if ($location.path() == '/jobs') {

                        $rootScope.$broadcast('reloadObject');
                    } else {
                        $location.path('/jobs');
                    }

                } else if (event.objectType == 'ORDER') {
                    $rootScope.order_expand_to = {
                        name: p.substring(p.lastIndexOf('/') + 1, p.length),
                        path: p
                    };
                    if ($location.path() == '/orders') {
                        $rootScope.$broadcast('reloadObject');
                    } else {
                        $location.path('/orders');
                    }

                } else if (event.objectType == 'JOBCHAIN') {
                    $rootScope.expand_to = {
                        name: p.substring(p.lastIndexOf('/') + 1, p.length),
                        path: p
                    };
                    if ($location.path() == '/job_chains') {
                        $rootScope.$broadcast('reloadObject');
                    } else {
                        $location.path('/job_chains');
                    }

                }
            }
            $('li .dropdown').removeClass('open');
        };

        vm.makeAllGroupEventRead = function (allSessionEvent) {
            if (allSessionEvent.group != undefined) {
                for (let i = 0; i <= allSessionEvent.group.length - 1; i++) {
                    allSessionEvent.group[i].readCount = 0;
                    if (allSessionEvent.group[i].events != undefined)
                        for (let k = 0; k <= allSessionEvent.group[i].events.length - 1; k++) {
                            allSessionEvent.group[i].events[k].read = true;
                        }
                }
                allSessionEvent.eventUnReadCount = 0;
            }
            $window.sessionStorage.$SOS$ALLEVENT = angular.copy(JSON.stringify(allSessionEvent));
        };

        vm.makeAllEventRead = function (allSessionEvent, showGroupEvent) {
            if (showGroupEvent != undefined) {
                for (let i = 0; i <= showGroupEvent.events.length - 1; i++) {
                    if (showGroupEvent.events[i].read == false) {
                        allSessionEvent.eventUnReadCount--;
                    }
                    showGroupEvent.events[i].read = true;
                }
                showGroupEvent.readCount = 0;
            }
        };

        $scope.$on('$destroy', function () {
            $uibModalStack.dismissAll();
            $interval.cancel(interval);
            if (eventTimeOut)
                $timeout.cancel(eventTimeOut);
            $('.cluster-rect').popover('dispose');
        });

        vm.$on('Close-Model', function (evt, arg) {
            $uibModalStack.dismissAll(arg);
        });
    }

    ConfigurationCtrl.$inject = ['$scope', 'ResourceService', '$uibModalInstance'];

    function ConfigurationCtrl($scope, ResourceService, $uibModalInstance) {
        const vm = $scope;
        vm.editorOptions = {
            lineNumbers: true,
            mode: 'xml',
            readOnly: true,
            autoRefresh: true
        };
        vm.ok = function () {
            $uibModalInstance.close('ok');
        };
        vm.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
        let obj = {
            jobschedulerId: vm.schedulerIds.selected,
            mime: 'HTML'
        };
        if (vm.type === 'order') {
            obj.orderId = vm.name;
            obj.jobChain = vm.path;
        } else {
            obj[vm.type] = vm.path;
        }
        vm.codemirrorLoaded = function (_editor) {
            vm._editor = _editor;
        };
        let type = vm.type === 'jobChain' ? 'job_chain' : vm.type === 'processClass' ? 'process_class' : vm.type;
        ResourceService.getConfiguration(type, obj).then(function (res) {
            if (res) {
                vm.configuration = res.configuration;
                let xml = res.configuration.content.html;
                let x = xml.replace(/<[^>]+>/gm, '').replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&gt;/g, ">").replace(/&lt;/g, "<");
                vm._editor.setValue(vkbeautify.xml(x, 2));
            }
        });
    }

    DialogCtrl.$inject = ['$scope', '$uibModalInstance', '$window', '$uibModal', 'toasty', 'gettextCatalog'];

    function DialogCtrl($scope, $uibModalInstance, $window, $uibModal, toasty, gettextCatalog) {
        const vm = $scope;
        vm.error = false;
        if (vm.userPreferences.auditLog) {
            vm.display = true;
        }
        if ($window.sessionStorage.$SOS$FORCELOGING == 'true') {
            vm.required = true;
        }

        vm.predefinedMessageList = JSON.parse($window.sessionStorage.comments);

        function submit() {
            if ((vm.calendar && !vm.calendar.copy && vm.calendar.usedIn && vm.calendar.usedIn.length > 0) || vm.calendarArr || (vm.importCalendars && vm.importCalendars.length > 0)) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/confirm-dialog.html',
                    controller: 'DialogCtrl1',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    $uibModalInstance.close('ok');
                }, function () {

                });
            } else {
                if (vm.mainSection) {
                    $uibModalInstance.close(vm.mainSection);
                } else {
                    $uibModalInstance.close('ok');
                }
            }
        }

        vm.toggleView = function (value) {
            vm.fullSection = value;
            if (!value) {
                let main = [];
                angular.forEach(vm.mainSection, function (val) {
                    if (val.name && val.name != '') {
                        let obj = {};
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
                vm.mainText = '';
                angular.forEach(main, function (entry) {
                    if (entry.entryComment && entry.entryComment.length > 0) {
                        angular.forEach(entry.entryComment, function (comment) {
                            vm.mainText = vm.mainText + '#' + comment + '\n';
                        });
                    }
                    vm.mainText = vm.mainText + entry.entryName + ' = ';
                    if (entry.entryValue && entry.entryValue.length > 0) {
                        angular.forEach(entry.entryValue, function (value, index) {
                            vm.mainText = vm.mainText + (entry.entryValue.length > 1 ? '\\ \n' + value : value);
                            if (entry.entryValue.length - 1 !== index) {
                                vm.mainText = vm.mainText + ',';
                            }

                            if (entry.entryValue.length - 1 === index) {
                                vm.mainText = vm.mainText + '\n';
                            }
                        });
                    }
                });
            }
        };

        vm.generateObject = function () {
            let main = [];
            let obj = {entryName: '', entryValue: [], entryComment: []};
            let arr = vm.mainText.split('\n');
            let flag = false;
            for (let i = 0; i < arr.length; i++) {

                if (arr[i]) {
                    arr[i] = arr[i].trim();
                    if (arr[i].substring(0, 1) === '#') {
                        flag = false;
                        obj.entryComment.push(arr[i].substring(1));
                    } else if (arr[i].lastIndexOf('\\') === arr[i].length - 1) {
                        let index = arr[i].indexOf('=');
                        if (index > 0) {
                            flag = true;
                            obj.entryName = arr[i].substring(0, index);
                            let x = arr[i].substring(index + 1).trim();
                            let val = x.replace('\\', '');
                            if (val && val != '') {
                                obj.entryValue.push(val);
                            }
                        } else {
                            if (flag) {
                                let val = arr[i].substring(0, arr[i].lastIndexOf(','));
                                obj.entryValue.push(val);
                            }
                        }

                    } else {
                        if (flag) {
                            obj.entryValue.push(arr[i]);
                            main.push(obj);
                            obj = {entryValue: [], entryComment: []};
                            flag = false;
                        } else {
                            let index = arr[i].indexOf('=');
                            if (index > 0) {
                                obj.entryName = arr[i].substring(0, index);
                                let x = arr[i].substring(index + 1).trim();
                                let split = [];
                                if (x.substring(0, 1) === '\\') {
                                    split = x.split(',');
                                }
                                if (split.length > 0) {
                                    for (let j = 0; j < split.length; j++) {
                                        obj.entryValue.push(split[j].replace('\\', ''));
                                    }
                                } else {
                                    obj.entryValue.push(x.replace('\\', ''));
                                }
                                main.push(obj);
                                obj = {entryValue: [], entryComment: []};
                            }
                        }
                    }
                }
            }

            var mainSection = [];
            angular.forEach(main, function (entry) {
                let values = [];
                let comments = [];
                if (entry.entryComment && entry.entryComment.length > 0) {
                    angular.forEach(entry.entryComment, function (comment) {
                        comments.push({value: comment});
                    });
                } else {
                    comments.push({value: ''});
                }
                if (entry.entryValue && entry.entryValue.length > 0) {
                    angular.forEach(entry.entryValue, function (value) {
                        values.push({value: value});
                    });
                } else {
                    values.push({value: ''});
                }

                mainSection.push({
                    name: entry.entryName,
                    values: values,
                    comments: comments
                });
            });
            vm.mainSection = mainSection;
        };

        vm.addMainEntry = function () {
            var param = {
                name: '',
                values: [{value: ''}],
                comments: [{value: ''}]
            };
            if (vm.mainSection)
                vm.mainSection.push(param);
        };

        vm.addEntryValueField = function (index) {
            if (vm.mainSection[index].values)
                vm.mainSection[index].values.push({value: ''});
        };

        vm.removeEntry = function (index) {
            vm.mainSection.splice(index, 1);
        };

        vm.removeEntryValueField = function (parentIindex, index) {
            vm.mainSection[parentIindex].values.splice(index, 1);
        };

        vm.addEntryCommentField = function (index) {
            if (vm.mainSection[index].comments)
                vm.mainSection[index].comments.push({value: ''});
        };

        vm.removeEntryCommentField = function (parentIindex, index) {
            if (vm.mainSection[parentIindex].comments.length == 1) {
                vm.mainSection[parentIindex].comments[0].value = '';
            } else
                vm.mainSection[parentIindex].comments.splice(index, 1);
        };

        vm.ok = function (form) {
            if (vm.user) {
                if (/\s/.test(vm.user.user) && vm.user.fakepassword) {
                    toasty.error({
                        msg: gettextCatalog.getString('message.inValidUserName'),
                        timeout: 10000
                    });
                    return;
                } else if (/\s/.test(vm.user.user) && !vm.user.fakepassword) {
                    vm.user.user = encodeURIComponent(vm.user.user);
                }
                if (form) {
                    form.$setPristine();
                    form.$setUntouched();
                }
            }
            if (vm.paramObject) {
                var indexArr = [];
                angular.forEach(vm.paramObject.params, function (value, index) {
                    if ((value.name == '' || value.name == null) && (value.value == '' || value.value == null)) {
                        indexArr.push(index)
                    }
                });
                if (indexArr.length > 0) {
                    angular.forEach(indexArr, function (value, index) {
                        vm.paramObject.params.splice(value - index, 1);
                    })
                }
            }

            vm.error = false;
            if (vm.required && vm.comments) {
                if (vm.comments.comment) {
                    submit();
                } else {
                    vm.error = true;
                }
            } else {
                submit();
            }
        };

        vm.cancel = function (form) {
            if (form) {
                form.$setPristine();
                form.$setUntouched();
            }
            $uibModalInstance.dismiss('cancel');
        };

        vm.$on('closeModal', function () {
            $uibModalInstance.dismiss('cancel');
        });

        vm.addCriteria = function () {
            var param = {
                name: '',
                value: ''
            };
            if (vm.paramObject.params) {
                vm.paramObject.params.push(param);
            }
        };

        if (vm.paramObject) {
            vm.addCriteria();
        }

        vm.removeParams = function (index) {
            vm.paramObject.params.splice(index, 1);
        };

        vm.addRemoteSchedulers = function () {
            let param = {
                remoteScheduler: '',
                httpHeartbeatTimeout: '',
                httpHeartbeatPeriod: ''
            };
            vm.processClassObject.remoteSchedulers.remoteSchedulerList.push(param);
        };

        vm.removeRemoteSchedulers = function (index) {
            vm.processClassObject.remoteSchedulers.remoteSchedulerList.splice(index, 1);
        };
        if (vm.processClassObject && vm.processClassObject.remoteSchedulers) {
            vm.addRemoteSchedulers();
        }
    }

    DialogCtrl1.$inject = ['$scope', '$uibModalInstance', '$timeout'];

    function DialogCtrl1($scope, $uibModalInstance, $timeout) {
        let timeout = null;
        if ($scope.deployables && $scope.deployables.length > 0) {
            timeout = $timeout(function () {
                $scope.deployables[0].expanded = true;
            }, 1000);
        }
        $scope.ok = function (res) {
            $uibModalInstance.close(res || 'ok');
        };
        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.$on('$destroy', function () {
            if (timeout)
                $timeout.cancel(timeout);
        });
    }

    TreeDialogCtrl.$inject = ['$scope', '$rootScope', 'ResourceService', 'orderByFilter'];

    function TreeDialogCtrl($scope, $rootScope, ResourceService, orderBy) {
        var vm = $scope;
        vm.filterTree1 = [];
        vm.object = {};
        vm.filter_tree_control = {};
        vm.expanding_property = {
            field: "name"
        };

        function init() {
            ResourceService.tree({
                jobschedulerId: vm.schedulerIds.selected,
                compact: true,
                types: ["DOCUMENTATION"]
            }).then(function (res) {
                vm.filterTree1 = res.folders;
                angular.forEach(vm.filterTree1, function (value) {
                    value.expanded = true;
                    if (value.folders) {
                        value.folders = orderBy(value.folders, 'name');
                    }
                });

            }, function () {

            });
        }

        vm.$on('initTree', function () {
            vm.object.documents = [];
            $('#assignDocTreeModal').modal('show');
            init();
        });

        vm.treeExpand = function (data) {
            if (data.document) {
                $rootScope.$broadcast('closeDocumentTree', data.document);
                $('#assignDocTreeModal').modal('hide');
                return;
            }
            data.expanded = !data.expanded;
            if (data.expanded) {
                data.documents = [];
                var obj = {};
                obj.jobschedulerId = vm.schedulerIds.selected;
                obj.compact = true;
                obj.types = ['assignTypes'];
                obj.folders = [{folder: data.path, recursive: false}];
                ResourceService.getDocumentations(obj).then(function (res) {
                    data.documents = res.documentations
                });
            } else {
                data.calendars = [];
            }
        };

        vm.treeHandler = function (data) {
            if (data.expanded) {
                data.folders = orderBy(data.folders, 'name');
            }
        };
    }

    FrequencyCtrl.$inject = ['$scope', '$rootScope', 'gettextCatalog', 'CalendarService', 'RuntimeService'];

    function FrequencyCtrl($scope, $rootScope, gettextCatalog, CalendarService, RuntimeService) {
        const vm = $scope;
        vm.planItems = [];
        vm.editor = {};
        vm.frequency = {};
        vm.calObj = {};

        vm.minDate = new Date();
        vm.minDate.setDate(vm.minDate.getDate() - 1);

        vm.changeFrequency = function (str) {
            vm.frequency.tab = str;
            if (str === 'specificDays') {
                if ($('#calendar') && $('#calendar').data('calendar')) {

                } else {
                    $('#calendar').calendar({
                        language: localStorage.$SOS$LANG,
                        clickDay: (e) => {
                            selectDate(e.date);
                        }
                    });
                }
                $('#calendar').data('calendar').setDataSource(vm.tempItems);
            }
        };

        function convertStringToDate(date){
            if(typeof date === 'string'){
                return moment(date);
            }else{
                return date
            }
        }

        var tempList = [];

        //-------------------Begin year view ----------------------
        vm.Math = Math;

        var hd = new Holidays();
        // get supported countries
        vm.countryList = hd.getCountries('en');
        vm.countryList.IN = "India";
        vm.countryListArr = [];
        angular.forEach(vm.countryList, function (val, key) {
            vm.countryListArr.push({code: key, name: vm.countryList[key]})
        });
        vm.compareName = function (n1, n2) {
            if (n1.value.substring(0, 1) == 'Å') {
                n1.value = 'A' + n1.value.substring(1, n1.value.length)
            }
            if (n2.value.substring(0, 1) == 'Å') {
                n2.value = 'A' + n2.value.substring(1, n2.value.length)
            }
            return n1.value < n2.value ? -1 : 1;
        };

        var excludedDates = [], includedDates = [];

        function checkExclude(dates) {
            var obj = {
                tab: "specificDays",
                type: 'EXCLUDE',
                exclude: false,
                dates: []
            };

            angular.forEach(dates, function (date) {
                obj.dates.push(moment(date.startDate).format('YYYY-MM-DD'));
            });

            obj.str = frequencyToString(obj);
            var flag = true;

            if (vm.calendar.excludesFrequency.length > 0) {
                flag = false;
                for (let i = 0; i < vm.calendar.excludesFrequency.length; i++) {
                    if (vm.calendar.excludesFrequency[i].tab == obj.tab) {
                        flag = true;
                        for (let j = 0; j < vm.calendar.excludesFrequency[i].dates.length; j++) {
                            for (let x = 0; x < obj.dates.length; x++) {
                                if (vm.calendar.excludesFrequency[i].dates[j] == obj.dates[x]) {
                                    obj.dates.splice(x, 1);
                                    break;
                                }
                            }
                        }
                        vm.calendar.excludesFrequency[i].dates = vm.calendar.excludesFrequency[i].dates.concat(obj.dates);
                        vm.calendar.excludesFrequency[i].str = frequencyToString(vm.calendar.excludesFrequency[i]);
                        break;
                    }
                }
            } else {
                vm.calendar.excludesFrequency.push(obj);
            }
            if (!flag) {
                vm.calendar.excludesFrequency.push(obj);
            }
        }

        function checkInclude(dates) {
            var obj = {
                tab: "specificDays",
                type: 'INCLUDE',
                exclude: false,
                dates: []
            };

            angular.forEach(dates, function (date) {
                obj.dates.push(moment(date.startDate).format('YYYY-MM-DD'));
            });

            obj.str = frequencyToString(obj);

            var flag = true;
            if (vm.calendar.includesFrequency.length > 0) {
                flag = false;
                for (let i = 0; i < vm.calendar.includesFrequency.length; i++) {
                    if (vm.calendar.includesFrequency[i].tab == obj.tab) {
                        flag = true;
                        for (let j = 0; j < vm.calendar.includesFrequency[i].dates.length; j++) {
                            for (let x = 0; x < obj.dates.length; x++) {
                                if (vm.calendar.includesFrequency[i].dates[j] == obj.dates[x]) {
                                    obj.dates.splice(x, 1);
                                    break;
                                }
                            }
                        }
                        vm.calendar.includesFrequency[i].dates = vm.calendar.includesFrequency[i].dates.concat(obj.dates);
                        vm.calendar.includesFrequency[i].str = frequencyToString(vm.calendar.includesFrequency[i]);
                        break;
                    }
                }
            } else {
                vm.calendar.includesFrequency.push(obj);
            }
            if (!flag) {
                vm.calendar.includesFrequency.push(obj);
            }
        }

        function checkDate(date) {
            let planData = {
                startDate: date,
                endDate: date,
                color: '#007da6'
            };
            var flag = false, isFound = false, flg = false;
            if (vm.calObj.freqency == 'all' || JSON.parse(vm.calObj.freqency).type == 'INCLUDE') {
                if (vm.planItems.length == 0) {
                    includedDates = [];
                    includedDates.push(planData);
                    vm.planItems.push(planData);
                } else {
                    for (let i = 0; i < vm.planItems.length; i++) {
                        if ((new Date(vm.planItems[i].startDate).setHours(0, 0, 0, 0) == new Date(date).setHours(0, 0, 0, 0))) {
                            isFound = true;
                            if (vm.planItems[i].color != 'orange') {
                                vm.planItems[i].color = 'orange';
                                flag = true;
                            } else {
                                vm.planItems[i].color = 'blue';
                            }
                            break;
                        }
                    }
                    if (!isFound) {
                        planData.color = 'blue';
                        includedDates.push(planData);
                        vm.planItems.push(planData);
                    } else {
                        if (includedDates.length > 0) {
                            for (let i = 0; i < includedDates.length; i++) {
                                if ((new Date(includedDates[i].startDate).setHours(0, 0, 0, 0) == new Date(planData.startDate).setHours(0, 0, 0, 0))) {
                                    includedDates.splice(i, 1);
                                    break;
                                }
                            }
                        }
                    }
                    if (isFound && !flag) {
                        includedDates.push(planData);
                    }
                }

                if (!flag) {
                    if (excludedDates.length > 0) {
                        for (let i = 0; i < excludedDates.length; i++) {
                            if ((new Date(excludedDates[i].startDate).setHours(0, 0, 0, 0) == new Date(planData.startDate).setHours(0, 0, 0, 0))) {
                                excludedDates.splice(i, 1);
                                break;
                            }
                        }
                    }
                } else {
                    for (let i = 0; i < excludedDates.length; i++) {
                        if ((new Date(excludedDates[i].startDate).setHours(0, 0, 0, 0) == new Date(planData.startDate).setHours(0, 0, 0, 0))) {
                            flg = true;
                            break;
                        }
                    }
                    if (!flg) {
                        excludedDates.push(planData);
                    }
                }

            } else if (JSON.parse(vm.calObj.freqency).type == 'EXCLUDE') {
                if (vm.planItems.length == 0) {
                    excludedDates = [];
                    excludedDates.push(planData);
                    vm.planItems.push(planData);
                } else {
                    for (let i = 0; i < vm.planItems.length; i++) {
                        if ((new Date(vm.planItems[i].startDate).setHours(0, 0, 0, 0) == new Date(planData.startDate).setHours(0, 0, 0, 0))) {
                            isFound = true;
                            if (vm.planItems[i].color != 'orange') {
                                vm.planItems[i].color = 'orange';
                            } else {
                                vm.planItems[i].color = 'blue';
                                flag = true;
                            }
                            break;
                        }
                    }
                    if (!isFound) {
                        planData.color = 'orange';
                        excludedDates.push(planData);
                        vm.planItems.push(planData);
                    } else {
                        if (excludedDates.length > 0) {
                            for (let i = 0; i < excludedDates.length; i++) {
                                if ((new Date(excludedDates[i].startDate).setHours(0, 0, 0, 0) == new Date(planData.startDate).setHours(0, 0, 0, 0))) {
                                    excludedDates.splice(i, 1);
                                    break;
                                }
                            }
                        }
                    }
                }
                if (!flag) {
                    if (includedDates.length > 0) {
                        for (let i = 0; i < includedDates.length; i++) {
                            if ((new Date(includedDates[i].startDate).setHours(0, 0, 0, 0) == new Date(planData.startDate).setHours(0, 0, 0, 0))) {
                                includedDates.splice(i, 1);
                                break;
                            }
                        }
                    }
                } else {
                    for (let i = 0; i < includedDates.length; i++) {
                        if ((new Date(includedDates[i].startDate).setHours(0, 0, 0, 0) == new Date(planData.startDate).setHours(0, 0, 0, 0))) {
                            flg = true;
                            break;
                        }
                    }
                    if (!flg) {
                        includedDates.push(planData);
                    }
                }
            }
            $('#full-calendar').data('calendar').setDataSource(vm.planItems);
        }

        vm.addCalendarDates = function () {
            if (excludedDates.length > 0) {
                checkExclude(excludedDates);
            }
            if (includedDates.length > 0) {
                checkInclude(includedDates);
            }
            if (vm.flag) {
                vm.save();
            } else {
                vm.editor.showYearView = false;
            }
        };

        vm.holidayDays = {checked: false};
        vm.selectAllHolidays = function () {
            if (vm.holidayDays.checked && vm.holidayList.length > 0) {
                if (!vm.frequency.nationalHoliday) {
                    vm.frequency.nationalHoliday = [];
                }
                angular.forEach(vm.holidayList, function (holiday) {
                    if (vm.frequency.nationalHoliday.indexOf(holiday.date) == -1)
                        vm.frequency.nationalHoliday.push(holiday.date);
                });
            } else {
                if (vm.frequency.nationalHoliday && vm.frequency.nationalHoliday.length > 0)
                    angular.forEach(vm.holidayList, function (holiday) {
                        for (let x = 0; x < vm.frequency.nationalHoliday.length; x++) {
                            if (vm.frequency.nationalHoliday[x] == holiday.date) {
                                vm.frequency.nationalHoliday.splice(x, 1);
                                break;
                            }
                        }
                    });
            }
        };

        function selectDate(date) {
            let planData = {
                startDate: date,
                endDate: date,
                color: 'blue'
            };
            let flag = false, x = 0;
            for (let i = 0; i < vm.tempItems.length; i++) {
                if ((new Date(vm.tempItems[i].startDate).setHours(0, 0, 0, 0) == new Date(date).setHours(0, 0, 0, 0))) {
                    flag = true;
                    x = i;
                    break;
                }
            }
            if (!flag) {
                vm.tempItems.push(planData);
            } else {
                vm.tempItems.splice(x, 1);
            }
            vm.editor.isEnable = vm.tempItems.length > 0;
            $('#calendar').data('calendar').setDataSource(vm.tempItems);
        }

        vm.changeFrequencyObj = function (data) {
            if (data && data !== 'all' && !data.tab)
                data = JSON.parse(data);
            vm.planItems = [];
            let obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.calendar = {};
            if (data && data != 'all') {
                if (data.tab == 'weekDays') {
                    if (data.startingWithW) {
                        obj.dateFrom = moment(data.startingWithW).format('YYYY-MM-DD');
                    }
                    if (data.endOnW) {
                        obj.dateTo = moment(data.endOnW).format('YYYY-MM-DD');
                    }
                } else if (data.tab == 'specificWeekDays') {
                    if (data.startingWithS) {
                        obj.dateFrom = moment(data.startingWithS).format('YYYY-MM-DD');
                    }
                    if (data.endOnS) {
                        obj.dateTo = moment(data.endOnS).format('YYYY-MM-DD');
                    }
                } else if (data.tab == 'monthDays') {
                    if (data.startingWithM) {
                        obj.dateFrom = moment(data.startingWithM).format('YYYY-MM-DD');
                    }
                    if (data.endOnM) {
                        obj.dateTo = moment(data.endOnM).format('YYYY-MM-DD');
                    }
                } else if (data.tab == 'every') {
                    if (data.startingWith) {
                        obj.dateFrom = moment(data.startingWith).format('YYYY-MM-DD');
                    }
                    if (data.endOn) {
                        obj.dateTo = moment(data.endOn).format('YYYY-MM-DD');
                    }
                }
            }
            vm.isCalendarLoading = true;

            if (!obj.dateFrom) {
                obj.dateFrom = moment(vm.calendar.from).format('YYYY-MM-DD') || moment().format('YYYY-MM-DD');
            }
            if (!obj.dateTo) {
                obj.dateTo = moment(vm.calendar.to).format('YYYY-MM-DD');
                vm.toDate = angular.copy(obj.dateTo);
                if (new Date(obj.dateTo).getTime() > new Date(vm.calendarTitle + '-12-31').getTime()) {
                    obj.dateTo = vm.calendarTitle + '-12-31';
                }
            }

            if (data && data != 'all') {
                vm.editor.showYearView = true;
                vm.calObj.freqency = JSON.stringify(data);
                let obj1 = {};
                obj1.includes = {};
                let data1 = angular.copy(data);
                data1.type = 'INCLUDE';
                vm.frequencyObj = RuntimeService.generateCalendarObj(data1, obj1);
            } else {
                vm.calObj.freqency = 'all';
                vm.frequencyObj = generateCalendarAllObj();
            }

            obj.calendar = vm.frequencyObj;
            $('#full-calendar').calendar({
                language: localStorage.$SOS$LANG,
                view: 'year',
                clickDay: (e) => {
                    checkDate(e.date);
                }
            });
            CalendarService.getListOfDates(obj).then(function (result) {
                let color = 'blue';
                if (data && data.type === 'EXCLUDE') {
                    color = 'orange';
                }
                angular.forEach(result.dates, function (date) {
                    vm.planItems.push({
                        startDate: moment(date),
                        endDate: moment(date),
                        color: color
                    });
                });
                angular.forEach(result.withExcludes, function (date) {
                    vm.planItems.push({
                        startDate: moment(date),
                        endDate: moment(date),
                        color: 'orange'
                    });
                });
                let calendarDom = $('#full-calendar').data('calendar');
                calendarDom.setCallBack(function (e) {
                        if (vm.isCalendarDisplay) {
                            if(e.view === 'year') {
                                vm.calendarTitle = e.currentYear;
                                vm.changeDate();
                            }
                        } else {
                            vm.isCalendarDisplay = true;
                        }
                    }
                );
                tempList = angular.copy(vm.planItems);
                vm.isCalendarLoading = false;
                calendarDom.setDataSource(tempList);
                setTimeout(() => {
                    vm.isCalendarDisplay = true;
                }, 100);
            }, function () {
                vm.isCalendarLoading = false;
            });
        };

        vm.showCalendar = function (data) {
            vm.calendarTitle = new Date().getFullYear();
            vm.frequencyList1 = [];
            if (vm.calendar.includesFrequency.length > 0) {
                angular.forEach(vm.calendar.includesFrequency, function (data) {
                    vm.frequencyList1.push(data)
                });
            }
            if (vm.calendar.excludesFrequency.length > 0) {
                angular.forEach(vm.calendar.excludesFrequency, function (data) {
                    vm.frequencyList1.push(data)
                });
            }
            vm.changeFrequencyObj(data);
        };

        vm.getDateFormat = function (date) {
            return moment(date).format(vm.dataFormat.toUpperCase());
        };

        vm.loadHolidayList = function () {
            vm.holidayDays.checked = false;
            vm.holidayList = [];
            var holidays = [];
            if (vm.frequency.country && vm.frequency.year) {
                hd.init(vm.frequency.country);
                holidays = hd.getHolidays(vm.frequency.year);
                angular.forEach(holidays, function (holiday) {
                    if (holiday.type == 'public' && holiday.date && holiday.name && holiday.date != 'null') {
                        if (holiday.date.length > 19) {
                            holiday.date = holiday.date.substring(0, 19);
                        }
                        holiday.date = moment(holiday.date).format('YYYY-MM-DD');
                        vm.holidayList.push(holiday);
                    }
                });
            }
            if (vm.frequencyList.length > 0) {
                for (let i = 0; i < vm.frequencyList.length; i++) {
                    if (vm.frequencyList[i].tab == 'nationalHoliday' && vm.frequencyList[i].nationalHoliday.length > 0 && new Date(vm.frequencyList[i].nationalHoliday[0]).getFullYear() == vm.frequency.year) {
                        vm.frequency.nationalHoliday = angular.copy(vm.frequencyList[i].nationalHoliday);
                        break;
                    }
                }
            }

        };
        //-------------------End year view ----------------------

        var selectedMonths = [];
        vm.selectMonthDays = function (value) {
            if (selectedMonths.indexOf(value) == -1) {
                selectedMonths.push(value);
            } else {
                selectedMonths.splice(selectedMonths.indexOf(value), 1);
            }
            vm.frequency.selectedMonths = angular.copy(selectedMonths);
            vm.frequency.selectedMonths.sort(RuntimeService.compareNumbers);
            vm.editor.isEnable = selectedMonths.length > 0;
        };

        vm.getSelectedMonthDays = function (value) {
            if (selectedMonths.indexOf(value) != -1)
                return true;
        };

        var selectedMonthsU = [];
        vm.selectMonthDaysU = function (value) {
            if (selectedMonthsU.indexOf(value) == -1) {
                selectedMonthsU.push(value);
            } else {
                selectedMonthsU.splice(selectedMonthsU.indexOf(value), 1);
            }
            vm.frequency.selectedMonthsU = angular.copy(selectedMonthsU);
            vm.frequency.selectedMonthsU.sort(RuntimeService.compareNumbers);
            vm.editor.isEnable = selectedMonthsU.length > 0;
        };

        vm.getSelectedMonthDaysU = function (value) {
            if (selectedMonthsU.indexOf(value) != -1) {
                return true;
            }
        };

        vm.changeYear = function (form1) {
            if (form1 && form1.$invalid)
                form1.$invalid = false;
            setTimeout(function () {
                $rootScope.$broadcast("calendar.refreshView")
            }, 0)
        };

        var watcher1 = vm.$watchCollection('frequency', function (newNames) {
            if (newNames) {
                if (newNames.tab == 'monthDays') {
                    vm.str = newNames.isUltimos != 'months' ? gettextCatalog.getString('label.ultimos') : gettextCatalog.getString('label.monthDays');
                } else {
                    if (newNames.tab == 'specificWeekDays') {
                        vm.str = gettextCatalog.getString('label.specificWeekDays');
                    } else if (newNames.tab == 'specificDays') {
                        vm.str = gettextCatalog.getString('label.specificDays');
                    } else if (newNames.tab == 'weekDays') {
                        vm.str = gettextCatalog.getString('tab.weekDays');
                    } else if (newNames.tab == 'every') {
                        vm.str = gettextCatalog.getString('tab.every');
                    } else if (newNames.tab == 'nationalHoliday') {
                        vm.str = gettextCatalog.getString('tab.nationalHoliday');
                    }
                }

                if (newNames.tab == 'specificWeekDays') {
                    vm.editor.isEnable = !!(newNames.specificWeekDay && newNames.which);
                } else if (newNames.tab == 'monthDays') {
                    if (newNames.isUltimos === 'months') {
                        vm.editor.isEnable = selectedMonths.length != 0;
                    } else {
                        vm.editor.isEnable = selectedMonthsU.length != 0;
                    }

                } else if (newNames.tab == 'every') {
                    vm.editor.isEnable = !!(newNames.interval && newNames.dateEntity);
                } else if (newNames.tab == 'nationalHoliday') {
                    vm.editor.isEnable = !!(newNames.nationalHoliday && newNames.nationalHoliday.length > 0);
                } else if (newNames.tab == 'weekDays') {
                    vm.editor.isEnable = !!(newNames.days && newNames.days.length > 0);
                } else if (newNames.tab == 'specificDays') {
                    vm.editor.isEnable = vm.tempItems.length > 0;
                }
            }
        });
        var watcher2 = vm.$watchCollection('frequency.days', function (newNames) {
            if (newNames) {
                vm.editor.isEnable = newNames.length > 0;
                vm.frequency.all = newNames.length === 7;
                vm.frequency.days.sort();
            }
        });
        var watcher3 = vm.$watchCollection('frequency.months', function (newNames) {
            if (newNames) {
                vm.frequency.allMonth = newNames.length === 12;
                vm.frequency.months.sort(RuntimeService.compareNumbers);
            }
        });
        var watcher4 = vm.$watchCollection('frequency.nationalHoliday', function (newNames) {
            vm.editor.isEnable = !!(newNames && newNames.length > 0);
            if (vm.holidayList && newNames) {
                vm.holidayDays.checked = vm.holidayList.length === newNames.length;
            }
        });

        vm.checkAllWeek = function () {
            if (vm.frequency.all) {
                vm.frequency.days = ["0", "1", "2", "3", "4", "5", "6"]
            } else {
                vm.frequency.days = []
            }
        };

        vm.checkAllMonth = function () {
            if (vm.frequency.allMonth) {
                vm.frequency.months = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]
            } else {
                vm.frequency.months = []
            }
        };

        function generateCalendarAllObj() {
            var obj = {};
            if (vm.calendar.includesFrequency.length > 0) {
                obj.includes = {};
                angular.forEach(vm.calendar.includesFrequency, function (data) {
                    obj = RuntimeService.generateCalendarObj(data, obj);
                });
            }
            if (vm.calendar.excludesFrequency.length > 0) {
                obj.excludes = {};
                angular.forEach(vm.calendar.excludesFrequency, function (data) {
                    obj = RuntimeService.generateCalendarObj(data, obj);
                });
            }
            return obj;
        }

        function generateFrequencyObj() {
            vm.tempItems = [];
            for (let i = 0; i < vm.frequencyList.length; i++) {
                if (vm.frequencyList[i].tab == 'weekDays') {
                    vm.frequency.days = angular.copy(vm.frequencyList[i].days);
                    vm.frequency.all = vm.frequency.days.length == 7;

                } else if (vm.frequencyList[i].tab == 'monthDays') {
                    if (vm.frequencyList[i].isUltimos == 'months') {
                        vm.frequency.selectedMonths = angular.copy(vm.frequencyList[i].selectedMonths);
                    } else {
                        vm.frequency.selectedMonthsU = angular.copy(vm.frequencyList[i].selectedMonthsU);
                    }
                    if (vm.frequencyList[i].isUltimos == 'months') {
                        selectedMonths = [];
                        angular.forEach(vm.frequencyList[i].selectedMonths, function (val) {
                            vm.selectMonthDays(val);
                        });
                    } else {
                        selectedMonthsU = [];
                        angular.forEach(vm.frequencyList[i].selectedMonthsU, function (val) {
                            vm.selectMonthDaysU(val);
                        });
                    }
                } else if (vm.frequencyList[i].tab == 'specificDays') {
                    angular.forEach(vm.frequencyList[i].dates, function (date) {
                        vm.tempItems.push({
                            startDate: convertStringToDate(date),
                            endDate: convertStringToDate(date),
                            color: 'blue'
                        });
                    });
                }
            }
        }

        vm.addFrequency = function () {
            vm.countryField = false;
            vm.frequency.str = frequencyToString(vm.frequency);
            var flag = false;
            if (vm.isRuntimeEdit) {
                vm.isRuntimeEdit = false;
                if (vm.frequencyList.length > 0) {
                    for (let i = 0; i < vm.frequencyList.length; i++) {
                        if (vm.frequencyList[i].tab == vm.temp.tab && vm.frequencyList[i].str == vm.temp.str && vm.frequencyList[i].type == vm.temp.type) {
                            if (vm.frequency.tab === 'specificDays') {
                                vm.frequency.dates = [];
                                angular.forEach(vm.tempItems, function (date) {
                                    vm.frequency.dates.push(moment(date.startDate).format('YYYY-MM-DD'));
                                });
                                vm.frequency.str = frequencyToString(vm.frequency);
                            }

                            vm.frequencyList[i] = angular.copy(vm.frequency);
                            saveFrequency();
                            break;
                        }
                    }
                }
                vm.temp = {};
                vm.holidayList = [];
                if (vm.frequencyList && vm.frequencyList.length > 0) {
                    generateFrequencyObj();
                }

                vm.editor.isEnable = false;
                return;
            }
            if (vm.frequency.tab === 'specificDays') {
                vm.frequency.dates = [];
                angular.forEach(vm.tempItems, function (date) {
                    vm.frequency.dates.push(moment(date.startDate).format('YYYY-MM-DD'));
                });
                vm.frequency.str = frequencyToString(vm.frequency);
            }
            for (let i = 0; i < vm.frequencyList.length; i++) {
                if (angular.equals(vm.frequencyList[i], vm.frequency)) {
                    flag = true;
                    break;
                }
            }
            if (flag) {
                return;
            }
            var _dates = [];
            if (vm.frequency.tab == 'nationalHoliday') {
                var datesArr = groupByDates(vm.frequency.nationalHoliday);
                _dates = angular.copy(datesArr);
            }

            if (vm.frequencyList.length > 0) {
                var flag1 = false;
                for (let i = 0; i < vm.frequencyList.length; i++) {
                    if (vm.frequency.tab === vm.frequencyList[i].tab) {
                        if (vm.frequency.tab === 'weekDays') {
                            if (vm.frequency.months && vm.frequency.months.length > 0) {
                                if (vm.frequency.months == vm.frequencyList[i].months || angular.equals(vm.frequencyList[i].months, vm.frequency.months)) {
                                    if (angular.equals(vm.frequencyList[i].days, vm.frequency.days)) {
                                        flag1 = true;
                                        break;
                                    }
                                    vm.frequencyList[i].days = angular.copy(vm.frequency.days);
                                    vm.frequencyList[i].startingWithW = angular.copy(vm.frequency.startingWithW);
                                    vm.frequencyList[i].endOnW = angular.copy(vm.frequency.endOnW);
                                    vm.frequencyList[i].str = angular.copy(vm.frequency.str);
                                    flag1 = true;
                                    break;
                                } else {
                                    if (vm.frequencyList[i].months)
                                        if (angular.equals(vm.frequencyList[i].days, vm.frequency.days)) {
                                            angular.forEach(vm.frequency.months, function (month) {
                                                if (vm.frequencyList[i].months.indexOf(month) == -1)
                                                    vm.frequencyList[i].months.push(month)
                                            });
                                            vm.frequencyList[i].str = angular.copy(vm.frequency.str);
                                            flag1 = true;
                                            break;
                                        }
                                }
                            } else {
                                if (!vm.frequencyList[i].months) {
                                    vm.frequencyList[i].days = angular.copy(vm.frequency.days);
                                    vm.frequencyList[i].startingWithM = angular.copy(vm.frequency.startingWithW);
                                    vm.frequencyList[i].endOnW = angular.copy(vm.frequency.endOnW);
                                    vm.frequencyList[i].str = angular.copy(vm.frequency.str);
                                    flag1 = true;
                                    break;
                                }
                            }
                        } else if (vm.frequency.tab === 'monthDays' && vm.frequency.isUltimos === 'months' && vm.frequencyList[i].isUltimos === 'months') {
                            if (vm.frequency.months && vm.frequency.months.length > 0) {
                                if (vm.frequency.months == vm.frequencyList[i].months || angular.equals(vm.frequencyList[i].months, vm.frequency.months)) {
                                    vm.frequencyList[i].selectedMonths = angular.copy(vm.frequency.selectedMonths);
                                    vm.frequencyList[i].startingWithM = angular.copy(vm.frequency.startingWithM);
                                    vm.frequencyList[i].endOnM = angular.copy(vm.frequency.endOnM);
                                    vm.frequencyList[i].str = angular.copy(vm.frequency.str);
                                    flag1 = true;
                                    break;
                                } else {
                                    if (vm.frequencyList[i].months)
                                        if (angular.equals(vm.frequencyList[i].selectedMonths, vm.frequency.selectedMonths)) {
                                            angular.forEach(vm.frequency.months, function (month) {
                                                if (vm.frequencyList[i].months.indexOf(month) == -1)
                                                    vm.frequencyList[i].months.push(month)
                                            });
                                            vm.frequencyList[i].str = angular.copy(vm.frequency.str);
                                            flag1 = true;
                                            break;
                                        }
                                }
                            } else {
                                if (!vm.frequencyList[i].months) {
                                    vm.frequencyList[i].selectedMonths = angular.copy(vm.frequency.selectedMonths);
                                    vm.frequencyList[i].startingWithM = angular.copy(vm.frequency.startingWithM);
                                    vm.frequencyList[i].endOnM = angular.copy(vm.frequency.endOnM);
                                    vm.frequencyList[i].str = angular.copy(vm.frequency.str);
                                    flag1 = true;
                                    break;
                                }
                            }
                        } else if (vm.frequency.tab === 'monthDays' && vm.frequency.isUltimos !== 'months' && vm.frequencyList[i].isUltimos !== 'months') {
                            if (vm.frequency.months && vm.frequency.months.length > 0) {
                                if (vm.frequency.months === vm.frequencyList[i].months || angular.equals(vm.frequencyList[i].months, vm.frequency.months)) {
                                    vm.frequencyList[i].selectedMonthsU = angular.copy(vm.frequency.selectedMonthsU);
                                    vm.frequencyList[i].startingWithM = angular.copy(vm.frequency.startingWithM);
                                    vm.frequencyList[i].endOnM = angular.copy(vm.frequency.endOnM);
                                    vm.frequencyList[i].str = angular.copy(vm.frequency.str);
                                    flag1 = true;
                                    break;
                                } else {
                                    if (vm.frequencyList[i].months)
                                        if (angular.equals(vm.frequencyList[i].selectedMonthsU, vm.frequency.selectedMonthsU)) {
                                            angular.forEach(vm.frequency.months, function (month) {
                                                if (vm.frequencyList[i].months.indexOf(month) == -1)
                                                    vm.frequencyList[i].months.push(month)
                                            });
                                            vm.frequencyList[i].str = angular.copy(vm.frequency.str);
                                            flag1 = true;
                                            break;
                                        }
                                }
                            } else {
                                if (!vm.frequencyList[i].months) {
                                    vm.frequencyList[i].selectedMonthsU = angular.copy(vm.frequency.selectedMonthsU);
                                    vm.frequencyList[i].startingWithM = angular.copy(vm.frequency.startingWithM);
                                    vm.frequencyList[i].endOnM = angular.copy(vm.frequency.endOnM);
                                    vm.frequencyList[i].str = angular.copy(vm.frequency.str);

                                    flag1 = true;
                                    break;
                                }
                            }
                        } else if (vm.frequency.tab === 'specificWeekDays') {
                            if (vm.frequency.months && vm.frequencyList[i].months) {
                                if (!angular.equals(vm.frequencyList[i].months, vm.frequency.months)) {
                                    if (angular.equals(vm.frequencyList[i].specificWeekDay, vm.frequency.specificWeekDay) && angular.equals(vm.frequencyList[i].which, vm.frequency.which)) {
                                        angular.forEach(vm.frequency.months, function (month) {
                                            if (vm.frequencyList[i].months.indexOf(month) == -1)
                                                vm.frequencyList[i].months.push(month);
                                        });
                                        vm.frequencyList[i].str = frequencyToString(vm.frequencyList[i]);
                                        flag1 = true;
                                        break;
                                    }
                                }
                            }
                        } else if (vm.frequency.tab === 'nationalHoliday') {
                            flag1 = true;
                            angular.forEach(datesArr, function (dates) {
                                if (vm.frequencyList[i].nationalHoliday && vm.frequencyList[i].nationalHoliday.length > 0) {
                                    if (new Date(vm.frequencyList[i].nationalHoliday[0]).getFullYear() === new Date(dates[0]).getFullYear()) {
                                        angular.forEach(dates, function (date) {
                                            if (vm.frequencyList[i].nationalHoliday.indexOf(date) == -1) {
                                                vm.frequencyList[i].nationalHoliday.push(date);
                                            }
                                        });
                                        vm.frequencyList[i].str = frequencyToString(vm.frequencyList[i]);
                                        for (let x = 0; x < _dates.length; x++) {
                                            if (angular.equals(_dates[x], dates)) {
                                                _dates.splice(x, 1);
                                                break;
                                            }
                                        }
                                    }
                                }
                            });

                        } else if (vm.frequency.tab === 'specificDays') {
                            vm.frequency.dates = [];
                            angular.forEach(vm.tempItems, function (date) {
                                vm.frequency.dates.push(moment(date.startDate).format('YYYY-MM-DD'));
                            });
                            vm.frequency.str = frequencyToString(vm.frequency);
                            vm.frequencyList[i].dates = angular.copy(vm.frequency.dates);
                            vm.frequencyList[i].str = angular.copy(vm.frequency.str);
                            flag1 = true;
                            break;
                        } else if (vm.frequency.tab === 'every') {
                            if (vm.frequency.dateEntity === vm.frequencyList[i].dateEntity && (vm.frequency.interval === vm.frequencyList[i].interval)) {
                                vm.frequencyList[i].str = frequencyToString(vm.frequencyList[i]);
                                flag1 = true;
                                break;
                            }
                        }
                    }
                }
                if (_dates && _dates.length > 0) {
                    angular.forEach(_dates, function (dates) {
                        let obj = angular.copy(vm.frequency);
                        obj.type = vm.editor.frequencyType;
                        obj.nationalHoliday = dates;
                        obj.str = frequencyToString(obj);
                        vm.frequencyList.push(obj);
                    })
                }
                if (!flag1) {
                    if (vm.frequency.tab === 'specificDays') {
                        vm.frequency.dates = [];
                        angular.forEach(vm.tempItems, function (date) {
                            vm.frequency.dates.push(moment(date.startDate).format('YYYY-MM-DD'));
                        });
                        vm.frequency.str = frequencyToString(vm.frequency);
                    }
                    if (vm.frequency.tab !== 'nationalHoliday') {
                        vm.frequency.type = vm.editor.frequencyType;
                        vm.frequencyList.push(angular.copy(vm.frequency));
                    }
                }

            } else {
                if (vm.frequency.tab === 'nationalHoliday') {
                    angular.forEach(datesArr, function (dates) {
                        let obj = angular.copy(vm.frequency);
                        obj.type = vm.editor.frequencyType;
                        obj.nationalHoliday = dates;
                        obj.str = frequencyToString(obj);
                        vm.frequencyList.push(obj);
                    })
                } else {
                    if (vm.frequency.tab === 'specificDays') {
                        vm.frequency.dates = [];
                        angular.forEach(vm.tempItems, function (date) {
                            vm.frequency.dates.push(moment(date.startDate).format('YYYY-MM-DD'));
                        });
                        vm.frequency.str = frequencyToString(vm.frequency);
                    }
                    vm.frequency.type = vm.editor.frequencyType;
                    vm.frequencyList.push(angular.copy(vm.frequency));
                }
            }
            vm.frequency.months = [];

            vm.editor.isEnable = false;
        };

        function groupByDates(arrayOfDates) {
            let datesObj = _.groupBy(arrayOfDates, function (el) {
                return moment(el).format('YYYY');
            });
            return _.toArray(datesObj);
        }

        function saveFrequency() {
            if (vm.editor.frequencyType === 'INCLUDE') {
                vm.calendar.includesFrequency = angular.copy(vm.frequencyList);
            } else {
                vm.calendar.excludesFrequency = angular.copy(vm.frequencyList);
            }
        }

        vm.editFrequency = function (data) {
            vm.temp = angular.copy(data);
            vm.frequency = angular.copy(data);
            vm.isRuntimeEdit = true;
            if (vm.frequency.tab === 'nationalHoliday') {
                vm.frequency.year = new Date(data.nationalHoliday[0]).getFullYear();
                vm.holidayList = [];
                vm.countryField = true;
                vm.holidayDays.checked = true;
                angular.forEach(data.nationalHoliday, function (date) {
                    vm.holidayList.push({date: date})
                });
            } else {
                vm.holidayDays.checked = false;
                if (vm.frequency.tab === 'monthDays') {
                    if (vm.frequency.isUltimos === 'months') {
                        selectedMonths = [];
                        angular.forEach(data.selectedMonths, function (val) {
                            vm.selectMonthDays(val);
                        });
                    } else {
                        selectedMonthsU = [];
                        angular.forEach(data.selectedMonthsU, function (val) {
                            vm.selectMonthDaysU(val);
                        });
                    }
                }
            }
        };

        vm.deleteFrequency = function (data) {
            for (let i = 0; i < vm.frequencyList.length; i++) {
                if (vm.frequencyList[i] == data || angular.equals(vm.frequencyList[i], data)) {
                    vm.frequencyList.splice(i, 1);
                    if (data.tab == 'specificDays') {
                        vm.tempItems = [];
                    } else if (data.tab == 'nationalHoliday') {
                        vm.frequency.nationalHoliday = [];
                        vm.holidayDays.checked = false;
                        vm.holidayList = [];
                        vm.frequency.year = new Date().getFullYear();
                        vm.countryField = false;
                    } else if (data.tab == 'monthDays') {
                        if (data.isUltimos == 'months') {
                            selectedMonths = [];
                        } else {
                            selectedMonthsU = [];
                        }
                    } else if (data.tab == 'weekDays') {
                        vm.frequency.days = [];
                    }
                    break;
                }
            }
            if (vm.frequencyList.length == 0) {
                var temp = angular.copy(vm.frequency);
                vm.frequency = {};
                vm.frequency.tab = temp.tab;
                vm.frequency.isUltimos = temp.isUltimos;
            }
            if (vm.frequencyList && vm.frequencyList.length > 0) {
                generateFrequencyObj();
            }
        };

        vm.changeDate = function () {
            var newDate = new Date();
            var todate = vm.toDate;
            newDate.setHours(0, 0, 0, 0);
            if (new Date(vm.toDate).getTime() > new Date(vm.calendarTitle + '-12-31').getTime()) {
                todate = vm.calendarTitle + '-12-31';
            }
            if (newDate.getFullYear() < vm.calendarTitle && (new Date(vm.calendarTitle + '-01-01').getTime() < new Date(todate).getTime())) {
                vm.planItems = [];
                var obj = {};
                obj.jobschedulerId = vm.schedulerIds.selected;
                obj.calendar = {};
                obj.dateFrom = vm.calendarTitle + '-01-01';
                obj.dateTo = todate;
                obj.calendar = vm.frequencyObj;
                vm.isCalendarLoading = true;
                CalendarService.getListOfDates(obj).then(function (result) {
                    let color = 'blue';
                    if (vm.calObj.freqency && vm.calObj.freqency != 'all' && JSON.parse(vm.calObj.freqency).type == 'EXCLUDE') {
                        color = 'orange';
                    }
                    angular.forEach(result.dates, function (date) {
                        vm.planItems.push({
                            startDate: moment(date),
                            endDate: moment(date),
                            color: color
                        });
                    });
                    angular.forEach(result.withExcludes, function (date) {
                        vm.planItems.push({
                            startDate: moment(date),
                            endDate: moment(date),
                            color: 'orange'
                        });
                    });
                    vm.isCalendarLoading = false;
                    $('#full-calendar').data('calendar').setDataSource(vm.planItems);
                }, function () {
                    vm.isCalendarLoading = false;
                });

            } else if (newDate.getFullYear() == vm.calendarTitle) {
                vm.planItems = angular.copy(tempList);
                $('#full-calendar').data('calendar').setDataSource(vm.planItems);
            }
        };

        function frequencyToString(period) {
            var str = '';
            if (period.months && angular.isArray(period.months)) {
                str = RuntimeService.getMonths(period.months);
            }
            if (period.tab == 'weekDays') {
                if (str) {
                    return RuntimeService.getWeekDays(period.days) + ' on ' + str;
                } else {
                    return RuntimeService.getWeekDays(period.days);
                }
            } else if (period.tab == 'specificWeekDays') {
                if (!angular.isArray(period.which)) {
                    if (str) {
                        return RuntimeService.getSpecificDay(period.which) + ' ' + period.specificWeekDay + ' of ' + str;
                    } else {
                        return RuntimeService.getSpecificDay(period.which) + ' ' + period.specificWeekDay + ' of month';
                    }
                } else {
                    var str1 = '';
                    angular.forEach(period.which, function (value, index) {
                        str1 = str1 + RuntimeService.getSpecificDay(value);
                        if (period.which.length - 1 != index) {
                            str1 = str1 + ', ';
                        }
                    });
                    if (str) {
                        return str1 + ' ' + period.specificWeekDay + ' of ' + str;
                    } else {
                        return str1 + ' ' + period.specificWeekDay + ' of month';
                    }
                }
            } else if (period.tab == 'specificDays') {
                str = 'On ';
                if (period.dates)
                    angular.forEach(period.dates.sort(), function (date, index) {
                        str = str + moment(date).format(vm.dataFormat.toUpperCase());
                        if (index != period.dates.length - 1) {
                            str = str + ', ';
                        }
                    });
                return str;
            } else if (period.tab == 'monthDays') {
                if (period.isUltimos != 'months') {
                    if (str) {
                        return '- ' + RuntimeService.getMonthDays(period.selectedMonthsU, true) + ' of ' + str;
                    } else {
                        return RuntimeService.getMonthDays(period.selectedMonthsU, true) + ' of ultimos';
                    }
                } else {
                    if (str) {
                        return RuntimeService.getMonthDays(period.selectedMonths) + ' of ' + str;
                    } else {
                        return RuntimeService.getMonthDays(period.selectedMonths) + ' of month';
                    }
                }
            } else if (period.tab == 'every') {
                if (period.interval == 1) {
                    str = period.interval + 'st ';
                } else if (period.interval == 2) {
                    str = period.interval + 'nd ';
                } else if (period.interval == 3) {
                    str = period.interval + 'rd ';
                } else {
                    str = period.interval + 'th ';
                }
                var repetitions = period.dateEntity == 'DAILY' ? 'day' : period.dateEntity == 'WEEKLY' ? 'week' : period.dateEntity == 'MONTHLY' ? 'month' : 'year';
                if (period.startingWith) {
                    return 'Every ' + str + repetitions + ' starting with day ' + moment(period.startingWith).format(vm.dataFormat.toUpperCase());
                } else {
                    return 'Every ' + str + repetitions;
                }

            } else if (period.tab == 'nationalHoliday') {
                if (period.nationalHoliday) {
                    str = moment(period.nationalHoliday[0]).format('YYYY') + ' national holidays ';
                    angular.forEach(period.nationalHoliday.sort(), function (date, index) {
                        str = str + moment(date).format(vm.dataFormat.toUpperCase());
                        if (index != period.nationalHoliday.length - 1) {
                            str = str + ', ';
                        }
                    });
                }
                return str;
            }
        }

        $scope.$on('frequency-editor', function (event, data1) {
            var data = angular.copy(data1.frequency);
            excludedDates = [];
            includedDates = [];
            selectedMonths = [];
            selectedMonthsU = [];
            vm.editor = data.editor;
            vm.isRuntimeEdit = false;
            vm.calendar = data.calendar;
            if (vm.calendar.from) {
                vm.freqMinDate = new Date(vm.calendar.from);
                vm.freqMinDate.setDate(vm.freqMinDate.getDate() - 1);
            }
            if (data.flag) {
                if (data.data)
                    vm.showCalendar(data.data);
                else
                    vm.showCalendar();
            }
            vm.calendarTitle = new Date().getFullYear();

            vm.tempItems = [];
            vm.planItems = [];

            vm.frequency = data.frequency;
            if (!vm.frequency.isUltimos)
                vm.frequency.isUltimos = 'months';
            vm.frequencyList = data.frequencyList;
            vm.excludeFrequencyList = data.excludeFrequencyList;

            vm.temp = data.temp;

            vm.countryField = false;
            vm.holidayList = [];
            vm.holidayDays.checked = false;
            vm.frequency.year = new Date().getFullYear();
            vm.flag = data.flag;
            if (vm.temp && !_.isEmpty(vm.temp)) {
                vm.isRuntimeEdit = true;
                if (vm.temp.tab === 'nationalHoliday') {
                    vm.frequency.year = new Date(vm.temp.nationalHoliday[0]).getFullYear();
                    vm.holidayDays.checked = true;
                    vm.countryField = true;
                } else if (vm.temp.tab === 'weekDays') {
                    vm.frequency.all = vm.temp.days.length == 7;
                }
                for (let i = 0; i < vm.frequencyList.length; i++) {
                    if (vm.frequencyList[i] === vm.temp || angular.equals(vm.temp, vm.frequencyList[i])) {
                        if (vm.frequencyList[i].tab === 'monthDays') {
                            if (vm.frequencyList[i].isUltimos === 'months')
                                vm.frequency.selectedMonths = angular.copy(vm.frequencyList[i].selectedMonths);
                            else
                                vm.frequency.selectedMonthsU = angular.copy(vm.frequencyList[i].selectedMonthsU);

                            if (vm.frequencyList[i].isUltimos === 'months') {
                                selectedMonths = [];
                                angular.forEach(vm.frequencyList[i].selectedMonths, function (val) {
                                    vm.selectMonthDays(val);
                                });
                            } else {
                                selectedMonthsU = [];
                                angular.forEach(vm.frequencyList[i].selectedMonthsU, function (val) {
                                    vm.selectMonthDaysU(val);
                                });
                            }
                        } else if (vm.frequencyList[i].tab === 'specificDays') {
                            angular.forEach(vm.frequencyList[i].dates, function (date) {
                                vm.tempItems.push({
                                    startDate: convertStringToDate(date),
                                    endDate: convertStringToDate(date),
                                    color: 'blue'
                                });
                            });
                            if ($('#calendar') && $('#calendar').data('calendar')) {

                            } else {
                                $('#calendar').calendar({
                                    language: localStorage.$SOS$LANG,
                                    clickDay: (e) => {
                                        selectDate(e.date);
                                    }
                                });
                            }
                            $('#calendar').data('calendar').setDataSource(vm.tempItems);
                        } else if (vm.frequencyList[i].tab === 'nationalHoliday') {
                            vm.frequency.nationalHoliday = vm.frequencyList[i].nationalHoliday;
                            angular.forEach(vm.temp.nationalHoliday, function (date) {
                                vm.holidayList.push({date: date})
                            });
                        }
                        break;
                    }
                }
            } else {
                if (vm.frequencyList && vm.frequencyList.length > 0) {
                    generateFrequencyObj();
                }
            }
            if (vm.frequency.tab !== 'specificDays' && vm.editor.showYearView) {
                if ($('#full-calendar') && $('#full-calendar').data('calendar')) {

                } else {
                    $('#full-calendar').calendar({
                        language: localStorage.$SOS$LANG,
                        clickDay: (e) => {
                            checkDate(e.date);
                        }, renderEnd: (e) => {
                            vm.calendarTitle = e.currentYear;
                            if (vm.isCalendarDisplay) {
                                vm.changeDate();
                            }
                        }
                    });
                }
            }
        });

        vm.save = function () {
            saveFrequency();
            $rootScope.$broadcast('save-frequency', {
                editor: vm.editor,
                frequency: vm.frequency,
                calendar: vm.calendar,
                frequencyList: vm.frequencyList
            });

            $('#frequency-editor').modal('hide');
            $('.fade-modal').css('opacity', 1);
        };

        vm.cancel = function () {
            $('#frequency-editor').modal('hide');
            $('.fade-modal').css('opacity', 1);
        };
        vm.back1 = function () {
            if (vm.flag) {
                $('#frequency-editor').modal('hide');
                $('.fade-modal').css('opacity', 1);
            } else {
                vm.editor.showYearView = false;
            }
            vm.isRuntimeEdit = false;
            excludedDates = [];
            includedDates = [];
        };

        $scope.$on('$destroy', function () {
            watcher1();
            watcher2();
            watcher3();
            watcher4();
        });
    }

    PeriodEditorCtrl.$inject = ['$scope', '$rootScope', 'gettextCatalog', 'RuntimeService'];

    function PeriodEditorCtrl($scope, $rootScope, gettextCatalog, RuntimeService) {
        const vm = $scope;
        vm.period = {};
        vm.editor = {};
        vm.editor.when_holiday_options = {
            'previous_non_holiday': gettextCatalog.getString('previous non holiday'),
            'next_non_holiday': gettextCatalog.getString('next non holiday'),
            'suppress': gettextCatalog.getString('suppress execution (default)'),
            'ignore_holiday': gettextCatalog.getString('ignore holiday')
        };
        var frequency = {};
        $scope.$on('period-editor', function (event, data1) {
            let data = angular.copy(data1);
            frequency = data;
            vm.period = {};
            vm.period.period = {};
            if (!data.periodStr) {
                if (data.isOrderJob && data.isOrderJob != 'no') {
                    vm.period.frequency = 'time_slot';
                    vm.period.period.begin = '00:00';
                    vm.period.period.end = '24:00';
                } else {
                    vm.period.frequency = 'singleStart';
                    vm.period.period.singleStart = '00:00';
                }
                if (data.isOrderJob === false || data.isOrderJob == 'no') {
                    vm.period.isStandaloneJob = 'yes';
                }
                vm.period.period.whenHoliday = 'suppress';
                vm.editor.editPeriod = false;
                vm.editor.createPeriod = true;
                vm.strPeriod = 'New period';
            } else {
                if (angular.isArray(data.period)) {
                    data.period = data.period[0]
                }
                if (data.period.singleStart) {
                    vm.period.frequency = 'singleStart';
                    vm.period.period.singleStart = data.period.singleStart;
                } else if (data.period.absoluteRepeat) {
                    vm.period.frequency = 'absoluteRepeat';
                    vm.period.period.absoluteRepeat = data.period.absoluteRepeat;
                } else if (data.period.repeat) {
                    vm.period.frequency = 'repeat';
                    vm.period.period.repeat = data.period.repeat;
                } else {
                    vm.period.frequency = 'time_slot';
                }
                if (data.period.begin) {
                    vm.period.period.begin = data.period.begin;
                }
                if (data.period.end) {
                    vm.period.period.end = data.period.end;
                }

                vm.period.period.whenHoliday = data.period.whenHoliday;
                if (data.isOrderJob === false || data.isOrderJob == 'no') {
                    vm.period.isStandaloneJob = 'yes';
                }
                vm.editor.createPeriod = false;
                vm.editor.editPeriod = true;
                vm.strPeriod = data.periodStr;
            }
        });

        $scope.$on('update-period', function (event, data1) {
            frequency = {};
            var data = angular.copy(data1);
            vm.period = {};
            vm.period.period = {};
            if (!data.period) {
                if (data.isOrderJob && data.isOrderJob != 'no') {
                    vm.period.frequency = 'time_slot';
                    vm.period.period.begin = '00:00';
                    vm.period.period.end = '24:00';
                } else {
                    vm.period.frequency = 'singleStart';
                    vm.period.period.singleStart = '00:00';
                }
                if (data.isOrderJob === false || data.isOrderJob == 'no') {
                    vm.period.isStandaloneJob = 'yes';
                }
                vm.period.period.whenHoliday = 'suppress';
                vm.editor.editPeriod = false;
                vm.editor.createPeriod = true;
                vm.strPeriod = 'New period';
            } else {
                var str = '';
                if (data.period.period.begin) {
                    vm.period.period.begin = data.period.period.begin;
                    str = vm.period.period.begin;
                }
                if (data.period.period.end) {
                    vm.period.period.end = data.period.period.end;
                    str = str + '-' + vm.period.period.begin;
                }
                if (data.period.period.singleStart) {
                    vm.period.frequency = 'singleStart';
                    vm.period.period.singleStart = data.period.period.singleStart;
                    str = 'Single start: ' + data.period.period.singleStart;
                } else if (data.period.period.absoluteRepeat) {
                    vm.period.frequency = 'absoluteRepeat';
                    vm.period.period.absoluteRepeat = data.period.period.absoluteRepeat;
                    str = str + ' every ' + RuntimeService.getTimeInString(data.period.period.absoluteRepeat);
                } else if (data.period.period.repeat) {
                    vm.period.frequency = 'repeat';
                    vm.period.period.repeat = data.period.period.repeat;
                    str = str + ' every ' + RuntimeService.getTimeInString(data.period.period.repeat);
                } else {
                    vm.period.frequency = 'time_slot';
                }
                if (data.isOrderJob === false || data.isOrderJob == 'no') {
                    vm.period.isStandaloneJob = 'yes';
                }
                vm.strPeriod = str;
                vm.period.period.whenHoliday = data.period.period.whenHoliday;
                vm.editor.createPeriod = false;
                vm.editor.editPeriod = true;
            }
        });

        vm.cancel = function (form1) {
            vm.period = {};
            vm.period.period = {};
            $rootScope.$broadcast('cancel-period');
            if (form1)
                form1.$setPristine();
            $('#period-editor').modal('hide');

        };
        vm.save = function (form1) {
            if (vm.period.frequency === 'singleStart') {
                delete vm.period.period['repeat'];
                delete vm.period.period['absoluteRepeat'];
                delete vm.period.period['begin'];
                delete vm.period.period['end'];
                let flg = false;
                if (vm.period.period.singleStart) {
                    if (/^\d{1,2}:\d{2}(:\d\d)?$/i.test(vm.period.period.singleStart)) {
                        form1.startTime.$invalid = false;
                        flg = true;
                    }
                    if (vm.period.period.singleStart === '00:00' || vm.period.period.singleStart === '00:00:00') {
                        flg = false;
                    }
                }
                if (!flg) {
                    form1.startTime.$invalid = true;
                    form1.startTime.$dirty = true;
                    return;
                }
            } else if (vm.period.frequency === 'repeat' || vm.period.frequency === 'absoluteRepeat') {
                delete vm.period.period['singleStart'];
                let flg = false;
                if (vm.period.frequency === 'repeat') {
                    delete vm.period.period['absoluteRepeat'];
                    if (vm.period.period.repeat) {
                        if (/^\d{1,2}:\d{2}(:\d\d)?$/i.test(vm.period.period.repeat)) {
                            form1.repeat.$invalid = false;
                            flg = true;
                        }
                        if (!vm.period.period.repeat || vm.period.period.repeat === '00:00' || vm.period.period.repeat === '00:00:00') {
                            flg = false;
                        }
                    }
                    if (!flg) {
                        form1.repeat.$invalid = true;
                        form1.repeat.$dirty = true;
                        return;
                    }
                } else {
                    delete vm.period.period['repeat'];
                    if (vm.period.period.absoluteRepeat) {
                        if (/^\d{1,2}:\d{2}(:\d\d)?$/i.test(vm.period.period.absoluteRepeat)) {
                            form1.absolute.$invalid = false;
                            flg = true;
                        }
                        if (vm.period.period.absoluteRepeat === '00:00' || vm.period.period.absoluteRepeat === '00:00:00') {
                            flg = false;
                        }
                    }
                    if (!flg) {
                        form1.absolute.$invalid = true;
                        form1.absolute.$dirty = true;
                        return;
                    }
                }
            } else if (vm.period.frequency === 'time_slot') {
                delete vm.period.period['repeat'];
                delete vm.period.period['absoluteRepeat'];
                delete vm.period.period['singleStart'];
            }
            if (vm.period.frequency !== 'singleStart') {
                if (vm.period.period.begin && /^\d{1,2}:\d{2}(:\d\d)?$/i.test(vm.period.period.begin)) {
                    form1.begin.$invalid = false;
                } else {
                    form1.begin.$invalid = true;
                    form1.begin.$dirty = true;
                    return;
                }
                if (vm.period.period.end && /^\d{1,2}:\d{2}(:\d\d)?$/i.test(vm.period.period.end)) {
                    form1.end.$invalid = false;
                } else {
                    form1.end.$invalid = true;
                    form1.end.$dirty = true;
                    return;
                }
            }

            $rootScope.$broadcast('save-period', {
                period: vm.period,
                frequency: frequency
            });
            vm.period = {};
            vm.period.period = {};
            if (form1) {
                form1.$setPristine();
                form1.$setUntouched();
            }
            $('#period-editor').modal('hide');
        };
    }

    ScheduleEditorCtrl1.$inject = ['$scope', '$rootScope'];

    function ScheduleEditorCtrl1($scope, $rootScope) {
        const vm = $scope;
        vm.sch = {};
        vm.error = {};
        vm.from = {};
        vm.to = {};
        vm.minDate = new Date();
        vm.minDate.setDate(vm.minDate.getDate() - 1);

        function getDateFormat() {
            vm.dateFormat = vm.userPreferences.dateFormat || 'DD.MM.YYYY HH:mm:ss';
            if (vm.dateFormat.match('HH:mm')) {
                vm.dateFormat = vm.dateFormat.replace('HH:mm', '');
            } else if (vm.dateFormat.match('hh:mm')) {
                vm.dateFormat = vm.dateFormat.replace('hh:mm', '');
            }

            if (vm.dateFormat.match(':ss')) {
                vm.dateFormat = vm.dateFormat.replace(':ss', '');
            }
            if (vm.dateFormat.match('A')) {
                vm.dateFormat = vm.dateFormat.replace('A', '');
            }
            if (vm.dateFormat.match('|')) {
                vm.dateFormat = vm.dateFormat.replace('|', '');
            }
            vm.dateFormat = vm.dateFormat.replace('YY', 'yy');
            vm.dateFormat = vm.dateFormat.replace('YY', 'yy');
            vm.dateFormat = vm.dateFormat.replace('D', 'd');
            vm.dateFormat = vm.dateFormat.replace('D', 'd');
            vm.dateFormat = vm.dateFormat.trim();
        }

        getDateFormat();

        $scope.$on('schedule-editor', function (event, data1) {
            vm.sch = data1.sch;
            vm.error = data1.error;
            vm._schedules = data1._schedules;
            vm.from = data1.from;
            vm.from.time = '00:00';
            vm.to = data1.to;
            vm.to.time = '00:00';
        });

        vm.cancel = function (form2) {
            if (form2) {
                form2.$setPristine();
                form2.$setUntouched();
            }
            $('#schedule-editor').modal('hide');
        };

        vm.removeSubstitue = function (form2) {
            $rootScope.$broadcast('remove-substitue', {
                _schedules: vm._schedules,
                _sch: {}
            });
            vm.sch = {};
            vm.from = {};
            vm.from.time = '00:00';
            vm.to = {};
            vm.to.time = '00:00';
            if (form2) {
                form2.$setPristine();
                form2.$setUntouched();
            }
        };

        vm.save = function (form2) {
            vm.sch.validFrom = undefined;
            if (!vm.from.time) {
                vm.from.time = '00:00';
            }
            if (!vm.to.time) {
                vm.to.time = '00:00';
            }
            if (vm.from.time && vm.from.date) {
                let date = new Date(vm.from.date);
                date.setHours(vm.from.time.substring(0, 2));
                date.setMinutes(vm.from.time.substring(3, 5));
                if (vm.from.time.substring(6, 8)) {
                    date.setSeconds(vm.from.time.substring(6, 8));
                } else {
                    date.setSeconds('00');
                }
                vm.sch.validFrom = moment(date).format('YYYY-MM-DD HH:mm:ss');
            }
            vm.sch.validTo = undefined;
            if (vm.to.time && vm.to.date) {
                let date = new Date(vm.to.date);
                date.setHours(parseInt(vm.to.time.substring(0, 2)));
                date.setMinutes(parseInt(vm.to.time.substring(3, 5)));
                if (vm.to.time.substring(6, 8)) {
                    date.setSeconds(parseInt(vm.to.time.substring(6, 8)));
                } else {
                    date.setSeconds(0);
                }
                vm.sch.validTo = moment(date).format('YYYY-MM-DD HH:mm:ss');
            }

            if (vm.sch.validFrom || vm.sch.validTo || vm.sch.substitute) {

                vm.error.scheduleRequired = !vm.sch.substitute;
                vm.error.validDate = moment(vm.sch.validFrom).diff(moment(vm.sch.validTo)) > 0;

                if (vm.error.validDate || vm.error.scheduleRequired) {
                    return;
                } else {
                    if (vm.sch.substitute) {
                        if (!vm.sch.validFrom || !vm.sch.validTo) {
                            vm.error.requiredDate = true;
                            return;
                        }
                    }
                }
            }
            $rootScope.$broadcast('save-schedule', {
                sch: vm.sch,
                _schedules: vm._schedules,
                from: vm.from,
                to: vm.to
            });
            vm.cancel(form2);
        };
    }

    RuntimeEditorDialogCtrl.$inject = ['$scope', '$rootScope', 'toasty', '$timeout', 'gettextCatalog', '$window', 'CalendarService', 'ScheduleService', '$filter', 'DailyPlanService', '$uibModal', 'RuntimeService', 'EditorService', 'orderByFilter'];

    function RuntimeEditorDialogCtrl($scope, $rootScope, toasty, $timeout, gettextCatalog, $window, CalendarService, ScheduleService, $filter, DailyPlanService, $uibModal, RuntimeService, EditorService, orderBy) {
        const vm = $scope;
        vm.viewCalObj = {
            calendarView: 'month',
        };

        vm.minDate = new Date();
        vm.minDate.setDate(vm.minDate.getDate() - 1);
        vm.logError = false;
        vm.Math = Math;
        if (vm.userPreferences.auditLog && !vm.joe) {
            vm.display = true;
        }
        if ($window.sessionStorage.$SOS$FORCELOGING == 'true' && !vm.joe) {
            vm.required = true;
        }

        vm.predefinedMessageList = JSON.parse($window.sessionStorage.comments);

        vm.editor = {};
        vm.editor.hidePervious = false;
        vm.editor.isEnable = false;
        vm.runTime = {};
        vm.runTime.tab = 'weekDays';
        vm.runTime.period = {};

        if (vm.order && (vm.order.isOrderJob && vm.order.isOrderJob != 'no')) {
            vm.runTime.frequency = 'time_slot';
            vm.runTime.period.begin = '00:00';
            vm.runTime.period.end = '24:00';
        } else {
            vm.runTime.frequency = 'singleStart';
            vm.runTime.period.singleStart = '00:00';
        }

        if (vm.order && (vm.order.isOrderJob === false || vm.order.isOrderJob == 'no')) {
            vm.runTime.isStandaloneJob = 'yes';
        }
        vm.tempRunTime = {};
        vm.runTime1 = {};
        var promise1, promise2, promise3;

        var run_time = {};
        run_time = {};
        run_time.months = [];
        run_time.weekdays = {};
        run_time.weekdays.days = [];
        run_time.monthdays = {};
        run_time.monthdays.days = [];
        run_time.ultimos = {};
        run_time.ultimos.days = [];

        vm.tempItems = [];
        vm.planItems = [];
        vm.selectedCalendar = [];

        vm.editor.when_holiday_options = RuntimeService.whenHolidayOptions();
        vm.changeFrequency1 = function (str) {
            vm.runTime.tab = str;
            if (vm.runTime.tab === 'monthDays' && !vm.runTime.isUltimos) {
                vm.runTime.isUltimos = 'months';
            }else if (str === 'specificDays') {
                initSpecificDayCalendar();
            }
        };

        function initSpecificDayCalendar() {
            vm.tempItems = [];
            if ($('#calendar') && $('#calendar').data('calendar')) {

            } else {
                let date = new Date();
                date.setDate(new Date().getDate()-1);
                $('#calendar').calendar({
                    minDate: date,
                    language: localStorage.$SOS$LANG,
                    clickDay: (e) => {
                        selectDate(e.date);
                    }
                });
            }

            if(vm.runTime.date) {
                let date = new Date(vm.runTime.date).setHours(0, 0, 0, 0);
                let planData = {
                    startDate: date,
                    endDate: date,
                    date: date,
                    color: 'blue'
                };
                vm.tempItems.push(planData);
                $('#calendar').data('calendar').setDataSource(vm.tempItems);
            }
        }

        function selectDate(date) {
            let planData = {
                startDate: date,
                endDate: date,
                date: date,
                color: 'blue'
            };
            let flag = false, x = 0;
            for (let i = 0; i < vm.tempItems.length; i++) {
                if ((new Date(vm.tempItems[i].date).setHours(0, 0, 0, 0) == new Date(date).setHours(0, 0, 0, 0))) {
                    flag = true;
                    x = i;
                    break;
                }
            }
            if (!flag) {
                vm.tempItems.push(planData);
            } else {
                vm.tempItems.splice(x, 1);
            }
            vm.editor.isEnable = vm.tempItems.length > 0;
            $('#calendar').data('calendar').setDataSource(vm.tempItems);
        }

        vm.changeText = function () {
            $('#nonWorkingDays').hover(function () {
                $(this).text(gettextCatalog.getString('button.deprecatedFeature'))
            }, function () {
                $(this).text(gettextCatalog.getString('button.nonWorkingDays'))
            });
        };

        //-------------------Begin national holiday----------------------
        var hd = new Holidays();
        // get supported countries
        vm.countryList = hd.getCountries('en');
        vm.countryList.IN = "India";
        vm.countryListArr = [];
        angular.forEach(vm.countryList, function (val, key) {
            vm.countryListArr.push({code: key, name: vm.countryList[key]})
        });

        vm.runTime.year = new Date().getFullYear();

        vm.getDateFormat = function (date) {
            if (date)
                return moment(date).format('YYYY-MM-DD')
        };

        vm.compareName = function (n1, n2) {
            if (n1.value.substring(0, 1) == 'Å') {
                n1.value = 'A' + n1.value.substring(1, n1.value.length)
            }
            if (n2.value.substring(0, 1) == 'Å') {
                n2.value = 'A' + n2.value.substring(1, n2.value.length)
            }
            return n1.value < n2.value ? -1 : 1;
        };

        vm.selectSchedule = function () {
            if (!vm.schedules)
                ScheduleService.getSchedulesP({
                    jobschedulerId: $scope.schedulerIds.selected,
                    compact: true
                }).then(function (res) {
                    vm.schedules = [];
                    angular.forEach(res.schedules, function (value) {
                        if (value && !value.substitute)
                            vm.schedules.push(value)
                    });
                });
        };

        vm.zones = moment.tz.names();

        vm.loadHolidayList = function () {
            vm.holidayList = [];
            if (vm.runTime.country && vm.runTime.year) {
                hd.init(vm.runTime.country);
                let holidays = hd.getHolidays(vm.runTime.year);
                angular.forEach(holidays, function (holiday) {
                    if (holiday.type == 'public' && holiday.date && holiday.name)
                        vm.holidayList.push(holiday);
                });
            }
        };

        //-------------------End ----------------------

        function toXML(json, objectType, cb) {
            let _json;
            if (objectType === 'runtime') {
                _json = json.run_time;
            } else {
                _json = json.schedule;
            }
            _json.calendars = [];
            setCalendarToJoeRuntime(_json);
            if (_json.calendars && _json.calendars.length > 0) {
                _json.calendars = JSON.stringify({calendars: _json.calendars});
            } else {
                delete _json['calendars'];
            }
            EditorService.toXML(_json, objectType).then(function (res) {
                vm.xmlObj = {xml: res.data};
                if (cb) {
                    cb(res.data);
                }
            }, function (err) {
                toasty.error({
                    title: err.error.code,
                    msg: err.error.message,
                    timeout: 10000
                });
            });
        }

        function toJSON(xml) {
            EditorService.toJSON(xml).then(function (res) {
                if (vm.jsonObj.json.run_time) {
                    vm.jsonObj.json.run_time = res.data;
                } else {
                    vm.jsonObj.json.schedule = res.data;
                }
                getXml2Json(angular.copy(vm.jsonObj.json));
            }, function (err) {
                toasty.error({
                    title: err.error.code,
                    msg: err.error.message,
                    timeout: 10000
                });
            });
        }

        function setCalendarToRuntime() {
            if (vm.order && !vm.schedule) {
                vm.order.calendars = [];
            } else if (!vm.order && vm.schedule) {
                vm.schedule.calendars = [];
            }
            if (vm.selectedCalendar && vm.selectedCalendar.length > 0) {
                angular.forEach(vm.selectedCalendar, function (value) {
                    let cal = {};
                    cal.basedOn = value.path;
                    cal.includes = {};
                    cal.type = "WORKING_DAYS";
                    angular.forEach(value.frequencyList, function (data) {
                        cal = RuntimeService.generateCalendarObj(data, cal);
                    });

                    cal.periods = [];
                    if (value.periods) {
                        for (let i = 0; i < value.periods.length; i++) {
                            if (value.periods[i].periods) {
                                cal.periods.push(value.periods[i].periods[0]);
                            }
                        }
                    }
                    if (vm.order && vm.order.calendars) {
                        vm.order.calendars.push(cal);
                    } else if (vm.schedule && vm.schedule.calendars) {
                        vm.schedule.calendars.push(cal);
                    }
                });
            }
            if (vm.holidayCalendar && vm.holidayCalendar.length > 0) {
                angular.forEach(vm.holidayCalendar, function (value) {
                    let cal = {};
                    cal.basedOn = value.path;
                    cal.type = "NON_WORKING_DAYS";
                    angular.forEach(value.frequencyList, function (data) {
                        cal = RuntimeService.generateCalendarObj(data, cal);
                    });
                    if (vm.order && vm.order.calendars) {
                        vm.order.calendars.push(cal);
                    } else if (vm.schedule && vm.schedule.calendars) {
                        vm.schedule.calendars.push(cal);
                    }
                })
            }
        }

        function setCalendarToJoeRuntime(obj) {
            if (vm.selectedCalendar && vm.selectedCalendar.length > 0) {
                angular.forEach(vm.selectedCalendar, function (value) {
                    let cal = {};
                    cal.basedOn = value.path;
                    cal.includes = {};
                    cal.type = "WORKING_DAYS";
                    angular.forEach(value.frequencyList, function (data) {
                        cal = RuntimeService.generateCalendarObj(data, cal);
                    });
                    cal.periods = [];
                    if (value.periods) {
                        for (let i = 0; i < value.periods.length; i++) {
                            if (value.periods[i].periods) {
                                cal.periods.push(value.periods[i].periods[0]);
                            }
                        }
                    }
                    obj.calendars.push(cal);
                });
            }
            if (vm.holidayCalendar && vm.holidayCalendar.length > 0) {
                angular.forEach(vm.holidayCalendar, function (value) {
                    let cal = {};
                    cal.basedOn = value.path;
                    cal.type = "NON_WORKING_DAYS";
                    angular.forEach(value.frequencyList, function (data) {
                        cal = RuntimeService.generateCalendarObj(data, cal);
                    });
                    obj.calendars.push(cal);
                })
            }
        }

        function setRuntimeToObject() {
            if (vm.order) {
                vm.order.runTime = vm.jsonObj.json.run_time;
            } else {
                vm.schedule.runTime = vm.jsonObj.json.schedule;
            }
            setCalendarToRuntime();
            if (vm.order) {
                if (vm.order.calendars.length > 0) {
                    vm.order.runTime.calendars = JSON.stringify({calendars: vm.order.calendars});
                } else {
                    delete vm.order.runTime['calendars'];
                }
            } else {
                if (vm.schedule.calendars.length > 0) {
                    vm.schedule.runTime.calendars = JSON.stringify({calendars: vm.schedule.calendars});
                } else {
                    delete vm.schedule.runTime['calendars'];
                }
            }
            let flag = true;
            if(vm.order && vm.order.isJobStream){
                flag = false;
                $rootScope.$broadcast('Close-Jobstream-Model', 'ok')
            }
            if(flag) {
                $rootScope.$broadcast('Close-Model', 'ok');
            }
            vm.calendars =  null;
        }

        vm.ok = function () {
            vm.logError = false;
            if (vm.required) {
                if (vm.comments.comment) {
                    setRuntimeToObject();
                } else {
                    vm.logError = true;
                }
            } else {
                setRuntimeToObject();
            }
        };

        vm.cancel = function () {
            let flag = true;
            if(vm.order && vm.order.isJobStream){
                flag = false;
                $rootScope.$broadcast('Close-Jobstream-Model', 'cancel')
            }
            if(flag) {
                $rootScope.$broadcast('Close-Model', 'cancel')
            }
           vm.calendars =  null;
        };

        var selectedMonths = [];
        vm.selectMonthDays = function (value) {
            if (selectedMonths.indexOf(value) === -1) {
                selectedMonths.push(value);
                isDelete = false;
            } else {
                selectedMonths.splice(selectedMonths.indexOf(value), 1);
            }
            vm.runTime.selectedMonths = angular.copy(selectedMonths);
            vm.runTime.selectedMonths.sort(RuntimeService.compareNumbers);
            vm.editor.isEnable = selectedMonths.length > 0;
        };

        vm.getSelectedMonthDays = function (value) {
            if (selectedMonths.indexOf(value) != -1)
                return true;
        };
        var selectedMonthsU = [];
        vm.selectMonthDaysU = function (value) {
            if (selectedMonthsU.indexOf(value) === -1) {
                selectedMonthsU.push(value);
            } else {
                selectedMonthsU.splice(selectedMonthsU.indexOf(value), 1);
            }
            vm.runTime.selectedMonthsU = angular.copy(selectedMonthsU);
            vm.runTime.selectedMonthsU.sort(RuntimeService.compareNumbers);
            vm.editor.isEnable = selectedMonthsU.length > 0;
        };

        vm.getSelectedMonthDaysU = function (value) {
            if (selectedMonthsU.indexOf(value) != -1) {
                return true;
            }
        };

        vm.textEditor = function () {
            if (vm.xmlObj)
                toJSON(vm.xmlObj.xml);
        };

        vm.editXml = function (flag) {
            vm.editor.editXml = flag;
            if (flag) {
                toXML(vm.jsonObj.json, vm.jsonObj.json.run_time ? 'runtime' : 'schedule');
            }
        };

        var watcher1 = vm.$watchCollection('runTime', function (newNames, oldValues) {
            if (newNames) {
                if ((newNames.tab != oldValues.tab)) {
                    isDelete = false;
                }
                if (vm.editor.create) {
                    if (newNames.tab === 'monthDays') {
                        if (newNames.isUltimos === 'ultimos') {
                            vm.str = gettextCatalog.getString('label.ultimos');
                        } else {
                            vm.str = gettextCatalog.getString('label.monthDays');
                        }
                    } else {
                        if (newNames.tab === 'specificWeekDays') {
                            vm.str = gettextCatalog.getString('label.specificWeekDays');
                        } else if (newNames.tab === 'specificDays') {
                            vm.str = gettextCatalog.getString('label.specificDays');
                        } else {
                            vm.str = gettextCatalog.getString('tab.weekDays');
                        }
                    }
                }

                if (newNames.tab === 'specificWeekDays') {
                    if (newNames.specificWeekDay && newNames.which) {
                        vm.editor.isEnable = true;
                        isDelete = false;
                    } else {
                        vm.editor.isEnable = false;
                    }
                } else if (newNames.tab === 'monthDays') {
                    if (newNames.isUltimos === 'months') {
                        vm.editor.isEnable = selectedMonths.length != 0;
                    } else {
                        vm.editor.isEnable = selectedMonthsU.length != 0;
                    }
                } else if (newNames.tab === 'weekDays') {
                    vm.editor.isEnable = !!(newNames.days && newNames.days.length > 0);
                }

            }
        });

        var watcher2 = vm.$watchCollection('runTime.days', function (newNames) {
            if (newNames) {
                isDelete = false;
                vm.editor.isEnable = newNames.length > 0;
                vm.runTime.all = newNames.length === 7;
                vm.runTime.days.sort();
            }
        });

        var watcher3 = vm.$watchCollection('runTime.months', function (newNames) {
            if (newNames) {
                isDelete = false;
                vm.runTime.allMonth = newNames.length === 12;
                vm.runTime.months.sort(RuntimeService.compareNumbers);
            }
        });

        var watcher4 = vm.$watchCollection('runTime.nationalHoliday', function (newNames) {
            if (newNames) {
                if (vm._tempHoliday) {
                    vm.holidayDates = angular.copy(vm._tempHoliday);
                } else {
                    vm.holidayDates = [];
                }
                if (newNames.length > 0) {
                    for (let i = 0; i < newNames.length; i++) {
                        let x = new Date(newNames[i]);
                        let flag = false;
                        for (let j = 0; j < vm.holidayDates.length; j++) {
                            if (angular.equals(vm.holidayDates[j], x)) {
                                flag = true;
                                break;
                            }
                        }
                        if (!flag)
                            vm.holidayDates.push(x);
                    }
                }
            }
        });

        vm.checkAllWeek = function () {
            if (vm.runTime.all) {
                vm.runTime.days = ["1", "2", "3", "4", "5", "6", "7"]
            } else {
                vm.runTime.days = []
            }
        };

        vm.checkAllMonth = function () {
            if (vm.runTime.allMonth) {
                vm.runTime.months = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]
            } else {
                vm.runTime.months = []
            }
        };

        vm.changeFrequency = function () {
            let temp = angular.copy(vm.runTime.period) || {};
            vm.runTime.period = {};
            vm.runTime.period.whenHoliday = temp.whenHoliday;
            if (vm.runTime.frequency === 'singleStart') {
                vm.runTime.period.singleStart = '00:00';
                delete vm.runTime.period.absoluteRepeat;
                delete vm.runTime.period.repeat;
                delete vm.runTime.period.begin;
                delete vm.runTime.period.end;
            } else if (vm.runTime.frequency === 'repeat') {
                delete vm.runTime.period.singleStart;
                delete vm.runTime.period.absoluteRepeat;
                vm.runTime.period.repeat = '00:00';
                vm.runTime.period.begin = '00:00';
                vm.runTime.period.end = '24:00';
            } else if (vm.runTime.frequency === 'absoluteRepeat') {
                delete vm.runTime.period.singleStart;
                delete vm.runTime.period.repeat;
                vm.runTime.period.absoluteRepeat = '00:00';
                vm.runTime.period.begin = '00:00';
                vm.runTime.period.end = '24:00';
            }
        };

        vm._sch = {};
        vm.changeSchedule = function () {
            if (vm._sch.schedule) {
                vm.jsonObj.json = {schedule: vm._sch};
            } else {
                vm.jsonObj.json = {run_time: {}};
            }
            vm.runTime1 = {};
            vm.holidayDates = [];
            vm.calendarFiles = [];
            getXml2Json(vm.jsonObj.json);
        };

        vm.getSubstituteTreeStructure = function(){
            EditorService.tree({
                jobschedulerId: vm.schedulerIds.selected,
                forJoe: true,
                types: ['SCHEDULE']
            }).then(function (res) {
                vm.filterTree1 = res.folders;
                angular.forEach(vm.filterTree1, function (value) {
                    value.expanded = true;
                    if (value.folders) {
                        value.folders = orderBy(value.folders, 'name');
                    }
                    vm.treeExpand(value, true);
                });
            }, function () {

            });
            $('#treeModal').modal('show');
        };

        vm.closeModal = function () {
            $('#treeModal').modal('hide');
        };

        vm.treeExpand = function (data, isFirstCall) {
            if (data.path) {
                if (!isFirstCall)
                    data.expanded = !data.expanded;
                if (data.expanded) {
                    EditorService.getFolder({
                        jobschedulerId: vm.schedulerIds.selected,
                        path: data.path
                    }).then(function (res) {
                        data.schedules = res.schedules || [];
                        for (let i = 0; i < data.schedules.length; i++) {
                            data.schedules[i].path = data.path === '/' ? data.path + '' + data.schedules[i].name : data.path + '/' + data.schedules[i].name;
                        }
                    });
                }
            } else {
                vm._sch.schedule = data.schedule;
                vm.changeSchedule();
                vm.closeModal();
            }
        };

        vm.treeExpand1 = function (data) {
            if (data.expanded) {
                data.folders = orderBy(data.folders, 'name');
            }
        };

        function frequencyToString(period) {
            let str;
            if (period.months && angular.isArray(period.months)) {
                str = RuntimeService.getMonths(period.months);
            }
            if (period.tab === 'weekDays') {
                if (str) {
                    return RuntimeService.getWeekDays(period.days) + ' on ' + str;
                } else {
                    return RuntimeService.getWeekDays(period.days);
                }
            } else if (period.tab === 'specificWeekDays') {
                if (str) {
                    return RuntimeService.getSpecificDay(period.which) + ' ' + period.specificWeekDay + ' of ' + str;
                } else {
                    return RuntimeService.getSpecificDay(period.which) + ' ' + period.specificWeekDay + ' of month';
                }
            } else if (period.tab === 'specificDays') {
                return 'On ' + moment(period.date).format('YYYY-MM-DD');
            } else if (period.tab === 'monthDays') {
                if (period.isUltimos === 'ultimos') {
                    if (str) {
                        return '- ' + RuntimeService.getMonthDays(period.selectedMonthsU, true) + ' of ' + str;
                    } else {
                        return RuntimeService.getMonthDays(period.selectedMonthsU, true) + ' of ultimos';
                    }
                } else {
                    if (str) {
                        return RuntimeService.getMonthDays(period.selectedMonths) + ' of ' + str;
                    } else {
                        return RuntimeService.getMonthDays(period.selectedMonths) + ' of month';
                    }
                }
            }
        }

        function getXml2Json(json, removeTimeZone) {
            vm.runtimeList = [];
            if (_.isEmpty(json)) {
                return;
            }
            run_time = json.run_time || json.schedule || {};
            if (!run_time.schedule) {
                vm._sch = {};
                if (vm.order && !vm.order.at) {
                    vm.order.at = 'now';
                }
            } else {
                vm._sch.schedule = run_time.schedule;
                if (vm.order && !vm.order.at) {
                    vm.order.at = 'later';
                }
                vm.selectSchedule();
            }
            if (removeTimeZone) {
                delete run_time['timeZone'];
            } else {
                vm.runTime1.timeZone = run_time.timeZone;
            }

            if (run_time.validFrom) {
                vm.from.date = run_time.validFrom;

                let d = new Date(run_time.validFrom),
                    h = d.getHours(), m = d.getMinutes(), s = d.getSeconds();
                h = h > 9 ? h : '0' + h;
                m = m > 9 ? m : '0' + m;
                s = s > 9 ? s : '0' + s;
                vm.from.time = h + ':' + m + ':' + s;
            }
            if (run_time.validTo) {
                vm.to.date = run_time.validTo;
                let d = new Date(run_time.validTo),
                    h = d.getHours(), m = d.getMinutes(), s = d.getSeconds();
                h = h > 9 ? h : '0' + h;
                m = m > 9 ? m : '0' + m;
                s = s > 9 ? s : '0' + s;
                vm.to.time = h + ':' + m + ':' + s;
            }

            if (vm.sch) {
                vm.sch.title = run_time.title;
                vm.sch.name = run_time.name;
                vm.sch.substitute = run_time.substitute;
                vm.sch.validTo = run_time.validTo;
                vm.sch.validFrom = run_time.validFrom;
            }

            if (vm.substituteObj) {
                vm.substituteObj.name = run_time.name;
                if (!run_time.validFrom) {
                    vm.substituteObj.fromDate = '';
                    vm.substituteObj.fromTime = '00:00';
                }
                if (!run_time.validTo) {
                    vm.substituteObj.toDate = '';
                    vm.substituteObj.toTime = '00:00';
                }
            }

            if (!_.isEmpty(run_time.holidays) && run_time.holidays) {
                vm.runTime1.holidays = {};
                vm.holidayDates = [];
                vm.calendarFiles = [];
                if (run_time.holidays.weekdays && run_time.holidays.weekdays.days) {
                    if (!angular.isArray(run_time.holidays.weekdays.days)) {
                        let temp = angular.copy(run_time.holidays.weekdays.days);
                        run_time.holidays.weekdays.days = [];
                        run_time.holidays.weekdays.days.push(temp);
                    }
                    if (run_time.holidays.weekdays.days.length > 0) {
                        let _day = [];
                        for (let i = 0; i < run_time.holidays.weekdays.days.length; i++) {
                            if (angular.isArray(run_time.holidays.weekdays.days[i].day)) {
                                _day = _day.concat(run_time.holidays.weekdays.days[i].day)
                            } else {
                                _day.push(run_time.holidays.weekdays.days[i].day);
                            }
                        }
                        run_time.holidays.weekdays.days[0].day = _.uniq(_day);
                        if (angular.isArray(run_time.holidays.weekdays.days[0].day)) {
                            run_time.holidays.weekdays.days[0].day = run_time.holidays.weekdays.days[0].day.join(' ');
                        }
                        vm.runTime1.holidays.weekdays = {days: angular.copy(run_time.holidays.weekdays.days[0])};
                        if (!angular.isArray(vm.runTime1.holidays.weekdays.days.day)) {
                            vm.runTime1.holidays.weekdays.days.day = vm.runTime1.holidays.weekdays.days.day.split(' ');
                        }
                        vm.runTime1.holidays.weekdays.days.day.sort();
                    }
                }

                if (run_time.holidays.includes) {
                    if (angular.isArray(run_time.holidays.includes)) {
                        angular.forEach(run_time.holidays.includes, function (file) {
                            if (file.liveFile)
                                vm.calendarFiles.push('liveFile: ' + file.liveFile);
                            if (file.file)
                                vm.calendarFiles.push('file: ' + file.file);
                        });
                    }
                }
                if (angular.isArray(run_time.holidays.days)) {
                    angular.forEach(run_time.holidays.days, function (value1) {
                        if (value1.date && !value1.calendar) {
                            vm.holidayDates.push(new Date(value1.date));
                        }
                        if (value1._file) {
                            vm.calendarFiles.push('file: ' + value1._file);
                        }
                        if (value1.liveFile) {
                            vm.calendarFiles.push('liveFile: ' + value1.liveFile);
                        }
                    });
                }
            }

            if (run_time.dates) {
                angular.forEach(run_time.dates, function (res) {
                    if (res.periods && !angular.isArray(res.periods)) {
                        res.periods = [res.periods];
                    }
                    var str = '';
                    if (res.date && !res.calendar) {
                        str = 'On ' + res.date;
                        let periodStrArr = [], objArr = [];
                        angular.forEach(res.periods, function (res1) {
                            let periodStr = null;
                            if (res1.begin) {
                                periodStr = res1.begin;
                            }
                            if (res1.end) {
                                periodStr = periodStr + '-' + res1.end;
                            }
                            if (res1.singleStart) {
                                periodStr = 'Single start : ' + res1.singleStart;
                            } else if (res1.absoluteRepeat) {
                                periodStr = periodStr + ' every ' + RuntimeService.getTimeInString(res1.absoluteRepeat);
                            } else if (res1.repeat) {
                                periodStr = periodStr + ' every ' + RuntimeService.getTimeInString(res1.repeat);
                            }
                            if (periodStr)
                                periodStrArr.push(periodStr);
                            objArr.push({
                                date: res.date,
                                periods: _.isEmpty(res1) ? [] : [res1]
                            });
                        });

                        if (objArr.length === 0) {
                            objArr.push({
                                date: res.date,
                                periods: []
                            });
                        }

                        vm.runtimeList.push(
                            {
                                frequency: str,
                                period: periodStrArr,
                                obj: objArr,
                                type: 'date'
                            });

                    } else if (res.date && res.calendar) {
                        if (vm.calPeriod && vm.calPeriod.length > 0) {
                            for (let i = 0; i < vm.calPeriod.length; i++) {
                                if (res.calendar === vm.calPeriod[i].calendar) {
                                    let flag = false;
                                    if (res.periods) {
                                        angular.forEach(res.periods, function (period, index) {
                                            if (period) {
                                                if (RuntimeService.checkPeriod(period, vm.calPeriod[i].period))
                                                    flag = true;
                                            } else {
                                                res.periods.splice(index, 1)
                                            }
                                        });
                                        if (!flag)
                                            res.periods.push(vm.calPeriod[i].period);
                                    } else {
                                        res.periods = [];
                                        if (!flag)
                                            res.periods.push(vm.calPeriod[i].period);
                                    }
                                }
                            }

                        }
                        var periodStrArr = [], objArr = [];
                        if (res.periods) {
                            angular.forEach(res.periods, function (res1) {
                                if (res1 && !angular.isArray(res1)) {
                                    let periodStr = null;
                                    if (res1.begin) {
                                        periodStr = res1.begin;
                                    }
                                    if (res1.end) {
                                        periodStr = periodStr + '-' + res1.end;
                                    }
                                    if (res1.singleStart) {
                                        periodStr = 'Single start : ' + res1.singleStart;
                                    } else if (res1.absoluteRepeat) {
                                        periodStr = periodStr + ' every ' + RuntimeService.getTimeInString(res1.absoluteRepeat);
                                    } else if (res1.repeat) {
                                        periodStr = periodStr + ' every ' + RuntimeService.getTimeInString(res1.repeat);
                                    }
                                    if (periodStr)
                                        periodStrArr.push(periodStr);

                                    objArr.push({
                                        calendar: res.calendar,
                                        periods: _.isEmpty(res1) ? [] : [res1]
                                    });
                                }
                            });
                        }
                        let flg = true;
                        let _calendar = {};
                        angular.forEach(vm.selectedCalendar, function (calendar) {
                            if (calendar.path === res.calendar) {
                                _calendar = calendar;
                                calendar.periods = objArr;
                                flg = false;
                            }
                        });

                        for (let i = 0; i < vm.runtimeList.length; i++) {
                            if (vm.runtimeList[i].calendar && vm.runtimeList[i].calendar.path === _calendar.path) {
                                flg = true;
                                break;
                            }
                        }

                        if (!flg) {
                            vm.runtimeList.push({
                                calendar: _calendar,
                                period: periodStrArr,
                                obj: objArr,
                                type: 'calendar'
                            });
                        }
                    }
                });
            }
            if (vm.selectedCalendar) {
                angular.forEach(vm.selectedCalendar, function (calendar) {
                    let flag = true;
                    for (let i = 0; i < vm.runtimeList.length; i++) {
                        if (vm.runtimeList[i].type === 'calendar' && calendar.path === vm.runtimeList[i].calendar.path) {
                            flag = false;
                            break;
                        }
                    }
                    if (flag) {
                        vm.runtimeList.push({
                            calendar: calendar,
                            period: [],
                            obj: [],
                            type: 'calendar'
                        });
                    }
                });
            }
            if (run_time.weekdays && run_time.weekdays.days) {
                angular.forEach(run_time.weekdays.days, function (res) {
                    let str = '';
                    if (res.day) {
                        if (angular.isArray(res.day)) {
                            res.day = res.day.join(' ');
                        }
                        str = RuntimeService.getWeekDays(res.day);
                        let periodStrArr = [], objArr = [];
                        if (res.periods && !angular.isArray(res.periods)) {
                            res.periods = [res.periods];
                        }
                        if (res.periods && res.periods.length > 0) {
                            angular.forEach(res.periods, function (value1) {
                                let periodStr = null;
                                if (value1.begin) {
                                    periodStr = value1.begin;
                                }
                                if (value1.end) {
                                    periodStr = periodStr + '-' + value1.end;
                                }
                                if (value1.singleStart) {
                                    periodStr = 'Single start : ' + value1.singleStart;
                                } else if (value1.absoluteRepeat) {
                                    periodStr = periodStr + ' every ' + RuntimeService.getTimeInString(value1.absoluteRepeat);
                                } else if (value1.repeat) {
                                    periodStr = periodStr + ' every ' + RuntimeService.getTimeInString(value1.repeat);
                                }
                                if (periodStr)
                                    periodStrArr.push(periodStr);
                                objArr.push({
                                    day: res.day,
                                    periods: _.isEmpty(value1) ? [] : [value1]
                                });
                            });
                        } else {
                            objArr.push({
                                day: res.day,
                                periods: []
                            });
                        }

                        vm.runtimeList.push({
                            frequency: str,
                            period: periodStrArr,
                            obj: objArr, type: 'weekdays'
                        });

                    }
                });
            }
            if (run_time.monthdays) {
                if (run_time.monthdays.weekdays && run_time.monthdays.weekdays.length > 0) {
                    angular.forEach(run_time.monthdays.weekdays, function (value) {
                        if (value && !angular.isArray(value)) {
                            let str = '';
                            if (value.day) {
                                if (angular.isArray(value.day)) {
                                    value.day = value.day.join(' ');
                                }
                                str = RuntimeService.getSpecificDay(value.which) + ' ' + value.day + ' of month';
                                let periodStrArr = [], objArr = [];

                                if (value.periods && value.periods.length > 0) {
                                    angular.forEach(value.periods, function (value1) {
                                        let periodStr = null;
                                        if (value1.begin) {
                                            periodStr = value1.begin;
                                        }
                                        if (value1.end) {
                                            periodStr = periodStr + '-' + value1.end;
                                        }
                                        if (value1.singleStart) {
                                            periodStr = 'Single start : ' + value1.singleStart;
                                        } else if (value1.absoluteRepeat) {
                                            periodStr = periodStr + ' every ' + RuntimeService.getTimeInString(value1.absoluteRepeat);
                                        } else if (value1.repeat) {
                                            periodStr = periodStr + ' every ' + RuntimeService.getTimeInString(value1.repeat);
                                        }
                                        if (periodStr)
                                            periodStrArr.push(periodStr);
                                        objArr.push({
                                            day: value.day,
                                            periods: _.isEmpty(value1) ? [] : [value1],
                                            which: value.which
                                        });
                                    });
                                } else {
                                    objArr.push({
                                        day: value.day,
                                        periods: [],
                                        which: value.which
                                    });
                                }

                                vm.runtimeList.push({
                                    frequency: str,
                                    period: periodStrArr,
                                    obj: objArr, type: 'weekday'
                                });
                            }
                        }
                    });
                }
                if (run_time.monthdays.days && run_time.monthdays.days.length > 0) {
                    angular.forEach(run_time.monthdays.days, function (res) {
                        let str = '';
                        if (res && res.day) {
                            if (angular.isArray(res.day)) {
                                res.day = res.day.join(' ');
                            }
                            str = RuntimeService.getMonthDays(res.day) + ' of month';
                            let periodStrArr = [], objArr = [];
                            if (res.periods && !angular.isArray(res.periods)) {
                                res.periods = [res.periods];
                            }
                            if (res.periods && res.periods.length > 0) {
                                angular.forEach(res.periods, function (res1) {
                                    let periodStr = null;
                                    if (res1.begin) {
                                        periodStr = res1.begin;
                                    }
                                    if (res1.end) {
                                        periodStr = periodStr + '-' + res1.end;
                                    }
                                    if (res1.singleStart) {
                                        periodStr = 'Single start: ' + res1.singleStart;
                                    } else if (res1.absoluteRepeat) {
                                        periodStr = periodStr + ' every ' + RuntimeService.getTimeInString(res1.absoluteRepeat);
                                    } else if (res1.repeat) {
                                        periodStr = periodStr + ' every ' + RuntimeService.getTimeInString(res1.repeat);
                                    }
                                    if (periodStr)
                                        periodStrArr.push(periodStr);
                                    objArr.push({
                                        day: res.day,
                                        periods: _.isEmpty(res1) ? [] : [res1]
                                    });
                                });
                            } else {
                                objArr.push({
                                    day: res.day,
                                    periods: []
                                });
                            }
                            vm.runtimeList.push({
                                frequency: str,
                                period: periodStrArr, obj: objArr, type: 'monthdays'
                            });
                        }
                    });
                }
            }
            if (run_time.ultimos && run_time.ultimos.days && run_time.ultimos.days.length > 0) {
                angular.forEach(run_time.ultimos.days, function (res) {
                    let str = '';
                    if (res && res.day) {
                        if (angular.isArray(res.day)) {
                            res.day = res.day.join(' ');
                        }
                        str = RuntimeService.getMonthDays(res.day, true) + ' of ultimos';
                        let periodStrArr = [], objArr = [];
                        if (res.periods && !angular.isArray(res.periods)) {
                            res.periods = [res.periods];
                        }
                        if (res.periods && res.periods.length > 0) {
                            angular.forEach(res.periods, function (res1) {
                                let periodStr = null;
                                if (res1.begin) {
                                    periodStr = res1.begin;
                                }
                                if (res1.end) {
                                    periodStr = periodStr + '-' + res1.end;
                                }
                                if (res1.singleStart) {
                                    periodStr = 'Single start: ' + res1.singleStart;
                                } else if (res1.absoluteRepeat) {
                                    periodStr = periodStr + ' every ' + RuntimeService.getTimeInString(res1.absoluteRepeat);
                                } else if (res1.repeat) {
                                    periodStr = periodStr + ' every ' + RuntimeService.getTimeInString(res1.repeat);
                                }
                                if (periodStr)
                                    periodStrArr.push(periodStr);
                                objArr.push({
                                    day: res.day,
                                    periods: _.isEmpty(res1) ? [] : [res1]
                                });
                            });
                        } else {
                            objArr.push({
                                day: res.day,
                                periods: []
                            });
                        }
                        vm.runtimeList.push(
                            {
                                frequency: str,
                                period: periodStrArr,
                                obj: objArr,
                                type: 'ultimos'
                            });
                    }
                });
            }
            if (run_time.months) {
                if (angular.isArray(run_time.months)) {
                    angular.forEach(run_time.months, function (res) {
                        if (res.month && !angular.isArray(res.month) && res.month.match(/[a-z]/)) {
                            res.month = RuntimeService.stringMonthsNumber(res.month);
                        }
                        if (res.month && angular.isArray(res.month)) {
                            res.month = res.month.join(' ');
                        }

                        if (!_.isEmpty(res.weekdays)) {
                            if (res.weekdays.days) {
                                if (angular.isArray(res.weekdays.days)) {
                                    angular.forEach(res.weekdays.days, function (val) {
                                        let str, str1;
                                        if (res.month)
                                            str1 = RuntimeService.getMonths(res.month);
                                        if (val.day) {
                                            if (angular.isArray(val.day)) {
                                                val.day = val.day.join(' ');
                                            }
                                            str = RuntimeService.getWeekDays(val.day) + ' on ' + str1;
                                            let periodStrArr = [], objArr = [];
                                            if (val.periods && val.periods.length > 0) {
                                                angular.forEach(val.periods, function (res1) {
                                                    let periodStr = null;
                                                    if (res1.begin) {
                                                        periodStr = res1.begin;
                                                    }
                                                    if (res1.end) {
                                                        periodStr = periodStr + '-' + res1.end;
                                                    }
                                                    if (res1.singleStart) {
                                                        periodStr = 'Single start: ' + res1.singleStart;
                                                    } else if (res1.absoluteRepeat) {
                                                        periodStr = periodStr + ' every ' + RuntimeService.getTimeInString(res1.absoluteRepeat);
                                                    } else if (res1.repeat) {
                                                        periodStr = periodStr + ' every ' + RuntimeService.getTimeInString(res1.repeat);
                                                    }
                                                    if (periodStr)
                                                        periodStrArr.push(periodStr);
                                                    objArr.push({
                                                        day: val.day,
                                                        month: res.month,
                                                        periods: _.isEmpty(res1) ? [] : [res1]
                                                    });
                                                });
                                            } else {
                                                objArr.push({
                                                    day: val.day,
                                                    month: res.month,
                                                    periods: []
                                                });
                                            }

                                            vm.runtimeList.push({
                                                frequency: str,
                                                period: periodStrArr,
                                                obj: objArr,
                                                type: 'month', type2: 'weekdays'
                                            });
                                        }
                                    });
                                }
                            }
                        }
                        if (!_.isEmpty(res.monthdays)) {
                            if (res.monthdays.weekdays) {
                                if (angular.isArray(res.monthdays.weekdays)) {
                                    angular.forEach(res.monthdays.weekdays, function (value) {
                                        if (!angular.isArray(value)) {
                                            let str, str1;
                                            if (res.month)
                                                str1 = RuntimeService.getMonths(res.month);
                                            if (value.day) {
                                                if (angular.isArray(value.day)) {
                                                    value.day = value.day.join(' ');
                                                }
                                                str = RuntimeService.getSpecificDay(value.which) + ' ' + value.day + ' of ' + str1;
                                                let periodStrArr = [], objArr = [];

                                                if (value.periods && value.periods.length > 0) {
                                                    angular.forEach(value.periods, function (value1) {
                                                        let periodStr = null;
                                                        if (value1.begin) {
                                                            periodStr = value1.begin;
                                                        }
                                                        if (value1.end) {
                                                            periodStr = periodStr + '-' + value1.end;
                                                        }
                                                        if (value1.singleStart) {
                                                            periodStr = 'Single start : ' + value1.singleStart;
                                                        } else if (value1.absoluteRepeat) {
                                                            periodStr = periodStr + ' every ' + RuntimeService.getTimeInString(value1.absoluteRepeat);
                                                        } else if (value1.repeat) {
                                                            periodStr = periodStr + ' every ' + RuntimeService.getTimeInString(value1.repeat);
                                                        }
                                                        if (periodStr)
                                                            periodStrArr.push(periodStr);
                                                        objArr.push({
                                                            day: value.day,
                                                            month: res.month,
                                                            periods: _.isEmpty(value1) ? [] : [value1],
                                                            which: value.which
                                                        });
                                                    });
                                                } else {
                                                    objArr.push({
                                                        day: value.day,
                                                        month: res.month,
                                                        periods: [],
                                                        which: value.which
                                                    });
                                                }
                                                vm.runtimeList.push({
                                                    frequency: str,
                                                    period: periodStrArr,
                                                    obj: objArr,
                                                    type: 'month',
                                                    type2: 'weekday'
                                                });

                                            }
                                        }
                                    });
                                }
                            }
                            if (res.monthdays.days) {
                                if (angular.isArray(res.monthdays.days)) {
                                    angular.forEach(res.monthdays.days, function (val) {
                                        let str, str1;
                                        if (res.month)
                                            str1 = RuntimeService.getMonths(res.month);
                                        if (val.day) {
                                            if (angular.isArray(val.day)) {
                                                val.day = val.day.join(' ');
                                            }
                                            str = RuntimeService.getMonthDays(val.day) + ' of ' + str1;
                                            let periodStrArr = [], objArr = [];
                                            if (val.periods && !angular.isArray(val.periods)) {
                                                val.periods = [val.periods];
                                            }
                                            if (val.periods && val.periods.length > 0) {
                                                angular.forEach(val.periods, function (res1) {
                                                    let periodStr = null;
                                                    if (res1.begin) {
                                                        periodStr = res1.begin;
                                                    }
                                                    if (res1.end) {
                                                        periodStr = periodStr + '-' + res1.end;
                                                    }
                                                    if (res1.singleStart) {
                                                        periodStr = 'Single start: ' + res1.singleStart;
                                                    } else if (res1.absoluteRepeat) {
                                                        periodStr = periodStr + ' every ' + RuntimeService.getTimeInString(res1.absoluteRepeat);
                                                    } else if (res1.repeat) {
                                                        periodStr = periodStr + ' every ' + RuntimeService.getTimeInString(res1.repeat);
                                                    }
                                                    if (periodStr)
                                                        periodStrArr.push(periodStr);
                                                    objArr.push({
                                                        day: val.day,
                                                        month: res.month,
                                                        periods: _.isEmpty(res1) ? [] : [res1]
                                                    });

                                                });
                                            } else {
                                                objArr.push({
                                                    day: val.day,
                                                    month: res.month,
                                                    periods: []
                                                });
                                            }
                                            vm.runtimeList.push({
                                                frequency: str,
                                                period: periodStrArr,
                                                obj: objArr, type: 'month', type2: 'monthdays'
                                            });
                                        }
                                    });
                                }
                            }
                        }
                        if (!_.isEmpty(res.ultimos)) {
                            if (res.ultimos.days) {
                                if (angular.isArray(res.ultimos.days)) {
                                    angular.forEach(res.ultimos.days, function (val) {
                                        let str, str1;
                                        if (res.month) {
                                            str1 = RuntimeService.getMonths(res.month);
                                        }
                                        if (val.day) {
                                            if (angular.isArray(val.day)) {
                                                val.day = val.day.join(' ');
                                            }
                                            str = 'Ultimos: ' + RuntimeService.getMonthDays(val.day, true) + ' of ' + str1;
                                            let periodStrArr = [], objArr = [];
                                            if (val.periods && !angular.isArray(val.periods)) {
                                                val.periods = [val.periods];
                                            }
                                            if (val.periods && val.periods.length > 0) {
                                                angular.forEach(val.periods, function (res1) {
                                                    let periodStr = null;
                                                    if (res1.begin) {
                                                        periodStr = res1.begin;
                                                    }
                                                    if (res1.end) {
                                                        periodStr = periodStr + '-' + res1.end;
                                                    }
                                                    if (res1.singleStart) {
                                                        periodStr = 'Single start: ' + res1.singleStart;
                                                    } else if (res1.absoluteRepeat) {
                                                        periodStr = periodStr + ' every ' + RuntimeService.getTimeInString(res1.absoluteRepeat);
                                                    } else if (res1.repeat) {
                                                        periodStr = periodStr + ' every ' + RuntimeService.getTimeInString(res1.repeat);
                                                    }
                                                    if (periodStr)
                                                        periodStrArr.push(periodStr);
                                                    objArr.push({
                                                        day: val.day,
                                                        month: res.month,
                                                        periods: _.isEmpty(res1) ? [] : [res1]
                                                    });

                                                });
                                            } else {
                                                objArr.push({
                                                    day: val.day,
                                                    month: res.month,
                                                    periods: []
                                                });
                                            }

                                            vm.runtimeList.push(
                                                {
                                                    frequency: str,
                                                    period: periodStrArr,
                                                    obj: objArr,
                                                    type: 'month',
                                                    type2: 'ultimos'
                                                });
                                        }
                                    });
                                }
                            }
                        }
                    });
                }
            }

            if (vm.calPeriod && vm.calPeriod.length) {
                vm.calPeriod = [];
                resetPeriodObj(run_time);
                return;
            }

            run_time = cleanDeep(run_time);
            if (vm.sch) {
                if (vm.sch.substitute) {
                    if (vm.sch.substitute && !vm.sch.substitute.path) {
                        run_time.substitute = vm.sch.substitute;
                    } else {
                        run_time.substitute = vm.sch.substitute.path;
                    }
                }
                if (vm.sch.validFrom) {
                    run_time.validFrom = vm.sch.validFrom;
                }
                if (vm.sch.validTo) {
                    run_time.validTo = vm.sch.validTo;
                }
                if (vm.sch.title) {
                    run_time.title = vm.sch.title;
                }
            }
            if (vm.order) {
                vm.jsonObj.json.run_time = angular.copy(run_time);
            } else if (vm.schedule) {
                vm.jsonObj.json.schedule = angular.copy(run_time);
            }

            if (vm.editor.editXml) {
                toXML(vm.jsonObj.json, vm.jsonObj.json.run_time ? 'runtime' : 'schedule');
            }
            if (vm.joe) {
                if (vm.order) {
                    vm.obj.run_time = vm.jsonObj.json.run_time;
                } else {
                    vm.obj.schedule = vm.jsonObj.json.schedule;
                }
                vm.obj.calendars = [];
                setCalendarToJoeRuntime(vm.obj);
            }
        }

        function resetPeriodObj(run_time) {
            if (!_.isEmpty(run_time.weekdays)) {
                if (!(run_time.weekdays.days && (run_time.weekdays.days.length > 0))) {
                    delete run_time['weekdays'];
                }
            } else {
                delete run_time['weekdays'];
            }

            if (!_.isEmpty(run_time.monthdays)) {
                if (!(run_time.monthdays.weekdays && run_time.monthdays.weekdays.length > 0)) {
                    if (_.isEmpty(run_time.monthdays.weekdays))
                        delete run_time.monthdays['weekdays'];
                }
                if (!(run_time.monthdays.days && (run_time.monthdays.days.length > 0 || run_time.monthdays.days.day))) {
                    if (!run_time.monthdays.weekdays) {
                        delete run_time['monthdays'];
                    } else if (run_time.monthdays.days) {
                        if (run_time.monthdays.days.length === 0 && run_time.monthdays.weekdays.length === 0) {
                            delete run_time['monthdays'];
                        } else if (run_time.monthdays.days.length === 0) {
                            delete run_time.monthdays['days'];
                        }
                    }
                }
            } else {
                delete run_time['monthdays'];
            }

            if (!_.isEmpty(run_time.ultimos)) {
                if (!(run_time.ultimos.days && (run_time.ultimos.days.length > 0 || run_time.ultimos.days.day))) {
                    delete run_time['ultimos'];
                }
            } else {
                delete run_time['ultimos'];
            }

            if (!_.isEmpty(run_time.months)) {
                if (!(run_time.months.length > 0 || run_time.months.month)) {
                    delete run_time['months'];
                }
            } else {
                delete run_time['months'];
            }

            if (!_.isEmpty(run_time.holidays)) {
                if (run_time.holidays.days) {
                    if (angular.isArray(run_time.holidays.days) && run_time.holidays.days.length === 0) {
                        delete run_time.holidays['days'];
                    } else if (_.isEmpty(run_time.holidays.days)) {
                        delete run_time.holidays['days'];
                    }
                }
                if (!(run_time.holidays.includes && run_time.holidays.includes.length > 0)) {
                    delete run_time.holidays['includes'];
                }

                if (!(run_time.holidays.weekdays && run_time.holidays.weekdays.days && run_time.holidays.weekdays.days.length > 0)) {
                    delete run_time.holidays['weekdays'];
                }
            }
            if (_.isEmpty(run_time.holidays)) {
                delete run_time['holidays'];
            }
            run_time = cleanDeep(run_time);
            if (vm.order) {
                vm.tempRuntime = {run_time: run_time};
            } else if (vm.schedule) {
                vm.tempRuntime = {schedule: run_time};
            }

            getXml2Json(angular.copy(vm.tempRuntime));
        }

        vm.removeSchedule = function () {
            vm._jsonTemp = {run_time: {}};
            getXml2Json(vm._jsonTemp);
        };

        vm.addPeriodInFrequency = function (data) {
            $rootScope.$broadcast('period-editor', {
                frequency: data,
                isOrderJob: (vm.order && vm.order.isOrderJob != undefined) ? vm.order.isOrderJob : null
            });
            $('#period-editor').modal('show');
        };
        var promise4 = $timeout(function () {
            $rootScope.$broadcast('restrictionModalTemplateLoaded');
        }, 100);

        vm.addRestrictionInCalendar = function (data) {
            $rootScope.$broadcast('restriction-frequency-editor', data);
            $('#restriction-editor').modal('show');
            $('.fade-modal').css('opacity', '0.85');
        };
        vm.editRestrictionInCalendar = function (data, frequency) {
            $rootScope.$broadcast('restriction-frequency-editor', {
                calendar: data.calendar || data,
                updateFrequency: frequency
            });
            $('#restriction-editor').modal('show');
            $('.fade-modal').css('opacity', '0.85');
        };
        vm.deleteRestrictionInCalendar = function (data, frequency) {
            for (let i = 0; i < data.calendar.frequencyList.length; i++) {
                if (data.calendar.frequencyList[i].str === frequency.str) {
                    data.calendar.frequencyList.splice(i, 1);
                    break;
                }
            }
            for (let i = 0; i < vm.selectedCalendar.length; i++) {
                if (data.path === vm.selectedCalendar[i].path) {
                    for (let j = 0; j < vm.selectedCalendar[i].frequencyList.length; j++) {
                        if (vm.selectedCalendar[i].frequencyList[j].str === frequency.str) {
                            vm.selectedCalendar[i].frequencyList(j, 1);
                            break;
                        }
                    }
                    break;
                }
            }
            generateCalendarTag(vm.selectedCalendar);
        };

        vm.$on('save-restriction-frequency', function (event, data) {
            for (let i = 0; i < vm.runtimeList.length; i++) {
                if (vm.runtimeList[i].type === 'calendar' && data.path === vm.runtimeList[i].calendar.path) {
                    vm.runtimeList[i].calendar.frequencyList = data.frequencyList;
                    break;
                }
            }
            for (let i = 0; i < vm.selectedCalendar.length; i++) {
                if (vm.selectedCalendar[i].path === data.path) {
                    vm.selectedCalendar[i].frequencyList = data.frequencyList;
                    break;
                }
            }
            generateCalendarTag(vm.selectedCalendar);
        });

        vm.editPeriodFromFrequency = function (data, index, periodStr) {
            var period = data.obj[index].periods;
            if (period === '' || !period) {
                for (let i = 0; i < data.obj.length; i++) {
                    if (data.obj[i].periods) {
                        if (i > index) {
                            period = data.obj[i].periods;
                            break;
                        }
                    }
                }
            }

            $rootScope.$broadcast('period-editor', {
                frequency: data,
                period: period,
                periodStr: periodStr,
                isOrderJob: (vm.order && vm.order.isOrderJob != undefined) ? vm.order.isOrderJob : null
            });
            $('#period-editor').modal('show');
        };
        $scope.$on('cancel-period', function () {
            _tempPeriod = {};
        });
        $scope.$on('save-period', function (event, data1) {
            let data = angular.copy(data1);
            if (data.frequency && !_.isEmpty(data.frequency)) {
                editRunTime(data);
            } else {
                vm.runTime.period = data.period.period;
                vm.runTime.frequency = data.period.frequency;
                if (vm.editor.update) {
                    if (_tempPeriod && !_.isEmpty(_tempPeriod)) {
                        for (let i = 0; i < vm.periodList.length; i++) {
                            if (angular.equals(vm.periodList[i], _tempPeriod)) {
                                vm.periodList[i] = angular.copy(vm.runTime);
                            }
                        }
                        _tempPeriod = {};
                    } else {
                        if (vm.runTime.tab === 'monthDays') {
                            if (selectedMonths && vm.runTime.isUltimos === 'months') {
                                vm.runTime.selectedMonths = selectedMonths;
                            } else if (selectedMonthsU && vm.runTime.isUltimos === 'ultimos') {
                                vm.runTime.selectedMonthsU = selectedMonthsU;
                            }
                        }
                        vm.runTime.str = frequencyToString(vm.runTime);
                        vm.periodList.push(angular.copy(vm.runTime));
                    }
                    vm.runTime.frequency = undefined;
                    vm.runTime.period = {};
                }
            }
        });

        $scope.$on('remove-substitue', function (event, data1) {
            try {
                if (typeof vm.jsonObj.json.schedule !== 'object') vm.jsonObj.json.schedule = {};
                delete vm.jsonObj.json.schedule['validFrom'];
                delete vm.jsonObj.json.schedule['validTo'];
                delete vm.jsonObj.json.schedule['title'];
                delete vm.jsonObj.json.schedule['substitute'];

                getXml2Json(vm.jsonObj.json);
            } catch (e) {
                console.error(e);
            }
        });

        $scope.$on('save-schedule', function (event, data1) {
            vm.sch = data1.sch;
            //   vm._schedules = data1.schedules;
            saveSch();
        });

        function editRunTime(data) {
            if (data.frequency.frequency && data.frequency.frequency.calendar) {
                addPeriodInCalendar(angular.copy(data));
                return;
            }
            vm.updateTime = angular.copy(data.frequency.frequency);
            vm.periodList = [];
            vm.runTime = {};
            if (!_.isEmpty(vm.updateTime.obj) && angular.isArray(vm.updateTime.obj)) {
                angular.forEach(vm.updateTime.obj, function (value) {
                    if (value.periods && value.periods.length > 0) {
                        let obj = {};
                        if (vm.updateTime.type2) {
                            obj.tab = vm.updateTime.type2 === 'weekdays' ? 'weekDays' : vm.updateTime.type2 === 'monthdays' ? 'monthDays' : vm.updateTime.type2 === 'weekday' ? 'specificWeekDays' : vm.updateTime.type2 === 'ultimos' ? 'monthDays' : 'specificDays';
                        } else {
                            obj.tab = vm.updateTime.type === 'weekdays' ? 'weekDays' : vm.updateTime.type === 'monthdays' ? 'monthDays' : vm.updateTime.type === 'weekday' ? 'specificWeekDays' : vm.updateTime.type === 'ultimos' ? 'monthDays' : 'specificDays';
                        }

                        if (vm.updateTime.type === 'ultimos' || vm.updateTime.type2 === 'ultimos') {
                            obj.isUltimos = 'ultimos';
                        } else {
                            obj.isUltimos = 'months';
                        }
                        obj.period = {};

                        let x;
                        if (angular.isArray(value.periods)) {
                            x = value.periods[0];
                        } else {
                            x = value.periods;
                        }

                        if (x.singleStart) {
                            obj.frequency = 'singleStart';
                            obj.period.singleStart = x.singleStart;
                        } else if (x.absoluteRepeat) {
                            obj.frequency = 'absoluteRepeat';
                            obj.period.absoluteRepeat = x.absoluteRepeat;
                        } else if (x.repeat) {
                            obj.frequency = 'repeat';
                            obj.period.repeat = x.repeat;
                        }
                        if (x.begin) {
                            obj.period.begin = x.begin;
                        }
                        if (x.end) {
                            obj.period.end = x.end;
                        }
                        if (x.whenHoliday) {
                            obj.period.whenHoliday = x.whenHoliday;
                        }
                        if (obj.tab === 'weekDays') {
                            obj.days = value.day.toString().split(' ').sort();
                        } else if (obj.tab === 'monthDays') {
                            if (obj.isUltimos === 'ultimos') {
                                obj.selectedMonthsU = value.day.toString().split(' ').sort(RuntimeService.compareNumbers);
                            } else {
                                obj.selectedMonths = value.day.toString().split(' ').sort(RuntimeService.compareNumbers);
                            }
                        } else if (obj.tab === 'specificWeekDays') {
                            obj.specificWeekDay = value.day;
                            obj.which = value.which;
                        } else if (obj.tab === 'specificDays') {
                            obj.date = new Date(value.date);
                        }

                        if (value.month) {
                            obj.months = value.month.toString().split(' ').sort(RuntimeService.compareNumbers);
                        }
                        obj.str = frequencyToString(obj);
                        vm.periodList.push(obj);
                    }
                })
            }

            if (!_.isEmpty(vm.updateTime)) {
                if (vm.updateTime.type === 'date') {
                    if (angular.isArray(run_time.dates)) {
                        angular.forEach(run_time.dates, function (res1, index) {
                            if (angular.equals(res1.date, vm.updateTime.obj[0].date)) {
                                run_time.dates.splice(index, 1);
                            }
                        });
                    } else {
                        if (angular.equals(run_time.dates.date, vm.updateTime.obj[0].date)) {
                            delete run_time['dates'];
                        }
                    }
                } else if (vm.updateTime.type === 'weekdays') {
                    if (run_time.weekdays) {
                        if (angular.isArray(run_time.weekdays.days)) {
                            angular.forEach(run_time.weekdays.days, function (res1, index) {
                                if (angular.equals(res1.day, vm.updateTime.obj[0].day)) {
                                    run_time.weekdays.days.splice(index, 1);
                                }
                            });
                        } else {
                            if (angular.equals(run_time.weekdays.days.day, vm.updateTime.obj[0].day)) {
                                delete run_time['weekdays'];
                            }

                        }
                    }
                } else if (vm.updateTime.type === 'monthdays') {
                    if (run_time.monthdays) {
                        if (angular.isArray(run_time.monthdays.days)) {
                            angular.forEach(run_time.monthdays.days, function (res1, index) {
                                if (angular.equals(res1.day, vm.updateTime.obj[0].day)) {
                                    run_time.monthdays.days.splice(index, 1);
                                }
                            });
                        } else {
                            if (angular.equals(run_time.monthdays.days.day, vm.updateTime.obj[0].day)) {
                                delete run_time.monthdays['days'];
                            }
                        }
                    }

                } else if (vm.updateTime.type === 'weekday') {
                    if (run_time.monthdays) {
                        if (angular.isArray(run_time.monthdays.weekdays)) {
                            angular.forEach(run_time.monthdays.weekdays, function (res1, index) {
                                if (angular.equals(res1.which, vm.updateTime.obj[0].which) && angular.equals(res1.day, vm.updateTime.obj[0].day)) {
                                    run_time.monthdays.weekdays.splice(index, 1);
                                }
                            });
                        } else {
                            if (angular.equals(run_time.monthdays.weekdays.day, vm.updateTime.obj[0].weekday) && angular.equals(run_time.monthdays.weekdays.which, vm.updateTime.obj[0].which)) {
                                delete run_time.monthdays['weekdays'];
                            }
                        }
                    }
                } else if (vm.updateTime.type === 'ultimos') {
                    if (run_time.ultimos) {
                        if (angular.isArray(run_time.ultimos.days)) {
                            angular.forEach(run_time.ultimos.days, function (res1, index) {
                                if (angular.equals(res1.day, vm.updateTime.obj[0].day)) {
                                    run_time.ultimos.days.splice(index, 1);
                                }
                            });
                        } else {
                            if (angular.equals(run_time.ultimos.days.day, vm.updateTime.obj[0].day)) {
                                delete run_time['ultimos'];
                            }
                        }
                    }
                } else if (vm.updateTime.type === 'month') {
                    if (vm.updateTime.type2 === 'weekdays') {
                        if (angular.isArray(run_time.months)) {
                            angular.forEach(run_time.months, function (res) {
                                if (angular.equals(res.month, vm.updateTime.obj[0].month)) {
                                    if (angular.isArray(res.weekdays.days)) {
                                        angular.forEach(res.weekdays.days, function (res1, index) {
                                            if (angular.equals(res1.day, vm.updateTime.obj[0].day)) {
                                                res.weekdays.days.splice(index, 1);
                                            }
                                        });
                                    } else {
                                        if (angular.equals(res.weekdays.days.day, vm.updateTime.obj[0].day)) {
                                            delete res['weekdays']
                                        }
                                    }
                                }
                            });
                        }
                    } else if (vm.updateTime.type2 === 'monthdays') {

                        if (angular.isArray(run_time.months)) {
                            angular.forEach(run_time.months, function (res) {
                                if (angular.equals(res.month, vm.updateTime.obj[0].month)) {

                                    if (angular.isArray(res.monthdays.days)) {

                                        angular.forEach(res.monthdays.days, function (res1, index) {

                                            if (angular.equals(res1.day, vm.updateTime.obj[0].day)) {
                                                res.monthdays.days.splice(index, 1);
                                            }
                                        });
                                    } else {
                                        if (angular.equals(res.monthdays.days.day, vm.updateTime.obj[0].day)) {
                                            delete res.monthdays['days']
                                        }

                                    }
                                }
                            });
                        }
                    } else if (vm.updateTime.type2 === 'ultimos') {
                        if (angular.isArray(run_time.months)) {
                            angular.forEach(run_time.months, function (res) {
                                if (angular.equals(res.month, vm.updateTime.obj[0].month)) {
                                    if (angular.isArray(res.ultimos.days)) {
                                        angular.forEach(res.ultimos.days, function (res1, index) {
                                            if (angular.equals(res1.day, vm.updateTime.obj[0].day)) {
                                                res.ultimos.days.splice(index, 1);
                                            }
                                        });
                                    } else {
                                        if (angular.equals(res.ultimos.days.day, vm.updateTime.obj[0].day)) {
                                            delete res['ultimos']
                                        }
                                    }
                                }
                            });
                        }
                    } else if (vm.updateTime.type2 === 'weekday') {

                        if (angular.isArray(run_time.months)) {
                            angular.forEach(run_time.months, function (res) {
                                if (angular.equals(res.month, vm.updateTime.obj[0].month)) {
                                    if (angular.isArray(res.monthdays.weekdays)) {
                                        angular.forEach(res.monthdays.weekdays, function (res1, index) {
                                            if (angular.equals(res1.day, vm.updateTime.obj[0].day) && angular.equals(res1.which, vm.updateTime.obj[0].which)) {
                                                res.monthdays.weekdays.splice(index, 1);
                                            }
                                        });
                                    } else {
                                        if (angular.equals(res.monthdays.weekdays.day, vm.updateTime.obj[0].day) && angular.equals(res.monthdays.weekdays.which, vm.updateTime.obj[0].which)) {
                                            delete res.monthdays['weekdays']
                                        }
                                    }
                                }
                            });
                        }
                    }

                    if (run_time.months && angular.isArray(run_time.months)) {
                        angular.forEach(run_time.months, function (month, index) {
                            var flag = false;
                            if (!month.weekdays && (!month.monthdays || _.isEmpty(month.monthdays)) && !month.ultimos) {
                                flag = true;
                            }
                            if (flag) {
                                run_time.months.splice(index, 1);
                            }
                        });
                    }
                }
                if (run_time.monthdays && !run_time.monthdays.days && !run_time.monthdays.weekdays) {
                    delete run_time['monthdays'];
                }
            }

            if (data.frequency.period) {

                for (let i = 0; i < vm.periodList.length; i++) {
                    if (RuntimeService.checkPeriod(vm.periodList[i].period, data.frequency.period)) {
                        vm.periodList[i].period = angular.copy(data.period.period);
                    }
                }
            } else {
                if (vm.periodList.length > 0) {
                    let _temp = angular.copy(vm.periodList[0]);
                    _temp.period = data.period.period;
                    _temp.str = frequencyToString(_temp);
                    vm.periodList.push(_temp);

                } else {
                    let obj = {};
                    if (vm.updateTime.type2) {
                        obj.tab = vm.updateTime.type2 === 'weekdays' ? 'weekDays' : vm.updateTime.type2 === 'monthdays' ? 'monthDays' : vm.updateTime.type2 === 'weekday' ? 'specificWeekDays' : vm.updateTime.type2 === 'ultimos' ? 'monthDays' : 'specificDays';
                    } else {
                        obj.tab = vm.updateTime.type === 'weekdays' ? 'weekDays' : vm.updateTime.type === 'monthdays' ? 'monthDays' : vm.updateTime.type === 'weekday' ? 'specificWeekDays' : vm.updateTime.type === 'ultimos' ? 'monthDays' : 'specificDays';
                    }
                    if (vm.updateTime.type === 'ultimos' || vm.updateTime.type2 === 'ultimos') {
                        obj.isUltimos = 'ultimos';
                    }
                    obj.period = {};
                    if (data.period.period.singleStart) {
                        obj.frequency = 'singleStart';
                        obj.period.singleStart = data.period.period.singleStart;
                    } else if (data.period.period.absoluteRepeat) {
                        obj.frequency = 'absoluteRepeat';
                        obj.period.absoluteRepeat = data.period.period.absoluteRepeat;
                    } else if (data.period.period.repeat) {
                        obj.frequency = 'repeat';
                        obj.period.repeat = data.period.period.repeat;
                    }
                    if (data.period.period.begin) {
                        obj.period.begin = data.period.period.begin;
                    }
                    if (data.period.period.end) {
                        obj.period.end = data.period.period.end;
                    }
                    if (data.period.period.whenHoliday) {
                        obj.period.whenHoliday = data.period.period.whenHoliday;
                    }
                    if (obj.tab === 'weekDays') {
                        obj.days = vm.updateTime.obj[0].day.toString().split(' ').sort();
                    } else if (obj.tab === 'monthDays') {
                        if (obj.isUltimos === 'ultimos') {
                            obj.selectedMonthsU = vm.updateTime.obj[0].day.toString().split(' ').sort(RuntimeService.compareNumbers);
                        } else {
                            obj.selectedMonths = vm.updateTime.obj[0].day.toString().split(' ').sort(RuntimeService.compareNumbers);
                        }
                    } else if (obj.tab === 'specificWeekDays') {
                        obj.specificWeekDay = vm.updateTime.obj[0].day;
                        obj.which = vm.updateTime.obj[0].which;
                    } else if (obj.tab === 'specificDays') {
                        obj.date = new Date(vm.updateTime.obj[0].date);
                    }

                    if (vm.updateTime.obj[0].month) {
                        obj.months = vm.updateTime.obj[0].month.toString().split(' ').sort(RuntimeService.compareNumbers);
                    }
                    obj.str = frequencyToString(obj);
                    vm.periodList.push(obj);
                }
            }

            angular.forEach(vm.periodList, function (list) {
                vm.tempRunTime = RuntimeService.checkPeriodList(run_time, list, selectedMonths, selectedMonthsU);
            });
            vm.periodList = [];
            vm.run_time = run_time;
            delete vm.run_time['schedule'];

            if (vm.runTime1.dates && vm.runTime1.dates.date) {
                vm.run_time.dates = {};
                vm.run_time.dates.date = moment(vm.runTime1.dates.date).format('YYYY-MM-DD');
            }

            if (vm.runTime1.holidays) {
                vm.run_time.holidays = {};
                vm.run_time.holidays.days = [];
                vm.run_time.holidays.includes = [];
                if (vm.runTime1.holidays.weekdays) {
                    vm.run_time.holidays.weekdays = vm.runTime1.holidays.weekdays;
                }
                if (vm.calendarFiles.length > 0) {
                    angular.forEach(vm.calendarFiles, function (value) {
                        vm.run_time.holidays.includes.push({liveFile: value});
                    });
                }
                if (vm.holidayDates.length > 0) {
                    angular.forEach(vm.holidayDates, function (value) {
                        vm.run_time.holidays.days.push({date: moment(value).format('YYYY-MM-DD')});
                    });
                }

            }
            if (!_.isEmpty(vm.run_time.dates)) {
                if (!(vm.run_time.dates && (vm.run_time.dates.length > 0))) {
                    delete vm.run_time['date'];
                }
            } else {
                delete vm.run_time['date'];
            }
            if (!_.isEmpty(vm.run_time.weekdays)) {
                if (!(vm.run_time.weekdays.days && (vm.run_time.weekdays.days.length > 0 || vm.run_time.weekdays.days.day))) {
                    delete vm.run_time['weekdays'];
                }
            } else {
                delete vm.run_time['weekdays'];
            }
            if (!_.isEmpty(vm.run_time.monthdays)) {
                if (!(vm.run_time.monthdays.weekdays && vm.run_time.monthdays.weekdays.length > 0)) {
                    delete vm.run_time.monthdays['weekdays'];
                }
                if (!(vm.run_time.monthdays.days && (vm.run_time.monthdays.days.length > 0 || vm.run_time.monthdays.days.day))) {
                    if (!vm.run_time.monthdays.weekdays) {
                        delete vm.run_time['monthdays'];
                    } else {
                        if(vm.run_time.monthdays.days) {
                            if (vm.run_time.monthdays.days.length === 0 && vm.run_time.monthdays.weekdays.length === 0) {
                                delete vm.run_time['monthdays'];
                            } else if (vm.run_time.monthdays.days.length === 0) {
                                delete vm.run_time.monthdays['days'];
                            }
                        }
                    }
                }
            } else {
                delete vm.run_time['monthdays'];
            }

            if (!_.isEmpty(vm.run_time.ultimos)) {
                if (!(vm.run_time.ultimos.days && (vm.run_time.ultimos.days.length > 0 || vm.run_time.ultimos.days.day))) {
                    delete vm.run_time['ultimos'];
                }
            } else {
                delete vm.run_time['ultimos'];
            }

            if (!_.isEmpty(vm.run_time.months)) {
                if (!(vm.run_time.months.length > 0 || vm.run_time.months.month)) {
                    delete vm.run_time['months'];
                }
            } else {
                delete vm.run_time['months'];
            }

            if (!_.isEmpty(vm.run_time.holidays)) {
                if (!(vm.run_time.holidays.days && vm.run_time.holidays.days.length > 0)) {
                    delete vm.run_time.holidays['days'];
                }
                if (!(vm.run_time.holidays.includes && vm.run_time.holidays.includes.length > 0)) {
                    delete vm.run_time.holidays['includes'];
                }

                if (!(vm.run_time.holidays.weekdays && vm.run_time.holidays.weekdays.days && vm.run_time.holidays.weekdays.days.length > 0)) {
                    delete vm.run_time.holidays['weekdays'];
                }
            }
            if (_.isEmpty(vm.run_time.holidays)) {
                delete vm.run_time['holidays'];
            }

            if (vm.runTime1.timeZone) {
                vm.run_time.timeZone = vm.runTime1.timeZone;
            }
            if (vm.sch) {
                if (vm.sch.name) {
                    vm.run_time.name = vm.sch.name;
                } else {
                    if (vm.sch.substitute) {
                        vm.run_time.substitute = vm.sch.substitute;
                    }
                }
                if (vm.sch.validFrom) {
                    vm.run_time.validFrom = vm.sch.validFrom;
                }
                if (vm.sch.validTo) {
                    vm.run_time.validTo = vm.sch.validTo;
                }
                if (vm.sch.title) {
                    vm.run_time.title = vm.sch.title;
                }
            }

            if (vm.order) {
                vm.run_time = {run_time: vm.run_time};
            } else if (vm.schedule) {
                vm.run_time = {schedule: vm.run_time};
            }


            run_time = {};
            run_time.months = [];
            run_time.weekdays = {};
            run_time.weekdays.days = [];
            run_time.monthdays = {};
            run_time.monthdays.days = [];
            run_time.ultimos = {};
            run_time.ultimos.days = [];
            vm.tempRunTime = {};

            getXml2Json(angular.copy(vm.run_time));
        }

        vm.addNewPeriod = function () {
            $rootScope.$broadcast('update-period', {
                period: undefined,
                isOrderJob: (vm.order && vm.order.isOrderJob != undefined) ? vm.order.isOrderJob : null
            });

            $('#period-editor').modal('show');
        };

        function addPeriodInCalendar(data) {
            let obj = {};
            let _json = vm.jsonObj.json;
            let run_time = _json.run_time || _json.schedule;
            let isUpdate = false;
            if (data.frequency.period) {
                isUpdate = true;
                for (let i = 0; i < data.frequency.frequency.obj.length; i++) {
                    if (RuntimeService.checkPeriod(data.frequency.frequency.obj[i].period, data.frequency.period)) {
                        data.frequency.frequency.obj.splice(i, 1);
                        break;
                    }
                }
            }

            if (data.period) {
                obj.period = {};
                if (data.period.period.singleStart) {
                    obj.frequency = 'singleStart';
                    obj.period.singleStart = data.period.period.singleStart;
                } else if (data.period.period.absoluteRepeat) {
                    obj.frequency = 'absoluteRepeat';
                    obj.period.absoluteRepeat = data.period.period.absoluteRepeat;
                } else if (data.period.period.repeat) {
                    obj.frequency = 'repeat';
                    obj.period.repeat = data.period.period.repeat;
                }
                if (data.period.period.begin) {
                    obj.period.begin = data.period.period.begin;
                }
                if (data.period.period.end) {
                    obj.period.end = data.period.period.end;
                }
                if(data.period.period.whenHoliday) {
                    obj.period.whenHoliday = data.period.period.whenHoliday;
                }

            }

            if (data.frequency.frequency.obj && data.frequency.frequency.obj.length > 0) {
                let flag = false;
                angular.forEach(data.frequency.frequency.obj, function (value) {
                    if (angular.isArray(value.periods)) {
                        for (let m = 0; m < value.periods.length; m++) {
                            if (angular.equals(value.periods[m], obj.period)) {
                                flag = true;
                                break;
                            }
                        }
                    } else {
                        if (angular.equals(value.periods, obj.period)) {
                            flag = true;
                        }
                    }
                });
                if (flag) {
                    return;
                }
            }

            if (run_time.dates) {
                if (angular.isArray(run_time.dates)) {
                    angular.forEach(run_time.dates, function (value) {
                        if (value.calendar && value.calendar === data.frequency.frequency.calendar.path) {
                            if (value.periods) {
                                if (!angular.isArray(value.periods)) {
                                    let _temp = angular.copy(value.periods);
                                    value.periods = [];
                                    if (isUpdate && RuntimeService.checkPeriod(_temp, data.frequency.period)) {

                                    } else {
                                        value.periods.push(_temp);
                                    }
                                } else {
                                    for (let i = 0; i < value.periods.length; i++) {
                                        if (RuntimeService.checkPeriod(value.periods[i], data.frequency.period)) {
                                            value.periods.splice(i, 1);
                                            break;
                                        }
                                    }
                                }
                                let isExist = false;
                                for (let i = 0; i < value.periods.length; i++) {
                                    if (RuntimeService.checkPeriod(value.periods[i], obj.period)) {
                                        isExist = true;
                                        break;
                                    }
                                }
                                if (!isExist) {
                                    value.periods.push(obj.period);
                                }
                            } else {
                                value.periods = obj.period;
                            }
                        }
                    });
                }
            }
            resetPeriodObj(run_time);
        }

        vm.periodList = [];
        vm.addPeriod = function (form) {
            if(vm.runTime.period && form) {
                if (vm.runTime.frequency === 'singleStart') {
                    let flg = false;
                    if (vm.runTime.period.singleStart) {
                        if (/^\d{1,2}:\d{2}(:\d\d)?$/i.test(vm.runTime.period.singleStart)) {
                            form.startTime.$invalid = false;
                            flg = true;
                        }
                        if (vm.runTime.period.singleStart === '00:00' || vm.runTime.period.singleStart === '00:00:00') {
                            flg = false;
                        }
                    }
                    if (!flg) {
                        form.startTime.$invalid = true;
                        form.startTime.$dirty = true;
                        return;
                    }
                } else if (vm.runTime.frequency === 'repeat' || vm.runTime.frequency === 'absoluteRepeat') {
                    let flg = false;
                    if (vm.runTime.frequency === 'repeat') {
                        if (vm.runTime.period.repeat) {
                            if (/^\d{1,2}:\d{2}(:\d\d)?$/i.test(vm.runTime.period.repeat)) {
                                form.repeat.$invalid = false;
                                flg = true;
                            }
                            if (vm.runTime.period.repeat === '00:00' || vm.runTime.period.repeat === '00:00:00') {
                                flg = false;
                            }
                        }
                        if (!flg) {
                            form.repeat.$invalid = true;
                            form.repeat.$dirty = true;
                            return;
                        }
                    } else {
                        if (vm.runTime.period.absoluteRepeat) {
                            if (/^\d{1,2}:\d{2}(:\d\d)?$/i.test(vm.runTime.period.absoluteRepeat)) {
                                form.absolute.$invalid = false;
                                flg = true;
                            }
                            if (vm.runTime.period.absoluteRepeat === '00:00' || vm.runTime.period.absoluteRepeat === '00:00:00') {
                                flg = false;
                            }
                        }
                        if (!flg) {
                            form.absolute.$invalid = true;
                            form.absolute.$dirty = true;
                            return;
                        }
                    }
                }
                if (vm.runTime.frequency !== 'singleStart') {
                    if (vm.runTime.period.begin && /^\d{1,2}:\d{2}(:\d\d)?$/i.test(vm.runTime.period.begin)) {
                        form.begin.$invalid = false;
                    } else {
                        form.begin.$invalid = true;
                        form.begin.$dirty = true;
                        return;
                    }
                    if (vm.runTime.period.end && /^\d{1,2}:\d{2}(:\d\d)?$/i.test(vm.runTime.period.end)) {
                        form.end.$invalid = false;
                    } else {
                        form.end.$invalid = true;
                        form.end.$dirty = true;
                        return;
                    }
                }
            }
            if (vm.periodList.length > 0) {
                for (let i = 0; i < vm.periodList.length; i++) {
                    vm.runTime.str = frequencyToString(vm.runTime);
                    if (angular.equals(vm.periodList[i], vm.runTime)) {
                        return;
                    }
                }
            }

            if (!_.isEmpty(_tempPeriod) && vm.periodList.length > 0) {
                if (_tempPeriod.tab === "specificDays") {
                    if (vm.tempRunTime.date) {
                        angular.forEach(vm.tempRunTime.date, function (value) {
                            if (value.date && (angular.equals(value.date, moment(_tempPeriod.date).format('YYYY-MM-DD')))) {
                                if (angular.isArray(value.periods)) {
                                    angular.forEach(value.periods, function (val, index) {
                                        if (angular.equals(val, _tempPeriod.period)) {
                                            value.periods.splice(index, 1);
                                        }
                                    });
                                } else {
                                    if (angular.equals(value.periods, _tempPeriod.period)) {
                                        value.periods = undefined;
                                        value.date = undefined;
                                    }
                                }
                            }
                        });
                    }
                } else if (_tempPeriod.tab === "weekDays") {
                    if (_tempPeriod.months && _tempPeriod.months.length > 0) {
                        if (vm.tempRunTime.month && vm.tempRunTime.month.length > 0) {
                            for (let i = 0; i < vm.tempRunTime.month.length; i++) {
                                if (!_.isEmpty(vm.tempRunTime.month[i].weekdays)) {
                                    if (angular.equals(vm.tempRunTime.month[i].month, _tempPeriod.months)) {
                                        if (vm.tempRunTime.month[i].weekdays && vm.tempRunTime.month[i].weekdays.days) {
                                            if (vm.tempRunTime.month[i].weekdays.days.length > 1) {
                                                angular.forEach(vm.tempRunTime.month[i].weekdays.days, function (value) {
                                                    if (angular.equals(value.day, _tempPeriod.days)) {
                                                        if (angular.isArray(value.periods)) {
                                                            angular.forEach(value.periods, function (val, index) {
                                                                if (angular.equals(val, _tempPeriod.period)) {
                                                                    value.periods.splice(index, 1);
                                                                }
                                                            });
                                                        } else {
                                                            if (angular.equals(value.periods, _tempPeriod.period)) {
                                                                delete value.periods;
                                                                delete value.day;
                                                            }
                                                        }
                                                    }
                                                });
                                            } else {
                                                delete vm.tempRunTime.month[i]['weekdays'];
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        if (vm.tempRunTime.weekdays && vm.tempRunTime.weekdays.days) {
                            angular.forEach(vm.tempRunTime.weekdays.days, function (value) {
                                if (value.day && angular.equals(value.day, _tempPeriod.days)) {
                                    if (angular.isArray(value.periods)) {
                                        angular.forEach(value.periods, function (val, index) {
                                            if (angular.equals(val, _tempPeriod.period)) {
                                                value.periods.splice(index, 1);
                                            }
                                        });
                                    } else {
                                        if (angular.equals(value.periods, _tempPeriod.period)) {
                                            delete value.periods;
                                            delete value.day;
                                        }
                                    }
                                }
                            });
                        }
                    }

                } else if (_tempPeriod.tab === 'monthDays') {
                    if (_tempPeriod.isUltimos === 'months') {
                        if (_tempPeriod.months && _tempPeriod.months.length > 0) {
                            if (vm.tempRunTime.month && vm.tempRunTime.month.length > 0) {
                                for (let i = 0; i < vm.tempRunTime.month.length; i++) {
                                    if (!_.isEmpty(vm.tempRunTime.month[i].monthdays)) {
                                        if (angular.equals(vm.tempRunTime.month[i].month, _tempPeriod.months)) {
                                            if (vm.tempRunTime.month[i].monthdays && vm.tempRunTime.month[i].monthdays.days) {
                                                if (vm.tempRunTime.month[i].monthdays.days.length > 1) {
                                                    angular.forEach(vm.tempRunTime.month[i].monthdays.days, function (value) {
                                                        if (angular.equals(value.day, _tempPeriod.selectedMonths)) {
                                                            if (angular.isArray(value.periods)) {
                                                                angular.forEach(value.periods, function (val, index) {
                                                                    if (angular.equals(val, _tempPeriod.period)) {
                                                                        value.periods.splice(index, 1);
                                                                    }
                                                                });
                                                            } else {
                                                                if (angular.equals(value.periods, _tempPeriod.period)) {
                                                                    delete value.periods;
                                                                    delete value.day;
                                                                }
                                                            }
                                                        }
                                                    });
                                                } else {
                                                    delete vm.tempRunTime.month[i].monthdays['days'];
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        } else {
                            if (vm.tempRunTime.monthdays && vm.tempRunTime.monthdays.days) {
                                angular.forEach(vm.tempRunTime.monthdays.days, function (value) {
                                    if (value.day && angular.equals(value.day, _tempPeriod.selectedMonths)) {
                                        if (angular.isArray(value.periods)) {
                                            angular.forEach(value.periods, function (val, index) {
                                                if (angular.equals(val, _tempPeriod.period)) {
                                                    value.periods.splice(index, 1);
                                                }
                                            });
                                        } else {
                                            if (angular.equals(value.periods, _tempPeriod.period)) {
                                                delete value.periods;
                                                delete value.day;
                                            }
                                        }
                                    }
                                });
                            }
                        }
                    }
                    if (_tempPeriod.isUltimos === 'ultimos') {
                        if (_tempPeriod.months && _tempPeriod.months.length > 0) {
                            if (vm.tempRunTime.month && vm.tempRunTime.month.length > 0) {
                                for (let i = 0; i < vm.tempRunTime.month.length; i++) {
                                    if (!_.isEmpty(vm.tempRunTime.month[i].ultimos)) {
                                        if (angular.equals(vm.tempRunTime.month[i].month, _tempPeriod.months)) {
                                            if (vm.tempRunTime.month[i].ultimos && vm.tempRunTime.month[i].ultimos.days) {
                                                if (vm.tempRunTime.month[i].ultimos.days.length > 1) {
                                                    angular.forEach(vm.tempRunTime.month[i].ultimos.days, function (value) {
                                                        if (angular.equals(value.day, _tempPeriod.selectedMonthsU)) {
                                                            if (angular.isArray(value.periods)) {
                                                                angular.forEach(value.periods, function (val, index) {
                                                                    if (angular.equals(val, _tempPeriod.period)) {
                                                                        value.periods.splice(index, 1);
                                                                    }
                                                                });
                                                            } else {
                                                                if (angular.equals(value.periods, _tempPeriod.period)) {
                                                                    delete value.periods;
                                                                    delete value.day;
                                                                }
                                                            }
                                                        }
                                                    });
                                                } else {
                                                    delete vm.tempRunTime.month[i].ultimos['days'];
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        } else {
                            if (vm.tempRunTime.ultimos && vm.tempRunTime.ultimos.days) {
                                angular.forEach(vm.tempRunTime.ultimos.days, function (value) {
                                    if (value.day && angular.equals(value.day, _tempPeriod.selectedMonthsU)) {
                                        if (angular.isArray(value.periods)) {
                                            angular.forEach(value.periods, function (val, index) {
                                                if (angular.equals(val, _tempPeriod.period)) {
                                                    value.periods.splice(index, 1);
                                                }
                                            });
                                        } else {
                                            if (angular.equals(value.periods, _tempPeriod.period)) {
                                                delete value.periods;
                                                delete value.day;
                                            }
                                        }
                                    }
                                });
                            }
                        }
                    }

                } else if (_tempPeriod.tab === "specificWeekDays") {
                    if (_tempPeriod.months && _tempPeriod.months.length > 0) {
                        if (vm.tempRunTime.month && vm.tempRunTime.month.length > 0) {
                            for (let i = 0; i < vm.tempRunTime.month.length; i++) {
                                if (!_.isEmpty(vm.tempRunTime.month[i].weekdays)) {
                                    if (angular.equals(vm.tempRunTime.month[i].month, _tempPeriod.months)) {
                                        if (vm.tempRunTime.month[i].monthdays.weekdays && vm.tempRunTime.month[i].weekdays.days) {
                                            if (vm.tempRunTime.month[i].monthdays.weekdays.length > 1) {
                                                angular.forEach(vm.tempRunTime.month[i].monthdays.weekdays, function (value) {
                                                    if (angular.equals(value.day, _tempPeriod.specificWeekDay) && angular.equals(value.which, _tempPeriod.which)) {
                                                        if (angular.isArray(value.periods)) {
                                                            angular.forEach(value.periods, function (val, index) {
                                                                if (angular.equals(val, _tempPeriod.period)) {
                                                                    value.periods.splice(index, 1);
                                                                }
                                                            });
                                                        } else {
                                                            if (angular.equals(value.periods, _tempPeriod.period)) {
                                                                delete value.periods;
                                                                delete value.day;
                                                                delete value.which;
                                                            }
                                                        }
                                                    }
                                                });
                                            } else {
                                                delete vm.tempRunTime.month[i].monthdays['weekdays'];
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        if (vm.tempRunTime.monthdays && vm.tempRunTime.monthdays.weekdays) {
                            angular.forEach(vm.tempRunTime.monthdays.weekdays, function (value) {
                                if (value.day && (angular.equals(value.day, _tempPeriod.specificWeekDay) && angular.equals(value.which, _tempPeriod.which))) {
                                    if (angular.isArray(value.periods)) {
                                        angular.forEach(value.periods, function (val, index) {
                                            if (angular.equals(val, _tempPeriod.period)) {
                                                value.periods.splice(index, 1);
                                            }
                                        });
                                    } else {
                                        if (angular.equals(value.periods, _tempPeriod.period)) {
                                            delete value.periods;
                                            delete value.day;
                                            delete value.which;
                                        }
                                    }
                                }
                            });
                        }
                    }
                }
                run_time = angular.copy(vm.tempRunTime);

                for (let i = 0; i < vm.periodList.length; i++) {
                    if (angular.equals(vm.periodList[i], _tempPeriod)) {
                        vm.periodList.splice(i, 1);
                    }
                }
                _tempPeriod = {};
            }
            if (angular.isArray(vm.runTime.days)) {
                vm.runTime.days.sort();
            }
            if (angular.isArray(vm.runTime.months)) {
                vm.runTime.months.sort(RuntimeService.compareNumbers);
            }
            if (selectedMonths.length > 0) {
                vm.runTime.selectedMonths = angular.copy(selectedMonths);
                vm.runTime.selectedMonths.sort(RuntimeService.compareNumbers);
            }
            if (selectedMonthsU.length > 0) {
                vm.runTime.selectedMonthsU = angular.copy(selectedMonthsU);
                vm.runTime.selectedMonthsU.sort(RuntimeService.compareNumbers);
            }
            if (_.isEmpty(run_time.dates)) {
                run_time.dates = [];
            } else {
                if (!angular.isArray(run_time.dates)) {
                    let temp = angular.copy(run_time.dates);
                    run_time.dates = [];
                    if (temp.periods || temp._date)
                        run_time.dates.push(temp)
                } else {
                    if (run_time.dates)
                        angular.forEach(run_time.dates, function (value) {
                            if (!value.periods && !value.date)
                                run_time.dates = [];
                        });
                }
            }
            if (_.isEmpty(run_time.weekdays)) {
                run_time.weekdays = {};
                run_time.weekdays.days = [];
            } else {
                if (!angular.isArray(run_time.weekdays.days)) {
                    let temp = angular.copy(run_time.weekdays.days);
                    run_time.weekdays.days = [];
                    if (temp.periods || temp._day)
                        run_time.weekdays.days.push(temp)
                } else {
                    if (run_time.weekdays.days)
                        angular.forEach(run_time.weekdays.days, function (value) {
                            if (!value.periods && !value.day)
                                run_time.weekdays.days = [];
                        });
                }
            }
            if (_.isEmpty(run_time.monthdays)) {
                run_time.monthdays = {};
                run_time.monthdays.days = [];
                run_time.monthdays.weekdays = [];
            } else {
                let temp = angular.copy(run_time.monthdays);
                if (!angular.isArray(run_time.monthdays.days)) {
                    run_time.monthdays.days = [];
                    run_time.monthdays.weekdays = [];
                    if (temp && temp.day) {
                        run_time.monthdays.days.push(temp.day);
                    }

                    if (temp && temp.weekdays) {
                        if (angular.isArray(temp.weekdays)) {
                            angular.forEach(temp.weekdays, function (value) {
                                if (!angular.isArray(value)) {
                                    if (!value.periods && !value.day && !value.which) {
                                    } else {
                                        run_time.monthdays.weekdays.push(value);
                                    }
                                }
                            });
                        } else {
                            run_time.monthdays.weekdays.push(temp.weekdays);
                        }
                    }
                } else {
                    run_time.monthdays.weekdays = [];
                    if (run_time.monthdays.days)
                        angular.forEach(run_time.monthdays.days, function (value) {
                            if (!value.periods && !value.day) {
                                run_time.monthdays.days = [];
                            }
                        });
                    if (temp && temp.weekdays) {
                        if (angular.isArray(temp.weekdays)) {
                            angular.forEach(temp.weekdays, function (value) {
                                if (!angular.isArray(value)) {
                                    if (!value.periods && !value.day && !value.which) {

                                    } else {
                                        run_time.monthdays.weekdays.push(value);
                                    }
                                }
                            });

                        } else {
                            if (!temp.weekdays.periods && !temp.weekdays.day && !temp.weekdays.which)
                                run_time.monthdays.weekdays.push(temp.weekdays);
                        }
                    }
                }

            }
            if (_.isEmpty(run_time.ultimos)) {
                run_time.ultimos = {};
                run_time.ultimos.days = [];
            } else {
                if (!angular.isArray(run_time.ultimos.days)) {
                    let temp = angular.copy(run_time.ultimos.days);
                    run_time.ultimos.days = [];
                    if (temp.periods || temp._day)
                        run_time.ultimos.days.push(temp)
                } else {
                    if (run_time.ultimos.days)
                        angular.forEach(run_time.ultimos.days, function (value) {
                            if (!value.periods && !value.day) {
                                run_time.ultimos.days = [];
                            }
                        });
                }
            }
            if (_.isEmpty(run_time.months)) {
                run_time.months = [];
            } else {
                let temp = angular.copy(run_time.months);
                if (!angular.isArray(run_time.months)) {
                    run_time.months = [];
                    if (temp)
                        run_time.months.push(temp);
                } else {
                    angular.forEach(run_time.months, function (res) {
                        if (res.weekdays) {
                            if (!angular.isArray(res.weekdays.days)) {
                                let temp = angular.copy(res.weekdays.days);
                                res.weekdays.days = [];
                                if (temp.periods || temp.day)
                                    res.weekdays.days.push(temp);
                            } else {
                                if (res.weekdays.days)
                                    angular.forEach(res.weekdays.days, function (value) {
                                        if (!value.periods && !value.day)
                                            res.weekdays.days = [];
                                    });
                            }

                        } else if (res.monthdays) {
                            if (res.monthdays.weekday) {
                                if (!angular.isArray(res.monthdays.weekdays)) {
                                    let temp = angular.copy(res.monthdays.weekdays);
                                    res.monthdays.weekdays = [];
                                    if (temp.periods || temp.day)
                                        res.monthdays.weekdays.push(temp)
                                } else {
                                    if (res.monthdays.weekdays)
                                        angular.forEach(res.monthdays.weekdays, function (value) {
                                            if (!value.periods && !value.day)
                                                res.monthdays.weekdays = [];
                                        });
                                }
                            } else if(res.monthdays.days){
                                if (!angular.isArray(res.monthdays.days)) {
                                    let temp = angular.copy(res.monthdays.days);
                                    res.monthdays.days = [];
                                    if (temp.periods || temp.day)
                                        res.monthdays.days.push(temp)
                                } else {
                                    if (res.monthdays.days)
                                        angular.forEach(res.monthdays.days, function (value) {
                                            if (!value.periods && !value.day)
                                                res.monthdays.days = [];
                                        });
                                }
                            }
                        } else if (res.ultimos) {
                            if (!angular.isArray(res.ultimos.days)) {
                                let temp = angular.copy(res.ultimos.days);
                                res.ultimos.days = [];
                                if (temp.periods || temp.day)
                                    res.ultimos.days.push(temp)
                            } else {
                                if (res.ultimos.days)
                                    angular.forEach(res.ultimos.days, function (value) {
                                        if (!value.periods && !value.day)
                                            res.ultimos.days = [];
                                    });
                            }
                        }
                    });
                }
            }

            var isMonth = false;
            if (run_time.months && angular.isArray(run_time.months)) {
                for (let i = 0; i < run_time.months.length; i++) {
                    if (run_time.months[i].month && angular.equals(run_time.months[i].month, vm.runTime.months) || angular.equals(run_time.months[i].month.toString().split(' '), vm.runTime.months)) {
                        isMonth = true;
                        break;
                    }
                }
            }
            if (vm.runTime.tab === 'specificDays') {
                for(let t=0; t < vm.tempItems.length;t++) {
                    if (run_time.dates.length > 0) {
                        let _period = [];
                        angular.forEach(run_time.dates, function (value) {
                            if (value.date && vm.tempItems[t].date && (angular.equals(value.date, moment(vm.tempItems[t].date).format('YYYY-MM-DD')))) {
                                if (angular.isArray(value.periods)) {
                                    angular.forEach(value.periods, function (res) {
                                        if (res)
                                            _period.push(res);
                                    })
                                } else {
                                    if (value.periods)
                                        _period.push(value.periods);
                                }
                                if (vm.runTime.period && !_.isEmpty(vm.runTime.period)) {
                                    _period.push(vm.runTime.period);
                                }
                                value.periods = _period;
                            }
                        });
                        if (_period.length === 0) {
                            if (!angular.isArray(run_time.dates)) {
                                run_time.dates = [];
                            }
                            run_time.dates.push({
                                'date': moment(vm.tempItems[t].date).format('YYYY-MM-DD'),
                                'periods': [vm.runTime.period]
                            });
                        }
                    } else {
                        run_time.dates.push({
                            'date': moment(vm.tempItems[t].date).format('YYYY-MM-DD'),
                            'periods': [vm.runTime.period]
                        });
                    }
                }
            } else if (vm.runTime.tab === 'weekDays') {
                if (vm.runTime.months && vm.runTime.months.length > 0) {

                    if (run_time.months.length > 0) {
                        let flag = false;
                        angular.forEach(run_time.months, function (value) {
                            if (isMonth) {
                                if (value.weekdays && (angular.equals(value.month, vm.runTime.months) || angular.equals(value.month.toString().split(' '), vm.runTime.months))) {
                                    flag = true;
                                    let _period = [];
                                    if (angular.isArray(value.weekdays.days)) {
                                        angular.forEach(value.weekdays.days, function (value1) {
                                            if (value1.day && (angular.equals(value1.day, vm.runTime.days) || angular.equals(value1.day.toString().split(' '), vm.runTime.days))) {
                                                if (angular.isArray(value1.periods)) {
                                                    angular.forEach(value1.periods, function (res) {
                                                        if (res)
                                                            _period.push(res);
                                                    })
                                                } else {
                                                    if (value1.periods) {
                                                        _period.push(value1.periods);
                                                    }
                                                }
                                                _period.push(vm.runTime.period);
                                                value1.periods = _period;
                                            }
                                        });
                                    } else {
                                        if (angular.equals(value.weekdays.days.day, vm.runTime.days) || angular.equals(value.weekdays.days.day.toString().split(' '), vm.runTime.days)) {
                                            if (angular.isArray(value.weekdays.days.periods)) {
                                                angular.forEach(value.weekdays.days.periods, function (res) {
                                                    if (res)
                                                        _period.push(res);
                                                })
                                            } else {
                                                if (value.weekdays.days.periods)
                                                    _period.push(value.weekdays.days.periods);

                                            }
                                            _period.push(vm.runTime.period);
                                            value.weekdays.days.periods = _period;
                                        }
                                    }

                                    if (_period.length === 0) {
                                        if (value.weekdays.days && !_.isEmpty(value.weekdays.days)) {
                                            if (!angular.isArray(value.weekdays.days)) {
                                                let t = [];
                                                t.push(angular.copy(value.weekdays.days));
                                                value.weekdays.days = t;
                                            }
                                        } else {
                                            value.weekdays.days = [];
                                        }

                                        value.weekdays.days.push({
                                            'day': vm.runTime.days,
                                            'periods': [vm.runTime.period]
                                        });
                                    }
                                }
                            }
                        });
                        if (!flag) {
                            if (isMonth) {
                                for (let i = 0; i < run_time.months.length; i++) {
                                    if (run_time.months[i].month && angular.equals(run_time.months[i].month, vm.runTime.months) || angular.equals(run_time.months[i].month.toString().split(' '), vm.runTime.months)) {
                                        run_time.months[i].weekdays = {days: []};
                                        run_time.months[i].weekdays.days.push({
                                            'day': vm.runTime.days,
                                            'periods': [vm.runTime.period]
                                        });
                                        break;
                                    }
                                }
                            } else {
                                let x = {month: vm.runTime.months, weekdays: {days: []}};
                                x.weekdays.days.push({'day': vm.runTime.days, 'periods': [vm.runTime.period]});
                                run_time.months.push(x);
                            }
                        }
                    } else {
                        let x = {month: vm.runTime.months, weekdays: {days: []}};
                        x.weekdays.days.push({'day': vm.runTime.days, 'periods': [vm.runTime.period]});
                        run_time.months.push(x);
                    }
                } else {
                    if (run_time.weekdays.days.length > 0) {
                        let _period = [];
                        angular.forEach(run_time.weekdays.days, function (value) {
                            if (value.day && (angular.equals(value.day, vm.runTime.days) || angular.equals(value.day.toString().split(' '), vm.runTime.days))) {
                                if (angular.isArray(value.periods)) {
                                    angular.forEach(value.periods, function (res) {
                                        if (res)
                                            _period.push(res);
                                    })
                                } else {
                                    if (value.periods) {
                                        _period.push(value.periods);
                                    }
                                }
                                _period.push(vm.runTime.period);
                                value.periods = _period;
                            }
                        });
                        if (_period.length === 0) {
                            if (!angular.isArray(run_time.weekdays.days)) {
                                run_time.weekdays.days = [];
                            }
                            run_time.weekdays.days.push({'day': vm.runTime.days, 'periods': [vm.runTime.period]});
                        }
                    } else {
                        run_time.weekdays.days.push({'day': vm.runTime.days, 'periods': [vm.runTime.period]});
                    }
                }
            } else if (vm.runTime.tab === 'specificWeekDays') {
                if (vm.runTime.months && vm.runTime.months.length > 0) {
                    if (run_time.months.length > 0) {
                        let flag = false;
                        angular.forEach(run_time.months, function (value) {
                            if (isMonth) {
                                if (value.monthdays && value.monthdays.weekdays && (angular.equals(value.month, vm.runTime.months) || angular.equals(value.month.toString().split(' '), vm.runTime.months))) {

                                    flag = true;
                                    let _period = [];
                                    if (angular.isArray(value.monthdays.weekdays)) {
                                        angular.forEach(value.monthdays.weekdays, function (value1) {

                                            if (value1 && value1.day === vm.runTime.specificWeekDay && value1.which === vm.runTime.which) {
                                                if (angular.isArray(value1.periods)) {
                                                    angular.forEach(value1.periods, function (res) {
                                                        if (res)
                                                            _period.push(res);
                                                    })
                                                } else {
                                                    if (value1.periods) {
                                                        _period.push(value1.periods);
                                                    }
                                                }
                                                _period.push(vm.runTime.period);
                                                value1.periods = _period;

                                            }
                                        });
                                    } else {
                                        if (angular.equals(value.monthdays.weekdays.day, vm.runTime.specificWeekDay) && angular.equals(value.monthdays.weekdays.which, vm.runTime.which)) {

                                            if (angular.isArray(value.monthdays.weekdays.periods)) {
                                                angular.forEach(value.monthdays.weekdays.periods, function (res) {
                                                    if (res)
                                                        _period.push(res);
                                                })
                                            } else {
                                                if (value.monthdays.weekdays.periods)
                                                    _period.push(value.monthdays.weekdays.periods);
                                            }
                                            _period.push(vm.runTime.period);
                                            value.monthdays.weekdays.periods = _period;
                                        }
                                    }

                                    if (_period.length === 0) {
                                        if (value.monthdays.weekdays && !_.isEmpty(value.monthdays.weekdays)) {
                                            if (!angular.isArray(value.monthdays.weekdays)) {
                                                let t = [];
                                                t.push(angular.copy(value.monthdays.weekdays));
                                                value.monthdays.weekdays = t;
                                            }

                                        } else {
                                            value.monthdays.weekdays = [];
                                        }

                                        value.monthdays.weekdays.push({
                                            'day': vm.runTime.specificWeekDay,
                                            'which': vm.runTime.which,
                                            'periods': [vm.runTime.period]
                                        });
                                    }
                                }
                            }
                        });
                        if (!flag) {
                            if (isMonth) {
                                for (let i = 0; i < run_time.months.length; i++) {

                                    if (run_time.months[i].month && angular.equals(run_time.months[i].month, vm.runTime.months) || angular.equals(run_time.months[i].month.toString().split(' '), vm.runTime.months)) {
                                        if ((!run_time.months[i].monthdays)) {
                                            run_time.months[i].monthdays = {weekdays: []};
                                        } else {
                                            run_time.months[i].monthdays.weekdays = [];
                                        }
                                        run_time.months[i].monthdays.weekdays.push({
                                            'day': vm.runTime.specificWeekDay,
                                            'which': vm.runTime.which,
                                            'periods': [vm.runTime.period]
                                        });
                                        break;
                                    }
                                }

                            } else {
                                let x;
                                if (!run_time.months.monthdays)
                                    x = {month: vm.runTime.months, monthdays: {weekdays: []}};
                                else {
                                    x = {month: vm.runTime.months};
                                    x.monthdays.weekdays = [];
                                }

                                x.monthdays.weekdays.push({
                                    'day': vm.runTime.specificWeekDay,
                                    'which': vm.runTime.which,
                                    'periods': [vm.runTime.period]
                                });
                                run_time.months.push(x);
                            }

                        }
                    } else {
                        let x;
                        if (!run_time.months.monthdays)
                            x = {month: vm.runTime.months, monthdays: {weekdays: []}};
                        else {
                            x = {month: vm.runTime.months};
                            x.monthdays.weekdays = [];
                        }
                        x.monthdays.weekdays.push({
                            'day': vm.runTime.specificWeekDay,
                            'which': vm.runTime.which,
                            'periods': [vm.runTime.period]
                        });
                        run_time.months.push(x);
                    }
                } else {
                    if (run_time.monthdays) {
                        if (run_time.monthdays.weekdays.length > 0) {
                            let _period = [];
                            angular.forEach(run_time.monthdays.weekdays, function (value) {
                                if (value && value.day === vm.runTime.specificWeekDay && value.which === vm.runTime.which) {
                                    if (angular.isArray(value.periods)) {
                                        angular.forEach(value.periods, function (res) {
                                            if (res)
                                                _period.push(res);
                                        })
                                    } else {
                                        if (value.periods) {
                                            _period.push(value.periods);
                                        }
                                    }
                                    _period.push(vm.runTime.period);
                                    value.periods = _period;
                                }
                            });

                            if (_period.length === 0) {
                                if (!angular.isArray(run_time.monthdays.weekdays)) {
                                    run_time.monthdays.weekdays = [];
                                }
                                run_time.monthdays.weekdays.push({
                                    'day': vm.runTime.specificWeekDay,
                                    'which': vm.runTime.which,
                                    'periods': [vm.runTime.period]
                                });
                            }

                        } else {
                            run_time.monthdays.weekdays.push({
                                'day': vm.runTime.specificWeekDay,
                                'which': vm.runTime.which,
                                'periods': [vm.runTime.period]
                            });
                        }
                    }
                }
            } else if (vm.runTime.tab === 'monthDays') {

                if (selectedMonths.length > 0 || selectedMonthsU.length > 0) {
                    if (vm.runTime.isUltimos === 'months') {
                        if (vm.runTime.months && vm.runTime.months.length > 0) {
                            if (run_time.months.length > 0) {
                                let flag = false;
                                angular.forEach(run_time.months, function (value) {
                                    if (isMonth) {
                                        if (value.monthdays && value.monthdays.days && (angular.equals(value.month, vm.runTime.months) || angular.equals(value.month.toString().split(' '), vm.runTime.months))) {
                                            flag = true;
                                            let _period = [];
                                            if (angular.isArray(value.monthdays.days)) {
                                                angular.forEach(value.monthdays.days, function (value1) {
                                                    if (value1.day && (angular.equals(value1.day, selectedMonths) || angular.equals(value1.day.toString().split(' '), selectedMonths))) {
                                                        if (angular.isArray(value1.periods)) {
                                                            angular.forEach(value1.periods, function (res) {
                                                                if (res)
                                                                    _period.push(res);
                                                            })
                                                        } else {
                                                            if (value1.periods) {
                                                                _period.push(value1.periods);

                                                            }
                                                        }
                                                        _period.push(vm.runTime.period);
                                                        value1.periods = _period;
                                                    }
                                                });
                                            } else {
                                                if (angular.equals(value.monthdays.days.day, selectedMonths) || angular.equals(value.monthdays.days.day.toString().split(' '), selectedMonths)) {
                                                    if (angular.isArray(value.monthdays.days.periods)) {
                                                        angular.forEach(value.monthdays.days.periods, function (res) {
                                                            if (res)
                                                                period.push(res);
                                                        })
                                                    } else {
                                                        if (value.monthdays.days.periods)
                                                            period.push(value.monthdays.days.periods);
                                                    }
                                                    _period.push(vm.runTime.period);
                                                    value.monthdays.days.periods = _period;
                                                }
                                            }
                                            if (_period.length === 0) {
                                                if (value.monthdays.days && !_.isEmpty(value.monthdays.days)) {
                                                    if (!angular.isArray(value.monthdays.days)) {
                                                        let t = [];
                                                        t.push(angular.copy(value.monthdays.days));
                                                        value.monthdays.days = t;
                                                    }
                                                } else {
                                                    value.monthdays.days = [];
                                                }

                                                value.monthdays.days.push({
                                                    'day': angular.copy(selectedMonths),
                                                    'periods': [vm.runTime.period]
                                                });
                                            }
                                        }
                                    }
                                });
                                if (!flag) {
                                    if (isMonth) {
                                        for (let i = 0; i < run_time.months.length; i++) {
                                            if (run_time.months[i].month && angular.equals(run_time.months[i].month, vm.runTime.months) || angular.equals(run_time.months[i].month.toString().split(' '), vm.runTime.months)) {
                                                if ((!run_time.months[i].monthdays)) {
                                                    run_time.months[i].monthdays = {days: []};
                                                } else {
                                                    run_time.months[i].monthdays.days = [];
                                                }
                                                run_time.months[i].monthdays.days.push({
                                                    'day': angular.copy(selectedMonths),
                                                    'periods': [vm.runTime.period]
                                                });
                                                break;
                                            }
                                        }
                                    } else {

                                        let x;
                                        if (!run_time.months.monthdays)
                                            x = {month: vm.runTime.months, monthdays: {days: []}};
                                        else {
                                            x = {month: vm.runTime.months};
                                            x.monthdays.days = [];
                                        }
                                        x.monthdays.days.push({
                                            'day': angular.copy(selectedMonths),
                                            'periods': [vm.runTime.period]
                                        });
                                        run_time.months.push(x);
                                    }
                                }
                            } else {
                                let x;
                                if (!run_time.months.monthdays)
                                    x = {month: vm.runTime.months, monthdays: {days: []}};
                                else {
                                    x = {month: vm.runTime.months};
                                    x.monthdays.days = [];
                                }
                                x.monthdays.days.push({
                                    'day': angular.copy(selectedMonths),
                                    'periods': [vm.runTime.period]
                                });
                                run_time.months.push(x);
                            }
                        } else {
                            if (run_time.monthdays.days.length > 0) {
                                let _period = [];
                                angular.forEach(run_time.monthdays.days, function (value) {
                                    if (value.day && (angular.equals(value.day, selectedMonths) || angular.equals(value.day.toString().split(' '), selectedMonths))) {
                                        if (angular.isArray(value.periods)) {
                                            angular.forEach(value.periods, function (res) {
                                                if (res)
                                                    _period.push(res);

                                            })
                                        } else {
                                            if (value.periods) {
                                                _period.push(value.periods);
                                            }
                                        }
                                        _period.push(vm.runTime.period);
                                        value.periods = _period;
                                    }
                                });
                                if (_period.length === 0) {
                                    if (!angular.isArray(run_time.monthdays.days)) {
                                        run_time.monthdays.days = [];
                                    }
                                    run_time.monthdays.days.push({
                                        'day': angular.copy(selectedMonths),
                                        'periods': [vm.runTime.period]
                                    });
                                }
                            } else {
                                run_time.monthdays.days.push({
                                    'day': angular.copy(selectedMonths),
                                    'periods': [vm.runTime.period]
                                });
                            }
                        }
                    } else {
                        if (vm.runTime.months && vm.runTime.months.length > 0) {
                            if (run_time.months.length > 0) {
                                let flag = false;
                                angular.forEach(run_time.months, function (value) {
                                    if (isMonth) {
                                        if (value.ultimos && (angular.equals(value.month, vm.runTime.months) || angular.equals(value.month.toString().split(' '), vm.runTime.months))) {
                                            flag = true;
                                            let _period = [];
                                            if (angular.isArray(value.ultimos.days)) {
                                                angular.forEach(value.ultimos.days, function (value1) {
                                                    if (value1.day && (angular.equals(value1.day, selectedMonthsU) || angular.equals(value1.day.toString().split(' '), selectedMonthsU))) {
                                                        if (angular.isArray(value1.periods)) {
                                                            angular.forEach(value1.periods, function (res) {
                                                                if (res)
                                                                    _period.push(res);
                                                            })
                                                        } else {
                                                            if (value1.periods) {
                                                                _period.push(value1.periods);
                                                            }
                                                        }
                                                        _period.push(vm.runTime.period);
                                                        value1.periods = _period;
                                                    }
                                                });
                                            } else {
                                                if (angular.equals(value.ultimos.days.day, selectedMonthsU) || angular.equals(value.ultimos.days.day.toString().split(' '), selectedMonthsU)) {
                                                    if (angular.isArray(value.ultimos.days.periods)) {
                                                        angular.forEach(value.ultimos.days.periods, function (res) {
                                                            if (res)
                                                                _period.push(res);
                                                        })
                                                    } else {
                                                        if (value.ultimos.days.periods)
                                                            _period.push(value.ultimos.days.periods);
                                                    }
                                                    _period.push(vm.runTime.period);
                                                    value.ultimos.days.periods = _period;
                                                }
                                            }

                                            if (_period.length === 0) {
                                                if (value.ultimos.days && !_.isEmpty(value.ultimos.days)) {
                                                    if (!angular.isArray(value.ultimos.days)) {
                                                        let t = [];
                                                        t.push(angular.copy(value.ultimos.days));
                                                        value.ultimos.days = t;
                                                    }
                                                } else {
                                                    value.ultimos.days = [];
                                                }

                                                value.ultimos.days.push({
                                                    'day': angular.copy(selectedMonthsU),
                                                    'periods': [vm.runTime.period]
                                                });
                                            }
                                        }
                                    }
                                });
                                if (!flag) {
                                    if (isMonth) {
                                        for (let i = 0; i < run_time.months.length; i++) {

                                            if (run_time.months[i].month && angular.equals(run_time.months[i].month, vm.runTime.months) || angular.equals(run_time.months[i].month.toString().split(' '), vm.runTime.months)) {
                                                run_time.months[i].ultimos = {days: []};
                                                run_time.months[i].ultimos.days.push({
                                                    'day': angular.copy(selectedMonthsU),
                                                    'periods': [vm.runTime.period]
                                                });
                                                break;
                                            }
                                        }

                                    } else {
                                        let x = {month: vm.runTime.months, ultimos: {days: []}};
                                        x.ultimos.days.push({
                                            'day': angular.copy(selectedMonthsU),
                                            'periods': [vm.runTime.period]
                                        });
                                        run_time.months.push(x);
                                    }
                                }
                            } else {
                                let x = {month: vm.runTime.months, ultimos: {days: []}};
                                x.ultimos.days.push({
                                    'day': angular.copy(selectedMonthsU),
                                    'periods': [vm.runTime.period]
                                });
                                run_time.months.push(x);
                            }
                        } else {
                            if (run_time.ultimos.days.length > 0) {
                                let _period = [];
                                angular.forEach(run_time.ultimos.days, function (value) {
                                    if (value.day && (angular.equals(value.day, selectedMonthsU) || angular.equals(value.day.toString().split(' '), selectedMonthsU))) {
                                        if (angular.isArray(value.periods)) {
                                            angular.forEach(value.periods, function (res) {
                                                if (res)
                                                    _period.push(res);
                                            })
                                        } else {
                                            if (value.periods) {
                                                _period.push(value.periods);

                                            }
                                        }
                                        _period.push(vm.runTime.period);
                                        value.periods = _period;
                                    }
                                });

                                if (_period.length === 0) {
                                    if (!angular.isArray(run_time.ultimos.days)) {
                                        run_time.ultimos.days = [];
                                    }
                                    run_time.ultimos.days.push({
                                        'day': angular.copy(selectedMonthsU),
                                        'periods': [vm.runTime.period]
                                    });
                                }
                            } else {
                                run_time.ultimos.days.push({
                                    'day': angular.copy(selectedMonthsU),
                                    'periods': [vm.runTime.period]
                                });
                            }
                        }
                    }
                }

            }

            if(vm.tempItems.length > 0 && vm.runTime.tab === 'specificDays'){
                for(let t=0; t < vm.tempItems.length;t++) {
                    vm.runTime.date = vm.tempItems[t].date;
                    if (vm.periodList.length > 0) {
                        let flag1 = false;
                        for (let i = 0; i < vm.periodList.length; i++) {
                            vm.runTime.str = frequencyToString(vm.runTime);
                            flag1 = angular.equals(vm.periodList[i], vm.runTime);
                            if (flag1) {
                                break;
                            }
                        }
                        if (!flag1) {
                            vm.periodList.push(angular.copy(vm.runTime));
                            vm.tempRunTime = angular.copy(run_time);
                        }
                    } else {
                        vm.runTime.str = frequencyToString(vm.runTime);
                        vm.periodList.push(angular.copy(vm.runTime));
                        vm.tempRunTime = angular.copy(run_time);
                    }
                }
            }else {
                if (vm.periodList.length > 0) {
                    let flag1 = false;
                    for (let i = 0; i < vm.periodList.length; i++) {
                        vm.runTime.str = frequencyToString(vm.runTime);
                        flag1 = angular.equals(vm.periodList[i], vm.runTime);
                        if (flag1) {
                            break;
                        }
                    }
                    if (!flag1) {
                        vm.periodList.push(angular.copy(vm.runTime));
                        vm.tempRunTime = angular.copy(run_time);
                    }
                } else {
                    vm.runTime.str = frequencyToString(vm.runTime);
                    vm.periodList.push(angular.copy(vm.runTime));
                    vm.tempRunTime = angular.copy(run_time);
                }
            }

            var temp = angular.copy(vm.runTime);

            vm.runTime = {};
            vm.updateTime = {};
            vm.runTime.period = {};

            if (vm.order && vm.order.isOrderJob && vm.order.isOrderJob != 'no') {
                vm.runTime.frequency = 'time_slot';
                vm.runTime.period.begin = '00:00';
                vm.runTime.period.end = '24:00';
            } else {
                vm.runTime.frequency = 'singleStart';
            }
            if (vm.order && (vm.order.isOrderJob === false || vm.order.isOrderJob === 'no')) {
                vm.runTime.isStandaloneJob = 'yes';
            }
            vm.runTime.period.whenHoliday = 'suppress';
            vm.runTime.tab = temp.tab;
            vm.runTime.all = temp.all;
            vm.runTime.allMonth = temp.allMonth;
            vm.runTime.isUltimos = temp.isUltimos;
            if (temp.days)
                vm.runTime.days = temp.days;
            if (temp.selectedMonths)
                vm.runTime.selectedMonths = temp.selectedMonths;
            if (temp.selectedMonthsU)
                vm.runTime.selectedMonthsU = temp.selectedMonthsU;
            if (temp.months)
                vm.runTime.months = temp.months;
            if (temp.specificWeekDay)
                vm.runTime.specificWeekDay = temp.specificWeekDay;
            if (temp.which)
                vm.runTime.which = temp.which;
        };

        vm.deletePeriod = function (index) {
            vm.periodList.splice(index, 1);
        };
        vm.deletePeriodFromFrequency = function (data, index) {
            let json = vm.jsonObj.json;
            let _json = json.run_time || json.schedule;
            if (!_json) {
                return;
            }
            let period = data.obj[index].periods[0];
            if (period === '' || !period) {
                for (let i = 0; i < data.obj.length; i++) {
                    if (data.obj[i].periods) {
                        if (i > index) {
                            period = data.obj[i].periods;
                            break;
                        }
                    }
                }
            }
            if (!_.isEmpty(data.obj) && angular.isArray(data.obj)) {
                if (data.type === 'date') {
                    if (angular.isArray(_json.dates)) {
                        angular.forEach(_json.dates, function (val, index) {
                            if (val.date === data.obj[0].date) {
                                if (angular.isArray(val.periods)) {
                                    for (let i = 0; i < val.periods.length; i++) {
                                        if (val.periods[i] === period || RuntimeService.checkPeriod(val.periods[i], period)) {
                                            _json.dates[index].periods.splice(i, 1);
                                            break;
                                        }
                                    }
                                } else {
                                    if ((val.periods === period || RuntimeService.checkPeriod(val.periods, period))) {
                                        _json.dates.splice(index, 1);
                                    }
                                }
                            }
                        });
                    } else {
                        if (_json.dates.date === data.obj[0].date) {
                            if (angular.isArray(_json.dates.periods)) {
                                for (let i = 0; i < _json.dates.periods.length; i++) {
                                    if (_json.dates.periods[i] === period || RuntimeService.checkPeriod(_json.dates.periods[i], period)) {
                                        _json.dates.periods.splice(i, 1);
                                        break;
                                    }
                                }
                            } else {
                                if (_json.dates.periods === period || RuntimeService.checkPeriod(_json.dates.periods, period)) {
                                    delete _json.dates['periods'];
                                }
                            }
                        }
                    }
                } else if (data.type === 'calendar') {
                    if (angular.isArray(_json.dates)) {
                        angular.forEach(_json.dates, function (val, index) {
                            if (val.calendar === data.obj[0].calendar) {

                                if (angular.isArray(val.periods)) {
                                    for (let i = 0; i < val.periods.length; i++) {
                                        if (val.periods[i] === period || RuntimeService.checkPeriod(val.periods[i], period)) {
                                            _json.dates[index].periods.splice(i, 1);
                                            break;
                                        }
                                    }
                                } else {
                                    if ((val.periods === period || RuntimeService.checkPeriod(val.periods, period))) {
                                        delete val['periods'];
                                    }
                                }
                            }
                        });
                    } else {
                        if (_json.dates.calendar === data.obj[0].calendar) {
                            if (angular.isArray(_json.dates.periods)) {
                                for (let i = 0; i < _json.dates.periods.length; i++) {
                                    if (_json.dates.periods[i] === period || RuntimeService.checkPeriod(_json.dates.periods[i], period)) {
                                        _json.dates.periods.splice(i, 1);
                                        break;
                                    }
                                }
                            } else {
                                if (_json.dates.periods === period || RuntimeService.checkPeriod(_json.dates.periods, period)) {
                                    delete _json.dates['periods'];
                                }
                            }
                        }
                    }
                } else if (data.type === 'weekdays') {
                    if (angular.isArray(_json.weekdays.days)) {
                        angular.forEach(_json.weekdays.days, function (val, index) {

                            if (val.day === data.obj[0].day) {
                                if (angular.isArray(val.periods)) {
                                    for (let i = 0; i < val.periods.length; i++) {
                                        if (val.periods[i] === period || RuntimeService.checkPeriod(val.periods[i], period)) {
                                            _json.weekdays.days[index].periods.splice(i, 1);
                                            break;
                                        }
                                    }
                                } else {
                                    if (val.periods === period || RuntimeService.checkPeriod(val.periods, period)) {
                                        _json.weekdays.days.splice(index, 1);
                                    }
                                }
                            }
                        });
                    } else {
                        if (_json.weekdays.days.day === data.obj[0].day) {
                            if (angular.isArray(_json.weekdays.days.periods)) {
                                for (let i = 0; i < _json.weekdays.days.periods.length; i++) {
                                    if (_json.weekdays.days.periods[i] === period || RuntimeService.checkPeriod(_json.weekdays.days.periods[i], period)) {
                                        _json.weekdays.days.periods.splice(i, 1);
                                        break;
                                    }
                                }
                            } else {
                                if ((_json.weekdays.days.periods === period || RuntimeService.checkPeriod(_json.weekdays.days.periods, period))) {
                                    delete _json.weekdays.days ['periods'];
                                }
                            }
                        }
                    }
                } else if (data.type === 'monthdays') {
                    if (angular.isArray(_json.monthdays.days)) {
                        angular.forEach(_json.monthdays.days, function (val, index) {
                            if (val.day === data.obj[0].day) {
                                if (angular.isArray(val.periods)) {
                                    for (let i = 0; i < val.periods.length; i++) {
                                        if (val.periods[i] === period || RuntimeService.checkPeriod(val.periods[i], period)) {
                                            _json.monthdays.days[index].periods.splice(i, 1);
                                            break;
                                        }
                                    }
                                } else {
                                    if (val.periods === period || RuntimeService.checkPeriod(val.periods, period)) {
                                        _json.monthdays.days.splice(index, 1);
                                    }
                                }
                            }
                        });
                    } else {
                        if (_json.monthdays.days.day === data.obj[0].day) {
                            if (angular.isArray(_json.monthdays.days.periods)) {
                                for (let i = 0; i < _json.monthdays.days.periods.length; i++) {
                                    if (_json.monthdays.days.periods[i] === period || RuntimeService.checkPeriod(_json.monthdays.days.periods[i], period)) {
                                        _json.monthdays.days.periods.splice(i, 1);
                                        break;
                                    }
                                }
                            } else {
                                if ((_json.monthdays.days.periods === period || RuntimeService.checkPeriod(_json.monthdays.days.periods, period))) {
                                    delete _json.monthdays.days ['periods'];
                                }
                            }
                        }
                    }
                } else if (data.type === 'weekday') {
                    if (angular.isArray(_json.monthdays.weekdays)) {
                        angular.forEach(_json.monthdays.weekdays, function (val, index) {
                            if (val.day === data.obj[0].day && val.which === data.obj[0].which) {
                                if (angular.isArray(val.periods)) {
                                    for (let i = 0; i < val.periods.length; i++) {
                                        if (val.periods[i] === period || RuntimeService.checkPeriod(val.periods[i], period)) {
                                            _json.monthdays.weekdays[index].periods.splice(i, 1);
                                            break;
                                        }
                                    }
                                } else {
                                    if ((val.periods === period || RuntimeService.checkPeriod(val.periods, period))) {
                                        _json.monthdays.weekdays.splice(index, 1);
                                    }
                                }
                            }
                        });
                    } else {
                        if (_json.monthdays.weekdays.day === data.obj[0].day && _json.monthdays.weekdays.which === data.obj[0].which) {
                            if (angular.isArray(_json.monthdays.weekdays.periods)) {
                                for (let i = 0; i < _json.monthdays.weekdays.periods.length; i++) {
                                    if (_json.monthdays.weekdays.periods[i] === period || RuntimeService.checkPeriod(_json.monthdays.weekdays.periods[i], period)) {
                                        _json.monthdays.weekdays.periods.splice(i, 1);
                                        break;
                                    }
                                }
                            } else {
                                if (_json.monthdays.weekdays.periods === period || RuntimeService.checkPeriod(_json.monthdays.weekdays.periods, period)) {
                                    delete _json.monthdays.weekdays['periods'];
                                }
                            }
                        }
                    }
                } else if (data.type === 'ultimos') {
                    if (angular.isArray(_json.ultimos.days)) {
                        angular.forEach(_json.ultimos.days, function (val, index) {
                            if (val.day === data.obj[0].day) {
                                if (angular.isArray(val.periods)) {
                                    for (let i = 0; i < val.periods.length; i++) {
                                        if (val.periods[i] === period || RuntimeService.checkPeriod(val.periods[i], period)) {
                                            _json.ultimos.days[index].periods.splice(i, 1);
                                            break;
                                        }
                                    }
                                } else {
                                    if (val.periods === period || RuntimeService.checkPeriod(val.periods, period)) {
                                        _json.ultimos.days.splice(index, 1);
                                    }
                                }
                            }
                        });
                    } else {
                        if (_json.ultimos.days.day === data.obj[0].day) {
                            if (angular.isArray(_json.ultimos.days.periods)) {
                                for (let i = 0; i < _json.ultimos.days.periods.length; i++) {
                                    if (_json.ultimos.days.periods[i] === period || RuntimeService.checkPeriod(_json.ultimos.days.periods[i], period)) {
                                        _json.ultimos.days.periods.splice(i, 1);
                                        break;
                                    }
                                }
                            } else {
                                if ((_json.ultimos.days.periods === period || RuntimeService.checkPeriod(_json.ultimos.days.periods, period))) {
                                    delete _json.ultimos.days ['periods'];
                                }
                            }
                        }
                    }
                } else if (data.type === 'month') {
                    if (angular.isArray(_json.months)) {
                        angular.forEach(_json.months, function (val1) {
                            if (val1.month === data.obj[0].month) {
                                if (data.type2 === 'weekdays') {
                                    if (angular.isArray(val1.weekdays.days)) {
                                        angular.forEach(val1.weekdays.days, function (val, index) {
                                            if (val.day === data.obj[0].day) {
                                                if (angular.isArray(val.periods)) {
                                                    for (let i = 0; i < val.periods.length; i++) {
                                                        if (val.periods[i] === period || RuntimeService.checkPeriod(val.periods[i], period)) {
                                                            val1.weekdays.days[index].periods.splice(i, 1);
                                                            break;
                                                        }
                                                    }
                                                } else {
                                                    if (val.periods === period || RuntimeService.checkPeriod(val.periods, period)) {
                                                        val1.weekdays.days.splice(index, 1);
                                                    }
                                                }
                                            }
                                        });
                                    } else {
                                        if (val1.weekdays.days.day === data.obj[0].day) {
                                            if (angular.isArray(val1.weekdays.days.periods)) {
                                                angular.forEach(val1.weekdays.days.periods, function (x, i) {
                                                    if (x === period || RuntimeService.checkPeriod(x, period)) {
                                                        val1.weekdays.days.periods.splice(i, 1);

                                                    }
                                                });
                                            } else {
                                                if ((val1.weekdays.days.periods === period || RuntimeService.checkPeriod(val1.weekdays.days.periods, period))) {
                                                    delete val1.weekdays.days ['periods'];
                                                }
                                            }
                                        }
                                    }

                                } else if (data.type2 === 'ultimos') {
                                    if (angular.isArray(val1.ultimos.days)) {
                                        angular.forEach(val1.ultimos.days, function (val, index) {
                                            if (val.day === data.obj[0].day) {
                                                if (angular.isArray(val.periods)) {
                                                    for (let i = 0; i < val.periods.length; i++) {
                                                        if (val.periods[i] === period || RuntimeService.checkPeriod(val.periods[i], period)) {
                                                            val1.ultimos.days[index].periods.splice(i, 1);
                                                            break;
                                                        }
                                                    }
                                                } else {
                                                    if (val.periods === period || RuntimeService.checkPeriod(val.periods, period)) {
                                                        val1.ultimos.days.splice(index, 1);
                                                    }
                                                }
                                            }
                                        });
                                    } else {
                                        if (val1.ultimos.days.day === data.obj[0].day) {
                                            if (angular.isArray(val1.ultimos.days.periods)) {
                                                for (let i = 0; i < val1.ultimos.days.periods.length; i++) {
                                                    if (val1.ultimos.days.periods[i] === period || RuntimeService.checkPeriod(val1.ultimos.days.periods[i], period)) {
                                                        val1.ultimos.days.periods.splice(i, 1);
                                                        break;
                                                    }
                                                }
                                            } else {
                                                if ((val1.ultimos.days.periods === period || RuntimeService.checkPeriod(val1.ultimos.days.periods, period))) {
                                                    delete val1.ultimos.days ['periods'];
                                                }
                                            }
                                        }

                                    }
                                } else if (data.type2 === 'monthdays') {
                                    if (angular.isArray(val1.monthdays.days)) {
                                        angular.forEach(val1.monthdays.days, function (val, index) {
                                            if (val.day === data.obj[0].day) {
                                                if (angular.isArray(val.periods)) {
                                                    for (let i = 0; i < val.periods.length; i++) {
                                                        if (val.periods[i] === period || RuntimeService.checkPeriod(val.periods[i], period)) {
                                                            val1.monthdays.days[index].periods.splice(i, 1);
                                                            break;
                                                        }
                                                    }
                                                } else {
                                                    if (val.periods === period || RuntimeService.checkPeriod(val.periods, period)) {
                                                        val1.monthdays.days.splice(index, 1);
                                                    }
                                                }
                                            }
                                        });
                                    } else {
                                        if (val1.monthdays.days.day === data.obj[0].day) {
                                            if (angular.isArray(val1.monthdays.days.periods)) {
                                                for (let i = 0; i < val1.monthdays.days.periods.length; i++) {
                                                    if (val1.monthdays.days.periods[i] === period || RuntimeService.checkPeriod(val1.monthdays.days.periods[i], period)) {
                                                        val1.monthdays.days.periods.splice(i, 1);
                                                        break;
                                                    }
                                                }
                                            } else {
                                                if ((val1.monthdays.days.periods === period || RuntimeService.checkPeriod(val1.monthdays.days.periods, period))) {
                                                    delete val1.monthdays.days ['periods'];
                                                }
                                            }
                                        }
                                    }
                                } else if (data.type2 === 'weekday') {
                                    if (angular.isArray(val1.monthdays.weekdays)) {
                                        angular.forEach(val1.monthdays.weekdays, function (val, index) {
                                            if (val.day === data.obj[0].day && val.which === data.obj[0].which) {
                                                if (angular.isArray(val.periods)) {
                                                    for (let i = 0; i < val.periods.length; i++) {
                                                        if (val.periods[i] === period || RuntimeService.checkPeriod(val.periods[i], period)) {
                                                            val1.monthdays.weekdays[index].periods.splice(i, 1);
                                                            break;
                                                        }
                                                    }
                                                } else {
                                                    if (val.periods === period || RuntimeService.checkPeriod(val.periods, period)) {
                                                        val1.monthdays.weekdays.splice(index, 1);
                                                    }
                                                }
                                            }
                                        });
                                    } else {
                                        if (val1.monthdays.weekdays.day === data.obj[0].day && val1.monthdays.weekdays.which === data.obj[0].which) {
                                            if (angular.isArray(val1.monthdays.weekdays.periods)) {
                                                for (let i = 0; i < val1.monthdays.weekdays.periods.length; i++) {
                                                    if (val1.monthdays.weekdays.periods[i] === period || RuntimeService.checkPeriod(val1.monthdays.weekdays.periods[i], period)) {
                                                        val1.monthdays.weekdays.periods.splice(i, 1);
                                                        break;
                                                    }
                                                }
                                            } else {
                                                if ((val1.monthdays.weekdays.periods === period || RuntimeService.checkPeriod(val1.monthdays.weekdays.periods, period))) {
                                                    delete val1.monthdays.weekdays ['periods'];
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        })
                    }
                }
            }

            for (let i = 0; i < vm.runtimeList.length; i++) {
                if (vm.runtimeList[i] === data) {
                    vm.runtimeList.splice(i, 1);
                }
            }

            if (vm.order) {
                vm._jsonTemp = {run_time: _json};
            } else if (vm.schedule) {
                vm._jsonTemp = {schedule: _json};
            }

            getXml2Json(vm._jsonTemp);
        };

        var isDelete = false;
        vm.removePeriod = function (period, index) {
            isDelete = true;
            vm.periodList.splice(index, 1);
            if (vm.periodList.length === 0) {
                let temp = angular.copy(vm.runTime);
                vm.runTime = {};
                vm.runTime.period = {};
                if (vm.order && (vm.order.isOrderJob && vm.order.isOrderJob != 'no')) {
                    vm.runTime.frequency = 'time_slot';
                    vm.runTime.period.begin = '00:00';
                    vm.runTime.period.end = '24:00';
                } else {
                    vm.runTime.frequency = 'singleStart';
                    vm.runTime.period.singleStart = '00:00';
                }
                if (vm.order && (vm.order.isOrderJob == false || vm.order.isOrderJob == 'no')) {
                    vm.runTime.isStandaloneJob = 'yes';
                }
                vm.runTime.period.whenHoliday = 'suppress';
                vm.runTime.tab = temp.tab;
                vm.runTime.isUltimos = temp.isUltimos;
                vm.editor.isEnable = false;
                selectedMonths = [];
                selectedMonthsU = [];
            }

            if (period.tab === "specificDays") {
                if (vm.tempRunTime.dates) {
                    angular.forEach(vm.tempRunTime.dates, function (value) {
                        if (value.date && (angular.equals(value.date, moment(period.date).format('YYYY-MM-DD')))) {
                            if (angular.isArray(value.periods)) {
                                for (let i = 0; i < value.periods.length; i++) {
                                    if (angular.equals(value.periods[i], period.period)) {
                                        value.periods.splice(i, 1);
                                        break;
                                    }
                                }
                            } else {
                                if (angular.equals(value.periods, period.period)) {
                                    delete value.periods;
                                    delete value.date;
                                }
                            }
                        }
                    });
                }
                if (vm.tempRunTime.dates && vm.tempRunTime.dates.length > 0) {
                    let tempARR = [];
                    for (let i = 0; i < vm.tempRunTime.dates.length; i++) {
                        if (vm.tempRunTime.dates[i].date) {
                            tempARR.push(vm.tempRunTime.dates[i]);
                        }
                    }
                    vm.tempRunTime.dates = tempARR;
                }

            } else if (period.tab === "weekDays") {
                if (period.months && period.months.length > 0) {
                    if (vm.tempRunTime.month && vm.tempRunTime.month.length > 0) {
                        for (let i = 0; i < vm.tempRunTime.month.length; i++) {
                            if (!_.isEmpty(vm.tempRunTime.month[i].weekdays)) {
                                if (angular.equals(vm.tempRunTime.month[i].month, period.months)) {
                                    if (vm.tempRunTime.month[i].weekdays && vm.tempRunTime.month[i].weekdays.days) {
                                        if (vm.tempRunTime.month[i].weekdays.days.length > 1) {
                                            angular.forEach(vm.tempRunTime.month[i].weekdays.days, function (value) {
                                                if (angular.equals(value.day, period.days)) {
                                                    if (angular.isArray(value.periods)) {
                                                        for (let j = 0; j < value.periods.length; j++) {
                                                            if (angular.equals(value.periods[j], period.period)) {
                                                                value.periods.splice(j, 1);
                                                                break;
                                                            }
                                                        }
                                                    } else {

                                                        if (angular.equals(value.periods, period.period)) {
                                                            delete value.periods;
                                                            delete value.day;
                                                        }
                                                    }
                                                }
                                            });
                                        } else {
                                            delete vm.tempRunTime.month[i]['weekdays'];
                                        }
                                    }
                                }
                            }
                        }
                    }
                } else {
                    if (vm.tempRunTime.weekdays && vm.tempRunTime.weekdays.days) {
                        angular.forEach(vm.tempRunTime.weekdays.days, function (value) {
                            if (value.day && angular.equals(value.day, period.days)) {
                                if (angular.isArray(value.periods)) {
                                    if (value.periods.length > 1) {
                                        for (let i = 0; i < value.periods.length; i++) {
                                            if (angular.equals(value.periods[i], period.period)) {
                                                value.periods.splice(i, 1);
                                                break;
                                            }
                                        }
                                    } else {
                                        if (angular.equals(value.periods[0], period.period)) {
                                            vm.tempRunTime.weekday.day.splice(index, 1)
                                        }
                                    }
                                } else {
                                    if (angular.equals(value.periods, period.period)) {
                                        delete value.periods;
                                        delete value.day;
                                    }
                                }
                            }
                        });
                        if (vm.tempRunTime.weekdays.days && vm.tempRunTime.weekdays.days.length > 0) {
                            let tempARR = [];
                            for (let i = 0; i < vm.tempRunTime.weekdays.days.length; i++) {
                                if (vm.tempRunTime.weekdays.days[i].day) {
                                    tempARR.push(vm.tempRunTime.weekdays.days[i]);
                                }
                            }
                            vm.tempRunTime.weekdays.days = tempARR;
                        }
                    }
                }
            } else if (period.tab === 'monthDays') {
                if (period.isUltimos === 'months') {
                    if (period.months && period.months.length > 0) {
                        if (vm.tempRunTime.month && vm.tempRunTime.month.length > 0) {
                            for (let i = 0; i < vm.tempRunTime.month.length; i++) {
                                if (!_.isEmpty(vm.tempRunTime.month[i].monthdays)) {
                                    if (angular.equals(vm.tempRunTime.month[i].month, period.months)) {
                                        if (vm.tempRunTime.month[i].monthdays && vm.tempRunTime.month[i].monthdays.days) {
                                            if (vm.tempRunTime.month[i].monthdays.days.length > 1) {
                                                angular.forEach(vm.tempRunTime.month[i].monthdays.days, function (value) {
                                                    if (angular.equals(value.day, period.selectedMonths)) {
                                                        if (angular.isArray(value.periods)) {
                                                            for (let j = 0; j < value.periods.length; j++) {
                                                                if (angular.equals(value.periods[j], period.period)) {
                                                                    value.periods.splice(j, 1);
                                                                    break;
                                                                }
                                                            }
                                                        } else {

                                                            if (angular.equals(value.periods, period.period)) {
                                                                delete value.periods;
                                                                delete value.day;
                                                            }
                                                        }
                                                    }
                                                });
                                            } else {
                                                delete vm.tempRunTime.month[i].monthdays['days'];
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        if (vm.tempRunTime.monthdays && vm.tempRunTime.monthdays.days) {
                            angular.forEach(vm.tempRunTime.monthdays.days, function (value) {

                                if (value.day && angular.equals(value.day, period.selectedMonths)) {
                                    if (angular.isArray(value.periods)) {
                                        if (value.periods.length > 1) {
                                            for (let i = 0; i < value.periods.length; i++) {
                                                if (angular.equals(value.periods[i], period.period)) {
                                                    value.periods.splice(i, 1);
                                                    break;
                                                }
                                            }
                                        } else {
                                            if (angular.equals(value.periods[0], period.period)) {
                                                vm.tempRunTime.monthdays.days.splice(index, 1)
                                            }
                                        }
                                    } else {
                                        if (angular.equals(value.periods, period.period)) {
                                            delete value.periods;
                                            delete value.day;
                                        }
                                    }
                                }
                            });
                            if (vm.tempRunTime.monthdays.days && vm.tempRunTime.monthdays.days.length > 0) {
                                let tempARR = [];
                                for (let i = 0; i < vm.tempRunTime.monthdays.days.length; i++) {
                                    if (vm.tempRunTime.monthdays.days[i].day) {
                                        tempARR.push(vm.tempRunTime.monthdays.days[i]);
                                    }
                                }
                                vm.tempRunTime.monthdays.days = tempARR;
                            }
                        }
                    }
                } else {
                    if (period.months && period.months.length > 0) {
                        if (vm.tempRunTime.month && vm.tempRunTime.month.length > 0) {
                            for (let i = 0; i < vm.tempRunTime.month.length; i++) {
                                if (!_.isEmpty(vm.tempRunTime.month[i].ultimos)) {
                                    if (angular.equals(vm.tempRunTime.month[i].month, period.months)) {
                                        if (vm.tempRunTime.month[i].ultimos && vm.tempRunTime.month[i].ultimos.days) {
                                            if (vm.tempRunTime.month[i].ultimos.days.length > 1) {
                                                angular.forEach(vm.tempRunTime.month[i].ultimos.days, function (value) {
                                                    if (angular.equals(value.day, period.selectedMonthsU)) {
                                                        if (angular.isArray(value.periods)) {
                                                            for (let j = 0; j < value.periods.length; j++) {
                                                                if (angular.equals(value.periods[j], period.period)) {
                                                                    value.periods.splice(j, 1);
                                                                    break;
                                                                }
                                                            }
                                                        } else {

                                                            if (angular.equals(value.periods, period.period)) {
                                                                delete value.periods;
                                                                delete value.day;
                                                            }
                                                        }
                                                    }
                                                });
                                            } else {
                                                delete vm.tempRunTime.month[i].ultimos['days'];
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        if (vm.tempRunTime.ultimos && vm.tempRunTime.ultimos.days) {
                            angular.forEach(vm.tempRunTime.ultimos.days, function (value) {
                                if (value.day && angular.equals(value.day, period.selectedMonthsU)) {
                                    if (angular.isArray(value.periods)) {
                                        if (value.periods.length > 1) {
                                            for (let i = 0; i < value.periods.length; i++) {
                                                if (angular.equals(value.periods[i], period.period)) {
                                                    value.periods.splice(i, 1);
                                                    break;
                                                }
                                            }
                                        } else {
                                            if (angular.equals(value.periods[0], period.period)) {
                                                vm.tempRunTime.ultimos.days.splice(index, 1)
                                            }
                                        }
                                    } else {
                                        if (angular.equals(value.periods, period.period)) {
                                            delete value.periods;
                                            delete value.day;
                                        }
                                    }
                                }
                            });
                            if (vm.tempRunTime.ultimos.days && vm.tempRunTime.ultimos.days.length > 0) {
                                let tempARR = [];
                                for (let i = 0; i < vm.tempRunTime.ultimos.days.length; i++) {
                                    if (vm.tempRunTime.ultimos.days[i].day) {
                                        tempARR.push(vm.tempRunTime.ultimos.days[i]);
                                    }
                                }
                                vm.tempRunTime.ultimos.days = tempARR;
                            }
                        }
                    }
                }

            } else if (period.tab === "specificWeekDays") {
                if (period.months && period.months.length > 0) {
                    if (vm.tempRunTime.month && vm.tempRunTime.month.length > 0) {
                        for (let i = 0; i < vm.tempRunTime.month.length; i++) {
                            if (!_.isEmpty(vm.tempRunTime.month[i].monthdays.weekdays)) {
                                if (angular.equals(vm.tempRunTime.month[i].month, period.months)) {
                                    if (vm.tempRunTime.month[i].monthdays && vm.tempRunTime.month[i].monthdays.weekdays) {
                                        if (vm.tempRunTime.month[i].monthdays.weekdays.length > 1) {
                                            angular.forEach(vm.tempRunTime.month[i].monthdays.weekdays, function (value) {
                                                if (angular.equals(value.day, period.specificWeekDay) && angular.equals(value.which, period.which)) {
                                                    if (angular.isArray(value.periods)) {
                                                        for (let j = 0; j < value.periods.length; j++) {
                                                            if (angular.equals(value.periods[i], period.period)) {
                                                                value.periods.splice(i, 1);
                                                                break;
                                                            }
                                                        }
                                                    } else {

                                                        if (angular.equals(value.periods, period.period)) {
                                                            delete value.periods;
                                                            delete value.day;
                                                        }
                                                    }
                                                }
                                            });
                                        } else {
                                            delete vm.tempRunTime.month[i].monthdays['weekdays'];
                                        }
                                    }
                                }
                            }
                        }
                    }
                } else {
                    if (vm.tempRunTime.monthdays && vm.tempRunTime.monthdays.weekdays) {
                        angular.forEach(vm.tempRunTime.monthdays.weekdays, function (value, index) {
                            if (value.day && (angular.equals(value.day, period.specificWeekDay) && angular.equals(value.which, period.which))) {
                                if (angular.isArray(value.periods)) {
                                    if (value.periods.length > 1) {
                                        for (let i = 0; i < value.periods.length; i++) {
                                            if (angular.equals(value.periods[i], period.period)) {
                                                value.periods.splice(i, 1);
                                                break;
                                            }
                                        }
                                    } else {
                                        if (angular.equals(value.periods[0], period.period)) {
                                            vm.tempRunTime.monthdays.weekdays.splice(index, 1)
                                        }
                                    }
                                } else {
                                    if (angular.equals(value.periods, period.period)) {
                                        delete value.periods;
                                        delete value.day;
                                        delete value.which;
                                    }
                                }
                            }
                        });

                    }
                }
            }
            if (vm.tempRunTime.month && vm.tempRunTime.month.length > 0) {
                let tempARR = [];
                for (let i = 0; i < vm.tempRunTime.month.length; i++) {
                    if (vm.tempRunTime.month[i].weekdays || vm.tempRunTime.month[i].monthdays || vm.tempRunTime.month[i].ultimos) {
                        tempARR.push(vm.tempRunTime.month[i]);
                    }
                }
                vm.tempRunTime.month = tempARR;
            }
        };

        var _tempPeriod = {};
        vm.editPeriod = function (period) {
            let runTime = angular.copy(period);
            _tempPeriod = angular.copy(period);
            //vm.runTime = {};
            if (vm.editor.update) {
                $rootScope.$broadcast('update-period', {
                    period: period,
                    isOrderJob: (vm.order && vm.order.isOrderJob != undefined) ? vm.order.isOrderJob : null
                });
                $('#period-editor').modal('show');
            }

            if (runTime.period.singleStart) {
                runTime.frequency = 'singleStart';
            } else if (runTime.period.absoluteRepeat) {
                runTime.frequency = 'absoluteRepeat';
            } else if (runTime.period.repeat) {
                runTime.frequency = 'repeat';
            }
            promise3 = $timeout(function () {
                vm.runTime = runTime;
                if (runTime.tab === 'monthDays') {
                    if (runTime.isUltimos === 'months') {
                        selectedMonths = [];
                        angular.forEach(runTime.selectedMonths, function (val) {
                            vm.selectMonthDays(val);
                        });
                    } else {
                        selectedMonthsU = [];
                        angular.forEach(runTime.selectedMonthsU, function (val) {
                            vm.selectMonthDaysU(val);
                        });
                    }
                }
            }, 0);

        };

        vm.back = function () {
            vm.editor.hidePervious = false;
            vm.periodList = [];
            getXml2Json(angular.copy(vm.jsonObj.json));
        };

        vm.showHolidayTab = function () {
            vm.editor.showHolidayTab = true;
            vm.editor.showCalendarTab = false;
            vm._tempHoliday = angular.copy(vm.holidayDates);
            let year = vm.runTime.year ? vm.runTime.year : vm.calendarTitle;
            vm.runTime.year = parseInt(year);
        };

        vm.showScheduleTab = function () {
            $rootScope.$broadcast('schedule-editor', {
                sch: vm.sch,
                error: vm.error,
                _schedules: vm._schedules,
                from: vm.from,
                to: vm.to
            });
            $('#schedule-editor').modal('show');

        };

        vm.from = {};
        vm.to = {};
        vm.error = {};

        function saveSch() {
            try {
                let _json = vm.jsonObj.json;
                if (typeof _json.schedule !== 'object') _json.schedule = {};

                if (vm.sch.validFrom) {
                    _json.schedule.validFrom = vm.sch.validFrom;
                } else {
                    delete _json.schedule['validFrom'];
                }
                if (vm.sch.validTo) {
                    _json.schedule.validTo = vm.sch.validTo;
                } else {
                    delete _json.schedule['validTo'];
                }
                if (vm.sch.title) {
                    _json.schedule.title = vm.sch.title;
                } else {
                    delete _json.schedule['title'];
                }
                if (vm.sch.name) {
                    _json.schedule.name = vm.sch.name;
                } else {
                    if (vm.sch.substitute) {
                        _json.schedule.substitute = vm.sch.substitute;
                    } else {
                        delete _json.schedule['substitute'];
                    }
                }

                getXml2Json(_json);
            } catch (e) {
                console.error(e);
            }
        }

        if (vm.substituteObj) {
            vm.substituteObj.fromTime = '00:00';
            vm.substituteObj.toTime = '00:00';
        }
        vm.saveScheduleDetail = function (param, path) {
            if (path) {
                let name = angular.copy(vm.substituteObj.name);
                vm.substituteObj.name = name.substring(name.lastIndexOf('/') + 1);
                vm.substituteObj.folder = name.substring(0, name.lastIndexOf('/'));
            }
            vm.sch.validFrom = undefined;
            vm.sch.name = vm.substituteObj.name;
            if (!vm.substituteObj.fromTime) {
                vm.substituteObj.fromTime = '00:00';
            }
            if (!vm.substituteObj.toTime) {
                vm.substituteObj.toTime = '00:00';
            }
            vm.sch.title = vm.substituteObj.title;
            if (vm.substituteObj.fromTime && vm.substituteObj.fromDate) {
                let date = new Date(vm.substituteObj.fromDate);
                date.setHours(vm.substituteObj.fromTime.substring(0, 2));
                date.setMinutes(vm.substituteObj.fromTime.substring(3, 5));
                if (vm.substituteObj.fromTime.substring(6, 8)) {
                    date.setSeconds(vm.substituteObj.fromTime.substring(6, 8));
                } else {
                    date.setSeconds('00');
                }
                vm.sch.validFrom = moment(date).format('YYYY-MM-DD HH:mm:ss');
            }
            vm.sch.validTo = undefined;
            if (vm.substituteObj.toTime && vm.substituteObj.toDate) {
                let date = new Date(vm.substituteObj.toDate);
                date.setHours(vm.substituteObj.toTime.substring(0, 2));
                date.setMinutes(vm.substituteObj.toTime.substring(3, 5));
                if (vm.substituteObj.toTime.substring(6, 8)) {
                    date.setSeconds(vm.substituteObj.toTime.substring(6, 8));
                } else {
                    date.setSeconds('00');
                }
                vm.sch.validTo = moment(date).format('YYYY-MM-DD HH:mm:ss');
            }

            if (vm.sch.validFrom && vm.sch.validTo && vm.sch.name) {
                vm.error.validDate = moment(vm.sch.validFrom).diff(moment(vm.sch.validTo)) > 0;
                if (!vm.error.validDate) {
                    if (!vm.substituteObj.showText && !param) {
                        //vm.createNewRunTime();
                        vm.substituteObj.showText = true;
                    } else {
                        saveSch();
                    }
                }
            } else {
                if (!vm.substituteObj.showText && !param)
                    vm.error.validDate = true;
            }
        };

        vm.removeSubstitute = function (form2) {
            vm.substituteObj = {};
            vm.substituteObj.fromTime = '00:00';
            vm.substituteObj.toTime = '00:00';
            vm.saveScheduleDetail('check');
            if (form2) {
                form2.$setPristine();
                form2.$setUntouched();
            }
        };

        vm.holidayDates = [];
        vm.calendarFiles = [];
        vm.fileObj = {};
        vm.fileObj.holidayFile = 'liveFile';
        vm.addHolidayDate = function (date) {
            let flag = false;
            for (let j = 0; j < vm.holidayDates.length; j++) {
                if (angular.equals(vm.holidayDates[j], date)) {
                    flag = true;
                    break;
                }
            }
            if (!flag) {
                vm.holidayDates.push(date);
                vm._tempHoliday.push(date);
            }
        };

        vm.removeHolidayDate = function (index, date) {
            vm.holidayDates.splice(index, 1);
            vm._tempHoliday.splice(vm._tempHoliday.indexOf(date), 1);
            if (vm.runTime.nationalHoliday) {
                vm.runTime.nationalHoliday.splice(vm.runTime.nationalHoliday.indexOf(date), 1);
            }
        };

        vm.addCalendarFile = function (file) {
            if (vm.calendarFiles.indexOf(vm.fileObj.holidayFile + ': ' + file) === -1 && file) {
                if (vm.fileObj.holidayFile == 'liveFile') {
                    vm.calendarFiles.push('liveFile: ' + file);
                } else {
                    vm.calendarFiles.push('file: ' + file);
                }
            }
            vm.liveFile = '';
        };

        vm.removeCalendarFile = function (index) {
            vm.calendarFiles.splice(index, 1);
        };

        var _tempFrequency = {};
        vm.editRunTime = function (data) {
            vm.updateTime = angular.copy(data);
            _tempFrequency = angular.copy(data);
            vm.periodList = [];
            vm.editor.hidePervious = true;
            vm.editor.create = false;
            vm.editor.update = true;
            vm.str = vm.updateTime.frequency;
            vm.runTime = {};
            let runTime = {};
            selectedMonths = [];
            selectedMonthsU = [];
            if (!_.isEmpty(vm.updateTime.obj) && angular.isArray(vm.updateTime.obj)) {
                if (vm.updateTime.type === 'date') {
                    runTime.tab = 'specificDays';
                    runTime.date = new Date(vm.updateTime.obj[0].date);
                } else if (vm.updateTime.type === 'weekdays') {
                    runTime.tab = 'weekDays';
                    if (angular.isArray(vm.updateTime.obj[0].day)) {
                        runTime.days = vm.updateTime.obj[0].day;
                    } else {
                        runTime.days = vm.updateTime.obj[0].day.split(' ').sort();
                    }
                } else if (vm.updateTime.type === 'monthdays') {
                    runTime.tab = 'monthDays';
                    runTime.isUltimos = 'months';
                    angular.forEach(vm.updateTime.obj[0].day.split(' ').sort(RuntimeService.compareNumbers), function (val) {
                        vm.selectMonthDays(val);
                    });
                } else if (vm.updateTime.type === 'weekday') {
                    runTime.tab = 'specificWeekDays';
                    runTime.specificWeekDay = vm.updateTime.obj[0].day;
                    runTime.which = vm.updateTime.obj[0].which;
                    if (runTime.which) {
                        runTime.which = runTime.which.toString();
                    }
                } else if (vm.updateTime.type === 'ultimos') {
                    runTime.isUltimos = 'ultimos';
                    runTime.tab = 'monthDays';
                    angular.forEach(vm.updateTime.obj[0].day.split(' ').sort(RuntimeService.compareNumbers), function (val) {
                        vm.selectMonthDaysU(val);
                    });
                } else if (vm.updateTime.type === 'month') {
                    runTime.tab = 'weekDays';
                    runTime.months = vm.updateTime.obj[0].month.split(' ').sort(RuntimeService.compareNumbers);
                    vm.showMonthRange = true;
                    if (vm.updateTime.type2 === 'weekdays') {
                        runTime.tab = 'weekDays';
                        runTime.days = vm.updateTime.obj[0].day.split(' ').sort();
                    } else if (vm.updateTime.type2 === 'monthdays') {
                        runTime.tab = 'monthDays';
                        runTime.isUltimos = 'months';
                        angular.forEach(vm.updateTime.obj[0].day.split(' ').sort(RuntimeService.compareNumbers), function (val) {
                            vm.selectMonthDays(val);
                        });
                    } else if (vm.updateTime.type2 === 'weekday') {
                        runTime.tab = 'specificWeekDays';
                        runTime.specificWeekDay = vm.updateTime.obj[0].day;
                        runTime.which = vm.updateTime.obj[0].which;
                        if (runTime.which) {
                            runTime.which = runTime.which.toString();
                        }
                    } else if (vm.updateTime.type2 === 'ultimos') {
                        runTime.tab = 'monthDays';
                        runTime.isUltimos = 'ultimos';
                        angular.forEach(vm.updateTime.obj[0].day.split(' ').sort(RuntimeService.compareNumbers), function (val) {
                            vm.selectMonthDaysU(val);
                        });
                    }
                }

                runTime.period = {};
                angular.forEach(vm.updateTime.obj, function (value) {
                    var obj = {};
                    if (vm.updateTime.type2) {
                        obj.tab = vm.updateTime.type2 == 'weekdays' ? 'weekDays' : vm.updateTime.type2 == 'monthdays' ? 'monthDays' : vm.updateTime.type2 == 'weekday' ? 'specificWeekDays' : vm.updateTime.type2 == 'ultimos' ? 'monthDays' : 'specificDays';
                    } else {
                        obj.tab = vm.updateTime.type == 'weekdays' ? 'weekDays' : vm.updateTime.type == 'monthdays' ? 'monthDays' : vm.updateTime.type == 'weekday' ? 'specificWeekDays' : vm.updateTime.type == 'ultimos' ? 'monthDays' : 'specificDays';
                    }

                    if (vm.updateTime.type == 'ultimos' || vm.updateTime.type2 == 'ultimos') {
                        obj.isUltimos = 'ultimos';
                    } else {
                        obj.isUltimos = 'months';
                    }
                    obj.period = {};
                    if (value.periods && value.periods.length > 0) {
                        let p = angular.isArray(value.periods) ? value.periods[0] : value.periods;
                        if (p.singleStart) {
                            obj.frequency = 'singleStart';
                            obj.period.singleStart = p.singleStart;
                        } else if (p.absoluteRepeat) {
                            obj.frequency = 'absoluteRepeat';
                            obj.period.absoluteRepeat = p.absoluteRepeat;
                        } else if (p.repeat) {
                            obj.frequency = 'repeat';
                            obj.period.repeat = p.repeat;
                        }
                        if (p.begin) {
                            obj.period.begin = p.begin;
                        }
                        if (p.end) {
                            obj.period.end = p.end;
                        }
                        if(p.whenHoliday) {
                            obj.period.whenHoliday = p.whenHoliday;
                        }
                    }


                    if (obj.tab == 'weekDays') {
                        obj.days = value.day.toString().split(' ').sort();
                    } else if (obj.tab == 'monthDays') {
                        if (obj.isUltimos == 'months') {
                            obj.selectedMonths = value.day.toString().split(' ').sort(RuntimeService.compareNumbers);
                        } else
                            obj.selectedMonthsU = value.day.toString().split(' ').sort(RuntimeService.compareNumbers);
                    } else if (obj.tab == 'specificWeekDays') {
                        obj.specificWeekDay = value.day;
                        obj.which = value.which;
                        if (obj.which) {
                            obj.which = obj.which.toString();
                        }
                    } else if (obj.tab == 'specificDays') {
                        obj.dates = new Date(value.date);
                    }
                    if (value.month) {
                        obj.months = value.month.toString().split(' ').sort(RuntimeService.compareNumbers);
                    }
                    obj.str = frequencyToString(obj);
                    vm.periodList.push(obj);
                })
            }
            if (!_.isEmpty(_tempFrequency)) {
                if (_tempFrequency.type == 'date') {
                    if (angular.isArray(run_time.dates)) {
                        angular.forEach(run_time.dates, function (res1, index) {
                            if (angular.equals(res1.date, _tempFrequency.obj[0].date)) {
                                run_time.dates.splice(index, 1);
                            }
                        });
                    } else {
                        if (angular.equals(run_time.dates.date, _tempFrequency.obj[0].date)) {
                            delete run_time['date'];
                        }

                    }
                } else if (_tempFrequency.type == 'weekdays') {
                    if (run_time.weekdays) {
                        if (angular.isArray(run_time.weekdays.days)) {
                            angular.forEach(run_time.weekdays.days, function (res1, index) {
                                if (angular.equals(res1.day, _tempFrequency.obj[0].day)) {
                                    run_time.weekdays.days.splice(index, 1);
                                }
                            });
                        } else {
                            if (angular.equals(run_time.weekdays.days.day, _tempFrequency.obj[0].day)) {
                                delete run_time['weekdays'];
                            }

                        }
                    }
                } else if (_tempFrequency.type == 'monthdays') {
                    if (run_time.monthdays) {
                        if (angular.isArray(run_time.monthdays.days)) {
                            angular.forEach(run_time.monthdays.days, function (res1, index) {
                                if (angular.equals(res1.day, _tempFrequency.obj[0].day)) {
                                    run_time.monthdays.days.splice(index, 1);
                                }
                            });
                        } else {
                            if (angular.equals(run_time.monthdays.days.day, _tempFrequency.obj[0].day)) {
                                delete run_time.monthdays['days'];
                            }
                        }
                    }

                } else if (_tempFrequency.type == 'weekday') {
                    if (run_time.monthdays) {
                        if (run_time.monthdays.weekdays && run_time.monthdays.weekdays.length > 0) {
                            angular.forEach(run_time.monthdays.weekdays, function (res1) {
                                if (!angular.isArray(res1)) {
                                    if (angular.equals(res1.which, _tempFrequency.obj[0].which) && angular.equals(res1.day, _tempFrequency.obj[0].day)) {
                                        delete run_time.monthdays['weekdays'];
                                    }
                                }
                            });
                        }
                    }
                } else if (_tempFrequency.type == 'ultimos') {
                    if (run_time.ultimos) {
                        if (angular.isArray(run_time.ultimos.days)) {
                            angular.forEach(run_time.ultimos.days, function (res1, index) {
                                if (angular.equals(res1.day, _tempFrequency.obj[0].day)) {
                                    run_time.ultimos.days.splice(index, 1);
                                }
                            });
                        } else {
                            if (angular.equals(run_time.ultimos.days.day, _tempFrequency.obj[0].day)) {
                                delete run_time['ultimos'];
                            }
                        }
                    }
                } else if (_tempFrequency.type == 'month') {
                    if (_tempFrequency.type2 == 'weekdays') {
                        if (angular.isArray(run_time.months)) {
                            angular.forEach(run_time.months, function (res) {
                                if (angular.equals(res.month, _tempFrequency.obj[0].month)) {
                                    if (res.weekdays) {
                                        if (angular.isArray(res.weekdays.days)) {
                                            angular.forEach(res.weekdays.days, function (res1, index) {
                                                if (angular.equals(res1.day, _tempFrequency.obj[0].day)) {
                                                    res.weekdays.days.splice(index, 1);
                                                }
                                            });
                                        } else {
                                            if (angular.equals(res.weekdays.days.day, _tempFrequency.obj[0].day)) {
                                                delete res['weekdays']
                                            }
                                        }
                                    }
                                }
                            });
                        }
                    } else if (_tempFrequency.type2 === 'monthdays') {
                        if (angular.isArray(run_time.months)) {
                            angular.forEach(run_time.months, function (res, i) {
                                if (angular.equals(res.month, _tempFrequency.obj[0].month)) {
                                    if (res.monthdays) {
                                        if (angular.isArray(res.monthdays.days)) {
                                            angular.forEach(res.monthdays.days, function (res1, index) {
                                                if (angular.equals(res1.day, _tempFrequency.obj[0].day)) {
                                                    res.monthdays.days.splice(index, 1);
                                                }
                                            });
                                        } else {
                                            if (angular.equals(res.monthdays.days.day, _tempFrequency.obj[0].day)) {
                                                delete res.monthdays['days'];
                                            }
                                        }
                                    }
                                }
                            });
                        }
                    } else if (_tempFrequency.type2 === 'weekday') {
                        if (angular.isArray(run_time.months)) {
                            angular.forEach(run_time.months, function (res) {
                                if (angular.equals(res.month, _tempFrequency.obj[0].month)) {
                                    if (res.monthdays) {
                                        if (angular.isArray(res.monthdays.weekdays)) {
                                            angular.forEach(res.monthdays.weekdays, function (res1, index) {
                                                if (angular.equals(res1.day, _tempFrequency.obj[0].day) && angular.equals(res1.which, _tempFrequency.obj[0].which)) {
                                                    res.monthdays.weekdays.splice(index, 1);
                                                }
                                            });
                                        } else {
                                            if (angular.equals(res.monthdays.weekdays.days, _tempFrequency.obj[0].day) && angular.equals(res.monthdays.weekdays.which, _tempFrequency.obj[0].which)) {
                                                delete res.monthdays['weekdays'];
                                            }
                                        }
                                    }
                                }
                            });
                        }
                    } else if (_tempFrequency.type2 === 'ultimos') {
                        if (angular.isArray(run_time.months)) {
                            angular.forEach(run_time.months, function (res) {
                                if (angular.equals(res.month, _tempFrequency.obj[0].month)) {
                                    if (res.ultimos) {
                                        if (angular.isArray(res.ultimos.days)) {
                                            angular.forEach(res.ultimos.days, function (res1, index) {
                                                if (angular.equals(res1.day, _tempFrequency.obj[0].day)) {
                                                    res.ultimos.days.splice(index, 1);
                                                }
                                            });
                                        } else {
                                            if (angular.equals(res.ultimos.days.day, _tempFrequency.obj[0].day)) {
                                                delete res['ultimos']
                                            }
                                        }
                                    }
                                }
                            });
                        }
                    }
                    if (run_time.months && angular.isArray(run_time.months)) {
                        angular.forEach(run_time.months, function (month, index) {
                            let flag = false;
                            if (!month.weekdays && (!month.monthdays || _.isEmpty(month.monthdays)) && !month.ultimos) {
                                flag = true;
                            }
                            if (flag) {
                                run_time.months.splice(index, 1);
                            }
                        });
                    }

                }
                if (run_time.monthdays && !run_time.monthdays.days && !run_time.monthdays.weekdays) {
                    delete run_time['monthdays'];
                }
            }

            promise1 = $timeout(function () {
                vm.runTime = runTime;
                if (data.type === 'date') {
                    initSpecificDayCalendar();
                }
            }, 0);

        };

        vm.deleteRunTime = function (data) {
            let json = vm.jsonObj.json;
            let _json = json.run_time || json.schedule;
            if (!_json) {
                return;
            }
            if (!_.isEmpty(data.obj) && angular.isArray(data.obj)) {
                if (data.type == 'date') {
                    if (angular.isArray(_json.dates)) {
                        angular.forEach(_json.dates, function (val, index) {
                            if (val.date == data.obj[0].date) {
                                _json.dates.splice(index, 1);
                            }
                        });
                    } else {
                        if (_json.dates.date == data.obj[0].date) {
                            delete _json['dates'];
                        }
                    }
                } else if (data.type == 'weekdays') {
                    if (angular.isArray(_json.weekdays.days)) {
                        angular.forEach(_json.weekdays.days, function (val, index) {
                            if (val.day == data.obj[0].day) {
                                _json.weekdays.days.splice(index, 1);
                            }
                        });
                    } else {
                        if (_json.weekdays.days.day == data.obj[0].day) {
                            delete _json ['weekdays'];
                        }
                    }
                } else if (data.type == 'monthdays') {
                    if (angular.isArray(_json.monthdays.days)) {
                        angular.forEach(_json.monthdays.days, function (val, index) {
                            if (val.day == data.obj[0].day) {
                                _json.monthdays.days.splice(index, 1);
                            }
                        });
                    } else {
                        if (_json.monthdays.days.day == data.obj[0].day) {
                            delete _json.monthdays ['days'];
                        }
                    }
                } else if (data.type == 'weekday') {
                    if (angular.isArray(_json.monthdays.weekdays)) {
                        angular.forEach(_json.monthdays.weekdays, function (val, index) {
                            if (val.day == data.obj[0].day && val.which == data.obj[0].which) {
                                _json.monthdays.weekdays.splice(index, 1);
                            }
                        });
                    } else {
                        if (_json.monthdays.weekdays.day == data.obj[0].day && _json.monthdays.weekdays.which == data.obj[0].which) {
                            delete _json.monthdays['weekdays'];
                        }
                    }
                } else if (data.type == 'ultimos') {
                    if (angular.isArray(_json.ultimos.days)) {
                        angular.forEach(_json.ultimos.days, function (val, index) {
                            if (val.day == data.obj[0].day) {
                                _json.ultimos.days.splice(index, 1);
                            }
                        });
                    } else {

                        if (_json.ultimos.days.day == data.obj[0].day) {
                            delete _json ['ultimos'];
                        }
                    }
                } else if (data.type == 'month') {
                    if (angular.isArray(_json.months)) {
                        angular.forEach(_json.months, function (val1) {
                            if (val1.month == data.obj[0].month) {
                                if (data.type2 == 'weekdays') {
                                    if (angular.isArray(val1.weekdays.days)) {
                                        angular.forEach(val1.weekdays.days, function (val, index) {
                                            if (val.day == data.obj[0].day) {
                                                val1.weekdays.days.splice(index, 1);
                                            }
                                        });
                                        if (val1.weekdays.days.length === 0) {
                                            delete val1.weekdays ['days'];
                                        }
                                    }
                                    if (_.isEmpty(val1.weekdays)) {
                                        delete val1 ['weekdays'];
                                    }
                                } else if (data.type2 == 'monthdays') {
                                    if (angular.isArray(val1.monthdays.days)) {
                                        angular.forEach(val1.monthdays.days, function (val, index) {
                                            if (val.day == data.obj[0].day) {
                                                val1.monthdays.days.splice(index, 1);
                                            }
                                        });
                                        if (val1.monthdays.days.length === 0) {
                                            delete val1.monthdays ['days'];
                                        }
                                    }
                                } else if (data.type2 == 'weekday') {
                                    if (angular.isArray(val1.monthdays.weekdays)) {
                                        angular.forEach(val1.monthdays.weekdays, function (val, index) {
                                            if (val.day == data.obj[0].day && val.which == data.obj[0].which) {
                                                val1.monthdays.weekdays.splice(index, 1);
                                            }
                                        });
                                        if (val1.monthdays.weekdays.length === 0) {
                                            delete val1.monthdays ['weekdays'];
                                        }
                                    }

                                } else if (data.type2 == 'ultimos') {
                                    if (angular.isArray(val1.ultimos.days)) {
                                        angular.forEach(val1.ultimos.days, function (val, index) {
                                            if (val.day == data.obj[0].day) {
                                                val1.ultimos.days.splice(index, 1);
                                            }
                                        });
                                        if (val1.ultimos.days.length === 0) {
                                            delete val1.ultimos ['days'];
                                        }
                                    }
                                }
                                if (_.isEmpty(val1.monthdays)) {
                                    delete val1 ['monthdays'];
                                }
                                if (_.isEmpty(val1.ultimos)) {
                                    delete val1 ['ultimos'];
                                }

                                if (val1.ultimos || val1.monthdays || val1.weekdays) {

                                } else {
                                    delete val1['month']
                                }
                            }
                        })
                    }

                    if (_json.months && angular.isArray(_json.months)) {
                        angular.forEach(_json.months, function (month, index) {
                            let flag = false;
                            if (!month.weekdays && (!month.monthdays || _.isEmpty(month.monthdays)) && !month.ultimos) {
                                flag = true;
                            }
                            if (flag) {
                                _json.months.splice(index, 1);
                            }
                        });
                    }

                    if (_json.months && !angular.isArray(_json.months)) {
                        if ((!_json.months.monthdays || _.isEmpty(_json.months.monthdays)) && (!_json.months.weekdays || _.isEmpty(_json.months.weekdays)) && (!_json.months.ultimos || _.isEmpty(_json.months.ultimos))) {
                            delete _json ['months'];
                        }
                    }
                }

                if (_json.monthdays && !_json.monthdays.weekdays && !_json.monthdays.days) {
                    delete _json ['monthdays'];
                }
            }

            for (let i = 0; i < vm.runtimeList.length; i++) {
                if (vm.runtimeList[i] == data) {
                    vm.runtimeList.splice(i, 1);
                    break;
                }
            }

            if (vm.order) {
                vm._xmlTemp = {run_time: _json};
            } else if (vm.schedule) {
                vm._xmlTemp = {schedule: _json};
            }
            getXml2Json(vm._xmlTemp);
        };

        vm.removeTimeZone = function () {
            vm.runTime1.timeZone = '';
            getXml2Json(angular.copy(vm.jsonObj.json), true);
        };

        vm.createNewRunTime = function () {
            vm.editor.hidePervious = true;
            vm.editor.create = true;
            vm.editor.update = false;
            vm.periodList = [];
            selectedMonths = [];
            selectedMonthsU = [];
            vm.runTime = {};
            vm.runTime.period = {};
            vm.runTime.period.whenHoliday = 'suppress';
            vm.runTime.tab = 'weekDays';
            vm.runTime.isUltimos = 'months';

            if (vm.order && (vm.order.isOrderJob && vm.order.isOrderJob != 'no')) {
                vm.runTime.frequency = 'time_slot';
                vm.runTime.period.begin = '00:00';
                vm.runTime.period.end = '24:00';
            } else {
                vm.runTime.frequency = 'singleStart';
                vm.runTime.period.singleStart = '00:00';
            }
            if (vm.order && (vm.order.isOrderJob == false || vm.order.isOrderJob == 'no')) {
                vm.runTime.isStandaloneJob = 'yes';
            }
        };

        vm.createRunTime = function (form, timeZone) {
            if (form && !form.$invalid && vm.editor.isEnable && vm.editor.create && !isDelete) {
                let flg = false, isPeriodEmpty = false;
                if(vm.runTime.period){
                    let temp = angular.copy(vm.runTime.period);
                    delete temp['whenHoliday'];
                    if(_.isEmpty(temp)){
                        isPeriodEmpty = true;
                    }
                }
                if (vm.runTime.period && !isPeriodEmpty) {
                    if (vm.runTime.frequency === 'repeat' || vm.runTime.frequency === 'absoluteRepeat') {
                        flg = !!vm.runTime.period.begin;
                        flg = !!vm.runTime.period.end;
                    }
                    if (vm.runTime.frequency === 'singleStart' && vm.runTime.period.singleStart) {
                        flg = true;
                    } else if (vm.runTime.frequency === 'repeat' && vm.runTime.period.repeat) {
                        flg = true;
                    } else flg = !!(vm.runTime.frequency === 'absoluteRepeat' && vm.runTime.period.absoluteRepeat);
                    if (!flg) {
                        flg = true;
                        angular.forEach(vm.periodList, function (list) {
                            if (list.tab === vm.runTime.tab) {
                                if ((vm.runTime.days || vm.runTime.selectedMonths || vm.runTime.selectedMonthsU) &&
                                    (angular.equals(list.days, vm.runTime.days) || angular.equals(list.selectedMonths, vm.runTime.selectedMonths) || angular.equals(list.selectedMonthsU, vm.runTime.selectedMonthsU))) {
                                    if (list.months && vm.runTime.months) {
                                        if (angular.equals(list.months, vm.runTime.months))
                                            flg = false;
                                    } else {
                                        flg = false;
                                    }
                                } else if (vm.runTime.specificWeekDay && vm.runTime.which && (list.specificWeekDay == vm.runTime.specificWeekDay && list.which == vm.runTime.which)) {
                                    flg = false;
                                } else if (vm.runTime.date && (list.dates == vm.runTime.date)) {
                                    flg = false;
                                }
                            }
                        })
                    }
                }
                if (flg || vm.periodList.length === 0) {
                    vm.addPeriod();
                }
            }

            if (!_.isEmpty(_tempFrequency)) {
                if (vm.runTime.tab === 'specificDays') {
                    if(vm.tempItems.length>0) {
                        for (let t = 0; t < vm.tempItems.length; t++) {
                            vm.runTime.date = vm.tempItems[t].date;
                            angular.forEach(vm.periodList, function (list) {
                                vm.runTime.period = list.period;
                                vm.tempRunTime = RuntimeService.checkPeriodList(run_time, vm.runTime, selectedMonths, selectedMonthsU);
                            });
                        }
                    }else{
                        vm.runTime.date = null;
                        angular.forEach(vm.periodList, function (list) {
                            vm.runTime.period = list.period;
                            vm.tempRunTime = RuntimeService.checkPeriodList(run_time, vm.runTime, selectedMonths, selectedMonthsU);
                        });
                    }
                } else {
                    angular.forEach(vm.periodList, function (list) {
                        vm.runTime.period = list.period;
                        vm.tempRunTime = RuntimeService.checkPeriodList(run_time, vm.runTime, selectedMonths, selectedMonthsU);
                    })
                }
            }

            _tempFrequency = {};
            vm.periodList = [];
            vm.editor.hidePervious = false;
            vm.editor.create = false;
            vm.editor.update = false;
            vm.editor.showHolidayTab = false;

            if (_.isEmpty(vm.tempRunTime)) {
                if (_.isEmpty(run_time)) {
                    let _json = vm.jsonObj.json;
                    run_time = _json.run_time || _json.schedule;
                }
                vm.tempRunTime = run_time;
            }

            vm.run_time = vm.tempRunTime;
            if (vm.runTime1.timeZone && timeZone) {
                vm.run_time.timeZone = vm.runTime1.timeZone;
            }


            delete vm.run_time['schedule'];

            if (vm.runTime1.dates && vm.runTime1.dates.date) {
                vm.run_time.dates = [
                    {date: moment(vm.runTime1.dates.date).format('YYYY-MM-DD')}
                ];
            }

            if (!_.isEmpty(vm.run_time.dates)) {
                if (!(vm.run_time.dates && (vm.run_time.dates.length > 0))) {
                    delete vm.run_time['dates'];
                }
            } else {
                delete vm.run_time['date'];
            }
            if (!_.isEmpty(vm.run_time.weekdays)) {
                if (!(vm.run_time.weekdays.days && (vm.run_time.weekdays.days.length > 0 || vm.run_time.weekdays.days.day))) {
                    delete vm.run_time['weekdays'];
                }
            } else {
                delete vm.run_time['weekdays'];
            }

            if (!_.isEmpty(vm.run_time.monthdays)) {
                if (!(vm.run_time.monthdays.weekdays && vm.run_time.monthdays.weekdays.length > 0)) {
                    delete vm.run_time.monthdays['weekdays'];
                }
                if (!(vm.run_time.monthdays.days && (vm.run_time.monthdays.days.length > 0 || vm.run_time.monthdays.days.day))) {
                    if (!vm.run_time.monthdays.weekdays) {
                        delete vm.run_time['monthdays'];
                    } else {
                        if(vm.run_time.monthdays.days) {
                            if (vm.run_time.monthdays.days.length == 0 && vm.run_time.monthdays.weekdays.length == 0) {
                                delete vm.run_time['monthdays'];
                            } else if (vm.run_time.monthdays.days.length == 0) {
                                delete vm.run_time.monthdays['days'];
                            }
                        }
                    }
                }
            } else {
                delete vm.run_time['monthdays'];
            }

            if (!_.isEmpty(vm.run_time.ultimos)) {
                if (!(vm.run_time.ultimos.days && (vm.run_time.ultimos.days.length > 0 || vm.run_time.ultimos.days.day))) {
                    delete vm.run_time['ultimos'];
                }
            } else {
                delete vm.run_time['ultimos'];
            }

            if (!_.isEmpty(vm.run_time.months)) {
                if (!(vm.run_time.months.length > 0 || vm.run_time.months.month)) {
                    delete vm.run_time['months'];
                }
            } else {
                delete vm.run_time['months'];
            }

            if (!vm.run_time.holidays) {
                vm.run_time.holidays = {};
                vm.run_time.holidays.days = [];
            }else{
                let dates =[];
                if(vm.run_time.holidays.days) {
                    for (let i = 0; i < vm.run_time.holidays.days.length; i++) {
                        if (vm.run_time.holidays.days[i].calendar) {
                            dates.push(vm.run_time.holidays.days[i]);
                        }
                    }
                    vm.run_time.holidays.days = dates;
                }else{
                    vm.run_time.holidays.days = [];
                }
            }
            vm.run_time.holidays.includes = [];
            if (vm.runTime1.holidays) {
                if (vm.runTime1.holidays.weekdays) {
                    vm.run_time.holidays.weekdays = angular.copy(vm.runTime1.holidays.weekdays);
                    if(vm.run_time.holidays.weekdays.days && !angular.isArray(vm.run_time.holidays.weekdays.days)){
                        vm.run_time.holidays.weekdays.days = [vm.run_time.holidays.weekdays.days]
                    }
                }
            }
            if (vm.holidayDates && vm.holidayDates.length > 0) {
                angular.forEach(vm.holidayDates, function (value) {
                    let flag = false;
                    for (let i = 0; i < vm.run_time.holidays.days.length; i++) {
                        if (!vm.run_time.holidays.days[i].calendar && vm.run_time.holidays.days[i].date == moment(value).format('YYYY-MM-DD')) {
                            flag = true;
                            break;
                        }
                    }
                    if (!flag)
                        vm.run_time.holidays.days.push({date: moment(value).format('YYYY-MM-DD')});
                });
            }

            if (vm.calendarFiles && vm.calendarFiles.length > 0) {
                angular.forEach(vm.calendarFiles, function (value) {
                    let type = value.substr(0, value.indexOf(':'));
                    let n = value.length;
                    if (type == 'liveFile') {
                        vm.run_time.holidays.includes.push({liveFile: value.substr(value.indexOf(':') + 1, n)});
                    } else if (type == 'file') {
                        vm.run_time.holidays.includes.push({liveFile: value.substr(value.indexOf(':') + 1, n)});
                    }
                });
            }

            if (!_.isEmpty(vm.run_time.holidays)) {
                if (!(vm.run_time.holidays.days && vm.run_time.holidays.days.length > 0)) {
                    delete vm.run_time.holidays['days'];
                }
                if (!(vm.run_time.holidays.includes && vm.run_time.holidays.includes.length > 0)) {
                    delete vm.run_time.holidays['includes'];
                }

                if (!(vm.run_time.holidays.weekdays && vm.run_time.holidays.weekdays.days && vm.run_time.holidays.weekdays.days.length > 0)) {
                    delete vm.run_time.holidays['weekdays'];
                }
            }
            if (_.isEmpty(vm.run_time.holidays)) {
                delete vm.run_time['holidays'];
            }

            if (vm.order) {
                vm.run_time = {run_time: vm.run_time};
            } else if (vm.schedule) {
                vm.run_time = {schedule: vm.run_time};
            }

            vm.holidayList = [];
            vm.runTime.nationalHoliday = [];
            vm.runTime.country = '';
            run_time = {};
            run_time.months = [];
            run_time.weekdays = {};
            run_time.weekdays.days = [];
            run_time.monthdays = {};
            run_time.monthdays.days = [];
            run_time.ultimos = {};
            run_time.ultimos.days = [];
            vm.tempRunTime = {};
            selectedMonths = [];
            selectedMonthsU = [];
            vm.editor.isEnable = false;
            getXml2Json(angular.copy(vm.run_time));
        };

        vm.assignCalendar = function () {
            $rootScope.$broadcast('calendar-editor', {calendar: vm.selectedCalendar});
            $('#calendar-editor').modal('show');
        };

        vm.assignHolidayCalendar = function () {
            $rootScope.$broadcast('calendar-editor', {data: 'holiday', calendar: vm.holidayCalendar});
            $('#calendar-editor').modal('show');
        };

        function generateCalendarDates(run_time, dates, calendar) {
            let _tempDates = [];
            if (run_time.dates && run_time.dates.length > 0) {
                _tempDates = angular.copy(run_time.dates);
                for (let x = 0; x < _tempDates.length; x++) {
                    if (_tempDates[x].calendar == calendar.path) {
                        for (let i = 0; i < run_time.dates.length; i++) {
                            if (run_time.dates[i].calendar == calendar.path) {
                                run_time.dates.splice(i, 1);
                                break;
                            }

                        }
                    }
                }
            }

            if (dates.length > 0) {
                angular.forEach(dates, function (d) {
                    if (run_time.dates) {
                        if (!angular.isArray(run_time.dates)) {
                            let _temp = angular.copy(run_time.dates);
                            run_time.dates = [];
                            run_time.dates.push(_temp)
                        }
                        let period = {};
                        if (_tempDates.length > 0) {
                            for (let x = 0; x < _tempDates.length; x++) {
                                if (_tempDates[x].calendar == calendar.path) {
                                    period = _tempDates[x].periods;
                                    break;
                                }
                            }
                        }
                        if (!angular.isArray(period)) {
                            let _temp = angular.copy(period);
                            period = [];
                            if (_temp && !_.isEmpty(_temp)) {
                                period.push(_temp)
                            }
                        }

                        run_time.dates.push({
                            calendar: calendar.path,
                            date: d,
                            periods: period
                        });
                    } else {
                        run_time.dates = [];
                        let obj = {};
                        obj.calendar = calendar.path;
                        obj.date = d;
                        if (_tempDates.length > 0) {
                            for (let x = 0; x < _tempDates.length; x++) {
                                if (_tempDates[x].calendar == calendar.path) {
                                    obj.periods = _tempDates[x].periods;
                                    break;
                                }
                            }
                        }
                        run_time.dates.push(obj);
                    }
                });
            }
        }

        function generateHolidayCalendarDates(run_time, dates, calendar) {
            let _tempDates = [];
            if (run_time.holidays) {
                if (!_.isEmpty(run_time.holidays)) {
                    if (run_time.holidays.days && run_time.holidays.days.length > 0) {
                        _tempDates = angular.copy(run_time.holidays.days);
                        for (let x = 0; x < _tempDates.length; x++) {
                            if (_tempDates[x].calendar == calendar.path) {
                                for (let i = 0; i < run_time.holidays.days.length; i++) {
                                    if (run_time.holidays.days[i].calendar == calendar.path) {
                                        run_time.holidays.days.splice(i, 1);
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            } else {
                run_time.holidays = {};
            }
            if (dates.length > 0) {
                angular.forEach(dates, function (d) {
                    if (!_.isEmpty(run_time.holidays)) {
                        if (run_time.holidays.days && angular.isArray(run_time.holidays.days)) {

                            run_time.holidays.days.push({
                                calendar: calendar.path,
                                date: moment(d).format('YYYY-MM-DD')
                            });
                        } else {
                            run_time.holidays.days = [];
                            run_time.holidays.days.push({
                                calendar: calendar.path,
                                date: moment(d).format('YYYY-MM-DD')
                            });
                        }

                    } else {
                        run_time.holidays.days = [];
                        run_time.holidays.days.push({
                            calendar: calendar.path,
                            date: moment(d).format('YYYY-MM-DD')
                        });
                    }
                });
            }
        }

        function generateCalendarTag(list, type) {
            let _json = angular.copy(vm.jsonObj.json);
            let run_time = _json.run_time || _json.schedule || {};

            angular.forEach(list, function (calendar, index) {
                if (!calendar.basedOn) {
                    calendar.basedOn = calendar.path;
                }

                let obj = {};
                obj.jobschedulerId = vm.schedulerIds.selected;

                obj.calendar = {};
                obj.calendar.basedOn = calendar.basedOn;
                if (calendar.frequencyList && calendar.frequencyList.length > 0) {
                    obj.calendar.includes = {};
                    angular.forEach(calendar.frequencyList, function (data) {
                        obj.calendar = RuntimeService.generateCalendarObj(data, obj.calendar);
                    });
                }
                CalendarService.getListOfDates(obj).then(function (result) {
                    if (result.dates && result.dates.length === 0) {
                        toasty.info({
                            title: gettextCatalog.getString('message.emptyCalendar'),
                            msg: gettextCatalog.getString('message.noDatesFound'),
                            timeout: 10000
                        });
                    }
                    calendarToXML(type, index, result.dates, calendar, list, run_time);
                }, function () {
                    calendarToXML(type, index, [], calendar, list, run_time);
                });
            })
        }

        var firstDay, lastDay;
        vm.getPlan = function (newYear, newMonth, isReload) {
            let year = newYear || new Date().getFullYear(), month =  newMonth || new Date().getMonth();
            if (!isReload) {
                $('#year-calendar').data('calendar').setYearView({view: vm.viewCalObj.calendarView, year: year});
                month = $('#year-calendar').data('calendar').getMonth();
            }
            let firstDay2 = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);
            let lastDay2 = new Date(year, 11, 31, 23, 59, 0);
            if (vm.viewCalObj.calendarView == 'year') {
                if (year < new Date().getFullYear()) {
                    return;
                } else if (year == new Date().getFullYear()) {
                    firstDay2 = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);
                } else {
                    firstDay2 = new Date(year, 0, 1, 0, 0, 0);
                }
            }
            if (vm.viewCalObj.calendarView == 'month') {
                if (year <= new Date().getFullYear() && month < new Date().getMonth()) {
                    return;
                } else if (year == new Date().getFullYear() && month == new Date().getMonth()) {
                    firstDay2 = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);
                } else {
                    firstDay2 = new Date(year, month, 1, 0, 0, 0);
                }
                lastDay2 = new Date(year, month + 1, 0, 23, 59, 0);
            }
            if (new Date(firstDay2) >= new Date(firstDay) && new Date(lastDay2) <= new Date(lastDay)) {
                vm.isCalendarLoading = false;
                return;
            }
            vm.isCalendarLoading = true;
            firstDay = firstDay2;
            lastDay = lastDay2;
            vm.planItems = [];
            getPlansFromRuntime(firstDay, lastDay);
        };

        function populatePlanItems(res) {
            if (res.periods) {
                angular.forEach(res.periods, function (value) {
                    let planData = {};
                    if (value.begin) {
                        planData = {
                            plannedStartTime: moment(value.begin).tz(vm.userPreferences.zone)
                        };
                        if (value.end) {
                            planData.endTime = vm.getTimeFromDate(moment(value.end).tz(vm.userPreferences.zone));
                        }
                        if (value.repeat) {
                            planData.repeat = value.repeat;
                        }
                    } else if (value.singleStart) {
                        planData = {
                            plannedStartTime: moment(value.singleStart).tz(vm.userPreferences.zone)
                        };
                    }
                    let date = new Date(planData.plannedStartTime).setHours(0, 0, 0, 0);
                    planData.startDate = date;
                    planData.endDate = date;
                    planData.color = 'blue';
                    vm.planItems.push(planData);
                });
            }
        }

        vm.calendarTitle = new Date().getFullYear();
        vm.planFromRuntime = function () {
            vm.calendarTitle = new Date().getFullYear();
            vm.isCalendarLoading = true;
            vm.editor.showPlanned = true;
            if (vm.order) {
                vm._job = vm.order;
            } else {
                vm._job = vm.schedule;
            }

            vm.planItems = [];
            firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);
            lastDay = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 0);
            getPlansFromRuntime(firstDay, lastDay);
        };

        function getPlansFromRuntime(firstDay, lastDay) {
            let run_time = vm.jsonObj.json.run_time;
            if (!run_time && vm.jsonObj.json.schedule) {
                run_time = angular.copy(vm.jsonObj.json.schedule);
                delete run_time['path'];
                delete run_time['type'];
                delete run_time['message'];
                delete run_time['selected1'];
                delete run_time['deployed'];
                delete run_time['deleted'];
                delete run_time['current'];
                delete run_time['fromDate'];
                delete run_time['fromTime'];
                delete run_time['toDate'];
                delete run_time['toTime'];
            }
            DailyPlanService.getPlansFromRuntime({
                jobschedulerId: $scope.schedulerIds.selected,
                runTime: run_time,
                dateFrom: moment(firstDay).format('YYYY-MM-DD'),
                dateTo: moment(lastDay).format('YYYY-MM-DD')
            }).then(function (res) {
                if ($('#year-calendar') && $('#year-calendar').data('calendar')) {

                }else {
                    $('#year-calendar').calendar({
                        language: localStorage.$SOS$LANG,
                        view: 'month',
                        startYear: vm.calendarTitle,
                        renderEnd: (e) => {
                            vm.calendarTitle = e.currentYear;
                            if (vm.isCalendarDisplay) {
                                vm.viewCalObj.calendarView = e.view;
                                vm.getPlan(e.currentYear, e.currentMonth, true);
                            }
                        }
                    });
                }
                populatePlanItems(res);
                $('#year-calendar').data('calendar').setDataSource(vm.planItems);
                vm.isCalendarDisplay = true;
                vm.isCalendarLoading = false;
            }, function () {
                vm.isCalendarLoading = false;
            });
        }

        function calendarToXML(type, index, dates, calendar, list) {
            if (type == 'holiday') {
                generateHolidayCalendarDates(run_time, dates, calendar);
                if (list.length != vm.holidayCalendar.length) {
                    vm.holidayCalendar = list;
                }
            } else {
                generateCalendarDates(run_time, dates, calendar);
                if (list.length != vm.selectedCalendar.length) {
                    vm.selectedCalendar = list;
                }
            }
            if (index == list.length - 1) {
                resetPeriodObj(run_time);
            }
        }

        vm.$on('save-holiday-calendar', function (event, data) {
            vm.holidayCalendar = angular.copy(data.holidayCalendar);
            generateCalendarTag(vm.holidayCalendar, 'holiday')

        });
        vm.$on('save-calendar', function (event, data) {
            vm.selectedCalendar = angular.copy(data.selectedCalendar);
            generateCalendarTag(vm.selectedCalendar, 'nowworking')

        });

        var tempList = [];

        vm.previewCalendar = function (data) {
            vm.isCalendarDisplay = false;
            vm.editor.showHolidayTab = false;
            vm.editor.showCalendarTab = true;
            vm.planItems = [];
            vm.calendarTitle = new Date().getFullYear();
            var obj = {};
            if ($('#full-calendar') && $('#full-calendar').data('calendar')) {

            } else {
                $('#full-calendar').calendar({
                    language: localStorage.$SOS$LANG,
                    view: 'year',
                    renderEnd: (e) => {
                        vm.calendarTitle = e.currentYear;
                        if (vm.isCalendarDisplay) {
                            if (e.view === 'year') {
                                vm.changeDate();
                            }
                        }
                    }
                });
            }
            if (data.calendar) {
                vm.calendarObj = data.calendar;
            } else {
                vm.calendarObj = data;
            }
            CalendarService.getCalendar({
                jobschedulerId: vm.schedulerIds.selected,
                path: vm.calendarObj.path,
                id: vm.calendarObj.id
            }).then(function (res) {
                vm.calendarObj.from = res.calendar.from || moment().format('YYYY-MM-DD');
                vm.calendarObj.to = res.calendar.to;
                obj.dateFrom = vm.calendarObj.from;
                obj.dateTo = vm.calendarObj.to;

                vm.toDate = angular.copy(obj.dateTo);
                if (new Date(obj.dateTo).getTime() > new Date(vm.calendarTitle + '-12-31').getTime()) {
                    obj.dateTo = vm.calendarTitle + '-12-31';
                }

                obj.path = vm.calendarObj.path;
                obj.jobschedulerId = vm.schedulerIds.selected;
                CalendarService.getListOfDates(obj).then(function (result) {
                    angular.forEach(result.dates, function (date) {
                        vm.planItems.push({
                            startDate: moment(date),
                            endDate: moment(date),
                            color: 'blue'
                        });
                    });
                    angular.forEach(result.withExcludes, function (date) {
                        vm.planItems.push({
                            startDate: moment(date),
                            endDate: moment(date),
                            color: 'orange'
                        });
                    });
                    tempList = angular.copy(vm.planItems);
                    $('#full-calendar').data('calendar').setDataSource(vm.planItems);
                    setTimeout(() => {
                        vm.isCalendarDisplay = true;
                    }, 100);
                });
            })
        };
        vm.changeDate = function () {
            let newDate = new Date(), toDate;
            newDate.setHours(0, 0, 0, 0);
            if (new Date(vm.toDate).getTime() > new Date(vm.calendarTitle + '-12-31').getTime()) {
                toDate = vm.calendarTitle + '-12-31';
            } else {
                toDate = vm.toDate;
            }
            if (newDate.getFullYear() < vm.calendarTitle && (new Date(vm.calendarTitle + '-01-01').getTime() < new Date(toDate).getTime())) {
                vm.planItems = [];
                let obj = {};
                obj.jobschedulerId = vm.schedulerIds.selected;
                obj.calendar = {};
                obj.dateFrom = vm.calendarTitle + '-01-01';
                obj.dateTo = toDate;
                obj.path = vm.calendarObj.path;
                CalendarService.getListOfDates(obj).then(function (result) {
                    angular.forEach(result.dates, function (date) {
                        vm.planItems.push({
                            startDate: moment(date),
                            endDate: moment(date),
                            color: 'blue'
                        });
                    });
                    angular.forEach(result.withExcludes, function (date) {
                        vm.planItems.push({
                            startDate: moment(date),
                            endDate: moment(date),
                            color: 'orange'
                        });
                    });
                    $('#full-calendar').data('calendar').setDataSource(vm.planItems);
                });
            } else if (newDate.getFullYear() == vm.calendarTitle) {
                vm.planItems = angular.copy(tempList);
                $('#full-calendar').data('calendar').setDataSource(vm.planItems);
            }
        };

        vm.deleteCalendar = function (data) {
            var _json = vm.jsonObj.json;
            var run_time = _json.run_time || _json.schedule;
            if (!run_time) {
                return;
            }
            for (let x = 0; x < vm.selectedCalendar.length; x++) {
                if (data.calendar.path == vm.selectedCalendar[x].path) {
                    vm.selectedCalendar.splice(x, 1);
                    break;
                }
            }
            if (run_time.dates) {
                if (!angular.isArray(run_time.dates)) {
                    delete run_time['dates'];
                } else {
                    let _tempList = angular.copy(run_time.dates);
                    angular.forEach(_tempList, function (value) {
                        if (value.calendar && value.calendar == data.calendar.path) {
                            for (let i = 0; i < run_time.dates.length; i++) {
                                if (value.calendar == run_time.dates[i].calendar) {
                                    run_time.dates.splice(i, 1);
                                    break;
                                }
                            }
                        }
                    });

                }
            }
            resetPeriodObj(run_time);
        };

        vm.deleteHolidayCalendar = function (data) {
            let _json = vm.jsonObj.json;
            let run_time = _json.run_time || _json.schedule;
            if (!run_time) {
                return;
            }
            for (let x = 0; x < vm.holidayCalendar.length; x++) {
                if (data.path === vm.holidayCalendar[x].path) {
                    vm.holidayCalendar.splice(x, 1);
                    break;
                }
            }
            if (run_time.holidays) {
                if (!angular.isArray(run_time.holidays.days)) {
                    delete run_time.holidays['days'];
                } else {
                    let _tempList = angular.copy(run_time.holidays.days);
                    angular.forEach(_tempList, function (value) {
                        if (value.calendar && value.calendar == data.path) {
                            for (let i = 0; i < run_time.holidays.days.length; i++) {
                                if (value.calendar == run_time.holidays.days[i].calendar) {
                                    run_time.holidays.days.splice(i, 1);
                                    break;
                                }
                            }
                        }
                    });

                }
                if (run_time.holidays.days && angular.isArray && run_time.holidays.days.length === 0) {
                    delete run_time.holidays['days'];
                }
            }

            resetPeriodObj(run_time);
        };

        vm.back1 = function () {
            vm.editor.showHolidayTab = false;
            vm.editor.showCalendarTab = false;
            getXml2Json(vm.jsonObj.json);
        };


        function frequencyToString1(period) {
            var str = '';
            if (period.tab == 'weekDays') {
                return RuntimeService.getWeekDays(period.days);
            } else if (period.tab == 'specificWeekDays') {
                if (!angular.isArray(period.which)) {
                    return RuntimeService.getSpecificDay(period.which) + ' ' + period.specificWeekDay + ' of month';
                } else {
                    var str1 = '';
                    angular.forEach(period.which, function (value, index) {
                        str1 = str1 + RuntimeService.getSpecificDay(value);
                        if (period.which.length - 1 != index) {
                            str1 = str1 + ', ';
                        }
                    });

                    return str1 + ' ' + period.specificWeekDay + ' of month';

                }
            } else if (period.tab == 'monthDays') {
                if (period.isUltimos != 'months') {
                    return RuntimeService.getMonthDays(period.selectedMonthsU, true) + ' of ultimos';
                } else {
                    return RuntimeService.getMonthDays(period.selectedMonths) + ' of month';
                }
            } else if (period.tab == 'specificDays') {
                str = 'On ';
                if (period.dates)
                    angular.forEach(period.dates.sort(), function (date, index) {
                        str = str + moment(date).format(vm.dataFormat.toUpperCase());
                        if (index != period.dates.length - 1) {
                            str = str + ', ';
                        }
                    });
                return str;
            } else if (period.tab == 'every') {
                if (period.interval == 1) {
                    str = period.interval + 'st ';
                } else if (period.interval == 2) {
                    str = period.interval + 'nd ';
                } else if (period.interval == 3) {
                    str = period.interval + 'rd ';
                } else {
                    str = period.interval + 'th ';
                }
                var repetitions = period.dateEntity == 'DAILY' ? 'day' : period.dateEntity == 'WEEKLY' ? 'week' : period.dateEntity == 'MONTHLY' ? 'month' : 'year';
                return 'Every ' + str + repetitions;

            }
        }

        function getStringDay(day) {
            return day == 0 ? "sunday" : day == 1 ? "monday" : day == 2 ? "tuesday" : day == 3 ? "wednesday" : day == 4 ? "thursday" : day == 5 ? "friday" : "saturday";
        }

        function convertObjToArr(calendar) {
            var obj = {};
            if (!calendar.frequencyList) {
                calendar.frequencyList = [];
            }
            if (calendar.includes && !_.isEmpty(calendar.includes)) {
                if (calendar.includes.weekdays && calendar.includes.weekdays.length > 0) {
                    angular.forEach(calendar.includes.weekdays, function (weekday) {
                        obj = {};
                        obj.tab = "weekDays";
                        obj.type = "INCLUDE";
                        obj.days = [];
                        angular.forEach(weekday.days, function (day) {
                            obj.days.push(day.toString())
                        });
                        obj.startingWithW = weekday.from;
                        obj.endOnW = weekday.to;
                        obj.all = weekday.days.length == 7;
                        obj.str = frequencyToString1(obj);
                        calendar.frequencyList.push(obj);
                    });
                }
                if (calendar.includes.monthdays && calendar.includes.monthdays.length > 0) {
                    angular.forEach(calendar.includes.monthdays, function (monthday) {
                        if (monthday.weeklyDays && monthday.weeklyDays.length > 0) {
                            angular.forEach(monthday.weeklyDays, function (day) {
                                obj = {};
                                obj.type = "INCLUDE";
                                obj.tab = "specificWeekDays";
                                obj.specificWeekDay = getStringDay(day.day);
                                obj.which = day.weekOfMonth.toString();

                                obj.startingWithS = monthday.from;
                                obj.endOnS = monthday.to;
                                obj.str = frequencyToString1(obj);

                                calendar.frequencyList.push(obj);
                            });
                        } else {
                            obj = {};
                            obj.type = "INCLUDE";
                            obj.tab = "monthDays";
                            obj.selectedMonths = [];
                            angular.forEach(monthday.days, function (day) {
                                obj.selectedMonths.push(day.toString())
                            });
                            obj.isUltimos = 'months';
                            obj.startingWithM = monthday.from;
                            obj.endOnM = monthday.to;
                            obj.str = frequencyToString1(obj);
                            calendar.frequencyList.push(obj);
                        }
                    });
                }
                if (calendar.includes.ultimos && calendar.includes.ultimos.length > 0) {
                    angular.forEach(calendar.includes.ultimos, function (ultimos) {
                        if (ultimos.weeklyDays && ultimos.weeklyDays.length > 0) {
                            angular.forEach(ultimos.weeklyDays, function (day) {
                                obj = {};
                                obj.type = "INCLUDE";
                                obj.tab = "specificWeekDays";
                                obj.specificWeekDay = getStringDay(day.day);
                                obj.which = -day.weekOfMonth;
                                obj.startingWithS = ultimos.from;
                                obj.endOnS = ultimos.to;
                                obj.str = frequencyToString1(obj);
                                calendar.frequencyList.push(obj);
                            });
                        } else {
                            obj = {};
                            obj.type = "INCLUDE";
                            obj.tab = "monthDays";
                            obj.selectedMonthsU = [];
                            angular.forEach(ultimos.days, function (day) {
                                obj.selectedMonthsU.push(day.toString())
                            });
                            obj.isUltimos = 'ultimos';
                            obj.startingWithM = ultimos.from;
                            obj.endOnM = ultimos.to;
                            obj.str = frequencyToString1(obj);
                            calendar.frequencyList.push(obj);
                        }

                    });
                }
                if (calendar.includes.repetitions && calendar.includes.repetitions.length > 0) {
                    angular.forEach(calendar.includes.repetitions, function (value) {
                        obj = {};
                        obj.tab = "every";
                        obj.type = "INCLUDE";
                        obj.dateEntity = value.repetition;
                        obj.interval = value.step;
                        obj.startingWith = value.from;
                        obj.endOn = value.to;
                        obj.str = frequencyToString1(obj);
                        calendar.frequencyList.push(obj);
                    });
                }
                if (calendar.includes.dates && calendar.includes.dates.length > 0) {
                    obj = {};
                    obj.tab = "specificDays";
                    obj.type = "INCLUDE";
                    obj.dates = calendar.includes.dates;
                    obj.str = frequencyToString1(obj);
                    calendar.frequencyList.push(obj);

                }
            }
        }

        function convertPeriodObjToArr(data) {

            angular.forEach(data.periods, function (value) {
                var obj = {};
                obj.period = {};
                obj.calendar = data.basedOn;
                if (value.singleStart) {
                    obj.frequency = 'singleStart';
                    obj.period.singleStart = value.singleStart;
                } else if (value.absoluteRepeat) {
                    obj.frequency = 'absoluteRepeat';
                    obj.period.absoluteRepeat = value.absoluteRepeat;
                } else if (value.repeat) {
                    obj.frequency = 'repeat';
                    obj.period.repeat = value.repeat;
                }
                if (value.begin) {
                    obj.period.begin = value.begin;
                }
                if (value.end) {
                    obj.period.end = value.end;
                }
                if (value.whenHoliday) {
                    obj.period.whenHoliday = value.whenHoliday;
                }
                vm.calPeriod.push(obj);
            });
        }

        function getCalendarList() {
            vm.calPeriod = [];
            angular.forEach(vm.calendars, function (calendar) {
                calendar.path = angular.copy(calendar.basedOn);

                if (calendar.type == 'WORKING_DAYS') {
                    convertObjToArr(calendar);
                    convertPeriodObjToArr(calendar);

                    if (vm.selectedCalendar && angular.isArray(vm.selectedCalendar)) {
                        vm.selectedCalendar.push(calendar);
                    } else {
                        vm.selectedCalendar = [];
                        vm.selectedCalendar.push(calendar);
                    }

                } else {
                    if (vm.holidayCalendar && angular.isArray(vm.holidayCalendar)) {
                        vm.holidayCalendar.push(calendar);
                    } else {
                        vm.holidayCalendar = [];
                        vm.holidayCalendar.push(calendar);
                    }
                }
            });

            if (vm.selectedCalendar && vm.selectedCalendar.length > 0)
                generateCalendarTag(vm.selectedCalendar, 'working');
            if (vm.holidayCalendar && vm.holidayCalendar.length > 0)
                generateCalendarTag(vm.holidayCalendar, 'holiday');
        }


        function initial() {
            vm.jsonObj = {
                json: {}
            };
            if (vm.order && !vm.order.at) {
                vm.order.at = 'now';
            }
            if (vm.runTimes) {
                if (vm.order) {
                    vm.jsonObj.json.run_time = vm.runTimes.runTime;
                } else if (vm.schedule) {
                    vm.jsonObj.json.schedule = vm.runTimes.runTime;
                }
            } else {
                if (vm.order) {
                    vm.jsonObj.json.run_time = vm.order.runTime;
                } else if (vm.schedule) {
                    vm.jsonObj.json.schedule = vm.schedule;
                }
            }
            getXml2Json(angular.copy(vm.jsonObj.json));
            if (!vm.calendars) {
                let cal;
                if (vm.runTimes) {
                    if (vm.runTimes.runTime.calendars) {
                        cal = JSON.parse(vm.runTimes.runTime.calendars);
                    }
                } else {
                    if (vm.order && vm.order.runTime) {
                        if (vm.order.runTime.calendars) {
                            cal = JSON.parse(vm.order.runTime.calendars);
                        }
                    } else if (vm.schedule && vm.schedule.runTime) {
                        if (vm.schedule.runTime.calendars) {
                            cal = JSON.parse(vm.schedule.runTime.calendars);
                        }
                    }
                }
                vm.calendars = cal ? cal.calendars : null;
                if (vm.calendars && vm.calendars.length > 0)
                    getCalendarList();
            }
        }

        initial();

        $scope.$on('$destroy', function () {
            watcher1();
            watcher2();
            watcher3();
            watcher4();
            if (promise1)
                $timeout.cancel(promise1);
            if (promise2)
                $timeout.cancel(promise2);
            if (promise3)
                $timeout.cancel(promise3);
            if (promise4)
                $timeout.cancel(promise4);
        });
    }

    CalendarEditorDialogCtrl.$inject = ['$scope', '$rootScope', '$uibModalInstance', '$window', '$filter', 'CalendarService', '$uibModal', 'gettextCatalog', 'toasty', 'RuntimeService'];

    function CalendarEditorDialogCtrl($scope, $rootScope, $uibModalInstance, $window, $filter, CalendarService, $uibModal, gettextCatalog, toasty, RuntimeService) {
        const vm = $scope;
        vm.minDate = new Date();
        vm.minDate.setDate(vm.minDate.getDate() - 1);
        vm.logError = false;
        if (vm.userPreferences.auditLog) {
            vm.display = true;
        }
        if ($window.sessionStorage.$SOS$FORCELOGING == 'true') {
            vm.required = true;
        }
        vm.predefinedMessageList = JSON.parse($window.sessionStorage.comments);

        $scope.$on('calendar-close', function () {
            $uibModalInstance.close('ok');
        });

        function submit() {
            if (!vm.calendar.create) {
                CalendarService.calendarUsed({
                    id: vm.calendar.id,
                    jobschedulerId: vm.schedulerIds.selected
                }).then(function (res) {
                    vm.calendar.usedIn = res;
                    vm.calendarArr = undefined;
                    if (vm.calendar.usedIn && (vm.calendar.usedIn.orders || vm.calendar.usedIn.jobs || vm.calendar.usedIn.schedules)) {
                        if (vm.oldType != vm.calendar.type) {
                            toasty.warning({
                                title: gettextCatalog.getString('message.calendarTypeCannotBeChange'),
                                timeout: 10000
                            });
                        } else {
                            let modalInstance = $uibModal.open({
                                templateUrl: 'modules/core/template/confirm-dialog.html',
                                controller: 'DialogCtrl1',
                                scope: vm,
                                backdrop: 'static'
                            });
                            modalInstance.result.then(function () {
                                $rootScope.$broadcast('calendar-obj', {
                                    calendar: vm.calendar
                                });
                            }, function () {

                            });
                        }
                    } else {
                        $rootScope.$broadcast('calendar-obj', {
                            calendar: vm.calendar
                        });
                    }
                });
            } else {
                $rootScope.$broadcast('calendar-obj', {
                    calendar: vm.calendar
                });
            }
        }

        vm.ok = function (form) {
            if (vm.calendar.name && vm.calendar.path && vm.calendar.to) {
                form.$setPristine();
                form.$setUntouched();
            } else {
                form.name.$invalid = !vm.calendar.name;
                form.name.$dirty = !vm.calendar.name;
                form.path.$invalid = !vm.calendar.path;
                form.path.$dirty = !vm.calendar.path;
                form.to.$invalid = !vm.calendar.to;
                form.to.$dirty = !vm.calendar.to;
                return;
            }
            vm.logError = false;
            vm.calendar.calendarObj = generateCalendarAllObj();
            if (vm.required) {
                if (vm.comments.comment) {
                    submit();
                } else {
                    vm.logError = true;
                }
            } else {
                submit();
            }
        };

        vm.saveAs = function (form) {
            if (vm.calendar.path && vm.calendar.to) {
                form.$setPristine();
                form.$setUntouched();
            } else {
                form.path.$invalid = !vm.calendar.path;
                form.path.$dirty = !vm.calendar.path;
                form.to.$invalid = !vm.calendar.to;
                form.to.$dirty = !vm.calendar.to;
                return;
            }
            vm.logError = false;
            vm.calendar.calendarObj = generateCalendarAllObj();
            if (vm.required) {
                if (vm.comments.comment) {
                    $rootScope.$broadcast('copy-calendar', {
                        calendar: vm.calendar
                    });
                    $uibModalInstance.dismiss('cancel');
                } else {
                    vm.logError = true;
                }
            } else {
                $rootScope.$broadcast('copy-calendar', {
                    calendar: vm.calendar
                });
                $uibModalInstance.dismiss('cancel');
            }
        };

        vm.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

        vm.editor = {};
        vm.editor.isEnable = false;
        vm.frequency = {};
        vm.editor.frequencyType = 'INCLUDE';

        vm.calendar.includesFrequency = [];
        vm.calendar.excludesFrequency = [];
        if (vm.calendar.includes || vm.calendar.excludes) {
            convertObjToArr(vm.calendar);
        }
        if (vm.calendar && vm.calendar.type) {
            vm.oldType = angular.copy(vm.calendar.type)
        }
        vm.frequencyList = [];

        vm.getCategories = function () {
            if (!vm.cateogries || vm.cateogries.length == 0)
                CalendarService.getCalendarCategories({jobschedulerId: vm.schedulerIds.selected}).then(function (res) {
                    vm.categories = res.categories;
                });
        };


        function frequencyToString(period) {
            var str = '';
            if (period.months && angular.isArray(period.months)) {
                str = RuntimeService.getMonths(period.months);
            }
            if (period.tab === 'weekDays') {
                if (str) {
                    return RuntimeService.getWeekDays(period.days) + ' on ' + str;
                } else {
                    return RuntimeService.getWeekDays(period.days);
                }
            } else if (period.tab === 'specificWeekDays') {
                if (str) {
                    return RuntimeService.getSpecificDay(period.which) + ' ' + period.specificWeekDay + ' of ' + str;
                } else {
                    return RuntimeService.getSpecificDay(period.which) + ' ' + period.specificWeekDay + ' of month';
                }
            } else if (period.tab === 'specificDays') {
                str = 'On ';
                if (period.dates)
                    angular.forEach(period.dates.sort(), function (date, index) {
                        str = str + moment(date).format(vm.dataFormat.toUpperCase());
                        if (index != period.dates.length - 1) {
                            str = str + ', ';
                        }
                    });
                return str;
            } else if (period.tab === 'monthDays') {
                if (period.isUltimos !== 'months') {
                    if (str) {
                        return '- ' + RuntimeService.getMonthDays(period.selectedMonthsU, true) + ' of ' + str;
                    } else {
                        return RuntimeService.getMonthDays(period.selectedMonthsU, true) + ' of ultimos';
                    }
                } else {
                    if (str) {
                        return RuntimeService.getMonthDays(period.selectedMonths) + ' of ' + str;
                    } else {
                        return RuntimeService.getMonthDays(period.selectedMonths) + ' of month';
                    }
                }
            } else if (period.tab === 'every') {
                if (period.interval == 1) {
                    str = period.interval + 'st ';
                } else if (period.interval == 2) {
                    str = period.interval + 'nd ';
                } else if (period.interval == 3) {
                    str = period.interval + 'rd ';
                } else {
                    str = period.interval + 'th ';
                }
                var repetitions = period.dateEntity === 'DAILY' ? 'day' : period.dateEntity === 'WEEKLY' ? 'week' : period.dateEntity === 'MONTHLY' ? 'month' : 'year';
                if (period.startingWith) {

                    return 'Every ' + str + repetitions + ' starting with day ' + moment(period.startingWith).format(vm.dataFormat.toUpperCase());
                } else {
                    return 'Every ' + str + repetitions;
                }

            } else if (period.tab == 'nationalHoliday') {
                if (period.nationalHoliday) {
                    str = moment(period.nationalHoliday[0]).format('YYYY') + ' national holidays ';
                    angular.forEach(period.nationalHoliday.sort(), function (date, index) {
                        str = str + moment(date).format(vm.dataFormat.toUpperCase());
                        if (index != period.nationalHoliday.length - 1) {
                            str = str + ', ';
                        }
                    });
                }
                return str;
            }
        }

        function groupByDates(arrayOfDates) {
            var datesObj = _.groupBy(arrayOfDates, function (el) {
                return moment(el).format('YYYY');
            });
            return _.toArray(datesObj);
        }

        function convertObjToArr(data) {
            var obj = {};
            if (data.includes && !_.isEmpty(data.includes)) {
                if (data.includes.months && data.includes.months.length > 0) {
                    angular.forEach(data.includes.months, function (month) {
                        if (month.weekdays && month.weekdays.length > 0) {
                            angular.forEach(month.weekdays, function (weekday) {
                                obj = {};
                                obj.tab = "weekDays";
                                obj.type = "INCLUDE";
                                obj.days = [];
                                angular.forEach(weekday.days, function (day) {
                                    obj.days.push(day.toString())
                                });
                                obj.months = [];
                                angular.forEach(month.months, function (mon) {
                                    obj.months.push(mon.toString())
                                });
                                obj.allMonth = month.months.length == 12;
                                obj.startingWithW = weekday.from;
                                obj.endOnW = weekday.to;
                                obj.all = weekday.days.length == 7;
                                obj.str = frequencyToString(obj);
                                vm.calendar.includesFrequency.push(obj);
                            });
                        }
                        if (month.monthdays && month.monthdays.length > 0) {

                            angular.forEach(month.monthdays, function (monthday) {

                                if (monthday.weeklyDays && monthday.weeklyDays.length > 0) {
                                    angular.forEach(monthday.weeklyDays, function (day) {
                                        obj = {};
                                        obj.type = "INCLUDE";
                                        obj.months = [];
                                        angular.forEach(month.months, function (mon) {
                                            obj.months.push(mon.toString())
                                        });
                                        obj.tab = "specificWeekDays";
                                        obj.specificWeekDay = getStringDay(day.day);
                                        obj.which = -day.weekOfMonth;
                                        obj.startingWithS = monthday.from;
                                        obj.endOnS = monthday.to;
                                        obj.str = frequencyToString(obj);
                                        vm.calendar.includesFrequency.push(obj);
                                    });
                                } else {
                                    obj = {};
                                    obj.type = "INCLUDE";
                                    obj.tab = "monthDays";
                                    obj.months = [];
                                    angular.forEach(month.months, function (mon) {
                                        obj.months.push(mon.toString())
                                    });
                                    obj.selectedMonths = [];
                                    angular.forEach(monthday.days, function (day) {
                                        obj.selectedMonths.push(day.toString())
                                    });
                                    obj.startingWithM = monthday.from;
                                    obj.endOnM = monthday.to;
                                    obj.isUltimos = 'months';
                                    obj.str = frequencyToString(obj);
                                    vm.calendar.includesFrequency.push(obj);
                                }

                            });

                        }
                        if (month.ultimos && month.ultimos.length > 0) {
                            angular.forEach(month.ultimos, function (ultimos) {
                                if (ultimos.weeklyDays && ultimos.weeklyDays.length > 0) {
                                    angular.forEach(ultimos.weeklyDays, function (day) {
                                        obj = {};
                                        obj.type = "INCLUDE";
                                        obj.months = [];
                                        angular.forEach(month.months, function (mon) {
                                            obj.months.push(mon.toString())
                                        });
                                        obj.tab = "specificWeekDays";
                                        obj.specificWeekDay = getStringDay(day.day);
                                        obj.which = -day.weekOfMonth;
                                        obj.startingWithS = ultimos.from;
                                        obj.endOnS = ultimos.to;
                                        obj.str = frequencyToString(obj);
                                        vm.calendar.includesFrequency.push(obj);
                                    });
                                } else {
                                    obj = {};
                                    obj.type = "INCLUDE";
                                    obj.tab = "monthDays";
                                    obj.months = [];
                                    angular.forEach(month.months, function (mon) {
                                        obj.months.push(mon.toString())
                                    });
                                    obj.selectedMonthsU = [];
                                    angular.forEach(ultimos.days, function (day) {
                                        obj.selectedMonthsU.push(day.toString())
                                    });
                                    obj.startingWithM = ultimos.from;
                                    obj.endOnM = ultimos.to;
                                    obj.isUltimos = 'ultimos';
                                    obj.str = frequencyToString(obj);
                                    vm.calendar.includesFrequency.push(obj);
                                }
                            });

                        }
                    });
                }
                if (data.includes.dates && data.includes.dates.length > 0) {
                    obj = {};
                    obj.tab = "specificDays";
                    obj.type = "INCLUDE";
                    obj.dates = [];
                    angular.forEach(data.includes.dates, function (date) {
                        obj.dates.push(date);
                    });
                    obj.str = frequencyToString(obj);
                    vm.calendar.includesFrequency.push(obj);

                }
                if (data.includes.weekdays && data.includes.weekdays.length > 0) {
                    angular.forEach(data.includes.weekdays, function (weekday) {
                        obj = {};
                        obj.tab = "weekDays";
                        obj.type = "INCLUDE";
                        obj.days = [];
                        angular.forEach(weekday.days, function (day) {
                            obj.days.push(day.toString())
                        });
                        obj.startingWithW = weekday.from;
                        obj.endOnW = weekday.to;
                        obj.all = weekday.days.length == 7;
                        obj.str = frequencyToString(obj);
                        vm.calendar.includesFrequency.push(obj);
                    });
                }
                if (data.includes.monthdays && data.includes.monthdays.length > 0) {
                    angular.forEach(data.includes.monthdays, function (monthday) {
                        if (monthday.weeklyDays && monthday.weeklyDays.length > 0) {

                            angular.forEach(monthday.weeklyDays, function (day) {
                                obj = {};
                                obj.type = "INCLUDE";
                                obj.tab = "specificWeekDays";
                                obj.specificWeekDay = getStringDay(day.day);
                                obj.which = day.weekOfMonth;

                                obj.startingWithS = monthday.from;
                                obj.endOnS = monthday.to;
                                obj.str = frequencyToString(obj);
                                vm.calendar.includesFrequency.push(obj);

                            });
                        } else {
                            obj = {};
                            obj.type = "INCLUDE";
                            obj.tab = "monthDays";
                            obj.selectedMonths = [];
                            angular.forEach(monthday.days, function (day) {
                                obj.selectedMonths.push(day.toString())
                            });
                            obj.isUltimos = 'months';
                            obj.startingWithM = monthday.from;
                            obj.endOnM = monthday.to;
                            obj.str = frequencyToString(obj);
                            vm.calendar.includesFrequency.push(obj);
                        }

                    });
                }
                if (data.includes.ultimos && data.includes.ultimos.length > 0) {
                    angular.forEach(data.includes.ultimos, function (ultimos) {
                        if (ultimos.weeklyDays && ultimos.weeklyDays.length > 0) {
                            angular.forEach(ultimos.weeklyDays, function (day) {
                                obj = {};
                                obj.type = "INCLUDE";
                                obj.tab = "specificWeekDays";
                                obj.specificWeekDay = getStringDay(day.day);
                                obj.which = -day.weekOfMonth;
                                obj.startingWithS = ultimos.from;
                                obj.endOnS = ultimos.to;
                                obj.str = frequencyToString(obj);
                                vm.calendar.includesFrequency.push(obj);
                            });
                        } else {
                            obj = {};
                            obj.type = "INCLUDE";
                            obj.tab = "monthDays";
                            obj.selectedMonthsU = [];
                            angular.forEach(ultimos.days, function (day) {
                                obj.selectedMonthsU.push(day.toString())
                            });
                            obj.isUltimos = 'ultimos';
                            obj.startingWithM = ultimos.from;
                            obj.endOnM = ultimos.to;
                            obj.str = frequencyToString(obj);
                            vm.calendar.includesFrequency.push(obj);
                        }
                    });
                }
                if (data.includes.holidays && data.includes.holidays.length > 0) {
                    let arr = groupByDates(data.includes.holidays[0].dates);
                    angular.forEach(arr, function (holidays) {
                        obj = {};
                        obj.tab = "nationalHoliday";
                        obj.type = "INCLUDE";
                        obj.nationalHoliday = holidays;
                        obj.str = frequencyToString(obj);
                        vm.calendar.includesFrequency.push(obj);
                    });
                }
                if (data.includes.repetitions && data.includes.repetitions.length > 0) {
                    angular.forEach(data.includes.repetitions, function (value) {
                        obj = {};
                        obj.tab = "every";
                        obj.type = "INCLUDE";
                        obj.dateEntity = value.repetition;
                        obj.interval = value.step;
                        obj.startingWith = value.from;
                        obj.endOn = value.to;
                        if (value.from)
                            obj.startingWith = value.from;
                        obj.str = frequencyToString(obj);
                        vm.calendar.includesFrequency.push(obj);
                    });
                }
            }
            if (data.excludes && !_.isEmpty(data.excludes)) {
                if (data.excludes.months && data.excludes.months.length > 0) {
                    angular.forEach(data.excludes.months, function (month) {
                        if (month.weekdays && month.weekdays.length > 0) {
                            angular.forEach(month.weekdays, function (weekday) {
                                obj = {};
                                obj.tab = "weekDays";
                                obj.type = "EXCLUDE";
                                obj.days = [];
                                angular.forEach(weekday.days, function (day) {
                                    obj.days.push(day.toString())
                                });
                                obj.months = [];
                                angular.forEach(month.months, function (mon) {
                                    obj.months.push(mon.toString())
                                });
                                obj.allMonth = month.months.length == 12;
                                obj.startingWithW = weekday.from;
                                obj.endOnW = weekday.to;
                                obj.all = weekday.days.length == 7;
                                obj.str = frequencyToString(obj);
                                vm.calendar.excludesFrequency.push(obj);
                            });
                        }
                        if (month.monthdays && month.monthdays.length > 0) {
                            angular.forEach(month.monthdays, function (monthday) {
                                if (monthday.weeklyDays && monthday.weeklyDays.length > 0) {
                                    angular.forEach(monthday.weeklyDays, function (day) {
                                        obj = {};
                                        obj.type = "INCLUDE";
                                        obj.months = [];
                                        angular.forEach(month.months, function (mon) {
                                            obj.months.push(mon.toString())
                                        });
                                        obj.tab = "specificWeekDays";
                                        obj.specificWeekDay = getStringDay(day.day);
                                        obj.which = -day.weekOfMonth;
                                        obj.startingWithS = monthday.from;
                                        obj.endOnS = monthday.to;
                                        obj.str = frequencyToString(obj);
                                        vm.calendar.excludesFrequency.push(obj);
                                    });
                                } else {
                                    obj = {};
                                    obj.type = "INCLUDE";
                                    obj.tab = "monthDays";
                                    obj.months = [];
                                    angular.forEach(month.months, function (mon) {
                                        obj.months.push(mon.toString())
                                    });
                                    obj.selectedMonths = [];
                                    angular.forEach(monthday.days, function (day) {
                                        obj.selectedMonths.push(day.toString())
                                    });
                                    obj.startingWithM = monthday.from;
                                    obj.endOnM = monthday.to;
                                    obj.isUltimos = 'months';
                                    obj.str = frequencyToString(obj);
                                    vm.calendar.excludesFrequency.push(obj);
                                }
                            });

                        }
                        if (month.ultimos && month.ultimos.length > 0) {
                            angular.forEach(month.ultimos, function (ultimos) {
                                if (ultimos.weeklyDays && ultimos.weeklyDays.length > 0) {
                                    angular.forEach(ultimos.weeklyDays, function (day) {
                                        obj = {};
                                        obj.type = "INCLUDE";
                                        obj.months = [];
                                        angular.forEach(month.months, function (mon) {
                                            obj.months.push(mon.toString())
                                        });
                                        obj.tab = "specificWeekDays";
                                        obj.specificWeekDay = getStringDay(day.day);
                                        obj.which = -day.weekOfMonth;
                                        obj.startingWithS = ultimos.from;
                                        obj.endOnS = ultimos.to;
                                        obj.str = frequencyToString(obj);
                                        vm.calendar.excludesFrequency.push(obj);
                                    });
                                } else {
                                    obj = {};
                                    obj.type = "INCLUDE";
                                    obj.tab = "monthDays";
                                    obj.months = [];
                                    angular.forEach(month.months, function (mon) {
                                        obj.months.push(mon.toString())
                                    });

                                    obj.selectedMonthsU = [];
                                    angular.forEach(ultimos.days, function (day) {
                                        obj.selectedMonthsU.push(day.toString())
                                    });
                                    obj.isUltimos = 'ultimos';
                                    obj.startingWithM = ultimos.from;
                                    obj.endOnM = ultimos.to;
                                    obj.str = frequencyToString(obj);
                                    vm.calendar.excludesFrequency.push(obj);
                                }

                            });

                        }
                    });
                }
                if (data.excludes.dates && data.excludes.dates.length > 0) {
                    obj = {};
                    obj.tab = "specificDays";
                    obj.type = "EXCLUDE";
                    obj.dates = [];
                    angular.forEach(data.excludes.dates, function (date) {
                        obj.dates.push(date);
                    });
                    obj.str = frequencyToString(obj);
                    vm.calendar.excludesFrequency.push(obj);

                }
                if (data.excludes.weekdays && data.excludes.weekdays.length > 0) {
                    angular.forEach(data.excludes.weekdays, function (weekday) {
                        obj = {};
                        obj.tab = "weekDays";
                        obj.type = "EXCLUDE";
                        obj.days = [];
                        angular.forEach(weekday.days, function (day) {
                            obj.days.push(day.toString())
                        });
                        obj.all = weekday.days.length == 7;
                        obj.startingWithW = weekday.from;
                        obj.endOnW = weekday.to;
                        obj.str = frequencyToString(obj);
                        vm.calendar.excludesFrequency.push(obj);
                    });

                }
                if (data.excludes.monthdays && data.excludes.monthdays.length > 0) {
                    angular.forEach(data.excludes.monthdays, function (monthday) {

                        if (monthday.weeklyDays && monthday.weeklyDays.length > 0) {
                            angular.forEach(monthday.weeklyDays, function (day) {
                                obj = {};
                                obj.type = "EXCLUDE";
                                obj.tab = "specificWeekDays";
                                obj.specificWeekDay = getStringDay(day.day);
                                obj.which = day.weekOfMonth;
                                obj.startingWithS = monthday.from;
                                obj.endOnS = monthday.to;
                            });
                        } else {
                            obj = {};
                            obj.type = "EXCLUDE";
                            obj.tab = "monthDays";
                            obj.selectedMonths = [];
                            angular.forEach(monthday.days, function (day) {
                                obj.selectedMonths.push(day.toString())
                            });
                            obj.isUltimos = 'months';
                            obj.startingWithM = monthday.from;
                            obj.endOnM = monthday.to;
                        }

                        obj.str = frequencyToString(obj);
                        vm.calendar.excludesFrequency.push(obj);
                    });
                }
                if (data.excludes.ultimos && data.excludes.ultimos.length > 0) {
                    angular.forEach(data.excludes.ultimos, function (ultimos) {

                        if (ultimos.weeklyDays && ultimos.weeklyDays.length > 0) {
                            angular.forEach(ultimos.weeklyDays, function (day) {
                                obj = {};
                                obj.type = "EXCLUDE";
                                obj.tab = "specificWeekDays";
                                obj.specificWeekDay = getStringDay(day.day);
                                obj.which = -day.weekOfMonth;
                                obj.startingWithS = ultimos.from;
                                obj.endOnS = ultimos.to;
                                obj.str = frequencyToString(obj);
                                vm.calendar.excludesFrequency.push(obj);
                            });
                        } else {
                            obj = {};
                            obj.type = "EXCLUDE";
                            obj.tab = "monthDays";
                            obj.selectedMonthsU = [];
                            angular.forEach(ultimos.days, function (day) {
                                obj.selectedMonthsU.push(day.toString())
                            });
                            obj.isUltimos = 'ultimos';
                            obj.startingWithM = ultimos.from;
                            obj.endOnM = ultimos.to;
                            obj.str = frequencyToString(obj);
                            vm.calendar.excludesFrequency.push(obj);
                        }

                    });
                }
                if (data.excludes.holidays && data.excludes.holidays.length > 0) {
                    let arr = groupByDates(data.excludes.holidays[0].dates);

                    angular.forEach(arr, function (holidays) {
                        obj = {};
                        obj.tab = "nationalHoliday";
                        obj.type = "EXCLUDE";
                        obj.nationalHoliday = holidays;
                        obj.str = frequencyToString(obj);
                        vm.calendar.excludesFrequency.push(obj);
                    });
                }
                if (data.excludes.repetitions && data.excludes.repetitions.length > 0) {
                    angular.forEach(data.excludes.repetitions, function (value) {
                        obj = {};
                        obj.tab = "every";
                        obj.type = "EXCLUDE";
                        obj.dateEntity = value.repetition;
                        obj.interval = value.step;
                        obj.startingWith = value.from;
                        obj.endOn = value.to;
                        if (value.from)
                            obj.startingWith = value.from;
                        obj.str = frequencyToString(obj);
                        vm.calendar.excludesFrequency.push(obj);
                    });
                }
            }
        }


        function generateCalendarAllObj() {
            var obj = {};
            if (vm.calendar.includesFrequency.length > 0) {
                obj.includes = {};
                angular.forEach(vm.calendar.includesFrequency, function (data) {
                    obj = RuntimeService.generateCalendarObj(data, obj);
                });
            }
            if (vm.calendar.excludesFrequency.length > 0) {
                obj.excludes = {};
                angular.forEach(vm.calendar.excludesFrequency, function (data) {
                    obj = RuntimeService.generateCalendarObj(data, obj);
                });
            }
            return obj;
        }

        function reloadCalendarView() {
            setTimeout(function () {
                $rootScope.$broadcast("calendar.refreshView")
            }, 100)
        }

        vm.showYearView = function () {
            vm.editor.showYearView = true;
            if (vm.editor.frequencyType == 'INCLUDE' && vm.calendar.includesFrequency.length > 0) {
                vm.frequencyList = vm.calendar.includesFrequency;
                if (vm.calendar.excludesFrequency.length > 0) {
                    vm.excludeFrequencyList = vm.calendar.excludesFrequency;
                }
            } else if (vm.editor.frequencyType == 'EXCLUDE' && vm.calendar.excludesFrequency.length > 0) {
                vm.frequencyList = vm.calendar.excludesFrequency;
            }

            $('#frequency-editor').modal({show: true});
            $('.fade-modal').css('opacity', '0.85');
            $rootScope.$broadcast('frequency-editor', {
                frequency: {
                    editor: vm.editor,
                    calendar: vm.calendar,
                    frequency: vm.frequency,
                    frequencyList: vm.frequencyList,
                    excludeFrequencyList: vm.excludeFrequencyList,
                    flag: true
                }
            });
            reloadCalendarView();
        };

        vm.createNewFrequency = function () {
            vm.editor.create = true;
            vm.editor.update = false;
            vm.editor.showYearView = false;
            vm.frequencyList = [];
            vm.frequency = {};
            vm.frequency.tab = 'weekDays';
            vm.frequency.dateEntity = 'DAILY';
            vm.frequency.year = new Date().getFullYear();
            vm.isRuntimeEdit = false;
            vm.holidayList = [];
            vm.frequency.isUltimos = 'months';
            $('#frequency-editor').modal({show: true});

            $('.fade-modal').css('opacity', '0.85');
            if (vm.editor.frequencyType == 'INCLUDE' && vm.calendar.includesFrequency.length > 0) {
                vm.frequencyList = vm.calendar.includesFrequency;
                if (vm.calendar.excludesFrequency.length > 0) {
                    vm.excludeFrequencyList = vm.calendar.excludesFrequency;
                }
            } else if (vm.editor.frequencyType == 'EXCLUDE' && vm.calendar.excludesFrequency.length > 0) {
                vm.frequencyList = vm.calendar.excludesFrequency;
            }
            $rootScope.$broadcast('frequency-editor', {
                frequency: {
                    editor: vm.editor,
                    frequency: vm.frequency,
                    frequencyList: vm.frequencyList,
                    excludeFrequencyList: vm.excludeFrequencyList,
                    calendar: vm.calendar
                }
            });

        };

        function getStringDay(day) {
            return day == 0 ? "sunday" : day == 1 ? "monday" : day == 2 ? "tuesday" : day == 3 ? "wednesday" : day == 4 ? "thursday" : day == 5 ? "friday" : "saturday";
        }

        vm.showCalendar = function (data) {
            vm.editor.showYearView = true;
            $('#frequency-editor').modal({show: true});
            $('.fade-modal').css('opacity', '0.85');
            if (vm.editor.frequencyType == 'INCLUDE' && vm.calendar.includesFrequency.length > 0) {
                vm.frequencyList = vm.calendar.includesFrequency;
                if (vm.calendar.excludesFrequency.length > 0) {
                    vm.excludeFrequencyList = vm.calendar.excludesFrequency;
                }
            } else if (vm.editor.frequencyType == 'EXCLUDE' && vm.calendar.excludesFrequency.length > 0) {
                vm.frequencyList = vm.calendar.excludesFrequency;
            }
            $rootScope.$broadcast('frequency-editor', {
                frequency: {
                    editor: vm.editor,
                    frequency: vm.frequency,
                    frequencyList: vm.frequencyList,
                    excludeFrequencyList: vm.excludeFrequencyList,
                    calendar: vm.calendar,
                    data: data,
                    flag: true
                }
            });
            reloadCalendarView();
        };

        vm.updateFrequency = function (data) {
            vm.editor.hidePervious = true;
            vm.editor.showYearView = false;
            vm.editor.create = false;
            vm.editor.update = true;
            vm.frequencyList = [];
            vm.isRuntimeEdit = true;
            vm.temp = angular.copy(data);
            vm.frequency = angular.copy(data);
            $('#frequency-editor').modal({show: true});
            $('.fade-modal').css('opacity', '0.85');
            if (vm.editor.frequencyType == 'INCLUDE' && vm.calendar.includesFrequency.length > 0) {
                vm.frequencyList = vm.calendar.includesFrequency;
                if (vm.calendar.excludesFrequency.length > 0) {
                    vm.excludeFrequencyList = vm.calendar.excludesFrequency;
                }
            } else if (vm.editor.frequencyType == 'EXCLUDE' && vm.calendar.excludesFrequency.length > 0) {
                vm.frequencyList = vm.calendar.excludesFrequency;
            }
            $rootScope.$broadcast('frequency-editor', {
                frequency: {
                    editor: vm.editor,
                    temp: vm.temp,
                    frequency: vm.frequency,
                    frequencyList: vm.frequencyList,
                    excludeFrequencyList: vm.excludeFrequencyList,
                    calendar: vm.calendar
                }
            });
            reloadCalendarView();
        };

        vm.removeFrequency = function (index) {
            if (vm.editor.frequencyType == 'INCLUDE') {
                vm.calendar.includesFrequency.splice(index, 1);
            } else {
                vm.calendar.excludesFrequency.splice(index, 1)
            }
        };

        $scope.$on('save-frequency', function (event, data) {
            vm.editor = angular.copy(data.editor);
            vm.frequency = angular.copy(data.frequency);
            vm.frequencyList = angular.copy(data.frequencyList);
            vm.calendar = angular.copy(data.calendar);
        });
    }

    ClientLogCtrl.$inject = ['$scope', '$window', '$interval'];

    function ClientLogCtrl($scope, $window, $interval) {
        let interval = $interval(function () {
            $scope.clientLogs = JSON.parse($window.localStorage.clientLogs);
        }, 500);
        $scope.$on('$destroy', function () {
            $interval.cancel(interval);
        });
    }

    CalendarAssignDialogCtrl.$inject = ['$scope', '$rootScope', 'ResourceService', 'CalendarService', 'orderByFilter'];

    function CalendarAssignDialogCtrl($scope, $rootScope, ResourceService, CalendarService, orderBy) {
        const vm = $scope;
        vm.filter_tree = {};
        vm.filterTree1 = [];
        vm.filter = {};
        vm.object = {};
        var obj = {};

        vm.expanding_property = {
            field: "name"
        };

        function loadTree() {
            ResourceService.tree({
                jobschedulerId: vm.schedulerIds.selected,
                compact: true,
                types: vm.filter.type === 'WORKING_DAYS' ? ['WORKINGDAYSCALENDAR'] : ['NONWORKINGDAYSCALENDAR']
            }).then(function (res) {
                vm.filterTree1 = res.folders;
                setTimeout(function () {
                    if (vm.filterTree1 && vm.filterTree1.length > 0) {
                        if (vm.filterTree1[0].folders && vm.filterTree1[0].folders.length > 0) {
                            vm.filterTree1[0].folders = orderBy(vm.filterTree1[0].folders, 'name');
                        }
                        vm.treeExpand(vm.filterTree1[0]);
                    }
                }, 100);
            }, function () {
            });
        }

        $scope.$on('calendar-editor', function (event, calendar) {
            vm.filter = {};
            vm.object.calendars = [];
            vm.filter.type = 'WORKING_DAYS';
            obj = {};
            if (calendar.data == 'holiday') {
                vm.holiday = calendar.data;
                vm.filter.type = 'NON_WORKING_DAYS';
            } else {
                vm.holiday = undefined;
            }
            vm.calendars = calendar.calendar || [];
            if (vm.calendars.length > 0)
                vm.object.calendars = angular.copy(vm.calendars);
            loadTree();
        });

        vm.treeHandler1 = function (data) {
            if (data.expanded) {
                data.folders = orderBy(data.folders, 'name');
            }
        };

        vm.treeExpand = function (data) {
            data.expanded = !data.expanded;
            if (data.expanded) {
                data.calendars = [];
                var obj = {};
                obj.jobschedulerId = vm.schedulerIds.selected;
                obj.compact = true;
                obj.type = vm.filter.type;
                obj.folders = [{folder: data.path, recursive: false}];
                CalendarService.getListOfCalendars(obj).then(function (res) {
                    data.calendars = res.calendars
                });

            } else {
                data.calendars = [];
            }
        };
        vm.addObjectPaths = function () {
            if (vm.holiday) {
                $rootScope.$broadcast('save-holiday-calendar', {
                    holidayCalendar: vm.calendars
                });
            } else {
                $rootScope.$broadcast('save-calendar', {
                    selectedCalendar: vm.calendars
                });
            }
            $('#calendar-editor').modal('hide');
        };


        vm.cancel = function () {
            $('#calendar-editor').modal('hide');
        };

        var watcher = $scope.$watchCollection('object.calendars', function (newNames) {
            if (newNames && newNames.length > 0) {
                vm.calendars = newNames;
            }
        });

        $scope.$on('$destroy', function () {
            watcher();
        });
    }

    AddRestrictionDialogCtrl.$inject = ['$scope', '$rootScope', 'gettextCatalog', 'RuntimeService'];

    function AddRestrictionDialogCtrl($scope, $rootScope, gettextCatalog, RuntimeService) {
        const vm = $scope;
        vm.tempItems = [];
        vm.editor = {};
        vm.editor.isEnable = false;
        vm.calendar = {};
        vm.changeFrequency = function (str) {
            vm.frequency.tab = str;
            if (str === 'specificDays') {
                if ($('#calendar') && $('#calendar').data('calendar')) {

                } else {
                    $('#calendar').calendar({
                        language: localStorage.$SOS$LANG,
                        clickDay: (e) => {
                            selectDate(e.date);
                        }
                    });
                }
                $('#calendar').data('calendar').setDataSource(vm.tempItems);
            }
        };

        function selectDate(date) {
            let planData = {
                startDate: date,
                endDate: date,
                color: 'blue'
            };
            let flag = false, x = 0;
            for (let i = 0; i < vm.tempItems.length; i++) {
                if ((new Date(vm.tempItems[i].startDate).setHours(0, 0, 0, 0) == new Date(date).setHours(0, 0, 0, 0))) {
                    flag = true;
                    x = i;
                    break;
                }
            }
            if (!flag) {
                vm.tempItems.push(planData);
            } else {
                vm.tempItems.splice(x, 1);
            }
            vm.editor.isEnable = vm.tempItems.length > 0;
            $('#calendar').data('calendar').setDataSource(vm.tempItems);
        }

        function convertStringToDate(date) {
            if (typeof date === 'string') {
                return moment(date);
            } else {
                return date
            }
        }


        function getDateFormat() {
            let dataFormat = vm.userPreferences.dateFormat || 'DD.MM.YYYY HH:mm:ss';
            if (dataFormat.match('HH:mm')) {
                dataFormat = dataFormat.replace('HH:mm', '');
            } else if (dataFormat.match('hh:mm')) {
                dataFormat = dataFormat.replace('hh:mm', '');
            }

            if (dataFormat.match(':ss')) {
                dataFormat = dataFormat.replace(':ss', '');
            }
            if (dataFormat.match('A')) {
                dataFormat = dataFormat.replace('A', '');
            }
            if (dataFormat.match('|')) {
                dataFormat = dataFormat.replace('|', '');
            }
            dataFormat = dataFormat.replace('YY', 'yy');
            dataFormat = dataFormat.replace('YY', 'yy');
            dataFormat = dataFormat.replace('D', 'd');
            dataFormat = dataFormat.replace('D', 'd');
            vm.dataFormat = dataFormat.trim();
        }

        getDateFormat();

        var selectedMonths = [], selectedMonthsU = [];

        function generateFrequencyObj() {
            vm.tempItems = [];
            for (let i = 0; i < vm.calendar.frequencyList.length; i++) {
                if (vm.calendar.frequencyList[i].tab == 'weekDays') {
                    vm.frequency.days = angular.copy(vm.calendar.frequencyList[i].days);
                } else if (vm.calendar.frequencyList[i].tab == 'specificDays') {
                    angular.forEach(vm.calendar.frequencyList[i].dates, function (date) {
                        vm.tempItems.push({
                            startDate: convertStringToDate(date),
                            endDate: convertStringToDate(date),
                            color: 'blue'
                        });
                    });
                } else if (vm.calendar.frequencyList[i].tab == 'monthDays') {
                    if (vm.calendar.frequencyList[i].isUltimos == 'months')
                        vm.frequency.selectedMonths = angular.copy(vm.calendar.frequencyList[i].selectedMonths);
                    else
                        vm.frequency.selectedMonthsU = angular.copy(vm.calendar.frequencyList[i].selectedMonthsU);
                    if (vm.calendar.frequencyList[i].isUltimos == 'months') {
                        selectedMonths = [];
                        angular.forEach(vm.calendar.frequencyList[i].selectedMonths, function (val) {
                            vm.selectMonthDays(val);
                        });
                    } else {
                        selectedMonthsU = [];
                        angular.forEach(vm.calendar.frequencyList[i].selectedMonthsU, function (val) {
                            vm.selectMonthDaysU(val);
                        });
                    }
                }
            }
        }

        vm.$on('restriction-frequency-editor', function (event, data) {
            vm.calendarTitle = new Date().getFullYear();
            vm.tempItems = [];
            selectedMonths = [];
            selectedMonthsU = [];
            vm.calendar = angular.copy(data.calendar);
            if (!vm.calendar.frequencyList) {
                vm.calendar.frequencyList = [];
            }
            vm.temp = data.updateFrequency;
            if (vm.temp && !_.isEmpty(vm.temp)) {
                vm.editor.create = false;
                vm.isRuntimeEdit = true;
                vm.frequency = angular.copy(vm.temp);
                for (let i = 0; i < vm.calendar.frequencyList.length; i++) {
                    if (vm.calendar.frequencyList[i] == vm.temp || angular.equals(vm.temp, vm.calendar.frequencyList[i])) {
                        if (vm.calendar.frequencyList[i].tab == 'monthDays') {
                            if (vm.calendar.frequencyList[i].isUltimos === 'months') {
                                vm.frequency.selectedMonths = angular.copy(vm.calendar.frequencyList[i].selectedMonths);
                            } else {
                                vm.frequency.selectedMonthsU = angular.copy(vm.calendar.frequencyList[i].selectedMonthsU);
                            }
                            if (vm.calendar.frequencyList[i].isUltimos === 'months') {
                                selectedMonths = [];
                                angular.forEach(vm.calendar.frequencyList[i].selectedMonths, function (val) {
                                    vm.selectMonthDays(val);
                                });
                            } else {
                                selectedMonthsU = [];
                                angular.forEach(vm.calendar.frequencyList[i].selectedMonthsU, function (val) {
                                    vm.selectMonthDaysU(val);
                                });
                            }
                        } else if (vm.calendar.frequencyList[i].tab === 'specificDays') {
                            angular.forEach(vm.calendar.frequencyList[i].dates, function (date) {
                                vm.tempItems.push({
                                    startDate: convertStringToDate(date),
                                    endDate: convertStringToDate(date),
                                    color: 'blue'
                                });
                            });
                            if ($('#calendar') && $('#calendar').data('calendar')) {

                            } else {
                                $('#calendar').calendar({
                                    language: localStorage.$SOS$LANG,
                                    clickDay: (e) => {
                                        selectDate(e.date);
                                    }
                                });
                            }
                            $('#calendar').data('calendar').setDataSource(vm.tempItems);
                        }
                        break;
                    }
                }
            } else {
                vm.editor.create = true;
                vm.frequency = {};
                vm.frequency.tab = 'weekDays';
                vm.frequency.isUltimos = 'months';
                vm.frequency.dateEntity = 'DAILY';
                if (vm.calendar.frequencyList && vm.calendar.frequencyList.length > 0) {
                    generateFrequencyObj();
                }
            }

        });

        vm.selectMonthDays = function (value) {
            if (selectedMonths.indexOf(value) == -1) {
                selectedMonths.push(value);
            } else {
                selectedMonths.splice(selectedMonths.indexOf(value), 1);
            }
            vm.frequency.selectedMonths = angular.copy(selectedMonths);
            vm.frequency.selectedMonths.sort(RuntimeService.compareNumbers);
            vm.editor.isEnable = selectedMonths.length > 0;
        };

        vm.getSelectedMonthDays = function (value) {
            if (selectedMonths.indexOf(value) != -1)
                return true;
        };

        vm.selectMonthDaysU = function (value) {
            if (selectedMonthsU.indexOf(value) == -1) {
                selectedMonthsU.push(value);
            } else {
                selectedMonthsU.splice(selectedMonthsU.indexOf(value), 1);
            }
            vm.frequency.selectedMonthsU = angular.copy(selectedMonthsU);
            vm.frequency.selectedMonthsU.sort(RuntimeService.compareNumbers);
            vm.editor.isEnable = selectedMonthsU.length > 0;
        };

        vm.getSelectedMonthDaysU = function (value) {
            if (selectedMonthsU.indexOf(value) != -1) {
                return true;
            }
        };

        var watcher1 = vm.$watchCollection('frequency', function (newNames) {
            if (newNames) {
                if (newNames.tab == 'monthDays') {
                    if (newNames.isUltimos != 'months') {
                        vm.str = gettextCatalog.getString('label.ultimos');
                    } else {
                        vm.str = gettextCatalog.getString('label.monthDays');
                    }
                } else {
                    if (newNames.tab == 'specificWeekDays') {
                        vm.str = gettextCatalog.getString('label.specificWeekDays');
                    } else if (newNames.tab == 'specificDays') {
                        vm.str = gettextCatalog.getString('label.specificDays');
                    } else if (newNames.tab == 'weekDays') {
                        vm.str = gettextCatalog.getString('tab.weekDays');
                    } else if (newNames.tab == 'every') {
                        vm.str = gettextCatalog.getString('tab.every');
                    } else if (newNames.tab == 'nationalHoliday') {
                        vm.str = gettextCatalog.getString('tab.nationalHoliday');
                    }
                }

                if (newNames.tab == 'specificWeekDays') {
                    vm.editor.isEnable = !!(newNames.specificWeekDay && newNames.which);
                } else if (newNames.tab == 'specificDays') {
                    vm.editor.isEnable = vm.tempItems.length > 0;
                } else if (newNames.tab == 'monthDays') {
                    if (newNames.isUltimos == 'months') {
                        vm.editor.isEnable = selectedMonths.length != 0;
                    } else {
                        vm.editor.isEnable = selectedMonthsU.length != 0;
                    }

                } else if (newNames.tab == 'every') {
                    vm.editor.isEnable = !!(newNames.interval && newNames.dateEntity);
                } else if (newNames.tab == 'weekDays') {
                    vm.editor.isEnable = !!(newNames.days && newNames.days.length > 0);
                }

            }
        });
        var watcher2 = vm.$watchCollection('frequency.days', function (newNames) {
            if (newNames) {
                vm.editor.isEnable = newNames.length > 0;
                vm.frequency.all = newNames.length == 7;
                vm.frequency.days.sort();
            }
        });

        vm.checkAllWeek = function () {
            if (vm.frequency.all) {
                vm.frequency.days = ["0", "1", "2", "3", "4", "5", "6"]
            } else {
                vm.frequency.days = []
            }
        };

        vm.addFrequency = function () {
            vm.frequency.str = frequencyToString(vm.frequency);
            var _temp = angular.copy(vm.frequency);
            var flag = false;

            if (vm.isRuntimeEdit) {
                vm.isRuntimeEdit = false;
                if (vm.calendar.frequencyList.length > 0) {
                    for (let i = 0; i < vm.calendar.frequencyList.length; i++) {
                        if (angular.equals(vm.calendar.frequencyList[i], vm.temp)) {
                            if (vm.frequency.tab === 'specificDays') {
                                vm.frequency.dates = [];
                                angular.forEach(vm.tempItems, function (date) {
                                    vm.frequency.dates.push(moment(date.startDate).format('YYYY-MM-DD'));
                                });
                                vm.frequency.str = frequencyToString(vm.frequency);
                            }
                            vm.calendar.frequencyList[i] = angular.copy(vm.frequency);
                            break;
                        }
                    }
                }
                vm.temp = {};
                if (vm.calendar.frequencyList && vm.calendar.frequencyList.length > 0) {
                    generateFrequencyObj();
                }
                vm.editor.isEnable = false;
                return;
            }
            if (vm.frequency.tab == 'specificDays') {
                vm.frequency.dates = [];
                angular.forEach(vm.tempItems, function (date) {
                    vm.frequency.dates.push(moment(date.startDate).format('YYYY-MM-DD'));
                });
                vm.frequency.str = frequencyToString(vm.frequency);
            }

            for (let i = 0; i < vm.calendar.frequencyList.length; i++) {
                if (angular.equals(vm.calendar.frequencyList[i], vm.frequency)) {
                    flag = true;
                    break;
                }
            }
            if (flag) {
                return;
            }

            if (vm.calendar.frequencyList.length > 0) {
                var flag1 = false;
                for (let i = 0; i < vm.calendar.frequencyList.length; i++) {
                    if (vm.frequency.tab === vm.calendar.frequencyList[i].tab) {
                        if (vm.frequency.tab === 'weekDays') {
                            if (vm.frequency.months) {
                                if (vm.frequency.months === vm.calendar.frequencyList[i].months || angular.equals(vm.calendar.frequencyList[i].months, vm.frequency.months)) {
                                    if (angular.equals(vm.calendar.frequencyList[i].days, vm.frequency.days)) {
                                        flag1 = true;
                                        break;
                                    }
                                    vm.calendar.frequencyList[i].days = angular.copy(vm.frequency.days);
                                    vm.calendar.frequencyList[i].startingWithW = angular.copy(vm.frequency.startingWithW);
                                    vm.calendar.frequencyList[i].endOnW = angular.copy(vm.frequency.endOnW);
                                    vm.calendar.frequencyList[i].str = angular.copy(vm.frequency.str);
                                    flag1 = true;
                                    break;
                                } else {
                                    if (vm.calendar.frequencyList[i].months)
                                        if (angular.equals(vm.calendar.frequencyList[i].days, vm.frequency.days)) {
                                            angular.forEach(vm.frequency.months, function (month) {
                                                if (vm.calendar.frequencyList[i].months.indexOf(month) == -1)
                                                    vm.calendar.frequencyList[i].months.push(month)
                                            });
                                            vm.calendar.frequencyList[i].str = angular.copy(vm.frequency.str);
                                            flag1 = true;
                                            break;
                                        }
                                }
                            } else {
                                if (!vm.calendar.frequencyList[i].months) {
                                    vm.calendar.frequencyList[i].days = angular.copy(vm.frequency.days);
                                    vm.calendar.frequencyList[i].startingWithM = angular.copy(vm.frequency.startingWithW);
                                    vm.calendar.frequencyList[i].endOnW = angular.copy(vm.frequency.endOnW);
                                    vm.calendar.frequencyList[i].str = angular.copy(vm.frequency.str);
                                    flag1 = true;
                                    break;
                                }
                            }
                        } else if (vm.frequency.tab === 'monthDays' && vm.frequency.isUltimos === 'months' && vm.calendar.frequencyList[i].isUltimos === 'months') {
                            if (vm.frequency.months) {
                                if (vm.frequency.months === vm.calendar.frequencyList[i].months || angular.equals(vm.calendar.frequencyList[i].months, vm.frequency.months)) {
                                    vm.calendar.frequencyList[i].selectedMonths = angular.copy(vm.frequency.selectedMonths);
                                    vm.calendar.frequencyList[i].startingWithM = angular.copy(vm.frequency.startingWithM);
                                    vm.calendar.frequencyList[i].endOnM = angular.copy(vm.frequency.endOnM);
                                    vm.calendar.frequencyList[i].str = angular.copy(vm.frequency.str);
                                    flag1 = true;
                                    break;
                                } else {
                                    if (vm.calendar.frequencyList[i].months)
                                        if (angular.equals(vm.calendar.frequencyList[i].selectedMonths, vm.frequency.selectedMonths)) {
                                            angular.forEach(vm.frequency.months, function (month) {
                                                if (vm.calendar.frequencyList[i].months.indexOf(month) == -1)
                                                    vm.calendar.frequencyList[i].months.push(month)
                                            });
                                            vm.calendar.frequencyList[i].str = angular.copy(vm.frequency.str);
                                            flag1 = true;
                                            break;
                                        }
                                }
                            } else {
                                if (!vm.calendar.frequencyList[i].months) {
                                    vm.calendar.frequencyList[i].selectedMonths = angular.copy(vm.frequency.selectedMonths);
                                    vm.calendar.frequencyList[i].startingWithM = angular.copy(vm.frequency.startingWithM);
                                    vm.calendar.frequencyList[i].endOnM = angular.copy(vm.frequency.endOnM);
                                    vm.calendar.frequencyList[i].str = angular.copy(vm.frequency.str);
                                    flag1 = true;
                                    break;
                                }
                            }
                        } else if (vm.frequency.tab === 'monthDays' && vm.frequency.isUltimos !== 'months' && vm.calendar.frequencyList[i].isUltimos !== 'months') {
                            if (vm.frequency.months) {
                                if (vm.frequency.months === vm.calendar.frequencyList[i].months || angular.equals(vm.calendar.frequencyList[i].months, vm.frequency.months)) {
                                    vm.calendar.frequencyList[i].selectedMonthsU = angular.copy(vm.frequency.selectedMonthsU);
                                    vm.calendar.frequencyList[i].startingWithM = angular.copy(vm.frequency.startingWithM);
                                    vm.calendar.frequencyList[i].endOnM = angular.copy(vm.frequency.endOnM);
                                    vm.calendar.frequencyList[i].str = angular.copy(vm.frequency.str);
                                    flag1 = true;
                                    break;
                                } else {
                                    if (vm.calendar.frequencyList[i].months)
                                        if (angular.equals(vm.calendar.frequencyList[i].selectedMonthsU, vm.frequency.selectedMonthsU)) {
                                            angular.forEach(vm.frequency.months, function (month) {
                                                if (vm.calendar.frequencyList[i].months.indexOf(month) == -1)
                                                    vm.calendar.frequencyList[i].months.push(month)
                                            });
                                            vm.calendar.frequencyList[i].str = angular.copy(vm.frequency.str);
                                            flag1 = true;
                                            break;
                                        }
                                }
                            } else {
                                if (!vm.calendar.frequencyList[i].months) {
                                    vm.calendar.frequencyList[i].selectedMonthsU = angular.copy(vm.frequency.selectedMonthsU);
                                    vm.calendar.frequencyList[i].startingWithM = angular.copy(vm.frequency.startingWithM);
                                    vm.calendar.frequencyList[i].endOnM = angular.copy(vm.frequency.endOnM);
                                    vm.calendar.frequencyList[i].str = angular.copy(vm.frequency.str);
                                    flag1 = true;
                                    break;
                                }
                            }
                        } else if (vm.frequency.tab === 'specificWeekDays') {
                            if (vm.frequency.months && vm.calendar.frequencyList[i].months) {
                                if (!angular.equals(vm.calendar.frequencyList[i].months, vm.frequency.months)) {
                                    if (angular.equals(vm.calendar.frequencyList[i].specificWeekDay, vm.frequency.specificWeekDay) && angular.equals(vm.calendar.frequencyList[i].which, vm.frequency.which)) {
                                        angular.forEach(vm.frequency.months, function (month) {
                                            if (vm.calendar.frequencyList[i].months.indexOf(month) == -1)
                                                vm.calendar.frequencyList[i].months.push(month);
                                        });
                                        vm.calendar.frequencyList[i].str = frequencyToString(vm.calendar.frequencyList[i]);
                                        flag1 = true;
                                        break;
                                    }
                                }
                            }
                        } else if (vm.frequency.tab === 'specificDays') {
                            vm.frequency.dates = [];
                            angular.forEach(vm.tempItems, function (date) {
                                vm.frequency.dates.push(moment(date.startDate).format('YYYY-MM-DD'));
                            });
                            vm.frequency.str = frequencyToString(vm.frequency);
                            vm.calendar.frequencyList[i].dates = angular.copy(vm.frequency.dates);
                            vm.calendar.frequencyList[i].str = angular.copy(vm.frequency.str);
                            flag1 = true;
                            break;
                        }
                    }
                }

                if (!flag1) {
                    if (vm.frequency.tab === 'specificDays') {
                        vm.frequency.dates = [];
                        angular.forEach(vm.tempItems, function (date) {
                            vm.frequency.dates.push(moment(date.startDate).format('YYYY-MM-DD'));
                        });
                        vm.frequency.str = frequencyToString(vm.frequency);
                    }
                    vm.frequency.type = vm.editor.frequencyType;
                    vm.calendar.frequencyList.push(angular.copy(vm.frequency));

                }
            } else {
                if (vm.frequency.tab === 'specificDays') {
                    vm.frequency.dates = [];
                    angular.forEach(vm.tempItems, function (date) {
                        vm.frequency.dates.push(moment(date.startDate).format('YYYY-MM-DD'));
                    });
                    vm.frequency.str = frequencyToString(vm.frequency);
                }
                vm.frequency.type = vm.editor.frequencyType;
                vm.calendar.frequencyList.push(angular.copy(vm.frequency));

            }
            vm.editor.isEnable = false;
        };

        vm.editFrequency = function (data) {
            vm.temp = angular.copy(data);
            vm.frequency = angular.copy(data);
            vm.isRuntimeEdit = true;
            if (vm.frequency.tab === 'monthDays') {
                if (vm.frequency.isUltimos === 'months') {
                    selectedMonths = [];
                    angular.forEach(data.selectedMonths, function (val) {
                        vm.selectMonthDays(val);
                    });
                } else {
                    selectedMonthsU = [];
                    angular.forEach(data.selectedMonthsU, function (val) {
                        vm.selectMonthDaysU(val);
                    });
                }
            } else if (vm.frequency.tab === 'specificDays') {
                vm.tempItems = [];
                angular.forEach(vm.frequency.dates, function (date) {
                    vm.tempItems.push({
                        startDate: convertStringToDate(date),
                        endDate: convertStringToDate(date),
                        color: 'blue'
                    });
                });
            }
        };

        vm.deleteFrequency = function (data, index) {
            vm.calendar.frequencyList.splice(index, 1);
            if (vm.calendar.frequencyList.length == 0) {
                var temp = angular.copy(vm.frequency);
                vm.frequency = {};
                vm.frequency.tab = temp.tab;
                vm.frequency.isUltimos = temp.isUltimos;
            }
            if (data.tab == 'specificDays') {
                vm.tempItems = [];

            }
        };

        function frequencyToString(period) {
            var str = '';
            if (period.months && angular.isArray(period.months)) {
                str = RuntimeService.getMonths(period.months);
            }
            if (period.tab == 'weekDays') {
                if (str) {
                    return RuntimeService.getWeekDays(period.days) + ' on ' + str;
                } else {
                    return RuntimeService.getWeekDays(period.days);
                }
            } else if (period.tab == 'specificWeekDays') {
                if (!angular.isArray(period.which)) {
                    if (str) {
                        return RuntimeService.getSpecificDay(period.which) + ' ' + period.specificWeekDay + ' of ' + str;
                    } else {
                        return RuntimeService.getSpecificDay(period.which) + ' ' + period.specificWeekDay + ' of month';
                    }
                } else {
                    let str1 = '';
                    angular.forEach(period.which, function (value, index) {
                        str1 = str1 + RuntimeService.getSpecificDay(value);
                        if (period.which.length - 1 != index) {
                            str1 = str1 + ', ';
                        }
                    });
                    if (str) {
                        return str1 + ' ' + period.specificWeekDay + ' of ' + str;
                    } else {
                        return str1 + ' ' + period.specificWeekDay + ' of month';
                    }
                }
            } else if (period.tab == 'specificDays') {
                str = 'On ';
                if (period.dates)
                    angular.forEach(period.dates.sort(), function (date, index) {
                        str = str + moment(date).format(vm.dataFormat.toUpperCase());
                        if (index != period.dates.length - 1) {
                            str = str + ', ';
                        }
                    });
                return str;
            } else if (period.tab == 'monthDays') {
                if (period.isUltimos != 'months') {
                    if (str) {
                        return '- ' + RuntimeService.getMonthDays(period.selectedMonthsU, true) + ' of ' + str;
                    } else {
                        return RuntimeService.getMonthDays(period.selectedMonthsU, true) + ' of ultimos';
                    }
                } else {
                    if (str) {
                        return RuntimeService.getMonthDays(period.selectedMonths) + ' of ' + str;
                    } else {
                        return RuntimeService.getMonthDays(period.selectedMonths) + ' of month';
                    }
                }
            } else if (period.tab == 'every') {
                if (period.interval == 1) {
                    str = period.interval + 'st ';
                } else if (period.interval == 2) {
                    str = period.interval + 'nd ';
                } else if (period.interval == 3) {
                    str = period.interval + 'rd ';
                } else {
                    str = period.interval + 'th ';
                }
                let repetitions = period.dateEntity == 'DAILY' ? 'day' : period.dateEntity == 'WEEKLY' ? 'week' : period.dateEntity == 'MONTHLY' ? 'month' : 'year';

                return 'Every ' + str + repetitions;
            }
        }

        vm.cancel = function () {
            vm.frequency = undefined;
            $('#restriction-editor').modal('hide');
            $('.fade-modal').css('opacity', 1);
        };

        vm.save = function (form1) {
            $rootScope.$broadcast('save-restriction-frequency', vm.calendar);
            if (form1) {
                form1.$setPristine();
                form1.$setUntouched();
            }
            vm.cancel();
        };

        $scope.$on('$destroy', function () {
            watcher1();
            watcher2();
        });
    }

    EditConditionDialogCtrl.$inject = ['$scope', '$uibModalInstance', 'JobService', 'ConditionService', 'JobChainService', 'orderByFilter', 'gettextCatalog', 'toasty'];

    function EditConditionDialogCtrl($scope, $uibModalInstance, JobService, ConditionService, JobChainService, orderBy, gettextCatalog, toasty) {
        const vm = $scope;
        vm.editor = {
            type: 'Incondition',
            eventType: 'create'
        };
        vm.strCommand = '';

        function init() {
            if (vm._job.inconditions && vm._job.inconditions.length > 0) {
                for (let i = 0; i < vm._job.inconditions.length; i++) {
                    vm.editor.jobStream = vm._job.inconditions[i].jobStream;
                    break;
                }
            }
            if (!vm.editor.jobStream && vm._job.outconditions && vm._job.outconditions.length > 0) {
                for (let i = 0; i < vm._job.outconditions.length; i++) {
                    vm.editor.jobStream = vm._job.outconditions[i].jobStream;
                    break;
                }
            }
            if (vm.editor.jobStream) {
                vm.edit = true;
            }

            vm.jobStreams = [];
            ConditionService.workflowTree({jobschedulerId: vm.schedulerIds.selected}).then(function (res) {
                if (res.jobStreamFolders) {
                    for (let i = 0; i < res.jobStreamFolders.length; i++) {
                        vm.jobStreams.push(res.jobStreamFolders[i].jobStream);
                        if ((!vm.editor.jobStream || vm.editor.jobStream === '') && !vm._jobStreamName) {
                            if (res.jobStreamFolders[i].folders.indexOf(vm._job.path1) > -1) {
                                vm.editor.jobStream = res.jobStreamFolders[i].jobStream;
                            }
                        }
                    }
                }
            });

            if (vm._jobStreamName) {
                vm.editor.jobStream = vm._jobStreamName;
            }
        }

        if (vm._job) {
            init();
        }

        function checkFileNameWithSpace(exp) {
            if (exp.match(/fileexist/)) {
                let arr = exp.split(' ');
                let _str = '';
                for (let i = 0; i < arr.length; i++) {
                    if (arr[i].match(/fileexist:/)) {
                        if (i + 1 < arr.length && !arr[i].match(/\.[0-9a-z]+$/i) && arr[i + 1].match(/\.[0-9a-z]+$/i)) {
                            _str = _str + arr[i] + '%20';
                        } else {
                            _str = _str + arr[i] + ' ';
                        }
                    } else {
                        _str = _str + arr[i] + ' ';
                    }
                }
                return _str.trim();
            } else {
                return exp.trim();
            }
        }

        $scope.ok = function () {
            if (vm._job) {
                for (let i = 0; i < vm._job.inconditions.length; i++) {
                    vm._job.inconditions[i].conditionExpression.expression = checkFileNameWithSpace(vm._job.inconditions[i].conditionExpression.expression);
                    vm._job.inconditions[i].jobStream = vm.editor.jobStream;
                    for (let j = 0; j < vm._job.inconditions[i].inconditionCommands.length; j++) {
                        if (!vm._job.inconditions[i].inconditionCommands[j].command || vm._job.inconditions[i].inconditionCommands[j].command == '') {
                            vm._job.inconditions[i].inconditionCommands[j].command = "startjob";
                            vm._job.inconditions[i].inconditionCommands[j].commandParam = "now";
                        }
                    }
                    if (vm._job.inconditions[i].inconditionCommands.length === 0) {
                        vm._job.inconditions[i].inconditionCommands.push({
                            command: "startjob",
                            commandParam: "now",
                            id: 0
                        });
                    }
                }
                for (let i = 0; i < vm._job.outconditions.length; i++) {
                    vm._job.outconditions[i].conditionExpression.expression = checkFileNameWithSpace(vm._job.outconditions[i].conditionExpression.expression);
                    vm._job.outconditions[i].jobStream = vm.editor.jobStream;
                    for (let j = 0; j < vm._job.outconditions[i].outconditionEvents.length; j++) {
                        if (!vm._job.outconditions[i].outconditionEvents[j].event || vm._job.outconditions[i].outconditionEvents[j].event == '') {
                            vm._job.outconditions[i].outconditionEvents.splice(j, 1);
                        }
                    }
                    if (vm._job.outconditions[i].outconditionEvents.length === 0) {
                        toasty.warning({
                            title: gettextCatalog.getString('message.outconditionWarning'),
                            timeout: 3000
                        });
                        return;
                    }
                }
            } else if (vm._expression && vm._expression.expression) {
                vm._expression.expression = checkFileNameWithSpace(vm._expression.expression);
            }

            $uibModalInstance.close('ok');
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.close = function (form) {
            vm.command = null;
            vm.event = null;
            $('#command-editor').modal('hide');
            vm._incondition = null;
            vm._outcondition = null;
            vm._index = null;
            if (form) {
                form.$setPristine();
                form.$setUntouched();
            }
        };

        $scope.close2 = function (form) {
            vm.condition = undefined;
            if (form) {
                form.$setPristine();
                form.$setUntouched();
            }
        };

        vm.updateCondition = function (condition, index) {

            vm.strCondition = 'edit';
            vm._index = index;
            vm.condition = angular.copy(condition);
            if (!vm.condition) {
                vm.strCondition = 'create';
                if (vm.editor.type === 'Incondition') {
                    vm.condition = {inconditionCommands: [], markExpression: true, skipOutCondition: false};
                    vm.addInconditionCommands(true);
                } else {
                    vm.condition = {
                        outconditionEvents: [],
                        outconditionDeleteEvents: [],
                        conditionExpression: {expression: 'rc:0'}
                    };
                    vm.addOutconditionEvents('create', vm._job.name);
                }
            } else {
                let arr = [];
                if (vm.condition.outconditionEvents) {
                    for (let i = 0; i < vm.condition.outconditionEvents.length; i++) {
                        if (vm.condition.outconditionEvents[i].command === 'delete') {
                            arr.push(vm.condition.outconditionEvents[i]);
                        }
                    }
                }
                vm.condition.outconditionDeleteEvents = arr;

            }
            setTimeout(function () {
                $('#expression-id').focus();
            }, 0)
        };

        vm.removeInCondition = function (index) {
            vm._job.inconditions.splice(index, 1);
        };

        vm.removeOutCondition = function (index) {
            vm._job.outconditions.splice(index, 1);
        };

        vm.addInconditionCommands = function (flag) {
            let param = {
                command: flag ? 'startjob' : '',
                commandParam: flag ? 'now' : '',
                id: 0
            };
            if (vm.condition) {
                vm.condition.inconditionCommands.push(param);
            } else if (vm._expression) {
                vm._expression.commands.push(param);
            }
        };

        vm.removeInconditionCommands = function (index) {
            if (vm.condition) {
                vm.condition.inconditionCommands.splice(index, 1);
            } else if (vm._expression) {
                vm._expression.commands.splice(index, 1);
            }
        };

        vm.addCommand = function (incondition) {
            vm.strCommand = 'create';
            vm._incondition = incondition;
            vm.event = undefined;
            vm.command = {};
            $('#command-editor').modal('show');
        };

        vm.editCommand = function (command, incondition, index) {
            vm.strCommand = 'edit';
            vm.event = undefined;
            vm._incondition = incondition;
            vm._index = index;
            vm.command = angular.copy(command);
            $('#command-editor').modal('show');
        };

        vm.removeCommand = function (commands, index) {
            commands.splice(index, 1);
        };

        function getJobName(name) {
            let evtName = name;
            if (/\(([^)]+)\)/i.test(name)) {
                evtName = evtName.replace('(', '_').replace(')', '_');
            }
            if (name.match(/./)) {
                evtName = evtName.replace('.', '_');
            }
            if (name.match(/#/)) {
                evtName = evtName.replace('#', '_');
            }
            return evtName;
        }


        vm.addOutconditionEvents = function (type, name) {
            let param = {
                event: name ? getJobName(name) : '',
                command: type,
                id: 0
            };
            if (vm.condition) {
                vm.condition.outconditionEvents.push(param);
            } else if (vm._expression) {
                vm._expression.events.push(param);
            }
        };

        vm.removeOutconditionEvents = function (condition) {
            if (vm.condition && vm.condition.outconditionEvents) {
                for (let i = 0; vm.condition.outconditionEvents.length; i++) {
                    if (angular.equals(vm.condition.outconditionEvents[i], condition)) {
                        vm.condition.outconditionEvents.splice(i, 1);
                        break;
                    }
                }
            } else if (vm._expression && vm._expression.events) {
                for (let i = 0; vm._expression.events.length; i++) {
                    if (angular.equals(vm._expression.events[i], condition)) {
                        vm._expression.events.splice(i, 1);
                        break;
                    }
                }
            }
        };

        vm.addEvent = function (outcondition, type) {
            vm._eventType = type;
            vm.strCommand = 'create';
            vm._outcondition = outcondition;
            vm.command = undefined;
            vm._index = undefined;
            vm.event = {command: type, id: 0};
            $('#command-editor').modal('show');
        };

        vm.editEvent = function (event, outcondition, index, type) {
            vm._eventType = type;
            vm.strCommand = 'edit';
            vm._outcondition = outcondition;
            vm._index = index;
            vm.event = angular.copy(event);
            $('#command-editor').modal('show');
        };

        vm.removeEvent = function (events, index, type) {
            vm._eventType = type;
            events.splice(index, 1);
        };

        vm.save = function (form) {
            if (vm.command && vm.command.command) {
                if (vm._index || vm._index == 0) {
                    for (let i = 0; i < vm._incondition.inconditionCommands.length; i++) {
                        if (vm._index == i) {
                            vm._incondition.inconditionCommands[i] = vm.command;
                            break;
                        }
                    }
                } else if (vm.strCommand == 'create') {
                    vm._incondition.inconditionCommands.push(vm.command);
                }
            } else if (vm.event && vm.event.event) {
                if (vm._index || vm._index == 0) {
                    for (let i = 0; i < vm._outcondition.outconditionEvents.length; i++) {
                        if (vm._index == i) {
                            vm._outcondition.outconditionEvents[i] = vm.event;
                            break;
                        }
                    }
                } else if (vm.strCommand == 'create') {
                    vm._outcondition.outconditionEvents.push(vm.event);
                }
            }
            $('#command-editor').modal('hide');
            vm._index = null;
            if (form) {
                form.$setPristine();
                form.$setUntouched();
            }
        };

        vm.save2 = function (form) {
            if (vm.condition && vm.condition.conditionExpression) {
                if (vm.editor.type === 'Incondition') {
                    if (vm._index || vm._index == 0) {
                        for (let i = 0; i < vm._job.inconditions.length; i++) {
                            if (vm._index == i) {
                                vm._job.inconditions[i] = vm.condition;
                                break;
                            }
                        }
                    } else if (vm.strCondition == 'create') {
                        vm.condition.id = 0;
                        vm._job.inconditions.push(vm.condition);
                    }
                } else {
                    if (vm._index || vm._index == 0) {
                        for (let i = 0; i < vm._job.outconditions.length; i++) {
                            if (vm._index == i) {
                                vm._job.outconditions[i] = vm.condition;
                                break;
                            }
                        }
                    } else if (vm.strCondition == 'create') {
                        vm.condition.id = 0;
                        vm._job.outconditions.push(vm.condition);
                    }
                }
            }
            vm.condition = null;
            if (form) {
                form.$setPristine();
                form.$setUntouched();
            }
        };

        vm.expressionEditor = function () {

            vm.expression = {type: vm.editor.type === 'Incondition' ? 'fileexist' : 'rc'};
            if (vm.condition) {
                if (!vm.condition.conditionExpression) {
                    vm.condition.conditionExpression = {expression: ''};
                }
                vm.expression.expression = angular.copy(vm.condition.conditionExpression.expression || '');
            } else if (vm._expression) {
                vm.expression.expression = angular.copy(vm._expression.expression || '');
            }

            $('#expression').val(vm.expression.expression);
            $('#expression-editor').modal('show');
            initEditor();
        };


        vm.save3 = function (form) {
            if (vm.condition) {
                vm.condition.conditionExpression.expression = angular.copy(vm.ckEditor.getData().replace(/<[^>]+>/gm, '').replace(/&nbsp;/gm, ' ').trim() || '');
            } else if (vm._expression) {
                vm._expression.expression = angular.copy(vm.ckEditor.getData().replace(/<[^>]+>/gm, '').replace(/&nbsp;/gm, ' ').trim() || '');
            }
            let isValid = true;
            if (form) {
                isValid = vm.validateExpression(form);
            }
            if (isValid) {
                $('#expression-editor').modal('hide');
                if (form) {
                    form.$setPristine();
                    form.$setUntouched();
                }
            }
        };

        vm.close3 = function (form) {
            vm.expression = {};
            $('#event-suggestion').css({display: 'none', opacity: 0});
            $('#expression-editor').modal('hide');
            if (form) {
                form.$setPristine();
                form.$setUntouched();
            }
        };
        let isFunction = false;

        vm.functions = [{id: 1, name: '*'}, {id: 2, name: 'today'}, {id: 3, name: 'yesterday'}, {
            id: 4,
            name: 'yesterday - 2'
        },
            {id: 5, name: 'prev'}, {id: 6, name: 'prevSuccessful'}, {id: 7, name: 'prevError'}];
        let d = new Date();
        vm.functions.push({id: 8, name: (d.getMonth() + 1) + '.' + d.getDate()});
        vm.jobFunctions = ['rc',
            'lastCompletedRunEndedSuccessful',
            'lastCompletedRunEndedWithError',
            'lastCompletedRunEndedTodaySuccessful',
            'lastCompletedRunEndedTodayWithError',
            'lastCompletedIsEndedBefore',
            'lastCompletedSuccessulIsEndedBefore',
            'lastCompletedWithErrorIsEndedBefore',
            'lastCompletedIsStartedBefore',
            'lastCompletedSuccessfulIsStartedBefore',
            'lastCompletedWithErrorIsStartedBefore',
            'isStartedToday',
            'isStartedTodayCompletedSuccessful',
            'isStartedTodayCompletedWithError',
            'isStartedTodayCompleted',
            'isCompletedToday',
            'isCompletedTodaySuccessfully',
            'isCompletedTodayWithError',
            'isCompletedAfter',
            'isCompletedWithErrorAfter',
            'isCompletedSuccessfulAfter',
            'isStartedAfter',
            'isStartedWithErrorAfter',
            'isStartedSuccessfulAfter'];
        vm.jobChainFunctions = angular.copy(vm.jobFunctions);
        vm.jobChainFunctions.splice(0, 1);

        vm._eventExample = 'event:name_of_event';
        vm._jobExample = 'job:name_of_job';
        vm._jobchainExample = 'jobChain:name_of_jobChain';

        vm.generateExpression = function (operator, func, form) {
            let setText = '';
            if (func && !operator) {
                vm.expression.type = func;
                vm.expression.showIcon = !(vm.expression.type === 'event' || vm.expression.type === 'global' || vm.expression.type === 'rc' || vm.expression.type === 'fileexist');
            }
            if (operator && !operator.match('function')) {
                setText = operator + ' ';
                vm.expression.showIcon = false;
            } else if (func) {
                if (operator && !operator.match('function')) {
                    setText = func;
                    vm.expression.showIcon = false;
                } else {
                    if (operator === 'function') {
                        vm.expression.type = 'event';
                        vm.expression.showIcon = false;
                        vm._eventExample = 'event:name_of_event[' + func + '], ' + 'event:jobStream.name_of_event[' + func + ']';
                        setText = 'name_of_event[' + func + ']';
                    } else if (operator === 'function2') {
                        vm.expression.type = 'global';
                        vm.expression.showIcon = false;
                        vm._eventExample = 'global:name_of_event[' + func + '], ' + 'global:jobStream.name_of_event[' + func + ']';
                        setText = 'global:name_of_event[' + func + ']';
                    } else if (operator === 'job_function') {
                        vm.expression.showIcon = true;
                        vm.expression.type = 'job';
                        vm._jobExample = 'job:' + func + ', ' + 'job:name_of_job.' + func;
                        setText = 'job:' + func;
                    } else if (operator === 'jobChain_function') {
                        vm.expression.showIcon = true;
                        vm.expression.type = 'jobChain';
                        vm._jobchainExample = 'jobChain:' + func + ', ' + 'jobChain:name_of_jobChain.' + func;
                        setText = 'jobChain:' + func;
                    } else {
                        setText = func + ':';
                    }
                }
            }
            if (vm.ckEditor) {
                vm.ckEditor.insertText(setText);
                vm.expression.expression = vm.ckEditor.getData().replace(/<[^>]+>/gm, '').replace(/&nbsp;/gm, ' ').trim();
                if (form) {
                    vm.validateExpression(form);
                }
            }
        };

        vm.getTreeStructure = function () {
            if (vm.expression.type === 'job' || vm.expression.type === 'jobChain') {
                $('#objectModal').modal('show');
                JobChainService.tree({
                    jobschedulerId: vm.schedulerIds.selected,
                    compact: true,
                    types: [vm.expression.type === 'job' ? 'JOB' : 'JOBCHAIN']
                }).then(function (res) {
                    vm.tree1 = res.folders;
                    angular.forEach(vm.tree1, function (value) {
                        value.expanded = true;
                        if (value.folders) {
                            value.folders = orderBy(value.folders, 'name');
                        }
                    });
                }, function (err) {
                    $('#objectModal').modal('hide');
                });
            }
        };

        vm.validateExpression = function (form) {
            let str = '';
            if (vm.expression && vm.expression.expression) {
                str = vm.expression.expression;
            } else if (vm.condition && vm.condition.conditionExpression && vm.condition.conditionExpression.expression) {
                str = vm.condition.conditionExpression.expression;
            } else if (vm._expression) {
                str = vm._expression.expression;
            }
            str = str.trim();
            let arr = str ? str.split(' ') : [];
            if (arr.length > 0) {
                if (arr[arr.length - 1] === 'and' || arr[arr.length - 1] === 'or' || arr[arr.length - 1] === 'not') {
                    form.$invalid = true;
                    if (form.expression) {
                        form.expression.$invalid = true;
                    }
                    return false;
                }
            }
            form.$invalid = false;
            if (form.expression) {
                form.expression.$invalid = false;
            }
            return true;
        };

        vm.selectCommand = function (command, index) {
            if (index || index == 0) {
                if (vm.condition) {
                    if (command === 'startjob') {
                        vm.condition.inconditionCommands[index].commandParam = 'now';
                    } else {
                        vm.condition.inconditionCommands[index].commandParam = '';
                    }
                } else if (vm._expression) {
                    if (command === 'startjob') {
                        vm._expression.commands[index].commandParam = 'now';
                    } else {
                        vm._expression.commands[index].commandParam = '';
                    }
                }
            } else {
                if (command === 'startjob') {
                    vm.command.commandParam = 'now';
                } else {
                    vm.command.commandParam = '';
                }
            }
        };

        vm.object = {};
        vm.filter_tree1 = {};
        vm.tree1 = [];
        vm.selectJobchainFromTree = function (inconditionCommands) {
            $('#objectModal').modal('show');
            vm._inconditionCommands = inconditionCommands;
            JobChainService.tree({
                jobschedulerId: vm.schedulerIds.selected,
                compact: true,
                types: ['JOBCHAIN']
            }).then(function (res) {
                vm.tree1 = res.folders;
                angular.forEach(vm.tree1, function (value) {
                    value.expanded = true;
                    if (value.folders) {
                        value.folders = orderBy(value.folders, 'name');
                    }
                });
            }, function (err) {
                $('#objectModal').modal('hide');
            });
        };

        vm.treeHandler = function (data) {
            data.expanded = !data.expanded;
            if (data.expanded) {
                if (vm.expression && vm.expression.type && vm.expression.type == 'job') {
                    data.jobChains = [];
                    let obj = {};
                    obj.jobschedulerId = vm.schedulerIds.selected;
                    obj.compact = true;
                    obj.folders = [{folder: data.path, recursive: false}];
                    JobService.getJobsP(obj).then(function (result) {
                        data.jobs = result.jobs;
                    });
                    return;
                }
                data.jobChains = [];
                let obj = {};
                obj.jobschedulerId = vm.schedulerIds.selected;
                obj.compact = true;
                obj.folders = [{folder: data.path, recursive: false}];
                JobChainService.getJobChainsP(obj).then(function (result) {
                    data.jobs = result.jobChains;
                });
            } else {
                data.jobs = [];
            }
        };

        vm.treeHandler1 = function (data) {
            if (data.expanded) {
                data.folders = orderBy(data.folders, 'name');
            }
        };

        var watcher1 = $scope.$watchCollection('object.jobs', function (newNames) {
            if (newNames && newNames.length > 0) {
                vm.object.jobs = [newNames[newNames.length - 1]];
            }
        });

        vm.addObjectPath = function () {
            if (vm.expression && vm.expression.expression) {
                let arr = vm.expression.expression.split(' ');
                let str = '';
                for (let i = 0; i < arr.length - 1; i++) {
                    str = str + arr[i] + ' ';
                }
                if (arr.length > 0) {
                    let exp = arr[arr.length - 1];
                    exp = exp.replace(':', ':' + vm.object.jobs[0] + '.');
                    str = str + ' ' + exp;
                }
                if (str != '') {
                    vm.expression.expression = str;
                }
                vm.ckEditor.setData(vm.expression.expression)
            } else if (vm._inconditionCommands) {
                vm._inconditionCommands.commandParam = vm.object.jobs[0];
            }

            vm.object = {};
        };

        vm.getSuggestion = function ($event, form) {
            let key = $event.keyCode || $event.which;
            if (key == 91) {
                let text = $event.target.value.match(/[a-zA-Z0-9]*/)[0];
                if (text) {
                    $('#event-suggestion').css({
                        'z-index': 9999999,
                        display: 'inline-block',
                        opacity: 1,
                        left: (vm.expression && vm.expression.expression) ? '60px' : $event.target.value.length * 3 + 'px',
                        top: (vm.expression && vm.expression.expression) ? '-30px' : '33px'
                    });
                }
            } else if (key == 93 || key == 13 || key == 8 || key == 32) {
                $('#event-suggestion').css({display: 'none', opacity: 0});
            }
            let arr = $event.target.value.split(' ');
            if (!(arr && arr.length > 0 && (arr[arr.length - 1] === 'or' || arr[arr.length - 1] === 'and' || arr[arr.length - 1] === 'not'))) if (arr && arr.length > 1) {
                for (let i = 0; i < arr.length; i++) {
                    if (i % 2 != 0) {
                        if ((arr[i] === 'or' || arr[i] === 'and')) {
                            form.expression.$invalid = true;
                            form.expression.$dirty = true;
                            break;
                        }
                    }
                }
            }
        };

        vm.addSuggestion = function (value) {
            if (vm.expression) {
                vm.expression.expression = vm.expression.expression + value.substring(1);
            } else if (vm._expression) {
                vm._expression.expression = vm._expression.expression + value.substring(1);
            } else {
                vm.condition.conditionExpression.expression = vm.condition.conditionExpression.expression + value.substring(1);
            }
            $('#event-suggestion').css({display: 'none', opacity: 0});
        };


        function initEditor() {
            if (!vm.ckEditor) {
                let x = CKEDITOR.replace('expression', {
                    plugins: 'autocomplete,textmatch,wysiwygarea',
                    toolbar: [],
                    bodyClass: vm.userPreferences.theme !== 'light' && vm.userPreferences.theme !== 'lighter' || !vm.userPreferences.theme ? 'white_text' : 'dark_text',
                    on: {
                        instanceReady: function (evt) {
                            let itemTemplate = '<li data-id="{id}">' +
                                '<div><strong class="item-title">{name}</strong></div>' +
                                '</li>',
                                outputTemplate = '[{name}] ';
                            let autocomplete = new CKEDITOR.plugins.autocomplete(evt.editor, {
                                textTestCallback: textTestCallback,
                                dataCallback: dataCallback,
                                itemTemplate: itemTemplate,
                                outputTemplate: outputTemplate
                            });

                            // Override default getHtmlToInsert to enable rich content output.
                            autocomplete.getHtmlToInsert = function (item) {
                                return this.outputTemplate.output(item);
                            }
                        }
                    }
                });

                vm.ckEditor = CKEDITOR.instances['expression'];
            } else {
                vm.ckEditor.setData(vm.expression.expression)
            }
        }

        function textTestCallback(range) {
            vm.expression.expression = vm.ckEditor.getData().replace(/<[^>]+>/gm, '').replace(/&nbsp;/gm, ' ').trim();
            vm.validateExpression(vm.form3);
            if (!range.collapsed) {
                return null;
            }
            return CKEDITOR.plugins.textMatch.match(range, matchCallback);
        }

        function matchCallback(text, offset) {
            let pattern = /\[{1}([A-z]|\])*$/,
                match = text.slice(0, offset)
                    .match(pattern);
            if (!match) {
                return null;
            }
            return {
                start: match.index,
                end: offset
            };
        }

        function dataCallback(matchInfo, callback) {
            let data = vm.functions.filter(function (item) {
                let itemName = '[' + item.name + ']';
                return itemName.indexOf(matchInfo.query.toLowerCase()) == 0;
            });
            callback(data);
        }

        $scope.$on('$destroy', function () {
            watcher1();
        });
    }
})();
