!function () {
    "use strict";
    function e(e, r) {
        var l = function (e, r, l, t, a) {
            var s = e.defer();
            if (l.accessTokenId) {
                if (t.sessionStorage.setItem("$SOS$URL", null), t.sessionStorage.setItem("$SOS$URLPARAMS", {}), t.sessionStorage.$SOS$NAVIGATEOBJ && ("null" != t.sessionStorage.$SOS$NAVIGATEOBJ || null != t.sessionStorage.$SOS$NAVIGATEOBJ))try {
                    var o = JSON.parse(t.sessionStorage.$SOS$NAVIGATEOBJ);
                    o && ("JOB" == o.tab ? (a.job_expand_to = {
                        name: o.name,
                        path: o.path
                    }, r.path("/jobs")) : "ORDER" == o.tab ? (a.order_expand_to = {
                        name: o.name,
                        path: o.path
                    }, r.path("/orders")) : "JOBCHAIN" == o.tab && (a.expand_to = {
                        name: o.name,
                        path: o.path
                    }, r.path("/job_chains")), t.sessionStorage.$SOS$NAVIGATEOBJ = null)
                } catch (c) {
                    console.error(c)
                }
                if(t.localStorage.$SOS$URLRESET){
                    t.localStorage.removeItem('$SOS$URLRESET');
                }
                s.resolve()
            } else {
                if(t.localStorage.$SOS$URLRESET){
                    t.localStorage.removeItem('$SOS$URL');
                    t.localStorage.removeItem('$SOS$URLPARAMS');
                }else{
                    t.localStorage.$SOS$URL = r.path(), t.localStorage.$SOS$URLPARAMS = JSON.stringify(r.search());
                }
                s.reject("login");
            }
            return s.promise
        };
        l.$inject = ["$q", "$location", "SOSAuth", "$window", "$rootScope"];
        var t = function (e, r) {
            var l = e.defer();
            return r.accessTokenId ? l.reject() : l.resolve(), l.promise
        };
        t.$inject = ["$q", "SOSAuth"], r.otherwise(function (e, r) {
            return e.invoke(["$state", function (e) {
                r.path() ? e.go("404") : e.go("app.dashboard")
            }]), !0
        }), e.state("login", {
            url: "/login",
            templateUrl: "modules/user/views/login.html",
            controller: "LoginCtrl as lc",
            title: "Login",
            ncyBreadcrumb: {skip: !0},
            resolve: {logout: t}
        }).state("404", {
            url: "/404",
            templateUrl: "modules/core/views/404.html",
            title: "404",
            ncyBreadcrumb: {skip: !0}
        }).state("error", {
            url: "/error",
            templateUrl: "modules/core/views/error.html",
            controller: "HeaderCtrl",
            title: "Error",
            ncyBreadcrumb: {skip: !0}
        }).state("client-logs", {
            url: "/client-logs",
            templateUrl: "modules/core/views/client-logs.html",
            controller: "ClientLogCtrl",
            title: "JobScheduler-Logging",
            ncyBreadcrumb: {skip: !0}
        }).state("app", {
            "abstract": !0,
            url: "",
            templateUrl: "modules/core/views/layout.html",
            resolve: {loggedin: l}
        }).state("app.dashboard", {
            url: "/",
            templateUrl: "modules/jobscheduler/views/dashboard.html",
            controller: "DashboardCtrl",
            ncyBreadcrumb: {label: "{{ 'breadcrumb.dashboard' | translate}}"}
        }).state("app.setting", {
            url: "/logging",
            templateUrl: "modules/core/views/setting.html",
            ncyBreadcrumb: {label: "{{ 'breadcrumb.setting' | translate}}"},
            resolve:{
                loadPlugin: ['$ocLazyLoad', function ($ocLazyLoad) {
                   return $ocLazyLoad.load([{
                        name:'ngclipboard',
                        files: ["bower_components/clipboard/dist/clipboard.min.js","bower_components/ngclipboard/dist/ngclipboard.min.js"],
                        serie:true
                    }]);
                }]
            }
        }).state("app.dailyPlan", {
            url: "/daily_plan",
            params: {filter: null, day: null},
            templateUrl: "modules/jobscheduler/views/daily-plan.html",
            controller: "DailyPlanCtrl",
            resolve: {
                permission: function(authorizationService) {
                    return authorizationService.permissionCheck('DailyPlan');
                },
                loadPlugin: ['$ocLazyLoad', function ($ocLazyLoad) {
                    $ocLazyLoad.load([{
                        insertBefore: '#load_styles_before',
                        files:["bower_components/angular-gantt/assets/angular-gantt.css","bower_components/angular-gantt/assets/angular-gantt-plugins.css"]
                    }]);
                }]
            },
            ncyBreadcrumb: {label: "{{ 'breadcrumb.dailyPlan' | translate}}"}
        }).state("app.jobs", {
            url: "/jobs",
            templateUrl: "modules/job/views/job.html",
            controller: "JobCtrl",
            resolve: {
                permission: function(authorizationService) {
                    return authorizationService.permissionCheck('Job');
                }
            },
            ncyBreadcrumb: {label: "{{ 'breadcrumb.jobs' | translate}}"}
        }).state("app.job", {
            url: "/job",
            templateUrl: "modules/job/views/job-info.html",
            controller: "JobCtrl",
            resolve: {
                permission: function(authorizationService) {
                    return authorizationService.permissionCheck('Job');
                }
            },
            ncyBreadcrumb: {label: "{{ 'breadcrumb.jobs' | translate}}", parent: "app.jobs"}
        }).state("app.jobsOverview", {
            url: "/tasks_overview/:name",
            templateUrl: "modules/job/views/jobs-overview.html",
            controller: "JobOverviewCtrl",
            resolve: {
                permission: function(authorizationService) {
                    return authorizationService.permissionCheck('Job');
                }
            },
            ncyBreadcrumb: {label: "{{ 'breadcrumb.jobsOverview' | translate}}", parent: "app.dashboard"}
        }).state("app.jobChains", {
            url: "/job_chains",
            templateUrl: "modules/job/views/job-chain.html",
            controller: "JobChainCtrl",
            resolve: {
                permission: function(authorizationService) {
                    return authorizationService.permissionCheck('JobChain');
                }
            },
            ncyBreadcrumb: {label: "{{ 'breadcrumb.jobChains' | translate}}"}
        }).state("app.jobChain", {
            url: "/job_chain",
            templateUrl: "modules/job/views/job-chain-info.html",
            controller: "JobChainCtrl",
            resolve: {
                permission: function(authorizationService) {
                    return authorizationService.permissionCheck('JobChain');
                }
            },
            ncyBreadcrumb: {label: "{{ 'breadcrumb.jobChains' | translate}}", parent: "app.jobChains"}
        }).state("app.jobChainDetails", {
            url: "/job_chain_detail",
            templateUrl: "modules/order/views/job-chain-details.html",
            controller: "JobChainDetailsCtrl",
            resolve: {
                permission: function(authorizationService) {
                    return authorizationService.permissionCheck('JobChain');
                },
                loadPlugin: ['$ocLazyLoad', function ($ocLazyLoad) {
                    $ocLazyLoad.load([{
                        files: ["js/html2canvas.js","js/pdfmake.min.js","js/vfs_fonts.js", "bower_components/es6-promise/dist/es6-promise.auto.js", "js/canvas-toBlob.js"],
                        serie: true
                    },{
                        insertBefore: '#load_styles_before',
                        files:["bower_components/angularjs-slider/dist/rzslider.min.css"]
                    },{
                        name:'rzModule',
                        files:["bower_components/angularjs-slider/dist/rzslider.min.js"]
                    }]);
                }]
            },
            ncyBreadcrumb: {label: "{{jobChain.name}}", parent: "app.jobChains"}
        }).state("app.jobChainDetails.orders", {
            url: "/orders",
            templateUrl: "modules/order/views/job-chain-orders.html",
            controller: "JobChainOrdersCtrl",
            ncyBreadcrumb: {skip: !0}
        }).state("app.jobChainDetails.overview", {
            url: "/overview",
            templateUrl: "modules/order/views/job-chain-overview.html",
            controller: "JobChainOverviewCtrl",
            ncyBreadcrumb: {skip: !0}
        }).state("app.orders", {
            url: "/orders",
            templateUrl: "modules/order/views/order.html",
            controller: "OrderCtrl",
            resolve: {
                permission: function(authorizationService) {
                    return authorizationService.permissionCheck('Order');
                }
            },
            ncyBreadcrumb: {label: "{{ 'breadcrumb.orders' | translate}}"}
        }).state("app.order", {
            url: "/order",
            templateUrl: "modules/order/views/order-info.html",
            controller: "OrderCtrl",
            resolve: {
                permission: function(authorizationService) {
                    return authorizationService.permissionCheck('Order');
                }
            },
            ncyBreadcrumb: {label: "{{ 'breadcrumb.order' | translate}}", parent: "app.orders"}
        }).state("app.ordersOverview", {
            url: "/orders_overview/:name",
            templateUrl: "modules/order/views/orders-overview.html",
            controller: "OrderOverviewCtrl",
            resolve: {
                permission: function(authorizationService) {
                    return authorizationService.permissionCheck('Order');
                }
            },
            ncyBreadcrumb: {label: "{{ 'breadcrumb.ordersOverview' | translate}}", parent: "app.dashboard"}
        }).state("app.orderLog", {
            url: "/order/log",
            templateUrl: "modules/order/views/log.html",
            controller: "LogCtrl",
            ncyBreadcrumb: {label: "{{ 'breadcrumb.orderLogs' | translate}}"}
        }).state("app.jobLog", {
            url: "/job/log",
            templateUrl: "modules/order/views/log.html",
            controller: "LogCtrl",
            ncyBreadcrumb: {label: "{{ 'breadcrumb.taskLogs' | translate}}"}
        }).state("app.transferLog", {
            url: "/file_transfer/log",
            templateUrl: "modules/order/views/log.html",
            controller: "LogCtrl",
            ncyBreadcrumb: {label: "{{ 'breadcrumb.fileTransferLogs' | translate}}"}
        }).state("app.yade", {
            url: "/file_transfers",
            templateUrl: "modules/yade/views/file-transfers.html",
            controller: "YadeCtrl",
            resolve: {
                permission: function(authorizationService) {
                    return authorizationService.permissionCheck('File Transfer');
                }
            },
            ncyBreadcrumb: {label: "{{ 'breadcrumb.fileTransfer' | translate}}"}
        }).state("app.fileTransfersOverview", {
            url: "/file_transfer_overview/:name",
            templateUrl: "modules/yade/views/transfer-overview.html",
            controller: "YadeOverviewCtrl",
            resolve: {
                permission: function(authorizationService) {
                    return authorizationService.permissionCheck('File Transfer');
                }
            },
            ncyBreadcrumb: {label: "{{ 'breadcrumb.fileTransferOverview' | translate}}", parent: "app.dashboard"}
        }).state("app.fileTransfer", {
            url: "/file_transfer?id&scheduler_id",
            templateUrl: "modules/yade/views/file-transfer.html",
            controller: "YadeCtrl",
            ncyBreadcrumb: {label: "{{ 'breadcrumb.fileTransfer' | translate}}", parent: "app.yade"}
        }).state("app.resources", {
            url: "/resources",
            templateUrl: "modules/jobscheduler/views/resource.html",
            controller: "ResourceCtrl",
            resolve: {
                permission: function(authorizationService) {
                    return authorizationService.permissionCheck('Resource');
                },
                loadPlugin: ['$ocLazyLoad', function ($ocLazyLoad) {
                   return $ocLazyLoad.load([{
                        name:'angularFileUpload',
                        files: ["js/angular-file-upload.min.js"]
                    }])
                }]
            },
            ncyBreadcrumb: {label: "{{ 'breadcrumb.resources' | translate}}"}
        }).state("app.resources.agentClusters", {
            url: "/agent_clusters/:type",
            templateUrl: "modules/jobscheduler/views/resource-agents.html",
            ncyBreadcrumb: {label: "{{ 'breadcrumb.agents' | translate}}", parent: "app.resources"}
        }).state("app.resources.locks", {
            url: "/locks",
            templateUrl: "modules/jobscheduler/views/resource-locks.html",
            ncyBreadcrumb: {label: "{{ 'breadcrumb.locks' | translate}}", parent: "app.resources"}
        }).state("app.resources.processClasses", {
            url: "/process_classes",
            templateUrl: "modules/jobscheduler/views/resource-process-classes.html",
            ncyBreadcrumb: {label: "{{ 'breadcrumb.processClasses' | translate}}", parent: "app.resources"}
        }).state("app.resources.schedules", {
            url: "/schedules",
            templateUrl: "modules/jobscheduler/views/resource-schedules.html",
            ncyBreadcrumb: {label: "{{ 'breadcrumb.schedules' | translate}}", parent: "app.resources"}
        }).state("app.resources.calendars", {
            url: "/calendars",
            templateUrl: "modules/jobscheduler/views/resource-calendars.html",
            ncyBreadcrumb: {label: "{{ 'breadcrumb.calendars' | translate}}", parent: "app.resources"}
        }).state("app.resources.agentJobExecutions", {
            url: "/agent_jobs_execution",
            templateUrl: "modules/jobscheduler/views/resource-agent-job-execution.html",
            ncyBreadcrumb: {label: "{{ 'breadcrumb.agentJobsExecution' | translate}}", parent: "app.resources"}
        }).state("app.resources.events", {
            url: "/events",
            templateUrl: "modules/jobscheduler/views/resource-events.html",
            ncyBreadcrumb: {label: "{{ 'breadcrumb.events' | translate}}", parent: "app.resources"}
        }).state("app.agentCluster", {
            url: "/agent_cluster?path&scheduler_id",
            templateUrl: "modules/jobscheduler/views/agent-cluster.html",
            controller: "ResourceInfoCtrl",
            ncyBreadcrumb: {label: "{{ 'breadcrumb.agentCluster' | translate}}", parent: "app.resources.agentClusters"}
        }).state("app.lock", {
            url: "/lock?path&scheduler_id",
            templateUrl: "modules/jobscheduler/views/lock.html",
            controller: "ResourceInfoCtrl",
            ncyBreadcrumb: {label: "{{ 'breadcrumb.lock' | translate}}", parent: "app.resources.locks"}
        }).state("app.processClass", {
            url: "/process_class?path&scheduler_id",
            templateUrl: "modules/jobscheduler/views/process-class.html",
            controller: "ResourceInfoCtrl",
            ncyBreadcrumb: {label: "{{ 'breadcrumb.processClass' | translate}}", parent: "app.resources.processClasses"}
        }).state("app.schedule", {
            url: "/schedule?path&scheduler_id",
            templateUrl: "modules/jobscheduler/views/schedule.html",
            controller: "ResourceInfoCtrl",
            ncyBreadcrumb: {label: "{{ 'breadcrumb.schedule' | translate}}", parent: "app.resources.schedules"}
        }).state("app.calendar", {
            url: "/calendar?path&scheduler_id",
            templateUrl: "modules/jobscheduler/views/calendar.html",
            controller: "ResourceInfoCtrl",
            resolve: {
                permission: function (authorizationService) {
                    return authorizationService.permissionCheck('Resource');
                },
                loadPlugin: ['$ocLazyLoad', function ($ocLazyLoad) {
                   return $ocLazyLoad.load([{
                        name:'angularFileUpload',
                        files: ["js/angular-file-upload.min.js"]
                    }])
                }]
            },
            ncyBreadcrumb: {label: "{{ 'breadcrumb.calendar' | translate}}", parent: "app.resources.calendars"}
        }).state("app.history", {
            url: "/history",
            templateUrl: "modules/order/views/history.html",
            controller: "HistoryCtrl",
            resolve: {
                permission: function(authorizationService) {
                    return authorizationService.permissionCheck('History');
                }
            },
            ncyBreadcrumb: {label: "{{ 'breadcrumb.history' | translate}}"}
        }).state("app.auditLog", {
            url: "/audit_log",
            templateUrl: "modules/user/views/audit-log.html",
            controller: "AuditLogCtrl",
            resolve: {
                permission: function(authorizationService) {
                    return authorizationService.permissionCheck('AuditLog');
                }
            },
            ncyBreadcrumb: {label: "{{ 'breadcrumb.auditLog' | translate}}"}
        }).state("app.profile", {
            url: "/user/profile",
            templateUrl: "modules/user/views/profile.html",
            controller: "UserProfileCtrl as upc",
            ncyBreadcrumb: {label: "{{ 'breadcrumb.userProfile' | translate}}"}
        }).state("app.users", {
            url: "/users",
            templateUrl: "modules/user/views/user-main.html",
            controller: "UsersCtrl",
            resolve: {
                permission: function(authorizationService) {
                    return authorizationService.permissionCheck('ManageAccount');
                }
            },
            ncyBreadcrumb: {label: "{{ 'breadcrumb.manageUser' | translate}}"}
        }).state("app.users.user", {
            url: "/all",
            templateUrl: "modules/user/views/user.html",
            ncyBreadcrumb: {skip: !0}
        }).state("app.users.permission", {
            url: "/permission/:master/:role",
            templateUrl: "modules/user/views/permission.html",
            controller:"PermissionCtrl",
            ncyBreadcrumb: {label: "{{ 'breadcrumb.permissions' | translate}}", parent: "app.users.master"}
        }).state("app.users.master", {
            url: "/master",
            templateUrl: "modules/user/views/role.html",
            ncyBreadcrumb: {label: "{{ 'breadcrumb.masters' | translate}}", parent: "app.users.user"}
        }).state("app.users.main", {
            url: "/main-section",
            templateUrl: "modules/user/views/main.html",
            ncyBreadcrumb: {label: "{{ 'breadcrumb.main' | translate}}", parent: "app.users.user"}
        }).state("app.users.profiles", {
            url: "/profiles",
            templateUrl: "modules/user/views/profiles.html",
            ncyBreadcrumb: {label: "{{ 'breadcrumb.profiles' | translate}}", parent: "app.users.user"}
        })

    }

    angular.module("app").config(e), e.$inject = ["$stateProvider", "$urlRouterProvider"]
}();
