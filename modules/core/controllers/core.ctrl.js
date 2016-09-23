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
        .controller('RuntimeEditorDialogCtrl', RuntimeEditorDialogCtrl);
       

    AppCtrl.$inject = ['$scope', '$window'];
    function AppCtrl($scope, $window) {
        var vm = $scope;

        vm.app = {
            name: 'JobScheduler'
        };

        vm.goBack = function () {
            $window.history.back();
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
            }
            else if (d == 4) {
                return 'text-dark';
            } else if (d == 5) {
                return 'dark-orange';
            }
            else if (d == 6) {
                return 'corn-flower-blue';
            }
            else if (d == 7) {
                return 'dark-magenta';
            }
            else if (d == 8) {
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
            }
            else if (d == 4) {
                return 'bg-transparent';
            } else if (d == 5) {
                return 'bg-dark-orange';
            }
            else if (d == 6) {
                return 'bg-corn-flower-blue';
            }
            else if (d == 7) {
                return 'bg-dark-magenta';
            }
            else if (d == 8) {
                return 'bg-chocolate';
            }
        };

        vm.calculateHeight = function () {
            var headerHt = $('.app-header').height() || 64;
            var footerHt = $('.app-footer').height() || 30;
            var topHeaderHt = $('.top-header-bar').height() || 16;
            var subHeaderHt = 58;

            var ht = (window.innerHeight - (headerHt + footerHt + topHeaderHt + subHeaderHt)) + 'px';

            $('.max-ht').css('height', ht);
        };

        $(window).resize(function () {
            vm.calculateHeight();
        });

        vm.$on('$viewContentLoaded', function () {
            vm.calculateHeight();
        });
    }

    HeaderCtrl.$inject = ['$scope', 'SOSAuth', '$rootScope', 'UserService', '$location', 'JobSchedulerService', '$interval', '$state'];
    function HeaderCtrl($scope, SOSAuth, $rootScope, UserService, $location, JobSchedulerService, $interval, $state) {
        var vm = $scope;
        vm.schedulerIds = {};

        vm.currentTime = moment();
        $interval(function () {
            vm.currentTime = moment();
        }, 15000);

        $rootScope.$on('reloadDate', function () {
            vm.currentTime = moment();
            var date = new Date(vm.selectedJobScheduler.startedAt);
            date.setSeconds(date.getSeconds() + 1);
            vm.selectedJobScheduler.startedAt = date;
        });


        vm.username = SOSAuth.currentUserData;

        setPermission();
        setIds();

        $rootScope.$on('reloadUser', function () {
            setPermission();
            setIds();
        });

        function setPermission() {
            if (SOSAuth.permission) {
                vm.permission = JSON.parse(SOSAuth.permission);
            }
        }

        function setIds() {
            if (SOSAuth.scheduleIds) {
                vm.schedulerIds = JSON.parse(SOSAuth.scheduleIds);
            }
        }

        vm.logout = function () {
            UserService.logout();
            $location.path('/login');
        };


        vm.getScheduleDetail = function (id) {
            JobSchedulerService.get({jobschedulerId: id}).then(function (res) {
                vm.selectedJobScheduler = res.jobscheduler;
                vm.selectedScheduler.scheduler = vm.selectedJobScheduler;
                if (vm.selectedScheduler && vm.selectedScheduler.scheduler)
                    document.title = vm.selectedScheduler.scheduler.host + ':' + vm.selectedScheduler.scheduler.port + '/' + vm.selectedScheduler.scheduler.jobschedulerId;
            }, function (err) {

            })
        };

        vm.getScheduleDetail(vm.schedulerIds.selected);

        vm.changeScheduler = function (jobScheduler) {
            JobSchedulerService.switchSchedulerId(jobScheduler).then(function () {
                $state.reload();
            }, function (err) {

            })
        };

        vm.$on('$stateChangeSuccess', function () {
            vm.filterString = '';
            if (vm.selectedScheduler && vm.selectedScheduler.scheduler)
                document.title = vm.selectedScheduler.scheduler.host + ':' + vm.selectedScheduler.scheduler.port + '/' + vm.selectedScheduler.scheduler.jobschedulerId;
        });
    }

    ConfigurationCtrl.$inject = ["$scope", "JobService", "JobChainService", "OrderService", "ScheduleService", "ResourceService", "$location", "SOSAuth"];
    function ConfigurationCtrl($scope, JobService, JobChainService, OrderService, ScheduleService, ResourceService, $location, SOSAuth) {
        var vm = $scope;
        if (SOSAuth.scheduleIds) {
            vm.schedulerIds = JSON.parse(SOSAuth.scheduleIds);
        }


        var object = $location.search();
        document.title = object.path.substring(object.path.lastIndexOf('/') + 1) + " - JobScheduler";
        vm.type = object.type;
        if (object.type == 'jobChain') {
            JobChainService.getConfiguration(object.path, vm.schedulerIds.selected).then(function (res) {
                vm.configuration = res.configuration;
                vm.html = $.parseHTML(res.configuration.content.html);
                vm.html = vm.html[0].textContent;
            }, function (err) {

            });
        }
        else if (object.type == 'job') {
            JobService.getConfiguration(object.path, vm.schedulerIds.selected).then(function (res) {
                vm.configuration = res.configuration;
                vm.html = $.parseHTML(res.configuration.content.html);
                vm.html = vm.html[0].textContent;

            }, function (err) {

            });
        } else if (object.type == 'order') {
            OrderService.getConfiguration(object.path, vm.schedulerIds.selected).then(function (res) {
                vm.configuration = res.configuration;
                vm.html = $.parseHTML(res.configuration.content.html);
                vm.html = vm.html[0].textContent;

            }, function (err) {

            });
        }
        else if (object.type == 'schedule') {
            ScheduleService.getConfiguration(object.path, vm.schedulerIds.selected).then(function (res) {
                vm.configuration = res.configuration;
                vm.html = $.parseHTML(res.configuration.content.html);
                vm.html = vm.html[0].textContent;

            }, function (err) {

            });
        }
        else if (object.type == 'lock') {
            ResourceService.getConfiguration(vm.schedulerIds.selected).then(function (res) {
                vm.configuration = res.configuration;
                vm.html = $.parseHTML(res.configuration.content.html);
                vm.html = vm.html[0].textContent;

            }, function (err) {

            });
        }
    }

    DialogCtrl.$inject = ["$scope", "$uibModalInstance"];
    function DialogCtrl($scope, $uibModalInstance) {
        var vm = $scope;

        vm.calendarView = 'month';
        vm.viewDate = new Date();
        vm.events = [];
        vm.isCellOpen = true;
        vm.ok = function () {
            $uibModalInstance.close('ok');
        };
        vm.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

        vm.addCriteria = function () {
            var param = {
                name: null,
                value: null
            };
            if (vm.paramObject && vm.paramObject.params)
                vm.paramObject.params.push(param);
        };

        vm.addCriteria();

        vm.removeParams = function (index) {
            vm.paramObject.params.splice(index, 1);
        };

        vm.viewChangeClicked = function (nextView) {
            if (nextView === 'month') {
                return false;
            }
        };

    }

    RuntimeEditorDialogCtrl.$inject = ["$scope", "$uibModalInstance", "toasty"];
    function RuntimeEditorDialogCtrl($scope, $uibModalInstance, toasty) {
        var vm = $scope;
        var dom_parser = new DOMParser();
        vm.ok = function () {

            try {

                var dom_document = dom_parser.parseFromString(vm.xml, "text/xml");
                if (dom_document.documentElement.nodeName == "parsererror") {
                    throw new Error("Error at XML answer: " + dom_document.documentElement.firstChild.nodeValue);
                } else {
                    $uibModalInstance.close('ok');
                }
            } catch (e) {
                toasty.error({
                    title: 'Invalid xml',
                    msg: e
                });
            }
        };
        vm.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

        vm.editor = {};
        vm.editor.hidePervious = false;
        vm.editor.isEnable = false;
        vm.editor.nextPage = false;
        vm.runTime = {};
        vm.runTime.every = 'weekDays';
        vm.runTime.tab = 'weekDays';
        vm.runTime.frequency = 'single_start';
        vm.tempRunTime = {};
        vm.runTime1 = {};


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

        vm.editor.when_holiday_options = {
            'previous_non_holiday': 'previous non holiday',
            'next_non_holiday': 'next non holiday',
            'suppress': 'suppress execution (default)',
            'ignore_holiday': 'ignore holiday'
        };

        function getWeekDays(day) {
            if (!day) {
                return;
            }
            var days = day.toString().split(' ');
            var str = '(';
            angular.forEach(days, function (value) {
                if (value == 1) {
                    str = str + 'Mo,';
                } else if (value == 2) {
                    str = str + 'Tu,';
                }
                else if (value == 3) {
                    str = str + 'We,';
                }
                else if (value == 4) {
                    str = str + 'Th,';
                } else if (value == 5) {
                    str = str + 'Fr,';
                } else if (value == 6) {
                    str = str + 'Sa,';
                }
                else if (value == 7) {
                    str = str + 'Su';
                }
            });

            if (str.length == 1) {
                return '';
            } else {
                if (str.substring(str.length - 1) == ',') {
                    str = str.substring(0, str.length - 1);
                }
            }
            return str + ')'
        }

        function getMonths(month) {
            var str = '(';
            if (!month) {
                return;
            }
            var months = month.toString().split(' ');

            angular.forEach(months, function (value) {
                if (value == 1) {
                    str = str + 'Jan,';
                }
                else if (value == 2) {
                    str = str + 'Feb,';
                }
                else if (value == 3) {
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
            return str + ')'
        }


        function getSpecificDay(day) {

            if (!day) {
                return;
            }
            if (day == 1) {
                return '1st ';
            } else if (day == 2) {
                return '2nd ';
            } else if (day == 3) {
                return '3rd ';
            } else if (day == 4) {
                return '4th ';
            } else if (day == -1) {
                return 'last ';
            } else if (day == -2) {
                return '2nd last ';
            } else if (day == -3) {
                return '3rd last ';
            } else if (day == -4) {
                return '4th last ';
            }
        }

        function getMonthDays(month) {
            var str = '(';
            if (!month) {
                return month;
            }
            var months = month.toString().split(' ');
            angular.forEach(months, function (value) {
                str = str + value + 'th,';
            });

            if (str.length == 1) {
                return '';
            } else {
                if (str.substring(str.length - 1) == ',') {
                    str = str.substring(0, str.length - 1);
                }
            }
            return str + ')'
        }

        function isEmpty(obj) {
            for (var key in obj) {
                if (obj.hasOwnProperty(key))
                    return false;
            }
            return true;
        }


        var selectedMonths = [];
        vm.selectMonthDays = function (value) {
            if (selectedMonths.indexOf(value) == -1) {
                selectedMonths.push(value);
            } else {
                selectedMonths.splice(selectedMonths.indexOf(value), 1);
            }
            vm.editor.isEnable = selectedMonths.length > 0;
        };

        vm.getSelectedMonthDays = function (value) {
            if (selectedMonths.indexOf(value) != -1)
                return true;
        };

        vm.textEditor = function (xml) {
            getXml2Json(xml);
        };

        var watcher1 = vm.$watchCollection('runTime', function (newNames, oldValues) {
            if (newNames && oldValues) {

                if (newNames.every && oldValues.every && ((newNames.every != oldValues.every) || (newNames.tab != oldValues.tab))) {
                    vm.runTime = {};
                    vm.runTime.every = newNames.every;
                    vm.runTime.frequency = 'single_start';
                    vm.runTime.tab = newNames.tab;
                    vm.runTime.period = {};
                    vm.runTime.period._when_holiday = 'suppress';
                    if (vm.editor.create)
                        selectedMonths = [];
                }
                if (vm.editor.create) {
                    if (newNames.every == 'monthDays') {
                        vm.str = 'Month Day';
                    } else if (newNames.every == 'yearDays') {
                        vm.str = 'Year Day';
                    } else {
                        vm.str = 'Every Day';
                    }
                }

                if (newNames.isUltimos != oldValues.isUltimos) {
                    if (vm.editor.create)
                        selectedMonths = [];
                }

                if (newNames.tab == 'weekDays' && newNames.days) {
                    vm.editor.isEnable = newNames.days.length > 0;
                }
                if (newNames.tab == 'specificWeekDays') {
                    if (newNames.specificWeekDay) {
                        vm.editor.isEnable = true;
                    } else {
                        vm.editor.isEnable = false;
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

        var watcher2 = vm.$watchCollection('runTime.days', function (newNames) {
            if (newNames) {
                vm.editor.isEnable = newNames.length > 0;
                vm.runTime.all = newNames.length == 7;
            }
        });

        var watcher3 = vm.$watchCollection('runTime.months', function (newNames) {
            if (newNames) {

                vm.runTime.allMonth = newNames.length == 12;
            }
        });

        function getXml2Json(xml) {
            vm.runtimeList = [];

            if (!xml) {
                return;
            }
            var _xml = {};
            try {
                var dom_document = dom_parser.parseFromString(xml, "text/xml");

                var x = dom_document.getElementsByTagName("period");
                for (var i = 0; i < x.length ;i++) {
                    angular.forEach(x[i].attributes, function(value){
                        if(value.nodeName == 'when_holiday' && value.nodeValue == 'suppress'){
                           x[i].removeAttribute('when_holiday');
                        }
                    });
                }

                if (dom_document.documentElement.nodeName == "parsererror") {
                    throw new Error("Error at XML answer: " + dom_document.documentElement.firstChild.nodeValue);
                } else {
                    _xml = x2js.xml_str2json(xml);
                }

                var xmlAsString;
                  try {

                    if ( window.DOMParser ) {
                      xmlAsString = new XMLSerializer().serializeToString( dom_document );

                    } else {
                      xmlAsString = dom_document.documentElement.xml;
                      xmlAsString = xmlAsString.replace(/\t/g, "  ");
                    }
                    vm.xml = vkbeautify.xml(xmlAsString, 4);

                  } catch(x) {
                    throw new Error(x.message);
                  }


            } catch (e) {
                toasty.error({
                    title: 'Invalid xml',
                    msg: e
                });
            }

            if (isEmpty(_xml)) {
                return;
            }

            run_time = _xml.run_time || {};
            vm.runTime1.timeZone = run_time._time_zone;

            if (isEmpty(vm.runTime1.holidays) && run_time.holidays) {
                vm.runTime1.holidays = {};

                if (run_time.holidays.weekdays && run_time.holidays.weekdays.day) {
                    vm.runTime1.holidays.weekdays = angular.copy(run_time.holidays.weekdays);

                    vm.runTime1.holidays.weekdays.day._day = vm.runTime1.holidays.weekdays.day._day.split(' ');
                }
                if (run_time.holidays.holiday) {
                    if (angular.isArray(run_time.holidays.holiday)) {
                        angular.forEach(run_time.holidays.holiday, function (date) {
                            vm.holidayDates.push(new Date(date._date));
                        });
                    } else {
                        vm.holidayDates.push(new Date(run_time.holidays.holiday._date));
                    }
                }
                if (run_time.holidays.include) {
                    if (angular.isArray(run_time.holidays.include)) {
                        angular.forEach(run_time.holidays.include, function (file) {
                            vm.calendarFiles.push(file._live_file);
                        });
                    } else {
                        vm.calendarFiles.push(run_time.holidays.include._live_file);
                    }
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
                    if (temp.weekday)
                        run_time.monthdays.weekday.push(temp.weekday)
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

            if (run_time.month) {

                if (angular.isArray(run_time.month)) {
                    angular.forEach(run_time.month, function (res) {
                        console.log(res)
                        if (!isEmpty(res.weekdays)) {
                            if (angular.isArray(res.weekdays)) {
                                angular.forEach(res.weekdays, function (value1) {
                                    if (angular.isArray(value1)) {
                                        angular.forEach(value1, function (val) {
                                            var str = 'Month ';
                                            if (res._month) {
                                                str = str + getMonths(res._month);
                                            }
                                            if (val._day) {
                                                str = str + ' days at ' + getMonthDays(val._day) + ' - ';

                                                if (angular.isArray(val.period)) {
                                                    angular.forEach(val.period, function (res) {
                                                        var periodStr = '';
                                                        if (res._single_start) {
                                                            periodStr = periodStr + ' single start at ' + res._single_start;
                                                        }
                                                        else if (res._absolute_repeat) {
                                                            periodStr = periodStr + ' absolute repeat ' + res._absolute_repeat;
                                                        }
                                                        else if (res._repeat) {
                                                            periodStr = periodStr + ' repeat at ' + res._repeat;
                                                        }
                                                        if (res._begin) {
                                                            periodStr = periodStr + ', begin at ' + res._begin;
                                                        }
                                                        if (res._end) {
                                                            periodStr = periodStr + 'and end at ' + res._end;
                                                        }
                                                        vm.runtimeList.push({
                                                            runTime: (str + periodStr),
                                                            xml: value1,
                                                            type: 'month'
                                                        });
                                                    });
                                                } else {
                                                    if (val.period._single_start) {
                                                        str = str + ' single start at ' + val.period._single_start;
                                                    }
                                                    else if (val.period._absolute_repeat) {
                                                        str = str + ' absolute repeat ' + val.period._absolute_repeat;
                                                    }
                                                    else if (val.period._repeat) {
                                                        str = str + ' repeat at ' + val.period._repeat;
                                                    }
                                                    if (val.period._begin) {
                                                        str = str + ', begin at ' + val.period._begin;
                                                    }
                                                    if (val.period._end) {
                                                        str = str + 'and end at ' + val.period._end;
                                                    }
                                                    vm.runtimeList.push({runTime: str, xml: value1, type: 'month'});
                                                }

                                            }

                                        });
                                    } else {
                                        if (value1._day) {
                                            var str = 'Month ';
                                            if (res._month) {
                                                str = str + getMonths(res._month);
                                            }
                                            str = str + ' days at ' + getMonthDays(value1._day) + ' - ';
                                            if (angular.isArray(value1.period)) {
                                                angular.forEach(value1.period, function (res) {
                                                    var periodStr = '';
                                                    if (res._single_start) {
                                                        periodStr = periodStr + ' single start at ' + res._single_start;
                                                    }
                                                    else if (res._absolute_repeat) {
                                                        periodStr = periodStr + ' absolute repeat ' + res._absolute_repeat;
                                                    }
                                                    else if (res._repeat) {
                                                        periodStr = periodStr + ' repeat at ' + res._repeat;
                                                    }
                                                    if (res._begin) {
                                                        periodStr = periodStr + ', begin at ' + res._begin;
                                                    }
                                                    if (res._end) {
                                                        periodStr = periodStr + ' and end at ' + res._end;
                                                    }
                                                    vm.runtimeList.push({
                                                        runTime: (str + periodStr),
                                                        xml: value1,
                                                        type: 'month'
                                                    });
                                                });
                                            } else {
                                                if (value1.period._single_start) {
                                                    str = str + ' single start at ' + value1.period._single_start;
                                                }
                                                else if (value1.period._absolute_repeat) {
                                                    str = str + ' absolute repeat ' + value1.period._absolute_repeat;
                                                }
                                                else if (value1.period._repeat) {
                                                    str = str + ' repeat at ' + value1.period._repeat;
                                                }
                                                if (value1.period._begin) {
                                                    str = str + ', begin at ' + value1.period._begin;
                                                }
                                                if (value1.period._end) {
                                                    str = str + ' and end at ' + value1.period._end;
                                                }
                                                vm.runtimeList.push({runTime: str, xml: value1, type: 'month'});
                                            }


                                        }
                                    }

                                });
                            } else {

                                if (angular.isArray(res.weekdays.day)) {
                                    angular.forEach(res.weekdays.day, function (val) {
                                        var str = 'Month ';
                                        if (res._month)
                                            str = str + getMonths(res._month);
                                        if (val._day) {
                                            str = str + ' days at ' + getMonthDays(val._day) + ' - ';

                                            if (angular.isArray(val.period)) {
                                                angular.forEach(val.period, function (res) {
                                                    var periodStr = '';
                                                    if (res._single_start) {
                                                        periodStr = periodStr + ' single start at ' + res._single_start;
                                                    }
                                                    else if (res._absolute_repeat) {
                                                        periodStr = periodStr + ' absolute repeat ' + res._absolute_repeat;
                                                    }
                                                    else if (res._repeat) {
                                                        periodStr = periodStr + ' repeat at ' + res._repeat;
                                                    }
                                                    if (res._begin) {
                                                        periodStr = periodStr + ', begin at ' + res._begin;
                                                    }
                                                    if (res._end) {
                                                        periodStr = periodStr + ' and end at ' + res._end;
                                                    }
                                                    vm.runtimeList.push({
                                                        runTime: (str + periodStr),
                                                        xml: res,
                                                        type: 'month'
                                                    });
                                                });
                                            } else {
                                                if (val.period._single_start) {
                                                    str = str + ' single start at ' + val.period._single_start;
                                                }
                                                else if (val.period._absolute_repeat) {
                                                    str = str + ' absolute repeat ' + val.period._absolute_repeat;
                                                }
                                                else if (val.period._repeat) {
                                                    str = str + ' repeat at ' + val.period._repeat;
                                                }
                                                if (val.period._begin) {
                                                    str = str + ', begin at ' + val.period._begin;
                                                }
                                                if (val.period._end) {
                                                    str = str + ' and end at ' + val.period._end;
                                                }

                                                vm.runtimeList.push({runTime: str, xml: res, type: 'month'});
                                            }

                                        }
                                    });
                                } else {
                                    var str = 'Month ';
                                    if (res._month)
                                        str = str + getMonths(res._month);

                                    if (res.weekdays.day._day) {

                                        str = str + ' days at ' + getMonthDays(res.weekdays.day._day) + ' - ';

                                        if (angular.isArray(res.weekdays.day.period)) {
                                            angular.forEach(res.weekdays.day.period, function (res) {
                                                var periodStr = '';
                                                if (res._single_start) {
                                                    periodStr = periodStr + ' single start at ' + res._single_start;
                                                }
                                                else if (res._absolute_repeat) {
                                                    periodStr = periodStr + ' absolute repeat ' + res._absolute_repeat;
                                                }
                                                else if (res._repeat) {
                                                    periodStr = periodStr + ' repeat at ' + res._repeat;
                                                }
                                                if (res._begin) {
                                                    periodStr = periodStr + ', begin at ' + res._begin;
                                                }
                                                if (res._end) {
                                                    periodStr = periodStr + ' and end at ' + res._end;
                                                }
                                                vm.runtimeList.push({
                                                    runTime: (str + periodStr),
                                                    xml: res,
                                                    type: 'month'
                                                });
                                            });
                                        } else {
                                            if (res.weekdays.day.period._single_start) {
                                                str = str + ' single start at ' + res.weekdays.day.period._single_start;
                                            }
                                            else if (res.weekdays.day.period._absolute_repeat) {
                                                str = str + ' absolute repeat ' + res.weekdays.day.period._absolute_repeat;
                                            }
                                            else if (res.weekdays.day.period._repeat) {
                                                str = str + ' repeat at ' + res.weekdays.day.period._repeat;
                                            }
                                            if (res.weekdays.day.period._begin) {
                                                str = str + ', begin at ' + res.weekdays.day.period._begin;
                                            }
                                            if (res.weekdays.day.period._end) {
                                                str = str + ' and end at ' + res.weekdays.day.period._end;
                                            }

                                            vm.runtimeList.push({runTime: str, xml: res, type: 'month'});
                                        }


                                    }

                                }


                            }
                        }
                        else if (!isEmpty(res.ultimos)) {

                            if (angular.isArray(res.ultimos)) {
                                angular.forEach(res.ultimos, function (value1) {
                                    if (angular.isArray(value1)) {
                                        angular.forEach(value1, function (val) {
                                            var str = 'Month ';
                                            if (res._month) {
                                                str = str + getMonths(res._month);
                                            }
                                            if (val._day) {
                                                str = str + ' ultimos ' + getMonthDays(val._day) + ' - ';

                                                if (angular.isArray(val.period)) {
                                                    angular.forEach(val.period, function (res) {
                                                        var periodStr = '';
                                                        if (res._single_start) {
                                                            periodStr = periodStr + ' single start at ' + res._single_start;
                                                        }
                                                        else if (res._absolute_repeat) {
                                                            periodStr = periodStr + ' absolute repeat ' + res._absolute_repeat;
                                                        }
                                                        else if (res._repeat) {
                                                            periodStr = periodStr + ' repeat at ' + res._repeat;
                                                        }
                                                        if (res._begin) {
                                                            periodStr = periodStr + ', begin at ' + res._begin;
                                                        }
                                                        if (res._end) {
                                                            periodStr = periodStr + 'and end at ' + res._end;
                                                        }
                                                        vm.runtimeList.push({
                                                            runTime: (str + periodStr),
                                                            xml: value1,
                                                            type: 'month'
                                                        });
                                                    });
                                                } else {
                                                    if (val.period._single_start) {
                                                        str = str + ' single start at ' + val.period._single_start;
                                                    }
                                                    else if (val.period._absolute_repeat) {
                                                        str = str + ' absolute repeat ' + val.period._absolute_repeat;
                                                    }
                                                    else if (val.period._repeat) {
                                                        str = str + ' repeat at ' + val.period._repeat;
                                                    }
                                                    if (val.period._begin) {
                                                        str = str + ', begin at ' + val.period._begin;
                                                    }
                                                    if (val.period._end) {
                                                        str = str + 'and end at ' + val.period._end;
                                                    }
                                                    vm.runtimeList.push({runTime: str, xml: value1, type: 'month'});
                                                }

                                            }

                                        });
                                    } else {
                                        if (value1._day) {
                                            var str = 'Month ';
                                            if (res._month) {
                                                str = str + getMonths(res._month);
                                            }
                                            str = str + ' ultimost ' + getMonthDays(value1._day) + ' - ';
                                            if (angular.isArray(value1.period)) {
                                                angular.forEach(value1.period, function (res) {
                                                    var periodStr = '';
                                                    if (res._single_start) {
                                                        periodStr = periodStr + ' single start at ' + res._single_start;
                                                    }
                                                    else if (res._absolute_repeat) {
                                                        periodStr = periodStr + ' absolute repeat ' + res._absolute_repeat;
                                                    }
                                                    else if (res._repeat) {
                                                        periodStr = periodStr + ' repeat at ' + res._repeat;
                                                    }
                                                    if (res._begin) {
                                                        periodStr = periodStr + ', begin at ' + res._begin;
                                                    }
                                                    if (res._end) {
                                                        periodStr = periodStr + ' and end at ' + res._end;
                                                    }
                                                    vm.runtimeList.push({
                                                        runTime: (str + periodStr),
                                                        xml: value1,
                                                        type: 'month'
                                                    });
                                                });
                                            } else {
                                                if (value1.period._single_start) {
                                                    str = str + ' single start at ' + value1.period._single_start;
                                                }
                                                else if (value1.period._absolute_repeat) {
                                                    str = str + ' absolute repeat ' + value1.period._absolute_repeat;
                                                }
                                                else if (value1.period._repeat) {
                                                    str = str + ' repeat at ' + value1.period._repeat;
                                                }
                                                if (value1.period._begin) {
                                                    str = str + ', begin at ' + value1.period._begin;
                                                }
                                                if (value1.period._end) {
                                                    str = str + ' and end at ' + value1.period._end;
                                                }
                                                vm.runtimeList.push({runTime: str, xml: value1, type: 'month'});
                                            }


                                        }
                                    }

                                });
                            } else {

                                if (angular.isArray(res.ultimos.day)) {
                                    angular.forEach(res.ultimos.day, function (val) {
                                        var str = 'Month ';
                                        if (res._month)
                                            str = str + getMonths(res._month);
                                        if (val._day) {
                                            str = str + ' ultimost ' + getMonthDays(val._day) + ' - ';

                                            if (angular.isArray(val.period)) {
                                                angular.forEach(val.period, function (res) {
                                                    var periodStr = '';
                                                    if (res._single_start) {
                                                        periodStr = periodStr + ' single start at ' + res._single_start;
                                                    }
                                                    else if (res._absolute_repeat) {
                                                        periodStr = periodStr + ' absolute repeat ' + res._absolute_repeat;
                                                    }
                                                    else if (res._repeat) {
                                                        periodStr = periodStr + ' repeat at ' + res._repeat;
                                                    }
                                                    if (res._begin) {
                                                        periodStr = periodStr + ', begin at ' + res._begin;
                                                    }
                                                    if (res._end) {
                                                        periodStr = periodStr + ' and end at ' + res._end;
                                                    }
                                                    vm.runtimeList.push({
                                                        runTime: (str + periodStr),
                                                        xml: res,
                                                        type: 'month'
                                                    });
                                                });
                                            } else {
                                                if (val.period._single_start) {
                                                    str = str + ' single start at ' + val.period._single_start;
                                                }
                                                else if (val.period._absolute_repeat) {
                                                    str = str + ' absolute repeat ' + val.period._absolute_repeat;
                                                }
                                                else if (val.period._repeat) {
                                                    str = str + ' repeat at ' + val.period._repeat;
                                                }
                                                if (val.period._begin) {
                                                    str = str + ', begin at ' + val.period._begin;
                                                }
                                                if (val.period._end) {
                                                    str = str + ' and end at ' + val.period._end;
                                                }

                                                vm.runtimeList.push({runTime: str, xml: res, type: 'month'});
                                            }

                                        }
                                    });
                                } else {
                                    var str = 'Month ';
                                    if (res._month)
                                        str = str + getMonths(res._month);

                                    if (res.ultimos.day._day) {

                                        str = str + ' ultimost ' + getMonthDays(res.ultimos.day._day) + ' - ';

                                        if (angular.isArray(res.ultimos.day.period)) {
                                            angular.forEach(res.ultimos.day.period, function (res) {
                                                var periodStr = '';
                                                if (res._single_start) {
                                                    periodStr = periodStr + ' single start at ' + res._single_start;
                                                }
                                                else if (res._absolute_repeat) {
                                                    periodStr = periodStr + ' absolute repeat ' + res._absolute_repeat;
                                                }
                                                else if (res._repeat) {
                                                    periodStr = periodStr + ' repeat at ' + res._repeat;
                                                }
                                                if (res._begin) {
                                                    periodStr = periodStr + ', begin at ' + res._begin;
                                                }
                                                if (res._end) {
                                                    periodStr = periodStr + ' and end at ' + res._end;
                                                }
                                                vm.runtimeList.push({
                                                    runTime: (str + periodStr),
                                                    xml: res,
                                                    type: 'month'
                                                });
                                            });
                                        } else {
                                            if (res.ultimos.day.period._single_start) {
                                                str = str + ' single start at ' + res.ultimos.day.period._single_start;
                                            }
                                            else if (res.ultimos.day.period._absolute_repeat) {
                                                str = str + ' absolute repeat ' + res.ultimos.day.period._absolute_repeat;
                                            }
                                            else if (res.ultimos.day.period._repeat) {
                                                str = str + ' repeat at ' + res.ultimos.day.period._repeat;
                                            }
                                            if (res.ultimos.day.period._begin) {
                                                str = str + ', begin at ' + res.ultimos.day.period._begin;
                                            }
                                            if (res.ultimos.day.period._end) {
                                                str = str + ' and end at ' + res.ultimos.day.period._end;
                                            }

                                            vm.runtimeList.push({runTime: str, xml: res, type: 'month'});
                                        }
                                    }
                                }
                            }
                        }
                        else if (!isEmpty(res.monthdays)) {

                            if (angular.isArray(res.monthdays)) {
                                angular.forEach(res.monthdays, function (value1) {
                                    if (angular.isArray(value1)) {
                                        angular.forEach(value1, function (val) {
                                            var str = 'Month ';
                                            if (res._month) {
                                                str = str + getMonths(res._month);
                                            }
                                            if (val._day) {
                                                str = str + ' and day of month ' + getMonthDays(val._day) + ' - ';

                                                if (angular.isArray(val.period)) {
                                                    angular.forEach(val.period, function (res) {
                                                        var periodStr = '';
                                                        if (res._single_start) {
                                                            periodStr = periodStr + ' single start at ' + res._single_start;
                                                        }
                                                        else if (res._absolute_repeat) {
                                                            periodStr = periodStr + ' absolute repeat ' + res._absolute_repeat;
                                                        }
                                                        else if (res._repeat) {
                                                            periodStr = periodStr + ' repeat at ' + res._repeat;
                                                        }
                                                        if (res._begin) {
                                                            periodStr = periodStr + ', begin at ' + res._begin;
                                                        }
                                                        if (res._end) {
                                                            periodStr = periodStr + 'and end at ' + res._end;
                                                        }
                                                        vm.runtimeList.push({
                                                            runTime: (str + periodStr),
                                                            xml: value1,
                                                            type: 'month'
                                                        });
                                                    });
                                                } else {
                                                    if (val.period._single_start) {
                                                        str = str + ' single start at ' + val.period._single_start;
                                                    }
                                                    else if (val.period._absolute_repeat) {
                                                        str = str + ' absolute repeat ' + val.period._absolute_repeat;
                                                    }
                                                    else if (val.period._repeat) {
                                                        str = str + ' repeat at ' + val.period._repeat;
                                                    }
                                                    if (val.period._begin) {
                                                        str = str + ', begin at ' + val.period._begin;
                                                    }
                                                    if (val.period._end) {
                                                        str = str + 'and end at ' + val.period._end;
                                                    }
                                                    vm.runtimeList.push({runTime: str, xml: value1, type: 'month'});
                                                }

                                            }

                                        });
                                    } else {
                                        if (value1._day) {
                                            var str = 'Month ';
                                            if (res._month) {
                                                str = str + getMonths(res._month);
                                            }
                                            str = str + ' and day of month ' + getMonthDays(value1._day) + ' - ';
                                            if (angular.isArray(value1.period)) {
                                                angular.forEach(value1.period, function (res) {
                                                    var periodStr = '';
                                                    if (res._single_start) {
                                                        periodStr = periodStr + ' single start at ' + res._single_start;
                                                    }
                                                    else if (res._absolute_repeat) {
                                                        periodStr = periodStr + ' absolute repeat ' + res._absolute_repeat;
                                                    }
                                                    else if (res._repeat) {
                                                        periodStr = periodStr + ' repeat at ' + res._repeat;
                                                    }
                                                    if (res._begin) {
                                                        periodStr = periodStr + ', begin at ' + res._begin;
                                                    }
                                                    if (res._end) {
                                                        periodStr = periodStr + ' and end at ' + res._end;
                                                    }
                                                    vm.runtimeList.push({
                                                        runTime: (str + periodStr),
                                                        xml: value1,
                                                        type: 'month'
                                                    });
                                                });
                                            } else {
                                                if (value1.period._single_start) {
                                                    str = str + ' single start at ' + value1.period._single_start;
                                                }
                                                else if (value1.period._absolute_repeat) {
                                                    str = str + ' absolute repeat ' + value1.period._absolute_repeat;
                                                }
                                                else if (value1.period._repeat) {
                                                    str = str + ' repeat at ' + value1.period._repeat;
                                                }
                                                if (value1.period._begin) {
                                                    str = str + ', begin at ' + value1.period._begin;
                                                }
                                                if (value1.period._end) {
                                                    str = str + ' and end at ' + value1.period._end;
                                                }
                                                vm.runtimeList.push({runTime: str, xml: value1, type: 'month'});
                                            }


                                        }
                                    }

                                });
                            } else {

                                if (angular.isArray(res.monthdays.day)) {
                                    angular.forEach(res.monthdays.day, function (val) {
                                        var str = 'Month ';
                                        if (res._month)
                                            str = str + getMonths(res._month);
                                        if (val._day) {
                                            str = str + ' and day of month ' + getMonthDays(val._day) + ' - ';

                                            if (angular.isArray(val.period)) {
                                                angular.forEach(val.period, function (res) {
                                                    var periodStr = '';
                                                    if (res._single_start) {
                                                        periodStr = periodStr + ' single start at ' + res._single_start;
                                                    }
                                                    else if (res._absolute_repeat) {
                                                        periodStr = periodStr + ' absolute repeat ' + res._absolute_repeat;
                                                    }
                                                    else if (res._repeat) {
                                                        periodStr = periodStr + ' repeat at ' + res._repeat;
                                                    }
                                                    if (res._begin) {
                                                        periodStr = periodStr + ', begin at ' + res._begin;
                                                    }
                                                    if (res._end) {
                                                        periodStr = periodStr + ' and end at ' + res._end;
                                                    }
                                                    vm.runtimeList.push({
                                                        runTime: (str + periodStr),
                                                        xml: res,
                                                        type: 'month'
                                                    });
                                                });
                                            } else {
                                                if (val.period._single_start) {
                                                    str = str + ' single start at ' + val.period._single_start;
                                                }
                                                else if (val.period._absolute_repeat) {
                                                    str = str + ' absolute repeat ' + val.period._absolute_repeat;
                                                }
                                                else if (val.period._repeat) {
                                                    str = str + ' repeat at ' + val.period._repeat;
                                                }
                                                if (val.period._begin) {
                                                    str = str + ', begin at ' + val.period._begin;
                                                }
                                                if (val.period._end) {
                                                    str = str + ' and end at ' + val.period._end;
                                                }

                                                vm.runtimeList.push({runTime: str, xml: res, type: 'month'});
                                            }

                                        }
                                    });
                                } else {
                                    var str = 'Month ';
                                    if (res._month)
                                        str = str + getMonths(res._month);

                                    if (res.monthdays.day._day) {

                                        str = str + ' and day of month ' + getMonthDays(res.monthdays.day._day) + ' - ';

                                        if (angular.isArray(res.monthdays.day.period)) {
                                            angular.forEach(res.monthdays.day.period, function (res) {
                                                var periodStr = '';
                                                if (res._single_start) {
                                                    periodStr = periodStr + ' single start at ' + res._single_start;
                                                }
                                                else if (res._absolute_repeat) {
                                                    periodStr = periodStr + ' absolute repeat ' + res._absolute_repeat;
                                                }
                                                else if (res._repeat) {
                                                    periodStr = periodStr + ' repeat at ' + res._repeat;
                                                }
                                                if (res._begin) {
                                                    periodStr = periodStr + ', begin at ' + res._begin;
                                                }
                                                if (res._end) {
                                                    periodStr = periodStr + ' and end at ' + res._end;
                                                }
                                                vm.runtimeList.push({
                                                    runTime: (str + periodStr),
                                                    xml: res,
                                                    type: 'month'
                                                });
                                            });
                                        } else {
                                            if (res.monthdays.day.period._single_start) {
                                                str = str + ' single start at ' + res.monthdays.day.period._single_start;
                                            }
                                            else if (res.monthdays.day.period._absolute_repeat) {
                                                str = str + ' absolute repeat ' + res.monthdays.day.period._absolute_repeat;
                                            }
                                            else if (res.monthdays.day.period._repeat) {
                                                str = str + ' repeat at ' + res.monthdays.day.period._repeat;
                                            }
                                            if (res.monthdays.day.period._begin) {
                                                str = str + ', begin at ' + res.monthdays.day.period._begin;
                                            }
                                            if (res.monthdays.day.period._end) {
                                                str = str + ' and end at ' + res.monthdays.day.period._end;
                                            }

                                            vm.runtimeList.push({runTime: str, xml: res, type: 'month'});
                                        }
                                    }
                                }
                            }
                        }
                    });
                }
            }

            if (run_time.weekdays && run_time.weekdays.day) {

                angular.forEach(run_time.weekdays.day, function (res) {
                    var str = '';
                    if (res._day) {
                        str = str + 'Week days ';
                        str = str + getWeekDays(res._day) + ' - ';
                        if (angular.isArray(res.period)) {
                            angular.forEach(res.period, function (value1) {
                                var periodStr = '';
                                if (value1._single_start) {
                                    periodStr = periodStr + ' single start at ' + value1._single_start;
                                }
                                else if (value1._absolute_repeat) {
                                    periodStr = periodStr + ' absolute repeat ' + value1._absolute_repeat;
                                }
                                else if (value1._repeat) {
                                    periodStr = periodStr + ' repeat at ' + value1._repeat;
                                }
                                if (value1._begin) {
                                    periodStr = periodStr + ', begin at ' + value1._begin;
                                }
                                if (value1._end) {
                                    periodStr = periodStr + ' and end at ' + value1._end;
                                }
                                vm.runtimeList.push({runTime: (str + periodStr), xml: res, type: 'weekdays'});
                            });
                        } else {
                            if (res.period._single_start) {
                                str = str + ' single start at ' + res.period._single_start;
                            }
                            else if (res.period._absolute_repeat) {
                                str = str + ' absolute repeat ' + res.period._absolute_repeat;
                            }
                            else if (res.period._repeat) {
                                str = str + ' repeat at ' + res.period._repeat;
                            }
                            if (res.period._begin) {
                                str = str + ', begin at ' + res.period._begin;
                            }
                            if (res.period._end) {
                                str = str + ' and end at ' + res.period._end;
                            }
                            vm.runtimeList.push({runTime: str, xml: res, type: 'weekdays'});
                        }
                    }
                });
            }

            if (run_time.monthdays && run_time.monthdays.day && run_time.monthdays.day.length > 0) {

                angular.forEach(run_time.monthdays.day, function (res) {

                    var str = '';
                    if (res && res._day) {
                        str = str + 'Day of months ' + getMonthDays(res._day) + ' - ';
                        if (res.period) {
                            if (angular.isArray(res.period)) {
                                angular.forEach(res.period, function (res1) {
                                    var periodStr = '';
                                    if (res1._single_start) {
                                        periodStr = periodStr + ' single start at ' + res1._single_start;
                                    }
                                    else if (res1._absolute_repeat) {
                                        periodStr = periodStr + ' absolute repeat ' + res1._absolute_repeat;
                                    }
                                    else if (res1._repeat) {
                                        periodStr = periodStr + ' repeat at ' + res1._repeat;
                                    }
                                    if (res1._begin) {
                                        periodStr = periodStr + ', begin at ' + res1._begin;
                                    }
                                    if (res1._end) {
                                        periodStr = periodStr + ' and end at ' + res1._end;
                                    }
                                    vm.runtimeList.push({runTime: (str + periodStr), xml: res, type: 'monthdays'});
                                });
                            } else {

                                if (res.period._single_start) {
                                    str = str + ' single start at ' + res.period._single_start;
                                }
                                else if (res.period._absolute_repeat) {
                                    str = str + ' absolute repeat ' + res.period._absolute_repeat;
                                }
                                else if (res.period._repeat) {
                                    str = str + ' repeat at ' + res.period._repeat;
                                }
                                if (res.period._begin) {
                                    str = str + ', begin at ' + res.period._begin;
                                }
                                if (res.period._end) {
                                    str = str + ' and end at ' + res.period._end;
                                }

                                vm.runtimeList.push({runTime: str, xml: res, type: 'monthdays'});
                            }


                        }
                    }

                });
            }

            if (run_time.monthdays && run_time.monthdays.weekday && run_time.monthdays.weekday.length > 0) {

                angular.forEach(run_time.monthdays.weekday, function (value) {

                    if (angular.isArray(value)) {
                        angular.forEach(value, function (res) {

                            var str = '';
                            if (res) {
                                if (res._day) {

                                    str = str + getSpecificDay(res._which) + res._day + ' of month - ';

                                    if (res.period) {
                                        if (angular.isArray(res.period)) {
                                            angular.forEach(res.period, function (res1) {
                                                var periodStr = '';
                                                if (res1._single_start) {
                                                    periodStr = periodStr + ' single start at ' + res1._single_start;
                                                }
                                                else if (res1._absolute_repeat) {
                                                    periodStr = periodStr + ' absolute repeat ' + res1._absolute_repeat;
                                                }
                                                else if (res1._repeat) {
                                                    periodStr = periodStr + ' repeat at ' + res1._repeat;
                                                }
                                                if (res1._begin) {
                                                    periodStr = periodStr + ', begin at ' + res1._begin;
                                                }
                                                if (res1._end) {
                                                    periodStr = periodStr + ' and end at ' + res1._end;
                                                }
                                                vm.runtimeList.push({
                                                    runTime: (str + periodStr),
                                                    xml: res,
                                                    type: 'weekday'
                                                });
                                            });
                                        } else {

                                            if (res.period._single_start) {
                                                str = str + ' single start at ' + res.period._single_start;
                                            }
                                            else if (res.period._absolute_repeat) {
                                                str = str + ' absolute repeat ' + res.period._absolute_repeat;
                                            }
                                            else if (res.period._repeat) {
                                                str = str + ' repeat at ' + res.period._repeat;
                                            }
                                            if (res.period._begin) {
                                                str = str + ', begin at ' + res.period._begin;
                                            }
                                            if (res.period._end) {
                                                str = str + ' and end at ' + res.period._end;
                                            }

                                            vm.runtimeList.push({runTime: str, xml: res, type: 'weekday'});
                                        }


                                    }
                                }

                            }

                        });
                    } else {
                        var str = '';
                        if (value._day) {

                            str = str + getSpecificDay(value._which) + value._day + ' of month - ';

                            if (value.period) {
                                if (angular.isArray(value.period)) {
                                    angular.forEach(value.period, function (value1) {
                                        var periodStr = '';
                                        if (value1._single_start) {
                                            periodStr = periodStr + ' single start at ' + value1._single_start;
                                        }
                                        else if (value1._absolute_repeat) {
                                            periodStr = periodStr + ' absolute repeat ' + value1._absolute_repeat;
                                        }
                                        else if (value1._repeat) {
                                            periodStr = periodStr + ' repeat at ' + value1._repeat;
                                        }
                                        if (value1._begin) {
                                            periodStr = periodStr + ', begin at ' + value1._begin;
                                        }
                                        if (value1._end) {
                                            periodStr = periodStr + ' and end at ' + value1._end;
                                        }
                                        vm.runtimeList.push({runTime: (str + periodStr), xml: value, type: 'weekday'});
                                    });
                                } else {

                                    if (value.period._single_start) {
                                        str = str + ' single start at ' + value.period._single_start;
                                    }
                                    else if (value.period._absolute_repeat) {
                                        str = str + ' absolute repeat ' + value.period._absolute_repeat;
                                    }
                                    else if (value.period._repeat) {
                                        str = str + ' repeat at ' + value.period._repeat;
                                    }
                                    if (value.period._begin) {
                                        str = str + ', begin at ' + value.period._begin;
                                    }
                                    if (value.period._end) {
                                        str = str + ' and end at ' + value.period._end;
                                    }

                                    vm.runtimeList.push({runTime: str, xml: value, type: 'weekday'});
                                }


                            }
                        }
                    }
                });
            }

            if (run_time.ultimos) {

                angular.forEach(run_time.ultimos, function (value) {
                    angular.forEach(value, function (res) {
                        var str = '';

                        if (res._day) {
                            str = str + 'Ultimos ' + getMonthDays(res._day) + ' - ';

                            if (angular.isArray(res.period)) {
                                angular.forEach(res.period, function (res1) {
                                    var periodStr = '';
                                    if (res1._single_start) {
                                        periodStr = periodStr + ' single start at ' + res1._single_start;
                                    }
                                    else if (res1._absolute_repeat) {
                                        periodStr = periodStr + ' absolute repeat ' + res1._absolute_repeat;
                                    }
                                    else if (res1._repeat) {
                                        periodStr = periodStr + ' repeat at ' + res1._repeat;
                                    }
                                    if (res1._begin) {
                                        periodStr = periodStr + ', begin at ' + res1._begin;
                                    }
                                    if (res1._end) {
                                        periodStr = periodStr + ' and end at ' + res1._end;
                                    }
                                    vm.runtimeList.push({runTime: (str + periodStr), xml: value, type: 'ultimos'});
                                });
                            } else {
                                if (res.period._single_start) {
                                    str = str + ' single start at ' + res.period._single_start;
                                }
                                else if (res.period._absolute_repeat) {
                                    str = str + ' absolute repeat ' + res.period._absolute_repeat;
                                }
                                else if (res.period._repeat) {
                                    str = str + ' repeat at ' + res.period._repeat;
                                }
                                if (res.period._begin) {
                                    str = str + ', begin at ' + res.period._begin;
                                }
                                if (res.period._end) {
                                    str = str + ' and end at ' + res.period._end;
                                }
                                vm.runtimeList.push({runTime: str, xml: run_time.ultimos, type: 'ultimos'});
                            }


                        }
                    });
                });
            }

            if (run_time.holidays) {
                var str = '';
                angular.forEach(run_time.holidays, function (value) {
                    if (value) {
                        if (value.day) {
                            if (str) {
                                str = str + ' and';
                            }
                            str = str + ' week days ' + getWeekDays(value.day._day);
                        }
                        if (angular.isArray(value)) {
                            angular.forEach(value, function (value1) {
                                if (value1._date)
                                    str = str + value1._date + ', ';
                            });
                        } else {

                            if (value._date)
                                str = str + value._date + ', ';
                        }
                    }
                });
                if (str)
                    vm.runtimeList.push({runTime: 'Holiday on ' + str, xml: run_time.holidays, type: 'holidays'});
            }

            vm.order.runTime = xml;
        }


        vm.periodList = [];
        vm.addPeriod = function () {

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

            if (isEmpty(run_time.month)) {
                run_time.month = [];
            } else {
                if (!angular.isArray(run_time.month)) {
                    var temp = angular.copy(run_time.month);
                    run_time.month = [];
                    if (temp)
                        run_time.month.push(temp);

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
                    if (temp && temp.day)
                        run_time.monthdays.day.push(temp.day);
                    run_time.monthdays.weekday = [];
                    if (temp && temp.weekday)
                        run_time.monthdays.weekday.push(temp.weekday)
                }
            }
            if (!run_time.ultimos) {
                run_time.ultimos = {};
                run_time.ultimos.day = [];
            } else {
                if (!angular.isArray(run_time.ultimos.day)) {
                    var temp = angular.copy(run_time.ultimos.day);
                    run_time.ultimos.day = [];
                    if (temp)
                        run_time.ultimos.day.push(temp)
                }
            }

            if (vm.runTime.period) {
                if (vm.runTime.period._single_start) {
                    vm.runTime.period._single_start = moment(vm.runTime.period._single_start).format('HH:mm:ss');
                }
                if (vm.runTime.period._repeat) {
                    vm.runTime.period._repeat = moment(vm.runTime.period._repeat).format('HH:mm:ss');
                }
                if (vm.runTime.period._begin) {
                    vm.runTime.period._begin = moment(vm.runTime.period._begin).format('HH:mm:ss');
                }
                if (vm.runTime.period._end) {
                    vm.runTime.period._end = moment(vm.runTime.period._end).format('HH:mm:ss');
                }
                if (vm.runTime.period._absolute_repeat) {
                    vm.runTime.period._absolute_repeat = moment(vm.runTime.period._absolute_repeat).format('HH:mm:ss');
                }
            }

            if (angular.isArray(vm.runTime.days)) {
                vm.runTime.days.sort();
            }
            if (angular.isArray(vm.runTime.months)) {
                vm.runTime.months.sort();
            }

            if (vm.runTime.every == 'weekDays') {
                if (vm.runTime.tab == 'weekDays') {
                    if (vm.runTime.months && vm.runTime.months.length > 0) {

                        if (run_time.month.length > 0) {

                            var flag = false;
                            angular.forEach(run_time.month, function (value) {
                                if(value.weekdays) {
                                    if (angular.equals(value._month, vm.runTime.months) || angular.equals(value._month.toString().split(' '), vm.runTime.months)) {
                                        flag = true;
                                        var _period = [];
                                         if(angular.isArray(value.weekdays.day)) {
                                             angular.forEach(value.weekdays.day, function (value1) {

                                                 if (angular.equals(value1._day, vm.runTime.days) || angular.equals(value1._day.toString().split(' '), vm.runTime.days)) {

                                                     _period.push(value1.period);
                                                     _period.push(vm.runTime.period);
                                                     value1.period = _period;
                                                 }
                                             });
                                         }else {
                                             if (angular.equals(value.weekdays.day._day, vm.runTime.days) || angular.equals(value.weekdays.day._day.toString().split(' '), vm.runTime.days)) {

                                                 _period.push(value.weekdays.day.period);
                                                 _period.push(vm.runTime.period);
                                                 value.weekdays.day.period = _period;
                                             }
                                         }

                                        if (_period.length == 0) {
                                            value.weekdays.day.push({
                                                '_day': vm.runTime.days,
                                                'period': vm.runTime.period
                                            });
                                        }

                                    }
                                }
                            });
                            if (!flag) {
                                var x = {_month: vm.runTime.months, weekdays: {day: []}};
                                x.weekdays.day.push({'_day': vm.runTime.days, 'period': vm.runTime.period});
                                run_time.month.push(x);

                            }
                        } else {
                            var x = {_month: vm.runTime.months, weekdays: {day: []}};
                            x.weekdays.day.push({'_day': vm.runTime.days, 'period': vm.runTime.period});
                            run_time.month.push(x);
                        }
                    } else {

                        if (run_time.weekdays.day.length > 0) {
                            var _period = [];
                            angular.forEach(run_time.weekdays.day, function (value) {
                                if (angular.equals(value._day, vm.runTime.days) || angular.equals(value._day.toString().split(' '), vm.runTime.days)) {
                                    _period.push(value.period);
                                    _period.push(vm.runTime.period);
                                    value.period = _period;
                                }
                            });

                            if (_period.length == 0) {
                                run_time.weekdays.day.push({'_day': vm.runTime.days, 'period': vm.runTime.period});
                            }

                        } else {
                            run_time.weekdays.day.push({'_day': vm.runTime.days, 'period': vm.runTime.period});
                        }
                    }
                } else {
                    if (run_time.monthdays.weekday.length > 0) {
                        var flag = true;
                        angular.forEach(run_time.monthdays.weekday, function (value) {
                            if (value._day == vm.runTime.specificWeekDay && value._which == vm.runTime.which) {
                                flag = false;
                                if (angular.isArray(value.period) && vm.runTime.period) {
                                    value.period.push(vm.runTime.period);
                                } else {
                                    value.period = [];
                                    value.period.push(vm.runTime.period);
                                }
                            }
                        });

                        if (flag) {
                            var _period = [];
                            if (vm.runTime.period) {
                                _period.push(vm.runTime.period);
                            }
                            run_time.monthdays.weekday.push({
                                '_day': vm.runTime.specificWeekDay,
                                '_which': vm.runTime.which,
                                'period': _period
                            });
                        }

                    } else {

                        var _period = [];
                        if (vm.runTime.period) {
                            _period.push(vm.runTime.period);
                        }
                        run_time.monthdays.weekday.push({
                            '_day': vm.runTime.specificWeekDay,
                            '_which': vm.runTime.which,
                            'period': _period
                        });
                    }
                }
            } else if (vm.runTime.every == 'monthDays') {
                console.log(run_time.month);
                if (selectedMonths.length > 0) {
                    selectedMonths.sort();
                    if (!vm.runTime.isUltimos) {
                        if (vm.runTime.months && vm.runTime.months.length > 0) {

                            if (run_time.month.length > 0) {

                                var flag = false;
                                angular.forEach(run_time.month, function (value) {
                                    if(value.monthdays) {
                                        console.log('if.....');
                                        if (angular.equals(value._month, vm.runTime.months) || angular.equals(value._month.toString().split(' '), vm.runTime.months)) {

                                            flag = true;
                                            var _period = [];

                                            if(angular.isArray(value.monthdays.day)) {
                                                angular.forEach(value.monthdays.day, function (value1) {
                                                    if (angular.equals(value1._day, selectedMonths) || angular.equals(value1._day.toString().split(' '), selectedMonths)) {

                                                        _period.push(value1.period);
                                                        _period.push(vm.runTime.period);
                                                        value1.period = _period;
                                                    }
                                                });
                                            }else{
                                                console.log(value.monthdays.day);
                                                  if (angular.equals(value.monthdays.day._day, selectedMonths) || angular.equals(value.monthdays.day._day.toString().split(' '), selectedMonths)) {
                                                        _period.push(value.monthdays.day.period);
                                                        _period.push(vm.runTime.period);
                                                        value.monthdays.day.period = _period;
                                                    }

                                            }

                                            if (_period.length == 0) {
                                                value.monthdays.day.push({
                                                    '_day': selectedMonths,
                                                    'period': vm.runTime.period
                                                });
                                            }
                                        }
                                        console.log(flag)
                                    }else{
                                        console.log('else.....');
                                        console.log(angular.equals(value._month, vm.runTime.months));
                                    }
                                });
                                if (!flag) {
                                    var x = {_month: vm.runTime.months, monthdays: {day: []}};
                                    x.monthdays.day.push({'_day': selectedMonths, 'period': vm.runTime.period});
                                    run_time.month.push(x);

                                }
                            } else {
                                var x = {_month: vm.runTime.months, monthdays: {day: []}};
                                x.monthdays.day.push({'_day': selectedMonths, 'period': vm.runTime.period});
                                run_time.month.push(x);

                            }
                        } else {
                            console.log(run_time.monthdays);
                            if (run_time.monthdays.day.length > 0) {
                                var _period = [];
                                angular.forEach(run_time.monthdays.day, function (value) {
                                    if (angular.equals(value._day, selectedMonths) || angular.equals(value._day.toString().split(' '), selectedMonths)) {

                                        _period.push(value.period);
                                        _period.push(vm.runTime.period);
                                        value.period = _period;
                                    }
                                });

                                if (_period.length == 0) {
                                    run_time.monthdays.day.push({'_day': selectedMonths, 'period': vm.runTime.period});
                                }

                            } else {
                                run_time.monthdays.day.push({'_day': selectedMonths, 'period': vm.runTime.period});
                            }
                        }
                    } else {
                        if (vm.runTime.months && vm.runTime.months.length > 0) {

                            if (run_time.month.length > 0) {

                                var flag = false;
                                angular.forEach(run_time.month, function (value, index) {
                                    if(value.ultimos) {
                                        if (angular.equals(value._month, vm.runTime.months) || angular.equals(value._month.toString().split(' '), vm.runTime.months)) {

                                            flag = true;
                                            var _period = [];
                                            console.log(value)
                                            if(angular.isArray(value.ultimos.day)) {
                                                angular.forEach(value.ultimos.day, function (value1) {
                                                    if (angular.equals(value1._day, selectedMonths) || angular.equals(value1._day.toString().split(' '), selectedMonths)) {

                                                        _period.push(value1.period);
                                                        _period.push(vm.runTime.period);
                                                        value1.period = _period;
                                                    }
                                                });
                                            }else {
                                                if (angular.equals(value.ultimos.day._day, selectedMonths) || angular.equals(value.ultimos.day._day.toString().split(' '), selectedMonths)) {

                                                    _period.push(value.ultimos.day.period);
                                                    _period.push(vm.runTime.period);
                                                    value.ultimos.day.period = _period;
                                                }
                                            }

                                            if (_period.length == 0) {
                                                value.ultimos.day.push({
                                                    '_day': selectedMonths,
                                                    'period': vm.runTime.period
                                                });
                                            }
                                        }
                                    }
                                });
                                if (!flag) {
                                    var x = {_month: vm.runTime.months, ultimos: {day: []}};
                                    x.ultimos.day.push({'_day': selectedMonths, 'period': vm.runTime.period});
                                    run_time.month.push(x);
                                }
                            } else {
                                var x = {_month: vm.runTime.months, ultimos: {day: []}};
                                x.ultimos.day.push({'_day': selectedMonths, 'period': vm.runTime.period});
                                run_time.month.push(x);

                            }
                        } else {
                            if (run_time.ultimos.day.length > 0) {
                                var _period = [];
                                angular.forEach(run_time.ultimos.day, function (value) {
                                    if (angular.equals(value._day, selectedMonths) || angular.equals(value._day.toString().split(' '), selectedMonths)) {
                                        _period.push(value.period);
                                        _period.push(vm.runTime.period);
                                        value.period = _period;
                                    }
                                });

                                if (_period.length == 0) {
                                    run_time.ultimos.day.push({'_day': selectedMonths, 'period': vm.runTime.period});
                                }

                            } else {
                                run_time.ultimos.day.push({'_day': selectedMonths, 'period': vm.runTime.period});
                            }
                        }
                    }
                }
            }

            vm.periodList.push(vm.runTime);

            vm.tempRunTime = angular.copy(run_time);

            var temp = angular.copy(vm.runTime);
            vm.runTime = {};
            vm.runTime.period = {};
            vm.runTime.every = temp.every;
            vm.runTime.tab = temp.tab;
            vm.runTime.days = temp.days;
            vm.runTime.months = temp.months;
            vm.runTime.frequency = 'single_start';
            vm.runTime.period._when_holiday = 'suppress';
            vm.runTime.specificWeekDay = temp.specificWeekDay;
            vm.runTime.which = temp.which;
        };

        vm.removePeriod = function (period, index) {
            //vm.periodList.splice(index, 1);
            console.log(vm.tempRunTime);

            angular.forEach(vm.tempRunTime, function (value) {
                console.log(value);

            });
            console.log(period);
        };

        vm.holidayDates = [];
        vm.calendarFiles = [];
        vm.addHolidayDate = function (period) {
            if (vm.holidayDates.indexOf(period) === -1 && period)
                vm.holidayDates.push(period);
        };

        vm.removeHolidayDate = function (index) {
            vm.holidayDates.splice(index, 1);
        };

        vm.addCalendarFile = function (file) {
            if (vm.calendarFiles.indexOf(file) === -1 && file)
                vm.calendarFiles.push(file);
        };

        vm.removeCalendarFile = function (index) {
            vm.calendarFiles.splice(index, 1);
        };

        vm.editRunTime = function (data) {
            vm.periodList = [];
            vm.editor.hidePervious = true;
            vm.editor.create = false;
            vm.editor.update = true;
            vm.editor.hideEvery = true;
            vm.str = data.runTime;
            vm.runTime = {};
            vm.runTime.frequency = 'single_start';
            if (!isEmpty(data.xml) && !angular.isArray(data.xml)) {
                if (data.type == 'month') {
                    vm.runTime.tab = 'weekDays';
                    vm.runTime.every = 'weekdays';
                    vm.runTime.months = data.xml._day;
                    vm.runTime.runTime.specificWeekDay = data.xml._day;
                    vm.runTime.which = data.xml._which;
                    console.log(data.xml);
                }
                else if (data.type == 'ultimos') {
                    vm.runTime.isUltimos = true;
                    vm.runTime.every = 'monthdays';

                    angular.forEach(data.xml._day.split(' '), function (val) {
                        vm.selectMonthDays(val);
                    });
                }
                else if (data.type == 'holidays') {
                    vm.editor.nextPage = true;
                    vm.runTime.every = 'weekDays';
                }
                else if (data.type == 'weekdays') {
                    vm.runTime.every = 'weekDays';
                    vm.runTime.days = data.xml._day;
                }
                else if (data.type == 'monthdays') {
                    vm.runTime.every = 'monthDays';

                    angular.forEach(data.xml._day.split(' '), function (val) {
                        vm.selectMonthDays(val);
                    });

                } else if (data.type == 'weekday') {
                    vm.runTime.every = 'weekDays';
                    vm.runTime.tab = 'specificWeekDays';
                    vm.runTime.specificWeekDay = data.xml._day;
                    vm.runTime.which = data.xml._which;
                }

                vm.runTime.period = data.xml.period;
                if (!data.xml._when_holiday) {
                    if (!vm.runTime.period) {
                        vm.runTime.period = {};
                    }
                    vm.runTime.period._when_holiday = 'suppress';
                }

            } else {
                console.log(data.xml);
            }

            console.log(vm.runTime);
            console.log(run_time);


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

            if (!run_time.monthdays) {
                run_time.monthdays = {};
                run_time.monthdays.day = [];
                run_time.monthdays.weekday = [];
            } else {
                if (!angular.isArray(run_time.monthdays.day)) {
                    var temp = angular.copy(run_time.monthdays);
                    run_time.monthdays.day = [];
                    if (temp && temp.day)
                        run_time.monthdays.day.push(temp.day);
                    run_time.monthdays.weekday = [];
                    if (temp && temp.weekday)
                        run_time.monthdays.weekday.push(temp.weekday);
                }
            }
            if (!run_time.ultimos) {
                run_time.ultimos = {};
                run_time.ultimos.day = [];
            } else {
                if (!angular.isArray(run_time.ultimos.day)) {
                    var temp = angular.copy(run_time.ultimos.day);
                    run_time.ultimos.day = [];
                    if (temp)
                        run_time.ultimos.day.push(temp)
                }
            }
            console.log(vm.periodList);
            console.log(vm.runTime);

            vm.periodList.push(vm.runTime);

            vm.tempRunTime = angular.copy(run_time);

            var temp = angular.copy(vm.runTime);
            vm.runTime = {};
            vm.runTime.period = {};
            vm.runTime.every = temp.every;
            vm.runTime.tab = temp.tab;
            vm.runTime.days = temp.days;
            vm.runTime.months = temp.months;
            vm.runTime.frequency = 'single_start';
            vm.runTime.period._when_holiday = 'suppress';
            vm.runTime.specificWeekDay = temp.specificWeekDay;
            vm.runTime.which = temp.which;

        };

        vm.createNewRunTime = function () {
            vm.editor.hidePervious = true;
            vm.editor.create = true;
            vm.editor.update = false;
            vm.periodList = [];
            selectedMonths = [];
            vm.runTime = {};
            vm.runTime.period = {};
            vm.runTime.every = 'weekDays';
            vm.runTime.frequency = 'single_start';
            vm.runTime.period._when_holiday = 'suppress';
            vm.runTime.tab = 'weekDays';
        };

        vm.createRunTime = function () {
            console.log(vm.tempRunTime);

            if (isEmpty(vm.tempRunTime)) {
                if (isEmpty(run_time)) {

                    try {
                        var _xml = x2js.xml_str2json(vm.xml);
                    } catch (e) {
                        console.log(e);
                    }
                    run_time = _xml.run_time;
                }
                vm.tempRunTime = run_time;
                console.log('inside...');
                console.log(run_time);
            }

            vm.run_time = vm.tempRunTime;

            console.log(vm.run_time);
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

            if (!isEmpty(vm.run_time.weekdays)) {
                if (!(vm.run_time.weekdays.day && (vm.run_time.weekdays.day.length > 0 || vm.run_time.weekdays.day._day))) {
                    delete vm.run_time['weekdays'];
                }
            } else {
                delete vm.run_time['weekdays'];
            }

            if (!isEmpty(vm.run_time.monthdays)) {
                if (!(vm.run_time.monthdays.weekday && vm.run_time.monthdays.weekday.length > 0)) {
                    delete vm.run_time.monthdays['weekday'];
                }
                if (!(vm.run_time.monthdays.day && (vm.run_time.monthdays.day.length > 0 || vm.run_time.monthdays.day._day))) {
                    if (!(vm.run_time.monthdays.weekday && vm.run_time.monthdays.weekday.length > 0)) {
                        delete vm.run_time['monthdays'];
                    }
                }
            } else {
                delete vm.run_time['monthdays'];
            }

            if (!isEmpty(vm.run_time.ultimos)) {
                if (!(vm.run_time.ultimos.day && (vm.run_time.ultimos.day.length > 0 || vm.run_time.ultimos.day._day))) {
                    delete vm.run_time['ultimos'];
                }
            } else {
                delete vm.run_time['ultimos'];
            }

            if (!isEmpty(vm.run_time.month)) {
                if (!(vm.run_time.month.length > 0 || vm.run_time.month._month)) {
                    delete vm.run_time['month'];
                }
            } else {
                delete vm.run_time['month'];
            }

            console.log(vm.run_time.holidays);
            if (!isEmpty(vm.run_time.holidays)) {
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
            if (isEmpty(vm.run_time.holidays)) {
                delete vm.run_time['holidays'];
            }
            console.log(vm.run_time.holidays);

            if (vm.runTime1.timeZone) {
                vm.run_time._time_zone = vm.runTime1.timeZone;
            }

            vm.run_time = {run_time: vm.run_time};

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
            selectedMonths = [];
            getXml2Json(xmlStr);
        };


        vm.$on('loadXml', function () {
            if (!vm.xml) {
                vm.xml = '<run_time/>';
            }
            getXml2Json(vm.xml);
        });

        vm.$on('$destroy', function () {
            watcher1();
            watcher2();
            watcher3();
        });

    }
})();
