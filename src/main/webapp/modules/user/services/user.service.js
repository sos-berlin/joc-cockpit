!function () {
    "use strict";
    function e(e) {
        function n() {
            var e = this;
            r.forEach(function (n) {
                e[n] = o(n)
            })
        }

        function t(e, n, t) {
            var o = i + n;
            null == t && (t = ""), e[o] = t
        }

        function o(n) {
            var t = i + n;
            return e.localStorage[t] || e.sessionStorage[t] || null
        }

        var r = ["accessTokenId", "currentUserData", "sessionTimeout", "jobChain", "permissions","permission", "scheduleIds"], i = "$SOS$";
        return n.prototype.save = function () {
            var n = this, o = e.sessionStorage;
            r.forEach(function (e) {
                t(o, e, n[e])
            })
        }, n.prototype.setUser = function (e) {
            this.accessTokenId = e.accessToken, this.currentUserData = e.user, this.sessionTimeout = e.sessionTimeout
        }, n.prototype.setPermissions = function (e) {
            this.permissions = JSON.stringify(e)
        },n.prototype.setPermission = function (e) {
            this.permission = JSON.stringify(e)
        }, n.prototype.setIds = function (e) {
            this.scheduleIds = JSON.stringify(e)
        }, n.prototype.clearUser = function () {
            this.accessTokenId = null, this.currentUserData = null, this.sessionTimeout = null, this.permissions = null, this.permission = null, this.scheduleIds = null, e.sessionStorage.$SOS$URL = null, e.sessionStorage.$SOS$URLPARAMS = {}
        }, n.prototype.setJobChain = function (n) {
            this.jobChain = n;
            var o = this, r = "jobChain";
            t(e.sessionStorage, r, o[r])
        }, n.prototype.getJobChain = function () {
            return this.jobChain
        }, n.prototype.clearStorage = function () {
            r.forEach(function (n) {
                t(e.sessionStorage, n, null), t(e.localStorage, n, null)
            })
        }, new n
    }

    function n() {
        var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        return {
            encode: function (input) {
                var output = "";
                var chr1, chr2, chr3 = "";
                var enc1, enc2, enc3, enc4 = "";
                var i = 0;

                do {
                    chr1 = input.charCodeAt(i++);
                    chr2 = input.charCodeAt(i++);
                    chr3 = input.charCodeAt(i++);

                    enc1 = chr1 >> 2;
                    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                    enc4 = chr3 & 63;

                    if (isNaN(chr2)) {
                        enc3 = enc4 = 64;
                    } else if (isNaN(chr3)) {
                        enc4 = 64;
                    }

                    output = output +
                        keyStr.charAt(enc1) +
                        keyStr.charAt(enc2) +
                        keyStr.charAt(enc3) +
                        keyStr.charAt(enc4);
                    chr1 = chr2 = chr3 = "";
                    enc1 = enc2 = enc3 = enc4 = "";
                } while (i < input.length);

                return output;
            }
        }
    }

    function t(e, n, t, o) {
        return {
            logout: function () {
                var t = n.defer(), o = e("security/logout");
                return o.save(function (e) {
                    t.resolve(e)
                }, function (e) {
                    t.reject(e)
                }), t.promise
            }, touch: function () {
                var t = n.defer(), o = e("touch");
                return o.save(function (e) {
                    t.resolve(e)
                }, function (e) {
                    t.reject(e)
                }), t.promise
            }, authenticate: function (e, r) {
                var i = n.defer();
                return t.defaults.headers.common.Authorization = "Basic " + o.encode(unescape(encodeURIComponent(e + ":" + r))), t.post("security/login").then(function (e) {
                    i.resolve(e.data)
                }, function (e) {
                    i.reject(e)
                }), i.promise
            }, getPermissions: function (t) {
                var o = n.defer(), r = e("security/joc_cockpit_permissions");
                return r.save({}, function (e) {
                    o.resolve(e)
                }, function (e) {
                    o.reject(e)
                }), o.promise
            }, configuration: function (t) {
                var o = n.defer(), r = e("configuration");
                return r.save(t, function (e) {
                    o.resolve(e)
                }, function (e) {
                    o.reject(e)
                }), o.promise
            }, saveConfiguration: function (t) {
                var o = n.defer(), r = e("configuration/save");
                return r.save(t, function (e) {
                    o.resolve(e)
                }, function (e) {
                    o.reject(e)
                }), o.promise
            }, deleteConfiguration: function (t) {
                var o = n.defer(), r = e("configuration/delete");
                return r.save(t, function (e) {
                    o.resolve(e)
                }, function (e) {
                    o.reject(e)
                }), o.promise
            }, shareConfiguration: function (t) {
                var o = n.defer(), r = e("configuration/share");
                return r.save(t, function (e) {
                    o.resolve(e)
                }, function (e) {
                    o.reject(e)
                }), o.promise
            }, privateConfiguration: function (t) {
                var o = n.defer(), r = e("configuration/make_private");
                return r.save(t, function (e) {
                    o.resolve(e)
                }, function (e) {
                    o.reject(e)
                }), o.promise
            }, configurations: function (t) {
                var o = n.defer(), r = e("configurations");
                return r.save(t, function (e) {
                    o.resolve(e)
                }, function (e) {
                    o.reject(e)
                }), o.promise
            }, sharedConfiguration: function (t) {
                var o = n.defer(), r = e("configuration/shared");
                return r.save(t, function (e) {
                    o.resolve(e)
                }, function (e) {
                    o.reject(e)
                }), o.promise
            }, securityConfigurationRead: function (t) {
                var o = n.defer(), r = e("security_configuration/read");
                return r.save(t, function (e) {
                    o.resolve(e)
                }, function (e) {
                    o.reject(e)
                }), o.promise
            }, securityConfigurationWrite: function (t) {
                var o = n.defer(), r = e("security_configuration/write");
                return r.save(t, function (e) {
                    o.resolve(e)
                }, function (e) {
                    o.reject(e)
                }), o.promise
            }, permissions: function (t) {
                var o = n.defer(), r = e("security/permissions");
                return r.save(t, function (e) {
                    o.resolve(e)
                }, function (e) {
                    o.reject(e)
                }), o.promise
            }, defaultConfiguration: function (t) {
                var o = n.defer(), r = e("configuration/login");
                return r.save(t, function (e) {
                    o.resolve(e)
                }, function (e) {
                    o.reject(e)
                }), o.promise
            }, deleteProfile: function (t) {
                var o = n.defer(), r = e("configurations/delete");
                return r.save(t, function (e) {
                    o.resolve(e)
                }, function (e) {
                    o.reject(e)
                }), o.promise
            }
        }
    }

    function o(e, n) {
        return {
            getLogs: function (t) {
                var o = n.defer(), r = e("audit_log");
                return r.save(t, function (e) {
                    o.resolve(e)
                }, function (e) {
                    o.reject(e)
                }), o.promise
            }, comments: function () {
                var t = n.defer(), o = e("properties");
                return o.save({}, function (e) {
                    t.resolve(e)
                }, function (e) {
                    t.reject(e)
                }), t.promise
            }
        }
    }

    function y(UserService, $q, $rootScope, $location,SOSAuth) {
        return {
            permissionModel: {
                permission: {}
            },
            permissionCheck: function (routePath) {
                // we will return a promise .
                let deferred = $q.defer();
                let showViews = {};
                if (window.sessionStorage.showViews) {
                    showViews = JSON.parse(window.sessionStorage.showViews)
                }
                let ifPermissionPassed = false;
                if(SOSAuth.permission) {
                    this.permissionModel.permission = JSON.parse(SOSAuth.permission);
                }
                switch (routePath) {
                    case 'Dashboard':
                        if (showViews.dashboard !== undefined) {
                            if (showViews.dashboard === true) {
                                ifPermissionPassed = true;
                            }
                        } else {
                            ifPermissionPassed = true;
                        }
                        break;
                    case 'DailyPlan':
                        if (showViews.dailyPlan !== undefined) {
                            if (showViews.dailyPlan)
                                ifPermissionPassed = true;
                        } else {
                            if (this.permissionModel.permission.DailyPlan && this.permissionModel.permission.DailyPlan.view.status) {
                                ifPermissionPassed = true;
                            }
                        }
                        break;
                    case 'JobChain':
                        if (showViews.jobChains !== undefined) {
                            if (showViews.jobChains)
                                ifPermissionPassed = true;
                        } else {
                            if (this.permissionModel.permission.JobChain && this.permissionModel.permission.JobChain.view.status) {
                                ifPermissionPassed = true;
                            }
                        }
                        break;
                    case 'Job':
                        if (showViews.jobs !== undefined) {
                            if (showViews.jobs)
                                ifPermissionPassed = true;
                        } else {
                            if (this.permissionModel.permission.Job && this.permissionModel.permission.Job.view.status) {
                                ifPermissionPassed = true;
                            }
                        }
                        break;
                    case 'JobStream':
                        if (showViews.conditions !== undefined) {
                            if (showViews.conditions)
                                ifPermissionPassed = true;
                        } else {
                            if (this.permissionModel.permission.JobStream && this.permissionModel.permission.JobStream.view.status) {
                                ifPermissionPassed = true;
                            }
                        }
                        break;
                    case 'Order':
                        if (showViews.orders !== undefined) {
                            if (showViews.orders)
                                ifPermissionPassed = true;
                        } else {
                            if (this.permissionModel.permission.Order && this.permissionModel.permission.Order.view.status) {
                                ifPermissionPassed = true;
                            }
                        }
                        break;
                    case 'History':
                        if (showViews.history !== undefined) {
                            if (showViews.history === true)
                                ifPermissionPassed = true;
                        } else {
                            if (this.permissionModel.permission.History && (this.permissionModel.permission.History.view.status || this.permissionModel.permission.YADE.view.status)) {
                                ifPermissionPassed = true;
                            }
                        }
                        break;
                    case 'Resource':
                        if (showViews.resources !== undefined) {
                            if (showViews.resources === true) {
                                ifPermissionPassed = true;
                            }
                        } else {
                            if (this.permissionModel.permission.JobschedulerUniversalAgent && (this.permissionModel.permission.JobschedulerUniversalAgent.view.status || this.permissionModel.permission.ProcessClass.view.status ||
                                this.permissionModel.permission.Schedule.view.status || this.permissionModel.permission.Lock.view.status || this.permissionModel.permission.Calendar.view.status
                                || this.permissionModel.permission.Event.view.status || this.permissionModel.permission.Documentation.view)) {
                                ifPermissionPassed = true;
                            }
                        }
                        break;
                    case 'AuditLog':
                        if (showViews.auditLog !== undefined) {
                            if (showViews.auditLog === true) {
                                ifPermissionPassed = true;
                            }
                        } else {
                            if (this.permissionModel.permission.AuditLog && this.permissionModel.permission.AuditLog.view.status) {
                                ifPermissionPassed = true;
                            }
                        }
                        break;
                    case 'File Transfer':
                        if (showViews.fileTransfers !== undefined) {
                            if (showViews.fileTransfers === true) {
                                ifPermissionPassed = true;
                            }
                        } else {
                            if (this.permissionModel.permission.YADE && this.permissionModel.permission.YADE.view.status) {
                                ifPermissionPassed = true;
                            }
                        }
                        break;
                    case 'Configuration':
                        if (showViews.configurations !== undefined) {
                            if (showViews.configurations === true) {
                                ifPermissionPassed = true;
                            }
                        } else {
                            if (this.permissionModel.permission.JobschedulerMaster.administration && this.permissionModel.permission.JobschedulerMaster.administration.configurations && this.permissionModel.permission.JobschedulerMaster.administration.configurations.view) {
                                ifPermissionPassed = true;
                            }
                        }
                        break;
                    case 'ManageAccount':
                        if (this.permissionModel.permission.JobschedulerMaster && this.permissionModel.permission.JobschedulerMaster.administration.editPermissions) {
                            ifPermissionPassed = true;
                        }
                        break;
                    default:
                        deferred.resolve();
                }

                if (!ifPermissionPassed) {
                    if (!_.isEmpty(showViews) && routePath === 'Dashboard' && showViews.dashboard === false) {
                        if (showViews.dailyPlan) {
                            $location.path('/daily_plan');
                        } else if (showViews.jobChains) {
                            $location.path('/job_chains');
                        } else if (showViews.jobs) {
                            $location.path('/jobs');
                        } else if (showViews.conditions) {
                            $location.path('/job_streams');
                        }else if (showViews.orders) {
                            $location.path('/orders');
                        } else if (showViews.history) {
                            $location.path('/history');
                        } else if (showViews.resources) {
                            $location.path('/resources');
                        } else if (showViews.auditLog) {
                            $location.path('/audit_log');
                        } else if (showViews.fileTransfers) {
                            $location.path('/file_transfers');
                        }  else if (showViews.configuration) {
                            $location.path('/configuration');
                        }else {
                            $location.path('/user/profile');
                        }
                    }
                    $rootScope.$on('$locationChangeSuccess', function (event, newUrl, oldUrl) {
                        if (newUrl && newUrl.substring(newUrl.lastIndexOf('#!') + 2) === $location.path()) {
                            deferred.reject('skip');
                        } else {
                            deferred.resolve();
                        }
                    });
                } else {
                    deferred.resolve();
                }
                return deferred.promise;
            },
        };
    }

    function z(SOSAuth) {
        return {
            getPermission: function (id) {
                let p = JSON.parse(SOSAuth.permissions).SOSPermissionJocCockpitMaster;
                for (let i = 0; i < p.length; i++) {
                    if (p[i].JobSchedulerMaster === id) {
                        return p[i].SOSPermissionJocCockpit;
                    }
                }
            },
            savePermission: function (id) {
                let p = JSON.parse(SOSAuth.permissions).SOSPermissionJocCockpitMaster;
                for (let i = 0; i < p.length; i++) {
                    if (p[i].JobSchedulerMaster === id) {
                        SOSAuth.setPermission(p[i].SOSPermissionJocCockpit);
                        SOSAuth.save();
                        return;
                    }
                }
            }
        }
    }
    angular.module("app").service("SOSAuth", e).service("Base64", n).service("UserService", t).service("AuditLogService", o).factory('authorizationService',y).service("PermissionService", z), e.$inject = ["$window"], t.$inject = ["$resource", "$q", "$http", "Base64"], o.$inject = ["$resource", "$q"],y.$inject = ["UserService", "$q", "$rootScope", "$location","SOSAuth"],z.$inject = ["SOSAuth"];
}();
