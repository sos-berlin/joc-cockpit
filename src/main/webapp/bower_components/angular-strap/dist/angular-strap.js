!function (e, t, n) {
    "use strict";
    function a(e, n, a, o, i, r) {
        function s(e, n) {
            return angular.element((n || t).querySelectorAll(e))
        }

        function l(e) {
            return u[e] ? u[e] : u[e] = n.get(e, {cache: r}).then(function (e) {
                return e.data
            })
        }

        this.compile = function (t) {
            t.template && /\.html$/.test(t.template) && (console.warn("Deprecated use of `template` option to pass a file. Please use the `templateUrl` option instead."), t.templateUrl = t.template, t.template = "");
            var n = t.templateUrl, r = t.template || "", u = t.controller, c = t.controllerAs, d = angular.copy(t.resolve || {}), f = angular.copy(t.locals || {}), m = t.transformTemplate || angular.identity, p = t.bindToController;
            if (angular.forEach(d, function (e, t) {
                    angular.isString(e) ? d[t] = a.get(e) : d[t] = a.invoke(e)
                }), angular.extend(d, f), r)d.$template = e.when(r); else {
                if (!n)throw new Error("Missing `template` / `templateUrl` option.");
                d.$template = l(n)
            }
            return t.contentTemplate && (d.$template = e.all([d.$template, l(t.contentTemplate)]).then(function (e) {
                var n = angular.element(e[0]), a = s('[ng-bind="content"]', n[0]).removeAttr("ng-bind").html(e[1]);
                return t.templateUrl || a.next().remove(), n[0].outerHTML
            })), e.all(d).then(function (e) {
                var n = m(e.$template);
                t.html && (n = n.replace(/ng-bind="/gi, 'ng-bind-html="'));
                var a = angular.element("<div>").html(n.trim()).contents(), r = o(a);
                return {
                    locals: e, element: a, link: function (t) {
                        if (e.$scope = t, u) {
                            var n = i(u, e, !0);
                            p && angular.extend(n.instance, e);
                            var o = angular.isObject(n) ? n : n();
                            a.data("$ngControllerController", o), a.children().data("$ngControllerController", o), c && (t[c] = o)
                        }
                        return r.apply(null, arguments)
                    }
                }
            })
        };
        var u = {}
    }

    angular.module("mgcrea.ngStrap.tooltip", ["mgcrea.ngStrap.core", "mgcrea.ngStrap.helpers.dimensions"]).provider("$tooltip", function () {
        var e = this.defaults = {
            animation: "am-fade",
            customClass: "",
            prefixClass: "tooltip",
            prefixEvent: "tooltip",
            container: !1,
            target: !1,
            placement: "top",
            templateUrl: "tooltip/tooltip.tpl.html",
            template: "",
            contentTemplate: !1,
            trigger: "hover focus",
            keyboard: !1,
            html: !1,
            show: !1,
            title: "",
            type: "",
            delay: 0,
            autoClose: !1,
            bsEnabled: !0,
            viewport: {selector: "body", padding: 0}
        };
        this.$get = ["$window", "$rootScope", "$bsCompiler", "$q", "$templateCache", "$http", "$animate", "$sce", "dimensions", "$$rAF", "$timeout", function (n, a, o, i, r, s, l, u, c, d, f) {
            function m(i, r) {
                function s() {
                    H.$emit(N.prefixEvent + ".show", A)
                }

                function m() {
                    if (H.$emit(N.prefixEvent + ".hide", A), U === W) {
                        if (z && "focus" === N.trigger)return i[0].blur();
                        C()
                    }
                }

                function w() {
                    var e = N.trigger.split(" ");
                    angular.forEach(e, function (e) {
                        "click" === e ? i.on("click", A.toggle) : "manual" !== e && (i.on("hover" === e ? "mouseenter" : "focus", A.enter), i.on("hover" === e ? "mouseleave" : "blur", A.leave), "button" === O && "hover" !== e && i.on(h ? "touchstart" : "mousedown", A.$onFocusElementMouseDown))
                    })
                }

                function y() {
                    for (var e = N.trigger.split(" "), t = e.length; t--;) {
                        var n = e[t];
                        "click" === n ? i.off("click", A.toggle) : "manual" !== n && (i.off("hover" === n ? "mouseenter" : "focus", A.enter), i.off("hover" === n ? "mouseleave" : "blur", A.leave), "button" === O && "hover" !== n && i.off(h ? "touchstart" : "mousedown", A.$onFocusElementMouseDown))
                    }
                }

                function v() {
                    "focus" !== N.trigger ? U.on("keyup", A.$onKeyUp) : i.on("keyup", A.$onFocusKeyUp)
                }

                function D() {
                    "focus" !== N.trigger ? U.off("keyup", A.$onKeyUp) : i.off("keyup", A.$onFocusKeyUp)
                }

                function b() {
                    f(function () {
                        U.on("click", T), $.on("click", A.hide), K = !0
                    }, 0, !1)
                }

                function S() {
                    K && (U.off("click", T), $.off("click", A.hide), K = !1)
                }

                function T(e) {
                    e.stopPropagation()
                }

                function M(e) {
                    e = e || N.target || i;
                    var a = e[0], o = "BODY" === a.tagName, r = a.getBoundingClientRect(), s = {};
                    for (var l in r)s[l] = r[l];
                    null === s.width && (s = angular.extend({}, s, {
                        width: r.right - r.left,
                        height: r.bottom - r.top
                    }));
                    var u = o ? {
                        top: 0,
                        left: 0
                    } : c.offset(a), d = {scroll: o ? t.documentElement.scrollTop || t.body.scrollTop : e.prop("scrollTop") || 0}, f = o ? {
                        width: t.documentElement.clientWidth,
                        height: n.innerHeight
                    } : null;
                    return angular.extend({}, s, d, f, u)
                }

                function F(e, t, n, a) {
                    var o, i = e.split("-");
                    switch (i[0]) {
                        case"right":
                            o = {top: t.top + t.height / 2 - a / 2, left: t.left + t.width};
                            break;
                        case"bottom":
                            o = {top: t.top + t.height, left: t.left + t.width / 2 - n / 2};
                            break;
                        case"left":
                            o = {top: t.top + t.height / 2 - a / 2, left: t.left - n};
                            break;
                        default:
                            o = {top: t.top - a, left: t.left + t.width / 2 - n / 2}
                    }
                    if (!i[1])return o;
                    if ("top" === i[0] || "bottom" === i[0])switch (i[1]) {
                        case"left":
                            o.left = t.left;
                            break;
                        case"right":
                            o.left = t.left + t.width - n
                    } else if ("left" === i[0] || "right" === i[0])switch (i[1]) {
                        case"top":
                            o.top = t.top - a + t.height;
                            break;
                        case"bottom":
                            o.top = t.top
                    }
                    return o
                }

                function k(e, t) {
                    var n = U[0], a = n.offsetWidth, o = n.offsetHeight, i = parseInt(c.css(n, "margin-top"), 10), r = parseInt(c.css(n, "margin-left"), 10);
                    isNaN(i) && (i = 0), isNaN(r) && (r = 0), e.top = e.top + i, e.left = e.left + r, c.setOffset(n, angular.extend({
                        using: function (e) {
                            U.css({top: Math.round(e.top) + "px", left: Math.round(e.left) + "px", right: ""})
                        }
                    }, e), 0);
                    var s = n.offsetWidth, l = n.offsetHeight;
                    if ("top" === t && l !== o && (e.top = e.top + o - l), !/top-left|top-right|bottom-left|bottom-right/.test(t)) {
                        var u = E(t, e, s, l);
                        if (u.left ? e.left += u.left : e.top += u.top, c.setOffset(n, e), /top|right|bottom|left/.test(t)) {
                            var d = /top|bottom/.test(t), f = d ? 2 * u.left - a + s : 2 * u.top - o + l, m = d ? "offsetWidth" : "offsetHeight";
                            x(f, n[m], d)
                        }
                    }
                }

                function E(e, t, n, a) {
                    var o = {top: 0, left: 0};
                    if (!A.$viewport)return o;
                    var i = N.viewport && N.viewport.padding || 0, r = M(A.$viewport);
                    if (/right|left/.test(e)) {
                        var s = t.top - i - r.scroll, l = t.top + i - r.scroll + a;
                        s < r.top ? o.top = r.top - s : l > r.top + r.height && (o.top = r.top + r.height - l)
                    } else {
                        var u = t.left - i, c = t.left + i + n;
                        u < r.left ? o.left = r.left - u : c > r.right && (o.left = r.left + r.width - c)
                    }
                    return o
                }

                function x(e, t, n) {
                    var a = g(".tooltip-arrow, .arrow", U[0]);
                    a.css(n ? "left" : "top", 50 * (1 - e / t) + "%").css(n ? "top" : "left", "")
                }

                function C() {
                    clearTimeout(R), A.$isShown && null !== U && (N.autoClose && S(), N.keyboard && D()), j && (j.$destroy(), j = null), U && (U.remove(), U = A.$element = null)
                }

                var A = {}, N = A.$options = angular.extend({}, e, r), V = A.$promise = o.compile(N), H = A.$scope = N.scope && N.scope.$new() || a.$new(), O = i[0].nodeName.toLowerCase();
                if (N.delay && angular.isString(N.delay)) {
                    var Y = N.delay.split(",").map(parseFloat);
                    N.delay = Y.length > 1 ? {show: Y[0], hide: Y[1]} : Y[0]
                }
                A.$id = N.id || i.attr("id") || "", N.title && (H.title = u.trustAsHtml(N.title)), H.$setEnabled = function (e) {
                    H.$$postDigest(function () {
                        A.setEnabled(e)
                    })
                }, H.$hide = function () {
                    H.$$postDigest(function () {
                        A.hide()
                    })
                }, H.$show = function () {
                    H.$$postDigest(function () {
                        A.show()
                    })
                }, H.$toggle = function () {
                    H.$$postDigest(function () {
                        A.toggle()
                    })
                }, A.$isShown = H.$isShown = !1;
                var R, I, P, U, L, j;
                V.then(function (e) {
                    P = e, A.init()
                }), A.init = function () {
                    N.delay && angular.isNumber(N.delay) && (N.delay = {
                        show: N.delay,
                        hide: N.delay
                    }), "self" === N.container ? L = i : angular.isElement(N.container) ? L = N.container : N.container && (L = g(N.container)), w(), N.target && (N.target = angular.isElement(N.target) ? N.target : g(N.target)), N.show && H.$$postDigest(function () {
                        "focus" === N.trigger ? i[0].focus() : A.show()
                    })
                }, A.destroy = function () {
                    y(), C(), H.$destroy()
                }, A.enter = function () {
                    return clearTimeout(R), I = "in", N.delay && N.delay.show ? void(R = setTimeout(function () {
                        "in" === I && A.show()
                    }, N.delay.show)) : A.show()
                }, A.show = function () {
                    if (N.bsEnabled && !A.$isShown) {
                        H.$emit(N.prefixEvent + ".show.before", A);
                        var e, t;
                        N.container ? (e = L, t = L[0].lastChild ? angular.element(L[0].lastChild) : null) : (e = null, t = i), U && C(), j = A.$scope.$new(), U = A.$element = P.link(j, function (e, t) {
                        }), U.css({
                            top: "-9999px",
                            left: "-9999px",
                            right: "auto",
                            display: "block",
                            visibility: "hidden"
                        }), N.animation && U.addClass(N.animation), N.type && U.addClass(N.prefixClass + "-" + N.type), N.customClass && U.addClass(N.customClass), t ? t.after(U) : e.prepend(U), A.$isShown = H.$isShown = !0, p(H), A.$applyPlacement(), angular.version.minor <= 2 ? l.enter(U, e, t, s) : l.enter(U, e, t).then(s), p(H), d(function () {
                            U && U.css({visibility: "visible"}), N.keyboard && ("focus" !== N.trigger && A.focus(), v())
                        }), N.autoClose && b()
                    }
                }, A.leave = function () {
                    return clearTimeout(R), I = "out", N.delay && N.delay.hide ? void(R = setTimeout(function () {
                        "out" === I && A.hide()
                    }, N.delay.hide)) : A.hide()
                };
                var z, W;
                A.hide = function (e) {
                    A.$isShown && (H.$emit(N.prefixEvent + ".hide.before", A), z = e, W = U, angular.version.minor <= 2 ? l.leave(U, m) : l.leave(U).then(m), A.$isShown = H.$isShown = !1, p(H), N.keyboard && null !== U && D(), N.autoClose && null !== U && S())
                }, A.toggle = function () {
                    A.$isShown ? A.leave() : A.enter()
                }, A.focus = function () {
                    U[0].focus()
                }, A.setEnabled = function (e) {
                    N.bsEnabled = e
                }, A.setViewport = function (e) {
                    N.viewport = e
                }, A.$applyPlacement = function () {
                    if (U) {
                        var t = N.placement, n = /\s?auto?\s?/i, a = n.test(t);
                        a && (t = t.replace(n, "") || e.placement), U.addClass(N.placement);
                        var o = M(), i = U.prop("offsetWidth"), r = U.prop("offsetHeight");
                        if (A.$viewport = N.viewport && g(N.viewport.selector || N.viewport), a) {
                            var s = t, l = M(A.$viewport);
                            /top/.test(s) && o.bottom + r > l.bottom ? t = s.replace("top", "bottom") : /bottom/.test(s) && o.top - r < l.top && (t = s.replace("bottom", "top")), /left/.test(s) && o.left - i < l.left ? t = t.replace("left", "right") : /right/.test(s) && o.right + i > l.width && (t = t.replace("right", "left")), U.removeClass(s).addClass(t)
                        }
                        var u = F(t, o, i, r);
                        k(u, t)
                    }
                }, A.$onKeyUp = function (e) {
                    27 === e.which && A.$isShown && (A.hide(), e.stopPropagation())
                }, A.$onFocusKeyUp = function (e) {
                    27 === e.which && (i[0].blur(), e.stopPropagation())
                }, A.$onFocusElementMouseDown = function (e) {
                    e.preventDefault(), e.stopPropagation(), A.$isShown ? i[0].blur() : i[0].focus()
                };
                var K = !1;
                return A
            }

            function p(e) {
                e.$$phase || e.$root && e.$root.$$phase || e.$digest()
            }

            function g(e, n) {
                return angular.element((n || t).querySelectorAll(e))
            }

            var h = (String.prototype.trim, "createTouch"in n.document), $ = angular.element(n.document);
            return m
        }]
    }).directive("bsTooltip", ["$window", "$location", "$sce", "$tooltip", "$$rAF", function (e, t, n, a, o) {
        return {
            restrict: "EAC", scope: !0, link: function (e, t, i, r) {
                var s = {scope: e};
                angular.forEach(["template", "templateUrl", "controller", "controllerAs", "contentTemplate", "placement", "container", "delay", "trigger", "html", "animation", "backdropAnimation", "type", "customClass", "id"], function (e) {
                    angular.isDefined(i[e]) && (s[e] = i[e])
                });
                var l = /^(false|0|)$/i;
                angular.forEach(["html", "container"], function (e) {
                    angular.isDefined(i[e]) && l.test(i[e]) && (s[e] = !1)
                });
                var u = t.attr("data-target");
                angular.isDefined(u) && (l.test(u) ? s.target = !1 : s.target = u), e.hasOwnProperty("title") || (e.title = ""), i.$observe("title", function (t) {
                    if (angular.isDefined(t) || !e.hasOwnProperty("title")) {
                        var a = e.title;
                        e.title = n.trustAsHtml(t), angular.isDefined(a) && o(function () {
                            c && c.$applyPlacement()
                        })
                    }
                }), i.bsTooltip && e.$watch(i.bsTooltip, function (t, n) {
                    angular.isObject(t) ? angular.extend(e, t) : e.title = t, angular.isDefined(n) && o(function () {
                        c && c.$applyPlacement()
                    })
                }, !0), i.bsShow && e.$watch(i.bsShow, function (e, t) {
                    c && angular.isDefined(e) && (angular.isString(e) && (e = !!e.match(/true|,?(tooltip),?/i)), e === !0 ? c.show() : c.hide())
                }), i.bsEnabled && e.$watch(i.bsEnabled, function (e, t) {
                    c && angular.isDefined(e) && (angular.isString(e) && (e = !!e.match(/true|1|,?(tooltip),?/i)), e === !1 ? c.setEnabled(!1) : c.setEnabled(!0))
                }), i.viewport && e.$watch(i.viewport, function (e) {
                    c && angular.isDefined(e) && c.setViewport(e)
                });
                var c = a(t, s);
                e.$on("$destroy", function () {
                    c && c.destroy(), s = null, c = null
                })
            }
        }
    }]), angular.module("mgcrea.ngStrap.timepicker", ["mgcrea.ngStrap.helpers.dateParser", "mgcrea.ngStrap.helpers.dateFormatter", "mgcrea.ngStrap.tooltip"]).provider("$timepicker", function () {
        var e = this.defaults = {
            animation: "am-fade",
            prefixClass: "timepicker",
            placement: "bottom-left",
            templateUrl: "timepicker/timepicker.tpl.html",
            trigger: "focus",
            container: !1,
            keyboard: !0,
            html: !1,
            delay: 0,
            useNative: !0,
            timeType: "date",
            timeFormat: "shortTime",
            timezone: null,
            modelTimeFormat: null,
            autoclose: !1,
            minTime: -(1 / 0),
            maxTime: +(1 / 0),
            length: 5,
            hourStep: 1,
            minuteStep: 5,
            secondStep: 5,
            roundDisplay: !1,
            iconUp: "fa fa-chevron-up",
            iconDown: "fa fa-chevron-down",
            arrowBehavior: "pager"
        };
        this.$get = ["$window", "$document", "$rootScope", "$sce", "$dateFormatter", "$tooltip", "$timeout", function (t, n, a, o, i, r, s) {
            function l(t, n, a) {
                function o(e) {
                    var t = 6e4 * p.minuteStep;
                    return new Date(Math.floor(e.getTime() / t) * t)
                }

                function l(e, n) {
                    var a = e + n;
                    if (t[0].createTextRange) {
                        var o = t[0].createTextRange();
                        o.collapse(!0), o.moveStart("character", e), o.moveEnd("character", a), o.select()
                    } else t[0].setSelectionRange ? t[0].setSelectionRange(e, a) : angular.isUndefined(t[0].selectionStart) && (t[0].selectionStart = e, t[0].selectionEnd = a)
                }

                function d() {
                    t[0].focus()
                }

                var f = r(t, angular.extend({}, e, a)), m = a.scope, p = f.$options, g = f.$scope, h = p.lang, $ = function (e, t, n) {
                    return i.formatDate(e, t, h, n)
                }, w = 0, y = p.roundDisplay ? o(new Date) : new Date, v = n.$dateValue || y, D = {
                    hour: v.getHours(),
                    meridian: v.getHours() < 12,
                    minute: v.getMinutes(),
                    second: v.getSeconds(),
                    millisecond: v.getMilliseconds()
                }, b = i.getDatetimeFormat(p.timeFormat, h), S = i.hoursFormat(b), T = i.timeSeparator(b), M = i.minutesFormat(b), F = i.secondsFormat(b), k = i.showSeconds(b), E = i.showAM(b);
                g.$iconUp = p.iconUp, g.$iconDown = p.iconDown, g.$select = function (e, t) {
                    f.select(e, t)
                }, g.$moveIndex = function (e, t) {
                    f.$moveIndex(e, t)
                }, g.$switchMeridian = function (e) {
                    f.switchMeridian(e)
                }, f.update = function (e) {
                    angular.isDate(e) && !isNaN(e.getTime()) ? (f.$date = e, angular.extend(D, {
                        hour: e.getHours(),
                        minute: e.getMinutes(),
                        second: e.getSeconds(),
                        millisecond: e.getMilliseconds()
                    }), f.$build()) : f.$isBuilt || f.$build()
                }, f.select = function (e, t, a) {
                    n.$dateValue && !isNaN(n.$dateValue.getTime()) || (n.$dateValue = new Date(1970, 0, 1)), angular.isDate(e) || (e = new Date(e)), 0 === t ? n.$dateValue.setHours(e.getHours()) : 1 === t ? n.$dateValue.setMinutes(e.getMinutes()) : 2 === t && n.$dateValue.setSeconds(e.getSeconds()), n.$setViewValue(angular.copy(n.$dateValue)), n.$render(), p.autoclose && !a && s(function () {
                        f.hide(!0)
                    })
                }, f.switchMeridian = function (e) {
                    if (n.$dateValue && !isNaN(n.$dateValue.getTime())) {
                        var t = (e || n.$dateValue).getHours();
                        n.$dateValue.setHours(12 > t ? t + 12 : t - 12), n.$setViewValue(angular.copy(n.$dateValue)), n.$render()
                    }
                }, f.$build = function () {
                    var e, t, n = g.midIndex = parseInt(p.length / 2, 10), a = [];
                    for (e = 0; e < p.length; e++)t = new Date(1970, 0, 1, D.hour - (n - e) * p.hourStep), a.push({
                        date: t,
                        label: $(t, S),
                        selected: f.$date && f.$isSelected(t, 0),
                        disabled: f.$isDisabled(t, 0)
                    });
                    var o, i = [];
                    for (e = 0; e < p.length; e++)o = new Date(1970, 0, 1, 0, D.minute - (n - e) * p.minuteStep), i.push({
                        date: o,
                        label: $(o, M),
                        selected: f.$date && f.$isSelected(o, 1),
                        disabled: f.$isDisabled(o, 1)
                    });
                    var r, s = [];
                    for (e = 0; e < p.length; e++)r = new Date(1970, 0, 1, 0, 0, D.second - (n - e) * p.secondStep), s.push({
                        date: r,
                        label: $(r, F),
                        selected: f.$date && f.$isSelected(r, 2),
                        disabled: f.$isDisabled(r, 2)
                    });
                    var l = [];
                    for (e = 0; e < p.length; e++)k ? l.push([a[e], i[e], s[e]]) : l.push([a[e], i[e]]);
                    g.rows = l, g.showSeconds = k, g.showAM = E, g.isAM = (f.$date || a[n].date).getHours() < 12, g.timeSeparator = T, f.$isBuilt = !0
                }, f.$isSelected = function (e, t) {
                    return !!f.$date && (0 === t ? e.getHours() === f.$date.getHours() : 1 === t ? e.getMinutes() === f.$date.getMinutes() : 2 === t ? e.getSeconds() === f.$date.getSeconds() : void 0)
                }, f.$isDisabled = function (e, t) {
                    var n;
                    return 0 === t ? n = e.getTime() + 6e4 * D.minute + 1e3 * D.second : 1 === t ? n = e.getTime() + 36e5 * D.hour + 1e3 * D.second : 2 === t && (n = e.getTime() + 36e5 * D.hour + 6e4 * D.minute), n < 1 * p.minTime || n > 1 * p.maxTime
                }, g.$arrowAction = function (e, t) {
                    "picker" === p.arrowBehavior ? f.$setTimeByStep(e, t) : f.$moveIndex(e, t)
                }, f.$setTimeByStep = function (e, t) {
                    var n = new Date(f.$date || v), a = n.getHours(), o = n.getMinutes(), i = n.getSeconds();
                    0 === t ? n.setHours(a - parseInt(p.hourStep, 10) * e) : 1 === t ? n.setMinutes(o - parseInt(p.minuteStep, 10) * e) : 2 === t && n.setSeconds(i - parseInt(p.secondStep, 10) * e), f.select(n, t, !0)
                }, f.$moveIndex = function (e, t) {
                    var n;
                    0 === t ? (n = new Date(1970, 0, 1, D.hour + e * p.length, D.minute, D.second), angular.extend(D, {hour: n.getHours()})) : 1 === t ? (n = new Date(1970, 0, 1, D.hour, D.minute + e * p.length * p.minuteStep, D.second), angular.extend(D, {minute: n.getMinutes()})) : 2 === t && (n = new Date(1970, 0, 1, D.hour, D.minute, D.second + e * p.length * p.secondStep), angular.extend(D, {second: n.getSeconds()})), f.$build()
                }, f.$onMouseDown = function (e) {
                    if ("input" !== e.target.nodeName.toLowerCase() && e.preventDefault(), e.stopPropagation(), c) {
                        var t = angular.element(e.target);
                        "button" !== t[0].nodeName.toLowerCase() && (t = t.parent()), t.triggerHandler("click")
                    }
                }, f.$onKeyDown = function (e) {
                    if (/(38|37|39|40|13)/.test(e.keyCode) && !e.shiftKey && !e.altKey) {
                        if (e.preventDefault(), e.stopPropagation(), 13 === e.keyCode)return void f.hide(!0);
                        var t = new Date(f.$date), n = t.getHours(), a = $(t, S).length, o = t.getMinutes(), i = $(t, M).length, r = t.getSeconds(), s = $(t, F).length, u = 1, c = /(37|39)/.test(e.keyCode), d = 2 + 1 * k + 1 * E;
                        c && (37 === e.keyCode ? w = 1 > w ? d - 1 : w - 1 : 39 === e.keyCode && (w = d - 1 > w ? w + 1 : 0));
                        var g = [0, a], h = 0;
                        38 === e.keyCode && (h = -1), 40 === e.keyCode && (h = 1);
                        var y = 2 === w && k, v = 2 === w && !k || 3 === w && k;
                        0 === w ? (t.setHours(n + h * parseInt(p.hourStep, 10)), a = $(t, S).length, g = [0, a]) : 1 === w ? (t.setMinutes(o + h * parseInt(p.minuteStep, 10)), i = $(t, M).length, g = [a + u, i]) : y ? (t.setSeconds(r + h * parseInt(p.secondStep, 10)), s = $(t, F).length, g = [a + u + i + u, s]) : v && (c || f.switchMeridian(), g = [a + u + i + u + (s + u) * k, 2]), f.select(t, w, !0), l(g[0], g[1]), m.$digest()
                    }
                };
                var x = f.init;
                f.init = function () {
                    return u && p.useNative ? (t.prop("type", "time"), void t.css("-webkit-appearance", "textfield")) : (c && (t.prop("type", "text"), t.attr("readonly", "true"), t.on("click", d)), void x())
                };
                var C = f.destroy;
                f.destroy = function () {
                    u && p.useNative && t.off("click", d), C()
                };
                var A = f.show;
                f.show = function () {
                    !c && t.attr("readonly") || t.attr("disabled") || (A(), s(function () {
                        f.$element && f.$element.on(c ? "touchstart" : "mousedown", f.$onMouseDown), p.keyboard && t && t.on("keydown", f.$onKeyDown)
                    }, 0, !1))
                };
                var N = f.hide;
                return f.hide = function (e) {
                    f.$isShown && (f.$element && f.$element.off(c ? "touchstart" : "mousedown", f.$onMouseDown), p.keyboard && t && t.off("keydown", f.$onKeyDown), N(e))
                }, f
            }

            var u = /(ip(a|o)d|iphone|android)/gi.test(t.navigator.userAgent), c = "createTouch"in t.document && u;
            return e.lang || (e.lang = i.getDefaultLocale()), l.defaults = e, l
        }]
    }).directive("bsTimepicker", ["$window", "$parse", "$q", "$dateFormatter", "$dateParser", "$timepicker", function (e, t, a, o, i, r) {
        var s = r.defaults, l = /(ip(a|o)d|iphone|android)/gi.test(e.navigator.userAgent);
        return {
            restrict: "EAC", require: "ngModel", link: function (e, t, a, u) {
                function c(e) {
                    if (angular.isDate(e)) {
                        var t = isNaN(f.minTime) || new Date(e.getTime()).setFullYear(1970, 0, 1) >= f.minTime, n = isNaN(f.maxTime) || new Date(e.getTime()).setFullYear(1970, 0, 1) <= f.maxTime, a = t && n;
                        u.$setValidity("date", a), u.$setValidity("min", t), u.$setValidity("max", n), a && (u.$dateValue = e)
                    }
                }

                function d() {
                    return !u.$dateValue || isNaN(u.$dateValue.getTime()) ? "" : h(u.$dateValue, f.timeFormat)
                }

                var f = {scope: e};
                angular.forEach(["template", "templateUrl", "controller", "controllerAs", "placement", "container", "delay", "trigger", "keyboard", "html", "animation", "autoclose", "timeType", "timeFormat", "timezone", "modelTimeFormat", "useNative", "hourStep", "minuteStep", "secondStep", "length", "arrowBehavior", "iconUp", "iconDown", "roundDisplay", "id", "prefixClass", "prefixEvent"], function (e) {
                    angular.isDefined(a[e]) && (f[e] = a[e])
                });
                var m = /^(false|0|)$/i;
                angular.forEach(["html", "container", "autoclose", "useNative", "roundDisplay"], function (e) {
                    angular.isDefined(a[e]) && m.test(a[e]) && (f[e] = !1)
                }), a.bsShow && e.$watch(a.bsShow, function (e, t) {
                    p && angular.isDefined(e) && (angular.isString(e) && (e = !!e.match(/true|,?(timepicker),?/i)), e === !0 ? p.show() : p.hide())
                }), l && (f.useNative || s.useNative) && (f.timeFormat = "HH:mm");
                var p = r(t, u, f);
                f = p.$options;
                var g = f.lang, h = function (e, t, n) {
                    return o.formatDate(e, t, g, n)
                }, $ = i({format: f.timeFormat, lang: g});
                angular.forEach(["minTime", "maxTime"], function (e) {
                    angular.isDefined(a[e]) && a.$observe(e, function (t) {
                        p.$options[e] = $.getTimeForAttribute(e, t), !isNaN(p.$options[e]) && p.$build(), c(u.$dateValue)
                    })
                }), e.$watch(a.ngModel, function (e, t) {
                    p.update(u.$dateValue)
                }, !0), u.$parsers.unshift(function (e) {
                    var t;
                    if (!e)return u.$setValidity("date", !0), null;
                    var a = angular.isDate(e) ? e : $.parse(e, u.$dateValue);
                    return !a || isNaN(a.getTime()) ? (u.$setValidity("date", !1), n) : (c(a), "string" === f.timeType ? (t = $.timezoneOffsetAdjust(a, f.timezone, !0), h(t, f.modelTimeFormat || f.timeFormat)) : (t = $.timezoneOffsetAdjust(u.$dateValue, f.timezone, !0), "number" === f.timeType ? t.getTime() : "unix" === f.timeType ? t.getTime() / 1e3 : "iso" === f.timeType ? t.toISOString() : new Date(t)))
                }), u.$formatters.push(function (e) {
                    var t;
                    return t = angular.isUndefined(e) || null === e ? NaN : angular.isDate(e) ? e : "string" === f.timeType ? $.parse(e, null, f.modelTimeFormat) : "unix" === f.timeType ? new Date(1e3 * e) : new Date(e), u.$dateValue = $.timezoneOffsetAdjust(t, f.timezone), d()
                }), u.$render = function () {
                    t.val(d())
                }, e.$on("$destroy", function () {
                    p && p.destroy(), f = null, p = null
                })
            }
        }
    }]), angular.version.minor < 3 && angular.version.dot < 14 && angular.module("ng").factory("$$rAF", ["$window", "$timeout", function (e, t) {
        var n = e.requestAnimationFrame || e.webkitRequestAnimationFrame || e.mozRequestAnimationFrame, a = e.cancelAnimationFrame || e.webkitCancelAnimationFrame || e.mozCancelAnimationFrame || e.webkitCancelRequestAnimationFrame, o = !!n, i = o ? function (e) {
            var t = n(e);
            return function () {
                a(t)
            }
        } : function (e) {
            var n = t(e, 16.66, !1);
            return function () {
                t.cancel(n)
            }
        };
        return i.supported = o, i
    }]), angular.module("mgcrea.ngStrap.helpers.parseOptions", []).provider("$parseOptions", function () {
        var e = this.defaults = {regexp: /^\s*(.*?)(?:\s+as\s+(.*?))?(?:\s+group\s+by\s+(.*))?\s+for\s+(?:([\$\w][\$\w]*)|(?:\(\s*([\$\w][\$\w]*)\s*,\s*([\$\w][\$\w]*)\s*\)))\s+in\s+(.*?)(?:\s+track\s+by\s+(.*?))?$/};
        this.$get = ["$parse", "$q", function (t, n) {
            function a(a, o) {
                function i(e, t) {
                    return e.map(function (e, n) {
                        var a, o, i = {};
                        return i[c] = e, a = u(t, i), o = m(t, i), {label: a, value: o, index: n}
                    })
                }

                var r = {}, s = angular.extend({}, e, o);
                r.$values = [];
                var l, u, c, d, f, m, p;
                return r.init = function () {
                    r.$match = l = a.match(s.regexp), u = t(l[2] || l[1]), c = l[4] || l[6], d = l[5], f = t(l[3] || ""), m = t(l[2] ? l[1] : c), p = t(l[7])
                }, r.valuesFn = function (e, t) {
                    return n.when(p(e, t)).then(function (t) {
                        return angular.isArray(t) || (t = []), r.$values = t.length ? i(t, e) : [], r.$values
                    })
                }, r.displayValue = function (e) {
                    var t = {};
                    return t[c] = e, u(t)
                }, r.init(), r
            }

            return a
        }]
    }), angular.module("mgcrea.ngStrap.helpers.dimensions", []).factory("dimensions", ["$document", "$window", function (t, n) {
        var a = (angular.element, {}), o = a.nodeName = function (e, t) {
            return e.nodeName && e.nodeName.toLowerCase() === t.toLowerCase()
        };
        a.css = function (t, n, a) {
            var o;
            return o = t.currentStyle ? t.currentStyle[n] : e.getComputedStyle ? e.getComputedStyle(t)[n] : t.style[n], a === !0 ? parseFloat(o) || 0 : o
        }, a.offset = function (t) {
            var n = t.getBoundingClientRect(), a = t.ownerDocument;
            return {
                width: n.width || t.offsetWidth,
                height: n.height || t.offsetHeight,
                top: n.top + (e.pageYOffset || a.documentElement.scrollTop) - (a.documentElement.clientTop || 0),
                left: n.left + (e.pageXOffset || a.documentElement.scrollLeft) - (a.documentElement.clientLeft || 0)
            }
        }, a.setOffset = function (e, t, n) {
            var o, i, r, s, l, u, c, d = a.css(e, "position"), f = angular.element(e), m = {};
            "static" === d && (e.style.position = "relative"), l = a.offset(e), r = a.css(e, "top"), u = a.css(e, "left"), c = ("absolute" === d || "fixed" === d) && (r + u).indexOf("auto") > -1, c ? (o = a.position(e), s = o.top, i = o.left) : (s = parseFloat(r) || 0, i = parseFloat(u) || 0), angular.isFunction(t) && (t = t.call(e, n, l)), null !== t.top && (m.top = t.top - l.top + s), null !== t.left && (m.left = t.left - l.left + i), "using"in t ? t.using.call(f, m) : f.css({
                top: m.top + "px",
                left: m.left + "px"
            })
        }, a.position = function (e) {
            var t, n, r = {top: 0, left: 0};
            return "fixed" === a.css(e, "position") ? n = e.getBoundingClientRect() : (t = i(e), n = a.offset(e), o(t, "html") || (r = a.offset(t)), r.top += a.css(t, "borderTopWidth", !0), r.left += a.css(t, "borderLeftWidth", !0)), {
                width: e.offsetWidth,
                height: e.offsetHeight,
                top: n.top - r.top - a.css(e, "marginTop", !0),
                left: n.left - r.left - a.css(e, "marginLeft", !0)
            }
        };
        var i = function (e) {
            var t = e.ownerDocument, n = e.offsetParent || t;
            if (o(n, "#document"))return t.documentElement;
            for (; n && !o(n, "html") && "static" === a.css(n, "position");)n = n.offsetParent;
            return n || t.documentElement
        };
        return a.height = function (e, t) {
            var n = e.offsetHeight;
            return t ? n += a.css(e, "marginTop", !0) + a.css(e, "marginBottom", !0) : n -= a.css(e, "paddingTop", !0) + a.css(e, "paddingBottom", !0) + a.css(e, "borderTopWidth", !0) + a.css(e, "borderBottomWidth", !0), n
        }, a.width = function (e, t) {
            var n = e.offsetWidth;
            return t ? n += a.css(e, "marginLeft", !0) + a.css(e, "marginRight", !0) : n -= a.css(e, "paddingLeft", !0) + a.css(e, "paddingRight", !0) + a.css(e, "borderLeftWidth", !0) + a.css(e, "borderRightWidth", !0), n
        }, a
    }]), angular.module("mgcrea.ngStrap.helpers.debounce", []).factory("debounce", ["$timeout", function (e) {
        return function (t, n, a) {
            var o = null;
            return function () {
                var i = this, r = arguments, s = a && !o;
                return o && e.cancel(o), o = e(function () {
                    o = null, a || t.apply(i, r)
                }, n, !1), s && t.apply(i, r), o
            }
        }
    }]).factory("throttle", ["$timeout", function (e) {
        return function (t, n, a) {
            var o = null;
            return a || (a = {}), function () {
                var i = this, r = arguments;
                o || (a.leading !== !1 && t.apply(i, r), o = e(function () {
                    o = null, a.trailing !== !1 && t.apply(i, r)
                }, n, !1))
            }
        }
    }]), angular.module("mgcrea.ngStrap.helpers.dateParser", []).provider("$dateParser", ["$localeProvider", function (e) {
        function t() {
            this.year = 1970, this.month = 0, this.day = 1, this.hours = 0, this.minutes = 0, this.seconds = 0, this.milliseconds = 0
        }

        function n() {
        }

        function a(e) {
            return !isNaN(parseFloat(e)) && isFinite(e)
        }

        function o(e, t) {
            for (var n = e.length, a = t.toString().toLowerCase(), o = 0; n > o; o++)if (e[o].toLowerCase() === a)return o;
            return -1
        }

        t.prototype.setMilliseconds = function (e) {
            this.milliseconds = e
        }, t.prototype.setSeconds = function (e) {
            this.seconds = e
        }, t.prototype.setMinutes = function (e) {
            this.minutes = e
        }, t.prototype.setHours = function (e) {
            this.hours = e
        }, t.prototype.getHours = function () {
            return this.hours
        }, t.prototype.setDate = function (e) {
            this.day = e
        }, t.prototype.setMonth = function (e) {
            this.month = e
        }, t.prototype.setFullYear = function (e) {
            this.year = e
        }, t.prototype.fromDate = function (e) {
            return this.year = e.getFullYear(), this.month = e.getMonth(), this.day = e.getDate(), this.hours = e.getHours(), this.minutes = e.getMinutes(), this.seconds = e.getSeconds(), this.milliseconds = e.getMilliseconds(), this
        }, t.prototype.toDate = function () {
            return new Date(this.year, this.month, this.day, this.hours, this.minutes, this.seconds, this.milliseconds)
        };
        var i = t.prototype, r = this.defaults = {format: "shortDate", strict: !1};
        this.$get = ["$locale", "dateFilter", function (e, s) {
            var l = function (l) {
                function u(e) {
                    var t = c(e);
                    return p(t)
                }

                function c(e) {
                    var t = d(e), n = t.replace(/''/g, "\\'"), a = /('(?:\\'|.)*?')/, o = n.split(a), i = Object.keys(D), r = [];
                    return angular.forEach(o, function (e) {
                        if (f(e))e = m(e); else for (var t = 0; t < i.length; t++)e = e.split(i[t]).join("${" + t + "}");
                        r.push(e)
                    }), r.join("")
                }

                function d(e) {
                    return e.replace(/\\/g, "[\\\\]").replace(/-/g, "[-]").replace(/\./g, "[.]").replace(/\*/g, "[*]").replace(/\+/g, "[+]").replace(/\?/g, "[?]").replace(/\$/g, "[$]").replace(/\^/g, "[^]").replace(/\//g, "[/]").replace(/\\s/g, "[\\s]")
                }

                function f(e) {
                    return /^'.*'$/.test(e)
                }

                function m(e) {
                    return e.replace(/^'(.*)'$/, "$1")
                }

                function p(e) {
                    for (var t = Object.keys(D), n = e, a = 0; a < t.length; a++)n = n.split("${" + a + "}").join("(" + D[t[a]] + ")");
                    return new RegExp("^" + n + "$", ["i"])
                }

                function g(e) {
                    var t = c(e);
                    return h(t)
                }

                function h(e) {
                    for (var t, n, a, o, i = Object.keys(D), r = new RegExp("\\${(\\d+)}", "g"), s = []; null !== (t = r.exec(e));)n = t[1], a = i[n], o = b[a], s.push(o);
                    return s
                }

                var $, w, y = angular.extend({}, r, l), v = {}, D = {
                    sss: "[0-9]{3}",
                    ss: "[0-5][0-9]",
                    s: y.strict ? "[1-5]?[0-9]" : "[0-9]|[0-5][0-9]",
                    mm: "[0-5][0-9]",
                    m: y.strict ? "[1-5]?[0-9]" : "[0-9]|[0-5][0-9]",
                    HH: "[01][0-9]|2[0-3]",
                    H: y.strict ? "1?[0-9]|2[0-3]" : "[01]?[0-9]|2[0-3]",
                    hh: "[0][1-9]|[1][012]",
                    h: y.strict ? "[1-9]|1[012]" : "0?[1-9]|1[012]",
                    a: "AM|PM",
                    EEEE: e.DATETIME_FORMATS.DAY.join("|"),
                    EEE: e.DATETIME_FORMATS.SHORTDAY.join("|"),
                    dd: "0[1-9]|[12][0-9]|3[01]",
                    d: y.strict ? "[1-9]|[1-2][0-9]|3[01]" : "0?[1-9]|[1-2][0-9]|3[01]",
                    MMMM: e.DATETIME_FORMATS.MONTH.join("|"),
                    MMM: e.DATETIME_FORMATS.SHORTMONTH.join("|"),
                    MM: "0[1-9]|1[012]",
                    M: y.strict ? "[1-9]|1[012]" : "0?[1-9]|1[012]",
                    yyyy: "[1]{1}[0-9]{3}|[2]{1}[0-9]{3}",
                    yy: "[0-9]{2}",
                    y: y.strict ? "-?(0|[1-9][0-9]{0,3})" : "-?0*[0-9]{1,4}"
                }, b = {
                    sss: i.setMilliseconds,
                    ss: i.setSeconds,
                    s: i.setSeconds,
                    mm: i.setMinutes,
                    m: i.setMinutes,
                    HH: i.setHours,
                    H: i.setHours,
                    hh: i.setHours,
                    h: i.setHours,
                    EEEE: n,
                    EEE: n,
                    dd: i.setDate,
                    d: i.setDate,
                    a: function (e) {
                        var t = this.getHours() % 12;
                        return this.setHours(e.match(/pm/i) ? t + 12 : t)
                    },
                    MMMM: function (t) {
                        return this.setMonth(o(e.DATETIME_FORMATS.MONTH, t))
                    },
                    MMM: function (t) {
                        return this.setMonth(o(e.DATETIME_FORMATS.SHORTMONTH, t))
                    },
                    MM: function (e) {
                        return this.setMonth(1 * e - 1)
                    },
                    M: function (e) {
                        return this.setMonth(1 * e - 1)
                    },
                    yyyy: i.setFullYear,
                    yy: function (e) {
                        return this.setFullYear(2e3 + 1 * e)
                    },
                    y: function (e) {
                        return 50 >= 1 * e && 2 === e.length ? this.setFullYear(2e3 + 1 * e) : this.setFullYear(1 * e)
                    }
                };
                return v.init = function () {
                    v.$format = e.DATETIME_FORMATS[y.format] || y.format, $ = u(v.$format), w = g(v.$format)
                }, v.isValid = function (e) {
                    return angular.isDate(e) ? !isNaN(e.getTime()) : $.test(e)
                }, v.parse = function (n, a, o, i) {
                    o && (o = e.DATETIME_FORMATS[o] || o), angular.isDate(n) && (n = s(n, o || v.$format, i));
                    var r = o ? u(o) : $, l = o ? g(o) : w, c = r.exec(n);
                    if (!c)return !1;
                    for (var d = a && !isNaN(a.getTime()) ? (new t).fromDate(a) : (new t).fromDate(new Date(1970, 0, 1, 0)), f = 0; f < c.length - 1; f++)l[f] && l[f].call(d, c[f + 1]);
                    var m = d.toDate();
                    return parseInt(d.day, 10) === m.getDate() && m
                }, v.getDateForAttribute = function (e, t) {
                    var n;
                    if ("today" === t) {
                        var o = new Date;
                        n = new Date(o.getFullYear(), o.getMonth(), o.getDate() + ("maxDate" === e ? 1 : 0), 0, 0, 0, "minDate" === e ? 0 : -1)
                    } else n = angular.isString(t) && t.match(/^".+"$/) ? new Date(t.substr(1, t.length - 2)) : a(t) ? new Date(parseInt(t, 10)) : angular.isString(t) && 0 === t.length ? "minDate" === e ? -(1 / 0) : +(1 / 0) : new Date(t);
                    return n
                }, v.getTimeForAttribute = function (e, t) {
                    var n;
                    return n = "now" === t ? (new Date).setFullYear(1970, 0, 1) : angular.isString(t) && t.match(/^".+"$/) ? new Date(t.substr(1, t.length - 2)).setFullYear(1970, 0, 1) : a(t) ? new Date(parseInt(t, 10)).setFullYear(1970, 0, 1) : angular.isString(t) && 0 === t.length ? "minTime" === e ? -(1 / 0) : +(1 / 0) : v.parse(t, new Date(1970, 0, 1, 0))
                }, v.daylightSavingAdjust = function (e) {
                    return e ? (e.setHours(e.getHours() > 12 ? e.getHours() + 2 : 0), e) : null
                }, v.timezoneOffsetAdjust = function (e, t, n) {
                    return e ? (t && "UTC" === t && (e = new Date(e.getTime()), e.setMinutes(e.getMinutes() + (n ? -1 : 1) * e.getTimezoneOffset())), e) : null
                }, v.init(), v
            };
            return l
        }]
    }]), angular.module("mgcrea.ngStrap.helpers.dateFormatter", []).service("$dateFormatter", ["$locale", "dateFilter", function (e, t) {
        function n(e) {
            return /(h+)([:\.])?(m+)([:\.])?(s*)[ ]?(a?)/i.exec(e).slice(1)
        }

        this.getDefaultLocale = function () {
            return e.id
        }, this.getDatetimeFormat = function (t, n) {
            return e.DATETIME_FORMATS[t] || t
        }, this.weekdaysShort = function (t) {
            return e.DATETIME_FORMATS.SHORTDAY
        }, this.hoursFormat = function (e) {
            return n(e)[0]
        }, this.minutesFormat = function (e) {
            return n(e)[2]
        }, this.secondsFormat = function (e) {
            return n(e)[4]
        }, this.timeSeparator = function (e) {
            return n(e)[1]
        }, this.showSeconds = function (e) {
            return !!n(e)[4]
        }, this.showAM = function (e) {
            return !!n(e)[5]
        }, this.formatDate = function (e, n, a, o) {
            return t(e, n, o)
        }
    }]), angular.module("mgcrea.ngStrap.core", []).service("$bsCompiler", a), a.$inject = ["$q", "$http", "$injector", "$compile", "$controller", "$templateCache"], angular.module("mgcrea.ngStrap.datepicker", ["mgcrea.ngStrap.helpers.dateParser", "mgcrea.ngStrap.helpers.dateFormatter", "mgcrea.ngStrap.tooltip"]).provider("$datepicker", function () {
        var e = this.defaults = {
            animation: "am-fade",
            prefixClass: "datepicker",
            placement: "bottom-left",
            templateUrl: "datepicker/datepicker.tpl.html",
            trigger: "focus",
            container: !1,
            keyboard: !0,
            html: !1,
            delay: 0,
            useNative: !1,
            dateType: "date",
            dateFormat: "shortDate",
            timezone: null,
            modelDateFormat: null,
            dayFormat: "dd",
            monthFormat: "MMM",
            yearFormat: "yyyy",
            monthTitleFormat: "MMMM yyyy",
            yearTitleFormat: "yyyy",
            strictFormat: !1,
            autoclose: !1,
            minDate: -(1 / 0),
            maxDate: +(1 / 0),
            startView: 0,
            minView: 0,
            startWeek: 0,
            daysOfWeekDisabled: "",
            iconLeft: "fa fa-chevron-left",
            iconRight: "fa fa-chevron-right"
        };
        this.$get = ["$window", "$document", "$rootScope", "$sce", "$dateFormatter", "datepickerViews", "$tooltip", "$timeout", function (t, n, a, o, i, r, s, l) {
            function u(t, n, a) {
                function o(e) {
                    e.selected = u.$isSelected(e.date)
                }

                function i() {
                    t[0].focus()
                }

                var u = s(t, angular.extend({}, e, a)), f = a.scope, m = u.$options, p = u.$scope;
                m.startView && (m.startView -= m.minView);
                var g = r(u);
                u.$views = g.views;
                var h = g.viewDate;
                p.$mode = m.startView, p.$iconLeft = m.iconLeft, p.$iconRight = m.iconRight;
                var $ = u.$views[p.$mode];
                p.$select = function (e) {
                    u.select(e)
                }, p.$selectPane = function (e) {
                    u.$selectPane(e)
                }, p.$toggleMode = function () {
                    u.setMode((p.$mode + 1) % u.$views.length)
                }, u.update = function (e) {
                    angular.isDate(e) && !isNaN(e.getTime()) && (u.$date = e, $.update.call($, e)), u.$build(!0)
                }, u.updateDisabledDates = function (e) {
                    m.disabledDateRanges = e;
                    for (var t = 0, n = p.rows.length; n > t; t++)angular.forEach(p.rows[t], u.$setDisabledEl)
                }, u.select = function (e, t) {
                    angular.isDate(n.$dateValue) || (n.$dateValue = new Date(e)), !p.$mode || t ? (n.$setViewValue(angular.copy(e)), n.$render(), m.autoclose && !t && l(function () {
                        u.hide(!0)
                    })) : (angular.extend(h, {
                        year: e.getFullYear(),
                        month: e.getMonth(),
                        date: e.getDate()
                    }), u.setMode(p.$mode - 1), u.$build())
                }, u.setMode = function (e) {
                    p.$mode = e, $ = u.$views[p.$mode], u.$build()
                }, u.$build = function (e) {
                    e === !0 && $.built || (e !== !1 || $.built) && $.build.call($)
                }, u.$updateSelected = function () {
                    for (var e = 0, t = p.rows.length; t > e; e++)angular.forEach(p.rows[e], o)
                }, u.$isSelected = function (e) {
                    return $.isSelected(e)
                }, u.$setDisabledEl = function (e) {
                    e.disabled = $.isDisabled(e.date)
                }, u.$selectPane = function (e) {
                    var t = $.steps, n = new Date(Date.UTC(h.year + (t.year || 0) * e, h.month + (t.month || 0) * e, 1));
                    angular.extend(h, {
                        year: n.getUTCFullYear(),
                        month: n.getUTCMonth(),
                        date: n.getUTCDate()
                    }), u.$build()
                }, u.$onMouseDown = function (e) {
                    if (e.preventDefault(), e.stopPropagation(), d) {
                        var t = angular.element(e.target);
                        "button" !== t[0].nodeName.toLowerCase() && (t = t.parent()), t.triggerHandler("click")
                    }
                }, u.$onKeyDown = function (e) {
                    if (/(38|37|39|40|13)/.test(e.keyCode) && !e.shiftKey && !e.altKey) {
                        if (e.preventDefault(), e.stopPropagation(), 13 === e.keyCode)return void(p.$mode ? p.$apply(function () {
                            u.setMode(p.$mode - 1)
                        }) : u.hide(!0));
                        $.onKeyDown(e), f.$digest()
                    }
                };
                var w = u.init;
                u.init = function () {
                    return c && m.useNative ? (t.prop("type", "date"), void t.css("-webkit-appearance", "textfield")) : (d && (t.prop("type", "text"), t.attr("readonly", "true"), t.on("click", i)), void w())
                };
                var y = u.destroy;
                u.destroy = function () {
                    c && m.useNative && t.off("click", i), y()
                };
                var v = u.show;
                u.show = function () {
                    !d && t.attr("readonly") || t.attr("disabled") || (v(), l(function () {
                        u.$isShown && (u.$element.on(d ? "touchstart" : "mousedown", u.$onMouseDown), m.keyboard && t.on("keydown", u.$onKeyDown))
                    }, 0, !1))
                };
                var D = u.hide;
                return u.hide = function (e) {
                    u.$isShown && (u.$element.off(d ? "touchstart" : "mousedown", u.$onMouseDown), m.keyboard && t.off("keydown", u.$onKeyDown), D(e))
                }, u
            }

            var c = /(ip(a|o)d|iphone|android)/gi.test(t.navigator.userAgent), d = "createTouch"in t.document && c;
            return e.lang || (e.lang = i.getDefaultLocale()), u.defaults = e, u
        }]
    }).directive("bsDatepicker", ["$window", "$parse", "$q", "$dateFormatter", "$dateParser", "$datepicker", function (e, t, n, a, o, i) {
        var r = (i.defaults, /(ip(a|o)d|iphone|android)/gi.test(e.navigator.userAgent));
        return {
            restrict: "EAC", require: "ngModel", link: function (e, t, n, s) {
                function l(e) {
                    return e && e.length ? e : null
                }

                function u(e) {
                    if (angular.isDate(e)) {
                        var t = isNaN(m.$options.minDate) || e.getTime() >= m.$options.minDate, n = isNaN(m.$options.maxDate) || e.getTime() <= m.$options.maxDate, a = t && n;
                        s.$setValidity("date", a), s.$setValidity("min", t), s.$setValidity("max", n), a && (s.$dateValue = e)
                    }
                }

                function c() {
                    return !s.$dateValue || isNaN(s.$dateValue.getTime()) ? "" : g(s.$dateValue, d.dateFormat)
                }

                var d = {scope: e};
                angular.forEach(["template", "templateUrl", "controller", "controllerAs", "placement", "container", "delay", "trigger", "html", "animation", "autoclose", "dateType", "dateFormat", "timezone", "modelDateFormat", "dayFormat", "strictFormat", "startWeek", "startDate", "useNative", "lang", "startView", "minView", "iconLeft", "iconRight", "daysOfWeekDisabled", "id", "prefixClass", "prefixEvent"], function (e) {
                    angular.isDefined(n[e]) && (d[e] = n[e])
                });
                var f = /^(false|0|)$/i;
                angular.forEach(["html", "container", "autoclose", "useNative"], function (e) {
                    angular.isDefined(n[e]) && f.test(n[e]) && (d[e] = !1)
                });
                var m = i(t, s, d);
                d = m.$options, r && d.useNative && (d.dateFormat = "yyyy-MM-dd");
                var p = d.lang, g = function (e, t) {
                    return a.formatDate(e, t, p)
                }, h = o({format: d.dateFormat, lang: p, strict: d.strictFormat});
                n.bsShow && e.$watch(n.bsShow, function (e, t) {
                    m && angular.isDefined(e) && (angular.isString(e) && (e = !!e.match(/true|,?(datepicker),?/i)), e === !0 ? m.show() : m.hide())
                }), angular.forEach(["minDate", "maxDate"], function (e) {
                    angular.isDefined(n[e]) && n.$observe(e, function (t) {
                        m.$options[e] = h.getDateForAttribute(e, t), !isNaN(m.$options[e]) && m.$build(!1), u(s.$dateValue)
                    })
                }), angular.isDefined(n.dateFormat) && n.$observe("dateFormat", function (e) {
                    m.$options.dateFormat = e
                }), e.$watch(n.ngModel, function (e, t) {
                    m.update(s.$dateValue)
                }, !0), angular.isDefined(n.disabledDates) && e.$watch(n.disabledDates, function (e, t) {
                    e = l(e), t = l(t), e && m.updateDisabledDates(e)
                }), s.$parsers.unshift(function (e) {
                    var t;
                    if (!e)return s.$setValidity("date", !0), null;
                    var n = h.parse(e, s.$dateValue);
                    return !n || isNaN(n.getTime()) ? void s.$setValidity("date", !1) : (u(n), "string" === d.dateType ? (t = h.timezoneOffsetAdjust(n, d.timezone, !0), g(t, d.modelDateFormat || d.dateFormat)) : (t = h.timezoneOffsetAdjust(s.$dateValue, d.timezone, !0), "number" === d.dateType ? t.getTime() : "unix" === d.dateType ? t.getTime() / 1e3 : "iso" === d.dateType ? t.toISOString() : new Date(t)))
                }), s.$formatters.push(function (e) {
                    var t;
                    return t = angular.isUndefined(e) || null === e ? NaN : angular.isDate(e) ? e : "string" === d.dateType ? h.parse(e, null, d.modelDateFormat) : "unix" === d.dateType ? new Date(1e3 * e) : new Date(e), s.$dateValue = h.timezoneOffsetAdjust(t, d.timezone), c()
                }), s.$render = function () {
                    t.val(c())
                }, e.$on("$destroy", function () {
                    m && m.destroy(), d = null, m = null
                })
            }
        }
    }]).provider("datepickerViews", function () {
        function e(e, t) {
            for (var n = []; e.length > 0;)n.push(e.splice(0, t));
            return n
        }

        function t(e, t) {
            return (e % t + t) % t
        }

        this.defaults = {
            dayFormat: "dd",
            daySplit: 7
        }, this.$get = ["$dateFormatter", "$dateParser", "$sce", function (n, a, o) {
            return function (i) {
                var r = i.$scope, s = i.$options, l = s.lang, u = function (e, t) {
                    return n.formatDate(e, t, l)
                }, c = a({
                    format: s.dateFormat,
                    lang: l,
                    strict: s.strictFormat
                }), d = n.weekdaysShort(l), f = d.slice(s.startWeek).concat(d.slice(0, s.startWeek)), m = o.trustAsHtml('<th class="dow text-center">' + f.join('</th><th class="dow text-center">') + "</th>"), p = i.$date || (s.startDate ? c.getDateForAttribute("startDate", s.startDate) : new Date), g = {
                    year: p.getFullYear(),
                    month: p.getMonth(),
                    date: p.getDate()
                }, h = [{
                    format: s.dayFormat, split: 7, steps: {month: 1}, update: function (e, t) {
                        !this.built || t || e.getFullYear() !== g.year || e.getMonth() !== g.month ? (angular.extend(g, {
                            year: i.$date.getFullYear(),
                            month: i.$date.getMonth(),
                            date: i.$date.getDate()
                        }), i.$build()) : e.getDate() === g.date && 1 !== e.getDate() || (g.date = i.$date.getDate(), i.$updateSelected())
                    }, build: function () {
                        var n = new Date(g.year, g.month, 1), a = n.getTimezoneOffset(), o = new Date(+n - 864e5 * t(n.getDay() - s.startWeek, 7)), l = o.getTimezoneOffset(), d = c.timezoneOffsetAdjust(new Date, s.timezone).toDateString();
                        r.td = new Date, l !== a && (o = new Date(+o + 6e4 * (l - a)));
                        for (var f, p = [], h = 0; 42 > h; h++)f = c.daylightSavingAdjust(new Date(o.getFullYear(), o.getMonth(), o.getDate() + h)), p.push({
                            date: f,
                            isToday: f.toDateString() === d,
                            label: u(f, this.format),
                            selected: i.$date && this.isSelected(f),
                            muted: f.getMonth() !== g.month,
                            disabled: this.isDisabled(f)
                        });
                        r.title = u(n, s.monthTitleFormat), r.showLabels = !0, r.labels = m, r.rows = e(p, this.split), this.built = !0
                    }, isSelected: function (e) {
                        return i.$date && e.getFullYear() === i.$date.getFullYear() && e.getMonth() === i.$date.getMonth() && e.getDate() === i.$date.getDate()
                    }, isDisabled: function (e) {
                        var t = e.getTime();
                        if (t < s.minDate || t > s.maxDate)return !0;
                        if (-1 !== s.daysOfWeekDisabled.indexOf(e.getDay()))return !0;
                        if (s.disabledDateRanges)for (var n = 0; n < s.disabledDateRanges.length; n++)if (t >= s.disabledDateRanges[n].start && t <= s.disabledDateRanges[n].end)return !0;
                        return !1
                    }, onKeyDown: function (e) {
                        if (i.$date) {
                            var t, n = i.$date.getTime();
                            37 === e.keyCode ? t = new Date(n - 864e5) : 38 === e.keyCode ? t = new Date(n - 6048e5) : 39 === e.keyCode ? t = new Date(n + 864e5) : 40 === e.keyCode && (t = new Date(n + 6048e5)), this.isDisabled(t) || i.select(t, !0)
                        }
                    }
                }, {
                    name: "month", format: s.monthFormat, split: 4, steps: {year: 1}, update: function (e, t) {
                        this.built && e.getFullYear() === g.year ? e.getMonth() !== g.month && (angular.extend(g, {
                            month: i.$date.getMonth(),
                            date: i.$date.getDate()
                        }), i.$updateSelected()) : (angular.extend(g, {
                            year: i.$date.getFullYear(),
                            month: i.$date.getMonth(),
                            date: i.$date.getDate()
                        }), i.$build())
                    }, build: function () {
                        for (var t, n = (new Date(g.year, 0, 1), []), a = 0; 12 > a; a++)t = new Date(g.year, a, 1), n.push({
                            date: t,
                            label: u(t, this.format),
                            selected: i.$isSelected(t),
                            disabled: this.isDisabled(t)
                        });
                        r.title = u(t, s.yearTitleFormat), r.showLabels = !1, r.rows = e(n, this.split), this.built = !0
                    }, isSelected: function (e) {
                        return i.$date && e.getFullYear() === i.$date.getFullYear() && e.getMonth() === i.$date.getMonth()
                    }, isDisabled: function (e) {
                        var t = +new Date(e.getFullYear(), e.getMonth() + 1, 0);
                        return t < s.minDate || e.getTime() > s.maxDate
                    }, onKeyDown: function (e) {
                        if (i.$date) {
                            var t = i.$date.getMonth(), n = new Date(i.$date);
                            37 === e.keyCode ? n.setMonth(t - 1) : 38 === e.keyCode ? n.setMonth(t - 4) : 39 === e.keyCode ? n.setMonth(t + 1) : 40 === e.keyCode && n.setMonth(t + 4), this.isDisabled(n) || i.select(n, !0)
                        }
                    }
                }, {
                    name: "year", format: s.yearFormat, split: 4, steps: {year: 12}, update: function (e, t) {
                        !this.built || t || parseInt(e.getFullYear() / 20, 10) !== parseInt(g.year / 20, 10) ? (angular.extend(g, {
                            year: i.$date.getFullYear(),
                            month: i.$date.getMonth(),
                            date: i.$date.getDate()
                        }), i.$build()) : e.getFullYear() !== g.year && (angular.extend(g, {
                            year: i.$date.getFullYear(),
                            month: i.$date.getMonth(),
                            date: i.$date.getDate()
                        }), i.$updateSelected())
                    }, build: function () {
                        for (var t, n = g.year - g.year % (3 * this.split), a = [], o = 0; 12 > o; o++)t = new Date(n + o, 0, 1), a.push({
                            date: t,
                            label: u(t, this.format),
                            selected: i.$isSelected(t),
                            disabled: this.isDisabled(t)
                        });
                        r.title = a[0].label + "-" + a[a.length - 1].label, r.showLabels = !1, r.rows = e(a, this.split), this.built = !0
                    }, isSelected: function (e) {
                        return i.$date && e.getFullYear() === i.$date.getFullYear()
                    }, isDisabled: function (e) {
                        var t = +new Date(e.getFullYear() + 1, 0, 0);
                        return t < s.minDate || e.getTime() > s.maxDate
                    }, onKeyDown: function (e) {
                        if (i.$date) {
                            var t = i.$date.getFullYear(), n = new Date(i.$date);
                            37 === e.keyCode ? n.setYear(t - 1) : 38 === e.keyCode ? n.setYear(t - 4) : 39 === e.keyCode ? n.setYear(t + 1) : 40 === e.keyCode && n.setYear(t + 4), this.isDisabled(n) || i.select(n, !0)
                        }
                    }
                }];
                return {views: s.minView ? Array.prototype.slice.call(h, s.minView) : h, viewDate: g}
            }
        }]
    }), angular.module("mgcrea.ngStrap", ["mgcrea.ngStrap.datepicker", "mgcrea.ngStrap.timepicker"])
}(window, document);
