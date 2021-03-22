if ("undefined" == typeof jQuery) throw new Error("Bootstrap's JavaScript requires jQuery");
+function (a) {
  var b = a.fn.jquery.split(" ")[0].split(".");
  if (b[0] < 2 && b[1] < 9 || 1 == b[0] && 9 == b[1] && b[2] < 1 || b[0] >= 3) throw new Error("Bootstrap's JavaScript requires at least jQuery v1.9.1 but less than v3.0.0")
}(jQuery), +function (a) {
  "use strict";

  function b(a, b) {
    if ("function" != typeof b && null !== b) throw new TypeError("Super expression must either be null or a function, not " + typeof b);
    a.prototype = Object.create(b && b.prototype, {
      constructor: {
        value: a,
        enumerable: !1,
        writable: !0,
        configurable: !0
      }
    }), b && (Object.setPrototypeOf ? Object.setPrototypeOf(a, b) : a.__proto__ = b)
  }

  function c(a, b) {
    if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function")
  }

  var d = function (a, b, c) {
    for (var d = !0; d;) {
      var e = a, f = b, g = c;
      d = !1, null === e && (e = Function.prototype);
      var h = Object.getOwnPropertyDescriptor(e, f);
      if (void 0 !== h) {
        if ("value" in h) return h.value;
        var i = h.get;
        if (void 0 === i) return;
        return i.call(g)
      }
      var j = Object.getPrototypeOf(e);
      if (null === j) return;
      a = j, b = f, c = g, d = !0, h = j = void 0
    }
  }, e = function () {
    function a(a, b) {
      for (var c = 0; c < b.length; c++) {
        var d = b[c];
        d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), Object.defineProperty(a, d.key, d)
      }
    }

    return function (b, c, d) {
      return c && a(b.prototype, c), d && a(b, d), b
    }
  }(), f = function (a) {
    function b(a) {
      return {}.toString.call(a).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
    }

    function c(a) {
      return (a[0] || a).nodeType
    }

    function d() {
      return {
        bindType: h.end, delegateType: h.end, handle: function (b) {
          if (a(b.target).is(this)) return b.handleObj.handler.apply(this, arguments)
        }
      }
    }

    function e() {
      if (window.QUnit) return !1;
      var a = document.createElement("bootstrap");
      for (var b in i) if (void 0 !== a.style[b]) return {end: i[b]};
      return !1
    }

    function f(b) {
      var c = this, d = !1;
      return a(this).one(j.TRANSITION_END, function () {
        d = !0
      }), setTimeout(function () {
        d || j.triggerTransitionEnd(c)
      }, b), this
    }

    function g() {
      h = e(), a.fn.emulateTransitionEnd = f, j.supportsTransitionEnd() && (a.event.special[j.TRANSITION_END] = d())
    }

    var h = !1, i = {
      WebkitTransition: "webkitTransitionEnd",
      MozTransition: "transitionend",
      OTransition: "oTransitionEnd otransitionend",
      transition: "transitionend"
    }, j = {
      TRANSITION_END: "bsTransitionEnd", getUID: function (a) {
        do a += ~~(1e6 * Math.random()); while (document.getElementById(a));
        return a
      }, getSelectorFromElement: function (a) {
        var b = a.getAttribute("data-target");
        return b || (b = a.getAttribute("href") || "", b = /^#[a-z]/i.test(b) ? b : null), b
      }, reflow: function (a) {
        new Function("bs", "return bs")(a.offsetHeight)
      }, triggerTransitionEnd: function (b) {
        a(b).trigger(h.end)
      }, supportsTransitionEnd: function () {
        return Boolean(h)
      }, typeCheckConfig: function (a, d, e) {
        for (var f in e) if (e.hasOwnProperty(f)) {
          var g = e[f], h = d[f], i = void 0;
          if (i = h && c(h) ? "element" : b(h), !new RegExp(g).test(i)) throw new Error(a.toUpperCase() + ": " + ('Option "' + f + '" provided type "' + i + '" ') + ('but expected type "' + g + '".'))
        }
      }
    };
    return g(), j
  }(jQuery), g = (function (a) {
    var b = "alert", d = "4.0.0-alpha", g = "bs.alert", h = "." + g, i = ".data-api", j = a.fn[b], k = 150,
      l = {DISMISS: '[data-dismiss="alert"]'},
      m = {CLOSE: "close" + h, CLOSED: "closed" + h, CLICK_DATA_API: "click" + h + i},
      n = {ALERT: "alert", FADE: "fade", IN: "in"}, o = function () {
        function b(a) {
          c(this, b), this._element = a
        }

        return e(b, [{
          key: "close", value: function (a) {
            a = a || this._element;
            var b = this._getRootElement(a), c = this._triggerCloseEvent(b);
            c.isDefaultPrevented() || this._removeElement(b)
          }
        }, {
          key: "dispose", value: function () {
            a.removeData(this._element, g), this._element = null
          }
        }, {
          key: "_getRootElement", value: function (b) {
            var c = f.getSelectorFromElement(b), d = !1;
            return c && (d = a(c)[0]), d || (d = a(b).closest("." + n.ALERT)[0]), d
          }
        }, {
          key: "_triggerCloseEvent", value: function (b) {
            var c = a.Event(m.CLOSE);
            return a(b).trigger(c), c
          }
        }, {
          key: "_removeElement", value: function (b) {
            return a(b).removeClass(n.IN), f.supportsTransitionEnd() && a(b).hasClass(n.FADE) ? void a(b).one(f.TRANSITION_END, a.proxy(this._destroyElement, this, b)).emulateTransitionEnd(k) : void this._destroyElement(b)
          }
        }, {
          key: "_destroyElement", value: function (b) {
            a(b).detach().trigger(m.CLOSED).remove()
          }
        }], [{
          key: "_jQueryInterface", value: function (c) {
            return this.each(function () {
              var d = a(this), e = d.data(g);
              e || (e = new b(this), d.data(g, e)), "close" === c && e[c](this)
            })
          }
        }, {
          key: "_handleDismiss", value: function (a) {
            return function (b) {
              b && b.preventDefault(), a.close(this)
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
    if (void 0 === window.Tether) throw new Error("Bootstrap tooltips require Tether (http://github.hubspot.com/tether/)");
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
      }, n = {TOP: "bottom center", RIGHT: "middle left", BOTTOM: "top center", LEFT: "middle right"},
      o = {IN: "in", OUT: "out"}, p = {
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
      }, q = {FADE: "fade", IN: "in"}, r = {TOOLTIP: ".tooltip", TOOLTIP_INNER: ".tooltip-inner"},
      s = {element: !1, enabled: !1}, t = {HOVER: "hover", FOCUS: "focus", CLICK: "click", MANUAL: "manual"},
      u = function () {
        function i(a, b) {
          c(this, i), this._isEnabled = !0, this._timeout = 0, this._hoverState = "", this._activeTrigger = {}, this._tether = null, this.element = a, this.config = this._getConfig(b), this.tip = null, this._setListeners()
        }

        return e(i, [{
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
          key: "toggle", value: function (b) {
            if (b) {
              var c = this.constructor.DATA_KEY, d = a(b.currentTarget).data(c);
              d || (d = new this.constructor(b.currentTarget, this._getDelegateConfig()), a(b.currentTarget).data(c, d)), d._activeTrigger.click = !d._activeTrigger.click, d._isWithActiveTrigger() ? d._enter(null, d) : d._leave(null, d)
            } else {
              if (a(this.getTipElement()).hasClass(q.IN)) return void this._leave(null, this);
              this._enter(null, this)
            }
          }
        }, {
          key: "dispose", value: function () {
            clearTimeout(this._timeout), this.cleanupTether(), a.removeData(this.element, this.constructor.DATA_KEY), a(this.element).off(this.constructor.EVENT_KEY), this.tip && a(this.tip).remove(), this._isEnabled = null, this._timeout = null, this._hoverState = null, this._activeTrigger = null, this._tether = null, this.element = null, this.config = null, this.tip = null
          }
        }, {
          key: "show", value: function () {
            var b = this, c = a.Event(this.constructor.Event.SHOW);
            if (this.isWithContent() && this._isEnabled) {
              a(this.element).trigger(c);
              var d = a.contains(this.element.ownerDocument.documentElement, this.element);
              if (c.isDefaultPrevented() || !d) return;
              var e = this.getTipElement(), g = f.getUID(this.constructor.NAME);
              e.setAttribute("id", g), this.element.setAttribute("aria-describedby", g), this.setContent(), this.config.animation && a(e).addClass(q.FADE);
              var h = "function" == typeof this.config.placement ? this.config.placement.call(this, e, this.element) : this.config.placement,
                j = this._getAttachment(h);
              a(e).data(this.constructor.DATA_KEY, this).appendTo(document.body), a(this.element).trigger(this.constructor.Event.INSERTED), this._tether = new Tether({
                attachment: j,
                element: e,
                target: this.element,
                classes: s,
                classPrefix: k,
                offset: this.config.offset,
                constraints: this.config.constraints,
                addTargetClasses: !1
              }), f.reflow(e), this._tether.position(), a(e).addClass(q.IN);
              var l = function () {
                var c = b._hoverState;
                b._hoverState = null, a(b.element).trigger(b.constructor.Event.SHOWN), c === o.OUT && b._leave(null, b)
              };
              if (f.supportsTransitionEnd() && a(this.tip).hasClass(q.FADE)) return void a(this.tip).one(f.TRANSITION_END, l).emulateTransitionEnd(i._TRANSITION_DURATION);
              l()
            }
          }
        }, {
          key: "hide", value: function (b) {
            var c = this, d = this.getTipElement(), e = a.Event(this.constructor.Event.HIDE), g = function () {
              c._hoverState !== o.IN && d.parentNode && d.parentNode.removeChild(d), c.element.removeAttribute("aria-describedby"), a(c.element).trigger(c.constructor.Event.HIDDEN), c.cleanupTether(), b && b()
            };
            a(this.element).trigger(e), e.isDefaultPrevented() || (a(d).removeClass(q.IN), f.supportsTransitionEnd() && a(this.tip).hasClass(q.FADE) ? a(d).one(f.TRANSITION_END, g).emulateTransitionEnd(j) : g(), this._hoverState = "")
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
            var b = a(this.getTipElement());
            this.setElementContent(b.find(r.TOOLTIP_INNER), this.getTitle()), b.removeClass(q.FADE).removeClass(q.IN), this.cleanupTether()
          }
        }, {
          key: "setElementContent", value: function (b, c) {
            var d = this.config.html;
            "object" == typeof c && (c.nodeType || c.jquery) ? d ? a(c).parent().is(b) || b.empty().append(c) : b.text(a(c).text()) : b[d ? "html" : "text"](c)
          }
        }, {
          key: "getTitle", value: function () {
            var a = this.element.getAttribute("data-original-title");
            return a || (a = "function" == typeof this.config.title ? this.config.title.call(this.element) : this.config.title), a
          }
        }, {
          key: "cleanupTether", value: function () {
            this._tether && this._tether.destroy()
          }
        }, {
          key: "_getAttachment", value: function (a) {
            return n[a.toUpperCase()]
          }
        }, {
          key: "_setListeners", value: function () {
            var b = this, c = this.config.trigger.split(" ");
            c.forEach(function (c) {
              if ("click" === c) a(b.element).on(b.constructor.Event.CLICK, b.config.selector, a.proxy(b.toggle, b)); else if (c !== t.MANUAL) {
                var d = c === t.HOVER ? b.constructor.Event.MOUSEENTER : b.constructor.Event.FOCUSIN,
                  e = c === t.HOVER ? b.constructor.Event.MOUSELEAVE : b.constructor.Event.FOCUSOUT;
                a(b.element).on(d, b.config.selector, a.proxy(b._enter, b)).on(e, b.config.selector, a.proxy(b._leave, b))
              }
            }), this.config.selector ? this.config = a.extend({}, this.config, {
              trigger: "manual",
              selector: ""
            }) : this._fixTitle()
          }
        }, {
          key: "_fixTitle", value: function () {
            var a = typeof this.element.getAttribute("data-original-title");
            (this.element.getAttribute("title") || "string" !== a) && (this.element.setAttribute("data-original-title", this.element.getAttribute("title") || ""), this.element.setAttribute("title", ""))
          }
        }, {
          key: "_enter", value: function (b, c) {
            var d = this.constructor.DATA_KEY;
            return c = c || a(b.currentTarget).data(d), c || (c = new this.constructor(b.currentTarget, this._getDelegateConfig()), a(b.currentTarget).data(d, c)), b && (c._activeTrigger["focusin" === b.type ? t.FOCUS : t.HOVER] = !0), a(c.getTipElement()).hasClass(q.IN) || c._hoverState === o.IN ? void (c._hoverState = o.IN) : (clearTimeout(c._timeout), c._hoverState = o.IN, c.config.delay && c.config.delay.show ? void (c._timeout = setTimeout(function () {
              c._hoverState === o.IN && c.show()
            }, c.config.delay.show)) : void c.show())
          }
        }, {
          key: "_leave", value: function (b, c) {
            var d = this.constructor.DATA_KEY;
            if (c = c || a(b.currentTarget).data(d), c || (c = new this.constructor(b.currentTarget, this._getDelegateConfig()), a(b.currentTarget).data(d, c)), b && (c._activeTrigger["focusout" === b.type ? t.FOCUS : t.HOVER] = !1), !c._isWithActiveTrigger()) return clearTimeout(c._timeout), c._hoverState = o.OUT, c.config.delay && c.config.delay.hide ? void (c._timeout = setTimeout(function () {
              c._hoverState === o.OUT && c.hide()
            }, c.config.delay.hide)) : void c.hide()
          }
        }, {
          key: "_isWithActiveTrigger", value: function () {
            for (var a in this._activeTrigger) if (this._activeTrigger[a]) return !0;
            return !1
          }
        }, {
          key: "_getConfig", value: function (c) {
            return c = a.extend({}, this.constructor.Default, a(this.element).data(), c), c.delay && "number" == typeof c.delay && (c.delay = {
              show: c.delay,
              hide: c.delay
            }), f.typeCheckConfig(b, c, this.constructor.DefaultType), c
          }
        }, {
          key: "_getDelegateConfig", value: function () {
            var a = {};
            if (this.config) for (var b in this.config) this.constructor.Default[b] !== this.config[b] && (a[b] = this.config[b]);
            return a
          }
        }], [{
          key: "_jQueryInterface", value: function (b) {
            return this.each(function () {
              var c = a(this).data(g), d = "object" == typeof b ? b : null;
              if ((c || !/destroy|hide/.test(b)) && (c || (c = new i(this, d), a(this).data(g, c)), "string" == typeof b)) {
                if (void 0 === c[b]) throw new Error('No method named "' + b + '"');
                c[b]()
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
  !function (a) {
    var f = "popover", h = "4.0.0-alpha", i = "bs.popover", j = "." + i, k = a.fn[f], l = a.extend({}, g.Default, {
        placement: "right",
        trigger: "click",
        content: "",
        template: '<div class="popover" role="tooltip"><div class="popover-arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
      }), m = a.extend({}, g.DefaultType, {content: "(string|element|function)"}), n = {FADE: "fade", IN: "in"},
      o = {TITLE: ".popover-title", CONTENT: ".popover-content", ARROW: ".popover-arrow"}, p = {
        HIDE: "hide" + j,
        HIDDEN: "hidden" + j,
        SHOW: "show" + j,
        SHOWN: "shown" + j,
        INSERTED: "inserted" + j,
        CLICK: "click" + j,
        FOCUSIN: "focusin" + j,
        FOCUSOUT: "focusout" + j,
        MOUSEENTER: "mouseenter" + j,
        MOUSELEAVE: "mouseleave" + j
      }, q = function (g) {
        function k() {
          c(this, k), d(Object.getPrototypeOf(k.prototype), "constructor", this).apply(this, arguments)
        }

        return b(k, g), e(k, [{
          key: "isWithContent", value: function () {
            return this.getTitle() || this._getContent()
          }
        }, {
          key: "getTipElement", value: function () {
            return this.tip = this.tip || a(this.config.template)[0]
          }
        }, {
          key: "setContent", value: function () {
            var b = a(this.getTipElement());
            this.setElementContent(b.find(o.TITLE), this.getTitle()), this.setElementContent(b.find(o.CONTENT), this._getContent()), b.removeClass(n.FADE).removeClass(n.IN), this.cleanupTether()
          }
        }, {
          key: "_getContent", value: function () {
            return this.element.getAttribute("data-content") || ("function" == typeof this.config.content ? this.config.content.call(this.element) : this.config.content)
          }
        }], [{
          key: "_jQueryInterface", value: function (b) {
            return this.each(function () {
              var c = a(this).data(i), d = "object" == typeof b ? b : null;
              if ((c || !/destroy|hide/.test(b)) && (c || (c = new k(this, d), a(this).data(i, c)), "string" == typeof b)) {
                if (void 0 === c[b]) throw new Error('No method named "' + b + '"');
                c[b]()
              }
            })
          }
        }, {
          key: "VERSION", get: function () {
            return h
          }
        }, {
          key: "Default", get: function () {
            return l
          }
        }, {
          key: "NAME", get: function () {
            return f
          }
        }, {
          key: "DATA_KEY", get: function () {
            return i
          }
        }, {
          key: "Event", get: function () {
            return p
          }
        }, {
          key: "EVENT_KEY", get: function () {
            return j
          }
        }, {
          key: "DefaultType", get: function () {
            return m
          }
        }]), k
      }(g);
    return a.fn[f] = q._jQueryInterface, a.fn[f].Constructor = q, a.fn[f].noConflict = function () {
      return a.fn[f] = k, q._jQueryInterface
    }, q
  }(jQuery)
}(jQuery);
