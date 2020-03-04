/* =========================================================
 * Created by Sourabh Agrawal
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================= */

!function (e) {
  var t = function (e, t) {
    this.element = e, this.element.addClass("calendar"), this._initializeEvents(t), this._initializeOptions(t), this._render()
  };
  t.prototype = {
    constructor: t, _initializeOptions: function (t) {
      null == t && (t = []), this.options = {
        startYear: isNaN(parseInt(t.startYear)) ? (new Date).getFullYear() : parseInt(t.startYear),
        startMonth: isNaN(parseInt(t.startMonth)) ? (new Date).getMonth() : parseInt(t.startMonth),
        view: t.view ? t.view : "year",
        minDate: t.minDate instanceof Date ? t.minDate : null,
        maxDate: t.maxDate instanceof Date ? t.maxDate : null,
        language: null != t.language && null != n[t.language] ? t.language : "en",
        allowOverlap: null == t.allowOverlap || t.allowOverlap,
        displayWeekNumber: null != t.displayWeekNumber && t.displayWeekNumber,
        enableRangeSelection: null != t.enableRangeSelection && t.enableRangeSelection,
        disabledDays: t.disabledDays instanceof Array ? t.disabledDays : [],
        dataSource: t.dataSource instanceof Array != null ? t.dataSource : [],
        customDayRenderer: e.isFunction(t.customDayRenderer) ? t.customDayRenderer : null
      }
    }, _initializeEvents: function (e) {
      null == e && (e = []), e.renderEnd && this.element.bind("renderEnd", e.renderEnd), e.clickDay && this.element.bind("clickDay", e.clickDay)
    }, _render: function () {
      if (this.element.empty(), this._renderHeader(), this._renderBody(), this._renderDataSource(), this._applyEvents(), this.element.find(".months-container").addClass("animated zoomIn"), "year" === this.options.view) {
        let e = this;
        setTimeout(function () {
          let t = e.element.css("width");
          t > 0 && (t = (t = parseInt(t)) > 720 ? "25%" : t > 540 ? "33.33%" : "50%", e.element.find(".month-container").css({width: t}))
        }, 0)
      }
      this._triggerEvent("renderEnd", {
        currentYear: this.options.startYear,
        currentMonth: this.options.startMonth,
        view: this.options.view
      }), this.options.cb && this.options.cb({
        currentYear: this.options.startYear,
        view: this.options.view,
        currentMonth: this.options.startMonth
      })
    }, _renderHeader: function () {
      let t = e(document.createElement("div"));
      if (t.addClass("calendar-header panel panel-default"), "year" === this.options.view) {
        let n = e(document.createElement("table")), a = e(document.createElement("th"));
        a.addClass("prev"), null != this.options.minDate && this.options.minDate > new Date(this.options.startYear - 1, 11, 31) && a.addClass("disabled");
        let i = e(document.createElement("span"));
        i.addClass("fa fa-angle-left"), a.append(i), n.append(a);
        let s = e(document.createElement("th"));
        s.addClass("year-title year-neighbor2 hidden-sm hidden-xs"), s.text(this.options.startYear - 2), null != this.options.minDate && this.options.minDate > new Date(this.options.startYear - 2, 11, 31) && s.addClass("disabled"), n.append(s);
        let o = e(document.createElement("th"));
        o.addClass("year-title year-neighbor hidden-xs"), o.text(this.options.startYear - 1), null != this.options.minDate && this.options.minDate > new Date(this.options.startYear - 1, 11, 31) && o.addClass("disabled"), n.append(o);
        let r = e(document.createElement("th"));
        r.addClass("year-title"), r.text(this.options.startYear), n.append(r);
        let d = e(document.createElement("th"));
        d.addClass("year-title year-neighbor hidden-xs"), d.text(this.options.startYear + 1), null != this.options.maxDate && this.options.maxDate < new Date(this.options.startYear + 1, 0, 1) && d.addClass("disabled"), n.append(d);
        let l = e(document.createElement("th"));
        l.addClass("year-title year-neighbor2 hidden-sm hidden-xs"), l.text(this.options.startYear + 2), null != this.options.maxDate && this.options.maxDate < new Date(this.options.startYear + 2, 0, 1) && l.addClass("disabled"), n.append(l);
        let h = e(document.createElement("th"));
        h.addClass("next"), null != this.options.maxDate && this.options.maxDate < new Date(this.options.startYear + 1, 0, 1) && h.addClass("disabled");
        let c = e(document.createElement("span"));
        c.addClass("fa fa-angle-right"), h.append(c), n.append(h), t.append(n)
      } else {
        let a = e(document.createElement("div"));
        a.addClass("month-header");
        let i = e(document.createElement("i"));
        i.addClass("fa fa-angle-left"), a.append(i);
        let s = e(document.createElement("span"));
        s.addClass("month-title"), s.text(n[this.options.language].months[this.options.startMonth] + " " + this.options.startYear), a.append(s), t.append(a)
      }
      this.element.append(t)
    }, _renderBody: function () {
      let t = e(document.createElement("div"));
      if (t.addClass("months-container"), "year" === this.options.view) for (let e = 0; e < 12; e++) t.append(this._renderMonthBody(e)); else t.append(this._renderMonthBody(this.options.startMonth));
      this.element.append(t)
    }, _renderMonthBody: function (t) {
      let a = this, i = e(document.createElement("div"));
      i.addClass("month-container"), i.data("month-id", t);
      let s = new Date, o = new Date(this.options.startYear, t, 1), r = e(document.createElement("table"));
      r.addClass("month");
      let d = e(document.createElement("thead")), l = e(document.createElement("tr")),
        h = e(document.createElement("th"));
      "year" === this.options.view && (h.addClass("month-title"), h.attr("id", t), h.attr("colspan", this.options.displayWeekNumber ? 8 : 7), h.text(n[this.options.language].months[t]), l.append(h), d.append(l)), this.element.find(".day:not(.old, .new, .disabled)").click(function (t) {
        t.stopPropagation();
        let n = a._getDate(e(this));
        a._triggerEvent("clickDay", {element: e(this), which: t.which, date: n, events: a.getEvents(n)})
      });
      let c = e(document.createElement("tr"));
      if (this.options.displayWeekNumber) {
        let t = e(document.createElement("th"));
        t.addClass("week-number"), t.text(n[this.options.language].weekShort), c.append(t)
      }
      let m = n[this.options.language].weekStart;
      do {
        let t = e(document.createElement("th"));
        t.addClass("day-header"), "year" === this.options.view ? t.text(n[this.options.language].daysMin[m]) : t.text(n[this.options.language].daysShort[m]), c.append(t), ++m >= 7 && (m = 0)
      } while (m != n[this.options.language].weekStart);
      d.append(c), r.append(d);
      let u = new Date(o.getTime()), p = new Date(this.options.startYear, t + 1, 0),
        g = n[this.options.language].weekStart;
      for (; u.getDay() != g;) u.setDate(u.getDate() - 1);
      for (; u <= p;) {
        let n = e(document.createElement("tr"));
        if (this.options.displayWeekNumber) {
          let t = e(document.createElement("td"));
          t.addClass("week-number"), t.text(this.getWeekNumber(u)), n.append(t)
        }
        do {
          let a = e(document.createElement("td"));
          if (a.addClass("day"), u < o) a.addClass("old"); else if (u > p) a.addClass("new"); else {
            if (null != this.options.minDate && u < this.options.minDate || null != this.options.maxDate && u > this.options.maxDate) a.addClass("disabled"); else if (this.options.disabledDays.length > 0) for (let e in this.options.disabledDays) if (u.getTime() == this.options.disabledDays[e].getTime()) {
              a.addClass("disabled");
              break
            }
            let n = e(document.createElement("div")), i = "day-content";
            s.getDate() === u.getDate() && s.getMonth() === t && s.getFullYear() === u.getFullYear() && (i += " current-date"), [0, 6].indexOf(u.getDay()) > -1 && (i += " cal-day-weekend"), n.addClass(i);
            let o = e(document.createElement("span"));
            o.addClass("date"), o.text(u.getDate()), n.append(o), a.append(n), this.options.customDayRenderer && this.options.customDayRenderer(n, u)
          }
          n.append(a), u.setDate(u.getDate() + 1)
        } while (u.getDay() != g);
        r.append(n)
      }
      return i.append(r), i
    }, _renderDataSource: function () {
      const t = this;
      null != this.options.dataSource && this.options.dataSource.length > 0 ? this.element.find(".month-container").each(function () {
        let n = e(this).data("month-id"), a = new Date(t.options.startYear, n, 1),
          i = new Date(t.options.startYear, n + 1, 0);
        if ((null == t.options.minDate || i >= t.options.minDate) && (null == t.options.maxDate || a <= t.options.maxDate)) {
          let s = [];
          for (let e in t.options.dataSource) t.options.dataSource[e].startDate > i && !(t.options.dataSource[e].endDate < a) || s.push(t.options.dataSource[e]);
          s.length > 0 && e(this).find(".day-content").each(function () {
            let a = new Date(t.options.startYear, n, e(this).children(".date").text()), i = [];
            if ((null == t.options.minDate || a >= t.options.minDate) && (null == t.options.maxDate || a <= t.options.maxDate)) {
              for (let e in s) s[e].startDate <= a && s[e].endDate >= a && i.push(s[e]);
              t._renderDataSourceDay(e(this), a, i)
            }
          })
        }
      }) : this.options.dataSource && 0 === this.options.dataSource.length && this.element.find(".month-container").each(function () {
        e(this).find(".day-content").each(function () {
          e(this).children(".plan-time").remove(), e(this).removeClass("selected-blue").removeClass("selected-orange")
        })
      })
    }, _renderDataSourceDay: function (t, n, a) {
      t.children(".plan-time").remove()
      if (a.length > 0) {
        if ("year" !== this.options.view) {
          let n = e(document.createElement("div"));
          n.addClass("plan-time");
          for (let t in a) {
            let i = e(document.createElement("div"));
            if (a[t].endTime) {
              let n, s = e(document.createElement("i"));
              if (a[t].repeat) {
                let o = e(document.createElement("span"));
                s.addClass("fa fa-repeat"), i.append(s), o.text(a[t].repeat), i.append(o), n = "div"
              } else s.addClass("fa fa-clock-o"), i.append(s), n = "span";
              let o = e(document.createElement(n));
              o.text(this.getTime(a[t].plannedStartTime) + " - " + a[t].endTime), i.append(o)
            } else i.text(this.getTime(a[t].plannedStartTime));
            n.append(i)
          }
          t.append(n)
        }
        t.addClass("#eb8814" === a[0].color ? "selected-orange" : "selected-blue")
      } else t.removeClass("selected-blue").removeClass("selected-orange")
    }, _applyEvents: function () {
      let t = this;
      this.element.find(".year-neighbor, .year-neighbor2").click(function () {
        e(this).hasClass("disabled") || t.setYear(parseInt(e(this).text()))
      }), this.element.find(".calendar-header .prev").click(function () {
        e(this).hasClass("disabled") || t.setYear(t.options.startYear - 1)
      }), this.element.find(".calendar-header .next").click(function () {
        e(this).hasClass("disabled") || t.setYear(t.options.startYear + 1)
      }), this.element.find(".month-header .fa-angle-left").click(function () {
        t.options.view = "year", t._render()
      }), this.element.find(".month .month-title").click(function () {
        let n = e(this).attr("id");
        t.options.startMonth = parseInt(n), t.options.view = "month", t._render()
      }), this.element.find(".day:not(.old, .new, .disabled)").click(function (n) {
        n.stopPropagation();
        let a = t._getDate(e(this));
        t._triggerEvent("clickDay", {element: e(this), which: n.which, date: a, events: t.getEvents(a)})
      });
      let n = "month-container";
      "year" === this.options.view ? n += " col-md-3 col-sm-4 col-xs-6" : n += " month-view", e(t.element).find(".month-container").attr("class", n)
    }, _refreshRange: function () {
      let t = this;
      if (this.element.find("td.day.range").removeClass("range"), this.element.find("td.day.range-start").removeClass("range-start"), this.element.find("td.day.range-end").removeClass("range-end"), this._mouseDown) {
        let n = t._rangeStart < t._rangeEnd ? t._rangeStart : t._rangeEnd,
          a = t._rangeEnd > t._rangeStart ? t._rangeEnd : t._rangeStart;
        this.element.find(".month-container").each(function () {
          let i = e(this).data("month-id");
          n.getMonth() <= i && a.getMonth() >= i && e(this).find("td.day:not(.old, .new)").each(function () {
            let i = t._getDate(e(this));
            i >= n && i <= a && (e(this).addClass("range"), i.getTime() == n.getTime() && e(this).addClass("range-start"), i.getTime() == a.getTime() && e(this).addClass("range-end"))
          })
        })
      }
    }, _getDate: function (e) {
      let t = e.children(".day-content").children(".date").text(),
        n = e.closest(".month-container").data("month-id"), a = this.options.startYear;
      return new Date(a, n, t)
    }, _triggerEvent: function (t, n) {
      let a = e.Event(t);
      for (let e in n) a[e] = n[e];
      this.element.trigger(a)
    }, getWeekNumber: function (e) {
      let t = new Date(e.getTime());
      t.setHours(0, 0, 0, 0), t.setDate(t.getDate() + 3 - (t.getDay() + 6) % 7);
      let n = new Date(t.getFullYear(), 0, 4);
      return 1 + Math.round(((t.getTime() - n.getTime()) / 864e5 - 3 + (n.getDay() + 6) % 7) / 7)
    }, getEvents: function (e) {
      let t = [];
      if (this.options.dataSource && e) for (let n in this.options.dataSource) this.options.dataSource[n].startDate <= e && this.options.dataSource[n].endDate >= e && t.push(this.options.dataSource[n]);
      return t
    }, getYear: function () {
      return this.options.startYear
    }, getMonth: function () {
      return this.options.startMonth
    }, setYear: function (e) {
      let t = parseInt(e);
      isNaN(t) || (this.options.startYear = t, this._render())
    }, getMinDate: function () {
      return this.options.minDate
    }, setMinDate: function (e) {
      e instanceof Date && (this.options.minDate = e, this._render())
    }, getMaxDate: function () {
      return this.options.maxDate
    }, setMaxDate: function (e) {
      e instanceof Date && (this.options.maxDate = e, this._render())
    }, getAllowOverlap: function () {
      return this.options.allowOverlap
    }, setAllowOverlap: function (e) {
      this.options.allowOverlap = e
    }, getDisplayWeekNumber: function () {
      return this.options.displayWeekNumber
    }, setDisplayWeekNumber: function (e) {
      this.options.displayWeekNumber = e, this._render()
    }, getEnableRangeSelection: function () {
      return this.options.enableRangeSelection
    }, setEnableRangeSelection: function (e) {
      this.options.enableRangeSelection = e, this._render()
    }, getDisabledDays: function () {
      return this.options.disabledDays
    }, setDisabledDays: function (e) {
      this.options.disabledDays = e instanceof Array ? e : [], this._render()
    }, getLanguage: function () {
      return this.options.language
    }, setLanguage: function (e) {
      null != e && null != n[e] && (this.options.language = e, this._render())
    }, setView: function (e) {
      this.options.view = e
    }, getView: function () {
      return this.options.view
    }, setYearView: function (e) {
      this.options.view = e.view, this.setYear(e.year)
    }, setCallBack: function (e) {
      this.options.cb = e
    }, getDataSource: function () {
      return this.options.dataSource
    }, setDataSource: function (e) {
      this.options.dataSource = e instanceof Array ? e : [], this._renderDataSource()
    }, addEvent: function (e) {
      this.options.dataSource.push(e), this._render()
    }, getTime: function (e) {
      if (sessionStorage.preferences) {
        if (!e) return "";
        let t = JSON.parse(sessionStorage.preferences).dateFormat, n = "HH:mm:ss";
        if (null != (t.match(/HH:mm:ss/gi) || t.match(/HH:mm/gi) || t.match(/hh:mm:ss A/gi) || t.match(/hh:mm A/gi))) {
          let e = (t.match(/HH:mm:ss/gi) || t.match(/HH:mm/gi) || t.match(/hh:mm:ss A/gi) || t.match(/hh:mm A/gi)) + "";
          n = e.match(/hh/g) ? e + " a" : e
        }
        return moment(e).format(n)
      }
    }
  }, e.fn.calendar = function (n) {
    let a = new t(e(this), n);
    return e(this).data("calendar", a), a
  }, e.fn.renderEnd = function (t) {
    e(this).bind("renderEnd", t)
  }, e.fn.clickDay = function (t) {
    e(this).bind("clickDay", t)
  };
  let n = e.fn.calendar.dates = {
    en: {
      daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      daysMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
      months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
      monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      weekShort: "W",
      weekStart: 1
    },
    fr: {
      days: ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"],
      daysShort: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
      daysMin: ["D", "L", "Ma", "Me", "J", "V", "S", "D"],
      months: ["Janvier", "FÃ©vrier", "Mars", "Avril", "Mai", "Juin", "Juillet", "AoÃ»t", "Septembre", "Octobre", "Novembre", "DÃ©cembre"],
      monthsShort: ["Jan", "FÃ©v", "Mar", "Avr", "Mai", "Jui", "Jul", "Aou", "Sep", "Oct", "Nov", "DÃ©c"],
      weekShort: "S",
      weekStart: 1
    },
    ja: {
      days: ["日曜", "月曜", "火曜", "水曜", "木曜", "金曜", "土曜"],
      daysShort: ["日", "月", "火", "水", "木", "金", "土"],
      daysMin: ["日", "月", "火", "水", "木", "金", "土"],
      months: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
      monthsShort: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
      weekShort: "週",
      weekStart: 0
    },
    de: {
      days: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
      daysShort: ["Son", "Mon", "Die", "Mit", "Don", "Fre", "Sam"],
      daysMin: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
      months: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
      monthsShort: ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"],
      weekShort: "W",
      weekStart: 1
    }
  };
  e(function () {
    e('[data-provide="calendar"]').each(function () {
      e(this).calendar()
    })
  })
}(window.jQuery);
