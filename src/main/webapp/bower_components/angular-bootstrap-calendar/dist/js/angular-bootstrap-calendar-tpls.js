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
            var i = t[a] = {exports: {}, id: a, loaded: !1};
            return e[a].call(i.exports, i, i.exports, n), i.loaded = !0, i.exports
        }

        var t = {};
        return n.m = e, n.c = t, n.p = "", n(0)
    }([function (e, n, t) {
        "use strict";
        function a(e) {
            e.keys().forEach(e)
        }

        t(8);
        var i = t(12), l = {}, r = t(13);
        r.keys().forEach(function (e) {
            var n = e.replace("./", ""), t = "mwl/" + n, a = n.replace(".html", "");
            l[a] = {cacheTemplateName: t, template: r(e)}
        }), e.exports = i.module("mwl.calendar", []).config(["calendarConfig", function (e) {
            i.forEach(l, function (n, t) {
                e.templates[t] || (e.templates[t] = n.cacheTemplateName)
            })
        }]).run(["$templateCache", "$interpolate", function (e, n) {
            i.forEach(l, function (t) {
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
            return t(i(e))
        }

        function i(e) {
            return l[e] || function () {
                    throw new Error("Cannot find module '" + e + "'.")
                }()
        }

        var l = {
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
            return Object.keys(l)
        }, a.resolve = i, e.exports = a, a.id = 13
    }, function (e, n) {
        e.exports = '<div\n  class="cal-context"\n  ng-switch="vm.view"\n  ng-if="vm.templatesLoaded">\n\n  <div class="alert alert-danger" ng-switch-default>The value passed to the view attribute of the calendar is not set</div>\n\n  <div class="alert alert-danger" ng-hide="vm.viewDate">The value passed to view-date attribute of the calendar is not set</div>\n\n  <mwl-calendar-year\n    events="vm.events"\n    view-date="vm.viewDate"\n    plan-items="vm.planItems"\n    year-View="vm.yearView"\n    offsets="vm.offsets"\n    on-event-click="vm.onEventClick"\n    on-event-times-changed="vm.onEventTimesChanged"\n    on-edit-event-click="vm.onEditEventClick"\n    on-delete-event-click="vm.onDeleteEventClick"\n    on-timespan-click="vm.onTimespanClick"\n    edit-event-html="vm.editEventHtml"\n    delete-event-html="vm.deleteEventHtml"\n    cell-is-open="vm.cellIsOpen"\n    cell-modifier="vm.cellModifier"\n    slide-box-disabled="vm.slideBoxDisabled"\n    ng-switch-when="year">\n  </mwl-calendar-year>\n\n  <mwl-calendar-month\n    events="vm.events"\n    view-date="vm.viewDate"\n    plan-items="vm.planItems"\n    on-event-click="vm.onEventClick"\n    on-event-times-changed="vm.onEventTimesChanged"\n    on-edit-event-click="vm.onEditEventClick"\n    on-delete-event-click="vm.onDeleteEventClick"\n    on-timespan-click="vm.onTimespanClick"\n    edit-event-html="vm.editEventHtml"\n    delete-event-html="vm.deleteEventHtml"\n    cell-is-open="vm.cellIsOpen"\n    cell-modifier="vm.cellModifier"\n    slide-box-disabled="vm.slideBoxDisabled"\n    ng-switch-when="month">\n  </mwl-calendar-month>\n\n  <mwl-calendar-week\n    events="vm.events"\n    view-date="vm.viewDate"\n    on-event-click="vm.onEventClick"\n    on-event-times-changed="vm.onEventTimesChanged"\n    day-view-start="vm.dayViewStart"\n    day-view-end="vm.dayViewEnd"\n    day-view-split="vm.dayViewSplit"\n    day-view-event-chunk-size="vm.dayViewEventChunkSize"\n    on-timespan-click="vm.onTimespanClick"\n    ng-switch-when="week">\n  </mwl-calendar-week>\n\n  <mwl-calendar-day\n    events="vm.events"\n    view-date="vm.viewDate"\n    on-event-click="vm.onEventClick"\n    on-event-times-changed="vm.onEventTimesChanged"\n    on-timespan-click="vm.onTimespanClick"\n    on-date-range-select="vm.onDateRangeSelect"\n    day-view-start="vm.dayViewStart"\n    day-view-end="vm.dayViewEnd"\n    day-view-split="vm.dayViewSplit"\n    day-view-event-chunk-size="vm.dayViewEventChunkSize"\n    ng-switch-when="day">\n  </mwl-calendar-day>\n</div>\n'
    }, function (e, n) {
        e.exports = '<div class="cal-week-box cal-all-day-events-box" ng-if="vm.allDayEvents.length > 0">\n  <div class="cal-day-panel clearfix">\n    <div class="row">\n      <div class="col-xs-12">\n        <div class="cal-row-fluid">\n          <div\n            class="cal-cell-6 day-highlight dh-event-{{ event.type }}"\n            data-event-class\n            ng-repeat="event in vm.allDayEvents track by event.$id">\n            <strong>\n              <span ng-bind="event.startsAt | calendarDate:\'datetime\':true"></span>\n              <span ng-if="event.endsAt">\n                - <span ng-bind="event.endsAt | calendarDate:\'datetime\':true"></span>\n              </span>\n            </strong>\n            <a\n              href="javascript:;"\n              class="event-item"\n              ng-bind-html="vm.$sce.trustAsHtml(event.title)">\n            </a>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n\n<div class="cal-day-box">\n  <div class="cal-day-panel clearfix" ng-style="{height: vm.dayViewHeight + \'px\'}">\n\n    <mwl-calendar-hour-list\n      day-view-start="vm.dayViewStart"\n      day-view-end="vm.dayViewEnd"\n      day-view-split="vm.dayViewSplit"\n      on-timespan-click="vm.onTimespanClick"\n      on-date-range-select="vm.onDateRangeSelect"\n      on-event-times-changed="vm.onEventTimesChanged"\n      view-date="vm.viewDate">\n    </mwl-calendar-hour-list>\n\n    <div\n      class="pull-left day-event day-highlight"\n      ng-repeat="event in vm.nonAllDayEvents track by event.$id"\n      ng-class="\'dh-event-\' + event.type + \' \' + event.cssClass"\n      ng-style="{top: event.top + \'px\', left: event.left + 60 + \'px\', height: event.height + \'px\'}"\n      mwl-draggable="event.draggable === true"\n      axis="\'xy\'"\n      snap-grid="{y: vm.dayViewEventChunkSize || 30, x: 50}"\n      on-drag="vm.eventDragged(event, y / 30)"\n      on-drag-end="vm.eventDragComplete(event, y / 30)"\n      mwl-resizable="event.resizable === true && event.endsAt"\n      resize-edges="{top: true, bottom: true}"\n      on-resize="vm.eventResized(event, edge, y / 30)"\n      on-resize-end="vm.eventResizeComplete(event, edge, y / 30)">\n\n      <span class="cal-hours">\n        <span ng-show="event.top == 0"><span ng-bind="(event.tempStartsAt || event.startsAt) | calendarDate:\'day\':true"></span>, </span>\n        <span ng-bind="(event.tempStartsAt || event.startsAt) | calendarDate:\'time\':true"></span>\n      </span>\n      <a href="javascript:;" class="event-item" ng-click="vm.onEventClick({calendarEvent: event})">\n        <span ng-bind-html="vm.$sce.trustAsHtml(event.title) | calendarTruncateEventTitle:20:event.height"></span>\n      </a>\n\n    </div>\n\n  </div>\n\n</div>\n'
    }, function (e, n) {
        e.exports = '<div class="cal-day-panel-hour">\n\n  <div class="cal-day-hour" ng-repeat="hour in vm.hours track by $index">\n\n    <div\n      class="cal-day-hour-part"\n      ng-class="{ \'cal-day-hour-part-selected\': vm.dateRangeSelect &&\n                vm.dateRangeSelect.startDate <= vm.getClickedDate(hour.date, vm.dayViewSplit * $index) &&\n                vm.getClickedDate(hour.date, vm.dayViewSplit * $index) < vm.dateRangeSelect.endDate }"\n      ng-repeat="chunk in vm.hourChunks track by chunk"\n      ng-click="vm.onTimespanClick({calendarDate: vm.getClickedDate(hour.date, vm.dayViewSplit * $index)})"\n      mwl-droppable\n      on-drop="vm.eventDropped(dropData.event, vm.getClickedDate(hour.date, vm.dayViewSplit * $index))"\n      mwl-drag-select="!!vm.onDateRangeSelect"\n      on-drag-select-start="vm.onDragSelectStart(vm.getClickedDate(hour.date, vm.dayViewSplit * $index))"\n      on-drag-select-move="vm.onDragSelectMove(vm.getClickedDate(hour.date, vm.dayViewSplit * ($index + 1)))"\n      on-drag-select-end="vm.onDragSelectEnd(vm.getClickedDate(hour.date, vm.dayViewSplit * ($index + 1)))"\n      ng-if="!vm.dayWidth">\n      <div class="cal-day-hour-part-time">\n        <strong ng-bind="hour.label" ng-show="$first"></strong>\n      </div>\n    </div>\n\n    <div\n      class="cal-day-hour-part"\n      ng-repeat="chunk in vm.hourChunks track by chunk"\n      ng-if="vm.dayWidth">\n      <div class="cal-day-hour-part-time">\n        <strong ng-bind="hour.label" ng-show="$first"></strong>\n      </div>\n      <div\n        class="cal-day-hour-part-spacer"\n        ng-repeat="dayIndex in [0, 1, 2, 3, 4, 5, 6]"\n        ng-style="{width: vm.dayWidth + \'px\'}"\n        ng-click="vm.onTimespanClick({calendarDate: vm.getClickedDate(hour.date, vm.dayViewSplit * $parent.$index, dayIndex)})"\n        mwl-droppable\n        on-drop="vm.eventDropped(dropData.event, vm.getClickedDate(hour.date, vm.dayViewSplit * $parent.$index, dayIndex))">\n      </div>\n    </div>\n\n  </div>\n\n</div>\n'
    }, function (e, n) {
        e.exports = '<div\n  mwl-droppable\n  on-drop="vm.handleEventDrop(dropData.event, day.date, dropData.draggedFromDate)"\n  class="cal-month-day {{ day.cssClass }}"\n  ng-class="{\n    \'cal-day-outmonth\': !day.inMonth,\n    \'cal-day-inmonth\': day.inMonth,\n    \'cal-day-weekend\': day.isWeekend,\n    \'cal-day-past\': day.isPast,\n    \'cal-day-today\': day.isToday,\n    \'cal-day-future\': day.isFuture,\n    \'cal-day-plan\': day.isPlanData\n   }">\n\n  <small\n    class="cal-events-num badge badge-important pull-left"\n    ng-show="day.badgeTotal > 0"\n    ng-bind="day.badgeTotal">\n  </small>\n\n  <span\n    class="pull-right"\n    data-cal-date\n    ng-click="vm.calendarCtrl.dateClicked(day.date)"\n    ng-bind="day.label">\n  </span>\n\n  <div class="cal-day-tick" ng-show="dayIndex === vm.openDayIndex && vm.view[vm.openDayIndex].events.length > 0 && !vm.slideBoxDisabled">\n    <i class="glyphicon glyphicon-chevron-up"></i>\n    <i class="fa fa-chevron-up"></i>\n  </div>\n\n  <ng-include src="vm.calendarConfig.templates.calendarMonthCellEvents"></ng-include>\n\n  <div id="cal-week-box" ng-if="$first && rowHovered">\n    <span ng-bind="vm.calendarConfig.i18nStrings.weekNumber.replace(\'{week}\', day.date.clone().add(1, \'day\').isoWeek())"></span>\n  </div>\n\n</div>\n'
    }, function (e, n) {
        e.exports = '<div class="events-list" ng-show="day.events.length > 0">\n  <a\n    ng-repeat="event in day.events | orderBy:\'startsAt\' track by event.$id"\n    href="javascript:;"\n    ng-click="$event.stopPropagation(); vm.onEventClick({calendarEvent: event})"\n    class="pull-left event"\n    ng-class="\'event-\' + event.type + \' \' + event.cssClass"\n    ng-mouseenter="vm.highlightEvent(event, true)"\n    ng-mouseleave="vm.highlightEvent(event, false)"\n    tooltip-append-to-body="true"\n    uib-tooltip-html="((event.startsAt | calendarDate:\'time\':true) + (vm.calendarConfig.displayEventEndTimes && event.endsAt ? \' - \' + (event.endsAt | calendarDate:\'time\':true) : \'\') + \' - \' + event.title) | calendarTrustAsHtml"\n    mwl-draggable="event.draggable === true"\n    drop-data="{event: event, draggedFromDate: day.date.toDate()}">\n  </a>\n</div>\n'
    }, function (e, n) {
        e.exports = '<div class="cal-row-fluid cal-row-head">\n\n  <div class="cal-cell1" ng-repeat="day in vm.weekDays track by $index" ng-bind="day"></div>\n\n</div>\n<div class="cal-month-box">\n\n  <div\n    ng-repeat="rowOffset in vm.monthOffsets track by rowOffset"\n    ng-mouseenter="rowHovered = true"\n    ng-mouseleave="rowHovered = false">\n    <div class="cal-row-fluid cal-before-eventlist">\n      <div\n        ng-repeat="day in vm.view | calendarLimitTo:7:rowOffset track by $index"\n        ng-init="dayIndex = vm.view.indexOf(day)"\n        class="cal-cell1 cal-cell {{ day.highlightClass }}"\n        ng-click="vm.dayClicked(day, false, $event)"\n        ng-class="{pointer: day.events.length > 0}">\n        <ng-include src="vm.calendarConfig.templates.calendarMonthCell"></ng-include>\n      </div>\n    </div>\n\n    <mwl-calendar-slide-box\n      is-open="vm.openRowIndex === $index && vm.view[vm.openDayIndex].events.length > 0 && !vm.slideBoxDisabled"\n      events="vm.view[vm.openDayIndex].events"\n      on-event-click="vm.onEventClick"\n      edit-event-html="vm.editEventHtml"\n      on-edit-event-click="vm.onEditEventClick"\n      delete-event-html="vm.deleteEventHtml"\n      on-delete-event-click="vm.onDeleteEventClick">\n    </mwl-calendar-slide-box>\n\n  </div>\n\n</div>\n'
    }, function (e, n) {
        e.exports = '<div class="cal-slide-box" uib-collapse="vm.isCollapsed" mwl-collapse-fallback="vm.isCollapsed">\n  <div class="cal-slide-content cal-event-list">\n    <ul class="unstyled list-unstyled">\n\n      <li\n        ng-repeat="event in vm.events | orderBy:\'startsAt\' track by event.$id"\n        ng-class="event.cssClass"\n        mwl-draggable="event.draggable === true"\n        drop-data="{event: event}">\n        <span class="pull-left event" ng-class="\'event-\' + event.type"></span>\n        &nbsp;\n        <a\n          href="javascript:;"\n          class="event-item"\n          ng-click="vm.onEventClick({calendarEvent: event})">\n          <span ng-bind-html="vm.$sce.trustAsHtml(event.title)"></span>\n          (<span ng-bind="event.startsAt | calendarDate:(isMonthView ? \'time\' : \'datetime\'):true"></span><span ng-if="vm.calendarConfig.displayEventEndTimes && event.endsAt"> - <span ng-bind="event.endsAt | calendarDate:(isMonthView ? \'time\' : \'datetime\'):true"></span></span>)\n        </a>\n\n        <a\n          href="javascript:;"\n          class="event-item-edit"\n          ng-if="vm.editEventHtml && event.editable !== false"\n          ng-bind-html="vm.$sce.trustAsHtml(vm.editEventHtml)"\n          ng-click="vm.onEditEventClick({calendarEvent: event})">\n        </a>\n\n        <a\n          href="javascript:;"\n          class="event-item-delete"\n          ng-if="vm.deleteEventHtml && event.deletable !== false"\n          ng-bind-html="vm.$sce.trustAsHtml(vm.deleteEventHtml)"\n          ng-click="vm.onDeleteEventClick({calendarEvent: event})">\n        </a>\n      </li>\n\n    </ul>\n  </div>\n</div>\n'
    }, function (e, n) {
        e.exports = '<div class="cal-week-box" ng-class="{\'cal-day-box\': vm.showTimes}">\n  <div class="cal-row-fluid cal-row-head">\n\n    <div\n      class="cal-cell1"\n      ng-repeat="day in vm.view.days track by $index"\n      ng-class="{\n        \'cal-day-weekend\': day.isWeekend,\n        \'cal-day-past\': day.isPast,\n        \'cal-day-today\': day.isToday,\n        \'cal-day-future\': day.isFuture}"\n      mwl-element-dimensions="vm.dayColumnDimensions"\n      mwl-droppable\n      on-drop="vm.eventDropped(dropData.event, day.date)">\n\n      <span ng-bind="day.weekDayLabel"></span>\n      <br>\n      <small>\n        <span\n          data-cal-date\n          ng-click="vm.calendarCtrl.dateClicked(day.date)"\n          class="pointer"\n          ng-bind="day.dayLabel">\n        </span>\n      </small>\n\n    </div>\n\n  </div>\n\n  <div class="cal-day-panel clearfix" ng-style="{height: vm.showTimes ? (vm.dayViewHeight + \'px\') : \'auto\'}">\n\n    <mwl-calendar-hour-list\n      day-view-start="vm.dayViewStart"\n      day-view-end="vm.dayViewEnd"\n      day-view-split="vm.dayViewSplit"\n      day-width="vm.dayColumnDimensions.width"\n      view-date="vm.viewDate"\n      on-timespan-click="vm.onTimespanClick"\n      ng-if="vm.showTimes">\n    </mwl-calendar-hour-list>\n\n    <div class="row">\n      <div class="col-xs-12">\n        <div\n          class="cal-row-fluid"\n          ng-repeat="event in vm.view.events track by event.$id">\n          <div\n            ng-class="\'cal-cell\' + (vm.showTimes ? 1 : event.daySpan) + (vm.showTimes ? \'\' : \' cal-offset\' + event.dayOffset) + \' day-highlight dh-event-\' + event.type + \' \' + event.cssClass"\n            ng-style="{\n              top: vm.showTimes ? ((event.top + 2) + \'px\') : \'auto\',\n              position: vm.showTimes ? \'absolute\' : \'inherit\',\n              width: vm.showTimes ? (vm.dayColumnDimensions.width + \'px\') : \'\',\n              left: vm.showTimes ? (vm.dayColumnDimensions.width * event.dayOffset) + 15 + \'px\' : \'\'\n            }"\n            data-event-class\n            mwl-draggable="event.draggable === true"\n            axis="vm.showTimes ? \'xy\' : \'x\'"\n            snap-grid="vm.showTimes ? {x: vm.dayColumnDimensions.width, y: vm.dayViewEventChunkSize || 30} : {x: vm.dayColumnDimensions.width}"\n            on-drag="vm.tempTimeChanged(event, y / 30)"\n            on-drag-end="vm.weekDragged(event, x / vm.dayColumnDimensions.width, y / 30)"\n            mwl-resizable="event.resizable === true && event.endsAt && !vm.showTimes"\n            resize-edges="{left: true, right: true}"\n            on-resize-end="vm.weekResized(event, edge, x / vm.dayColumnDimensions.width)">\n            <strong ng-bind="(event.tempStartsAt || event.startsAt) | calendarDate:\'time\':true" ng-show="vm.showTimes"></strong>\n            <a\n              href="javascript:;"\n              ng-click="vm.onEventClick({calendarEvent: event})"\n              class="event-item"\n              ng-bind-html="vm.$sce.trustAsHtml(event.title)"\n              uib-tooltip-html="event.title | calendarTrustAsHtml"\n              tooltip-placement="left"\n              tooltip-append-to-body="true">\n            </a>\n          </div>\n        </div>\n      </div>\n\n    </div>\n\n  </div>\n</div>\n'
    }, function (e, n) {
        e.exports = '<div class="cal-year-box">\n  <div ng-repeat="rowOffset in [0, 4, 8] track by rowOffset">\n    <div class="row cal-before-eventlist">\n      <div\n        class="span3 col-md-3 col-xs-6 cal-cell {{ day.cssClass }}"\n        ng-repeat="month in vm.view | calendarLimitTo:4:rowOffset track by $index"\n        ng-init="monthIndex = vm.view.indexOf(month)"\n        ng-click="vm.monthClicked(month, false, $event)"\n        ng-class="{pointer: month.events.length > 0, \'cal-day-today\': month.isToday}"\n        mwl-droppable\n        on-drop="vm.handleEventDrop(dropData.event, month.date)">\n\n        <div\n          class="month-name"\n          data-cal-date\n          ng-click="vm.calendarCtrl.dateClicked(month.date)"\n          ng-bind="month.label">\n        </div>\n        <div\n        class="cal-row-fluid cal-row-head"\n>        <div\n          class="cal-cell1"\n          ng-repeat="day in vm.weekDays track by $index"\n          ng-bind="day">\n        </div>\n        </div>\n\n        <div\n        class="cal-month-box">\n        <div\n        ng-repeat="rowOffset in month.monthOffsets track by rowOffset">\n        <div\n        class="cal-row-fluid cal-before-eventlist">\n        <div\n        ng-repeat="day in month.monthData | calendarLimitTo:7:rowOffset track by $index"\n        class="cal-cell1 cal-cell {{ day.highlightClass }}"\n        ng-class="{pointer: day.events.length > 0}">\n        <ng-include src="vm.calendarConfig.templates.calendarMonthCell"></ng-include>\n        </div>\n        </div>\n\n        <mwl-calendar-slide-box\n      is-open="vm.openRowIndex === $index && vm.view[vm.openDayIndex].events.length > 0 && !vm.slideBoxDisabled"\n      events="vm.view[vm.openDayIndex].events"\n      on-event-click="vm.onEventClick"\n      edit-event-html="vm.editEventHtml"\n      on-edit-event-click="vm.onEditEventClick"\n      delete-event-html="vm.deleteEventHtml"\n      on-delete-event-click="vm.onDeleteEventClick">\n    </mwl-calendar-slide-box>\n\n        </div>\n        </div>\n        <small\n          class="cal-events-num badge badge-important pull-left"\n          ng-show="month.badgeTotal > 0"\n          ng-bind="month.badgeTotal">\n        </small>\n\n        <div\n          class="cal-day-tick"\n          ng-show="monthIndex === vm.openMonthIndex && vm.view[vm.openMonthIndex].events.length > 0 && !vm.slideBoxDisabled">\n          <i class="glyphicon glyphicon-chevron-up"></i>\n          <i class="fa fa-chevron-up"></i>\n        </div>\n\n      </div>\n    </div>\n\n    <mwl-calendar-slide-box\n      is-open="vm.openRowIndex === $index && vm.view[vm.openMonthIndex].events.length > 0 && !vm.slideBoxDisabled"\n      events="vm.view[vm.openMonthIndex].events"\n      on-event-click="vm.onEventClick"\n      edit-event-html="vm.editEventHtml"\n      on-edit-event-click="vm.onEditEventClick"\n      delete-event-html="vm.deleteEventHtml"\n      on-delete-event-click="vm.onDeleteEventClick">\n    </mwl-calendar-slide-box>\n\n  </div>\n\n</div>\n'
    }, function (e, n, t) {
        function a(e) {
            return t(i(e))
        }

        function i(e) {
            return l[e] || function () {
                    throw new Error("Cannot find module '" + e + "'.")
                }()
        }

        var l = {
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
            return Object.keys(l)
        }, a.resolve = i, e.exports = a, a.id = 23
    }, function (e, n, t) {
        "use strict";
        var a = t(12);
        a.module("mwl.calendar").controller("MwlCalendarCtrl", ["$scope", "$log", "$timeout", "$attrs", "$locale", "moment", "calendarTitle", "calendarHelper", function (e, n, t, i, l, r, d, o) {
            function s(e) {
                return e.startsAt || n.warn("Bootstrap calendar: ", "Event is missing the startsAt field", e), a.isDate(e.startsAt) || n.warn("Bootstrap calendar: ", "Event startsAt should be a javascript date object. Do `new Date(event.startsAt)` to fix it.", e), a.isDefined(e.endsAt) && (a.isDate(e.endsAt) || n.warn("Bootstrap calendar: ", "Event endsAt should be a javascript date object. Do `new Date(event.endsAt)` to fix it.", e), r(e.startsAt).isAfter(r(e.endsAt)) && n.warn("Bootstrap calendar: ", "Event cannot start after it finishes", e)), !0
            }

            function c() {
                d[v.view] && a.isDefined(i.viewTitle) && (v.viewTitle = d[v.view](v.viewDate)), v.events = v.events.filter(s).map(function (e, n) {
                    return Object.defineProperty(e, "$id", {enumerable: !1, configurable: !0, value: n}), e
                });
                var n = r(v.viewDate), l = !0;
                m.clone().startOf(v.view).isSame(n.clone().startOf(v.view)) && !m.isSame(n) && v.view === u && (l = !1), m = n, u = v.view, l && t(function () {
                    e.$broadcast("calendar.refreshView")
                });
                if(v.view == 'year'){
                   var f = 0;
                    for (v.yearView = [], v.offsets = []; 12 > f;) {
                        var p = new Date;
                        p.setMonth(f), v.monthView = o.getMonthView(v.events, p, v.cellModifier, v.planItems);
                        var w = Math.floor(v.monthView.length / 7);
                        v.monthOffsets = [];
                        for (var h = 0; w > h; h++)v.monthOffsets.push(7 * h);
                        v.yearView.push(v.monthView), v.offsets.push(v.monthOffsets), f++
                    }
                }
            }

            var v = this;
            v.events = v.events || [], v.changeView = function (e, n) {
                v.view = e, v.viewDate = n
            }, v.dateClicked = function (e) {
                var n = r(e).toDate(), t = {year: "month", month: "day", week: "day"};
                v.onViewChangeClick({calendarDate: n, calendarNextView: t[v.view]}) !== !1 && v.changeView(t[v.view], n)
            };
            var m = r(v.viewDate), u = v.view;
            o.loadTemplates().then(function () {
                v.templatesLoaded = !0;
                var n = !1;
                e.$watchGroup(["vm.viewDate", "vm.view", "vm.cellIsOpen", function () {
                    return r.locale() + l.id
                }], function () {
                    //n ? c() : (n = !0, e.$watch("vm.events", c, !0))
                    n ? c() : (n = !0, e.$watch("vm.planItems", c, !0))
                })
            })["catch"](function (e) {
                n.error("Could not load all calendar templates", e)
            });
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
            var i = this;
            i.$sce = n, e.$on("calendar.refreshView", function () {
                i.dayViewSplit = i.dayViewSplit || 30, i.dayViewHeight = a.getDayViewHeight(i.dayViewStart, i.dayViewEnd, i.dayViewSplit);
                var e = a.getDayView(i.events, i.viewDate, i.dayViewStart, i.dayViewEnd, i.dayViewSplit);
                i.allDayEvents = e.filter(function (e) {
                    return e.allDay
                }), i.nonAllDayEvents = e.filter(function (e) {
                    return !e.allDay
                })
            }), i.eventDragComplete = function (e, n) {
                var a = n * i.dayViewSplit, l = t(e.startsAt).add(a, "minutes"), r = t(e.endsAt).add(a, "minutes");
                delete e.tempStartsAt, i.onEventTimesChanged({
                    calendarEvent: e,
                    calendarNewEventStart: l.toDate(),
                    calendarNewEventEnd: e.endsAt ? r.toDate() : null
                })
            }, i.eventDragged = function (e, n) {
                var a = n * i.dayViewSplit;
                e.tempStartsAt = t(e.startsAt).add(a, "minutes").toDate()
            }, i.eventResizeComplete = function (e, n, a) {
                var l = a * i.dayViewSplit, r = t(e.startsAt), d = t(e.endsAt);
                "start" === n ? r.add(l, "minutes") : d.add(l, "minutes"), delete e.tempStartsAt, i.onEventTimesChanged({
                    calendarEvent: e,
                    calendarNewEventStart: r.toDate(),
                    calendarNewEventEnd: d.toDate()
                })
            }, i.eventResized = function (e, n, a) {
                var l = a * i.dayViewSplit;
                "start" === n && (e.tempStartsAt = t(e.startsAt).add(l, "minutes").toDate())
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
        a.module("mwl.calendar").controller("MwlCalendarHourListCtrl", ["$scope", "$attrs", "moment", "calendarConfig", "calendarHelper", function (e, n, t, a, i) {
            function l() {
                r = t(o.dayViewStart || "00:00", "HH:mm"), d = t(o.dayViewEnd || "23:00", "HH:mm"), o.dayViewSplit = parseInt(o.dayViewSplit), o.hours = [];
                var e = t(o.viewDate).clone();
                n.dayWidth && (e = e.startOf("week")), e.hours(r.hours()).minutes(r.minutes()).seconds(r.seconds());
                for (var l = 0; l <= d.diff(r, "hours"); l++)o.hours.push({
                    label: i.formatDate(e, a.dateFormats.hour),
                    date: e.clone()
                }), e.add(1, "hour");
                o.hourChunks = [];
                for (var s = 0; s < 60 / o.dayViewSplit; s++)o.hourChunks.push(s)
            }

            var r, d, o = this, s = t.locale();
            e.$on("calendar.refreshView", function () {
                s !== t.locale() && (s = t.locale(), l())
            }), e.$watchGroup(["vm.dayViewStart", "vm.dayViewEnd", "vm.dayViewSplit", "vm.viewDate"], function () {
                l()
            }), o.eventDropped = function (e, n) {
                var a = t(n), l = i.adjustEndDateFromStartDiff(e.startsAt, a, e.endsAt);
                o.onEventTimesChanged({
                    calendarEvent: e,
                    calendarDate: n,
                    calendarNewEventStart: a.toDate(),
                    calendarNewEventEnd: l ? l.toDate() : null
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
        a.module("mwl.calendar").controller("MwlCalendarMonthCtrl", ["$scope", "moment", "calendarHelper", "calendarConfig", "$timeout", "$filter", function (e, n, t, a, i, l) {
            var r = this;
            r.calendarConfig = a, r.openRowIndex = null, e.$on("calendar.refreshView", function () {
                r.weekDays = t.getWeekDayNames(), r.view = t.getMonthView(r.events, r.viewDate, r.cellModifier, r.planItems);
                var e = Math.floor(r.view.length / 7);
                r.monthOffsets = [];
                for (var a = 0; e > a; a++)r.monthOffsets.push(7 * a);
                r.cellIsOpen && null === r.openRowIndex && (r.openDayIndex = null, r.view.forEach(function (e) {
                    e.inMonth && n(r.viewDate).startOf("day").isSame(e.date) && r.dayClicked(e, !0)
                }))
            }), r.dayClicked = function (e, n, t) {
                if (n || (r.onTimespanClick({
                        calendarDate: e.date.toDate(),
                        calendarCell: e,
                        $event: t
                    }), !t || !t.defaultPrevented)) {
                    r.openRowIndex = null;
                    var a = r.view.indexOf(e);
                    a === r.openDayIndex ? (r.openDayIndex = null, r.cellIsOpen = !1) : (r.openDayIndex = a, r.openRowIndex = Math.floor(a / 7), r.cellIsOpen = !0)
                }
            }, r.highlightEvent = function (e, n) {
                r.view.forEach(function (t) {
                    if (delete t.highlightClass, n) {
                        var a = t.events.indexOf(e) > -1;
                        a && (t.highlightClass = "day-highlight dh-event-" + e.type)
                    }
                })
            }, r.handleEventDrop = function (e, a, i) {
                var l = n(e.startsAt).date(n(a).date()).month(n(a).month()).year(n(a).year()), d = t.adjustEndDateFromStartDiff(e.startsAt, l, e.endsAt);
                r.onEventTimesChanged({
                    calendarEvent: e,
                    calendarDate: a,
                    calendarNewEventStart: l.toDate(),
                    calendarNewEventEnd: d ? d.toDate() : null,
                    calendarDraggedFromDate: i
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
            var i = this;
            i.$sce = e, i.calendarConfig = a, i.isCollapsed = !0, n.$watch("vm.isOpen", function (e) {
                t(function () {
                    i.isCollapsed = !e
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
        a.module("mwl.calendar").controller("MwlCalendarWeekCtrl", ["$scope", "$sce", "moment", "calendarHelper", "calendarConfig", function (e, n, t, a, i) {
            var l = this;
            l.showTimes = i.showTimesOnWeekView, l.$sce = n, e.$on("calendar.refreshView", function () {
                l.dayViewSplit = l.dayViewSplit || 30, l.dayViewHeight = a.getDayViewHeight(l.dayViewStart, l.dayViewEnd, l.dayViewSplit), l.showTimes ? l.view = a.getWeekViewWithTimes(l.events, l.viewDate, l.dayViewStart, l.dayViewEnd, l.dayViewSplit) : l.view = a.getWeekView(l.events, l.viewDate)
            }), l.weekDragged = function (e, n, a) {
                var i = t(e.startsAt).add(n, "days"), r = t(e.endsAt).add(n, "days");
                if (a) {
                    var d = a * l.dayViewSplit;
                    i = i.add(d, "minutes"), r = r.add(d, "minutes")
                }
                delete e.tempStartsAt, l.onEventTimesChanged({
                    calendarEvent: e,
                    calendarNewEventStart: i.toDate(),
                    calendarNewEventEnd: e.endsAt ? r.toDate() : null
                })
            }, l.eventDropped = function (e, n) {
                var a = t(n).diff(t(e.startsAt), "days");
                l.weekDragged(e, a)
            }, l.weekResized = function (e, n, a) {
                var i = t(e.startsAt), r = t(e.endsAt);
                "start" === n ? i.add(a, "days") : r.add(a, "days"), l.onEventTimesChanged({
                    calendarEvent: e,
                    calendarNewEventStart: i.toDate(),
                    calendarNewEventEnd: r.toDate()
                })
            }, l.tempTimeChanged = function (e, n) {
                var a = n * l.dayViewSplit;
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
        a.module("mwl.calendar").controller("MwlCalendarYearCtrl", ["$scope", "moment", "calendarHelper", "calendarConfig", "$filter", function (e, n, t, a, i) {
            var l = this;
            l.calendarConfig = a, l.openMonthIndex = null, l.openRowIndex = null, e.$on("calendar.refreshView", function () {
                l.weekDays = t.getWeekDayNames(), l.view = t.getYearView(l.events, l.viewDate, l.cellModifier), l.yearCount = 0;
                var e = l.viewDate, a = i("date")(new Date, "dd-MM-yyyy"), r = i("date")(l.viewDate, "dd-MM-yyyy");
                if (a == r)for (; l.yearCount < 12;)l.monthView = l.yearView[l.yearCount], l.monthOffsets = l.offsets[l.yearCount], l.view[l.yearCount].monthData = l.monthView, l.view[l.yearCount].monthOffsets = l.monthOffsets, l.yearCount++; else l.view.forEach(function (n) {
                    e.setMonth(l.yearCount), l.monthView = t.getMonthView(l.events, e, l.cellModifier, l.planItems);
                    var a = Math.floor(l.monthView.length / 7);
                    l.monthOffsets = [];
                    for (var i = 0; a > i; i++)l.monthOffsets.push(7 * i);
                    l.view[l.yearCount].monthData = l.monthView, l.view[l.yearCount].monthOffsets = l.monthOffsets, l.yearCount++
                });
                l.cellIsOpen && null === l.openMonthIndex && null === l.openRowIndex && (l.openMonthIndex = null, l.openDayIndex = null, l.view.forEach(function (e) {
                    n(l.viewDate).startOf("month").isSame(e.date) && l.monthClicked(e, !0)
                }), l.view.forEach(function (e) {
                    e.inMonth && n(l.viewDate).startOf("day").isSame(e.date) && l.dayClicked(e, !0)
                }))
            }), l.monthClicked = function (e, n, t) {
                if (n || (l.onTimespanClick({
                        calendarDate: e.date.toDate(),
                        calendarCell: e,
                        $event: t
                    }), !t || !t.defaultPrevented)) {
                    l.openRowIndex = null;
                    var a = l.view.indexOf(e);
                    a === l.openMonthIndex ? (l.openMonthIndex = null, l.cellIsOpen = !1) : (l.openMonthIndex = a, l.openRowIndex = Math.floor(a / 4), l.cellIsOpen = !0)
                }
            }, l.handleEventDrop = function (e, a) {
                var i = n(e.startsAt).month(n(a).month()).year(n(a).year()), r = t.adjustEndDateFromStartDiff(e.startsAt, i, e.endsAt);
                l.onEventTimesChanged({
                    calendarEvent: e,
                    calendarDate: a,
                    calendarNewEventStart: i.toDate(),
                    calendarNewEventEnd: r ? r.toDate() : null
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
        a.module("mwl.calendar").controller("MwlDateModifierCtrl", ["$element", "$attrs", "$scope", "moment", function (e, n, t, i) {
            function l() {
                a.isDefined(n.setToToday) ? r.date = new Date : a.isDefined(n.increment) ? r.date = i(r.date).add(1, r.increment).toDate() : a.isDefined(n.decrement) && (r.date = i(r.date).subtract(1, r.decrement).toDate()), t.$apply()
            }

            var r = this;
            e.bind("click", l), t.$on("$destroy", function () {
                e.unbind("click", l)
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
            function i(n) {
                return function (a) {
                    n && (t(n)(e), e.$apply()), a.preventDefault()
                }
            }

            function l() {
                n.on("mousedown", d), n.on("mousemove", o), n.on("mouseup", s)
            }

            function r() {
                n.off("mousedown", d), n.off("mousemove", o), n.off("mouseup", s)
            }

            var d = i(a.onDragSelectStart), o = i(a.onDragSelectMove), s = i(a.onDragSelectEnd);
            e.$watch(a.mwlDragSelect, function (e) {
                e ? l() : r()
            }), e.$on("$destroy", function () {
                r()
            })
        }]).directive("mwlDragSelect", function () {
            return {restrict: "A", controller: "MwlDragSelectCtrl"}
        })
    }, function (e, n, t) {
        "use strict";
        var a = t(12);
        a.module("mwl.calendar").controller("MwlDraggableCtrl", ["$element", "$scope", "$window", "$parse", "$attrs", "$timeout", "interact", function (e, n, t, i, l, r, d) {
            function o(e, n) {
                return e.css("-ms-transform", n).css("-webkit-transform", n).css("transform", n)
            }

            if (d) {
                var s, c;
                l.snapGrid && (c = i(l.snapGrid)(n), s = {targets: [d.createSnapGrid(c)]}), d(e[0]).draggable({
                    snap: s,
                    onstart: function (e) {
                        a.element(e.target).addClass("dragging-active"), e.target.dropData = i(l.dropData)(n), e.target.style.pointerEvents = "none", l.onDragStart && (i(l.onDragStart)(n), n.$apply())
                    },
                    onmove: function (e) {
                        var r = a.element(e.target), d = (parseFloat(r.attr("data-x")) || 0) + (e.dx || 0), s = (parseFloat(r.attr("data-y")) || 0) + (e.dy || 0);
                        switch (i(l.axis)(n)) {
                            case"x":
                                s = 0;
                                break;
                            case"y":
                                d = 0
                        }
                        "static" === t.getComputedStyle(r[0]).position && r.css("position", "relative"), o(r, "translate(" + d + "px, " + s + "px)").css("z-index", 50).attr("data-x", d).attr("data-y", s), l.onDrag && (i(l.onDrag)(n, {
                            x: d,
                            y: s
                        }), n.$apply())
                    },
                    onend: function (e) {
                        var t = a.element(e.target), d = t.attr("data-x"), s = t.attr("data-y");
                        e.target.style.pointerEvents = "auto", l.onDragEnd && (i(l.onDragEnd)(n, {
                            x: d,
                            y: s
                        }), n.$apply()), r(function () {
                            o(t, "").css("z-index", "auto").removeAttr("data-x").removeAttr("data-y").removeClass("dragging-active")
                        })
                    }
                }), n.$watch(l.mwlDraggable, function (n) {
                    d(e[0]).draggable({enabled: n})
                }), n.$on("$destroy", function () {
                    d(e[0]).unset()
                })
            }
        }]).directive("mwlDraggable", function () {
            return {restrict: "A", controller: "MwlDraggableCtrl"}
        })
    }, function (e, n, t) {
        "use strict";
        var a = t(12);
        a.module("mwl.calendar").controller("MwlDroppableCtrl", ["$element", "$scope", "$parse", "$attrs", "interact", function (e, n, t, i, l) {
            if (l) {
                var r = i.dropActiveClass || "drop-active";
                l(e[0]).dropzone({
                    ondragenter: function (e) {
                        a.element(e.target).addClass(r)
                    }, ondragleave: function (e) {
                        a.element(e.target).removeClass(r)
                    }, ondropdeactivate: function (e) {
                        a.element(e.target).removeClass(r)
                    }, ondrop: function (e) {
                        e.relatedTarget.dropData && (t(i.onDrop)(n, {dropData: e.relatedTarget.dropData}), n.$apply())
                    }
                }), n.$on("$destroy", function () {
                    l(e[0]).unset()
                })
            }
        }]).directive("mwlDroppable", function () {
            return {restrict: "A", controller: "MwlDroppableCtrl"}
        })
    }, function (e, n, t) {
        "use strict";
        var a = t(12);
        a.module("mwl.calendar").controller("MwlElementDimensionsCtrl", ["$element", "$scope", "$parse", "$attrs", "$window", function (e, n, t, i, l) {
            function r() {
                t(i.mwlElementDimensions).assign(n, {
                    width: e[0].offsetWidth,
                    height: e[0].offsetHeight
                }), n.$applyAsync()
            }

            var d = a.element(l);
            d.bind("resize", r), r(), n.$on("$destroy", function () {
                d.unbind("resize", r)
            })
        }]).directive("mwlElementDimensions", function () {
            return {restrict: "A", controller: "MwlElementDimensionsCtrl"}
        })
    }, function (e, n, t) {
        "use strict";
        var a = t(12);
        a.module("mwl.calendar").controller("MwlResizableCtrl", ["$element", "$scope", "$parse", "$attrs", "$timeout", "interact", function (e, n, t, i, l, r) {
            function d(e, n) {
                var t = {};
                return t.edge = e, "start" === e ? (t.x = n.data("x"), t.y = n.data("y")) : "end" === e && (t.x = parseFloat(n.css("width").replace("px", "")) - v.width, t.y = parseFloat(n.css("height").replace("px", "")) - v.height), t
            }

            if (r) {
                var o, s;
                i.snapGrid && (s = t(i.snapGrid)(n), o = {targets: [r.createSnapGrid(s)]});
                var c, v = {}, m = {};
                r(e[0]).resizable({
                    edges: t(i.resizeEdges)(n), snap: o, onstart: function (e) {
                        c = "end";
                        var n = a.element(e.target);
                        v.height = n[0].offsetHeight, v.width = n[0].offsetWidth, m.height = n.css("height"), m.width = n.css("width")
                    }, onmove: function (e) {
                        if (e.rect.width > 0 && e.rect.height > 0) {
                            var l = a.element(e.target), r = parseFloat(l.data("x") || 0), o = parseFloat(l.data("y") || 0);
                            l.css({
                                width: e.rect.width + "px",
                                height: e.rect.height + "px"
                            }), r += e.deltaRect.left, o += e.deltaRect.top, l.css("transform", "translate(" + r + "px," + o + "px)"), l.data("x", r), l.data("y", o), (0 !== e.deltaRect.left || 0 !== e.deltaRect.top) && (c = "start"), i.onResize && (t(i.onResize)(n, d(c, l)), n.$apply())
                        }
                    }, onend: function (e) {
                        var r = a.element(e.target), o = d(c, r);
                        l(function () {
                            r.data("x", null).data("y", null).css({transform: "", width: m.width, height: m.height})
                        }), i.onResizeEnd && (t(i.onResizeEnd)(n, o), n.$apply())
                    }
                }), n.$watch(i.mwlResizable, function (n) {
                    r(e[0]).resizable({enabled: n})
                }), n.$on("$destroy", function () {
                    r(e[0]).unset()
                })
            }
        }]).directive("mwlResizable", function () {
            return {restrict: "A", controller: "MwlResizableCtrl"}
        })
    }, function (e, n, t) {
        function a(e) {
            return t(i(e))
        }

        function i(e) {
            return l[e] || function () {
                    throw new Error("Cannot find module '" + e + "'.")
                }()
        }

        var l = {
            "./calendarDate.js": 39,
            "./calendarLimitTo.js": 40,
            "./calendarTruncateEventTitle.js": 41,
            "./calendarTrustAsHtml.js": 42
        };
        a.keys = function () {
            return Object.keys(l)
        }, a.resolve = i, e.exports = a, a.id = 38
    }, function (e, n, t) {
        "use strict";
        var a = t(12);
        a.module("mwl.calendar").filter("calendarDate", ["calendarHelper", "calendarConfig", function (e, n) {
            function t(t, a, i) {
                return i === !0 && (a = n.dateFormats[a]), e.formatDate(t, a)
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
            return t(i(e))
        }

        function i(e) {
            return l[e] || function () {
                    throw new Error("Cannot find module '" + e + "'.")
                }()
        }

        var l = {
            "./calendarConfig.js": 44,
            "./calendarHelper.js": 45,
            "./calendarTitle.js": 46,
            "./interact.js": 47,
            "./moment.js": 49
        };
        a.keys = function () {
            return Object.keys(l)
        }, a.resolve = i, e.exports = a, a.id = 43
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
        a.module("mwl.calendar").factory("calendarHelper", ["$q", "$templateRequest", "dateFilter", "moment", "calendarConfig", "$filter", function (e, n, t, a, i, l) {
            function r(e, n) {
                if ("angular" === i.dateFormatter)return t(a(e).toDate(), n);
                if ("moment" === i.dateFormatter)return a(e).format(n);
                throw new Error("Unknown date formatter: " + i.dateFormatter)
            }

            function d(e, n, t) {
                if (!t)return t;
                var i = a(n).diff(a(e));
                return a(t).add(i)
            }

            function o(e, n, t) {
                var i = a(e.start), l = a(e.end), r = a(t);
                if (n) {
                    switch (n) {
                        case"year":
                            i.set({year: r.year()});
                            break;
                        case"month":
                            i.set({year: r.year(), month: r.month()});
                            break;
                        default:
                            throw new Error("Invalid value (" + n + ") given for recurs on. Can only be year or month.")
                    }
                    l = d(e.start, i, l)
                }
                return {start: i, end: l}
            }

            function s(e, n, t) {
                n = a(n), t = a(t);
                var i = o({start: e.startsAt, end: e.endsAt || e.startsAt}, e.recursOn, n), l = i.start, r = i.end;
                return l.isAfter(n) && l.isBefore(t) || r.isAfter(n) && r.isBefore(t) || l.isBefore(n) && r.isAfter(t) || l.isSame(n) || r.isSame(t)
            }

            function c(e, n, t) {
                return e.filter(function (e) {
                    return s(e, n, t)
                })
            }

            function v(e, n, t) {
                var i = a(e).startOf(n), l = a(e).endOf(n);
                return c(t, i, l)
            }

            function m(e) {
                return e.filter(function (e) {
                    return e.incrementsBadgeTotal !== !1
                }).length
            }

            function u() {
                for (var e = [], n = 0; 7 > n;)e.push(r(a().weekday(n++), i.dateFormats.weekDay));
                return e
            }

            function f(e, n, t) {
                for (var l = [], d = v(n, "year", e), o = a(n).startOf("year"), s = 0; 12 > s;) {
                    var u = o.clone(), f = u.clone().endOf("month"), p = c(d, u, f), w = {
                        label: r(u, i.dateFormats.month),
                        isToday: u.isSame(a().startOf("month")),
                        events: p,
                        date: u,
                        badgeTotal: m(p)
                    };
                    t({calendarCell: w}), l.push(w), o.add(1, "month"), s++
                }
                return l
            }

            function p(e, n, t, r) {
                var d, o = a(n).startOf("month"), s = o.clone().startOf("week"), v = a(n).endOf("month").endOf("week");
                d = i.displayAllMonthEvents ? c(e, s, v) : c(e, o, o.clone().endOf("month"));
                for (var u = [], f = a().startOf("day"); s.isBefore(v);) {
                    var p = s.month() === a(n).month(), w = [];
                    (p || i.displayAllMonthEvents) && (w = c(d, s, s.clone().endOf("day")));
                    var h = !1, y = l("date")(new Date(s.clone()), "dd-MM-yyyy");
                    r.forEach(function (e) {
                        var n = l("date")(e.plannedStartTime, "dd-MM-yyyy");
                        return y == n ? void(h = !0) : void 0
                    });
                    var g = {
                        label: s.date(),
                        date: s.clone(),
                        inMonth: p,
                        isPlanData: h,
                        isPast: f.isAfter(s),
                        isToday: f.isSame(s),
                        isFuture: f.isBefore(s),
                        isWeekend: [0, 6].indexOf(s.day()) > -1,
                        events: w,
                        badgeTotal: m(w)
                    };
                    t({calendarCell: g}), u.push(g), s.add(1, "day")
                }
                return u
            }

            function w(e, n) {
                for (var t = a(n).startOf("week"), l = a(n).endOf("week"), d = t.clone(), s = [], v = a().startOf("day"); s.length < 7;)s.push({
                    weekDayLabel: r(d, i.dateFormats.weekDay),
                    date: d.clone(),
                    dayLabel: r(d, i.dateFormats.day),
                    isPast: d.isBefore(v),
                    isToday: d.isSame(v),
                    isFuture: d.isAfter(v),
                    isWeekend: [0, 6].indexOf(d.day()) > -1
                }), d.add(1, "day");
                var m = c(e, t, l).map(function (e) {
                    var n, i = a(t).startOf("day"), r = a(l).startOf("day"), d = o({
                        start: a(e.startsAt).startOf("day"),
                        end: a(e.endsAt || e.startsAt).startOf("day")
                    }, e.recursOn, i), s = d.start, c = d.end;
                    return n = s.isBefore(i) || s.isSame(i) ? 0 : s.diff(i, "days"), c.isAfter(r) && (c = r), s.isBefore(i) && (s = i), e.daySpan = a(c).diff(s, "days") + 1, e.dayOffset = n, e
                });
                return {days: s, events: m}
            }

            function h(e, n, t, i, l) {
                var r = a(t || "00:00", "HH:mm").hours(), d = a(i || "23:00", "HH:mm").hours(), o = 60 / l * 30, v = a(n).startOf("day").add(r, "hours"), m = a(n).startOf("day").add(d + 1, "hours"), u = (d - r + 1) * o, f = o / 60, p = [], w = c(e, a(n).startOf("day").toDate(), a(n).endOf("day").toDate());
                return w.map(function (e) {
                    if (a(e.startsAt).isBefore(v) ? e.top = 0 : e.top = a(e.startsAt).startOf("minute").diff(v.startOf("minute"), "minutes") * f - 2, a(e.endsAt || e.startsAt).isAfter(m))e.height = u - e.top; else {
                        var n = e.startsAt;
                        a(e.startsAt).isBefore(v) && (n = v.toDate()), e.endsAt ? e.height = a(e.endsAt).diff(a(n), "minutes") * f : e.height = 30
                    }
                    return e.top - e.height > u && (e.height = 0), e.left = 0, e
                }).filter(function (e) {
                    return e.height > 0
                }).map(function (e) {
                    var n = !0;
                    return p.forEach(function (t, a) {
                        var i = !0;
                        t.filter(function (e) {
                            return !e.allDay
                        }).forEach(function (n) {
                            (s(e, n.startsAt, n.endsAt || n.startsAt) || s(n, e.startsAt, e.endsAt || e.startsAt)) && (i = !1)
                        }), i && n && (n = !1, e.left = 150 * a, p[a].push(e))
                    }), n && (e.left = 150 * p.length, p.push([e])), e
                })
            }

            function y(e, n, t, i, l) {
                var r = w(e, n), d = [];
                return r.days.forEach(function (e) {
                    var n = r.events.filter(function (n) {
                        return a(n.startsAt).startOf("day").isSame(a(e.date).startOf("day"))
                    }), o = h(n, e.date, t, i, l);
                    d = d.concat(o)
                }), r.events = d, r
            }

            function g(e, n, t) {
                var i = a(e || "00:00", "HH:mm"), l = a(n || "23:00", "HH:mm"), r = 60 / t * 30;
                return (l.diff(i, "hours") + 1) * r + 2
            }

            function D() {
                var t = Object.keys(i.templates).map(function (e) {
                    var t = i.templates[e];
                    return n(t)
                });
                return e.all(t)
            }

            return {
                getWeekDayNames: u,
                getYearView: f,
                getMonthView: p,
                getWeekView: w,
                getDayView: h,
                getWeekViewWithTimes: y,
                getDayViewHeight: g,
                adjustEndDateFromStartDiff: d,
                formatDate: r,
                loadTemplates: D,
                eventIsInPeriod: s
            }
        }])
    }, function (e, n, t) {
        "use strict";
        var a = t(12);
        a.module("mwl.calendar").factory("calendarTitle", ["moment", "calendarConfig", "calendarHelper", function (e, n, t) {
            function a(e) {
                return t.formatDate(e, n.titleFormats.day)
            }

            function i(t) {
                return n.titleFormats.week.replace("{week}", e(t).isoWeek()).replace("{year}", e(t).startOf("week").format("YYYY"))
            }

            function l(e) {
                return t.formatDate(e, n.titleFormats.month)
            }

            function r(e) {
                return t.formatDate(e, n.titleFormats.year)
            }

            return {day: a, week: i, month: l, year: r}
        }])
    }, function (e, n, t) {
        "use strict";
        var a, i = t(12);
        try {
            a = t(48)
        } catch (l) {
            a = null
        }
        i.module("mwl.calendar").constant("interact", a)
    }, function (e, t) {
        if ("undefined" == typeof n) {
            var a = new Error('Cannot find module "undefined"');
            throw a.code = "MODULE_NOT_FOUND", a
        }
        e.exports = n
    }, function (e, n, t) {
        "use strict";
        var a = t(12), i = t(50);
        i.locale('en_gb', {
            week: {dow: 1}
        });
        a.module("mwl.calendar").constant("moment", i)
    }, function (e, n) {
        e.exports = t
    }])
});
