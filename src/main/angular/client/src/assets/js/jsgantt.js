!function (t, e) {
  if ("object" == typeof exports && "object" == typeof module) module.exports = e(); else if ("function" == typeof define && define.amd) define([], e); else {
    let i = e();
    for (let e in i) ("object" == typeof exports ? exports : t)[e] = i[e]
  }
}(window, function () {
  return function (t) {
    var e = {};

    function i(n) {
      if (e[n]) return e[n].exports;
      let r = e[n] = {i: n, l: !1, exports: {}};
      return t[n].call(r.exports, r, r.exports, i), r.l = !0, r.exports
    }

    return i.m = t, i.c = e, i.d = function (t, e, n) {
      i.o(t, e) || Object.defineProperty(t, e, {enumerable: !0, get: n})
    }, i.r = function (t) {
      "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(t, Symbol.toStringTag, {value: "Module"}), Object.defineProperty(t, "__esModule", {value: !0})
    }, i.t = function (t, e) {
      if (1 & e && (t = i(t)), 8 & e) return t;
      if (4 & e && "object" == typeof t && t && t.__esModule) return t;
      let n = Object.create(null);
      if (i.r(n), Object.defineProperty(n, "default", {
        enumerable: !0,
        value: t
      }), 2 & e && "string" != typeof t) for (let e in t) i.d(n, e, function (e) {
        return t[e]
      }.bind(null, e));
      return n
    }, i.n = function (t) {
      var e = t && t.__esModule ? function () {
        return t.default
      } : function () {
        return t
      };
      return i.d(e, "a", e), e
    }, i.o = function (t, e) {
      return Object.prototype.hasOwnProperty.call(t, e)
    }, i.p = "", i(i.s = 159)
  }([function (t, e, i) {
    var n, r = i(3);
    t.exports = {
      copy: function t(e) {
        var i, n;
        if (e && "object" == typeof e) switch (!0) {
          case r.isDate(e):
            n = new Date(e);
            break;
          case r.isArray(e):
            for (n = new Array(e.length), i = 0; i < e.length; i++) n[i] = t(e[i]);
            break;
          case r.isStringObject(e):
            n = new String(e);
            break;
          case r.isNumberObject(e):
            n = new Number(e);
            break;
          case r.isBooleanObject(e):
            n = new Boolean(e);
            break;
          default:
            for (i in n = {}, e) Object.prototype.hasOwnProperty.apply(e, [i]) && (n[i] = t(e[i]))
        }
        return n || e
      }, defined: function (t) {
        return void 0 !== t
      }, mixin: function (t, e, i) {
        for (var n in e) (void 0 === t[n] || i) && (t[n] = e[n]);
        return t
      }, uid: function () {
        return n || (n = (new Date).valueOf()), ++n
      }, bind: function (t, e) {
        return t.bind ? t.bind(e) : function () {
          return t.apply(e, arguments)
        }
      }, event: function (t, e, i, n) {
        t.addEventListener ? t.addEventListener(e, i, void 0 !== n && n) : t.attachEvent && t.attachEvent("on" + e, i)
      }, eventRemove: function (t, e, i, n) {
        t.removeEventListener ? t.removeEventListener(e, i, void 0 !== n && n) : t.detachEvent && t.detachEvent("on" + e, i)
      }
    }
  }, function (t, e) {
    function i(t) {
      var e = 0, i = 0, n = 0, r = 0;
      if (t.getBoundingClientRect) {
        var o = t.getBoundingClientRect(), a = document.body,
          s = document.documentElement || document.body.parentNode || document.body,
          l = window.pageYOffset || s.scrollTop || a.scrollTop, c = window.pageXOffset || s.scrollLeft || a.scrollLeft,
          u = s.clientTop || a.clientTop || 0, d = s.clientLeft || a.clientLeft || 0;
        e = o.top + l - u, i = o.left + c - d, n = document.body.offsetWidth - o.right, r = document.body.offsetHeight - o.bottom
      } else {
        for (; t;) e += parseInt(t.offsetTop, 10), i += parseInt(t.offsetLeft, 10), t = t.offsetParent;
        n = document.body.offsetWidth - t.offsetWidth - i, r = document.body.offsetHeight - t.offsetHeight - e
      }
      return {
        y: Math.round(e),
        x: Math.round(i),
        width: t.offsetWidth,
        height: t.offsetHeight,
        right: Math.round(n),
        bottom: Math.round(r)
      }
    }

    function n(t) {
      var e = !1, i = !1;
      if (window.getComputedStyle) {
        var n = window.getComputedStyle(t, null);
        e = n.display, i = n.visibility
      } else t.currentStyle && (e = t.currentStyle.display, i = t.currentStyle.visibility);
      return "none" != e && "hidden" != i
    }

    function r(t) {
      return !isNaN(t.getAttribute("tabindex")) && 1 * t.getAttribute("tabindex") >= 0
    }

    function o(t) {
      return !{a: !0, area: !0}[t.nodeName.loLowerCase()] || !!t.getAttribute("href")
    }

    function a(t) {
      return !{
        input: !0,
        select: !0,
        textarea: !0,
        button: !0,
        object: !0
      }[t.nodeName.toLowerCase()] || !t.hasAttribute("disabled")
    }

    function s(t) {
      if (!t) return "";
      var e = t.className || "";
      return e.baseVal && (e = e.baseVal), e.indexOf || (e = ""), u(e)
    }

    var l = document.createElement("div");

    function c(t) {
      return t.tagName ? t : (t = t || window.event).target
    }

    function u(t) {
      return (String.prototype.trim || function () {
        return this.replace(/^\s+|\s+$/g, "")
      }).apply(t)
    }

    t.exports = {
      getNodePosition: i, getFocusableNodes: function (t) {
        for (var e = t.querySelectorAll(["a[href]", "area[href]", "input", "select", "textarea", "button", "iframe", "object", "embed", "[tabindex]", "[contenteditable]"].join(", ")), i = Array.prototype.slice.call(e, 0), s = 0; s < i.length; s++) {
          var l = i[s];
          (r(l) || a(l) || o(l)) && n(l) || (i.splice(s, 1), s--)
        }
        return i
      }, getScrollSize: function () {
        var t = document.createElement("div");
        t.style.cssText = "visibility:hidden;position:absolute;left:-1000px;width:100px;padding:0px;margin:0px;height:110px;min-height:100px;overflow-y:scroll;", document.body.appendChild(t);
        var e = t.offsetWidth - t.clientWidth;
        return document.body.removeChild(t), e
      }, getClassName: s, addClassName: function (t, e) {
        e && -1 === t.className.indexOf(e) && (t.className += " " + e)
      }, removeClassName: function (t, e) {
        e = e.split(" ");
        for (var i = 0; i < e.length; i++) {
          var n = new RegExp("\\s?\\b" + e[i] + "\\b(?![-_.])", "");
          t.className = t.className.replace(n, "")
        }
      }, insertNode: function (t, e) {
        l.innerHTML = e;
        var i = l.firstChild;
        return t.appendChild(i), i
      }, removeNode: function (t) {
        t && t.parentNode && t.parentNode.removeChild(t)
      }, getChildNodes: function (t, e) {
        for (var i = t.childNodes, n = i.length, r = [], o = 0; o < n; o++) {
          var a = i[o];
          a.className && -1 !== a.className.indexOf(e) && r.push(a)
        }
        return r
      }, toNode: function (t) {
        return "string" == typeof t ? document.getElementById(t) || document.querySelector(t) || document.body : t || document.body
      }, locateClassName: function (t, e, i) {
        var n = c(t), r = "";
        for (void 0 === i && (i = !0); n;) {
          if (r = s(n)) {
            var o = r.indexOf(e);
            if (o >= 0) {
              if (!i) return n;
              var a = 0 === o || !u(r.charAt(o - 1)), l = o + e.length >= r.length || !u(r.charAt(o + e.length));
              if (a && l) return n
            }
          }
          n = n.parentNode
        }
        return null
      }, locateAttribute: function (t, e) {
        if (e) {
          for (var i = c(t); i;) {
            if (i.getAttribute && i.getAttribute(e)) return i;
            i = i.parentNode
          }
          return null
        }
      }, getTargetNode: c, getRelativeEventPosition: function (t, e) {
        var n = document.documentElement, r = i(e);
        return {
          x: t.clientX + n.scrollLeft - n.clientLeft - r.x + e.scrollLeft,
          y: t.clientY + n.scrollTop - n.clientTop - r.y + e.scrollTop
        }
      }, isChildOf: function (t, e) {
        if (!t || !e) return !1;
        for (; t && t != e;) t = t.parentNode;
        return t === e
      }, hasClass: function (t, e) {
        return "classList" in t ? t.classList.contains(e) : new RegExp("\\b" + e + "\\b").test(t.className)
      }, closest: function (t, e) {
        if (t.closest) return t.closest(e);
        if (t.matches || t.msMatchesSelector || t.webkitMatchesSelector) {
          var i = t;
          if (!document.documentElement.contains(i)) return null;
          do {
            if ((i.matches || i.msMatchesSelector || i.webkitMatchesSelector).call(i, e)) return i;
            i = i.parentElement || i.parentNode
          } while (null !== i && 1 === i.nodeType);
          return null
        }
        return console.error("Your browser is not supported"), null
      }
    }
  }, function (t, e) {
    t.exports = function (t, e) {
      for (var i in e) e.hasOwnProperty(i) && (t[i] = e[i]);

      function n() {
        this.constructor = t
      }

      t.prototype = null === e ? Object.create(e) : (n.prototype = e.prototype, new n)
    }
  }, function (t, e) {
    var i = {
      second: 1,
      minute: 60,
      hour: 3600,
      day: 86400,
      week: 604800,
      month: 2592e3,
      quarter: 7776e3,
      year: 31536e3
    };

    function n(t, e) {
      var i = [];
      if (t.filter) return t.filter(e);
      for (var n = 0; n < t.length; n++) e(t[n], n) && (i[i.length] = t[n]);
      return i
    }

    t.exports = {
      getSecondsInUnit: function (t) {
        return i[t] || i.hour
      }, forEach: function (t, e) {
        if (t.forEach) t.forEach(e); else for (var i = t.slice(), n = 0; n < i.length; n++) e(i[n], n)
      }, arrayMap: function (t, e) {
        if (t.map) return t.map(e);
        for (var i = t.slice(), n = [], r = 0; r < i.length; r++) n.push(e(i[r], r));
        return n
      }, arrayFind: function (t, e) {
        if (t.find) return t.find(e);
        for (var i = 0; i < t.length; i++) if (e(t[i], i)) return t[i]
      }, arrayFilter: n, arrayDifference: function (t, e) {
        return n(t, function (t, i) {
          return !e(t, i)
        })
      }, arraySome: function (t, e) {
        if (0 === t.length) return !1;
        for (var i = 0; i < t.length; i++) if (e(t[i], i, t)) return !0;
        return !1
      }, hashToArray: function (t) {
        var e = [];
        for (var i in t) t.hasOwnProperty(i) && e.push(t[i]);
        return e
      }, sortArrayOfHash: function (t, e, i) {
        var n = function (t, e) {
          return t < e
        };
        t.sort(function (t, r) {
          return t[e] === r[e] ? 0 : i ? n(t[e], r[e]) : n(r[e], t[e])
        })
      }, throttle: function (t, e) {
        var i = !1;
        return function () {
          i || (t.apply(null, arguments), i = !0, setTimeout(function () {
            i = !1
          }, e))
        }
      }, isArray: function (t) {
        return Array.isArray ? Array.isArray(t) : t && void 0 !== t.length && t.pop && t.push
      }, isDate: function (t) {
        return !(!t || "object" != typeof t || !(t.getFullYear && t.getMonth && t.getDate))
      }, isStringObject: function (t) {
        return t && "object" == typeof t && "function String() { [native code] }" === Function.prototype.toString.call(t.constructor)
      }, isNumberObject: function (t) {
        return t && "object" == typeof t && "function Number() { [native code] }" === Function.prototype.toString.call(t.constructor)
      }, isBooleanObject: function (t) {
        return t && "object" == typeof t && "function Boolean() { [native code] }" === Function.prototype.toString.call(t.constructor)
      }, delay: function (t, e) {
        var i, n = function () {
          n.$cancelTimeout(), t.$pending = !0;
          var r = Array.prototype.slice.call(arguments);
          i = setTimeout(function () {
            t.apply(this, r), n.$pending = !1
          }, e)
        };
        return n.$pending = !1, n.$cancelTimeout = function () {
          clearTimeout(i), t.$pending = !1
        }, n.$execute = function () {
          t(), t.$cancelTimeout()
        }, n
      }, objectKeys: function (t) {
        if (Object.keys) return Object.keys(t);
        var e, i = [];
        for (e in t) Object.prototype.hasOwnProperty.call(t, e) && i.push(e);
        return i
      }
    }
  }, function (t, e) {
    var i = function () {
      this._connected = [], this._silent_mode = !1
    };
    i.prototype = {
      _silentStart: function () {
        this._silent_mode = !0
      }, _silentEnd: function () {
        this._silent_mode = !1
      }
    }, t.exports = function (t) {
      var e = new i;
      t.attachEvent = function (t, i, n) {
        return t = "ev_" + t.toLowerCase(), e[t] || (e[t] = function (t) {
          var e = [], i = function () {
            for (var i = !0, n = 0; n < e.length; n++) if (e[n]) {
              var r = e[n].apply(t, arguments);
              i = i && r
            }
            return i
          };
          return i.addEvent = function (t) {
            return "function" == typeof t && e.push(t) - 1
          }, i.removeEvent = function (t) {
            e[t] = null
          }, i
        }(n || this)), t + ":" + e[t].addEvent(i)
      }, t.attachAll = function (t, e) {
        this.attachEvent("listen_all", t, e)
      }, t.callEvent = function (t, i, n) {
        if (e._silent_mode) return !0;
        var r = "ev_" + t.toLowerCase();
        return e.ev_listen_all && e.ev_listen_all.apply(n || this, [t].concat(i)), !e[r] || e[r].apply(n || this, i)
      }, t.checkEvent = function (t) {
        return !!e["ev_" + t.toLowerCase()]
      }, t.detachEvent = function (t) {
        if (t) {
          var i = t.split(":");
          e[i[0]].removeEvent(i[1])
        }
      }, t.detachAllEvents = function () {
        for (var t in e) 0 === t.indexOf("ev_") && delete e[t]
      }
    }
  }, function (t, e) {
    function i() {
    }

    function n() {
    }

    n.prototype.render = i, n.prototype.set_value = i, n.prototype.get_value = i, n.prototype.focus = i, t.exports = function (t) {
      return n
    }
  }, function (t, e, i) {
    var n = i(0), r = i(4), o = i(1), a = function () {
      "use strict";

      function t(t, e, i, a) {
        t && (this.$container = o.toNode(t), this.$parent = t), this.$config = n.mixin(e, {headerHeight: 33}), this.$jsgantt = a, this.$domEvents = a._createDomEventScope(), this.$id = e.id || "c" + n.uid(), this.$name = "cell", this.$factory = i, r(this)
      }

      return t.prototype.destructor = function () {
        this.$parent = this.$container = this.$view = null, this.$jsgantt.$services.getService("mouseEvents").detach("click", "jsgantt-header-arrow", this._headerClickHandler), this.$domEvents.detachAll(), this.callEvent("onDestroy", []), this.detachAllEvents()
      }, t.prototype.cell = function (t) {
        return null
      }, t.prototype.scrollTo = function (t, e) {
        1 * t == t && (this.$view.scrollLeft = t), 1 * e == e && (this.$view.scrollTop = e)
      }, t.prototype.clear = function () {
        this.getNode().innerHTML = "", this.getNode().className = "jsgantt-layout-content", this.getNode().style.padding = "0"
      }, t.prototype.resize = function (t) {
        if (this.$parent) return this.$parent.resize(t);
        !1 === t && (this.$preResize = !0);
        var e = this.$container, i = e.offsetWidth, n = e.offsetHeight, r = this.getSize();
        e === document.body && (i = document.body.offsetWidth, n = document.body.offsetHeight), i < r.minWidth && (i = r.minWidth), i > r.maxWidth && (i = r.maxWidth), n < r.minHeight && (n = r.minHeight), n > r.maxHeight && (n = r.maxHeight), this.setSize(i, n), this.$preResize, this.$preResize = !1
      }, t.prototype.hide = function () {
        this._hide(!0), this.resize()
      }, t.prototype.show = function (t) {
        this._hide(!1), t && this.$parent && this.$parent.show(), this.resize()
      }, t.prototype._hide = function (t) {
        if (!0 === t && this.$view.parentNode) this.$view.parentNode.removeChild(this.$view); else if (!1 === t && !this.$view.parentNode) {
          var e = this.$parent.cellIndex(this.$id);
          this.$parent.moveView(this, e)
        }
        this.$config.hidden = t
      }, t.prototype.$toHTML = function (t, e) {
        void 0 === t && (t = ""), e = [e || "", this.$config.css || ""].join(" ");
        var i = this.$config, n = "";
        return i.raw ? t = "string" == typeof i.raw ? i.raw : "" : (t || (t = "<div class='jsgantt-layout-content' " + (e ? " class='" + e + "' " : "") + " >" + (i.html || "") + "</div>"), i.header && (n = "<div class='jsgantt-layout_header'>" + (i.canCollapse ? "<div class='jsgantt-layout-header-arrow'></div>" : "") + "<div class='jsgantt-layout-header-content'>" + i.header + "</div></div>")), "<div class='jsgantt-layout-cell " + e + "' data-cell-id='" + this.$id + "'>" + n + t + "</div>"
      }, t.prototype.$fill = function (t, e) {
        this.$view = t, this.$parent = e, this.init()
      }, t.prototype.getNode = function () {
        return this.$view.querySelector("jsgantt-layout-cell") || this.$view
      }, t.prototype.init = function () {
        var t = this;
        this._headerClickHandler = function (e) {
          o.locateAttribute(e, "data-cell-id") == t.$id && t.toggle()
        }, this.$jsgantt.$services.getService("mouseEvents").delegate("click", "jsgantt-header-arrow", this._headerClickHandler), this.callEvent("onReady", [])
      }, t.prototype.toggle = function () {
        this.$config.collapsed = !this.$config.collapsed, this.resize()
      }, t.prototype.getSize = function () {
        var t = {
          height: this.$config.height || 0,
          width: this.$config.width || 0,
          gravity: this.$config.gravity || 1,
          minHeight: this.$config.minHeight || 0,
          minWidth: this.$config.minWidth || 0,
          maxHeight: this.$config.maxHeight || 1e5,
          maxWidth: this.$config.maxWidth || 1e5
        };
        if (this.$config.collapsed) {
          var e = "x" === this.$config.mode;
          t[e ? "width" : "height"] = t[e ? "maxWidth" : "maxHeight"] = this.$config.headerHeight
        }
        return t
      }, t.prototype.getContentSize = function () {
        var t = this.$lastSize.contentX;
        t !== 1 * t && (t = this.$lastSize.width);
        var e = this.$lastSize.contentY;
        return e !== 1 * e && (e = this.$lastSize.height), {width: t, height: e}
      }, t.prototype._getBorderSizes = function () {
        var t = {top: 0, right: 0, bottom: 0, left: 0, horizontal: 0, vertical: 0};
        return this._currentBorders && (this._currentBorders[this._borders.left] && (t.left = 1, t.horizontal++), this._currentBorders[this._borders.right] && (t.right = 1, t.horizontal++), this._currentBorders[this._borders.top] && (t.top = 1, t.vertical++), this._currentBorders[this._borders.bottom] && (t.bottom = 1, t.vertical++)), t
      }, t.prototype.setSize = function (t, e) {
        this.$view.style.width = t + "px", this.$view.style.height = e + "px";
        var i = this._getBorderSizes(), n = e - i.vertical, r = t - i.horizontal;
        this.$lastSize = {
          x: t,
          y: e,
          contentX: r,
          contentY: n
        }, this.$config.header ? this._sizeHeader() : this._sizeContent()
      }, t.prototype._borders = {
        left: "jsgantt-layout-cell-border-left",
        right: "jsgantt-layout-cell-border-right",
        top: "jsgantt-layout-cell-border-top",
        bottom: "jsgantt-layout-cell-border-bottom"
      }, t.prototype._setBorders = function (t, e) {
        e || (e = this);
        var i = e.$view;
        for (var n in this._borders) o.removeClassName(i, this._borders[n]);
        "string" == typeof t && (t = [t]);
        var r = {};
        for (n = 0; n < t.length; n++) o.addClassName(i, t[n]), r[t[n]] = !0;
        e._currentBorders = r
      }, t.prototype._sizeContent = function () {
        var t = this.$view.childNodes[0];
        t && "jsgantt-layout-content" == t.className && (t.style.height = this.$lastSize.contentY + "px")
      }, t.prototype._sizeHeader = function () {
        var t = this.$lastSize;
        t.contentY -= this.$config.headerHeight;
        var e = this.$view.childNodes[0], i = this.$view.childNodes[1], n = "x" === this.$config.mode;
        if (this.$config.collapsed) if (i.style.display = "none", n) {
          e.className = "jsgantt-layout-header collapsed-x", e.style.width = t.y + "px";
          var r = Math.floor(t.y / 2 - t.x / 2);
          e.style.transform = "rotate(90deg) translate(" + r + "px, " + r + "px)", i.style.display = "none"
        } else e.className = "jsgantt-layout-header collapsed-y"; else e.className = n ? "jsgantt-layout-header" : "jsgantt-layout-header vertical", e.style.width = "auto", e.style.transform = "", i.style.display = "", i.style.height = t.contentY + "px";
        e.style.height = this.$config.headerHeight + "px"
      }, t
    }();
    t.exports = a
  }, function (t, e) {
    t.exports = function (t) {
      var e = function () {
      };
      return e.prototype = {
        show: function (t, e, i, n) {
        }, hide: function () {
        }, set_value: function (t, e, i, n) {
          this.get_input(n).value = t
        }, get_value: function (t, e, i) {
          return this.get_input(i).value || ""
        }, is_changed: function (t, e, i, n) {
          var r = this.get_value(e, i, n);
          return r && t && r.valueOf && t.valueOf ? r.valueOf() != t.valueOf() : r != t
        }, is_valid: function (t, e, i, n) {
          return !0
        }, save: function (t, e, i) {
        }, get_input: function (t) {
          return t.querySelector("input")
        }, focus: function (t) {
          var e = this.get_input(t);
          e && (e.focus && e.focus(), e.select && e.select())
        }
      }, e
    }
  }, function (t, e) {
    var i = {
      isIE: navigator.userAgent.indexOf("MSIE") >= 0 || navigator.userAgent.indexOf("Trident") >= 0,
      isIE6: !window.XMLHttpRequest && navigator.userAgent.indexOf("MSIE") >= 0,
      isIE7: navigator.userAgent.indexOf("MSIE 7.0") >= 0 && navigator.userAgent.indexOf("Trident") < 0,
      isIE8: navigator.userAgent.indexOf("MSIE 8.0") >= 0 && navigator.userAgent.indexOf("Trident") >= 0,
      isOpera: navigator.userAgent.indexOf("Opera") >= 0,
      isChrome: navigator.userAgent.indexOf("Chrome") >= 0,
      isKHTML: navigator.userAgent.indexOf("Safari") >= 0 || navigator.userAgent.indexOf("Konqueror") >= 0,
      isFF: navigator.userAgent.indexOf("Firefox") >= 0,
      isIPad: navigator.userAgent.search(/iPad/gi) >= 0,
      isEdge: -1 != navigator.userAgent.indexOf("Edge")
    };
    t.exports = i
  }, , , function (t, e, i) {
    var n = i(3), r = {
      getHtmlSelect: function (t, e, i) {
        var r = "", a = this;
        return t = t || [], n.forEach(t, function (t) {
          var e = [{key: "value", value: t.key}];
          i == t.key && (e[e.length] = {
            key: "selected",
            value: "selected"
          }), t.attributes && (e = e.concat(t.attributes)), r += a.getHtmlOption({innerHTML: t.label}, e)
        }), o("select", {innerHTML: r}, e)
      }, getHtmlOption: function (t, e) {
        return o("option", t, e)
      }, getHtmlButton: function (t, e) {
        return o("button", t, e)
      }, getHtmlDiv: function (t, e) {
        return o("div", t, e)
      }, getHtmlLabel: function (t, e) {
        return o("label", t, e)
      }, getHtmlInput: function (t) {
        return "<input" + a(t || []) + ">"
      }
    };

    function o(t, e, i) {
      return e = e || [], "<" + t + a(i || []) + ">" + (e.innerHTML || "") + "</" + t + ">"
    }

    function a(t) {
      var e = "";
      return n.forEach(t, function (t) {
        e += " " + t.key + "='" + t.value + "'"
      }), e
    }

    t.exports = r
  }, function (t, e, i) {
    var n = i(2), r = i(11);
    t.exports = function (t) {
      var e = i(5)(t);

      function o() {
        return e.apply(this, arguments) || this
      }

      return n(o, e), o.prototype.render = function (t) {
        var e = "<div class='jsgantt-cal-ltext' style='height:" + (t.height || "23") + "px;'>";
        return (e += r.getHtmlSelect(t.options, [{key: "style", value: "width:100%;"}])) + "</div>"
      }, o.prototype.set_value = function (t, e, i, n) {
        var r = t.firstChild;
        !r._joc_onchange && n.onchange && (r.onchange = n.onchange, r._joc_onchange = !0), void 0 === e && (e = (r.options[0] || {}).value), r.value = e || ""
      }, o.prototype.get_value = function (t) {
        return t.firstChild.value
      }, o.prototype.focus = function (e) {
        var i = e.firstChild;
        t._focus(i, !0)
      }, o
    }
  }, function (t, e, i) {
    var n = i(0);
    t.exports = {
      createDropTargetObject: function (t) {
        var e = {targetParent: null, targetIndex: 0, targetId: null, child: !1, nextSibling: !1, prevSibling: !1};
        return t && n.mixin(e, t, !0), e
      }, nextSiblingTarget: function (t, e, i) {
        var n = this.createDropTargetObject();
        return n.targetId = e, n.nextSibling = !0, n.targetParent = i.getParent(n.targetId), n.targetIndex = i.getBranchIndex(n.targetId), (i.getParent(t) != n.targetParent || n.targetIndex < i.getBranchIndex(t)) && (n.targetIndex += 1), n
      }, prevSiblingTarget: function (t, e, i) {
        var n = this.createDropTargetObject();
        return n.targetId = e, n.prevSibling = !0, n.targetParent = i.getParent(n.targetId), n.targetIndex = i.getBranchIndex(n.targetId), i.getParent(t) == n.targetParent && n.targetIndex > i.getBranchIndex(t) && (n.targetIndex -= 1), n
      }, firstChildTarget: function (t, e, i) {
        var n = this.createDropTargetObject();
        return n.targetId = e, n.targetParent = n.targetId, n.targetIndex = 0, n.child = !0, n
      }, lastChildTarget: function (t, e, i) {
        var n = i.getChildren(e), r = this.createDropTargetObject();
        return r.targetId = n[n.length - 1], r.targetParent = e, r.targetIndex = n.length, r.nextSibling = !0, r
      }
    }
  }, function (t, e, i) {
    var n = i(3);

    function r(t) {
      if (t._delayRender && t._delayRender.$cancelTimeout(), t.$jsgantt) {
        var e = t.$jsgantt.$data.tasksStore, i = t.$config.rowStore, n = "_attached_" + i.$config.name;
        t[n] && (e.detachEvent(t[n]), t[n] = null), i.$attachedResourceViewHandler && (i.detachEvent(i.$attachedResourceViewHandler), i.$attachedResourceViewHandler = null)
      }
    }

    t.exports = function (t) {
      var e = t.prototype.init, i = t.prototype.destructor;
      return {
        init: function () {
          e.apply(this, arguments), this._linkToTaskStore()
        }, destructor: function () {
          r(this), i.apply(this, arguments)
        }, _linkToTaskStore: function () {
          if (this.$config.rowStore && this.$jsgantt.$data.tasksStore) {
            var t = this.$jsgantt.$data.tasksStore, e = this.$config.rowStore;
            r(this);
            var i = this, o = n.delay(function () {
              i.$jsgantt.getState().lightbox ? o() : i.$config.rowStore.refresh()
            }, 300);
            this._delayRender = o;
            var a = "_attached_" + e.$config.name;
            i[a] || (i[a] = t.attachEvent("onStoreUpdated", o)), this.$jsgantt.attachEvent("onDestroy", function () {
              return r(i), !0
            }), e.$attachedResourceViewHandler || (e.$attachedResourceViewHandler = e.attachEvent("onBeforeStoreUpdate", function () {
              if (i.$jsgantt.getState().lightbox) return !1;
              o.$pending && o.$cancelTimeout(), i._updateNestedTasks()
            }))
          }
        }, _updateNestedTasks: function () {
          var t = this.$jsgantt, e = t.getDatastore(t.config.resource_store);
          if (e.$config.fetchTasks) {
            var i = t.config.resource_property;
            e.silent(function () {
              var n = [], r = {}, o = {};
              for (var a in e.eachItem(function (a) {
                "task" != a.$role ? t.getTaskBy(i, a.id).forEach(function (i) {
                  var o = t.copy(i);
                  o.id = i.id + "_" + a.id, o.$task_id = i.id, o.$resource_id = a.id, o[e.$parentProperty] = a.id, o.$role = "task", n.push(o), r[o.id] = !0
                }) : o[a.id] = !0
              }), o) r[a] || e.removeItem(a);
              e.parse(n)
            })
          }
        }
      }
    }
  }, function (t, e) {
    t.exports = function (t) {
      var e = [];
      return {
        delegate: function (i, n, r, o) {
          e.push([i, n, r, o]), t.$services.getService("mouseEvents").delegate(i, n, r, o)
        }, destructor: function () {
          for (var i = t.$services.getService("mouseEvents"), n = 0; n < e.length; n++) {
            var r = e[n];
            i.detach(r[0], r[1], r[2], r[3])
          }
          e = []
        }
      }
    }
  }, function (t, e, i) {
    var n = i(1), r = i(0), o = i(4), a = i(128), s = i(32), l = function (t, e, i, n) {
      this.$config = r.mixin({}, e || {}), this.$jsgantt = n, this.$parent = t, o(this), this.$state = {}
    };
    l.prototype = {
      init: function (t) {
        var e = this.$jsgantt, n = e._waiAria.gridAttrString(), r = e._waiAria.gridDataAttrString();
        t.innerHTML = "<div class='jsgantt-grid' style='height:inherit;width:inherit;' " + n + "></div>", this.$grid = t.childNodes[0], this.$grid.innerHTML = "<div class='jsgantt-grid-scale' " + e._waiAria.gridScaleRowAttrString() + "></div><div class='jsgantt-grid-data' " + r + "></div>", this.$grid_scale = this.$grid.childNodes[0], this.$grid_data = this.$grid.childNodes[1];
        var o = this.$getConfig()[this.$config.bind + "_attribute"];
        if (!o && this.$config.bind && (o = this.$config.bind + "_id"), this.$config.item_attribute = o || null, !this.$config.layers) {
          var s = this._createLayerConfig();
          this.$config.layers = s
        }
        var l = a(e, this);
        l.init(), this._renderHeaderResizers = l.doOnRender, this._mouseDelegates = i(15)(e), this._addLayers(this.$jsgantt), this._initEvents(), this.callEvent("onReady", [])
      }, _validateColumnWidth: function (t, e) {
        var i = t[e];
        if (i && "*" != i) {
          var n = this.$jsgantt, r = 1 * i;
          isNaN(r) ? n.assert(!1, "Wrong " + e + " value of column " + t.name) : t[e] = r
        }
      }, setSize: function (t, e) {
        this.$config.width = this.$state.width = t, this.$state.height = e;
        for (var i, n = this.getGridColumns(), r = 0, o = 0, a = n.length; o < a; o++) this._validateColumnWidth(n[o], "min_width"), this._validateColumnWidth(n[o], "max_width"), this._validateColumnWidth(n[o], "width"), r += 1 * n[o].width;
        !isNaN(r) && this.$config.scrollable || (r = i = this._setColumnsWidth(t + 1)), this.$config.scrollable ? (this.$grid_scale.style.width = r + "px", this.$grid_data.style.width = r + "px") : (this.$grid_scale.style.width = "inherit", this.$grid_data.style.width = "inherit"), this.$config.width -= 1;
        var s = this.$getConfig();
        i !== t && (s.grid_width = i, this.$config.width = i - 1);
        var l = Math.max(this.$state.height - s.scale_height, 0);
        this.$grid_data.style.height = l + "px", this.refresh()
      }, getSize: function () {
        var t = this.$getConfig(), e = this.$config.rowStore, i = e ? t.row_height * e.countVisible() : 0,
          n = this._getGridWidth();
        return {
          x: this.$state.width,
          y: this.$state.height,
          contentX: this.isVisible() ? n : 0,
          contentY: this.isVisible() ? t.scale_height + i : 0,
          scrollHeight: this.isVisible() ? i : 0,
          scrollWidth: this.isVisible() ? n : 0
        }
      }, refresh: function () {
        this.$config.bind && (this.$config.rowStore = this.$jsgantt.getDatastore(this.$config.bind)), this._initSmartRenderingPlaceholder(), this._calculateGridWidth(), this._renderGridHeader()
      }, scrollTo: function (t, e) {
        this.isVisible() && (1 * t == t && (this.$state.scrollLeft = this.$grid.scrollLeft = t), 1 * e == e && (this.$state.scrollTop = this.$grid_data.scrollTop = e))
      }, getColumnIndex: function (t) {
        for (var e = this.$getConfig().columns, i = 0; i < e.length; i++) if (e[i].name == t) return i;
        return null
      }, getColumn: function (t) {
        var e = this.getColumnIndex(t);
        return null === e ? null : this.$getConfig().columns[e]
      }, getGridColumns: function () {
        return this.$getConfig().columns.slice()
      }, isVisible: function () {
        return this.$parent && this.$parent.$config ? !this.$parent.$config.hidden : this.$grid.offsetWidth
      }, getItemHeight: function () {
        return this.$getConfig().row_height
      }, _createLayerConfig: function () {
        var t = this;
        return [{
          renderer: this.$jsgantt.$ui.layers.gridLine, container: this.$grid_data, filter: [function () {
            return t.isVisible()
          }]
        }]
      }, _addLayers: function (t) {
        if (this.$config.bind) {
          this._taskLayers = [];
          var e = this, i = this.$jsgantt.$services.getService("layers"), n = i.getDataRender(this.$config.bind);
          n || (n = i.createDataRender({
            name: this.$config.bind, defaultContainer: function () {
              return e.$grid_data
            }
          }));
          for (var r = this.$config.layers, o = 0; r && o < r.length; o++) {
            var a = r[o];
            a.host = this;
            var s = n.addLayer(a);
            this._taskLayers.push(s)
          }
          this.$config.bind && (this.$config.rowStore = this.$jsgantt.getDatastore(this.$config.bind)), this._initSmartRenderingPlaceholder()
        }
      }, _refreshPlaceholderOnStoreUpdate: function (t) {
        var e = this.$getConfig(), i = this.$config.rowStore;
        if (i && null === t && this.isVisible() && e.smart_rendering) {
          var n;
          if (this.$config.scrollY) {
            var r = this.$jsgantt.$ui.getView(this.$config.scrollY);
            r && (n = r.getScrollState().scrollSize)
          }
          if (n || (n = i ? e.row_height * i.countVisible() : 0), n) {
            this.$rowsPlaceholder && this.$rowsPlaceholder.parentNode && this.$rowsPlaceholder.parentNode.removeChild(this.$rowsPlaceholder);
            var o = this.$rowsPlaceholder = document.createElement("div");
            o.style.visibility = "hidden", o.style.height = n + "px", o.style.width = "1px", this.$grid_data.appendChild(o)
          }
        }
      }, _initSmartRenderingPlaceholder: function () {
        var t = this.$config.rowStore;
        t && (this._initSmartRenderingPlaceholder = function () {
        }, this._staticBgHandler = t.attachEvent("onStoreUpdated", r.bind(this._refreshPlaceholderOnStoreUpdate, this)))
      }, _initEvents: function () {
        var t = this.$jsgantt;
        this._mouseDelegates.delegate("click", "jsgantt-close", t.bind(function (t, e, i) {
          var r = this.$config.rowStore;
          if (!r) return !0;
          var o = n.locateAttribute(t, this.$config.item_attribute);
          return setTimeout(function () {
            $(".jsgantt-resizer.jsgantt-resizer-x").height() > $(".jsgantt-task-bg").height() && $(".jsgantt-container").css({height: 45 + $(".jsgantt-task-bg").height() + "px"})
          }, 10), o && r.close(o.getAttribute(this.$config.item_attribute)), !1
        }, this), this.$grid), this._mouseDelegates.delegate("click", "jsgantt-open", t.bind(function (t, e, i) {
          var r = this.$config.rowStore;
          if (!r) return !0;
          var o = n.locateAttribute(t, this.$config.item_attribute);
          return $(".jsgantt-container").css({height: $(".jsgantt-resizer.jsgantt-resizer-x").height()}), o && r.open(o.getAttribute(this.$config.item_attribute)), !1
        }, this), this.$grid)
      }, _clearLayers: function (t) {
        var e = this.$jsgantt.$services.getService("layers").getDataRender(this.$config.bind);
        if (this._taskLayers) for (var i = 0; i < this._taskLayers.length; i++) e.removeLayer(this._taskLayers[i]);
        this._taskLayers = []
      }, _getColumnWidth: function (t, e, i) {
        var n = t.min_width || e.min_grid_column_width, r = Math.max(i, n || 10);
        return t.max_width && (r = Math.min(r, t.max_width)), r
      }, _getGridWidthLimits: function () {
        for (var t = this.$getConfig(), e = this.getGridColumns(), i = 0, n = 0, r = 0; r < e.length; r++) i += e[r].min_width ? e[r].min_width : t.min_grid_column_width, void 0 !== n && (n = e[r].max_width ? n + e[r].max_width : void 0);
        return [i, n]
      }, _setColumnsWidth: function (t, e) {
        var i = this.$getConfig(), n = this.getGridColumns(), r = 0, o = t;
        e = window.isNaN(e) ? -1 : e;
        for (var a = 0, s = n.length; a < s; a++) r += 1 * n[a].width;
        if (window.isNaN(r)) for (this._calculateGridWidth(), r = 0, a = 0, s = n.length; a < s; a++) r += 1 * n[a].width;
        var l = o - r, c = 0;
        for (a = 0; a < e + 1; a++) c += n[a].width;
        for (r -= c, a = e + 1; a < n.length; a++) {
          var u = n[a], d = Math.round(l * (u.width / r));
          l < 0 ? u.min_width && u.width + d < u.min_width ? d = u.min_width - u.width : !u.min_width && i.min_grid_column_width && u.width + d < i.min_grid_column_width && (d = i.min_grid_column_width - u.width) : u.max_width && u.width + d > u.max_width && (d = u.max_width - u.width), r -= u.width, u.width += d, l -= d
        }
        for (var h = l > 0 ? 1 : -1; l > 0 && 1 === h || l < 0 && -1 === h;) {
          var f = l;
          for (a = e + 1; a < n.length; a++) {
            var g;
            if ((g = n[a].width + h) == this._getColumnWidth(n[a], i, g) && (l -= h, n[a].width = g), !l) break
          }
          if (f == l) break
        }
        return l && e > -1 && (g = n[e].width + l) == this._getColumnWidth(n[e], i, g) && (n[e].width = g), this._getColsTotalWidth()
      }, _getColsTotalWidth: function () {
        for (var t = this.getGridColumns(), e = 0, i = 0; i < t.length; i++) {
          var n = parseFloat(t[i].width);
          if (window.isNaN(n)) return !1;
          e += n
        }
        return e
      }, _calculateGridWidth: function () {
        for (var t = this.$getConfig(), e = this.getGridColumns(), i = 0, n = [], r = [], o = 0; o < e.length; o++) {
          var a = parseFloat(e[o].width);
          window.isNaN(a) && (a = t.min_grid_column_width || 10, n.push(o)), r[o] = a, i += a
        }
        var s = this._getGridWidth() + 1;
        if (t.autofit || n.length) {
          var l = s - i;
          if (t.autofit) for (o = 0; o < r.length; o++) {
            var c = Math.round(l / (r.length - o));
            r[o] += c, (u = this._getColumnWidth(e[o], t, r[o])) != r[o] && (c = u - r[o], r[o] = u), l -= c
          } else if (n.length) for (o = 0; o < n.length; o++) {
            c = Math.round(l / (n.length - o));
            var u, d = n[o];
            r[d] += c, (u = this._getColumnWidth(e[d], t, r[d])) != r[d] && (c = u - r[d], r[d] = u), l -= c
          }
          for (o = 0; o < r.length; o++) e[o].width = r[o]
        } else {
          var h = s != i;
          this.$config.width = i - 1, t.grid_width = i, h && this.$parent._setContentSize(this.$config.width, this.$config.height)
        }
      }, _renderGridHeader: function () {
        var t = this.$jsgantt, e = this.$getConfig(), i = this.$jsgantt.locale, n = this.$jsgantt.templates,
          r = this.getGridColumns();
        e.rtl && (r = r.reverse());
        for (var o = [], a = 0, s = i.labels, l = e.scale_height - 1, c = 0; c < r.length; c++) {
          var u = c == r.length - 1, d = r[c];
          d.name || (d.name = t.uid() + "");
          var h = 1 * d.width, f = this._getGridWidth();
          u && f > a + h && (d.width = h = f - a), a += h;
          var g = t._sort && d.name == t._sort.name ? "<div class='jsgantt-sort jsgantt-" + t._sort.direction + "'></div>" : "",
            p = ["jsgantt-grid-head-cell", "jsgantt-grid-head-" + d.name, u ? "jsgantt-last-cell" : "", n.grid_header_class(d.name, d)].join(" "),
            _ = "width:" + (h - (u ? 1 : 0)) + "px;", v = d.label || s["column_" + d.name] || s[d.name];
          v = v || "";
          var m = "<div class='" + p + "' style='" + _ + "' " + t._waiAria.gridScaleCellAttrString(d, v) + " data-column-id='" + d.name + "' column_id='" + d.name + "'>" + v + g + "</div>";
          o.push(m)
        }
        this.$grid_scale.style.height = e.scale_height + "px", this.$grid_scale.style.lineHeight = l + "px", this.$grid_scale.innerHTML = o.join(""), this._renderHeaderResizers && this._renderHeaderResizers()
      }, _getGridWidth: function () {
        return this.$config.width
      }, destructor: function () {
        this._clearLayers(this.$jsgantt), this._mouseDelegates && (this._mouseDelegates.destructor(), this._mouseDelegates = null), this.$grid = null, this.$grid_scale = null, this.$grid_data = null, this.$jsgantt = null, this.$config.rowStore && (this.$config.rowStore.detachEvent(this._staticBgHandler), this.$config.rowStore = null), this.callEvent("onDestroy", []), this.detachAllEvents()
      }
    }, r.mixin(l.prototype, s()), t.exports = l
  }, function (t, e) {
    var i;
    i = function () {
      return this
    }();
    try {
      i = i || Function("return this")() || (0, eval)("this")
    } catch (t) {
      "object" == typeof window && (i = window)
    }
    t.exports = i
  }, , function (t, e, i) {
  }, function (t, e, i) {
    var n = i(0);
    t.exports = function t(e, i) {
      e = e || n.event, i = i || n.eventRemove;
      var r = [], o = {
        attach: function (t, i, n, o) {
          r.push({element: t, event: i, callback: n, capture: o}), e(t, i, n, o)
        }, detach: function (t, e, n, o) {
          i(t, e, n, o);
          for (var a = 0; a < r.length; a++) {
            var s = r[a];
            s.element === t && s.event === e && s.callback === n && s.capture === o && (r.splice(a, 1), a--)
          }
        }, detachAll: function () {
          for (var t = r.slice(), e = 0; e < t.length; e++) {
            var i = t[e];
            o.detach(i.element, i.event, i.callback, i.capture), o.detach(i.element, i.event, i.callback, void 0), o.detach(i.element, i.event, i.callback, !1), o.detach(i.element, i.event, i.callback, !0)
          }
          r.splice(0, r.length)
        }, extend: function () {
          return t(this.event, this.eventRemove)
        }
      };
      return window.scopes || (window.scopes = []), window.scopes.push(r), o
    }
  }, , , , function (t, e, i) {
    var n = i(0), r = i(3);

    function o(t, e, i, n, r) {
      return this.date = t, this.unit = e, this.task = i, this.id = n, this.calendar = r, this
    }

    function a(t, e, i, n, r, o) {
      return this.date = t, this.dir = e, this.unit = i, this.task = n, this.id = r, this.calendar = o, this
    }

    function s(t, e, i, n, r, o, a) {
      return this.plannedDate = t, this.duration = e, this.unit = i, this.step = n, this.task = r, this.id = o, this.calendar = a, this
    }

    function l(t, e, i, n) {
      return this.plannedDate = t, this.end_date = e, this.task = i, this.calendar = n, this.unit = null, this.step = null, this
    }

    t.exports = function (t) {
      return {
        getWorkHoursArguments: function () {
          var t = arguments[0];
          return r.isDate(t) ? {date: t} : n.mixin({}, t)
        }, setWorkTimeArguments: function () {
          return arguments[0]
        }, unsetWorkTimeArguments: function () {
          return arguments[0]
        }, isWorkTimeArguments: function () {
          var e, i = arguments[0];
          return i instanceof o ? i : ((e = i.date ? new o(i.date, i.unit, i.task, null, i.calendar) : new o(arguments[0], arguments[1], arguments[2], null, arguments[3])).unit = e.unit || t.config.durationUnit, e)
        }, getClosestWorkTimeArguments: function (e) {
          var i, n = arguments[0];
          return n instanceof a ? n : (i = r.isDate(n) ? new a(n) : new a(n.date, n.dir, n.unit, n.task, null, n.calendar), n.id && (i.task = n), i.dir = n.dir || "any", i.unit = n.unit || t.config.durationUnit, i)
        }, _getStartEndConfig: function (e) {
          var i, n = l;
          return e instanceof n ? e : (r.isDate(e) ? i = new n(arguments[0], arguments[1], arguments[2], arguments[3]) : (i = new n(e.plannedDate, e.end_date, e.task), e.id && (i.task = e)), i.unit = i.unit || t.config.durationUnit, i.step = i.step || t.config.durationStep, i.plannedDate = i.plannedDate || i.start || i.date, i)
        }, getDurationArguments: function (t, e, i, n) {
          return this._getStartEndConfig.apply(this, arguments)
        }, hasDurationArguments: function (t, e, i, n) {
          return this._getStartEndConfig.apply(this, arguments)
        }, calculateEndDateArguments: function (e, i, n, o) {
          var a, l = arguments[0];
          return l instanceof s ? l : (a = r.isDate(l) ? new s(arguments[0], arguments[1], arguments[2], void 0, arguments[3], void 0, arguments[4]) : new s(l.plannedDate, l.duration, l.unit, l.step, l.task, null, l.calendar), l.id && (a.task = l), a.unit = a.unit || t.config.durationUnit, a.step = a.step || t.config.durationStep, a)
        }
      }
    }
  }, function (t, e) {
    function i(t, e, i) {
      for (var n = 0; n < e.length; n++) t.isLinkExists(e[n]) && (i[e[n]] = t.getLink(e[n]))
    }

    function n(t, e, n) {
      i(t, e.$source, n), i(t, e.$target, n)
    }

    t.exports = {
      getSubtreeLinks: function (t, e) {
        var i = {};
        return t.isTaskExists(e) && n(t, t.getTask(e), i), t.eachTask(function (e) {
          n(t, e, i)
        }, e), i
      }, getSubtreeTasks: function (t, e) {
        var i = {};
        return t.eachTask(function (t) {
          i[t.id] = t
        }, e), i
      }
    }
  }, function (t, e, i) {
    var n = i(33);
    t.exports = function (t) {
      (function (t) {
        var e = function (t) {
          var e = t.config.scale_unit, i = t.config.step;
          if (t.config.scale_offset_minimal) {
            var r = new n(t), o = [r.primaryScale()].concat(t.config.subscales);
            r.sortScales(o), e = o[o.length - 1].unit, i = o[o.length - 1].step || 1
          }
          return {unit: e, step: i}
        }(t), i = e.unit, r = e.step, o = function (t, e) {
          var i = {plannedDate: null, end_date: null};
          if (e.config.plannedDate && e.config.end_date) {
            i.plannedDate = e.date[t + "_start"](new Date(e.config.plannedDate));
            var n = new Date(e.config.end_date), r = e.date[t + "_start"](new Date(n));
            n = +n != +r ? e.date.add(r, 1, t) : r, i.end_date = n
          }
          return i
        }(i, t);
        o.plannedDate && o.end_date || ((o = function (t) {
          return t.getSubtaskDates()
        }(t)).plannedDate && o.end_date || (o = {
          plannedDate: new Date,
          end_date: new Date
        }), o.plannedDate = t.date[i + "_start"](o.plannedDate), o.plannedDate = t.calculateEndDate({
          plannedDate: t.date[i + "_start"](o.plannedDate),
          duration: -1,
          unit: i,
          step: r
        }), o.end_date = t.date[i + "_start"](o.end_date), o.end_date = t.calculateEndDate({
          plannedDate: o.end_date,
          duration: 2,
          unit: i,
          step: r
        })), t._min_date = o.plannedDate, t._max_date = o.end_date
      })(t), function (t) {
        if (t.config.fit_tasks) {
          var e = +t._min_date, i = +t._max_date;
          +t._min_date == e && +t._max_date == i || (t.render(), t.callEvent("onScaleAdjusted", []))
        }
      }(t)
    }
  }, function (t, e, i) {
    var n = i(28), r = i(0), o = i(29), a = function (t) {
      return o.apply(this, [t]), this._branches = {}, this.pull = {}, this.$initItem = t.initItem, this.$parentProperty = t.parentProperty || "parent", "function" != typeof t.rootId ? this.$getRootId = function (t) {
        return function () {
          return t
        }
      }(t.rootId || 0) : this.$getRootId = t.rootId, this.$openInitially = t.openInitially, this.visibleOrder = n.$create(), this.fullOrder = n.$create(), this._searchVisibleOrder = {}, this._skip_refresh = !1, this.attachEvent("onFilterItem", function (t, e) {
        var i = !0;
        return this.eachParent(function (t) {
          i = i && t.$open && !this._isSplitItem(t)
        }, e), !!i
      }), this
    };
    a.prototype = r.mixin({
      _buildTree: function (t) {
        for (var e = null, i = this.$getRootId(), n = 0, o = t.length; n < o; n++) e = t[n], this.setParent(e, this.getParent(e) || i);
        for (n = 0, o = t.length; n < o; n++) e = t[n], this._add_branch(e), e.$level = this.calculateItemLevel(e), r.defined(e.$open) || (e.$open = r.defined(e.open) ? e.open : this.$openInitially());
        this._updateOrder()
      }, _isSplitItem: function (t) {
        return "split" == t.render && this.hasChild(t.id)
      }, parse: function (t) {
        this.callEvent("onBeforeParse", [t]);
        var e = this._parseInner(t);
        this._buildTree(e), this.filter(), this.callEvent("onParse", [e])
      }, _addItemInner: function (t, e) {
        var i = this.getParent(t);
        r.defined(i) || (i = this.$getRootId(), this.setParent(t, i));
        var n = this.getIndexById(i) + Math.min(Math.max(e, 0), this.visibleOrder.length);
        1 * n !== n && (n = void 0), o.prototype._addItemInner.call(this, t, n), this.setParent(t, i), t.hasOwnProperty("$rendered_parent") && this._move_branch(t, t.$rendered_parent), this._add_branch(t, e)
      }, _changeIdInner: function (t, e) {
        var i = this.getChildren(t), n = this._searchVisibleOrder[t];
        o.prototype._changeIdInner.call(this, t, e);
        var r = this.getParent(e);
        this._replace_branch_child(r, t, e);
        for (var a = 0; a < i.length; a++) this.setParent(this.getItem(i[a]), e);
        this._searchVisibleOrder[e] = n, delete this._branches[t]
      }, _traverseBranches: function (t, e) {
        e = e || this.$getRootId();
        var i = this._branches[e];
        if (i) for (var n = 0; n < i.length; n++) {
          var r = i[n];
          t.call(this, r), this._branches[r] && this._traverseBranches(t, r)
        }
      }, _updateOrder: function (t) {
        this.fullOrder = n.$create(), this._traverseBranches(function (t) {
          this.fullOrder.push(t)
        }), t && o.prototype._updateOrder.call(this, t)
      }, _removeItemInner: function (t) {
        var e = [];
        this.eachItem(function (t) {
          e.push(t)
        }, t), e.push(this.getItem(t));
        for (var i = 0; i < e.length; i++) this._move_branch(e[i], this.getParent(e[i]), null), o.prototype._removeItemInner.call(this, e[i].id), this._move_branch(e[i], this.getParent(e[i]), null)
      }, move: function (t, e, i) {
        var n = arguments[3];
        if (n) {
          if (n === t) return;
          i = this.getParent(n), e = this.getBranchIndex(n)
        }
        if (t != i) {
          i = i || this.$getRootId();
          var r = this.getItem(t), o = this.getParent(r.id), a = this.getChildren(i);
          if (-1 == e && (e = a.length + 1), o == i && this.getBranchIndex(t) == e) return;
          if (!1 !== this.callEvent("onBeforeItemMove", [t, i, e])) {
            this._replace_branch_child(o, t), (a = this.getChildren(i))[e] ? a = a.slice(0, e).concat([t]).concat(a.slice(e)) : a.push(t), this.setParent(r, i), this._branches[i] = a;
            var s = this.calculateItemLevel(r) - r.$level;
            r.$level += s, this.eachItem(function (t) {
              t.$level += s
            }, r.id, this), this._moveInner(this.getIndexById(t), this.getIndexById(i) + e), this.callEvent("onAfterItemMove", [t, i, e]), this.refresh()
          }
        }
      }, getBranchIndex: function (t) {
        for (var e = this.getChildren(this.getParent(t)), i = 0; i < e.length; i++) if (e[i] == t) return i;
        return -1
      }, hasChild: function (t) {
        return r.defined(this._branches[t]) && this._branches[t].length
      }, getChildren: function (t) {
        return r.defined(this._branches[t]) ? this._branches[t] : n.$create()
      }, isChildOf: function (t, e) {
        if (!this.exists(t)) return !1;
        if (e === this.$getRootId()) return !0;
        if (!this.hasChild(e)) return !1;
        var i = this.getItem(t), n = this.getParent(t);
        if (this.getItem(e).$level >= i.$level) return !1;
        for (; i && this.exists(n);) {
          if ((i = this.getItem(n)) && i.id == e) return !0;
          n = this.getParent(i)
        }
        return !1
      }, getSiblings: function (t) {
        if (!this.exists(t)) return n.$create();
        var e = this.getParent(t);
        return this.getChildren(e)
      }, getNextSibling: function (t) {
        for (var e = this.getSiblings(t), i = 0, n = e.length; i < n; i++) if (e[i] == t) return e[i + 1] || null;
        return null
      }, getPrevSibling: function (t) {
        for (var e = this.getSiblings(t), i = 0, n = e.length; i < n; i++) if (e[i] == t) return e[i - 1] || null;
        return null
      }, getParent: function (t) {
        var e;
        return (e = void 0 !== t.id ? t : this.getItem(t)) ? e[this.$parentProperty] : this.$getRootId()
      }, clearAll: function () {
        this._branches = {}, o.prototype.clearAll.call(this)
      }, calculateItemLevel: function (t) {
        var e = 0;
        return this.eachParent(function () {
          e++
        }, t), e
      }, _setParentInner: function (t, e, i) {
        i || (t.hasOwnProperty("$rendered_parent") ? this._move_branch(t, t.$rendered_parent, e) : this._move_branch(t, t[this.$parentProperty], e))
      }, setParent: function (t, e, i) {
        this._setParentInner(t, e, i), t[this.$parentProperty] = e
      }, eachItem: function (t, e) {
        e = e || this.$getRootId();
        var i = this.getChildren(e);
        if (i) for (var n = 0; n < i.length; n++) {
          var r = this.pull[i[n]];
          t.call(this, r), this.hasChild(r.id) && this.eachItem(t, r.id)
        }
      }, eachParent: function (t, e) {
        for (var i = {}, n = e, r = this.getParent(n); this.exists(r);) {
          if (i[r]) throw new Error("Invalid tasks tree. Cyclic reference has been detected on task " + r);
          i[r] = !0, n = this.getItem(r), t.call(this, n), r = this.getParent(n)
        }
      }, _add_branch: function (t, e, i) {
        var r = void 0 === i ? this.getParent(t) : i;
        this.hasChild(r) || (this._branches[r] = n.$create());
        for (var o = this.getChildren(r), a = !1, s = 0, l = o.length; s < l; s++) if (o[s] == t.id) {
          a = !0;
          break
        }
        a || (1 * e == e ? o.splice(e, 0, t.id) : o.push(t.id), t.$rendered_parent = r)
      }, _move_branch: function (t, e, i) {
        this._replace_branch_child(e, t.id), this.exists(i) || i == this.$getRootId() ? this._add_branch(t, void 0, i) : delete this._branches[t.id], t.$level = this.calculateItemLevel(t), this.eachItem(function (t) {
          t.$level = this.calculateItemLevel(t)
        }, t.id)
      }, _replace_branch_child: function (t, e, i) {
        var r = this.getChildren(t);
        if (r && void 0 !== t) {
          for (var o = n.$create(), a = 0; a < r.length; a++) r[a] != e ? o.push(r[a]) : i && o.push(i);
          this._branches[t] = o
        }
      }, sort: function (t, e, i) {
        this.exists(i) || (i = this.$getRootId()), t || (t = "order");
        var n = "string" == typeof t ? function (e, i) {
          return e[t] == i[t] ? 0 : e[t] > i[t] ? 1 : -1
        } : t;
        if (e) {
          var r = n;
          n = function (t, e) {
            return r(e, t)
          }
        }
        var o = this.getChildren(i);
        if (o) {
          for (var a = [], s = o.length - 1; s >= 0; s--) a[s] = this.getItem(o[s]);
          for (a.sort(n), s = 0; s < a.length; s++) o[s] = a[s].id, this.sort(t, e, o[s])
        }
      }, filter: function (t) {
        for (var e in this.pull) this.pull[e].$rendered_parent !== this.getParent(this.pull[e]) && this._move_branch(this.pull[e], this.pull[e].$rendered_parent, this.getParent(this.pull[e]));
        return o.prototype.filter.apply(this, arguments)
      }, open: function (t) {
        this.exists(t) && (this.getItem(t).$open = !0, this.callEvent("onItemOpen", [t]))
      }, close: function (t) {
        this.exists(t) && (this.getItem(t).$open = !1, this.callEvent("onItemClose", [t]))
      }, destructor: function () {
        o.prototype.destructor.call(this), this._branches = null
      }
    }, o.prototype), t.exports = a
  }, function (t, e, i) {
    var n = i(0), r = {
      $create: function (t) {
        return n.mixin(t || [], this)
      }, $removeAt: function (t, e) {
        t >= 0 && this.splice(t, e || 1)
      }, $remove: function (t) {
        this.$removeAt(this.$find(t))
      }, $insertAt: function (t, e) {
        if (e || 0 === e) {
          var i = this.splice(e, this.length - e);
          this[e] = t, this.push.apply(this, i)
        } else this.push(t)
      }, $find: function (t) {
        for (var e = 0; e < this.length; e++) if (t == this[e]) return e;
        return -1
      }, $each: function (t, e) {
        for (var i = 0; i < this.length; i++) t.call(e || this, this[i])
      }, $map: function (t, e) {
        for (var i = 0; i < this.length; i++) this[i] = t.call(e || this, this[i]);
        return this
      }, $filter: function (t, e) {
        for (var i = 0; i < this.length; i++) t.call(e || this, this[i]) || (this.splice(i, 1), i--);
        return this
      }
    };
    t.exports = r
  }, function (t, e, i) {
    var n = i(28), r = i(0), o = i(4), a = function (t) {
      return this.pull = {}, this.$initItem = t.initItem, this.visibleOrder = n.$create(), this.fullOrder = n.$create(), this._skip_refresh = !1, this._filterRule = null, this._searchVisibleOrder = {}, this.$config = t, o(this), this
    };
    a.prototype = {
      _parseInner: function (t) {
        for (var e = null, i = [], n = 0, r = t.length; n < r; n++) e = t[n], this.$initItem && (e = this.$initItem(e)), this.callEvent("onItemLoading", [e]) && (this.pull.hasOwnProperty(e.id) || (this.fullOrder.push(e.id), i.push(e)), this.pull[e.id] = e);
        return i
      }, parse: function (t) {
        this.callEvent("onBeforeParse", [t]);
        var e = this._parseInner(t);
        this.refresh(), this.callEvent("onParse", [e])
      }, getItem: function (t) {
        return this.pull[t]
      }, _updateOrder: function (t) {
        t.call(this.visibleOrder), t.call(this.fullOrder)
      }, updateItem: function (t, e) {
        if (r.defined(e) || (e = this.getItem(t)), !this._skip_refresh && !1 === this.callEvent("onBeforeUpdate", [e.id, e])) return !1;
        this.pull[t] = e, this._skip_refresh || (this.callEvent("onAfterUpdate", [e.id, e]), this.callEvent("onStoreUpdated", [e.id, e, "update"]))
      }, _removeItemInner: function (t) {
        this._updateOrder(function () {
          this.$remove(t)
        }), delete this.pull[t]
      }, removeItem: function (t) {
        var e = this.getItem(t);
        if (!this._skip_refresh && !1 === this.callEvent("onBeforeDelete", [e.id, e])) return !1;
        this._removeItemInner(t), this._skip_refresh || (this.filter(), this.callEvent("onAfterDelete", [e.id, e]), this.callEvent("onStoreUpdated", [e.id, e, "delete"]))
      }, _addItemInner: function (t, e) {
        if (this.exists(t.id)) this.silent(function () {
          this.updateItem(t.id, t)
        }); else {
          var i = this.visibleOrder, n = i.length;
          (!r.defined(e) || e < 0) && (e = n), e > n && (e = Math.min(i.length, e))
        }
        this.pull[t.id] = t, this._skip_refresh || this._updateOrder(function () {
          -1 === this.$find(t.id) && this.$insertAt(t.id, e)
        }), this.filter()
      }, isVisible: function (t) {
        return this.visibleOrder.$find(t) > -1
      }, getVisibleItems: function () {
        return this.getIndexRange()
      }, addItem: function (t, e) {
        return r.defined(t.id) || (t.id = r.uid()), this.$initItem && (t = this.$initItem(t)), !(!this._skip_refresh && !1 === this.callEvent("onBeforeAdd", [t.id, t])) && (this._addItemInner(t, e), this._skip_refresh || (this.callEvent("onAfterAdd", [t.id, t]), this.callEvent("onStoreUpdated", [t.id, t, "add"])), t.id)
      }, _changeIdInner: function (t, e) {
        this.pull[t] && (this.pull[e] = this.pull[t]);
        var i = this._searchVisibleOrder[t];
        this.pull[e].id = e, this._updateOrder(function () {
          this[this.$find(t)] = e
        }), this._searchVisibleOrder[e] = i, delete this._searchVisibleOrder[t], delete this.pull[t]
      }, changeId: function (t, e) {
        this._changeIdInner(t, e), this.callEvent("onIdChange", [t, e])
      }, exists: function (t) {
        return !!this.pull[t]
      }, _moveInner: function (t, e) {
        var i = this.getIdByIndex(t);
        this._updateOrder(function () {
          this.$removeAt(t), this.$insertAt(i, Math.min(this.length, e))
        })
      }, move: function (t, e) {
        var i = this.getIdByIndex(t), n = this.getItem(i);
        this._moveInner(t, e), this._skip_refresh || this.callEvent("onStoreUpdated", [n.id, n, "move"])
      }, clearAll: function () {
        this.pull = {}, this.visibleOrder = n.$create(), this.fullOrder = n.$create(), this._skip_refresh || (this.callEvent("onClearAll", []), this.refresh())
      }, silent: function (t, e) {
        this._skip_refresh = !0, t.call(e || this), this._skip_refresh = !1
      }, arraysEqual: function (t, e) {
        if (t.length !== e.length) return !1;
        for (var i = 0; i < t.length; i++) if (t[i] !== e[i]) return !1;
        return !0
      }, refresh: function (t, e) {
        var i;
        if (!this._skip_refresh && (i = t ? [t, this.pull[t], "paint"] : [null, null, null], !1 !== this.callEvent("onBeforeStoreUpdate", i))) {
          if (t) {
            if (!e) {
              var n = this.visibleOrder;
              this.filter(), this.arraysEqual(n, this.visibleOrder) || (t = void 0)
            }
          } else this.filter();
          i = t ? [t, this.pull[t], "paint"] : [null, null, null], this.callEvent("onStoreUpdated", i)
        }
      }, count: function () {
        return this.fullOrder.length
      }, countVisible: function () {
        return this.visibleOrder.length
      }, sort: function (t) {
      }, serialize: function () {
      }, eachItem: function (t) {
        for (var e = 0; e < this.fullOrder.length; e++) {
          var i = this.pull[this.fullOrder[e]];
          t.call(this, i)
        }
      }, filter: function (t) {
        var e = n.$create();
        this.eachItem(function (t) {
          this.callEvent("onFilterItem", [t.id, t]) && e.push(t.id)
        }), this.visibleOrder = e, this._searchVisibleOrder = {};
        for (var i = 0; i < this.visibleOrder.length; i++) this._searchVisibleOrder[this.visibleOrder[i]] = i
      }, getIndexRange: function (t, e) {
        e = Math.min(e || 1 / 0, this.countVisible() - 1);
        for (var i = [], n = t || 0; n <= e; n++) i.push(this.getItem(this.visibleOrder[n]));
        return i
      }, getItems: function () {
        var t = [];
        for (var e in this.pull) t.push(this.pull[e]);
        return t
      }, getIdByIndex: function (t) {
        return this.visibleOrder[t]
      }, getIndexById: function (t) {
        var e = this._searchVisibleOrder[t];
        return void 0 === e && (e = -1), e
      }, _getNullIfUndefined: function (t) {
        return void 0 === t ? null : t
      }, getFirst: function () {
        return this._getNullIfUndefined(this.visibleOrder[0])
      }, getLast: function () {
        return this._getNullIfUndefined(this.visibleOrder[this.visibleOrder.length - 1])
      }, getNext: function (t) {
        return this._getNullIfUndefined(this.visibleOrder[this.getIndexById(t) + 1])
      }, getPrev: function (t) {
        return this._getNullIfUndefined(this.visibleOrder[this.getIndexById(t) - 1])
      }, destructor: function () {
        this.detachAllEvents(), this.pull = null, this.$initItem = null, this.visibleOrder = null, this.fullOrder = null, this._skip_refresh = null, this._filterRule = null, this._searchVisibleOrder = null
      }
    }, t.exports = a
  }, function (t, e) {
    t.exports = function (t) {
      function e(e, o) {
        if (!t._isAllowedUnscheduledTask(e)) {
          var a = o.getItemPosition(e), s = o.$getConfig(), l = o.$getTemplates(), c = o.getItemHeight(),
            u = t.getTaskType(e.type), d = Math.floor((t.config.row_height - c) / 2);
          u == s.types.milestone && s.link_line_width > 1 && (d += 1), u == s.types.milestone && (a.left -= Math.round(c / 2), a.width = c);
          var h = document.createElement("div"), f = Math.round(a.width);
          o.$config.item_attribute && h.setAttribute(o.$config.item_attribute, e.id), s.show_progress && u != s.types.milestone && function (e, i, n, r, o) {
            var a = 1 * e.progress || 0;
            n = Math.max(n - 2, 0);
            var s = document.createElement("div"), l = Math.round(n * a);
            l = Math.min(n, l), e.progressColor && (s.style.backgroundColor = e.progressColor, s.style.opacity = 1), s.style.width = l + "px", s.className = "jsgantt-task-background", r.rtl && (s.style.position = "absolute", s.style.right = "0px");
            var c = document.createElement("div");
            if (c.className = "jsgantt-task-progress-wrapper", c.appendChild(s), i.appendChild(c), t.config.drag_progress && !t.isReadonly(e)) {
              var u = document.createElement("div"), d = l;
              r.rtl && (d = n - l), u.style.left = d + "px", u.className = "jsgantt-task-progress-drag", s.appendChild(u), i.appendChild(u)
            }
          }(e, h, f, s);
          var g = function (e, i, n) {
            var r = document.createElement("div");
            r.className = "jsgantt-task-content my-tooltip", r.title = "<b>Order ID:</b>" + e.orderId + "<br/>Repeat every " + e.repeat + "<br/>" + e.begin + " - " + e.end;
            var o = document.createAttribute("data-toggle");
            o.value = "tooltip", r.setAttributeNode(o);
            var a = document.createAttribute("data-html");
            return a.value = "true", r.setAttributeNode(a), t.getTaskType(e.type), t.config.types.milestone, r
          }(e);
          e.textColor && (g.style.color = e.textColor), h.appendChild(g);
          var p = function (e, i, n, r) {
            var o = r.$getConfig(), a = ["jsgantt-task-line"];
            i && a.push(i);
            var s = t.getState(), l = t.getTask(n);
            if (t.getTaskType(l.type) == o.types.milestone ? a.push("jsgantt-milestone") : t.getTaskType(l.type) == o.types.project && a.push("jsgantt-project"), a.push("jsgantt-bar-" + t.getTaskType(l.type)), t.isSummaryTask(l) && a.push("jsgantt-dependent-task"), t.isSplitTask(l) && a.push("jsgantt-split-parent"), o.select_task && n == s.selected_task && a.push("jsgantt-selected"), n == s.drag_id && (a.push("jsgantt-drag-" + s.drag_mode), s.touch_drag && a.push("jsgantt-touch-" + s.drag_mode)), s.link_source_id == n && a.push("jsgantt-link-source"), s.link_target_id == n && a.push("jsgantt-link-target"), o.highlight_critical_path && t.isCriticalTask && t.isCriticalTask(l) && a.push("jsgantt-critical-task"), s.link_landing_area && s.link_target_id && s.link_source_id && s.link_target_id != s.link_source_id) {
              var c, u = s.link_source_id, d = s.link_from_start, h = s.link_to_start;
              c = t.isLinkAllowed(u, n, d, h) ? h ? "link_start_allow" : "link_finish_allow" : h ? "link_start_deny" : "link_finish_deny", a.push(c)
            }
            return a.join(" ")
          }(0, l.task_class(e.plannedDate, e.end_date, e), e.id, o);
          (e.color || e.progressColor || e.textColor) && (p += " jsgantt-task-inline-color"), h.className = p;
          var _ = ["left:" + a.left + "px", "top:" + (d + a.top) + "px", "height:" + c + "px", "line-height:" + Math.max(c < 30 ? c - 2 : c, 0) + "px", "width:" + f + "px"];
          e.color && _.push("background-color:" + e.color), e.textColor && _.push("color:" + e.textColor), h.style.cssText = _.join(";");
          var v = function (t, e, r) {
            var o = "jsgantt-left " + n(!s.rtl, t);
            return i(t, r.leftside_text, o)
          }(e, 0, l);
          v && h.appendChild(v), (v = function (t, e, r) {
            var o = "jsgantt-right " + n(!!s.rtl, t);
            return i(t, r.rightside_text, o)
          }(e, 0, l)) && h.appendChild(v), t._waiAria.setTaskBarAttr(e, h);
          var m = t.getState();
          return t.isReadonly(e) || (s.drag_resize && !t.isSummaryTask(e) && u != s.types.milestone && r(h, "jsgantt-task-drag", e, function (t) {
            var e = document.createElement("div");
            return e.className = t, e
          }, s), s.drag_links && s.show_links && r(h, "jsgantt-link-control", e, function (t) {
            var e = document.createElement("div");
            e.className = t, e.style.cssText = ["height:" + c + "px", "line-height:" + c + "px"].join(";");
            var i = document.createElement("div");
            i.className = "jsgantt-link-point";
            var n = !1;
            return m.link_source_id && s.touch && (n = !0), i.style.display = n ? "block" : "", e.appendChild(i), e
          }, s)), h
        }
      }

      function i(t, e, i) {
        if (!e) return null;
        var n = e(t.plannedDate, t.end_date, t);
        if (!n) return null;
        var r = document.createElement("div");
        return r.className = "jsgantt-side-content " + i, r.innerHTML = n, r
      }

      function n(e, i) {
        var n = function (e) {
          return e ? {
            $source: [t.config.links.start_to_start],
            $target: [t.config.links.start_to_start, t.config.links.finish_to_start]
          } : {
            $source: [t.config.links.finish_to_start, t.config.links.finish_to_finish],
            $target: [t.config.links.finish_to_finish]
          }
        }(e);
        for (var r in n) for (var o = i[r], a = 0; a < o.length; a++) for (var s = t.getLink(o[a]), l = 0; l < n[r].length; l++) if (s.type == n[r][l]) return "jsgantt-link-crossing";
        return ""
      }

      function r(e, i, n, r, o) {
        var a, s = t.getState();
        +n.plannedDate >= +s.min_date && ((a = r([i, o.rtl ? "task_right" : "task_left", "task_start_date"].join(" "))).setAttribute("data-bind-property", "plannedDate"), e.appendChild(a)), +n.end_date <= +s.max_date && ((a = r([i, o.rtl ? "task_left" : "task_right", "task_end_date"].join(" "))).setAttribute("data-bind-property", "end_date"), e.appendChild(a))
      }

      return function (i, n) {
        var r = n.$getConfig().type_renderers[t.getTaskType(i.type)], o = e;
        return r ? r.call(t, i, function (e) {
          return o.call(t, e, n)
        }, n) : o.call(t, i, n)
      }
    }
  }, function (t, e, i) {
    var n = i(0), r = i(34), o = i(14), a = i(2), s = function (t) {
      function e(e, i, n, r) {
        var o = t.apply(this, arguments) || this;
        return o.$config.bindLinks = null, o
      }

      return a(e, t), n.mixin(e.prototype, {
        init: function () {
          void 0 === this.$config.bind && (this.$config.bind = this.$getConfig().resource_store), t.prototype.init.apply(this, arguments)
        }, _createLayerConfig: function () {
          var t = this, e = function () {
            return t.isVisible()
          };
          return {
            tasks: [{
              renderer: this.$jsgantt.$ui.layers.resourceRow,
              container: this.$task_bars,
              filter: [e]
            }, {renderer: this.$jsgantt.$ui.layers.taskBg, container: this.$task_bg, filter: [e]}], links: []
          }
        }
      }, !0), n.mixin(e.prototype, o(e), !0), e
    }(r);
    t.exports = s
  }, function (t, e) {
    t.exports = function () {
      return {
        getRowTop: function (t) {
          return t * this.$getConfig().row_height
        }, getItemTop: function (t) {
          if (this.$config.rowStore) {
            var e = this.$config.rowStore;
            if (!e) return 0;
            var i = e.getIndexById(t);
            if (-1 === i && e.getParent && e.exists(t)) {
              var n = e.getParent(t);
              if (e.exists(n)) {
                var r = e.getItem(n);
                if (this.$jsgantt.isSplitTask(r)) return this.getRowTop(e.getIndexById(r.id))
              }
            }
            return this.getRowTop(i)
          }
          return 0
        }
      }
    }
  }, function (t, e, i) {
    var n = i(130);
    t.exports = function (t) {
      var e = new n(t);
      return e.processIgnores = function (e) {
        var i = e.count;
        if (e.ignore_x = {}, t.ignore_time || t.config.skip_off_time) {
          var n = t.ignore_time || function () {
            return !1
          };
          i = 0;
          for (var r = 0; r < e.trace_x.length; r++) n.call(t, e.trace_x[r]) || this._ignore_time_config.call(t, e.trace_x[r], e) ? (e.ignore_x[e.trace_x[r].valueOf()] = !0, e.ignored_colls = !0) : i++
        }
        e.display_count = i
      }, e
    }
  }, function (t, e, i) {
    var n = i(33), r = i(4), o = i(0), a = i(32), s = i(129), l = function (t, e, i, a) {
      this.$config = o.mixin({}, e || {}), this.$scaleHelper = new n(a), this.$jsgantt = a, r(this)
    };

    function c(t, e) {
      for (var i, n, r, o = 0, a = t.length - 1; o <= a;) if (n = +t[i = Math.floor((o + a) / 2)], r = +t[i - 1], n < e) o = i + 1; else {
        if (!(n > e)) {
          for (; +t[i] == +t[i + 1];) i++;
          return i
        }
        if (!isNaN(r) && r < e) return i - 1;
        a = i - 1
      }
      return t.length - 1
    }

    l.prototype = {
      init: function (t) {
        t.innerHTML += "<div class='jsgantt-task' style='width:inherit;height:inherit;'></div>", this.$task = t.childNodes[0], this.$task.innerHTML = "<div class='jsgantt-task-scale'></div><div class='jsgantt-data-area'></div>", this.$task_scale = this.$task.childNodes[0], this.$task_data = this.$task.childNodes[1], this.$task_data.innerHTML = "<div class='jsgantt-task-bg'></div><div class='jsgantt-links-area'></div><div class='jsgantt-bars-area'></div>", this.$task_bg = this.$task_data.childNodes[0], this.$task_links = this.$task_data.childNodes[1], this.$task_bars = this.$task_data.childNodes[2], this._tasks = {
          col_width: 0,
          width: [],
          full_width: 0,
          trace_x: [],
          rendered: {}
        };
        var e = this.$getConfig(), i = e[this.$config.bind + "_attribute"],
          n = e[this.$config.bindLinks + "_attribute"];
        !i && this.$config.bind && (i = this.$config.bind + "_id"), !n && this.$config.bindLinks && (n = this.$config.bindLinks + "_id"), this.$config.item_attribute = i || null, this.$config.link_attribute = n || null;
        var r = this._createLayerConfig();
        this.$config.layers || (this.$config.layers = r.tasks), this.$config.linkLayers || (this.$config.linkLayers = r.links), this._attachLayers(this.$jsgantt), this.callEvent("onReady", [])
      }, setSize: function (t, e) {
        var i = this.$getConfig();
        if (1 * t === t && (this.$config.width = t), 1 * e === e) {
          this.$config.height = e;
          var n = Math.max(this.$config.height - i.scale_height);
          this.$task_data.style.height = n + "px"
        }
        if (this.refresh(), this.$task_bg.style.backgroundImage = "", i.smart_rendering && this.$config.rowStore) {
          var r = this.$config.rowStore;
          this.$task_bg.style.height = i.row_height * r.countVisible() + "px"
        } else this.$task_bg.style.height = "";
        for (var o = this._tasks, a = this.$task_data.childNodes, s = 0, l = a.length; s < l; s++) {
          var c = a[s];
          c.hasAttribute("data-layer") && c.style && (c.style.width = o.full_width + "px")
        }
      }, isVisible: function () {
        return this.$parent && this.$parent.$config ? !this.$parent.$config.hidden : this.$task.offsetWidth
      }, getSize: function () {
        var t = this.$getConfig(), e = this.$config.rowStore, i = e ? t.row_height * e.countVisible() : 0,
          n = this._tasks.full_width;
        return {
          x: this.$config.width,
          y: this.$config.height,
          contentX: this.isVisible() ? n : 0,
          contentY: this.isVisible() ? t.scale_height + i : 0,
          scrollHeight: this.isVisible() ? i : 0,
          scrollWidth: this.isVisible() ? n : 0
        }
      }, scrollTo: function (t, e) {
        this.isVisible() && (1 * e === e && (this.$config.scrollTop = e, this.$task_data.scrollTop = this.$config.scrollTop), 1 * t === t && (this.$task.scrollLeft = t, this.$config.scrollLeft = this.$task.scrollLeft, this._refreshScales()))
      }, _refreshScales: function () {
        if (this.isVisible() && this.$getConfig().smart_scales) {
          var t = this.$config.scrollLeft, e = this.$config.width, i = this._scales;
          this.$task_scale.innerHTML = this._getScaleChunkHtml(i, t, t + e)
        }
      }, _createLayerConfig: function () {
        var t = this, e = function () {
          return t.isVisible()
        };
        return {
          tasks: [{
            expose: !0,
            renderer: this.$jsgantt.$ui.layers.taskBar,
            container: this.$task_bars,
            filter: [e]
          }, {
            renderer: this.$jsgantt.$ui.layers.taskSplitBar,
            filter: [e],
            container: this.$task_bars,
            append: !0
          }, {
            renderer: this.$jsgantt.$ui.layers.taskBg, container: this.$task_bg, filter: [function () {
              return !t.$getConfig().static_background
            }, e]
          }], links: [{expose: !0, renderer: this.$jsgantt.$ui.layers.link, container: this.$task_links, filter: [e]}]
        }
      }, _attachLayers: function (t) {
        this._taskLayers = [], this._linkLayers = [];
        var e = this, i = this.$jsgantt.$services.getService("layers");
        if (this.$config.bind) {
          e.$config.rowStore = e.$jsgantt.getDatastore(e.$config.bind);
          var n = i.getDataRender(this.$config.bind);
          n || (n = i.createDataRender({
            name: this.$config.bind, defaultContainer: function () {
              return e.$task_data
            }
          })), n.container = function () {
            return e.$task_data
          };
          for (var r = this.$config.layers, o = 0; r && o < r.length; o++) {
            "string" == typeof (c = r[o]) && (c = this.$jsgantt.$ui.layers[c]), "function" == typeof c && (c = {renderer: c}), c.host = this;
            var a = n.addLayer(c);
            this._taskLayers.push(a), c.expose && (this._taskRenderer = n.getLayer(a))
          }
          this._initStaticBackgroundRender()
        }
        if (this.$config.bindLinks) {
          e.$config.linkStore = e.$jsgantt.getDatastore(e.$config.bindLinks);
          var s = i.getDataRender(this.$config.bindLinks);
          s || (s = i.createDataRender({
            name: this.$config.bindLinks, defaultContainer: function () {
              return e.$task_data
            }
          }));
          var l = this.$config.linkLayers;
          for (o = 0; l && o < l.length; o++) {
            var c;
            "string" == typeof c && (c = this.$jsgantt.$ui.layers[c]), (c = l[o]).host = this;
            var u = s.addLayer(c);
            this._taskLayers.push(u), l[o].expose && (this._linkRenderer = s.getLayer(u))
          }
        }
      }, _initStaticBackgroundRender: function () {
        var t = this, e = s.create(), i = t.$config.rowStore;
        i && (this._staticBgHandler = i.attachEvent("onStoreUpdated", function (i, n, r) {
          if (null === i && t.isVisible()) {
            var o = t.$getConfig();
            if (o.static_background) {
              var a = t.$jsgantt.getDatastore(t.$config.bind);
              a && e.render(t.$task_bg, o, t.getScale(), o.row_height * a.countVisible())
            }
          }
        }), this.attachEvent("onDestroy", function () {
          e.destroy()
        }), this._initStaticBackgroundRender = function () {
        })
      }, _clearLayers: function (t) {
        var e = this.$jsgantt.$services.getService("layers"), i = e.getDataRender(this.$config.bind),
          n = e.getDataRender(this.$config.bindLinks);
        if (this._taskLayers) for (var r = 0; r < this._taskLayers.length; r++) i.removeLayer(this._taskLayers[r]);
        if (this._linkLayers) for (r = 0; r < this._linkLayers.length; r++) n.removeLayer(this._linkLayers[r]);
        this._linkLayers = [], this._taskLayers = []
      }, _render_tasks_scales: function () {
        var t = this.$getConfig(), e = "", i = 0, n = 0, r = this.$jsgantt.getState();
        if (this.isVisible()) {
          var o = this.$scaleHelper, a = this._getScales();
          n = t.scale_height;
          var s = this.$config.width;
          "x" != t.autosize && "xy" != t.autosize || (s = Math.max(t.autosize_min_width, 0));
          var l = o.prepareConfigs(a, t.min_column_width, s, n - 1, r.min_date, r.max_date, t.rtl),
            c = this._tasks = l[l.length - 1];
          this._scales = l, e = this._getScaleChunkHtml(l, 0, this.$config.width), i = c.full_width + "px", n += "px"
        }
        this.$task_scale.style.height = n, this.$task_data.style.width = this.$task_scale.style.width = i, this.$task_scale.innerHTML = e
      }, _getScaleChunkHtml: function (t, e, i) {
        for (var n = [], r = this.$jsgantt.$services.templates().scale_row_class, o = 0; o < t.length; o++) {
          var a = "jsgantt-scale-line", s = r(t[o]);
          s && (a += " " + s), n.push('<div class="' + a + '" style="height:' + t[o].height + "px;position:relative;line-height:" + t[o].height + 'px">' + this._prepareScaleHtml(t[o], e, i) + "</div>")
        }
        return n.join("")
      }, _prepareScaleHtml: function (t, e, i) {
        var n = this.$getConfig(), r = this.$jsgantt.$services.templates(), o = [], a = null, s = null, l = null;
        (t.template || t.date) && (s = t.template || this.$jsgantt.date.date_to_str(t.date));
        var u = 0, d = t.count;
        !n.smart_scales || isNaN(e) || isNaN(i) || (u = c(t.left, e), d = c(t.left, i) + 1), l = t.css || function () {
        }, !t.css && n.inherit_scale_class && (l = r.scale_cell_class);
        for (var h = u; h < d && t.trace_x[h]; h++) {
          a = new Date(t.trace_x[h]);
          var f = s.call(this, a), g = t.width[h], p = t.height, _ = t.left[h], v = "", m = "", y = "";
          if (g) {
            v = "width:" + g + "px;height:" + p + "px;" + (n.smart_scales ? "position:absolute;left:" + _ + "px" : ""), y = "jsgantt-scale-cell" + (h == t.count - 1 ? " jsgantt-last-cell" : ""), (m = l.call(this, a)) && (y += " " + m);
            var k = "<div class='" + y + "'" + this.$jsgantt._waiAria.getTimelineCellAttr(f) + " style='" + v + "'>" + f + "</div>";
            o.push(k)
          }
        }
        return o.join("")
      }, dateFromPos: function (t) {
        var e = this._tasks;
        if (t < 0 || t > e.full_width || !e.full_width) return null;
        var i = c(this._tasks.left, t), n = this._tasks.left[i], r = e.width[i] || e.col_width, o = 0;
        r && (o = (t - n) / r, e.rtl && (o = 1 - o));
        var a = 0;
        return o && (a = this._getColumnDuration(e, e.trace_x[i])), new Date(e.trace_x[i].valueOf() + Math.round(o * a))
      }, posFromDate: function (t) {
        if (!this.isVisible()) return 0;
        var e = this.columnIndexByDate(t);
        this.$jsgantt.assert(e >= 0, "Invalid day index");
        var i = Math.floor(e), n = e % 1, r = this._tasks.left[Math.min(i, this._tasks.width.length - 1)];
        return i == this._tasks.width.length && (r += this._tasks.width[this._tasks.width.length - 1]), n && (i < this._tasks.width.length ? r += this._tasks.width[i] * (n % 1) : r += 1), Math.round(r)
      }, _getNextVisibleColumn: function (t, e, i) {
        for (var n = +e[t], r = t; i[n];) n = +e[++r];
        return r
      }, _getPrevVisibleColumn: function (t, e, i) {
        for (var n = +e[t], r = t; i[n];) n = +e[--r];
        return r
      }, _getClosestVisibleColumn: function (t, e, i) {
        var n = this._getNextVisibleColumn(t, e, i);
        return e[n] || (n = this._getPrevVisibleColumn(t, e, i)), n
      }, columnIndexByDate: function (t) {
        var e = new Date(t).valueOf(), i = this._tasks.trace_x_ascending, n = this._tasks.ignore_x,
          r = this.$jsgantt.getState();
        if (e <= r.min_date) return this._tasks.rtl ? i.length : 0;
        if (e >= r.max_date) return this._tasks.rtl ? 0 : i.length;
        var o = c(i, e), a = this._getClosestVisibleColumn(o, i, n), s = i[a], l = this._tasks.trace_index_transition;
        if (!s) return l ? l[0] : 0;
        var u = (t - i[a]) / this._getColumnDuration(this._tasks, i[a]);
        return l ? l[a] + (1 - u) : a + u
      }, getItemPosition: function (t, e, i) {
        var n, r, o;
        return this._tasks.rtl ? (r = this.posFromDate(e || t.plannedDate), n = this.posFromDate(i || t.end_date)) : (n = this.posFromDate(e || t.plannedDate), r = this.posFromDate(i || t.end_date)), o = Math.max(r - n, 0), {
          left: n,
          top: this.getItemTop(t.id),
          height: this.getItemHeight(),
          width: o
        }
      }, getItemHeight: function () {
        var t = this.$getConfig(), e = t.task_height;
        if ("full" == e) {
          var i = t.task_height_offset || 5;
          e = t.row_height - i
        }
        return e = Math.min(e, t.row_height), Math.max(e, 0)
      }, getScale: function () {
        return this._tasks
      }, _getScales: function () {
        var t = this.$getConfig(), e = this.$scaleHelper, i = [e.primaryScale()].concat(t.subscales);
        return e.sortScales(i), i
      }, _getColumnDuration: function (t, e) {
        return this.$jsgantt.date.add(e, t.step, t.unit) - e
      }, refresh: function () {
        this.$config.bind && (this.$config.rowStore = this.$jsgantt.getDatastore(this.$config.bind)), this.$config.bindLinks && (this.$config.linkStore = this.$jsgantt.getDatastore(this.$config.bindLinks)), this._initStaticBackgroundRender(), this._render_tasks_scales()
      }, destructor: function () {
        var t = this.$jsgantt;
        this._clearLayers(t), this.$task = null, this.$task_scale = null, this.$task_data = null, this.$task_bg = null, this.$task_links = null, this.$task_bars = null, this.$jsgantt = null, this.$config.rowStore && (this.$config.rowStore.detachEvent(this._staticBgHandler), this.$config.rowStore = null), this.$config.linkStore && (this.$config.linkStore = null), this.callEvent("onDestroy", []), this.detachAllEvents()
      }
    }, o.mixin(l.prototype, a()), t.exports = l
  }, function (t, e, i) {
    var n = i(2), r = i(1), o = function (t) {
      "use strict";

      function e(e, i, n) {
        var r = t.apply(this, arguments) || this;
        return e && (r.$root = !0), r._parseConfig(i), r.$name = "layout", r
      }

      return n(e, t), e.prototype.destructor = function () {
        this.$container && this.$view && r.removeNode(this.$view);
        for (var e = 0; e < this.$cells.length; e++) this.$cells[e].destructor();
        this.$cells = [], t.prototype.destructor.call(this)
      }, e.prototype._resizeScrollbars = function (t, e) {
        var i, n = !1, r = [], o = [];

        function a(t) {
          t.$parent.show(), n = !0, r.push(t)
        }

        function s(t) {
          t.$parent.hide(), n = !0, o.push(t)
        }

        for (var l = 0; l < e.length; l++) t[(i = e[l]).$config.scroll] ? s(i) : i.shouldHide() ? s(i) : i.shouldShow() ? a(i) : i.isVisible() ? r.push(i) : o.push(i);
        var c = {};
        for (l = 0; l < r.length; l++) r[l].$config.group && (c[r[l].$config.group] = !0);
        for (l = 0; l < o.length; l++) (i = o[l]).$config.group && c[i.$config.group] && a(i);
        return n
      }, e.prototype._syncCellSizes = function (t, e) {
        if (t) {
          var i = {};
          return this._eachChild(function (t) {
            t.$config.group && "scrollbar" != t.$name && "resizer" != t.$name && (i[t.$config.group] || (i[t.$config.group] = []), i[t.$config.group].push(t))
          }), i[t] && this._syncGroupSize(i[t], e), i[t]
        }
      }, e.prototype._syncGroupSize = function (t, e) {
        if (t.length) for (var i = t[0].$parent._xLayout ? "width" : "height", n = t[0].$parent.getNextSibling(t[0].$id) ? 1 : -1, r = 0; r < t.length; r++) {
          var o = t[r].getSize(),
            a = n > 0 ? t[r].$parent.getNextSibling(t[r].$id) : t[r].$parent.getPrevSibling(t[r].$id);
          "resizer" == a.$name && (a = n > 0 ? a.$parent.getNextSibling(a.$id) : a.$parent.getPrevSibling(a.$id));
          var s = a.getSize();
          if (a[i]) {
            var l = o.gravity + s.gravity, c = o[i] + s[i], u = l / c;
            t[r].$config.gravity = u * e, a.$config[i] = c - e, a.$config.gravity = l - u * e
          } else t[r].$config[i] = e;
          var d = this.$jsgantt.$ui.getView("grid");
          d && t[r].$content === d && !d.$config.scrollable && (this.$jsgantt.config.grid_width = e)
        }
      }, e.prototype.resize = function (e) {
        var i = !1;
        if (this.$root && !this._resizeInProgress && (this.callEvent("onBeforeResize", []), i = !0, this._resizeInProgress = !0), t.prototype.resize.call(this, !0), t.prototype.resize.call(this, !1), i) {
          var n = [];
          n = (n = (n = n.concat(this.getCellsByType("viewCell"))).concat(this.getCellsByType("viewLayout"))).concat(this.getCellsByType("hostCell"));
          for (var r = this.getCellsByType("scroller"), o = 0; o < n.length; o++) n[o].$config.hidden || n[o].setContentSize();
          var a = this._getAutosizeMode(this.$config.autosize), s = this._resizeScrollbars(a, r);
          if (this.$config.autosize && (this.autosize(this.$config.autosize), s = !0), s) for (this.resize(), o = 0; o < n.length; o++) n[o].$config.hidden || n[o].setContentSize();
          this.callEvent("onResize", [])
        }
        i && (this._resizeInProgress = !1)
      }, e.prototype._eachChild = function (t, e) {
        if (t(e = e || this), e.$cells) for (var i = 0; i < e.$cells.length; i++) this._eachChild(t, e.$cells[i])
      }, e.prototype.isChild = function (t) {
        var e = !1;
        return this._eachChild(function (i) {
          i !== t && i.$content !== t || (e = !0)
        }), e
      }, e.prototype.getCellsByType = function (t) {
        var i = [];
        if (t === this.$name && i.push(this), this.$content && this.$content.$name == t && i.push(this.$content), this.$cells) for (var n = 0; n < this.$cells.length; n++) {
          var r = e.prototype.getCellsByType.call(this.$cells[n], t);
          r.length && i.push.apply(i, r)
        }
        return i
      }, e.prototype.getNextSibling = function (t) {
        var e = this.cellIndex(t);
        return e >= 0 && this.$cells[e + 1] ? this.$cells[e + 1] : null
      }, e.prototype.getPrevSibling = function (t) {
        var e = this.cellIndex(t);
        return e >= 0 && this.$cells[e - 1] ? this.$cells[e - 1] : null
      }, e.prototype.cell = function (t) {
        for (var e = 0; e < this.$cells.length; e++) {
          var i = this.$cells[e];
          if (i.$id === t) return i;
          var n = i.cell(t);
          if (n) return n
        }
      }, e.prototype.cellIndex = function (t) {
        for (var e = 0; e < this.$cells.length; e++) if (this.$cells[e].$id === t) return e;
        return -1
      }, e.prototype.moveView = function (t, e) {
        if (this.$cells[e] !== t) return window.alert("Not implemented");
        e += this.$config.header ? 1 : 0;
        var i = this.$view;
        e >= i.childNodes.length ? i.appendChild(t.$view) : i.insertBefore(t.$view, i.childNodes[e])
      }, e.prototype._parseConfig = function (t) {
        this.$cells = [], this._xLayout = !t.rows;
        for (var e = t.rows || t.cols || t.views, i = 0; i < e.length; i++) {
          var n = e[i];
          n.mode = this._xLayout ? "x" : "y";
          var r = this.$factory.initUI(n, this);
          r ? (r.$parent = this, this.$cells.push(r)) : (e.splice(i, 1), i--)
        }
      }, e.prototype.getCells = function () {
        return this.$cells
      }, e.prototype.render = function () {
        var t = r.insertNode(this.$container, this.$toHTML());
        this.$fill(t, null), this.callEvent("onReady", []), this.resize(), this.render = this.resize
      }, e.prototype.$fill = function (t, e) {
        this.$view = t, this.$parent = e;
        for (var i = r.getChildNodes(t, "jsgantt-layout-cell"), n = i.length - 1; n >= 0; n--) {
          var o = this.$cells[n];
          o.$fill(i[n], this), o.$config.hidden && o.$view.parentNode.removeChild(o.$view)
        }
      }, e.prototype.$toHTML = function () {
        for (var e = this._xLayout ? "x" : "y", i = [], n = 0; n < this.$cells.length; n++) i.push(this.$cells[n].$toHTML());
        return t.prototype.$toHTML.call(this, i.join(""), (this.$root ? "jsgantt-layout-root " : "") + "jsgantt-layout jsgantt-layout-" + e)
      }, e.prototype.getContentSize = function (t) {
        for (var e, i, n, r = 0, o = 0, a = 0; a < this.$cells.length; a++) (i = this.$cells[a]).$config.hidden || (e = i.getContentSize(t), "scrollbar" === i.$config.view && t[i.$config.scroll] && (e.height = 0, e.width = 0), i.$config.resizer && (this._xLayout ? e.height = 0 : e.width = 0), n = i._getBorderSizes(), this._xLayout ? (r += e.width + n.horizontal, o = Math.max(o, e.height + n.vertical)) : (r = Math.max(r, e.width + n.horizontal), o += e.height + n.vertical));
        return r += (n = this._getBorderSizes()).horizontal, o += n.vertical, this.$root && (r += 1, o += 1), {
          width: r,
          height: o
        }
      }, e.prototype._cleanElSize = function (t) {
        return 1 * (t || "").toString().replace("px", "") || 0
      }, e.prototype._getBoxStyles = function (t) {
        var e,
          i = ["width", "height", "paddingTop", "paddingBottom", "paddingLeft", "paddingRight", "borderLeftWidth", "borderRightWidth", "borderTopWidth", "borderBottomWidth"],
          n = {
            boxSizing: "border-box" == (e = window.getComputedStyle ? window.getComputedStyle(t, null) : {
              width: t.clientWidth,
              height: t.clientHeight
            }).boxSizing
          };
        e.MozBoxSizing && (n.boxSizing = "border-box" == e.MozBoxSizing);
        for (var r = 0; r < i.length; r++) n[i[r]] = e[i[r]] ? this._cleanElSize(e[i[r]]) : 0;
        var o = {
          horPaddings: n.paddingLeft + n.paddingRight + n.borderLeftWidth + n.borderRightWidth,
          vertPaddings: n.paddingTop + n.paddingBottom + n.borderTopWidth + n.borderBottomWidth,
          borderBox: n.boxSizing,
          innerWidth: n.width,
          innerHeight: n.height,
          outerWidth: n.width,
          outerHeight: n.height
        };
        return o.borderBox ? (o.innerWidth -= o.horPaddings, o.innerHeight -= o.vertPaddings) : (o.outerWidth += o.horPaddings, o.outerHeight += o.vertPaddings), o
      }, e.prototype._getAutosizeMode = function (t) {
        var e = {x: !1, y: !1};
        return "xy" === t ? e.x = e.y = !0 : "y" === t || !0 === t ? e.y = !0 : "x" === t && (e.x = !0), e
      }, e.prototype.autosize = function (t) {
        var e = this._getAutosizeMode(t), i = this._getBoxStyles(this.$container), n = this.getContentSize(t),
          r = this.$container;
        e.x && (i.borderBox && (n.width += i.horPaddings), r.style.width = n.width + "px"), e.y && (i.borderBox && (n.height += i.vertPaddings), r.style.height = n.height + "px")
      }, e.prototype.getSize = function () {
        this._sizes = [];
        for (var e = 0, i = 0, n = 1e5, r = 0, o = 1e5, a = 0, s = 0; s < this.$cells.length; s++) {
          var l = this._sizes[s] = this.$cells[s].getSize();
          this.$cells[s].$config.hidden || (this._xLayout ? (!l.width && l.minWidth ? e += l.minWidth : e += l.width, n += l.maxWidth, i += l.minWidth, r = Math.max(r, l.height), o = Math.min(o, l.maxHeight), a = Math.max(a, l.minHeight)) : (!l.height && l.minHeight ? r += l.minHeight : r += l.height, o += l.maxHeight, a += l.minHeight, e = Math.max(e, l.width), n = Math.min(n, l.maxWidth), i = Math.max(i, l.minWidth)))
        }
        var c = t.prototype.getSize.call(this);
        return c.maxWidth >= 1e5 && (c.maxWidth = n), c.maxHeight >= 1e5 && (c.maxHeight = o), c.minWidth = c.minWidth != c.minWidth ? 0 : c.minWidth, c.minHeight = c.minHeight != c.minHeight ? 0 : c.minHeight, this._xLayout ? (c.minWidth += this.$config.margin * this.$cells.length || 0, c.minWidth += 2 * this.$config.padding || 0, c.minHeight += 2 * this.$config.padding || 0) : (c.minHeight += this.$config.margin * this.$cells.length || 0, c.minHeight += 2 * this.$config.padding || 0), c
      }, e.prototype._calcFreeSpace = function (t, e, i) {
        var n = i ? e.minWidth : e.minHeight, r = e.maxWidth, o = t;
        return o ? (o > r && (o = r), o < n && (o = n), this._free -= o) : ((o = Math.floor(this._free / this._gravity * e.gravity)) > r && (o = r, this._free -= o, this._gravity -= e.gravity), o < n && (o = n, this._free -= o, this._gravity -= e.gravity)), o
      }, e.prototype._calcSize = function (t, e, i) {
        var n = t, r = i ? e.minWidth : e.minHeight, o = i ? e.maxWidth : e.maxHeight;
        return n || (n = Math.floor(this._free / this._gravity * e.gravity)), n > o && (n = o), n < r && (n = r), n
      }, e.prototype._configureBorders = function () {
        this.$root && this._setBorders([this._borders.left, this._borders.top, this._borders.right, this._borders.bottom], this);
        for (var t = this._xLayout ? this._borders.right : this._borders.bottom, e = this.$cells, i = e.length - 1, n = i; n >= 0; n--) if (!e[n].$config.hidden) {
          i = n;
          break
        }
        for (n = 0; n < e.length; n++) if (!e[n].$config.hidden) {
          var r = n >= i, o = "";
          !r && e[n + 1] && "scrollbar" == e[n + 1].$config.view && (this._xLayout ? r = !0 : o = "jsgantt-layout-cell-border-transparent"), this._setBorders(r ? [] : [t, o], e[n])
        }
      }, e.prototype._updateCellVisibility = function () {
        for (var t, e = this._visibleCells || {}, i = !this._visibleCells, n = {}, r = 0; r < this._sizes.length; r++) t = this.$cells[r], !i && t.$config.hidden && e[t.$id] ? t._hide(!0) : t.$config.hidden || e[t.$id] || t._hide(!1), t.$config.hidden || (n[t.$id] = !0);
        this._visibleCells = n
      }, e.prototype.setSize = function (e, i) {
        this._configureBorders(), t.prototype.setSize.call(this, e, i), i = this.$lastSize.contentY, e = this.$lastSize.contentX;
        var n, r, o = this.$config.padding || 0;
        this.$view.style.padding = o + "px", this._gravity = 0, this._free = this._xLayout ? e : i, this._free -= 2 * o, this._updateCellVisibility();
        for (var a = 0; a < this._sizes.length; a++) if (!(n = this.$cells[a]).$config.hidden) {
          var s = this.$config.margin || 0;
          "resizer" != n.$name || s || (s = -1);
          var l = n.$view, c = this._xLayout ? "marginRight" : "marginBottom";
          a !== this.$cells.length - 1 && (l.style[c] = s + "px", this._free -= s), r = this._sizes[a], this._xLayout ? r.width || (this._gravity += r.gravity) : r.height || (this._gravity += r.gravity)
        }
        for (a = 0; a < this._sizes.length; a++) if (!(n = this.$cells[a]).$config.hidden) {
          var u = (r = this._sizes[a]).width, d = r.height;
          this._xLayout ? this._calcFreeSpace(u, r, !0) : this._calcFreeSpace(d, r, !1)
        }
        for (a = 0; a < this.$cells.length; a++) if (!(n = this.$cells[a]).$config.hidden) {
          r = this._sizes[a];
          var h = void 0, f = void 0;
          this._xLayout ? (h = this._calcSize(r.width, r, !0), f = i - 2 * o) : (h = e - 2 * o, f = this._calcSize(r.height, r, !1)), n.setSize(h, f)
        }
      }, e
    }(i(6));
    t.exports = o
  }, function (t, e) {
    var i, n, r = t.exports = {};

    function o() {
      throw new Error("setTimeout has not been defined")
    }

    function a() {
      throw new Error("clearTimeout has not been defined")
    }

    function s(t) {
      if (i === setTimeout) return setTimeout(t, 0);
      if ((i === o || !i) && setTimeout) return i = setTimeout, setTimeout(t, 0);
      try {
        return i(t, 0)
      } catch (e) {
        try {
          return i.call(null, t, 0)
        } catch (e) {
          return i.call(this, t, 0)
        }
      }
    }

    !function () {
      try {
        i = "function" == typeof setTimeout ? setTimeout : o
      } catch (t) {
        i = o
      }
      try {
        n = "function" == typeof clearTimeout ? clearTimeout : a
      } catch (t) {
        n = a
      }
    }();
    var l, c = [], u = !1, d = -1;

    function h() {
      u && l && (u = !1, l.length ? c = l.concat(c) : d = -1, c.length && f())
    }

    function f() {
      if (!u) {
        var t = s(h);
        u = !0;
        for (var e = c.length; e;) {
          for (l = c, c = []; ++d < e;) l && l[d].run();
          d = -1, e = c.length
        }
        l = null, u = !1, function (t) {
          if (n === clearTimeout) return clearTimeout(t);
          if ((n === a || !n) && clearTimeout) return n = clearTimeout, clearTimeout(t);
          try {
            n(t)
          } catch (e) {
            try {
              return n.call(null, t)
            } catch (e) {
              return n.call(this, t)
            }
          }
        }(t)
      }
    }

    function g(t, e) {
      this.fun = t, this.array = e
    }

    function p() {
    }

    r.nextTick = function (t) {
      var e = new Array(arguments.length - 1);
      if (arguments.length > 1) for (var i = 1; i < arguments.length; i++) e[i - 1] = arguments[i];
      c.push(new g(t, e)), 1 !== c.length || u || s(f)
    }, g.prototype.run = function () {
      this.fun.apply(null, this.array)
    }, r.title = "browser", r.browser = !0, r.env = {}, r.argv = [], r.version = "", r.versions = {}, r.on = p, r.addListener = p, r.once = p, r.off = p, r.removeListener = p, r.removeAllListeners = p, r.emit = p, r.prependListener = p, r.prependOnceListener = p, r.listeners = function (t) {
      return []
    }, r.binding = function (t) {
      throw new Error("process.binding is not supported")
    }, r.cwd = function () {
      return "/"
    }, r.chdir = function (t) {
      throw new Error("process.chdir is not supported")
    }, r.umask = function () {
      return 0
    }
  }, function (t, e) {
    t.exports = function (t, e) {
      if (!e) return !0;
      if (t._on_timeout) return !1;
      var i = Math.ceil(1e3 / e);
      return i < 2 || (setTimeout(function () {
        delete t._on_timeout
      }, i), t._on_timeout = !0, !0)
    }
  }, function (t, e) {
    t.exports = function (t) {
    }
  }, function (t, e) {
    t.exports = function (t) {
      t.destructor = function () {
        for (var e in t.callEvent("onDestroy", []), this.clearAll(), this.$root && delete this.$root.jsgantt, this._eventRemoveAll(), this.$layout && this.$layout.destructor(), this._dp && this._dp.destructor && this._dp.destructor(), this.$services.destructor(), this.detachAllEvents(), this) 0 === e.indexOf("$") && delete this[e]
      }
    }
  }, function (t, e) {
    t.exports = function (t) {
      return function (e, i) {
        e || t.config.show_errors && !1 !== t.callEvent("onError", [i]) && t.message({
          type: "error",
          text: i,
          expire: -1
        })
      }
    }
  }, function (t, e, i) {
    var n = i(1), r = i(3);
    t.exports = function (t) {
      var e = i(26);

      function o(t, e) {
        var i;
        t.event(e, "resize", function () {
          clearTimeout(i), i = setTimeout(function () {
            t.render()
          }, 300)
        })
      }

      t.assert = i(40)(t), t.init = function (t, e, i) {
        e && i && (this.config.plannedDate = this._min_date = new Date(e), this.config.end_date = this._max_date = new Date(i)), this.date.init(), this.config.scroll_size || (this.config.scroll_size = n.getScrollSize() || 1), this.init = function (t) {
          this.$container && this.$container.parentNode && (this.$container.parentNode.removeChild(this.$container), this.$container = null), this.$layout && this.$layout.clear(), this._reinit(t)
        }, this._reinit(t)
      }, t._reinit = function (i) {
        this.callEvent("onBeforeGanttReady", []), this._eventRemoveAll(), this.$mouseEvents.reset(), this._update_flags(), this.$services.getService("templateLoader").initTemplates(this), this._clearTaskLayers(), this._clearLinkLayers(), this.$layout && (this.$layout.destructor(), this.$ui.reset()), this.$root = n.toNode(i), this.$root && (this.$root.innerHTML = ""), this.$root.jsgantt = this, e(this), this.config.layout.id = "main", this.$layout = this.$ui.createView("layout", i, this.config.layout), this.$layout.attachEvent("onBeforeResize", function () {
          for (var e = t.$services.getService("datastores"), i = 0; i < e.length; i++) t.getDatastore(e[i]).filter()
        }), this.$layout.attachEvent("onResize", function () {
          t.refreshData()
        }), this.callEvent("onGanttLayoutReady", []), this.$layout.render(), t.$container = this.$layout.$container.firstChild, function (t) {
          "static" == window.getComputedStyle(t.$root).getPropertyValue("position") && (t.$root.style.position = "relative");
          var e = document.createElement("iframe");
          e.className = "jsgantt-container-resize-watcher", e.tabIndex = -1, t.$root.appendChild(e), e.contentWindow ? o(t, e.contentWindow) : (t.$root.removeChild(e), o(t, window))
        }(t), this.callEvent("onTemplatesReady", []), this.$mouseEvents.reset(this.$root), this.callEvent("onGanttReady", []), this.render()
      }, t.$click = {
        buttons: {
          edit: function (e) {
            t.showLightbox(e)
          }, delete: function (t) {
          }
        }
      }, t.render = function () {
        this.callEvent("onBeforeGanttRender", []), !this.config.sort && this._sort && (this._sort = void 0);
        var i = this.getScrollState(), n = i ? i.x : 0;
        this._getHorizontalScrollbar() && (n = this._getHorizontalScrollbar().$config.codeScrollLeft || n || 0);
        var r = null;
        if (n && (r = t.dateFromPos(n + this.config.task_scroll_offset)), e(this), this.$layout.$config.autosize = this.config.autosize, this.$layout.resize(), this.config.preserve_scroll && i && n) {
          var o = t.getScrollState();
          +r == +t.dateFromPos(o.x) && o.y == i.y || (r && this.showDate(r), i.y && t.scrollTo(void 0, i.y))
        }
        this.callEvent("onGanttRender", [])
      }, t.setSizes = t.render, t.locate = function (t) {
        var e = n.getTargetNode(t);
        if ((n.getClassName(e) || "").indexOf("jsgantt-task-cell") >= 0) return null;
        var i = arguments[1] || this.config.task_attribute, r = n.locateAttribute(e, i);
        return r ? r.getAttribute(i) : null
      }, t._locate_css = function (t, e, i) {
        return n.locateClassName(t, e, i)
      }, t._locateHTML = function (t, e) {
        return n.locateAttribute(t, e || this.config.task_attribute)
      }, t.getTaskRowNode = function (t) {
        for (var e = this.$grid_data.childNodes, i = this.config.task_attribute, n = 0; n < e.length; n++) if (e[n].getAttribute && e[n].getAttribute(i) == t) return e[n];
        return null
      }, t._get_link_type = function (e, i) {
        var n = null;
        return e && i ? n = t.config.links.start_to_start : !e && i ? n = t.config.links.finish_to_start : e || i ? e && !i && (n = t.config.links.start_to_finish) : n = t.config.links.finish_to_finish, n
      }, t.isLinkAllowed = function (t, e, i, n) {
        var r;
        if (!(r = "object" == typeof t ? t : {source: t, target: e, type: this._get_link_type(i, n)})) return !1;
        if (!(r.source && r.target && r.type)) return !1;
        if (r.source == r.target) return !1;
        var o = !0;
        return this.checkEvent("onLinkValidation") && (o = this.callEvent("onLinkValidation", [r])), o
      }, t._correct_dst_change = function (e, i, n, o) {
        var a = r.getSecondsInUnit(o) * n;
        if (a > 3600 && a < 86400) {
          var s = e.getTimezoneOffset() - i;
          s && (e = t.date.add(e, s, "minute"))
        }
        return e
      }, t.isSplitTask = function (e) {
        return t.assert(e && e instanceof Object, "Invalid argument <b>task</b>=" + e + " of jsgantt.isSplitTask. Task object was expected"), this.$data.tasksStore._isSplitItem(e)
      }, t._is_icon_open_click = function (t) {
        if (!t) return !1;
        var e = t.target;
        if (!e || !e.className) return !1;
        var i = n.getClassName(e);
        return -1 !== i.indexOf("jsgantt-tree-icon") && (-1 !== i.indexOf("jsgantt-close") || -1 !== i.indexOf("jsgantt-open"))
      }
    }
  }, function (t, e) {
    t.exports = function (t) {
      t.locale = {
        date: {
          month_full: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
          month_short: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
          day_full: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          day_short: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        }, labels: {}
      }
    }
  }, function (t, e) {
    t.exports = function (t) {
      function e() {
        var e;
        return t.$ui.getView("timeline") && (e = t.$ui.getView("timeline")._tasks_dnd), e
      }

      t.config.touch_drag = 500, t.config.touch = !0, t.config.touch_feedback = !0, t.config.touch_feedback_duration = 1, t._prevent_touch_scroll = !1, t._touch_feedback = function () {
        t.config.touch_feedback && navigator.vibrate && navigator.vibrate(t.config.touch_feedback_duration)
      }, t.attachEvent("onGanttReady", t.bind(function () {
        if ("force" != this.config.touch && (this.config.touch = this.config.touch && (-1 != navigator.userAgent.indexOf("Mobile") || -1 != navigator.userAgent.indexOf("iPad") || -1 != navigator.userAgent.indexOf("Android") || -1 != navigator.userAgent.indexOf("Touch"))), this.config.touch) {
          var t = !0;
          try {
            document.createEvent("TouchEvent")
          } catch (e) {
            t = !1
          }
          t ? this._touch_events(["touchmove", "touchstart", "touchend"], function (t) {
            return t.touches && t.touches.length > 1 ? null : t.touches[0] ? {
              target: t.target,
              pageX: t.touches[0].pageX,
              pageY: t.touches[0].pageY,
              clientX: t.touches[0].clientX,
              clientY: t.touches[0].clientY
            } : t
          }, function () {
            return !1
          }) : window.navigator.pointerEnabled ? this._touch_events(["pointermove", "pointerdown", "pointerup"], function (t) {
            return "mouse" == t.pointerType ? null : t
          }, function (t) {
            return !t || "mouse" == t.pointerType
          }) : window.navigator.msPointerEnabled && this._touch_events(["MSPointerMove", "MSPointerDown", "MSPointerUp"], function (t) {
            return t.pointerType == t.MSPOINTER_TYPE_MOUSE ? null : t
          }, function (t) {
            return !t || t.pointerType == t.MSPOINTER_TYPE_MOUSE
          })
        }
      }, t));
      var i = [];
      t._touch_events = function (n, r, o) {
        for (var a, s = 0, l = !1, c = !1, u = null, d = null, h = null, f = 0; f < i.length; f++) t.eventRemove(i[f][0], i[f][1], i[f][2]);
        for ((i = []).push([t.$container, n[0], function (i) {
          var n = e();
          if (!o(i) && l) {
            d && clearTimeout(d);
            var h = r(i);
            if (n && (n.drag.id || n.drag.start_drag)) return n.on_mouse_move(h), i.preventDefault && i.preventDefault(), i.cancelBubble = !0, !1;
            if (!t._prevent_touch_scroll) {
              if (h && u) {
                var f = u.pageX - h.pageX, p = u.pageY - h.pageY;
                if (!c && (Math.abs(f) > 5 || Math.abs(p) > 5) && (t._touch_scroll_active = c = !0, s = 0, a = t.getScrollState()), c) {
                  t.scrollTo(a.x + f, a.y + p);
                  var _ = t.getScrollState();
                  if (a.x != _.x && p > 2 * f || a.y != _.y && f > 2 * p) return g(i)
                }
              }
              return g(i)
            }
            return !0
          }
        }]), i.push([this.$container, "contextmenu", function (t) {
          if (l) return g(t)
        }]), i.push([this.$container, n[1], function (i) {
          if (!o(i)) if (i.touches && i.touches.length > 1) l = !1; else {
            u = r(i), t._locate_css(u, "jsgantt-hor-scroll") || t._locate_css(u, "jsgantt-ver-scroll") || (l = !0);
            var n = e();
            d = setTimeout(function () {
              var e = t.locate(u);
              n && e && !t._locate_css(u, "jsgantt-link-control") && !t._locate_css(u, "jsgantt-grid-data") && (n.on_mouse_down(u), n.drag && n.drag.start_drag && (function (e) {
                var i = t._getTaskLayers(), n = t.getTask(e);
                if (n && t.isTaskVisible(e)) for (var r = 0; r < i.length; r++) if ((n = i[r].rendered[e]) && n.getAttribute(t.config.task_attribute) && n.getAttribute(t.config.task_attribute) == e) {
                  var o = n.cloneNode(!0);
                  h = n, i[r].rendered[e] = o, n.style.display = "none", o.className += " jsgantt-drag-move ", n.parentNode.appendChild(o)
                }
              }(e), n._start_dnd(u), t._touch_drag = !0, t.refreshTask(e), t._touch_feedback())), d = null
            }, t.config.touch_drag)
          }
        }]), i.push([this.$container, n[2], function (i) {
          if (!o(i)) {
            d && clearTimeout(d), t._touch_drag = !1, l = !1;
            var n = r(i), a = e();
            if (a && a.on_mouse_up(n), h && (t.refreshTask(t.locate(h)), h.parentNode && (h.parentNode.removeChild(h), t._touch_feedback())), t._touch_scroll_active = l = c = !1, h = null, u && s) {
              var f = new Date;
              f - s < 500 ? (t.$services.getService("mouseEvents").onDoubleClick(u), g(i)) : s = f
            } else s = new Date
          }
        }]), f = 0; f < i.length; f++) t.event(i[f][0], i[f][1], i[f][2]);

        function g(t) {
          return t && t.preventDefault && t.preventDefault(), (t || event).cancelBubble = !0, !1
        }
      }
    }
  }, function (t, e) {
    t.exports = function (t) {
    }
  }, function (t, e) {
    t.exports = function (t) {
    }
  }, function (t, e) {
    t.exports = function (t) {
    }
  }, function (t, e) {
    t.exports = function (t) {
    }
  }, function (t, e) {
    t.exports = function (t) {
    }
  }, function (t, e) {
    t.exports = function (t) {
    }
  }, function (t, e) {
    t.exports = function (t) {
    }
  }, function (t, e) {
    function i(t, e) {
      var i = {
        config: {
          grid_width: 350,
          row_height: 23,
          scale_height: 30,
          link_line_width: 2,
          link_arrow_size: 6,
          lightbox_additional_height: 72
        }, _second_column_width: 95, _third_column_width: 80
      };
      !function (t, e, i) {
        for (var n in e) (void 0 === t[n] || i) && (t[n] = e[n])
      }(e.config, i.config, t);
      var n = e.getGridColumns();
      for (n[1] && !e.defined(n[1].width) && (n[1].width = i._second_column_width), n[2] && !e.defined(n[2].width) && (n[2].width = i._third_column_width), r = 0; r < n.length; r++) {
        var o = n[r];
        "add" == o.name && (o.width || (o.width = 44), e.defined(o.min_width) && e.defined(o.max_width) || (o.min_width = o.min_width || o.width, o.max_width = o.max_width || o.width), o.min_width && (o.min_width = +o.min_width), o.max_width && (o.max_width = +o.max_width), o.width && (o.width = +o.width, o.width = o.min_width && o.min_width > o.width ? o.min_width : o.width, o.width = o.max_width && o.max_width < o.width ? o.max_width : o.width))
      }
      i.config.task_height && (e.config.task_height = i.config.task_height || "full"), i._lightbox_template && (e._lightbox_template = i._lightbox_template), i._redefine_lightbox_buttons && (e.config.buttons_right = i._redefine_lightbox_buttons.buttons_right, e.config.buttons_left = i._redefine_lightbox_buttons.buttons_left)
    }

    t.exports = function (t) {
      t.resetSkin || (t.resetSkin = function () {
        i(!0, this)
      }, t.attachEvent("onGanttLayoutReady", function () {
        i(!1, this)
      }))
    }
  }, function (t, e) {
    t.exports = function (t) {
      function e() {
        return t._cached_functions.update_if_changed(t), t._cached_functions.active || t._cached_functions.activate(), !0
      }

      t._cached_functions = {
        cache: {}, mode: !1, critical_path_mode: !1, wrap_methods: function (t, e) {
          if (e._prefetch_originals) for (var i in e._prefetch_originals) e[i] = e._prefetch_originals[i];
          for (e._prefetch_originals = {}, i = 0; i < t.length; i++) this.prefetch(t[i], e)
        }, prefetch: function (t, e) {
          var i = e[t];
          if (i) {
            var n = this;
            e._prefetch_originals[t] = i, e[t] = function () {
              for (var e = new Array(arguments.length), r = 0, o = arguments.length; r < o; r++) e[r] = arguments[r];
              if (n.active) {
                var a = n.get_arguments_hash(Array.prototype.slice.call(e));
                n.cache[t] || (n.cache[t] = {});
                var s = n.cache[t];
                if (n.has_cached_value(s, a)) return n.get_cached_value(s, a);
                var l = i.apply(this, e);
                return n.cache_value(s, a, l), l
              }
              return i.apply(this, e)
            }
          }
          return i
        }, cache_value: function (t, e, i) {
          this.is_date(i) && (i = new Date(i)), t[e] = i
        }, has_cached_value: function (t, e) {
          return t.hasOwnProperty(e)
        }, get_cached_value: function (t, e) {
          var i = t[e];
          return this.is_date(i) && (i = new Date(i)), i
        }, is_date: function (t) {
          return t && t.getUTCDate
        }, get_arguments_hash: function (t) {
          for (var e = [], i = 0; i < t.length; i++) e.push(this.stringify_argument(t[i]));
          return "(" + e.join(";") + ")"
        }, stringify_argument: function (t) {
          return (t.id ? t.id : this.is_date(t) ? t.valueOf() : t) + ""
        }, activate: function () {
          this.clear(), this.active = !0
        }, deactivate: function () {
          this.clear(), this.active = !1
        }, clear: function () {
          this.cache = {}
        }, setup: function (t) {
          var e = [], i = ["_isProjectEnd", "_getProjectEnd", "_getSlack"];
          "auto" == this.mode ? t.config.highlight_critical_path && (e = i) : !0 === this.mode && (e = i), this.wrap_methods(e, t)
        }, update_if_changed: function (t) {
          (this.critical_path_mode != t.config.highlight_critical_path || this.mode !== t.config.optimize_render) && (this.critical_path_mode = t.config.highlight_critical_path, this.mode = t.config.optimize_render, this.setup(t))
        }
      }, t.attachEvent("onBeforeGanttRender", e), t.attachEvent("onBeforeDataRender", e), t.attachEvent("onBeforeSmartRender", function () {
        e()
      }), t.attachEvent("onBeforeParse", e), t.attachEvent("onDataRender", function () {
        t._cached_functions.deactivate()
      });
      var i = null;
      t.attachEvent("onSmartRender", function () {
        i && clearTimeout(i), i = setTimeout(function () {
          t._cached_functions.deactivate()
        }, 1e3)
      }), t.attachEvent("onBeforeGanttReady", function () {
        return t._cached_functions.update_if_changed(t), !0
      })
    }
  }, function (t, e, i) {
    var n = i(2);
    t.exports = function (t) {
      var e = i(12)(t);

      function r() {
        return e.apply(this, arguments) || this
      }

      return n(r, e), r.prototype.render = function (i) {
        var n = t.config.types, r = t.locale.labels, o = [], a = i.filter || function (t, e) {
          return !n.placeholder || e !== n.placeholder
        };
        for (var s in n) 0 == !a(s, n[s]) && o.push({key: n[s], label: r["type_" + s]});
        i.options = o;
        i.onchange;
        return i.onchange = function () {
        }, e.prototype.render.apply(this, arguments)
      }, r
    }
  }, function (t, e, i) {
    t.exports = function (t) {
      var e = i(53)(t);
      t.getTaskType = function (e) {
        var i = e;
        for (var n in e && "object" == typeof e && (i = e.type), this.config.types) if (this.config.types[n] == i) return i;
        return t.config.types.task
      }, t.form_blocks.typeselect = new e
    }
  }, function (t, e) {
    t.exports = function (t) {
      t._extend_to_optional = function (e) {
        var i = e, n = {
          render: i.render, focus: i.focus, set_value: function (e, r, o, a) {
            var s = t._resolve_default_mapping(a);
            if (!o[s.plannedDate] || "plannedDate" == s.plannedDate && this._isAllowedUnscheduledTask(o)) {
              n.disable(e, a);
              var l = {};
              for (var c in s) l[s[c]] = o[c];
              return i.set_value.call(t, e, r, l, a)
            }
            return n.enable(e, a), i.set_value.call(t, e, r, o, a)
          }, get_value: function (e, n, r) {
            return r.disabled ? {plannedDate: null} : i.get_value.call(t, e, n, r)
          }, update_block: function (e, i) {
            if (t.callEvent("onSectionToggle", [t._lightbox_id, i]), e.style.display = i.disabled ? "none" : "block", i.button) {
              var n = e.previousSibling.querySelector(".jsgantt-custom-button-label"), r = t.locale.labels,
                o = i.disabled ? r[i.name + "-enable-button"] : r[i.name + "-disable-button"];
              n.innerHTML = o
            }
            t.resizeLightbox()
          }, disable: function (t, e) {
            e.disabled = !0, n.update_block(t, e)
          }, enable: function (t, e) {
            e.disabled = !1, n.update_block(t, e)
          }, button_click: function (e, i, r, o) {
            if (!1 !== t.callEvent("onSectionButton", [t._lightbox_id, r])) {
              var a = t._get_typed_lightbox_config()[e];
              a.disabled ? n.enable(o, a) : n.disable(o, a)
            }
          }
        };
        return n
      }, t.form_blocks.duration_optional = t._extend_to_optional(t.form_blocks.duration), t.form_blocks.time_optional = t._extend_to_optional(t.form_blocks.time)
    }
  }, function (t, e, i) {
    var n = i(2), r = i(11);
    t.exports = function (t) {
      var e = i(5)(t);

      function o() {
        return e.apply(this, arguments) || this
      }

      function a(e) {
        return !e || e === t.config.constraint_types.ASAP || e === t.config.constraint_types.ALAP
      }

      function s(t, e) {
        for (var i = a(e), n = 0; n < t.length; n++) t[n].disabled = i
      }

      return n(o, e), o.prototype.render = function (e) {
        var i = (e.height || 30) + "px",
          n = "<div class='jsgantt-cal-ltext jsgantt-section-" + e.name + "' style='height:" + i + ";'>", o = [];
        for (var a in t.config.constraint_types) o.push({
          key: t.config.constraint_types[a],
          label: t.locale.labels[t.config.constraint_types[a]]
        });
        return e.options = e.options || o, n += "<span data-constraint-type-select>" + r.getHtmlSelect(e.options, [{
          key: "data-type",
          value: "constraint-type"
        }]) + "</span>", (n += "<label data-constraint-time-select>" + (t.locale.labels.constraint_date || "Constraint date") + ": " + t.form_blocks.getTimePicker.call(this, e) + "</label>") + "</div>"
      }, o.prototype.set_value = function (e, i, n, r) {
        var o = e.querySelector("[data-constraint-type-select] select"),
          a = e.querySelectorAll("[data-constraint-time-select] select"), l = r._time_format_order,
          c = t._resolve_default_mapping(r);
        o._eventsInitialized || (o.addEventListener("input", function (t) {
          s(a, t.target.value)
        }), o._eventsInitialized = !0);
        var u = n[c.constraint_date] || new Date;
        t.form_blocks._fill_lightbox_select(a, 0, u, l, r);
        var d = n[c.constraint_type] || t.getConstraintType(n);
        o.value = d, s(a, d)
      }, o.prototype.get_value = function (e, i, n) {
        var r = e.querySelector("[data-constraint-type-select] select"),
          o = e.querySelectorAll("[data-constraint-time-select] select"), s = r.value, l = null;
        return a(s) || (l = t.form_blocks.getTimePickerValue(o, n)), {constraint_type: s, constraint_date: l}
      }, o.prototype.focus = function (e) {
        t._focus(e.querySelector("select"))
      }, o
    }
  }, function (t, e, i) {
    var n = i(3), r = i(1), o = i(11), a = i(2);
    t.exports = function (t) {
      var e = i(5)(t), s = {resources: {}, resourcesValues: {}, filter: {}, eventsInitialized: {}};

      function l() {
        return e.apply(this, arguments) || this
      }

      function c(t) {
        return void 0 === t ? ".jsgantt-resource-amount-input" : "[data-checked='" + (t ? "true" : "false") + "'] .jsgantt-resource-amount-input"
      }

      function u(t) {
        return s.resources[t.id]
      }

      function d(t) {
        return s.filter[t.id]
      }

      return t.attachEvent("onAfterLightbox", function () {
        for (var t in s.filter) s.filter[t].checkbox.checked = !1, s.filter[t].input.value = "", s.filter[t].filterApplied = !1;
        s.resourcesValues = {}
      }), a(l, e), l.prototype.render = function (e) {
        var i, n = t.locale.labels.resources_filter_placeholder || e.filter_placeholder || "type to filter",
          r = t.locale.labels.resources_filter_label || "hide empty";
        return i = "<div" + (isNaN(e.height) ? "" : " style='height: " + e.height + "px;'") + ">", i += "<div class='jsgantt-cal-ltext jsgantt-resources-filter'><input type='text' class='jsgantt-resources-filter-input' placeholder='" + n + "'> <label><input class='switch_unsetted' type='checkbox'><span class='matherial_checkbox_icon'></span>" + r + "</label></div>", (i += "<div class='jsgantt-cal_ltext jsgantt-resources' data-name='" + e.name + "'></div>") + "</div>"
      }, l.prototype.set_value = function (e, i, a, l) {
        var h, f = function (t, e) {
          return s.resources[e.id] || (s.resources[e.id] = t.querySelector(".jsgantt-resources")), s.resources[e.id]
        }(e, l), g = "";
        !function (t, e) {
          if (!s.filter[e.id]) {
            var i = t.querySelector(".jsgantt-resources-filter"),
              n = i.querySelector(".jsgantt-resources-filter-input"), r = i.querySelector(".switch_unsetted");
            s.filter[e.id] = {container: i, input: n, checkbox: r, filterApplied: !1}
          }
          s.filter[e.id]
        }(e, l), function (e, i, o, a) {
          if (!s.eventsInitialized[o.id]) {
            var l = function (r) {
              var l, c, u, h, f, g = i[o.map_to], p = d(o);
              f = p.checkbox, h = p.input, u = f.checked, c = h.value.trim(), l = function (e, i, r, o) {
                var a, l;
                if (o) {
                  var c = i[e.map_to] || [];
                  if (n.isArray(c) || (c = [c]), 0 === (c = c.slice()).length) {
                    for (var u in c = [], (l = t.copy(e)).options = [], s.resourcesValues[e.id]) c.push({
                      resource_id: u,
                      value: s.resourcesValues[e.id][u]
                    });
                    if (0 === c.length) return l
                  } else for (var u in s.resourcesValues[e.id]) n.arrayFind(c, function (t) {
                    return t.id == u
                  }) || c.push({resource_id: u, value: s.resourcesValues[e.id][u]});
                  for (var d = {}, h = 0; h < c.length; h++) d[c[h].resource_id] = !0;
                  a = function (t) {
                    if (d[String(t.key)] && ("" === r || t.label.indexOf(r) >= 0)) return t
                  }
                } else {
                  if ("" === r) return e;
                  a = function (t) {
                    if (t.label.indexOf(r) >= 0) return t
                  }
                }
                return (l = t.copy(e)).options = n.arrayFilter(l.options, a), l
              }(o, i, c, u), p.filterApplied = !0, a.form_blocks.resources.set_value(e, g, i, l)
            };
            l = n.throttle(l, 100), d(o).container.addEventListener("keyup", l), d(o).container.addEventListener("input", l, !0), d(o).container.addEventListener("change", l, !0), u(o).addEventListener("input", h), u(o).addEventListener("change", h), t.attachEvent("onResourcesSelectActivated", t.bind(h, u(o))), s.eventsInitialized[o.id] = !0
          }

          function h(e) {
            var i, n = e.target;
            if ("checkbox" === e.target.type) {
              (i = n.parentNode.querySelector(c())).disabled = !n.checked;
              var a = i.getAttribute("data-item-id"), l = r.locateClassName(e, "jsgantt-resource-row"),
                u = l.querySelector(".jsgantt-resource-amount-input");
              if (l.setAttribute("data-checked", n.checked), n.checked) {
                "select" === i.nodeName.toLowerCase() && t.callEvent("onResourcesSelectActivated", [{target: i}]);
                var d = a, h = o.default_value;
                o.options.forEach(function (t) {
                  t.key == d && t.default_value && (h = t.default_value)
                }), u && !u.value && void 0 !== h && (u.value = h, f(o, this)), u.select ? u.select() : u.focus && u.focus()
              } else s.resourcesValues[o.id] && delete s.resourcesValues[o.id][a]
            } else "text" !== e.target.type && "select" !== e.target.nodeName.toLowerCase() || (n.parentNode.parentNode, i = e.target, f(o, this))
          }

          function f(t, e) {
            var i = c(), n = e.querySelectorAll(i);
            s.resourcesValues[t.id] = s.resourcesValues[t.id] || {};
            for (var r = 0; r < n.length; r++) {
              var o = n[r].getAttribute("data-item-id");
              n[r].disabled ? delete s.resourcesValues[t.id][o] : s.resourcesValues[t.id][o] = n[r].value
            }
          }
        }(e, a, l, this), n.forEach(l.options, function (t, e) {
          l.unassigned_value != t.key && (h = function (t, e, i) {
            var r, o = {};
            return e && (n.isArray(e) ? r = n.arrayFind(e, function (t) {
              return t.resource_id == i.key
            }) : e.resource_id == i.key && (r = e), r && (o.value = r.value)), s.resourcesValues[t.id] && s.resourcesValues[t.id][i.key] && (o.value = s.resourcesValues[t.id][i.key]), o
          }(l, i, t), g += ["<label class='jsgantt-resource-row' data-item-id='" + t.key + "' data-checked=" + (h.value ? "true" : "false") + ">", "<input class='jsgantt-resource-toggle' type='checkbox'", h.value ? " checked='checked'" : "", "><div class='jsgantt-resource-cell jsgantt-resource-cell-checkbox'><span class='matherial-checkbox-icon'></span></div>", "<div class='jsgantt-resource-cell jsgantt-resource-cell-label'>", t.label, "</div>", "<div class='jsgantt-resource-cell jsgantt-resource-cell-value'>", function (t, e, i) {
            var n, r = "";
            if (t) return n = [{key: "data-item-id", value: t.key}, {
              key: "class",
              value: "jsgantt-resource-amount-input"
            }], i && n.push({
              key: "disabled",
              value: "disabled"
            }), t.options ? r += o.getHtmlSelect(t.options, n, e) : (n[n.length] = {
              key: "value",
              value: e || ""
            }, r += o.getHtmlInput(n)), r
          }(t, h.value, !h.value), "</div>", "<div class='jsgantt-resource-cell jsgantt-resource-cell-unit'>", t.unit, "</div>", "</label>"].join(""))
        }), f.innerHTML = g, f.style.zoom = "1", f._offsetSizes = f.offsetHeight, f.style.zoom = "", t.resizeLightbox(), t._center_lightbox(t.getLightbox())
      }, l.prototype.get_value = function (t, e, i) {
        var r = u(i), o = [], a = c(!0), l = c(!1), h = d(i), f = e[i.map_to] || [], g = {};
        h.filterApplied && f && f.length > 0 && n.forEach(f, function (t) {
          g[String(t.resource_id)] = t
        });
        for (var p = r.querySelectorAll(a), _ = r.querySelectorAll(l), v = 0; v < _.length; v++) delete g[_[v].getAttribute("data-item-id")];
        for (v = 0; v < p.length; v++) {
          var m = p[v].getAttribute("data-item-id"), y = p[v].value.trim();
          "" !== y && "0" !== y && (delete g[m], o[o.length] = {resource_id: m, value: y})
        }
        for (var k in g) s.resourcesValues[i.id] ? o[o.length] = s.resourcesValues[i.id][k] || g[k] : o[o.length] = g[k];
        return o
      }, l.prototype.focus = function (e) {
        t._focus(e.querySelector(".jsgantt-resources"))
      }, l
    }
  }, function (t, e, i) {
    var n = i(2);
    t.exports = function (t) {
      var e = i(12)(t);

      function r() {
        return e.apply(this, arguments) || this
      }

      function o(e, i) {
        var n = [], r = [];
        i && (n = t.getTaskByTime(), e.allow_root && n.unshift({
          id: t.config.root_id,
          orderId: e.root_label || ""
        }), n = function (e, i, n) {
          var r = i.filter || function () {
            return !0
          };
          e = e.slice(0);
          for (var o = 0; o < e.length; o++) {
            var a = e[o];
            (a.id == n || t.isChildOf(a.id, n) || !1 === r(a.id, a)) && (e.splice(o, 1), o--)
          }
          return e
        }(n, e, i), e.sort && n.sort(e.sort));
        for (var o = e.template || t.templates.task_text, a = 0; a < n.length; a++) {
          var s = o.apply(t, [n[a].plannedDate, n[a].end_date, n[a]]);
          void 0 === s && (s = ""), r.push({key: n[a].id, label: s})
        }
        return e.options = r, e.map_to = e.map_to || "parent", t.form_blocks.select.render.apply(this, arguments)
      }

      return n(r, e), r.prototype.render = function (t) {
        return o(t, !1)
      }, r.prototype.set_value = function (e, i, n, r) {
        var a = document.createElement("div");
        a.innerHTML = o(r, n.id);
        var s = a.removeChild(a.firstChild);
        return e.onselect = null, e.parentNode.replaceChild(s, e), t.form_blocks.select.set_value.apply(t, [s, i, n, r])
      }, r
    }
  }, function (t, e, i) {
    var n = i(2);
    t.exports = function (t) {
      var e = i(5)(t);

      function r() {
        return e.apply(this, arguments) || this
      }

      function o(e, i) {
        var n = e.getElementsByTagName("select"), r = i._time_format_order, o = 0, a = 0;
        if (t.defined(r[3])) {
          var s = n[r[3]], l = parseInt(s.value, 10);
          isNaN(l) && s.hasAttribute("data-value") && (l = parseInt(s.getAttribute("data-value"), 10)), o = Math.floor(l / 60), a = l % 60
        }
        return new Date(n[r[2]].value, n[r[1]].value, n[r[0]].value, o, a)
      }

      function a(t) {
        var e = t.getElementsByTagName("input")[1];
        return (e = parseInt(e.value, 10)) && !window.isNaN(e) || (e = 1), e < 0 && (e *= -1), e
      }

      return n(r, e), r.prototype.render = function (e) {
        var i = "<div class='jsgantt-time-selects'>" + t.form_blocks.getTimePicker.call(this, e) + "</div>",
          n = t.locale.labels[t.config.durationUnit + "s"], r = e.single_date ? " style='display:none'" : "",
          o = e.readonly ? " disabled='disabled'" : "",
          a = "<div class='jsgantt-duration' " + r + "><input type='button' class='jsgantt-duration-dec' value='−'" + o + "><input type='text' value='5' class='jsgantt-duration-value'" + o + " " + t._waiAria.lightboxDurationInputAttrString(e) + "><input type='button' class='jsgantt-duration-inc' value='+'" + o + "> " + n + " <span></span></div>";
        return "<div style='height:" + (e.height || 30) + "px;padding-top:;font-size:inherit;' class='jsgantt-section-time'>" + i + " " + a + "</div>"
      }, r.prototype.set_value = function (e, i, n, r) {
        var s, l, c, u, d = r, h = e.getElementsByTagName("select"), f = e.getElementsByTagName("input"), g = f[1],
          p = [f[0], f[2]], _ = e.getElementsByTagName("span")[0], v = r._time_format_order;

        function m() {
          var i = o.call(t, e, r), s = a.call(t, e, r), l = t.calculateEndDate({plannedDate: i, duration: s, task: n});
          _.innerHTML = t.templates.task_date(l)
        }

        function y(t) {
          var e = g.value;
          e = parseInt(e, 10), window.isNaN(e) && (e = 0), (e += t) < 1 && (e = 1), g.value = e, m()
        }

        p[0].onclick = t.bind(function () {
          y(-1 * t.config.durationStep)
        }, this), p[1].onclick = t.bind(function () {
          y(1 * t.config.durationStep)
        }, this), h[0].onchange = m, h[1].onchange = m, h[2].onchange = m, h[3] && (h[3].onchange = m), g.onkeydown = t.bind(function (e) {
          var i;
          return (i = (e = e || window.event).charCode || e.keyCode || e.which) == t.constants.KEY_CODES.DOWN ? (y(-1 * t.config.durationStep), !1) : i == t.constants.KEY_CODES.UP ? (y(1 * t.config.durationStep), !1) : void window.setTimeout(m, 1)
        }, this), g.onchange = t.bind(m, this), "string" == typeof (s = t._resolve_default_mapping(r)) && (s = {plannedDate: s}), l = n[s.plannedDate] || new Date, c = n[s.end_date] || t.calculateEndDate({
          plannedDate: l,
          duration: 1,
          task: n
        }), u = Math.round(n[s.duration]) || t.calculateDuration({
          plannedDate: l,
          end_date: c,
          task: n
        }), t.form_blocks._fill_lightbox_select(h, 0, l, v, d), g.value = u, m()
      }, r.prototype.get_value = function (e, i, n) {
        var r = o(e, n), s = a(e), l = t.calculateEndDate({plannedDate: r, duration: s, task: i});
        return "string" == typeof t._resolve_default_mapping(n) ? r : {plannedDate: r, end_date: l, duration: s}
      }, r.prototype.focus = function (e) {
        t._focus(e.getElementsByTagName("select")[0])
      }, r
    }
  }, function (t, e, i) {
    var n = i(2);
    t.exports = function (t) {
      var e = i(5)(t);

      function r() {
        return e.apply(this, arguments) || this
      }

      return n(r, e), r.prototype.render = function (t) {
        var e = "<div class='jsgantt-cal-ltext' style='height:" + (t.height || "23") + "px;'>";
        if (t.options && t.options.length) for (var i = 0; i < t.options.length; i++) e += "<label><input type='radio' value='" + t.options[i].key + "' name='" + t.name + "'>" + t.options[i].label + "</label>";
        return e + "</div>"
      }, r.prototype.set_value = function (t, e, i, n) {
        var r;
        n.options && n.options.length && (r = t.querySelector("input[type=radio][value='" + e + "']") || t.querySelector("input[type=radio][value='" + n.default_value + "']")) && (!t._joc_onchange && n.onchange && (t.onchange = n.onchange, t._joc_onchange = !0), r.checked = !0)
      }, r.prototype.get_value = function (t, e) {
        var i = t.querySelector("input[type=radio]:checked");
        return i ? i.value : ""
      }, r.prototype.focus = function (e) {
        t._focus(e.querySelector("input[type=radio]"))
      }, r
    }
  }, function (t, e, i) {
    var n = i(3), r = i(2);
    t.exports = function (t) {
      var e = i(5)(t);

      function o() {
        return e.apply(this, arguments) || this
      }

      return r(o, e), o.prototype.render = function (t) {
        var e = "<div class='jsgantt-cal-ltext' style='height:" + (t.height || "23") + "px;'>";
        if (t.options && t.options.length) for (var i = 0; i < t.options.length; i++) e += "<label><input type='checkbox' value='" + t.options[i].key + "' name='" + t.name + "'>" + t.options[i].label + "</label>";
        return e + "</div>"
      }, o.prototype.set_value = function (t, e, i, r) {
        var o = Array.prototype.slice.call(t.querySelectorAll("input[type=checkbox]"));
        !t._joc_onchange && r.onchange && (t.onchange = r.onchange, t._joc_onchange = !0), n.forEach(o, function (t) {
          t.checked = !!e && e.indexOf(t.value) >= 0
        })
      }, o.prototype.get_value = function (t) {
        return n.arrayMap(Array.prototype.slice.call(t.querySelectorAll("input[type=checkbox]:checked")), function (t) {
          return t.value
        })
      }, o.prototype.focus = function (e) {
        t._focus(e.querySelector("input[type=checkbox]"))
      }, o
    }
  }, function (t, e, i) {
    var n = i(2);
    t.exports = function (t) {
      var e = i(5)(t);

      function r() {
        return e.apply(this, arguments) || this
      }

      return n(r, e), r.prototype.render = function (e) {
        var i = t.form_blocks.getTimePicker.call(this, e),
          n = "<div style='height:" + (e.height || 30) + "px;padding-top:0px;font-size:inherit;text-align:center;' class='jsgantt-section-time'>";
        return n += i, e.single_date ? (i = t.form_blocks.getTimePicker.call(this, e, !0), n += "<span></span>") : n += "<span style='font-weight:normal; font-size:10pt;'> &nbsp;&ndash;&nbsp; </span>", (n += i) + "</div>"
      }, r.prototype.set_value = function (e, i, n, r) {
        var o = r, a = e.getElementsByTagName("select"), s = r._time_format_order;
        if (o.auto_end_date) for (var l = function () {
          d = new Date(a[s[2]].value, a[s[1]].value, a[s[0]].value, 0, 0), h = t.calculateEndDate({
            plannedDate: d,
            duration: 1,
            task: n
          }), t.form_blocks._fill_lightbox_select(a, s.size, h, s, o)
        }, c = 0; c < 4; c++) a[c].onchange = l;
        var u = t._resolve_default_mapping(r);
        "string" == typeof u && (u = {plannedDate: u});
        var d = n[u.plannedDate] || new Date,
          h = n[u.end_date] || t.calculateEndDate({plannedDate: d, duration: 1, task: n});
        t.form_blocks._fill_lightbox_select(a, 0, d, s, o), t.form_blocks._fill_lightbox_select(a, s.size, h, s, o)
      }, r.prototype.get_value = function (e, i, n) {
        var r, o = e.getElementsByTagName("select"), a = n._time_format_order;
        return r = t.form_blocks.getTimePickerValue(o, n), "string" == typeof t._resolve_default_mapping(n) ? r : {
          plannedDate: r,
          end_date: function (e, i, r) {
            var o = t.form_blocks.getTimePickerValue(e, n, i.size);
            return o <= r ? t.date.add(r, t._get_timepicker_step(), "minute") : o
          }(o, a, r)
        }
      }, r.prototype.focus = function (e) {
        t._focus(e.getElementsByTagName("select")[0])
      }, r
    }
  }, function (t, e, i) {
    var n = i(2);
    t.exports = function (t) {
      var e = i(5)(t);

      function r() {
        return e.apply(this, arguments) || this
      }

      return n(r, e), r.prototype.render = function (t) {
        return "<div class='jsgantt-cal-ltext' style='height:" + (t.height || "130") + "px;'><textarea></textarea></div>"
      }, r.prototype.set_value = function (e, i) {
        t.form_blocks.textarea._get_input(e).value = i || ""
      }, r.prototype.get_value = function (e) {
        return t.form_blocks.textarea._get_input(e).value
      }, r.prototype.focus = function (e) {
        var i = t.form_blocks.textarea._get_input(e);
        t._focus(i, !0)
      }, r.prototype._get_input = function (t) {
        return t.querySelector("textarea")
      }, r
    }
  }, function (t, e, i) {
    var n = i(2);
    t.exports = function (t) {
      var e = i(5)(t);

      function r() {
        return e.apply(this, arguments) || this
      }

      return n(r, e), r.prototype.render = function (t) {
        return "<div class='jsgantt-cal-ltext jsgantt-cal-template' style='height:" + (t.height || "30") + "px;'></div>"
      }, r.prototype.set_value = function (t, e) {
        t.innerHTML = e || ""
      }, r.prototype.get_value = function (t) {
        return t.innerHTML || ""
      }, r.prototype.focus = function () {
      }, r
    }
  }, function (t, e, i) {
    t.exports = function (t) {
      i(1);
      var e = i(64)(t), n = i(62)(t), r = i(59)(t), o = i(58)(t);
      t.showLightbox = function (t) {
        alert("Yet to implement")
      }, t.form_blocks = {template: new e, time: new n, duration: new r, parent: new o}
    }
  }, function (t, e, i) {
    var n = i(3);
    t.exports = function (t) {
      t.isUnscheduledTask = function (e) {
        return t.assert(e && e instanceof Object, "Invalid argument <b>task</b>=" + e + " of jsgantt.isUnscheduledTask. Task object was expected"), !!e.unscheduled || !e.plannedDate
      }, t._isAllowedUnscheduledTask = function (e) {
        return !(!e.unscheduled || !t.config.show_unscheduled)
      }, t.isTaskVisible = function (e) {
        if (!this.isTaskExists(e)) return !1;
        var i = this.getTask(e), n = i.plannedDate ? i.plannedDate.valueOf() : null,
          r = i.end_date ? i.end_date.valueOf() : null;
        return !!(t._isAllowedUnscheduledTask(i) || n && r && n <= this._max_date.valueOf() && r >= this._min_date.valueOf()) && !!(t.getGlobalTaskIndex(e) >= 0)
      }, t._getProjectEnd = function () {
        if (t.config.project_end) return t.config.project_end;
        var e = t.getTaskByTime();
        return (e = e.sort(function (t, e) {
          return +t.end_date > +e.end_date ? 1 : -1
        })).length ? e[e.length - 1].end_date : null
      }, t._getProjectStart = function () {
        if (t.config.project_start) return t.config.project_start;
        if (t.config.plannedDate) return t.config.plannedDate;
        if (t.getState().min_date) return t.getState().min_date;
        var e = t.getTaskByTime();
        return (e = e.sort(function (t, e) {
          return +t.plannedDate > +e.plannedDate ? 1 : -1
        })).length ? e[0].plannedDate : null
      }, t._defaultTaskDate = function (e, i) {
        var n = !(!i || i == t.config.root_id) && t.getTask(i), r = null;
        if (n) r = t.config.schedule_from_end ? t.calculateEndDate({
          plannedDate: n.end_date,
          duration: -t.config.durationStep,
          task: e
        }) : n.plannedDate; else if (t.config.schedule_from_end) r = t.calculateEndDate({
          plannedDate: t._getProjectEnd(),
          duration: -t.config.durationStep,
          task: e
        }); else {
          var o = t.getTaskByIndex(0);
          r = o ? o.plannedDate ? o.plannedDate : o.end_date ? t.calculateEndDate({
            plannedDate: o.end_date,
            duration: -t.config.durationStep,
            task: e
          }) : null : t.config.plannedDate || t.getState().min_date
        }
        return t.assert(r, "Invalid dates"), new Date(r)
      }, t._set_default_task_timing = function (e) {
        e.plannedDate = e.plannedDate || t._defaultTaskDate(e, t.getParent(e)), e.duration = e.duration || t.config.durationStep, e.end_date = e.end_date || t.calculateEndDate(e)
      }, t.createTask = function (e, i, n) {
        return e = e || {}, t.defined(e.id) || (e.id = t.uid()), e.plannedDate || (e.plannedDate = t._defaultTaskDate(e, i)), void 0 === e.orderId && (e.orderId = t.locale.labels.new_task), void 0 === e.duration && (e.duration = 1), this.isTaskExists(i) && (this.setParent(e, i, !0), this.getTask(i).$open = !0), this.callEvent("onTaskCreated", [e]) ? (this.config.details_on_create ? (e.$new = !0, this.silent(function () {
          t.$data.tasksStore.addItem(e, n)
        }), this.selectTask(e.id), this.refreshData(), this.showLightbox(e.id)) : this.addTask(e, i, n) && (this.showTask(e.id), this.selectTask(e.id)), e.id) : null
      }, t._update_flags = function (e, i) {
        var n = t.$data.tasksStore;
        void 0 === e ? (this._lightbox_id = null, n.silent(function () {
          n.unselect()
        }), this._tasks_dnd && this._tasks_dnd.drag && (this._tasks_dnd.drag.id = null)) : (this._lightbox_id == e && (this._lightbox_id = i), n.getSelectedId() == e && n.silent(function () {
          n.unselect(e), n.select(i)
        }), this._tasks_dnd && this._tasks_dnd.drag && this._tasks_dnd.drag.id == e && (this._tasks_dnd.drag.id = i))
      }, t._get_task_timing_mode = function (t, e) {
        var i = this.getTaskType(t.type), n = {type: i, $no_start: !1, $no_end: !1};
        return e || i != t.$rendered_type ? (i == this.config.types.project ? n.$no_end = n.$no_start = !0 : i != this.config.types.milestone && (n.$no_end = !(t.end_date || t.duration), n.$no_start = !t.plannedDate, this._isAllowedUnscheduledTask(t) && (n.$no_end = n.$no_start = !1)), n) : (n.$no_start = t.$no_start, n.$no_end = t.$no_end, n)
      }, t._init_task_timing = function (e) {
        var i = t._get_task_timing_mode(e, !0), n = e.$rendered_type != i.type, r = i.type;
        n && (e.$no_start = i.$no_start, e.$no_end = i.$no_end, e.$rendered_type = i.type), n && r != this.config.types.milestone && r == this.config.types.project && this._set_default_task_timing(e), r == this.config.types.milestone && (e.end_date = e.plannedDate), e.plannedDate && e.end_date && (e.duration = this.calculateDuration(e)), e.end_date || (e.end_date = e.plannedDate), e.duration = e.duration || 0
      }, t.isSummaryTask = function (e) {
        t.assert(e && e instanceof Object, "Invalid argument <b>task</b>=" + e + " of jsgantt.isSummaryTask. Task object was expected");
        var i = t._get_task_timing_mode(e);
        return !(!i.$no_end && !i.$no_start)
      }, t.resetProjectDates = function (t) {
        var e = this._get_task_timing_mode(t);
        if (e.$no_end || e.$no_start) {
          var i = this.getSubtaskDates(t.id);
          this._assign_project_dates(t, i.plannedDate, i.end_date)
        }
      }, t.getSubtaskDuration = function (e) {
        var i = 0, n = void 0 !== e ? e : t.config.root_id;
        return this.eachTask(function (e) {
          this.getTaskType(e.type) == t.config.types.project || this.isUnscheduledTask(e) || (i += e.duration)
        }, n), i
      }, t.getSubtaskDates = function (e) {
        var i = null, n = null, r = void 0 !== e ? e : t.config.root_id;
        return this.eachTask(function (e) {
          this.getTaskType(e.type) == t.config.types.project || this.isUnscheduledTask(e) || (e.plannedDate && !e.$no_start && (!i || i > e.plannedDate.valueOf()) && (i = e.plannedDate.valueOf()), e.end_date && !e.$no_end && (!n || n < e.end_date.valueOf()) && (n = e.end_date.valueOf()))
        }, r), {plannedDate: i ? new Date(i) : null, end_date: n ? new Date(n) : null}
      }, t._assign_project_dates = function (t, e, i) {
        var n = this._get_task_timing_mode(t);
        n.$no_start && (t.plannedDate = e && e != 1 / 0 ? new Date(e) : this._defaultTaskDate(t, this.getParent(t))), n.$no_end && (t.end_date = i && i != -1 / 0 ? new Date(i) : this.calculateEndDate({
          plannedDate: t.plannedDate,
          duration: this.config.durationStep,
          task: t
        })), (n.$no_start || n.$no_end) && this._init_task_timing(t)
      }, t._update_parents = function (e, i) {
        if (e) {
          var n = this.getTask(e), r = this.getParent(n), o = this._get_task_timing_mode(n), a = !0;
          if (o.$no_start || o.$no_end) {
            var s = n.plannedDate.valueOf(), l = n.end_date.valueOf();
            t.resetProjectDates(n), s == n.plannedDate.valueOf() && l == n.end_date.valueOf() && (a = !1), a && !i && this.refreshTask(n.id, !0)
          }
          a && r && this.isTaskExists(r) && this._update_parents(r, i)
        }
      }, t.roundDate = function (e) {
        var i = t.getScale();
        n.isDate(e) && (e = {
          date: e,
          unit: i ? i.unit : t.config.durationUnit,
          step: i ? i.step : t.config.durationStep
        });
        var r, o, a, s = e.date, l = e.step, c = e.unit;
        if (!i) return s;
        if (c == i.unit && l == i.step && +s >= +i.min_date && +s <= +i.max_date) a = Math.floor(t.columnIndexByDate(s)), i.trace_x[a] || (a -= 1, i.rtl && (a = 0)), o = new Date(i.trace_x[a]), r = t.date.add(o, l, c); else {
          for (a = Math.floor(t.columnIndexByDate(s)), r = t.date[c + "_start"](new Date(i.min_date)), i.trace_x[a] && (r = t.date[c + "_start"](i.trace_x[a])); +r < +s;) {
            var u = (r = t.date[c + "_start"](t.date.add(r, l, c))).getTimezoneOffset();
            r = t._correct_dst_change(r, u, r, c), t.date[c + "_start"] && (r = t.date[c + "_start"](r))
          }
          o = t.date.add(r, -1 * l, c)
        }
        return e.dir && "future" == e.dir ? r : e.dir && "past" == e.dir ? o : Math.abs(s - o) < Math.abs(r - s) ? o : r
      }, t.correctTaskWorkTime = function (e) {
        t.config.work_time && t.config.correct_work_time && (this.isWorkTime(e.plannedDate, void 0, e) ? this.isWorkTime(new Date(+e.end_date - 1), void 0, e) || (e.end_date = this.calculateEndDate(e)) : (e.plannedDate = this.getClosestWorkTime({
          date: e.plannedDate,
          dir: "future",
          task: e
        }), e.end_date = this.calculateEndDate(e)))
      }, t.attachEvent("onBeforeTaskUpdate", function (e, i) {
        return t._init_task_timing(i), !0
      }), t.attachEvent("onBeforeTaskAdd", function (e, i) {
        return t._init_task_timing(i), !0
      })
    }
  }, function (t, e, i) {
    i(0);
    t.exports = {
      create: function (t, e) {
        return {
          getWorkHours: function (t) {
            return e.getWorkHours(t)
          }, setWorkTime: function (t) {
            return e.setWorkTime(t)
          }, unsetWorkTime: function (t) {
            e.unsetWorkTime(t)
          }, isWorkTime: function (t, i, n) {
            return e.isWorkTime(t, i, n)
          }, getClosestWorkTime: function (t) {
            return e.getClosestWorkTime(t)
          }, calculateDuration: function (t, i, n) {
            return e.calculateDuration(t, i, n)
          }, _hasDuration: function (t, i, n) {
            return e.hasDuration(t, i, n)
          }, calculateEndDate: function (t, i, n, r) {
            return e.calculateEndDate(t, i, n, r)
          }
        }
      }
    }
  }, function (t, e) {
    function i(t, e) {
      this.argumentsHelper = e, this.$jsgantt = t
    }

    i.prototype = {
      getWorkHours: function () {
        return [0, 24]
      }, setWorkTime: function () {
        return !0
      }, unsetWorkTime: function () {
        return !0
      }, isWorkTime: function () {
        return !0
      }, getClosestWorkTime: function (t) {
        return this.argumentsHelper.getClosestWorkTimeArguments.apply(this.argumentsHelper, arguments).date
      }, calculateDuration: function () {
        var t = this.argumentsHelper.getDurationArguments.apply(this.argumentsHelper, arguments), e = t.plannedDate,
          i = t.end_date, n = t.unit, r = t.step;
        return this._calculateDuration(e, i, n, r)
      }, _calculateDuration: function (t, e, i, n) {
        var r = this.$jsgantt.date, o = {week: 6048e5, day: 864e5, hour: 36e5, minute: 6e4}, a = 0;
        if (o[i]) a = Math.round((e - t) / (n * o[i])); else {
          for (var s = new Date(t), l = new Date(e); s.valueOf() < l.valueOf();) a += 1, s = r.add(s, n, i);
          s.valueOf() != e.valueOf() && (a += (l - s) / (r.add(s, n, i) - s))
        }
        return Math.round(a)
      }, hasDuration: function () {
        var t = this.argumentsHelper.getDurationArguments.apply(this.argumentsHelper, arguments), e = t.plannedDate,
          i = t.end_date;
        return !!t.unit && (e = new Date(e), i = new Date(i), e.valueOf() < i.valueOf())
      }, calculateEndDate: function () {
        var t = this.argumentsHelper.calculateEndDateArguments.apply(this.argumentsHelper, arguments),
          e = t.plannedDate, i = t.duration, n = t.unit, r = t.step;
        return this.$jsgantt.date.add(e, r * i, n)
      }
    }, t.exports = i
  }, function (t, e, i) {
    var n = i(24), r = i(68);

    function o(t) {
      this.$jsgantt = t.$jsgantt, this.argumentsHelper = n(this.$jsgantt), this.calendarManager = t, this.$disabledCalendar = new r(this.$jsgantt, this.argumentsHelper)
    }

    o.prototype = {
      _getCalendar: function (t) {
        var e;
        if (this.$jsgantt.$services.config().work_time) {
          var i = this.calendarManager;
          t.task ? e = i.getTaskCalendar(t.task) : t.id ? e = i.getTaskCalendar(t) : t.calendar && (e = t.calendar), e || (e = i.getTaskCalendar())
        } else e = this.$disabledCalendar;
        return e
      }, getWorkHours: function (t) {
        return t = this.argumentsHelper.getWorkHoursArguments.apply(this.argumentsHelper, arguments), this._getCalendar(t).getWorkHours(t.date)
      }, setWorkTime: function (t, e) {
        return t = this.argumentsHelper.setWorkTimeArguments.apply(this.argumentsHelper, arguments), e || (e = this.calendarManager.getCalendar()), e.setWorkTime(t)
      }, unsetWorkTime: function (t, e) {
        return t = this.argumentsHelper.unsetWorkTimeArguments.apply(this.argumentsHelper, arguments), e || (e = this.calendarManager.getCalendar()), e.unsetWorkTime(t)
      }, isWorkTime: function (t, e, i, n) {
        var r = this.argumentsHelper.isWorkTimeArguments.apply(this.argumentsHelper, arguments);
        return this._getCalendar(r).isWorkTime(r)
      }, getClosestWorkTime: function (t) {
        return t = this.argumentsHelper.getClosestWorkTimeArguments.apply(this.argumentsHelper, arguments), this._getCalendar(t).getClosestWorkTime(t)
      }, calculateDuration: function () {
        var t = this.argumentsHelper.getDurationArguments.apply(this.argumentsHelper, arguments);
        return this._getCalendar(t).calculateDuration(t)
      }, hasDuration: function () {
        var t = this.argumentsHelper.hasDurationArguments.apply(this.argumentsHelper, arguments);
        return this._getCalendar(t).hasDuration(t)
      }, calculateEndDate: function (t) {
        return t = this.argumentsHelper.calculateEndDateArguments.apply(this.argumentsHelper, arguments), this._getCalendar(t).calculateEndDate(t)
      }
    }, t.exports = o
  }, function (t, e, i) {
    "use strict";
    Object.defineProperty(e, "__esModule", {value: !0});
    var n = function () {
      function t() {
        this.clear()
      }

      return t.prototype.getItem = function (t, e) {
        var i = this._cache;
        if (i && i[t]) {
          var n = i[t];
          if (void 0 !== n[e]) return n[e]
        }
        return -1
      }, t.prototype.setItem = function (t, e, i) {
        if (t && e) {
          var n = this._cache;
          n && (n[t] || (n[t] = {}), n[t][e] = i)
        }
      }, t.prototype.clear = function () {
        this._cache = {}
      }, t
    }();
    e.WorkUnitsObjectCache = n
  }, function (t, e, i) {
    "use strict";
    Object.defineProperty(e, "__esModule", {value: !0});
    var n = function () {
      function t() {
        this.clear()
      }

      return t.prototype.getItem = function (t, e) {
        if (this._cache.has(t)) {
          var i = this._cache.get(t);
          if (i.has(e)) return i.get(e)
        }
        return -1
      }, t.prototype.setItem = function (t, e, i) {
        if (t && e) {
          var n, r = this._cache;
          r.has(t) ? n = r.get(t) : (n = new Map, r.set(t, n)), n.set(e, i)
        }
      }, t.prototype.clear = function () {
        this._cache = new Map
      }, t
    }();
    e.WorkUnitsMapCache = n
  }, function (t, e, i) {
    "use strict";
    Object.defineProperty(e, "__esModule", {value: !0});
    var n = i(71), r = i(70);
    e.createCacheObject = function () {
      return "undefined" != typeof Map ? new n.WorkUnitsMapCache : new r.WorkUnitsObjectCache
    }
  }, function (t, e, i) {
    var n = i(72), r = i(0);

    function o(t, e) {
      this.argumentsHelper = e, this.$jsgantt = t, this._workingUnitsCache = n.createCacheObject()
    }

    o.prototype = {
      units: ["year", "month", "week", "day", "hour", "minute"], _getUnitOrder: function (t) {
        console.log(t, " >>>>>>>>>>>>>>");
        for (var e = 0, i = this.units.length; e < i; e++) if (this.units[e] == t) return e
      }, _timestamp: function (t) {
        var e = null;
        return t.day || 0 === t.day ? e = t.day : t.date && (e = Date.UTC(t.date.getFullYear(), t.date.getMonth(), t.date.getDate())), e
      }, _checkIfWorkingUnit: function (t, e, i) {
        return void 0 === i && (i = this._getUnitOrder(e)), void 0 === i || !(i && !this._isWorkTime(t, this.units[i - 1], i - 1)) && (!this["_is_work_" + e] || this["_is_work_" + e](t))
      }, _is_work_day: function (t) {
        var e = this._getWorkHours(t);
        return e instanceof Array && e.length > 0
      }, _is_work_hour: function (t) {
        for (var e = this._getWorkHours(t), i = t.getHours(), n = 0; n < e.length; n += 2) {
          if (void 0 === e[n + 1]) return e[n] == i;
          if (i >= e[n] && i < e[n + 1]) return !0
        }
        return !1
      }, _internDatesPull: {}, _nextDate: function (t, e, i) {
        return this.$jsgantt.date.add(t, i, e)
      }, _getWorkUnitsBetweenGeneric: function (t, e, i, n) {
        var r = this.$jsgantt.date, o = new Date(t), a = new Date(e);
        n = n || 1;
        var s, l, c = 0, u = null, d = !1;
        (s = r[i + "_start"](new Date(o))).valueOf() != o.valueOf() && (d = !0);
        var h = !1;
        (l = r[i + "_start"](new Date(e))).valueOf() != e.valueOf() && (h = !0);
        for (var f = !1; o.valueOf() < a.valueOf();) f = (u = this._nextDate(o, i, n)).valueOf() > a.valueOf(), this._isWorkTime(o, i) && ((d || h && f) && (s = r[i + "_start"](new Date(o)), l = r.add(s, n, i)), d ? (d = !1, u = this._nextDate(s, i, n), c += (l.valueOf() - o.valueOf()) / (l.valueOf() - s.valueOf())) : h && f ? (h = !1, c += (a.valueOf() - o.valueOf()) / (l.valueOf() - s.valueOf())) : c++), o = u;
        return c
      }, _getMinutesPerDay: function (t) {
        return 60 * this._getHoursPerDay(t)
      }, _getHoursPerDay: function (t) {
        for (var e = this._getWorkHours(t), i = 0, n = 0; n < e.length; n += 2) i += e[n + 1] - e[n] || 0;
        return i
      }, _getWorkUnitsForRange: function (t, e, i, n) {
        var o, a = 0, s = new Date(t), l = new Date(e);
        for (o = "minute" == i ? r.bind(this._getMinutesPerDay, this) : r.bind(this._getHoursPerDay, this); s.valueOf() < l.valueOf();) this._isWorkTime(s, "day") && (a += o(s)), s = this._nextDate(s, "day", 1);
        return a / n
      }, _getWorkUnitsBetweenQuick: function (t, e, i, n) {
        var r = new Date(t), o = new Date(e);
        n = n || 1;
        var a = new Date(r), s = this.$jsgantt.date.add(this.$jsgantt.date.day_start(new Date(r)), 1, "day");
        if (o.valueOf() <= s.valueOf()) return this._getWorkUnitsBetweenGeneric(t, e, i, n);
        var l = this.$jsgantt.date.day_start(new Date(o)), c = o, u = this._getWorkUnitsBetweenGeneric(a, s, i, n),
          d = this._getWorkUnitsBetweenGeneric(l, c, i, n);
        return u + this._getWorkUnitsForRange(s, l, i, n) + d
      }, _getCalendar: function () {
        return this.worktime
      }, _setCalendar: function (t) {
        this.worktime = t
      }, _tryChangeCalendarSettings: function (t) {
        var e = JSON.stringify(this._getCalendar());
        return t(), !this._isEmptyCalendar(this._getCalendar()) || (this.$jsgantt.assert(!1, "Invalid calendar settings, no worktime available"), this._setCalendar(JSON.parse(e)), this._workingUnitsCache.clear(), !1)
      }, _isEmptyCalendar: function (t) {
        var e = !1, i = [], n = !0;
        for (var r in t.dates) e |= !!t.dates[r], i.push(r);
        var o = [];
        for (r = 0; r < i.length; r++) i[r] < 10 && o.push(i[r]);
        for (o.sort(), r = 0; r < 7; r++) o[r] != r && (n = !1);
        return n ? !e : !(e || t.hours)
      }, getWorkHours: function () {
        var t = this.argumentsHelper.getWorkHoursArguments.apply(this.argumentsHelper, arguments);
        return this._getWorkHours(t.date)
      }, _getWorkHours: function (t) {
        var e = this._timestamp({date: t}), i = !0, n = this._getCalendar();
        return void 0 !== n.dates[e] ? i = n.dates[e] : void 0 !== n.dates[t.getDay()] && (i = n.dates[t.getDay()]), !0 === i ? n.hours : i || []
      }, setWorkTime: function (t) {
        return this._tryChangeCalendarSettings(r.bind(function () {
          var e = void 0 === t.hours || t.hours, i = this._timestamp(t);
          null !== i ? this._getCalendar().dates[i] = e : this._getCalendar().hours = e, this._workingUnitsCache.clear()
        }, this))
      }, unsetWorkTime: function (t) {
        return this._tryChangeCalendarSettings(r.bind(function () {
          if (t) {
            var e = this._timestamp(t);
            null !== e && delete this._getCalendar().dates[e]
          } else this.reset_calendar();
          this._workingUnitsCache.clear()
        }, this))
      }, _isWorkTime: function (t, e, i) {
        var n = String(t.valueOf()), r = this._workingUnitsCache.getItem(e, n);
        return -1 == r && (r = this._checkIfWorkingUnit(t, e, i), this._workingUnitsCache.setItem(e, n, r)), r
      }, isWorkTime: function () {
        var t = this.argumentsHelper.isWorkTimeArguments.apply(this.argumentsHelper, arguments);
        return this._isWorkTime(t.date, t.unit)
      }, calculateDuration: function () {
        var t = this.argumentsHelper.getDurationArguments.apply(this.argumentsHelper, arguments);
        return !!t.unit && this._calculateDuration(t.plannedDate, t.end_date, t.unit, t.step)
      }, _calculateDuration: function (t, e, i, n) {
        var r;
        return r = "hour" == i || "minute" == i ? this._getWorkUnitsBetweenQuick(t, e, i, n) : this._getWorkUnitsBetweenGeneric(t, e, i, n), Math.round(r)
      }, hasDuration: function () {
        var t = this.argumentsHelper.getDurationArguments.apply(this.argumentsHelper, arguments), e = t.plannedDate,
          i = t.end_date, n = t.unit, r = t.step;
        if (!n) return !1;
        var o = new Date(e), a = new Date(i);
        for (r = r || 1; o.valueOf() < a.valueOf();) {
          if (this._isWorkTime(o, n)) return !0;
          o = this._nextDate(o, n, r)
        }
        return !1
      }, calculateEndDate: function () {
        var t = this.argumentsHelper.calculateEndDateArguments.apply(this.argumentsHelper, arguments),
          e = t.plannedDate, i = t.duration, n = t.unit, r = t.step;
        if (!n) return !1;
        var o = t.duration >= 0 ? 1 : -1;
        return i = Math.abs(1 * i), this._calculateEndDate(e, i, n, r * o)
      }, _calculateEndDate: function (t, e, i, n) {
        return !!i && (1 == n && "minute" == i ? this._calculateMinuteEndDate(t, e, n) : 1 == n && "hour" == i ? this._calculateHourEndDate(t, e, n) : this._addInterval(t, e, i, n, null).end)
      }, _addInterval: function (t, e, i, n, r) {
        for (var o = 0, a = t; o < e && (!r || !r(a));) {
          var s = this._nextDate(a, i, n);
          this._isWorkTime(n > 0 ? new Date(s.valueOf() - 1) : new Date(s.valueOf() + 1), i) && o++, a = s
        }
        return {end: a, satrt: t, added: o}
      }, _calculateHourEndDate: function (t, e, i) {
        var n = new Date(t), r = 0;
        i = i || 1, e = Math.abs(1 * e);
        var o = this._addInterval(n, e, "hour", i, function (t) {
          return !(t.getHours() || t.getMinutes() || t.getSeconds() || t.getMilliseconds())
        });
        if (r = o.added, n = o.end, (c = e - r) && c > 24) {
          for (var a = n; r < e;) {
            var s = this._nextDate(a, "day", i);
            if (this._isWorkTime(i > 0 ? new Date(s.valueOf() - 1) : new Date(s.valueOf() + 1), "day")) {
              var l = this._getHoursPerDay(a);
              if (r + l >= e) break;
              r += l
            }
            a = s
          }
          n = a
        }
        if (r < e) {
          var c = e - r;
          n = (o = this._addInterval(n, c, "hour", i, null)).end
        }
        return n
      }, _calculateMinuteEndDate: function (t, e, i) {
        var n = new Date(t), r = 0;
        i = i || 1, e = Math.abs(1 * e);
        var o = this._addInterval(n, e, "minute", i, function (t) {
          return !(t.getMinutes() || t.getSeconds() || t.getMilliseconds())
        });
        if (r = o.added, n = o.end, r < e) {
          var a = e - r, s = Math.floor(a / 60);
          s && (n = this._calculateEndDate(n, s, "hour", i > 0 ? 1 : -1), r += 60 * s)
        }
        if (r < e) {
          var l = e - r;
          n = (o = this._addInterval(n, l, "minute", i, null)).end
        }
        return n
      }, getClosestWorkTime: function () {
        var t = this.argumentsHelper.getClosestWorkTimeArguments.apply(this.argumentsHelper, arguments);
        return this._getClosestWorkTime(t.date, t.unit, t.dir)
      }, _getClosestWorkTime: function (t, e, i) {
        var n = new Date(t);
        if (this._isWorkTime(n, e)) return n;
        if (n = this.$jsgantt.date[e + "_start"](n), "any" != i && i) n = "past" == i ? this._getClosestWorkTimePast(n, e) : this._getClosestWorkTimeFuture(n, e); else {
          var r = this._getClosestWorkTimeFuture(n, e), o = this._getClosestWorkTimePast(n, e);
          n = Math.abs(r - t) <= Math.abs(t - o) ? r : o
        }
        return n
      }, _getClosestWorkTimeFuture: function (t, e) {
        return this._getClosestWorkTimeGeneric(t, e, 1)
      }, _getClosestWorkTimePast: function (t, e) {
        var i = this._getClosestWorkTimeGeneric(t, e, -1);
        return this.$jsgantt.date.add(i, 1, e)
      }, _getClosestWorkTimeGeneric: function (t, e, i) {
        for (var n = this._getUnitOrder(e), r = this.units[n - 1], o = t, a = 0; !this._isWorkTime(o, e) && (!r || this._isWorkTime(o, r) || (o = this._getClosestWorkTimeGeneric(o, r, i), !this._isWorkTime(o, e)));) {
          if (++a > 3e3) return this.$jsgantt.assert(!1, "Invalid working time check"), !1;
          var s = o.getTimezoneOffset();
          o = this.$jsgantt.date.add(o, i, e), o = this.$jsgantt._correct_dst_change(o, s, i, e), this.$jsgantt.date[e + "_start"] && (o = this.$jsgantt.date[e + "_start"](o))
        }
        return o
      }
    }, t.exports = o
  }, function (t, e, i) {
    i(0), i(24), i(73);

    function n(t) {
      this.$jsgantt = t, this._calendars = {}
    }

    n.prototype = {
      _calendars: {}, _getDayHoursForMultiple: function (t, e) {
      }, mergeCalendars: function () {
      }, _convertWorktimeSettings: function (t) {
      }, createCalendar: function (t) {
      }, getCalendar: function (t) {
      }, getCalendars: function () {
      }, _getOwnCalendar: function (t) {
      }, getTaskCalendar: function (t) {
      }, addCalendar: function (t) {
      }, deleteCalendar: function (t) {
      }, restoreConfigCalendars: function (t) {
      }, defaults: {}, createDefaultCalendars: function () {
      }
    }, t.exports = n
  }, function (t, e, i) {
    var n = i(74), r = i(69), o = i(67), a = i(0);
    t.exports = function (t) {
      var e = new n(t), i = new r(e), s = o.create(e, i);
      a.mixin(t, s)
    }
  }, function (t, e, i) {
    var n = i(3);
    t.exports = function (t) {
      t.load = function (e, i, n) {
        this._load_url = e, this.assert(arguments.length, "Invalid load arguments");
        var r = "json", o = null;
        return arguments.length >= 3 ? (r = i, o = n) : "string" == typeof arguments[1] ? r = arguments[1] : "function" == typeof arguments[1] && (o = arguments[1]), this._load_type = r, this.callEvent("onLoadStart", [e, r]), this.ajax.get(e, t.bind(function (t) {
          this.on_load(t, r), this.callEvent("onLoadEnd", [e, r]), "function" == typeof o && o.call(this)
        }, this))
      }, t.parse = function (t, e) {
        this.on_load({xmlDoc: {responseText: t}}, e)
      }, t.serialize = function (t) {
        return this[t = t || "json"].serialize()
      }, t.on_load = function (t, e) {
        this.callEvent("onBeforeParse", []), e || (e = "json"), this.assert(this[e], "Invalid data type:'" + e + "'");
        var i = t.xmlDoc.responseText, n = this[e].parse(i, t);
        this._process_loading(n)
      }, t._process_loading = function (t) {
        t.collections && this._load_collections(t.collections), this.$data.tasksStore.parse(t.data);
        var e = t.links || (t.collections ? t.collections.links : []);
        if (this.$data.linksStore.parse(e), this.callEvent("onParse", []), this.render(), this.config.initial_scroll) {
          var i = this.getTaskByIndex(0), n = i ? i.id : this.config.root_id;
          this.isTaskExists(n) && this.showTask(n)
        }
      }, t._load_collections = function (t) {
        var e = !1;
        for (var i in t) if (t.hasOwnProperty(i)) {
          e = !0;
          var n = t[i], r = this.serverList[i];
          if (!r) continue;
          r.splice(0, r.length);
          for (var o = 0; o < n.length; o++) {
            var a = n[o], s = this.copy(a);
            for (var l in s.key = s.value, a) if (a.hasOwnProperty(l)) {
              if ("value" == l || "label" == l) continue;
              s[l] = a[l]
            }
            r.push(s)
          }
        }
        e && this.callEvent("onOptionsLoad", [])
      }, t.attachEvent("onBeforeTaskDisplay", function (t, e) {
        return !e.$ignore
      }), t.json = {
        parse: function (e) {
          return t.assert(e, "Invalid data"), "string" == typeof e && (window.JSON ? e = JSON.parse(e) : t.assert(!1, "JSON is not supported")), e.joc_security && (t.security_key = e.joc_security), e
        }, serializeTask: function (t) {
          return this._copyObject(t)
        }, serializeLink: function (t) {
          return this._copyLink(t)
        }, _copyLink: function (t) {
          var e = {};
          for (var i in t) e[i] = t[i];
          return e
        }, _copyObject: function (e) {
          var i = {};
          for (var r in e) "$" != r.charAt(0) && (i[r] = e[r], n.isDate(i[r]) && (i[r] = t.templates.xml_format(i[r])));
          return i
        }, serialize: function () {
          var e = [], i = [];
          t.eachTask(function (i) {
            t.resetProjectDates(i), e.push(this.serializeTask(i))
          }, t.config.root_id, this);
          for (var n = t.getLinks(), r = 0; r < n.length; r++) i.push(this.serializeLink(n[r]));
          return {data: e, links: i}
        }
      }, t.xml = {
        _xmlNodeToJSON: function (t, e) {
          for (var i = {}, n = 0; n < t.attributes.length; n++) i[t.attributes[n].name] = t.attributes[n].value;
          if (!e) {
            for (n = 0; n < t.childNodes.length; n++) {
              var r = t.childNodes[n];
              1 == r.nodeType && (i[r.tagName] = r.firstChild ? r.firstChild.nodeValue : "")
            }
            i.orderId || (i.orderId = t.firstChild ? t.firstChild.nodeValue : "")
          }
          return i
        }, _getCollections: function (e) {
          for (var i = {}, n = t.ajax.xpath("//coll_options", e), r = 0; r < n.length; r++) for (var o = i[n[r].getAttribute("for")] = [], a = t.ajax.xpath(".//item", n[r]), s = 0; s < a.length; s++) {
            for (var l = a[s].attributes, c = {
              key: a[s].getAttribute("value"),
              label: a[s].getAttribute("label")
            }, u = 0; u < l.length; u++) {
              var d = l[u];
              "value" != d.nodeName && "label" != d.nodeName && (c[d.nodeName] = d.nodeValue)
            }
            o.push(c)
          }
          return i
        }, _getXML: function (e, i, n) {
          n = n || "data", i.getXMLTopNode || (i = t.ajax.parse(i));
          var r = t.ajax.xmltop(n, i.xmlDoc);
          if (!r || r.tagName != n) throw"Invalid XML data";
          var o = r.getAttribute("joc_security");
          return o && (t.security_key = o), r
        }, parse: function (e, i) {
          i = this._getXML(e, i);
          for (var n = {}, r = n.data = [], o = t.ajax.xpath("//task", i), a = 0; a < o.length; a++) r[a] = this._xmlNodeToJSON(o[a]);
          return n.collections = this._getCollections(i), n
        }, _copyLink: function (t) {
          return "<item id='" + t.id + "' source='" + t.source + "' target='" + t.target + "' type='" + t.type + "' />"
        }, _copyObject: function (t) {
          return "<task id='" + t.id + "' parent='" + (t.parent || "") + "' plannedDate='" + t.plannedDate + "' duration='" + t.duration + "' open='" + !!t.open + "' progress='" + t.progress + "' end_date='" + t.end_date + "'><![CDATA[" + t.orderId + "]]></task>"
        }, serialize: function () {
          for (var e = [], i = [], n = t.json.serialize(), r = 0, o = n.data.length; r < o; r++) e.push(this._copyObject(n.data[r]));
          for (r = 0, o = n.links.length; r < o; r++) i.push(this._copyLink(n.links[r]));
          return "<data>" + e.join("") + "<coll_options for='links'>" + i.join("") + "</coll_options></data>"
        }
      }, t.oldxml = {
        parse: function (e, i) {
          i = t.xml._getXML(e, i, "projects");
          for (var n = {collections: {links: []}}, r = n.data = [], o = t.ajax.xpath("//task", i), a = 0; a < o.length; a++) {
            r[a] = t.xml._xmlNodeToJSON(o[a]);
            var s = o[a].parentNode;
            "project" == s.tagName ? r[a].parent = "project-" + s.getAttribute("id") : r[a].parent = s.parentNode.getAttribute("id")
          }
          for (o = t.ajax.xpath("//project", i), a = 0; a < o.length; a++) (l = t.xml._xmlNodeToJSON(o[a], !0)).id = "project-" + l.id, r.push(l);
          for (a = 0; a < r.length; a++) {
            var l;
            (l = r[a]).plannedDate = l.startdate || l.est, l.end_date = l.enddate, l.orderId = l.name, l.duration = l.duration / 8, l.open = 1, l.duration || l.end_date || (l.duration = 1), l.predecessortasks && n.collections.links.push({
              target: l.id,
              source: l.predecessortasks,
              type: t.config.links.finish_to_start
            })
          }
          return n
        }, serialize: function () {
          t.message("Serialization to 'old XML' is not implemented")
        }
      }, t.serverList = function (t, e) {
        return e ? this.serverList[t] = e.slice(0) : this.serverList[t] || (this.serverList[t] = []), this.serverList[t]
      }
    }
  }, function (t, e) {
    t.exports = function (t) {
      t.isReadonly = function (t) {
        return (!t || !t[this.config.editable_property]) && (t && t[this.config.readonly_property] || this.config.readonly)
      }
    }
  }, function (t, e) {
    t.exports = function (t) {
      var e = new RegExp("<(?:.|\n)*?>", "gm"), i = new RegExp(" +", "gm");

      function n(t) {
        return (t + "").replace(e, " ").replace(i, " ")
      }

      var r = new RegExp("'", "gm");

      function o(t) {
        return (t + "").replace(r, "&#39;")
      }

      for (var a in t._waiAria = {
        getAttributeString: function (t) {
          var e = [" "];
          for (var i in t) {
            var r = o(n(t[i]));
            e.push(i + "='" + r + "'")
          }
          return e.push(" "), e.join(" ")
        }, getTimelineCellAttr: function (e) {
          return t._waiAria.getAttributeString({"aria-label": e})
        }, _taskCommonAttr: function (e, i) {
          e.plannedDate && e.end_date && (i.setAttribute("aria-label", n(t.templates.tooltip_text(e.plannedDate, e.end_date, e))), t.isReadonly(e) && i.setAttribute("aria-readonly", !0), e.$dataprocessor_class && i.setAttribute("aria-busy", !0), i.setAttribute("aria-selected", t.getState().selected_task == e.id || t.isSelectedTask && t.isSelectedTask(e.id) ? "true" : "false"))
        }, setTaskBarAttr: function (e, i) {
          this._taskCommonAttr(e, i), !t.isReadonly(e) && t.config.drag_move && (e.id != t.getState().drag_id ? i.setAttribute("aria-grabbed", !1) : i.setAttribute("aria-grabbed", !0))
        }, taskRowAttr: function (e, i) {
          this._taskCommonAttr(e, i), !t.isReadonly(e) && t.config.order_branch && i.setAttribute("aria-grabbed", !1), i.setAttribute("role", "row"), i.setAttribute("aria-level", e.$level), t.hasChild(e.id) && i.setAttribute("aria-expanded", e.$open ? "true" : "false")
        }, linkAttr: function (e, i) {
          var r = t.config.links, o = e.type == r.finish_to_start || e.type == r.start_to_start,
            a = e.type == r.start_to_start || e.type == r.start_to_finish,
            s = t.locale.labels.link + " " + t.templates.drag_link(e.source, a, e.target, o);
          i.setAttribute("aria-label", n(s)), t.isReadonly(e) && i.setAttribute("aria-readonly", !0)
        }, gridSeparatorAttr: function (t) {
          t.setAttribute("role", "separator")
        }, lightboxHiddenAttr: function (t) {
          t.setAttribute("aria-hidden", "true")
        }, lightboxVisibleAttr: function (t) {
          t.setAttribute("aria-hidden", "false")
        }, lightboxAttr: function (t) {
          t.setAttribute("role", "dialog"), t.setAttribute("aria-hidden", "true"), t.firstChild.setAttribute("role", "heading")
        }, lightboxButtonAttrString: function (e) {
          return this.getAttributeString({role: "button", "aria-label": t.locale.labels[e], tabindex: "0"})
        }, lightboxHeader: function (t, e) {
          t.setAttribute("aria-label", e)
        }, lightboxSelectAttrString: function (e) {
          var i = "";
          switch (e) {
            case"%Y":
              i = t.locale.labels.years;
              break;
            case"%m":
              i = t.locale.labels.months;
              break;
            case"%d":
              i = t.locale.labels.days;
              break;
            case"%H:%i":
              i = t.locale.labels.hours + t.locale.labels.minutes
          }
          return t._waiAria.getAttributeString({"aria-label": i})
        }, lightboxDurationInputAttrString: function (e) {
          return this.getAttributeString({"aria-label": t.locale.labels.column_duration, "aria-valuemin": "0"})
        }, gridAttrString: function () {
          return [" role='treegrid'", t.config.multiselect ? "aria-multiselectable='true'" : "aria-multiselectable='false'", " "].join(" ")
        }, gridScaleRowAttrString: function () {
          return "role='row'"
        }, gridScaleCellAttrString: function (e, i) {
          var n = "";
          if ("add" == e.name) n = this.getAttributeString({
            role: "button",
            "aria-label": t.locale.labels.new_task
          }); else {
            var r = {role: "columnheader", "aria-label": i};
            t._sort && t._sort.name == e.name && ("asc" == t._sort.direction ? r["aria-sort"] = "ascending" : r["aria-sort"] = "descending"), n = this.getAttributeString(r)
          }
          return n
        }, gridDataAttrString: function () {
          return "role='rowgroup'"
        }, gridCellAttrString: function (t, e) {
          return this.getAttributeString({role: "gridcell", "aria-label": e})
        }, gridAddButtonAttrString: function (e) {
          return this.getAttributeString({role: "button", "aria-label": t.locale.labels.new_task})
        }, messageButtonAttrString: function (t) {
          return "tabindex='0' role='button' aria-label='" + t + "'"
        }, messageInfoAttr: function (t) {
          t.setAttribute("role", "alert")
        }, messageModalAttr: function (t, e) {
          t.setAttribute("role", "dialog"), e && t.setAttribute("aria-labelledby", e)
        }, quickInfoAttr: function (t) {
          t.setAttribute("role", "dialog")
        }, quickInfoHeaderAttrString: function () {
          return " role='heading' "
        }, quickInfoHeader: function (t, e) {
          t.setAttribute("aria-label", e)
        }, quickInfoButtonAttrString: function (e) {
          return t._waiAria.getAttributeString({role: "button", "aria-label": e, tabindex: "0"})
        }, tooltipAttr: function (t) {
          t.setAttribute("role", "tooltip")
        }, tooltipVisibleAttr: function (t) {
          t.setAttribute("aria-hidden", "false")
        }, tooltipHiddenAttr: function (t) {
          t.setAttribute("aria-hidden", "true")
        }
      }, t._waiAria) t._waiAria[a] = function (e) {
        return function () {
          return t.config.wai_aria_attributes ? e.apply(this, arguments) : ""
        }
      }(t._waiAria[a])
    }
  }, function (t, e) {
    t.exports = function (t) {
      t.getGridColumn = function (e) {
        for (var i = t.config.columns, n = 0; n < i.length; n++) if (i[n].name == e) return i[n];
        return null
      }, t.getGridColumns = function () {
        return t.config.columns.slice()
      }
    }
  }, function (t, e, i) {
    var n = i(16);
    t.exports = function (t) {
      i(79)(t), n.prototype.getGridColumns = function () {
        for (var t = this.$getConfig().columns, e = [], i = 0; i < t.length; i++) t[i].hide || e.push(t[i]);
        return e
      }
    }
  }, function (t, e, i) {
    t.exports = function (t) {
      var e = i(27).prototype.hasChild;
      t.$data.tasksStore.hasChild = function (i) {
        return !!e.apply(this, arguments) || !!this.exists(i) && this.getItem(i)[t.config.branch_loading_property]
      }, t.attachEvent("onTaskOpened", function (e) {
        if (t.config.branch_loading && t._load_url && function (e) {
          return !(!t.config.branch_loading || !t._load_url || t.getUserData(e, "was_rendered") || t.getChildren(e).length || !t.hasChild(e))
        }(e)) {
          var i = t._load_url, n = (i = i.replace(/(\?|&)?parent_id=.+&?/, "")).indexOf("?") >= 0 ? "&" : "?",
            r = t.getScrollState().y || 0;
          t.load(i + n + "parent_id=" + encodeURIComponent(e), this._load_type, function () {
            r && t.scrollTo(null, r)
          }), t.setUserData(e, "was_rendered", !0)
        }
      })
    }
  }, function (t, e) {
    t.exports = function (t) {
      function e(e) {
        return function () {
          return !t.config.auto_types || t.getTaskType(t.config.types.project) != t.config.types.project || e.apply(this, arguments)
        }
      }

      function i(e) {
        t.batchUpdate(function () {
          !function e(i) {
            !function (e) {
              e = e.id || e;
              var i = t.getTask(e), n = o(i);
              !1 !== n && r(i, n)
            }(i);
            var n = t.getParent(i);
            n != t.config.root_id && e(n)
          }(e)
        })
      }

      var n;

      function r(e, i) {
        e.type = i, t.updateTask(e.id)
      }

      function o(e) {
        var i = t.config.types, n = t.hasChild(e.id), r = t.getTaskType(e.type);
        return n && r === i.task ? i.project : !n && r === i.project && i.task
      }

      var a, s, l = !0;

      function c(e) {
        e != t.config.root_id && t.isTaskExists(e) && i(e)
      }

      t.attachEvent("onParse", e(function () {
        l = !1, t.batchUpdate(function () {
          t.eachTask(function (t) {
            var e = o(t);
            !1 !== e && r(t, e)
          })
        }), l = !0
      })), t.attachEvent("onAfterTaskAdd", e(function (t) {
        l && i(t)
      })), t.attachEvent("onAfterTaskUpdate", e(function (t) {
        l && i(t)
      })), t.attachEvent("onBeforeTaskDelete", e(function (e, i) {
        return n = t.getParent(e), !0
      })), t.attachEvent("onAfterTaskDelete", e(function (t, e) {
        c(n)
      })), t.attachEvent("onRowDragStart", e(function (e, i, n) {
        return a = t.getParent(e), !0
      })), t.attachEvent("onRowDragEnd", e(function (t, e) {
        c(a), i(t)
      })), t.attachEvent("onBeforeTaskMove", e(function (e, i, n) {
        return s = t.getParent(e), !0
      })), t.attachEvent("onAfterTaskMove", e(function (t, e, n) {
        document.querySelector(".jsgantt-drag-marker") || (c(s), i(t))
      }))
    }
  }, function (t, e) {
    t.exports = function (t) {
      function e(e) {
        return function () {
          return !t.config.placeholder_task || e.apply(this, arguments)
        }
      }

      function i() {
        var e = t.getTaskBy("type", t.config.types.placeholder);
        if (!e.length || !t.isTaskExists(e[0].id)) {
          var i = {unscheduled: !0, type: t.config.types.placeholder, duration: 0, orderId: t.locale.labels.new_task};
          if (!1 === t.callEvent("onTaskCreated", [i])) return;
          t.addTask(i)
        }
      }

      function n(e) {
        var i = t.getTask(e);
        i.type == t.config.types.placeholder && (i.plannedDate && i.end_date && i.unscheduled && (i.unscheduled = !1), t.batchUpdate(function () {
          var e = t.copy(i);
          t.silent(function () {
            t.deleteTask(i.id)
          }), delete e["!nativeeditor_status"], e.type = t.config.types.task, e.id = t.uid(), t.addTask(e)
        }))
      }

      t.config.types.placeholder = "placeholder", t.attachEvent("onDataProcessorReady", e(function (i) {
        i && !i._silencedPlaceholder && (i._silencedPlaceholder = !0, i.attachEvent("onBeforeUpdate", e(function (e, n, r) {
          return r.type != t.config.types.placeholder || (i.setUpdated(e, !1), !1)
        })))
      }));
      var r = !1;
      t.attachEvent("onGanttReady", function () {
        r || (r = !0, t.attachEvent("onAfterTaskUpdate", e(n)), t.attachEvent("onAfterTaskAdd", e(function (e, n) {
          n.type != t.config.types.placeholder && (t.getTaskBy("type", t.config.types.placeholder).forEach(function (e) {
            t.silent(function () {
              t.isTaskExists(e.id) && t.deleteTask(e.id)
            })
          }), i())
        })), t.attachEvent("onParse", e(i)))
      }), t.attachEvent("onBeforeUndoStack", function (e) {
        for (var i = 0; i < e.commands.length; i++) {
          var n = e.commands[i];
          "task" === n.entity && n.value.type === t.config.types.placeholder && (e.commands.splice(i, 1), i--)
        }
        return !0
      })
    }
  }, function (t, e, i) {
    var n = i(3);
    t.exports = function (t) {
      var e = function (t) {
        var e = {};

        function i(e, i) {
          return "function" == typeof e ? function (e) {
            var i = [];
            return t.eachTask(function (t) {
              e(t) && i.push(t)
            }), i
          }(e) : n.isArray(i) ? r(e, i) : r(e, [i])
        }

        function r(i, r) {
          for (var o, a = r.join("_") + "_" + i, s = {}, l = 0; l < r.length; l++) s[r[l]] = !0;
          return e[a] ? o = e[a] : (o = e[a] = [], t.eachTask(function (e) {
            var r;
            e.type != t.config.types.project && (r = n.isArray(e[i]) ? e[i] : [e[i]], n.forEach(r, function (t) {
              t && (s[t] || s[t.resource_id]) && o.push(e)
            }))
          })), o
        }

        function o(n, r, o, a) {
          var s = n.id + "_" + r + "_" + o.unit + "_" + o.step;
          return e[s] ? e[s] : e[s] = function (e, n, r, o) {
            p = "task" == e.$role ? [] : i(n, e.id);
            for (var a = r.unit, s = {}, l = 0; l < p.length; l++) for (var c = p[l], u = t.date[a + "_start"](new Date(c.plannedDate)); u < c.end_date;) {
              var d = u;
              if (u = t.date.add(u, 1, a), t.isWorkTime({date: d, task: c, unit: a})) {
                var h = d.valueOf();
                s[h] || (s[h] = []), s[h].push(c)
              }
            }
            var f, g, p, _ = [], v = o.$getConfig();
            for (l = 0; l < r.trace_x.length; l++) f = new Date(r.trace_x[l]), g = t.date.add(f, 1, a), ((p = s[f.valueOf()] || []).length || v.resource_render_empty_cells) && _.push({
              plannedDate: f,
              end_date: g,
              tasks: p
            });
            return _
          }(n, r, o, a)
        }

        function a(t, e, i, n) {
          var r = 100 * (1 - (1 * t || 0)), o = n.posFromDate(e), a = n.posFromDate(i),
            s = document.createElement("div");
          return s.className = "jsgantt-histogram-hor-bar", s.style.top = r + "%", s.style.left = o + "px", s.style.width = a - o + 1 + "px", s
        }

        function s(t, e, i) {
          if (t === e) return null;
          var n = 1 - Math.max(t, e), r = Math.abs(t - e), o = document.createElement("div");
          return o.className = "jsgantt-histogram-vert-bar", o.style.top = 100 * n + "%", o.style.height = 100 * r + "%", o.style.left = i + "px", o
        }

        function l(e, i, n) {
          var r = t.config.resource_property, o = [];
          if (t.getDatastore("task").exists(i)) {
            var a = t.getTask(i);
            o = a[r] || []
          }
          Array.isArray(o) || (o = [o]);
          for (var s = 0; s < o.length; s++) o[s].resource_id == e && n.push({
            task_id: a.id,
            resource_id: o[s].resource_id,
            value: o[s].value
          })
        }

        return t.$data.tasksStore.attachEvent("onStoreUpdated", function () {
          e = {}
        }), {
          renderLine: function (t, e) {
            for (var i = e.$getConfig(), n = e.$getTemplates(), r = o(t, i.resource_property, e.getScale(), e), a = [], s = 0; s < r.length; s++) {
              var l = r[s], c = n.resource_cell_class(l.plannedDate, l.end_date, t, l.tasks),
                u = n.resource_cell_value(l.plannedDate, l.end_date, t, l.tasks);
              if (c || u) {
                var d = e.getItemPosition(t, l.plannedDate, l.end_date), h = document.createElement("div");
                h.className = ["jsgantt-resource-marker", c].join(" "), h.style.cssText = ["left:" + d.left + "px", "width:" + d.width + "px", "height:" + (i.row_height - 1) + "px", "line-height:" + (i.row_height - 1) + "px", "top:" + d.top + "px"].join(";"), u && (h.innerHTML = u), a.push(h)
              }
            }
            var f = null;
            if (a.length) for (f = document.createElement("div"), s = 0; s < a.length; s++) f.appendChild(a[s]);
            return f
          }, renderHistogram: function (e, i) {
            for (var n = i.$getConfig(), r = i.$getTemplates(), l = o(e, n.resource_property, i.getScale(), i), c = [], u = {}, d = e.capacity || i.$config.capacity || 24, h = 0; h < l.length; h++) {
              var f = l[h], g = r.histogram_cell_class(f.plannedDate, f.end_date, e, f.tasks),
                p = r.histogram_cell_label(f.plannedDate, f.end_date, e, f.tasks),
                _ = r.histogram_cell_allocated(f.plannedDate, f.end_date, e, f.tasks),
                v = r.histogram_cell_capacity(f.plannedDate, f.end_date, e, f.tasks);
              if (u[f.plannedDate.valueOf()] = v || 0, g || p) {
                var m = i.getItemPosition(e, f.plannedDate, f.end_date), y = document.createElement("div");
                y.className = ["jsgantt-histogram-cell", g].join(" "), y.style.cssText = ["left:" + m.left + "px", "width:" + m.width + "px", "height:" + (n.row_height - 1) + "px", "line-height:" + (n.row_height - 1) + "px", "top:" + (m.top + 1) + "px"].join(";"), p && (p = "<div class='jsgantt-histogram_label'>" + p + "</div>"), _ && (p = "<div class='jsgantt-histogram-fill' style='height:" + 100 * Math.min(_ / d || 0, 1) + "%;'></div>" + p), p && (y.innerHTML = p), c.push(y)
              }
            }
            var k = null;
            if (c.length) {
              for (k = document.createElement("div"), h = 0; h < c.length; h++) k.appendChild(c[h]);
              var b = function (e, i, n) {
                for (var r = i.getScale(), o = document.createElement("div"), l = 0; l < r.trace_x.length; l++) {
                  var c = r.trace_x[l], u = r.trace_x[l + 1] || t.date.add(c, r.step, r.unit),
                    d = r.trace_x[l].valueOf(), h = Math.min(e[d] / n, 1) || 0;
                  if (h < 0) return null;
                  var f = Math.min(e[u.valueOf()] / n, 1) || 0, g = a(h, c, u, i);
                  g && o.appendChild(g);
                  var p = s(h, f, i.posFromDate(u));
                  p && o.appendChild(p)
                }
                return o
              }(u, i, d);
              b && (b.setAttribute("data-resource-id", e.id), b.style.position = "absolute", b.style.top = m.top + 1 + "px", b.style.height = n.row_height - 1 + "px", b.style.left = 0, k.appendChild(b))
            }
            return k
          }, filterTasks: i, getResourceAssignments: function (e, i) {
            var n = [], r = t.config.resource_property;
            return void 0 !== i ? l(e, i, n) : t.getTaskBy(r, e).forEach(function (t) {
              l(e, t.id, n)
            }), n
          }
        }
      }(t);
      t.getTaskBy = e.filterTasks, t.getResourceAssignments = e.getResourceAssignments, t.$ui.layers.resourceRow = e.renderLine, t.$ui.layers.resourceHistogram = e.renderHistogram, t.config.resource_property = "owner_id", t.config.resource_store = "resource", t.config.resource_render_empty_cells = !1, t.templates.histogram_cell_class = function (t, e, i, n) {
      }, t.templates.histogram_cell_label = function (t, e, i, n) {
        return n.length + "/3"
      }, t.templates.histogram_cell_allocated = function (t, e, i, n) {
        return n.length / 3
      }, t.templates.histogram_cell_capacity = function (t, e, i, n) {
        return 0
      }, t.templates.resource_cell_class = function (t, e, i, n) {
        return n.length <= 1 ? "jsgantt-resource-marker-ok" : "jsgantt-resource-marker-overtime"
      }, t.templates.resource_cell_value = function (t, e, i, n) {
        return 8 * n.length
      }
    }
  }, function (t, e) {
    window.sos && (window.sos.attaches || (window.sos.attaches = {}), window.sos.attaches.attachGantt = function (t, e, i) {
      var n = document.createElement("DIV");
      i = i || window.jsgantt, n.id = "jsgantt-" + i.uid(), n.style.width = "100%", n.style.height = "100%", n.cmp = "grid", document.body.appendChild(n), this.attachObject(n.id), this.dataType = "jsgantt", this.dataObj = i;
      var r = this.vs[this.av];
      return r.grid = i, i.init(n.id, t, e), n.firstChild.style.border = "none", r.gridId = n.id, r.gridObj = n, this.vs[this._viewRestore()].grid
    }), void 0 !== window.sosCellObject && (window.sosCellObject.prototype.attachGantt = function (t, e, i) {
      i = i || window.jsgantt;
      var n = document.createElement("DIV");
      return n.id = "jsgantt-" + i.uid(), n.style.width = "100%", n.style.height = "100%", n.cmp = "grid", document.body.appendChild(n), this.attachObject(n.id), this.dataType = "jsgantt", this.dataObj = i, i.init(n.id, t, e), n.firstChild.style.border = "none", n = null, this.callEvent("_onContentAttach", []), this.dataObj
    }), t.exports = null
  }, function (t, e) {
    window.jQuery && function (t) {
      var e = [];
      t.fn.joc_gantt = function (i) {
        if ("string" != typeof (i = i || {})) {
          var n = [];
          return this.each(function () {
            if (this && this.getAttribute) if (this.jsgantt || window.jsgantt.$root == this) n.push("object" == typeof this.jsgantt ? this.jsgantt : window.jsgantt); else {
              var t = window.jsgantt.$container && window.JSGantt ? window.JSGantt.getGanttInstance() : window.jsgantt;
              for (var e in i) "data" != e && (t.config[e] = i[e]);
              t.init(this), i.data && t.parse(i.data), n.push(t)
            }
          }), 1 === n.length ? n[0] : n
        }
        if (e[i]) return e[i].apply(this, []);
        t.error("Method " + i + " does not exist on jQuery.joc_gantt")
      }
    }(window.jQuery), t.exports = null
  }, function (t, e) {
    t.exports = function (t) {
      var e = function (t) {
        return {
          _needRecalc: !0, reset: function () {
            this._needRecalc = !0
          }, _isRecalcNeeded: function () {
            return !this._isGroupSort() && this._needRecalc
          }, _isGroupSort: function () {
            return !(!t._groups || !t._groups.is_active())
          }, _getWBSCode: function (t) {
            return t ? (this._isRecalcNeeded() && this._calcWBS(), t.$virtual ? "" : this._isGroupSort() ? t.$wbs || "" : (t.$wbs || (this.reset(), this._calcWBS()), t.$wbs)) : ""
          }, _setWBSCode: function (t, e) {
            t.$wbs = e
          }, getWBSCode: function (t) {
            return this._getWBSCode(t)
          }, getByWBSCode: function (e) {
            for (var i = e.split("."), n = t.config.root_id, r = 0; r < i.length; r++) {
              var o = t.getChildren(n), a = 1 * i[r] - 1;
              if (!t.isTaskExists(o[a])) return null;
              n = o[a]
            }
            return t.isTaskExists(n) ? t.getTask(n) : null
          }, _calcWBS: function () {
            if (this._isRecalcNeeded()) {
              var e = !0;
              t.eachTask(function (i) {
                if (e) return e = !1, void this._setWBSCode(i, "1");
                var n = t.getPrevSibling(i.id);
                if (null !== n) {
                  var r = t.getTask(n).$wbs;
                  r && ((r = r.split("."))[r.length - 1]++, this._setWBSCode(i, r.join(".")))
                } else {
                  var o = t.getParent(i.id);
                  this._setWBSCode(i, t.getTask(o).$wbs + ".1")
                }
              }, t.config.root_id, this), this._needRecalc = !1
            }
          }
        }
      }(t);

      function i() {
        return e.reset(), !0
      }

      t.getWBSCode = function (t) {
        return e.getWBSCode(t)
      }, t.getTaskByWBSCode = function (t) {
        return e.getByWBSCode(t)
      }, t.attachEvent("onAfterTaskMove", i), t.attachEvent("onBeforeParse", i), t.attachEvent("onAfterTaskDelete", i), t.attachEvent("onAfterTaskAdd", i), t.attachEvent("onAfterSort", i)
    }
  }, function (t, e) {
    t.exports = function (t) {
      t.batchUpdate = function (t) {
        var e = {}, i = !1;

        function n(t, i) {
          i = "function" == typeof i ? i : function () {
          }, e[t] || (e[t] = this[t], this[t] = i)
        }

        function r(t) {
          e[t] && (this[t] = e[t], e[t] = null)
        }

        function o() {
          for (var t in e) r.call(this, t)
        }

        function a(t) {
          try {
            t()
          } catch (t) {
            window.console.error(t)
          }
        }

        return t.$services.getService("state").registerProvider("batchUpdate", function () {
          return {batch_update: i}
        }, !0), function (t, e) {
          if (i) a(t); else {
            var r, s = this._dp && "off" != this._dp.updateMode;
            s && (r = this._dp.updateMode, this._dp.setUpdateMode("off"));
            var l = {}, c = {
              render: !0, refreshData: !0, refreshTask: !0, refreshLink: !0, resetProjectDates: function (t) {
                l[t.id] = t
              }
            };
            for (var u in function (t) {
              for (var e in t) n.call(this, e, t[e])
            }.call(this, c), i = !0, this.callEvent("onBeforeBatchUpdate", []), a(t), this.callEvent("onAfterBatchUpdate", []), o.call(this), l) this.resetProjectDates(l[u]);
            i = !1, e || this.render(), s && (this._dp.setUpdateMode(r), this._dp.setGanttMode("task"), this._dp.sendData(), this._dp.setGanttMode("link"), this._dp.sendData())
          }
        }
      }(t)
    }
  }, function (t, e, i) {
    var n = i(1);
    t.exports = function (t) {
      var e = 50, i = 30, r = 10, o = 50, a = null, s = !1, l = null, c = {started: !1}, u = {};

      function d() {
        var e = !!document.querySelector(".jsgantt-drag-marker"),
          i = !!document.querySelector(".jsgantt-drag-marker.jsgantt-grid-resize-area"),
          n = !!document.querySelector(".jsgantt-link-direction");
        return s = e && !i && !n, !(!t.getState().drag_mode && !e || i)
      }

      function h(e) {
        if (l && (clearTimeout(l), l = null), e) {
          var i = t.config.autoscroll_speed;
          i && i < 10 && (i = 10), l = setTimeout(function () {
            a = setInterval(p, i || o)
          }, t.config.autoscroll_delay || r)
        }
      }

      function f(t) {
        t ? (h(!0), c.started || (c.x = u.x, c.y = u.y, c.started = !0)) : (a && (clearInterval(a), a = null), h(!1), c.started = !1)
      }

      function g(e) {
        var i = d();
        if (!a && !l || i || f(!1), !t.config.autoscroll || !i) return !1;
        u = {x: e.clientX, y: e.clientY}, !a && i && f(!0)
      }

      function p() {
        if (!d()) return f(!1), !1;
        var e = n.getNodePosition(t.$task || t.$grid || t.$root), r = u.x - e.x, o = u.y - e.y,
          a = s ? 0 : _(r, e.width, c.x - e.x), l = _(o, e.height, c.y - e.y), h = t.getScrollState(), g = h.y,
          p = h.inner_height, v = h.height, m = h.x, y = h.inner_width, k = h.width;
        l && !p ? l = 0 : l < 0 && !g ? l = 0 : l > 0 && g + p >= v + 2 && (l = 0), a && !y ? a = 0 : a < 0 && !m ? a = 0 : a > 0 && m + y >= k && (a = 0);
        var b = t.config.autoscroll_step;
        b && b < 2 && (b = 2), l *= b || i, ((a *= b || i) || l) && function (e, i) {
          var n = t.getScrollState(), r = null, o = null;
          e && (r = n.x + e, r = Math.min(n.width, r), r = Math.max(0, r)), i && (o = n.y + i, o = Math.min(n.height, o), o = Math.max(0, o)), t.scrollTo(r, o)
        }(a, l)
      }

      function _(t, i, n) {
        return t - e < 0 && t < n ? -1 : t > i - e && t > n ? 1 : 0
      }

      t.attachEvent("onGanttReady", function () {
        t.eventRemove(document.body, "mousemove", g), t.event(document.body, "mousemove", g)
      })
    }
  }, function (t, e, i) {
    t.exports = function (t) {
      for (var e = [i(89), i(88), i(87), i(86), i(85), i(84), i(83), i(82)], n = 0; n < e.length; n++) e[n] && e[n](t)
    }
  }, function (t, e, i) {
    "use strict";
    Object.defineProperty(e, "__esModule", {value: !0}), e.default = function (t, e) {
      t.getUserData = function (t, e) {
        return this.userdata || (this.userdata = {}), this.userdata[t] && this.userdata[t][e] ? this.userdata[t][e] : ""
      }, t.setUserData = function (t, e, i) {
        this.userdata || (this.userdata = {}), this.userdata[t] || (this.userdata[t] = {}), this.userdata[t][e] = i
      }, t._change_id = function (t, e) {
        "task" !== this._dp._jsganttMode ? this.changeLinkId(t, e) : this.changeTaskId(t, e)
      }, t._row_style = function (e, i) {
        "task" === this._dp._jsganttMode && t.isTaskExists(e) && (t.getTask(e).$dataprocessor_class = i, t.refreshTask(e))
      }, t._delete_task = function (t, e) {
      }, t._sendTaskOrder = function (t, e) {
        e.$drop_target && (this._dp.setGanttMode("task"), this.getTask(t).target = e.$drop_target, this._dp.setUpdated(t, !0, "order"), delete this.getTask(t).$drop_target)
      }, t.setDp = function () {
        this._dp = e
      }, t.setDp()
    }
  }, function (t, e, i) {
    "use strict";
    Object.defineProperty(e, "__esModule", {value: !0});
    var n = i(3), r = function () {
      function t(t, e) {
        this.$jsgantt = t, this.$dp = e, this._dataProcessorHandlers = []
      }

      return t.prototype.attach = function () {
        var t = this.$dp, e = this.$jsgantt, n = i(25), r = {};

        function o(i) {
          for (var n = t.updatedRows.slice(), r = !1, o = 0; o < n.length && !t._in_progress[i]; o++) n[o] === i && ("inserted" === e.getUserData(i, "!nativeeditor_status") && (r = !0), t.setUpdated(i, !1));
          return r
        }

        this._dataProcessorHandlers.push(e.attachEvent("onAfterTaskAdd", function (i, n) {
          e.isTaskExists(i) && (t.setGanttMode("tasks"), t.setUpdated(i, !0, "inserted"))
        })), this._dataProcessorHandlers.push(e.attachEvent("onAfterTaskUpdate", function (i, n) {
          e.isTaskExists(i) && (t.setGanttMode("tasks"), t.setUpdated(i, !0), e._sendTaskOrder(i, n))
        })), this._dataProcessorHandlers.push(e.attachEvent("onBeforeTaskDelete", function (t, i) {
          return !e.config.cascade_delete || (r[t] = {
            tasks: n.getSubtreeTasks(e, t),
            links: n.getSubtreeLinks(e, t)
          }, !0)
        })), this._dataProcessorHandlers.push(e.attachEvent("onAfterTaskDelete", function (i, n) {
          if (t.setGanttMode("tasks"), !o(i)) {
            if (e.config.cascade_delete && r[i]) {
              var a = t.updateMode;
              t.setUpdateMode("off");
              var s = r[i];
              for (var l in s.tasks) o(l) || t.setUpdated(l, !0, "deleted");
              for (var l in t.setGanttMode("links"), s.links) o(l) || t.setUpdated(l, !0, "deleted");
              r[i] = null, "off" !== a && t.sendAllData(), t.setGanttMode("tasks"), t.setUpdateMode(a)
            }
            t.setUpdated(i, !0, "deleted"), "off" === t.updateMode || t._tSend || t.sendAllData()
          }
        })), this._dataProcessorHandlers.push(e.attachEvent("onAfterLinkUpdate", function (i, n) {
          e.isLinkExists(i) && (t.setGanttMode("links"), t.setUpdated(i, !0))
        })), this._dataProcessorHandlers.push(e.attachEvent("onAfterLinkAdd", function (i, n) {
          e.isLinkExists(i) && (t.setGanttMode("links"), t.setUpdated(i, !0, "inserted"))
        })), this._dataProcessorHandlers.push(e.attachEvent("onAfterLinkDelete", function (e, i) {
          t.setGanttMode("links"), !o(e) && t.setUpdated(e, !0, "deleted")
        })), this._dataProcessorHandlers.push(e.attachEvent("onRowDragEnd", function (t, i) {
          e._sendTaskOrder(t, e.getTask(t))
        }));
        var a = null, s = null;
        this._dataProcessorHandlers.push(e.attachEvent("onTaskIdChange", function (i, n) {
          if (t._waitMode) {
            var r = e.getChildren(n);
            if (r.length) {
              a = a || {};
              for (var o = 0; o < r.length; o++) {
                var l = this.getTask(r[o]);
                a[l.id] = l
              }
            }
            var c = function (t) {
              var e = [];
              return t.$source && (e = e.concat(t.$source)), t.$target && (e = e.concat(t.$target)), e
            }(this.getTask(n));
            if (c.length) for (s = s || {}, o = 0; o < c.length; o++) {
              var u = this.getLink(c[o]);
              s[u.id] = u
            }
          }
        })), t.attachEvent("onAfterUpdateFinish", function () {
          (a || s) && (e.batchUpdate(function () {
            for (var t in a) e.updateTask(a[t].id);
            for (var t in s) e.updateLink(s[t].id);
            a = null, s = null
          }), a ? e._dp.setGanttMode("tasks") : e._dp.setGanttMode("links"))
        }), t.attachEvent("onBeforeDataSending", function () {
          if ("CUSTOM" === this._tMode) return !0;
          var t = this._serverProcessor;
          if ("REST-JSON" === this._tMode || "REST" === this._tMode) {
            var i = this._jsganttMode;
            t = t.substring(0, t.indexOf("?") > -1 ? t.indexOf("?") : t.length), this.serverProcessor = t + ("/" === t.slice(-1) ? "" : "/") + i
          } else {
            var n = this._jsganttMode + "s";
            this.serverProcessor = t + e.ajax.urlSeparator(t) + "jsgantt-mode=" + n
          }
          return !0
        }), t.attachEvent("insertCallback", function (t, i, n, r) {
          var o = t.data || e.xml._xmlNodeToJSON(t.firstChild), a = {add: e.addTask, isExist: e.isTaskExists};
          "links" === r && (a.add = e.addLink, a.isExist = e.isLinkExists), a.isExist.call(e, i) || (o.id = i, a.add.call(e, o))
        }), t.attachEvent("updateCallback", function (t, i) {
          var n = t.data || e.xml._xmlNodeToJSON(t.firstChild);
          if (e.isTaskExists(i)) {
            var r = e.getTask(i);
            for (var o in n) {
              var a = n[o];
              switch (o) {
                case"id":
                  continue;
                case"plannedDate":
                case"end_date":
                  a = e.templates.dateFormat(a);
                  break;
                case"duration":
                  r.end_date = e.calculateEndDate({plannedDate: r.plannedDate, duration: a, task: r})
              }
              r[o] = a
            }
            e.updateTask(i), e.refreshData()
          }
        }), t.attachEvent("deleteCallback", function (t, i, n, r) {
          var o = {delete: e.deleteTask, isExist: e.isTaskExists};
          "links" === r && (o.delete = e.deleteLink, o.isExist = e.isLinkExists), o.isExist.call(e, i) && o.delete.call(e, i)
        })
      }, t.prototype.detach = function () {
        var t = this;
        n.forEach(this._dataProcessorHandlers, function (e) {
          t.$jsgantt.detachEvent(e)
        }), this._dataProcessorHandlers = []
      }, t
    }();
    e.default = r
  }, function (t, e, i) {
    "use strict";
    Object.defineProperty(e, "__esModule", {value: !0});
    var n = i(4), r = i(3), o = i(0), a = i(92), s = i(91);
    e.createDataProcessor = function (t) {
      var e, i;
      t instanceof Function ? e = t : t.hasOwnProperty("router") ? e = t.router : t.hasOwnProperty("link") && t.hasOwnProperty("task") && (e = t), i = e ? "CUSTOM" : t.mode || "REST-JSON";
      var n = new l(t.url);
      return n.init(this), n.setTransactionMode({mode: i, router: e}, t.batchUpdate), n
    };
    var l = function () {
      function t(t) {
        this.serverProcessor = t, this.action_param = "!nativeeditor_status", this.object = null, this.updatedRows = [], this.autoUpdate = !0, this.updateMode = "cell", this._headers = null, this._payload = null, this._postDelim = "_", this._waitMode = 0, this._in_progress = {}, this._invalid = {}, this.mandatoryFields = [], this.messages = [], this.styles = {
          updated: "font-weight:bold;",
          inserted: "font-weight:bold;",
          deleted: "text-decoration : line-through;",
          invalid: "background-color:FFE0E0;",
          invalid_cell: "border-bottom:2px solid red;",
          error: "color:red;",
          clear: "font-weight:normal;text-decoration:none;"
        }, this.enableUTFencoding(!0), n(this)
      }

      return t.prototype.setTransactionMode = function (t, e) {
        "object" == typeof t ? (this._tMode = t.mode || this._tMode, o.defined(t.headers) && (this._headers = t.headers), o.defined(t.payload) && (this._payload = t.payload)) : (this._tMode = t, this._tSend = e), "REST" === this._tMode && (this._tSend = !1, this._endnm = !0), "JSON" !== this._tMode && "REST-JSON" !== this._tMode || (this._tSend = !1, this._endnm = !0, this._serializeAsJson = !0, this._headers = this._headers || {}, this._headers["Content-type"] = "application/json"), "CUSTOM" === this._tMode && (this._tSend = !1, this._endnm = !0, this._router = t.router)
      }, t.prototype.escape = function (t) {
        return this._utf ? encodeURIComponent(t) : escape(t)
      }, t.prototype.enableUTFencoding = function (t) {
        this._utf = !!t
      }, t.prototype.setDataColumns = function (t) {
        this._columns = "string" == typeof t ? t.split(",") : t
      }, t.prototype.getSyncState = function () {
        return !this.updatedRows.length
      }, t.prototype.enableDataNames = function (t) {
        this._endnm = !!t
      }, t.prototype.enablePartialDataSend = function (t) {
        this._changed = !!t
      }, t.prototype.setUpdateMode = function (t, e) {
        this.autoUpdate = "cell" === t, this.updateMode = t, this.dnd = e
      }, t.prototype.ignore = function (t, e) {
        this._silent_mode = !0, t.call(e || window), this._silent_mode = !1
      }, t.prototype.setUpdated = function (t, e, i) {
        if (!this._silent_mode) {
          var n = this.findRow(t);
          i = i || "updated";
          var r = this.$jsgantt.getUserData(t, this.action_param);
          r && "updated" === i && (i = r), e ? (this.set_invalid(t, !1), this.updatedRows[n] = t, this.$jsgantt.setUserData(t, this.action_param, i), this._in_progress[t] && (this._in_progress[t] = "wait")) : this.is_invalid(t) || (this.updatedRows.splice(n, 1), this.$jsgantt.setUserData(t, this.action_param, "")), this.markRow(t, e, i), e && this.autoUpdate && this.sendData(t)
        }
      }, t.prototype.markRow = function (t, e, i) {
        var n = "", r = this.is_invalid(t);
        if (r && (n = this.styles[r], e = !0), this.callEvent("onRowMark", [t, e, i, r]) && (n = this.styles[e ? i : "clear"] + n, this.$jsgantt[this._methods[0]](t, n), r && r.details)) {
          n += this.styles[r + "-cell"];
          for (var o = 0; o < r.details.length; o++) r.details[o] && this.$jsgantt[this._methods[1]](t, o, n)
        }
      }, t.prototype.getActionByState = function (t) {
        return "inserted" === t ? "create" : "updated" === t ? "update" : "deleted" === t ? "delete" : void 0
      }, t.prototype.getState = function (t) {
        return this.$jsgantt.getUserData(t, this.action_param)
      }, t.prototype.is_invalid = function (t) {
        return this._invalid[t]
      }, t.prototype.set_invalid = function (t, e, i) {
        i && (e = {
          value: e, details: i, toString: function () {
            return this.value.toString()
          }
        }), this._invalid[t] = e
      }, t.prototype.checkBeforeUpdate = function (t) {
        return !0
      }, t.prototype.sendData = function (t) {
        if (!this._waitMode || "tree" !== this.$jsgantt.mytype && !this.$jsgantt._h2) {
          if (this.$jsgantt.editStop && this.$jsgantt.editStop(), void 0 === t || this._tSend) return this.sendAllData();
          if (this._in_progress[t]) return !1;
          if (this.messages = [], !this.checkBeforeUpdate(t) && this.callEvent("onValidationError", [t, this.messages])) return !1;
          this._beforeSendData(this._getRowData(t), t)
        }
      }, t.prototype._beforeSendData = function (t, e) {
        if (!this.callEvent("onBeforeUpdate", [e, this.getState(e), t])) return !1;
        this._sendData(t, e)
      }, t.prototype.serialize = function (t, e) {
        if (this._serializeAsJson) return this._serializeAsJSON(t);
        if ("string" == typeof t) return t;
        if (void 0 !== e) return this.serialize_one(t, "");
        var i = [], n = [];
        for (var r in t) t.hasOwnProperty(r) && (i.push(this.serialize_one(t[r], r + this._postDelim)), n.push(r));
        return i.push("ids=" + this.escape(n.join(","))), this.$jsgantt.security_key && i.push("joc_security=" + this.$jsgantt.security_key), i.join("&")
      }, t.prototype._serializeAsJSON = function (t) {
        if ("string" == typeof t) return t;
        var e = o.copy(t);
        return "REST-JSON" === this._tMode && (delete e.id, delete e[this.action_param]), JSON.stringify(e)
      }, t.prototype.serialize_one = function (t, e) {
        if ("string" == typeof t) return t;
        var i = [], n = "";
        for (var r in t) if (t.hasOwnProperty(r)) {
          if (("id" === r || r == this.action_param) && "REST" === this._tMode) continue;
          n = "string" == typeof t[r] || "number" == typeof t[r] ? t[r] : JSON.stringify(t[r]), i.push(this.escape((e || "") + r) + "=" + this.escape(n))
        }
        return i.join("&")
      }, t.prototype._applyPayload = function (t) {
        var e = this.$jsgantt.ajax;
        if (this._payload) for (var i in this._payload) t = t + e.urlSeparator(t) + this.escape(i) + "=" + this.escape(this._payload[i]);
        return t
      }, t.prototype._sendData = function (t, e) {
        var i = this;
        if (t) {
          if (!this.callEvent("onBeforeDataSending", e ? [e, this.getState(e), t] : [null, null, t])) return !1;
          e && (this._in_progress[e] = (new Date).valueOf());
          var n = this.$jsgantt.ajax;
          if ("CUSTOM" !== this._tMode) {
            var r;
            r = {
              callback: function (n) {
                var r = [];
                if (e) r.push(e); else if (t) for (var o in t) r.push(o);
                return i.afterUpdate(i, n, r)
              }, headers: this._headers
            };
            var o,
              a = this.serverProcessor + (this._user ? n.urlSeparator(this.serverProcessor) + ["joc_user=" + this._user, "joc_version=" + this.$jsgantt.getUserData(0, "version")].join("&") : ""),
              s = this._applyPayload(a);
            switch (this._tMode) {
              case"GET":
                r.url = s + n.urlSeparator(s) + this.serialize(t, e), r.method = "GET";
                break;
              case"POST":
                r.url = s, r.method = "POST", r.data = this.serialize(t, e);
                break;
              case"JSON":
                for (var l in o = {}, t) l !== this.action_param && "id" !== l && "gr_id" !== l && (o[l] = t[l]);
                r.url = s, r.method = "POST", r.data = JSON.stringify({id: e, action: t[this.action_param], data: o});
                break;
              case"REST":
              case"REST-JSON":
                switch (s = a.replace(/(&|\?)editing=true/, ""), o = "", this.getState(e)) {
                  case"inserted":
                    r.method = "POST", r.data = this.serialize(t, e);
                    break;
                  case"deleted":
                    r.method = "DELETE", s = s + ("/" === s.slice(-1) ? "" : "/") + e;
                    break;
                  default:
                    r.method = "PUT", r.data = this.serialize(t, e), s = s + ("/" === s.slice(-1) ? "" : "/") + e
                }
                r.url = this._applyPayload(s)
            }
            return this._waitMode++, n.query(r)
          }
          var c = this.getState(e), u = this.getActionByState(c), d = this.getGanttMode(), h = function (t) {
            var n = c || "updated", r = e, o = e;
            t && (n = t.action || c, r = t.sid || r, o = t.id || t.tid || o), i.afterUpdateCallback(r, o, n, t)
          }, f = void 0;
          if (this._router instanceof Function) f = this._router(d, u, t, e); else if (this._router[d] instanceof Function) f = this._router[d](u, t, e); else switch (c) {
            case"inserted":
              f = this._router[d].create(t);
              break;
            case"deleted":
              f = this._router[d].delete(e);
              break;
            default:
              f = this._router[d].update(t, e)
          }
          if (f) {
            if (!f.then && void 0 === f.id && void 0 === f.tid) throw new Error("Incorrect router return value. A Promise or a response object is expected");
            f.then ? f.then(h) : h(f)
          } else h(null)
        }
      }, t.prototype._forEachUpdatedRow = function (t) {
        for (var e = this.updatedRows.slice(), i = 0; i < e.length; i++) {
          var n = e[i];
          this.$jsgantt.getUserData(n, this.action_param) && t.call(this, n)
        }
      }, t.prototype.sendAllData = function () {
        if (this.updatedRows.length) {
          this.messages = [];
          var t = !0;
          if (this._forEachUpdatedRow(function (e) {
            t = t && this.checkBeforeUpdate(e)
          }), !t && !this.callEvent("onValidationError", ["", this.messages])) return !1;
          if (this._tSend) this._sendData(this._getAllData()); else {
            var e = !1;
            this._forEachUpdatedRow(function (t) {
              if (!e && !this._in_progress[t]) {
                if (this.is_invalid(t)) return;
                this._beforeSendData(this._getRowData(t), t), this._waitMode && ("tree" === this.$jsgantt.mytype || this.$jsgantt._h2) && (e = !0)
              }
            })
          }
        }
      }, t.prototype._getAllData = function () {
        var t = {}, e = !1;
        return this._forEachUpdatedRow(function (i) {
          if (!this._in_progress[i] && !this.is_invalid(i)) {
            var n = this._getRowData(i);
            this.callEvent("onBeforeUpdate", [i, this.getState(i), n]) && (t[i] = n, e = !0, this._in_progress[i] = (new Date).valueOf())
          }
        }), e ? t : null
      }, t.prototype.setVerificator = function (t, e) {
        this.mandatoryFields[t] = e || function (t) {
          return "" !== t
        }
      }, t.prototype.clearVerificator = function (t) {
        this.mandatoryFields[t] = !1
      }, t.prototype.findRow = function (t) {
        var e = 0;
        for (e = 0; e < this.updatedRows.length && t != this.updatedRows[e]; e++) ;
        return e
      }, t.prototype.defineAction = function (t, e) {
        this._uActions || (this._uActions = {}), this._uActions[t] = e
      }, t.prototype.afterUpdateCallback = function (t, e, i, n) {
        var r = t, o = "error" !== i && "invalid" !== i;
        if (o || this.set_invalid(t, i), this._uActions && this._uActions[i] && !this._uActions[i](n)) return delete this._in_progress[r];
        "wait" !== this._in_progress[r] && this.setUpdated(t, !1);
        var a = t;
        switch (i) {
          case"inserted":
          case"insert":
            e != t && (this.setUpdated(t, !1), this.$jsgantt[this._methods[2]](t, e), t = e);
            break;
          case"delete":
          case"deleted":
            return this.$jsgantt.setUserData(t, this.action_param, "true_deleted"), this.$jsgantt[this._methods[3]](t), delete this._in_progress[r], this.callEvent("onAfterUpdate", [t, i, e, n])
        }
        "wait" !== this._in_progress[r] ? (o && this.$jsgantt.setUserData(t, this.action_param, ""), delete this._in_progress[r]) : (delete this._in_progress[r], this.setUpdated(e, !0, this.$jsgantt.getUserData(t, this.action_param))), this.callEvent("onAfterUpdate", [a, i, e, n])
      }, t.prototype.afterUpdate = function (t, e, i) {
        var n;
        n = 3 === arguments.length ? arguments[1] : arguments[4];
        var r = this.getGanttMode(), o = n.filePath || n.url;
        r = "REST" !== this._tMode && "REST-JSON" !== this._tMode ? -1 !== o.indexOf("jsgantt-mode=links") ? "link" : "task" : o.indexOf("/link") > o.indexOf("/task") ? "link" : "task", this.setGanttMode(r);
        var a = this.$jsgantt.ajax;
        if (window.JSON) {
          var s = void 0;
          try {
            s = JSON.parse(e.xmlDoc.responseText)
          } catch (t) {
            e.xmlDoc.responseText.length || (s = {})
          }
          if (s) {
            var l = s.action || this.getState(i) || "updated", c = s.sid || i[0], u = s.tid || i[0];
            return t.afterUpdateCallback(c, u, l, s), t.finalizeUpdate(), void this.setGanttMode(r)
          }
        }
        var d = a.xmltop("data", e.xmlDoc);
        if (!d) return this.cleanUpdate(i);
        var h = a.xpath("//data/action", d);
        if (!h.length) return this.cleanUpdate(i);
        for (var f = 0; f < h.length; f++) {
          var g = h[f];
          l = g.getAttribute("type"), c = g.getAttribute("sid"), u = g.getAttribute("tid"), t.afterUpdateCallback(c, u, l, g)
        }
        t.finalizeUpdate()
      }, t.prototype.cleanUpdate = function (t) {
        if (t) for (var e = 0; e < t.length; e++) delete this._in_progress[t[e]]
      }, t.prototype.finalizeUpdate = function () {
        this._waitMode && this._waitMode--, ("tree" === this.$jsgantt.mytype || this.$jsgantt._h2) && this.updatedRows.length && this.sendData(), this.callEvent("onAfterUpdateFinish", []), this.updatedRows.length || this.callEvent("onFullSync", [])
      }, t.prototype.init = function (t) {
        if (!this._initialized) {
          this.$jsgantt = t, this.$jsgantt._dp_init && this.$jsgantt._dp_init(this), this._setDefaultTransactionMode(), this.styles = {
            updated: "jsgantt-updated",
            order: "jsgantt-updated",
            inserted: "jsgantt-inserted",
            deleted: "jsgantt-deleted",
            invalid: "jsgantt-invalid",
            error: "jsgantt-error",
            clear: ""
          }, this._methods = ["_row_style", "setCellTextStyle", "_change_id", "_delete_task"], s.default(this.$jsgantt, this);
          var e = new a.default(this.$jsgantt, this);
          e.attach(), this.attachEvent("onDestroy", function () {
            delete this.setGanttMode, delete this._getRowData, delete this.$jsgantt._dp, delete this.$jsgantt._change_id, delete this.$jsgantt._row_style, delete this.$jsgantt._delete_task, delete this.$jsgantt._sendTaskOrder, delete this.$jsgantt, e.detach()
          }), this.$jsgantt.callEvent("onDataProcessorReady", [this]), this._initialized = !0
        }
      }, t.prototype._setDefaultTransactionMode = function () {
        this.serverProcessor && (this.setTransactionMode("POST", !0), this.serverProcessor += (-1 !== this.serverProcessor.indexOf("?") ? "&" : "?") + "editing=true", this._serverProcessor = this.serverProcessor)
      }, t.prototype.setOnAfterUpdate = function (t) {
        this.attachEvent("onAfterUpdate", t)
      }, t.prototype.enableDebug = function (t) {
      }, t.prototype.setOnBeforeUpdateHandler = function (t) {
        this.attachEvent("onBeforeDataSending", t)
      }, t.prototype.setAutoUpdate = function (t, e) {
        var i = this;
        t = t || 2e3, this._user = e || (new Date).valueOf(), this._needUpdate = !1, this._updateBusy = !1, this.attachEvent("onAfterUpdate", this.afterAutoUpdate), this.attachEvent("onFullSync", this.fullSync), window.setInterval(function () {
          i.loadUpdate()
        }, t)
      }, t.prototype.afterAutoUpdate = function (t, e, i, n) {
        return "collision" !== e || (this._needUpdate = !0, !1)
      }, t.prototype.fullSync = function () {
        return this._needUpdate && (this._needUpdate = !1, this.loadUpdate()), !0
      }, t.prototype.getUpdates = function (t, e) {
        var i = this.$jsgantt.ajax;
        if (this._updateBusy) return !1;
        this._updateBusy = !0, i.get(t, e)
      }, t.prototype._v = function (t) {
        return t.firstChild ? t.firstChild.nodeValue : ""
      }, t.prototype._a = function (t) {
        for (var e = [], i = 0; i < t.length; i++) e[i] = this._v(t[i]);
        return e
      }, t.prototype.loadUpdate = function () {
        var t = this, e = this.$jsgantt.ajax, i = this.$jsgantt.getUserData(0, "version"),
          n = this.serverProcessor + e.urlSeparator(this.serverProcessor) + ["joc_user=" + this._user, "joc_version=" + i].join("&");
        n = n.replace("editing=true&", ""), this.getUpdates(n, function (i) {
          var n = e.xpath("//userdata", i);
          t.obj.setUserData(0, "version", t._v(n[0]));
          var r = e.xpath("//update", i);
          if (r.length) {
            t._silent_mode = !0;
            for (var o = 0; o < r.length; o++) {
              var a = r[o].getAttribute("status"), s = r[o].getAttribute("id"), l = r[o].getAttribute("parent");
              switch (a) {
                case"inserted":
                  t.callEvent("insertCallback", [r[o], s, l]);
                  break;
                case"updated":
                  t.callEvent("updateCallback", [r[o], s, l]);
                  break;
                case"deleted":
                  t.callEvent("deleteCallback", [r[o], s, l])
              }
            }
            t._silent_mode = !1
          }
          t._updateBusy = !1
        })
      }, t.prototype.destructor = function () {
        this.callEvent("onDestroy", []), this.detachAllEvents(), this.updatedRows = [], this._in_progress = {}, this._invalid = {}, this._headers = null, this._payload = null, delete this._initialized
      }, t.prototype.setGanttMode = function (t) {
        "tasks" === t ? t = "task" : "links" === t && (t = "link");
        var e = this.modes || {}, i = this.getGanttMode();
        i && (e[i] = {_in_progress: this._in_progress, _invalid: this._invalid, updatedRows: this.updatedRows});
        var n = e[t];
        n || (n = e[t] = {
          _in_progress: {},
          _invalid: {},
          updatedRows: []
        }), this._in_progress = n._in_progress, this._invalid = n._invalid, this.updatedRows = n.updatedRows, this.modes = e, this._jsganttMode = t
      }, t.prototype.getGanttMode = function () {
        return this._jsganttMode
      }, t.prototype._getRowData = function (t) {
        var e;
        e = "task" === this.getGanttMode() ? this.$jsgantt.isTaskExists(t) ? this.$jsgantt.getTask(t) : {id: t} : this.$jsgantt.isLinkExists(t) ? this.$jsgantt.getLink(t) : {id: t}, e = this.$jsgantt.copy(e);
        var i = {};
        for (var n in e) if ("$" !== n.substr(0, 1)) {
          var o = e[n];
          r.isDate(o) ? i[n] = this.$jsgantt.templates.xml_format(o) : i[n] = null === o ? "" : o
        }
        var a = this.$jsgantt._get_task_timing_mode(e);
        return a.$no_start && (e.plannedDate = "", e.duration = ""), a.$no_end && (e.end_date = "", e.duration = ""), i[this.action_param] = this.$jsgantt.getUserData(t, this.action_param), i
      }, t.prototype._isFetchResult = function (t) {
        return t.body instanceof ReadableStream
      }, t.prototype.setSerializeAsJSON = function (t) {
        this._serializeAsJson = t
      }, t
    }();
    e.DataProcessor = l
  }, function (t, e, i) {
    var n = i(93);
    t.exports = {
      DEPRECATED_api: function (t) {
        return new n.DataProcessor(t)
      }, createDataProcessor: n.createDataProcessor, getDataProcessorModes: n.getAvailableModes
    }
  }, function (t, e) {
    t.exports = {
      bindDataStore: function (t, e) {
        var i = e.getDatastore(t), n = function (t, e) {
          var n = e.getLayers(), r = i.getItem(t);
          if (r && i.isVisible(t)) for (var o = 0; o < n.length; o++) n[o].render_item(r)
        };

        function r(t) {
          return !!t.$services.getService("state").getState("batchUpdate").batch_update
        }

        i.attachEvent("onStoreUpdated", function (o, a, s) {
          if (!r(e)) {
            var l = e.$services.getService("layers").getDataRender(t);
            l && (o && "move" != s && "delete" != s ? (i.callEvent("onBeforeRefreshItem", [a.id]), n(a.id, l), i.callEvent("onAfterRefreshItem", [a.id])) : (i.callEvent("onBeforeRefreshAll", []), function (t) {
              for (var e = l.getLayers(), n = 0; n < e.length; n++) e[n].clear();
              var r = i.getVisibleItems();
              for (n = 0; n < e.length; n++) e[n].render_items(r)
            }(), i.callEvent("onAfterRefreshAll", [])))
          }
        }), i.attachEvent("onItemOpen", function () {
          e.render()
        }), i.attachEvent("onItemClose", function () {
          e.render()
        }), i.attachEvent("onIdChange", function (o, a) {
          if (i.callEvent("onBeforeIdChange", [o, a]), !r(e)) {
            var s = e.$services.getService("layers").getDataRender(t);
            !function (t, e, i, n) {
              for (var r = 0; r < t.length; r++) t[r].change_id(e, i)
            }(s.getLayers(), o, a, i.getItem(a)), n(a, s)
          }
        })
      }
    }
  }, function (t, e) {
    t.exports = function (t) {
      var e = null, i = t._removeItemInner;

      function n(t) {
        e = null, this.callEvent("onAfterUnselect", [t])
      }

      return t._removeItemInner = function (t) {
        return e == t && n.call(this, t), e && this.eachItem && this.eachItem(function (t) {
          t.id == e && n.call(this, t.id)
        }, t), i.apply(this, arguments)
      }, t.attachEvent("onIdChange", function (e, i) {
        t.getSelectedId() == e && t.silent(function () {
          t.unselect(e), t.select(i)
        })
      }), {
        select: function (t) {
          if (t) {
            if (e == t) return e;
            if (!this._skip_refresh && !this.callEvent("onBeforeSelect", [t])) return !1;
            this.unselect(), e = t, this._skip_refresh || (this.refresh(t), this.callEvent("onAfterSelect", [t]))
          }
          return e
        }, getSelectedId: function () {
          return e
        }, unselect: function (t) {
          (t = t || e) && (e = null, this._skip_refresh || (this.refresh(t), n.call(this, t)))
        }
      }
    }
  }, function (t, e, i) {
    var n = i(0);
    t.exports = function () {
      return {
        getLinkCount: function () {
          return this.$data.linksStore.count()
        }, getLink: function (t) {
          return this.$data.linksStore.getItem(t)
        }, getLinks: function () {
          return this.$data.linksStore.getItems()
        }, isLinkExists: function (t) {
          return this.$data.linksStore.exists(t)
        }, addLink: function (t) {
          return this.$data.linksStore.addItem(t)
        }, updateLink: function (t, e) {
          n.defined(e) || (e = this.getLink(t)), this.$data.linksStore.updateItem(t, e)
        }, deleteLink: function (t) {
          return this.$data.linksStore.removeItem(t)
        }, changeLinkId: function (t, e) {
          return this.$data.linksStore.changeId(t, e)
        }
      }
    }
  }, function (t, e, i) {
    var n = i(0);
    t.exports = function () {
      return {
        getTask: function (t) {
          this.assert(t, "Invalid argument for jsgantt.getTask");
          var e = this.$data.tasksStore.getItem(t);
          return this.assert(e, "Task not found id=" + t), e
        }, getTaskByTime: function (t, e) {
          var i = this.$data.tasksStore.getItems(), n = [];
          if (t || e) {
            t = +t || -1 / 0, e = +e || 1 / 0;
            for (var r = 0; r < i.length; r++) {
              var o = i[r];
              +o.plannedDate < e && +o.end_date > t && n.push(o)
            }
          } else n = i;
          return n
        }, isTaskExists: function (t) {
          return this.$data.tasksStore.exists(t)
        }, updateTask: function (t, e) {
          n.defined(e) || (e = this.getTask(t)), this.$data.tasksStore.updateItem(t, e), this.isTaskExists(t) && this.refreshTask(t)
        }, addTask: function (t, e, i) {
          return n.defined(t.id) || (t.id = n.uid()), n.defined(e) || (e = this.getParent(t) || 0), this.isTaskExists(e) || (e = this.config.root_id), this.setParent(t, e), this.$data.tasksStore.addItem(t, i, e)
        }, deleteTask: function (t) {
          return this.$data.tasksStore.removeItem(t)
        }, getTaskCount: function () {
          return this.$data.tasksStore.count()
        }, getVisibleTaskCount: function () {
          return this.$data.tasksStore.countVisible()
        }, getTaskIndex: function (t) {
          return this.$data.tasksStore.getBranchIndex(t)
        }, getGlobalTaskIndex: function (t) {
          return this.assert(t, "Invalid argument"), this.$data.tasksStore.getIndexById(t)
        }, eachTask: function (t, e, i) {
          return this.$data.tasksStore.eachItem(n.bind(t, i || this), e)
        }, eachParent: function (t, e, i) {
          return this.$data.tasksStore.eachParent(n.bind(t, i || this), e)
        }, changeTaskId: function (t, e) {
          this.$data.tasksStore.changeId(t, e);
          var i = this.$data.tasksStore.getItem(e), n = [];
          i.$source && (n = n.concat(i.$source)), i.$target && (n = n.concat(i.$target));
          for (var r = 0; r < n.length; r++) {
            var o = this.getLink(n[r]);
            o.source == t && (o.source = e), o.target == t && (o.target = e)
          }
        }, calculateTaskLevel: function (t) {
          return this.$data.tasksStore.calculateItemLevel(t)
        }, getNext: function (t) {
          return this.$data.tasksStore.getNext(t)
        }, getPrev: function (t) {
          return this.$data.tasksStore.getPrev(t)
        }, getParent: function (t) {
          return this.$data.tasksStore.getParent(t)
        }, setParent: function (t, e, i) {
          return this.$data.tasksStore.setParent(t, e, i)
        }, getSiblings: function (t) {
          return this.$data.tasksStore.getSiblings(t).slice()
        }, getNextSibling: function (t) {
          return this.$data.tasksStore.getNextSibling(t)
        }, getPrevSibling: function (t) {
          return this.$data.tasksStore.getPrevSibling(t)
        }, getTaskByIndex: function (t) {
          var e = this.$data.tasksStore.getIdByIndex(t);
          return this.isTaskExists(e) ? this.getTask(e) : null
        }, getChildren: function (t) {
          return this.hasChild(t) ? this.$data.tasksStore.getChildren(t).slice() : []
        }, hasChild: function (t) {
          return this.$data.tasksStore.hasChild(t)
        }, open: function (t) {
          this.$data.tasksStore.open(t)
        }, close: function (t) {
          this.$data.tasksStore.close(t)
        }, moveTask: function (t, e, i) {
          this.$data.tasksStore.move.apply(this.$data.tasksStore, arguments)
        }, sort: function (t, e, i, n) {
          var r = !n;
          this.$data.tasksStore.sort(t, e, i), r && this.render(), this.callEvent("onAfterSort", [t, e, i])
        }
      }
    }
  }, function (t, e, i) {
    var n = i(0), r = i(98), o = i(97), a = i(29), s = i(27), l = i(96), c = i(95);

    function u() {
      for (var t = this.$services.getService("datastores"), e = [], i = 0; i < t.length; i++) e.push(this.getDatastore(t[i]));
      return e
    }

    t.exports = {
      create: function () {
        var t = n.mixin({}, {
          createDatastore: function (t) {
            var e = "treedatastore" == (t.type || "").toLowerCase() ? s : a;
            if (t) {
              var i = this;
              t.openInitially = function () {
                return i.config.open_tree_initially
              }
            }
            var n = new e(t);
            if (this.mixin(n, l(n)), t.name) {
              this.$services.dropService("datastore:" + t.name), this.$services.setService("datastore:" + t.name, function () {
                return n
              });
              var r = this.$services.getService("datastores");
              r ? r.indexOf(t.name) < 0 && r.push(t.name) : (r = [], this.$services.setService("datastores", function () {
                return r
              }), r.push(t.name)), c.bindDataStore(t.name, this)
            }
            return n
          }, getDatastore: function (t) {
            return this.$services.getService("datastore:" + t)
          }, refreshData: function () {
            var t = this.getScrollState();
            this.callEvent("onBeforeDataRender", []);
            for (var e = u.call(this), i = 0; i < e.length; i++) e[i].refresh();
            (t.x || t.y) && this.scrollTo(t.x, t.y), this.callEvent("onDataRender", [])
          }, isChildOf: function (t, e) {
            return this.$data.tasksStore.isChildOf(t, e)
          }, refreshTask: function (t, e) {
            var i = this.getTask(t);
            if (i && this.isTaskVisible(t)) {
              if (this.$data.tasksStore.refresh(t, !!this.getState().drag_id), void 0 !== e && !e) return;
              for (var n = 0; n < i.$source.length; n++) this.refreshLink(i.$source[n]);
              for (n = 0; n < i.$target.length; n++) this.refreshLink(i.$target[n])
            } else this.isTaskExists(t) && this.isTaskExists(this.getParent(t)) && this.refreshTask(this.getParent(t))
          }, refreshLink: function (t) {
            this.$data.linksStore.refresh(t, !!this.getState().drag_id)
          }, silent: function (t) {
            var e = this;
            e.$data.tasksStore.silent(function () {
              e.$data.linksStore.silent(function () {
                t()
              })
            })
          }, clearAll: function () {
            for (var t = u.call(this), e = 0; e < t.length; e++) t[e].clearAll();
            this._update_flags(), this.userdata = {}, this.callEvent("onClear", []), this.render()
          }, _clear_data: function () {
            this.$data.tasksStore.clearAll(), this.$data.linksStore.clearAll(), this._update_flags(), this.userdata = {}
          }, selectTask: function (t) {
            var e = this.$data.tasksStore;
            return !!this.config.select_task && (t && e.select(t), e.getSelectedId())
          }, unselectTask: function (t) {
            this.$data.tasksStore.unselect(t)
          }, getSelectedId: function () {
            return this.$data.tasksStore.getSelectedId()
          }
        });
        return n.mixin(t, r()), n.mixin(t, o()), t
      }
    }
  }, function (t, e, i) {
    var n = i(0), r = i(99), o = i(26);
    t.exports = function (t) {
      var e = r.create();
      n.mixin(t, e);
      var a = t.createDatastore({
        name: "task", type: "treeDatastore", rootId: function () {
          return t.config.root_id
        }, initItem: n.bind(function (e) {
          this.defined(e.id) || (e.id = this.uid()), e.plannedDate && (e.plannedDate = t.date.parseDate(e.plannedDate, "dateFormat")), e.end_date && (e.end_date = t.date.parseDate(e.end_date, "dateFormat"));
          var i = null;
          return (e.duration || 0 === e.duration) && (e.duration = i = 1 * e.duration), i && (e.plannedDate && !e.end_date ? e.end_date = this.calculateEndDate(e) : !e.plannedDate && e.end_date && (e.plannedDate = this.calculateEndDate({
            plannedDate: e.end_date,
            duration: -e.duration,
            task: e
          }))), e.progress = Number(e.progress) || 0, this._isAllowedUnscheduledTask(e) && this._set_default_task_timing(e), this._init_task_timing(e), e.plannedDate && e.end_date && this.correctTaskWorkTime(e), e.$source = [], e.$target = [], void 0 === e.parent && this.setParent(e, this.config.root_id), e
        }, t)
      }), s = t.createDatastore({
        name: "link", initItem: n.bind(function (t) {
          return this.defined(t.id) || (t.id = this.uid()), t
        }, t)
      });

      function l(e) {
        var i = t.isTaskVisible(e);
        if (!i && t.isTaskExists(e)) {
          var n = t.getParent(e);
          t.isTaskExists(n) && t.isTaskVisible(n) && (n = t.getTask(n), t.isSplitTask(n) && (i = !0))
        }
        return i
      }

      function c(e) {
        if (t.isTaskExists(e.source)) {
          var i = t.getTask(e.source);
          i.$source = i.$source || [], i.$source.push(e.id)
        }
        if (t.isTaskExists(e.target)) {
          var n = t.getTask(e.target);
          n.$target = n.$target || [], n.$target.push(e.id)
        }
      }

      function u(e) {
        if (t.isTaskExists(e.source)) for (var i = t.getTask(e.source), n = 0; n < i.$source.length; n++) if (i.$source[n] == e.id) {
          i.$source.splice(n, 1);
          break
        }
        if (t.isTaskExists(e.target)) {
          var r = t.getTask(e.target);
          for (n = 0; n < r.$target.length; n++) if (r.$target[n] == e.id) {
            r.$target.splice(n, 1);
            break
          }
        }
      }

      function d() {
        for (var e = null, i = t.$data.tasksStore.getItems(), n = 0, r = i.length; n < r; n++) (e = i[n]).$source = [], e.$target = [];
        var o = t.$data.linksStore.getItems();
        for (n = 0, r = o.length; n < r; n++) c(o[n])
      }

      function h(t) {
        var e = t.source, i = t.target;
        for (var n in t.events) !function (t, n) {
          e.attachEvent(t, function () {
            return i.callEvent(n, Array.prototype.slice.call(arguments))
          }, n)
        }(n, t.events[n])
      }

      a.attachEvent("onBeforeRefreshAll", function () {
        for (var e = a.getVisibleItems(), i = 0; i < e.length; i++) {
          var n = e[i];
          n.$index = i, t.resetProjectDates(n)
        }
      }), a.attachEvent("onFilterItem", function (e, i) {
        var n = null, r = null;
        if (t.config.plannedDate && t.config.end_date) {
          if (t._isAllowedUnscheduledTask(i)) return !0;
          if (n = t.config.plannedDate.valueOf(), r = t.config.end_date.valueOf(), +i.plannedDate > r || +i.end_date < +n) return !1
        }
        return !0
      }), a.attachEvent("onIdChange", function (e, i) {
        t._update_flags(e, i)
      }), a.attachEvent("onAfterUpdate", function (e) {
        if (t._update_parents(e), t.getState("batchUpdate").batch_update) return !0;
        for (var i = a.getItem(e), n = 0; n < i.$source.length; n++) s.refresh(i.$source[n]);
        for (n = 0; n < i.$target.length; n++) s.refresh(i.$target[n])
      }), a.attachEvent("onAfterItemMove", function (e, i, n) {
        var r = t.getTask(e);
        null !== this.getNextSibling(e) ? r.$drop_target = this.getNextSibling(e) : null !== this.getPrevSibling(e) ? r.$drop_target = "next:" + this.getPrevSibling(e) : r.$drop_target = "next:null"
      }), a.attachEvent("onStoreUpdated", function (e, i, n) {
        if ("delete" == n && t._update_flags(e, null), !t.$services.getService("state").getState("batchUpdate").batch_update) {
          if (t.config.fit_tasks && "paint" !== n) {
            var r = t.getState();
            o(t);
            var a = t.getState();
            if (+r.min_date != +a.min_date || +r.max_date != +a.max_date) return t.render(), t.callEvent("onScaleAdjusted", []), !0
          }
          "add" == n || "move" == n || "delete" == n ? t.$layout.resize() : e || s.refresh()
        }
      }), s.attachEvent("onAfterAdd", function (t, e) {
        c(e)
      }), s.attachEvent("onAfterUpdate", function (t, e) {
        d()
      }), s.attachEvent("onAfterDelete", function (t, e) {
        u(e)
      }), s.attachEvent("onBeforeIdChange", function (e, i) {
        u(t.mixin({id: e}, t.$data.linksStore.getItem(i))), c(t.$data.linksStore.getItem(i))
      }), s.attachEvent("onFilterItem", function (e, i) {
        if (!t.config.show_links) return !1;
        var n = l(i.source), r = l(i.target);
        return !(!n || !r || t._isAllowedUnscheduledTask(t.getTask(i.source)) || t._isAllowedUnscheduledTask(t.getTask(i.target))) && t.callEvent("onBeforeLinkDisplay", [e, i])
      }), function () {
        var e = i(25), n = {};
        t.attachEvent("onBeforeTaskDelete", function (i, r) {
          return n[i] = e.getSubtreeLinks(t, i), !0
        }), t.attachEvent("onAfterTaskDelete", function (e, i) {
          n[e] && t.$data.linksStore.silent(function () {
            for (var i in n[e]) t.$data.linksStore.removeItem(i), u(n[e][i]);
            n[e] = null
          })
        })
      }(), t.attachEvent("onAfterLinkDelete", function (e, i) {
        t.refreshTask(i.source), t.refreshTask(i.target)
      }), t.attachEvent("onParse", d), h({
        source: s,
        target: t,
        events: {
          onItemLoading: "onLinkLoading",
          onBeforeAdd: "onBeforeLinkAdd",
          onAfterAdd: "onAfterLinkAdd",
          onBeforeUpdate: "onBeforeLinkUpdate",
          onAfterUpdate: "onAfterLinkUpdate",
          onBeforeDelete: "onBeforeLinkDelete",
          onAfterDelete: "onAfterLinkDelete",
          onIdChange: "onLinkIdChange"
        }
      }), h({
        source: a,
        target: t,
        events: {
          onItemLoading: "onTaskLoading",
          onBeforeAdd: "onBeforeTaskAdd",
          onAfterAdd: "onAfterTaskAdd",
          onBeforeUpdate: "onBeforeTaskUpdate",
          onAfterUpdate: "onAfterTaskUpdate",
          onBeforeDelete: "onBeforeTaskDelete",
          onAfterDelete: "onAfterTaskDelete",
          onIdChange: "onTaskIdChange",
          onBeforeItemMove: "onBeforeTaskMove",
          onAfterItemMove: "onAfterTaskMove",
          onFilterItem: "onBeforeTaskDisplay",
          onItemOpen: "onTaskOpened",
          onItemClose: "onTaskClosed",
          onBeforeSelect: "onBeforeTaskSelected",
          onAfterSelect: "onTaskSelected",
          onAfterUnselect: "onTaskUnselected"
        }
      }), t.$data = {tasksStore: a, linksStore: s}
    }
  }, function (t, e) {
    t.exports = function () {
      function t(t) {
        return t.$ui.getView("timeline")
      }

      function e(t) {
        return t.$ui.getView("grid")
      }

      function i(t) {
        return t.$ui.getView("scrollVer")
      }

      function n(t) {
        return t.$ui.getView("scrollHor")
      }

      var r = "DEFAULT_VALUE";

      function o(t, e, i, n) {
        var o = t(this);
        return o && o.isVisible() ? o[e].apply(o, i) : n ? n() : r
      }

      return {
        getColumnIndex: function (t) {
          var i = o.call(this, e, "getColumnIndex", [t]);
          return i === r ? 0 : i
        }, dateFromPos: function (e) {
          var i = o.call(this, t, "dateFromPos", Array.prototype.slice.call(arguments));
          return i === r ? this.getState().min_date : i
        }, posFromDate: function (e) {
          var i = o.call(this, t, "posFromDate", [e]);
          return i === r ? 0 : i
        }, getRowTop: function (i) {
          var n = this, a = o.call(n, t, "getRowTop", [i], function () {
            return o.call(n, e, "getRowTop", [i])
          });
          return a === r ? 0 : a
        }, getTaskTop: function (i) {
          var n = this, a = o.call(n, t, "getItemTop", [i], function () {
            return o.call(n, e, "getItemTop", [i])
          });
          return a === r ? 0 : a
        }, getTaskPosition: function (e, i, n) {
          var a = o.call(this, t, "getItemPosition", [e, i, n]);
          return a === r ? {left: 0, top: this.getTaskTop(e.id), height: this.getTaskHeight(), width: 0} : a
        }, getTaskHeight: function () {
          var i = this, n = o.call(i, t, "getItemHeight", [], function () {
            return o.call(i, e, "getItemHeight", [])
          });
          return n === r ? 0 : n
        }, columnIndexByDate: function (e) {
          var i = o.call(this, t, "columnIndexByDate", [e]);
          return i === r ? 0 : i
        }, roundTaskDates: function () {
          o.call(this, t, "roundTaskDates", [])
        }, getScale: function () {
          var e = o.call(this, t, "getScale", []);
          return e === r ? null : e
        }, getTaskNode: function (e) {
          var i = t(this);
          return i && i.isVisible() ? i._taskRenderer.rendered[e] : null
        }, getLinkNode: function (e) {
          var i = t(this);
          return i.isVisible() ? i._linkRenderer.rendered[e] : null
        }, scrollTo: function (t, e) {
          var r = i(this), o = n(this), a = {position: 0}, s = {position: 0};
          r && (s = r.getScrollState()), o && (a = o.getScrollState()), o && 1 * t == t && o.scroll(t), r && 1 * e == e && r.scroll(e);
          var l = {position: 0}, c = {position: 0};
          r && (l = r.getScrollState()), o && (c = o.getScrollState()), this.callEvent("onGanttScroll", [a.position, s.position, c.position, l.position])
        }, showDate: function (t) {
          var e = this.posFromDate(t), i = Math.max(e - this.config.task_scroll_offset, 0);
          this.scrollTo(i)
        }, showTask: function (t) {
          var e, i = this.getTaskPosition(this.getTask(t)), n = Math.max(i.left - this.config.task_scroll_offset, 0),
            r = this._scroll_state().y;
          e = r ? i.top - (r - this.config.row_height) / 2 : i.top, this.scrollTo(n, e)
        }, _scroll_state: function () {
          var t = {x: !1, y: !1, x_pos: 0, y_pos: 0, scroll_size: this.config.scroll_size + 1, x_inner: 0, y_inner: 0},
            e = i(this), r = n(this);
          if (r) {
            var o = r.getScrollState();
            o.visible && (t.x = o.size, t.x_inner = o.scrollSize), t.x_pos = o.position || 0
          }
          if (e) {
            var a = e.getScrollState();
            a.visible && (t.y = a.size, t.y_inner = a.scrollSize), t.y_pos = a.position || 0
          }
          return t
        }, getScrollState: function () {
          var t = this._scroll_state();
          return {x: t.x_pos, y: t.y_pos, inner_width: t.x, inner_height: t.y, width: t.x_inner, height: t.y_inner}
        }
      }
    }
  }, function (t, e) {
    t.exports = function (t) {
    }
  }, function (t, e, i) {
    var n = i(1);
    t.exports = function (t) {
      return {
        getVerticalScrollbar: function () {
          return t.$ui.getView("scrollVer")
        }, getHorizontalScrollbar: function () {
          return t.$ui.getView("scrollHor")
        }, _legacyGridResizerClass: function (t) {
          for (var e = t.getCellsByType("resizer"), i = 0; i < e.length; i++) {
            var n = e[i], r = !1, o = n.$parent.getPrevSibling(n.$id);
            if (o && o.$config && "grid" === o.$config.id) r = !0; else {
              var a = n.$parent.getNextSibling(n.$id);
              a && a.$config && "grid" === a.$config.id && (r = !0)
            }
            r && (n.$config.css = (n.$config.css ? n.$config.css + " " : "") + "jsgantt-grid-resize-wrap")
          }
        }, onCreated: function (e) {
          var i = !0;
          this._legacyGridResizerClass(e), e.attachEvent("onBeforeResize", function () {
            var r = t.$ui.getView("timeline");
            r && (r.$config.hidden = r.$parent.$config.hidden = !t.config.show_chart);
            var o = t.$ui.getView("grid");
            if (o) {
              var a = t.config.show_grid;
              if (i) {
                var s = o._getColsTotalWidth();
                !1 !== s && (t.config.grid_width = s), a = a && !!t.config.grid_width, t.config.show_grid = a
              }
              if (o.$config.hidden = o.$parent.$config.hidden = !a, !o.$config.hidden) {
                var l = o._getGridWidthLimits();
                if (l[0] && t.config.grid_width < l[0] && (t.config.grid_width = l[0]), l[1] && t.config.grid_width > l[1] && (t.config.grid_width = l[1]), r && t.config.show_chart) if (o.$config.width = t.config.grid_width - 1, i) o.$parent.$config.width = t.config.grid_width, o.$parent.$config.group && t.$layout._syncCellSizes(o.$parent.$config.group, o.$parent.$config.width); else if (r && !n.isChildOf(r.$task, e.$view)) {
                  if (!o.$config.original_grid_width) {
                    var c = {
                      config: {
                        grid_width: 350,
                        row_height: 23,
                        scale_height: 30,
                        link_line_width: 2,
                        link_arrow_size: 6,
                        lightbox_additional_height: 72
                      }, _second_column_width: 95, _third_column_width: 80
                    };
                    c && c.config && c.config.grid_width ? o.$config.original_grid_width = c.config.grid_width : o.$config.original_grid_width = 0
                  }
                  t.config.grid_width = o.$config.original_grid_width, o.$parent.$config.width = t.config.grid_width
                } else o.$parent._setContentSize(o.$config.width, o.$config.height), t.$layout._syncCellSizes(o.$parent.$config.group, t.config.grid_width); else r && n.isChildOf(r.$task, e.$view) && (o.$config.original_grid_width = t.config.grid_width), i || (o.$parent.$config.width = 0)
              }
              i = !1
            }
          }), this._initScrollStateEvents(e)
        }, _initScrollStateEvents: function (e) {
          t._getVerticalScrollbar = this.getVerticalScrollbar, t._getHorizontalScrollbar = this.getHorizontalScrollbar;
          var i = this.getVerticalScrollbar(), n = this.getHorizontalScrollbar();
          i && i.attachEvent("onScroll", function (e, i, n) {
            var r = t.getScrollState();
            t.callEvent("onGanttScroll", [r.x, e, r.x, i])
          }), n && n.attachEvent("onScroll", function (e, i, n) {
            var r = t.getScrollState();
            t.callEvent("onGanttScroll", [e, r.y, i, r.y])
          }), e.attachEvent("onResize", function () {
            i && !t.$scroll_ver && (t.$scroll_ver = i.$scroll_ver), n && !t.$scroll_hor && (t.$scroll_hor = n.$scroll_hor)
          })
        }, _findGridResizer: function (t, e) {
          for (var i, n = t.getCellsByType("resizer"), r = !0, o = 0; o < n.length; o++) {
            var a = n[o];
            a._getSiblings();
            var s = a._behind, l = a._front;
            if (s && s.$content === e || s.isChild && s.isChild(e)) {
              i = a, r = !0;
              break
            }
            if (l && l.$content === e || l.isChild && l.isChild(e)) {
              i = a, r = !1;
              break
            }
          }
          return {resizer: i, gridFirst: r}
        }, onInitialized: function (e) {
          var i = t.$ui.getView("grid"), n = this._findGridResizer(e, i);
          if (n.resizer) {
            var r, o = n.gridFirst, a = n.resizer;
            a.attachEvent("onResizeStart", function (e, i) {
              var n = t.$ui.getView("grid"), a = n ? n.$parent : null;
              if (a) {
                var s = n._getGridWidthLimits();
                n.$config.scrollable || (a.$config.minWidth = s[0]), a.$config.maxWidth = s[1]
              }
              return r = o ? e : i, t.callEvent("onPanelResizeStart", [r])
            }), a.attachEvent("onResize", function (e, i) {
              var n = o ? e : i;
              return t.callEvent("onPanelResize", [r, n])
            }), a.attachEvent("onResizeEnd", function (e, i, n, r) {
              var a = o ? e : i, s = o ? n : r, l = t.$ui.getView("grid"), c = l ? l.$parent : null;
              c && (c.$config.minWidth = void 0);
              var u = t.callEvent("onPanelResizeEnd", [a, s]);
              return u && (t.config.grid_width = s), u
            })
          }
        }, onDestroyed: function (t) {
        }
      }
    }
  }, function (t, e, i) {
    var n = i(1), r = function (t, e) {
      var i, r, o, a, s;

      function l() {
        return {link_source_id: a, link_target_id: r, link_from_start: s, link_to_start: o, link_landing_area: i}
      }

      var c = e.$services, u = c.getService("state"), d = c.getService("dnd");
      u.registerProvider("linksDnD", l);
      var h = new d(t.$task_bars, {sensitivity: 0, updates_per_second: 60});

      function f(i, n, r, o, a) {
        var s = function (i, n, r) {
          var o = function (t) {
            return e.getTaskPosition(t)
          }(i), a = {x: o.left, y: o.top, width: o.width, height: o.height};
          if (r.rtl ? (a.xEnd = a.x, a.x = a.xEnd + a.width) : a.xEnd = a.x + a.width, a.yEnd = a.y + a.height, e.getTaskType(i.type) == e.config.types.milestone) {
            var s = function () {
              var e = t.getItemHeight();
              return Math.round(Math.sqrt(2 * e * e)) - 2
            }();
            a.x += (r.rtl ? 1 : -1) * (s / 2), a.xEnd += (r.rtl ? -1 : 1) * (s / 2), a.width = o.xEnd - o.x
          }
          return a
        }(i, 0, o), l = {x: s.x, y: s.y};
        n || (l.x = s.xEnd), l.y += e.config.row_height / 2;
        var c = function (t) {
          return e.getTaskType(t.type) == e.config.types.milestone
        }(i) && a ? 2 : 0;
        return r = r || 0, o.rtl && (r *= -1), l.x += (n ? -1 : 1) * r - c, l
      }

      function g(t) {
        var i = l(), n = ["jsgantt-link-tooltip"];
        i.link_source_id && i.link_target_id && (e.isLinkAllowed(i.link_source_id, i.link_target_id, i.link_from_start, i.link_to_start) ? n.push("jsgantt-allowed-link") : n.push("jsgantt-invalid-link"));
        var r = e.templates.drag_link_class(i.link_source_id, i.link_from_start, i.link_target_id, i.link_to_start);
        r && n.push(r);
        var o = "<div class='" + r + "'>" + e.templates.drag_link(i.link_source_id, i.link_from_start, i.link_target_id, i.link_to_start) + "</div>";
        t.innerHTML = o
      }

      function p() {
        a = s = r = null, o = !0
      }

      function _(t, e, i, n) {
        return e >= t ? n <= i ? 1 : 4 : n <= i ? 2 : 3
      }

      h.attachEvent("onBeforeDragStart", e.bind(function (i, r) {
        var o = r.target;
        if (p(), e.getState().drag_id) return !1;
        if (n.locateClassName(o, "jsgantt-link-point")) {
          n.locateClassName(o, "task_start_date") && (s = !0);
          var l = e.locate(r);
          a = l;
          var c = e.getTask(l);
          return e.isReadonly(c) ? (p(), !1) : (this._dir_start = f(c, !!s, 0, t.$getConfig(), !0), !0)
        }
        return !1
      }, this)), h.attachEvent("onAfterDragStart", e.bind(function (t, i) {
        e.config.touch && e.refreshData(), g(h.config.marker)
      }, this)), h.attachEvent("onDragMove", e.bind(function (a, s) {
        var c = h.config, u = h.getPosition(s);
        !function (t, e) {
          t.style.left = e.x + 5 + "px", t.style.top = e.y + 5 + "px"
        }(c.marker, u);
        var d = !!n.locateClassName(s, "jsgantt-link-control"), p = r, v = i, m = o, y = e.locate(s), k = !0;
        if (n.isChildOf(s.target, e.$root) || (d = !1, y = null), d && (k = !n.locateClassName(s, "task_end_date"), d = !!y), r = y, i = d, o = k, d) {
          var b = e.getTask(y), w = t.$getConfig(), $ = n.locateClassName(s, "jsgantt-link-control"), x = 0;
          $ && (x = Math.floor($.offsetWidth / 2)), this._dir_end = f(b, !!o, x, w)
        } else this._dir_end = n.getRelativeEventPosition(s, t.$task_data);
        var S = !(v == d && p == y && m == k);
        return S && (p && e.refreshTask(p, !1), y && e.refreshTask(y, !1)), S && g(c.marker), function (i, n, r, o) {
          var a = (h._direction || (h._direction = document.createElement("div"), t.$task_links.appendChild(h._direction)), h._direction),
            s = l(), c = ["jsgantt-link-direction"];
          e.templates.link_direction_class && c.push(e.templates.link_direction_class(s.link_source_id, s.link_from_start, s.link_target_id, s.link_to_start));
          var u = Math.sqrt(Math.pow(r - i, 2) + Math.pow(o - n, 2));
          if (u = Math.max(0, u - 3)) {
            a.className = c.join(" ");
            var d = (o - n) / (r - i), f = Math.atan(d);
            2 == _(i, r, n, o) ? f += Math.PI : 3 == _(i, r, n, o) && (f -= Math.PI);
            var g = Math.sin(f), p = Math.cos(f), v = Math.round(n), m = Math.round(i),
              y = ["-webkit-transform: rotate(" + f + "rad)", "-moz-transform: rotate(" + f + "rad)", "-ms-transform: rotate(" + f + "rad)", "-o-transform: rotate(" + f + "rad)", "transform: rotate(" + f + "rad)", "width:" + Math.round(u) + "px"];
            if (-1 != window.navigator.userAgent.indexOf("MSIE 8.0")) {
              y.push('-ms-filter: "progid:DXImageTransform.Microsoft.Matrix(M11 = ' + p + ",M12 = -" + g + ",M21 = " + g + ",M22 = " + p + ",SizingMethod = 'auto expand')\"");
              var k = Math.abs(Math.round(i - r)), b = Math.abs(Math.round(o - n));
              switch (_(i, r, n, o)) {
                case 1:
                  v -= b;
                  break;
                case 2:
                  m -= k, v -= b;
                  break;
                case 3:
                  m -= k
              }
            }
            y.push("top:" + v + "px"), y.push("left:" + m + "px"), a.style.cssText = y.join(";")
          }
        }(this._dir_start.x, this._dir_start.y, this._dir_end.x, this._dir_end.y), !0
      }, this)), h.attachEvent("onDragEnd", e.bind(function () {
        var t = l();
        if (t.link_source_id && t.link_target_id && t.link_source_id != t.link_target_id) {
          var i = e._get_link_type(t.link_from_start, t.link_to_start),
            n = {source: t.link_source_id, target: t.link_target_id, type: i};
          n.type && e.isLinkAllowed(n) && e.addLink(n)
        }
        p(), e.config.touch ? e.refreshData() : (t.link_source_id && e.refreshTask(t.link_source_id, !1), t.link_target_id && e.refreshTask(t.link_target_id, !1)), h._direction && (h._direction.parentNode && h._direction.parentNode.removeChild(h._direction), h._direction = null)
      }, this))
    };
    t.exports = {
      createLinkDND: function () {
        return {init: r}
      }
    }
  }, function (t, e, i) {
    var n = i(1), r = i(0), o = i(37);
    t.exports = {
      createTaskDND: function () {
        var t;
        return {
          extend: function (e) {
            e.roundTaskDates = function (e) {
              t.round_task_dates(e)
            }
          }, init: function (e, i) {
            return t = function (t, e) {
              var i = e.$services;
              return {
                drag: null,
                dragMultiple: {},
                _events: {before_start: {}, before_finish: {}, after_finish: {}},
                _handlers: {},
                init: function () {
                  this._domEvents = e._createDomEventScope(), this.clear_drag_state();
                  var t = e.config.drag_mode;
                  this.set_actions(), i.getService("state").registerProvider("tasksDnd", r.bind(function () {
                    return {
                      drag_id: this.drag ? this.drag.id : void 0,
                      drag_mode: this.drag ? this.drag.mode : void 0,
                      drag_from_start: this.drag ? this.drag.left : void 0
                    }
                  }, this));
                  var n = {
                    before_start: "onBeforeTaskDrag",
                    before_finish: "onBeforeTaskChanged",
                    after_finish: "onAfterTaskDrag"
                  };
                  for (var o in this._events) for (var a in t) this._events[o][a] = n[o];
                  this._handlers[t.move] = this._move, this._handlers[t.resize] = this._resize, this._handlers[t.progress] = this._resize_progress
                },
                set_actions: function () {
                  var i = t.$task_data;
                  this._domEvents.attach(i, "mousemove", e.bind(function (t) {
                    this.on_mouse_move(t || event)
                  }, this)), this._domEvents.attach(i, "mousedown", e.bind(function (t) {
                    this.on_mouse_down(t || event)
                  }, this)), this._domEvents.attach(i, "mouseup", e.bind(function (t) {
                    this.on_mouse_up(t || event)
                  }, this))
                },
                clear_drag_state: function () {
                  this.drag = {
                    id: null,
                    mode: null,
                    pos: null,
                    start_x: null,
                    start_y: null,
                    obj: null,
                    left: null
                  }, this.dragMultiple = {}
                },
                _resize: function (i, n, r) {
                  var o = t.$getConfig(), a = this._drag_task_coords(i, r);
                  r.left ? (i.plannedDate = e.dateFromPos(a.start + n), i.plannedDate || (i.plannedDate = new Date(e.getState().min_date))) : (i.end_date = e.dateFromPos(a.end + n), i.end_date || (i.end_date = new Date(e.getState().max_date))), i.end_date - i.plannedDate < o.minDuration && (r.left ? i.plannedDate = e.calculateEndDate({
                    plannedDate: i.end_date,
                    duration: -1,
                    task: i
                  }) : i.end_date = e.calculateEndDate({
                    plannedDate: i.plannedDate,
                    duration: 1,
                    task: i
                  })), e._init_task_timing(i)
                },
                _resize_progress: function (e, i, n) {
                  var r = this._drag_task_coords(e, n), o = t.$getConfig().rtl ? r.start - n.pos.x : n.pos.x - r.start,
                    a = Math.max(0, o);
                  e.progress = Math.min(1, a / Math.abs(r.end - r.start))
                },
                _find_max_shift: function (t, i) {
                  var n;
                  for (var r in t) {
                    var o = t[r], a = e.getTask(o.id), s = this._drag_task_coords(a, o),
                      l = e.posFromDate(new Date(e.getState().min_date)),
                      c = e.posFromDate(new Date(e.getState().max_date));
                    if (s.end + i > c) {
                      var u = c - s.end;
                      (u < n || void 0 === n) && (n = u)
                    } else if (s.start + i < l) {
                      var d = l - s.start;
                      (d < n || void 0 === n) && (n = d)
                    }
                  }
                  return n
                },
                _move: function (t, i, n) {
                  var r = this._drag_task_coords(t, n), o = e.dateFromPos(r.start + i), a = e.dateFromPos(r.end + i);
                  o ? a ? (t.plannedDate = o, t.end_date = a) : (t.end_date = new Date(e.getState().max_date), t.plannedDate = e.dateFromPos(e.posFromDate(t.end_date) - (r.end - r.start))) : (t.plannedDate = new Date(e.getState().min_date), t.end_date = e.dateFromPos(e.posFromDate(t.plannedDate) + (r.end - r.start)))
                },
                _drag_task_coords: function (t, i) {
                  return {
                    start: i.obj_s_x = i.obj_s_x || e.posFromDate(t.plannedDate),
                    end: i.obj_e_x = i.obj_e_x || e.posFromDate(t.end_date)
                  }
                },
                _mouse_position_change: function (t, e) {
                  var i = t.x - e.x, n = t.y - e.y;
                  return Math.sqrt(i * i + n * n)
                },
                _is_number: function (t) {
                  return !isNaN(parseFloat(t)) && isFinite(t)
                },
                on_mouse_move: function (t) {
                  if (this.drag.start_drag) {
                    var i = n.getRelativeEventPosition(t, e.$task_data), r = this.drag.start_drag.start_x,
                      a = this.drag.start_drag.start_y;
                    (Date.now() - this.drag.timestamp > 50 || this._is_number(r) && this._is_number(a) && this._mouse_position_change({
                      x: r,
                      y: a
                    }, i) > 20) && this._start_dnd(t)
                  }
                  if (this.drag.mode) {
                    if (!o(this, 40)) return;
                    this._update_on_move(t)
                  }
                },
                _update_item_on_move: function (t, i, n, r, o) {
                  var a = e.getTask(i), s = e.mixin({}, a), l = e.mixin({}, a);
                  this._handlers[n].apply(this, [l, t, r]), e.mixin(a, l, !0), e.callEvent("onTaskDrag", [a.id, n, l, s, o]), e.mixin(a, l, !0), e.refreshTask(i)
                },
                _update_on_move: function (i) {
                  var o = this.drag, a = t.$getConfig();
                  if (o.mode) {
                    var s = n.getRelativeEventPosition(i, t.$task_data);
                    if (o.pos && o.pos.x == s.x) return;
                    o.pos = s;
                    var l = e.dateFromPos(s.x);
                    if (!l || isNaN(l.getTime())) return;
                    var c = s.x - o.start_x, u = e.getTask(o.id);
                    if (this._handlers[o.mode]) {
                      if (e.isSummaryTask(u) && e.config.drag_project && o.mode == a.drag_mode.move) {
                        var d = {};
                        d[o.id] = r.copy(o);
                        var h = this._find_max_shift(r.mixin(d, this.dragMultiple), c);
                        for (var f in void 0 !== h && (c = h), this._update_item_on_move(c, o.id, o.mode, o, i), this.dragMultiple) {
                          var g = this.dragMultiple[f];
                          this._update_item_on_move(c, g.id, g.mode, g, i)
                        }
                      } else this._update_item_on_move(c, o.id, o.mode, o, i);
                      e._update_parents(o.id)
                    }
                  }
                },
                on_mouse_down: function (i, r) {
                  if (2 != i.button || void 0 === i.button) {
                    var o = t.$getConfig(), a = e.locate(i), s = null;
                    if (e.isTaskExists(a) && (s = e.getTask(a)), !e.isReadonly(s) && !this.drag.mode) {
                      this.clear_drag_state(), r = r || i.target;
                      var l = n.getClassName(r), c = this._get_drag_mode(l, r);
                      if (!l || !c) return r.parentNode ? this.on_mouse_down(i, r.parentNode) : void 0;
                      if (c) if (c.mode && c.mode != o.drag_mode.ignore && o["drag_" + c.mode]) {
                        if (a = e.locate(r), s = e.copy(e.getTask(a) || {}), e.isReadonly(s)) return this.clear_drag_state(), !1;
                        if (e.isSummaryTask(s) && !o.drag_project && c.mode != o.drag_mode.progress) return void this.clear_drag_state();
                        c.id = a;
                        var u = n.getRelativeEventPosition(i, e.$task_data);
                        c.start_x = u.x, c.start_y = u.y, c.obj = s, this.drag.start_drag = c, this.drag.timestamp = Date.now()
                      } else this.clear_drag_state(); else if (e.checkEvent("onMouseDown") && e.callEvent("onMouseDown", [l.split(" ")[0]]) && r.parentNode) return this.on_mouse_down(i, r.parentNode)
                    }
                  }
                },
                _fix_dnd_scale_time: function (i, n) {
                  var r = t.$getConfig(), o = e.getScale().unit, a = e.getScale().step;

                  function s(i) {
                    if (e.config.correct_work_time) {
                      var n = t.$getConfig();
                      e.isWorkTime(i.plannedDate, void 0, i) || (i.plannedDate = e.calculateEndDate({
                        plannedDate: i.plannedDate,
                        duration: -1,
                        unit: n.durationUnit,
                        task: i
                      }))
                    }
                  }

                  r.round_dnd_dates || (o = "minute", a = r.time_step), n.mode == r.drag_mode.resize ? n.left ? (i.plannedDate = e.roundDate({
                    date: i.plannedDate,
                    unit: o,
                    step: a
                  }), s(i)) : (i.end_date = e.roundDate({date: i.end_date, unit: o, step: a}), function (i) {
                    if (e.config.correct_work_time) {
                      var n = t.$getConfig();
                      e.isWorkTime(new Date(i.end_date - 1), void 0, i) || (i.end_date = e.calculateEndDate({
                        plannedDate: i.end_date,
                        duration: 1,
                        unit: n.durationUnit,
                        task: i
                      }))
                    }
                  }(i)) : n.mode == r.drag_mode.move && (i.plannedDate = e.roundDate({
                    date: i.plannedDate,
                    unit: o,
                    step: a
                  }), s(i), i.end_date = e.calculateEndDate(i))
                },
                _fix_working_times: function (i, n) {
                  var r = t.$getConfig();
                  (n = n || {mode: r.drag_mode.move}).mode == r.drag_mode.resize ? n.left ? i.plannedDate = e.getClosestWorkTime({
                    date: i.plannedDate,
                    dir: "future",
                    task: i
                  }) : i.end_date = e.getClosestWorkTime({
                    date: i.end_date,
                    dir: "past",
                    task: i
                  }) : n.mode == r.drag_mode.move && e.correctTaskWorkTime(i)
                },
                _finalize_mouse_up: function (t, i, n, r) {
                  var o = e.getTask(t);
                  if (i.work_time && i.correct_work_time && this._fix_working_times(o, n), this._fix_dnd_scale_time(o, n), this._fireEvent("before_finish", n.mode, [t, n.mode, e.copy(n.obj), r])) {
                    var a = t;
                    e._init_task_timing(o), this.clear_drag_state(), e.updateTask(o.id), this._fireEvent("after_finish", n.mode, [a, n.mode, r])
                  } else this.clear_drag_state(), t == n.id && (n.obj._joc_changed = !1, e.mixin(o, n.obj, !0)), e.refreshTask(o.id)
                },
                on_mouse_up: function (i) {
                  var n = this.drag;
                  if (n.mode && n.id) {
                    var r = t.$getConfig(), o = e.getTask(n.id), a = this.dragMultiple;
                    if (e.isSummaryTask(o) && r.drag_project && n.mode == r.drag_mode.move) for (var s in a) this._finalize_mouse_up(a[s].id, r, a[s], i);
                    this._finalize_mouse_up(n.id, r, n, i)
                  }
                  this.clear_drag_state()
                },
                _get_drag_mode: function (e, i) {
                  var n = t.$getConfig().drag_mode, r = {mode: null, left: null};
                  switch ((e || "").split(" ")[0]) {
                    case"jsgantt-task-line":
                    case"jsgantt-task-content":
                      r.mode = n.move;
                      break;
                    case"jsgantt-task-drag":
                      r.mode = n.resize;
                      var o = i.getAttribute("data-bind-property");
                      r.left = "plannedDate" == o;
                      break;
                    case"jsgantt-task-progress-drag":
                      r.mode = n.progress;
                      break;
                    case"jsgantt-link-control":
                    case"jsgantt-link-point":
                      r.mode = n.ignore;
                      break;
                    default:
                      r = null
                  }
                  return r
                },
                _start_dnd: function (i) {
                  var n = this.drag = this.drag.start_drag;
                  delete n.start_drag;
                  var r = t.$getConfig(), o = n.id;
                  if (r["drag_" + n.mode] && e.callEvent("onBeforeDrag", [o, n.mode, i]) && this._fireEvent("before_start", n.mode, [o, n.mode, i])) {
                    delete n.start_drag;
                    var a = e.getTask(o);
                    e.isSummaryTask(a) && e.config.drag_project && n.mode == r.drag_mode.move && e.eachTask(function (t) {
                      this.dragMultiple[t.id] = e.mixin({id: t.id, obj: t}, this.drag)
                    }, a.id, this), e.callEvent("onTaskDragStart", [])
                  } else this.clear_drag_state()
                },
                _fireEvent: function (t, i, n) {
                  e.assert(this._events[t], "Invalid stage:{" + t + "}");
                  var r = this._events[t][i];
                  return e.assert(r, "Unknown after drop mode:{" + i + "}"), e.assert(n, "Invalid event arguments"), !e.checkEvent(r) || e.callEvent(r, n)
                },
                round_task_dates: function (e) {
                  var i = this.drag, n = t.$getConfig();
                  i || (i = {mode: n.drag_mode.move}), this._fix_dnd_scale_time(e, i)
                },
                destructor: function () {
                  this._domEvents.detachAll()
                }
              }
            }(e, i), e._tasks_dnd = t, t.init(i)
          }, destructor: function () {
            t && (t.destructor(), t = null)
          }
        }
      }
    }
  }, function (t, e, i) {
    var n = i(0), r = i(105), o = i(104), a = i(1);
    t.exports = function (t) {
      var e = t.$services;
      return {
        onCreated: function (e) {
          var a = e.$config;
          a.bind = n.defined(a.bind) ? a.bind : "task", a.bindLinks = n.defined(a.bindLinks) ? a.bindLinks : "link", e._linksDnD = o.createLinkDND(), e._tasksDnD = r.createTaskDND(), e._tasksDnD.extend(e), this._mouseDelegates = i(15)(t)
        }, onInitialized: function (e) {
          this._attachDomEvents(t), this._attachStateProvider(t, e), e._tasksDnD.init(e, t), e._linksDnD.init(e, t), "timeline" == e.$config.id && this.extendDom(e)
        }, onDestroyed: function (e) {
          this._clearDomEvents(t), this._clearStateProvider(t), e._tasksDnD && e._tasksDnD.destructor()
        }, extendDom: function (e) {
          t.$task = e.$task, t.$task_scale = e.$task_scale, t.$task_data = e.$task_data, t.$task_bg = e.$task_bg, t.$task_links = e.$task_links, t.$task_bars = e.$task_bars
        }, _clearDomEvents: function () {
          this._mouseDelegates.destructor(), this._mouseDelegates = null
        }, _attachDomEvents: function (t) {
          function e(t, e) {
            if (t && this.callEvent("onLinkDblClick", [t, e])) {
              var i = this.getLink(t);
              if (this.isReadonly(i)) return;
              this.locale.labels.link, this.templates.link_description(this.getLink(t)), this.locale.labels.confirm_link_deleting
            }
          }

          this._mouseDelegates.delegate("click", "jsgantt-task-link", t.bind(function (t, e) {
            var i = this.locate(t, this.config.link_attribute);
            i && this.callEvent("onLinkClick", [i, t])
          }, t), this.$task), this._mouseDelegates.delegate("click", "jsgantt-scale-cell", t.bind(function (e, i) {
            var n = a.getRelativeEventPosition(e, t.$task_data), r = t.dateFromPos(n.x),
              o = Math.floor(t.columnIndexByDate(r)), s = t.getScale().trace_x[o];
            t.callEvent("onScaleClick", [e, s])
          }, t), this.$task), this._mouseDelegates.delegate("doubleclick", "jsgantt-task-link", t.bind(function (i, n, r) {
            n = this.locate(i, t.config.link_attribute), e.call(this, n, i)
          }, t), this.$task), this._mouseDelegates.delegate("doubleclick", "jsgantt-link-point", t.bind(function (t, i, n) {
            i = this.locate(t);
            var r = this.getTask(i), o = null;
            return n.parentNode && a.getClassName(n.parentNode) && (o = a.getClassName(n.parentNode).indexOf("_left") > -1 ? r.$target[0] : r.$source[0]), o && e.call(this, o, t), !1
          }, t), this.$task)
        }, _attachStateProvider: function (t, i) {
          var n = i;
          e.getService("state").registerProvider("tasksTimeline", function () {
            return {scale_unit: n._tasks ? n._tasks.unit : void 0, scale_step: n._tasks ? n._tasks.step : void 0}
          })
        }, _clearStateProvider: function () {
          e.getService("state").unregisterProvider("tasksTimeline")
        }
      }
    }
  }, function (t, e, i) {
    var n = i(1);

    function r(t, e) {
      var i = n.getNodePosition(e.$grid_data);
      return t.x += i.x - e.$grid.scrollLeft, t.y += i.y - e.$grid_data.scrollTop, t
    }

    t.exports = {
      removeLineHighlight: function (t) {
        t.markerLine && t.markerLine.parentNode && t.markerLine.parentNode.removeChild(t.markerLine), t.markerLine = null
      }, highlightPosition: function (t, e, i) {
        var o = function (t, e) {
          var i = n.getNodePosition(e.$grid_data), r = n.getRelativeEventPosition(t, e.$grid_data),
            o = e.$config.rowStore, a = i.x, s = r.y - 10, l = e.$getConfig();
          s < i.y && (s = i.y);
          var c = o.countVisible() * l.row_height;
          return s > i.y + c - l.row_height && (s = i.y + c - l.row_height), i.x = a, i.y = s, i
        }(t, i);
        e.marker.style.left = o.x + 9 + "px", e.marker.style.top = o.y + "px";
        var a = e.markerLine;
        a || ((a = document.createElement("div")).className = "jsgantt-drag-marker jsgantt-grid-dnd-marker", a.innerHTML = "<div class='jsgantt-grid-dnd-marker-line'></div>", a.style.pointerEvents = "none", document.body.appendChild(a), e.markerLine = a), t.child ? function (t, e, i) {
          var n = t.targetParent, o = r({x: 0, y: i.getItemTop(n)}, i);
          e.innerHTML = "<div class='jsgantt-grid-dnd-marker-folder'></div>", e.style.width = i.$grid_data.offsetWidth + "px", e.style.top = o.y + "px", e.style.left = o.x + "px", e.style.height = i.getItemHeight(n) + "px"
        }(t, a, i) : function (t, e, i) {
          var n = function (t, e) {
            var i = e.$config.rowStore, n = {x: 0, y: 0}, o = e.$grid_data.querySelector(".jsgantt-tree-indent"),
              a = 15, s = 0;
            if (o && (a = o.offsetWidth), t.targetId !== i.$getRootId()) {
              var l = e.getItemTop(t.targetId), c = e.getItemHeight(t.targetId);
              if (s = i.exists(t.targetId) ? i.calculateItemLevel(i.getItem(t.targetId)) : 0, t.prevSibling) n.y = l; else if (t.nextSibling) {
                var u = 0;
                i.eachItem(function (t) {
                  -1 !== i.getIndexById(t.id) && u++
                }, t.targetId), n.y = l + c + u * c
              } else n.y = l + c, s += 1
            }
            return n.x = 40 + s * a, n.width = Math.max(e.$grid_data.offsetWidth - n.x, 0), r(n, e)
          }(t, i);
          e.innerHTML = "<div class='jsgantt-grid-dnd-marker-line'></div>", e.style.left = n.x + "px", e.style.height = "4px", e.style.top = n.y - 2 + "px", e.style.width = n.width + "px"
        }(t, a, i)
      }
    }
  }, function (t, e, i) {
    var n = i(13);
    t.exports = function (t, e, i, r, o) {
      var a;
      if (e !== o.$getRootId()) a = i < .25 ? n.prevSiblingTarget(t, e, o) : !(i > .6) || o.hasChild(e) && o.getItem(e).$open ? n.firstChildTarget(t, e, o) : n.nextSiblingTarget(t, e, o); else {
        var s = o.$getRootId();
        a = o.hasChild(s) && r >= 0 ? n.lastChildTarget(t, s, o) : n.firstChildTarget(t, s, o)
      }
      return a
    }
  }, function (t, e, i) {
    var n = i(13);

    function r(t, e, i, r, o) {
      for (var a = e; r.exists(a);) {
        var s = r.calculateItemLevel(r.getItem(a));
        if ((s === i || s === i - 1) && r.getBranchIndex(a) > -1) break;
        a = o ? r.getPrev(a) : r.getNext(a)
      }
      return r.exists(a) ? r.calculateItemLevel(r.getItem(a)) === i ? o ? n.nextSiblingTarget(t, a, r) : n.prevSiblingTarget(t, a, r) : n.firstChildTarget(t, a, r) : null
    }

    function o(t, e, i, n) {
      return r(t, e, i, n, !0)
    }

    function a(t, e, i, n) {
      return r(t, e, i, n, !1)
    }

    t.exports = function (t, e, i, r, s, l) {
      var c;
      if (e !== s.$getRootId()) i < .5 ? s.calculateItemLevel(s.getItem(e)) === l ? c = s.getPrevSibling(e) ? n.nextSiblingTarget(t, s.getPrevSibling(e), s) : n.prevSiblingTarget(t, e, s) : (c = o(t, e, l, s)) && (c = a(t, e, l, s)) : s.calculateItemLevel(s.getItem(e)) === l ? c = n.nextSiblingTarget(t, e, s) : (c = a(t, e, l, s)) && (c = o(t, e, l, s)); else {
        var u = s.$getRootId(), d = s.getChildren(u);
        c = n.createDropTargetObject(), c = d.length && r >= 0 ? o(t, function (t) {
          for (var e = t.getNext(); t.exists(e);) {
            var i = t.getNext(e);
            if (!t.exists(i)) return e;
            e = i
          }
          return null
        }(s), l, s) : a(t, u, l, s)
      }
      return c
    }
  }, function (t, e, i) {
    var n = i(1), r = i(13), o = i(109), a = i(108), s = i(107);
    t.exports = {
      init: function (t, e) {
        var i = t.$services.getService("dnd");
        if (e.$config.bind && t.getDatastore(e.$config.bind)) {
          var l = new i(e.$grid_data, {updates_per_second: 60});
          t.defined(e.$getConfig().dnd_sensitivity) && (l.config.sensitivity = e.$getConfig().dnd_sensitivity), l.attachEvent("onBeforeDragStart", t.bind(function (i, r) {
            var o = c(r);
            if (!o) return !1;
            if (t.hideQuickInfo && t._hideQuickInfo(), n.closest(r.target, ".jsgantt-grid-editor-placeholder")) return !1;
            var a = o.getAttribute(e.$config.item_attribute), s = e.$config.rowStore.getItem(a);
            return !t.isReadonly(s) && (l.config.initial_open_state = s.$open, !!t.callEvent("onRowDragStart", [a, r.target, r]) && void 0)
          }, t)), l.attachEvent("onAfterDragStart", t.bind(function (t, i) {
            var n = c(i);
            l.config.marker.innerHTML = n.outerHTML;
            var o = l.config.marker.firstChild;
            o && (l.config.marker.style.opacity = .4, o.style.position = "static", o.style.pointerEvents = "none"), l.config.id = n.getAttribute(e.$config.item_attribute);
            var a = e.$config.rowStore, s = a.getItem(l.config.id);
            l.config.level = a.calculateItemLevel(s), l.config.drop_target = r.createDropTargetObject({
              targetParent: a.getParent(s.id),
              targetIndex: a.getBranchIndex(s.id),
              targetId: s.id,
              nextSibling: !0
            }), s.$open = !1, s.$transparent = !0, this.refreshData()
          }, t)), l.attachEvent("onDragMove", t.bind(function (i, n) {
            var o = u(n);
            return o && !1 !== t.callEvent("onBeforeRowDragMove", [l.config.id, o.targetParent, o.targetIndex]) || (o = r.createDropTargetObject(l.config.drop_target)), s.highlightPosition(o, l.config, e), l.config.drop_target = o, this.callEvent("onRowDragMove", [l.config.id, o.targetParent, o.targetIndex]), !0
          }, t)), l.attachEvent("onDragEnd", t.bind(function () {
            var t = e.$config.rowStore, i = t.getItem(l.config.id);
            s.removeLineHighlight(l.config), i.$transparent = !1, i.$open = l.config.initial_open_state;
            var n = l.config.drop_target;
            !1 === this.callEvent("onBeforeRowDragEnd", [l.config.id, n.targetParent, n.targetIndex]) ? i.$drop_target = null : (t.move(l.config.id, n.targetIndex, n.targetParent), this.callEvent("onRowDragEnd", [l.config.id, n.targetParent, n.targetIndex])), t.refresh(i.id)
          }, t))
        }

        function c(t) {
          return n.locateAttribute(t, e.$config.item_attribute)
        }

        function u(t) {
          var i = function (t) {
              var i = n.getRelativeEventPosition(t, e.$grid_data).y, r = e.$config.rowStore;
              if ((i = i || 0) < 0) return r.$getRootId();
              var o = Math.floor(i / e.getItemHeight());
              return o > r.countVisible() - 1 ? r.$getRootId() : r.getIdByIndex(o)
            }(t), r = null, s = e.$config.rowStore, c = !e.$getConfig().order_branch_free,
            u = n.getRelativeEventPosition(t, e.$grid_data).y;
          return i !== s.$getRootId() && (r = (u - e.getItemTop(i)) / e.getItemHeight()), c ? o(l.config.id, i, r, u, s, l.config.level) : a(l.config.id, i, r, u, s)
        }
      }
    }
  }, function (t, e, i) {
    var n = i(1);
    t.exports = {
      init: function (t, e) {
        var i = t.$services.getService("dnd");
        if (e.$config.bind && t.getDatastore(e.$config.bind)) {
          var r = new i(e.$grid_data, {updates_per_second: 60});
          t.defined(e.$getConfig().dnd_sensitivity) && (r.config.sensitivity = e.$getConfig().dnd_sensitivity), r.attachEvent("onBeforeDragStart", t.bind(function (i, s) {
            var l = o(s);
            if (!l) return !1;
            if (t.hideQuickInfo && t._hideQuickInfo(), n.closest(s.target, ".jsgantt-grid-editor-placeholder")) return !1;
            var c = l.getAttribute(e.$config.item_attribute), u = a().getItem(c);
            return !t.isReadonly(u) && (r.config.initial_open_state = u.$open, !!t.callEvent("onRowDragStart", [c, s.target, s]) && void 0)
          }, t)), r.attachEvent("onAfterDragStart", t.bind(function (t, i) {
            var n = o(i);
            r.config.marker.innerHTML = n.outerHTML;
            var s = r.config.marker.firstChild;
            s && (s.style.position = "static"), r.config.id = n.getAttribute(e.$config.item_attribute);
            var l = a(), c = l.getItem(r.config.id);
            r.config.index = l.getBranchIndex(r.config.id), r.config.parent = c.parent, c.$open = !1, c.$transparent = !0, this.refreshData()
          }, t)), r.lastTaskOfLevel = function (t) {
            for (var e = null, i = a().getItems(), n = 0, r = i.length; n < r; n++) i[n].$level == t && (e = i[n]);
            return e ? e.id : null
          }, r._getGridPos = t.bind(function (t) {
            var i = n.getNodePosition(e.$grid_data), r = a(), o = i.x, s = t.pos.y - 10, l = e.$getConfig();
            s < i.y && (s = i.y);
            var c = r.countVisible() * l.row_height;
            return s > i.y + c - l.row_height && (s = i.y + c - l.row_height), i.x = o, i.y = s, i
          }, t), r._getTargetY = t.bind(function (t) {
            var i = n.getNodePosition(e.$grid_data), r = t.pageY - i.y + (e.$state.scrollTop || 0);
            return r < 0 && (r = 0), r
          }, t), r._getTaskByY = t.bind(function (t, i) {
            var n = e.$getConfig(), r = a();
            t = t || 0;
            var o = Math.floor(t / n.row_height);
            return (o = i < o ? o - 1 : o) > r.countVisible() - 1 ? null : r.getIdByIndex(o)
          }, t), r.attachEvent("onDragMove", t.bind(function (t, i) {
            var n = r.config, o = r._getGridPos(i), s = e.$getConfig(), l = a();
            n.marker.style.left = o.x + 10 + "px", n.marker.style.top = o.y + "px";
            var c = l.getItem(r.config.id), u = r._getTargetY(i), d = r._getTaskByY(u, l.getIndexById(c.id));

            function h(t, e) {
              return !l.isChildOf(f.id, e.id) && (t.$level == e.$level || s.order_branch_free)
            }

            if (l.exists(d) || (d = r.lastTaskOfLevel(s.order_branch_free ? c.$level : 0)) == r.config.id && (d = null), l.exists(d)) {
              var f = l.getItem(d);
              if (l.getIndexById(f.id) * s.row_height + s.row_height / 2 < u) {
                var g = l.getIndexById(f.id), p = l.getNext(f.id), _ = l.getItem(p);
                if (_) {
                  if (_.id == c.id) return s.order_branch_free && l.isChildOf(c.id, f.id) && 1 == l.getChildren(f.id).length ? void l.move(c.id, l.getBranchIndex(f.id) + 1, l.getParent(f.id)) : void 0;
                  f = _
                } else if (p = l.getIdByIndex(g), h(_ = l.getItem(p), c) && _.id != c.id) return void l.move(c.id, -1, l.getParent(_.id))
              } else if (s.order_branch_free && f.id != c.id && h(f, c)) {
                if (!l.hasChild(f.id)) return f.$open = !0, void l.move(c.id, -1, f.id);
                if (l.getIndexById(f.id) || s.row_height / 3 < u) return
              }
              g = l.getIndexById(f.id);
              for (var v = l.getIdByIndex(g - 1), m = l.getItem(v), y = 1; (!m || m.id == f.id) && g - y >= 0;) v = l.getIdByIndex(g - y), m = l.getItem(v), y++;
              if (c.id == f.id) return;
              h(f, c) && c.id != f.id ? l.move(c.id, 0, 0, f.id) : f.$level != c.$level - 1 || l.getChildren(f.id).length ? m && h(m, c) && c.id != m.id && l.move(c.id, -1, l.getParent(m.id)) : l.move(c.id, 0, f.id)
            }
            return !0
          }, t)), r.attachEvent("onDragEnd", t.bind(function () {
            var t = a(), e = t.getItem(r.config.id);
            e.$transparent = !1, e.$open = r.config.initial_open_state, !1 === this.callEvent("onBeforeRowDragEnd", [r.config.id, r.config.parent, r.config.index]) ? (t.move(r.config.id, r.config.index, r.config.parent), e.$drop_target = null) : this.callEvent("onRowDragEnd", [r.config.id, e.$drop_target]), this.refreshData()
          }, t))
        }

        function o(t) {
          return n.locateAttribute(t, e.$config.item_attribute)
        }

        function a() {
          return t.getDatastore(e.$config.bind)
        }
      }
    }
  }, function (t, e, i) {
    var n = i(0), r = i(111), o = i(110);
    t.exports = function (t) {
      return {
        onCreated: function (e) {
          e.$config = n.mixin(e.$config, {bind: "task"}), "grid" == e.$config.id && (this.extendGantt(e), t.ext.inlineEditors = t.ext._inlineEditors.createEditors(e), t.ext.inlineEditors.init()), this._mouseDelegates = i(15)(t)
        }, onInitialized: function (e) {
          var i = e.$getConfig();
          i.order_branch && ("marker" == i.order_branch ? o.init(e.$jsgantt, e) : r.init(e.$jsgantt, e)), this.initEvents(e, t), "grid" == e.$config.id && this.extendDom(e)
        }, onDestroyed: function (e) {
          "grid" == e.$config.id && t.ext.inlineEditors.destructor(), this.clearEvents(e, t)
        }, initEvents: function (t, e) {
          this._mouseDelegates.delegate("click", "jsgantt-row", e.bind(function (i, n, r) {
            var o = t.$getConfig();
            if (null !== n) {
              var a = this.getTask(n);
              o.scroll_on_click && !e._is_icon_open_click(i) && this.showDate(a.plannedDate), e.callEvent("onTaskRowClick", [n, r])
            }
          }, e), t.$grid), this._mouseDelegates.delegate("click", "jsgantt-grid-head-cell", e.bind(function (i, n, r) {
            var o = r.getAttribute("data-column-id");
            if (e.callEvent("onPanelHeaderClick", [o, i])) {
              var a = t.$getConfig();
              if ("add" != o) {
                if (a.sort) {
                  for (var s, l = o, c = 0; c < a.columns.length; c++) if (a.columns[c].name == o) {
                    s = a.columns[c];
                    break
                  }
                  if (s && void 0 !== s.sort && !0 !== s.sort && !(l = s.sort)) return;
                  var u = this._sort && this._sort.direction && this._sort.name == o ? this._sort.direction : "desc";
                  u = "desc" == u ? "asc" : "desc", this._sort = {name: o, direction: u}, this.sort(l, "desc" == u)
                }
              } else e.$services.getService("mouseEvents").callHandler("click", "jsgantt-add", t.$grid, [i, a.root_id])
            }
          }, e), t.$grid), this._mouseDelegates.delegate("click", "jsgantt-add", e.bind(function (i, n, r) {
            if (!t.$getConfig().readonly) return this.createTask({}, n || e.config.root_id), !1
          }, e), t.$grid)
        }, clearEvents: function (t, e) {
          this._mouseDelegates.destructor(), this._mouseDelegates = null
        }, extendDom: function (e) {
          t.$grid = e.$grid, t.$grid_scale = e.$grid_scale, t.$grid_data = e.$grid_data
        }, extendGantt: function (e) {
          t.getGridColumns = t.bind(e.getGridColumns, e), e.attachEvent("onColumnResizeStart", function () {
            return t.callEvent("onColumnResizeStart", arguments)
          }), e.attachEvent("onColumnResize", function () {
            return t.callEvent("onColumnResize", arguments)
          }), e.attachEvent("onColumnResizeEnd", function () {
            return t.callEvent("onColumnResizeEnd", arguments)
          }), e.attachEvent("onColumnResizeComplete", function (e, i) {
            t.config.grid_width = i
          })
        }
      }
    }
  }, function (t, e, i) {
    var n = i(3);
    t.exports = function (t) {
      return function (e, i) {
        var r = i.getGridColumns(), o = i.$getConfig(), a = i.$getTemplates(), s = i.$config.rowStore;
        o.rtl && (r = r.reverse());
        for (var l = [], c = 0; c < r.length; c++) {
          var u, d, h, f = c == r.length - 1, g = r[c];
          "add" == g.name ? (d = "<div " + (y = t._waiAria.gridAddButtonAttrString(g)) + " class='jsgantt-add'></div>", h = "") : (d = g.template ? g.template(e) : e[g.name], n.isDate(d) && (d = a.date_grid(d, e)), h = d, d = "<div class='jsgantt-tree-content'>" + d + "</div>");
          var p = "jsgantt-cell" + (f ? " jsgantt-last-cell" : ""), _ = [];
          if (g.tree) {
            for (var v = 0; v < e.$level; v++) _.push(a.grid_indent(e));
            s.hasChild(e.id) && !t.isSplitTask(e) ? (_.push(a.grid_open(e)), _.push(a.grid_folder(e))) : (_.push(a.grid_blank(e)), _.push(a.grid_file(e)))
          }
          var m = "width:" + (g.width - (f ? 1 : 0)) + "px;";
          this.defined(g.align) && (m += "text-align:" + g.align + ";");
          var y = t._waiAria.gridCellAttrString(g, h);
          _.push(d), o.rtl && (_ = _.reverse()), u = "<div class='" + p + "' data-column-index='" + c + "' data-column-name='" + g.name + "' style='" + m + "' " + y + ">" + _.join("") + "</div>", l.push(u)
        }
        if (p = t.getGlobalTaskIndex(e.id) % 2 == 0 ? "" : " odd", p += e.$transparent ? " jsgantt-transparent" : "", p += e.$dataprocessor_class ? " " + e.$dataprocessor_class : "", a.grid_row_class) {
          var k = a.grid_row_class.call(t, e.plannedDate, e.end_date, e);
          k && (p += " " + k)
        }
        s.getSelectedId() == e.id && (p += " jsgantt-selected");
        var b = document.createElement("div");
        b.className = "jsgantt-row" + p + " jsgantt-row-" + t.getTaskType(e.type);
        var w = i.getItemHeight();
        return b.style.height = w + "px", b.style.lineHeight = w + "px", o.smart_rendering && (b.style.position = "absolute", b.style.left = "0px", b.style.top = i.getItemTop(e.id) + "px"), i.$config.item_attribute && b.setAttribute(i.$config.item_attribute, e.id), t._waiAria.taskRowAttr(e, b), b.innerHTML = l.join(""), b
      }
    }
  }, function (t, e) {
    t.exports = function (t) {
      var e = {
        current_pos: null, dirs: {left: "left", right: "right", up: "up", down: "down"}, path: [], clear: function () {
          this.current_pos = null, this.path = []
        }, point: function (e) {
          this.current_pos = t.copy(e)
        }, get_lines: function (t) {
          this.clear(), this.point(t[0]);
          for (var e = 1; e < t.length; e++) this.line_to(t[e]);
          return this.get_path()
        }, line_to: function (e) {
          var i = t.copy(e), n = this.current_pos, r = this._get_line(n, i);
          this.path.push(r), this.current_pos = i
        }, get_path: function () {
          return this.path
        }, get_wrapper_sizes: function (t, e) {
          var i, n = e.$getConfig(), r = n.link_wrapper_width, o = t.y + (n.row_height - r) / 2;
          switch (t.direction) {
            case this.dirs.left:
              i = {top: o, height: r, lineHeight: r, left: t.x - t.size - r / 2, width: t.size + r};
              break;
            case this.dirs.right:
              i = {top: o, lineHeight: r, height: r, left: t.x - r / 2, width: t.size + r};
              break;
            case this.dirs.up:
              i = {top: o - t.size, lineHeight: t.size + r, height: t.size + r, left: t.x - r / 2, width: r};
              break;
            case this.dirs.down:
              i = {top: o, lineHeight: t.size + r, height: t.size + r, left: t.x - r / 2, width: r}
          }
          return i
        }, get_line_sizes: function (t, e) {
          var i, n = e.$getConfig(), r = n.link_line_width, o = n.link_wrapper_width, a = t.size + r;
          switch (t.direction) {
            case this.dirs.left:
            case this.dirs.right:
              i = {height: r, width: a, marginTop: (o - r) / 2, marginLeft: (o - r) / 2};
              break;
            case this.dirs.up:
            case this.dirs.down:
              i = {height: a, width: r, marginTop: (o - r) / 2, marginLeft: (o - r) / 2}
          }
          return i
        }, render_line: function (t, e, i) {
          var n = this.get_wrapper_sizes(t, i), r = document.createElement("div");
          r.style.cssText = ["top:" + n.top + "px", "left:" + n.left + "px", "height:" + n.height + "px", "width:" + n.width + "px"].join(";"), r.className = "jsgantt-line-wrapper";
          var o = this.get_line_sizes(t, i), a = document.createElement("div");
          return a.style.cssText = ["height:" + o.height + "px", "width:" + o.width + "px", "margin-top:" + o.marginTop + "px", "margin-left:" + o.marginLeft + "px"].join(";"), a.className = "jsgantt-link-line-" + t.direction, r.appendChild(a), r
        }, _get_line: function (t, e) {
          var i = this.get_direction(t, e), n = {x: t.x, y: t.y, direction: this.get_direction(t, e)};
          return i == this.dirs.left || i == this.dirs.right ? n.size = Math.abs(t.x - e.x) : n.size = Math.abs(t.y - e.y), n
        }, get_direction: function (t, e) {
          return e.x < t.x ? this.dirs.left : e.x > t.x ? this.dirs.right : e.y > t.y ? this.dirs.down : this.dirs.up
        }
      }, i = {
        path: [], clear: function () {
          this.path = []
        }, current: function () {
          return this.path[this.path.length - 1]
        }, point: function (e) {
          return e ? (this.path.push(t.copy(e)), e) : this.current()
        }, point_to: function (i, n, r) {
          r = r ? {x: r.x, y: r.y} : t.copy(this.point());
          var o = e.dirs;
          switch (i) {
            case o.left:
              r.x -= n;
              break;
            case o.right:
              r.x += n;
              break;
            case o.up:
              r.y -= n;
              break;
            case o.down:
              r.y += n
          }
          return this.point(r)
        }, get_points: function (i, n) {
          var r = this.get_endpoint(i, n), o = t.config, a = r.e_y - r.y, s = r.e_x - r.x, l = e.dirs;
          this.clear(), this.point({x: r.x, y: r.y});
          var c = 2 * o.link_arrow_size, u = this.get_line_type(i, n.$getConfig()), d = r.e_x > r.x;
          if (u.from_start && u.to_start) this.point_to(l.left, c), d ? (this.point_to(l.down, a), this.point_to(l.right, s)) : (this.point_to(l.right, s), this.point_to(l.down, a)), this.point_to(l.right, c); else if (!u.from_start && u.to_start) if (d = r.e_x > r.x + 2 * c, this.point_to(l.right, c), d) s -= c, this.point_to(l.down, a), this.point_to(l.right, s); else {
            s -= 2 * c;
            var h = a > 0 ? 1 : -1;
            this.point_to(l.down, h * (o.row_height / 2)), this.point_to(l.right, s), this.point_to(l.down, h * (Math.abs(a) - o.row_height / 2)), this.point_to(l.right, c)
          } else u.from_start || u.to_start ? u.from_start && !u.to_start && (d = r.e_x > r.x - 2 * c, this.point_to(l.left, c), d ? (s += 2 * c, h = a > 0 ? 1 : -1, this.point_to(l.down, h * (o.row_height / 2)), this.point_to(l.right, s), this.point_to(l.down, h * (Math.abs(a) - o.row_height / 2)), this.point_to(l.left, c)) : (s += c, this.point_to(l.down, a), this.point_to(l.right, s))) : (this.point_to(l.right, c), d ? (this.point_to(l.right, s), this.point_to(l.down, a)) : (this.point_to(l.down, a), this.point_to(l.right, s)), this.point_to(l.left, c));
          return this.path
        }, get_line_type: function (e, i) {
          var n = i.links, r = !1, o = !1;
          return e.type == n.start_to_start ? r = o = !0 : e.type == n.finish_to_finish ? r = o = !1 : e.type == n.finish_to_start ? (r = !1, o = !0) : e.type == n.start_to_finish ? (r = !0, o = !1) : t.assert(!1, "Invalid link type"), i.rtl && (r = !r, o = !o), {
            from_start: r,
            to_start: o
          }
        }, get_endpoint: function (e, i) {
          var r = i.$getConfig(), o = this.get_line_type(e, r), a = o.from_start, s = o.to_start,
            l = t.getTask(e.source), c = t.getTask(e.target), u = n(l, i), d = n(c, i);
          return {x: a ? u.left : u.left + u.width, e_x: s ? d.left : d.left + d.width, y: u.top, e_y: d.top}
        }
      };

      function n(e, i) {
        var n = i.$getConfig(), r = i.getItemPosition(e);
        if (t.getTaskType(e.type) == n.types.milestone) {
          var o = t.getTaskHeight(), a = Math.sqrt(2 * o * o);
          r.left -= a / 2, r.width = a
        }
        return r
      }

      return function (n, r) {
        var o = r.$getConfig(), a = i.get_endpoint(n, r), s = a.e_y - a.y;
        if (!(a.e_x - a.x || s)) return null;
        var l = i.get_points(n, r), c = e.get_lines(l, r), u = document.createElement("div"), d = "jsgantt-task-link";
        n.color && (d += " jsgantt-link-inline-color");
        var h = t.templates.link_class ? t.templates.link_class(n) : "";
        h && (d += " " + h), o.highlight_critical_path && t.isCriticalLink && t.isCriticalLink(n) && (d += " jsgantt-critical-link"), u.className = d, r.$config.link_attribute && u.setAttribute(r.$config.link_attribute, n.id);
        for (var f = 0; f < c.length; f++) {
          f == c.length - 1 && (c[f].size -= o.link_arrow_size);
          var g = e.render_line(c[f], c[f + 1], r);
          n.color && (g.firstChild.style.backgroundColor = n.color), u.appendChild(g)
        }
        var p = c[c.length - 1].direction, _ = function (t, i, n) {
          var r = n.$getConfig(), o = document.createElement("div"), a = t.y, s = t.x, l = r.link_arrow_size,
            c = r.row_height, u = "jsgantt-link-arrow jsgantt-link-arrow-" + i;
          switch (i) {
            case e.dirs.right:
              a -= (l - c) / 2, s -= l;
              break;
            case e.dirs.left:
              a -= (l - c) / 2;
              break;
            case e.dirs.up:
              s -= l;
              break;
            case e.dirs.down:
              a += 2 * l, s -= l
          }
          return o.style.cssText = ["top:" + a + "px", "left:" + s + "px"].join(";"), o.className = u, o
        }(l[l.length - 1], p, r);
        return n.color && (_.style.borderColor = n.color), u.appendChild(_), t._waiAria.linkAttr(n, u), u
      }
    }
  }, function (t, e) {
    t.exports = function (t) {
      return function (e, i) {
        var n = i.$getConfig(), r = i.$getTemplates(), o = i.getScale(), a = o.count, s = document.createElement("div");
        if (n.show_task_cells) for (var l = 0; l < a; l++) {
          var c = o.width[l], u = "";
          if (c > 0) {
            var d = document.createElement("div");
            d.style.width = c + "px", u = "jsgantt-task-cell" + (l == a - 1 ? " jsgantt-last-cell" : ""), (f = r.task_cell_class(e, o.trace_x[l])) && (u += " " + f), d.className = u, s.appendChild(d)
          }
        }
        var h = t.getGlobalTaskIndex(e.id) % 2 != 0, f = r.task_row_class(e.plannedDate, e.end_date, e),
          g = "jsgantt-task-row" + (h ? " odd" : "") + (f ? " " + f : "");
        return i.$config.rowStore.getSelectedId() == e.id && (g += " jsgantt-selected"), s.className = g, n.smart_rendering && (s.style.position = "absolute", s.style.top = i.getItemTop(e.id) + "px", s.style.width = "100%"), s.style.height = n.row_height + "px", i.$config.item_attribute && s.setAttribute(i.$config.item_attribute, e.id), s
      }
    }
  }, function (t, e, i) {
    t.exports = function (t) {
      var e = i(30)(t);
      return function (i, n) {
        if (t.isSplitTask(i)) {
          for (var r = document.createElement("div"), o = t.getTaskPosition(i), a = t.getChildren(i.id), s = 0; s < a.length; s++) {
            var l = t.getTask(a[s]), c = e(l, n);
            if (c) {
              var u = Math.floor((t.config.row_height - o.height) / 2);
              c.style.top = o.top + u + "px", c.className += " jsgantt-split-child", r.appendChild(c)
            }
          }
          return r
        }
        return !1
      }
    }
  }, function (t, e, i) {
    t.exports = function (t) {
      var e = i(7)(t), n = i(0);

      function r() {
        return e.apply(this, arguments) || this
      }

      function o(t, e) {
        for (var i = (t || "").split(e.delimiter || ","), n = 0; n < i.length; n++) {
          var r = i[n].trim();
          r ? i[n] = r : (i.splice(n, 1), n--)
        }
        return i.sort(), i
      }

      function a(t, e, i) {
        for (var n = t.$target, r = [], o = 0; o < n.length; o++) {
          var a = i.getLink(n[o]), s = i.getTask(a.source);
          r.push(i.getWBSCode(s))
        }
        return r.join((e.delimiter || ",") + " ")
      }

      return i(2)(r, e), n.mixin(r.prototype, {
        show: function (t, e, i, n) {
          var r = "<div><input type='text' name='" + e.name + "'></div>";
          n.innerHTML = r
        }, hide: function () {
        }, set_value: function (e, i, n, r) {
          this.get_input(r).value = a(e, n.editor, t)
        }, get_value: function (t, e, i) {
          return o(this.get_input(i).value || "", e.editor)
        }, save: function (e, i, n) {
          var r = function (e, i) {
            var n = function (e, i) {
              var n = [];
              return i.forEach(function (i) {
                var r = t.getTaskByWBSCode(i);
                if (r) {
                  var o = {source: r.id, target: e, type: t.config.links.finish_to_start, lag: 0};
                  t.isLinkAllowed(o) && n.push(o)
                }
              }), n
            }(e.id, i), r = {};
            e.$target.forEach(function (e) {
              var i = t.getLink(e);
              r[i.source + "_" + i.target] = i.id
            });
            var o = [];
            n.forEach(function (t) {
              var e = t.source + "_" + t.target;
              r[e] ? delete r[e] : o.push(t)
            });
            var a = [];
            for (var s in r) a.push(r[s]);
            return {add: o, remove: a}
          }(t.getTask(e), this.get_value(e, i, n));
          (r.add.length || r.remove.length) && t.batchUpdate(function () {
            r.add.forEach(function (e) {
              t.addLink(e)
            }), r.remove.forEach(function (e) {
              t.deleteLink(e)
            }), t.autoSchedule && t.autoSchedule()
          })
        }, is_changed: function (e, i, n, r) {
          var s = this.get_value(i, n, r), l = o(a(e, n.editor, t), n.editor);
          return s.join() !== l.join()
        }
      }, !0), r
    }
  }, function (t, e, i) {
    t.exports = function (t) {
      var e = i(7)(t), n = i(0), r = "%Y-%m-%d", o = null, a = null;

      function s() {
        return e.apply(this, arguments) || this
      }

      return i(2)(s, e), n.mixin(s.prototype, {
        show: function (e, i, n, s) {
          o || (o = t.date.date_to_str(r)), a || (a = t.date.str_to_date(r));
          var l = "<div style='width:140px'><input type='date' min='" + o(n.min || t.getState().min_date) + "' max='" + o(n.max || t.getState().max_date) + "' name='" + i.name + "'></div>";
          s.innerHTML = l
        }, set_value: function (t, e, i, n) {
          t && t.getFullYear ? this.get_input(n).value = o(t) : this.get_input(n).value = t
        }, is_valid: function (t, e, i, n) {
          return !(!t || isNaN(t.getTime()))
        }, get_value: function (t, e, i) {
          var n;
          try {
            n = a(this.get_input(i).value || "")
          } catch (t) {
            n = null
          }
          return n
        }
      }, !0), s
    }
  }, function (t, e, i) {
    t.exports = function (t) {
      var e = i(7)(t), n = i(0);

      function r() {
        return e.apply(this, arguments) || this
      }

      return i(2)(r, e), n.mixin(r.prototype, {
        show: function (t, e, i, n) {
          for (var r = "<div><select name='" + e.name + "'>", o = [], a = i.options || [], s = 0; s < a.length; s++) o.push("<option value='" + i.options[s].key + "'>" + a[s].label + "</option>");
          r += o.join("") + "</select></div>", n.innerHTML = r
        }, get_input: function (t) {
          return t.querySelector("select")
        }
      }, !0), r
    }
  }, function (t, e, i) {
    t.exports = function (t) {
      var e = i(7)(t), n = i(0);

      function r() {
        return e.apply(this, arguments) || this
      }

      return i(2)(r, e), n.mixin(r.prototype, {
        show: function (t, e, i, n) {
          var r = "<div><input type='number' min='" + (i.min || 0) + "' max='" + (i.max || 100) + "' name='" + e.name + "'></div>";
          n.innerHTML = r
        }, get_value: function (t, e, i) {
          return this.get_input(i).value || ""
        }, is_valid: function (t, e, i, n) {
          return !isNaN(parseInt(t, 10))
        }
      }, !0), r
    }
  }, function (t, e, i) {
    t.exports = function (t) {
      var e = i(7)(t), n = i(0);

      function r() {
        return e.apply(this, arguments) || this
      }

      return i(2)(r, e), n.mixin(r.prototype, {
        show: function (t, e, i, n) {
          var r = "<div><input type='text' name='" + e.name + "'></div>";
          n.innerHTML = r
        }
      }, !0), r
    }
  }, function (t, e) {
    t.exports = {
      init: function (t, e) {
        var i = t, n = e.$jsgantt, r = null, o = n.ext.keyboardNavigation;
        o.attachEvent("onBeforeFocus", function (e) {
          var n = t.locateCell(e);
          if (clearTimeout(r), n) {
            var o = n.columnName, a = n.id, s = i.getState();
            if (i.isVisible() && s.id == a && s.columnName === o) return !1
          }
          return !0
        }), o.attachEvent("onFocus", function (e) {
          var n = t.locateCell(e), o = t.getState();
          return clearTimeout(r), !n || n.id == o.id && n.columnName == o.columnName || i.isVisible() && i.save(), !0
        }), t.attachEvent("onHide", function () {
          clearTimeout(r)
        }), o.attachEvent("onBlur", function () {
          return r = setTimeout(function () {
            i.save()
          }), !0
        }), n.attachEvent("onTaskDblClick", function (e, i) {
          var n = t.getState(), r = t.locateCell(i.target);
          return !r || !t.isVisible() || r.columnName != n.columnName
        }), n.attachEvent("onTaskClick", function (e, i) {
          if (n._is_icon_open_click(i)) return !0;
          var r = t.getState(), o = t.locateCell(i.target);
          return !o || !t.getEditorConfig(o.columnName) || (t.isVisible() && r.id == o.id && r.columnName == o.columnName || t.startEdit(o.id, o.columnName), !1)
        }), n.attachEvent("onEmptyClick", function () {
          return i.save(), !0
        }), o.attachEvent("onKeyDown", function (e, r) {
          var a = t.locateCell(r.target), s = !!a && t.getEditorConfig(a.columnName), l = t.getState(),
            c = n.constants.KEY_CODES, u = r.keyCode, d = !1;
          switch (u) {
            case c.ENTER:
              t.isVisible() ? (t.save(), r.preventDefault(), d = !0) : s && !(r.ctrlKey || r.metaKey || r.shiftKey) && (i.startEdit(a.id, a.columnName), r.preventDefault(), d = !0);
              break;
            case c.ESC:
              t.isVisible() && (t.hide(), r.preventDefault(), d = !0);
              break;
            case c.UP:
            case c.DOWN:
              break;
            case c.LEFT:
            case c.RIGHT:
              "date" === l.editorType && (d = !0);
              break;
            case c.SPACE:
              t.isVisible() && (d = !0), s && !t.isVisible() && (i.startEdit(a.id, a.columnName), r.preventDefault(), d = !0);
              break;
            case c.DELETE:
              s && !t.isVisible() && (i.startEdit(a.id, a.columnName), d = !0);
              break;
            case c.TAB:
              if (t.isVisible()) {
                r.shiftKey ? t.editPrevCell(!0) : t.editNextCell(!0);
                var h = t.getState();
                h.id && o.focus({type: "taskCell", id: h.id, column: h.columnName}), r.preventDefault(), d = !0
              }
              break;
            default:
              if (t.isVisible()) d = !0; else if (u >= 48 && u <= 57 || u > 95 && u < 112 || u >= 64 && u <= 91 || u > 185 && u < 193 || u > 218 && u < 223) {
                var f = e.modifiers, g = f.alt || f.ctrl || f.meta || f.shift;
                f.alt || g && o.getCommandHandler(e, "taskCell") || s && !t.isVisible() && (i.startEdit(a.id, a.columnName), d = !0)
              }
          }
          return !d
        })
      }, onShow: function (t, e, i) {
      }, onHide: function (t, e, i) {
        i.$jsgantt.focus()
      }, destroy: function () {
      }
    }
  }, function (t, e) {
    t.exports = {
      init: function (t, e) {
        var i = e.$jsgantt;
        i.attachEvent("onTaskClick", function (e, n) {
          if (i._is_icon_open_click(n)) return !0;
          var r = t.getState(), o = t.locateCell(n.target);
          return !o || !t.getEditorConfig(o.columnName) || (t.isVisible() && r.id == o.id && r.columnName == o.columnName || t.startEdit(o.id, o.columnName), !1)
        }), i.attachEvent("onEmptyClick", function () {
          return t.isVisible() && t.isChanged() ? t.save() : t.hide(), !0
        }), i.attachEvent("onTaskDblClick", function (e, i) {
          var n = t.getState(), r = t.locateCell(i.target);
          return !r || !t.isVisible() || r.columnName != n.columnName
        })
      }, onShow: function (t, e, i) {
        if (!i.$getConfig().keyboard_navigation) {
          var n = i.$jsgantt;
          e.onkeydown = function (e) {
            e = e || window.event;
            var i = n.constants.KEY_CODES;
            if (!(e.defaultPrevented || e.shiftKey && e.keyCode != i.TAB)) {
              var r = !0;
              switch (e.keyCode) {
                case n.keys.edit_save:
                  t.save();
                  break;
                case n.keys.edit_cancel:
                  t.hide();
                  break;
                case i.TAB:
                  e.shiftKey ? t.editPrevCell(!0) : t.editNextCell(!0);
                  break;
                default:
                  r = !1
              }
              r && e.preventDefault()
            }
          }
        }
      }, onHide: function () {
      }, destroy: function () {
      }
    }
  }, function (t, e, i) {
    var n = i(123), r = i(122);
    t.exports = function (t) {
      var e = null;
      return {
        setMapping: function (t) {
          e = t
        }, getMapping: function () {
          return e || (t.config.keyboard_navigation_cells ? r : n)
        }
      }
    }
  }, function (t, e, i) {
    var n = i(124), r = i(121), o = i(120), a = i(119), s = i(118), l = i(117), c = i(0), u = i(1), d = i(4);

    function h(t) {
      t.config.editor_types = {
        text: new (r(t)),
        number: new (o(t)),
        select: new (a(t)),
        date: new (s(t)),
        predecessor: new (l(t))
      }
    }

    t.exports = function (t) {
      var e = n(t), i = {};
      d(i);
      var r = {
        init: h, createEditors: function (n) {
          var r = [], o = null, a = {
            _itemId: null,
            _columnName: null,
            _editor: null,
            _editorType: null,
            _placeholder: null,
            locateCell: function (t) {
              if (!u.isChildOf(t, n.$grid)) return null;
              var e = u.locateAttribute(t, n.$config.item_attribute), i = u.locateAttribute(t, "data-column-name");
              if (i) {
                var r = i.getAttribute("data-column-name");
                return {id: e.getAttribute(n.$config.item_attribute), columnName: r}
              }
              return null
            },
            getEditorConfig: function (t) {
              return n.getColumn(t).editor
            },
            init: function () {
              var t = e.getMapping();
              t.init && t.init(this, n), o = n.$jsgantt.getDatastore(n.$config.bind);
              var i = this;
              r.push(o.attachEvent("onIdChange", function (t, e) {
                i._itemId == t && (i._itemId = e)
              })), r.push(o.attachEvent("onStoreUpdated", function () {
                n.$jsgantt.getState("batchUpdate").batch_update || i.isVisible() && !o.isVisible(i._itemId) && i.hide()
              })), this.init = function () {
              }
            },
            getState: function () {
              return {
                editor: this._editor,
                editorType: this._editorType,
                placeholder: this._placeholder,
                id: this._itemId,
                columnName: this._columnName
              }
            },
            startEdit: function (e, i) {
              if (this.isVisible() && this.save(), o.exists(e)) {
                var n = {id: e, columnName: i};
                t.isReadonly(o.getItem(e)) ? this.callEvent("onEditPrevent", [n]) : !1 !== this.callEvent("onBeforeEditStart", [n]) ? (this.show(n.id, n.columnName), this.setValue(), this.callEvent("onEditStart", [n])) : this.callEvent("onEditPrevent", [n])
              }
            },
            isVisible: function () {
              return !(!this._editor || !u.isChildOf(this._placeholder, document.body))
            },
            show: function (t, i) {
              this.isVisible() && this.save();
              var r = {id: t, columnName: i}, o = n.getColumn(r.columnName), a = this.getEditorConfig(o.name);
              if (a) {
                var s = n.$getConfig().editor_types[a.type], l = function (t, e) {
                  var i = function (t, e) {
                    for (var i = n.getItemTop(t), r = n.getItemHeight(t), o = n.getGridColumns(), a = 0, s = 0, l = 0; l < o.length; l++) {
                      if (o[l].name == e) {
                        s = o[l].width;
                        break
                      }
                      a += o[l].width
                    }
                    return {top: i, left: a, height: r, width: s}
                  }(t, e), r = document.createElement("div");
                  r.className = "jsgantt-grid-editor-placeholder", r.setAttribute(n.$config.item_attribute, t), r.setAttribute("data-column-name", e);
                  var o = function (t, e) {
                    for (var i = t.getGridColumns(), n = 0; n < i.length; n++) if (i[n].name == e) return n;
                    return 0
                  }(n, e);
                  return r.setAttribute("data-column-index", o), r.style.cssText = ["top:" + i.top + "px", "left:" + i.left + "px", "width:" + i.width + "px", "height:" + i.height + "px"].join(";"), r
                }(r.id, r.columnName);
                n.$grid_data.appendChild(l), s.show(r.id, o, a, l), this._editor = s, this._placeholder = l, this._itemId = r.id, this._columnName = r.columnName, this._editorType = a.type;
                var c = e.getMapping();
                c.onShow && c.onShow(this, l, n)
              }
            },
            setValue: function () {
              var t = this.getState(), e = t.id, i = t.columnName, r = n.getColumn(i), a = o.getItem(e),
                s = this.getEditorConfig(i);
              if (s) {
                var l = a[s.map_to];
                "auto" == s.map_to && (l = o.getItem(e)), this._editor.set_value(l, e, r, this._placeholder), this.focus()
              }
            },
            focus: function () {
              this._editor.focus(this._placeholder)
            },
            getValue: function () {
              var t = n.getColumn(this._columnName);
              return this._editor.get_value(this._itemId, t, this._placeholder)
            },
            _getItemValue: function () {
              var e = this.getEditorConfig(this._columnName);
              if (e) {
                var i = t.getTask(this._itemId)[e.map_to];
                return "auto" == e.map_to && (i = o.getItem(this._itemId)), i
              }
            },
            isChanged: function () {
              var t = n.getColumn(this._columnName), e = this._getItemValue();
              return this._editor.is_changed(e, this._itemId, t, this._placeholder)
            },
            hide: function () {
              if (this._itemId) {
                var t = this._itemId, i = this._columnName, r = e.getMapping();
                r.onHide && r.onHide(this, this._placeholder, n), this._itemId = null, this._columnName = null, this._editorType = null, this._placeholder && (this._editor && this._editor.hide(this._placeholder), this._editor = null, this._placeholder.parentNode && this._placeholder.parentNode.removeChild(this._placeholder), this._placeholder = null, this.callEvent("onEditEnd", [{
                  id: t,
                  columnName: i
                }]))
              }
            },
            save: function () {
              if (this.isVisible() && o.exists(this._itemId) && this.isChanged()) {
                var e = this._itemId, i = this._columnName;
                if (o.exists(e)) {
                  var r = o.getItem(e), a = this.getEditorConfig(i),
                    s = {id: e, columnName: i, newValue: this.getValue(), oldValue: this._getItemValue()};
                  if (!1 !== this.callEvent("onBeforeSave", [s]) && this._editor.is_valid(s.newValue, s.id, s.columnName, this._placeholder)) {
                    var l = a.map_to, c = s.newValue;
                    "auto" != l ? (r[l] = c, "duration" == l ? r.end_date = t.calculateEndDate(r) : "end_date" == l ? r.plannedDate = t.calculateEndDate({
                      plannedDate: r.end_date,
                      duration: -r.duration,
                      task: r
                    }) : "plannedDate" == l && (r.end_date = t.calculateEndDate(r)), o.updateItem(e)) : this._editor.save(e, n.getColumn(i), this._placeholder), this.callEvent("onSave", [s])
                  }
                  this.hide()
                }
              } else this.hide()
            },
            _findEditableCell: function (t, e) {
              var i = t, r = n.getGridColumns()[i], o = r ? r.name : null;
              if (o) {
                for (; o && !this.getEditorConfig(o);) o = this._findEditableCell(t + e, e);
                return o
              }
              return null
            },
            getNextCell: function (t) {
              return this._findEditableCell(n.getColumnIndex(this._columnName) + t, t)
            },
            getFirstCell: function () {
              return this._findEditableCell(0, 1)
            },
            getLastCell: function () {
              return this._findEditableCell(n.getGridColumns().length - 1, -1)
            },
            editNextCell: function (t) {
              var e = this.getNextCell(1);
              if (e) {
                var i = this.getNextCell(1);
                i && this.getEditorConfig(i) && this.startEdit(this._itemId, i)
              } else if (t && this.moveRow(1)) {
                var n = this.moveRow(1);
                (e = this.getFirstCell()) && this.getEditorConfig(e) && this.startEdit(n, e)
              }
            },
            editPrevCell: function (t) {
              var e = this.getNextCell(-1);
              if (e) {
                var i = this.getNextCell(-1);
                i && this.getEditorConfig(i) && this.startEdit(this._itemId, i)
              } else if (t && this.moveRow(-1)) {
                var n = this.moveRow(-1);
                (e = this.getLastCell()) && this.getEditorConfig(e) && this.startEdit(n, e)
              }
            },
            moveRow: function (e) {
              for (var i = e > 0 ? t.getNext : t.getPrev, n = (i = t.bind(i, t))(this._itemId); t.isTaskExists(n) && t.isReadonly(t.getTask(n));) n = i(n);
              return n
            },
            editNextRow: function () {
              var t = this.getNextCell(1);
              t && this.startEdit(t, this._columnName)
            },
            editPrevRow: function () {
              var t = this.getNextCell(-1);
              t && this.startEdit(t, this._columnName)
            },
            destructor: function () {
              r.forEach(function (t) {
                o.detachEvent(t)
              }), o = null, this.hide(), this.detachAllEvents()
            }
          };
          return c.mixin(a, e), c.mixin(a, i), a
        }
      };
      return c.mixin(r, e), c.mixin(r, i), r
    }
  }, function (t, e, i) {
    var n = i(0), r = i(31), o = i(14), a = i(2), s = function (t) {
      function e(e, i, n, r) {
        var o = t.apply(this, arguments) || this;
        return o.$config.bindLinks = null, o
      }

      return a(e, t), n.mixin(e.prototype, {
        _createLayerConfig: function () {
          var t = this, e = function () {
            return t.isVisible()
          };
          return {
            tasks: [{
              renderer: this.$jsgantt.$ui.layers.resourceHistogram,
              container: this.$task_bars,
              filter: [e]
            }, {renderer: this.$jsgantt.$ui.layers.taskBg, container: this.$task_bg, filter: [e]}], links: []
          }
        }
      }, !0), n.mixin(e.prototype, o(t), !0), e
    }(r);
    t.exports = s
  }, function (t, e, i) {
    var n = i(1), r = i(0), o = i(14), a = i(16), s = i(2), l = function (t) {
      function e(e, i, n, r) {
        return t.apply(this, arguments) || this
      }

      return s(e, t), r.mixin(e.prototype, {
        init: function () {
          void 0 === this.$config.bind && (this.$config.bind = this.$getConfig().resource_store), t.prototype.init.apply(this, arguments)
        }, _initEvents: function () {
          var e = this.$jsgantt;
          t.prototype._initEvents.apply(this, arguments), this._mouseDelegates.delegate("click", "jsgantt-row", e.bind(function (t, e, i) {
            var r = this.$config.rowStore;
            if (!r) return !0;
            var o = n.locateAttribute(t, this.$config.item_attribute);
            return o && r.select(o.getAttribute(this.$config.item_attribute)), !1
          }, this), this.$grid)
        }
      }, !0), r.mixin(e.prototype, o(e), !0), e
    }(a);
    t.exports = l
  }, function (t, e, i) {
    var n = i(1);
    t.exports = function (t, e) {
      var i = {
        column_before_start: t.bind(function (t, i, r) {
          var o = e.$getConfig();
          if (!n.locateAttribute(r, o.grid_resizer_column_attribute)) return !1;
          var a = this.locate(r, o.grid_resizer_column_attribute), s = e.getGridColumns()[a];
          return !1 !== e.callEvent("onColumnResizeStart", [a, s]) && void 0
        }, t), column_after_start: t.bind(function (t, i, n) {
          var r = e.$getConfig(), o = this.locate(n, r.grid_resizer_column_attribute);
          t.config.marker.innerHTML = "", t.config.marker.className += " jsgantt-grid-resize-area", t.config.marker.style.height = e.$grid.offsetHeight + "px", t.config.marker.style.top = "0px", t.config.drag_index = o
        }, t), column_drag_move: t.bind(function (i, r, o) {
          var a = e.$getConfig(), s = i.config, l = e.getGridColumns(), c = parseInt(s.drag_index, 10), u = l[c],
            d = n.getNodePosition(e.$grid_scale), h = parseInt(s.marker.style.left, 10),
            f = u.min_width ? u.min_width : a.min_grid_column_width, g = e.$grid_data.offsetWidth, p = 0, _ = 0;
          a.rtl ? h = d.x + d.width - 1 - h : h -= d.x - 1;
          for (var v = 0; v < c; v++) f += l[v].width, p += l[v].width;
          if (h < f && (h = f), a.keep_grid_width) {
            var m = 0;
            for (v = c + 1; v < l.length; v++) l[v].min_width ? g -= l[v].min_width : a.min_grid_column_width && (g -= a.min_grid_column_width), l[v].max_width && !1 !== m ? m += l[v].max_width : m = !1;
            m && (f = e.$grid_data.offsetWidth - m), h < f && (h = f), h > g && (h = g)
          } else if (!e.$config.scrollable) {
            var y = h, k = 0;
            for (v = c + 1; v < l.length; v++) k += l[v].width;
            y + k > t.$container.offsetWidth && (h = t.$container.offsetWidth - k)
          }
          return s.left = h - 1, _ = Math.abs(h - p), u.max_width && _ > u.max_width && (_ = u.max_width), a.rtl && (p = d.width - p + 2 - _), s.marker.style.top = d.y + "px", s.marker.style.left = d.x - 1 + p + "px", s.marker.style.width = _ + "px", e.callEvent("onColumnResize", [c, l[c], _ - 1]), !0
        }, t), column_drag_end: t.bind(function (i, n, r) {
          for (var o = e.$getConfig(), a = e.getGridColumns(), s = 0, l = parseInt(i.config.drag_index, 10), c = a[l], u = 0; u < l; u++) s += a[u].width;
          var d = c.min_width && i.config.left - s < c.min_width ? c.min_width : i.config.left - s;
          if (c.max_width && c.max_width < d && (d = c.max_width), !1 !== e.callEvent("onColumnResizeEnd", [l, c, d]) && c.width != d) {
            if (c.width = d, o.keep_grid_width) s = o.grid_width; else {
              u = l;
              for (var h = a.length; u < h; u++) s += a[u].width
            }
            e.callEvent("onColumnResizeComplete", [a, e._setColumnsWidth(s, l)]), e.$config.scrollable || t.$layout._syncCellSizes(e.$config.group, o.grid_width), this.render()
          }
        }, t)
      };
      return {
        init: function () {
          var n = t.$services.getService("dnd"), r = e.$getConfig(), o = new n(e.$grid_scale, {updates_per_second: 60});
          t.defined(r.dnd_sensitivity) && (o.config.sensitivity = r.dnd_sensitivity), o.attachEvent("onBeforeDragStart", function (t, e) {
            return i.column_before_start(o, t, e)
          }), o.attachEvent("onAfterDragStart", function (t, e) {
            return i.column_after_start(o, t, e)
          }), o.attachEvent("onDragMove", function (t, e) {
            return i.column_drag_move(o, t, e)
          }), o.attachEvent("onDragEnd", function (t, e) {
            return i.column_drag_end(o, t, e)
          })
        }, doOnRender: function () {
          for (var i = e.getGridColumns(), n = e.$getConfig(), r = 0, o = e.$config.width, a = n.scale_height, s = 0; s < i.length; s++) {
            var l, c = i[s];
            if (r += c.width, l = n.rtl ? o - r : r, c.resize) {
              var u = document.createElement("div");
              u.className = "jsgantt-grid-column-resize-wrap", u.style.top = "0px", u.style.height = a + "px", u.innerHTML = "<div class='jsgantt-grid-column-resize'></div>", u.setAttribute(n.grid_resizer_column_attribute, s), t._waiAria.gridSeparatorAttr(u), e.$grid_scale.appendChild(u), u.style.left = Math.max(0, l) + "px"
            }
          }
        }
      }
    }
  }, function (t, e, i) {
    var n = i(0), r = i(8);
    t.exports = {
      create: function () {
        return function (t, e) {
          var i = {}, n = "jsgantt-static-bg-styles-" + t.uid();

          function r(t) {
            var e = /^rgba?\(([\d]{1,3}), *([\d]{1,3}), *([\d]{1,3}) *(,( *[\d.]+ *))?\)$/i.exec(t);
            return e ? {r: 1 * e[1], g: 1 * e[2], b: 1 * e[3], a: 255 * e[5] || 255} : null
          }

          function o(t) {
            return i[t] || null
          }

          function a(t, e, i) {
            return (t + "" + e + i.bottomBorderColor + i.rightBorderColor).replace(/[^\w\d]/g, "")
          }

          function s(t, e) {
            i[t] = e
          }

          function l(t, e, i) {
            var n = Math.floor(500 / t) || 1, o = Math.floor(500 / e) || 1, a = document.createElement("canvas");
            a.height = e * o, a.width = t * n;
            var s = a.getContext("2d");
            return function (t, e, i, n, o, a) {
              var s = o.createImageData(e * n, t * i);
              s.imageSmoothingEnabled = !1;
              for (var c = 1 * a.rightBorderWidth, u = r(a.rightBorderColor), d = 0, h = 0, f = 0, g = 1; g <= n; g++) for (d = g * e - 1, f = 0; f < c; f++) for (h = 0; h < t * i; h++) l(d - f, h, u, s);
              var p = 1 * a.bottomBorderWidth, _ = r(a.bottomBorderColor);
              h = 0;
              for (var v = 1; v <= i; v++) for (h = v * t - 1, f = 0; f < p; f++) for (d = 0; d < e * n; d++) l(d, h - f, _, s);
              o.putImageData(s, 0, 0)
            }(e, t, o, n, s, i), a.toDataURL();

            function l(e, i, r, o) {
              var a = 4 * (i * (t * n) + e);
              o.data[a] = r.r, o.data[a + 1] = r.g, o.data[a + 2] = r.b, o.data[a + 3] = r.a
            }
          }

          function c(t) {
            return "jsgantt-static-bg-" + t
          }

          return {
            render: function (t, i, r, u) {
              if (i.static_background && document.createElement("canvas").getContext) {
                t.innerHTML = "";
                var d = function (t, i, n, r) {
                  var o, a, s = [], l = 0, c = n.width.filter(function (t) {
                    return !!t
                  }), u = 0, d = 1e5;
                  if (e.isIE) {
                    var h = navigator.appVersion || "";
                    -1 == h.indexOf("Windows NT 6.2") && -1 == h.indexOf("Windows NT 6.1") && -1 == h.indexOf("Windows NT 6.0") || (d = 2e4)
                  }
                  for (var f = 0; f < c.length; f++) {
                    var g = c[f];
                    if (g != a && void 0 !== a || f == c.length - 1 || l > d) {
                      for (var p = r, _ = 0, v = Math.floor(d / i.row_height) * i.row_height, m = l; p > 0;) {
                        var y = Math.min(p, v);
                        p -= v, (o = document.createElement("div")).style.height = y + "px", o.style.position = "absolute", o.style.top = _ + "px", o.style.left = u + "px", o.style.whiteSpace = "no-wrap", o.className = t[a || g], f == c.length - 1 && (m = g + m - 1), o.style.width = m + "px", s.push(o), _ += y
                      }
                      l = 0, u += m
                    }
                    g && (l += g, a = g)
                  }
                  return s
                }(function (t, e, i) {
                  var r = {}, u = function (t) {
                    for (var e = t.width, i = {}, n = 0; n < e.length; n++) 1 * e[n] && (i[e[n]] = !0);
                    return i
                  }(i), d = e.row_height, h = "";
                  for (var f in u) {
                    var g = 1 * f, p = a(g, d, t);
                    if (!o(p)) {
                      var _ = l(g, d, t);
                      s(p, _), h += "." + c(p) + "{ background-image: url('" + _ + "');}"
                    }
                    r[f] = c(p)
                  }
                  return h && ((function () {
                    var t = document.getElementById(n);
                    return t || ((t = document.createElement("style")).id = n, document.body.appendChild(t)), t
                  }()).innerHTML += h), r
                }(function (t) {
                  var e = document.createElement("div");
                  e.className = "jsgantt-task-cell";
                  var i = document.createElement("div");
                  i.className = "jsgantt-task-row", i.appendChild(e), t.appendChild(i);
                  var n = getComputedStyle(i), r = getComputedStyle(e), o = {
                    bottomBorderWidth: n.getPropertyValue("border-bottom-width").replace("px", ""),
                    rightBorderWidth: r.getPropertyValue("border-right-width").replace("px", ""),
                    bottomBorderColor: n.getPropertyValue("border-bottom-color"),
                    rightBorderColor: r.getPropertyValue("border-right-color")
                  };
                  return t.removeChild(i), o
                }(t), i, r), i, r, u), h = document.createDocumentFragment();
                d.forEach(function (t) {
                  h.appendChild(t)
                }), t.appendChild(h)
              }
            }, destroy: function () {
              var t = document.getElementById(n);
              t && t.parentNode && t.parentNode.removeChild(t)
            }
          }
        }(n, r)
      }
    }
  }, function (t, e, i) {
    var n = i(0);
    t.exports = function (t) {
      var e = t.date, i = t.$services;
      return {
        getSum: function (t, e, i) {
          void 0 === i && (i = t.length - 1), void 0 === e && (e = 0);
          for (var n = 0, r = e; r <= i; r++) n += t[r];
          return n
        }, setSumWidth: function (t, e, i, n) {
          var r = e.width;
          void 0 === n && (n = r.length - 1), void 0 === i && (i = 0);
          var o = n - i + 1;
          if (!(i > r.length - 1 || o <= 0 || n > r.length - 1)) {
            var a = t - this.getSum(r, i, n);
            this.adjustSize(a, r, i, n), this.adjustSize(-a, r, n + 1), e.full_width = this.getSum(r)
          }
        }, splitSize: function (t, e) {
          for (var i = [], n = 0; n < e; n++) i[n] = 0;
          return this.adjustSize(t, i), i
        }, adjustSize: function (t, e, i, n) {
          i || (i = 0), void 0 === n && (n = e.length - 1);
          for (var r = n - i + 1, o = this.getSum(e, i, n), a = i; a <= n; a++) {
            var s = Math.floor(t * (o ? e[a] / o : 1 / r));
            o -= e[a], t -= s, r--, e[a] += s
          }
          e[e.length - 1] += t
        }, sortScales: function (t) {
          function i(t, i) {
            var n = new Date(1970, 0, 1);
            return e.add(n, i, t) - n
          }

          t.sort(function (t, e) {
            return i(t.unit, t.step) < i(e.unit, e.step) ? 1 : i(t.unit, t.step) > i(e.unit, e.step) ? -1 : 0
          });
          for (var n = 0; n < t.length; n++) t[n].index = n
        }, primaryScale: function () {
          return i.getService("templateLoader").initTemplate("dateScale", void 0, void 0, i.config(), i.templates()), {
            unit: i.config().scale_unit,
            step: i.config().step,
            template: i.templates().dateScale,
            date: i.config().dateScale,
            css: i.templates().scale_cell_class
          }
        }, prepareConfigs: function (t, e, i, n, r, o, a) {
          for (var s = this.splitSize(n, t.length), l = i, c = [], u = t.length - 1; u >= 0; u--) {
            var d = u == t.length - 1, h = this.initScaleConfig(t[u], r, o);
            d && this.processIgnores(h), this.initColSizes(h, e, l, s[u]), this.limitVisibleRange(h), d && (l = h.full_width), c.unshift(h)
          }
          for (u = 0; u < c.length - 1; u++) this.alineScaleColumns(c[c.length - 1], c[u]);
          for (u = 0; u < c.length; u++) a && this.reverseScale(c[u]), this.setPosSettings(c[u]);
          return c
        }, reverseScale: function (t) {
          t.width = t.width.reverse(), t.trace_x = t.trace_x.reverse();
          var e = t.trace_indexes;
          t.trace_indexes = {}, t.trace_index_transition = {}, t.rtl = !0;
          for (var i = 0; i < t.trace_x.length; i++) t.trace_indexes[t.trace_x[i].valueOf()] = i, t.trace_index_transition[e[t.trace_x[i].valueOf()]] = i;
          return t
        }, setPosSettings: function (t) {
          for (var e = 0, i = t.trace_x.length; e < i; e++) t.left.push((t.width[e - 1] || 0) + (t.left[e - 1] || 0))
        }, _ignore_time_config: function (t, n) {
          if (i.config().skip_off_time) {
            for (var r = !0, o = t, a = 0; a < n.step; a++) a && (o = e.add(t, a, n.unit)), r = r && !this.isWorkTime(o, n.unit);
            return r
          }
          return !1
        }, processIgnores: function (t) {
          t.ignore_x = {}, t.display_count = t.count
        }, initColSizes: function (t, i, n, r) {
          var o = n;
          t.height = r;
          var a = void 0 === t.display_count ? t.count : t.display_count;
          a || (a = 1), t.col_width = Math.floor(o / a), i && t.col_width < i && (t.col_width = i, o = t.col_width * a), t.width = [];
          for (var s = t.ignore_x || {}, l = 0; l < t.trace_x.length; l++) if (s[t.trace_x[l].valueOf()] || t.display_count == t.count) t.width[l] = 0; else {
            var c = 1;
            "month" == t.unit && (c = Math.round((e.add(t.trace_x[l], t.step, t.unit) - t.trace_x[l]) / 864e5)), t.width[l] = c
          }
          this.adjustSize(o - this.getSum(t.width), t.width), t.full_width = this.getSum(t.width)
        }, initScaleConfig: function (t, e, i) {
          var r = n.mixin({
            count: 0,
            col_width: 0,
            full_width: 0,
            height: 0,
            width: [],
            left: [],
            trace_x: [],
            trace_indexes: {},
            min_date: new Date(e),
            max_date: new Date(i)
          }, t);
          return this.eachColumn(t.unit, t.step, e, i, function (t) {
            r.count++, r.trace_x.push(new Date(t)), r.trace_indexes[t.valueOf()] = r.trace_x.length - 1
          }), r.trace_x_ascending = r.trace_x.slice(), r
        }, iterateScales: function (t, e, i, n, r) {
          for (var o = e.trace_x, a = t.trace_x, s = i || 0, l = n || a.length - 1, c = 0, u = 1; u < o.length; u++) {
            var d = t.trace_indexes[+o[u]];
            void 0 !== d && d <= l && (r && r.apply(this, [c, u, s, d]), s = d, c = u)
          }
        }, alineScaleColumns: function (t, e, i, n) {
          this.iterateScales(t, e, i, n, function (i, n, r, o) {
            var a = this.getSum(t.width, r, o - 1);
            this.getSum(e.width, i, n - 1) != a && this.setSumWidth(a, e, i, n - 1)
          })
        }, eachColumn: function (i, n, r, o, a) {
          var s = new Date(r), l = new Date(o);
          e[i + "_start"] && (s = e[i + "_start"](s));
          var c = new Date(s);
          for (+c >= +l && (l = e.add(c, n, i)); +c < +l;) {
            a.call(this, new Date(c));
            var u = c.getTimezoneOffset();
            c = e.add(c, n, i), c = t._correct_dst_change(c, u, n, i), e[i + "_start"] && (c = e[i + "_start"](c))
          }
        }, limitVisibleRange: function (t) {
          var i = t.trace_x, n = t.width.length - 1, r = 0;
          if (+i[0] < +t.min_date && 0 != n) {
            var o = Math.floor(t.width[0] * ((i[1] - t.min_date) / (i[1] - i[0])));
            r += t.width[0] - o, t.width[0] = o, i[0] = new Date(t.min_date)
          }
          var a = i.length - 1, s = i[a], l = e.add(s, t.step, t.unit);
          if (+l > +t.max_date && a > 0 && (o = t.width[a] - Math.floor(t.width[a] * ((l - t.max_date) / (l - s))), r += t.width[a] - o, t.width[a] = o), r) {
            for (var c = this.getSum(t.width), u = 0, d = 0; d < t.width.length; d++) {
              var h = Math.floor(r * (t.width[d] / c));
              t.width[d] += h, u += h
            }
            this.adjustSize(r - u, t.width)
          }
        }
      }
    }
  }, function (t, e, i) {
    var n = i(2), r = i(1), o = i(0), a = i(8), s = function (t) {
      "use strict";

      function e(e, i, n, r) {
        var a = t.apply(this, arguments) || this;
        this.$config = o.mixin(i, {scroll: "x"}), a._scrollHorizontalHandler = o.bind(a._scrollHorizontalHandler, a), a._scrollVerticalHandler = o.bind(a._scrollVerticalHandler, a), a._outerScrollVerticalHandler = o.bind(a._outerScrollVerticalHandler, a), a._outerScrollHorizontalHandler = o.bind(a._outerScrollHorizontalHandler, a), a._mouseWheelHandler = o.bind(a._mouseWheelHandler, a), this.$config.hidden = !0;
        var s = r.config.scroll_size;
        return r.env.isIE && (s += 1), this._isHorizontal() ? (a.$config.height = s, a.$parent.$config.height = s) : (a.$config.width = s, a.$parent.$config.width = s), this.$config.scrollPosition = 0, a.$name = "scroller", a
      }

      return n(e, t), e.prototype.init = function (t) {
        t.innerHTML = this.$toHTML(), this.$view = t.firstChild, this.$view || this.init(), this._isVertical() ? this._initVertical() : this._initHorizontal(), this._initMouseWheel(), this._initLinkedViews()
      }, e.prototype.$toHTML = function () {
        return "<div class='jsgantt-layout-cell " + (this._isHorizontal() ? "jsgantt-hor-scroll" : "jsgantt-ver-scroll") + "'><div style='" + (this._isHorizontal() ? "width:2000px" : "height:2000px") + "'></div></div>"
      }, e.prototype._getRootParent = function () {
        for (var t = this.$parent; t && t.$parent;) t = t.$parent;
        if (t) return t
      }, e.prototype._eachView = function () {
        var t = [];
        return function t(e, i) {
          if (i.push(e), e.$cells) for (var n = 0; n < e.$cells.length; n++) t(e.$cells[n], i)
        }(this._getRootParent(), t), t
      }, e.prototype._getLinkedViews = function () {
        for (var t = this._eachView(), e = [], i = 0; i < t.length; i++) t[i].$config && (this._isVertical() && t[i].$config.scrollY == this.$id || this._isHorizontal() && t[i].$config.scrollX == this.$id) && e.push(t[i]);
        return e
      }, e.prototype._initHorizontal = function () {
        this.$scroll_hor = this.$view, this.$domEvents.attach(this.$view, "scroll", this._scrollHorizontalHandler)
      }, e.prototype._initLinkedViews = function () {
        for (var t = this._getLinkedViews(), e = this._isVertical() ? "jsgantt-layout-outer-scroll jsgantt-layout-outer-scroll-vertical" : "jsgantt-layout-outer-scroll jsgantt-layout-outer-scroll-horizontal", i = 0; i < t.length; i++) r.addClassName(t[i].$view || t[i].getNode(), e)
      }, e.prototype._initVertical = function () {
        this.$scroll_ver = this.$view, this.$domEvents.attach(this.$view, "scroll", this._scrollVerticalHandler)
      }, e.prototype._updateLinkedViews = function () {
      }, e.prototype._initMouseWheel = function () {
        a.isFF ? this.$domEvents.attach(this._getRootParent().$view, "wheel", this._mouseWheelHandler) : this.$domEvents.attach(this._getRootParent().$view, "mousewheel", this._mouseWheelHandler)
      }, e.prototype.scrollHorizontally = function (t) {
        if (!this._scrolling) {
          this._scrolling = !0, this.$scroll_hor.scrollLeft = t, this.$config.codeScrollLeft = t, t = this.$scroll_hor.scrollLeft;
          for (var e = this._getLinkedViews(), i = 0; i < e.length; i++) e[i].scrollTo && e[i].scrollTo(t, void 0);
          var n = this.$config.scrollPosition;
          this.$config.scrollPosition = t, this.callEvent("onScroll", [n, t, this.$config.scroll]), this._scrolling = !1
        }
      }, e.prototype.scrollVertically = function (t) {
        if (!this._scrolling) {
          this._scrolling = !0, this.$scroll_ver.scrollTop = t, t = this.$scroll_ver.scrollTop;
          for (var e = this._getLinkedViews(), i = 0; i < e.length; i++) e[i].scrollTo && e[i].scrollTo(void 0, t);
          var n = this.$config.scrollPosition;
          this.$config.scrollPosition = t, this.callEvent("onScroll", [n, t, this.$config.scroll]), this._scrolling = !1
        }
      }, e.prototype._isVertical = function () {
        return "y" == this.$config.scroll
      }, e.prototype._isHorizontal = function () {
        return "x" == this.$config.scroll
      }, e.prototype._scrollHorizontalHandler = function (t) {
        if (!this._isVertical() && !this._scrolling) {
          if (new Date - (this._wheel_time || 0) < 100) return !0;
          if (!this.$jsgantt._touch_scroll_active) {
            var e = this.$scroll_hor.scrollLeft;
            this.scrollHorizontally(e), this._oldLeft = this.$scroll_hor.scrollLeft
          }
        }
      }, e.prototype._outerScrollHorizontalHandler = function (t) {
        this._isVertical()
      }, e.prototype.show = function () {
        this.$parent.show()
      }, e.prototype.hide = function () {
        this.$parent.hide()
      }, e.prototype._getScrollSize = function () {
        for (var t, e = 0, i = 0, n = this._isHorizontal(), r = this._getLinkedViews(), o = n ? "scrollWidth" : "scrollHeight", a = n ? "contentX" : "contentY", s = n ? "x" : "y", l = this._getScrollOffset(), c = 0; c < r.length; c++) if ((t = r[c]) && t.$content && t.$content.getSize && !t.$config.hidden) {
          var u, d = t.$content.getSize();
          if (u = d.hasOwnProperty(o) ? d[o] : d[a], l) d[a] > d[s] && d[a] > e && u > d[s] - l + 2 && (e = u + (n ? 0 : 2), i = d[s]); else {
            var h = Math.max(d[a] - u, 0);
            (u += h) > Math.max(d[s] - h, 0) && u > e && (e = u, i = d[s])
          }
        }
        return {outerScroll: i, innerScroll: e}
      }, e.prototype.scroll = function (t) {
        this._isHorizontal() ? this.scrollHorizontally(t) : this.scrollVertically(t)
      }, e.prototype.getScrollState = function () {
        return {
          visible: this.isVisible(),
          direction: this.$config.scroll,
          size: this.$config.outerSize,
          scrollSize: this.$config.scrollSize || 0,
          position: this.$config.scrollPosition || 0
        }
      }, e.prototype.setSize = function (e, i) {
        t.prototype.setSize.apply(this, arguments);
        var n = this._getScrollSize(),
          r = (this._isVertical() ? i : e) - this._getScrollOffset() + (this._isHorizontal() ? 1 : 0);
        n.innerScroll && r > n.outerScroll && (n.innerScroll += r - n.outerScroll), this.$config.scrollSize = n.innerScroll, this.$config.width = e, this.$config.height = i, this._setScrollSize(n.innerScroll)
      }, e.prototype.isVisible = function () {
        return !(!this.$parent || !this.$parent.$view.parentNode)
      }, e.prototype.shouldShow = function () {
        var t = this._getScrollSize();
        return !(!t.innerScroll && this.$parent && this.$parent.$view.parentNode || !t.innerScroll || this.$parent && this.$parent.$view.parentNode)
      }, e.prototype.shouldHide = function () {
        return !(this._getScrollSize().innerScroll || !this.$parent || !this.$parent.$view.parentNode)
      }, e.prototype.toggleVisibility = function () {
        this.shouldHide() ? this.hide() : this.shouldShow() && this.show()
      }, e.prototype._getScaleOffset = function (t) {
        var e = 0;
        return !t || "timeline" != t.$config.view && "grid" != t.$config.view || (e = t.$content.$getConfig().scale_height), e
      }, e.prototype._getScrollOffset = function () {
        var t = 0;
        if (this._isVertical()) {
          var e = this.$parent.$parent;
          t = Math.max(this._getScaleOffset(e.getPrevSibling(this.$parent.$id)), this._getScaleOffset(e.getNextSibling(this.$parent.$id)))
        } else for (var i = this._getLinkedViews(), n = 0; n < i.length; n++) {
          var r = i[n].$parent.$cells, o = r[r.length - 1];
          if (o && "scrollbar" == o.$config.view && !1 === o.$config.hidden) {
            t = o.$config.width;
            break
          }
        }
        return t || 0
      }, e.prototype._setScrollSize = function (t) {
        var e = this._isHorizontal() ? "width" : "height",
          i = this._isHorizontal() ? this.$scroll_hor : this.$scroll_ver, n = this._getScrollOffset(), o = i.firstChild;
        n ? this._isVertical() ? (this.$config.outerSize = this.$config.height - n + 3, i.style.height = this.$config.outerSize + "px", i.style.top = n - 1 + "px", r.addClassName(i, this.$parent._borders.top), r.addClassName(i.parentNode, "jsgantt-task-vscroll")) : (this.$config.outerSize = this.$config.width - n + 1, i.style.width = this.$config.outerSize + "px") : (i.style.top = "auto", r.removeClassName(i, this.$parent._borders.top), r.removeClassName(i.parentNode, "jsgantt-task-vscroll"), this.$config.outerSize = this.$config.height), o.style[e] = t + "px"
      }, e.prototype._scrollVerticalHandler = function (t) {
        if (!this._scrollHorizontalHandler() && !this._scrolling && !this.$jsgantt._touch_scroll_active) {
          var e = this.$scroll_ver.scrollTop;
          e != this._oldTop && (this.scrollVertically(e), this._oldTop = this.$scroll_ver.scrollTop)
        }
      }, e.prototype._outerScrollVerticalHandler = function (t) {
        this._scrollHorizontalHandler()
      }, e.prototype._checkWheelTarget = function (t) {
        for (var e = this._getLinkedViews().concat(this), i = 0; i < e.length; i++) {
          var n = e[i].$view;
          if (r.isChildOf(t, n)) return !0
        }
        return !1
      }, e.prototype._mouseWheelHandler = function (t) {
        var e = t.target;
        if (this._checkWheelTarget(e)) {
          this._wheel_time = new Date;
          var i = {}, n = a.isFF, r = n ? -20 * t.deltaX : 2 * t.wheelDeltaX, o = n ? -40 * t.deltaY : t.wheelDelta;
          if (!t.shiftKey || t.deltaX || t.wheelDeltaX || (r = 2 * o, o = 0), r && Math.abs(r) > Math.abs(o)) {
            if (this._isVertical()) return;
            if (i.x) return !0;
            if (!this.$scroll_hor || !this.$scroll_hor.offsetWidth) return !0;
            var s = r / -40, l = this._oldLeft, c = l + 30 * s;
            if (this.scrollHorizontally(c), this.$scroll_hor.scrollLeft = c, l == this.$scroll_hor.scrollLeft) return !0;
            this._oldLeft = this.$scroll_hor.scrollLeft
          } else {
            if (this._isHorizontal()) return;
            if (i.y) return !0;
            if (!this.$scroll_ver || !this.$scroll_ver.offsetHeight) return !0;
            s = o / -40, void 0 === o && (s = t.detail);
            var u = this._oldTop, d = this.$scroll_ver.scrollTop + 30 * s;
            if (this.scrollVertically(d), this.$scroll_ver.scrollTop = d, u == this.$scroll_ver.scrollTop) return !0;
            this._oldTop = this.$scroll_ver.scrollTop
          }
          return t.preventDefault && t.preventDefault(), t.cancelBubble = !0, !1
        }
      }, e
    }(i(6));
    t.exports = s
  }, function (t, e, i) {
    var n = i(2), r = i(1), o = i(0), a = i(6), s = function (t) {
      "use strict";

      function e(e, i, n) {
        var r, o, a = t.apply(this, arguments) || this;
        return a._moveHandler = function (t) {
          a._moveResizer(a._resizer, t.pageX, t.pageY)
        }, a._upHandler = function () {
          var t = a._getNewSizes();
          !1 !== a.callEvent("onResizeEnd", [r, o, t ? t.back : 0, t ? t.front : 0]) && a._setSizes(), a._setBackground(!1), a._clearResizer(), a._clearListeneres()
        }, a._clearListeneres = function () {
          this.$domEvents.detach(document, "mouseup", a._upHandler), this.$domEvents.detach(document, "mousemove", a._moveHandler), this.$domEvents.detach(document, "mousemove", a._startOnMove), this.$domEvents.detach(document, "mouseup", a._cancelDND)
        }, a._callStartDNDEvent = function () {
          if (this._xMode ? (r = this._behind.$config.width || this._behind.$view.offsetWidth, o = this._front.$config.width || this._front.$view.offsetWidth) : (r = this._behind.$config.height || this._behind.$view.offsetHeight, o = this._front.$config.height || this._front.$view.offsetHeight), !1 === a.callEvent("onResizeStart", [r, o])) return !1
        }, a._startDND = function (t) {
          if (!1 !== this._callStartDNDEvent()) {
            var e = !1;
            this._eachGroupItem(function (t) {
              t._getSiblings(), !1 === t._callStartDNDEvent() && (e = !0)
            }), e || (a._moveHandler(t), a.$domEvents.attach(document, "mousemove", a._moveHandler), a.$domEvents.attach(document, "mouseup", a._upHandler))
          }
        }, a._cancelDND = function () {
          a._setBackground(!1), a._clearResizer(), a._clearListeneres()
        }, a._startOnMove = function (t) {
          a._isPosChanged(t) && (a._clearListeneres(), a._startDND(t))
        }, a._downHandler = function (t) {
          a._getSiblings(), a._behind.$config.collapsed || a._front.$config.collapsed || (a._setBackground(!0), a._resizer = a._setResizer(), a._positions = {
            x: t.pageX,
            y: t.pageY,
            timestamp: Date.now()
          }, a.$domEvents.attach(document, "mousemove", a._startOnMove), a.$domEvents.attach(document, "mouseup", a._cancelDND))
        }, a.$name = "resizer", a
      }

      return n(e, t), e.prototype.init = function () {
        t.prototype.init.call(this), this._xMode = "x" === this.$config.mode, this._xMode && !this.$config.width ? this.$config.width = this.$config.minWidth = 1 : this._xMode || this.$config.height || (this.$config.height = this.$config.minHeight = 1), this.$config.margin = -1, this.$domEvents.attach(this.$view, "mousedown", this._downHandler)
      }, e.prototype.$toHTML = function () {
        var t = this.$config.mode, e = this.$config.css || "";
        return "<div class='jsgantt-layout-cell jsgantt-resizer jsgantt-resizer-" + t + "'><div class='jsgantt-layout-content jsgantt-resizer-" + t + (e ? " " + e : "") + "'><span></span></div></div>"
      }, e.prototype._clearResizer = function () {
        this._resizer && (this._resizer.parentNode && this._resizer.parentNode.removeChild(this._resizer), this._resizer = null)
      }, e.prototype._isPosChanged = function (t) {
        return !!this._positions && (Math.abs(this._positions.x - t.pageX) > 3 || Math.abs(this._positions.y - t.pageY) > 3 || Date.now() - this._positions.timestamp > 300)
      }, e.prototype._getSiblings = function () {
        var t = this.$parent.getCells();
        this.$config.prev && (this._behind = this.$factory.getView(this.$config.prev), this._behind instanceof a || (this._behind = this._behind.$parent)), this.$config.next && (this._front = this.$factory.getView(this.$config.next), this._front instanceof a || (this._front = this._behind.$parent));
        for (var e = 0; e < t.length; e++) this === t[e] && (this._behind || (this._behind = t[e - 1]), this._front || (this._front = t[e + 1]))
      }, e.prototype._setBackground = function (t) {
        var e = "jsgantt-resizing";
        if (!t) return r.removeClassName(this._behind.$view, e), r.removeClassName(this._front.$view, e), void r.removeClassName(document.body, "jsgantt-noselect");
        r.addClassName(this._behind.$view, e, !0), r.addClassName(this._front.$view, e, !0), r.addClassName(document.body, "jsgantt-noselect", !0)
      }, e.prototype._setResizer = function () {
        var t = document.createElement("div");
        return t.className = "resizer_stick", this.$view.appendChild(t), this.$view.style.overflow = "visible", t.style.height = this.$view.style.height, t
      }, e.prototype._getDirection = function (t, e) {
        var i;
        return (i = this._xMode ? t - this._positions.x : e - this._positions.y) ? i < 0 ? -1 : 1 : 0
      }, e.prototype._getResizePosition = function (t, e) {
        var i, n, r, o, a;
        this._xMode ? (i = t - this._positions.x, n = this._behind.$config.width || this._behind.$view.offsetWidth, o = this._front.$config.width || this._front.$view.offsetWidth, r = this._behind.$config.minWidth, a = this._front.$config.minWidth) : (i = e - this._positions.y, n = this._behind.$config.height || this._behind.$view.offsetHeight, o = this._front.$config.height || this._front.$view.offsetHeight, r = this._front.$config.minHeight, a = this._front.$config.minHeight);
        var s, l, c = this._getDirection(t, e);
        if (-1 === c) {
          if (l = o - i, s = n - Math.abs(i), o - i > this._front.$config.maxWidth) return;
          Math.abs(i) >= n && (i = -Math.abs(n - 2)), n - Math.abs(i) <= r && (i = -Math.abs(n - r))
        } else l = o - Math.abs(i), s = n + i, n + i > this._behind.$config.maxWidth && (i = this._behind.$config.maxWidth - n), Math.abs(i) >= o && (i = o - 2), o - Math.abs(i) <= a && (i = Math.abs(o - a));
        return -1 === c ? (l = o - i, s = n - Math.abs(i)) : (l = o - Math.abs(i), s = n + i), {
          size: i,
          newFrontSide: l,
          newBehindSide: s
        }
      }, e.prototype._getGroupName = function () {
        return this._getSiblings(), this._front.$config.group || this._behind.$config.group
      }, e.prototype._eachGroupItem = function (t, e) {
        for (var i = this.$factory.getView("main"), n = this._getGroupName(), r = i.getCellsByType("resizer"), o = 0; o < r.length; o++) r[o]._getGroupName() == n && r[o] != this && t.call(e || this, r[o])
      }, e.prototype._getGroupResizePosition = function (t, e) {
        var i = this._getResizePosition(t, e);
        if (!this._getGroupName()) return i;
        var n, r = [i];
        this._eachGroupItem(function (i) {
          i._getSiblings();
          var n = o.copy(this._positions);
          this._xMode ? n.x += i._behind.$config.width - this._behind.$config.width : n.y += i._behind.$config.height - this._behind.$config.height, i._positions = n, r.push(i._getResizePosition(t, e))
        });
        for (var a = 0; a < r.length; a++) {
          if (!r[a]) return;
          void 0 === n ? n = r[a] : r[a].newBehindSide > n.newBehindSide && (n = r[a])
        }
        return n
      }, e.prototype._moveResizer = function (t, e, i) {
        if (0 !== e) {
          var n = this._getGroupResizePosition(e, i);
          n && 1 !== Math.abs(n.size) && (this._xMode ? (t.style.left = n.size + "px", this._positions.nextX = n.size || 0) : (t.style.top = n.size + "px", this._positions.nextY = n.size || 0), this.callEvent("onResize", [n.newBehindSide, n.newFrontSide]))
        }
      }, e.prototype._setGravity = function (t) {
        var e = this._xMode ? "offsetWidth" : "offsetHeight",
          i = this._xMode ? this._positions.nextX : this._positions.nextY, n = this._front.$view[e],
          r = this._behind.$view[e], o = (n - i) / n * this._front.getSize().gravity,
          a = (r + i) / r * this._behind.getSize().gravity;
        "front" !== t && (this._front.$config.gravity = o), "behind" !== t && (this._behind.$config.gravity = a)
      }, e.prototype._getNewSizes = function () {
        var t = this._xMode ? this._behind.$config.width : this._behind.$config.height,
          e = this._xMode ? this._front.$config.width : this._front.$config.height,
          i = this._xMode ? this._positions.nextX : this._positions.nextY;
        return e || t ? {front: e ? e - i || 1 : 0, back: t ? t + i || 1 : 0} : null
      }, e.prototype._assignNewSizes = function (t) {
        this._getSiblings();
        var e = this._xMode ? "width" : "height";
        t ? (t.front ? this._front.$config[e] = t.front : this._setGravity("behind"), t.back ? this._behind.$config[e] = t.back : this._setGravity("front")) : this._setGravity()
      }, e.prototype._setSizes = function () {
        this._resizer && this.$view.removeChild(this._resizer);
        var t = this._getNewSizes();
        if (this._positions.nextX || this._positions.nextY) {
          this._assignNewSizes(t);
          var e = this._xMode ? "width" : "height";
          this._front.$config.group ? this.$jsgantt.$layout._syncCellSizes(this._front.$config.group, this._front.$config[e]) : this._behind.$config.group && this.$jsgantt.$layout._syncCellSizes(this._behind.$config.group, this._behind.$config[e]), this._getGroupName() ? this.$factory.getView("main").resize() : this.$parent.resize()
        }
      }, e
    }(a);
    t.exports = s
  }, function (t, e, i) {
    var n = i(2), r = i(0), o = function (t) {
      "use strict";

      function e(e, i, n) {
        var o = t.apply(this, arguments) || this;
        if (i.view) {
          i.id && (this.$id = r.uid());
          var a = r.copy(i);
          if (delete a.config, delete a.templates, this.$content = this.$factory.createView(i.view, this, a, this), !this.$content) return !1
        }
        return o.$name = "viewCell", o
      }

      return n(e, t), e.prototype.destructor = function () {
        this.clear(), t.prototype.destructor.call(this)
      }, e.prototype.clear = function () {
        if (this.$initialized = !1, this.$content) {
          var e = this.$content.unload || this.$content.destructor;
          e && e.call(this.$content)
        }
        t.prototype.clear.call(this)
      }, e.prototype.scrollTo = function (e, i) {
        this.$content && this.$content.scrollTo ? this.$content.scrollTo(e, i) : t.prototype.scrollTo.call(this, e, i)
      }, e.prototype._setContentSize = function (t, e) {
        var i = this._getBorderSizes(), n = t + i.horizontal, r = e + i.vertical;
        this.$config.width = n, this.$config.height = r
      }, e.prototype.setSize = function (e, i) {
        if (t.prototype.setSize.call(this, e, i), !this.$preResize && this.$content && !this.$initialized) {
          this.$initialized = !0;
          var n = this.$view.childNodes[0], r = this.$view.childNodes[1];
          r || (r = n), this.$content.init(r)
        }
      }, e.prototype.setContentSize = function () {
        !this.$preResize && this.$content && this.$initialized && this.$content.setSize(this.$lastSize.contentX, this.$lastSize.contentY)
      }, e.prototype.getContentSize = function () {
        var e = t.prototype.getContentSize.call(this);
        if (this.$content && this.$initialized) {
          var i = this.$content.getSize();
          e.width = void 0 === i.contentX ? i.width : i.contentX, e.height = void 0 === i.contentY ? i.height : i.contentY
        }
        var n = this._getBorderSizes();
        return e.width += n.horizontal, e.height += n.vertical, e
      }, e
    }(i(6));
    t.exports = o
  }, function (t, e, i) {
    var n = i(2), r = i(35), o = i(6), a = function (t) {
      "use strict";

      function e(e, i, n) {
        for (var r = t.apply(this, arguments) || this, o = 0; o < r.$cells.length; o++) r.$cells[o].$config.hidden = 0 !== o;
        return r.$cell = r.$cells[0], r.$name = "viewLayout", r
      }

      return n(e, t), e.prototype.cell = function (e) {
        var i = t.prototype.cell.call(this, e);
        return i.$view || this.$fill(null, this), i
      }, e.prototype.moveView = function (t) {
        var e = this.$view;
        this.$cell && (this.$cell.$config.hidden = !0, e.removeChild(this.$cell.$view)), this.$cell = t, e.appendChild(t.$view)
      }, e.prototype.setSize = function (t, e) {
        o.prototype.setSize.call(this, t, e)
      }, e.prototype.setContentSize = function () {
        var t = this.$lastSize;
        this.$cell.setSize(t.contentX, t.contentY)
      }, e.prototype.getSize = function () {
        var e = t.prototype.getSize.call(this);
        if (this.$cell) {
          var i = this.$cell.getSize();
          if (this.$config.byMaxSize) for (var n = 0; n < this.$cells.length; n++) {
            var r = this.$cells[n].getSize();
            for (var o in i) i[o] = Math.max(i[o], r[o])
          }
          for (var a in e) e[a] = e[a] || i[a];
          e.gravity = Math.max(e.gravity, i.gravity)
        }
        return e
      }, e
    }(r);
    t.exports = a
  }, function (t, e) {
    t.exports = function (t) {
      var e = t.$services, i = {}, n = {};

      function r(r, o, a) {
        if (n[r]) return n[r];
        o.renderer || t.assert(!1, "Invalid renderer call");
        var s = o.filter;
        return a && a.setAttribute(e.config().layer_attribute, !0), n[r] = {
          render_item: function (e, i) {
            if (i = i || a, !s || s(e)) {
              var n = function (t) {
                return o.renderer.call(this, t, o.host)
              }.call(t, e);
              this.append(e, n, i)
            } else this.remove_item(e.id)
          }, clear: function (t) {
            this.rendered = i[r] = {}, o.append || this.clear_container(t)
          }, clear_container: function (t) {
            (t = t || a) && (t.innerHTML = "")
          }, render_items: function (t, e) {
            e = e || a;
            var i = document.createDocumentFragment();
            this.clear(e);
            for (var n = 0, r = t.length; n < r; n++) this.render_item(t[n], i);
            e.appendChild(i)
          }, append: function (t, e, i) {
            e ? (this.rendered[t.id] && this.rendered[t.id].parentNode ? this.replace_item(t.id, e) : i.appendChild(e), this.rendered[t.id] = e) : this.rendered[t.id] && this.remove_item(t.id)
          }, replace_item: function (t, e) {
            var i = this.rendered[t];
            i && i.parentNode && i.parentNode.replaceChild(e, i), this.rendered[t] = e
          }, remove_item: function (t) {
            this.hide(t), delete this.rendered[t]
          }, hide: function (t) {
            var e = this.rendered[t];
            e && e.parentNode && e.parentNode.removeChild(e)
          }, restore: function (t) {
            var e = this.rendered[t.id];
            e ? e.parentNode || this.append(t, e, a) : this.render_item(t, a)
          }, change_id: function (t, e) {
            this.rendered[e] = this.rendered[t], delete this.rendered[t]
          }, rendered: i[r], node: a, destructor: function () {
            this.clear(), delete n[r], delete i[r]
          }
        }, n[r]
      }

      return {
        getRenderer: r, clearRenderers: function () {
          for (var t in n) r(t).destructor()
        }
      }
    }
  }, function (t, e, i) {
    var n = i(135), r = i(0), o = i(1);

    function a(t) {
      return t instanceof Array || (t = Array.prototype.slice.call(arguments, 0)), function (e) {
        for (var i = !0, n = 0, r = t.length; n < r; n++) {
          var o = t[n];
          o && (i = i && !1 !== o(e.id, e))
        }
        return i
      }
    }

    t.exports = function (t) {
      var e = n(t);
      return {
        createGroup: function (i, n, s) {
          var l = {
            tempCollection: [], renderers: {}, container: i, filters: [], getLayers: function () {
              this._add();
              var t = [];
              for (var e in this.renderers) t.push(this.renderers[e]);
              return t
            }, getLayer: function (t) {
              return this.renderers[t]
            }, _add: function (t) {
              t && (t.id = t.id || r.uid(), this.tempCollection.push(t));
              for (var i = this.container(), a = this.tempCollection, s = 0; s < a.length; s++) if (t = a[s], this.container() || t && t.container && o.isChildOf(t.container, document.body)) {
                var l = t.container, c = t.id, u = t.topmost;
                if (!l.parentNode) if (u) i.appendChild(l); else {
                  var d = n ? n() : i.firstChild;
                  d ? i.insertBefore(l, d) : i.appendChild(l)
                }
                this.renderers[c] = e.getRenderer(c, t, l), this.tempCollection.splice(s, 1), s--
              }
            }, addLayer: function (t) {
              return t && ("function" == typeof t && (t = {renderer: t}), void 0 === t.filter ? t.filter = a(s || []) : t.filter instanceof Array && (t.filter.push(s), t.filter = a(t.filter)), t.container || (t.container = document.createElement("div"))), this._add(t), t ? t.id : void 0
            }, eachLayer: function (t) {
              for (var e in this.renderers) t(this.renderers[e])
            }, removeLayer: function (t) {
              this.renderers[t] && (this.renderers[t].destructor(), delete this.renderers[t])
            }, clear: function () {
              for (var t in this.renderers) this.renderers[t].destructor();
              this.renderers = {}
            }
          };
          return t.attachEvent("onDestroy", function () {
            l.clear(), l = null
          }), l
        }
      }
    }
  }, function (t, e, i) {
    var n = i(136);
    t.exports = function (t) {
      var e = n(t);
      return {
        getDataRender: function (e) {
          return t.$services.getService("layer:" + e) || null
        }, createDataRender: function (i) {
          var n = i.name, r = i.defaultContainer, o = i.defaultContainerSibling,
            a = e.createGroup(r, o, function (t, e) {
              if (!a.filters) return !0;
              for (var i = 0; i < a.filters.length; i++) if (!1 === a.filters[i](t, e)) return !1
            });
          return t.$services.setService("layer:" + n, function () {
            return a
          }), t.attachEvent("onGanttReady", function () {
            a.addLayer()
          }), a
        }, init: function () {
          var e = this.createDataRender({
            name: "task", defaultContainer: function () {
              return t.$task_data ? t.$task_data : t.$ui.getView("timeline") ? t.$ui.getView("timeline").$task_data : void 0
            }, defaultContainerSibling: function () {
              return t.$task_links ? t.$task_links : t.$ui.getView("timeline") ? t.$ui.getView("timeline").$task_links : void 0
            }, filter: function (t) {
            }
          }, t), i = this.createDataRender({
            name: "link", defaultContainer: function () {
              return t.$task_data ? t.$task_data : t.$ui.getView("timeline") ? t.$ui.getView("timeline").$task_data : void 0
            }
          }, t);
          return {
            addTaskLayer: function (t) {
              return e.addLayer(t)
            }, _getTaskLayers: function () {
              return e.getLayers()
            }, removeTaskLayer: function (t) {
              e.removeLayer(t)
            }, _clearTaskLayers: function () {
              e.clear()
            }, addLinkLayer: function (t) {
              return i.addLayer(t)
            }, _getLinkLayers: function () {
              return i.getLayers()
            }, removeLinkLayer: function (t) {
              i.removeLayer(t)
            }, _clearLinkLayers: function () {
              i.clear()
            }
          }
        }
      }
    }
  }, function (t, e, i) {
    var n = function (t) {
      return function (e) {
        var i = {click: {}, doubleclick: {}, contextMenu: {}};

        function n(t, e, n, r) {
          i[t][e] || (i[t][e] = []), i[t][e].push({handler: n, root: r})
        }

        function r(t) {
          t = t || window.event;
          var n = e.locate(t), r = a(t, i.click), o = !0;
          if (null !== n ? o = !e.checkEvent("onTaskClick") || e.callEvent("onTaskClick", [n, t]) : e.callEvent("onEmptyClick", [t]), o) {
            if (!s(r, t, n)) return;
            n && e.getTask(n) && e.config.select_task && !e.config.multiselect && e.selectTask(n)
          }
        }

        function o(t) {
          var i = (t = t || window.event).target, n = e.locate(i), r = e.locate(i, e.config.link_attribute),
            o = !e.checkEvent("onContextMenu") || e.callEvent("onContextMenu", [n, r, t]);
          return o || (t.preventDefault ? t.preventDefault() : t.returnValue = !1), o
        }

        function a(e, i) {
          for (var n = e.target, r = []; n;) {
            var o = t.getClassName(n);
            if (o) {
              o = o.split(" ");
              for (var a = 0; a < o.length; a++) if (o[a] && i[o[a]]) for (var s = i[o[a]], l = 0; l < s.length; l++) s[l].root && !t.isChildOf(n, s[l].root) || r.push(s[l].handler)
            }
            n = n.parentNode
          }
          return r
        }

        function s(t, i, n) {
          for (var r = !0, o = 0; o < t.length; o++) {
            var a = t[o].call(e, i, n, i.target);
            r = r && !(void 0 !== a && !0 !== a)
          }
          return r
        }

        function l(t) {
          t = t || window.event;
          var n = e.locate(t), r = a(t, i.doubleclick),
            o = !e.checkEvent("onTaskDblClick") || null === n || e.callEvent("onTaskDblClick", [n, t]);
          if (o) {
            if (!s(r, t, n)) return;
            null !== n && e.getTask(n) && o && e.config.details_on_dblclick && e.showLightbox(n)
          }
        }

        function c(t) {
          if (e.checkEvent("onMouseMove")) {
            var i = e.locate(t);
            e._last_move_event = t, e.callEvent("onMouseMove", [i, t])
          }
        }

        var u = e._createDomEventScope();

        function d(t) {
          u.detachAll(), t && (u.attach(t, "click", r), u.attach(t, "dblclick", l), u.attach(t, "mousemove", c), u.attach(t, "contextmenu", o))
        }

        return {
          reset: d, global: function (t, e, i) {
            n(t, e, i, null)
          }, delegate: n, detach: function (t, e, n, r) {
            if (i[t] && i[t][e]) {
              for (var o = i[t], a = o[e], s = 0; s < a.length; s++) a[s].root == r && (a.splice(s, 1), s--);
              a.length || delete o[e]
            }
          }, callHandler: function (t, e, n, r) {
            var o = i[t][e];
            if (o) for (var a = 0; a < o.length; a++) (n || o[a].root) && o[a].root !== n || o[a].handler.apply(this, r)
          }, onDoubleClick: l, onMouseMove: c, onContextMenu: o, onClick: r, destructor: function () {
            d(), i = null, u = null
          }
        }
      }
    }(i(1));
    t.exports = {init: n}
  }, function (t, e, i) {
    var n = i(0);

    function r(t) {
      n.mixin(this, t, !0)
    }

    function o(t, e) {
      var i = this.$config[t];
      return i ? i instanceof r ? i : (r.prototype = e, this.$config[t] = new r(i), this.$config[t]) : e
    }

    t.exports = function (t, e) {
      n.mixin(t, function (t) {
        var e, i;
        return {
          $getConfig: function () {
            return e || (e = t ? t.$getConfig() : this.$jsgantt.config), o.call(this, "config", e)
          }, $getTemplates: function () {
            return i || (i = t ? t.$getTemplates() : this.$jsgantt.templates), o.call(this, "templates", i)
          }
        }
      }(e))
    }
  }, function (t, e, i) {
    var n = i(0), r = i(139);
    t.exports = {
      createFactory: function (t) {
        var e = {}, i = {};

        function o(o, a, s, l) {
          var c = e[o];
          if (!c || !c.create) return !1;
          "resizer" != o || s.mode || (l.$config.cols ? s.mode = "x" : s.mode = "y"), "viewcell" != o || "scrollbar" != s.view || s.scroll || (l.$config.cols ? s.scroll = "y" : s.scroll = "x"), (s = n.copy(s)).id || i[s.view] || (s.id = s.view), s.id && !s.css && (s.css = s.id + "-cell");
          var u = new c.create(a, s, this, t);
          return c.configure && c.configure(u), r(u, l), u.$id || (u.$id = s.id || t.uid()), u.$parent || "object" != typeof a || (u.$parent = a), u.$config || (u.$config = s), i[u.$id] && (u.$id = t.uid()), i[u.$id] = u, u
        }

        return {
          initUI: function (t, e) {
            var i = "cell";
            return t.view ? i = "viewcell" : t.resizer ? i = "resizer" : t.rows || t.cols ? i = "layout" : t.views && (i = "multiview"), o.call(this, i, null, t, e)
          }, reset: function () {
            i = {}
          }, registerView: function (t, i, n) {
            e[t] = {create: i, configure: n}
          }, createView: o, getView: function (t) {
            return i[t]
          }
        }
      }
    }
  }, function (t, e, i) {
    var n = i(140), r = i(138), o = i(137), a = i(6), s = i(35), l = i(134), c = i(133), u = i(132), d = i(131),
      h = i(34), f = i(16), g = i(127), p = i(31), _ = i(126), v = i(125), m = i(30), y = i(116), k = i(115),
      b = i(114), w = i(113), $ = i(112), x = i(106), S = i(103);
    t.exports = {
      init: function (t) {
        function e(e, i) {
          var n = i(t);
          n.onCreated && n.onCreated(e), e.attachEvent("onReady", function () {
            n.onInitialized && n.onInitialized(e)
          }), e.attachEvent("onDestroy", function () {
            n.onDestroyed && n.onDestroyed(e)
          })
        }

        var i = n.createFactory(t);
        i.registerView("cell", a), i.registerView("resizer", u), i.registerView("scrollbar", d), i.registerView("layout", s, function (t) {
          "main" === (t.$config ? t.$config.id : null) && e(t, S)
        }), i.registerView("viewcell", c), i.registerView("multiview", l), i.registerView("timeline", h, function (t) {
          "timeline" !== (t.$config ? t.$config.id : null) && "task" != t.$config.bind || e(t, x)
        }), i.registerView("grid", f, function (t) {
          "grid" !== (t.$config ? t.$config.id : null) && "task" != t.$config.bind || e(t, $)
        }), i.registerView("resourceGrid", g), i.registerView("resourceTimeline", p), i.registerView("resourceHistogram", _);
        var C = o(t), T = v(t);
        return t.ext.inlineEditors = T, t.ext._inlineEditors = T, T.init(t), {
          factory: i,
          mouseEvents: r.init(t),
          layersApi: C.init(),
          render: {gridLine: w(t), taskBg: k(t), taskBar: m(t), taskSplitBar: y(t), link: b(t)},
          layersService: {
            getDataRender: function (e) {
              return C.getDataRender(e, t)
            }, createDataRender: function (e) {
              return C.createDataRender(e, t)
            }
          }
        }
      }
    }
  }, function (t, e, i) {
    var n = i(0), r = i(1);
    t.exports = function (t) {
      var e = "data-jocbox", i = null;

      function o(t, e) {
        var n = t.callback;
        p.hide(t.box), i = t.box = null, n && n(e)
      }

      function a(t) {
        if (i) {
          var e = (t = t || event).which || event.keyCode, n = !1;
          if (_.keyboard) {
            if (13 == e || 32 == e) {
              var a = t.target;
              r.getClassName(a).indexOf("jsgantt-popup-button") > -1 && a.click ? a.click() : (o(i, !0), n = !0)
            }
            27 == e && (o(i, !1), n = !0)
          }
          return n ? (t.preventDefault && t.preventDefault(), !(t.cancelBubble = !0)) : void 0
        }
      }

      function s(t) {
        s.cover || (s.cover = document.createElement("div"), s.cover.onkeydown = a, s.cover.className = "joc-modal-cover", document.body.appendChild(s.cover)), s.cover.style.display = t ? "inline-block" : "none"
      }

      function l(e, i, n) {
        var r = t._waiAria.messageButtonAttrString(e), o = i.toLowerCase().replace(/ /g, "_");
        return "<div " + r + " class='jsgantt-popup_button jsgantt-" + o + "-button sos-" + o + "_button' data-result='" + n + "' result='" + n + "' ><div>" + e + "</div></div>"
      }

      function c() {
        for (var t = [].slice.apply(arguments, [0]), e = 0; e < t.length; e++) if (t[e]) return t[e]
      }

      function u(r, u, d) {
        var h = r.tagName ? r : function (r, a, s) {
          var u = document.createElement("div"), d = n.uid();
          t._waiAria.messageModalAttr(u, d), u.className = " jsgantt-modal-box jsgantt-" + r.type + " sos-" + r.type, u.setAttribute(e, 1);
          var h = "";
          if (r.width && (u.style.width = r.width), r.height && (u.style.height = r.height), r.title && (h += '<div class="jsgantt-popup-title">' + r.title + "</div>"), h += '<div class="jsgantt-popup_text" id="' + d + '"><span>' + (r.content ? "" : r.orderId) + '</span></div><div  class="jsgantt-popup-controls">', a && (h += l(c(r.ok, t.locale.labels.message_ok, "OK"), "ok", !0)), s && (h += l(c(r.cancel, t.locale.labels.message_cancel, "Cancel"), "cancel", !1)), r.buttons) for (var f = 0; f < r.buttons.length; f++) {
            var g = r.buttons[f];
            h += "object" == typeof g ? l(g.label, g.css || "jsgantt-" + g.label.toLowerCase() + "_button sos_" + g.label.toLowerCase() + "-button", g.value || f) : l(g, g, f)
          }
          if (h += "</div>", u.innerHTML = h, r.content) {
            var p = r.content;
            "string" == typeof p && (p = document.getElementById(p)), "none" == p.style.display && (p.style.display = ""), u.childNodes[r.title ? 1 : 0].appendChild(p)
          }
          return u.onclick = function (t) {
            var e = (t = t || event).target;
            if (e.className || (e = e.parentNode), "jsgantt-popup-button" == e.className.split(" ")[0]) {
              var i = e.getAttribute("data-result");
              o(r, i = "true" == i || "false" != i && i)
            }
          }, r.box = u, (a || s) && (i = r), u
        }(r, u, d);
        r.hidden || s(!0), document.body.appendChild(h);
        var f = Math.abs(Math.floor(((window.innerWidth || document.documentElement.offsetWidth) - h.offsetWidth) / 2)),
          g = Math.abs(Math.floor(((window.innerHeight || document.documentElement.offsetHeight) - h.offsetHeight) / 2));
        return "top" == r.position ? h.style.top = "-3px" : h.style.top = g + "px", h.style.left = f + "px", h.onkeydown = a, p.focus(h), r.hidden && p.hide(h), t.callEvent("onMessagePopup", [h]), h
      }

      function d(t) {
        return u(t, !0, !1)
      }

      function h(t) {
        return u(t, !0, !0)
      }

      function f(t) {
        return u(t)
      }

      function g(t, e, i) {
        return "object" != typeof t && ("function" == typeof e && (i = e, e = ""), t = {
          text: t,
          type: e,
          callback: i
        }), t
      }

      t.event(document, "keydown", a, !0);
      var p = function () {
        var t = g.apply(this, arguments);
        return t.type = t.type || "alert", f(t)
      };
      p.hide = function (i) {
        for (; i && i.getAttribute && !i.getAttribute(e);) i = i.parentNode;
        i && (i.parentNode.removeChild(i), s(!1), t.callEvent("onAfterMessagePopup", [i]))
      }, p.focus = function (t) {
        setTimeout(function () {
          var e = r.getFocusableNodes(t);
          e.length && e[0].focus && e[0].focus()
        }, 1)
      };
      var _ = function (e, i, r, o) {
        switch ((e = function (t, e, i, r) {
          return "object" != typeof t && (t = {
            text: t,
            type: e,
            expire: i,
            id: r
          }), t.id = t.id || n.uid(), t.expire = t.expire || _.expire, t
        }.apply(this, arguments)).type = e.type || "info", e.type.split("-")[0]) {
          case"alert":
            return d(e);
          case"confirm":
            return h(e);
          case"modalbox":
            return f(e);
          default:
            return function (e) {
              _.area || (_.area = document.createElement("div"), _.area.className = "jsgantt-message-area", _.area.style[_.position] = "5px", document.body.appendChild(_.area)), _.hide(e.id);
              var i = document.createElement("div");
              return i.innerHTML = "<div>" + e.orderId + "</div>", i.className = "jsgantt-info sos-info jsgantt-" + e.type + " sos-" + e.type, i.onclick = function () {
                _.hide(e.id), e = null
              }, t._waiAria.messageInfoAttr(i), "bottom" == _.position && _.area.firstChild ? _.area.insertBefore(i, _.area.firstChild) : _.area.appendChild(i), e.expire > 0 && (_.timers[e.id] = window.setTimeout(function () {
                _.hide(e.id)
              }, e.expire)), _.pull[e.id] = i, i = null, e.id
            }(e)
        }
      };
      _.seed = (new Date).valueOf(), _.uid = n.uid, _.expire = 4e3, _.keyboard = !0, _.position = "top", _.pull = {}, _.timers = {}, _.hideAll = function () {
        for (var t in _.pull) _.hide(t)
      }, _.hide = function (t) {
        var e = _.pull[t];
        e && e.parentNode && (window.setTimeout(function () {
          e.parentNode.removeChild(e), e = null
        }, 2e3), e.className += " hidden", _.timers[t] && window.clearTimeout(_.timers[t]), delete _.pull[t])
      };
      var v = [];
      return t.attachEvent("onMessagePopup", function (t) {
        v.push(t)
      }), t.attachEvent("onAfterMessagePopup", function (t) {
        for (var e = 0; e < v.length; e++) v[e] === t && (v.splice(e, 1), e--)
      }), t.attachEvent("onDestroy", function () {
        s.cover && s.cover.parentNode && s.cover.parentNode.removeChild(s.cover);
        for (var t = 0; t < v.length; t++) v[t].parentNode && v[t].parentNode.removeChild(v[t]);
        v = null, _.area && _.area.parentNode && _.area.parentNode.removeChild(_.area), _ = null
      }), {
        alert: function () {
          var t = g.apply(this, arguments);
          return t.type = t.type || "confirm", d(t)
        }, confirm: function () {
          var t = g.apply(this, arguments);
          return t.type = t.type || "alert", h(t)
        }, message: _, modalbox: p
      }
    }
  }, function (t, e, i) {
    (function (t, e) {
      !function (t, i) {
        "use strict";
        if (!t.setImmediate) {
          var n, r = 1, o = {}, a = !1, s = t.document, l = Object.getPrototypeOf && Object.getPrototypeOf(t);
          l = l && l.setTimeout ? l : t, "[object process]" === {}.toString.call(t.process) ? n = function (t) {
            e.nextTick(function () {
              u(t)
            })
          } : function () {
            if (t.postMessage && !t.importScripts) {
              var e = !0, i = t.onmessage;
              return t.onmessage = function () {
                e = !1
              }, t.postMessage("", "*"), t.onmessage = i, e
            }
          }() ? function () {
            var e = "setImmediate$" + Math.random() + "$", i = function (i) {
              i.source === t && "string" == typeof i.data && 0 === i.data.indexOf(e) && u(+i.data.slice(e.length))
            };
            t.addEventListener ? t.addEventListener("message", i, !1) : t.attachEvent("onmessage", i), n = function (i) {
              t.postMessage(e + i, "*")
            }
          }() : t.MessageChannel ? function () {
            var t = new MessageChannel;
            t.port1.onmessage = function (t) {
              u(t.data)
            }, n = function (e) {
              t.port2.postMessage(e)
            }
          }() : s && "onreadystatechange" in s.createElement("script") ? function () {
            var t = s.documentElement;
            n = function (e) {
              var i = s.createElement("script");
              i.onreadystatechange = function () {
                u(e), i.onreadystatechange = null, t.removeChild(i), i = null
              }, t.appendChild(i)
            }
          }() : n = function (t) {
            setTimeout(u, 0, t)
          }, l.setImmediate = function (t) {
            "function" != typeof t && (t = new Function("" + t));
            for (var e = new Array(arguments.length - 1), i = 0; i < e.length; i++) e[i] = arguments[i + 1];
            var a = {callback: t, args: e};
            return o[r] = a, n(r), r++
          }, l.clearImmediate = c
        }

        function c(t) {
          delete o[t]
        }

        function u(t) {
          if (a) setTimeout(u, 0, t); else {
            var e = o[t];
            if (e) {
              a = !0;
              try {
                !function (t) {
                  var e = t.callback, n = t.args;
                  switch (n.length) {
                    case 0:
                      e();
                      break;
                    case 1:
                      e(n[0]);
                      break;
                    case 2:
                      e(n[0], n[1]);
                      break;
                    case 3:
                      e(n[0], n[1], n[2]);
                      break;
                    default:
                      e.apply(i, n)
                  }
                }(e)
              } finally {
                c(t), a = !1
              }
            }
          }
        }
      }("undefined" == typeof self ? void 0 === t ? this : t : self)
    }).call(this, i(17), i(36))
  }, function (t, e, i) {
    (function (t) {
      var n = void 0 !== t && t || "undefined" != typeof self && self || window, r = Function.prototype.apply;

      function o(t, e) {
        this._id = t, this._clearFn = e
      }

      e.setTimeout = function () {
        return new o(r.call(setTimeout, n, arguments), clearTimeout)
      }, e.setInterval = function () {
        return new o(r.call(setInterval, n, arguments), clearInterval)
      }, e.clearTimeout = e.clearInterval = function (t) {
        t && t.close()
      }, o.prototype.unref = o.prototype.ref = function () {
      }, o.prototype.close = function () {
        this._clearFn.call(n, this._id)
      }, e.enroll = function (t, e) {
        clearTimeout(t._idleTimeoutId), t._idleTimeout = e
      }, e.unenroll = function (t) {
        clearTimeout(t._idleTimeoutId), t._idleTimeout = -1
      }, e._unrefActive = e.active = function (t) {
        clearTimeout(t._idleTimeoutId);
        var e = t._idleTimeout;
        e >= 0 && (t._idleTimeoutId = setTimeout(function () {
          t._onTimeout && t._onTimeout()
        }, e))
      }, i(143), e.setImmediate = "undefined" != typeof self && self.setImmediate || void 0 !== t && t.setImmediate || this && this.setImmediate, e.clearImmediate = "undefined" != typeof self && self.clearImmediate || void 0 !== t && t.clearImmediate || this && this.clearImmediate
    }).call(this, i(17))
  }, function (t, e, i) {
    (function (e, i, n) {
      t.exports = function t(e, i, n) {
        function r(a, s) {
          if (!i[a]) {
            if (!e[a]) {
              var l = "function" == typeof _dereq_ && _dereq_;
              if (!s && l) return l(a, !0);
              if (o) return o(a, !0);
              var c = new Error("Cannot find module '" + a + "'");
              throw c.code = "MODULE_NOT_FOUND", c
            }
            var u = i[a] = {exports: {}};
            e[a][0].call(u.exports, function (t) {
              return r(e[a][1][t] || t)
            }, u, u.exports, t, e, i, n)
          }
          return i[a].exports
        }

        for (var o = "function" == typeof _dereq_ && _dereq_, a = 0; a < n.length; a++) r(n[a]);
        return r
      }({
        1: [function (t, e, i) {
          "use strict";
          e.exports = function (t) {
            var e = t._SomePromiseArray;

            function i(t) {
              var i = new e(t), n = i.promise();
              return i.setHowMany(1), i.setUnwrap(), i.init(), n
            }

            t.any = function (t) {
              return i(t)
            }, t.prototype.any = function () {
              return i(this)
            }
          }
        }, {}], 2: [function (t, i, n) {
          "use strict";
          var r;
          try {
            throw new Error
          } catch (t) {
            r = t
          }
          var o = t("./schedule"), a = t("./queue"), s = t("./util");

          function l() {
            this._customScheduler = !1, this._isTickUsed = !1, this._lateQueue = new a(16), this._normalQueue = new a(16), this._haveDrainedQueues = !1, this._trampolineEnabled = !0;
            var t = this;
            this.drainQueues = function () {
              t._drainQueues()
            }, this._schedule = o
          }

          function c(t, e, i) {
            this._lateQueue.push(t, e, i), this._queueTick()
          }

          function u(t, e, i) {
            this._normalQueue.push(t, e, i), this._queueTick()
          }

          function d(t) {
            this._normalQueue._pushOne(t), this._queueTick()
          }

          function h(t) {
            for (; t.length() > 0;) f(t)
          }

          function f(t) {
            var e = t.shift();
            if ("function" != typeof e) e._settlePromises(); else {
              var i = t.shift(), n = t.shift();
              e.call(i, n)
            }
          }

          l.prototype.setScheduler = function (t) {
            var e = this._schedule;
            return this._schedule = t, this._customScheduler = !0, e
          }, l.prototype.hasCustomScheduler = function () {
            return this._customScheduler
          }, l.prototype.enableTrampoline = function () {
            this._trampolineEnabled = !0
          }, l.prototype.disableTrampolineIfNecessary = function () {
            s.hasDevTools && (this._trampolineEnabled = !1)
          }, l.prototype.haveItemsQueued = function () {
            return this._isTickUsed || this._haveDrainedQueues
          }, l.prototype.fatalError = function (t, i) {
            i ? (e.stderr.write("Fatal " + (t instanceof Error ? t.stack : t) + "\n"), e.exit(2)) : this.throwLater(t)
          }, l.prototype.throwLater = function (t, e) {
            if (1 === arguments.length && (e = t, t = function () {
              throw e
            }), "undefined" != typeof setTimeout) setTimeout(function () {
              t(e)
            }, 0); else try {
              this._schedule(function () {
                t(e)
              })
            } catch (t) {
              throw t
            }
          }, s.hasDevTools ? (l.prototype.invokeLater = function (t, e, i) {
            this._trampolineEnabled ? c.call(this, t, e, i) : this._schedule(function () {
              setTimeout(function () {
                t.call(e, i)
              }, 100)
            })
          }, l.prototype.invoke = function (t, e, i) {
            this._trampolineEnabled ? u.call(this, t, e, i) : this._schedule(function () {
              t.call(e, i)
            })
          }, l.prototype.settlePromises = function (t) {
            this._trampolineEnabled ? d.call(this, t) : this._schedule(function () {
              t._settlePromises()
            })
          }) : (l.prototype.invokeLater = c, l.prototype.invoke = u, l.prototype.settlePromises = d), l.prototype._drainQueues = function () {
            h(this._normalQueue), this._reset(), this._haveDrainedQueues = !0, h(this._lateQueue)
          }, l.prototype._queueTick = function () {
            this._isTickUsed || (this._isTickUsed = !0, this._schedule(this.drainQueues))
          }, l.prototype._reset = function () {
            this._isTickUsed = !1
          }, i.exports = l, i.exports.firstLineError = r
        }, {"./queue": 26, "./schedule": 29, "./util": 36}], 3: [function (t, e, i) {
          "use strict";
          e.exports = function (t, e, i, n) {
            var r = !1, o = function (t, e) {
              this._reject(e)
            }, a = function (t, e) {
              e.promiseRejectionQueued = !0, e.bindingPromise._then(o, o, null, this, t)
            }, s = function (t, e) {
              0 == (50397184 & this._bitField) && this._resolveCallback(e.target)
            }, l = function (t, e) {
              e.promiseRejectionQueued || this._reject(t)
            };
            t.prototype.bind = function (o) {
              r || (r = !0, t.prototype._propagateFrom = n.propagateFromFunction(), t.prototype._boundValue = n.boundValueFunction());
              var c = i(o), u = new t(e);
              u._propagateFrom(this, 1);
              var d = this._target();
              if (u._setBoundTo(c), c instanceof t) {
                var h = {promiseRejectionQueued: !1, promise: u, target: d, bindingPromise: c};
                d._then(e, a, void 0, u, h), c._then(s, l, void 0, u, h), u._setOnCancel(c)
              } else u._resolveCallback(d);
              return u
            }, t.prototype._setBoundTo = function (t) {
              void 0 !== t ? (this._bitField = 2097152 | this._bitField, this._boundTo = t) : this._bitField = -2097153 & this._bitField
            }, t.prototype._isBound = function () {
              return 2097152 == (2097152 & this._bitField)
            }, t.bind = function (e, i) {
              return t.resolve(i).bind(e)
            }
          }
        }, {}], 4: [function (t, e, i) {
          "use strict";
          var n;
          "undefined" != typeof Promise && (n = Promise);
          var r = t("./promise")();
          r.noConflict = function () {
            try {
              Promise === r && (Promise = n)
            } catch (t) {
            }
            return r
          }, e.exports = r
        }, {"./promise": 22}], 5: [function (t, e, i) {
          "use strict";
          var n = Object.create;
          if (n) {
            var r = n(null), o = n(null);
            r[" size"] = o[" size"] = 0
          }
          e.exports = function (e) {
            var i = t("./util"), n = i.canEvaluate;

            function r(t) {
              return function (t, n) {
                var r;
                if (null != t && (r = t[n]), "function" != typeof r) {
                  var o = "Object " + i.classString(t) + " has no method '" + i.toString(n) + "'";
                  throw new e.TypeError(o)
                }
                return r
              }(t, this.pop()).apply(t, this)
            }

            function o(t) {
              return t[this]
            }

            function a(t) {
              var e = +this;
              return e < 0 && (e = Math.max(0, e + t.length)), t[e]
            }

            i.isIdentifier, e.prototype.call = function (t) {
              var e = [].slice.call(arguments, 1);
              return e.push(t), this._then(r, void 0, void 0, e, void 0)
            }, e.prototype.get = function (t) {
              var e;
              if ("number" == typeof t) e = a; else if (n) {
                var i = (void 0)(t);
                e = null !== i ? i : o
              } else e = o;
              return this._then(e, void 0, void 0, t, void 0)
            }
          }
        }, {"./util": 36}], 6: [function (t, e, i) {
          "use strict";
          e.exports = function (e, i, n, r) {
            var o = t("./util"), a = o.tryCatch, s = o.errorObj, l = e._async;
            e.prototype.break = e.prototype.cancel = function () {
              if (!r.cancellation()) return this._warn("cancellation is disabled");
              for (var t = this, e = t; t._isCancellable();) {
                if (!t._cancelBy(e)) {
                  e._isFollowing() ? e._followee().cancel() : e._cancelBranched();
                  break
                }
                var i = t._cancellationParent;
                if (null == i || !i._isCancellable()) {
                  t._isFollowing() ? t._followee().cancel() : t._cancelBranched();
                  break
                }
                t._isFollowing() && t._followee().cancel(), t._setWillBeCancelled(), e = t, t = i
              }
            }, e.prototype._branchHasCancelled = function () {
              this._branchesRemainingToCancel--
            }, e.prototype._enoughBranchesHaveCancelled = function () {
              return void 0 === this._branchesRemainingToCancel || this._branchesRemainingToCancel <= 0
            }, e.prototype._cancelBy = function (t) {
              return t === this ? (this._branchesRemainingToCancel = 0, this._invokeOnCancel(), !0) : (this._branchHasCancelled(), !!this._enoughBranchesHaveCancelled() && (this._invokeOnCancel(), !0))
            }, e.prototype._cancelBranched = function () {
              this._enoughBranchesHaveCancelled() && this._cancel()
            }, e.prototype._cancel = function () {
              this._isCancellable() && (this._setCancelled(), l.invoke(this._cancelPromises, this, void 0))
            }, e.prototype._cancelPromises = function () {
              this._length() > 0 && this._settlePromises()
            }, e.prototype._unsetOnCancel = function () {
              this._onCancelField = void 0
            }, e.prototype._isCancellable = function () {
              return this.isPending() && !this._isCancelled()
            }, e.prototype.isCancellable = function () {
              return this.isPending() && !this.isCancelled()
            }, e.prototype._doInvokeOnCancel = function (t, e) {
              if (o.isArray(t)) for (var i = 0; i < t.length; ++i) this._doInvokeOnCancel(t[i], e); else if (void 0 !== t) if ("function" == typeof t) {
                if (!e) {
                  var n = a(t).call(this._boundValue());
                  n === s && (this._attachExtraTrace(n.e), l.throwLater(n.e))
                }
              } else t._resultCancelled(this)
            }, e.prototype._invokeOnCancel = function () {
              var t = this._onCancel();
              this._unsetOnCancel(), l.invoke(this._doInvokeOnCancel, this, t)
            }, e.prototype._invokeInternalOnCancel = function () {
              this._isCancellable() && (this._doInvokeOnCancel(this._onCancel(), !0), this._unsetOnCancel())
            }, e.prototype._resultCancelled = function () {
              this.cancel()
            }
          }
        }, {"./util": 36}], 7: [function (t, e, i) {
          "use strict";
          e.exports = function (e) {
            var i = t("./util"), n = t("./es5").keys, r = i.tryCatch, o = i.errorObj;
            return function (t, a, s) {
              return function (l) {
                var c = s._boundValue();
                t:for (var u = 0; u < t.length; ++u) {
                  var d = t[u];
                  if (d === Error || null != d && d.prototype instanceof Error) {
                    if (l instanceof d) return r(a).call(c, l)
                  } else if ("function" == typeof d) {
                    var h = r(d).call(c, l);
                    if (h === o) return h;
                    if (h) return r(a).call(c, l)
                  } else if (i.isObject(l)) {
                    for (var f = n(d), g = 0; g < f.length; ++g) {
                      var p = f[g];
                      if (d[p] != l[p]) continue t
                    }
                    return r(a).call(c, l)
                  }
                }
                return e
              }
            }
          }
        }, {"./es5": 13, "./util": 36}], 8: [function (t, e, i) {
          "use strict";
          e.exports = function (t) {
            var e = !1, i = [];

            function n() {
              this._trace = new n.CapturedTrace(r())
            }

            function r() {
              var t = i.length - 1;
              if (t >= 0) return i[t]
            }

            return t.prototype._promiseCreated = function () {
            }, t.prototype._pushContext = function () {
            }, t.prototype._popContext = function () {
              return null
            }, t._peekContext = t.prototype._peekContext = function () {
            }, n.prototype._pushContext = function () {
              void 0 !== this._trace && (this._trace._promiseCreated = null, i.push(this._trace))
            }, n.prototype._popContext = function () {
              if (void 0 !== this._trace) {
                var t = i.pop(), e = t._promiseCreated;
                return t._promiseCreated = null, e
              }
              return null
            }, n.CapturedTrace = null, n.create = function () {
              if (e) return new n
            }, n.deactivateLongStackTraces = function () {
            }, n.activateLongStackTraces = function () {
              var i = t.prototype._pushContext, o = t.prototype._popContext, a = t._peekContext,
                s = t.prototype._peekContext, l = t.prototype._promiseCreated;
              n.deactivateLongStackTraces = function () {
                t.prototype._pushContext = i, t.prototype._popContext = o, t._peekContext = a, t.prototype._peekContext = s, t.prototype._promiseCreated = l, e = !1
              }, e = !0, t.prototype._pushContext = n.prototype._pushContext, t.prototype._popContext = n.prototype._popContext, t._peekContext = t.prototype._peekContext = r, t.prototype._promiseCreated = function () {
                var t = this._peekContext();
                t && null == t._promiseCreated && (t._promiseCreated = this)
              }
            }, n
          }
        }, {}], 9: [function (t, i, n) {
          "use strict";
          i.exports = function (i, n) {
            var r, o, a, s = i._getDomain, l = i._async, c = t("./errors").Warning, u = t("./util"), d = t("./es5"),
              h = u.canAttachTrace, f = /[\\\/]bluebird[\\\/]js[\\\/](release|debug|instrumented)/,
              g = /\((?:timers\.js):\d+:\d+\)/, p = /[\/<\(](.+?):(\d+):(\d+)\)?\s*$/, _ = null, v = null, m = !1,
              y = !(0 == u.env("BLUEBIRD_DEBUG")),
              k = !(0 == u.env("BLUEBIRD_WARNINGS") || !y && !u.env("BLUEBIRD_WARNINGS")),
              b = !(0 == u.env("BLUEBIRD_LONG_STACK_TRACES") || !y && !u.env("BLUEBIRD_LONG_STACK_TRACES")),
              w = 0 != u.env("BLUEBIRD_W_FORGOTTEN_RETURN") && (k || !!u.env("BLUEBIRD_W_FORGOTTEN_RETURN"));
            i.prototype.suppressUnhandledRejections = function () {
              var t = this._target();
              t._bitField = -1048577 & t._bitField | 524288
            }, i.prototype._ensurePossibleRejectionHandled = function () {
              if (0 == (524288 & this._bitField)) {
                this._setRejectionIsUnhandled();
                var t = this;
                setTimeout(function () {
                  t._notifyUnhandledRejection()
                }, 1)
              }
            }, i.prototype._notifyUnhandledRejectionIsHandled = function () {
              U("rejectionHandled", r, void 0, this)
            }, i.prototype._setReturnedNonUndefined = function () {
              this._bitField = 268435456 | this._bitField
            }, i.prototype._returnedNonUndefined = function () {
              return 0 != (268435456 & this._bitField)
            }, i.prototype._notifyUnhandledRejection = function () {
              if (this._isRejectionUnhandled()) {
                var t = this._settledValue();
                this._setUnhandledRejectionIsNotified(), U("unhandledRejection", o, t, this)
              }
            }, i.prototype._setUnhandledRejectionIsNotified = function () {
              this._bitField = 262144 | this._bitField
            }, i.prototype._unsetUnhandledRejectionIsNotified = function () {
              this._bitField = -262145 & this._bitField
            }, i.prototype._isUnhandledRejectionNotified = function () {
              return (262144 & this._bitField) > 0
            }, i.prototype._setRejectionIsUnhandled = function () {
              this._bitField = 1048576 | this._bitField
            }, i.prototype._unsetRejectionIsUnhandled = function () {
              this._bitField = -1048577 & this._bitField, this._isUnhandledRejectionNotified() && (this._unsetUnhandledRejectionIsNotified(), this._notifyUnhandledRejectionIsHandled())
            }, i.prototype._isRejectionUnhandled = function () {
              return (1048576 & this._bitField) > 0
            }, i.prototype._warn = function (t, e, i) {
              return B(t, e, i || this)
            }, i.onPossiblyUnhandledRejection = function (t) {
              var e = s();
              o = "function" == typeof t ? null === e ? t : u.domainBind(e, t) : void 0
            }, i.onUnhandledRejectionHandled = function (t) {
              var e = s();
              r = "function" == typeof t ? null === e ? t : u.domainBind(e, t) : void 0
            };
            var $ = function () {
            };
            i.longStackTraces = function () {
              if (l.haveItemsQueued() && !Z.longStackTraces) throw new Error("Error");
              if (!Z.longStackTraces && Y()) {
                var t = i.prototype._captureStackTrace, e = i.prototype._attachExtraTrace,
                  r = i.prototype._dereferenceTrace;
                Z.longStackTraces = !0, $ = function () {
                  if (l.haveItemsQueued() && !Z.longStackTraces) throw new Error("Error");
                  i.prototype._captureStackTrace = t, i.prototype._attachExtraTrace = e, i.prototype._dereferenceTrace = r, n.deactivateLongStackTraces(), l.enableTrampoline(), Z.longStackTraces = !1
                }, i.prototype._captureStackTrace = z, i.prototype._attachExtraTrace = L, i.prototype._dereferenceTrace = H, n.activateLongStackTraces(), l.disableTrampolineIfNecessary()
              }
            }, i.hasLongStackTraces = function () {
              return Z.longStackTraces && Y()
            };
            var x = function () {
              try {
                if ("function" == typeof CustomEvent) {
                  var t = new CustomEvent("CustomEvent");
                  return u.global.dispatchEvent(t), function (t, e) {
                    var i = {detail: e, cancelable: !0};
                    d.defineProperty(i, "promise", {value: e.promise}), d.defineProperty(i, "reason", {value: e.reason});
                    var n = new CustomEvent(t.toLowerCase(), i);
                    return !u.global.dispatchEvent(n)
                  }
                }
                return "function" == typeof Event ? (t = new Event("CustomEvent"), u.global.dispatchEvent(t), function (t, e) {
                  var i = new Event(t.toLowerCase(), {cancelable: !0});
                  return i.detail = e, d.defineProperty(i, "promise", {value: e.promise}), d.defineProperty(i, "reason", {value: e.reason}), !u.global.dispatchEvent(i)
                }) : ((t = document.createEvent("CustomEvent")).initCustomEvent("testingtheevent", !1, !0, {}), u.global.dispatchEvent(t), function (t, e) {
                  var i = document.createEvent("CustomEvent");
                  return i.initCustomEvent(t.toLowerCase(), !1, !0, e), !u.global.dispatchEvent(i)
                })
              } catch (t) {
              }
              return function () {
                return !1
              }
            }(), S = u.isNode ? function () {
              return e.emit.apply(e, arguments)
            } : u.global ? function (t) {
              var e = "on" + t.toLowerCase(), i = u.global[e];
              return !!i && (i.apply(u.global, [].slice.call(arguments, 1)), !0)
            } : function () {
              return !1
            };

            function C(t, e) {
              return {promise: e}
            }

            var T = {
              promiseCreated: C,
              promiseFulfilled: C,
              promiseRejected: C,
              promiseResolved: C,
              promiseCancelled: C,
              promiseChained: function (t, e, i) {
                return {promise: e, child: i}
              },
              warning: function (t, e) {
                return {warning: e}
              },
              unhandledRejection: function (t, e, i) {
                return {reason: e, promise: i}
              },
              rejectionHandled: C
            }, E = function (t) {
              var e = !1;
              try {
                e = S.apply(null, arguments)
              } catch (t) {
                l.throwLater(t), e = !0
              }
              var i = !1;
              try {
                i = x(t, T[t].apply(null, arguments))
              } catch (t) {
                l.throwLater(t), i = !0
              }
              return i || e
            };

            function j() {
              return !1
            }

            function D(t, e, i) {
              var n = this;
              try {
                t(e, i, function (t) {
                  if ("function" != typeof t) throw new TypeError("onCancel must be a function, got: " + u.toString(t));
                  n._attachCancellationCallback(t)
                })
              } catch (t) {
                return t
              }
            }

            function I(t) {
              if (!this._isCancellable()) return this;
              var e = this._onCancel();
              void 0 !== e ? u.isArray(e) ? e.push(t) : this._setOnCancel([e, t]) : this._setOnCancel(t)
            }

            function A() {
              return this._onCancelField
            }

            function P(t) {
              this._onCancelField = t
            }

            function M() {
              this._cancellationParent = void 0, this._onCancelField = void 0
            }

            function O(t, e) {
              if (0 != (1 & e)) {
                this._cancellationParent = t;
                var i = t._branchesRemainingToCancel;
                void 0 === i && (i = 0), t._branchesRemainingToCancel = i + 1
              }
              0 != (2 & e) && t._isBound() && this._setBoundTo(t._boundTo)
            }

            i.config = function (t) {
              if ("longStackTraces" in (t = Object(t)) && (t.longStackTraces ? i.longStackTraces() : !t.longStackTraces && i.hasLongStackTraces() && $()), "warnings" in t) {
                var e = t.warnings;
                Z.warnings = !!e, w = Z.warnings, u.isObject(e) && "wForgottenReturn" in e && (w = !!e.wForgottenReturn)
              }
              if ("cancellation" in t && t.cancellation && !Z.cancellation) {
                if (l.haveItemsQueued()) throw new Error("cannot enable cancellation after promises are in use");
                i.prototype._clearCancellationData = M, i.prototype._propagateFrom = O, i.prototype._onCancel = A, i.prototype._setOnCancel = P, i.prototype._attachCancellationCallback = I, i.prototype._execute = D, N = O, Z.cancellation = !0
              }
              return "monitoring" in t && (t.monitoring && !Z.monitoring ? (Z.monitoring = !0, i.prototype._fireEvent = E) : !t.monitoring && Z.monitoring && (Z.monitoring = !1, i.prototype._fireEvent = j)), i
            }, i.prototype._fireEvent = j, i.prototype._execute = function (t, e, i) {
              try {
                t(e, i)
              } catch (t) {
                return t
              }
            }, i.prototype._onCancel = function () {
            }, i.prototype._setOnCancel = function (t) {
            }, i.prototype._attachCancellationCallback = function (t) {
            }, i.prototype._captureStackTrace = function () {
            }, i.prototype._attachExtraTrace = function () {
            }, i.prototype._dereferenceTrace = function () {
            }, i.prototype._clearCancellationData = function () {
            }, i.prototype._propagateFrom = function (t, e) {
            };
            var N = function (t, e) {
              0 != (2 & e) && t._isBound() && this._setBoundTo(t._boundTo)
            };

            function R() {
              var t = this._boundTo;
              return void 0 !== t && t instanceof i ? t.isFulfilled() ? t.value() : void 0 : t
            }

            function z() {
              this._trace = new Q(this._peekContext())
            }

            function L(t, e) {
              if (h(t)) {
                var i = this._trace;
                if (void 0 !== i && e && (i = i._parent), void 0 !== i) i.attachExtraTrace(t); else if (!t.__stackCleaned__) {
                  var n = V(t);
                  u.notEnumerableProp(t, "stack", n.message + "\n" + n.stack.join("\n")), u.notEnumerableProp(t, "__stackCleaned__", !0)
                }
              }
            }

            function H() {
              this._trace = void 0
            }

            function B(t, e, n) {
              if (Z.warnings) {
                var r, o = new c(t);
                if (e) n._attachExtraTrace(o); else if (Z.longStackTraces && (r = i._peekContext())) r.attachExtraTrace(o); else {
                  var a = V(o);
                  o.stack = a.message + "\n" + a.stack.join("\n")
                }
                E("warning", o) || W(o, "", !0)
              }
            }

            function F(t) {
              for (var e = [], i = 0; i < t.length; ++i) {
                var n = t[i], r = "    (No stack trace)" === n || _.test(n), o = r && q(n);
                r && !o && (m && " " !== n.charAt(0) && (n = "    " + n), e.push(n))
              }
              return e
            }

            function V(t) {
              var e = t.stack, i = t.toString();
              return e = "string" == typeof e && e.length > 0 ? function (t) {
                for (var e = t.stack.replace(/\s+$/g, "").split("\n"), i = 0; i < e.length; ++i) {
                  var n = e[i];
                  if ("    (No stack trace)" === n || _.test(n)) break
                }
                return i > 0 && "SyntaxError" != t.name && (e = e.slice(i)), e
              }(t) : ["    (No stack trace)"], {message: i, stack: "SyntaxError" == t.name ? e : F(e)}
            }

            function W(t, e, i) {
              if ("undefined" != typeof console) {
                var n;
                if (u.isObject(t)) {
                  var r = t.stack;
                  n = e + v(r, t)
                } else n = e + String(t);
                "function" == typeof a ? a(n, i) : "function" != typeof console.log && "object" != typeof console.log || console.log(n)
              }
            }

            function U(t, e, i, n) {
              var r = !1;
              try {
                "function" == typeof e && (r = !0, "rejectionHandled" === t ? e(n) : e(i, n))
              } catch (t) {
                l.throwLater(t)
              }
              "unhandledRejection" === t ? E(t, i, n) || r || W(i, "Unhandled rejection ") : E(t, n)
            }

            function G(t) {
              var e;
              if ("function" == typeof t) e = "[function " + (t.name || "anonymous") + "]"; else {
                if (e = t && "function" == typeof t.toString ? t.toString() : u.toString(t), /\[object [a-zA-Z0-9$_]+\]/.test(e)) try {
                  e = JSON.stringify(t)
                } catch (t) {
                }
                0 === e.length && (e = "(empty array)")
              }
              return "(<" + function (t) {
                return t.length < 41 ? t : t.substr(0, 38) + "..."
              }(e) + ">, no stack trace)"
            }

            function Y() {
              return "function" == typeof K
            }

            var q = function () {
              return !1
            }, X = /[\/<\(]([^:\/]+):(\d+):(?:\d+)\)?\s*$/;

            function J(t) {
              var e = t.match(X);
              if (e) return {fileName: e[1], line: parseInt(e[2], 10)}
            }

            function Q(t) {
              this._parent = t, this._promisesCreated = 0;
              var e = this._length = 1 + (void 0 === t ? 0 : t._length);
              K(this, Q), e > 32 && this.uncycle()
            }

            u.inherits(Q, Error), n.CapturedTrace = Q, Q.prototype.uncycle = function () {
              var t = this._length;
              if (!(t < 2)) {
                for (var e = [], i = {}, n = 0, r = this; void 0 !== r; ++n) e.push(r), r = r._parent;
                for (n = (t = this._length = n) - 1; n >= 0; --n) {
                  var o = e[n].stack;
                  void 0 === i[o] && (i[o] = n)
                }
                for (n = 0; n < t; ++n) {
                  var a = i[e[n].stack];
                  if (void 0 !== a && a !== n) {
                    a > 0 && (e[a - 1]._parent = void 0, e[a - 1]._length = 1), e[n]._parent = void 0, e[n]._length = 1;
                    var s = n > 0 ? e[n - 1] : this;
                    a < t - 1 ? (s._parent = e[a + 1], s._parent.uncycle(), s._length = s._parent._length + 1) : (s._parent = void 0, s._length = 1);
                    for (var l = s._length + 1, c = n - 2; c >= 0; --c) e[c]._length = l, l++;
                    return
                  }
                }
              }
            }, Q.prototype.attachExtraTrace = function (t) {
              if (!t.__stackCleaned__) {
                this.uncycle();
                for (var e = V(t), i = e.message, n = [e.stack], r = this; void 0 !== r;) n.push(F(r.stack.split("\n"))), r = r._parent;
                !function (t) {
                  for (var e = t[0], i = 1; i < t.length; ++i) {
                    for (var n = t[i], r = e.length - 1, o = e[r], a = -1, s = n.length - 1; s >= 0; --s) if (n[s] === o) {
                      a = s;
                      break
                    }
                    for (s = a; s >= 0; --s) {
                      var l = n[s];
                      if (e[r] !== l) break;
                      e.pop(), r--
                    }
                    e = n
                  }
                }(n), function (t) {
                  for (var e = 0; e < t.length; ++e) (0 === t[e].length || e + 1 < t.length && t[e][0] === t[e + 1][0]) && (t.splice(e, 1), e--)
                }(n), u.notEnumerableProp(t, "stack", function (t, e) {
                  for (var i = 0; i < e.length - 1; ++i) e[i].push("From previous event:"), e[i] = e[i].join("\n");
                  return i < e.length && (e[i] = e[i].join("\n")), t + "\n" + e.join("\n")
                }(i, n)), u.notEnumerableProp(t, "__stackCleaned__", !0)
              }
            };
            var K = function () {
              var t = /^\s*at\s*/, e = function (t, e) {
                return "string" == typeof t ? t : void 0 !== e.name && void 0 !== e.message ? e.toString() : G(e)
              };
              if ("number" == typeof Error.stackTraceLimit && "function" == typeof Error.captureStackTrace) {
                Error.stackTraceLimit += 6, _ = t, v = e;
                var i = Error.captureStackTrace;
                return q = function (t) {
                  return f.test(t)
                }, function (t, e) {
                  Error.stackTraceLimit += 6, i(t, e), Error.stackTraceLimit -= 6
                }
              }
              var n, r = new Error;
              if ("string" == typeof r.stack && r.stack.split("\n")[0].indexOf("stackDetection@") >= 0) return _ = /@/, v = e, m = !0, function (t) {
                t.stack = (new Error).stack
              };
              try {
                throw new Error
              } catch (t) {
                n = "stack" in t
              }
              return "stack" in r || !n || "number" != typeof Error.stackTraceLimit ? (v = function (t, e) {
                return "string" == typeof t ? t : "object" != typeof e && "function" != typeof e || void 0 === e.name || void 0 === e.message ? G(e) : e.toString()
              }, null) : (_ = t, v = e, function (t) {
                Error.stackTraceLimit += 6;
                try {
                  throw new Error
                } catch (e) {
                  t.stack = e.stack
                }
                Error.stackTraceLimit -= 6
              })
            }();
            "undefined" != typeof console && void 0 !== console.warn && (a = function (t) {
              console.warn(t)
            }, u.isNode && e.stderr.isTTY ? a = function (t, e) {
              var i = e ? "[33m" : "[31m";
              console.warn(i + t + "[0m\n")
            } : u.isNode || "string" != typeof (new Error).stack || (a = function (t, e) {
              console.warn("%c" + t, e ? "color: darkorange" : "color: red")
            }));
            var Z = {warnings: k, longStackTraces: !1, cancellation: !1, monitoring: !1};
            return b && i.longStackTraces(), {
              longStackTraces: function () {
                return Z.longStackTraces
              }, warnings: function () {
                return Z.warnings
              }, cancellation: function () {
                return Z.cancellation
              }, monitoring: function () {
                return Z.monitoring
              }, propagateFromFunction: function () {
                return N
              }, boundValueFunction: function () {
                return R
              }, checkForgottenReturns: function (t, e, i, n, r) {
                if (void 0 === t && null !== e && w) {
                  if (void 0 !== r && r._returnedNonUndefined()) return;
                  if (0 == (65535 & n._bitField)) return;
                  i && (i += " ");
                  var o = "";
                  if (e._trace) {
                    for (var a = e._trace.stack.split("\n"), s = F(a), l = s.length - 1; l >= 0; --l) {
                      var c = s[l];
                      if (!g.test(c)) {
                        var u = c.match(p);
                        u && (u[1], u[2], u[3]);
                        break
                      }
                    }
                    if (s.length > 0) {
                      var d = s[0];
                      for (l = 0; l < a.length; ++l) if (a[l] === d) {
                        l > 0 && (o = "\n" + a[l - 1]);
                        break
                      }
                    }
                  }
                  n._warn(o, !0, e)
                }
              }, setBounds: function (t, e) {
                if (Y()) {
                  for (var i, n, r = t.stack.split("\n"), o = e.stack.split("\n"), a = -1, s = -1, l = 0; l < r.length; ++l) if (c = J(r[l])) {
                    i = c.fileName, a = c.line;
                    break
                  }
                  for (l = 0; l < o.length; ++l) {
                    var c;
                    if (c = J(o[l])) {
                      n = c.fileName, s = c.line;
                      break
                    }
                  }
                  a < 0 || s < 0 || !i || !n || i !== n || a >= s || (q = function (t) {
                    if (f.test(t)) return !0;
                    var e = J(t);
                    return !!(e && e.fileName === i && a <= e.line && e.line <= s)
                  })
                }
              }, warn: B, deprecated: function (t, e) {
                var i = t + " is deprecated and will be removed in a future version.";
                return e && (i += " Use " + e + " instead."), B(i)
              }, CapturedTrace: Q, fireDomEvent: x, fireGlobalEvent: S
            }
          }
        }, {"./errors": 12, "./es5": 13, "./util": 36}], 10: [function (t, e, i) {
          "use strict";
          e.exports = function (t) {
            function e() {
              return this.value
            }

            function i() {
              throw this.reason
            }

            t.prototype.return = t.prototype.thenReturn = function (i) {
              return i instanceof t && i.suppressUnhandledRejections(), this._then(e, void 0, void 0, {value: i}, void 0)
            }, t.prototype.throw = t.prototype.thenThrow = function (t) {
              return this._then(i, void 0, void 0, {reason: t}, void 0)
            }, t.prototype.catchThrow = function (t) {
              if (arguments.length <= 1) return this._then(void 0, i, void 0, {reason: t}, void 0);
              var e = arguments[1];
              return this.caught(t, function () {
                throw e
              })
            }, t.prototype.catchReturn = function (i) {
              if (arguments.length <= 1) return i instanceof t && i.suppressUnhandledRejections(), this._then(void 0, e, void 0, {value: i}, void 0);
              var n = arguments[1];
              return n instanceof t && n.suppressUnhandledRejections(), this.caught(i, function () {
                return n
              })
            }
          }
        }, {}], 11: [function (t, e, i) {
          "use strict";
          e.exports = function (t, e) {
            var i = t.reduce, n = t.all;

            function r() {
              return n(this)
            }

            t.prototype.each = function (t) {
              return i(this, t, e, 0)._then(r, void 0, void 0, this, void 0)
            }, t.prototype.mapSeries = function (t) {
              return i(this, t, e, e)
            }, t.each = function (t, n) {
              return i(t, n, e, 0)._then(r, void 0, void 0, t, void 0)
            }, t.mapSeries = function (t, n) {
              return i(t, n, e, e)
            }
          }
        }, {}], 12: [function (t, e, i) {
          "use strict";
          var n, r, o = t("./es5"), a = o.freeze, s = t("./util"), l = s.inherits, c = s.notEnumerableProp;

          function u(t, e) {
            function i(n) {
              if (!(this instanceof i)) return new i(n);
              c(this, "message", "string" == typeof n ? n : e), c(this, "name", t), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : Error.call(this)
            }

            return l(i, Error), i
          }

          var d = u("Warning", "warning"), h = u("CancellationError", "cancellation error"),
            f = u("TimeoutError", "timeout error"), g = u("AggregateError", "aggregate error");
          try {
            n = TypeError, r = RangeError
          } catch (t) {
            n = u("TypeError", "type error"), r = u("RangeError", "range error")
          }
          for (var p = "join pop push shift unshift slice filter forEach some every map indexOf lastIndexOf reduce reduceRight sort reverse".split(" "), _ = 0; _ < p.length; ++_) "function" == typeof Array.prototype[p[_]] && (g.prototype[p[_]] = Array.prototype[p[_]]);
          o.defineProperty(g.prototype, "length", {
            value: 0,
            configurable: !1,
            writable: !0,
            enumerable: !0
          }), g.prototype.isOperational = !0;
          var v = 0;

          function m(t) {
            if (!(this instanceof m)) return new m(t);
            c(this, "name", "OperationalError"), c(this, "message", t), this.cause = t, this.isOperational = !0, t instanceof Error ? (c(this, "message", t.message), c(this, "stack", t.stack)) : Error.captureStackTrace && Error.captureStackTrace(this, this.constructor)
          }

          g.prototype.toString = function () {
            var t = Array(4 * v + 1).join(" "), e = "\n" + t + "AggregateError of:\n";
            v++, t = Array(4 * v + 1).join(" ");
            for (var i = 0; i < this.length; ++i) {
              for (var n = this[i] === this ? "[Circular AggregateError]" : this[i] + "", r = n.split("\n"), o = 0; o < r.length; ++o) r[o] = t + r[o];
              e += (n = r.join("\n")) + "\n"
            }
            return v--, e
          }, l(m, Error);
          var y = Error.__BluebirdErrorTypes__;
          y || (y = a({
            CancellationError: h,
            TimeoutError: f,
            OperationalError: m,
            RejectionError: m,
            AggregateError: g
          }), o.defineProperty(Error, "__BluebirdErrorTypes__", {
            value: y,
            writable: !1,
            enumerable: !1,
            configurable: !1
          })), e.exports = {
            Error: Error,
            TypeError: n,
            RangeError: r,
            CancellationError: y.CancellationError,
            OperationalError: y.OperationalError,
            TimeoutError: y.TimeoutError,
            AggregateError: y.AggregateError,
            Warning: d
          }
        }, {"./es5": 13, "./util": 36}], 13: [function (t, e, i) {
          var n = function () {
            "use strict";
            return void 0 === this
          }();
          if (n) e.exports = {
            freeze: Object.freeze,
            defineProperty: Object.defineProperty,
            getDescriptor: Object.getOwnPropertyDescriptor,
            keys: Object.keys,
            names: Object.getOwnPropertyNames,
            getPrototypeOf: Object.getPrototypeOf,
            isArray: Array.isArray,
            isES5: n,
            propertyIsWritable: function (t, e) {
              var i = Object.getOwnPropertyDescriptor(t, e);
              return !(i && !i.writable && !i.set)
            }
          }; else {
            var r = {}.hasOwnProperty, o = {}.toString, a = {}.constructor.prototype, s = function (t) {
              var e = [];
              for (var i in t) r.call(t, i) && e.push(i);
              return e
            };
            e.exports = {
              isArray: function (t) {
                try {
                  return "[object Array]" === o.call(t)
                } catch (t) {
                  return !1
                }
              }, keys: s, names: s, defineProperty: function (t, e, i) {
                return t[e] = i.value, t
              }, getDescriptor: function (t, e) {
                return {value: t[e]}
              }, freeze: function (t) {
                return t
              }, getPrototypeOf: function (t) {
                try {
                  return Object(t).constructor.prototype
                } catch (t) {
                  return a
                }
              }, isES5: n, propertyIsWritable: function () {
                return !0
              }
            }
          }
        }, {}], 14: [function (t, e, i) {
          "use strict";
          e.exports = function (t, e) {
            var i = t.map;
            t.prototype.filter = function (t, n) {
              return i(this, t, n, e)
            }, t.filter = function (t, n, r) {
              return i(t, n, r, e)
            }
          }
        }, {}], 15: [function (t, e, i) {
          "use strict";
          e.exports = function (e, i, n) {
            var r = t("./util"), o = e.CancellationError, a = r.errorObj, s = t("./catch_filter")(n);

            function l(t, e, i) {
              this.promise = t, this.type = e, this.handler = i, this.called = !1, this.cancelPromise = null
            }

            function c(t) {
              this.finallyHandler = t
            }

            function u(t, e) {
              return null != t.cancelPromise && (arguments.length > 1 ? t.cancelPromise._reject(e) : t.cancelPromise._cancel(), t.cancelPromise = null, !0)
            }

            function d() {
              return f.call(this, this.promise._target()._settledValue())
            }

            function h(t) {
              if (!u(this, t)) return a.e = t, a
            }

            function f(t) {
              var r = this.promise, s = this.handler;
              if (!this.called) {
                this.called = !0;
                var l = this.isFinallyHandler() ? s.call(r._boundValue()) : s.call(r._boundValue(), t);
                if (l === n) return l;
                if (void 0 !== l) {
                  r._setReturnedNonUndefined();
                  var f = i(l, r);
                  if (f instanceof e) {
                    if (null != this.cancelPromise) {
                      if (f._isCancelled()) {
                        var g = new o("late cancellation observer");
                        return r._attachExtraTrace(g), a.e = g, a
                      }
                      f.isPending() && f._attachCancellationCallback(new c(this))
                    }
                    return f._then(d, h, void 0, this, void 0)
                  }
                }
              }
              return r.isRejected() ? (u(this), a.e = t, a) : (u(this), t)
            }

            return l.prototype.isFinallyHandler = function () {
              return 0 === this.type
            }, c.prototype._resultCancelled = function () {
              u(this.finallyHandler)
            }, e.prototype._passThrough = function (t, e, i, n) {
              return "function" != typeof t ? this.then() : this._then(i, n, void 0, new l(this, e, t), void 0)
            }, e.prototype.lastly = e.prototype.finally = function (t) {
              return this._passThrough(t, 0, f, f)
            }, e.prototype.tap = function (t) {
              return this._passThrough(t, 1, f)
            }, e.prototype.tapCatch = function (t) {
              var i = arguments.length;
              if (1 === i) return this._passThrough(t, 1, void 0, f);
              var n, o = new Array(i - 1), a = 0;
              for (n = 0; n < i - 1; ++n) {
                var l = arguments[n];
                if (!r.isObject(l)) return e.reject(new TypeError("tapCatch statement predicate: expecting an object but got " + r.classString(l)));
                o[a++] = l
              }
              o.length = a;
              var c = arguments[n];
              return this._passThrough(s(o, c, this), 1, void 0, f)
            }, l
          }
        }, {"./catch_filter": 7, "./util": 36}], 16: [function (t, e, i) {
          "use strict";
          e.exports = function (e, i, n, r, o, a) {
            var s = t("./errors").TypeError, l = t("./util"), c = l.errorObj, u = l.tryCatch, d = [];

            function h(t, i, r, o) {
              if (a.cancellation()) {
                var s = new e(n), l = this._finallyPromise = new e(n);
                this._promise = s.lastly(function () {
                  return l
                }), s._captureStackTrace(), s._setOnCancel(this)
              } else (this._promise = new e(n))._captureStackTrace();
              this._stack = o, this._generatorFunction = t, this._receiver = i, this._generator = void 0, this._yieldHandlers = "function" == typeof r ? [r].concat(d) : d, this._yieldedPromise = null, this._cancellationPhase = !1
            }

            l.inherits(h, o), h.prototype._isResolved = function () {
              return null === this._promise
            }, h.prototype._cleanup = function () {
              this._promise = this._generator = null, a.cancellation() && null !== this._finallyPromise && (this._finallyPromise._fulfill(), this._finallyPromise = null)
            }, h.prototype._promiseCancelled = function () {
              if (!this._isResolved()) {
                var t;
                if (void 0 !== this._generator.return) this._promise._pushContext(), t = u(this._generator.return).call(this._generator, void 0), this._promise._popContext(); else {
                  var i = new e.CancellationError("generator .return() sentinel");
                  e.coroutine.returnSentinel = i, this._promise._attachExtraTrace(i), this._promise._pushContext(), t = u(this._generator.throw).call(this._generator, i), this._promise._popContext()
                }
                this._cancellationPhase = !0, this._yieldedPromise = null, this._continue(t)
              }
            }, h.prototype._promiseFulfilled = function (t) {
              this._yieldedPromise = null, this._promise._pushContext();
              var e = u(this._generator.next).call(this._generator, t);
              this._promise._popContext(), this._continue(e)
            }, h.prototype._promiseRejected = function (t) {
              this._yieldedPromise = null, this._promise._attachExtraTrace(t), this._promise._pushContext();
              var e = u(this._generator.throw).call(this._generator, t);
              this._promise._popContext(), this._continue(e)
            }, h.prototype._resultCancelled = function () {
              if (this._yieldedPromise instanceof e) {
                var t = this._yieldedPromise;
                this._yieldedPromise = null, t.cancel()
              }
            }, h.prototype.promise = function () {
              return this._promise
            }, h.prototype._run = function () {
              this._generator = this._generatorFunction.call(this._receiver), this._receiver = this._generatorFunction = void 0, this._promiseFulfilled(void 0)
            }, h.prototype._continue = function (t) {
              var i = this._promise;
              if (t === c) return this._cleanup(), this._cancellationPhase ? i.cancel() : i._rejectCallback(t.e, !1);
              var n = t.value;
              if (!0 === t.done) return this._cleanup(), this._cancellationPhase ? i.cancel() : i._resolveCallback(n);
              var o = r(n, this._promise);
              if (o instanceof e || null !== (o = function (t, i, n) {
                for (var o = 0; o < i.length; ++o) {
                  n._pushContext();
                  var a = u(i[o])(t);
                  if (n._popContext(), a === c) {
                    n._pushContext();
                    var s = e.reject(c.e);
                    return n._popContext(), s
                  }
                  var l = r(a, n);
                  if (l instanceof e) return l
                }
                return null
              }(o, this._yieldHandlers, this._promise))) {
                var a = (o = o._target())._bitField;
                0 == (50397184 & a) ? (this._yieldedPromise = o, o._proxy(this, null)) : 0 != (33554432 & a) ? e._async.invoke(this._promiseFulfilled, this, o._value()) : 0 != (16777216 & a) ? e._async.invoke(this._promiseRejected, this, o._reason()) : this._promiseCancelled()
              } else this._promiseRejected(new s(" "))
            }, e.coroutine = function (t, e) {
              if ("function" != typeof t) throw new s("");
              var i = Object(e).yieldHandler, n = h, r = (new Error).stack;
              return function () {
                var e = t.apply(this, arguments), o = new n(void 0, void 0, i, r), a = o.promise();
                return o._generator = e, o._promiseFulfilled(void 0), a
              }
            }, e.coroutine.addYieldHandler = function (t) {
              if ("function" != typeof t) throw new s("expecting a function but got " + l.classString(t));
              d.push(t)
            }, e.spawn = function (t) {
              if (a.deprecated("Promise.spawn()", "Promise.coroutine()"), "function" != typeof t) return i("");
              var n = new h(t, this), r = n.promise();
              return n._run(e.spawn), r
            }
          }
        }, {"./errors": 12, "./util": 36}], 17: [function (t, e, i) {
          "use strict";
          e.exports = function (e, i, n, r, o, a) {
            var s = t("./util");
            s.canEvaluate, s.tryCatch, s.errorObj, e.join = function () {
              var t, e = arguments.length - 1;
              e > 0 && "function" == typeof arguments[e] && (t = arguments[e]);
              var n = [].slice.call(arguments);
              t && n.pop();
              var r = new i(n).promise();
              return void 0 !== t ? r.spread(t) : r
            }
          }
        }, {"./util": 36}], 18: [function (t, e, i) {
          "use strict";
          e.exports = function (e, i, n, r, o, a) {
            var s = e._getDomain, l = t("./util"), c = l.tryCatch, u = l.errorObj, d = e._async;

            function h(t, e, i, n) {
              this.constructor$(t), this._promise._captureStackTrace();
              var r = s();
              this._callback = null === r ? e : l.domainBind(r, e), this._preservedValues = n === o ? new Array(this.length()) : null, this._limit = i, this._inFlight = 0, this._queue = [], d.invoke(this._asyncInit, this, void 0)
            }

            function f(t, i, r, o) {
              if ("function" != typeof i) return n("expecting a function but got " + l.classString(i));
              var a = 0;
              if (void 0 !== r) {
                if ("object" != typeof r || null === r) return e.reject(new TypeError("options argument must be an object but it is " + l.classString(r)));
                if ("number" != typeof r.concurrency) return e.reject(new TypeError("'concurrency' must be a number but it is " + l.classString(r.concurrency)));
                a = r.concurrency
              }
              return new h(t, i, a = "number" == typeof a && isFinite(a) && a >= 1 ? a : 0, o).promise()
            }

            l.inherits(h, i), h.prototype._asyncInit = function () {
              this._init$(void 0, -2)
            }, h.prototype._init = function () {
            }, h.prototype._promiseFulfilled = function (t, i) {
              var n = this._values, o = this.length(), s = this._preservedValues, l = this._limit;
              if (i < 0) {
                if (n[i = -1 * i - 1] = t, l >= 1 && (this._inFlight--, this._drainQueue(), this._isResolved())) return !0
              } else {
                if (l >= 1 && this._inFlight >= l) return n[i] = t, this._queue.push(i), !1;
                null !== s && (s[i] = t);
                var d = this._promise, h = this._callback, f = d._boundValue();
                d._pushContext();
                var g = c(h).call(f, t, i, o), p = d._popContext();
                if (a.checkForgottenReturns(g, p, null !== s ? "Promise.filter" : "Promise.map", d), g === u) return this._reject(g.e), !0;
                var _ = r(g, this._promise);
                if (_ instanceof e) {
                  var v = (_ = _._target())._bitField;
                  if (0 == (50397184 & v)) return l >= 1 && this._inFlight++, n[i] = _, _._proxy(this, -1 * (i + 1)), !1;
                  if (0 == (33554432 & v)) return 0 != (16777216 & v) ? (this._reject(_._reason()), !0) : (this._cancel(), !0);
                  g = _._value()
                }
                n[i] = g
              }
              return ++this._totalResolved >= o && (null !== s ? this._filter(n, s) : this._resolve(n), !0)
            }, h.prototype._drainQueue = function () {
              for (var t = this._queue, e = this._limit, i = this._values; t.length > 0 && this._inFlight < e;) {
                if (this._isResolved()) return;
                var n = t.pop();
                this._promiseFulfilled(i[n], n)
              }
            }, h.prototype._filter = function (t, e) {
              for (var i = e.length, n = new Array(i), r = 0, o = 0; o < i; ++o) t[o] && (n[r++] = e[o]);
              n.length = r, this._resolve(n)
            }, h.prototype.preservedValues = function () {
              return this._preservedValues
            }, e.prototype.map = function (t, e) {
              return f(this, t, e, null)
            }, e.map = function (t, e, i, n) {
              return f(t, e, i, n)
            }
          }
        }, {"./util": 36}], 19: [function (t, e, i) {
          "use strict";
          e.exports = function (e, i, n, r, o) {
            var a = t("./util"), s = a.tryCatch;
            e.method = function (t) {
              if ("function" != typeof t) throw new e.TypeError("expecting a function but got " + a.classString(t));
              return function () {
                var n = new e(i);
                n._captureStackTrace(), n._pushContext();
                var r = s(t).apply(this, arguments), a = n._popContext();
                return o.checkForgottenReturns(r, a, "Promise.method", n), n._resolveFromSyncValue(r), n
              }
            }, e.attempt = e.try = function (t) {
              if ("function" != typeof t) return r("expecting a function but got " + a.classString(t));
              var n, l = new e(i);
              if (l._captureStackTrace(), l._pushContext(), arguments.length > 1) {
                o.deprecated("calling Promise.try with more than 1 argument");
                var c = arguments[1], u = arguments[2];
                n = a.isArray(c) ? s(t).apply(u, c) : s(t).call(u, c)
              } else n = s(t)();
              var d = l._popContext();
              return o.checkForgottenReturns(n, d, "Promise.try", l), l._resolveFromSyncValue(n), l
            }, e.prototype._resolveFromSyncValue = function (t) {
              t === a.errorObj ? this._rejectCallback(t.e, !1) : this._resolveCallback(t, !0)
            }
          }
        }, {"./util": 36}], 20: [function (t, e, i) {
          "use strict";
          var n = t("./util"), r = n.maybeWrapAsError, o = t("./errors").OperationalError, a = t("./es5"),
            s = /^(?:name|message|stack|cause)$/;

          function l(t) {
            var e;
            if (function (t) {
              return t instanceof Error && a.getPrototypeOf(t) === Error.prototype
            }(t)) {
              (e = new o(t)).name = t.name, e.message = t.message, e.stack = t.stack;
              for (var i = a.keys(t), r = 0; r < i.length; ++r) {
                var l = i[r];
                s.test(l) || (e[l] = t[l])
              }
              return e
            }
            return n.markAsOriginatingFromRejection(t), t
          }

          e.exports = function (t, e) {
            return function (i, n) {
              if (null !== t) {
                if (i) {
                  var o = l(r(i));
                  t._attachExtraTrace(o), t._reject(o)
                } else if (e) {
                  var a = [].slice.call(arguments, 1);
                  t._fulfill(a)
                } else t._fulfill(n);
                t = null
              }
            }
          }
        }, {"./errors": 12, "./es5": 13, "./util": 36}], 21: [function (t, e, i) {
          "use strict";
          e.exports = function (e) {
            var i = t("./util"), n = e._async, r = i.tryCatch, o = i.errorObj;

            function a(t, e) {
              if (!i.isArray(t)) return s.call(this, t, e);
              var a = r(e).apply(this._boundValue(), [null].concat(t));
              a === o && n.throwLater(a.e)
            }

            function s(t, e) {
              var i = this._boundValue(), a = void 0 === t ? r(e).call(i, null) : r(e).call(i, null, t);
              a === o && n.throwLater(a.e)
            }

            function l(t, e) {
              if (!t) {
                var i = new Error(t + "");
                i.cause = t, t = i
              }
              var a = r(e).call(this._boundValue(), t);
              a === o && n.throwLater(a.e)
            }

            e.prototype.asCallback = e.prototype.nodeify = function (t, e) {
              if ("function" == typeof t) {
                var i = s;
                void 0 !== e && Object(e).spread && (i = a), this._then(i, l, void 0, this, t)
              }
              return this
            }
          }
        }, {"./util": 36}], 22: [function (t, i, n) {
          "use strict";
          i.exports = function () {
            var n = function () {
              return new g("")
            }, r = function () {
              return new j.PromiseInspection(this._target())
            }, o = function (t) {
              return j.reject(new g(t))
            };

            function a() {
            }

            var s, l = {}, c = t("./util");
            s = c.isNode ? function () {
              var t = e.domain;
              return void 0 === t && (t = null), t
            } : function () {
              return null
            }, c.notEnumerableProp(j, "_getDomain", s);
            var u = t("./es5"), d = t("./async"), h = new d;
            u.defineProperty(j, "_async", {value: h});
            var f = t("./errors"), g = j.TypeError = f.TypeError;
            j.RangeError = f.RangeError;
            var p = j.CancellationError = f.CancellationError;
            j.TimeoutError = f.TimeoutError, j.OperationalError = f.OperationalError, j.RejectionError = f.OperationalError, j.AggregateError = f.AggregateError;
            var _ = function () {
              }, v = {}, m = {}, y = t("./thenables")(j, _), k = t("./promise_array")(j, _, y, o, a),
              b = t("./context")(j), w = b.create, $ = t("./debuggability")(j, b),
              x = ($.CapturedTrace, t("./finally")(j, y, m)), S = t("./catch_filter")(m), C = t("./nodeback"),
              T = c.errorObj, E = c.tryCatch;

            function j(t) {
              t !== _ && function (t, e) {
                if (null == t || t.constructor !== j) throw new g("");
                if ("function" != typeof e) throw new g("expecting a function but got " + c.classString(e))
              }(this, t), this._bitField = 0, this._fulfillmentHandler0 = void 0, this._rejectionHandler0 = void 0, this._promise0 = void 0, this._receiver0 = void 0, this._resolveFromExecutor(t), this._promiseCreated(), this._fireEvent("promiseCreated", this)
            }

            function D(t) {
              this.promise._resolveCallback(t)
            }

            function I(t) {
              this.promise._rejectCallback(t, !1)
            }

            function A(t) {
              var e = new j(_);
              e._fulfillmentHandler0 = t, e._rejectionHandler0 = t, e._promise0 = t, e._receiver0 = t
            }

            return j.prototype.toString = function () {
              return "[object Promise]"
            }, j.prototype.caught = j.prototype.catch = function (t) {
              var e = arguments.length;
              if (e > 1) {
                var i, n = new Array(e - 1), r = 0;
                for (i = 0; i < e - 1; ++i) {
                  var a = arguments[i];
                  if (!c.isObject(a)) return o("Catch statement predicate: expecting an object but got " + c.classString(a));
                  n[r++] = a
                }
                return n.length = r, t = arguments[i], this.then(void 0, S(n, t, this))
              }
              return this.then(void 0, t)
            }, j.prototype.reflect = function () {
              return this._then(r, r, void 0, this, void 0)
            }, j.prototype.then = function (t, e) {
              if ($.warnings() && arguments.length > 0 && "function" != typeof t && "function" != typeof e) {
                var i = ".then() only accepts functions but was passed: " + c.classString(t);
                arguments.length > 1 && (i += ", " + c.classString(e)), this._warn(i)
              }
              return this._then(t, e, void 0, void 0, void 0)
            }, j.prototype.done = function (t, e) {
              this._then(t, e, void 0, void 0, void 0)._setIsFinal()
            }, j.prototype.spread = function (t) {
              return "function" != typeof t ? o("expecting a function but got " + c.classString(t)) : this.all()._then(t, void 0, void 0, v, void 0)
            }, j.prototype.toJSON = function () {
              var t = {isFulfilled: !1, isRejected: !1, fulfillmentValue: void 0, rejectionReason: void 0};
              return this.isFulfilled() ? (t.fulfillmentValue = this.value(), t.isFulfilled = !0) : this.isRejected() && (t.rejectionReason = this.reason(), t.isRejected = !0), t
            }, j.prototype.all = function () {
              return arguments.length > 0 && this._warn(".all() was passed arguments but it does not take any"), new k(this).promise()
            }, j.prototype.error = function (t) {
              return this.caught(c.originatesFromRejection, t)
            }, j.getNewLibraryCopy = i.exports, j.is = function (t) {
              return t instanceof j
            }, j.fromNode = j.fromCallback = function (t) {
              var e = new j(_);
              e._captureStackTrace();
              var i = arguments.length > 1 && !!Object(arguments[1]).multiArgs, n = E(t)(C(e, i));
              return n === T && e._rejectCallback(n.e, !0), e._isFateSealed() || e._setAsyncGuaranteed(), e
            }, j.all = function (t) {
              return new k(t).promise()
            }, j.cast = function (t) {
              var e = y(t);
              return e instanceof j || ((e = new j(_))._captureStackTrace(), e._setFulfilled(), e._rejectionHandler0 = t), e
            }, j.resolve = j.fulfilled = j.cast, j.reject = j.rejected = function (t) {
              var e = new j(_);
              return e._captureStackTrace(), e._rejectCallback(t, !0), e
            }, j.setScheduler = function (t) {
              if ("function" != typeof t) throw new g("expecting a function but got " + c.classString(t));
              return h.setScheduler(t)
            }, j.prototype._then = function (t, e, i, n, r) {
              var o = void 0 !== r, a = o ? r : new j(_), l = this._target(), u = l._bitField;
              o || (a._propagateFrom(this, 3), a._captureStackTrace(), void 0 === n && 0 != (2097152 & this._bitField) && (n = 0 != (50397184 & u) ? this._boundValue() : l === this ? void 0 : this._boundTo), this._fireEvent("promiseChained", this, a));
              var d = s();
              if (0 != (50397184 & u)) {
                var f, g, v = l._settlePromiseCtx;
                0 != (33554432 & u) ? (g = l._rejectionHandler0, f = t) : 0 != (16777216 & u) ? (g = l._fulfillmentHandler0, f = e, l._unsetRejectionIsUnhandled()) : (v = l._settlePromiseLateCancellationObserver, g = new p("late cancellation observer"), l._attachExtraTrace(g), f = e), h.invoke(v, l, {
                  handler: null === d ? f : "function" == typeof f && c.domainBind(d, f),
                  promise: a,
                  receiver: n,
                  value: g
                })
              } else l._addCallbacks(t, e, a, n, d);
              return a
            }, j.prototype._length = function () {
              return 65535 & this._bitField
            }, j.prototype._isFateSealed = function () {
              return 0 != (117506048 & this._bitField)
            }, j.prototype._isFollowing = function () {
              return 67108864 == (67108864 & this._bitField)
            }, j.prototype._setLength = function (t) {
              this._bitField = -65536 & this._bitField | 65535 & t
            }, j.prototype._setFulfilled = function () {
              this._bitField = 33554432 | this._bitField, this._fireEvent("promiseFulfilled", this)
            }, j.prototype._setRejected = function () {
              this._bitField = 16777216 | this._bitField, this._fireEvent("promiseRejected", this)
            }, j.prototype._setFollowing = function () {
              this._bitField = 67108864 | this._bitField, this._fireEvent("promiseResolved", this)
            }, j.prototype._setIsFinal = function () {
              this._bitField = 4194304 | this._bitField
            }, j.prototype._isFinal = function () {
              return (4194304 & this._bitField) > 0
            }, j.prototype._unsetCancelled = function () {
              this._bitField = -65537 & this._bitField
            }, j.prototype._setCancelled = function () {
              this._bitField = 65536 | this._bitField, this._fireEvent("promiseCancelled", this)
            }, j.prototype._setWillBeCancelled = function () {
              this._bitField = 8388608 | this._bitField
            }, j.prototype._setAsyncGuaranteed = function () {
              h.hasCustomScheduler() || (this._bitField = 134217728 | this._bitField)
            }, j.prototype._receiverAt = function (t) {
              var e = 0 === t ? this._receiver0 : this[4 * t - 4 + 3];
              if (e !== l) return void 0 === e && this._isBound() ? this._boundValue() : e
            }, j.prototype._promiseAt = function (t) {
              return this[4 * t - 4 + 2]
            }, j.prototype._fulfillmentHandlerAt = function (t) {
              return this[4 * t - 4 + 0]
            }, j.prototype._rejectionHandlerAt = function (t) {
              return this[4 * t - 4 + 1]
            }, j.prototype._boundValue = function () {
            }, j.prototype._migrateCallback0 = function (t) {
              t._bitField;
              var e = t._fulfillmentHandler0, i = t._rejectionHandler0, n = t._promise0, r = t._receiverAt(0);
              void 0 === r && (r = l), this._addCallbacks(e, i, n, r, null)
            }, j.prototype._migrateCallbackAt = function (t, e) {
              var i = t._fulfillmentHandlerAt(e), n = t._rejectionHandlerAt(e), r = t._promiseAt(e),
                o = t._receiverAt(e);
              void 0 === o && (o = l), this._addCallbacks(i, n, r, o, null)
            }, j.prototype._addCallbacks = function (t, e, i, n, r) {
              var o = this._length();
              if (o >= 65531 && (o = 0, this._setLength(0)), 0 === o) this._promise0 = i, this._receiver0 = n, "function" == typeof t && (this._fulfillmentHandler0 = null === r ? t : c.domainBind(r, t)), "function" == typeof e && (this._rejectionHandler0 = null === r ? e : c.domainBind(r, e)); else {
                var a = 4 * o - 4;
                this[a + 2] = i, this[a + 3] = n, "function" == typeof t && (this[a + 0] = null === r ? t : c.domainBind(r, t)), "function" == typeof e && (this[a + 1] = null === r ? e : c.domainBind(r, e))
              }
              return this._setLength(o + 1), o
            }, j.prototype._proxy = function (t, e) {
              this._addCallbacks(void 0, void 0, e, t, null)
            }, j.prototype._resolveCallback = function (t, e) {
              if (0 == (117506048 & this._bitField)) {
                if (t === this) return this._rejectCallback(n(), !1);
                var i = y(t, this);
                if (!(i instanceof j)) return this._fulfill(t);
                e && this._propagateFrom(i, 2);
                var r = i._target();
                if (r !== this) {
                  var o = r._bitField;
                  if (0 == (50397184 & o)) {
                    var a = this._length();
                    a > 0 && r._migrateCallback0(this);
                    for (var s = 1; s < a; ++s) r._migrateCallbackAt(this, s);
                    this._setFollowing(), this._setLength(0), this._setFollowee(r)
                  } else if (0 != (33554432 & o)) this._fulfill(r._value()); else if (0 != (16777216 & o)) this._reject(r._reason()); else {
                    var l = new p("late cancellation observer");
                    r._attachExtraTrace(l), this._reject(l)
                  }
                } else this._reject(n())
              }
            }, j.prototype._rejectCallback = function (t, e, i) {
              var n = c.ensureErrorObject(t), r = n === t;
              if (!r && !i && $.warnings()) {
                var o = "a promise was rejected with a non-error: " + c.classString(t);
                this._warn(o, !0)
              }
              this._attachExtraTrace(n, !!e && r), this._reject(t)
            }, j.prototype._resolveFromExecutor = function (t) {
              if (t !== _) {
                var e = this;
                this._captureStackTrace(), this._pushContext();
                var i = !0, n = this._execute(t, function (t) {
                  e._resolveCallback(t)
                }, function (t) {
                  e._rejectCallback(t, i)
                });
                i = !1, this._popContext(), void 0 !== n && e._rejectCallback(n, !0)
              }
            }, j.prototype._settlePromiseFromHandler = function (t, e, i, n) {
              var r = n._bitField;
              if (0 == (65536 & r)) {
                var o;
                n._pushContext(), e === v ? i && "number" == typeof i.length ? o = E(t).apply(this._boundValue(), i) : (o = T).e = new g("cannot .spread() a non-array: " + c.classString(i)) : o = E(t).call(e, i);
                var a = n._popContext();
                0 == (65536 & (r = n._bitField)) && (o === m ? n._reject(i) : o === T ? n._rejectCallback(o.e, !1) : ($.checkForgottenReturns(o, a, "", n, this), n._resolveCallback(o)))
              }
            }, j.prototype._target = function () {
              for (var t = this; t._isFollowing();) t = t._followee();
              return t
            }, j.prototype._followee = function () {
              return this._rejectionHandler0
            }, j.prototype._setFollowee = function (t) {
              this._rejectionHandler0 = t
            }, j.prototype._settlePromise = function (t, e, i, n) {
              var o = t instanceof j, s = this._bitField, l = 0 != (134217728 & s);
              0 != (65536 & s) ? (o && t._invokeInternalOnCancel(), i instanceof x && i.isFinallyHandler() ? (i.cancelPromise = t, E(e).call(i, n) === T && t._reject(T.e)) : e === r ? t._fulfill(r.call(i)) : i instanceof a ? i._promiseCancelled(t) : o || t instanceof k ? t._cancel() : i.cancel()) : "function" == typeof e ? o ? (l && t._setAsyncGuaranteed(), this._settlePromiseFromHandler(e, i, n, t)) : e.call(i, n, t) : i instanceof a ? i._isResolved() || (0 != (33554432 & s) ? i._promiseFulfilled(n, t) : i._promiseRejected(n, t)) : o && (l && t._setAsyncGuaranteed(), 0 != (33554432 & s) ? t._fulfill(n) : t._reject(n))
            }, j.prototype._settlePromiseLateCancellationObserver = function (t) {
              var e = t.handler, i = t.promise, n = t.receiver, r = t.value;
              "function" == typeof e ? i instanceof j ? this._settlePromiseFromHandler(e, n, r, i) : e.call(n, r, i) : i instanceof j && i._reject(r)
            }, j.prototype._settlePromiseCtx = function (t) {
              this._settlePromise(t.promise, t.handler, t.receiver, t.value)
            }, j.prototype._settlePromise0 = function (t, e, i) {
              var n = this._promise0, r = this._receiverAt(0);
              this._promise0 = void 0, this._receiver0 = void 0, this._settlePromise(n, t, r, e)
            }, j.prototype._clearCallbackDataAtIndex = function (t) {
              var e = 4 * t - 4;
              this[e + 2] = this[e + 3] = this[e + 0] = this[e + 1] = void 0
            }, j.prototype._fulfill = function (t) {
              var e = this._bitField;
              if (!((117506048 & e) >>> 16)) {
                if (t === this) {
                  var i = n();
                  return this._attachExtraTrace(i), this._reject(i)
                }
                this._setFulfilled(), this._rejectionHandler0 = t, (65535 & e) > 0 && (0 != (134217728 & e) ? this._settlePromises() : h.settlePromises(this), this._dereferenceTrace())
              }
            }, j.prototype._reject = function (t) {
              var e = this._bitField;
              if (!((117506048 & e) >>> 16)) {
                if (this._setRejected(), this._fulfillmentHandler0 = t, this._isFinal()) return h.fatalError(t, c.isNode);
                (65535 & e) > 0 ? h.settlePromises(this) : this._ensurePossibleRejectionHandled()
              }
            }, j.prototype._fulfillPromises = function (t, e) {
              for (var i = 1; i < t; i++) {
                var n = this._fulfillmentHandlerAt(i), r = this._promiseAt(i), o = this._receiverAt(i);
                this._clearCallbackDataAtIndex(i), this._settlePromise(r, n, o, e)
              }
            }, j.prototype._rejectPromises = function (t, e) {
              for (var i = 1; i < t; i++) {
                var n = this._rejectionHandlerAt(i), r = this._promiseAt(i), o = this._receiverAt(i);
                this._clearCallbackDataAtIndex(i), this._settlePromise(r, n, o, e)
              }
            }, j.prototype._settlePromises = function () {
              var t = this._bitField, e = 65535 & t;
              if (e > 0) {
                if (0 != (16842752 & t)) {
                  var i = this._fulfillmentHandler0;
                  this._settlePromise0(this._rejectionHandler0, i, t), this._rejectPromises(e, i)
                } else {
                  var n = this._rejectionHandler0;
                  this._settlePromise0(this._fulfillmentHandler0, n, t), this._fulfillPromises(e, n)
                }
                this._setLength(0)
              }
              this._clearCancellationData()
            }, j.prototype._settledValue = function () {
              var t = this._bitField;
              return 0 != (33554432 & t) ? this._rejectionHandler0 : 0 != (16777216 & t) ? this._fulfillmentHandler0 : void 0
            }, j.defer = j.pending = function () {
              return $.deprecated("Promise.defer", "new Promise"), {promise: new j(_), resolve: D, reject: I}
            }, c.notEnumerableProp(j, "_makeSelfResolutionError", n), t("./method")(j, _, y, o, $), t("./bind")(j, _, y, $), t("./cancel")(j, k, o, $), t("./direct_resolve")(j), t("./synchronous_inspection")(j), t("./join")(j, k, y, _, h, s), j.Promise = j, j.version = "3.5.4", t("./map.js")(j, k, o, y, _, $), t("./call_get.js")(j), t("./using.js")(j, o, y, w, _, $), t("./timers.js")(j, _, $), t("./generators.js")(j, o, _, y, a, $), t("./nodeify.js")(j), t("./promisify.js")(j, _), t("./props.js")(j, k, y, o), t("./race.js")(j, _, y, o), t("./reduce.js")(j, k, o, y, _, $), t("./settle.js")(j, k, $), t("./some.js")(j, k, o), t("./filter.js")(j, _), t("./each.js")(j, _), t("./any.js")(j), c.toFastProperties(j), c.toFastProperties(j.prototype), A({a: 1}), A({b: 2}), A({c: 3}), A(1), A(function () {
            }), A(void 0), A(!1), A(new j(_)), $.setBounds(d.firstLineError, c.lastLineError), j
          }
        }, {
          "./any.js": 1,
          "./async": 2,
          "./bind": 3,
          "./call_get.js": 5,
          "./cancel": 6,
          "./catch_filter": 7,
          "./context": 8,
          "./debuggability": 9,
          "./direct_resolve": 10,
          "./each.js": 11,
          "./errors": 12,
          "./es5": 13,
          "./filter.js": 14,
          "./finally": 15,
          "./generators.js": 16,
          "./join": 17,
          "./map.js": 18,
          "./method": 19,
          "./nodeback": 20,
          "./nodeify.js": 21,
          "./promise_array": 23,
          "./promisify.js": 24,
          "./props.js": 25,
          "./race.js": 27,
          "./reduce.js": 28,
          "./settle.js": 30,
          "./some.js": 31,
          "./synchronous_inspection": 32,
          "./thenables": 33,
          "./timers.js": 34,
          "./using.js": 35,
          "./util": 36
        }], 23: [function (t, e, i) {
          "use strict";
          e.exports = function (e, i, n, r, o) {
            var a = t("./util");

            function s(t) {
              var n = this._promise = new e(i);
              t instanceof e && n._propagateFrom(t, 3), n._setOnCancel(this), this._values = t, this._length = 0, this._totalResolved = 0, this._init(void 0, -2)
            }

            return a.isArray, a.inherits(s, o), s.prototype.length = function () {
              return this._length
            }, s.prototype.promise = function () {
              return this._promise
            }, s.prototype._init = function t(i, o) {
              var s = n(this._values, this._promise);
              if (s instanceof e) {
                var l = (s = s._target())._bitField;
                if (this._values = s, 0 == (50397184 & l)) return this._promise._setAsyncGuaranteed(), s._then(t, this._reject, void 0, this, o);
                if (0 == (33554432 & l)) return 0 != (16777216 & l) ? this._reject(s._reason()) : this._cancel();
                s = s._value()
              }
              if (null !== (s = a.asArray(s))) 0 !== s.length ? this._iterate(s) : -5 === o ? this._resolveEmptyArray() : this._resolve(function (t) {
                switch (o) {
                  case-2:
                    return [];
                  case-3:
                    return {};
                  case-6:
                    return new Map
                }
              }()); else {
                var c = r("expecting an array or an iterable object but got " + a.classString(s)).reason();
                this._promise._rejectCallback(c, !1)
              }
            }, s.prototype._iterate = function (t) {
              var i = this.getActualLength(t.length);
              this._length = i, this._values = this.shouldCopyValues() ? new Array(i) : this._values;
              for (var r = this._promise, o = !1, a = null, s = 0; s < i; ++s) {
                var l = n(t[s], r);
                a = l instanceof e ? (l = l._target())._bitField : null, o ? null !== a && l.suppressUnhandledRejections() : null !== a ? 0 == (50397184 & a) ? (l._proxy(this, s), this._values[s] = l) : o = 0 != (33554432 & a) ? this._promiseFulfilled(l._value(), s) : 0 != (16777216 & a) ? this._promiseRejected(l._reason(), s) : this._promiseCancelled(s) : o = this._promiseFulfilled(l, s)
              }
              o || r._setAsyncGuaranteed()
            }, s.prototype._isResolved = function () {
              return null === this._values
            }, s.prototype._resolve = function (t) {
              this._values = null, this._promise._fulfill(t)
            }, s.prototype._cancel = function () {
              !this._isResolved() && this._promise._isCancellable() && (this._values = null, this._promise._cancel())
            }, s.prototype._reject = function (t) {
              this._values = null, this._promise._rejectCallback(t, !1)
            }, s.prototype._promiseFulfilled = function (t, e) {
              return this._values[e] = t, ++this._totalResolved >= this._length && (this._resolve(this._values), !0)
            }, s.prototype._promiseCancelled = function () {
              return this._cancel(), !0
            }, s.prototype._promiseRejected = function (t) {
              return this._totalResolved++, this._reject(t), !0
            }, s.prototype._resultCancelled = function () {
              if (!this._isResolved()) {
                var t = this._values;
                if (this._cancel(), t instanceof e) t.cancel(); else for (var i = 0; i < t.length; ++i) t[i] instanceof e && t[i].cancel()
              }
            }, s.prototype.shouldCopyValues = function () {
              return !0
            }, s.prototype.getActualLength = function (t) {
              return t
            }, s
          }
        }, {"./util": 36}], 24: [function (t, e, i) {
          "use strict";
          e.exports = function (e, i) {
            var n = {}, r = t("./util"), o = t("./nodeback"), a = r.withAppended, s = r.maybeWrapAsError,
              l = r.canEvaluate, c = t("./errors").TypeError, u = {__isPromisified__: !0},
              d = new RegExp("^(?:" + ["arity", "length", "name", "arguments", "caller", "callee", "prototype", "__isPromisified__"].join("|") + ")$"),
              h = function (t) {
                return r.isIdentifier(t) && "_" !== t.charAt(0) && "constructor" !== t
              };

            function f(t) {
              return !d.test(t)
            }

            function g(t) {
              try {
                return !0 === t.__isPromisified__
              } catch (t) {
                return !1
              }
            }

            function p(t, e, i) {
              var n = r.getDataPropertyOrDefault(t, e + i, u);
              return !!n && g(n)
            }

            function _(t, e, i, n) {
              for (var o = r.inheritedDataKeys(t), a = [], s = 0; s < o.length; ++s) {
                var l = o[s], u = t[l], d = n === h || h(l, u, t);
                "function" != typeof u || g(u) || p(t, l, e) || !n(l, u, t, d) || a.push(l, u)
              }
              return function (t, e, i) {
                for (var n = 0; n < t.length; n += 2) {
                  var r = t[n];
                  if (i.test(r)) for (var o = r.replace(i, ""), a = 0; a < t.length; a += 2) if (t[a] === o) throw new c(e)
                }
              }(a, e, i), a
            }

            var v = function (t) {
              return t.replace(/([$])/, "\\$")
            }, m = l ? void 0 : function (t, l, c, u, d, h) {
              var f = function () {
                return this
              }(), g = t;

              function p() {
                var r = l;
                l === n && (r = this);
                var c = new e(i);
                c._captureStackTrace();
                var u = "string" == typeof g && this !== f ? this[g] : t, d = o(c, h);
                try {
                  u.apply(r, a(arguments, d))
                } catch (t) {
                  c._rejectCallback(s(t), !0, !0)
                }
                return c._isFateSealed() || c._setAsyncGuaranteed(), c
              }

              return "string" == typeof g && (t = u), r.notEnumerableProp(p, "__isPromisified__", !0), p
            };

            function y(t, e, i, o, a) {
              for (var s = new RegExp(v(e) + "$"), l = _(t, e, s, i), c = 0, u = l.length; c < u; c += 2) {
                var d = l[c], h = l[c + 1], f = d + e;
                if (o === m) t[f] = m(d, n, d, h, e, a); else {
                  var g = o(h, function () {
                    return m(d, n, d, h, e, a)
                  });
                  r.notEnumerableProp(g, "__isPromisified__", !0), t[f] = g
                }
              }
              return r.toFastProperties(t), t
            }

            e.promisify = function (t, e) {
              if ("function" != typeof t) throw new c("expecting a function but got " + r.classString(t));
              if (g(t)) return t;
              var i = void 0 === (e = Object(e)).context ? n : e.context, o = !!e.multiArgs, a = function (t, e, i) {
                return m(t, e, void 0, t, null, o)
              }(t, i);
              return r.copyDescriptors(t, a, f), a
            }, e.promisifyAll = function (t, e) {
              if ("function" != typeof t && "object" != typeof t) throw new c("");
              var i = !!(e = Object(e)).multiArgs, n = e.suffix;
              "string" != typeof n && (n = "Async");
              var o = e.filter;
              "function" != typeof o && (o = h);
              var a = e.promisifier;
              if ("function" != typeof a && (a = m), !r.isIdentifier(n)) throw new RangeError("");
              for (var s = r.inheritedDataKeys(t), l = 0; l < s.length; ++l) {
                var u = t[s[l]];
                "constructor" !== s[l] && r.isClass(u) && (y(u.prototype, n, o, a, i), y(u, n, o, a, i))
              }
              return y(t, n, o, a, i)
            }
          }
        }, {"./errors": 12, "./nodeback": 20, "./util": 36}], 25: [function (t, e, i) {
          "use strict";
          e.exports = function (e, i, n, r) {
            var o, a = t("./util"), s = a.isObject, l = t("./es5");
            "function" == typeof Map && (o = Map);
            var c = function () {
              var t = 0, e = 0;

              function i(i, n) {
                this[t] = i, this[t + e] = n, t++
              }

              return function (n) {
                e = n.size, t = 0;
                var r = new Array(2 * n.size);
                return n.forEach(i, r), r
              }
            }();

            function u(t) {
              var e, i = !1;
              if (void 0 !== o && t instanceof o) e = c(t), i = !0; else {
                var n = l.keys(t), r = n.length;
                e = new Array(2 * r);
                for (var a = 0; a < r; ++a) {
                  var s = n[a];
                  e[a] = t[s], e[a + r] = s
                }
              }
              this.constructor$(e), this._isMap = i, this._init$(void 0, i ? -6 : -3)
            }

            function d(t) {
              var i, o = n(t);
              return s(o) ? (i = o instanceof e ? o._then(e.props, void 0, void 0, void 0, void 0) : new u(o).promise(), o instanceof e && i._propagateFrom(o, 2), i) : r("")
            }

            a.inherits(u, i), u.prototype._init = function () {
            }, u.prototype._promiseFulfilled = function (t, e) {
              if (this._values[e] = t, ++this._totalResolved >= this._length) {
                var i;
                if (this._isMap) i = function (t) {
                  for (var e = new o, i = t.length / 2 | 0, n = 0; n < i; ++n) {
                    var r = t[i + n], a = t[n];
                    e.set(r, a)
                  }
                  return e
                }(this._values); else {
                  i = {};
                  for (var n = this.length(), r = 0, a = this.length(); r < a; ++r) i[this._values[r + n]] = this._values[r]
                }
                return this._resolve(i), !0
              }
              return !1
            }, u.prototype.shouldCopyValues = function () {
              return !1
            }, u.prototype.getActualLength = function (t) {
              return t >> 1
            }, e.prototype.props = function () {
              return d(this)
            }, e.props = function (t) {
              return d(t)
            }
          }
        }, {"./es5": 13, "./util": 36}], 26: [function (t, e, i) {
          "use strict";

          function n(t) {
            this._capacity = t, this._length = 0, this._front = 0
          }

          n.prototype._willBeOverCapacity = function (t) {
            return this._capacity < t
          }, n.prototype._pushOne = function (t) {
            var e = this.length();
            this._checkCapacity(e + 1), this[this._front + e & this._capacity - 1] = t, this._length = e + 1
          }, n.prototype.push = function (t, e, i) {
            var n = this.length() + 3;
            if (this._willBeOverCapacity(n)) return this._pushOne(t), this._pushOne(e), void this._pushOne(i);
            var r = this._front + n - 3;
            this._checkCapacity(n);
            var o = this._capacity - 1;
            this[r + 0 & o] = t, this[r + 1 & o] = e, this[r + 2 & o] = i, this._length = n
          }, n.prototype.shift = function () {
            var t = this._front, e = this[t];
            return this[t] = void 0, this._front = t + 1 & this._capacity - 1, this._length--, e
          }, n.prototype.length = function () {
            return this._length
          }, n.prototype._checkCapacity = function (t) {
            this._capacity < t && this._resizeTo(this._capacity << 1)
          }, n.prototype._resizeTo = function (t) {
            var e = this._capacity;
            this._capacity = t, function (t, e, i, n, r) {
              for (var o = 0; o < r; ++o) i[o + n] = t[o + 0], t[o + 0] = void 0
            }(this, 0, this, e, this._front + this._length & e - 1)
          }, e.exports = n
        }, {}], 27: [function (t, e, i) {
          "use strict";
          e.exports = function (e, i, n, r) {
            var o = t("./util"), a = function (t) {
              return t.then(function (e) {
                return s(e, t)
              })
            };

            function s(t, s) {
              var l = n(t);
              if (l instanceof e) return a(l);
              if (null === (t = o.asArray(t))) return r("expecting an array or an iterable object but got " + o.classString(t));
              var c = new e(i);
              void 0 !== s && c._propagateFrom(s, 3);
              for (var u = c._fulfill, d = c._reject, h = 0, f = t.length; h < f; ++h) {
                var g = t[h];
                (void 0 !== g || h in t) && e.cast(g)._then(u, d, void 0, c, null)
              }
              return c
            }

            e.race = function (t) {
              return s(t, void 0)
            }, e.prototype.race = function () {
              return s(this, void 0)
            }
          }
        }, {"./util": 36}], 28: [function (t, e, i) {
          "use strict";
          e.exports = function (e, i, n, r, o, a) {
            var s = e._getDomain, l = t("./util"), c = l.tryCatch;

            function u(t, i, n, r) {
              this.constructor$(t);
              var a = s();
              this._fn = null === a ? i : l.domainBind(a, i), void 0 !== n && (n = e.resolve(n))._attachCancellationCallback(this), this._initialValue = n, this._currentCancellable = null, this._eachValues = r === o ? Array(this._length) : 0 === r ? null : void 0, this._promise._captureStackTrace(), this._init$(void 0, -5)
            }

            function d(t, e) {
              this.isFulfilled() ? e._resolve(t) : e._reject(t)
            }

            function h(t, e, i, r) {
              return "function" != typeof e ? n("expecting a function but got " + l.classString(e)) : new u(t, e, i, r).promise()
            }

            function f(t) {
              this.accum = t, this.array._gotAccum(t);
              var i = r(this.value, this.array._promise);
              return i instanceof e ? (this.array._currentCancellable = i, i._then(g, void 0, void 0, this, void 0)) : g.call(this, i)
            }

            function g(t) {
              var i, n = this.array, r = n._promise, o = c(n._fn);
              r._pushContext(), (i = void 0 !== n._eachValues ? o.call(r._boundValue(), t, this.index, this.length) : o.call(r._boundValue(), this.accum, t, this.index, this.length)) instanceof e && (n._currentCancellable = i);
              var s = r._popContext();
              return a.checkForgottenReturns(i, s, void 0 !== n._eachValues ? "Promise.each" : "Promise.reduce", r), i
            }

            l.inherits(u, i), u.prototype._gotAccum = function (t) {
              void 0 !== this._eachValues && null !== this._eachValues && t !== o && this._eachValues.push(t)
            }, u.prototype._eachComplete = function (t) {
              return null !== this._eachValues && this._eachValues.push(t), this._eachValues
            }, u.prototype._init = function () {
            }, u.prototype._resolveEmptyArray = function () {
              this._resolve(void 0 !== this._eachValues ? this._eachValues : this._initialValue)
            }, u.prototype.shouldCopyValues = function () {
              return !1
            }, u.prototype._resolve = function (t) {
              this._promise._resolveCallback(t), this._values = null
            }, u.prototype._resultCancelled = function (t) {
              if (t === this._initialValue) return this._cancel();
              this._isResolved() || (this._resultCancelled$(), this._currentCancellable instanceof e && this._currentCancellable.cancel(), this._initialValue instanceof e && this._initialValue.cancel())
            }, u.prototype._iterate = function (t) {
              var i, n;
              this._values = t;
              var r = t.length;
              if (void 0 !== this._initialValue ? (i = this._initialValue, n = 0) : (i = e.resolve(t[0]), n = 1), this._currentCancellable = i, !i.isRejected()) for (; n < r; ++n) {
                var o = {accum: null, value: t[n], index: n, length: r, array: this};
                i = i._then(f, void 0, void 0, o, void 0)
              }
              void 0 !== this._eachValues && (i = i._then(this._eachComplete, void 0, void 0, this, void 0)), i._then(d, d, void 0, i, this)
            }, e.prototype.reduce = function (t, e) {
              return h(this, t, e, null)
            }, e.reduce = function (t, e, i, n) {
              return h(t, e, i, n)
            }
          }
        }, {"./util": 36}], 29: [function (t, r, o) {
          "use strict";
          var a, s = t("./util"), l = s.getNativePromise();
          if (s.isNode && "undefined" == typeof MutationObserver) {
            var c = i.setImmediate, u = e.nextTick;
            a = s.isRecentNode ? function (t) {
              c.call(i, t)
            } : function (t) {
              u.call(e, t)
            }
          } else if ("function" == typeof l && "function" == typeof l.resolve) {
            var d = l.resolve();
            a = function (t) {
              d.then(t)
            }
          } else a = "undefined" == typeof MutationObserver || "undefined" != typeof window && window.navigator && (window.navigator.standalone || window.cordova) ? void 0 !== n ? function (t) {
            n(t)
          } : "undefined" != typeof setTimeout ? function (t) {
            setTimeout(t, 0)
          } : function () {
            throw new Error("")
          } : function () {
            var t = document.createElement("div"), e = {attributes: !0}, i = !1, n = document.createElement("div");
            return new MutationObserver(function () {
              t.classList.toggle("foo"), i = !1
            }).observe(n, e), function (r) {
              var o = new MutationObserver(function () {
                o.disconnect(), r()
              });
              o.observe(t, e), i || (i = !0, n.classList.toggle("foo"))
            }
          }();
          r.exports = a
        }, {"./util": 36}], 30: [function (t, e, i) {
          "use strict";
          e.exports = function (e, i, n) {
            var r = e.PromiseInspection;

            function o(t) {
              this.constructor$(t)
            }

            t("./util").inherits(o, i), o.prototype._promiseResolved = function (t, e) {
              return this._values[t] = e, ++this._totalResolved >= this._length && (this._resolve(this._values), !0)
            }, o.prototype._promiseFulfilled = function (t, e) {
              var i = new r;
              return i._bitField = 33554432, i._settledValueField = t, this._promiseResolved(e, i)
            }, o.prototype._promiseRejected = function (t, e) {
              var i = new r;
              return i._bitField = 16777216, i._settledValueField = t, this._promiseResolved(e, i)
            }, e.settle = function (t) {
              return n.deprecated(".settle()", ".reflect()"), new o(t).promise()
            }, e.prototype.settle = function () {
              return e.settle(this)
            }
          }
        }, {"./util": 36}], 31: [function (t, e, i) {
          "use strict";
          e.exports = function (e, i, n) {
            var r = t("./util"), o = t("./errors").RangeError, a = t("./errors").AggregateError, s = r.isArray, l = {};

            function c(t) {
              this.constructor$(t), this._howMany = 0, this._unwrap = !1, this._initialized = !1
            }

            function u(t, e) {
              if ((0 | e) !== e || e < 0) return n("");
              var i = new c(t), r = i.promise();
              return i.setHowMany(e), i.init(), r
            }

            r.inherits(c, i), c.prototype._init = function () {
              if (this._initialized) if (0 !== this._howMany) {
                this._init$(void 0, -5);
                var t = s(this._values);
                !this._isResolved() && t && this._howMany > this._canPossiblyFulfill() && this._reject(this._getRangeError(this.length()))
              } else this._resolve([])
            }, c.prototype.init = function () {
              this._initialized = !0, this._init()
            }, c.prototype.setUnwrap = function () {
              this._unwrap = !0
            }, c.prototype.howMany = function () {
              return this._howMany
            }, c.prototype.setHowMany = function (t) {
              this._howMany = t
            }, c.prototype._promiseFulfilled = function (t) {
              return this._addFulfilled(t), this._fulfilled() === this.howMany() && (this._values.length = this.howMany(), 1 === this.howMany() && this._unwrap ? this._resolve(this._values[0]) : this._resolve(this._values), !0)
            }, c.prototype._promiseRejected = function (t) {
              return this._addRejected(t), this._checkOutcome()
            }, c.prototype._promiseCancelled = function () {
              return this._values instanceof e || null == this._values ? this._cancel() : (this._addRejected(l), this._checkOutcome())
            }, c.prototype._checkOutcome = function () {
              if (this.howMany() > this._canPossiblyFulfill()) {
                for (var t = new a, e = this.length(); e < this._values.length; ++e) this._values[e] !== l && t.push(this._values[e]);
                return t.length > 0 ? this._reject(t) : this._cancel(), !0
              }
              return !1
            }, c.prototype._fulfilled = function () {
              return this._totalResolved
            }, c.prototype._rejected = function () {
              return this._values.length - this.length()
            }, c.prototype._addRejected = function (t) {
              this._values.push(t)
            }, c.prototype._addFulfilled = function (t) {
              this._values[this._totalResolved++] = t
            }, c.prototype._canPossiblyFulfill = function () {
              return this.length() - this._rejected()
            }, c.prototype._getRangeError = function (t) {
              var e = "Input array must contain at least " + this._howMany + " items but contains only " + t + " items";
              return new o(e)
            }, c.prototype._resolveEmptyArray = function () {
              this._reject(this._getRangeError(0))
            }, e.some = function (t, e) {
              return u(t, e)
            }, e.prototype.some = function (t) {
              return u(this, t)
            }, e._SomePromiseArray = c
          }
        }, {"./errors": 12, "./util": 36}], 32: [function (t, e, i) {
          "use strict";
          e.exports = function (t) {
            function e(t) {
              void 0 !== t ? (t = t._target(), this._bitField = t._bitField, this._settledValueField = t._isFateSealed() ? t._settledValue() : void 0) : (this._bitField = 0, this._settledValueField = void 0)
            }

            e.prototype._settledValue = function () {
              return this._settledValueField
            };
            var i = e.prototype.value = function () {
              if (!this.isFulfilled()) throw new TypeError("");
              return this._settledValue()
            }, n = e.prototype.error = e.prototype.reason = function () {
              if (!this.isRejected()) throw new TypeError("");
              return this._settledValue()
            }, r = e.prototype.isFulfilled = function () {
              return 0 != (33554432 & this._bitField)
            }, o = e.prototype.isRejected = function () {
              return 0 != (16777216 & this._bitField)
            }, a = e.prototype.isPending = function () {
              return 0 == (50397184 & this._bitField)
            }, s = e.prototype.isResolved = function () {
              return 0 != (50331648 & this._bitField)
            };
            e.prototype.isCancelled = function () {
              return 0 != (8454144 & this._bitField)
            }, t.prototype.__isCancelled = function () {
              return 65536 == (65536 & this._bitField)
            }, t.prototype._isCancelled = function () {
              return this._target().__isCancelled()
            }, t.prototype.isCancelled = function () {
              return 0 != (8454144 & this._target()._bitField)
            }, t.prototype.isPending = function () {
              return a.call(this._target())
            }, t.prototype.isRejected = function () {
              return o.call(this._target())
            }, t.prototype.isFulfilled = function () {
              return r.call(this._target())
            }, t.prototype.isResolved = function () {
              return s.call(this._target())
            }, t.prototype.value = function () {
              return i.call(this._target())
            }, t.prototype.reason = function () {
              var t = this._target();
              return t._unsetRejectionIsUnhandled(), n.call(t)
            }, t.prototype._value = function () {
              return this._settledValue()
            }, t.prototype._reason = function () {
              return this._unsetRejectionIsUnhandled(), this._settledValue()
            }, t.PromiseInspection = e
          }
        }, {}], 33: [function (t, e, i) {
          "use strict";
          e.exports = function (e, i) {
            var n = t("./util"), r = n.errorObj, o = n.isObject, a = {}.hasOwnProperty;
            return function (t, s) {
              if (o(t)) {
                if (t instanceof e) return t;
                var l = function (t) {
                  try {
                    return function (t) {
                      return t.then
                    }(t)
                  } catch (t) {
                    return r.e = t, r
                  }
                }(t);
                if (l === r) {
                  s && s._pushContext();
                  var c = e.reject(l.e);
                  return s && s._popContext(), c
                }
                if ("function" == typeof l) return function (t) {
                  try {
                    return a.call(t, "_promise0")
                  } catch (t) {
                    return !1
                  }
                }(t) ? (c = new e(i), t._then(c._fulfill, c._reject, void 0, c, null), c) : function (t, o, a) {
                  var s = new e(i), l = s;
                  a && a._pushContext(), s._captureStackTrace(), a && a._popContext();
                  var c = !0, u = n.tryCatch(o).call(t, function (t) {
                    s && (s._resolveCallback(t), s = null)
                  }, function (t) {
                    s && (s._rejectCallback(t, c, !0), s = null)
                  });
                  return c = !1, s && u === r && (s._rejectCallback(u.e, !0, !0), s = null), l
                }(t, l, s)
              }
              return t
            }
          }
        }, {"./util": 36}], 34: [function (t, e, i) {
          "use strict";
          e.exports = function (e, i, n) {
            var r = t("./util"), o = e.TimeoutError;

            function a(t) {
              this.handle = t
            }

            a.prototype._resultCancelled = function () {
              clearTimeout(this.handle)
            };
            var s = function (t) {
              return l(+this).thenReturn(t)
            }, l = e.delay = function (t, r) {
              var o, l;
              return void 0 !== r ? (o = e.resolve(r)._then(s, null, null, t, void 0), n.cancellation() && r instanceof e && o._setOnCancel(r)) : (o = new e(i), l = setTimeout(function () {
                o._fulfill()
              }, +t), n.cancellation() && o._setOnCancel(new a(l)), o._captureStackTrace()), o._setAsyncGuaranteed(), o
            };

            function c(t) {
              return clearTimeout(this.handle), t
            }

            function u(t) {
              throw clearTimeout(this.handle), t
            }

            e.prototype.delay = function (t) {
              return l(t, this)
            }, e.prototype.timeout = function (t, e) {
              var i, s;
              t = +t;
              var l = new a(setTimeout(function () {
                i.isPending() && function (t, e, i) {
                  var n;
                  n = "string" != typeof e ? e instanceof Error ? e : new o("operation timed out") : new o(e), r.markAsOriginatingFromRejection(n), t._attachExtraTrace(n), t._reject(n), null != i && i.cancel()
                }(i, e, s)
              }, t));
              return n.cancellation() ? (s = this.then(), (i = s._then(c, u, void 0, l, void 0))._setOnCancel(l)) : i = this._then(c, u, void 0, l, void 0), i
            }
          }
        }, {"./util": 36}], 35: [function (t, e, i) {
          "use strict";
          e.exports = function (e, i, n, r, o, a) {
            var s = t("./util"), l = t("./errors").TypeError, c = t("./util").inherits, u = s.errorObj, d = s.tryCatch,
              h = {};

            function f(t) {
              setTimeout(function () {
                throw t
              }, 0)
            }

            function g(t, i) {
              var r = 0, a = t.length, s = new e(o);
              return function o() {
                if (r >= a) return s._fulfill();
                var l = function (t) {
                  var e = n(t);
                  return e !== t && "function" == typeof t._isDisposable && "function" == typeof t._getDisposer && t._isDisposable() && e._setDisposable(t._getDisposer()), e
                }(t[r++]);
                if (l instanceof e && l._isDisposable()) {
                  try {
                    l = n(l._getDisposer().tryDispose(i), t.promise)
                  } catch (t) {
                    return f(t)
                  }
                  if (l instanceof e) return l._then(o, f, null, null, null)
                }
                o()
              }(), s
            }

            function p(t, e, i) {
              this._data = t, this._promise = e, this._context = i
            }

            function _(t, e, i) {
              this.constructor$(t, e, i)
            }

            function v(t) {
              return p.isDisposer(t) ? (this.resources[this.index]._setDisposable(t), t.promise()) : t
            }

            function m(t) {
              this.length = t, this.promise = null, this[t - 1] = null
            }

            p.prototype.data = function () {
              return this._data
            }, p.prototype.promise = function () {
              return this._promise
            }, p.prototype.resource = function () {
              return this.promise().isFulfilled() ? this.promise().value() : h
            }, p.prototype.tryDispose = function (t) {
              var e = this.resource(), i = this._context;
              void 0 !== i && i._pushContext();
              var n = e !== h ? this.doDispose(e, t) : null;
              return void 0 !== i && i._popContext(), this._promise._unsetDisposable(), this._data = null, n
            }, p.isDisposer = function (t) {
              return null != t && "function" == typeof t.resource && "function" == typeof t.tryDispose
            }, c(_, p), _.prototype.doDispose = function (t, e) {
              return this.data().call(t, t, e)
            }, m.prototype._resultCancelled = function () {
              for (var t = this.length, i = 0; i < t; ++i) {
                var n = this[i];
                n instanceof e && n.cancel()
              }
            }, e.using = function () {
              var t = arguments.length;
              if (t < 2) return i("you must pass at least 2 arguments to Promise.using");
              var r, o = arguments[t - 1];
              if ("function" != typeof o) return i("expecting a function but got " + s.classString(o));
              var l = !0;
              2 === t && Array.isArray(arguments[0]) ? (t = (r = arguments[0]).length, l = !1) : (r = arguments, t--);
              for (var c = new m(t), h = 0; h < t; ++h) {
                var f = r[h];
                if (p.isDisposer(f)) {
                  var _ = f;
                  (f = f.promise())._setDisposable(_)
                } else {
                  var y = n(f);
                  y instanceof e && (f = y._then(v, null, null, {resources: c, index: h}, void 0))
                }
                c[h] = f
              }
              var k = new Array(c.length);
              for (h = 0; h < k.length; ++h) k[h] = e.resolve(c[h]).reflect();
              var b = e.all(k).then(function (t) {
                for (var e = 0; e < t.length; ++e) {
                  var i = t[e];
                  if (i.isRejected()) return u.e = i.error(), u;
                  if (!i.isFulfilled()) return void b.cancel();
                  t[e] = i.value()
                }
                w._pushContext(), o = d(o);
                var n = l ? o.apply(void 0, t) : o(t), r = w._popContext();
                return a.checkForgottenReturns(n, r, "Promise.using", w), n
              }), w = b.lastly(function () {
                var t = new e.PromiseInspection(b);
                return g(c, t)
              });
              return c.promise = w, w._setOnCancel(c), w
            }, e.prototype._setDisposable = function (t) {
              this._bitField = 131072 | this._bitField, this._disposer = t
            }, e.prototype._isDisposable = function () {
              return (131072 & this._bitField) > 0
            }, e.prototype._getDisposer = function () {
              return this._disposer
            }, e.prototype._unsetDisposable = function () {
              this._bitField = -131073 & this._bitField, this._disposer = void 0
            }, e.prototype.disposer = function (t) {
              if ("function" == typeof t) return new _(t, this, r());
              throw new l
            }
          }
        }, {"./errors": 12, "./util": 36}], 36: [function (t, n, r) {
          "use strict";
          var o, a = t("./es5"), s = "undefined" == typeof navigator, l = {e: {}},
            c = "undefined" != typeof self ? self : "undefined" != typeof window ? window : void 0 !== i ? i : void 0 !== this ? this : null;

          function u() {
            try {
              var t = o;
              return o = null, t.apply(this, arguments)
            } catch (t) {
              return l.e = t, l
            }
          }

          function d(t) {
            return null == t || !0 === t || !1 === t || "string" == typeof t || "number" == typeof t
          }

          function h(t, e, i) {
            if (d(t)) return t;
            var n = {value: i, configurable: !0, enumerable: !1, writable: !0};
            return a.defineProperty(t, e, n), t
          }

          var f = function () {
            var t = [Array.prototype, Object.prototype, Function.prototype], e = function (e) {
              for (var i = 0; i < t.length; ++i) if (t[i] === e) return !0;
              return !1
            };
            if (a.isES5) {
              var i = Object.getOwnPropertyNames;
              return function (t) {
                for (var n = [], r = Object.create(null); null != t && !e(t);) {
                  var o;
                  try {
                    o = i(t)
                  } catch (t) {
                    return n
                  }
                  for (var s = 0; s < o.length; ++s) {
                    var l = o[s];
                    if (!r[l]) {
                      r[l] = !0;
                      var c = Object.getOwnPropertyDescriptor(t, l);
                      null != c && null == c.get && null == c.set && n.push(l)
                    }
                  }
                  t = a.getPrototypeOf(t)
                }
                return n
              }
            }
            var n = {}.hasOwnProperty;
            return function (i) {
              if (e(i)) return [];
              var r = [];
              t:for (var o in i) if (n.call(i, o)) r.push(o); else {
                for (var a = 0; a < t.length; ++a) if (n.call(t[a], o)) continue t;
                r.push(o)
              }
              return r
            }
          }(), g = /this\s*\.\s*\S+\s*=/, p = /^[a-z$_][a-z$_0-9]*$/i;

          function _(t) {
            try {
              return t + ""
            } catch (t) {
              return "[no string representation]"
            }
          }

          function v(t) {
            return t instanceof Error || null !== t && "object" == typeof t && "string" == typeof t.message && "string" == typeof t.name
          }

          function m(t) {
            return v(t) && a.propertyIsWritable(t, "stack")
          }

          var y = "stack" in new Error ? function (t) {
            return m(t) ? t : new Error(_(t))
          } : function (t) {
            if (m(t)) return t;
            try {
              throw new Error(_(t))
            } catch (t) {
              return t
            }
          };

          function k(t) {
            return {}.toString.call(t)
          }

          var b = function (t) {
            return a.isArray(t) ? t : null
          };
          if ("undefined" != typeof Symbol && Symbol.iterator) {
            var w = "function" == typeof Array.from ? function (t) {
              return Array.from(t)
            } : function (t) {
              for (var e, i = [], n = t[Symbol.iterator](); !(e = n.next()).done;) i.push(e.value);
              return i
            };
            b = function (t) {
              return a.isArray(t) ? t : null != t && "function" == typeof t[Symbol.iterator] ? w(t) : null
            }
          }
          var $ = void 0 !== e && "[object process]" === k(e).toLowerCase(), x = void 0 !== e && void 0 !== e.env, S = {
            isClass: function (t) {
              try {
                if ("function" == typeof t) {
                  var e = a.names(t.prototype), i = a.isES5 && e.length > 1,
                    n = e.length > 0 && !(1 === e.length && "constructor" === e[0]),
                    r = g.test(t + "") && a.names(t).length > 0;
                  if (i || n || r) return !0
                }
                return !1
              } catch (t) {
                return !1
              }
            },
            isIdentifier: function (t) {
              return p.test(t)
            },
            inheritedDataKeys: f,
            getDataPropertyOrDefault: function (t, e, i) {
              if (!a.isES5) return {}.hasOwnProperty.call(t, e) ? t[e] : void 0;
              var n = Object.getOwnPropertyDescriptor(t, e);
              return null != n ? null == n.get && null == n.set ? n.value : i : void 0
            },
            thrower: function (t) {
              throw t
            },
            isArray: a.isArray,
            asArray: b,
            notEnumerableProp: h,
            isPrimitive: d,
            isObject: function (t) {
              return "function" == typeof t || "object" == typeof t && null !== t
            },
            isError: v,
            canEvaluate: s,
            errorObj: l,
            tryCatch: function (t) {
              return o = t, u
            },
            inherits: function (t, e) {
              var i = {}.hasOwnProperty;

              function n() {
                for (var n in this.constructor = t, this.constructor$ = e, e.prototype) i.call(e.prototype, n) && "$" !== n.charAt(n.length - 1) && (this[n + "$"] = e.prototype[n])
              }

              return n.prototype = e.prototype, t.prototype = new n, t.prototype
            },
            withAppended: function (t, e) {
              var i, n = t.length, r = new Array(n + 1);
              for (i = 0; i < n; ++i) r[i] = t[i];
              return r[i] = e, r
            },
            maybeWrapAsError: function (t) {
              return d(t) ? new Error(_(t)) : t
            },
            toFastProperties: function (t) {
              function e() {
              }

              e.prototype = t;
              var i = new e;

              function n() {
                return typeof i.foo
              }

              return n(), n(), t
            },
            filledRange: function (t, e, i) {
              for (var n = new Array(t), r = 0; r < t; ++r) n[r] = e + r + i;
              return n
            },
            toString: _,
            canAttachTrace: m,
            ensureErrorObject: y,
            originatesFromRejection: function (t) {
              return null != t && (t instanceof Error.__BluebirdErrorTypes__.OperationalError || !0 === t.isOperational)
            },
            markAsOriginatingFromRejection: function (t) {
              try {
                h(t, "isOperational", !0)
              } catch (t) {
              }
            },
            classString: k,
            copyDescriptors: function (t, e, i) {
              for (var n = a.names(t), r = 0; r < n.length; ++r) {
                var o = n[r];
                if (i(o)) try {
                  a.defineProperty(e, o, a.getDescriptor(t, o))
                } catch (t) {
                }
              }
            },
            hasDevTools: "undefined" != typeof chrome && chrome && "function" == typeof chrome.loadTimes,
            isNode: $,
            hasEnvVariables: x,
            env: function (t) {
              return x ? e.env[t] : void 0
            },
            global: c,
            getNativePromise: function () {
              if ("function" == typeof Promise) try {
                var t = new Promise(function () {
                });
                if ("[object Promise]" === {}.toString.call(t)) return Promise
              } catch (t) {
              }
            },
            domainBind: function (t, e) {
              return t.bind(e)
            }
          };
          S.isRecentNode = S.isNode && function () {
            var t;
            return e.versions && e.versions.node ? t = e.versions.node.split(".").map(Number) : e.version && (t = e.version.split(".").map(Number)), 0 === t[0] && t[1] > 10 || t[0] > 0
          }(), S.isNode && S.toFastProperties(e);
          try {
            throw new Error
          } catch (t) {
            S.lastLineError = t
          }
          n.exports = S
        }, {"./es5": 13}]
      }, {}, [4])(4), "undefined" != typeof window && null !== window ? window.P = window.Promise : "undefined" != typeof self && null !== self && (self.P = self.Promise)
    }).call(this, i(36), i(17), i(144).setImmediate)
  }, function (t, e, i) {
    t.exports = i(145)
  }, function (t, e, i) {
    var n = i(0);
    t.exports = function () {
      var t = {};
      return {
        getState: function (e) {
          if (e) return t[e].method();
          var i = {};
          for (var r in t) t[r].internal || n.mixin(i, t[r].method(), !0);
          return i
        }, registerProvider: function (e, i, n) {
          t[e] = {method: i, internal: n}
        }, unregisterProvider: function (e) {
          delete t[e]
        }
      }
    }
  }, function (t, e) {
    t.exports = function (t) {
      var e = {};

      function i(i, n, r) {
        r = r || i;
        var o = t.config, a = t.templates;
        t.config[i] && e[r] != o[i] && (n && a[r] || (a[r] = t.date.date_to_str(o[i]), e[r] = o[i]))
      }

      return {
        initTemplates: function () {
          var e = t.locale.labels;
          e.jsgantt_save_btn = e.icon_save, e.jsgantt_cancel_btn = e.icon_cancel, e.jsgantt_delete_btn = e.icon_delete;
          var n = t.date, r = n.date_to_str, o = t.config;
          i("dateScale", !0, void 0, t.config, t.templates), i("date_grid", !0, "grid_date_format", t.config, t.templates), i("task_date", !0, void 0, t.config, t.templates), t.mixin(t.templates, {
            dateFormat: n.str_to_date(o.dateFormat, o.utcFormat),
            xml_format: r(o.dateFormat, o.utcFormat),
            progress_text: function (t, e, i) {
              return ""
            },
            grid_header_class: function (t, e) {
              return ""
            },
            task_text: function (t, e, i) {
              return i.orderId
            },
            task_class: function (t, e, i) {
              return ""
            },
            grid_row_class: function (t, e, i) {
              return ""
            },
            task_row_class: function (t, e, i) {
              return ""
            },
            task_cell_class: function (t, e) {
              return ""
            },
            scale_cell_class: function (t) {
              return ""
            },
            scale_row_class: function (t) {
              return ""
            },
            grid_indent: function (t) {
              return "<div class='jsgantt-tree-indent'></div>"
            },
            grid_folder: function (t) {
              return "<div class='jsgantt-tree-icon jsgantt-folder-" + (t.$open ? "open" : "closed") + "'></div>"
            },
            grid_file: function (t) {
              return "<div class='jsgantt-tree-icon jsgantt-file'></div>"
            },
            grid_open: function (t) {
              return "<div class='jsgantt-tree-icon jsgantt-" + (t.$open ? "close" : "open") + "'></div>"
            },
            grid_blank: function (t) {
              return "<div class='jsgantt-tree-icon jsgantt-blank'></div>"
            },
            date_grid: function (e, i) {
              return i && t.isUnscheduledTask(i) && t.config.show_unscheduled ? t.templates.task_unscheduled_time(i) : t.templates.grid_date_format(e)
            },
            task_time: function (e, i, n) {
              return t.isUnscheduledTask(n) && t.config.show_unscheduled ? t.templates.task_unscheduled_time(n) : t.templates.task_date(e) + " - " + t.templates.task_date(i)
            },
            task_unscheduled_time: function (t) {
              return ""
            },
            time_picker: r(o.time_picker),
            link_class: function (t) {
              return ""
            },
            link_description: function (e) {
              var i = t.getTask(e.source), n = t.getTask(e.target);
              return "<b>" + i.orderId + "</b> &ndash;  <b>" + n.orderId + "</b>"
            },
            drag_link: function (e, i, n, r) {
              e = t.getTask(e);
              var o = t.locale.labels, a = "<b>" + e.orderId + "</b> " + (i ? o.link_start : o.link_end) + "<br/>";
              return n && (a += "<b> " + (n = t.getTask(n)).orderId + "</b> " + (r ? o.link_start : o.link_end) + "<br/>"), a
            },
            drag_link_class: function (e, i, n, r) {
              var o = "";
              return e && n && (o = " " + (t.isLinkAllowed(e, n, i, r) ? "jsgantt-link-allow" : "jsgantt-link-deny")), "jsgantt-link-tooltip" + o
            },
            tooltip_date_format: n.date_to_str("%Y-%m-%d"),
            tooltip_text: function (e, i, n) {
              return "<b>Task:</b> " + n.orderId + "<br/><b>Start date:</b> " + t.templates.tooltip_date_format(e) + "<br/><b>End date:</b> " + t.templates.tooltip_date_format(i)
            }
          })
        }, initTemplate: i
      }
    }
  }, function (t, e, i) {
    var n = i(4), r = i(0), o = i(37);
    t.exports = function (t) {
      function e(t) {
        return {
          target: t.target,
          pageX: t.pageX,
          pageY: t.pageY,
          clientX: t.clientX,
          clientY: t.clientY,
          metaKey: t.metaKey,
          shiftKey: t.shiftKey,
          ctrlKey: t.ctrlKey,
          altKey: t.altKey
        }
      }

      function i(i, o) {
        this._obj = i, this._settings = o || {}, n(this);
        var a = this.getInputMethods();
        this._drag_start_timer = null, t.attachEvent("onGanttScroll", r.bind(function (t, e) {
          this.clearDragTimer()
        }, this));
        for (var s = 0; s < a.length; s++) r.bind(function (n) {
          t.event(i, n.down, r.bind(function (o) {
            n.accessor(o) && (this._settings.original_target = e(o), t.config.touch ? (this.clearDragTimer(), this._drag_start_timer = setTimeout(r.bind(function () {
              this.dragStart(i, o, n)
            }, this), t.config.touch_drag)) : this.dragStart(i, o, n))
          }, this)), t.event(document.body, n.up, r.bind(function (t) {
            n.accessor(t) && this.clearDragTimer()
          }, this))
        }, this)(a[s])
      }

      return i.prototype = {
        traceDragEvents: function (e, i) {
          var n = r.bind(function (t) {
            return this.dragMove(e, t, i.accessor)
          }, this);
          r.bind(function (t) {
            return this.dragScroll(e, t)
          }, this);
          var a = r.bind(function (t) {
            if (!this.config.started || !r.defined(this.config.updates_per_second) || o(this, this.config.updates_per_second)) {
              var e = n(t);
              return e && (t && t.preventDefault && t.preventDefault(), t.cancelBubble = !0), e
            }
          }, this), s = r.bind(function (n) {
            return t.eventRemove(document.body, i.move, a), t.eventRemove(document.body, i.up, s), this.dragEnd(e)
          }, this);
          t.event(document.body, i.move, a), t.event(document.body, i.up, s)
        }, checkPositionChange: function (t) {
          var e = t.x - this.config.pos.x, i = t.y - this.config.pos.y;
          return Math.sqrt(Math.pow(Math.abs(e), 2) + Math.pow(Math.abs(i), 2)) > this.config.sensitivity
        }, initDnDMarker: function () {
          var t = this.config.marker = document.createElement("div");
          t.className = "jsgantt-drag-marker", t.innerHTML = "Dragging object", document.body.appendChild(t)
        }, backupEventTarget: function (i, n) {
          if (t.config.touch) {
            var r = n(i), o = r.target, a = o.cloneNode(!0);
            this.config.original_target = e(r), this.config.original_target.target = a, this.config.backup_element = o, o.parentNode.appendChild(a), o.style.display = "none", document.body.appendChild(o)
          }
        }, getInputMethods: function () {
          var e = [];
          if (e.push({
            move: "mousemove", down: "mousedown", up: "mouseup", accessor: function (t) {
              return t
            }
          }), t.config.touch) {
            var i = !0;
            try {
              document.createEvent("TouchEvent")
            } catch (t) {
              i = !1
            }
            i ? e.push({
              move: "touchmove", down: "touchstart", up: "touchend", accessor: function (t) {
                return t.touches && t.touches.length > 1 ? null : t.touches[0] ? {
                  target: document.elementFromPoint(t.touches[0].clientX, t.touches[0].clientY),
                  pageX: t.touches[0].pageX,
                  pageY: t.touches[0].pageY,
                  clientX: t.touches[0].clientX,
                  clientY: t.touches[0].clientY
                } : t
              }
            }) : window.navigator.pointerEnabled ? e.push({
              move: "pointermove",
              down: "pointerdown",
              up: "pointerup",
              accessor: function (t) {
                return "mouse" == t.pointerType ? null : t
              }
            }) : window.navigator.msPointerEnabled && e.push({
              move: "MSPointerMove",
              down: "MSPointerDown",
              up: "MSPointerUp",
              accessor: function (t) {
                return t.pointerType == t.MSPOINTER_TYPE_MOUSE ? null : t
              }
            })
          }
          return e
        }, clearDragTimer: function () {
          this._drag_start_timer && (clearTimeout(this._drag_start_timer), this._drag_start_timer = null)
        }, dragStart: function (e, i, n) {
          this.config && this.config.started || (this.config = {
            obj: e,
            marker: null,
            started: !1,
            pos: this.getPosition(i),
            sensitivity: 4
          }, this._settings && r.mixin(this.config, this._settings, !0), this.traceDragEvents(e, n), t._prevent_touch_scroll = !0, document.body.className += " jsgantt-noselect", t.config.touch && this.dragMove(e, i, n.accessor))
        }, dragMove: function (e, i, n) {
          var r = n(i);
          if (!r) return !1;
          if (!this.config.marker && !this.config.started) {
            var o = this.getPosition(r);
            if (t.config.touch || this.checkPositionChange(o)) {
              if (this.config.started = !0, this.config.ignore = !1, !1 === this.callEvent("onBeforeDragStart", [e, this.config.original_target])) return this.config.ignore = !0, !1;
              this.backupEventTarget(i, n), this.initDnDMarker(), t._touch_feedback(), this.callEvent("onAfterDragStart", [e, this.config.original_target])
            } else this.config.ignore = !0
          }
          return !this.config.ignore && (r.pos = this.getPosition(r), this.config.marker.style.left = r.pos.x + "px", this.config.marker.style.top = r.pos.y + "px", this.callEvent("onDragMove", [e, r]), !0)
        }, dragEnd: function (e) {
          var i = this.config.backup_element;
          i && i.parentNode && i.parentNode.removeChild(i), t._prevent_touch_scroll = !1, this.config.marker && (this.config.marker.parentNode.removeChild(this.config.marker), this.config.marker = null, this.callEvent("onDragEnd", [])), this.config.started = !1, document.body.className = document.body.className.replace(" jsgantt-noselect", "")
        }, getPosition: function (t) {
          var e = 0, i = 0;
          return (t = t || window.event).pageX || t.pageY ? (e = t.pageX, i = t.pageY) : (t.clientX || t.clientY) && (e = t.clientX + document.body.scrollLeft + document.documentElement.scrollLeft, i = t.clientY + document.body.scrollTop + document.documentElement.scrollTop), {
            x: e,
            y: i
          }
        }
      }, i
    }
  }, function (t, e) {
    t.exports = function (t) {
      var e = {
        init: function () {
          for (var e = t.locale, i = e.date.month_short, n = e.date.month_short_hash = {}, r = 0; r < i.length; r++) n[i[r]] = r;
          for (i = e.date.month_full, n = e.date.month_full_hash = {}, r = 0; r < i.length; r++) n[i[r]] = r
        }, date_part: function (t) {
          var e = new Date(t);
          return t.setHours(0), this.hour_start(t), t.getHours() && (t.getDate() < e.getDate() || t.getMonth() < e.getMonth() || t.getFullYear() < e.getFullYear()) && t.setTime(t.getTime() + 36e5 * (24 - t.getHours())), t
        }, time_part: function (t) {
          return (t.valueOf() / 1e3 - 60 * t.getTimezoneOffset()) % 86400
        }, week_start: function (e) {
          var i = e.getDay();
          return t.config.startFromMonday && (0 === i ? i = 6 : i--), this.date_part(this.add(e, -1 * i, "day"))
        }, month_start: function (t) {
          return t.setDate(1), this.date_part(t)
        }, quarter_start: function (t) {
          this.month_start(t);
          var e, i = t.getMonth();
          return e = i >= 9 ? 9 : i >= 6 ? 6 : i >= 3 ? 3 : 0, t.setMonth(e), t
        }, year_start: function (t) {
          return t.setMonth(0), this.month_start(t)
        }, day_start: function (t) {
          return this.date_part(t)
        }, hour_start: function (t) {
          return t.getMinutes() && t.setMinutes(0), this.minute_start(t), t
        }, minute_start: function (t) {
          return t.getSeconds() && t.setSeconds(0), t.getMilliseconds() && t.setMilliseconds(0), t
        }, _add_days: function (t, e) {
          var i = new Date(t.valueOf());
          return i.setDate(i.getDate() + e), e >= 0 && !t.getHours() && i.getHours() && (i.getDate() <= t.getDate() || i.getMonth() < t.getMonth() || i.getFullYear() < t.getFullYear()) && i.setTime(i.getTime() + 36e5 * (24 - i.getHours())), i
        }, add: function (t, e, i) {
          var n = new Date(t.valueOf());
          switch (i) {
            case"day":
              n = this._add_days(n, e);
              break;
            case"week":
              n = this._add_days(n, 7 * e);
              break;
            case"month":
              n.setMonth(n.getMonth() + e);
              break;
            case"year":
              n.setYear(n.getFullYear() + e);
              break;
            case"hour":
              n.setTime(n.getTime() + 60 * e * 60 * 1e3);
              break;
            case"minute":
              n.setTime(n.getTime() + 60 * e * 1e3);
              break;
            default:
              return this["add_" + i](t, e, i)
          }
          return n
        }, add_quarter: function (t, e) {
          return this.add(t, 3 * e, "month")
        }, to_fixed: function (t) {
          return t < 10 ? "0" + t : t
        }, copy: function (t) {
          return new Date(t.valueOf())
        }, date_to_str: function (i, n) {
          i = i.replace(/%[a-zA-Z]/g, function (t) {
            switch (t) {
              case"%d":
                return '"+to_fixed(date.getDate())+"';
              case"%m":
                return '"+to_fixed((date.getMonth()+1))+"';
              case"%j":
                return '"+date.getDate()+"';
              case"%n":
                return '"+(date.getMonth()+1)+"';
              case"%y":
                return '"+to_fixed(date.getFullYear()%100)+"';
              case"%Y":
                return '"+date.getFullYear()+"';
              case"%D":
                return '"+locale.date.day_short[date.getDay()]+"';
              case"%l":
                return '"+locale.date.day_full[date.getDay()]+"';
              case"%M":
                return '"+locale.date.month_short[date.getMonth()]+"';
              case"%F":
                return '"+locale.date.month_full[date.getMonth()]+"';
              case"%h":
                return '"+to_fixed((date.getHours()+11)%12+1)+"';
              case"%g":
                return '"+((date.getHours()+11)%12+1)+"';
              case"%G":
                return '"+date.getHours()+"';
              case"%H":
                return '"+to_fixed(date.getHours())+"';
              case"%i":
                return '"+to_fixed(date.getMinutes())+"';
              case"%a":
                return '"+(date.getHours()>11?"pm":"am")+"';
              case"%A":
                return '"+(date.getHours()>11?"PM":"AM")+"';
              case"%s":
                return '"+to_fixed(date.getSeconds())+"';
              case"%W":
                return '"+to_fixed(getISOWeek(date))+"';
              case"%w":
                return '"+to_fixed(getWeek(date))+"';
              default:
                return t
            }
          }), n && (i = i.replace(/date\.get/g, "date.getUTC"));
          var r = new Function("date", "to_fixed", "locale", "getISOWeek", "getWeek", 'return "' + i + '";');
          return function (i) {
            return r(i, e.to_fixed, t.locale, e.getISOWeek, e.getWeek)
          }
        }, str_to_date: function (e, i) {
          for (var n = "var temp=date.match(/[a-zA-Z]+|[0-9]+/g);", r = e.match(/%[a-zA-Z]/g), o = 0; o < r.length; o++) switch (r[o]) {
            case"%j":
            case"%d":
              n += "set[2]=temp[" + o + "]||1;";
              break;
            case"%n":
            case"%m":
              n += "set[1]=(temp[" + o + "]||1)-1;";
              break;
            case"%y":
              n += "set[0]=temp[" + o + "]*1+(temp[" + o + "]>50?1900:2000);";
              break;
            case"%g":
            case"%G":
            case"%h":
            case"%H":
              n += "set[3]=temp[" + o + "]||0;";
              break;
            case"%i":
              n += "set[4]=temp[" + o + "]||0;";
              break;
            case"%Y":
              n += "set[0]=temp[" + o + "]||0;";
              break;
            case"%a":
            case"%A":
              n += "set[3]=set[3]%12+((temp[" + o + "]||'').toLowerCase()=='am'?0:12);";
              break;
            case"%s":
              n += "set[5]=temp[" + o + "]||0;";
              break;
            case"%M":
              n += "set[1]=locale.date.month_short_hash[temp[" + o + "]]||0;";
              break;
            case"%F":
              n += "set[1]=locale.date.month_full_hash[temp[" + o + "]]||0;"
          }
          var a = "set[0],set[1],set[2],set[3],set[4],set[5]";
          i && (a = " Date.UTC(" + a + ")");
          var s = new Function("date", "locale", "var set=[0,0,1,0,0,0]; " + n + " return new Date(" + a + ");");
          return function (e) {
            return s(e, t.locale)
          }
        }, getISOWeek: function (e) {
          return t.date._getWeekNumber(e, !0)
        }, _getWeekNumber: function (t, e) {
          if (!t) return !1;
          var i = t.getDay();
          e && 0 === i && (i = 7);
          var n = new Date(t.valueOf());
          n.setDate(t.getDate() + (4 - i));
          var r = n.getFullYear(), o = Math.round((n.getTime() - new Date(r, 0, 1).getTime()) / 864e5);
          return 1 + Math.floor(o / 7)
        }, getWeek: function (e) {
          return t.date._getWeekNumber(e, t.config.startFromMonday)
        }, getUTCISOWeek: function (e) {
          return t.date.getISOWeek(e)
        }, convert_to_utc: function (t) {
          return new Date(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate(), t.getUTCHours(), t.getUTCMinutes(), t.getUTCSeconds())
        }, parseDate: function (e, i) {
          return e && !e.getFullYear && ("function" != typeof i && (i = "string" == typeof i ? t.defined(t.templates[i]) ? t.templates[i] : t.date.str_to_date(i) : t.templates.dateFormat), e = e ? i(e) : null), e
        }
      };
      return e
    }
  }, function (t, e, i) {
    "use strict";
    Object.defineProperty(e, "__esModule", {value: !0}), e.default = function (t) {
      if ("string" == typeof t || "number" == typeof t) return t;
      var e = "";
      for (var i in t) {
        var n = "";
        t.hasOwnProperty(i) && (n = i + "=" + (n = "string" == typeof t[i] ? encodeURIComponent(t[i]) : "number" == typeof t[i] ? t[i] : encodeURIComponent(JSON.stringify(t[i]))), e.length && (n = "&" + n), e += n)
      }
      return e
    }
  }, function (t, e, i) {
    i(8), i(151).default;
    t.exports = function (t) {
      return {}
    }
  }, function (t, e) {
    t.exports = function () {
      return {
        layout: {
          css: "jsgantt-container",
          rows: [{
            cols: [{view: "grid", scrollX: "scrollHor", scrollY: "scrollVer"}, {
              resizer: !0,
              width: 1
            }, {view: "timeline", scrollX: "scrollHor", scrollY: "scrollVer"}, {view: "scrollbar", id: "scrollVer"}]
          }, {view: "scrollbar", id: "scrollHor", height: 20}]
        },
        links: {finish_to_start: "0", start_to_start: "1", finish_to_finish: "2", start_to_finish: "3"},
        types: {task: "task"},
        auto_types: !1,
        durationUnit: "hour",
        work_time: !1,
        correct_work_time: !1,
        skip_off_time: !1,
        cascade_delete: !0,
        autosize: !1,
        autosize_min_width: 0,
        autoscroll: !0,
        autoscroll_speed: 30,
        show_links: !0,
        show_task_cells: !0,
        static_background: !1,
        branch_loading: !1,
        branch_loading_property: "$has_child",
        show_loading: !1,
        show_chart: !0,
        show_grid: !0,
        minDuration: 36e5,
        dateFormat: "%Y-%m-%d %H:%i",
        startFromMonday: !0,
        utcFormat: !1,
        show_progress: !0,
        fit_tasks: !0,
        select_task: !0,
        scroll_on_click: !0,
        preserve_scroll: !0,
        readonly: !1,
        date_grid: "%Y-%m-%d",
        drag_links: !0,
        drag_progress: !1,
        drag_resize: !1,
        drag_project: !1,
        drag_move: !1,
        drag_mode: {resize: "resize", progress: "progress", move: "move", ignore: "ignore"},
        round_dnd_dates: !0,
        link_wrapper_width: 20,
        root_id: 0,
        autofit: !1,
        columns: [{name: "jobChain", tree: !0, label: "Workflow", align: "left"}, {
          name: "orderId",
          label: "Order Id",
          width: "*",
          align: "left"
        }],
        step: 1,
        scale_unit: "day",
        scale_offset_minimal: !0,
        subscales: [{unit: "hour", step: 1, date: "%H"}],
        inherit_scale_class: !1,
        time_step: 60,
        durationStep: 1,
        dateScale: "%M %d, %Y",
        task_date: "%d %F %Y",
        time_picker: "%H:%i",
        task_attribute: "task_id",
        link_attribute: "link_id",
        layer_attribute: "data-layer",
        buttons_left: ["jsgantt-save-btn", "jsgantt-cancel-btn"],
        _migrate_buttons: {},
        buttons_right: ["jsgantt-delete-btn"],
        lightbox: {sections: [], project_sections: [], milestone_sections: []},
        drag_lightbox: !0,
        sort: !0,
        details_on_create: !0,
        details_on_dblclick: !0,
        initial_scroll: !0,
        task_scroll_offset: 100,
        order_branch: !1,
        order_branch_free: !1,
        task_height: "full",
        min_column_width: 44,
        min_grid_column_width: 44,
        grid_resizer_column_attribute: "column_index",
        grid_resizer_attribute: "grid-resizer",
        keep_grid_width: !1,
        grid_resize: !0,
        show_unscheduled: !0,
        readonly_property: "readonly",
        editable_property: "editable",
        calendar_property: "calendar_id",
        resource_calendars: {},
        inherit_calendar: !1,
        type_renderers: {},
        open_tree_initially: !1,
        optimize_render: !0,
        prevent_default_scroll: !1,
        show_errors: !0,
        wai_aria_attributes: !0,
        smart_scales: !0,
        rtl: !1,
        placeholder_task: !1
      }
    }
  }, function (t, e) {
    t.exports = function () {
      var t = {};
      return {
        services: {config: "config", templates: "templates", locale: "locale"}, setService: function (e, i) {
          t[e] = i
        }, getService: function (e) {
          return t[e] ? t[e]() : null
        }, dropService: function (e) {
          t[e] && delete t[e]
        }, config: function () {
          return this.getService("config")
        }, templates: function () {
          return this.getService("templates")
        }, locale: function () {
          return this.getService("locale")
        }, destructor: function () {
          for (var e in t) if (t[e]) {
            var i = t[e];
            i && i.destructor && i.destructor()
          }
          t = null
        }
      }
    }
  }, function (t, e) {
    t.exports = function (t) {
      t.$inject = function (t) {
        return t(this.$services)
      }
    }
  }, function (t, e) {
    t.exports = {KEY_CODES: {}}
  }, function (t, e, i) {
    i(19), t.exports = function () {
      var t = new function () {
        this.constants = i(156), this.templates = {}, this.ext = {}, this.keys = {}
      };
      i(155)(t), t.$services = t.$inject(i(154)), t.config = t.$inject(i(153)), t.ajax = i(152)(t), t.date = i(150)(t);
      var e = i(149)(t);
      t.$services.setService("dnd", function () {
        return e
      }), t.$services.setService("config", function () {
        return t.config
      }), t.$services.setService("date", function () {
        return t.date
      }), t.$services.setService("locale", function () {
        return t.locale
      }), t.$services.setService("templates", function () {
        return t.templates
      });
      var n = i(148)(t);
      t.$services.setService("templateLoader", function () {
        return n
      }), i(4)(t);
      var r = new (i(147));
      r.registerProvider("global", function () {
        return {min_date: t._min_date, max_date: t._max_date, selected_task: t.$data.tasksStore.getSelectedId()}
      }), t.getState = r.getState, t.$services.setService("state", function () {
        return r
      });
      var o = i(0);
      o.mixin(t, o), t.Promise = i(146), t.env = i(8);
      var a = i(1);
      t.utils = {
        dom: {
          getNodePosition: a.getNodePosition,
          getRelativeEventPosition: a.getRelativeEventPosition,
          isChildOf: a.isChildOf,
          hasClass: a.hasClass,
          closest: a.closest
        }
      };
      var s = i(20)();
      t.event = s.attach, t.eventRemove = s.detach, t._eventRemoveAll = s.detachAll, t._createDomEventScope = s.extend, o.mixin(t, i(142)(t));
      var l = i(141).init(t);
      t.$ui = l.factory, t.$ui.layers = l.render, t.$mouseEvents = l.mouseEvents, t.$services.setService("mouseEvents", function () {
        return t.$mouseEvents
      }), t.mixin(t, l.layersApi), i(102)(t), t.$services.setService("layers", function () {
        return l.layersService
      });
      var c = i(101);
      t.mixin(t, c()), i(100)(t);
      var u = i(94);
      return t.dataProcessor = u.DEPRECATED_api, t.createDataProcessor = u.createDataProcessor, i(90)(t), i(81)(t), i(80)(t), i(78)(t), i(77)(t), i(76)(t), i(75)(t), i(66)(t), i(65)(t), i(55)(t), i(54)(t), i(52)(t), i(51)(t), i(50)(t), i(49)(t), i(48)(t), i(47)(t), i(46)(t), i(45)(t), i(44)(t), i(43)(t), i(42)(t), i(41)(t), i(39)(t), t
    }
  }, function (t, e, i) {
    var n = {
      _seed: 0, plugin: function (t) {
        this._jsganttPlugin.push(t), t(window.jsgantt)
      }, _jsganttPlugin: [], getGanttInstance: function () {
        for (var t = i(157)(), e = 0; e < n._jsganttPlugin.length; e++) n._jsganttPlugin[e](t);
        return t._internal_id = n._seed++, n.$syncFactory && n.$syncFactory(t), i(38)(t), t
      }
    };
    t.exports = n
  }, function (t, e, i) {
    "use strict";
    Object.defineProperty(e, "__esModule", {value: !0});
    var n = i(158);
    e.JSGantt = n;
    var r = window;
    r.JSGantt = n;
    var o = r.jsgantt = n.getGanttInstance();
    e.default = o
  }])
});
