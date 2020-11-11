/**
 * Created by sourabhagrawal on 30/06/16.
 */
(function () {
    'use strict';
    angular
        .module('app')
        .controller('JobChainOrdersCtrl', JobChainOrdersCtrl)
        .controller('JobChainOverviewCtrl', JobChainOverviewCtrl)
        .controller('JobChainDetailsCtrl', JobChainDetailsCtrl)
        .controller('OrderCtrl', OrderCtrl)
        .controller('OrderOverviewCtrl', OrderOverviewCtrl)
        .controller('OrderFunctionCtrl', OrderFunctionCtrl)
        .controller('HistoryCtrl', HistoryCtrl)
        .controller('LogCtrl', LogCtrl);

    JobChainOrdersCtrl.$inject = ["$scope", "SOSAuth", "OrderService", "CoreService", "AuditLogService", "$location", "TaskService"];

    function JobChainOrdersCtrl($scope, SOSAuth, OrderService, CoreService, AuditLogService, $location, TaskService) {
        var vm = $scope;
        vm.orderFilters = CoreService.getOrderDetailTab();
        vm.sideView = CoreService.getSideView();
        vm.orderFilters.overview = false;
        vm.status = vm.orderFilters.filter.state;

        var loadFinished = true;

        function loadJobOrderV(obj) {
            OrderService.get(obj).then(function (res) {
                let data = [];
                if (vm.orders && vm.orders.length > 0) {
                    angular.forEach(vm.orders, function (order) {
                        for (let i = 0; i < res.orders.length; i++) {
                            if (order.path === res.orders[i].path) {
                                res.orders[i].title = angular.copy(order.title);
                                res.orders[i].documentation = angular.copy(order.documentation);
                                res.orders[i].params = angular.copy(order.params);
                                res.orders[i].show = angular.copy(order.show);
                                order = res.orders[i];
                                data.push(order);
                                res.orders.splice(i, 1);
                                break;
                            }
                        }
                    });
                    data = data.concat(res.orders);
                    vm.orders = data;
                } else {
                    vm.orders = res.orders;
                }
                vm.isLoading = true;
                loadFinished = true;
                updatePanelHeight();
            }, function () {
                vm.isLoading = true;
                loadFinished = true;
            });
        }

        function loadOrders(obj) {
            loadFinished = false;
            OrderService.getOrdersP(obj).then(function (result) {
                vm.orders = result.orders;
                vm.isLoading = true;
                updatePanelHeight();
                loadJobOrderV(obj);
            }, function () {
                vm.isLoading = true;
                loadJobOrderV(obj);
            });
        }

        vm.orders = [];

        function loadJobChain() {
            let obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.compact = true;
            obj.orders = [];
            if ($location.search().path) {
                obj.orders.push({jobChain: $location.search().path});
            } else if (SOSAuth.jobChain) {
                vm.jobChain = JSON.parse(SOSAuth.jobChain);
                obj.orders.push({jobChain: vm.jobChain.path});
            }

            if (vm.orderFilters.filter.state && vm.orderFilters.filter.state != 'ALL') {
                obj.processingStates = [];
                obj.processingStates.push(vm.orderFilters.filter.state);
            }
            if (loadFinished)
                loadOrders(obj);

        }

        loadJobChain();
        $scope.$on("reloadJobChain", function () {
            loadJobChain();
        });

        $scope.$on("orderState", function (evt, state) {
            vm.orderFilters.filter.state = state;
            vm.status = state;
            if (state) {
                let obj = {};
                obj.jobschedulerId = vm.schedulerIds.selected;
                obj.compact = true;
                obj.orders = [];
                obj.orders.push({jobChain: vm.jobChain.path});
                if (vm.orderFilters.filter.state && vm.orderFilters.filter.state !== 'ALL') {
                    obj.processingStates = [];
                    obj.processingStates.push(vm.orderFilters.filter.state);
                }
                loadOrders(obj);
            }
        });

        vm.showLogFuc = function (value, skip) {
            let orders = {
                jobschedulerId: vm.schedulerIds.selected,
                limit: parseInt(vm.userPreferences.maxNumInOrderOverviewPerObject,10)
            };
            vm.isAuditLog = false;
            if (vm.userPreferences.historyTab === 'order' || skip) {
                vm.isTaskHistory = false;
            } else {
                vm.showJobHistory(value);
                return;
            }
            if (value.historyId) {
                if (vm.userPreferences.maxNumInOrderOverviewPerObject < 2) {
                    orders.historyIds = [value.historyId];
                }
            }
            orders.orders = [];
            orders.orders.push({orderId: value.orderId, jobChain: value.jobChain});
            OrderService.histories(orders).then(function (res) {
                vm.historys = res.history;
            });
            vm.showLogPanel = value;
            vm.orderFilters.showLogPanel = vm.showLogPanel;
        };

        vm.showJobHistory = function (order) {
            vm.showLogPanel = order;
            vm.isTaskHistory = true;
            vm.isAuditLog = false;
            let obj = {jobschedulerId: vm.schedulerIds.selected};
            obj.limit = parseInt(vm.userPreferences.maxHistoryPerTask,10);
            if (order.processingState && (order.processingState._text === 'RUNNING' || order.processingState._text === 'SUSPENDED' || order.processingState._text === 'SETBACK')) {
                obj.historyIds = [];
                obj.historyIds.push({historyId: order.historyId, state: order.state});
            } else {
                obj.orders = [{jobChain: order.jobChain, orderId: order.orderId}];
            }
            TaskService.histories(obj).then(function (res) {
                vm.showLogPanel.taskHistory = res.history;
            }, function () {
                vm.showLogPanel.taskHistory = [];
            })
        };

        function loadAuditLogs(obj) {
            obj.limit = parseInt(vm.userPreferences.maxAuditLogRecords) < parseInt(vm.userPreferences.maxAuditLogPerObject) ? parseInt(vm.userPreferences.maxAuditLogRecords) : parseInt(vm.userPreferences.maxAuditLogPerObject);
            AuditLogService.getLogs(obj).then(function (result) {
                if (result && result.auditLog) {
                    vm.auditLogs = result.auditLog;
                }
            });
        }

        vm.showAuditLogs = function (value) {
            vm.showLogPanel = value;
            vm.orderFilters.showLogPanel = vm.showLogPanel;
            vm.isAuditLog = true;
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.orders = [];
            obj.orders.push({jobChain: value.jobChain, orderId: value.orderId});
            if (vm.permission.AuditLog.view.status)
                loadAuditLogs(obj);
        };

        vm.hideLogPanel = function () {
            vm.showLogPanel = undefined;
            vm.orderFilters.showLogPanel = vm.showLogPanel;
        };

        vm.showLeftPanel = function () {
            vm.sideView.orderOverview.show = true;
            $('#rightPanel').removeClass('fade-in m-l-0');
            $('#leftPanel').show();
            $('.sidebar-btn').hide();
            CoreService.setSideView(vm.sideView);
        };

        vm.showPanelFuc1 = function (order) {
            order.show = true;
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = vm.schedulerIds.selected;
            orders.orders.push({orderId: order.orderId, jobChain: order.path.split(',')[0]});
            OrderService.get(orders).then(function (res) {
                order = _.merge(order, res.orders[0]);
                updatePanelHeight();
            });
        };

        vm.hidePanelFuc = function (order) {
            order.show = false;
            setTimeout(function () {
                updatePanelHeight();
            }, 1)
        };

        $scope.$on('event-started', function () {
            if (vm.events && vm.events[0] && vm.events[0].eventSnapshots && vm.showLogPanel) {
                angular.forEach(vm.events[0].eventSnapshots, function (event) {
                    if (vm.showLogPanel && event.eventType === "ReportingChangedOrder" && !event.eventId && !vm.isTaskHistory && !vm.isAuditLog) {
                        let orders = {
                            jobschedulerId: vm.schedulerIds.selected,
                            limit: parseInt(vm.userPreferences.maxNumInOrderOverviewPerObject,10)
                        };
                        if (vm.showLogPanel.historyId) {
                            if (vm.userPreferences.maxNumInOrderOverviewPerObject < 2) {
                                orders.historyIds = [vm.showLogPanel.historyId];
                            }
                        }
                        orders.orders = [];
                        orders.orders.push({orderId: vm.showLogPanel.orderId, jobChain: vm.showLogPanel.jobChain});
                        OrderService.histories(orders).then(function (res) {
                            vm.historys = res.history;
                        });
                    } else if (vm.showLogPanel && event.eventType === "ReportingChangedJob" && !event.eventId && vm.isTaskHistory) {
                        let obj = {jobschedulerId: vm.schedulerIds.selected};
                        obj.limit = parseInt(vm.userPreferences.maxHistoryPerTask,10);
                        if (vm.showLogPanel.processingState._text === 'RUNNING' || vm.showLogPanel.processingState._text === 'SUSPENDED' || vm.showLogPanel.processingState._text === 'SETBACK') {
                            obj.historyIds = [];
                            obj.historyIds.push({historyId: order.historyId, state: vm.showLogPanel.state});
                        } else {
                            obj.orders = [{jobChain: vm.showLogPanel.jobChain, orderId: vm.showLogPanel.orderId}];
                        }
                        TaskService.histories(obj).then(function (res) {
                            vm.showLogPanel.taskHistory = res.history;
                        })
                    } else if (vm.showLogPanel && event.eventType === "AuditLogChanged" && (event.objectType === "ORDER") && event.path === vm.showLogPanel.path && vm.isAuditLog) {
                        let obj = {};
                        obj.jobschedulerId = vm.schedulerIds.selected;
                        obj.orders = [];
                        obj.orders.push({jobChain: vm.showLogPanel.jobChain, orderId: vm.showLogPanel.orderId});
                        loadAuditLogs(obj);
                    }
                });
            }
        });

        vm.isInfoResize = false;

        function updatePanelHeight() {
            if (!vm.isInfoResize) {
                _updatePanelHeight();
            }
        }

        function _updatePanelHeight() {
            setTimeout(function () {
                let ht = (parseInt($('#orderTableId').height()) + 50);
                let el = document.getElementById('orderDivId');
                if (el && el.scrollWidth > el.clientWidth) {
                    ht = ht + 11;
                }
                if (ht > 450) {
                    ht = 450;
                }
                vm.resizerHeight = ht + 'px';
                $('#orderDivId').css('height', vm.resizerHeight);
            }, 5);
        }

        $scope.$on('angular-resizable.resizeEnd', function (event, args) {
            if (args.id === 'orderDivId') {
                vm.resizerHeight = args.height;
                vm.isInfoResize = true;
            }
        });
    }

    JobChainOverviewCtrl.$inject = ["$scope", "$rootScope", "OrderService", "SOSAuth", "JobChainService", "JobService", "$timeout", "$state", "$location",
        "CoreService", "$uibModal", "AuditLogService", "FileSaver", "TaskService", "$filter", "gettextCatalog"];

    function JobChainOverviewCtrl($scope, $rootScope, OrderService, SOSAuth, JobChainService, JobService, $timeout, $state, $location,
                                  CoreService, $uibModal, AuditLogService, FileSaver, TaskService, $filter, gettextCatalog) {
        var vm = $scope;
        vm.orderFilters = CoreService.getOrderDetailTab();
        vm.orderFilters.pageView = 'grid';
        vm.status = vm.orderFilters.filter.state;
        vm.loading = true;
        vm.loading1 = true;

        vm.orderFilters.overview = true;

        vm.selectedNodes = [];

        vm.obj = {};
        vm.obj.orders = [];
        var promise1, promise2;
        var object = $location.search();

        vm.totalNodes = 0;
        vm.uniqueNode = 0;
        vm.totalSubNodes = 0;
        vm.loading1 = true;

        let boxWidth = 210;

        function init() {
            createEditor();
            setTimeout(function () {
                let top = Math.round($('#main-container-body').position().top + 80);
                let ht = 'calc(100vh - ' + top + 'px)';
                if(vm.orderFilters.panelSize > 0){
                    ht = vm.orderFilters.panelSize;
                }
                $('.graph-container').css({'height': ht, 'scroll-top': '0'});

                let dom = $('#graph');
                if (dom) {
                    dom.css({opacity: 1});
                    dom.slimscroll({height: ht});
                    /**
                     * Changes the zoom on mouseWheel events
                     */
                    dom.bind('mousewheel DOMMouseScroll', function (event) {
                        if (vm.editor) {
                            if (event.ctrlKey) {
                                event.preventDefault();
                                if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) {
                                    vm.editor.execute('zoomIn');
                                } else {
                                    vm.editor.execute('zoomOut');
                                }
                            } else {
                                const bounds = vm.editor.graph.getGraphBounds();
                                if (bounds.y < -0.05 && bounds.height > dom.height()) {
                                    vm.editor.graph.center(true, true, 0.5, -0.02);
                                }
                            }
                        }
                    });
                }
            }, 5);
            showHistory();
        }

        $('.scroll-y').scroll(function () {
            if ($(this).scrollTop() > 50) {
                $('.scrollBottom-btn').hide();
                $('.scrolltop-btn').show();
            } else {
                $('.scrollBottom-btn').show();
                $('.scrolltop-btn').hide();
            }

        });

        vm.scrollTop = function () {
            $('.scroll-y').animate({scrollTop: '0px'}, 500);
        };
        vm.scrollBottom = function () {
            let dom = $('.scroll-y');
            dom.animate({scrollTop: dom.height()}, 500);
        };

        vm.$on('angular-resizable.resizeEnd', function (evn, data) {
            if (vm.orderFilters.pageView === 'grid') {
                let ht = data.height;
                if (ht < 200) {
                    ht =200;
                }
                let dom = $('#graph');
                dom.css({height: ht + 'px'});
                dom.slimscroll({height: ht + 'px'});
                vm.orderFilters.panelSize = ht;
            }
        });

        /**
         * Constructs a new application (returns an mxEditor instance)
         */
        function createEditor() {
            try {
                if (!mxClient.isBrowserSupported()) {
                    mxUtils.error('Browser is not supported!', 200, false);
                } else {
                    const node = mxUtils.load('./mxgraph/config/diagrameditor.xml').getDocumentElement();
                    if (node)
                        vm.editor = new mxEditor(node);
                    if (vm.editor) {
                        initEditorConf(vm.editor);
                        const outln = document.getElementById('outlineContainer2');
                        if (outln) {
                            new mxOutline(vm.editor.graph, outln);
                        }
                        vm.editor.graph.allowAutoPanning = true;
                        createWorkflowDiagram(vm.editor.graph, null, vm.orderFilters.showErrorNodes);
                    }
                }
            } catch (e) {
                setTimeout(function () {
                    createEditor()
                }, 80);
            }
        }

        /**
         * Function to override Mxgraph properties and functions
         */
        function initEditorConf(editor) {
            const graph = editor.graph;
            // Alt disables guides
            mxGraphHandler.prototype.guidesEnabled = true;
            mxGraph.prototype.cellsResizable = false;
            mxGraph.prototype.multigraph = false;
            mxGraph.prototype.allowDanglingEdges = false;
            mxGraph.prototype.cellsLocked = true;
            mxGraph.prototype.foldingEnabled = true;
            mxHierarchicalLayout.prototype.interRankCellSpacing = 40;
            mxTooltipHandler.prototype.delay = 0;
            mxConstants.VERTEX_SELECTION_COLOR = null;
            mxConstants.EDGE_SELECTION_COLOR = null;
            mxConstants.GUIDE_COLOR = null;

            let stopNodeBtnText = gettextCatalog.getString('button.stopNode');
            let unStopNodeBtnText = gettextCatalog.getString('button.unstopNode');
            let skipNodeBtnText = gettextCatalog.getString('button.skipNode');
            let unskipNodeBtnText = gettextCatalog.getString('button.unskipNode');

            let style = graph.getStylesheet().getDefaultVertexStyle();
            let style2 = graph.getStylesheet().getDefaultEdgeStyle();
            if (vm.userPreferences.theme !== 'light' && vm.userPreferences.theme !== 'lighter' || !vm.userPreferences.theme) {
                style[mxConstants.STYLE_FONTCOLOR] = '#ffffff';
                style2[mxConstants.STYLE_STROKECOLOR] = '#aaa';
                style2[mxConstants.STYLE_FONTCOLOR] = '#f2f2f2';
            }
            style[mxConstants.STYLE_FILLCOLOR] = vm.userPreferences.theme === 'dark' ? '#333332' : vm.userPreferences.theme === 'grey' ? '#535a63' :
                vm.userPreferences.theme === 'blue' ? '#344d68' : vm.userPreferences.theme === 'blue-lt' ? '#4e5c6a' : vm.userPreferences.theme === 'cyan' ? '#00445a' : '#f5f7fb';

            // Enables snapping waypoints to terminals
            mxEdgeHandler.prototype.snapToTerminals = true;

            graph.setConnectable(false);
            graph.setHtmlLabels(true);
            graph.setDisconnectOnMove(false);
            graph.collapseToPreferredSize = false;
            graph.constrainChildren = false;
            graph.extendParentsOnAdd = false;
            graph.extendParents = false;

            /**
             * Overrides method to provide a cell label in the display
             * @param cell
             */
            graph.convertValueToString = function (cell) {
                if (cell.value.tagName === 'Connection') {
                    return cell.getAttribute('label');
                }
                let className;
                if (cell.value.tagName === 'Job') {
                    className = 'vertex-text job_link';
                } else {
                    className = 'vertex-text order_link';
                }
                let state = cell.getAttribute('label');
                if (cell.getAttribute('job') && !cell.getAttribute('fileSink')) {
                    let data = cell.getAttribute('data');
                    data = JSON.parse(data);
                    let chk = '<input type="checkbox" class="checkbox" id="' + state + '">';
                    if (vm.exportGraphInProcess) {
                        chk = '';
                    }

                    let str = '<div class="' + className + '"><div class="m-l-sm">' +
                        '<label class="md-check">' + chk + '<i class="chk primary"></i></label><div title="' + state + '" class="block-ellipsis-job" style="position: absolute;top:9px;left: 28px;width: 179px">' + state + '</div><div class="text-muted block-ellipsis-job">';
                    if (data.job.documentation) {
                        str = str + '<i class="cursor fa fa-book p-r-xs"></i>';
                    }
                    str = str + '<a title="' + cell.getAttribute('job') + '" class="text-hover-primary">' + cell.getAttribute('job') + '</a></div>';
                    if (data.job.processClass) {
                        str = str + '<div class="block-ellipsis-job"><i class="fa fa-server p-r-sm"></i>' + data.job.processClass + '</div>';
                    } else {
                        str = str + '<div>-</div>';
                    }
                    if (cell.getAttribute('suspend')) {
                        str = str + '<i class="text-warning text-sm">on error suspend</i></div>';
                    } else {
                        str = str + '<div>-</div></div>';
                    }
                    let stopBtnClass = 'hide', unstopBtnClass = 'hide', skipBtnClass = 'hide', unskipBtnClass = 'hide';
                    if (vm.permission.JobChain.execute.stopJobChainNode && data.state._text !== 'STOPPED') {
                        stopBtnClass = 'show-inline';
                    }
                    if (vm.permission.JobChain.execute.processJobChainNode && data.state._text === 'STOPPED') {
                        unstopBtnClass = 'show-inline';
                    }
                    if (vm.permission.JobChain.execute.skipJobChainNode && data.state._text !== 'SKIPPED') {
                        skipBtnClass = 'show-inline';
                    }
                    if (vm.permission.JobChain.execute.processJobChainNode && data.state._text === 'SKIPPED') {
                        unskipBtnClass = 'show-inline';
                    }
                    let bgBtnColor = '';

                    if (data.state._text === 'SKIPPED' || data.state._text === 'STOPPED') {
                        bgBtnColor = vm.bgColorFunction(data.state.severity);
                    } else {
                        if (data.job.state) {
                            if (data.job.state._text === 'RUNNING' || data.job.state._text === 'STOPPED') {
                                bgBtnColor = vm.bgColorFunction(data.job.state.severity);
                            }
                        }
                    }

                    str = str + '<div class="m-t-xs p-a-sm b-t w-full ' + bgBtnColor + '" style="height: 35px;">' +
                        '<a title="' + stopNodeBtnText + '" class="stopNode pull-left w-half text-hover-color ' + stopBtnClass + '">' +
                        '<i class="fa fa-stop" ></i> ' + stopNodeBtnText + '</a>' +
                        '<a title="' + unStopNodeBtnText + '" class="unstopNode pull-left w-half ' + unstopBtnClass + '">' +
                        '<i class="fa fa-play" ></i> ' + unStopNodeBtnText + '</a>' +
                        '<a title="' + skipNodeBtnText + '" class="skipNode pull-right text-right w-half text-hover-color p-r-xs ' + skipBtnClass + '">' +
                        '<i class="fa fa-step-forward"></i> ' + skipNodeBtnText + ' </a>' +
                        '<a title="' + unskipNodeBtnText + '" class="unskipNode pull-right text-right w-half p-r-xs ' + unskipBtnClass + '">' +
                        '<i class="fa fa-play" ></i>  ' + unskipNodeBtnText + ' </a>' +
                        '</div>';
                    str = str + '</div>';
                    return str;
                }
                if (cell.getAttribute('fileSink')) {
                    let data = cell.getAttribute('data');
                    data = JSON.parse(data);
                    let str = '<div class="' + className + ' m-t-xs"><div class="m-l-sm">' +
                        '<div title="' + state + '" class="block-ellipsis-job">' + state + '</div><div class="text-muted block-ellipsis-job">';
                    if (data.job.documentation) {
                        str = str + '<i class="cursor fa fa-book p-r-xs"></i>';
                    }
                    str = str + '<a title="' + cell.getAttribute('job') + '" class="text-hover-primary">' + cell.getAttribute('job') + '</a></div></div></div>';
                    return str;
                }
                if (cell.value.tagName === 'FileOrder') {
                    return '<div class="vertex-text file-order"><div>Folder: ' + cell.getAttribute('directory') + '</div><i class="text-muted text-sm">RegExp: ' + cell.getAttribute('regex') + '</i></div>';
                } else if (cell.value.tagName === 'Order') {
                    let data = cell.getAttribute('data');
                    data = JSON.parse(data);
                    let color = '';
                    if (data.processingState) {
                        color = vm.colorFunction(data.processingState.severity)
                    }
                    let str = '<div class="' + className + '"><div class="block-ellipsis-job"><i class="fa fa-circle text-xs p-r-xs ' + color + '"></i>' + state + '</div>';
                    if (data.nextStartTime) {
                        let time = ' <span class="text-success text-xs" >(' + $filter('remainingTime')(data.nextStartTime) + ')</span>';
                        str = str + '<i class="text-xs">' + $filter('stringToDate')(data.nextStartTime) + '</i>' + time
                    } else if (data.nextStartNever) {
                        str = str + '<i class="text-success text-xs" >' + gettextCatalog.getString('label.nextStartNever') + '</i>';
                    } else if (data.startedAt) {
                        str = str + '<span class="text-success text-xs" >' + $filter('stringToDate')(data.startedAt) +
                            '(' + $filter('remainingTime')(data.startedAt) + ')</span>';
                    }
                    str = str + '</div>';
                    return str;
                }
                return '<div class="' + className + '">' + state + '</div>';
            };

            /**
             * Function: isCellMovable
             *
             * Returns true if the given cell is moveable.
             */
            graph.isCellMovable = function (cell) {
                return false;
            };

            /**
             * Function: getTooltipForCell
             *
             * Returns the string or DOM node to be used as the tooltip for the given
             * cell.
             */
            graph.getTooltipForCell = function (cell) {
                let tip = null;
                if (cell != null && cell.getTooltip != null) {
                    tip = cell.getTooltip();
                } else {
                    if (!(cell.value.tagName === 'Connection')) {
                        tip = '<div class="vertex-text2">';
                        if (cell.value.tagName === 'Job') {
                            if (cell.getAttribute('fileSink')) {
                                let data = JSON.parse(cell.getAttribute('data'));
                                tip = tip + 'Move: ' + data.move;
                            } else {
                                return null;
                            }
                        } else if (cell.value.tagName === 'FileOrder') {
                            tip = tip + 'Folder: ' + cell.getAttribute('directory') + ' \n RegExp: ' + cell.getAttribute('regex');
                        }  else if (cell.value.tagName === 'Order') {
                            let data = cell.getAttribute('data');
                            data = JSON.parse(data);
                            tip = tip + cell.getAttribute('label') + '<br>' + data.stateText;
                        }else {
                            tip = tip + cell.getAttribute('label');
                        }
                        tip = tip + '</div>';
                    }
                }
                return tip;
            };

            /**
             * Function: handle a click event
             */
            graph.addListener(mxEvent.CLICK, function (sender, evt) {
                let event = evt.getProperty('event');
                let cell = evt.getProperty('cell'); // cell may be null
                if (cell != null) {
                    handleSingleClick(event, cell);
                    evt.consume();
                }
                vm.stepNode = null;
                vm.nodeOrder = null;
            });

            /**
             * Function : handleSingleClick
             *
             * Handle expand/collapse for Job cell and show reference tab for IN/Out conditions
             * @param evt
             * @param cell
             */
            function handleSingleClick(evt, cell) {
                if (evt && evt.target) {
                    let name = cell.getAttribute('label');
                    let data = cell.getAttribute('data');
                    if(data && typeof data === "string") {
                        data = JSON.parse(data);
                        if (evt.target.className === 'text-hover-primary') {
                            vm.showJob(data.job.path);
                        } else if (evt.target.className === 'checkbox' || evt.target.className.match('chk')) {
                            let chk = document.getElementById(name);
                            if (!chk.checked) {
                                vm.selectedNodes.push(data);
                            } else {
                                for (let i = 0; i < vm.selectedNodes.length; i++) {
                                    if (vm.selectedNodes[i].name == name) {
                                        vm.selectedNodes.splice(i, 1);
                                        break;
                                    }
                                }
                            }
                            vm.onAdd();
                        } else if (evt.target.className.match('w-half')) {
                            if (evt.target.className.match('unstopNode')) {
                                vm.unStopNode(data, vm.jobChain);
                            } else if (evt.target.className.match('stopNode')) {
                                vm.stopNode(data, vm.jobChain);
                            } else if (evt.target.className.match('unskipNode')) {
                                vm.unskipNode(data, vm.jobChain);
                            } else if (evt.target.className.match('skipNode')) {
                                vm.skipNode(data, vm.jobChain);
                            }
                        } else if (evt.target.className.match('fa-book')) {
                            vm.showDocumentation('job', data.job.path);
                        }
                    }
                }
            }

            vm.closeMenu = function () {
                vm.stepNode = null;
                vm.nodeOrder = null;
            };

            // Shows a "modal" window when clicking on img.
            function mxIconSet(state) {
                this.images = [];
                let img;
                if (state.cell && ((state.cell.value.tagName === 'Job' && (state.cell.getAttribute('job') && !state.cell.getAttribute('fileSink'))) || (state.cell.value.tagName === 'Order'))) {
                    img = mxUtils.createImage('images/menu.svg');
                    let x = state.x - (18 * state.shape.scale), y = state.y - (8 * state.shape.scale);
                    img.style.left = x + 'px';
                    img.style.top = y + 'px';
                    mxEvent.addListener(img, 'click',
                        mxUtils.bind(this, function (evt) {
                            let _x = x;
                            if (evt.clientX > 240) {
                                _x = _x - 120;
                                vm.openToRight = false;
                            } else {
                                vm.openToRight = true;
                            }
                            let _y = y + 63 - $('#graph').scrollTop() - $('.graph-container').scrollTop();
                            _x = _x - 10 - $('#graph').scrollLeft() - $('.graph-container').scrollLeft();
                            let $menu;
                            if (state.cell.value.tagName === 'Job') {
                                $menu = document.getElementById('actionMenu');
                                for (let i = 0; i < vm.jobChain.nodes.length; i++) {
                                    if (vm.jobChain.nodes[i].name === state.cell.getAttribute('label')) {
                                        vm.stepNode = vm.jobChain.nodes[i];
                                        break;
                                    }
                                }
                            } else {
                                $menu = document.getElementById('orderActionMenu');
                                let data = state.cell.getAttribute('data');
                                data = JSON.parse(data);
                                vm.nodeOrder = data;
                            }

                            $menu.style.left = _x + "px";
                            $menu.style.top = _y + "px";
                            this.destroy();
                        })
                    );
                }
                if (img) {
                    img.style.position = 'absolute';
                    img.style.cursor = 'pointer';
                    img.style.width = (18 * state.shape.scale) + 'px';
                    img.style.height = (18 * state.shape.scale) + 'px';
                    state.view.graph.container.appendChild(img);
                    this.images.push(img);
                }
            }

            mxIconSet.prototype.destroy = function () {
                if (this.images != null) {
                    for (let i = 0; i < this.images.length; i++) {
                        let img = this.images[i];
                        img.parentNode.removeChild(img);
                    }
                }
                this.images = null;
            };

            // Shows icons if the mouse is over a cell
            graph.addMouseListener({
                currentState: null,
                currentIconSet: null,
                mouseDown: function (sender, me) {
                    // Hides icons on mouse down
                    if (this.currentState != null) {
                        this.dragLeave(me.getEvent(), this.currentState);
                        this.currentState = null;
                    }
                },
                mouseMove: function (sender, me) {
                    if (this.currentState != null && (me.getState() == this.currentState ||
                        me.getState() == null)) {
                        let tol = 10;
                        let tmp = new mxRectangle(me.getGraphX() - tol,
                            me.getGraphY() - tol, 2 * tol, 2 * tol);

                        if (mxUtils.intersects(tmp, this.currentState)) {
                            return;
                        }
                    }

                    let tmp = graph.view.getState(me.getCell());
                    // Ignores everything but vertices
                    if (graph.isMouseDown || (tmp != null && !graph.getModel().isVertex(tmp.cell))) {
                        tmp = null;
                    }
                    if (tmp != this.currentState) {
                        if (this.currentState != null) {
                            this.dragLeave(me.getEvent(), this.currentState);
                        }
                        this.currentState = tmp;
                        if (this.currentState != null) {
                            this.dragEnter(me.getEvent(), this.currentState);
                        }
                    }
                },
                mouseUp: function (sender, me) {

                },
                dragEnter: function (evt, state) {
                    if (this.currentIconSet == null) {
                        this.currentIconSet = new mxIconSet(state);
                    }
                },
                dragLeave: function () {
                    if (this.currentIconSet != null) {
                        this.currentIconSet.destroy();
                        this.currentIconSet = null;
                    }
                }
            });
        }

        function reloadGraph() {
            if(vm.editor && vm.editor.graph) {
                let element = document.getElementById('graph');
                let scrollValue = {
                    scrollTop: element.scrollTop,
                    scrollLeft: element.scrollLeft,
                    scale: vm.editor.graph.getView().getScale()
                };
                vm.editor.graph.removeCells(vm.editor.graph.getChildVertices(vm.editor.graph.getDefaultParent()));
                createWorkflowDiagram(vm.editor.graph, scrollValue, vm.orderFilters.showErrorNodes);
            }
        }

        function createWorkflowDiagram(graph, scrollValue, showErrorNode) {
            graph.getModel().beginUpdate();
            let splitRegex = new RegExp('(.+):(.+)');
            let endNodes = new Map();
            try {
                if (vm.jobChain.fileOrderSources) {
                    for (let i = 0; i < vm.jobChain.fileOrderSources.length; i++) {
                        if (vm.jobChain.fileOrderSources[i].directory) {
                            let v1 = createFileOrderVertex(vm.jobChain.fileOrderSources[i], graph);
                            vm.jobChain.fileOrderSources[i].fId = v1.id;
                        }
                    }
                }
                let vertexMap = new Map();
                if (vm.jobChain.nodes) {
                    for (let i = 0; i < vm.jobChain.nodes.length; i++) {
                        if (vm.jobChain.nodes[i].name) {
                            let v1 = createJobVertex(vm.jobChain.nodes[i], graph);
                            if (!vertexMap.has(vm.jobChain.nodes[i].name)) {
                                vertexMap.set(vm.jobChain.nodes[i].name, v1);
                            }
                            if (vm.jobChain.fileOrderSources) {
                                if (vm.jobChain.fileOrderSources.length > 0) {
                                    for (let j = 0; j < vm.jobChain.fileOrderSources.length; j++) {
                                        if ((vm.jobChain.fileOrderSources[j].nextNode && vm.jobChain.fileOrderSources[j].nextNode === vm.jobChain.nodes[i].name) ||
                                            (!vm.jobChain.fileOrderSources[j].nextNode && i === 0)) {
                                            graph.insertEdge(graph.getDefaultParent(), null, getCellNode('Connection', '', ''),
                                                graph.getModel().getCell(vm.jobChain.fileOrderSources[j].fId), v1);
                                        }
                                    }
                                }
                            }
                            if (vm.jobChain.nodes[i].orders && vm.jobChain.nodes[i].orders.length > 0) {
                                for (let j = 0; j < vm.jobChain.nodes[i].orders.length; j++) {
                                    if (vm.jobChain.nodes[i].orders[j].orderId) {
                                        let o1 = createOrderVertex(vm.jobChain.nodes[i].orders[j], graph);
                                        graph.insertEdge(graph.getDefaultParent(), null, getCellNode('Connection', '', ''),
                                            o1, v1, 'dashed=1;');
                                    }
                                }
                            }

                            if (vm.jobChain.endNodes && vm.jobChain.endNodes.length > 0) {
                                for (let j = 0; j < vm.jobChain.endNodes.length; j++) {
                                    if (vm.jobChain.endNodes[j].name !== 'fileOrderSinkEnd') {
                                        let v2 = endNodes.get(vm.jobChain.endNodes[j].name);
                                        if (!v2) {
                                            v2 = createEndNodeVertex(vm.jobChain.endNodes[j], graph);
                                        }
                                        endNodes.set(vm.jobChain.endNodes[j].name, v2);
                                        if (vm.jobChain.endNodes[j].name === vm.jobChain.nodes[i].nextNode) {
                                            graph.insertEdge(graph.getDefaultParent(), null, getCellNode('Connection', '', ''),
                                                v1, v2);
                                        }
                                        if (vm.jobChain.endNodes[j].name === vm.jobChain.nodes[i].errorNode) {
                                            if (showErrorNode && !vm.jobChain.nodes[i].onError) {
                                                let style = v2.getStyle();
                                                let eColor = '#fce3e8';
                                                if (vm.userPreferences.theme !== 'light' && vm.userPreferences.theme !== 'lighter' || !vm.userPreferences.theme) {
                                                    eColor = 'rgba(255,130,128,0.7)';
                                                }
                                                style += ';fillColor=' + eColor;
                                                v2.setStyle(style);
                                                graph.insertEdge(graph.getDefaultParent(), null, getCellNode('Connection', '', ''),
                                                    v1, v2, 'dashed=1;dashPattern=1 2;strokeColor=#dc143c');
                                            } else {
                                                graph.removeCells([v2]);
                                                endNodes.delete(vm.jobChain.endNodes[j].name);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    for (let i = 0; i < vm.jobChain.nodes.length; i++) {
                        let v1 = vertexMap.get(vm.jobChain.nodes[i].name);
                        for (let j = 0; j < vm.jobChain.nodes.length; j++) {
                            if (v1 && vm.jobChain.nodes[i].name !== vm.jobChain.nodes[j].name) {
                                if (vm.jobChain.nodes[i].onReturnCodes && vm.jobChain.nodes[i].onReturnCodes.onReturnCodeList && vm.jobChain.nodes[i].onReturnCodes.onReturnCodeList.length > 0) {
                                    let rc = vm.jobChain.nodes[i].onReturnCodes;
                                    if (rc.onReturnCodeList) {
                                        for (let m = 0; m < rc.onReturnCodeList.length; m++) {
                                            if (rc.onReturnCodeList[m].toState && vm.jobChain.nodes[j].name === rc.onReturnCodeList[m].toState.name) {
                                                graph.insertEdge(graph.getDefaultParent(), null, getCellNode('Connection', 'exit: ' + rc.onReturnCodeList[m].returnCode, ''),
                                                    v1, vertexMap.get(vm.jobChain.nodes[j].name), 'dashed=1;');
                                            }
                                        }
                                    }
                                }

                                if (vm.jobChain.nodes[j].name && splitRegex.test(vm.jobChain.nodes[j].name) && vm.jobChain.nodes[i].name !== vm.jobChain.nodes[j].name) {
                                    let arr = splitRegex.exec(vm.jobChain.nodes[j].name);
                                    if (vm.jobChain.nodes[i].name === arr[1] || vm.jobChain.nodes[i].name+':' === arr[1]) {
                                        graph.insertEdge(graph.getDefaultParent(), null, getCellNode('Connection', vm.jobChain.nodes[i].name, ''),
                                            v1, vertexMap.get(vm.jobChain.nodes[j].name));
                                    }
                                }
                                if (vm.jobChain.nodes[j].nextNode && vm.jobChain.nodes[i].name === vm.jobChain.nodes[j].nextNode) {
                                    graph.insertEdge(graph.getDefaultParent(), null, getCellNode('Connection', '', ''),
                                        vertexMap.get(vm.jobChain.nodes[j].name), v1);
                                }
                                if (!vm.jobChain.nodes[i].onError && vm.jobChain.nodes[i].errorNode && vm.jobChain.nodes[i].errorNode === vm.jobChain.nodes[j].name) {
                                    if (showErrorNode) {
                                        let vert = vertexMap.get(vm.jobChain.nodes[j].name);
                                        let style = vert.getStyle();
                                        let eColor = '#fce3e8';
                                        if (vm.userPreferences.theme !== 'light' && vm.userPreferences.theme !== 'lighter' || !vm.userPreferences.theme) {
                                            eColor = 'rgba(255,130,128,0.7)';
                                        }
                                        if (!vm.jobChain.nodes[j].state) {
                                            eColor = 'rgba(245, 250, 133, 0.6)';
                                        }
                                        style += ';fillColor=' + eColor;
                                        vert.setStyle(style);
                                        graph.insertEdge(graph.getDefaultParent(), null, getCellNode('Connection', '', ''),
                                            v1, vert, 'dashed=1;dashPattern=1 2;strokeColor=#dc143c');
                                    } else {
                                        graph.removeCells([vertexMap.get(vm.jobChain.nodes[j].name)]);
                                    }
                                }
                            }

                        }
                        if (vm.jobChain.nodes[i].onError === 'setback') {
                            graph.insertEdge(graph.getDefaultParent(), null, getCellNode('Connection', 'setback', ''),
                                v1, v1, 'dashed=1;');
                        }
                        if (vm.jobChain.nodes[i].nextNode === vm.jobChain.nodes[i].name) {
                            graph.insertEdge(graph.getDefaultParent(), null, getCellNode('Connection', '', ''),
                                v1, v1);
                        }
                        if (vm.jobChain.nodes[i].errorNode === vm.jobChain.nodes[i].name) {
                            graph.insertEdge(graph.getDefaultParent(), null, getCellNode('Connection', '', ''),
                                v1, v1, 'dashed=1;dashPattern=1 2;strokeColor=#dc143c');
                        }
                    }
                }
            } catch (e) {
                console.error(e)
            } finally {
                // Updates the display
                graph.getModel().endUpdate();
                executeLayout(graph);
            }
            if (scrollValue) {
                let element = document.getElementById('graph');
                if (scrollValue.scrollTop)
                    element.scrollTop = scrollValue.scrollTop;
                if (scrollValue.scrollLeft)
                    element.scrollLeft = scrollValue.scrollLeft;
                if (scrollValue.scale)
                    vm.editor.graph.getView().setScale(scrollValue.scale);
            }

            setTimeout(function () {
                if(vm.editor) {
                    if (!scrollValue) {
                        $('[data-toggle="tooltip"]').tooltip();
                        vm.actual();
                    }
                    updateWorkflowDiagram();
                }
            }, 50);
        }

        function updateWorkflowDiagram() {
            const graph = vm.editor.graph;
            let parent = graph.getDefaultParent();
            graph.getModel().beginUpdate();
            let edges = [];
            let edges2 = [];
            try {
                let vertices = graph.getChildVertices(parent);
                for (let i = 0; i < vertices.length; i++) {
                    if (vertices[i].value.tagName === 'Order') {
                        let data = vertices[i].getAttribute('data');
                        data = JSON.parse(data);
                        if (data.processingState && data.processingState._text == 'RUNNING') {
                            edges = edges.concat(graph.getOutgoingEdges(vertices[i], parent));
                        } else {
                            edges2 = edges2.concat(graph.getOutgoingEdges(vertices[i], parent));
                        }
                    }
                }
            } catch (e) {
                console.error(e)
            } finally {
                // Updates the display
                graph.getModel().endUpdate();
            }
            for (let i = 0; i < edges.length; i++) {
                let state = graph.view.getState(edges[i]);
                state.shape.node.getElementsByTagName('path')[1].setAttribute('class', 'flow');
            }
            for (let i = 0; i < edges2.length; i++) {
                let state = graph.view.getState(edges2[i]);
                state.shape.node.getElementsByTagName('path')[1].removeAttribute('class');
            }
        }

        /**
         * Reformat the layout
         */
        function executeLayout(graph) {
            const layout = new mxHierarchicalLayout(graph);
            layout.execute(graph.getDefaultParent());
        }

        /**
         * Function to create dom element
         */
        function getCellNode(name, label, job, isSuspend) {
            const doc = mxUtils.createXmlDocument();
            // Create new node object
            const _node = doc.createElement(name);
            if (label)
                _node.setAttribute('label', label);
            if (job)
                _node.setAttribute('job', job);
            if (isSuspend) {
                _node.setAttribute('suspend', 'true');
            }
            return _node;
        }

        /**
         * Function to create file order vertex
         */
        function createFileOrderVertex(fileOrder, graph) {
            const doc = mxUtils.createXmlDocument();
            // Create new node object
            const _node = doc.createElement('FileOrder');
            _node.setAttribute('directory', fileOrder.directory);
            if (fileOrder.regex) {
                _node.setAttribute('regex', fileOrder.regex);
            }
            let style = 'fileOrder;strokeColor=#999;rounded=1';
            return graph.insertVertex(graph.getDefaultParent(), null, _node, 0, 0, boxWidth, 40, style)
        }

        /**
         * Function to create Job vertex
         */
        function createJobVertex(job, graph) {
            let path = '', h = 118;
            if (job.job && job.job.path) {
                path = job.job.path;
            }
            let _node = getCellNode('Job', job.name, path, job.onError === 'suspend');
            _node.setAttribute('data', JSON.stringify(job));
            let style = 'job';
            if (job.job.state) {
                if (job.state._text === 'SKIPPED' || job.state._text === 'STOPPED') {
                    style += ';strokeColor=' + (CoreService.getColorBySeverity(job.state.severity) || '#999');
                } else {
                    style += ';strokeColor=' + (CoreService.getColorBySeverity(job.job.state.severity) || '#999');
                }
            } else if (job.state && job.state.severity) {
                style += ';strokeColor=' + (CoreService.getColorBySeverity(job.state.severity) || '#999');
            } else {
                style += ';strokeColor=#999';
            }
            if (!job.state) {
                _node.setAttribute('fileSink', 'true');
                style += ';fillColor=rgba(245,250,133,0.6)';
                h = 44;
            }
            return graph.insertVertex(graph.getDefaultParent(), null, _node, 0, 0, boxWidth, h, style)
        }

        function createEndNodeVertex(node, graph) {
            let _node = getCellNode('Node', node.name);
            let style = 'job;strokeColor=#999';
            let sColor = '#e5ffe5';
            if (vm.userPreferences.theme !== 'light' && vm.userPreferences.theme !== 'lighter' || !vm.userPreferences.theme) {
                sColor = 'rgba(133,255,168,0.7)';
            }
            style += ';fillColor=' + sColor;
            return graph.insertVertex(graph.getDefaultParent(), null, _node, 0, 0, boxWidth, 40, style)
        }

        /**
         * Function to create Job vertex
         */
        function createOrderVertex(order, graph) {
            let _node = getCellNode('Order', order.orderId);
            _node.setAttribute('data', JSON.stringify(order));
            let style = 'order;strokeColor=#999;fillColor=none';
            return graph.insertVertex(graph.getDefaultParent(), null, _node, 0, 0, boxWidth, 40, style)
        }

        function loadJobChain() {
            if (SOSAuth.jobChain) {
                vm.totalNodes = 0;
                vm.totalSubNodes = 0;
                vm.jobChain = JSON.parse(SOSAuth.jobChain);
                if (vm.totalSubNodes > 0) {
                    vm.totalLineWidth = vm.totalNodes + vm.totalSubNodes;
                } else {
                    vm.totalLineWidth = vm.totalNodes;
                }
                angular.forEach(vm.jobChain.nodes, function (val, index) {
                    if (val.job && val.job.state && val.job.state._text == 'RUNNING' && vm.userPreferences.showTasks) {
                        JobService.get({
                            jobschedulerId: vm.schedulerIds.selected,
                            jobs: [{job: val.job.path}]
                        }).then(function (res1) {
                            vm.jobChain.nodes[index].job = _.merge(vm.jobChain.nodes[index].job, res1.jobs[0]);
                        });
                    }
                });
                if (vm.editor && vm.editor.graph) {
                    reloadGraph();
                } else {
                    init();
                }
            }
        }

        $scope.$on("reloadJobChain", function () {
            vm.loading1 = false;
            loadJobChain();
            if (!vm.isAuditLog) {
                if (!vm.isTaskHistory) {
                    vm.historyRequestObj.jobschedulerId = vm.schedulerIds.selected;
                    vm.historyRequestObj.limit = parseInt(vm.userPreferences.maxHistoryPerJobchain,10);
                    if (!vm.historyRequestObj.orders) {
                        vm.historyRequestObj.orders = [{
                            jobChain: vm.jobChain.path
                        }];
                    }
                    OrderService.histories(vm.historyRequestObj).then(function (res) {
                        vm.historys = res.history;
                    });
                } else {
                    vm.taskHistoryRequestObj.jobschedulerId = vm.schedulerIds.selected;
                    vm.taskHistoryRequestObj.limit = parseInt(vm.userPreferences.maxHistoryPerTask,10);
                    if (!vm.taskHistoryRequestObj.orders) {
                        vm.taskHistoryRequestObj.orders = [{
                            jobChain: vm.jobChain.path
                        }];
                    }
                    TaskService.histories(vm.taskHistoryRequestObj).then(function (res) {
                        vm.showHistoryPanel.taskHistory = res.history;
                    }, function () {
                        vm.showHistoryPanel.taskHistory = [];
                    })
                }
            }
        });

        vm.getJobInfo = getJobInfo;

        function getJobInfo(obj) {
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.compact = false;
            return JobService.getJobsP(obj);
        }

        vm.stopNode = function (data, jobChain) {
            let nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = vm.schedulerIds.selected;
            nodes.nodes.push({jobChain: jobChain.path, node: data.name});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = jobChain.path;
                vm.comments.title = jobChain.title;
                vm.comments.node = data.name;
                vm.comments.operation = 'Stop';
                vm.comments.type = 'Job Chain';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    nodes.auditLog = {};
                    if (vm.comments.comment)
                        nodes.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        nodes.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        nodes.auditLog.ticketLink = vm.comments.ticketLink;
                    JobService.stopNode(nodes);
                }, function () {
                });
            } else {
                JobService.stopNode(nodes);
            }
        };

        vm.unStopNode = function (data, jobChain) {
            let nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = vm.schedulerIds.selected;
            nodes.nodes.push({jobChain: jobChain.path, node: data.name});

            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = jobChain.path;
                vm.comments.title = jobChain.title;
                vm.comments.node = data.name;
                vm.comments.operation = 'Unstop';
                vm.comments.type = 'Job Chain';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    nodes.auditLog = {};
                    if (vm.comments.comment)
                        nodes.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        nodes.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        nodes.auditLog.ticketLink = vm.comments.ticketLink;
                    JobService.activateNode(nodes);
                }, function () {

                });
            } else {
                JobService.activateNode(nodes);
            }
        };

        vm.skipNode = function (data, jobChain) {
            let nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = vm.schedulerIds.selected;
            nodes.nodes.push({jobChain: jobChain.path, node: data.name});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = jobChain.path;
                vm.comments.title = jobChain.title;
                vm.comments.node = data.name;
                vm.comments.operation = 'Skip';
                vm.comments.type = 'Job Chain';

                let modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    nodes.auditLog = {};
                    if (vm.comments.comment)
                        nodes.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        nodes.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        nodes.auditLog.ticketLink = vm.comments.ticketLink;
                    JobService.skipNode(nodes);
                }, function () {

                });
            } else {
                JobService.skipNode(nodes);
            }
        };

        vm.unskipNode = function (data, jobChain) {
            var nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = vm.schedulerIds.selected;
            nodes.nodes.push({jobChain: jobChain.path, node: data.name});

            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = jobChain.path;
                vm.comments.title = jobChain.title;
                vm.comments.node = data.name;
                vm.comments.operation = 'Unskip';
                vm.comments.type = 'Job Chain';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    nodes.auditLog = {};
                    if (vm.comments.comment)
                        nodes.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        nodes.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        nodes.auditLog.ticketLink = vm.comments.ticketLink;
                    JobService.activateNode(nodes);
                }, function () {

                });
            } else {
                JobService.activateNode(nodes);
            }
        };

        vm.stopJob = function (data) {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            jobs.jobs.push({job: data.job.path});

            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = data.job.path;
                vm.comments.title = data.job.title;
                vm.comments.operation = 'Stop';
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
                    JobService.stop(jobs);
                }, function () {

                });
            } else {
                JobService.stop(jobs);
            }
        };

        vm.unstopJob = function (data) {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            jobs.jobs.push({job: data.job.path});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = data.job.path;
                vm.comments.title = data.job.title;
                vm.comments.operation = 'Unstop';
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
                    JobService.unstop(jobs);
                }, function () {

                });
            } else {
                JobService.unstop(jobs);
            }
        };

        vm.assignedDocumentJobChain = function (jobChain) {
            vm.assignObj = {
                type: 'Job Chain',
                path: jobChain.path,
            };
            let obj = {jobschedulerId: vm.schedulerIds.selected, jobChain: jobChain.path};
            vm.comments = {};
            vm.comments.radio = 'predefined';
            let modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/assign-document-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                obj.auditLog = {};
                if (vm.comments.comment)
                    obj.auditLog.comment = vm.comments.comment;
                if (vm.comments.timeSpent)
                    obj.auditLog.timeSpent = vm.comments.timeSpent;

                if (vm.comments.ticketLink)
                    obj.auditLog.ticketLink = vm.comments.ticketLink;
                obj.documentation = vm.assignObj.documentation;
                JobChainService.assign(obj).then(function (res) {
                    jobChain.documentation = vm.assignObj.documentation;
                });
            }, function () {

            });
        };

        vm.assignedDocumentJob = function (job) {
            vm.assignObj = {
                type: 'Job',
                path: job.path,
            };
            let obj = {jobschedulerId: vm.schedulerIds.selected, job: job.path};
            vm.comments = {};
            vm.comments.radio = 'predefined';
            let modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/assign-document-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                obj.auditLog = {};
                if (vm.comments.comment)
                    obj.auditLog.comment = vm.comments.comment;
                if (vm.comments.timeSpent)
                    obj.auditLog.timeSpent = vm.comments.timeSpent;

                if (vm.comments.ticketLink)
                    obj.auditLog.ticketLink = vm.comments.ticketLink;
                obj.documentation = vm.assignObj.documentation;
                JobService.assign(obj).then(function (res) {
                    job.documentation = vm.assignObj.documentation;
                });
            }, function () {

            });
        };

        vm.getDocumentTreeStructure = function () {
            $rootScope.$broadcast('initTree');
        };

        vm.$on('closeDocumentTree', function (evn, path) {
            if (vm.assignObj)
                vm.assignObj.documentation = path;
        });

        vm.unassignedDocumentJobChain = function (jobChain) {
            let obj = {jobschedulerId: vm.schedulerIds.selected, jobChain: jobChain.path};
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = jobChain.path;
                vm.comments.operation = 'Unassign Documentation';
                vm.comments.type = 'Job Chain';

                let modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    obj.auditLog = {};
                    if (vm.comments.comment)
                        obj.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        obj.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        obj.auditLog.ticketLink = vm.comments.ticketLink;
                    JobChainService.unassign(obj).then(function () {
                        jobChain.documentation = undefined;
                    });
                }, function () {

                });
            } else {
                JobChainService.unassign(obj).then(function () {
                    jobChain.documentation = undefined;
                });
            }
        };

        vm.unassignedDocumentJob = function (job) {
            let obj = {jobschedulerId: vm.schedulerIds.selected, job: job.path};
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = job.path;
                vm.comments.operation = 'Unassign Documentation';
                vm.comments.type = 'Job';

                let modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    obj.auditLog = {};
                    if (vm.comments.comment)
                        obj.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        obj.auditLog.timeSpent = vm.comments.timeSpent;
                    if (vm.comments.ticketLink)
                        obj.auditLog.ticketLink = vm.comments.ticketLink;
                    JobService.unassign(obj).then(function () {
                        job.documentation = undefined;
                    });
                }, function () {

                });
            } else {
                JobService.unassign(obj).then(function () {
                    job.documentation = undefined;
                });
            }
        };

        function updateNodes(type, path, doc) {
            for (let i = 0; i < vm.jobChain.nodes.length; i++) {
                if (type === 'job') {
                    if (vm.jobChain.nodes[i].job.path === path) {
                        vm.jobChain.nodes[i].job.documentation = doc;
                    }
                } else {
                    if (vm.jobChain.nodes[i].jobChain.path === path) {
                        vm.jobChain.nodes[i].jobChain.documentation = doc;
                    }
                }
            }
            SOSAuth.setJobChain(JSON.stringify(vm.jobChain));
            SOSAuth.save();
            $rootScope.$broadcast('reloadJobChain');
        }

        vm.assignedDocumentation = function (type, path) {
            vm.assignObj = {
                type: type === 'job' ? 'Job' : 'Job Chain',
                path: path,
            };
            let obj = {jobschedulerId: vm.schedulerIds.selected};
            if (type === 'job') {
                obj.job = path;
            } else {
                obj.jobChain = path;
            }
            vm.comments = {};
            vm.comments.radio = 'predefined';
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/assign-document-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                obj.auditLog = {};
                if (vm.comments.comment)
                    obj.auditLog.comment = vm.comments.comment;
                if (vm.comments.timeSpent)
                    obj.auditLog.timeSpent = vm.comments.timeSpent;

                if (vm.comments.ticketLink)
                    obj.auditLog.ticketLink = vm.comments.ticketLink;
                obj.documentation = vm.assignObj.documentation;

                if (type === 'job') {
                    JobService.assign(obj).then(function (res) {

                        updateNodes(type, path, obj.documentation);
                    });
                } else {
                    JobChainService.assign(obj).then(function (res) {
                        updateNodes(type, path, obj.documentation);
                    });
                }
            }, function () {

            });
        };

        vm.unassignedDocumentation = function (type, path) {
            let obj = {jobschedulerId: vm.schedulerIds.selected};
            if (type === 'job') {
                obj.job = path;
            } else {
                obj.jobChain = path;
            }
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = path;
                vm.comments.operation = 'Unassign Documentation';
                vm.comments.type = type === 'job' ? 'Job' : 'Job Chain';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    obj.auditLog = {};
                    if (vm.comments.comment)
                        obj.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        obj.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        obj.auditLog.ticketLink = vm.comments.ticketLink;
                    if (type === 'job') {
                        JobService.unassign(obj).then(function () {
                            updateNodes(type, path);
                        });
                    } else {
                        JobChainService.unassign(obj).then(function () {
                            updateNodes(type, path);
                        });
                    }
                }, function () {

                });
            } else {
                if (type === 'job') {
                    JobService.unassign(obj).then(function () {
                        updateNodes(type, path);
                    });
                } else {
                    JobChainService.unassign(obj).then(function () {
                        updateNodes(type, path);
                    });
                }
            }
        };

        vm.onAdd = function () {
            vm.isStoppedJob = false;
            vm.isStoppedNode = false;
            vm.isSkippedNode = false;
            vm.isActiveNode = false;
            vm.isPendingJob = false;
            vm.isStoppedJobChain = false;
            vm.isJob = false;
            vm.isJobChain = false;

            angular.forEach(vm.selectedNodes, function (value) {
                if (value.job) {
                    vm.isJob = true;
                }
                if (value.jobChain) {
                    vm.isJobChain = true;
                }
                if (value.job && value.state && value.state._text == 'STOPPED') {
                    vm.isStoppedNode = true;
                }
                if (value.job && value.state && value.state._text == 'SKIPPED') {
                    vm.isSkippedNode = true;
                }
                if (value.job && value.state && value.state._text == 'ACTIVE') {
                    vm.isActiveNode = true;
                }
                if (value.job && value.job.state && value.job.state._text == 'STOPPED') {
                    vm.isStoppedJob = true;
                }
                if (value.jobChain && value.jobChain.state && value.jobChain.state._text == 'STOPPED') {
                    vm.isStoppedJobChain = true;
                }
                if (value.job && value.job.state && value.job.state._text == 'PENDING') {
                    vm.isPendingJob = true;
                }
            });
        };

        vm.reset = function () {
            vm.object1.nodes = [];
            vm.selectedNodes = [];
        };

        vm.stopJobs = function () {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;

            angular.forEach(vm.selectedNodes, function (value) {
                jobs.jobs.push({job: value.job.path});
            });
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Stop';
                vm.comments.type = 'Job';
                angular.forEach(vm.selectedNodes, function (value, index) {
                    if (index == vm.selectedNodes.length - 1) {
                        vm.comments.name = vm.comments.name + ' ' + value.job.path;
                    } else {
                        vm.comments.name = value.job.path + ', ' + vm.comments.name;
                    }
                });
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
                    JobService.stop(jobs).then(function () {
                        $rootScope.$broadcast('bulkOperationCompleted', {
                            operation: 'stopJobs',
                            status: 'success'
                        });
                    });
                    vm.reset();
                }, function () {

                });
            } else {
                JobService.stop(jobs).then(function () {
                    $rootScope.$broadcast('bulkOperationCompleted', {
                        operation: 'stopJobs',
                        status: 'success'
                    });
                });
                vm.reset();
            }
        };

        vm.unstopJobs = function () {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;

            angular.forEach(vm.selectedNodes, function (value) {
                jobs.jobs.push({job: value.job.path});
            });
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Unstop';
                vm.comments.type = 'Job';
                angular.forEach(vm.selectedNodes, function (value, index) {
                    if (index == vm.selectedNodes.length - 1) {
                        vm.comments.name = vm.comments.name + ' ' + value.job.path;
                    } else {
                        vm.comments.name = value.job.path + ', ' + vm.comments.name;
                    }
                });
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
                    JobService.unstop(jobs).then(function () {
                        $rootScope.$broadcast('bulkOperationCompleted', {operation: 'unstopJobs', status: 'success'});
                    });
                    vm.reset();
                }, function () {

                });
            } else {
                JobService.unstop(jobs).then(function () {
                    $rootScope.$broadcast('bulkOperationCompleted', {operation: 'unstopJobs', status: 'success'});
                });
                vm.reset();
            }

        };

        vm.skipNodes = function () {
            var nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = vm.schedulerIds.selected;

            angular.forEach(vm.selectedNodes, function (value) {
                nodes.nodes.push({jobChain: vm.jobChain.path, node: value.name});
            });
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = vm.jobChain.path;
                vm.comments.title = vm.jobChain.title;
                vm.comments.node = '';
                vm.comments.operation = 'Skip';
                vm.comments.type = 'Job Chain';
                angular.forEach(vm.selectedNodes, function (value, index) {
                    if (index == vm.selectedNodes.length - 1) {
                        vm.comments.node = vm.comments.node + ' ' + value.name;
                    } else {
                        vm.comments.node = value.name + ', ' + vm.comments.node;
                    }
                });
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    nodes.auditLog = {};
                    if (vm.comments.comment)
                        nodes.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        nodes.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        nodes.auditLog.ticketLink = vm.comments.ticketLink;
                    JobService.skipNode(nodes).then(function () {
                        $rootScope.$broadcast('bulkOperationCompleted', {operation: 'skipNodes', status: 'success'});
                    });
                    vm.reset();
                }, function () {

                });
            } else {
                JobService.skipNode(nodes).then(function () {
                    $rootScope.$broadcast('bulkOperationCompleted', {operation: 'skipNodes', status: 'success'});
                });
                vm.reset();
            }

        };

        vm.unskipNodes = function () {
            var nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = vm.schedulerIds.selected;

            angular.forEach(vm.selectedNodes, function (value) {
                nodes.nodes.push({jobChain: vm.jobChain.path, node: value.name});
            });
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = vm.jobChain.path;
                vm.comments.title = vm.jobChain.title;
                vm.comments.node = '';
                vm.comments.operation = 'Unskip';
                vm.comments.type = 'Job Chain';
                angular.forEach(vm.selectedNodes, function (value, index) {
                    if (index == vm.selectedNodes.length - 1) {
                        vm.comments.node = vm.comments.node + ' ' + value.name;
                    } else {
                        vm.comments.node = value.name + ', ' + vm.comments.node;
                    }
                });
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    nodes.auditLog = {};
                    if (vm.comments.comment)
                        nodes.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        nodes.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        nodes.auditLog.ticketLink = vm.comments.ticketLink;
                    JobService.activateNode(nodes).then(function () {
                        $rootScope.$broadcast('bulkOperationCompleted', {operation: 'unskipNodes', status: 'success'});
                    });
                    vm.reset();
                }, function () {

                });
            } else {
                JobService.activateNode(nodes).then(function () {
                    $rootScope.$broadcast('bulkOperationCompleted', {operation: 'unskipNodes', status: 'success'});
                });
                vm.reset();
            }

        };

        vm.stopNodes = function () {
            var nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = vm.schedulerIds.selected;

            angular.forEach(vm.selectedNodes, function (value) {
                nodes.nodes.push({jobChain: vm.jobChain.path, node: value.name});
            });
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = vm.jobChain.path;
                vm.comments.title = vm.jobChain.title;
                vm.comments.node = '';
                vm.comments.operation = 'Stop';
                vm.comments.type = 'Job Chain';
                angular.forEach(vm.selectedNodes, function (value, index) {
                    if (index == vm.selectedNodes.length - 1) {
                        vm.comments.node = vm.comments.node + ' ' + value.name;
                    } else {
                        vm.comments.node = value.name + ', ' + vm.comments.node;
                    }
                });
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    nodes.auditLog = {};
                    if (vm.comments.comment)
                        nodes.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        nodes.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        nodes.auditLog.ticketLink = vm.comments.ticketLink;
                    JobService.stopNode(nodes).then(function () {
                        $rootScope.$broadcast('bulkOperationCompleted', {operation: 'stopNodes', status: 'success'});
                    });
                    vm.reset();
                }, function () {

                });
            } else {
                JobService.stopNode(nodes).then(function () {
                    $rootScope.$broadcast('bulkOperationCompleted', {operation: 'stopNodes', status: 'success'});
                });
                vm.reset();
            }

        };

        vm.unstopNodes = function () {
            var nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = vm.schedulerIds.selected;

            angular.forEach(vm.selectedNodes, function (value) {
                nodes.nodes.push({jobChain: vm.jobChain.path, node: value.name});
            });
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = vm.jobChain.path;
                vm.comments.title = vm.jobChain.title;
                vm.comments.node = '';
                vm.comments.operation = 'Unstop';
                vm.comments.type = 'Job Chain';
                angular.forEach(vm.selectedNodes, function (value, index) {
                    if (index == vm.selectedNodes.length - 1) {
                        vm.comments.node = vm.comments.node + ' ' + value.name;
                    } else {
                        vm.comments.node = value.name + ', ' + vm.comments.node;
                    }
                });
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    nodes.auditLog = {};
                    if (vm.comments.comment)
                        nodes.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        nodes.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        nodes.auditLog.ticketLink = vm.comments.ticketLink;
                    JobService.activateNode(nodes).then(function () {
                        $rootScope.$broadcast('bulkOperationCompleted', {operation: 'unstopNodes', status: 'success'});
                    });
                }, function () {

                });
            } else {
                JobService.activateNode(nodes).then(function () {
                    $rootScope.$broadcast('bulkOperationCompleted', {operation: 'unstopNodes', status: 'success'});
                });
            }
            vm.reset();
        };

        vm.stopJobChains = function () {
            var jobChains = {};
            jobChains.jobChains = [];
            jobChains.jobschedulerId = vm.schedulerIds.selected;

            angular.forEach(vm.selectedNodes, function (value) {
                jobChains.jobChains.push({jobChain: value.jobChain.path});
            });
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Stop';
                vm.comments.type = 'Job Chain';
                angular.forEach(vm.selectedNodes, function (value, index) {
                    if (index == vm.selectedNodes.length - 1) {
                        vm.comments.name = vm.comments.name + ' ' + value.jobChain.path;
                    } else {
                        vm.comments.name = value.jobChain.path + ', ' + vm.comments.name;
                    }
                });
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobChains.auditLog = {};
                    if (vm.comments.comment)
                        jobChains.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobChains.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobChains.auditLog.ticketLink = vm.comments.ticketLink;
                    JobChainService.stop(jobChains).then(function () {
                        $rootScope.$broadcast('bulkOperationCompleted', {
                            operation: 'stopJobChains',
                            status: 'success'
                        });
                    });
                    vm.reset();
                }, function () {

                });
            } else {
                JobChainService.stop(jobChains).then(function () {
                    $rootScope.$broadcast('bulkOperationCompleted', {
                        operation: 'stopJobChains',
                        status: 'success'
                    });
                });
                vm.reset();
            }
        };

        vm.unstopJobChains = function () {
            var jobChains = {};
            jobChains.jobChains = [];
            jobChains.jobschedulerId = vm.schedulerIds.selected;

            angular.forEach(vm.selectedNodes, function (value) {
                jobChains.jobChains.push({jobChain: value.jobChain.path});
            });
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Unstop';
                vm.comments.type = 'Job Chain';
                angular.forEach(vm.selectedNodes, function (value, index) {
                    if (index == vm.selectedNodes.length - 1) {
                        vm.comments.name = vm.comments.name + ' ' + value.jobChain.path;
                    } else {
                        vm.comments.name = value.jobChain.path + ', ' + vm.comments.name;
                    }
                });
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobChains.auditLog = {};
                    if (vm.comments.comment)
                        jobChains.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobChains.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobChains.auditLog.ticketLink = vm.comments.ticketLink;
                    JobChainService.unstop(jobChains).then(function () {
                        $rootScope.$broadcast('bulkOperationCompleted', {
                            operation: 'unstopJobChains',
                            status: 'success'
                        });
                    });
                    vm.reset();
                }, function () {

                });
            } else {
                JobChainService.unstop(jobChains).then(function () {
                    $rootScope.$broadcast('bulkOperationCompleted', {operation: 'unstopJobChains', status: 'success'});
                });
                vm.reset();
            }

        };

        vm.viewOrders = function (jobChain, state) {
            if (state) {
                vm.orderFilters.filter.state = state;
            } else {
                vm.orderFilters.filter.state = 'ALL';
            }
            $location.path('/job_chain_detail/orders').search(object);
        };

        vm.isLoading = true;
        /**--------------- Checkbox functions -------------*/

        vm.object1 = {};
        vm.allCheck1 = {
            checkbox: false
        };

        var watcher1 = vm.$watchCollection('object1.nodes', function (newNames) {
            if (newNames && newNames.length > 0) {
                vm.allCheck1.checkbox = newNames.length == vm.jobChain.nodes.length;
                vm.isStoppedJob = false;
                vm.isStoppedNode = false;
                vm.isSkippedNode = false;
                vm.isActiveNode = false;
                vm.isPendingJob = false;
                vm.isStoppedJobChain = false;
                vm.isJob = false;
                vm.isJobChain = false;

                angular.forEach(newNames, function (value) {
                    if (value.job) {
                        vm.isJob = true;
                    }
                    if (value.jobChain) {
                        vm.isJobChain = true;
                    }
                    if (value.job && value.state && value.state._text == 'STOPPED') {
                        vm.isStoppedNode = true;
                    }
                    if (value.job && value.state && value.state._text == 'SKIPPED') {
                        vm.isSkippedNode = true;
                    }
                    if (value.job && value.state && value.state._text == 'ACTIVE') {
                        vm.isActiveNode = true;
                    }
                    if (value.job && value.job.state && value.job.state._text == 'STOPPED') {
                        vm.isStoppedJob = true;
                    }
                    if (value.jobChain && value.jobChain.state && value.jobChain.state._text == 'STOPPED') {
                        vm.isStoppedJobChain = true;
                    }
                    if (value.job && value.job.state && value.job.state._text == 'PENDING') {
                        vm.isPendingJob = true;
                    }
                });

            } else {
                vm.allCheck1.checkbox = false;
            }
            vm.selectedNodes = angular.copy(vm.object1.nodes);
        });

        vm.checkAllJobChains = function () {
            if (vm.allCheck1.checkbox && vm.jobChain) {
                vm.object1.nodes = vm.jobChain.nodes;
            } else {
                vm.object1.nodes = [];
            }
            vm.selectedNodes = angular.copy(vm.object1.nodes);
        };
        vm.compareFn = function (obj1, obj2) {
            return obj1.name === obj2.name;
        };

        vm.getJobChain = getJobChain;

        function getJobChain(filter) {
            filter.jobschedulerId = vm.schedulerIds.selected;
            return JobChainService.getJobChain(filter);
        }

        vm.getJobChainInfo = getJobChainInfo;

        function getJobChainInfo(filter) {
            filter.jobschedulerId = vm.schedulerIds.selected;
            return JobChainService.getJobChainP(filter);
        }

        vm.isLoading1 = false;

        vm.taskHistoryRequestObj = {};
        vm.showJobHistory = showJobHistory;

        function showJobHistory(nestedJobChain, node, order, skip) {
            vm.isTaskHistory = true;
            vm.isAuditLog = false;
            let obj = {jobschedulerId: vm.schedulerIds.selected};
            obj.limit = parseInt(vm.userPreferences.maxHistoryPerTask,10);
            obj.orders = [{
                jobChain: nestedJobChain ? nestedJobChain.path : vm.jobChain.path
            }];
            if (skip && !_.isEmpty(vm.taskHistoryRequestObj)) {
                obj = vm.taskHistoryRequestObj;
            }
            if (node) {
                vm.jobChain.showHistory = node.name;
                obj.orders[0].state = node.name;
            } else if (order) {
                vm.jobChain.showHistory = order.orderId;
                obj.orders[0].orderId = order.orderId;
            }
            vm.taskHistoryRequestObj = obj;
            TaskService.histories(obj).then(function (res) {
                vm.isLoading1 = true;
                vm.showHistoryPanel = {name: vm.jobChain.path, title: vm.jobChain.title};
                if (nestedJobChain) {
                    vm.isAuditLog = false;
                    vm.showHistoryPanel = {name: nestedJobChain.path, title: nestedJobChain.title}
                }
                vm.showHistoryPanel.taskHistory = res.history;
            }, function () {
                vm.showHistoryPanel.taskHistory = [];
                vm.isLoading1 = true;
            })
        }

        vm.historyRequestObj = {};
        vm.showHistory = showHistory;

        function showHistory(nestedJobChain, node, order, skip, toggle) {
            if (vm.jobChain) {
                vm.isAuditLog = false;
                if (!toggle) {
                    if (vm.userPreferences.historyTab === 'order' || skip) {
                        vm.isTaskHistory = false;
                    } else {
                        showJobHistory(nestedJobChain, node, order);
                        return;
                    }
                } else {
                    showJobHistory(nestedJobChain, node, order);
                    return;
                }
                if (vm.userPreferences.historyTab === 'order' || skip) {
                    vm.isTaskHistory = false;
                } else {
                    showJobHistory(nestedJobChain, node, order);
                    return;
                }
                let obj = {};
                obj.limit = parseInt(vm.userPreferences.maxHistoryPerJobchain,10);
                obj.orders = [{
                    jobChain: nestedJobChain ? nestedJobChain.path : vm.jobChain.path
                }];
                obj.jobschedulerId = $scope.schedulerIds.selected;
                if (node) {
                    vm.jobChain.showHistory = node.name;
                } else if (order) {
                    vm.jobChain.showHistory = order.orderId;
                    obj.orders[0].orderId = order.orderId;
                }
                vm.historyRequestObj = obj;
                OrderService.histories(obj).then(function (res) {
                    vm.historys = res.history;
                    vm.isLoading1 = true;
                    vm.showHistoryPanel = {name: vm.jobChain.path, title: vm.jobChain.title};
                    if (nestedJobChain) {
                        vm.isAuditLog = false;
                        vm.showHistoryPanel = {name: nestedJobChain.path, title: nestedJobChain.title}
                    }
                }, function () {
                    vm.isLoading1 = true;
                });
            }
        }

        vm.showAuditLogs = function (nestedJobChain) {
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.orders = [];
            obj.orders.push({jobChain: nestedJobChain ? nestedJobChain.path : vm.jobChain.path});
            obj.limit = parseInt(vm.userPreferences.maxAuditLogRecords) < parseInt(vm.userPreferences.maxAuditLogPerObject) ? parseInt(vm.userPreferences.maxAuditLogRecords) : parseInt(vm.userPreferences.maxAuditLogPerObject);
            AuditLogService.getLogs(obj).then(function (result) {
                if (result && result.auditLog) {
                    vm.auditLogs = result.auditLog;
                }
                vm.showHistoryPanel = {name: vm.jobChain.path, title: vm.jobChain.title};
                if (nestedJobChain) {
                    vm.isAuditLog = true;
                    vm.showHistoryPanel = {name: nestedJobChain.path, title: nestedJobChain.title}
                }
            });
        };

        vm.hideHistory = function () {
            vm.jobChain.showHistory = '';
            vm.showHistory();
        };

        vm.viewAllHistories = function () {
            vm.taskHistoryTab = CoreService.getHistoryTab();
            vm.taskHistoryTab.type = 'jobChain';
            $state.go('app.history');
        };

        function startAt(order, paramObject) {
            var orders = {};
            orders.orders = [];

            orders.jobschedulerId = vm.schedulerIds.selected;
            var obj = {};
            obj.orderId = order.orderId;
            obj.jobChain = order.jobChain;
            obj.params = order.params;
            obj.state = vm.order.state;
            obj.endState = vm.order.endState;

            if (order.date && order.time) {
                if (order.time === '24:00' || order.time === '24:00:00') {
                    order.date.setDate(order.date.getDate() + 1);
                    order.date.setHours(0);
                    order.date.setMinutes(0);
                    order.date.setSeconds(0);
                } else {
                    order.date.setHours(moment(order.time, 'HH:mm:ss').hours());
                    order.date.setMinutes(moment(order.time, 'HH:mm:ss').minutes());
                    order.date.setSeconds(moment(order.time, 'HH:mm:ss').seconds());
                }
                order.date.setMilliseconds(0);
            }

            if (order.date && order.at == 'later') {
                obj.at = moment(order.date).format("YYYY-MM-DD HH:mm:ss");
                obj.timeZone = order.timeZone;
            } else {
                obj.at = order.atTime;
            }

            if (!obj.params && paramObject.params.length > 0) {
                obj.params = paramObject.params;
            } else if (obj.params && paramObject.params.length > 0) {
                obj.params = obj.params.concat(paramObject.params);
            }
            orders.auditLog = {};
            if (vm.comments.comment) {
                orders.auditLog.comment = vm.comments.comment;
            }

            if (vm.comments.timeSpent) {
                orders.auditLog.timeSpent = vm.comments.timeSpent;
            }

            if (vm.comments.ticketLink) {
                orders.auditLog.ticketLink = vm.comments.ticketLink;
            }
            orders.orders.push(obj);
            OrderService.startOrder(orders);
        }

        function setOrderState(order) {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = vm.schedulerIds.selected;
            if (vm.comments) {
                orders.auditLog = {};
                if (vm.comments.comment) {
                    orders.auditLog.comment = vm.comments.comment;
                }
                if (vm.comments.timeSpent) {
                    orders.auditLog.timeSpent = vm.comments.timeSpent;
                }

                if (vm.comments.ticketLink) {
                    orders.auditLog.ticketLink = vm.comments.ticketLink;
                }
            }

            orders.orders.push({
                orderId: order.orderId,
                jobChain: order.jobChain,
                state: vm.order.state,
                endState: vm.order.endState
            });

            OrderService.setOrderState(orders);
        }

        function setRunTime(order) {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = vm.schedulerIds.selected;
            if (vm.comments) {
                orders.auditLog = {};
                if (vm.comments.comment) {
                    orders.auditLog.comment = vm.comments.comment;
                }
                if (vm.comments.timeSpent) {
                    orders.auditLog.timeSpent = vm.comments.timeSpent;
                }

                if (vm.comments.ticketLink) {
                    orders.auditLog.ticketLink = vm.comments.ticketLink;
                }
            }
            orders.orders.push({
                orderId: order.orderId,
                jobChain: order.jobChain,
                runTime: order.runTime,
                calendars: order.calendars
            });
            OrderService.setRunTime(orders).then(function () {
                $scope.$emit('refreshList');
            });
        }

        function resumeOrderWithParam(order, paramObject) {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = vm.schedulerIds.selected;
            if (vm.comments) {
                orders.auditLog = {};
                if (vm.comments.comment) {
                    orders.auditLog.comment = vm.comments.comment;
                }
                if (vm.comments.timeSpent) {
                    orders.auditLog.timeSpent = vm.comments.timeSpent;
                }

                if (vm.comments.ticketLink) {
                    orders.auditLog.ticketLink = vm.comments.ticketLink;
                }
            }

            if (order.params) {
                order.params = order.params.concat(paramObject.params);
            } else {
                order.params = paramObject.params;
            }

            if (order.params && order.params.length > 0) {
                orders.orders.push({
                    orderId: order.orderId,
                    jobChain: order.jobChain,
                    params: order.params,
                    state: vm.order.state,
                    endState: vm.order.endState
                });
            } else {
                orders.orders.push({
                    orderId: order.orderId,
                    jobChain: order.jobChain,
                    state: vm.order.state,
                    endState: vm.order.endState
                });
            }
            delete orders['params'];
            OrderService.resumeOrder(orders);
        }

        function resumeOrderState(order) {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = vm.schedulerIds.selected;
            if (vm.comments) {
                orders.auditLog = {};
                if (vm.comments.comment) {
                    orders.auditLog.comment = vm.comments.comment;
                }
                if (vm.comments.timeSpent) {
                    orders.auditLog.timeSpent = vm.comments.timeSpent;
                }

                if (vm.comments.ticketLink) {
                    orders.auditLog.ticketLink = vm.comments.ticketLink;
                }
            }
            orders.orders.push({
                orderId: order.orderId,
                jobChain: order.jobChain,
                state: vm.order.state,
                endState: vm.order.endState,
                resume: true
            });

            OrderService.setOrderState(orders);

        }

        vm.getDocumentTreeStructure = function () {
            $rootScope.$broadcast('initTree');
        };


        /** --------Flowchart action ------------ **/

        vm.loadGraph = function () {
            reloadGraph();
        };

        vm.export = function () {
            vm.loading1 = true;
            if (vm.editor && vm.editor.graph) {
                vm.exportGraphInProcess = true;
                reloadGraph();
                vm.exportSvg(vm.jobChain.name);
                vm.exportGraphInProcess = false;
                setTimeout(function () {
                    reloadGraph();
                    vm.loading1 = false;
                }, 100);
            }
        };

        vm.zoomIn = function () {
            if (vm.editor && vm.editor.graph) {
                vm.editor.graph.zoomIn();
            }
        };

        vm.zoomOut = function () {
            if (vm.editor && vm.editor.graph) {
                vm.editor.graph.zoomOut();
            }
        };

        vm.actual = function () {
            if (vm.editor && vm.editor.graph) {
                vm.editor.graph.zoomActual();
                center();
            }
        };

        vm.fit = function () {
            if (vm.editor && vm.editor.graph) {
                vm.editor.graph.fit();
                center();
            }
        };

        function center() {
            let dom = document.getElementById('graph');
            let x = 0.5, y = 0.2;
            if (dom.clientWidth !== dom.scrollWidth) {
                x = 0;
            }
            if (dom.clientHeight !== dom.scrollHeight) {
                y = 0;
            }
            vm.editor.graph.center(true, true, x, y);
        }

        $scope.$on('event-started', function () {
            if (vm.events && vm.events.length > 0 && vm.events[0].eventSnapshots && vm.showHistoryPanel) {
                for (let i = 0; i < vm.events[0].eventSnapshots.length; i++) {
                    var path = vm.events[0].eventSnapshots[i].path.split(',')[0];
                    if (vm.events[0].eventSnapshots[i].eventType === "AuditLogChanged" && (vm.events[0].eventSnapshots[i].objectType === "JOBCHAIN" || vm.events[0].eventSnapshots[i].objectType === "ORDER") && (path === vm.showHistoryPanel.path) && vm.isAuditLog && vm.permission.AuditLog.view.status) {
                        if (vm.permission.AuditLog.view.status) {
                            let obj = {};
                            obj.jobschedulerId = vm.schedulerIds.selected;
                            obj.orders = [];
                            obj.orders.push({jobChain: vm.showHistoryPanel.path});
                            obj.limit = parseInt(vm.userPreferences.maxAuditLogRecords) < parseInt(vm.userPreferences.maxAuditLogPerObject) ? parseInt(vm.userPreferences.maxAuditLogRecords) : parseInt(vm.userPreferences.maxAuditLogPerObject);
                            AuditLogService.getLogs(obj).then(function (result) {
                                if (result && result.auditLog) {
                                    vm.auditLogs = result.auditLog;
                                }
                            });
                        }
                        break;
                    }
                }
            }
        });

        $scope.$on('$destroy', function () {
            watcher1();
            if (promise1)
                $timeout.cancel(promise1);
            if (promise2)
                $timeout.cancel(promise2);

            try {
                if (vm.editor) {
                    vm.editor.destroy();
                    vm.editor = null;
                }
            } catch (e) {

            }
        });
    }

    JobChainDetailsCtrl.$inject = ["$scope", "SOSAuth", "ScheduleService", "JobChainService", "$uibModal", "OrderService", "toasty", "$rootScope", "$location", "gettextCatalog", "CoreService"];

    function JobChainDetailsCtrl($scope, SOSAuth, ScheduleService, JobChainService, $uibModal, OrderService, toasty, $rootScope, $location, gettextCatalog, CoreService) {
        var vm = $scope;
        vm.orderFilters = CoreService.getOrderDetailTab();
        var object = $location.search();

        vm.reset = function () {
            vm.object.orders = [];
        };

        var isLoaded = true;

        function volatileInfo() {
            isLoaded = false;
            JobChainService.getJobChain({
                jobschedulerId: vm.schedulerIds.selected,
                jobChain: vm.path,
                maxOrders: vm.userPreferences.maxOrderPerJobchain
            }).then(function (res) {
                isLoaded = true;
                if(res.jobChain.fileOrderSources && res.jobChain.fileOrderSources.length > 0){
                    res.jobChain.fileOrderSources = angular.merge({}, vm.jobChain.fileOrderSources, res.jobChain.fileOrderSources);
                }
                vm.jobChain.fileOrderSources = [];
                let temp = [];
                temp = angular.merge({}, vm.jobChain, res.jobChain);
                temp.nodes = [];
                angular.forEach(vm.jobChain.nodes, function (node1) {
                    if (node1.orders && node1.orders.length > 0) {
                        node1.orders = [];
                    }
                    angular.forEach(res.jobChain.nodes, function (node2) {
                        if (node1.name == node2.name) {
                            node1.match = true;
                            temp.nodes.push(_.merge(node1, node2));
                        }
                    });
                });

                for (let i = 0; i < vm.jobChain.nodes.length; i++) {
                    if (!vm.jobChain.nodes[i].match) {
                        temp.nodes.push(vm.jobChain.nodes[i]);
                    }
                }

                let temp2 = [];
                if (vm.jobChain.nestedJobChains && vm.jobChain.nestedJobChains.length > 0) {
                    angular.forEach(vm.jobChain.nestedJobChains, function (chain1) {
                        angular.forEach(res.nestedJobChains, function (chain2) {
                            if (chain1.path == chain2.path)
                                temp2.push(_.merge(chain1, chain2));
                        });
                    });
                } else {
                    temp2 = res.nestedJobChains;
                }
                vm.jobChain = temp;
                vm.jobChain.nestedJobChains = temp2;
                if (vm.jobChain.nestedJobChains) {
                    angular.forEach(vm.jobChain.nodes, function (node1, index) {
                        angular.forEach(vm.jobChain.nestedJobChains, function (chain1) {
                            if (node1.jobChain.path == chain1.path) {
                                chain1.documentation = vm.jobChain.nodes[index].jobChain.documentation;
                                vm.jobChain.nodes[index].jobChain = chain1;
                            }
                        });
                    });
                }
                SOSAuth.setJobChain(JSON.stringify(vm.jobChain));
                SOSAuth.save();
                $rootScope.$broadcast('reloadJobChain');
            }, function () {
                isLoaded = true;
                SOSAuth.setJobChain(JSON.stringify(vm.jobChain));
                SOSAuth.save();
                $rootScope.$broadcast('reloadJobChain');
            });
        }

        function getJobChain() {
            if (object.path) {
                vm.path = object.path;
                if (vm.path.substring(0, 1) == '/')
                    vm.paths = vm.path.substring(1, vm.path.length).split('/');
                else
                    vm.paths = vm.path.split('/');

                JobChainService.getJobChainP({
                    jobschedulerId: vm.schedulerIds.selected,
                    jobChain: vm.path
                }).then(function (result) {
                    vm.jobChain = result.jobChain;
                    vm.jobChain.nestedJobChains = result.nestedJobChains;
                    volatileInfo();
                });

            } else {
                toasty.error({
                    title: '',
                    msg: gettextCatalog.getString('message.incorrectJobChainPath'),
                    timeout: 0
                });
                window.history.back();
            }
        }

        getJobChain();

        $scope.$on('refreshList', function (event) {
            volatileInfo();
        });

        $rootScope.expand_to = '';
        vm.setPath = function (path) {
            $rootScope.expand_to = {
                name: path,
                path: vm.path
            };
            if (vm.permission.JobChain.view.status) {
                $location.path('/job_chains').search({});
            }
        };

        $scope.$on('$stateChangeSuccess', function (event, toState, param, fromState) {
            vm.object = {};
            vm.object.orders = [];
            vm.orderFilters.isOverview = toState.url == '/overview';
            if (vm.orderFilters.isOverview && fromState.name == 'app.jobChainDetails.orders') {
                setTimeout(function () {
                    $rootScope.$broadcast('reloadJobChain');
                }, 10);
            }

        });

        vm.viewJobChainOrder = function () {
            if (vm.permission.Order.view.status) {
                $location.path('/job_chain_detail/orders').search({path: vm.path});
            }
        };

        vm.viewJobChainDetail = function () {
            $location.path('/job_chain_detail/overview').search({path: vm.path});
        };

        vm.sortBy = function (propertyName) {
            vm.object.orders = [];
            vm.orderFilters.reverse = !vm.orderFilters.reverse;
            vm.orderFilters.filter.sortBy = propertyName;
        };


        function addOrder(order, paramObject) {
            var orders = {};
            orders.jobschedulerId = vm.schedulerIds.selected;
            orders.orders = [];
            let obj = {};
            obj.jobChain = vm._jobChain.path;

            if (order.orderId)
                obj.orderId = order.orderId;
            if (order.endState)
                obj.endState = order.endState;
            if (order.state)
                obj.state = order.state;
            if (order.title)
                obj.title = order.title;

            if (order.fromDate && order.fromTime) {
                if (order.fromTime === '24:00' || order.fromTime === '24:00:00') {
                    order.fromDate.setDate(order.fromDate.getDate() + 1);
                    order.fromDate.setHours(0);
                    order.fromDate.setMinutes(0);
                    order.fromDate.setSeconds(0);
                } else {
                    order.fromDate.setHours(moment(order.fromTime, 'HH:mm:ss').hours());
                    order.fromDate.setMinutes(moment(order.fromTime, 'HH:mm:ss').minutes());
                    order.fromDate.setSeconds(moment(order.fromTime, 'HH:mm:ss').seconds());
                }
                order.fromDate.setMilliseconds(0);
            }
            if (order.fromDate && order.at == 'later') {
                obj.at = moment(order.fromDate).format("YYYY-MM-DD HH:mm:ss");
                obj.timeZone = order.timeZone;
            } else {
                obj.at = order.atTime;
            }

            if (paramObject && paramObject.params.length > 0) {
                obj.params = paramObject.params;
            }
            orders.auditLog = {};
            if (vm.comments.comment) {
                orders.auditLog.comment = vm.comments.comment;
            }
            if (vm.comments.timeSpent) {
                orders.auditLog.timeSpent = vm.comments.timeSpent;
            }

            if (vm.comments.ticketLink) {
                orders.auditLog.ticketLink = vm.comments.ticketLink;
            }
            orders.orders.push(obj);
            OrderService.addOrder(orders);
            vm.object.orders = [];
        }

        vm.addOrder = function (path) {
            ScheduleService.get({
                jobschedulerId: vm.schedulerIds.selected,
                compact: true
            }).then(function (res) {
                vm.schedules = res.schedules;
            });

            vm._jobChain = angular.copy(vm.jobChain);

            JobChainService.getJobChainP({
                jobschedulerId: vm.schedulerIds.selected,
                jobChain: path ? path : vm.jobChain.path
            }).then(function (res) {
                vm._jobChain = res.jobChain;
            });
            vm.order = {};
            vm.paramObject = {};
            vm.paramObject.params = [];
            vm.order.atTime = 'now';
            vm.comments = {};
            vm.comments.radio = 'predefined';
            vm.zones = moment.tz.names();
            if (vm.userPreferences.zone) {
                vm.order.timeZone = vm.userPreferences.zone;
            }

            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/add-order-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                addOrder(vm.order, vm.paramObject);
            }, function () {
                vm.object.orders = [];
            });
        };

        vm.stopJob = function (path) {
            var jobChains = {};
            jobChains.jobChains = [];
            jobChains.jobschedulerId = vm.schedulerIds.selected;
            jobChains.jobChains.push({jobChain: path ? path : vm.jobChain.path});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = path ? path : vm.jobChain.path;
                vm.comments.operation = 'Stop';
                vm.comments.type = 'Job Chain';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobChains.auditLog = {};
                    if (vm.comments.comment)
                        jobChains.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobChains.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobChains.auditLog.ticketLink = vm.comments.ticketLink;

                    JobChainService.stop(jobChains);

                    vm.reset();
                }, function () {

                });
            } else {

                JobChainService.stop(jobChains);

                vm.reset();
            }

        };

        vm.stopJobChain = vm.stopJob;
        vm.unstopJob = function (path) {
            var jobChains = {};
            jobChains.jobChains = [];
            jobChains.jobschedulerId = vm.schedulerIds.selected;
            jobChains.jobChains.push({jobChain: path ? path : vm.jobChain.path});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = path ? path : vm.jobChain.path;
                vm.comments.operation = 'Unstop';
                vm.comments.type = 'Job Chain';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobChains.auditLog = {};
                    if (vm.comments.comment)
                        jobChains.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobChains.auditLog.timeSpent = vm.comments.timeSpent;
                    if (vm.comments.ticketLink)
                        jobChains.auditLog.ticketLink = vm.comments.ticketLink;
                    JobChainService.unstop(jobChains);
                    vm.reset();
                }, function () {

                });
            } else {
                JobChainService.unstop(jobChains);
                vm.reset();
            }

        };

        vm.unstopJobChain = vm.unstopJob;

        /** --------action ------------ **/

        vm.deleteAllOrder = function () {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = vm.schedulerIds.selected;
            angular.forEach(vm.object.orders, function (value) {
                orders.orders.push({orderId: value.orderId, jobChain: value.jobChain});
            });
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Delete';
                vm.comments.type = 'Order';
                angular.forEach(vm.object.orders, function (value, index) {
                    if (index == vm.object.orders.length - 1) {
                        vm.comments.name = vm.comments.name + ' ' + value.path;
                    } else {
                        vm.comments.name = value.path + ', ' + vm.comments.name;
                    }
                });
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    orders.auditLog = {};
                    if (vm.comments.comment)
                        orders.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        orders.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        orders.auditLog.ticketLink = vm.comments.ticketLink;
                    OrderService.deleteOrder(orders).then(function (res) {
                        for (let i = 0; i < vm.object.orders.length; i++) {
                            if (vm.showLogPanel && vm.object.orders[i].path == vm.showLogPanel.path) {
                                vm.showLogPanel = undefined;
                            }
                            for (let j = 0; j < vm.orders.length; j++) {
                                if (vm.object.orders[i].path === vm.orders[j].path) {
                                    vm.orders.splice(j, 1);
                                    break;
                                }
                            }
                        }
                        vm.reset();
                    });
                }, function () {

                });
            } else {
                OrderService.deleteOrder(orders).then(function (res) {
                    for (let i = 0; i < vm.object.orders.length; i++) {
                        if (vm.showLogPanel && vm.object.orders[i].path == vm.showLogPanel.path) {
                            vm.showLogPanel = undefined;
                        }
                        for (let j = 0; j < vm.orders.length; j++) {
                            if (vm.object.orders[i].path == vm.orders[j].path) {
                                vm.orders.splice(j, 1);
                                break;
                            }
                        }
                    }
                    vm.reset();
                });
            }

        };

        vm.suspendAllOrder = function () {
            let orders = {
                orders: [],
                jobschedulerId: vm.schedulerIds.selected
            };
            angular.forEach(vm.object.orders, function (value) {
                orders.orders.push({orderId: value.orderId, jobChain: value.jobChain});
            });
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Suspend';
                vm.comments.type = 'Order';
                angular.forEach(vm.object.orders, function (value, index) {
                    if (index == vm.object.orders.length - 1) {
                        vm.comments.name = vm.comments.name + ' ' + value.path;
                    } else {
                        vm.comments.name = value.path + ', ' + vm.comments.name;
                    }
                });
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    orders.auditLog = {};
                    if (vm.comments.comment)
                        orders.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        orders.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        orders.auditLog.ticketLink = vm.comments.ticketLink;
                    OrderService.suspendOrder(orders);
                    vm.reset();
                }, function () {

                });
            } else {
                OrderService.suspendOrder(orders);
                vm.reset();
            }

        };

        vm.resumeAllOrder = function () {
            let orders = {
                orders: [],
                jobschedulerId: vm.schedulerIds.selected
            };
            angular.forEach(vm.object.orders, function (value) {
                orders.orders.push({orderId: value.orderId, jobChain: value.jobChain});
            });
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Resume';
                vm.comments.type = 'Order';
                angular.forEach(vm.object.orders, function (value, index) {
                    if (index == vm.object.orders.length - 1) {
                        vm.comments.name = vm.comments.name + ' ' + value.path;
                    } else {
                        vm.comments.name = value.path + ', ' + vm.comments.name;
                    }
                });
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    orders.auditLog = {};
                    if (vm.comments.comment)
                        orders.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        orders.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        orders.auditLog.ticketLink = vm.comments.ticketLink;
                    OrderService.resumeOrder(orders);
                    vm.reset();
                }, function () {

                });
            } else {
                OrderService.resumeOrder(orders);
                vm.reset();
            }

        };
        vm.resetAllOrder = function () {
            let orders = {
                orders: [],
                jobschedulerId: vm.schedulerIds.selected
            };
            angular.forEach(vm.object.orders, function (value) {
                orders.orders.push({orderId: value.orderId, jobChain: value.jobChain});
            });
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Reset';
                vm.comments.type = 'Order';
                angular.forEach(vm.object.orders, function (value, index) {
                    if (index == vm.object.orders.length - 1) {
                        vm.comments.name = vm.comments.name + ' ' + value.path;
                    } else {
                        vm.comments.name = value.path + ', ' + vm.comments.name;
                    }
                });
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    orders.auditLog = {};
                    if (vm.comments.comment)
                        orders.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        orders.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        orders.auditLog.ticketLink = vm.comments.ticketLink;
                    OrderService.resetOrder(orders);
                    vm.reset();
                }, function () {

                });
            } else {
                OrderService.resetOrder(orders);
                vm.reset();
            }

        };
        vm.startAllOrder = function () {
            let orders = {
                orders: [],
                jobschedulerId: vm.schedulerIds.selected
            };
            angular.forEach(vm.object.orders, function (value) {
                orders.orders.push({orderId: value.orderId, jobChain: value.jobChain, at: 'now'});
            });
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Start';
                vm.comments.type = 'Order';
                angular.forEach(vm.object.orders, function (value, index) {
                    if (index == vm.object.orders.length - 1) {
                        vm.comments.name = vm.comments.name + ' ' + value.path;
                    } else {
                        vm.comments.name = value.path + ', ' + vm.comments.name;
                    }
                });
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    orders.auditLog = {};
                    if (vm.comments.comment)
                        orders.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        orders.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        orders.auditLog.ticketLink = vm.comments.ticketLink;
                    OrderService.startOrder(orders);
                    vm.reset();
                }, function () {

                });
            } else {
                OrderService.startOrder(orders);
                vm.reset();
            }

        };

        $scope.$on('event-started', function () {
            if (vm.events && vm.events[0] && vm.events[0].eventSnapshots && vm.events[0].eventSnapshots.length > 0) {
                for (let i = 0; i < vm.events[0].eventSnapshots.length; i++) {
                    if (vm.events[0].eventSnapshots[i].path === vm.jobChain.path && vm.events[0].eventSnapshots[i].eventType === "FileBasedRemoved") {
                        $location.path('/job_chains');
                        break;
                    }
                    if (vm.events[0].eventSnapshots[i].path != undefined && (vm.events[0].eventSnapshots[i].eventType === 'JobChainStateChanged' || vm.events[0].eventSnapshots[i].eventType === 'JobStateChanged' || vm.events[0].eventSnapshots[i].eventType === "OrderAdded" || ((vm.events[0].eventSnapshots[i].eventType == 'FileBasedActivated' || vm.events[0].eventSnapshots[i].eventType == "FileBasedRemoved") && (vm.events[0].eventSnapshots[i].objectType == "JOBCHAIN" || vm.events[0].eventSnapshots[i].objectType == "ORDER")) && !vm.events[0].eventSnapshots[i].eventId)) {
                        let path = vm.events[0].eventSnapshots[i].path;
                        let flag = false;
                        if (vm.jobChain.nodes && vm.jobChain.nodes.length > 0) {
                            for (let m = 0; m < vm.jobChain.nodes.length; m++) {
                                if (vm.jobChain.nodes[m].job && path === vm.jobChain.nodes[m].job.path) {
                                    flag = true;
                                    break;
                                }
                                if (vm.jobChain.nodes[m].jobChain && path === vm.jobChain.nodes[m].jobChain.path) {
                                    flag = true;
                                    break;
                                }
                            }
                        }
                        if ((vm.jobChain.path === path || flag) && isLoaded) {
                            volatileInfo();
                        }
                    }
                }
            }
        });

    }

    OrderCtrl.$inject = ["$scope", "$rootScope", "OrderService", "UserService", "orderByFilter", "$uibModal", "SavedFilter", "CoreService", "$timeout", "AuditLogService", "$location", "TaskService"];

    function OrderCtrl($scope, $rootScope, OrderService, UserService, orderBy, $uibModal, SavedFilter, CoreService, $timeout, AuditLogService, $location, TaskService) {
        var vm = $scope;
        vm.orderFilters = CoreService.getOrderTab();
        vm.sideView = CoreService.getSideView();
     
        vm.tree = [];
        vm.allOrders = [];

        vm.my_tree = {};
        vm.isUnique = true;

        vm.object = {};
        vm.object.orders = [];

        vm.filter_tree = {};
        vm.filterTree1 = [];
        vm.object.paths = [];

        vm.reloadState = 'no';

        vm.selectedFiltered = null;
        vm.temp_filter = {};

        vm.reset = function () {
            vm.object.orders = [];
        };

        function resizeSidePanel() {
            setTimeout(function () {
                let ht = ($('.app-header').height() || 61)
                    + ($('.top-header-bar').height() || 16)
                    + $('.sub-header').height() + 24;

                $('#leftPanel').stickySidebar({
                    sidebarTopMargin: ht
                });
            }, 0);
        }

        resizeSidePanel();

        vm.savedOrderFilter = JSON.parse(SavedFilter.orderFilters) || {};
        vm.orderFilterList = [];

        if (vm.orderFilters.selectedView) {
            vm.savedOrderFilter.selected = vm.savedOrderFilter.selected || vm.savedOrderFilter.favorite;
        } else {
            vm.savedOrderFilter.selected = undefined;
        }

        vm.expanding_property = {
            field: "name"
        };
        if (!vm.schedulerIds.selected) {
            vm.isLoading = true;
            return;
        }
        if ($location.search().scheduler_id && $location.search().path) {
            vm.checkSchedulerId();
            getOrderByPath($location.search().path);
        } else {
            if (!vm.savedOrderFilter.selected) {
                initTree();
            }
            checkSharedFilters();
        }

        function getOrderByPath(path) {
            var jobChain = [];
            if (path.indexOf(",") > -1) {
                jobChain = path.split(",");
            }
            let obj = {
                jobschedulerId: vm.schedulerIds.selected
            };
            obj.compact = true;
            obj.orders = [{jobChain: jobChain[0], orderId: jobChain[1]}];

            OrderService.getOrdersP(obj).then(function (result) {
                vm.orders = result.orders;
                if (vm.orders.length > 0)
                    vm.showLogFuc(vm.orders[0]);
                getOrderByPathV(obj);
                vm.isLoading = true;
            }, function () {
                getOrderByPathV(obj);
                vm.isLoading = true;
            });
        }

        function getOrderByPathV(obj) {
            OrderService.get(obj).then(function (res) {
                if (vm.orders && vm.orders.length > 0) {
                    vm.orders = _.merge(vm.orders, res.orders)
                } else {
                    vm.orders = res.orders;
                    if (vm.orders.length > 0)
                        vm.showLogFuc(vm.orders[0]);
                }
                updatePanelHeight();
            });
        }

        function checkSharedFilters() {
            if (vm.permission.JOCConfigurations.share.view) {
                let obj = {};
                obj.jobschedulerId = vm.schedulerIds.selected;
                obj.configurationType = "CUSTOMIZATION";
                obj.objectType = "ORDER";
                obj.shared = true;
                UserService.configurations(obj).then(function (res) {
                    if (res.configurations && res.configurations.length > 0)
                        vm.orderFilterList = res.configurations;
                    getCustomizations();
                }, function () {
                    getCustomizations();
                });
            } else {
                getCustomizations();
            }
        }

        function getCustomizations() {
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.account = vm.permission.user;
            obj.configurationType = "CUSTOMIZATION";
            obj.objectType = "ORDER";
            UserService.configurations(obj).then(function (res) {
                if (vm.orderFilterList && vm.orderFilterList.length > 0) {
                    if (res.configurations && res.configurations.length > 0) {
                        vm.orderFilterList = vm.orderFilterList.concat(res.configurations);
                    }
                    var data = [];
                    for (let i = 0; i < vm.orderFilterList.length; i++) {
                        let flag = true;
                        for (let j = 0; j < data.length; j++) {
                            if (data[j].account === vm.orderFilterList[i].account && data[j].name === vm.orderFilterList[i].name) {
                                flag = false;
                            }
                        }
                        if (flag) {
                            data.push(vm.orderFilterList[i]);
                        }
                    }
                    vm.orderFilterList = data;
                } else {
                    vm.orderFilterList = res.configurations;
                }
                if (vm.savedOrderFilter.selected) {
                    let flag = true;
                    angular.forEach(vm.orderFilterList, function (value) {
                        if (value.id == vm.savedOrderFilter.selected) {
                            flag = false;
                            UserService.configuration({
                                jobschedulerId: value.jobschedulerId,
                                id: value.id
                            }).then(function (conf) {
                                vm.selectedFiltered = JSON.parse(conf.configuration.configurationItem);
                                vm.selectedFiltered.account = value.account;
                                initTree();
                            });
                        }
                    });
                    if (flag) {
                        vm.savedOrderFilter.selected = undefined;
                        initTree();
                    }
                }
            }, function () {
                vm.savedOrderFilter.selected = undefined;
            })
        }

        vm.exportToExcel = function () {
            $rootScope.$broadcast('exportData');
        };

        vm.reload = function () {
            if (vm.reloadState === 'no') {
                vm.allOrders = [];
                vm.folderPath = 'Process aborted';
                vm.reloadState = 'yes';
                vm.orderFilters.expand_to = vm.tree;
            } else if (vm.reloadState === 'yes') {
                vm.reloadState = 'no';
                vm.load();
            }
        };

        /**
         * Function to initialized tree view
         */
        function initTree() {
            vm.reloadState = 'no';
            if (vm.selectedFiltered && vm.selectedFiltered.paths && vm.selectedFiltered.paths.length > 0) {
                var folders = [];
                angular.forEach(vm.selectedFiltered.paths, function (v) {
                    folders.push({folder: v});
                });
            }
            if (vm.selectedFiltered) {
                isCustomizationSelected(true);
            }

            OrderService.tree({
                jobschedulerId: vm.schedulerIds.selected,
                compact: true,
                folders: folders,
                types: ['ORDER']
            }).then(function (res) {
                if ($rootScope.order_expand_to) {
                    vm.tree = res.folders;
                    filteredTreeData();
                } else {
                    if (_.isEmpty(vm.orderFilters.expand_to)) {
                        vm.tree = res.folders;
                        filteredTreeData();
                    } else {
                        vm.orderFilters.expand_to = vm.recursiveTreeUpdate(res.folders, vm.orderFilters.expand_to);
                        vm.tree = vm.orderFilters.expand_to;
                        vm.orderFilters.expand_to = [];
                        vm.changeStatus();
                    }
                }
                vm.isLoading = true;
            }, function () {
                vm.isLoading = true;
            });
        }

        vm.$on('reloadObject', function () {
            navFullTree();
            filteredTreeData();
        });

        vm.treeHandler = function (data) {
            vm.reset();
            if (vm.userPreferences.expandOption === 'both')
                data.expanded = true;
            vm.isExpandNode = false;
            navFullTree();
            vm.reloadState = 'no';
            if (vm.showLogPanel && (vm.showLogPanel.path1 !== data.path)) {
                vm.hideLogPanel();
            }
            data.selected1 = true;
            data.orders = [];
            vm.allOrders = [];
            vm.loading = true;
            expandFolderData(data);
        };
        vm.treeHandler1 = function (data) {
            if (data.expanded) {
                data.folders = orderBy(data.folders, 'name');
            }
        };
        vm.expandNode = function (data) {
            vm.reset();
            navFullTree();
            vm.reloadState = 'no';
            vm.isExpandNode = true;
            if (vm.showLogPanel && (vm.showLogPanel.path1 !== data.path)) {
                vm.hideLogPanel();
            }
            vm.allOrders = [];
            vm.loading = true;
            vm.folderPath = data.name || '/';
            let obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.compact = true;
            obj.folders = [];
            obj.folders.push({folder: data.path, recursive: true});
            if (vm.selectedFiltered && !_.isEmpty(vm.selectedFiltered)) {
                firstVolatileCall(obj, data);
                return
            } else {
                if (vm.orderFilters.filter.state && vm.orderFilters.filter.state !== 'ALL') {
                    if (vm.scheduleState === 'UNREACHABLE') {
                        return;
                    }
                    firstVolatileCall(obj, data);
                    return
                }
            }
            OrderService.getOrdersP(obj).then(function (result) {
                vm.allOrders = result.orders;
                vm.loading = false;
                vm.isLoaded = true;
                volatileInformation(obj, data);
            }, function () {
                vm.isLoaded = true;
                vm.loading = false;
                volatileInformation(obj, data);
            });
        };

        vm.collapseNode = function (data) {
            function recursive(data) {
                data.expanded = !1;
                angular.forEach(data.folders, function (a) {
                    a.expanded = !1;
                    if (a.folders.length > 0) {
                        angular.forEach(a.folders, function (value) {
                            recursive(value);
                        });
                    }
                });
            }

            recursive(data);
        };

        function startTraverseNode(data) {
            function recursive(data) {
                data.expanded = true;
                data.folders = orderBy(data.folders, 'name');

                data.orders = [];
                for (let i = 0; i < vm.allOrders.length; i++) {
                    if (data.path === vm.allOrders[i].path.substring(0, vm.allOrders[i].path.lastIndexOf('/')) || data.path === vm.allOrders[i].path.substring(0, vm.allOrders[i].path.lastIndexOf('/') + 1)) {
                        data.orders.push(vm.allOrders[i]);
                        vm.allOrders[i].path1 = data.path;
                    }
                }
                data.selected1 = true;
                angular.forEach(data.folders, function (a) {
                    recursive(a);
                });
            }

            recursive(data);
        }

        function expandFolderData(data) {
            let obj = {jobschedulerId: vm.schedulerIds.selected, compact: true};
            obj.folders = [{folder: data.path, recursive: false}];
            if (vm.selectedFiltered && !_.isEmpty(vm.selectedFiltered)) {
                firstVolatileCall(obj, null, data);
                return
            } else {
                if (vm.orderFilters.filter.state && vm.orderFilters.filter.state !== 'ALL') {
                    if (vm.scheduleState === 'UNREACHABLE') {
                        return;
                    }
                    firstVolatileCall(obj, null, data);
                    return
                }
            }

            OrderService.getOrdersP(obj).then(function (result) {
                data.orders = result.orders;
                vm.allOrders = result.orders;
                vm.loading = false;
                updatePanelHeight();
                volatileFolderData(data, obj);
            }, function () {
                volatileFolderData(data, obj);
                vm.loading = false;
            });
        }

        function mergeVolatileData(data) {
            for (let x = 0; x < data.orders.length; x++) {
                var flag = true;
                data.orders[x].path1 = data.path;
                for (let i = 0; i < vm.allOrders.length; i++) {
                    if (data.orders[x].path === vm.allOrders[i].path) {
                        flag = false;
                        break;
                    }
                }
                if (flag)
                    vm.allOrders.push(data.orders[x]);
            }
            vm.folderPath = data.name || '/';
            vm.loading = false;
            vm.isLoaded = false;
            updatePanelHeight();

        }

        function volatileFolderData(data1, obj) {
            if (vm.selectedFiltered) {
                obj = parseDate(obj);
            } else {
                if (vm.orderFilters.filter.state && vm.orderFilters.filter.state !== 'ALL') {
                    obj.processingStates = [];
                    obj.processingStates.push(vm.orderFilters.filter.state);
                }
            }
            OrderService.get(obj).then(function (res) {
                let data = [];
                if (data1.orders && data1.orders.length > 0) {
                    for (let x = 0; x < data1.orders.length; x++) {
                        for (let i = 0; i < res.orders.length; i++) {
                            if (data1.orders[x].path === res.orders[i].path) {
                                res.orders[i].title = angular.copy(data1.orders[x].title);
                                res.orders[i].path1 = angular.copy(data1.orders[x].path1);
                                res.orders[i].show = angular.copy(data1.orders[x].show);
                                res.orders[i].documentation = angular.copy(data1.orders[x].documentation);
                                data1.orders[x] = res.orders[i];
                                data.push(data1.orders[x]);
                                res.orders.splice(i, 1);
                                break;
                            }
                        }
                        if (vm.orderFilters && vm.orderFilters.showLogPanel && vm.orderFilters.showLogPanel.path === data1.orders[x].path) {
                            vm.showLogFuc(vm.orderFilters.showLogPanel);
                        }
                    }
                    data = data.concat(res.orders);
                    data1.orders = data;
                } else {
                    data1.orders = res.orders;
                }
                mergeVolatileData(data1)
            }, function () {
                mergeVolatileData(data1);
            });
        }

        function navFullTree() {
            angular.forEach(vm.tree, function (value) {
                value.selected1 = false;
                value.orders = [];
                if (value.expanded) {
                    traverseTree1(value);
                }
            });
        }

        function traverseTree1(data) {
            for (let i = 0; i < data.folders.length; i++) {
                data.folders[i].selected1 = false;
                data.folders[i].orders = [];
                if (data.folders[i].expanded) {
                    traverseTree1(data.folders[i]);
                }
            }
        }

        var i = 1, splitPath = [];

        function checkExpand(data) {
            if (data.selected1) {
                data.orders = [];
                expandFolderData(data);
                vm.folderPath = data.name || '/';
            }
            if (data.folders && data.folders.length > 0) {
                data.folders = orderBy(data.folders, 'name');
                for (let x = 0; x < data.folders.length; x++) {
                    if (vm.expand_to) {
                        if (vm.flag && data.folders[x].path.substring(1, data.folders[x].path.length) === splitPath[i] && i < splitPath.length) {
                            i = i + 1;
                            splitPath[i] = splitPath[i - 1] + '/' + splitPath[i];

                            data.folders[x].expanded = true;
                            if (vm.expand_to.name === data.folders[x].name) {
                                data.folders[x].selected1 = true;
                                vm.flag = false;
                                i = 1;
                                splitPath = [];

                            }
                        }
                    }

                    checkExpand(data.folders[x]);
                    if (data.folders[x].expanded || data.folders[x].selected1) {
                        if (data.path === '/') {
                            data.selected1 = false;
                        }
                    }
                }
            }
        }

        function filteredTreeData() {
            angular.forEach(vm.tree, function (value) {
                if ($rootScope.order_expand_to) {
                    vm.expand_to = angular.copy($rootScope.order_expand_to);
                    splitPath = vm.expand_to.path.split('/');
                    $rootScope.order_expand_to = '';
                    vm.flag = true;
                }
                if (splitPath.length < 2) {
                    value.selected1 = true;
                }
                value.expanded = true;

                vm.allOrders = [];
                checkExpand(value);

            });
        }

        function checkExpandTreeForUpdates(data, obj, obj1) {
            if (data.selected1) {
                obj.folders.push({folder: data.path, recursive: false});
                obj1.folders.push({folder: data.path, recursive: false});
                vm.folderPath = data.name || '/';
            }

            data.folders = orderBy(data.folders, 'name');
            angular.forEach(data.folders, function (value) {
                if (value.expanded || value.selected1)
                    checkExpandTreeForUpdates(value, obj, obj1);
            });
        }

        function insertData(node, x) {
            var _temp = angular.copy(node.orders);
            node.orders = [];
            for (let i = 0; i < x.length; i++) {
                var p = [];
                if (x[i].path.indexOf(",") > -1) {
                    p = x[i].path.split(",");
                } else {
                    p[0] = x[i].path;
                }
                if (node.path === p[0].substring(0, p[0].lastIndexOf('/')) || node.path === p[0].substring(0, p[0].lastIndexOf('/') + 1)) {
                    x[i].path1 = node.path;

                    if (_temp && _temp.length > 0) {
                        for (let j = 0; j < _temp.length; j++) {
                            if (_temp[j].path === x[i].path) {
                                x[i].show = _temp[j].show;
                                if (x[i].show) {
                                    x[i].priority = _temp[j].priority;
                                    x[i].params = _temp[j].params;
                                    x[i].stateText = _temp[j].stateText;
                                    x[i].endState = _temp[j].endState;
                                }
                                break;
                            }
                        }
                    }
                    node.orders.push(x[i]);
                }
            }
            angular.forEach(node.folders, function (value) {
                if (value.expanded || value.selected1)
                    insertData(value, x);
            });
            updatePanelHeight();
        }

        function parseDate(obj) {
            if (vm.selectedFiltered.type) {
                obj.types = vm.selectedFiltered.type;
            }
            if (vm.selectedFiltered.processingState) {
                obj.processingStates = vm.selectedFiltered.processingState;
            }
            return obj;
        }

        function updatePanelHeight() {
            if ($location.search().scheduler_id && $location.search().path) {
                if (!vm.isInfoResize) {
                    _updatePanelHeight('info');
                }
            } else {
                let rsHt = JSON.parse(SavedFilter.resizerHeight) || {};
                if (rsHt.order && !_.isEmpty(rsHt.order)) {
                    if (rsHt.order[vm.folderPath]) {
                        vm.resizerHeight = rsHt.order[vm.folderPath];
                        $('#orderDivId').css('height', vm.resizerHeight);
                    } else {
                        _updatePanelHeight();
                    }
                } else {
                    _updatePanelHeight();
                }
            }
        }

        function _updatePanelHeight(info) {
            setTimeout(function () {
                let num = info ? 20 : 50;
                let ht = (parseInt($('#orderTableId').height()) + num);
                let el = info ? document.getElementById('orderInfoDivId') : document.getElementById('orderDivId');
                if (el && el.scrollWidth > el.clientWidth) {
                    ht = ht + 11;
                }
                if (ht > 450) {
                    ht = 450;
                }
                if (info) {
                    $('#orderInfoDivId').css('height', ht + 'px');
                } else {
                    vm.resizerHeight = ht + 'px';
                    $('#orderDivId').css('height', vm.resizerHeight);
                }
            }, 5);
        }

        function volatileInformation(obj, expandNode) {
            if (vm.selectedFiltered) {
                obj = parseDate(obj);
            } else {
                if (vm.orderFilters.filter.state && vm.orderFilters.filter.state !== 'ALL') {
                    obj.processingStates = [];
                    obj.processingStates.push(vm.orderFilters.filter.state);
                }
            }
            OrderService.get(obj).then(function (res) {
                if (vm.allOrders && vm.allOrders.length > 0) {
                    for (let x = 0; x < vm.allOrders.length; x++) {
                        for (let i = 0; i < res.orders.length; i++) {
                            if (vm.allOrders[x].path === res.orders[i].path) {
                                res.orders[i].title = vm.allOrders[x].title;
                                res.orders[i].path1 = vm.allOrders[x].path1;
                                res.orders[i].show = vm.allOrders[x].show;
                                res.orders[i].documentation = vm.allOrders[x].documentation;
                                vm.allOrders[x] = res.orders[i];
                                res.orders.splice(i, 1);
                                break;
                            }
                        }
                    }
                    vm.allOrders = vm.allOrders.concat(res.orders);
                } else {
                    vm.allOrders = res.orders;
                }

                if (expandNode) {
                    startTraverseNode(expandNode);
                }
                vm.loading = false;
                vm.isLoaded = false;
                updatePanelHeight();
            }, function () {
                if (expandNode) {
                    startTraverseNode(expandNode);
                }
                vm.loading = false;
                vm.isLoaded = false;
            });
        }

        function firstVolatileCall(obj, expandNode, data) {
            if (data)
                vm.folderPath = data.name || '/';
            if (vm.selectedFiltered && !_.isEmpty(vm.selectedFiltered)) {
                obj.regex = vm.selectedFiltered.regex;
                obj = parseDate(obj);
            } else {
                if (vm.orderFilters.filter.state && vm.orderFilters.filter.state !== 'ALL') {
                    obj.processingStates = [];
                    obj.processingStates.push(vm.orderFilters.filter.state);
                }
            }
            OrderService.get(obj).then(function (res) {
                vm.allOrders = res.orders;
                for (let i = 0; i < vm.allOrders.length; i++) {
                    vm.allOrders[i].path1 = vm.allOrders[i].path.substring(0, vm.allOrders[i].path.lastIndexOf('/')) || vm.allOrders[i].path.substring(0, vm.allOrders[i].path.lastIndexOf('/') + 1);
                }
                vm.loading = false;
                if (!expandNode) {
                    angular.forEach(vm.tree, function (node) {
                        insertData(node, vm.allOrders);
                    });
                } else {
                    startTraverseNode(expandNode);
                }
                updatePanelHeight();
            }, function () {
                vm.loading = false;
            });
        }

        vm.changeStatus = function () {
            vm.hideLogPanel();
            vm.reloadState = 'no';
            vm.allOrders = [];
            vm.loading = true;
            var obj = {jobschedulerId: vm.schedulerIds.selected, folders: [], compact: true};
            var obj1 = {jobschedulerId: vm.schedulerIds.selected, folders: [], compact: true};
            angular.forEach(vm.tree, function (value) {
                if (value.expanded || value.selected1)
                    checkExpandTreeForUpdates(value, obj, obj1);
            });
            if (vm.selectedFiltered) {
                obj = parseDate(obj);
                obj1.regex = vm.selectedFiltered.regex;
                firstVolatileCall(obj, null);
                return
            } else {

                if (vm.orderFilters.filter.state && vm.orderFilters.filter.state !== 'ALL') {
                    if (vm.scheduleState === 'UNREACHABLE') {
                        return;
                    }
                    firstVolatileCall(obj, null);
                    return
                }
            }

            OrderService.getOrdersP(obj1).then(function (result) {
                vm.allOrders = result.orders;
                vm.loading = false;
                updatePanelHeight();
                OrderService.get(obj).then(function (res) {
                    if (vm.allOrders && vm.allOrders.length > 0) {
                        for (let m = 0; m < vm.allOrders.length; m++) {
                            for (let i = 0; i < res.orders.length; i++) {
                                if (vm.allOrders[m].path === res.orders[i].path) {
                                    res.orders[i].title = angular.copy(vm.allOrders[m].title);
                                    res.orders[i].show = angular.copy(vm.allOrders[m].show);
                                    res.orders[i].documentation = angular.copy(vm.allOrders[m].documentation);
                                    vm.allOrders[m] = res.orders[i];
                                    res.orders.splice(i, 1);
                                    break;
                                }
                            }
                            if (vm.orderFilters && vm.orderFilters.showLogPanel && vm.orderFilters.showLogPanel.path === vm.allOrders[m].path) {
                                vm.showLogFuc(vm.orderFilters.showLogPanel);
                            }
                        }

                        vm.allOrders = vm.allOrders.concat(res.orders);
                        angular.forEach(vm.tree, function (node) {
                            insertData(node, vm.allOrders);
                        });

                    } else {
                        vm.allOrders = res.orders;
                        angular.forEach(vm.tree, function (node) {
                            insertData(node, res.orders);
                        })
                    }
                }, function () {
                    vm.loading = false;
                    angular.forEach(vm.tree, function (node) {
                        insertData(node, vm.allOrders);
                    })
                });
            }, function () {
                vm.loading = false;
                OrderService.get(obj).then(function (res) {
                    vm.allOrders = res.orders;
                    if (res.orders) {
                        vm.allOrders = res.orders;
                        angular.forEach(vm.tree, function (node) {
                            insertData(node, res.orders);
                        })
                    }
                });
            });
        };

        vm.load = function () {
            initTree();
        };

        vm.showLogFuc = function (value, skip) {
            let orders = {
                jobschedulerId: vm.schedulerIds.selected,
                limit: parseInt(vm.userPreferences.maxNumInOrderOverviewPerObject,10)
            };
            vm.isAuditLog = false;
            if (vm.userPreferences.historyTab === 'order' || skip) {
                vm.isTaskHistory = false;
            } else {
                vm.showJobHistory(value);
                return;
            }
            if (value.historyId) {
                if (vm.userPreferences.maxNumInOrderOverviewPerObject < 2) {
                    orders.historyIds = [value.historyId];
                }
            }
            orders.orders = [];
            orders.orders.push({orderId: value.orderId, jobChain: value.jobChain});
            OrderService.histories(orders).then(function (res) {
                vm.historys = res.history;
            });
            vm.showLogPanel = value;
        };

        vm.showJobHistory = function (order) {
            vm.showLogPanel = order;
            vm.isTaskHistory = true;
            vm.isAuditLog = false;
            let obj = {jobschedulerId: vm.schedulerIds.selected};
            obj.limit = parseInt(vm.userPreferences.maxHistoryPerTask,10);
            if (order.processingState._text === 'RUNNING' || order.processingState._text === 'SUSPENDED' || order.processingState._text === 'SETBACK') {
                obj.historyIds = [];
                obj.historyIds.push({historyId: order.historyId, state: order.state});
            } else {
                obj.orders = [{jobChain: order.jobChain, orderId: order.orderId}];
            }
            TaskService.histories(obj).then(function (res) {
                vm.showLogPanel.taskHistory = res.history;
            }, function () {
                vm.showLogPanel.taskHistory = [];
            })
        };

        function loadAuditLogs(obj) {
            obj.limit = parseInt(vm.userPreferences.maxAuditLogRecords) < parseInt(vm.userPreferences.maxAuditLogPerObject) ? parseInt(vm.userPreferences.maxAuditLogRecords) : parseInt(vm.userPreferences.maxAuditLogPerObject);
            AuditLogService.getLogs(obj).then(function (result) {
                if (result && result.auditLog) {
                    vm.auditLogs = result.auditLog;
                }
            });
        }

        vm.showAuditLogs = function (value) {
            vm.showLogPanel = value;
            vm.isAuditLog = true;
            vm.isTaskHistory = false;
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.orders = [];
            obj.orders.push({jobChain: value.jobChain, orderId: value.orderId});
            if (vm.permission.AuditLog.view.status)
                loadAuditLogs(obj);
        };

        vm.hideLogPanel = function () {
            vm.showLogPanel = undefined;
        };

        /**---------------filter, sorting and pagination -------------------*/
        vm.sortBy = function (propertyName) {
            vm.reset();
            vm.orderFilters.reverse = !vm.orderFilters.reverse;
            vm.orderFilters.filter.sortBy = propertyName;
        };

        vm.saveAsFilter = function (form) {
            var configObj = {};
            configObj.jobschedulerId = vm.schedulerIds.selected;
            configObj.account = vm.permission.user;
            configObj.configurationType = "CUSTOMIZATION";
            configObj.objectType = "ORDER";
            configObj.id = 0;
            configObj.name = vm.orderFilter1.name;

            configObj.configurationItem = JSON.stringify(vm.orderFilter1);
            UserService.saveConfiguration(configObj).then(function (res) {
                configObj.id = res.id;
                vm.orderFilter1.name = '';
                if (form)
                    form.$setPristine();
                vm.orderFilterList.push(configObj);
            });
        };
        vm.advancedSearch = function () {
            vm.isUnique = true;
            vm.showSearchPanel = true;
            vm.isSearchHit = false;
            vm.orderFilter1 = {};
        };
        vm.cancel = function (form) {
            vm.showSearchPanel = false;
            vm.orderFilter1 = undefined;
            if (form)
                form.$setPristine();
            if (vm.isSearchHit) {
                vm.isSearchHit = false;
                vm.changeStatus();
            }
        };

        vm.search = function () {
            vm.isSearchHit = true;
            let obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.compact = true;
            if (vm.orderFilter1.regex) {
                obj.regex = vm.orderFilter1.regex;
            }
            if (vm.orderFilter1.paths && vm.orderFilter1.paths.length > 0) {
                obj.folders = [];
                for (let i = 0; i < vm.orderFilter1.paths.length; i++) {
                    obj.folders.push({folder: vm.orderFilter1.paths[i], recursive: true});
                }
            }
            if (vm.orderFilter1.processingState) {
                obj.processingStates = vm.orderFilter1.processingState;
            }
            if (vm.orderFilter1.type) {
                obj.types = vm.orderFilter1.type;
            }
            vm.folderPath = '/';
            OrderService.get(obj).then(function (res) {
                vm.allOrders = res.orders;
                let obj = {};
                obj.jobschedulerId = vm.schedulerIds.selected;
                obj.compact = true;
                obj.orders = [];
                if (vm.allOrders && vm.allOrders.length > 0) {
                    for (let x = 0; x < vm.allOrders.length; x++) {
                        obj.orders.push({order: vm.allOrders[x].orderId, jobChain: vm.allOrders[x].jobChain});
                        vm.allOrders[x].path1 = vm.allOrders[x].path.substring(0, vm.allOrders[x].path.lastIndexOf('/')) || vm.allOrders[x].path.substring(0, vm.allOrders[x].path.lastIndexOf('/') + 1);
                    }
                } else {
                    vm.hideLogPanel();
                }
                traverseTreeForSearchData();
                OrderService.getOrdersP(obj).then(function (result) {

                    if (result.orders && result.orders.length > 0) {
                        for (let x = 0; x < vm.allOrders.length; x++) {
                            for (let i = 0; i < result.orders.length; i++) {
                                if (vm.allOrders[x].path === result.orders[i].path) {
                                    vm.allOrders[x].title = result.orders[i].title;
                                    vm.allOrders[x].documentation = result.orders[i].documentation;
                                    result.orders.splice(i, 1);
                                    break;
                                }
                            }
                        }
                    }
                });
                updatePanelHeight();

            });
        };

        function traverseTreeForSearchData() {
            function traverseTree1(data) {
                for (let i = 0; i < data.folders.length; i++) {
                    data.folders[i].selected1 = false;
                    data.folders[i].expanded = true;
                    data.folders[i].orders = [];
                    pushOrder(data.folders[i]);
                    traverseTree1(data.folders[i]);
                }
            }

            function navFullTree() {
                for (let i = 0; i < vm.tree.length; i++) {
                    vm.tree[i].selected1 = true;
                    vm.tree[i].expanded = true;
                    vm.tree[i].orders = [];
                    pushOrder(vm.tree[i]);
                    traverseTree1(vm.tree[i]);
                }
            }

            function pushOrder(data) {
                for (let i = 0; i < vm.allOrders.length; i++) {
                    if (data.path === vm.allOrders[i].path1) {
                        data.selected1 = true;
                        data.orders.push(vm.allOrders[i]);
                    }
                }
            }

            navFullTree();
        }

        function isCustomizationSelected(flag) {
            if (flag) {
                vm.temp_filter.state = angular.copy(vm.orderFilters.filter.state);
                vm.orderFilters.filter.state = '';
            } else {
                if (vm.temp_filter.state) {vm.orderFilters.filter.state = angular.copy(vm.temp_filter.state);}
                else {vm.orderFilters.filter.state = 'ALL';}
            }
        }

        vm.applyFilter = function () {
            vm.cancel();
            vm.orderFilter1 = {};
            vm.isUnique = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/order-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                let configObj = {};
                configObj.jobschedulerId = vm.schedulerIds.selected;
                configObj.account = vm.permission.user;
                configObj.configurationType = "CUSTOMIZATION";
                configObj.objectType = "ORDER";
                configObj.id = 0;
                configObj.name = vm.orderFilter1.name;
                configObj.shared = vm.orderFilter1.shared;
                configObj.configurationItem = JSON.stringify(vm.orderFilter1);
                UserService.saveConfiguration(configObj).then(function (res) {
                    configObj.id = res.id;
                    vm.orderFilterList.push(configObj);
                    if (vm.orderFilterList.length == 1) {
                        vm.savedOrderFilter.selected = res.id;
                        vm.orderFilters.selectedView = true;
                        vm.selectedFiltered = vm.orderFilter1;
                        isCustomizationSelected(true);
                        vm.selectedFiltered.account = vm.permission.user;
                        SavedFilter.setOrder(vm.savedOrderFilter);
                        SavedFilter.save();
                        vm.load();

                    }
                });
                vm.object.paths = [];
            }, function () {
                vm.object.paths = [];
            });
        };

        vm.editFilters = function () {
            vm.filters = {};
            vm.filters.list = vm.orderFilterList;
            vm.filters.favorite = vm.savedOrderFilter.favorite;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/edit-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm
            });
        };
        var temp_name = '';
        vm.editFilter = function (filter) {
            vm.cancel();
            vm.action = 'edit';
            vm.isUnique = true;
            temp_name = angular.copy(filter.name);
            UserService.configuration({jobschedulerId: filter.jobschedulerId, id: filter.id}).then(function (conf) {
                vm.orderFilter1 = JSON.parse(conf.configuration.configurationItem);
                vm.orderFilter1.shared = filter.shared;
                vm.paths = vm.orderFilter1.paths;
                vm.object.paths = vm.paths;
            });

            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/edit-order-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                if (vm.savedOrderFilter.selected == filter.id) {
                    vm.selectedFiltered = vm.orderFilter1;
                    vm.orderFilters.selectedView = true;
                    isCustomizationSelected(true);
                    vm.load();
                }
                var configObj = {};
                configObj.jobschedulerId = filter.jobschedulerId;
                configObj.account = filter.account;
                configObj.configurationType = filter.configurationType;
                configObj.objectType = filter.objectType;
                configObj.configurationItem = JSON.stringify(vm.orderFilter1);
                configObj.name = vm.orderFilter1.name;
                configObj.id = filter.id;
                configObj.shared = vm.orderFilter1.shared;
                filter.shared = vm.orderFilter1.shared;
                UserService.saveConfiguration(configObj);
                filter.name = vm.orderFilter1.name;
                temp_name = '';
                vm.object.paths = [];
            }, function () {
                temp_name = '';
                vm.object.paths = [];
            });
        };

        vm.copyFilter = function (filter) {
            vm.action = 'copy';
            vm.isUnique = true;

            UserService.configuration({jobschedulerId: filter.jobschedulerId, id: filter.id}).then(function (conf) {
                vm.orderFilter1 = JSON.parse(conf.configuration.configurationItem);
                vm.orderFilter1.shared = filter.shared;
                vm.paths = vm.orderFilter1.paths;
                vm.object.paths = vm.paths;
                vm.orderFilter1.name = vm.checkCopyName(vm.orderFilterList, filter.name)

            });

            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/edit-order-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                var configObj = {};
                configObj.jobschedulerId = filter.jobschedulerId;
                configObj.account = vm.permission.user;
                configObj.configurationType = "CUSTOMIZATION";
                configObj.objectType = "ORDER";
                configObj.name = vm.orderFilter1.name;
                configObj.id = 0;
                configObj.shared = vm.orderFilter1.shared;
                configObj.configurationItem = JSON.stringify(vm.orderFilter1);
                UserService.saveConfiguration(configObj).then(function (res) {
                    configObj.id = res.id;
                    vm.orderFilterList.push(configObj);
                });
                vm.object.paths = [];
            }, function () {
                vm.object.paths = [];
            });
        };

        vm.deleteFilter = function (filter) {
            UserService.deleteConfiguration({
                jobschedulerId: filter.jobschedulerId,
                id: filter.id
            }).then(function () {
                angular.forEach(vm.orderFilterList, function (value, index) {
                    if (value.name == filter.name && value.account == filter.account) {
                        vm.orderFilterList.splice(index, 1);
                    }
                });
                if (vm.savedOrderFilter.selected == filter.id) {
                    vm.savedOrderFilter.selected = undefined;
                    vm.orderFilters.selectedView = false;
                    vm.selectedFiltered = undefined;
                    isCustomizationSelected(false);
                    vm.load();
                } else {
                    if (vm.orderFilterList.length == 0) {
                        isCustomizationSelected(false);
                        vm.savedOrderFilter.selected = undefined;
                        vm.orderFilters.selectedView = false;
                        vm.selectedFiltered = undefined;
                    }
                }
                SavedFilter.setOrder(vm.savedOrderFilter);
                SavedFilter.save();
            });
        };

        vm.makePrivate = function (configObj) {
            UserService.privateConfiguration({
                jobschedulerId: configObj.jobschedulerId,
                id: configObj.id
            }).then(function (conf) {
                configObj.shared = false;
                if (vm.permission.user != configObj.account) {
                    angular.forEach(vm.orderFilterList, function (value, index) {
                        if (value.id == configObj.id) {
                            vm.orderFilterList.splice(index, 1);
                        }
                    });
                }
            });
        };

        vm.makeShare = function (configObj) {
            UserService.shareConfiguration({
                jobschedulerId: configObj.jobschedulerId,
                id: configObj.id
            }).then(function (conf) {
                configObj.shared = true;
            });
        };

        vm.favorite = function (filter) {
            vm.savedOrderFilter.favorite = filter.id;
            vm.orderFilters.selectedView = true;
            vm.filters.favorite = filter.id;
            SavedFilter.setOrder(vm.savedOrderFilter);
            SavedFilter.save();
            vm.load();
        };

        vm.removeFavorite = function () {
            vm.savedOrderFilter.favorite = '';
            vm.filters.favorite = '';
            SavedFilter.setOrder(vm.savedOrderFilter);
            SavedFilter.save();
        };

        vm.checkFilterName = function () {
            vm.isUnique = true;
            angular.forEach(vm.orderFilterList, function (value) {
                if (vm.orderFilter1.name === value.name && vm.permission.user === value.account && vm.orderFilter1.name !== temp_name) {
                    vm.isUnique = false;
                }
            });
        };

        vm.changeFilter = function (filter) {
            vm.cancel();
            if (filter) {
                vm.savedOrderFilter.selected = filter.id;
                vm.orderFilters.selectedView = true;
                UserService.configuration({jobschedulerId: filter.jobschedulerId, id: filter.id}).then(function (conf) {
                    vm.selectedFiltered = JSON.parse(conf.configuration.configurationItem);
                    vm.selectedFiltered.account = filter.account;
                    if (vm.selectedFiltered.paths) {
                        vm.orderFilters.expand_to = {};
                    }
                    vm.load();
                });
            } else {
                isCustomizationSelected(false);
                vm.savedOrderFilter.selected = filter;
                vm.orderFilters.selectedView = false;
                vm.selectedFiltered = filter;
                vm.load();
            }

            SavedFilter.setOrder(vm.savedOrderFilter);
            SavedFilter.save();

        };

        vm.getTreeStructure = function () {
            OrderService.tree({
                jobschedulerId: vm.schedulerIds.selected,
                compact: true,
                types: ['ORDER']
            }).then(function (res) {
                vm.filterTree1 = res.folders;
                angular.forEach(vm.filterTree1, function (value) {
                    value.expanded = true;
                    if (value.folders) {
                        value.folders = orderBy(value.folders, 'name');
                    }
                });
            }, function () {
                $('#treeModal').modal('hide');
            });

            $('#treeModal').modal('show');
        };

        vm.treeExpand = function (data) {
            angular.forEach(vm.object.paths, function (value) {
                if (data.path === value) {
                    if (data.folders.length > 0) {
                        data.folders = orderBy(data.folders, 'name');
                        angular.forEach(data.folders, function (res) {
                            vm.object.paths.push(res.path);
                        });
                    }
                }
            });
        };

        var watcher1 = $scope.$watchCollection('object.paths', function (newNames) {
            if (newNames && newNames.length > 0) {
                vm.paths = newNames;
            }
        });

        vm.addOrderPaths = function () {
            vm.orderFilter1.paths = vm.paths;
        };
        vm.remove = function (object) {
            for (let i = 0; i < vm.orderFilter1.paths.length; i++) {
                if (angular.equals(vm.orderFilter1.paths[i], object)) {
                    vm.orderFilter1.paths.splice(i, 1);
                    break;
                }
            }
        };

        /** --------action ------------ **/

        vm.deleteAllOrder = function () {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = vm.schedulerIds.selected;
            angular.forEach(vm.object.orders, function (value) {
                orders.orders.push({orderId: value.orderId, jobChain: value.jobChain});
            });
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Delete';
                vm.comments.type = 'Order';
                angular.forEach(vm.object.orders, function (value, index) {
                    if (index == vm.object.orders.length - 1) {
                        vm.comments.name = vm.comments.name + ' ' + value.path;
                    } else {
                        vm.comments.name = value.path + ', ' + vm.comments.name;
                    }
                });
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    orders.auditLog = {};
                    if (vm.comments.comment)
                        orders.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        orders.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        orders.auditLog.ticketLink = vm.comments.ticketLink;
                    OrderService.deleteOrder(orders).then(function (res) {
                        for (let i = 0; i < vm.object.orders.length; i++) {
                            if (vm.showLogPanel && vm.object.orders[i].path == vm.showLogPanel.path) {
                                vm.showLogPanel = undefined;
                            }
                            for (let j = 0; j < vm.allOrders.length; j++) {
                                if (vm.object.orders[i].path == vm.allOrders[j].path) {
                                    vm.allOrders.splice(j, 1);
                                    break;
                                }
                            }

                        }
                        vm.reset();
                    });
                }, function () {

                });
            } else {
                OrderService.deleteOrder(orders).then(function (res) {
                    for (let i = 0; i < vm.object.orders.length; i++) {
                        if (vm.showLogPanel && vm.object.orders[i].path == vm.showLogPanel.path) {
                            vm.showLogPanel = undefined;
                        }
                        for (let j = 0; j < vm.allOrders.length; j++) {
                            if (vm.object.orders[i].path == vm.allOrders[j].path) {
                                vm.allOrders.splice(j, 1);
                                break;
                            }
                        }
                    }
                    vm.reset();
                });
            }

        };
        vm.suspendAllOrder = function () {
            let orders = {
                orders: [],
                jobschedulerId: vm.schedulerIds.selected
            };
            angular.forEach(vm.object.orders, function (value) {
                orders.orders.push({orderId: value.orderId, jobChain: value.jobChain});
            });
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Suspend';
                vm.comments.type = 'Order';
                angular.forEach(vm.object.orders, function (value, index) {
                    if (index == vm.object.orders.length - 1) {
                        vm.comments.name = vm.comments.name + ' ' + value.path;
                    } else {
                        vm.comments.name = value.path + ', ' + vm.comments.name;
                    }
                });
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    orders.auditLog = {};
                    if (vm.comments.comment)
                        orders.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        orders.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        orders.auditLog.ticketLink = vm.comments.ticketLink;
                    OrderService.suspendOrder(orders);
                    vm.reset();

                }, function () {

                });
            } else {
                OrderService.suspendOrder(orders);
                vm.reset();
            }

        };
        vm.resumeAllOrder = function () {
            let orders = {
                orders: [],
                jobschedulerId: vm.schedulerIds.selected
            };
            angular.forEach(vm.object.orders, function (value) {
                orders.orders.push({orderId: value.orderId, jobChain: value.jobChain});
            });
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Resume';
                vm.comments.type = 'Order';
                angular.forEach(vm.object.orders, function (value, index) {
                    if (index == vm.object.orders.length - 1) {
                        vm.comments.name = vm.comments.name + ' ' + value.path;
                    } else {
                        vm.comments.name = value.path + ', ' + vm.comments.name;
                    }
                });
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    orders.auditLog = {};
                    if (vm.comments.comment)
                        orders.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        orders.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        orders.auditLog.ticketLink = vm.comments.ticketLink;
                    OrderService.resumeOrder(orders);
                    vm.reset();
                }, function () {

                });
            } else {
                OrderService.resumeOrder(orders);
                vm.reset();
            }

        };
        vm.resetAllOrder = function () {
            let orders = {
                orders: [],
                jobschedulerId: vm.schedulerIds.selected
            };
            angular.forEach(vm.object.orders, function (value) {
                orders.orders.push({orderId: value.orderId, jobChain: value.jobChain});
            });
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Reset';
                vm.comments.type = 'Order';
                angular.forEach(vm.object.orders, function (value, index) {
                    if (index == vm.object.orders.length - 1) {
                        vm.comments.name = vm.comments.name + ' ' + value.path;
                    } else {
                        vm.comments.name = value.path + ', ' + vm.comments.name;
                    }
                });
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    orders.auditLog = {};
                    if (vm.comments.comment)
                        orders.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        orders.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        orders.auditLog.ticketLink = vm.comments.ticketLink;
                    OrderService.resetOrder(orders);
                    vm.reset();

                }, function () {

                });
            } else {
                OrderService.resetOrder(orders);
                vm.reset();

            }

        };
        vm.startAllOrder = function () {
            let orders = {
                orders: [],
                jobschedulerId: vm.schedulerIds.selected
            };
            angular.forEach(vm.object.orders, function (value) {
                orders.orders.push({orderId: value.orderId, jobChain: value.jobChain, at: 'now'});
            });
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Start';
                vm.comments.type = 'Order';
                angular.forEach(vm.object.orders, function (value, index) {
                    if (index == vm.object.orders.length - 1) {
                        vm.comments.name = vm.comments.name + ' ' + value.path;
                    } else {
                        vm.comments.name = value.path + ', ' + vm.comments.name;
                    }
                });
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    orders.auditLog = {};
                    if (vm.comments.comment)
                        orders.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        orders.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        orders.auditLog.ticketLink = vm.comments.ticketLink;
                    OrderService.startOrder(orders);
                    vm.reset();

                }, function () {

                });
            } else {
                OrderService.startOrder(orders);
                vm.reset();

            }

        };
        vm.hidePanel = function () {
            vm.sideView.order.show = false;
            CoreService.hidePanel();
        };

        vm.showLeftPanel = function () {
            vm.sideView.order.show = true;
            CoreService.showPanel();
        };

        if(!vm.sideView.order.show){
            vm.hidePanel();
        }

        vm.recursiveTreeUpdate = function (scrTree, destTree) {
            if (scrTree && destTree)
                for (let i = 0; i < scrTree.length; i++) {
                    for (let j = 0; j < destTree.length; j++) {
                        if (scrTree[i].path === destTree[j].path) {
                            scrTree[i].orders = destTree[j].orders;
                            scrTree[i].expanded = destTree[j].expanded;
                            scrTree[i].selected = destTree[j].selected;
                            scrTree[i].selected1 = destTree[j].selected1;
                            vm.recursiveTreeUpdate(scrTree[i].folders, destTree[j].folders);
                            destTree.splice(j, 1);
                            break;
                        }
                    }
                }
            return scrTree;
        };

        vm.expandDetails = function () {
            let obj = {
                orders: [],
                jobschedulerId: vm.schedulerIds.selected
            };
            vm.isLoaded = true;
            angular.forEach(vm.allOrders, function (value) {
                obj.orders.push({jobChain: value.jobChain, orderId: value.orderId});
            });

            OrderService.get(obj).then(function (res) {
                for (let x = 0; x < vm.allOrders.length; x++) {
                    for (let i = 0; i < res.orders.length; i++) {
                        if (vm.allOrders[x].path === res.orders[i].path) {
                            vm.allOrders[x] = _.merge(vm.allOrders[x], res.orders[i]);
                            vm.allOrders[x].show = true;
                            res.orders.splice(i, 1);
                            break;
                        }
                    }
                }
                vm.isLoaded = false;
                updatePanelHeight();
            }, function () {
                vm.isLoaded = false;
            });
        };

        vm.collapseDetails = function () {
            for (let x = 0; x < vm.allOrders.length; x++) {
                vm.allOrders[x].show = false;
            }
            setTimeout(function () {
                updatePanelHeight();
            }, 1)
        };

        function checkCurrentSelectedFolders(order) {
            order.path1 = order.path.substring(0, order.path.lastIndexOf('/')) || order.path.substring(0, order.path.lastIndexOf('/') + 1);
            for (let i = 0; i < vm.tree.length; i++) {
                if (vm.tree[i].path !== order.path1) {
                    traverseTreeForUpdateOrder(vm.tree[i], order);
                } else {
                    if (vm.tree[i].selected1) {
                        vm.allOrders.push(order);
                        mergePermanentData(order);
                        break;
                    }
                }
            }
        }

        function traverseTreeForUpdateOrder(data, order) {
            if (data.folders) {
                for (let i = 0; i < data.folders.length; i++) {
                    if (data.folders[i].path !== order.path1) {
                        traverseTreeForUpdateOrder(data.folders[i], order);
                    } else {
                        if (data.folders[i].selected1) {
                            vm.allOrders.push(order);
                            mergePermanentData(order);
                            break;
                        }
                    }
                }
            }
        }

        function mergePermanentData(order) {
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.orderId = order.orderId;
            obj.jobChain = order.jobChain;
            OrderService.getOrdersP(obj).then(function (res) {
                for (let i = 0; i < vm.allOrders.length; i++) {
                    if (vm.allOrders[i].path === res.orders[0].path) {
                        vm.allOrders[i] = _.merge(vm.allOrders[i], res.orders[0]);
                        break;
                    }
                }
            });
        }

        vm.showPanelFuc1 = function (order) {
            order.show = true;
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = vm.schedulerIds.selected;
            orders.orders.push({orderId: order.orderId, jobChain: order.path.split(',')[0]});
            OrderService.get(orders).then(function (res) {
                order = _.merge(order, res.orders[0]);
                updatePanelHeight();
            });
        };

        vm.hidePanelFuc = function (order) {
            order.show = false;
            setTimeout(function () {
                updatePanelHeight();
            }, 1)
        };

        var t1 = '';
        var mapObj = {};
        var isOperationGoingOn = false, isAnyFileEventOnHold = false, isFuncCalled = false,
            orderPaths = [];
        $scope.$on('event-started', function () {
            if (!isOperationGoingOn) {
                if ($location.search().path) {
                    if (vm.events && vm.events[0] && vm.events[0].eventSnapshots && vm.events[0].eventSnapshots.length > 0) {
                        for (let m = 0; m < vm.events[0].eventSnapshots.length; m++) {
                            if (vm.events[0].eventSnapshots[m].path === $location.search().path) {
                                let jobChain = [];
                                if (vm.events[0].eventSnapshots[m].path.indexOf(",") > -1) {
                                    jobChain = vm.events[0].eventSnapshots[m].path.split(",");
                                }
                                let obj = {};
                                obj.jobschedulerId = vm.schedulerIds.selected;
                                obj.compact = true;
                                obj.orders = [{jobChain: jobChain[0], orderId: jobChain[1]}];
                                getOrderByPathV(obj);

                                if (vm.showLogPanel && !vm.isTaskHistory && !vm.isAuditLog) {
                                    let orders = {
                                        jobschedulerId: vm.schedulerIds.selected,
                                        limit: parseInt(vm.userPreferences.maxNumInOrderOverviewPerObject,10)
                                    };
                                    if (vm.showLogPanel.historyId) {
                                        if (vm.userPreferences.maxNumInOrderOverviewPerObject < 2) {
                                            orders.historyIds = [vm.showLogPanel.historyId];
                                        }
                                    }
                                    orders.orders = [];
                                    orders.orders.push({
                                        orderId: vm.showLogPanel.orderId,
                                        jobChain: vm.showLogPanel.jobChain
                                    });
                                    OrderService.histories(orders).then(function (res) {
                                        vm.historys = res.history;
                                    });
                                } else if (vm.showLogPanel && vm.isTaskHistory) {
                                    let obj = {jobschedulerId: vm.schedulerIds.selected};
                                    obj.limit = parseInt(vm.userPreferences.maxHistoryPerTask,10);
                                    if (vm.showLogPanel.processingState && (vm.showLogPanel.processingState._text === 'RUNNING' || vm.showLogPanel.processingState._text === 'SUSPENDED' || vm.showLogPanel.processingState._text === 'SETBACK')) {
                                        obj.historyIds = [];
                                        obj.historyIds.push({historyId: order.historyId, state: vm.showLogPanel.state});
                                    } else {
                                        obj.orders = [{
                                            jobChain: vm.showLogPanel.jobChain,
                                            orderId: vm.showLogPanel.orderId
                                        }];
                                    }
                                    TaskService.histories(obj).then(function (res) {
                                        vm.showLogPanel.taskHistory = res.history;
                                    })
                                } else if (vm.showLogPanel && vm.isAuditLog) {
                                    let obj = {};
                                    obj.jobschedulerId = vm.schedulerIds.selected;
                                    obj.orders = [];
                                    obj.orders.push({
                                        jobChain: vm.showLogPanel.jobChain,
                                        orderId: vm.showLogPanel.orderId
                                    });
                                    loadAuditLogs(obj);
                                }
                            }
                        }
                    }
                    return;
                }
                if (vm.events && vm.events[0] && vm.events[0].eventSnapshots) {
                    for (let m = 0; m < vm.events[0].eventSnapshots.length; m++) {
                        if (vm.events[0].eventSnapshots[m].path && (vm.events[0].eventSnapshots[m].eventType === "OrderStateChanged") && !vm.events[0].eventSnapshots[m].eventId) {
                            let path = [];
                            if (vm.events[0].eventSnapshots[m].path.indexOf(",") > -1) {
                                path = vm.events[0].eventSnapshots[m].path.split(",");
                            } else {
                                path[0] = vm.events[0].eventSnapshots[m].path;
                            }

                            if (vm.orderFilters.filter.state === 'ALL') {
                                angular.forEach(vm.allOrders, function (val, i) {
                                    if (vm.allOrders[i].path === vm.events[0].eventSnapshots[m].path && !vm.loading && (!mapObj[vm.allOrders[i].path])) {
                                        mapObj[vm.events[0].eventSnapshots[m].path] = vm.events[0].eventSnapshots[m].path;
                                        let obj = {};
                                        obj.jobschedulerId = vm.schedulerIds.selected;
                                        obj.orderId = vm.allOrders[i].orderId;
                                        obj.jobChain = vm.allOrders[i].path.split(',')[0];
                                        obj.compact = true;
                                        OrderService.getOrder(obj).then(function (res) {
                                            delete mapObj[vm.events[0].eventSnapshots[m].path];
                                            if (res.order && res.order.path === vm.allOrders[i].path) {
                                                res.order.title = angular.copy(vm.allOrders[i].title);
                                                res.order.documentation = angular.copy(vm.allOrders[i].documentation);
                                                res.order.path1 = angular.copy(vm.allOrders[i].path1);
                                                res.order.params = angular.copy(vm.allOrders[i].params);
                                                res.order.show = angular.copy(vm.allOrders[i].show);
                                                vm.allOrders[i] = res.order;
                                            }
                                        }, function () {
                                            delete mapObj[vm.events[0].eventSnapshots[m].path];
                                        });

                                    }
                                });
                            } else {
                                let obj = {};
                                obj.jobschedulerId = vm.schedulerIds.selected;
                                obj.orderId = path[1];
                                obj.jobChain = path[0];
                                obj.compact = true;
                                OrderService.getOrder(obj).then(function (res) {
                                    if (res.order) {
                                        let flag = false;
                                        for (let i = 0; i < vm.allOrders.length; i++) {
                                            if (vm.allOrders[i].path === res.order.path) {
                                                flag = true;
                                                if (res.order.processingState && res.order.processingState._text === vm.orderFilters.filter.state) {
                                                    res.order.title = angular.copy(vm.allOrders[i].title);
                                                    res.order.documentation = angular.copy(vm.allOrders[i].documentation);
                                                    res.order.path1 = angular.copy(vm.allOrders[i].path1);
                                                    res.order.params = angular.copy(vm.allOrders[i].params);
                                                    res.order.show = angular.copy(vm.allOrders[i].show);
                                                    vm.allOrders[i] = res.order;
                                                } else {
                                                    for (let j = 0; j < vm.allOrders.length; j++) {
                                                        if (vm.allOrders[j].path === res.order.path) {
                                                            vm.allOrders.splice(j, 1);
                                                            break;
                                                        }
                                                    }
                                                }
                                                break;
                                            }
                                        }
                                        if (!flag) {
                                            if (res.order.processingState && res.order.processingState._text === vm.orderFilters.filter.state) {
                                                checkCurrentSelectedFolders(res.order);
                                            }
                                        }
                                    }
                                });
                            }

                        } else if (vm.events[0].eventSnapshots[m].eventType === "OrderAdded" && !vm.events[0].eventSnapshots[m].eventId) {
                            let path1 = vm.events[0].eventSnapshots[m].path.substring(1, vm.events[0].eventSnapshots[m].path.lastIndexOf('/')) || '/';
                            if (path1 === vm.folderPath || vm.isExpandNode) {
                                let obj = {jobschedulerId: vm.schedulerIds.selected, folders: [], compact: true};
                                angular.forEach(vm.tree, function (value) {
                                    if (value.expanded || value.selected1)
                                        checkExpandTreeForUpdates(value, obj, {folders: []});
                                });
                                if (vm.selectedFiltered) {
                                    obj = parseDate(obj);
                                }
                                if (vm.orderFilters.filter.state && vm.orderFilters.filter.state !== 'ALL') {
                                    obj.processingStates = [];
                                    obj.processingStates.push(vm.orderFilters.filter.state);
                                }
                                OrderService.get(obj).then(function (res) {
                                    if (vm.allOrders && vm.allOrders.length > 0) {
                                        for (let m = 0; m < vm.allOrders.length; m++) {
                                            for (let i = 0; i < res.orders.length; i++) {
                                                if (vm.allOrders[m].path === res.orders[i].path) {
                                                    res.orders[i].title = angular.copy(vm.allOrders[m].title);
                                                    res.orders[i].documentation = angular.copy(vm.allOrders[m].documentation);
                                                    res.orders[i].show = angular.copy(vm.allOrders[m].show);
                                                    res.orders[i].path1 = angular.copy(vm.allOrders[m].path1);
                                                    vm.allOrders[m] = res.orders[i];
                                                    res.orders.splice(i, 1);
                                                    break;
                                                }
                                            }
                                        }
                                    }

                                    vm.allOrders = vm.allOrders.concat(res.orders);
                                    angular.forEach(vm.tree, function (node) {
                                        insertData(node, vm.allOrders);
                                    });

                                }, function () {
                                    vm.loading = false;
                                    angular.forEach(vm.tree, function (node) {
                                        insertData(node, vm.allOrders);
                                    })
                                });

                            }
                        } else if (vm.events[0].eventSnapshots[m].eventType === "OrderRemoved" && vm.events[0].eventSnapshots[m].eventId) {
                            for (let i = 0; i < vm.allOrders.length; i++) {
                                if (vm.allOrders[i].path === vm.events[0].eventSnapshots[m].path) {
                                    vm.allOrders.splice(i, 1);
                                    break;
                                }
                            }
                        } else if (vm.showLogPanel && vm.events[0].eventSnapshots[m].eventType === "ReportingChangedOrder" && !vm.events[0].eventSnapshots[m].eventId && !vm.isTaskHistory && !vm.isAuditLog) {
                            let orders = {
                                jobschedulerId: vm.schedulerIds.selected,
                                limit: parseInt(vm.userPreferences.maxNumInOrderOverviewPerObject,10)
                            };
                            if (vm.showLogPanel.historyId) {
                                if (vm.userPreferences.maxNumInOrderOverviewPerObject < 2) {
                                    orders.historyIds = [vm.showLogPanel.historyId];
                                }
                            }
                            orders.orders = [];
                            orders.orders.push({orderId: vm.showLogPanel.orderId, jobChain: vm.showLogPanel.jobChain});
                            OrderService.histories(orders).then(function (res) {
                                vm.historys = res.history;
                            });
                        } else if (vm.showLogPanel && vm.events[0].eventSnapshots[m].eventType === "ReportingChangedJob" && !vm.events[0].eventSnapshots[m].eventId && vm.isTaskHistory) {
                            let obj = {jobschedulerId: vm.schedulerIds.selected};
                            obj.limit = parseInt(vm.userPreferences.maxHistoryPerTask,10);
                            if (vm.showLogPanel.processingState && (vm.showLogPanel.processingState._text === 'RUNNING' || vm.showLogPanel.processingState._text === 'SUSPENDED' || vm.showLogPanel.processingState._text === 'SETBACK')) {
                                obj.historyIds = [];
                                obj.historyIds.push({
                                    historyId: vm.showLogPanel.historyId,
                                    state: vm.showLogPanel.state
                                });
                            } else {
                                obj.orders = [{jobChain: vm.showLogPanel.jobChain, orderId: vm.showLogPanel.orderId}];
                            }
                            TaskService.histories(obj).then(function (res) {
                                vm.showLogPanel.taskHistory = res.history;
                            })
                        } else if (vm.showLogPanel && vm.events[0].eventSnapshots[m].eventType === "AuditLogChanged" && vm.events[0].eventSnapshots[m].objectType === "ORDER" && vm.events[0].eventSnapshots[m].path === vm.showLogPanel.path && vm.isAuditLog) {
                            let obj = {};
                            obj.jobschedulerId = vm.schedulerIds.selected;
                            obj.orders = [];
                            obj.orders.push({jobChain: vm.showLogPanel.jobChain, orderId: vm.showLogPanel.orderId});
                            loadAuditLogs(obj);
                        } else if (vm.events[0].eventSnapshots[m].eventType === "InventoryInitialized" || (vm.events[0].eventSnapshots[m].eventType === "FileBasedActivated" || vm.events[0].eventSnapshots[m].eventType === "FileBasedRemoved") && vm.events[0].eventSnapshots[m].objectType === "ORDER") {
                            if (vm.selectedFiltered && vm.selectedFiltered.paths && vm.selectedFiltered.paths.length > 0) {
                                var folders = [];
                                angular.forEach(vm.selectedFiltered.paths, function (v) {
                                    folders.push({folder: v});
                                });
                            }
                            OrderService.tree({
                                jobschedulerId: vm.schedulerIds.selected,
                                compact: true,
                                folders: folders,
                                types: ['ORDER']
                            }).then(function (res) {
                                vm.tree = vm.recursiveTreeUpdate(angular.copy(res.folders), vm.tree);
                                vm.changeStatus();
                            });
                            break;
                        }
                    }
                }
            } else {
                if (vm.events && vm.events[0] && vm.events[0].eventSnapshots) {
                    for (let j = 0; j < vm.events[0].eventSnapshots.length; j++) {
                        if (vm.events[0].eventSnapshots[j].eventType === 'OrderStateChanged' && !vm.events[0].eventSnapshots[j].eventId) {
                            if (orderPaths.indexOf(vm.events[0].eventSnapshots[j].path) == -1) {
                                orderPaths.push(vm.events[0].eventSnapshots[j].path);
                            }
                        } else if ((vm.events[0].eventSnapshots[j].eventType === "FileBasedActivated" || vm.events[0].eventSnapshots[j].eventType === "FileBasedRemoved") && vm.events[0].eventSnapshots[j].objectType === "ORDER") {
                            isAnyFileEventOnHold = true;
                            break;
                        } else if (vm.events[0].eventSnapshots[j].eventType === "OrderRemoved" && vm.events[0].eventSnapshots[j].eventId) {
                            isAnyFileEventOnHold = true;
                            break;
                        } else if (vm.events[0].eventSnapshots[j].eventType === "OrderAdded" && !vm.events[0].eventSnapshots[j].eventId) {
                            isAnyFileEventOnHold = true;
                            break;
                        }
                    }
                }
            }
        });

        $scope.$on('stopEvents', function () {
            isOperationGoingOn = true;
            isAnyFileEventOnHold = false;
            isFuncCalled = false;
            orderPaths = [];
        });

        $scope.$on('startEvents', function () {
            isOperationGoingOn = false;
            if (!isFuncCalled) {
                refreshUIWithHoldEvents();
            }
        });

        function refreshUIWithHoldEvents() {
            isFuncCalled = true;
            let arr = [];
            for (let i = 0; i < vm.allOrders.length; i++) {
                for (let j = 0; j < orderPaths.length; j++) {
                    if (orderPaths[j] === vm.allOrders[i].path) {
                        arr.push({jobChain: vm.allOrders[i].jobChain, orderId: vm.allOrders[i].orderId});
                        orderPaths.splice(j, 1);
                        break;
                    }
                }
            }
            if (vm.orders && $location.search().path) {
                for (let i = 0; i < vm.orders.length; i++) {
                    for (let j = 0; j < orderPaths.length; j++) {
                        if (orderPaths[j] === vm.orders[i].path) {
                            let obj = {};
                            obj.jobschedulerId = vm.schedulerIds.selected;
                            obj.compact = true;
                            obj.orders = [{jobChain: vm.orders[i].jobChain, orderId: vm.orders[i].orderId}];
                            getOrderByPathV(obj);
                            vm.showLogFuc(vm.orders[i]);
                            break;
                        }
                    }
                }
                return;
            }
            if (!isAnyFileEventOnHold) {
                if (arr.length == 0) {
                    return;
                }
                let obj = {jobschedulerId: vm.schedulerIds.selected};
                obj.orders = arr;

                OrderService.get(obj).then(function (res) {
                    if (vm.allOrders && vm.allOrders.length > 0) {
                        for (let m = 0; m < vm.allOrders.length; m++) {
                            for (let i = 0; i < res.orders.length; i++) {
                                if (vm.allOrders[m].path === res.orders[i].path) {
                                    res.orders[i].title = angular.copy(vm.allOrders[m].title);
                                    res.orders[i].documentation = angular.copy(vm.allOrders[m].documentation);
                                    res.orders[i].show = angular.copy(vm.allOrders[m].show);
                                    res.orders[i].path1 = angular.copy(vm.allOrders[m].path1);
                                    vm.allOrders[m] = res.orders[i];
                                    res.orders.splice(i, 1);
                                    break;
                                }
                            }
                        }
                    }

                });
            } else {
                if ($location.search().path) {
                    return;
                }
                if (vm.selectedFiltered && vm.selectedFiltered.paths && vm.selectedFiltered.paths.length > 0) {
                    var folders = [];
                    angular.forEach(vm.selectedFiltered.paths, function (v) {
                        folders.push({folder: v});
                    });
                }
                OrderService.tree({
                    jobschedulerId: vm.schedulerIds.selected,
                    compact: true,
                    folders: folders,
                    types: ['ORDER']
                }).then(function (res) {
                    vm.tree = vm.recursiveTreeUpdate(angular.copy(res.folders), vm.tree);
                    vm.changeStatus();
                });
            }
        }

        vm.resizerHeight = 450;
        vm.isInfoResize = false;

        vm.resetPanel = function () {
            if ($location.search().scheduler_id && $location.search().path) {
                vm.isInfoResize = false;
                _updatePanelHeight('info');
            } else {
                let rsHt = JSON.parse(SavedFilter.resizerHeight) || {};
                if (rsHt.order && typeof rsHt.order === 'object') {
                    if (rsHt.order[vm.folderPath]) {
                        delete rsHt.order[vm.folderPath];
                        SavedFilter.setResizerHeight(rsHt);
                        SavedFilter.save();
                        _updatePanelHeight();
                    }
                }
            }
        };
        $scope.$on('angular-resizable.resizeEnd', function (event, args) {
            if (args.id === 'orderDivId') {
                let rsHt = JSON.parse(SavedFilter.resizerHeight) || {};
                if (rsHt.order && typeof rsHt.order === 'object') {
                    rsHt.order[vm.folderPath] = args.height;
                } else {
                    rsHt.order = {};
                }
                rsHt.order[vm.folderPath] = args.height;
                SavedFilter.setResizerHeight(rsHt);
                SavedFilter.save();
                vm.resizerHeight = args.height;
            } else if (args.id === 'orderInfoDivId') {
                vm.resizerHeightInfo = args.height;
                vm.isInfoResize = true;
            } else if (args.id === 'leftPanel') {
                vm.sideView.order.width = args.width;
            }
        });

        $scope.$on('$destroy', function () {
            CoreService.setSideView(vm.sideView);
            vm.orderFilters.expand_to = vm.tree;
            vm.orderFilters.showLogPanel = vm.showLogPanel;
            watcher1();
            if (t1) {
                $timeout.cancel(t1);
            }
        });

    }

    OrderOverviewCtrl.$inject = ["$scope", "$rootScope", "OrderService", "$stateParams", "CoreService", "$uibModal", "AuditLogService", "TaskService", "SavedFilter"];

    function OrderOverviewCtrl($scope, $rootScope, OrderService, $stateParams, CoreService, $uibModal, AuditLogService, TaskService, SavedFilter) {
        var vm = $scope;

        vm.orderFilters = CoreService.getOrderTab1();
        vm.orderFilters.filter.state = $stateParams.name;
        vm.orderFilters.currentPage = 1;
        vm.sideView = CoreService.getSideView();
        vm.allOrders = [];
        vm.isLoaded = true;
        vm.object = {};
        vm.object.orders = [];
        vm.reloadState = 'no';

        vm.reset = function () {
            vm.object.orders = [];
        };

        vm.exportToExcel = function () {
            $rootScope.$broadcast('exportData');
        };

        vm.reload = function () {
            if (vm.reloadState === 'no') {
                vm.allOrders = [];
                vm.folderPath = 'Process aborted';
                vm.reloadState = 'yes';
            } else if (vm.reloadState === 'yes') {
                vm.reloadState = 'no';
                vm.isLoading = false;
                vm.init();
            }
        };

        vm.init = function () {
            var obj1 = {};
            vm.isLoaded = true;
            vm.reloadState = 'no';
            obj1.jobschedulerId = vm.schedulerIds.selected;
            obj1.compact = true;
            if(vm.orderFilters.filter.state && vm.orderFilters.filter.state !== 'ALL') {
                obj1.processingStates = [];
                obj1.processingStates.push(vm.orderFilters.filter.state);
            }
            vm.status = vm.orderFilters.filter.state;
            OrderService.get(obj1).then(function (res) {
                let obj = {jobschedulerId: vm.schedulerIds.selected, compact: true, orders: []};
                angular.forEach(res.orders, function (value) {
                    value.path1 = value.path.substring(1, value.path.lastIndexOf('/'));
                    obj.orders.push({jobChain: value.jobChain, orderId: value.orderId});
                });

                OrderService.getOrdersP(obj).then(function (result) {
                    for (let m = 0; m < res.orders.length; m++) {
                        for (let i = 0; i < result.orders.length; i++) {
                            if (res.orders[m].path === result.orders[i].path) {
                                res.orders[i].documentation = result.orders[m].documentation;
                                result.orders.splice(i, 1);
                                break;
                            }
                        }
                    }
                });
                vm.allOrders = res.orders;
                vm.isLoading = true;
                vm.isLoaded = false;
                setTimeout(function () {
                    updatePanelHeight();
                }, 0);
            }, function () {
                vm.isLoading = true;
                vm.isError = true;
                vm.isLoaded = false;
            });
        };

        vm.init();

        vm.showLogFuc = function (value, skip, toggle) {
            let orders = {
                jobschedulerId: vm.schedulerIds.selected,
                limit: parseInt(vm.userPreferences.maxNumInOrderOverviewPerObject,10)
            };
            vm.isAuditLog = false;
            if (!toggle) {
                if (vm.userPreferences.historyTab === 'order' || skip) {
                    vm.isTaskHistory = false;
                } else {
                    vm.showJobHistory(value);
                    return;
                }
            } else {
                vm.showJobHistory(value, toggle);
                return;
            }
            if (value.historyId) {
                if (vm.userPreferences.maxNumInOrderOverviewPerObject < 2) {
                    orders.historyIds = [value.historyId];
                }
            }
            orders.orders = [];
            orders.orders.push({orderId: value.orderId, jobChain: value.jobChain});
            OrderService.histories(orders).then(function (res) {
                vm.historys = res.history;
            });
            vm.showLogPanel = value;
            vm.orderFilters.showLogPanel = vm.showLogPanel;
        };

        vm.showJobHistory = function (order, toggle) {
            vm.showLogPanel = order;
            vm.isTaskHistory = true;
            vm.isAuditLog = false;
            let obj = {jobschedulerId: vm.schedulerIds.selected};
            obj.limit = parseInt(vm.userPreferences.maxHistoryPerTask,10);
            if (order.processingState && (order.processingState._text === 'RUNNING' || order.processingState._text === 'SUSPENDED' || order.processingState._text === 'SETBACK')) {
                obj.historyIds = [];
                obj.historyIds.push({historyId: order.historyId, state: order.state});
            } else if (toggle) {
                obj.orders = [{jobChain: order.jobChain, state: order.state}];
            } else {
                obj.orders = [{jobChain: order.jobChain, orderId: order.orderId}];
            }
            TaskService.histories(obj).then(function (res) {
                vm.showLogPanel.taskHistory = res.history;
            }, function () {
                vm.showLogPanel.taskHistory = [];
            })
        };

        function loadAuditLogs(obj) {
            obj.limit = parseInt(vm.userPreferences.maxAuditLogRecords) < parseInt(vm.userPreferences.maxAuditLogPerObject) ? parseInt(vm.userPreferences.maxAuditLogRecords) : parseInt(vm.userPreferences.maxAuditLogPerObject);
            AuditLogService.getLogs(obj).then(function (result) {
                if (result && result.auditLog) {
                    vm.auditLogs = result.auditLog;
                }
            }, function () {
                vm.auditLogs = [];
            });
        }

        vm.showAuditLogs = function (value) {
            vm.showLogPanel = value;
            vm.orderFilters.showLogPanel = vm.showLogPanel;
            vm.isAuditLog = true;
            vm.isTaskHistory = false;
            let obj = {jobschedulerId: vm.schedulerIds.selected, orders: []};
            obj.orders.push({jobChain: value.jobChain, orderId: value.orderId});
            if (vm.permission.AuditLog.view.status)
                loadAuditLogs(obj);
        };

        if (vm.orderFilters && vm.orderFilters.showLogPanel) {
            vm.showLogFuc(vm.orderFilters.showLogPanel);
        }

        vm.hideLogPanel = function () {
            vm.showLogPanel = undefined;
            vm.orderFilters.showLogPanel = vm.showLogPanel;
        };

        vm.changeStatus = function () {
            vm.hideLogPanel();
            vm.init();
        };
        $scope.$on("orderState", function (evt, state) {
            if (state) {
                vm.isLoaded = true;
                vm.orderFilters.filter.state = state;
                vm.init();
            }
        });

        vm.showPanelFuc1 = function (order) {
            order.show = true;
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = vm.schedulerIds.selected;
            orders.orders.push({orderId: order.orderId, jobChain: order.path.split(',')[0]});
            OrderService.get(orders).then(function (res) {
                order = _.merge(order, res.orders[0]);
                updatePanelHeight();
            });
        };

        vm.hidePanelFuc = function (order) {
            order.show = false;
            setTimeout(function () {
                updatePanelHeight();
            }, 1)
        };
        /**---------------filter, sorting and pagination -------------------*/
        vm.sortBy = function (propertyName) {
            vm.reset();
            vm.orderFilters.reverse = !vm.orderFilters.reverse;
            vm.orderFilters.filter.sortBy = propertyName;
        };

        /** --------action ------------ **/

        vm.deleteAllOrder = function () {
            let orders = {};
            orders.orders = [];
            orders.jobschedulerId = vm.schedulerIds.selected;
            angular.forEach(vm.object.orders, function (value) {
                orders.orders.push({orderId: value.orderId, jobChain: value.jobChain});
            });
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Delete';
                vm.comments.type = 'Order';
                angular.forEach(vm.object.orders, function (value, index) {
                    if (index === vm.object.orders.length - 1) {
                        vm.comments.name = vm.comments.name + ' ' + value.path;
                    } else {
                        vm.comments.name = value.path + ', ' + vm.comments.name;
                    }
                });
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    orders.auditLog = {};
                    if (vm.comments.comment)
                        orders.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        orders.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        orders.auditLog.ticketLink = vm.comments.ticketLink;
                    OrderService.deleteOrder(orders).then(function (res) {
                        for (let i = 0; i < vm.object.orders.length; i++) {
                            if (vm.showLogPanel && vm.object.orders[i].path === vm.showLogPanel.path) {
                                vm.showLogPanel = undefined;
                            }
                            for (let j = 0; j < vm.allOrders.length; j++) {
                                if (vm.object.orders[i].path === vm.allOrders[j].path) {
                                    vm.allOrders.splice(j, 1);
                                    break;
                                }
                            }
                        }
                        vm.reset();
                    });
                }, function () {

                });
            } else {
                OrderService.deleteOrder(orders).then(function (res) {
                    for (let i = 0; i < vm.object.orders.length; i++) {
                        if (vm.showLogPanel && vm.object.orders[i].path === vm.showLogPanel.path) {
                            vm.showLogPanel = undefined;
                        }
                        for (let j = 0; j < vm.allOrders.length; j++) {
                            if (vm.object.orders[i].path === vm.allOrders[j].path) {
                                vm.allOrders.splice(j, 1);
                                break;
                            }
                        }
                    }
                    vm.reset();
                });
            }
        };
        vm.suspendAllOrder = function () {
            let orders = {
                orders: [],
                jobschedulerId: vm.schedulerIds.selected
            };
            angular.forEach(vm.object.orders, function (value) {
                orders.orders.push({orderId: value.orderId, jobChain: value.jobChain});
            });
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Suspend';
                vm.comments.type = 'Order';
                angular.forEach(vm.object.orders, function (value, index) {
                    if (index === vm.object.orders.length - 1) {
                        vm.comments.name = vm.comments.name + ' ' + value.path;
                    } else {
                        vm.comments.name = value.path + ', ' + vm.comments.name;
                    }
                });
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    orders.auditLog = {};
                    if (vm.comments.comment)
                        orders.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        orders.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        orders.auditLog.ticketLink = vm.comments.ticketLink;
                    OrderService.suspendOrder(orders);
                    vm.reset();
                }, function () {

                });
            } else {
                OrderService.suspendOrder(orders);
                vm.reset();
            }

        };
        vm.resumeAllOrder = function () {
            let orders = {
                orders: [],
                jobschedulerId: vm.schedulerIds.selected
            };
            angular.forEach(vm.object.orders, function (value) {
                orders.orders.push({orderId: value.orderId, jobChain: value.jobChain});
            });
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Resume';
                vm.comments.type = 'Order';
                angular.forEach(vm.object.orders, function (value, index) {
                    if (index === vm.object.orders.length - 1) {
                        vm.comments.name = vm.comments.name + ' ' + value.path;
                    } else {
                        vm.comments.name = value.path + ', ' + vm.comments.name;
                    }
                });
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    orders.auditLog = {};
                    if (vm.comments.comment)
                        orders.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        orders.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        orders.auditLog.ticketLink = vm.comments.ticketLink;
                    OrderService.resumeOrder(orders);
                    vm.reset();
                }, function () {

                });
            } else {
                OrderService.resumeOrder(orders);
                vm.reset();
            }

        };
        vm.resetAllOrder = function () {
            let orders = {
                orders: [],
                jobschedulerId: vm.schedulerIds.selected
            };
            angular.forEach(vm.object.orders, function (value) {
                orders.orders.push({orderId: value.orderId, jobChain: value.jobChain});
            });
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Reset';
                vm.comments.type = 'Order';
                angular.forEach(vm.object.orders, function (value, index) {
                    if (index == vm.object.orders.length - 1) {
                        vm.comments.name = vm.comments.name + ' ' + value.path;
                    } else {
                        vm.comments.name = value.path + ', ' + vm.comments.name;
                    }
                });
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    orders.auditLog = {};
                    if (vm.comments.comment)
                        orders.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        orders.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        orders.auditLog.ticketLink = vm.comments.ticketLink;
                    OrderService.resetOrder(orders);
                    vm.reset();
                }, function () {

                });
            } else {
                OrderService.resetOrder(orders);
                vm.reset();
            }

        };
        vm.startAllOrder = function () {
            let orders = {
                orders: [],
                jobschedulerId: vm.schedulerIds.selected
            };
            angular.forEach(vm.object.orders, function (value) {
                orders.orders.push({orderId: value.orderId, jobChain: value.jobChain, at: 'now'});
            });
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Start';
                vm.comments.type = 'Order';
                angular.forEach(vm.object.orders, function (value, index) {
                    if (index == vm.object.orders.length - 1) {
                        vm.comments.name = vm.comments.name + ' ' + value.path;
                    } else {
                        vm.comments.name = value.path + ', ' + vm.comments.name;
                    }
                });
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    orders.auditLog = {};
                    if (vm.comments.comment)
                        orders.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        orders.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        orders.auditLog.ticketLink = vm.comments.ticketLink;
                    OrderService.startOrder(orders);
                    vm.reset();
                }, function () {

                });
            } else {
                OrderService.startOrder(orders);
                vm.reset();
            }

        };

        vm.showLeftPanel = function () {
            vm.sideView.orderOverview.show = true;
            $('#rightPanel').removeClass('fade-in m-l-0');
            $('#leftPanel').show();
            $('.sidebar-btn').hide();
            CoreService.setSideView(vm.sideView);
        };
        var waitForResponse = true, isOperationGoingOn = false, isAnyFileEventOnHold = false, isFuncCalled = false,
            orderPaths = [];

        $scope.$on('event-started', function () {
            if (vm.events && vm.events[0] && vm.events[0].eventSnapshots && !isOperationGoingOn) {
                for (let i = 0; i < vm.events[0].eventSnapshots.length; i++) {
                    if (vm.events[0].eventSnapshots[i].path && vm.events[0].eventSnapshots[i].eventType === "OrderStateChanged" && !vm.events[0].eventSnapshots[i].eventId && waitForResponse) {
                        waitForResponse = false;
                        var obj = {};
                        obj.jobschedulerId = vm.schedulerIds.selected;
                        obj.compact = true;
                        if (vm.orderFilters.filter.state && vm.orderFilters.filter.state !== 'ALL') {
                            obj.processingStates = [];
                            obj.processingStates.push(vm.orderFilters.filter.state);
                        }
                        OrderService.get(obj).then(function (res) {
                            let flag = false;
                            angular.forEach(res.orders, function (value) {
                                value.path1 = value.path.substring(1, value.path.lastIndexOf('/'));
                                if (vm.showLogPanel && vm.showLogPanel.path === value.path) {
                                    flag = true;
                                }
                            });
                            vm.reset();
                            vm.allOrders = res.orders;
                            if (!flag) {
                                vm.showLogPanel = undefined;
                            }
                            waitForResponse = true;
                        }, function () {
                            waitForResponse = true;
                        });
                        $rootScope.$broadcast('reloadSnapshot');
                    }
                    if (vm.showLogPanel && vm.events[0].eventSnapshots[i].eventType === "AuditLogChanged" && vm.events[0].eventSnapshots[i].objectType === "ORDER" && vm.events[0].eventSnapshots[i].path === vm.showLogPanel.path && vm.isAuditLog) {
                        let obj = {};
                        obj.jobschedulerId = vm.schedulerIds.selected;
                        obj.orders = [];
                        obj.orders.push({jobChain: vm.showLogPanel.jobChain, orderId: vm.showLogPanel.orderId});
                        loadAuditLogs(obj);
                    }

                    if (vm.showLogPanel && vm.events[0].eventSnapshots[i].eventType === "ReportingChangedOrder" && vm.events[0].eventSnapshots[i].objectType === "ORDER" && vm.orderFilters.filter.state === 'ALL' && !vm.isTaskHistory && !vm.isAuditLog) {
                        let orders = {
                            jobschedulerId: vm.schedulerIds.selected,
                            limit: parseInt(vm.userPreferences.maxNumInOrderOverviewPerObject,10)
                        };
                        if (vm.showLogPanel.historyId) {
                            if (vm.userPreferences.maxNumInOrderOverviewPerObject < 2) {
                                orders.historyIds = [vm.showLogPanel.historyId];
                            }
                        }
                        orders.orders = [];
                        orders.orders.push({orderId: vm.showLogPanel.orderId, jobChain: vm.showLogPanel.jobChain});
                        OrderService.histories(orders).then(function (res) {
                            vm.historys = res.history;
                        });
                    }
                    if (vm.showLogPanel && vm.events[0].eventSnapshots[i].eventType === "ReportingChangedJob" && vm.events[0].eventSnapshots[i].objectType === "JOB" && vm.orderFilters.filter.state === 'ALL' && vm.isTaskHistory) {
                        let obj = {jobschedulerId: vm.schedulerIds.selected};
                        obj.limit = parseInt(vm.userPreferences.maxHistoryPerTask,10);
                        if (vm.showLogPanel.processingState && (vm.showLogPanel.processingState._text === 'RUNNING' || vm.showLogPanel.processingState._text === 'SUSPENDED' || vm.showLogPanel.processingState._text === 'SETBACK')) {
                            obj.historyIds = [];
                            obj.historyIds.push({historyId: vm.showLogPanel.historyId, state: vm.showLogPanel.state});
                        } else {
                            obj.orders = [{jobChain: vm.showLogPanel.jobChain, orderId: vm.showLogPanel.orderId}];
                        }
                        TaskService.histories(obj).then(function (res) {
                            vm.showLogPanel.taskHistory = res.history;
                        })
                    }
                }
            } else if (vm.events && vm.events[0] && vm.events[0].eventSnapshots) {
                for (let j = 0; j < vm.events[0].eventSnapshots.length; j++) {
                    if (vm.events[0].eventSnapshots[j].eventType === 'OrderStateChanged' && !vm.events[0].eventSnapshots[j].eventId) {
                        if (orderPaths.indexOf(vm.events[0].eventSnapshots[j].path) == -1) {
                            orderPaths.push(vm.events[0].eventSnapshots[j].path);
                        }
                    }
                }
            }
        });

        $scope.$on('stopEvents', function () {
            isOperationGoingOn = true;
            isAnyFileEventOnHold = false;
            isFuncCalled = false;
            orderPaths = [];
        });

        $scope.$on('startEvents', function () {
            isOperationGoingOn = false;
            if (!isFuncCalled) {
                refreshUIWithHoldEvents();
            }
        });

        function refreshUIWithHoldEvents() {
            isFuncCalled = true;
            let arr = [];
            for (let i = 0; i < vm.allOrders.length; i++) {
                for (let j = 0; j < orderPaths.length; j++) {
                    if (orderPaths[j] === vm.allOrders[i].path) {
                        arr.push({jobChain: orderPaths[j]});
                        orderPaths.splice(j, 1);
                        break;
                    }
                }
            }

            if (arr.length === 0) {
                return;
            }

            waitForResponse = false;
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.compact = true;
            if (vm.orderFilters.filter.state && vm.orderFilters.filter.state !== 'ALL') {
                obj.processingStates = [];
                obj.processingStates.push(vm.orderFilters.filter.state);
            }
            OrderService.get(obj).then(function (res) {
                let flag = false;
                angular.forEach(res.orders, function (value) {
                    value.path1 = value.path.substring(1, value.path.lastIndexOf('/'));
                    if (vm.showLogPanel && vm.showLogPanel.path === value.path) {
                        flag = true;
                    }
                });
                vm.reset();
                vm.allOrders = res.orders;
                if (!flag) {
                    vm.showLogPanel = undefined;
                }
                waitForResponse = true;
            }, function () {
                waitForResponse = true;
            });
            $rootScope.$broadcast('reloadSnapshot');
        }

        vm.isSizeChange = false;
        let rsHt = JSON.parse(SavedFilter.resizerHeight) || {};
        if (!_.isEmpty(rsHt) && rsHt.orderOverview) {
            vm.resizerHeight = rsHt.orderOverview;
            vm.isSizeChange = true;
        }

        function updatePanelHeight() {
            if (!vm.isSizeChange) {
                let rsHt = JSON.parse(SavedFilter.resizerHeight) || {};
                if (!_.isEmpty(rsHt) && rsHt.orderOverview) {
                    vm.resizerHeight = rsHt.orderOverview;
                } else {
                    _updatePanelHeight();
                }
            }
        }

        function _updatePanelHeight() {
            setTimeout(function () {
                let ht = (parseInt($('#orderTableId').height()) + 50);
                let el = document.getElementById('orderDivId');
                if (el && el.scrollWidth > el.clientWidth) {
                    ht = ht + 11;
                }
                if (ht > 450) {
                    ht = 450;
                }
                vm.resizerHeight = ht + 'px';
                $('#orderDivId').css('height', vm.resizerHeight);
            }, 5);
        }

        vm.resetPanel = function () {
            let rsHt = JSON.parse(SavedFilter.resizerHeight) || {};
            rsHt.orderOverview = undefined;
            vm.isSizeChange = false;
            SavedFilter.setResizerHeight(rsHt);
            SavedFilter.save();
            _updatePanelHeight();
        };

        $scope.$on('angular-resizable.resizeEnd', function (event, args) {
            if (args.id === 'orderDivId') {
                let rsHt = JSON.parse(SavedFilter.resizerHeight) || {};
                rsHt.orderOverview = args.height;
                vm.isSizeChange = true;
                SavedFilter.setResizerHeight(rsHt);
                SavedFilter.save();
                vm.resizerHeight = args.height;
            }
        });
    }

    OrderFunctionCtrl.$inject = ["$scope", "$rootScope", "OrderService", "$uibModal", '$timeout', "JobChainService", "$location", "$filter"];

    function OrderFunctionCtrl($scope, $rootScope, OrderService, $uibModal, $timeout, JobChainService, $location, $filter) {
        var vm = $scope;
        vm.maxEntryPerPage = vm.userPreferences.maxEntryPerPage;
        var promise1;

        /**--------------- Checkbox functions -------------*/
        vm.allCheck = {
            checkbox: false
        };

        var watcher1 = vm.$watchCollection('object.orders', function (newNames) {
            if (newNames && newNames.length > 0) {
                if (vm.allOrders && vm.allOrders.length > 0) {
                    let _orders = $filter('filter')(vm.allOrders, {path: vm.orderFilters.searchText});
                    vm.allCheck.checkbox = newNames.length === _orders.slice((vm.userPreferences.entryPerPage * (vm.orderFilters.currentPage - 1)), (vm.userPreferences.entryPerPage * vm.orderFilters.currentPage)).length;
                } else if (vm.orders && vm.orders.length > 0) {
                    vm.allCheck.checkbox = newNames.length === vm.orders.slice((vm.userPreferences.entryPerPage * (vm.orderFilters.currentPage - 1)), (vm.userPreferences.entryPerPage * vm.orderFilters.currentPage)).length;
                }

                $rootScope.suspendSelected = false;
                $rootScope.deletedSelected = false;
                $rootScope.runningSelected = false;
                $rootScope.resetSelected = false;
                angular.forEach(newNames, function (value) {
                    if (value.processingState) {
                        if (value.processingState._text === 'SUSPENDED' || value.processingState._text === 'BLACKLIST') {
                            $rootScope.suspendSelected = true;
                        }
                        if (value.processingState._text !== 'PENDING' && value.processingState._text !== 'SETBACK') {
                            $rootScope.runningSelected = true;
                        }
                        if (value._type === 'PERMANENT') {
                            $rootScope.deletedSelected = true;

                        }
                    }
                });
            } else {
                vm.allCheck.checkbox = false;
            }
        });

        vm.checkAll = function (filtered) {
            if (vm.allCheck.checkbox) {
                let _order = [];
                if (filtered) {
                    _order = $filter('orderBy')(filtered, vm.orderFilters.filter.sortBy, vm.orderFilters.reverse);
                    vm.object.orders = _order.slice((vm.userPreferences.entryPerPage * (vm.orderFilters.currentPage - 1)), (vm.userPreferences.entryPerPage * vm.orderFilters.currentPage));
                } else {
                    if (vm.allOrders && vm.allOrders.length > 0)
                        _order = $filter('orderBy')(vm.allOrders, vm.orderFilters.filter.sortBy, vm.orderFilters.reverse);
                    else if (vm.orders && vm.orders.length > 0)
                        _order = $filter('orderBy')(vm.orders, vm.orderFilters.filter.sortBy, vm.orderFilters.reverse);

                    vm.object.orders = _order.slice((vm.userPreferences.entryPerPage * (vm.orderFilters.currentPage - 1)), (vm.userPreferences.entryPerPage * vm.orderFilters.currentPage));
                }

            } else {
                vm.reset();
            }
        };

        var watcher3 = vm.$watch('userPreferences.entryPerPage', function (newNames) {
            if (newNames)
                vm.reset();
        });

        $scope.$on('exportData', function () {
            $('#exportToExcelBtn').attr("disabled", true);
            if (!vm.isIE()) {
                $('#orderTableId').table2excel({
                    exclude: ".tableexport-ignore",
                    filename: "jobscheduler-orders",
                    fileext: ".xls",
                    exclude_img: false,
                    exclude_links: false,
                    exclude_inputs: false
                });
            } else {
                var ExportButtons = document.getElementById('orderTableId');

                var instance = new TableExport(ExportButtons, {
                    formats: ['xlsx'],
                    exportButtons: false,
                    trimWhitespace: true,
                    bootstrap: false
                });
                var exportData = instance.getExportData()['orderTableId']['xlsx'];
                instance.export2file(exportData.data, exportData.mimeType, 'jobscheduler-orders', exportData.fileExtension);
            }
            $('#exportToExcelBtn').attr("disabled", false);
        });

        /**--------------- sorting and pagination -------------------*/
        vm.pageChange = function () {
            vm.reset();
        };

        function startAt(order, paramObject) {
            var orders = {};
            orders.orders = [];

            orders.jobschedulerId = vm.schedulerIds.selected;
            var obj = {};
            obj.orderId = order.orderId;
            obj.jobChain = order.jobChain;
            obj.params = order.params;
            obj.state = vm.order.state;
            obj.endState = vm.order.endState;
            if (order.date && order.time) {
                if (order.time === '24:00' || order.time === '24:00:00') {
                    order.date.setDate(order.date.getDate() + 1);
                    order.date.setHours(0);
                    order.date.setMinutes(0);
                    order.date.setSeconds(0);
                } else {
                    order.date.setHours(moment(order.time, 'HH:mm:ss').hours());
                    order.date.setMinutes(moment(order.time, 'HH:mm:ss').minutes());
                    order.date.setSeconds(moment(order.time, 'HH:mm:ss').seconds());
                }
                order.date.setMilliseconds(0);
            }
            if (order.date && order.at === 'later') {
                obj.at = moment(order.date).format("YYYY-MM-DD HH:mm:ss");
                obj.timeZone = order.timeZone;
            } else
                obj.at = order.atTime;

            if (!obj.params && paramObject.params.length > 0) {
                obj.params = paramObject.params;
            } else if (obj.params && paramObject.params.length > 0) {
                obj.params = obj.params.concat(paramObject.params);
            }
            orders.orders.push(obj);
            orders.auditLog = {};
            if (vm.comments.comment) {
                orders.auditLog.comment = vm.comments.comment;
            }
            if (vm.comments.timeSpent) {
                orders.auditLog.timeSpent = vm.comments.timeSpent;
            }

            if (vm.comments.ticketLink) {
                orders.auditLog.ticketLink = vm.comments.ticketLink;
            }

            OrderService.startOrder(orders).then(function (res) {
                var obj = {};
                obj.orders = [];
                obj.jobschedulerId = vm.schedulerIds.selected;
                obj.orders.push({orderId: order.orderId, jobChain: order.path.split(',')[0]});
                OrderService.get(obj).then(function (res) {
                    order = _.merge(order, res.orders[0]);
                });

            });
            vm.reset();
        }

        vm.startOrder = function (order) {
            var orders = {};
            orders.orders = [];

            orders.jobschedulerId = vm.schedulerIds.selected;
            orders.orders.push({orderId: order.orderId, jobChain: order.path.split(',')[0]});
            OrderService.get(orders).then(function (res) {
                order = _.merge(order, res.orders[0]);
            });
            vm.order = order;
            vm.paramObject = {};
            vm.paramObject.params = [];
            vm.order.atTime = 'now';
            vm.comments = {};
            vm.comments.radio = 'predefined';
            vm.zones = moment.tz.names();

            if (vm.userPreferences.zone) {
                vm.order.timeZone = vm.userPreferences.zone;
            }
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/start-order-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                startAt(vm.order, vm.paramObject);
            }, function () {
                vm.reset();
            });
            JobChainService.getJobChainP({
                jobschedulerId: vm.schedulerIds.selected,
                jobChain: order.jobChain
            }).then(function (res) {
                vm._jobChain = res.jobChain;
                angular.forEach(res.jobChain.endNodes, function (value) {
                    value.isEndNode = true;
                    vm._jobChain.nodes.push(value);
                });
            });
        };

        vm.start = function (order) {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = vm.schedulerIds.selected;
            orders.orders.push({orderId: order.orderId, jobChain: order.jobChain, at: 'now'});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = order.path;
                vm.comments.title = order.title;
                vm.comments.operation = 'Start';
                vm.comments.type = 'Order';
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    orders.auditLog = {};
                    if (vm.comments.comment)
                        orders.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        orders.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        orders.auditLog.ticketLink = vm.comments.ticketLink;

                    OrderService.startOrder(orders);
                    vm.reset();
                }, function () {

                });
            } else {
                OrderService.startOrder(orders);
                vm.reset();
            }

        };

        function setOrderState(order) {

            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = vm.schedulerIds.selected;
            orders.auditLog = {};

            if (vm.comments.comment) {
                orders.auditLog.comment = vm.comments.comment;

            }
            if (vm.comments.timeSpent) {
                orders.auditLog.timeSpent = vm.comments.timeSpent;
            }

            if (vm.comments.ticketLink) {
                orders.auditLog.ticketLink = vm.comments.ticketLink;
            }
            orders.orders.push({
                orderId: order.orderId,
                jobChain: order.jobChain,
                state: vm.order.state,
                endState: vm.order.endState
            });

            OrderService.setOrderState(orders);
            vm.reset();
        }

        vm.setOrderState = function (order) {
            vm.comments = {};
            vm.comments.radio = 'predefined';
            vm.order = angular.copy(order);
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/set-order-state-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                setOrderState(order);
            }, function () {
                vm.reset();
            });

            JobChainService.getJobChainP({
                jobschedulerId: vm.schedulerIds.selected,
                jobChain: order.jobChain
            }).then(function (res) {
                vm._jobChain = res.jobChain;
                angular.forEach(res.jobChain.endNodes, function (value) {
                    if (vm._jobChain.nodes)
                        vm._jobChain.nodes.push(value);
                    else {
                        vm._jobChain.nodes = [];
                        vm._jobChain.nodes.push(value);
                    }
                });
            });
        };

        function setRunTime(order) {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = vm.schedulerIds.selected;
            orders.auditLog = {};
            if (vm.comments.comment) {
                orders.auditLog.comment = vm.comments.comment;
            }
            if (vm.comments.timeSpent) {
                orders.auditLog.timeSpent = vm.comments.timeSpent;
            }

            if (vm.comments.ticketLink) {
                orders.auditLog.ticketLink = vm.comments.ticketLink;
            }
            orders.orders.push({
                orderId: order.orderId,
                jobChain: order.jobChain,
                runTime: order.runTime,
                calendars: order.calendars
            });


            OrderService.setRunTime(orders);
            vm.reset();
        }

        function loadRuntime(order) {
            vm.order = order;
            vm.comments = {};
            vm.comments.radio = 'predefined';
            vm.scheduleAction = undefined;
            OrderService.getRunTime({
                jobschedulerId: vm.schedulerIds.selected,
                jobChain: order.jobChain,
                orderId: order.orderId
            }).then(function (res) {
                if (res.runTime) {
                    vm.runTimes = res.runTime;
                }
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/set-run-time-dialog.html',
                    controller: 'RuntimeEditorDialogCtrl',
                    scope: vm,
                    size: 'lg',
                    backdrop: 'static',
                    windowClass: 'fade-modal'
                });
                modalInstance.result.then(function () {
                    setRunTime(order);
                }, function (res) {
                    if (res === 'ok') {
                        setRunTime(order);
                    }
                });
            });
        }

        vm.setRunTime = function (order) {
            loadRuntime(order);
        };

        vm.assignedDocument = function (order) {
            vm.assignObj = {
                type: 'Order',
                path: order.path
            };
            let obj = {jobschedulerId: vm.schedulerIds.selected, jobChain: order.jobChain, orderId: order.orderId};
            vm.comments = {};
            vm.comments.radio = 'predefined';
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/assign-document-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                obj.auditLog = {};
                if (vm.comments.comment)
                    obj.auditLog.comment = vm.comments.comment;
                if (vm.comments.timeSpent)
                    obj.auditLog.timeSpent = vm.comments.timeSpent;
                if (vm.comments.ticketLink)
                    obj.auditLog.ticketLink = vm.comments.ticketLink;

                obj.documentation = vm.assignObj.documentation;
                OrderService.assign(obj).then(function (res) {
                    order.documentation = vm.assignObj.documentation;
                });
            }, function () {

            });
        };

        vm.getDocumentTreeStructure = function () {
            $rootScope.$broadcast('initTree');
        };

        vm.$on('closeDocumentTree', function (evn, path) {
            vm.assignObj.documentation = path;
        });

        vm.unassignedDocument = function (order) {
            let obj = {jobschedulerId: vm.schedulerIds.selected, jobChain: order.jobChain, orderId: order.orderId};
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = order.orderId;
                vm.comments.operation = 'Unassign Documentation';
                vm.comments.type = 'Order';
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    obj.auditLog = {};
                    if (vm.comments.comment)
                        obj.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        obj.auditLog.timeSpent = vm.comments.timeSpent;
                    if (vm.comments.ticketLink)
                        obj.auditLog.ticketLink = vm.comments.ticketLink;
                    OrderService.unassign(obj).then(function () {
                        order.documentation = undefined;
                    });
                }, function () {

                });
            } else {
                OrderService.unassign(obj).then(function () {
                    order.documentation = undefined;
                });
            }
        };

        /**------------------------------------------------------end run time editor -------------------------------------------------------*/

        vm.suspendOrder = function (order) {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = vm.schedulerIds.selected;
            orders.orders.push({orderId: order.orderId, jobChain: order.jobChain});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = order.path;
                vm.comments.title = order.title;
                vm.comments.operation = 'Suspend';
                vm.comments.type = 'Order';
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    orders.auditLog = {};
                    if (vm.comments.comment) {
                        orders.auditLog.comment = vm.comments.comment;
                    }
                    if (vm.comments.timeSpent) {
                        orders.auditLog.timeSpent = vm.comments.timeSpent;
                    }
                    if (vm.comments.ticketLink) {
                        orders.auditLog.ticketLink = vm.comments.ticketLink;
                    }
                    OrderService.suspendOrder(orders);
                    vm.reset();
                }, function () {

                });
            } else {
                OrderService.suspendOrder(orders);
                vm.reset();
            }
        };

        vm.resumeOrder = function (order) {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = vm.schedulerIds.selected;
            orders.orders.push({orderId: order.orderId, jobChain: order.jobChain});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = order.path;
                vm.comments.title = order.title;
                vm.comments.operation = 'Resume';
                vm.comments.type = 'Order';
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    orders.auditLog = {};
                    if (vm.comments.comment)
                        orders.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        orders.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        orders.auditLog.ticketLink = vm.comments.ticketLink;
                    OrderService.resumeOrder(orders);
                    vm.reset();
                }, function () {

                });
            } else {
                OrderService.resumeOrder(orders);
                vm.reset();
            }

        };

        vm.resumeOrderNextstate = function (order) {
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = order.path;
                vm.comments.title = order.title;
                vm.comments.operation = 'Resume';
                vm.comments.type = 'Order';
            }
            vm.order = angular.copy(order);
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/resume-order-state-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                resumeOrderState(order);
            }, function () {

            });

            JobChainService.getJobChainP({
                jobschedulerId: vm.schedulerIds.selected,
                jobChain: order.jobChain
            }).then(function (res) {
                vm._jobChain = res.jobChain;
                angular.forEach(res.jobChain.endNodes, function (value) {
                    value.isEndNode = true;
                    vm._jobChain.nodes.push(value);
                });
            });
        };

        function resumeOrderState(order) {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = vm.schedulerIds.selected;
            if (vm.comments) {
                orders.auditLog = {};
                if (vm.comments.comment) {
                    orders.auditLog.comment = vm.comments.comment;
                }
                if (vm.comments.timeSpent) {
                    orders.auditLog.timeSpent = vm.comments.timeSpent;
                }

                if (vm.comments.ticketLink) {
                    orders.auditLog.ticketLink = vm.comments.ticketLink;
                }
            }
            orders.orders.push({
                orderId: order.orderId,
                jobChain: order.jobChain,
                state: vm.order.state,
                endState: vm.order.endState,
                resume: true
            });

            OrderService.setOrderState(orders);
            vm.reset();
        }

        function resumeOrderWithParam(order, paramObject) {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = vm.schedulerIds.selected;
            orders.auditLog = {};
            if (vm.comments.comment) {
                orders.auditLog.comment = vm.comments.comment;
            }
            if (vm.comments.timeSpent) {
                orders.auditLog.timeSpent = vm.comments.timeSpent;
            }

            if (vm.comments.ticketLink) {
                orders.auditLog.ticketLink = vm.comments.ticketLink;
            }

            if (order.params) {
                order.params = order.params.concat(paramObject.params);
            } else {
                order.params = paramObject.params;
            }

            if (order.params && order.params.length > 0) {
                orders.orders.push({
                    orderId: order.orderId,
                    jobChain: order.jobChain,
                    params: order.params,
                    state: vm.order.state,
                    endState: vm.order.endState
                });
            } else {
                orders.orders.push({
                    orderId: order.orderId,
                    jobChain: order.jobChain,
                    state: vm.order.state,
                    endState: vm.order.endState
                });
            }
            delete orders['params'];
            OrderService.resumeOrder(orders);
            vm.reset();
        }

        vm.resumeOrderWithParam = function (order) {

            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = vm.schedulerIds.selected;
            orders.orders.push({orderId: order.orderId, jobChain: order.path.split(',')[0]});
            OrderService.get(orders).then(function (res) {
                vm.order = res.orders[0];
            });
            vm.order = angular.copy(order);
            vm.paramObject = {};
            vm.paramObject.params = [];
            vm.comments = {};
            vm.comments.radio = 'predefined';
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/resume-order-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                resumeOrderWithParam(vm.order, vm.paramObject);
            }, function () {
                vm.reset();
            });
            JobChainService.getJobChainP({
                jobschedulerId: vm.schedulerIds.selected,
                jobChain: order.jobChain
            }).then(function (res) {
                vm._jobChain = res.jobChain;
                angular.forEach(res.jobChain.endNodes, function (value) {
                    value.isEndNode = true;
                    vm._jobChain.nodes.push(value);
                });
            });
        };

        vm.resetOrder = function (order) {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = vm.schedulerIds.selected;
            orders.orders.push({orderId: order.orderId, jobChain: order.jobChain});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = order.path;
                vm.comments.title = order.title;
                vm.comments.operation = 'Reset';
                vm.comments.type = 'Order';
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    orders.auditLog = {};
                    if (vm.comments.comment)
                        orders.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        orders.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        orders.auditLog.ticketLink = vm.comments.ticketLink;
                    OrderService.resetOrder(orders);
                    vm.reset();
                }, function () {

                });
            } else {
                OrderService.resetOrder(orders);
                vm.reset();
            }

        };

        vm.removeOrder = function (order) {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = vm.schedulerIds.selected;
            orders.orders.push({orderId: order.orderId, jobChain: order.jobChain});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = order.path;
                vm.comments.title = order.title;
                vm.comments.operation = 'Delete';
                vm.comments.type = 'Order';
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    orders.auditLog = {};
                    if (vm.comments.comment)
                        orders.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        orders.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        orders.auditLog.ticketLink = vm.comments.ticketLink;
                    OrderService.removeOrder(orders);
                    vm.reset();
                }, function () {

                });
            } else {
                OrderService.removeOrder(orders);
                vm.reset();
            }
        };

        function deleteOrder(orders, order, jobChain) {
            OrderService.deleteOrder(orders).then(function (res) {
                if (vm.showLogPanel && order.path == vm.showLogPanel.path) {
                    vm.showLogPanel = '';
                }
                if (vm.allOrders && vm.allOrders.length > 0) {
                    for (let j = 0; j < vm.allOrders.length; j++) {
                        if (vm.allOrders[j].path == order.path) {
                            vm.allOrders.splice(j, 1);
                            break;
                        }
                    }
                } else if (vm.orders && vm.orders.length > 0) {
                    for (let j = 0; j < vm.orders.length; j++) {
                        if (vm.orders[j].path == order.path) {
                            vm.orders.splice(j, 1);
                            break;
                        }
                    }

                } else {
                    $scope.$emit('refreshList', jobChain);
                }

                vm.reset();
            });
        }

        vm.deleteOrder = function (order, jobChain) {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = vm.schedulerIds.selected;
            orders.orders.push({orderId: order.orderId, jobChain: order.jobChain});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = order.path;
                vm.comments.title = order.title;
                vm.comments.operation = 'Delete';
                vm.comments.type = 'Order';
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    orders.auditLog = {};
                    if (vm.comments.comment)
                        orders.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        orders.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        orders.auditLog.ticketLink = vm.comments.ticketLink;
                    deleteOrder(orders, order, jobChain);
                }, function () {
                    vm.reset();
                });
            } else {
                deleteOrder(orders, order, jobChain);
            }
        };

        vm.showAssignedCalendar = function (order) {
            vm.comments = undefined;
            var orders = {};
            orders.jobschedulerId = vm.schedulerIds.selected;
            orders.jobChain = order.jobChain;
            orders.orderId = order.orderId;
            orders.compact = true;
            OrderService.getcalendars(orders).then(function (res) {
                vm.obj = angular.copy(order);
                vm.obj.calendars = res.calendars;
            });
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/show-assigned-calendar-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {

            }, function () {

            });
        };

        vm.showPanelFuc = function (order) {
            order.show = true;
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = vm.schedulerIds.selected;
            orders.orders.push({orderId: order.orderId, jobChain: order.path.split(',')[0]});
            OrderService.get(orders).then(function (res) {
                order = _.merge(order, res.orders[0]);
            });
        };

        vm.limitNum = vm.userPreferences.maxOrderPerJobchain;
        vm.showOrderPanel = '';
        vm.showOrderPanelFuc = function (path) {
            if (vm.permission.Order.view.status) {
                $location.path('/job_chain_detail/orders').search({path: path});
            }
        };

        $scope.$on('$destroy', function () {
            watcher1();
            watcher3();
            if (promise1)
                $timeout.cancel(promise1);
        });
    }

    HistoryCtrl.$inject = ["$scope", "OrderService", "TaskService", "$uibModal", "SavedFilter", "$timeout", "$filter",
        "JobService", "orderByFilter", "CoreService", "UserService", "YadeService", "ConditionService"];

    function HistoryCtrl($scope, OrderService, TaskService, $uibModal, SavedFilter, $timeout, $filter,
                         JobService, orderBy, CoreService, UserService, YadeService, ConditionService) {
        var vm = $scope;
        vm.maxEntryPerPage = vm.userPreferences.maxEntryPerPage;
        vm.isUnique = true;
        vm.historyView = {};
        vm.historyView.current = vm.userPreferences.historyView === 'current';
        vm.protocols = YadeService.getProtocols();
        vm.allSessionCheck = {checkbox: false};

        vm.changeJobScheduler = function () {
            vm.init();
        };

        vm.reloadState = 'no';

        vm.reload = function () {
            if (vm.reloadState === 'no') {
                vm.historys = [];
                vm.jobHistorys = [];
                vm.yadeHistorys = [];
                vm.folderPath = 'Process aborted';
                vm.reloadState = 'yes';
            } else if (vm.reloadState === 'yes') {
                vm.reloadState = 'no';
                vm.isLoading = false;
                vm.init();
            }
        };

        vm.historyFilters = CoreService.getHistoryTab();
        vm.order = vm.historyFilters.order;
        vm.task = vm.historyFilters.task;
        vm.yade = vm.historyFilters.yade;
        vm.stream = vm.historyFilters.stream;
        if (!vm.order.filter.historyStates) {
            vm.order.filter.historyStates = 'all';

        }
        if (!vm.order.filter.date) {
            vm.order.filter.date = 'today';
        }
        if (!vm.task.filter.historyStates) {
            vm.task.filter.historyStates = 'all';
        }
        if (!vm.task.filter.date) {
            vm.task.filter.date = 'today';
        }
        if (!vm.yade.filter.historyStates) {
            vm.yade.filter.historyStates = 'all';
        }
        if (!vm.yade.filter.date) {
            vm.yade.filter.date = 'today';
        }

        vm.object = {};
        vm.tree = [];
        vm.tree1 = [];
        var isLoaded = true;

        vm.selectedFiltered1 = null;
        vm.selectedFiltered2 = null;
        vm.selectedFiltered3 = null;
        vm.selectedFiltered4 = null;
        vm.temp_filter1 = {};
        vm.temp_filter2 = {};
        vm.temp_filter3 = {};
        vm.temp_filter4 = {};


        vm.jobChainSearch = {};
        vm.jobSearch = {};
        vm.yadeSearch = {};
        vm.jobStreamSearch = {};
        var jobChainSearch = false;
        var jobSearch = false;
        var yadeSearch = false;
        var jobStreamSearch = false;

        var promise1;

        var loadConfig = false, loadIgnoreList = false;

        vm.savedIgnoreList = {};
        vm.savedIgnoreList.jobChains = [];
        vm.savedIgnoreList.jobs = [];
        vm.savedIgnoreList.orders = [];

        vm.historyFilterObj = JSON.parse(SavedFilter.historyFilters) || {};

        vm.savedHistoryFilter = vm.historyFilterObj.order || {};

        if (vm.historyFilters.order.selectedView) {
            vm.savedHistoryFilter.selected = vm.savedHistoryFilter.selected || vm.savedHistoryFilter.favorite;
        } else {
            vm.savedHistoryFilter.selected = undefined;
        }

        vm.savedJobHistoryFilter = vm.historyFilterObj.job || {};

        if (vm.historyFilters.task.selectedView) {
            vm.savedJobHistoryFilter.selected = vm.savedJobHistoryFilter.selected || vm.savedJobHistoryFilter.favorite;
        } else {
            vm.savedJobHistoryFilter.selected = undefined;
        }

        vm.savedYadeHistoryFilter = vm.historyFilterObj.yade || {};
        if (vm.historyFilters.yade.selectedView) {
            vm.savedYadeHistoryFilter.selected = vm.savedYadeHistoryFilter.selected || vm.savedYadeHistoryFilter.favorite;
        } else {
            vm.savedYadeHistoryFilter.selected = undefined;
        }

        vm.savedJobStreamHistoryFilter = vm.historyFilterObj.stream || {};
        if (vm.historyFilters.stream.selectedView) {
            vm.savedJobStreamHistoryFilter.selected = vm.savedJobStreamHistoryFilter.selected || vm.savedJobStreamHistoryFilter.favorite;
        } else {
            vm.savedJobStreamHistoryFilter.selected = undefined;
        }

        function updateDimensions() {
            let max = -1;
            if (!vm.historyView.current) {
                $('#jobChain').find('thead th.dynamic-thead-o').each(function () {
                    let w = $(this).outerWidth();
                    if (w > 50) {
                        $('#jobChain td.dynamic-thead-o').css('width', w + 'px');
                    }
                });
            }
            $('#jobChain').find('thead th.menu').each(function () {
                $('#jobChain td.menu').css('width', $(this).outerWidth() + 'px');
            });
            $('#jobChain').find('thead th.dynamic-thead').each(function (index) {
                let w = $(this).outerWidth();
                let elem = '#jobChain td.dynamic-thead' + index;
                if (index < 2) {
                    w = w - 1;
                }
                if (w > 20) {
                    $(elem).css('width', w + 'px');
                } else {
                    max = w;
                }
            });
            if (max > -1) {
                setTimeout(function () {
                    updateDimensions();
                }, 5);
            }
        }

        $(window).resize(function () {
            $('#jobChain').find('thead th.dynamic-thead').each(function (index) {
                let elem = '#jobChain td.dynamic-thead' + index;
                $(elem).css('width', 'auto');
            });
            updateDimensions();
        });

        vm.pageChanged = function () {
            setTimeout(function () {
                updateDimensions();
            }, 10);
        };

        function parseProcessExecuted(regex, obj) {
            var fromDate, toDate, date, arr;

            if (/^\s*(-)\s*(\d+)(s|h|d|w|M|y)\s*$/.test(regex)) {
                fromDate = /^\s*(-)\s*(\d+)(s|h|d|w|M|y)\s*$/.exec(regex)[0];
            } else if (/^\s*(now\s*\-)\s*(\d+)\s*$/i.test(regex)) {
                let seconds = parseInt(/^\s*(now\s*\-)\s*(\d+)\s*$/i.exec(regex)[2]);
                fromDate = '-' + seconds + 's';
            } else if (/^\s*(Today)\s*$/i.test(regex)) {
                fromDate = '0d';
                toDate = '0d';
            } else if (/^\s*(Yesterday)\s*$/i.test(regex)) {
                fromDate = '-1d';
                toDate = '-1d';
            } else if (/^\s*(now)\s*$/i.test(regex)) {
                fromDate = moment.utc(new Date());
                toDate = fromDate;
            } else if (/^\s*(-)(\d+)(s|h|d|w|M|y)\s*to\s*(-)(\d+)(s|h|d|w|M|y)\s*$/.test(regex)) {
                date = /^\s*(-)(\d+)(s|h|d|w|M|y)\s*to\s*(-)(\d+)(s|h|d|w|M|y)\s*$/.exec(regex);
                arr = date[0].split('to');
                fromDate = arr[0].trim();
                toDate = arr[1].trim();

            } else if (/^\s*(-)(\d+)(s|h|d|w|M|y)\s*to\s*(-)(\d+)(s|h|d|w|M|y)\s*[-,+](\d+)(s|h|d|w|M|y)\s*$/.test(regex)) {
                date = /^\s*(-)(\d+)(s|h|d|w|M|y)\s*to\s*(-)(\d+)(s|h|d|w|M|y)\s*[-,+](\d+)(s|h|d|w|M|y)\s*$/.exec(regex);
                arr = date[0].split('to');
                fromDate = arr[0].trim();
                toDate = arr[1].trim();

            } else if (/^\s*(-)(\d+)(s|h|d|w|M|y)\s*[-,+](\d+)(s|h|d|w|M|y)\s*to\s*(-)(\d+)(s|h|d|w|M|y)\s*$/.test(regex)) {
                date = /^\s*(-)(\d+)(s|h|d|w|M|y)\s*[-,+](\d+)(s|h|d|w|M|y)\s*to\s*(-)(\d+)(s|h|d|w|M|y)\s*$/.exec(regex);
                arr = date[0].split('to');
                fromDate = arr[0].trim();
                toDate = arr[1].trim();

            } else if (/^\s*(-)(\d+)(s|h|d|w|M|y)\s*[-,+](\d+)(s|h|d|w|M|y)\s*to\s*(-)(\d+)(s|h|d|w|M|y)\s*[-,+](\d+)(s|h|d|w|M|y)\s*$/.test(regex)) {
                date = /^\s*(-)(\d+)(s|h|d|w|M|y)\s*[-,+](\d+)(s|h|d|w|M|y)\s*to\s*(-)(\d+)(s|h|d|w|M|y)\s*[-,+](\d+)(s|h|d|w|M|y)\s*$/.exec(regex);
                arr = date[0].split('to');
                fromDate = arr[0].trim();
                toDate = arr[1].trim();

            } else if (/^\s*(?:(?:(1[0-2]|0?[0-9]):)?([0-5][0-9]):)?([0-5][0-9])\s?(?:am|pm)\s*to\s*(?:(?:(1[0-2]|0?[0-9]):)?([0-5][0-9]):)?([0-5][0-9])\s?(?:am|pm)\s*$/.test(regex)) {
                let reg = /^\s*(?:(?:(1[0-2]|0?[0-9]):)?([0-5][0-9]):)?([0-5][0-9])\s?(?:am|pm)\s*to\s*(?:(?:(1[0-2]|0?[0-9]):)?([0-5][0-9]):)?([0-5][0-9])\s?(?:am|pm)\s*$/i.exec(regex);
                let arr = reg[0].split('to');
                let fromTime = moment(arr[0].trim(), "HH:mm:ss:a");
                let toTime = moment(arr[1].trim(), "HH:mm:ss:a");

                fromDate = moment.utc(fromTime);
                toDate = moment.utc(toTime);
            }

            if (fromDate) {
                obj.dateFrom = fromDate;
            }
            if (toDate) {
                obj.dateTo = toDate;
            }
            return obj;
        }

        function checkSharedFilters() {
            if (vm.permission.JOCConfigurations.share.view) {
                var obj = {};
                obj.jobschedulerId = vm.schedulerIds.selected;
                obj.configurationType = "CUSTOMIZATION";
                obj.objectType = "ORDER_HISTORY";
                obj.shared = true;
                UserService.configurations(obj).then(function (res) {
                    vm.orderHistoryFilterList = res.configurations;
                    getOrderCustomizations();
                }, function () {
                    vm.orderHistoryFilterList = [];
                    getOrderCustomizations();
                });
            } else {
                vm.orderHistoryFilterList = [];
                getOrderCustomizations();
            }
        }

        function checkSharedTaskFilters() {
            if (vm.permission.JOCConfigurations.share.view) {
                var obj = {};
                obj.jobschedulerId = vm.schedulerIds.selected;
                obj.configurationType = "CUSTOMIZATION";
                obj.objectType = "TASK_HISTORY";
                obj.shared = true;
                UserService.configurations(obj).then(function (res) {
                    vm.jobHistoryFilterList = res.configurations;
                    getTaskCustomizations();
                }, function () {
                    vm.jobHistoryFilterList = [];
                    getTaskCustomizations();
                });
            } else {
                vm.jobHistoryFilterList = [];
                getTaskCustomizations();
            }
        }

        function checkSharedYadeFilters() {
            if (vm.permission.JOCConfigurations.share.view) {
                var obj = {};
                obj.jobschedulerId = vm.schedulerIds.selected;
                obj.configurationType = "CUSTOMIZATION";
                obj.objectType = "YADE_HISTORY";
                obj.shared = true;
                UserService.configurations(obj).then(function (res) {
                    vm.yadeHistoryFilterList = res.configurations;
                    getYadeCustomizations();
                }, function () {
                    vm.yadeHistoryFilterList = [];
                    getYadeCustomizations();
                });
            } else {
                vm.yadeHistoryFilterList = [];
                getYadeCustomizations();
            }
        }

        function checkSharedJobStreamFilters() {
            if (vm.permission.JOCConfigurations.share.view) {
                var obj = {};
                obj.jobschedulerId = vm.schedulerIds.selected;
                obj.configurationType = "CUSTOMIZATION";
                obj.objectType = "JOBSTREAM_HISTORY";
                obj.shared = true;
                UserService.configurations(obj).then(function (res) {
                    vm.jobStreamHistoryFilterList = res.configurations;
                    getJobStreamCustomizations();
                }, function () {
                    vm.jobStreamHistoryFilterList = [];
                    getJobStreamCustomizations();
                });
            } else {
                vm.jobStreamHistoryFilterList = [];
                getJobStreamCustomizations();
            }
        }

        var configObj = {};
        configObj.jobschedulerId = vm.schedulerIds.selected;
        configObj.account = vm.permission.user;

        function getOrderCustomizations() {
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.account = vm.permission.user;
            obj.configurationType = "CUSTOMIZATION";
            obj.objectType = "ORDER_HISTORY";
            UserService.configurations(obj).then(function (res) {

                if (vm.orderHistoryFilterList && vm.orderHistoryFilterList.length > 0) {
                    if (res.configurations && res.configurations.length > 0) {
                        vm.orderHistoryFilterList = vm.orderHistoryFilterList.concat(res.configurations);
                    }
                    let data = [];
                    for (let i = 0; i < vm.orderHistoryFilterList.length; i++) {
                        let flag = true;
                        for (let j = 0; j < data.length; j++) {
                            if (data[j].id == vm.orderHistoryFilterList[i].id) {
                                flag = false;
                            }
                        }
                        if (flag) {
                            data.push(vm.orderHistoryFilterList[i]);
                        }
                    }
                    vm.orderHistoryFilterList = data;
                } else {
                    vm.orderHistoryFilterList = res.configurations;
                }

                if (vm.savedHistoryFilter.selected) {
                    var flag = true;
                    angular.forEach(vm.orderHistoryFilterList, function (value) {
                        if (value.id == vm.savedHistoryFilter.selected) {
                            flag = false;
                            UserService.configuration({
                                jobschedulerId: value.jobschedulerId,
                                id: value.id
                            }).then(function (conf) {
                                loadConfig = true;
                                vm.selectedFiltered1 = JSON.parse(conf.configuration.configurationItem);
                                vm.selectedFiltered1.account = value.account;
                                vm.init();
                            });
                        }
                    });
                    if (flag) {
                        vm.savedHistoryFilter.selected = undefined;
                        loadConfig = true;
                        vm.init();
                    }
                } else {
                    loadConfig = true;
                    vm.savedHistoryFilter.selected = undefined;
                    vm.init();
                }

            }, function (err) {
                vm.savedHistoryFilter.selected = undefined;
                loadConfig = true;
                vm.init();
            });
        }

        function getTaskCustomizations() {
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.account = vm.permission.user;
            obj.configurationType = "CUSTOMIZATION";
            obj.objectType = "TASK_HISTORY";
            UserService.configurations(obj).then(function (res) {

                if (vm.jobHistoryFilterList && vm.jobHistoryFilterList.length > 0) {
                    if (res.configurations && res.configurations.length > 0) {
                        vm.jobHistoryFilterList = vm.jobHistoryFilterList.concat(res.configurations);
                    }
                    let data = [];
                    for (let i = 0; i < vm.jobHistoryFilterList.length; i++) {
                        let flag = true;
                        for (let j = 0; j < data.length; j++) {
                            if (data[j].account == vm.jobHistoryFilterList[i].account && data[j].name == vm.jobHistoryFilterList[i].name) {
                                flag = false;
                            }
                        }
                        if (flag) {
                            data.push(vm.jobHistoryFilterList[i]);
                        }
                    }
                    vm.jobHistoryFilterList = data;
                } else {
                    vm.jobHistoryFilterList = res.configurations;
                }

                if (vm.savedJobHistoryFilter.selected) {
                    var flag = true;
                    angular.forEach(vm.jobHistoryFilterList, function (value) {
                        if (value.id == vm.savedJobHistoryFilter.selected) {
                            flag = false;
                            UserService.configuration({
                                jobschedulerId: value.jobschedulerId,
                                id: value.id
                            }).then(function (conf) {
                                loadConfig = true;
                                vm.selectedFiltered2 = JSON.parse(conf.configuration.configurationItem);
                                vm.selectedFiltered2.account = value.account;
                                vm.init();
                            });
                        }
                    });
                    if (flag) {
                        vm.savedJobHistoryFilter.selected = undefined;
                        loadConfig = true;
                        vm.init();
                    }
                } else {
                    loadConfig = true;
                    vm.savedJobHistoryFilter.selected = undefined;
                    vm.init();
                }

            }, function (err) {
                loadConfig = true;
                vm.savedJobHistoryFilter.selected = undefined;
                vm.init();
            });
        }

        function getYadeCustomizations() {
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.account = vm.permission.user;
            obj.configurationType = "CUSTOMIZATION";
            obj.objectType = "YADE_HISTORY";
            UserService.configurations(obj).then(function (res) {
                if (vm.yadeHistoryFilterList && vm.yadeHistoryFilterList.length > 0) {
                    if (res.configurations && res.configurations.length > 0) {
                        vm.yadeHistoryFilterList = vm.yadeHistoryFilterList.concat(res.configurations);
                    }
                    let data = [];

                    for (let i = 0; i < vm.yadeHistoryFilterList.length; i++) {
                        let flag = true;
                        for (let j = 0; j < data.length; j++) {
                            if (data[j].account == vm.yadeHistoryFilterList[i].account && data[j].name == vm.yadeHistoryFilterList[i].name) {
                                flag = false;
                            }
                        }
                        if (flag) {
                            data.push(vm.yadeHistoryFilterList[i]);
                        }
                    }
                    vm.yadeHistoryFilterList = data;
                } else {
                    vm.yadeHistoryFilterList = res.configurations;
                }

                if (vm.savedYadeHistoryFilter.selected) {
                    var flag = true;
                    angular.forEach(vm.yadeHistoryFilterList, function (value) {
                        if (value.id == vm.savedYadeHistoryFilter.selected) {
                            flag = false;
                            UserService.configuration({
                                jobschedulerId: value.jobschedulerId,
                                id: value.id
                            }).then(function (conf) {
                                loadConfig = true;
                                vm.selectedFiltered3 = JSON.parse(conf.configuration.configurationItem);
                                vm.selectedFiltered3.account = value.account;
                                vm.init();
                            });
                        }
                    });
                    if (flag) {
                        vm.savedYadeHistoryFilter.selected = undefined;
                        loadConfig = true;
                        vm.init();
                    }
                } else {
                    loadConfig = true;
                    vm.savedYadeHistoryFilter.selected = undefined;
                    vm.init();
                }

            }, function (err) {
                loadConfig = true;
                vm.savedYadeHistoryFilter.selected = undefined;
                vm.init();
            });
        }

        function getJobStreamCustomizations() {
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.account = vm.permission.user;
            obj.configurationType = "CUSTOMIZATION";
            obj.objectType = "JOBSTREAM_HISTORY";
            UserService.configurations(obj).then(function (res) {
                if (vm.jobStreamHistoryFilterList && vm.jobStreamHistoryFilterList.length > 0) {
                    if (res.configurations && res.configurations.length > 0) {
                        vm.jobStreamHistoryFilterList = vm.jobStreamHistoryFilterList.concat(res.configurations);
                    }
                    let data = [];

                    for (let i = 0; i < vm.jobStreamHistoryFilterList.length; i++) {
                        let flag = true;
                        for (let j = 0; j < data.length; j++) {
                            if (data[j].account == vm.jobStreamHistoryFilterList[i].account && data[j].name == vm.jobStreamHistoryFilterList[i].name) {
                                flag = false;
                            }
                        }
                        if (flag) {
                            data.push(vm.jobStreamHistoryFilterList[i]);
                        }
                    }
                    vm.jobStreamHistoryFilterList = data;
                } else {
                    vm.jobStreamHistoryFilterList = res.configurations;
                }

                if (vm.savedJobStreamHistoryFilter.selected) {
                    var flag = true;
                    angular.forEach(vm.jobStreamHistoryFilterList, function (value) {
                        if (value.id == vm.savedJobStreamHistoryFilter.selected) {
                            flag = false;
                            UserService.configuration({
                                jobschedulerId: value.jobschedulerId,
                                id: value.id
                            }).then(function (conf) {
                                loadConfig = true;
                                vm.selectedFiltered4 = JSON.parse(conf.configuration.configurationItem);
                                vm.selectedFiltered4.account = value.account;
                                vm.init();
                            });
                        }
                    });
                    if (flag) {
                        vm.savedJobStreamHistoryFilter.selected = undefined;
                        loadConfig = true;
                        vm.init();
                    }
                } else {
                    loadConfig = true;
                    vm.savedJobStreamHistoryFilter.selected = undefined;
                    vm.init();
                }

            }, function (err) {
                loadConfig = true;
                vm.savedJobStreamHistoryFilter.selected = undefined;
                vm.init();
            });
        }

        vm.init = function () {
            vm.reset();
            if(!vm.permission.History.view.status){
                vm.historyFilters.type = 'yade';
            }
            vm.isLoaded = true;
            let filter = {};
            filter.jobschedulerId = vm.historyView.current == true ? vm.schedulerIds.selected : '';
            if (loadConfig && loadIgnoreList) {
                isLoaded = false;
                if (vm.historyFilters.type == 'job') {
                    jobHistory(filter);
                } else if (vm.historyFilters.type == 'jobChain') {
                    orderHistory(filter);
                } else if (vm.historyFilters.type == 'yade') {
                    yadeHistory(filter);
                } else if (vm.historyFilters.type == 'jobStream') {
                    jobStreamHistory(filter);
                }
            }
        };

        if (vm.schedulerIds.selected) {
            if (vm.historyFilters.type === 'jobChain') {
                checkSharedFilters();
            } else if (vm.historyFilters.type === 'job') {
                checkSharedTaskFilters();
            } else if (vm.historyFilters.type === 'yade'){
                checkSharedYadeFilters();
            } else{
                checkSharedJobStreamFilters()
            }
        } else {
            loadConfig = true;
            loadIgnoreList = true;
            vm.init();
        }

        vm.ignoreListConfigId = 0;
        function getIgnoreList() {
            var configObj = {};
            configObj.jobschedulerId = vm.schedulerIds.selected;
            configObj.account = vm.permission.user;
            configObj.configurationType = "IGNORELIST";
            UserService.configurations(configObj).then(function (res1) {
                if (res1.configurations && res1.configurations.length > 0) {
                    vm.ignoreListConfigId = res1.configurations[0].id;
                    UserService.configuration({
                        jobschedulerId: vm.schedulerIds.selected,
                        id: res1.configurations[0].id
                    }).then(function (res) {

                        if (res.configuration && res.configuration.configurationItem) {
                            vm.savedIgnoreList = JSON.parse(res.configuration.configurationItem) || {};
                        }
                        loadIgnoreList = true;
                        vm.init();
                    }, function () {
                        loadIgnoreList = true;
                        vm.init();
                    });
                } else {
                    loadIgnoreList = true;
                    vm.init();
                }
            }, function () {
                loadIgnoreList = true;
                vm.init();
            });
        }

        if (vm.schedulerIds.selected)
            getIgnoreList();

        /**--------------- sorting and pagination -------------------*/
        vm.sortBy = function (propertyName) {
            vm.order.sortReverse = !vm.order.sortReverse;
            vm.order.filter.sortBy = propertyName;
        };
        vm.sortBy1 = function (propertyName) {
            vm.task.sortReverse = !vm.task.sortReverse;
            vm.task.filter.sortBy = propertyName;
        };
        vm.sortBy2 = function (propertyName) {
            vm.yade.sortReverse = !vm.yade.sortReverse;
            vm.yade.filter.sortBy = propertyName;
        };
        vm.sortBy3 = function (propertyName) {
            vm.stream.sortReverse = !vm.stream.sortReverse;
            vm.stream.filter.sortBy = propertyName;
        };

        function setTaskDateRange(filter) {
            if ((vm.savedIgnoreList.isEnable == true || vm.savedIgnoreList.isEnable == 'true') && (vm.savedIgnoreList.jobs && vm.savedIgnoreList.jobs.length > 0)) {
                filter.excludeJobs = [];
                angular.forEach(vm.savedIgnoreList.jobs, function (job) {
                    filter.excludeJobs.push({job: job});
                });
            }
            if (vm.task.filter.date == 'today') {
                filter.dateFrom = '0d';
                filter.dateTo = '0d';
            } else if (vm.task.filter.date && vm.task.filter.date != 'all') {
                filter.dateFrom = vm.task.filter.date;
            }
            return filter;
        }

        function setOrderDateRange(filter) {
            if ((vm.savedIgnoreList.isEnable == true || vm.savedIgnoreList.isEnable == 'true') && ((vm.savedIgnoreList.jobChains && vm.savedIgnoreList.jobChains.length > 0) || (vm.savedIgnoreList.orders && vm.savedIgnoreList.orders.length > 0))) {
                filter.excludeOrders = [];
                angular.forEach(vm.savedIgnoreList.jobChains, function (jobChain) {
                    filter.excludeOrders.push({jobChain: jobChain});
                });

                angular.forEach(vm.savedIgnoreList.orders, function (order) {
                    filter.excludeOrders.push(order);
                });
            }

            if (vm.order.filter.date == 'today') {
                filter.dateFrom = '0d';
                filter.dateTo = '0d';

            } else if (vm.order.filter.date && vm.order.filter.date != 'all') {
                filter.dateFrom = vm.order.filter.date;
            }

            return filter;
        }

        function setYadeDateRange(filter) {
            if (vm.yade.filter.date == 'today') {
                filter.dateFrom = '0d';
                filter.dateTo = '0d';
            } else if (vm.yade.filter.date && vm.yade.filter.date != 'all') {
                filter.dateFrom = vm.yade.filter.date;
            }
            return filter;
        }

        function setJobStreamDateRange(filter) {
            if (vm.stream.filter.date == 'today') {
                filter.dateFrom = '0d';
                filter.dateTo = '0d';
            } else if (vm.stream.filter.date && vm.stream.filter.date != 'all') {
                filter.dateFrom = vm.stream.filter.date;
            }
            return filter;
        }

        vm.jobHistory = jobHistory;

        function jobHistory(filter) {
            vm.reset();
            if(jobSearch) {
                vm.search(true);
                return;
            }
            vm.isUnique = true;
            if (!filter) {
                if (!vm.jobHistoryFilterList && vm.schedulerIds.selected) {
                    checkSharedTaskFilters();
                    return;
                }
                filter = {jobschedulerId: vm.historyView.current == true ? vm.schedulerIds.selected : ''};
            }
            vm.isLoading = false;

            if (vm.selectedFiltered2) {
                isCustomizationSelected2(true);
                filter = jobParseDate(filter);
            } else {
                filter = setTaskDateRange(filter);
                if (vm.task.filter.historyStates && vm.task.filter.historyStates != 'all' && vm.task.filter.historyStates.length > 0) {
                    filter.historyStates = [];
                    filter.historyStates.push(vm.task.filter.historyStates);
                }
            }
            filter.limit = parseInt(vm.userPreferences.maxRecords);
            filter.timeZone = vm.userPreferences.zone;

            if ((filter.dateFrom && (typeof filter.dateFrom.getMonth === 'function' || typeof filter.dateFrom === 'object')) || (filter.dateTo && (typeof filter.dateTo.getMonth === 'function' || typeof filter.dateTo === 'object'))) {
                filter.timeZone = 'UTC';
            }
            if ((filter.dateFrom && typeof filter.dateFrom.getMonth === 'function')) {
                filter.dateFrom = moment(filter.dateFrom).tz(vm.userPreferences.zone)._d;
            }
            if ((filter.dateTo && typeof filter.dateTo.getMonth === 'function')) {
                filter.dateTo = moment(filter.dateTo).tz(vm.userPreferences.zone)._d;
            }
            TaskService.histories(filter).then(function (res) {
                vm.jobHistorys = res.history;
                setDuration(vm.jobHistorys);
                vm.isLoading = true;
                vm.isLoaded = false;
                isLoaded = true;
            }, function () {
                vm.isLoading = true;
                vm.isLoaded = false;
                isLoaded = true;
            });
        }

        vm.orderHistory = orderHistory;

        function orderHistory(filter) {
            vm.reset();
            if(jobChainSearch) {
                vm.search(true);
                return;
            }
            vm.isUnique = true;
            if (!vm.orderHistoryFilterList && vm.schedulerIds.selected) {
                checkSharedFilters();
                return;
            }
            if (!filter) {
                filter = {jobschedulerId: vm.historyView.current == true ? vm.schedulerIds.selected : ''};
            }
            vm.isLoading = false;
            if (vm.selectedFiltered1) {
                isCustomizationSelected1(true);
                filter = orderParseDate(filter);
            } else {
                filter = setOrderDateRange(filter);
                if (vm.order.filter.historyStates && vm.order.filter.historyStates != 'all' && vm.order.filter.historyStates.length > 0) {
                    filter.historyStates = [];
                    filter.historyStates.push(vm.order.filter.historyStates);
                }
            }
            filter.limit = parseInt(vm.userPreferences.maxRecords);
            filter.timeZone = vm.userPreferences.zone;
            if ((filter.dateFrom && (typeof filter.dateFrom.getMonth === 'function' || typeof filter.dateFrom === 'object')) || (filter.dateTo && (typeof filter.dateTo.getMonth === 'function' || typeof filter.dateTo === 'object'))) {
                filter.timeZone = 'UTC';
            }
            if ((filter.dateFrom && typeof filter.dateFrom.getMonth === 'function')) {
                filter.dateFrom = moment(filter.dateFrom).tz(vm.userPreferences.zone)._d;
            }
            if ((filter.dateTo && typeof filter.dateTo.getMonth === 'function')) {
                filter.dateTo = moment(filter.dateTo).tz(vm.userPreferences.zone)._d;
            }
            OrderService.histories(filter).then(function (res) {
                vm.historys = res.history;
                setDuration(vm.historys);
                vm.isLoading = true;
                vm.isLoaded = false;
                isLoaded = true;
                setTimeout(function () {
                    updateDimensions();
                }, 0)
            }, function () {
                vm.isLoading = true;
                vm.isLoaded = false;
                isLoaded = true;
            });
        }

        vm.jobStreamHistory = jobStreamHistory;

        function jobStreamHistory(filter){
            if(jobStreamSearch) {
                vm.search(true);
                return;
            }
            vm.isUnique = true;
            if (!vm.jobStreamHistoryFilterList && vm.schedulerIds.selected) {
                checkSharedJobStreamFilters();
                return;
            }
            if (!filter) {
                filter = {jobschedulerId: vm.historyView.current == true ? vm.schedulerIds.selected : ''};
            }
            if (vm.selectedFiltered4) {
                isCustomizationSelected4(true);
                if (vm.selectedFiltered4.jobStream) {
                    filter.jobStream = vm.selectedFiltered4.jobStream;
                }
                if(vm.selectedFiltered4.status !== 'all') {
                    filter.status = vm.selectedFiltered4.status;
                }
                filter = parseProcessExecuted(vm.selectedFiltered4.planned, filter);
            } else {
                filter = setJobStreamDateRange(filter);
            }
            vm.isLoading = false;
            filter.limit = parseInt(vm.userPreferences.maxRecords);
            filter.timeZone = vm.userPreferences.zone;
            if ((filter.dateFrom && (typeof filter.dateFrom.getMonth === 'function' || typeof filter.dateFrom === 'object')) || (filter.dateTo && (typeof filter.dateTo.getMonth === 'function' || typeof filter.dateTo === 'object'))) {
                filter.timeZone = 'UTC';
            }
            if ((filter.dateFrom && typeof filter.dateFrom.getMonth === 'function')) {
                filter.dateFrom = moment(filter.dateFrom).tz(vm.userPreferences.zone)._d;
            }
            if ((filter.dateTo && typeof filter.dateTo.getMonth === 'function')) {
                filter.dateTo = moment(filter.dateTo).tz(vm.userPreferences.zone)._d;
            }
            ConditionService.getSessions(filter).then(function (res) {
                vm.jobStreamHistorys = res.jobstreamSessions;
                setDuration(vm.jobStreamHistorys);
                vm.isLoading = true;
                vm.isLoaded = false;
                isLoaded = true;
            }, function () {
                vm.isLoading = true;
                vm.isLoaded = false;
                isLoaded = true;
            });
        }

        vm.yadeHistory = yadeHistory;

        function yadeHistory(filter) {
            vm.reset();
            if(yadeSearch) {
                vm.search(true);
                return;
            }
            vm.isUnique = true;
            if (!vm.yadeHistoryFilterList && vm.schedulerIds.selected) {
                checkSharedYadeFilters();
                return;
            }
            if (!filter) {
                filter = {jobschedulerId: vm.historyView.current == true ? vm.schedulerIds.selected : ''};
            }
            vm.isLoading = false;
            if (vm.selectedFiltered3) {
                isCustomizationSelected3(true);
                filter = yadeParseDate(filter);
            } else {
                filter = setYadeDateRange(filter);
                if (vm.yade.filter.historyStates && vm.yade.filter.historyStates != 'all' && vm.yade.filter.historyStates.length > 0) {
                    filter.states = [];
                    filter.states.push(vm.yade.filter.historyStates);
                }
            }
            filter.limit = parseInt(vm.userPreferences.maxRecords);
            filter.timeZone = vm.userPreferences.zone;
            if ((filter.dateFrom && (typeof filter.dateFrom.getMonth === 'function' || typeof filter.dateFrom === 'object')) || (filter.dateTo && (typeof filter.dateTo.getMonth === 'function' || typeof filter.dateTo === 'object'))) {
                filter.timeZone = 'UTC';
            }
            if ((filter.dateFrom && typeof filter.dateFrom.getMonth === 'function')) {
                filter.dateFrom = moment(filter.dateFrom).tz(vm.userPreferences.zone)._d;
            }
            if ((filter.dateTo && typeof filter.dateTo.getMonth === 'function')) {
                filter.dateTo = moment(filter.dateTo).tz(vm.userPreferences.zone)._d;
            }
            filter.compact = true;
            YadeService.getTransfers(filter).then(function (res) {
                vm.yadeHistorys = res.transfers;
                vm.isLoading = true;
                vm.isLoaded = false;
                isLoaded = true;
            }, function () {
                vm.isLoading = true;
                vm.isLoaded = false;
                isLoaded = true;
            });
        }

        function mergeHostAndProtocol(hosts, protocols) {
            var arr = [];
            if (protocols.length < hosts.length) {
                angular.forEach(hosts, function (value, index) {
                    if (protocols.length > 0) {
                        if (protocols.length < hosts.length) {
                            if (protocols.length == 1) {
                                arr.push({host: value, protocol: protocols[0]});
                            } else {
                                for (let x = 0; x < protocols.length; x++) {
                                    if (protocols.length >= index) {
                                        arr.push({host: value, protocol: protocols[index]});
                                    }
                                    break;
                                }
                            }
                        }
                    } else {
                        arr.push({host: value})
                    }

                })
            } else if (protocols.length > hosts.length) {
                angular.forEach(protocols, function (value, index) {
                    if (hosts.length > 0) {
                        if (hosts.length < protocols.length) {
                            if (hosts.length === 1) {
                                arr.push({protocol: value, host: hosts[0]});
                            } else {
                                for (let x = 0; x < hosts.length; x++) {
                                    if (hosts.length >= index) {
                                        arr.push({protocol: value, host: hosts[index]});
                                    }
                                    break;
                                }
                            }
                        }
                    } else {
                        arr.push({protocol: value})
                    }

                })
            } else {
                angular.forEach(hosts, function (value, index) {
                    for (let x = 0; x < protocols.length; x++) {
                        arr.push({host: value, protocol: protocols[x]});
                        protocols.splice(index, 1);
                        break;
                    }
                });
            }
            return arr;
        }

        vm.search = function (flag) {
            vm.reset();
            if (!flag) {
                vm.loading = true;
            }
            let fromDate, toDate;
            let filter = {
                jobschedulerId: vm.historyView.current == true ? vm.schedulerIds.selected : '',
                limit: parseInt(vm.userPreferences.maxRecords)
            };

            if (vm.historyFilters.type == 'job') {
                vm.task.filter.historyStates = '';
                vm.task.filter.date = '';
                if (vm.jobSearch.job) {
                    filter.jobs = [];
                    let s = vm.jobSearch.job.replace(/,\s+/g, ',');
                    var jobs = s.split(',');
                    angular.forEach(jobs, function (value) {
                        filter.jobs.push({job: value})
                    });
                }
                if (vm.jobSearch.states && vm.jobSearch.states.length > 0) {
                    filter.historyStates = vm.jobSearch.states;
                }
                if (vm.jobSearch.criticality && vm.jobSearch.criticality.length > 0) {
                    filter.criticality = vm.jobSearch.criticality;
                }
                if (vm.jobSearch.date == 'process') {
                    filter = parseProcessExecuted(vm.jobSearch.planned, filter);
                } else {
                    if (vm.jobSearch.date == 'date' && vm.jobSearch.from) {
                        fromDate = new Date(vm.jobSearch.from);
                        if (vm.jobSearch.fromTime) {
                            if (vm.jobSearch.fromTime === '24:00' || vm.jobSearch.fromTime === '24:00:00') {
                                fromDate.setDate(fromDate.getDate() + 1);
                                fromDate.setHours(0);
                                fromDate.setMinutes(0);
                                fromDate.setSeconds(0);
                            } else {
                                fromDate.setHours(moment(vm.jobSearch.fromTime, 'HH:mm:ss').hours());
                                fromDate.setMinutes(moment(vm.jobSearch.fromTime, 'HH:mm:ss').minutes());
                                fromDate.setSeconds(moment(vm.jobSearch.fromTime, 'HH:mm:ss').seconds());
                            }
                        } else {
                            fromDate.setHours(0);
                            fromDate.setMinutes(0);
                            fromDate.setSeconds(0);
                        }
                        fromDate.setMilliseconds(0);
                        filter.dateFrom = moment.utc(fromDate);
                    }
                    if (vm.jobSearch.date == 'date' && vm.jobSearch.to) {
                        toDate = new Date(vm.jobSearch.to);
                        if (vm.jobSearch.toTime) {
                            if (vm.jobSearch.toTime === '24:00' || vm.jobSearch.toTime === '24:00:00') {
                                toDate.setDate(toDate.getDate() + 1);
                                toDate.setHours(0);
                                toDate.setMinutes(0);
                                toDate.setSeconds(0);
                            } else {
                                toDate.setHours(moment(vm.jobSearch.toTime, 'HH:mm:ss').hours());
                                toDate.setMinutes(moment(vm.jobSearch.toTime, 'HH:mm:ss').minutes());
                                toDate.setSeconds(moment(vm.jobSearch.toTime, 'HH:mm:ss').seconds());
                            }
                        } else {
                            toDate.setHours(0);
                            toDate.setMinutes(0);
                            toDate.setSeconds(0);
                        }
                        toDate.setMilliseconds(0);
                        filter.dateTo = moment.utc(toDate);
                    }
                }

                if (vm.jobSearch.regex) {
                    filter.regex = vm.jobSearch.regex;
                }
                if (vm.jobSearch.jobschedulerId) {
                    filter.jobschedulerId = vm.jobSearch.jobschedulerId;
                }
                if (vm.jobSearch.paths && vm.jobSearch.paths.length > 0) {
                    filter.folders = [];
                    angular.forEach(vm.jobSearch.paths, function (value) {
                        filter.folders.push({folder: value, recursive: true});
                    })
                }

                if (vm.jobSearch.jobs && vm.jobSearch.jobs.length > 0) {
                    filter.jobs = [];

                    angular.forEach(vm.jobSearch.jobs, function (value) {
                        filter.jobs.push({job: value});
                    });

                }
                filter.timeZone = vm.userPreferences.zone;
                if ((filter.dateFrom && (typeof filter.dateFrom.getMonth === 'function' || typeof filter.dateFrom === 'object')) || (filter.dateTo && (typeof filter.dateTo.getMonth === 'function' || typeof filter.dateTo === 'object'))) {
                    filter.timeZone = 'UTC';
                }
                if ((filter.dateFrom && typeof filter.dateFrom.getMonth === 'function')) {
                    filter.dateFrom = moment(filter.dateFrom).tz(vm.userPreferences.zone)._d;
                }
                if ((filter.dateTo && typeof filter.dateTo.getMonth === 'function')) {
                    filter.dateTo = moment(filter.dateTo).tz(vm.userPreferences.zone)._d;
                }
                TaskService.histories(filter).then(function (res) {
                    vm.jobHistorys = res.history;
                    setDuration(vm.jobHistorys);
                    vm.loading = false;
                    isLoaded = true;
                }, function () {
                    vm.loading = false;
                    isLoaded = true;
                });
                jobSearch = true;
            } else if (vm.historyFilters.type == 'jobChain') {
                vm.order.filter.historyStates = '';
                vm.order.filter.date = '';
                if (vm.jobChainSearch.jobChain) {
                    filter.orders = [];
                    if (vm.jobChainSearch.orderIds) {
                        var s = vm.jobChainSearch.orderIds.replace(/,\s+/g, ',');
                        var orderIds = s.split(',');
                        angular.forEach(orderIds, function (value) {
                            filter.orders.push({jobChain: vm.jobChainSearch.jobChain, orderId: value})
                        });
                    } else {
                        filter.orders.push({jobChain: vm.jobChainSearch.jobChain})
                    }
                }
                if (vm.jobChainSearch.states && vm.jobChainSearch.states.length > 0) {
                    filter.historyStates = vm.jobChainSearch.states;
                }
                if (vm.jobChainSearch.date == 'process') {
                    filter = parseProcessExecuted(vm.jobChainSearch.planned, filter);
                }
                if (vm.jobChainSearch.date === 'date' && vm.jobChainSearch.from) {
                    fromDate = new Date(vm.jobChainSearch.from);
                    if (vm.jobChainSearch.fromTime) {
                        if (vm.jobChainSearch.fromTime === '24:00' || vm.jobChainSearch.fromTime === '24:00:00') {
                            fromDate.setDate(fromDate.getDate() + 1);
                            fromDate.setHours(0);
                            fromDate.setMinutes(0);
                            fromDate.setSeconds(0);
                        } else {
                            fromDate.setHours(moment(vm.jobChainSearch.fromTime, 'HH:mm:ss').hours());
                            fromDate.setMinutes(moment(vm.jobChainSearch.fromTime, 'HH:mm:ss').minutes());
                            fromDate.setSeconds(moment(vm.jobChainSearch.fromTime, 'HH:mm:ss').seconds());
                        }
                    } else {
                        fromDate.setHours(0);
                        fromDate.setMinutes(0);
                        fromDate.setSeconds(0);
                    }
                    fromDate.setMilliseconds(0);
                    filter.dateFrom = moment.utc(fromDate);
                }
                if (vm.jobChainSearch.date === 'date' && vm.jobChainSearch.to) {
                    toDate = new Date(vm.jobChainSearch.to);
                    if (vm.jobChainSearch.toTime) {
                        if (vm.jobChainSearch.toTime === '24:00' || vm.jobChainSearch.toTime === '24:00:00') {
                            toDate.setDate(toDate.getDate() + 1);
                            toDate.setHours(0);
                            toDate.setMinutes(0);
                            toDate.setSeconds(0);
                        } else {
                            toDate.setHours(moment(vm.jobChainSearch.toTime, 'HH:mm:ss').hours());
                            toDate.setMinutes(moment(vm.jobChainSearch.toTime, 'HH:mm:ss').minutes());
                            toDate.setSeconds(moment(vm.jobChainSearch.toTime, 'HH:mm:ss').seconds());
                        }
                    } else {
                        toDate.setHours(0);
                        toDate.setMinutes(0);
                        toDate.setSeconds(0);
                    }
                    toDate.setMilliseconds(0);
                    filter.dateTo = moment.utc(toDate);
                }

                if (vm.jobChainSearch.regex) {
                    filter.regex = vm.jobChainSearch.regex;
                }
                if (vm.jobChainSearch.jobschedulerId) {
                    filter.jobschedulerId = vm.jobChainSearch.jobschedulerId;
                }
                if (vm.jobChainSearch.paths && vm.jobChainSearch.paths.length > 0) {
                    filter.folders = [];
                    angular.forEach(vm.jobChainSearch.paths, function (value) {
                        filter.folders.push({folder: value, recursive: true});
                    })
                }
                if ((vm.jobChainSearch.jobChains && vm.jobChainSearch.jobChains.length > 0) || (vm.jobChainSearch.orders && vm.jobChainSearch.orders.length > 0)) {
                    filter.orders = [];

                    angular.forEach(vm.jobChainSearch.orders, function (value) {
                        filter.orders.push({jobChain: value.jobChain, orderId: value.orderId});
                    });
                    if (!vm.jobChainSearch.orders || vm.jobChainSearch.orders.length == 0) {
                        angular.forEach(vm.jobChainSearch.jobChains, function (value) {
                            filter.orders.push({jobChain: value});
                        });
                    } else {
                        if (vm.jobChainSearch.jobChains)
                            for (let i = 0; i < vm.jobChainSearch.jobChains.length; i++) {
                                let flg = true;
                                for (let j = 0; j < filter.orders.length; j++) {
                                    if (filter.orders[j].jobChain == vm.jobChainSearch.jobChains[i]) {
                                        flg = false;
                                        break;
                                    }
                                }
                                if (flg) {
                                    filter.orders.push({jobChain: vm.jobChainSearch.jobChains[i]});
                                }
                            }
                    }

                }
                filter.timeZone = vm.userPreferences.zone;
                if ((filter.dateFrom && (typeof filter.dateFrom.getMonth === 'function' || typeof filter.dateFrom === 'object')) || (filter.dateTo && (typeof filter.dateTo.getMonth === 'function' || typeof filter.dateTo === 'object'))) {
                    filter.timeZone = 'UTC';
                }
                if ((filter.dateFrom && typeof filter.dateFrom.getMonth === 'function')) {
                    filter.dateFrom = moment(filter.dateFrom).tz(vm.userPreferences.zone)._d;
                }
                if ((filter.dateTo && typeof filter.dateTo.getMonth === 'function')) {
                    filter.dateTo = moment(filter.dateTo).tz(vm.userPreferences.zone)._d;
                }
                OrderService.histories(filter).then(function (res) {
                    vm.historys = res.history;
                    setDuration(vm.historys);
                    vm.loading = false;
                    isLoaded = true;
                    setTimeout(function () {
                        updateDimensions();
                    }, 0);
                }, function () {
                    vm.loading = false;
                    isLoaded = true;
                });
                jobChainSearch = true;
            } else if (vm.historyFilters.type == 'yade') {
                vm.yade.filter.historyStates = '';
                vm.yade.filter.date = '';
                if (vm.yadeSearch.states && vm.yadeSearch.states.length > 0) {
                    filter.states = vm.yadeSearch.states;
                }
                if (vm.yadeSearch.profileId) {
                    vm.yadeSearch.profileId = vm.yadeSearch.profileId.replace(/\s*(,|^|$)\s*/g, "$1");
                    filter.profiles = vm.yadeSearch.profileId.split(',');
                }
                if (vm.yadeSearch.mandator) {
                    filter.mandator = vm.yadeSearch.mandator;
                }
                if (vm.yadeSearch.operations && vm.yadeSearch.operations.length > 0) {
                    filter.operations = vm.yadeSearch.operations;
                }
                if (vm.yadeSearch.sourceFileName) {
                    vm.yadeSearch.sourceFileName = vm.yadeSearch.sourceFileName.replace(/\s*(,|^|$)\s*/g, "$1");
                    filter.sourceFiles = vm.yadeSearch.sourceFileName.split(',');
                }
                if (vm.yadeSearch.sourceFileRegex) {
                    filter.sourceFilesRegex = vm.yadeSearch.sourceFileRegex;
                }
                if (vm.yadeSearch.targetFileName) {
                    vm.yadeSearch.targetFileName = vm.yadeSearch.targetFileName.replace(/\s*(,|^|$)\s*/g, "$1");
                    filter.targetFiles = vm.yadeSearch.targetFileName.split(',');
                }
                if (vm.yadeSearch.targetFileRegex) {
                    filter.targetFilesRegex = vm.yadeSearch.targetFileRegex;
                }
                if (vm.yadeSearch.sourceHost && vm.yadeSearch.sourceProtocol) {
                    let hosts = [];
                    let protocols = [];
                    if (vm.yadeSearch.sourceHost) {
                        let s = vm.yadeSearch.sourceHost.replace(/\s*(,|^|$)\s*/g, "$1");
                        hosts = s.split(',');
                    }
                    if (vm.yadeSearch.sourceProtocol) {
                        protocols = angular.copy(vm.yadeSearch.sourceProtocol);
                    }
                    filter.sources = mergeHostAndProtocol(hosts, protocols);
                }else{
                    vm.yadeSearch.sourceHost = '';
                    vm.yadeSearch.sourceProtocol = []
                }
                if (vm.yadeSearch.targetHost && vm.yadeSearch.targetProtocol) {
                    let hosts = [];
                    let protocols = [];
                    if (vm.yadeSearch.targetHost) {
                        let t = vm.yadeSearch.targetHost.replace(/\s*(,|^|$)\s*/g, "$1");
                        hosts = t.split(',');
                    }
                    if (vm.yadeSearch.targetProtocol) {
                        protocols = angular.copy(vm.yadeSearch.targetProtocol);
                    }
                    filter.targets = mergeHostAndProtocol(hosts, protocols);
                }else{
                    vm.yadeSearch.targetHost = '';
                    vm.yadeSearch.targetProtocol = []
                }

                if (vm.yadeSearch.date === 'process') {
                    filter = parseProcessExecuted(vm.yadeSearch.planned, filter);
                } else {
                    if (vm.yadeSearch.date === 'date' && vm.yadeSearch.from) {
                        fromDate = new Date(vm.yadeSearch.from);
                        if (vm.yadeSearch.fromTime) {
                            if (vm.yadeSearch.fromTime === '24:00' || vm.yadeSearch.fromTime === '24:00:00') {
                                fromDate.setDate(fromDate.getDate() + 1);
                                fromDate.setHours(0);
                                fromDate.setMinutes(0);
                                fromDate.setSeconds(0);
                            } else {
                                fromDate.setHours(moment(vm.yadeSearch.fromTime, 'HH:mm:ss').hours());
                                fromDate.setMinutes(moment(vm.yadeSearch.fromTime, 'HH:mm:ss').minutes());
                                fromDate.setSeconds(moment(vm.yadeSearch.fromTime, 'HH:mm:ss').seconds());
                            }
                        } else {
                            fromDate.setHours(0);
                            fromDate.setMinutes(0);
                            fromDate.setSeconds(0);
                        }
                        fromDate.setMilliseconds(0);
                        filter.dateFrom = moment.utc(fromDate);
                    }
                    if (vm.yadeSearch.date == 'date' && vm.yadeSearch.to) {
                        toDate = new Date(vm.yadeSearch.to);
                        if (vm.yadeSearch.toTime) {
                            if (vm.yadeSearch.toTime === '24:00' || vm.yadeSearch.toTime === '24:00:00') {
                                toDate.setDate(toDate.getDate() + 1);
                                toDate.setHours(0);
                                toDate.setMinutes(0);
                                toDate.setSeconds(0);
                            } else {
                                toDate.setHours(moment(vm.yadeSearch.toTime, 'HH:mm:ss').hours());
                                toDate.setMinutes(moment(vm.yadeSearch.toTime, 'HH:mm:ss').minutes());
                                toDate.setSeconds(moment(vm.yadeSearch.toTime, 'HH:mm:ss').seconds());
                            }
                        } else {
                            toDate.setHours(0);
                            toDate.setMinutes(0);
                            toDate.setSeconds(0);
                        }
                        toDate.setMilliseconds(0);
                        filter.dateTo = moment.utc(toDate);
                    }
                }

                if (vm.yadeSearch.jobschedulerId) {
                    filter.jobschedulerId = vm.yadeSearch.jobschedulerId;
                }
                filter.timeZone = vm.userPreferences.zone;
                if ((filter.dateFrom && (typeof filter.dateFrom.getMonth === 'function' || typeof filter.dateFrom === 'object')) || (filter.dateTo && (typeof filter.dateTo.getMonth === 'function' || typeof filter.dateTo === 'object'))) {
                    filter.timeZone = 'UTC';
                }
                if ((filter.dateFrom && typeof filter.dateFrom.getMonth === 'function')) {
                    filter.dateFrom = moment(filter.dateFrom).tz(vm.userPreferences.zone)._d;
                }
                if ((filter.dateTo && typeof filter.dateTo.getMonth === 'function')) {
                    filter.dateTo = moment(filter.dateTo).tz(vm.userPreferences.zone)._d;
                }
                filter.compact = true;
                YadeService.getTransfers(filter).then(function (res) {
                    vm.yadeHistorys = res.transfers;
                    setDuration(vm.yadeHistorys);
                    vm.loading = false;
                    isLoaded = true;
                }, function () {
                    vm.loading = false;
                    isLoaded = true;
                });
                yadeSearch = true;
            } else{
                vm.stream.filter.date = '';
                if (vm.jobStreamSearch.jobStream) {
                    filter.jobStream = vm.jobStreamSearch.jobStream;
                }
                if (vm.jobStreamSearch.date === 'process') {
                    filter = parseProcessExecuted(vm.jobStreamSearch.planned, filter);
                } else {
                    if (vm.jobStreamSearch.date === 'date' && vm.jobStreamSearch.from) {
                        fromDate = new Date(vm.jobStreamSearch.from);
                        if (vm.jobStreamSearch.fromTime) {
                            if (vm.jobStreamSearch.fromTime === '24:00' || vm.jobStreamSearch.fromTime === '24:00:00') {
                                fromDate.setDate(fromDate.getDate() + 1);
                                fromDate.setHours(0);
                                fromDate.setMinutes(0);
                                fromDate.setSeconds(0);
                            } else {
                                fromDate.setHours(moment(vm.jobStreamSearch.fromTime, 'HH:mm:ss').hours());
                                fromDate.setMinutes(moment(vm.jobStreamSearch.fromTime, 'HH:mm:ss').minutes());
                                fromDate.setSeconds(moment(vm.jobStreamSearch.fromTime, 'HH:mm:ss').seconds());
                            }
                        } else {
                            fromDate.setHours(0);
                            fromDate.setMinutes(0);
                            fromDate.setSeconds(0);
                        }
                        fromDate.setMilliseconds(0);
                        filter.dateFrom = moment.utc(fromDate);
                    }
                    if (vm.jobStreamSearch.date == 'date' && vm.jobStreamSearch.to) {
                        toDate = new Date(vm.jobStreamSearch.to);
                        if (vm.jobStreamSearch.toTime) {
                            if (vm.jobStreamSearch.toTime === '24:00' || vm.jobStreamSearch.toTime === '24:00:00') {
                                toDate.setDate(toDate.getDate() + 1);
                                toDate.setHours(0);
                                toDate.setMinutes(0);
                                toDate.setSeconds(0);
                            } else {
                                toDate.setHours(moment(vm.jobStreamSearch.toTime, 'HH:mm:ss').hours());
                                toDate.setMinutes(moment(vm.jobStreamSearch.toTime, 'HH:mm:ss').minutes());
                                toDate.setSeconds(moment(vm.jobStreamSearch.toTime, 'HH:mm:ss').seconds());
                            }
                        } else {
                            toDate.setHours(0);
                            toDate.setMinutes(0);
                            toDate.setSeconds(0);
                        }
                        toDate.setMilliseconds(0);
                        filter.dateTo = moment.utc(toDate);
                    }
                }

                if (vm.jobStreamSearch.jobschedulerId) {
                    filter.jobschedulerId = vm.jobStreamSearch.jobschedulerId;
                }
                if(vm.jobStreamSearch.status !== 'all') {
                    filter.status = vm.jobStreamSearch.status;
                }
                filter.timeZone = vm.userPreferences.zone;
                if ((filter.dateFrom && (typeof filter.dateFrom.getMonth === 'function' || typeof filter.dateFrom === 'object')) || (filter.dateTo && (typeof filter.dateTo.getMonth === 'function' || typeof filter.dateTo === 'object'))) {
                    filter.timeZone = 'UTC';
                }
                if ((filter.dateFrom && typeof filter.dateFrom.getMonth === 'function')) {
                    filter.dateFrom = moment(filter.dateFrom).tz(vm.userPreferences.zone)._d;
                }
                if ((filter.dateTo && typeof filter.dateTo.getMonth === 'function')) {
                    filter.dateTo = moment(filter.dateTo).tz(vm.userPreferences.zone)._d;
                }
                ConditionService.getSessions(filter).then(function (res) {
                    vm.jobStreamHistorys = res.jobstreamSessions;
                    setDuration(vm.jobStreamHistorys);
                    vm.loading = false;
                    isLoaded = true;
                }, function () {
                    vm.loading = false;
                    isLoaded = true;
                });
                jobStreamSearch = true;
            }
        };
        vm.advancedSearch = function () {
            vm.isUnique = true;
            vm.showSearchPanel = true;
            vm.object.paths = [];
            vm.object.orders = [];
            vm.object.jobChains = [];
            vm.object.jobs = [];
            vm.jobChainSearch.date = 'date';
            vm.jobSearch.date = 'date';
            vm.yadeSearch.date = 'date';
            vm.jobStreamSearch.date = 'date';

            vm.jobChainSearch.from = new Date();
            vm.jobChainSearch.fromTime = '00:00';
            vm.jobChainSearch.to = new Date();
            vm.jobChainSearch.toTime = moment().format("HH:mm");

            vm.jobSearch.from = new Date();
            vm.jobSearch.fromTime = '00:00';
            vm.jobSearch.to = new Date();
            vm.jobSearch.toTime = moment().format("HH:mm");

            vm.yadeSearch.from = new Date();
            vm.yadeSearch.fromTime = '00:00';
            vm.yadeSearch.to = new Date();
            vm.yadeSearch.toTime = moment().format("HH:mm")

            vm.jobStreamSearch.from = new Date();
            vm.jobStreamSearch.fromTime = '00:00';
            vm.jobStreamSearch.to = new Date();
            vm.jobStreamSearch.toTime = moment().format("HH:mm")
        };
        vm.cancel = function (form) {
            if (form)
                form.$setPristine();
            vm.showSearchPanel = false;
            if (!vm.order.filter.historyStates) {
                vm.order.filter.historyStates = 'all';
            }
            if (!vm.order.filter.date) {
                vm.order.filter.date = 'today';
            }
            if (!vm.task.filter.historyStates) {
                vm.task.filter.historyStates = 'all';
            }
            if (!vm.task.filter.date) {
                vm.task.filter.date = 'today';
            }
            if (!vm.yade.filter.historyStates) {
                vm.yade.filter.historyStates = 'all';
            }
            if (!vm.yade.filter.date) {
                vm.yade.filter.date = 'today';
            }
            if (!vm.stream.filter.date) {
                vm.stream.filter.date = 'today';
            }

            if (vm.historyFilters.type === 'job') {
                vm.jobSearch = {};
                vm.jobSearch.date = 'date';
            } else if (vm.historyFilters.type === 'jobChain') {
                vm.jobChainSearch = {};
                vm.jobChainSearch.date = 'date';
            } else if (vm.historyFilters.type === 'yade'){
                vm.yadeSearch = {};
                vm.yadeSearch.date = 'date';
            }else{
                vm.jobStreamSearch = {};
                vm.jobStreamSearch.date = 'date';
            }
            let filter = {};
            filter.jobschedulerId = vm.historyView.current == true ? vm.schedulerIds.selected : '';
            if (jobChainSearch) {
                jobChainSearch = false;
                if (vm.historyFilters.type === 'jobChain') {
                    orderHistory(filter);
                }
            }
            if (jobSearch) {
                jobSearch = false;
                if (vm.historyFilters.type === 'job') {
                    jobHistory(filter);
                }
            }
            if (yadeSearch) {
                yadeSearch = false;
                if (vm.historyFilters.type === 'yade') {
                    yadeHistory(filter);
                }
            }
            if (jobStreamSearch) {
                vm.reset();
                jobStreamSearch = false;
                if (vm.historyFilters.type === 'jobStream') {
                    jobStreamHistory(filter);
                }
            }
        };


        function orderParseDate(obj) {

            if ((vm.savedIgnoreList.isEnable == true || vm.savedIgnoreList.isEnable == 'true') && ((vm.savedIgnoreList.jobChains && vm.savedIgnoreList.jobChains.length > 0) || (vm.savedIgnoreList.orders && vm.savedIgnoreList.orders.length > 0))) {
                obj.excludeOrders = [];
                angular.forEach(vm.savedIgnoreList.jobChains, function (jobChain) {
                    obj.excludeOrders.push({jobChain: jobChain});
                });

                angular.forEach(vm.savedIgnoreList.orders, function (order) {
                    obj.excludeOrders.push(order);
                });
            }

            if (vm.selectedFiltered1.regex) {
                obj.regex = vm.selectedFiltered1.regex;
            }
            if (vm.selectedFiltered1.paths && vm.selectedFiltered1.paths.length > 0) {
                obj.folders = [];
                angular.forEach(vm.selectedFiltered1.paths, function (value) {
                    obj.folders.push({folder: value, recursive: true});
                })
            }
            if ((vm.selectedFiltered1.jobChains && vm.selectedFiltered1.jobChains.length > 0) || (vm.selectedFiltered1.orders && vm.selectedFiltered1.orders.length > 0)) {
                obj.orders = [];

                angular.forEach(vm.selectedFiltered1.orders, function (value) {
                    obj.orders.push({jobChain: value.jobChain, orderId: value.orderId});
                });
                if (!vm.selectedFiltered1.orders || vm.selectedFiltered1.orders.length == 0) {
                    angular.forEach(vm.selectedFiltered1.jobChains, function (value) {
                        obj.orders.push({jobChain: value});
                    });
                } else {
                    for (var i = 0; i < vm.selectedFiltered1.jobChains.length; i++) {
                        for (var j = 0; j < obj.orders.length; j++) {
                            var flag = true;
                            if (obj.orders[j].jobChain == vm.selectedFiltered1.jobChains[i]) {
                                flag = false;
                                break;
                            }
                        }
                        if (flag) {
                            obj.orders.push({jobChain: vm.selectedFiltered1.jobChains[i]});
                        }
                    }
                }
            }
            if (vm.selectedFiltered1.state && vm.selectedFiltered1.state.length > 0) {
                obj.historyStates = vm.selectedFiltered1.state;
            }

            obj = parseProcessExecuted(vm.selectedFiltered1.planned, obj);
            return obj;
        }

        function jobParseDate(obj) {
            if ((vm.savedIgnoreList.isEnable == true || vm.savedIgnoreList.isEnable == 'true') && (vm.savedIgnoreList.jobs && vm.savedIgnoreList.jobs.length > 0)) {

                obj.excludeJobs = [];
                angular.forEach(vm.savedIgnoreList.jobs, function (job) {
                    obj.excludeJobs.push({job: job});
                });
            }

            if (vm.selectedFiltered2.regex) {
                obj.regex = vm.selectedFiltered2.regex;
            }
            if (vm.selectedFiltered2.state && vm.selectedFiltered2.state.length > 0) {
                obj.historyStates = vm.selectedFiltered2.state;
            }
            if (vm.selectedFiltered2.paths && vm.selectedFiltered2.paths.length > 0) {
                obj.folders = [];
                angular.forEach(vm.selectedFiltered2.paths, function (value) {
                    obj.folders.push({folder: value, recursive: true});
                })
            }
            if (vm.selectedFiltered2.jobs && vm.selectedFiltered2.jobs.length > 0) {
                obj.jobs = [];

                angular.forEach(vm.selectedFiltered2.jobs, function (value) {
                    obj.jobs.push({job: value});
                });

            }
            obj = parseProcessExecuted(vm.selectedFiltered2.planned, obj);
            return obj;
        }

        function yadeParseDate(obj) {
            if (vm.selectedFiltered3.states && vm.selectedFiltered3.states.length > 0) {
                obj.states = vm.selectedFiltered3.states;
            }

            if (vm.selectedFiltered3.operations && vm.selectedFiltered3.operations.length > 0) {
                obj.operations = vm.selectedFiltered3.operations;
            }

            if (vm.selectedFiltered3.profileId) {
                vm.selectedFiltered3.profileId = vm.selectedFiltered3.profileId.replace(/\s*(,|^|$)\s*/g, "$1");
                obj.profiles = vm.selectedFiltered3.profileId.split(',');
            }

            if (vm.selectedFiltered3.mandator) {
                obj.mandator = vm.selectedFiltered3.mandator;
            }

            if (vm.selectedFiltered3.sourceFileName) {
                vm.selectedFiltered3.sourceFileName = vm.selectedFiltered3.sourceFileName.replace(/\s*(,|^|$)\s*/g, "$1");
                obj.sourceFiles = vm.selectedFiltered3.sourceFileName.split(',');
            }
            if (vm.selectedFiltered3.sourceFileRegex) {
                obj.sourceFilesRegex = vm.selectedFiltered3.sourceFileRegex;
            }
            if (vm.selectedFiltered3.targetFileName) {
                vm.selectedFiltered3.targetFileName = vm.selectedFiltered3.targetFileName.replace(/\s*(,|^|$)\s*/g, "$1");
                obj.targetFiles = vm.selectedFiltered3.targetFileName.split(',');
            }
            if (vm.selectedFiltered3.targetFileRegex) {
                obj.targetFilesRegex = vm.selectedFiltered3.targetFileRegex;
            }
            if (vm.selectedFiltered3.sourceHost && vm.selectedFiltered3.sourceProtocol) {
                let hosts = [];
                let protocols = [];
                if (vm.selectedFiltered3.sourceHost) {
                    let s = vm.selectedFiltered3.sourceHost.replace(/\s*(,|^|$)\s*/g, "$1");
                    hosts = s.split(',');
                }
                if (vm.selectedFiltered3.sourceProtocol) {
                    protocols = angular.copy(vm.selectedFiltered3.sourceProtocol);
                }
                obj.sources = mergeHostAndProtocol(hosts, protocols);
            }else{
                vm.selectedFiltered3.sourceHost = '';
                vm.selectedFiltered3.sourceProtocol = []
            }
            if (vm.selectedFiltered3.targetHost && vm.selectedFiltered3.targetProtocol) {
                let hosts = [];
                let protocols = [];
                if (vm.selectedFiltered3.targetHost) {
                    let t = vm.selectedFiltered3.targetHost.replace(/\s*(,|^|$)\s*/g, "$1");
                    hosts = t.split(',');
                }
                if (vm.selectedFiltered3.targetProtocol) {
                    protocols = angular.copy(vm.selectedFiltered3.targetProtocol);
                }
                obj.targets = mergeHostAndProtocol(hosts, protocols);
            }else{
                vm.selectedFiltered3.targetHost = '';
                vm.selectedFiltered3.targetProtocol = []
            }
            if (vm.selectedFiltered3.planned)
                obj = parseProcessExecuted(vm.selectedFiltered3.planned, obj);
            return obj;
        }

        vm.loadHistory = function () {
            if (!vm.order.filter.historyStates) {
                vm.order.filter.historyStates = 'all';
            }
            if (!vm.order.filter.date) {
                vm.order.filter.date = 'today';
            }
            if (!vm.task.filter.historyStates) {
                vm.task.filter.historyStates = 'all';
            }
            if (!vm.task.filter.date) {
                vm.task.filter.date = 'today';
            }
            if (!vm.stream.filter.historyStates) {
                vm.stream.filter.historyStates = 'all';
            }
            if (!vm.stream.filter.date) {
                vm.stream.filter.date = 'today';
            }
            if (!vm.yade.filter.historyStates) {
                vm.yade.filter.historyStates = 'all';
            }
            if (!vm.yade.filter.date) {
                vm.yade.filter.date = 'today';
            }

            if (vm.historyFilters.type == 'job') {
                vm.jobSearch = {};
                vm.jobSearch.date = 'date';
            } else if (vm.historyFilters.type == 'jobChain') {
                vm.jobChainSearch = {};
                vm.jobChainSearch.date = 'date';
            } else if (vm.historyFilters.type == 'yade'){
                vm.yadeSearch = {};
                vm.yadeSearch.date = 'date';
            } else{
                vm.jobStreamSearch = {};
                vm.jobStreamSearch.date = 'date';
            }
            vm.init()

        };

        vm.showPanelFuc = function (value) {
            value.show = true;
            var orders = {};
            orders.jobschedulerId = value.jobschedulerId || vm.schedulerIds.selected;
            orders.jobChain = value.jobChain;
            orders.orderId = value.orderId;
            orders.historyId = value.historyId;
            OrderService.history(orders).then(function (res) {
                value.steps = res.history.steps;
            }, function () {
                value.steps = [];
            });
            setTimeout(function () {
                updateDimensions();
            }, 10);
        };

        vm.hidePanelFuc = function (history) {
            history.show = false;
            setTimeout(function () {
                updateDimensions();
            }, 100);
        };

        vm.showHistoryPanelFuc = function (session) {
            session.show = true;
            let obj = {
                jobschedulerId: session.jobschedulerId || vm.schedulerIds.selected,
                session: session.session,
                jobStreamId: session.jobStreamId
            };
            ConditionService.history(obj).then(function (res) {
                session.history = res.history;
            }, function () {
                session.history = [];
            });
        };
        vm.hideHistoryPanelFuc = function (session) {
            session.show = false;
        };

        vm.showTransferFuc = function (value) {
            vm.isLoaded = true;
            let obj = {};
            obj.jobschedulerId = value.jobschedulerId || vm.schedulerIds.selected;
            obj.transferIds = [];
            obj.transferIds.push(value.id);
            YadeService.getTransfers(obj).then(function (res) {
                value = _.merge(value, res.transfers[0]);
                vm.isLoading = true;
            }, function () {
                vm.isLoading = true;
            });
            value.show = true;
            if (vm.permission.YADE.view.files) {
                let ids = [];
                ids.push(value.id);
                YadeService.files({
                    transferIds: ids,
                    jobschedulerId: value.jobschedulerId || vm.schedulerIds.selected
                }).then(function (res) {
                    value.files = res.files;
                    vm.isLoaded = false;
                }, function () {
                    vm.isLoaded = false;
                })
            }
        };

        vm.exportToExcel = function () {
            isLoaded = false;
            $('#exportToExcelBtn').attr("disabled", true);
            var fileName = 'jobscheduler-order-history-report';
            if (vm.historyFilters.type == 'job') {
                fileName = 'jobscheduler-task-history-report';
            } else if (vm.historyFilters.type == 'yade') {
                fileName = 'yade-history-report';
            } else if (vm.historyFilters.type == 'jobStream') {
                fileName = 'jobscheduler-job-stream-history-report';
            }
            if (!vm.isIE()) {
                $('#' + vm.historyFilters.type).table2excel({
                    exclude: ".tableexport-ignore",
                    filename: fileName,
                    fileext: ".xls",
                    exclude_img: false,
                    exclude_links: false,
                    exclude_inputs: false
                });
            } else {
                var ExportButtons = document.getElementById(vm.historyFilters.type);
                var instance = new TableExport(ExportButtons, {
                    formats: ['xlsx'],
                    exportButtons: false,
                    trimWhitespace: true,
                    bootstrap: false
                });
                var exportData = instance.getExportData()[vm.historyFilters.type]['xlsx'];
                instance.export2file(exportData.data, exportData.mimeType, fileName, exportData.fileExtension);
            }

            $('#exportToExcelBtn').attr("disabled", false);
            isLoaded = true;
        };

        function isCustomizationSelected1(flag) {
            if (flag) {
                vm.temp_filter1.historyStates = angular.copy(vm.order.filter.historyStates);
                vm.temp_filter1.date = angular.copy(vm.order.filter.date);
                vm.order.filter.historyStates = '';
                vm.order.filter.date = '';
            } else {
                if (vm.temp_filter1.historyStates) {
                    vm.order.filter.historyStates = angular.copy(vm.temp_filter1.historyStates);
                    vm.order.filter.date = angular.copy(vm.temp_filter1.date);
                } else {
                    vm.order.filter.historyStates = 'all';
                    vm.order.filter.date = 'today';
                }
            }
        }

        function isCustomizationSelected2(flag) {
            if (flag) {
                vm.temp_filter2.historyStates = angular.copy(vm.task.filter.historyStates);
                vm.temp_filter2.date = angular.copy(vm.task.filter.date);
                vm.task.filter.historyStates = '';
                vm.task.filter.date = '';
            } else {
                if (vm.temp_filter2.historyStates) {
                    vm.task.filter.historyStates = angular.copy(vm.temp_filter2.historyStates);
                    vm.task.filter.date = angular.copy(vm.temp_filter2.date);
                } else {
                    vm.task.filter.historyStates = 'all';
                    vm.task.filter.date = 'today';
                }
            }
        }

        function isCustomizationSelected3(flag) {
            if (flag) {
                vm.temp_filter3.states = angular.copy(vm.yade.filter.historyStates);
                vm.temp_filter3.date = angular.copy(vm.yade.filter.date);
                vm.yade.filter.historyStates = '';
                vm.yade.filter.date = '';
            } else {
                if (vm.temp_filter3.states) {
                    vm.yade.filter.historyStates = angular.copy(vm.temp_filter3.historyStates);
                    vm.yade.filter.date = angular.copy(vm.temp_filter3.date);
                } else {
                    vm.yade.filter.historyStates = 'all';
                    vm.yade.filter.date = 'today';
                }
            }
        }

        function isCustomizationSelected4(flag) {
            if (flag) {
                vm.temp_filter4.date = angular.copy(vm.stream.filter.date);
                vm.stream.filter.date = '';
            } else {
                if (vm.temp_filter4.date) {
                    vm.stream.filter.date = angular.copy(vm.temp_filter4.date);
                } else {
                    vm.stream.filter.date = 'today';
                }
            }
        }

        /**--------------- Filter -----------------------------*/
        vm.saveAsFilter = function (form) {
            var configObj = {};
            configObj.jobschedulerId = vm.schedulerIds.selected;
            configObj.account = vm.permission.user;
            configObj.configurationType = "CUSTOMIZATION";
            var obj = {};
            if (vm.jobChainSearch.name) {
                configObj.name = vm.jobChainSearch.name;
                obj.regex = vm.jobChainSearch.regex;
                obj.paths = vm.jobChainSearch.paths;
                obj.jobChains = vm.jobChainSearch.jobChains;
                obj.orders = vm.jobChainSearch.orders;
                obj.state = vm.jobChainSearch.states;
                obj.name = vm.jobChainSearch.name;
                obj.planned = vm.jobChainSearch.planned;
            } else if (vm.jobSearch.name) {
                configObj.name = vm.jobSearch.name;
                obj.regex = vm.jobSearch.regex;
                obj.paths = vm.jobSearch.paths;
                obj.jobs = vm.jobSearch.jobs;
                obj.state = vm.jobSearch.states;
                obj.criticality = vm.jobSearch.criticality;
                obj.name = vm.jobSearch.name;
                obj.planned = vm.jobSearch.planned;
            } else if (vm.yadeSearch.name) {
                configObj.name = vm.yadeSearch.name;
                obj = vm.yadeSearch;
            }else if (vm.jobStreamSearch.name) {
                configObj.name = vm.jobStreamSearch.name;
                obj = vm.jobStreamSearch;
            }
            configObj.id = 0;

            if (vm.historyFilters.type == 'jobChain') {
                configObj.objectType = "ORDER_HISTORY";
            } else if (vm.historyFilters.type == 'job') {
                configObj.objectType = "TASK_HISTORY";
            } else if (vm.historyFilters.type == 'yade') {
                configObj.objectType = "YADE_HISTORY";
            }else {
                configObj.objectType = "JOBSTREAM_HISTORY";
            }
            configObj.configurationItem = JSON.stringify(obj);
            UserService.saveConfiguration(configObj).then(function (res) {
                configObj.id = res.id;
                if (vm.historyFilters.type == 'jobChain') {
                    vm.jobChainSearch.name = '';
                } else if (vm.historyFilters.type == 'job') {
                    vm.jobSearch.name = '';
                } else if (vm.historyFilters.type == 'yade') {
                    vm.yadeSearch.name = '';
                }else{
                    vm.jobStreamSearch.name = '';
                }
                if (form)
                    form.$setPristine();

                if (vm.historyFilters.type == 'jobChain') {
                    vm.orderHistoryFilterList.push(configObj);
                } else if (vm.historyFilters.type == 'job') {
                    vm.jobHistoryFilterList.push(configObj);
                } else if (vm.historyFilters.type == 'job') {
                    vm.yadeHistoryFilterList.push(configObj);
                }else{
                    vm.jobStreamHistoryFilterList.push(configObj);
                }
            });
        };
        vm.advanceFilter = function () {
            vm.showSearchPanel = false;
            vm.object.paths = [];
            vm.object.orders = [];
            vm.object.jobChains = [];
            vm.object.jobs = [];
            vm.paths = [];
            vm.jobChains = [];
            vm.orders = [];
            vm.jobs = [];
            vm.historyFilter = {};
            vm.isUnique = true;
            vm.historyFilter.planned = 'today';
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/history-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                var configObj = {};
                configObj.jobschedulerId = vm.schedulerIds.selected;
                configObj.account = vm.permission.user;
                configObj.configurationType = "CUSTOMIZATION";
                configObj.name = vm.historyFilter.name;
                configObj.shared = vm.historyFilter.shared;
                configObj.id = 0;
                configObj.configurationItem = JSON.stringify(vm.historyFilter);
                if (vm.historyFilters.type == 'jobChain') {
                    configObj.objectType = "ORDER_HISTORY";
                } else if (vm.historyFilters.type == 'job') {
                    configObj.objectType = "TASK_HISTORY";
                }
                UserService.saveConfiguration(configObj).then(function (res) {
                    configObj.id = res.id;
                    if (vm.historyFilters.type == 'jobChain') {
                        vm.orderHistoryFilterList.push(configObj);
                        if (vm.orderHistoryFilterList.length == 1) {
                            vm.savedHistoryFilter.selected = res.id;
                            vm.historyFilters.order.selectedView = true;
                            vm.selectedFiltered1 = vm.historyFilter;
                            vm.selectedFiltered1.account = vm.permission.user;
                            vm.init();
                            isCustomizationSelected1(true);
                        }
                        vm.historyFilterObj.order = vm.savedHistoryFilter;
                    } else if (vm.historyFilters.type == 'job') {
                        vm.jobHistoryFilterList.push(configObj);
                        if (vm.jobHistoryFilterList.length == 1) {
                            vm.savedJobHistoryFilter.selected = res.id;
                            vm.historyFilters.task.selectedView = true;
                            vm.selectedFiltered2 = vm.historyFilter;
                            vm.selectedFiltered2.account = vm.permission.user;
                            vm.init();
                            isCustomizationSelected2(true);
                        }
                        vm.historyFilterObj.job = vm.savedJobHistoryFilter;
                    }
                    SavedFilter.setHistory(vm.historyFilterObj);
                    SavedFilter.save();
                });
                vm.object.paths = [];
                vm.object.orders = [];
                vm.object.jobChains = [];
                vm.object.jobs = [];
            }, function () {
                vm.object.paths = [];
                vm.object.orders = [];
                vm.object.jobChains = [];
                vm.object.jobs = [];
            });
        };
        vm.advanceFilter1 = function () {
            vm.showSearchPanel = false;
            vm.action = 'add';
            vm.yadeFilter = {};
            vm.yadeFilter.planned = 'today';
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/yade-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                var configObj = {};
                configObj.jobschedulerId = vm.schedulerIds.selected;
                configObj.account = vm.permission.user;
                configObj.configurationType = "CUSTOMIZATION";
                configObj.name = vm.yadeFilter.name;
                configObj.shared = vm.yadeFilter.shared;
                configObj.id = 0;
                configObj.configurationItem = JSON.stringify(vm.yadeFilter);
                configObj.objectType = "YADE_HISTORY";

                UserService.saveConfiguration(configObj).then(function (res) {
                    configObj.id = res.id;
                    vm.yadeHistoryFilterList.push(configObj);
                    if (vm.yadeHistoryFilterList.length == 1) {
                        vm.savedYadeHistoryFilter.selected = res.id;
                        vm.historyFilters.yade.selectedView = true;
                        vm.selectedFiltered3 = vm.yadeFilter;
                        vm.selectedFiltered3.account = vm.permission.user;
                        vm.init();
                        isCustomizationSelected3(true);
                    }
                    vm.historyFilterObj.yade = vm.savedYadeHistoryFilter;
                    SavedFilter.setHistory(vm.historyFilterObj);
                    SavedFilter.save();
                });

            }, function () {
            });
        };
        vm.advanceFilter2 = function () {
            vm.showSearchPanel = false;
            vm.action = 'add';
            vm.jobStreamFilter = {};
            vm.jobStreamFilter.planned = 'today';
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/job-stream-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                var configObj = {};
                configObj.jobschedulerId = vm.schedulerIds.selected;
                configObj.account = vm.permission.user;
                configObj.configurationType = "CUSTOMIZATION";
                configObj.name = vm.jobStreamFilter.name;
                configObj.shared = vm.jobStreamFilter.shared;
                configObj.id = 0;
                configObj.configurationItem = JSON.stringify(vm.jobStreamFilter);
                configObj.objectType = "JOBSTREAM_HISTORY";

                UserService.saveConfiguration(configObj).then(function (res) {
                    configObj.id = res.id;
                    vm.jobStreamHistoryFilterList.push(configObj);
                    if (vm.jobStreamHistoryFilterList.length == 1) {
                        vm.savedJobStreamHistoryFilter.selected = res.id;
                        vm.historyFilters.stream.selectedView = true;
                        vm.selectedFiltered4 = vm.jobStreamFilter;
                        vm.selectedFiltered4.account = vm.permission.user;
                        vm.init();
                        isCustomizationSelected4(true);
                    }
                    vm.historyFilterObj.stream = vm.savedJobStreamHistoryFilter;
                    SavedFilter.setHistory(vm.historyFilterObj);
                    SavedFilter.save();
                });

            }, function () {
            });
        };

        vm.editFilters = function () {
            vm.filters = {};
            if (vm.historyFilters.type == 'jobChain') {
                vm.filters.list = vm.orderHistoryFilterList;
                vm.filters.favorite = vm.savedHistoryFilter.favorite;
            } else if (vm.historyFilters.type == 'job') {
                vm.filters.list = vm.jobHistoryFilterList;
                vm.filters.favorite = vm.savedJobHistoryFilter.favorite;
            } else if (vm.historyFilters.type == 'yade'){
                vm.filters.list = vm.yadeHistoryFilterList;
                vm.filters.favorite = vm.savedYadeHistoryFilter.favorite;
            }else{
                vm.filters.list = vm.jobStreamHistoryFilterList;
                vm.filters.favorite = vm.savedJobStreamHistoryFilter.favorite;
            }

            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/edit-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm
            });
        };
        var temp_name = '';
        vm.editFilter = function (filter) {
            vm.cancel();
            vm.action = 'edit';
            vm.isUnique = true;
            temp_name = angular.copy(filter.name);
            UserService.configuration({jobschedulerId: filter.jobschedulerId, id: filter.id}).then(function (conf) {
                vm.historyFilter = JSON.parse(conf.configuration.configurationItem);
                vm.historyFilter.shared = filter.shared;
                vm.paths = vm.historyFilter.paths;
                vm.orders = vm.historyFilter.orders;
                vm.jobChains = vm.historyFilter.jobChains;
                vm.jobs = vm.historyFilter.jobs;
                vm.object.paths = vm.paths;
                vm.object.orders = vm.orders;
                vm.object.jobChains = vm.jobChains;
                vm.object.jobs = vm.jobs;
                if (vm.historyFilters.type == 'yade') {
                    vm.yadeFilter = vm.historyFilter;
                } else if (vm.historyFilters.type == 'jobStream') {
                    vm.jobStreamFilter = vm.historyFilter;
                }
            });
            var url = 'modules/core/template/edit-history-filter-dialog.html';
            if (vm.historyFilters.type == 'yade') {
                url = 'modules/core/template/yade-filter-dialog.html';
            } else if (vm.historyFilters.type == 'jobStream') {
                url = 'modules/core/template/job-stream-filter-dialog.html';
            }
            var modalInstance = $uibModal.open({
                templateUrl: url,
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {

                if (vm.historyFilters.type == 'jobChain') {
                    if (vm.savedHistoryFilter.selected == filter.id) {
                        vm.selectedFiltered1 = vm.historyFilter;
                        vm.historyFilters.order.selectedView = true;
                        vm.init();
                        isCustomizationSelected1(true);
                    }
                    vm.historyFilterObj.order = vm.savedHistoryFilter;

                } else if (vm.historyFilters.type == 'job') {
                    if (vm.savedJobHistoryFilter.selected == filter.id) {
                        vm.selectedFiltered2 = vm.historyFilter;
                        vm.historyFilters.task.selectedView = true;
                        vm.init();
                        isCustomizationSelected2(true);
                    }
                    vm.historyFilterObj.job = vm.savedJobHistoryFilter;
                } else if (vm.historyFilters.type == 'yade') {
                    if (vm.savedYadeHistoryFilter.selected == filter.id) {
                        vm.selectedFiltered3 = vm.yadeFilter;
                        vm.historyFilters.yade.selectedView = true;
                        vm.init();
                        isCustomizationSelected3(true);
                    }
                    vm.historyFilterObj.yade = vm.savedYadeHistoryFilter;
                } else if (vm.historyFilters.type == 'jobStream') {
                    if (vm.savedJobStreamHistoryFilter.selected == filter.id) {
                        vm.selectedFiltered4 = vm.jobStreamFilter;
                        vm.historyFilters.stream.selectedView = true;
                        vm.init();
                        isCustomizationSelected4(true);
                    }
                    vm.historyFilterObj.stream = vm.savedJobStreamHistoryFilter;
                }
                var configObj = {};
                configObj.jobschedulerId = filter.jobschedulerId;
                configObj.account = filter.account;
                configObj.configurationType = filter.configurationType;
                configObj.objectType = filter.objectType;
                configObj.id = filter.id;
                if (vm.historyFilters.type == 'yade') {
                    configObj.configurationItem = JSON.stringify(vm.yadeFilter);
                    configObj.name = vm.yadeFilter.name;
                    configObj.shared = vm.yadeFilter.shared;
                    filter.shared = vm.yadeFilter.shared;
                    filter.name = vm.yadeFilter.name;
                } else if (vm.historyFilters.type == 'jobStream') {
                    configObj.configurationItem = JSON.stringify(vm.jobStreamFilter);
                    configObj.name = vm.jobStreamFilter.name;
                    configObj.shared = vm.jobStreamFilter.shared;
                    filter.shared = vm.jobStreamFilter.shared;
                    filter.name = vm.jobStreamFilter.name;
                } else {
                    configObj.configurationItem = JSON.stringify(vm.historyFilter);
                    configObj.name = vm.historyFilter.name;
                    configObj.shared = vm.historyFilter.shared;
                    filter.shared = vm.historyFilter.shared;
                    filter.name = vm.historyFilter.name;
                }

                UserService.saveConfiguration(configObj);

                temp_name = '';
                vm.object.paths = [];
                vm.object.orders = [];
                vm.object.jobChains = [];
                vm.object.jobs = [];
                temp_name = '';
            }, function () {
                temp_name = '';
                vm.object.paths = [];
                vm.object.orders = [];
                vm.object.jobChains = [];
                vm.object.jobs = [];
                temp_name = '';
            });
        };

        vm.copyFilter = function (filter) {
            if (vm.historyFilters.type == 'yade') {
                vm.copyFilter1(filter);
                return;
            }else if (vm.historyFilters.type == 'jobStream') {
                vm.copyFilter2(filter);
                return;
            }
            vm.action = 'copy';
            vm.isUnique = true;
            UserService.configuration({jobschedulerId: filter.jobschedulerId, id: filter.id}).then(function (conf) {
                vm.historyFilter = JSON.parse(conf.configuration.configurationItem);
                vm.historyFilter.shared = filter.shared;
                vm.paths = vm.historyFilter.paths;
                vm.orders = vm.historyFilter.orders;
                vm.jobChains = vm.historyFilter.jobChains;
                vm.jobs = vm.historyFilter.jobs;
                vm.object.paths = vm.paths;
                vm.object.orders = vm.orders;
                vm.object.jobChains = vm.jobChains;
                vm.object.jobs = vm.jobs;
                if (vm.historyFilters.type == 'jobChain') {
                    vm.historyFilter.name = vm.checkCopyName(vm.orderHistoryFilterList, filter.name);
                } else if (vm.historyFilters.type == 'job') {
                    vm.historyFilter.name = vm.checkCopyName(vm.jobHistoryFilterList, filter.name);
                }
            });

            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/edit-history-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                var configObj = {};
                configObj.jobschedulerId = filter.jobschedulerId;
                configObj.account = vm.permission.user;
                configObj.configurationType = "CUSTOMIZATION";
                configObj.name = vm.historyFilter.name;
                configObj.shared = vm.historyFilter.shared;
                configObj.objectType = filter.objectType;
                configObj.id = 0;
                configObj.configurationItem = JSON.stringify(vm.historyFilter);
                UserService.saveConfiguration(configObj).then(function (res) {
                    configObj.id = res.id;
                    if (vm.historyFilters.type == 'jobChain') {
                        vm.orderHistoryFilterList.push(configObj);
                    } else if (vm.historyFilters.type == 'job') {
                        vm.jobHistoryFilterList.push(configObj);
                    }
                });
                vm.object.paths = [];
                vm.object.orders = [];
                vm.object.jobChains = [];
                vm.object.jobs = [];
            }, function () {
                vm.object.paths = [];
                vm.object.orders = [];
                vm.object.jobChains = [];
                vm.object.jobs = [];
            });
        };

        vm.copyFilter1 = function (filter) {
            vm.action = 'copy';
            vm.isUnique = true;
            UserService.configuration({jobschedulerId: filter.jobschedulerId, id: filter.id}).then(function (conf) {
                vm.yadeFilter = JSON.parse(conf.configuration.configurationItem);
                vm.yadeFilter.shared = filter.shared;
                vm.yadeFilter.name = vm.checkCopyName(vm.yadeHistoryFilterList, filter.name);
            });

            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/yade-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                var configObj = {};
                configObj.jobschedulerId = filter.jobschedulerId;
                configObj.account = vm.permission.user;
                configObj.configurationType = "CUSTOMIZATION";
                configObj.name = vm.yadeFilter.name;
                configObj.shared = vm.yadeFilter.shared;
                configObj.objectType = filter.objectType;
                configObj.id = 0;
                configObj.configurationItem = JSON.stringify(vm.yadeFilter);
                UserService.saveConfiguration(configObj).then(function (res) {
                    configObj.id = res.id;
                    vm.yadeHistoryFilterList.push(configObj);
                });
            }, function () {
            });
        };

        vm.copyFilter2 = function (filter) {
            vm.action = 'copy';
            vm.isUnique = true;
            UserService.configuration({jobschedulerId: filter.jobschedulerId, id: filter.id}).then(function (conf) {
                vm.jobStreamFilter = JSON.parse(conf.configuration.configurationItem);
                vm.jobStreamFilter.shared = filter.shared;
                vm.jobStreamFilter.name = vm.checkCopyName(vm.jobStreamHistoryFilterList, filter.name);
            });

            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/job-stream-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                var configObj = {};
                configObj.jobschedulerId = filter.jobschedulerId;
                configObj.account = vm.permission.user;
                configObj.configurationType = "CUSTOMIZATION";
                configObj.name = vm.jobStreamFilter.name;
                configObj.shared = vm.jobStreamFilter.shared;
                configObj.objectType = filter.objectType;
                configObj.id = 0;
                configObj.configurationItem = JSON.stringify(vm.jobStreamFilter);
                UserService.saveConfiguration(configObj).then(function (res) {
                    configObj.id = res.id;
                    vm.jobStreamHistoryFilterList.push(configObj);
                });
            }, function () {
            });
        };

        vm.deleteFilter = function (filter) {
            UserService.deleteConfiguration({
                jobschedulerId: filter.jobschedulerId,
                id: filter.id
            }).then(function () {
                if (vm.historyFilters.type == 'jobChain') {
                    angular.forEach(vm.orderHistoryFilterList, function (value, index) {
                        if (value.id == filter.id) {
                            vm.orderHistoryFilterList.splice(index, 1);
                        }
                    });
                    if (vm.savedHistoryFilter.selected == filter.id) {
                        vm.savedHistoryFilter.selected = undefined;
                        vm.historyFilters.order.selectedView = false;
                        vm.selectedFiltered1 = undefined;
                        isCustomizationSelected1(false);
                        vm.init();
                    } else {
                        if (vm.orderHistoryFilterList.length == 0) {
                            vm.savedHistoryFilter.selected = undefined;
                            vm.historyFilters.order.selectedView = false;
                            vm.selectedFiltered1 = undefined;
                            isCustomizationSelected1(false);
                        }
                    }
                    vm.historyFilterObj.order = vm.savedHistoryFilter;
                } else if (vm.historyFilters.type == 'job') {
                    angular.forEach(vm.jobHistoryFilterList, function (value, index) {
                        if (value.id == filter.id) {
                            vm.jobHistoryFilterList.splice(index, 1);
                        }
                    });

                    if (vm.savedJobHistoryFilter.selected == filter.id) {
                        vm.savedJobHistoryFilter.selected = undefined;
                        vm.historyFilters.task.selectedView = false;
                        vm.selectedFiltered2 = undefined;
                        vm.init();
                        isCustomizationSelected2(false);
                    } else {
                        if (vm.jobHistoryFilterList.length == 0) {
                            vm.savedJobHistoryFilter.selected = undefined;
                            vm.historyFilters.task.selectedView = false;
                            vm.selectedFiltered2 = undefined;
                            isCustomizationSelected2(false);
                        }
                    }
                    vm.historyFilterObj.job = vm.savedJobHistoryFilter;
                } else if (vm.historyFilters.type == 'yade') {
                    angular.forEach(vm.yadeHistoryFilterList, function (value, index) {
                        if (value.id == filter.id) {
                            vm.yadeHistoryFilterList.splice(index, 1);
                        }
                    });

                    if (vm.savedYadeHistoryFilter.selected == filter.id) {
                        vm.savedYadeHistoryFilter.selected = undefined;
                        vm.historyFilters.yade.selectedView = false;
                        vm.selectedFiltered3 = undefined;
                        vm.init();
                        isCustomizationSelected3(false);
                    } else {
                        if (vm.yadeHistoryFilterList.length == 0) {
                            vm.savedYadeHistoryFilter.selected = undefined;
                            vm.historyFilters.yade.selectedView = false;
                            vm.selectedFiltered3 = undefined;
                            isCustomizationSelected3(false);
                        }
                    }
                    vm.historyFilterObj.yade = vm.savedYadeHistoryFilter;
                } else if (vm.historyFilters.type == 'jobStream') {
                    angular.forEach(vm.jobStreamHistoryFilterList, function (value, index) {
                        if (value.id == filter.id) {
                            vm.jobStreamHistoryFilterList.splice(index, 1);
                        }
                    });
                    if (vm.savedJobStreamHistoryFilter.selected == filter.id) {
                        vm.savedJobStreamHistoryFilter.selected = undefined;
                        vm.historyFilters.stream.selectedView = false;
                        vm.selectedFiltered4 = undefined;
                        vm.init();
                        isCustomizationSelected4(false);
                    } else {
                        if (vm.jobStreamHistoryFilterList.length == 0) {
                            vm.savedJobStreamHistoryFilter.selected = undefined;
                            vm.historyFilters.stream.selectedView = false;
                            vm.selectedFiltered4 = undefined;
                            isCustomizationSelected4(false);
                        }
                    }
                    vm.historyFilterObj.stream = vm.savedJobStreamHistoryFilter;
                }
                SavedFilter.setHistory(vm.historyFilterObj);
                SavedFilter.save();
            });
        };

        vm.makePrivate = function (configObj) {
            UserService.privateConfiguration({
                jobschedulerId: configObj.jobschedulerId,
                id: configObj.id
            }).then(function (res) {
                configObj.shared = false;
                if (vm.permission.user != configObj.account) {
                    if (vm.historyFilters.type == 'jobChain') {
                        angular.forEach(vm.orderHistoryFilterList, function (value, index) {
                            if (value.id == configObj.id) {
                                vm.orderHistoryFilterList.splice(index, 1);
                            }
                        });
                    } else if (vm.historyFilters.type == 'job') {
                        angular.forEach(vm.jobHistoryFilterList, function (value, index) {
                            if (value.id == configObj.id) {
                                vm.jobHistoryFilterList.splice(index, 1);
                            }
                        });
                    } else if (vm.historyFilters.type == 'yade') {
                        angular.forEach(vm.yadeHistoryFilterList, function (value, index) {
                            if (value.id == configObj.id) {
                                vm.yadeHistoryFilterList.splice(index, 1);
                            }
                        });
                    }else if (vm.historyFilters.type == 'jobStream') {
                        angular.forEach(vm.jobStreamHistoryFilterList, function (value, index) {
                            if (value.id == configObj.id) {
                                vm.jobStreamHistoryFilterList.splice(index, 1);
                            }
                        });
                    }
                }
            });
        };

        vm.makeShare = function (configObj) {
            UserService.shareConfiguration({
                jobschedulerId: configObj.jobschedulerId,
                id: configObj.id
            }).then(function (res) {
                configObj.shared = true;
            });
        };

        vm.favorite = function (filter) {
            vm.filters.favorite = filter.id;
            if (vm.historyFilters.type == 'jobChain') {
                vm.savedHistoryFilter.favorite = filter.id;
                vm.historyFilters.order.selectedView = true;
                vm.historyFilterObj.order = vm.savedHistoryFilter;
            } else if (vm.historyFilters.type == 'job') {
                vm.savedJobHistoryFilter.favorite = filter.id;
                vm.historyFilters.task.selectedView = true;
                vm.historyFilterObj.job = vm.savedJobHistoryFilter;
            } else if (vm.historyFilters.type == 'yade'){
                vm.savedYadeHistoryFilter.favorite = filter.id;
                vm.historyFilters.yade.selectedView = true;
                vm.historyFilterObj.yade = vm.savedYadeHistoryFilter;
            }else if (vm.historyFilters.type == 'jobStream'){
                vm.savedJobStreamHistoryFilter.favorite = filter.id;
                vm.historyFilters.stream.selectedView = true;
                vm.historyFilterObj.stream = vm.savedJobStreamHistoryFilter;
            }
            SavedFilter.setHistory(vm.historyFilterObj);
            SavedFilter.save();
            vm.init();
        };

        vm.removeFavorite = function () {
            if (vm.historyFilters.type == 'jobChain') {
                vm.savedHistoryFilter.favorite = '';
                vm.historyFilterObj.order = vm.savedHistoryFilter;
            } else if (vm.historyFilters.type == 'job') {
                vm.savedJobHistoryFilter.favorite = '';
                vm.historyFilterObj.job = vm.savedJobHistoryFilter;
            } else if (vm.historyFilters.type == 'yade'){
                vm.savedYadeHistoryFilter.favorite = '';
                vm.historyFilterObj.yade = vm.savedYadeHistoryFilter;
            }else if (vm.historyFilters.type == 'jobStream'){
                vm.savedJobStreamHistoryFilter.favorite = '';
                vm.historyFilterObj.yade = vm.savedJobStreamHistoryFilter;
            }
            vm.filters.favorite = '';
            SavedFilter.setHistory(vm.historyFilterObj);
            SavedFilter.save();
        };

        vm.checkFilterName = function () {
            vm.isUnique = true;
            if (vm.historyFilters.type == 'jobChain') {
                if (vm.jobChainSearch && vm.jobChainSearch.name) {
                    angular.forEach(vm.orderHistoryFilterList, function (value) {
                        if (vm.jobChainSearch.name == value.name && vm.permission.user == value.account) {
                            vm.isUnique = false;
                        }
                    });
                } else if (vm.historyFilter) {
                    angular.forEach(vm.orderHistoryFilterList, function (value) {
                        if (vm.historyFilter.name == value.name && vm.permission.user == value.account && vm.historyFilter.name != temp_name) {
                            vm.isUnique = false;
                        }
                    });
                }
            } else if (vm.historyFilters.type == 'job') {
                if (vm.jobSearch && vm.jobSearch.name) {
                    angular.forEach(vm.jobHistoryFilterList, function (value) {
                        if (vm.jobSearch.name == value.name && vm.permission.user == value.account) {
                            vm.isUnique = false;
                        }
                    });
                } else if (vm.historyFilter) {
                    angular.forEach(vm.jobHistoryFilterList, function (value) {
                        if (vm.historyFilter.name == value.name && vm.permission.user == value.account && vm.historyFilter.name != temp_name) {
                            vm.isUnique = false;
                        }
                    });
                }
            } else if (vm.historyFilters.type == 'yade') {
                if (vm.yadeSearch && vm.yadeSearch.name) {
                    angular.forEach(vm.yadeHistoryFilterList, function (value) {
                        if (vm.yadeSearch.name == value.name && vm.permission.user == value.account) {
                            vm.isUnique = false;
                        }
                    });
                } else if (vm.yadeFilter) {
                    angular.forEach(vm.yadeHistoryFilterList, function (value) {
                        if (vm.yadeFilter.name == value.name && vm.permission.user == value.account && vm.yadeFilter.name != temp_name) {
                            vm.isUnique = false;
                        }
                    });
                }
            }else if (vm.historyFilters.type == 'jobStream') {
                if (vm.jobStreamSearch && vm.jobStreamSearch.name) {
                    angular.forEach(vm.jobStreamHistoryFilterList, function (value) {
                        if (vm.jobStreamSearch.name == value.name && vm.permission.user == value.account) {
                            vm.isUnique = false;
                        }
                    });
                } else if (vm.jobStreamFilter) {
                    angular.forEach(vm.jobStreamHistoryFilterList, function (value) {
                        if (vm.jobStreamFilter.name == value.name && vm.permission.user == value.account && vm.jobStreamFilter.name != temp_name) {
                            vm.isUnique = false;
                        }
                    });
                }
            }
        };

        vm.changeFilter = function (filter) {
            vm.cancel();
            if (vm.historyFilters.type == 'jobChain') {
                if (filter) {
                    vm.savedHistoryFilter.selected = filter.id;
                    vm.historyFilters.order.selectedView = true;
                    UserService.configuration({
                        jobschedulerId: filter.jobschedulerId,
                        id: filter.id
                    }).then(function (conf) {
                        vm.selectedFiltered1 = JSON.parse(conf.configuration.configurationItem);
                        vm.selectedFiltered1.account = filter.account;
                        vm.init();
                    });
                } else {
                    isCustomizationSelected1(false);
                    vm.savedHistoryFilter.selected = filter;
                    vm.historyFilters.order.selectedView = false;
                    vm.selectedFiltered1 = filter;
                    vm.init();
                }

                vm.historyFilterObj.order = vm.savedHistoryFilter;

            } else if (vm.historyFilters.type == 'job') {
                if (filter) {
                    vm.savedJobHistoryFilter.selected = filter.id;
                    vm.historyFilters.task.selectedView = true;
                    UserService.configuration({
                        jobschedulerId: filter.jobschedulerId,
                        id: filter.id
                    }).then(function (conf) {
                        vm.selectedFiltered2 = JSON.parse(conf.configuration.configurationItem);
                        vm.selectedFiltered2.account = filter.account;
                        vm.init();
                    });
                } else {
                    isCustomizationSelected2(false);
                    vm.savedJobHistoryFilter.selected = filter;
                    vm.historyFilters.task.selectedView = false;
                    vm.selectedFiltered2 = filter;
                    vm.init();
                }

                vm.historyFilterObj.job = vm.savedJobHistoryFilter;
            } else if (vm.historyFilters.type == 'yade') {
                if (filter) {
                    vm.savedYadeHistoryFilter.selected = filter.id;
                    vm.historyFilters.yade.selectedView = true;
                    UserService.configuration({
                        jobschedulerId: filter.jobschedulerId,
                        id: filter.id
                    }).then(function (conf) {
                        vm.selectedFiltered3 = JSON.parse(conf.configuration.configurationItem);
                        vm.selectedFiltered3.account = filter.account;
                        vm.init();
                    });
                } else {
                    isCustomizationSelected3(false);
                    vm.savedYadeHistoryFilter.selected = filter;
                    vm.historyFilters.yade.selectedView = false;
                    vm.selectedFiltered3 = filter;
                    vm.init();
                }

                vm.historyFilterObj.yade = vm.savedYadeHistoryFilter;
            } else if (vm.historyFilters.type == 'jobStream') {
                if (filter) {
                    vm.savedJobStreamHistoryFilter.selected = filter.id;
                    vm.historyFilters.stream.selectedView = true;
                    UserService.configuration({
                        jobschedulerId: filter.jobschedulerId,
                        id: filter.id
                    }).then(function (conf) {
                        vm.selectedFiltered4 = JSON.parse(conf.configuration.configurationItem);
                        vm.selectedFiltered4.account = filter.account;
                        vm.init();
                    });
                } else {
                    isCustomizationSelected3(false);
                    vm.savedJobStreamHistoryFilter.selected = filter;
                    vm.historyFilters.stream.selectedView = false;
                    vm.selectedFiltered4 = filter;
                    vm.init();
                }

                vm.historyFilterObj.stream = vm.savedJobStreamHistoryFilter;
            }

            SavedFilter.setHistory(vm.historyFilterObj);
            SavedFilter.save();
        };

        vm.expanding_property = {
            field: "name"
        };

        vm.filter_tree = {};
        vm.filter_tree1 = {};
        vm.getTreeStructure = function () {
            $('#treeModal').modal('show');
            if (vm.historyFilters.type == 'jobChain') {
                OrderService.tree({
                    jobschedulerId: vm.schedulerIds.selected,
                    compact: true,
                    types: ['ORDER']
                }).then(function (res) {
                    vm.tree = res.folders;
                    angular.forEach(vm.tree, function (value) {
                        value.expanded = true;
                        if (value.folders) {
                            value.folders = orderBy(value.folders, 'name');
                        }
                    });
                }, function () {
                    $('#treeModal').modal('hide');
                });
            } else if (vm.historyFilters.type == 'job') {
                JobService.tree({
                    jobschedulerId: vm.schedulerIds.selected,
                    compact: true,
                    types: ['JOB']
                }).then(function (res) {
                    vm.tree = res.folders;
                    angular.forEach(vm.tree, function (value) {
                        value.expanded = true;
                        if (value.folders) {
                            value.folders = orderBy(value.folders, 'name');
                        }
                    });
                }, function () {
                    $('#treeModal').modal('hide');
                });
            }
        };

        vm.getTreeStructureForObjects = function () {
            $('#objectModal').modal('show');
            if (vm.historyFilters.type == 'jobChain') {
                OrderService.tree({
                    jobschedulerId: vm.schedulerIds.selected,
                    compact: true,
                    types: ['ORDER']
                }).then(function (res) {
                    vm.tree1 = res.folders;
                    angular.forEach(vm.tree1, function (value) {
                        value.expanded = true;
                        if (value.folders) {
                            value.folders = orderBy(value.folders, 'name');
                        }
                    });
                }, function (err) {
                    $('#objectModal').modal('hide');
                });
            } else if (vm.historyFilters.type == 'job') {
                JobService.tree({
                    jobschedulerId: vm.schedulerIds.selected,
                    compact: true,
                    types: ['JOB']
                }).then(function (res) {
                    vm.tree1 = res.folders;
                    angular.forEach(vm.tree1, function (value) {
                        value.expanded = true;
                        if (value.folders) {
                            value.folders = orderBy(value.folders, 'name');
                        }
                    });
                }, function () {
                    $('#objectModal').modal('hide');
                });
            }
        };

        vm.treeHandler = function (data) {
            data.expanded = !data.expanded;
            if (data.expanded) {
                if (vm.historyFilters.type == 'jobChain') {
                    data.jobChains = [];
                    let obj = {};
                    obj.jobschedulerId = vm.schedulerIds.selected;
                    obj.compact = true;
                    obj.folders = [{folder: data.path, recursive: false}];
                    OrderService.getOrdersP(obj).then(function (result) {
                        data.jobChains = result.orders;
                    });
                } else if (vm.historyFilters.type == 'job') {
                    data.jobs = [];
                    let obj = {};
                    obj.jobschedulerId = vm.schedulerIds.selected;
                    obj.compact = true;
                    obj.folders = [{folder: data.path, recursive: false}];
                    JobService.getJobsP(obj).then(function (result) {
                        data.jobs = result.jobs;
                    });
                }
            } else {
                data.jobChains = [];
                data.jobs = [];
            }
        };

        vm.treeHandler1 = function (data) {
            if (data.expanded) {
                data.folders = orderBy(data.folders, 'name');
            }
        };

        vm.object.paths = [];
        vm.object.orders = [];
        vm.object.jobChains = [];
        vm.object.jobs = [];
        vm.object.sessions = [];

        vm.setInstanceToComplete = function(){
            vm.setInstanceToRunning(true);
        }

        vm.setInstanceToRunning = function(status) {
            let x = _.groupBy(vm.object.sessions, 'jobStreamId');
            for (let i in x) {
                let obj = {
                    jobStreamId: i,
                    session: [],
                    status: status ? 'completed' : 'running'
                }
                angular.forEach(x[i], function (session) {
                    obj.jobschedulerId = session.jobschedulerId;
                    obj.session.push(session.session);
                })
                _updateState(obj)
            }
        }

        function _updateState(obj) {
            ConditionService.updateState(obj).then(function (result) {
                vm.reset();
                updateHistoryAfterEvent();
            });
        }

        vm.updateState = function (session) {
            let obj = {
                jobschedulerId: session.jobschedulerId,
                jobStreamId: session.jobStreamId,
                session: [session.session],
                status: session.running ? 'completed' : 'running'
            }
            _updateState(obj)
        }

        vm.checkAllSession = function (jobStreamFiltered) {
            if (vm.allSessionCheck.checkbox) {
                let _session = $filter('orderBy')(jobStreamFiltered, vm.stream.filter.sortBy, vm.stream.sortReverse);
                vm.object.sessions = _session.slice((vm.userPreferences.entryPerPage * (vm.stream.currentPage - 1)), (vm.userPreferences.entryPerPage * vm.stream.currentPage));
            } else {
                vm.reset();
            }
        };

        vm.reset = function () {
            vm.allSessionCheck.checkbox = false;
            vm.object.sessions = [];
        };

        vm.pageChange = function () {
            vm.reset();
        };

        vm.checkSessionValue = function (sessions) {
            if (vm.object.sessions && vm.object.sessions.length > 0) {
                vm.allSessionCheck.checkbox = vm.object.sessions.length === sessions.slice((vm.userPreferences.entryPerPage * (vm.stream.currentPage - 1)), (vm.userPreferences.entryPerPage * vm.stream.currentPage)).length;
            } else {
                vm.reset();
            }
        };

        var watcher2 = vm.$watch('userPreferences.entryPerPage', function (newNames) {
            if (newNames) {
                vm.reset();
            }
        });

        var watcher6 = $scope.$watchCollection('object.paths', function (newNames) {
            if (newNames && newNames.length > 0) {
                vm.paths = newNames;
            }
        });

        var watcher7 = $scope.$watchCollection('object.orders', function (newNames) {
            if (newNames && newNames.length > 0) {
                vm.orders = [];
                angular.forEach(newNames, function (v) {
                    vm.orders.push({orderId: v.orderId, jobChain: v.jobChain});
                });
            }
        });

        var watcher8 = $scope.$watchCollection('object.jobChains', function (newNames) {
            if (newNames && newNames.length > 0) {
                vm.jobChains = newNames;
            }
        });

        var watcher9 = $scope.$watchCollection('object.jobs', function (newNames) {
            if (newNames && newNames.length > 0) {
                vm.jobs = newNames;
            }
        });

        vm.addFolderPaths = function () {
            if (vm.historyFilter && !vm.showSearchPanel) {
                vm.historyFilter.paths = vm.paths;
            } else if (vm.jobChainSearch && vm.historyFilters.type == 'jobChain') {
                vm.jobChainSearch.paths = vm.paths;
            } else if (vm.jobSearch && vm.historyFilters.type == 'job') {
                vm.jobSearch.paths = vm.paths;
            }
        };
        vm.addObjectPaths = function () {
            if (vm.historyFilters.type == 'jobChain') {
                if (vm.jobChainSearch && vm.showSearchPanel) {
                    vm.jobChainSearch.orders = vm.orders;
                    vm.jobChainSearch.jobChains = vm.jobChains;
                } else if (vm.historyFilter && !vm.showSearchPanel) {
                    vm.historyFilter.orders = vm.orders;
                    vm.historyFilter.jobChains = vm.jobChains;
                }
            } else if (vm.historyFilters.type == 'job') {
                if (vm.jobSearch && vm.showSearchPanel) {
                    vm.jobSearch.jobs = vm.jobs;
                } else if (vm.historyFilter && !vm.showSearchPanel) {
                    vm.historyFilter.jobs = vm.jobs;
                }
            }
        };
        vm.remove = function (object, type) {
            if (type == 'jobChain') {
                if (vm.historyFilter && vm.historyFilter.jobChains && !vm.showSearchPanel) {
                    for (let i = 0; i < vm.historyFilter.jobChains.length; i++) {
                        if (angular.equals(vm.historyFilter.jobChains[i], object)) {
                            vm.historyFilter.jobChains.splice(i, 1);
                            break;
                        }
                    }

                } else {
                    for (let i = 0; i < vm.jobChainSearch.jobChains.length; i++) {
                        if (angular.equals(vm.jobChainSearch.jobChains[i], object)) {
                            vm.jobChainSearch.jobChains.splice(i, 1);
                            break;
                        }
                    }

                }
            } else if (type == 'job') {
                if (vm.historyFilter && vm.historyFilter.jobs && !vm.showSearchPanel) {
                    for (let i = 0; i < vm.historyFilter.jobs.length; i++) {
                        if (angular.equals(vm.historyFilter.jobs[i], object)) {
                            vm.historyFilter.jobs.splice(i, 1);
                            break;
                        }
                    }
                } else {
                    for (let i = 0; i < vm.jobSearch.jobs.length; i++) {
                        if (angular.equals(vm.jobSearch.jobs[i], object)) {
                            vm.jobSearch.jobs.splice(i, 1);
                            break;
                        }
                    }
                }

            } else if (type == 'order') {
                if (vm.historyFilter && vm.historyFilter.orders && !vm.showSearchPanel) {
                    for (let i = 0; i < vm.historyFilter.orders.length; i++) {
                        if (angular.equals(vm.historyFilter.orders[i], object)) {
                            vm.historyFilter.orders.splice(i, 1);
                            vm.object.orders.splice(i, 1);
                            break;
                        }
                    }
                } else {
                    for (let i = 0; i < vm.jobChainSearch.orders.length; i++) {
                        if (angular.equals(vm.jobChainSearch.orders[i], object)) {
                            vm.jobChainSearch.orders.splice(i, 1);
                            vm.object.orders.splice(i, 1);
                            break;
                        }
                    }
                }

            } else {
                if (vm.historyFilter && vm.historyFilter.paths && !vm.showSearchPanel) {
                    for (let i = 0; i < vm.historyFilter.paths.length; i++) {
                        if (angular.equals(vm.historyFilter.paths[i], object)) {
                            vm.historyFilter.paths.splice(i, 1);
                            break;
                        }
                    }
                } else if (vm.jobChainSearch && vm.historyFilters.type == 'jobChain') {
                    for (let i = 0; i < vm.jobChainSearch.paths.length; i++) {
                        if (angular.equals(vm.jobChainSearch.paths[i], object)) {
                            vm.jobChainSearch.paths.splice(i, 1);
                            break;
                        }
                    }
                } else if (vm.jobSearch && vm.historyFilters.type == 'job') {
                    for (let i = 0; i < vm.jobSearch.paths.length; i++) {
                        if (angular.equals(vm.jobSearch.paths[i], object)) {
                            vm.jobSearch.paths.splice(i, 1);
                            break;
                        }
                    }
                }
            }

        };

        /**--------------- ignore list functions -------------*/

        vm.addOrderToIgnoreList = function (orderId, jobChain) {
            var obj = {
                jobChain: jobChain,
                orderId: orderId
            };

            if (vm.savedIgnoreList.orders.indexOf(obj) === -1) {
                vm.savedIgnoreList.orders.push(obj);
                if ((vm.savedIgnoreList.isEnable == 'true' || vm.savedIgnoreList.isEnable == true)) {
                    if (jobChainSearch) {
                        vm.search(true);
                    } else {
                        vm.init();
                    }
                }
                configObj.configurationType = "IGNORELIST";
                configObj.id = vm.ignoreListConfigId;
                configObj.configurationItem = JSON.stringify(vm.savedIgnoreList);
                UserService.saveConfiguration(configObj).then(function (res) {
                    vm.ignoreListConfigId = res.id;
                })
            }
        };

        vm.addJobChainToIgnoreList = function (name) {
            if (vm.savedIgnoreList.jobChains.indexOf(name) === -1) {
                vm.savedIgnoreList.jobChains.push(name);
                if ((vm.savedIgnoreList.isEnable == 'true' || vm.savedIgnoreList.isEnable == true)) {
                    if (jobChainSearch) {
                        vm.search(true);
                    } else {
                        vm.init();
                    }
                }
                configObj.configurationType = "IGNORELIST";
                configObj.id = vm.ignoreListConfigId;
                configObj.configurationItem = JSON.stringify(vm.savedIgnoreList);
                UserService.saveConfiguration(configObj).then(function (res) {
                    vm.ignoreListConfigId = res.id;
                })
            }
        };

        vm.addJobToIgnoreList = function (name) {
            if (vm.savedIgnoreList.jobs.indexOf(name) === -1) {
                vm.savedIgnoreList.jobs.push(name);
                if ((vm.savedIgnoreList.isEnable == 'true' || vm.savedIgnoreList.isEnable == true)) {
                    if (jobSearch) {
                        vm.search(true);
                    } else {
                        vm.init();
                    }
                }
                configObj.configurationType = "IGNORELIST";
                configObj.id = vm.ignoreListConfigId;
                configObj.configurationItem = JSON.stringify(vm.savedIgnoreList);
                UserService.saveConfiguration(configObj).then(function (res) {
                    vm.ignoreListConfigId = res.id;
                })
            }
        };

        vm.editIgnoreList = function () {
            if ((vm.savedIgnoreList.jobChains && vm.savedIgnoreList.jobChains.length > 0) || (vm.savedIgnoreList.orders && vm.savedIgnoreList.orders.length > 0) || (vm.savedIgnoreList.jobs && vm.savedIgnoreList.jobs.length > 0)) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/edit-ignorelist-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
            }
        };

        vm.removeOrderIgnoreList = function (name) {
            vm.savedIgnoreList.orders.splice(vm.savedIgnoreList.orders.indexOf(name), 1);
            configObj.configurationType = "IGNORELIST";
            configObj.configurationItem = JSON.stringify(vm.savedIgnoreList);
            configObj.id = vm.ignoreListConfigId;
            UserService.saveConfiguration(configObj).then(function (res) {
                vm.ignoreListConfigId = res.id;
            });
            if ((vm.savedIgnoreList.isEnable == 'true' || vm.savedIgnoreList.isEnable == true)) {
                if ((jobChainSearch && vm.historyFilters.type == 'jobChain')) {
                    vm.search(true);
                } else
                    vm.init();
            }
        };

        vm.removeJobChainIgnoreList = function (name) {
            vm.savedIgnoreList.jobChains.splice(vm.savedIgnoreList.jobChains.indexOf(name), 1);
            configObj.configurationType = "IGNORELIST";
            configObj.configurationItem = JSON.stringify(vm.savedIgnoreList);
            configObj.id = vm.ignoreListConfigId;
            UserService.saveConfiguration(configObj).then(function (res) {
                vm.ignoreListConfigId = res.id;
            });
            if ((vm.savedIgnoreList.isEnable == 'true' || vm.savedIgnoreList.isEnable == true)) {
                if ((jobChainSearch && vm.historyFilters.type == 'jobChain')) {
                    vm.search(true);
                } else
                    vm.init();
            }
        };

        vm.removeJobIgnoreList = function (name) {
            vm.savedIgnoreList.jobs.splice(vm.savedIgnoreList.jobs.indexOf(name), 1);
            configObj.configurationType = "IGNORELIST";
            configObj.configurationItem = JSON.stringify(vm.savedIgnoreList);
            configObj.id = vm.ignoreListConfigId;
            UserService.saveConfiguration(configObj).then(function (res) {
                vm.ignoreListConfigId = res.id;
            });
            if ((vm.savedIgnoreList.isEnable == 'true' || vm.savedIgnoreList.isEnable == true)) {
                if ((jobSearch && vm.historyFilters.type != 'jobChain')) {
                    vm.search(true);
                } else
                    vm.init();
            }
        };

        vm.resetIgnoreList = function () {

            if ((vm.savedIgnoreList.isEnable == 'true' || vm.savedIgnoreList.isEnable == true) && vm.historyFilters.type == 'jobChain' && ((vm.savedIgnoreList.jobChains && vm.savedIgnoreList.jobChains.length > 0) || (vm.savedIgnoreList.orders && vm.savedIgnoreList.orders.length > 0))) {
                if (jobChainSearch) {
                    vm.search(true);
                } else
                    vm.init();
            } else if ((vm.savedIgnoreList.isEnable == 'true' || vm.savedIgnoreList.isEnable == true) && vm.historyFilters.type != 'jobChain' && (vm.savedIgnoreList.jobs && vm.savedIgnoreList.jobs.length > 0)) {
                if (jobSearch) {
                    vm.search(true);
                } else
                    vm.init();
            }
            vm.savedIgnoreList.orders = [];
            vm.savedIgnoreList.jobChains = [];
            vm.savedIgnoreList.jobs = [];
            vm.savedIgnoreList.isEnable = false;
            configObj.configurationType = "IGNORELIST";
            configObj.id = vm.ignoreListConfigId;
            configObj.configurationItem = JSON.stringify(vm.savedIgnoreList);
            UserService.saveConfiguration(configObj).then(function (res) {
                vm.ignoreListConfigId = res.id;
            })
        };

        vm.enableDisableIgnoreList = function () {
            vm.savedIgnoreList.isEnable = !vm.savedIgnoreList.isEnable;
            configObj.configurationType = "IGNORELIST";
            configObj.id = vm.ignoreListConfigId;
            configObj.configurationItem = JSON.stringify(vm.savedIgnoreList);
            UserService.saveConfiguration(configObj).then(function (res) {
                vm.ignoreListConfigId = res.id;
            });
            if ((jobSearch && vm.historyFilters.type != 'jobChain') || (jobChainSearch && vm.historyFilters.type == 'jobChain')) {
                vm.search(true);
            } else
                vm.init();
        };

        function getTransfer(transfer) {
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.transferIds = [];
            obj.transferIds.push(transfer.id);
            YadeService.getTransfers(obj).then(function (res) {
                if (res.transfers && res.transfers.length > 0) {
                    transfer.states = res.transfers[0].states;
                    transfer.operations = res.transfers[0].operations;
                    transfer.hasIntervention = res.transfers[0].hasIntervention;
                    transfer.isIntervention = res.transfers[0].isIntervention;
                    transfer.source = res.transfers[0].source;
                    transfer.target = res.transfers[0].target;
                    transfer.mandator = res.transfers[0].mandator;
                    transfer.profile = res.transfers[0].profile;
                    transfer.taskId = res.transfers[0].taskId;
                }
            });
        }

        function getFiles(value) {
            if (vm.permission.YADE.view.files) {
                var ids = [];
                ids.push(value.id);
                YadeService.files({
                    transferIds: ids,
                    jobschedulerId: value.jobschedulerId || vm.schedulerIds.selected
                }).then(function (res) {
                    value.files = res.files;
                    vm.isLoaded = false;
                }, function () {
                    vm.isLoaded = false;
                })
            }
        }

        function updateHistoryAfterEvent() {
            var filter = {};
            isLoaded = false;
            filter.jobschedulerId = vm.historyView.current == true ? vm.schedulerIds.selected : '';
            filter.limit = parseInt(vm.userPreferences.maxRecords);
            if (vm.historyFilters.type == 'jobChain') {
                if (vm.selectedFiltered1) {
                    filter = orderParseDate(filter);
                } else {
                    filter = setOrderDateRange(filter);
                    if (vm.order.filter.historyStates != 'all') {
                        filter.historyStates = [];
                        filter.historyStates.push(vm.order.filter.historyStates);
                    }
                }
                if (jobChainSearch) {
                    vm.search(true);
                } else {
                    filter.timeZone = vm.userPreferences.zone;
                    if ((filter.dateFrom && (typeof filter.dateFrom.getMonth === 'function' || typeof filter.dateFrom === 'object')) || (filter.dateTo && (typeof filter.dateTo.getMonth === 'function' || typeof filter.dateTo === 'object'))) {
                        filter.timeZone = 'UTC';
                    }
                    if ((filter.dateFrom && typeof filter.dateFrom.getMonth === 'function')) {
                        filter.dateFrom = moment(filter.dateFrom).tz(vm.userPreferences.zone)._d;
                    }
                    if ((filter.dateTo && typeof filter.dateTo.getMonth === 'function')) {
                        filter.dateTo = moment(filter.dateTo).tz(vm.userPreferences.zone)._d;
                    }
                    OrderService.histories(filter).then(function (res) {
                        let temp;
                        if (vm.historys && vm.historys.length > 0 && res.history && res.history.length > 0) {
                            temp = angular.copy(vm.historys);
                        }
                        vm.historys = res.history;
                        setDuration(vm.historys, temp);
                        isLoaded = true;
                        setTimeout(function () {
                            updateDimensions();
                        }, 0);
                    }, function () {
                        isLoaded = true;
                    });
                }
            } else if (vm.historyFilters.type == 'job') {
                if (vm.selectedFiltered2) {
                    filter = jobParseDate(filter);
                } else {
                    filter = setTaskDateRange(filter);
                    if (vm.task.filter.historyStates != 'all') {
                        filter.historyStates = [];
                        filter.historyStates.push(vm.task.filter.historyStates);
                    }
                }
                if (jobSearch) {
                    vm.search(true);
                } else {
                    filter.timeZone = vm.userPreferences.zone;
                    if ((filter.dateFrom && (typeof filter.dateFrom.getMonth === 'function' || typeof filter.dateFrom === 'object')) || (filter.dateTo && (typeof filter.dateTo.getMonth === 'function' || typeof filter.dateTo === 'object'))) {
                        filter.timeZone = 'UTC';
                    }
                    if ((filter.dateFrom && typeof filter.dateFrom.getMonth === 'function')) {
                        filter.dateFrom = moment(filter.dateFrom).tz(vm.userPreferences.zone)._d;
                    }
                    if ((filter.dateTo && typeof filter.dateTo.getMonth === 'function')) {
                        filter.dateTo = moment(filter.dateTo).tz(vm.userPreferences.zone)._d;
                    }
                    TaskService.histories(filter).then(function (res) {
                        vm.jobHistorys = res.history;
                        setDuration(vm.jobHistorys);
                        isLoaded = true;
                    }, function () {
                        isLoaded = true;
                    });
                }
            } else if (vm.historyFilters.type == 'yade') {
                if (vm.selectedFiltered3) {
                    isCustomizationSelected3(true);
                    filter = yadeParseDate(filter);
                } else {
                    filter = setYadeDateRange(filter);
                    if (vm.yade.filter.historyStates && vm.yade.filter.historyStates != 'all' && vm.yade.filter.historyStates.length > 0) {
                        filter.states = [];
                        filter.states.push(vm.yade.filter.historyStates);
                    }
                }
                filter.timeZone = vm.userPreferences.zone;
                if ((filter.dateFrom && (typeof filter.dateFrom.getMonth === 'function' || typeof filter.dateFrom === 'object')) || (filter.dateTo && (typeof filter.dateTo.getMonth === 'function' || typeof filter.dateTo === 'object'))) {
                    filter.timeZone = 'UTC';
                }
                if ((filter.dateFrom && typeof filter.dateFrom.getMonth === 'function')) {
                    filter.dateFrom = moment(filter.dateFrom).tz(vm.userPreferences.zone)._d;
                }
                if ((filter.dateTo && typeof filter.dateTo.getMonth === 'function')) {
                    filter.dateTo = moment(filter.dateTo).tz(vm.userPreferences.zone)._d;
                }
                filter.compact = true;
                if (yadeSearch) {
                    vm.search(true);
                } else {
                    YadeService.getTransfers(filter).then(function (res) {
                        if (vm.yadeHistorys && vm.yadeHistorys.length > 0 && res.transfers && res.transfers.length > 0) {
                            vm.yadeHistorys = _.merge(vm.yadeHistorys, res.transfers);
                        } else {
                            vm.yadeHistorys = res.transfers;
                        }
                        vm.isLoading = true;
                        isLoaded = true;
                    }, function () {
                        vm.isLoading = true;
                        isLoaded = true;
                    });
                }
            }else if (vm.historyFilters.type === 'jobStream') {
                if (vm.selectedFiltered4) {
                    isCustomizationSelected4(true);
                    if (vm.selectedFiltered4.jobStream) {
                        filter.jobStream = vm.selectedFiltered4.jobStream;
                    }
                    if(vm.selectedFiltered4.status !== 'all') {
                        filter.status = vm.selectedFiltered4.status;
                    }
                    filter = parseProcessExecuted(vm.selectedFiltered4.planned, filter);
                } else {
                    filter = setJobStreamDateRange(filter);
                }
                filter.timeZone = vm.userPreferences.zone;
                if ((filter.dateFrom && (typeof filter.dateFrom.getMonth === 'function' || typeof filter.dateFrom === 'object')) || (filter.dateTo && (typeof filter.dateTo.getMonth === 'function' || typeof filter.dateTo === 'object'))) {
                    filter.timeZone = 'UTC';
                }
                if ((filter.dateFrom && typeof filter.dateFrom.getMonth === 'function')) {
                    filter.dateFrom = moment(filter.dateFrom).tz(vm.userPreferences.zone)._d;
                }
                if ((filter.dateTo && typeof filter.dateTo.getMonth === 'function')) {
                    filter.dateTo = moment(filter.dateTo).tz(vm.userPreferences.zone)._d;
                }
                filter.compact = true;
                if (jobStreamSearch) {
                    vm.search(true);
                } else {
                    ConditionService.getSessions(filter).then(function (res) {
                        if (vm.jobStreamHistorys && vm.jobStreamHistorys.length > 0 && res.jobstreamSessions && res.jobstreamSessions.length > 0) {
                            vm.jobStreamHistorys = _.merge(vm.jobStreamHistorys, res.jobstreamSessions);
                        } else {
                            vm.jobStreamHistorys = res.jobstreamSessions;
                            setDuration(vm.jobStreamHistorys);
                        }
                        vm.isLoading = true;
                        isLoaded = true;
                    }, function () {
                        vm.isLoading = true;
                        isLoaded = true;
                    });
                }
            }
        }

        vm.$on('event-started', function () {
            if (vm.events && vm.events[0] && vm.events[0].eventSnapshots && vm.events[0].eventSnapshots.length > 0) {
                for (let i = 0; i <= vm.events[0].eventSnapshots.length - 1; i++) {
                    if (vm.events[0].eventSnapshots[i].eventType === 'ReportingChangedOrder' && isLoaded && vm.historyFilters.type === 'jobChain') {
                        isLoaded = false;
                        updateHistoryAfterEvent();
                        break;
                    } else if (vm.events[0].eventSnapshots[i].eventType === 'ReportingChangedJob' && isLoaded && vm.historyFilters.type === 'job') {
                        isLoaded = false;
                        updateHistoryAfterEvent();
                        break;
                    } else if ((vm.events[0].eventSnapshots[i].eventType === 'JobStreamStarted' || vm.events[0].eventSnapshots[i].eventType === 'JobStreamCompleted')
                        && isLoaded && vm.historyFilters.type === 'jobStream') {
                        isLoaded = false;
                        updateHistoryAfterEvent();
                        break;
                    } else if (vm.events[0].eventSnapshots[i].objectType === 'OTHER' && vm.historyFilters.type === 'yade') {
                        if (vm.events[0].eventSnapshots[i].eventType === 'YADETransferStarted') {
                            isLoaded = false;
                            updateHistoryAfterEvent();
                            break;
                        } else if (vm.events[0].eventSnapshots[i].eventType === 'YADETransferUpdated') {
                            for (let x = 0; x < vm.yadeHistorys.length; x++) {
                                if (vm.yadeHistorys[x].id === vm.events[0].eventSnapshots[i].path) {
                                    getTransfer(vm.yadeHistorys[x]);
                                    break;
                                }
                            }
                        } else if (vm.events[0].eventSnapshots[i].eventType === 'YADEFileStateChanged') {
                            for (let x = 0; x < vm.yadeHistorys.length; x++) {
                                if (vm.yadeHistorys[x].id === vm.events[0].eventSnapshots[i].path && vm.yadeHistorys[x].show) {
                                    getFiles(vm.yadeHistorys[x]);
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        });

        function setDuration(histories, temp) {
            angular.forEach(histories, function (history, index) {
                if (temp) {
                    for (let i = 0; i < temp.length; i++) {
                        if ((temp[i].historyId === history.historyId)) {
                            histories[index] = _.merge(temp[i], history)
                        }
                    }
                }
                if (history.startTime && history.endTime) {
                    histories[index].duration = new Date(history.endTime).getTime() - new Date(history.startTime).getTime();
                }else if (history.start && history.end) {
                    histories[index].duration = new Date(history.end).getTime() - new Date(history.start).getTime();
                }else if (history.started && history.ended) {
                    histories[index].duration = new Date(history.ended).getTime() - new Date(history.started).getTime();
                }else{
                    histories[index].duration = -1;
                }
            });
        }

        vm.$on('resetViewDate', function () {
            updateHistoryAfterEvent();
        });

        $scope.$on('$destroy', function () {
            watcher2();
            watcher6();
            watcher7();
            watcher8();
            watcher9();
            if (promise1) {
                $timeout.cancel(promise1);
            }
        });
    }

    LogCtrl.$inject = ["$scope", "$rootScope", "OrderService", "TaskService", "$location", "$timeout", "SOSAuth", "$q", "$interval", "$window", "UserService"];
    function LogCtrl($scope, $rootScope, OrderService, TaskService, $location, $timeout, SOSAuth, $q, $interval, $window, UserService) {
        var vm = $scope;
        vm.isLoading = false;
        vm.errStatus = '';
        vm.preferences = JSON.parse($window.sessionStorage.preferences);
        if (!vm.preferences.logFilter) {
            vm.preferences.logFilter = {
                scheduler: true,
                stdout: true,
                stderr: true,
                info: true,
                debug: false
            };
        }

        vm.object = {
            checkBoxs: vm.preferences.logFilter,
            debug: 'Debug'
        };
        vm.isDeBugLevel = false;
        vm.isStdErrLevel = false;
        vm.isDebugLevels = [false, false, false, false, false, false, false, false, false];
        vm.debugLevels = ['Debug', 'Debug2', 'Debug3', 'Debug4', 'Debug5', 'Debug6', 'Debug7', 'Debug8', 'Debug9'];

        function getParam(name) {
            var url = window.location.href;
            if (!url) url = location.href;
            name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
            let regexS = "[\\?&]" + name + "=([^&]*)";
            let regex = new RegExp(regexS);
            let results = regex.exec(url);
            return results == null ? null : decodeURIComponent(results[1].replace(/\+/g, ""));
        }

        var object = $location.search();
        var t1, canceller, logElems = [], interval;
        vm.loadOrderLog = function () {
            vm.jobChain = getParam("jobChain");
            let orders = {};
            orders.jobschedulerId = getParam("schedulerId");
            orders.jobChain = vm.jobChain;
            orders.orderId = vm.orderId;
            orders.historyId = getParam("historyId");
            canceller = $q.defer();
            OrderService.log(orders, {timeout: canceller.promise}).then(function (res) {
                renderData(res);
            }, function (err) {
                window.document.getElementById('logs').innerHTML = '';
                if (err.data && err.data.error) {
                    vm.error = err.data.error.message;
                } else if (err.data && err.data.message) {
                    vm.error = err.data.message;
                }
                vm.errStatus = err.status;
                vm.isLoading = true;
            });
        };

        vm.loadJobLog = function () {
            vm.job = getParam("job");
            var jobs = {};
            jobs.jobschedulerId = getParam("schedulerId");
            jobs.taskId = vm.taskId;
            canceller = $q.defer();
            TaskService.log(jobs, {timeout: canceller.promise}).then(function (res) {
                renderData(res);
            }, function (err) {
                window.document.getElementById('logs').innerHTML = '';
                if (err.data && err.data.error) {
                    vm.error = err.data.error.message;
                } else if (err.data && err.data.message) {
                    vm.error = err.data.message;
                }
                vm.errStatus = err.status;
                vm.isLoading = true;
            });
        };

        function init() {
            if (object && getParam("historyId")) {
                vm.orderId = getParam("orderId");
                vm.loadOrderLog();
            } else if (object && getParam("taskId")) {
                vm.taskId = getParam("taskId");
                vm.loadJobLog();
            } else {
                console.error('Invalid URL');
            }
        }

        init();
        function renderData(res) {
            vm.isLoading = true;
            if (res.data) {
                window.document.getElementById('logs').innerHTML = '';
                let lastLevel = '';
                res.data = ("\n" + res.data).replace(/\r?\n([^\r\n]+\[)(error|info\s?|warn\s?|debug\d?|trace|stdout|stderr)(\][^\r\n]*)/img, function (match, prefix, level, suffix, offset) {
                    level = level.trim();
                    if(level === 'INFO' || level === 'DEBUG'){
                        lastLevel = level;
                    }else if(level === 'WARN' || level === 'ERROR' || level === 'TRACE' || level === 'STDOUT' || level === 'STDERR'){
                        lastLevel = '';
                    }else if(lastLevel){
                        prefix = prefix + level+']';
                        level = lastLevel;
                    }
                    var div = window.document.createElement("div"); //Now create a div element and append it to a non-appended span.
                    level = (level) ? level.toLowerCase() : "info";
                    if (level === "trace") {
                        level = "debug9";
                    }
                    div.className = "log_" + level;
                    if (level === "info" && !vm.object.checkBoxs.info) {
                        div.className += " hide-block";
                    } else if (level === "stdout") {
                        div.className += " stdout";
                        if (!vm.object.checkBoxs.stdout) {
                            div.className += " hide-block";
                        }
                    } else if (level === "stderr") {
                        div.className += " stderr";
                        if (!vm.object.checkBoxs.stderr) {
                            div.className += " hide-block";
                        }
                    } else if (prefix.search(/\[stdout\]/i) > -1) {
                        div.className += " stdout stdout_" + level;
                        if (!vm.object.checkBoxs.stdout) {
                            div.className += " hide-block";
                        }
                    } else if (prefix.search(/\[stderr\]/i) > -1) {
                        div.className += " stderr stderr_" + level;
                        if (!vm.object.checkBoxs.stderr) {
                            div.className += " hide-block";
                        }
                    } else {
                        div.className += " scheduler scheduler_" + level;
                        if (!vm.object.checkBoxs.scheduler) {
                            div.className += " hide-block";
                        }
                    }

                    if (level.match("^debug") && !$scope.object.checkBoxs.debug) {
                        div.className += " hide-block";
                    }
                    div.textContent = match.replace(/^\r?\n/, "").replace(/&amp;/g, "&")
                        .replace(/&gt;/g, ">").replace(/&lt;/g, "<")
                        .replace(/&apos;/g, "'").replace(/&quot;/g, "\"");
                    if (!vm.isDeBugLevel) {
                        vm.isDeBugLevel = !!level.match("^debug");
                    }
                    if (vm.isDeBugLevel && level.match("^debug")) {
                        if (level === 'debug') {
                            vm.isDebugLevels[0] = true;
                        } else {
                            for (let x = 2; x < 10; x++) {
                                if (level == 'debug' + x) {
                                    vm.isDebugLevels[x - 1] = true;
                                    break;
                                }
                            }
                        }
                        if (!vm.object.checkBoxs.debug) {
                            div.className += " hide-block";
                        }
                    }
                    if (!vm.isStdErrLevel) {
                        vm.isStdErrLevel = div.className.indexOf('stderr') > -1;
                    }

                    let j = 0;
                    while (true) {
                        if (offset < (j + 1) * 1024 * 512) {
                            if (logElems.length == j) {
                                logElems.push(window.document.createElement("span"));
                            }
                            logElems[j].appendChild(div);
                            return "";
                        }
                        j++;
                    }
                    return "";
                });
                if (vm.isDeBugLevel) {
                    vm.debugLevels = [];
                    if (vm.isDebugLevels[0]) {
                        vm.debugLevels.push('Debug');
                    }
                    for (let x = 2; x < 10; x++) {
                        if (vm.isDebugLevels[x - 1]) {
                            vm.debugLevels.push('Debug' + x);
                        }
                    }
                }

                let firstLogs = logElems.shift(); //first MB of log
                if (firstLogs !== undefined) {
                    window.document.getElementById('logs').appendChild(firstLogs);
                }

                // now the scroll simulation. It loads the next MB for each 50ms.
                interval = $interval(function () {
                    let nextLogs = logElems.shift();
                    if (nextLogs !== undefined) {
                        window.document.getElementById('logs').appendChild(nextLogs);
                    } else {
                        vm.finished = true;
                        $interval.cancel(interval)
                    }
                }, 50);
                if (vm.userPreferences.theme !== 'light' && vm.userPreferences.theme !== 'lighter')
                    t1 = $timeout(function () {
                        $('.log_info').css('color', 'white')
                    }, 100);
            }
        }


        vm.cancel = function () {
            vm.isCancel = true;
            if (canceller) {
                canceller.resolve("user cancelled");
            }
            if (interval) {
                $interval.cancel(interval);
            }
        };

        vm.reload = function () {
            vm.isCancel = false;
            vm.finished = false;
            init();
        };

        vm.downloadLog = function () {
            vm.cancel();
            if (getParam("orderId")) {
                OrderService.info({
                    jobschedulerId: getParam("schedulerId"),
                    orderId: getParam("orderId"),
                    jobChain: getParam("jobChain"),
                    historyId: getParam("historyId")
                }).then(function (res) {
                    document.getElementById("tmpFrame").src = './api/order/log/download?orderId=' + getParam("orderId") + '&jobChain=' + getParam("jobChain") + '&historyId=' + getParam("historyId") + '&jobschedulerId=' + getParam("schedulerId") + '&filename=' + res.log.filename +
                        '&accessToken=' + SOSAuth.accessTokenId;
                });
            } else if (getParam("taskId")) {
                TaskService.info({
                    jobschedulerId: getParam("schedulerId"),
                    taskId: getParam("taskId")
                }).then(function (res) {
                    document.getElementById("tmpFrame").src = './api/task/log/download?taskId=' + getParam("taskId") + '&jobschedulerId=' + getParam("schedulerId") + '&filename=' + res.log.filename +
                        '&accessToken=' + SOSAuth.accessTokenId;
                });
            }
        };

        vm.sheetContent = '';
        vm.checkLogLevel = function (type) {
            vm.sheetContent = '';
            if (type === 'STDOUT') {
                if (!vm.object.checkBoxs.stdout) {
                    vm.sheetContent += "div.stdout {display: none;}\n";
                } else {
                    vm.sheetContent += "div.stdout {display: block;}\n";
                    vm.changeInfoLevel(type);
                    vm.changeDebugLevel(type, false);
                }
            } else if (type === 'STDERR') {
                if (!vm.object.checkBoxs.stderr) {
                    vm.sheetContent += "div.stderr {display: none;}\n";
                } else {
                    vm.sheetContent += "div.stderr {display: block;}\n";
                    vm.changeInfoLevel(type);
                    vm.changeDebugLevel(type, false);
                }
            } else if (type === 'SCHEDULER') {
                if (!vm.object.checkBoxs.scheduler) {
                    vm.sheetContent += "div.scheduler {display: none;}\n";
                } else {
                    vm.sheetContent += "div.scheduler {display: block;}\n";
                    vm.changeInfoLevel(type);
                    vm.changeDebugLevel(type, false);
                }
            } else if (type === 'INFO') {
                if (!vm.object.checkBoxs.info) {
                    vm.sheetContent += "div.log_info {display: none;}\n";
                    vm.sheetContent += "div.scheduler_info {display: none;}\n";
                    vm.sheetContent += "div.stdout_info {display: none;}\n";
                    vm.sheetContent += "div.stderr_info {display: none;}\n";
                } else {
                    vm.sheetContent += "div.log_info {display: block;}\n";
                    if (vm.object.checkBoxs.scheduler) {
                        vm.sheetContent += "div.scheduler_info {display: block;}\n";
                    }
                    if (vm.object.checkBoxs.stdout) {
                        vm.sheetContent += "div.stdout_info {display: block;}\n";
                    }
                    if (vm.object.checkBoxs.stderr) {
                        vm.sheetContent += "div.stderr_info {display: block;}\n";
                    }
                }
            } else if (type === 'DEBUG') {
                if (!vm.object.checkBoxs.debug) {
                    vm.changeDebugLevel('SCHEDULER', false);
                    vm.changeDebugLevel('STDOUT', false);
                    vm.changeDebugLevel('STDERR', false);
                } else {
                    vm.changeDebugLevel();
                    vm.sheetContent = '';
                }
            }
            if (vm.sheetContent != '') {
                let sheet = document.createElement('style');
                sheet.innerHTML = vm.sheetContent;
                document.body.appendChild(sheet);
            }
            vm.saveUserPreference();
        };

        vm.changeInfoLevel = function (type) {
            if (!vm.object.checkBoxs.info) {
                vm.sheetContent += "div." + type.toLowerCase() + "_info {display: none;}\n";
            }
        };

        vm.changeDebugLevel = function (type, setBlock) {
            if (type) {
                let num = vm.object.debug.substring(5);
                if (!num) {
                    num = 1;
                }
                if (vm.object.checkBoxs.debug) {
                    if (setBlock) {
                        for (let x = 1; x <= num; x++) {
                            let level = x === 1 ? '' : x;
                            vm.sheetContent += "div." + type.toLowerCase() + "_debug" + level + " {display: block;}\n";
                        }
                    }
                    if (num < 9) {
                        for (let x = num + 1; x < 10; x++) {
                            let level = x == 1 ? '' : x;
                            vm.sheetContent += "div." + type.toLowerCase() + "_debug" + level + " {display: none;}\n";
                        }
                    }
                } else {
                    for (let x = 1; x < 10; x++) {
                        let level = x === 1 ? '' : x;
                        vm.sheetContent += "div." + type.toLowerCase() + "_debug" + level + " {display: none;}\n";
                    }
                }
            } else {
                vm.sheetContent = '';
                if (vm.object.checkBoxs.scheduler) {
                    vm.changeDebugLevel('SCHEDULER', true);
                }
                if (vm.object.checkBoxs.stdout) {
                    vm.changeDebugLevel('STDOUT', true);
                }
                if (vm.object.checkBoxs.stderr) {
                    vm.changeDebugLevel('STDERR', true);
                }
                if (vm.sheetContent != '') {
                    let sheet = document.createElement('style');
                    sheet.innerHTML = vm.sheetContent;
                    document.body.appendChild(sheet);
                }
            }

        };

        /**
         * Save the user preference of log filter
         *
         */
        vm.saveUserPreference = function () {
            vm.preferences.logFilter = vm.object.checkBoxs;
            let configObj = {};
            configObj.jobschedulerId = vm.schedulerIds.selected;
            configObj.account = vm.permission.user;
            configObj.configurationType = "PROFILE";
            configObj.id = parseInt($window.sessionStorage.preferenceId);
            $window.sessionStorage.preferences = JSON.stringify(vm.preferences);
            $rootScope.$broadcast('reloadPreferences');
            configObj.configurationItem = JSON.stringify(vm.preferences);
            UserService.saveConfiguration(configObj);
        };

        $scope.$on('$destroy', function () {
            if (t1)
                $timeout.cancel(t1);
            if (interval)
                $interval.cancel(interval);
        });
    }
})();
