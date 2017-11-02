!function () {
    "use strict";
    function e() {
        return {
            restrict: "E", link: function (e, t, i) {
                (i.ngClick || "" === i.href || "#" === i.href) && t.on("click", function (e) {
                    e.preventDefault()
                })
            }
        }
    }

    function t(e, t) {
        return {
            link: function (i, n) {
                n.addClass("hide");
                var a, r;
                e.$on("$stateChangeStart", function (i, r, o, l) {
                    if (n.removeClass("hide"), a = new Date, "/job_chain_detail" === r.url)return t.go("app.jobChainDetails.orders"), void i.preventDefault();
                    if ("/resources" === r.url && "app.resources.agentClusters" != l.name)return t.go("app.resources.agentClusters"), void i.preventDefault();
                    if ("/users" === r.url && "app.users.user" != l.name)return t.go("app.users.user"), void i.preventDefault();
                    if ("/resources" === r.url && "app.resources.agentClusters" == l.name)return n.addClass("hide"), void i.preventDefault();
                    if (e.clientLogFilter.isEnable) {
                        var s = {message: "START LOADING " + r.url, logTime: a, level: "debug2"};
                        e.clientLogs.push(s)
                    }
                }), e.$on("$stateChangeSuccess", function (t, i) {
                    if (n.addClass("hide"), $("body, html").animate({scrollTop: 0}, 1e3), n.addClass("hide"), e.clientLogFilter.isEnable && a) {
                        r = new Date;
                        var o = {
                            message: "ELAPSED TIME FOR UPDATE " + i.url + " " + (r.getTime() - a.getTime()) / 1e3 + "s",
                            logTime: r,
                            level: "debug2"
                        };
                        e.clientLogs.push(o)
                    }
                }), e.$on("$stateNotFound", function () {
                    n.addClass("hide")
                }), e.$on("$viewContentLoading", function () {
                    var t = new Date;
                    if (r && r.getTime() < t.getTime()) {
                        var i = {
                            message: "ELAPSED TIME FOR UPDATE CONTENT " + (t.getTime() - r.getTime()) / 1e3 + "s",
                            logTime: t,
                            level: "debug2"
                        };
                        e.clientLogs.push(i)
                    }
                }), e.$on("$stateChangeError", function (i, a, r, o, l, s) {
                    if (n.addClass("hide"), "login" === s)t.go("login"); else if("error"==s) t.go("error"); else {if (e.clientLogFilter.isEnable) {
                        var s = {message: "ERROR ON LOADING : " + a.url, logTime: new Date, level: "error"};
                        e.clientLogs.push(s)
                    }
                        t.go("app.dashboard");
                    }
                })
            }
        }
    }

    function i(e, t, i) {
        function n(n, a, r) {
            var o = n.$eval(r.uiInclude);
            e.get(o, {cache: t}).then(function (e) {
                a.replaceWith(i(e.data)(n))
            })
        }

        var a = {restrict: "A", link: n};
        return a
    }

    function n() {
        function e(e, t, i) {
            t.find("a").bind("click", function (e) {
                var t = angular.element(this).parent(), i = t.parent()[0].querySelectorAll(".active");
                t.toggleClass("active"), angular.element(i).removeClass("active")
            })
        }

        var t = {restrict: "AC", link: e};
        return t
    }

    function a(e, t) {
        function i(e, t, i) {
            if (angular.isArray(e))for (var n = e.length; n--;)if (i(e[n], t))return !0;
            return !1
        }

        function n(e, t, n) {
            return e = angular.isArray(e) ? e : [], i(e, t, n) || e.push(t), e
        }

        function a(e, t, i) {
            if (angular.isArray(e))for (var n = e.length; n--;)if (i(e[n], t)) {
                e.splice(n, 1);
                break
            }
            return e
        }

        function r(r, o, l) {
            function s(e, t) {
                r[l.ngModel] = i(e, h, g)
            }

            var c = l.checklistModel;
            l.$set("checklistModel", null), t(o)(r), l.$set("checklistModel", c);
            var u = e(c), d = u.assign, f = e(l.checklistChange), h = l.checklistValue ? e(l.checklistValue)(r.$parent) : l.value, g = angular.equals;
            if (l.hasOwnProperty("checklistComparator"))if ("." == l.checklistComparator[0]) {
                var m = l.checklistComparator.substring(1);
                g = function (e, t) {
                    return e[m] === t[m]
                }
            } else g = e(l.checklistComparator)(r.$parent);
            r.$watch(l.ngModel, function (e, t) {
                if (e !== t) {
                    var i = u(r.$parent);
                    angular.isFunction(d) && (e === !0 ? d(r.$parent, n(i, h, g)) : d(r.$parent, a(i, h, g))), f && f(r)
                }
            }), angular.isFunction(r.$parent.$watchCollection) ? r.$parent.$watchCollection(c, s) : r.$parent.$watch(c, s, !0)
        }

        return {
            restrict: "A", priority: 1e3, terminal: !0, scope: !0, compile: function (e, t) {
                if (("INPUT" !== e[0].tagName || "checkbox" !== t.type) && "MD-CHECKBOX" !== e[0].tagName && !t.btnCheckbox)throw'checklist-model should be applied to `input[type="checkbox"]` or `md-checkbox`.';
                if (!t.checklistValue && !t.value)throw"You should provide `value` or `checklist-value`.";
                return t.ngModel || t.$set("ngModel", "checked"), r
            }
        }
    }

    function r() {
        return {
            restrict: "E",
            templateUrl: "modules/core/template/toggle-view.html",
            controller: ["$window", "$scope", "$location", function (e, t, l) {
                var view = 'grid';
                if(e.sessionStorage.preferences) {
                   if(JSON.parse(e.sessionStorage.preferences).pageView){
                       view = JSON.parse(e.sessionStorage.preferences).pageView;
                   }
                }
                var views = {
                    dailyPlan: view,
                    jobChain: view,
                    job: view,
                    order: view,
                    agent: view,
                    lock: view,
                    processClass: view,
                    schedule: view,
                    calendar: view,
                    jobChainOrder: view,
                    orderOverView: view,
                    permission: view
                };
                if (!e.localStorage.views) {
                    e.localStorage.views = JSON.stringify(views);
                } else {
                    views = JSON.parse(e.localStorage.views);
                }
                if (l.path() == '/daily_plan') {
                    t.pageView = views.dailyPlan;
                } else if (l.path() == '/job_chains') {
                    t.pageView = views.jobChain;
                } else if (l.path() == '/jobs') {
                    t.pageView = views.job;
                } else if (l.path() == '/orders') {
                    t.pageView = views.order;
                } else if (l.path().match('/resources/agent_clusters')) {
                    t.pageView = views.agent;
                } else if (l.path() == '/resources/locks') {
                    t.pageView = views.lock;
                } else if (l.path() == '/resources/process_classes') {
                    t.pageView = views.processClass;
                } else if (l.path() == '/resources/schedules') {
                    t.pageView = views.schedule;
                } else if (l.path() == '/resources/calendars') {
                    t.pageView = views.calendar;
                }else if (l.path().match('/job_chain_detail/')) {
                    t.pageView = views.jobChainOrder;
                } else if (l.path().match('/orders_overview')) {
                    t.pageView = views.orderOverView;
                } else if (l.path().match('/users/')) {
                    t.pageView = views.permission;
                }else{
                    t.pageView = view;
                }
                t.setView = function () {
                    if (l.path() == '/daily_plan') {
                        views.dailyPlan = t.pageView;
                    } else if (l.path() == '/job_chains') {
                        views.jobChain = t.pageView;
                    } else if (l.path() == '/jobs') {
                        views.job = t.pageView;
                    } else if (l.path() == '/orders') {
                        views.order = t.pageView;
                    } else if (l.path().match('/resources/agent_clusters')) {
                        views.agent = t.pageView;
                    } else if (l.path() == '/resources/locks') {
                        views.lock = t.pageView;
                    } else if (l.path() == '/resources/process_classes') {
                        views.processClass = t.pageView;
                    } else if (l.path() == '/resources/schedules') {
                        views.schedule = t.pageView;
                    }else if (l.path() == '/resources/calendars') {
                        views.calendar = t.pageView;
                    } else if (l.path().match('/job_chain_detail/')) {
                        views.jobChainOrder = t.pageView;
                    } else if (l.path().match('/orders_overview')) {
                        views.orderOverView = t.pageView;
                    } else if (l.path().match('/users/')) {
                        views.permission =t.pageView;
                    }
                    e.localStorage.views = JSON.stringify(views);
                }
            }]
        }
    }

    function o(e) {
        return {
            restrict: "AE", replace: !0, scope: {alphabetcolors: "=alphabetcolors"}, link: function (t, i, n) {
                var a = {
                    charCount: s(n.charcount) ? n.charcount : e.charCount,
                    data: n.data,
                    textColor: e.textColor,
                    height: s(n.height) ? n.height : e.height,
                    width: s(n.width) ? n.width : e.width,
                    fontsize: s(n.fontsize) ? n.fontsize : e.fontsize,
                    fontWeight: s(n.fontweight) ? n.fontweight : e.fontWeight,
                    fontFamily: s(n.fontfamily) ? n.fontfamily : e.fontFamily,
                    avatarBorderStyle: n.avatarcustomborder,
                    avatardefaultBorder: n.avatarborder,
                    defaultBorder: e.defaultBorder,
                    shape: n.shape,
                    alphabetcolors: t.alphabetcolors || e.alphabetcolors
                }, r = a.data.substr(0, a.charCount).toUpperCase(), o = u(r, a.textColor, a.fontFamily, a.fontWeight, a.fontsize), d = "", f = "";
                r.charCodeAt(0) < 65 ? f = l() : (d = Math.floor((r.charCodeAt(0) - 65) % a.alphabetcolors.length), f = a.alphabetcolors[d]);
                var h = c(a.width, a.height, f);
                h.append(o);
                var g, m = angular.element("<div>").append(h.clone()).html(), v = window.btoa(decodeURIComponent(encodeURIComponent(m))), $ = e.base, p = "";
                if (a.avatarBorderStyle ? p = a.avatarBorderStyle : a.avatardefaultBorder && (p = a.defaultBorder), a.shape) {
                    if ("round" === a.shape) {
                        var b = e.radius + p;
                        g = "<img src=" + $ + v + " style='" + b + "' />"
                    }
                } else g = "<img src=" + $ + v + " style='" + p + "' />";
                i.replaceWith(g)
            }
        }
    }

    function l() {
        for (var e = "0123456789ABCDEF".split(""), t = "#", i = 0; 6 > i; i++)t += e[Math.floor(16 * Math.random())];
        return t
    }

    function s(e) {
        return e ? !0 : !1
    }

    function c(e, t, i) {
        var n = angular.element("<svg></svg>").attr({
            xmlns: "http://www.w3.org/2000/svg",
            "pointer-events": "none",
            width: e,
            height: t
        }).css({"background-color": i, width: e + "px", height: t + "px"});
        return n
    }

    function u(e, t, i, n, a) {
        var r = angular.element('<text text-anchor="middle"></text>').attr({
            y: "50%",
            x: "50%",
            dy: "0.35em",
            "pointer-events": "auto",
            fill: t,
            "font-family": i
        }).html(e).css({"font-weight": n, "font-size": a + "px"});
        return r
    }

    function d(e, t) {
        return {
            link: function (i, n, a) {
                function r() {
                    n.text(u(l))
                }

                function o() {
                    s = e(function () {
                        r(), o()
                    }, c)
                }

                var l = a.time, s = "";
                a.$observe("time", function (e) {
                    l = e, s || o()
                }, !0);
                var c = 5e3, u = t("remainingTime");
                n.bind("$destroy", function () {
                    e.cancel(s)
                }), r(), l && o()
            }
        }
    }

    function f(e, t) {
        return function (i, n, a) {
            function r() {
                l = a.time1, n.text(u(l))
            }

            function o() {
                s = e(function () {
                    r(), o()
                }, c)
            }

            var l = a.time1, s = "", c = 5e3, u = t("timeDifferenceFilter");
            a.$observe("time1", function (e) {
                r()
            }, !0), n.bind("$destroy", function () {
                e.cancel(s)
            }), r(), l && o()
        }
    }

    function h() {
        return {
            restrict: "A", require: "ngModel", link: function (e, t, i, n) {
                t.bind("blur", function () {
                    n.$modelValue && (!n.$modelValue || /^\s*$/i.test(n.$modelValue) || /^\s*(now\s*\+)\s*(\d+)\s*$/i.test(n.$modelValue) || /^\s*(now)\s*$/i.test(n.$modelValue) ? n.$setValidity("invalid", !0) : n.$setValidity("invalid", !1))
                }), t.bind("keyup", function () {
                    n.$setValidity("invalid", !0)
                })
            }
        }
    }

    function g() {
        return {
            restrict: "A", require: "ngModel", link: function (e, t, i, n) {
                t.bind("blur", function () {
                    if (n.$modelValue)try {
                        new RegExp(n.$modelValue), n.$setValidity("invalid", !0)
                    } catch (e) {
                        n.$setValidity("invalid", !1)
                    }
                }), t.bind("keyup", function () {
                    n.$setValidity("invalid", !0)
                })
            }
        }
    }

    function m() {
        return {
            restrict: "A", require: "ngModel", link: function (e, t, i, n) {
                t.bind("blur", function () {
                    n.$modelValue && (!n.$modelValue || /^\s*$/i.test(n.$modelValue) || /^\s*(now\s*\+)\s*(\d+)\s*$/i.test(n.$modelValue) || /^\s*\d+[d,h,w,M,y]\s*$/i.test(n.$modelValue) || /^\s*(now)\s*$/i.test(n.$modelValue) || /^\s*(Today)\s*$/i.test(n.$modelValue) || /^\s*(\d+):(\d+)\s*(am|pm)\s*to\s*(\d+):(\d+)\s*(am|pm)\s*$/i.test(n.$modelValue) ? n.$setValidity("invalid", !0) : n.$setValidity("invalid", !1))
                }), t.bind("keyup", function () {
                    n.$setValidity("invalid", !0)
                })
            }
        }
    }

    function v() {
        return {
            restrict: "A", require: "ngModel", link: function (e, t, i, n) {
                t.bind("blur", function () {
                    n.$modelValue && (!n.$modelValue || /^\s*$/i.test(n.$modelValue) ||  /^\s*(-)\s*(\d+)(h|d|w|M|y)\s*/.test(n.$modelValue) || /^\s*(now\s*\-)\s*(\d+)\s*$/i.test(n.$modelValue) || /^\s*(now)\s*$/i.test(n.$modelValue) || /^\s*(Today)\s*$/i.test(n.$modelValue) || /^\s*(Yesterday)\s*$/i.test(n.$modelValue) || /^\s*(-)(\d+)\s*(h|d|w|M|y)\s*to\s*(-)(\d+)\s*(h|d|w|M|y)\s*/.test(n.$modelValue) || /^\s*(\d+):(\d+)\s*(am|pm)\s*to\s*(\d+):(\d+)\s*(am|pm)\s*$/i.test(n.$modelValue) ? n.$setValidity("invalid", !0) : n.$setValidity("invalid", !1))
                }), t.bind("keyup", function () {
                    n.$setValidity("invalid", !0)
                })
            }
        }
    }
    function p() {
        return {
            restrict: "A", require: "ngModel", link: function (e, t, i, n) {
                t.bind("blur", function () {
                    n.$modelValue && (!n.$modelValue || /^\s*$/i.test(n.$modelValue) || /^\s*[-,+]?\d+[d,h,w,M,y]{1}\s*$/i.test(n.$modelValue) || /^\s*(now\s*[-,+])\s*(\d+)\s*$/i.test(n.$modelValue) || /^\s*(now)\s*$/i.test(n.$modelValue) || /^\s*(Today)\s*$/i.test(n.$modelValue) ? n.$setValidity("invalid", !0) : n.$setValidity("invalid", !1))
                }), t.bind("keyup", function () {
                    n.$setValidity("invalid", !0)
                })
            }
        }
    }

    function z() {
        return {
            restrict: "A",
            require: "ngModel",
            link: function (scope, element, attrs, ngModel) {
                element.bind("blur", function () {
                    if (ngModel.$modelValue) {
                        if (ngModel.$modelValue.substring(0, 2) == 24) {
                            ngModel.$setViewValue('24:00');
                            ngModel.$render();
                        }else {
                            if (ngModel.$modelValue.length == 1) {
                                ngModel.$setViewValue('');
                                ngModel.$render();
                            }else if (ngModel.$modelValue.length == 3) {
                                ngModel.$setViewValue(ngModel.$modelValue + '00');
                                ngModel.$render();
                            } else if (ngModel.$modelValue.length == 4) {
                                ngModel.$setViewValue(ngModel.$modelValue + '0');
                                ngModel.$render();
                            } else if (ngModel.$modelValue.length == 6) {
                                ngModel.$setViewValue(ngModel.$modelValue + '00');
                                ngModel.$render();
                            } else if (ngModel.$modelValue.length == 7) {
                                ngModel.$setViewValue(ngModel.$modelValue + '0');
                                ngModel.$render();
                            }
                        }
                        if((/^([0-2][0-9]):([0-5][0-9])?$/i.test(ngModel.$modelValue)) || (/^([0-2][0-9]):([0-5][0-9]):([0-5][0-9])?$/i.test(ngModel.$modelValue))){
                            ngModel.$setValidity("invalid", true)
                        }else{
                            ngModel.$setValidity("invalid", false)
                        }
                    }
                }), element.bind("keyup", function ($event) {
                    if(ngModel.$modelValue && $event.keyCode != 8) {
                        if (ngModel.$modelValue.length == 2 && /^([0-2][0-9])?$/i.test(ngModel.$modelValue)) {
                            if (ngModel.$modelValue > 24) {
                                ngModel.$setViewValue('24:00');
                            } else {
                                ngModel.$setViewValue(ngModel.$modelValue + ':');
                            }
                        } else if (ngModel.$modelValue.length == 5 && /^([0-2][0-9]):([0-5][0-9])?$/i.test(ngModel.$modelValue)) {
                            ngModel.$setViewValue(ngModel.$modelValue + ':');
                        } else {
                            if (ngModel.$modelValue.length > 1 && ngModel.$modelValue.length < 3 && !(/^([0-2][0-9])?$/i.test(ngModel.$modelValue))) {
                                ngModel.$setViewValue('');
                            } else if (ngModel.$modelValue.length == 5 && !(/^([0-2][0-9]):([0-5][0-9])?$/i.test(ngModel.$modelValue))) {
                                ngModel.$setViewValue(ngModel.$modelValue.substring(0, 3));
                            } else if (ngModel.$modelValue.length == 8 && !(/^([0-2][0-9]):([0-5][0-9]):([0-5][0-9])?$/i.test(ngModel.$modelValue))) {
                                ngModel.$setViewValue(ngModel.$modelValue.substring(0, 6));
                            }
                        }
                        ngModel.$render();

                    }
                })
            }
        }
    }

    angular.module("app").directive("a", e).directive("ngSpinnerBar", t).directive("uiInclude", i).value("uiJpConfig", {}).directive("uiNav", n).directive("checklistModel", a).directive("toggleView", r).directive("letterAvatar", o).directive("time", d).directive("time1", f).directive("validDateRegex", h).directive("validRegex", g).directive("validFilterRegex", m).directive("validHistoryFilterRegex", v).directive("validDailyPlanFilterRegex", p).directive("validTime", z).constant("defaultAvatarSettings", {
        alphabetcolors: ["#5A8770", "#B2B7BB", "#6FA9AB", "#F5AF29", "#0088B9", "#F18636", "#D93A37", "#A6B12E", "#5C9BBC", "#F5888D", "#9A89B5", "#407887", "#9A89B5", "#5A8770", "#D33F33", "#A2B01F", "#F0B126", "#0087BF", "#F18636", "#0087BF", "#B2B7BB", "#72ACAE", "#9C8AB4", "#5A8770", "#EEB424", "#407887"],
        textColor: "#ffffff",
        defaultBorder: "border:5px solid white",
        fontsize: 16,
        height: 35,
        width: 35,
        fontWeight: 400,
        charCount: 1,
        fontFamily: "HelveticaNeue-Light,Helvetica Neue Light,Helvetica Neue,Helvetica, Arial,Lucida Grande, sans-serif",
        base: "data:image/svg+xml;base64,",
        radius: "border-radius:50%;"
    }), t.$inject = ["$rootScope", "$state"], i.$inject = ["$http", "$templateCache", "$compile"], a.$inject = ["$parse", "$compile"], o.$inject = ["defaultAvatarSettings"], d.$inject = ["$timeout", "$filter"], f.$inject = ["$timeout", "$filter"]
}();
