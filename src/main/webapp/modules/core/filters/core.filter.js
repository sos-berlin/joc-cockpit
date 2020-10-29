!function () {
    "use strict";
    function e(e) {
        return function (t) {
            return t ? e.sessionStorage.preferences ? (t = moment(t).tz(JSON.parse(e.sessionStorage.preferences).zone), moment(t).fromNow()) : void 0 : "-"
        }
    }

    function t(e) {
        return function (t) {
            if (e.sessionStorage.preferences) {
                if (!t)return "-";
                var n = JSON.parse(e.sessionStorage.preferences);
                if(!n.zone){
                    return;
                }
                return moment(t).tz(n.zone).format(n.dateFormat)
            }else{
                return moment(t).format('DD.MM.YYYY HH:mm:ss')
            }
        }
    }

    function tf(e) {
        return function (t) {
            if (e.sessionStorage.preferences) {
                if (!t) return "-";
                var n = JSON.parse(e.sessionStorage.preferences);
                var timeFormat = n.dateFormat;
                var x = "HH:mm:ss";
                if ((timeFormat.match(/HH:mm:ss/gi) || timeFormat.match(/HH:mm/gi) || timeFormat.match(/hh:mm:ss A/gi) || timeFormat.match(/hh:mm A/gi)) != null) {
                    var result = (timeFormat.match(/HH:mm:ss/gi) || timeFormat.match(/HH:mm/gi) || timeFormat.match(/hh:mm:ss A/gi) || timeFormat.match(/hh:mm A/gi)) + '';
                    if (result.match(/hh/g)) {
                        x = result + " a";
                    } else {
                        x= result;
                    }
                }
                return moment(t).format(x)
            }
        }
    }

    function d(e) {
        return function (t) {
            if (e.sessionStorage.preferences) {
                if (!t)return "-";
                var n = JSON.parse(e.sessionStorage.preferences);
                if (!n.zone) {
                    return;
                }
                if (n.dateFormat.match('HH:mm')) {
                    n.dateFormat = n.dateFormat.replace('HH:mm', '');
                }
                else if (n.dateFormat.match('hh:mm')) {
                    n.dateFormat = n.dateFormat.replace('hh:mm', '');
                }

                if (n.dateFormat.match(':ss')) {
                    n.dateFormat = n.dateFormat.replace(':ss', '');
                }
                if (n.dateFormat.match('A')) {
                    n.dateFormat = n.dateFormat.replace('A', '');
                }
                if (n.dateFormat.match('|')) {
                    n.dateFormat = n.dateFormat.replace('|', '');
                }
                n.dateFormat = n.dateFormat.trim();
                return moment(t).tz(n.zone).format(n.dateFormat)
            }
        }
    }
    function n(e) {
        return function (t) {
            if (e.sessionStorage.preferences) {
                if (!t)return "-";
                var n = JSON.parse(e.sessionStorage.preferences);
                return moment(t).tz(n.zone).format("YYYY-MM-DD HH:mm:ss,SSS")
            }
        }
    }
    function r(e, t) {
        return function (n, r) {
            if (e.sessionStorage.preferences) {
                if (!n || !r)return "-";
                var o = JSON.parse(e.sessionStorage.preferences);
                n = moment(n).tz(o.zone), r = moment(r).tz(o.zone);
            }
            var i = moment(r).diff(n);
            if (i >= 1e3) {
                var a = parseInt(i / 1e3 % 60), s = parseInt(i / 6e4 % 60), f = parseInt(i / 36e5 % 24),
                    u = parseInt(i / 864e5);
                if(u>0) {
                    if (u === 1 && f === 0) {
                        return '24h ' + s + 'm ' + a + 's';
                    } else {
                        return u + 'd ' + f + 'h ' + s + 'm ' + a + 's';
                    }
                }
                return 0 == u && 0 != f ? f + "h " + s + "m " + a + "s" : 0 == f && 0 != s ? s + "m " + a + "s" : 0 == u && 0 == f && 0 == s ? a + " sec" : u + "d " + f + "h " + s + "m " + a + "s"
            }

            return t.getString("label.lessThanSec")
        }
    }

    function o() {
        return function (e) {
            var t = parseInt(e % 60), n = parseInt(e / 60 % 60), r = parseInt(e / 3600 % 24);
            return r = r > 9 ? r : "0" + r, n = n > 9 ? n : "0" + n, t = t > 9 ? t : "0" + t, r + ":" + n + ":" + t
        }
    }

    function i(e, t) {
        return function (n, r) {
            if (n || (n = new Date), r || (r = new Date), e.sessionStorage.preferences) {
                var o = JSON.parse(e.sessionStorage.preferences);
                n = moment(n).tz(o.zone), r = moment(r).tz(o.zone);
                var i = Math.abs(moment(r).diff(n));
                if (i >= 1e3) {
                    var u = parseInt(i / 1e3 % 60), a = parseInt(i / 6e4 % 60), s = parseInt(i / 36e5 % 24), f = parseInt(i / 864e5);
                    a = a>9 ? a : '0'+a;
                    s = s>9 ? s : '0'+s;
                    f = f>9 ? f : '0'+f;
                    if (f == 0 && s != 0) {
                        return s + ':' + a + 'h';
                    } else if (s == 0 && a != 0) {
                        if(f == 1){
                            return (f*24) + ':' + a + 'h';
                        }if(f > 1){
                            return f + 'days';
                        }else {
                            return a + ':' + u + 'min';
                        }
                    } else if (f == 0 && s == 0 && a == 0) {
                        return u + 'sec';
                    } else {
                        if (f > 1)
                            return f + 'days';
                        else
                            return f + 'day';
                    }
                }
                return t.getString("never")
            }
        }
    }

    function a() {
        return function (e, t) {
            return e ? e.slice(t) : void 0
        }
    }

    function s(e) {
        return function (t) {
            if (e.sessionStorage.preferences) {
                var n = new Date, r = JSON.parse(e.sessionStorage.preferences);
                t = moment(t).tz(r.zone), n = moment(n).tz(r.zone);

                var o = Math.abs(moment(n).diff(t));
                if (o >= 1e3) {
                    var i = parseInt((o / 1e3) % 60), a = parseInt((o / 6e4) % 60), s = parseInt((o / 36e5) % 24),
                        f = parseInt(o / 864e5);
                    i = i > 9 ? i : '0' + i;
                    a = a > 9 ? a : '0' + a;
                    s = s > 9 ? s : '0' + s;
                    if (f == 0 && s != 0) {
                        return s + ':' + a + 'h';
                    } else if (s == 0 && a != 0) {
                        if(f == 1){
                            return (f*24) + ':' + a + 'h';
                        }if(f > 1){
                            return f + 'days';
                        }else {
                            return a + ':' + i + 'min';
                        }
                    } else if (f == 0 && s == 0 && a == 0) {
                        return i + 'sec';
                    } else {
                        if (f > 1)
                            return f + 'days';
                        else
                            return f + 'day';
                    }
                }
                return "1sec"
            }
        }
    }

    function f(e) {
        return function (t) {
            if (t) {
                var n = t, r = (new Date).getTime(), o = r - n, i = Math.floor(o / 1e3), a = Math.floor(i / 60), s = Math.floor(a / 60), f = Math.floor(s / 24);
                return f > 1 ? f + " " + e.getString("label.dayAgo") : 1 == f ? "1 " + e.getString("label.dayAgo") : s > 1 ? s + " " + e.getString("label.hourAgo") : 1 == s ? e.getString("label.anHourAgo") : a > 1 ? a + " " + e.getString("label.minuteAgo") : 1 == a ? e.getString("label.aMinuteAgo") : e.getString("label.fewSecondsAgo")
            }
        }
    }

    function z() {
        return function (input) {
            return input ? input.replace(/%20/g, '&nbsp;') : '';
        }
    }

    function c() {
        return function (bytes) {
            var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            if (bytes == 0) return '0 Byte';
            var i = Math.floor(Math.log(bytes) / Math.log(1024));
            return parseFloat(bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
        }
    }

    function hl($sce) {
        return function (text, phrase) {
            if (!text) {
                return;
            }
            if (typeof text == 'string') {
                if (phrase) {
                    let str = phrase.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                    text = text.replace(new RegExp('(' + str + ')', 'gi'),
                        '<span class="highlighted">$1</span>');
                }
                return $sce.trustAsHtml(text)
            } else {
                return text;
            }
        }
    }

    angular.module("app").filter("fromNow", e).filter("stringToDate", t).filter("stringToDate1", d).filter("stringToDateFormat", n).filter("duration", r).filter("convertTime", o).filter("durationFromCurrent", i).filter("startFrom", a).filter("remainingTime", s).filter("timeDifferenceFilter", f).filter("decodeSpace", z).filter("byteToSize", c).filter("timeformatFilter",tf).filter("highlight",hl), e.$inject = ["$window"], t.$inject = ["$window"],d.$inject = ["$window"],n.$inject = ["$window"], r.$inject = ["$window", "gettextCatalog"], i.$inject = ["$window", "gettextCatalog"], s.$inject = ["$window"], f.$inject = ["gettextCatalog"],tf.$inject = ["$window"], hl.$inject = ["$sce"]
}();
