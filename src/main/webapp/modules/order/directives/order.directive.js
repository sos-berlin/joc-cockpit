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

                vm.width = 500;
                vm.height = 500;
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
                vm.toolTipContentFunction = function() {
                    return function (key, x) {
                        return '<h3>' + key + '</h3>' +
                            '<p>' + d3.format(',f')(x) + '</p>'
                    }
                };


                vm.colorFunction = function () {
                    return function (d, i) {
                        if (d.data.key == 'running') {
                            return '#7ab97a';
                        } else if (d.data.key == 'suspended') {
                            return '#e86680';
                        } else if (d.data.key == 'setbacks') {
                            return '#99b2df';
                        } else if (d.data.key == 'waitingForResource') {
                            return '#ffa366';
                        } else if (d.data.key == 'blacklist') {
                            return '#b966b9';
                        }
                        else if (d.data.key == 'pending') {
                            return 'rgba(255, 195, 0, 0.9)';
                        }
                    };
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
            }]
        };
    }


    flowDiagram.$inject = ["$compile", "$window", "gettextCatalog","$timeout"];
    function flowDiagram($compile, $window, gettextCatalog,$timeout) {
        return {
            restrict: 'E',
            transclude: true,
            link: function (scope, element) {

                scope.$on("drawJobChainFlowDiagram", function () {
                    arrangeItems();
                   // draw();
                });


                function arrangeItems() {
                    scope.jobChainData = angular.copy(scope.jobChain);
                    scope.jobChainData.nodes = [];
                    var jobChainData2 = angular.copy(scope.jobChain);
                    var havingNext = false;
                    var isNext = false;
                    var lastIndex = 0;
                    var isFirstNode = false;
                    var firstIndex = 0;

                    angular.forEach(scope.jobChain.nodes, function (item, index) {

                        if (item.nextNode) {
                            isFirstNode = true;
                        }
                        angular.forEach(scope.jobChain.nodes, function (item2, index2) {
                            if (item2.nextNode == item.name) {
                                isFirstNode = false;

                            }

                        })

                        if (isFirstNode && !(/(.+):(.+)/.test(item.name))) {
                            firstIndex = index;

                        }
                    })


                    scope.jobChainData.nodes[0] = angular.copy(scope.jobChain.nodes[firstIndex]);
                    jobChainData2.nodes.splice(firstIndex, 1);
                    getNext(0);


                    function getNext(index) {
                        var gotNext = false;
                        var item = scope.jobChainData.nodes[index];
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

                        })
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
                                jobChainData2.nodes[index2].removed=true;

                            }
                        })
                        cursor++;
                        if (cursor < scope.jobChainData.nodes.length) {
                            getPrevious(cursor);
                        } else {
                             //console.log("Second iteration "+JSON.stringify(scope.jobChainData));
                            var temp =[];
                            angular.forEach(jobChainData2.nodes, function (item, index) {
                            if (!item.removed) {
                                temp.push(item);

                            }
                        })
                            jobChainData2.nodes=temp;
                            getNext2(0);

                        }
                    }

                    function getNext2(index) {
                        var gotNext = false;
                        var item = scope.jobChainData.nodes[index];
                        havingNext = false;
                        isNext = false;
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
                        })
                        if(!gotNext){
                            index++;
                        }
                        if (index < scope.jobChainData.nodes.length) {
                            getNext2(index);
                        } else if(!gotNext){
                           // console.log("Third iteration "+JSON.stringify(scope.jobChainData));
                            if(jobChainData2.nodes.length>0){
                                scope.jobChainData.nodes = scope.jobChainData.nodes.concat(jobChainData2.nodes);
                            }
                             draw();

                        }
                    }
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
                    scope.borderTop = 5;
                    var splitRegex = new RegExp('(.+):(.+)');
                    var orderLeft = left;


                    angular.forEach(scope.jobChainData.fileOrderSources, function (orderSource, index) {
                        if (index == 0) {
                            orderLeft = margin + avatarW;
                            rectangleTemplate = rectangleTemplate +
                            '<div id="tbOrderSource" class="table-responsive order-source-table" style="position:absolute;left:' + orderLeft + 'px;top:' + top + 'px;">' +
                            '<table class="table table-hover table-bordered" ><thead > <tr>' +
                            '<th> <span translate>label.sr </span> </th><th> <span translate>label.directory </span> </th>' +
                            '<th> <span translate>label.regex</span> </th></tr></thead>'
                        }
                        rectangleTemplate = rectangleTemplate + '<tbody> <tr> <td>' + parseInt(index + 1) + ' </td><td>' + orderSource.directory + ' </td><td>' + orderSource.regex + ' </td></tr>';
                        if (index == scope.jobChainData.fileOrderSources.length - 1) {
                            rectangleTemplate = rectangleTemplate + '</tbody></table></div>';
                        }


                    });

                    if (scope.jobChainData.fileOrderSources && scope.jobChainData.fileOrderSources.length > 0) {


                        top = top + rectH + 50;
                    }


                    angular.forEach(scope.jobChainData.nodes, function (item, index) {
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
                        }

                        //console.log("Name " + item.name);
                        //console.log(splitRegex.test(item.name));
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

                        if (scope.errorNodes.indexOf(item.name) < 0) {
                            if (splitRegex.test(item.name)) {
                                isSplitted = true;
                                coords[index].name = splitRegex.exec(item.name)[2];
                                coords[index].isParallel = true;
                                coords.map(function (obj) {
                                    // //console.log("Matched.... "+splitRegex.exec(item.name)[1]);
                                    if (obj.name == splitRegex.exec(item.name)[1]) {
                                        ////console.log("Matched.... "+obj.name);
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
                                //console.log("Not split " + item.name);
                                var mIndex = -1;
                                coords.map(function (obj) {

                                    if (obj.next == item.name && coords[index].left <= obj.left) {
                                        //console.log("Matched for " + JSON.stringify(obj) + " " + item.name);
                                        coords[index].left = obj.left + margin + rectW;
                                        coords[index].parent = obj.actual;
                                        if (!matched) {
                                            //console.log("set top " + obj.top);
                                            coords[index].top = obj.top;
                                        }
                                        matched = true;

                                    }
                                })
                            }


                            var jobName;

                            var host;

                            if (item.job) {
                                scope.jobPaths.push(item.job.path);
                                jobName = item.job.path.substring(item.job.path.lastIndexOf('/') + 1, item.job.path.length);
                                jobName = jobName.length > 32 ? jobName.substring(0, 32) + '..' : jobName;
                                jobName = '<span><i class="fa fa-file1"></i><span class="">' + jobName + '</span></span>';
                                host = '<div class="text-left text-muted p-t-xs ">' +
                                '<span id="' + 'ppc' + item.name + '" class="show-inline"><i class="fa fa-server "></i><span id="' + 'pc' + item.name + '" class="p-l-sm">' + '--' + '</span></span>' +
                                '<span id="' + 'plk' + item.name + '" class="pull-right show-inline"><i class="fa fa-lock"></i><span id="' + 'lk' + item.name + '" class="p-l-sm text-xs">' + '--' + '</span></span>' +
                                '</div>';
                            } else if (item.jobChain) {
                                jobName = '<span><i class="fa fa-list"></i><span class="p-l-sm">' + item.jobChain.path.substring(item.jobChain.path.lastIndexOf('/') + 1, item.jobChain.path.length) + '</span></span>';
                            }

                            var nodeName = item.name;


                            nodeName = nodeName.length > 26 ? nodeName.substring(0, 26) + '..' : nodeName;


                            // //console.log("For item " + item.name + " " + pLeft + " " + pTop);
                            var chkId = 'chk' + item.name.replace(':', '__');
                            var btnId1 = 'btn1' + item.name.replace(':', '__');
                            var btnId2 = 'btn2' + item.name.replace(':', '__');
                            var btnId3 = 'btn3' + item.name.replace(':', '__');
                            var btnId4 = 'btn4' + item.name.replace(':', '__');
                            var btnId5 = 'btn5' + item.name.replace(':', '__');
                            var btnId6 = 'btn6' + item.name.replace(':', '__');
                            var op1 = "button.stopNode";
                            var op2 = "button.skipNode";
                            var op3 = "button.stopJob";
                            var op5 = "button.stopNode";
                            var op6 = "button.skipNode";
                            var op1Cls = "text-hover-color";
                            var op2Cls = "";
                            var op3Cls = "";
                            var op4Cls = "";
                            var op5Cls = "";
                            var op6Cls = "";


                            item.state = item.state || {};
                            item.job.state = item.job.state || {};
                            item.state._text = item.state._text || "ACTIVE";
                            item.job.state._text = item.job.state._text || "ACTIVE";
                            //item.state._text = "stopped";
                            if (item.state._text.toLowerCase() != "active") {
                                if (item.state._text.toLowerCase() == "skipped") {
                                    op2 = "button.proceedNode";
                                    op6 = "button.proceedNode";

                                } else if (item.state._text.toLowerCase() == "stopped") {
                                    op1 = "button.proceedNode";
                                    op5 = "button.proceedNode";
                                    op1Cls = "";
                                }

                            } else {
                                if (item.job.state._text.toLowerCase() == "running") {
                                } else if (item.job.state._text.toLowerCase() == "pending") {
                                } else if (item.job.state._text.toLowerCase() == "stopped") {

                                    op3 = "button.unstopJob";
                                }
                            }

                            var btnClass = 'fa fa-stop';
                            if (op1 == 'button.proceedNode') {
                                btnClass = 'fa fa-play';
                            }

                            if (op1 == "button.stopNode" && !scope.permission.JobChain.stopJobChainNode) {
                                op1Cls = op1Cls + " disable-link";
                                op5Cls = op5Cls + " disable-link";
                            } else if (op1 == "button.proceedNode" && !scope.permission.JobChain.processJobChainNode) {
                                op1Cls = op1Cls + " disable-link";
                                op5Cls = op5Cls + " disable-link";
                            }

                            if (op2 == "button.skipNode" && !scope.permission.JobChain.skipJobChainNode) {
                                op2Cls = op2Cls + " disable-link";
                                op6Cls = op6Cls + " disable-link";
                            } else if (op2 == "button.proceedNode" && !scope.permission.JobChain.processJobChainNode) {
                                op2Cls = op2Cls + " disable-link";
                                op6Cls = op6Cls + " disable-link";
                            }

                            if (op3 == "button.stopJob" && !scope.permission.Job.stop) {
                                op3Cls = op3Cls + " disable-link";
                            } else if (op3 == "button.unstopJob" && !scope.permission.Job.unstop) {
                                op3Cls = op3Cls + " disable-link";
                            }

                            if (!scope.permission.JobChain.view.configuration) {
                                op4Cls = op4Cls + " disable-link";
                            }

                            rectangleTemplate = rectangleTemplate +
                            '<div id="' + item.name + '" style=" padding: 0px;position:absolute;left:' + coords[index].left + 'px;top:' + coords[index].top + 'px;"  class="rect border-grey" >' +
                            '<div style="padding: 10px;padding-bottom: 5px"><div><span class="md-check md-check1" >' +
                            '<input type="checkbox"  id="' + chkId + '">' +
                            '<i class="ch-purple"></i>' +
                            '<span ><i></i></span><span class="_500">' + nodeName + '</span></span>' +
                            '<div class="btn-group dropdown pull-right abt-dropdown "><a href class=" more-option text-muted" data-toggle="dropdown"><i class="text fa fa-ellipsis-h"></i></a>' +
                            '<div class="dropdown-menu dropdown-ac dropdown-more">' +
                            '<a id="' + btnId4 + '" class="dropdown-item ' + op4Cls + '" translate>button.showConfiguration</a>' +
                            '<a href="" id="' + btnId3 + '"  class="dropdown-item bg-hover-color ' + op3Cls + '" translate>' + op3 + '</a>' +
                            '<a href="" id="' + btnId5 + '"  class="dropdown-item bg-hover-color ' + op5Cls + '" translate>' + op5 + '</a>' +
                            '<a href="" id="' + btnId6 + '"  class="dropdown-item' + op6Cls + '" translate>' + op6 + '</a>' +
                            '</div></div></div>'
                            + '<div class="text-left text-muted p-t-sm "><a class="text-hover-primary" id="navigateToJobBtn_'+item.name+'">' + jobName +
                            '</a></div>' +
                            host +
                            '</div >' +
                            '<div style="position: absolute; bottom: 0; padding: 6px 10px; background: #f5f7fb; border-top: 2px solid #eeeeee;  width: 100%; ">' +
                            '<a href class="pull-left w-half ' + op1Cls + '" id="' + btnId1 + '" ><i class="' + btnClass + '" ></i> <span translate>' + op1 + '</span></a>' +
                            '<a href class=" pull-right text-right w-half ' + op2Cls + ' " id="' + btnId2 + '" ><i class="fa fa-step-forward"></i>  <span translate>' + op2 + '</span> </a>' +
                            '</div>' +
                            '</div>';
                        }
                        if (scope.errorNodes.indexOf(item.errorNode) == -1) {
                            scope.errorNodes.push(item.errorNode);
                        }
                        //console.log("Here name " + JSON.stringify(coords[index]));


                        if (index == scope.jobChainData.nodes.length - 1) {
                            //console.log("At last " + coords[index].left);
                            drawErrorNodes(index);
                        }


                    });

                    function drawErrorNodes() {
                        //console.log("Drawing error nodes " + scope.errorNodeIndex);


                        if (scope.errorNodeIndex != -1) {
                            var item = scope.jobChainData.nodes[scope.errorNodeIndex];
                            coords[scope.errorNodeIndex].left = 0;
                            coords.map(function (obj) {
                                if (coords[scope.errorNodeIndex].left < obj.left) {
                                    coords[scope.errorNodeIndex].top = obj.top + rectH + 50;
                                    coords[scope.errorNodeIndex].left = obj.left;
                                }

                            });
                            for (var i = scope.errorNodeIndex; i < scope.jobChainData.nodes.length; i++) {
                                if (scope.errorNodes.indexOf(scope.jobChainData.nodes[i].nextNode)) {
                                    var chkId = 'chk' + item.name.replace(':', '__');
                                    var btnId1 = 'btn1' + item.name.replace(':', '__');
                                    var btnId2 = 'btn2' + item.name.replace(':', '__');
                                    var btnId3 = 'btn3' + item.name.replace(':', '__');
                                    var btnId4 = 'btn4' + item.name.replace(':', '__');
                                    var btnId5 = 'btn5' + item.name.replace(':', '__');
                                    var btnId6 = 'btn6' + item.name.replace(':', '__');
                                    var op1 = "button.stopNode";
                                    var op2 = "button.skipNode";
                                    var op3 = "button.stopJob";
                                    var op5 = "button.stopNode";
                                    var op6 = "button.skipNode";
                                    var op1Cls = "text-hover-color";
                                    var op2Cls = "";
                                    var op3Cls = "";
                                    var op4Cls = "";
                                    var op5Cls = "";
                                    var op6Cls = "";
                                    var item = scope.jobChainData.nodes[i];


                                    item.state = item.state || {};
                                    item.job.state = item.job.state || {};
                                    item.state._text = item.state._text || "ACTIVE";
                                    item.job.state._text = item.job.state._text || "ACTIVE";
                                    //item.state._text = "stopped";
                                    if (item.state._text.toLowerCase() != "active") {
                                        if (item.state._text.toLowerCase() == "skipped") {
                                            op2 = "button.proceedNode";
                                            op6 = "button.proceedNode";

                                        } else if (item.state._text.toLowerCase() == "stopped") {
                                            op1 = "button.proceedNode";
                                            op5 = "button.proceedNode";
                                            op1Cls = "";
                                        }

                                    } else {
                                        if (item.job.state._text.toLowerCase() == "running") {
                                        } else if (item.job.state._text.toLowerCase() == "pending") {
                                        } else if (item.job.state._text.toLowerCase() == "stopped") {

                                            op3 = "button.unstopJob";
                                        }
                                    }

                                    var btnClass = 'fa fa-stop';
                                    if (op1 == 'button.proceedNode') {
                                        btnClass = 'fa fa-play';
                                    }

                                    if (op1 == "button.stopNode" && !scope.permission.JobChain.stopJobChainNode) {
                                        op1Cls = op1Cls + " disable-link";
                                        op5Cls = op5Cls + " disable-link";
                                    } else if (op1 == "button.proceedNode" && !scope.permission.JobChain.processJobChainNode) {
                                        op1Cls = op1Cls + " disable-link";
                                        op5Cls = op5Cls + " disable-link";
                                    }

                                    if (op2 == "button.skipNode" && !scope.permission.JobChain.skipJobChainNode) {
                                        op2Cls = op2Cls + " disable-link";
                                        op6Cls = op6Cls + " disable-link";
                                    } else if (op2 == "button.proceedNode" && !scope.permission.JobChain.processJobChainNode) {
                                        op2Cls = op2Cls + " disable-link";
                                        op6Cls = op6Cls + " disable-link";
                                    }

                                    if (op3 == "button.stopJob" && !scope.permission.Job.stop) {
                                        op3Cls = op3Cls + " disable-link";
                                    } else if (op3 == "button.unstopJob" && !scope.permission.Job.unstop) {
                                        op3Cls = op3Cls + " disable-link";
                                    }

                                    if (!scope.permission.JobChain.view.configuration) {
                                        op4Cls = op4Cls + " disable-link";
                                    }

                                    var statusCls;
                                    rectangleTemplate = rectangleTemplate +
                                    '<div id="' + item.name + '" style="position:absolute;left:' + coords[scope.errorNodeIndex].left + 'px;top:' + coords[scope.errorNodeIndex].top + 'px"  class="rect error-node" >' +
                                    '<div><div><span class="md-check md-check1" style="padding-left: 20px;">' +
                                    '<input type="checkbox"  id="' + chkId + '">' +
                                    '<i class="ch-purple"></i>' +
                                    '<span ><i class="' + statusCls + '"></i></span><span class="_500">' + item.name + '</span></span>' +
                                    '<div class="btn-group dropdown pull-right abt-dropdown "><a href class=" more-option text-muted" data-toggle="dropdown"><i class="text fa fa-ellipsis-h"></i></a>' +
                                    '<div class="dropdown-menu dropdown-ac dropdown-more">' +
                                    '<a id="' + btnId4 + '" class="dropdown-item ' + op4Cls + '" translate>button.showConfiguration</a>' +
                                    '<a href="" id="' + btnId3 + '"  class="dropdown-item bg-hover-color ' + op3Cls + '" translate>' + op3 + '</a>' +
                                    '<a href="" id="' + btnId5 + '"  class="dropdown-item bg-hover-color ' + op5Cls + '" translate>' + op5 + '</a>' +
                                    '<a href="" id="' + btnId6 + '"  class="dropdown-item' + op6Cls + '" translate>' + op6 + '</a>' +
                                    '</div></div></div>'
                                    + '<div class="text-left text-muted p-t-sm"><span class="">' + item.name + '</span></div>' +
                                    '<div class="text-left text-muted p-t-xs "><span id="' + 'ppc' + item.name + '" class="show"><i class="fa fa-server "></i>' +
                                    '<span id="' + 'pc' + item.name + '" class="p-l-sm"></span></span>' +
                                    '<span class="show-inline" id="' + 'plk' + item.name + '"><i class="fa fa-lock m-l"></i><span id="' + 'lk' + item.name + '" class="p-l-sm text-xs">' + '--' + '</span></span>' +
                                    '</div>' + '</div>' +
                                    '<div style="position: absolute; margin-left: -10px; bottom: 0; padding: 6px 10px; background: #f5f7fb; border-top: 2px solid #eeeeee;  width: 100%; ">' +
                                    '<a href class="pull-left w-half ' + op1Cls + '" id="' + btnId1 + '" ><i class="' + btnClass + '" ></i> <span translate>' + op1 + '</span></a>' +
                                    '<a href class=" pull-right text-right w-half ' + op2Cls + ' " id="' + btnId2 + '" ><i class="fa fa-step-forward"></i>  <span translate>' + op2 + '</span> </a>' +
                                    '</div>' +
                                    '</div>';
                                }

                                if (i == scope.jobChainData.nodes.length - 1) {
                                    drawEndNodes();
                                }
                            }

                        } else {
                            drawEndNodes();
                        }


                    }

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

                        angular.forEach(scope.jobChainData.endNodes, function (endNode, index) {
                            //console.log("Drawing error nodes01");
                            scope.endNodes.push(endNode.name);
                            var item = scope.jobChainData.endNodes[index];
                            coords[length].left = left + rectW + margin;


                            if (scope.errorNodes.indexOf(endNode.name) >= 0) {
                                coords[length].top = top + rectH + 50 + rectH / 2 - avatarW / 2;
                                //console.log("Present top "+coords[length].top);
                                coords.map(function (obj) {
                                    //console.log("Object top "+obj.top);
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
                                coords[length].top = avatarTop;
                                var labelTop = avatarTop - 25;
                                var labelLeft = coords[length].left + avatarW / 2 - endNode.name.length * 3;
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
                        /*console.log("height .. " + height);*/
                        rectangleTemplate = '<div id="mainContainer"  style="position: relative;min-height: ' + height + 'px; height: ' + height + 'px;width: 100%;overflow: auto;" ><div id="zoomCn">' + rectangleTemplate + '</div></div>';
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

                    function drawLinks(){
                        var timeout = $timeout(function(){
                            scope.drawConnections();
                            $timeout.cancel(timeout);
                        },500)
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
                'coords':'='
            },
            controller: ['$scope', '$interval', 'gettextCatalog', '$timeout', '$filter', 'SOSAuth', '$compile','$location',
                function ($scope, $interval, gettextCatalog, $timeout, $filter, SOSAuth,$compile,$location) {
                var vm = $scope;
                vm.left = 0;
                vm.object = {};
                var splitRegex = new RegExp('(.+):(.+)');
                var pDiv;
                vm.hSpace = 8;
                vm.border = 2;
                var chkId;
                var btnId;
                var jobChainPath;
                var mainContainer;
                vm.selectedNodes = [];

                vm.drawConnections = function () {

                    jobChainPath = vm.jobChainData.path;
                    mainContainer = document.getElementById('zoomCn');
                    var errorNode;
                    var finalErrorNode = document.getElementById(vm.errorNodes[vm.errorNodes.length - 1]);
                    if (vm.jobChainData.nodes[vm.errorNodeIndex]) {
                        errorNode = document.getElementById(vm.jobChainData.nodes[vm.errorNodeIndex].name);
                    } else {
                        errorNode = finalErrorNode;
                    }


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
                        //console.log("Avatar left " + avatar.clientWidth + " " + avatar.offsetLeft);
                        node.style['top'] = top - div2.clientHeight - 3 + 'px';
                        node.style['left'] = div2.offsetLeft + div2.clientWidth / 2 + 'px';
                        node.style['width'] = left - div1.clientWidth / 2 - 15 + 'px';
                        node.style['height'] = '2px';
                        mainContainer.appendChild(node);

                        node = document.createElement('div');
                        node.setAttribute('class', 'h-line next-link');
                        //console.log("Avatar left " + avatar.clientWidth + " " + avatar.offsetLeft);
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
                        //  console.log("Node "+item.name);
                        var div1 = document.getElementById(item.name);
                        var div2 = document.getElementById(item.nextNode);
                        pDiv = undefined;
                        // console.log("Item " + item.name);
                        if (index > 0 && splitRegex.test(item.name)) {
                            vm.coords.map(function (obj) {
                                //console.log(" obj "+JSON.stringify(obj)+" "+item.name);
                                if (obj.actual == item.name) {
                                    //console.log("Previous found for " + obj.name + " " + item.name);
                                    pDiv = document.getElementById(obj.parent);
                                    //console.log("Previous found for " + item.name + " " + pDiv);
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
                        //console.log("top: " + y1 + " left: " + x1 + " width: " + div1.clientWidth + " height: " + div2.clientHeight);
                        if (index == 0) {
                            var avatar = document.getElementById(vm.startId);
                            node = document.createElement('div');
                            node.setAttribute('class', 'h-line next-link');
                            //console.log("Avatar left " + avatar.clientWidth + " " + avatar.offsetLeft);
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
                            node.setAttribute('id', 'chevron');
                            node.setAttribute('class', 'fa fa-chevron-down');
                            mainContainer.appendChild(node);

                            var i = document.getElementById('chevron');
                            i.style['position'] = 'absolute';
                            i.style['top'] = top + height - vm.borderTop - i.clientHeight / 2 + 'px';
                            i.style['left'] = left - i.clientWidth / 2 + 'px';


                        }


                        if (vm.errorNodes.indexOf(item.name) < 0) {
                            if (div2) {

                                if (pDiv && pDiv.offsetTop > div1.offsetTop) {
                                    //console.log("Previous is below for " + item.name);
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
                                    //console.log("Previous is above for " + item.name);
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

                                if (div1.offsetTop > div2.offsetTop) {
                                    // console.log("Drawing next for02 " + item.name + " " + item.nextNode);
                                    //console.log("Offset is lesser " + div1.id);
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
                                    node.setAttribute('class', 'h-line next-link');
                                    node.style['top'] = top + 'px';
                                    node.style['left'] = left + 'px';
                                    node.style['width'] = '2px';
                                    node.style['height'] = height + 'px';
                                    mainContainer.appendChild(node);

                                    top = top + height;
                                    left = div1.offsetLeft + div1.clientWidth + vm.border;
                                    width = div2.offsetLeft - vm.margin / 2 - left + vm.border / 2;
                                    node = document.createElement('div');
                                    node.setAttribute('class', 'h-line next-link');
                                    node.style['top'] = top + 'px';
                                    node.style['left'] = left + 'px';
                                    node.style['width'] = width + 'px';
                                    node.style['height'] = '2px';
                                    mainContainer.appendChild(node);

                                } else if (div2.offsetTop + div2.clientHeight > div1.offsetTop + div1.clientHeight) {
                                    //console.log("Drawing next for01 " + item.name + " " + item.nextNode);
                                    var top = div1.offsetTop + div1.clientHeight / 2;
                                    var left = div1.offsetLeft + div1.clientWidth;
                                    var width = div2.offsetLeft - left - vm.margin / 2;
                                    var height = 1;
                                    node = document.createElement('div');
                                    node.setAttribute('class', 'h-line next-link');
                                    node.style['top'] = top + 'px';
                                    node.style['left'] = left + 'px';
                                    node.style['width'] = width + 'px';
                                    node.style['height'] = '2px';
                                    mainContainer.appendChild(node);

                                    left = left + width;

                                    height = div2.offsetTop + div2.clientHeight / 2 - top;
                                    node = document.createElement('div');
                                    node.setAttribute('class', 'h-line next-link');
                                    node.style['top'] = top + 'px';
                                    node.style['left'] = left + 'px';
                                    node.style['width'] = '2px';
                                    node.style['height'] = height + 'px';
                                    mainContainer.appendChild(node);

                                    top = top + height;
                                    width = div1.offsetLeft - left;
                                    node = document.createElement('div');
                                    node.setAttribute('class', 'h-line next-link');
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
                                        //console.log("Drawing next for " + item.name + " " + item.nextNode);
                                        node = document.createElement('div');
                                        node.setAttribute('class', 'h-line next-link');
                                        node.style['top'] = y1 + div1.clientHeight / 2 + vm.borderTop + 'px';
                                        node.style['left'] = x1 + div1.clientWidth + 'px';
                                        node.style['width'] = x2 - x1 - div1.clientWidth + 'px';
                                        node.style['height'] = '2px';
                                        mainContainer.appendChild(node);
                                    }

                                }

                            }

                            if (errorNode) {
                                var firstTop = 0;
                                var splitted = false;
                                //console.log("For item " + item.name);
                                vm.coords.map(function (obj) {
                                    // console.log("Obj "+JSON.stringify(obj));
                                    if (firstTop == 0) {
                                        firstTop = obj.top;
                                    } else if (obj.actual == item.name && (firstTop > obj.top || firstTop < obj.top)) {
                                        //   console.log("firsttop "+firstTop);
                                        splitted = true;
                                    }
                                });

                                if (splitted) {
                                    node = document.createElement('div');
                                    node.setAttribute('class', 'error-link');
                                    node.style['top'] = div1.offsetTop + div1.clientHeight + vm.borderTop + 'px';
                                    node.style['left'] = div1.offsetLeft + div1.clientWidth / 2 + 'px';
                                    node.style['width'] = '2px';
                                    node.style['border-left'] = '2px dashed #f44455';
                                    node.style['height'] = vm.splitMargin / 2 + 'px';
                                    mainContainer.appendChild(node);
                                    node = document.createElement('div');
                                    node.setAttribute('class', 'error-link');
                                    node.style['top'] = div1.offsetTop + div1.clientHeight + vm.splitMargin / 2 + vm.borderTop + 'px';
                                    node.style['left'] = div1.offsetLeft + div1.clientWidth / 2 + 'px';
                                    node.style['border-top'] = '2px dashed #f44455';
                                    node.style['width'] = div1.clientWidth / 2 + vm.margin / 2 + vm.hSpace + 'px';
                                    node.style['height'] = '2px';
                                    mainContainer.appendChild(node);
                                    node = document.createElement('div');
                                    node.setAttribute('class', 'error-link');
                                    node.style['top'] = div1.offsetTop + div1.clientHeight + vm.splitMargin / 2 + vm.borderTop + 'px';
                                    node.style['left'] = div1.offsetLeft + div1.clientWidth + vm.margin / 2 + vm.hSpace + 'px';
                                    node.style['width'] = '2px';
                                    node.style['height'] = errorNode.offsetTop + errorNode.clientHeight / 2 - (div1.offsetTop + div1.clientHeight + 5 * vm.borderTop ) + 'px';
                                    node.style['border-left'] = '2px dashed #f44455';
                                    mainContainer.appendChild(node);
                                    node = document.createElement('div');
                                    node.setAttribute('class', 'error-link');
                                    node.style['top'] = errorNode.offsetTop + errorNode.clientHeight / 2 + 'px';
                                    node.style['left'] = div1.offsetLeft + div1.clientWidth + vm.margin / 2 + vm.hSpace + 'px';
                                    node.style['border-top'] = '2px dashed #f44455';
                                    node.style['width'] = errorNode.offsetLeft - (div1.offsetLeft + div1.clientWidth + vm.margin / 2 + vm.hSpace) + 'px';
                                    node.style['height'] = '2px';
                                    mainContainer.appendChild(node);
                                } else {
                                    node = document.createElement('div');
                                    node.setAttribute('class', 'error-link');
                                    node.style['border-left'] = '2px dashed #f44455';
                                    node.style['top'] = y1 + div1.clientHeight + 5 + 'px';
                                    node.style['left'] = x1 + div1.clientWidth / 2 + 'px';
                                    node.style['width'] = '2px';
                                    if (errorNode.offsetLeft == div1.offsetLeft) {
                                        node.style['height'] = errorNode.offsetTop - (div1.offsetTop + div1.clientHeight + 5) + 'px';
                                    } else {
                                        node.style['height'] = errorNode.offsetTop + errorNode.clientHeight / 2 - (y1 + div1.clientHeight + 5) + 'px';
                                    }

                                    mainContainer.appendChild(node);


                                    var width = errorNode.offsetLeft - (x1 + div1.clientWidth / 2);
                                    //console.log("Width " + width);
                                    var left = x1 + div1.clientWidth / 2;
                                    if (width > 0) {
                                        node = document.createElement('div');
                                        node.setAttribute('class', 'error-link');
                                        node.style['border-top'] = '2px dashed #f44455';
                                        node.style['top'] = errorNode.offsetTop + errorNode.clientHeight / 2 + 'px';
                                        node.style['left'] = left + 'px';
                                        node.style['width'] = width + 'px';
                                        node.style['height'] = '2px';
                                        mainContainer.appendChild(node);
                                    }
                                }


                            }

                        } else {
                            //console.log("Final error node");
                            node = document.createElement('div');
                            node.setAttribute('class', 'error-link');
                            node.style['border-top'] = '2px dashed #f44455';
                            node.style['top'] = errorNode.offsetTop + errorNode.clientHeight / 2 + 'px';
                            node.style['left'] = errorNode.offsetLeft + errorNode.clientWidth + 'px';
                            node.style['width'] = finalErrorNode.offsetLeft - (div1.offsetLeft + div1.clientWidth) + 'px';
                            node.style['height'] = '2px';
                            mainContainer.appendChild(node);

                        }


                        chkId = '#chk' + item.name.replace(':', '__');

                        var chk = document.querySelector(chkId);
                        chk.addEventListener('change', function () {
                            //console.log("It's here");
                            if (chk.checked) {
                                //console.log("It's checked");
                                vm.onAdd({$item: item});
                                vm.selectedNodes.push(item);
                            } else {
                                //console.log("It's unchecked");
                                vm.onRemove({$item: item});
                                angular.forEach(vm.selectedNodes, function (node, index) {
                                    if (node.name == item.name) {
                                        vm.selectedNodes.splice(index, 1);
                                    }
                                })
                            }
                        });

                        //console.log("Name " + item.name + " Replace " + item.name.replace(':', '__'));

                        var btnId1 = '#btn1' + item.name.replace(':', '__');

                        var btn1 = document.querySelector(btnId1);
                        btn1.addEventListener('click', function (e) {

                            if (item.job.path) {
                                if (btn1.textContent.trim() == gettextCatalog.getString('button.stopNode')) {
                                    vm.onAction({
                                        path: jobChainPath,
                                        node: item.name,
                                        action: 'stop node'
                                    })
                                } else if (btn1.textContent.trim() == gettextCatalog.getString('button.proceedNode')) {
                                    vm.onAction({
                                        path: jobChainPath,
                                        node: item.name,
                                        action: 'unstop node'
                                    })
                                }

                            }


                        });

                        var btnId2 = '#btn2' + item.name.replace(':', '__');

                        var btn2 = document.querySelector(btnId2);
                        btn2.addEventListener('click', function (e) {

                            if (item.job.path) {
                                if (btn2.textContent.trim() == gettextCatalog.getString('button.skipNode')) {
                                    vm.onAction({
                                        path: jobChainPath,
                                        node: item.name,
                                        action: 'skip'
                                    })
                                } else if (btn2.textContent.trim() == gettextCatalog.getString('button.proceedNode')) {
                                    vm.onAction({
                                        path: jobChainPath,
                                        node: item.name,
                                        action: 'unskip'
                                    })
                                }

                            }


                        });

                        var btnId = '#btn3' + item.name.replace(':', '__');

                        var btn3 = document.querySelector(btnId);
                        btn3.addEventListener('click', function (e) {

                            if (item.job.path) {
                                if (btn3.textContent.trim() == gettextCatalog.getString('button.stopJob')) {
                                    vm.onAction({
                                        path: item.job.path,
                                        node: item.name,
                                        action: 'stop job'
                                    })
                                } else if (btn3.textContent.trim() == gettextCatalog.getString('button.unstopJob')) {
                                    vm.onAction({
                                        path: item.job.path,
                                        node: item.name,
                                        action: 'unstop job'
                                    })
                                }
                            }
                        });

                        var btnId4 = '#btn4' + item.name.replace(':', '__');

                        var btn4 = document.querySelector(btnId4);
                        btn4.addEventListener('click', function (e) {
                            if (item.job.path) {
                                vm.showConfiguration({type: 'job', path: item.job.path, name: item.name});
                            }
                        });

                        var btnId5 = '#btn5' + item.name.replace(':', '__');

                        var btn5 = document.querySelector(btnId5);
                        btn5.addEventListener('click', function (e) {

                            if (item.job.path) {
                                if (btn5.textContent.trim() == gettextCatalog.getString('button.stopNode')) {
                                    vm.onAction({
                                        path: jobChainPath,
                                        node: item.name,
                                        action: 'stop node'
                                    })
                                } else if (btn5.textContent.trim() == gettextCatalog.getString('button.proceedNode')) {
                                    vm.onAction({
                                        path: jobChainPath,
                                        node: item.name,
                                        action: 'unstop node'
                                    })
                                }

                            }


                        });

                        var btnId6 = '#btn6' + item.name.replace(':', '__');

                        var btn6 = document.querySelector(btnId6);
                        btn6.addEventListener('click', function (e) {

                            if (item.job.path) {
                                if (btn6.textContent.trim() == gettextCatalog.getString('button.skipNode')) {
                                    vm.onAction({
                                        path: jobChainPath,
                                        node: item.name,
                                        action: 'skip'
                                    })
                                } else if (btn6.textContent.trim() == gettextCatalog.getString('button.proceedNode')) {
                                    vm.onAction({
                                        path: jobChainPath,
                                        node: item.name,
                                        action: 'unskip'
                                    })
                                }

                            }


                        });
                        var navigateToJobBtnId = '#navigateToJobBtn_' + item.name;
                        var navigateToJobBtn = document.querySelector(navigateToJobBtnId);

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
                    //console.log("For index " + index);
                    var node = vm.jobChainData.nodes[index];
                    if (node.job && node.job.path) {
                        vm.getJobInfo({filter: {compact: true, job: node.job.path}}).then(function (res) {

                            //console.log("Name " + node.name);
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
                                    var extra = node.locks.length - 1 > 0 ? ' and ' + node.locks.length + ' more' : ''
                                    span.textContent = node.locks[0].path + extra;
                                }
                                //console.log("Lock span " + span.textContent);

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
//console.log("Pc span " + span01.textContent);
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
                    //console.log("Show error nodes " + vm.showErrorNodes);
                    var errorElms = document.getElementsByClassName("error-link");
                    var errorNodes = document.getElementsByClassName("error-node");
                    //console.log("Length " + errorElms.length);
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
                    //console.log("Updating job chain ");
                    vm.jobChain = JSON.parse(SOSAuth.jobChain);
                    var temp = vm.jobChainData.nodes;
                    vm.jobChainData = angular.copy(vm.jobChain);
                    vm.jobChainData.nodes = temp;

                    angular.forEach(vm.jobChain.nodes, function (item, index1) {
                        angular.forEach(vm.jobChainData.nodes, function (item2, index2) {
                            if (item.name == item2.name) {
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
                    if(!mainContainer){
                        return;
                    }
                    angular.forEach(vm.jobChainData.nodes, function (node, index) {
                        nodeCount++;
                        var rect = document.getElementById(node.name);
                        var label = document.getElementById('lbl-order-' + node.name);
                        if (rect) {
                            var btnId1 = '#btn1' + node.name.replace(':', '__');
                            var btn1 = document.querySelector(btnId1);
                            var btnId2 = '#btn2' + node.name.replace(':', '__');
                            var btn2 = document.querySelector(btnId2);
                            var btnId = '#btn3' + node.name.replace(':', '__');
                            var btnId5 = '#btn5' + node.name.replace(':', '__');
                            var btn5 = document.querySelector(btnId5);
                            var btnId6 = '#btn6' + node.name.replace(':', '__');
                            var btn6 = document.querySelector(btnId6);

                            var btn3 = document.querySelector(btnId);
                            if (node.state._text.toLowerCase() != "active") {
                                if (node.state._text.toLowerCase() == "skipped") {
                                    rect.className = rect.className.replace(/border-.*/, 'border-dark-orange');
                                    btn2.innerHTML = '<i class="fa fa-play"></i> ' + gettextCatalog.getString('button.proceedNode');
                                    btn6.innerHTML  =  gettextCatalog.getString('button.proceedNode');
                                    btn2.className = btn2.className.replace('text-hover-color', '');
                                    btn6.className =btn6.className.replace('text-hover-color', '');
                                    if (!vm.permission.JobChain.processJobChainNode) {
                                        btn2.className = btn2.className + " disable-link";
                                        btn6.className = btn6.className + " disable-link";
                                    } else {
                                        btn2.className = btn2.className.replace(/disable-link/g, '');
                                        btn6.className  = btn6.className.replace(/disable-link/g, '');
                                    }
                                    rect.className = rect.className.replace(/border-.*/, 'border-dark-orange');
                                    btn1.innerHTML = '<i class="fa fa-stop"></i> ' + gettextCatalog.getString('button.stopNode');
                                    btn5.innerHTML = gettextCatalog.getString('button.stopNode');
                                    btn1.className = btn1.className + " text-hover-color";
                                    btn5.className = btn5.className + " bg-hover-color";
                                    if (!vm.permission.JobChain.stopJobChainNode) {
                                        btn1.className = btn1.className + " disable-link";
                                        btn5.className = btn5.className + " disable-link";
                                    } else {
                                        btn1.className = btn1.className.replace(/disable-link/g, '');
                                        btn5.className  = btn5.className.replace(/disable-link/g, '');
                                    }

                                } else if (node.state._text.toLowerCase() == "stopped") {
                                    rect.className = rect.className.replace(/border-.*/, 'border-red');

                                    btn1.innerHTML = '<i class="fa fa-play"></i> ' + gettextCatalog.getString('button.proceedNode');
                                    btn5.innerHTML = gettextCatalog.getString('button.proceedNode');
                                    rect.className = rect.className.replace(/border-.*/, 'border-red');
                                    btn1.className = btn1.className.replace(/text-hover-color/g, '');
                                    btn5.className = btn5.className.replace(/text-hover-color/g, '');
                                    if (!vm.permission.JobChain.processJobChainNode) {
                                        btn1.className = btn1.className + " disable-link";
                                        btn5.className  = btn5.className + " disable-link";
                                    } else {
                                        btn1.className = btn1.className.replace(/disable-link/g, '');
                                        btn5.className = btn5.className.replace(/disable-link/g, '');
                                    }
                                   // console.log("btn1 class name " + btn1.className);
                                    btn2.innerHTML = '<i class="fa fa-step-forward"></i> ' + gettextCatalog.getString('button.skipNode');
                                    btn6.innerHTML = gettextCatalog.getString('button.skipNode');
                                    if (!vm.permission.JobChain.skipJobChainNode) {
                                        btn2.className = btn2.className + " disable-link";
                                        btn6.className = btn6.className + " disable-link";
                                    } else {
                                        btn2.className = btn2.className.replace(/disable-link/g, '');
                                        btn6.className = btn6.className.replace(/disable-link/g, '');
                                    }


                                }

                            } else {

                                rect.className = rect.className.replace(/border-.*/, 'border-grey');
                                btn1.innerHTML = '<i class="fa fa-stop"></i> ' + gettextCatalog.getString('button.stopNode');
                                btn5.innerHTML = gettextCatalog.getString('button.stopNode');
                                btn1.className = btn1.className + " text-hover-color";
                                btn5.className  = btn5.className + " bg-hover-color";
                                if (!vm.permission.JobChain.stopJobChainNode) {
                                    btn1.className = btn1.className + " disable-link";
                                    btn5.className = btn5.className + " disable-link";
                                } else {
                                    btn1.className = btn1.className.replace(/disable-link/g, '');
                                    btn5.className = btn5.className.replace(/disable-link/g, '');
                                }
                                btn2.innerHTML = '<i class="fa fa-step-forward"></i> ' + gettextCatalog.getString('button.skipNode');
                                btn6.innerHTML = gettextCatalog.getString('button.skipNode');
                                if (!vm.permission.JobChain.skipJobChainNode) {
                                    btn2.className = btn2.className + " disable-link";
                                    btn6.className = btn6.className + " disable-link";
                                } else {
                                    btn2.className = btn2.className.replace(/disable-link/g, '');
                                    btn6.className = btn6.className.replace(/disable-link/g, '');
                                }
                                btn3.innerHTML = gettextCatalog.getString('button.stopJob');
                                btn3.className = btn3.className + " bg-hover-color";
                                if (!vm.permission.Job.stop) {
                                    btn3.className = btn3.className + " disable-link";
                                } else {
                                    btn3.className = btn3.className.replace(/disable-link/g, '');
                                }


                                if (node.job.state._text.toLowerCase() == "running") {
                                    rect.className = rect.className.replace(/border-.*/, 'border-gey');
                                } else if (node.job.state._text.toLowerCase() == "pending") {
                                    rect.className = rect.className.replace(/border-.*/, 'border-grey');
                                } else if (node.job.state._text.toLowerCase() == "stopped") {
                                    rect.className = rect.className.replace(/border-.*/, 'border-red');
                                    btn3.innerHTML = gettextCatalog.getString('button.unstopJob');
                                    rect.className = rect.className.replace(/border-.*/, 'border-red');
                                    btn3.className = btn3.className.replace('bg-hover-color', '');
                                    if (!vm.permission.Job.unstop) {
                                        btn3.className = btn3.className + " disable-link";
                                    } else {
                                        btn3.className = btn3.className.replace(/disable-link/g, '');
                                    }

                                }
                            }


                        }
                        if (label) {
                            label.parentNode.removeChild(label);
                        }


                        if (node.orders && node.orders.length > 0) {
                            //console.log("In get orders 02 ");
                            addLabel(node.orders, node.name);
                        }
                    });


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
                                 if (index > vm.limitNum ) {
                                     return;
                                 }
                                if (index == vm.limitNum ) {

                                    var container = document.getElementById('lbl-order-' + order.state);
                                    var label = document.createElement('div');
                                    label.innerHTML = '<i id="more" class="hide"><span >' + gettextCatalog.getString("label.showMoreOrders") + '</span><br></i>';
                                    var top = container.offsetTop;
                                    container.appendChild(label);

                                    if (index <= 5) {
                                        container.style['top'] = container.offsetTop - container.firstChild.clientHeight + 'px';
                                    }
                                    if (index == 5) {
                                        container.style['max-height'] = container.clientHeight+container.firstChild.clientHeight + 'px';
                                    }


                                    var more = document.getElementById('more');

                                    if (vm.showOrderPanel != name && orders.length > vm.limitNum) {
                                        more.className = 'show cursor text-xs';

                                    }

                                    more.addEventListener('click', function (e) {
                                        showOrderPanelFun(order.jobChain);
                                    });


                                    return;

                                }
                                var container = document.getElementById('lbl-order-' + order.state);
                                if (container && container.childNodes.length > 0) {
                                    //console.log("Found container and child nodes "+container.childNodes.length);
                                    /*container.style['top'] = node.offsetTop - container.clientHeight + 'px';*/
                                    if (order.processingState._text == 'RUNNING') {
                                        node.className = node.className.replace(/border-.*/, 'border-green');
                                    }

                                    var label = document.createElement('div');
                                    var color = '';
                                    if (order.processingState.severity > -1) {
                                        color = colorFunction(order.processingState.severity);
                                    }
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

                                    label.innerHTML = '<span class="text-sm"><i id="circle-' + order.orderId + '" class="text-xs fa fa-circle ' + color + '"></i> ' +
                                    '<span class="'+blockEllipsisFlowOrder+' show-block v-m p-r-xs" title="'+order.orderId+'">'+ order.orderId+'</span>'
                                        + '<span id="date-' + order.orderId + '"  class="show-block v-m text-success text-xs"> ' + moment(time).tz($window.localStorage.$SOS$ZONE).format($window.localStorage.$SOS$DATEFORMAT) + ' (' + diff + ')</span>'
                                        + '</span>'
                                        + '<div class="btn-group dropdown"><button type="button"  class="btn-drop more-option-h" data-toggle="dropdown"><i class="fa fa-ellipsis-h"></i></button>'
                                        + '<div class="dropdown-menu dropdown-ac" role="menu" style="position: fixed;z-index: 9999;top: ' + node.offsetTop * 2 + 'px; left:' + node.offsetLeft * 1.2 + 'px !important">'
                                        + '<a class="hide" id="log-' + order.orderId + '" >' + gettextCatalog.getString("button.viewLog") + '</a>'
                                        + '<a class="hide" id="configuration-' + order.orderId + '">' + gettextCatalog.getString("button.showConfiguration") + '</a>'
                                        + '<a class="hide" id="ordernow-' + order.orderId + '">' + gettextCatalog.getString("button.startOrderNow") + '</a>'
                                        + '<a class="hide" id="orderat-' + order.orderId + '">' + gettextCatalog.getString("button.startOrderat") + '</a>'
                                        + '<a class="hide" id="orderstate-' + order.orderId + '">' + gettextCatalog.getString("button.setOrderState") + '</a>'
                                        + '<a class="hide" id="runtime-' + order.orderId + '">' + gettextCatalog.getString("button.setRunTime") + '</a>'
                                        + '<a class="hide" id="suspend-' + order.orderId + '">' + gettextCatalog.getString("button.suspendOrder") + '</a>'
                                        + '<a class="hide" id="resume-' + order.orderId + '">' + gettextCatalog.getString("button.resumeOrder") + '</a>'
                                        + '<a class="hide" id="resumeodrprmt-' + order.orderId + '">' + gettextCatalog.getString("button.resumeOrderParametrized") + '</a>'
                                        + '<a class="hide" id="resumeodrfrmstate-' + order.orderId + '">' + gettextCatalog.getString("button.resumeOrderFromState") + '</a>'
                                        + '<a class="hide" id="orderreset-' + order.orderId + '">' + gettextCatalog.getString("button.resetOrder") + '</a>'
                                        + '<a class="hide" id="orderremove-' + order.orderId + '">' + gettextCatalog.getString("button.removeOrder") + '</a>'
                                        + '<a class="hide" id="calendar-' + order.orderId + '">' + gettextCatalog.getString("button.showCalendar") + '</a>'
                                        + '<a class="hide" id="orderdelete-' + order.orderId + '">' + gettextCatalog.getString("button.deleteOrder") + '</a>'
                                        + '</div></div>';
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
                                    if (order.processingState && order.processingState._text == 'RUNNING') {
                                        node.className = node.className.replace(/border-.*/, 'border-green');
                                    }

                                    var color = 'dimgrey';

                                    if (order.processingState && order.processingState.severity > -1) {
                                        color = colorFunction(order.processingState.severity);
                                    }
                                    var label = document.createElement('div');
                                    label.setAttribute('id', 'lbl-order-' + order.state);
                                    label.style['position'] = 'absolute';
                                    label.style['width'] = node.clientWidth + 'px';
                                    label.style['margin-bottom'] = '5px';
                                    label.style['left'] = node.offsetLeft + 'px';
                                    label.style['white-space'] = 'nowrap';
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

                                    label.innerHTML = '<div><span class="text-sm"><i id="circle-' + order.orderId + '" class="text-xs fa fa-circle ' + color + '"></i> ' +
                                    '<span class="'+blockEllipsisFlowOrder+' show-block v-m p-r-xs" title="'+order.orderId+'">'+ order.orderId+'</span>'
                                        + '<span id="date-' + order.orderId + '" class="show-block v-m text-success text-xs"> ' + moment(time).tz($window.localStorage.$SOS$ZONE).format($window.localStorage.$SOS$DATEFORMAT) + ' (' + diff + ')</span>'
                                        + '</span>'
                                        + '<div class="btn-group dropdown"><button type="button"  class="btn-drop more-option-h" data-toggle="dropdown"><i class="fa fa-ellipsis-h"></i></button>'
                                        + '<div class="dropdown-menu dropdown-ac" role="menu" style="position: fixed;z-index: 9999;top: ' + node.offsetTop * 2 + 'px; left:' + node.offsetLeft * 1.2+ 'px !important">'
                                        + '<a class="hide" id="log-' + order.orderId + '">' + gettextCatalog.getString("button.viewLog") + '</a>'
                                        + '<a class="hide" id="configuration-' + order.orderId + '">' + gettextCatalog.getString("button.showConfiguration") + '</a>'
                                        + '<a class="hide" id="ordernow-' + order.orderId + '">' + gettextCatalog.getString("button.startOrderNow") + '</a>'
                                        + '<a class="hide" id="orderat-' + order.orderId + '">' + gettextCatalog.getString("button.startOrderat") + '</a>'
                                        + '<a class="hide" id="orderstate-' + order.orderId + '">' + gettextCatalog.getString("button.setOrderState") + '</a>'
                                        + '<a class="hide" id="runtime-' + order.orderId + '">' + gettextCatalog.getString("button.setRunTime") + '</a>'
                                        + '<a class="hide" id="suspend-' + order.orderId + '">' + gettextCatalog.getString("button.suspendOrder") + '</a>'
                                        + '<a class="hide" id="resume-' + order.orderId + '">' + gettextCatalog.getString("button.resumeOrder") + '</a>'
                                        + '<a class="hide" id="resumeodrprmt-' + order.orderId + '">' + gettextCatalog.getString("button.resumeOrderParametrized") + '</a>'
                                        + '<a class="hide" id="resumeodrfrmstate-' + order.orderId + '">' + gettextCatalog.getString("button.resumeOrderFromState") + '</a>'
                                        + '<a class="hide" id="orderreset-' + order.orderId + '">' + gettextCatalog.getString("button.resetOrder") + '</a>'
                                        + '<a class="hide" id="orderremove-' + order.orderId + '">' + gettextCatalog.getString("button.removeOrder") + '</a>'
                                        + '<a class="hide" id="calendar-' + order.orderId + '">' + gettextCatalog.getString("button.showCalendar") + '</a>'
                                        + '<a class="hide" id="orderdelete-' + order.orderId + '">' + gettextCatalog.getString("button.deleteOrder") + '</a>'
                                        + '</div></div></div>';
                                    mainContainer.appendChild(label);
                                    $compile(label)(vm);
                                    label.style['top'] = node.offsetTop - label.clientHeight - 5 + 'px';
                                    label.style['height'] = 'auto';
                                    label.style['min-height'] = '35px';
                                    label.style['overflow'] = 'auto';
                                }


                            }

                            var orderLog = document.getElementById('log-' + order.orderId);
                            if (vm.permission.Order.view.orderLog && order.historyId) {
                                orderLog.className = 'show dropdown-item';
                            }
                            orderLog.addEventListener('click', function (e) {
                                vm.onOrderAction({
                                    order: order,
                                    action: 'view log'
                                })
                            });


                            var configuration = document.getElementById('configuration-' + order.orderId);

                            if (vm.permission.Order.view.configuration && order._type != 'AD_HOC') {
                                if (configuration) {
                                    configuration.className = 'show dropdown-item';
                                }

                            }

                            configuration.addEventListener('click', function (e) {
                                vm.showConfiguration({type: 'order', path: order.jobChain, name: order.orderId});
                            });

                            var orderNow = document.getElementById('ordernow-' + order.orderId);
                            if ((order.processingState && (order.processingState._text == 'PENDING' || order.processingState._text == 'SETBACK')) && vm.permission.Order.start) {
                                orderNow.className = 'show dropdown-item';
                            }

                            orderNow.addEventListener('click', function (e) {
                                vm.onOrderAction({
                                    order: order,
                                    action: 'start order now'
                                })
                            });

                            var orderAt = document.getElementById('orderat-' + order.orderId);
                            if (order.processingState && (order.processingState._text == 'PENDING' || order.processingState._text == 'SETBACK') && vm.permission.Order.start) {
                                orderAt.className = 'show dropdown-item';
                            }

                            orderAt.addEventListener('click', function (e) {
                                vm.onOrderAction({
                                    order: order,
                                    action: 'start order at'
                                });
                            });

                            var orderState = document.getElementById('orderstate-' + order.orderId);
                            if (order.processingState && (order.processingState._text == 'SUSPENDED' || order.processingState._text == 'PENDING') && vm.permission.Order.setState) {
                                orderState.className = 'show dropdown-item';
                            }

                            orderState.addEventListener('click', function (e) {
                                vm.onOrderAction({
                                    order: order,
                                    action: 'set order state'
                                })
                            });

                            var runTime = document.getElementById('runtime-' + order.orderId);
                            if (order.processingState && (order.processingState._text == 'SUSPENDED' || order.processingState._text == 'PENDING') && vm.permission.Order.setRunTime) {
                                runTime.className = 'show dropdown-item';
                            }

                            runTime.addEventListener('click', function (e) {
                                vm.onOrderAction({
                                    order: order,
                                    action: 'set run time'
                                })
                            });

                            var suspend = document.getElementById('suspend-' + order.orderId);
                            if (order.processingState && (order.processingState._text != 'SUSPENDED' && order.processingState._text != 'BLACKLIST') && vm.permission.Order.suspend) {
                                suspend.className = 'show dropdown-item bg-hover-color';
                            }

                            suspend.addEventListener('click', function (e) {
                                vm.onOrderAction({
                                    order: order,
                                    action: 'suspend order'
                                })
                            });

                            var resume = document.getElementById('resume-' + order.orderId);
                            if (order.processingState && (order.processingState._text == 'SUSPENDED') && vm.permission.Order.resume) {
                                resume.className = 'show dropdown-item';
                            }

                            resume.addEventListener('click', function (e) {
                                vm.onOrderAction({
                                    order: order,
                                    action: 'resume order'
                                })
                            });

                            var resumeOrderParam = document.getElementById('resumeodrprmt-' + order.orderId);
                            if (order.processingState && (order.processingState._text == 'SUSPENDED') && vm.permission.Order.resume) {
                                resumeOrderParam.className = 'show dropdown-item';
                            }

                            resumeOrderParam.addEventListener('click', function (e) {
                                vm.onOrderAction({
                                    order: order,
                                    action: 'resume order with param'
                                })
                            });

                            var resumeOrderFromState = document.getElementById('resumeodrfrmstate-' + order.orderId);
                            if (order.processingState && (order.processingState._text == 'SUSPENDED') && vm.permission.Order.resume) {
                                resumeOrderFromState.className = 'show dropdown-item';
                            }

                            resumeOrderFromState.addEventListener('click', function (e) {
                                vm.onOrderAction({
                                    order: order,
                                    action: 'resume order next state'
                                })
                            });

                            var orderReset = document.getElementById('orderreset-' + order.orderId);
                            if (order.processingState && (order.processingState._text != 'BLACKLIST') && vm.permission.Order.reset) {
                                orderReset.className = 'show dropdown-item';
                            }

                            orderReset.addEventListener('click', function (e) {
                                vm.onOrderAction({
                                    order: order,
                                    action: 'reset order'
                                })
                            });

                            var orderRemove = document.getElementById('orderremove-' + order.orderId);
                            if (order.processingState && (order.processingState._text == 'SETBACK') && vm.permission.Order.removeSetback) {
                                orderRemove.className = 'show dropdown-item bg-hover-color';
                            }

                            orderRemove.addEventListener('click', function (e) {
                                vm.onOrderAction({
                                    order: order,
                                    action: 'remove order'
                                })
                            });

                            var viewCalendar = document.getElementById('calendar-' + order.orderId);
                            if (order.processingState && order.processingState._text != 'BLACKLIST' && order._type != 'AD_HOC' && vm.permission.DailyPlan.view.status) {
                                viewCalendar.className = 'show dropdown-item';
                            }

                            viewCalendar.addEventListener('click', function (e) {
                                vm.onOrderAction({
                                    order: order,
                                    action: 'view calendar'
                                });
                            });

                            var orderDelete = document.getElementById('orderdelete-' + order.orderId);
                            if (order._type == 'AD_HOC' && vm.permission.Order.delete.permanent) {
                                orderDelete.className = 'show dropdown-item bg-hover-color';
                            }

                            orderDelete.addEventListener('click', function (e) {
                                vm.onOrderAction({
                                    order: order,
                                    action: 'delete order'
                                })
                            });

                        });


                    }
                }

                function showOrderPanelFun(path) {
                    
                    $location.path('/jobChainDetails/orders').search({path: path});
                }

                vm.$on('bulkOperationCompleted', function (event, args) {
                    //console.log("Bulk operation completed " + JSON.stringify(args));
                    if (args.operation == 'stopJobs' && args.status == 'success') {
                        angular.forEach(vm.selectedNodes, function (node) {
                            var btnId3 = '#btn3' + node.name.replace(':', '__');
                            var btn3 = document.querySelector(btnId3);
                            var div1 = document.getElementById(node.name);
                            btn3.innerHTML = gettextCatalog.getString('button.unstopJob');
                            div1.className = div1.className.replace(/border-.*/, 'border-red');
                            btn3.className = btn3.className.replace('bg-hover-color', '');
                        })
                    } else if (args.operation == 'unstopJobs' && args.status == 'success') {
                        angular.forEach(vm.selectedNodes, function (node) {
                            var btnId3 = '#btn3' + node.name.replace(':', '__');
                            var btn3 = document.querySelector(btnId3);
                            var div1 = document.getElementById(node.name);
                            btn3.innerHTML = gettextCatalog.getString('button.stopJob');
                            div1.className = div1.className.replace(/border-.*/, 'border-grey');
                            btn3.className = btn3.className + " bg-hover-color";
                        })
                    }
                    else if (args.operation == 'stopNodes' && args.status == 'success') {
                        angular.forEach(vm.selectedNodes, function (node) {
                            var btnId1 = '#btn1' + node.name.replace(':', '__');
                            /*var btnId2 = '#btn2' + node.name.replace(':', '__');*/
                            var btn1 = document.querySelector(btnId1);
                            /*var btn2 = document.querySelector(btnId2);*/
                            var div1 = document.getElementById(node.name);
                            btn1.innerHTML = '<i class="fa fa-play"></i> ' + gettextCatalog.getString('button.proceedNode');
                            div1.className = div1.className.replace(/border-.*/, 'border-red');
                            btn1.className = btn1.className.replace('text-hover-color', '');
                            /*btn2.innerHTML = '<i class="fa fa-step-forward"></i> ' + gettextCatalog.getString('button.skipNode');*/
                        })
                    } else if (args.operation == 'unstopNodes' && args.status == 'success') {
                        angular.forEach(vm.selectedNodes, function (node) {
                            var btnId1 = '#btn1' + node.name.replace(':', '__');
                            var btn1 = document.querySelector(btnId1);
                            var div1 = document.getElementById(node.name);
                            btn1.innerHTML = '<i class="fa fa-stop"></i> ' + gettextCatalog.getString('button.stopNode');
                            div1.className = div1.className.replace(/border-.*/, 'border-grey');
                            btn1.className = btn1.className + " text-hover-color";
                        })

                    } else if (args.operation == 'skipNodes' && args.status == 'success') {
                        angular.forEach(vm.selectedNodes, function (node) {
                            /* var btnId1 = '#btn1' + node.name.replace(':', '__');*/
                            var btnId2 = '#btn2' + node.name.replace(':', '__');
                            /*var btn1 = document.querySelector(btnId1);*/
                            var btn2 = document.querySelector(btnId2);
                            var div1 = document.getElementById(node.name);
                            btn2.innerHTML = '<i class="fa fa-play"></i> ' + gettextCatalog.getString('button.proceedNode');
                            btn2.className = btn2.className.replace('text-hover-color', '');
                            div1.className = div1.className.replace(/border-.*/, 'border-red');
                            /*btn1.innerHTML = '<i class="fa fa-stop"></i> ' + gettextCatalog.getString('button.stopNode');*/
                            /*btn1.className = btn1.className + " text-hover-color";*/
                        })
                    } else if (args.operation == 'unskipNodes' && args.status == 'success') {
                        angular.forEach(vm.selectedNodes, function (node) {
                            var btnId2 = '#btn1' + node.name.replace(':', '__');
                            var btn2 = document.querySelector(btnId2);
                            var div1 = document.getElementById(node.name);
                            btn2.innerHTML = '<i class="fa fa-step-forward"></i> ' + gettextCatalog.getString('button.skipNode');
                            div1.className = div1.className.replace(/border-.*/, '');
                        })

                    }

                    angular.forEach(vm.selectedNodes, function (node) {
                        var chkId = '#chk' + node.name.replace(':', '__');
                        //console.log("chkId " + chkId);
                        $(chkId).attr("checked", false);
                    });
                    vm.selectedNodes = [];
                })

            }]
        }
    }


})();
