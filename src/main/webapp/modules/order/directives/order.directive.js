/**
 * Created by sourabhagrawal on 30/5/16.
 */

(function () {
    'use strict';
    angular.module('app')
        .directive('pieChartComponent', pieChartComponent)
        .directive('flowDiagram', flowDiagram);

    pieChartComponent.$inject = ['$rootScope'];
    function pieChartComponent($rootScope) {
        return {
            restrict: 'E',
            templateUrl: 'modules/order/views/pie-chart.html',
            scope: {
                width: '@',
                height: '@'
            },
            controller: ['OrderService', '$scope', 'CoreService', 'SOSAuth', function (OrderService, $scope, CoreService, SOSAuth) {
                var vm = $scope;
                var ordersData = [];

                function preparePieData(res) {
                    var ordersData = [];
                    var count = 0;
                    for (var prop in res) {
                        var obj = {};
                        obj.key = prop;
                        obj.y = res[prop];
                        ordersData.push(obj);
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
                        OrderService.getSnapshot(filter).then(function (res) {
                            vm.snapshot = res.orders;
                            preparePieData(vm.snapshot);
                        });
                    }
                }

                function loadSnapshot() {

                    if (!SOSAuth.jobChain) {
                        getSnapshot();
                    }
                }

                loadSnapshot();

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
                    loadSnapshot();
                });

                vm.$on('elementClick.directive', function (angularEvent, event) {
                    $rootScope.$broadcast('orderState', event.label);
                });

                vm.setFilter = function (label) {
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
                        noData: "No data found",
                        color: function (d, i) {

                            if (d.key == 'running') {
                                return '#7ab97a';
                            } else if (d.key == 'suspended') {
                                return '#e86680';
                            } else if (d.key == 'setbacks') {
                                return '#99b2df';
                            } else if (d.key == 'waitingForResource') {
                                return '#ffa366';
                            } else if (d.key == 'blacklist') {
                                return '#b966b9';
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
                                }

                            }
                        }


                    }

                }
            }]
        };
    }

    flowDiagram.$inject = ["$compile", "$window", "gettextCatalog", "$timeout"];
    function flowDiagram($compile, $window, gettextCatalog, $timeout) {
        return {
            restrict: 'E',
            transclude: true,
            link: function (scope, element) {

                scope.$on("drawJobChainFlowDiagram", function () {
                    //arrangeItems();
                     scope.jobChainData = angular.copy(scope.jobChain);
                    checkForEndNodes(0);
                });

                function arrangeItems() {
                    scope.jobChainData = angular.copy(scope.jobChain);
                    scope.jobChainData.nodes = [];
                    var jobChainData2 = angular.copy(scope.jobChain);
                    var havingNext = false;
                    var isNext = false;
                    var lastIndex = 0;
                    var isFirstNode = false;
                    var firstIndex = -1;

                    angular.forEach(scope.jobChain.nodes, function (item, index) {

                        if (item.nextNode) {
                            isFirstNode = true;
                        }
                        angular.forEach(scope.jobChain.nodes, function (item2, index2) {
                            if (item2.nextNode == item.name || item2.errorNode == item.name) {
                                isFirstNode = false;
                            }

                        });

                        if (isFirstNode && !(/(.+):(.+)/.test(item.name))) {
                            firstIndex = index;
                        }
                    });
                    if(firstIndex == -1){
                        firstIndex = 0;
                    }

                    scope.jobChainData.nodes[0] = angular.copy(scope.jobChain.nodes[firstIndex]);
                    jobChainData2.nodes.splice(firstIndex, 1);
                    getNext(0);


                    function getNext(index) {
                        var gotNext = false;
                        var item = scope.jobChainData.nodes[index];
                        if(!item){
                            return;
                        }
                        havingNext = false;
                        isNext = false;
                        angular.forEach(jobChainData2.nodes, function (item2, index2) {
                            if (item.nextNode == item2.name) {
                                gotNext = true;
                                scope.jobChainData.nodes.splice(index + 1, 0, item2);
                                jobChainData2.nodes.splice(index2, 1);
                                index++;
                                getNext(index);
                            }

                        });
                        if (!gotNext) {
                            getPrevious(1);
                        }
                    }

                    function getPrevious(cursor) {
                        var foundPrevious = false;
                        var last = scope.jobChainData.nodes.length - cursor;
                        var item = scope.jobChainData.nodes[last];
                        angular.forEach(jobChainData2.nodes, function (item2, index2) {
                            if (item2.nextNode == item.name) {
                                scope.jobChainData.nodes.splice(last, 0, item2);
                                if (!item.previousCounts) {
                                    jobChainData2.nodes[index2].previousCounts = 0;
                                }
                                jobChainData2.nodes[index2].previousCounts = item.previousCounts + 1;
                                jobChainData2.nodes[index2].removed = true;

                            }

                        });
                        cursor++;
                        if (cursor < scope.jobChainData.nodes.length) {
                            getPrevious(cursor);
                        } else {

                            var temp = [];
                            angular.forEach(jobChainData2.nodes, function (item, index) {
                                if (!item.removed) {
                                    temp.push(item);

                                }
                            });
                            jobChainData2.nodes = temp;
                            getNext2(0);

                        }
                    }

                    function getNext2(index) {
                        var gotNext = false;
                        var item = scope.jobChainData.nodes[index];
                        havingNext = false;
                        isNext = false;
                        if (item) {
                            angular.forEach(scope.jobChainData.nodes, function (item2, index2) {
                                if (item.nextNode == item2.name) {
                                    gotNext = true;
                                    scope.jobChainData.nodes.splice(index + 1, 0, item2);
                                    if (index2 > index) {
                                        index++;
                                        scope.jobChainData.nodes.splice(index2 + 1, 1);
                                    } else {
                                        index--;
                                        scope.jobChainData.nodes.splice(index2, 1);
                                    }
                                }
                            });
                        }
                        if (!gotNext) {
                            index++;
                        }
                        if (index < scope.jobChainData.nodes.length) {
                            getNext2(index);
                        } else if (!gotNext) {
                            if (jobChainData2.nodes.length > 0) {
                                scope.jobChainData.nodes = scope.jobChainData.nodes.concat(jobChainData2.nodes);

                            }

                            checkForEndNodes(0);

                        }
                    }





                }


                function checkForEndNodes(index) {
                        if (scope.jobChainData.endNodes) {
                            var endNode = scope.jobChainData.endNodes[index];
                            if (endNode) {
                                angular.forEach(scope.jobChainData.nodes, function (item2, index2) {
                                    var found = false;
                                    if (item2 && (item2.name == endNode.name)) {
                                        scope.jobChainData.endNodes.splice(index, 1);
                                        index--;
                                    }

                                });
                            }
                        }
                        index++;
                        if (scope.jobChainData.endNodes && (index < scope.jobChainData.endNodes.length)) {
                            checkForEndNodes(index)
                        } else {
                                findErrorNodes();

                        }
                    }

                 function findErrorNodes() {
                        angular.forEach(scope.jobChainData.nodes, function (item, index) {
                            angular.forEach(scope.jobChainData.nodes, function (item2, index2) {

                                if (item2.errorNode == item.name) {
                                   // console.log("This is error node 02" + item.name);
                                    scope.jobChainData.nodes[index].isErrorNode = true;
                                }
                                 if (item2.nextNode == item.name && item2.level<=item.level) {
                                   // console.log("This is error node 02" + item.name);
                                    scope.jobChainData.nodes[index].previous = item.name;
                                }
                            });

                        });
                        draw();

                    }

                function draw() {
                    var left = 0;
                    scope.width = window.outerWidth;
                    scope.height = window.outerHeight;
                    scope.jobPaths = [];
                    var rectW = 230;
                    var rectH = 115;
                    var avatarW = 32;
                    var margin = 50;
                    var coords = [];
                    scope.coords = coords;
                    scope.margin = margin;
                    var rectangleTemplate = '';
                    var iTop = 170;
                    var top = iTop;
                    var avatarTop = rectH / 2 - avatarW / 2 + top;
                    scope.errorNodeIndex = -1;
                    scope.endNodes = [];
                    scope.errorNodes = [];
                    var isSplitted = false;
                    var splitMargin = 40;
                    scope.splitMargin = splitMargin;
                    var height = 500;
                    scope.borderTop = 1;
                    var splitRegex = new RegExp('(.+):(.+)');
                    var orderLeft = left;

                    angular.forEach(scope.jobChainData.fileOrderSources, function (orderSource, index) {
                        if (index == 0) {
                            orderLeft = margin + avatarW;
                            rectangleTemplate = rectangleTemplate +
                            '<div id="tbOrderSource" class="table-responsive order-source-table" style="position:absolute;left:' + orderLeft + 'px;top:' + top + 'px;">' +
                            '<table class="table table-hover table-bordered" ><thead > <tr>' +
                            '<th> <span translate>label.sr </span> </th><th> <span translate>label.directory </span> </th>' +
                            '<th> <span translate>label.regularExpression</span> </th></tr></thead>'
                        }
                        rectangleTemplate = rectangleTemplate + '<tbody> <tr> <td>' + parseInt(index + 1) + ' </td><td>' + orderSource.directory + ' </td><td>' + orderSource.regex + ' </td></tr>';
                        if (index == scope.jobChainData.fileOrderSources.length - 1) {
                            rectangleTemplate = rectangleTemplate + '</tbody></table></div>';
                        }
                    });

                    if (scope.jobChainData.fileOrderSources && scope.jobChainData.fileOrderSources.length > 0) {
                        top = top + rectH + 50;
                    }

                   // console.log(scope.jobChainData)
                    angular.forEach(scope.jobChainData.nodes, function (item, index) {
                        if (!item) {
                            return;
                        }
                        scope.startId = "start";
                        if (item.name == 'start') {
                            scope.startId = "start" + index;
                        }
                        if (index == 0) {
                            avatarTop = top + rectH / 2 + 5 - avatarW / 2;
                            var startTop = avatarTop - 25;
                            var startLeft = avatarW / 2 - "Start".length * 3;
                            rectangleTemplate = rectangleTemplate + '<span id="lbStart" class="text-primary text-c" style="position: absolute;left: ' + startLeft + 'px;top: ' + startTop + 'px;z-index=1000;'
                            + '" translate>label.start</span>' +
                            '<span id="' + scope.startId + '" class="avatar w-32 primary text-white" style="position: absolute;left: 0px;top: ' + avatarTop + 'px' + '"> </span>';
                            left = margin + avatarW;
                        } else {
                            var last = coords.length - 1;
                            //left = coords[last].left + margin + rectW;
                        }

                        coords[index] = {};
                        coords[index].isParallel = false;
                        coords[index].parallels = 0;
                        coords[index].actual = item.name;
                        coords[index].name = item.name;
                        coords[index].next = item.nextNode;
                        coords[index].error = item.errorNode;
                        coords[index].top = top;
                        coords[index].left = left;
                        if (scope.errorNodes.indexOf(item.name) >= 0 && scope.errorNodeIndex == -1) {
                            scope.errorNodeIndex = index;
                        }

                        if (splitRegex.test(item.name)) {
                            isSplitted = true;
                            coords[index].name = splitRegex.exec(item.name)[2];
                            coords[index].isParallel = true;
                            coords.map(function (obj) {

                                if (obj.name == splitRegex.exec(item.name)[1]) {
                                    obj.parallels = obj.parallels + 1;
                                    coords[index].parent = obj.actual;
                                    coords[index].left = obj.left + rectW + margin;
                                    if (obj.parallels == 1) {
                                        coords[index].top = obj.top - rectH / 2 - splitMargin / 2;

                                    }
                                    else if (obj.parallels == 2) {
                                        coords[index].top = obj.top + rectH / 2 + splitMargin / 2;
                                    }
                                    else if (obj.parallels % 2 == 0) {
                                        coords[index].top = obj.top + rectH / 2 + splitMargin / 2 + (rectH + splitMargin) * (obj.parallels - 3);

                                    } else if (obj.parallels % 2 != 0) {
                                        coords[index].top = obj.top - rectH / 2 - splitMargin / 2 - (rectH + splitMargin) * (obj.parallels - 2);

                                    }
                                }
                            })
                        } else if (index > 0) {
                            var matched = false;
                            var mIndex = -1;
                            coords.map(function (obj) {

                                if (obj.next == item.name && coords[index].left <= obj.left) {
                                    coords[index].left = obj.left + margin + rectW;
                                    coords[index].parent = obj.actual;
                                    if (!matched) {
                                        coords[index].top = obj.top;
                                    }
                                    matched = true;

                                }
                            })

                            var errorNodeCls = '';
                            if (item.isErrorNode && scope.jobChainData.nodes[index - 1].nextNode !== item.name) {
                                coords[index].top = coords[index].top + rectH + splitMargin;
                                 coords.map(function (obj) {
                                 console.log("Coords left "+coords[index].left+" obj left "+obj.left);
                                if (coords[index].left < obj.left) {
                                    console.log("Matched 0011");
                                    coords[index].left = obj.left;
                                }
                            })
                                errorNodeCls ='error-node';

                            }
                        }

                        var jobName;

                        var host;

                        if (item.job) {
                            scope.jobPaths.push(item.job.path);
                            jobName = item.job.path.substring(item.job.path.lastIndexOf('/') + 1, item.job.path.length);
                            //jobName = jobName.length > 32 ? jobName.substring(0, 32) + '..' : jobName;
                            jobName = '<span>' + jobName + '</span>';
                            host = '<div class="text-left text-muted p-t-xs ">' +
                            '<span id="' + 'ppc' + item.name + '" class="hide"><i class="fa fa-server "></i><span id="' + 'pc' + item.name + '" class="p-l-sm">' + '--' + '</span></span>' +
                            '<span id="' + 'plk' + item.name + '" class="pull-right hide"><i class="fa fa-lock"></i><span id="' + 'lk' + item.name + '" class="p-l-sm text-xs">' + '--' + '</span></span>' +
                            '</div>';
                        } else if (item.jobChain) {
                            jobName = '<span><i class="fa fa-list"></i><span class="p-l-sm">' + item.jobChain.path.substring(item.jobChain.path.lastIndexOf('/') + 1, item.jobChain.path.length) + '</span></span>';
                        }

                        var nodeName = item.name;

                        // nodeName = nodeName.length > 26 ? nodeName.substring(0, 26) + '..' : nodeName;

                        var chkId = 'chk' + item.name.replace(':', '__');

                        item.state = item.state || {};
                        item.job.state = item.job.state || {};
                        item.state._text = item.state._text || "ACTIVE";
                        item.job.state._text = item.job.state._text || "ACTIVE";
                        var permissionClass = 'hide';
                        var permissionClassDropDown = 'hide';
                        var mL;
                        if (scope.permission.Job.stop || scope.permission.Job.unstop || scope.permission.JobChain.stopJobChainNode
                            || scope.permission.JobChain.processJobChainNode || scope.permission.JobChain.skipJobChainNode || scope.permission.JobChain.processJobChainNode) {
                            permissionClass = 'show-line';
                            mL = 'm-l-md';
                        }

                        if (scope.permission.Job.view.configuration || scope.permission.Job.stop || scope.permission.Job.unstop || scope.permission.JobChain.stopJobChainNode
                            || scope.permission.JobChain.processJobChainNode || scope.permission.JobChain.skipJobChainNode || scope.permission.JobChain.processJobChainNode) {
                            permissionClassDropDown = 'show-line';
                            mL = 'm-l-md';
                        }
                        var msg = '';
                        if (item.job.configurationStatus && item.job.configurationStatus.message) {
                            msg = item.job.configurationStatus.message;
                        }

                        rectangleTemplate = rectangleTemplate +
                        '<div id="' + item.name + '" style=" padding: 0px;position:absolute;left:' + coords[index].left + 'px;top:' + coords[index].top + 'px;"  class="rect '+errorNodeCls+'" ' +
                        'ng-class="{\'border-red\':jobChainData.nodes[\'' + index + '\'].state._text==\'SKIPPED\' ,\'border-red\':jobChainData.nodes[\'' + index + '\'].state._text==\'STOPPED\',\'border-dark-orange\':jobChainData.nodes[\'' + index + '\'].state._text==\'ACTIVE\' && jobChainData.nodes[\'' + index + '\'].job.state._text==\'STOPPED\',\'border-grey\':jobChainData.nodes[\'' + index + '\'].state._text==\'ACTIVE\' && jobChainData.nodes[\'' + index + '\'].job.state._text==\'PENDING\' && !isOrderRunning(\''+index+'\'),\'border-green\': isOrderRunning(\''+index+'\')}"> <div style="padding: 10px;padding-bottom: 5px">' +
                        '<div class="block-ellipsis-job">' +
                        '<label class="md-check md-check1 pos-abt ' + permissionClass + '" ><input type="checkbox"  id="' + chkId + '"><i class="ch-purple"></i></label>' +
                        '<span class="_500 block-ellipsis ' + mL + '" title="' + item.name + '">' + nodeName + '</span>' +
                        '<div class="btn-group dropdown pull-right abt-dropdown ' + permissionClassDropDown + '"><a href class=" more-option text-muted" data-toggle="dropdown"><i class="text fa fa-ellipsis-h"></i></a>' +
                        '<div class="dropdown-menu dropdown-ac dropdown-more">' +
                        '<a  class="dropdown-item" ng-disabled="permission.Job.view.configuration" translate>button.showConfiguration</a>' +
                        '<a href="" class="hide dropdown-item bg-hover-color" ng-click="stopJob(\'' + index + '\')" ng-class="{\'show\':jobChainData.nodes[\'' + index + '\'].job.state._text!==\'STOPPED\'}" ng-disabled="permission.Job.stop" translate>button.stopJob</a>' +
                        '<a href="" class="hide dropdown-item bg-hover-color " ng-click="unstopJob(\'' + index + '\')"  ng-class="{\'show\':jobChainData.nodes[\'' + index + '\'].job.state._text==\'STOPPED\'}" ng-disabled="permission.Job.unstop" translate>button.unstopJob</a>' +
                        '<a href="" class="hide dropdown-item bg-hover-color " ng-click="stopNode(\'' + index + '\')" ng-class="{\'show\':jobChainData.nodes[\'' + index + '\'].state._text!==\'STOPPED\'}" ng-disabled="permission.JobChain.stopJobChainNode" translate>button.stopNode</a>' +
                        '<a href="" class="hide dropdown-item bg-hover-color " ng-click="unstopNode(\'' + index + '\')"  ng-class="{\'show\':jobChainData.nodes[\'' + index + '\'].state._text==\'STOPPED\'}" ng-disabled="permission.JobChain.processJobChainNode" translate>button.unstopNode</a>' +
                        '<a href=""  class="hide dropdown-item" ng-click="skipNode(\'' + index + '\')" ng-class="{\'show\':jobChainData.nodes[\'' + index + '\'].state._text!==\'SKIPPED\'}" ng-disabled="permission.JobChain.skipJobChainNode"  translate>button.skipNode</a>' +
                        '<a href=""  class="hide dropdown-item" ng-click="unskipNode(\'' + index + '\')" ng-class="{\'show\':jobChainData.nodes[\'' + index + '\'].state._text==\'SKIPPED\'}" ng-disabled="permission.JobChain.processJobChainNode"  translate>button.unskipNode</a>' +
                        '</div></div></div>'
                        + '<div class="text-left text-muted p-t-sm block-ellipsis-job"><a class="text-hover-primary" title="' + item.job.path + '" id="navigateToJobBtn_' + item.name + '">' + jobName +
                        '</a><div class="text-sm crimson" translate>' + msg + '</div></div>' +
                        host +
                        '</div >' +
                        '<div class="box-footer b-t" style="position: absolute; bottom: 0; padding: 6px 10px; width: 100%; ">' +
                        '<a href ng-click="stopNode(\'' + index + '\')" ng-disabled="permission.JobChain.stopJobChainNode"' +
                        'class="hide pull-left w-half " ng-class="{\'show-inline\':jobChainData.nodes[\'' + index + '\'].state._text==\'ACTIVE\'}">' +
                        '<i class="fa fa-stop" ></i> <span translate>button.stopNode</span></a>' +
                        '<a href ng-click="unstopNode(\'' + index + '\')" class="hide pull-left w-half" ng-disabled="permission.JobChain.processJobChainNode" ng-class="{\'show-inline\':jobChainData.nodes[\'' + index + '\'].state._text==\'STOPPED\'}">' +
                        '<i class="fa fa-play" ></i> <span translate>button.unstopNode</span></a>' +
                        '<a href class="hide pull-right text-right w-half" ng-click="skipNode(\'' + index + '\')" ng-class="{\'show-inline\':jobChainData.nodes[\'' + index + '\'].state._text!==\'SKIPPED\'}" ng-disabled="permission.JobChain.skipJobChainNode"><i class="fa fa-step-forward"></i>  <span translate>button.skipNode</span> </a>' +
                        '<a href class="hide pull-right text-right w-half" ng-click="unskipNode(\'' + index + '\')" ng-class="{\'show-inline\':jobChainData.nodes[\'' + index + '\'].state._text==\'SKIPPED\'}"><i class="fa fa-play" ng-disabled="permission.JobChain.processJobChainNode"></i>  <span translate>button.unskipNode</span> </a>' +
                        '</div>' +
                        '</div>';

                        if (scope.errorNodes.indexOf(item.errorNode) == -1) {
                            scope.errorNodes.push(item.errorNode);
                        }

                        if (index == scope.jobChainData.nodes.length - 1) {
                            drawEndNodes(index);
                        }

                    });


                    function drawEndNodes() {

                        if (!scope.jobChainData.endNodes || scope.jobChainData.endNodes.length == 0) {
                            checkHeight();
                        }
                        var left = 0;
                        var length = coords.length;
                        coords[length] = {};
                        coords[length].top = top + rectH + 50 + rectH / 2 - avatarW / 2;


                        coords.map(function (obj) {
                            if (left < obj.left) {
                                left = obj.left;
                            }
                        });
                        var endErrorNodes = 0;
                        var endSuccessNodes = 0;
                        angular.forEach(scope.jobChainData.endNodes, function (endNode, index) {

                            scope.endNodes.push(endNode.name);
                            var item = scope.jobChainData.endNodes[index];
                            coords[length].left = left + rectW + margin;
                            if (index !== 0) {
                                coords[length + index] = {};
                                coords[length + index].left = left + rectW + margin;
                            }


                            if (scope.errorNodes.indexOf(endNode.name) >= 0) {
                                endErrorNodes++;
                                coords[length].top = top + rectH + 50 + rectH / 2 - avatarW / 2;
                                coords.map(function (obj) {
                                    if (coords[length].top < obj.top) {
                                        coords[length].top = obj.top + rectH + margin;
                                    }

                                });
                                var labelTop = coords[length].top - 25;
                                var labelLeft = coords[length].left + avatarW / 2 - endNode.name.length * 3;

                                rectangleTemplate = rectangleTemplate + '<span id="lb' + item.name + '"  class="text-danger error-node" ' +
                                'style="position: absolute;left: ' + labelLeft + 'px;top: ' + labelTop + 'px' + '">' + item.name + ' </span>' +
                                '<span id="' + item.name + '" class="avatar w-32 danger text-white error-node" ' +
                                'style="position: absolute;left: ' + coords[length].left + 'px;top: ' + coords[length].top + 'px' + '"> </span>';

                            } else {
                                endSuccessNodes++;
                                coords[length + index].top = avatarTop;
                                if (endSuccessNodes > 1) {
                                    coords.map(function (obj) {
                                        //console.log("Object top "+obj.top);
                                        if (coords[length + index].top < obj.top) {
                                            coords[length + index].top = obj.top + rectH + margin;
                                        }

                                    });
                                }
                                var labelTop = coords[length + index].top - 25;
                                var labelLeft = coords[length + index].left + avatarW / 2 - endNode.name.length * 3;
                                rectangleTemplate = rectangleTemplate + '<span id="lb' + item.name + '"  class="text-success" ' +
                                'style="position: absolute;left: ' + labelLeft + 'px;top: ' + labelTop + 'px' + '">' + item.name + ' </span>' +
                                '<span id="' + item.name + '" class="avatar w-32 success text-white" ' +
                                'style="position: absolute;left: ' + coords[length].left + 'px;top: ' + avatarTop + 'px' + '"> </span>';
                            }

                            if (index == scope.jobChainData.endNodes.length - 1) {
                                checkHeight();

                            }
                        })
                    }

                    function checkHeight() {
                        var mainContainer = document.getElementById("mainContainer");
                        var maxUTop = iTop;
                        coords.map(function (obj) {
                            if (maxUTop > obj.top) {
                                maxUTop = obj.top;
                            }

                        });
                        height = window.innerHeight - 300;

                        rectangleTemplate = '<div id="mainContainer"  class="p-a"  style="position: relative;width: 100%;" ><div id="zoomCn">' + rectangleTemplate + '</div>' +
                        '</div>';
                        var compiledHtml = $compile(rectangleTemplate)(scope);
                        element.append(compiledHtml);
                        if (maxUTop < iTop) {
                            var rect = document.getElementById(scope.startId);
                            var top = rect.style.getPropertyValue('top');
                            top = parseInt(top.substring(0, top.length - 2));
                            rect.style['top'] = top - maxUTop + iTop + 'px';
                            rect = document.getElementById('lbStart');
                            top = rect.style.getPropertyValue('top');
                            top = parseInt(top.substring(0, top.length - 2));
                            rect.style['top'] = top - maxUTop + iTop + 'px';
                            angular.forEach(scope.jobChainData.nodes, function (item, index) {
                                rect = document.getElementById(item.name);
                                top = rect.style.getPropertyValue('top');
                                top = parseInt(top.substring(0, top.length - 2));
                                rect.style['top'] = top - maxUTop + iTop + 'px';
                                if (index == scope.jobChainData.nodes.length - 1) {
                                    if (!scope.jobChainData.nodes || scope.jobChainData.nodes.length == 0) {
                                        drawLinks();
                                    }

                                }
                            });
                            angular.forEach(scope.jobChainData.endNodes, function (endNode, sIndex) {
                                rect = document.getElementById(endNode.name);
                                if (rect) {
                                    top = rect.style.getPropertyValue('top');
                                    top = parseInt(top.substring(0, top.length - 2));
                                    rect.style['top'] = top - maxUTop + iTop + 'px';
                                }
                                rect = document.getElementById('lb' + endNode.name);
                                if (rect) {
                                    top = rect.style.getPropertyValue('top');
                                    top = parseInt(top.substring(0, top.length - 2));
                                    rect.style['top'] = top - maxUTop + iTop + 'px';
                                }

                                if (scope.jobChainData.endNodes.length - 1 == sIndex) {
                                    drawLinks();
                                }
                            });

                            angular.forEach(scope.jobChainData.fileOrderSources, function (orderSource, index) {

                                rect = document.getElementById(orderSource.directory);
                                if (rect) {
                                    top = rect.style.getPropertyValue('top');
                                    top = parseInt(top.substring(0, top.length - 2));
                                    rect.style['top'] = top - maxUTop + iTop + 'px';
                                }
                            })


                        } else {
                            drawLinks();
                        }

                    }

                    function drawLinks() {
                        scope.drawConnections();
                    }

                }
            },
            scope: {
                'jobChain': '=',
                'onAdd': '&',
                'onRemove': '&',
                'showErrorNodes': '=',
                'getJobInfo': '&',
                'onAction': '&',
                'showConfiguration': '&',
                'showJob': '&',
                'orders': '=',
                'getJobChain': '&',
                'permission': '=',
                'onOrderAction': '&',
                'coords': '='
            },
            controller: ['$scope', '$interval', 'gettextCatalog', '$timeout', '$filter', 'SOSAuth', '$compile', '$location',
                function ($scope, $interval, gettextCatalog, $timeout, $filter, SOSAuth, $compile, $location) {
                    var vm = $scope;
                    vm.left = 0;
                    vm.object = {};
                    var splitRegex = new RegExp('(.+):(.+)');
                    var pDiv;
                    vm.vSpace = 20;
                    vm.hSpace = 20;
                    vm.border = 1;
                    var chkId;

                    vm.stopNode = function (index) {

                        var item = vm.jobChainData.nodes[index];

                        vm.onAction({
                            path: jobChainPath,
                            node: item.name,
                            action: 'stop node'
                        })

                    };

                    vm.unstopNode = function (index) {

                        var item = vm.jobChainData.nodes[index];

                        vm.onAction({
                            path: jobChainPath,
                            node: item.name,
                            action: 'unstop node'
                        })

                    };


                    vm.skipNode = function (index) {

                        var item = vm.jobChainData.nodes[index];

                        vm.onAction({
                            path: jobChainPath,
                            node: item.name,
                            action: 'skip'
                        })

                    };


                    vm.unskipNode = function (index) {

                        var item = vm.jobChainData.nodes[index];

                        vm.onAction({
                            path: jobChainPath,
                            node: item.name,
                            action: 'unskip'
                        })

                    };


                    vm.stopJob = function (index) {

                        var item = vm.jobChainData.nodes[index];

                        vm.onAction({
                            path: jobChainPath,
                            node: item.name,
                            action: 'stop job'
                        })

                    }

                    vm.unstopJob = function (index) {

                        var item = vm.jobChainData.nodes[index];

                        vm.onAction({
                            path: jobChainPath,
                            node: item.name,
                            action: 'unstop job'
                        })

                    };
                    var jobChainPath;
                    var mainContainer;
                    vm.selectedNodes = [];

                    vm.isOrderRunning=function(index){
                        var running =false;
                         var item = vm.jobChainData.nodes[index];
                        if(!item.orders || item.orders.length==0){
                            running =false;
                        }else{
                            angular.forEach(item.orders,function(order){
                                if(order.processingState && order.processingState._text == 'RUNNING'){
                                   running =true;
                                }
                            })
                        }

                        return running;

                    };

                    vm.drawConnections = function () {

                        jobChainPath = vm.jobChainData.path;
                        mainContainer = document.getElementById('zoomCn');

                        if (vm.jobChainData.fileOrderSources && vm.jobChainData.fileOrderSources.length > 0) {
                            var node;
                            if (!vm.jobChainData.nodes || !vm.jobChainData.nodes[0]) {
                                return;
                            }
                            var div1 = document.getElementById('tbOrderSource');
                            var div2 = document.getElementById(vm.startId);
                            var div3 = document.getElementById(vm.jobChainData.nodes[0].name);


                            var top = div1.offsetTop + div1.clientHeight;
                            var left = div1.offsetLeft + div1.clientWidth / 2;
                            var height = (div3.offsetTop - div1.offsetTop - div1.clientHeight) / 2;

                            node = document.createElement('div');
                            node.setAttribute('class', 'h-line next-link');

                            node.style['top'] = top - div2.clientHeight - 3 + 'px';
                            node.style['left'] = div2.offsetLeft + div2.clientWidth / 2 + 'px';
                            node.style['width'] = left - div1.clientWidth / 2 - 15 + 'px';
                            node.style['height'] = '2px';
                            mainContainer.appendChild(node);

                            node = document.createElement('div');
                            node.setAttribute('class', 'h-line next-link');

                            node.style['top'] = top - div2.clientHeight - 3 + 'px';
                            node.style['left'] = div2.offsetLeft + div2.clientWidth / 2 + 'px';
                            node.style['width'] = 2 + 'px';
                            node.style['height'] = (div2.offsetTop - top) + div1.clientHeight / 2 + 'px';
                            mainContainer.appendChild(node);

                            var start = document.createElement('span');
                            start.setAttribute('class', 'text-primary text-c');
                            start.setAttribute('id', 'lbStart');
                            start.style['left'] = document.getElementById('lbStart').offsetLeft + 'px';
                            start.style['top'] = document.getElementById('lbStart').offsetTop + 'px';
                            start.style['position'] = 'absolute';
                            start.style['z-index'] = 1000;
                            start.innerHTML = gettextCatalog.getString('label.start');
                            mainContainer.removeChild(document.getElementById('lbStart'));
                            mainContainer.appendChild(start);
                        }

                        angular.forEach(vm.jobChainData.nodes, function (item, index) {

                            var div1 = document.getElementById(item.name);
                            var div2 = document.getElementById(item.nextNode);
                            var errNode = document.getElementById(item.errorNode);
                            pDiv = undefined;

                            if (index > 0 && splitRegex.test(item.name)) {
                                vm.coords.map(function (obj) {
                                    if (obj.actual == item.name) {
                                        pDiv = document.getElementById(obj.parent);
                                    }
                                })
                            }

                            var x1 = div1.offsetLeft;
                            var y1 = div1.offsetTop;
                            var x2 = 0;
                            var y2 = 0;
                            var node;

                            if (div2) {
                                x2 = div2.offsetLeft;
                                y2 = div2.offsetTop;
                            }

                            if (index == 0) {
                                var avatar = document.getElementById(vm.startId);
                                node = document.createElement('div');
                                node.setAttribute('class', 'h-line next-link');

                                node.style['top'] = y1 + div1.clientHeight / 2 + vm.borderTop + 'px';
                                node.style['left'] = 32 + 'px';
                                node.style['width'] = div1.offsetLeft - avatar.offsetLeft - 32 + 'px';
                                node.style['height'] = '2px';
                                mainContainer.appendChild(node);
                            }

                            if (item.onError == "setback") {
                                var height = 30;
                                var width = 40;
                                var top = div1.offsetTop - height;
                                var left = div1.offsetLeft + div1.clientWidth / 2 + width / 2;

                                node = document.createElement('div');
                                node.setAttribute('class', 'h-line next-link');
                                node.style['top'] = top + 'px';
                                node.style['left'] = left + 'px';
                                node.style['width'] = '2px';
                                node.style['height'] = height + 'px';
                                mainContainer.appendChild(node);


                                left = left - width;
                                node = document.createElement('div');
                                node.setAttribute('class', 'h-line next-link');
                                node.style['top'] = top + 'px';
                                node.style['left'] = left + 'px';
                                node.style['width'] = width + 'px';
                                node.style['height'] = '2px';
                                mainContainer.appendChild(node);


                                node = document.createElement('div');
                                node.setAttribute('class', 'h-line next-link');
                                node.style['top'] = top + 'px';
                                node.style['left'] = left + 'px';
                                node.style['width'] = '2px';
                                node.style['height'] = height + 'px';
                                mainContainer.appendChild(node);

                                node = document.createElement('i');
                                node.setAttribute('id', 'chevron' + item.name);
                                node.setAttribute('class', 'fa fa-chevron-down');
                                mainContainer.appendChild(node);

                                var i = document.getElementById('chevron' + item.name);
                                i.style['position'] = 'absolute';
                                i.style['top'] = top + height - vm.borderTop - i.clientHeight / 2 + 'px';
                                i.style['left'] = left - i.clientWidth / 2 + 'px';


                            }


                            if (div2) {

                                if (pDiv && pDiv.offsetTop > div1.offsetTop) {

                                    var top = pDiv.offsetTop + pDiv.clientHeight / 2;
                                    var left = pDiv.offsetLeft + pDiv.clientWidth + vm.border;
                                    width = vm.margin / 2;
                                    node = document.createElement('div');
                                    node.setAttribute('class', 'h-line next-link');
                                    node.style['top'] = top + 'px';
                                    node.style['left'] = left + 'px';
                                    node.style['width'] = width + 'px';
                                    node.style['height'] = '2px';
                                    mainContainer.appendChild(node);

                                    top = div1.offsetTop + div1.clientHeight / 2;
                                    left = div1.offsetLeft - vm.margin / 2;
                                    height = pDiv.offsetTop + pDiv.clientHeight / 2 - top;
                                    node = document.createElement('div');
                                    node.setAttribute('class', 'h-line next-link');
                                    node.style['top'] = top + 'px';
                                    node.style['left'] = left + 'px';
                                    node.style['width'] = '2px';
                                    node.style['height'] = height + 'px';
                                    mainContainer.appendChild(node);


                                    width = left - pDiv.offsetLeft - pDiv.clientWidth;
                                    node = document.createElement('div');
                                    node.setAttribute('class', 'h-line next-link');
                                    node.style['top'] = top + 'px';
                                    node.style['left'] = left + 'px';
                                    node.style['width'] = width + 'px';
                                    node.style['height'] = '2px';
                                    mainContainer.appendChild(node);
                                } else if (pDiv && pDiv.offsetTop < div1.offsetTop) {
                                    var top = pDiv.offsetTop + pDiv.clientHeight / 2;
                                    var left = pDiv.offsetLeft + pDiv.clientWidth + vm.border;
                                    var width = vm.margin / 2;
                                    node = document.createElement('div');
                                    node.setAttribute('class', 'h-line next-link');
                                    node.style['top'] = top + 'px';
                                    node.style['left'] = left + 'px';
                                    node.style['width'] = width + 'px';
                                    node.style['height'] = '2px';
                                    mainContainer.appendChild(node);

                                    left = left + vm.margin / 2;
                                    height = div1.offsetTop + div1.clientHeight / 2 - top;

                                    node = document.createElement('div');
                                    node.setAttribute('class', 'h-line next-link');
                                    node.style['top'] = top + 'px';
                                    node.style['left'] = left + 'px';
                                    node.style['width'] = '2px';
                                    node.style['height'] = height + 'px';
                                    mainContainer.appendChild(node);

                                    top = top + height;
                                    width = left - div1.offsetLeft;


                                    node = document.createElement('div');
                                    node.setAttribute('class', 'h-line next-link');
                                    node.style['top'] = top + 'px';
                                    node.style['left'] = left + 'px';
                                    node.style['width'] = width + 'px';
                                    node.style['height'] = '2px';
                                    mainContainer.appendChild(node);
                                }
                               // console.log(" divs "+div1.id+" 2 "+div2.id);
                                if (div1.offsetTop > div2.offsetTop) {

                              
                                    var top = div2.offsetTop + div2.clientHeight / 2;
                                    var left = div2.offsetLeft - vm.margin / 2;
                                    var width = vm.margin / 2;
                                    var height = 2;

                                    node = document.createElement('div');
                                    node.setAttribute('class', 'h-line next-link');
                                    node.style['top'] = top + 'px';
                                    node.style['left'] = left + 'px';
                                    node.style['width'] = width + 'px';
                                    node.style['height'] = '2px';
                                    mainContainer.appendChild(node);


                                    height = div1.offsetTop + div1.clientHeight / 2 - top;

                                    node = document.createElement('div');
                                    node.setAttribute('class', 'h-line next-link '+(index>0&&item.isErrorNode && vm.jobChainData.nodes[(index - 1)].nextNode !== item.name?'error-node':''));
                                    node.style['top'] = top + 'px';
                                    node.style['left'] = left + 'px';
                                    node.style['width'] = '2px';
                                    node.style['height'] = height + 'px';
                                    mainContainer.appendChild(node);

                                    top = top + height;
                                    left = div1.offsetLeft + div1.clientWidth + vm.border;
                                    width = div2.offsetLeft - vm.margin / 2 - left + vm.border / 2;
                                    node = document.createElement('div');
                                    node.setAttribute('class', 'h-line next-link '+(index>0&&item.isErrorNode && vm.jobChainData.nodes[(index - 1)].nextNode !== item.name?'error-node':''));
                                    node.style['top'] = top + 'px';
                                    node.style['left'] = left + 'px';
                                    node.style['width'] = width + 'px';
                                    node.style['height'] = '2px';
                                    mainContainer.appendChild(node);

                                } else if (div1.clientHeight == div2.clientHeight && div2.offsetTop + div2.clientHeight > div1.offsetTop + div1.clientHeight) {

                                    var top = div1.offsetTop + div1.clientHeight / 2;
                                    var left = div1.offsetLeft + div1.clientWidth;
                                    var width = div2.offsetLeft - left - vm.margin / 2;
                                    var height = 1;
                                    node = document.createElement('div');
                                    node.setAttribute('class', 'h-line next-link '+(index>0&&item.isErrorNode && vm.jobChainData.nodes[(index - 1)].nextNode !== item.name?'error-node':''));
                                    node.style['top'] = top + 'px';
                                    node.style['left'] = left + 'px';
                                    node.style['width'] = width + 'px';
                                    node.style['height'] = '2px';
                                    mainContainer.appendChild(node);

                                    left = left + width;

                                    height = div2.offsetTop + div2.clientHeight / 2 - top;
                                    node = document.createElement('div');
                                    node.setAttribute('class', 'h-line next-link '+(index>0&&item.isErrorNode && vm.jobChainData.nodes[(index - 1)].nextNode !== item.name?'error-node':''));
                                    node.style['top'] = top + 'px';
                                    node.style['left'] = left + 'px';
                                    node.style['width'] = '2px';
                                    node.style['height'] = height + 'px';
                                    mainContainer.appendChild(node);

                                    top = top + height;
                                    width = div1.offsetLeft - left;
                                    node = document.createElement('div');
                                    node.setAttribute('class', 'h-line next-link '+(index>0&&item.isErrorNode && vm.jobChainData.nodes[(index - 1)].nextNode !== item.name?'error-node':''));
                                    node.style['top'] = top + 'px';
                                    node.style['left'] = left + 'px';
                                    node.style['width'] = width + 'px';
                                    node.style['height'] = '2px';
                                    mainContainer.appendChild(node);


                                } else {
                                    var parallels = 0;
                                    vm.coords.map(function (obj) {
                                        if (obj.actual == item.name) {
                                            parallels = obj.parallels;
                                        }
                                    });
                                    if (vm.jobChainData.nodes.length - 1 > index && parallels > 0) {

                                    } else {
                                        node = document.createElement('div');
                                        node.setAttribute('class', 'h-line next-link '+(index>0 && item.isErrorNode && vm.jobChainData.nodes[(index - 1)].nextNode !== item.name?'error-node':''));
                                        node.style['top'] = div2.offsetTop + div2.clientHeight / 2 + 'px';
                                        node.style['left'] = div1.offsetLeft + div1.clientWidth + vm.border + 'px';
                                        node.style['width'] = div2.offsetLeft - div1.offsetLeft - div1.clientWidth + 'px';
                                        node.style['height'] = '2px';
                                        mainContainer.appendChild(node);
                                    }

                                }

                            }


                            if (errNode) {
                                if (div1.offsetTop + div1.clientHeight < errNode.offsetTop + errNode.clientHeight &&
                                    div1.offsetTop > errNode.offsetTop) {
                                    console.log(" error top is lesser " + item.name);
                                    var top = errNode.offsetTop + errNode.clientHeight / 2;
                                    var left = errNode.offsetLeft - vm.margin / 2;
                                    var width = vm.margin / 2;
                                    var height = 2;

                                    node = document.createElement('div');
                                    node.setAttribute('class', 'h-line next-link');
                                    node.style['top'] = top + 'px';
                                    node.style['left'] = left + 'px';
                                    node.style['width'] = width + 'px';
                                    node.style['height'] = '2px';
                                    mainContainer.appendChild(node);


                                    height = div1.offsetTop + div1.clientHeight / 2 - top;

                                    node = document.createElement('div');
                                    node.setAttribute('class', 'h-line next-link');
                                    node.style['top'] = top + 'px';
                                    node.style['left'] = left + 'px';
                                    node.style['width'] = '2px';
                                    node.style['height'] = height + 'px';
                                    mainContainer.appendChild(node);

                                    top = top + height;
                                    left = div1.offsetLeft + div1.clientWidth + vm.border;
                                    width = errNode.offsetLeft - vm.margin / 2 - left + vm.border / 2;
                                    node = document.createElement('div');
                                    node.setAttribute('class', 'h-line next-link');
                                    node.style['top'] = top + 'px';
                                    node.style['left'] = left + 'px';
                                    node.style['width'] = width + 'px';
                                    node.style['height'] = '2px';
                                    mainContainer.appendChild(node);

                                } else if (errNode.offsetTop + errNode.clientHeight > div1.offsetTop + div1.clientHeight) {
                                    var top = div1.offsetTop + div1.clientHeight + vm.border;
                                    var left = div1.offsetLeft + div1.clientWidth / 2;
                                    var width = errNode.offsetLeft - left - vm.margin / 2;
                                    var height = vm.vSpace;
                                    node = document.createElement('div');
                                    node.setAttribute('class', 'error-link');
                                    node.style['border-left'] = '2px dashed #f44455';
                                    node.style['top'] = top + 'px';
                                    node.style['left'] = left + 'px';
                                    node.style['width'] = '2px';
                                    node.style['height'] = height + 'px';
                                    mainContainer.appendChild(node);

                                    top = top + height;

                                    width = div1.clientWidth / 2 + vm.hSpace;
                                    node = document.createElement('div');
                                    node.setAttribute('class', 'error-link');
                                    node.style['border-top'] = '2px dashed #f44455';
                                    node.style['top'] = top + 'px';
                                    node.style['left'] = left + 'px';
                                    node.style['width'] = width + 'px';
                                    node.style['height'] = '2px';
                                    mainContainer.appendChild(node);

                                    left = left + width;
                                    height = errNode.offsetTop + errNode.clientHeight / 2 - top;
                                    node = document.createElement('div');
                                    node.setAttribute('class', 'error-link');
                                    node.style['border-left'] = '2px dashed #f44455';
                                    node.style['top'] = top + 'px';
                                    node.style['left'] = left + 'px';
                                    node.style['width'] = '2px';
                                    node.style['height'] = height + 'px';
                                    mainContainer.appendChild(node);


                                    width = errNode.offsetLeft - left;
                                    top = top + height - 1;
                                    node = document.createElement('div');
                                    node.setAttribute('class', 'error-link');
                                    node.style['border-top'] = '2px dashed #f44455';
                                    node.style['top'] = top + 'px';
                                    node.style['left'] = left + 'px';
                                    node.style['width'] = width + 'px';
                                    node.style['height'] = '2px';
                                    mainContainer.appendChild(node);


                                } else {
                                    var node1 = div1;
                                    var node2 = errNode;
                                    if (div1.offsetLeft > errNode.offsetLeft) {
                                        node1 = errNode;
                                        var node2 = div1;
                                    }
                                    var top = node1.offsetTop + node1.clientHeight + vm.border;
                                    var left = node1.offsetLeft + node1.clientWidth / 2;
                                    var width = node2.offsetLeft - left - vm.margin / 2;
                                    var height = vm.vSpace + 10;
                                    node = document.createElement('div');
                                    node.setAttribute('class', 'error-link');
                                    node.style['border-left'] = '2px dashed #f44455';
                                    node.style['top'] = top + 'px';
                                    node.style['left'] = left + 'px';
                                    node.style['width'] = '2px';
                                    node.style['height'] = height + 'px';
                                    mainContainer.appendChild(node);

                                    top = top + height;

                                    width = node2.offsetLeft + node2.clientWidth / 2- left;
                                    node = document.createElement('div');
                                    node.setAttribute('class', 'error-link');
                                    node.style['border-top'] = '2px dashed #f44455';
                                    node.style['top'] = top + 'px';
                                    node.style['left'] = left + 'px';
                                    node.style['width'] = width + 'px';
                                    node.style['height'] = '2px';
                                    mainContainer.appendChild(node);

                                    left = node2.offsetLeft + node2.clientWidth / 2;
                                    height = top - node2.offsetTop - errNode.clientHeight;
                                    top = node2.offsetTop + node2.clientHeight;
                                    node = document.createElement('div');
                                    node.setAttribute('class', 'error-link');
                                    node.style['border-left'] = '2px dashed #f44455';
                                    node.style['top'] = top + 'px';
                                    node.style['left'] = left + 'px';
                                    node.style['width'] = '2px';
                                    node.style['height'] = height + 'px';
                                    mainContainer.appendChild(node);
                                }
                            }

                            chkId = 'chk' + item.name.replace(':', '__');

                            var chk = document.getElementById(chkId);
                            if (chk)
                                chk.addEventListener('change', function () {
                                     var itemObj = vm.jobChainData.nodes[index];
                                    if (chk.checked) {

                                        vm.onAdd({$item: itemObj});
                                        vm.selectedNodes.push(itemObj);
                                    } else {
                                        vm.onRemove({$item: itemObj});
                                        angular.forEach(vm.selectedNodes, function (node, index2) {
                                            if (node.name == itemObj.name) {
                                                vm.selectedNodes.splice(index2, 1);
                                            }
                                        })
                                    }
                                });



                            var navigateToJobBtnId = 'navigateToJobBtn_' + item.name;
                            var navigateToJobBtn = document.getElementById(navigateToJobBtnId);
                            if (navigateToJobBtn)
                                navigateToJobBtn.addEventListener('click', function (e) {
                                    vm.showJob({job: item.job.path});
                                });

                            if (vm.jobChainData.nodes.length - 1 == index) {
                                vm.limitNum = 5;
                                vm.showOrderPanel = '';
                                getInfo(0);
                                updateJobChain();
                            }

                        })


                    };


                    function getInfo(index) {
                        var node = vm.jobChainData.nodes[index];
                        if (node.job && node.job.path && (!node.job.configurationStatus || node.job.configurationStatus.severity != 2)) {
                            vm.getJobInfo({filter: {compact: true, job: node.job.path}}).then(function (res) {

                                var span = document.getElementById('lk' + node.name);
                                var pSpan = document.getElementById('plk' + node.name);
                                if (res.job.locks && res.job.locks.length > 0) {

                                    node.locks = res.job.locks;
                                    pSpan.className = pSpan.className.replace("hide", "show-inline");
                                    if (node.locks[0] && node.locks[0].path && node.locks[0].path.indexOf('/') != -1) {
                                        var extra = node.locks.length - 1 > 0 ? ' + ' + node.locks.length + ' more' : '';
                                        span.textContent = node.locks[0].path.substring(node.locks[0].path.lastIndexOf('/') + 1, node.locks[0].path.length)
                                        + extra;
                                    } else if (node.locks[0] && node.locks[0].path) {
                                        var extra = node.locks.length - 1 > 0 ? ' and ' + node.locks.length + ' more' : '';
                                        span.textContent = node.locks[0].path + extra;
                                    }

                                } else {
                                    pSpan.className = pSpan.className.replace("show-inline", "hide");

                                }
                                var span01 = document.getElementById('pc' + node.name);
                                var pSpan01 = document.getElementById('ppc' + node.name);
                                if (res.job.processClass) {
                                    node.processClass = res.job.processClass;
                                    pSpan01.className.replace("hide", "show-inline");
                                    if (node.processClass && node.processClass.indexOf('/') != -1) {
                                        span01.textContent = node.processClass.substring(node.processClass.lastIndexOf('/') + 1, node.processClass.length)

                                    } else if (node.processClass) {
                                        span01.textContent = node.processClass;
                                    }
                                } else {
                                    pSpan01.className = pSpan01.className.replace("show-inline", "hide");
                                    span01.textContent = '--';
                                }


                            }, function (err) {

                            })
                        }
                        index++;
                        if (index < vm.jobChainData.nodes.length) {
                            getInfo(index);
                        }


                    }

                    vm.$watch("showErrorNodes", toggleErrorNodes);

                    function toggleErrorNodes() {
                        var errorElms = document.getElementsByClassName("error-link");
                        var errorNodes = document.getElementsByClassName("error-node");
                        if (vm.showErrorNodes) {
                            angular.forEach(errorElms, function (elm) {
                                elm.style['display'] = 'block';
                            });
                            angular.forEach(errorNodes, function (elm) {
                                elm.style['display'] = 'block';
                            });
                        } else {
                            angular.forEach(errorElms, function (elm) {
                                elm.style['display'] = 'none';
                            });
                            angular.forEach(errorNodes, function (elm) {
                                elm.style['display'] = 'none';
                            });
                        }
                    }


                    vm.$on('reloadJobChain', function (event, args) {
                        vm.jobChain = JSON.parse(SOSAuth.jobChain);
                        if (vm.jobChainData)
                            var temp = vm.jobChainData.nodes;
                        vm.jobChainData = angular.copy(vm.jobChain);
                        if (temp)
                            vm.jobChainData.nodes = temp;

                        angular.forEach(vm.jobChain.nodes, function (item, index1) {
                            angular.forEach(vm.jobChainData.nodes, function (item2, index2) {
                                if (item2 && (item.name == item2.name)) {
                                    vm.jobChainData.nodes[index2] = item;
                                }
                                if (index1 == vm.jobChain.nodes.length - 1 && vm.jobChainData.nodes.length - 1 == index2) {
                                    updateJobChain();
                                }

                            })
                        })

                    });


                    function updateJobChain() {
                        var nodeCount = 0;
                        if (!mainContainer) {
                            return;
                        }
                        angular.forEach(vm.jobChainData.nodes, function (node, index) {
                            nodeCount++;
                            var label = document.getElementById('lbl-order-' + node.name);

                            if (label) {
                                label.parentNode.removeChild(label);
                            }


                            if (node.orders && node.orders.length > 0) {
                                addLabel(node.orders, node.name);
                            }
                        });


                        vm.colorFunction = colorFunction;
                        function colorFunction(d) {
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
                        }

                        function addLabel(orders, name) {
                            vm.limitNum = $window.localStorage.$SOS$MAXORDERPERJOBCHAIN;
                            var blockEllipsisFlowOrder = 'block-ellipsis-flow-order';
                            if (orders.length > 3) {
                                blockEllipsisFlowOrder = 'block-ellipsis-flow-order1';
                            }
                            angular.forEach(orders, function (order, index) {
                                var node = document.getElementById(name);

                                if (node) {
                                    if (index > vm.limitNum) {
                                        return;
                                    }
                                    if (index == vm.limitNum) {

                                        var container = document.getElementById('lbl-order-' + order.state);
                                        var label = document.createElement('div');
                                        label.innerHTML = '<i id="more" ng-click="showOrderPanelFun(\''+order.jobChain+'\')" class="hide" ng-class="{\'show cursor text-xs\':showOrderPanel != \''+name+'\' && \''+ orders.length+'\'> limitNum}"><span >' + gettextCatalog.getString("label.showMoreOrders") + '</span><br></i>';
                                        var top = container.offsetTop;
                                        container.appendChild(label);

                                        if (index <= 5) {
                                            container.style['top'] = container.offsetTop - container.firstChild.clientHeight + 'px';
                                        }
                                        if (index == 5) {
                                            container.style['max-height'] = container.clientHeight + container.firstChild.clientHeight + 'px';
                                        }

                                        $compile(label)(vm);
                                        return;

                                    }
                                    var container = document.getElementById('lbl-order-' + order.state);


                                    if (container && container.childNodes.length > 0) {
                                        var label = document.createElement('div');
                                        label.innerHTML = getOrderMenu(order);
                                        var top = container.offsetTop;
                                        container.appendChild(label);
                                        if (index <= 4) {
                                            container.style['top'] = container.offsetTop - container.firstChild.clientHeight + 'px';
                                        }
                                        container.appendChild(label);
                                        if (index == 4) {
                                            container.style['max-height'] = container.clientHeight + 'px';
                                        }

                                        $compile(label)(vm);
                                    } else {
                                        var label = document.createElement('div');
                                        label.setAttribute('id', 'lbl-order-' + order.state);
                                        label.style['position'] = 'absolute';
                                        label.style['width'] = node.clientWidth + 'px';
                                        label.style['margin-bottom'] = '5px';
                                        label.style['left'] = node.offsetLeft + 'px';
                                        label.style['white-space'] = 'nowrap';
                                        label.innerHTML = '<div>'+getOrderMenu(order)+'</div>';
                                        mainContainer.appendChild(label);
                                        $compile(label)(vm);
                                        label.style['top'] = node.offsetTop - label.clientHeight - 5 + 'px';
                                        label.style['height'] = 'auto';
                                        label.style['min-height'] = '35px';
                                        label.style['overflow'] = 'auto';
                                    }


                                }

                                function getOrderMenu(order){
                                     var diff = 0;
                                        var time = 0;
                                        if (order.startedAt) {
                                            diff = '+<span time="' + order.startedAt + '"></span>';
                                            time = order.startedAt;
                                        } else {

                                            if ($filter('durationFromCurrent')(undefined, order.nextStartTime) == 'never')
                                                diff = 'never';
                                            else
                                                diff = '-<span time="' + order.nextStartTime + '"></span>';


                                            time = order.nextStartTime;
                                        }
                                    var menu='<span class="text-sm"><i id="circle-' + order.orderId + '" class="text-xs fa fa-circle" ng-class="colorFunction(\''+order.processingState.severity+'\')"></i> ' +
                                        '<span class="' + blockEllipsisFlowOrder + ' show-block v-m p-r-xs" title="' + order.orderId + '">' + order.orderId + '</span>'
                                        + '<span id="date-' + order.orderId + '" class="show-block v-m text-success text-xs"> ' + moment(time).tz($window.localStorage.$SOS$ZONE).format($window.localStorage.$SOS$DATEFORMAT) + ' (' + diff + ')</span>'
                                        + '</span>'
                                        + '<div class="hide btn-group dropdown" ng-class="{\'show-inline\':permission.Order.view.configuration || (permission.Order.view.orderLog && \''+order.historyId+'\') || permission.Order.start || permission.Order.setState'
                                        +'|| permission.Order.setRunTime || permission.Order.suspend || permission.Order.resume'
                                        +'|| permission.Order.reset || permission.Order.removeSetback || permission.Order.delete.permanent}"><button type="button"  class="btn-drop more-option-h" data-toggle="dropdown"><i class="fa fa-ellipsis-h"></i></button>'
                                        + '<div class="dropdown-menu dropdown-ac" role="menu" style="position: fixed;z-index: 9999;top: ' + node.offsetTop * 2 + 'px; left:' + node.offsetLeft * 1.2 + 'px !important">'
                                        + '<a class="hide" id="log-' + order.orderId + '" ng-class="{\'show dropdown-item\':permission.Order.view.orderLog && \''+order.type+'\'!==\'AD_HOC\'}">' + gettextCatalog.getString("button.viewLog") + '</a>'
                                        + '<a class="hide" id="configuration-' + order.orderId + '" ng-class="{\'show dropdown-item\':permission.Order.view.configuration && \''+order.historyId+'\'}">' + gettextCatalog.getString("button.showConfiguration") + '</a>'
                                        + '<a class="hide" id="ordernow-' + order.orderId + '" ng-class="{\'show dropdown-item\':(\''+order.processingState +'\'&& (\''+order.processingState._text +'\'== \'PENDING\' ||\''+ order.processingState._text +'\'== \'SETBACK\'))&& permission.Order.start}">' + gettextCatalog.getString("button.startOrderNow") + '</a>'
                                        + '<a class="hide" id="orderat-' + order.orderId + '" ng-class="{\'show dropdown-item\':(\''+order.processingState +'\'&& (\''+order.processingState._text +'\'== \'PENDING\' ||\''+ order.processingState._text +'\'== \'SETBACK\'))&& permission.Order.start}">' + gettextCatalog.getString("button.startOrderat") + '</a>'
                                        + '<a class="hide" id="orderstate-' + order.orderId + '" ng-class="{\'show dropdown-item\':(\''+order.processingState +'\'&& (\''+order.processingState._text +'\'== \'SUSPENDED\' ||\''+ order.processingState._text +'\'== \'PENDING\'))&& permission.Order.setState}">' + gettextCatalog.getString("button.setOrderState") + '</a>'
                                        + '<a class="hide" id="runtime-' + order.orderId + '" ng-class="{\'show dropdown-item\':(\''+order.processingState +'\'&& (\''+order.processingState._text +'\'== \'SUSPENDED\' ||\''+ order.processingState._text +'\'== \'PENDING\'))&& permission.Order.setRunTime}">' + gettextCatalog.getString("button.setRunTime") + '</a>'
                                        + '<a class="hide" id="suspend-' + order.orderId + '" ng-class="{\'show dropdown-item bg-hover-color\':(\''+order.processingState +'\'&& (\''+order.processingState._text +'\'!== \'SUSPENDED\' && \''+ order.processingState._text +'\'!== \'BLACKLIST\'))&& permission.Order.suspend}">' + gettextCatalog.getString("button.suspendOrder") + '</a>'
                                        + '<a class="hide" id="resume-' + order.orderId + '" ng-class="{\'show dropdown-item\':(\''+order.processingState +'\'&& (\''+order.processingState._text +'\'== \'SUSPENDED\'))&& permission.Order.resume}">' + gettextCatalog.getString("button.resumeOrder") + '</a>'
                                        + '<a class="hide" id="resumeodrprmt-' + order.orderId + '" ng-class="{\'show dropdown-item\':(\''+order.processingState +'\'&& (\''+order.processingState._text +'\'== \'SUSPENDED\'))&& permission.Order.resume}">' + gettextCatalog.getString("button.resumeOrderParametrized") + '</a>'
                                        + '<a class="hide" id="resumeodrfrmstate-' + order.orderId + '" ng-class="{\'show dropdown-item\':(\''+order.processingState +'\'&& (\''+order.processingState._text +'\'== \'SUSPENDED\'))&& permission.Order.resume}">' + gettextCatalog.getString("button.resumeOrderFromState") + '</a>'
                                        + '<a class="hide" id="orderreset-' + order.orderId + '" ng-class="{\'show dropdown-item\':(\''+order.processingState +'\'&& (\''+order.processingState._text +'\'!== \'BLACKLIST\'))&& permission.Order.reset}">' + gettextCatalog.getString("button.resetOrder") + '</a>'
                                        + '<a class="hide" id="orderremove-' + order.orderId + '" ng-class="{\'show dropdown-item bg-hover-color\':(\''+order.processingState +'\'&& (\''+order.processingState._text +'\'== \'SETBACK\'))&& permission.Order.removeSetback}">' + gettextCatalog.getString("button.removeOrder") + '</a>'
                                        + '<a class="hide" id="calendar-' + order.orderId + '" ng-class="{\'show dropdown-item \':(\''+order.processingState +'\'&& (\''+order.processingState._text +'\'!== \'BLACKLIST\'))&& '+order.type+'!==\'AD_HOC\' && permission.DailyPlan.view.status}">' + gettextCatalog.getString("button.showCalendar") + '</a>'
                                        + '<a class="hide"  id="orderdelete-' + order.orderId + '" ng-class="{\'show dropdown-item bg-hover-color \':'+order.type+'==\'AD_HOC\' && permission.Order.delete.permanent}">' + gettextCatalog.getString("button.deleteOrder") + '</a>'
                                        + '</div></div>';
                                    return menu;
                                }

                                var orderLog = document.getElementById('log-' + order.orderId);
                                orderLog.addEventListener('click', function () {
                                    vm.onOrderAction({
                                        order: order,
                                        action: 'view log'
                                    })
                                });


                                var configuration = document.getElementById('configuration-' + order.orderId);
                                configuration.addEventListener('click', function () {
                                    vm.showConfiguration({type: 'order', path: order.jobChain, name: order.orderId});
                                });

                                var orderNow = document.getElementById('ordernow-' + order.orderId);
                                orderNow.addEventListener('click', function () {
                                    vm.onOrderAction({
                                        order: order,
                                        action: 'start order now'
                                    })
                                });

                                var orderAt = document.getElementById('orderat-' + order.orderId);
                                orderAt.addEventListener('click', function () {
                                    vm.onOrderAction({
                                        order: order,
                                        action: 'start order at'
                                    });
                                });

                                var orderState = document.getElementById('orderstate-' + order.orderId);
                                orderState.addEventListener('click', function () {
                                    vm.onOrderAction({
                                        order: order,
                                        action: 'set order state'
                                    })
                                });

                                var runTime = document.getElementById('runtime-' + order.orderId);
                                runTime.addEventListener('click', function () {
                                    vm.onOrderAction({
                                        order: order,
                                        action: 'set run time'
                                    })
                                });

                                var suspend = document.getElementById('suspend-' + order.orderId);
                                suspend.addEventListener('click', function () {
                                    vm.onOrderAction({
                                        order: order,
                                        action: 'suspend order'
                                    })
                                });

                                var resume = document.getElementById('resume-' + order.orderId);
                                resume.addEventListener('click', function () {
                                    vm.onOrderAction({
                                        order: order,
                                        action: 'resume order'
                                    })
                                });

                                var resumeOrderParam = document.getElementById('resumeodrprmt-' + order.orderId);
                                resumeOrderParam.addEventListener('click', function () {
                                    vm.onOrderAction({
                                        order: order,
                                        action: 'resume order with param'
                                    })
                                });

                                var resumeOrderFromState = document.getElementById('resumeodrfrmstate-' + order.orderId);
                                resumeOrderFromState.addEventListener('click', function () {
                                    vm.onOrderAction({
                                        order: order,
                                        action: 'resume order next state'
                                    })
                                });

                                var orderReset = document.getElementById('orderreset-' + order.orderId);
                                orderReset.addEventListener('click', function () {
                                    vm.onOrderAction({
                                        order: order,
                                        action: 'reset order'
                                    })
                                });

                                var orderRemove = document.getElementById('orderremove-' + order.orderId);
                                orderRemove.addEventListener('click', function () {
                                    vm.onOrderAction({
                                        order: order,
                                        action: 'remove order'
                                    })
                                });

                                var viewCalendar = document.getElementById('calendar-' + order.orderId);
                                viewCalendar.addEventListener('click', function () {
                                    vm.onOrderAction({
                                        order: order,
                                        action: 'view calendar'
                                    });
                                });

                                var orderDelete = document.getElementById('orderdelete-' + order.orderId);
                                orderDelete.addEventListener('click', function () {
                                    vm.onOrderAction({
                                        order: order,
                                        action: 'delete order'
                                    })
                                });

                            });


                        }
                    }

                    vm.showOrderPanelFun=showOrderPanelFun;
                    function showOrderPanelFun(path) {

                        $location.path('/jobChainDetails/orders').search({path: path});
                    }

                    vm.$on('bulkOperationCompleted', function (event, args) {
                        angular.forEach(vm.selectedNodes, function (node) {
                            var chkId = '#chk' + node.name.replace(':', '__');
                            $(chkId).attr("checked", false);
                        });
                        vm.selectedNodes = [];
                    })

                }]
        }
    }

})();
