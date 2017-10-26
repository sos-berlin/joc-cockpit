!function (e, n) {
    "object" == typeof exports && "object" == typeof module ? module.exports = n(require("angular"), function () {
        try {
            return require("interact.js")
        } catch (e) {
        }
    }(), require("moment")) : "function" == typeof define && define.amd ? define(["angular", "interact", "moment"], n) : "object" == typeof exports ? exports.angularBootstrapCalendarModuleName = n(require("angular"), function () {
        try {
            return require("interact.js")
        } catch (e) {
        }
    }(), require("moment")) : e.angularBootstrapCalendarModuleName = n(e.angular, e.interact, e.moment)
}(this, function (e, n, t) {
    return function (e) {
        function n(a) {
            if (t[a])return t[a].exports;
            var l = t[a] = {exports: {}, id: a, loaded: !1};
            return e[a].call(l.exports, l, l.exports, n), l.loaded = !0, l.exports
        }

        var t = {};
        return n.m = e, n.c = t, n.p = "", n(0)
    }([function (e, n, t) {
        "use strict";
        function a(e) {
            e.keys().forEach(e)
        }

        t(8);
        var l = t(12), i = {}, d = t(13);
        d.keys().forEach(function (e) {
            var n = e.replace("./", ""), t = "mwl/" + n, a = n.replace(".html", "");
            i[a] = {cacheTemplateName: t, template: d(e)}
        }), e.exports = l.module("mwl.calendar", []).config(["calendarConfig", function (e) {
            l.forEach(i, function (n, t) {
                e.templates[t] || (e.templates[t] = n.cacheTemplateName)
            })
        }]).run(["$templateCache", "$interpolate", function (e, n) {
            l.forEach(i, function (t) {
                if (!e.get(t.cacheTemplateName)) {
                    var a = t.template.replace("{{", n.startSymbol()).replace("}}", n.endSymbol());
                    e.put(t.cacheTemplateName, a)
                }
            })
        }]).name, a(t(23)), a(t(38)), a(t(43))
    }, , , , , , , , function (e, n) {
    }, , , , function (n, t) {
        n.exports = e
    }, function (e, n, t) {
        function a(e) {
            return t(l(e))
        }

        function l(e) {
            return i[e] || function () {
                    throw new Error("Cannot find module '" + e + "'.")
                }()
        }

        var i = {
            "./calendar.html": 14,
            "./calendarDayView.html": 15,
            "./calendarHourList.html": 16,
            "./calendarMonthCell.html": 17,
            "./calendarMonthCellEvents.html": 18,
            "./calendarMonthView.html": 19,
            "./calendarSlideBox.html": 20,
            "./calendarWeekView.html": 21,
            "./calendarYearView.html": 22
        };
        a.keys = function () {
            return Object.keys(i)
        }, a.resolve = l, e.exports = a, a.id = 13
    }, function (e, n) {
        e.exports = '<div class="text-center m-t-lg" ng-if="!vm.templatesLoaded " style="height: 50px" > <div class="cssload-loading">Loading....</div> </div><div\n  class="cal-context"\n   ng-if="vm.templatesLoaded">\n\n  <div class="alert alert-danger" ng-hide="vm.viewDate">The value passed to view-date attribute of the calendar is not set</div>\n\n <div ng-hide="vm.view!==\'year\'"> <mwl-calendar-year\n    events="vm.events"\n    view-date="vm.viewDate"\n    plan-items="vm.planItems"\n    year-View="vm.yearView"\n view-period="vm.view"   offsets="vm.offsets"\n    on-event-click="vm.onEventClick"\n    on-event-times-changed="vm.onEventTimesChanged"\n    on-edit-event-click="vm.onEditEventClick"\n    on-delete-event-click="vm.onDeleteEventClick"\n    on-timespan-click="vm.onTimespanClick"\n    edit-event-html="vm.editEventHtml"\n    delete-event-html="vm.deleteEventHtml"\n    cell-is-open="vm.cellIsOpen"\n    cell-modifier="vm.cellModifier"\n    slide-box-disabled="vm.slideBoxDisabled"\n >\n  </mwl-calendar-year></div>\n\n <div ng-hide="vm.view!==\'month\'"> <mwl-calendar-month\n    events="vm.events"\n    view-date="vm.viewDate"\n    plan-items="vm.planItems"\n  view-period="vm.view"  on-event-click="vm.onEventClick"\n    on-event-times-changed="vm.onEventTimesChanged"\n    on-edit-event-click="vm.onEditEventClick"\n    on-delete-event-click="vm.onDeleteEventClick"\n    on-timespan-click="vm.onTimespanClick"\n    edit-event-html="vm.editEventHtml"\n    delete-event-html="vm.deleteEventHtml"\n    cell-is-open="vm.cellIsOpen"\n    cell-modifier="vm.cellModifier"\n    slide-box-disabled="vm.slideBoxDisabled"\n >\n  </mwl-calendar-month></div> <div ng-hide="vm.view!==\'week\'"> <mwl-calendar-week\n    events="vm.events"\n    view-date="vm.viewDate"\n    on-event-click="vm.onEventClick"\n    on-event-times-changed="vm.onEventTimesChanged"\n    day-view-start="vm.dayViewStart"\n    day-view-end="vm.dayViewEnd"\n    day-view-split="vm.dayViewSplit"\n    day-view-event-chunk-size="vm.dayViewEventChunkSize"\n    on-timespan-click="vm.onTimespanClick"\n >\n  </mwl-calendar-week></div>\n\n <div ng-hide="vm.view!==\'day\'"> <mwl-calendar-day\n    events="vm.events"\n    view-date="vm.viewDate"\n    on-event-click="vm.onEventClick"\n    on-event-times-changed="vm.onEventTimesChanged"\n    on-timespan-click="vm.onTimespanClick"\n    on-date-range-select="vm.onDateRangeSelect"\n    day-view-start="vm.dayViewStart"\n    day-view-end="vm.dayViewEnd"\n    day-view-split="vm.dayViewSplit"\n    day-view-event-chunk-size="vm.dayViewEventChunkSize"\n >\n  </mwl-calendar-day></div>\n</div>\n'
    }, function (e, n) {
        e.exports = '<div class="cal-week-box cal-all-day-events-box" ng-if="vm.allDayEvents.length > 0">\n  <div class="cal-day-panel clearfix">\n    <div class="row">\n      <div class="col-xs-12">\n        <div class="cal-row-fluid">\n          <div\n            class="cal-cell-6 day-highlight dh-event-{{ event.type }}"\n            data-event-class\n            ng-repeat="event in vm.allDayEvents track by event.$id">\n            <strong>\n              <span ng-bind="event.startsAt | calendarDate:\'datetime\':true"></span>\n              <span ng-if="event.endsAt">\n                - <span ng-bind="event.endsAt | calendarDate:\'datetime\':true"></span>\n              </span>\n            </strong>\n            <a\n              href="javascript:;"\n              class="event-item"\n              ng-bind-html="vm.$sce.trustAsHtml(event.title)">\n            </a>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n\n<div class="cal-day-box">\n  <div class="cal-day-panel clearfix" ng-style="{height: vm.dayViewHeight + \'px\'}">\n\n    <mwl-calendar-hour-list\n      day-view-start="vm.dayViewStart"\n      day-view-end="vm.dayViewEnd"\n      day-view-split="vm.dayViewSplit"\n      on-timespan-click="vm.onTimespanClick"\n      on-date-range-select="vm.onDateRangeSelect"\n      on-event-times-changed="vm.onEventTimesChanged"\n      view-date="vm.viewDate">\n    </mwl-calendar-hour-list>\n\n    <div\n      class="pull-left day-event day-highlight"\n      ng-repeat="event in vm.nonAllDayEvents track by event.$id"\n      ng-class="\'dh-event-\' + event.type + \' \' + event.cssClass"\n      ng-style="{top: event.top + \'px\', left: event.left + 60 + \'px\', height: event.height + \'px\'}"\n      mwl-draggable="event.draggable === true"\n      axis="\'xy\'"\n      snap-grid="{y: vm.dayViewEventChunkSize || 30, x: 50}"\n      on-drag="vm.eventDragged(event, y / 30)"\n      on-drag-end="vm.eventDragComplete(event, y / 30)"\n      mwl-resizable="event.resizable === true && event.endsAt"\n      resize-edges="{top: true, bottom: true}"\n      on-resize="vm.eventResized(event, edge, y / 30)"\n      on-resize-end="vm.eventResizeComplete(event, edge, y / 30)">\n\n      <span class="cal-hours">\n        <span ng-show="event.top == 0"><span ng-bind="(event.tempStartsAt || event.startsAt) | calendarDate:\'day\':true"></span>, </span>\n        <span ng-bind="(event.tempStartsAt || event.startsAt) | calendarDate:\'time\':true"></span>\n      </span>\n      <a href="javascript:;" class="event-item" ng-click="vm.onEventClick({calendarEvent: event})">\n        <span ng-bind-html="vm.$sce.trustAsHtml(event.title) | calendarTruncateEventTitle:20:event.height"></span>\n      </a>\n\n    </div>\n\n  </div>\n\n</div>\n'
    }, function (e, n) {
        e.exports = '<div class="cal-day-panel-hour">\n\n  <div class="cal-day-hour" ng-repeat="hour in vm.hours track by $index">\n\n    <div\n      class="cal-day-hour-part"\n      ng-class="{ \'cal-day-hour-part-selected\': vm.dateRangeSelect &&\n                vm.dateRangeSelect.startDate <= vm.getClickedDate(hour.date, vm.dayViewSplit * $index) &&\n                vm.getClickedDate(hour.date, vm.dayViewSplit * $index) < vm.dateRangeSelect.endDate }"\n      ng-repeat="chunk in vm.hourChunks track by chunk"\n      ng-click="vm.onTimespanClick({calendarDate: vm.getClickedDate(hour.date, vm.dayViewSplit * $index)})"\n      mwl-droppable\n  on-drop="vm.eventDropped(dropData.event, vm.getClickedDate(hour.date, vm.dayViewSplit * $index))"\n      mwl-drag-select="!!vm.onDateRangeSelect"\n      on-drag-select-start="vm.onDragSelectStart(vm.getClickedDate(hour.date, vm.dayViewSplit * $index))"\n      on-drag-select-move="vm.onDragSelectMove(vm.getClickedDate(hour.date, vm.dayViewSplit * ($index + 1)))"\n      on-drag-select-end="vm.onDragSelectEnd(vm.getClickedDate(hour.date, vm.dayViewSplit * ($index + 1)))"\n      ng-if="!vm.dayWidth">\n      <div class="cal-day-hour-part-time">\n        <strong ng-bind="hour.label" ng-show="$first"></strong>\n      </div>\n    </div>\n\n    <div\n      class="cal-day-hour-part"\n      ng-repeat="chunk in vm.hourChunks track by chunk"\n      ng-if="vm.dayWidth">\n      <div class="cal-day-hour-part-time">\n        <strong ng-bind="hour.label" ng-show="$first"></strong>\n      </div>\n      <div\n        class="cal-day-hour-part-spacer"\n        ng-repeat="dayIndex in [0, 1, 2, 3, 4, 5, 6]"\n        ng-style="{width: vm.dayWidth + \'px\'}"\n        ng-click="vm.onTimespanClick({calendarDate: vm.getClickedDate(hour.date, vm.dayViewSplit * $parent.$index, dayIndex)})"\n        mwl-droppable\n        on-drop="vm.eventDropped(dropData.event, vm.getClickedDate(hour.date, vm.dayViewSplit * $parent.$index, dayIndex))">\n      </div>\n    </div>\n\n  </div>\n\n</div>\n'
    }, function (e, n) {
        e.exports = '<div\n  mwl-droppable\n  on-drop="vm.handleEventDrop(dropData.event, day.date, dropData.draggedFromDate)"\n  class="cal-month-day"\n  ng-class="{\n    \'cal-day-outmonth\': !day.inMonth,\n    \'cal-day-inmonth\': day.inMonth,\n    \'cal-day-weekend\': day.isWeekend,\n    \'cal-day-past\': day.isPast,\n    \'cal-day-today\': day.isToday,\n    \'cal-day-future\': day.isFuture,\n    \'cal-day-plan\': day.isPlanData,\n \'cal-day-exclude\': day.isExclude\n }">\n\n <small\n    class="cal-events-num badge badge-important pull-left"\n    ng-show="day.badgeTotal > 0"\n    ng-bind="day.badgeTotal">\n  </small>\n\n  <div style="overflow: auto"><span\n    class="pull-right m-t-xs"\n  data-cal-date\n   ng-bind="day.label">\n </span></div>\n\n <div class="p-l-xs" ng-hide="vm.viewPeriod!==\'month\'" style="overflow: auto;height: 60px"  ><div ng-repeat="hour in day.hours | orderBy:[\'plannedStartTime\',\'orderId\']" class="text-xs" title="{{hour.orderId}}" >{{hour.plannedStartTime | date:hour.format}}</div></div> <div class="cal-day-tick" ng-show="dayIndex === vm.openDayIndex && vm.view[vm.openDayIndex].events.length > 0 && !vm.slideBoxDisabled">\n    <i class="glyphicon glyphicon-chevron-up"></i>\n    <i class="fa fa-chevron-up"></i>\n  </div>\n\n  <ng-include src="vm.calendarConfig.templates.calendarMonthCellEvents"></ng-include>\n\n  <div id="cal-week-box" ng-if="$first && rowHovered">\n    <span ng-bind="vm.calendarConfig.i18nStrings.weekNumber.replace(\'{week}\', day.date.clone().add(1, \'day\').isoWeek())"></span>\n  </div>\n\n</div>\n'
    }, function (e, n) {
        e.exports = '<div class="events-list" ng-show="day.events.length > 0">\n  <a\n    ng-repeat="event in day.events | orderBy:\'startsAt\' track by event.$id"\n    href="javascript:;"\n    ng-click="$event.stopPropagation(); vm.onEventClick({calendarEvent: event})"\n    class="pull-left event"\n    ng-class="\'event-\' + event.type + \' \' + event.cssClass"\n    ng-mouseenter="vm.highlightEvent(event, true)"\n    ng-mouseleave="vm.highlightEvent(event, false)"\n    tooltip-append-to-body="true"\n    uib-tooltip-html="((event.startsAt | calendarDate:\'time\':true) + (vm.calendarConfig.displayEventEndTimes && event.endsAt ? \' - \' + (event.endsAt | calendarDate:\'time\':true) : \'\') + \' - \' + event.title) | calendarTrustAsHtml"\n    mwl-draggable="event.draggable === true"\n    drop-data="{event: event, draggedFromDate: day.date.toDate()}">\n  </a>\n</div>\n'
    }, function (e, n) {
        e.exports = '<div class="cal-row-fluid cal-row-head">\n\n  <div class="cal-cell1" ng-repeat="day in vm.weekDays track by $index" ng-bind="day"></div>\n\n</div>\n<div class="cal-month-box">\n\n  <div\n    ng-repeat="rowOffset in vm.monthOffsets track by rowOffset"\n    ng-mouseenter="rowHovered = true"\n    ng-mouseleave="rowHovered = false">\n    <div class="cal-row-fluid cal-before-eventlist">\n      <div\n        ng-repeat="day in vm.view | calendarLimitTo:7:rowOffset track by $index"\n        ng-init="dayIndex = vm.view.indexOf(day)"\n        class="cal-cell1 cal-cell {{ day.highlightClass }}"\n        ng-click="vm.dayClicked(day, false, $event)"\n        ng-class="{pointer: day.events.length > 0}">\n        <ng-include src="vm.calendarConfig.templates.calendarMonthCell"></ng-include>\n      </div>\n    </div>\n\n    <mwl-calendar-slide-box\n      is-open="vm.openRowIndex === $index && vm.view[vm.openDayIndex].events.length > 0 && !vm.slideBoxDisabled"\n      events="vm.view[vm.openDayIndex].events"\n      on-event-click="vm.onEventClick"\n      edit-event-html="vm.editEventHtml"\n      on-edit-event-click="vm.onEditEventClick"\n      delete-event-html="vm.deleteEventHtml"\n      on-delete-event-click="vm.onDeleteEventClick">\n    </mwl-calendar-slide-box>\n\n  </div>\n\n</div>\n'
    }, function (e, n) {
        e.exports = '<div class="cal-slide-box" uib-collapse="vm.isCollapsed" mwl-collapse-fallback="vm.isCollapsed">\n  <div class="cal-slide-content cal-event-list">\n    <ul class="unstyled list-unstyled">\n\n      <li\n        ng-repeat="event in vm.events | orderBy:\'startsAt\' track by event.$id"\n        ng-class="event.cssClass"\n        mwl-draggable="event.draggable === true"\n        drop-data="{event: event}">\n        <span class="pull-left event" ng-class="\'event-\' + event.type"></span>\n        &nbsp;\n        <a\n          href="javascript:;"\n          class="event-item"\n          ng-click="vm.onEventClick({calendarEvent: event})">\n          <span ng-bind-html="vm.$sce.trustAsHtml(event.title)"></span>\n          (<span ng-bind="event.startsAt | calendarDate:(isMonthView ? \'time\' : \'datetime\'):true"></span><span ng-if="vm.calendarConfig.displayEventEndTimes && event.endsAt"> - <span ng-bind="event.endsAt | calendarDate:(isMonthView ? \'time\' : \'datetime\'):true"></span></span>)\n        </a>\n\n        <a\n          href="javascript:;"\n          class="event-item-edit"\n          ng-if="vm.editEventHtml && event.editable !== false"\n          ng-bind-html="vm.$sce.trustAsHtml(vm.editEventHtml)"\n          ng-click="vm.onEditEventClick({calendarEvent: event})">\n        </a>\n\n        <a\n          href="javascript:;"\n          class="event-item-delete"\n          ng-if="vm.deleteEventHtml && event.deletable !== false"\n          ng-bind-html="vm.$sce.trustAsHtml(vm.deleteEventHtml)"\n          ng-click="vm.onDeleteEventClick({calendarEvent: event})">\n        </a>\n      </li>\n\n    </ul>\n  </div>\n</div>\n'
    }, function (e, n) {
        e.exports = '<div class="cal-week-box" ng-class="{\'cal-day-box\': vm.showTimes}">\n  <div class="cal-row-fluid cal-row-head">\n\n    <div\n      class="cal-cell1"\n      ng-repeat="day in vm.view.days track by $index"\n      ng-class="{\n        \'cal-day-weekend\': day.isWeekend,\n        \'cal-day-past\': day.isPast,\n        \'cal-day-today\': day.isToday,\n        \'cal-day-future\': day.isFuture}"\n      mwl-element-dimensions="vm.dayColumnDimensions"\n      mwl-droppable\n      on-drop="vm.eventDropped(dropData.event, day.date)">\n\n      <span ng-bind="day.weekDayLabel"></span>\n      <br>\n      <small>\n  <span\n    data-cal-date\n   class="pointer"\n          ng-bind="day.dayLabel">\n        </span>\n      </small>\n\n    </div>\n\n  </div>\n\n  <div class="cal-day-panel clearfix" ng-style="{height: vm.showTimes ? (vm.dayViewHeight + \'px\') : \'auto\'}">\n\n    <mwl-calendar-hour-list\n      day-view-start="vm.dayViewStart"\n      day-view-end="vm.dayViewEnd"\n      day-view-split="vm.dayViewSplit"\n      day-width="vm.dayColumnDimensions.width"\n      view-date="vm.viewDate"\n      on-timespan-click="vm.onTimespanClick"\n      ng-if="vm.showTimes">\n    </mwl-calendar-hour-list>\n\n    <div class="row">\n      <div class="col-xs-12">\n        <div\n          class="cal-row-fluid"\n          ng-repeat="event in vm.view.events track by event.$id">\n          <div\n            ng-class="\'cal-cell\' + (vm.showTimes ? 1 : event.daySpan) + (vm.showTimes ? \'\' : \' cal-offset\' + event.dayOffset) + \' day-highlight dh-event-\' + event.type + \' \' + event.cssClass"\n            ng-style="{\n              top: vm.showTimes ? ((event.top + 2) + \'px\') : \'auto\',\n              position: vm.showTimes ? \'absolute\' : \'inherit\',\n              width: vm.showTimes ? (vm.dayColumnDimensions.width + \'px\') : \'\',\n              left: vm.showTimes ? (vm.dayColumnDimensions.width * event.dayOffset) + 15 + \'px\' : \'\'\n            }"\n            data-event-class\n            mwl-draggable="event.draggable === true"\n            axis="vm.showTimes ? \'xy\' : \'x\'"\n            snap-grid="vm.showTimes ? {x: vm.dayColumnDimensions.width, y: vm.dayViewEventChunkSize || 30} : {x: vm.dayColumnDimensions.width}"\n            on-drag="vm.tempTimeChanged(event, y / 30)"\n            on-drag-end="vm.weekDragged(event, x / vm.dayColumnDimensions.width, y / 30)"\n            mwl-resizable="event.resizable === true && event.endsAt && !vm.showTimes"\n            resize-edges="{left: true, right: true}"\n            on-resize-end="vm.weekResized(event, edge, x / vm.dayColumnDimensions.width)">\n            <strong ng-bind="(event.tempStartsAt || event.startsAt) | calendarDate:\'time\':true" ng-show="vm.showTimes"></strong>\n            <a\n              href="javascript:;"\n              ng-click="vm.onEventClick({calendarEvent: event})"\n              class="event-item"\n              ng-bind-html="vm.$sce.trustAsHtml(event.title)"\n              uib-tooltip-html="event.title | calendarTrustAsHtml"\n              tooltip-placement="left"\n              tooltip-append-to-body="true">\n            </a>\n          </div>\n        </div>\n      </div>\n\n    </div>\n\n  </div>\n</div>\n'
    }, function (e, n) {
        e.exports = '<div class="hide text-center m-t-lg" ng-class="{show:!vm.loadingDone}" style="position: absolute; top:50%;z-index:999" > <div class="loading-img1 m-t-lg"></div></div><div class="cal-year-box">\n  <div ng-repeat="rowOffset in [0] track by rowOffset">\n    <div class="row cal-before-eventlist">\n      <div\n        class="span3 col-md-3 col-xs-6 cal-cell {{ day.cssClass }}"\n             ng-init="monthIndex = vm.view.indexOf(vm.view[0])"\n        ng-click="vm.monthClicked(vm.view[0], false, $event)"\n        ng-class="{pointer: vm.view[0].events.length > 0, \'cal-day-today\': vm.view[0].isToday}"\n        mwl-droppable\n       ">\n\n        <div\n   class="month-name"\n          data-cal-date\n  ng-bind="vm.view[0].label || \'January\' ">\n        </div>\n        <div\n        class="cal-row-fluid cal-row-head"\n>        <div\n          class="cal-cell1"\n          ng-repeat="day in vm.weekDays track by $index"\n          ng-bind="day">\n        </div>\n        </div>\n\n        <div\n        class="cal-month-box">\n        <div\n      ng-repeat="rowOffset in vm.view[0].monthOffsets track by rowOffset">\n        <div\n        class="cal-row-fluid cal-before-eventlist">\n        <div\n   ng-click="vm.calendarCtrl.dateClicked(1,day)"\n   ng-repeat="day in vm.view[0].monthData | calendarLimitTo:7:rowOffset track by $index"\n        class="cal-cell1 cal-cell {{ day.highlightClass }}"\n        ng-class="{pointer: day.events.length > 0}">\n   <ng-include src="vm.calendarConfig.templates.calendarMonthCell"></ng-include>\n        </div>\n        </div>\n\n        <mwl-calendar-slide-box\n      is-open="vm.openRowIndex === $index && vm.view[vm.openDayIndex].events.length > 0 && !vm.slideBoxDisabled"\n      events="vm.view[vm.openDayIndex].events"\n      on-event-click="vm.onEventClick"\n      edit-event-html="vm.editEventHtml"\n      on-edit-event-click="vm.onEditEventClick"\n      delete-event-html="vm.deleteEventHtml"\n      on-delete-event-click="vm.onDeleteEventClick">\n    </mwl-calendar-slide-box>\n\n        </div>\n        </div>\n        <small\n          class="cal-events-num badge badge-important pull-left"\n          ng-show="vm.view[0].badgeTotal > 0"\n          ng-bind="vm.view[0].badgeTotal">\n        </small>\n\n        <div\n          class="cal-day-tick"\n          ng-show="monthIndex === vm.openMonthIndex && vm.view[vm.openMonthIndex].events.length > 0 && !vm.slideBoxDisabled">\n          <i class="glyphicon glyphicon-chevron-up"></i>\n          <i class="fa fa-chevron-up"></i>\n        </div>\n\n      </div>\n   <div\n        class="span3 col-md-3 col-xs-6 cal-cell {{ day.cssClass }}"\n         ng-init="monthIndex = vm.view.indexOf(vm.view[1])"\n        ng-click="vm.monthClicked(vm.view[1], false, $event)"\n        ng-class="{pointer: vm.view[1].events.length > 0, \'cal-day-today\': vm.view[1].isToday}"\n        mwl-droppable\n    >\n\n       <div\n   class="month-name"\n          data-cal-date\n   ng-bind="vm.view[1].label || \'February\'">\n        </div>\n        <div\n        class="cal-row-fluid cal-row-head"\n>        <div\n          class="cal-cell1"\n          ng-repeat="day in vm.weekDays track by $index"\n          ng-bind="day">\n        </div>\n        </div>\n\n        <div\n        class="cal-month-box">\n        <div\n       ng-repeat="rowOffset in vm.view[1].monthOffsets track by rowOffset">\n        <div\n        class="cal-row-fluid cal-before-eventlist">\n        <div\n   ng-click="vm.calendarCtrl.dateClicked(2,day)"\n      ng-repeat="day in vm.view[1].monthData | calendarLimitTo:7:rowOffset track by $index"\n        class="cal-cell1 cal-cell {{ day.highlightClass }}"\n        ng-class="{pointer: day.events.length > 0}">\n        <ng-include src="vm.calendarConfig.templates.calendarMonthCell"></ng-include>\n        </div>\n        </div>\n\n        <mwl-calendar-slide-box\n      is-open="vm.openRowIndex === $index && vm.view[vm.openDayIndex].events.length > 0 && !vm.slideBoxDisabled"\n      events="vm.view[vm.openDayIndex].events"\n      on-event-click="vm.onEventClick"\n      edit-event-html="vm.editEventHtml"\n      on-edit-event-click="vm.onEditEventClick"\n      delete-event-html="vm.deleteEventHtml"\n      on-delete-event-click="vm.onDeleteEventClick">\n    </mwl-calendar-slide-box>\n\n        </div>\n        </div>\n        <small\n          class="cal-events-num badge badge-important pull-left"\n          ng-show="vm.view[1].badgeTotal > 0"\n          ng-bind="vm.view[1].badgeTotal">\n        </small>\n\n        <div\n          class="cal-day-tick"\n          ng-show="monthIndex === vm.openMonthIndex && vm.view[vm.openMonthIndex].events.length > 0 && !vm.slideBoxDisabled">\n          <i class="glyphicon glyphicon-chevron-up"></i>\n          <i class="fa fa-chevron-up"></i>\n        </div>\n\n      </div><div\n        class="span3 col-md-3 col-xs-6 cal-cell {{ day.cssClass }}"\n ng-init="monthIndex = vm.view.indexOf(vm.view[2])"\n        ng-click="vm.monthClicked(vm.view[2], false, $event)"\n        ng-class="{pointer: vm.view[2].events.length > 0, \'cal-day-today\': vm.view[2].isToday}"\n        mwl-droppable\n     >\n\n        <div\n   class="month-name"\n          data-cal-date\n         ng-bind="vm.view[2].label || \'March\'">\n        </div>\n        <div\n        class="cal-row-fluid cal-row-head"\n>        <div\n          class="cal-cell1"\n          ng-repeat="day in vm.weekDays track by $index"\n          ng-bind="day">\n        </div>\n        </div>\n\n        <div\n        class="cal-month-box">\n        <div\n      ng-repeat="rowOffset in vm.view[2].monthOffsets track by rowOffset">\n        <div\n        class="cal-row-fluid cal-before-eventlist">\n        <div\n     ng-click="vm.calendarCtrl.dateClicked(3,day)"\n     ng-repeat="day in vm.view[2].monthData | calendarLimitTo:7:rowOffset track by $index"\n        class="cal-cell1 cal-cell {{ day.highlightClass }}"\n        ng-class="{pointer: day.events.length > 0}">\n        <ng-include src="vm.calendarConfig.templates.calendarMonthCell"></ng-include>\n        </div>\n        </div>\n\n        <mwl-calendar-slide-box\n      is-open="vm.openRowIndex === $index && vm.view[vm.openDayIndex].events.length > 0 && !vm.slideBoxDisabled"\n      events="vm.view[vm.openDayIndex].events"\n      on-event-click="vm.onEventClick"\n      edit-event-html="vm.editEventHtml"\n      on-edit-event-click="vm.onEditEventClick"\n      delete-event-html="vm.deleteEventHtml"\n      on-delete-event-click="vm.onDeleteEventClick">\n    </mwl-calendar-slide-box>\n\n        </div>\n        </div>\n        <small\n          class="cal-events-num badge badge-important pull-left"\n          ng-show="vm.view[2].badgeTotal > 0"\n          ng-bind="vm.view[2].badgeTotal">\n        </small>\n\n        <div\n          class="cal-day-tick"\n          ng-show="monthIndex === vm.openMonthIndex && vm.view[vm.openMonthIndex].events.length > 0 && !vm.slideBoxDisabled">\n          <i class="glyphicon glyphicon-chevron-up"></i>\n          <i class="fa fa-chevron-up"></i>\n        </div>\n\n      </div><div\n        class="span3 col-md-3 col-xs-6 cal-cell {{ day.cssClass }}"\n            ng-init="monthIndex = vm.view.indexOf(vm.view[3])"\n        ng-click="vm.monthClicked(vm.view[3], false, $event)"\n        ng-class="{pointer: vm.view[3].events.length > 0, \'cal-day-today\': vm.view[3].isToday}"\n        mwl-droppable\n   >\n\n        <div\n   class="month-name"\n          data-cal-date\n         ng-bind="vm.view[3].label || \'April\'">\n        </div>\n        <div\n        class="cal-row-fluid cal-row-head"\n>        <div\n          class="cal-cell1"\n          ng-repeat="day in vm.weekDays track by $index"\n          ng-bind="day">\n        </div>\n        </div>\n\n        <div\n        class="cal-month-box">\n        <div\n       ng-repeat="rowOffset in vm.view[3].monthOffsets track by rowOffset">\n        <div\n        class="cal-row-fluid cal-before-eventlist">\n        <div\n    ng-click="vm.calendarCtrl.dateClicked(4,day)"\n     ng-repeat="day in vm.view[3].monthData | calendarLimitTo:7:rowOffset track by $index"\n        class="cal-cell1 cal-cell {{ day.highlightClass }}"\n        ng-class="{pointer: day.events.length > 0}">\n        <ng-include src="vm.calendarConfig.templates.calendarMonthCell"></ng-include>\n        </div>\n        </div>\n\n        <mwl-calendar-slide-box\n      is-open="vm.openRowIndex === $index && vm.view[vm.openDayIndex].events.length > 0 && !vm.slideBoxDisabled"\n      events="vm.view[vm.openDayIndex].events"\n      on-event-click="vm.onEventClick"\n      edit-event-html="vm.editEventHtml"\n      on-edit-event-click="vm.onEditEventClick"\n      delete-event-html="vm.deleteEventHtml"\n      on-delete-event-click="vm.onDeleteEventClick">\n    </mwl-calendar-slide-box>\n\n        </div>\n        </div>\n        <small\n          class="cal-events-num badge badge-important pull-left"\n          ng-show="vm.view[3].badgeTotal > 0"\n          ng-bind="vm.view[3].badgeTotal">\n        </small>\n\n        <div\n          class="cal-day-tick"\n          ng-show="monthIndex === vm.openMonthIndex && vm.view[vm.openMonthIndex].events.length > 0 && !vm.slideBoxDisabled">\n          <i class="glyphicon glyphicon-chevron-up"></i>\n          <i class="fa fa-chevron-up"></i>\n        </div>\n\n      </div> </div>\n\n    <mwl-calendar-slide-box\n      is-open="vm.openRowIndex === $index && vm.view[vm.openMonthIndex].events.length > 0 && !vm.slideBoxDisabled"\n      events="vm.view[vm.openMonthIndex].events"\n      on-event-click="vm.onEventClick"\n      edit-event-html="vm.editEventHtml"\n      on-edit-event-click="vm.onEditEventClick"\n      delete-event-html="vm.deleteEventHtml"\n      on-delete-event-click="vm.onDeleteEventClick">\n    </mwl-calendar-slide-box>\n\n  </div>\n\n<div ng-repeat="rowOffset in [4] track by rowOffset">\n    <div class="row cal-before-eventlist">\n      <div\n        class="span3 col-md-3 col-xs-6 cal-cell {{ day.cssClass }}"\n        ng-init="monthIndex = vm.view.indexOf(vm.view[4])"\n        ng-click="vm.monthClicked(vm.view[4], false, $event)"\n        ng-class="{pointer: vm.view[4].events.length > 0, \'cal-day-today\': vm.view[4].isToday}"\n        mwl-droppable\n  >\n\n   <div\n   class="month-name"\n   data-cal-date\n        ng-bind="vm.view[4].label || \'May\'">\n        </div>\n        <div\n        class="cal-row-fluid cal-row-head"\n>        <div\n          class="cal-cell1"\n          ng-repeat="day in vm.weekDays track by $index"\n          ng-bind="day">\n        </div>\n        </div>\n\n        <div\n        class="cal-month-box">\n        <div\n    ng-repeat="rowOffset in vm.view[4].monthOffsets track by rowOffset">\n        <div\n        class="cal-row-fluid cal-before-eventlist">\n        <div\n   ng-click="vm.calendarCtrl.dateClicked(5,day)"\n     ng-repeat="day in vm.view[4].monthData | calendarLimitTo:7:rowOffset track by $index"\n        class="cal-cell1 cal-cell {{ day.highlightClass }}"\n        ng-class="{pointer: day.events.length > 0}">\n        <ng-include src="vm.calendarConfig.templates.calendarMonthCell"></ng-include>\n        </div>\n        </div>\n\n        <mwl-calendar-slide-box\n      is-open="vm.openRowIndex === $index && vm.view[vm.openDayIndex].events.length > 0 && !vm.slideBoxDisabled"\n      events="vm.view[vm.openDayIndex].events"\n      on-event-click="vm.onEventClick"\n      edit-event-html="vm.editEventHtml"\n      on-edit-event-click="vm.onEditEventClick"\n      delete-event-html="vm.deleteEventHtml"\n      on-delete-event-click="vm.onDeleteEventClick">\n    </mwl-calendar-slide-box>\n\n        </div>\n        </div>\n        <small\n          class="cal-events-num badge badge-important pull-left"\n          ng-show="vm.view[4].badgeTotal > 0"\n          ng-bind="vm.view[4].badgeTotal">\n        </small>\n\n        <div\n          class="cal-day-tick"\n          ng-show="monthIndex === vm.openMonthIndex && vm.view[vm.openMonthIndex].events.length > 0 && !vm.slideBoxDisabled">\n          <i class="glyphicon glyphicon-chevron-up"></i>\n          <i class="fa fa-chevron-up"></i>\n        </div>\n\n      </div>\n  <div\n        class="span3 col-md-3 col-xs-6 cal-cell {{ day.cssClass }}"\n         ng-init="monthIndex = vm.view.indexOf(vm.view[5])"\n        ng-click="vm.monthClicked(vm.view[5], false, $event)"\n        ng-class="{pointer: vm.view[5].events.length > 0, \'cal-day-today\': vm.view[5].isToday}"\n        mwl-droppable\n   >\n\n       <div\n   class="month-name"\n          data-cal-date\n             ng-bind="vm.view[5].label || \'June\'">\n        </div>\n        <div\n        class="cal-row-fluid cal-row-head"\n>        <div\n          class="cal-cell1"\n      ng-repeat="day in vm.weekDays track by $index"\n  ng-bind="day">\n        </div>\n        </div>\n\n        <div\n        class="cal-month-box">\n        <div\n   ng-repeat="rowOffset in vm.view[5].monthOffsets track by rowOffset">\n        <div\n        class="cal-row-fluid cal-before-eventlist">\n        <div\n    ng-click="vm.calendarCtrl.dateClicked(6,day)"\n     ng-repeat="day in vm.view[5].monthData | calendarLimitTo:7:rowOffset track by $index"\n        class="cal-cell1 cal-cell {{ day.highlightClass }}"\n        ng-class="{pointer: day.events.length > 0}">\n        <ng-include src="vm.calendarConfig.templates.calendarMonthCell"></ng-include>\n        </div>\n        </div>\n\n        <mwl-calendar-slide-box\n      is-open="vm.openRowIndex === $index && vm.view[vm.openDayIndex].events.length > 0 && !vm.slideBoxDisabled"\n      events="vm.view[vm.openDayIndex].events"\n      on-event-click="vm.onEventClick"\n      edit-event-html="vm.editEventHtml"\n      on-edit-event-click="vm.onEditEventClick"\n      delete-event-html="vm.deleteEventHtml"\n      on-delete-event-click="vm.onDeleteEventClick">\n    </mwl-calendar-slide-box>\n\n        </div>\n        </div>\n        <small\n          class="cal-events-num badge badge-important pull-left"\n          ng-show="vm.view[5].badgeTotal > 0"\n          ng-bind="vm.view[5].badgeTotal">\n        </small>\n\n        <div\n          class="cal-day-tick"\n          ng-show="monthIndex === vm.openMonthIndex && vm.view[vm.openMonthIndex].events.length > 0 && !vm.slideBoxDisabled">\n          <i class="glyphicon glyphicon-chevron-up"></i>\n          <i class="fa fa-chevron-up"></i>\n        </div>\n\n      </div><div\n        class="span3 col-md-3 col-xs-6 cal-cell {{ day.cssClass }}"\n ng-init="monthIndex = vm.view.indexOf(vm.view[6])"\n        ng-click="vm.monthClicked(vm.view[6], false, $event)"\n        ng-class="{pointer: vm.view[6].events.length > 0, \'cal-day-today\': vm.view[6].isToday}"\n        mwl-droppable\n   >\n\n        <div\n   class="month-name"\n          data-cal-date\n            ng-bind="vm.view[6].label || \'July\'">\n        </div>\n        <div\n        class="cal-row-fluid cal-row-head"\n>        <div\n          class="cal-cell1"\n          ng-repeat="day in vm.weekDays track by $index"\n          ng-bind="day">\n        </div>\n        </div>\n\n        <div\n        class="cal-month-box">\n        <div\n        ng-repeat="rowOffset in vm.view[6].monthOffsets track by rowOffset">\n        <div\n        class="cal-row-fluid cal-before-eventlist">\n        <div\n   ng-click="vm.calendarCtrl.dateClicked(7,day)"\n     ng-repeat="day in vm.view[6].monthData | calendarLimitTo:7:rowOffset track by $index"\n        class="cal-cell1 cal-cell {{ day.highlightClass }}"\n        ng-class="{pointer: day.events.length > 0}">\n        <ng-include src="vm.calendarConfig.templates.calendarMonthCell"></ng-include>\n        </div>\n        </div>\n\n        <mwl-calendar-slide-box\n      is-open="vm.openRowIndex === $index && vm.view[vm.openDayIndex].events.length > 0 && !vm.slideBoxDisabled"\n      events="vm.view[vm.openDayIndex].events"\n      on-event-click="vm.onEventClick"\n      edit-event-html="vm.editEventHtml"\n      on-edit-event-click="vm.onEditEventClick"\n      delete-event-html="vm.deleteEventHtml"\n      on-delete-event-click="vm.onDeleteEventClick">\n    </mwl-calendar-slide-box>\n\n        </div>\n        </div>\n        <small\n          class="cal-events-num badge badge-important pull-left"\n          ng-show="vm.view[6].badgeTotal > 0"\n          ng-bind="vm.view[6].badgeTotal">\n        </small>\n\n        <div\n          class="cal-day-tick"\n          ng-show="monthIndex === vm.openMonthIndex && vm.view[vm.openMonthIndex].events.length > 0 && !vm.slideBoxDisabled">\n          <i class="glyphicon glyphicon-chevron-up"></i>\n          <i class="fa fa-chevron-up"></i>\n        </div>\n\n      </div><div\n        class="span3 col-md-3 col-xs-6 cal-cell {{ day.cssClass }}"\n            ng-init="monthIndex = vm.view.indexOf(vm.view[7])"\n        ng-click="vm.monthClicked(vm.view[7], false, $event)"\n        ng-class="{pointer: vm.view[7].events.length > 0, \'cal-day-today\': vm.view[7].isToday}"\n        mwl-droppable\n  >\n\n        <div\n   class="month-name"\n          data-cal-date\n         ng-bind="vm.view[7].label || \'August\'">\n        </div>\n        <div\n        class="cal-row-fluid cal-row-head"\n>        <div\n          class="cal-cell1"\n          ng-repeat="day in vm.weekDays track by $index"\n          ng-bind="day">\n        </div>\n        </div>\n\n        <div\n        class="cal-month-box">\n        <div\n        ng-repeat="rowOffset in vm.view[7].monthOffsets track by rowOffset">\n        <div\n        class="cal-row-fluid cal-before-eventlist">\n        <div\n    ng-click="vm.calendarCtrl.dateClicked(8,day)"\n    ng-repeat="day in vm.view[7].monthData | calendarLimitTo:7:rowOffset track by $index"\n        class="cal-cell1 cal-cell {{ day.highlightClass }}"\n        ng-class="{pointer: day.events.length > 0}">\n        <ng-include src="vm.calendarConfig.templates.calendarMonthCell"></ng-include>\n        </div>\n        </div>\n\n        <mwl-calendar-slide-box\n      is-open="vm.openRowIndex === $index && vm.view[vm.openDayIndex].events.length > 0 && !vm.slideBoxDisabled"\n      events="vm.view[vm.openDayIndex].events"\n      on-event-click="vm.onEventClick"\n      edit-event-html="vm.editEventHtml"\n      on-edit-event-click="vm.onEditEventClick"\n      delete-event-html="vm.deleteEventHtml"\n      on-delete-event-click="vm.onDeleteEventClick">\n    </mwl-calendar-slide-box>\n\n        </div>\n        </div>\n        <small\n          class="cal-events-num badge badge-important pull-left"\n          ng-show="vm.view[7].badgeTotal > 0"\n          ng-bind="vm.view[7].badgeTotal">\n        </small>\n\n        <div\n          class="cal-day-tick"\n          ng-show="monthIndex === vm.openMonthIndex && vm.view[vm.openMonthIndex].events.length > 0 && !vm.slideBoxDisabled">\n          <i class="glyphicon glyphicon-chevron-up"></i>\n          <i class="fa fa-chevron-up"></i>\n        </div>\n\n      </div> </div>\n\n    <mwl-calendar-slide-box\n      is-open="vm.openRowIndex === $index && vm.view[vm.openMonthIndex].events.length > 0 && !vm.slideBoxDisabled"\n      events="vm.view[vm.openMonthIndex].events"\n      on-event-click="vm.onEventClick"\n      edit-event-html="vm.editEventHtml"\n      on-edit-event-click="vm.onEditEventClick"\n      delete-event-html="vm.deleteEventHtml"\n      on-delete-event-click="vm.onDeleteEventClick">\n    </mwl-calendar-slide-box>\n\n  </div>\n\n<div ng-repeat="rowOffset in [8] track by rowOffset">\n    <div class="row cal-before-eventlist">\n      <div\n        class="span3 col-md-3 col-xs-6 cal-cell {{ day.cssClass }}"\n    ng-init="monthIndex = vm.view.indexOf(vm.view[8])"\n        ng-click="vm.monthClicked(vm.view[8], false, $event)"\n        ng-class="{pointer: vm.view[8].events.length > 0, \'cal-day-today\': vm.view[8].isToday}"\n        mwl-droppable\n  >\n\n        <div\n   class="month-name"\n          data-cal-date\n        ng-bind="vm.view[8].label || \'September\'">\n        </div>\n        <div\n        class="cal-row-fluid cal-row-head"\n>        <div\n          class="cal-cell1"\n          ng-repeat="day in vm.weekDays track by $index"\n          ng-bind="day">\n        </div>\n        </div>\n\n        <div\n        class="cal-month-box">\n        <div\n    ng-repeat="rowOffset in vm.view[8].monthOffsets track by rowOffset">\n        <div\n        class="cal-row-fluid cal-before-eventlist">\n        <div\n    ng-click="vm.calendarCtrl.dateClicked(9,day)"\n        ng-repeat="day in vm.view[8].monthData | calendarLimitTo:7:rowOffset track by $index"\n        class="cal-cell1 cal-cell {{ day.highlightClass }}"\n        ng-class="{pointer: day.events.length > 0}">\n        <ng-include src="vm.calendarConfig.templates.calendarMonthCell"></ng-include>\n        </div>\n        </div>\n\n        <mwl-calendar-slide-box\n      is-open="vm.openRowIndex === $index && vm.view[vm.openDayIndex].events.length > 0 && !vm.slideBoxDisabled"\n      events="vm.view[vm.openDayIndex].events"\n      on-event-click="vm.onEventClick"\n      edit-event-html="vm.editEventHtml"\n      on-edit-event-click="vm.onEditEventClick"\n      delete-event-html="vm.deleteEventHtml"\n      on-delete-event-click="vm.onDeleteEventClick">\n    </mwl-calendar-slide-box>\n\n        </div>\n        </div>\n        <small\n          class="cal-events-num badge badge-important pull-left"\n          ng-show="vm.view[8].badgeTotal > 0"\n          ng-bind="vm.view[8].badgeTotal">\n        </small>\n\n        <div\n          class="cal-day-tick"\n          ng-show="monthIndex === vm.openMonthIndex && vm.view[vm.openMonthIndex].events.length > 0 && !vm.slideBoxDisabled">\n          <i class="glyphicon glyphicon-chevron-up"></i>\n          <i class="fa fa-chevron-up"></i>\n        </div>\n\n      </div>\n   <div\n        class="span3 col-md-3 col-xs-6 cal-cell {{ day.cssClass }}"\n         ng-init="monthIndex = vm.view.indexOf(vm.view[9])"\n        ng-click="vm.monthClicked(vm.view[9], false, $event)"\n        ng-class="{pointer: vm.view[9].events.length > 0, \'cal-day-today\': vm.view[9].isToday}"\n        mwl-droppable\n  >\n\n       <div\n   class="month-name"\n          data-cal-date\n            ng-bind="vm.view[9].label || \'October\'">\n        </div>\n        <div\n        class="cal-row-fluid cal-row-head"\n>        <div\n          class="cal-cell1"\n          ng-repeat="day in vm.weekDays track by $index"\n          ng-bind="day">\n        </div>\n        </div>\n\n        <div\n        class="cal-month-box">\n        <div\n    ng-repeat="rowOffset in vm.view[9].monthOffsets track by rowOffset">\n        <div\n        class="cal-row-fluid cal-before-eventlist">\n        <div\n    ng-click="vm.calendarCtrl.dateClicked(10,day)"\n       ng-repeat="day in vm.view[9].monthData | calendarLimitTo:7:rowOffset track by $index"\n        class="cal-cell1 cal-cell {{ day.highlightClass }}"\n        ng-class="{pointer: day.events.length > 0}">\n        <ng-include src="vm.calendarConfig.templates.calendarMonthCell"></ng-include>\n        </div>\n        </div>\n\n        <mwl-calendar-slide-box\n      is-open="vm.openRowIndex === $index && vm.view[vm.openDayIndex].events.length > 0 && !vm.slideBoxDisabled"\n      events="vm.view[vm.openDayIndex].events"\n      on-event-click="vm.onEventClick"\n      edit-event-html="vm.editEventHtml"\n      on-edit-event-click="vm.onEditEventClick"\n      delete-event-html="vm.deleteEventHtml"\n      on-delete-event-click="vm.onDeleteEventClick">\n    </mwl-calendar-slide-box>\n\n        </div>\n        </div>\n        <small\n          class="cal-events-num badge badge-important pull-left"\n          ng-show="vm.view[9].badgeTotal > 0"\n          ng-bind="vm.view[9].badgeTotal">\n        </small>\n\n        <div\n          class="cal-day-tick"\n          ng-show="monthIndex === vm.openMonthIndex && vm.view[vm.openMonthIndex].events.length > 0 && !vm.slideBoxDisabled">\n          <i class="glyphicon glyphicon-chevron-up"></i>\n          <i class="fa fa-chevron-up"></i>\n        </div>\n\n      </div><div\n        class="span3 col-md-3 col-xs-6 cal-cell {{ day.cssClass }}"\n ng-init="monthIndex = vm.view.indexOf(vm.view[10])"\n        ng-click="vm.monthClicked(vm.view[10], false, $event)"\n        ng-class="{pointer: vm.view[10].events.length > 0, \'cal-day-today\': vm.view[10].isToday}"\n        mwl-droppable\n    >\n\n        <div\n   class="month-name"\n          data-cal-date\n             ng-bind="vm.view[10].label || \'November\'">\n        </div>\n        <div\n        class="cal-row-fluid cal-row-head"\n>        <div\n          class="cal-cell1"\n          ng-repeat="day in vm.weekDays track by $index"\n          ng-bind="day">\n        </div>\n        </div>\n\n        <div\n        class="cal-month-box">\n        <div\n   ng-repeat="rowOffset in vm.view[10].monthOffsets track by rowOffset">\n        <div\n        class="cal-row-fluid cal-before-eventlist">\n        <div\n    ng-click="vm.calendarCtrl.dateClicked(11,day)"\n    ng-repeat="day in vm.view[10].monthData | calendarLimitTo:7:rowOffset track by $index"\n        class="cal-cell1 cal-cell {{ day.highlightClass }}"\n        ng-class="{pointer: day.events.length > 0}">\n        <ng-include src="vm.calendarConfig.templates.calendarMonthCell"></ng-include>\n        </div>\n        </div>\n\n        <mwl-calendar-slide-box\n      is-open="vm.openRowIndex === $index && vm.view[vm.openDayIndex].events.length > 0 && !vm.slideBoxDisabled"\n      events="vm.view[vm.openDayIndex].events"\n      on-event-click="vm.onEventClick"\n      edit-event-html="vm.editEventHtml"\n      on-edit-event-click="vm.onEditEventClick"\n      delete-event-html="vm.deleteEventHtml"\n      on-delete-event-click="vm.onDeleteEventClick">\n    </mwl-calendar-slide-box>\n\n        </div>\n        </div>\n        <small\n          class="cal-events-num badge badge-important pull-left"\n          ng-show="vm.view[10].badgeTotal > 0"\n          ng-bind="vm.view[10].badgeTotal">\n        </small>\n\n        <div\n          class="cal-day-tick"\n          ng-show="monthIndex === vm.openMonthIndex && vm.view[vm.openMonthIndex].events.length > 0 && !vm.slideBoxDisabled">\n          <i class="glyphicon glyphicon-chevron-up"></i>\n          <i class="fa fa-chevron-up"></i>\n        </div>\n\n      </div><div\n        class="span3 col-md-3 col-xs-6 cal-cell {{ day.cssClass }}"\n            ng-init="monthIndex = vm.view.indexOf(vm.view[11])"\n        ng-click="vm.monthClicked(vm.view[11], false, $event)"\n        ng-class="{pointer: vm.view[11].events.length > 0, \'cal-day-today\': vm.view[11].isToday}"\n        mwl-droppable\n   >\n\n        <div\n   class="month-name"\n          data-cal-date\n          ng-bind="vm.view[11].label || \'December\'">\n        </div>\n        <div\n        class="cal-row-fluid cal-row-head"\n>        <div\n          class="cal-cell1"\n       ng-repeat="day in vm.weekDays track by $index"\n          ng-bind="day">\n        </div>\n        </div>\n\n        <div\n        class="cal-month-box">\n        <div\n     ng-repeat="rowOffset in vm.view[11].monthOffsets track by rowOffset">\n        <div\n        class="cal-row-fluid cal-before-eventlist">\n        <div\n   ng-click="vm.calendarCtrl.dateClicked(12,day)"\n     ng-repeat="day in vm.view[11].monthData | calendarLimitTo:7:rowOffset track by $index"\n        class="cal-cell1 cal-cell {{ day.highlightClass }}"\n        ng-class="{pointer: day.events.length > 0}">\n        <ng-include src="vm.calendarConfig.templates.calendarMonthCell"></ng-include>\n        </div>\n        </div>\n\n        <mwl-calendar-slide-box\n      is-open="vm.openRowIndex === $index && vm.view[vm.openDayIndex].events.length > 0 && !vm.slideBoxDisabled"\n      events="vm.view[vm.openDayIndex].events"\n      on-event-click="vm.onEventClick"\n      edit-event-html="vm.editEventHtml"\n      on-edit-event-click="vm.onEditEventClick"\n      delete-event-html="vm.deleteEventHtml"\n      on-delete-event-click="vm.onDeleteEventClick">\n    </mwl-calendar-slide-box>\n\n        </div>\n        </div>\n        <small\n          class="cal-events-num badge badge-important pull-left"\n          ng-show="vm.view[11].badgeTotal > 0"\n          ng-bind="vm.view[11].badgeTotal">\n        </small>\n\n        <div\n          class="cal-day-tick"\n          ng-show="monthIndex === vm.openMonthIndex && vm.view[vm.openMonthIndex].events.length > 0 && !vm.slideBoxDisabled">\n          <i class="glyphicon glyphicon-chevron-up"></i>\n          <i class="fa fa-chevron-up"></i>\n        </div>\n\n      </div> </div>\n\n    <mwl-calendar-slide-box\n      is-open="vm.openRowIndex === $index && vm.view[vm.openMonthIndex].events.length > 0 && !vm.slideBoxDisabled"\n      events="vm.view[vm.openMonthIndex].events"\n      on-event-click="vm.onEventClick"\n      edit-event-html="vm.editEventHtml"\n      on-edit-event-click="vm.onEditEventClick"\n      delete-event-html="vm.deleteEventHtml"\n      on-delete-event-click="vm.onDeleteEventClick">\n    </mwl-calendar-slide-box>\n\n  </div>\n\n</div>\n\n';
    }, function (e, n, t) {
        function a(e) {
            return t(l(e))
        }

        function l(e) {
            return i[e] || function () {
                    throw new Error("Cannot find module '" + e + "'.")
                }()
        }

        var i = {
            "./mwlCalendar.js": 24,
            "./mwlCalendarDay.js": 25,
            "./mwlCalendarHourList.js": 26,
            "./mwlCalendarMonth.js": 27,
            "./mwlCalendarSlideBox.js": 28,
            "./mwlCalendarWeek.js": 29,
            "./mwlCalendarYear.js": 30,
            "./mwlCollapseFallback.js": 31,
            "./mwlDateModifier.js": 32,
            "./mwlDragSelect.js": 33,
            "./mwlDraggable.js": 34,
            "./mwlDroppable.js": 35,
            "./mwlElementDimensions.js": 36,
            "./mwlResizable.js": 37
        };
        a.keys = function () {
            return Object.keys(i)
        }, a.resolve = l, e.exports = a, a.id = 23
    }, function (e, n, t) {
        "use strict";
        var a = t(12);
        a.module("mwl.calendar").controller("MwlCalendarCtrl", ["$scope","$rootScope", "$log", "$timeout", "$attrs", "$locale", "moment", "calendarTitle", "calendarHelper", function (e,x, n, t, l, i, d, s, o) {
            function v() {
                s[c.view] && a.isDefined(l.viewTitle) && (c.viewTitle = s[c.view](c.viewDate));
                var n = d(c.viewDate), i = !0;
                m.clone().startOf(c.view).isSame(n.clone().startOf(c.view)) && !m.isSame(n) && c.view === w && (i = !1), m = n, w = c.view, i && t(function () {
                    e.$broadcast("calendar.refreshView")
                })
            }

            function r() {
                s[c.view] && a.isDefined(l.viewTitle) && (c.viewTitle = s[c.view](c.viewDate));
                var n = d(c.viewDate), i = !0;
                m.clone().startOf(c.view).isSame(n.clone().startOf(c.view)) && !m.isSame(n) && c.view === w && (i = !1), m = n, w = c.view, i && t(function () {
                    e.$broadcast("calendar.refreshView")
                })
            }

            var c = this;
            c.events = c.events || [], c.changeView = function (e, n) {
                c.view = e, c.viewDate = n
            }, c.dateClicked = function (m,d) {
                x.$broadcast("calendarDayClicked",{month:m,day:d})
            };
            var m = d(c.viewDate), w = c.view;
            o.loadTemplates().then(function () {
                c.templatesLoaded = !0;
                var n = !1;
                e.$watchGroup(["vm.viewDate", "vm.view", "vm.cellIsOpen", function () {
                    return d.locale() + i.id
                }], function () {
                    n ? v() : (n = !0, e.$watch("vm.planItems", r, !0))
                })
            })["catch"](function (e) {
                n.error("Could not load all calendar templates", e)
            })
        }]).directive("mwlCalendar", ["calendarConfig", function (e) {
            return {
                templateUrl: e.templates.calendar,
                restrict: "E",
                scope: {
                    events: "=",
                    planItems: "=",
                    view: "=",
                    viewTitle: "=?",
                    viewDate: "=",
                    editEventHtml: "=?",
                    deleteEventHtml: "=?",
                    cellIsOpen: "=?",
                    slideBoxDisabled: "=?",
                    onEventClick: "&",
                    onEventTimesChanged: "&",
                    onEditEventClick: "&",
                    onDeleteEventClick: "&",
                    onTimespanClick: "&",
                    onDateRangeSelect: "&?",
                    onViewChangeClick: "&",
                    cellModifier: "&",
                    dayViewStart: "@",
                    dayViewEnd: "@",
                    dayViewSplit: "@",
                    dayViewEventChunkSize: "@"
                },
                controller: "MwlCalendarCtrl as vm",
                bindToController: !0
            }
        }])
    }, function (e, n, t) {
        "use strict";
        var a = t(12);
        a.module("mwl.calendar").controller("MwlCalendarDayCtrl", ["$scope", "$sce", "moment", "calendarHelper", function (e, n, t, a) {
            var l = this;
            l.$sce = n, e.$on("calendar.refreshView", function () {
                l.dayViewSplit = l.dayViewSplit || 30, l.dayViewHeight = a.getDayViewHeight(l.dayViewStart, l.dayViewEnd, l.dayViewSplit);
                var e = a.getDayView(l.events, l.viewDate, l.dayViewStart, l.dayViewEnd, l.dayViewSplit);
                l.allDayEvents = e.filter(function (e) {
                    return e.allDay
                }), l.nonAllDayEvents = e.filter(function (e) {
                    return !e.allDay
                })
            }), l.eventDragComplete = function (e, n) {
                var a = n * l.dayViewSplit, i = t(e.startsAt).add(a, "minutes"), d = t(e.endsAt).add(a, "minutes");
                delete e.tempStartsAt, l.onEventTimesChanged({
                    calendarEvent: e,
                    calendarNewEventStart: i.toDate(),
                    calendarNewEventEnd: e.endsAt ? d.toDate() : null
                })
            }, l.eventDragged = function (e, n) {
                var a = n * l.dayViewSplit;
                e.tempStartsAt = t(e.startsAt).add(a, "minutes").toDate()
            }, l.eventResizeComplete = function (e, n, a) {
                var i = a * l.dayViewSplit, d = t(e.startsAt), s = t(e.endsAt);
                "start" === n ? d.add(i, "minutes") : s.add(i, "minutes"), delete e.tempStartsAt, l.onEventTimesChanged({
                    calendarEvent: e,
                    calendarNewEventStart: d.toDate(),
                    calendarNewEventEnd: s.toDate()
                })
            }, l.eventResized = function (e, n, a) {
                var i = a * l.dayViewSplit;
                "start" === n && (e.tempStartsAt = t(e.startsAt).add(i, "minutes").toDate())
            }
        }]).directive("mwlCalendarDay", ["calendarConfig", function (e) {
            return {
                templateUrl: e.templates.calendarDayView,
                restrict: "E",
                require: "^mwlCalendar",
                scope: {
                    events: "=",
                    viewDate: "=",
                    onEventClick: "=",
                    onEventTimesChanged: "=",
                    onTimespanClick: "=",
                    onDateRangeSelect: "=",
                    dayViewStart: "=",
                    dayViewEnd: "=",
                    dayViewSplit: "=",
                    dayViewEventChunkSize: "="
                },
                controller: "MwlCalendarDayCtrl as vm",
                bindToController: !0
            }
        }])
    }, function (e, n, t) {
        "use strict";
        var a = t(12);
        a.module("mwl.calendar").controller("MwlCalendarHourListCtrl", ["$scope", "$attrs", "moment", "calendarConfig", "calendarHelper", function (e, n, t, a, l) {
            function i() {
                d = t(o.dayViewStart || "00:00", "HH:mm"), s = t(o.dayViewEnd || "23:00", "HH:mm"), o.dayViewSplit = parseInt(o.dayViewSplit), o.hours = [];
                var e = t(o.viewDate).clone();
                n.dayWidth && (e = e.startOf("week")), e.hours(d.hours()).minutes(d.minutes()).seconds(d.seconds());
                for (var i = 0; i <= s.diff(d, "hours"); i++)o.hours.push({
                    label: l.formatDate(e, a.dateFormats.hour),
                    date: e.clone()
                }), e.add(1, "hour");
                o.hourChunks = [];
                for (var v = 0; v < 60 / o.dayViewSplit; v++)o.hourChunks.push(v)
            }

            var d, s, o = this, v = t.locale();
            e.$on("calendar.refreshView", function () {
                v !== t.locale() && (v = t.locale(), i())
            }), e.$watchGroup(["vm.dayViewStart", "vm.dayViewEnd", "vm.dayViewSplit", "vm.viewDate"], function () {
                i()
            }), o.eventDropped = function (e, n) {
                var a = t(n), i = l.adjustEndDateFromStartDiff(e.startsAt, a, e.endsAt);
                o.onEventTimesChanged({
                    calendarEvent: e,
                    calendarDate: n,
                    calendarNewEventStart: a.toDate(),
                    calendarNewEventEnd: i ? i.toDate() : null
                })
            }, o.getClickedDate = function (e, n, a) {
                return t(e).clone().add(n, "minutes").add(a || 0, "days").toDate()
            }, o.onDragSelectStart = function (e) {
                o.dateRangeSelect = {startDate: e, endDate: e}
            }, o.onDragSelectMove = function (e) {
                o.dateRangeSelect && (o.dateRangeSelect.endDate = e)
            }, o.onDragSelectEnd = function (e) {
                o.dateRangeSelect.endDate = e, o.dateRangeSelect.endDate > o.dateRangeSelect.startDate && o.onDateRangeSelect({
                    calendarRangeStartDate: o.dateRangeSelect.startDate,
                    calendarRangeEndDate: o.dateRangeSelect.endDate
                }), delete o.dateRangeSelect
            }
        }]).directive("mwlCalendarHourList", ["calendarConfig", function (e) {
            return {
                restrict: "E",
                templateUrl: e.templates.calendarHourList,
                controller: "MwlCalendarHourListCtrl as vm",
                scope: {
                    viewDate: "=",
                    dayViewStart: "=",
                    dayViewEnd: "=",
                    dayViewSplit: "=",
                    dayWidth: "=?",
                    onTimespanClick: "=",
                    onDateRangeSelect: "=",
                    onEventTimesChanged: "="
                },
                bindToController: !0
            }
        }])
    }, function (e, n, t) {
        "use strict";
        var a = t(12);
        a.module("mwl.calendar").controller("MwlCalendarMonthCtrl", ["$scope", "moment", "calendarHelper", "calendarConfig", "$timeout", "$filter", function (e, n, t, a, l, i) {
            var d = this;
            d.calendarConfig = a, d.openRowIndex = null, e.$on("calendar.refreshView", function () {
                d.weekDays = t.getWeekDayNames(), d.view = t.getMonthView(d.events, d.viewDate, d.cellModifier, d.planItems, "month");
                var e = Math.floor(d.view.length / 7);
                d.monthOffsets = [];
                for (var a = 0; e > a; a++)d.monthOffsets.push(7 * a);
                d.cellIsOpen && null === d.openRowIndex && (d.openDayIndex = null, d.view.forEach(function (e) {
                    e.inMonth && n(d.viewDate).startOf("day").isSame(e.date) && d.dayClicked(e, !0)
                }))
            }), d.dayClicked = function (e, n, t) {
                if (n || (d.onTimespanClick({
                        calendarDate: e.date.toDate(),
                        calendarCell: e,
                        $event: t
                    }), !t || !t.defaultPrevented)) {
                    d.openRowIndex = null;
                    var a = d.view.indexOf(e);
                    a === d.openDayIndex ? (d.openDayIndex = null, d.cellIsOpen = !1) : (d.openDayIndex = a, d.openRowIndex = Math.floor(a / 7), d.cellIsOpen = !0)
                }
            }, d.highlightEvent = function (e, n) {
                d.view.forEach(function (t) {
                    if (delete t.highlightClass, n) {
                        var a = t.events.indexOf(e) > -1;
                        a && (t.highlightClass = "day-highlight dh-event-" + e.type)
                    }
                })
            }, d.handleEventDrop = function (e, a, l) {
                var i = n(e.startsAt).date(n(a).date()).month(n(a).month()).year(n(a).year()), s = t.adjustEndDateFromStartDiff(e.startsAt, i, e.endsAt);
                d.onEventTimesChanged({
                    calendarEvent: e,
                    calendarDate: a,
                    calendarNewEventStart: i.toDate(),
                    calendarNewEventEnd: s ? s.toDate() : null,
                    calendarDraggedFromDate: l
                })
            }
        }]).directive("mwlCalendarMonth", ["calendarConfig", function (e) {
            return {
                templateUrl: e.templates.calendarMonthView,
                restrict: "E",
                require: "^mwlCalendar",
                scope: {
                    events: "=",
                    viewDate: "=",
                    viewPeriod: "=",
                    planItems: "=",
                    onEventClick: "=",
                    onEditEventClick: "=",
                    onDeleteEventClick: "=",
                    onEventTimesChanged: "=",
                    editEventHtml: "=",
                    deleteEventHtml: "=",
                    cellIsOpen: "=",
                    onTimespanClick: "=",
                    cellModifier: "=",
                    slideBoxDisabled: "="
                },
                controller: "MwlCalendarMonthCtrl as vm",
                link: function (e, n, t, a) {
                    e.vm.calendarCtrl = a
                },
                bindToController: !0
            }
        }])
    }, function (e, n, t) {
        "use strict";
        var a = t(12);
        a.module("mwl.calendar").controller("MwlCalendarSlideBoxCtrl", ["$sce", "$scope", "$timeout", "calendarConfig", function (e, n, t, a) {
            var l = this;
            l.$sce = e, l.calendarConfig = a, l.isCollapsed = !0, n.$watch("vm.isOpen", function (e) {
                t(function () {
                    l.isCollapsed = !e
                })
            })
        }]).directive("mwlCalendarSlideBox", ["calendarConfig", function (e) {
            return {
                restrict: "E",
                templateUrl: e.templates.calendarSlideBox,
                replace: !0,
                controller: "MwlCalendarSlideBoxCtrl as vm",
                require: ["^?mwlCalendarMonth", "^?mwlCalendarYear"],
                link: function (e, n, t, a) {
                    e.isMonthView = !!a[0], e.isYearView = !!a[1]
                },
                scope: {
                    isOpen: "=",
                    events: "=",
                    onEventClick: "=",
                    editEventHtml: "=",
                    onEditEventClick: "=",
                    deleteEventHtml: "=",
                    onDeleteEventClick: "="
                },
                bindToController: !0
            }
        }])
    }, function (e, n, t) {
        "use strict";
        var a = t(12);
        a.module("mwl.calendar").controller("MwlCalendarWeekCtrl", ["$scope", "$sce", "moment", "calendarHelper", "calendarConfig", function (e, n, t, a, l) {
            var i = this;
            i.showTimes = l.showTimesOnWeekView, i.$sce = n, e.$on("calendar.refreshView", function () {
                i.dayViewSplit = i.dayViewSplit || 30, i.dayViewHeight = a.getDayViewHeight(i.dayViewStart, i.dayViewEnd, i.dayViewSplit), i.showTimes ? i.view = a.getWeekViewWithTimes(i.events, i.viewDate, i.dayViewStart, i.dayViewEnd, i.dayViewSplit) : i.view = a.getWeekView(i.events, i.viewDate)
            }), i.weekDragged = function (e, n, a) {
                var l = t(e.startsAt).add(n, "days"), d = t(e.endsAt).add(n, "days");
                if (a) {
                    var s = a * i.dayViewSplit;
                    l = l.add(s, "minutes"), d = d.add(s, "minutes")
                }
                delete e.tempStartsAt, i.onEventTimesChanged({
                    calendarEvent: e,
                    calendarNewEventStart: l.toDate(),
                    calendarNewEventEnd: e.endsAt ? d.toDate() : null
                })
            }, i.eventDropped = function (e, n) {
                var a = t(n).diff(t(e.startsAt), "days");
                i.weekDragged(e, a)
            }, i.weekResized = function (e, n, a) {
                var l = t(e.startsAt), d = t(e.endsAt);
                "start" === n ? l.add(a, "days") : d.add(a, "days"), i.onEventTimesChanged({
                    calendarEvent: e,
                    calendarNewEventStart: l.toDate(),
                    calendarNewEventEnd: d.toDate()
                })
            }, i.tempTimeChanged = function (e, n) {
                var a = n * i.dayViewSplit;
                e.tempStartsAt = t(e.startsAt).add(a, "minutes").toDate()
            }
        }]).directive("mwlCalendarWeek", ["calendarConfig", function (e) {
            return {
                templateUrl: e.templates.calendarWeekView,
                restrict: "E",
                require: "^mwlCalendar",
                scope: {
                    events: "=",
                    viewDate: "=",
                    onEventClick: "=",
                    onEventTimesChanged: "=",
                    dayViewStart: "=",
                    dayViewEnd: "=",
                    dayViewSplit: "=",
                    dayViewEventChunkSize: "=",
                    onTimespanClick: "="
                },
                controller: "MwlCalendarWeekCtrl as vm",
                link: function (e, n, t, a) {
                    e.vm.calendarCtrl = a
                },
                bindToController: !0
            }
        }])
    }, function (e, n, t) {
        "use strict";
        var a = t(12);
        a.module("mwl.calendar").controller("MwlCalendarYearCtrl", ["$scope", "moment", "calendarHelper", "calendarConfig", "$filter", function (e, n, t, a, l) {
            var i = this;
            i.calendarConfig = a, i.openMonthIndex = null, i.openRowIndex = null, e.$on("calendar.refreshView", function () {
                if ("year" === i.viewPeriod) {
                    i.loadingDone = !1, i.view = [], i.weekDays = t.getWeekDayNames(), i.view = t.getYearView(i.events, i.viewDate, i.cellModifier), i.yearCount = 0;
                    var e = i.viewDate, a = (l("date")(new Date, "dd-MM-yyyy"), l("date")(i.viewDate, "dd-MM-yyyy"), i.viewDate.getMonth());
                    i.view.forEach(function (n) {
                        e.setMonth(i.yearCount), i.monthView = t.getMonthView(i.events, e, i.cellModifier, i.planItems, "year");
                        var a = Math.floor(i.monthView.length / 7);
                        i.monthOffsets = [];
                        for (var l = 0; a > l; l++)i.monthOffsets.push(7 * l);
                        i.view[i.yearCount].monthData = i.monthView, i.view[i.yearCount].monthOffsets = i.monthOffsets, i.yearCount++
                    }), i.viewDate.setMonth(a), i.cellIsOpen && null === i.openMonthIndex && null === i.openRowIndex && (i.openMonthIndex = null, i.openDayIndex = null, i.view.forEach(function (e) {
                        n(i.viewDate).startOf("month").isSame(e.date) && i.monthClicked(e, !0)
                    }), i.view.forEach(function (e) {
                        e.inMonth && n(i.viewDate).startOf("day").isSame(e.date) && i.dayClicked(e, !0)
                    })), i.loadingDone = !0
                }
            }), i.monthClicked = function (e, n, t) {
                if (n || (i.onTimespanClick({
                        calendarDate: e.date.toDate(),
                        calendarCell: e,
                        $event: t
                    }), !t || !t.defaultPrevented)) {
                    i.openRowIndex = null;
                    var a = i.view.indexOf(e);
                    a === i.openMonthIndex ? (i.openMonthIndex = null, i.cellIsOpen = !1) : (i.openMonthIndex = a, i.openRowIndex = Math.floor(a / 4), i.cellIsOpen = !0)
                }
            }, i.handleEventDrop = function (e, a) {
                var l = n(e.startsAt).month(n(a).month()).year(n(a).year()), d = t.adjustEndDateFromStartDiff(e.startsAt, l, e.endsAt);
                i.onEventTimesChanged({
                    calendarEvent: e,
                    calendarDate: a,
                    calendarNewEventStart: l.toDate(),
                    calendarNewEventEnd: d ? d.toDate() : null
                })
            }
        }]).directive("mwlCalendarYear", ["calendarConfig", function (e) {
            return {
                templateUrl: e.templates.calendarYearView,
                restrict: "E",
                require: "^mwlCalendar",
                scope: {
                    events: "=",
                    viewDate: "=",
                    planItems: "=",
                    yearView: "=",
                    offsets: "=",
                    onEventClick: "=",
                    onEventTimesChanged: "=",
                    onEditEventClick: "=",
                    onDeleteEventClick: "=",
                    viewPeriod: "=",
                    editEventHtml: "=",
                    deleteEventHtml: "=",
                    cellIsOpen: "=",
                    onTimespanClick: "=",
                    cellModifier: "=",
                    slideBoxDisabled: "="
                },
                controller: "MwlCalendarYearCtrl as vm",
                link: function (e, n, t, a) {
                    e.vm.calendarCtrl = a
                },
                bindToController: !0
            }
        }])
    }, function (e, n, t) {
        "use strict";
        var a = t(12);
        a.module("mwl.calendar").controller("MwlCollapseFallbackCtrl", ["$scope", "$attrs", "$element", function (e, n, t) {
            e.$watch(n.mwlCollapseFallback, function (e) {
                e ? t.addClass("ng-hide") : t.removeClass("ng-hide")
            })
        }]).directive("mwlCollapseFallback", ["$injector", function (e) {
            return e.has("uibCollapseDirective") ? {} : {restrict: "A", controller: "MwlCollapseFallbackCtrl"}
        }])
    }, function (e, n, t) {
        "use strict";
        var a = t(12);
        a.module("mwl.calendar").controller("MwlDateModifierCtrl", ["$element", "$attrs", "$scope", "moment", function (e, n, t, l) {
            function i() {
                a.isDefined(n.setToToday) ? d.date = new Date : a.isDefined(n.increment) ? d.date = l(d.date).add(1, d.increment).toDate() : a.isDefined(n.decrement) && (d.date = l(d.date).subtract(1, d.decrement).toDate()), t.$apply()
            }

            var d = this;
            e.bind("click", i), t.$on("$destroy", function () {
                e.unbind("click", i)
            })
        }]).directive("mwlDateModifier", function () {
            return {
                restrict: "A",
                controller: "MwlDateModifierCtrl as vm",
                scope: {date: "=", increment: "=", decrement: "="},
                bindToController: !0
            }
        })
    }, function (e, n, t) {
        "use strict";
        var a = t(12);
        a.module("mwl.calendar").controller("MwlDragSelectCtrl", ["$scope", "$element", "$parse", "$attrs", function (e, n, t, a) {
            function l(n) {
                return function (a) {
                    n && (t(n)(e), e.$apply()), a.preventDefault()
                }
            }

            function i() {
                n.on("mousedown", s), n.on("mousemove", o), n.on("mouseup", v)
            }

            function d() {
                n.off("mousedown", s), n.off("mousemove", o), n.off("mouseup", v)
            }

            var s = l(a.onDragSelectStart), o = l(a.onDragSelectMove), v = l(a.onDragSelectEnd);
            e.$watch(a.mwlDragSelect, function (e) {
                e ? i() : d()
            }), e.$on("$destroy", function () {
                d()
            })
        }]).directive("mwlDragSelect", function () {
            return {restrict: "A", controller: "MwlDragSelectCtrl"}
        })
    }, function (e, n, t) {
        "use strict";
        var a = t(12);
        a.module("mwl.calendar").controller("MwlDraggableCtrl", ["$element", "$scope", "$window", "$parse", "$attrs", "$timeout", "interact", function (e, n, t, l, i, d, s) {
            function o(e, n) {
                return e.css("-ms-transform", n).css("-webkit-transform", n).css("transform", n)
            }

            if (s) {
                var v, r;
                i.snapGrid && (r = l(i.snapGrid)(n), v = {targets: [s.createSnapGrid(r)]}), s(e[0]).draggable({
                    snap: v,
                    onstart: function (e) {
                        a.element(e.target).addClass("dragging-active"), e.target.dropData = l(i.dropData)(n), e.target.style.pointerEvents = "none", i.onDragStart && (l(i.onDragStart)(n), n.$apply())
                    },
                    onmove: function (e) {
                        var d = a.element(e.target), s = (parseFloat(d.attr("data-x")) || 0) + (e.dx || 0), v = (parseFloat(d.attr("data-y")) || 0) + (e.dy || 0);
                        switch (l(i.axis)(n)) {
                            case"x":
                                v = 0;
                                break;
                            case"y":
                                s = 0
                        }
                        "static" === t.getComputedStyle(d[0]).position && d.css("position", "relative"), o(d, "translate(" + s + "px, " + v + "px)").css("z-index", 50).attr("data-x", s).attr("data-y", v), i.onDrag && (l(i.onDrag)(n, {
                            x: s,
                            y: v
                        }), n.$apply())
                    },
                    onend: function (e) {
                        var t = a.element(e.target), s = t.attr("data-x"), v = t.attr("data-y");
                        e.target.style.pointerEvents = "auto", i.onDragEnd && (l(i.onDragEnd)(n, {
                            x: s,
                            y: v
                        }), n.$apply()), d(function () {
                            o(t, "").css("z-index", "auto").removeAttr("data-x").removeAttr("data-y").removeClass("dragging-active")
                        })
                    }
                }), n.$watch(i.mwlDraggable, function (n) {
                    s(e[0]).draggable({enabled: n})
                }), n.$on("$destroy", function () {
                    s(e[0]).unset()
                })
            }
        }]).directive("mwlDraggable", function () {
            return {restrict: "A", controller: "MwlDraggableCtrl"}
        })
    }, function (e, n, t) {
        "use strict";
        var a = t(12);
        a.module("mwl.calendar").controller("MwlDroppableCtrl", ["$element", "$scope", "$parse", "$attrs", "interact", function (e, n, t, l, i) {
            if (i) {
                var d = l.dropActiveClass || "drop-active";
                i(e[0]).dropzone({
                    ondragenter: function (e) {
                        a.element(e.target).addClass(d)
                    }, ondragleave: function (e) {
                        a.element(e.target).removeClass(d)
                    }, ondropdeactivate: function (e) {
                        a.element(e.target).removeClass(d)
                    }, ondrop: function (e) {
                        e.relatedTarget.dropData && (t(l.onDrop)(n, {dropData: e.relatedTarget.dropData}), n.$apply())
                    }
                }), n.$on("$destroy", function () {
                    i(e[0]).unset()
                })
            }
        }]).directive("mwlDroppable", function () {
            return {restrict: "A", controller: "MwlDroppableCtrl"}
        })
    }, function (e, n, t) {
        "use strict";
        var a = t(12);
        a.module("mwl.calendar").controller("MwlElementDimensionsCtrl", ["$element", "$scope", "$parse", "$attrs", "$window", function (e, n, t, l, i) {
            function d() {
                t(l.mwlElementDimensions).assign(n, {
                    width: e[0].offsetWidth,
                    height: e[0].offsetHeight
                }), n.$applyAsync()
            }

            var s = a.element(i);
            s.bind("resize", d), d(), n.$on("$destroy", function () {
                s.unbind("resize", d)
            })
        }]).directive("mwlElementDimensions", function () {
            return {restrict: "A", controller: "MwlElementDimensionsCtrl"}
        })
    }, function (e, n, t) {
        "use strict";
        var a = t(12);
        a.module("mwl.calendar").controller("MwlResizableCtrl", ["$element", "$scope", "$parse", "$attrs", "$timeout", "interact", function (e, n, t, l, i, d) {
            function s(e, n) {
                var t = {};
                return t.edge = e, "start" === e ? (t.x = n.data("x"), t.y = n.data("y")) : "end" === e && (t.x = parseFloat(n.css("width").replace("px", "")) - c.width, t.y = parseFloat(n.css("height").replace("px", "")) - c.height), t
            }

            if (d) {
                var o, v;
                l.snapGrid && (v = t(l.snapGrid)(n), o = {targets: [d.createSnapGrid(v)]});
                var r, c = {}, m = {};
                d(e[0]).resizable({
                    edges: t(l.resizeEdges)(n), snap: o, onstart: function (e) {
                        r = "end";
                        var n = a.element(e.target);
                        c.height = n[0].offsetHeight, c.width = n[0].offsetWidth, m.height = n.css("height"), m.width = n.css("width")
                    }, onmove: function (e) {
                        if (e.rect.width > 0 && e.rect.height > 0) {
                            var i = a.element(e.target), d = parseFloat(i.data("x") || 0), o = parseFloat(i.data("y") || 0);
                            i.css({
                                width: e.rect.width + "px",
                                height: e.rect.height + "px"
                            }), d += e.deltaRect.left, o += e.deltaRect.top, i.css("transform", "translate(" + d + "px," + o + "px)"), i.data("x", d), i.data("y", o), (0 !== e.deltaRect.left || 0 !== e.deltaRect.top) && (r = "start"), l.onResize && (t(l.onResize)(n, s(r, i)), n.$apply())
                        }
                    }, onend: function (e) {
                        var d = a.element(e.target), o = s(r, d);
                        i(function () {
                            d.data("x", null).data("y", null).css({transform: "", width: m.width, height: m.height})
                        }), l.onResizeEnd && (t(l.onResizeEnd)(n, o), n.$apply())
                    }
                }), n.$watch(l.mwlResizable, function (n) {
                    d(e[0]).resizable({enabled: n})
                }), n.$on("$destroy", function () {
                    d(e[0]).unset()
                })
            }
        }]).directive("mwlResizable", function () {
            return {restrict: "A", controller: "MwlResizableCtrl"}
        })
    }, function (e, n, t) {
        function a(e) {
            return t(l(e))
        }

        function l(e) {
            return i[e] || function () {
                    throw new Error("Cannot find module '" + e + "'.")
                }()
        }

        var i = {
            "./calendarDate.js": 39,
            "./calendarLimitTo.js": 40,
            "./calendarTruncateEventTitle.js": 41,
            "./calendarTrustAsHtml.js": 42
        };
        a.keys = function () {
            return Object.keys(i)
        }, a.resolve = l, e.exports = a, a.id = 38
    }, function (e, n, t) {
        "use strict";
        var a = t(12);
        a.module("mwl.calendar").filter("calendarDate", ["calendarHelper", "calendarConfig", function (e, n) {
            function t(t, a, l) {
                return l === !0 && (a = n.dateFormats[a]), e.formatDate(t, a)
            }

            return t.$stateful = !0, t
        }])
    }, function (e, n, t) {
        "use strict";
        var a = t(12);
        a.module("mwl.calendar").filter("calendarLimitTo", ["limitToFilter", function (e) {
            return a.version.minor >= 4 ? e : function (e, n, t) {
                return n = Math.abs(Number(n)) === 1 / 0 ? Number(n) : parseInt(n), isNaN(n) ? e : (a.isNumber(e) && (e = e.toString()), a.isArray(e) || a.isString(e) ? (t = !t || isNaN(t) ? 0 : parseInt(t), t = 0 > t && t >= -e.length ? e.length + t : t, n >= 0 ? e.slice(t, t + n) : 0 === t ? e.slice(n, e.length) : e.slice(Math.max(0, t + n), t)) : e)
            }
        }])
    }, function (e, n, t) {
        "use strict";
        var a = t(12);
        a.module("mwl.calendar").filter("calendarTruncateEventTitle", function () {
            return function (e, n, t) {
                return e ? e.length >= n && e.length / 20 > t / 30 ? e.substr(0, n) + "..." : e : ""
            }
        })
    }, function (e, n, t) {
        "use strict";
        var a = t(12);
        a.module("mwl.calendar").filter("calendarTrustAsHtml", ["$sce", function (e) {
            return function (n) {
                return e.trustAsHtml(n)
            }
        }])
    }, function (e, n, t) {
        function a(e) {
            return t(l(e))
        }

        function l(e) {
            return i[e] || function () {
                    throw new Error("Cannot find module '" + e + "'.")
                }()
        }

        var i = {
            "./calendarConfig.js": 44,
            "./calendarHelper.js": 45,
            "./calendarTitle.js": 46,
            "./interact.js": 47,
            "./moment.js": 49
        };
        a.keys = function () {
            return Object.keys(i)
        }, a.resolve = l, e.exports = a, a.id = 43
    }, function (e, n, t) {
        "use strict";
        var a = t(12);
        a.module("mwl.calendar").constant("calendarConfig", {
            allDateFormats: {
                angular: {
                    date: {
                        hour: "ha",
                        day: "d MMM",
                        month: "MMMM",
                        weekDay: "EEE",
                        time: "HH:mm",
                        datetime: "MMM d, h:mm a"
                    },
                    title: {day: "EEEE d MMMM, yyyy", week: "Week {week} of {year}", month: "MMMM yyyy", year: "yyyy"}
                },
                moment: {
                    date: {
                        hour: "ha",
                        day: "D MMM",
                        month: "MMMM",
                        weekDay: "ddd",
                        time: "HH:mm",
                        datetime: "MMM D, h:mm a"
                    },
                    title: {day: "dddd D MMMM, YYYY", week: "Week {week} of {year}", month: "MMMM YYYY", year: "YYYY"}
                }
            },
            get dateFormats() {
                return this.allDateFormats[this.dateFormatter].date
            },
            get titleFormats() {
                return this.allDateFormats[this.dateFormatter].title
            },
            dateFormatter: "angular",
            displayEventEndTimes: !1,
            showTimesOnWeekView: !1,
            displayAllMonthEvents: !1,
            i18nStrings: {weekNumber: "Week {week}"},
            templates: {}
        })
    }, function (e, n, t) {
        "use strict";
        var a = t(12);
        a.module("mwl.calendar").factory("calendarHelper", ["$q", "$templateRequest", "dateFilter", "moment", "calendarConfig", "$filter", function (e, n, t, a, l, i) {
            function d(e, n) {
                if ("angular" === l.dateFormatter)return t(a(e).toDate(), n);
                if ("moment" === l.dateFormatter)return a(e).format(n);
                throw new Error("Unknown date formatter: " + l.dateFormatter)
            }

            function s(e, n, t) {
                if (!t)return t;
                var l = a(n).diff(a(e));
                return a(t).add(l)
            }

            function o(e, n, t) {
                var l = a(e.start), i = a(e.end), d = a(t);
                if (n) {
                    switch (n) {
                        case"year":
                            l.set({year: d.year()});
                            break;
                        case"month":
                            l.set({year: d.year(), month: d.month()});
                            break;
                        default:
                            throw new Error("Invalid value (" + n + ") given for recurs on. Can only be year or month.")
                    }
                    i = s(e.start, l, i)
                }
                return {start: l, end: i}
            }

            function v(e, n, t) {
                n = a(n), t = a(t);
                var l = o({start: e.startsAt, end: e.endsAt || e.startsAt}, e.recursOn, n), i = l.start, d = l.end;
                return i.isAfter(n) && i.isBefore(t) || d.isAfter(n) && d.isBefore(t) || i.isBefore(n) && d.isAfter(t) || i.isSame(n) || d.isSame(t)
            }

            function r(e, n, t) {
                return e.filter(function (e) {
                    return console.log("e " + e), v(e, n, t)
                })
            }

            function c(e, n, t) {
                var l = a(e).startOf(n), i = a(e).endOf(n);
                return r(t, l, i)
            }

            function m(e) {
                return e.filter(function (e) {
                    return e.incrementsBadgeTotal !== !1
                }).length
            }

            function w() {
                for (var e = [], n = 0; 7 > n;)e.push(d(a().weekday(n++), l.dateFormats.weekDay));
                return e
            }

            function p(e, n, t) {
                for (var i = [], s = c(n, "year", e), o = a(n).startOf("year"), v = 0; 12 > v;) {
                    var w = o.clone(), p = w.clone().endOf("month"), h = r(s, w, p), g = {
                        label: d(w, l.dateFormats.month),
                        isToday: w.isSame(a().startOf("month")),
                        events: h,
                        date: w,
                        badgeTotal: m(h)
                    };
                    t({calendarCell: g}), i.push(g), o.add(1, "month"), v++
                }
                return i
            }

            function h(e, n, t, l, d) {
                for (var s = a(n).startOf("month"), o = s.clone().startOf("week"), v = a(n).endOf("month").endOf("week"), r = [], c = a().startOf("day"); o.isBefore(v);) {
                    var m = o.month() === a(n).month(), w = !1, p = i("date")(new Date(o.clone()), "dd-MM-yyyy"), h = [],cl='', z=1;

                    for (var g in l) i("date")(new Date(l[g].plannedStartTime), "dd-MM-yyyy") == p && ("month" == d && h.push(l[g]), w = !0) && (l[g].color=='orange'? z = 0 : z=1)
                    var f = {
                        label: o.date(),
                        date: o.clone(),
                        hours: h,
                        inMonth: m,
                        isPlanData: w,
                        isExclude: !z,
                        isPast: c.isAfter(o),
                        isToday: c.isSame(o),
                        isFuture: c.isBefore(o),
                        isWeekend: [0, 6].indexOf(o.day()) > -1
                    };
                    t({calendarCell: f}), r.push(f), o.add(1, "day")

                }

                return r
            }

            function g(e, n) {
                for (var t = a(n).startOf("week"), i = a(n).endOf("week"), s = t.clone(), v = [], c = a().startOf("day"); v.length < 7;)v.push({
                    weekDayLabel: d(s, l.dateFormats.weekDay),
                    date: s.clone(),
                    dayLabel: d(s, l.dateFormats.day),
                    isPast: s.isBefore(c),
                    isToday: s.isSame(c),
                    isFuture: s.isAfter(c),
                    isWeekend: [0, 6].indexOf(s.day()) > -1
                }), s.add(1, "day");
                var m = r(e, t, i).map(function (e) {
                    var n, l = a(t).startOf("day"), d = a(i).startOf("day"), s = o({
                        start: a(e.startsAt).startOf("day"),
                        end: a(e.endsAt || e.startsAt).startOf("day")
                    }, e.recursOn, l), v = s.start, r = s.end;
                    return n = v.isBefore(l) || v.isSame(l) ? 0 : v.diff(l, "days"), r.isAfter(d) && (r = d), v.isBefore(l) && (v = l), e.daySpan = a(r).diff(v, "days") + 1, e.dayOffset = n, e
                });
                return {days: v, events: m}
            }

            function f(e, n, t, l, i) {
                var d = a(t || "00:00", "HH:mm").hours(), s = a(l || "23:00", "HH:mm").hours(), o = 60 / i * 30, c = a(n).startOf("day").add(d, "hours"), m = a(n).startOf("day").add(s + 1, "hours"), w = (s - d + 1) * o, p = o / 60, h = [], g = r(e, a(n).startOf("day").toDate(), a(n).endOf("day").toDate());
                return g.map(function (e) {
                    if (a(e.startsAt).isBefore(c) ? e.top = 0 : e.top = a(e.startsAt).startOf("minute").diff(c.startOf("minute"), "minutes") * p - 2, a(e.endsAt || e.startsAt).isAfter(m))e.height = w - e.top; else {
                        var n = e.startsAt;
                        a(e.startsAt).isBefore(c) && (n = c.toDate()), e.endsAt ? e.height = a(e.endsAt).diff(a(n), "minutes") * p : e.height = 30
                    }
                    return e.top - e.height > w && (e.height = 0), e.left = 0, e
                }).filter(function (e) {
                    return e.height > 0
                }).map(function (e) {
                    var n = !0;
                    return h.forEach(function (t, a) {
                        var l = !0;
                        t.filter(function (e) {
                            return !e.allDay
                        }).forEach(function (n) {
                            (v(e, n.startsAt, n.endsAt || n.startsAt) || v(n, e.startsAt, e.endsAt || e.startsAt)) && (l = !1)
                        }), l && n && (n = !1, e.left = 150 * a, h[a].push(e))
                    }), n && (e.left = 150 * h.length, h.push([e])), e
                })
            }

            function u(e, n, t, l, i) {
                var d = g(e, n), s = [];
                return d.days.forEach(function (e) {
                    var n = d.events.filter(function (n) {
                        return a(n.startsAt).startOf("day").isSame(a(e.date).startOf("day"))
                    }), o = f(n, e.date, t, l, i);
                    s = s.concat(o)
                }), d.events = s, d
            }

            function y(e, n, t) {
                var l = a(e || "00:00", "HH:mm"), i = a(n || "23:00", "HH:mm"), d = 60 / t * 30;
                return (i.diff(l, "hours") + 1) * d + 2
            }

            function k() {
                var t = Object.keys(l.templates).map(function (e) {
                    var t = l.templates[e];
                    return n(t)
                });
                return e.all(t)
            }

            return {
                getWeekDayNames: w,
                getYearView: p,
                getMonthView: h,
                getWeekView: g,
                getDayView: f,
                getWeekViewWithTimes: u,
                getDayViewHeight: y,
                adjustEndDateFromStartDiff: s,
                formatDate: d,
                loadTemplates: k,
                eventIsInPeriod: v
            }
        }])
    }, function (e, n, t) {
        "use strict";
        var a = t(12);
        a.module("mwl.calendar").factory("calendarTitle", ["moment", "calendarConfig", "calendarHelper", function (e, n, t) {
            function a(e) {
                return t.formatDate(e, n.titleFormats.day)
            }

            function l(t) {
                return n.titleFormats.week.replace("{week}", e(t).isoWeek()).replace("{year}", e(t).startOf("week").format("YYYY"))
            }

            function i(e) {
                return t.formatDate(e, n.titleFormats.month)
            }

            function d(e) {
                return t.formatDate(e, n.titleFormats.year)
            }

            return {day: a, week: l, month: i, year: d}
        }])
    }, function (e, n, t) {
        "use strict";
        var a, l = t(12);
        try {
            a = t(48)
        } catch (i) {
            a = null
        }
        l.module("mwl.calendar").constant("interact", a)
    }, function (e, t) {
        if ("undefined" == typeof n) {
            var a = new Error('Cannot find module "undefined"');
            throw a.code = "MODULE_NOT_FOUND", a
        }
        e.exports = n
    }, function (e, n, t) {
        "use strict";
        var a = t(12), l = t(50);
        l.locale("en_gb", {week: {dow: 1}}), a.module("mwl.calendar").constant("moment", l)
    }, function (e, n) {
        e.exports = t
    }])
});
