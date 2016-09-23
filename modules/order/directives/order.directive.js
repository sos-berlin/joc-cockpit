/**
 * Created by sourabhagrawal on 30/5/16.
 */

(function () {
    'use strict';
    angular.module('app')
        .directive('pieChartComponent', pieChartComponent)
        .directive('flowDiagram', flowDiagram)
        .directive('orderFlowDiagram', orderFlowDiagram);

    function pieChartComponent() {
        return {
            restrict: 'E',
            templateUrl: 'modules/order/views/pie-chart.html',
            scope: {
                width: '@',
                height: '@'
            },
            controller: ['OrderService', '$scope', '$rootScope', 'CoreService', 'SOSAuth', function (OrderService, $scope, $rootScope, CoreService, SOSAuth) {
                var vm = $scope;
                var ordersData = [];

                function preparePieData(res) {
                    var count = 0;
                    for (var prop in res.orders) {
                        var obj = {};
                        obj.key = prop;
                        obj.y = res.orders[prop];
                        ordersData.push(obj);
                        count++;
                        if (count === Object.keys(res.orders).length) {
                            vm.ordersData = ordersData;
                        }
                    }
                }

                if (SOSAuth.jobChain) {
                    vm.isLoading = false;

                    vm.jobChain = JSON.parse(SOSAuth.jobChain);
                }

                function getSnapshot() {
                    if (SOSAuth.scheduleIds) {
                        var filter = {};
                        if (vm.jobChain) {
                            filter.orders = [];
                            filter.orders.push({jobChain: vm.jobChain.path});
                        }
                        vm.schedulerIds = JSON.parse(SOSAuth.scheduleIds);
                        filter.jobschedulerId = vm.schedulerIds.selected;
                        OrderService.getSnapshot(filter).then(function (res) {
                            vm.snapshot = res;
                            preparePieData(res);
                        }, function (err) {

                        });
                    }
                }


                getSnapshot();


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


    flowDiagram.$inject = ["$compile", "$rootScope"];

    function flowDiagram($compile, $rootScope) {
        return {
            restrict: 'E',
            transclude: true,
            link: function (scope, element, attrs, model) {

                scope.$watch("jobChain", function (data) {
                    //console.log("Normal watch called01 " + data);
                    if (!data) {
                        return;
                    }
                    draw();
                });
                function draw() {
                    var left = 0;
                    var distance = 250;
                    scope.width = window.outerWidth;
                    scope.height = window.outerHeight;


                    //console.log("Items " + scope.jobChain.nodes.length + " " + scope.width);
                    var rectW = 230;
                    var rectH = 115;
                    var avatarW = 32;
                    var margin = 50;
                    var coords = [];
                    scope.coords = coords;
                    scope.margin = margin;
                    var rectangleTemplate = '';
                    var iTop = 100;
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




                    angular.forEach(scope.jobChain.fileOrderSources, function (orderSource, index) {
                        if (index == 0) {
                            orderLeft = margin + avatarW;
                            rectangleTemplate = rectangleTemplate +
                            '<div id="tbOrderSource" class="table-responsive order-source-table" style="position:absolute;left:' + orderLeft + 'px;top:' + top + 'px;">' +
                            '<table class="table table-hover table-bordered"><thead > <tr>' +
                            '<th> <span translate>Sr. </span> </th><th> <span translate>Directory </span> </th>' +
                            '<th> <span translate>Regex</span> </th></tr></thead>'
                        }
                        rectangleTemplate = rectangleTemplate + '<tbody> <tr> <td>' + parseInt(index + 1) + ' </td><td>' + orderSource.directory + ' </td><td>' + orderSource.regex + ' </td></tr>';
                        if (index == scope.jobChain.fileOrderSources.length - 1) {
                            rectangleTemplate = rectangleTemplate + '</tbody></table></div>';
                        }


                    })

                    if (scope.jobChain.fileOrderSources && scope.jobChain.fileOrderSources.length > 0) {


                        top = top + rectH + 50;
                    }


                    angular.forEach(scope.jobChain.nodes, function (item, index) {

                        if (index == 0) {
                            avatarTop = top + rectH / 2 + 5 - avatarW / 2;
                            var startTop = avatarTop - 25;
                            var startLeft = avatarW / 2 - "Start".length * 3;
                            rectangleTemplate = rectangleTemplate + '<span id="lbStart" class="text-primary text-c" style="position: absolute;left: ' + startLeft + 'px;top: ' + startTop + 'px;z-index=1000;'
                            + '" translate>label.start</span>' +
                            '<span id="start" class="avatar w-32 primary text-white" style="position: absolute;left: 0px;top: ' + avatarTop + 'px' + '"> </span>';
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
                                console.log("Not split " + item.name);
                                coords.map(function (obj) {
                                    if (obj.next == item.name && coords[index].left <= obj.left) {
                                        console.log("Matched for " + JSON.stringify(obj) + " " + item.name);
                                        coords[index].left = obj.left + margin + rectW;
                                        coords[index].parent = obj.actual;
                                        if (!matched) {
                                            console.log("set top " + obj.top);
                                            coords[index].top = obj.top;
                                        }
                                        matched = true;

                                    }
                                })
                            }


                            var jobName;
                            var lock;
                            var host;

                            if (item.job) {
                                jobName = item.job.path.substring(item.job.path.lastIndexOf('/') + 1, item.job.path.length);
                                jobName = jobName.length > 32 ? jobName.substring(0, 32) + '..' : jobName;
                                jobName = '<span><i class="fa fa-file1"></i><span class="">' + jobName + '</span></span>';
                                host = '<div class="text-left text-muted p-t-xs ">' +
                                '<span id="' + 'ppc' + item.name + '" class="show"><i class="fa fa-server "></i><span id="' + 'pc' + item.name + '" class="p-l-sm">' + '--' + '</span></span>' +
                                '<span id="' + 'plk' + item.name + '" class="pull-right show"><i class="fa fa-lock"></i><span id="' + 'lk' + item.name + '" class="p-l-sm">' + '--' + '</span></span>' +
                                '</div>';
                                lock = '<div class="text-left text-muted p-t-xs "><i class="fa fa-lock"></i><span id="' + 'lk' + item.name + '" class="p-l-sm">' + '--' + '</span></div>';
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
                            //console.log("ID is " + chkId);
                            var rectCls = "border-grey";
                            //console.log("Item " + JSON.stringify(item));
                            var op1 = "button.stopNode";
                            var op2 = "button.skipNode";
                            var op3 = "button.stopJob";
                            var op1Cls = "text-hover-color";

                            item.state = item.state || {};
                            item.job.state = item.job.state || {};
                            item.state._text = item.state._text || "ACTIVE";
                            item.job.state._text = item.job.state._text || "ACTIVE";
                            //item.state._text = "stopped";
                            if (item.state._text.toLowerCase() != "active") {
                                if (item.state._text.toLowerCase() == "skipped") {
                                    op2 = "button.proceedNode";
                                    rectCls = "border-red";
                                } else if (item.state._text.toLowerCase() == "stopped") {
                                    op1 = "button.proceedNode";
                                    op1Cls = "";
                                    rectCls = "border-red";
                                }

                            } else {
                                if (item.job.state._text.toLowerCase() == "running") {
                                } else if (item.job.state._text.toLowerCase() == "stopped") {
                                } else if (item.job.state._text.toLowerCase() == "stopped") {
                                    rectCls = "border-red";
                                }
                            }

                            rectangleTemplate = rectangleTemplate +
                            '<div id="' + item.name + '" style=" padding: 0px;position:absolute;left:' + coords[index].left + 'px;top:' + coords[index].top + 'px;"  class="rect ' + rectCls + '" >' +
                            '<div style="padding: 10px;padding-bottom: 5px"><div><span class="md-check md-check1" >' +
                            '<input type="checkbox"  id="' + chkId + '">' +
                            '<i class="ch-purple"></i>' +
                            '<span ><i></i></span><span class="_500">' + nodeName + '</span></span>' +
                            '<div class="btn-group dropdown pull-right abt-dropdown "><a href class=" more-option text-muted" data-toggle="dropdown"><i class="text fa fa-ellipsis-v"></i></a>' +
                            '<div class="dropdown-menu dropdown-ac dropdown-more">' +
                            '<a target="_blank" href="#/showConfiguration?type=job&path=' + item.job.path + '" id="' + btnId4 + '" class="dropdown-item" translate>button.showConfiguration</a>' +
                            '<a href="" id="' + btnId3 + '"  class="dropdown-item bg-hover-color" translate>' + op3 + '</a>' +
                            '</div></div></div>'
                            + '<div class="text-left text-muted p-t-sm ">' + jobName +
                            '</div>' +
                            host +
                            '</div >' +
                            '<div style="position: absolute; bottom: 0; padding: 6px 10px; background: #f5f7fb; border-top: 2px solid #eeeeee;  width: 100%; ">' +
                            '<a href class="text-left ' + op1Cls + '" id="' + btnId1 + '" ><i class="fa fa-stop"></i> <span translate>' + op1 + '</span></a>' +
                            '<a href class=" pull-right " id="' + btnId2 + '" ><i class="fa fa-step-forward"></i>  <span translate>' + op2 + '</span> </a>' +
                            '</div>' +
                            '</div>';
                        }
                        if (scope.errorNodes.indexOf(item.errorNode) < 0) {
                            scope.errorNodes.push(item.errorNode);
                        }
                        //console.log("Here name " + JSON.stringify(coords[index]));


                        if (index == scope.jobChain.nodes.length - 1) {
                            //console.log("At last " + coords[index].left);
                            drawErrorNodes(index);
                        }


                    });

                    function drawErrorNodes() {
                        //console.log("Drawing error nodes " + scope.errorNodeIndex);


                        if (scope.errorNodeIndex != -1) {
                            var item = scope.jobChain.nodes[scope.errorNodeIndex];
                            coords[scope.errorNodeIndex].left = 0;
                            coords.map(function (obj) {
                                if (coords[scope.errorNodeIndex].left < obj.left) {
                                    coords[scope.errorNodeIndex].top = obj.top + rectH + 50;
                                    coords[scope.errorNodeIndex].left = obj.left;
                                }

                            });
                            for (var i = scope.errorNodeIndex; i < scope.jobChain.nodes.length; i++) {
                                if (scope.errorNodes.indexOf(scope.jobChain.nodes[i].nextNode)) {
                                    var chkId = 'chk' + item.name.replace(':', '__');
                                    var btnId1 = 'btn1' + item.name.replace(':', '__');
                                    var btnId2 = 'btn2' + item.name.replace(':', '__');
                                    var btnId3 = 'btn3' + item.name.replace(':', '__');
                                    var btnId4 = 'btn4' + item.name.replace(':', '__');
                                    var statusCls;
                                    rectangleTemplate = rectangleTemplate +
                                    '<div id="' + item.name + '" style="position:absolute;left:' + coords[scope.errorNodeIndex].left + 'px;top:' + coords[scope.errorNodeIndex].top + 'px"  class="rect error-node" >' +
                                    '<div><div><span class="md-check md-check1" style="padding-left: 20px;">' +
                                    '<input type="checkbox"  id="' + chkId + '">' +
                                    '<i class="ch-purple"></i>' +
                                    '<span ><i class="' + statusCls + '"></i></span><span class="_500">' + item.name + '</span></span>' +
                                    '<div class="btn-group dropdown pull-right abt-dropdown "><a href class=" more-option text-muted" data-toggle="dropdown"><i class="text fa fa-ellipsis-v"></i></a>' +
                                    '<div class="dropdown-menu dropdown-ac dropdown-more">' +
                                    '<a target="_blank" href="" id="' + btnId4 + '" class="dropdown-item" translate>button.showConfiguration</a>' +
                                    '<a href="" id="' + btnId3 + '"  class="dropdown-item bg-hover-color" translate>button.stopJob</a>' +
                                    '</div></div></div>'
                                    + '<div class="text-left text-muted p-t-sm"><span class="">' + item.name + '</span></div>' +
                                    '<div class="text-left text-muted p-t-xs "><span id="' + 'ppc' + item.name + '" class="show"><i class="fa fa-server "></i>' +
                                    '<span id="' + 'pc' + item.name + '" class="p-l-sm"></span></span>' +
                                    '<span class="show" id="' + 'plk' + item.name + '"><i class="fa fa-lock m-l"></i><span id="' + 'lk' + item.name + '" class="p-l-sm">' + '--' + '</span></span>' +
                                    '</div>' + '</div>' +
                                    '<div style="position: absolute; margin-left: -10px; bottom: 0; padding: 6px 10px; background: #f5f7fb; border-top: 2px solid #eeeeee;  width: 100%; ">' +
                                    '<a href class=" text-left text-hover-color" id="' + btnId1 + '" > <i class="fa fa-stop"></i> {{\'button.stopNode\' | translate}}</a>' +
                                    '<a href class=" pull-right " id="' + btnId2 + '" > <i class="fa fa-step-forward"></i> {{\'button.skipNode\' | translate}}</a>' +
                                    '</div>' +
                                    '</div>';
                                }

                                if (i == scope.jobChain.nodes.length - 1) {
                                    drawEndNodes();
                                }
                            }

                        } else {
                            drawEndNodes();
                        }


                    }

                    function drawEndNodes() {

                        if (!scope.jobChain.endNodes || scope.jobChain.endNodes.length == 0) {
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

                        angular.forEach(scope.jobChain.endNodes, function (endNode, index) {
                            //console.log("Drawing error nodes01");
                            scope.endNodes.push(endNode.name);
                            var item = scope.jobChain.endNodes[index];
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

                            if (index == scope.jobChain.endNodes.length - 1) {
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
                        //console.log("Height .. " + height);
                        rectangleTemplate = '<div id="mainContainer"  style="position: relative;min-height: ' + height + 'px; height: ' + height + 'px;width: 100%;overflow: auto;" ><div id="zoomCn">' + rectangleTemplate + '</div></div>';
                        var compiledHtml = $compile(rectangleTemplate)(scope);
                        element.append(compiledHtml);
                        if (maxUTop < iTop) {
                            var rect = document.getElementById('start');
                            var top = rect.style.getPropertyValue('top');
                            top = parseInt(top.substring(0, top.length - 2));
                            rect.style.setProperty('top', +top - maxUTop + iTop + 'px');
                            var rect = document.getElementById('lbStart');
                            var top = rect.style.getPropertyValue('top');
                            top = parseInt(top.substring(0, top.length - 2));
                            rect.style.setProperty('top', +top - maxUTop + iTop + 'px');
                            angular.forEach(scope.jobChain.nodes, function (item, index) {
                                rect = document.getElementById(item.name);
                                top = rect.style.getPropertyValue('top');
                                top = parseInt(top.substring(0, top.length - 2));
                                rect.style.setProperty('top', +top - maxUTop + iTop + 'px');
                                if (index == scope.jobChain.nodes.length - 1) {
                                    if (!scope.jobChain.nodes || scope.jobChain.nodes.length == 0) {
                                        scope.drawConnections();
                                    }

                                }
                            })
                            angular.forEach(scope.jobChain.endNodes, function (endNode, sIndex) {
                                rect = document.getElementById(endNode.name);
                                if (rect) {
                                    top = rect.style.getPropertyValue('top');
                                    top = parseInt(top.substring(0, top.length - 2));
                                    rect.style.setProperty('top', +top - maxUTop + iTop + 'px');
                                }
                                rect = document.getElementById('lb' + endNode.name);
                                if (rect) {
                                    top = rect.style.getPropertyValue('top');
                                    top = parseInt(top.substring(0, top.length - 2));
                                    rect.style.setProperty('top', +top - maxUTop + iTop + 'px');
                                }

                                if (scope.jobChain.endNodes.length - 1 == sIndex) {
                                    scope.drawConnections();
                                }
                            })

                            angular.forEach(scope.jobChain.fileOrderSources, function (orderSource, index) {

                                rect = document.getElementById(orderSource.directory);
                                if (rect) {
                                    top = rect.style.getPropertyValue('top');
                                    top = parseInt(top.substring(0, top.length - 2));
                                    rect.style.setProperty('top', +top - maxUTop + iTop + 'px');
                                }
                            })


                        } else {
                            scope.drawConnections();
                        }


                    }


                }
            },
            scope: {
                jobChain: '=',
                'onAdd': '&',
                'onRemove': '&',
                'showErrorNodes': '=',
                'getJobInfo': '&',
                'onAction': '&',
                'orders': '='
            },
            controller: ['$scope', '$timeout', 'orderByFilter', function ($scope, $timeout, orderBy) {
                var vm = $scope;
                vm.left = 0;
                vm.distance = 250;
                vm.object = {};
                var splitRegex = new RegExp('(.+):(.+)');
                var pDiv;
                vm.hSpace = 8;
                vm.border = 2;
                var chkId;
                var btnId;
                var jobChainPath;
                var mainContainer;


                vm.drawConnections = function () {
                    jobChainPath = vm.jobChain.path;
                    mainContainer = document.getElementById('zoomCn');
                    var errorNode;
                    var finalErrorNode = document.getElementById(vm.errorNodes[vm.errorNodes.length - 1]);
                    if (vm.jobChain.nodes[vm.errorNodeIndex]) {
                        errorNode = document.getElementById(vm.jobChain.nodes[vm.errorNodeIndex].name);
                    } else {
                        errorNode = finalErrorNode;
                    }


                    if (vm.jobChain.fileOrderSources && vm.jobChain.fileOrderSources.length > 0) {
                        var node;
                        if (!vm.jobChain.nodes || !vm.jobChain.nodes[0]) {
                            return;
                        }
                        var div1 = document.getElementById('tbOrderSource');
                        var div2 = document.getElementById('start');
                        var div3 = document.getElementById(vm.jobChain.nodes[0].name);


                        var top = div1.offsetTop + div1.clientHeight;
                        var left = div1.offsetLeft + div1.clientWidth / 2;
                        var height = (div3.offsetTop - div1.offsetTop - div1.clientHeight) / 2;
                        node = document.createElement('div');
                        node.setAttribute('class', 'h-line next-link');
                        //console.log("Avatar left " + avatar.clientWidth + " " + avatar.offsetLeft);
                        node.style.setProperty('top', top + 'px');
                        node.style.setProperty('left', left + 'px');
                        node.style.setProperty('width', '2px');
                        node.style.setProperty('height', height + 2+'px');
                        mainContainer.appendChild(node);

                        node = document.createElement('div');
                        node.setAttribute('class', 'h-line next-link');
                        //console.log("Avatar left " + avatar.clientWidth + " " + avatar.offsetLeft);
                        node.style.setProperty('top', top + height + 'px');
                        node.style.setProperty('left', div2.offsetLeft + div2.clientWidth / 2 + 'px');
                        node.style.setProperty('width', left - div2.offsetLeft - div2.clientWidth / 2 +1+ 'px');
                        node.style.setProperty('height', '2px');
                        mainContainer.appendChild(node);

                        node = document.createElement('div');
                        node.setAttribute('class', 'h-line next-link');
                        //console.log("Avatar left " + avatar.clientWidth + " " + avatar.offsetLeft);
                        node.style.setProperty('top', top + height + 'px');
                        node.style.setProperty('left', div2.offsetLeft + div2.clientWidth / 2 + 'px');
                        node.style.setProperty('width', 2 + 'px');
                        node.style.setProperty('height', div2.offsetTop - top - height + 'px');
                        mainContainer.appendChild(node);


                    }

                    angular.forEach(vm.jobChain.nodes, function (item, index) {

                        var div1 = document.getElementById(item.name);
                        var div2 = document.getElementById(item.nextNode);
                        pDiv = undefined;
                        console.log("Item " + item.name);
                        if (index > 0 && splitRegex.test(item.name)) {
                            vm.coords.map(function (obj) {
                                //console.log(" obj "+JSON.stringify(obj)+" "+item.name);
                                if (obj.actual == item.name) {
                                    console.log("Previous found for " + obj.name + " " + item.name);
                                    pDiv = document.getElementById(obj.parent);
                                    console.log("Previous found for " + item.name + " " + pDiv);

                                }

                            })

                        }


                        var x1 = div1.offsetLeft;
                        var y1 = div1.offsetTop;


                        var x1 = div1.offsetLeft;
                        var y1 = div1.offsetTop;
                        var x2 = 0;
                        var y2 = 0;
                        var node;

                        if (div2) {
                            x2 = div2.offsetLeft;
                            y2 = div2.offsetTop;
                        }
                        ////console.log("top: " + y1 + " left: " + x1 + " width: " + div1.clientWidth + " height: " + div2.clientHeight);
                        if (index == 0) {
                            var avatar = document.getElementById('start');
                            node = document.createElement('div');
                            node.setAttribute('class', 'h-line next-link');
                            //console.log("Avatar left " + avatar.clientWidth + " " + avatar.offsetLeft);
                            node.style.setProperty('top', y1 + div1.clientHeight / 2 + vm.borderTop + 'px');
                            node.style.setProperty('left', 32 + 'px');
                            node.style.setProperty('width', div1.offsetLeft - avatar.offsetLeft - 32 + 'px');
                            node.style.setProperty('height', '2px');
                            mainContainer.appendChild(node);
                        }

                        if (item.onError == "setback") {
                            var height = 30;
                            var width = 40;
                            var top = div1.offsetTop - height;
                            var left = div1.offsetLeft + div1.clientWidth / 2 + width / 2

                            node = document.createElement('div');
                            node.setAttribute('class', 'h-line next-link');
                            node.style.setProperty('top', top + 'px');
                            node.style.setProperty('left', left + 'px');
                            node.style.setProperty('width', '2px');
                            node.style.setProperty('height', height + 'px');
                            mainContainer.appendChild(node);


                            left = left - width;
                            node = document.createElement('div');
                            node.setAttribute('class', 'h-line next-link');
                            node.style.setProperty('top', top + 'px');
                            node.style.setProperty('left', left + 'px');
                            node.style.setProperty('width', width + 'px');
                            node.style.setProperty('height', '2px');
                            mainContainer.appendChild(node);


                            node = document.createElement('div');
                            node.setAttribute('class', 'h-line next-link');
                            node.style.setProperty('top', top + 'px');
                            node.style.setProperty('left', left + 'px');
                            node.style.setProperty('width', '2px');
                            node.style.setProperty('height', height + 'px');
                            mainContainer.appendChild(node);

                            node = document.createElement('i');
                            node.setAttribute('id', 'chevron');
                            node.setAttribute('class', 'fa fa-chevron-down');
                            mainContainer.appendChild(node);

                            var i = document.getElementById('chevron');
                            i.style.setProperty('position', 'absolute');
                            i.style.setProperty('top', top + height - vm.borderTop - i.clientHeight / 2 + 'px');
                            i.style.setProperty('left', left - i.clientWidth / 2 + 'px');


                        }


                        if (vm.errorNodes.indexOf(item.name) < 0) {
                            if (div2) {

                                if (pDiv && pDiv.offsetTop > div1.offsetTop) {
                                    console.log("Previous is below for " + item.name);
                                    var top = pDiv.offsetTop + pDiv.clientHeight / 2;
                                    var left = pDiv.offsetLeft + pDiv.clientWidth + vm.border;
                                    width = vm.margin / 2;
                                    node = document.createElement('div');
                                    node.setAttribute('class', 'h-line next-link');
                                    node.style.setProperty('top', top + 'px');
                                    node.style.setProperty('left', left + 'px');
                                    node.style.setProperty('width', width + 'px');
                                    node.style.setProperty('height', '2px');
                                    mainContainer.appendChild(node);

                                    top = div1.offsetTop + div1.clientHeight / 2;
                                    left = div1.offsetLeft - vm.margin / 2;
                                    height = pDiv.offsetTop + pDiv.clientHeight / 2 - top;
                                    node = document.createElement('div');
                                    node.setAttribute('class', 'h-line next-link');
                                    node.style.setProperty('top', top + 'px');
                                    node.style.setProperty('left', left + 'px');
                                    node.style.setProperty('width', '2px');
                                    node.style.setProperty('height', height + 'px');
                                    mainContainer.appendChild(node);


                                    width = left - pDiv.offsetLeft - pDiv.clientWidth;
                                    node = document.createElement('div');
                                    node.setAttribute('class', 'h-line next-link');
                                    node.style.setProperty('top', top + 'px');
                                    node.style.setProperty('left', left + 'px');
                                    node.style.setProperty('width', width + 'px');
                                    node.style.setProperty('height', '2px');
                                    mainContainer.appendChild(node);
                                } else if (pDiv && pDiv.offsetTop < div1.offsetTop) {
                                    console.log("Previous is above for " + item.name);
                                    var top = pDiv.offsetTop + pDiv.clientHeight / 2;
                                    var left = pDiv.offsetLeft + pDiv.clientWidth + vm.border;
                                    var width = vm.margin / 2;
                                    node = document.createElement('div');
                                    node.setAttribute('class', 'h-line next-link');
                                    node.style.setProperty('top', top + 'px');
                                    node.style.setProperty('left', left + 'px');
                                    node.style.setProperty('width', width + 'px');
                                    node.style.setProperty('height', '2px');
                                    mainContainer.appendChild(node);

                                    left = left + vm.margin / 2;
                                    height = div1.offsetTop + div1.clientHeight / 2 - top;

                                    node = document.createElement('div');
                                    node.setAttribute('class', 'h-line next-link');
                                    node.style.setProperty('top', top + 'px');
                                    node.style.setProperty('left', left + 'px');
                                    node.style.setProperty('width', '2px');
                                    node.style.setProperty('height', height + 'px');
                                    mainContainer.appendChild(node);

                                    top = top + height;
                                    width = left - div1.offsetLeft;


                                    node = document.createElement('div');
                                    node.setAttribute('class', 'h-line next-link');
                                    node.style.setProperty('top', top + 'px');
                                    node.style.setProperty('left', left + 'px');
                                    node.style.setProperty('width', width + 'px');
                                    node.style.setProperty('height', '2px');
                                    mainContainer.appendChild(node);
                                }

                                if (div1.offsetTop > div2.offsetTop) {
                                    console.log("Drawing next for02 " + item.name + " " + item.nextNode);
                                    //console.log("Offset is lesser " + div1.id);
                                    var top = div2.offsetTop + div2.clientHeight / 2;
                                    var left = div2.offsetLeft - vm.margin / 2;
                                    var width = vm.margin / 2;
                                    var height = 2;

                                    node = document.createElement('div');
                                    node.setAttribute('class', 'h-line next-link');
                                    node.style.setProperty('top', top + 'px');
                                    node.style.setProperty('left', left + 'px');
                                    node.style.setProperty('width', width + 'px');
                                    node.style.setProperty('height', '2px');
                                    mainContainer.appendChild(node);


                                    height = div1.offsetTop + div1.clientHeight / 2 - top;

                                    node = document.createElement('div');
                                    node.setAttribute('class', 'h-line next-link');
                                    node.style.setProperty('top', top + 'px');
                                    node.style.setProperty('left', left + 'px');
                                    node.style.setProperty('width', '2px');
                                    node.style.setProperty('height', height + 'px');
                                    mainContainer.appendChild(node);

                                    top = top + height;
                                    left = div1.offsetLeft + div1.clientWidth + vm.border;
                                    width = div2.offsetLeft - vm.margin / 2 - left + vm.border / 2;
                                    node = document.createElement('div');
                                    node.setAttribute('class', 'h-line next-link');
                                    node.style.setProperty('top', top + 'px');
                                    node.style.setProperty('left', left + 'px');
                                    node.style.setProperty('width', width + 'px');
                                    node.style.setProperty('height', '2px');
                                    mainContainer.appendChild(node);

                                } else if (div2.offsetTop + div2.clientHeight > div1.offsetTop + div1.clientHeight) {
                                    console.log("Drawing next for01 " + item.name + " " + item.nextNode);
                                    var top = div1.offsetTop + div1.clientHeight / 2;
                                    var left = div1.offsetLeft + div1.clientWidth;
                                    var width = div2.offsetLeft - left - vm.margin / 2;
                                    var height = 1;
                                    node = document.createElement('div');
                                    node.setAttribute('class', 'h-line next-link');
                                    node.style.setProperty('top', top + 'px');
                                    node.style.setProperty('left', left + 'px');
                                    node.style.setProperty('width', width + 'px');
                                    node.style.setProperty('height', '2px');
                                    mainContainer.appendChild(node);

                                    left = left + width;

                                    height = div2.offsetTop + div2.clientHeight / 2 - top;
                                    node = document.createElement('div');
                                    node.setAttribute('class', 'h-line next-link');
                                    node.style.setProperty('top', top + 'px');
                                    node.style.setProperty('left', left + 'px');
                                    node.style.setProperty('width', '2px');
                                    node.style.setProperty('height', height + 'px');
                                    mainContainer.appendChild(node);

                                    top = top + height;
                                    width = div1.offsetLeft - left;
                                    node = document.createElement('div');
                                    node.setAttribute('class', 'h-line next-link');
                                    node.style.setProperty('top', top + 'px');
                                    node.style.setProperty('left', left + 'px');
                                    node.style.setProperty('width', width + 'px');
                                    node.style.setProperty('height', '2px');
                                    mainContainer.appendChild(node);


                                } else {
                                    var parallels = 0;
                                    vm.coords.map(function (obj) {
                                        if (obj.actual == item.name) {
                                            parallels = obj.parallels;
                                        }
                                    });
                                    if (vm.jobChain.nodes.length - 1 > index && parallels > 0) {

                                    } else {
                                        console.log("Drawing next for " + item.name + " " + item.nextNode);
                                        node = document.createElement('div');
                                        node.setAttribute('class', 'h-line next-link');
                                        node.style.setProperty('top', y1 + div1.clientHeight / 2 + vm.borderTop + 'px');
                                        node.style.setProperty('left', x1 + div1.clientWidth + 'px');
                                        node.style.setProperty('width', x2 - x1 - div1.clientWidth + 'px');
                                        node.style.setProperty('height', '2px');
                                        mainContainer.appendChild(node);
                                    }

                                }

                            }

                            if (errorNode) {
                                var firstTop = 0;
                                var splitted = false;
                                console.log("For item " + item.name);
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
                                    node.style.setProperty('top', div1.offsetTop + div1.clientHeight + vm.borderTop + 'px');
                                    node.style.setProperty('left', div1.offsetLeft + div1.clientWidth / 2 + 'px');
                                    node.style.setProperty('width', '2px');
                                    node.style.setProperty('border-left', '2px dashed #f44455');
                                    node.style.setProperty('height', vm.splitMargin / 2 + 'px');
                                    mainContainer.appendChild(node);
                                    node = document.createElement('div');
                                    node.setAttribute('class', 'error-link');
                                    node.style.setProperty('top', div1.offsetTop + div1.clientHeight + vm.splitMargin / 2 + vm.borderTop + 'px');
                                    node.style.setProperty('left', div1.offsetLeft + div1.clientWidth / 2 + 'px');
                                    node.style.setProperty('border-top', '2px dashed #f44455');
                                    node.style.setProperty('width', div1.clientWidth / 2 + vm.margin / 2 + vm.hSpace + 'px');
                                    node.style.setProperty('height', '2px');
                                    mainContainer.appendChild(node);
                                    node = document.createElement('div');
                                    node.setAttribute('class', 'error-link');
                                    node.style.setProperty('top', div1.offsetTop + div1.clientHeight + vm.splitMargin / 2 + vm.borderTop + 'px');
                                    node.style.setProperty('left', div1.offsetLeft + div1.clientWidth + vm.margin / 2 + vm.hSpace + 'px');
                                    node.style.setProperty('width', '2px');
                                    node.style.setProperty('height', errorNode.offsetTop + errorNode.clientHeight / 2 - (div1.offsetTop + div1.clientHeight + 5 * vm.borderTop ) + 'px');
                                    node.style.setProperty('border-left', '2px dashed #f44455');
                                    mainContainer.appendChild(node);
                                    node = document.createElement('div');
                                    node.setAttribute('class', 'error-link');
                                    node.style.setProperty('top', errorNode.offsetTop + errorNode.clientHeight / 2 + 'px');
                                    node.style.setProperty('left', div1.offsetLeft + div1.clientWidth + vm.margin / 2 + vm.hSpace + 'px');
                                    node.style.setProperty('border-top', '2px dashed #f44455');
                                    node.style.setProperty('width', errorNode.offsetLeft - (div1.offsetLeft + div1.clientWidth + vm.margin / 2 + vm.hSpace) + 'px');
                                    node.style.setProperty('height', '2px');
                                    mainContainer.appendChild(node);
                                } else {
                                    node = document.createElement('div');
                                    node.setAttribute('class', 'error-link');
                                    node.style.setProperty('border-left', '2px dashed #f44455');
                                    node.style.setProperty('top', y1 + div1.clientHeight + 5 + 'px');
                                    node.style.setProperty('left', x1 + div1.clientWidth / 2 + 'px');
                                    node.style.setProperty('width', '2px');
                                    if (errorNode.offsetLeft == div1.offsetLeft) {
                                        node.style.setProperty('height', errorNode.offsetTop - (div1.offsetTop + div1.clientHeight + 5) + 'px');
                                    } else {
                                        node.style.setProperty('height', errorNode.offsetTop + errorNode.clientHeight / 2 - (y1 + div1.clientHeight + 5) + 'px');
                                    }

                                    mainContainer.appendChild(node);


                                    var width = errorNode.offsetLeft - (x1 + div1.clientWidth / 2);
                                    //console.log("Width " + width);
                                    var left = x1 + div1.clientWidth / 2;
                                    if (width > 0) {
                                        node = document.createElement('div');
                                        node.setAttribute('class', 'error-link');
                                        node.style.setProperty('border-top', '2px dashed #f44455');
                                        node.style.setProperty('top', errorNode.offsetTop + errorNode.clientHeight / 2 + 'px');
                                        node.style.setProperty('left', left + 'px');
                                        node.style.setProperty('width', width + 'px');
                                        node.style.setProperty('height', '2px');
                                        mainContainer.appendChild(node);
                                    }
                                }


                            }

                        } else {
                            //console.log("Final error node");
                            node = document.createElement('div');
                            node.setAttribute('class', 'error-link');
                            node.style.setProperty('border-top', '2px dashed #f44455');
                            node.style.setProperty('top', errorNode.offsetTop + errorNode.clientHeight / 2 + 'px');
                            node.style.setProperty('left', errorNode.offsetLeft + errorNode.clientWidth + 'px');
                            node.style.setProperty('width', finalErrorNode.offsetLeft - (div1.offsetLeft + div1.clientWidth) + 'px');
                            node.style.setProperty('height', '2px');
                            mainContainer.appendChild(node);

                        }


                        chkId = '#chk' + item.name.replace(':', '__');
                        var chk = document.querySelector(chkId);
                        chk.addEventListener('change', function () {
                            //console.log("It's here");
                            if (chk.checked) {
                                //console.log("It's checked");
                                vm.onAdd({$item: item});
                            } else {
                                //console.log("It's unchecked");
                                vm.onRemove({$item: item})
                            }
                        });

                        //console.log("Name " + item.name + " Replace " + item.name.replace(':', '__'));

                        var btnId1 = '#btn1' + item.name.replace(':', '__');

                        var btn1 = document.querySelector(btnId1);
                        btn1.addEventListener('click', function () {

                            console.log("It's clicked02 " + btn1.id.replace('__', ':') + "&" + btn1.textContent.trim());

                            if (item.job.path) {
                                if (btn1.textContent.trim() == 'Stop Node') {
                                    vm.onAction({
                                        path: jobChainPath,
                                        node: item.name,
                                        action: 'stop node'
                                    }).then(function (res) {
                                        //console.log("Response " + JSON.stringify(res));
                                        btn1.innerHTML = '<i class="fa fa-play"></i> Proceed Node';
                                        div1.className = div1.className.replace(/border-.*/, 'border-red');
                                        btn1.className = btn1.className.replace('text-hover-color', '');
                                        btn2.innerHTML = '<i class="fa fa-step-forward"></i> Skip Node';
                                    }, function (err) {
                                        //console.log("Error " + JSON.stringify(err));
                                    })
                                } else if (btn1.textContent.trim() == 'Proceed Node') {
                                    vm.onAction({
                                        path: jobChainPath,
                                        node: item.name,
                                        action: 'unstop node'
                                    }).then(function (res) {
                                        //console.log("Response " + JSON.stringify(res));
                                        btn1.innerHTML = '<i class="fa fa-stop"></i> Stop Node';
                                        div1.className = div1.className.replace(/border-.*/, 'border-grey');
                                        btn1.className = btn1.className + " text-hover-color";
                                    }, function (err) {
                                        //console.log("Error " + JSON.stringify(err));
                                    });
                                }

                            }


                        });

                        var btnId2 = '#btn2' + item.name.replace(':', '__');

                        var btn2 = document.querySelector(btnId2);
                        btn2.addEventListener('click', function () {

                            //console.log("It's clicked03 " + btn2.id.replace('__', ':') + "&" + btn2.textContent.trim());

                            if (item.job.path) {
                                if (btn2.textContent.trim() == 'Skip Node') {
                                    vm.onAction({
                                        path: jobChainPath,
                                        node: item.name,
                                        action: 'skip'
                                    }).then(function (res) {
                                        //console.log("Response " + JSON.stringify(res));
                                        btn2.innerHTML = '<i class="fa fa-play"></i> Proceed Node';
                                        btn2.className = btn2.className.replace('text-hover-color', '');
                                        div1.className = div1.className.replace(/border-.*/, 'border-red');
                                        btn1.innerHTML = '<i class="fa fa-stop"></i> Stop Node';
                                        btn1.className = btn1.className + " text-hover-color";
                                    }, function (err) {
                                        //console.log("Error " + JSON.stringify(err));
                                    })
                                } else if (btn2.textContent.trim() == 'Proceed Node') {
                                    vm.onAction({
                                        path: jobChainPath,
                                        node: item.name,
                                        action: 'unskip'
                                    }).then(function (res) {
                                        //console.log("Response " + JSON.stringify(res));
                                        btn2.innerHTML = '<i class="fa fa-play"></i> Skip Node';
                                        div1.className = div1.className.replace(/border-.*/, 'border-red');
                                    }, function (err) {
                                        //console.log("Error " + JSON.stringify(err));
                                    });
                                }

                            }


                        });

                        var btnId = '#btn3' + item.name.replace(':', '__');

                        var btn3 = document.querySelector(btnId);
                        btn3.addEventListener('click', function () {

                            console.log("It's clicked04 " + btn3.id.replace('__', ':') + "&" + btn3.textContent.trim());

                            if (item.job.path) {
                                if (btn3.textContent.trim() == 'Stop Job') {
                                    vm.onAction({
                                        path: item.job.path,
                                        node: item.name,
                                        action: 'stop job'
                                    }).then(function (res) {
                                        //console.log("Response " + JSON.stringify(res));
                                        btn3.innerHTML = 'Unstop Job';
                                        div1.className = div1.className.replace(/border-.*/, 'border-red');
                                        btn3.className = btn3.className.replace('bg-hover-color', '');
                                    }, function (err) {
                                        //console.log("Error " + JSON.stringify(err));
                                    })
                                } else if (btn3.textContent.trim() == 'Unstop Job') {
                                    vm.onAction({
                                        path: item.job.path,
                                        node: item.name,
                                        action: 'unstop job'
                                    }).then(function (res) {
                                        //console.log("Response " + JSON.stringify(res));
                                        btn3.innerHTML = 'Stop Job';
                                        div1.className = div1.className.replace(/border-.*/, 'border-grey');
                                        btn3.className = btn3.className + " bg-hover-color";
                                    }, function (err) {
                                        //console.log("Error " + JSON.stringify(err));
                                    });
                                }

                            }


                        });

                        var btnId4 = '#btn4' + item.name.replace(':', '__');

                        var btn4 = document.querySelector(btnId4);
                        btn4.addEventListener('click', function () {

                            //console.log("It's clicked01 " + btn.id.replace('__', ':') + "&" + btn.textContent.trim());

                            if (item.job.path) {
                                if (btn4.textContent.trim() == 'Show Configuration') {
                                    vm.onAction({
                                        path: item.job.path,
                                        node: item.name,
                                        action: 'show configuration'
                                    }).then(function (res) {
                                        //console.log("Response " + JSON.stringify(res));

                                    }, function (err) {
                                        //console.log("Error " + JSON.stringify(err));
                                    })
                                }

                            }


                        });


                        if (vm.jobChain.nodes.length - 1 == index) {
                            getInfo(0);
                            // getOrders();
                        }

                    })
                };


                function getInfo(index) {
                    //console.log("For index " + index);
                    var node = vm.jobChain.nodes[index];
                    if (node.job && node.job.path) {
                        vm.getJobInfo({filter: {compact: false, job: node.job.path}}).then(function (res) {


                            // //console.log("Name " + node.name);
                            var span = document.getElementById('lk' + node.name);
                            var pSpan = document.getElementById('plk' + node.name);
                            if (res.job.locks) {
                                node.locks = res.job.locks;
                                pSpan.className = pSpan.className.replace("hide", "show");
                                span.textContent = node.locks[0];
                            } else {
                                pSpan.className = pSpan.className.replace("show", "hide");

                            }
                            span = document.getElementById('pc' + node.name);
                            pSpan = document.getElementById('ppc' + node.name);
                            if (res.job.processClass) {
                                node.processClass = res.job.processClass;
                                pSpan.className.replace("hide", "show");
                                span.textContent = res.job.processClass;
                            } else {
                                pSpan.className = pSpan.className.replace("show", "hide");
                                span.textContent = 'Test server';
                            }


                        }, function (err) {

                        })
                    }
                    index++;
                    if (index < vm.jobChain.nodes.length) {
                        getInfo(index);
                    }


                }

                vm.$watch("showErrorNodes", toggleErrorNodes);
                var w = 230;
                var h = 117;

                function toggleErrorNodes() {
                    console.log("Show error nodes " + vm.showErrorNodes);
                    var errorElms = document.getElementsByClassName("error-link");
                    var errorNodes = document.getElementsByClassName("error-node");
                    //console.log("Length " + errorElms.length);
                    if (vm.showErrorNodes) {
                        angular.forEach(errorElms, function (elm, index) {
                            elm.style.setProperty('display', 'block');
                        })
                        angular.forEach(errorNodes, function (elm, index) {
                            elm.style.setProperty('display', 'block');
                        })
                    } else {
                        angular.forEach(errorElms, function (elm, index) {
                            elm.style.setProperty('display', 'none');
                        })
                        angular.forEach(errorNodes, function (elm, index) {
                            elm.style.setProperty('display', 'none');
                        })
                    }


                }


                vm.$watchCollection('orders', function () {
                    console.log("Orders "+JSON.stringify(vm.orders));
                    if(!vm.orders ){
                        return;
                    }
                    getOrders();
                });

                var done = false;

                function getOrders() {
                    var filter = {};
                    filter.orders = [];
                    filter.orders[0] = {};
                    filter.orders[0].jobChain = vm.jobChain.path;
                    var orderMargin = 10;
                    var nodeCount=0;
                    var labelCount=0;

                        var nodes = document.getElementsByClassName("border-green");

                    if(!nodes || nodes.length==0){
                         addLabel();
                    }else{

                        angular.forEach(vm.jobChain.nodes, function (node, index) {
                            nodeCount++;
                            var  rect = document.getElementById(node.name);
                            var label = document.getElementById('lbl-order-' +node.name);
                            if(rect){
                                 rect.className = rect.className.replace(/border-.*/, 'border-grey');
                                console.log("Set grey border for " + rect.id);
                            }
                            if(label){
                                 label.parentNode.removeChild(label);
                            }


                              if(vm.jobChain.nodes.length-1==index){
                                  addLabel();
                              }
                        })
                    }





                    function addLabel(){
                         console.log("Add label01");

                             angular.forEach(vm.orders, function (order, index) {
                            console.log("Order state " + order.state + " path " + order.path);
                            var node = document.getElementById(order.state);

                            if (node) {
                                if (node.className.indexOf('border-green') > -1) {
                                    console.log("Found border " + order.state + " " + node.className);
                                    var container = document.getElementById('lbl-order-' + order.state);
                                    var label = document.createElement('div');
                                    label.innerHTML = '<span>' + order.orderId + '</span>';
                                    var top = container.offsetTop;
                                    container.appendChild(label);
                                    if (node.offsetTop - container.offsetTop < 80) {
                                        container.style.setProperty('top', container.offsetTop - container.firstChild.clientHeight + 'px');
                                    }

                                    container.appendChild(label);
                                } else if (node.className.indexOf('border-grey') > -1) {
                                    node.className = node.className.replace(/border-.*/, 'border-green');
                                    var label = document.createElement('div');
                                    label.setAttribute('id', 'lbl-order-' + order.state);
                                    label.style.setProperty('position', 'absolute');
                                    label.style.setProperty('width', node.clientWidth + 'px');
                                    label.style.setProperty('margin-bottom', '5px');
                                    label.style.setProperty('left', node.offsetLeft + 'px');
                                    label.innerHTML = '<div><span>' + order.orderId + '</span></div>';
                                    mainContainer.appendChild(label);
                                    label.style.setProperty('top', node.offsetTop - label.clientHeight + 'px');
                                    label.style.setProperty('height', 'auto');
                                    label.style.setProperty('max-height', '60px');

                                }


                            }

                        })


                    }








                        //console.log("Orders " + JSON.stringify(res));


                }


            }]
        }
    }


    orderFlowDiagram.$inject = ["$compile"];

    function orderFlowDiagram($compile) {
        return {
            restrict: 'E',
            transclude: true,
            link: function (scope, element, attrs, model) {
                var left = 0;
                var distance = 300;
                scope.width = window.outerWidth;
                scope.height = window.outerHeight;


                //console.log("Items " + scope.items.length + " " + scope.width);
                var rectW = 200;
                var rectH = 130;
                var avatarW = 45;
                var margin = distance - rectW + avatarW;
                var rectangleTemplate = '';
                var top = 50;
                var avatarTop = rectH / 2 - avatarW / 2 + top;
                angular.forEach(scope.items, function (item, index) {
                    left = distance * index + margin;
                    if (index == 0) {
                        rectangleTemplate = '<span id="start" class="avatar w-32 primary text-white" style="position: absolute;left: 0px;top: ' + avatarTop + 'px' + '">Start </span>';
                        left = margin;
                    }

                    rectangleTemplate = rectangleTemplate +
                    '<div id="' + item.node + '" style="position:absolute;left:' + left + 'px;top:' + top + 'px"  class="order-detail-rect" >' +
                    '<div><span class="md-check md-check1" >' +
                    '<input type="checkbox"  id="chk' + item.node + '">' +
                    '<i class="ch-purple"></i>' +
                    '<span ><i class="fa fa-file"></i></span><span class="p-l-sm _500">' + item.name + '</span></span>' +
                    '<span class="pull-right"><span class="p-r-sm">[Tasks 2 of 2]</span><i class="fa fa-info-circle text"></i></span></div>'
                    + '<div class="text-left text-muted p-t-sm  "><span>' + 'Start time: 03:30 ' + '</span></div>' +
                    '<div class="text-left text-muted p-t-sm p-b-sm "><i class="fa fa-server "></i><span class="p-l-sm ">' + item.host + '</span>' +
                    '<span class="p-l-md"><i class="fa fa-lock"></i><span class="p-l-sm">' + item.batch + '</span></span></div>' +
                    '<div class="row" style="margin-left: -10px;margin-right: -10px;margin-top: -2px">' +
                    '<div>' +
                    '<button class="col-xs-6 btn btn-default btn-sm" ng-click="startJob()"> <i class="fa fa-play"></i> Start</button>' +
                    '<button class="col-xs-6 btn btn-default btn-sm text-hover-color" ng-click="stopJob()"><i class="fa fa-step-forward"></i> Stop</button>' +
                    '</div>' +
                    '</div>'
                    + '</div>';


                    if (index == scope.items.length - 1) {
                        left = distance * (index + 1) + margin;
                        rectangleTemplate = rectangleTemplate + '<span id="end" class="avatar w-32 primary text-white" style="position: absolute;left: ' + left + 'px;top: ' +
                        avatarTop + 'px' + '">End </span>';
                        rectangleTemplate = '<div id="mainContainer" style="position: relative; height: 300px;width: 100%;overflow: auto" >' + rectangleTemplate + '</div>';
                        var compiledHtml = $compile(rectangleTemplate)(scope);
                        element.append(compiledHtml);

                    }
                })
            },
            scope: {
                items: '=',
                'onAdd': '&',
                'onRemove': '&',
                'onStartJob': '&',
                'onStopJob': '&'
            },
            controller: ['$scope', '$timeout', function ($scope, $timeout) {
                var vm = $scope;
                vm.left = 0;
                vm.distance = 250;
                vm.object = {};


                $timeout(function () {
                    var mainContainer = document.getElementById('mainContainer');

                    angular.forEach(vm.items, function (item, index) {

                        var div1 = document.getElementById(item.node);
                        var div2 = document.getElementById(item.next_node);
                        if (!div1) {
                            return;
                        }
                        var x1 = div1.offsetLeft;
                        var y1 = div1.offsetTop;
                        if (index === vm.items.length - 1) {
                            //console.log("End node");
                            var endNode = document.getElementById('end');
                            var node = document.createElement('div');
                            node.setAttribute('class', 'h-line next-link');
                            node.style.setProperty('top', y1 + div1.clientHeight / 2 + 'px');
                            node.style.setProperty('left', x1 + div1.clientWidth + 'px');
                            node.style.setProperty('width', endNode.offsetLeft - div1.offsetLeft - div1.clientWidth + 'px');
                            mainContainer.appendChild(node);
                        }
                        if (!div2) {
                            return;
                        }
                        var x1 = div1.offsetLeft;
                        var y1 = div1.offsetTop;
                        var x2 = div2.offsetLeft;
                        var y2 = div2.offsetTop;

                        if (index == 0) {
                            var avatar = document.getElementById('start');
                            var node = document.createElement('div');
                            //console.log("Id " + 'l' + vm.items[index].node);
                            node.setAttribute('id', 'l' + vm.items[index].node);
                            node.setAttribute('class', 'h-line next-link');
                            node.style.setProperty('top', y1 + div2.clientHeight / 2 + 'px');
                            node.style.setProperty('left', avatar.offsetLeft + avatar.clientWidth + 'px');
                            node.style.setProperty('width', div1.offsetLeft - avatar.offsetLeft - avatar.clientWidth + 'px');
                            node.style.setProperty('height', '2px');
                            mainContainer.appendChild(node);
                        }
                        var node = document.createElement('div');
                        //console.log("Id " + 'l' + vm.items[index + 1].node);
                        node.setAttribute('id', 'l' + vm.items[index + 1].node);
                        node.setAttribute('class', 'h-line next-link');
                        node.style.setProperty('top', y1 + div2.clientHeight / 2 + 'px');
                        node.style.setProperty('left', x1 + div1.clientWidth + 'px');
                        node.style.setProperty('width', x2 - x1 - div1.clientWidth + 'px');
                        node.style.setProperty('height', '2px');
                        mainContainer.appendChild(node);


                        var chk = document.querySelector('#chk' + item.node);
                        chk.addEventListener('change', function () {
                            //console.log("It's here");
                            if (chk.checked) {
                                //console.log("It's checked");
                                vm.onAdd({$item: item});
                            } else {
                                //console.log("It's unchecked");
                                vm.onRemove({$item: item})
                            }
                        })

                    })
                }, 200);

                vm.startJob = function () {
                    vm.onStartJob();
                };

                vm.stopJob = function () {
                    vm.onStopJob();
                };
                vm.$on('refreshOrderFlow', function () {
                    //console.log("On refresh flow diagram");
                    updateProgress('job_node01');
                });

                function updateProgress(state) {
                    var matched = false;
                    angular.forEach(vm.items, function (item, index) {
                        if (matched) {
                            return;
                        }
                        //console.log("Node " + state + " item.node " + item.node);
                        if (item.node == state) {
                            //console.log("Matched");
                            matched = true;
                        }
                        var node = document.getElementById(item.node);
                        node.style.setProperty('border-top', '4px solid green');
                        //console.log("Progress " + 'l' + item.node);
                        var link = document.getElementById('l' + item.node);
                        link.style.setProperty('border-top', '2px solid green');

                    })
                }


            }]
        }
    }
})();
