/**
 * Created by sourabhagrawal on 30/5/16.
 */

(function () {
    'use strict';
    angular.module('app')
        .directive('pieChartComponent', pieChartComponent);

    pieChartComponent.$inject = ['$rootScope'];
    function pieChartComponent($rootScope) {
        return {
            restrict: 'E',
            templateUrl: 'modules/order/views/pie-chart.html',
            scope: {
                status: '='
            },
            controller: ['OrderService', '$scope', 'CoreService', 'SOSAuth', 'gettextCatalog', '$location', function (OrderService, $scope, CoreService, SOSAuth, gettextCatalog, $location) {
                const vm = $scope;
                let ordersData = [];

                function preparePieData(res) {
                    ordersData = [];
                    let count = 0;
                    for (let prop in res) {
                        if (res[prop] > 0) {
                            let obj = {};
                            obj.key = prop;
                            obj.y = res[prop];
                            ordersData.push(obj);
                        }
                        count++;
                        if (count === Object.keys(res).length) {
                            vm.ordersData = ordersData;
                        }
                    }
                }

                function loadJobChain() {
                    if (SOSAuth.jobChain) {
                        vm.isLoading = false;
                        vm.jobChainData = JSON.parse(SOSAuth.jobChain);
                        vm.snapshot = vm.jobChainData.ordersSummary;
                        preparePieData(vm.snapshot);
                    }
                }

                loadJobChain();

                $scope.$on("reloadJobChain", function () {
                    loadJobChain();
                });

                function getSnapshot() {
                    if (SOSAuth.scheduleIds) {
                        var filter = {};
                        vm.schedulerIds = JSON.parse(SOSAuth.scheduleIds);
                        filter.jobschedulerId = vm.schedulerIds.selected;
                        if ($location.search().path) {
                            filter.jobChains = [{jobChain: $location.search().path}];
                        }
                        OrderService.getSnapshot(filter).then(function (res) {
                            vm.snapshot = res.orders;
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

                vm.$on('reloadSnapshot', function () {
                    getSnapshot();
                });

                vm.setFilter = function (label) {
                    vm.status = label;
                    $rootScope.$broadcast('orderState', label);
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
                            } else if (d.key == 'suspended') {
                                return '#e86680';
                            } else if (d.key == 'setback') {
                                return '#99b2df';
                            } else if (d.key == 'waitingForResource') {
                                return '#ffa366';
                            } else if (d.key == 'blacklist') {
                                return '#b966b9';
                            } else if (d.key == 'pending') {
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
                                    vm.status = res;

                                    $rootScope.$broadcast('orderState', res);
                                }
                            }
                        }
                    }

                }
            }]
        };
    }

})();
