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
                status: '='
            },
            controller: ['OrderService', '$scope', 'CoreService', 'SOSAuth', 'gettextCatalog','$location', function (OrderService, $scope, CoreService, SOSAuth, gettextCatalog,$location) {
                var vm = $scope;
                var ordersData = [];

                function preparePieData(res) {
                    var ordersData = [];

                    var count = 0;
                    for (var prop in res) {
                        if (res[prop] > 0) {
                            var obj = {};
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

    flowDiagram.$inject = ["$compile", "$window", "gettextCatalog", "$timeout","SOSAuth","$rootScope"];
    function flowDiagram($compile, $window, gettextCatalog, $timeout,SOSAuth,$rootScope) {
        return {
            restrict: 'E',
            transclude: true,

            link: function (scope, element,attributes,_, transclude) {
                var cloneElement;
                    var cloneScope;
                var compiledHtml;
                var splitRegex = new RegExp('(.+):(.+)');
                scope.$on("drawJobChainFlowDiagram", function () {
                    arrangeItems();
                });
              scope.arrangeItems = arrangeItems;

                function arrangeItems() {

                    if(SOSAuth && SOSAuth.jobChain){
                         scope.jobChain = JSON.parse(SOSAuth.jobChain);
                    }
                    scope.jobChainData = angular.copy(scope.nestedChain || scope.jobChain);

                    scope.jobChainData.nodes = [];
                    var jobChainData2 = angular.copy(scope.nestedChain || scope.jobChain);
                    var isFirstNode = false;
                    var firstIndex = -1;


                    angular.forEach(scope.nestedChain || scope.jobChain.nodes, function (item, index) {

                        if (item.nextNode) {
                            isFirstNode = true;
                        }
                        angular.forEach(scope.nestedChain || scope.jobChain.nodes, function (item2) {
                            if (item2.nextNode == item.name || item2.errorNode == item.name) {
                                isFirstNode = false;
                            }

                        });

                        if (isFirstNode && !(splitRegex.test(item.name))  ) {

                             if(firstIndex==-1){
                                   firstIndex = index;
                             }else if(firstIndex<index){
                                jobChainData2.nodes[index].secondParent = true;
                                 console.log("second parent here -- "+JSON.stringify(jobChainData2.nodes[index])+" firstIndex "+firstIndex+" index "+index);
                             }


                        }
                    });
                    if (firstIndex == -1) {
                        firstIndex = 0;
                    }

                    scope.jobChainData.nodes[0] = angular.copy(scope.jobChain.nodes[firstIndex]);
                    jobChainData2.nodes.splice(firstIndex, 1);
                    getNext(0);


                    function getNext(index) {
                        var gotNext = false;

                        var item = scope.jobChainData.nodes[index];
                        if (!item) {
                            return;
                        }

                        angular.forEach(jobChainData2.nodes, function (item2, index2) {

                            if (item.nextNode == item2.name) {
                                gotNext = true;
                                var cursor = index;
                                if (splitRegex.test(item.name)) {
                                    if(!item.position || item.position==0){
                                        item.position=1;
                                    }
                                    cursor = cursor + item.position;
                                } else {
                                    cursor++;
                                }
                                scope.jobChainData.nodes.splice(cursor, 0, angular.copy(item2));
                                jobChainData2.nodes.splice(index2, 1);
                            }

                        });


                        if (index + 1 < scope.jobChainData.nodes.length) {
                            index++;
                            getNext(index);
                        } else {
                            checkForSplittedNodes();
                        }


                    }


                    function checkForSplittedNodes() {
                        var proceed = true;
                        angular.forEach(scope.jobChainData.nodes, function (item, index) {
                            var gotSplitted = false;
                            var position = 0;
                            var removables = [];
                            angular.forEach(jobChainData2.nodes, function (item2, index2) {
                                if (splitRegex.test(item2.name) && item.name == splitRegex.exec(item2.name)[1]) {
                                    gotSplitted = true;
                                    proceed = false;
                                    position++;
                                    jobChainData2.nodes[index2].position = position;
                                    scope.jobChainData.nodes.splice(index + 1, 0, angular.copy(item2));
                                    removables.push(index2);
                                }
                            });

                            angular.forEach(removables,function(rm,index3){
                               jobChainData2.nodes.splice(rm - index3, 1);
                            })


                            if (gotSplitted) {
                                getNext(index + 1);
                            }
                        });
                        if (proceed) {
                            if (jobChainData2.nodes && jobChainData2.nodes.length > 0) {
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
                            angular.forEach(scope.jobChainData.nodes, function (item2) {
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
                        angular.forEach(scope.jobChainData.nodes, function (item2) {
                            if (item2.errorNode == item.name) {
                                scope.jobChainData.nodes[index].isErrorNode = true;
                            }
                            if (item2.nextNode == item.name && item2.level <= item.level) {
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
                    var rectH = 121;
                    var avatarW = 32;
                    var margin = 50;
                    scope.coords = [];
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
                    var orderLeft = left;


                        if (scope.jobChainData.fileOrderSources && scope.jobChainData.fileOrderSources.length > 0) {
                            orderLeft = margin + avatarW;
                            rectangleTemplate = rectangleTemplate +
                            '<div id="tbOrderSource" class="table-responsive order-source-table" style="position:absolute;left:' + orderLeft + 'px;top:' + top + 'px;">' +
                            '<table class="table table-hover table-bordered" ><thead > <tr>' +
                            '<th> <span translate>label.sr </span> </th><th> <span translate>label.directory </span> </th>' +
                            '<th> <span translate>label.regularExpression</span> </th></tr></thead>';
                            rectangleTemplate = rectangleTemplate + '<tbody> <tr ng-repeat="source in jobChainData.fileOrderSources"> <td ng-bind="$index+1"></td><td ng-bind="source.directory"> </td><td ng-bind="source.regex"></td></tr>';
                            rectangleTemplate = rectangleTemplate + '</tbody></table></div>';
                        }



                    if (scope.jobChainData.fileOrderSources && scope.jobChainData.fileOrderSources.length > 0) {
                        top = top + rectH + 50;
                    }

                    scope.startId = "start";
                    angular.forEach(scope.jobChainData.nodes, function (item, index) {


                        if (!item) {
                            return;
                        }

                        if (item.name == 'start') {
                            scope.startId = "start" + index;
                        }
                        if (index == 0) {
                            avatarTop = top + rectH / 2 + 5 - avatarW / 2;
                            var startTop = avatarTop - 25;
                            var startLeft = avatarW / 2 - "Start".length * 3;
                            rectangleTemplate = rectangleTemplate + '<span id="lb' + scope.startId + '" class="text-primary text-c" style="position: absolute;left: ' + startLeft + 'px;top: ' + startTop + 'px;z-index=1000;'
                            + '" translate>label.start</span>' +
                            '<span id="' + scope.startId + '" class="avatar w-32 primary text-white" style="position: absolute;left: 0px;top: ' + avatarTop + 'px' + '"> </span>';
                            left = margin + avatarW;
                        }

                        scope.coords[index] = {};
                        scope.coords[index].isParallel = false;
                        scope.coords[index].parallels = 0;
                        scope.coords[index].actual = item.name;
                        scope.coords[index].name = item.name;
                        scope.coords[index].next = item.nextNode;
                        scope.coords[index].error = item.errorNode;
                        scope.coords[index].top = top;
                        scope.coords[index].left = left;
                        if (scope.errorNodes.indexOf(item.name) >= 0 && scope.errorNodeIndex == -1) {
                            scope.errorNodeIndex = index;
                        }

                        if (splitRegex.test(item.name)) {
                            
                            isSplitted = true;
                            scope.coords[index].name = splitRegex.exec(item.name)[2];
                            scope.coords[index].isParallel = true;
                            angular.forEach(scope.coords,function (obj) {

                                if (obj.actual == splitRegex.exec(item.name)[1]) {
                                    obj.parallels = obj.parallels + 1;
                                    scope.coords[index].parent = obj.actual;
                                    scope.coords[index].left = obj.left + rectW + margin;
                                    //
                                    if (obj.parallels == 1) {
                                        scope.coords[index].top = obj.top - rectH / 2 - splitMargin / 2;

                                    }
                                    else if (obj.parallels == 2) {
                                        scope.coords[index].top = obj.top + rectH / 2 + splitMargin / 2;
                                    }
                                    else if (obj.parallels % 2 == 0) {
                                        scope.coords[index].top = obj.top + rectH / 2 + splitMargin / 2 + (rectH + splitMargin) * (obj.parallels - 3);

                                    } else if (obj.parallels % 2 != 0) {
                                        scope.coords[index].top = obj.top - rectH / 2 - splitMargin / 2 - (rectH + splitMargin) * (obj.parallels - 2);

                                    }
                                }
                            })
                        } else if (index > 0) {
                            if(item.secondParent){
                                angular.forEach(scope.coords,function (obj) {
                                if (item.nextNode == obj.name ) {
                                    scope.coords[index].left = obj.left-rectW-margin;
                                    scope.coords[index].parent = obj.actual;
                                    scope.coords[index].top = obj.top + rectH + splitMargin;;
                                }

                            });
                        }else{
                               var matched = false;
                            angular.forEach(scope.coords,function (obj) {

                                if (obj.next == item.name && scope.coords[index].left <= obj.left) {
                                    scope.coords[index].left = obj.left + margin + rectW;
                                    scope.coords[index].parent = obj.actual;
                                    if (!matched) {
                                        scope.coords[index].top = obj.top;
                                    }
                                    matched = true;
                                }

                            });
                            if(!matched){
                                  scope.coords[index].left = scope.coords[index-1].left + margin + rectW;
                                }
                            var errorNodeCls = '';
                            if (item.isErrorNode && scope.jobChainData.nodes[index - 1].nextNode !== item.name) {

                                angular.forEach(scope.coords,function (obj) {
                                    if (scope.coords[index].name == obj.error) {
                                        scope.coords[index].left = obj.left + rectW + margin;
                                        scope.coords[index].top = obj.top + rectH + splitMargin;
                                    }
                                })
                                errorNodeCls = 'error-node';

                            }
                            }

                        }

                        var jobName;

                        var  host = '<div class="text-left text-sm p-t-xs ">' +
                            '<span  ng-if="jobChainData.nodes[\''+index+'\'].processClass || jobChainData.nodes[\''+index+'\'].jobChain.processClass"><i class="fa fa-server "></i><span  class="p-l-sm" ng-bind="jobChainData.nodes[\''+index+'\'].processClass || jobChainData.nodes[\''+index+'\'].jobChain.processClass"></span></span>' +
                            '<span class="pull-right hide" ng-class="{show:jobChainData.nodes[\''+index+'\'].locks}"><i class="fa fa-lock"></i><span class="p-l-sm text-sm" ng-bind-html="formatLock(\''+index+'\')"></span></span>' +
                            '</div>';

                        if (item.job) {
                            scope.jobPaths.push(item.job.path);
                            jobName = item.job.path.substring(item.job.path.lastIndexOf('/') + 1, item.job.path.length);
                            
                            jobName = '<span>' + jobName + '</span>';

                        } else if (item.jobChain) {

                            jobName = '<span><i class="fa fa-chain"></i><span class="p-l-sm">' + item.jobChain.path.substring(item.jobChain.path.lastIndexOf('/') + 1, item.jobChain.path.length) + '</span></span>';
                        }

                        var nodeName = item.name;

                        

                        var chkId = 'chk' + item.name.replace(':', '__');


                        var permissionClass = 'hide';
                        var mL;
                        if (scope.permission.Job.execute.stop || scope.permission.Job.execute.unstop || scope.permission.JobChain.execute.stopJobChainNode
                            || scope.permission.JobChain.execute.processJobChainNode || scope.permission.JobChain.execute.skipJobChainNode || scope.permission.JobChain.execute.processJobChainNode) {
                            permissionClass = 'show-line';
                            mL = 'm-l-md';
                        }

                        var msg = '';
                        if (item.job && item.job.configurationStatus && item.job.configurationStatus.message) {
                            msg = item.job.configurationStatus.message;
                        }

                        var itemType = item.job?'job':'jobChain';
                        var itemPath = item.job?item.job.path:item.jobChain.path;
                        rectangleTemplate = rectangleTemplate +
                        '<div id="' + item.name + '" style=" padding: 0px;position:absolute;left:' + scope.coords[index].left + 'px;top:' + scope.coords[index].top + 'px;"  class="rect ' + errorNodeCls + '" ' +
                        'ng-class="{\'border-crimson\':jobChainData.nodes[\'' + index + '\'].state._text==\'SKIPPED\', \'border-red\':jobChainData.nodes[\'' + index + '\'].job && jobChainData.nodes[\'' + index + '\'].state._text==\'STOPPED\',\'border-dark-orange\':(jobChainData.nodes[\'' + index + '\'].state._text==\'ACTIVE\' && jobChainData.nodes[\'' + index + '\'].job.state._text==\'STOPPED\')||jobChainData.nodes[\'' + index + '\'].jobChain.state._text==\'STOPPED\',\'border-grey\':jobChainData.nodes[\'' + index + '\'].state._text==\'ACTIVE\' && jobChainData.nodes[\'' + index + '\'].job.state._text==\'PENDING\' && !isOrderRunning(\'' + index + '\'),\'border-green\': isOrderRunning(\'' + index + '\')}"> <div style="padding: 10px;padding-bottom: 5px">' +
                        '<div class="block-ellipsis-job">' +
                        '<label class="md-check md-check1 pos-abt ' + permissionClass + '" ><input type="checkbox"  id="' + chkId + '"><i class="ch-purple"></i></label>' +
                        '<span  class="_500 block-ellipsis ' + mL + '" title="' + item.name + '" >' + nodeName + '</span>' +
                        '<div class="btn-group dropdown pull-right abt-dropdown"><a href class=" more-option text-muted" data-toggle="dropdown"><i class="text fa fa-ellipsis-h"></i></a>' +
                        '<div class="dropdown-menu dropdown-ac dropdown-more">' +
                        '<a  class="dropdown-item" ng-click="showConfiguration({type: \''+itemType+'\', path: \'' +itemPath+ '\', name: \'' +item.name+ '\'})" ng-if="permission.Job.view.configuration" translate>button.showConfiguration</a>' +
                        '<a href="" class="hide dropdown-item bg-hover-color" ng-click="stopJob(\'' + index + '\')" ng-class="{\'show\':jobChainData.nodes[\'' + index + '\'].job && jobChainData.nodes[\'' + index + '\'].job.state._text!==\'STOPPED\'}" ng-if="permission.Job.execute.stop" translate>button.stopJob</a>' +
                        '<a href="" class="hide dropdown-item " ng-click="unstopJob(\'' + index + '\')"  ng-class="{\'show\':jobChainData.nodes[\'' + index + '\'].job && jobChainData.nodes[\'' + index + '\'].job.state._text==\'STOPPED\'}" ng-if="permission.Job.execute.unstop" translate>button.unstopJob</a>' +
                       '<a href="" class="hide dropdown-item bg-hover-color" ng-click="stopJobChain(\'' + index + '\')" ng-class="{\'show\':jobChainData.nodes[\'' + index + '\'].jobChain && jobChainData.nodes[\'' + index + '\'].jobChain.state._text!==\'STOPPED\'}" ng-if="permission.JobChain.execute.stop" translate>button.stopJobChain</a>' +
                        '<a href="" class="hide dropdown-item " ng-click="unstopJobChain(\'' + index + '\')"  ng-class="{\'show\':jobChainData.nodes[\'' + index + '\'].jobChain && jobChainData.nodes[\'' + index + '\'].jobChain.state._text==\'STOPPED\'}" ng-if="permission.JobChain.execute.unstop" translate>button.unstopJobChain</a>' +
                        '<a href="" class="hide dropdown-item bg-hover-color " ng-click="stopNode(\'' + index + '\')" ng-class="{\'show\':jobChainData.nodes[\'' + index + '\'].job && jobChainData.nodes[\'' + index + '\'].state._text!==\'STOPPED\'}" ng-if="permission.JobChain.execute.stopJobChainNode" translate>button.stopNode</a>' +
                        '<a href="" class="hide dropdown-item " ng-click="unstopNode(\'' + index + '\')"  ng-class="{\'show\':jobChainData.nodes[\'' + index + '\'].job && jobChainData.nodes[\'' + index + '\'].state._text==\'STOPPED\'}" ng-if="permission.JobChain.execute.processJobChainNode" translate>button.unstopNode</a>' +
                        '<a href="" class="hide dropdown-item bg-hover-color" ng-click="skipNode(\'' + index + '\')" ng-class="{\'show\':jobChainData.nodes[\'' + index + '\'].job && jobChainData.nodes[\'' + index + '\'].state._text!==\'SKIPPED\'}" ng-if="permission.JobChain.execute.skipJobChainNode"  translate>button.skipNode</a>' +
                        '<a href="" class="hide dropdown-item" ng-click="unskipNode(\'' + index + '\')" ng-class="{\'show\':jobChainData.nodes[\'' + index + '\'].job && jobChainData.nodes[\'' + index + '\'].state._text==\'SKIPPED\'}" ng-if="permission.JobChain.execute.processJobChainNode"  translate>button.unskipNode</a>' +
                        '<a href="" class="dropdown-item" ng-click="copyLinkToObject({type:\''+itemType+'\',path:\''+itemPath+'\'})"  translate>button.copyLinkToObject</a>' +
                        '</div></div></div><div class="text-left text-muted p-t-xs block-ellipsis-job"><a ng-if="!jobChainData.nodes[\''+index+'\'].move" class="text-hover-primary" title="' + itemPath + '" ng-click="navigateToItem(\''+index+'\')">' + jobName +
                        '</a>' +
                            '<div class="text-sm p-t-xs" ng-if="jobChainData.nodes[\''+index+'\'].move"><span translate>label.move</span>: <span class="text-black-dk" ng-bind="jobChainData.nodes[\''+index+'\'].move"></span></div>' +
                          '<div class="text-sm p-t-xs" ng-if="jobChainData.nodes[\''+index+'\'].move"><span translate>label.remove</span>: <span class="text-black-dk" ng-bind="jobChainData.nodes[\''+index+'\'].remove"></span></div>' +
                            '<div class="text-sm p-t-xs" ><span translate>label.orders</span>: <span class="text-black-dk" ng-bind="jobChainData.nodes[\''+index+'\'].numOfOrders ||jobChainData.nodes[\''+index+'\'].jobChain.numOfOrders || 0"></span></div><div class="text-sm crimson" translate>' + msg + '</div></div>' + host + '</div >' +
                        '<div class="box-footer b-t" style="position: absolute; bottom: 0; padding: 6px 10px; width: 100%; ">' +
                        '<a title="{{\'button.stopNode\' | translate}}" href ng-click="stopNode(\'' + index + '\')" ng-if="permission.JobChain.execute.stopJobChainNode"' +
                        'class="hide pull-left w-half text-hover-color" ng-class="{\'show-inline\':jobChainData.nodes[\'' + index + '\'].job && jobChainData.nodes[\'' + index + '\'].state._text!==\'STOPPED\'}">' +
                        '<i class="fa fa-stop" ></i> <span translate>button.stopNode</span></a>' +
                        '<a title="{{\'button.unstopNode\' | translate}}" href ng-click="unstopNode(\'' + index + '\')" class="hide pull-left w-half" ng-if="permission.JobChain.execute.processJobChainNode" ng-class="{\'show-inline\':jobChainData.nodes[\'' + index + '\'].job && jobChainData.nodes[\'' + index + '\'].state._text==\'STOPPED\'}">' +
                        '<i class="fa fa-play" ></i> <span translate>button.unstopNode</span></a>' +
                         '<a title="{{\'button.showConfiguration\' | translate}}" href ng-click="showConfiguration({type: \''+itemType+'\', path: \'' +itemPath+ '\', name: \'' +item.name+ '\'})" ng-if="permission.JobChain.view.configuration"' +
                        'class="hide pull-left w-half text-hover-color" ng-class="{\'show-inline\':jobChainData.nodes[\'' + index + '\'].jobChain}">' +
                        '<i class="fa fa-stop" ></i> <span translate>button.showConfiguration</span></a>' +
                        '<a title="{{\'button.stopJobChain\' | translate}}" href ng-click="stopJobChain(\'' + index + '\')" class="hide pull-left w-half" ng-class="{\'show-inline\':jobChainData.nodes[\'' + index + '\'].jobChain && jobChainData.nodes[\'' + index + '\'].jobChain.state._text!=\'STOPPED\'}">' +
                        '<i class="fa fa-play" ></i> <span translate >button.stopJobChain</span></a>' +
                            '<a title="{{\'button.unstopJobChain\' | translate}}" href ng-click="unstopJobChain(\'' + index + '\')" class="hide pull-left w-half"  ng-class="{\'show-inline\':jobChainData.nodes[\'' + index + '\'].jobChain && jobChainData.nodes[\'' + index + '\'].jobChain.state._text==\'STOPPED\'}">' +
                        '<i class="fa fa-play" ></i> <span translate>button.unstopJobChain</span></a>' +
                        '<a title="{{\'button.skipNode\' | translate}}" href class="hide pull-right text-right w-half text-hover-color p-r-xs" ng-click="skipNode(\'' + index + '\')" ng-class="{\'show-inline\':jobChainData.nodes[\'' + index + '\'].job && jobChainData.nodes[\'' + index + '\'].state._text!==\'SKIPPED\'}" ng-if="permission.JobChain.execute.skipJobChainNode"><i class="fa fa-step-forward"></i>  <span translate>button.skipNode</span> </a>' +
                        '<a title="{{\'button.unskipNode\' | translate}}" href class="hide pull-right text-right w-half  p-r-xs" ng-click="unskipNode(\'' + index + '\')" ng-class="{\'show-inline\':jobChainData.nodes[\'' + index + '\'].job && jobChainData.nodes[\'' + index + '\'].job && jobChainData.nodes[\'' + index + '\'].state._text==\'SKIPPED\'}"><i class="fa fa-play" ng-if="permission.JobChain.execute.processJobChainNode"></i>  <span translate>button.unskipNode</span> </a>' +
                        '</div></div>';
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
                        var length = scope.coords.length;
                        scope.coords[length] = {};
                        scope.coords[length].top = top + rectH + 50 + rectH / 2 - avatarW / 2;


                        angular.forEach(scope.coords,function (obj) {
                            if (left < obj.left) {
                                left = obj.left;
                            }
                        });
                        var endErrorNodes = 0;
                        var endSuccessNodes = 0;
                        angular.forEach(scope.jobChainData.endNodes, function (endNode, index) {

                            scope.endNodes.push(endNode.name);
                            var item = scope.jobChainData.endNodes[index];
                            scope.coords[length + index] = {};
                            scope.coords[length+ index].left = left + rectW + margin;
                            scope.coords[length+ index].name=endNode.name;

                            if (scope.errorNodes.indexOf(endNode.name) >= 0) {

                                endErrorNodes++;
                                scope.coords[length+index].top = top + rectH + 50 + rectH  - avatarW / 2;
                                angular.forEach(scope.coords,function (obj) {
                                    if (scope.coords[length + index].top < obj.top + rectH && scope.coords[length + index].name !== obj.name) {
                                        scope.coords[length + index].top = obj.top + rectH;
                                        labelTop = scope.coords[length + index].top - 25;
                                    }

                                });

                                var labelTop = scope.coords[length + index].top - 25;
                                var labelLeft = scope.coords[length + index].left + avatarW / 2 - endNode.name.length * 3;

                                rectangleTemplate = rectangleTemplate + '<div ><span  id="lb' + item.name + '" class="text-danger error-node" ' +
                                'style="position: absolute;left: ' + labelLeft + 'px;top: ' + labelTop + 'px' + '">' + item.name + ' </span>' +
                                '</div>' +
                                '<span id="' + item.name + '" class="avatar w-32 danger text-white error-node" ' +
                                'style="position: absolute;left: ' + scope.coords[length + index].left + 'px;top: ' + scope.coords[length + index].top + 'px' + '"> </span>';

                            } else {
                                endSuccessNodes++;
                                scope.coords[length + index].top = avatarTop;
                                if (endSuccessNodes > 1) {
                                    angular.forEach(scope.coords,function (obj) {

                                        if (scope.coords[length + index].top < obj.top && scope.coords[length+index].name !==obj.name) {
                                            scope.coords[length + index].top = obj.top;
                                        }

                                    });
                                }

                                if (scope.coords[length + index].top == avatarTop && endSuccessNodes > 1) {
                                    scope.coords[length + index].top = scope.coords[length + index].top + rectH / 2 + margin;
                                }
                                var labelTop = scope.coords[length + index].top - 25;
                                var labelLeft = scope.coords[length + index].left + avatarW / 2 - endNode.name.length * 3;

                                rectangleTemplate = rectangleTemplate + getCircularNode(item, labelLeft, labelTop, scope.coords[length].left, scope.coords[length + index].top);
                            }

                            if (index == scope.jobChainData.endNodes.length - 1) {
                                checkHeight();
                            }
                        })
                    }

                    function getCircularNode(item, labelLeft, labelTop, left, top) {
                        var node = '<div id="lb' + item.name + '"  class="nowrap text-success" ' +
                            'style="position: absolute;left: ' + labelLeft + 'px;top: ' + labelTop + 'px' + '">' + item.name + ' </div>' +
                            '<div   class="hide nowrap text-success" ng-class="{show:\'' + item.remove + '\'!==\'undefined\'}"' +
                            'style="position: absolute;left: ' + labelLeft + 'px;top: ' + (labelTop - 15) + 'px' + '">Remove: ' + item.remove + ' </div>' +
                            '<div   class="hide nowrap text-success" ng-class="{show:\'' + item.move + '\'!==\'undefined\'}"' +
                            'style="position: absolute;left: ' + labelLeft + 'px;top: ' + (labelTop - 30) + 'px' + '">Move: ' + item.move + ' </div>' +
                            '<span id="' + item.name + '" class="avatar w-32 success text-white" ' +
                            'style="position: absolute;left: ' + left + 'px;top: ' + top + 'px' + '"> </span>'
                        return node;
                    }

                    function checkHeight() {
                        var mainContainer = document.getElementById("mainContainer");
                        var maxUTop = iTop;
                        angular.forEach(scope.coords,function (obj) {
                            if (maxUTop > obj.top) {
                                maxUTop = obj.top;
                            }
                        });
                        height = window.innerHeight - 300;

                        rectangleTemplate = '<div id="mainContainer" class="p-a"  style="position: relative;width: 100%;" ><div id="zoomCn">' + rectangleTemplate + '</div>' +
                        '</div>';


                           compiledHtml = $compile(rectangleTemplate)(scope);
                         element.append(compiledHtml);


                        if (maxUTop < iTop) {
                            var rect = document.getElementById(scope.startId);
                            var top = rect.style.getPropertyValue('top');
                            top = parseInt(top.substring(0, top.length - 2));
                            rect.style['top'] = top - maxUTop + iTop + 'px';
                            rect = document.getElementById('lb' + scope.startId);
                            var top = rect.style.getPropertyValue('top');
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
                'getJobChainInfo': '&',
                'onAction': '&',
                'showConfiguration': '&',
                'showJob': '&',
                'getJobChain': '&',
                'permission': '=',
                'onOrderAction': '&',
                'coords': '=',
                'fitIntoScreen': '&',
                'fitToScreen': '=',
                'copyLinkToObject':'&'
            },
            controller: ['$scope', '$interval', 'gettextCatalog', '$timeout', '$filter', 'SOSAuth', '$compile', '$location','$rootScope',
                function ($scope, $interval, gettextCatalog, $timeout, $filter, SOSAuth, $compile, $location,$rootScope) {

                    var vm = $scope;
                    vm.left = 0;
                    vm.object = {};
                    var splitRegex = new RegExp('(.+):(.+)');
                    var pDiv;
                    vm.vSpace = 20;
                    vm.hSpace = 20;
                    vm.border = 1;
                    var chkId;
                    vm.show=true;

                    vm.navigateToItem=function navigateToItem(index){
                        var node = vm.jobChainData.nodes[index];
                        if(node.job && node.job.path){
                            vm.showJob({job: node.job.path});
                        }else if(node.jobChain && node.jobChain.path){
                           $location.search('path',node.jobChain.path);
                            $('#mainContainer').remove();
                            $rootScope.$broadcast('showNested');
                        }

                    };

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
                            path: item.job.path,
                            node: item.name,
                            action: 'stop job'
                        })

                    };

                    vm.unstopJob = function (index) {

                        var item = vm.jobChainData.nodes[index];

                        vm.onAction({
                            path: item.job.path,
                            node: item.name,
                            action: 'unstop job'
                        })

                    };


                    vm.stopJobChain = function (index) {

                        var item = vm.jobChainData.nodes[index];

                        vm.onAction({
                            path: item.jobChain.path,
                            action: 'stop jobChain'
                        })

                    };

                    vm.unstopJobChain = function (index) {

                        var item = vm.jobChainData.nodes[index];

                        vm.onAction({
                            path: item.jobChain.path,
                            action: 'unstop jobChain'
                        })

                    };
                    var jobChainPath;
                    var mainContainer;
                    vm.selectedNodes = [];

                    vm.isOrderRunning = function (index) {
                        var running = false;
                        var item = vm.jobChainData.nodes[index];
                        if(!item){
                            return;
                        }
                        if ( !item.orders || item.orders.length == 0) {
                            running = false;
                        } else {
                            angular.forEach(item.orders, function (order) {
                                if (order.processingState && order.processingState._text == 'RUNNING') {
                                    running = true;
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
                            start.setAttribute('id', 'lb'+vm.startId);
                            start.style['left'] = document.getElementById('lb'+vm.startId).offsetLeft + 'px';
                            start.style['top'] = document.getElementById('lb'+vm.startId).offsetTop + 'px';
                            start.style['position'] = 'absolute';
                            start.style['z-index'] = 1000;
                            start.innerHTML = gettextCatalog.getString('label.start');
                            mainContainer.removeChild(document.getElementById('lb'+vm.startId));
                            mainContainer.appendChild(start);
                        }

                        angular.forEach(vm.jobChainData.nodes, function (item, index) {

                            var div1 = document.getElementById(item.name);
                            var div2 = document.getElementById(item.nextNode);
                            var errNode = document.getElementById(item.errorNode);
                            pDiv = undefined;

                            if (index > 0 && splitRegex.test(item.name)) {
                                angular.forEach(vm.coords,function (obj) {
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
                            vm.condition = true;

                            if (index == 0) {
                                var avatar = document.getElementById(vm.startId);
                                createLine(avatar.offsetTop + avatar.clientHeight / 2, 32,
                                    div1.offsetLeft - avatar.offsetLeft - 32, 2, index, item);
                            }

                            if (item.onError == "setback") {
                                var height = 25;
                                var width = 40;
                                var top = div1.offsetTop - height;
                                var left = div1.offsetLeft + div1.clientWidth / 2 + width / 2;
                                createLine(top, left, 2, height, index, item);
                                left = left - width;
                                var node = document.createElement('div');
                                node.innerHTML = '<span class="text-sm" translate>label.setback</span>';
                                node.style['position'] = 'absolute';
                                node.style['top'] = (top - 15) + 'px';
                                node.style['left'] = left + 'px';
                                node.style['width'] = width + 'px';
                                node.style['height'] = height + 'px';
                                mainContainer.appendChild(node);
                                $compile(node)(vm);
                                createLine(top, left, width, 2, index, item);
                                createLine(top, left, 2, height, index, item);
                                node = document.createElement('i');
                                node.setAttribute('id', 'chevron' + item.name);
                                node.setAttribute('class', 'fa fa-angle-down fa-lg text-muted');
                                mainContainer.appendChild(node);
                                $compile(node)(vm);
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
                                    createLine(top, left, width, 2, index, item);
                                    top = div1.offsetTop + div1.clientHeight / 2;
                                    left = left + width;
                                    height = pDiv.offsetTop + pDiv.clientHeight / 2 - top;
                                    createLine(top, left, 2, height, index, item);
                                    width = left - pDiv.offsetLeft - pDiv.clientWidth;
                                    createLine(top, left, width, 2, index, item);
                                } else if (pDiv && pDiv.offsetTop < div1.offsetTop) {
                                    var top = pDiv.offsetTop + pDiv.clientHeight / 2;
                                    var left = pDiv.offsetLeft + pDiv.clientWidth + vm.border;
                                    var width = vm.margin / 2;
                                    createLine(top, left, width, 2, index, item);
                                    left = left + vm.margin / 2;
                                    height = div1.offsetTop + div1.clientHeight / 2 - top;
                                    createLine(top, left, 2, height, index, item);
                                    top = top + height;
                                    width = left - div1.offsetLeft;
                                    createLine(top, left, width, 2, index, item);
                                }

                                if (div1.offsetTop > div2.offsetTop) {
                                    var top = div2.offsetTop + div2.clientHeight / 2;
                                    var left = div2.offsetLeft - vm.margin / 2;
                                    var width = vm.margin / 2;
                                    var height = 2;
                                    createLine(top, left, width, 2, index, item);
                                    height = div1.offsetTop + div1.clientHeight / 2 - top + vm.border;
                                    createLine(top, left, 2, height, index, item);
                                    top = top + height;
                                    width = left - div1.offsetLeft - div1.clientWidth + vm.border;
                                    left = div1.offsetLeft + div1.clientWidth + vm.border;
                                    createLine(top, left, width, 2, index, item);
                                } else if (div2.offsetTop + div2.clientHeight > div1.offsetTop + div1.clientHeight) {
                                    var top = div1.offsetTop + div1.clientHeight / 2;
                                    var left = div1.offsetLeft + div1.clientWidth;
                                    var width = div2.offsetLeft - left - vm.margin / 2;
                                    var height = 1;
                                    createLine(top, left, width, 2, index, item);
                                    left = left + width;
                                    height = div2.offsetTop + div2.clientHeight / 2 - top;
                                    createLine(top, left, 2, height, index, item);
                                    top = top + height;
                                    width = div1.offsetLeft - left;
                                    createLine(top, left, width, 2, index, item);


                                } else {
                                    var parallels = 0;
                                    angular.forEach(vm.coords,function (obj) {
                                        if (obj.actual == item.name) {
                                            parallels = obj.parallels;
                                        }
                                    });
                                    if (vm.jobChainData.nodes.length - 1 > index && parallels > 0) {

                                    } else {

                                        createLine(div2.offsetTop + div2.clientHeight / 2, div1.offsetLeft + div1.clientWidth + vm.border,
                                            div2.offsetLeft - div1.offsetLeft - div1.clientWidth, 2, index, item);
                                    }

                                }

                            }


                            if (errNode) {
                                if (div1.offsetTop + div1.clientHeight < errNode.offsetTop + errNode.clientHeight &&
                                    div1.offsetTop > errNode.offsetTop) {
                                    var top = errNode.offsetTop + errNode.clientHeight / 2;
                                    var left = errNode.offsetLeft - vm.margin / 2;
                                    var width = vm.margin / 2;
                                    var height = 2;
                                    createLine(top, left, width, 2, index, item);
                                    height = div1.offsetTop + div1.clientHeight / 2 - top;
                                    createLine(top, left, 2, height, index, item);
                                    top = top + height;
                                    left = div1.offsetLeft + div1.clientWidth + vm.border;
                                    width = errNode.offsetLeft - vm.margin / 2 - left + vm.border / 2;
                                    createLine(top, left, width, 2, index, item);

                                } else if (errNode.offsetTop + errNode.clientHeight > div1.offsetTop + div1.clientHeight) {

                                    var top = div1.offsetTop + div1.clientHeight + vm.border;
                                    var left = div1.offsetLeft + div1.clientWidth / 2;
                                    var width = errNode.offsetLeft - left - vm.margin / 2;
                                    var height = errNode.offsetTop+errNode.clientHeight/2 >top+vm.vSpace ?vm.vSpace:errNode.clientHeight/2-2;
                                    createErrorLine(top, left, 2, height);
                                    top = top + height;
                                    width = div1.clientWidth / 2 + vm.hSpace;
                                    createErrorLine(top, left, width, 2);
                                    left = left + width;
                                    height = errNode.offsetTop + errNode.clientHeight / 2 - top;
                                    createErrorLine(top, left, 2, height);
                                    width = errNode.offsetLeft - left;

                                    top = top + (height>0?height:0 );
                                    createErrorLine(top, left, width, 2);


                                } else {
                                    var node1 = div1;
                                    var node2 = errNode;
                                    if (div1.offsetLeft > errNode.offsetLeft) {
                                        node1 = errNode;
                                        node2 = div1;
                                    }
                                    var top = node1.offsetTop + node1.clientHeight + vm.border;
                                    var left = node1.offsetLeft + node1.clientWidth / 2;
                                    var width = node2.offsetLeft - left - vm.margin / 2;
                                    var height = vm.vSpace + 10;
                                    createErrorLine(top, left, 2, height);
                                    top = top + height;
                                    width = node2.offsetLeft + node2.clientWidth / 2 - left;
                                    createErrorLine(top, left, width, 2);
                                    left = node2.offsetLeft + node2.clientWidth / 2;
                                    height = top - node2.offsetTop - errNode.clientHeight;
                                    top = node2.offsetTop + node2.clientHeight;
                                    createErrorLine(top, left, 2, height);
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




                            if (vm.jobChainData.nodes.length - 1 == index) {
                                vm.limitNum = 5;
                                vm.showOrderPanel = '';
                               getInfo(0);
                                updateJobChain();
                                $timeout(function () {
                                    vm.fitIntoScreen();
                                }, 500)
                            }
                        });

                        function createLine(top, left, width, height, index, item) {
                            var node = document.createElement('div');
                            node.setAttribute('class', 'h-line next-link ' + (index > 0 && item.isErrorNode && vm.jobChainData.nodes[(index - 1)].nextNode !== item.name ? 'error-node' : ''));
                            if (height == 2) {
                                node.setAttribute('ng-style', '{"height":(fitToScreen?4:2)+"px"}');
                            } else {
                                node.setAttribute('ng-style', '{"width":(fitToScreen?4:2)+"px"}');
                            }
                            node.style['top'] = top + 'px';
                            node.style['left'] = left + 'px';
                            node.style['width'] = width + 'px';
                            node.style['height'] = height + 'px';
                            mainContainer.appendChild(node);
                            $compile(node)(vm);
                        }

                        function createErrorLine(top, left, width, height) {
                            var node = document.createElement('div');
                            node.setAttribute('class', 'error-link');
                            if (height > width) {
                                node.style['border-left'] = '2px dashed #f44455';
                            } else {
                                node.style['border-top'] = '2px dashed #f44455';
                            }

                            node.style['top'] = top + 'px';
                            node.style['left'] = left + 'px';
                            node.style['width'] = width + 'px';
                            node.style['height'] = height + 'px';
                            mainContainer.appendChild(node);
                        }


                    };


                    function getInfo(index) {
                        var node = vm.jobChainData.nodes[index];
                        var nIndex = index;

                        if (node.job && node.job.path && (!node.job.configurationStatus || node.job.configurationStatus.severity != 2)) {
                            vm.getJobInfo({filter: {compact: true, job: node.job.path}}).then(function (res) {
                                if (res.job.locks && res.job.locks.length > 0) {
                                    vm.jobChainData.nodes[nIndex].locks = res.job.locks;
                                }
                                if (res.job.processClass) {
                                    vm.jobChainData.nodes[nIndex].processClass = res.job.processClass;
                                }

                            }, function (err) {

                            })
                        }else if (node.jobChain && node.jobChain.path ) {
                            vm.getJobChainInfo({filter: {compact: false, jobChain: node.jobChain.path}}).then(function (res) {

                                if (res.jobChain.processClass) {
                                    vm.jobChainData.nodes[nIndex].processClass = res.jobChain.processClass;
                                }

                            }, function (err) {

                            })
                        }
                        index++;
                        if (index < vm.jobChainData.nodes.length) {
                            getInfo(index);
                        }


                    }

                    vm.formatLock=function formatLock(index){
                         var node = vm.jobChainData.nodes[index];
                        if (node && node.locks && node.locks[0] && node.locks[0].path && node.locks[0].path.indexOf('/') != -1) {
                                        var extra = node.locks.length  > 1 ? ' + ' + (node.locks.length-1) + ' <a href="#!/resources/locks">more</a>' : '';
                                        return node.locks[0].path.substring(node.locks[0].path.lastIndexOf('/') + 1, node.locks[0].path.length)
                                        + extra;
                                    } else if (node && node.locks && node.locks[0] && node.locks[0].path) {
                                        var extra = node.locks.length  > 1 ? ' + ' + (node.locks.length-1) + ' <a href="#!/resources/locks">more</a>' : '';
                                        return node.locks[0].path + extra;
                                    }

                    };



                    vm.$watch("showErrorNodes", toggleErrorNodes);

                    function toggleErrorNodes(val) {
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


                    vm.$on('reloadJobChain', function () {

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
                                     getInfo(0);
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
                        angular.forEach(vm.jobChainData.nodes, function (node) {
                            nodeCount++;
                            var label = document.getElementById('lbl-order-' + node.name);

                            if (label) {
                                label.parentNode.removeChild(label);
                            }


                            if (node.orders && node.orders.length > 0) {

                                addLabel(node.orders, node.name,node.numOfOrders);
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

                        var diff;
                        vm.calWidth = function (order, state, flag) {
                            var container = document.getElementById('lbl-order-' + state);
                            diff = document.getElementById('diff-' + order);
                            if (container && diff && diff.innerHTML) {
                                diff = diff.innerHTML;

                                if (diff.indexOf('never') != -1 && container.clientHeight == container.scrollHeight) {
                                    if (flag)
                                        return '145px';
                                    else
                                        return '150px';
                                } else if (diff.indexOf('never') != -1 && container.clientHeight !== container.scrollHeight) {
                                    if (flag)
                                        return '135px';
                                    else
                                        return '145px';
                                } else if (container.clientHeight == container.scrollHeight) {
                                    if (flag)
                                        return 209 - (diff.length * 5 + 147) + 'px';
                                    else
                                        return 214 - (diff.length * 5 + 147) + 'px';
                                } else if (container.clientHeight !== container.scrollHeight) {
                                    if (flag)
                                        return 205 - (diff.length * 5 + 146 + 9) + 'px';
                                    else
                                        return 210 - (diff.length * 5 + 146 + 9) + 'px';
                                }
                            } else {
                                return '30px';
                            }
                        };

                        function addLabel(orders, name,numOfOrders) {

                            vm.limitNum = JSON.parse($window.sessionStorage.preferences).maxOrderPerJobchain;
                            var blockEllipsisFlowOrder = 'block-ellipsis-flow-order';
                            if (orders.length > 5) {
                                blockEllipsisFlowOrder = 'block-ellipsis-flow-order1';
                            }
                            angular.forEach(orders, function (order, index) {
                                var node = document.getElementById(name);

                                if (node) {
                                    var container = document.getElementById('lbl-order-' + order.state);
                                    if (container && container.childNodes.length > 0) {
                                        var label = document.createElement('div');
                                        label.setAttribute('class', 'order-cls');
                                        label.innerHTML = getOrderMenu(order, name);
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
                                        label.setAttribute('class', 'orders-block-cls');
                                        label.style['position'] = 'absolute';
                                        label.style['width'] = node.clientWidth + 'px';
                                        label.style['margin-bottom'] = '5px';
                                        label.style['left'] = node.offsetLeft + 'px';
                                        label.style['white-space'] = 'nowrap';
                                        label.innerHTML = '<div class="order-cls" id="orderBlock-' + name + '">' + getOrderMenu(order, name) + '</div>';
                                        mainContainer.appendChild(label);
                                        $compile(label)(vm);
                                        label.style['top'] = node.offsetTop - label.clientHeight - 5 + 'px';
                                        label.style['height'] = 'auto';
                                        label.style['min-height'] = '35px';
                                        label.style['overflow'] = 'auto';
                                    }

                                    if (index == (vm.limitNum - 1) && numOfOrders > orders.length) {
                                        var container = document.getElementById('lbl-order-' + order.state);
                                        var label = document.createElement('div');
                                        label.innerHTML = '<i id="more" class="text-sm cursor text-hover-primary" ng-click="showOrderPanelFun(\'' + order.jobChain + '\')" ><span >' + gettextCatalog.getString("label.showMoreOrders") + '</span><br></i>';
                                        var top = container.offsetTop;
                                        container.appendChild(label);

                                        if (index == 5) {
                                            container.style['max-height'] = container.clientHeight + container.firstChild.clientHeight + 'px';
                                            container.style['top'] = container.offsetTop - container.firstChild.clientHeight + 'px';
                                        }
                                        $compile(label)(vm);
                                        return;
                                    }
                                }

                                function getOrderMenu(order, nodeName) {
                                    var diff = 0;
                                    var time = 0;
                                    if (order.startedAt) {
                                        diff = '+<span id="diff-'+order.orderId+'" time="' + order.startedAt + '"></span>';
                                        time = order.startedAt;
                                    } else {

                                        if ($filter('durationFromCurrent')(undefined, order.nextStartTime) == 'never')
                                            diff = '<span id="diff-'+order.orderId+'">never</span>';
                                        else {
                                            diff = '-<span id="diff-' + order.orderId + '" time="' + order.nextStartTime + '"></span>';
                                        }

                                        if (order.nextStartTime) {
                                            time = order.nextStartTime;
                                        }
                                    }

                                    if(!order.processingState){
                                        order.processingState = {};
                                    }


                                    var menu = '<span class="text-sm"><i id="circle-' + order.orderId + '" class="text-xs fa fa-circle" ng-class="colorFunction(\'' + order.processingState.severity + '\')"></i> ' +

                                        '<span ng-style="{\'max-width\':calWidth(\'' + order.orderId + '\',\'' + order.state + '\',\'' + order.runTimeIsTemporary + '\')}" class="' + blockEllipsisFlowOrder + ' show-block v-m p-r-xs" title="' + order.orderId + '">' + order.orderId + '</span>'
                                        + '<span  class="show-block v-m text-success text-xs"> <small class="fa fa-circle-o text-info hide" ng-class="{\'show-block\':\''+order.runTimeIsTemporary+'\' == \'true\'}"></small> ' + (time!==0?moment(time).tz(JSON.parse($window.sessionStorage.preferences).zone).format(JSON.parse($window.sessionStorage.preferences).dateFormat):'') + '(' + diff + ')</span>'
                                        + '</span>'
                                        + '<div class="btn-group dropdown "><button type="button"  class="btn-drop more-option-h dropdown1" data-toggle="dropdown"><i class="fa fa-ellipsis-h"></i></button>'
                                        + '<div class="dropdown-menu dropdown-ac " role="menu" style="position: fixed;z-index: 9999;">'
                                        + '<a class="hide" id="log-' + order.orderId + '" ng-class="{\'show dropdown-item\':permission.Order.view.orderLog && \'' + order._type + '\'!==\'AD_HOC\' && \'' + order.historyId + '\'!==\'undefined\'}">' + gettextCatalog.getString("button.viewLog") + '</a>'
                                        + '<a class="hide" id="configuration-' + order.orderId + '" ng-class="{\'show dropdown-item\':permission.Order.view.configuration && \'' + order._type + '\'==\'PERMANENT\'}">' + gettextCatalog.getString("button.showConfiguration") + '</a>'
                                        + '<a class="hide" id="ordernow-' + order.orderId + '" ng-class="{\'show dropdown-item\':(\'' + order.processingState + '\'&& (\'' + order.processingState._text + '\'== \'PENDING\' ||\'' + order.processingState._text + '\'== \'SETBACK\'))&& permission.Order.execute.start}">' + gettextCatalog.getString("button.startOrderNow") + '</a>'
                                        + '<a class="hide" id="orderat-' + order.orderId + '" ng-class="{\'show dropdown-item\':(\'' + order.processingState + '\'&& (\'' + order.processingState._text + '\'== \'PENDING\' ||\'' + order.processingState._text + '\'== \'SETBACK\'))&& permission.Order.execute.start}">' + gettextCatalog.getString("button.startOrderat") + '</a>'
                                        + '<a class="hide" id="orderstate-' + order.orderId + '" ng-class="{\'show dropdown-item\':\'' + order.processingState + '\'&& \'' + order.processingState._text + '\'!== \'BLACKLIST\' && permission.Order.change.state}">' + gettextCatalog.getString("button.setOrderState") + '</a>'
                                        + '<a class="hide" id="runtime-' + order.orderId + '" ng-class="{\'show dropdown-item\':\'' + order.processingState + '\'&& \'' + order.processingState._text + '\'!== \'BLACKLIST\' && permission.Order.change.runTime}">' + gettextCatalog.getString("button.setRunTime") + '</a>'
                                        + '<a class="hide" id="resetruntime-' + order.orderId + '" ng-class="{\'show dropdown-item\':\'' + order.processingState + '\'&& \'' + order.processingState._text + '\'!== \'BLACKLIST\' && permission.Order.change.runTime, \'disable-link\':\''+order.runTimeIsTemporary+'\' == \'false\'}">' + gettextCatalog.getString("button.resetRunTime") + '</a>'
                                        + '<a class="hide" id="suspend-' + order.orderId + '" ng-class="{\'show dropdown-item bg-hover-color\':\'' + order.processingState + '\'&& \'' + order.processingState._text + '\'!== \'SUSPENDED\' && \'' + order.processingState._text + '\'!== \'BLACKLIST\'&& permission.Order.execute.suspend}">' + gettextCatalog.getString("button.suspendOrder") + '</a>'
                                        + '<a class="hide" id="resume-' + order.orderId + '" ng-class="{\'show dropdown-item\':(\'' + order.processingState + '\'&& (\'' + order.processingState._text + '\'== \'SUSPENDED\'))&& permission.Order.execute.resume}">' + gettextCatalog.getString("button.resumeOrder") + '</a>'
                                        + '<a class="hide" id="resumeodrprmt-' + order.orderId + '" ng-class="{\'show dropdown-item\':(\'' + order.processingState + '\'&& (\'' + order.processingState._text + '\'== \'SUSPENDED\'))&& permission.Order.execute.resume}">' + gettextCatalog.getString("button.resumeOrderParametrized") + '</a>'
                                        + '<a class="hide" id="resumeodrfrmstate-' + order.orderId + '" ng-class="{\'show dropdown-item\':(\'' + order.processingState + '\'&& (\'' + order.processingState._text + '\'== \'SUSPENDED\'))&& permission.Order.execute.resume}">' + gettextCatalog.getString("button.resumeOrderFromState") + '</a>'
                                        + '<a class="hide" id="orderreset-' + order.orderId + '" ng-class="{\'show dropdown-item\':(\'' + order.processingState + '\'&& (\'' + order.processingState._text + '\'!== \'BLACKLIST\'))&& permission.Order.execute.reset}">' + gettextCatalog.getString("button.resetOrder") + '</a>'
                                        + '<a class="hide" id="orderremove-' + order.orderId + '" ng-class="{\'show dropdown-item bg-hover-color\':(\'' + order.processingState + '\'&& (\'' + order.processingState._text + '\'== \'SETBACK\'))&& permission.Order.execute.removeSetback}">' + gettextCatalog.getString("button.removeOrder") + '</a>'
                                        + '<a class="hide" id="calendar-' + order.orderId + '" ng-class="{\'show dropdown-item \':(\'' + order.processingState + '\'&& (\'' + order.processingState._text + '\'!== \'BLACKLIST\')) && (\'' + order._type + '\'==\'PERMANENT\') && permission.DailyPlan.view.status}">' + gettextCatalog.getString("button.showCalendar") + '</a>'
                                        + '<a class="hide" id="orderdelete-' + order.orderId + '" ng-class="{\'show dropdown-item bg-hover-color \': permission.Order.delete.permanent && (\'' + order._type + '\'!==\'PERMANENT\')}">' + gettextCatalog.getString("button.deleteOrder") + '</a>'
                                        + '<a class="dropdown-item" ng-click="copyLinkToObject({type:\'order\',path:\'' + order.path + '\'})" id="copyLinkToObject-' + order.orderId + '" >' + gettextCatalog.getString("button.copyLinkToObject") + '</a>'
                                        + '</div></div>';
                                    return menu;
                                }

                                var orderLog = document.getElementById('log-' + order.orderId);
                                orderLog.addEventListener('click', function () { vm.onOrderAction({
                                        order: order,
                                        action: 'view log'
                                    });
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

                                var resetruntime = document.getElementById('resetruntime-' + order.orderId);
                                resetruntime.addEventListener('click', function () {
                                    vm.onOrderAction({
                                        order: order,
                                        action: 'reset run time'
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

                    vm.showOrderPanelFun = showOrderPanelFun;
                    function showOrderPanelFun(path) {
                        $location.path('/job_chain_detail/orders').search({path: path});
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
