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
        .controller('FrequencyCtrl', FrequencyCtrl)
        .controller('PeriodEditorCtrl', PeriodEditorCtrl)
        .controller('ScheduleEditorCtrl', ScheduleEditorCtrl)
        .controller('RuntimeEditorDialogCtrl', RuntimeEditorDialogCtrl)
        .controller('CalendarEditorDialogCtrl', CalendarEditorDialogCtrl)
        .controller('ClientLogCtrl', ClientLogCtrl)
        .controller('CalendarAssignDialogCtrl', CalendarAssignDialogCtrl)
        .controller('AddRestrictionDialogCtrl', AddRestrictionDialogCtrl);


    AppCtrl.$inject = ['$scope', '$rootScope', '$window', 'SOSAuth', '$uibModal', '$location', 'toasty', 'clipboard', 'CoreService', '$state', 'UserService', '$timeout', '$resource', 'gettextCatalog', 'TaskService'];
    function AppCtrl($scope, $rootScope, $window, SOSAuth, $uibModal, $location, toasty, clipboard, CoreService, $state, UserService, $timeout, $resource, gettextCatalog, TaskService) {
        var vm = $scope;
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
                console.log(e)
            }
        });


        if ($window.sessionStorage.clientLogFilter) {
            $rootScope.clientLogFilter = JSON.parse($window.sessionStorage.clientLogFilter);
        } else {
            $rootScope.clientLogFilter = {};
            $rootScope.clientLogFilter.status = ['info', 'debug', 'error', 'warn', 'debug2', 'debug3'];
        }
        function loadSettingConfiguration() {
            var configObj = {};
            configObj.jobschedulerId = $scope.schedulerIds.selected;
            configObj.account = $scope.permission.user;
            configObj.configurationType = "SETTING";
            if (!$window.sessionStorage.settingId)
                $window.sessionStorage.settingId = 0;
            UserService.configurations(configObj).then(function (res1) {
                if (res1.configurations && res1.configurations.length > 0) {
                    $window.sessionStorage.settingId = res1.configurations[0].id;
                    UserService.configuration({
                        jobschedulerId: $scope.schedulerIds.selected,
                        id: $window.sessionStorage.settingId
                    }).then(function (res) {
                        if (res.configuration && res.configuration.configurationItem) {
                            $rootScope.clientLogFilter = JSON.parse(res.configuration.configurationItem);
                        } else {
                            $rootScope.clientLogFilter.isEnable = false;
                        }
                        $window.sessionStorage.clientLogFilter = JSON.stringify($rootScope.clientLogFilter);
                    });
                }
            }, function () {
                $rootScope.clientLogFilter.isEnable = false;
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

        vm.calculateHeight = function () {
            if (window.innerHeight > 450 && window.innerWidth > 740) {
                var headerHt = $('.app-header').height() || 60;
                var topHeaderHt = $('.top-header-bar').height() || 16;
                var subHeaderHt = 59;
                var ht = (window.innerHeight - (headerHt + topHeaderHt + subHeaderHt));
                $('.max-ht').css('height', ht + 'px');
                $('.max-ht2').css('height', ht - 55 + 'px');
                $('.max-tree-ht').css('height', ht - 43 + 'px');
            } else {
                $('.max-ht').css('height', 'auto');
                $('.max-ht2').css('height', 'auto');
                $('.max-tree-ht').css('height', 'auto');
            }
        };

        vm.checkNavHeader = function () {
            if ($('#navbar1').hasClass('in')) {
                $('#navbar1').removeClass('in');
                $('a.navbar-item').addClass('collapsed');
            }
        };

        $(window).resize(function () {
            vm.calculateHeight();
            vm.checkNavHeader();
            if (document.getElementById('agent-cluster-status')) {
                var a = document.getElementById('agent-cluster-status').clientHeight
            }
            if (document.getElementById('agent-running-task')) {
                var b = document.getElementById('agent-running-task').clientHeight
            }
            if (a + b > 320) {
                $('#master-cluster-status').css('height', (a + b - 20) + 'px');
            }
        });

        vm.checkCopyName = function (list, name) {
            var _temp = '';
            if (/.+\((\d+)\)$/.test(name)) {
                _temp = name;
            } else {
                _temp = name + '(1)';
            }
            function recursion() {
                for (var j = 0; j < list.length; j++) {
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
                var timezone = jstz.determine();
                if(timezone)
                    preferences.zone = timezone.name() || $scope.selectedJobScheduler.timeZone;
                else{
                    preferences.zone = $scope.selectedJobScheduler.timeZone;
                }
                preferences.locale = $rootScope.locale.lang;
                preferences.dateFormat = 'DD.MM.YYYY HH:mm:ss';
                preferences.maxRecords = 10000;
                preferences.maxAuditLogRecords = 10000;
                preferences.maxHistoryPerOrder = 30;
                preferences.maxHistoryPerTask = 10;
                preferences.maxHistoryPerJobchain = 30;
                preferences.maxOrderPerJobchain = 5;
                preferences.maxAuditLogPerObject = 10;
                preferences.maxEntryPerPage = '1000';
                preferences.entryPerPage = '10';
                preferences.isNewWindow = 'newWindow';
                preferences.pageView = 'grid';
                preferences.theme = 'light';
                preferences.historyView = 'current';
                preferences.adtLog = 'current';
                preferences.showTasks = true;
                preferences.showOrders = false;
                if ($window.sessionStorage.$SOS$FORCELOGING === 'true' || $window.sessionStorage.$SOS$FORCELOGING == true)
                    preferences.auditLog = true;
                preferences.events = {};

                preferences.events.filter = ['JobChainStopped', 'OrderStarted', 'OrderSetback', 'OrderSuspended'];
                preferences.events.taskCount = 0;
                preferences.events.jobCount = 0;
                preferences.events.jobChainCount = 1;
                preferences.events.positiveOrderCount = 1;
                preferences.events.negativeOrderCount = 2;
                configObj.configurationItem = JSON.stringify(preferences);

                configObj.id = 0;
                $window.sessionStorage.preferences = configObj.configurationItem;
                UserService.saveConfiguration(configObj).then(function (res) {
                    $window.sessionStorage.preferenceId = res.id;
                })
            }
        }

        function getUserProfileConfiguration(id, user) {

            var configObj = {};
            configObj.jobschedulerId = id;
            configObj.account = user;
            configObj.configurationType = "PROFILE";
            var preferences = {};
            UserService.configurations(configObj).then(function (res1) {
                $window.sessionStorage.preferenceId = 0;

                if (res1.configurations && res1.configurations.length > 0) {
                    $window.sessionStorage.preferenceId = res1.configurations[0].id;
                    UserService.configuration({
                        jobschedulerId: id,
                        id: $window.sessionStorage.preferenceId
                    }).then(function (res) {

                        if (res.configuration && res.configuration.configurationItem) {
                            $window.sessionStorage.preferences = JSON.parse(JSON.stringify(res.configuration.configurationItem));
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

                            if (!preferences.entryPerPage) {
                                preferences.entryPerPage = '10';
                                $window.sessionStorage.preferences = JSON.stringify(preferences);
                            }
                            if (($window.sessionStorage.$SOS$FORCELOGING === 'true' || $window.sessionStorage.$SOS$FORCELOGING == true) && !preferences.auditLog) {
                                preferences.auditLog = true;
                            }
                            $window.sessionStorage.preferences = JSON.stringify(preferences);
                            $window.localStorage.$SOS$THEME = preferences.theme;
                            if (preferences.theme == 'lighter') {
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
                            $window.localStorage.$SOS$LANG = preferences.locale;

                            $resource("modules/i18n/language_" + preferences.locale + ".json").get(function (data) {
                                gettextCatalog.setCurrentLanguage(preferences.locale);
                                gettextCatalog.setStrings(preferences.locale, data);
                            });
                        } else {
                            setUserPrefrences(preferences, configObj);
                        }

                        $rootScope.$broadcast('reloadPreferences');
                    }, function () {
                        setUserPrefrences(preferences, configObj);
                        $rootScope.$broadcast('reloadPreferences');
                    });
                } else {
                    setUserPrefrences(preferences, configObj);
                    $rootScope.$broadcast('reloadPreferences');
                }
            }, function () {
                setUserPrefrences(preferences, configObj);
                $rootScope.$broadcast('reloadPreferences');
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

        $scope.$on('reloadUser', function () {
            vm.username = SOSAuth.currentUserData;
            setPermission();
            setIds();
            if (vm.schedulerIds.selected)
                loadSettingConfiguration();
            if (vm.schedulerIds.selected)
                getUserProfileConfiguration(vm.schedulerIds.selected, vm.username);
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
                    $window.localStorage.log_window_wt = newWindow.innerWidth;
                    $window.localStorage.log_window_ht = newWindow.innerHeight;
                    $window.localStorage.log_window_x = newWindow.screenX;
                    $window.localStorage.log_window_y = newWindow.screenY;
                    newWindow.close();
                }
            }
            catch (x) {
                console.log(x)
            }
        }

        var t1;
        vm.showLogWindow = function (order, task, job, id) {
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
            var url = null;
            if (vm.userPreferences.isNewWindow == 'newWindow') {

                try {
                    if (typeof newWindow == 'undefined' || newWindow == null || newWindow.closed == true) {

                        if (order && order.historyId && order.orderId) {
                            url = 'log.html#!/?historyId=' + order.historyId + '&orderId=' + order.orderId + '&jobChain=' + order.jobChain;
                        } else if (task && task.taskId) {
                            if (task.job)
                                url = 'log.html#!/?taskId=' + task.taskId + '&job=' + task.job;
                            else
                                url = 'log.html#!/?taskId=' + task.taskId + '&job=' + job;

                        } else {
                            return;
                        }


                        if (id) {
                            document.cookie = "$SOS$scheduleId=" + id + ";path=/";
                        } else {
                            document.cookie = "$SOS$scheduleId=" + vm.schedulerIds.selected + ";path=/";
                        }
                        document.cookie = "$SOS$accessTokenId=" + SOSAuth.accessTokenId + ";path=/";
                        newWindow = $window.open(url, "Log", 'top=' + $window.localStorage.log_window_y + ',left=' + $window.localStorage.log_window_x + ',innerwidth=' + $window.localStorage.log_window_wt + ',innerheight=' + $window.localStorage.log_window_ht + windowProperties, true);

                        t1 = $timeout(function () {
                            calWindowSize();
                        }, 400);
                    }
                } catch (e) {
                    throw new Error(e.message);
                }
            } else {
                if (order && order.historyId && order.orderId) {
                    url = '#!/order/log?historyId=' + order.historyId + '&orderId=' + order.orderId + '&jobChain=' + order.jobChain + '&schedulerId=' + (id || SOSAuth.accessTokenId);
                } else if (task && task.taskId) {
                    if (task.job)
                        url = '#!/job/log?taskId=' + task.taskId + '&job=' + task.job + '&schedulerId=' + (id || SOSAuth.accessTokenId);
                    else
                        url = '#!/job/log?taskId=' + task.taskId + '&job=' + job + '&schedulerId=' + (id || SOSAuth.accessTokenId);

                } else {
                    return;
                }
                $window.open(url, '_blank');
            }
        };

        vm.end = function (task, path) {
            var jobs = {};
            jobs.jobs = [];
            var taskIds = [];
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

                var modalInstance = $uibModal.open({
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
            var jobs = {};
            jobs.jobs = [];
            var taskIds = [];
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

                var modalInstance = $uibModal.open({
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
            var jobs = {};
            jobs.jobs = [];
            var taskIds = [];
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

                var modalInstance = $uibModal.open({
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

        function calWindowSize() {
            if (newWindow) {
                try {
                    newWindow.onbeforeunload = function () {
                        $window.localStorage.log_window_wt = newWindow.innerWidth;
                        $window.localStorage.log_window_ht = newWindow.innerHeight;
                        $window.localStorage.log_window_x = newWindow.screenX;
                        $window.localStorage.log_window_y = newWindow.screenY;
                        return;
                    };
                    $(newWindow).resize(function () {
                        $window.localStorage.log_window_wt = newWindow.innerWidth;
                        $window.localStorage.log_window_ht = newWindow.innerHeight;
                        $window.localStorage.log_window_x = newWindow.screenX;
                        $window.localStorage.log_window_y = newWindow.screenY;
                    });
                } catch (e) {
                    console.log(e);
                }
            }
        }

        vm.showJobChain = function (jobChain) {
            var path = jobChain.substring(0, jobChain.lastIndexOf('/')) || '/';
            var name = '';
            if (path != '/')
                name = path.substring(path.lastIndexOf('/') + 1, path.length);
            $rootScope.expand_to = {
                name: name,
                path: path
            };
            $location.path('/job_chains')
        };

        vm.showJob = function (job) {
            var path = job.substring(0, job.lastIndexOf('/')) || '/';
            var name = '';
            if (path != '/')
                name = path.substring(path.lastIndexOf('/') + 1, path.length);
            $rootScope.job_expand_to = {
                name: name,
                path: path
            };
            $location.path('/jobs')
        };

        vm.showAgentCluster = function (agentCluster) {
            var path = agentCluster.substring(0, agentCluster.lastIndexOf('/')) || '/';
            var name = '';
            if (path != '/')
                name = agentCluster.substring(agentCluster.lastIndexOf('/') + 1, agentCluster.length);
            $rootScope.agent_cluster_expand_to = {
                name: name,
                path: path
            };
            $location.path('/resources/agent_clusters/')
        };

        vm.showProcessClass = function (processClass) {
            var path = processClass.substring(0, processClass.lastIndexOf('/')) || '/';
            var name = '';
            if (path != '/')
                name = processClass.substring(processClass.lastIndexOf('/') + 1, processClass.length);
            $rootScope.process_class_expand_to = {
                name: name,
                path: path
            };
            $location.path('/resources/process_classes');
        };

        vm.showScheduleLink = function (schedule) {
            var path = schedule.substring(0, schedule.lastIndexOf('/')) || '/';
            var name = '';
            if (path != '/')
                name = schedule.substring(schedule.lastIndexOf('/') + 1, schedule.length);
            $rootScope.schedule_expand_to = {
                name: name,
                path: path
            };
            $location.path('/resources/schedules');
        };

        vm.showOrderLink = function (order) {
            var path = order.substring(0, order.lastIndexOf('/')) || '/';
            var name = '';
            if (path != '/')
                name = path.substring(path.lastIndexOf('/') + 1, path.length);
            $rootScope.order_expand_to = {
                name: name,
                path: path
            };

            $location.path('/orders')
        };


        vm.about = function () {
            vm.versionData = $rootScope.versionData;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/about-dialog.html',
                controller: 'DialogCtrl',
                scope: vm
            });
            modalInstance.result.then(function () {
            }, function () {

            });
        };

        vm.copyLinkToObject = function (objType, path) {
            var link = '';
            var regEx = /(.+)\/#!/;
            if (!regEx.test($location.absUrl())) {
                return;
            }
            var host = regEx.exec($location.absUrl())[1];
            host = host + '/#!/';

            if (objType == 'jobChain' && path) {
                link = host + 'job_chain?path=' + path;
            } else if (objType == 'job' && path) {
                link = host + 'job?path=' + path;
            } else if (objType == 'order' && path) {
                link = host + 'order?path=' + path;
            } else if (objType == 'agentCluster' && path) {
                link = host + 'agent_cluster?path=' + path;
            } else if (objType == 'lock' && path) {
                link = host + 'lock?path=' + path;
            } else if (objType == 'processClass' && path) {
                link = host + 'process_class?path=' + path;
            } else if (objType == 'schedule' && path) {
                link = host + 'schedule?path=' + path;
            }

            if (link !== '') {
                clipboard.copyText(link + '&scheduler_id=' + vm.schedulerIds.selected);
            } else if (objType == 'calendar' && path) {
                clipboard.copyText((host + 'calendar?path=' + path));
            }
        };

        vm.navigateToResource = function () {
            vm.resourceFilters = CoreService.getResourceTab();

            if (vm.resourceFilters.state == 'agent') {
                if (vm.permission.JobschedulerUniversalAgent.view.status) {
                    $state.go('app.resources.agentClusters');
                    return;
                } else {
                    vm.resourceFilters.state = 'processClass';
                }
            }
            if (vm.resourceFilters.state == 'processClass') {
                if (vm.permission.ProcessClass.view.status) {
                    $state.go('app.resources.processClasses');
                    return;
                } else {
                    vm.resourceFilters.state = 'schedules';
                }
            }
            if (vm.resourceFilters.state == 'schedules') {

                if (vm.permission.Schedule.view.status) {
                    $state.go('app.resources.schedules');
                    return;
                } else {
                    vm.resourceFilters.state = 'locks';
                }
            }
            if (vm.resourceFilters.state == 'locks') {
                if (vm.permission.Lock.view.status) {
                    $state.go('app.resources.locks');
                    return;
                } else {
                    vm.resourceFilters.state = 'calendars';
                }
            }
            if (vm.resourceFilters.state = 'calendars' && vm.permission.Calendar.view) {
                $state.go('app.resources.calendars');
            }
        };

        vm.isEmpty = function (obj) {
            for (var key in obj) {
                if (obj.hasOwnProperty(key))
                    return false;
            }
            return true;
        };
        vm.getWeekDays = function (day) {
            if (!day) {
                return;
            }
            var days = day;
            if (!angular.isArray(day)) {
                days = day.toString().split(' ');
            }
            if (days.length == 7) {
                return 'Every day';
            }
            var str = '';
            angular.forEach(days.sort(), function (value) {
                if (value == 0) {
                    str = str + 'Sun,';
                } else if (value == 1) {
                    str = str + 'Mon,';
                } else if (value == 2) {
                    str = str + 'Tue,';
                } else if (value == 3) {
                    str = str + 'Wed,';
                } else if (value == 4) {
                    str = str + 'Thu,';
                } else if (value == 5) {
                    str = str + 'Fri,';
                } else if (value == 6) {
                    str = str + 'Sat,';
                } else if (value == 7) {
                    str = str + 'Sun';
                }
            });

            if (str.length == 1) {
                return '';
            } else {
                if (str.substring(str.length - 1) == ',')
                    str = str.substring(0, str.length - 1);

            }
            return str;
        };

        vm.getMonths = function (month) {
            var str = '';
            if (!month)
                return;

            var months = month;
            if (!angular.isArray(month)) {
                months = month.toString().split(' ');
            }
            if (months.length == 12) {
                return 'every month';
            }

            angular.forEach(months.sort(compareNumbers), function (value) {
                if (value == 1) {
                    str = str + 'Jan,';
                } else if (value == 2) {
                    str = str + 'Feb,';
                } else if (value == 3) {
                    str = str + 'Mar,';
                } else if (value == 4) {
                    str = str + 'Apr,';
                } else if (value == 5) {
                    str = str + 'May,';
                }
                else if (value == 6) {
                    str = str + 'Jun,';
                }
                else if (value == 7) {
                    str = str + 'Jul,';
                }
                else if (value == 8) {
                    str = str + 'Aug,';
                }
                else if (value == 9) {
                    str = str + 'Sep,';
                }
                else if (value == 10) {
                    str = str + 'Oct,';
                }
                else if (value == 11) {
                    str = str + 'Nov,';
                }
                else if (value == 12) {
                    str = str + 'Dec';
                }
            });

            if (str.length == 1) {
                return '';
            } else {
                if (str.substring(str.length - 1) == ',') {
                    str = str.substring(0, str.length - 1);
                }
            }
            return str;
        };

        vm.getSpecificDay = function (day) {
            if (!day) {
                return;
            }
            if (day == 1) {
                return '1st';
            } else if (day == 2) {
                return '2nd';
            } else if (day == 3) {
                return '3rd';
            } else if (day == 4) {
                return '4th';
            } else if (day == -1) {
                return 'last';
            } else if (day == -2) {
                return '2nd last';
            } else if (day == -3) {
                return '3rd last';
            } else if (day == -4) {
                return '4th last';
            }
        };

        vm.getMonthDays = function (month, isUltimos) {
            var str = '';
            if (!month) {
                return month;
            }
            var months = month;
            if (!angular.isArray(month)) {
                months = month.toString().split(' ').sort(compareNumbers);
            }
            for (var i = 0; i < months.length; i++) {
                if (months[i] == 31 && isUltimos) {
                    continue;
                }
                if (months[i] == 0 && !isUltimos) {
                    continue;
                }
                if (months[i] == 1) {
                    str = str + months[i] + 'st,';
                }
                else if (months[i] == 2) {
                    str = str + months[i] + 'nd,';
                }
                else if (months[i] == 3) {
                    str = str + months[i] + 'rd,';
                } else {
                    str = str + months[i] + 'th,';
                }

            }

            if (str.length == 1) {
                return '';
            } else {
                if (str.substring(str.length - 1) == ',') {
                    str = str.substring(0, str.length - 1);
                }
            }
            return str;
        };
        vm.getTimeInString = function (time) {
            if (time.toString().substring(0, 2) == '00' && time.toString().substring(3, 5) == '00') {
                return time.toString().substring(6, time.length) + ' seconds'
            } else if (time.toString().substring(0, 2) == '00') {
                return time.toString().substring(3, time.length) + ' minutes'
            } else if ((time.toString().substring(0, 2) != '00' && time.length == 5) || (time.length > 5 && time.toString().substring(0, 2) != '00' && (time.toString().substring(6, time.length) == '00'))) {
                return time.toString().substring(0, 5) + ' hours'
            } else {
                return time;
            }
        };
        function compareNumbers(a, b) {
            return a - b;
        }

        vm.isIE = function () {
            return !!navigator.userAgent.match(/MSIE/i) || !!navigator.userAgent.match(/Trident.*rv:11\./);
        };


        var watcher = vm.$watchCollection('clientLogFilter.status', function (newNames, oldValues) {
            if (newNames != oldValues && vm.schedulerIds.selected && vm.permission.user) {
                vm.saveSettingConf();
            }
        });

        vm.saveSettingConf = function () {
            if ($window.sessionStorage.settingId) {
                var configObj = {};
                configObj.jobschedulerId = vm.schedulerIds.selected;
                configObj.account = vm.permission.user;
                configObj.configurationType = "SETTING";
                configObj.id = $window.sessionStorage.settingId;
                configObj.configurationItem = JSON.stringify($rootScope.clientLogFilter);
                $window.sessionStorage.clientLogFilter = JSON.stringify($rootScope.clientLogFilter);
                UserService.saveConfiguration(configObj).then(function (res) {
                    $window.sessionStorage.settingId = res.id;
                });
            }
        };

        $scope.$on('$viewContentLoaded', function () {
            vm.calculateHeight();
        });
        $scope.$on('$destroy', function () {
            watcher();
            if (t1)
                $timeout.cancel(t1);
        });
    }

    HeaderCtrl.$inject = ['$scope', 'UserService', 'JobSchedulerService', '$interval', 'toasty', 'SOSAuth', '$rootScope', '$location', 'gettextCatalog', '$window', '$state', '$uibModalStack', 'CoreService', '$timeout'];
    function HeaderCtrl($scope, UserService, JobSchedulerService, $interval, toasty, SOSAuth, $rootScope, $location, gettextCatalog, $window, $state, $uibModalStack, CoreService, $timeout) {
        var vm = $scope;
        toasty.clear();

        function getDateFormat() {
            vm.dataFormat = vm.userPreferences.dateFormat || 'DD.MM.YYYY HH:mm:ss';
            if (vm.dataFormat.match('HH:mm')) {
                vm.dataFormat = vm.dataFormat.replace('HH:mm', '');
            }
            else if (vm.dataFormat.match('hh:mm')) {
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

        vm.getCalendarTimeFormat =function() {
            var timeFormat = vm.userPreferences.dateFormat;

            if ((timeFormat.match(/HH:mm:ss/gi) || timeFormat.match(/HH:mm/gi) || timeFormat.match(/hh:mm:ss A/gi) || timeFormat.match(/hh:mm A/gi)) != null) {
                var result = (timeFormat.match(/HH:mm:ss/gi) || timeFormat.match(/HH:mm/gi) || timeFormat.match(/hh:mm:ss A/gi) || timeFormat.match(/hh:mm A/gi)) + '';
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
                vm.minDate = new Date();
        vm.minDate.setDate(vm.minDate.getDate() - 1);

        var count = parseInt(SOSAuth.sessionTimeout / 1000);
        var resetDate = true;
        var interval = $interval(function () {
            --count;
            vm.currentTime = moment();
            if (vm.currentTime.format("H") == "0" && resetDate) {
                $rootScope.$broadcast('resetDailyPlanDate');
                resetDate = false;
            }
            if (vm.currentTime.format("H") !== "0") {
                resetDate = true;
            }

            var s = parseInt((count) % 60),
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
            if ($rootScope.clientLogFilter.isEnable) {
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
            var date = new Date(vm.selectedJobScheduler.startedAt);
            date.setMilliseconds(date.getMilliseconds() + 1);
            vm.selectedJobScheduler.startedAt = date;
            if (vm.userPreferences)
                getDateFormat();
        });

        var logout = false;
        vm.logout = function (timeout) {
            logout = true;
            UserService.logout().then(function () {
                SOSAuth.clearUser();
                SOSAuth.clearStorage();
                if (timeout) {
                    $window.localStorage.setItem('clientLogs', {});
                    $window.sessionStorage.setItem('$SOS$JOBSCHEDULE', null);
                    $window.sessionStorage.setItem('$SOS$ALLEVENT', null);
                } else {
                    CoreService.setDefaultTab();
                    angular.forEach($window.sessionStorage, function (item, key) {
                        $window.sessionStorage.removeItem(key);
                    });
                }
                $rootScope.$broadcast('reloadUser');
                $location.path('/login').search({});
            });
        };

        if ($window.sessionStorage.$SOS$JOBSCHEDULE) {
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
                    vm.selectedJobScheduler = res.jobscheduler;
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

        $scope.$on('reloadScheduleDetail', function () {
            getScheduleDetail();
        });
        function loadScheduleDetail() {
            if ($state.current.name != 'app.dashboard' && vm.schedulerIds.selected) {
                getScheduleDetail();
            }
        }

        loadScheduleDetail();


        vm.changeScheduler = function (jobScheduler) {
            vm.switchScheduler = true;
            vm.schedulerIds.selected = jobScheduler;
            JobSchedulerService.switchSchedulerId(jobScheduler).then(function (permission) {

                JobSchedulerService.getSchedulerIds().then(function (res) {
                    if (res) {
                        CoreService.setDefaultTab();
                        SOSAuth.setIds(res);
                        SOSAuth.setPermission(permission);
                        SOSAuth.save();

                        $rootScope.$broadcast('reloadUser');
                        if ($location.path().match('job_chain_detail/')) {
                            $location.path('/').search({});
                        } else {
                            if ($state.current.name != 'app.dashboard')
                                getScheduleDetail();
                            $state.reload(vm.currentState);
                        }
                    } else {
                        toasty.error({
                            title: gettextCatalog.getString('message.oops'),
                            msg: gettextCatalog.getString('message.errorInLoadingScheduleIds'),
                            timeout: 10000
                        });
                    }
                });
            })
        };

        vm.checkSchedulerId = function () {
            if ($location.search() && $location.search().scheduler_id && vm.schedulerIds.selected !== $location.search().scheduler_id) {
                vm.changeScheduler($location.search().scheduler_id);
            }
        };


        $scope.$on('$stateChangeSuccess', function (event, toState, toParam, fromState) {
            vm.currentState = toState.name;
            if (toState.name != 'app.dashboard' && fromState.name == 'login') {
                getScheduleDetail();
            }
            vm.checkNavHeader();
            $uibModalStack.dismissAll();
            if (vm.selectedScheduler && vm.selectedScheduler.scheduler)
                document.title = vm.selectedScheduler.scheduler.host + ':' + vm.selectedScheduler.scheduler.port + '/' + vm.selectedScheduler.scheduler.jobschedulerId;
        });

        vm.eventId = '';
        var eventTimeOut = '';
        var eventLoading = false;
        vm.allEvents = '';

        vm.changeEvent = function (jobScheduler) {
            if (!eventLoading) {
                eventLoading = true;
                var obj = {};
                obj.jobscheduler = [];
                if (!vm.eventsRequest || vm.eventsRequest.length == 0) {
                    for (var i = 0; i < jobScheduler.length; i++) {
                        if (vm.schedulerIds.selected == jobScheduler[i]) {
                            obj.jobscheduler.push(
                                {"jobschedulerId": jobScheduler[i], "eventId": vm.eventId}
                            );
                            break;
                        }
                    }
                    for (var j = 0; j < jobScheduler.length; j++) {
                        if (vm.schedulerIds.selected != jobScheduler[j]) {
                            obj.jobscheduler.push(
                                {"jobschedulerId": jobScheduler[j]}
                            );
                        }
                    }
                } else {
                    obj.jobscheduler = vm.eventsRequest;
                }
                CoreService.getEvents(obj).then(function (res) {
                    if (!vm.switchScheduler && !logout) {
                        vm.eventsRequest = [];
                        for (var i = 0; i < res.events.length; i++) {
                            if (res.events[i].jobschedulerId == vm.schedulerIds.selected) {
                                vm.events = [];
                                vm.events.push(res.events[i]);
                                if (vm.selectedJobScheduler && vm.selectedJobScheduler.clusterType && vm.selectedJobScheduler.clusterType._type != 'STANDALONE') {
                                    $rootScope.$broadcast('event-started', {
                                        events: vm.events,
                                        otherEvents: res.events
                                    });
                                } else {
                                    $rootScope.$broadcast('event-started', {
                                        events: vm.events,
                                        otherEvents: vm.events
                                    });
                                }
                                vm.eventsRequest.push({
                                    jobschedulerId: res.events[i].jobschedulerId,
                                    eventId: res.events[i].eventId
                                });

                                angular.forEach(res.events[i].eventSnapshots, function (value1) {
                                    if (value1.eventType === "SchedulerStateChanged") {
                                        loadScheduleDetail();
                                    } else if (value1.eventType === "CurrentJobSchedulerChanged") {
                                        getScheduleDetail();
                                        $state.reload(vm.currentState);
                                    }
                                });

                                break;
                            }
                        }

                        for (var i = 0; i < res.events.length; i++) {
                            if (res.events[i].jobschedulerId != vm.schedulerIds.selected) {
                                vm.eventsRequest.push({
                                    jobschedulerId: res.events[i].jobschedulerId,
                                    eventId: res.events[i].eventId
                                });
                            }
                        }
                        vm.allEvents = res.events;
                        filterdEvents();
                    }

                    if (logout == false) {
                        eventLoading = false;
                        vm.changeEvent(vm.schedulerIds.jobschedulerIds);
                    }
                    vm.switchScheduler = false;

                }, function (err) {
                    if (logout == false && (err.status == 420 || err.status == 434)) {
                        if (eventTimeOut) {
                            $timeout.cancel(eventTimeOut);
                        }
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
            if (logout == false) {
                eventLoading = false;
                vm.changeEvent(vm.schedulerIds.jobschedulerIds);
            }
        });
        vm.allSessionEvent = {group: [], eventUnReadCount: 0};


        if (vm.schedulerIds && vm.schedulerIds.jobschedulerIds && vm.schedulerIds.jobschedulerIds.length > 0)
            vm.changeEvent(vm.schedulerIds.jobschedulerIds);

        if ($window.sessionStorage.$SOS$ALLEVENT != "null" && $window.sessionStorage.$SOS$ALLEVENT != null) {
            if ($window.sessionStorage.$SOS$ALLEVENT.length != 0) {
                vm.allSessionEvent = angular.copy(JSON.parse($window.sessionStorage.$SOS$ALLEVENT));
            }
        }

        function filterdEvents() {
            var eventFilter = vm.userPreferences.events.filter;
            if (eventFilter && angular.isArray(eventFilter) && eventFilter.length > 0) {
                for (var i = 0; i < vm.allEvents.length; i++) {

                    if (vm.allEvents[i] && vm.allEvents[i].eventSnapshots) {
                        for (var j = 0; j < vm.allEvents[i].eventSnapshots.length; j++) {
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

                                        for (var m = 0; m <= eventByPath.events.length - 1; m++) {
                                            eventByPath.events[m].read = false;
                                        }
                                        var flag = true;

                                        if (vm.allSessionEvent.group != undefined)
                                            for (var k = 0; k <= vm.allSessionEvent.group.length - 1; k++) {

                                                if (vm.allSessionEvent.group[k].objectType == eventByPath.objectType && vm.allSessionEvent.group[k].path == eventByPath.path && vm.allSessionEvent.group[k].jobschedulerId == eventByPath.jobschedulerId) {

                                                    for (var m = 0; m <= eventByPath.events.length - 1; m++) {
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

                                        if (flag) {

                                            eventByPath.readCount = 1;
                                            vm.allSessionEvent.eventUnReadCount = vm.allSessionEvent.eventUnReadCount + 1;

                                            vm.allSessionEvent.group.push(eventByPath);


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

                                        for (var m = 0; m <= eventByPath.events.length - 1; m++) {
                                            eventByPath.events[m].read = false;
                                        }

                                        var flag = true;
                                        if (vm.allSessionEvent.group != undefined)
                                            for (var k = 0; k <= vm.allSessionEvent.group.length - 1; k++) {

                                                if (vm.allSessionEvent.group[k].objectType == eventByPath.objectType && vm.allSessionEvent.group[k].path == eventByPath.path && vm.allSessionEvent.group[k].jobschedulerId == eventByPath.jobschedulerId) {

                                                    for (var m = 0; m <= eventByPath.events.length - 1; m++) {
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
                                            vm.allSessionEvent.group.push(eventByPath);
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
                                        for (var m = 0; m <= eventByPath.events.length - 1; m++) {
                                            eventByPath.events[m].read = false;
                                        }
                                        var flag = true;
                                        if (vm.allSessionEvent.group != undefined)
                                            for (var k = 0; k <= vm.allSessionEvent.group.length - 1; k++) {
                                                if (vm.allSessionEvent.group[k].objectType == eventByPath.objectType && vm.allSessionEvent.group[k].path == eventByPath.path && vm.allSessionEvent.group[k].jobschedulerId == eventByPath.jobschedulerId) {
                                                    for (var m = 0; m <= eventByPath.events.length - 1; m++) {
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
                                            vm.allSessionEvent.group.push(eventByPath);
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
                for (var i = 0; i <= allSessionEvent.group.length - 1; i++) {
                    allSessionEvent.group[i].readCount = 0;
                    if (allSessionEvent.group[i].events != undefined)
                        for (var k = 0; k <= allSessionEvent.group[i].events.length - 1; k++) {
                            allSessionEvent.group[i].events[k].read = true;

                        }
                }
                allSessionEvent.eventUnReadCount = 0;
            }
            $window.sessionStorage.$SOS$ALLEVENT = angular.copy(JSON.stringify(allSessionEvent));


        };

        vm.makeAllEventRead = function (allSessionEvent, showGroupEvent) {
            if (showGroupEvent != undefined) {
                for (var i = 0; i <= showGroupEvent.events.length - 1; i++) {
                    if (showGroupEvent.events[i].read == false) {
                        allSessionEvent.eventUnReadCount--;
                    }
                    showGroupEvent.events[i].read = true;
                }
                showGroupEvent.readCount = 0;
            }
        };


        $scope.$on('$destroy', function () {
            $interval.cancel(interval);
            if (eventTimeOut)
                $timeout.cancel(eventTimeOut);
            $('.cluster-rect').popover('dispose');
        });
    }

    ConfigurationCtrl.$inject = ['$scope', 'JobService', 'JobChainService', 'OrderService', 'ScheduleService', 'ResourceService', '$uibModalInstance', '$sce'];
    function ConfigurationCtrl($scope, JobService, JobChainService, OrderService, ScheduleService, ResourceService, $uibModalInstance, $sce) {
        var vm = $scope;

        vm.ok = function () {
            $uibModalInstance.close('ok');
        };
        vm.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

        if (vm.type == 'jobChain') {
            JobChainService.getConfiguration(vm.path, vm.schedulerIds.selected).then(function (res) {
                if (res) {
                    vm.configuration = res.configuration;
                    vm.html = $sce.trustAsHtml(res.configuration.content.html);
                }
            }, function (err) {

            });
        }
        else if (vm.type == 'job') {
            JobService.getConfiguration(vm.path, vm.schedulerIds.selected).then(function (res) {
                if (res) {
                    vm.configuration = res.configuration;
                    vm.html = $sce.trustAsHtml(res.configuration.content.html);
                }

            });
        } else if (vm.type == 'order') {
            OrderService.getConfiguration(vm.path, vm.name, vm.schedulerIds.selected).then(function (res) {
                if (res) {
                    vm.configuration = res.configuration;
                    vm.html = $sce.trustAsHtml(res.configuration.content.html);
                }

            });
        }
        else if (vm.type == 'schedule') {
            ScheduleService.getConfiguration(vm.path, vm.schedulerIds.selected).then(function (res) {
                if (res) {
                    vm.configuration = res.configuration;
                    vm.html = $sce.trustAsHtml(res.configuration.content.html);
                }

            });
        }
        else if (vm.type == 'lock') {
            ResourceService.getLockConfiguration(vm.path, vm.schedulerIds.selected).then(function (res) {
                if (res) {
                    vm.configuration = res.configuration;
                    vm.html = $sce.trustAsHtml(res.configuration.content.html);
                }

            });
        }
        else if (vm.type == 'processClass') {
            ResourceService.getProcessClassConfiguration(vm.path, vm.schedulerIds.selected).then(function (res) {
                if (res) {
                    vm.configuration = res.configuration;
                    vm.html = $sce.trustAsHtml(res.configuration.content.html);
                }

            });
        }
    }

    DialogCtrl.$inject = ['$scope', '$uibModalInstance', '$window','$uibModal','toasty','gettextCatalog'];
    function DialogCtrl($scope, $uibModalInstance, $window,$uibModal,toasty,gettextCatalog) {
        var vm = $scope;
        vm.error = false;
        if (vm.userPreferences.auditLog) {
            vm.display = true;
        }
        if ($window.sessionStorage.$SOS$FORCELOGING == 'true') {
            vm.required = true;
        }

        vm.predefinedMessageList = JSON.parse($window.sessionStorage.comments);

        vm.calendarView = 'month';
        vm.viewDate = new Date();
        vm.events = [];
        vm.isCellOpen = true;


        function submit() {
            if ((vm.calendar && !vm.calendar.copy && vm.calendar.usedIn && vm.calendar.usedIn.length>0) || vm.calendarArr)  {
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
                $uibModalInstance.close('ok');
            }
        }

        vm.ok = function () {
            if(vm.user) {
                if (/\s/.test(vm.user.user) && vm.user.fakepassword) {
                    toasty.error({
                        msg: gettextCatalog.getString('message.inValidUserName'),
                        timeout: 10000
                    });
                    return;
                }else if(/\s/.test(vm.user.user) && !vm.user.fakepassword){
                   vm.user.user = encodeURIComponent(vm.user.user);
                }
            }
            if (vm.paramObject) {
                var indexArr = [];
                angular.forEach(vm.paramObject.params, function (value, index) {
                    if ((value.name == '' || value.name == null || value.name == undefined) && (value.value == '' || value.value == null || value.value == undefined)) {
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
            if(form) {
                form.$setPristine();
                form.$setUntouched();
            }
            $uibModalInstance.dismiss('cancel');
        };

        vm.addCriteria = function () {
            var param = {
                name: '',
                value: ''
            };
            if (vm.paramObject && vm.paramObject.params)
                vm.paramObject.params.push(param);
        };

        vm.addCriteria();

        vm.removeParams = function (index) {
            vm.paramObject.params.splice(index, 1);
        };
    }

    DialogCtrl1.$inject = ['$scope', '$uibModalInstance', '$window','$uibModal'];
    function DialogCtrl1($scope, $uibModalInstance, $window,$uibModal) {
        var vm = $scope;

        vm.ok = function () {
          $uibModalInstance.close('ok');
        };

        vm.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

    }

    FrequencyCtrl.$inject = ['$scope', '$rootScope', 'gettextCatalog','$filter', 'CalendarService'];
    function FrequencyCtrl($scope, $rootScope, gettextCatalog,$filter, CalendarService) {
        var vm = $scope;
        vm.calendarView = 'year';
        vm.viewDate = new Date();
        vm.events = [];

        vm.planItems = [];

        vm.isCellOpen = true;
        vm.editor = {};
        vm.frequency = {};
        vm.calObj = {};

        vm.minDate = new Date();
        vm.minDate.setDate(vm.minDate.getDate() - 1);

        var tempList=[];

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
        function checkIncludeExclude(dates) {

            var frequencyType = angular.copy(vm.editor.frequencyType);
            var obj = {
                tab: "specificDays",
                type: frequencyType == 'INCLUDE' ? 'EXCLUDE' : 'INCLUDE',
                exclude: false,
                dates: []
            };

            angular.forEach(dates, function (date) {
                obj.dates.push(moment(date.plannedStartTime).format('YYYY-MM-DD'));
            });

            obj.str = frequencyToString(obj);

            var flag = false;

            if (obj.type == 'EXCLUDE') {
                if (vm.calendar.excludesFrequency.length > 0) {
                    for (var i = 0; i < vm.calendar.excludesFrequency.length; i++) {
                        if (vm.calendar.excludesFrequency[i].tab == obj.tab) {
                            for (var j = 0; j < vm.calendar.excludesFrequency[i].dates.length; j++) {
                                for (var x = 0; x < obj.dates.length; x++) {
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

            } else {
                for (var i = 0; i < vm.calendar.excludesFrequency.length; i++) {
                    if (vm.calendar.excludesFrequency[i].tab == obj.tab) {
                        for (var x = 0; x < obj.dates.length; x++) {
                            for (var j = 0; j < vm.calendar.excludesFrequency[i].dates.length; j++) {
                                if (vm.calendar.excludesFrequency[i].dates[j] == obj.dates[x]) {
                                    vm.calendar.excludesFrequency[i].dates.splice(x, 1);
                                    break;
                                }
                            }
                        }
                        vm.calendar.excludesFrequency[i].str = frequencyToString(vm.calendar.excludesFrequency[i]);
                        break;
                    }
                }
            }
        }
        var excludedDates =[];

        function checkDate(date) {
            var planData = {
                plannedStartTime: date
            };
            var flag = false;
            for (var i = 0; i < vm.planItems.length; i++) {
                if ((new Date(vm.planItems[i].plannedStartTime).setHours(0, 0, 0, 0) == new Date(planData.plannedStartTime).setHours(0, 0, 0, 0)) && vm.planItems[i].color != 'orange') {
                    vm.planItems[i].color= 'orange';
                    flag = true;
                    break;
                }
            }
            if (!flag) {
                if(excludedDates.length>0){
                    for (var i = 0; i < excludedDates.length; i++) {
                         if ((new Date(excludedDates[i].plannedStartTime).setHours(0, 0, 0, 0) == new Date(planData.plannedStartTime).setHours(0, 0, 0, 0))) {
                              excludedDates.splice(i, 1);
                             for (var j = 0; j < vm.planItems.length; j++) {
                                if ((new Date(vm.planItems[j].plannedStartTime).setHours(0, 0, 0, 0) == new Date(planData.plannedStartTime).setHours(0, 0, 0, 0))) {
                                    vm.planItems[j].color= 'blue';
                                    break;
                                }
                            }
                             break;
                         }
                    }
                }
            } else {
                excludedDates.push(planData);
            }
        }

        vm.addCalendarDates = function(){
             if(excludedDates.length>0){
                 checkIncludeExclude(excludedDates);
             }
            if (vm.flag) {
                vm.save();
            }else{
                vm.editor.showYearView = false;
            }
        };

        vm.holidayDays = {checked: false};
        vm.selectAllHolidays = function(){
            if (vm.holidayDays.checked && vm.holidayList.length>0) {
                 vm.frequency.nationalHoliday =[];
                 angular.forEach(vm.holidayList, function(holiday){
                     vm.frequency.nationalHoliday.push(holiday.date);
                 });
            } else {
                vm.frequency.nationalHoliday = []
            }
        };

        vm.$on('calendarDayClicked', function (event, data) {
            if (data.day && data.day.inMonth) {
                data.month = data.month > 9 ? data.month : '0' + data.month;
                data.day.label = data.day.label > 9 ? data.day.label : '0' + data.day.label;
                var date = data.year + '-' + data.month + '-' + data.day.label;

                if (vm.frequency.tab == 'specificDays' && !vm.editor.showYearView) {
                    var planData = {
                        plannedStartTime: date
                    };
                    var flag = false;
                    for (var i = 0; i < vm.tempItems.length; i++) {
                        if ((new Date(vm.tempItems[i].plannedStartTime).setHours(0, 0, 0, 0) == new Date(planData.plannedStartTime).setHours(0, 0, 0, 0))) {
                            flag = true;
                            break;
                        }
                    }
                    if (!flag) {
                        vm.tempItems.push(planData);
                    } else {
                        vm.tempItems.splice(i, 1);
                    }
                    if (vm.tempItems.length > 0) {
                        vm.editor.isEnable = true;
                    } else {
                        vm.editor.isEnable = false;
                    }
                } else if(vm.editor.showYearView){
                    checkDate(date);
                }
            }
        });



        vm.showCalendar = function (data) {
            if (data && data != 'all' && !data.tab)
                data = JSON.parse(data);

            vm.planItems = [];
            vm.viewDate = new Date();
            vm.calendarTitle = new Date().getFullYear();
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.calendar = {};

            if(data && data != 'all') {
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
                } else if (data.tab == 'others') {
                    if (data.startingWith) {
                        obj.dateFrom = moment(data.startingWith).format('YYYY-MM-DD');
                    }
                    if (data.endOn) {
                        obj.dateTo = moment(data.endOn).format('YYYY-MM-DD');
                    }
                }
            }

            if(!obj.dateFrom) {
                obj.dateFrom = vm.calendar.from || moment().format('YYYY-MM-DD');
            }
            if(!obj.dateTo) {
                obj.dateTo = vm.calendar.to;
            }

            if (data && data != 'all') {
                vm.editor.showYearView = true;
                vm.calObj.freqency = JSON.stringify(data);
                var obj1 = {};
                obj1.includes = {};

                if(vm.excludeFrequencyList && vm.excludeFrequencyList.length>0) {
                    var x={};
                    x.excludes = {};
                    angular.forEach(vm.excludeFrequencyList, function(value){
                       generateCalendarObj(value, x);
                    });
                    obj1.excludes = x.excludes;
                }
                var data1 = angular.copy(data);
                data1.type = 'INCLUDE';
                vm.frequencyObj = generateCalendarObj(data1, obj1);
            } else {
                vm.calObj.freqency = 'all';
                vm.frequencyObj = generateCalendarAllObj();
            }

            obj.calendar = vm.frequencyObj;
            CalendarService.getListOfDates(obj).then(function (result) {
                var color ='blue';
                if(data && data.type =='EXCLUDE'){
                    color ='orange';
                }
                angular.forEach(result.dates, function (date) {
                    vm.planItems.push({
                        plannedStartTime: date,
                        color: color
                    });
                });
                angular.forEach(result.withExcludes, function (date) {
                    vm.planItems.push({
                        plannedStartTime: date,
                        color: 'orange'
                    });
                });
                tempList = angular.copy(vm.planItems);
            });
        };

        vm.getDateFormat = function (date) {
            return $filter('date')(new Date(date), vm.dataFormat);
        };

        vm.loadHolidayList = function () {
            vm.holidayDays.checked= false;
            vm.holidayList =[];
            if (vm.frequency.country == 'IN' && vm.frequency.year) {
                var holidays = [
                    {
                        "date": vm.frequency.year + "-01-01",
                        "name": "New Years day",
                        "type": "public"
                    },
                    {
                        "date": vm.frequency.year + "-01-26",
                        "name": "Republic day",
                        "type": "public"
                    },
                    {
                        "date": vm.frequency.year + "-05-01",
                        "name": "Labours day",
                        "type": "public"
                    },
                    {
                        "date": vm.frequency.year + "-08-15",
                        "name": "Independence day",
                        "type": "public"
                    },
                    {
                        "date": vm.frequency.year + "-10-02",
                        "name": "Mahatma Gandhi Birthday",
                        "type": "public"
                    },

                    {
                        "date": vm.frequency.year + "-12-25",
                        "name": "Christmas day",
                        "type": "public"
                    }
                ];
                vm.holidayList = holidays;
                return;
            }
            if (vm.frequency.country && vm.frequency.year) {
                hd.init(vm.frequency.country);
                var holidays = hd.getHolidays(vm.frequency.year);
                angular.forEach(holidays, function(holiday){
                    if(holiday.type == 'public' && holiday.date && holiday.name) {
                        holiday.date = moment(holiday.date).format('YYYY-MM-DD');
                        vm.holidayList.push(holiday);
                    }
                });
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
            vm.frequency.selectedMonths.sort(compareNumbers);
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
            vm.frequency.selectedMonthsU.sort(compareNumbers);
            vm.editor.isEnable = selectedMonthsU.length > 0;
        };

        vm.getSelectedMonthDaysU = function (value) {
            if (selectedMonthsU.indexOf(value) != -1) {
                return true;
            }
        };

        var watcher1 = vm.$watchCollection('frequency', function (newNames, oldValues) {
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
                    } else if (newNames.tab == 'others') {
                        vm.str = gettextCatalog.getString('tab.every');
                    } else if (newNames.tab == 'nationalHoliday') {
                        vm.str = gettextCatalog.getString('tab.nationalHoliday');
                    }
                }


                if (newNames.tab == 'specificWeekDays') {
                    if (newNames.specificWeekDay && newNames.which) {
                        vm.editor.isEnable = true;
                    } else {
                        vm.editor.isEnable = false;
                    }
                } else if (newNames.tab == 'monthDays') {
                    if(newNames.isUltimos=='months') {
                        if (selectedMonths.length == 0) {
                            vm.editor.isEnable = false;
                        } else {
                            vm.editor.isEnable = true;
                        }
                    }else{
                        if (selectedMonthsU.length == 0) {
                            vm.editor.isEnable = false;
                        } else {
                            vm.editor.isEnable = true;
                        }
                    }

                } else if (newNames.tab == 'others') {
                    if (newNames.interval && newNames.dateEntity) {
                        vm.editor.isEnable = true;
                    } else {
                        vm.editor.isEnable = false;
                    }
                } else if (newNames.tab == 'nationalHoliday') {
                    if (newNames.nationalHoliday && newNames.nationalHoliday.length > 0) {
                        vm.editor.isEnable = true;
                    } else {
                        vm.editor.isEnable = false;
                    }
                }
                else if (newNames.tab == 'weekDays') {
                    if (newNames.days && newNames.days.length>0) {
                        vm.editor.isEnable = true;
                    } else {
                        vm.editor.isEnable = false;
                    }
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
        var watcher3 = vm.$watchCollection('frequency.months', function (newNames) {
            if (newNames) {
                vm.frequency.allMonth = newNames.length == 12;
                vm.frequency.months.sort(compareNumbers);
            }
        });
        var watcher4 = vm.$watchCollection('frequency.nationalHoliday', function (newNames) {
            if (newNames && newNames.length > 0) {
                vm.editor.isEnable = true;
            } else {
                vm.editor.isEnable = false;
            }
        });

        function compareNumbers(a, b) {
            return a - b;
        }

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
                    generateCalendarObj(data, obj);
                });
            }
            if (vm.calendar.excludesFrequency.length > 0) {
                obj.excludes = {};
                angular.forEach(vm.calendar.excludesFrequency, function (data) {
                    generateCalendarObj(data, obj);
                });
            }
            return obj;

        }
        function generateFrequencyObj() {
            vm.tempItems = [];
            for (var i = 0; i < vm.frequencyList.length; i++) {
                if (vm.frequencyList[i].tab == 'weekDays') {
                    vm.frequency.days = angular.copy(vm.frequencyList[i].days);
                } else if (vm.frequencyList[i].tab == 'monthDays') {
                    if (vm.frequencyList[i].isUltimos == 'months')
                        vm.frequency.selectedMonths = angular.copy(vm.frequencyList[i].selectedMonths);
                    else
                        vm.frequency.selectedMonthsU = angular.copy(vm.frequencyList[i].selectedMonthsU);
                } else if (vm.frequencyList[i].tab == 'specificDays') {
                    angular.forEach(vm.frequencyList[i].dates, function (date) {
                        vm.tempItems.push({plannedStartTime: date});
                    });
                } else if (vm.frequencyList[i].tab == 'nationalHoliday') {
                    vm.frequency.nationalHoliday = angular.copy(vm.frequencyList[i].nationalHoliday);
                    vm.frequency.year = angular.copy(vm.frequencyList[i].year);
                }
            }
        }

        vm.addFrequency = function () {
            vm.frequency.str = frequencyToString(vm.frequency);

            var _temp = angular.copy(vm.frequency);
            var flag = false;

            if (vm.isRuntimeEdit) {
                vm.isRuntimeEdit = false;
                if (vm.frequencyList.length > 0) {
                    for (var i = 0; i < vm.frequencyList.length; i++) {
                        if (angular.equals(vm.frequencyList[i], vm.temp)) {

                            if (vm.frequency.tab == 'specificDays') {
                                vm.frequency.dates = [];
                                angular.forEach(vm.tempItems, function (date) {
                                    vm.frequency.dates.push(moment(date.plannedStartTime).format('YYYY-MM-DD'));
                                });
                                vm.frequency.str = frequencyToString(vm.frequency);
                            }
                            vm.frequencyList[i] = angular.copy(vm.frequency);
                            saveFrequency();
                            break;
                        }
                    }
                }
                return;
            }
             if (vm.frequency.tab == 'specificDays') {
                    vm.frequency.dates = [];
                    angular.forEach(vm.tempItems, function (date) {
                        vm.frequency.dates.push(moment(date.plannedStartTime).format('YYYY-MM-DD'));
                    });
                    vm.frequency.str = frequencyToString(vm.frequency);
             }
            for (var i = 0; i < vm.frequencyList.length; i++) {
                if (angular.equals(vm.frequencyList[i], vm.frequency)) {
                    flag = true;
                    break;
                }
            }
            if (flag) {
                return;
            }

            if (vm.frequencyList.length > 0) {
                var flag1 = false;
                for (var i = 0; i < vm.frequencyList.length; i++) {
                    if (vm.frequency.tab == vm.frequencyList[i].tab) {
                        if (vm.frequency.tab == 'weekDays') {
                            if (vm.frequency.months) {
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
                        }
                        else if (vm.frequency.tab == 'monthDays' && vm.frequency.isUltimos == 'months' && vm.frequencyList[i].isUltimos == 'months') {
                            if (vm.frequency.months) {
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
                        }
                        else if (vm.frequency.tab == 'monthDays' && vm.frequency.isUltimos != 'months' && vm.frequencyList[i].isUltimos !== 'months') {
                            if (vm.frequency.months) {
                                if (vm.frequency.months == vm.frequencyList[i].months || angular.equals(vm.frequencyList[i].months, vm.frequency.months)) {
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
                        }
                        else if (vm.frequency.tab == 'specificWeekDays') {
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
                        }
                        else if (vm.frequency.tab == 'nationalHoliday') {
                            vm.frequencyList[i].nationalHoliday=[];
                            angular.forEach(vm.frequency.nationalHoliday, function (date) {
                                vm.frequencyList[i].nationalHoliday.push(date);
                            });
                            vm.frequencyList[i].str = angular.copy(vm.frequency.str);
                            flag1 = true;
                            break;
                        } else if (vm.frequency.tab == 'specificDays') {
                            vm.frequency.dates = [];
                            angular.forEach(vm.tempItems, function (date) {
                                vm.frequency.dates.push(moment(date.plannedStartTime).format('YYYY-MM-DD'));
                            });
                            vm.frequency.str = frequencyToString(vm.frequency);
                            vm.frequencyList[i].dates = angular.copy(vm.frequency.dates);
                            vm.frequencyList[i].str = angular.copy(vm.frequency.str);
                            flag1 = true;
                            break;
                        }
                    }
                }

                if (!flag1) {
                    if (vm.frequency.tab == 'specificDays') {
                        vm.frequency.dates = [];
                        angular.forEach(vm.tempItems, function (date) {
                            vm.frequency.dates.push(moment(date.plannedStartTime).format('YYYY-MM-DD'));
                        });
                        vm.frequency.str = frequencyToString(vm.frequency);
                    }
                    vm.frequency.type = vm.editor.frequencyType;
                    vm.frequencyList.push(angular.copy(vm.frequency))

                }
            } else {
                if (vm.frequency.tab == 'specificDays') {
                    vm.frequency.dates = [];
                    angular.forEach(vm.tempItems, function (date) {
                        vm.frequency.dates.push(moment(date.plannedStartTime).format('YYYY-MM-DD'));
                    });
                    vm.frequency.str = frequencyToString(vm.frequency);
                }
                vm.frequency.type = vm.editor.frequencyType;
                vm.frequencyList.push(angular.copy(vm.frequency));

            }

        };

        function saveFrequency() {
            if (vm.editor.frequencyType == 'INCLUDE') {
                vm.calendar.includesFrequency = angular.copy(vm.frequencyList);
            } else {
                vm.calendar.excludesFrequency = angular.copy(vm.frequencyList);
            }
        }

        vm.editFrequency = function (data) {
            vm.temp = angular.copy(data);
            vm.frequency = angular.copy(data);
            vm.isRuntimeEdit = true;
            if (vm.frequency.tab == 'monthDays') {
                if(vm.frequency.isUltimos=='months') {
                    selectedMonths = [];
                    angular.forEach(data.selectedMonths, function (val) {
                        vm.selectMonthDays(val);
                    });
                }else{
                    selectedMonthsU = [];
                    angular.forEach(data.selectedMonthsU, function (val) {
                        vm.selectMonthDaysU(val);
                    });
                }
            }
        };
        vm.deleteFrequency = function (data, index) {
            vm.frequencyList.splice(index, 1);
            if (vm.frequencyList.length == 0) {
                var temp = angular.copy(vm.frequency);
                vm.frequency = {};
                vm.frequency.tab = temp.tab;
                vm.frequency.isUltimos = temp.isUltimos;
            }
            if(data.tab == 'specificDays'){
                vm.tempItems =[];
            }else if(data.tab == 'nationalHoliday'){
                vm.frequency.nationalHoliday =[];
            }
        };

        function getSpecificDay(day) {
            if (!day) {
                return;
            }
            if (day == 1) {
                return '1st';
            } else if (day == 2) {
                return '2nd';
            } else if (day == 3) {
                return '3rd';
            } else if (day == 4) {
                return '4th';
            } else if (day == -1) {
                return 'last';
            } else if (day == -2) {
                return '2nd last';
            } else if (day == -3) {
                return '3rd last';
            } else if (day == -4) {
                return '4th last';
            }
        }

        function frequencyToString(period) {
            var str = '';
            if (period.months && angular.isArray(period.months)) {
                str = vm.getMonths(period.months);
            }
            if (period.tab == 'weekDays') {
                if (str) {
                    return vm.getWeekDays(period.days) + ' on ' + str;
                } else {
                    return vm.getWeekDays(period.days);
                }
            } else if (period.tab == 'specificWeekDays') {
                if (!angular.isArray(period.which)) {
                    if (str) {
                        return getSpecificDay(period.which) + ' ' + period.specificWeekDay + ' of ' + str;
                    } else {
                        return getSpecificDay(period.which) + ' ' + period.specificWeekDay + ' of month';
                    }
                } else {
                    var str1 = '';
                    angular.forEach(period.which, function (value, index) {
                        str1 = str1 + getSpecificDay(value);
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
            }
            else if (period.tab == 'specificDays') {
                str = 'On ';
                if(period.dates)
                angular.forEach(period.dates.sort(), function (date, index) {
                    str = str + $filter('date')(new Date(date), vm.dataFormat);
                    if (index != period.dates.length - 1) {
                        str = str + ', ';
                    }
                });
                return str;
            }
            else if (period.tab == 'monthDays') {
                if (period.isUltimos != 'months') {
                    if (str) {
                        return '- '+vm.getMonthDays(period.selectedMonthsU, period.isUltimos) + ' of ' + str;
                    } else {
                        return vm.getMonthDays(period.selectedMonthsU, period.isUltimos) + ' of ultimos';
                    }
                } else {
                    if (str) {
                        return vm.getMonthDays(period.selectedMonths) + ' of ' + str;
                    } else {
                        return vm.getMonthDays(period.selectedMonths) + ' of month';
                    }
                }
            }
            else if (period.tab == 'others') {
                if (period.interval == 1) {
                    str = period.interval + 'st ';
                }
                else if (period.interval == 2) {
                    str = period.interval + 'nd ';
                }
                else if (period.interval == 3) {
                    str = period.interval + 'rd ';
                } else {
                    str = period.interval + 'th ';
                }
                var repetitions = period.dateEntity == 'DAILY' ? 'day' : period.dateEntity == 'WEEKLY' ? 'week' : period.dateEntity == 'MONTHLY' ? 'month' : 'year';
                if (period.startingWith) {
                    return 'Every ' + str + repetitions + ' starting with day ' + $filter('date')(period.startingWith, vm.dataFormat);
                } else {
                    return 'Every ' + str + repetitions;
                }

            }
            else if (period.tab == 'nationalHoliday') {
                str = 'On national holidays ';
                if(period.nationalHoliday)
                angular.forEach(period.nationalHoliday.sort(), function (date, index) {
                    str = str + $filter('date')(new Date(date), vm.dataFormat);
                    if (index != period.nationalHoliday.length - 1) {
                        str = str + ', ';
                    }
                });
                return str;
            }
        }

        function getDay(day) {
            return day == "sunday" ? 0 : day == "monday" ? 1 : day == "tuesday" ? 2 : day == "wednesday" ? 3 : day == "thursday" ? 4 : day == "friday" ? 5 : 6;
        }

        function generateCalendarObj(data, obj) {
            var arr = [];
            var from,to;
            if (data.type == "INCLUDE") {
                if (data.months && angular.isArray(data.months) && data.months.length > 0) {
                    if (!obj.includes.months)
                        obj.includes.months = [];

                    if (data.tab == 'weekDays') {
                        if(data.startingWithW){
                            from = moment(data.startingWithW).format('YYYY-MM-DD')
                        }
                        if(data.endOnW){
                            to = moment(data.endOnW).format('YYYY-MM-DD')
                        }
                        arr.push({days: data.days,from:from, to: to});
                        obj.includes.months.push({months: data.months, weekdays: arr});
                    } else if (data.tab == 'monthDays') {
                        if(data.startingWithM){
                            from = moment(data.startingWithM).format('YYYY-MM-DD')
                        }
                        if(data.endOnM){
                            to = moment(data.endOnM).format('YYYY-MM-DD')
                        }
                        if (data.isUltimos == 'months') {
                            arr.push({days: data.selectedMonths,from:from, to: to});
                            obj.includes.months.push({months: data.months, monthdays: arr});
                        } else {
                            arr.push({days: data.selectedMonths,from:from, to: to});
                            obj.includes.months.push({months: data.months, ultimos: arr});
                        }
                    } else if (data.tab == 'specificWeekDays') {
                        if(data.startingWithS){
                            from = moment(data.startingWithS).format('YYYY-MM-DD')
                        }
                        if(data.endOnS){
                            to = moment(data.endOnS).format('YYYY-MM-DD')
                        }
                        arr.push({
                            day: getDay(data.specificWeekDay),
                            weekOfMonth: Math.abs(data.which)
                        });
                        var arrObj = [];
                        arrObj.push({weeklyDays: arr,from:from, to: to});
                        if (data.which > 0) {
                            obj.includes.months.push({months: data.months, monthdays: arrObj});
                        } else {
                            obj.includes.months.push({months: data.months, ultimos: arrObj});
                        }
                    }
                } else {
                    if (data.tab == 'weekDays') {
                        if (!obj.includes.weekdays)
                            obj.includes.weekdays = [];

                        if(data.startingWithW){
                            from = moment(data.startingWithW).format('YYYY-MM-DD')
                        }
                        if(data.endOnW){
                            to = moment(data.endOnW).format('YYYY-MM-DD')
                        }
                        obj.includes.weekdays.push({days: data.days, from:from, to: to});
                    } else if (data.tab == 'monthDays') {
                        if (data.isUltimos == 'months') {
                            if (!obj.includes.monthdays)
                                obj.includes.monthdays = [];

                            if (data.startingWithM) {
                                from = moment(data.startingWithM).format('YYYY-MM-DD')
                            }
                            if (data.endOnM) {
                                to = moment(data.endOnM).format('YYYY-MM-DD')
                            }
                            obj.includes.monthdays.push({days: data.selectedMonths, from:from, to: to});
                        } else {
                            if (!obj.includes.ultimos)
                                obj.includes.ultimos = [];

                            if (data.startingWithM) {
                                from = moment(data.startingWithM).format('YYYY-MM-DD')
                            }
                            if (data.endOnM) {
                                to = moment(data.endOnM).format('YYYY-MM-DD')
                            }
                            obj.includes.ultimos.push({days: data.selectedMonthsU, from:from, to: to});
                        }
                    } else if (data.tab == 'specificWeekDays') {
                        arr.push({
                            day: getDay(data.specificWeekDay),
                            weekOfMonth: Math.abs(data.which)
                        });

                        if(data.startingWithS){
                            from = moment(data.startingWithS).format('YYYY-MM-DD')
                        }
                        if(data.endOnS){
                            to = moment(data.endOnS).format('YYYY-MM-DD')
                        }
                        if (data.which > 0) {
                            if (!obj.includes.monthdays)
                                obj.includes.monthdays = [];
                            obj.includes.monthdays.push({weeklyDays: arr, from:from, to: to});
                        } else {
                            if (!obj.includes.ultimos)
                                obj.includes.ultimos = [];
                            obj.includes.ultimos.push({weeklyDays: arr, from:from, to: to});
                        }
                    } else if (data.tab == 'specificDays') {
                        if (!obj.includes.dates)
                            obj.includes.dates = [];
                        angular.forEach(data.dates, function (value) {
                            obj.includes.dates.push(moment(value).format('YYYY-MM-DD'))
                        });

                    } else if (data.tab == 'others') {
                        if (!obj.includes.repetitions)
                            obj.includes.repetitions = [];
                        var obj1 = {};
                        obj1.repetition = data.dateEntity;
                        obj1.step = data.interval || 1;
                        if (data.startingWith)
                            obj1.from = moment(data.startingWith).format('YYYY-MM-DD');
                        if(data.endOnW){
                            obj1.to = moment(data.endOn).format('YYYY-MM-DD')
                        }
                        obj.includes.repetitions.push(obj1);

                    } else if (data.tab == 'nationalHoliday') {
                        if (!obj.includes.holidays)
                            obj.includes.holidays = [];
                        var dates = [];
                        angular.forEach(data.nationalHoliday, function (value) {
                            dates.push(moment(value).format('YYYY-MM-DD'))
                        });
                        obj.includes.holidays.push({dates: dates});
                    }
                }
            } else {
                if (data.months && angular.isArray(data.months) && data.months.length > 0) {
                    if (!obj.excludes.months)
                        obj.excludes.months = [];

                    if (data.tab == 'weekDays') {

                        if(data.startingWithW){
                            from = moment(data.startingWithW).format('YYYY-MM-DD')
                        }
                        if(data.endOnW){
                            to = moment(data.endOnW).format('YYYY-MM-DD')
                        }

                        arr.push({days: data.days, from:from, to: to});
                        obj.excludes.months.push({months: data.months, weekdays: arr});
                    } else if (data.tab == 'monthDays') {
                        if (data.startingWithM) {
                            from = moment(data.startingWithM).format('YYYY-MM-DD')
                        }
                        if (data.endOnM) {
                            to = moment(data.endOnM).format('YYYY-MM-DD')
                        }

                        if (data.isUltimos == 'months') {
                            arr.push({days: data.selectedMonths, from:from, to: to});
                            obj.excludes.months.push({months: data.months, monthdays: arr});
                        } else {
                            arr.push({days: data.selectedMonths, from:from, to: to});
                            obj.excludes.months.push({months: data.months, ultimos: arr});
                        }
                    } else if (data.tab == 'specificWeekDays') {
                        if(data.startingWithS){
                            from = moment(data.startingWithS).format('YYYY-MM-DD')
                        }
                        if(data.endOnS){
                            to = moment(data.endOnS).format('YYYY-MM-DD')
                        }
                        arr.push({
                            day: getDay(data.specificWeekDay),
                            weekOfMonth: Math.abs(data.which)
                        });
                        var arrObj = [];
                        arrObj.push({weeklyDays: arr, from:from, to: to});
                        if (data.which > 0) {
                            obj.excludes.months.push({months: data.months, monthdays: arrObj});
                        } else {
                            obj.excludes.months.push({months: data.months, ultimos: arrObj});
                        }
                    }
                } else {
                    if (data.tab == 'weekDays') {
                        if(data.startingWithW){
                            from = moment(data.startingWithW).format('YYYY-MM-DD')
                        }
                        if(data.endOnW){
                            to = moment(data.endOnW).format('YYYY-MM-DD')
                        }
                        if (!obj.excludes.weekdays)
                            obj.excludes.weekdays = [];
                        obj.excludes.weekdays.push({days: data.days, from:from, to: to});
                    } else if (data.tab == 'monthDays') {
                        if(data.startingWithM){
                            from = moment(data.startingWithM).format('YYYY-MM-DD')
                        }
                        if(data.endOnM){
                            to = moment(data.endOnM).format('YYYY-MM-DD')
                        }
                        if (data.isUltimos =='months') {
                            if (!obj.excludes.monthdays)
                                obj.excludes.monthdays = [];
                            obj.excludes.monthdays.push({days: data.selectedMonths, from:from, to: to});
                        } else {
                            if (!obj.excludes.ultimos)
                                obj.excludes.ultimos = [];
                            obj.excludes.ultimos.push({days: data.selectedMonthsU, from:from, to: to});
                        }
                    } else if (data.tab == 'specificWeekDays') {
                        if(data.startingWithS){
                            from = moment(data.startingWithS).format('YYYY-MM-DD')
                        }
                        if(data.endOnS){
                            to = moment(data.endOnS).format('YYYY-MM-DD')
                        }
                        arr.push({
                            day: getDay(data.specificWeekDay),
                            weekOfMonth: Math.abs(data.which)
                        });
                        if (data.which > 0) {
                            if (!obj.excludes.monthdays)
                                obj.excludes.monthdays = [];
                            obj.excludes.monthdays.push({weeklyDays: arr, from:from, to: to});
                        } else {
                            if (!obj.excludes.ultimos)
                                obj.excludes.ultimos = [];
                            obj.excludes.ultimos.push({weeklyDays: arr, from:from, to: to});
                        }
                    } else if (data.tab == 'specificDays') {
                        if (!obj.excludes.dates)
                            obj.excludes.dates = [];
                        angular.forEach(data.dates, function (value) {
                            obj.excludes.dates.push(moment(value).format('YYYY-MM-DD'))
                        });

                    } else if (data.tab == 'others') {
                        if (!obj.excludes.repetitions)
                            obj.excludes.repetitions = [];
                        var obj1 = {};
                        obj1.repetition = data.dateEntity;
                        obj1.step = data.interval || 1;
                        if (data.startingWith)
                            obj1.from = moment(data.startingWith).format('YYYY-MM-DD');
                        if (data.endOn)
                            obj1.to = moment(data.endOn).format('YYYY-MM-DD');
                        obj.excludes.repetitions.push(obj1);

                    } else if (data.tab == 'nationalHoliday') {
                        if (!obj.excludes.holidays)
                            obj.excludes.holidays = [];
                        var dates = [];
                        angular.forEach(data.nationalHoliday, function (value) {
                            dates.push(moment(value).format('YYYY-MM-DD'))
                        });
                        obj.excludes.holidays.push({dates: dates});
                    }
                }

            }

            return obj;
        }

        $scope.$on('frequency-editor', function (event, data1) {
            var data = angular.copy(data1.frequency);

            vm.editor = data.editor;
            vm.calendar = data.calendar;
            if(data.flag){
                if(data.data)
                    vm.showCalendar(data.data);
                else
                    vm.showCalendar();
            }
            vm.frequency = data.frequency;
            vm.frequencyList = data.frequencyList;
            vm.excludeFrequencyList = data.excludeFrequencyList;

            vm.tempItems = [];
            vm.temp = data.temp;
            vm.flag = data.flag;
            if (vm.frequencyList && vm.frequencyList.length > 0) {
                generateFrequencyObj();
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
        vm.back1 = function() {
            if (vm.flag) {
                $('#frequency-editor').modal('hide');
                $('.fade-modal').css('opacity', 1);
            } else {
                vm.editor.showYearView = false;
            }
        };

        $scope.$on('$destroy', function () {
            watcher1();
            watcher2();
            watcher3();
            watcher4();
        });
    }

    PeriodEditorCtrl.$inject = ['$scope', '$rootScope', 'gettextCatalog'];
    function PeriodEditorCtrl($scope, $rootScope, gettextCatalog) {
        var vm = $scope;
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
            var data = angular.copy(data1);
            frequency = data;

            vm.period = {};
            vm.period.period = {};
            if (!data.periodStr) {
                vm.period.frequency = 'single_start';
                vm.period.period._single_start = '00:00';
                vm.period.period._when_holiday = 'suppress';
                vm.editor.editPeriod = false;
                vm.editor.createPeriod = true;
                vm.strPeriod = 'New period';
            } else {
                if (data.period._single_start) {
                    vm.period.frequency = 'single_start';
                    vm.period.period._single_start = data.period._single_start;
                }
                else if (data.period._absolute_repeat) {
                    vm.period.frequency = 'absolute_repeat';
                    vm.period.period._absolute_repeat = data.period._absolute_repeat;
                }
                else if (data.period._repeat) {
                    vm.period.frequency = 'repeat';
                    vm.period.period._repeat = data.period._repeat;
                }
                if (data.period._begin) {
                    vm.period.period._begin = data.period._begin;
                }
                if (data.period._end) {
                    vm.period.period._end = data.period._end;
                }

                vm.period.period._when_holiday = data.period._when_holiday || 'suppress';

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
                vm.period.frequency = 'single_start';
                vm.period.period._single_start = '00:00';
                vm.period.period._when_holiday = 'suppress';
                vm.editor.editPeriod = false;
                vm.editor.createPeriod = true;
                vm.strPeriod = 'New period';
            } else {
                var str = '';
                if (data.period.period._begin) {
                    vm.period.period._begin = data.period.period._begin;
                    str = data.period.period._begin;
                }
                if (data.period.period._end) {
                    vm.period.period._end = data.period.period._end;
                    str = str + '-' + data.period.period._begin;
                }
                if (data.period.period._single_start) {
                    vm.period.frequency = 'single_start';
                    vm.period.period._single_start = data.period.period._single_start;
                    str = 'Single start: ' + data.period.period._single_start;
                }
                else if (data.period.period._absolute_repeat) {
                    vm.period.frequency = 'absolute_repeat';
                    vm.period.period._absolute_repeat = data.period.period._absolute_repeat;
                    str = str + ' every ' + vm.getTimeInString(data.period.period._absolute_repeat);
                }
                else if (data.period.period._repeat) {
                    vm.period.frequency = 'repeat';
                    vm.period.period._repeat = data.period.period._repeat;
                    str = str + ' every ' + vm.getTimeInString(data.period.period._repeat);
                }
                vm.strPeriod = str;
                vm.period.period._when_holiday = data.period.period._when_holiday || 'suppress';

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
            $('.fade-modal').css('opacity', 1);
        };
        vm.save = function (form1) {
            if (vm.period.frequency == 'single_start') {
                delete vm.period.period['_repeat'];
                delete vm.period.period['_absolute_repeat'];
                delete vm.period.period['_begin'];
                delete vm.period.period['_end'];
            }
            else if (vm.period.frequency == 'repeat' || vm.period.frequency == 'absolute_repeat') {
                delete vm.period.period['_single_start'];
                if (vm.period.frequency == 'repeat') {
                    delete vm.period.period['_absolute_repeat'];
                } else {
                    delete vm.period.period['_repeat'];
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
            $('.fade-modal').css('opacity', 1);

        };

    }

    ScheduleEditorCtrl.$inject = ['$scope', '$rootScope'];
    function ScheduleEditorCtrl($scope, $rootScope) {
        var vm = $scope;
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
            }
            else if (vm.dateFormat.match('hh:mm')) {
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
            $('.fade-modal').css('opacity', 1);
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
            vm.sch._valid_from = undefined;
            if (!vm.from.time) {
                vm.from.time = '00:00';
            }
            if (!vm.to.time) {
                vm.to.time = '00:00';
            }
            if (vm.from.time && vm.from.date) {
                var date = new Date(vm.from.date);
                date.setHours(vm.from.time.substring(0, 2));
                date.setMinutes(vm.from.time.substring(3, 5));
                if (vm.from.time.substring(6, 8)) {
                    date.setSeconds(vm.from.time.substring(6, 8));
                }
                else {
                    date.setSeconds('00');
                }
                vm.sch._valid_from = moment(date).format('YYYY-MM-DD HH:mm:ss');
            }
            vm.sch._valid_to = undefined;
            if (vm.to.time && vm.to.date) {
                var date = new Date(vm.to.date);
                date.setHours(vm.to.time.substring(0, 2));
                date.setMinutes(vm.to.time.substring(3, 5));
                if (vm.to.time.substring(6, 8)) {
                    date.setSeconds(vm.to.time.substring(6, 8));
                } else {
                    date.setSeconds('00');
                }
                vm.sch._valid_to = moment(date).format('YYYY-MM-DD HH:mm:ss');
            }

            if (vm.sch._valid_from || vm.sch._valid_to || vm.sch._substitute) {

                vm.error.scheduleRequired = !vm.sch._substitute;
                vm.error.validDate = moment(vm.sch._valid_from).diff(moment(vm.sch._valid_to)) > 0;

                if (vm.error.validDate || vm.error.scheduleRequired) {
                    return;
                } else {
                    if (vm.sch._substitute) {
                        if (!vm.sch._valid_from || !vm.sch._valid_to) {
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

    RuntimeEditorDialogCtrl.$inject = ['$scope', '$rootScope', '$uibModalInstance', 'toasty', '$timeout', 'gettextCatalog', '$window', 'CalendarService'];
    function RuntimeEditorDialogCtrl($scope, $rootScope, $uibModalInstance, toasty, $timeout, gettextCatalog, $window, CalendarService) {

        var vm = $scope;
        var dom_parser = new DOMParser();
        vm.minDate = new Date();
        vm.minDate.setDate(vm.minDate.getDate() - 1);
        vm.logError = false;
        vm.Math = Math;
        if (vm.userPreferences.auditLog) {
            vm.display = true;
        }
        if ($window.sessionStorage.$SOS$FORCELOGING == 'true') {
            vm.required = true;
        }

        vm.predefinedMessageList = JSON.parse($window.sessionStorage.comments);
        vm.frequencyList =[];

        function setCalendarToRuntime() {
            if (vm.order && !vm.schedule) {
                if (!vm.order.calendars)
                    vm.order.calendars = [];
            } else if (!vm.order && vm.schedule) {
                if (!vm.schedule.calendars)
                    vm.schedule.calendars = [];
            }
            if (vm.selectedCalendar && vm.selectedCalendar.length > 0) {
                angular.forEach(vm.selectedCalendar, function (value) {
                    var cal = {};
                    cal.id = value.id;
                    cal.path = value.path;
                    cal.basedOn = value.path;
                    cal.includes = {};
                    angular.forEach(vm.frequencyList, function (data) {
                        cal = generateCalendarObj(data, cal);
                    });
                    console.log(cal);
                    if (vm.order.calendars)
                        vm.order.calendars.push(cal);
                    else
                        vm.schedule.calendars.push(cal);
                });
            }

            if (vm.holidayCalendar && vm.holidayCalendar.length > 0) {
                angular.forEach(vm.holidayCalendar, function (value) {
                    var cal = {};
                    cal.id = value.id;
                    cal.path = value.path;
                    cal.basedOn = value.path;
                    if (vm.order.calendars)
                        vm.order.calendars.push(cal);
                    else
                        vm.schedule.calendars.push(cal);
                })
            }
        }

        vm.ok = function () {

            vm.logError = false;
            try {
                var dom_document = dom_parser.parseFromString(vm.xmlObj.xml, 'text/xml');
                if (dom_document.documentElement.nodeName == 'parsererror') {
                    throw new Error('Error at XML answer: ' + dom_document.documentElement.firstChild.nodeValue);
                } else {
                    if (vm.required) {
                        if (vm.comments.comment) {
                            setCalendarToRuntime();
                            $uibModalInstance.close('ok');
                        } else {
                            vm.logError = true;
                        }
                    } else {
                        setCalendarToRuntime();
                        $uibModalInstance.close('ok');
                    }
                }
            } catch (e) {
                toasty.error({
                    title: 'Invalid xml',
                    msg: e,
                    timeout: 10000
                });
            }
        };

        vm.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

        vm.editor = {};
        vm.editor.hidePervious = false;
        vm.editor.isEnable = false;
        vm.runTime = {};
        vm.runTime.tab = 'weekDays';
        vm.runTime.frequency = 'single_start';
        vm.runTime.period = {};
        vm.runTime.period._single_start = '00:00';
        vm.tempRunTime = {};
        vm.runTime1 = {};
        var promise1, promise2, promise3;

        var run_time = {};
        run_time = {};
        run_time.month = [];
        run_time.weekdays = {};
        run_time.weekdays.day = [];
        run_time.monthdays = {};
        run_time.monthdays.day = [];
        run_time.ultimos = {};
        run_time.ultimos.day = [];
        var x2js = new X2JS();

        vm.calendarView = 'year';
        vm.viewDate = new Date();
        vm.events = [];
        vm.planItems = [];
        vm.selectedCalendar = [];

        vm.isCellOpen = true;

        vm.editor.when_holiday_options = {
            'previous_non_holiday': gettextCatalog.getString('previous non holiday'),
            'next_non_holiday': gettextCatalog.getString('next non holiday'),
            'suppress': gettextCatalog.getString('suppress execution (default)'),
            'ignore_holiday': gettextCatalog.getString('ignore holiday')
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

        vm.loadHolidayList = function () {
            vm.holidayList =[];
            if (vm.runTime.country == 'IN' && vm.runTime.year) {
                var holidays = [
                    {
                        "date": vm.runTime.year + "-01-01",
                        "name": "New Years day",
                        "type": "public"
                    },
                    {
                        "date": vm.runTime.year + "-01-26",
                        "name": "Republic day",
                        "type": "public"
                    },
                    {
                        "date": vm.runTime.year + "-05-01",
                        "name": "Labours day",
                        "type": "public"
                    },
                    {
                        "date": vm.runTime.year + "-08-15",
                        "name": "Independence day",
                        "type": "public"
                    },
                    {
                        "date": vm.runTime.year + "-10-02",
                        "name": "Mahatma Gandhi Birthday",
                        "type": "public"
                    },
                    {
                        "date": vm.runTime.year + "-12-25",
                        "name": "Christmas day",
                        "type": "public"
                    }
                ];
                vm.holidayList = holidays;
                return;
            }
            if (vm.runTime.country && vm.runTime.year) {
                hd.init(vm.runTime.country);
                var holidays = hd.getHolidays(vm.runTime.year);
                angular.forEach(holidays, function (holiday) {
                    if (holiday.type == 'public' && holiday.date && holiday.name)
                        vm.holidayList.push(holiday);
                });
            }
        };
        //-------------------End ----------------------
        var selectedMonths = [];
        vm.selectMonthDays = function (value) {
            if (selectedMonths.indexOf(value) == -1) {
                selectedMonths.push(value);
                isDelete = false;
            } else {
                selectedMonths.splice(selectedMonths.indexOf(value), 1);
            }
            vm.runTime.selectedMonths = angular.copy(selectedMonths);
            vm.runTime.selectedMonths.sort(compareNumbers);
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
            vm.runTime.selectedMonthsU = angular.copy(selectedMonthsU);
            vm.runTime.selectedMonthsU.sort(compareNumbers);
            vm.editor.isEnable = selectedMonthsU.length > 0;
        };

        vm.getSelectedMonthDaysU = function (value) {
            if (selectedMonthsU.indexOf(value) != -1) {
                return true;
            }
        };
        vm.textEditor = function () {
            loadXml(vm.xmlObj.xml);
        };

        var watcher1 = vm.$watchCollection('runTime', function (newNames, oldValues) {
            if (newNames) {
                if ((newNames.tab != oldValues.tab)) {
                    isDelete = false;
                }
                if (vm.editor.create) {
                    if (newNames.tab == 'monthDays') {
                        if (newNames.isUltimos == 'ultimos') {
                            vm.str = gettextCatalog.getString('label.ultimos');
                        } else {
                            vm.str = gettextCatalog.getString('label.monthDays');
                        }
                    } else {
                        if (newNames.tab == 'specificWeekDays') {
                            vm.str = gettextCatalog.getString('label.specificWeekDays');
                        }
                        else if (newNames.tab == 'specificDays') {
                            vm.str = gettextCatalog.getString('label.specificDays');
                        } else {
                            vm.str = gettextCatalog.getString('tab.weekDays');
                        }
                    }
                }

                if (newNames.tab == 'specificWeekDays') {
                    if (newNames.specificWeekDay && newNames.which) {
                        vm.editor.isEnable = true;
                        isDelete = false;
                    } else {
                        vm.editor.isEnable = false;
                    }
                } else if (newNames.tab == 'specificDays') {

                    if (newNames.date) {
                        vm.editor.isEnable = true;
                        isDelete = false;
                    } else {
                        vm.editor.isEnable = false;
                    }
                } else if (newNames.tab == 'monthDays') {
                     if(newNames.isUltimos=='months') {
                        if (selectedMonths.length == 0) {
                            vm.editor.isEnable = false;
                        } else {
                            vm.editor.isEnable = true;
                        }
                    }else{
                        if (selectedMonthsU.length == 0) {
                            vm.editor.isEnable = false;
                        } else {
                            vm.editor.isEnable = true;
                        }
                    }
                }else if(newNames.tab == 'weekDays'){
                    if(newNames.days && newNames.days.length>0){
                        vm.editor.isEnable = true;
                    }else{
                        vm.editor.isEnable = false;
                    }
                }

            }
        });
        var watcher2 = vm.$watchCollection('runTime.days', function (newNames) {
            if (newNames) {
                isDelete = false;
                vm.editor.isEnable = newNames.length > 0;
                vm.runTime.all = newNames.length == 7;
                vm.runTime.days.sort();
            }
        });
        var watcher3 = vm.$watchCollection('runTime.months', function (newNames) {
            if (newNames) {
                isDelete = false;
                vm.runTime.allMonth = newNames.length == 12;
                vm.runTime.months.sort(compareNumbers);
            }
        });
        var watcher4 = vm.$watchCollection('runTime.nationalHoliday', function (newNames) {
            if (newNames) {
                vm.holidayDates = [];
                if (vm._tempHoliday)
                    vm.holidayDates = angular.copy(vm._tempHoliday);
                if (newNames.length > 0) {
                    for (var i = 0; i < newNames.length; i++) {
                        var x = new Date(newNames[i]);
                        var flag = false;
                        for (var j = 0; j < vm.holidayDates.length; j++) {
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


        function compareNumbers(a, b) {
            return a - b;
        }

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
            var temp = angular.copy(vm.runTime.period);
            vm.runTime.period = {};
            vm.runTime.period._when_holiday = temp._when_holiday;
            if (vm.runTime.frequency == 'single_start') {
                vm.runTime.period._single_start = '00:00';
                delete vm.runTime.period._absolute_repeat;
                delete vm.runTime.period._repeat;
                delete vm.runTime.period._begin;
                delete vm.runTime.period._end;
            } else if (vm.runTime.frequency == 'repeat') {
                delete vm.runTime.period._single_start;
                delete vm.runTime.period._absolute_repeat;
                vm.runTime.period._repeat = '00:00';
                vm.runTime.period._begin = '00:00';
                vm.runTime.period._end = '24:00';
            } else {
                delete vm.runTime.period._single_start;
                delete vm.runTime.period._repeat;
                vm.runTime.period._absolute_repeat = '00:00';
                vm.runTime.period._begin = '00:00';
                vm.runTime.period._end = '24:00';
            }
        };

        vm._sch = {};
        vm.changeSchedule = function () {

            if (vm._sch._schedule) {
                try {
                    var xmlStr = x2js.json2xml_str({run_time: vm._sch});
                } catch (e) {
                    console.log(e);
                }

                xmlStr = xmlStr.replace(/,/g, ' ');
                vm.xmlObj.xml = xmlStr;
            } else {
                vm.xmlObj.xml = x2js.json2xml_str({run_time: {}});
            }
            vm.runTime1 = {};
            vm.holidayDates = [];
            vm.calendarFiles = [];
            getXml2Json(vm.xmlObj.xml);
        };

        function frequencyToString(period) {
            var str;
            if (period.months && angular.isArray(period.months)) {
                str = vm.getMonths(period.months);
            }
            if (period.tab == 'weekDays') {
                if (str) {
                    return vm.getWeekDays(period.days) + ' on ' + str;
                } else {
                    return vm.getWeekDays(period.days);
                }
            } else if (period.tab == 'specificWeekDays') {
                if (str) {
                    return vm.getSpecificDay(period.which) + period.specificWeekDay + ' of ' + str;
                } else {
                    return vm.getSpecificDay(period.which) + period.specificWeekDay + ' of month';
                }
            }
            else if (period.tab == 'specificDays') {
                return 'On ' + moment(period.date).format('YYYY-MM-DD');
            }
            else if (period.tab == 'monthDays') {
                if (period.isUltimos =='ultimos') {
                    if (str) {
                        return '- '+vm.getMonthDays(period.selectedMonthsU, period.isUltimos) + ' of ' + str;
                    } else {
                        return vm.getMonthDays(period.selectedMonthsU, period.isUltimos) + ' of ultimos';
                    }
                } else {
                    if (str) {
                        return vm.getMonthDays(period.selectedMonths) + ' of ' + str;
                    } else {
                        return vm.getMonthDays(period.selectedMonths) + ' of month';
                    }
                }
            }
        }

        var paths=[];
        function setPaths(path){
            if(paths.indexOf(path)==-1)
                paths.push(path)
        }
        function getHolidayCalendarByPath() {
            if (paths.length > 0) {
                CalendarService.getListOfCalendars({calendars: paths, jobschedulerId: vm.schedulerIds.selected,compact : true}).then(function (res) {
                    angular.forEach(res.calendars, function (calendar) {
                        if (vm.holidayCalendar && angular.isArray(vm.holidayCalendar)) {
                            var flag = false;
                            for(var i=0;i<vm.holidayCalendar.length;i++) {
                                if (vm.holidayCalendar[i].path == calendar.path) {
                                    flag = true;
                                    break;
                                }
                            }
                            if (!flag)
                                vm.holidayCalendar.push(calendar);

                        } else {
                            vm.holidayCalendar = [];
                            vm.holidayCalendar.push(calendar);
                        }
                    });
                    paths = [];
                });
            }
        }

        var calendarPath=[],promise4;
        function setCalendarPath(path){
            if(calendarPath.indexOf(path)==-1)
                calendarPath.push(path)
        }
        function getCalendarByPath() {
            if (calendarPath.length > 0) {
                CalendarService.getListOfCalendars({
                    calendars: calendarPath,
                    jobschedulerId: vm.schedulerIds.selected,
                    compact: true
                }).then(function (res) {
                    angular.forEach(res.calendars, function (calendar) {
                        if (vm.selectedCalendar && angular.isArray(vm.selectedCalendar)) {
                            var flag = false;
                            for (var i = 0; i < vm.selectedCalendar.length; i++) {
                                if (vm.selectedCalendar[i].path == calendar.path) {
                                    flag = true;
                                    break;
                                }
                            }
                            if (!flag)
                                vm.selectedCalendar.push(calendar);
                        } else {
                            vm.selectedCalendar = [];
                            vm.selectedCalendar.push(calendar);
                        }
                    });
                    calendarPath = [];
                    promise4 = $timeout(function () {
                        getXml2Json(vm.xmlObj.xml);
                    }, 200)
                });
            }
        }

        function getXml2Json(xml, load) {
            vm.runtimeList = [];
            if (!xml) {
                return;
            }
            var _xml = {};
            try {
                var dom_document = dom_parser.parseFromString(xml, "text/xml");
                var y = dom_document.documentElement.childNodes;
                if (y.length > 0) {
                    var z = dom_document.getElementsByTagName("day");
                    for (var i = 0; i < z.length; i++) {
                        angular.forEach(z[i].attributes, function (value) {
                            if (value.nodeName == 'day' && (value.nodeValue == '' || value.nodeValue == 'undefined' || value.nodeValue == undefined || value.nodeValue == 'null' || value.nodeValue == null)) {
                                z[i].removeAttribute('day');
                            }
                        });
                    }
                    var x = dom_document.getElementsByTagName("period");
                    for (var i = 0; i < x.length; i++) {
                        angular.forEach(x[i].attributes, function (value) {
                            if (value.nodeName == 'when_holiday' && value.nodeValue == 'suppress') {
                                x[i].removeAttribute('when_holiday');
                            }
                            else if (value.nodeName == 'single_start') {
                                if (value.nodeValue.toString().substring(6) == '00') {
                                    // x[i].setAttribute("single_start", value.nodeValue.toString().substring(0, 5));
                                    x[i].setAttribute("single_start", value.nodeValue);
                                }
                            }
                            else if (value.nodeName == 'absolute_repeat') {
                                if (value.nodeValue.toString().substring(6) == '00') {
                                    // x[i].setAttribute("absolute_repeat", value.nodeValue.toString().substring(0, 5));
                                    x[i].setAttribute("absolute_repeat", value.nodeValue);
                                }
                            }
                            else if (value.nodeName == 'repeat') {
                                if (value.nodeValue.toString().substring(6) == '00') {
                                    // x[i].setAttribute("repeat", value.nodeValue.toString().substring(0, 5));
                                    x[i].setAttribute("repeat", value.nodeValue);
                                }
                            }
                            else if (value.nodeName == 'begin') {
                                if (value.nodeValue.toString().substring(6) == '00') {
                                    //   x[i].setAttribute("begin", value.nodeValue.toString().substring(0, 5));
                                    x[i].setAttribute("begin", value.nodeValue);
                                }
                            }
                            else if (value.nodeName == 'end') {
                                if (value.nodeValue.toString().substring(6) == '00') {
                                    // x[i].setAttribute("end", value.nodeValue.toString().substring(0, 5));
                                    x[i].setAttribute("end", value.nodeValue);
                                }
                            } else {
                                if (value.nodeName != 'when_holiday') {
                                    x[i].removeAttribute(value.nodeName);
                                }
                            }
                        });
                    }

                }

                if (dom_document.documentElement.nodeName == "parsererror") {
                    throw new Error("Error at XML answer: " + dom_document.documentElement.firstChild.nodeValue);
                } else {
                    _xml = x2js.xml_str2json(xml);
                }

                var xmlAsString;
                vm.xmlObj.xml = undefined;
                try {

                    if (window.DOMParser) {
                        xmlAsString = new XMLSerializer().serializeToString(dom_document);

                    } else {
                        xmlAsString = dom_document.documentElement.xml;
                        xmlAsString = xmlAsString.replace(/\t/g, "  ");

                    }
                    if (y.length > 0)
                        xmlAsString = xmlAsString.replace(/<\w+\/>/g, " ");
                    promise2 = $timeout(function () {
                        vm.xmlObj.xml = vkbeautify.xml(xmlAsString, 2);
                    }, 0);


                } catch (x) {
                    throw new Error(x.message);
                }

            } catch (e) {
                toasty.error({
                    title: 'Invalid xml',
                    msg: e,
                    timeout: 10000
                });
            }


            if (vm.isEmpty(_xml)) {
                return;
            }

            run_time = _xml.run_time || _xml.schedule || {};

            if (!run_time._schedule) {
                vm._sch = {};

                if (load && vm.order)
                    vm.order.at = 'now';
            } else {
                vm._sch._schedule = run_time._schedule;
                if (load && vm.order)
                    vm.order.at = 'later';
            }

            vm.runTime1.timeZone = run_time._time_zone;

            if (run_time._valid_from) {
                vm.from.date = run_time._valid_from;

                var d = new Date(run_time._valid_from),
                    h = d.getHours(), m = d.getMinutes(), s = d.getSeconds();
                h = h > 9 ? h : '0' + h;
                m = m > 9 ? m : '0' + m;
                s = s > 9 ? s : '0' + s;
                vm.from.time = h + ':' + m + ':' + s;
            }
            if (run_time._valid_to) {
                vm.to.date = run_time._valid_to;
                var d = new Date(run_time._valid_to),
                    h = d.getHours(), m = d.getMinutes(), s = d.getSeconds();
                h = h > 9 ? h : '0' + h;
                m = m > 9 ? m : '0' + m;
                s = s > 9 ? s : '0' + s;
                vm.to.time = h + ':' + m + ':' + s;
            }

            if (vm.sch) {
                vm.sch._title = run_time._title;
                vm.sch._name = run_time._name;
                vm.sch._substitute = run_time._substitute;
            }

            if (vm.substituteObj) {
                vm.substituteObj.name = run_time._name;
                if (!run_time._valid_from) {
                    vm.substituteObj.fromDate = '';
                    vm.substituteObj.fromTime = '00:00';
                }
                if (!run_time._valid_to) {
                    vm.substituteObj.toDate = '';
                    vm.substituteObj.toTime = '00:00';
                }
            }


            if (!run_time.date) {
                run_time.date = [];
                vm.selectedCalendar =[];
            } else {
                if (!angular.isArray(run_time.date)) {
                    var temp = angular.copy(run_time.date);
                    run_time.date = [];
                    if (temp)
                        run_time.date.push(temp)
                } else {
                    angular.forEach(run_time.date, function (date, index) {
                        if (date._calendar) {
                            var flg = false;
                            if (vm.selectedCalendar && vm.selectedCalendar.length > 0) {
                                for (var i = 0; i < vm.selectedCalendar.length; i++) {
                                    if (vm.selectedCalendar[i].path == date._calendar) {
                                        flg = true;
                                        break;
                                    }
                                }
                            }
                            if (!flg) {
                                setCalendarPath(date._calendar);
                            }
                        }
                    });
                    getCalendarByPath();
                }
            }
            if (!run_time.weekdays) {
                run_time.weekdays = {};
                run_time.weekdays.day = [];
            } else {
                if (!angular.isArray(run_time.weekdays.day)) {
                    var temp = angular.copy(run_time.weekdays.day);
                    run_time.weekdays.day = [];
                    if (temp)
                        run_time.weekdays.day.push(temp)
                }
            }
            if (!run_time.monthdays) {
                run_time.monthdays = {};
                run_time.monthdays.day = [];
                run_time.monthdays.weekday = [];
            } else {
                if (!angular.isArray(run_time.monthdays.day)) {
                    var temp = angular.copy(run_time.monthdays);
                    run_time.monthdays.day = [];
                    if (temp.day)
                        run_time.monthdays.day.push(temp.day);
                    run_time.monthdays.weekday = [];
                    if (temp.weekday) {
                        if (angular.isArray(temp.weekday)) {
                            run_time.monthdays.weekday = temp.weekday;
                        } else {
                            run_time.monthdays.weekday.push(temp.weekday);
                        }
                    }
                }
            }
            if (!run_time.ultimos) {
                run_time.ultimos = {};
                run_time.ultimos.day = [];
            } else {
                if (!angular.isArray(run_time.ultimos.day)) {
                    var temp = angular.copy(run_time.ultimos.day);
                    run_time.ultimos.day = [];
                    run_time.ultimos.day.push(temp)
                }
            }
            if (!run_time.month) {
                run_time.month = [];
            } else {
                if (!angular.isArray(run_time.month)) {
                    var temp = angular.copy(run_time.month);
                    run_time.month = [];
                    if (temp)
                        run_time.month.push(temp)
                }
            }

            if (!vm.isEmpty(run_time.holidays) && run_time.holidays) {
                vm.runTime1.holidays = {};
                if (run_time.holidays.weekdays && run_time.holidays.weekdays.day) {
                    vm.runTime1.holidays.weekdays = angular.copy(run_time.holidays.weekdays);
                    vm.runTime1.holidays.weekdays.day._day = vm.runTime1.holidays.weekdays.day._day.split(' ');
                    vm.runTime1.holidays.weekdays.day._day.sort();
                }
                if (run_time.holidays.holiday) {

                    if (angular.isArray(run_time.holidays.holiday)) {
                        angular.forEach(run_time.holidays.holiday, function (date, index) {
                            if (!date._calendar)
                                vm.holidayDates.push(new Date(date._date));
                            if (date._calendar) {
                                var flg = false;
                                if (vm.holidayCalendar && vm.holidayCalendar.length > 0) {
                                    for (var i = 0; i < vm.holidayCalendar.length; i++) {
                                        if (vm.holidayCalendar[i].path == date._calendar) {
                                            flg = true;
                                            break;
                                        }
                                    }
                                }
                                if (!flg) {
                                    setPaths(date._calendar);
                                }
                            }

                        });
                        getHolidayCalendarByPath();

                    } else {
                        if (!run_time.holidays.holiday._calendar)
                            vm.holidayDates.push(new Date(run_time.holidays.holiday._date));
                    }
                }else{
                    vm.holidayCalendar =[];
                }
                if (run_time.holidays.include) {
                    if (angular.isArray(run_time.holidays.include)) {
                        angular.forEach(run_time.holidays.include, function (file) {
                            if (file._live_file)
                                vm.calendarFiles.push('live_file: ' + file._live_file);
                            if (file._file)
                                vm.calendarFiles.push('file: ' + file._file);
                        });
                    } else {
                        if (run_time.holidays.include._live_file) {
                            vm.calendarFiles.push('live_file: ' + run_time.holidays.include._live_file);
                        }
                        if (run_time.holidays.include._file) {
                            vm.calendarFiles.push('file: ' + run_time.holidays.include._file);
                        }
                    }
                }

            }else{
                vm.holidayCalendar =[];
            }

            if (run_time.date) {
                angular.forEach(run_time.date, function (res) {
                        var str = '';
                        if (res._date && !res._calendar) {
                            str = 'On ' + res._date;
                            var periodStrArr = [], objArr = [];
                            if (angular.isArray(res.period)) {
                                angular.forEach(res.period, function (res1) {
                                    var periodStr = null;
                                    if (res1._begin) {
                                        periodStr = res1._begin;
                                    }
                                    if (res1._end) {
                                        periodStr = periodStr + '-' + res1._end;
                                    }
                                    if (res1._single_start) {
                                        periodStr = 'Single start : ' + res1._single_start;
                                    }
                                    else if (res1._absolute_repeat) {
                                        periodStr = periodStr + ' every ' + vm.getTimeInString(res1._absolute_repeat);
                                    }
                                    else if (res1._repeat) {
                                        periodStr = periodStr + ' every ' + vm.getTimeInString(res1._repeat);
                                    }
                                    if (periodStr)
                                        periodStrArr.push(periodStr);
                                    objArr.push({
                                        _date: res._date,
                                        _period: res1
                                    });

                                });
                            } else {
                                var periodStr = null;
                                if (res.period) {
                                    if (res.period._begin) {
                                        periodStr = res.period._begin;
                                    }
                                    if (res.period._end) {
                                        periodStr = periodStr + '-' + res.period._end;
                                    }
                                    if (res.period._single_start) {
                                        periodStr = 'Single start : ' + res.period._single_start;
                                    }
                                    else if (res.period._absolute_repeat) {
                                        periodStr = periodStr + ' every ' + vm.getTimeInString(res.period._absolute_repeat);
                                    }
                                    else if (res.period._repeat) {
                                        periodStr = periodStr + ' every ' + vm.getTimeInString(res.period._repeat);
                                    }
                                }
                                if (periodStr)
                                    periodStrArr.push(periodStr);
                                objArr.push({
                                    _date: res._date,
                                    _period: res.period
                                });
                            }
                            vm.runtimeList.push(
                                {
                                    frequency: str,
                                    period: periodStrArr,
                                    obj: objArr,
                                    type: 'date'
                                });

                        } else if (res._date && res._calendar) {
                            str = res._calendar;
                            var periodStrArr = [], objArr = [];
                            if (angular.isArray(res.period)) {
                                angular.forEach(res.period, function (res1) {
                                    var periodStr = null;
                                    if (res1._begin) {
                                        periodStr = res1._begin;
                                    }
                                    if (res1._end) {
                                        periodStr = periodStr + '-' + res1._end;
                                    }
                                    if (res1._single_start) {
                                        periodStr = 'Single start : ' + res1._single_start;
                                    }
                                    else if (res1._absolute_repeat) {
                                        periodStr = periodStr + ' every ' + vm.getTimeInString(res1._absolute_repeat);
                                    }
                                    else if (res1._repeat) {
                                        periodStr = periodStr + ' every ' + vm.getTimeInString(res1._repeat);
                                    }
                                    if (periodStr)
                                        periodStrArr.push(periodStr);
                                    objArr.push({
                                        _calendar: res._calendar,
                                        _period: res1
                                    });

                                });
                            } else {
                                var periodStr = null;
                                if (res.period) {
                                    if (res.period._begin) {
                                        periodStr = res.period._begin;
                                    }
                                    if (res.period._end) {
                                        periodStr = periodStr + '-' + res.period._end;
                                    }
                                    if (res.period._single_start) {
                                        periodStr = 'Single start : ' + res.period._single_start;
                                    }
                                    else if (res.period._absolute_repeat) {
                                        periodStr = periodStr + ' every ' + vm.getTimeInString(res.period._absolute_repeat);
                                    }
                                    else if (res.period._repeat) {
                                        periodStr = periodStr + ' every ' + vm.getTimeInString(res.period._repeat);
                                    }
                                }
                                if (periodStr)
                                    periodStrArr.push(periodStr);
                                objArr.push({
                                    _calendar: res._calendar,
                                    _period: res.period
                                });
                            }
                            var flg = true;
                            var _calendar = {};
                            angular.forEach(vm.selectedCalendar, function (calendar) {
                                if (calendar.path == res._calendar) {
                                    _calendar = calendar;
                                    flg = false;
                                }
                            });

                            for (var i = 0; i < vm.runtimeList.length; i++) {
                                if (vm.runtimeList[i].calendar == _calendar) {
                                    flg = true;
                                    break;
                                }
                            }
                            if (!flg) {
                                vm.runtimeList.push(
                                    {
                                        calendar: _calendar,
                                        period: periodStrArr,
                                        obj: objArr,
                                        type: 'calendar'
                                    });
                            }
                        }

                    });
            }
            if (run_time.weekdays && run_time.weekdays.day) {

                angular.forEach(run_time.weekdays.day, function (res) {
                    var str = '';
                    if (res._day) {
                        str = vm.getWeekDays(res._day);
                        var periodStrArr = [], objArr = [];
                        if (angular.isArray(res.period)) {
                            angular.forEach(res.period, function (value1) {
                                var periodStr = null;
                                if (value1._begin) {
                                    periodStr = value1._begin;
                                }
                                if (value1._end) {
                                    periodStr = periodStr + '-' + value1._end;
                                }
                                if (value1._single_start) {
                                    periodStr = 'Single start : ' + value1._single_start;
                                }
                                else if (value1._absolute_repeat) {
                                    periodStr = periodStr + ' every ' + vm.getTimeInString(value1._absolute_repeat);
                                }
                                else if (value1._repeat) {
                                    periodStr = periodStr + ' every ' + vm.getTimeInString(value1._repeat);
                                }
                                if (periodStr)
                                    periodStrArr.push(periodStr);
                                objArr.push({
                                    _day: res._day,
                                    _period: value1
                                });

                            });
                        } else {
                            var periodStr = null;
                            if (res.period) {
                                if (res.period._begin) {
                                    periodStr = res.period._begin;
                                }
                                if (res.period._end) {
                                    periodStr = periodStr + '-' + res.period._end;
                                }
                                if (res.period._single_start) {
                                    periodStr = 'Single start : ' + res.period._single_start;
                                }
                                else if (res.period._absolute_repeat) {
                                    periodStr = periodStr + ' every ' + vm.getTimeInString(res.period._absolute_repeat);
                                }
                                else if (res.period._repeat) {
                                    periodStr = periodStr + ' every ' + vm.getTimeInString(res.period._repeat);
                                }
                            }
                            if (periodStr)
                                periodStrArr.push(periodStr);
                            objArr.push({
                                _day: res._day,
                                _period: res.period
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
            if (run_time.monthdays && run_time.monthdays.weekday && run_time.monthdays.weekday.length > 0) {

                angular.forEach(run_time.monthdays.weekday, function (value) {
                    if (!angular.isArray(value)) {

                        var str = '';
                        if (value._day) {

                            str = vm.getSpecificDay(value._which) + value._day + ' of month';
                            var periodStrArr = [], objArr = [];

                            if (angular.isArray(value.period)) {
                                angular.forEach(value.period, function (value1) {
                                    var periodStr = null;
                                    if (value1._begin) {
                                        periodStr = value1._begin;
                                    }
                                    if (value1._end) {
                                        periodStr = periodStr + '-' + value1._end;
                                    }
                                    if (value1._single_start) {
                                        periodStr = 'Single start : ' + value1._single_start;
                                    }
                                    else if (value1._absolute_repeat) {
                                        periodStr = periodStr + ' every ' + vm.getTimeInString(value1._absolute_repeat);
                                    }
                                    else if (value1._repeat) {
                                        periodStr = periodStr + ' every ' + vm.getTimeInString(value1._repeat);
                                    }
                                    if (periodStr)
                                        periodStrArr.push(periodStr);
                                    objArr.push({
                                        _day: value._day,
                                        _period: value1,
                                        _which: value._which
                                    });

                                });
                            } else {
                                var periodStr = null;
                                if (value.period) {
                                    if (value.period._begin) {
                                        periodStr = value.period._begin;
                                    }
                                    if (value.period._end) {
                                        periodStr = periodStr + '-' + value.period._end;
                                    }
                                    if (value.period._single_start) {
                                        periodStr = 'Single start : ' + value.period._single_start;
                                    }
                                    else if (value.period._absolute_repeat) {
                                        periodStr = periodStr + ' every ' + vm.getTimeInString(value.period._absolute_repeat);
                                    }
                                    else if (value.period._repeat) {
                                        periodStr = periodStr + ' every ' + vm.getTimeInString(value.period._repeat);
                                    }
                                }
                                if (periodStr)
                                    periodStrArr.push(periodStr);
                                objArr.push({
                                    _day: value._day,
                                    _period: value.period,
                                    _which: value._which
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
            else {

                if (run_time.monthdays && run_time.monthdays.weekday) {

                    if (!angular.isArray(run_time.monthdays.weekday)) {

                        var str = '';
                        if (run_time.monthdays.weekday._day) {

                            str = vm.getSpecificDay(run_time.monthdays.weekday._which) + run_time.monthdays.weekday._day + ' of month';
                            var periodStrArr = [], objArr = [];
                            if (run_time.monthdays.weekday.period) {
                                if (angular.isArray(run_time.monthdays.weekday.period)) {
                                    angular.forEach(run_time.monthdays.weekday.period, function (value1) {
                                        var periodStr = null;
                                        if (value1._begin) {
                                            periodStr = value1._begin;
                                        }
                                        if (value1._end) {
                                            periodStr = periodStr + '-' + value1._end;
                                        }
                                        if (value1._single_start) {
                                            periodStr = 'Single start : ' + value1._single_start;
                                        }
                                        else if (value1._absolute_repeat) {
                                            periodStr = periodStr + ' every ' + vm.getTimeInString(value1._absolute_repeat);
                                        }
                                        else if (value1._repeat) {
                                            periodStr = periodStr + ' every ' + vm.getTimeInString(value1._repeat);
                                        }
                                        if (periodStr)
                                            periodStrArr.push(periodStr);
                                        objArr.push({
                                            _day: run_time.monthdays.weekday._day,
                                            _period: value1,
                                            _which: run_time.monthdays.weekday._which
                                        });

                                    });
                                } else {
                                    var periodStr = null;
                                    if (run_time.monthdays.weekday.period) {
                                        if (run_time.monthdays.weekday.period._begin) {
                                            periodStr = run_time.monthdays.weekday.period._begin;
                                        }
                                        if (run_time.monthdays.weekday.period._end) {
                                            periodStr = periodStr + '-' + run_time.monthdays.weekday.period._end;
                                        }
                                        if (run_time.monthdays.weekday.period._single_start) {
                                            periodStr = 'Single start : ' + run_time.monthdays.weekday.period._single_start;
                                        }
                                        else if (run_time.monthdays.weekday.period._absolute_repeat) {
                                            periodStr = periodStr + ' every ' + vm.getTimeInString(run_time.monthdays.weekday.period._absolute_repeat);
                                        }
                                        else if (run_time.monthdays.weekday.period._repeat) {
                                            periodStr = periodStr + ' every ' + vm.getTimeInString(run_time.monthdays.weekday.period._repeat);
                                        }
                                    }
                                    if (periodStr)
                                        periodStrArr.push(periodStr);
                                    objArr.push({
                                        _day: run_time.monthdays.weekday._day,
                                        _period: run_time.monthdays.weekday.period,
                                        _which: run_time.monthdays.weekday._which
                                    });
                                }
                            }

                            vm.runtimeList.push({
                                frequency: str,
                                period: periodStrArr,
                                obj: objArr, type: 'weekday'
                            });


                        }
                    }

                }
            }
            if (run_time.monthdays && run_time.monthdays.day && run_time.monthdays.day.length > 0) {

                angular.forEach(run_time.monthdays.day, function (res) {

                    var str = '';
                    if (res && res._day) {
                        str = vm.getMonthDays(res._day) + ' of month';
                        var periodStrArr = [], objArr = [];

                        if (angular.isArray(res.period)) {
                            angular.forEach(res.period, function (res1) {
                                var periodStr = null;
                                if (res1._begin) {
                                    periodStr = res1._begin;
                                }
                                if (res1._end) {
                                    periodStr = periodStr + '-' + res1._end;
                                }
                                if (res1._single_start) {
                                    periodStr = 'Single start: ' + res1._single_start;
                                }
                                else if (res1._absolute_repeat) {
                                    periodStr = periodStr + ' every ' + vm.getTimeInString(res1._absolute_repeat);
                                }
                                else if (res1._repeat) {
                                    periodStr = periodStr + ' every ' + vm.getTimeInString(res1._repeat);
                                }
                                if (periodStr)
                                    periodStrArr.push(periodStr);
                                objArr.push({
                                    _day: res._day,
                                    _period: res1
                                });

                            });
                        } else {
                            var periodStr = null;
                            if (res.period) {
                                if (res.period._begin) {
                                    periodStr = res.period._begin;
                                }
                                if (res.period._end) {
                                    periodStr = periodStr + '-' + res.period._end;
                                }
                                if (res.period._single_start) {
                                    periodStr = 'Single start : ' + res.period._single_start;
                                }
                                else if (res.period._absolute_repeat) {
                                    periodStr = periodStr + ' every ' + vm.getTimeInString(res.period._absolute_repeat);
                                }
                                else if (res.period._repeat) {
                                    periodStr = periodStr + ' every ' + vm.getTimeInString(res.period._repeat);
                                }
                            }
                            if (periodStr)
                                periodStrArr.push(periodStr);
                            objArr.push({
                                _day: res._day,
                                _period: res.period
                            });
                        }

                        vm.runtimeList.push({
                            frequency: str,
                            period: periodStrArr, obj: objArr, type: 'monthdays'
                        });
                    }

                });
            }
            if (run_time.ultimos) {

                angular.forEach(run_time.ultimos, function (value) {
                    angular.forEach(value, function (res) {
                        var str = '';

                        if (res._day) {
                            str = vm.getMonthDays(res._day) + ' of ultimos';
                            var periodStrArr = [], objArr = [];
                            if (angular.isArray(res.period)) {
                                angular.forEach(res.period, function (res1) {
                                    var periodStr = null;
                                    if (res1._begin) {
                                        periodStr = res1._begin;
                                    }
                                    if (res1._end) {
                                        periodStr = periodStr + '-' + res1._end;
                                    }
                                    if (res1._single_start) {
                                        periodStr = 'Single start : ' + res1._single_start;
                                    }
                                    else if (res1._absolute_repeat) {
                                        periodStr = periodStr + ' every ' + vm.getTimeInString(res1._absolute_repeat);
                                    }
                                    else if (res1._repeat) {
                                        periodStr = periodStr + ' every ' + vm.getTimeInString(res1._repeat);
                                    }
                                    if (periodStr)
                                        periodStrArr.push(periodStr);
                                    objArr.push({
                                        _day: res._day,
                                        _period: res1
                                    });

                                });
                            } else {
                                var periodStr = null;
                                if (res.period) {
                                    if (res.period._begin) {
                                        periodStr = res.period._begin;
                                    }
                                    if (res.period._end) {
                                        periodStr = periodStr + '-' + res.period._end;
                                    }
                                    if (res.period._single_start) {
                                        periodStr = 'Single start : ' + res.period._single_start;
                                    }
                                    else if (res.period._absolute_repeat) {
                                        periodStr = periodStr + ' every ' + vm.getTimeInString(res.period._absolute_repeat);
                                    }
                                    else if (res.period._repeat) {
                                        periodStr = periodStr + ' every ' + vm.getTimeInString(res.period._repeat);
                                    }
                                }
                                if (periodStr)
                                    periodStrArr.push(periodStr);
                                objArr.push({
                                    _day: res._day,
                                    _period: res.period
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
                });
            }
            if (run_time.month) {
                if (angular.isArray(run_time.month)) {
                    angular.forEach(run_time.month, function (res) {
                        if (!vm.isEmpty(res.weekdays)) {
                            if (angular.isArray(res.weekdays)) {
                                angular.forEach(res.weekdays, function (value1) {
                                    if (angular.isArray(value1)) {
                                        angular.forEach(value1, function (val) {
                                            var str, str1;
                                            if (res._month) {
                                                str1 = vm.getMonths(res._month);
                                            }
                                            var periodStrArr = [], objArr = [];
                                            if (val._day) {
                                                str = vm.getWeekDays(val._day) + ' on ' + str1;
                                                if (angular.isArray(val.period)) {
                                                    angular.forEach(val.period, function (res1) {
                                                        var periodStr = null;
                                                        if (res1._begin) {
                                                            periodStr = res1._begin;
                                                        }
                                                        if (res1._end) {
                                                            periodStr = periodStr + '-' + res1._end;
                                                        }
                                                        if (res1._single_start) {
                                                            periodStr = 'Single start: ' + res1._single_start;
                                                        }
                                                        else if (res1._absolute_repeat) {
                                                            periodStr = periodStr + ' every ' + vm.getTimeInString(res1._absolute_repeat);
                                                        }
                                                        else if (res1._repeat) {
                                                            periodStr = periodStr + ' every ' + vm.getTimeInString(res1._repeat);
                                                        }
                                                        if (periodStr)
                                                            periodStrArr.push(periodStr);
                                                        objArr.push({
                                                            _day: val._day,
                                                            _month: res._month,
                                                            _period: res1
                                                        });
                                                    });
                                                } else {
                                                    var periodStr = null;
                                                    if (val.period) {
                                                        if (val.period._begin) {
                                                            periodStr = val.period._begin;
                                                        }
                                                        if (val.period._end) {
                                                            periodStr = periodStr + '-' + val.period._end;
                                                        }
                                                        if (val.period._single_start) {
                                                            periodStr = 'Single start: ' + val.period._single_start;
                                                        }
                                                        else if (val.period._absolute_repeat) {
                                                            periodStr = periodStr + ' every ' + vm.getTimeInString(val.period._absolute_repeat);
                                                        }
                                                        else if (val.period._repeat) {
                                                            periodStr = periodStr + ' every ' + vm.getTimeInString(val.period._repeat);
                                                        }
                                                    }
                                                    if (periodStr)
                                                        periodStrArr.push(periodStr);
                                                    objArr.push({
                                                        _day: val._day,
                                                        _month: res._month,
                                                        _period: val.period
                                                    });

                                                }

                                                vm.runtimeList.push(
                                                    {
                                                        frequency: str,
                                                        period: periodStrArr,
                                                        obj: objArr,
                                                        type: 'month',
                                                        type2: 'weekdays'
                                                    });

                                            }

                                        });
                                    } else {
                                        var periodStrArr = [], objArr = [];
                                        if (value1._day) {
                                            var str, str1;
                                            if (res._month) {
                                                str1 = vm.getMonths(res._month);
                                            }
                                            str = vm.getWeekDays(value1._day) + ' on ' + str1;
                                            if (angular.isArray(value1.period)) {
                                                angular.forEach(value1.period, function (res1) {
                                                    var periodStr = null;
                                                    if (res1._begin) {
                                                        periodStr = res1._begin;
                                                    }
                                                    if (res1._end) {
                                                        periodStr = periodStr + '-' + res1._end;
                                                    }
                                                    if (res1._single_start) {
                                                        periodStr = 'Single start: ' + res1._single_start;
                                                    }
                                                    else if (res1._absolute_repeat) {
                                                        periodStr = periodStr + ' every ' + vm.getTimeInString(res1._absolute_repeat);
                                                    }
                                                    else if (res1._repeat) {
                                                        periodStr = periodStr + ' every ' + vm.getTimeInString(res1._repeat);
                                                    }
                                                    if (periodStr)
                                                        periodStrArr.push(periodStr);
                                                    objArr.push({
                                                        _day: value1._day,
                                                        _month: res._month,
                                                        _period: res1
                                                    });

                                                });
                                            } else {
                                                var periodStr = null;
                                                if (value1.period) {
                                                    if (value1.period._begin) {
                                                        periodStr = value1.period._begin;
                                                    }
                                                    if (value1.period._end) {
                                                        periodStr = periodStr + '-' + value1.period._end;
                                                    }
                                                    if (value1.period._single_start) {
                                                        periodStr = 'Single start: ' + value1.period._single_start;
                                                    }
                                                    else if (value1.period._absolute_repeat) {
                                                        periodStr = periodStr + ' every ' + vm.getTimeInString(value1.period._absolute_repeat);
                                                    }
                                                    else if (value1.period._repeat) {
                                                        periodStr = periodStr + ' every ' + vm.getTimeInString(value1.period._repeat);
                                                    }
                                                }
                                                if (periodStr)
                                                    periodStrArr.push(periodStr);
                                                objArr.push({
                                                    _day: value1._day,
                                                    _month: res._month,
                                                    _period: value1.period
                                                });

                                            }

                                            vm.runtimeList.push(
                                                {
                                                    frequency: str,
                                                    period: periodStrArr,
                                                    obj: objArr,
                                                    type: 'month',
                                                    type2: 'weekdays'
                                                });
                                        }
                                    }

                                });
                            } else {

                                if (angular.isArray(res.weekdays.day)) {
                                    angular.forEach(res.weekdays.day, function (val) {
                                        var str, str1;
                                        if (res._month)
                                            str1 = vm.getMonths(res._month);
                                        if (val._day) {
                                            str = vm.getWeekDays(val._day) + ' on ' + str1;
                                            var periodStrArr = [], objArr = [];
                                            if (angular.isArray(val.period)) {
                                                angular.forEach(val.period, function (res1) {
                                                    var periodStr = null;
                                                    if (res1._begin) {
                                                        periodStr = res1._begin;
                                                    }
                                                    if (res1._end) {
                                                        periodStr = periodStr + '-' + res1._end;
                                                    }
                                                    if (res1._single_start) {
                                                        periodStr = 'Single start: ' + res1._single_start;
                                                    }
                                                    else if (res1._absolute_repeat) {
                                                        periodStr = periodStr + ' every ' + vm.getTimeInString(res1._absolute_repeat);
                                                    }
                                                    else if (res1._repeat) {
                                                        periodStr = periodStr + ' every ' + vm.getTimeInString(res1._repeat);
                                                    }
                                                    if (periodStr)
                                                        periodStrArr.push(periodStr);
                                                    objArr.push({
                                                        _day: val._day,
                                                        _month: res._month,
                                                        _period: res1
                                                    });

                                                });
                                            } else {
                                                var periodStr = null;
                                                if (val.period) {

                                                    if (val.period._begin) {
                                                        periodStr = val.period._begin;
                                                    }
                                                    if (val.period._end) {
                                                        periodStr = periodStr + '-' + val.period._end;
                                                    }
                                                    if (val.period._single_start) {
                                                        periodStr = 'Single start: ' + val.period._single_start;
                                                    }
                                                    else if (val.period._absolute_repeat) {
                                                        periodStr = periodStr + ' every ' + vm.getTimeInString(val.period._absolute_repeat);
                                                    }
                                                    else if (val.period._repeat) {
                                                        periodStr = periodStr + ' every ' + vm.getTimeInString(val.period._repeat);
                                                    }
                                                }
                                                if (periodStr)
                                                    periodStrArr.push(periodStr);
                                                objArr.push({
                                                    _day: val._day,
                                                    _month: res._month,
                                                    _period: val.period
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
                                } else {
                                    var str, str1;

                                    if (res._month)
                                        str1 = vm.getMonths(res._month);

                                    if (res.weekdays.day._day) {

                                        str = vm.getWeekDays(res.weekdays.day._day) + ' on ' + str1;
                                        var periodStrArr = [], objArr = [];

                                        if (angular.isArray(res.weekdays.day.period)) {
                                            angular.forEach(res.weekdays.day.period, function (res1) {
                                                var periodStr = null;
                                                if (res1._begin) {
                                                    periodStr = res1._begin;
                                                }
                                                if (res1._end) {
                                                    periodStr = periodStr + '-' + res1._end;
                                                }
                                                if (res1._single_start) {
                                                    periodStr = 'Single start: ' + res1._single_start;
                                                }
                                                else if (res1._absolute_repeat) {
                                                    periodStr = periodStr + ' every ' + vm.getTimeInString(res1._absolute_repeat);
                                                }
                                                else if (res1._repeat) {
                                                    periodStr = periodStr + ' every ' + vm.getTimeInString(res1._repeat);
                                                }
                                                if (periodStr)
                                                    periodStrArr.push(periodStr);
                                                objArr.push({
                                                    _day: res.weekdays.day._day,
                                                    _month: res._month,
                                                    _period: res1
                                                });
                                            });
                                        } else {
                                            var periodStr = null;
                                            if (res.weekdays.day.period) {
                                                if (res.weekdays.day.period._begin) {
                                                    periodStr = res.weekdays.day.period._begin;
                                                }
                                                if (res.weekdays.day.period._end) {
                                                    periodStr = periodStr + '-' + res.weekdays.day.period._end;
                                                }
                                                if (res.weekdays.day.period._single_start) {
                                                    periodStr = 'Single start: ' + res.weekdays.day.period._single_start;
                                                }
                                                else if (res.weekdays.day.period._absolute_repeat) {
                                                    periodStr = periodStr + ' every ' + vm.getTimeInString(res.weekdays.day.period._absolute_repeat);
                                                }
                                                else if (res.weekdays.day.period._repeat) {
                                                    periodStr = periodStr + ' every ' + vm.getTimeInString(res.weekdays.day.period._repeat);
                                                }
                                            }
                                            if (periodStr)
                                                periodStrArr.push(periodStr);
                                            objArr.push({
                                                _day: res.weekdays.day._day,
                                                _month: res._month,
                                                _period: res.weekdays.day.period
                                            });

                                        }

                                        vm.runtimeList.push({
                                            frequency: str,
                                            period: periodStrArr,
                                            obj: objArr,
                                            type: 'month',
                                            type2: 'weekdays'
                                        });

                                    }
                                }
                            }
                        }
                        if (!vm.isEmpty(res.ultimos)) {

                            if (angular.isArray(res.ultimos)) {
                                angular.forEach(res.ultimos, function (value1) {
                                    if (angular.isArray(value1)) {
                                        angular.forEach(value1, function (val) {
                                            var str, str1;
                                            if (res._month) {
                                                str1 = vm.getMonths(res._month);
                                            }
                                            if (val._day) {
                                                str = 'Ultimos: ' + vm.getMonthDays(val._day) + ' of ' + str1;
                                                var periodStrArr = [], objArr = [];
                                                if (angular.isArray(val.period)) {
                                                    angular.forEach(val.period, function (res1) {
                                                        var periodStr = null;
                                                        if (res1._begin) {
                                                            periodStr = res1._begin;
                                                        }
                                                        if (res1._end) {
                                                            periodStr = periodStr + '-' + res1._end;
                                                        }
                                                        if (res1._single_start) {
                                                            periodStr = 'Single start: ' + res1._single_start;
                                                        }
                                                        else if (res1._absolute_repeat) {
                                                            periodStr = periodStr + ' every ' + vm.getTimeInString(res1._absolute_repeat);
                                                        }
                                                        else if (res1._repeat) {
                                                            periodStr = periodStr + ' every ' + vm.getTimeInString(res1._repeat);
                                                        }
                                                        if (periodStr)
                                                            periodStrArr.push(periodStr);
                                                        objArr.push({
                                                            _day: val._day,
                                                            _month: res._month,
                                                            _period: res1
                                                        });

                                                    });
                                                } else {
                                                    var periodStr = null;
                                                    if (val.period) {
                                                        if (val.period._begin) {
                                                            periodStr = val.period._begin;
                                                        }
                                                        if (val.period._end) {
                                                            periodStr = periodStr + '-' + val.period._end;
                                                        }
                                                        if (val.period._single_start) {
                                                            periodStr = 'Single start: ' + val.period._single_start;
                                                        }
                                                        else if (val.period._absolute_repeat) {
                                                            periodStr = periodStr + ' every ' + vm.getTimeInString(val.period._absolute_repeat);
                                                        }
                                                        else if (val.period._repeat) {
                                                            periodStr = periodStr + ' every ' + vm.getTimeInString(val.period._repeat);
                                                        }
                                                    }

                                                    if (periodStr)
                                                        periodStrArr.push(periodStr);
                                                    objArr.push({
                                                        _day: val._day,
                                                        _month: res._month,
                                                        _period: val.period
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
                                    } else {

                                        if (value1._day) {
                                            var str, str1;
                                            if (res._month) {
                                                str1 = vm.getMonths(res._month);
                                            }
                                            str = 'Ultimos: ' + vm.getMonthDays(value1._day) + ' of ' + str1;
                                            var periodStrArr = [], objArr = [];
                                            if (angular.isArray(value1.period)) {
                                                angular.forEach(value1.period, function (res1) {
                                                    var periodStr = null;
                                                    if (res1._begin) {
                                                        periodStr = res1._begin;
                                                    }
                                                    if (res1._end) {
                                                        periodStr = periodStr + '-' + res1._end;
                                                    }
                                                    if (res1._single_start) {
                                                        periodStr = 'Single start: ' + res1._single_start;
                                                    }
                                                    else if (res1._absolute_repeat) {
                                                        periodStr = periodStr + ' every ' + vm.getTimeInString(res1._absolute_repeat);
                                                    }
                                                    else if (res1._repeat) {
                                                        periodStr = periodStr + ' every ' + vm.getTimeInString(res1._repeat);
                                                    }
                                                    if (periodStr)
                                                        periodStrArr.push(periodStr);
                                                    objArr.push({
                                                        _day: value1._day,
                                                        _month: res._month,
                                                        _period: res1
                                                    });

                                                });
                                            } else {
                                                var periodStr = null;
                                                if (value1.period) {
                                                    if (value1.period._begin) {
                                                        periodStr = value1.period._begin;
                                                    }
                                                    if (value1.period._end) {
                                                        periodStr = periodStr + '-' + value1.period._end;
                                                    }
                                                    if (value1.period._single_start) {
                                                        periodStr = 'Single start: ' + value1.period._single_start;
                                                    }
                                                    else if (value1.period._absolute_repeat) {
                                                        periodStr = periodStr + ' every ' + vm.getTimeInString(value1.period._absolute_repeat);
                                                    }
                                                    else if (value1.period._repeat) {
                                                        periodStr = periodStr + ' every ' + vm.getTimeInString(value1.period._repeat);
                                                    }
                                                }

                                                if (periodStr)
                                                    periodStrArr.push(periodStr);
                                                objArr.push({
                                                    _day: value1._day,
                                                    _month: res._month,
                                                    _period: value1.period
                                                });
                                            }

                                            vm.runtimeList.push({
                                                frequency: str,
                                                period: periodStrArr,
                                                obj: objArr,
                                                type: 'month', type2: 'ultimos'
                                            });
                                        }
                                    }

                                });
                            } else {

                                if (angular.isArray(res.ultimos.day)) {
                                    angular.forEach(res.ultimos.day, function (val) {
                                        var str, str1;
                                        if (res._month)
                                            str1 = vm.getMonths(res._month);
                                        if (val._day) {
                                            str = 'Ultimos: ' + vm.getMonthDays(val._day) + ' of ' + str1;
                                            var periodStrArr = [], objArr = [];
                                            if (angular.isArray(val.period)) {
                                                angular.forEach(val.period, function (res1) {
                                                    var periodStr = null;
                                                    if (res1._begin) {
                                                        periodStr = res1._begin;
                                                    }
                                                    if (res1._end) {
                                                        periodStr = periodStr + '-' + res1._end;
                                                    }
                                                    if (res1._single_start) {
                                                        periodStr = 'Single start: ' + res1._single_start;
                                                    }
                                                    else if (res1._absolute_repeat) {
                                                        periodStr = periodStr + ' every ' + vm.getTimeInString(res1._absolute_repeat);
                                                    }
                                                    else if (res1._repeat) {
                                                        periodStr = periodStr + ' every ' + vm.getTimeInString(res1._repeat);
                                                    }
                                                    if (periodStr)
                                                        periodStrArr.push(periodStr);
                                                    objArr.push({
                                                        _day: val._day,
                                                        _month: res._month,
                                                        _period: res1
                                                    });

                                                });
                                            } else {
                                                var periodStr = null;
                                                if (val.period) {
                                                    if (val.period._begin) {
                                                        periodStr = val.period._begin;
                                                    }
                                                    if (val.period._end) {
                                                        periodStr = periodStr + '-' + val.period._end;
                                                    }
                                                    if (val.period._single_start) {
                                                        periodStr = 'Single start: ' + val.period._single_start;
                                                    }
                                                    else if (val.period._absolute_repeat) {
                                                        periodStr = periodStr + ' every ' + vm.getTimeInString(val.period._absolute_repeat);
                                                    }
                                                    else if (val.period._repeat) {
                                                        periodStr = periodStr + ' every ' + vm.getTimeInString(val.period._repeat);
                                                    }
                                                }
                                                if (periodStr)
                                                    periodStrArr.push(periodStr);
                                                objArr.push({
                                                    _day: val._day,
                                                    _month: res._month,
                                                    _period: val.period
                                                });

                                            }

                                            vm.runtimeList.push({
                                                frequency: str,
                                                period: periodStrArr, obj: objArr,
                                                type: 'month', type2: 'ultimos'
                                            });
                                        }
                                    });
                                } else {

                                    var str, str1;
                                    if (res._month)
                                        str1 = vm.getMonths(res._month);

                                    if (res.ultimos.day._day) {

                                        str = 'Ultimos: ' + vm.getMonthDays(res.ultimos.day._day) + ' of ' + str1;
                                        var periodStrArr = [], objArr = [];
                                        if (angular.isArray(res.ultimos.day.period)) {
                                            angular.forEach(res.ultimos.day.period, function (res1) {
                                                var periodStr = null;
                                                if (res1._begin) {
                                                    periodStr = res1._begin;
                                                }
                                                if (res1._end) {
                                                    periodStr = periodStr + '-' + res1._end;
                                                }
                                                if (res1._single_start) {
                                                    periodStr = 'Single start: ' + res1._single_start;
                                                }
                                                else if (res1._absolute_repeat) {
                                                    periodStr = periodStr + ' every ' + vm.getTimeInString(res1._absolute_repeat);
                                                }
                                                else if (res1._repeat) {
                                                    periodStr = periodStr + ' every ' + vm.getTimeInString(res1._repeat);
                                                }
                                                if (periodStr)
                                                    periodStrArr.push(periodStr);
                                                objArr.push({
                                                    _day: res.ultimos.day._day,
                                                    _month: res._month,
                                                    _period: res1
                                                });

                                            });
                                        } else {
                                            var periodStr = null;
                                            if (res.ultimos.day.period) {
                                                if (res.ultimos.day.period._begin) {
                                                    periodStr = res.ultimos.day.period._begin;
                                                }
                                                if (res.ultimos.day.period._end) {
                                                    periodStr = periodStr + '-' + res.ultimos.day.period._end;
                                                }
                                                if (res.ultimos.day.period._single_start) {
                                                    periodStr = 'Single start: ' + res.ultimos.day.period._single_start;
                                                }
                                                else if (res.ultimos.day.period._absolute_repeat) {
                                                    periodStr = periodStr + ' every ' + vm.getTimeInString(res.ultimos.day.period._absolute_repeat);
                                                }
                                                else if (res.ultimos.day.period._repeat) {
                                                    periodStr = periodStr + ' every ' + vm.getTimeInString(res.ultimos.day.period._repeat);
                                                }
                                            }

                                            if (periodStr)
                                                periodStrArr.push(periodStr);
                                            objArr.push({
                                                _day: res.ultimos.day._day,
                                                _month: res._month,
                                                _period: res.ultimos.day.period
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
                                }
                            }
                        }
                        if (!vm.isEmpty(res.monthdays)) {

                            if (res.monthdays.weekday) {

                                if (angular.isArray(res.monthdays.weekday)) {

                                    angular.forEach(res.monthdays.weekday, function (value) {
                                        if (!angular.isArray(value)) {

                                            var str, str1;
                                            if (res._month)
                                                str1 = vm.getMonths(res._month);
                                            if (value._day) {

                                                str = vm.getSpecificDay(value._which) + value._day + ' of ' + str1;
                                                var periodStrArr = [], objArr = [];

                                                if (angular.isArray(value.period)) {
                                                    angular.forEach(value.period, function (value1) {
                                                        var periodStr = null;
                                                        if (value1._begin) {
                                                            periodStr = value1._begin;
                                                        }
                                                        if (value1._end) {
                                                            periodStr = periodStr + '-' + value1._end;
                                                        }
                                                        if (value1._single_start) {
                                                            periodStr = 'Single start : ' + value1._single_start;
                                                        }
                                                        else if (value1._absolute_repeat) {
                                                            periodStr = periodStr + ' every ' + vm.getTimeInString(value1._absolute_repeat);
                                                        }
                                                        else if (value1._repeat) {
                                                            periodStr = periodStr + ' every ' + vm.getTimeInString(value1._repeat);
                                                        }
                                                        if (periodStr)
                                                            periodStrArr.push(periodStr);
                                                        objArr.push({
                                                            _day: value._day,
                                                            _month: res._month,
                                                            _period: value1,
                                                            _which: value._which
                                                        });

                                                    });
                                                } else {
                                                    var periodStr = null;
                                                    if (value.period) {
                                                        if (value.period._begin) {
                                                            periodStr = value.period._begin;
                                                        }
                                                        if (value.period._end) {
                                                            periodStr = periodStr + '-' + value.period._end;
                                                        }
                                                        if (value.period._single_start) {
                                                            periodStr = 'Single start : ' + value.period._single_start;
                                                        }
                                                        else if (value.period._absolute_repeat) {
                                                            periodStr = periodStr + ' every ' + vm.getTimeInString(value.period._absolute_repeat);
                                                        }
                                                        else if (value.period._repeat) {
                                                            periodStr = periodStr + ' every ' + vm.getTimeInString(value.period._repeat);
                                                        }
                                                    }
                                                    if (periodStr)
                                                        periodStrArr.push(periodStr);
                                                    objArr.push({
                                                        _day: value._day,
                                                        _month: res._month,
                                                        _period: value.period,
                                                        _which: value._which
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
                                else {
                                    if (res.monthdays.weekday) {

                                        var str, str1;
                                        if (res._month)
                                            str1 = vm.getMonths(res._month);
                                        if (res.monthdays.weekday._day) {

                                            str = vm.getSpecificDay(res.monthdays.weekday._which) + res.monthdays.weekday._day + ' of ' + str1;
                                            var periodStrArr = [], objArr = [];
                                            if (angular.isArray(res.monthdays.weekday.period)) {
                                                angular.forEach(res.monthdays.weekday.period, function (value1) {
                                                    var periodStr = null;
                                                    if (value1._begin) {
                                                        periodStr = value1._begin;
                                                    }
                                                    if (value1._end) {
                                                        periodStr = periodStr + '-' + value1._end;
                                                    }
                                                    if (value1._single_start) {
                                                        periodStr = 'Single start : ' + value1._single_start;
                                                    }
                                                    else if (value1._absolute_repeat) {
                                                        periodStr = periodStr + ' every ' + vm.getTimeInString(value1._absolute_repeat);
                                                    }
                                                    else if (value1._repeat) {
                                                        periodStr = periodStr + ' every ' + vm.getTimeInString(value1._repeat);
                                                    }
                                                    if (periodStr)
                                                        periodStrArr.push(periodStr);
                                                    objArr.push({
                                                        _day: res.monthdays.weekday._day,
                                                        _month: res._month,
                                                        _period: value1,
                                                        _which: res.monthdays.weekday._which
                                                    });

                                                });
                                            } else {
                                                var periodStr = null;
                                                if (res.monthdays.weekday.period) {
                                                    if (res.monthdays.weekday.period._begin) {
                                                        periodStr = res.monthdays.weekday.period._begin;
                                                    }
                                                    if (res.monthdays.weekday.period._end) {
                                                        periodStr = periodStr + '-' + res.monthdays.weekday.period._end;
                                                    }
                                                    if (res.monthdays.weekday.period._single_start) {
                                                        periodStr = 'Single start : ' + res.monthdays.weekday.period._single_start;
                                                    }
                                                    else if (res.monthdays.weekday.period._absolute_repeat) {
                                                        periodStr = periodStr + ' every ' + vm.getTimeInString(res.monthdays.weekday.period._absolute_repeat);
                                                    }
                                                    else if (res.monthdays.weekday.period._repeat) {
                                                        periodStr = periodStr + ' every ' + vm.getTimeInString(res.monthdays.weekday.period._repeat);
                                                    }
                                                }
                                                if (periodStr)
                                                    periodStrArr.push(periodStr);
                                                objArr.push({
                                                    _day: res.monthdays.weekday._day,
                                                    _month: res._month,
                                                    _period: res.monthdays.weekday.period,
                                                    _which: res.monthdays.weekday._which
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
                                }
                            }
                            if (res.monthdays.day) {

                                if (angular.isArray(res.monthdays.day)) {
                                    angular.forEach(res.monthdays.day, function (val) {
                                        var str, str1;
                                        if (res._month)
                                            str1 = vm.getMonths(res._month);
                                        if (val._day) {
                                            str = vm.getMonthDays(val._day) + ' of ' + str1;
                                            var periodStrArr = [], objArr = [];
                                            if (angular.isArray(val.period)) {
                                                angular.forEach(val.period, function (res1) {
                                                    var periodStr = null;
                                                    if (res1._begin) {
                                                        periodStr = res1._begin;
                                                    }
                                                    if (res1._end) {
                                                        periodStr = periodStr + '-' + res1._end;
                                                    }
                                                    if (res1._single_start) {
                                                        periodStr = 'Single start: ' + res1._single_start;
                                                    }
                                                    else if (res1._absolute_repeat) {
                                                        periodStr = periodStr + ' every ' + vm.getTimeInString(res1._absolute_repeat);
                                                    }
                                                    else if (res1._repeat) {
                                                        periodStr = periodStr + ' every ' + vm.getTimeInString(res1._repeat);
                                                    }
                                                    if (periodStr)
                                                        periodStrArr.push(periodStr);
                                                    objArr.push({
                                                        _day: val._day,
                                                        _month: res._month,
                                                        _period: res1
                                                    });

                                                });
                                            } else {
                                                var periodStr = null;
                                                if (val.period) {
                                                    if (val.period._begin) {
                                                        periodStr = val.period._begin;
                                                    }
                                                    if (val.period._end) {
                                                        periodStr = periodStr + '-' + val.period._end;
                                                    }
                                                    if (val.period._single_start) {
                                                        periodStr = 'Single start: ' + val.period._single_start;
                                                    }
                                                    else if (val.period._absolute_repeat) {
                                                        periodStr = periodStr + ' every ' + vm.getTimeInString(val.period._absolute_repeat);
                                                    }
                                                    else if (val.period._repeat) {
                                                        periodStr = periodStr + ' every ' + vm.getTimeInString(val.period._repeat);
                                                    }
                                                }
                                                if (periodStr)
                                                    periodStrArr.push(periodStr);
                                                objArr.push({
                                                    _day: val._day,
                                                    _month: res._month,
                                                    _period: val.period
                                                });
                                            }

                                            vm.runtimeList.push({
                                                frequency: str,
                                                period: periodStrArr,
                                                obj: objArr, type: 'month', type2: 'monthdays'
                                            });

                                        }
                                    });
                                } else {

                                    var str, str1;
                                    if (res._month)
                                        str1 = vm.getMonths(res._month);

                                    if (res.monthdays.day._day) {

                                        str = vm.getMonthDays(res.monthdays.day._day) + ' of ' + str1;
                                        var periodStrArr = [], objArr = [];
                                        if (angular.isArray(res.monthdays.day.period)) {
                                            angular.forEach(res.monthdays.day.period, function (res1) {
                                                var periodStr = null;
                                                if (res1._begin) {
                                                    periodStr = res1._begin;
                                                }
                                                if (res1._end) {
                                                    periodStr = periodStr + '-' + res1._end;
                                                }
                                                if (res1._single_start) {
                                                    periodStr = 'Single start: ' + res1._single_start;
                                                }
                                                else if (res1._absolute_repeat) {
                                                    periodStr = periodStr + ' every ' + vm.getTimeInString(res1._absolute_repeat);
                                                }
                                                else if (res1._repeat) {
                                                    periodStr = periodStr + ' every ' + vm.getTimeInString(res1._repeat);
                                                }
                                                if (periodStr)
                                                    periodStrArr.push(periodStr);
                                                objArr.push({
                                                    _day: res.monthdays.day._day,
                                                    _month: res._month,
                                                    _period: res1
                                                });

                                            });
                                        } else {

                                            var periodStr = null;
                                            if (res.monthdays.day.period) {
                                                if (res.monthdays.day.period._begin) {
                                                    periodStr = res.monthdays.day.period._begin;
                                                }
                                                if (res.monthdays.day.period._end) {
                                                    periodStr = periodStr + '-' + res.monthdays.day.period._end;
                                                }
                                                if (res.monthdays.day.period._single_start) {
                                                    periodStr = 'Single start: ' + res.monthdays.day.period._single_start;
                                                }
                                                else if (res.monthdays.day.period._absolute_repeat) {
                                                    periodStr = periodStr + ' every ' + vm.getTimeInString(res.monthdays.day.period._absolute_repeat);
                                                }
                                                else if (res.monthdays.day.period._repeat) {
                                                    periodStr = periodStr + ' every ' + vm.getTimeInString(res.monthdays.day.period._repeat);
                                                }
                                            }

                                            if (periodStr)
                                                periodStrArr.push(periodStr);
                                            objArr.push({
                                                _day: res.monthdays.day._day,
                                                _month: res._month,
                                                _period: res.monthdays.day.period
                                            });
                                        }

                                        vm.runtimeList.push({
                                            frequency: str,
                                            period: periodStrArr,
                                            obj: objArr, type: 'month', type2: 'monthdays'
                                        });

                                    }
                                }

                            }
                        }
                    });
                }
            }
            if (run_time.holidays) {
                vm.holidayDates = [];
                vm.calendarFiles = [];
                angular.forEach(run_time.holidays, function (value) {
                    if (value) {
                        if (value.day && value.day._day) {
                            vm.runTime1.holidays.weekdays.day._day = value.day._day.toString().split(' ');
                            vm.runTime1.holidays.weekdays.day._day.sort();
                        }
                        if (angular.isArray(value)) {
                            angular.forEach(value, function (value1) {
                                if (value1._date && !value1._calendar) {
                                    vm.holidayDates.push(new Date(value1._date));
                                }
                                if (value1._file) {
                                    vm.calendarFiles.push('file: ' + value1._file);
                                }
                                if (value1._live_file) {
                                    vm.calendarFiles.push('live_file: ' + value1._live_file);
                                }
                            });
                        } else {
                            if (value._date && !value._calendar) {
                                vm.holidayDates.push(new Date(value._date));
                            }
                            if (value._file) {
                                vm.calendarFiles.push('file: ' + value._file);
                            }
                            if (value._live_file) {
                                vm.calendarFiles.push('live_file: ' + value._live_file);
                            }
                        }
                    }
                });
            }

            if (vm.order) {
                vm.order.runTime = xml;
            }
            else {
                vm.schedule.runTime = xml;
            }
            vm.xmlObj.xml = vkbeautify.xml(xml, 2);

        }

        function generateCalendarObj(data, obj) {
            var arr = [];
            var from, to;

            if (data.tab == 'weekDays') {
                if (!obj.includes.weekdays)
                    obj.includes.weekdays = [];

                if (data.startingWithW) {
                    from = moment(data.startingWithW).format('YYYY-MM-DD')
                }
                if (data.endOnW) {
                    to = moment(data.endOnW).format('YYYY-MM-DD')
                }
                obj.includes.weekdays.push({days: data.days, from: from, to: to});
            } else if (data.tab == 'monthDays') {
                if (data.isUltimos == 'months') {
                    if (!obj.includes.monthdays)
                        obj.includes.monthdays = [];

                    if (data.startingWithM) {
                        from = moment(data.startingWithM).format('YYYY-MM-DD')
                    }
                    if (data.endOnM) {
                        to = moment(data.endOnM).format('YYYY-MM-DD')
                    }
                    obj.includes.monthdays.push({days: data.selectedMonths, from: from, to: to});
                } else {
                    if (!obj.includes.ultimos)
                        obj.includes.ultimos = [];

                    if (data.startingWithM) {
                        from = moment(data.startingWithM).format('YYYY-MM-DD')
                    }
                    if (data.endOnM) {
                        to = moment(data.endOnM).format('YYYY-MM-DD')
                    }
                    obj.includes.ultimos.push({days: data.selectedMonthsU, from: from, to: to});
                }
            } else if (data.tab == 'specificWeekDays') {
                arr.push({
                    day: getDay(data.specificWeekDay),
                    weekOfMonth: Math.abs(data.which)
                });

                if (data.startingWithS) {
                    from = moment(data.startingWithS).format('YYYY-MM-DD')
                }
                if (data.endOnS) {
                    to = moment(data.endOnS).format('YYYY-MM-DD')
                }
                if (data.which > 0) {
                    if (!obj.includes.monthdays)
                        obj.includes.monthdays = [];
                    obj.includes.monthdays.push({weeklyDays: arr, from: from, to: to});
                } else {
                    if (!obj.includes.ultimos)
                        obj.includes.ultimos = [];
                    obj.includes.ultimos.push({weeklyDays: arr, from: from, to: to});
                }
            } else if (data.tab == 'others') {
                if (!obj.includes.repetitions)
                    obj.includes.repetitions = [];
                var obj1 = {};
                obj1.repetition = data.dateEntity;
                obj1.step = data.interval || 1;
                if (data.startingWith)
                    obj1.from = moment(data.startingWith).format('YYYY-MM-DD');
                if (data.endOnW) {
                    obj1.to = moment(data.endOn).format('YYYY-MM-DD')
                }
                obj.includes.repetitions.push(obj1);

            }
            return obj;
        }


        function checkPeriod(value, period) {
            var flg = false;
            if (value._when_holiday == period._when_holiday) {
                flg = true;
            }
            else if (!value._when_holiday && period._when_holiday == 'suppress') {
                flg = true;
            }
            if (!period._when_holiday && value._when_holiday == 'suppress') {
                flg = true;
            }
            if (period._single_start && flg && value._single_start) {
                return value._single_start == period._single_start;
            }
            if (period._repeat && flg && value._repeat) {
                return value._repeat == period._repeat;
            }
            if (period._begin && flg && value._begin) {
                return value._begin == period._begin;
            }
            if (period._end && flg && value._end) {
                return value._end == period._end;
            }
            if (period._absolute_repeat && flg && value._absolute_repeat) {
                return value._absolute_repeat == period._absolute_repeat;
            }
        }

        vm.removeSchedule = function () {
            vm._xmlTemp = {run_time: {}};
            var xmlStr = x2js.json2xml_str(vm._xmlTemp);
            xmlStr = xmlStr.replace(/,/g, ' ');

            getXml2Json(xmlStr);
        };

        vm.addPeriodInFrequency = function (data) {
            $rootScope.$broadcast('period-editor', {
                frequency: data
            });
            $('#period-editor').modal('show');
            $('.fade-modal').css('opacity', '0.85');
        };
        vm.addRestrictionInCalendar = function (data) {
            $rootScope.$broadcast('restriction-frequency-editor', {
                frequencyList: vm.frequencyList
            });
            $('#restriction-editor').modal('show');
            $('.fade-modal').css('opacity', '0.85');
        };
        vm.editRestrictionInCalendar = function (frequency) {
            $rootScope.$broadcast('restriction-frequency-editor', {
                frequencyList: vm.frequencyList,
                updateFrequency: frequency
            });
            $('#restriction-editor').modal('show');
            $('.fade-modal').css('opacity', '0.85');
        };
        vm.deleteRestrictionInCalendar = function (frequency) {
           for(var i=0; i< vm.frequencyList.length;i++){
               if(vm.frequencyList[i].str == frequency.str){
                   vm.frequencyList.splice(i,1);
                   break;
               }
           }
        };

        vm.$on('save-restriction-frequency', function(event, data){
            vm.frequencyList = data.list;
        });

        vm.editPeriodFromFrequency = function (data, index, periodStr) {
            var period = data.obj[index]._period;
            if (period == '' || !period) {
                for (var i = 0; i < data.obj.length; i++) {
                    if (data.obj[i]._period) {
                        if (i > index) {
                            period = data.obj[i]._period;
                            break;
                        }
                    }
                }
            }

            $rootScope.$broadcast('period-editor', {
                frequency: data,
                period: period,
                periodStr: periodStr
            });
            $('#period-editor').modal('show');
            $('.fade-modal').css('opacity', '0.85');
        };
        $scope.$on('cancel-period', function () {
            _tempPeriod = {};
        });
        $scope.$on('save-period', function (event, data1) {
            var data = angular.copy(data1);
            if (data.frequency && !vm.isEmpty(data.frequency)) {
                editRunTime(data);
            } else {
                vm.runTime.period = data.period.period;
                vm.runTime.frequency = data.period.frequency;
                if (vm.editor.update) {
                    if (_tempPeriod && !vm.isEmpty(_tempPeriod)) {
                        for (var i = 0; i < vm.periodList.length; i++) {
                            if (angular.equals(vm.periodList[i], _tempPeriod)) {
                                vm.periodList[i] = angular.copy(vm.runTime);
                            }
                        }
                        _tempPeriod = {};
                    } else {
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
                var _xml = x2js.xml_str2json(vm.xmlObj.xml);
                if (typeof _xml.schedule !== 'object') _xml.schedule = {};
                delete _xml.schedule['_valid_from'];
                delete _xml.schedule['_valid_to'];
                delete _xml.schedule['_title'];
                delete _xml.schedule['_substitute'];

                var xmlStr = x2js.json2xml_str(_xml);
                xmlStr = xmlStr.replace(/,/g, ' ');

                getXml2Json(xmlStr);
            } catch (e) {
                console.log(e);
            }
        });

        $scope.$on('save-schedule', function (event, data1) {
            vm.sch = data1.sch;
            vm._schedules = data1._schedules;
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

            if (!vm.isEmpty(vm.updateTime.obj) && angular.isArray(vm.updateTime.obj)) {

                angular.forEach(vm.updateTime.obj, function (value) {
                    if (value._period) {
                        var obj = {};
                        if (vm.updateTime.type2) {
                            obj.tab = vm.updateTime.type2 == 'weekdays' ? 'weekDays' : vm.updateTime.type2 == 'monthdays' ? 'monthDays' : vm.updateTime.type2 == 'weekday' ? 'specificWeekDays' : vm.updateTime.type2 == 'ultimos' ? 'monthDays' : 'specificDays';
                        } else {
                            obj.tab = vm.updateTime.type == 'weekdays' ? 'weekDays' : vm.updateTime.type == 'monthdays' ? 'monthDays' : vm.updateTime.type == 'weekday' ? 'specificWeekDays' : vm.updateTime.type == 'ultimos' ? 'monthDays' : 'specificDays';
                        }

                        if (vm.updateTime.type2 == 'ultimos' || vm.updateTime.type2 == 'ultimos') {
                            obj.isUltimos = 'ultimos';
                        }else{
                            obj.isUltimos = 'months';
                        }
                        obj.period = {};

                        if (value._period._single_start) {
                            obj.frequency = 'single_start';
                            obj.period._single_start = value._period._single_start;
                        }
                        else if (value._period._absolute_repeat) {
                            obj.frequency = 'absolute_repeat';
                            obj.period._absolute_repeat = value._period._absolute_repeat;
                        }
                        else if (value._period._repeat) {
                            obj.frequency = 'repeat';
                            obj.period._repeat = value._period._repeat;
                        }
                        if (value._period._begin) {
                            obj.period._begin = value._period._begin;
                        }
                        if (value._period._end) {
                            obj.period._end = value._period._end;
                        }
                        obj.period._when_holiday = value._period._when_holiday || 'suppress';


                        if (obj.tab == 'weekDays') {
                            obj.days = value._day.toString().split(' ').sort();
                        } else if (obj.tab == 'monthDays') {
                            if(obj.isUltimos = 'ultimos'){
                                 obj.selectedMonthsU = value._day.toString().split(' ').sort(compareNumbers);
                            }else {
                                obj.selectedMonths = value._day.toString().split(' ').sort(compareNumbers);
                            }
                        } else if (obj.tab == 'specificWeekDays') {
                            obj.specificWeekDay = value._day;
                            obj.which = value._which;
                        } else if (obj.tab == 'specificDays') {
                            obj.date = new Date(value._date);
                        }
                        if (value._month) {
                            obj.months = value._month.toString().split(' ').sort(compareNumbers);
                        }
                        obj.str = frequencyToString(obj);
                        vm.periodList.push(obj);
                    }
                })
            }

            if (!vm.isEmpty(vm.updateTime)) {
                if (vm.updateTime.type == 'date') {

                    if (angular.isArray(run_time.date)) {
                        angular.forEach(run_time.date, function (res1, index) {
                            if (angular.equals(res1._date, vm.updateTime.obj[0]._date)) {
                                run_time.date.splice(index, 1);
                            }
                        });
                    } else {
                        if (angular.equals(run_time.date._date, vm.updateTime.obj[0]._date)) {
                            delete run_time['date'];
                        }

                    }
                }
                else if (vm.updateTime.type == 'weekdays') {
                    if (run_time.weekdays) {
                        if (angular.isArray(run_time.weekdays.day)) {
                            angular.forEach(run_time.weekdays.day, function (res1, index) {
                                if (angular.equals(res1._day, vm.updateTime.obj[0]._day)) {
                                    run_time.weekdays.day.splice(index, 1);
                                }
                            });
                        } else {
                            if (angular.equals(run_time.weekdays.day._day, vm.updateTime.obj[0]._day)) {
                                delete run_time['weekdays'];
                            }

                        }
                    }
                }
                else if (vm.updateTime.type == 'monthdays') {
                    if (run_time.monthdays) {
                        if (angular.isArray(run_time.monthdays.day)) {
                            angular.forEach(run_time.monthdays.day, function (res1, index) {
                                if (angular.equals(res1._day, vm.updateTime.obj[0]._day)) {
                                    run_time.monthdays.day.splice(index, 1);
                                }
                            });
                        } else {
                            if (angular.equals(run_time.monthdays.day._day, vm.updateTime.obj[0]._day)) {
                                delete run_time.monthdays['day'];
                            }
                        }
                    }

                }
                else if (vm.updateTime.type == 'weekday') {
                    if (run_time.monthdays) {
                        if (angular.isArray(run_time.monthdays.weekday)) {
                            angular.forEach(run_time.monthdays.weekday, function (res1, index) {
                                if (angular.equals(res1._which, vm.updateTime.obj[0]._which) && angular.equals(res1._day, vm.updateTime.obj[0]._day)) {
                                    run_time.monthdays.weekday.splice(index, 1);
                                }

                            });
                        } else {
                            if (angular.equals(run_time.monthdays.weekday._day, vm.updateTime.obj[0].weekday) && angular.equals(run_time.monthdays.weekday._which, vm.updateTime.obj[0]._which)) {
                                delete run_time.monthdays['weekday'];
                            }
                        }
                    }
                }
                else if (vm.updateTime.type == 'ultimos') {
                    if (run_time.ultimos) {
                        if (angular.isArray(run_time.ultimos.day)) {
                            angular.forEach(run_time.ultimos.day, function (res1, index) {
                                if (angular.equals(res1._day, vm.updateTime.obj[0]._day)) {
                                    run_time.ultimos.day.splice(index, 1);
                                }
                            });
                        } else {
                            if (angular.equals(run_time.ultimos.day._day, vm.updateTime.obj[0]._day)) {
                                delete run_time['ultimos'];
                            }
                        }
                    }
                }
                else if (vm.updateTime.type == 'month') {
                    if (vm.updateTime.type2 == 'weekdays') {

                        if (angular.isArray(run_time.month)) {
                            angular.forEach(run_time.month, function (res) {
                                if (angular.equals(res._month, vm.updateTime.obj[0]._month)) {
                                    if (angular.isArray(res.weekdays.day)) {
                                        angular.forEach(res.weekdays.day, function (res1, index) {
                                            if (angular.equals(res1._day, vm.updateTime.obj[0]._day)) {
                                                res.weekdays.day.splice(index, 1);
                                            }
                                        });
                                    } else {
                                        if (angular.equals(res.weekdays.day._day, vm.updateTime.obj[0]._day)) {
                                            delete res['weekdays']
                                        }
                                    }
                                }
                            });
                        }
                    }
                    else if (vm.updateTime.type2 == 'monthdays') {

                        if (angular.isArray(run_time.month)) {
                            angular.forEach(run_time.month, function (res) {
                                if (angular.equals(res._month, vm.updateTime.obj[0]._month)) {

                                    if (angular.isArray(res.monthdays.day)) {

                                        angular.forEach(res.monthdays.day, function (res1, index) {

                                            if (angular.equals(res1._day, vm.updateTime.obj[0]._day)) {
                                                res.monthdays.day.splice(index, 1);
                                            }
                                        });
                                    } else {
                                        if (angular.equals(res.monthdays.day._day, vm.updateTime.obj[0]._day)) {
                                            delete res.monthdays['day']
                                        }

                                    }
                                }
                            });
                        }
                    }
                    else if (vm.updateTime.type2 == 'ultimos') {
                        if (angular.isArray(run_time.month)) {
                            angular.forEach(run_time.month, function (res) {
                                if (angular.equals(res._month, vm.updateTime.obj[0]._month)) {

                                    if (angular.isArray(res.ultimos.day)) {

                                        angular.forEach(res.ultimos.day, function (res1, index) {

                                            if (angular.equals(res1._day, vm.updateTime.obj[0]._day)) {
                                                res.ultimos.day.splice(index, 1);
                                            }
                                        });
                                    } else {
                                        if (angular.equals(res.ultimos.day._day, vm.updateTime.obj[0]._day)) {
                                            delete res['ultimos']
                                        }

                                    }
                                }
                            });
                        }
                    }
                    else if (vm.updateTime.type2 == 'weekday') {

                        if (angular.isArray(run_time.month)) {
                            angular.forEach(run_time.month, function (res) {
                                if (angular.equals(res._month, vm.updateTime.obj[0]._month)) {

                                    if (angular.isArray(res.monthdays.weekday)) {

                                        angular.forEach(res.monthdays.weekday, function (res1, index) {

                                            if (angular.equals(res1._day, vm.updateTime.obj[0]._day) && angular.equals(res1._which, vm.updateTime.obj[0]._which)) {
                                                res.monthdays.weekday.splice(index, 1);
                                            }
                                        });
                                    } else {
                                        if (angular.equals(res.monthdays.weekday._day, vm.updateTime.obj[0]._day) && angular.equals(res.monthdays.weekday._which, vm.updateTime.obj[0]._which)) {
                                            delete res.monthdays['weekday']
                                        }

                                    }
                                }
                            });
                        }
                    }

                    if (run_time.month && angular.isArray(run_time.month)) {
                        angular.forEach(run_time.month, function (month, index) {
                            var flag = false;
                            if (!month.weekdays && (!month.monthdays || vm.isEmpty(month.monthdays)) && !month.ultimos) {
                                flag = true;
                            }
                            if (flag) {
                                run_time.month.splice(index, 1);
                            }
                        });
                    }

                }
                if (run_time.monthdays && !run_time.monthdays.day && !run_time.monthdays.weekday) {
                    delete run_time['monthdays'];
                }
            }
            function getDay(day) {
                return day == "sunday" ? 0 : day == "monday" ? 1 : day == "tuesday" ? 2 : day == "wednesday" ? 3 : day == "thursday" ? 4 : day == "friday" ? 5 : 6;
            }
            if (data.frequency.period) {
                for (var i = 0; i < vm.periodList.length; i++) {
                    if (checkPeriod(vm.periodList[i].period, data.frequency.period)) {

                        vm.periodList[i].period = angular.copy(data.period.period);
                    }
                }
            } else {
                if (vm.periodList.length > 0) {
                    var _temp = angular.copy(vm.periodList[0]);
                    _temp.period = data.period.period;
                    _temp.str = frequencyToString(_temp);
                    vm.periodList.push(_temp);

                } else {
                    var obj = {};
                    if (vm.updateTime.type2) {
                        obj.tab = vm.updateTime.type2 == 'weekdays' ? 'weekDays' : vm.updateTime.type2 == 'monthdays' ? 'monthDays' : vm.updateTime.type2 == 'weekday' ? 'specificWeekDays' : vm.updateTime.type2 == 'ultimos' ? 'monthDays' : 'specificDays';
                    } else {
                        obj.tab = vm.updateTime.type == 'weekdays' ? 'weekDays' : vm.updateTime.type == 'monthdays' ? 'monthDays' : vm.updateTime.type == 'weekday' ? 'specificWeekDays' : vm.updateTime.type == 'ultimos' ? 'monthDays' : 'specificDays';
                    }

                    if (vm.updateTime.type == 'ultimos' || vm.updateTime.type2 == 'ultimos') {
                        obj.isUltimos = 'ultimos';
                    }
                    obj.period = {};
                    if (data.period.period._single_start) {
                        obj.frequency = 'single_start';
                        obj.period._single_start = data.period.period._single_start;
                    }
                    else if (data.period.period._absolute_repeat) {
                        obj.frequency = 'absolute_repeat';
                        obj.period._absolute_repeat = data.period.period._absolute_repeat;
                    }
                    else if (data.period.period._repeat) {
                        obj.frequency = 'repeat';
                        obj.period._repeat = data.period.period._repeat;
                    }
                    if (data.period.period._begin) {
                        obj.period._begin = data.period.period._begin;
                    }
                    if (data.period.period._end) {
                        obj.period._end = data.period.period._end;
                    }
                    obj.period._when_holiday = data.period.period._when_holiday || 'suppress';

                    if (obj.tab == 'weekDays') {
                        obj.days = vm.updateTime.obj[0]._day.toString().split(' ').sort();
                    } else if (obj.tab == 'monthDays') {
                         if(obj.isUltimos = 'ultimos'){
                              obj.selectedMonthsU = vm.updateTime.obj[0]._day.toString().split(' ').sort(compareNumbers);
                         }else {
                             obj.selectedMonths = vm.updateTime.obj[0]._day.toString().split(' ').sort(compareNumbers);
                         }
                    } else if (obj.tab == 'specificWeekDays') {
                        obj.specificWeekDay = vm.updateTime.obj[0]._day;
                        obj.which = vm.updateTime.obj[0]._which;
                    } else if (obj.tab == 'specificDays') {
                        obj.date = new Date(vm.updateTime.obj[0]._date);
                    }
                    if (vm.updateTime.obj[0]._month) {
                        obj.months = vm.updateTime.obj[0]._month.toString().split(' ').sort(compareNumbers);
                    }

                    obj.str = frequencyToString(obj);

                    vm.periodList.push(obj);
                }
            }

            angular.forEach(vm.periodList, function (list) {
                vm.checkPeriodList(list);
            });
            vm.periodList = [];
            vm.run_time = run_time;
            delete vm.run_time['_schedule'];

            if (vm.runTime1.date && vm.runTime1.date._date) {
                vm.run_time.date = {};
                vm.run_time.date._date = moment(vm.runTime1.date._date).format('YYYY-MM-DD');
            }

            if (vm.runTime1.holidays) {
                vm.run_time.holidays = {};
                vm.run_time.holidays.holiday = [];
                vm.run_time.holidays.include = [];
                if (vm.runTime1.holidays.weekdays) {
                    vm.run_time.holidays.weekdays = vm.runTime1.holidays.weekdays;
                }
                if (vm.calendarFiles.length > 0) {
                    angular.forEach(vm.calendarFiles, function (value) {
                        vm.run_time.holidays.include.push({_live_file: value});
                    });
                }
                if (vm.holidayDates.length > 0) {
                    angular.forEach(vm.holidayDates, function (value) {
                        vm.run_time.holidays.holiday.push({_date: moment(value).format('YYYY-MM-DD')});
                    });
                }

            }
            if (!vm.isEmpty(vm.run_time.date)) {
                if (!(vm.run_time.date && (vm.run_time.date.length > 0))) {
                    delete vm.run_time['date'];
                } else {
                    angular.forEach(vm.run_time.date, function (value, index1) {
                        if (!angular.isArray(value.period)) {
                            if (value.period && value.period._when_holiday == 'suppress')
                                delete vm.run_time.date[index1].period['_when_holiday'];
                        } else {
                            angular.forEach(value.period, function (val, index2) {
                                if (val._when_holiday == 'suppress')
                                    delete vm.run_time.date[index1].period[index2]['_when_holiday'];
                            });
                        }
                    });
                }

            } else {
                delete vm.run_time['date'];
            }
            if (!vm.isEmpty(vm.run_time.weekdays)) {
                if (!(vm.run_time.weekdays.day && (vm.run_time.weekdays.day.length > 0 || vm.run_time.weekdays.day._day))) {
                    delete vm.run_time['weekdays'];
                } else {

                    angular.forEach(vm.run_time.weekdays.day, function (value, index1) {
                        if (!angular.isArray(value.period)) {
                            if (value.period && value.period._when_holiday == 'suppress')
                                delete vm.run_time.weekdays.day[index1].period['_when_holiday'];
                        } else {
                            angular.forEach(value.period, function (val, index2) {
                                if (val._when_holiday == 'suppress')
                                    delete vm.run_time.weekdays.day[index1].period[index2]['_when_holiday'];
                            });
                        }
                    });

                }

            } else {
                delete vm.run_time['weekdays'];
            }

            if (!vm.isEmpty(vm.run_time.monthdays)) {
                if (!(vm.run_time.monthdays.weekday && vm.run_time.monthdays.weekday.length > 0)) {
                    delete vm.run_time.monthdays['weekday'];
                } else {
                    angular.forEach(vm.run_time.monthdays.weekday, function (value, index1) {

                        if (!angular.isArray(value.period)) {
                            if (value.period && value.period._when_holiday == 'suppress')
                                delete vm.run_time.monthdays.weekday[index1].period['_when_holiday'];
                        } else {
                            angular.forEach(value.period, function (val, index2) {
                                if (val._when_holiday == 'suppress')
                                    delete vm.run_time.monthdays.weekday[index1].period[index2]['_when_holiday'];
                            });
                        }
                    });
                }
                if (!(vm.run_time.monthdays.day && (vm.run_time.monthdays.day.length > 0 || vm.run_time.monthdays.day._day))) {
                    if (!vm.run_time.monthdays.weekday) {
                        delete vm.run_time['monthdays'];
                    } else {
                        if (vm.run_time.monthdays.day.length == 0 && vm.run_time.monthdays.weekday.length == 0) {
                            delete vm.run_time['monthdays'];
                        }else if(vm.run_time.monthdays.day.length == 0){
                             delete vm.run_time.monthdays['day'];
                        }
                    }
                } else {
                    angular.forEach(vm.run_time.monthdays.day, function (value, index1) {
                        if (!angular.isArray(value.period)) {
                            if (value.period && value.period._when_holiday == 'suppress')
                                delete vm.run_time.monthdays.day[index1].period['_when_holiday'];
                        } else {
                            angular.forEach(value.period, function (val, index2) {
                                if (val._when_holiday == 'suppress')
                                    delete vm.run_time.monthdays.day[index1].period[index2]['_when_holiday'];
                            });
                        }
                    });
                }
            } else {
                delete vm.run_time['monthdays'];
            }

            if (!vm.isEmpty(vm.run_time.ultimos)) {
                if (!(vm.run_time.ultimos.day && (vm.run_time.ultimos.day.length > 0 || vm.run_time.ultimos.day._day))) {
                    delete vm.run_time['ultimos'];
                } else {
                    angular.forEach(vm.run_time.ultimos.day, function (value, index1) {
                        if (!angular.isArray(value.period)) {
                            if (value.period._when_holiday == 'suppress')
                                delete vm.run_time.ultimos.day[index1].period['_when_holiday'];
                        } else {
                            angular.forEach(value.period, function (val, index2) {
                                if (val._when_holiday == 'suppress')
                                    delete vm.run_time.ultimos.day[index1].period[index2]['_when_holiday'];
                            });
                        }
                    });
                }
            } else {
                delete vm.run_time['ultimos'];
            }

            if (!vm.isEmpty(vm.run_time.month)) {
                if (!(vm.run_time.month.length > 0 || vm.run_time.month._month)) {
                    delete vm.run_time['month'];
                }
            } else {
                delete vm.run_time['month'];
            }

            if (!vm.isEmpty(vm.run_time.holidays)) {
                if (!(vm.run_time.holidays.holiday && vm.run_time.holidays.holiday.length > 0)) {
                    delete vm.run_time.holidays['holiday'];
                }
                if (!(vm.run_time.holidays.include && vm.run_time.holidays.include.length > 0)) {
                    delete vm.run_time.holidays['include'];
                }

                if (!(vm.run_time.holidays.weekdays && vm.run_time.holidays.weekdays.day && vm.run_time.holidays.weekdays.day._day.length > 0)) {
                    delete vm.run_time.holidays['weekdays'];
                }
            }
            if (vm.isEmpty(vm.run_time.holidays)) {
                delete vm.run_time['holidays'];
            }

            if (vm.runTime1.timeZone) {
                vm.run_time._time_zone = vm.runTime1.timeZone;
            }
            if (vm.sch) {
                if (vm.sch._name) {
                    vm.run_time._name = vm.sch._name;
                } else {
                    if (vm.sch._substitute) {
                        vm.run_time._substitute = vm.sch._substitute;
                    }
                }
                if (vm.sch._valid_from) {
                    vm.run_time._valid_from = vm.sch._valid_from;
                }
                if (vm.sch._valid_to) {
                    vm.run_time._valid_to = vm.sch._valid_to;
                }
                if (vm.sch._title) {
                    vm.run_time._title = vm.sch._title;
                }
            }

            if (vm.order) {
                vm.run_time = {run_time: vm.run_time};
            }
            else if (vm.schedule) {
                vm.run_time = {schedule: vm.run_time};
            }

            try {
                var xmlStr = x2js.json2xml_str(vm.run_time);
            } catch (e) {
                console.log(e);
            }

            xmlStr = xmlStr.replace(/,/g, ' ');

            run_time = {};
            run_time.month = [];
            run_time.weekdays = {};
            run_time.weekdays.day = [];
            run_time.monthdays = {};
            run_time.monthdays.day = [];
            run_time.ultimos = {};
            run_time.ultimos.day = [];
            vm.tempRunTime = {};

            getXml2Json(xmlStr);
        }

        vm.addNewPeriod = function () {
            $rootScope.$broadcast('update-period', {
                period: undefined
            });
            $('.fade-modal').css('opacity', '0.85');
            $('#period-editor').modal('show');

        };

        function addPeriodInCalendar(data) {

            var obj = {};
            try {
                var _xml = x2js.xml_str2json(vm.xmlObj.xml);
            } catch (e) {
                console.log(e);
            }
            var run_time = _xml.run_time || _xml.schedule;
            var isUpdate = false;
            if (data.frequency.period) {
                isUpdate = true;
                for (var i = 0; i < data.frequency.frequency.obj.length; i++) {
                    if (checkPeriod(data.frequency.frequency.obj[i]._period, data.frequency.period)) {
                        data.frequency.frequency.obj.splice(i, 1);

                        break;
                    }
                }
            }

            if (data.period) {

                obj.period = {};
                if (data.period.period._single_start) {
                    obj.frequency = 'single_start';
                    obj.period._single_start = data.period.period._single_start;
                }
                else if (data.period.period._absolute_repeat) {
                    obj.frequency = 'absolute_repeat';
                    obj.period._absolute_repeat = data.period.period._absolute_repeat;
                }
                else if (data.period.period._repeat) {
                    obj.frequency = 'repeat';
                    obj.period._repeat = data.period.period._repeat;
                }
                if (data.period.period._begin) {
                    obj.period._begin = data.period.period._begin;
                }
                if (data.period.period._end) {
                    obj.period._end = data.period.period._end;
                }
                obj.period._when_holiday = data.period.period._when_holiday || 'suppress';

            }
            if (data.frequency.frequency.obj && data.frequency.frequency.obj.length > 0) {
                var flag = false;
                angular.forEach(data.frequency.frequency.obj, function (value) {
                    if (angular.equals(value._period, obj.period)) {
                        flag = true;
                    }
                });
                if (flag) {
                    return;
                }
            }

            if (run_time.date) {
                if (!angular.isArray(run_time.date)) {
                    if (run_time.date.period) {
                        if (!angular.isArray(run_time.date.period)) {
                            var periodArr = [];
                            var _temp = angular.copy(run_time.date.period);
                            run_time.date.period = [];
                            run_time.date.period.push(_temp);
                        } else {
                            for (var i = 0; i < run_time.date.period.length; i++) {
                                if (checkPeriod(run_time.date.period[i], data.frequency.period)) {
                                    run_time.date.period.splice(i, 1);
                                    break;
                                }
                            }
                        }
                        run_time.date.period.push(obj.period);
                    } else {
                        run_time.date.period = obj.period;
                    }
                } else {
                    angular.forEach(run_time.date, function (value, indx) {
                        if (value._calendar && value._calendar == data.frequency.frequency.calendar.path) {
                            if (value.period) {

                                if (!angular.isArray(value.period)) {
                                    var _temp = angular.copy(value.period);
                                    value.period = [];

                                    if(isUpdate && checkPeriod(_temp, data.frequency.period)){

                                    }else{
                                      value.period.push(_temp);
                                    }
                                } else {
                                    for (var i = 0; i < value.period.length; i++) {
                                        if (checkPeriod(value.period[i], data.frequency.period)) {
                                            value.period.splice(i, 1);
                                            break;
                                        }
                                    }
                                }

                                value.period.push(obj.period);
                            } else {
                                value.period = obj.period;
                            }
                        }
                    });
                }
            }

            if (vm.order) {
                vm.run_time = {run_time: run_time};
            }
            else if (vm.schedule) {
                vm.run_time = {schedule: run_time};
            }

            try {
                var xmlStr = x2js.json2xml_str(vm.run_time);
            } catch (e) {
                console.log(e);
            }

            xmlStr = xmlStr.replace(/,/g, ' ');
            getXml2Json(xmlStr);

        }

        vm.periodList = [];
        vm.addPeriod = function () {

            if (vm.periodList.length > 0) {
                for (var i = 0; i < vm.periodList.length; i++) {
                    vm.runTime.str = frequencyToString(vm.runTime);
                    if (angular.equals(vm.periodList[i], vm.runTime)) {
                        return;
                    }
                }
            }

            if (!vm.isEmpty(_tempPeriod) && vm.periodList.length > 0) {

                if (_tempPeriod.tab == "specificDays") {
                    if (vm.tempRunTime.date) {
                        angular.forEach(vm.tempRunTime.date, function (value) {

                            if (value._date && (angular.equals(value._date, moment(_tempPeriod.date).format('YYYY-MM-DD')))) {
                                if (angular.isArray(value.period)) {
                                    angular.forEach(value.period, function (val, index) {
                                        if (angular.equals(val, _tempPeriod.period)) {
                                            value.period.splice(index, 1);
                                        }
                                    });
                                } else {
                                    if (angular.equals(value.period, _tempPeriod.period)) {
                                        value.period = undefined;
                                        value._date = undefined;
                                    }
                                }
                            }
                        });
                    }
                }
                else if (_tempPeriod.tab == "weekDays") {

                    if (_tempPeriod.months && _tempPeriod.months.length > 0) {
                        if (vm.tempRunTime.month && vm.tempRunTime.month.length > 0) {

                            for (var i = 0; i < vm.tempRunTime.month.length; i++) {

                                if (!vm.isEmpty(vm.tempRunTime.month[i].weekdays)) {

                                    if (angular.equals(vm.tempRunTime.month[i]._month, _tempPeriod.months)) {
                                        if (vm.tempRunTime.month[i].weekdays && vm.tempRunTime.month[i].weekdays.day) {
                                            if (vm.tempRunTime.month[i].weekdays.day.length > 1) {
                                                angular.forEach(vm.tempRunTime.month[i].weekdays.day, function (value) {
                                                    if (angular.equals(value._day, _tempPeriod.days)) {
                                                        if (angular.isArray(value.period)) {
                                                            angular.forEach(value.period, function (val, index) {

                                                                if (angular.equals(val, _tempPeriod.period)) {
                                                                    value.period.splice(index, 1);
                                                                }
                                                            });
                                                        } else {

                                                            if (angular.equals(value.period, _tempPeriod.period)) {
                                                                delete value.period;
                                                                delete value._day;
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
                        if (vm.tempRunTime.weekdays && vm.tempRunTime.weekdays.day) {
                            angular.forEach(vm.tempRunTime.weekdays.day, function (value) {

                                if (value._day && angular.equals(value._day, _tempPeriod.days)) {
                                    if (angular.isArray(value.period)) {
                                        angular.forEach(value.period, function (val, index) {

                                            if (angular.equals(val, _tempPeriod.period)) {
                                                value.period.splice(index, 1);
                                            }
                                        });
                                    } else {

                                        if (angular.equals(value.period, _tempPeriod.period)) {
                                            delete value.period;
                                            delete value._day;
                                        }
                                    }
                                }
                            });
                        }
                    }

                }
                else if (_tempPeriod.tab == 'monthDays' ) {
                    if(_tempPeriod.isUltimos == 'months') {
                        if (_tempPeriod.months && _tempPeriod.months.length > 0) {
                            if (vm.tempRunTime.month && vm.tempRunTime.month.length > 0) {
                                for (var i = 0; i < vm.tempRunTime.month.length; i++) {
                                    if (!vm.isEmpty(vm.tempRunTime.month[i].monthdays)) {

                                        if (angular.equals(vm.tempRunTime.month[i]._month, _tempPeriod.months)) {
                                            if (vm.tempRunTime.month[i].monthdays && vm.tempRunTime.month[i].monthdays.day) {

                                                if (vm.tempRunTime.month[i].monthdays.day.length > 1) {

                                                    angular.forEach(vm.tempRunTime.month[i].monthdays.day, function (value) {
                                                        if (angular.equals(value._day, _tempPeriod.selectedMonths)) {
                                                            if (angular.isArray(value.period)) {
                                                                angular.forEach(value.period, function (val, index) {

                                                                    if (angular.equals(val, _tempPeriod.period)) {
                                                                        value.period.splice(index, 1);
                                                                    }
                                                                });
                                                            } else {

                                                                if (angular.equals(value.period, _tempPeriod.period)) {
                                                                    delete value.period;
                                                                    delete value._day;
                                                                }
                                                            }
                                                        }
                                                    });
                                                } else {
                                                    delete vm.tempRunTime.month[i].monthdays['day'];
                                                }
                                            }
                                        }
                                    }
                                }

                            }
                        } else {
                            if (vm.tempRunTime.monthdays && vm.tempRunTime.monthdays.day) {
                                angular.forEach(vm.tempRunTime.monthdays.day, function (value) {

                                    if (value._day && angular.equals(value._day, _tempPeriod.selectedMonths)) {
                                        if (angular.isArray(value.period)) {
                                            angular.forEach(value.period, function (val, index) {

                                                if (angular.equals(val, _tempPeriod.period)) {
                                                    value.period.splice(index, 1);
                                                }
                                            });
                                        } else {
                                            if (angular.equals(value.period, _tempPeriod.period)) {
                                                delete value.period;
                                                delete value._day;
                                            }
                                        }
                                    }
                                });
                            }
                        }
                    }if(_tempPeriod.isUltimos == 'ultimos') {


                        if (_tempPeriod.months && _tempPeriod.months.length > 0) {
                            if (vm.tempRunTime.month && vm.tempRunTime.month.length > 0) {

                                for (var i = 0; i < vm.tempRunTime.month.length; i++) {

                                    if (!vm.isEmpty(vm.tempRunTime.month[i].ultimos)) {

                                        if (angular.equals(vm.tempRunTime.month[i]._month, _tempPeriod.months)) {
                                            if (vm.tempRunTime.month[i].ultimos && vm.tempRunTime.month[i].ultimos.day) {
                                                if (vm.tempRunTime.month[i].ultimos.day.length > 1) {
                                                    angular.forEach(vm.tempRunTime.month[i].ultimos.day, function (value) {
                                                        if (angular.equals(value._day, _tempPeriod.selectedMonthsU)) {
                                                            if (angular.isArray(value.period)) {
                                                                angular.forEach(value.period, function (val, index) {

                                                                    if (angular.equals(val, _tempPeriod.period)) {
                                                                        value.period.splice(index, 1);
                                                                    }
                                                                });
                                                            } else {

                                                                if (angular.equals(value.period, _tempPeriod.period)) {
                                                                    delete value.period;
                                                                    delete value._day;
                                                                }
                                                            }
                                                        }
                                                    });
                                                } else {
                                                    delete vm.tempRunTime.month[i].ultimos['day'];
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        } else {
                            if (vm.tempRunTime.ultimos && vm.tempRunTime.ultimos.day) {
                                angular.forEach(vm.tempRunTime.ultimos.day, function (value) {

                                    if (value._day && angular.equals(value._day, _tempPeriod.selectedMonthsU)) {
                                        if (angular.isArray(value.period)) {
                                            angular.forEach(value.period, function (val, index) {

                                                if (angular.equals(val, _tempPeriod.period)) {
                                                    value.period.splice(index, 1);
                                                }
                                            });
                                        } else {
                                            if (angular.equals(value.period, _tempPeriod.period)) {
                                                delete value.period;
                                                delete value._day;
                                            }
                                        }
                                    }
                                });
                            }
                        }
                    }

                }
                else if (_tempPeriod.tab == "specificWeekDays") {
                    if (_tempPeriod.months && _tempPeriod.months.length > 0) {
                        if (vm.tempRunTime.month && vm.tempRunTime.month.length > 0) {
                            for (var i = 0; i < vm.tempRunTime.month.length; i++) {
                                if (!vm.isEmpty(vm.tempRunTime.month[i].weekdays)) {
                                    if (angular.equals(vm.tempRunTime.month[i]._month, _tempPeriod.months)) {
                                        if (vm.tempRunTime.month[i].monthdays.weekday && vm.tempRunTime.month[i].weekdays.day) {
                                            if (vm.tempRunTime.month[i].monthdays.weekday.length > 1) {
                                                angular.forEach(vm.tempRunTime.month[i].monthdays.weekday, function (value) {
                                                    if (angular.equals(value._day, _tempPeriod.specificWeekDay) && angular.equals(value._which, _tempPeriod.which)) {
                                                        if (angular.isArray(value.period)) {
                                                            angular.forEach(value.period, function (val, index) {
                                                                if (angular.equals(val, _tempPeriod.period)) {
                                                                    value.period.splice(index, 1);
                                                                }
                                                            });
                                                        } else {
                                                            if (angular.equals(value.period, _tempPeriod.period)) {
                                                                delete value.period;
                                                                delete value._day;
                                                                delete value._which;
                                                            }
                                                        }
                                                    }
                                                });
                                            } else {
                                                delete vm.tempRunTime.month[i].monthdays['weekday'];
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        if (vm.tempRunTime.monthdays && vm.tempRunTime.monthdays.weekday) {
                            angular.forEach(vm.tempRunTime.monthdays.weekday, function (value) {

                                if (value._day && (angular.equals(value._day, _tempPeriod.specificWeekDay) && angular.equals(value._which, _tempPeriod.which))) {
                                    if (angular.isArray(value.period)) {
                                        angular.forEach(value.period, function (val, index) {
                                            if (angular.equals(val, _tempPeriod.period)) {
                                                value.period.splice(index, 1);
                                            }
                                        });
                                    } else {
                                        if (angular.equals(value.period, _tempPeriod.period)) {
                                            delete value.period;
                                            delete value._day;
                                            delete value._which;
                                        }
                                    }
                                }
                            });
                        }
                    }
                }
                run_time = angular.copy(vm.tempRunTime);

                for (var i = 0; i < vm.periodList.length; i++) {
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
                vm.runTime.months.sort(compareNumbers);
            }
            if (selectedMonths.length > 0) {
                vm.runTime.selectedMonths = angular.copy(selectedMonths);
                vm.runTime.selectedMonths.sort(compareNumbers);
            }
            if (selectedMonthsU.length > 0) {
                vm.runTime.selectedMonthsU = angular.copy(selectedMonthsU);
                vm.runTime.selectedMonthsU.sort(compareNumbers);
            }
            if (vm.isEmpty(run_time.date)) {
                run_time.date = [];
            }
            else {
                if (!angular.isArray(run_time.date)) {
                    var temp = angular.copy(run_time.date);
                    run_time.date = [];
                    if (temp.period || temp._date)
                        run_time.date.push(temp)
                } else {
                    if (run_time.date)
                        angular.forEach(run_time.date, function (value) {
                            if (!value.period && !value._date)
                                run_time.date = [];
                        });
                }
            }
            if (vm.isEmpty(run_time.weekdays)) {
                run_time.weekdays = {};
                run_time.weekdays.day = [];
            }
            else {
                if (!angular.isArray(run_time.weekdays.day)) {
                    var temp = angular.copy(run_time.weekdays.day);
                    run_time.weekdays.day = [];
                    if (temp.period || temp._day)
                        run_time.weekdays.day.push(temp)
                } else {
                    if (run_time.weekdays.day)
                        angular.forEach(run_time.weekdays.day, function (value) {
                            if (!value.period && !value._day)
                                run_time.weekdays.day = [];
                        });
                }
            }
            if (vm.isEmpty(run_time.monthdays)) {
                run_time.monthdays = {};
                run_time.monthdays.day = [];
                run_time.monthdays.weekday = [];
            }
            else {
                var temp = angular.copy(run_time.monthdays);

                if (!angular.isArray(run_time.monthdays.day)) {

                    run_time.monthdays.day = [];
                    run_time.monthdays.weekday = [];

                    if (temp && temp.day) {
                        run_time.monthdays.day.push(temp.day);
                    }

                    if (temp && temp.weekday) {

                        if (angular.isArray(temp.weekday)) {
                            angular.forEach(temp.weekday, function (value) {
                                if (!angular.isArray(value)) {
                                    if (!value.period && !value._day && !value._which) {
                                    } else {
                                        run_time.monthdays.weekday.push(value);
                                    }
                                }
                            });

                        } else {
                            run_time.monthdays.weekday.push(temp.weekday);
                        }
                    }
                } else {
                    run_time.monthdays.weekday = [];
                    if (run_time.monthdays.day)
                        angular.forEach(run_time.monthdays.day, function (value) {
                            if (!value.period && !value._day) {
                                run_time.monthdays.day = [];
                            }
                        });
                    if (temp && temp.weekday) {
                        if (angular.isArray(temp.weekday)) {
                            angular.forEach(temp.weekday, function (value) {
                                if (!angular.isArray(value)) {
                                    if (!value.period && !value._day && !value._which) {

                                    } else {
                                        run_time.monthdays.weekday.push(value);
                                    }
                                }
                            });

                        } else {
                            if (!temp.weekday.period && !temp.weekday._day && !temp.weekday._which)
                                run_time.monthdays.weekday.push(temp.weekday);
                        }
                    }
                }

            }
            if (vm.isEmpty(run_time.ultimos)) {
                run_time.ultimos = {};
                run_time.ultimos.day = [];
            }
            else {
                if (!angular.isArray(run_time.ultimos.day)) {
                    var temp = angular.copy(run_time.ultimos.day);
                    run_time.ultimos.day = [];
                    if (temp.period || temp._day)
                        run_time.ultimos.day.push(temp)
                } else {
                    if (run_time.ultimos.day)
                        angular.forEach(run_time.ultimos.day, function (value) {
                            if (!value.period && !value._day) {
                                run_time.ultimos.day = [];
                            }
                        });
                }
            }
            if (vm.isEmpty(run_time.month)) {
                run_time.month = [];
            }
            else {
                var temp = angular.copy(run_time.month);
                if (!angular.isArray(run_time.month)) {
                    run_time.month = [];
                    if (temp)
                        run_time.month.push(temp);
                } else {
                    angular.forEach(run_time.month, function (res) {

                        if (res.weekdays) {
                            if (!angular.isArray(res.weekdays.day)) {
                                var temp = angular.copy(res.weekdays.day);
                                res.weekdays.day = [];
                                if (temp.period || temp._day)
                                    res.weekdays.day.push(temp);
                            } else {
                                if (res.weekdays.day)
                                    angular.forEach(res.weekdays.day, function (value) {
                                        if (!value.period && !value._day)
                                            res.weekdays.day = [];
                                    });
                            }

                        } else if (res.monthdays) {
                            if (res.monthdays.weekday) {
                                if (!angular.isArray(res.monthdays.weekday)) {
                                    var temp = angular.copy(res.monthdays.weekday);
                                    res.monthdays.weekday = [];
                                    if (temp.period || temp._day)
                                        res.monthdays.weekday.push(temp)
                                } else {
                                    if (res.monthdays.weekday)
                                        angular.forEach(res.monthdays.weekday, function (value) {
                                            if (!value.period && !value._day)
                                                res.monthdays.weekday = [];
                                        });
                                }
                            } else {
                                if (!angular.isArray(res.monthdays.day)) {
                                    var temp = angular.copy(res.monthdays.day);
                                    res.monthdays.day = [];
                                    if (temp.period || temp._day)
                                        res.monthdays.day.push(temp)
                                } else {
                                    if (res.monthdays.day)
                                        angular.forEach(res.monthdays.day, function (value) {
                                            if (!value.period && !value._day)
                                                res.monthdays.day = [];
                                        });
                                }
                            }
                        } else if (res.ultimos) {
                            if (!angular.isArray(res.ultimos.day)) {
                                var temp = angular.copy(res.ultimos.day);
                                res.ultimos.day = [];
                                if (temp.period || temp._day)
                                    res.ultimos.day.push(temp)
                            } else {
                                if (res.ultimos.day)
                                    angular.forEach(res.ultimos.day, function (value) {
                                        if (!value.period && !value._day)
                                            res.ultimos.day = [];
                                    });
                            }
                        }
                    });
                }
            }

            var isMonth = false;

            for (var i = 0; i < run_time.month.length; i++) {
                if (run_time.month[i]._month && angular.equals(run_time.month[i]._month, vm.runTime.months) || angular.equals(run_time.month[i]._month.toString().split(' '), vm.runTime.months)) {
                    isMonth = true;
                    break;
                }
            }
           if (vm.runTime.tab == 'specificDays') {
                if (run_time.date.length > 0) {
                    var _period = [];
                    angular.forEach(run_time.date, function (value) {
                        if (value._date && vm.runTime.date && (angular.equals(value._date, moment(vm.runTime.date).format('YYYY-MM-DD')))) {
                            if (angular.isArray(value.period)) {
                                angular.forEach(value.period, function (res) {
                                    if (res)
                                        _period.push(res);
                                })
                            } else {
                                if (value.period)
                                    _period.push(value.period);
                            }
                            _period.push(vm.runTime.period);
                            value.period = _period;
                        }
                    });
                    if (_period.length == 0) {
                        if (!angular.isArray(run_time.date)) {
                            run_time.date = [];
                        }
                        run_time.date.push({
                            '_date': moment(vm.runTime.date).format('YYYY-MM-DD'),
                            'period': vm.runTime.period
                        });
                    }
                } else {
                    run_time.date.push({
                        '_date': moment(vm.runTime.date).format('YYYY-MM-DD'),
                        'period': vm.runTime.period
                    });
                }
            }
            else if (vm.runTime.tab == 'weekDays') {
                if (vm.runTime.months && vm.runTime.months.length > 0) {

                    if (run_time.month.length > 0) {

                        var flag = false;
                        angular.forEach(run_time.month, function (value) {
                            if (isMonth) {
                                if (value.weekdays && (angular.equals(value._month, vm.runTime.months) || angular.equals(value._month.toString().split(' '), vm.runTime.months))) {

                                    flag = true;
                                    var _period = [];
                                    if (angular.isArray(value.weekdays.day)) {
                                        angular.forEach(value.weekdays.day, function (value1) {

                                            if (value1._day && (angular.equals(value1._day, vm.runTime.days) || angular.equals(value1._day.toString().split(' '), vm.runTime.days))) {
                                                if (angular.isArray(value1.period)) {
                                                    angular.forEach(value1.period, function (res) {
                                                        if (res)
                                                            _period.push(res);
                                                    })
                                                } else {
                                                    if (value1.period) {
                                                        _period.push(value1.period);
                                                    }

                                                }

                                                _period.push(vm.runTime.period);

                                                value1.period = _period;

                                            }
                                        });
                                    } else {
                                        if (angular.equals(value.weekdays.day._day, vm.runTime.days) || angular.equals(value.weekdays.day._day.toString().split(' '), vm.runTime.days)) {

                                            if (angular.isArray(value.weekdays.day.period)) {
                                                angular.forEach(value.weekdays.day.period, function (res) {
                                                    if (res)
                                                        _period.push(res);
                                                })
                                            } else {
                                                if (value.weekdays.day.period)
                                                    _period.push(value.weekdays.day.period);

                                            }

                                            _period.push(vm.runTime.period);
                                            value.weekdays.day.period = _period;
                                        }
                                    }

                                    if (_period.length == 0) {
                                        if (value.weekdays.day && !vm.isEmpty(value.weekdays.day)) {
                                            if (!angular.isArray(value.weekdays.day)) {
                                                var t = [];
                                                t.push(angular.copy(value.weekdays.day));
                                                value.weekdays.day = t;
                                            }
                                        } else {
                                            value.weekdays.day = [];
                                        }

                                        value.weekdays.day.push({
                                            '_day': vm.runTime.days,
                                            'period': vm.runTime.period
                                        });
                                    }
                                }
                            }
                        });
                        if (!flag) {

                            if (isMonth) {
                                for (var i = 0; i < run_time.month.length; i++) {

                                    if (run_time.month[i]._month && angular.equals(run_time.month[i]._month, vm.runTime.months) || angular.equals(run_time.month[i]._month.toString().split(' '), vm.runTime.months)) {
                                        run_time.month[i].weekdays = {day: []};
                                        run_time.month[i].weekdays.day.push({
                                            '_day': vm.runTime.days,
                                            'period': vm.runTime.period
                                        });
                                        break;
                                    }
                                }

                            } else {
                                var x = {_month: vm.runTime.months, weekdays: {day: []}};
                                x.weekdays.day.push({'_day': vm.runTime.days, 'period': vm.runTime.period});
                                run_time.month.push(x);
                            }

                        }
                    }
                    else {
                        var x = {_month: vm.runTime.months, weekdays: {day: []}};
                        x.weekdays.day.push({'_day': vm.runTime.days, 'period': vm.runTime.period});
                        run_time.month.push(x);
                    }
                } else {

                    if (run_time.weekdays.day.length > 0) {
                        var _period = [];
                        angular.forEach(run_time.weekdays.day, function (value) {
                            if (value._day && (angular.equals(value._day, vm.runTime.days) || angular.equals(value._day.toString().split(' '), vm.runTime.days))) {

                                if (angular.isArray(value.period)) {
                                    angular.forEach(value.period, function (res) {
                                        if (res)
                                            _period.push(res);

                                    })
                                } else {
                                    if (value.period) {
                                        _period.push(value.period);

                                    }

                                }

                                _period.push(vm.runTime.period);

                                value.period = _period;
                            }

                        });
                        if (_period.length == 0) {
                            if (!angular.isArray(run_time.weekdays.day)) {
                                run_time.weekdays.day = [];
                            }

                            run_time.weekdays.day.push({'_day': vm.runTime.days, 'period': vm.runTime.period});
                        }
                    } else {
                        run_time.weekdays.day.push({'_day': vm.runTime.days, 'period': vm.runTime.period});
                    }
                }
            }
            else if (vm.runTime.tab == 'specificWeekDays') {
                if (vm.runTime.months && vm.runTime.months.length > 0) {
                    if (run_time.month.length > 0) {
                        var flag = false;
                        angular.forEach(run_time.month, function (value) {
                            if (isMonth) {
                                if (value.monthdays && value.monthdays.weekday && (angular.equals(value._month, vm.runTime.months) || angular.equals(value._month.toString().split(' '), vm.runTime.months))) {

                                    flag = true;
                                    var _period = [];
                                    if (angular.isArray(value.monthdays.weekday)) {
                                        angular.forEach(value.monthdays.weekday, function (value1) {

                                            if (value1 && value1._day == vm.runTime.specificWeekDay && value1._which == vm.runTime.which) {
                                                if (angular.isArray(value1.period)) {
                                                    angular.forEach(value1.period, function (res) {
                                                        if (res)
                                                            _period.push(res);
                                                    })
                                                } else {
                                                    if (value1.period) {
                                                        _period.push(value1.period);
                                                    }

                                                }

                                                _period.push(vm.runTime.period);

                                                value1.period = _period;

                                            }
                                        });
                                    } else {
                                        if (angular.equals(value.monthdays.weekday._day, vm.runTime.specificWeekDay) && angular.equals(value.monthdays.weekday._which, vm.runTime.which)) {

                                            if (angular.isArray(value.monthdays.weekday.period)) {
                                                angular.forEach(value.monthdays.weekday.period, function (res) {
                                                    if (res)
                                                        _period.push(res);
                                                })
                                            } else {
                                                if (value.monthdays.weekday.period)
                                                    _period.push(value.monthdays.weekday.period);
                                            }
                                            _period.push(vm.runTime.period);
                                            value.monthdays.weekday.period = _period;
                                        }
                                    }

                                    if (_period.length == 0) {
                                        if (value.monthdays.weekday && !vm.isEmpty(value.monthdays.weekday)) {
                                            if (!angular.isArray(value.monthdays.weekday)) {
                                                var t = [];
                                                t.push(angular.copy(value.monthdays.weekday));
                                                value.monthdays.weekday = t;
                                            }

                                        } else {
                                            value.monthdays.weekday = [];
                                        }

                                        value.monthdays.weekday.push({
                                            '_day': vm.runTime.specificWeekDay,
                                            '_which': vm.runTime.which,
                                            'period': vm.runTime.period
                                        });
                                    }
                                }
                            }
                        });
                        if (!flag) {
                            if (isMonth) {
                                for (var i = 0; i < run_time.month.length; i++) {

                                    if (run_time.month[i]._month && angular.equals(run_time.month[i]._month, vm.runTime.months) || angular.equals(run_time.month[i]._month.toString().split(' '), vm.runTime.months)) {
                                        if ((!run_time.month[i].monthdays)) {
                                            run_time.month[i].monthdays = {weekday: []};
                                        } else {
                                            run_time.month[i].monthdays.weekday = [];
                                        }
                                        run_time.month[i].monthdays.weekday.push({
                                            '_day': vm.runTime.specificWeekDay,
                                            '_which': vm.runTime.which,
                                            'period': vm.runTime.period
                                        });
                                        break;
                                    }
                                }

                            } else {
                                var x;
                                if (!run_time.month.monthdays)
                                    x = {_month: vm.runTime.months, monthdays: {weekday: []}};
                                else {
                                    x = {_month: vm.runTime.months};
                                    x.monthdays.weekday = [];
                                }

                                x.monthdays.weekday.push({
                                    '_day': vm.runTime.specificWeekDay,
                                    '_which': vm.runTime.which,
                                    'period': vm.runTime.period
                                });
                                run_time.month.push(x);
                            }

                        }
                    }
                    else {
                        var x;
                        if (!run_time.month.monthdays)
                            x = {_month: vm.runTime.months, monthdays: {weekday: []}};
                        else {
                            x = {_month: vm.runTime.months};
                            x.monthdays.weekday = [];
                        }
                        x.monthdays.weekday.push({
                            '_day': vm.runTime.specificWeekDay,
                            '_which': vm.runTime.which,
                            'period': vm.runTime.period
                        });
                        run_time.month.push(x);
                    }
                }
                else {
                    if (run_time.monthdays.weekday.length > 0) {
                        var _period = [];
                        angular.forEach(run_time.monthdays.weekday, function (value) {
                            if (value && value._day == vm.runTime.specificWeekDay && value._which == vm.runTime.which) {
                                if (angular.isArray(value.period)) {
                                    angular.forEach(value.period, function (res) {
                                        if (res)
                                            _period.push(res);
                                    })
                                } else {
                                    if (value.period) {
                                        _period.push(value.period);

                                    }
                                }
                                _period.push(vm.runTime.period);
                                value.period = _period;
                            }
                        });

                        if (_period.length == 0) {

                            if (!angular.isArray(run_time.monthdays.weekday)) {
                                run_time.monthdays.weekday = [];
                            }
                            run_time.monthdays.weekday.push({
                                '_day': vm.runTime.specificWeekDay,
                                '_which': vm.runTime.which,
                                'period': vm.runTime.period
                            });
                        }

                    } else {
                        run_time.monthdays.weekday.push({
                            '_day': vm.runTime.specificWeekDay,
                            '_which': vm.runTime.which,
                            'period': vm.runTime.period
                        });
                    }
                }
            }
            else if (vm.runTime.tab == 'monthDays') {

                if (selectedMonths.length > 0 || selectedMonthsU.length > 0) {
                    if (vm.runTime.isUltimos == 'months') {
                        if (vm.runTime.months && vm.runTime.months.length > 0) {
                            if (run_time.month.length > 0) {
                                var flag = false;
                                angular.forEach(run_time.month, function (value) {
                                    if (isMonth) {
                                        if (value.monthdays && value.monthdays.day && (angular.equals(value._month, vm.runTime.months) || angular.equals(value._month.toString().split(' '), vm.runTime.months))) {
                                            flag = true;
                                            var _period = [];

                                            if (angular.isArray(value.monthdays.day)) {

                                                angular.forEach(value.monthdays.day, function (value1) {
                                                    if (value1._day && (angular.equals(value1._day, selectedMonths) || angular.equals(value1._day.toString().split(' '), selectedMonths))) {

                                                        if (angular.isArray(value1.period)) {
                                                            angular.forEach(value1.period, function (res) {
                                                                if (res)
                                                                    _period.push(res);
                                                            })
                                                        } else {
                                                            if (value1.period) {
                                                                _period.push(value1.period);

                                                            }
                                                        }
                                                        _period.push(vm.runTime.period);
                                                        value1.period = _period;
                                                    }
                                                });
                                            } else {

                                                if (angular.equals(value.monthdays.day._day, selectedMonths) || angular.equals(value.monthdays.day._day.toString().split(' '), selectedMonths)) {
                                                    if (angular.isArray(value.monthdays.day.period)) {
                                                        angular.forEach(value.monthdays.day.period, function (res) {
                                                            if (res)
                                                                _period.push(res);
                                                        })
                                                    } else {
                                                        if (value.monthdays.day.period)
                                                            _period.push(value.monthdays.day.period);
                                                    }
                                                    _period.push(vm.runTime.period);
                                                    value.monthdays.day.period = _period;
                                                }
                                            }

                                            if (_period.length == 0) {

                                                if (value.monthdays.day && !vm.isEmpty(value.monthdays.day)) {
                                                    if (!angular.isArray(value.monthdays.day)) {
                                                        var t = [];
                                                        t.push(angular.copy(value.monthdays.day));
                                                        value.monthdays.day = t;
                                                    }
                                                } else {
                                                    value.monthdays.day = [];
                                                }

                                                value.monthdays.day.push({
                                                    '_day': angular.copy(selectedMonths),
                                                    'period': vm.runTime.period
                                                });
                                            }
                                        }
                                    }
                                });
                                if (!flag) {
                                    if (isMonth) {
                                        for (var i = 0; i < run_time.month.length; i++) {
                                            if (run_time.month[i]._month && angular.equals(run_time.month[i]._month, vm.runTime.months) || angular.equals(run_time.month[i]._month.toString().split(' '), vm.runTime.months)) {
                                                if ((!run_time.month[i].monthdays)) {
                                                    run_time.month[i].monthdays = {day: []};
                                                } else {
                                                    run_time.month[i].monthdays.day = [];
                                                }
                                                run_time.month[i].monthdays.day.push({
                                                    '_day': angular.copy(selectedMonths),
                                                    'period': vm.runTime.period
                                                });
                                                break;
                                            }
                                        }
                                    } else {

                                        var x;
                                        if (!run_time.month.monthdays)
                                            x = {_month: vm.runTime.months, monthdays: {day: []}};
                                        else {
                                            x = {_month: vm.runTime.months};
                                            x.monthdays.day = [];
                                        }
                                        x.monthdays.day.push({
                                            '_day': angular.copy(selectedMonths),
                                            'period': vm.runTime.period
                                        });
                                        run_time.month.push(x);
                                    }
                                }
                            } else {
                                var x;
                                if (!run_time.month.monthdays)
                                    x = {_month: vm.runTime.months, monthdays: {day: []}};
                                else {
                                    x = {_month: vm.runTime.months};
                                    x.monthdays.day = [];
                                }

                                x.monthdays.day.push({
                                    '_day': angular.copy(selectedMonths),
                                    'period': vm.runTime.period
                                });
                                run_time.month.push(x);
                            }
                        }
                        else {

                            if (run_time.monthdays.day.length > 0) {
                                var _period = [];
                                angular.forEach(run_time.monthdays.day, function (value) {
                                    if (value._day && (angular.equals(value._day, selectedMonths) || angular.equals(value._day.toString().split(' '), selectedMonths))) {


                                        if (angular.isArray(value.period)) {
                                            angular.forEach(value.period, function (res) {
                                                if (res)
                                                    _period.push(res);

                                            })
                                        } else {
                                            if (value.period) {
                                                _period.push(value.period);

                                            }
                                        }
                                        _period.push(vm.runTime.period);
                                        value.period = _period;
                                    }
                                });

                                if (_period.length == 0) {
                                    if (!angular.isArray(run_time.monthdays.day)) {
                                        run_time.monthdays.day = [];
                                    }
                                    run_time.monthdays.day.push({
                                        '_day': angular.copy(selectedMonths),
                                        'period': vm.runTime.period
                                    });
                                }

                            } else {
                                run_time.monthdays.day.push({
                                    '_day': angular.copy(selectedMonths),
                                    'period': vm.runTime.period
                                });
                            }
                        }
                    } else {
                        if (vm.runTime.months && vm.runTime.months.length > 0) {

                            if (run_time.month.length > 0) {

                                var flag = false;
                                angular.forEach(run_time.month, function (value) {

                                    if (isMonth) {
                                        if (value.ultimos && (angular.equals(value._month, vm.runTime.months) || angular.equals(value._month.toString().split(' '), vm.runTime.months))) {
                                            flag = true;
                                            var _period = [];

                                            if (angular.isArray(value.ultimos.day)) {
                                                angular.forEach(value.ultimos.day, function (value1) {
                                                    if (value1._day && (angular.equals(value1._day, selectedMonthsU) || angular.equals(value1._day.toString().split(' '), selectedMonthsU))) {

                                                        if (angular.isArray(value1.period)) {
                                                            angular.forEach(value1.period, function (res) {
                                                                if (res)
                                                                    _period.push(res);

                                                            })
                                                        } else {
                                                            if (value1.period) {
                                                                _period.push(value1.period);

                                                            }

                                                        }

                                                        _period.push(vm.runTime.period);

                                                        value1.period = _period;
                                                    }
                                                });
                                            } else {
                                                if (angular.equals(value.ultimos.day._day, selectedMonthsU) || angular.equals(value.ultimos.day._day.toString().split(' '), selectedMonthsU)) {


                                                    if (angular.isArray(value.ultimos.day.period)) {
                                                        angular.forEach(value.ultimos.day.period, function (res) {
                                                            if (res)
                                                                _period.push(res);
                                                        })
                                                    } else {
                                                        if (value.ultimos.day.period)
                                                            _period.push(value.ultimos.day.period);
                                                    }


                                                    _period.push(vm.runTime.period);
                                                    value.ultimos.day.period = _period;
                                                }
                                            }

                                            if (_period.length == 0) {
                                                if (value.ultimos.day && !vm.isEmpty(value.ultimos.day)) {
                                                    if (!angular.isArray(value.ultimos.day)) {
                                                        var t = [];
                                                        t.push(angular.copy(value.ultimos.day));
                                                        value.ultimos.day = t;
                                                    }
                                                } else {
                                                    value.ultimos.day = [];
                                                }

                                                value.ultimos.day.push({
                                                    '_day': angular.copy(selectedMonthsU),
                                                    'period': vm.runTime.period
                                                });
                                            }
                                        }
                                    }
                                });
                                if (!flag) {
                                    if (isMonth) {
                                        for (var i = 0; i < run_time.month.length; i++) {

                                            if (run_time.month[i]._month && angular.equals(run_time.month[i]._month, vm.runTime.months) || angular.equals(run_time.month[i]._month.toString().split(' '), vm.runTime.months)) {
                                                run_time.month[i].ultimos = {day: []};
                                                run_time.month[i].ultimos.day.push({
                                                    '_day': angular.copy(selectedMonthsU),
                                                    'period': vm.runTime.period
                                                });
                                                break;
                                            }
                                        }

                                    } else {
                                        var x = {_month: vm.runTime.months, ultimos: {day: []}};
                                        x.ultimos.day.push({
                                            '_day': angular.copy(selectedMonthsU),
                                            'period': vm.runTime.period
                                        });
                                        run_time.month.push(x);
                                    }
                                }
                            } else {
                                var x = {_month: vm.runTime.months, ultimos: {day: []}};
                                x.ultimos.day.push({'_day': angular.copy(selectedMonthsU), 'period': vm.runTime.period});
                                run_time.month.push(x);

                            }
                        } else {
                            if (run_time.ultimos.day.length > 0) {
                                var _period = [];
                                angular.forEach(run_time.ultimos.day, function (value) {
                                    if (value._day && (angular.equals(value._day, selectedMonthsU) || angular.equals(value._day.toString().split(' '), selectedMonthsU))) {

                                        if (angular.isArray(value.period)) {
                                            angular.forEach(value.period, function (res) {
                                                if (res)
                                                    _period.push(res);

                                            })
                                        } else {
                                            if (value.period) {
                                                _period.push(value.period);

                                            }

                                        }

                                        _period.push(vm.runTime.period);

                                        value.period = _period;
                                    }
                                });

                                if (_period.length == 0) {
                                    if (!angular.isArray(run_time.ultimos.day)) {
                                        run_time.ultimos.day = [];
                                    }
                                    run_time.ultimos.day.push({
                                        '_day': angular.copy(selectedMonthsU),
                                        'period': vm.runTime.period
                                    });
                                }

                            } else {
                                run_time.ultimos.day.push({
                                    '_day': angular.copy(selectedMonthsU),
                                    'period': vm.runTime.period
                                });
                            }
                        }
                    }
                }

            }

            if (vm.periodList.length > 0) {
                var flag1 = false;
                for (var i = 0; i < vm.periodList.length; i++) {
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

            var temp = angular.copy(vm.runTime);

            vm.runTime = {};
            vm.updateTime = {};
            vm.runTime.period = {};
            vm.runTime.frequency = 'single_start';
            vm.runTime.period._when_holiday = 'suppress';
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
            if (temp.date)
                vm.runTime.date = temp.date;
            if (temp.which)
                vm.runTime.which = temp.which;

        };

        vm.checkPeriodList = function (param) {
            var isMonth = false;
            for (var i = 0; i < run_time.month.length; i++) {
                if (run_time.month[i]._month && angular.equals(run_time.month[i]._month, param.months) || angular.equals(run_time.month[i]._month.toString().split(' '), param.months)) {
                    isMonth = true;
                    break;
                }
            }
            if (param.tab == 'specificDays') {
                if (run_time.date.length > 0) {
                    var _period = [];
                    angular.forEach(run_time.date, function (value) {
                        if (value._date && param.date && (angular.equals(value._date, moment(param.date).format('YYYY-MM-DD')))) {
                            if (angular.isArray(value.period)) {
                                angular.forEach(value.period, function (res) {
                                    if (res)
                                        _period.push(res);
                                })
                            } else {
                                if (value.period) {
                                    _period.push(value.period);
                                }

                            }

                            _period.push(param.period);

                            value.period = _period;
                        }
                    });
                    if (_period.length == 0) {
                        if (!angular.isArray(run_time.date)) {
                            run_time.date = [];
                        }
                        run_time.date.push({
                            '_date': moment(param.date).format('YYYY-MM-DD'),
                            'period': param.period
                        });
                    }
                } else {
                    run_time.date.push({
                        '_date': moment(param.date).format('YYYY-MM-DD'),
                        'period': param.period
                    });
                }
            }
            else if (param.tab == 'weekDays') {
                if (param.months && param.months.length > 0) {

                    if (run_time.month.length > 0) {

                        var flag = false;
                        angular.forEach(run_time.month, function (value) {
                            if (isMonth) {
                                if (value.weekdays && (angular.equals(value._month, param.months) || angular.equals(value._month.toString().split(' '), param.months))) {
                                    flag = true;
                                    var _period = [];
                                    if (angular.isArray(value.weekdays.day)) {
                                        angular.forEach(value.weekdays.day, function (value1) {
                                            if (value1._day && (angular.equals(value1._day, param.days) || angular.equals(value1._day.toString().split(' '), param.days))) {
                                                if (angular.isArray(value1.period)) {
                                                    angular.forEach(value1.period, function (res) {
                                                        if (res)
                                                            _period.push(res);
                                                    })
                                                } else {
                                                    if (value1.period) {
                                                        _period.push(value1.period);
                                                    }
                                                }
                                                _period.push(param.period);
                                                value1.period = _period;
                                            }
                                        });
                                    } else {
                                        if (angular.equals(value.weekdays.day._day, param.days) || angular.equals(value.weekdays.day._day.toString().split(' '), param.days)) {

                                            if (angular.isArray(value.weekdays.day.period)) {
                                                angular.forEach(value.weekdays.day.period, function (res) {
                                                    if (res)
                                                        _period.push(res);
                                                })
                                            } else {
                                                if (value.weekdays.day.period)
                                                    _period.push(value.weekdays.day.period);
                                            }
                                            _period.push(param.period);
                                            value.weekdays.day.period = _period;
                                        }
                                    }

                                    if (_period.length == 0) {
                                        if (value.weekdays.day && !vm.isEmpty(value.weekdays.day)) {
                                            if (!angular.isArray(value.weekdays, day)) {
                                                var t = [];
                                                t.push(angular.copy(value.weekdays.day));
                                                value.weekdays.day = t;
                                            }
                                        } else {
                                            value.weekdays.day = [];
                                        }

                                        value.weekdays.day.push({
                                            '_day': param.days,
                                            'period': param.period
                                        });
                                    }
                                }
                            }
                        });
                        if (!flag) {
                            if (isMonth) {
                                for (var i = 0; i < run_time.month.length; i++) {
                                    if (run_time.month[i]._month && angular.equals(run_time.month[i]._month, param.months) || angular.equals(run_time.month[i]._month.toString().split(' '), param.months)) {
                                        run_time.month[i].weekdays = {day: []};
                                        run_time.month[i].weekdays.day.push({
                                            '_day': param.days,
                                            'period': param.period
                                        });
                                        break;
                                    }
                                }

                            } else {
                                var x = {_month: param.months, weekdays: {day: []}};
                                x.weekdays.day.push({'_day': param.days, 'period': param.period});
                                run_time.month.push(x);
                            }

                        }
                    } else {
                        var x = {_month: param.months, weekdays: {day: []}};
                        x.weekdays.day.push({'_day': param.days, 'period': param.period});
                        run_time.month.push(x);
                    }
                } else {
                    if (run_time.weekdays.day.length > 0) {
                        var _period = [];
                        angular.forEach(run_time.weekdays.day, function (value) {
                            if (value._day && (angular.equals(value._day, param.days) || angular.equals(value._day.toString().split(' '), param.days))) {

                                if (angular.isArray(value.period)) {
                                    angular.forEach(value.period, function (res) {
                                        if (res)
                                            _period.push(res);
                                    })
                                } else {
                                    if (value.period)
                                        _period.push(value.period);
                                }
                                _period.push(param.period);
                                value.period = _period;
                            }
                        });
                        if (_period.length == 0) {
                            if (!angular.isArray(run_time.weekdays.day)) {
                                run_time.weekdays.day = [];
                            }
                            run_time.weekdays.day.push({'_day': param.days, 'period': param.period});
                        }
                    } else {
                        run_time.weekdays.day.push({'_day': param.days, 'period': param.period});
                    }
                }

            }
            else if (param.tab == 'specificWeekDays') {
                if (param.months && param.months.length > 0) {

                    if (run_time.month.length > 0) {

                        var flag = false;
                        angular.forEach(run_time.month, function (value) {

                            if (isMonth) {
                                if (value.monthdays && value.monthdays.weekday && (angular.equals(value._month, param.months) || angular.equals(value._month.toString().split(' '), param.months))) {

                                    flag = true;
                                    var _period = [];
                                    if (angular.isArray(value.monthdays.weekday)) {
                                        angular.forEach(value.monthdays.weekday, function (value1) {

                                            if (value1._day && value1._day == param.specificWeekDay && value1._which == param.which) {
                                                if (angular.isArray(value1.period)) {
                                                    angular.forEach(value1.period, function (res) {
                                                        if (res)
                                                            _period.push(res);
                                                    })
                                                } else {
                                                    if (value1.period) {
                                                        _period.push(value1.period);
                                                    }

                                                }
                                                _period.push(param.period);
                                                value1.period = _period;
                                            }
                                        });
                                    } else {
                                        if (angular.equals(value.monthdays.weekday._day, param.specificWeekDay) && angular.equals(value.monthdays.weekday._which, param.which)) {

                                            if (angular.isArray(value.monthdays.weekday.period)) {
                                                angular.forEach(value.monthdays.weekday.period, function (res) {
                                                    if (res)
                                                        _period.push(res);
                                                })
                                            } else {
                                                if (value.monthdays.weekday.period)
                                                    _period.push(value.monthdays.weekday.period);

                                            }
                                            _period.push(param.period);
                                            value.monthdays.weekday.period = _period;
                                        }
                                    }

                                    if (_period.length == 0) {
                                        if (!angular.isArray(value.monthdays.weekday)) {
                                            if (value.monthdays.weekday && !vm.isEmpty(value.monthdays.weekday)) {
                                                if (!angular.isArray(value.monthdays.weekday)) {
                                                    var t = [];
                                                    t.push(angular.copy(value.monthdays.weekday));
                                                    value.monthdays.weekday = t;
                                                }
                                            } else {
                                                value.monthdays.weekday = [];
                                            }
                                        }
                                        value.monthdays.weekday.push({
                                            '_day': param.specificWeekDay,
                                            '_which': param.which,
                                            'period': param.period
                                        });
                                    }
                                }
                            }
                        });
                        if (!flag) {

                            if (isMonth) {
                                for (var i = 0; i < run_time.month.length; i++) {
                                    if (run_time.month[i]._month && angular.equals(run_time.month[i]._month, param.months) || angular.equals(run_time.month[i]._month.toString().split(' '), param.months)) {
                                        if ((!run_time.month[i].monthdays)) {
                                            run_time.month[i].monthdays = {weekday: []};
                                        } else {
                                            run_time.month[i].monthdays.weekday = [];
                                        }

                                        run_time.month[i].monthdays.weekday.push({
                                            '_day': param.specificWeekDay,
                                            '_which': param.which,
                                            'period': param.period
                                        });
                                        break;
                                    }
                                }

                            } else {
                                var x;
                                if (!run_time.month.monthdays)
                                    x = {_month: param.months, monthdays: {weekday: []}};
                                else {
                                    x = {_month: param.months};
                                    x.monthdays.weekday = [];
                                }

                                x.monthdays.weekday.push({
                                    '_day': param.specificWeekDay,
                                    '_which': param.which, 'period': param.period
                                });
                                run_time.month.push(x);
                            }

                        }
                    } else {
                        var x;
                        if (!run_time.month.monthdays)
                            x = {_month: param.months, monthdays: {weekday: []}};
                        else {
                            x = {_month: param.months};
                            x.monthdays.weekday = [];
                        }
                        x.monthdays.weekday.push({
                            '_day': param.specificWeekDay,
                            '_which': param.which,
                            'period': param.period
                        });
                        run_time.month.push(x);
                    }
                } else {
                    if (run_time.monthdays.weekday && run_time.monthdays.weekday.length > 0) {
                        var flag = true;
                        angular.forEach(run_time.monthdays.weekday, function (value) {
                            if (value && value._day == param.specificWeekDay && value._which == param.which) {
                                flag = false;
                                if (angular.isArray(value.period) && param.period) {
                                    value.period.push(param.period);
                                } else {
                                    value.period = [];
                                    value.period.push(param.period);
                                }
                            }
                        });

                        if (flag) {
                            var _period = [];
                            if (param.period) {
                                _period.push(param.period);
                            }
                            run_time.monthdays.weekday.push({
                                '_day': param.specificWeekDay,
                                '_which': param.which,
                                'period': _period
                            });
                        }

                    } else {
                        if (!angular.isArray(run_time.monthdays.weekday)) {
                            run_time.monthdays.weekday = [];
                        }
                        var _period = [];
                        if (param.period) {
                            _period.push(param.period);
                        }
                        run_time.monthdays.weekday.push({
                            '_day': param.specificWeekDay,
                            '_which': param.which,
                            'period': _period
                        });
                    }
                }
            }
            else if (param.tab == 'monthDays') {

                if (param.selectedMonths && angular.isArray(param.selectedMonths)) {
                    selectedMonths = angular.copy(param.selectedMonths);
                }
                if (param.selectedMonthsU && angular.isArray(param.selectedMonthsU)) {
                    selectedMonths = angular.copy(param.selectedMonthsU);
                }
                if (selectedMonths.length > 0 || selectedMonthsU.length > 0) {
                    if (param.isUltimos =='months') {
                        if (param.months && param.months.length > 0) {
                            if (run_time.month.length > 0) {

                                var flag = false;
                                angular.forEach(run_time.month, function (value) {
                                    if (isMonth) {
                                        if (value.monthdays && value.monthdays.day && (angular.equals(value._month, param.months) || angular.equals(value._month.toString().split(' '), param.months))) {

                                            flag = true;
                                            var _period = [];

                                            if (angular.isArray(value.monthdays.day)) {
                                                angular.forEach(value.monthdays.day, function (value1) {
                                                    if (value1._day && (angular.equals(value1._day, selectedMonths) || angular.equals(value1._day.toString().split(' '), selectedMonths))) {
                                                        if (angular.isArray(value1.period)) {
                                                            angular.forEach(value1.period, function (res) {
                                                                if (res)
                                                                    _period.push(res);
                                                            })
                                                        } else {
                                                            if (value1.period) {
                                                                _period.push(value1.period);
                                                            }

                                                        }
                                                        _period.push(param.period);

                                                        value1.period = _period;
                                                    }
                                                });
                                            } else {
                                                if (angular.equals(value.monthdays.day._day, selectedMonths) || angular.equals(value.monthdays.day._day.toString().split(' '), selectedMonths)) {

                                                    if (angular.isArray(value.monthdays.day.period)) {
                                                        angular.forEach(value.monthdays.day.period, function (res) {
                                                            if (res)
                                                                _period.push(res);
                                                        })
                                                    } else {
                                                        if (value.monthdays.day.period)
                                                            _period.push(value.monthdays.day.period);

                                                    }


                                                    _period.push(param.period);
                                                    value.monthdays.day.period = _period;
                                                }

                                            }

                                            if (_period.length == 0) {
                                                if (value.monthdays.day && !vm.isEmpty(value.monthdays.day)) {
                                                    if (!angular.isArray(value.monthdays.day)) {
                                                        var t = [];
                                                        t.push(angular.copy(value.monthdays.day));
                                                        value.monthdays.day = t;
                                                    }
                                                } else {
                                                    value.monthdays.day = [];
                                                }

                                                value.monthdays.day.push({
                                                    '_day': angular.copy(selectedMonths),
                                                    'period': param.period
                                                });
                                            }
                                        }

                                    }
                                });
                                if (!flag) {
                                    if (isMonth) {
                                        for (var i = 0; i < run_time.month.length; i++) {

                                            if (run_time.month[i]._month && angular.equals(run_time.month[i]._month, param.months) || angular.equals(run_time.month[i]._month.toString().split(' '), param.months)) {
                                                if ((!run_time.month[i].monthdays)) {
                                                    run_time.month[i].monthdays = {day: []};
                                                } else {
                                                    run_time.month[i].monthdays.day = [];
                                                }
                                                run_time.month[i].monthdays.day.push({
                                                    '_day': angular.copy(selectedMonths),
                                                    'period': param.period
                                                });
                                                break;
                                            }
                                        }

                                    } else {
                                        var x;
                                        if (!run_time.month.monthdays)
                                            x = {_month: param.months, monthdays: {day: []}};
                                        else {
                                            x = {_month: param.months};
                                            x.monthdays.day = [];
                                        }
                                        x.monthdays.day.push({
                                            '_day': angular.copy(selectedMonths),
                                            'period': param.period
                                        });
                                        run_time.month.push(x);
                                    }

                                }
                            } else {
                                var x;
                                if (!run_time.month.monthdays)
                                    x = {_month: param.months, monthdays: {day: []}};
                                else {
                                    x = {_month: param.months};
                                    x.monthdays.day = [];
                                }
                                x.monthdays.day.push({'_day': angular.copy(selectedMonths), 'period': param.period});
                                run_time.month.push(x);

                            }
                        } else {

                            if (run_time.monthdays.day.length > 0) {
                                var _period = [];
                                angular.forEach(run_time.monthdays.day, function (value) {
                                    if (value._day && (angular.equals(value._day, selectedMonths) || angular.equals(value._day.toString().split(' '), selectedMonths))) {
                                        if (angular.isArray(value.period)) {
                                            angular.forEach(value.period, function (res) {
                                                if (res)
                                                    _period.push(res);
                                            })
                                        } else {
                                            if (value.period) {
                                                _period.push(value.period);
                                            }

                                        }
                                        _period.push(param.period);

                                        value.period = _period;
                                    }
                                });

                                if (_period.length == 0) {
                                    if (!angular.isArray(run_time.monthdays.day)) {
                                        run_time.monthdays.day = [];
                                    }
                                    run_time.monthdays.day.push({
                                        '_day': angular.copy(selectedMonths),
                                        'period': param.period
                                    });
                                }

                            } else {
                                run_time.monthdays.day.push({
                                    '_day': angular.copy(selectedMonths),
                                    'period': param.period
                                });
                            }
                        }
                    } else {
                        if (param.months && param.months.length > 0) {

                            if (run_time.month.length > 0) {

                                var flag = false;
                                angular.forEach(run_time.month, function (value) {

                                    if (isMonth) {
                                        if (value.ultimos && (angular.equals(value._month, param.months) || angular.equals(value._month.toString().split(' '), param.months))) {
                                            flag = true;
                                            var _period = [];

                                            if (angular.isArray(value.ultimos.day)) {
                                                angular.forEach(value.ultimos.day, function (value1) {
                                                    if (value1._day && (angular.equals(value1._day, selectedMonthsU) || angular.equals(value1._day.toString().split(' '), selectedMonthsU))) {

                                                        if (angular.isArray(value1.period)) {
                                                            angular.forEach(value1.period, function (res) {
                                                                if (res)
                                                                    _period.push(res);

                                                            })
                                                        } else {
                                                            if (value1.period) {
                                                                _period.push(value1.period);

                                                            }

                                                        }

                                                        _period.push(param.period);

                                                        value1.period = _period;
                                                    }
                                                });
                                            } else {
                                                if (angular.equals(value.ultimos.day._day, selectedMonthsU) || angular.equals(value.ultimos.day._day.toString().split(' '), selectedMonthsU)) {


                                                    if (angular.isArray(value.ultimos.day.period)) {
                                                        angular.forEach(value.ultimos.day.period, function (res) {
                                                            if (res)
                                                                _period.push(res);
                                                        })
                                                    } else {
                                                        if (value.ultimos.day.period)
                                                            _period.push(value.ultimos.day.period);
                                                    }


                                                    _period.push(param.period);
                                                    value.ultimos.day.period = _period;
                                                }
                                            }

                                            if (_period.length == 0) {
                                                if (value.ultimos.day && !vm.isEmpty(value.ultimos.day)) {
                                                    if (!angular.isArray(value.ultimos.day)) {
                                                        var t = [];
                                                        t.push(angular.copy(value.ultimos.day));
                                                        value.ultimos.day = t;
                                                    }
                                                } else {
                                                    value.ultimos.day = [];
                                                }

                                                value.ultimos.day.push({
                                                    '_day': angular.copy(selectedMonthsU),
                                                    'period': param.period
                                                });
                                            }
                                        }
                                    }
                                });
                                if (!flag) {
                                    if (isMonth) {
                                        for (var i = 0; i < run_time.month.length; i++) {

                                            if (run_time.month[i]._month && angular.equals(run_time.month[i]._month, param.months) || angular.equals(run_time.month[i]._month.toString().split(' '), param.months)) {
                                                run_time.month[i].ultimos = {day: []};
                                                run_time.month[i].ultimos.day.push({
                                                    '_day': angular.copy(selectedMonthsU),
                                                    'period': param.period
                                                });
                                                break;
                                            }
                                        }

                                    } else {
                                        var x = {_month: param.months, ultimos: {day: []}};
                                        x.ultimos.day.push({
                                            '_day': angular.copy(selectedMonthsU),
                                            'period': param.period
                                        });
                                        run_time.month.push(x);
                                    }
                                }
                            } else {
                                var x = {_month: param.months, ultimos: {day: []}};
                                x.ultimos.day.push({'_day': angular.copy(selectedMonthsU), 'period': param.period});
                                run_time.month.push(x);

                            }
                        } else {
                            if (run_time.ultimos.day.length > 0) {
                                var _period = [];
                                angular.forEach(run_time.ultimos.day, function (value) {
                                    if (value._day && (angular.equals(value._day, selectedMonthsU) || angular.equals(value._day.toString().split(' '), selectedMonthsU))) {

                                        if (angular.isArray(value.period)) {
                                            angular.forEach(value.period, function (res) {
                                                if (res)
                                                    _period.push(res);

                                            })
                                        } else {
                                            if (value.period) {
                                                _period.push(value.period);

                                            }

                                        }

                                        _period.push(param.period);

                                        value.period = _period;
                                    }
                                });

                                if (_period.length == 0) {
                                    if (!angular.isArray(run_time.ultimos.day)) {
                                        run_time.ultimos.day = [];
                                    }
                                    run_time.ultimos.day.push({
                                        '_day': angular.copy(selectedMonthsU),
                                        'period': param.period
                                    });
                                }

                            } else {
                                run_time.ultimos.day.push({
                                    '_day': angular.copy(selectedMonthsU),
                                    'period': param.period
                                });
                            }
                        }
                    }
                }
            }

            if (selectedMonths.length > 0) {
                param.selectedMonths = angular.copy(selectedMonths);
            }
            if (selectedMonthsU.length > 0) {
                param.selectedMonthsU = angular.copy(selectedMonthsU);
            }

            vm.tempRunTime = run_time;
        };
        vm.deletePeriod = function (index) {
            vm.periodList.splice(index, 1);
        };
        vm.deletePeriodFromFrequency = function (data, index) {
            var xml = x2js.xml_str2json(vm.xmlObj.xml);
            var _xml = xml.run_time || xml.schedule;
            if (!xml) {
                return;
            }
            var period = data.obj[index]._period;
            if (period == '' || !period) {
                for (var i = 0; i < data.obj.length; i++) {
                    if (data.obj[i]._period) {
                        if (i > index) {
                            period = data.obj[i]._period;
                            break;
                        }
                    }
                }
            }

            if (!vm.isEmpty(data.obj) && angular.isArray(data.obj)) {
                if (data.type == 'date') {
                    if (angular.isArray(_xml.date)) {
                        angular.forEach(_xml.date, function (val, index) {
                            if (val._date == data.obj[0]._date) {
                                if (angular.isArray(val.period)) {
                                    for (var i = 0; i < val.period.length; i++) {
                                        if (val.period[i] == period || checkPeriod(val.period[i], period)) {
                                            _xml.date[index].period.splice(i, 1);
                                            break;
                                        }
                                    }
                                } else {
                                    if ((val.period == period || checkPeriod(val.period, period))) {
                                        _xml.date.splice(index, 1);
                                    }
                                }
                            }
                        });
                    } else {
                        if (_xml.date._date == data.obj[0]._date) {
                            if (angular.isArray(_xml.date.period)) {
                                for (var i = 0; i < _xml.date.period.length; i++) {
                                    if (_xml.date.period[i] == period || checkPeriod(_xml.date.period[i], period)) {
                                        _xml.date.period.splice(i, 1);
                                        break;
                                    }
                                }
                            } else {
                                if (_xml.date.period == period || checkPeriod(_xml.date.period, period)) {
                                    delete _xml.date['period'];
                                }
                            }
                        }
                    }
                }
                else if (data.type == 'calendar') {

                    if (angular.isArray(_xml.date)) {
                        angular.forEach(_xml.date, function (val, index) {
                            if (val._calendar == data.obj[0]._calendar) {
                                if (angular.isArray(val.period)) {
                                    for (var i = 0; i < val.period.length; i++) {
                                        if (val.period[i] == period || checkPeriod(val.period[i], period)) {
                                            _xml.date[index].period.splice(i, 1);
                                            break;
                                        }
                                    }
                                } else {
                                    if ((val.period == period || checkPeriod(val.period, period))) {
                                        delete val['period'];
                                    }
                                }
                            }
                        });
                    } else {
                        if (_xml.date._calendar == data.obj[0]._calendar) {
                            if (angular.isArray(_xml.date.period)) {
                                for (var i = 0; i < _xml.date.period.length; i++) {
                                    if (_xml.date.period[i] == period || checkPeriod(_xml.date.period[i], period)) {
                                        _xml.date.period.splice(i, 1);
                                        break;
                                    }
                                }
                            } else {
                                if (_xml.date.period == period || checkPeriod(_xml.date.period, period)) {
                                    delete _xml.date['period'];
                                }
                            }
                        }
                    }
                }
                else if (data.type == 'weekdays') {
                    if (angular.isArray(_xml.weekdays.day)) {
                        angular.forEach(_xml.weekdays.day, function (val, index) {
                            if (val._day == data.obj[0]._day) {
                                if (angular.isArray(val.period)) {
                                    for (var i = 0; i < val.period.length; i++) {
                                        if (val.period[i] == period || checkPeriod(val.period[i], period)) {
                                            _xml.weekdays.day[index].period.splice(i, 1);
                                            break;
                                        }
                                    }
                                } else {
                                    if (val.period == period || checkPeriod(val.period, period)) {
                                        _xml.weekdays.day.splice(index, 1);
                                    }
                                }
                            }
                        });
                    } else {
                        if (_xml.weekdays.day._day == data.obj[0]._day) {
                            if (angular.isArray(_xml.weekdays.day.period)) {
                                for (var i = 0; i < _xml.weekdays.day.period.length; i++) {
                                    if (_xml.weekdays.day.period[i] == period || checkPeriod(_xml.weekdays.day.period[i], period)) {
                                        _xml.weekdays.day.period.splice(i, 1);
                                        break;
                                    }
                                }
                            } else {
                                if ((_xml.weekdays.day.period == period || checkPeriod(_xml.weekdays.day.period, period))) {
                                    delete _xml.weekdays.day ['period'];
                                }
                            }
                        }
                    }
                }
                else if (data.type == 'monthdays') {

                    if (angular.isArray(_xml.monthdays.day)) {

                        angular.forEach(_xml.monthdays.day, function (val, index) {

                            if (val._day == data.obj[0]._day) {

                                if (angular.isArray(val.period)) {
                                    for (var i = 0; i < val.period.length; i++) {
                                        if (val.period[i] == period || checkPeriod(val.period[i], period)) {
                                            _xml.monthdays.day[index].period.splice(i, 1);
                                            break;
                                        }
                                    }
                                } else {
                                    if (val.period == period || checkPeriod(val.period, period)) {
                                        _xml.monthdays.day.splice(index, 1);
                                    }
                                }
                            }
                        });
                    } else {
                        if (_xml.monthdays.day._day == data.obj[0]._day) {
                            if (angular.isArray(_xml.monthdays.day.period)) {
                                for (var i = 0; i < _xml.monthdays.day.period.length; i++) {
                                    if (_xml.monthdays.day.period[i] == period || checkPeriod(_xml.monthdays.day.period[i], period)) {
                                        _xml.monthdays.day.period.splice(i, 1);
                                        break;
                                    }
                                }
                            } else {
                                if ((_xml.monthdays.day.period == period || checkPeriod(_xml.monthdays.day.period, period))) {
                                    delete _xml.monthdays.day ['period'];
                                }
                            }
                        }
                    }
                }
                else if (data.type == 'weekday') {

                    if (angular.isArray(_xml.monthdays.weekday)) {
                        angular.forEach(_xml.monthdays.weekday, function (val, index) {
                            if (val._day == data.obj[0]._day && val._which == data.obj[0]._which) {
                                if (angular.isArray(val.period)) {
                                    for (var i = 0; i < val.period.length; i++) {
                                        if (val.period[i] == period || checkPeriod(val.period[i], period)) {
                                            _xml.monthdays.day[index].period.splice(i, 1);
                                            break;
                                        }
                                    }
                                } else {
                                    if ((val.period == period || checkPeriod(val.period, period))) {
                                        _xml.monthdays.weekday.splice(index, 1);
                                    }
                                }
                            }
                        });
                    } else {
                        if (_xml.monthdays.weekday._day == data.obj[0]._day && _xml.monthdays.weekday._which == data.obj[0]._which) {

                            if (angular.isArray(_xml.monthdays.weekday.period)) {
                                for (var i = 0; i < _xml.monthdays.weekday.period.length; i++) {
                                    if (_xml.monthdays.weekday.period[i] == period || checkPeriod(_xml.monthdays.weekday.period[i], period)) {
                                        _xml.monthdays.weekday.period.splice(i, 1);
                                        break;
                                    }
                                }
                            } else {
                                if (_xml.monthdays.weekday.period == period || checkPeriod(_xml.monthdays.weekday.period, period)) {
                                    delete _xml.monthdays.weekday['period'];
                                }
                            }
                        }
                    }
                }
                else if (data.type == 'ultimos') {

                    if (angular.isArray(_xml.ultimos.day)) {
                        angular.forEach(_xml.ultimos.day, function (val, index) {
                            if (val._day == data.obj[0]._day) {
                                if (angular.isArray(val.period)) {
                                    for (var i = 0; i < val.period.length; i++) {
                                        if (val.period[i] == period || checkPeriod(val.period[i], period)) {
                                            _xml.ultimos.day[index].period.splice(i, 1);
                                            break;
                                        }
                                    }
                                } else {
                                    if (val.period == period || checkPeriod(val.period, period)) {
                                        _xml.ultimos.day.splice(index, 1);
                                    }
                                }
                            }
                        });
                    } else {

                        if (_xml.ultimos.day._day == data.obj[0]._day) {
                            if (angular.isArray(_xml.ultimos.day.period)) {
                                for (var i = 0; i < _xml.ultimos.day.period.length; i++) {
                                    if (_xml.ultimos.day.period[i] == period || checkPeriod(_xml.ultimos.day.period[i], period)) {
                                        _xml.ultimos.day.period.splice(i, 1);
                                        break;
                                    }
                                }
                            } else {
                                if ((_xml.ultimos.day.period == period || checkPeriod(_xml.ultimos.day.period, period))) {
                                    delete _xml.ultimos.day ['period'];
                                }
                            }
                        }
                    }
                }
                else if (data.type == 'month') {
                    if (angular.isArray(_xml.month)) {
                        angular.forEach(_xml.month, function (val1) {
                            if (val1._month == data.obj[0]._month) {

                                if (data.type2 == 'weekdays') {
                                    if (angular.isArray(val1.weekdays.day)) {
                                        angular.forEach(val1.weekdays.day, function (val, index) {
                                            if (val._day == data.obj[0]._day) {
                                                if (angular.isArray(val.period)) {

                                                    for (var i = 0; i < val.period.length; i++) {
                                                        if (val.period[i] == period || checkPeriod(val.period[i], period)) {
                                                            val1.weekdays.day[index].period.splice(i, 1);
                                                            break;
                                                        }
                                                    }

                                                } else {
                                                    if (val.period == period || checkPeriod(val.period, period)) {
                                                        val1.weekdays.day.splice(index, 1);
                                                    }
                                                }

                                            }
                                        });
                                    } else {

                                        if (val1.weekdays.day._day == data.obj[0]._day) {
                                            if (angular.isArray(val1.weekdays.day.period)) {
                                                angular.forEach(val1.weekdays.day.period, function (x, i) {
                                                    if (x == period || checkPeriod(x, period)) {
                                                        val1.weekdays.day.period.splice(i, 1);

                                                    }
                                                });

                                            } else {
                                                if ((val1.weekdays.day.period == period || checkPeriod(val1.weekdays.day.period, period))) {
                                                    delete val1.weekdays.day ['period'];
                                                }
                                            }
                                        }
                                    }

                                } else if (data.type2 == 'ultimos') {

                                    if (angular.isArray(val1.ultimos.day)) {
                                        angular.forEach(val1.ultimos.day, function (val, index) {
                                            if (val._day == data.obj[0]._day) {
                                                if (angular.isArray(val.period)) {
                                                    for (var i = 0; i < val.period.length; i++) {
                                                        if (val.period[i] == period || checkPeriod(val.period[i], period)) {
                                                            val1.ultimos.day[index].period.splice(i, 1);
                                                            break;
                                                        }
                                                    }
                                                } else {
                                                    if (val.period == period || checkPeriod(val.period, period)) {
                                                        val1.ultimos.day.splice(index, 1);
                                                    }
                                                }
                                            }
                                        });
                                    } else {

                                        if (val1.ultimos.day._day == data.obj[0]._day) {
                                            if (angular.isArray(val1.ultimos.day.period)) {
                                                for (var i = 0; i < val1.ultimos.day.period.length; i++) {
                                                    if (val1.ultimos.day.period[i] == period || checkPeriod(val1.ultimos.day.period[i], period)) {
                                                        val1.ultimos.day.period.splice(i, 1);
                                                        break;
                                                    }
                                                }
                                            } else {
                                                if ((val1.ultimos.day.period == period || checkPeriod(val1.ultimos.day.period, period))) {
                                                    delete val1.ultimos.day ['period'];
                                                }
                                            }
                                        }

                                    }
                                } else if (data.type2 == 'monthdays') {

                                    if (angular.isArray(val1.monthdays.day)) {
                                        angular.forEach(val1.monthdays.day, function (val, index) {
                                            if (val._day == data.obj[0]._day) {
                                                if (angular.isArray(val.period)) {
                                                    for (var i = 0; i < val.period.length; i++) {
                                                        if (val.period[i] == period || checkPeriod(val.period[i], period)) {
                                                            val1.monthdays.day[index].period.splice(i, 1);
                                                            break;
                                                        }
                                                    }
                                                } else {
                                                    if (val.period == period || checkPeriod(val.period, period)) {
                                                        val1.monthdays.day.splice(index, 1);
                                                    }
                                                }
                                            }
                                        });
                                    } else {
                                        if (val1.monthdays.day._day == data.obj[0]._day) {
                                            if (angular.isArray(val1.monthdays.day.period)) {
                                                for (var i = 0; i < val1.monthdays.day.period.length; i++) {
                                                    if (val1.monthdays.day.period[i] == period || checkPeriod(val1.monthdays.day.period[i], period)) {
                                                        val1.monthdays.day.period.splice(i, 1);
                                                        break;
                                                    }
                                                }
                                            } else {
                                                if ((val1.monthdays.day.period == period || checkPeriod(val1.monthdays.day.period, period))) {
                                                    delete val1.monthdays.day ['period'];
                                                }
                                            }
                                        }
                                    }
                                } else if (data.type2 == 'weekday') {
                                    if (angular.isArray(val1.monthdays.weekday)) {
                                        angular.forEach(val1.monthdays.weekday, function (val, index) {
                                            if (val._day == data.obj[0]._day && val._which == data.obj[0]._which) {
                                                if (angular.isArray(val.period)) {
                                                    for (var i = 0; i < val.period.length; i++) {
                                                        if (val.period[i] == period || checkPeriod(val.period[i], period)) {
                                                            val1.monthdays.weekday[index].period.splice(i, 1);
                                                            break;
                                                        }
                                                    }
                                                } else {
                                                    if (val.period == period || checkPeriod(val.period, period)) {
                                                        val1.monthdays.weekday.splice(index, 1);
                                                    }
                                                }
                                            }
                                        });
                                    } else {
                                        if (val1.monthdays.weekday._day == data.obj[0]._day && val1.monthdays.weekday._which == data.obj[0]._which) {
                                            if (angular.isArray(val1.monthdays.weekday.period)) {
                                                for (var i = 0; i < val1.monthdays.weekday.period.length; i++) {
                                                    if (val1.monthdays.weekday.period[i] == period || checkPeriod(val1.monthdays.weekday.period[i], period)) {
                                                        val1.monthdays.weekday.period.splice(i, 1);
                                                        break;
                                                    }
                                                }
                                            } else {
                                                if ((val1.monthdays.weekday.period == period || checkPeriod(val1.monthdays.weekday.period, period))) {
                                                    delete val1.monthdays.weekday ['period'];
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        })
                    } else {

                        if (_xml.month._month == data.obj[0]._month) {

                            if (data.type2 == 'weekdays') {
                                if (angular.isArray(_xml.month.weekdays.day)) {
                                    angular.forEach(_xml.month.weekdays.day, function (val, index) {
                                        if (val._day == data.obj[0]._day) {
                                            if (angular.isArray(val.period)) {
                                                for (var i = 0; i < val.period.length; i++) {
                                                    if (val.period[i] == period || checkPeriod(val.period[i], period)) {
                                                        _xml.month.weekdays.day[index].period.splice(i, 1);
                                                        break;
                                                    }
                                                }
                                            } else {
                                                if (val.period == period || checkPeriod(val.period, period)) {
                                                    _xml.month.weekdays.day.splice(index, 1);
                                                }
                                            }

                                        }
                                    });
                                } else {

                                    if (_xml.month.weekdays.day._day == data.obj[0]._day) {
                                        if (angular.isArray(_xml.month.weekdays.day.period)) {
                                            for (var i = 0; i < _xml.month.weekdays.day.period.length; i++) {
                                                if (_xml.month.weekdays.day.period[i] == period || checkPeriod(_xml.month.weekdays.day.period[i], period)) {
                                                    _xml.month.weekdays.day.period.splice(i, 1);
                                                    break;
                                                }
                                            }
                                        } else {
                                            if (_xml.month.weekdays.day.period == period || checkPeriod(_xml.month.weekdays.day.period, period)) {
                                                delete _xml.month.weekdays.day ['period'];
                                            }
                                        }
                                    }
                                }

                            } else if (data.type2 == 'ultimos') {

                                if (angular.isArray(_xml.month.ultimos.day)) {
                                    angular.forEach(_xml.month.ultimos.day, function (val, index) {
                                        if (val._day == data.obj[0]._day) {
                                            if (angular.isArray(val.period)) {
                                                for (var i = 0; i < val.period.length; i++) {
                                                    if (val.period[i] == period || checkPeriod(val.period[i], period)) {
                                                        _xml.month.ultimos.day[index].period.splice(i, 1);
                                                        break;
                                                    }
                                                }
                                            } else {
                                                if (val.period == period || checkPeriod(val.period, period)) {
                                                    _xml.month.ultimos.day.splice(index, 1);
                                                }
                                            }
                                        }
                                    });
                                } else {
                                    if (_xml.month.ultimos.day._day == data.obj[0]._day) {
                                        if (angular.isArray(_xml.month.ultimos.day.period)) {
                                            for (var i = 0; i < _xml.month.ultimos.day.period.length; i++) {
                                                if (_xml.month.ultimos.day.period[i] == period || checkPeriod(_xml.month.ultimos.day.period[i], period)) {
                                                    _xml.month.ultimos.day.period.splice(i, 1);
                                                    break;
                                                }
                                            }
                                        } else {
                                            if (_xml.month.ultimos.day.period == period || checkPeriod(_xml.month.ultimos.day.period, period)) {
                                                delete _xml.month.ultimos.day ['period'];
                                            }
                                        }
                                    }
                                }
                            } else if (data.type2 == 'monthdays') {
                                if (angular.isArray(_xml.month.monthdays.day)) {
                                    angular.forEach(_xml.month.monthdays.day, function (val, index) {
                                        if (val._day == data.obj[0]._day) {
                                            if (angular.isArray(val.period)) {
                                                for (var i = 0; i < val.period.length; i++) {
                                                    if (val.period[i] == period || checkPeriod(val.period[i], period)) {
                                                        _xml.month.monthdays.day[index].period.splice(i, 1);
                                                        break;
                                                    }
                                                }
                                            } else {
                                                if (val.period == period || checkPeriod(val.period, period)) {
                                                    _xml.month.monthdays.day.splice(index, 1);
                                                }
                                            }
                                        }
                                    });
                                } else {
                                    if (_xml.month.monthdays.day._day == data.obj[0]._day) {
                                        if (angular.isArray(_xml.month.monthdays.day.period)) {
                                            for (var i = 0; i < _xml.month.monthdays.day.period.length; i++) {
                                                if (_xml.month.monthdays.day.period[i] == period || checkPeriod(_xml.month.monthdays.day.period[i], period)) {
                                                    _xml.month.monthdays.day.period.splice(i, 1);
                                                    break;
                                                }
                                            }
                                        } else {
                                            if (_xml.month.monthdays.day.period == period || checkPeriod(_xml.month.monthdays.day.period, period)) {
                                                delete  _xml.month.monthdays.day ['period'];
                                            }
                                        }
                                    }
                                }
                            } else if (data.type2 == 'weekday') {
                                if (angular.isArray(_xml.month.monthdays.weekday)) {
                                    angular.forEach(_xml.month.monthdays.weekday, function (val, index) {
                                        if (val._day == data.obj[0]._day && val._which == data.obj[0]._which) {
                                            if (angular.isArray(val.period)) {
                                                for (var i = 0; i < val.period.length; i++) {
                                                    if (val.period[i] == period || checkPeriod(val.period[i], period)) {
                                                        _xml.month.monthdays.weekday[index].period.splice(i, 1);
                                                        break;
                                                    }
                                                }
                                            } else {
                                                if (val.period == period || checkPeriod(val.period, period)) {
                                                    _xml.month.monthdays.weekday.splice(index, 1);
                                                }
                                            }
                                        }
                                    });
                                } else {
                                    if (_xml.month.monthdays.weekday._day == data.obj[0]._day && _xml.month.monthdays.weekday._which == data.obj[0]._which) {
                                        if (angular.isArray(_xml.month.monthdays.weekday.period)) {
                                            for (var i = 0; i < _xml.month.monthdays.weekday.period.length; i++) {
                                                if (_xml.month.monthdays.weekday.period[i] == period || checkPeriod(_xml.month.monthdays.weekday.period[i], period)) {
                                                    _xml.month.monthdays.weekday.period.splice(i, 1);
                                                    break;
                                                }
                                            }
                                        } else {
                                            if (_xml.month.monthdays.weekday.period == period || checkPeriod(_xml.month.monthdays.weekday.period, period)) {
                                                delete  _xml.month.monthdays.weekday ['period'];
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                }
            }

            for (var i = 0; i < vm.runtimeList.length; i++) {
                if (vm.runtimeList[i] == data) {
                    vm.runtimeList.splice(i, 1);
                }
            }

            if (vm.order) {
                vm._xmlTemp = {run_time: _xml};
            }
            else if (vm.schedule) {
                vm._xmlTemp = {schedule: _xml};
            }

            var xmlStr = x2js.json2xml_str(vm._xmlTemp);
            xmlStr = xmlStr.replace(/,/g, ' ');

            getXml2Json(xmlStr);
        };
        var isDelete = false;
        vm.removePeriod = function (period, index) {
            isDelete = true;
            vm.periodList.splice(index, 1);
            if (vm.periodList.length == 0) {
                var temp = angular.copy(vm.runTime);
                vm.runTime = {};
                vm.runTime.period = {};
                vm.runTime.frequency = 'single_start';
                vm.runTime.period._single_start = '00:00';
                vm.runTime.period._when_holiday = 'suppress';
                vm.runTime.tab = temp.tab;
                vm.runTime.isUltimos = temp.isUltimos;
                vm.editor.isEnable = false;
                selectedMonths = [];
                selectedMonthsU = [];
            }

           if (period.tab == "specificDays") {

                if (vm.tempRunTime.date) {
                    angular.forEach(vm.tempRunTime.date, function (value) {

                        if (value._date && (angular.equals(value._date, moment(period.date).format('YYYY-MM-DD')))) {
                            if (angular.isArray(value.period)) {
                                for (var i = 0; i < value.period.length; i++) {
                                    if (angular.equals(value.period[i], period.period)) {
                                        value.period.splice(i, 1);
                                        break;
                                    }
                                }
                            } else {
                                if (angular.equals(value.period, period.period)) {
                                    delete value.period;
                                    delete value._date;
                                }
                            }
                        }
                    });
                }
                if (vm.tempRunTime.date && vm.tempRunTime.date.length > 0) {
                    var tempARR = [];
                    for (var i = 0; i < vm.tempRunTime.date.length; i++) {
                        if (vm.tempRunTime.date[i]._date) {
                            tempARR.push(vm.tempRunTime.date[i]);
                        }
                    }
                    vm.tempRunTime.date = tempARR;
                }

            }
            else if (period.tab == "weekDays") {

                if (period.months && period.months.length > 0) {
                    if (vm.tempRunTime.month && vm.tempRunTime.month.length > 0) {
                        for (var i = 0; i < vm.tempRunTime.month.length; i++) {
                            if (!vm.isEmpty(vm.tempRunTime.month[i].weekdays)) {
                                if (angular.equals(vm.tempRunTime.month[i]._month, period.months)) {
                                    if (vm.tempRunTime.month[i].weekdays && vm.tempRunTime.month[i].weekdays.day) {
                                        if (vm.tempRunTime.month[i].weekdays.day.length > 1) {
                                            angular.forEach(vm.tempRunTime.month[i].weekdays.day, function (value) {
                                                if (angular.equals(value._day, period.days)) {
                                                    if (angular.isArray(value.period)) {
                                                        for (var i = 0; i < value.period.length; i++) {
                                                            if (angular.equals(value.period[i], period.period)) {
                                                                value.period.splice(i, 1);
                                                                break;
                                                            }
                                                        }
                                                    } else {

                                                        if (angular.equals(value.period, period.period)) {
                                                            delete value.period;
                                                            delete value._day;
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
                    if (vm.tempRunTime.weekdays && vm.tempRunTime.weekdays.day) {
                        angular.forEach(vm.tempRunTime.weekdays.day, function (value) {
                            if (value._day && angular.equals(value._day, period.days)) {
                                if (angular.isArray(value.period)) {
                                    if (value.period.length > 1) {
                                        for (var i = 0; i < value.period.length; i++) {
                                            if (angular.equals(value.period[i], period.period)) {
                                                value.period.splice(i, 1);
                                                break;
                                            }
                                        }
                                    } else {
                                        if (angular.equals(value.period[0], period.period)) {
                                            vm.tempRunTime.weekday.day.splice(index, 1)
                                        }
                                    }
                                } else {
                                    if (angular.equals(value.period, period.period)) {
                                        delete value.period;
                                        delete value._day;
                                    }
                                }
                            }
                        });
                        if (vm.tempRunTime.weekdays.day && vm.tempRunTime.weekdays.day.length > 0) {
                            var tempARR = [];
                            for (var i = 0; i < vm.tempRunTime.weekdays.day.length; i++) {
                                if (vm.tempRunTime.weekdays.day[i]._day) {
                                    tempARR.push(vm.tempRunTime.weekdays.day[i]);
                                }
                            }
                            vm.tempRunTime.weekdays.day = tempARR;
                        }
                    }
                }
            }
            else if (period.tab == 'monthDays') {
                if (period.isUltimos == 'months') {
                    if (period.months && period.months.length > 0) {
                        if (vm.tempRunTime.month && vm.tempRunTime.month.length > 0) {

                            for (var i = 0; i < vm.tempRunTime.month.length; i++) {
                                if (!vm.isEmpty(vm.tempRunTime.month[i].monthdays)) {
                                    if (angular.equals(vm.tempRunTime.month[i]._month, period.months)) {
                                        if (vm.tempRunTime.month[i].monthdays && vm.tempRunTime.month[i].monthdays.day) {
                                            if (vm.tempRunTime.month[i].monthdays.day.length > 1) {
                                                angular.forEach(vm.tempRunTime.month[i].monthdays.day, function (value) {
                                                    if (angular.equals(value._day, period.selectedMonths)) {
                                                        if (angular.isArray(value.period)) {
                                                            for (var i = 0; i < value.period.length; i++) {
                                                                if (angular.equals(value.period[i], period.period)) {
                                                                    value.period.splice(i, 1);
                                                                    break;
                                                                }
                                                            }
                                                        } else {

                                                            if (angular.equals(value.period, period.period)) {
                                                                delete value.period;
                                                                delete value._day;
                                                            }
                                                        }
                                                    }
                                                });
                                            } else {
                                                delete vm.tempRunTime.month[i].monthdays['day'];
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    else {
                        if (vm.tempRunTime.monthdays && vm.tempRunTime.monthdays.day) {
                            angular.forEach(vm.tempRunTime.monthdays.day, function (value) {

                                if (value._day && angular.equals(value._day, period.selectedMonths)) {
                                    if (angular.isArray(value.period)) {
                                        if (value.period.length > 1) {
                                            for (var i = 0; i < value.period.length; i++) {
                                                if (angular.equals(value.period[i], period.period)) {
                                                    value.period.splice(i, 1);
                                                    break;
                                                }
                                            }
                                        } else {
                                            if (angular.equals(value.period[0], period.period)) {
                                                vm.tempRunTime.monthdays.day.splice(index, 1)
                                            }
                                        }
                                    } else {
                                        if (angular.equals(value.period, period.period)) {
                                            delete value.period;
                                            delete value._day;
                                        }
                                    }
                                }
                            });
                            if (vm.tempRunTime.monthdays.day && vm.tempRunTime.monthdays.day.length > 0) {
                                var tempARR = [];
                                for (var i = 0; i < vm.tempRunTime.monthdays.day.length; i++) {
                                    if (vm.tempRunTime.monthdays.day[i]._day) {
                                        tempARR.push(vm.tempRunTime.monthdays.day[i]);
                                    }
                                }
                                vm.tempRunTime.monthdays.day = tempARR;
                            }
                        }
                    }
                } else {
                    if (period.months && period.months.length > 0) {
                        if (vm.tempRunTime.month && vm.tempRunTime.month.length > 0) {

                            for (var i = 0; i < vm.tempRunTime.month.length; i++) {
                                if (!vm.isEmpty(vm.tempRunTime.month[i].ultimos)) {
                                    if (angular.equals(vm.tempRunTime.month[i]._month, period.months)) {
                                        if (vm.tempRunTime.month[i].ultimos && vm.tempRunTime.month[i].ultimos.day) {
                                            if (vm.tempRunTime.month[i].ultimos.day.length > 1) {
                                                angular.forEach(vm.tempRunTime.month[i].ultimos.day, function (value) {
                                                    if (angular.equals(value._day, period.selectedMonthsU)) {
                                                        if (angular.isArray(value.period)) {
                                                            for (var i = 0; i < value.period.length; i++) {
                                                                if (angular.equals(value.period[i], period.period)) {
                                                                    value.period.splice(i, 1);
                                                                    break;
                                                                }
                                                            }
                                                        } else {

                                                            if (angular.equals(value.period, period.period)) {
                                                                delete value.period;
                                                                delete value._day;
                                                            }
                                                        }
                                                    }
                                                });
                                            } else {
                                                delete vm.tempRunTime.month[i].ultimos['day'];
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    else {
                        if (vm.tempRunTime.ultimos && vm.tempRunTime.ultimos.day) {
                            angular.forEach(vm.tempRunTime.ultimos.day, function (value) {
                                if (value._day && angular.equals(value._day, period.selectedMonthsU)) {
                                    if (angular.isArray(value.period)) {
                                        if (value.period.length > 1) {
                                            for (var i = 0; i < value.period.length; i++) {
                                                if (angular.equals(value.period[i], period.period)) {
                                                    value.period.splice(i, 1);
                                                    break;
                                                }
                                            }
                                        } else {
                                            if (angular.equals(value.period[0], period.period)) {
                                                vm.tempRunTime.ultimos.day.splice(index, 1)
                                            }
                                        }
                                    } else {
                                        if (angular.equals(value.period, period.period)) {
                                            delete value.period;
                                            delete value._day;
                                        }
                                    }
                                }
                            });
                            if (vm.tempRunTime.ultimos.day && vm.tempRunTime.ultimos.day.length > 0) {
                                var tempARR = [];
                                for (var i = 0; i < vm.tempRunTime.ultimos.day.length; i++) {
                                    if (vm.tempRunTime.ultimos.day[i]._day) {
                                        tempARR.push(vm.tempRunTime.ultimos.day[i]);
                                    }
                                }
                                vm.tempRunTime.ultimos.day = tempARR;
                            }
                        }
                    }
                }

            }
            else if (period.tab == "specificWeekDays") {
                if (period.months && period.months.length > 0) {
                    if (vm.tempRunTime.month && vm.tempRunTime.month.length > 0) {
                        for (var i = 0; i < vm.tempRunTime.month.length; i++) {
                            if (!vm.isEmpty(vm.tempRunTime.month[i].monthdays.weekday)) {
                                if (angular.equals(vm.tempRunTime.month[i]._month, period.months)) {
                                    if (vm.tempRunTime.month[i].monthdays && vm.tempRunTime.month[i].monthdays.weekday) {
                                        if (vm.tempRunTime.month[i].monthdays.weekday.length > 1) {
                                            angular.forEach(vm.tempRunTime.month[i].monthdays.weekday, function (value) {
                                                if (angular.equals(value._day, period.specificWeekDay) && angular.equals(value._which, period.which)) {
                                                    if (angular.isArray(value.period)) {
                                                        for (var i = 0; i < value.period.length; i++) {
                                                            if (angular.equals(value.period[i], period.period)) {
                                                                value.period.splice(i, 1);
                                                                break;
                                                            }
                                                        }
                                                    } else {

                                                        if (angular.equals(value.period, period.period)) {
                                                            delete value.period;
                                                            delete value._day;
                                                        }
                                                    }
                                                }
                                            });
                                        } else {
                                            delete vm.tempRunTime.month[i].monthdays['weekday'];
                                        }
                                    }
                                }
                            }
                        }
                    }
                } else {
                    if (vm.tempRunTime.monthdays && vm.tempRunTime.monthdays.weekday) {
                        angular.forEach(vm.tempRunTime.monthdays.weekday, function (value, index) {
                            if (value._day && (angular.equals(value._day, period.specificWeekDay) && angular.equals(value._which, period.which))) {
                                if (angular.isArray(value.period)) {
                                    if (value.period.length > 1) {
                                        for (var i = 0; i < value.period.length; i++) {
                                            if (angular.equals(value.period[i], period.period)) {
                                                value.period.splice(i, 1);
                                                break;
                                            }
                                        }
                                    } else {
                                        if (angular.equals(value.period[0], period.period)) {
                                            vm.tempRunTime.monthdays.weekday.splice(index, 1)
                                        }
                                    }
                                } else {
                                    if (angular.equals(value.period, period.period)) {
                                        delete value.period;
                                        delete value._day;
                                        delete value._which;
                                    }
                                }
                            }
                        });

                    }
                }
            }
            if (vm.tempRunTime.month && vm.tempRunTime.month.length > 0) {
                var tempARR = [];
                for (var i = 0; i < vm.tempRunTime.month.length; i++) {
                    if (vm.tempRunTime.month[i].weekdays || vm.tempRunTime.month[i].monthdays || vm.tempRunTime.month[i].ultimos) {
                        tempARR.push(vm.tempRunTime.month[i]);
                    }
                }
                vm.tempRunTime.month = tempARR;
            }
        };

        var _tempPeriod = {};
        vm.editPeriod = function (period) {
            var runTime = angular.copy(period);
            _tempPeriod = angular.copy(period);
            vm.runTime = {};
            if (vm.editor.update) {
                $rootScope.$broadcast('update-period', {
                    period: period
                });
                $('#period-editor').modal('show');
                $('.fade-modal').css('opacity', '0.85')

            }

            if (runTime.period._single_start) {
                runTime.frequency = 'single_start';

            }
            else if (runTime.period._absolute_repeat) {
                runTime.frequency = 'absolute_repeat';

            }
            else if (runTime.period._repeat) {
                runTime.frequency = 'repeat';

            }

            promise3 = $timeout(function () {
                vm.runTime = runTime;
                if (runTime.tab == 'monthDays') {
                    if(runTime.isUltimos =='months') {
                        selectedMonths = [];
                        angular.forEach(runTime.selectedMonths, function (val) {
                            vm.selectMonthDays(val);
                        });
                    }else{
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
            getXml2Json(vm.xmlObj.xml);
        };
        vm.showHolidayTab = function () {
            vm.editor.showHolidayTab = true;
            vm.editor.showCalendarTab = false;
            vm._tempHoliday = angular.copy(vm.holidayDates);
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
            $('.fade-modal').css('opacity', '0.85');
        };

        vm.from = {};
        vm.to = {};
        vm.error = {};
        function saveSch() {
            try {

                var _xml = x2js.xml_str2json(vm.xmlObj.xml);
                if (typeof _xml.schedule !== 'object') _xml.schedule = {};

                if (vm.sch._valid_from) {
                    _xml.schedule._valid_from = vm.sch._valid_from;
                } else {
                    delete _xml.schedule['_valid_from'];
                }
                if (vm.sch._valid_to) {
                    _xml.schedule._valid_to = vm.sch._valid_to;
                } else {
                    delete _xml.schedule['_valid_to'];
                }
                if (vm.sch._title) {
                    _xml.schedule._title = vm.sch._title;
                } else {
                    delete _xml.schedule['_title'];
                }
                if (vm.sch._name) {
                    _xml.schedule._name = vm.sch._name;
                } else {
                    if (vm.sch._substitute) {
                        _xml.schedule._substitute = vm.sch._substitute;
                    } else {
                        delete _xml.schedule['_substitute'];
                    }
                }

                var xmlStr = x2js.json2xml_str(_xml);
                xmlStr = xmlStr.replace(/,/g, ' ');

                getXml2Json(xmlStr);
            } catch (e) {
                console.log(e);
            }
        }

        if (vm.substituteObj) {
            vm.substituteObj.fromTime = '00:00';
            vm.substituteObj.toTime = '00:00';
        }
        vm.saveScheduleDetail = function (param) {

            vm.sch._valid_from = undefined;
            vm.sch._name = vm.substituteObj.name;
            if (!vm.substituteObj.fromTime) {
                vm.substituteObj.fromTime = '00:00';
            }
            if (!vm.substituteObj.toTime) {
                vm.substituteObj.toTime = '00:00';
            }
            vm.sch._title = vm.substituteObj.title;
            if (vm.substituteObj.fromTime && vm.substituteObj.fromDate) {
                var date = new Date(vm.substituteObj.fromDate);
                date.setHours(vm.substituteObj.fromTime.substring(0, 2));
                date.setMinutes(vm.substituteObj.fromTime.substring(3, 5));
                if (vm.substituteObj.fromTime.substring(6, 8)) {
                    date.setSeconds(vm.substituteObj.fromTime.substring(6, 8));
                }
                else {
                    date.setSeconds('00');
                }
                vm.sch._valid_from = moment(date).format('YYYY-MM-DD HH:mm:ss');
            }
            vm.sch._valid_to = undefined;
            if (vm.substituteObj.toTime && vm.substituteObj.toDate) {
                var date = new Date(vm.substituteObj.toDate);
                date.setHours(vm.substituteObj.toTime.substring(0, 2));
                date.setMinutes(vm.substituteObj.toTime.substring(3, 5));
                if (vm.substituteObj.toTime.substring(6, 8)) {
                    date.setSeconds(vm.substituteObj.toTime.substring(6, 8));
                }
                else {
                    date.setSeconds('00');
                }
                vm.sch._valid_to = moment(date).format('YYYY-MM-DD HH:mm:ss');
            }

            if (vm.sch._valid_from && vm.sch._valid_to && vm.sch._name) {
                vm.error.validDate = moment(vm.sch._valid_from).diff(moment(vm.sch._valid_to)) > 0;
                if (!vm.error.validDate) {
                    if (!vm.substituteObj.showText && !param) {
                        //vm.createNewRunTime();
                        vm.substituteObj.showText = true;
                    }else {
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
        vm.fileObj.holidayFile = 'live_file';
        vm.addHolidayDate = function (date) {
            var flag = false;
            for (var j = 0; j < vm.holidayDates.length; j++) {
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
            vm.runTime.nationalHoliday.splice(vm.runTime.nationalHoliday.indexOf(date), 1);
        };

        vm.addCalendarFile = function (file) {
            if (vm.calendarFiles.indexOf(vm.fileObj.holidayFile + ': ' + file) === -1 && file) {
                if (vm.fileObj.holidayFile == 'live_file') {
                    vm.calendarFiles.push('live_file: ' + file);
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
            var runTime = {};
            selectedMonths = [];
            selectedMonthsU = [];

            if (!vm.isEmpty(vm.updateTime.obj) && angular.isArray(vm.updateTime.obj)) {
                if (vm.updateTime.type == 'date') {
                    runTime.tab = 'specificDays';
                    runTime.date = new Date(vm.updateTime.obj[0]._date);
                }
                else if (vm.updateTime.type == 'weekdays') {
                    runTime.tab = 'weekDays';
                    runTime.days = vm.updateTime.obj[0]._day.split(' ').sort();
                }
                else if (vm.updateTime.type == 'monthdays') {
                    runTime.tab = 'monthDays';
                    runTime.isUltimos = 'months';
                    angular.forEach(vm.updateTime.obj[0]._day.split(' ').sort(compareNumbers), function (val) {
                        vm.selectMonthDays(val);
                    });
                }
                else if (vm.updateTime.type == 'weekday') {
                    runTime.tab = 'specificWeekDays';
                    runTime.specificWeekDay = vm.updateTime.obj[0]._day;
                    runTime.which = vm.updateTime.obj[0]._which;
                }
                else if (vm.updateTime.type == 'ultimos') {
                    runTime.isUltimos = 'ultimos';
                    runTime.tab = 'monthDays';
                    angular.forEach(vm.updateTime.obj[0]._day.split(' ').sort(compareNumbers), function (val) {
                        vm.selectMonthDaysU(val);
                    });
                }
                else if (vm.updateTime.type == 'month') {
                    runTime.tab = 'weekDays';
                    runTime.months = vm.updateTime.obj[0]._month.split(' ').sort(compareNumbers);
                    vm.showMonthRange = true;
                    if (vm.updateTime.type2 == 'weekdays') {
                        runTime.tab = 'weekDays';
                        runTime.days = vm.updateTime.obj[0]._day.split(' ').sort();
                    }
                    else if (vm.updateTime.type2 == 'monthdays') {
                        runTime.tab = 'monthDays';
                        runTime.isUltimos = 'months';
                        angular.forEach(vm.updateTime.obj[0]._day.split(' ').sort(compareNumbers), function (val) {
                            vm.selectMonthDays(val);
                        });
                    }
                    else if (vm.updateTime.type2 == 'weekday') {
                        runTime.tab = 'specificWeekDays';
                        runTime.specificWeekDay = vm.updateTime.obj[0]._day;
                        runTime.which = vm.updateTime.obj[0]._which;
                    }
                    else if (vm.updateTime.type2 == 'ultimos') {
                        runTime.tab = 'monthDays';
                        runTime.isUltimos = 'ultimos';
                        angular.forEach(vm.updateTime.obj[0]._day.split(' ').sort(compareNumbers), function (val) {
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
                    if (value._period) {
                        if (value._period._single_start) {
                            obj.frequency = 'single_start';
                            obj.period._single_start = value._period._single_start;
                        }
                        else if (value._period._absolute_repeat) {
                            obj.frequency = 'absolute_repeat';
                            obj.period._absolute_repeat = value._period._absolute_repeat;
                        }
                        else if (value._period._repeat) {
                            obj.frequency = 'repeat';
                            obj.period._repeat = value._period._repeat;
                        }
                        if (value._period._begin) {
                            obj.period._begin = value._period._begin;
                        }
                        if (value._period._end) {
                            obj.period._end = value._period._end;
                        }
                        obj.period._when_holiday = value._period._when_holiday || 'suppress';
                    }

                    if (obj.tab == 'weekDays') {
                        obj.days = value._day.toString().split(' ').sort();
                    } else if (obj.tab == 'monthDays') {
                        if (obj.isUltimos == 'months') {
                            obj.selectedMonths = value._day.toString().split(' ').sort(compareNumbers);
                        } else
                            obj.selectedMonthsU = value._day.toString().split(' ').sort(compareNumbers);
                    } else if (obj.tab == 'specificWeekDays') {
                        obj.specificWeekDay = value._day;
                        obj.which = value._which;
                    } else if (obj.tab == 'specificDays') {
                        obj.date = new Date(value._date);
                    }
                    if (value._month) {
                        obj.months = value._month.toString().split(' ').sort(compareNumbers);
                    }
                    obj.str = frequencyToString(obj);
                    vm.periodList.push(obj);

                })
            }
            if (!vm.isEmpty(_tempFrequency)) {
                if (_tempFrequency.type == 'date') {
                    if (angular.isArray(run_time.date)) {
                        angular.forEach(run_time.date, function (res1, index) {
                            if (angular.equals(res1._date, _tempFrequency.obj[0]._date)) {
                                run_time.date.splice(index, 1);
                            }
                        });
                    } else {
                        if (angular.equals(run_time.date._date, _tempFrequency.obj[0]._date)) {
                            delete run_time['date'];
                        }

                    }
                }
                else if (_tempFrequency.type == 'weekdays') {
                    if (run_time.weekdays) {
                        if (angular.isArray(run_time.weekdays.day)) {
                            angular.forEach(run_time.weekdays.day, function (res1, index) {
                                if (angular.equals(res1._day, _tempFrequency.obj[0]._day)) {
                                    run_time.weekdays.day.splice(index, 1);
                                }
                            });
                        } else {
                            if (angular.equals(run_time.weekdays.day._day, _tempFrequency.obj[0]._day)) {
                                delete run_time['weekdays'];
                            }

                        }
                    }
                }
                else if (_tempFrequency.type == 'monthdays') {
                    if (run_time.monthdays) {
                        if (angular.isArray(run_time.monthdays.day)) {
                            angular.forEach(run_time.monthdays.day, function (res1, index) {
                                if (angular.equals(res1._day, _tempFrequency.obj[0]._day)) {
                                    run_time.monthdays.day.splice(index, 1);
                                }
                            });
                        } else {
                            if (angular.equals(run_time.monthdays.day._day, _tempFrequency.obj[0]._day)) {
                                delete run_time.monthdays['day'];
                            }
                        }
                    }

                }
                else if (_tempFrequency.type == 'weekday') {
                    if (run_time.monthdays) {
                        if (run_time.monthdays.weekday && run_time.monthdays.weekday.length > 0) {
                            angular.forEach(run_time.monthdays.weekday, function (res1) {
                                if (!angular.isArray(res1)) {
                                    if (angular.equals(res1._which, _tempFrequency.obj[0]._which) && angular.equals(res1._day, _tempFrequency.obj[0]._day)) {
                                        delete run_time.monthdays['weekday'];
                                    }
                                }
                            });
                        }
                    }
                }
                else if (_tempFrequency.type == 'ultimos') {
                    if (run_time.ultimos) {
                        if (angular.isArray(run_time.ultimos.day)) {
                            angular.forEach(run_time.ultimos.day, function (res1, index) {
                                if (angular.equals(res1._day, _tempFrequency.obj[0]._day)) {
                                    run_time.ultimos.day.splice(index, 1);
                                }
                            });
                        } else {
                            if (angular.equals(run_time.ultimos.day._day, _tempFrequency.obj[0]._day)) {
                                delete run_time['ultimos'];
                            }
                        }
                    }
                }
                else if (_tempFrequency.type == 'month') {
                    if (_tempFrequency.type2 == 'weekdays') {
                        if (angular.isArray(run_time.month)) {
                            angular.forEach(run_time.month, function (res) {
                                if (angular.equals(res._month, _tempFrequency.obj[0]._month)) {
                                    if (angular.isArray(res.weekdays.day)) {
                                        angular.forEach(res.weekdays.day, function (res1, index) {
                                            if (angular.equals(res1._day, _tempFrequency.obj[0]._day)) {
                                                res.weekdays.day.splice(index, 1);
                                            }
                                        });
                                    } else {
                                        if (angular.equals(res.weekdays.day._day, _tempFrequency.obj[0]._day)) {
                                            delete res['weekdays']
                                        }
                                    }
                                }
                            });

                        }
                    }
                    else if (_tempFrequency.type2 == 'monthdays') {

                        if (angular.isArray(run_time.month)) {
                            angular.forEach(run_time.month, function (res, i) {
                                if (angular.equals(res._month, _tempFrequency.obj[0]._month)) {

                                    if (angular.isArray(res.monthdays.day)) {

                                        angular.forEach(res.monthdays.day, function (res1, index) {

                                            if (angular.equals(res1._day, _tempFrequency.obj[0]._day)) {
                                                res.monthdays.day.splice(index, 1);
                                            }
                                        });
                                    } else {
                                        if (angular.equals(res.monthdays.day._day, _tempFrequency.obj[0]._day)) {
                                            delete res.monthdays['day'];
                                        }

                                    }
                                }
                            });
                        }
                    }
                    else if (_tempFrequency.type2 == 'weekday') {
                        if (angular.isArray(run_time.month)) {
                            angular.forEach(run_time.month, function (res, i) {
                                if (angular.equals(res._month, _tempFrequency.obj[0]._month)) {

                                    if (angular.isArray(res.monthdays.weekday)) {

                                        angular.forEach(res.monthdays.weekday, function (res1, index) {

                                            if (angular.equals(res1._day, _tempFrequency.obj[0]._day) && angular.equals(res1._which, _tempFrequency.obj[0]._which)) {
                                                res.monthdays.weekday.splice(index, 1);
                                            }
                                        });
                                    } else {
                                        if (angular.equals(res.monthdays.weekday._day, _tempFrequency.obj[0]._day) && angular.equals(res.monthdays.weekday._which, _tempFrequency.obj[0]._which)) {
                                            delete res.monthdays['weekday'];
                                        }
                                    }
                                }
                            });
                        }
                    }
                    else if (_tempFrequency.type2 == 'ultimos') {
                        if (angular.isArray(run_time.month)) {
                            angular.forEach(run_time.month, function (res) {
                                if (angular.equals(res._month, _tempFrequency.obj[0]._month)) {

                                    if (angular.isArray(res.ultimos.day)) {

                                        angular.forEach(res.ultimos.day, function (res1, index) {

                                            if (angular.equals(res1._day, _tempFrequency.obj[0]._day)) {
                                                res.ultimos.day.splice(index, 1);
                                            }
                                        });
                                    } else {
                                        if (angular.equals(res.ultimos.day._day, _tempFrequency.obj[0]._day)) {
                                            delete res['ultimos']
                                        }

                                    }
                                }
                            });
                        }
                    }
                    if (run_time.month && angular.isArray(run_time.month)) {
                        angular.forEach(run_time.month, function (month, index) {
                            var flag = false;
                            if (!month.weekdays && (!month.monthdays || vm.isEmpty(month.monthdays)) && !month.ultimos) {
                                flag = true;
                            }
                            if (flag) {
                                run_time.month.splice(index, 1);
                            }
                        });
                    }

                }
                if (run_time.monthdays && !run_time.monthdays.day && !run_time.monthdays.weekday) {
                    delete run_time['monthdays'];
                }
            }

            promise1 = $timeout(function () {
                vm.runTime = runTime;
            }, 0);

        };

        vm.deleteRunTime = function (data) {

            var xml = x2js.xml_str2json(vm.xmlObj.xml);
            if (!xml) {
                return;
            }
            var _xml = xml.run_time || xml.schedule;
            if (!xml) {
                return;
            }
            if (!vm.isEmpty(data.obj) && angular.isArray(data.obj)) {
                if (data.type == 'date') {
                    if (angular.isArray(_xml.date)) {
                        angular.forEach(_xml.date, function (val, index) {
                            if (val._date == data.obj[0]._date) {
                                _xml.date.splice(index, 1);
                            }
                        });
                    } else {
                        if (_xml.date._date == data.obj[0]._date) {
                            delete _xml['date'];
                        }
                    }
                }
                else if (data.type == 'weekdays') {
                    if (angular.isArray(_xml.weekdays.day)) {
                        angular.forEach(_xml.weekdays.day, function (val, index) {
                            if (val._day == data.obj[0]._day) {
                                _xml.weekdays.day.splice(index, 1);
                            }
                        });
                    } else {
                        if (_xml.weekdays.day._day == data.obj[0]._day) {
                            delete _xml ['weekdays'];
                        }
                    }
                }
                else if (data.type == 'monthdays') {
                    if (angular.isArray(_xml.monthdays.day)) {
                        angular.forEach(_xml.monthdays.day, function (val, index) {
                            if (val._day == data.obj[0]._day) {
                                _xml.monthdays.day.splice(index, 1);
                            }
                        });
                    } else {
                        if (_xml.monthdays.day._day == data.obj[0]._day) {
                            delete _xml.monthdays ['day'];
                        }
                    }
                }
                else if (data.type == 'weekday') {

                    if (angular.isArray(_xml.monthdays.weekday)) {
                        angular.forEach(_xml.monthdays.weekday, function (val, index) {
                            if (val._day == data.obj[0]._day && val._which == data.obj[0]._which) {
                                _xml.monthdays.weekday.splice(index, 1);
                            }
                        });
                    } else {
                        if (_xml.monthdays.weekday._day == data.obj[0]._day && _xml.monthdays.weekday._which == data.obj[0]._which) {
                            delete _xml.monthdays['weekday'];
                        }
                    }
                }
                else if (data.type == 'ultimos') {
                    if (angular.isArray(_xml.ultimos.day)) {
                        angular.forEach(_xml.ultimos.day, function (val, index) {
                            if (val._day == data.obj[0]._day) {
                                _xml.ultimos.day.splice(index, 1);
                            }
                        });
                    } else {

                        if (_xml.ultimos.day._day == data.obj[0]._day) {
                            delete _xml ['ultimos'];
                        }
                    }
                }
                else if (data.type == 'month') {
                    if (angular.isArray(_xml.month)) {
                        angular.forEach(_xml.month, function (val1) {

                            if (val1._month == data.obj[0]._month) {

                                if (data.type2 == 'weekdays') {

                                    if (angular.isArray(val1.weekdays.day)) {
                                        angular.forEach(val1.weekdays.day, function (val, index) {
                                            if (val._day == data.obj[0]._day) {
                                                val1.weekdays.day.splice(index, 1);
                                            }
                                        });
                                    } else {
                                        if (val1.weekdays.day._day == data.obj[0]._day) {
                                            delete val1 ['weekdays'];
                                        }
                                    }

                                }  else if (data.type2 == 'monthdays') {

                                    if (angular.isArray(val1.monthdays.day)) {
                                        angular.forEach(val1.monthdays.day, function (val, index) {
                                            if (val._day == data.obj[0]._day) {
                                                val1.monthdays.day.splice(index, 1);
                                            }
                                        });
                                    } else {
                                        if (val1.monthdays.day._day == data.obj[0]._day) {
                                            delete val1.monthdays ['day'];
                                        }
                                    }
                                } else if (data.type2 == 'weekday') {

                                    if (angular.isArray(val1.monthdays.weekday)) {
                                        angular.forEach(val1.monthdays.weekday, function (val, index) {
                                            if (val._day == data.obj[0]._day && val._which == data.obj[0]._which) {
                                                val1.monthdays.weekday.splice(index, 1);
                                            }
                                        });
                                    } else {
                                        if (val1.monthdays.weekday._day == data.obj[0]._day && val1.monthdays.weekday._which == data.obj[0]._which) {
                                            delete val1.monthdays ['weekday'];
                                        }
                                    }
                                }else if (data.type2 == 'ultimos') {

                                    if (angular.isArray(val1.ultimos.day)) {
                                        angular.forEach(val1.ultimos.day, function (val, index) {
                                            if (val._day == data.obj[0]._day) {
                                                val1.ultimos.day.splice(index, 1);
                                            }
                                        });
                                    } else {

                                        if (val1.ultimos.day._day == data.obj[0]._day) {
                                            delete val1 ['ultimos'];
                                        }

                                    }
                                }

                            }

                        })

                    }
                    else {
                        if (_xml.month._month == data.obj[0]._month) {
                            if (data.type2 == 'weekdays') {
                                if (angular.isArray(_xml.month.weekdays.day)) {
                                    angular.forEach(_xml.month.weekdays.day, function (val, index) {
                                        if (val._day == data.obj[0]._day)
                                            _xml.month.weekdays.day.splice(index, 1);
                                    });
                                } else {

                                    if (_xml.month.weekdays.day._day == data.obj[0]._day) {
                                        delete _xml.month ['weekdays'];
                                    }
                                }

                            } else if (data.type2 == 'monthdays') {

                                if (angular.isArray(_xml.month.monthdays.day)) {
                                    angular.forEach(_xml.month.monthdays.day, function (val, index) {
                                        if (val._day == data.obj[0]._day) {
                                            _xml.month.monthdays.day.splice(index, 1);

                                        }
                                    });
                                } else {
                                    if (_xml.month.monthdays.day._day == data.obj[0]._day) {
                                        delete _xml.month.monthdays ['day'];
                                    }
                                }
                            }
                            else if (data.type2 == 'weekday') {

                                if (angular.isArray(_xml.month.monthdays.weekday)) {
                                    angular.forEach(_xml.month.monthdays.weekday, function (val, index) {
                                        if (val._day == data.obj[0]._day && val._which == data.obj[0]._which) {
                                            _xml.month.monthdays.weekday.splice(index, 1);

                                        }
                                    });
                                } else {
                                    if (_xml.month.monthdays.weekday._day == data.obj[0]._day && _xml.month.monthdays.weekday._which == data.obj[0]._which) {
                                        delete _xml.month.monthdays ['weekday'];
                                    }
                                }
                                if (_xml.month.monthdays && vm.isEmpty(_xml.month.monthdays)) {
                                    delete _xml.month ['monthdays'];
                                }
                            } else if (data.type2 == 'ultimos') {

                                if (angular.isArray(_xml.month.ultimos.day)) {
                                    angular.forEach(_xml.month.ultimos.day, function (val, index) {
                                        if (val._day == data.obj[0]._day) {
                                            _xml.month.ultimos.day.splice(index, 1);
                                        }
                                    });
                                } else {
                                    if (_xml.month.ultimos.day._day == data.obj[0]._day) {
                                        delete _xml.month ['ultimos'];
                                    }
                                }
                            }
                        }
                    }

                    if (_xml.month && angular.isArray(_xml.month)) {
                        angular.forEach(_xml.month, function (month, index) {
                            var flag = false;
                            if (!month.weekdays && (!month.monthdays || vm.isEmpty(month.monthdays)) && !month.ultimos) {
                                flag = true;
                            }
                            if (flag) {
                                _xml.month.splice(index, 1);
                            }
                        });
                    }

                    if (_xml.month && !angular.isArray(_xml.month)) {
                        if ((!_xml.month.monthdays || vm.isEmpty(_xml.month.monthdays)) && (!_xml.month.weekdays || vm.isEmpty(_xml.month.weekdays)) && (!_xml.month.ultimos || vm.isEmpty(_xml.month.ultimos))) {
                            delete _xml ['month'];
                        }
                    }
                }

                if (_xml.monthdays && !_xml.monthdays.weekday && !_xml.monthdays.day) {
                    delete _xml ['monthdays'];
                }
            }

            for (var i = 0; i < vm.runtimeList.length; i++) {
                if (vm.runtimeList[i] == data) {
                    vm.runtimeList.splice(i, 1);
                }
            }

            if (vm.order) {
                vm._xmlTemp = {run_time: _xml};
            }
            else if (vm.schedule) {
                vm._xmlTemp = {schedule: _xml};
            }

            var xmlStr = x2js.json2xml_str(vm._xmlTemp);
            xmlStr = xmlStr.replace(/,/g, ' ');

            getXml2Json(xmlStr);
        };

        vm.removeTimeZone = function () {
            vm.runTime1.timeZone = '';
            vm.createRunTime();
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
            vm.runTime.frequency = 'single_start';
            vm.runTime.period._when_holiday = 'suppress';
            vm.runTime.tab = 'weekDays';
            vm.runTime.isUltimos = 'months';
            vm.runTime.period._single_start = '00:00';
        };

        vm.createRunTime = function (form) {
            if (form && !form.$invalid && vm.editor.isEnable && vm.editor.create && !isDelete) {
                if (vm.runTime.period) {
                    var flg = false;
                    if (vm.runTime.frequency == 'repeat' || vm.runTime.frequency == 'absolute_repeat') {
                        if (vm.runTime.period._begin) {
                            flg = true;
                        } else {
                            flg = false;
                        }
                        if (vm.runTime.period._end) {
                            flg = true;
                        } else {
                            flg = false;
                        }
                    }
                    if (vm.runTime.frequency == 'single_start' && vm.runTime.period._single_start) {
                        flg = true;
                    }
                    else if (vm.runTime.frequency == 'repeat' && vm.runTime.period._repeat) {
                        flg = true;
                    }
                    else if (vm.runTime.frequency == 'absolute_repeat' && vm.runTime.period._absolute_repeat) {
                        flg = true;
                    } else {
                        flg = false;
                    }

                    if (!flg) {
                        flg = true;
                        angular.forEach(vm.periodList, function (list) {
                            if (list.tab == vm.runTime.tab) {

                                if ((vm.runTime.days || vm.runTime.selectedMonths) && (angular.equals(list.days, vm.runTime.days) || angular.equals(list.selectedMonths, vm.runTime.selectedMonths))) {
                                    if (list.months && vm.runTime.months) {
                                        if (angular.equals(list.months, vm.runTime.months))
                                            flg = false;
                                    } else {
                                        flg = false;
                                    }
                                } else if (vm.runTime.specificWeekDay && vm.runTime.which && (list.specificWeekDay == vm.runTime.specificWeekDay && list.which == vm.runTime.which)) {
                                    flg = false;
                                } else if (vm.runTime.date && (list.date == vm.runTime.date)) {
                                    flg = false;
                                }
                            }
                        })
                    }
                }
                if (flg || vm.periodList.length == 0) {
                    vm.addPeriod();
                }
            }

            if (!vm.isEmpty(_tempFrequency)) {
                angular.forEach(vm.periodList, function (list) {
                    vm.runTime.period = list.period;
                    vm.checkPeriodList(vm.runTime);
                })
            }

            _tempFrequency = {};
            vm.periodList = [];

            vm.editor.hidePervious = false;
            vm.editor.create = false;
            vm.editor.update = false;
            vm.editor.showHolidayTab = false;

            if (vm.isEmpty(vm.tempRunTime)) {
                if (vm.isEmpty(run_time)) {

                    try {
                        var _xml = x2js.xml_str2json(vm.xmlObj.xml);
                    } catch (e) {
                        console.log(e);
                    }
                    run_time = _xml.run_time || _xml.schedule;
                }
                vm.tempRunTime = run_time;
            }

            vm.run_time = vm.tempRunTime;

            delete vm.run_time['_schedule'];

            if (vm.runTime1.date && vm.runTime1.date._date) {
                vm.run_time.date = {};
                vm.run_time.date._date = moment(vm.runTime1.date._date).format('YYYY-MM-DD');
            }

            if (!vm.isEmpty(vm.run_time.date)) {
                if (!(vm.run_time.date && (vm.run_time.date.length > 0))) {
                    delete vm.run_time['date'];
                } else {
                    angular.forEach(vm.run_time.date, function (value, index1) {
                        if (!angular.isArray(value.period)) {
                            if (value.period && value.period._when_holiday == 'suppress')
                                delete vm.run_time.date[index1].period['_when_holiday'];
                        } else {
                            angular.forEach(value.period, function (val, index2) {
                                if (val._when_holiday == 'suppress')
                                    delete vm.run_time.date[index1].period[index2]['_when_holiday'];
                            });
                        }
                    });
                }

            } else {
                delete vm.run_time['date'];
            }
            if (!vm.isEmpty(vm.run_time.weekdays)) {
                if (!(vm.run_time.weekdays.day && (vm.run_time.weekdays.day.length > 0 || vm.run_time.weekdays.day._day))) {
                    delete vm.run_time['weekdays'];
                } else {

                    angular.forEach(vm.run_time.weekdays.day, function (value, index1) {
                        if (!angular.isArray(value.period)) {
                            if (value.period && value.period._when_holiday == 'suppress')
                                delete vm.run_time.weekdays.day[index1].period['_when_holiday'];
                        } else {
                            angular.forEach(value.period, function (val, index2) {
                                if (val._when_holiday == 'suppress')
                                    delete vm.run_time.weekdays.day[index1].period[index2]['_when_holiday'];
                            });
                        }
                    });

                }

            } else {
                delete vm.run_time['weekdays'];
            }

            if (!vm.isEmpty(vm.run_time.monthdays)) {
                if (!(vm.run_time.monthdays.weekday && vm.run_time.monthdays.weekday.length > 0)) {
                    delete vm.run_time.monthdays['weekday'];
                } else {
                    angular.forEach(vm.run_time.monthdays.weekday, function (value, index1) {

                        if (!angular.isArray(value.period)) {
                            if (value.period && value.period._when_holiday == 'suppress')
                                delete vm.run_time.monthdays.weekday[index1].period['_when_holiday'];
                        } else {
                            angular.forEach(value.period, function (val, index2) {
                                if (val._when_holiday == 'suppress')
                                    delete vm.run_time.monthdays.weekday[index1].period[index2]['_when_holiday'];
                            });
                        }
                    });
                }
                if (!(vm.run_time.monthdays.day && (vm.run_time.monthdays.day.length > 0 || vm.run_time.monthdays.day._day))) {

                    if (!vm.run_time.monthdays.weekday) {
                        delete vm.run_time['monthdays'];
                    } else {
                        if (vm.run_time.monthdays.day.length == 0 && vm.run_time.monthdays.weekday.length == 0) {
                            delete vm.run_time['monthdays'];
                        }else if(vm.run_time.monthdays.day.length == 0){
                             delete vm.run_time.monthdays['day'];
                        }
                    }
                } else {
                    angular.forEach(vm.run_time.monthdays.day, function (value, index1) {
                        if (!angular.isArray(value.period)) {
                            if (value.period && value.period._when_holiday == 'suppress')
                                delete vm.run_time.monthdays.day[index1].period['_when_holiday'];
                        } else {
                            angular.forEach(value.period, function (val, index2) {
                                if (val._when_holiday == 'suppress')
                                    delete vm.run_time.monthdays.day[index1].period[index2]['_when_holiday'];
                            });
                        }
                    });
                }
            } else {
                delete vm.run_time['monthdays'];
            }

            if (!vm.isEmpty(vm.run_time.ultimos)) {
                if (!(vm.run_time.ultimos.day && (vm.run_time.ultimos.day.length > 0 || vm.run_time.ultimos.day._day))) {
                    delete vm.run_time['ultimos'];
                } else {
                    angular.forEach(vm.run_time.ultimos.day, function (value, index1) {
                        if (!angular.isArray(value.period)) {
                            if (value.period._when_holiday == 'suppress')
                                delete vm.run_time.ultimos.day[index1].period['_when_holiday'];
                        } else {
                            angular.forEach(value.period, function (val, index2) {
                                if (val._when_holiday == 'suppress')
                                    delete vm.run_time.ultimos.day[index1].period[index2]['_when_holiday'];
                            });
                        }
                    });
                }
            } else {
                delete vm.run_time['ultimos'];
            }

            if (!vm.isEmpty(vm.run_time.month)) {
                if (!(vm.run_time.month.length > 0 || vm.run_time.month._month)) {
                    delete vm.run_time['month'];
                }
            } else {
                delete vm.run_time['month'];
            }
            vm.run_time.holidays = {};
            vm.run_time.holidays.holiday = [];
            vm.run_time.holidays.include = [];
            if (vm.runTime1.holidays) {
                if (vm.runTime1.holidays.weekdays) {
                    vm.run_time.holidays.weekdays = vm.runTime1.holidays.weekdays;
                }
            }
            if (vm.holidayDates && vm.holidayDates.length > 0) {
                angular.forEach(vm.holidayDates, function (value) {
                    vm.run_time.holidays.holiday.push({_date: moment(value).format('YYYY-MM-DD')});
                });
            }

            if (vm.calendarFiles && vm.calendarFiles.length > 0) {
                angular.forEach(vm.calendarFiles, function (value) {
                    var type = value.substr(0, value.indexOf(':'));
                    var n = value.length;
                    if (type == 'live_file') {
                        vm.run_time.holidays.include.push({_live_file: value.substr(value.indexOf(':') + 1, n)});
                    }
                    else if (type == 'file') {
                        vm.run_time.holidays.include.push({_file: value.substr(value.indexOf(':') + 1, n)});
                    }
                });
            }

            if (!vm.isEmpty(vm.run_time.holidays)) {
                if (!(vm.run_time.holidays.holiday && vm.run_time.holidays.holiday.length > 0)) {
                    delete vm.run_time.holidays['holiday'];
                }
                if (!(vm.run_time.holidays.include && vm.run_time.holidays.include.length > 0)) {
                    delete vm.run_time.holidays['include'];
                }

                if (!(vm.run_time.holidays.weekdays && vm.run_time.holidays.weekdays.day && vm.run_time.holidays.weekdays.day._day.length > 0)) {
                    delete vm.run_time.holidays['weekdays'];
                }
            }
            if (vm.isEmpty(vm.run_time.holidays)) {
                delete vm.run_time['holidays'];
            }

            deleteEmptyValue(vm.run_time);

            var tempData = sortRuntimeObj(vm.run_time);

            if (vm.order) {
                vm.run_time = {run_time: tempData};
            }
            else if (vm.schedule) {
                vm.run_time = {schedule: tempData};
            }

            try {
                var xmlStr = x2js.json2xml_str(vm.run_time);
            } catch (e) {
                console.log(e);
            }

            xmlStr = xmlStr.replace(/,/g, ' ');

            vm.holidayList = [];
            vm.runTime.nationalHoliday = [];
            vm.runTime.country = '';
            run_time = {};
            run_time.month = [];
            run_time.weekdays = {};
            run_time.weekdays.day = [];
            run_time.monthdays = {};
            run_time.monthdays.day = [];
            run_time.ultimos = {};
            run_time.ultimos.day = [];
            vm.tempRunTime = {};
            selectedMonths = [];
            selectedMonthsU = [];
            vm.editor.isEnable = false;
            getXml2Json(xmlStr);
        };

        function sortRuntimeObj(runtime) {
            var tempArr = [];

            for (var propName in runtime) {
                if (typeof propName == 'string') {
                    if (propName == 'date') {
                        tempArr.push({date: runtime[propName], key: 0})
                    } else if (propName == 'weekdays') {
                        tempArr.push({weekdays: runtime[propName], key: 1})
                    } else if (propName == 'monthdays') {
                        tempArr.push({monthdays: runtime[propName], key: 2})
                    } else if (propName == 'ultimos') {
                        tempArr.push({ultimos: runtime[propName], key: 3})
                    } else if (propName == 'month') {
                        tempArr.push({month: runtime[propName], key: 4})
                    } else if (propName == 'holidays') {
                        tempArr.push({holidays: runtime[propName], key: 5})
                    }
                }
            }
            tempArr.sort(function (a, b) {
                var x = a['key'];
                var y = b['key'];
                if (x > y) {
                    return x - y;
                }
            });
            var tempData = {};
            angular.forEach(tempArr, function (data) {
                delete data['key'];
                if (data.date) {
                    tempData.date = data.date;
                } else if (data.weekdays) {
                    tempData.weekdays = data.weekdays;
                } else if (data.monthdays) {
                    tempData.monthdays = data.monthdays;
                } else if (data.ultimos) {
                    tempData.ultimos = data.ultimos;
                } else if (data.month) {
                    tempData.month = data.month;
                } else if (data.holidays) {
                    tempData.holidays = data.holidays;
                }
            });

            if (vm.sch) {
                if (vm.sch._name) {
                    tempData._name = vm.sch._name;
                } else {
                    if (vm.sch._substitute) {
                        tempData._substitute = vm.sch._substitute;
                    }
                }
                if (vm.sch._valid_from) {
                    tempData._valid_from = vm.sch._valid_from;
                }
                if (vm.sch._valid_to) {
                    tempData._valid_to = vm.sch._valid_to;
                }
                if (vm.sch._title) {
                    tempData._title = vm.sch._title;
                }
            }


            if (vm.runTime1 && vm.runTime1.timeZone) {
                tempData._time_zone = vm.runTime1.timeZone;
            }

            return tempData;

        }

        vm.assignCalendar = function () {
            $rootScope.$broadcast('calendar-editor',{calendar :vm.selectedCalendar});
            $('#calendar-editor').modal('show');
            $('.fade-modal').css('opacity', '0.85');
        };

        vm.assignHolidayCalendar = function(){
            $rootScope.$broadcast('calendar-editor',{data:'holiday',calendar :vm.holidayCalendar});
            $('#calendar-editor').modal('show');
            $('.fade-modal').css('opacity', '0.85');
        };

        function generateCalendarDates(run_time, dates,calendar) {
            if (dates.length > 0) {
                angular.forEach(dates, function (d) {
                    if (run_time.date) {
                        if (!angular.isArray(run_time.date)) {
                            var _temp = angular.copy(run_time.date);
                            run_time.date = [];
                            run_time.date.push(_temp)
                        }
                        var flag = false;
                        if (run_time.date.length > 0) {
                            for (var i = 0; i < run_time.date.length; i++) {
                                if (run_time.date[i]._date == d && run_time.date[i]._calendar == calendar.path) {
                                    flag = true;
                                    break;
                                }
                            }
                        }

                        if (!flag)
                            run_time.date.push({_calendar: calendar.path, _date: d});
                    } else {
                        run_time.date = {};
                        run_time.date._calendar = calendar.path;
                        run_time.date._date = d;
                    }
                });
            }
        }

        function generateHolidayCalendarDates(run_time, dates,calendar) {
            if (dates.length > 0) {
                angular.forEach(dates, function (d) {
                    if (!vm.isEmpty(run_time.holidays)) {
                        if (run_time.holidays.holiday && angular.isArray(run_time.holidays.holiday)) {
                            run_time.holidays.holiday.push({
                                _calendar: calendar.path,
                                _date: moment(d).format('YYYY-MM-DD')
                            });
                        } else {
                            run_time.holidays.holiday = [];
                            run_time.holidays.holiday.push({
                                _calendar: calendar.path,
                                _date: moment(d).format('YYYY-MM-DD')
                            });
                        }

                    } else {
                        run_time.holidays = {};
                        run_time.holidays.holiday = [];
                        run_time.holidays.holiday.push({
                            _calendar: calendar.path,
                            _date: moment(d).format('YYYY-MM-DD')
                        });
                    }
                });
            }
        }

        function generateCalendarTag(list, type) {
            
            try {
                var _xml = x2js.xml_str2json(vm.xmlObj.xml);
            } catch (e) {
                console.log(e);
            }
            var run_time = _xml.run_time || _xml.schedule || {};

            angular.forEach(list, function (calendar, index) {
                var obj = {};
                obj.dateFrom = calendar.from;
                obj.dateTo = calendar.to;
                obj.path = calendar.path;
                obj.jobschedulerId = vm.schedulerIds.selected;
                CalendarService.getListOfDates(obj).then(function (result) {
                    if (type == 'holiday')
                        generateHolidayCalendarDates(run_time, result.dates, calendar);
                    else
                        generateCalendarDates(run_time, result.dates, calendar);
                    if (index == list.length - 1) {
                        var tempData = sortRuntimeObj(run_time);
                        if (vm.order) {
                            vm.run_time = {run_time: tempData};
                        }
                        else if (vm.schedule) {
                            vm.run_time = {schedule: tempData};
                        }
                        try {
                            var xmlStr = x2js.json2xml_str(vm.run_time);
                        } catch (e) {
                            console.log(e);
                        }
                        xmlStr = xmlStr.replace(/,/g, ' ');
                        getXml2Json(xmlStr);
                    }
                });
            })
        }

        vm.$on('save-holiday-calendar', function (event, data) {
            vm.holidayCalendar = angular.copy(data.holidayCalendar);
            generateCalendarTag(vm.holidayCalendar, 'holiday')

        });
        vm.$on('save-calendar', function (event, data) {
            vm.selectedCalendar = angular.copy(data.selectedCalendar);
            generateCalendarTag(vm.selectedCalendar,'nowworking')

        });

        var tempList=[];

        vm.previewCalendar = function (data) {
            vm.editor.showHolidayTab = false;
            vm.editor.showCalendarTab = true;
            vm.planItems = [];
            vm.viewDate = new Date();
            vm.calendarTitle = new Date().getFullYear();
            var obj = {};
            if(data.calendar) {
                vm.calendarObj = data.calendar;
            }else {
                vm.calendarObj = data;
            }
            obj.dateFrom = vm.calendarObj.from;
            obj.dateTo =  vm.calendarObj.to;
            obj.path = vm.calendarObj.path;
            obj.jobschedulerId = vm.schedulerIds.selected;
            CalendarService.getListOfDates(obj).then(function (result) {
                angular.forEach(result.dates, function (date) {
                    vm.planItems.push({
                        plannedStartTime: date
                    });
                });
                tempList = angular.copy(vm.planItems);
            });
        };

        vm.deleteCalendar = function (data, index) {
            try {
                var _xml = x2js.xml_str2json(vm.xmlObj.xml);
            } catch (e) {
                console.log(e);
            }
            if(!_xml){
                return;
            }
            for(var x=0; x<vm.selectedCalendar.length;x++ ){
                if(data.calendar.path == vm.selectedCalendar[x].path){
                    vm.selectedCalendar.splice(x,1);
                    break;
                }
            }
            var run_time = _xml.run_time || _xml.schedule;

            if (run_time.date) {
                if (!angular.isArray(run_time.date)) {
                    delete run_time['date'];
                } else {
                    var _tempList = angular.copy(run_time.date);
                    angular.forEach(_tempList, function (value, indx) {
                        if (value._calendar && value._calendar == data.calendar.path) {
                            for(var i=0; i<run_time.date.length;i++) {
                                if(value._calendar == run_time.date[i]._calendar) {
                                    run_time.date.splice(i, 1);
                                    break;
                                }
                            }
                        }
                    });

                }
                if(run_time.date && angular.isArray && run_time.date.length==0){
                    delete run_time['date'];
                }
            }

            if (vm.order) {
                vm.run_time = {run_time: run_time};
            }
            else if (vm.schedule) {
                vm.run_time = {schedule: run_time};
            }
            try {
                var xmlStr = x2js.json2xml_str(vm.run_time);
            } catch (e) {
                console.log(e);
            }
            xmlStr = xmlStr.replace(/,/g, ' ');
            getXml2Json(xmlStr);
        };

        vm.deleteHolidayCalendar = function (data) {
            try {
                var _xml = x2js.xml_str2json(vm.xmlObj.xml);
            } catch (e) {
                console.log(e);
            }
            if (!_xml) {
                return;
            }
            for (var x = 0; x < vm.holidayCalendar.length; x++) {
                if (data.path == vm.holidayCalendar[x].path) {
                    vm.holidayCalendar.splice(x, 1);
                    break;
                }
            }
            var run_time = _xml.run_time || _xml.schedule;

            if (run_time.holidays) {
                if (!angular.isArray(run_time.holidays.holiday)) {
                    delete run_time.holidays['holiday'];
                } else {
                    var _tempList = angular.copy(run_time.holidays.holiday);
                    angular.forEach(_tempList, function (value, indx) {
                        if (value._calendar && value._calendar == data.path) {
                            for (var i = 0; i < run_time.holidays.holiday.length; i++) {
                                if (value._calendar == run_time.holidays.holiday[i]._calendar) {
                                    run_time.holidays.holiday.splice(i, 1);
                                    break;
                                }
                            }
                        }
                    });

                }
                if (run_time.holidays.holiday && angular.isArray && run_time.holidays.holiday.length == 0) {
                    delete run_time.holidays['holiday'];
                }
            }

            if (vm.order) {
                vm.run_time = {run_time: run_time};
            }
            else if (vm.schedule) {
                vm.run_time = {schedule: run_time};
            }
            try {
                var xmlStr = x2js.json2xml_str(vm.run_time);
            } catch (e) {
                console.log(e);
            }
            xmlStr = xmlStr.replace(/,/g, ' ');
            getXml2Json(xmlStr);
        };

        vm.back1 = function () {
            vm.editor.showHolidayTab = false;
            vm.editor.showCalendarTab = false;
            getXml2Json(vm.xmlObj.xml);
        };
        function deleteEmptyValueFromArr(obj) {
            for (var i = 0; i < obj.length; i++) {
                deleteEmptyValue(obj[i]);
            }
        }

        function deleteEmptyValue(obj) {
            for (var propName in obj) {
                if (typeof propName == 'string') {
                    if (angular.isArray(obj[propName])) {
                        deleteEmptyValueFromArr(obj[propName]);
                    } else if (obj[propName] === null || obj[propName] === undefined) {
                        delete obj[propName];
                    } else if (typeof  obj[propName] === 'object') {
                        deleteEmptyValue(obj[propName]);
                    }
                }
            }
        }
        function frequencyToString1(period) {
            var str = '';
            if (period.months && angular.isArray(period.months)) {
                str = vm.getMonths(period.months);
            }
            if (period.tab == 'weekDays') {
                if (str) {
                    return vm.getWeekDays(period.days) + ' on ' + str;
                } else {
                    return vm.getWeekDays(period.days);
                }
            } else if (period.tab == 'specificWeekDays') {
                if (!angular.isArray(period.which)) {
                    if (str) {
                        return getSpecificDay(period.which) + ' ' + period.specificWeekDay + ' of ' + str;
                    } else {
                        return getSpecificDay(period.which) + ' ' + period.specificWeekDay + ' of month';
                    }
                } else {
                    var str1 = '';
                    angular.forEach(period.which, function (value, index) {
                        str1 = str1 + getSpecificDay(value);
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
            }
            else if (period.tab == 'monthDays') {
                if (period.isUltimos != 'months') {
                    if (str) {
                        return '- ' + vm.getMonthDays(period.selectedMonthsU, period.isUltimos) + ' of ' + str;
                    } else {
                        return vm.getMonthDays(period.selectedMonthsU, period.isUltimos) + ' of ultimos';
                    }
                } else {
                    if (str) {
                        return vm.getMonthDays(period.selectedMonths) + ' of ' + str;
                    } else {
                        return vm.getMonthDays(period.selectedMonths) + ' of month';
                    }
                }
            }
            else if (period.tab == 'others') {
                if (period.interval == 1) {
                    str = period.interval + 'st ';
                }
                else if (period.interval == 2) {
                    str = period.interval + 'nd ';
                }
                else if (period.interval == 3) {
                    str = period.interval + 'rd ';
                } else {
                    str = period.interval + 'th ';
                }
                var repetitions = period.dateEntity == 'DAILY' ? 'day' : period.dateEntity == 'WEEKLY' ? 'week' : period.dateEntity == 'MONTHLY' ? 'month' : 'year';
                if (period.startingWith) {
                    return 'Every ' + str + repetitions + ' starting with day ' + $filter('date')(period.startingWith, vm.dataFormat);
                } else {
                    return 'Every ' + str + repetitions;
                }

            }
        }
        function convertObjToArr(data) {
            var obj = {};
            if (data.includes && !vm.isEmpty(data.includes)) {
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
                        obj.str = frequencyToString1(obj);
                        vm.frequencyList.push(obj);
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
                                obj.str = frequencyToString1(obj);
                                vm.frequencyList.push(obj);

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
                            vm.frequencyList.push(obj);
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
                                obj.startingWithS = day.from;
                                obj.endOnS = day.to;
                                obj.str = frequencyToString1(obj);
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
                            obj.str = frequencyToString1(obj);
                            vm.calendar.includesFrequency.push(obj);
                        }

                    });
                }
                if (data.includes.repetitions && data.includes.repetitions.length > 0) {
                    angular.forEach(data.includes.repetitions, function (value) {
                        obj = {};
                        obj.tab = "others";
                        obj.type = "INCLUDE";
                        obj.dateEntity = value.repetition;
                        obj.interval = value.step;
                        obj.startingWith = value.from;
                        obj.endOn = value.to;
                        if (value.from)
                            obj.startingWith = value.from;
                        obj.str = frequencyToString1(obj);
                        vm.frequencyList.push(obj);
                    });
                }
            }
        }

        function getCalendarList() {
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.calendarIds = [];
            obj.compact = true;
            angular.forEach(vm.calendars, function (calendar) {
                obj.calendarIds.push(calendar.id);
                convertObjToArr(calendar);
            });
            CalendarService.getListOfCalendars(obj).then(function (res) {
                angular.forEach(res.calendars, function (calendar) {
                    if (calendar.type == 'WORKING_DAYS') {
                        if (vm.selectedCalendar && angular.isArray(vm.selectedCalendar)) {
                            var flag = false;
                            for (var i = 0; i < vm.selectedCalendar.length; i++) {
                                if (vm.selectedCalendar[i].path == calendar.path) {
                                    flag = true;
                                    break;
                                }
                            }
                            if (!flag)
                                vm.selectedCalendar.push(calendar);
                        } else {
                            vm.selectedCalendar = [];
                            vm.selectedCalendar.push(calendar);
                        }
                    } else {
                        if (vm.holidayCalendar && angular.isArray(vm.holidayCalendar)) {
                            var flag = false;
                            for (var i = 0; i < vm.holidayCalendar.length; i++) {
                                if (vm.holidayCalendar[i].path == calendar.path) {
                                    flag = true;
                                    break;
                                }
                            }
                            if (!flag)
                                vm.holidayCalendar.push(calendar);
                        } else {
                            vm.holidayCalendar = [];
                            vm.holidayCalendar.push(calendar);
                        }
                    }
                });
              console.log('>>>')
                if (vm.holidayCalendar && vm.holidayCalendar.length > 0)
                    generateCalendarTag(vm.holidayCalendar, 'holiday');

                if (vm.selectedCalendar && vm.selectedCalendar.length > 0)
                    generateCalendarTag(vm.selectedCalendar, 'working')
console.log(vm.frequencyList)
            });
        }

        if(vm.calendars && vm.calendars.length>0)
            getCalendarList();

        vm.xmlObj = {};
        function loadXml(xml) {
            if (!xml) {
                if (!vm.isEmpty(vm.order)) {
                    vm.xmlObj.xml = '<run_time></run_time>';
                }
                else if (vm.scheduleAction) {

                    var str = '<schedule';
                    if (vm.sch._substitute) {
                        str += ' substitute="' + vm.sch._substitute + '"';
                    }
                    if (vm.sch._valid_from) {
                        str += ' valid_from="' + vm.sch._valid_from + '"';
                    }
                    if (vm.sch._valid_to) {
                        str += ' valid_to="' + vm.sch._valid_to + '"';
                    }
                    if (vm.sch._title) {
                        str += ' title="' + vm.sch._title + '"';
                    }

                    vm.xmlObj.xml = str + '></schedule>';

                } else {
                    vm.xmlObj.xml = '<schedule></schedule>';
                }
            }else{
                vm.xmlObj.xml =  xml;
            }

            getXml2Json(vm.xmlObj.xml, 'load');
        }

        loadXml(vm.xml);


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

    CalendarEditorDialogCtrl.$inject = ['$scope','$rootScope', '$uibModalInstance', '$window', '$filter', 'CalendarService','$uibModal'];
    function CalendarEditorDialogCtrl($scope, $rootScope, $uibModalInstance, $window, $filter, CalendarService,$uibModal) {
        var vm = $scope;

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

        function submit() {

            if (!vm.calendar.create) {
                CalendarService.calendarUsed({id: vm.calendar.id,  jobschedulerId : vm.schedulerIds.selected}).then(function (res) {
                    vm.calendar.usedIn = res;
                    vm.calendarArr = undefined;
                    if (vm.calendar.usedIn && (vm.calendar.usedIn.orders || vm.calendar.usedIn.jobs || vm.calendar.usedIn.schedules)) {
                        var modalInstance = $uibModal.open({
                            templateUrl: 'modules/core/template/confirm-dialog.html',
                            controller: 'DialogCtrl1',
                            scope: vm,
                            backdrop: 'static'
                        });
                        modalInstance.result.then(function () {
                            $rootScope.$broadcast('calendar-obj', {
                                calendar: vm.calendar
                            });
                            $uibModalInstance.close('ok');
                        }, function () {

                        });
                    } else {
                        $rootScope.$broadcast('calendar-obj', {
                            calendar: vm.calendar
                        });
                        $uibModalInstance.close('ok');
                    }
                });
            } else {
                $rootScope.$broadcast('calendar-obj', {
                    calendar: vm.calendar
                });
                $uibModalInstance.close('ok');
            }
        }

        vm.ok = function (form) {

            if(vm.calendar.name && vm.calendar.path && vm.calendar.to){
                form.$setPristine();
                form.$setUntouched();
            }else{
                form.name.$invalid = !vm.calendar.name ? true : false;
                form.name.$dirty = !vm.calendar.name ? true : false;
                form.path.$invalid = !vm.calendar.path ? true : false;
                form.path.$dirty = !vm.calendar.path ? true : false;
                form.to.$invalid = !vm.calendar.to ? true : false;
                form.to.$dirty = !vm.calendar.to ? true : false;
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

        vm.saveAs = function(form) {
            if (vm.calendar.path && vm.calendar.to) {
                form.$setPristine();
                form.$setUntouched();
            } else {
                form.path.$invalid = !vm.calendar.path ? true : false;
                form.path.$dirty = !vm.calendar.path ? true : false;
                form.to.$invalid = !vm.calendar.to ? true : false;
                form.to.$dirty = !vm.calendar.to ? true : false;
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
        vm.frequencyList = [];

        vm.getCategories = function () {
            if (!vm.cateogries || vm.cateogries.length == 0)
                CalendarService.getCalendarCategories({ jobschedulerId : vm.schedulerIds.selected}).then(function (res) {
                    vm.categories = res.categories;
                });
        };


        function frequencyToString(period) {
            var str = '';
            if (period.months && angular.isArray(period.months)) {
                str = vm.getMonths(period.months);
            }
            if (period.tab == 'weekDays') {
                if (str) {
                    return vm.getWeekDays(period.days) + ' on ' + str;
                } else {
                    return vm.getWeekDays(period.days);
                }
            } else if (period.tab == 'specificWeekDays') {
                if (str) {
                    return getSpecificDay(period.which) + ' ' + period.specificWeekDay + ' of ' + str;
                } else {
                    return getSpecificDay(period.which) + ' ' + period.specificWeekDay + ' of month';
                }
            }
            else if (period.tab == 'specificDays') {
                str = 'On ';
                if(period.dates)
                angular.forEach(period.dates.sort(), function (date, index) {
                    str = str + $filter('date')(new Date(date), vm.dataFormat);
                    if (index != period.dates.length - 1) {
                        str = str + ', ';
                    }
                });
                return str;
            }
            else if (period.tab == 'monthDays') {
                if (period.isUltimos != 'months') {
                    if (str) {
                        return '- '+vm.getMonthDays(period.selectedMonthsU, period.isUltimos) + ' of ' + str;
                    } else {
                        return vm.getMonthDays(period.selectedMonthsU, period.isUltimos) + ' of ultimos';
                    }
                } else {
                    if (str) {
                        return vm.getMonthDays(period.selectedMonths) + ' of ' + str;
                    } else {
                        return vm.getMonthDays(period.selectedMonths) + ' of month';
                    }
                }
            }
            else if (period.tab == 'others') {
                if (period.interval == 1) {
                    str = period.interval + 'st ';
                }
                else if (period.interval == 2) {
                    str = period.interval + 'nd ';
                }
                else if (period.interval == 3) {
                    str = period.interval + 'rd ';
                } else {
                    str = period.interval + 'th ';
                }
                var repetitions = period.dateEntity == 'DAILY' ? 'day' : period.dateEntity == 'WEEKLY' ? 'week' : period.dateEntity == 'MONTHLY' ? 'month' : 'year';
                if (period.startingWith) {

                    return 'Every ' + str + repetitions + ' starting with day ' + $filter('date')(period.startingWith, vm.dataFormat);
                } else {
                    return 'Every ' + str + repetitions;
                }

            }
            else if (period.tab == 'nationalHoliday') {
                str = 'On national holidays ';
                if(period.nationalHoliday)
                angular.forEach(period.nationalHoliday.sort(), function (date, index) {
                    str = str + $filter('date')(new Date(date), vm.dataFormat);
                    if (index != period.nationalHoliday.length - 1) {
                        str = str + ', ';
                    }
                });
                return str;
            }
        }
        function getSpecificDay(day) {
            if (!day) {
                return;
            }
            if (day == 1) {
                return '1st';
            } else if (day == 2) {
                return '2nd';
            } else if (day == 3) {
                return '3rd';
            } else if (day == 4) {
                return '4th';
            } else if (day == -1) {
                return 'last';
            } else if (day == -2) {
                return '2nd last';
            } else if (day == -3) {
                return '3rd last';
            } else if (day == -4) {
                return '4th last';
            }
        }
        function convertObjToArr(data) {

            var obj = {};
            if (data.includes && !vm.isEmpty(data.includes)) {
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
                                        obj.startingWithS = day.from;
                                        obj.endOnS = day.to;
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
                                        obj.startingWithS = day.from;
                                        obj.endOnS = day.to;
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
                    angular.forEach(data.includes.dates, function(date){
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
                                obj.startingWithS = day.from;
                                obj.endOnS = day.to;
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
                    angular.forEach(data.includes.holidays, function (holidays) {
                        obj = {};
                        obj.tab = "nationalHoliday";
                        obj.type = "INCLUDE";
                        obj.nationalHoliday = [];
                        angular.forEach(holidays.dates, function (date) {
                            obj.nationalHoliday.push(date);
                        });
                        obj.str = frequencyToString(obj);
                        vm.calendar.includesFrequency.push(obj);
                    });
                }
                if (data.includes.repetitions && data.includes.repetitions.length > 0) {
                    angular.forEach(data.includes.repetitions, function (value) {
                        obj = {};
                        obj.tab = "others";
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

            if (data.excludes && !vm.isEmpty(data.excludes)) {
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
                                        obj.startingWithS = day.from;
                                        obj.endOnS = day.to;
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
                                        obj.startingWithS = day.from;
                                        obj.endOnS = day.to;
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
                                    obj.startingWithM = day.from;
                                    obj.endOnM = day.to;
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
                     angular.forEach(data.excludes.dates, function(date){
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
                                obj.startingWithS = day.from;
                                obj.endOnS = day.to;
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
                                obj.startingWithS = day.from;
                                obj.endOnS = day.to;
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
                    angular.forEach(data.excludes.holidays, function (holidays) {
                        obj = {};
                        obj.tab = "nationalHoliday";
                        obj.type = "EXCLUDE";
                        obj.nationalHoliday = [];
                        angular.forEach(holidays.dates, function (date) {
                            obj.nationalHoliday.push(date);
                        });
                        obj.str = frequencyToString(obj);
                        vm.calendar.excludesFrequency.push(obj);
                    });
                }
                if (data.excludes.repetitions && data.excludes.repetitions.length > 0) {
                    angular.forEach(data.excludes.repetitions, function (value) {
                        obj = {};
                        obj.tab = "others";
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
        function getDay(day) {
            return day == "sunday" ? 0 : day == "monday" ? 1 : day == "tuesday" ? 2 : day == "wednesday" ? 3 : day == "thursday" ? 4 : day == "friday" ? 5 : 6;
        }

        function generateCalendarObj(data, obj) {
            var arr = [];
            var from,to;
            if (data.type == "INCLUDE") {
                if (data.months && angular.isArray(data.months) && data.months.length > 0) {
                    if (!obj.includes.months)
                        obj.includes.months = [];

                    if (data.tab == 'weekDays') {
                        if(data.startingWithW){
                            from = moment(data.startingWithW).format('YYYY-MM-DD')
                        }
                        if(data.endOnW){
                            to = moment(data.endOnW).format('YYYY-MM-DD')
                        }
                        arr.push({days: data.days,from:from, to: to});
                        obj.includes.months.push({months: data.months, weekdays: arr});
                    } else if (data.tab == 'monthDays') {
                        if(data.startingWithM){
                            from = moment(data.startingWithM).format('YYYY-MM-DD')
                        }
                        if(data.endOnM){
                            to = moment(data.endOnM).format('YYYY-MM-DD')
                        }
                        if (data.isUltimos == 'months') {
                            arr.push({days: data.selectedMonths,from:from, to: to});
                            obj.includes.months.push({months: data.months, monthdays: arr});
                        } else {
                            arr.push({days: data.selectedMonths,from:from, to: to});
                            obj.includes.months.push({months: data.months, ultimos: arr});
                        }
                    } else if (data.tab == 'specificWeekDays') {
                        if(data.startingWithS){
                            from = moment(data.startingWithS).format('YYYY-MM-DD')
                        }
                        if(data.endOnS){
                            to = moment(data.endOnS).format('YYYY-MM-DD')
                        }
                        arr.push({
                            day: getDay(data.specificWeekDay),
                            weekOfMonth: Math.abs(data.which)
                        });
                        var arrObj = [];
                        arrObj.push({weeklyDays: arr,from:from, to: to});
                        if (data.which > 0) {
                            obj.includes.months.push({months: data.months, monthdays: arrObj});
                        } else {
                            obj.includes.months.push({months: data.months, ultimos: arrObj});
                        }
                    }
                } else {
                    if (data.tab == 'weekDays') {
                        if (!obj.includes.weekdays)
                            obj.includes.weekdays = [];

                        if(data.startingWithW){
                            from = moment(data.startingWithW).format('YYYY-MM-DD')
                        }
                        if(data.endOnW){
                            to = moment(data.endOnW).format('YYYY-MM-DD')
                        }
                        obj.includes.weekdays.push({days: data.days, from:from, to: to});
                    } else if (data.tab == 'monthDays') {
                        if (data.isUltimos == 'months') {
                            if (!obj.includes.monthdays)
                                obj.includes.monthdays = [];

                            if (data.startingWithM) {
                                from = moment(data.startingWithM).format('YYYY-MM-DD')
                            }
                            if (data.endOnM) {
                                to = moment(data.endOnM).format('YYYY-MM-DD')
                            }
                            obj.includes.monthdays.push({days: data.selectedMonths, from:from, to: to});
                        } else {
                            if (!obj.includes.ultimos)
                                obj.includes.ultimos = [];

                            if (data.startingWithM) {
                                from = moment(data.startingWithM).format('YYYY-MM-DD')
                            }
                            if (data.endOnM) {
                                to = moment(data.endOnM).format('YYYY-MM-DD')
                            }
                            obj.includes.ultimos.push({days: data.selectedMonthsU, from:from, to: to});
                        }
                    } else if (data.tab == 'specificWeekDays') {
                        arr.push({
                            day: getDay(data.specificWeekDay),
                            weekOfMonth: Math.abs(data.which)
                        });

                        if(data.startingWithS){
                            from = moment(data.startingWithS).format('YYYY-MM-DD')
                        }
                        if(data.endOnS){
                            to = moment(data.endOnS).format('YYYY-MM-DD')
                        }
                        if (data.which > 0) {
                            if (!obj.includes.monthdays)
                                obj.includes.monthdays = [];
                            obj.includes.monthdays.push({weeklyDays: arr, from:from, to: to});
                        } else {
                            if (!obj.includes.ultimos)
                                obj.includes.ultimos = [];
                            obj.includes.ultimos.push({weeklyDays: arr, from:from, to: to});
                        }
                    } else if (data.tab == 'specificDays') {
                        if (!obj.includes.dates)
                            obj.includes.dates = [];
                        angular.forEach(data.dates, function (value) {
                            obj.includes.dates.push(moment(value).format('YYYY-MM-DD'))
                        });

                    } else if (data.tab == 'others') {
                        if (!obj.includes.repetitions)
                            obj.includes.repetitions = [];
                        var obj1 = {};
                        obj1.repetition = data.dateEntity;
                        obj1.step = data.interval || 1;
                        if (data.startingWith)
                            obj1.from = moment(data.startingWith).format('YYYY-MM-DD');
                        if(data.endOnW){
                            obj1.to = moment(data.endOn).format('YYYY-MM-DD')
                        }
                        obj.includes.repetitions.push(obj1);

                    } else if (data.tab == 'nationalHoliday') {
                        if (!obj.includes.holidays)
                            obj.includes.holidays = [];
                        var dates = [];
                        angular.forEach(data.nationalHoliday, function (value) {
                            dates.push(moment(value).format('YYYY-MM-DD'))
                        });
                        obj.includes.holidays.push({dates: dates});
                    }
                }
            } else {
                if (data.months && angular.isArray(data.months) && data.months.length > 0) {
                    if (!obj.excludes.months)
                        obj.excludes.months = [];

                    if (data.tab == 'weekDays') {

                        if(data.startingWithW){
                            from = moment(data.startingWithW).format('YYYY-MM-DD')
                        }
                        if(data.endOnW){
                            to = moment(data.endOnW).format('YYYY-MM-DD')
                        }

                        arr.push({days: data.days, from:from, to: to});
                        obj.excludes.months.push({months: data.months, weekdays: arr});
                    } else if (data.tab == 'monthDays') {
                        if (data.startingWithM) {
                            from = moment(data.startingWithM).format('YYYY-MM-DD')
                        }
                        if (data.endOnM) {
                            to = moment(data.endOnM).format('YYYY-MM-DD')
                        }

                        if (data.isUltimos == 'months') {
                            arr.push({days: data.selectedMonths, from:from, to: to});
                            obj.excludes.months.push({months: data.months, monthdays: arr});
                        } else {
                            arr.push({days: data.selectedMonths, from:from, to: to});
                            obj.excludes.months.push({months: data.months, ultimos: arr});
                        }
                    } else if (data.tab == 'specificWeekDays') {
                        if(data.startingWithS){
                            from = moment(data.startingWithS).format('YYYY-MM-DD')
                        }
                        if(data.endOnS){
                            to = moment(data.endOnS).format('YYYY-MM-DD')
                        }
                        arr.push({
                            day: getDay(data.specificWeekDay),
                            weekOfMonth: Math.abs(data.which)
                        });
                        var arrObj = [];
                        arrObj.push({weeklyDays: arr, from:from, to: to});
                        if (data.which > 0) {
                            obj.excludes.months.push({months: data.months, monthdays: arrObj});
                        } else {
                            obj.excludes.months.push({months: data.months, ultimos: arrObj});
                        }
                    }
                } else {
                    if (data.tab == 'weekDays') {
                        if(data.startingWithW){
                            from = moment(data.startingWithW).format('YYYY-MM-DD')
                        }
                        if(data.endOnW){
                            to = moment(data.endOnW).format('YYYY-MM-DD')
                        }
                        if (!obj.excludes.weekdays)
                            obj.excludes.weekdays = [];
                        obj.excludes.weekdays.push({days: data.days, from:from, to: to});
                    } else if (data.tab == 'monthDays') {
                        if(data.startingWithM){
                            from = moment(data.startingWithM).format('YYYY-MM-DD')
                        }
                        if(data.endOnM){
                            to = moment(data.endOnM).format('YYYY-MM-DD')
                        }
                        if (data.isUltimos =='months') {
                            if (!obj.excludes.monthdays)
                                obj.excludes.monthdays = [];
                            obj.excludes.monthdays.push({days: data.selectedMonths, from:from, to: to});
                        } else {
                            if (!obj.excludes.ultimos)
                                obj.excludes.ultimos = [];
                            obj.excludes.ultimos.push({days: data.selectedMonthsU, from:from, to: to});
                        }
                    } else if (data.tab == 'specificWeekDays') {
                        if(data.startingWithS){
                            from = moment(data.startingWithS).format('YYYY-MM-DD')
                        }
                        if(data.endOnS){
                            to = moment(data.endOnS).format('YYYY-MM-DD')
                        }
                        arr.push({
                            day: getDay(data.specificWeekDay),
                            weekOfMonth: Math.abs(data.which)
                        });
                        if (data.which > 0) {
                            if (!obj.excludes.monthdays)
                                obj.excludes.monthdays = [];
                            obj.excludes.monthdays.push({weeklyDays: arr, from:from, to: to});
                        } else {
                            if (!obj.excludes.ultimos)
                                obj.excludes.ultimos = [];
                            obj.excludes.ultimos.push({weeklyDays: arr, from:from, to: to});
                        }
                    } else if (data.tab == 'specificDays') {
                        if (!obj.excludes.dates)
                            obj.excludes.dates = [];
                        angular.forEach(data.dates, function (value) {
                            obj.excludes.dates.push(moment(value).format('YYYY-MM-DD'))
                        });

                    } else if (data.tab == 'others') {
                        if (!obj.excludes.repetitions)
                            obj.excludes.repetitions = [];
                        var obj1 = {};
                        obj1.repetition = data.dateEntity;
                        obj1.step = data.interval || 1;
                        if (data.startingWith)
                            obj1.from = moment(data.startingWith).format('YYYY-MM-DD');
                        if (data.endOn)
                            obj1.to = moment(data.endOn).format('YYYY-MM-DD');
                        obj.excludes.repetitions.push(obj1);

                    } else if (data.tab == 'nationalHoliday') {
                        if (!obj.excludes.holidays)
                            obj.excludes.holidays = [];
                        var dates = [];
                        angular.forEach(data.nationalHoliday, function (value) {
                            dates.push(moment(value).format('YYYY-MM-DD'))
                        });
                        obj.excludes.holidays.push({dates: dates});
                    }
                }

            }

            return obj;
        }

        function generateCalendarAllObj() {
            var obj = {};
            if (vm.calendar.includesFrequency.length > 0) {
                obj.includes = {};
                angular.forEach(vm.calendar.includesFrequency, function (data) {
                    generateCalendarObj(data, obj);
                });
            }
            if (vm.calendar.excludesFrequency.length > 0) {
                obj.excludes = {};
                angular.forEach(vm.calendar.excludesFrequency, function (data) {
                    generateCalendarObj(data, obj);
                });
            }
            return obj;

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
            $rootScope.$broadcast('frequency-editor', {
                frequency: {
                    editor: vm.editor,
                    calendar: vm.calendar,
                    frequency: vm.frequency,
                    frequencyList: vm.frequencyList,
                    excludeFrequencyList: vm.excludeFrequencyList,
                    flag:true
                }
            });

            $('#frequency-editor').modal({show:true});
            $('.fade-modal').css('opacity', '0.85');
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

            $('#frequency-editor').modal({show: true});
            $('.fade-modal').css('opacity', '0.85');

        };


        function getStringDay(day) {
            return day == 0 ? "sunday" : day == 1 ? "monday" : day == 2 ? "tuesday" : day == 3 ? "wednesday" : day == 4 ? "thursday" : day == 5 ? "friday" : "saturday";
        }

        vm.showCalendar = function (data) {
            vm.editor.showYearView = true;
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
                    data : data,
                    flag : true
                }
            });
            $('#frequency-editor').modal({show:true});
            $('.fade-modal').css('opacity', '0.85');
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
            $('#frequency-editor').modal({show:true});
            $('.fade-modal').css('opacity', '0.85');
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
        var interval = $interval(function () {
            $scope.clientLogs = JSON.parse($window.localStorage.clientLogs);
        }, 500);
        $scope.$on('$destroy', function () {
            $interval.cancel(interval);
        });
    }

    CalendarAssignDialogCtrl.$inject = ['$scope', '$rootScope', 'ResourceService', 'CalendarService','orderByFilter'];
    function CalendarAssignDialogCtrl($scope, $rootScope, ResourceService, CalendarService,orderBy) {
        var vm = $scope;
        vm.filter_tree = {};
        vm.filterTree1 = [];
        vm.filter = {};
        vm.object ={};
        var obj={};

        vm.expanding_property = {
            field: "name"
        };

        function loadTree(){
            ResourceService.tree({
                jobschedulerId: vm.schedulerIds.selected,
                compact: true,
                types: vm.filter.type =='WORKING_DAYS' ?  ['WORKINGDAYSCALENDAR'] : ['NONWORKINGDAYSCALENDAR']
            }).then(function (res) {
                vm.filterTree1 = angular.copy(res.folders);
            }, function () {
            });
        }

        $scope.$on('calendar-editor', function (event,calendar) {

            vm.filterTree1=[];
            vm.filter = {};
            vm.object.calendars=[];
            vm.filter.type ='WORKING_DAYS';
            obj={};
            if(calendar.data == 'holiday') {
                vm.holiday = calendar.data;
                vm.filter.type ='NON_WORKING_DAYS';
            }else{
                vm.holiday = undefined;
            }

            vm.calendars =calendar.calendar || [];
            if(vm.calendars.length>0)
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

            }else{
                data.calendars = [];
            }
        };
        vm.addObjectPaths = function () {
            if(vm.holiday){
                $rootScope.$broadcast('save-holiday-calendar', {
                    holidayCalendar: vm.calendars
                });
            }else {
                $rootScope.$broadcast('save-calendar', {
                    selectedCalendar: vm.calendars
                });
            }
            $('#calendar-editor').modal('hide');
            $('.fade-modal').css('opacity', '1');
        };


        vm.cancel = function () {
            $('#calendar-editor').modal('hide');
            $('.fade-modal').css('opacity', 1);
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

    AddRestrictionDialogCtrl.$inject = ['$scope', '$rootScope', 'gettextCatalog'];
    function AddRestrictionDialogCtrl($scope, $rootScope, gettextCatalog) {
        var vm = $scope;

        vm.cancel = function () {
            $('#restriction-editor').modal('hide');
            $('.fade-modal').css('opacity', 1);
        };

        vm.editor = {};
        vm.editor.isEnable = false;

        vm.frequency = {};

        var selectedMonths = [], selectedMonthsU = [];

        function generateFrequencyObj() {
            for (var i = 0; i < vm.frequencyList.length; i++) {
                if (vm.frequencyList[i].tab == 'weekDays') {
                    vm.frequency.days = angular.copy(vm.frequencyList[i].days);
                } else if (vm.frequencyList[i].tab == 'monthDays') {
                    if (vm.frequencyList[i].isUltimos == 'months')
                        vm.frequency.selectedMonths = angular.copy(vm.frequencyList[i].selectedMonths);
                    else
                        vm.frequency.selectedMonthsU = angular.copy(vm.frequencyList[i].selectedMonthsU);
                }
            }
        }

        vm.$on('restriction-frequency-editor', function (event, data) {
            vm.frequencyList = data.frequencyList;
            vm.temp = data.updateFrequency;
            if(!vm.temp) {
                vm.editor.create = true;
                vm.frequency = {};
                vm.frequency.tab = 'weekDays';
                vm.frequency.isUltimos = 'months';
                vm.frequency.dateEntity = 'DAILY';
                if (vm.frequencyList && vm.frequencyList.length > 0) {
                    generateFrequencyObj();
                }
            }else{
                vm.editor.create = false;
                 vm.isRuntimeEdit = true;
                vm.frequency = angular.copy(vm.temp);
            }

        });

        vm.selectMonthDays = function (value) {
            if (selectedMonths.indexOf(value) == -1) {
                selectedMonths.push(value);
            } else {
                selectedMonths.splice(selectedMonths.indexOf(value), 1);
            }
            vm.frequency.selectedMonths = angular.copy(selectedMonths);
            vm.frequency.selectedMonths.sort(compareNumbers);
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
            vm.frequency.selectedMonthsU.sort(compareNumbers);
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
                    } else if (newNames.tab == 'others') {
                        vm.str = gettextCatalog.getString('tab.every');
                    } else if (newNames.tab == 'nationalHoliday') {
                        vm.str = gettextCatalog.getString('tab.nationalHoliday');
                    }
                }


                if (newNames.tab == 'specificWeekDays') {
                    if (newNames.specificWeekDay && newNames.which) {
                        vm.editor.isEnable = true;
                    } else {
                        vm.editor.isEnable = false;
                    }
                } else if (newNames.tab == 'monthDays') {
                    if (newNames.isUltimos == 'months') {
                        if (selectedMonths.length == 0) {
                            vm.editor.isEnable = false;
                        } else {
                            vm.editor.isEnable = true;
                        }
                    } else {
                        if (selectedMonthsU.length == 0) {
                            vm.editor.isEnable = false;
                        } else {
                            vm.editor.isEnable = true;
                        }
                    }

                } else if (newNames.tab == 'others') {
                    if (newNames.interval && newNames.dateEntity) {
                        vm.editor.isEnable = true;
                    } else {
                        vm.editor.isEnable = false;
                    }
                }
                else if (newNames.tab == 'weekDays') {
                    if (newNames.days && newNames.days.length > 0) {
                        vm.editor.isEnable = true;
                    } else {
                        vm.editor.isEnable = false;
                    }
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

        function compareNumbers(a, b) {
            return a - b;
        }

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
                if (vm.frequencyList.length > 0) {
                    for (var i = 0; i < vm.frequencyList.length; i++) {
                        if (angular.equals(vm.frequencyList[i], vm.temp)) {
                            vm.frequencyList[i] = angular.copy(vm.frequency);
                            // saveFrequency();
                            break;
                        }
                    }
                }
                return;
            }

            for (var i = 0; i < vm.frequencyList.length; i++) {
                if (angular.equals(vm.frequencyList[i], vm.frequency)) {
                    flag = true;
                    break;
                }
            }
            if (flag) {
                return;
            }

            if (vm.frequencyList.length > 0) {
                var flag1 = false;
                for (var i = 0; i < vm.frequencyList.length; i++) {
                    if (vm.frequency.tab == vm.frequencyList[i].tab) {
                        if (vm.frequency.tab == 'weekDays') {
                            if (vm.frequency.months) {
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
                        }
                        else if (vm.frequency.tab == 'monthDays' && vm.frequency.isUltimos == 'months' && vm.frequencyList[i].isUltimos == 'months') {
                            if (vm.frequency.months) {
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
                        }
                        else if (vm.frequency.tab == 'monthDays' && vm.frequency.isUltimos != 'months' && vm.frequencyList[i].isUltimos !== 'months') {
                            if (vm.frequency.months) {
                                if (vm.frequency.months == vm.frequencyList[i].months || angular.equals(vm.frequencyList[i].months, vm.frequency.months)) {
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
                        }
                        else if (vm.frequency.tab == 'specificWeekDays') {
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
                        }
                    }
                }

                if (!flag1) {
                    vm.frequency.type = vm.editor.frequencyType;
                    vm.frequencyList.push(angular.copy(vm.frequency))

                }
            } else {
                vm.frequency.type = vm.editor.frequencyType;
                vm.frequencyList.push(angular.copy(vm.frequency));

            }

        };

        vm.editFrequency = function (data) {
            vm.temp = angular.copy(data);
            vm.frequency = angular.copy(data);
            vm.isRuntimeEdit = true;
            if (vm.frequency.tab == 'monthDays') {
                if (vm.frequency.isUltimos == 'months') {
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
        };

        vm.deleteFrequency = function (data, index) {
            vm.frequencyList.splice(index, 1);
            if (vm.frequencyList.length == 0) {
                var temp = angular.copy(vm.frequency);
                vm.frequency = {};
                vm.frequency.tab = temp.tab;
                vm.frequency.isUltimos = temp.isUltimos;
            }
        };

        function getSpecificDay(day) {
            if (!day) {
                return;
            }
            if (day == 1) {
                return '1st';
            } else if (day == 2) {
                return '2nd';
            } else if (day == 3) {
                return '3rd';
            } else if (day == 4) {
                return '4th';
            } else if (day == -1) {
                return 'last';
            } else if (day == -2) {
                return '2nd last';
            } else if (day == -3) {
                return '3rd last';
            } else if (day == -4) {
                return '4th last';
            }
        }

        function frequencyToString(period) {
            var str = '';
            if (period.months && angular.isArray(period.months)) {
                str = vm.getMonths(period.months);
            }
            if (period.tab == 'weekDays') {
                if (str) {
                    return vm.getWeekDays(period.days) + ' on ' + str;
                } else {
                    return vm.getWeekDays(period.days);
                }
            } else if (period.tab == 'specificWeekDays') {
                if (!angular.isArray(period.which)) {
                    if (str) {
                        return getSpecificDay(period.which) + ' ' + period.specificWeekDay + ' of ' + str;
                    } else {
                        return getSpecificDay(period.which) + ' ' + period.specificWeekDay + ' of month';
                    }
                } else {
                    var str1 = '';
                    angular.forEach(period.which, function (value, index) {
                        str1 = str1 + getSpecificDay(value);
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
            }
            else if (period.tab == 'monthDays') {
                if (period.isUltimos != 'months') {
                    if (str) {
                        return '- ' + vm.getMonthDays(period.selectedMonthsU, period.isUltimos) + ' of ' + str;
                    } else {
                        return vm.getMonthDays(period.selectedMonthsU, period.isUltimos) + ' of ultimos';
                    }
                } else {
                    if (str) {
                        return vm.getMonthDays(period.selectedMonths) + ' of ' + str;
                    } else {
                        return vm.getMonthDays(period.selectedMonths) + ' of month';
                    }
                }
            }
            else if (period.tab == 'others') {
                if (period.interval == 1) {
                    str = period.interval + 'st ';
                }
                else if (period.interval == 2) {
                    str = period.interval + 'nd ';
                }
                else if (period.interval == 3) {
                    str = period.interval + 'rd ';
                } else {
                    str = period.interval + 'th ';
                }
                var repetitions = period.dateEntity == 'DAILY' ? 'day' : period.dateEntity == 'WEEKLY' ? 'week' : period.dateEntity == 'MONTHLY' ? 'month' : 'year';
                if (period.startingWith) {
                    return 'Every ' + str + repetitions + ' starting with day ' + $filter('date')(period.startingWith, vm.dataFormat);
                } else {
                    return 'Every ' + str + repetitions;
                }

            }
        }

        vm.cancel = function (form1) {
            vm.period = {};
            vm.period.period = {};
            $rootScope.$broadcast('cancel-period');
            if (form1)
                form1.$setPristine();
            $('#restriction-editor').modal('hide');
            $('.fade-modal').css('opacity', 1);
        };
        vm.save = function (form1) {
            $rootScope.$broadcast('save-restriction-frequency', {
                list: vm.frequencyList
            });
            vm.period = {};
            vm.period.period = {};
            if (form1) {
                form1.$setPristine();
                form1.$setUntouched();
            }
            $('#restriction-editor').modal('hide');
            $('.fade-modal').css('opacity', 1);

        };

        $scope.$on('$destroy', function () {
            watcher1();
            watcher2();
        });

    }

})();
