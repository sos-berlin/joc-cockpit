!function(t){var n=function(e,t){this.element=e,this.element.addClass("calendar"),this._initializeEvents(t),this._initializeOptions(t),this._render()};n.prototype={constructor:n,_initializeOptions:function(e){null==e&&(e=[]),this.options={startYear:isNaN(parseInt(e.startYear))?(new Date).getFullYear():parseInt(e.startYear),startMonth:isNaN(parseInt(e.startMonth))?(new Date).getMonth():parseInt(e.startMonth),view:e.view?e.view:"year",minDate:e.minDate instanceof Date?e.minDate:null,maxDate:e.maxDate instanceof Date?e.maxDate:null,language:null!=e.language&&null!=a[e.language]?e.language:"en",allowOverlap:null==e.allowOverlap||e.allowOverlap,displayWeekNumber:null!=e.displayWeekNumber&&e.displayWeekNumber,enableRangeSelection:null!=e.enableRangeSelection&&e.enableRangeSelection,disabledDays:e.disabledDays instanceof Array?e.disabledDays:[],dataSource:e.dataSource instanceof Array!=null?e.dataSource:[],customDayRenderer:t.isFunction(e.customDayRenderer)?e.customDayRenderer:null}},_initializeEvents:function(e){null==e&&(e=[]),e.renderEnd&&this.element.bind("renderEnd",e.renderEnd),e.clickDay&&this.element.bind("clickDay",e.clickDay)},_render:function(){if(this.element.empty(),this._renderHeader(),this._renderBody(),this._renderDataSource(),this._applyEvents(),this.element.find(".months-container").fadeIn(0),this.element.find(".months-container").addClass("animated zoomIn"),"year"===this.options.view){let t=this;setTimeout(function(){let n=t.element.css("width");n>0&&(n=(n=parseInt(n))>720?"25%":n>540?"33.33%":"50%",e.element.find(".month-container").css({width:n}))},0)}this._triggerEvent("renderEnd",{currentYear:this.options.startYear,currentMonth:this.options.startMonth,view:this.options.view}),this.options.cb&&this.options.cb({currentYear:this.options.startYear,view:this.options.view,currentMonth:this.options.startMonth})},_renderHeader:function(){let e=t(document.createElement("div"));if(e.addClass("calendar-header panel panel-default"),"year"===this.options.view){let n=t(document.createElement("table")),a=t(document.createElement("th"));a.addClass("prev"),null!=this.options.minDate&&this.options.minDate>new Date(this.options.startYear-1,11,31)&&a.addClass("disabled");let i=t(document.createElement("span"));i.addClass("fa fa-angle-left"),a.append(i),n.append(a);let s=t(document.createElement("th"));s.addClass("year-title year-neighbor2 hidden-sm hidden-xs"),s.text(this.options.startYear-2),null!=this.options.minDate&&this.options.minDate>new Date(this.options.startYear-2,11,31)&&s.addClass("disabled"),n.append(s);let o=t(document.createElement("th"));o.addClass("year-title year-neighbor hidden-xs"),o.text(this.options.startYear-1),null!=this.options.minDate&&this.options.minDate>new Date(this.options.startYear-1,11,31)&&o.addClass("disabled"),n.append(o);let r=t(document.createElement("th"));r.addClass("year-title"),r.text(this.options.startYear),n.append(r);let d=t(document.createElement("th"));d.addClass("year-title year-neighbor hidden-xs"),d.text(this.options.startYear+1),null!=this.options.maxDate&&this.options.maxDate<new Date(this.options.startYear+1,0,1)&&d.addClass("disabled"),n.append(d);let l=t(document.createElement("th"));l.addClass("year-title year-neighbor2 hidden-sm hidden-xs"),l.text(this.options.startYear+2),null!=this.options.maxDate&&this.options.maxDate<new Date(this.options.startYear+2,0,1)&&l.addClass("disabled"),n.append(l);let h=t(document.createElement("th"));h.addClass("next"),null!=this.options.maxDate&&this.options.maxDate<new Date(this.options.startYear+1,0,1)&&h.addClass("disabled");let c=t(document.createElement("span"));c.addClass("fa fa-angle-right"),h.append(c),n.append(h),e.append(n)}else{let n=t(document.createElement("div"));n.addClass("month-header");let i=t(document.createElement("i"));i.addClass("fa fa-angle-left"),n.append(i);let s=t(document.createElement("span"));s.addClass("month-title"),s.text(a[this.options.language].months[this.options.startMonth]+" "+this.options.startYear),n.append(s);let o=t(document.createElement("i"));o.addClass("fa fa-angle-right"),n.append(o),e.append(n)}this.element.append(e)},_renderBody:function(){let e=t(document.createElement("div"));if(e.addClass("months-container"),"year"===this.options.view)for(let t=0;t<12;t++)e.append(this._renderMonthBody(t));else e.append(this._renderMonthBody(this.options.startMonth));this.element.append(e)},_renderMonthBody:function(e){let n=this,i=t(document.createElement("div"));i.addClass("month-container"),i.data("month-id",e);let s=new Date,o=new Date(this.options.startYear,e,1),r=t(document.createElement("table"));r.addClass("month");let d=t(document.createElement("thead")),l=t(document.createElement("tr")),h=t(document.createElement("th"));"year"===this.options.view&&(h.addClass("month-title"),h.attr("id",e),h.attr("colspan",this.options.displayWeekNumber?8:7),h.text(a[this.options.language].months[e]),l.append(h),d.append(l)),this.element.find(".day:not(.old, .new, .disabled)").click(function(e){e.stopPropagation();let a=n._getDate(t(this));n._triggerEvent("clickDay",{element:t(this),which:e.which,date:a,events:n.getEvents(a)})});let c=t(document.createElement("tr"));if(this.options.displayWeekNumber){let e=t(document.createElement("th"));e.addClass("week-number"),e.text(a[this.options.language].weekShort),c.append(e)}let p=a[this.options.language].weekStart;do{let e=t(document.createElement("th"));e.addClass("day-header"),"year"===this.options.view?e.text(a[this.options.language].daysMin[p]):e.text(a[this.options.language].daysShort[p]),c.append(e),++p>=7&&(p=0)}while(p!=a[this.options.language].weekStart);d.append(c),r.append(d);let m=new Date(o.getTime()),u=new Date(this.options.startYear,e+1,0),g=a[this.options.language].weekStart;for(;m.getDay()!=g;)m.setDate(m.getDate()-1);for(;m<=u;){let n=t(document.createElement("tr"));if(this.options.displayWeekNumber){let e=t(document.createElement("td"));e.addClass("week-number"),e.text(this.getWeekNumber(m)),n.append(e)}do{let a=t(document.createElement("td"));if(a.addClass("day"),m<o)a.addClass("old");else if(m>u)a.addClass("new");else{if(null!=this.options.minDate&&m<this.options.minDate||null!=this.options.maxDate&&m>this.options.maxDate)a.addClass("disabled");else if(this.options.disabledDays.length>0)for(let e in this.options.disabledDays)if(m.getTime()==this.options.disabledDays[e].getTime()){a.addClass("disabled");break}let n=t(document.createElement("div")),i="day-content";s.getDate()===m.getDate()&&s.getMonth()===e&&s.getFullYear()===m.getFullYear()&&(i+=" current-date"),[0,6].indexOf(m.getDay())>-1&&(i+=" cal-day-weekend"),n.addClass(i);let o=t(document.createElement("span"));o.addClass("date"),o.text(m.getDate()),n.append(o),a.append(n),this.options.customDayRenderer&&this.options.customDayRenderer(n,m)}n.append(a),m.setDate(m.getDate()+1)}while(m.getDay()!=g);r.append(n)}return i.append(r),i},_renderDataSource:function(){const e=this;null!=this.options.dataSource&&this.options.dataSource.length>0?this.element.find(".month-container").each(function(){let n=t(this).data("month-id"),a=new Date(e.options.startYear,n,1),i=new Date(e.options.startYear,n+1,0);if((null==e.options.minDate||i>=e.options.minDate)&&(null==e.options.maxDate||a<=e.options.maxDate)){let s=[];for(let t in e.options.dataSource)e.options.dataSource[t].startDate>i&&!(e.options.dataSource[t].endDate<a)||s.push(e.options.dataSource[t]);s.length>0&&t(this).find(".day-content").each(function(){let a=new Date(e.options.startYear,n,t(this).children(".date").text()),i=[];if((null==e.options.minDate||a>=e.options.minDate)&&(null==e.options.maxDate||a<=e.options.maxDate)){for(let e in s)s[e].startDate<=a&&s[e].endDate>=a&&i.push(s[e]);e._renderDataSourceDay(t(this),a,i)}})}}):this.options.dataSource&&0===this.options.dataSource.length&&this.element.find(".month-container").each(function(){t(this).find(".day-content").each(function(){t(this).children(".plan-time").remove(),t(this).removeClass("selected-blue").removeClass("selected-orange")})})},_renderDataSourceDay:function(e,n,a){if(e.children(".plan-time").remove(),e.removeClass("selected-blue").removeClass("selected-orange"),a.length>0){if("year"!==this.options.view){let n=t(document.createElement("div"));n.addClass("plan-time");for(let e in a){let i=t(document.createElement("div"));if(a[e].endTime){let n,s=t(document.createElement("i"));if(a[e].repeat){let o=t(document.createElement("span"));s.addClass("fa fa-repeat"),i.append(s),o.text(a[e].repeat),i.append(o),n="div"}else if(a[e].absoluteRepeat){let o=t(document.createElement("span"));s.addClass("fa fa-refresh"),i.append(s),o.text(a[e].absoluteRepeat),i.append(o),n="div"}else s.addClass("fa fa-clock-o"),i.append(s),n="span";let o=t(document.createElement(n));o.text(this.getTime(a[e].plannedStartTime)+" - "+a[e].endTime),i.append(o)}else i.text(this.getTime(a[e].plannedStartTime));n.append(i)}e.append(n)}e.addClass("orange"===a[0].color?"selected-orange":"selected-blue")}},_applyEvents:function(){let e=this;this.element.find(".year-neighbor, .year-neighbor2").click(function(){t(this).hasClass("disabled")||e.setYear(parseInt(t(this).text()))}),this.element.find(".calendar-header .prev").click(function(){t(this).hasClass("disabled")||e.setYear(e.options.startYear-1)}),this.element.find(".calendar-header .next").click(function(){t(this).hasClass("disabled")||e.setYear(e.options.startYear+1)}),this.element.find(".month-header .fa-angle-left").click(function(){t(this).hasClass("disabled")||e.setMonth(e.options.startMonth-1)}),this.element.find(".month-header .fa-angle-right").click(function(){t(this).hasClass("disabled")||e.setMonth(e.options.startMonth+1)}),this.element.find(".month .month-title").click(function(){let n=t(this).attr("id");e.options.startMonth=parseInt(n),e.options.view="month",e._render()}),this.element.find(".day:not(.old, .new, .disabled)").click(function(n){n.stopPropagation();let a=e._getDate(t(this));e._triggerEvent("clickDay",{element:t(this),which:n.which,date:a,events:e.getEvents(a)})});let n="month-container";"year"===this.options.view?n+=" col-md-3 col-sm-4 col-xs-6":n+=" month-view",t(e.element).find(".month-container").attr("class",n)},_refreshRange:function(){let e=this;if(this.element.find("td.day.range").removeClass("range"),this.element.find("td.day.range-start").removeClass("range-start"),this.element.find("td.day.range-end").removeClass("range-end"),this._mouseDown){let n=e._rangeStart<e._rangeEnd?e._rangeStart:e._rangeEnd,a=e._rangeEnd>e._rangeStart?e._rangeEnd:e._rangeStart;this.element.find(".month-container").each(function(){let i=t(this).data("month-id");n.getMonth()<=i&&a.getMonth()>=i&&t(this).find("td.day:not(.old, .new)").each(function(){let i=e._getDate(t(this));i>=n&&i<=a&&(t(this).addClass("range"),i.getTime()==n.getTime()&&t(this).addClass("range-start"),i.getTime()==a.getTime()&&t(this).addClass("range-end"))})})}},_getDate:function(e){let t=e.children(".day-content").children(".date").text(),n=e.closest(".month-container").data("month-id"),a=this.options.startYear;return new Date(a,n,t)},_triggerEvent:function(e,n){let a=t.Event(e);for(let e in n)a[e]=n[e];this.element.trigger(a)},getWeekNumber:function(e){let t=new Date(e.getTime());t.setHours(0,0,0,0),t.setDate(t.getDate()+3-(t.getDay()+6)%7);let n=new Date(t.getFullYear(),0,4);return 1+Math.round(((t.getTime()-n.getTime())/864e5-3+(n.getDay()+6)%7)/7)},getEvents:function(e){let t=[];if(this.options.dataSource&&e)for(let n in this.options.dataSource)this.options.dataSource[n].startDate<=e&&this.options.dataSource[n].endDate>=e&&t.push(this.options.dataSource[n]);return t},getYear:function(){return this.options.startYear},getMonth:function(){return this.options.startMonth},setYear:function(e){let t=parseInt(e);isNaN(t)||(this.options.startYear=t,this._render())},setMonth:function(e){let t=parseInt(e);t>11?(t-=12,this.options.startYear=this.options.startYear+1):t<0&&(t=12+t,this.options.startYear=this.options.startYear-1),isNaN(t)||(this.options.startMonth=t,this._render())},getMinDate:function(){return this.options.minDate},setMinDate:function(e){e instanceof Date&&(this.options.minDate=e,this._render())},getMaxDate:function(){return this.options.maxDate},setMaxDate:function(e){e instanceof Date&&(this.options.maxDate=e,this._render())},getAllowOverlap:function(){return this.options.allowOverlap},setAllowOverlap:function(e){this.options.allowOverlap=e},getDisplayWeekNumber:function(){return this.options.displayWeekNumber},setDisplayWeekNumber:function(e){this.options.displayWeekNumber=e,this._render()},getEnableRangeSelection:function(){return this.options.enableRangeSelection},setEnableRangeSelection:function(e){this.options.enableRangeSelection=e,this._render()},getDisabledDays:function(){return this.options.disabledDays},setDisabledDays:function(e){this.options.disabledDays=e instanceof Array?e:[],this._render()},getLanguage:function(){return this.options.language},setLanguage:function(e){null!=e&&null!=a[e]&&(this.options.language=e,this._render())},setView:function(e){this.options.view=e},getView:function(){return this.options.view},setYearView:function(e){this.options.view=e.view,this.setYear(e.year)},setCallBack:function(e){this.options.cb=e},getDataSource:function(){return this.options.dataSource},setDataSource:function(e){this.options.dataSource=e instanceof Array?e:[],this._renderDataSource()},addEvent:function(e){this.options.dataSource.push(e),this._render()},getTime:function(e){if(sessionStorage.preferences){if(!e)return"";let t=JSON.parse(sessionStorage.preferences).dateFormat,n="HH:mm:ss";if(null!=(t.match(/HH:mm:ss/gi)||t.match(/HH:mm/gi)||t.match(/hh:mm:ss A/gi)||t.match(/hh:mm A/gi))){let e=(t.match(/HH:mm:ss/gi)||t.match(/HH:mm/gi)||t.match(/hh:mm:ss A/gi)||t.match(/hh:mm A/gi))+"";n=e.match(/hh/g)?e+" a":e}return moment(e).format(n)}}},t.fn.calendar=function(e){let a=new n(t(this),e);return t(this).data("calendar",a),a},t.fn.renderEnd=function(e){t(this).bind("renderEnd",e)},t.fn.clickDay=function(e){t(this).bind("clickDay",e)},t.fn.selectRange=function(e){t(this).bind("selectRange",e)};let a=t.fn.calendar.dates={en:{daysShort:["Sun","Mon","Tue","Wed","Thu","Fri","Sat","Sun"],daysMin:["Su","Mo","Tu","We","Th","Fr","Sa","Su"],months:["January","February","March","April","May","June","July","August","September","October","November","December"],monthsShort:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],weekShort:"W",weekStart:1},fr:{days:["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"],daysShort:["Dim","Lun","Mar","Mer","Jeu","Ven","Sam","Dim"],daysMin:["D","L","Ma","Me","J","V","S","D"],months:["Janvier","FÃ©vrier","Mars","Avril","Mai","Juin","Juillet","AoÃ»t","Septembre","Octobre","Novembre","DÃ©cembre"],monthsShort:["Jan","FÃ©v","Mar","Avr","Mai","Jui","Jul","Aou","Sep","Oct","Nov","DÃ©c"],weekShort:"S",weekStart:1},ja:{days:["日曜","月曜","火曜","水曜","木曜","金曜","土曜"],daysShort:["日","月","火","水","木","金","土"],daysMin:["日","月","火","水","木","金","土"],months:["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"],monthsShort:["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"],weekShort:"週",weekStart:0},de:{days:["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"],daysShort:["Son","Mon","Die","Mit","Don","Fre","Sam"],daysMin:["So","Mo","Di","Mi","Do","Fr","Sa"],months:["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"],monthsShort:["Jan","Feb","Mär","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"],weekShort:"W",weekStart:1}};t(function(){t('[data-provide="calendar"]').each(function(){t(this).calendar()})})}(window.jQuery);
