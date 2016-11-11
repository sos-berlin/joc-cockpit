if ("undefined" == typeof jQuery)throw new Error("Bootstrap's JavaScript requires jQuery");
+function (a) {
    var b = a.fn.jquery.split(" ")[0].split(".");
    if (b[0] < 2 && b[1] < 9 || 1 == b[0] && 9 == b[1] && b[2] < 1 || b[0] >= 3)throw new Error("Bootstrap's JavaScript requires at least jQuery v1.9.1 but less than v3.0.0")
}(jQuery), +function (a) {
    "use strict";
    function d(a, b) {
        if ("function" != typeof b && null !== b)throw new TypeError("Super expression must either be null or a function, not " + typeof b);
        a.prototype = Object.create(b && b.prototype, {
            constructor: {
                value: a,
                enumerable: !1,
                writable: !0,
                configurable: !0
            }
        }), b && (Object.setPrototypeOf ? Object.setPrototypeOf(a, b) : a.__proto__ = b)
    }

    function e(a, b) {
        if (!(a instanceof b))throw new TypeError("Cannot call a class as a function")
    }

    var b = function (b, c, d) {
        for (var e = !0; e;) {
            var f = b, g = c, h = d;
            e = !1, null === f && (f = Function.prototype);
            var i = Object.getOwnPropertyDescriptor(f, g);
            if (void 0 !== i) {
                if ("value"in i)return i.value;
                var k = i.get;
                if (void 0 === k)return;
                return k.call(h)
            }
            var j = Object.getPrototypeOf(f);
            if (null === j)return;
            b = j, c = g, d = h, e = !0, i = j = void 0
        }
    }, c = function () {
        function a(a, b) {
            for (var c = 0; c < b.length; c++) {
                var d = b[c];
                d.enumerable = d.enumerable || !1, d.configurable = !0, "value"in d && (d.writable = !0), Object.defineProperty(a, d.key, d)
            }
        }

        return function (b, c, d) {
            return c && a(b.prototype, c), d && a(b, d), b
        }
    }(), f = function (a) {
        function d(a) {
            return {}.toString.call(a).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
        }

        function e(a) {
            return (a[0] || a).nodeType
        }

        function f() {
            return {
                bindType: b.end, delegateType: b.end, handle: function (c) {
                    if (a(c.target).is(this))return c.handleObj.handler.apply(this, arguments)
                }
            }
        }

        function g() {
            if (window.QUnit)return !1;
            var a = document.createElement("bootstrap");
            for (var b in c)if (void 0 !== a.style[b])return {end: c[b]};
            return !1
        }

        function h(b) {
            var c = this, d = !1;
            return a(this).one(j.TRANSITION_END, function () {
                d = !0
            }), setTimeout(function () {
                d || j.triggerTransitionEnd(c)
            }, b), this
        }

        function i() {
            b = g(), a.fn.emulateTransitionEnd = h, j.supportsTransitionEnd() && (a.event.special[j.TRANSITION_END] = f())
        }

        var b = !1, c = {
            WebkitTransition: "webkitTransitionEnd",
            MozTransition: "transitionend",
            OTransition: "oTransitionEnd otransitionend",
            transition: "transitionend"
        }, j = {
            TRANSITION_END: "bsTransitionEnd", getUID: function (b) {
                do b += ~~(1e6 * Math.random()); while (document.getElementById(b));
                return b
            }, getSelectorFromElement: function (b) {
                var c = b.getAttribute("data-target");
                return c || (c = b.getAttribute("href") || "", c = /^#[a-z]/i.test(c) ? c : null), c
            }, reflow: function (b) {
                new Function("bs", "return bs")(b.offsetHeight)
            }, triggerTransitionEnd: function (d) {
                a(d).trigger(b.end)
            }, supportsTransitionEnd: function () {
                return Boolean(b)
            }, typeCheckConfig: function (b, c, f) {
                for (var g in f)if (f.hasOwnProperty(g)) {
                    var h = f[g], i = c[g], j = void 0;
                    if (j = i && e(i) ? "element" : d(i), !new RegExp(h).test(j))throw new Error(b.toUpperCase() + ": " + ('Option "' + g + '" provided type "' + j + '" ') + ('but expected type "' + h + '".'))
                }
            }
        };
        return i(), j
    }(jQuery), o = (function (a) {
        var b = "alert", d = "4.0.0-alpha", g = "bs.alert", h = "." + g, i = ".data-api", j = a.fn[b], k = 150, l = {DISMISS: '[data-dismiss="alert"]'}, m = {
            CLOSE: "close" + h,
            CLOSED: "closed" + h,
            CLICK_DATA_API: "click" + h + i
        }, n = {ALERT: "alert", FADE: "fade", IN: "in"}, o = function () {
            function b(a) {
                e(this, b), this._element = a
            }

            return c(b, [{
                key: "close", value: function (b) {
                    b = b || this._element;
                    var c = this._getRootElement(b), d = this._triggerCloseEvent(c);
                    d.isDefaultPrevented() || this._removeElement(c)
                }
            }, {
                key: "dispose", value: function () {
                    a.removeData(this._element, g), this._element = null
                }
            }, {
                key: "_getRootElement", value: function (c) {
                    var d = f.getSelectorFromElement(c), e = !1;
                    return d && (e = a(d)[0]), e || (e = a(c).closest("." + n.ALERT)[0]), e
                }
            }, {
                key: "_triggerCloseEvent", value: function (c) {
                    var d = a.Event(m.CLOSE);
                    return a(c).trigger(d), d
                }
            }, {
                key: "_removeElement", value: function (c) {
                    return a(c).removeClass(n.IN), f.supportsTransitionEnd() && a(c).hasClass(n.FADE) ? void a(c).one(f.TRANSITION_END, a.proxy(this._destroyElement, this, c)).emulateTransitionEnd(k) : void this._destroyElement(c)
                }
            }, {
                key: "_destroyElement", value: function (c) {
                    a(c).detach().trigger(m.CLOSED).remove()
                }
            }], [{
                key: "_jQueryInterface", value: function (d) {
                    return this.each(function () {
                        var c = a(this), e = c.data(g);
                        e || (e = new b(this), c.data(g, e)), "close" === d && e[d](this)
                    })
                }
            }, {
                key: "_handleDismiss", value: function (b) {
                    return function (a) {
                        a && a.preventDefault(), b.close(this)
                    }
                }
            }, {
                key: "VERSION", get: function () {
                    return d
                }
            }]), b
        }();
        return a(document).on(m.CLICK_DATA_API, l.DISMISS, o._handleDismiss(new o)), a.fn[b] = o._jQueryInterface, a.fn[b].Constructor = o, a.fn[b].noConflict = function () {
            return a.fn[b] = j, o._jQueryInterface
        }, o
    }(jQuery), function (a) {
        var b = "button", d = "4.0.0-alpha", f = "bs.button", g = "." + f, h = ".data-api", i = a.fn[b], j = {
            ACTIVE: "active",
            BUTTON: "btn",
            FOCUS: "focus"
        }, k = {
            DATA_TOGGLE_CARROT: '[data-toggle^="button"]',
            DATA_TOGGLE: '[data-toggle="buttons"]',
            INPUT: "input",
            ACTIVE: ".active",
            BUTTON: ".btn"
        }, l = {
            CLICK_DATA_API: "click" + g + h,
            FOCUS_BLUR_DATA_API: "focus" + g + h + " " + ("blur" + g + h)
        }, m = function () {
            function b(a) {
                e(this, b), this._element = a
            }

            return c(b, [{
                key: "toggle", value: function () {
                    var c = !0, d = a(this._element).closest(k.DATA_TOGGLE)[0];
                    if (d) {
                        var e = a(this._element).find(k.INPUT)[0];
                        if (e) {
                            if ("radio" === e.type)if (e.checked && a(this._element).hasClass(j.ACTIVE))c = !1; else {
                                var f = a(d).find(k.ACTIVE)[0];
                                f && a(f).removeClass(j.ACTIVE)
                            }
                            c && (e.checked = !a(this._element).hasClass(j.ACTIVE), a(this._element).trigger("change"))
                        }
                    } else this._element.setAttribute("aria-pressed", !a(this._element).hasClass(j.ACTIVE));
                    c && a(this._element).toggleClass(j.ACTIVE)
                }
            }, {
                key: "dispose", value: function () {
                    a.removeData(this._element, f), this._element = null
                }
            }], [{
                key: "_jQueryInterface", value: function (d) {
                    return this.each(function () {
                        var c = a(this).data(f);
                        c || (c = new b(this), a(this).data(f, c)), "toggle" === d && c[d]()
                    })
                }
            }, {
                key: "VERSION", get: function () {
                    return d
                }
            }]), b
        }();
        return a(document).on(l.CLICK_DATA_API, k.DATA_TOGGLE_CARROT, function (b) {
            b.preventDefault();
            var c = b.target;
            a(c).hasClass(j.BUTTON) || (c = a(c).closest(k.BUTTON)), m._jQueryInterface.call(a(c), "toggle")
        }).on(l.FOCUS_BLUR_DATA_API, k.DATA_TOGGLE_CARROT, function (b) {
            var c = a(b.target).closest(k.BUTTON)[0];
            a(c).toggleClass(j.FOCUS, /^focus(in)?$/.test(b.type))
        }), a.fn[b] = m._jQueryInterface, a.fn[b].Constructor = m, a.fn[b].noConflict = function () {
            return a.fn[b] = i, m._jQueryInterface
        }, m
    }(jQuery), function (a) {
        var b = "carousel", d = "4.0.0-alpha", g = "bs.carousel", h = "." + g, i = ".data-api", j = a.fn[b], k = 600, l = {
            interval: 5e3,
            keyboard: !0,
            slide: !1,
            pause: "hover",
            wrap: !0
        }, m = {
            interval: "(number|boolean)",
            keyboard: "boolean",
            slide: "(boolean|string)",
            pause: "(string|boolean)",
            wrap: "boolean"
        }, n = {NEXT: "next", PREVIOUS: "prev"}, o = {
            SLIDE: "slide" + h,
            SLID: "slid" + h,
            KEYDOWN: "keydown" + h,
            MOUSEENTER: "mouseenter" + h,
            MOUSELEAVE: "mouseleave" + h,
            LOAD_DATA_API: "load" + h + i,
            CLICK_DATA_API: "click" + h + i
        }, p = {
            CAROUSEL: "carousel",
            ACTIVE: "active",
            SLIDE: "slide",
            RIGHT: "right",
            LEFT: "left",
            ITEM: "carousel-item"
        }, q = {
            ACTIVE: ".active",
            ACTIVE_ITEM: ".active.carousel-item",
            ITEM: ".carousel-item",
            NEXT_PREV: ".next, .prev",
            INDICATORS: ".carousel-indicators",
            DATA_SLIDE: "[data-slide], [data-slide-to]",
            DATA_RIDE: '[data-ride="carousel"]'
        }, r = function () {
            function i(b, c) {
                e(this, i), this._items = null, this._interval = null, this._activeElement = null, this._isPaused = !1, this._isSliding = !1, this._config = this._getConfig(c), this._element = a(b)[0], this._indicatorsElement = a(this._element).find(q.INDICATORS)[0], this._addEventListeners()
            }

            return c(i, [{
                key: "next", value: function () {
                    this._isSliding || this._slide(n.NEXT)
                }
            }, {
                key: "nextWhenVisible", value: function () {
                    document.hidden || this.next()
                }
            }, {
                key: "prev", value: function () {
                    this._isSliding || this._slide(n.PREVIOUS)
                }
            }, {
                key: "pause", value: function (c) {
                    c || (this._isPaused = !0), a(this._element).find(q.NEXT_PREV)[0] && f.supportsTransitionEnd() && (f.triggerTransitionEnd(this._element), this.cycle(!0)), clearInterval(this._interval), this._interval = null
                }
            }, {
                key: "cycle", value: function (c) {
                    c || (this._isPaused = !1), this._interval && (clearInterval(this._interval), this._interval = null), this._config.interval && !this._isPaused && (this._interval = setInterval(a.proxy(document.visibilityState ? this.nextWhenVisible : this.next, this), this._config.interval))
                }
            }, {
                key: "to", value: function (c) {
                    var d = this;
                    this._activeElement = a(this._element).find(q.ACTIVE_ITEM)[0];
                    var e = this._getItemIndex(this._activeElement);
                    if (!(c > this._items.length - 1 || c < 0)) {
                        if (this._isSliding)return void a(this._element).one(o.SLID, function () {
                            return d.to(c)
                        });
                        if (e === c)return this.pause(), void this.cycle();
                        var f = c > e ? n.NEXT : n.PREVIOUS;
                        this._slide(f, this._items[c])
                    }
                }
            }, {
                key: "dispose", value: function () {
                    a(this._element).off(h), a.removeData(this._element, g), this._items = null, this._config = null, this._element = null, this._interval = null, this._isPaused = null, this._isSliding = null, this._activeElement = null, this._indicatorsElement = null
                }
            }, {
                key: "_getConfig", value: function (d) {
                    return d = a.extend({}, l, d), f.typeCheckConfig(b, d, m), d
                }
            }, {
                key: "_addEventListeners", value: function () {
                    this._config.keyboard && a(this._element).on(o.KEYDOWN, a.proxy(this._keydown, this)), "hover" !== this._config.pause || "ontouchstart"in document.documentElement || a(this._element).on(o.MOUSEENTER, a.proxy(this.pause, this)).on(o.MOUSELEAVE, a.proxy(this.cycle, this))
                }
            }, {
                key: "_keydown", value: function (b) {
                    if (b.preventDefault(), !/input|textarea/i.test(b.target.tagName))switch (b.which) {
                        case 37:
                            this.prev();
                            break;
                        case 39:
                            this.next();
                            break;
                        default:
                            return
                    }
                }
            }, {
                key: "_getItemIndex", value: function (c) {
                    return this._items = a.makeArray(a(c).parent().find(q.ITEM)), this._items.indexOf(c)
                }
            }, {
                key: "_getItemByDirection", value: function (b, c) {
                    var d = b === n.NEXT, e = b === n.PREVIOUS, f = this._getItemIndex(c), g = this._items.length - 1, h = e && 0 === f || d && f === g;
                    if (h && !this._config.wrap)return c;
                    var i = b === n.PREVIOUS ? -1 : 1, j = (f + i) % this._items.length;
                    return j === -1 ? this._items[this._items.length - 1] : this._items[j]
                }
            }, {
                key: "_triggerSlideEvent", value: function (c, d) {
                    var e = a.Event(o.SLIDE, {relatedTarget: c, direction: d});
                    return a(this._element).trigger(e), e
                }
            }, {
                key: "_setActiveIndicatorElement", value: function (c) {
                    if (this._indicatorsElement) {
                        a(this._indicatorsElement).find(q.ACTIVE).removeClass(p.ACTIVE);
                        var d = this._indicatorsElement.children[this._getItemIndex(c)];
                        d && a(d).addClass(p.ACTIVE)
                    }
                }
            }, {
                key: "_slide", value: function (c, d) {
                    var e = this, g = a(this._element).find(q.ACTIVE_ITEM)[0], h = d || g && this._getItemByDirection(c, g), i = Boolean(this._interval), j = c === n.NEXT ? p.LEFT : p.RIGHT;
                    if (h && a(h).hasClass(p.ACTIVE))return void(this._isSliding = !1);
                    var l = this._triggerSlideEvent(h, j);
                    if (!l.isDefaultPrevented() && g && h) {
                        this._isSliding = !0, i && this.pause(), this._setActiveIndicatorElement(h);
                        var m = a.Event(o.SLID, {relatedTarget: h, direction: j});
                        f.supportsTransitionEnd() && a(this._element).hasClass(p.SLIDE) ? (a(h).addClass(c), f.reflow(h), a(g).addClass(j), a(h).addClass(j), a(g).one(f.TRANSITION_END, function () {
                            a(h).removeClass(j).removeClass(c), a(h).addClass(p.ACTIVE), a(g).removeClass(p.ACTIVE).removeClass(c).removeClass(j), e._isSliding = !1, setTimeout(function () {
                                return a(e._element).trigger(m)
                            }, 0)
                        }).emulateTransitionEnd(k)) : (a(g).removeClass(p.ACTIVE), a(h).addClass(p.ACTIVE), this._isSliding = !1, a(this._element).trigger(m)), i && this.cycle()
                    }
                }
            }], [{
                key: "_jQueryInterface", value: function (c) {
                    return this.each(function () {
                        var b = a(this).data(g), d = a.extend({}, l, a(this).data());
                        "object" == typeof c && a.extend(d, c);
                        var e = "string" == typeof c ? c : d.slide;
                        if (b || (b = new i(this, d), a(this).data(g, b)), "number" == typeof c)b.to(c); else if ("string" == typeof e) {
                            if (void 0 === b[e])throw new Error('No method named "' + e + '"');
                            b[e]()
                        } else d.interval && (b.pause(), b.cycle())
                    })
                }
            }, {
                key: "_dataApiClickHandler", value: function (c) {
                    var d = f.getSelectorFromElement(this);
                    if (d) {
                        var e = a(d)[0];
                        if (e && a(e).hasClass(p.CAROUSEL)) {
                            var h = a.extend({}, a(e).data(), a(this).data()), j = this.getAttribute("data-slide-to");
                            j && (h.interval = !1), i._jQueryInterface.call(a(e), h), j && a(e).data(g).to(j), c.preventDefault()
                        }
                    }
                }
            }, {
                key: "VERSION", get: function () {
                    return d
                }
            }, {
                key: "Default", get: function () {
                    return l
                }
            }]), i
        }();
        return a(document).on(o.CLICK_DATA_API, q.DATA_SLIDE, r._dataApiClickHandler), a(window).on(o.LOAD_DATA_API, function () {
            a(q.DATA_RIDE).each(function () {
                var b = a(this);
                r._jQueryInterface.call(b, b.data())
            })
        }), a.fn[b] = r._jQueryInterface, a.fn[b].Constructor = r, a.fn[b].noConflict = function () {
            return a.fn[b] = j, r._jQueryInterface
        }, r
    }(jQuery), function (a) {
        var b = "collapse", d = "4.0.0-alpha", g = "bs.collapse", h = "." + g, i = ".data-api", j = a.fn[b], k = 600, l = {
            toggle: !0,
            parent: ""
        }, m = {toggle: "boolean", parent: "string"}, n = {
            SHOW: "show" + h,
            SHOWN: "shown" + h,
            HIDE: "hide" + h,
            HIDDEN: "hidden" + h,
            CLICK_DATA_API: "click" + h + i
        }, o = {IN: "in", COLLAPSE: "collapse", COLLAPSING: "collapsing", COLLAPSED: "collapsed"}, p = {
            WIDTH: "width",
            HEIGHT: "height"
        }, q = {
            ACTIVES: ".panel > .in, .panel > .collapsing",
            DATA_TOGGLE: '[data-toggle="collapse"]'
        }, r = function () {
            function h(b, c) {
                e(this, h), this._isTransitioning = !1, this._element = b, this._config = this._getConfig(c), this._triggerArray = a.makeArray(a('[data-toggle="collapse"][href="#' + b.id + '"],' + ('[data-toggle="collapse"][data-target="#' + b.id + '"]'))), this._parent = this._config.parent ? this._getParent() : null, this._config.parent || this._addAriaAndCollapsedClass(this._element, this._triggerArray), this._config.toggle && this.toggle()
            }

            return c(h, [{
                key: "toggle", value: function () {
                    a(this._element).hasClass(o.IN) ? (this.hide(), a(this._element).parents("div.parent").find("i.collap").removeClass("fa-folder-open"), a(this._element).parents("div.parent").find("i.collap").addClass("fa-folder")) : (this.show(), a(this._element).parents("div.parent").find("i.collap").removeClass("fa-folder"), a(this._element).parents("div.parent").find("i.collap").addClass("fa-folder-open"))
                }
            }, {
                key: "show", value: function () {
                    var c = this;
                    if (!this._isTransitioning && !a(this._element).hasClass(o.IN)) {
                        var top = $('.sticky').css('top');
                        if(top) {
                            top = top.substring(0, top.indexOf('p'));
                            top = parseInt(top) + 111;
                            $('.sticky').css('top', top);
                        }
                        var d = void 0, e = void 0;
                        if (this._parent && (d = a.makeArray(a(q.ACTIVES)), d.length || (d = null)), !(d && (e = a(d).data(g), e && e._isTransitioning))) {
                            var i = a.Event(n.SHOW);
                            if (a(this._element).trigger(i), !i.isDefaultPrevented()) {
                                d && (h._jQueryInterface.call(a(d), "hide"), e || a(d).data(g, null));
                                var j = this._getDimension();
                                a(this._element).removeClass(o.COLLAPSE).addClass(o.COLLAPSING), this._element.style[j] = 0, this._element.setAttribute("aria-expanded", !0), this._triggerArray.length && a(this._triggerArray).removeClass(o.COLLAPSED).attr("aria-expanded", !0), this.setTransitioning(!0);
                                var l = function () {
                                    a(c._element).removeClass(o.COLLAPSING).addClass(o.COLLAPSE).addClass(o.IN), c._element.style[j] = "", c.setTransitioning(!1), a(c._element).trigger(n.SHOWN)
                                };
                                if (!f.supportsTransitionEnd())return void l();
                                var m = j[0].toUpperCase() + j.slice(1), p = "scroll" + m;
                                a(this._element).one(f.TRANSITION_END, l).emulateTransitionEnd(k), this._element.style[j] = this._element[p] + "px"
                            }
                        }
                    }
                }
            }, {
                key: "hide", value: function () {

                        var top = $('.sticky').css('top');
                    if(top) {
                        top = top.substring(0, top.indexOf('p'));
                        top = parseInt(top) - 111;
                        $('.sticky').css('top', top);
                    }

                    var c = this;
                    if (!this._isTransitioning && a(this._element).hasClass(o.IN)) {
                        var d = a.Event(n.HIDE);
                        if (a(this._element).trigger(d), !d.isDefaultPrevented()) {
                            var e = this._getDimension(), g = e === p.WIDTH ? "offsetWidth" : "offsetHeight";
                            this._element.style[e] = this._element[g] + "px", f.reflow(this._element), a(this._element).addClass(o.COLLAPSING).removeClass(o.COLLAPSE).removeClass(o.IN), this._element.setAttribute("aria-expanded", !1), this._triggerArray.length && a(this._triggerArray).addClass(o.COLLAPSED).attr("aria-expanded", !1), this.setTransitioning(!0);
                            var h = function () {
                                c.setTransitioning(!1), a(c._element).removeClass(o.COLLAPSING).addClass(o.COLLAPSE).trigger(n.HIDDEN)
                            };
                            return this._element.style[e] = 0, f.supportsTransitionEnd() ? void a(this._element).one(f.TRANSITION_END, h).emulateTransitionEnd(k) : void h()
                        }
                    }
                }
            }, {
                key: "setTransitioning", value: function (b) {
                    this._isTransitioning = b
                }
            }, {
                key: "dispose", value: function () {
                    a.removeData(this._element, g), this._config = null, this._parent = null, this._element = null, this._triggerArray = null, this._isTransitioning = null
                }
            }, {
                key: "_getConfig", value: function (d) {
                    return d = a.extend({}, l, d), d.toggle = Boolean(d.toggle), f.typeCheckConfig(b, d, m), d
                }
            }, {
                key: "_getDimension", value: function () {
                    var c = a(this._element).hasClass(p.WIDTH);
                    return c ? p.WIDTH : p.HEIGHT
                }
            }, {
                key: "_getParent", value: function () {
                    var c = this, d = a(this._config.parent)[0], e = '[data-toggle="collapse"][data-parent="' + this._config.parent + '"]';
                    return a(d).find(e).each(function (a, b) {
                        c._addAriaAndCollapsedClass(h._getTargetFromElement(b), [b])
                    }), d
                }
            }, {
                key: "_addAriaAndCollapsedClass", value: function (c, d) {
                    if (c) {
                        var e = a(c).hasClass(o.IN);
                        c.setAttribute("aria-expanded", e), d.length && a(d).toggleClass(o.COLLAPSED, !e).attr("aria-expanded", e)
                    }
                }
            }], [{
                key: "_getTargetFromElement", value: function (c) {
                    var d = f.getSelectorFromElement(c);
                    return d ? a(d)[0] : null
                }
            }, {
                key: "_jQueryInterface", value: function (c) {
                    return this.each(function () {
                        var b = a(this), d = b.data(g), e = a.extend({}, l, b.data(), "object" == typeof c && c);
                        if (!d && e.toggle && /show|hide/.test(c) && (e.toggle = !1), d || (d = new h(this, e), b.data(g, d)), "string" == typeof c) {
                            if (void 0 === d[c])throw new Error('No method named "' + c + '"');
                            d[c]()
                        }
                    })
                }
            }, {
                key: "VERSION", get: function () {
                    return d
                }
            }, {
                key: "Default", get: function () {
                    return l
                }
            }]), h
        }();
        return a(document).on(n.CLICK_DATA_API, q.DATA_TOGGLE, function (b) {
            b.preventDefault();
            var c = r._getTargetFromElement(this), d = a(c).data(g), e = d ? "toggle" : a(this).data();
            r._jQueryInterface.call(a(c), e)
        }), a.fn[b] = r._jQueryInterface, a.fn[b].Constructor = r, a.fn[b].noConflict = function () {
            return a.fn[b] = j, r._jQueryInterface
        }, r
    }(jQuery), function (a) {
        var b = "dropdown", d = "4.0.0-alpha", g = "bs.dropdown", h = "." + g, i = ".data-api", j = a.fn[b], k = {
            HIDE: "hide" + h,
            HIDDEN: "hidden" + h,
            SHOW: "show" + h,
            SHOWN: "shown" + h,
            CLICK: "click" + h,
            CLICK_DATA_API: "click" + h + i,
            KEYDOWN_DATA_API: "keydown" + h + i
        }, l = {BACKDROP: "dropdown-backdrop", DISABLED: "disabled", OPEN: "open"}, m = {
            BACKDROP: ".dropdown-backdrop",
            DATA_TOGGLE: '[data-toggle="dropdown"]',
            FORM_CHILD: ".dropdown form",
            ROLE_MENU: '[role="menu"]',
            ROLE_LISTBOX: '[role="listbox"]',
            NAVBAR_NAV: ".navbar-nav",
            VISIBLE_ITEMS: '[role="menu"] li:not(.disabled) a, [role="listbox"] li:not(.disabled) a'
        }, n = function () {
            function b(a) {
                e(this, b), this._element = a, this._addEventListeners()
            }

            return c(b, [{
                key: "toggle", value: function () {
                    if (this.disabled || a(this).hasClass(l.DISABLED))return !1;
                    var d = b._getParentFromElement(this), e = a(d).hasClass(l.OPEN);
                    if (b._clearMenus(), e)return !1;
                    if ("ontouchstart"in document.documentElement && !a(d).closest(m.NAVBAR_NAV).length) {
                        var f = document.createElement("div");
                        f.className = l.BACKDROP, a(f).insertBefore(this), a(f).on("click", b._clearMenus)
                    }
                    var g = {relatedTarget: this}, h = a.Event(k.SHOW, g);
                    return a(d).trigger(h), !h.isDefaultPrevented() && (this.focus(), this.setAttribute("aria-expanded", "true"), a(d).toggleClass(l.OPEN), a(d).trigger(a.Event(k.SHOWN, g)), !1)
                }
            }, {
                key: "dispose", value: function () {
                    a.removeData(this._element, g), a(this._element).off(h), this._element = null
                }
            }, {
                key: "_addEventListeners", value: function () {
                    a(this._element).on(k.CLICK, this.toggle)
                }
            }], [{
                key: "_jQueryInterface", value: function (d) {
                    return this.each(function () {
                        var c = a(this).data(g);
                        if (c || a(this).data(g, c = new b(this)), "string" == typeof d) {
                            if (void 0 === c[d])throw new Error('No method named "' + d + '"');
                            c[d].call(this)
                        }
                    })
                }
            }, {
                key: "_clearMenus", value: function (d) {
                    if (!d || 3 !== d.which) {
                        var e = a(m.BACKDROP)[0];
                        e && e.parentNode.removeChild(e);
                        for (var f = a.makeArray(a(m.DATA_TOGGLE)), g = 0; g < f.length; g++) {
                            var h = b._getParentFromElement(f[g]), i = {relatedTarget: f[g]};
                            if (a(h).hasClass(l.OPEN) && !(d && "click" === d.type && /input|textarea/i.test(d.target.tagName) && a.contains(h, d.target))) {
                                var j = a.Event(k.HIDE, i);
                                a(h).trigger(j), j.isDefaultPrevented() || (f[g].setAttribute("aria-expanded", "false"), a(h).removeClass(l.OPEN).trigger(a.Event(k.HIDDEN, i)))
                            }
                        }
                    }
                }
            }, {
                key: "_getParentFromElement", value: function (c) {
                    var d = void 0, e = f.getSelectorFromElement(c);
                    return e && (d = a(e)[0]), d || c.parentNode
                }
            }, {
                key: "_dataApiKeydownHandler", value: function (d) {
                    if (/(38|40|27|32)/.test(d.which) && !/input|textarea/i.test(d.target.tagName) && (d.preventDefault(), d.stopPropagation(), !this.disabled && !a(this).hasClass(l.DISABLED))) {
                        var e = b._getParentFromElement(this), f = a(e).hasClass(l.OPEN);
                        if (!f && 27 !== d.which || f && 27 === d.which) {
                            if (27 === d.which) {
                                var g = a(e).find(m.DATA_TOGGLE)[0];
                                a(g).trigger("focus")
                            }
                            return void a(this).trigger("click")
                        }
                        var h = a.makeArray(a(m.VISIBLE_ITEMS));
                        if (h = h.filter(function (a) {
                                return a.offsetWidth || a.offsetHeight
                            }), h.length) {
                            var i = h.indexOf(d.target);
                            38 === d.which && i > 0 && i--, 40 === d.which && i < h.length - 1 && i++, ~i || (i = 0), h[i].focus()
                        }
                    }
                }
            }, {
                key: "VERSION", get: function () {
                    return d
                }
            }]), b
        }();
        return a(document).on(k.KEYDOWN_DATA_API, m.DATA_TOGGLE, n._dataApiKeydownHandler).on(k.KEYDOWN_DATA_API, m.ROLE_MENU, n._dataApiKeydownHandler).on(k.KEYDOWN_DATA_API, m.ROLE_LISTBOX, n._dataApiKeydownHandler).on(k.CLICK_DATA_API, n._clearMenus).on(k.CLICK_DATA_API, m.DATA_TOGGLE, n.prototype.toggle).on(k.CLICK_DATA_API, m.FORM_CHILD, function (a) {
            a.stopPropagation()
        }), a.fn[b] = n._jQueryInterface, a.fn[b].Constructor = n, a.fn[b].noConflict = function () {
            return a.fn[b] = j, n._jQueryInterface
        }, n
    }(jQuery), function (a) {
        var b = "modal", d = "4.0.0-alpha", g = "bs.modal", h = "." + g, i = ".data-api", j = a.fn[b], k = 300, l = 150, m = {
            backdrop: !0,
            keyboard: !0,
            focus: !0,
            show: !0
        }, n = {
            backdrop: "(boolean|string)",
            keyboard: "boolean",
            focus: "boolean",
            show: "boolean"
        }, o = {
            HIDE: "hide" + h,
            HIDDEN: "hidden" + h,
            SHOW: "show" + h,
            SHOWN: "shown" + h,
            FOCUSIN: "focusin" + h,
            RESIZE: "resize" + h,
            CLICK_DISMISS: "click.dismiss" + h,
            KEYDOWN_DISMISS: "keydown.dismiss" + h,
            MOUSEUP_DISMISS: "mouseup.dismiss" + h,
            MOUSEDOWN_DISMISS: "mousedown.dismiss" + h,
            CLICK_DATA_API: "click" + h + i
        }, p = {
            SCROLLBAR_MEASURER: "modal-scrollbar-measure",
            BACKDROP: "modal-backdrop",
            OPEN: "modal-open",
            FADE: "fade",
            IN: "in"
        }, q = {
            DIALOG: ".modal-dialog",
            DATA_TOGGLE: '[data-toggle="modal"]',
            DATA_DISMISS: '[data-dismiss="modal"]',
            FIXED_CONTENT: ".navbar-fixed-top, .navbar-fixed-bottom, .is-fixed"
        }, r = function () {
            function i(b, c) {
                e(this, i), this._config = this._getConfig(c), this._element = b, this._dialog = a(b).find(q.DIALOG)[0], this._backdrop = null, this._isShown = !1, this._isBodyOverflowing = !1, this._ignoreBackdropClick = !1, this._originalBodyPadding = 0, this._scrollbarWidth = 0
            }

            return c(i, [{
                key: "toggle", value: function (b) {
                    return this._isShown ? this.hide() : this.show(b)
                }
            }, {
                key: "show", value: function (c) {
                    var d = this, e = a.Event(o.SHOW, {relatedTarget: c});
                    a(this._element).trigger(e), this._isShown || e.isDefaultPrevented() || (this._isShown = !0, this._checkScrollbar(), this._setScrollbar(), a(document.body).addClass(p.OPEN), this._setEscapeEvent(), this._setResizeEvent(), a(this._element).on(o.CLICK_DISMISS, q.DATA_DISMISS, a.proxy(this.hide, this)), a(this._dialog).on(o.MOUSEDOWN_DISMISS, function () {
                        a(d._element).one(o.MOUSEUP_DISMISS, function (b) {
                            a(b.target).is(d._element) && (d._ignoreBackdropClick = !0)
                        })
                    }), this._showBackdrop(a.proxy(this._showElement, this, c)))
                }
            }, {
                key: "hide", value: function (c) {
                    c && c.preventDefault();
                    var d = a.Event(o.HIDE);
                    a(this._element).trigger(d), this._isShown && !d.isDefaultPrevented() && (this._isShown = !1, this._setEscapeEvent(), this._setResizeEvent(), a(document).off(o.FOCUSIN), a(this._element).removeClass(p.IN), a(this._element).off(o.CLICK_DISMISS), a(this._dialog).off(o.MOUSEDOWN_DISMISS), f.supportsTransitionEnd() && a(this._element).hasClass(p.FADE) ? a(this._element).one(f.TRANSITION_END, a.proxy(this._hideModal, this)).emulateTransitionEnd(k) : this._hideModal())
                }
            }, {
                key: "dispose", value: function () {
                    a.removeData(this._element, g), a(window).off(h), a(document).off(h), a(this._element).off(h), a(this._backdrop).off(h), this._config = null, this._element = null, this._dialog = null, this._backdrop = null, this._isShown = null, this._isBodyOverflowing = null, this._ignoreBackdropClick = null, this._originalBodyPadding = null, this._scrollbarWidth = null
                }
            }, {
                key: "_getConfig", value: function (d) {
                    return d = a.extend({}, m, d), f.typeCheckConfig(b, d, n), d
                }
            }, {
                key: "_showElement", value: function (c) {
                    var d = this, e = f.supportsTransitionEnd() && a(this._element).hasClass(p.FADE);
                    this._element.parentNode && this._element.parentNode.nodeType === Node.ELEMENT_NODE || document.body.appendChild(this._element), this._element.style.display = "block", this._element.scrollTop = 0, e && f.reflow(this._element), a(this._element).addClass(p.IN), this._config.focus && this._enforceFocus();
                    var g = a.Event(o.SHOWN, {relatedTarget: c}), h = function () {
                        d._config.focus && d._element.focus(), a(d._element).trigger(g)
                    };
                    e ? a(this._dialog).one(f.TRANSITION_END, h).emulateTransitionEnd(k) : h()
                }
            }, {
                key: "_enforceFocus", value: function () {
                    var c = this;
                    a(document).off(o.FOCUSIN).on(o.FOCUSIN, function (b) {
                        c._element === b.target || a(c._element).has(b.target).length || c._element.focus()
                    })
                }
            }, {
                key: "_setEscapeEvent", value: function () {
                    var c = this;
                    this._isShown && this._config.keyboard ? a(this._element).on(o.KEYDOWN_DISMISS, function (a) {
                        27 === a.which && c.hide()
                    }) : this._isShown || a(this._element).off(o.KEYDOWN_DISMISS)
                }
            }, {
                key: "_setResizeEvent", value: function () {
                    this._isShown ? a(window).on(o.RESIZE, a.proxy(this._handleUpdate, this)) : a(window).off(o.RESIZE)
                }
            }, {
                key: "_hideModal", value: function () {
                    var c = this;
                    this._element.style.display = "none", this._showBackdrop(function () {
                        a(document.body).removeClass(p.OPEN), c._resetAdjustments(), c._resetScrollbar(), a(c._element).trigger(o.HIDDEN)
                    })
                }
            }, {
                key: "_removeBackdrop", value: function () {
                    this._backdrop && (a(this._backdrop).remove(), this._backdrop = null)
                }
            }, {
                key: "_showBackdrop", value: function (c) {
                    var d = this, e = a(this._element).hasClass(p.FADE) ? p.FADE : "";
                    if (this._isShown && this._config.backdrop) {
                        var g = f.supportsTransitionEnd() && e;
                        if (this._backdrop = document.createElement("div"), this._backdrop.className = p.BACKDROP, e && a(this._backdrop).addClass(e), a(this._backdrop).appendTo(document.body), a(this._element).on(o.CLICK_DISMISS, function (a) {
                                return d._ignoreBackdropClick ? void(d._ignoreBackdropClick = !1) : void(a.target === a.currentTarget && ("static" === d._config.backdrop ? d._element.focus() : d.hide()))
                            }), g && f.reflow(this._backdrop), a(this._backdrop).addClass(p.IN), !c)return;
                        if (!g)return void c();
                        a(this._backdrop).one(f.TRANSITION_END, c).emulateTransitionEnd(l)
                    } else if (!this._isShown && this._backdrop) {
                        a(this._backdrop).removeClass(p.IN);
                        var h = function () {
                            d._removeBackdrop(), c && c()
                        };
                        f.supportsTransitionEnd() && a(this._element).hasClass(p.FADE) ? a(this._backdrop).one(f.TRANSITION_END, h).emulateTransitionEnd(l) : h()
                    } else c && c()
                }
            }, {
                key: "_handleUpdate", value: function () {
                    this._adjustDialog()
                }
            }, {
                key: "_adjustDialog", value: function () {
                    var b = this._element.scrollHeight > document.documentElement.clientHeight;
                    !this._isBodyOverflowing && b && (this._element.style.paddingLeft = this._scrollbarWidth + "px"), this._isBodyOverflowing && !b && (this._element.style.paddingRight = this._scrollbarWidth + "px~")
                }
            }, {
                key: "_resetAdjustments", value: function () {
                    this._element.style.paddingLeft = "", this._element.style.paddingRight = ""
                }
            }, {
                key: "_checkScrollbar", value: function () {
                    var b = window.innerWidth;
                    if (!b) {
                        var c = document.documentElement.getBoundingClientRect();
                        b = c.right - Math.abs(c.left)
                    }
                    this._isBodyOverflowing = document.body.clientWidth < b, this._scrollbarWidth = this._getScrollbarWidth()
                }
            }, {
                key: "_setScrollbar", value: function () {
                    var c = parseInt(a(q.FIXED_CONTENT).css("padding-right") || 0, 10);
                    this._originalBodyPadding = document.body.style.paddingRight || "", this._isBodyOverflowing && (document.body.style.paddingRight = c + this._scrollbarWidth + "px")
                }
            }, {
                key: "_resetScrollbar", value: function () {
                    document.body.style.paddingRight = this._originalBodyPadding
                }
            }, {
                key: "_getScrollbarWidth", value: function () {
                    var b = document.createElement("div");
                    b.className = p.SCROLLBAR_MEASURER, document.body.appendChild(b);
                    var c = b.offsetWidth - b.clientWidth;
                    return document.body.removeChild(b), c
                }
            }], [{
                key: "_jQueryInterface", value: function (c, d) {
                    return this.each(function () {
                        var b = a(this).data(g), e = a.extend({}, i.Default, a(this).data(), "object" == typeof c && c);
                        if (b || (b = new i(this, e), a(this).data(g, b)), "string" == typeof c) {
                            if (void 0 === b[c])throw new Error('No method named "' + c + '"');
                            b[c](d)
                        } else e.show && b.show(d)
                    })
                }
            }, {
                key: "VERSION", get: function () {
                    return d
                }
            }, {
                key: "Default", get: function () {
                    return m
                }
            }]), i
        }();
        return a(document).on(o.CLICK_DATA_API, q.DATA_TOGGLE, function (b) {
            var c = this, d = void 0, e = f.getSelectorFromElement(this);
            e && (d = a(e)[0]);
            var h = a(d).data(g) ? "toggle" : a.extend({}, a(d).data(), a(this).data());
            "A" === this.tagName && b.preventDefault();
            var i = a(d).one(o.SHOW, function (b) {
                b.isDefaultPrevented() || i.one(o.HIDDEN, function () {
                    a(c).is(":visible") && c.focus()
                })
            });
            r._jQueryInterface.call(a(d), h, this)
        }), a.fn[b] = r._jQueryInterface, a.fn[b].Constructor = r, a.fn[b].noConflict = function () {
            return a.fn[b] = j, r._jQueryInterface
        }, r
    }(jQuery), function (a) {
        var b = "scrollspy", d = "4.0.0-alpha", g = "bs.scrollspy", h = "." + g, i = ".data-api", j = a.fn[b], k = {
            offset: 10,
            method: "auto",
            target: ""
        }, l = {offset: "number", method: "string", target: "(string|element)"}, m = {
            ACTIVATE: "activate" + h,
            SCROLL: "scroll" + h,
            LOAD_DATA_API: "load" + h + i
        }, n = {
            DROPDOWN_ITEM: "dropdown-item",
            DROPDOWN_MENU: "dropdown-menu",
            NAV_LINK: "nav-link",
            NAV: "nav",
            ACTIVE: "active"
        }, o = {
            DATA_SPY: '[data-spy="scroll"]',
            ACTIVE: ".active",
            LIST_ITEM: ".list-item",
            LI: "li",
            LI_DROPDOWN: "li.dropdown",
            NAV_LINKS: ".nav-link",
            DROPDOWN: ".dropdown",
            DROPDOWN_ITEMS: ".dropdown-item",
            DROPDOWN_TOGGLE: ".dropdown-toggle"
        }, p = {OFFSET: "offset", POSITION: "position"}, q = function () {
            function i(b, c) {
                e(this, i), this._element = b, this._scrollElement = "BODY" === b.tagName ? window : b, this._config = this._getConfig(c), this._selector = this._config.target + " " + o.NAV_LINKS + "," + (this._config.target + " " + o.DROPDOWN_ITEMS), this._offsets = [], this._targets = [], this._activeTarget = null, this._scrollHeight = 0, a(this._scrollElement).on(m.SCROLL, a.proxy(this._process, this)), this.refresh(), this._process()
            }

            return c(i, [{
                key: "refresh", value: function () {
                    var c = this, d = this._scrollElement !== this._scrollElement.window ? p.POSITION : p.OFFSET, e = "auto" === this._config.method ? d : this._config.method, g = e === p.POSITION ? this._getScrollTop() : 0;
                    this._offsets = [], this._targets = [], this._scrollHeight = this._getScrollHeight();
                    var h = a.makeArray(a(this._selector));
                    h.map(function (b) {
                        var c = void 0, d = f.getSelectorFromElement(b);
                        if (d && (c = a(d)[0]), c && (c.offsetWidth || c.offsetHeight))return [a(c)[e]().top + g, d]
                    }).filter(function (a) {
                        return a
                    }).sort(function (a, b) {
                        return a[0] - b[0]
                    }).forEach(function (a) {
                        c._offsets.push(a[0]), c._targets.push(a[1])
                    })
                }
            }, {
                key: "dispose", value: function () {
                    a.removeData(this._element, g), a(this._scrollElement).off(h), this._element = null, this._scrollElement = null, this._config = null, this._selector = null, this._offsets = null, this._targets = null, this._activeTarget = null, this._scrollHeight = null
                }
            }, {
                key: "_getConfig", value: function (d) {
                    if (d = a.extend({}, k, d), "string" != typeof d.target) {
                        var e = a(d.target).attr("id");
                        e || (e = f.getUID(b), a(d.target).attr("id", e)), d.target = "#" + e
                    }
                    return f.typeCheckConfig(b, d, l), d
                }
            }, {
                key: "_getScrollTop", value: function () {
                    return this._scrollElement === window ? this._scrollElement.scrollY : this._scrollElement.scrollTop
                }
            }, {
                key: "_getScrollHeight", value: function () {
                    return this._scrollElement.scrollHeight || Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)
                }
            }, {
                key: "_process", value: function () {
                    var b = this._getScrollTop() + this._config.offset, c = this._getScrollHeight(), d = this._config.offset + c - this._scrollElement.offsetHeight;
                    if (this._scrollHeight !== c && this.refresh(), b >= d) {
                        var e = this._targets[this._targets.length - 1];
                        this._activeTarget !== e && this._activate(e)
                    }
                    if (this._activeTarget && b < this._offsets[0])return this._activeTarget = null, void this._clear();
                    for (var f = this._offsets.length; f--;) {
                        var g = this._activeTarget !== this._targets[f] && b >= this._offsets[f] && (void 0 === this._offsets[f + 1] || b < this._offsets[f + 1]);
                        g && this._activate(this._targets[f])
                    }
                }
            }, {
                key: "_activate", value: function (c) {
                    this._activeTarget = c, this._clear();
                    var d = this._selector.split(",");
                    d = d.map(function (a) {
                        return a + '[data-target="' + c + '"],' + (a + '[href="' + c + '"]')
                    });
                    var e = a(d.join(","));
                    e.hasClass(n.DROPDOWN_ITEM) ? (e.closest(o.DROPDOWN).find(o.DROPDOWN_TOGGLE).addClass(n.ACTIVE), e.addClass(n.ACTIVE)) : e.parents(o.LI).find(o.NAV_LINKS).addClass(n.ACTIVE), a(this._scrollElement).trigger(m.ACTIVATE, {relatedTarget: c})
                }
            }, {
                key: "_clear", value: function () {
                    a(this._selector).filter(o.ACTIVE).removeClass(n.ACTIVE)
                }
            }], [{
                key: "_jQueryInterface", value: function (c) {
                    return this.each(function () {
                        var b = a(this).data(g), d = "object" == typeof c && c || null;
                        if (b || (b = new i(this, d), a(this).data(g, b)), "string" == typeof c) {
                            if (void 0 === b[c])throw new Error('No method named "' + c + '"');
                            b[c]()
                        }
                    })
                }
            }, {
                key: "VERSION", get: function () {
                    return d
                }
            }, {
                key: "Default", get: function () {
                    return k
                }
            }]), i
        }();
        return a(window).on(m.LOAD_DATA_API, function () {
            for (var b = a.makeArray(a(o.DATA_SPY)), c = b.length; c--;) {
                var d = a(b[c]);
                q._jQueryInterface.call(d, d.data())
            }
        }), a.fn[b] = q._jQueryInterface, a.fn[b].Constructor = q, a.fn[b].noConflict = function () {
            return a.fn[b] = j, q._jQueryInterface
        }, q
    }(jQuery), function (a) {
        var b = "tab", d = "4.0.0-alpha", g = "bs.tab", h = "." + g, i = ".data-api", j = a.fn[b], k = 150, l = {
            HIDE: "hide" + h,
            HIDDEN: "hidden" + h, SHOW: "show" + h, SHOWN: "shown" + h, CLICK_DATA_API: "click" + h + i
        }, m = {DROPDOWN_MENU: "dropdown-menu", ACTIVE: "active", FADE: "fade", IN: "in"}, n = {
            A: "a",
            LI: "li",
            DROPDOWN: ".dropdown",
            UL: "ul:not(.dropdown-menu)",
            FADE_CHILD: "> .nav-item .fade, > .fade",
            ACTIVE: ".active",
            ACTIVE_CHILD: "> .nav-item > .active, > .active",
            DATA_TOGGLE: '[data-toggle="tab"], [data-toggle="pill"]',
            DROPDOWN_TOGGLE: ".dropdown-toggle",
            DROPDOWN_ACTIVE_CHILD: "> .dropdown-menu .active"
        }, o = function () {
            function b(a) {
                e(this, b), this._element = a
            }

            return c(b, [{
                key: "show", value: function () {
                    var c = this;
                    if (!this._element.parentNode || this._element.parentNode.nodeType !== Node.ELEMENT_NODE || !a(this._element).hasClass(m.ACTIVE)) {
                        var d = void 0, e = void 0, g = a(this._element).closest(n.UL)[0], h = f.getSelectorFromElement(this._element);
                        g && (e = a.makeArray(a(g).find(n.ACTIVE)), e = e[e.length - 1]);
                        var i = a.Event(l.HIDE, {relatedTarget: this._element}), j = a.Event(l.SHOW, {relatedTarget: e});
                        if (e && a(e).trigger(i), a(this._element).trigger(j), !j.isDefaultPrevented() && !i.isDefaultPrevented()) {
                            h && (d = a(h)[0]), this._activate(this._element, g);
                            var k = function () {
                                var d = a.Event(l.HIDDEN, {relatedTarget: c._element}), f = a.Event(l.SHOWN, {relatedTarget: e});
                                a(e).trigger(d), a(c._element).trigger(f)
                            };
                            d ? this._activate(d, d.parentNode, k) : k()
                        }
                    }
                }
            }, {
                key: "dispose", value: function () {
                    a.removeClass(this._element, g), this._element = null
                }
            }, {
                key: "_activate", value: function (c, d, e) {
                    var g = a(d).find(n.ACTIVE_CHILD)[0], h = e && f.supportsTransitionEnd() && (g && a(g).hasClass(m.FADE) || Boolean(a(d).find(n.FADE_CHILD)[0])), i = a.proxy(this._transitionComplete, this, c, g, h, e);
                    g && h ? a(g).one(f.TRANSITION_END, i).emulateTransitionEnd(k) : i(), g && a(g).removeClass(m.IN)
                }
            }, {
                key: "_transitionComplete", value: function (c, d, e, g) {
                    if (d) {
                        a(d).removeClass(m.ACTIVE);
                        var h = a(d).find(n.DROPDOWN_ACTIVE_CHILD)[0];
                        h && a(h).removeClass(m.ACTIVE), d.setAttribute("aria-expanded", !1)
                    }
                    if (a(c).addClass(m.ACTIVE), c.setAttribute("aria-expanded", !0), e ? (f.reflow(c), a(c).addClass(m.IN)) : a(c).removeClass(m.FADE), c.parentNode && a(c.parentNode).hasClass(m.DROPDOWN_MENU)) {
                        var i = a(c).closest(n.DROPDOWN)[0];
                        i && a(i).find(n.DROPDOWN_TOGGLE).addClass(m.ACTIVE), c.setAttribute("aria-expanded", !0)
                    }
                    g && g()
                }
            }], [{
                key: "_jQueryInterface", value: function (d) {
                    return this.each(function () {
                        var c = a(this), e = c.data(g);
                        if (e || (e = e = new b(this), c.data(g, e)), "string" == typeof d) {
                            if (void 0 === e[d])throw new Error('No method named "' + d + '"');
                            e[d]()
                        }
                    })
                }
            }, {
                key: "VERSION", get: function () {
                    return d
                }
            }]), b
        }();
        return a(document).on(l.CLICK_DATA_API, n.DATA_TOGGLE, function (b) {
            b.preventDefault(), o._jQueryInterface.call(a(this), "show")
        }), a.fn[b] = o._jQueryInterface, a.fn[b].Constructor = o, a.fn[b].noConflict = function () {
            return a.fn[b] = j, o._jQueryInterface
        }, o
    }(jQuery), function (a) {
        if (void 0 === window.Tether)throw new Error("Bootstrap tooltips require Tether (http://github.hubspot.com/tether/)");
        var b = "tooltip", d = "4.0.0-alpha", g = "bs.tooltip", h = "." + g, i = a.fn[b], j = 150, k = "bs-tether", l = {
            animation: !0,
            template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
            trigger: "hover focus",
            title: "",
            delay: 0,
            html: !1,
            selector: !1,
            placement: "top",
            offset: "0 0",
            constraints: []
        }, m = {
            animation: "boolean",
            template: "string",
            title: "(string|element|function)",
            trigger: "string",
            delay: "(number|object)",
            html: "boolean",
            selector: "(string|boolean)",
            placement: "(string|function)",
            offset: "string",
            constraints: "array"
        }, n = {TOP: "bottom center", RIGHT: "middle left", BOTTOM: "top center", LEFT: "middle right"}, o = {
            IN: "in",
            OUT: "out"
        }, p = {
            HIDE: "hide" + h,
            HIDDEN: "hidden" + h,
            SHOW: "show" + h,
            SHOWN: "shown" + h,
            INSERTED: "inserted" + h,
            CLICK: "click" + h,
            FOCUSIN: "focusin" + h,
            FOCUSOUT: "focusout" + h,
            MOUSEENTER: "mouseenter" + h,
            MOUSELEAVE: "mouseleave" + h
        }, q = {FADE: "fade", IN: "in"}, r = {TOOLTIP: ".tooltip", TOOLTIP_INNER: ".tooltip-inner"}, s = {
            element: !1,
            enabled: !1
        }, t = {HOVER: "hover", FOCUS: "focus", CLICK: "click", MANUAL: "manual"}, u = function () {
            function i(a, b) {
                e(this, i), this._isEnabled = !0, this._timeout = 0, this._hoverState = "", this._activeTrigger = {}, this._tether = null, this.element = a, this.config = this._getConfig(b), this.tip = null, this._setListeners()
            }

            return c(i, [{
                key: "enable", value: function () {
                    this._isEnabled = !0
                }
            }, {
                key: "disable", value: function () {
                    this._isEnabled = !1
                }
            }, {
                key: "toggleEnabled", value: function () {
                    this._isEnabled = !this._isEnabled
                }
            }, {
                key: "toggle", value: function (c) {
                    if (c) {
                        var d = this.constructor.DATA_KEY, e = a(c.currentTarget).data(d);
                        e || (e = new this.constructor(c.currentTarget, this._getDelegateConfig()), a(c.currentTarget).data(d, e)), e._activeTrigger.click = !e._activeTrigger.click, e._isWithActiveTrigger() ? e._enter(null, e) : e._leave(null, e)
                    } else {
                        if (a(this.getTipElement()).hasClass(q.IN))return void this._leave(null, this);
                        this._enter(null, this)
                    }
                }
            }, {
                key: "dispose", value: function () {
                    clearTimeout(this._timeout), this.cleanupTether(), a.removeData(this.element, this.constructor.DATA_KEY), a(this.element).off(this.constructor.EVENT_KEY), this.tip && a(this.tip).remove(), this._isEnabled = null, this._timeout = null, this._hoverState = null, this._activeTrigger = null, this._tether = null, this.element = null, this.config = null, this.tip = null
                }
            }, {
                key: "show", value: function () {
                    var c = this, d = a.Event(this.constructor.Event.SHOW);
                    if (this.isWithContent() && this._isEnabled) {
                        a(this.element).trigger(d);
                        var e = a.contains(this.element.ownerDocument.documentElement, this.element);
                        if (d.isDefaultPrevented() || !e)return;
                        var g = this.getTipElement(), h = f.getUID(this.constructor.NAME);
                        g.setAttribute("id", h), this.element.setAttribute("aria-describedby", h), this.setContent(), this.config.animation && a(g).addClass(q.FADE);
                        var j = "function" == typeof this.config.placement ? this.config.placement.call(this, g, this.element) : this.config.placement, l = this._getAttachment(j);
                        a(g).data(this.constructor.DATA_KEY, this).appendTo(document.body), a(this.element).trigger(this.constructor.Event.INSERTED), this._tether = new Tether({
                            attachment: l,
                            element: g,
                            target: this.element,
                            classes: s,
                            classPrefix: k,
                            offset: this.config.offset,
                            constraints: this.config.constraints,
                            addTargetClasses: !1
                        }), f.reflow(g), this._tether.position(), a(g).addClass(q.IN);
                        var m = function () {
                            var d = c._hoverState;
                            c._hoverState = null, a(c.element).trigger(c.constructor.Event.SHOWN), d === o.OUT && c._leave(null, c)
                        };
                        if (f.supportsTransitionEnd() && a(this.tip).hasClass(q.FADE))return void a(this.tip).one(f.TRANSITION_END, m).emulateTransitionEnd(i._TRANSITION_DURATION);
                        m()
                    }
                }
            }, {
                key: "hide", value: function (c) {
                    var d = this, e = this.getTipElement(), g = a.Event(this.constructor.Event.HIDE), h = function () {
                        d._hoverState !== o.IN && e.parentNode && e.parentNode.removeChild(e), d.element.removeAttribute("aria-describedby"), a(d.element).trigger(d.constructor.Event.HIDDEN), d.cleanupTether(), c && c()
                    };
                    a(this.element).trigger(g), g.isDefaultPrevented() || (a(e).removeClass(q.IN), f.supportsTransitionEnd() && a(this.tip).hasClass(q.FADE) ? a(e).one(f.TRANSITION_END, h).emulateTransitionEnd(j) : h(), this._hoverState = "")
                }
            }, {
                key: "isWithContent", value: function () {
                    return Boolean(this.getTitle())
                }
            }, {
                key: "getTipElement", value: function () {
                    return this.tip = this.tip || a(this.config.template)[0]
                }
            }, {
                key: "setContent", value: function () {
                    var c = a(this.getTipElement());
                    this.setElementContent(c.find(r.TOOLTIP_INNER), this.getTitle()), c.removeClass(q.FADE).removeClass(q.IN), this.cleanupTether()
                }
            }, {
                key: "setElementContent", value: function (c, d) {
                    var e = this.config.html;
                    "object" == typeof d && (d.nodeType || d.jquery) ? e ? a(d).parent().is(c) || c.empty().append(d) : c.text(a(d).text()) : c[e ? "html" : "text"](d)
                }
            }, {
                key: "getTitle", value: function () {
                    var b = this.element.getAttribute("data-original-title");
                    return b || (b = "function" == typeof this.config.title ? this.config.title.call(this.element) : this.config.title), b
                }
            }, {
                key: "cleanupTether", value: function () {
                    this._tether && this._tether.destroy()
                }
            }, {
                key: "_getAttachment", value: function (b) {
                    return n[b.toUpperCase()]
                }
            }, {
                key: "_setListeners", value: function () {
                    var c = this, d = this.config.trigger.split(" ");
                    d.forEach(function (b) {
                        if ("click" === b)a(c.element).on(c.constructor.Event.CLICK, c.config.selector, a.proxy(c.toggle, c)); else if (b !== t.MANUAL) {
                            var d = b === t.HOVER ? c.constructor.Event.MOUSEENTER : c.constructor.Event.FOCUSIN, e = b === t.HOVER ? c.constructor.Event.MOUSELEAVE : c.constructor.Event.FOCUSOUT;
                            a(c.element).on(d, c.config.selector, a.proxy(c._enter, c)).on(e, c.config.selector, a.proxy(c._leave, c))
                        }
                    }), this.config.selector ? this.config = a.extend({}, this.config, {
                        trigger: "manual",
                        selector: ""
                    }) : this._fixTitle()
                }
            }, {
                key: "_fixTitle", value: function () {
                    var b = typeof this.element.getAttribute("data-original-title");
                    (this.element.getAttribute("title") || "string" !== b) && (this.element.setAttribute("data-original-title", this.element.getAttribute("title") || ""), this.element.setAttribute("title", ""))
                }
            }, {
                key: "_enter", value: function (c, d) {
                    var e = this.constructor.DATA_KEY;
                    return d = d || a(c.currentTarget).data(e), d || (d = new this.constructor(c.currentTarget, this._getDelegateConfig()), a(c.currentTarget).data(e, d)), c && (d._activeTrigger["focusin" === c.type ? t.FOCUS : t.HOVER] = !0), a(d.getTipElement()).hasClass(q.IN) || d._hoverState === o.IN ? void(d._hoverState = o.IN) : (clearTimeout(d._timeout), d._hoverState = o.IN, d.config.delay && d.config.delay.show ? void(d._timeout = setTimeout(function () {
                        d._hoverState === o.IN && d.show()
                    }, d.config.delay.show)) : void d.show())
                }
            }, {
                key: "_leave", value: function (c, d) {
                    var e = this.constructor.DATA_KEY;
                    if (d = d || a(c.currentTarget).data(e), d || (d = new this.constructor(c.currentTarget, this._getDelegateConfig()), a(c.currentTarget).data(e, d)), c && (d._activeTrigger["focusout" === c.type ? t.FOCUS : t.HOVER] = !1), !d._isWithActiveTrigger())return clearTimeout(d._timeout), d._hoverState = o.OUT, d.config.delay && d.config.delay.hide ? void(d._timeout = setTimeout(function () {
                        d._hoverState === o.OUT && d.hide()
                    }, d.config.delay.hide)) : void d.hide()
                }
            }, {
                key: "_isWithActiveTrigger", value: function () {
                    for (var b in this._activeTrigger)if (this._activeTrigger[b])return !0;
                    return !1
                }
            }, {
                key: "_getConfig", value: function (d) {
                    return d = a.extend({}, this.constructor.Default, a(this.element).data(), d), d.delay && "number" == typeof d.delay && (d.delay = {
                        show: d.delay,
                        hide: d.delay
                    }), f.typeCheckConfig(b, d, this.constructor.DefaultType), d
                }
            }, {
                key: "_getDelegateConfig", value: function () {
                    var b = {};
                    if (this.config)for (var c in this.config)this.constructor.Default[c] !== this.config[c] && (b[c] = this.config[c]);
                    return b
                }
            }], [{
                key: "_jQueryInterface", value: function (c) {
                    return this.each(function () {
                        var b = a(this).data(g), d = "object" == typeof c ? c : null;
                        if ((b || !/destroy|hide/.test(c)) && (b || (b = new i(this, d), a(this).data(g, b)), "string" == typeof c)) {
                            if (void 0 === b[c])throw new Error('No method named "' + c + '"');
                            b[c]()
                        }
                    })
                }
            }, {
                key: "VERSION", get: function () {
                    return d
                }
            }, {
                key: "Default", get: function () {
                    return l
                }
            }, {
                key: "NAME", get: function () {
                    return b
                }
            }, {
                key: "DATA_KEY", get: function () {
                    return g
                }
            }, {
                key: "Event", get: function () {
                    return p
                }
            }, {
                key: "EVENT_KEY", get: function () {
                    return h
                }
            }, {
                key: "DefaultType", get: function () {
                    return m
                }
            }]), i
        }();
        return a.fn[b] = u._jQueryInterface, a.fn[b].Constructor = u, a.fn[b].noConflict = function () {
            return a.fn[b] = i, u._jQueryInterface
        }, u
    }(jQuery));
    (function (a) {
        var f = "popover", g = "4.0.0-alpha", h = "bs.popover", i = "." + h, j = a.fn[f], k = a.extend({}, o.Default, {
            placement: "right",
            trigger: "click",
            content: "",
            template: '<div class="popover" role="tooltip"><div class="popover-arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
        }), l = a.extend({}, o.DefaultType, {content: "(string|element|function)"}), m = {
            FADE: "fade",
            IN: "in"
        }, n = {TITLE: ".popover-title", CONTENT: ".popover-content", ARROW: ".popover-arrow"}, p = {
            HIDE: "hide" + i,
            HIDDEN: "hidden" + i,
            SHOW: "show" + i,
            SHOWN: "shown" + i,
            INSERTED: "inserted" + i,
            CLICK: "click" + i,
            FOCUSIN: "focusin" + i,
            FOCUSOUT: "focusout" + i,
            MOUSEENTER: "mouseenter" + i,
            MOUSELEAVE: "mouseleave" + i
        }, q = function (j) {
            function o() {
                e(this, o), b(Object.getPrototypeOf(o.prototype), "constructor", this).apply(this, arguments)
            }

            return d(o, j), c(o, [{
                key: "isWithContent", value: function () {
                    return this.getTitle() || this._getContent()
                }
            }, {
                key: "getTipElement", value: function () {
                    return this.tip = this.tip || a(this.config.template)[0]
                }
            }, {
                key: "setContent", value: function () {
                    var c = a(this.getTipElement());
                    this.setElementContent(c.find(n.TITLE), this.getTitle()), this.setElementContent(c.find(n.CONTENT), this._getContent()), c.removeClass(m.FADE).removeClass(m.IN), this.cleanupTether()
                }
            }, {
                key: "_getContent", value: function () {
                    return this.element.getAttribute("data-content") || ("function" == typeof this.config.content ? this.config.content.call(this.element) : this.config.content)
                }
            }], [{
                key: "_jQueryInterface", value: function (c) {
                    return this.each(function () {
                        var b = a(this).data(h), d = "object" == typeof c ? c : null;
                        if ((b || !/destroy|hide/.test(c)) && (b || (b = new o(this, d), a(this).data(h, b)), "string" == typeof c)) {
                            if (void 0 === b[c])throw new Error('No method named "' + c + '"');
                            b[c]()
                        }
                    })
                }
            }, {
                key: "VERSION", get: function () {
                    return g
                }
            }, {
                key: "Default", get: function () {
                    return k
                }
            }, {
                key: "NAME", get: function () {
                    return f
                }
            }, {
                key: "DATA_KEY", get: function () {
                    return h
                }
            }, {
                key: "Event", get: function () {
                    return p
                }
            }, {
                key: "EVENT_KEY", get: function () {
                    return i
                }
            }, {
                key: "DefaultType", get: function () {
                    return l
                }
            }]), o
        }(o);
        return a.fn[f] = q._jQueryInterface, a.fn[f].Constructor = q, a.fn[f].noConflict = function () {
            return a.fn[f] = j, q._jQueryInterface
        }, q
    })(jQuery)
}(jQuery);