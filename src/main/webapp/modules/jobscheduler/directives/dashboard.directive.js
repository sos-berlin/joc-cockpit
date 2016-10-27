(function () {
    'use strict';
    angular.module('app')
        .directive('clusterStatusView', clusterStatusView)
        .directive('dailyPlanOverview', dailyPlanOverview);
    clusterStatusView.$inject = ["$compile", "$filter", "$sce","$rootScope"];
    function clusterStatusView($compile, $filter, $sce,$rootScope) {
        return {
            restrict: 'E',
            link: function (scope, elem, attrs) {
                var rWidth = 200;
                var rHeight = 130;
                var margin = 35;
                var vMargin = 70;
                var mLeft = 0;
                var top = 0;
                var supervisedMasters = [];
                init();
                function init() {
                    rWidth = 200;
                    rHeight = 130;
                    margin = 35;
                    vMargin = 70;
                    mLeft = 0;
                    top = 0;
                    scope.vMargin = vMargin;
                    supervisedMasters = [];
                }

                var mainTemplate = '<div class="text-center center-align" id="clusterStatusContainer" style="position: relative; height: 330px;width: 100%;overflow: auto;"> ';

                var template = mainTemplate;

                var tWidth = 0;

                function refresh(data) {
                    $("#clusterStatusContainer").remove();
                    template = mainTemplate;
                    if (data) {
                        init();
                        prepareData();
                    } else {
                        if (!scope.clusterStatusData) {
                            $("#clusterStatusContainer").remove();
                            template = mainTemplate;
                            template += '<div style="position: absolute;top: 50%;left: 40%;" class="_600 text-u-c" translate>message.noDataAvailable</div>';
                            template = template + '</div>';
                            template = $compile(template)(scope);
                            elem.append(template);
                        }
                    }
                }

                scope.$watch("clusterStatusData", function (data) {
                    refresh(data);
                })


                function prepareData() {


                    var supervisors = [];
                    if (!scope.clusterStatusData.supervisors) {
                        scope.clusterStatusData.supervisors = [];
                    }

                    if (!scope.clusterStatusData || !scope.clusterStatusData.members || !scope.clusterStatusData.members.masters) {
                        return;
                    }

                    scope.startToCheck();
                    angular.forEach(scope.clusterStatusData.members.masters, function (master, index) {

                        if (!master.supervisor && index == scope.clusterStatusData.members.masters.length - 1) {
                            removeSupervised();
                            return;
                        }
                        if (!master.supervisor) {
                            return;
                        }


                        supervisedMasters.push(index);


                        if (supervisors.indexOf(master.supervisor.jobschedulerId) >= 0) {
                            var nMaster = {};
                            scope.clusterStatusData.supervisors[supervisors.indexOf(master.supervisor.jobschedulerId)].masters.push(angular.copy(master, nMaster));
                        } else {
                            supervisors.push(master.supervisor.jobschedulerId);
                            var nSupervisor = master.supervisor;
                            nSupervisor.masters = [];
                            var nMaster = {};
                            nSupervisor.masters.push(angular.copy(master, nMaster));
                            scope.clusterStatusData.supervisors.push(nSupervisor);


                        }

                        if (index == scope.clusterStatusData.members.masters.length - 1) {
                            var cSupervisor = {};
                            //scope.clusterStatusData.supervisors[1]=angular.copy(scope.clusterStatusData.supervisors[0],cSupervisor);
                            removeSupervised();
                        }
                    })


                    function removeSupervised() {
                        if (scope.clusterStatusData.supervisors.length <= 0) {
                            getTemporaryData();

                        }
                        angular.forEach(supervisedMasters, function (master, index) {
                            scope.clusterStatusData.members.masters.splice(master - index, 1);
                            if (index == supervisedMasters.length - 1) {
                                getSupervisor();
                            }
                        })
                    }

                    scope.getSupervisor = getSupervisor;
                    function getSupervisor(refresh) {
                        if (scope.clusterStatusData.supervisors.length <= 0) {
                            getTemporaryData(refresh);
                        }
                        angular.forEach(scope.clusterStatusData.supervisors, function (supervisor, index) {
                            scope.getSupervisorDetails().then(function (res) {
                                scope.clusterStatusData.supervisors[index].data = res;
                                if (refresh) {
                                    refreshSupervisorState(supervisor);
                                }
                                if (index == scope.clusterStatusData.supervisors.length - 1) {
                                    getTemporaryData(refresh);


                                }

                            }, function (err) {

                            })

                        })
                    }


                    function getTemporaryData(refresh) {
                           //console.log("In get temporary data");
                        scope.onRefresh().then(function (res) {

                            if (scope.clusterStatusData.supervisors.length <= 0) {
                                getTemporaryData2(res, refresh);
                            }

                            angular.forEach(scope.clusterStatusData.supervisors, function (supervisor, sIndex) {
                                angular.forEach(supervisor.masters, function (master, index) {
                                    angular.forEach(res.masters, function (nMaster, rIndex) {
                                        if (nMaster.host == master.host && nMaster.port == master.port) {
                                            var span = document.getElementById('sp' + master.host + master.port);
                                            master.state = nMaster.state;
                                            

                                            if (master.state && refresh) {

                                                refreshMasterState(master);
                                            }

                                        }
                                        if (scope.clusterStatusData.supervisors.length - 1 == sIndex && supervisor.masters.length - 1 == index && res.masters.length - 1 == rIndex) {
                                            getTemporaryData2(res, refresh);

                                        }
                                    })
                                })
                            })

                        }, function (err) {
                             getTemporaryData2(undefined, refresh);
                                   console.log("Error in getting refresh");
                        })

                    }

                    function getTemporaryData2(res, refresh) {

                        if ((scope.clusterStatusData.members.masters.length == 0 && !refresh) || !res) {
                            drawFlow();
                        }

                        angular.forEach(scope.clusterStatusData.members.masters, function (master, index) {

                            angular.forEach(res.masters, function (nMaster, rIndex) {
                                if (nMaster.host == master.host && nMaster.port == master.port) {
                                    master.state = nMaster.state;
                                     
                                    if (master.state && refresh) {
                                        refreshMasterState(master);
                                    }
                                }
                                if (scope.clusterStatusData.members.masters.length - 1 == index && res.masters.length - 1 == rIndex && !refresh) {
                                    drawFlow();
                                }
                            })
                        })

                    }

                    scope.refreshMasterState = refreshMasterState;
                    function refreshMasterState(master) {


                        var span = document.getElementById('sp' + master.host + master.port);
                        if (master.state && span) {

                            var anchors = document.querySelectorAll("a[id^='__']");
                            angular.forEach(anchors, function (anchor, index) {

                                if (/__(.+)-(.+)-(.+):(\d+)/.test(anchor.id)) {
                                    var results = /__(.+)-(.+)-(.+):(\d+)/.exec(anchor.id);
                                    if (results[1] == 'master' && results[3] == master.host && results[4] == master.port) {
                                        if (master.state._text.toLowerCase() == 'stopped' || master.state._text.toLowerCase() == 'waiting_for_response') {
                                            var cls = master.state._text.toLowerCase() == 'stopped' ? " text-danger" : " text-warn";
                                            span.className = span.className.replace(/text-.+/, cls);
                                            anchor.className = anchor.className.replace('hide', 'show') + " disable-link";
                                            connectLink(master.host, master.port);
                                        } else if (master.state._text.toLowerCase() == 'waiting_for_activation') {
                                            span.className = span.className.replace(/text-.+/, " text-black-lt");
                                            anchor.className = anchor.className.replace('hide', 'show').replace('disable-link', '');
                                            connectLink(master.host, master.port);
                                        }
                                        else if (master.state._text.toLowerCase() == 'running') {
                                            span.className = span.className.replace(/text-.+/, "text-success");
                                            anchor.className = anchor.className.replace('hide', 'show').replace('disable-link', '');
                                            connectLink(master.host, master.port);
                                        } else if (master.state._text.toLowerCase() == 'paused') {
                                            span.className = span.className.replace(/text-.+/, " text-black-lt");
                                            if (results[2] == 'pause') {
                                                anchor.className = anchor.className.replace('show', 'hide');
                                            } else if (results[2] == 'continue') {
                                                anchor.className = anchor.className.replace('hide', 'show');
                                            }
                                            connectLink(master.host, master.port);

                                        } else if (master.state._text.toLowerCase() == 'unreachable') {
                                            disconnectLink(master.host, master.port);

                                        }


                                    }
                                }
                            })
                        }
                    }

                    scope.refreshSupervisorState = refreshSupervisorState;
                    function refreshSupervisorState(supervisor) {
                        if (supervisor.data.jobscheduler.state) {
                            var span = document.getElementById('sp' + supervisor.host + supervisor.port);
                            var anchors = document.querySelectorAll("a[id^='__']");

                            angular.forEach(anchors, function (anchor, index) {
                                if (/__(.+)-(.+)-(.+):(\d+)/.test(anchor.id)) {
                                    var results = /__(.+)-(.+)-(.+):(\d+)/.exec(anchor.id);
                                    if (results[1] == 'supervisor' && results[3] == supervisor.host && results[4] == supervisor.port) {
                                        if (supervisor.data.jobscheduler.state._text.toLowerCase() == 'stopped') {
                                            span.className = span.className.replace(/text-.+/, " text-danger");
                                            anchor.className = anchor.className.replace('hide', 'show') + " disable-link";
                                            connectLink(host, port);
                                        } else if (supervisor.data.jobscheduler.state._text.toLowerCase() == 'waiting_for_activation') {
                                            span.className = span.className.replace(/text-.+/, " text-black-lt");
                                            anchor.className = anchor.className.replace('hide', 'show').replace('disable-link', '');
                                            connectLink(supervisor.host, supervisor.port);
                                        }
                                        else if (supervisor.data.jobscheduler.state._text.toLowerCase() == 'running') {
                                            span.className = span.className.replace(/text-.+/, " text-success");
                                            anchor.className = anchor.className.replace('hide', 'show').replace('disable-link', '');
                                            connectLink(supervisor.host, supervisor.port);
                                        } else if (supervisor.data.jobscheduler.state._text.toLowerCase() == 'paused') {
                                            span.className = span.className.replace(/text-.+/, " text-black-lt");
                                            if (results[2] == 'pause') {
                                                anchor.className = anchor.className.replace('show', 'hide');
                                            } else if (results[2] == 'continue') {
                                                anchor.className = anchor.className.replace('hide', 'show');
                                            }
                                            connectLink(supervisor.host, supervisor.port);

                                        } else if (supervisor.data.jobscheduler.state._text.toLowerCase() == 'unreachable') {

                                            disconnectLink(supervisor.host, supervisor.port);
                                        }


                                    }
                                }
                            })
                        }
                    }

                    function disconnectLink(host, port) {

                        var links = document.querySelectorAll("div[id*='&&" + host + port + "']");

                        angular.forEach(links, function (link, index) {

                            link.style.setProperty('border', '1px solid #eb8814');
                        })
                    }

                    function connectLink(host, port) {

                        var links = document.querySelectorAll("div[id*='&&" + host + port + "']");

                        angular.forEach(links, function (link, index) {

                            link.style.setProperty('border', '1px solid #D9D9D9');
                        })
                    }


                    function drawFlow() {

                        var sLeft = 0;
                        top = vMargin;
                        if (scope.clusterStatusData.supervisors.length == 0) {
                            drawFlowForRemainings(true);

                        }
                        angular.forEach(scope.clusterStatusData.supervisors, function (supervisor, sIndex) {

                            tWidth = rWidth * supervisor.masters.length + margin * (supervisor.masters.length - 1);

                            sLeft = tWidth / 2 - rWidth / 2 + margin;
                            if (sIndex !== 0) {
                                sLeft = sLeft + tWidth + margin;
                            }

                            var c = "cluster-rect";
                            if (new Date().getTime() - new Date(supervisor.data.jobscheduler.surveyDate).getTime() < 2000) {

                                c = c + " yellow-border";
                            }
                            scope.popoverTemplate = $sce.trustAsHtml('Architecture : x' + supervisor.data.jobscheduler.os.architecture + '<br> Distribution : ' + supervisor.data.jobscheduler.os.distribution +
                                '<br>Started at : ' + $filter('date')(supervisor.data.jobscheduler.startedAt, 'dd-MMM-yy HH:mm:ss') + '<br> Survey Date: ' + $filter('date')(supervisor.data.jobscheduler.surveyDate, 'dd-MMM-yy HH:mm:ss'));


                            var sClassRunning = 'text-success';

                            if (supervisor.data.jobscheduler.state && supervisor.data.jobscheduler.state._text.toLowerCase() == 'stopped') {

                                sClassRunning = 'text-danger';
                            } else if (supervisor.data.jobscheduler.state && supervisor.data.jobscheduler.state._text.toLowerCase() != 'running') {

                                sClassRunning = 'text-black-lt';

                            }

                            var pauseClass = 'show';
                            var continueClass = 'hide';
                            var disableClass = '';
                            if (supervisor.data.jobscheduler.state && supervisor.data.jobscheduler.state._text.toLowerCase() == 'paused') {
                                pauseClass = 'hide';
                                continueClass = 'show';
                            } else if (supervisor.data.jobscheduler.state && supervisor.data.jobscheduler.state._text.toLowerCase() == 'stopped') {
                                disableClass = 'disable-link';
                            }

                            template = template +

                                ' <div class="cluster-rect" uib-popover-html="popoverTemplate" popover-placement="right" popover-trigger="mouseenter" ' +
                                'style="left:' + sLeft + 'px;top:' + 10 + 'px" id="' + supervisor.host + supervisor.port + '">' +
                                '<span id="' + 'sp' + supervisor.host + supervisor.port + '"  class="m-t-n-xxs fa fa-stop success-node ' + sClassRunning + '" ></span>' +
                                '<div class="font14  text-left  p-t-sm p-l-sm "><span>' + supervisor.jobschedulerId +
                                '</span> <div class="btn-group dropdown pull-right" >' +
                                '<a href class=" more-option text-muted" data-toggle="dropdown" ><i class="text fa fa-ellipsis-v"></i></a>' +
                                '<div class="dropdown-menu dropdown-ac dropdown-more">' +
                                '<a  class="dropdown-item bg-hover-color ' + disableClass + '" id="' + '__supervisor-terminate-' + supervisor.host + ':' + supervisor.port + '" translate>button.terminate</a>' +
                                '<a class="dropdown-item ' + disableClass + '" id="' + '__supervisor-restart-' + supervisor.host + ':' + supervisor.port + '" translate>button.restart</a>' +
                                '<a class="dropdown-item ' + disableClass + '" id="' + '__supervisor-abortAndRestart-' + supervisor.host + ':' + supervisor.port + '" translate>button.abortAndRestart</a>' +
                                '<a class="dropdown-item ' + disableClass + '" id="' + '__supervisor-terminateAndRestart-' + supervisor.host + ':' + supervisor.port + '" translate>button.terminateAndRestart</a>' +
                                '<a class="dropdown-item ' + disableClass + '" id="' + '__supervisor-terminateAndRestartWithin-' + supervisor.host + ':' + supervisor.port + '" translate>button.terminateAndRestartWithin</a>' +
                                '<a class="dropdown-item ' + pauseClass + ' ' + disableClass + '" id="' + '__supervisor-pause-' + supervisor.host + ':' + supervisor.port + '" translate>button.pause</a>' +
                                '<a class="dropdown-item ' + continueClass + ' ' + disableClass + '" id="' + '__supervisor-continue-' + supervisor.host + ':' + supervisor.port + '" translate>button.continue</a>' +
                                '</div>' +
                                '</div></div>' +

                                '<div class="font14  text-left p-t-xs p-l-sm "><i class="fa fa-' + supervisor.data.jobscheduler.os.name + '">' + '</i><span class="p-l-sm">' + supervisor.data.jobscheduler.version +
                                '</span></div>' +
                                '<div class="font14  text-left text-muted p-t-xs p-l-sm "><span>' + supervisor.host + ':' + supervisor.port +
                                '</span></div>' +
                                '</div> ';

                            var masterTemplate = '';
                            angular.forEach(supervisor.masters, function (master, index) {
                                mLeft = mLeft + margin;
                                if (sIndex !== 0 || index > 0) {
                                    mLeft = mLeft + rWidth;
                                }

                                var name = 'JobScheduler ';

                                top = rHeight + vMargin;
                                if (supervisor.masters.length - 1 == index) {
                                    c = "cluster-rect ";
                                }


                                if (new Date().getTime() - new Date(master.surveyDate).getTime() < 2000) {

                                    c = c + " yellow-border";
                                }
                                var classRunning = 'text-success';
                                // var classRunning = 'text-black-lt';
                                var disableClass = '';



                                if (master.state && master.state._text.toLowerCase() == 'stopped') {
                                    classRunning = 'text-danger';

                                } else if (master.state && master.state._text.toLowerCase() != 'running') {
                                    classRunning = 'text-black-lt';

                                }

                                if (master.state && master.state._text.toLowerCase() == 'stopped') {
                                    disableClass = 'disable-link';
                                }


                                scope.popoverTemplate = $sce.trustAsHtml('Architecture : x' + master.os.architecture + '<br> Distribution : ' + master.os.distribution +
                                    '<br>Started at : ' + $filter('date')(master.startedAt, 'dd-MMM-yy HH:mm:ss') + '<br> Survey Date: ' + $filter('date')(master.surveyDate, 'dd-MMM-yy HH:mm:ss'));
                                var pauseClass = 'show';
                                var continueClass = 'hide';
                                if (master.state && master.state._text.toLowerCase() == 'paused') {
                                    pauseClass = 'hide';
                                    continueClass = 'show';
                                }

                                var precedence = '';
                                if (master.clusterType.type == 'passive' && master.clusterType.precedence == 0) {
                                    precedence = 'Primary';
                                    name = 'JobScheduler JS' + master.clusterType.precedence;
                                } else if (master.clusterType.type == 'passive' && master.clusterType.precedence == 1) {
                                    precedence = 'Backup';
                                    name = 'JobScheduler JS' + master.clusterType.precedence;
                                }

                                masterTemplate = '<div  uib-popover-html="popoverTemplate" popover-placement="right" popover-trigger="mouseenter" ' +

                                    'style="left:' + mLeft + 'px;top:' + top + 'px" id="' + master.host + master.port + '" class="' + c + '"   >' +
                                    '<span id="' + 'sp' + master.host + master.port + '" class="m-t-n-xxs fa fa-stop success-node ' + classRunning + '"></span>' +
                                    '<div class="font14  text-left  p-t-sm p-l-sm ">' +
                                    '<span>' + name +
                                    '</span>' + '<div class="btn-group dropdown pull-right" >' +
                                    '<a href class=" more-option text-muted" data-toggle="dropdown" ><i class="text fa fa-ellipsis-v"></i></a>' +
                                    '<div class="dropdown-menu dropdown-ac dropdown-more">' +
                                    '<a class="dropdown-item bg-hover-color ' + disableClass + '" id="' + '__master-terminate-' + master.host + ':' + master.port + '" translate>button.terminate</a>' +
                                    '<a class="dropdown-item ' + disableClass + '" id="' + '__master-restart-' + master.host + ':' + master.port + '" translate>button.restart</a>' +
                                    '<a class="dropdown-item ' + disableClass + '" id="' + '__master-abortAndRestart-' + master.host + ':' + master.port + '" translate>button.abortAndRestart</a>' +
                                    '<a class="dropdown-item ' + disableClass + '" id="' + '__master-terminateAndRestart-' + master.host + ':' + master.port + '" translate>button.terminateAndRestart</a>' +
                                    '<a class="dropdown-item ' + disableClass + '" id="' + '__master-terminateAndRestartWithin-' + master.host + ':' + master.port + '" translate>button.terminateAndRestartWithin</a>' +
                                    '<a class="dropdown-item ' + pauseClass + ' ' + disableClass + '" id="' + '__master-pause-' + master.host + ':' + master.port + '" translate>button.pause</a>' +
                                    '<a class="dropdown-item ' + continueClass + ' ' + disableClass + '" id="' + '__master-continue-' + master.host + ':' + master.port + '" translate>button.continue</a>' +
                                    '</div>' +
                                    '</div> </div>' +
                                    '<div class="font14  text-left p-t-xs p-l-sm "><i class="fa fa-' + master.os.name + '"></i><span class="p-l-sm">' + master.version +
                                    '</span></div><div class="font14  text-left p-t-xs p-l-sm">' + master.host + ':' + master.port + '(' + precedence + ')' + '</div>' +

                                    '</div>';

                                if (index == 0) {
                                    template = template + '<div   id="masterContainer">' + masterTemplate;
                                } else if (supervisor.masters.length - 1 == index) {
                                    template = template + masterTemplate + '</div>';
                                } else {
                                    template = template + masterTemplate;
                                }


                                if (scope.clusterStatusData.supervisors.length - 1 == sIndex && supervisor.masters.length - 1 == index) {


                                    if (scope.clusterStatusData.members.masters.length > 0) {
                                        drawFlowForRemainings(false);
                                    } else if (scope.clusterStatusData.database) {
                                        drawFlowForDatabase();
                                    } else {
                                        template = template + '</div>';
                                        template = $compile(template)(scope);
                                        elem.append(template);

                                    }

                                }


                            })
                        })
                    }

                    function drawFlowForRemainings(zeroSupervisor) {

                        angular.forEach(scope.clusterStatusData.members.masters, function (master, index) {
                            if(master){
                            var c = "cluster-rect";
                            if (zeroSupervisor && index == 0) {
                                mLeft = mLeft + margin;
                            } else {
                                mLeft = mLeft + margin + rWidth;
                            }

                            if (scope.clusterStatusData.members.masters - 1 == index) {
                                c = "cluster-rect";
                            }
                            if (new Date().getTime() - new Date(master.surveyDate).getTime() < 2000) {

                                c = c + " yellow-border";
                            }
                            var name = '';
                            if (master.clusterType && master.clusterType.type == 'passive') {
                                if (master.state && master.state._text.toLowerCase() == 'running') {
                                    name = 'JobScheduler JS' + (master.clusterType.precedence + 1);
                                } else {
                                    name = 'JobScheduler JS' + (master.clusterType.precedence + 1);
                                }

                            } else if (master.clusterType && master.clusterType.type == 'active') {
                                name = 'JobScheduler JS' + (index + 1);

                            }

                            var classRunning = 'text-success';
                            if (master.state && master.state._text.toLowerCase() == 'stopped') {
                                classRunning = 'text-danger';
                            } else if (master.state && master.state._text.toLowerCase() != 'running') {
                                classRunning = 'text-black-lt';
                            }

                            var pauseClass = 'show';
                            var continueClass = 'hide';
                            var disableClass = '';
                            if (master.state._text.toLowerCase() == 'paused') {
                                pauseClass = 'hide';
                                continueClass = 'show';
                            }
                            if (master.state._text.toLowerCase() == 'stopped') {
                                disableClass = 'disable-link';
                            }

                            scope.popoverTemplate = $sce.trustAsHtml('Architecture : x' + master.os.architecture + '<br> Distribution : ' + master.os.distribution +
                                '<br>Started at : ' + $filter('date')(master.startedAt, 'dd-MMM-yy HH:mm:ss') + '<br> Survey Date: ' + $filter('date')(master.surveyDate, 'dd-MMM-yy HH:mm:ss'));
                            var masterTemplate = '<div uib-popover-html="popoverTemplate" popover-placement="right" popover-trigger="mouseenter"' +
                                'style="left:' + mLeft + 'px;top:' + top + 'px" id="' + master.host + master.port + '" class="' + c + '"   >' +
                                '<span id="' + 'sp' + master.host + master.port + '" class="m-t-n-xxs fa fa-stop success-node ' + classRunning + '" ></span>' +
                                '<div class="font14  text-left  p-t-sm p-l-sm "><span>' + name + '<div class="btn-group dropdown pull-right" >' +
                                '<a href class=" more-option text-muted" data-toggle="dropdown" ><i class="text fa fa-ellipsis-v"></i></a>' +
                                '<div class="dropdown-menu dropdown-ac dropdown-more">' +
                                '<a class="dropdown-item bg-hover-color ' + disableClass + '" id="' + '__master-terminate-' + master.host + ':' + master.port + '" translate>button.terminate</a>' +
                                '<a class="dropdown-item ' + disableClass + '" id="' + '__master-restart-' + master.host + ':' + master.port + '" translate>button.restart</a>' +
                                '<a class="dropdown-item ' + disableClass + '" id="' + '__master-abortAndRestart-' + master.host + ':' + master.port + '" translate>button.abortAndRestart</a>' +
                                '<a class="dropdown-item ' + disableClass + '" id="' + '__master-terminateAndRestart-' + master.host + ':' + master.port + '" translate>button.terminateAndRestart</a>' +
                                '<a class="dropdown-item ' + disableClass + '" id="' + '__master-terminateAndRestartWithin-' + master.host + ':' + master.port + '" translate>button.terminateAndRestartWithin</a>' +
                                '<a class="dropdown-item ' + pauseClass + ' ' + disableClass + '" id="' + '__master-pause-' + master.host + ':' + master.port + '" translate>button.pause</a>' +
                                '<a class="dropdown-item ' + continueClass + ' ' + disableClass + '" id="' + '__master-continue-' + master.host + ':' + master.port + '" translate>button.continue</a>' +
                                '</div></div>' +
                                '</span></div>' +
                                '<div class="font14  text-left p-t-xs p-l-sm "><i class="fa fa-' + master.os.name + '"></i><span class="p-l-sm">' + master.version +
                                '</span></div><div class="font14  text-left p-t-xs p-l-sm ">' + master.host + ':' + master.port + '</div>' +

                                '</div>';

                            if (index == 0) {
                                template = template + '<div   id="masterContainer">' + masterTemplate;
                            }
                            else {
                                template = template + masterTemplate;
                            }

                            if (scope.clusterStatusData.members.masters.length - 1 == index) {
                                if (scope.clusterStatusData.database) {
                                    drawFlowForDatabase();
                                } else {
                                    template = template + masterTemplate + '</div></div>';
                                    template = $compile(template)(scope);
                                    elem.append(template);
                                }

                            }

                        }
                        })
                    }

                    function drawFlowForDatabase() {
                        var c = "cluster-rect";
                        mLeft = mLeft + margin + rWidth;
                        top = top - rHeight / 2;

                        if (new Date().getTime() - new Date(scope.clusterStatusData.database.surveyDate).getTime() < 2000) {

                            c = c + " yellow-border";
                        }


                        var classRunning = 'text-success';
                        if (scope.clusterStatusData.database.database.state && scope.clusterStatusData.database.database.state._text.toLowerCase() == 'stopped') {
                            classRunning = 'text-danger';
                        } else if (scope.clusterStatusData.database.database.state && scope.clusterStatusData.database.database.state._text.toLowerCase() == 'running') {
                            classRunning = 'text-black-lt';
                        }
                        scope.popoverTemplate1 = $sce.trustAsHtml(' Last Refreshed Date : ' + $filter('date')(scope.clusterStatusData.database.deliveryDate, 'dd-MMM-yy HH:mm:ss'));

                        var masterTemplate = '<div uib-popover-html="popoverTemplate1" popover-placement="left" popover-trigger="mouseenter" ' +

                            'style="left:' + mLeft + 'px;top:' + top + 'px" id="' + 'database' + '" class="' + c + '"   >' +
                            '<span class="m-t-n-xxs fa fa-stop text-success success-node"></span>' +
                            '<div class="font14  text-left  p-t-sm p-l-sm "><span>Database ' + scope.clusterStatusData.database.database.dbms +
                            '</span></div>' +
                            '<div class="font14  text-left p-t-sm p-l-sm ">' +
                            '<span >' + scope.clusterStatusData.database.database.version +
                            '</span></div>' +

                            '</div>';


                        template = template + '<div   id="masterContainer">' + masterTemplate + '</div></div>';
                        template = $compile(template)(scope);
                        elem.append(template);


                    }


                }
            },
            scope: {
                clusterStatusData: '=',
                getSupervisorDetails: '&',
                onRefresh: '&',
                onOperation: '&'

            },
            controller: ["$scope", "$interval", "$timeout", function ($scope, $interval, $timeout) {
                var vm = $scope;
                var promise;


                vm.startToCheck = startToCheck;
                function startToCheck() {
                    promise = $interval(function () {
                        drawConnections();
                    }, 200);
                }

                vm.drawConnections = drawConnections;
                function drawConnections() {
                    var dLLeft = 0;
                    var dLTop = 0;
                    var dTop = 0;
                    var dLeft = 0;
                    var sWidth = 0;
                    var clusterStatusContainer = document.getElementById('masterContainer');
                    if (vm.clusterStatusData.supervisors.length <= 0) {
                        drawForRemainings();
                    }


                    var anchors = document.querySelectorAll("a[id^='__']");
                    angular.forEach(anchors, function (anchor, index) {
                        anchor.addEventListener('click', function () {

                            if (/__(.+)-(.+)-(.+):(\d+)/.test(anchor.id)) {
                                var results = /__(.+)-(.+)-(.+):(\d+)/.exec(anchor.id);
                                vm.onOperation({
                                    item: results[1],
                                    action: results[2],
                                    host: results[3],
                                    port: results[4]
                                });

                                changeToWaiting(results[3], results[4]);


                            }


                        })
                    })

                    function changeToWaiting(host, port) {
                        angular.forEach(vm.clusterStatusData.supervisors, function (supervisor, sIndex) {
                            if (supervisor.host == host && supervisor.port == port) {
                                supervisor.data.jobscheduler.state._text = 'waiting_for_response';
                                vm.refreshSupervisorState(supervisor);
                            }
                            angular.forEach(supervisor.masters, function (master, index) {
                                if (master.host == host && master.port == port) {
                                    master.state._text = 'waiting_for_response';
                                    vm.refreshMasterState(master);
                                }
                            })
                        })

                        angular.forEach(vm.clusterStatusData.members.masters, function (master, index) {
                            if (master.host == host && master.port == port) {
                                master.state._text = 'waiting_for_response';
                                vm.refreshMasterState(master);
                            }
                        })
                    }

                    angular.forEach(vm.clusterStatusData.supervisors, function (supervisor, sIndex) {
                        var clusterStatusContainer = document.getElementById('clusterStatusContainer');


                        var supervisorRect = document.getElementById(supervisor.host + supervisor.port);
                        if (!supervisorRect) {
                            return;
                        }

                        $interval.cancel(promise);


                        var sLeft = supervisorRect.offsetLeft;
                        var sTop = supervisorRect.offsetTop;
                        var sWidth = supervisorRect.clientWidth;
                        var sHeight = supervisorRect.clientHeight;

                        var masterCtMargin = $('#masterContainer').css("margin-top");
                        var databaseRect = document.getElementById('database');
                        dTop = databaseRect.offsetTop;
                        dLeft = databaseRect.offsetLeft;

                        angular.forEach(supervisor.masters, function (master, index) {
                            var masterRect = document.getElementById(master.host + master.port);

                            var vMargin = vm.vMargin;


                            var mLeft = masterRect.offsetLeft;
                            var mTop = masterRect.offsetTop;
                            var offset = 20;

                            var width = sLeft - mLeft + offset;
                            var top = sTop + (sHeight / 2);
                            var left = mLeft - offset;
                            var mHeight = masterRect.clientHeight;
                            var height = (mTop + mHeight / 2) - (sTop + sHeight / 2);

                            if (sLeft < mLeft) {
                                left = sLeft + sWidth;
                                width = mLeft - sLeft + offset;
                            }


                            var node = document.createElement('div');
                            dLLeft = mLeft + sWidth / 2;
                            if (index != 0) {
                                dLTop = dLTop - 10;
                            } else {
                                dLTop = dTop + databaseRect.clientHeight / 2;
                            }

                            if (dLTop < dTop) {


                                databaseRect.style.setProperty('height', databaseRect.offsetHeight + 10 + 'px');
                                databaseRect.style.setProperty('top', databaseRect.offsetTop - 10 + 'px');
                            }

                            node.setAttribute('class', 'h-line');
                            node.setAttribute('id', '&&' + master.host + master.port + '&&database01');
                            node.style.setProperty('top', dLTop + 'px');
                            node.style.setProperty('left', dLLeft + 'px');
                            node.style.setProperty('width', dLeft - mLeft - sWidth / 2 + 'px');
                            node.style.setProperty('border', '1px dashed #D9D9D9');
                            clusterStatusContainer.appendChild(node);

                            var node = document.createElement('div');
                            node.setAttribute('id', '&&' + master.host + master.port + '&&database02');
                            node.setAttribute('class', 'h-line ');
                            node.style.setProperty('top', dLTop + 'px');
                            node.style.setProperty('left', dLLeft + 'px');
                            node.style.setProperty('width', '1px');
                            node.style.setProperty('height', mTop - dLTop + 'px');
                            node.style.setProperty('border', '1px dashed #D9D9D9');
                            clusterStatusContainer.appendChild(node);

                            var lNoConnection = '#D9D9D9';

                            if (supervisor.data.jobscheduler.state && supervisor.data.jobscheduler.state._text.toLowerCase() == 'unreachable') {
                                lNoConnection = '#eb8814';


                            }
                            var node = document.createElement('div');
                            node.setAttribute('id', '&&' + supervisor.host + supervisor.port + '&&' + master.host + master.port + '01');
                            node.setAttribute('class', 'h-line');
                            node.style.setProperty('top', top + 'px');
                            node.style.setProperty('left', left + 'px');
                            node.style.setProperty('width', width + 'px');
                            node.style.setProperty('border', '1px solid ' + lNoConnection);
                            clusterStatusContainer.appendChild(node);
                            if (sLeft < mLeft) {
                                left = left + width;
                            }
                            var node = document.createElement('div');
                            node.setAttribute('id', '&&' + supervisor.host + supervisor.port + '&&' + master.host + master.port + '02');
                            node.setAttribute('class', 'h-line');
                            node.style.setProperty('top', top + 'px');
                            node.style.setProperty('left', left + 'px');
                            node.style.setProperty('width', 1 + 'px');
                            node.style.setProperty('height', height + 'px');
                            node.style.setProperty('border', '1px solid ' + lNoConnection);
                            clusterStatusContainer.appendChild(node);
                            if (sLeft < mLeft) {
                                left = left - offset;
                            }
                            var node = document.createElement('div');
                            node.setAttribute('id', '&&' + supervisor.host + supervisor.port + '&&' + master.host + master.port + '03');
                            node.setAttribute('class', 'h-line');
                            node.style.setProperty('top', top + height + 'px');
                            node.style.setProperty('left', left + 'px');
                            node.style.setProperty('width', 1 + 'px');
                            node.style.setProperty('width', offset + 'px');
                            node.style.setProperty('border', '1px solid ' + lNoConnection);
                            clusterStatusContainer.appendChild(node);

                            if (index == supervisor.masters.length - 1) {
                                drawForRemainings();
                            }
                        })
                    })

                    function drawForRemainings() {

                        if (!vm.clusterStatusData.members) {
                            return;
                        }

                        angular.forEach(vm.clusterStatusData.members.masters, function (master, index) {
                            var masterRect = document.getElementById(master.host + master.port);
                            if (masterRect) {
                                $interval.cancel(promise);
                            }
                            var vMargin = vm.vMargin;


                            var mLeft = masterRect.offsetLeft;
                            var mTop = masterRect.offsetTop;

                            var databaseRect = document.getElementById('database');
                            if (!databaseRect) {
                                return;
                            }
                            dTop = databaseRect.offsetTop;
                            dLeft = databaseRect.offsetLeft;
                            var offset = 20;
                            sWidth = masterRect.offsetWidth;
                            dLLeft = mLeft + sWidth / 2;
                            if (dLTop == 0) {
                                dLTop = mTop - vMargin / 2;
                                dLLeft = mLeft + sWidth / 2;

                            } else {
                                dLTop = dLTop - 10;
                            }


                            var node = document.createElement('div');
                            node.setAttribute('id', '&&' + master.host + master.port + '&&database01');
                            node.setAttribute('class', 'h-line');

                            node.style.setProperty('top', dLTop + 'px');
                            node.style.setProperty('left', dLLeft + 'px');
                            node.style.setProperty('height', '1px');
                            node.style.setProperty('width', dLeft - mLeft - sWidth / 2 + 'px');
                            node.style.setProperty('border', '1px dashed #D9D9D9');
                            clusterStatusContainer.appendChild(node);

                            var node = document.createElement('div');
                            node.setAttribute('id', '&&' + master.host + master.port + '&&database02');
                            node.setAttribute('class', 'h-line');
                            node.style.setProperty('top', dLTop + 'px');
                            node.style.setProperty('left', dLLeft + 'px');
                            node.style.setProperty('width', '1px');
                            node.style.setProperty('height', mTop - dLTop + 'px');
                            node.style.setProperty('border', '1px dashed #D9D9D9');
                            clusterStatusContainer.appendChild(node);

                        })
                    }

                    vm.action = function (item, action, object) {

                        vm.onOperation({item: item, action: action, object: object});

                    }


                }

                startPolling();
                function startPolling() {

                    if ($rootScope.config.jobSchedulerMasterClusterStatus.polling) {
                        poll();
                    }

                }

                var interval;

                function poll() {

                    interval = $interval(function () {
                        if (vm.getSupervisor) {
                            vm.getSupervisor(true);
                        }
                    }, $rootScope.config.jobSchedulerMasterClusterStatus.interval * 1000);

                }

                vm.$on("$destroy", function () {
                    $interval.cancel(interval);

                });

            }]
        }
    }
    dailyPlanOverview.$inject = [];
    function dailyPlanOverview () {
        return {
            restrict: 'E',
            scope: {
                waiting: '=',
                late: '=',
                lateSuccess: '=',
                lateError: '=',
                executed: '=',
                error: '=',
                total: '='
            },
            template: '<div class="plan-overview bg-dimgrey" style="width: {{waiting}}%">\n'
                +'<label class="hide text-white" ng-class="{\'show\': waiting > 0}" uib-tooltip="{{waiting*total/100 | number:0}} out of {{total}}"><span class="text-muted" translate>label.waitingOrders</span> - {{waiting |number:0}}</label></div>'
                +'<div class="plan-overview bg-gold" style="width: {{late}}%">\n'
                +'<label class="hide plan-status" ng-class="{\'show\': late > 0}" uib-tooltip="{{late*total/100 | number:0}} out of {{total}}"><span class="text-muted" translate>label.lateOrders</span> - {{late |number:0}}</label></div>'
                +'<div class="plan-overview bg-green" style="width: {{lateSuccess}}%">\n'
                +'<label class="hide plan-status" ng-class="{\'show\': lateSuccess > 0}" uib-tooltip="{{lateSuccess*total/100 | number:0}} out of {{total}}"><span class="text-muted" translate>label.lateOrdersSuccess</span> - {{lateSuccess |number:0}}</label></div>'
                +'<div class="plan-overview bg-crimson" style="width: {{lateError}}%">\n'
                +'<label class="hide text-white" ng-class="{\'show\': lateError > 0}" uib-tooltip="{{lateError*total/100 | number:0}} out of {{total}}"><span class="text-muted" translate>label.lateOrdersError</span> - {{lateError |number:0}}</label></div>'
                +'<div class="plan-overview bg-green" style="width: {{executed}}%">\n'
                +'<label class="hide plan-status" ng-class="{\'show\': executed > 0}" uib-tooltip="{{executed*total/100 | number:0}} out of {{total}}"><span class="text-muted" translate>label.successOrders</span> - {{executed |number:0}}</label></div>'
                +'<div class="plan-overview bg-crimson" style="width: {{error}}%">\n'
                +'<label class="hide text-white" ng-class="{\'show\': error > 0}" uib-tooltip="{{error*total/100 | number:0}} out of {{total}}"><span class="text-muted" translate>label.errorOrders</span> - {{error |number:0}}</label></div>'
        }
    }
})();
