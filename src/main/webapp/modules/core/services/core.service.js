!function () {
    "use strict";
    function e(e, r, t) {
        var o = "grid", s = !1, a = {}, i = {}, l = {};
        if (a._jobChain = {}, a._jobChain.filter = {}, a._jobChain.filter.state = "ALL", a._jobChain.filter.sortBy = "name", a._jobChain.reverse = !1, a._jobChain.currentPage = "1", a._jobChain.expand_to = [], a._jobChain.selectedView = !0, a._job = {}, a._job.filter = {}, a._job.filter.state = "ALL", a._job.filter.type = "ALL", a._job.filter.sortBy = "name", a._job.reverse = !1, a._job.currentPage = "1", a._job.expand_to = [], a._job.selectedView = !0, a._job.showTaskPanel = void 0, a._daliyPlan = {}, a._daliyPlan.filter = {}, a._daliyPlan.filter.status = "ALL",a._daliyPlan.filter.state = "", a._daliyPlan.filter.sortBy = "processedPlanned", a._daliyPlan.filter.range = "today", a._daliyPlan.range = "period", a._daliyPlan.reverse = !1, a._daliyPlan.currentPage = "1", a._daliyPlan.selectedView = !0, a._order = {}, a._order.filter = {}, a._order.filter.state = "ALL", a._order.filter.sortBy = "orderId", a._order.reverse = !1, a._order.currentPage = "1", a._order.expand_to = [], a._order.selectedView = !0, a._order.showLogPanel = void 0, a._order1 = {}, a._order1.filter = {}, a._order1.filter.sortBy = "orderId", a._order1.reverse = !1, a._orderDetail = {}, a._orderDetail.overview = !0, a._orderDetail.filter = {}, a._orderDetail.filter.sortBy = "orderId", a._orderDetail.reverse = !1, a._orderDetail.currentPage = "1", a._orderDetail.pageView = "grid", a._orderDetail.showErrorNodes = !0, a._orderDetail.showLogPanel = void 0, a._orderDetail.fitToScreen = !1, a._history = {}, a._history.order = {}, a._history.type = "jobChain", a._history.order.filter = {}, a._history.order.filter.historyStates = "all", a._history.order.filter.date = "today", a._history.order.filter.sortBy = "startTime", a._history.order.sortReverse = !0, a._history.order.currentPage = "1", a._history.order.selectedView = !0, a._history.task = {}, a._history.task.filter = {}, a._history.task.filter.historyStates = "all", a._history.task.filter.date = "today", a._history.task.filter.sortBy = "startTime", a._history.task.sortReverse = !0, a._history.task.currentPage = "1", a._history.task.selectedView = !0, a._auditLog = {}, a._auditLog.filter = {}, a._auditLog.filter.historyStates = "all", a._auditLog.filter.date = "today", a._auditLog.filter.sortBy = "created", a._auditLog.sortReverse = !0, a._auditLog.currentPage = "1", a._resource = {}, a._resource.agents = {}, a._resource.agents.filter = {}, a._resource.agents.filter.state = "all", a._resource.agents.filter.sortBy = "path", a._resource.agents.reverse = !1, a._resource.agents.currentPage = "1", a._resource.agents.expand_to = [], a._resource.locks = {}, a._resource.locks.filter = {}, a._resource.locks.filter.state = "all", a._resource.locks.filter.sortBy = "name", a._resource.locks.reverse = !1, a._resource.locks.currentPage = "1", a._resource.locks.expand_to = [], a._resource.processClasses = {}, a._resource.processClasses.filter = {}, a._resource.processClasses.filter.state = "all", a._resource.processClasses.filter.sortBy = "name", a._resource.processClasses.reverse = !1, a._resource.processClasses.currentPage = "1", a._resource.processClasses.expand_to = [],a._resource.calendar = {},a._resource.calendar.filter = {},a._resource.calendar.filter.state = "all",a._resource.calendar.filter.sortBy = "name",a._resource.calendar.reverse = !1,a._resource.calendar.currentPage = "1",a._resource.calendar.expand_to = [],  a._resource.schedules = {}, a._resource.schedules.filter = {}, a._resource.schedules.filter.state = "all", a._resource.schedules.filter.sortBy = "name",a._resource.schedules.reverse = !1,a._resource.schedules.currentPage = "1",a._resource.schedules.expand_to = [],a._resource.state = "agent",i._jobChain = {},i._jobChain.filter = {},i._jobChain.filter.state = "ALL",i._jobChain.filter.sortBy = "name",i._jobChain.reverse = !1,i._jobChain.currentPage = "1",i._jobChain.expand_to = [],i._jobChain.selectedView = !0,i._job = {},i._job.filter = {},i._job.filter.state = "ALL",i._job.filter.type = "ALL",i._job.filter.sortBy = "name",i._job.reverse = !1,i._job.currentPage = "1",i._job.expand_to = [],i._job.selectedView = !0,i._job.showTaskPanel = void 0,i._daliyPlan = {},i._daliyPlan.filter = {},i._daliyPlan.filter.status = "ALL",i._daliyPlan.filter.state = "",i._daliyPlan.filter.sortBy = "processedPlanned",i._daliyPlan.filter.range = "today",i._daliyPlan.range = "period",i._daliyPlan.reverse = !1,i._daliyPlan.currentPage = "1",i._daliyPlan.selectedView = !0,i._order = {},i._order.filter = {},i._order.filter.state = "ALL",i._order.filter.sortBy = "orderId",i._order.reverse = !1,i._order.currentPage = "1",i._order.expand_to = [],i._order.selectedView = !0,i._order.showLogPanel = void 0,i._order1 = {},i._order1.filter = {},i._order1.filter.sortBy = "orderId",i._order1.reverse = !1,i._orderDetail = {},i._orderDetail.overview = !0,i._orderDetail.filter = {},i._orderDetail.filter.state = "ALL",i._orderDetail.filter.sortBy = "orderId",i._orderDetail.reverse = !1,i._orderDetail.currentPage = "1",i._orderDetail.pageView = "grid",i._orderDetail.showErrorNodes = !0,i._orderDetail.fitToScreen = !1,i._orderDetail.showLogPanel = void 0,i._history = {},i._history.order = {},i._history.type = "jobChain",i._history.order.filter = {},i._history.order.filter.historyStates = "all",i._history.order.filter.date = "today",i._history.order.filter.sortBy = "startTime",i._history.order.sortReverse = !0,i._history.order.currentPage = "1",i._history.order.selectedView = !0,i._history.task = {},i._history.task.filter = {},i._history.task.filter.historyStates = "all",i._history.task.filter.date = "today",i._history.task.filter.sortBy = "startTime",i._history.task.sortReverse = !0,i._history.task.currentPage = "1",i._history.task.selectedView = !0,i._auditLog = {},i._auditLog.filter = {},i._auditLog.filter.historyStates = "all",i._auditLog.filter.date = "today",i._auditLog.filter.sortBy = "created",i._auditLog.sortReverse = !0,i._auditLog.currentPage = "1",i._resource = {},i._resource.agents = {},i._resource.agents.filter = {},i._resource.agents.filter.state = "all",i._resource.agents.filter.sortBy = "path",i._resource.agents.reverse = !1,i._resource.agents.currentPage = "1",i._resource.agents.expand_to = [],i._resource.locks = {},i._resource.locks.filter = {},i._resource.locks.filter.state = "all",i._resource.locks.filter.sortBy = "name",i._resource.locks.reverse = !1,i._resource.locks.currentPage = "1",i._resource.locks.expand_to = [],i._resource.processClasses = {},i._resource.processClasses.filter = {},i._resource.processClasses.filter.state = "all",i._resource.processClasses.filter.sortBy = "name",i._resource.processClasses.reverse = !1,i._resource.processClasses.currentPage = "1",i._resource.processClasses.expand_to = [],i._resource.calendar = {},i._resource.calendar.filter = {},i._resource.calendar.filter.state = "all",i._resource.calendar.filter.sortBy = "name",i._resource.calendar.reverse = !1,i._resource.calendar.currentPage = "1",i._resource.calendar.expand_to = [],i._resource.schedules = {},i._resource.schedules.filter = {},i._resource.schedules.filter.state = "all",i._resource.schedules.filter.sortBy = "name",i._resource.schedules.reverse = !1,i._resource.schedules.currentPage = "1",i._resource.schedules.expand_to = [],i._resource.state = "agent",l._dashboard = {},l._dashboard.filter = {},l._dashboard.filter.range = "today",l._dashboard.filter.orderRange = "today",l._dashboard.filter.orderSummaryfrom = "today",l._dashboard.filter.orderSummaryto = "today",l._dashboard.filter.orderRange = "today",l._dashboard.filter.label = "button.today",e.localStorage.$SOS$DASHBOARDTABS)try {
            var _ = JSON.parse(e.localStorage.$SOS$DASHBOARDTABS);
            _ && (l = _)
        } catch (n) {
            console.log(n)
        }
        return "true" == e.sessionStorage.$SOS$SIDEVIEW || 1 == e.sessionStorage.$SOS$SIDEVIEW ? s = e.sessionStorage.$SOS$SIDEVIEW : e.sessionStorage.$SOS$SIDEVIEW = !1, {
            getParams: function (e) {
                e = e.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
                var r = new RegExp("[\\?&]" + e + "=([^&#]*)"), t = r.exec(location.search);
                return null === t ? "" : decodeURIComponent(t[1].replace(/\+/g, " "))
            }, setSideView: function (r) {
                e.sessionStorage.$SOS$SIDEVIEW = r, s = r
            }, getSideView: function () {
                return !s
            }, setDefaultTab: function () {
                a = i
            }, getTabs: function () {
                return a
            }, getDashboard: function () {
                return l
            }, getJobTab: function () {
                return a._job
            }, getDailyPlanTab: function () {
                return a._daliyPlan
            }, getJobChainTab: function () {
                return a._jobChain
            }, getOrderTab: function () {
                return a._order
            }, getOrderTab1: function () {
                return a._order1
            }, getOrderDetailTab: function () {
                return a._orderDetail
            }, getHistoryTab: function () {
                return a._history
            }, getAuditLogTab: function () {
                return a._auditLog
            }, getDashboardTab: function () {
                return l._dashboard
            }, getResourceTab: function () {
                return a._resource
            }, getEvents: function (e) {
                var o = t.defer(), s = r("events");
                return s.save(e, function (e) {
                    o.resolve(e)
                }, function (e) {
                    o.reject(e)
                }), o.promise
            }
        }
    }

    function r(e) {
        function r() {
            var e = this;
            s.forEach(function (r) {
                e[r] = o(r)
            })
        }

        function t(e, r, t) {
            var o = a + r;
            null == t && (t = ""), e[o] = t
        }

        function o(r) {
            var t = a + r;
            return e.localStorage[t] || null
        }

        var s = ["jobChainFilters", "orderFilters", "jobFilters", "historyFilters", "dailyPlanFilters"], a = "$SOS$";
        return r.prototype.save = function () {
            var r = this, o = e.localStorage;
            s.forEach(function (e) {
                t(o, e, r[e])
            })
        }, r.prototype.setJobChain = function (e) {
            this.jobChainFilters = JSON.stringify(e)
        }, r.prototype.setOrder = function (e) {
            this.orderFilters = JSON.stringify(e)
        }, r.prototype.setJob = function (e) {
            this.jobFilters = JSON.stringify(e)
        }, r.prototype.setHistory = function (e) {
            this.historyFilters = JSON.stringify(e)
        }, r.prototype.setDailyPlan = function (e) {
            this.dailyPlanFilters = JSON.stringify(e)
        }, r.prototype.clearStorage = function () {
            s.forEach(function (r) {
                t(e.localStorage, r, null)
            })
        }, new r
    }

    angular.module("app").service("CoreService", e).service("SavedFilter", r), e.$inject = ["$window", "$resource", "$q"], r.$inject = ["$window"]
}();
