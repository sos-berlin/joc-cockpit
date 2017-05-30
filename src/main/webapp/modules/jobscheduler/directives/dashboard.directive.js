(function () {
    'use strict';
    angular.module('app')
        .directive('clusterStatusView', clusterStatusView)
        .directive('dailyPlanOverview', dailyPlanOverview);


    clusterStatusView.$inject = ["$compile", "$sce", "$window", "$rootScope","gettextCatalog"];
    function clusterStatusView($compile, $sce, $window, $rootScope,gettextCatalog) {

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
                var lastId;

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

                init();

                var mainTemplate = '<div class="text-center" id="clusterStatusContainer" style="position: relative; height: 337px;width: 100%;overflow: auto;"> ';

                var template = mainTemplate;

                var tWidth = 0;

                function refresh() {
                    $("#clusterStatusContainer").remove();
                    template = mainTemplate;
                    if (scope.clusterStatusData) {
                        init();
                        prepareData();
                    } else {
                        $("#clusterStatusContainer").remove();
                        template = mainTemplate;
                        template += '<div style="position: absolute;top: 50%;left: 40%;" class="h6 text-u-c" translate>message.noDataAvailable</div>';
                        template = template + '</div>';
                        template = $compile(template)(scope);
                        elem.append(template);

                    }
                }

                scope.$on("clusterStatusDataChanged", function () {
                    refresh();

                });


                function prepareData() {
                    var supervisors = [];
                    scope.clusterStatusData.supervisors = scope.clusterStatusData.supervisors || [];

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
                        var nMaster = {};
                        if (supervisors.indexOf(master.supervisor.jobschedulerId) >= 0) {

                            scope.clusterStatusData.supervisors[supervisors.indexOf(master.supervisor.jobschedulerId)].masters.push(angular.copy(master, nMaster));
                        } else {
                            supervisors.push(master.supervisor.jobschedulerId);
                            var nSupervisor = master.supervisor;
                            nSupervisor.masters = [];
                            nSupervisor.masters.push(angular.copy(master, nMaster));
                            scope.clusterStatusData.supervisors.push(nSupervisor);
                        }

                        if (index == scope.clusterStatusData.members.masters.length - 1) {
                            var cSupervisor = {};
                            //scope.clusterStatusData.supervisors[1]=angular.copy(scope.clusterStatusData.supervisors[0],cSupervisor);
                            removeSupervised();
                        }
                    });


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
                        scope.onRefresh().then(function (res) {
                            if (scope.clusterStatusData.supervisors.length <= 0) {
                                getTemporaryData2(res, refresh);
                            }

                            angular.forEach(scope.clusterStatusData.supervisors, function (supervisor, sIndex) {
                                angular.forEach(supervisor.masters, function (master, index) {
                                    angular.forEach(res.masters, function (nMaster, rIndex) {
                                        if (nMaster.host == master.host && nMaster.port == master.port) {

                                            supervisor.masters[index].state = nMaster.state;
                                            supervisor.masters[index].startedAt = nMaster.startedAt;
                                            if (master.state && refresh) {
                                                refreshMasterState(master);
                                            }
                                        }
                                        if (scope.clusterStatusData.supervisors.length - 1 == sIndex && supervisor.masters.length - 1 == index && res.masters.length - 1 == rIndex) {
                                            getTemporaryData2(res, refresh);
                                        }
                                    })
                                })
                                $rootScope.$broadcast('reloadScheduleDetail', supervisor);
                            })


                        }, function (err) {
                            getTemporaryData2(undefined, refresh);
                        })

                    }

                    function getTemporaryData2(res, refresh) {
                        if ((scope.clusterStatusData.members.masters.length == 0 && !refresh) || !res) {
                            drawFlow();
                        }

                        if (res)
                            angular.forEach(scope.clusterStatusData.members.masters, function (master, index) {

                                angular.forEach(res.masters, function (nMaster, rIndex) {
                                    if (nMaster.host == master.host && nMaster.port == master.port) {
                                        scope.clusterStatusData.members.masters[index].state = nMaster.state;
                                        scope.clusterStatusData.members.masters[index].startedAt = nMaster.startedAt;
                                        if (master.state && refresh) {
                                            refreshMasterState(master);
                                        }
                                    }
                                    if (scope.clusterStatusData.members.masters.length - 1 == index && res.masters.length - 1 == rIndex && !refresh) {
                                        drawFlow();
                                    }
                                })

                                if (refresh && (refresh.state == 'stopping' || refresh.state == 'starting') && res.masters.length == 0) {
                                    if (master.state._text !== ' ') {
                                        master.state._text = refresh.state;
                                        refreshMasterState(master);
                                    }

                                }
                            })
                        $rootScope.$broadcast('reloadScheduleDetail', scope.clusterStatusData.members);

                    }

                    scope.refreshMasterState = refreshMasterState;
                    function refreshMasterState(master) {

                        var span = document.getElementById('sp' + master.host + master.port);
                        var dState = document.getElementById('state' + master.host + master.port);
                        if (dState) {
                            dState.innerHTML = master.state._text;
                        }
                        if (master.state && span) {

                            var rect = document.getElementById(master.host + master.port);
                           var popoverTemplate = gettextCatalog.getString('label.architecture')+': - <br>'+ gettextCatalog.getString('label.distribution')+' : - ' +
                                    '<br>'+gettextCatalog.getString('label.version')+' : ' + master.version +
                                    '<br>'+gettextCatalog.getString('label.startedAt')+' : <span > </span><br> '+gettextCatalog.getString('label.surveyDate')+': - ';


                                if (master.os && master.startedAt) {
                                      popoverTemplate = gettextCatalog.getString('label.architecture')+': ' + master.os.architecture + '<br> '+gettextCatalog.getString('label.distribution')+' : ' + master.os.distribution +
                                    '<br>'+gettextCatalog.getString('label.version')+' : ' + master.version +
                                    '<br>'+gettextCatalog.getString('label.startedAt')+' : <span>' + moment(master.startedAt).tz(JSON.parse($window.sessionStorage.preferences).zone).format(JSON.parse($window.sessionStorage.preferences).dateFormat) + '</span><br> '+gettextCatalog.getString('label.surveyDate')+': ' + moment(master.surveyDate).tz(JSON.parse($window.sessionStorage.preferences).zone).format(JSON.parse($window.sessionStorage.preferences).dateFormat);

                                }
                             rect.setAttribute('data-content', popoverTemplate);

                        }
                    }

                    scope.refreshSupervisorState = refreshSupervisorState;
                    function refreshSupervisorState(supervisor) {
                        if (supervisor.data.jobscheduler.state) {
                            var span = document.getElementById('sp' + supervisor.host + supervisor.port);
                            var rect = document.getElementById(supervisor.host + supervisor.port);
                            var popoverTemplate = gettextCatalog.getString('label.architecture')+': - <br>'+ gettextCatalog.getString('label.distribution')+' : - ' +
                                    '<br>'+gettextCatalog.getString('label.version')+' : ' + supervisor.data.jobscheduler.version +
                                    '<br>'+gettextCatalog.getString('label.startedAt')+' : <span > </span><br> '+gettextCatalog.getString('label.surveyDate')+': - ';

                            if(supervisor.data && supervisor.data.jobscheduler && supervisor.data.jobscheduler.os){
                                popoverTemplate = gettextCatalog.getString('label.architecture')+' : ' + supervisor.data.jobscheduler.os.architecture + '<br> '+gettextCatalog.getString('label.distribution')+' : ' + supervisor.data.jobscheduler.os.distribution +
                                '<br>'+gettextCatalog.getString('label.version')+' : ' + supervisor.data.jobscheduler.version +
                                '<br>'+gettextCatalog.getString('label.startedAt')+' : <span>' +
                                moment(supervisor.data.jobscheduler.startedAt).tz(JSON.parse($window.sessionStorage.preferences).zone).format(JSON.parse($window.sessionStorage.preferences).dateFormat) +
                                '</span><br> '+gettextCatalog.getString('label.surveyDate')+': ' +
                                moment(supervisor.data.jobscheduler.surveyDate).tz(JSON.parse($window.sessionStorage.preferences).zone).format(JSON.parse($window.sessionStorage.preferences).dateFormat);

                            }
                            rect.setAttribute('data-content', popoverTemplate);
                        }
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

                            var popoverTemplate = '';
                            if (supervisor.data && supervisor.data.jobscheduler && supervisor.data.jobscheduler.os) {
                                popoverTemplate = gettextCatalog.getString('label.architecture')+': ' + supervisor.data.jobscheduler.os.architecture + '<br> '+gettextCatalog.getString('label.distribution')+' : ' + supervisor.data.jobscheduler.os.distribution +
                                '<br>'+gettextCatalog.getString('label.version')+' : ' + supervisor.data.jobscheduler.version +
                                '<br>'+gettextCatalog.getString('label.startedAt')+' : <span>' + moment(supervisor.data.jobscheduler.startedAt).tz(JSON.parse($window.sessionStorage.preferences).zone).format(JSON.parse($window.sessionStorage.preferences).dateFormat) + '</span><br> '+gettextCatalog.getString('label.surveyDate')+': ' + moment(supervisor.data.jobscheduler.surveyDate).tz(JSON.parse($window.sessionStorage.preferences).zone).format(JSON.parse($window.sessionStorage.preferences).dateFormat);

                            } else {
                                popoverTemplate = gettextCatalog.getString('label.architecture')+': - <br> '+gettextCatalog.getString('label.distribution')+' : - <br>'+gettextCatalog.getString('label.version')+' : - <br>'+gettextCatalog.getString('label.startedAt')+' : - <span></span><br>'+gettextCatalog.getString('label.surveyDate')+': - ';
                            }

                            var sClassRunning = 'text-success';

                            if (supervisor.data.jobscheduler.state && supervisor.data.jobscheduler.state._text.toLowerCase() == 'stopped') {
                                sClassRunning = 'text-danger';
                            } else if (supervisor.data.jobscheduler.state && supervisor.data.jobscheduler.state._text.toLowerCase() == 'unreachable') {
                                sClassRunning = 'text-warn';
                            }
                            else if (!supervisor.data.jobscheduler.state || supervisor.data.jobscheduler.state._text.toLowerCase() != 'running') {
                                sClassRunning = 'text-black-lt';
                            }


                            lastId = supervisor.host + supervisor.port;
                            template = template +

                            ' <div class="cluster-rect" data-toggle="popover"  trigger="hover" data-content="' + popoverTemplate + '"' +
                            'style="left:' + sLeft + 'px;top:' + 10 + 'px" id="' + supervisor.host + supervisor.port + '">' +
                            '<span id="' + 'sp' + supervisor.host + supervisor.port + '"  class="m-t-n-xxs fa fa-stop success-node" ng-class="{\'text-success\':clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text==\'RUNNING\',\'text-black-lt\':clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text==\'PAUSED\',\'text-danger\':clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text==\'STOPPED\',\'text-warn\':clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text==\'STOPPING\'||clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text==\'STARTING\'||clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text==\'TERMINATING\'||clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text==\'UNREACHABLE\'||clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text==\' \'}" ></span>' +
                            '<div class="text-left  p-t-sm p-l-sm "><span>' + 'SUPERVISOR' +
                            '</span> <span class="pull-right"><div class="btn-group dropdown" >' +
                            '<a href class="hide more-option" data-toggle="dropdown" ng-class="{show:permission.JobschedulerMaster.execute.restart.terminate || permission.JobschedulerMaster.execute.restart.abort ||permission.JobschedulerMaster.execute.abort || permission.JobschedulerMaster.execute.terminate || permission.JobschedulerMaster.execute.pause || permission.JobschedulerMaster.execute.continue || permission.JobschedulerMaster.view.mainlog}"><i class="text fa fa-ellipsis-h"></i></a>' +
                            '<div class="dropdown-menu dropdown-ac dropdown-more">' +
                            '<a class="hide dropdown-item bg-hover-color" ng-click="action1(\'' + sIndex + '\',\'undefined\',\'terminate\')" ng-class="{\'show\':permission.JobschedulerMaster.execute.terminate,\'disable-link\':clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text!=\'RUNNING\' && clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text!=\'PAUSED\' && clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text!=\'WAITING_FOR_ACTIVATION\'}" id="' + '__supervisor,terminate,' + supervisor.host + ':' + supervisor.port + '" translate>button.terminate</a>' +
                            '<a class="hide dropdown-item" ng-click="action1(\'' + sIndex + '\',\'undefined\',\'abort\')" ng-class="{\'show\':permission.JobschedulerMaster.execute.abort,\'disable-link\':clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text!=\'RUNNING\' && clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text!=\'PAUSED\' && clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text!=\'WAITING_FOR_ACTIVATION\'}"  id="' + '__supervisor,abort,' + supervisor.host + ':' + supervisor.port + '" translate>button.abort</a>' +
                            '<a class="hide dropdown-item" ng-click="action1(\'' + sIndex + '\',\'undefined\',\'abortAndRestart\')" ng-class="{\'show\':permission.JobschedulerMaster.execute.restart.abort,\'disable-link\':clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text!=\'RUNNING\' && clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text!=\'PAUSED\' && clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text!=\'WAITING_FOR_ACTIVATION\'}" id="' + '__supervisor,abortAndRestart,' + supervisor.host + ':' + supervisor.port + '" translate>button.abortAndRestart</a>' +
                            '<a class="hide dropdown-item" ng-click="action1(\'' + sIndex + '\',\'undefined\',\'terminateAndRestart\')" ng-class="{\'show\':permission.JobschedulerMaster.execute.restart.terminate,\'disable-link\':clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text!=\'RUNNING\' && clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text!=\'PAUSED\' && clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text!=\'WAITING_FOR_ACTIVATION\'}" id="' + '__supervisor,terminateAndRestart,' + supervisor.host + ':' + supervisor.port + '" translate>button.terminateAndRestart</a>' +
                            '<a class="hide dropdown-item" ng-click="action1(\'' + sIndex + '\',\'undefined\',\'terminateAndRestartwithTimeout\')" ng-class="{\'show\':permission.JobschedulerMaster.execute.restart.terminate,\'disable-link\':clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text!=\'RUNNING\' && clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text!=\'PAUSED\' && clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text!=\'WAITING_FOR_ACTIVATION\'}" id="' + '__supervisor,terminateAndRestartWithin,' + supervisor.host + ':' + supervisor.port + '" translate>button.terminateAndRestartWithin</a>' +
                            '<a class="hide dropdown-item"  ng-click="action1(\'' + sIndex + '\',\'undefined\',\'pause\')" ng-class="{show:clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text!=\'PAUSED\' && permission.JobschedulerMaster.execute.pause}" ng-class="{\'disable-link\':clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text!=\'RUNNING\' && clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text!=\'PAUSED\' && clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text!=\'WAITING_FOR_ACTIVATION\'}" id="' + '__supervisor,pause,' + supervisor.host + ':' + supervisor.port + '" translate>button.pause</a>' +
                            '<a class="hide dropdown-item" ng-click="action1(\'' + sIndex + '\',\'undefined\',\'continue\')" ng-class="{show:clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text==\'PAUSED\' && permission.JobschedulerMaster.execute.continue,\'disable-link\':clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text!=\'RUNNING\' && clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text!=\'PAUSED\' && clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text!=\'WAITING_FOR_ACTIVATION\'}"  id="' + '__supervisor,continue,' + supervisor.host + ':' + supervisor.port + '" translate>button.continue</a>' +
                            '<a class="hide dropdown-item" ng-click="action1(\'' + sIndex + '\',\'undefined\',\'remove\')" ng-class="{show:permission.JobschedulerMaster.administration.removeOldInstances}" id="' + '__supervisor,remove,' + supervisor.host + ':' + supervisor.port + '" translate>button.removeInstance</a>' +
                            '<a class="hide dropdown-item" ng-click="action1(\'' + sIndex + '\',\'undefined\',\'downloadLog\')" ng-class="{show:clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text!=\'RUNNING\' && permission.JobschedulerMaster.view.mainlog,\'disable-link\': clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text!=\'PAUSED\' && clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text!=\'WAITING_FOR_ACTIVATION\'}" id="' + '__supervisor,download_log,' + supervisor.host + ':' + supervisor.port + '" translate>button.downloadLog</a>' +
                            '</div>' +
                            '</div></span></div>';

                            if (supervisor.data.jobscheduler.os) {
                                template = template + '<div class="text-left p-t-xs p-l-sm block-ellipsis-cluster"><i class="fa fa-' + supervisor.data.jobscheduler.os.name.toLowerCase() + '">' + '</i><span class="p-l-sm text-sm" title="' + supervisor.jobschedulerId + '">' + supervisor.jobschedulerId +
                                '</span></div>';
                            } else {
                                template = template + '<div class="text-left p-t-xs p-l-sm block-ellipsis-cluster"><span class="p-l-sm text-sm" title="' + supervisor.jobschedulerId + '">' + supervisor.jobschedulerId +
                                '</span></div>';
                            }
                            template = template + '<div class="text-sm text-left p-t-xs p-l-sm "><span>' + supervisor.host + ':' + supervisor.port +
                            '</span></div>';
                            if (supervisor.data.jobscheduler.state && supervisor.data.jobscheduler.state._text) {
                                template = template + '<div class="text-left text-xs p-t-xs p-b-xs p-l-sm"><span class="text-black-dk" translate>label.state</span>: <span id="' + 'state' + supervisor.host + supervisor.port + '" ng-class="{\'text-success\':clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text==\'RUNNING\',\'text-black-lt\':clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text==\'PAUSED\',\'text-danger\':clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text==\'STOPPED\',\'text-warn\':clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text==\'STOPPING\'||clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text==\'STARTING\'||clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text==\'TERMINATING\'||clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text==\'UNREACHABLE\'||clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text==\' \'}" ng-bind="clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text"></span></div>';
                            } else {
                                template = template + '<div class="text-left text-xs p-t-xs p-b-xs p-l-sm"><span class="text-black-dk" translate>label.state</span>: <span id="' + 'state' + supervisor.host + supervisor.port + '" class="' + sClassRunning + '"></span></div>';
                            }
                            template = template + '</div>';
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


                                var popoverTemplate = gettextCatalog.getString('label.architecture')+': - <br>'+ gettextCatalog.getString('label.distribution')+' : - ' +
                                    '<br>'+gettextCatalog.getString('label.version')+' : ' + master.version +
                                    '<br>'+gettextCatalog.getString('label.startedAt')+' : <span > </span><br> '+gettextCatalog.getString('label.surveyDate')+': - ';


                                if (master.os && master.startedAt) {
                                      popoverTemplate = gettextCatalog.getString('label.architecture')+': ' + master.os.architecture + '<br> '+gettextCatalog.getString('label.distribution')+' : ' + master.os.distribution +
                                    '<br>'+gettextCatalog.getString('label.version')+' : ' + master.version +
                                    '<br>'+gettextCatalog.getString('label.startedAt')+' : <span>' + moment(master.startedAt).tz(JSON.parse($window.sessionStorage.preferences).zone).format(JSON.parse($window.sessionStorage.preferences).dateFormat) + '</span><br> '+gettextCatalog.getString('label.surveyDate')+': ' + moment(master.surveyDate).tz(JSON.parse($window.sessionStorage.preferences).zone).format(JSON.parse($window.sessionStorage.preferences).dateFormat);

                                }

                                if (master.clusterType && master.clusterType._type == 'PASSIVE') {
                                    if (master.clusterType.precedence == 0) {
                                        name = 'PRIMARY';
                                    } else {
                                        name = 'BACKUP';
                                    }

                                } else if (master.clusterType && master.clusterType._type == 'ACTIVE') {
                                    name = 'JobScheduler JS' + (index + 1);

                                }
                                if (master.clusterType._type == "PASSIVE" && !master.state) {
                                    master.state = {};
                                    master.state._text = ' ';
                                }

                                lastId = master.host + master.port;
                                masterTemplate = '<div data-toggle="popover"   data-content=\'' + popoverTemplate + '\'' +
                                'style="left:' + mLeft + 'px;top:' + top + 'px" id="' + master.host + master.port + '" class="' + c + '"   >' +
                                '<span class="m-t-n-xxs fa fa-stop success-node" ng-class="{\'text-success\':clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text==\'RUNNING\',\'text-black-lt\':clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text==\'PAUSED\',\'text-danger\':clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text==\'STOPPED\',\'text-warn\':clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text==\'STOPPING\'||clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text==\'STARTING\'||clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text==\'TERMINATING\'||clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text==\'UNREACHABLE\'||clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text==\' \'}" id="' + 'sp' + master.host + master.port + '"  ></span>' +
                                '<div class="text-left  p-t-sm p-l-sm "><span>' + name + '</span><span class="pull-right"><div class="btn-group dropdown " >' +
                                '<a href class="hide more-option" ng-class="{show:permission.JobschedulerMaster.execute.restart.terminate || permission.JobschedulerMaster.execute.restart.abort ||permission.JobschedulerMaster.execute.abort || permission.JobschedulerMaster.execute.terminate ||permission.JobschedulerMaster.execute.pause || permission.JobschedulerMaster.execute.continue || permission.JobschedulerMaster.view.mainlog}" data-toggle="dropdown" ><i class="text fa fa-ellipsis-h"></i></a>' +
                                '<div class="dropdown-menu dropdown-ac dropdown-more">' +
                                '<a class="hide dropdown-item" ng-click="action1(\'' + sIndex + '\',\'' + index + '\',\'terminate\')" bg-hover-color" ng-class="{\'show\':permission.JobschedulerMaster.execute.terminate,\'disable-link\':clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text!=\'RUNNING\' && clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text!=\'PAUSED\' && clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text!=\'WAITING_FOR_ACTIVATION\'}" id="' + '__master,terminate,' + master.host + ':' + master.port + '" translate>button.terminate</a>' +
                                '<a class="hide dropdown-item" ng-click="action1(\'' + sIndex + '\',\'' + index + '\',\'abort\')" ng-class="{\'show\':permission.JobschedulerMaster.execute.abort,\'disable-link\':clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text!=\'RUNNING\' && clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text!=\'PAUSED\' && clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text!=\'WAITING_FOR_ACTIVATION\'}" id="' + '__master,abort,' + master.host + ':' + master.port + '" translate>button.abort</a>' +
                                '<a class="hide dropdown-item" ng-click="action1(\'' + sIndex + '\',\'' + index + '\',\'abortAndRestart\')" ng-class="{\'show\':permission.JobschedulerMaster.execute.restart.abort,\'disable-link\':clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text!=\'RUNNING\' && clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text!=\'PAUSED\' && clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text!=\'WAITING_FOR_ACTIVATION\'}" id="' + '__master,abortAndRestart,' + master.host + ':' + master.port + '" translate>button.abortAndRestart</a>' +
                                '<a class="hide dropdown-item" ng-click="action1(\'' + sIndex + '\',\'' + index + '\',\'terminateAndRestart\')" ng-class="{\'show\':permission.JobschedulerMaster.execute.restart.terminate,\'disable-link\':clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text!=\'RUNNING\' && clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text!=\'PAUSED\' && clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text!=\'WAITING_FOR_ACTIVATION\'}" id="' + '__master,terminateAndRestart,' + master.host + ':' + master.port + '" translate>button.terminateAndRestart</a>' +
                                '<a class="hide dropdown-item" ng-click="action1(\'' + sIndex + '\',\'' + index + '\',\'terminateAndRestartWithTimeout\')" ng-class="{\'show\':permission.JobschedulerMaster.execute.restart.terminate,\'disable-link\':clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text!=\'RUNNING\' && clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text!=\'PAUSED\' && clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text!=\'WAITING_FOR_ACTIVATION\'}" id="' + '__master,terminateAndRestartWithin,' + master.host + ':' + master.port + '" translate>button.terminateAndRestartWithin</a>' +
                                '<a class="hide dropdown-item" ng-click="action1(\'' + sIndex + '\',\'' + index + '\',\'pause\')" ng-class="{\'disable-link\':clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text!=\'RUNNING\' && clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text!=\'WAITING_FOR_ACTIVATION\' && clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text!=\'PAUSED\',show:clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text!=\'PAUSED\' && permission.JobschedulerMaster.execute.pause}"  id="' + '__master,pause,' + master.host + ':' + master.port + '" translate>button.pause</a>' +
                                '<a class="hide dropdown-item" ng-click="action1(\'' + sIndex + '\',\'' + index + '\',\'continue\')" ng-class="{\'disable-link\':clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text!=\'RUNNING\' && clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text!=\'PAUSED\' && clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text!=\'WAITING_FOR_ACTIVATION\',show:clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text==\'PAUSED\' && permission.JobschedulerMaster.execute.continue}"  id="' + '__master,continue,' + master.host + ':' + master.port + '" translate>button.continue</a>' +
                                '<a class="hide dropdown-item" ng-click="action1(\'' + sIndex + '\',\'' + index + '\',\'remove\')" ng-class="{show:permission.JobschedulerMaster.administration.removeOldInstances}" id="' + '__master,remove,' + master.host + ':' + master.port + '" translate>button.removeInstance</a>' +
                                '<a class="hide dropdown-item" ng-click="action1(\'' + sIndex + '\',\'' + index + '\',\'downloadLog\')" ng-class="{\'disable-link\':clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text!=\'RUNNING\' && clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text!=\'PAUSED\' && clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text!=\'WAITING_FOR_ACTIVATION\',show:permission.JobschedulerMaster.view.mainlog }" id="' + '__master,download_log,' + master.host + ':' + master.port + '" translate>button.downloadLog</a>' +
                                '</div></div>' +
                                '</span></div>';
                                if (master.os) {
                                    masterTemplate = masterTemplate + '<div class="text-left p-t-xs p-l-sm block-ellipsis-cluster"><i class="fa fa-' + master.os.name.toLowerCase() + '"></i><span class="p-l-sm text-sm" title="' + master.jobschedulerId + '">' + master.jobschedulerId +
                                    '</span></div>';
                                } else {
                                    masterTemplate = masterTemplate + '<div class="text-left p-t-xs p-l-sm block-ellipsis-cluster"><i></i><span class="p-l-sm text-sm" title="' + master.jobschedulerId + '">' + master.jobschedulerId +
                                    '</span></div>';
                                }
                                masterTemplate = masterTemplate + '<div class="text-sm text-left p-t-xs p-l-sm ">' + master.host + ':' + master.port + '</div>' +
                                '<div class="text-left text-xs p-t-xs p-b-xs p-l-sm"><span class="text-black-dk" translate>label.state</span>: <span id="' + 'state' + master.host + master.port + '" ng-class="{\'text-success\':clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text==\'RUNNING\',\'text-black-lt\':clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text==\'PAUSED\',\'text-danger\':clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text==\'STOPPED\',\'text-warn\':clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text==\'STOPPING\'||clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text==\'STARTING\'||clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text==\'TERMINATING\'||clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text==\'UNREACHABLE\'||clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text==\' \'}" ng-bind="clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text"></span></div>' +
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

                            if (master) {

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
                                if (master.clusterType && master.clusterType._type == 'PASSIVE') {
                                    if (master.clusterType.precedence == 0) {
                                        name = 'PRIMARY';
                                    } else {
                                        name = 'BACKUP';
                                    }

                                } else if (master.clusterType && master.clusterType._type == 'ACTIVE') {
                                    name = 'JobScheduler JS' + (index + 1);

                                }


                                lastId = master.host + master.port;


                                 var popoverTemplate = gettextCatalog.getString('label.architecture')+': - <br>'+ gettextCatalog.getString('label.distribution')+' : - ' +
                                    '<br>'+gettextCatalog.getString('label.version')+' : ' + master.version +
                                    '<br>'+gettextCatalog.getString('label.startedAt')+' : <span > </span><br> '+gettextCatalog.getString('label.surveyDate')+': - ';



                                if (master.os && master.startedAt) {
                                    popoverTemplate = gettextCatalog.getString('label.architecture')+': ' + master.os.architecture + '<br> '+gettextCatalog.getString('label.distribution')+' : ' + master.os.distribution +
                                    '<br>'+gettextCatalog.getString('label.version')+' : ' + master.version +
                                    '<br>'+gettextCatalog.getString('label.startedAt')+' : <span>' + moment(master.startedAt).tz(JSON.parse($window.sessionStorage.preferences).zone).format(JSON.parse($window.sessionStorage.preferences).dateFormat) + '</span><br> '+gettextCatalog.getString('label.surveyDate')+': ' + moment(master.surveyDate).tz(JSON.parse($window.sessionStorage.preferences).zone).format(JSON.parse($window.sessionStorage.preferences).dateFormat);

                                }

                                var masterTemplate = '<div data-toggle="popover"   data-content=\'' + popoverTemplate + '\'' +
                                    'style="left:' + mLeft + 'px;top:' + top + 'px" id="' + master.host + master.port + '" class="' + c + '"   >' +
                                    '<span class="m-t-n-xxs fa fa-stop success-node" ng-class="{\'text-success\':clusterStatusData.members.masters[\'' + index + '\'].state._text==\'RUNNING\',\'text-black-lt\':clusterStatusData.members.masters[\'' + index + '\'].state._text==\'PAUSED\',\'text-danger\':clusterStatusData.members.masters[\'' + index + '\'].state._text==\'STOPPED\',\'text-warn\':clusterStatusData.members.masters[\'' + index + '\'].state._text==\'STOPPING\'||clusterStatusData.members.masters[\'' + index + '\'].state._text==\'STARTING\'||clusterStatusData.members.masters[\'' + index + '\'].state._text==\'TERMINATING\'||clusterStatusData.members.masters[\'' + index + '\'].state._text==\'UNREACHABLE\'||clusterStatusData.members.masters[\'' + index + '\'].state._text==\' \'}" id="' + 'sp' + master.host + master.port + '"  ></span>' +
                                    '<div class="text-left  p-t-sm p-l-sm "><span>' + name + '</span><span class="pull-right"><div class="btn-group dropdown " >' +
                                    '<a href class="hide more-option" ng-class="{show:permission.JobschedulerMaster.execute.restart.terminate || permission.JobschedulerMaster.execute.restart.abort ||permission.JobschedulerMaster.execute.abort || permission.JobschedulerMaster.execute.terminate ||permission.JobschedulerMaster.execute.pause || permission.JobschedulerMaster.execute.continue || permission.JobschedulerMaster.view.mainlog}" data-toggle="dropdown" ><i class="text fa fa-ellipsis-h"></i></a>' +
                                    '<div class="dropdown-menu dropdown-ac dropdown-more">' +
                                    '<a class="hide dropdown-item bg-hover-color" ng-click="action1(\'undefined\',\'' + index + '\',\'terminate\')"  ng-class="{show:permission.JobschedulerMaster.execute.terminate,\'disable-link\':clusterStatusData.members.masters[\'' + index + '\'].state._text!=\'RUNNING\' && clusterStatusData.members.masters[\'' + index + '\'].state._text!=\'PAUSED\' && clusterStatusData.members.masters[\'' + index + '\'].state._text!=\'WAITING_FOR_ACTIVATION\'}" id="' + '__master,terminate,' + master.host + ':' + master.port + '" translate>button.terminate</a>' +
                                    '<a class="hide dropdown-item" ng-click="action1(\'undefined\',\'' + index + '\',\'abort\')" ng-class="{show:permission.JobschedulerMaster.execute.abort,\'disable-link\':clusterStatusData.members.masters[\'' + index + '\'].state._text!=\'RUNNING\' && clusterStatusData.members.masters[\'' + index + '\'].state._text!=\'PAUSED\' && clusterStatusData.members.masters[\'' + index + '\'].state._text!=\'WAITING_FOR_ACTIVATION\'}" id="' + '__master,abort,' + master.host + ':' + master.port + '" translate>button.abort</a>' +
                                    '<a class="hide dropdown-item" ng-click="action1(\'undefined\',\'' + index + '\',\'abortAndRestart\')" ng-class="{show:permission.JobschedulerMaster.execute.restart.abort,\'disable-link\':clusterStatusData.members.masters[\'' + index + '\'].state._text!=\'RUNNING\' && clusterStatusData.members.masters[\'' + index + '\'].state._text!=\'PAUSED\' && clusterStatusData.members.masters[\'' + index + '\'].state._text!=\'WAITING_FOR_ACTIVATION\'}" id="' + '__master,abortAndRestart,' + master.host + ':' + master.port + '" translate>button.abortAndRestart</a>' +
                                    '<a class="hide dropdown-item" ng-click="action1(\'undefined\',\'' + index + '\',\'terminateAndRestart\')" ng-class="{show:permission.JobschedulerMaster.execute.restart.terminate,\'disable-link\':clusterStatusData.members.masters[\'' + index + '\'].state._text!=\'RUNNING\' && clusterStatusData.members.masters[\'' + index + '\'].state._text!=\'PAUSED\' && clusterStatusData.members.masters[\'' + index + '\'].state._text!=\'WAITING_FOR_ACTIVATION\'}" id="' + '__master,terminateAndRestart,' + master.host + ':' + master.port + '" translate>button.terminateAndRestart</a>' +
                                    '<a class="hide dropdown-item" ng-click="action1(\'undefined\',\'' + index + '\',\'terminateAndRestartWithTimeout\')" ng-class="{show:permission.JobschedulerMaster.execute.restart.terminate,\'disable-link\':clusterStatusData.members.masters[\'' + index + '\'].state._text!=\'RUNNING\' && clusterStatusData.members.masters[\'' + index + '\'].state._text!=\'PAUSED\' && clusterStatusData.members.masters[\'' + index + '\'].state._text!=\'WAITING_FOR_ACTIVATION\'}" id="' + '__master,terminateAndRestartWithin,' + master.host + ':' + master.port + '" translate>button.terminateAndRestartWithin</a>' +
                                    '<a class="hide dropdown-item" ng-click="action1(\'undefined\',\'' + index + '\',\'pause\')" ng-class="{\'disable-link\':clusterStatusData.members.masters[\'' + index + '\'].state._text!=\'RUNNING\' && clusterStatusData.members.masters[\'' + index + '\'].state._text!=\'PAUSED\' && clusterStatusData.members.masters[\'' + index + '\'].state._text!=\'WAITING_FOR_ACTIVATION\',show:permission.JobschedulerMaster.execute.pause && clusterStatusData.members.masters[\'' + index + '\'].state._text!=\'PAUSED\' }"  id="' + '__master,pause,' + master.host + ':' + master.port + '" translate>button.pause</a>' +
                                    '<a class="hide dropdown-item" ng-click="action1(\'undefined\',\'' + index + '\',\'continue\')" ng-class="{\'disable-link\':clusterStatusData.members.masters[\'' + index + '\'].state._text!=\'RUNNING\' && clusterStatusData.members.masters[\'' + index + '\'].state._text!=\'PAUSED\' && clusterStatusData.members.masters[\'' + index + '\'].state._text!=\'WAITING_FOR_ACTIVATION\',show:permission.JobschedulerMaster.execute.continue && clusterStatusData.members.masters[\'' + index + '\'].state._text==\'PAUSED\'}"  id="' + '__master,continue,' + master.host + ':' + master.port + '" translate>button.continue</a>' +
                                    '<a class="hide dropdown-item" ng-click="action1(\'undefined\',\'' + index + '\',\'remove\')" ng-class="{show:permission.JobschedulerMaster.administration.removeOldInstances}" id="' + '__master,remove,' + master.host + ':' + master.port + '" translate>button.removeInstance</a>' +
                                    '<a class="hide dropdown-item" ng-click="action1(\'undefined\',\'' + index + '\',\'downloadLog\')"  ng-class="{\'disable-link\':clusterStatusData.members.masters[\'' + index + '\'].state._text!=\'RUNNING\' && clusterStatusData.members.masters[\'' + index + '\'].state._text!=\'PAUSED\' && clusterStatusData.members.masters[\'' + index + '\'].state._text!=\'WAITING_FOR_ACTIVATION\',show:permission.JobschedulerMaster.view.mainlog }" id="' + '__master,download_log,' + master.host + ':' + master.port + '" translate>button.downloadLog</a>' +
                                    '</div></div>' +
                                    '</span></div>';
                                if (master.os) {
                                    masterTemplate = masterTemplate + '<div class="text-left p-t-xs p-l-sm block-ellipsis-cluster"><i class="fa fa-' + master.os.name.toLowerCase() + '"></i><span class="p-l-sm text-sm" title="' + master.jobschedulerId + '">' + master.jobschedulerId +
                                    '</span></div>';
                                } else {
                                    masterTemplate = masterTemplate + '<div class="text-left p-t-xs p-l-sm block-ellipsis-cluster"><i></i><span class="p-l-sm text-sm" title="' + master.jobschedulerId + '">' + master.jobschedulerId +
                                    '</span></div>';
                                }
                                masterTemplate = masterTemplate + '<div class="text-sm text-left p-t-xs p-l-sm ">' + master.host + ':' + master.port + '</div>' +
                                '<div class="text-left text-xs p-t-xs p-b-xs p-l-sm"><span class="text-black-dk" translate>label.state</span>: <span id="' + 'state' + master.host + master.port + '" ng-class="{\'text-success\':clusterStatusData.members.masters[\'' + index + '\'].state._text==\'RUNNING\',\'text-black-lt\':clusterStatusData.members.masters[\'' + index + '\'].state._text==\'PAUSED\',\'text-danger\':clusterStatusData.members.masters[\'' + index + '\'].state._text==\'STOPPED\',\'text-warn\':clusterStatusData.members.masters[\'' + index + '\'].state._text==\'STOPPING\'||clusterStatusData.members.masters[\'' + index + '\'].state._text==\'STARTING\'||clusterStatusData.members.masters[\'' + index + '\'].state._text==\'TERMINATING\'||clusterStatusData.members.masters[\'' + index + '\'].state._text==\'UNREACHABLE\'||clusterStatusData.members.masters[\'' + index + '\'].state._text==\' \'}" ng-bind="clusterStatusData.members.masters[\'' + index + '\'].state._text"></span></div>' +
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
                        var dTop = top - rHeight / 2 - 10;

                        if (new Date().getTime() - new Date(scope.clusterStatusData.database.surveyDate).getTime() < 2000) {

                            c = c + " yellow-border";
                        }


                        var popoverTemplate = ' Survey Date : ' + moment(scope.clusterStatusData.database.surveyDate).tz(JSON.parse($window.sessionStorage.preferences).zone).format(JSON.parse($window.sessionStorage.preferences).dateFormat);

                        var masterTemplate = '<div data-toggle="popover"  data-placement="top" data-content="' + popoverTemplate + '" ' +

                            'style="left:' + mLeft + 'px;top:' + dTop + 'px" id="' + 'database' + '" class="' + c + '"   >' +
                            '<span class="m-t-n-xxs fa fa-stop text-success success-node"></span>' +
                            '<div class="text-left p-t-sm p-l-sm "><i class="fa fa-database"></i><span class="p-l-sm"><span translate>label.database</span> ' + scope.clusterStatusData.database.database.dbms +
                            '</span></div>' +
                            '<div class="text-sm text-left p-t-xs p-b-xs p-l-sm ">' +
                            '<span ng-bind="clusterStatusData.database.database.version"></span></div>' +

                            '</div>';


                        template = template + '<div   id="masterContainer">' + masterTemplate + '</div></div>' +
                        ' <script>' +
                        ' $(document).ready(function(){' +
                        '$(\'[data-toggle="popover"]\').popover({html:true,trigger:"hover"});' +
                        '});' +

                        '</script>';
                        template = $compile(template)(scope);
                        elem.append(template);
                        alignToCenter();

                    }


                    function alignToCenter() {
                        var containerCt = $("#divClusterStatusWidget").height() / 2;
                        var containerHCt = $("#divClusterStatusWidget").width() / 2;
                        var diagramHCt = (parseInt(document.getElementById('database').style.left.replace('px', '')) + $("#database").width() - margin) / 2;
                        var diagramCt = (document.getElementById(lastId).offsetTop + document.getElementById(lastId).clientHeight + vMargin / 2) / 2;
                        if (containerCt > diagramCt || containerHCt > diagramHCt) {
                            var diff = (containerCt - diagramCt);
                            var diffH = (containerHCt - diagramHCt);
                            angular.forEach(scope.clusterStatusData.supervisors, function (supervisor, sIndex) {
                                if (diff > 0) {
                                    document.getElementById(supervisor.host + supervisor.port).style.top =
                                        parseInt(document.getElementById(supervisor.host + supervisor.port).style.top.replace('px', '')) + diff + 'px';
                                }
                                if (diffH > 0) {
                                    document.getElementById(supervisor.host + supervisor.port).style.left =
                                        parseInt(document.getElementById(supervisor.host + supervisor.port).style.left.replace('px', '')) + diffH + 'px';
                                }

                                angular.forEach(supervisor.masters, function (master, index) {
                                    if (diff > 0) {
                                        document.getElementById(master.host + master.port).style.top =
                                            parseInt(document.getElementById(master.host + master.port).style.top.replace('px', '')) + diff + 'px';
                                    }
                                    if (diffH > 0) {
                                        document.getElementById(master.host + master.port).style.left =
                                            parseInt(document.getElementById(master.host + master.port).style.left.replace('px', '')) + diff + 'px';
                                    }

                                })
                            });

                            angular.forEach(scope.clusterStatusData.members.masters, function (master, index) {
                                if (diff > 0) {
                                    document.getElementById(master.host + master.port).style.top =
                                        parseInt(document.getElementById(master.host + master.port).style.top.replace('px', '')) + diff + 'px';
                                }
                                if (diffH > 0) {
                                    document.getElementById(master.host + master.port).style.left =
                                        parseInt(document.getElementById(master.host + master.port).style.left.replace('px', '')) + diff + 'px';
                                }

                            });
                            if (diff > 0) {
                                document.getElementById('database').style.top =
                                    parseInt(document.getElementById('database').style.top.replace('px', '')) + diff + 'px';
                            }
                            if (diffH > 0) {

                                document.getElementById('database').style.left =
                                    parseInt(document.getElementById('database').style.left.replace('px', '')) + diffH + 'px';
                            }

                        }
                    }


                }
            },
            scope: {
                clusterStatusData: '=',
                getSupervisorDetails: '&',
                onRefresh: '&',
                onOperation: '&',
                permission: '='

            },
            controller: ["$scope", "$interval", function ($scope, $interval) {
                var vm = $scope;
                var promise;


                vm.startToCheck = startToCheck;
                function startToCheck() {
                    promise = $interval(function () {
                        drawConnections();
                    }, 200);
                }

                vm.action1 = function (supervisor, master, action) {
                    var item = '';
                    var host = '';
                    var port = '';
                    var id = '';
                    if (master == 'undefined' && supervisor != 'undefined') {
                        item = 'supervisor';
                        host = vm.clusterStatusData.supervisors[supervisor].host;
                        port = vm.clusterStatusData.supervisors[supervisor].port;
                        id = vm.clusterStatusData.supervisors[supervisor].jobschedulerId;
                    } else if (master != 'undefined' && supervisor != 'undefined') {
                        item = 'master';
                        host = vm.clusterStatusData.supervisors[supervisor].masters[master].host;
                        port = vm.clusterStatusData.supervisors[supervisor].masters[master].port;
                        id = vm.clusterStatusData.supervisors[supervisor].masters[master].jobschedulerId;
                    } else if (master != 'undefined' && supervisor == 'undefined') {
                        item = 'master';
                        host = vm.clusterStatusData.members.masters[master].host;
                        port = vm.clusterStatusData.members.masters[master].port;
                        id = vm.clusterStatusData.members.masters[master].jobschedulerId;

                    }

                    vm.onOperation({
                        item: item,
                        action: action,
                        host: host,
                        port: port,
                        id: id
                    });
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
                            node.setAttribute('ng-style', '{"border":(clusterStatusData.supervisor[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text==\'UNREACHABLE\'?\'1px dashed #efb700\':\'1px dashed #D9D9D9\')}');
                            clusterStatusContainer.appendChild(node);
                            $compile(node)(vm);

                            var node = document.createElement('div');
                            node.setAttribute('id', '&&' + master.host + master.port + '&&database02');
                            node.setAttribute('class', 'h-line ');
                            node.style.setProperty('top', dLTop + 'px');
                            node.style.setProperty('left', dLLeft + 'px');
                            node.style.setProperty('width', '1px');
                            node.style.setProperty('height', mTop - dLTop + 'px');
                            node.setAttribute('ng-style', '{"border":(clusterStatusData.supervisor[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text==\'UNREACHABLE\'?\'1px dashed #efb700\':\'1px dashed #D9D9D9\')}');
                            clusterStatusContainer.appendChild(node);
                            $compile(node)(vm);

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
                    });

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

                            if (masterRect) {
                                var mLeft = masterRect.offsetLeft;
                                var mTop = masterRect.offsetTop;
                            }

                            var databaseRect = document.getElementById('database');
                            if (!databaseRect) {
                                return;
                            }
                            dTop = databaseRect.offsetTop;
                            dLeft = databaseRect.offsetLeft;
                            var offset = 20;
                            if (masterRect) {
                                sWidth = masterRect.offsetWidth;
                            }
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
                            node.setAttribute('ng-style', '{"border":(clusterStatusData.members.masters[\'' + index + '\'].state._text==\'UNREACHABLE\'?\'1px dashed #efb700\':\'1px dashed #D9D9D9\')}');
                            clusterStatusContainer.appendChild(node);
                            $compile(node)(vm);

                            var node = document.createElement('div');
                            node.setAttribute('id', '&&' + master.host + master.port + '&&database02');
                            node.setAttribute('class', 'h-line');
                            node.style.setProperty('top', dLTop + 'px');
                            node.style.setProperty('left', dLLeft + 'px');
                            node.style.setProperty('width', '1px');
                            node.style.setProperty('height', mTop - dLTop + 'px');
                            node.setAttribute('ng-style', '{"border":(clusterStatusData.members.masters[\'' + index + '\'].state._text==\'UNREACHABLE\'?\'1px dashed #efb700\':\'1px dashed #D9D9D9\')}');
                            clusterStatusContainer.appendChild(node);
                            $compile(node)(vm);

                        })
                    }

                    vm.action = function (item, action, object) {

                        vm.onOperation({item: item, action: action, object: object});

                    }


                }

                vm.$on('event-started', function (event, args) {
                    if (args.events && args.events.length > 0) {
                        angular.forEach(args.otherEvents, function (event) {
                            angular.forEach(event.eventSnapshots, function (value1) {
                                if (value1.eventType === "SchedulerStateChanged") {
                                    vm.getSupervisor(value1);
                                }
                            });
                        });

                    }
                });
            }]
        }
    }

    dailyPlanOverview.$inject = [];
    function dailyPlanOverview() {
        return {
            restrict: 'E',
            scope: {
                waiting: '=',
                late: '=',
                lateSuccess: '=',
                lateError: '=',
                success: '=',
                error: '=',
                total: '=',
                day: "=",
                width: "="
            },
            template: '<div class="plan-overview bg-dimgrey" ng-style="{\'width\': width[0]+\'%\'}">\n'
            + '<label class="hide" ng-class="{\'show\': waiting > 0}" uib-tooltip="{{waiting*total/100 | number:0}} out of {{total}}"><a class="nav-link block-ellipsis-job" ui-sref="app.dailyPlan({filter:1,day:day})" ><span  translate>label.waiting</span> - {{waiting |number:1}} %  </a></label></div>'
            + '<div class="plan-overview bg-gold" ng-style="{width: width[1]+\'%\'}">\n'
            + '<label class="hide plan-status" ng-class="{\'show\': late > 0}" uib-tooltip="{{late*total/100 | number:0}} out of {{total}}"> <a class="nav-link block-ellipsis-job" ui-sref="app.dailyPlan({filter:2,day:day})" > <span  translate>label.PlannedLate</span> - {{late |number:1}} % </a></label></div>'
            + '<div class="plan-overview bg-green1" ng-style="{width: width[3]+\'%\'}">\n'
            + '<label class="hide plan-status" ng-class="{\'show\': lateSuccess > 0}" uib-tooltip="{{lateSuccess*total/100 | number:0}} out of {{total}}"> <a class="nav-link block-ellipsis-job" ui-sref="app.dailyPlan({filter:3,day:day})" > <span  translate>label.successfulLate</span> - {{lateSuccess |number:1}} % </a></label></div>'
            + '<div class="plan-overview bg-crimson1" ng-style="{width: width[5]+\'%\'}">\n'
            + '<label class="hide" ng-class="{\'show\': lateError > 0}" uib-tooltip="{{lateError*total/100 | number:0}} out of {{total}}"> <a class="nav-link block-ellipsis-job" ui-sref="app.dailyPlan({filter:4,day:day})" > <span  translate>label.failedLate</span> - {{lateError |number:1}} % </a></label></div>'
            + '<div class="plan-overview bg-green" ng-style="{width: width[2]+\'%\'}">\n'
            + '<label class="hide plan-status" ng-class="{\'show\': success > 0}" uib-tooltip="{{success*total/100 | number:0}} out of {{total}}"><a class="nav-link block-ellipsis-job" ui-sref="app.dailyPlan({filter:5,day:day})" > <span  translate>label.successful</span> - {{success |number:1}} % </a></label></div>'
            + '<div class="plan-overview bg-crimson" ng-style="{width: width[4]+\'%\'}">\n'
            + '<label class="hide" ng-class="{\'show\': error > 0}" uib-tooltip="{{error*total/100 | number:0}} out of {{total}}"> <a class="nav-link block-ellipsis-job" ui-sref="app.dailyPlan({filter:6,day:day})" > <span  translate>label.failed</span> - {{error |number:1}} % </a></label></div>'
        }
    }
})();
