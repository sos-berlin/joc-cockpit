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

(function($) {
	var Calendar = function(element, options) {
		this.element = element;
		this.element.addClass('calendar');
		this._initializeEvents(options);
		this._initializeOptions(options);
		this._render();
	};

	Calendar.prototype = {
		constructor: Calendar,
		_initializeOptions: function(opt) {
			if(opt == null) {
				opt = [];
			}

			this.options = {
				startYear: !isNaN(parseInt(opt.startYear)) ? parseInt(opt.startYear) : new Date().getFullYear(),
				startMonth: !isNaN(parseInt(opt.startMonth)) ? parseInt(opt.startMonth) : new Date().getMonth(),
				view: opt.view ? opt.view : 'year',
				minDate: opt.minDate instanceof Date ? opt.minDate : null,
				maxDate: opt.maxDate instanceof Date ? opt.maxDate : null,
				language: (opt.language != null && dates[opt.language] != null) ? opt.language : 'en',
				allowOverlap: opt.allowOverlap != null ? opt.allowOverlap : true,
				displayWeekNumber: opt.displayWeekNumber != null ? opt.displayWeekNumber : false,
				enableRangeSelection: opt.enableRangeSelection != null ? opt.enableRangeSelection : false,
				disabledDays: opt.disabledDays instanceof Array ? opt.disabledDays : [],
				dataSource: opt.dataSource instanceof Array != null ? opt.dataSource : [],
				customDayRenderer : $.isFunction(opt.customDayRenderer) ? opt.customDayRenderer : null
			};

		},
		_initializeEvents: function(opt) {
			if(opt == null) {
				opt = [];
			}
			if(opt.renderEnd) { this.element.bind('renderEnd', opt.renderEnd); }
			if(opt.clickDay) { this.element.bind('clickDay', opt.clickDay); }
		},

		_render: function() {
			this.element.empty();
			this._renderHeader();
			this._renderBody();
			this._renderDataSource();
			this._applyEvents();

			this.element.find('.months-container').fadeIn(0);
			this.element.find('.months-container').addClass('animated zoomIn');
			//Make Responsive year view
			if(this.options.view === 'year') {
				let _this = this;
				setTimeout(function () {
					let t = _this.element.css('width');
					t > 0 && (t = (t = parseInt(t)) > 720 ? "25%" : t > 540 ? "33.33%" : "50%", e.element.find(".month-container").css({width: t}))
				}, 0);
			}
			this._triggerEvent('renderEnd', {currentYear: this.options.startYear, currentMonth: this.options.startMonth,  view: this.options.view});
			if(this.options.cb) {
				this.options.cb({currentYear: this.options.startYear, view: this.options.view, currentMonth: this.options.startMonth});
			}
		},
		_renderHeader: function() {
			let header = $(document.createElement('div'));
			header.addClass('calendar-header panel panel-default');

			if(this.options.view === 'year') {
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
			}else{
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
				titleCell.text(dates[this.options.language].months[this.options.startMonth] + ' '+this.options.startYear);
				headerDiv.append(titleCell);
				let nextDiv = $(document.createElement('i'));
				nextDiv.addClass('fa fa-angle-right');
				headerDiv.append(nextDiv);
				header.append(headerDiv);
			}

			this.element.append(header);
		},
		_renderBody: function() {
			let monthsDiv = $(document.createElement('div'));
			monthsDiv.addClass('months-container');
			if(this.options.view === 'year') {
				for (let m = 0; m < 12; m++) {
					monthsDiv.append(this._renderMonthBody(m));
				}
			}else{
				monthsDiv.append(this._renderMonthBody(this.options.startMonth));
			}
			this.element.append(monthsDiv);
		},
		_renderMonthBody: function(m) {
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
			if(this.options.view === 'year') {
				titleCell.addClass('month-title');
				titleCell.attr('id', m);
				titleCell.attr('colspan', this.options.displayWeekNumber ? 8 : 7);
				titleCell.text(dates[this.options.language].months[m]);
				titleRow.append(titleCell);
				thead.append(titleRow);
			}

			let cells = this.element.find('.day:not(.old, .new, .disabled)');

			/* Click on date */
			cells.click(function (e) {
				e.stopPropagation();
				let date = _this._getDate($(this));
				console.log(date, 'date')
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
				weekNumberCell.text(dates[this.options.language].weekShort);
				headerRow.append(weekNumberCell);
			}

			let d = dates[this.options.language].weekStart;
			do {
				let headerCell = $(document.createElement('th'));
				headerCell.addClass('day-header');
				if (this.options.view === 'year') {
					headerCell.text(dates[this.options.language].daysMin[d]);
				} else {
					headerCell.text(dates[this.options.language].daysShort[d]);
				}
				headerRow.append(headerCell);
				d++;
				if (d >= 7)
					d = 0;
			}
			while (d != dates[this.options.language].weekStart)

			thead.append(headerRow);
			table.append(thead);

			/* Days */
			let currentDate = new Date(firstDate.getTime());
			let lastDate = new Date(this.options.startYear, m + 1, 0);
			let weekStart = dates[this.options.language].weekStart;

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
					if (currentDate < firstDate) {
						cell.addClass('old');
					} else if (currentDate > lastDate) {
						cell.addClass('new');
					} else {
						if ((this.options.minDate != null && currentDate < this.options.minDate) || (this.options.maxDate != null && currentDate > this.options.maxDate)) {
							cell.addClass('disabled');
						} else if (this.options.disabledDays.length > 0) {
							for (let d in this.options.disabledDays) {
								if (currentDate.getTime() == this.options.disabledDays[d].getTime()) {
									cell.addClass('disabled');
									break;
								}
							}
						}

						let cellContent = $(document.createElement('div'));
						let className = 'day-content';
						if(today.getDate() === currentDate.getDate() && today.getMonth() === m && today.getFullYear() === currentDate.getFullYear()){
							className  += ' current-date';
						}
						if([0, 6].indexOf(currentDate.getDay()) > -1){
							className += ' cal-day-weekend'
						}
						cellContent.addClass(className);
						let date = $(document.createElement('span'));
						date.addClass('date');
						date.text(currentDate.getDate());
						cellContent.append(date);
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
		_renderDataSource: function() {
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
			}else if(this.options.dataSource && this.options.dataSource.length === 0) {
				this.element.find('.month-container').each(function () {
					$(this).find('.day-content').each(function () {
						$(this).children('.plan-time').remove();
						$(this).removeClass('selected-blue').removeClass('selected-orange');
					});
				});
			}
		},
		_renderDataSourceDay: function(elt, currentDate, events) {
			elt.children('.plan-time').remove();
			elt.removeClass('selected-blue').removeClass('selected-orange');
			if (events.length > 0) {
				if (this.options.view !== 'year') {
					let cellContent = $(document.createElement('div'));
					cellContent.addClass('plan-time');
					for (let i in events) {
						let div1 = $(document.createElement('div'));
						if(events[i].endTime) {
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
							span2.text(this.getTime(events[i].plannedStartTime) + ' - '+ events[i].endTime);
							div1.append(span2);
						}else{
							div1.text(this.getTime(events[i].plannedStartTime));
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
					_this.setMonth(_this.options.startMonth - 1)
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
				_this.options.startMonth  = parseInt(month);
				_this.options.view = 'month';
				_this._render();
			});

			let cells = this.element.find('.day:not(.old, .new, .disabled)');

			/* Click on date */
			cells.click(function (e) {
				e.stopPropagation();
				let date = _this._getDate($(this));
				_this._triggerEvent('clickDay', {
					element: $(this),
					which: e.which,
					date: date,
					events: _this.getEvents(date)
				});
			});

			let monthContainerClass = 'month-container';
			if(this.options.view === 'year') {
				monthContainerClass += ' col-md-3 col-sm-4 col-xs-6';
			}else{
				monthContainerClass += ' month-view';
			}
			$(_this.element).find('.month-container').attr('class', monthContainerClass);
		},
		_refreshRange: function () {
			let _this = this;

			this.element.find('td.day.range').removeClass('range');
			this.element.find('td.day.range-start').removeClass('range-start');
			this.element.find('td.day.range-end').removeClass('range-end');

			if (this._mouseDown) {
				let minDate = _this._rangeStart < _this._rangeEnd ? _this._rangeStart : _this._rangeEnd;
				let maxDate = _this._rangeEnd > _this._rangeStart ? _this._rangeEnd : _this._rangeStart;

				this.element.find('.month-container').each(function () {
					let monthId = $(this).data('month-id');
					if (minDate.getMonth() <= monthId && maxDate.getMonth() >= monthId) {
						$(this).find('td.day:not(.old, .new)').each(function () {
							let date = _this._getDate($(this));
							if (date >= minDate && date <= maxDate) {
								$(this).addClass('range');

								if (date.getTime() == minDate.getTime()) {
									$(this).addClass('range-start');
								}

								if (date.getTime() == maxDate.getTime()) {
									$(this).addClass('range-end');
								}
							}
						});
					}
				});
			}
		},

		_getDate: function(elt) {
			let day = elt.children('.day-content').children('.date').text();
			let month = elt.closest('.month-container').data('month-id');
			let year = this.options.startYear;
			return new Date(year, month, day);
		},
		_triggerEvent: function(eventName, parameters) {
			let event = $.Event(eventName);
			for(let i in parameters) {
				event[i] = parameters[i];
			}
			this.element.trigger(event);
		},
		getWeekNumber: function(date) {
			let tempDate = new Date(date.getTime());
			tempDate.setHours(0, 0, 0, 0);
			tempDate.setDate(tempDate.getDate() + 3 - (tempDate.getDay() + 6) % 7);
			let week1 = new Date(tempDate.getFullYear(), 0, 4);
			return 1 + Math.round(((tempDate.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
		},
		getEvents: function(date) {
			let events = [];
			if(this.options.dataSource && date) {
				for(let i in this.options.dataSource) {
					if(this.options.dataSource[i].startDate <= date && this.options.dataSource[i].endDate >= date) {
						events.push(this.options.dataSource[i]);
					}
				}
			}
			return events;
		},
		getYear: function() {
			return this.options.startYear;
		},
		getMonth: function() {
			return this.options.startMonth;
		},
		setYear: function(year) {
			let parsedYear = parseInt(year);
			if(!isNaN(parsedYear)) {
				this.options.startYear = parsedYear;
				this._render();
			}
		},
		setMonth: function(month) {
			let parsedMonth = parseInt(month);
			if(!isNaN(parsedMonth)) {
				this.options.startMonth = parsedMonth;
				this._render();
			}
		},
		getMinDate: function() {
			return this.options.minDate;
		},
		setMinDate: function(date) {
			if(date instanceof Date) {
				this.options.minDate = date;
				this._render();
			}
		},
		getMaxDate: function() {
			return this.options.maxDate;
		},
		setMaxDate: function(date) {
			if(date instanceof Date) {
				this.options.maxDate = date;
				this._render();
			}
		},
		getAllowOverlap: function() {
			return this.options.allowOverlap;
		},
		setAllowOverlap: function(allowOverlap) {
			this.options.allowOverlap = allowOverlap;
		},
		getDisplayWeekNumber: function() {
			return this.options.displayWeekNumber;
		},
		setDisplayWeekNumber: function(displayWeekNumber) {
			this.options.displayWeekNumber = displayWeekNumber;
			this._render();
		},
		getEnableRangeSelection: function() {
			return this.options.enableRangeSelection;
		},
		setEnableRangeSelection: function(enableRangeSelection) {
			this.options.enableRangeSelection = enableRangeSelection;
			this._render();
		},
		getDisabledDays: function() {
			return this.options.disabledDays;
		},
		setDisabledDays: function(disabledDays) {
			this.options.disabledDays = disabledDays instanceof Array ? disabledDays : [];
			this._render();
		},
		getLanguage: function() {
			return this.options.language;
		},
		setLanguage: function(language) {
			if(language != null && dates[language] != null) {
				this.options.language = language;
				this._render();
			}
		},
		setView: function(view) {
			this.options.view = view;
		},
		getView: function() {
			return this.options.view;
		},
		setYearView: function(obj) {
			this.options.view = obj.view;
			this.setYear(obj.year);
		},
		setCallBack: function(cb) {
			this.options.cb = cb;
		},
		getDataSource: function() {
			return this.options.dataSource;
		},
		setDataSource: function(dataSource) {
			this.options.dataSource = dataSource instanceof Array ? dataSource : [];
			this._renderDataSource();
		},
		addEvent: function(evt) {
			this.options.dataSource.push(evt);
			this._render();
		},
		getTime: function (t) {
			if (sessionStorage.preferences) {
				if (!t) return "";
				let n = JSON.parse(sessionStorage.preferences);
				let timeFormat = n.dateFormat;
				let x = "HH:mm:ss";
				if ((timeFormat.match(/HH:mm:ss/gi) || timeFormat.match(/HH:mm/gi) || timeFormat.match(/hh:mm:ss A/gi) || timeFormat.match(/hh:mm A/gi)) != null) {
					let result = (timeFormat.match(/HH:mm:ss/gi) || timeFormat.match(/HH:mm/gi) || timeFormat.match(/hh:mm:ss A/gi) || timeFormat.match(/hh:mm A/gi)) + '';
					if (result.match(/hh/g)) {
						x = result + " a";
					} else {
						x= result;
					}
				}
				return moment(t).format(x)
			}
		}
	};

	$.fn.calendar = function (options) {
		let calendar = new Calendar($(this) ,options);
		$(this).data('calendar', calendar);
		return calendar;
	};

	/* Events binding management */
	$.fn.renderEnd = function(fct) { $(this).bind('renderEnd', fct); };
	$.fn.clickDay = function(fct) { $(this).bind('clickDay', fct); };
	$.fn.selectRange = function(fct) { $(this).bind('selectRange', fct); };


	let dates = $.fn.calendar.dates = {
		en: {
			daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
			daysMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
			months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
			monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
			weekShort: 'W',
			weekStart:1
		},
		fr: {
			days: ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"],
			daysShort: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
			daysMin: ["D", "L", "Ma", "Me", "J", "V", "S", "D"],
			months: ["Janvier", "FÃ©vrier", "Mars", "Avril", "Mai", "Juin", "Juillet", "AoÃ»t", "Septembre", "Octobre", "Novembre", "DÃ©cembre"],
			monthsShort: ["Jan", "FÃ©v", "Mar", "Avr", "Mai", "Jui", "Jul", "Aou", "Sep", "Oct", "Nov", "DÃ©c"],
			weekShort:'S',
			weekStart: 1
		}, ja: {
			days: ["日曜", "月曜", "火曜", "水曜", "木曜", "金曜", "土曜"],
			daysShort: ["日", "月", "火", "水", "木", "金", "土"],
			daysMin: ["日", "月", "火", "水", "木", "金", "土"],
			months: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
			monthsShort: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
			weekShort: '週',
			weekStart:0
		}, de: {
			days: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
			daysShort: ["Son", "Mon", "Die", "Mit", "Don", "Fre", "Sam"],
			daysMin: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
			months: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
			monthsShort: ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"],
			weekShort: 'W',
			weekStart: 1
		}
	};

	$(function(){
		$('[data-provide="calendar"]').each(function() {
			$(this).calendar();
		});
	});
}(window.jQuery));
