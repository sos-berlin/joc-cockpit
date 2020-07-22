/**
 * Created by sourabhagrawal on 07/11/17.
 */
(function () {
    'use strict';
    angular.module('app')
        .directive('yadeChartComponent', yadeChartComponent);

    yadeChartComponent.$inject = ['$rootScope'];
    function yadeChartComponent($rootScope) {
        return {
            restrict: 'E',
            templateUrl: 'modules/yade/views/pie-chart.html',
            scope: {
                status: '='
            },
            controller: ['YadeService', '$scope', 'CoreService', 'SOSAuth', 'gettextCatalog', function (YadeService, $scope, CoreService, SOSAuth, gettextCatalog) {
                var vm = $scope;
                var transferData = [];
                function preparePieData(res) {
                    transferData = [];
                    var count = 0;
                    for (var prop in res) {
                        if (res[prop] > 0) {
                            let obj = {};
                            obj.key = prop;
                            obj.y = res[prop];
                            transferData.push(obj);
                        }
                        count++;
                        if (count === Object.keys(res).length) {
                            vm.transferData = transferData;
                        }
                    }
                }

                function getSnapshot() {
                    if (SOSAuth.scheduleIds) {
                        let filter = {};
                        vm.schedulerIds = JSON.parse(SOSAuth.scheduleIds);
                        filter.jobschedulerId = vm.schedulerIds.selected;
                        YadeService.getOverview(filter).then(function (res) {
                            vm.overview = res.transfers;
                            preparePieData(vm.overview);
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

                vm.$on('reloadYadeSnapshot', function () {
                    getSnapshot();
                });

                vm.setFilter = function (label) {
                    vm.status = label;
                    $rootScope.$broadcast('yadeState', label);
                };

                vm.hidePanel = function () {
                    vm.sideView.yadeOverview.show = false;
                    $('#rightPanel').addClass('m-l-0 fade-in');
                    $('#leftPanel').hide();
                    $('.sidebar-btn').show();
                    CoreService.setSideView(vm.sideView);
                };

                if (!vm.sideView.orderOverview.show) {
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
                            if (d.key === 'running') {
                                return '#7ab97a';
                            } else if (d.key === 'suspended') {
                                return '#e86680';
                            } else if (d.key === 'setback') {
                                return '#99b2df';
                            } else if (d.key === 'waitingForResource') {
                                return '#ffa366';
                            }
                        },
                        tooltip: {
                            enabled: true,
                            contentGenerator: vm.toolTipContentFunction()
                        },
                        pie: {
                            dispatch: {
                                elementClick: function (e) {
                                    let res = e.data.key.toUpperCase();
                                    vm.status = res;
                                    $rootScope.$broadcast('yadeState', res);
                                }
                            }
                        }
                    }

                }
            }]
        };
    }
})();
