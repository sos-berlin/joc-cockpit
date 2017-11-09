/**
 * Created by sourabhagrawal on 07/11/17.
 */

(function () {
    'use strict';
    angular.module('app')
        .directive('jobPieChartComponent', jobPieChartComponent);

    jobPieChartComponent.$inject = ['$rootScope'];
    function jobPieChartComponent($rootScope) {
        return {
            restrict: 'E',
            templateUrl: 'modules/job/views/pie-chart.html',
            scope: {
                status: '='
            },
            controller: ['JobService', '$scope', 'CoreService', 'SOSAuth', 'gettextCatalog','$location', function (JobService, $scope, CoreService, SOSAuth, gettextCatalog,$location) {
                var vm = $scope;
                var tasksData = [];

                function preparePieData(res) {
                     tasksData = [];

                    var count = 0;
                    for (var prop in res) {
                        if (res[prop] > 0) {
                            var obj = {};
                            obj.key = prop;
                            obj.y = res[prop];
                            tasksData.push(obj);
                        }
                        count++;
                        if (count === Object.keys(res).length) {
                            vm.tasksData = tasksData;
                        }
                    }
                }

                function getSnapshot() {
                    if (SOSAuth.scheduleIds) {
                        var filter = {};
                        vm.schedulerIds = JSON.parse(SOSAuth.scheduleIds);
                        filter.jobschedulerId = vm.schedulerIds.selected;
                        JobService.getSnapshot(filter).then(function (res) {
                            vm.snapshot = res.jobs;
                            preparePieData(vm.snapshot);
                        });
                    }
                }
                getSnapshot();

                vm.width = 260;
                vm.height = 260;
                vm.xFunction = function () {
                    return function (d) {
                        return d.key;
                    };
                };
                vm.yFunction = function () {
                    return function (d) {
                        return d.y;
                    };
                };
                vm.descriptionFunction = function () {
                    return function (d) {
                        return d.key;
                    }
                };
                vm.toolTipContentFunction = function () {
                    return function (d) {
                        return '<h3>' + d.data.key + '</h3>' +
                            '<p>' + d3.format(',f')(d.data.y) + '</p>'
                    }
                };

                vm.$on('reloadJobSnapshot', function () {
                    getSnapshot();
                });

                vm.setFilter = function (label) {
                    vm.status = label;
                    $rootScope.$broadcast('jobState', label);
                };

                vm.hidePanel = function () {
                    CoreService.setSideView(true);
                    $('#rightPanel').addClass('m-l-0 fade-in');
                    $('#leftPanel').hide();
                    $('.sidebar-btn').show();
                };

                if (!CoreService.getSideView()) {
                    vm.hidePanel();
                }

                vm.pieOptions = {
                    "chart": {
                        id: "agentClusterId",
                        type: 'pieChart',
                        x: vm.xFunction(),
                        y: vm.yFunction(),
                        width: vm.width,
                        height: vm.height,
                        labelsOutside: false,
                        showLabels: true,
                        groupSpacing: 0.5,
                        labelType: 'percent',
                        showLegend: false,
                        noData: gettextCatalog.getString('message.noDataAvailable'),
                        color: function (d, i) {
                            if (d.key == 'running') {
                                return '#7ab97a';
                            } else if (d.key == 'stopped') {
                                return '#e86680';
                            } else if (d.key == 'tasks') {
                                return '#99b2df';
                            } else if (d.key == 'waitingForResource') {
                                return '#ffa366';
                            }
                            else if (d.key == 'pending') {
                                return 'rgba(255, 195, 0, 0.9)';
                            }
                        },
                        tooltip: {
                            enabled: true,
                            contentGenerator: vm.toolTipContentFunction()
                        },
                        pie: {
                            dispatch: {
                                elementClick: function (e) {
                                    var res = e.data.key.toUpperCase();
                                    if(res!='TASKS') {
                                        vm.status = res;
                                        $rootScope.$broadcast('jobState', res);
                                    }
                                }
                            }
                        }
                    }

                }
            }]
        };
    }


})();
