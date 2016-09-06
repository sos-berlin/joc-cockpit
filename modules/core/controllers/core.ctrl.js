/**
 * Created by sourabhagrawal on 30/5/16.
 */

(function () {
    'use strict';
    angular
        .module('app')
        .controller('AppCtrl', AppCtrl)
        .controller('HeaderCtrl', HeaderCtrl)
        .controller('DialogCtrl', DialogCtrl)
        .controller('ConfigurationCtrl', ConfigurationCtrl);

    AppCtrl.$inject = ['$scope', '$window'];
    function AppCtrl($scope, $window) {
        var vm = $scope;
        vm.isIE = isIE();
        vm.isSmart = isSmart();
        // config
        vm.app = {
            name: 'JobScheduler'
        };

        vm.goBack = function () {
            $window.history.back();
        };

        function isIE() {
            return !!navigator.userAgent.match(/MSIE/i) || !!navigator.userAgent.match(/Trident.*rv:11\./);
        }

        function isSmart() {
            var ua = $window['navigator']['userAgent'] || $window['navigator']['vendor'] || $window['opera'];
            // Checks for iOs, Android, Blackberry, Opera Mini, and Windows mobile devices
            return (/iPhone|iPod|iPad|Silk|Android|BlackBerry|Opera Mini|IEMobile/).test(ua);
        }

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
            var subHeaderHt = $('div.sub-header').height() || 58;
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


        var jobSchedulers = [];
        vm.getClusterMembersP = function (id) {
            JobSchedulerService.getClusterMembersP({jobschedulerId:id}).then(function (res) {
                angular.forEach(res.masters, function (master) {
                    var flag = true;
                    angular.forEach(jobSchedulers, function (value) {
                        if (value.jobschedulerId == master.jobschedulerId) {
                            flag = false;
                        }
                    });
                    if (flag)
                        jobSchedulers.push(master);
                });
                vm.jobSchedulers = jobSchedulers;
                vm.selectedJobScheduler = jobSchedulers[0];
            }, function (err) {

            })
        };

        vm.getClusterMembersP(vm.schedulerIds.selected);

        vm.changeScheduler = function (jobScheduler) {
            JobSchedulerService.switchSchedulerId(jobScheduler).then(function () {
                $state.reload();
            }, function (err) {

            })
        };

        vm.$on('$stateChangeSuccess', function () {
            vm.filterString = '';
        });
    }

    DialogCtrl.$inject = ["$scope", "$uibModalInstance"];
    function DialogCtrl($scope, $uibModalInstance) {
        var vm = $scope;

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
})();
