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

(function ($) {
  var Calendar = function (element, options) {
    this.element = element;
    this.element.addClass('calendar');
    this._initializeEvents(options);
    this._initializeOptions(options);
    this._render();
  };

  Calendar.prototype = {
    constructor: Calendar,
    _initializeOptions: function (opt) {
      if (opt == null) {
        opt = [];
      }
      this.options = {
        startYear: !isNaN(parseInt(opt.startYear)) ? parseInt(opt.startYear) : new Date().getFullYear(),
        startMonth: !isNaN(parseInt(opt.startMonth)) ? parseInt(opt.startMonth) : opt.selectedDate ? new Date(opt.selectedDate).getMonth() : new Date().getMonth(),
        view: opt.view ? opt.view : 'year',
        rangeSelection: !!opt.rangeSelection,
        selectedDate: opt.selectedDate ? new Date(opt.selectedDate) : null,
        minDate: opt.minDate instanceof Date ? opt.minDate : null,
        maxDate: opt.maxDate instanceof Date ? opt.maxDate : null,
        language: opt.language,
        allowOverlap: opt.allowOverlap != null ? opt.allowOverlap : true,
        displayWeekNumber: opt.displayWeekNumber != null ? opt.displayWeekNumber : false,
        disabledDays: opt.disabledDays instanceof Array ? opt.disabledDays : [],
        dataSource: opt.dataSource instanceof Array != null ? opt.dataSource : [],
        customDayRenderer: $.isFunction(opt.customDayRenderer) ? opt.customDayRenderer : null
      };
    },
    _initializeEvents: function (opt) {
      if (opt == null) {
        opt = [];
      }
      if (opt.renderEnd) {
        this.element.bind('renderEnd', opt.renderEnd);
      }
      if (opt.clickDay) {
        this.element.bind('clickDay', opt.clickDay);
      }
      if (opt.rangeEnd) {
        this.element.bind('rangeEnd', opt.rangeEnd);
      }
    },

    _render: function () {
      this.element.empty();
      this._renderHeader();
      this._renderBody();
      this._renderDataSource();
      this._applyEvents();

      this.element.find('.months-container').fadeIn(0);
      this.element.find('.months-container').addClass('animated zoomIn');
      //Make Responsive year view
      if (this.options.view === 'year') {
        let _this = this;
        setTimeout(function () {
          let t = _this.element.css('width');
          t > 0 && (t = (t = parseInt(t)) > 720 ? "25%" : t > 540 ? "33.33%" : "50%", e.element.find(".month-container").css({width: t}))
        }, 0);
      }
      this._triggerEvent('renderEnd', {
        currentYear: this.options.startYear,
        currentMonth: this.options.startMonth,
        view: this.options.view
      });
      if (this.options.cb) {
        this.options.cb({
          currentYear: this.options.startYear,
          view: this.options.view,
          currentMonth: this.options.startMonth
        });
      }
    },
    _renderHeader: function () {
      let header = $(document.createElement('div'));
      header.addClass('calendar-header panel panel-default');

      if (this.options.view === 'year') {
        let headerTable = $(document.createElement('table'));

        let prevDiv = $(document.createElement('th'));
        prevDiv.addClass('prev');

        if (this.options.minDate != null && this.options.minDate > new Date(this.options.startYear - 1, 11, 31)) {
          prevDiv.addClass('disabled');
        }

        let prevIcon = $(document.createElement('span'));
        prevIcon.addClass('fa fa-angle-left');

        prevDiv.append(prevIcon);

        headerTable.append(prevDiv);

        let prev2YearDiv = $(document.createElement('th'));
        prev2YearDiv.addClass('year-title year-neighbor2 hidden-sm hidden-xs');
        prev2YearDiv.text(this.options.startYear - 2);

        if (this.options.minDate != null && this.options.minDate > new Date(this.options.startYear - 2, 11, 31)) {
          prev2YearDiv.addClass('disabled');
        }

        headerTable.append(prev2YearDiv);

        let prevYearDiv = $(document.createElement('th'));
        prevYearDiv.addClass('year-title year-neighbor hidden-xs');
        prevYearDiv.text(this.options.startYear - 1);

        if (this.options.minDate != null && this.options.minDate > new Date(this.options.startYear - 1, 11, 31)) {
          prevYearDiv.addClass('disabled');
        }
        headerTable.append(prevYearDiv);
        let yearDiv = $(document.createElement('th'));
        yearDiv.addClass('year-title');
        yearDiv.text(this.options.startYear);
        headerTable.append(yearDiv);
        let nextYearDiv = $(document.createElement('th'));
        nextYearDiv.addClass('year-title year-neighbor hidden-xs');
        nextYearDiv.text(this.options.startYear + 1);
        if (this.options.maxDate != null && this.options.maxDate < new Date(this.options.startYear + 1, 0, 1)) {
          nextYearDiv.addClass('disabled');
        }
        headerTable.append(nextYearDiv);
        let next2YearDiv = $(document.createElement('th'));
        next2YearDiv.addClass('year-title year-neighbor2 hidden-sm hidden-xs');
        next2YearDiv.text(this.options.startYear + 2);
        if (this.options.maxDate != null && this.options.maxDate < new Date(this.options.startYear + 2, 0, 1)) {
          next2YearDiv.addClass('disabled');
        }

        headerTable.append(next2YearDiv);
        let nextDiv = $(document.createElement('th'));
        nextDiv.addClass('next');

        if (this.options.maxDate != null && this.options.maxDate < new Date(this.options.startYear + 1, 0, 1)) {
          nextDiv.addClass('disabled');
        }

        let nextIcon = $(document.createElement('span'));
        nextIcon.addClass('fa fa-angle-right');

        nextDiv.append(nextIcon);

        headerTable.append(nextDiv);
        header.append(headerTable);
      } else {
        let headerDiv = $(document.createElement('div'));
        headerDiv.addClass('month-header');
        let prevIcon = $(document.createElement('i'));
        prevIcon.addClass('fa fa-angle-left');
        /*				let d = new Date();
                if (new Date(d.getFullYear(), d.getMonth(), 1).getTime() >= new Date(this.options.startYear, this.options.startMonth, 1).getTime()) {
                  prevIcon.addClass('disabled');
                }*/
        headerDiv.append(prevIcon);
        let titleCell = $(document.createElement('span'));
        titleCell.addClass('month-title');
        if(this.options.language.months) {
          titleCell.text(this.options.language.months[this.options.startMonth] + ' ' + this.options.startYear);
        } else{
          titleCell.text(dates['en'].months[this.options.startMonth] + ' ' + this.options.startYear);
        }
        headerDiv.append(titleCell);
        let nextDiv = $(document.createElement('i'));
        nextDiv.addClass('fa fa-angle-right');
        headerDiv.append(nextDiv);
        header.append(headerDiv);
      }

      this.element.append(header);
    },
    _renderBody: function () {
      let monthsDiv = $(document.createElement('div'));
      monthsDiv.addClass('months-container');
      if (this.options.view === 'year') {
        for (let m = 0; m < 12; m++) {
          monthsDiv.append(this._renderMonthBody(m));
        }
      } else {
        monthsDiv.append(this._renderMonthBody(this.options.startMonth));
      }
      this.element.append(monthsDiv);
    },
    _renderMonthBody: function (m) {
      /* Container */
      let _this = this;
      let monthDiv = $(document.createElement('div'));
      monthDiv.addClass('month-container');
      monthDiv.data('month-id', m);
      let today = new Date();

      let firstDate = new Date(this.options.startYear, m, 1);

      let table = $(document.createElement('table'));
      table.addClass('month');
      let thead = $(document.createElement('thead'));
      let titleRow = $(document.createElement('tr'));
      let titleCell = $(document.createElement('th'));
      /* Month header */
      if (this.options.view === 'year') {
        titleCell.addClass('month-title');
        titleCell.attr('id', m);
        titleCell.attr('colspan', this.options.displayWeekNumber ? 8 : 7);
        if(this.options.language.months) {
          titleCell.text(this.options.language.months[m]);
        } else{
          titleCell.text(dates['en'].months[m]);
        }
        titleRow.append(titleCell);
        thead.append(titleRow);
      } else if (this.options.dateFrom && this.options.dateTo) {
        setTimeout(() => {
          let dates = this._getDates(this.options.dateFrom, this.options.dateTo);
          let cells = _this.element.find('.day:not(.old, .new, .disabled)');
          for (let i = 0; i < cells.length; i++) {
            let date = _this._getDate($(cells[i])).getTime();
            for (let j = 0; j < dates.length; j++) {
              if (date === dates[j]) {
                $(cells[i]).addClass('range');
              }
            }
            if (date == _this.options.dateFrom) {
              $(cells[i]).addClass('range-start');
            } else if (date == _this.options.dateTo) {
              $(cells[i]).addClass('range-end');
            }
          }
        }, 10)
      }

      let cells = this.element.find('.day:not(.old, .new, .disabled)');

      /* Click on date */
      cells.click((e) => {
        e.stopPropagation();
        let date = _this._getDate($(this));
        this.options.selectedDate = date;
        _this._triggerEvent('clickDay', {
          element: $(this),
          which: e.which,
          date: date,
          events: _this.getEvents(date)
        });
      });

      let headerRow = $(document.createElement('tr'));

      if (this.options.displayWeekNumber) {
        let weekNumberCell = $(document.createElement('th'));
        weekNumberCell.addClass('week-number');
        if(this.options.language.weekShort) {
          weekNumberCell.text(this.options.language.weekShort);
        } else{
          weekNumberCell.text(dates['en'].weekShort);
        }

        headerRow.append(weekNumberCell);
      }
      let d;
      if(this.options.language.weekStart) {
        d = this.options.language.weekStart;
      } else{
        d =  dates['en'].weekStart;
      }
      do {
        let headerCell = $(document.createElement('th'));
        headerCell.addClass('day-header');
        if(this.options.language.daysMin) {
          if (this.options.view === 'year') {
            headerCell.text(this.options.language.daysMin[d]);
          } else {
            headerCell.text(this.options.language.daysShort[d]);
          }
        } else{
          if (this.options.view === 'year') {
            headerCell.text(dates['en'].daysMin[d]);
          } else {
            headerCell.text(dates['en'].daysShort[d]);
          }
        }
        headerRow.append(headerCell);
        d++;
        if (d >= 7)
          d = 0;
      }
      while (d != (this.options.language.weekStart || dates['en'].weekStart))

      thead.append(headerRow);
      table.append(thead);

      /* Days */
      let currentDate = new Date(firstDate.getTime());
      let lastDate = new Date(this.options.startYear, m + 1, 0);
      let weekStart = this.options.language.weekStart || dates['en'].weekStart;

      while (currentDate.getDay() != weekStart) {
        currentDate.setDate(currentDate.getDate() - 1);
      }

      while (currentDate <= lastDate) {
        let row = $(document.createElement('tr'));
        if (this.options.displayWeekNumber) {
          let weekNumberCell = $(document.createElement('td'));
          weekNumberCell.addClass('week-number');
          weekNumberCell.text(this.getWeekNumber(currentDate));
          row.append(weekNumberCell);
        }
        do {
          let cell = $(document.createElement('td'));
          cell.addClass('day');
          if (_this.options.rangeSelection) {
            let moved = false;
            cell.mousedown(function (evt) {
              if (!evt.ctrlKey && !_this.options.isCrtlPress) {
                _this.options.dateFrom = parseInt($(this).attr('currentDate'));
                _this.options.dateTo = null;
              }
              moved = false;
            })
            cell.mousemove(function () {
              if (_this.options.dateFrom && !_this.options.dateTo) {
                moved = true;
                const date = $(this).attr('currentDate');
                if (date) {
                  let cells = _this.element.find('.day:not(.old, .new, .disabled)');
                  for (let i = 0; i < cells.length; i++) {
                    let _date = _this._getDate($(cells[i])).getTime();
                    if (_date >= _this.options.dateFrom && _date <= date) {
                      $(cells[i]).addClass('range');
                      if (_date == _this.options.dateFrom) {
                        $(cells[i]).addClass('range-start');
                      }
                    } else if (_date !== _this.options.dateFrom || _date !== date) {
                      $(cells[i]).removeClass('range');
                    }
                  }
                }
              }
            })
            cell.mouseup(function (evt) {
              let flag = false;
              if ((moved || _this.options.isCrtlPress) && _this.options.dateFrom) {
                let cells = _this.element.find('.day:not(.old, .new, .disabled)');
                for (let i = 0; i < cells.length; i++) {
                  let date = _this._getDate($(cells[i])).getTime();
                  if (date >= _this.options.dateFrom && date <= $(this).attr('currentDate')) {
                    $(cells[i]).addClass('range');
                  } else {
                    $(cells[i]).removeClass('range');
                  }
                  if (!_this.options.dateTo) {
                    _this.options.dateTo = parseInt($(this).attr('currentDate'))
                  }
                  if (date == _this.options.dateTo) {
                    $(cells[i]).addClass('range-end');
                  }
                }
              } else if (!evt.ctrlKey && !_this.options.isCrtlPress) {
                flag = true;
              }
              let cells = _this.element.find('.range');
              if (cells.length === 1 || flag) {
                _this.clearRange();
              } else if (cells.length > 1) {
                $(cells[cells.length - 1]).addClass('range-end');
              }
              if (_this.options.dateFrom && _this.options.dateTo) {
                let arr = [];
                if (_this.options.dateFrom && _this.options.dateTo && _this.options.dateFrom !== _this.options.dateTo && _this.options.dateFrom < _this.options.dateTo) {
                  arr.push(_this.options.dateFrom);
                  arr.push(_this.options.dateTo);
                }
                _this._triggerEvent('rangeEnd', {
                  element: $(this),
                  dateRanges: arr
                });
                setTimeout(() => {
                  _this.options.dateFrom = null;
                  _this.options.dateTo = null;
                  _this.options.isCrtlPress = false;
                }, 0)
              }
            })
          }
          if (currentDate < firstDate) {
            cell.addClass('old');
          } else if (currentDate > lastDate) {
            cell.attr('currentDate', currentDate.getTime())
            cell.addClass('new');
          } else {
            if ((this.options.minDate != null && currentDate < this.options.minDate) || (this.options.maxDate != null && currentDate > this.options.maxDate)) {
              cell.addClass('disabled');
            } else if (this.options.disabledDays.length > 0) {
              for (let d in this.options.disabledDays) {
                if (currentDate.getTime() === this.options.disabledDays[d].getTime()) {
                  cell.addClass('disabled');
                  break;
                }
              }
            }

            let cellContent = $(document.createElement('div'));
            let className = 'day-content';
            if (today.getDate() === currentDate.getDate() && today.getMonth() === m && today.getFullYear() === currentDate.getFullYear()) {
              className += ' current-date';
            }
            if ([0, 6].indexOf(currentDate.getDay()) > -1) {
              className += ' cal-day-weekend'
            }
            if (this.options.selectedDate && currentDate.getTime() === this.options.selectedDate.getTime()) {
              className += ' selected';
            }
            cellContent.addClass(className);
            let date = $(document.createElement('span'));
            date.addClass('date');
            date.text(currentDate.getDate());
            cellContent.append(date);
            cell.attr('currentDate', currentDate.getTime())
            cell.append(cellContent);
            if (this.options.customDayRenderer) {
              this.options.customDayRenderer(cellContent, currentDate);
            }
          }
          row.append(cell);
          currentDate.setDate(currentDate.getDate() + 1);
        }
        while (currentDate.getDay() != weekStart)
        table.append(row);
      }

      monthDiv.append(table);
      return monthDiv;

    },
    _renderDataSource: function () {
      const _this = this;

      if (this.options.dataSource != null && this.options.dataSource.length > 0) {
        this.element.find('.month-container').each(function () {
          let month = $(this).data('month-id');
          let firstDate = new Date(_this.options.startYear, month, 1);
          let lastDate = new Date(_this.options.startYear, month + 1, 0);
          if ((_this.options.minDate == null || lastDate >= _this.options.minDate) && (_this.options.maxDate == null || firstDate <= _this.options.maxDate)) {
            let monthData = [];
            for (let i in _this.options.dataSource) {
              if (!(_this.options.dataSource[i].startDate > lastDate) || (_this.options.dataSource[i].endDate < firstDate)) {
                monthData.push(_this.options.dataSource[i]);
              }
            }
            if (monthData.length > 0) {
              $(this).find('.day-content').each(function () {
                let currentDate = new Date(_this.options.startYear, month, $(this).children('.date').text());
                let dayData = [];

                if ((_this.options.minDate == null || currentDate >= _this.options.minDate) && (_this.options.maxDate == null || currentDate <= _this.options.maxDate)) {
                  for (let i in monthData) {
                    if (monthData[i].startDate <= currentDate && monthData[i].endDate >= currentDate) {
                      dayData.push(monthData[i]);
                    }
                  }

                  _this._renderDataSourceDay($(this), currentDate, dayData);
                }
              });
            }
          }
        });
      } else if (this.options.dataSource && this.options.dataSource.length === 0) {
        this.element.find('.month-container').each(function () {
          $(this).find('.day-content').each(function () {
            $(this).children('.plan-time').remove();
            $(this).removeClass('selected-blue').removeClass('selected-orange');
          });
        });
      }
    },
    _renderDataSourceDay: function (elt, currentDate, events) {
      elt.children('.plan-time').remove();
      elt.removeClass('selected-blue').removeClass('selected-orange');
      if (events.length > 0) {
        if (this.options.view !== 'year') {
          let cellContent = $(document.createElement('div'));
          cellContent.addClass('plan-time');
          for (let i in events) {
            let div1 = $(document.createElement('div'));
            if (events[i].endTime) {
              let repeatIcon = $(document.createElement('i'));
              let domType;
              if (events[i].repeat) {
                let span = $(document.createElement('span'));
                repeatIcon.addClass('fa fa-repeat');
                div1.append(repeatIcon);
                span.text(events[i].repeat);
                div1.append(span);
                domType = 'div';
              } else {
                repeatIcon.addClass('fa fa-clock-o');
                div1.append(repeatIcon);
                domType = 'span';
              }
              let span2 = $(document.createElement(domType));
              span2.text(events[i].plannedShowTime + ' - ' + events[i].endTime);
              div1.append(span2);
            } else {
              div1.text(events[i].plannedShowTime);
            }

            cellContent.append(div1);
          }
          elt.append(cellContent);
        }
        elt.addClass(events[0].color === 'orange' ? 'selected-orange' : 'selected-blue');
      }
    },
    _applyEvents: function () {
      let _this = this;

      /* Header buttons */
      this.element.find('.year-neighbor, .year-neighbor2').click(function () {
        if (!$(this).hasClass('disabled')) {
          _this.setYear(parseInt($(this).text()));
        }
      });

      this.element.find('.calendar-header .prev').click(function () {
        if (!$(this).hasClass('disabled')) {
          _this.setYear(_this.options.startYear - 1)
        }
      });

      this.element.find('.calendar-header .next').click(function () {
        if (!$(this).hasClass('disabled')) {
          _this.setYear(_this.options.startYear + 1)
        }
      });

      this.element.find('.month-header .fa-angle-left').click(function () {

        //_this.options.view = 'year';
        if (!$(this).hasClass('disabled')) {
          _this.setMonth(_this.options.startMonth - 1);
        }
      });

      this.element.find('.month-header .fa-angle-right').click(function () {
        //_this.options.view = 'year';
        if (!$(this).hasClass('disabled')) {
          _this.setMonth(_this.options.startMonth + 1)
        }
      });

      this.element.find('.month .month-title').click(function () {
        let month = $(this).attr('id');
        _this.options.startMonth = parseInt(month);
        _this.options.view = 'month';
        _this._render();
      });

      let cells = this.element.find('.day:not(.old, .new, .disabled)');

      /* Click on date */
      cells.click(function (e) {
        e.stopPropagation();
        let date = _this._getDate($(this));
        if ((e.ctrlKey || _this.options.isCrtlPress) && _this.options.rangeSelection) {
          if (_this.options.dateFrom) {
            _this.options.dateTo = date.getTime();
            if (_this.options.dateFrom && _this.options.dateTo && _this.options.dateFrom != _this.options.dateTo) {
              if(_this.options.dateFrom < _this.options.dateTo) {
                _this._triggerEvent('rangeEnd', {
                  element: $(this),
                  dateRanges: [_this.options.dateFrom, _this.options.dateTo]
                });
              }
              _this.options.dateFrom = null;
              _this.options.dateTo = null;
              _this.options.isCrtlPress = false;
            }
          } else {
            _this.options.dateFrom = date.getTime();
          }
        } else {
          if (_this.options.rangeSelection) {
            _this.clearRange();
          }
          if (_this.options.selectedDate) {
            for (let i = 0; i < cells.length; i++) {
              if (_this._getDate($(cells[i])).getTime() === date.getTime()) {
                $(cells[i]).children('.day-content').addClass('selected');
              } else {
                $(cells[i]).children('.day-content').removeClass('selected');
              }
            }
          }
          _this.options.selectedDate = date;
          _this._triggerEvent('clickDay', {
            element: $(this),
            which: e.which,
            date: date,
            events: _this.getEvents(date)
          });
        }
      });

      let monthContainerClass = 'month-container';
      if (this.options.view === 'year') {
        monthContainerClass += ' col-md-3 col-sm-4 col-xs-6';
      } else {
        monthContainerClass += ' month-view';
      }
      $(_this.element).find('.month-container').attr('class', monthContainerClass);
    },

    _getDates: function (startDate, endDate) {
      let dates = [],
        currentDate = startDate,
        addDays = function (days) {
          const date = new Date(this.valueOf());
          date.setDate(date.getDate() + days);
          return date.getTime();
        };
      while (currentDate <= endDate) {
        dates.push(currentDate);
        currentDate = addDays.call(currentDate, 1);
      }
      return dates;
    },

    _getDate: function (elt) {
      let day = elt.children('.day-content').children('.date').text();
      let month = elt.closest('.month-container').data('month-id');
      let year = this.options.startYear;
      return new Date(year, month, day);
    },
    _triggerEvent: function (eventName, parameters) {
      let event = $.Event(eventName);
      for (let i in parameters) {
        event[i] = parameters[i];
      }
      this.element.trigger(event);
    },
    clearRange: function () {
      this.element.find('td.day.range').removeClass('range');
      this.element.find('td.day.range-start').removeClass('range-start');
      this.element.find('td.day.range-end').removeClass('range-end');
      this.options.dateFrom = null;
      this.options.dateTo = null;
      this.options.isCrtlPress = false;
      this._triggerEvent('rangeEnd', {
        element: $(this),
        dateRanges: []
      });
    },
    setRange: function (flag) {
      this.options.isCrtlPress = flag;
      this.element.find('td.day.range').removeClass('range');
      this.element.find('td.day.range-start').removeClass('range-start');
      this.element.find('td.day.range-end').removeClass('range-end');
      this.options.dateFrom = null;
      this.options.dateTo = null;
    },
    checkRange: function (range) {
      this.options.dateFrom = range.from;
      this.options.dateTo = range.to;
      let dates = this._getDates(this.options.dateFrom, this.options.dateTo);
      let cells = this.element.find('.day:not(.old, .new, .disabled)');
      for (let i = 0; i < cells.length; i++) {
        let date = this._getDate($(cells[i])).getTime();
        for (let j = 0; j < dates.length; j++) {
          if (date === dates[j]) {
            $(cells[i]).addClass('range');
          }
        }
        if (date == this.options.dateFrom) {
          $(cells[i]).addClass('range-start');
        } else if (date == this.options.dateTo) {
          $(cells[i]).addClass('range-end');
        }
      }
    },
    getWeekNumber: function (date) {
      let tempDate = new Date(date.getTime());
      tempDate.setHours(0, 0, 0, 0);
      tempDate.setDate(tempDate.getDate() + 3 - (tempDate.getDay() + 6) % 7);
      let week1 = new Date(tempDate.getFullYear(), 0, 4);
      return 1 + Math.round(((tempDate.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    },
    getEvents: function (date) {
      let events = [];
      if (this.options.dataSource && date) {
        for (let i in this.options.dataSource) {
          if (this.options.dataSource[i].startDate <= date && this.options.dataSource[i].endDate >= date) {
            events.push(this.options.dataSource[i]);
          }
        }
      }
      return events;
    },
    getYear: function () {
      return this.options.startYear;
    },
    getMonth: function () {
      return this.options.startMonth;
    },
    setYear: function (year) {
      let parsedYear = parseInt(year);
      if (!isNaN(parsedYear)) {
        this.options.startYear = parsedYear;
        this._render();
      }
    },
    setMonth: function (month) {
      let parsedMonth = parseInt(month);
      if (parsedMonth > 11) {
        parsedMonth = parsedMonth - 12;
        this.options.startYear = this.options.startYear + 1;
      } else if (parsedMonth < 0) {
        parsedMonth = 12 + parsedMonth;
        this.options.startYear = this.options.startYear - 1;
      }
      if (!isNaN(parsedMonth)) {
        this.options.startMonth = parsedMonth;
        this._render();
      }
    },
    getMinDate: function () {
      return this.options.minDate;
    },
    setMinDate: function (date) {
      if (date instanceof Date) {
        this.options.minDate = date;
        this._render();
      }
    },
    getMaxDate: function () {
      return this.options.maxDate;
    },
    setMaxDate: function (date) {
      if (date instanceof Date) {
        this.options.maxDate = date;
        this._render();
      }
    },
    setSelectedDate: function (date) {
      this.options.selectedDate = date;
      this._render();
    },
    getAllowOverlap: function () {
      return this.options.allowOverlap;
    },
    setAllowOverlap: function (allowOverlap) {
      this.options.allowOverlap = allowOverlap;
    },
    getDisplayWeekNumber: function () {
      return this.options.displayWeekNumber;
    },
    setDisplayWeekNumber: function (displayWeekNumber) {
      this.options.displayWeekNumber = displayWeekNumber;
      this._render();
    },

    getDisabledDays: function () {
      return this.options.disabledDays;
    },
    setDisabledDays: function (disabledDays) {
      this.options.disabledDays = disabledDays instanceof Array ? disabledDays : [];
      this._render();
    },

    setView: function (view) {
      this.options.view = view;
    },
    getView: function () {
      return this.options.view;
    },
    setYearView: function (obj) {
      this.options.view = obj.view;
      this.setYear(obj.year);
    },
    setCallBack: function (cb) {
      this.options.cb = cb;
    },
    getDataSource: function () {
      return this.options.dataSource;
    },
    setDataSource: function (dataSource) {
      this.options.dataSource = dataSource instanceof Array ? dataSource : [];
      this._renderDataSource();
    },
    addEvent: function (evt) {
      this.options.dataSource.push(evt);
      this._render();
    }
  };

  $.fn.calendar = function (options) {
    let calendar = new Calendar($(this), options);
    $(this).data('calendar', calendar);
    return calendar;
  };

  /* Events binding management */
  $.fn.renderEnd = function (fct) {
    $(this).bind('renderEnd', fct);
  };
  $.fn.clickDay = function (fct) {
    $(this).bind('clickDay', fct);
  };
  $.fn.rangeEnd = function (fct) {
    $(this).bind('rangeEnd', fct);
  };
  $.fn.selectRange = function (fct) {
    $(this).bind('selectRange', fct);
  };

  let dates = $.fn.calendar.dates = {
    en: {
      daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      daysMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
      months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
      monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      weekShort: 'W',
      weekStart: 1
    }
  };


  $(function () {
    $('[data-provide="calendar"]').each(function () {
      $(this).calendar();
    });
  });
}(window.jQuery));
